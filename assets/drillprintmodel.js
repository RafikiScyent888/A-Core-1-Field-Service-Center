/* =====================================================================
   The machine on the bench — objectives 3.7 and 3.8

   Seven shapes, because seven is how many genuinely different machines are
   in this pool once you stop counting model names. What is drawn is what a
   technician looks at to tell them apart, and nothing else:

     receipt   a small clamshell with a roll in it and a tear bar
     label     a wider body, a roll on a spindle, and on transfer machines a
               second spindle for the ribbon
     impact    a travelling carriage, a ribbon across the front, and the
               sprocket wheels that are this family's signature
     fdm       an open frame, a gantry, a spool on the side, a heated bed
     resin     a sealed hood over a vat, and a plate that lifts out of it
     laser     a closed box with a cartridge door and a paper tray
     inkjet    a lighter body with a carriage on a rail and no fuser

   The sprocket wheels and the ribbon are drawn deliberately and separately
   on the impact machines, because "can it make a carbon copy" is the one
   question in this drill that a student can answer from the picture alone
   — if they know to look for what strikes the page.
   ===================================================================== */

const P2 = Math.PI / 2;

function rbox(size, pos, shade, r) {
  return { shape: "rbox", size: size, pos: pos, r: r === undefined ? 0.08 : r, shade: shade };
}
function cyl(d, h, pos, rot, seg, shade) {
  return { shape: "cyl", size: [d, h], pos: pos, rot: rot || [0, 0, 0], seg: seg || 16, shade: shade };
}
function plate(size, pos, shade) {
  return { shape: "plate", size: size, pos: pos, shade: shade };
}

/* A roll of paper, which three of the seven shapes carry. */
function roll(x, y, z, d, w) {
  return [
    cyl(d, w, [x, y, z], [0, 0, P2], 18, 1.25),
    cyl(d * 0.3, w + 0.06, [x, y, z], [0, 0, P2], 12, 0.7)
  ];
}

/* The sprocket wheels either side of an impact machine's paper path. Drawn
   as real toothed wheels rather than as blocks, because they are the tell. */
function tractor(x, y, z) {
  const out = [cyl(0.62, 0.42, [x, y, z], [0, 0, P2], 14, 1.1)];
  for (let i = 0; i < 8; i++) {
    const a = i * (Math.PI / 4);
    out.push(rbox([0.24, 0.1, 0.1],
      [x, y + Math.sin(a) * 0.34, z + Math.cos(a) * 0.34], 1.35, 0.02));
  }
  return out;
}

/* EVERYTHING THAT MATTERS SITS ABOVE THE SHELL.

   The first version placed the ribbon, the carriage, the rail and the
   tractor wheels at heights INSIDE the body box, so all of it merged into
   the shell and every machine rendered as a plain slab. The whole premise of
   this subject is that a student identifies the machine by looking at it,
   and there was nothing to look at.

   Bodies run from y -0.75 to +0.75. Mechanism goes above 0.75, lids stand
   open, and rolls sit where an open lid actually reveals them. */
const TOP = 0.75;

