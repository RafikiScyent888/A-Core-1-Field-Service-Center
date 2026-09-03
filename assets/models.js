/* =====================================================================
   Field Service Center — the models

   Pure data. Every function here takes a ticket and returns a list of
   parts: what each one is, where it sits, and what a technician sees when
   they look at it. No graphics context, no DOM, so all of it can be tested
   at a node prompt like the rest of the build.

   Two rules carried over from the instrument suite, because they are what
   make the noise honest:

   1. Every part gets a note, and most notes describe ordinary wear that
      means nothing. Dust, a scuffed panel, a missing cable tie. Telling
      "used" from "failed" is the skill; a model where only the broken part
      has anything written next to it teaches nobody anything.

   2. A fault that is genuinely visible is genuinely visible. A dead CPU fan
      can be seen. A marginal memory module cannot, and no amount of looking
      will change that. That asymmetry is the lesson — look first because it
      is free, and when looking does not answer it, go to the bench.
   ===================================================================== */

import { mulberry32, noArticle } from "./ticket.js";
import { damage } from "./damage.js";

function R(seed) {
  var f = mulberry32(seed >>> 0);
  return {
    int: function (a, b) { return a + Math.floor(f() * (b - a + 1)); },
    pick: function (a) { return a[Math.floor(f() * a.length)]; }
  };
}

/* Ordinary, meaningless wear. Drawn per part so two tickets do not read
   identically, and never applied to the part that is actually at fault. */
const WEAR = [
  "Dusty, but nothing obstructed.",
  "Scuffed from handling. Cosmetic.",
  "A cable tie has been cut off at some point and not replaced.",
  "Fingerprints on it. Somebody has been in here before.",
  "Seated correctly, latches engaged.",
  "Clean. Nothing to report.",
  "Faded label. Still legible.",
  "A little lint on the edge of it."
];

function wear(seed, i) { return R(seed + i * 31).pick(WEAR); }

/* ---------------------------------------------------------------------
   Colour says what a part IS, never whether it is broken.

   The first cut of this file tinted the faulty part on every ticket, and a
   screenshot gave the game away in about a second: you could skip the
   evidence entirely and click the one that was a different colour. That is
   the opposite of the exercise.

   So the palette is a legend — memory is green board, SATA cables are red,
   coin cells are bright metal, supplies are matt black — the same on every
   ticket whatever is wrong with it. Parts are recognisable, and recognising
   them is worth something on its own.

   The single exception is a fault a technician would genuinely see standing
   in front of the machine: a fin stack packed with felted dust, a charging
   port full of lint, a cable jacket flattened under a chair castor. Those
   get a colour because in the room they have one. A dying power supply, a
   failing drive and a worn battery do not, and they are not marked here.
   --------------------------------------------------------------------- */
const HW_COLOR = {
  cooler: "#a9b3ba", dimm1: "#2f6b4f", dimm2: "#2f6b4f", gpu: "#3d4f63",
  drive0: "#8f9aa4", drive1: "#8f9aa4", satacable: "#a33b3b", psu: "#33393f",
  casefan: "#5c6873", cmos: "#c9ced3", panel: "#333b44", mobo: "#1b4636"
};
const MOB_COLOR = {
  glass: "#93a6b2", digitizer: "#4a6a7a", screen: "#2d3f52", battery: "#3f6d5a",
  logic: "#2f6b4f", port: "#8f9aa4", camera: "#333b44", sim: "#c9ced3", body: "#5c6873",
  earpiece: "#7c868e"
};
const NET_COLOR = {
  pc: "#4a5a6a", deskcable: "#3d6b8a", wallport: "#c9ced3", horizontal: "#5c6873",
  panelport: "#c9ced3", patchlead: "#3d6b8a", switchport: "#5c6873",
  sw: "#2b3138", uplink: "#c98a2a", router: "#3d4f63"
};
/* Dust, lint and a crushed jacket. The only three things on the whole build
   that change a part's colour, because they are the only three you can see. */
const VISIBLE = "#8a6a3a";

/* =====================================================================
   Part geometry

   Each part is a list of primitives in its own local space. `repeat` stamps
   a shape along a vector and `ring` arranges copies around an axis, so a
   twenty-six-fin heatsink and a nine-blade fan are two lines each rather
   than thirty-five. `shade` varies tone inside a part; the part's colour
   lives on the material, so selecting it retints the whole thing without
   flattening the detail.
   ===================================================================== */
const P2 = Math.PI / 2;

export const HW_BUILD = {
  /* Cold plate, four heat pipes, a fin stack, a shrouded fan. */
  cooler: [
    { shape: "rbox", size: [1.5, 0.14, 1.5], pos: [0, -0.76, 0], r: 0.03, shade: 0.72, mat: "copper" },
    { shape: "cyl", size: [0.17, 1.45], pos: [-0.42, -0.05, -0.42], shade: 0.8, mat: "copper" },
    { shape: "cyl", size: [0.17, 1.45], pos: [0.42, -0.05, -0.42], shade: 0.8, mat: "copper" },
    { shape: "cyl", size: [0.17, 1.45], pos: [-0.42, -0.05, 0.42], shade: 0.8, mat: "copper" },
    { shape: "cyl", size: [0.17, 1.45], pos: [0.42, -0.05, 0.42], shade: 0.8, mat: "copper" },
    { shape: "plate", size: [1.9, 1.15, 0.035], pos: [0, 0.04, -0.88],
      repeat: { count: 26, step: [0, 0, 0.0705] }, shade: 1.12 },
    { shape: "box", size: [2.0, 0.18, 0.13], pos: [0, 0.74, 0.94], r: 0.02, shade: 0.9, mat: "black" },
    { shape: "box", size: [2.0, 0.18, 0.13], pos: [0, 0.74, -0.94], r: 0.02, shade: 0.9, mat: "black" },
    { shape: "box", size: [0.13, 0.18, 1.9], pos: [-0.94, 0.74, 0], r: 0.02, shade: 0.9, mat: "black" },
    { shape: "box", size: [0.13, 0.18, 1.9], pos: [0.94, 0.74, 0], r: 0.02, shade: 0.9, mat: "black" },
    { shape: "cyl", size: [0.56, 0.22], pos: [0, 0.76, 0], shade: 0.65, mat: "black" },
    { shape: "plate", size: [0.74, 0.05, 0.33], pos: [0, 0.76, 0], rot: [0, 0, 0.34],
      ring: { count: 7, radius: 0.46, axis: "y" }, shade: 0.95 },
    { shape: "cyl", size: [0.16, 0.34], pos: [-0.84, 0.66, -0.84], shade: 0.85, mat: "steel" },
    { shape: "cyl", size: [0.16, 0.34], pos: [0.84, 0.66, -0.84], shade: 0.85, mat: "steel" },
    { shape: "cyl", size: [0.16, 0.34], pos: [-0.84, 0.66, 0.84], shade: 0.85, mat: "steel" },
    { shape: "cyl", size: [0.16, 0.34], pos: [0.84, 0.66, 0.84], shade: 0.85, mat: "steel" }
  ],

  /* Green board, gold fingers split by the keying notch, eight packages and
     a latch at each end. The notch is off-centre, as it is on the real thing. */
  dimm: [
    { shape: "plate", size: [0.1, 1.25, 3.0], pos: [0, 0.12, 0], shade: 1.0 },
    { shape: "plate", size: [0.13, 0.24, 1.15], pos: [0, -0.62, -0.88], shade: 1.5, mat: "gold" },
    { shape: "plate", size: [0.13, 0.24, 1.4], pos: [0, -0.62, 0.76], shade: 1.5, mat: "gold" },
    { shape: "box", size: [0.14, 0.46, 0.27], pos: [0, 0.18, -1.16], r: 0.015,
      repeat: { count: 8, step: [0, 0, 0.332] }, shade: 0.42 },
    { shape: "box", size: [0.16, 0.2, 0.18], pos: [0, -0.68, -1.55], r: 0.02, shade: 0.8, mat: "pale" },
    { shape: "box", size: [0.16, 0.2, 0.18], pos: [0, -0.68, 1.55], r: 0.02, shade: 0.8, mat: "pale" }
  ],

  /* Board, shroud, two shrouded fans, bracket and display ports. */
  gpu: [
    { shape: "plate", size: [4.4, 0.09, 1.5], pos: [0, -0.13, 0], shade: 0.62, mat: "green" },
    { shape: "rbox", size: [4.2, 0.3, 1.45], pos: [0, 0.08, 0], r: 0.05, shade: 1.0, mat: "black" },
    { shape: "cyl", size: [0.42, 0.14], pos: [-1.0, 0.26, 0], shade: 0.6, mat: "dark" },
    { shape: "cyl", size: [0.42, 0.14], pos: [1.0, 0.26, 0], shade: 0.6, mat: "dark" },
    { shape: "plate", size: [0.6, 0.04, 0.3], pos: [-1.0, 0.26, 0], rot: [0, 0, 0.3],
      ring: { count: 9, radius: 0.4, axis: "y" }, shade: 0.85 },
    { shape: "plate", size: [0.6, 0.04, 0.3], pos: [1.0, 0.26, 0], rot: [0, 0, 0.3],
      ring: { count: 9, radius: 0.4, axis: "y" }, shade: 0.85 },
    { shape: "torus", size: [1.24, 0.06], pos: [-1.0, 0.24, 0], rot: [P2, 0, 0], shade: 0.75, mat: "black" },
    { shape: "torus", size: [1.24, 0.06], pos: [1.0, 0.24, 0], rot: [P2, 0, 0], shade: 0.75, mat: "black" },
    /* The bracket stops at the card's own board line. It used to hang below
       it, which is right in a case and wrong here, because the card now sits
       in a drawn slot and the bracket would have gone through the board. */
    { shape: "plate", size: [0.09, 0.62, 1.6], pos: [-2.24, 0.18, 0], shade: 1.35, mat: "steel" },
    { shape: "box", size: [0.08, 0.22, 0.52], pos: [-2.3, 0.06, -0.4], r: 0.01, shade: 0.35, mat: "dark" },
    { shape: "box", size: [0.08, 0.22, 0.52], pos: [-2.3, 0.06, 0.4], r: 0.01, shade: 0.35, mat: "dark" },
    { shape: "box", size: [0.42, 0.2, 0.3], pos: [1.85, 0.28, 0.55], r: 0.02, shade: 0.5, mat: "black" },
    { shape: "plate", size: [1.7, 0.1, 0.2], pos: [0.2, -0.2, -0.82], shade: 1.5, mat: "gold" }
  ],

  /* 2.5-inch drive: a chamfered metal shell, a label, the SATA connector
     block and four mounting dimples. */
  drive25: [
    { shape: "rbox", size: [1.34, 0.44, 2.12], pos: [0, 0, 0], r: 0.05, shade: 1.0 },
    { shape: "plate", size: [1.02, 0.02, 1.5], pos: [0, 0.23, 0.08], shade: 1.32 },
    { shape: "box", size: [0.12, 0.2, 0.88], pos: [0, -0.06, -1.03], r: 0.01, shade: 0.42 },
    { shape: "cyl", size: [0.13, 0.06], pos: [-0.62, -0.16, -0.72], rot: [0, 0, P2], shade: 0.7 },
    { shape: "cyl", size: [0.13, 0.06], pos: [-0.62, -0.16, 0.72], rot: [0, 0, P2], shade: 0.7 },
    { shape: "cyl", size: [0.13, 0.06], pos: [0.62, -0.16, -0.72], rot: [0, 0, P2], shade: 0.7 },
    { shape: "cyl", size: [0.13, 0.06], pos: [0.62, -0.16, 0.72], rot: [0, 0, P2], shade: 0.7 }
  ],

  /* M.2 stick: bare board, controller, two NAND packages, gold edge and the
     retaining screw. */
  m2: [
    { shape: "plate", size: [2.5, 0.07, 0.88], pos: [0, 0, 0], shade: 1.0 },
    { shape: "box", size: [0.68, 0.1, 0.6], pos: [-0.55, 0.08, 0], r: 0.01, shade: 0.42 },
    { shape: "box", size: [0.68, 0.1, 0.6], pos: [0.42, 0.08, 0], r: 0.01, shade: 0.42 },
    { shape: "box", size: [0.34, 0.1, 0.34], pos: [-1.02, 0.08, 0], r: 0.01, shade: 1.0, mat: "dark" },
    { shape: "plate", size: [0.34, 0.08, 0.36], pos: [1.22, 0, -0.24], shade: 1.5 },
    { shape: "plate", size: [0.34, 0.08, 0.36], pos: [1.22, 0, 0.24], shade: 1.5 },
    { shape: "cyl", size: [0.18, 0.1], pos: [-1.18, 0.06, 0], shade: 1.3 }
  ],

  /* Flat ribbon with a moulded connector and a latch at each end. */
  satacable: [
    { shape: "plate", size: [2.9, 0.05, 0.4], pos: [0, 0, 0], shade: 1.0 },
    { shape: "rbox", size: [0.46, 0.3, 0.48], pos: [-1.55, 0.04, 0], r: 0.04, shade: 0.5 },
    { shape: "rbox", size: [0.46, 0.3, 0.48], pos: [1.55, 0.04, 0], r: 0.04, shade: 0.5 },
    { shape: "box", size: [0.2, 0.1, 0.14], pos: [-1.55, 0.22, 0], r: 0.02, shade: 0.85 },
    { shape: "box", size: [0.2, 0.1, 0.14], pos: [1.55, 0.22, 0], r: 0.02, shade: 0.85 }
  ],

  /* Steel shell, a grilled intake fan, IEC inlet and switch, rear vent
     slots, and the loom coming out of the front. */
  psu: [
    { shape: "rbox", size: [2.86, 2.26, 2.86], pos: [0, 0, 0], r: 0.06, shade: 1.0 },
    { shape: "cyl", size: [1.95, 0.06], pos: [0, 1.14, 0], shade: 0.55, mat: "steel" },
    { shape: "cyl", size: [0.44, 0.14], pos: [0, 1.18, 0], shade: 0.62, mat: "dark" },
    { shape: "plate", size: [0.62, 0.05, 0.3], pos: [0, 1.16, 0], rot: [0, 0, 0.32],
      ring: { count: 9, radius: 0.44, axis: "y" }, shade: 0.88 },
    { shape: "plate", size: [1.9, 0.05, 0.07], pos: [0, 1.2, -0.72],
      repeat: { count: 9, step: [0, 0, 0.18] }, shade: 0.7 },
    { shape: "box", size: [0.58, 0.52, 0.12], pos: [-0.55, 0.42, -1.45], r: 0.02, shade: 0.35, mat: "black" },
    { shape: "box", size: [0.26, 0.2, 0.1], pos: [0.25, 0.42, -1.45], r: 0.02, shade: 0.85, mat: "pale" },
    { shape: "plate", size: [0.06, 0.9, 2.2], pos: [-1.42, -0.4, 0],
      repeat: { count: 1, step: [0, 0, 0] }, shade: 0.6 },
    { shape: "plate", size: [1.7, 0.07, 0.06], pos: [0, -0.55, -1.45],
      repeat: { count: 7, step: [0, 0.16, 0] }, shade: 0.62 },
    { shape: "cyl", size: [0.16, 1.1], pos: [0.45, -0.5, 1.6], rot: [P2, 0, 0.1], shade: 0.45, mat: "black" },
    { shape: "cyl", size: [0.16, 1.1], pos: [0.15, -0.6, 1.6], rot: [P2, 0, -0.05], shade: 0.45, mat: "black" },
    { shape: "cyl", size: [0.16, 1.1], pos: [-0.2, -0.5, 1.6], rot: [P2, 0.08, 0], shade: 0.45, mat: "black" },
    { shape: "plate", size: [1.5, 1.0, 0.02], pos: [0, 0.2, 1.44], shade: 1.3, mat: "pale" }
  ],

  /* 120mm case fan: square frame, corner bosses, hub and blades. Authored
     as a disc in the XZ plane and turned by the part's own rotation. */
  casefan: [
    { shape: "box", size: [2.2, 0.5, 0.2], pos: [0, 0, 1.0], r: 0.03, shade: 0.95 },
    { shape: "box", size: [2.2, 0.5, 0.2], pos: [0, 0, -1.0], r: 0.03, shade: 0.95 },
    { shape: "box", size: [0.2, 0.5, 2.2], pos: [1.0, 0, 0], r: 0.03, shade: 0.95 },
    { shape: "box", size: [0.2, 0.5, 2.2], pos: [-1.0, 0, 0], r: 0.03, shade: 0.95 },
    { shape: "cyl", size: [0.34, 0.14], pos: [1.0, 0, 1.0], shade: 0.7 },
    { shape: "cyl", size: [0.34, 0.14], pos: [-1.0, 0, 1.0], shade: 0.7 },
    { shape: "cyl", size: [0.34, 0.14], pos: [1.0, 0, -1.0], shade: 0.7 },
    { shape: "cyl", size: [0.34, 0.14], pos: [-1.0, 0, -1.0], shade: 0.7 },
    { shape: "cyl", size: [0.62, 0.3], pos: [0, 0, 0], shade: 0.6 },
    { shape: "plate", size: [0.9, 0.06, 0.44], pos: [0, 0, 0], rot: [0, 0, 0.36],
      ring: { count: 9, radius: 0.56, axis: "y" }, shade: 0.9 }
  ],

  /* Coin cell in a sprung holder. */
  cmos: [
    { shape: "cyl", size: [0.78, 0.13], pos: [0, 0.02, 0], shade: 1.28 },
    { shape: "cyl", size: [0.92, 0.06], pos: [0, -0.06, 0], shade: 0.62 },
    { shape: "box", size: [0.16, 0.2, 0.28], pos: [-0.46, 0.02, 0], r: 0.02, shade: 0.75 },
    { shape: "box", size: [0.16, 0.2, 0.28], pos: [0.46, 0.02, 0], r: 0.02, shade: 0.75 }
  ],

  /* Front panel: housing, power button, three indicator lenses. */
  panel: [
    { shape: "rbox", size: [0.48, 0.66, 1.7], pos: [0, 0, 0], r: 0.04, shade: 1.0 },
    { shape: "cyl", size: [0.34, 0.12], pos: [0.2, 0.16, 0.5], rot: [0, 0, P2], shade: 0.75 },
    { shape: "cyl", size: [0.14, 0.1], pos: [0.2, -0.06, 0.05], rot: [0, 0, P2], shade: 1.4 },
    { shape: "cyl", size: [0.14, 0.1], pos: [0.2, -0.06, -0.25], rot: [0, 0, P2], shade: 1.4 },
    { shape: "cyl", size: [0.14, 0.1], pos: [0.2, -0.06, -0.55], rot: [0, 0, P2], shade: 1.4 }
  ]
};

/* ---------------------------------------------------------------------
   The motherboard.

   This one is drawn in detail on purpose. On every other track the board a
   component sits on is scenery, but there is one fault on this track where
   the board IS the answer, and the only way to reach it is to stand over
   the thing and look at six capacitors. A student who has never seen a
   healthy capacitor cannot recognise a failed one, so both have to be here
   and both have to be worth looking at.

   Authored in board-local units at unit scale and then scaled by the model,
   with the origin at the middle of the PCB and the top surface at y = 0.08.
   Everything the model bolts on top — the cooler, the memory, the card, the
   M.2 stick, the coin cell, the front panel lead — has a socket, a slot, a
   header or a holder underneath it in the right place, because a board with
   parts hovering over blank fibreglass looks like a diagram and this is
   meant to look like a machine.

   `domed` is the one thing that changes between tickets: flat capacitor
   tops or swollen ones. Nothing else about the board moves, so a student
   who compares two tickets is comparing the capacitors and not hunting a
   spot-the-difference.
   --------------------------------------------------------------------- */
