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

   Materials stay deliberately matte. Glossy highlights look better in a
   screenshot and take legibility away from exactly the people this was
   built for.
   ===================================================================== */

import * as THREE from "./three.module.min.js";

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

/* `repeat` stamps a primitive along a step vector; `ring` arranges copies
   around an axis. Between them, a forty-fin heatsink and a seven-blade fan
   are three lines of description each instead of forty-seven. */
function expand(list) {
  var out = [];
  (list || []).forEach(function (p) {
    if (p.ring) {
      var n = p.ring.count, rad = p.ring.radius, ax = p.ring.axis || "y";
      for (var i = 0; i < n; i++) {
        var a = (i / n) * Math.PI * 2 + (p.ring.phase || 0);
        var q = Object.assign({}, p); delete q.ring;
        var px = p.pos ? p.pos[0] : 0, py = p.pos ? p.pos[1] : 0, pz = p.pos ? p.pos[2] : 0;
        var r0 = p.rot ? p.rot.slice() : [0, 0, 0];
        if (ax === "y") {
          q.pos = [px + Math.cos(a) * rad, py, pz + Math.sin(a) * rad];
          q.rot = [r0[0], r0[1] - a, r0[2]];
        } else if (ax === "x") {
          q.pos = [px, py + Math.cos(a) * rad, pz + Math.sin(a) * rad];
          q.rot = [r0[0] - a, r0[1], r0[2]];
        } else {
          q.pos = [px + Math.cos(a) * rad, py + Math.sin(a) * rad, pz];
          q.rot = [r0[0], r0[1], r0[2] - a];
        }
        out.push(q);
      }
      return;
    }
    if (p.repeat) {
      var c = p.repeat.count, st = p.repeat.step || [0, 0, 0];
      for (var j = 0; j < c; j++) {
        var w = Object.assign({}, p); delete w.repeat;
        var b = p.pos || [0, 0, 0];
        w.pos = [b[0] + st[0] * j, b[1] + st[1] * j, b[2] + st[2] * j];
        out.push(w);
      }
      return;
    }
    out.push(p);
  });
  return out;
}

/* Merge a part's primitives into one geometry. Detail then costs vertices,
   which a GPU does not care about, instead of draw calls, which it does. */
function mergeGeos(geos) {
  var total = 0;
  geos.forEach(function (g) { total += g.attributes.position.count; });
  var pos = new Float32Array(total * 3);
  var nor = new Float32Array(total * 3);
  var col = new Float32Array(total * 3);
  var o = 0;
  geos.forEach(function (g) {
    var n = g.attributes.position.count;
    pos.set(g.attributes.position.array.subarray(0, n * 3), o * 3);
    if (g.attributes.normal) nor.set(g.attributes.normal.array.subarray(0, n * 3), o * 3);
    col.set(g.attributes.color.array.subarray(0, n * 3), o * 3);
    o += n;
    g.dispose();
  });
  var out = new THREE.BufferGeometry();
  out.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  out.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  out.setAttribute("color", new THREE.BufferAttribute(col, 3));
  return out;
}

function primGeometry(p) {
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
  return g;
}

