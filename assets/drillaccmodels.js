/* =====================================================================
   Field Service Center — models for objective 1.2

   Same rule as the connector drill and it matters more here: NOTHING IN
   THIS FILE NAMES THE ITEM. The part is "the accessory", the note says what
   a technician would see, and a student who reads every word still has to
   work out what they are holding.

   What is different from 3.2 is what has to be drawn. On a connector the
   graded facts are countable — contacts, keying, latch. Here the graded
   facts are DEPENDENCIES, and a dependency has to be made visible or the
   3D view is decoration. So every model carries the physical evidence of
   what it needs:

     a mains inlet          -> it has its own supply
     charge indicator lights -> it holds a charge
     a captive lead          -> it is wired, and to what
     no connector at all     -> it is wireless
     a lens, a grille, a nib -> what it is for

   Those are exactly the features the questions turn on, which is what makes
   turning the model a real way to answer rather than a decoration next to
   the real way.
   ===================================================================== */

const P2 = Math.PI / 2;

/* A captive lead running off the back, ending in the plug it actually ends
   in. Drawn because "how does it attach" is graded. */
function lead(len, r, z, plug) {
  /* `tail: 1` is metadata the scene ignores. It marks the cable so a test can
     measure the body of the accessory without the lead inflating it \u2014 a
     small puck on a long cord is not a large object to look at. */
  var out = [
    { shape: "rbox", size: [r * 2.4, r * 1.8, 0.6], pos: [0, 0, z - 0.3], r: 0.06, shade: 0.55, tail: 1 },
    { shape: "cyl", size: [r * 1.4, len], pos: [0, 0, z - 0.6 - len / 2], rot: [P2, 0, 0], seg: 12, shade: 0.48, tail: 1 }
  ];
  if (plug === "usbc") {
    out.push({ shape: "rbox", size: [0.55, 0.22, 0.5], pos: [0, 0, z - 0.6 - len - 0.25], r: 0.1, shade: 1.3, tail: 1 });
  } else if (plug === "usba") {
    out.push({ shape: "rbox", size: [0.62, 0.26, 0.55], pos: [0, 0, z - 0.6 - len - 0.28], r: 0.03, shade: 1.3, tail: 1 });
  } else if (plug === "trs") {
    out.push({ shape: "cyl", size: [0.16, 0.75], pos: [0, 0, z - 0.6 - len - 0.35], rot: [P2, 0, 0], seg: 12, shade: 1.35, tail: 1 });
    out.push({ shape: "torus", size: [0.17, 0.035], pos: [0, 0, z - 0.6 - len - 0.2], rot: [0, 0, 0],
      repeat: { count: 3, step: [0, 0, -0.18] }, seg: 12, shade: 0.4, tail: 1 });
  }
  return out;
}

/* A mains inlet. The single most diagnostic feature in this whole pool:
   if it is here, the thing has its own supply and can push power back. */
function mains(x, y, z) {
  return [
    { shape: "cyl", size: [0.42, 0.34], pos: [x, y, z], rot: [P2, 0, 0], seg: 14, shade: 0.35, mains: 1 },
    { shape: "cyl", size: [0.16, 0.4], pos: [x, y, z], rot: [P2, 0, 0], seg: 10, shade: 1.4 }
  ];
}

/* Charge indicator lights. The tell for something that holds a charge. */
function pips(n, x0, step, y, z) {
  return [{ shape: "cyl", size: [0.13, 0.06], pos: [x0, y, z], rot: [P2, 0, 0],
    repeat: { count: n, step: [step, 0, 0] }, seg: 10, shade: 1.5, pip: n }];
}

/* A row of sockets along a face. */
function sockets(n, x0, step, y, z, w, h) {
  return [{ shape: "box", size: [w, h, 0.3], pos: [x0, y, z],
    repeat: { count: n, step: [step, 0, 0] }, r: 0.02, shade: 0.3 }];
}

