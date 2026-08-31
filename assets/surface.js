/* =====================================================================
   WHAT A SURFACE IS MADE OF

   The bench draws parts out of boxes and cylinders, each one painted a
   single flat colour. That is enough to say where a part sits and what
   shape it is, and it is nowhere near enough to say what it IS. A green
   rectangle is not a circuit board. A grey rectangle is not brushed
   aluminium. A student who has only ever seen the grey rectangle walks
   into a real machine and recognises nothing.

   The thing that closes that gap is not more polygons. It is TEXTURE: an
   image wrapped onto the surface, plus a second image saying which way the
   surface tilts at every point so the light breaks over it. A board with a
   copper layer, a solder mask, silkscreen and pads reads as a board from
   across a room, even when the geometry under it is one flat slab.

   WHY THESE ARE PAINTED IN CODE RATHER THAN LOADED.

   This site fetches nothing — it has to run from a memory stick in a room
   with no network — so every texture would otherwise be base64 inside the
   page. A single 1024-square colour-and-relief pair is around 400KB
   encoded. Fourteen parts across thirteen tracks is not a website any more.

   Painted procedurally they cost bytes of code and a few milliseconds at
   load, they scale to any resolution, and — this is the part that matters
   for a teaching build — they can be DERIVED FROM THE MODEL. A board's
   silkscreen can name the components that board actually has. A drive label
   can carry the capacity the ticket generated. Nothing has to be kept in
   step by hand, which is the failure this project keeps having.

   WHERE PHOTOGRAPHS STILL WIN. Fine material grain — the weave under a
   board's solder mask, the drawn lines in brushed aluminium, the bloom on
   moulded ABS. Those are cheap as small repeating tiles, a few kilobytes
   each, shared by every part made of that material. That is a short shopping
   list of flat surfaces, not a photograph of every component.
   ===================================================================== */

/* Textures are built once and shared. Unlike the environment probe, a
   CanvasTexture is not tied to the renderer that first used it — it is
   uploaded per context on demand — so caching this one is safe where
   caching that one was not. */
const CACHE = {};

function canvas(size) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  return c;
}

/* A repeatable pseudo-random, so a board looks the same every time it is
   drawn. A texture that reshuffles on every render is a texture a student
   cannot use as a landmark. */
