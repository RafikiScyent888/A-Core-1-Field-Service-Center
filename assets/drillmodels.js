/* =====================================================================
   Field Service Center — models for the identification drill

   One rule above all others in this file: NOTHING HERE NAMES THE ITEM.

   On the ticket tracks a part carries its own label, because knowing you
   are looking at a power supply is not the exercise. Here it is the whole
   exercise, so the part is called "the connector", its specification says
   "in your hand", and the note describes what a technician would see
   without telling them what they are seeing. The moment this file says
   "RJ45" next to the model, the drill is over.

   Second rule: the contacts are countable. "How many contacts" is a graded
   question and the honest way to answer it is to turn the model face-on and
   count, so every contact is drawn as its own primitive with real spacing
   rather than suggested by a stripe.

   Authored at a common scale so one camera works for all of them: the body
   of a connector is roughly two units across, and the cable runs back along
   negative Z.
   ===================================================================== */

const P2 = Math.PI / 2;

/* A moulded cable tail. Every connector has one, and having it there gives
   the eye something to judge the body's size against. */
function tail(len, r, z) {
  return [
    { shape: "rbox", size: [r * 2.1, r * 1.7, 0.7], pos: [0, 0, z - 0.35], r: 0.08, shade: 0.62 },
    { shape: "cyl", size: [r * 1.5, len], pos: [0, 0, z - 0.7 - len / 2], rot: [P2, 0, 0], seg: 14, shade: 0.5 }
  ];
}

/* A row of contacts, drawn individually because they get counted.

   `contact` is metadata, not geometry \u2014 the scene builder ignores it. It
   is here so a test can add up what is actually drawn and check it against
   the answer the drill grades, because "count them" is only fair advice if
   the number on the model is the number in the answer. */
function contacts(n, x0, step, y, z, w, h, d, shade) {
  return [{ shape: "box", size: [w, h, d], pos: [x0, y, z], contact: n,
    repeat: { count: n, step: [step, 0, 0] }, r: 0.004, shade: shade === undefined ? 1.5 : shade }];
}

/* A trapezoid prism, stacked from plates. Three connectors here are
   trapezoids and none of the primitives is one, so this fakes it with a
   stack whose width tapers — which at the scale the camera sits at is
   indistinguishable from the real shape. */
function taper(wTop, wBot, h, d, y, z, shade, layers) {
  var n = layers || 9, out = [];
  for (var i = 0; i < n; i++) {
    var t = i / (n - 1);
    out.push({ shape: "plate", size: [wBot + (wTop - wBot) * t, h / n + 0.004, d],
      pos: [0, y - h / 2 + h * (i + 0.5) / n, z], shade: shade });
  }
  return out;
}