export function mbBuild(W, domed) {
  var b = [];
  function add() {
    for (var i = 0; i < arguments.length; i++) {
      var q = arguments[i];
      if (W !== 1) {
        q.size = q.size.map(function (v) { return v * W; });
        q.pos = q.pos.map(function (v) { return v * W; });
        if (q.repeat) q.repeat.step = q.repeat.step.map(function (v) { return v * W; });
        if (q.r) q.r = q.r * W;
      }
      b.push(q);
    }
  }

  /* ---- the PCB itself ----
     Two plates: the board, and a slightly smaller darker one beneath it, so
     the edge reads as a laminate with a solder side rather than a slab. */
  add(
    { shape: "plate", size: [8.6, 0.16, 7.6], pos: [0, 0, 0], shade: 1.0 },
    { shape: "plate", size: [8.3, 0.1, 7.3], pos: [0, -0.11, 0], shade: 0.5 }
  );

  /* Silkscreen: a few pale rectangles where a real board prints slot names
     and polarity marks. Flat to the surface, so they read as printing. */
  add(
    { shape: "plate", size: [1.5, 0.02, 0.16], pos: [-2.2, 0.09, -1.05], shade: 1.55 },
    { shape: "plate", size: [0.5, 0.02, 0.12], pos: [-0.2, 0.09, 0.25],
      repeat: { count: 4, step: [0.7, 0, 0] }, shade: 1.55 },
    { shape: "plate", size: [2.4, 0.02, 0.14], pos: [0.4, 0.09, 1.55], shade: 1.55 },
    { shape: "plate", size: [0.9, 0.02, 0.14], pos: [-3.0, 0.09, 1.55], shade: 1.55 }
  );

  /* Mounting points. Eight bare-metal pads where the standoffs come through
     the tray — the ring of screws that holds an ATX board down. */
  add(
    { shape: "cyl", size: [0.34, 0.06], pos: [-3.95, 0.09, -3.45], seg: 12, shade: 1.5 },
    { shape: "cyl", size: [0.34, 0.06], pos: [-3.95, 0.09, 0.15], seg: 12, shade: 1.5 },
    { shape: "cyl", size: [0.34, 0.06], pos: [-3.95, 0.09, 3.45], seg: 12, shade: 1.5 },
    { shape: "cyl", size: [0.34, 0.06], pos: [0.3, 0.09, -3.55], seg: 12, shade: 1.5 },
    { shape: "cyl", size: [0.34, 0.06], pos: [0.3, 0.09, 3.55], seg: 12, shade: 1.5 },
    { shape: "cyl", size: [0.34, 0.06], pos: [3.95, 0.09, -3.45], seg: 12, shade: 1.5 },
    { shape: "cyl", size: [0.34, 0.06], pos: [3.95, 0.09, 0.7], seg: 12, shade: 1.5 },
    { shape: "cyl", size: [0.34, 0.06], pos: [3.95, 0.09, 3.45], seg: 12, shade: 1.5 }
  );

  /* ---- the processor socket ----
     Sits under the cooler, so it has to stay low: the cold plate comes down
     to 0.32 and nothing here goes above 0.30. Frame, land grid, the load
     plate and its lever, and the four cooler mounting holes. */
  add(
    { shape: "rbox", size: [1.94, 0.14, 1.94], pos: [-2.2, 0.15, -2.2], r: 0.02, shade: 0.6 },
    { shape: "plate", size: [1.5, 0.05, 1.5], pos: [-2.2, 0.2, -2.2], shade: 1.42 },
    /* The land grid. Fine parallel ribs rather than a pin-perfect array —
       enough to read as contacts at the distance the camera sits at. */
    { shape: "plate", size: [0.035, 0.03, 1.44], pos: [-2.88, 0.23, -2.2],
      repeat: { count: 18, step: [0.08, 0, 0] }, shade: 1.55 },
    { shape: "box", size: [0.22, 0.1, 1.9], pos: [-3.18, 0.24, -2.2], r: 0.02, shade: 0.85 },
    { shape: "box", size: [0.22, 0.1, 1.9], pos: [-1.22, 0.24, -2.2], r: 0.02, shade: 0.85 },
    { shape: "cyl", size: [0.09, 1.7], pos: [-1.16, 0.26, -2.2], rot: [P2, 0, 0], seg: 10, shade: 1.2 },
    { shape: "cyl", size: [0.09, 0.5], pos: [-1.16, 0.26, -3.2], rot: [0, 0, 0], seg: 10, shade: 1.2 },
    { shape: "cyl", size: [0.16, 0.07], pos: [-3.3, 0.09, -3.3], seg: 10, shade: 1.5 },
    { shape: "cyl", size: [0.16, 0.07], pos: [-1.1, 0.09, -3.3], seg: 10, shade: 1.5 },
    { shape: "cyl", size: [0.16, 0.07], pos: [-3.3, 0.09, -1.1], seg: 10, shade: 1.5 },
    { shape: "cyl", size: [0.16, 0.07], pos: [-1.1, 0.09, -1.1], seg: 10, shade: 1.5 }
  );

  /* ---- voltage regulation ----
     Two finned heatsinks along the rear and outer edge of the socket, and
     the row of square chokes between them and the processor. This is the
     circuit the capacitors below belong to, and having it drawn is what
     lets the note beside the board mean something. */
  add(
    { shape: "rbox", size: [0.4, 0.5, 1.8], pos: [-3.8, 0.33, -2.2], r: 0.03, shade: 0.66 },
    { shape: "plate", size: [0.34, 0.44, 0.05], pos: [-3.8, 0.36, -3.0],
      repeat: { count: 11, step: [0, 0, 0.16] }, shade: 1.1 },
    { shape: "rbox", size: [2.0, 0.5, 0.4], pos: [-2.2, 0.33, -3.55], r: 0.03, shade: 0.66 },
    { shape: "plate", size: [0.05, 0.44, 0.34], pos: [-3.1, 0.36, -3.55],
      repeat: { count: 12, step: [0.16, 0, 0] }, shade: 1.1 },
    { shape: "box", size: [0.26, 0.22, 0.26], pos: [-3.4, 0.19, -2.95],
      repeat: { count: 6, step: [0, 0, 0.32] }, r: 0.02, shade: 0.34 }
  );

  /* =====================================================================
     THE CAPACITOR BANK

     Seven electrolytic capacitors in the open ground between the socket and
     the expansion slots — deliberately not tucked under the cooler or the
     graphics card, because a fault you cannot see from any camera angle is
     not a visual fault.

     A healthy one is a can with a FLAT top, scored with a cross so that if
     it ever does fail it vents there instead of firing the case across the
     room. A failed one is domed: the electrolyte inside has gassed and
     pushed the top up, sometimes splitting the score and weeping a crust of
     dried brown residue over the rim.

     That is the whole diagnosis, and it is why the tops are drawn as real
     geometry. Flat discs on a good board; spheres sunk into the cans on a
     bad one, with two of them crusted over.
     ===================================================================== */
  var CAPX = -3.2, CAPSTEP = 0.38, CAPZ = -0.55, CAPN = 7;
  add(
    /* The can, its base insulator, and the polarity stripe down one side. */
    { shape: "cyl", size: [0.38, 0.42], pos: [CAPX, 0.29, CAPZ],
      repeat: { count: CAPN, step: [CAPSTEP, 0, 0] }, seg: 14, shade: 1.0, mat: "black" },
    { shape: "cyl", size: [0.44, 0.06], pos: [CAPX, 0.11, CAPZ],
      repeat: { count: CAPN, step: [CAPSTEP, 0, 0] }, seg: 14, shade: 0.72, mat: "black" },
    { shape: "plate", size: [0.1, 0.34, 0.06], pos: [CAPX, 0.3, CAPZ - 0.19],
      repeat: { count: CAPN, step: [CAPSTEP, 0, 0] }, shade: 1.0, mat: "pale" }
  );
  if (domed) {
    /* Five of the seven have lifted. The dome is a sphere sunk into the can
       so only the crown shows, which is exactly how it looks in the room:
       the top is no longer a plane, and you can see that from any angle
       where you can see the can at all. */
    add(
      /* The dome is wider than the can it sits in, so it overhangs the rim
         rather than sitting politely inside it. That overhang is the tell a
         technician actually uses — you see it side-on, from any angle where
         the capacitor is visible at all, without having to be overhead. */
      { shape: "sphere", size: [0.46], pos: [CAPX, 0.43, CAPZ],
        repeat: { count: 5, step: [CAPSTEP, 0, 0] }, seg: 14, shade: 1.0, mat: "alu" },
      /* The vent score is still there on a swollen one — pulled open along
         its length instead of pressed flat. Same part, same feature, and
         that is what makes the pair worth comparing. */
      { shape: "plate", size: [0.34, 0.03, 0.06], pos: [CAPX, 0.63, CAPZ],
        repeat: { count: 5, step: [CAPSTEP, 0, 0] }, shade: 1.0, mat: "dark" },
      { shape: "plate", size: [0.06, 0.03, 0.34], pos: [CAPX, 0.63, CAPZ],
        repeat: { count: 5, step: [CAPSTEP, 0, 0] }, shade: 1.0, mat: "dark" },
      /* The remaining two are still flat. They are there so the difference
         has something to be a difference FROM without leaving the board. */
      { shape: "cyl", size: [0.33, 0.05], pos: [CAPX + CAPSTEP * 5, 0.52, CAPZ],
        repeat: { count: 2, step: [CAPSTEP, 0, 0] }, seg: 14, shade: 1.0, mat: "alu" },
      { shape: "plate", size: [0.3, 0.03, 0.045], pos: [CAPX + CAPSTEP * 5, 0.55, CAPZ],
        repeat: { count: 2, step: [CAPSTEP, 0, 0] }, shade: 1.0, mat: "dark" },
      { shape: "plate", size: [0.045, 0.03, 0.3], pos: [CAPX + CAPSTEP * 5, 0.55, CAPZ],
        repeat: { count: 2, step: [CAPSTEP, 0, 0] }, shade: 1.0, mat: "dark" },
      /* One has split at the score and dried. The crust sits proud of the
         rim and runs down the side of the can. */
      { shape: "sphere", size: [0.3], pos: [CAPX + CAPSTEP * 2, 0.56, CAPZ], seg: 10, shade: 0.26 },
      { shape: "cyl", size: [0.42, 0.1], pos: [CAPX + CAPSTEP * 2, 0.46, CAPZ], seg: 12, shade: 0.26 },
      { shape: "cyl", size: [0.4, 0.09], pos: [CAPX + CAPSTEP * 4, 0.47, CAPZ], seg: 12, shade: 0.26 },
      /* And what has wept out of it has dried on the board underneath. */
      { shape: "plate", size: [0.5, 0.02, 0.34], pos: [CAPX + CAPSTEP * 2, 0.09, CAPZ + 0.26], shade: 0.3 }
    );
  } else {
    /* Flat tops, and the vent score pressed into each one. */
    add(
      { shape: "cyl", size: [0.33, 0.05], pos: [CAPX, 0.52, CAPZ],
        repeat: { count: CAPN, step: [CAPSTEP, 0, 0] }, seg: 14, shade: 1.0, mat: "alu" },
      { shape: "plate", size: [0.3, 0.03, 0.045], pos: [CAPX, 0.55, CAPZ],
        repeat: { count: CAPN, step: [CAPSTEP, 0, 0] }, shade: 1.0, mat: "dark" },
      { shape: "plate", size: [0.045, 0.03, 0.3], pos: [CAPX, 0.55, CAPZ],
        repeat: { count: CAPN, step: [CAPSTEP, 0, 0] }, shade: 1.0, mat: "dark" }
    );
  }

  /* ---- memory ----
     Four slots, two of them filled by the modules the model draws. Kept
     under 0.34 tall so the fitted modules sit in them rather than on them,
     and without end latches of their own because the modules carry theirs. */
  add(
    { shape: "rbox", size: [0.34, 0.26, 3.0], pos: [-0.2, 0.21, -1.6],
      repeat: { count: 4, step: [0.7, 0, 0] }, r: 0.02, shade: 0.48 },
    { shape: "plate", size: [0.1, 0.05, 2.7], pos: [-0.2, 0.33, -1.6],
      repeat: { count: 4, step: [0.7, 0, 0] }, shade: 1.4 }
  );

  /* ---- expansion ----
     One x16 for the graphics card, two x1 beside it. The x16 has its
     retention tab at the far end, which is the part a student has to press
     before a card will come out. */
  add(
    { shape: "rbox", size: [2.7, 0.34, 0.36], pos: [0.4, 0.24, 1.18], r: 0.02, shade: 0.44 },
    { shape: "plate", size: [2.5, 0.05, 0.1], pos: [0.4, 0.39, 1.18], shade: 1.4 },
    { shape: "box", size: [0.2, 0.3, 0.32], pos: [1.85, 0.3, 1.18], r: 0.03, shade: 0.9 },
    { shape: "rbox", size: [1.0, 0.3, 0.34], pos: [-3.0, 0.22, 1.18], r: 0.02, shade: 0.44 },
    { shape: "plate", size: [0.84, 0.05, 0.09], pos: [-3.0, 0.35, 1.18], shade: 1.4 },
    { shape: "rbox", size: [1.0, 0.3, 0.34], pos: [-3.0, 0.22, 3.0], r: 0.02, shade: 0.44 },
    { shape: "plate", size: [0.84, 0.05, 0.09], pos: [-3.0, 0.35, 3.0], shade: 1.4 }
  );

  /* ---- M.2 ----
     Edge connector at one end, a threaded standoff at the other, and a
     thermal pad between them. Drawn whether or not this machine has a stick
     in it, because an empty M.2 socket is a thing worth recognising. */
  add(
    { shape: "box", size: [0.28, 0.16, 0.9], pos: [-0.05, 0.16, 0.52], r: 0.02, shade: 0.42 },
    { shape: "plate", size: [0.06, 0.09, 0.8], pos: [-0.14, 0.17, 0.52], shade: 1.4 },
    { shape: "plate", size: [2.1, 0.03, 0.7], pos: [-1.25, 0.09, 0.52], shade: 0.78 },
    { shape: "cyl", size: [0.3, 0.12], pos: [-2.58, 0.14, 0.52], seg: 10, shade: 1.35 }
  );

  /* ---- storage and power connectors ---- */
  add(
    /* Four right-angle SATA ports, where the drive cable actually lands. */
    { shape: "box", size: [0.5, 0.36, 0.26], pos: [-2.6, 0.26, 1.55],
      repeat: { count: 4, step: [0, 0, 0.3] }, r: 0.02, shade: 0.38 },
    { shape: "plate", size: [0.3, 0.16, 0.1], pos: [-2.72, 0.26, 1.55],
      repeat: { count: 4, step: [0, 0, 0.3] }, shade: 0.9 },
    /* The 24-pin main power header on the outer edge, with its latch rail. */
    { shape: "box", size: [0.5, 0.5, 2.0], pos: [3.9, 0.33, 0.0], r: 0.03, shade: 0.35 },
    { shape: "plate", size: [0.36, 0.05, 1.8], pos: [3.9, 0.56, 0.0], shade: 0.9 },
    { shape: "box", size: [0.14, 0.16, 0.3], pos: [3.64, 0.36, 0.0], r: 0.02, shade: 0.9 },
    /* The 8-pin processor power header, up beside the regulators where the
       lead has to reach over the cooler to get to it. */
    { shape: "box", size: [0.5, 0.44, 0.9], pos: [-3.85, 0.3, -3.5], r: 0.03, shade: 0.35 },
    { shape: "plate", size: [0.36, 0.05, 0.76], pos: [-3.85, 0.5, -3.5], shade: 0.9 }
  );

  /* ---- headers ----
     Bare pin blocks: front panel, front USB, and two fan headers. The pins
     are drawn bright because on a real board they are tinned and that is
     how you find them in a dark case. */
  add(
    { shape: "box", size: [0.44, 0.12, 1.0], pos: [3.8, 0.14, 3.0], r: 0.02, shade: 0.4 },
    { shape: "box", size: [0.05, 0.14, 0.05], pos: [3.7, 0.2, 2.58],
      repeat: { count: 5, step: [0, 0, 0.21] }, shade: 1.5 },
    { shape: "box", size: [0.05, 0.14, 0.05], pos: [3.9, 0.2, 2.58],
      repeat: { count: 5, step: [0, 0, 0.21] }, shade: 1.5 },
    { shape: "box", size: [0.44, 0.34, 0.7], pos: [3.9, 0.25, 1.7], r: 0.02, shade: 0.4 },
    { shape: "box", size: [0.26, 0.24, 0.3], pos: [-0.9, 0.2, -3.5], r: 0.02, shade: 0.4 },
    { shape: "box", size: [0.26, 0.24, 0.3], pos: [3.9, 0.2, -2.4], r: 0.02, shade: 0.4 }
  );

  /* ---- chipset, firmware and the small silicon ----
     A finned block over the chipset, the BIOS chip in its socket beside it,
     and the scatter of surface-mount parts that makes a board look populated
     rather than laid out. */
  add(
    { shape: "rbox", size: [0.9, 0.34, 0.9], pos: [3.1, 0.25, 1.4], r: 0.04, shade: 0.7 },
    { shape: "plate", size: [0.8, 0.05, 0.8], pos: [3.1, 0.44, 1.4], shade: 1.15 },
    { shape: "box", size: [0.34, 0.12, 0.5], pos: [2.9, 0.14, -1.4], r: 0.01, shade: 0.34 },
    { shape: "box", size: [0.26, 0.1, 0.4], pos: [2.9, 0.13, 2.6], r: 0.01, shade: 0.34 },
    { shape: "box", size: [0.4, 0.1, 0.4], pos: [-1.6, 0.13, 2.3], r: 0.01, shade: 0.34 },
    { shape: "box", size: [0.1, 0.06, 0.16], pos: [0.9, 0.11, 2.2],
      repeat: { count: 7, step: [0.24, 0, 0] }, shade: 0.62 },
    { shape: "box", size: [0.1, 0.06, 0.16], pos: [0.9, 0.11, 2.6],
      repeat: { count: 7, step: [0.24, 0, 0] }, shade: 0.62 },
    { shape: "box", size: [0.16, 0.06, 0.1], pos: [1.3, 0.11, -2.6],
      repeat: { count: 6, step: [0, 0, 0.26] }, shade: 0.62 },
    /* Two smaller solid-polymer capacitors behind the socket. Squat, flat,
       and never the failed ones — the bank at the front is the exercise. */
    { shape: "cyl", size: [0.3, 0.26], pos: [-1.7, 0.21, -3.4], seg: 12, shade: 0.5 },
    { shape: "cyl", size: [0.3, 0.26], pos: [-1.35, 0.21, -3.4], seg: 12, shade: 0.5 }
  );

  /* ---- rear I/O ----
     The shield wall and the stack of ports through it. Faces outward, which
     from this camera is the far side, so it mostly reads as the board having
     a back to it rather than as ports you are meant to count. */
  add(
    { shape: "plate", size: [0.14, 0.9, 3.4], pos: [-4.15, 0.5, -1.0], shade: 1.28 },
    { shape: "box", size: [0.3, 0.26, 0.5], pos: [-4.2, 0.34, -2.3],
      repeat: { count: 3, step: [0, 0, 0.6] }, r: 0.02, shade: 0.5 },
    { shape: "box", size: [0.3, 0.26, 0.5], pos: [-4.2, 0.68, -2.3],
      repeat: { count: 3, step: [0, 0, 0.6] }, r: 0.02, shade: 0.5 },
    { shape: "box", size: [0.32, 0.44, 0.44], pos: [-4.2, 0.5, -0.1], r: 0.02, shade: 0.62 },
    { shape: "cyl", size: [0.24, 0.16], pos: [-4.2, 0.36, 0.5], rot: [0, 0, P2], seg: 10, shade: 0.7 },
    { shape: "cyl", size: [0.24, 0.16], pos: [-4.2, 0.66, 0.5], rot: [0, 0, P2], seg: 10, shade: 0.7 }
  );

  /* ---- the coin cell holder ----
     Under the CMOS battery the model draws, because a student who has to
     pull that cell needs to have seen what it comes out of. */
  add(
    { shape: "cyl", size: [1.12, 0.14], pos: [1.8, 0.15, 3.4], seg: 16, shade: 1.0, mat: "dark" },
    { shape: "plate", size: [1.0, 0.04, 0.9], pos: [1.8, 0.21, 3.4], shade: 1.35 },
    { shape: "box", size: [0.16, 0.2, 0.34], pos: [1.16, 0.18, 3.4], r: 0.02, shade: 0.8 }
  );

  return b;
}

/* The chassis: floor pan, motherboard tray standoffs, rear panel with a
   fan cutout, and the front bezel. */
export function chassisBuild(W) {
  return [
    { shape: "rbox", size: [13 * W, 0.3, 10 * W], pos: [0, 0, 0], r: 0.06, shade: 1.0 },
    /* Back panel only. The ticket says the side panel is off, so putting one
       back on would both contradict the brief and hide the case fan behind
       it from every angle the camera can reach. */
    { shape: "plate", size: [13 * W, 5.0, 0.3], pos: [0, 2.5, -4.9 * W], shade: 0.78 },
    { shape: "cyl", size: [0.36, 0.34], pos: [-4.0 * W, 0.3, -3.0 * W],
      repeat: { count: 4, step: [2.6 * W, 0, 0] }, shade: 0.8 },
    { shape: "cyl", size: [0.36, 0.34], pos: [-4.0 * W, 0.3, 2.6 * W],
      repeat: { count: 4, step: [2.6 * W, 0, 0] }, shade: 0.8 }
  ];
}


/* ---- laser engine parts ---- */
export const LAS_BUILD = {
  tray: [
    { shape: "rbox", size: [3.3, 0.5, 3.3], pos: [0, -0.15, 0], r: 0.05, shade: 1.0 },
    { shape: "plate", size: [0.12, 0.5, 3.1], pos: [-1.5, 0.2, 0], shade: 0.85 },
    { shape: "plate", size: [0.12, 0.5, 3.1], pos: [1.5, 0.2, 0], shade: 0.85 },
    { shape: "plate", size: [2.7, 0.3, 2.6], pos: [0, 0.2, 0], shade: 1.45, mat: "pale" },
    { shape: "box", size: [0.9, 0.16, 0.3], pos: [0, 0.06, 1.75], r: 0.03, shade: 0.8 }
  ],
  roller: [
    { shape: "cyl", size: [0.26, 3.2], pos: [0, 0, 0], rot: [Math.PI / 2, 0, 0], shade: 0.75, mat: "steel" },
    { shape: "cyl", size: [0.95, 0.75], pos: [0, 0, -0.8], rot: [Math.PI / 2, 0, 0], shade: 1.0 },
    { shape: "cyl", size: [0.95, 0.75], pos: [0, 0, 0.8], rot: [Math.PI / 2, 0, 0], shade: 1.0 },
    { shape: "cyl", size: [0.5, 0.2], pos: [0, 0, 1.55], rot: [Math.PI / 2, 0, 0], shade: 0.6, mat: "black" }
  ],
  pad: [
    { shape: "rbox", size: [0.7, 0.22, 2.4], pos: [0, 0, 0], r: 0.04, shade: 1.0 },
    { shape: "plate", size: [0.5, 0.06, 2.1], pos: [0, 0.13, 0], shade: 0.7 },
    { shape: "box", size: [0.22, 0.3, 0.3], pos: [0, -0.18, -1.3], r: 0.02, shade: 0.85, mat: "black" },
    { shape: "box", size: [0.22, 0.3, 0.3], pos: [0, -0.18, 1.3], r: 0.02, shade: 0.85, mat: "black" }
  ],
  drum: [
    { shape: "cyl", size: [2.3, 3.0], pos: [0, 0, 0], rot: [Math.PI / 2, 0, 0], shade: 1.0 },
    { shape: "cyl", size: [2.4, 0.18], pos: [0, 0, -1.55], rot: [Math.PI / 2, 0, 0], shade: 0.55, mat: "black" },
    { shape: "cyl", size: [2.4, 0.18], pos: [0, 0, 1.55], rot: [Math.PI / 2, 0, 0], shade: 0.55, mat: "black" },
    { shape: "cyl", size: [1.3, 0.28], pos: [0, 0, 1.75], rot: [Math.PI / 2, 0, 0], shade: 0.7, mat: "black" },
    { shape: "box", size: [0.16, 0.3, 0.24], pos: [0, 0, 1.75], rot: [Math.PI / 2, 0, 0],
      ring: { count: 16, radius: 0.6, axis: "z" }, shade: 0.68 }
  ],
  smallroller: [
    { shape: "cyl", size: [0.72, 2.9], pos: [0, 0, 0], rot: [Math.PI / 2, 0, 0], shade: 1.0 },
    { shape: "cyl", size: [0.22, 3.3], pos: [0, 0, 0], rot: [Math.PI / 2, 0, 0], shade: 0.6, mat: "steel" },
    { shape: "cyl", size: [0.5, 0.16], pos: [0, 0, 1.7], rot: [Math.PI / 2, 0, 0], shade: 0.7, mat: "black" }
  ],
  devroller: [
    { shape: "cyl", size: [1.1, 2.9], pos: [0, 0, 0], rot: [Math.PI / 2, 0, 0], shade: 1.0 },
    { shape: "cyl", size: [0.22, 3.3], pos: [0, 0, 0], rot: [Math.PI / 2, 0, 0], shade: 0.6, mat: "steel" },
    { shape: "plate", size: [0.16, 0.4, 2.8], pos: [0.62, 0.42, 0], rot: [0, 0, -0.5], shade: 0.7, mat: "steel" }
  ],
  transfer: [
    { shape: "cyl", size: [0.95, 3.0], pos: [0, 0, 0], rot: [Math.PI / 2, 0, 0], shade: 1.0 },
    { shape: "cyl", size: [0.24, 3.4], pos: [0, 0, 0], rot: [Math.PI / 2, 0, 0], shade: 0.65, mat: "steel" },
    { shape: "cyl", size: [0.44, 0.18], pos: [0, 0, 1.78], rot: [Math.PI / 2, 0, 0], shade: 0.75, mat: "black" }
  ],
  fuser: [
    { shape: "rbox", size: [1.9, 1.7, 3.2], pos: [0, 0, 0], r: 0.06, shade: 1.0 },
    { shape: "cyl", size: [1.05, 2.9], pos: [-0.25, 0.32, 0], rot: [Math.PI / 2, 0, 0], shade: 1.35 },
    { shape: "cyl", size: [0.95, 2.9], pos: [-0.25, -0.42, 0], rot: [Math.PI / 2, 0, 0], shade: 0.7, mat: "dark" },
    { shape: "cyl", size: [0.5, 0.24], pos: [-0.25, 0.32, 1.65], rot: [Math.PI / 2, 0, 0], shade: 0.62, mat: "black" },
    { shape: "box", size: [0.2, 0.16, 0.3], pos: [0.5, 0.55, -1.0], r: 0.02, shade: 0.55, mat: "black" },
    { shape: "plate", size: [0.06, 0.5, 2.6], pos: [0.9, 0.1, 0], shade: 0.8, mat: "steel" }
  ],
  polygon: [
    { shape: "rbox", size: [2.5, 0.75, 2.9], pos: [0, 0, 0], r: 0.05, shade: 1.0 },
    { shape: "cyl", size: [0.75, 0.2], pos: [-0.55, 0.42, 0], shade: 0.6, mat: "steel" },
    { shape: "box", size: [0.2, 0.22, 0.22], pos: [-0.55, 0.44, 0],
      ring: { count: 6, radius: 0.34, axis: "y" }, shade: 1.4 },
    { shape: "plate", size: [1.5, 0.08, 0.3], pos: [0.5, 0.4, 0], rot: [0, 0, -0.25], shade: 1.3, mat: "pale" },
    { shape: "plate", size: [1.9, 0.05, 0.34], pos: [0.2, -0.38, 0], shade: 1.45, mat: "pale" }
  ],
  waste: [
    { shape: "rbox", size: [1.35, 0.85, 2.9], pos: [0, 0, 0], r: 0.05, shade: 1.0 },
    { shape: "plate", size: [0.1, 0.4, 2.7], pos: [-0.6, 0.3, 0], rot: [0, 0, 0.3], shade: 0.62, mat: "steel" },
    { shape: "box", size: [0.3, 0.2, 0.4], pos: [0.5, 0.5, 1.2], r: 0.02, shade: 0.75, mat: "black" }
  ],
  gears: [
    { shape: "plate", size: [3.9, 2.9, 0.12], pos: [0, 0, 0], shade: 0.75, mat: "dark" },
    { shape: "cyl", size: [1.3, 0.22], pos: [-1.0, 0.5, 0.2], rot: [Math.PI / 2, 0, 0], shade: 1.0, mat: "black" },
    { shape: "box", size: [0.16, 0.3, 0.22], pos: [-1.0, 0.5, 0.2], rot: [Math.PI / 2, 0, 0],
      ring: { count: 14, radius: 0.62, axis: "z" }, shade: 1.0 },
    { shape: "cyl", size: [0.9, 0.22], pos: [0.3, -0.3, 0.2], rot: [Math.PI / 2, 0, 0], shade: 0.9, mat: "black" },
    { shape: "box", size: [0.14, 0.26, 0.22], pos: [0.3, -0.3, 0.2], rot: [Math.PI / 2, 0, 0],
      ring: { count: 11, radius: 0.44, axis: "z" }, shade: 0.9 },
    { shape: "cyl", size: [0.65, 0.22], pos: [1.35, 0.55, 0.2], rot: [Math.PI / 2, 0, 0], shade: 0.85, mat: "black" },
    { shape: "cyl", size: [1.0, 0.5], pos: [-1.9, -0.7, 0.2], rot: [Math.PI / 2, 0, 0], shade: 0.6, mat: "steel" }
  ],
  ozone: [
    { shape: "rbox", size: [1.15, 0.38, 2.5], pos: [0, 0, 0], r: 0.03, shade: 1.0 },
    { shape: "plate", size: [0.9, 0.06, 0.09], pos: [0, 0.2, -1.0],
      repeat: { count: 11, step: [0, 0, 0.2] }, shade: 0.6 }
  ]
};

