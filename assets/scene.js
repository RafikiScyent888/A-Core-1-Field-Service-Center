/* =====================================================================
   Field Service Center — the scene engine

   This file draws things. It does not decide anything, it does not grade
   anything, and nothing in the build depends on it running. That is
   deliberate and it is the whole design rule for this layer.

   Some of the students using this have damaged eyesight. A WebGL canvas is
   an opaque rectangle to a screen reader, it does not reflow when the
   browser is zoomed, and the contrast of a lit surface is a function of the
   lighting rather than a token you can guarantee. So the model is never the
   control. Every part in every model exists first as a real, labelled,
   focusable button in ordinary HTML, and the canvas is a second view of the
   same state that happens to be nicer to look at. Turn WebGL off, zoom to
   400%, or drive the whole thing from the keyboard and nothing is lost
   except the picture.

   ---------------------------------------------------------------------
   Version two: parts are built, not boxed.

   The first cut drew one primitive per part, which is why a computer looked
   like a pile of blocks. A part is now a LIST of primitives — a cooler is a
   fin stack and a shroud and a hub and seven blades and four mounting posts
   — merged into a single geometry so that detail costs vertices rather than
   draw calls. Fourteen parts stay fourteen draw calls however much is in
   them.

   Two things make that authorable. `repeat` and `ring` expand one
   description into forty fins or seven fan blades, so nobody hand-writes
   forty boxes. And `shade` varies tone WITHIN a part through vertex colours,
   while the part's actual colour lives on the material — so selection can
   still tint the whole thing at once without flattening its internal
   shading.

   Materials WERE deliberately matte, on the argument that glossy highlights
   look better in a screenshot and take legibility away from exactly the
   people this was built for. That has been reversed on purpose: a student
   asked to find a bulged cell, a scorched trace or a glazed roller needs
   the part to look like the material it is made of, and a uniformly matte
   world hides the very cues that say "this one is wrong". Two things keep
   the trade honest — the environment is a soft room rather than a bare
   bulb, so highlights are broad instead of pinpoint, and tone mapping rolls
   the top end off instead of clipping it, because a blown white speck is
   the thing that actually hurts to look at.
   ===================================================================== */

import * as THREE from "./three.module.min.js";
import { expand } from "./shape.js";
import { surface, isPrinted, onTileReady } from "./surface.js";

/* Can this browser actually do it? Called before anything is built, so a
   machine with WebGL disabled never sees a dead grey box. */
export function sceneSupported() {
  try {
    var c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext &&
      (c.getContext("webgl2") || c.getContext("webgl")));
  } catch (e) { return false; }
}

function reducedMotion() {
  try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; }
  catch (e) { return false; }
}

/* Read a theme token off the element the canvas actually sits in, not off
   the document root. Each of the six steps carries its own hue, which
   redefines --paper and --text locally and deliberately stays a light ground
   in both themes. Reading from :root gave a navy canvas in a cream panel. */