function rng(seed) {
  let s = seed >>> 0 || 1;
  return function () {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

/* ---------------------------------------------------------------------
   PRINTED CIRCUIT BOARD

   Solder mask over a fibreglass weave, a ground pour, signal traces that
   turn at forty-five degrees the way real routing does, via holes, pads,
   and silkscreen outlines. Drawn twice over: once in colour, and once as
   height, so the copper stands proud of the mask and catches the light.
   --------------------------------------------------------------------- */
function pcb(size, seed) {
  const col = canvas(size), hi = canvas(size);
  const x = col.getContext("2d"), h = hi.getContext("2d");
  const r = rng(seed || 7);

  x.fillStyle = "#0d3b2a"; x.fillRect(0, 0, size, size);
  h.fillStyle = "#808080"; h.fillRect(0, 0, size, size);

  /* The glass weave under the mask. Barely visible, and the reason a real
     board never looks like flat paint. */
  x.globalAlpha = 0.06;
  for (let i = 0; i < size; i += 6) {
    x.fillStyle = i % 12 ? "#ffffff" : "#000000";
    x.fillRect(i, 0, 3, size);
    x.fillRect(0, i, size, 3);
  }
  x.globalAlpha = 1;

  /* Ground pour: a lighter field with a hatched edge, which is what most of
     a board's area actually is. */
  x.fillStyle = "#12523a";
  x.fillRect(size * 0.04, size * 0.04, size * 0.92, size * 0.92);

  /* Signal traces. Forty-five degree turns, tracked in the height map too so
     the copper sits above the mask. */
  const trace = (w, colr, hcol) => {
    x.strokeStyle = colr; x.lineWidth = w; x.lineCap = "round"; x.lineJoin = "round";
    h.strokeStyle = hcol; h.lineWidth = w; h.lineCap = "round"; h.lineJoin = "round";
    for (let n = 0; n < 46; n++) {
      let px = r() * size, py = r() * size;
      x.beginPath(); h.beginPath();
      x.moveTo(px, py); h.moveTo(px, py);
      const segs = 2 + Math.floor(r() * 4);
      for (let s = 0; s < segs; s++) {
        const len = size * (0.05 + r() * 0.18);
        const dir = Math.floor(r() * 8) * (Math.PI / 4);
        px += Math.cos(dir) * len; py += Math.sin(dir) * len;
        x.lineTo(px, py); h.lineTo(px, py);
      }
      x.stroke(); h.stroke();
    }
  };
  trace(Math.max(1, size / 256), "#2f7a58", "#8d8d8d");
  trace(Math.max(2, size / 150), "#b8873f", "#a8a8a8");

  /* Pads and vias. */
  for (let n = 0; n < 150; n++) {
    const px = r() * size, py = r() * size, rad = size * (0.004 + r() * 0.008);
    x.fillStyle = "#c79a4a";
    x.beginPath(); x.arc(px, py, rad, 0, 6.284); x.fill();
    h.fillStyle = "#b4b4b4";
    h.beginPath(); h.arc(px, py, rad, 0, 6.284); h.fill();
    if (r() > 0.45) {                       // a via has a hole through it
      x.fillStyle = "#08251b";
      x.beginPath(); x.arc(px, py, rad * 0.45, 0, 6.284); x.fill();
      h.fillStyle = "#4a4a4a";
      h.beginPath(); h.arc(px, py, rad * 0.45, 0, 6.284); h.fill();
    }
  }

  /* Silkscreen: component outlines and a designator beside each. White,
     slightly raised, and the thing that most makes a board look printed. */
  x.strokeStyle = "#dfe6e2"; x.fillStyle = "#dfe6e2";
  x.lineWidth = Math.max(1, size / 340);
  h.strokeStyle = "#8f8f8f"; h.lineWidth = x.lineWidth;
  x.font = "600 " + Math.round(size / 42) + "px ui-monospace, monospace";
  const tag = ["R", "C", "U", "L", "Q", "D"];
  for (let n = 0; n < 26; n++) {
    const px = r() * size * 0.9, py = r() * size * 0.9;
    const w = size * (0.03 + r() * 0.10), hh = size * (0.02 + r() * 0.06);
    x.strokeRect(px, py, w, hh);
    h.strokeRect(px, py, w, hh);
    x.fillText(tag[Math.floor(r() * tag.length)] + (1 + Math.floor(r() * 99)),
      px, Math.max(size / 40, py - size / 120));
  }

  return { color: col, height: hi };
}

/* ---------------------------------------------------------------------
   BRUSHED METAL — drawn lines running one way, which is the whole reason
   an aluminium cover looks different from a painted one under a light.
   --------------------------------------------------------------------- */
function brushed(size, seed) {
  const col = canvas(size), hi = canvas(size);
  const x = col.getContext("2d"), h = hi.getContext("2d");
  const r = rng(seed || 11);
  x.fillStyle = "#f2f2f2"; x.fillRect(0, 0, size, size);
  h.fillStyle = "#808080"; h.fillRect(0, 0, size, size);
  for (let n = 0; n < size * 9; n++) {
    const py = r() * size, len = size * (0.05 + r() * 0.55), px = r() * size;
    const v = 0.5 + r() * 0.5;
    x.strokeStyle = "rgba(255,255,255," + (0.05 * v) + ")";
    h.strokeStyle = "rgba(255,255,255," + (0.10 * v) + ")";
    x.lineWidth = h.lineWidth = Math.max(1, size / 512);
    x.beginPath(); x.moveTo(px, py); x.lineTo(px + len, py + (r() - 0.5)); x.stroke();
    h.beginPath(); h.moveTo(px, py); h.lineTo(px + len, py + (r() - 0.5)); h.stroke();
    if (r() > 0.7) {
      x.strokeStyle = "rgba(0,0,0,0.05)";
      x.beginPath(); x.moveTo(px, py + 1); x.lineTo(px + len, py + 1); x.stroke();
    }
  }
  return { color: col, height: hi };
}

/* ---------------------------------------------------------------------
   MOULDED PLASTIC — the fine pebble finish on a printer shell or a laptop
   base, which is what stops a moulding reading as a painted block.
   --------------------------------------------------------------------- */
function moulded(size, seed) {
  const col = canvas(size), hi = canvas(size);
  const x = col.getContext("2d"), h = hi.getContext("2d");
  const r = rng(seed || 23);
  x.fillStyle = "#efefef"; x.fillRect(0, 0, size, size);
  h.fillStyle = "#808080"; h.fillRect(0, 0, size, size);
  /* Few enough, and big enough, to survive being minified on screen. The
     first pass used specks smaller than a pixel at four times the repeat,
     which aliased into television static and made a keyboard look like
     sandpaper. A moulding is a soft pebble, not noise. */
  /* Small and faint. A pebble finish on ABS is nearly invisible at the
     distance this bench is viewed from, and that is not a shortcoming to
     compensate for — it is what the material looks like. Two passes at
     making it VISIBLE produced television static and then camouflage. What
     it should do is stop a moulding reading as flat paint, and nothing
     more; the parts that carry information are printed, not grained. */
  for (let n = 0; n < size * 16; n++) {
    const px = r() * size, py = r() * size, rad = size * (0.0015 + r() * 0.0035);
    const up = r() > 0.5;
    /* RELIEF ONLY. Point noise in a colour map cannot survive being
       minified: at bench distance each speck falls below a pixel and the
       filter turns it into crawling static. Four attempts at tuning the
       colour speckle produced static, then camouflage, then static again.
       The same noise in the HEIGHT map costs nothing — it perturbs the
       specular a little and disappears cleanly when it gets small, which is
       exactly what a real pebble finish does. */
    h.fillStyle = up ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.09)";
    h.beginPath(); h.arc(px, py, rad, 0, 6.284); h.fill();
  }
  return { color: col, height: hi };
}

/* ---------------------------------------------------------------------
   RUBBER — a roller or a platen. Matte, faintly grained, and where it has
   been worn it goes shiny rather than changing colour, which is the tell a
   technician is looking for on a pickup tyre.
   --------------------------------------------------------------------- */
function rubber(size, seed) {
  const col = canvas(size), hi = canvas(size);
  const x = col.getContext("2d"), h = hi.getContext("2d");
  const r = rng(seed || 31);
  x.fillStyle = "#efefef"; x.fillRect(0, 0, size, size);
  h.fillStyle = "#808080"; h.fillRect(0, 0, size, size);
  for (let n = 0; n < size * 18; n++) {
    const px = r() * size, py = r() * size, rad = size * (0.0012 + r() * 0.003);
    const up = r() > 0.5;
    h.fillStyle = up ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)";
    h.beginPath(); h.arc(px, py, rad, 0, 6.284); h.fill();
  }
  /* Fine circumferential lines, the moulding marks on a roller. */
  for (let n = 0; n < 90; n++) {
    const py = r() * size;
    x.strokeStyle = "rgba(0,0,0,0.05)"; x.lineWidth = Math.max(1, size / 512);
    x.beginPath(); x.moveTo(0, py); x.lineTo(size, py); x.stroke();
  }
  return { color: col, height: hi };
}