/* ---- inkjet parts ---- */
export const INK_BUILD = {
  platen: [
    { shape: "rbox", size: [9.4, 0.32, 3.3], pos: [0, 0, 0], r: 0.04, shade: 1.0 },
    { shape: "plate", size: [0.12, 0.16, 3.0], pos: [-4.2, 0.2, 0],
      repeat: { count: 15, step: [0.6, 0, 0] }, shade: 0.82 }
  ],
  carriage: [
    { shape: "rbox", size: [1.7, 1.0, 1.4], pos: [0, 0, 0], r: 0.06, shade: 1.0 },
    { shape: "box", size: [1.2, 0.2, 0.9], pos: [0, 0.58, 0], r: 0.03, shade: 0.8, mat: "dark" },
    { shape: "plate", size: [0.5, 0.05, 1.0], pos: [0, 0.72, 0], shade: 1.3, mat: "pale" },
    { shape: "box", size: [0.28, 0.5, 0.3], pos: [-0.72, 0.1, -0.5], r: 0.02, shade: 0.65, mat: "black" },
    { shape: "cyl", size: [0.3, 1.9], pos: [0, -0.1, 0], rot: [0, 0, Math.PI / 2], shade: 0.6, mat: "steel" }
  ],
  printhead: [
    { shape: "rbox", size: [1.25, 0.3, 1.05], pos: [0, 0, 0], r: 0.03, shade: 1.0 },
    { shape: "plate", size: [0.95, 0.05, 0.16], pos: [0, -0.16, -0.3],
      repeat: { count: 4, step: [0, 0, 0.2] }, shade: 1.45 },
    { shape: "plate", size: [0.3, 0.1, 0.9], pos: [0.62, 0.1, 0], shade: 0.7, mat: "gold" }
  ],
  belt: [
    { shape: "plate", size: [8.4, 0.16, 0.14], pos: [0, 0.14, 0], shade: 1.0, mat: "black" },
    { shape: "plate", size: [8.4, 0.16, 0.14], pos: [0, -0.14, 0], shade: 1.0, mat: "black" },
    { shape: "plate", size: [0.06, 0.1, 0.16], pos: [-4.1, 0.22, 0],
      repeat: { count: 42, step: [0.2, 0, 0] }, shade: 0.75 },
    { shape: "cyl", size: [0.5, 0.3], pos: [-4.35, 0, 0], rot: [Math.PI / 2, 0, 0], shade: 0.7, mat: "black" },
    { shape: "cyl", size: [0.5, 0.3], pos: [4.35, 0, 0], rot: [Math.PI / 2, 0, 0], shade: 0.7, mat: "black" },
    { shape: "rbox", size: [0.85, 0.85, 0.85], pos: [4.85, 0, 0], r: 0.05, shade: 0.55, mat: "dark" }
  ],
  encoder: [
    { shape: "plate", size: [9.0, 0.5, 0.05], pos: [0, 0, 0], shade: 1.0, mat: "pale" },
    { shape: "plate", size: [0.05, 0.34, 0.07], pos: [-4.4, 0, 0.02],
      repeat: { count: 60, step: [0.149, 0, 0] }, shade: 0.42 },
    { shape: "box", size: [0.2, 0.7, 0.16], pos: [-4.6, 0, 0], r: 0.02, shade: 0.7, mat: "black" },
    { shape: "box", size: [0.2, 0.7, 0.16], pos: [4.6, 0, 0], r: 0.02, shade: 0.7, mat: "black" }
  ],
  capping: [
    { shape: "rbox", size: [1.05, 0.5, 1.25], pos: [0, 0, 0], r: 0.05, shade: 1.0 },
    { shape: "box", size: [0.82, 0.12, 1.0], pos: [0, 0.28, 0], r: 0.04, shade: 0.62, mat: "dark" },
    { shape: "plate", size: [0.6, 0.06, 0.78], pos: [0, 0.3, 0], shade: 0.45, mat: "dark" },
    { shape: "cyl", size: [0.22, 0.9], pos: [0, -0.3, 0.75], rot: [Math.PI / 2, 0, 0], shade: 0.7, mat: "black" }
  ],
  wiper: [
    { shape: "rbox", size: [0.34, 0.28, 1.05], pos: [0, -0.1, 0], r: 0.03, shade: 1.0 },
    { shape: "plate", size: [0.08, 0.34, 0.95], pos: [0, 0.2, 0], shade: 0.6, mat: "dark" }
  ],
  pump: [
    { shape: "cyl", size: [0.82, 0.7], pos: [0, 0, 0], shade: 1.0 },
    { shape: "cyl", size: [0.3, 0.3], pos: [0, 0.44, 0], shade: 0.65, mat: "black" },
    { shape: "cyl", size: [0.2, 0.9], pos: [0, 0, 0.6], rot: [Math.PI / 2, 0, 0], shade: 0.7, mat: "black" },
    { shape: "cyl", size: [0.2, 0.9], pos: [0, 0, -0.6], rot: [Math.PI / 2, 0, 0], shade: 0.7, mat: "black" }
  ],
  wastepad: [
    { shape: "rbox", size: [3.1, 0.16, 1.9], pos: [0, -0.12, 0], r: 0.03, shade: 0.75 },
    { shape: "plate", size: [2.85, 0.1, 1.7], pos: [0, 0, 0],
      repeat: { count: 3, step: [0, 0.1, 0] }, shade: 1.0 },
    { shape: "plate", size: [0.16, 0.34, 1.9], pos: [-1.6, 0.05, 0], shade: 0.68, mat: "black" },
    { shape: "plate", size: [0.16, 0.34, 1.9], pos: [1.6, 0.05, 0], shade: 0.68, mat: "black" }
  ],
  starwheel: [
    { shape: "cyl", size: [0.2, 2.4], pos: [0, 0, 0], rot: [0, 0, Math.PI / 2], shade: 0.65, mat: "steel" },
    { shape: "cyl", size: [0.6, 0.06], pos: [-0.8, 0, 0], rot: [0, 0, Math.PI / 2], shade: 1.0, mat: "steel" },
    { shape: "cyl", size: [0.6, 0.06], pos: [0, 0, 0], rot: [0, 0, Math.PI / 2], shade: 1.0, mat: "steel" },
    { shape: "cyl", size: [0.6, 0.06], pos: [0.8, 0, 0], rot: [0, 0, Math.PI / 2], shade: 1.0, mat: "steel" },
    { shape: "box", size: [0.06, 0.2, 0.07], pos: [-0.8, 0, 0], rot: [0, 0, Math.PI / 2],
      ring: { count: 10, radius: 0.32, axis: "x" }, shade: 1.1 },
    { shape: "box", size: [0.06, 0.2, 0.07], pos: [0, 0, 0], rot: [0, 0, Math.PI / 2],
      ring: { count: 10, radius: 0.32, axis: "x" }, shade: 1.1 },
    { shape: "box", size: [0.06, 0.2, 0.07], pos: [0.8, 0, 0], rot: [0, 0, Math.PI / 2],
      ring: { count: 10, radius: 0.32, axis: "x" }, shade: 1.1 }
  ],
  encoderwheel: [
    { shape: "cyl", size: [1.0, 0.1], pos: [0, 0, 0], rot: [0, 0, Math.PI / 2], shade: 1.0, mat: "pale" },
    { shape: "cyl", size: [0.28, 0.34], pos: [0, 0, 0], rot: [0, 0, Math.PI / 2], shade: 0.6, mat: "black" },
    { shape: "box", size: [0.13, 0.16, 0.06], pos: [0, 0, 0], rot: [0, 0, Math.PI / 2],
      ring: { count: 24, radius: 0.38, axis: "x" }, shade: 0.45 }
  ]
};


/* ---- handset parts, exploded ---- */
export const MOB_BUILD = {
  /* The earpiece: a slotted grille above the screen with the driver behind
     it. Small, and the whole point of one ticket. */
  earpiece: [
    { shape: "rbox", size: [1.2, 0.12, 0.22], pos: [0, 0, 0], r: 0.06, shade: 1.0 },
    { shape: "box", size: [0.05, 0.14, 0.13], pos: [-0.5, 0.04, 0],
      repeat: { count: 11, step: [0.1, 0, 0] }, shade: 0.42 },
    { shape: "cyl", size: [0.3, 0.24], pos: [0, -0.16, 0], shade: 0.6, mat: "black" },
    { shape: "cyl", size: [0.16, 0.1], pos: [0, -0.3, 0], shade: 1.35, mat: "gold" }
  ],
  glass: [
    { shape: "rbox", size: [3.1, 0.1, 6.3], pos: [0, 0, 0], r: 0.14, shade: 1.0 },
    { shape: "cyl", size: [0.34, 0.12], pos: [-0.95, 0, 2.75], shade: 0.5, mat: "black" },
    { shape: "box", size: [0.7, 0.06, 0.11], pos: [0.15, 0.02, 2.8], r: 0.03, shade: 0.55, mat: "dark" }
  ],
  digitizer: [
    { shape: "rbox", size: [3.0, 0.07, 6.15], pos: [0, 0, 0], r: 0.1, shade: 1.0 },
    { shape: "plate", size: [0.06, 0.02, 5.9], pos: [-1.4, 0.05, 0],
      repeat: { count: 22, step: [0.127, 0, 0] }, shade: 0.78 },
    { shape: "plate", size: [0.7, 0.04, 0.9], pos: [0, -0.04, -3.4], shade: 0.62, mat: "dark" }
  ],
  screen: [
    { shape: "rbox", size: [2.95, 0.13, 6.05], pos: [0, 0, 0], r: 0.1, shade: 1.0 },
    { shape: "plate", size: [2.75, 0.03, 5.8], pos: [0, 0.08, 0], shade: 1.35 },
    { shape: "plate", size: [0.85, 0.05, 1.0], pos: [0, -0.07, -3.3], shade: 0.6, mat: "dark" }
  ],
  battery: [
    { shape: "rbox", size: [2.35, 0.4, 3.15], pos: [0, 0, 0], r: 0.06, shade: 1.0 },
    { shape: "plate", size: [1.6, 0.02, 2.2], pos: [0, 0.21, 0], shade: 1.25 },
    { shape: "plate", size: [0.5, 0.05, 0.55], pos: [0.75, 0.05, -1.85], shade: 0.72, mat: "gold" },
    { shape: "box", size: [0.45, 0.14, 0.22], pos: [0.75, 0.05, -2.05], r: 0.02, shade: 0.5, mat: "black" },
    { shape: "plate", size: [1.9, 0.03, 0.28], pos: [0, 0.2, 1.4], shade: 0.7 }
  ],
  logic: [
    { shape: "plate", size: [1.65, 0.14, 1.55], pos: [0, 0, 0], shade: 1.0 },
    { shape: "box", size: [0.65, 0.1, 0.6], pos: [-0.3, 0.11, 0.2], r: 0.02, shade: 1.35, mat: "black" },
    { shape: "box", size: [0.45, 0.09, 0.42], pos: [0.42, 0.11, -0.3], r: 0.02, shade: 1.35, mat: "black" },
    { shape: "box", size: [0.18, 0.09, 0.5], pos: [-0.66, 0.1, -0.42], r: 0.02, shade: 0.55, mat: "dark" },
    { shape: "box", size: [0.3, 0.07, 0.16], pos: [0.5, 0.1, 0.55], r: 0.02, shade: 0.6, mat: "gold" }
  ],
  port: [
    { shape: "rbox", size: [0.86, 0.28, 0.46], pos: [0, 0, 0], r: 0.09, shade: 1.0 },
    { shape: "box", size: [0.6, 0.13, 0.2], pos: [0, 0, -0.16], r: 0.05, shade: 0.42, mat: "black" },
    { shape: "plate", size: [0.42, 0.03, 0.05], pos: [0, 0.03, -0.16], shade: 1.4, mat: "gold" },
    { shape: "plate", size: [1.15, 0.05, 0.3], pos: [0, -0.1, 0.24], shade: 0.62, mat: "dark" }
  ],
  camera: [
    { shape: "rbox", size: [0.78, 0.26, 0.78], pos: [0, 0, 0], r: 0.1, shade: 1.0 },
    { shape: "cyl", size: [0.5, 0.22], pos: [0, 0.1, 0], shade: 0.55, mat: "black" },
    { shape: "cyl", size: [0.34, 0.14], pos: [0, 0.2, 0], shade: 0.3, mat: "dark" },
    { shape: "cyl", size: [0.18, 0.1], pos: [0.3, 0.16, 0.3], shade: 1.45, mat: "pale" }
  ],
  sim: [
    { shape: "rbox", size: [0.32, 0.14, 0.95], pos: [0, 0, 0], r: 0.04, shade: 1.0 },
    { shape: "box", size: [0.26, 0.06, 0.5], pos: [0, 0.06, 0.05], r: 0.02, shade: 1.4, mat: "gold" },
    { shape: "cyl", size: [0.1, 0.16], pos: [0, 0, -0.5], rot: [Math.PI / 2, 0, 0], shade: 0.6, mat: "steel" },
    { shape: "plate", size: [0.22, 0.03, 0.8], pos: [0.2, -0.04, 0.2], shade: 0.66 }
  ],
  body: [
    { shape: "rbox", size: [3.35, 0.45, 6.55], pos: [0, 0, 0], r: 0.2, shade: 1.0 },
    { shape: "plate", size: [3.0, 0.16, 6.2], pos: [0, 0.16, 0], shade: 0.82, mat: "dark" },
    { shape: "box", size: [0.1, 0.16, 0.75], pos: [1.7, 0.06, 1.0], r: 0.04, shade: 0.7, mat: "steel" },
    { shape: "box", size: [0.1, 0.16, 0.42], pos: [1.7, 0.06, 1.95], r: 0.04, shade: 0.7, mat: "steel" },
    { shape: "box", size: [0.1, 0.16, 0.42], pos: [-1.7, 0.06, 1.7], r: 0.04, shade: 0.7, mat: "steel" },
    { shape: "plate", size: [0.9, 0.06, 0.1], pos: [0, 0.22, -3.1], shade: 0.6 }
  ]
};

/* ---- the run, desk to gateway ---- */
export const NET_BUILD = {
  pc: [
    { shape: "rbox", size: [1.7, 2.3, 1.7], pos: [0, 0, 0], r: 0.07, shade: 1.0 },
    { shape: "plate", size: [0.1, 2.1, 1.5], pos: [0.85, 0, 0], shade: 0.86, mat: "steel" },
    { shape: "box", size: [0.12, 0.35, 0.5], pos: [0.88, 0.6, 0.3], r: 0.02, shade: 0.5, mat: "black" },
    { shape: "cyl", size: [0.2, 0.1], pos: [0.9, 0.9, -0.4], rot: [0, 0, Math.PI / 2], shade: 1.4, mat: "pale" },
    { shape: "plate", size: [0.06, 0.1, 1.3], pos: [-0.85, -0.4, 0],
      repeat: { count: 7, step: [0, 0.18, 0] }, shade: 0.7 }
  ],
  cable: [
    { shape: "cyl", size: [0.17, 3.5], pos: [0, 0, 0], rot: [0, 0, Math.PI / 2], shade: 1.0 },
    { shape: "rbox", size: [0.36, 0.28, 0.28], pos: [-1.85, 0, 0], r: 0.05, shade: 0.7, mat: "black" },
    { shape: "rbox", size: [0.36, 0.28, 0.28], pos: [1.85, 0, 0], r: 0.05, shade: 0.7, mat: "black" },
    { shape: "box", size: [0.3, 0.24, 0.22], pos: [-2.14, 0, 0], r: 0.03, shade: 1.3, mat: "pale" },
    { shape: "box", size: [0.3, 0.24, 0.22], pos: [2.14, 0, 0], r: 0.03, shade: 1.3, mat: "pale" }
  ],
  shortcable: [
    { shape: "cyl", size: [0.17, 1.2], pos: [0, 0, 0], rot: [0, 0, Math.PI / 2], shade: 1.0 },
    { shape: "rbox", size: [0.34, 0.28, 0.28], pos: [-0.72, 0, 0], r: 0.05, shade: 0.7 },
    { shape: "rbox", size: [0.34, 0.28, 0.28], pos: [0.72, 0, 0], r: 0.05, shade: 0.7 }
  ],
  faceplate: [
    { shape: "rbox", size: [0.14, 1.15, 1.15], pos: [0, 0, 0], r: 0.06, shade: 1.0 },
    { shape: "box", size: [0.14, 0.5, 0.42], pos: [0.06, 0.1, 0], r: 0.03, shade: 0.55 },
    { shape: "cyl", size: [0.12, 0.06], pos: [0.08, 0.48, 0], rot: [0, 0, Math.PI / 2], shade: 0.8 },
    { shape: "cyl", size: [0.12, 0.06], pos: [0.08, -0.48, 0], rot: [0, 0, Math.PI / 2], shade: 0.8 },
    { shape: "plate", size: [0.03, 0.16, 0.6], pos: [0.09, -0.32, 0], shade: 1.3 }
  ],
  panelport: [
    { shape: "rbox", size: [0.35, 0.95, 1.05], pos: [0, 0, 0], r: 0.04, shade: 1.0 },
    { shape: "box", size: [0.2, 0.34, 0.28], pos: [0.12, 0.2, -0.28], r: 0.03, shade: 0.5 },
    { shape: "box", size: [0.2, 0.34, 0.28], pos: [0.12, 0.2, 0.28], r: 0.03, shade: 0.5 },
    { shape: "plate", size: [0.03, 0.14, 0.85], pos: [0.16, -0.28, 0], shade: 1.3 }
  ],
  switchport: [
    { shape: "rbox", size: [0.5, 0.6, 0.62], pos: [0, 0, 0], r: 0.04, shade: 1.0 },
    { shape: "box", size: [0.3, 0.3, 0.34], pos: [0.14, -0.04, 0], r: 0.03, shade: 0.45 },
    { shape: "cyl", size: [0.14, 0.08], pos: [0.2, 0.24, -0.16], rot: [0, 0, Math.PI / 2], shade: 1.5 },
    { shape: "cyl", size: [0.14, 0.08], pos: [0.2, 0.24, 0.16], rot: [0, 0, Math.PI / 2], shade: 1.5 }
  ],
  switch: [
    { shape: "rbox", size: [2.7, 0.95, 2.0], pos: [0, 0, 0], r: 0.05, shade: 1.0 },
    { shape: "box", size: [0.24, 0.26, 0.26], pos: [-1.0, 0.12, 1.0], r: 0.03,
      repeat: { count: 9, step: [0.25, 0, 0] }, shade: 0.42 },
    { shape: "box", size: [0.24, 0.26, 0.26], pos: [-1.0, -0.22, 1.0], r: 0.03,
      repeat: { count: 9, step: [0.25, 0, 0] }, shade: 0.42 },
    { shape: "cyl", size: [0.09, 0.06], pos: [-1.0, 0.3, 1.02], rot: [Math.PI / 2, 0, 0],
      repeat: { count: 9, step: [0.25, 0, 0] }, shade: 1.5 },
    { shape: "plate", size: [0.35, 0.7, 0.12], pos: [-1.5, 0, 0], shade: 0.8 },
    { shape: "plate", size: [0.35, 0.7, 0.12], pos: [1.5, 0, 0], shade: 0.8 },
    { shape: "plate", size: [2.2, 0.1, 0.06], pos: [0, -0.1, -1.02],
      repeat: { count: 5, step: [0, 0.14, 0] }, shade: 0.72 }
  ],
  fibre: [
    { shape: "cyl", size: [0.13, 0.8], pos: [0, 0, 0], rot: [0, 0, Math.PI / 2], shade: 1.0 },
    { shape: "rbox", size: [0.3, 0.2, 0.2], pos: [-0.45, 0, 0], r: 0.03, shade: 0.6 },
    { shape: "rbox", size: [0.3, 0.2, 0.2], pos: [0.45, 0, 0], r: 0.03, shade: 0.6 }
  ],
  router: [
    { shape: "rbox", size: [1.7, 1.5, 1.7], pos: [0, 0, 0], r: 0.07, shade: 1.0 },
    { shape: "cyl", size: [0.12, 1.1], pos: [-0.5, 1.1, -0.5], rot: [0.28, 0, 0.18], shade: 0.6 },
    { shape: "cyl", size: [0.12, 1.1], pos: [0.5, 1.1, -0.5], rot: [0.28, 0, -0.18], shade: 0.6 },
    { shape: "box", size: [0.22, 0.24, 0.24], pos: [-0.4, -0.35, 0.85], r: 0.03,
      repeat: { count: 4, step: [0.27, 0, 0] }, shade: 0.42 },
    { shape: "cyl", size: [0.1, 0.06], pos: [-0.4, 0.35, 0.87], rot: [Math.PI / 2, 0, 0],
      repeat: { count: 3, step: [0.24, 0, 0] }, shade: 1.5 }
  ],
  wallrun: [
    { shape: "cyl", size: [0.16, 3.9], pos: [0, 0, 0], rot: [0, 0, Math.PI / 2], shade: 1.0 },
    { shape: "cyl", size: [0.26, 0.5], pos: [-1.85, 0, 0], rot: [0, 0, Math.PI / 2], shade: 0.65 },
    { shape: "cyl", size: [0.26, 0.5], pos: [1.85, 0, 0], rot: [0, 0, Math.PI / 2], shade: 0.65 }
  ]
};

/* =====================================================================
   The hardware bench — a mid tower on its side, panel off
   ===================================================================== */