function token(node, name, fallback) {
  try {
    var v = getComputedStyle(node || document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  } catch (e) { return fallback; }
}

/* =====================================================================
   Primitives

   Everything below returns a BufferGeometry centred on its own origin, so
   the caller can place it without thinking about where the shape's zero is.
   ===================================================================== */

/* A box with real chamfers. Straight BoxGeometry reads as a toy because
   nothing manufactured has a perfectly sharp edge; a 0.02–0.06 bevel is the
   single cheapest thing that makes plastic look moulded. */
function roundedBox(w, h, d, r) {
  r = Math.min(r === undefined ? 0.05 : r, w / 2.5, h / 2.5, d / 2.5);
  if (r <= 0.005) return new THREE.BoxGeometry(w, h, d);
  var s = new THREE.Shape();
  var x = w / 2 - r, y = h / 2 - r;
  s.moveTo(-x, -h / 2);
  s.lineTo(x, -h / 2);
  s.quadraticCurveTo(w / 2, -h / 2, w / 2, -y);
  s.lineTo(w / 2, y);
  s.quadraticCurveTo(w / 2, h / 2, x, h / 2);
  s.lineTo(-x, h / 2);
  s.quadraticCurveTo(-w / 2, h / 2, -w / 2, y);
  s.lineTo(-w / 2, -y);
  s.quadraticCurveTo(-w / 2, -h / 2, -x, -h / 2);
  var g = new THREE.ExtrudeGeometry(s, {
    depth: Math.max(0.001, d - r * 2), bevelEnabled: true,
    bevelThickness: r, bevelSize: r, bevelSegments: 2, curveSegments: 3
  });
  g.translate(0, 0, -(d - r * 2) / 2);
  return g;
}

function makeGeo(p) {
  var s = p.size || [1, 1, 1];
  switch (p.shape) {
    case "cyl":
      return new THREE.CylinderGeometry(s[0] / 2, s[0] / 2, s[1], p.seg || 20,
        1, !!p.open);
    case "cone":
      return new THREE.CylinderGeometry(s[0] / 2, s[2] / 2, s[1], p.seg || 18);
    case "tube":
      /* An open cylinder with a wall — vent throats, roller sleeves, the
         inside of a fan shroud. */
      return new THREE.CylinderGeometry(s[0] / 2, s[0] / 2, s[1], p.seg || 20, 1, true);
    case "torus":
      return new THREE.TorusGeometry(s[0] / 2, s[1] / 2, p.seg2 || 8, p.seg || 20,
        p.arc === undefined ? Math.PI * 2 : p.arc);
    case "sphere":
      return new THREE.SphereGeometry(s[0] / 2, p.seg || 16, (p.seg || 16) / 2);
    case "plate":
      return new THREE.BoxGeometry(s[0], s[1], s[2]);
    case "rbox":
      return roundedBox(s[0], s[1], s[2], p.r);
    default:
      return roundedBox(s[0], s[1], s[2], p.r === undefined ? 0.03 : p.r);
  }
}

/* Merge a part's primitives into one geometry. Detail then costs vertices,
   which a GPU does not care about, instead of draw calls, which it does. */
function mergeGeos(geos) {
  var total = 0;
  if (!geos.length) {
    var empty = new THREE.BufferGeometry();
    empty.setAttribute("position", new THREE.BufferAttribute(new Float32Array(0), 3));
    empty.setAttribute("normal", new THREE.BufferAttribute(new Float32Array(0), 3));
    empty.setAttribute("color", new THREE.BufferAttribute(new Float32Array(0), 3));
    return empty;
  }
  geos.forEach(function (g) { total += g.attributes.position.count; });
  var pos = new Float32Array(total * 3);
  var nor = new Float32Array(total * 3);
  var col = new Float32Array(total * 3);
  var anyUV = geos.some(function (g) { return !!g.attributes.uv; });
  var uvs = anyUV ? new Float32Array(total * 2) : null;
  var o = 0;
  geos.forEach(function (g) {
    var n = g.attributes.position.count;
    pos.set(g.attributes.position.array.subarray(0, n * 3), o * 3);
    if (g.attributes.normal) nor.set(g.attributes.normal.array.subarray(0, n * 3), o * 3);
    col.set(g.attributes.color.array.subarray(0, n * 3), o * 3);
    if (uvs && g.attributes.uv) uvs.set(g.attributes.uv.array.subarray(0, n * 2), o * 2);
    o += n;
    g.dispose();
  });
  var out = new THREE.BufferGeometry();
  out.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  out.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  out.setAttribute("color", new THREE.BufferAttribute(col, 3));
  if (uvs) out.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  return out;
}

function primGeometry(p, wantUV) {
  var g = makeGeo(p);
  if (g.index) g = g.toNonIndexed();
  var m = new THREE.Matrix4();
  var e = new THREE.Euler(
    (p.rot && p.rot[0]) || 0, (p.rot && p.rot[1]) || 0, (p.rot && p.rot[2]) || 0);
  m.makeRotationFromEuler(e);
  m.setPosition((p.pos && p.pos[0]) || 0, (p.pos && p.pos[1]) || 0, (p.pos && p.pos[2]) || 0);
  g.applyMatrix4(m);
  g.computeVertexNormals();
  /* Tone varies within a part through vertex colour; the part's real colour
     stays on the material, so selecting it can retint the whole thing at
     once without losing the shading that makes it read as an object. */
  var n = g.attributes.position.count;
  var s = p.shade === undefined ? 1 : p.shade;
  var c = new Float32Array(n * 3);
  for (var i = 0; i < n * 3; i++) c[i] = s;
  g.setAttribute("color", new THREE.BufferAttribute(c, 3));

  /* TEXTURE COORDINATES ACROSS THE WHOLE PART, not per primitive.

     Only for parts that actually carry a surface. Computing them for every
     primitive of every part cost the drill sweep 46% of its running time —
     three hundred and twenty-nine benches paying, per vertex, for a map
     that all but one of them does not have.

     A part is forty boxes merged into one mesh, and each box arrives with
     its own 0-to-1 map. Leave those alone and a surface texture restarts at
     every box — a board's copper would tile forty times over, once per
     component, which reads as wallpaper rather than as a board.

     So the coordinates are recomputed from where the piece ended up in the
     part, projected flat. The projection follows the face: a flat board is
     mapped from above, a wall from the front, so the grain runs across the
     surface a student is actually looking at instead of smearing down it. */
  if (!wantUV) return g;
  var pos = g.attributes.position.array;
  var nor = g.attributes.normal.array;
  var uv = new Float32Array(n * 2);
  var k = p.uv === undefined ? 1 : p.uv;
  for (var v = 0; v < n; v++) {
    var ax = Math.abs(nor[v * 3]), ay = Math.abs(nor[v * 3 + 1]), az = Math.abs(nor[v * 3 + 2]);
    var X, Y;
    if (ay >= ax && ay >= az) { X = pos[v * 3]; Y = pos[v * 3 + 2]; }
    else if (ax >= az) { X = pos[v * 3 + 2]; Y = pos[v * 3 + 1]; }
    else { X = pos[v * 3]; Y = pos[v * 3 + 1]; }
    uv[v * 2] = X * k;
    uv[v * 2 + 1] = Y * k;
  }
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return g;
}

/* =====================================================================
   MATERIALS WITHIN ONE PART

   A cooler is a copper heatpipe, an aluminium fin stack, a black plastic
   shroud and four steel posts. All four were already drawn — the geometry
   has been there since the parts were built — but a part is one mesh with
   one colour, and the only thing a piece could vary was `shade`, a
   brightness multiplier. So every one of those four came out the same grey
   at slightly different brightness, and under soft lighting they merged
   into a ribbed block.

   That is what makes these models read as plain, and it was never a lack of
   detail. I said it was, four times over in one message, before checking:
   the capacitors already have vent scores and polarity stripes, the memory
   already has end latches and gold fingers, the cooler already has four
   heatpipes and mounting posts, the supply already has an inlet, a switch,
   vents and a cable bundle. None of it could be SEEN.

   A piece may now name a material. Pieces are grouped by it and each group
   gets its own mesh, so one part can be copper and aluminium and black
   plastic at once. Named rather than free hex, because "the heatpipes are
   copper" survives somebody moving them and "#b0703a" does not.
   ===================================================================== */
var PIECE_MATERIAL = {
  copper: { color: "#b3703c", finish: "metal" },
  alu:    { color: "#c3cad0", finish: "metal" },
  steel:  { color: "#9aa3ab", finish: "steel" },
  gold:   { color: "#c9a44e", finish: "metal" },
  black:  { color: "#2c3034", finish: "plastic" },
  dark:   { color: "#4a5058", finish: "matte" },
  pale:   { color: "#d8dde1", finish: "plastic" },
  green:  { color: "#1e5340", finish: "board" }
};

/* Group a build's pieces by the material each names. Pieces that name none
   fall in the "" group and are drawn in the part's own colour, which is
   every piece in the build today — nothing changes until a piece opts in. */
function byMaterial(build) {
  var groups = {};
  (build || []).forEach(function (q) {
    var k = q.mat || "";
    if (!groups[k]) groups[k] = [];
    groups[k].push(q);
  });
  return groups;
}

/* Split a skinned part into the slab that carries the surface and the
   components fitted to it. See the note at the call site for why. */
function splitSkin(part) {
  var list = expand(part.build || []);
  if (!list.length) return { slab: list, fitted: [] };
  /* The slab is the piece covering the most ground. On a board that is the
     substrate; on a cover, the panel. */
  var area = function (q) {
    var z = q.size || [1, 1, 1];
    return (z[0] || 0) * (z[2] || z[0] || 0);
  };
  var base = list[0];
  list.forEach(function (q) { if (area(q) > area(base)) base = q; });
  var baseTop = ((base.pos && base.pos[1]) || 0) + ((base.size && base.size[1]) || 0) / 2;
  var slab = [], fit = [];
  list.forEach(function (q) {
    var bottom = ((q.pos && q.pos[1]) || 0) - ((q.size && q.size[1]) || 0) / 2;
    if (q === base || bottom < baseTop - 1e-6) slab.push(q); else fit.push(q);
  });
  return { slab: slab, fitted: fit };
}

export function buildPartGeometry(part) {
  /* AN EMPTY BUILD IS NOT A MISSING BUILD.
     This used to treat both as "no build" and fall back to drawing the
     part's overall box. That was harmless while every part either had
     pieces or had none — and became a real fault the moment pieces could be
     split out by material, because a part whose every piece named a
     material handed this an empty list and got a featureless slab the size
     of the whole part drawn over the top of its own detail. The cooler's
     fins, shroud and fan were all still there, inside a box. */
  if (part.build && !part.build.length) return mergeGeos([]);
  var compound = !!part.build;
  var list = compound
    ? part.build
    : [{ shape: part.shape, size: part.size, rot: part.rot, r: part.r }];
  var wantUV = !!part.skin;
  var g = mergeGeos(expand(list).map(function (q) { return primGeometry(q, wantUV); }));
  /* A compound part is authored in whatever orientation is natural to draw
     it in — a fan as a disc in the XZ plane, say — and then turned as a
     whole into the pose the model wants. Single-primitive parts already
     carry their rotation, so they are left alone. */
  /* A part built from fixed-size primitives cannot follow a model that
     scales its layout — a small-form-factor machine moved everything closer
     together while the components stayed full size, and they jammed into one
     another. Scaling the built geometry keeps the two in step. */
  if (part.scale && part.scale !== 1) {
    g.scale(part.scale, part.scale, part.scale);
  }
  if (compound && part.rot) {
    var m = new THREE.Matrix4().makeRotationFromEuler(
      new THREE.Euler(part.rot[0] || 0, part.rot[1] || 0, part.rot[2] || 0));
    g.applyMatrix4(m);
    g.computeVertexNormals();
  }
  return g;
}

/* FINISHES.

   These used to be flat matte on purpose, to keep specular highlights off
   the screen for students with damaged sight. The owner has since asked for
   full material realism: a technician looking for a bulged capacitor or a
   scorched trace needs the part to look like the material it is made of,
   and a uniformly matte world hides the very cues that say "this one is
   wrong". The trade is deliberate and was made with the accessibility cost
   stated.

   Two things keep it from becoming glare. Highlights are broad rather than
   pinpoint — the environment is a soft room, not a bare bulb — and tone
   mapping rolls the top end off instead of clipping it to white. A blown
   white speck is what actually hurts; a wide sheen across a plastic shell
   does not.

   `gloss` is the sheen strength, used as clearcoat on the physical
   materials so plastics and painted metal read wet-ish without the base
   colour washing out. */
const FINISH = {
  matte:   { roughness: 0.72, metalness: 0.0,  gloss: 0.10 },
  plastic: { roughness: 0.34, metalness: 0.0,  gloss: 0.55 },
  rubber:  { roughness: 0.88, metalness: 0.0,  gloss: 0.05 },
  /* METALS ARE NOT MIRRORS. At metalness 0.9 a surface has almost no colour
     of its own — it shows whatever it reflects — so against a small painted
     environment the laptop's aluminium cover and display assembly rendered
     as flat black slabs. A grey-blue part came out black and a student was
     asked to look for damage on it. Anodised aluminium and painted steel
     sit nearer 0.6, which keeps the base colour and still reads as metal. */
  metal:   { roughness: 0.38, metalness: 0.62, gloss: 0.20 },
  steel:   { roughness: 0.30, metalness: 0.75, gloss: 0.25 },
  board:   { roughness: 0.42, metalness: 0.05, gloss: 0.45 },
  glass:   { roughness: 0.05, metalness: 0.0,  gloss: 1.00 },
  /* Damage finishes. A fault has to look like a fault at a glance, so the
     surface changes as well as the shape: scorching goes dead matte and
     dark, corrosion goes chalky, leaked electrolyte goes wet and dark. */
  scorched: { roughness: 0.95, metalness: 0.0, gloss: 0.0 },
  corroded: { roughness: 0.90, metalness: 0.25, gloss: 0.0 },
  weeping:  { roughness: 0.22, metalness: 0.0, gloss: 0.80 }
};

/* A SOFT ROOM, BUILT IN CODE.

   Metal with no environment to reflect renders nearly black — turning
   metalness up without this would have made every steel part darker, not
   shinier. This paints a small gradient sky with two broad light panels
   into a canvas and lets PMREM turn it into a reflection probe. Broad
   sources on purpose: they give metals something to catch without putting a
   hard white pinpoint anywhere.

   Built in code rather than loaded, because this build fetches nothing. */
/* NOT CACHED, AND THAT IS THE POINT. It used to be held in a module-level
   variable and reused, which is the obvious optimisation and was wrong: a
   PMREM texture belongs to the renderer that made it, and every ticket
   builds a fresh bench and disposes the old renderer. From the second
   ticket onward the probe was dead, the metals had nothing to reflect, and
   the whole machine rendered darker. Measured: the first bench of a session
   came out 32 levels brighter than every one after it.

   Nobody would report that as a bug — it just looks like the second ticket
   is a different machine, which is exactly what a student is being asked to
   believe. Building it per scene costs a 256x128 canvas. */
/* The PAINTED SKY is safe to keep — it is an ordinary 2D canvas and belongs
   to no renderer. Only the probe made from it has to be per-scene. */
let SKY = null;
function roomEnvironment(renderer, THREE) {
  if (SKY) return probeFrom(SKY, renderer, THREE);
  const c = document.createElement("canvas");
  c.width = 256; c.height = 128;
  const x = c.getContext("2d");
  /* The lower half of this is what a metal part reflects when it faces down
     or away, and the first version ran it to #5d666c — near enough to black
     once tone mapping had it. A workshop has a pale bench and pale walls
     bouncing light back up; so does this. */
  const sky = x.createLinearGradient(0, 0, 0, 128);
  sky.addColorStop(0, "#ffffff");
  sky.addColorStop(0.45, "#e8eef1");
  sky.addColorStop(0.55, "#c2cace");
  sky.addColorStop(1, "#98a1a7");
  x.fillStyle = sky; x.fillRect(0, 0, 256, 128);
  /* two soft ceiling panels, the sort of light a workshop actually has */
  x.globalAlpha = 0.9;
  [[52, 16, 64, 26], [156, 12, 72, 22]].forEach(function (r) {
    const g = x.createRadialGradient(r[0] + r[2] / 2, r[1] + r[3] / 2, 2,
                                     r[0] + r[2] / 2, r[1] + r[3] / 2, r[2] / 1.4);
    g.addColorStop(0, "#ffffff"); g.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = g; x.fillRect(r[0] - 20, r[1] - 12, r[2] + 40, r[3] + 30);
  });
  SKY = c;
  return probeFrom(c, renderer, THREE);
}
function probeFrom(canvasSky, renderer, THREE) {
  const tex = new THREE.CanvasTexture(canvasSky);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromEquirectangular(tex).texture;
  pmrem.dispose(); tex.dispose();
  return env;
}

/* ---------------------------------------------------------------------
   mountScene(host, spec, opts)
   --------------------------------------------------------------------- */
export function mountScene(host, spec, opts) {
  opts = opts || {};
  var W = host.clientWidth || 640;
  var H = opts.height || 340;

  var renderer, scene, camera, raf = 0, dead = false;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  } catch (e) {
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  /* Roll the top end off rather than clipping it. A clipped highlight is a
     blown white speck, which is the thing that actually hurts to look at;
     tone mapping keeps the sheen and takes the sting out of it. */
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setSize(W, H, false);
  var canvas = renderer.domElement;
  canvas.style.width = "100%";
  canvas.style.height = H + "px";
  canvas.style.display = "block";
  canvas.style.touchAction = "none";
  /* The canvas is scenery. The buttons beside it are the interface. */
  canvas.setAttribute("aria-hidden", "true");
  canvas.tabIndex = -1;
  host.appendChild(canvas);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(token(host, "--paper", "#eceff0"));
  /* What the metals reflect. Without this, metalness renders black. */
  try { scene.environment = roomEnvironment(renderer, THREE); } catch (e) { /* no PMREM */ }

  camera = new THREE.PerspectiveCamera(38, W / H, 0.1, 300);

  /* Lighting flat enough that every face stays legible, with just enough
     direction that edges read. A dramatic key light photographs well and
     hides half the model from someone on a laptop in a bright room. */
  /* REBALANCED FOR THE ENVIRONMENT. These four were tuned when there was no
     environment map and they were the only light in the scene. Adding a
     reflection probe on top lit everything twice: the first render after the
     materials change came out pale and chalky, with the colour washed out of
     the board and the sockets — brighter, but carrying LESS information than
     the matte version it replaced. The probe now carries the ambient and
     these just shape it. */
  /* Then rebalanced again, because the first rebalance overcorrected: dark
     parts went to black and the exploded laptop read as four silhouettes.
     Legibility of every face is the requirement that outranks the look. */
  scene.add(new THREE.HemisphereLight(0xffffff, 0xa8b2b8, 0.26));
  var key = new THREE.DirectionalLight(0xffffff, 0.95);
  key.position.set(7, 12, 9);
  scene.add(key);
  var fill = new THREE.DirectionalLight(0xffffff, 0.5);
  fill.position.set(-8, 5, -7);
  scene.add(fill);
  var rim = new THREE.DirectionalLight(0xffffff, 0.34);
  rim.position.set(0, -6, 4);
  scene.add(rim);

  var root = new THREE.Group();
  scene.add(root);

  var meshes = {}, pickable = [], baseColor = {}, edges = {}, harm = {}, fitted = {}, sub = {};

  function partMaterial(color, finish, skin, seed) {
    var f = FINISH[finish || "plastic"] || FINISH.plastic;
    var opts = {
      clearcoat: f.gloss || 0,
      clearcoatRoughness: Math.max(0.04, (f.roughness || 0.5) * 0.5),
      envMapIntensity: 0.42,
      color: new THREE.Color(color || "#7a8a95"),
      vertexColors: true, roughness: f.roughness, metalness: f.metalness
    };
    /* A painted surface, when the part asks for one: a copper layer and
       silkscreen on a board, drawn grain on aluminium, pebble on a moulding.
       The map carries the colour, so the material's own colour goes white
       and lets it through — and selection, which retints the material, still
       works because it multiplies rather than replaces. */
    /* A part may name a surface as a plain string, or as an object when the
       surface needs data from the ticket — a drive label carrying the
       capacity this ticket generated, rather than a capacity typed twice. */
    var name = skin && skin.kind ? skin.kind : skin;
    var sk = name ? surface(name, THREE, 0, seed, skin && skin.kind ? skin : null) : null;
    if (sk) {
      opts.map = sk.map;
      opts.normalMap = sk.normalMap;
      /* Relief is stronger on printed detail, where it is copper standing
         off a mask, than on material grain, where too much of it turns a
         moulding into gravel. */
      var rel = sk.printed ? 0.6 : 0.28;
      opts.normalScale = new THREE.Vector2(rel, rel);
      /* A PRINTED surface has its own colour and replaces the part's. A
         MATERIAL GRAIN is near-white and multiplies over it, so a black
         keyboard keeps its black and gains a moulding texture. Treating
         both the same turned every moulded part into grey gravel. */
      if (sk.printed) opts.color = new THREE.Color("#ffffff");
    }
    return new THREE.MeshPhysicalMaterial(opts);
  }

  function rebuild() {
    while (root.children.length) {
      var c = root.children.pop();
      if (c.geometry) c.geometry.dispose();
      if (c.material) c.material.dispose();
    }
    meshes = {}; pickable = []; baseColor = {}; edges = {}; harm = {}; fitted = {}; sub = {};

    if (spec.board) {
      var b = spec.board;
      var bg = buildPartGeometry({ shape: b.shape || "box", size: b.size, r: 0.06 });
      var bm = new THREE.Mesh(bg, new THREE.MeshStandardMaterial({
        color: new THREE.Color(b.color || "#7c868e"),
        vertexColors: true, roughness: 0.9, metalness: 0.05
      }));
      bm.position.set(b.pos[0], b.pos[1], b.pos[2]);
      root.add(bm);
    }

    (spec.decor || []).forEach(function (d) {
      var dg = buildPartGeometry(d);
      var dm = new THREE.Mesh(dg, new THREE.MeshStandardMaterial({
        color: new THREE.Color(d.color || "#5c6873"),
        vertexColors: true, roughness: 0.8, metalness: 0.05
      }));
      dm.position.set(d.pos[0], d.pos[1], d.pos[2]);
      root.add(dm);
    });

    function addMaterialMesh(p, mk, pieces) {
      var def = PIECE_MATERIAL[mk];
      if (!def) {
        throw new Error('scene: a piece of "' + p.key + '" is made of "' + mk +
          '", which is not a material. Add it to PIECE_MATERIAL in scene.js.');
      }
      var gg = buildPartGeometry(Object.assign({}, p, { build: pieces, skin: null }));
      var gm = new THREE.Mesh(gg, partMaterial(def.color, def.finish));
      gm.position.set(p.pos[0], p.pos[1], p.pos[2]);
      gm.userData.key = p.key;
      root.add(gm);
      pickable.push(gm);
      if (!sub[p.key]) sub[p.key] = [];
      /* Its own colour is remembered so deselecting puts it back, rather
         than leaving every copper heatpipe teal for the rest of the run. */
      sub[p.key].push({ mesh: gm, base: new THREE.Color(def.color) });
    }

    (spec.parts || []).forEach(function (p) {
      /* A SURFACE BELONGS TO THE SUBSTRATE, NOT TO WHAT IS BOLTED TO IT.
         The first render of the textured board put copper traces and
         silkscreen across the capacitors, the heatsink and the connectors
         too, because a part is one merged mesh and the map covers all of it.
         So a skinned part is split: the slab the components sit on gets the
         surface, and everything standing proud of it is drawn plain.
         The split is DERIVED — the slab is the piece with the largest
         footprint, and a component is anything whose underside is above the
         top of it — rather than hand-tagged, because a list of which pieces
         are components is a list that stops matching the model. */
      var split = p.skin ? splitSkin(p) : null;
      var main = split ? split.slab : (p.build || null);

      /* One mesh per material named inside the part. The unnamed group is
         the part itself and carries its skin, its colour and its identity;
         the named ones are the copper, the aluminium, the steel. */
      var groups = byMaterial(main);
      var plain = groups[""] || [];
      delete groups[""];

      var geo = buildPartGeometry(main ? Object.assign({}, p, { build: plain }) : p);
      var mat = partMaterial(p.color, p.finish, p.skin, spec.seed);
      var m = new THREE.Mesh(geo, mat);
      m.position.set(p.pos[0], p.pos[1], p.pos[2]);
      m.userData.key = p.key;
      root.add(m);
      meshes[p.key] = m;
      baseColor[p.key] = new THREE.Color(isPrinted(p.skin) ? "#ffffff" : (p.color || "#7a8a95"));
      pickable.push(m);

      Object.keys(groups).forEach(function (mk) { addMaterialMesh(p, mk, groups[mk]); });

      if (split && split.fitted.length) {
        var fgroups = byMaterial(split.fitted);
        var fplain = fgroups[""] || [];
        delete fgroups[""];
        if (fplain.length) {
          var fg = buildPartGeometry(Object.assign({}, p, { build: fplain, skin: null }));
          var fm = new THREE.Mesh(fg, partMaterial(p.color, p.finish));
          fm.position.set(p.pos[0], p.pos[1], p.pos[2]);
          fm.userData.key = p.key;
          root.add(fm);
          fitted[p.key] = fm;
          pickable.push(fm);
        }
        Object.keys(fgroups).forEach(function (mk) { addMaterialMesh(p, mk, fgroups[mk]); });
      }

      /* DAMAGE IS LOCAL. It used to be a repaint: a fault recoloured the
         whole part, so a scorched mainboard came out brown from edge to
         edge. That is not what burnt looks like and it destroyed the very
         cue it was meant to add — a healthy green board with a black patch
         on it is the picture a technician is trained to read.
         A part is one merged mesh with one colour, so the damage cannot
         live inside it. It gets its own mesh in the same place, with its
         own material, answering to the same part key when clicked. */
      if (p.harm && p.harm.length) {
        /* The skin goes in on BOTH sides. `buildPartGeometry` only computes
           UVs when it is told the part is skinned, so passing the surface to
           the material and not to the geometry hangs a photograph on a mesh
           with nowhere to put it. */
        var hg = buildPartGeometry({ build: p.harm, scale: p.scale, rot: p.rot,
                                     skin: p.harmSkin || null });
        var hm = new THREE.Mesh(hg, partMaterial(p.harmColor || "#2a1d14",
                                                 p.harmFinish || "matte",
                                                 p.harmSkin || null, 0));
        hm.position.set(p.pos[0], p.pos[1], p.pos[2]);
        hm.userData.key = p.key;
        root.add(hm);
        harm[p.key] = hm;
        pickable.push(hm);
      }

      /* A wire cage over each part. Edges survive being small, being zoomed,
         and being looked at by someone whose colour discrimination is not
         what it was. Built from the part's own silhouette so it follows the
         detail rather than boxing it. */
      var eg = new THREE.LineSegments(
        new THREE.EdgesGeometry(geo, 32),
        new THREE.LineBasicMaterial({
          color: new THREE.Color(token(host, "--text", "#10161f")),
          transparent: true, opacity: 0.28
        })
      );
      eg.position.copy(m.position);
      eg.userData.edgeFor = p.key;
      root.add(eg);
      edges[p.key] = eg;
    });
  }
  rebuild();

  /* ---- camera ---- */
  var cam = spec.camera || {};
  var yaw = cam.yaw === undefined ? 0.62 : cam.yaw;
  var pitch = cam.pitch === undefined ? 0.5 : cam.pitch;
  var dist = cam.dist === undefined ? 14 : cam.dist;
  var home = { yaw: yaw, pitch: pitch, dist: dist };
  var target = new THREE.Vector3().fromArray(cam.target || [0, 0, 0]);

  function place() {
    pitch = Math.max(-1.35, Math.min(1.35, pitch));
    dist = Math.max(cam.min || 5, Math.min(cam.max || 40, dist));
    camera.position.set(
      target.x + dist * Math.cos(pitch) * Math.sin(yaw),
      target.y + dist * Math.sin(pitch),
      target.z + dist * Math.cos(pitch) * Math.cos(yaw)
    );
    camera.lookAt(target);
  }
  place();

  /* ---- selection ---- */
  var selected = null, hi = null;
  var accent = new THREE.Color(token(host, "--accent", "#12b3af"));
  var warn = new THREE.Color("#e0912f");

  /* ---------------------------------------------------------------------
     THE OUTLINE THAT SAYS "HERE"

     Shown on the fourth wrong guess, when the written hints have not landed
     and a student is about to give up. It is deliberately not the selection
     colour and not the reveal colour: those two already mean "you picked
     this" and "this is the answer", and a third meaning on either of them
     would teach the student to distrust both. A muted violet sits apart
     from the teal and the amber, and reads against a green board, bare
     metal, black plastic and the cream ground alike.

     It pulses three times and then STAYS, at about half strength. Flashing
     and vanishing punishes the student who happened to be reading the hint
     text at that moment, which is most of them — that is the whole reason
     the outline exists. A student who has prefers-reduced-motion set skips
     the pulsing and goes straight to the steady mark; nobody has to take a
     flashing screen to get the help.
     --------------------------------------------------------------------- */
  var flashColor = new THREE.Color("#a86fd0");
  var edgeColor = new THREE.Color(token(host, "--text", "#10161f"));
  var flashKey = null, flashAt = 0, flashSettled = false;
  var FLASHES = 3, FLASH_MS = 560;
  var noMotion = reducedMotion();
  var now = function () {
    return (window.performance && performance.now) ? performance.now() : Date.now();
  };
  function flashLevel(k) {
    if (k !== flashKey || !flashKey) return 0;
    if (noMotion) return 0.55;
    var t = now() - flashAt;
    if (t >= FLASHES * FLASH_MS) return 0.55;      // settled, still marked
    return 0.22 + 0.78 * Math.sin(((t % FLASH_MS) / FLASH_MS) * Math.PI);
  }

  function applyStyle() {
    Object.keys(meshes).forEach(function (k) {
      var m = meshes[k];
      var p = (spec.parts || []).filter(function (x) { return x.key === k; })[0];
      var lift = 0, col = baseColor[k];
      if (k === selected) { col = accent; lift = 0.42; }
      else if (k === hi) { col = warn; lift = 0.22; }
      m.material.color.copy(col);
      m.position.y = p.pos[1] + lift;
      /* The damage rises with the part but keeps its own colour. Selecting a
         part turns it accent, and if the damage went with it the student
         would lose sight of the thing they were selecting it to look at. */
      if (harm[k]) harm[k].position.y = p.pos[1] + lift;
      if (fitted[k]) fitted[k].position.y = p.pos[1] + lift;
      /* Selecting a cooler has to turn the whole cooler, not just its
         shroud, or the accent says "part of this part". */
      (sub[k] || []).forEach(function (g) {
        g.mesh.position.y = p.pos[1] + lift;
        g.mesh.material.color.copy(k === selected ? accent : (k === hi ? warn : g.base));
      });
      /* A one-pixel line is all WebGL will reliably draw, and on a small
         part that is not enough to find. So the outline comes with a faint
         glow on the part itself — the ring says where the edge is, the glow
         says which object, and together they survive being looked at by
         someone whose sight is not what it was. */
      var fl = flashLevel(k);
      if (m.material.emissive) m.material.emissive.copy(flashColor).multiplyScalar(fl * 0.30);
      if (harm[k] && harm[k].material.emissive) {
        harm[k].material.emissive.copy(flashColor).multiplyScalar(fl * 0.30);
      }
      if (edges[k]) {
        edges[k].position.y = p.pos[1] + lift;
        edges[k].material.color.copy(fl ? flashColor : edgeColor);
        edges[k].material.opacity = fl
          ? Math.max(0.45, fl)
          : ((k === selected || k === hi) ? 0.9 : 0.28);
      }
    });
  }

  /* ---- picking ---- */
  var ray = new THREE.Raycaster();
  var ndc = new THREE.Vector2();
  /* A FORGIVING HIT TEST.

     A single ray through the pointer is right for a motherboard and useless
     for a cable run: measured across a grid of thirty clicks spread over the
     canvas, the network model — two plugs, a wall port and a thin run —
     answered one of them. Told to click the faulty part, a student on that
     ticket would click and click and have nothing happen, and conclude the
     picture was decoration.

     So a miss retries on a small ring around the pointer before giving up.
     It is still a real raycast, so what is in front still wins and nothing
     hidden behind another part can be picked by accident; it just means a
     thin thing does not demand pixel-exact aim. That matters beyond thin
     geometry — this is used by people working a trackpad one-handed on a
     bench, and by people whose hands are not steady. */
  var NEAR = [[0, 0], [7, 0], [-7, 0], [0, 7], [0, -7], [5, 5], [-5, 5], [5, -5], [-5, -5],
              [14, 0], [-14, 0], [0, 14], [0, -14], [10, 10], [-10, 10], [10, -10], [-10, -10]];
  function pickAt(clientX, clientY) {
    var r = canvas.getBoundingClientRect();
    for (var i = 0; i < NEAR.length; i++) {
      ndc.x = ((clientX + NEAR[i][0] - r.left) / r.width) * 2 - 1;
      ndc.y = -((clientY + NEAR[i][1] - r.top) / r.height) * 2 + 1;
      ray.setFromCamera(ndc, camera);
      var hits = ray.intersectObjects(pickable, false);
      if (hits.length) return hits[0].object.userData.key;
    }
    return null;
  }

  var dragging = false, moved = 0, lastX = 0, lastY = 0;
  canvas.addEventListener("pointerdown", function (e) {
    dragging = true; moved = 0; lastX = e.clientX; lastY = e.clientY;
    try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
  });
  canvas.addEventListener("pointermove", function (e) {
    if (!dragging) return;
    var dx = e.clientX - lastX, dy = e.clientY - lastY;
    moved += Math.abs(dx) + Math.abs(dy);
    yaw -= dx * 0.008; pitch += dy * 0.006;
    lastX = e.clientX; lastY = e.clientY;
    place();
  });
  canvas.addEventListener("pointerup", function (e) {
    dragging = false;
    /* A drag that ends over a part is a drag, not a click. Six pixels of
       slop, because a hand that shakes should still be able to click. */
    if (moved > 6) return;
    var k = pickAt(e.clientX, e.clientY);
    if (k && opts.onPick) opts.onPick(k);
  });
  canvas.addEventListener("pointercancel", function () { dragging = false; });
  canvas.addEventListener("wheel", function (e) {
    e.preventDefault();
    dist += (e.deltaY > 0 ? 1 : -1) * 1.1;
    place();
  }, { passive: false });

  /* ---- render on demand ---- */
  var needs = true;
  function tick() {
    if (dead) return;
    raf = requestAnimationFrame(tick);
    /* The scene renders on demand, so a pulse has to ask for its own frames
       — and stop asking the moment it settles, or one outline would keep a
       laptop redrawing sixty times a second for the rest of the session. */
    if (flashKey && !noMotion && !flashSettled) {
      if (now() - flashAt >= FLASHES * FLASH_MS) flashSettled = true;
      applyStyle();
    }
    if (!needs) return;
    needs = false;
    renderer.render(scene, camera);
  }
  /* A photographed tile decodes a frame or two after the scene is built.
     Without this it lands in the texture and never reaches the screen,
     because nothing asks for another frame once the first one is drawn. */
  onTileReady(function () { needs = true; });

  var _place = place;
  place = function () { _place(); needs = true; };
  var _applyStyle = applyStyle;
  applyStyle = function () { _applyStyle(); needs = true; };
  applyStyle();
  tick();

  function resize() {
    var w = host.clientWidth || W;
    renderer.setSize(w, H, false);
    camera.aspect = w / H;
    camera.updateProjectionMatrix();
    needs = true;
  }
  var ro = null;
  try { ro = new ResizeObserver(resize); ro.observe(host); } catch (e) {}

  function retheme() {
    scene.background = new THREE.Color(token(host, "--paper", "#eceff0"));
    accent = new THREE.Color(token(host, "--accent", "#12b3af"));
    edgeColor = new THREE.Color(token(host, "--text", "#10161f"));
    Object.keys(edges).forEach(function (k) { edges[k].material.color.copy(edgeColor); });
    applyStyle();
  }

  return {
    canvas: canvas,
    select: function (k) { selected = k; applyStyle(); },
    highlight: function (k) { hi = k; applyStyle(); },
    /* Outline a part and pulse it three times. Pass null to take it off. */
    flash: function (k) {
      flashKey = k || null;
      flashAt = now();
      flashSettled = false;
      applyStyle();
    },
    flashing: function () { return flashKey; }, 
    orbit: function (dy, dp) { yaw += dy; pitch += dp; place(); },
    zoom: function (d) { dist += d; place(); },
    reset: function () { yaw = home.yaw; pitch = home.pitch; dist = home.dist; place(); },
    retheme: retheme,
    /* Draw a frame right now and hand back the pixels.
       The scene renders on demand, and a WebGL drawing buffer is only
       readable in the frame it was drawn in — after that the compositor has
       taken it and both drawImage and readPixels come back blank or black.
       So a screenshot taken a second after the last render photographs
       nothing, which reads exactly like a model that failed to draw. It
       cost me one wrong conclusion about the lighting before I noticed.
       Nothing in the page calls this; it exists so a picture of the bench
       can be trusted to be a picture of the bench. */
    snapshot: function () {
      renderer.render(scene, camera);
      try { return canvas.toDataURL("image/png"); } catch (e) { return null; }
    },
    reducedMotion: reducedMotion(),
    dispose: function () {
      dead = true;
      cancelAnimationFrame(raf);
      if (ro) try { ro.disconnect(); } catch (e) {}
      root.children.forEach(function (c) {
        if (c.geometry) c.geometry.dispose();
        if (c.material) c.material.dispose();
      });
      /* The probe belongs to this renderer and goes with it. */
      if (scene.environment) try { scene.environment.dispose(); } catch (e) {}
      try { renderer.dispose(); } catch (e) {}
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    }
  };
}