/* ---------------------------------------------------------------------
   ANODISED — black that still has a surface. Flat black paint in a render
   reads as a hole; anodised aluminium has a fine sheen and a grain, and
   that is the difference between a hinge and a black rectangle.
   --------------------------------------------------------------------- */
function anodised(size, seed) {
  const col = canvas(size), hi = canvas(size);
  const x = col.getContext("2d"), h = hi.getContext("2d");
  const r = rng(seed || 41);
  x.fillStyle = "#f0f0f0"; x.fillRect(0, 0, size, size);
  h.fillStyle = "#808080"; h.fillRect(0, 0, size, size);
  for (let n = 0; n < size * 12; n++) {
    const py = r() * size, len = size * (0.02 + r() * 0.30), px = r() * size;
    x.strokeStyle = "rgba(255,255,255," + (0.02 + r() * 0.03) + ")";
    h.strokeStyle = "rgba(255,255,255," + (0.05 + r() * 0.06) + ")";
    x.lineWidth = h.lineWidth = Math.max(1, size / 512);
    x.beginPath(); x.moveTo(px, py); x.lineTo(px + len, py); x.stroke();
    h.beginPath(); h.moveTo(px, py); h.lineTo(px + len, py); h.stroke();
  }
  return { color: col, height: hi };
}

/* ---------------------------------------------------------------------
   PAINTED STEEL — a case panel, a rack rail, a supply shell. Industrial
   paint over metal: slightly orange-peeled, never glossy, and carrying the
   handling marks that every machine in service has.
   --------------------------------------------------------------------- */