export const CONNECTOR_BUILD = {
  /* Modular plugs. The clear body, the contacts sunk into their slots, and
     the sprung clip on the back that is the whole reason these break. */
  rj45: [
    { shape: "rbox", size: [1.5, 1.0, 2.1], pos: [0, 0, 0], r: 0.06, shade: 1.25 },
    { shape: "plate", size: [1.32, 0.06, 1.9], pos: [0, 0.47, 0], shade: 1.05 }
  ].concat(contacts(8, -0.56, 0.16, 0.34, 0.55, 0.09, 0.5, 0.9))
   .concat([
    { shape: "box", size: [0.6, 0.1, 1.0], pos: [0, -0.5, -0.2], r: 0.03, shade: 1.15 },
    { shape: "box", size: [0.55, 0.09, 0.75], pos: [0, -0.72, -0.72], rot: [-0.32, 0, 0], r: 0.02, shade: 1.15 }
  ]).concat(tail(2.2, 0.42, -1.05)),

  rj11: [
    { shape: "rbox", size: [1.0, 1.0, 2.0], pos: [0, 0, 0], r: 0.06, shade: 1.25 },
    { shape: "plate", size: [0.86, 0.06, 1.8], pos: [0, 0.47, 0], shade: 1.05 }
  ].concat(contacts(4, -0.24, 0.16, 0.34, 0.55, 0.09, 0.5, 0.9))
   .concat([
    { shape: "box", size: [0.5, 0.1, 0.95], pos: [0, -0.5, -0.2], r: 0.03, shade: 1.15 },
    { shape: "box", size: [0.46, 0.09, 0.7], pos: [0, -0.72, -0.7], rot: [-0.32, 0, 0], r: 0.02, shade: 1.15 }
  ]).concat(tail(2.2, 0.32, -1.0)),

  /* USB. A metal shell with a tongue inside it, and the contacts are on the
     tongue rather than on the shell — which is what you have to look at to
     count them. */
  usba: [
    { shape: "rbox", size: [1.7, 0.72, 1.6], pos: [0, 0, 0], r: 0.04, shade: 1.35 },
    { shape: "plate", size: [1.34, 0.26, 1.5], pos: [0, -0.12, 0.06], shade: 0.85 }
  ].concat(contacts(4, -0.42, 0.28, 0.04, 0.5, 0.16, 0.05, 1.1))
   .concat([{ shape: "rbox", size: [1.9, 1.0, 1.1], pos: [0, 0, -1.2], r: 0.08, shade: 0.55 }])
   .concat(tail(2.0, 0.42, -1.6)),

  usbb: [
    { shape: "rbox", size: [1.3, 1.15, 1.5], pos: [0, -0.1, 0], r: 0.04, shade: 1.35 }
  ].concat(taper(0.8, 1.3, 0.5, 1.5, 0.62, 0, 1.35, 5))
   .concat(contacts(4, -0.3, 0.2, 0.1, 0.5, 0.14, 0.05, 1.1))
   .concat([{ shape: "rbox", size: [1.6, 1.5, 1.1], pos: [0, -0.05, -1.2], r: 0.09, shade: 0.55 }])
   .concat(tail(2.0, 0.42, -1.6)),

  /* Type-C. Rounded oval shell, and contacts on BOTH faces of the tongue —
     twelve and twelve — which is why it does not care which way up it is. */
  usbc: [
    { shape: "rbox", size: [1.55, 0.62, 1.5], pos: [0, 0, 0], r: 0.29, shade: 1.35 },
    { shape: "rbox", size: [1.2, 0.2, 1.4], pos: [0, 0, 0.05], r: 0.08, shade: 0.85 }
  ].concat(contacts(12, -0.5, 0.091, 0.1, 0.5, 0.055, 0.035, 1.1))
   .concat(contacts(12, -0.5, 0.091, -0.1, 0.5, 0.055, 0.035, 1.1))
   .concat([{ shape: "rbox", size: [1.9, 1.0, 1.0], pos: [0, 0, -1.15], r: 0.2, shade: 0.55 }])
   .concat(tail(2.0, 0.38, -1.5)),

  /* Lightning. No shell at all — a solid tab with the contacts on the
     outside of it, which is the difference you can see. */
  lightning: [
    { shape: "rbox", size: [1.15, 0.3, 1.5], pos: [0, 0, 0], r: 0.1, shade: 1.35 }
  ].concat(contacts(8, -0.42, 0.12, 0.16, 0.2, 0.085, 0.035, 1.15))
   /* The same eight contacts, seen from the other side. That is what makes it
      reversible \u2014 unlike Type-C, which has a genuinely separate twelve on
      each face. So the second row is drawn but deliberately not counted. */
   .concat(contacts(8, -0.42, 0.12, -0.16, 0.2, 0.085, 0.035, 1.15)
     .map(function (q) { delete q.contact; return q; }))
   .concat([{ shape: "rbox", size: [1.5, 0.8, 1.0], pos: [0, 0, -1.1], r: 0.18, shade: 0.55 }])
   .concat(tail(2.0, 0.34, -1.45)),

  /* HDMI. A trapezoid with nineteen contacts in two staggered rows and
     nothing whatsoever holding it in. */
  hdmi: taper(1.5, 1.9, 0.72, 1.6, 0, 0, 1.35)
    .concat([{ shape: "plate", size: [1.5, 0.22, 1.5], pos: [0, -0.02, 0.06], shade: 0.85 }])
    .concat(contacts(10, -0.63, 0.14, 0.14, 0.5, 0.07, 0.04, 1.1))
    .concat(contacts(9, -0.56, 0.14, -0.06, 0.5, 0.07, 0.04, 1.1))
    .concat([{ shape: "rbox", size: [2.2, 1.15, 1.2], pos: [0, 0, -1.25], r: 0.1, shade: 0.55 }])
    .concat(tail(2.0, 0.48, -1.7)),

  /* DisplayPort. One square corner, one clipped corner, and a latch release
     standing proud of the moulding. Asymmetry is the tell. */
  displayport: [
    { shape: "rbox", size: [1.85, 0.74, 1.6], pos: [-0.05, 0, 0], r: 0.04, shade: 1.35 },
    { shape: "plate", size: [0.34, 0.5, 1.62], pos: [0.82, -0.13, 0], rot: [0, 0, 0.42], shade: 1.35 },
    { shape: "plate", size: [1.5, 0.24, 1.5], pos: [-0.05, -0.02, 0.06], shade: 0.85 }
  ].concat(contacts(10, -0.72, 0.15, 0.14, 0.5, 0.07, 0.04, 1.1))
   .concat(contacts(10, -0.72, 0.15, -0.08, 0.5, 0.07, 0.04, 1.1))
   .concat([
    { shape: "rbox", size: [2.2, 1.2, 1.2], pos: [0, 0, -1.25], r: 0.09, shade: 0.55 },
    { shape: "box", size: [0.5, 0.22, 0.7], pos: [0, 0.62, -1.0], r: 0.05, shade: 1.1 },
    { shape: "box", size: [0.3, 0.14, 0.34], pos: [0, 0.76, -0.62], r: 0.04, shade: 1.35 }
  ]).concat(tail(1.9, 0.48, -1.7)),

  /* DVI-D. Three rows of eight, and the flat blade with nothing beside it —
     the empty space around the blade is what says "digital only". */
  dvid: [
    { shape: "rbox", size: [2.7, 1.15, 0.9], pos: [0, 0, 0], r: 0.05, shade: 1.2 },
    { shape: "plate", size: [2.3, 0.86, 0.5], pos: [-0.16, 0, 0.28], shade: 0.9 }
  ].concat(contacts(8, -1.18, 0.17, 0.26, 0.5, 0.07, 0.07, 1.45))
   .concat(contacts(8, -1.18, 0.17, 0.0, 0.5, 0.07, 0.07, 1.45))
   .concat(contacts(8, -1.18, 0.17, -0.26, 0.5, 0.07, 0.07, 1.45))
   .concat([
    { shape: "plate", size: [0.14, 0.5, 0.3], pos: [1.03, 0, 0.5], shade: 1.5 },
    { shape: "cyl", size: [0.4, 0.5], pos: [-1.5, 0, 0.1], rot: [P2, 0, 0], seg: 12, shade: 1.4 },
    { shape: "cyl", size: [0.4, 0.5], pos: [1.5, 0, 0.1], rot: [P2, 0, 0], seg: 12, shade: 1.4 },
    { shape: "rbox", size: [2.4, 1.4, 1.1], pos: [0, 0, -1.0], r: 0.1, shade: 0.55 }
  ]).concat(tail(1.8, 0.5, -1.5)),

  /* VGA. A D-shaped shell — one long edge chamfered so it only goes in one
     way — and fifteen pins in three neat rows of five. */
  vga: [
    { shape: "rbox", size: [2.3, 0.95, 0.85], pos: [0, 0, 0], r: 0.05, shade: 1.2 },
    { shape: "plate", size: [2.05, 0.2, 0.5], pos: [0, -0.42, 0.2], rot: [0.4, 0, 0], shade: 1.2 },
    { shape: "plate", size: [1.85, 0.66, 0.42], pos: [0, 0.02, 0.3], shade: 0.9 }
  ].concat(contacts(5, -0.6, 0.3, 0.22, 0.52, 0.075, 0.075, 1.45))
   .concat(contacts(5, -0.6, 0.3, 0.0, 0.52, 0.075, 0.075, 1.45))
   .concat(contacts(5, -0.6, 0.3, -0.2, 0.52, 0.075, 0.075, 1.45))
   .concat([
    { shape: "cyl", size: [0.38, 0.5], pos: [-1.35, 0, 0.1], rot: [P2, 0, 0], seg: 12, shade: 1.4 },
    { shape: "cyl", size: [0.38, 0.5], pos: [1.35, 0, 0.1], rot: [P2, 0, 0], seg: 12, shade: 1.4 },
    { shape: "rbox", size: [2.1, 1.25, 1.1], pos: [0, 0, -0.95], r: 0.1, shade: 0.55 }
  ]).concat(tail(1.8, 0.46, -1.45)),

  /* SATA. Both of these are an L in cross-section and both go into the same
     drive; the only difference that matters is the width and the count. */
  satadata: [
    { shape: "rbox", size: [1.15, 0.42, 1.2], pos: [0, 0, 0], r: 0.03, shade: 0.55 },
    { shape: "box", size: [1.15, 0.2, 0.28], pos: [0, 0.31, 0.46], r: 0.02, shade: 0.55 },
    { shape: "plate", size: [0.92, 0.12, 1.0], pos: [0, -0.06, 0.05], shade: 0.8 }
  ].concat(contacts(7, -0.36, 0.12, 0.02, 0.5, 0.07, 0.05, 1.45))
   .concat([{ shape: "rbox", size: [1.25, 0.6, 0.9], pos: [0, 0, -0.95], r: 0.08, shade: 0.42 }])
   .concat(tail(1.8, 0.3, -1.35)),

  satapower: [
    { shape: "rbox", size: [2.3, 0.42, 1.2], pos: [0, 0, 0], r: 0.03, shade: 0.55 },
    { shape: "box", size: [2.3, 0.2, 0.28], pos: [0, 0.31, 0.46], r: 0.02, shade: 0.55 },
    { shape: "plate", size: [2.05, 0.12, 1.0], pos: [0, -0.06, 0.05], shade: 0.8 }
  ].concat(contacts(15, -0.98, 0.14, 0.02, 0.5, 0.08, 0.05, 1.45))
   .concat([{ shape: "rbox", size: [2.3, 0.62, 0.9], pos: [0, 0, -0.95], r: 0.08, shade: 0.42 }])
   .concat(tail(1.8, 0.34, -1.35)),

  /* Molex. Thick nylon, four round pins, and two bevelled corners along one
     edge so it cannot go in upside down. */
  molex: [
    { shape: "rbox", size: [2.0, 0.9, 1.3], pos: [0, 0, 0], r: 0.05, shade: 1.4 },
    { shape: "plate", size: [1.9, 0.28, 0.55], pos: [0, 0.4, 0.3], rot: [0.5, 0, 0], shade: 1.4 },
    { shape: "cyl", size: [0.26, 0.7], pos: [-0.66, 0, 0.4], rot: [P2, 0, 0], seg: 12, shade: 1.5, contact: 1 },
    { shape: "cyl", size: [0.26, 0.7], pos: [-0.22, 0, 0.4], rot: [P2, 0, 0], seg: 12, shade: 1.5, contact: 1 },
    { shape: "cyl", size: [0.26, 0.7], pos: [0.22, 0, 0.4], rot: [P2, 0, 0], seg: 12, shade: 1.5, contact: 1 },
    { shape: "cyl", size: [0.26, 0.7], pos: [0.66, 0, 0.4], rot: [P2, 0, 0], seg: 12, shade: 1.5, contact: 1 }
  ].concat(tail(1.9, 0.5, -0.7)),

  /* Fibre. The ferrule is the connector — the plastic around it is a handle.
     Drawn as a duplex pair because that is how they arrive. */
  lc: [
    { shape: "rbox", size: [0.62, 0.62, 1.5], pos: [-0.36, 0, 0], r: 0.04, shade: 1.15 },
    { shape: "rbox", size: [0.62, 0.62, 1.5], pos: [0.36, 0, 0], r: 0.04, shade: 1.15 },
    { shape: "cyl", size: [0.26, 0.8], pos: [-0.36, 0, 0.95], rot: [P2, 0, 0], seg: 14, shade: 1.5, contact: 1 },
    { shape: "cyl", size: [0.26, 0.8], pos: [0.36, 0, 0.95], rot: [P2, 0, 0], seg: 14, shade: 1.5, contact: 1 },
    { shape: "box", size: [0.4, 0.1, 0.7], pos: [-0.36, 0.36, -0.35], rot: [-0.25, 0, 0], r: 0.02, shade: 1.0 },
    { shape: "box", size: [0.4, 0.1, 0.7], pos: [0.36, 0.36, -0.35], rot: [-0.25, 0, 0], r: 0.02, shade: 1.0 },
    { shape: "rbox", size: [1.5, 0.5, 0.5], pos: [0, 0, -1.0], r: 0.06, shade: 0.6 }
  ].concat(tail(1.9, 0.36, -1.3)),

  sc: [
    { shape: "rbox", size: [0.95, 0.95, 1.7], pos: [-0.55, 0, 0], r: 0.04, shade: 1.15 },
    { shape: "rbox", size: [0.95, 0.95, 1.7], pos: [0.55, 0, 0], r: 0.04, shade: 1.15 },
    { shape: "cyl", size: [0.5, 0.85], pos: [-0.55, 0, 1.1], rot: [P2, 0, 0], seg: 16, shade: 1.5, contact: 1 },
    { shape: "cyl", size: [0.5, 0.85], pos: [0.55, 0, 1.1], rot: [P2, 0, 0], seg: 16, shade: 1.5, contact: 1 },
    { shape: "plate", size: [0.8, 0.06, 1.4], pos: [-0.55, 0.5, 0], shade: 0.95 },
    { shape: "plate", size: [0.8, 0.06, 1.4], pos: [0.55, 0.5, 0], shade: 0.95 },
    { shape: "rbox", size: [2.0, 0.62, 0.55], pos: [0, 0, -1.15], r: 0.07, shade: 0.6 }
  ].concat(tail(1.9, 0.42, -1.45)),

  /* Coax. One is threaded, one is a bayonet with two lugs, and both have the
     centre conductor standing out of the middle. */
  ftype: [
    { shape: "cyl", size: [0.95, 1.3], pos: [0, 0, 0.1], rot: [P2, 0, 0], seg: 18, shade: 1.3 },
    { shape: "torus", size: [0.98, 0.09], pos: [0, 0, 0.62], rot: [0, 0, 0],
      repeat: { count: 6, step: [0, 0, -0.15] }, seg: 18, shade: 1.15 },
    { shape: "cyl", size: [0.62, 0.7], pos: [0, 0, -0.75], rot: [P2, 0, 0], seg: 16, shade: 1.4 },
    { shape: "cyl", size: [0.08, 1.3], pos: [0, 0, 0.55], rot: [P2, 0, 0], seg: 10, shade: 1.55, contact: 1 }
  ].concat(tail(1.9, 0.36, -1.1)),

  bnc: [
    { shape: "cyl", size: [1.0, 1.15], pos: [0, 0, 0.05], rot: [P2, 0, 0], seg: 18, shade: 1.3 },
    { shape: "tube", size: [1.16, 0.7], pos: [0, 0, 0.45], rot: [P2, 0, 0], seg: 20, shade: 1.15 },
    { shape: "box", size: [0.16, 0.16, 0.3], pos: [0.56, 0, 0.5], r: 0.02, shade: 1.45 },
    { shape: "box", size: [0.16, 0.16, 0.3], pos: [-0.56, 0, 0.5], r: 0.02, shade: 1.45 },
    { shape: "cyl", size: [0.66, 0.7], pos: [0, 0, -0.72], rot: [P2, 0, 0], seg: 16, shade: 1.4 },
    { shape: "cyl", size: [0.1, 1.1], pos: [0, 0, 0.5], rot: [P2, 0, 0], seg: 10, shade: 1.55, contact: 1 }
  ].concat(tail(1.9, 0.38, -1.05))
};