export const ACCESSORY_BUILD = {
  /* Expansion. The three that get confused all look like a slab with ports;
     the mains inlet and the size are what separate them. */
  dock: [
    { shape: "rbox", size: [4.2, 1.5, 2.2], pos: [0, 0, 0], r: 0.12, shade: 1.0 },
    { shape: "plate", size: [3.8, 0.05, 1.8], pos: [0, 0.78, 0], shade: 1.18 }
  ].concat(sockets(3, -1.2, 0.75, 0.1, -1.12, 0.62, 0.34))
   .concat(sockets(3, -1.2, 0.75, -0.42, -1.12, 0.5, 0.26))
   .concat(mains(1.65, -0.1, -1.15))
   .concat([{ shape: "cyl", size: [0.2, 0.12], pos: [-1.8, 0.5, 1.05], rot: [P2, 0, 0], seg: 10, shade: 1.5 }])
   .concat(lead(2.4, 0.2, 1.15, "usbc")),

  portrep: [
    { shape: "rbox", size: [4.0, 0.72, 1.3], pos: [0, 0, 0], r: 0.09, shade: 1.0 }
  ].concat(sockets(4, -1.35, 0.9, 0.0, -0.68, 0.6, 0.32))
   .concat(sockets(2, -0.6, 1.2, 0.0, 0.68, 0.5, 0.28))
   .concat(lead(2.2, 0.18, 0.7, "usbc")),

  usbchub: [
    { shape: "rbox", size: [2.6, 0.42, 1.15], pos: [0, 0, 0], r: 0.08, shade: 1.0 }
  ].concat(sockets(3, -0.8, 0.8, 0, -0.6, 0.5, 0.24))
   .concat(sockets(1, 1.0, 0, 0, -0.6, 0.42, 0.2))
   .concat([
    { shape: "rbox", size: [0.5, 0.2, 0.75], pos: [0, 0, 0.95], r: 0.09, shade: 0.62 },
    { shape: "rbox", size: [0.45, 0.16, 0.42], pos: [0, 0, 1.5], r: 0.08, shade: 1.3 }
  ]),

  tbdock: [
    { shape: "rbox", size: [2.4, 2.6, 2.4], pos: [0, 0, 0], r: 0.1, shade: 1.0 },
    { shape: "plate", size: [2.0, 0.05, 2.0], pos: [0, 1.33, 0], shade: 1.18 }
  ].concat(sockets(3, -0.7, 0.7, 0.5, -1.22, 0.55, 0.3))
   .concat(sockets(3, -0.7, 0.7, -0.2, -1.22, 0.5, 0.26))
   .concat(mains(0.75, -0.9, -1.25))
   .concat([
    /* The Thunderbolt mark beside the host port. On the real thing it is the
       only way to know this port can feed the dock at all. */
    { shape: "plate", size: [0.1, 0.34, 0.05], pos: [-0.82, -0.9, -1.24], rot: [0, 0, 0.5], shade: 1.55 },
    { shape: "plate", size: [0.1, 0.2, 0.05], pos: [-0.72, -0.99, -1.24], rot: [0, 0, -0.9], shade: 1.55 }
  ]).concat(lead(2.2, 0.2, 1.25, "usbc")),

  /* Input. The two pens are the sharpest pair in the pool and the whole
     difference is the tip and whether there is anything to charge. */
  activepen: [
    { shape: "cyl", size: [0.44, 3.4], pos: [0, 0, 0], rot: [P2, 0, 0], seg: 16, shade: 1.0 },
    { shape: "cone", size: [0.06, 0.6, 0.42], pos: [0, 0, 2.0], rot: [-P2, 0, 0], seg: 16, shade: 0.7 },
    { shape: "cyl", size: [0.07, 0.34], pos: [0, 0, 2.42], rot: [P2, 0, 0], seg: 10, shade: 0.28, nib: 1 },
    { shape: "box", size: [0.16, 0.09, 0.5], pos: [0, 0.22, 0.5], r: 0.03, shade: 0.55 },
    { shape: "box", size: [0.16, 0.09, 0.5], pos: [0, 0.22, -0.15], r: 0.03, shade: 0.55 },
    { shape: "cyl", size: [0.3, 0.16], pos: [0, 0, -1.78], rot: [P2, 0, 0], seg: 14, shade: 1.4 },
    { shape: "cyl", size: [0.2, 0.1], pos: [0, 0, -1.88], rot: [P2, 0, 0], seg: 12, shade: 0.35, contactpad: 1 }
  ],

  capstylus: [
    { shape: "cyl", size: [0.42, 3.2], pos: [0, 0, 0], rot: [P2, 0, 0], seg: 16, shade: 1.0 },
    { shape: "cyl", size: [0.36, 0.3], pos: [0, 0, 1.72], rot: [P2, 0, 0], seg: 16, shade: 0.9 },
    /* A broad soft dome. No nib, no buttons, nothing to charge. */
    { shape: "sphere", size: [0.5], pos: [0, 0, 2.0], seg: 14, shade: 0.42, dome: 1 },
    { shape: "cyl", size: [0.2, 0.5], pos: [0, 0, -1.82], rot: [P2, 0, 0], seg: 12, shade: 1.35 },
    { shape: "torus", size: [0.46, 0.05], pos: [0, 0, 1.1], rot: [0, 0, 0], seg: 16, shade: 1.25 }
  ],

  drawtablet: [
    { shape: "rbox", size: [4.6, 0.32, 3.4], pos: [0, 0, 0], r: 0.1, shade: 1.0 },
    { shape: "plate", size: [3.4, 0.04, 2.5], pos: [0.4, 0.18, 0], shade: 0.82 },
    { shape: "box", size: [0.5, 0.14, 0.34], pos: [-1.85, 0.16, -0.9], r: 0.04,
      repeat: { count: 4, step: [0, 0, 0.6] }, shade: 0.6 },
    { shape: "cyl", size: [0.26, 2.4], pos: [1.4, 0.28, 2.05], rot: [0, 0, P2], seg: 12, shade: 0.62 },
    { shape: "cone", size: [0.05, 0.4, 0.24], pos: [2.68, 0.28, 2.05], rot: [0, 0, -P2], seg: 12, shade: 0.4 }
  ].concat(lead(2.0, 0.16, -1.75, "usba")),

  /* Audio. Same headband three times; the plug on the end is the answer. */
  btheadset: [
    { shape: "torus", size: [2.6, 0.18], pos: [0, 0.5, 0], rot: [0, P2, 0], arc: Math.PI, seg: 20, shade: 1.0 },
    { shape: "cyl", size: [1.0, 0.5], pos: [-1.28, 0.4, 0], rot: [0, 0, P2], seg: 16, shade: 1.0 },
    { shape: "cyl", size: [1.0, 0.5], pos: [1.28, 0.4, 0], rot: [0, 0, P2], seg: 16, shade: 1.0 },
    { shape: "cyl", size: [0.82, 0.16], pos: [-1.5, 0.4, 0], rot: [0, 0, P2], seg: 16, shade: 0.55 },
    { shape: "cyl", size: [0.82, 0.16], pos: [1.5, 0.4, 0], rot: [0, 0, P2], seg: 16, shade: 0.55 },
    { shape: "cyl", size: [0.28, 3.0], pos: [-0.9, -0.5, 0.9], rot: [0.5, 0.7, 0], seg: 12, shade: 0.9 },
    { shape: "sphere", size: [0.34], pos: [-1.85, -1.2, 1.7], seg: 12, shade: 0.55 },
    /* No cable anywhere. What it has instead is a charge port and a light. */
    { shape: "box", size: [0.3, 0.14, 0.16], pos: [1.28, -0.35, 0.3], r: 0.03, shade: 0.3, chargeport: 1 },
    { shape: "cyl", size: [0.16, 0.06], pos: [1.28, -0.15, 0.42], rot: [0.4, 0, 0], seg: 10, shade: 1.5, pip: 1 }
  ],

  usbheadset: [
    { shape: "torus", size: [2.6, 0.18], pos: [0, 0.5, 0], rot: [0, P2, 0], arc: Math.PI, seg: 20, shade: 1.0 },
    { shape: "cyl", size: [1.0, 0.5], pos: [-1.28, 0.4, 0], rot: [0, 0, P2], seg: 16, shade: 1.0 },
    { shape: "cyl", size: [1.0, 0.5], pos: [1.28, 0.4, 0], rot: [0, 0, P2], seg: 16, shade: 1.0 },
    { shape: "cyl", size: [0.82, 0.16], pos: [-1.5, 0.4, 0], rot: [0, 0, P2], seg: 16, shade: 0.55 },
    { shape: "cyl", size: [0.82, 0.16], pos: [1.5, 0.4, 0], rot: [0, 0, P2], seg: 16, shade: 0.55 },
    { shape: "cyl", size: [0.28, 3.0], pos: [-0.9, -0.5, 0.9], rot: [0.5, 0.7, 0], seg: 12, shade: 0.9 },
    { shape: "sphere", size: [0.34], pos: [-1.85, -1.2, 1.7], seg: 12, shade: 0.55 },
    /* The inline pod is the other tell: a wired headset with its own
       controls has its own sound device behind them. */
    { shape: "rbox", size: [0.42, 0.22, 0.9], pos: [1.28, -1.4, 0.2], r: 0.05, shade: 0.62 }
  ].concat(lead(1.9, 0.14, -1.9, "usba")),

  trsheadset: [
    { shape: "torus", size: [2.6, 0.18], pos: [0, 0.5, 0], rot: [0, P2, 0], arc: Math.PI, seg: 20, shade: 1.0 },
    { shape: "cyl", size: [1.0, 0.5], pos: [-1.28, 0.4, 0], rot: [0, 0, P2], seg: 16, shade: 1.0 },
    { shape: "cyl", size: [1.0, 0.5], pos: [1.28, 0.4, 0], rot: [0, 0, P2], seg: 16, shade: 1.0 },
    { shape: "cyl", size: [0.82, 0.16], pos: [-1.5, 0.4, 0], rot: [0, 0, P2], seg: 16, shade: 0.55 },
    { shape: "cyl", size: [0.82, 0.16], pos: [1.5, 0.4, 0], rot: [0, 0, P2], seg: 16, shade: 0.55 },
    { shape: "cyl", size: [0.28, 3.0], pos: [-0.9, -0.5, 0.9], rot: [0.5, 0.7, 0], seg: 12, shade: 0.9 },
    { shape: "sphere", size: [0.34], pos: [-1.85, -1.2, 1.7], seg: 12, shade: 0.55 }
  ].concat(lead(1.9, 0.14, -1.9, "trs")),

  /* Storage. Size is the whole story, so they are drawn to each other's
     scale and the big one carries the switch that the small one cannot. */
  microsd: [
    { shape: "plate", size: [1.1, 0.1, 1.5], pos: [0, 0, 0], shade: 1.0 },
    /* The clipped corner. It is the keying \u2014 the card only goes in one way
       round and this notch is why. */
    { shape: "plate", size: [0.3, 0.13, 0.3], pos: [-0.42, 0, -0.62], rot: [0, 0.78, 0], shade: 0.55 },
    { shape: "box", size: [0.09, 0.05, 0.42], pos: [-0.36, 0.07, 0.48],
      repeat: { count: 8, step: [0.105, 0, 0] }, shade: 1.5 },
    /* The stepped edge along one side, and a label panel. Small features,
       but the whole card is small and there has to be something to look at. */
    { shape: "plate", size: [0.08, 0.12, 1.1], pos: [0.51, 0.01, 0.1], shade: 0.72 },
    { shape: "plate", size: [0.8, 0.02, 0.62], pos: [0.05, 0.06, -0.28], shade: 1.25 },
    { shape: "plate", size: [0.5, 0.02, 0.09], pos: [0.05, 0.08, -0.4],
      repeat: { count: 3, step: [0, 0, 0.18] }, shade: 0.6 }
  ],

  sdcard: [
    { shape: "plate", size: [2.4, 0.21, 3.2], pos: [0, 0, 0], shade: 1.0 },
    { shape: "plate", size: [0.5, 0.23, 0.5], pos: [-0.95, 0, -1.35], rot: [0, 0.78, 0], shade: 0.55 },
    { shape: "box", size: [0.14, 0.06, 0.7], pos: [-0.78, 0.13, 1.1],
      repeat: { count: 9, step: [0.19, 0, 0] }, shade: 1.5 },
    /* The lock switch. The one physical difference that matters, and the
       reason a card "suddenly goes read-only". */
    { shape: "box", size: [0.16, 0.2, 0.5], pos: [1.24, 0.02, -0.5], r: 0.02, shade: 0.35, lockswitch: 1 },
    { shape: "box", size: [0.1, 0.14, 0.34], pos: [1.24, 0.06, -0.5], r: 0.02, shade: 1.3 },
    { shape: "plate", size: [1.7, 0.02, 1.5], pos: [0.1, 0.12, -0.4], shade: 1.25 },
    { shape: "plate", size: [1.1, 0.02, 0.14], pos: [0.1, 0.14, -0.7],
      repeat: { count: 3, step: [0, 0, 0.34] }, shade: 0.6 }
  ],

  /* Power. One holds a charge and says so; the other has mains pins. */
  powerbank: [
    { shape: "rbox", size: [2.2, 0.9, 4.2], pos: [0, 0, 0], r: 0.18, shade: 1.0 }
  ].concat(pips(4, -0.66, 0.44, 0.47, 1.2))
   .concat(sockets(2, -0.5, 1.0, 0, -2.12, 0.5, 0.26))
   .concat([{ shape: "box", size: [0.42, 0.22, 0.3], pos: [0.55, 0, 2.12], r: 0.04, shade: 0.3, inlet: 1 }]),

  charger: [
    { shape: "rbox", size: [2.0, 2.0, 1.4], pos: [0, 0, 0], r: 0.22, shade: 1.0 },
    /* Mains pins. Nothing else in the pool has these. */
    { shape: "box", size: [0.18, 0.5, 0.18], pos: [-0.42, 0.2, -1.0], r: 0.02, shade: 1.35, pin: 1 },
    { shape: "box", size: [0.18, 0.5, 0.18], pos: [0.42, 0.2, -1.0], r: 0.02, shade: 1.35, pin: 1 },
    { shape: "box", size: [0.5, 0.18, 0.18], pos: [0, -0.55, -1.0], r: 0.02, shade: 1.35, pin: 1 }
  ].concat(sockets(2, -0.42, 0.84, -0.2, 0.72, 0.52, 0.26))
   .concat([{ shape: "plate", size: [0.9, 0.02, 0.3], pos: [0, 0.6, 0.71], shade: 1.4 }]),

  /* Conference. Both USB, both in the same box; one has a lens and the
     other has a grille, and that is the entire diagnostic. */
  webcam: [
    { shape: "rbox", size: [2.6, 0.85, 0.85], pos: [0, 0.35, 0], r: 0.22, shade: 1.0 },
    { shape: "cyl", size: [0.55, 0.28], pos: [0, 0.35, 0.5], rot: [P2, 0, 0], seg: 16, shade: 0.42, lens: 1 },
    { shape: "cyl", size: [0.3, 0.14], pos: [0, 0.35, 0.62], rot: [P2, 0, 0], seg: 16, shade: 0.22, lens: 1 },
    { shape: "cyl", size: [0.14, 0.08], pos: [0.85, 0.35, 0.46], rot: [P2, 0, 0], seg: 10, shade: 1.5 },
    { shape: "box", size: [2.0, 0.16, 0.6], pos: [0, -0.15, -0.2], r: 0.05, shade: 0.7 },
    { shape: "box", size: [1.9, 0.16, 0.7], pos: [0, -0.6, -0.55], rot: [0.55, 0, 0], r: 0.05, shade: 0.7 }
  ].concat(lead(2.0, 0.14, -0.55, "usba")),

  speakerphone: [
    { shape: "cyl", size: [3.4, 0.62], pos: [0, 0, 0], seg: 26, shade: 1.0 },
    /* A speaker grille, drawn as real perforation rows rather than implied. */
    { shape: "cyl", size: [2.7, 0.06], pos: [0, 0.33, 0], seg: 26, shade: 0.72 },
    /* `ring` adds its radius to pos, so pos is the CENTRE. Giving it an
       offset as well flung these across the bench. */
    { shape: "cyl", size: [0.14, 0.1], pos: [0, 0.37, 0], seg: 8,
      ring: { count: 10, radius: 0.9, axis: "y" }, shade: 0.3 },
    { shape: "cyl", size: [0.14, 0.1], pos: [0, 0.37, 0], seg: 8,
      ring: { count: 16, radius: 1.8, axis: "y" }, shade: 0.3 },
    { shape: "cyl", size: [0.3, 0.12], pos: [0, 0.34, 0], seg: 12, shade: 1.4 },
    { shape: "box", size: [0.34, 0.14, 0.34], pos: [0, 0.35, 0], r: 0.05,
      ring: { count: 6, radius: 1.35, axis: "y" }, shade: 0.5 }
  ].concat(lead(2.0, 0.16, -3.3, "usba"))
};