export function hardwareModel(G) {
  /* The part the ticket GRADES, which is not always the part the fault
     table names — this track resolves its answer through its own map, and
     reading the wrong one drew the damage on the wrong component. */
  var dtarget = locateTarget(G);
  var a = G.asset, f = G.fault.key, s = G.seedBase;
  var sff = a.caseType === "small form factor";
  /* A small-form-factor box really is smaller, and a student who has only
     ever seen one shape of computer should see the other one. */
  var W = sff ? 0.78 : 1;

  /* The boot drive is a 2.5-inch SATA unit in a bay unless this machine is
     specified with NVMe, in which case it is a stick on the board. The
     second drive is always SATA, which is what the data cable serves. */
  var nvme = a.driveIface === "NVMe" && f !== "cable";

  var parts = [
    {
      key: "cooler", label: "CPU cooler and fan",
      build: HW_BUILD.cooler, finish: "metal", skin: "brushed", scale: W,
      size: [2.4 * W, 1.7, 2.4 * W], pos: [-0.4 * W, 0.95 * W, -2.0 * W],
      color: f === "thermal" ? VISIBLE : HW_COLOR.cooler,
      spec: a.cpuTdp + "W processor under a " + (sff ? "low-profile" : "tower") + " cooler",
      note: f === "thermal"
        ? "The fan is not turning, and the fin stack is packed solid with felted dust. The heatsink is too hot to keep a finger on."
        : "Fan spins freely by hand and the fins are clear. " + wear(s, 1)
    },
    {
      key: "dimm1", label: "Memory slot A1",
      build: HW_BUILD.dimm, finish: "board", skin: "pcb", scale: W,
      size: [0.3, 1.7, 3.2 * W], pos: [1.6 * W, 0.95 * W, -1.4 * W],
      color: HW_COLOR.dimm1,
      spec: a.ramCap + "GB " + a.ramType + "-" + a.ramSpeed + " module, fitted",
      note: f === "ram"
        ? "Seated, latched, no scorching, no corrosion on the contacts. It looks exactly like the one next to it."
        : "Seated and latched. " + wear(s, 2)
    },
    {
      key: "dimm2", label: "Memory slot A2",
      build: HW_BUILD.dimm, finish: "board", skin: "pcb", scale: W,
      size: [0.3, 1.7, 3.2 * W], pos: [2.3 * W, 0.95 * W, -1.4 * W],
      color: HW_COLOR.dimm2,
      spec: a.ramCap + "GB " + a.ramType + "-" + a.ramSpeed + " module, fitted",
      note: "Seated and latched. " + wear(s, 3)
    },
    {
      key: "gpu", label: "Graphics card",
      build: HW_BUILD.gpu, finish: "plastic", skin: "pcb", scale: W,
      /* Dropped to sit in the x16 slot now that the board draws one. The
         card's gold fingers land inside the slot rather than hovering over
         it, which is the difference between a picture of a computer and a
         computer. */
      size: [4.6 * W, 0.4, 1.8 * W], pos: [2.0 * W, 0.42 * W, 2.2 * W],
      color: HW_COLOR.gpu,
      spec: a.gpuWatts + "W card, " + (sff ? "half height" : "full height") +
        ", " + a.caseMaxGpu + "mm of clearance in this case",
      note: f === "video"
        ? "Seated and the fans spin at power-on, but there is no output on either of its ports."
        : "Seated, power connector home, fans spin at power-on. " + wear(s, 4)
    },
    {
      key: "drive0", label: nvme ? "Boot drive (M.2 NVMe)" : "Boot drive (2.5\" SATA)",
      build: nvme ? HW_BUILD.m2 : HW_BUILD.drive25,
      finish: nvme ? "board" : "steel",
      /* The label carries THIS ticket's drive, printed from the same values
         the specification panel quotes. A student reads the capacity off
         the part the way they would on a bench, and there is no second copy
         of that number anywhere to drift out of step with the paperwork.
         An M.2 stick has no label worth reading, so it gets its board. */
      skin: nvme ? "pcb" : { kind: "label", lines: [
        a.driveCap + "GB", a.driveIface, "2.5 in / 7mm"
      ] },
      scale: W,
      size: nvme ? [2.6 * W, 0.28, 1.0 * W] : [1.4, 0.5, 2.2 * W],
      /* The stick lies in the board's M.2 socket, on the thermal pad and
         over the standoff, instead of floating above the general area. */
      pos: nvme ? [0.4 * W, 0.06 * W, 0.72 * W] : [-5.0 * W, 0.35 * W, 3.4 * W],
      color: HW_COLOR.drive0,
      spec: a.driveCap + "GB " + a.driveIface,
      note: f === "drive"
        ? "Nothing to see. It is a sealed unit with no moving parts to watch and no lights on it. Whatever it is doing, it is doing it silently."
        : "Mounted and connected. " + wear(s, 5)
    },
    {
      key: "drive1", label: "Second drive (2.5\" SATA)",
      build: HW_BUILD.drive25, finish: "steel", scale: W,
      size: [1.4, 0.5, 2.2 * W], pos: [-5.0 * W, 0.35 * W, 0.4 * W],
      color: HW_COLOR.drive1,
      spec: "1TB SATA, data volume",
      note: "Mounted and connected. " + wear(s, 6)
    },
    {
      key: "satacable", label: "SATA data cable",
      build: HW_BUILD.satacable, finish: "plastic", scale: W,
      size: [3.4 * W, 0.12, 0.5], pos: [-2.3 * W, 0.45 * W, 2.2 * W],
      color: HW_COLOR.satacable,
      spec: "Board to drive bay, right-angle connector at the drive end",
      note: f === "cable"
        ? "Routed round the back of the bay with a tight bend at the connector, and the latch does not click when you push it home."
        : "Routed cleanly, latch clicks home at both ends. " + wear(s, 7)
    },
    {
      key: "psu", label: "Power supply",
      build: HW_BUILD.psu, finish: "steel", scale: W,
      size: [3.0 * W, 2.4 * W, 3.0 * W], pos: [-5.0 * W, 1.3 * W, -3.6 * W],
      color: HW_COLOR.psu,
      spec: a.psuWatts + "W " + (sff ? "SFX" : "ATX") + ", measured peak draw " + a.peakDraw + "W",
      note: f === "psu"
        ? "Fan turns, but the unit ticks quietly at idle and there is a faint smell of hot varnish off the vents."
        : "Fan turns, no noise, no smell, all rails connected. " + wear(s, 8)
    },
    {
      key: "casefan", label: "Rear case fan",
      build: HW_BUILD.casefan, finish: "plastic", scale: W,
      size: [2.2 * W, 0.5, 2.2 * W], pos: [5.4 * W, 1.4 * W, -2.4 * W],
      rot: [0, 0, Math.PI / 2],
      color: HW_COLOR.casefan,
      spec: "120mm exhaust",
      note: "Turning at power-on, filter is grey but passing air. " + wear(s, 9)
    },
    {
      key: "cmos", label: "CMOS coin cell",
      build: HW_BUILD.cmos, finish: "steel", scale: W,
      size: [0.8, 0.16, 0.8], pos: [3.6 * W, 0.12 * W, 3.6 * W],
      color: HW_COLOR.cmos,
      spec: "CR2032 on the board, original to the machine",
      note: f === "cmos"
        ? "The date stamped on the cell is " + (2026 - a.age - 1) + ". It has been in there since the machine was built."
        : "In its holder, clip tight. " + wear(s, 10)
    },
    {
      key: "panel", label: "Front panel and diagnostic LED",
      build: HW_BUILD.panel, finish: "plastic", scale: W,
      size: [0.5, 0.7, 1.8 * W], pos: [5.6 * W, 0.35 * W, 3.2 * W],
      color: HW_COLOR.panel,
      spec: "Power, activity and diagnostic indicators",
      note: "Header connected. What it shows at power-on is in the POST report above."
    }
  ];

  /* The motherboard used to be scenery, on the reasoning that you point at
     what is bolted to it rather than at the board. That is true right up
     until the fault IS the board — and a technician has to be able to look
     at the capacitor bank around the voltage regulators and tell a healthy
     flat top from a domed or vented one, because that is what turns a
     diagnosis into a board on an order. So it is a part you can select and
     read, like everything else. */
  parts.push({
    key: "mobo", label: "Motherboard",
    /* `skin` paints the surface rather than colouring it: copper, solder
       mask, silkscreen and pads, with a relief map so the copper catches
       the light. A green rectangle is not a circuit board, and a student
       who has only ever seen the green rectangle recognises nothing when
       they open a real machine. See assets/surface.js. */
    build: mbBuild(1, f === "bulgecap"), finish: "board", scale: W, skin: "pcb",
    pos: [1.8 * W, -0.2 * W, 0.2 * W], color: HW_COLOR.mobo,
    spec: a.socket + ", " + a.ramType + ", " + (sff ? "microATX" : "ATX") + " form factor",
    note: f === "bulgecap"
      ? "Look at the capacitor bank beside the processor socket. Four of the six are domed rather than " +
        "flat-topped, and one has split at the scoring on its top and left a crust of dried electrolyte. " +
        "A healthy capacitor is flat. These are not."
      : "The capacitors beside the socket are flat-topped and clean, no discolouration, no bulging, " +
        "nothing weeping. " + wear(s, 12)
  });

  return {
    kind: "hardware",
    title: a.tag + " on the bench, side panel off",
    caption: "A " + a.caseType + " with the side panel removed, seen from above and to one side. " +
      "Everything you can point at is listed beside it, and that includes the board.",
    board: { size: [13 * W, 0.3, 11.5 * W], pos: [0.1 * W, -0.5 * W, -0.3 * W], color: "#7c868e",
      build: chassisBuild(W), scale: W },
    decor: [],
      /* THE FAULT HAS TO BE VISIBLE. `damage` is a no-op for every fault
         with no physical tell, which on this track is most of them — see
         the notes beside each part, and assets/damage.js for why. */
      parts: parts.map((p) => (p.key === dtarget ? damage(p, G.fault && G.fault.key) : p)),
    camera: { dist: 15.5, yaw: 0.72, pitch: 0.58, target: [0.4, 0.7, 0], min: 8, max: 32 }
  };
}

/* =====================================================================
   The handset — an exploded repair view

   Stacked and pulled apart, the way a repair guide draws it, because the
   distinction this view exists to teach is display against digitizer and
   you cannot see that on an assembled phone.
   ===================================================================== */
export function mobileModel(G) {
  /* The part the ticket GRADES, which is not always the part the fault
     table names — this track resolves its answer through its own map, and
     reading the wrong one drew the damage on the wrong component. */
  var dtarget = locateTarget(G);
  var d = G.device, f = G.fault.key, s = G.seedBase;

  var parts = [
    {
      key: "glass", label: "Cover glass",
      build: MOB_BUILD.glass, finish: "glass", pos: [0, 4.3, 0], color: MOB_COLOR.glass,
      spec: "Front glass, bonded to the assembly below it",
      note: f === "digitizer"
        ? "A hairline chip at the lower left corner, consistent with the drop. The glass is otherwise intact and the picture through it is perfect."
        : f === "protector"
        ? "The glass itself is unmarked. What is on top of it is not: a tempered-glass protector has lifted along the right edge, and there is a rainbow-edged air gap under it running the length of that side \u2014 exactly where touch stops registering."
        : "Intact, no cracks. " + wear(s, 1)
    },
    {
      key: "digitizer", label: "Digitizer (the touch layer)",
      build: MOB_BUILD.digitizer, finish: "plastic", pos: [0, 3.2, 0],
      color: MOB_COLOR.digitizer,
      spec: "Capacitive touch grid, bonded to the display",
      note: f === "digitizer"
        ? "A band roughly 8mm wide down one long edge registers nothing at all. Rotate the device and the dead band stays where it is in the world, not on the screen."
        : "Registers touch evenly across the whole surface. " + wear(s, 2)
    },
    {
      key: "screen", label: "Display panel",
      build: MOB_BUILD.screen, finish: "glass", pos: [0, 2.1, 0], color: MOB_COLOR.screen,
      spec: "OLED panel, " + d.model,
      note: "Even brightness, no discolouration, no dead pixels. The picture is perfect. " + wear(s, 3)
    },
    {
      key: "battery", label: "Battery",
      build: MOB_BUILD.battery, finish: "matte", pos: [0, 1.0, -0.6],
      color: MOB_COLOR.battery,
      spec: d.batteryHealth + "% health, " + d.cycles + " cycles",
      note: f === "battery"
        ? "No swelling, no discolouration — it looks completely normal. The health figure is the only thing wrong with it and you cannot see a number by looking."
        : (f === "overheat"
          ? "Warm to the touch and it has been off charge for twenty minutes. No swelling. " + wear(s, 4)
          : "Flat, no swelling, adhesive tabs intact. " + wear(s, 4))
    },
    {
      key: "logic", label: "Logic board",
      build: MOB_BUILD.logic, finish: "board", pos: [-0.35, 1.0, 2.4], color: MOB_COLOR.logic,
      spec: d.storageGb + "GB storage, running " + d.os + " (current is " + d.osCurrent + ")",
      note: f === "liquid"
        ? "The liquid contact indicator beside the battery connector has gone from white to red, and there is a bloom of green corrosion creeping out from under two of the board connectors. Everything on it works today. Corrosion does not stop on its own."
        : "No corrosion, no liquid indicator triggered, all connectors seated. " + wear(s, 5)
    },
    {
      key: "port", label: "Charging port",
      build: MOB_BUILD.port, finish: "metal", pos: [0, 1.0, -3.35],
      color: f === "port" ? VISIBLE : MOB_COLOR.port,
      spec: "USB-C, soldered to a daughterboard",
      note: f === "port"
        ? "Packed with compressed grey pocket lint. A cable will go in about three quarters of the way and stops."
        : "Clean, pins straight, connector seats fully with a click. " + wear(s, 6)
    },
    {
      key: "camera", label: "Rear camera module",
      build: MOB_BUILD.camera, finish: "metal", pos: [1.05, 1.05, 2.7], color: MOB_COLOR.camera,
      spec: "Main sensor and flash",
      note: f === "rearcam"
        ? "The module focuses, meters and exposes correctly \u2014 you can watch it do all three. The glass in front of it is hazed with fine scratches that only show under a raking light, and that is what daylight is bouncing off."
        : "Lens clear, focuses normally. " + wear(s, 7)
    },
    {
      key: "sim", label: "SIM tray and antenna flex",
      build: MOB_BUILD.sim, finish: "steel", pos: [1.05, 1.0, 1.6], color: MOB_COLOR.sim,
      spec: "Carrier: registered, " + (f === "cellular" ? "full signal, no data path" : "normal service"),
      note: f === "cellular"
        ? "The SIM is seated and the device shows full bars. Nothing about the tray or the flex explains a phone with signal and no data."
        : "Seated, contacts clean, flex undamaged. " + wear(s, 8)
    },
    {
      key: "earpiece", label: "Earpiece speaker",
      build: MOB_BUILD.earpiece, finish: "matte", pos: [0, 5.0, -2.9],
      color: MOB_COLOR.earpiece,
      spec: "The small driver you hold to your ear, behind a grille in the top bezel",
      note: f === "speaker"
        ? "The mesh is packed solid with pocket debris. The loudspeaker at the bottom of the device is clear and works perfectly."
        : "Grille clear, driver sounds normal on a test call. " + wear(s, 10)
    },
    {
      key: "body", label: "Chassis, case and mounting",
      build: MOB_BUILD.body, finish: "metal", pos: [0, 0, 0],
      color: f === "overheat" ? VISIBLE : MOB_COLOR.body,
      spec: d.model + ", " + d.ageMonths + " months old, " +
        (d.warranty ? "in warranty" : "out of warranty"),
      note: f === "overheat"
        ? "In a thick rubber armour case with the back cover still on, and the vehicle cradle it lives in faces the windscreen. The case has never been off it."
        : "Frame straight, no drop damage to the corners. " + wear(s, 9)
    }
  ];

  return {
    kind: "mobile",
    title: d.model + ", exploded",
    caption: "The handset pulled apart into its layers, cover glass at the top down to the chassis at the bottom. " +
      "The display and the digitizer are two different parts sitting on top of one another.",
    board: null,
    decor: [],
      /* THE FAULT HAS TO BE VISIBLE. `damage` is a no-op for every fault
         with no physical tell, which on this track is most of them — see
         the notes beside each part, and assets/damage.js for why. */
      parts: parts.map((p) => (p.key === dtarget ? damage(p, G.fault && G.fault.key) : p)),
    camera: { dist: 13.5, yaw: 0.55, pitch: 0.26, target: [0, 2.1, 0], min: 6, max: 30 }
  };
}

/* =====================================================================
   The run — desk to switch to router, laid out end to end

   Five of the seven networking faults are settings and have no physical
   home at all. That is the point of pointing at this: deciding whether you
   are looking for a wire, a port, or a line in a configuration.
   ===================================================================== */
export function networkModel(G, link) {
  /* The part the ticket GRADES, which is not always the part the fault
     table names — this track resolves its answer through its own map, and
     reading the wrong one drew the damage on the wrong component. */
  var dtarget = locateTarget(G);
  var f = G.fault.key, s = G.seedBase;
  link = link || {};
  var bad = f === "patch";

  /* Link state gets a colour, and the same state is written out in the note
     underneath. Colour is the reminder, never the message. */
  var linkColor = bad ? "#c98a2a" : "#3f6d5a";

  var parts = [
    {
      key: "pc", label: "The workstation and its IP configuration",
      build: NET_BUILD.pc, finish: "plastic", pos: [-7.6, 1.2, 0],
      color: NET_COLOR.pc,
      spec: G.asset.tag + ", adapter " + G.mac,
      note: "The adapter is fitted and enabled and the link light on the back of it is lit. " +
        "Everything the machine believes about the network is in the ipconfig output above, " +
        "and none of it is visible from out here."
    },
    {
      key: "deskcable", label: "Patch cable, desk to wall",
      build: NET_BUILD.cable, finish: "rubber", pos: [-4.3, 0.5, 0],
      color: bad ? VISIBLE : NET_COLOR.deskcable,
      spec: "Cat 5e, roughly 3 metres",
      note: bad
        ? "It runs under the castor track of the chair and the jacket is flattened where the chair has been over it. The boot on the wall end has lost its latch."
        : "Runs clear of the chair, both boots latched, jacket undamaged. " + wear(s, 1)
    },
    {
      key: "wallport", label: "Wall outlet",
      build: NET_BUILD.faceplate, finish: "plastic", pos: [-1.85, 0.6, 0], color: NET_COLOR.wallport,
      spec: "Outlet " + (link.port ? link.port.replace("Gi1/0/", "B-") : "B-14"),
      note: "Faceplate secure, labelled, jack clean. " + wear(s, 2)
    },
    {
      key: "horizontal", label: "In-wall horizontal run",
      build: NET_BUILD.wallrun, finish: "rubber", pos: [0.0, 3.2, 0], color: NET_COLOR.horizontal,
      spec: "Structured cabling, outlet to patch panel",
      note: "Terminated at both ends and inaccessible without a ladder and a ceiling tile. " +
        "Nothing on this ticket suggests going up there yet."
    },
    {
      key: "panelport", label: "Patch panel port",
      build: NET_BUILD.panelport, finish: "metal", pos: [1.9, 0.5, 0], color: NET_COLOR.panelport,
      spec: "Panel 2, port " + (link.port ? link.port.replace("Gi1/0/", "") : "14"),
      note: "Punched down cleanly, labelled to match the outlet. " + wear(s, 3)
    },
    {
      key: "patchlead", label: "Patch lead, panel to switch",
      build: NET_BUILD.shortcable, finish: "rubber", pos: [3.15, 0.5, 0], color: NET_COLOR.patchlead,
      spec: "Cat 6, 0.5 metre",
      note: "Short, dressed into the cable manager, both ends latched. " + wear(s, 4)
    },
    {
      key: "switchport", label: "Switch port " + (link.port || "Gi1/0/14"),
      build: NET_BUILD.switchport, finish: "plastic", pos: [4.4, 0.4, 0],
      color: linkColor,
      spec: "VLAN " + (link.vlan || "12 (Staff)") + ", " + (link.speed || "1.0 Gbps full duplex"),
      note: (bad
        ? "The link light is on but amber rather than green, which on this switch means it came up below gigabit."
        : "Link light steady green.") +
        (f === "vlan"
          ? " The port's VLAN membership is not something you can see from the front of the switch — it is in the configuration."
          : "")
    },
    {
      key: "sw", label: "Access switch",
      build: NET_BUILD.switch, finish: "steel", pos: [6.6, 0.5, 0], color: NET_COLOR.sw,
      spec: "48-port gigabit, uptime " + Math.floor((link.uptimeMins || 1440) / 60) + " hours",
      note: "Powered, fans normal, no alarm LED, forty-odd other ports lit and working. " + wear(s, 5)
    },
    {
      key: "uplink", label: "Uplink to the router",
      build: NET_BUILD.fibre, finish: "rubber", pos: [9.0, 0.6, 0], color: NET_COLOR.uplink,
      spec: "Fibre uplink",
      note: "Up, and carrying everybody else in the building without complaint."
    },
    {
      key: "router", label: "Router and default gateway",
      build: NET_BUILD.router, finish: "plastic", pos: [10.7, 0.8, 0], color: NET_COLOR.router,
      spec: G.topo ? G.topo.gw : "the gateway",
      note: "Answering, routing, and reachable from every other machine on this floor."
    }
  ];

  return {
    kind: "network",
    title: "The run, desk to gateway",
    caption: "One user's connection laid out end to end: the machine, the cable under the desk, the outlet, " +
      "the run in the wall, the patch panel, the switch port, and the gateway beyond it.",
    board: { size: [23, 0.4, 5.5], pos: [1.6, -0.5, 0], color: "#7c868e" },
    decor: [],
      /* THE FAULT HAS TO BE VISIBLE. `damage` is a no-op for every fault
         with no physical tell, which on this track is most of them — see
         the notes beside each part, and assets/damage.js for why. */
      parts: parts.map((p) => (p.key === dtarget ? damage(p, G.fault && G.fault.key) : p)),
    camera: { dist: 22.5, yaw: 0.30, pitch: 0.40, target: [1.5, 1.1, 0], min: 10, max: 48 }
  };
}

/* =====================================================================
   Where the fault actually lives

   Returned as a part key plus the reason, so the locate question grades
   against the same ground truth everything else does.
   ===================================================================== */
export function locateTarget(G) {
  if (G.track === "hardware") {
    return {
      ram: "dimm1", psu: "psu", drive: "drive0", cable: "satacable",
      video: "gpu", thermal: "cooler", cmos: "cmos",
      psufan: "psu", gpufan: "gpu", nvmethermal: "drive0", m2loose: "drive0",
      frontpanel: "panel",
      ramslot: "dimm2", cpupaste: "cooler", dimmspeed: "dimm2", gpuseat: "gpu",
      bulgecap: "mobo",
      fanheader: "casefan"
    }[G.fault.key];
  }
  if (G.track === "mobile") {
    return {
      battery: "battery", port: "port", digitizer: "digitizer",
      overheat: "none", cellular: "none", mdm: "none", storage: "none",
      speaker: "earpiece", swollen: "battery",
      wificall: "none", profile: "none", backupfail: "none",
      /* Three of the five newest faults do resolve to a part, and two of
         them are the accessory rather than the device — which is the whole
         reason they are on the track. */
      protector: "glass", rearcam: "camera", liquid: "logic",
      nfcoff: "none", eol: "none",
      /* All five of the newest are configuration: there is nothing on the
         bench to point at, which is itself the answer worth giving. */
      hotspot: "none", btpair: "none", captiveportal: "none",
      vpnalways: "none", appperm: "none"
    }[G.fault.key];
  }
  /* The cloud track. Thirteen of the seventeen resolve to no part at all,
     and that is the objective rather than a gap in the model: a licence, a
     region, a quota and a snapshot are none of them in the box. The four
     that DO resolve point at what has been promised — never at the hardware,
     which on this track is the reflex the fault data itself names. */
  if (G.track === "cloud") {
    return {
      vmram: "ramplan",         // too much memory promised, not bad memory
      cpuready: "cpuplan",      // too much vCPU promised, not too few cores
      vdi: "datastore",         // too many desktops on one of them
      thinprov: "datastore"     // more space promised than the datastore has
    }[G.fault.key] || "none";
  }
  if (G.track === "network") {
    return { patch: "deskcable", vlan: "switchport",
      duplex: "switchport", portsec: "switchport", loop: "switchport",
      wifiband: "pc", mtu: "pc", dnsold: "pc", hosts: "pc" }[G.fault.key] || "pc";
  }
  /* Both printer engines resolve to the part the ticket already computed —
     which on the repeating-defect ticket is not known until the interval has
     been measured, so it comes from the machine rather than the fault. */
  if (G.track === "laser" || G.track === "inkjet") return G.partTarget;
  if (G.track === "laptop" || G.track === "display" || G.track === "cabling"
      || G.track === "power" || G.track === "raid" || G.track === "printnet") return G.partTarget;
  return null;
}

/* The correct-answer explanation for a track that has no hand-written map
   for this part. Built from the part's own inspection note and the fault's
   reasoning, so it is specific to both rather than a shrug. */
function genericRight(G, right, model) {
  var p = model.parts.filter(function (x) { return x.key === right; })[0];
  var f = G.fault;
  return (p ? p.label + ". " : "") + (f.root || "") +
    (f.wrongWhy ? " And it is not the " + noArticle(f.wrongReflex || "obvious one") + ": " + f.wrongWhy : "");
}

/* Why that one, and why not the one they picked. Written to be worth
   reading when they get it right as well as when they do not — the
   right-answer text is where the reasoning goes. */