const BUILD = {
  receipt: (it) => [
    rbox([2.4, 1.5, 2.6], [0, 0, 0], 1.0, 0.14),
    /* Lid standing open, because a closed clamshell hides the one thing
       that identifies the machine. */
    rbox([2.3, 0.14, 2.3], [0, TOP + 0.95, -1.05], 0.75, 0.05),
    ...roll(0, TOP + 0.5, 0.05, 1.5, 1.9),
    rbox([2.2, 0.12, 0.18], [0, TOP + 0.1, 1.3], 1.5, 0.02),      // tear bar
    cyl(0.36, 1.9, [0, TOP + 0.12, 0.95], [0, 0, P2], 12, 0.75),  // rubber roller
    ...(it.key === "portablethermal"
      ? [rbox([2.6, 0.4, 2.8], [0, -0.9, 0], 0.55, 0.16),
         cyl(0.32, 0.14, [0.85, 0.1, 1.35], [P2, 0, 0], 12, 1.6)]
      : []),
    ...(it.key === "kiosk"
      ? [rbox([0.4, 3.4, 3.4], [-1.85, 0.9, 0], 0.45, 0.08),
         rbox([0.4, 3.4, 3.4], [1.85, 0.9, 0], 0.45, 0.08),
         rbox([4.1, 0.4, 3.4], [0, 2.5, 0], 0.45, 0.08),
         rbox([1.7, 0.18, 0.24], [0, 1.6, 1.6], 1.6, 0.03)]
      : [])
  ],

  label: (it) => [
    rbox([3.0, 1.5, 2.8], [0, 0, 0], 1.0, 0.14),
    rbox([2.9, 0.14, 2.5], [0, TOP + 1.05, -1.15], 0.75, 0.05),   // lid, open
    ...roll(0, TOP + 0.6, -0.35, 1.7, 2.3),
    /* the gap sensor, proud of the deck where it can be seen */
    rbox([0.22, 0.26, 0.22], [1.05, TOP + 0.15, 0.95], 1.55, 0.03),
    rbox([0.22, 0.26, 0.22], [-1.05, TOP + 0.15, 0.95], 1.55, 0.03),
    cyl(0.36, 2.5, [0, TOP + 0.12, 1.15], [0, 0, P2], 12, 0.75),
    ...(it.key === "transfer" || it.key === "dyesub"
      ? [...roll(0, TOP + 1.35, 0.15, 0.8, 2.1),                  // ribbon supply
         ...roll(0, TOP + 1.3, 0.95, 0.55, 2.1)]                  // take-up spool
      : [])
  ],

  impact: (it) => {
    const w = it.key === "widecarriage" ? 6.4 : it.key === "impactslip" ? 2.6 : 4.4;
    const out = [
      rbox([w, 1.5, 3.0], [0, 0, 0], 1.0, 0.12),
      plate([w - 0.4, 0.08, 2.3], [0, TOP + 0.04, 0], 0.85),      // the deck
      rbox([w * 0.7, 0.42, 0.55], [0, TOP + 0.3, 1.15], 1.3, 0.06),  // ribbon cartridge
      rbox([0.85, 0.55, 0.75], [-w * 0.2, TOP + 0.42, 0.5], 1.5, 0.06), // carriage
      cyl(0.18, w - 0.6, [0, TOP + 0.42, 0.15], [0, 0, P2], 10, 1.55)  // the rail
    ];
    if (it.key === "impactslip") {
      out.push(rbox([1.9, 0.16, 0.22], [0, 0.15, 1.55], 1.6, 0.02));
    } else {
      const dx = it.key === "widecarriage" ? 2.9 : 1.9;
      /* Standing proud at the back, where a technician looks for them. These
         are the family's signature and the answer to the carbon question. */
      out.push(...tractor(-dx, TOP + 0.42, -1.1), ...tractor(dx, TOP + 0.42, -1.1));
      out.push(cyl(0.12, dx * 2, [0, TOP + 0.42, -1.1], [0, 0, P2], 8, 1.2));
      if (it.key === "line") {
        out.push(rbox([w - 0.9, 0.7, 0.45], [0, TOP + 0.5, -0.2], 1.15, 0.05));
      }
    }
    return out;
  },

  fdm: () => [
    ...[-1.6, 1.6].map((x) => rbox([0.22, 3.2, 0.22], [x, 0.9, -1.2], 1.15, 0.04)),
    ...[-1.6, 1.6].map((x) => rbox([0.22, 3.2, 0.22], [x, 0.9, 1.2], 1.15, 0.04)),
    rbox([3.6, 0.22, 0.22], [0, 2.5, 0], 1.15, 0.04),
    rbox([3.8, 0.5, 3.0], [0, -0.95, 0], 0.85, 0.08),
    rbox([2.6, 0.16, 2.4], [0, -0.6, 0], 1.45, 0.04),        // heated bed, above the base
    rbox([3.4, 0.22, 0.5], [0, 1.3, 0], 1.3, 0.05),          // gantry
    rbox([0.5, 0.7, 0.5], [0.4, 0.95, 0], 1.55, 0.06),       // hot end
    cyl(0.16, 0.42, [0.4, 0.55, 0], [0, 0, 0], 10, 1.65),    // nozzle
    ...roll(-2.5, 1.5, -0.6, 1.6, 0.6)                       // spool, clear of the frame
  ],

  resin: () => [
    rbox([3.0, 0.6, 3.0], [0, -1.2, 0], 0.85, 0.1),
    rbox([2.6, 0.6, 2.6], [0, -0.6, 0], 0.55, 0.06),         // vat
    plate([2.2, 0.05, 2.2], [0, -0.35, 0], 1.05),            // resin surface
    rbox([1.6, 0.14, 1.6], [0, 0.65, 0], 1.4, 0.04),         // build plate, lifted out
    rbox([0.3, 2.2, 0.3], [0, 0.7, -1.15], 1.2, 0.05),       // lift column
    /* The hood is DRAWN LIFTED. `glass` is a finish name in this engine, not
       a transparency flag, so a hood over the machine rendered as an opaque
       box with the vat, the plate and the column invisible inside it — the
       whole machine was a featureless slab. A real one lifts off, and a
       lifted one is also what a technician sees when identifying it. */
    rbox([3.0, 0.18, 3.0], [0, 2.75, -0.35], 1.5, 0.1),
    ...[-1.45, 1.45].map((x) => rbox([0.16, 0.9, 3.0], [x, 2.3, -0.35], 1.45, 0.06)),
    rbox([3.0, 0.9, 0.16], [0, 2.3, -1.8], 1.45, 0.06)
  ],

  laser: (it) => [
    rbox([3.6, 2.2, 3.2], [0, 0, 0], 1.0, 0.14),
    rbox([3.2, 0.9, 0.16], [0, 0.05, 1.68], 0.75, 0.05),     // cartridge door, proud
    cyl(0.2, 0.55, [1.15, 0.05, 1.79], [0, 0, P2], 10, 1.45),
    rbox([3.2, 0.45, 2.6], [0, -1.35, 0], 0.72, 0.08),       // tray below the body
    plate([2.8, 0.05, 2.2], [0, -1.1, 0], 1.1),
    ...(it.key === "mfp"
      ? [rbox([3.6, 0.28, 3.2], [0, 1.25, 0], 0.9, 0.1),
         plate([3.0, 0.05, 2.4], [0, 1.42, 0], 1.55),
         rbox([3.4, 0.45, 1.4], [0, 1.72, -0.75], 0.78, 0.1)]
      : [])
  ],

  inkjet: (it) => {
    const w = it.key === "plotter" ? 7.0 : 3.4;
    return [
      rbox([w, 1.5, 2.8], [0, 0, 0], 1.0, 0.12),
      cyl(0.18, w - 0.5, [0, TOP + 0.38, 0.25], [0, 0, P2], 10, 1.55),  // rail, above
      rbox([0.95, 0.6, 0.85], [-w * 0.2, TOP + 0.42, 0.25], 1.4, 0.06), // carriage
      ...(it.key === "photoinkjet"
        ? [0,1,2,3,4,5].map((i) => rbox([0.14, 0.4, 0.55],
            [-w * 0.2 - 0.36 + i * 0.145, TOP + 0.85, 0.25], 1.6, 0.02))
        : [0,1].map((i) => rbox([0.36, 0.42, 0.55],
            [-w * 0.2 - 0.22 + i * 0.44, TOP + 0.85, 0.25], 1.6, 0.03))),
      ...(it.key === "plotter"
        ? [...roll(0, TOP + 0.55, -1.3, 1.5, 6.3),
           ...[-3.0, 3.0].map((x) => rbox([0.25, 2.4, 0.25], [x, -1.95, 0], 0.9, 0.05))]
        : [rbox([3.0, 0.4, 2.2], [0, -1.05, 0], 0.72, 0.08)])
    ];
  }
};