/* Real colours, not a key. Two things that are the same colour in a room
   are the same colour here. */
const BODY = {
  dock: "#3a4249", portrep: "#3a4249", usbchub: "#8f99a3", tbdock: "#2f363c",
  activepen: "#4a5560", capstylus: "#6d757d", drawtablet: "#2e3439",
  btheadset: "#3f474e", usbheadset: "#2b3238", trsheadset: "#2b3238",
  microsd: "#4a5a63", sdcard: "#4a5a63",
  powerbank: "#4d565e", charger: "#e6e6e2",
  webcam: "#2b3238", speakerphone: "#454d54"
};

/* One camera does not fit a microSD card and a Thunderbolt dock. The pool
   spans an order of magnitude in size, and a card framed for a dock is a
   speck \u2014 which defeats the entire exercise. */
const CAM = {
  microsd: 3.4, sdcard: 5.0, activepen: 6.4, capstylus: 6.4,
  usbchub: 7.0, charger: 7.2, webcam: 8.0, powerbank: 8.2,
  btheadset: 9.0, usbheadset: 10.5, trsheadset: 10.5,
  dock: 9.0, portrep: 9.2, tbdock: 8.0, drawtablet: 10.0, speakerphone: 8.6
};

export function accessoryModel(D) {
  var it = D.item;
  return {
    kind: "drill",
    title: "On the desk",
    caption: "One accessory, lit and turned. Nothing here tells you what it is — but " +
      "everything you need is drawn on it. A mains inlet means its own supply. Charge lights " +
      "mean it holds a charge. A captive lead tells you how it attaches, and no connector at all " +
      "tells you it does not. Turn it over before you answer.",
    board: { size: [13, 0.3, 11], pos: [0, -1.5, 0], color: "#6d7a74",
      build: [
        { shape: "rbox", size: [13, 0.3, 11], pos: [0, 0, 0], r: 0.12, shade: 1.0 },
        { shape: "plate", size: [12.1, 0.03, 10.1], pos: [0, 0.17, 0], shade: 0.88 }
      ], scale: 1 },
    decor: [],
    parts: [{
      key: "acc",
      label: "The accessory",
      build: ACCESSORY_BUILD[it.key],
      finish: it.family === "power" || it.key === "charger" ? "plastic" : "matte",
      scale: 1,
      size: [4.6, 2.6, 4.4],
      pos: [0, 0, 0],
      color: BODY[it.key],
      spec: "On the desk, as it came out of the box",
      note: "Look before you answer. Find where its current comes from — a mains inlet, an " +
        "indicator that says it holds a charge, or nothing but the lead. Find how it attaches, " +
        "or whether it attaches at all. Then work out what it therefore cannot do, because that " +
        "is the question people get wrong."
    }],
    camera: { dist: CAM[it.key] || 9.5, yaw: 0.66, pitch: 0.5, target: [0, 0, 0],
      min: (CAM[it.key] || 9.5) * 0.34, max: (CAM[it.key] || 9.5) * 2.6 }
  };
}