function steel(size, seed) {
  const col = canvas(size), hi = canvas(size);
  const x = col.getContext("2d"), h = hi.getContext("2d");
  const r = rng(seed || 53);
  x.fillStyle = "#f2f2f2"; x.fillRect(0, 0, size, size);
  h.fillStyle = "#808080"; h.fillRect(0, 0, size, size);
  for (let n = 0; n < size * 12; n++) {
    const px = r() * size, py = r() * size, rad = size * (0.002 + r() * 0.005);
    const up = r() > 0.5;
    h.fillStyle = up ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.14)";
    h.beginPath(); h.arc(px, py, rad, 0, 6.284); h.fill();
  }
  for (let n = 0; n < 34; n++) {              // scuffs from handling
    const px = r() * size, py = r() * size, len = size * (0.02 + r() * 0.12);
    const a = r() * 6.284;
    x.strokeStyle = "rgba(255,255,255,0.06)";
    x.lineWidth = Math.max(1, size / 400);
    x.beginPath(); x.moveTo(px, py);
    x.lineTo(px + Math.cos(a) * len, py + Math.sin(a) * len); x.stroke();
  }
  return { color: col, height: hi };
}

/* ---------------------------------------------------------------------
   LABEL — the printed sticker on a drive, a supply, a UPS.

   This is the one that pays for the whole procedural approach. The lines
   come from the ticket, so the capacity on the drive is the capacity that
   ticket generated and the wattage on the supply is the one the paperwork
   claims. A student reads a spec off the part the way they would on a
   bench, and there is no second copy of that number to drift out of step.
   --------------------------------------------------------------------- */
function label(size, seed, spec) {
  const col = canvas(size), hi = canvas(size);
  const x = col.getContext("2d"), h = hi.getContext("2d");
  const r = rng(seed || 61);
  const lines = (spec && spec.lines) || [];

  x.fillStyle = "#d8d5cc"; x.fillRect(0, 0, size, size);
  h.fillStyle = "#808080"; h.fillRect(0, 0, size, size);
  /* Paper tooth. */
  for (let n = 0; n < size * 10; n++) {
    const px = r() * size, py = r() * size;
    x.fillStyle = r() > 0.5 ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.04)";
    x.fillRect(px, py, 1, 1);
  }
  /* The printed block. Deliberately dark on pale: this is text on a part a
     student is being asked to read, so it holds the same contrast the rest
     of the build does rather than whatever looks photogenic. */
  x.fillStyle = "#1a1c1e";
  const pad = size * 0.09;
  let y = pad + size * 0.10;
  lines.forEach(function (ln, i) {
    const big = i === 0;
    x.font = (big ? "700 " : "400 ") + Math.round(size * (big ? 0.115 : 0.075)) +
      "px ui-monospace, Menlo, Consolas, monospace";
    x.fillText(String(ln).slice(0, 22), pad, y);
    y += size * (big ? 0.155 : 0.105);
  });
  /* A barcode block, because every one of these has one and its absence is
     more noticeable than its presence. */
  const by = size * 0.74;
  let bx = pad;
  while (bx < size - pad) {
    const w = size * (0.004 + r() * 0.012);
    if (r() > 0.35) { x.fillStyle = "#1a1c1e"; x.fillRect(bx, by, w, size * 0.14); }
    bx += w + size * 0.006;
  }
  /* The sticker sits proud of what it is stuck to. */
  h.fillStyle = "#9a9a9a";
  h.fillRect(size * 0.02, size * 0.02, size * 0.96, size * 0.96);
  return { color: col, height: hi };
}

/* TWO KINDS OF SURFACE, and confusing them is what turned a black keyboard
   into grey gravel on the first render.

   A PRINTED surface carries its own colour — a board is green with copper
   on it, a label is off-white with black text — so it replaces the part's
   colour entirely.

   A MATERIAL GRAIN carries no colour at all. Brushing, pebble, rubber
   tooth: these are near-white patterns that MULTIPLY over whatever colour
   the part already is, so a black keyboard stays black and gains a
   moulding texture, instead of becoming a grey speckled slab.

   `repeat` is how many times the tile lands per WORLD UNIT, and the parts
   here are ten to twenty units across. Numbers above one therefore put the
   tile down sixteen times over a keyboard, which drove the speckle below a
   pixel and turned a moulding into television static — twice, because the
   first correction made the specks bigger without fixing the repeat. Two
   to four tiles across a part is the range that reads. */