export function buildPartGeometry(part) {
  var compound = part.build && part.build.length;
  var list = compound
    ? part.build
    : [{ shape: part.shape, size: part.size, rot: part.rot, r: part.r }];
  var g = mergeGeos(expand(list).map(primGeometry));
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

/* Finishes. Matte on purpose — a specular highlight rolling across a part is
   the enemy of anybody reading this at 400% zoom with damaged sight. */
const FINISH = {
  matte:   { roughness: 0.85, metalness: 0.0 },
  plastic: { roughness: 0.62, metalness: 0.0 },
  rubber:  { roughness: 0.95, metalness: 0.0 },
  metal:   { roughness: 0.52, metalness: 0.45 },
  steel:   { roughness: 0.44, metalness: 0.60 },
  board:   { roughness: 0.72, metalness: 0.10 },
  glass:   { roughness: 0.28, metalness: 0.10 }
};

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

  camera = new THREE.PerspectiveCamera(38, W / H, 0.1, 300);

  /* Lighting flat enough that every face stays legible, with just enough
     direction that edges read. A dramatic key light photographs well and
     hides half the model from someone on a laptop in a bright room. */
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8899a0, 1.25));
  var key = new THREE.DirectionalLight(0xffffff, 1.4);
  key.position.set(7, 12, 9);
  scene.add(key);
  var fill = new THREE.DirectionalLight(0xffffff, 0.65);
  fill.position.set(-8, 5, -7);
  scene.add(fill);
  var rim = new THREE.DirectionalLight(0xffffff, 0.4);
  rim.position.set(0, -6, 4);
  scene.add(rim);

  var root = new THREE.Group();
  scene.add(root);

  var meshes = {}, pickable = [], baseColor = {}, edges = {};

  function rebuild() {
    while (root.children.length) {
      var c = root.children.pop();
      if (c.geometry) c.geometry.dispose();
      if (c.material) c.material.dispose();
    }
    meshes = {}; pickable = []; baseColor = {}; edges = {};

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

    (spec.parts || []).forEach(function (p) {
      var geo = buildPartGeometry(p);
      var f = FINISH[p.finish || "plastic"] || FINISH.plastic;
      var mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(p.color || "#7a8a95"),
        vertexColors: true, roughness: f.roughness, metalness: f.metalness
      });
      var m = new THREE.Mesh(geo, mat);
      m.position.set(p.pos[0], p.pos[1], p.pos[2]);
      m.userData.key = p.key;
      root.add(m);
      meshes[p.key] = m;
      baseColor[p.key] = new THREE.Color(p.color || "#7a8a95");
      pickable.push(m);

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

  function applyStyle() {
    Object.keys(meshes).forEach(function (k) {
      var m = meshes[k];
      var p = (spec.parts || []).filter(function (x) { return x.key === k; })[0];
      var lift = 0, col = baseColor[k];
      if (k === selected) { col = accent; lift = 0.42; }
      else if (k === hi) { col = warn; lift = 0.22; }
      m.material.color.copy(col);
      m.position.y = p.pos[1] + lift;
      if (edges[k]) {
        edges[k].position.y = p.pos[1] + lift;
        edges[k].material.opacity = (k === selected || k === hi) ? 0.9 : 0.28;
      }
    });
  }

  /* ---- picking ---- */
  var ray = new THREE.Raycaster();
  var ndc = new THREE.Vector2();
  function pickAt(clientX, clientY) {
    var r = canvas.getBoundingClientRect();
    ndc.x = ((clientX - r.left) / r.width) * 2 - 1;
    ndc.y = -((clientY - r.top) / r.height) * 2 + 1;
    ray.setFromCamera(ndc, camera);
    var hits = ray.intersectObjects(pickable, false);
    return hits.length ? hits[0].object.userData.key : null;
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
    if (!needs) return;
    needs = false;
    renderer.render(scene, camera);
  }
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
    var edge = new THREE.Color(token(host, "--text", "#10161f"));
    Object.keys(edges).forEach(function (k) { edges[k].material.color.copy(edge); });
    applyStyle();
  }

  return {
    canvas: canvas,
    select: function (k) { selected = k; applyStyle(); },
    highlight: function (k) { hi = k; applyStyle(); },
    orbit: function (dy, dp) { yaw += dy; pitch += dp; place(); },
    zoom: function (d) { dist += d; place(); },
    reset: function () { yaw = home.yaw; pitch = home.pitch; dist = home.dist; place(); },
    retheme: retheme,
    reducedMotion: reducedMotion(),
    dispose: function () {
      dead = true;
      cancelAnimationFrame(raf);
      if (ro) try { ro.disconnect(); } catch (e) {}
      root.children.forEach(function (c) {
        if (c.geometry) c.geometry.dispose();
        if (c.material) c.material.dispose();
      });
      try { renderer.dispose(); } catch (e) {}
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    }
  };
}