/* Colour says what a thing IS, never what it is called. These are the real
   colours of the real objects — clear plastic, tinned steel, black nylon,
   the beige of a fibre patch lead — and two connectors that are genuinely
   the same colour in the room are the same colour here. It is not a key. */
const BODY = {
  rj45: "#c9cfc6", rj11: "#c9cfc6",
  usba: "#9aa4ad", usbb: "#9aa4ad", usbc: "#8f99a3", lightning: "#b9c0c7",
  hdmi: "#8f99a3", displayport: "#8f99a3", dvid: "#d7d3c8", vga: "#3f5f8a",
  satadata: "#2b2f34", satapower: "#2b2f34", molex: "#ddd8c9",
  lc: "#4a8ec2", sc: "#4a8ec2", ftype: "#a9b0b7", bnc: "#a9b0b7"
};

/* ---------------------------------------------------------------------
   The scene.

   One part, and it is called "the connector". Not RJ45, not "network plug",
   not anything that narrows it down — the label, the specification line and
   the note are all written to be true of every item in the pool, so reading
   them carefully tells a student to go and look at the model rather than
   handing them the answer.
   --------------------------------------------------------------------- */
export function connectorModel(D) {
  var it = D.item;
  return {
    kind: "drill",
    title: "On the bench",
    caption: "One connector, lit and turned so you can get at every face of it. " +
      "Nothing on this page tells you what it is — the contacts are drawn " +
      "individually so they can be counted, and the way it locks is drawn as the " +
      "mechanism it actually is. Use the camera buttons and look at it properly.",
    board: { size: [11, 0.3, 9], pos: [0, -1.15, 0], color: "#6d7a74",
      build: [
        { shape: "rbox", size: [11, 0.3, 9], pos: [0, 0, 0], r: 0.12, shade: 1.0 },
        { shape: "plate", size: [10.2, 0.03, 8.2], pos: [0, 0.17, 0], shade: 0.88 }
      ], scale: 1 },
    decor: [],
    parts: [{
      key: "conn",
      label: "The connector",
      build: CONNECTOR_BUILD[it.key],
      finish: it.family === "fibre" ? "plastic" : (it.key === "molex" || it.key === "rj45" || it.key === "rj11" ? "plastic" : "metal"),
      scale: 1,
      size: [2.6, 1.4, 4.4],
      pos: [0, 0, 0],
      color: BODY[it.key],
      spec: "In your hand, cable tail attached",
      note: "Look at it before you answer anything. Count the contacts face-on, " +
        "check the width against the cable behind it, and find whatever holds it in — " +
        "a clip, a thread, a pair of lugs, a screw, or nothing at all."
    }],
    camera: { dist: 7.4, yaw: 0.62, pitch: 0.52, target: [0, 0, 0], min: 3.2, max: 16 }
  };
}