export function locateWhy(G, chosen, model) {
  var right = locateTarget(G);
  var name = function (k) {
    if (k === "none") return "no physical part";
    var p = model.parts.filter(function (x) { return x.key === k; })[0];
    return p ? p.label.toLowerCase() : k;
  };

  if (chosen === right) {
    if (G.track === "printnet") {
      return {
        workstation: "The workstation \u2014 which on a printer call means one of three separate things that all " +
          "live here and all get called 'the printer': the driver, the local queue, and the port underneath them. " +
          "The device is healthy and every other user is printing to it.",
        printer: "The device \u2014 its configuration rather than its mechanism. It prints its own page perfectly, " +
          "which clears the engine, the toner and the paper path. What is stale is something it holds: an address, " +
          "a user list, a set of credentials, a mail server.",
        switch: "The boundary, rather than anything broken. The switch is doing exactly what it was configured to " +
          "do, and the traffic being relied on was never going to cross it.",
        server: "The print server. One queue, one file of jobs, and one of them at the head of it holding the " +
          "entire site's printing to a device that is sitting there idle.",
        usbcable: "The cable.",
        ap: "The access point.",
        none: "Nothing in the chain. " + G.fault.fixes + " Every link between the user and the device is healthy, " +
          "and the job was never sent down it."
      }[right];
    }
    if (G.track === "raid") {
      if (/^slot/.test(right)) {
        var d = (G.array.disks || []).filter(function (x) { return "slot" + x.slot === right; })[0] || {};
        return {
          member1: "The failed member, in slot " + d.slot + ". Every byte of the array's data is still there and " +
            "the protection around it is not \u2014 which is what makes this today's job rather than this week's.",
          member2: "One of the two failed members. Naming either is right and neither of them is the point: on a " +
            "level that tolerates one failure, the second one is the end of the array.",
          raid0: "The failed member. It is the only one that has failed, and on this level that was always going " +
            "to be enough, because there was never any redundancy to lose.",
          predfail: "The member that has not failed yet. It is Online, it is serving, and its own attributes say " +
            "it is going \u2014 which makes this the safest version of this job you will ever be handed.",
          rebuildstall: "The surviving member with the medium errors, not the one that failed. The rebuild is " +
            "reading every sector of this disk and finding sectors it cannot read, and that is why the " +
            "percentage has not moved in days.",
          spareidle: "The idle disk, in slot " + d.slot + ". It is healthy, it is spinning, and it belongs to " +
            "nothing \u2014 which is why the array beside it has been degraded for a fortnight waiting for a " +
            "rebuild that was never going to start.",
          smallreplace: "The replacement that was fitted, in slot " + d.slot + ". It is " + d.capGb +
            "GB against a member size the array will not go below, and the controller is refusing to start " +
            "something that could not finish.",
          backplane: "One of the slots that went. Both of them went in the same second and both disks pass a " +
            "full test elsewhere \u2014 which is what puts this in the thing those slots have in common rather " +
            "than in either disk.",
          wrongslot: "The healthy member somebody pulled, in slot " + d.slot + ". It is the disk that matters " +
            "on this ticket: the failed one is still sitting in the machine doing nothing, and this is the one " +
            "whose removal took the array offline.",
          rebuildslow: "The failed member, being rebuilt onto \u2014 and slowly. The disk is fine and the " +
            "rebuild is genuinely advancing, which is exactly what tells you the problem is how much attention " +
            "the controller is giving it."
        }[G.fault.key];
      }
      return {
        controller: "The controller \u2014 as the thing holding the configuration, not as broken hardware. Every " +
          "disk is healthy and the card is refusing to assemble an array it does not believe is its own. What " +
          "you do to it next is the whole ticket, and one of the two options on that screen is irreversible.",
        cache: "The cache battery. Every member is optimal and no disk is slow \u2014 the controller has simply " +
          "stopped trusting a cache it can no longer promise to flush, and dropped to write-through to be safe.",
        backup: "The backup, or rather its absence. The array is perfect and did exactly what it is built to do, " +
          "which was to write that deletion to every member instantly. Nothing about RAID was ever going to " +
          "help here, and the finding on this ticket is that the thing that would have has never once run.",
        enclosure: "The enclosure \u2014 or its backplane. Two slots went in the same second and both disks pass " +
          "a full surface test in another chassis. Disks do not fail in formation; slots that share a backplane do."
      }[right];
    }
    if (G.track === "power") {
      return {
        psu: "The supply. It is the one part in the machine that can look, sound and smell perfectly healthy while " +
          "being measurably out of specification, and the only way to know is to put a meter on it under load.",
        outlet: "The outlet \u2014 which is to say, the building. Nothing in the machine is at fault, the readings say " +
          "so, and the fix is not yours. Getting to that answer and stopping there is the whole skill on this ticket.",
        ups: "The UPS. Not broken \u2014 asked to carry more than it is rated for, which is a different thing and has a " +
          "different fix. Watts, not VA, is the number that decides it.",
        upscell: "The battery pack, not the unit. Sealed lead-acid cells are a consumable with a service life in " +
          "years whether they are ever used or not, and the electronics around them are the expensive half.",
        strip: "The strips, and specifically the joint between them. The heat in a chained run goes into one plug and " +
          "one set of contacts, and that plug is the one the user told you was warm.",
        breaker: "The breaker \u2014 as the thing that is at the centre of this, not as the thing that is broken. It is " +
          "the only component here doing exactly what it was fitted to do, and what has to change is the load on it.",
        module: "The module. Every rail and every temperature on this machine is inside tolerance, and the failures " +
          "date from the day it went in. Static damage leaves no mark and no measurement \u2014 only a history.",
        none: "Nothing on this bench. " + G.fault.fixes + " Reaching for a part here means buying something to fix a " +
          "problem that is upstream of everything you could buy."
      }[right];
    }
    if (G.track === "cabling") {
      return {
        plugnear: "The plug at the desk end. The tester reports from the end you are standing at, and this is " +
          "the end whose contacts are wrong. Two minutes and a new plug — but only once you know it is this " +
          "end rather than the one down the corridor.",
        plugfar: "The plug at the far end. Everything about this fault says one end is terminated differently " +
          "from the other, and the tester tells you which side the crossing is on. Re-doing the end you happen " +
          "to be next to is the most common wasted trip on this job.",
        keystone: "The keystone jack in the outlet. It is punched down, it is neat, and neatness is not the " +
          "same as correct — what was done to the pairs in the last half inch before the block is the fault.",
        horizontal: "The horizontal run itself. There is no plug you can fit and no cleaning you can do; the " +
          "cable is simply longer than the standard allows, and the only fixes are a shorter route or closer " +
          "equipment.",
        panelport: "The panel port. The copper from the desk to here is perfect and the tester proves it. What " +
          "is missing is anything on the front of the port — the run was installed and never patched through.",
        patchcord: "The patch cord in the comms room. A link runs at the speed of its slowest component, and " +
          "this cord is the only component on the whole chain that is not rated for what the link is meant to do.",
        switchport: "The switch port."
      }[right];
    }
    if (G.track === "hardware") {
      return {
        dimm1: "Slot A1. The one-module test told you it fails on the first module and stays up on the second — so the fault is in that slot's module, and the other one is fine. Ordering \"some memory\" without knowing which stick is the difference between a fix and a coin toss.",
        psu: "The power supply. It is the one part in the machine that can take everything else down with it while looking perfectly healthy, and it is the one part people replace last.",
        drive0: "The boot drive. Nothing about it looks wrong, which is the honest answer — a failing drive gives you SMART attributes and nothing else. This is a fault you read, not one you see.",
        satacable: "The data cable. Two dollars of copper, and it produces symptoms that look exactly like a dying drive until you notice every other SMART attribute is clean.",
        gpu: "The graphics card. The integrated output brought the picture back on the same monitor and the same cable, which puts the fault on the card and nowhere else.",
        cooler: "The CPU cooler. A stopped fan and a fin stack full of felted dust is a fault you can see from the doorway, and it is the reason to open the case before you open a terminal.",
        cmos: "The coin cell. It is the cheapest part in the machine and the one that produces the strangest-looking symptoms when it goes.",
        dimm2: "Slot A2 \u2014 the slot, not the module in it. Either module reports its full size in the other " +
          "slots and neither is seen in this one, which is two good modules and one dead socket. There is no " +
          "part in the catalogue that fixes a slot.",
        mobo: "The board. Five of the seven capacitors around the voltage regulators are domed instead of " +
          "flat-topped and one has vented, and that is a diagnosis you make with your eyes rather than with " +
          "an instrument. It is also the one fault in this machine where no smaller part will do \u2014 the " +
          "regulation that has failed is on the board, so the board is what gets ordered.",
        casefan: "The case fan \u2014 and specifically which header it is plugged into. Every temperature in the " +
          "machine is normal and it is running flat out anyway, because nothing is telling it to slow down.",
        panel: "The front panel switch. Every rail is in tolerance and the machine runs for days once it is started \u2014 a supply that could not start a machine could not run one either."
      }[right] || genericRight(G, right, model);
    }
    if (G.track === "mobile") {
      return {
        battery: "The battery. Health well down and a high cycle count for its age — and note that it looks completely normal, because a worn cell usually does.",
        port: "The charging port. It is the single most common physical fault on a handset and the single most commonly replaced part that did not need replacing.",
        earpiece: "The earpiece, not the microphone and not the loudspeaker. The other end hears them perfectly and " +
          "the loudspeaker is clear, which leaves exactly one of the two speakers in this device \u2014 and it is packed " +
          "with pocket debris rather than broken.",
        digitizer: "The digitizer, not the display. The picture is perfect; it is the touch layer that has a dead band. They are two separate parts bonded together, and knowing which one you are ordering is the difference between a $" + (G.device ? G.device.screenRepair : 0) + " job and the wrong part arriving.",
        glass: "The glass \u2014 or rather what is stuck to it. The panel underneath has not got a mark on it " +
          "and touch is perfect once the protector comes off. This is the cheapest fix on the whole track and it " +
          "sits directly next to the most expensive wrong answer.",
        camera: "The rear camera \u2014 the glass over it, not the module behind it. The module focuses, meters and " +
          "exposes correctly, and the picture is fine indoors. A failed sensor would not care what the light was " +
          "doing; a scratched window is the only thing that fails in daylight and recovers in the dark.",
        logic: "The board. The liquid indicator has triggered and there is corrosion around the connectors \u2014 " +
          "which means the warranty conversation is over before it starts and the device is running on borrowed " +
          "time. Nothing here is repaired, only postponed.",
        none: "Nothing physical. " + G.fault.fixes + " Reaching for a part here would cost the customer money to fix something that is not broken."
      }[right] || genericRight(G, right, model);
    }
    /* Tracks without their own map fall through to an explanation built
       from the part and the fault. The printer, laptop and display tracks
       spent a long time falling through to the NETWORK map instead, which
       returned undefined and printed the word "undefined" where the
       reasoning should have been on every correct answer. */
    /* "Nothing physical" reads differently on every track that offers it,
       so the tracks without their own map get it here rather than falling
       into a sentence built from a part that does not exist. */
    if (right === "none") {
      return "Nothing physical. " + G.fault.fixes + " Opening this machine, or ordering anything for it, " +
        "would be work done on a device that has nothing wrong with it.";
    }
    return ({
      deskcable: "The patch cable under the desk. The link came up at a tenth of its speed with an error count climbing, and that is a physical-layer answer.",
      switchport: "The switch port. The machine is configured correctly and the cable is fine — it has simply been put on a network it is not supposed to be on, and that is a change request to whoever owns the switch, not a fix you make at the desk.",
      pc: "Nothing physical on the run. The cable is good, the port is good, the switch is good, the gateway is answering. The fault is in this workstation's own configuration, which is why walking the cable would have taught you nothing."
    })[right] || genericRight(G, right, model);
  }

  /* Wrong answers. The interesting ones get a real explanation; the rest
     get the evidence that clears them. */
  var special = {
    earpiece: "The earpiece is clear and sounds normal on a test call.",
    screen: "The display is not the digitizer. The picture is perfect — every pixel, full brightness, correct colour. What has failed is the layer above it that senses your finger. Order a display and you will have paid for a working part and still have a phone nobody can use.",
    dimm2: "The second module is the one that works. The one-module test boots and stays up on it; the failure follows the first.",
    drive1: "The second drive is a data volume with clean SMART. The symptom is on the boot device.",
    horizontal: "The run in the wall is terminated at both ends and has not been touched. Going up a ladder before you have checked the cable lying on the floor under a chair is a long way round.",
    sw: "The switch is carrying forty other ports without complaint. A failed switch does not single out one user.",
    router: "The gateway is answering every other machine on this floor, and it answered this one before " +
      "the fault started. A router that had failed would not produce a ticket about one desk — it would " +
      "produce a queue of them.",
    logic: "The board is clean, connectors seated, no liquid damage. Nothing on this ticket points at it.",
    glass: "The glass is intact and you can see through it perfectly. Cracked glass and a dead touch layer are different faults and they are billed differently.",
    none: "There is a physical part at fault here, and a setting will not mend it."
  };
  /* The cabling track has its own part called "horizontal" and its own
     reasons for clearing each one, so the network-track explanations must
     not answer for it. */
  if (G.track === "printnet") {
    var pnSpecial = {
      workstation: "The driver on this machine is correct for the model, the spooler is running, the local queue is " +
        "empty and the port names the address the device is actually on. There is nothing on this workstation to fix.",
      printer: "It prints its own configuration page perfectly and everything it holds \u2014 its address, its queue, " +
        "its credentials, its mail settings \u2014 checks out.",
      switch: "The port is up at a gigabit with no errors, and the workstation and the device are on the same subnet " +
        "with nothing between them to cross.",
      server: "The shared queue is draining normally with nothing waiting and nothing in an error state.",
      usbcable: "Nothing on this ticket is on the end of a USB cable, and where one is fitted it enumerates cleanly.",
      ap: "The access point is carrying everything else on this floor without complaint, and nothing on this path " +
        "goes through it.",
      none: "Something in the chain is at fault here. The job is not reaching the device, and deciding it is a " +
        "setting leaves it not reaching the device."
    };
    if (pnSpecial[chosen]) return pnSpecial[chosen] + " Whatever is stopping this job, it is not here.";
  }
  if (G.track === "raid") {
    var rd = (G.array.disks || []).filter(function (x) { return "slot" + x.slot === chosen; })[0];
    if (rd) {
      return "Slot " + rd.slot + ": the controller reports it as " + rd.state +
        (rd.predFail ? " with a predictive-failure flag" : "") + ". " +
        (rd.state === "Online" && !rd.predFail && !rd.medium
          ? "It is serving normally and nothing is trending against it."
          : "Read what that state actually means for this level before you decide it is the one.") +
        " Go back to the member list and the level's tolerance.";
    }
    var raidSpecial = {
      controller: "The card is enumerating every channel, running current firmware and logging nothing against " +
        "itself. Controllers do fail, and they fail far less often than they get blamed.",
      cache: "Write-back is enabled, the cache is healthy and the backup unit is charged and passing its own test.",
      enclosure: "Every slot is powered and every slot is enumerating. A backplane fault takes out a group of " +
        "slots at once rather than singling one out, and nothing here is behaving in groups.",
      backup: "The array is backed up nightly and the last restore test passed. The backup is doing its job."
    };
    if (raidSpecial[chosen]) return raidSpecial[chosen] + " Whatever is wrong here, it is not this.";
  }
  if (G.track === "power") {
    var pwrSpecial = {
      psu: "Every rail on this supply is inside its \u00b15% at idle and under load, and Power Good asserts inside its " +
        "window. It is doing its job. A supply is the reflex answer on any power call and it is right about a third of the time.",
      outlet: "The outlet tests correct \u2014 hot, neutral and ground all where they should be. There is nothing behind " +
        "that faceplate for anybody to fix.",
      ups: "The unit is online and normal, carrying a load well inside its watt rating, and its self-test passes.",
      upscell: "The pack passes its self-test and holds the load for the runtime it is rated for. It is a consumable, " +
        "and this is not the day for it.",
      strip: "Every strip on this floor is fed straight from a wall outlet, nothing is chained into anything, and the " +
        "protection indicators are lit.",
      breaker: "The circuit measures comfortably inside 80% of the breaker\u2019s rating with everything on it running. " +
        "Nothing here is asking too much of it.",
      module: "The module is not at fault. Pulling a working card to prove it is a chance to damage one for nothing \u2014 " +
        "which, on this track, is exactly how the fault you are looking at got made.",
      atx24: "The connector is where you measure, not usually what is wrong. It is seated, latched, and no pin is discoloured.",
      none: "There is something here at fault, and deciding there is not is the answer that leaves a hazard in place."
    };
    if (pwrSpecial[chosen]) {
      return pwrSpecial[chosen] + " Whatever is wrong here, it is not this.";
    }
  }
  if (G.track === "cabling") {
    var cabSpecial = {
      plugnear: "The near plug is terminated correctly — every conductor to the front of the plug, in the right " +
        "slots, jacket held under the strain relief. Re-crimping the end you are standing next to is the reflex " +
        "this track exists to break.",
      plugfar: "The far plug matches the near one, colour for colour. Whatever is wrong on this link, both plugs " +
        "agree with each other.",
      keystone: "The outlet is punched down to the site standard with the pairs held right up to the block. It is " +
        "a correct termination.",
      horizontal: "The run in the wall measures well inside the limit with no reflection along it. It has not " +
        "been touched and there is nothing to find up a ladder.",
      panelport: "The panel port is punched down correctly and patched through to a live switch port, which the " +
        "tone confirms.",
      patchcord: "The patch cord is factory-made and printed with a category above what this link needs. It is " +
        "not the limiting component.",
      switchport: "The switch port comes straight up with a known-good cord in it, at full speed. The port is the " +
        "first thing blamed on this kind of call and almost never the thing at fault."
    };
    if (cabSpecial[chosen]) {
      return cabSpecial[chosen] + " Whatever is wrong on this link, it is not this.";
    }
  }
  if (special[chosen]) return special[chosen];

  /* A wrong pick is told WHY that part is clear, and is not told which part
     is not. Naming the answer in the first wrong answer's feedback would
     make the guided hints unreachable — nobody gets to a third attempt on a
     control that has already given it away. */
  var p = model.parts.filter(function (x) { return x.key === chosen; })[0];
  return (p ? p.label + ": " + p.note + " " : "") +
    "Nothing you have found points here. Go back to what your isolating test actually told you.";
}

/* The full list the student chooses from — every part in the model, plus
   the answer that is not a part at all. Tracks where a setting is never the
   answer do not offer it. */
export function locateChoices(model, track) {
  var out = model.parts.map(function (p) { return { key: p.key, label: p.label }; });
  if (track === "mobile") {
    out.push({ key: "none", label: "No physical part — this is a configuration fault" });
  }
  /* On the power track the honest answer to one ticket is that nothing on
     the bench is faulty and the supply into the building is. */
  if (track === "power") {
    out.push({ key: "none", label: "Nothing here — the fault is upstream of all of it" });
  }
  /* Two display tickets are a setting rather than a part, and without this
     option they were tickets with no correct answer on the bench. */
  if (track === "display") {
    out.push({ key: "none", label: "No physical part — this is a setting on the machine" });
  }
  /* One laptop ticket is the firmware's boot order — nothing to open and
     nothing to order. Without this option that ticket had no correct answer
     on the bench at all, which the walker found by picking a button that
     was not there. */
  if (track === "laptop") {
    out.push({ key: "none", label: "No physical part — this is a firmware setting" });
  }
  /* One printer-network ticket is a user setting and nothing in the chain
     is at fault, which is an answer worth being able to give. */
  if (track === "printnet") {
    out.push({ key: "none", label: "Nothing in the chain — this is a setting on the workstation" });
  }
  /* On the cloud track this is the commonest right answer rather than the
     rare one. Thirteen of the seventeen faults are a subscription, a policy
     or a setting, and none of them is in the machine on the bench. */
  if (track === "cloud") {
    out.push({ key: "none", label: "Nothing on this host — it is a service, a policy or a setting" });
  }
  return out;
}

/* =====================================================================
   The two printer engines

   The laser is a cross-section: the paper path from the tray, round the
   drum, through the fuser and out — because on a printer "where did it jam"
   is most of "which roller is it", and that question is inherently spatial.

   The inkjet is a plan view of the carriage and everything the head passes
   over or parks in.

   Same rule as the other three models: colour says what a part IS. Nothing
   here is tinted for being broken, and on these two engines that matters
   more than anywhere else in the build, because most printer faults really
   are visible on inspection — which would make a colour cue a free answer
   on nearly every ticket.
   ===================================================================== */
const PRN_COLOR = {
  tray: "#5c6873", pickup: "#3a4149", separation: "#8f9aa4", registration: "#3a4149",
  charge: "#7a5f8a", drum: "#2f6b4f", developer: "#4a6a7a", transfer: "#a9b3ba",
  fuser: "#a33b3b", exit: "#3a4149", duplex: "#3a4149", polygon: "#3d4f63",
  waste: "#33393f", gears: "#c98a2a", ozone: "#8f9aa4",
  platen: "#7c868e", carriage: "#3d4f63", printhead: "#2f6b4f", belt: "#33393f",
  encoder: "#c9ced3", capping: "#a33b3b", wiper: "#7a5f8a", pump: "#4a6a7a",
  wastepad: "#5c6873", pickupij: "#3a4149", starwheel: "#8f9aa4", encoderwheel: "#c9ced3"
};

/* Build a part's inspection reading from the shared part data, so the model
   and the cleaning module can never drift apart on what a part is. */
function prnPart(def, faulty, seed, i, geo) {
  return Object.assign({
    key: def.key, label: def.label,
    spec: def.role,
    note: faulty && def.seen ? def.seen
      : (def.turns ? "Turns freely, surface in good order. " : "In place and undamaged. ") + wear(seed, i)
  }, geo);
}

export function laserModel(G, parts) {
  const s = G.seedBase, target = G.partTarget;
  const by = {};
  parts.forEach((p) => { by[p.key] = p; });
  const geo = {
    tray:        { build: LAS_BUILD.tray,        finish: "plastic", pos: [-6.4, 0.3, 0] },
    pickup:      { build: LAS_BUILD.roller,      finish: "rubber",  pos: [-4.2, 1.6, 0] },
    separation:  { build: LAS_BUILD.pad,         finish: "rubber",  pos: [-4.2, 0.55, 0] },
    registration:{ build: LAS_BUILD.smallroller, finish: "rubber",  pos: [-2.4, 1.6, 0] },
    transfer:    { build: LAS_BUILD.transfer,    finish: "rubber",  pos: [-0.2, 1.4, 0] },
    drum:        { build: LAS_BUILD.drum,        finish: "plastic", pos: [-0.2, 3.4, 0] },
    charge:      { build: LAS_BUILD.smallroller, finish: "rubber",  pos: [-0.2, 5.2, 0] },
    developer:   { build: LAS_BUILD.devroller,   finish: "rubber",  pos: [-2.4, 3.7, 0] },
    waste:       { build: LAS_BUILD.waste,       finish: "plastic", pos: [-2.4, 5.4, 0] },
    polygon:     { build: LAS_BUILD.polygon,     finish: "plastic", pos: [-4.6, 5.5, 0] },
    fuser:       { build: LAS_BUILD.fuser,       finish: "metal",   pos: [2.2, 2.0, 0] },
    exit:        { build: LAS_BUILD.smallroller, finish: "rubber",  pos: [4.3, 2.9, 0] },
    duplex:      { build: LAS_BUILD.smallroller, finish: "rubber",  pos: [2.2, 0.55, 0] },
    gears:       { build: LAS_BUILD.gears,       finish: "plastic", pos: [-1.0, 3.4, -2.4] },
    ozone:       { build: LAS_BUILD.ozone,       finish: "matte",   pos: [4.3, 5.2, 0] }
  };
  return {
    kind: "laser",
    title: G.printer.model + ", cross-section",
    caption: "The paper path, left to right: out of the tray, round the drum, through the fuser and " +
      "out the top. Knowing where a sheet stops is most of knowing which roller stopped it.",
    board: { size: [15.5, 8.2, 0.3], pos: [-1.6, 2.9, -3.0], color: "#6c757e" },
    decor: [],
    parts: parts.filter((p) => geo[p.key])
      .map((p, i) => prnPart(p, p.key === target, s, i, geo[p.key]))
      .map((p) => Object.assign(p, { color: PRN_COLOR[p.key] }))
      /* THE FAULT HAS TO BE VISIBLE. Measured before this line existed:
         ten tickets on this track rendered ONE machine. The note said the
         part was damaged and the part looked perfect. */
      .map((p) => (p.key === target ? damage(p, G.fault && G.fault.key) : p)),
    camera: { dist: 17.0, yaw: 0.05, pitch: 0.11, target: [-1.6, 2.8, 0], min: 10, max: 46 }
  };
}

