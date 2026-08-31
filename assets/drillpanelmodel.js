/* =====================================================================
   Field Service Center — the section for objective 3.1

   A display drawn in cross-section, layer by layer, cut through and lying
   on its side so you can count what is in it.

   THIS IS THE ONE MODEL IN THE BUILD WHERE THE OBJECT IS USELESS. Every
   display in this pool is a black rectangle from the front and they are
   indistinguishable — which is exactly why "compare and contrast display
   components" is hard to teach from a photograph. Cut one in half and the
   whole objective is visible in three seconds: how many layers, and which
   one of them is producing light.

   So the section is drawn edge-on with the layers stacked back to front,
   and the light source is its own part in its own colour, positioned where
   it actually is:

     - behind everything, across the whole back
     - along one edge only, with a guide spreading it
     - in a grid across the back, in zones
     - in the pixels themselves, with nothing behind them at all
     - out of a lens, onto a surface across the room
     - nowhere, because two things in this pool are layers in front of a
       display and produce nothing

   And the LIGHT PATH is drawn as rays, so that where the light starts and
   what it has to pass through is a picture rather than a sentence.

   NOTHING IS LABELLED. No layer names in the geometry, no numbers.
   ===================================================================== */

const P2 = Math.PI / 2;

const BOARD = { w: 14, d: 8.0 };

/* The section stands on the bench, cut face toward the camera. Layers are
   stacked along Z, front of the display at +Z. */
const H = 3.6;            // how tall the cut panel is
const LW = 5.2;           // how wide the cut is
const BASE = 0.35;        // the plinth it stands on

function slab(z, thick, shade, tag) {
  var p = { shape: "box", size: [LW, H, thick], pos: [0, BASE + H / 2, z], r: 0.02, shade: shade,
    stackLayer: 1 };
  if (tag) p[tag] = 1;
  return p;
}

/* The layers in FRONT of the light-controlling layer are drawn over half the
   width only, so the section is a genuine cutaway and you can see into it.
   Without this the ray that gets blocked part-way — which is the entire
   mechanism of a liquid-crystal panel, since the crystal blocks light and
   never makes any — was hidden behind the layers in front of it, and the one
   thing the model existed to show could not be seen. */
function halfSlab(z, thick, shade, tag) {
  var p = { shape: "box", size: [LW / 2, H, thick], pos: [LW / 4, BASE + H / 2, z], r: 0.02,
    shade: shade, stackLayer: 1 };
  if (tag) p[tag] = 1;
  return p;
}

/* How many full-width layers are actually in the section. Counted from the
   geometry rather than from the prose beside it: the `layers` field on each
   item is a description in four or five phrases, and an earlier version
   printed the length of that array as though it were a count of what had
   been drawn. It was not — the liquid-crystal stack is described in four
   phrases and drawn as seven slabs, and a student counting the picture would
   have found the panel lying to them. */
function countLayers(a, b) {
  return a.concat(b).filter(function (p) { return p.stackLayer; }).length;
}

/* A ray of light, drawn as a thin bar from where it starts to where it goes.
   Rays are the one thing on this model that are not a component, and they
   are what turns "where does the light come from" from a sentence into a
   thing you can see. */
function ray(from, to, shade) {
  var dx = to[0] - from[0], dy = to[1] - from[1], dz = to[2] - from[2];
  var len = Math.sqrt(dx * dx + dy * dy + dz * dz);
  return {
    shape: "box", size: [0.09, 0.09, len],
    pos: [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2],
    rot: [Math.atan2(dy, Math.sqrt(dx * dx + dz * dz)), Math.atan2(dx, dz), 0],
    r: 0.03, shade: shade === undefined ? 1.0 : shade, lightRay: 1
  };
}

/* ---------------------------------------------------------------------
   The stack, per item. Returns the passive layers, the light source, and
   the rays showing what the light has to get through.
   --------------------------------------------------------------------- */