export function printerModel(D) {
  const it = D.item;
  const build = BUILD[it.form];
  /* Sixth table in this build keyed by the item. It says which form is
     missing rather than drawing nothing and letting the questions ask about
     an empty bench. */
  if (!build) {
    throw new Error('drillprintmodel: no geometry for printer form "' + it.form +
      '" (item "' + it.key + '"). Add it to BUILD, or the bench renders empty.');
  }
  return {
    kind: "drill",
    title: "On the bench",
    caption: "One machine, lit and turned so you can get at it. Nothing here names it \u2014 " +
      "look at what would mark the page, how the paper is held, and what you would have to " +
      "open to replace something. If anything on it strikes the paper, that matters.",
    board: { size: [13, 0.3, 11], pos: [0, -1.9, 0], color: "#6d7a74",
      build: [
        { shape: "rbox", size: [13, 0.3, 11], pos: [0, 0, 0], r: 0.12, shade: 1.0 },
        { shape: "plate", size: [12.2, 0.03, 10.2], pos: [0, 0.17, 0], shade: 0.88 }
      ], scale: 1 },
    decor: [],
    parts: [{
      key: "printer",
      label: "The machine",
      build: build(it),
      finish: it.form === "resin" ? "plastic" : "matte",
      scale: 1,
      size: [7, 3.4, 3.4],
      pos: [0, 0, 0],
      color: it.form === "fdm" || it.form === "resin" ? "#3f474d" : "#d8d5cc",
      spec: "As found, on the bench",
      note: "Look before you answer. What is loaded in it, what travels, what strikes the " +
        "page, and what you would open to change a consumable."
    }],
    camera: { dist: 12, yaw: 0.7, pitch: 0.45, target: [0, 0, 0], min: 5, max: 24 }
  };
}