export function inkjetModel(G, parts) {
  const s = G.seedBase, target = G.partTarget;
  const geo = {
    platen:      { build: INK_BUILD.platen,       finish: "plastic", pos: [0, 0, 0.4] },
    carriage:    { build: INK_BUILD.carriage,     finish: "plastic", pos: [-2.2, 1.6, -1.0] },
    printhead:   { build: INK_BUILD.printhead,    finish: "metal",   pos: [-2.2, 0.72, -1.0] },
    belt:        { build: INK_BUILD.belt,         finish: "rubber",  pos: [0, 3.0, -1.0] },
    encoder:     { build: INK_BUILD.encoder,      finish: "glass",   pos: [0, 1.7, -2.2] },
    capping:     { build: INK_BUILD.capping,      finish: "rubber",  pos: [3.9, 0.85, -1.0] },
    wiper:       { build: INK_BUILD.wiper,        finish: "rubber",  pos: [2.9, 0.80, -1.0] },
    pump:        { build: INK_BUILD.pump,         finish: "plastic", pos: [4.2, -0.5, 3.6] },
    wastepad:    { build: INK_BUILD.wastepad,     finish: "matte",   pos: [1.0, -0.5, 3.8] },
    pickupij:    { build: INK_BUILD.starwheel,    finish: "rubber",  pos: [-3.7, 0.8, 2.7] },
    starwheel:   { build: INK_BUILD.starwheel,    finish: "steel",   pos: [0.6, 0.7, 2.7] },
    encoderwheel:{ build: INK_BUILD.encoderwheel, finish: "plastic", pos: [-5.6, 0.8, 2.7] }
  };
  return {
    kind: "inkjet",
    title: G.printer.model + ", carriage and paper path",
    caption: "Looking down on the machine with the lid off. The head runs left to right along the belt, " +
      "reading its position off the encoder strip behind it, and parks in the capping station at the far end.",
    board: { size: [14, 0.4, 10], pos: [-0.4, -1.7, 0.9], color: "#6c757e" },
    decor: [],
    parts: parts.filter((p) => geo[p.key])
      .map((p, i) => prnPart(p, p.key === target, s, i, geo[p.key]))
      .map((p) => Object.assign(p, { color: PRN_COLOR[p.key] }))
      /* THE FAULT HAS TO BE VISIBLE. Measured before this line existed:
         ten tickets on this track rendered ONE machine. The note said the
         part was damaged and the part looked perfect. */
      .map((p) => (p.key === target ? damage(p, G.fault && G.fault.key) : p)),
    camera: { dist: 19.5, yaw: 0.42, pitch: 0.50, target: [-0.2, 0.6, 0.6], min: 9, max: 42 }
  };
}

/* =====================================================================
   The laptop, exploded

   Laid out by DEPTH, because on this track depth is the answer to the
   question that matters. The bottom cover is at the bottom, everything
   behind it sits on the next layer up, the things under the board are
   above that, and the keyboard — the deepest job on the machine — is at
   the top where it has to come out through.
   ===================================================================== */
const LAP_BUILD = {
  cover: [
    { shape: "rbox", size: [8.8, 0.22, 5.8], pos: [0, 0, 0], r: 0.16, shade: 1.0 },
    { shape: "cyl", size: [0.24, 0.1], pos: [-3.9, 0.14, -2.4],
      repeat: { count: 5, step: [1.95, 0, 0] }, shade: 0.7 },
    { shape: "cyl", size: [0.24, 0.1], pos: [-3.9, 0.14, 2.4],
      repeat: { count: 5, step: [1.95, 0, 0] }, shade: 0.7 },
    { shape: "plate", size: [2.2, 0.06, 0.12], pos: [2.4, 0.13, 1.6],
      repeat: { count: 5, step: [0, 0, 0.22] }, shade: 0.78 }
  ],
  battery: [
    { shape: "rbox", size: [5.4, 0.44, 1.9], pos: [0, 0, 0], r: 0.07, shade: 1.0 },
    { shape: "plate", size: [1.6, 0.06, 1.7], pos: [-1.8, 0.24, 0],
      repeat: { count: 3, step: [1.8, 0, 0] }, shade: 0.86 },
    { shape: "plate", size: [0.6, 0.05, 0.5], pos: [2.5, 0.05, -0.9], shade: 0.7 },
    { shape: "box", size: [0.5, 0.14, 0.24], pos: [2.75, 0.05, -1.05], r: 0.02, shade: 0.5 },
    { shape: "plate", size: [3.4, 0.03, 0.3], pos: [0, 0.23, 0.75], shade: 1.28 }
  ],
  sodimm: [
    { shape: "plate", size: [2.1, 0.1, 0.52], pos: [0, 0, 0], shade: 1.0 },
    { shape: "box", size: [0.3, 0.09, 0.34], pos: [-0.72, 0.09, 0], r: 0.01,
      repeat: { count: 5, step: [0.36, 0, 0] }, shade: 0.42 },
    { shape: "plate", size: [1.5, 0.09, 0.09], pos: [-0.2, 0, -0.26], shade: 1.5 },
    { shape: "box", size: [0.14, 0.16, 0.2], pos: [-1.14, 0, 0], r: 0.02, shade: 0.75 },
    { shape: "box", size: [0.14, 0.16, 0.2], pos: [1.14, 0, 0], r: 0.02, shade: 0.75 }
  ],
  ssd: [
    { shape: "plate", size: [2.1, 0.08, 0.62], pos: [0, 0, 0], shade: 1.0 },
    { shape: "box", size: [0.6, 0.09, 0.44], pos: [-0.4, 0.08, 0], r: 0.01, shade: 0.42 },
    { shape: "box", size: [0.6, 0.09, 0.44], pos: [0.35, 0.08, 0], r: 0.01, shade: 0.42 },
    { shape: "plate", size: [0.3, 0.08, 0.26], pos: [1.0, 0, -0.16], shade: 1.5 },
    { shape: "cyl", size: [0.16, 0.1], pos: [-0.98, 0.06, 0], shade: 1.3 }
  ],
  wifi: [
    { shape: "plate", size: [1.1, 0.08, 0.56], pos: [0, 0, 0], shade: 1.0 },
    { shape: "box", size: [0.42, 0.09, 0.36], pos: [0.1, 0.08, 0], r: 0.01, shade: 0.42 },
    { shape: "cyl", size: [0.14, 0.08], pos: [-0.3, 0.09, -0.16], shade: 1.4 },
    { shape: "cyl", size: [0.14, 0.08], pos: [-0.3, 0.09, 0.16], shade: 1.4 },
    { shape: "cyl", size: [0.06, 1.5], pos: [-1.0, 0.1, -0.16], rot: [0, 0, Math.PI / 2], shade: 0.55 },
    { shape: "cyl", size: [0.06, 1.5], pos: [-1.0, 0.1, 0.16], rot: [0, 0, Math.PI / 2], shade: 1.45 }
  ],
  fan: [
    { shape: "cyl", size: [1.55, 0.42], pos: [0, 0, 0], shade: 1.0 },
    { shape: "cyl", size: [0.46, 0.3], pos: [0, 0.06, 0], shade: 0.6 },
    { shape: "plate", size: [0.5, 0.05, 0.26], pos: [0, 0.06, 0], rot: [0, 0, 0.3],
      ring: { count: 13, radius: 0.5, axis: "y" }, shade: 0.9 },
    { shape: "box", size: [1.5, 0.2, 0.28], pos: [1.35, 0, 0], r: 0.03, shade: 1.3 },
    { shape: "plate", size: [0.06, 0.3, 0.7], pos: [2.05, 0, 0],
      repeat: { count: 9, step: [0.07, 0, 0] }, shade: 1.15 }
  ],
  /* The heat pipe: cold plate over the die, a flattened run, the bend, the
     second run, and the fin stack it delivers into. Drawn as an L out of
     straight segments rather than as a rotated tube, because `halfExtent`
     gives any rotated piece a cube bounding box and a pipe as long as this
     one would inflate the part's bounds far past the part. */
  heatpipe: [
    { shape: "rbox", size: [1.0, 0.16, 1.0], pos: [-2.0, 0, -0.2], r: 0.05, shade: 1.0 },
    { shape: "rbox", size: [2.4, 0.2, 0.5], pos: [-0.4, 0.02, -0.2], r: 0.09, shade: 0.94 },
    { shape: "rbox", size: [0.5, 0.2, 1.1], pos: [0.6, 0.02, 0.35], r: 0.09, shade: 0.94 },
    { shape: "rbox", size: [1.7, 0.2, 0.5], pos: [1.65, 0.02, 0.85], r: 0.09, shade: 0.94 },
    /* It ends flattened and bare. The fin stack belongs to the cooling-fan
       assembly, which already draws one — giving the pipe a second stack
       would put two of them on a machine that has one, on a bench whose
       job is telling a student which part is which. */
    { shape: "rbox", size: [0.7, 0.24, 0.66], pos: [2.7, 0.02, 0.85], r: 0.06, shade: 0.9 },
    /* The four sprung screws that hold the plate down, which are where this
       part actually goes wrong. */
    { shape: "cyl", size: [0.2, 0.18], pos: [-2.4, 0.1, -0.6], shade: 0.6, mat: "steel" },
    { shape: "cyl", size: [0.2, 0.18], pos: [-2.4, 0.1, 0.2], shade: 0.6, mat: "steel" },
    { shape: "cyl", size: [0.2, 0.18], pos: [-1.6, 0.1, -0.6], shade: 0.6, mat: "steel" },
    { shape: "cyl", size: [0.2, 0.18], pos: [-1.6, 0.1, 0.2], shade: 0.6, mat: "steel" }
  ],
  /* Two drivers, one each side, on one loom. Drawn as a pair on purpose:
     the fault on this part is always that ONE of them has gone, and a
     single speaker on the bench would not show that. */
  speaker: [
    { shape: "rbox", size: [1.25, 0.4, 0.8], pos: [-1.5, 0, 0], r: 0.06, shade: 1.0 },
    { shape: "rbox", size: [1.25, 0.4, 0.8], pos: [1.5, 0, 0], r: 0.06, shade: 1.0 },
    { shape: "cyl", size: [0.62, 0.12], pos: [-1.5, 0.22, 0], shade: 0.55, mat: "black" },
    { shape: "cyl", size: [0.62, 0.12], pos: [1.5, 0.22, 0], shade: 0.55, mat: "black" },
    { shape: "cyl", size: [0.24, 0.16], pos: [-1.5, 0.26, 0], shade: 0.8, mat: "dark" },
    { shape: "cyl", size: [0.24, 0.16], pos: [1.5, 0.26, 0], shade: 0.8, mat: "dark" },
    { shape: "cyl", size: [0.1, 1.8], pos: [0, 0.02, 0.26], rot: [0, 0, Math.PI / 2], shade: 0.42, mat: "black" },
    { shape: "rbox", size: [0.42, 0.18, 0.34], pos: [0.2, 0.02, 0.62], r: 0.03, shade: 0.5, mat: "pale" }
  ],
  keyboard: [
    { shape: "rbox", size: [7.0, 0.16, 2.5], pos: [0, 0, 0], r: 0.06, shade: 1.0 },
    { shape: "rbox", size: [0.38, 0.14, 0.38], pos: [-3.0, 0.14, -0.9], r: 0.05,
      repeat: { count: 15, step: [0.43, 0, 0] }, shade: 0.5 },
    { shape: "rbox", size: [0.38, 0.14, 0.38], pos: [-2.85, 0.14, -0.42], r: 0.05,
      repeat: { count: 14, step: [0.43, 0, 0] }, shade: 0.5 },
    { shape: "rbox", size: [0.38, 0.14, 0.38], pos: [-2.75, 0.14, 0.06], r: 0.05,
      repeat: { count: 14, step: [0.43, 0, 0] }, shade: 0.5 },
    { shape: "rbox", size: [0.38, 0.14, 0.38], pos: [-2.6, 0.14, 0.54], r: 0.05,
      repeat: { count: 13, step: [0.43, 0, 0] }, shade: 0.5 },
    { shape: "rbox", size: [2.6, 0.14, 0.38], pos: [0, 0.14, 1.0], r: 0.05, shade: 0.5 },
    { shape: "plate", size: [0.9, 0.04, 0.8], pos: [0, -0.1, -1.5], shade: 0.66 }
  ],
  trackpad: [
    { shape: "rbox", size: [2.3, 0.14, 1.6], pos: [0, 0, 0], r: 0.05, shade: 1.0 },
    { shape: "plate", size: [2.0, 0.03, 1.35], pos: [0, 0.09, 0], shade: 1.2 },
    { shape: "plate", size: [0.7, 0.03, 0.6], pos: [0, -0.09, -1.0], shade: 0.66 }
  ],
  board: [
    { shape: "plate", size: [5.0, 0.14, 1.9], pos: [0, 0, 0], shade: 1.0 },
    { shape: "box", size: [1.0, 0.16, 1.0], pos: [-0.6, 0.14, 0], r: 0.02, shade: 0.72 },
    { shape: "box", size: [0.5, 0.12, 0.5], pos: [1.2, 0.12, -0.4], r: 0.02, shade: 0.78 },
    { shape: "box", size: [0.22, 0.1, 0.5], pos: [2.1, 0.1, 0.4],
      repeat: { count: 3, step: [0.3, 0, 0] }, r: 0.02, shade: 0.55 },
    { shape: "cyl", size: [0.2, 0.28], pos: [-1.9, 0.16, 0.6],
      repeat: { count: 5, step: [0.3, 0, 0] }, shade: 0.5 },
    { shape: "plate", size: [0.1, 0.3, 1.4], pos: [-2.4, 0.1, 0], shade: 1.3 }
  ],
  displayasm: [
    { shape: "rbox", size: [8.8, 0.32, 5.4], pos: [0, 0, 0], r: 0.14, shade: 1.0 },
    { shape: "plate", size: [8.0, 0.06, 4.7], pos: [0, 0.18, 0], shade: 0.4 },
    { shape: "cyl", size: [0.16, 0.12], pos: [0, 0.2, -2.3], shade: 0.85 },
    { shape: "cyl", size: [0.5, 1.2], pos: [-3.4, -0.16, 2.6], rot: [0, 0, Math.PI / 2], shade: 0.7 },
    { shape: "cyl", size: [0.5, 1.2], pos: [3.4, -0.16, 2.6], rot: [0, 0, Math.PI / 2], shade: 0.7 }
  ],
  ports: [
    { shape: "plate", size: [0.9, 0.14, 1.5], pos: [0, 0, 0], shade: 1.0 },
    { shape: "box", size: [0.4, 0.26, 0.24], pos: [0, 0.1, -0.5], r: 0.03, shade: 0.42 },
    { shape: "box", size: [0.4, 0.26, 0.24], pos: [0, 0.1, 0], r: 0.03, shade: 0.42 },
    { shape: "cyl", size: [0.3, 0.3], pos: [0, 0.1, 0.55], rot: [0, 0, Math.PI / 2], shade: 0.5 }
  ]
};

export function laptopModel(G, parts) {
  const s = G.seedBase, target = G.partTarget;
  const geo = {
    cover:      { build: LAP_BUILD.cover,      finish: "metal", skin: "brushed",   pos: [0.4, -2.4, 0] },
    ssd:        { build: LAP_BUILD.ssd,        finish: "board", skin: "pcb",   pos: [-3.4, 0, -2.4] },
    sodimm1:    { build: LAP_BUILD.sodimm,     finish: "board", skin: "pcb",   pos: [-3.4, 0, -0.6] },
    sodimm2:    { build: LAP_BUILD.sodimm,     finish: "board", skin: "pcb",   pos: [-3.4, 0, 0.6] },
    wifi:       { build: LAP_BUILD.wifi,       finish: "board", skin: "pcb",   pos: [-3.0, 0, 2.3] },
    board:      { build: LAP_BUILD.board,      finish: "board", skin: "pcb",   pos: [0.6, 0, -1.4] },
    battery:    { build: LAP_BUILD.battery,    finish: "matte",   pos: [0.4, 0, 1.8] },
    fan:        { build: LAP_BUILD.fan,        finish: "plastic", pos: [4.6, 0, -1.4] },
    /* Both of these are depth 3, the same layer as the fan, so they sit on
       the fan's level rather than on one of their own — the caption
       promises the layout means depth, and a part floating on a layer
       because there was room there would make that a lie. The pipe runs
       along the back edge towards the fan it feeds; the speakers sit at the
       front edge where they really are. */
    heatpipe:   { build: LAP_BUILD.heatpipe,   finish: "metal",   pos: [1.4, 0, -3.9] },
    speaker:    { build: LAP_BUILD.speaker,    finish: "plastic", pos: [-1.0, 0, 3.9] },
    ports:      { build: LAP_BUILD.ports,      finish: "board", skin: "pcb",   pos: [4.6, 0, 1.8] },
    trackpad:   { build: LAP_BUILD.trackpad,   finish: "glass",   pos: [-0.8, 2.2, 1.9] },
    keyboard:   { build: LAP_BUILD.keyboard,   finish: "plastic", pos: [0.2, 2.2, -0.9] },
    displayasm: { build: LAP_BUILD.displayasm, finish: "metal", skin: "anodised",   pos: [0.4, 4.5, -0.2] }
  };
  return {
    kind: "laptop",
    title: G.laptop.model + ", exploded by depth",
    caption: "Laid out by how far in each part is. The bottom cover is at the bottom, everything behind it " +
      "sits on the layer above, and the keyboard — the deepest job on this machine — is at the top, " +
      "because that is the direction it has to come out.",
    board: { size: [14, 0.4, 9], pos: [0.6, -3.6, 0], color: "#7c868e" },
    decor: [],
    parts: parts.filter((p) => geo[p.key]).map((p, i) => Object.assign({
      key: p.key, label: p.label, spec: p.role,
      /* Same reason as the power bench: the heat pipe and the speakers each
         carry two faults that leave DIFFERENT things to see, and one note
         per part would describe the wrong one on half those tickets. */
      note: p.key === target
        ? ((p.seenBy && G.fault && p.seenBy[G.fault.key]) || p.seen ||
           ("In place and undamaged. " + wear(s, i)))
        : "In place and undamaged. " + wear(s, i),
      color: LAP_COLOR[p.key] || "#5c6873"
    }, geo[p.key]))
      /* THE FAULT HAS TO BE VISIBLE. Measured before this line existed:
         ten tickets on this track rendered ONE machine. The note said the
         part was damaged and the part looked perfect. */
      .map((p) => (p.key === target ? damage(p, G.fault && G.fault.key) : p)),
    camera: { dist: 19, yaw: 0.5, pitch: 0.34, target: [0.4, 0.8, 0], min: 8, max: 44 }
  };
}

const LAP_COLOR = {
  cover: "#8f9aa4", battery: "#3f6d5a", sodimm1: "#2f6b4f", sodimm2: "#2f6b4f",
  ssd: "#2f6b4f", wifi: "#2f6b4f", fan: "#33393f", keyboard: "#3a4149",
  trackpad: "#93a6b2", board: "#1e5340", displayasm: "#4a5a6a", ports: "#3d4f63",
  /* Colour says what a part IS, and the one thing everybody knows about a
     heat pipe is that it is copper. */
  heatpipe: "#b3703c", speaker: "#33393f"
};

/* =====================================================================
   The display bench

   Not one device but the parts you might point at across all three:
   panel, backlight and driver from a screen; the cable and the graphics
   end; the lamp and filter from a projector. The exercise is naming which
   one, and half of them get cleared by a torch before you touch anything.
   ===================================================================== */
const DISP_BUILD = {
  panel: [
    { shape: "rbox", size: [5.8, 0.14, 3.6], pos: [0, 0, 0], r: 0.06, shade: 1.0 },
    { shape: "plate", size: [5.4, 0.04, 3.2], pos: [0, 0.09, 0], shade: 1.3 },
    { shape: "plate", size: [5.0, 0.03, 0.14], pos: [0, -0.09, -1.7], shade: 0.6, mat: "dark" }
  ],
  backlight: [
    { shape: "rbox", size: [5.8, 0.22, 3.6], pos: [0, 0, 0], r: 0.05, shade: 1.0 },
    { shape: "plate", size: [5.4, 0.05, 3.2], pos: [0, 0.13, 0], shade: 1.45, mat: "pale" },
    { shape: "box", size: [0.18, 0.1, 0.1], pos: [-2.5, 0.16, -1.72],
      repeat: { count: 15, step: [0.36, 0, 0] }, shade: 1.5, mat: "pale" },
    { shape: "plate", size: [0.3, 0.06, 3.0], pos: [-2.85, 0.05, 0], shade: 0.72, mat: "dark" }
  ],
  driver: [
    { shape: "plate", size: [2.2, 0.12, 0.75], pos: [0, 0, 0], shade: 1.0 },
    { shape: "cyl", size: [0.3, 0.38], pos: [-0.6, 0.2, 0], shade: 0.5, mat: "dark" },
    { shape: "cyl", size: [0.3, 0.38], pos: [-0.15, 0.2, 0], shade: 0.5, mat: "dark" },
    { shape: "box", size: [0.5, 0.24, 0.4], pos: [0.55, 0.15, 0], r: 0.03, shade: 0.66, mat: "black" },
    { shape: "plate", size: [0.4, 0.1, 0.2], pos: [1.05, 0, -0.2], shade: 1.4, mat: "pale" }
  ],
  vidcable: [
    { shape: "plate", size: [0.55, 0.06, 3.2], pos: [0, 0, 0], shade: 1.0 },
    { shape: "rbox", size: [0.7, 0.16, 0.3], pos: [0, 0.04, -1.7], r: 0.03, shade: 0.55, mat: "black" },
    { shape: "rbox", size: [0.7, 0.16, 0.3], pos: [0, 0.04, 1.7], r: 0.03, shade: 0.55, mat: "black" },
    { shape: "plate", size: [0.6, 0.05, 0.35], pos: [0, 0.06, 0.1], shade: 0.68, mat: "pale" }
  ],
  gpu: [
    { shape: "plate", size: [1.7, 0.12, 1.4], pos: [0, 0, 0], shade: 1.0, mat: "green" },
    { shape: "box", size: [0.8, 0.18, 0.8], pos: [0, 0.14, 0], r: 0.02, shade: 0.66, mat: "alu" },
    { shape: "cyl", size: [0.16, 0.24], pos: [-0.65, 0.14, -0.5],
      repeat: { count: 4, step: [0.42, 0, 0] }, shade: 0.5, mat: "dark" }
  ],
  vidport: [
    { shape: "rbox", size: [1.1, 0.44, 0.6], pos: [0, 0, 0], r: 0.04, shade: 1.0 },
    { shape: "box", size: [0.62, 0.24, 0.3], pos: [0.24, 0, 0], r: 0.03, shade: 0.42, mat: "black" },
    { shape: "cyl", size: [0.14, 0.7], pos: [-0.75, 0, 0], rot: [0, 0, Math.PI / 2], shade: 0.55, mat: "steel" }
  ],
  lamp: [
    { shape: "cyl", size: [1.2, 0.5], pos: [0, 0, 0], shade: 1.0 },
    { shape: "sphere", size: [0.62, 0.62, 0.62], pos: [0, 0.42, 0], shade: 1.5, mat: "pale" },
    { shape: "cone", size: [1.5, 0.7, 0.6], pos: [0, -0.4, 0], shade: 1.25 },
    { shape: "box", size: [0.3, 0.2, 0.24], pos: [0.7, -0.2, 0], r: 0.02, shade: 0.5, mat: "black" }
  ],
  filter: [
    { shape: "rbox", size: [2.0, 0.24, 1.5], pos: [0, 0, 0], r: 0.04, shade: 1.0 },
    { shape: "plate", size: [1.7, 0.1, 0.08], pos: [0, 0.12, -0.6],
      repeat: { count: 13, step: [0, 0, 0.1] }, shade: 0.72, mat: "dark" },
    { shape: "box", size: [0.24, 0.2, 1.4], pos: [-0.95, 0, 0], r: 0.02, shade: 0.82 },
    { shape: "box", size: [0.24, 0.2, 1.4], pos: [0.95, 0, 0], r: 0.02, shade: 0.82 }
  ]
};