/* WHAT IS ACTUALLY IN USE, AND WHY THE REST IS NOT.

   pcb, label, brushed and anodised are applied to parts today. What they
   have in common is that their detail is STRUCTURED and mostly LINEAR —
   traces, silkscreen, printed text, drawn brushing lines. Structure of that
   kind minifies cleanly: as it gets smaller it blurs toward the average and
   still reads as what it is.

   moulded, rubber and steel are painted here and applied to nothing. Their
   detail is point noise — a pebble finish, rubber tooth, orange peel — and
   point noise does not minify. At the distance this bench is viewed from
   each speck falls below a pixel and the filter turns it into crawling
   static. I tuned it five times: static, then camouflage, then static
   again, then static from the relief map alone once the colour noise was
   removed. It is not a tuning problem.

   This is exactly the line drawn in the header: code generates structure,
   photographs carry material grain. These three are left painted and unused
   so they can be swapped for photographic tiles the moment those exist —
   the shot list is in tools/PHOTO-SHOT-LIST.md — rather than deleted and
   rebuilt from nothing. */
const PAINTERS = {
  pcb:      { paint: pcb,      printed: true,  repeat: 0.42 },
  label:    { paint: label,    printed: true,  repeat: 0.30 },
  brushed:  { paint: brushed,  printed: false, repeat: 0.22 },
  moulded:  { paint: moulded,  printed: false, repeat: 0.35 },
  rubber:   { paint: rubber,   printed: false, repeat: 0.60 },
  anodised: { paint: anodised, printed: false, repeat: 0.20 },
  steel:    { paint: steel,    printed: false, repeat: 0.30 }
};

/* Build (or fetch) a surface. Returns { map, normalMap } ready to hang on a
   material, or null for a name nobody has painted — which throws, rather
   than silently drawing a part flat and leaving somebody to wonder why one
   board out of fourteen looks wrong. */
/* ---------------------------------------------------------------------
   HOW BIG TO PAINT

   The machines this runs on are a mixture: some are current, some are
   school-issue laptops several years old on integrated graphics. Guessing
   from the user agent is guessing; core count is a proxy for the wrong
   thing. So MEASURE, once, on the actual machine, with the actual work —
   paint one small tile and time it. A laptop that takes a long time over a
   128-pixel square is going to struggle with a 1024-pixel one, and this
   costs a couple of milliseconds to find out.

   The floor is deliberately not tiny. Dropping to 128 would make the
   silkscreen on a board unreadable, and an unreadable label is worse than
   no label — so a slow machine gets 256 and a plainer surface rather than
   a blurred one. */
let BUDGET = 0;
function textureSize() {
  if (BUDGET) return BUDGET;
  let ms = 0;
  try {
    const t0 = (window.performance && performance.now) ? performance.now() : Date.now();
    moulded(128, 3);
    const t1 = (window.performance && performance.now) ? performance.now() : Date.now();
    ms = t1 - t0;
  } catch (e) { ms = 99; }
  BUDGET = ms > 24 ? 256 : (ms > 7 ? 512 : 1024);
  return BUDGET;
}

/* What the machine settled on, so the verifier can report it rather than
   nobody ever knowing which tier a class is actually getting. */
export function textureTier() {
  return { size: textureSize() };
}

export function surface(name, THREE, size, seed, spec) {
  if (!name) return null;
  const px = size || textureSize();
  const key = name + ":" + px + ":" + (seed || 0) + ":" +
    (spec && spec.lines ? spec.lines.join("|") : "");
  if (CACHE[key]) return CACHE[key];
  const def = PAINTERS[name];
  if (!def) {
    throw new Error('surface: "' + name + '" is not a surface anybody has painted. ' +
      "Add it to PAINTERS in assets/surface.js, or take it off the part.");
  }
  const built = def.paint(px, seed, spec);
  const map = new THREE.CanvasTexture(built.color);
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  /* How many times the tile lands per world unit. Set here rather than on
     the part, because it belongs to the material: brushing is fine and
     silkscreen is coarse whatever they are wrapped around. */
  map.repeat.set(def.repeat, def.repeat);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;
  /* The height image is used as a normal map. Three.js will read it as one
     directly; the greys are already centred on 128 so a flat area reads as
     "pointing straight out". */
  const normalMap = new THREE.CanvasTexture(built.height);
  normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
  normalMap.repeat.set(def.repeat, def.repeat);
  normalMap.anisotropy = 8;
  CACHE[key] = { map: map, normalMap: normalMap,
    printed: !!def.printed, repeat: def.repeat };
  return CACHE[key];
}

/* Does this surface carry its own colour, or does it multiply over the
   part's? Two places need the answer — the material and the selection
   colour it resets to — and when only one of them knew, every textured part
   came back white the moment the scene restyled itself. */
export function isPrinted(name) {
  var n = name && name.kind ? name.kind : name;
  return !!(n && PAINTERS[n] && PAINTERS[n].printed);
}

export const SURFACES = Object.keys(PAINTERS);