function build(it) {
  var layers = [], source = [], rays = [], extra = [];
  var i, j;

  if (it.kind === "lcd") {
    /* Back to front: the lamp, a diffuser, the crystal, and a polariser on
       each side of it. Five slabs, and the same five whichever LCD it is —
       because the difference between them is inside the crystal layer and
       is genuinely NOT visible in a section. That is worth a student
       knowing rather than being lied to about. */
    source.push(slab(-1.5, 0.34, 1.0, "backlight"));
    for (i = 0; i < 7; i++) {
      source.push({ shape: "cyl", size: [0.4, 0.16], pos: [-2.1 + i * 0.7, BASE + H / 2, -1.5],
        rot: [P2, 0, 0], seg: 12, shade: 1.4 });
    }
    layers.push(slab(-1.0, 0.22, 0.62));           // reflector behind
    layers.push(slab(-0.55, 0.2, 0.9));            // diffuser
    layers.push(slab(-0.18, 0.14, 1.35));          // rear polariser
    layers.push(slab(0.2, 0.4, 0.55, "crystal"));  // the crystal layer
    layers.push(halfSlab(0.62, 0.14, 1.35));       // front polariser, cut away
    layers.push(halfSlab(0.9, 0.16, 1.15));        // cover, cut away
    /* Rays from the lamp forward through everything, and one of them
       stopped at the crystal, because that is the whole mechanism: the
       crystal blocks light, it never makes any. */
    for (i = 0; i < 5; i++) {
      var ry = BASE + 0.5 + i * 0.65;
      /* One of them stops at the crystal, in the cut-away half where you can
         watch it stop rather than having to take it on trust. */
      rays.push(ray([-1.3, ry, -1.3], [-1.3, ry, i === 1 ? 0.2 : 2.6], i === 1 ? 0.55 : 1.0));
    }
  } else if (it.kind === "emissive") {
    /* Two layers, and nothing behind them. The empty space where a lamp
       would be is drawn as an empty space and that is the point. */
    source.push(slab(0.1, 0.34, 1.0, "emissive"));
    /* Six rows of pixels, one of which is showing black — which on this stack
       means switched off rather than closed, so nothing comes out of it at
       all. The row and the missing ray are drawn at the same height on
       purpose: they are the same fact seen twice. */
    for (i = 0; i < 7; i++) {
      for (j = 0; j < 6; j++) {
        source.push({ shape: "box", size: [0.3, 0.34, 0.4],
          pos: [-2.1 + i * 0.7, BASE + 0.45 + j * 0.55, 0.1], r: 0.03,
          shade: j === 2 ? 0.3 : 1.5 });
      }
    }
    layers.push(halfSlab(0.5, 0.16, 1.15));
    /* A ray from each lit pixel, and none at all from the ones switched
       off — which is what "black is black" looks like drawn. */
    /* One ray per row of pixels — except the rows with a pixel switched off,
       which have none at all. A place producing nothing is drawn as a place
       with nothing coming out of it, which is what black actually is here. */
    for (i = 0; i < 6; i++) {
      if (i === 2) continue;
      var ey = BASE + 0.45 + i * 0.55;
      rays.push(ray([-1.3, ey, 0.3], [-1.3, ey, 2.4], 1.0));
    }
  } else if (it.kind === "backlight") {
    /* Read from the item, not from its name. A backlight that says it lights
        the whole back gets drawn lighting the whole back. */
    var edge = !it.array;
    if (edge) {
      /* Emitters along the top edge only, with a guide carrying the light
         down behind the panel. For the fluorescent one it is a single tube
         rather than a row, and there is a board beside it. */
      if (it.key === "inverter") {
        source.push({ shape: "cyl", size: [0.42, LW - 0.6], pos: [0, BASE + H - 0.3, -1.2],
          rot: [0, 0, P2], seg: 16, shade: 1.0, tube: 1 });
        extra.push({ shape: "rbox", size: [1.6, 0.7, 0.5], pos: [-3.4, BASE + 0.45, -1.2],
          r: 0.04, shade: 1.0, board: 1 });
        extra.push({ shape: "box", size: [0.06, 0.06, 0.06], pos: [-3.4, BASE + 0.45, -0.9],
          shade: 1.5, repeat: { count: 2, step: [0.3, 0, 0] } });
        /* the two fine wires up to the tube, which is what a technician
           actually recognises this by */
        [-0.4, 0.4].forEach(function (dx) {
          extra.push({ shape: "box", size: [0.07, H - 0.9, 0.07],
            pos: [-3.4 + dx, BASE + H / 2 - 0.1, -1.2], r: 0.03, shade: 1.35 });
        });
      } else {
        for (i = 0; i < 7; i++) {
          source.push({ shape: "box", size: [0.4, 0.3, 0.34],
            pos: [-2.1 + i * 0.7, BASE + H - 0.25, -1.2], r: 0.03, shade: 1.0, emitter: 1 });
        }
      }
      /* the guide: a clear sheet the light travels down */
      layers.push(slab(-1.2, 0.36, 1.35, "guide"));
      /* rays going DOWN the guide, then turning forward — uneven on
         purpose, brighter at the top than the bottom */
      /* Down the guide from the emitters at the top, then out through the
          panel at four heights — dimmer the further it has had to travel,
          which is the unevenness this kind is bought with. */
      rays.push(ray([-1.3, BASE + H - 0.4, -1.2], [-1.3, BASE + 0.4, -1.2], 1.0));
      [0.9, 0.68, 0.45, 0.22].forEach(function (f, k) {
        rays.push(ray([-1.3, BASE + H * f, -1.05], [-1.3, BASE + H * f, 2.4], 1.3 - k * 0.28));
      });
    } else {
      /* A grid of emitters across the whole back, in zones. HOW MANY and
         HOW SMALL come from the item, because the difference between an
         ordinary full-array backlight and the fine sort IS the count — many
         more, much smaller, in more zones — and drawing them identically
         would put the entire distinction in the prose. */
      var cols = it.fine ? 14 : 7, rows = it.fine ? 6 : 3;
      var zones = it.zones || 1;
      var eW = it.fine ? 0.22 : 0.46, xStep = 4.2 / (cols - 1), yStep = 2.7 / rows;
      var dark = zones > 1 ? 0 : -1;   // one zone dimmed, where there is more than one
      for (i = 0; i < cols; i++) {
        for (j = 0; j < rows; j++) {
          var zone = Math.floor(j * zones / rows);
          source.push({ shape: "box", size: [eW, eW, 0.34],
            pos: [-2.1 + i * xStep, BASE + 0.7 + j * yStep, -1.5], r: 0.04,
            shade: zone === dark ? 0.35 : 1.0, emitter: 1 });
        }
      }
      /* the zone boundaries, which is what makes it dimmable in parts */
      for (i = 1; i < zones; i++) {
        extra.push({ shape: "box", size: [LW - 0.4, 0.06, 0.4],
          pos: [0, BASE + 0.7 + (i * rows / zones) * yStep - yStep / 2, -1.5], shade: 0.5 });
      }
      /* One ray per zone, and none at all out of the zone whose emitters
         are switched down — which is what dimming part of the picture looks
         like, and why a bright object on a dark background haloes. */
      for (j = 1; j < 3; j++) {
        rays.push(ray([-1.3, BASE + 0.9 + j * 0.9, -1.3], [-1.3, BASE + 0.9 + j * 0.9, 2.4], 1.0));
        rays.push(ray([-1.3, BASE + 0.5 + j * 0.9, -1.3], [-1.3, BASE + 0.5 + j * 0.9, 2.4], 1.0));
      }
    }
    layers.push(slab(-0.55, 0.2, 0.9));
    layers.push(slab(0.1, 0.5, 0.55, "crystal"));
    layers.push(halfSlab(0.62, 0.16, 1.15));
  } else if (it.kind === "projector") {
    /* No panel at all. A lamp in a box, whatever is in the path, a lens,
       and the image on a surface across the board. */
    source.push({ shape: "cyl", size: [0.9, 0.9], pos: [-4.4, BASE + 1.2, 0], rot: [0, 0, P2],
      seg: 20, shade: 1.0, lamp: 1 });
    source.push({ shape: "rbox", size: [1.1, 1.5, 1.6], pos: [-4.4, BASE + 1.2, 0], r: 0.06,
      shade: 0.55 });
    if (it.key === "dlp") {
      /* A wheel that spins, and a chip covered in mirrors. */
      layers.push({ shape: "cyl", size: [1.8, 0.14], pos: [-2.6, BASE + 1.2, 0], rot: [0, 0, P2],
        seg: 28, shade: 1.0, wheel: 1 });
      for (i = 0; i < 6; i++) {
        layers.push({ shape: "box", size: [0.1, 0.85, 0.1],
          pos: [-2.6, BASE + 1.2 + Math.cos(i * 1.05) * 0.45, Math.sin(i * 1.05) * 0.45],
          rot: [i * 1.05, 0, 0], shade: 0.5 });
      }
      layers.push({ shape: "box", size: [0.3, 1.1, 1.1], pos: [-1.2, BASE + 1.2, 0], r: 0.02,
        shade: 1.4, chip: 1 });
      for (i = 0; i < 5; i++) {
        for (j = 0; j < 5; j++) {
          layers.push({ shape: "box", size: [0.08, 0.16, 0.16],
            pos: [-1.03, BASE + 0.75 + i * 0.22, -0.45 + j * 0.22],
            rot: [0, 0, (i + j) % 2 ? 0.3 : -0.3], shade: 0.4 });
        }
      }
    } else {
      /* Three small panels and a prism that puts them back together. */
      [-0.5, 0, 0.5].forEach(function (dz, k) {
        layers.push({ shape: "box", size: [0.16, 1.0, 0.7], pos: [-2.6, BASE + 1.2, dz * 1.5],
          r: 0.02, shade: 0.55 + k * 0.3, subpanel: 1 });
      });
      layers.push({ shape: "box", size: [0.9, 0.9, 0.9], pos: [-1.2, BASE + 1.2, 0],
        rot: [0, 0.78, 0], r: 0.02, shade: 1.45, prism: 1 });
    }
    layers.push({ shape: "cyl", size: [1.1, 0.7], pos: [0, BASE + 1.2, 0], rot: [0, 0, P2], seg: 24,
      shade: 1.3, lens: 1 });
    /* the surface it is thrown onto, at the far end of the bench */
    extra.push({ shape: "box", size: [0.3, 3.6, 5.0], pos: [5.6, BASE + 1.6, 0], r: 0.03,
      shade: 1.0, surface: 1 });
    /* the beam: converging through the machine, then spreading out */
    for (i = 0; i < 4; i++) {
      var t = -0.55 + i * 0.37;
      rays.push(ray([-3.9, BASE + 1.2 + t * 0.7, t * 0.7], [-0.5, BASE + 1.2, 0], 1.0));
      rays.push(ray([0.5, BASE + 1.2, 0],
        [5.4, BASE + 1.2 + t * 2.4, t * 3.2], 0.85));
    }
  } else {
    /* An overlay: layers in front of, or behind, a display it is not part
       of. The display is drawn in a neutral colour and the overlay is the
       thing being asked about. */
    extra.push(slab(0, 0.6, 1.0, "hostDisplay"));
    /* The light comes from the display this is fitted to, not from the
       overlay — so the rays start at the display and go forward THROUGH
       whatever has been added in front of it. On the one that costs you
       brightness, the ray past the overlay is drawn dimmer than the ray
       before it, which is that weakness as a picture rather than a sentence.

       An earlier version simply drew no rays here at all, on the grounds
       that an overlay produces nothing. That left the part empty, and an
       empty part does not vanish — the scene engine builds a default box at
       the origin instead, which is how a phantom cube ended up half a unit
       under the bench on three items. */
    var dim = it.key === "touchres";
    for (i = 0; i < 4; i++) {
      var oy = BASE + 0.8 + i * 0.7;
      rays.push(ray([-1.3, oy, 0.35], [-1.3, oy, dim ? 1.0 : 2.4], 1.0));
      if (dim) rays.push(ray([-1.3, oy, 1.05], [-1.3, oy, 2.4], 0.5));
    }
    if (it.key === "digitizer") {
      /* Behind the display, which is the whole surprise. */
      source.push(slab(-0.6, 0.22, 1.0, "sensing"));
      for (i = 0; i < 7; i++) {
        source.push({ shape: "box", size: [0.06, H - 0.4, 0.06],
          pos: [-2.1 + i * 0.7, BASE + H / 2, -0.6], shade: 1.5 });
      }
      layers.push(slab(0.45, 0.18, 1.2));
      /* and the pen, standing on the glass */
      layers.push({ shape: "cyl", size: [0.26, 2.4], pos: [1.0, BASE + H / 2 + 0.4, 1.5],
        rot: [0.5, 0, 0.35], seg: 12, shade: 0.55, pen: 1 });
      layers.push({ shape: "cone", size: [0.26, 0.5, 0.04],
        pos: [0.75, BASE + H / 2 - 0.75, 0.9], rot: [0.5, 0, 0.35], seg: 12, shade: 0.4 });
    } else if (it.key === "touchcap") {
      /* A grid of conductors in front, then cover glass. */
      source.push(slab(0.42, 0.14, 1.0, "sensing"));
      for (i = 0; i < 7; i++) {
        source.push({ shape: "box", size: [0.05, H - 0.4, 0.05],
          pos: [-2.1 + i * 0.7, BASE + H / 2, 0.42], shade: 1.5 });
      }
      for (j = 0; j < 3; j++) {
        source.push({ shape: "box", size: [LW - 0.4, 0.05, 0.05],
          pos: [0, BASE + 0.9 + j * 0.9, 0.42], shade: 1.5 });
      }
      layers.push(slab(0.72, 0.22, 1.25));
      /* one finger, touching it */
      layers.push({ shape: "cyl", size: [0.5, 1.6], pos: [1.0, BASE + H / 2 + 0.5, 1.5],
        rot: [0.6, 0, 0.2], seg: 14, shade: 0.6, finger: 1 });
    } else {
      /* Two sheets with a gap, and the top one pressed in. */
      source.push(slab(0.42, 0.1, 1.0, "sensing"));
      source.push(slab(0.66, 0.1, 1.0, "sensing"));
      for (i = 0; i < 6; i++) {
        source.push({ shape: "cyl", size: [0.1, 0.14], pos: [-2.0 + i * 0.8, BASE + 0.6, 0.54],
          rot: [P2, 0, 0], seg: 8, shade: 0.5 });
      }
      layers.push(slab(0.86, 0.12, 1.3));
      /* the top surface flexing where something presses it */
      layers.push({ shape: "cyl", size: [1.1, 0.4], pos: [1.0, BASE + H / 2, 0.86], rot: [0, 0, P2],
        seg: 16, shade: 1.3 });
      layers.push({ shape: "cyl", size: [0.34, 1.8], pos: [1.0, BASE + H / 2 + 0.9, 1.6],
        rot: [0.55, 0, 0.2], seg: 12, shade: 0.5, stylus: 1 });
    }
  }

  return { layers: layers, source: source, rays: rays, extra: extra };
}