const DISP_COLOR = {
  panel: "#2d3f52", backlight: "#c9ced3", driver: "#1e5340", vidcable: "#33393f",
  gpu: "#3d4f63", vidport: "#5c6873", lamp: "#a9b3ba", filter: "#8f9aa4"
};

/* =====================================================================
   The structured link

   The only model in the build that is not a machine. It is a run: desk on
   the left, comms room on the right, and the six things between them laid
   out in the order the signal meets them. A student who can see the chain
   stops saying "the cable is broken" and starts saying which of six.

   Same colour rule as everywhere else — colour says what a part IS. The
   two plugs are the same colour as each other on every ticket, because
   the whole exercise on four of these faults is working out which end.
   ===================================================================== */
const CAB_BUILD = {
  /* A modular plug: body, the eight gold contacts down the front, the
     latch, and the jacket disappearing out of the back. */
  /* Body, the eight gold contacts down the front, the latch, and a short
     stub of jacket out of the back. The stub is deliberately short: drawn
     with the length of cable it really has, the plug becomes a tail with a
     speck on the end and stops being the thing you are pointing at. */
  plug: [
    { shape: "rbox", size: [0.9, 0.72, 1.5], pos: [0, 0, 0], r: 0.06, shade: 1.0 },
    /* The eight contacts run down the TOP of the plug and stand proud of it,
       because that is where you look at them and gold is how you know them.
       Drawn as 0.12-deep studs buried at y 0.24 inside a 0.72-tall body,
       three hundredths of a unit showed and the most recognisable feature of
       the most-pointed-at part on the track was a hairline. */
    { shape: "box", size: [0.06, 0.34, 0.62], pos: [-0.31, 0.28, -0.36],
      repeat: { count: 8, step: [0.089, 0, 0] }, shade: 1.55, mat: "gold" },
    { shape: "rbox", size: [0.34, 0.16, 0.9], pos: [0, -0.42, 0.2], r: 0.04, shade: 0.82 },
    { shape: "cyl", size: [0.3, 0.7], pos: [0, 0, 1.05], rot: [Math.PI / 2, 0, 0], shade: 0.5 }
  ],
  /* A faceplate with a keystone jack in it, punched down on the back. */
  keystone: [
    { shape: "rbox", size: [2.4, 0.18, 3.4], pos: [0, 0, 0], r: 0.12, shade: 1.0 },
    { shape: "rbox", size: [1.1, 0.5, 1.4], pos: [0, 0.3, -0.55], r: 0.05, shade: 0.72 },
    { shape: "box", size: [0.78, 0.34, 0.9], pos: [0, 0.36, -0.7], r: 0.02, shade: 0.3, mat: "black" },
    { shape: "box", size: [0.16, 0.26, 0.5], pos: [-0.7, 0.2, 1.0],
      repeat: { count: 4, step: [0.46, 0, 0] }, shade: 1.4, mat: "steel" },
    { shape: "box", size: [0.16, 0.26, 0.5], pos: [-0.7, 0.2, 1.55],
      repeat: { count: 4, step: [0.46, 0, 0] }, shade: 1.4, mat: "steel" },
    { shape: "cyl", size: [0.14, 0.16], pos: [0, 0.1, -1.5], shade: 0.6, mat: "steel" },
    { shape: "cyl", size: [0.14, 0.16], pos: [0, 0.1, 1.5], shade: 0.6, mat: "steel" }
  ],
  /* Solid-core cable coming out of the wall, looped through the ceiling.
     Drawn as a long run of segments so it reads as distance, which is the
     whole content of the over-length ticket. */
  horizontal: [
    { shape: "cyl", size: [0.26, 1.1], pos: [-3.3, 0, 0], rot: [0, 0, Math.PI / 2],
      repeat: { count: 7, step: [1.1, 0, 0] }, shade: 1.0 },
    { shape: "cyl", size: [0.3, 0.34], pos: [-2.2, 0, 0], rot: [0, 0, Math.PI / 2],
      repeat: { count: 4, step: [1.5, 0, 0] }, shade: 0.72 },
    { shape: "box", size: [0.5, 0.9, 0.5], pos: [-1.6, 0.5, 0], r: 0.04,
      repeat: { count: 3, step: [1.6, 0, 0] }, shade: 0.55, mat: "steel" },
    { shape: "plate", size: [8.0, 0.1, 0.6], pos: [0, 0.95, 0], shade: 0.86, mat: "steel" }
  ],
  /* The patch panel: a rack strip with a row of ports across it. */
  panel: [
    { shape: "rbox", size: [7.2, 1.5, 0.6], pos: [0, 0, 0], r: 0.06, shade: 1.0 },
    { shape: "box", size: [0.44, 0.5, 0.34], pos: [-3.0, 0.3, 0.2],
      repeat: { count: 12, step: [0.55, 0, 0] }, shade: 0.4, mat: "black" },
    { shape: "box", size: [0.44, 0.5, 0.34], pos: [-3.0, -0.35, 0.2],
      repeat: { count: 12, step: [0.55, 0, 0] }, shade: 0.4, mat: "black" },
    { shape: "cyl", size: [0.14, 0.3], pos: [-3.5, 0.62, 0.16], rot: [Math.PI / 2, 0, 0], shade: 1.4, mat: "steel" },
    { shape: "cyl", size: [0.14, 0.3], pos: [3.5, 0.62, 0.16], rot: [Math.PI / 2, 0, 0], shade: 1.4, mat: "steel" }
  ],
  /* A factory patch cord: two moulded boots and a stranded cord between. */
  cord: [
    { shape: "cyl", size: [0.2, 4.4], pos: [0, 0, 0], rot: [0, 0, Math.PI / 2], shade: 1.0 },
    { shape: "rbox", size: [0.8, 0.66, 0.6], pos: [-2.3, 0, 0], r: 0.14, shade: 0.6 },
    { shape: "rbox", size: [0.8, 0.66, 0.6], pos: [2.3, 0, 0], r: 0.14, shade: 0.6 },
    { shape: "rbox", size: [0.6, 0.56, 1.0], pos: [-2.95, 0, 0], r: 0.05, shade: 0.82, mat: "pale" },
    { shape: "rbox", size: [0.6, 0.56, 1.0], pos: [2.95, 0, 0], r: 0.05, shade: 0.82, mat: "pale" },
    { shape: "plate", size: [1.4, 0.06, 0.3], pos: [0, 0.2, 0], shade: 1.45, mat: "pale" }
  ],
  /* A switch: chassis, two rows of ports, status lights. */
  switchbox: [
    { shape: "rbox", size: [7.0, 1.4, 2.6], pos: [0, 0, 0], r: 0.08, shade: 1.0 },
    { shape: "box", size: [0.42, 0.44, 0.3], pos: [-2.8, 0.25, 1.2],
      repeat: { count: 11, step: [0.52, 0, 0] }, shade: 0.35, mat: "black" },
    { shape: "box", size: [0.42, 0.44, 0.3], pos: [-2.8, -0.28, 1.2],
      repeat: { count: 11, step: [0.52, 0, 0] }, shade: 0.35, mat: "black" },
    { shape: "cyl", size: [0.08, 0.16], pos: [-2.8, 0.55, 1.24], rot: [Math.PI / 2, 0, 0],
      repeat: { count: 11, step: [0.52, 0, 0] }, shade: 1.6 },
    { shape: "plate", size: [0.08, 0.9, 2.2], pos: [3.3, 0, 0],
      repeat: { count: 5, step: [0.1, 0, 0] }, shade: 0.7, mat: "dark" }
  ]
};

/* Modular plugs are clear polycarbonate, which reads as ivory — and the two
   of them are deliberately the same colour as each other, because working
   out WHICH end is at fault is most of this track. */
const CAB_COLOR = {
  plugnear: "#cbbe9a", plugfar: "#cbbe9a", keystone: "#c9ced3",
  horizontal: "#4a6a7a", panelport: "#5c6873", patchcord: "#2f6b4f",
  switchport: "#33393f"
};

export function cablingModel(G, parts) {
  /* The part the ticket GRADES, which is not always the part the fault
     table names — this track resolves its answer through its own map, and
     reading the wrong one drew the damage on the wrong component. */
  var dtarget = locateTarget(G);
  const s = G.seedBase, target = G.partTarget;
  /* Laid out left to right in the order the signal meets them, because the
     order is half of what the model is teaching. */
  const geo = {
    /* A modular plug really is tiny beside a patch panel, and drawn to scale
       it is a speck you cannot point at. Both plugs are drawn oversized and
       turned so the row of contacts faces the camera, for the same reason an
       exploded diagram is not to scale: the exercise is naming the part. */
    plugnear:   { build: CAB_BUILD.plug,       finish: "plastic", scale: 1.8, pos: [-10.0, 0.2, 2.8], rot: [0, Math.PI, 0] },
    keystone:   { build: CAB_BUILD.keystone,   finish: "matte",   scale: 1.5, pos: [-9.0, -1.8, -1.6] },
    horizontal: { build: CAB_BUILD.horizontal, finish: "rubber",  pos: [-2.6, 2.2, -1.4] },
    panelport:  { build: CAB_BUILD.panel,      finish: "steel",   pos: [5.0, 1.2, -1.4] },
    patchcord:  { build: CAB_BUILD.cord,       finish: "rubber",  pos: [5.0, -0.6, 1.2] },
    plugfar:    { build: CAB_BUILD.plug,       finish: "plastic", scale: 1.8, pos: [10.2, 0.2, 2.8], rot: [0, -Math.PI * 0.55, 0] },
    switchport: { build: CAB_BUILD.switchbox,  finish: "steel",   pos: [5.0, -3.0, 4.0] }
  };
  return {
    kind: "cabling",
    title: "The link, end to end",
    caption: "Desk on the left, comms room on the right, and the signal meets them in that order: the plug you " +
      "crimped, the outlet it goes into, the run in the wall, the panel it lands on, the cord across to the " +
      "switch, and the port. Six places a fault can live, and most people only ever look at one of them.",
    board: { size: [27, 0.4, 14], pos: [0, -4.6, 0.6], color: "#7c868e" },
    decor: [],
    parts: parts.filter((p) => geo[p.key]).map((p, i) => Object.assign({
      key: p.key, label: p.label, spec: p.role,
      note: p.key === target && p.seen ? p.seen
        : "Nothing wrong with it that you can see. " + wear(s, i),
      color: CAB_COLOR[p.key] || "#5c6873"
    }, geo[p.key]))
      /* THE FAULT HAS TO BE VISIBLE. `damage` is a no-op for every fault
         with no physical tell, which on some of these tracks is most of
         them — see the notes beside each part, and assets/damage.js. */
      .map((p) => (p.key === dtarget ? damage(p, G.fault && G.fault.key) : p)),
    camera: { dist: 27, yaw: 0.40, pitch: 0.36, target: [0, -0.3, 0.4], min: 12, max: 56 }
  };
}

/* =====================================================================
   The power bench

   Everything between the breaker and the board, laid out in the order the
   current travels: panel, outlet, strip, UPS and its pack, then the supply
   inside the machine and the module on the end of it.

   Two of these are the building's and two of them are the customer's, and
   the model does not distinguish them — because working out which side of
   the outlet a fault is on is the whole exercise.
   ===================================================================== */
const PWR_BUILD = {
  /* A load-centre: enclosure, a column of breaker handles, one thrown. */
  breaker: [
    { shape: "rbox", size: [3.4, 5.0, 0.9], pos: [0, 0, 0], r: 0.1, shade: 1.0 },
    { shape: "plate", size: [2.6, 4.2, 0.1], pos: [0, 0, 0.5], shade: 0.72, mat: "steel" },
    { shape: "rbox", size: [0.9, 0.34, 0.3], pos: [-0.62, 1.7, 0.62], r: 0.04,
      repeat: { count: 5, step: [0, -0.55, 0] }, shade: 0.45, mat: "black" },
    { shape: "rbox", size: [0.9, 0.34, 0.3], pos: [0.62, 1.7, 0.62], r: 0.04,
      repeat: { count: 5, step: [0, -0.55, 0] }, shade: 0.45, mat: "black" },
    { shape: "cyl", size: [0.12, 0.5], pos: [0, -2.2, 0.5], rot: [Math.PI / 2, 0, 0], shade: 1.4 }
  ],
  /* A duplex receptacle in a faceplate: two outlets, each with two slots
     and a round ground below. */
  outlet: [
    { shape: "rbox", size: [2.2, 3.4, 0.16], pos: [0, 0, 0], r: 0.14, shade: 1.0 },
    { shape: "rbox", size: [1.5, 1.3, 0.14], pos: [0, 0.72, 0.1], r: 0.28, shade: 0.86 },
    { shape: "rbox", size: [1.5, 1.3, 0.14], pos: [0, -0.72, 0.1], r: 0.28, shade: 0.86 },
    { shape: "box", size: [0.13, 0.42, 0.1], pos: [-0.34, 0.92, 0.18], shade: 0.24, mat: "black" },
    { shape: "box", size: [0.13, 0.42, 0.1], pos: [0.34, 0.92, 0.18], shade: 0.24, mat: "black" },
    { shape: "cyl", size: [0.16, 0.1], pos: [0, 0.36, 0.18], rot: [Math.PI / 2, 0, 0], shade: 0.24, mat: "black" },
    { shape: "box", size: [0.13, 0.42, 0.1], pos: [-0.34, -0.52, 0.18], shade: 0.24, mat: "black" },
    { shape: "box", size: [0.13, 0.42, 0.1], pos: [0.34, -0.52, 0.18], shade: 0.24, mat: "black" },
    { shape: "cyl", size: [0.16, 0.1], pos: [0, -1.08, 0.18], rot: [Math.PI / 2, 0, 0], shade: 0.24, mat: "black" },
    { shape: "cyl", size: [0.13, 0.16], pos: [0, 1.48, 0.1], shade: 0.6, mat: "steel" },
    { shape: "cyl", size: [0.13, 0.16], pos: [0, -1.48, 0.1], shade: 0.6, mat: "steel" }
  ],
  /* A strip: body, a row of sockets, the switch, the indicator, and the
     lead going off the end. */
  strip: [
    { shape: "rbox", size: [6.2, 0.7, 1.5], pos: [0, 0, 0], r: 0.1, shade: 1.0 },
    { shape: "rbox", size: [0.8, 0.16, 0.9], pos: [-2.2, 0.36, 0], r: 0.14,
      repeat: { count: 6, step: [0.88, 0, 0] }, shade: 0.66 },
    { shape: "box", size: [0.12, 0.2, 0.28], pos: [-2.36, 0.42, -0.16],
      repeat: { count: 6, step: [0.88, 0, 0] }, shade: 0.24, mat: "black" },
    { shape: "box", size: [0.12, 0.2, 0.28], pos: [-2.04, 0.42, -0.16],
      repeat: { count: 6, step: [0.88, 0, 0] }, shade: 0.24, mat: "black" },
    { shape: "rbox", size: [0.6, 0.3, 0.5], pos: [2.66, 0.24, 0], r: 0.05, shade: 0.5 },
    { shape: "cyl", size: [0.12, 0.12], pos: [2.66, 0.42, -0.5], shade: 1.5 },
    { shape: "cyl", size: [0.16, 1.6], pos: [-3.9, 0, 0], rot: [0, 0, Math.PI / 2], shade: 0.42 }
  ],
  /* A tower UPS: chassis, front panel, load bar, and the vents. */
  ups: [
    { shape: "rbox", size: [2.6, 4.4, 3.4], pos: [0, 0, 0], r: 0.1, shade: 1.0 },
    { shape: "plate", size: [1.9, 1.5, 0.1], pos: [0, 1.2, 1.75], shade: 0.4, mat: "black" },
    { shape: "cyl", size: [0.2, 0.14], pos: [-0.55, 1.5, 1.84], rot: [Math.PI / 2, 0, 0], shade: 1.55 },
    { shape: "cyl", size: [0.2, 0.14], pos: [0.1, 1.5, 1.84], rot: [Math.PI / 2, 0, 0], shade: 1.3 },
    { shape: "box", size: [0.14, 0.5, 0.1], pos: [-0.7, 0.75, 1.84],
      repeat: { count: 8, step: [0.2, 0, 0] }, shade: 1.45 },
    { shape: "box", size: [0.1, 0.28, 0.1], pos: [-1.0, -1.4, 1.74],
      repeat: { count: 11, step: [0.2, 0, 0] }, shade: 0.62, mat: "dark" },
    { shape: "rbox", size: [2.2, 0.2, 0.6], pos: [0, -2.1, 0.4], r: 0.04, shade: 0.7, mat: "dark" }
  ],
  /* The pack that comes out of it: two sealed cells, a strap, a connector. */
  upscell: [
    { shape: "rbox", size: [1.5, 1.7, 2.6], pos: [-0.8, 0, 0], r: 0.05, shade: 1.0 },
    { shape: "rbox", size: [1.5, 1.7, 2.6], pos: [0.8, 0, 0], r: 0.05, shade: 1.0 },
    { shape: "cyl", size: [0.16, 0.24], pos: [-1.15, 0.95, -0.85], shade: 0.55, mat: "copper" },
    { shape: "cyl", size: [0.16, 0.24], pos: [-0.45, 0.95, -0.85], shade: 0.55, mat: "copper" },
    { shape: "cyl", size: [0.16, 0.24], pos: [0.45, 0.95, -0.85], shade: 0.55, mat: "copper" },
    { shape: "cyl", size: [0.16, 0.24], pos: [1.15, 0.95, -0.85], shade: 0.55, mat: "copper" },
    { shape: "plate", size: [3.0, 0.1, 0.5], pos: [0, 0.95, 0.7], shade: 0.42, mat: "black" },
    { shape: "rbox", size: [0.7, 0.4, 0.5], pos: [0, 0.95, 1.5], r: 0.05, shade: 0.3, mat: "black" },
    { shape: "plate", size: [1.1, 0.06, 0.7], pos: [-0.8, 0.88, -0.2], shade: 1.4, mat: "pale" }
  ],
  /* An ATX supply: case, fan grille, the switch and inlet, and the loom. */
  psu: [
    { shape: "rbox", size: [3.4, 1.7, 3.0], pos: [0, 0, 0], r: 0.06, shade: 1.0 },
    /* The opening is a dark recess in the top face and the blades sit just
       proud of it. `ring` treats `pos` as the CENTRE of the ring, not as
       the first blade: written the other way the fan orbited a point off to
       one side of the supply, and nine two-unit blades on a 0.85 radius
       punched out through the top and both sides as a starburst of loose
       plates. Centre it on the opening, and size a blade to reach the rim
       and no further. */
    /* An 80mm fan fills most of the top of an ATX supply, so this one does
       too. `cyl` size is [DIAMETER, height], not radius: read as a radius,
       the shroud came out half the size it should be while the blades
       reached out past it, which is how nine of them ended up hanging in
       the air outside the case. */
    { shape: "cyl", size: [2.7, 0.14], pos: [0, 0.80, 0.2], shade: 0.62, mat: "black" },
    { shape: "plate", size: [0.5, 0.05, 1.3], pos: [0, 0.86, 0.2], rot: [0, 0.4, 0],
      ring: { count: 9, radius: 0.65, axis: "y" }, shade: 0.5, mat: "dark" },
    /* Rim and hub are what make the thing read as a fan rather than as a
       dark smudge: nine near-black blades in a near-black shroud on a
       near-black case resolve into nothing at all until something light
       marks the centre and the edge. */
    /* A `tube` rather than a torus, and not for looks. `halfExtent` gives any
       ROTATED piece a cube bounding box — max extent in all three axes,
       deliberately, because too big is safe and too small buries the damage
       inside the part. A torus laid flat by a quarter turn is the case that
       breaks the assumption: it reported 1.4 units of height on a supply
       1.7 tall, and the dust of a fouled fan floated a clear gap above the
       case. A tube stands on its own axis, needs no rotation, and measures
       what it is. */
    { shape: "tube", size: [2.7, 0.12], pos: [0, 0.84, 0.2], shade: 1.1, mat: "steel" },
    { shape: "cyl", size: [0.55, 0.16], pos: [0, 0.88, 0.2], shade: 1.2, mat: "pale" },
    { shape: "rbox", size: [0.9, 0.75, 0.2], pos: [-0.9, 0, -1.55], r: 0.04, shade: 0.4, mat: "black" },
    { shape: "rbox", size: [0.5, 0.35, 0.2], pos: [0.4, 0, -1.55], r: 0.03, shade: 0.42, mat: "black" },
    { shape: "box", size: [0.9, 0.5, 0.1], pos: [1.3, 0, -1.55], shade: 1.35, mat: "pale" },
    { shape: "cyl", size: [0.26, 1.6], pos: [0.4, -0.2, 2.2], rot: [Math.PI / 2, 0, 0], shade: 0.3 },
    { shape: "cyl", size: [0.18, 1.3], pos: [-0.7, -0.3, 2.0], rot: [Math.PI / 2, 0.2, 0], shade: 0.3 }
  ],
  /* The 24-pin connector on the end of that loom. */
  atx24: [
    { shape: "rbox", size: [2.3, 0.85, 0.75], pos: [0, 0, 0], r: 0.06, shade: 1.0 },
    { shape: "box", size: [0.14, 0.5, 0.14], pos: [-0.99, 0.2, -0.3],
      repeat: { count: 12, step: [0.18, 0, 0] }, shade: 0.4, mat: "gold" },
    { shape: "box", size: [0.14, 0.5, 0.14], pos: [-0.99, -0.28, -0.3],
      repeat: { count: 12, step: [0.18, 0, 0] }, shade: 0.4, mat: "gold" },
    { shape: "rbox", size: [0.3, 0.5, 0.16], pos: [0, 0, 0.44], r: 0.03, shade: 0.72 },
    { shape: "cyl", size: [0.08, 1.1], pos: [-0.9, 0.1, 1.0], rot: [Math.PI / 2, 0, 0],
      repeat: { count: 11, step: [0.18, 0, 0] }, shade: 0.55 }
  ],
  /* The card that was fitted without a strap. */
  module: [
    { shape: "plate", size: [2.4, 0.12, 1.3], pos: [0, 0, 0], shade: 1.0 },
    { shape: "box", size: [0.5, 0.2, 0.5], pos: [-0.4, 0.16, 0.1], r: 0.02, shade: 0.5, mat: "black" },
    { shape: "box", size: [0.34, 0.14, 0.34], pos: [0.5, 0.13, 0.1], r: 0.02, shade: 0.62, mat: "black" },
    { shape: "plate", size: [1.3, 0.1, 0.12], pos: [-0.2, 0, -0.62], shade: 1.5, mat: "gold" },
    { shape: "plate", size: [0.1, 1.5, 1.2], pos: [1.28, 0.6, 0], shade: 1.25, mat: "steel" },
    { shape: "cyl", size: [0.12, 0.2], pos: [-0.9, 0.14, -0.35],
      repeat: { count: 3, step: [0.3, 0, 0] }, shade: 0.7, mat: "dark" }
  ]
};

/* Colour says what a part is. Nothing here is tinted for being at fault —
   which matters more on this track than anywhere, because an outlet with a
   lethal fault behind it looks exactly like one without. */
const PWR_COLOR = {
  breaker: "#8f9aa4", outlet: "#c9ced3", strip: "#33393f", ups: "#3a4149",
  upscell: "#4a4038", psu: "#2f3338", atx24: "#c8b98f", module: "#2f6b4f"
};

export function powerModel(G, parts) {
  /* The part the ticket GRADES, which is not always the part the fault
     table names — this track resolves its answer through its own map, and
     reading the wrong one drew the damage on the wrong component. */
  var dtarget = locateTarget(G);
  const s = G.seedBase, target = G.partTarget;
  /* Laid out in the order the current travels: the building's side on the
     left, the customer's on the right. */
  const geo = {
    breaker:  { build: PWR_BUILD.breaker,  finish: "steel",   pos: [-9.4, 1.4, -2.0] },
    outlet:   { build: PWR_BUILD.outlet,   finish: "matte",   pos: [-5.6, 0.9, -2.0] },
    strip:    { build: PWR_BUILD.strip,    finish: "plastic", pos: [-4.4, -2.6, 1.8] },
    ups:      { build: PWR_BUILD.ups,      finish: "plastic", pos: [0.4, 1.2, -1.6] },
    upscell:  { build: PWR_BUILD.upscell,  finish: "matte",   pos: [0.4, -2.6, 2.2] },
    psu:      { build: PWR_BUILD.psu,      finish: "steel",   pos: [6.2, 1.4, -1.4] },
    atx24:    { build: PWR_BUILD.atx24,    finish: "plastic", pos: [6.4, -1.4, 2.2] },
    module:   { build: PWR_BUILD.module,   finish: "board",   pos: [10.4, -1.0, 0.2] }
  };
  return {
    kind: "power",
    title: "Everything between the breaker and the board",
    caption: "In the order the current travels: the panel, the outlet, the strip under the desk, the UPS and the " +
      "pack inside it, the supply in the machine, the connector you measure at, and the module on the end. Two of " +
      "these are the building's and two are the customer's — and nothing about them tells you which.",
    board: { size: [26, 0.4, 13], pos: [0.5, -4.4, 0.4], color: "#7c868e" },
    decor: [],
    parts: parts.filter((p) => geo[p.key]).map((p, i) => Object.assign({
      key: p.key, label: p.label, spec: p.role,
      /* A part on this track can be the target of several different faults,
         and two of them leave something to see where the others leave
         nothing. `seenBy` is the per-fault note; `seen` is the fallback for
         the rest. Without this the supply said "nothing to see" on the
         ticket whose whole answer is a stopped fan. */
      note: p.key === target
        ? ((p.seenBy && G.fault && p.seenBy[G.fault.key]) || p.seen ||
           ("Nothing wrong with it that you can see. " + wear(s, i)))
        : "Nothing wrong with it that you can see. " + wear(s, i),
      color: PWR_COLOR[p.key] || "#5c6873"
    }, geo[p.key]))
      /* THE FAULT HAS TO BE VISIBLE. `damage` is a no-op for every fault
         with no physical tell, which on some of these tracks is most of
         them — see the notes beside each part, and assets/damage.js. */
      .map((p) => (p.key === dtarget ? damage(p, G.fault && G.fault.key) : p)),
    camera: { dist: 26, yaw: 0.40, pitch: 0.34, target: [0.5, -0.3, 0.2], min: 12, max: 56 }
  };
}

/* =====================================================================
   The array bench

   The only model in the build whose part list is generated per ticket,
   because the array is: four members or eight, a spare or none, a
   replacement fitted in a slot or not. The slots are drawn from the disk
   list rather than declared, so the picture and the controller panel
   cannot disagree about how many disks are in the machine.

   Same colour rule, and it earns its keep here more than anywhere: every
   disk is the same colour whatever its state. An array where the failed
   member was tinted red would let a student skip the controller screen
   entirely, which is the one screen this track is about reading.
   ===================================================================== */
const RAID_BUILD = {
  /* A hot-swap carrier: the tray, the disk inside it, the latch and the two
     indicator lights on the front face.

     The tray is a FRAME — base, two side rails, front bezel — and not the
     solid block it was. Drawn solid it swallowed the disk and its label
     whole, so eleven carriers in a row were eleven identical featureless
     slabs, and a student asked which slot they were looking at had nothing
     to look at. The disk is the thing a carrier exists to show. */
  carrier: [
    { shape: "plate", size: [1.5, 0.14, 4.6], pos: [0, -0.46, 0], shade: 1.0 },
    { shape: "plate", size: [0.12, 0.92, 4.6], pos: [-0.69, 0, 0], shade: 0.9 },
    { shape: "plate", size: [0.12, 0.92, 4.6], pos: [0.69, 0, 0], shade: 0.9 },
    { shape: "rbox", size: [1.5, 1.05, 0.3], pos: [0, 0, -2.3], r: 0.06, shade: 1.0 },
    { shape: "rbox", size: [1.2, 0.7, 3.9], pos: [0, 0, 0.2], r: 0.04, shade: 0.72, mat: "steel" },
    { shape: "plate", size: [0.9, 0.06, 2.6], pos: [0, 0.38, 0.3], shade: 1.3, mat: "pale" },
    { shape: "rbox", size: [0.34, 0.8, 0.22], pos: [-0.5, 0, -2.52], r: 0.03, shade: 0.5, mat: "black" },
    { shape: "cyl", size: [0.12, 0.14], pos: [0.28, 0.22, -2.53], rot: [Math.PI / 2, 0, 0], shade: 1.6 },
    { shape: "cyl", size: [0.12, 0.14], pos: [0.28, -0.16, -2.53], rot: [Math.PI / 2, 0, 0], shade: 1.45 },
    { shape: "box", size: [0.14, 0.5, 0.1], pos: [0.62, 0, -2.53], shade: 0.4, mat: "black" }
  ],
  /* The chassis the carriers slide into. */
  enclosure: [
    { shape: "rbox", size: [14.0, 2.2, 5.4], pos: [0, 0, 0], r: 0.1, shade: 1.0 },
    { shape: "plate", size: [13.2, 0.08, 4.6], pos: [0, -1.05, 0.2], shade: 0.66, mat: "steel" },
    { shape: "box", size: [0.3, 1.6, 0.4], pos: [-6.7, 0, -2.5], r: 0.04, shade: 0.55, mat: "steel" },
    { shape: "box", size: [0.3, 1.6, 0.4], pos: [6.7, 0, -2.5], r: 0.04, shade: 0.55, mat: "steel" },
    { shape: "cyl", size: [0.14, 0.2], pos: [-6.2, 0.6, -2.6], rot: [Math.PI / 2, 0, 0], shade: 1.5 },
    /* `repeat` steps in ONE direction from `pos`, so a run that wants to sit
       centred has to start at the left edge. Begun at zero, five of the nine
       slot dividers marched off the right end of a fourteen-wide chassis and
       hung in the air beside it. */
    { shape: "plate", size: [0.1, 1.4, 4.2], pos: [-6.2, 0.85, 0], repeat: { count: 9, step: [1.55, 0, 0] },
      shade: 0.78, mat: "dark" }
  ],
  /* The controller card: board, processor under its heatsink, the SAS
     ports along one edge, the bracket. */
  controller: [
    { shape: "plate", size: [4.6, 0.12, 2.0], pos: [0, 0, 0], shade: 1.0 },
    { shape: "box", size: [1.1, 0.5, 1.1], pos: [-0.6, 0.3, 0], r: 0.03, shade: 0.5, mat: "alu" },
    { shape: "plate", size: [0.06, 0.55, 0.9], pos: [-1.1, 0.35, 0],
      repeat: { count: 12, step: [0.09, 0, 0] }, shade: 0.62, mat: "alu" },
    { shape: "rbox", size: [0.7, 0.34, 0.5], pos: [1.5, 0.2, -0.5], r: 0.03,
      repeat: { count: 2, step: [0, 0, 1.0] }, shade: 0.4, mat: "black" },
    { shape: "plate", size: [0.1, 1.7, 1.8], pos: [-2.4, 0.8, 0], shade: 1.25, mat: "steel" },
    { shape: "cyl", size: [0.16, 0.3], pos: [1.0, 0.2, 0.7], shade: 0.68, mat: "dark" },
    { shape: "plate", size: [1.6, 0.09, 0.14], pos: [0.4, 0, -0.9], shade: 1.45, mat: "gold" }
  ],
  /* The cache module and the battery pack wired beside it. */
  cache: [
    { shape: "plate", size: [2.0, 0.1, 0.7], pos: [0, 0, 0], shade: 1.0 },
    { shape: "box", size: [0.42, 0.24, 0.44], pos: [-0.55, 0.16, 0], r: 0.02,
      repeat: { count: 3, step: [0.55, 0, 0] }, shade: 0.5, mat: "black" },
    { shape: "rbox", size: [1.3, 0.5, 0.6], pos: [0, 0.05, 1.3], r: 0.06, shade: 0.62 },
    { shape: "cyl", size: [0.09, 1.1], pos: [0, 0.05, 0.72], rot: [Math.PI / 2, 0, 0], shade: 0.35 },
    { shape: "plate", size: [0.8, 0.05, 0.3], pos: [0, 0.32, 1.3], shade: 1.4, mat: "pale" }
  ],
  /* Tape and a network target — the thing that is not the array. */
  backup: [
    { shape: "rbox", size: [3.4, 1.6, 2.6], pos: [0, 0, 0], r: 0.08, shade: 1.0 },
    { shape: "rbox", size: [1.9, 0.24, 1.5], pos: [0, 0.7, 0.3], r: 0.05, shade: 0.7, mat: "black" },
    { shape: "cyl", size: [0.5, 0.2], pos: [-0.45, 0.85, 0.3], shade: 0.45, mat: "pale" },
    { shape: "cyl", size: [0.5, 0.2], pos: [0.5, 0.85, 0.3], shade: 0.45, mat: "pale" },
    { shape: "cyl", size: [0.12, 0.16], pos: [-1.2, -0.4, 1.32], rot: [Math.PI / 2, 0, 0],
      repeat: { count: 3, step: [0.4, 0, 0] }, shade: 1.5 },
    { shape: "plate", size: [0.06, 0.9, 2.0], pos: [1.75, 0, 0], repeat: { count: 4, step: [0.08, 0, 0] },
      shade: 0.72, mat: "dark" }
  ]
};

const RAID_COLOR = {
  /* Every carrier the same colour, whatever the disk in it is doing. */
  disk: "#4a5560", controller: "#2f6b4f", cache: "#3d4f63",
  enclosure: "#7c868e", backup: "#33393f"
};

export function raidModel(G, R) {
  /* The part the ticket GRADES, which is not always the part the fault
     table names — this track resolves its answer through its own map, and
     reading the wrong one drew the damage on the wrong component. */
  var dtarget = locateTarget(G);
  const s = G.seedBase, target = G.partTarget;
  const a = G.array;

  /* One carrier per disk in the array, laid out left to right in slot
     order, with the fixed hardware behind them. */
  const span = 1.72;
  const first = -((a.disks.length - 1) * span) / 2;
  const parts = a.disks.map((d, i) => ({
    key: "slot" + d.slot,
    label: "Slot " + d.slot + " — " + (d.role === "member" ? "member"
      : d.role === "spare" ? "unassigned disk" : "fitted replacement"),
    spec: d.model + ", " + d.capGb + "GB, " + d.hours.toLocaleString() + " hours",
    /* The carrier tells you what the controller says about it, and nothing
       more. Reading whether that matters is the exercise. */
    note: "Controller reports: " + d.state +
      (d.predFail ? ", predictive failure flagged" : "") +
      (d.reall ? ". Reallocated sectors " + d.reall : "") +
      (d.medium ? ". Medium errors " + d.medium : "") +
      ". " + (d.state === "Online" && !d.predFail && !d.medium
        ? "Spun up and serving. " + wear(s, i) : "The light on the front of the carrier says the same thing."),
    build: RAID_BUILD.carrier, finish: "steel", scale: 0.92,
    pos: [first + i * span, 0.9, 1.6],
    color: RAID_COLOR.disk
  }));

  const fixed = {
    enclosure: { build: RAID_BUILD.enclosure, finish: "steel", pos: [0, -1.5, 1.4] },
    controller: { build: RAID_BUILD.controller, finish: "board", pos: [-4.4, 1.2, -4.2] },
    cache: { build: RAID_BUILD.cache, finish: "board", pos: [1.2, 1.0, -4.6] },
    backup: { build: RAID_BUILD.backup, finish: "plastic", pos: [6.4, -0.6, -4.4] }
  };
  R.RAID_FIXED_PARTS.forEach((p, i) => {
    if (!fixed[p.key]) return;
    parts.push(Object.assign({
      key: p.key, label: p.label, spec: p.role,
      note: p.key === target && p.seen ? p.seen
        : "Nothing wrong with it that you can see. " + wear(s, i + 40),
      color: RAID_COLOR[p.key] || "#5c6873"
    }, fixed[p.key]));
  });

  return {
    kind: "raid",
    title: "The array, slot by slot",
    caption: "Every carrier in the enclosure, the card that owns them, the cache and its battery behind it, and " +
      "the backup system off to one side — which is the only thing here that protects against anything other " +
      "than a disk dying. Every carrier is the same colour, because what a disk is doing is on the controller " +
      "screen rather than on its front panel.",
    board: { size: [22, 0.4, 14], pos: [0, -3.4, -1.0], color: "#8f9aa4" },
    decor: [],
      /* THE FAULT HAS TO BE VISIBLE. `damage` is a no-op for every fault
         with no physical tell, which on this track is most of them — see
         the notes beside each part, and assets/damage.js for why. */
      parts: parts.map((p) => (p.key === dtarget ? damage(p, G.fault && G.fault.key) : p)),
    camera: { dist: 25, yaw: 0.34, pitch: 0.40, target: [0, -0.4, -0.6], min: 11, max: 54 }
  };
}

/* =====================================================================
   The print path

   Not a machine but a chain, laid out in the order a job travels it:
   workstation, cable, switch, device — with the print server above the
   switch and the access point beside it. The whole diagnostic skill on
   that track is naming which link a job stopped at, and a picture of the
   links is the cheapest way to make that thinkable.
   ===================================================================== */
const PNET_BUILD = {
  workstation: [
    { shape: "rbox", size: [1.9, 4.0, 4.4], pos: [0, 0, 0], r: 0.08, shade: 1.0 },
    { shape: "plate", size: [0.08, 3.2, 3.6], pos: [0.98, 0, 0], shade: 0.72, mat: "steel" },
    { shape: "cyl", size: [0.5, 0.14], pos: [0.99, 1.2, -1.2], rot: [0, 0, Math.PI / 2], shade: 0.5, mat: "black" },
    { shape: "box", size: [0.16, 0.7, 0.12], pos: [0.99, -0.4, -1.2],
      repeat: { count: 4, step: [0, 0, 0.55] }, shade: 0.4, mat: "black" },
    { shape: "cyl", size: [0.11, 0.14], pos: [0.99, 1.9, 1.4], rot: [0, 0, Math.PI / 2], shade: 1.6 },
    { shape: "plate", size: [0.06, 0.5, 3.0], pos: [-0.98, 0, 0],
      repeat: { count: 6, step: [-0.07, 0, 0] }, shade: 0.66, mat: "dark" }
  ],
  usbcable: [
    { shape: "rbox", size: [0.6, 0.28, 1.0], pos: [-1.9, 0, 0], r: 0.04, shade: 1.0 },
    { shape: "cyl", size: [0.15, 3.6], pos: [0, 0, 0], rot: [0, 0, Math.PI / 2], shade: 0.66 },
    { shape: "rbox", size: [0.5, 0.5, 0.7], pos: [1.95, 0, 0], r: 0.04, shade: 1.0 },
    { shape: "plate", size: [0.6, 0.1, 0.4], pos: [-1.9, 0.17, 0], shade: 1.5, mat: "steel" }
  ],
  switch: [
    { shape: "rbox", size: [6.4, 1.3, 2.4], pos: [0, 0, 0], r: 0.07, shade: 1.0 },
    { shape: "box", size: [0.4, 0.42, 0.3], pos: [-2.5, 0.2, 1.1],
      repeat: { count: 11, step: [0.48, 0, 0] }, shade: 0.34, mat: "black" },
    { shape: "box", size: [0.4, 0.42, 0.3], pos: [-2.5, -0.26, 1.1],
      repeat: { count: 11, step: [0.48, 0, 0] }, shade: 0.34, mat: "black" },
    { shape: "cyl", size: [0.08, 0.14], pos: [-2.5, 0.5, 1.14], rot: [Math.PI / 2, 0, 0],
      repeat: { count: 11, step: [0.48, 0, 0] }, shade: 1.6 },
    { shape: "plate", size: [0.07, 0.85, 2.0], pos: [3.05, 0, 0],
      repeat: { count: 5, step: [0.09, 0, 0] }, shade: 0.72, mat: "dark" }
  ],
  /* A floor multifunction: body, the flatbed lid, the panel, the tray
     drawers down the front and the output slot. */
  printer: [
    { shape: "rbox", size: [5.4, 4.4, 4.6], pos: [0, 0, 0], r: 0.12, shade: 1.0 },
    { shape: "rbox", size: [5.0, 0.5, 4.2], pos: [0, 2.4, 0], r: 0.1, shade: 0.78 },
    { shape: "rbox", size: [2.4, 0.3, 1.5], pos: [-1.2, 2.75, 1.5], r: 0.06, shade: 0.45, mat: "black" },
    { shape: "plate", size: [1.7, 0.06, 1.0], pos: [-1.2, 2.92, 1.5], shade: 1.45 },
    { shape: "rbox", size: [4.6, 0.9, 0.3], pos: [0, -0.8, 2.35], r: 0.05,
      repeat: { count: 3, step: [0, -1.1, 0] }, shade: 0.62 },
    { shape: "box", size: [3.4, 0.16, 0.5], pos: [0, 1.4, 2.3], shade: 0.35, mat: "black" },
    { shape: "box", size: [0.16, 0.5, 0.12], pos: [2.5, -2.0, -2.32], shade: 0.4, mat: "black" }
  ],
  server: [
    { shape: "rbox", size: [6.0, 1.6, 4.4], pos: [0, 0, 0], r: 0.06, shade: 1.0 },
    /* Bay faces set into the front panel. At 0.8 deep on a chassis whose
       front is at 2.2 they stuck half a unit out into the air as six loose
       tabs hanging off the bottom edge. */
    { shape: "plate", size: [0.1, 1.0, 0.24], pos: [-2.4, 0, 2.14],
      repeat: { count: 6, step: [0.9, 0, 0] }, shade: 0.62, mat: "steel" },
    { shape: "cyl", size: [0.1, 0.14], pos: [2.5, 0.5, 2.26], rot: [Math.PI / 2, 0, 0], shade: 1.6 },
    { shape: "cyl", size: [0.1, 0.14], pos: [2.5, 0.1, 2.26], rot: [Math.PI / 2, 0, 0], shade: 1.35 },
    { shape: "box", size: [5.4, 0.1, 0.3], pos: [0, 0.85, 0], shade: 0.78, mat: "dark" }
  ],
  ap: [
    { shape: "cyl", size: [2.0, 0.5], pos: [0, 0, 0], shade: 1.0 },
    { shape: "cyl", size: [1.5, 0.2], pos: [0, 0.32, 0], shade: 0.82, mat: "pale" },
    { shape: "cyl", size: [0.2, 0.16], pos: [0, 0.45, 0.9], shade: 1.55 },
    { shape: "box", size: [0.5, 0.3, 0.4], pos: [1.6, -0.2, 0], r: 0.03, shade: 0.5, mat: "black" },
    { shape: "cyl", size: [0.1, 1.2], pos: [0, -0.5, 0], shade: 0.66, mat: "steel" }
  ]
};

/* Colour says what a thing IS. Nothing is tinted for being the fault, and
   on this track that matters because half these faults are settings that
   would look identical whatever colour anything was. */
const PNET_COLOR = {
  workstation: "#5c6873", usbcable: "#33393f", switch: "#3a4149",
  printer: "#c9ced3", server: "#2f6b4f", ap: "#8f9aa4"
};

export function printnetModel(G, PN) {
  /* The part the ticket GRADES, which is not always the part the fault
     table names — this track resolves its answer through its own map, and
     reading the wrong one drew the damage on the wrong component. */
  var dtarget = locateTarget(G);
  const s = G.seedBase, target = G.partTarget;
  const geo = {
    workstation: { build: PNET_BUILD.workstation, finish: "steel",   pos: [-9.2, 0.5, 2.0] },
    usbcable:    { build: PNET_BUILD.usbcable,    finish: "rubber",  pos: [-5.8, 2.6, 4.6] },
    switch:      { build: PNET_BUILD.switch,      finish: "steel",   pos: [-1.0, 1.0, -2.2] },
    server:      { build: PNET_BUILD.server,      finish: "steel",   pos: [-1.0, -2.4, 2.6] },
    ap:          { build: PNET_BUILD.ap,          finish: "plastic", pos: [-1.0, 4.2, 2.6] },
    printer:     { build: PNET_BUILD.printer,     finish: "plastic", pos: [7.4, 0.6, 0.0] }
  };
  return {
    kind: "printnet",
    title: "The path a job takes",
    caption: "In the order the job travels: the workstation that holds the driver and the queue, the cable, the " +
      "switch and the boundary it enforces, the print server that holds everybody's queue, the access point, and " +
      "the device at the end. Seven places a job can stop, and the caller describes all of them the same way.",
    board: { size: [26, 0.4, 13], pos: [-1.0, -4.6, 0.4], color: "#7c868e" },
    decor: [],
    parts: PN.PRINTNET_PARTS.filter((p) => geo[p.key]).map((p, i) => Object.assign({
      key: p.key, label: p.label, spec: p.role,
      note: p.key === target && p.seen ? p.seen
        : "Nothing wrong with it that you can see. " + wear(s, i),
      color: PNET_COLOR[p.key] || "#5c6873"
    }, geo[p.key]))
      /* THE FAULT HAS TO BE VISIBLE. `damage` is a no-op for every fault
         with no physical tell, which on some of these tracks is most of
         them — see the notes beside each part, and assets/damage.js. */
      .map((p) => (p.key === dtarget ? damage(p, G.fault && G.fault.key) : p)),
    camera: { dist: 26, yaw: 0.40, pitch: 0.36, target: [-1.0, -0.2, 0.2], min: 12, max: 56 }
  };
}

export function displayModel(G, parts) {
  const s = G.seedBase, target = G.partTarget;
  const geo = {
    backlight: { build: DISP_BUILD.backlight, finish: "plastic", pos: [-1.6, 0, 0] },
    panel:     { build: DISP_BUILD.panel,     finish: "glass", skin: "anodised",   pos: [-1.6, 1.5, 0] },
    driver:    { build: DISP_BUILD.driver,    finish: "board", skin: "pcb",   pos: [-1.4, -1.5, 2.6] },
    vidcable:  { build: DISP_BUILD.vidcable,  finish: "rubber",  pos: [2.6, -0.5, 0] },
    gpu:       { build: DISP_BUILD.gpu,       finish: "board", skin: "pcb",   pos: [2.6, -1.6, -2.8] },
    vidport:   { build: DISP_BUILD.vidport,   finish: "plastic", pos: [4.6, -1.5, 2.4] },
    lamp:      { build: DISP_BUILD.lamp,      finish: "metal",   pos: [5.4, 0.6, -0.4] },
    filter:    { build: DISP_BUILD.filter,    finish: "matte",   pos: [6.8, -1.6, 2.2] }
  };
  return {
    kind: "display",
    title: "The display bench",
    caption: "Not one machine but everything you might point at: the panel and the backlight behind it, the " +
      "driver that lights it, the cable up to it, the graphics end that feeds it, and the lamp and filter " +
      "from a projector. Half of these get cleared by a torch before you touch anything.",
    board: { size: [16, 0.4, 9], pos: [2.0, -2.7, 0], color: "#7c868e" },
    decor: [],
    parts: parts.filter((p) => geo[p.key]).map((p, i) => Object.assign({
      key: p.key, label: p.label, spec: p.role,
      note: p.key === target && p.seen ? p.seen
        : "Nothing wrong with it that you can see. " + wear(s, i),
      color: DISP_COLOR[p.key] || "#5c6873"
    }, geo[p.key]))
      /* THE FAULT HAS TO BE VISIBLE. Measured before this line existed:
         ten tickets on this track rendered ONE machine. The note said the
         part was damaged and the part looked perfect. */
      .map((p) => (p.key === target ? damage(p, G.fault && G.fault.key) : p)),
    camera: { dist: 17, yaw: 0.46, pitch: 0.40, target: [1.6, 0, 0], min: 8, max: 40 }
  };
}