/* The plinth the section stands on, and a scale mark at each end so the
   thickness of the stack has something to be thick against. */
function plinth() {
  return [
    { shape: "rbox", size: [LW + 1.2, BASE, 5.0], pos: [0, BASE / 2, 0], r: 0.06, shade: 1.0 },
    { shape: "box", size: [0.1, 0.16, 5.0], pos: [-LW / 2 - 0.4, BASE + 0.08, 0], shade: 0.6 },
    { shape: "box", size: [0.1, 0.16, 5.0], pos: [LW / 2 + 0.4, BASE + 0.08, 0], shade: 0.6 }
  ];
}

const KIND_COLOUR = {
  lcd: "#8d969d",
  emissive: "#8d969d",
  backlight: "#8d969d",
  projector: "#7d8a92",
  overlay: "#8d969d"
};

export function panelSectionModel(D) {
  var it = D.item;
  var made = build(it);

  var sourceLabel = it.kind === "projector" ? "The lamp"
    : it.kind === "emissive" ? "The pixels, which are the light"
    : it.kind === "overlay" ? "The sensing layer"
    : "The light source";
  var sourceNote = it.kind === "overlay"
    ? "Look at which SIDE of the display it is on. Two of the three overlays in this pool sit in " +
      "front of the picture and one sits behind it, and that single fact identifies it — and " +
      "explains why one of them can ignore a hand resting on the glass."
    : "This is the part to find first, every time. Behind everything, along one edge with a guide " +
      "carrying it down, in a grid you can see the zones in, out of a lens, or in the pixels " +
      "themselves with nothing behind them at all. Where it is decides how thick the thing is and " +
      "how black its blacks are, and both of those are on the meter beside it.";

  var parts = [
    { key: "layers", label: it.kind === "projector" ? "What the light passes through"
        : "The layers in front of it",
      build: made.layers, finish: "matte",
      scale: 1, pos: [0, 0, 0], color: KIND_COLOUR[it.kind],
      spec: countLayers(made.layers, made.source) + " full-width layers in the section" +
        (countLayers(made.layers, made.source) === 0
          ? " — there is no panel here at all" : ""),
      note: "Count them from the back forwards. How many layers stand between the light and your " +
        "eye is most of what decides how much light survives the trip — one of these stacks has " +
        "almost nothing in the way, and two of them have no panel in the section whatsoever, " +
        "which is worth noticing before you look at anything else." },
    { key: "source", label: sourceLabel, build: made.source, finish: "matte", scale: 1,
      pos: [0, 0, 0], color: "#c8a24a",
      spec: "Drawn where it actually is in the stack",
      note: sourceNote },
    /* Pale, not amber. The source is amber, and drawing the light it emits in
       a second amber put two swatches side by side in the legend that nobody
       could tell apart — on the one model where "where does the light come
       from" and "where does it go" are two different questions. */
    { key: "rays", label: "Where the light goes", build: made.rays, finish: "matte", scale: 1,
      pos: [0, 0, 0], color: "#f2e6b0",
      spec: made.rays.length + " rays traced through the section",
      note: "Follow one from where it starts to where it leaves. A ray that stops part-way is " +
        "being blocked rather than switched off, and a place with no ray coming out of it at all " +
        "is a place producing nothing — which is not the same thing, and it is the difference " +
        "between grey and black." },
    { key: "plinth", label: "The bench and the section marks", build: plinth(), finish: "matte",
      scale: 1, pos: [0, 0, 0], color: "#5b656d",
      spec: "The same cut, in the same place, on every item",
      note: "The cut is always the same width and always in the same place, so the only thing " +
        "that changes between one item and the next is what is inside it. That is what makes two " +
        "of these comparable at all." }
  ];

  if (made.extra.length) {
    parts.push({ key: "extra", label: it.kind === "projector" ? "What it is thrown onto"
        : it.kind === "overlay" ? "The display it is fitted to"
        : "What drives it", build: made.extra, finish: "matte", scale: 1, pos: [0, 0, 0],
      /* Terracotta, not sage. Sage sat right next to the plinth's slate in
         the legend and the two swatches were not distinguishable — the same
         class of defect as the amber-on-amber above, found the same way. */
      color: "#a8623f",
      spec: it.kind === "projector" ? "A surface across the room"
        : it.kind === "overlay" ? "The panel underneath, drawn plainly"
        : "The board that runs the light source",
      note: it.kind === "projector"
        ? "There is no panel anywhere on this device. The picture is on something else entirely, " +
          "which is the reason it can be any size and the reason it needs the lights turned down."
        : it.kind === "overlay"
        ? "Drawn plainly on purpose: WHICH display is underneath is not the question. What is in " +
          "front of it, or behind it, is."
        : "Not every light source runs off the same supply as everything else. Look at what is " +
          "beside this one and at how many wires go up to it, and think about what is still in " +
          "that board after the machine is switched off." });
  }

  return {
    kind: "drill",
    title: "One display, cut through",
    caption: "Every display in this pool is a black rectangle from the front, so the front is no " +
      "use. This is a section: the same cut in the same place every time, with the layers stacked " +
      "back to front and the light drawn as rays. Find the light first — behind, along one edge, " +
      "in a grid, in the pixels, out of a lens, or nowhere at all — then count what stands in " +
      "front of it, and read the meter beside the bench.",
    board: { size: [BOARD.w, 0.4, BOARD.d], pos: [0, -0.2, 0], color: "#3b434a",
      build: [{ shape: "rbox", size: [BOARD.w, 0.4, BOARD.d], pos: [0, 0, 0], r: 0.12, shade: 1.0 }],
      scale: 1 },
    parts: parts,
    _layers: countLayers(made.layers, made.source),
    _rays: made.rays.length,
    _kind: it.kind,
    camera: { dist: 11.0, yaw: 1.24, pitch: 0.26, target: [0, 1.9, 0], min: 4, max: 26 }
  };
}
