/* =====================================================================
   Field Service Center — the plan for objective 2.7

   One objective, two halves, two things to draw — and the same ground under
   both of them, because "compare and contrast" is impossible if the two
   things being compared are drawn at different scales in different worlds.

   THE SERVICE HALF is drawn as the outside of a building with what actually
   arrives at it, and what is at the other end: a cabinet at the end of the
   street, an exchange further off, a mast on a hill, a dish aimed at empty
   sky, or nothing at all except an antenna. And, crucially, HOW MANY OTHER
   PREMISES ARE TAPPED INTO THE SAME RUN — drawn as neighbouring buildings
   joined to it, because contention is the characteristic candidates never
   look for and it is visible from the pavement.

   THE SCOPE HALF is drawn as a boundary of the same size on screen every
   time, with the reference objects inside it changing. A desk and a chair
   fit inside one. A building fits inside another. A town fits inside a
   third. The boundary never moves and what fits inside it is the whole of
   the reading — which is exactly how anybody reads a map, and it means the
   answer cannot be taken from the size of the drawing.

   NOTHING IS LABELLED. No distances, no names, no numbers.
   ===================================================================== */

const P2 = Math.PI / 2;

const GROUND_W = 26;
const GROUND_D = 13;
const PLAN_W = 19;

function box(size, pos, shade, r) {
  return { shape: "box", size: size, pos: pos, shade: shade, r: r };
}

/* ---------------------------------------------------------------------
   THE SERVICE HALF.

   The customer's building on the left, the street running away to the
   right, and whatever the service comes from at the far end of it.
   --------------------------------------------------------------------- */
const HOME = [-8.6, 0, 0];

function premises(x, z, w, d, h, shade) {
  var out = [box([w, h, d], [x, h / 2, z], shade, 0.06)];
  /* a pitched roof, so a building reads as a building from above */
  out.push({ shape: "box", size: [w * 0.72, h * 0.34, d * 0.72], pos: [x, h + h * 0.16, z],
    r: 0.08, shade: shade * 0.86 });
  return out;
}

/* The customer's own building, and the neighbours along the street. How many
   neighbours there are is the contention reading and nothing says it in
   words. */
function street(sharedKind) {
  var out = premises(HOME[0], 0, 3.2, 3.4, 2.6, 1.0);
  var n = sharedKind === "street" || sharedKind === "air" ? 5
    : sharedKind === "provider" ? 2 : 0;
  for (var i = 0; i < n; i++) {
    var x = HOME[0] + 3.0 + i * 2.6;
    out = out.concat(premises(x, 3.6, 2.0, 2.4, 1.9, 0.74));
  }
  /* the pavement the run follows */
  out.push(box([GROUND_W - 4, 0.08, 1.1], [1.0, 0.04, 1.9], 0.5, 0.02));
  return out;
}

/* What lands on the customer's wall. Four shapes, and one of them is the
   absence of a shape. */
function arrival(key) {
  var w = [HOME[0] + 1.7, 1.5, 0.6];   // the face of the building, street side
  var out = [];
  if (key === "cable") {
    out.push({ shape: "rbox", size: [0.4, 0.6, 0.6], pos: w, r: 0.04, shade: 1.0 });
    out.push({ shape: "cyl", size: [0.13, 0.44], pos: [w[0] + 0.4, w[1], w[2]], rot: [0, 0, P2],
      seg: 14, shade: 1.5, coaxBarrel: 1 });
    out.push({ shape: "torus", size: [0.15, 0.04], pos: [w[0] + 0.26, w[1], w[2]], rot: [0, 0, P2],
      seg: 12, shade: 1.5, repeat: { count: 3, step: [0.08, 0, 0] } });
  } else if (key === "dsl" || key === "dialup") {
    /* The flattest arrival there is: a pair of wires and a small socket. */
    out.push({ shape: "rbox", size: [0.14, 0.5, 0.62], pos: w, r: 0.03, shade: 1.0 });
    out.push({ shape: "box", size: [0.08, 0.2, 0.24], pos: [w[0] + 0.1, w[1], w[2]], r: 0.02,
      shade: 0.55, phonePair: 1 });
    /* The drop wire, actually reaching the first pole rather than stopping
       in mid-air, which is what it did on the first cut. */
    var dx = -5.6 - w[0], dy = 3.3 - w[1];
    out.push({ shape: "box", size: [Math.hypot(dx, dy), 0.07, 0.07],
      pos: [w[0] + dx / 2, w[1] + dy / 2, w[2] - 1.0], rot: [0, 0, Math.atan2(dy, dx)],
      r: 0.03, shade: 0.85 });
    if (key === "dialup") {
      /* And a handset on the wall beside it, because this one takes the line
         over while it is up. */
      out.push({ shape: "rbox", size: [0.2, 0.5, 0.34], pos: [w[0], w[1] - 0.9, w[2] + 0.7],
        r: 0.06, shade: 0.85, handset: 1 });
    }
  } else if (key === "fibre" || key === "leased") {
    out.push({ shape: "rbox", size: [0.4, 1.0, 0.8], pos: w, r: 0.05, shade: 1.0 });
    out.push({ shape: "box", size: [0.08, 0.7, 0.76], pos: [w[0] + 0.5, w[1] - 0.4, w[2] + 0.3],
      rot: [0, 0, -0.9], r: 0.02, shade: 0.8, hingedCover: 1 });
    out.push({ shape: "cyl", size: [0.09, 0.34], pos: [w[0] + 0.32, w[1] + 0.1, w[2]],
      rot: [0, 0, P2], seg: 12, shade: 1.55, fibreFerrule: 1 });
    if (key === "leased") {
      /* The provider's own equipment beside it, in a locked enclosure. What
         separates this from the one above it is not physical, and the only
         honest way to draw that is the box somebody else holds the key to. */
      out.push({ shape: "rbox", size: [0.5, 1.2, 1.0], pos: [w[0] - 0.2, w[1] - 0.75, w[2] + 1.2],
        r: 0.04, shade: 0.9 });
      out.push({ shape: "cyl", size: [0.12, 0.2], pos: [w[0] + 0.1, w[1] - 0.75, w[2] + 1.2],
        rot: [0, 0, P2], seg: 10, shade: 1.4, lock: 1 });
    }
  } else if (key === "fixedwireless" || key === "satellite") {
    /* A dish on the gable and one cable down. Which way it points is the
       whole question and it is a direction rather than a label. */
    var up = key === "satellite" ? 1.0 : 0.12;
    out.push({ shape: "cyl", size: [0.6, 0.22], pos: [HOME[0] + 1.5, 3.5, -0.9],
      rot: [P2 - up, 0.5, 0], seg: 24, shade: 1.0, dish: 1 });
    out.push({ shape: "cyl", size: [0.08, 0.5], pos: [HOME[0] + 1.65, 3.5 + up * 0.35, -0.7],
      rot: [P2 - up, 0.5, 0], seg: 8, shade: 0.7 });
    out.push({ shape: "box", size: [0.1, 2.2, 0.1], pos: [HOME[0] + 1.5, 2.4, -0.9], shade: 0.65 });
  } else {
    /* Cellular: nothing on the wall at all. A router inside with two
       antennas, and that is the entire installation. */
    out.push({ shape: "rbox", size: [0.9, 0.3, 0.6], pos: [HOME[0], 2.9, 0], r: 0.05, shade: 1.0 });
    [-0.3, 0.3].forEach(function (dz) {
      out.push({ shape: "cyl", size: [0.07, 1.1], pos: [HOME[0] + 0.35, 3.5, dz],
        rot: [0, 0, dz > 0 ? -0.35 : 0.35], seg: 8, shade: 1.0, antenna: 1 });
    });
  }
  return out;
}

/* What is at the other end, and the path to it. */
function farEnd(key) {
  var out = [], i;
  if (key === "cable") {
    /* A cabinet at the end of the street, with the neighbours joined to the
       same run before it gets there. */
    out.push({ shape: "rbox", size: [1.1, 2.0, 0.9], pos: [2.2, 1.0, 1.9], r: 0.05, shade: 1.0 });
    out.push(box([10.4, 0.12, 0.12], [-3.4, 1.05, 1.9], 0.8, 0.04));
    for (i = 0; i < 5; i++) {
      out.push(box([0.12, 0.12, 1.7], [-5.6 + i * 2.6, 1.05, 2.75], 0.8, 0.04));
    }
    out.push(box([0.12, 1.0, 0.12], [-6.9, 0.55, 1.9], 0.8, 0.04));
  } else if (key === "dsl" || key === "dialup") {
    /* Poles up the street and an exchange a long way off, drawn small
       because it is a long way off. */
    for (i = 0; i < 6; i++) {
      var px = -5.6 + i * 2.3;
      out.push({ shape: "cyl", size: [0.11, 3.6], pos: [px, 1.8, -1.4], seg: 8, shade: 0.85 });
      out.push(box([0.9, 0.1, 0.1], [px, 3.4, -1.4], 0.85, 0.03));
      if (i) out.push(box([2.3, 0.06, 0.06], [px - 1.15, 3.3, -1.4], 1.0, 0.02));
    }
    out.push({ shape: "rbox", size: [1.6, 1.2, 1.2], pos: [9.4, 0.6, -1.4], r: 0.04, shade: 1.0 });
  } else if (key === "fibre" || key === "leased") {
    /* Straight to the provider's equipment with nothing tapped into it. */
    out.push(box([13.0, 0.12, 0.12], [1.2, 0.9, 0.7], 1.0, 0.04));
    out.push({ shape: "rbox", size: [1.4, 2.2, 1.1], pos: [8.4, 1.1, 0.7], r: 0.05, shade: 1.0 });
    if (key === "leased") {
      /* A second path to the same place, because that is what a guarantee is
         made of. */
      out.push(box([13.0, 0.12, 0.12], [1.2, 0.5, -0.6], 0.78, 0.04));
    }
  } else if (key === "fixedwireless") {
    /* A mast on a hill, in plain view, with a tree in between that is not
       quite in the way yet. */
    out.push({ shape: "cyl", size: [2.6, 0.7], pos: [9.6, 0.3, -2.0], seg: 24, shade: 0.72 });
    out.push({ shape: "cyl", size: [0.18, 5.4], pos: [9.6, 3.3, -2.0], seg: 10, shade: 1.0 });
    out.push({ shape: "cyl", size: [0.5, 0.2], pos: [9.2, 5.4, -2.0], rot: [P2 - 0.1, -0.5, 0],
      seg: 20, shade: 1.0, mastDish: 1 });
    out.push({ shape: "cyl", size: [0.16, 1.6], pos: [2.2, 0.8, -2.6], seg: 8, shade: 0.7 });
    out.push({ shape: "sphere", size: [1.0], pos: [2.2, 2.2, -2.6], seg: 14, shade: 0.62 });
  } else if (key === "satellite") {
    /* Straight up, and a very long way. Drawn as a small craft high above
       the board with nothing on the ground between here and there. */
    out.push({ shape: "rbox", size: [0.9, 0.5, 0.7], pos: [-2.0, 7.6, -2.0], r: 0.05, shade: 1.0 });
    [-1.1, 1.1].forEach(function (dx) {
      out.push(box([1.4, 0.06, 0.6], [-2.0 + dx, 7.6, -2.0], 0.8, 0.02));
    });
    for (i = 0; i < 6; i++) {
      out.push(box([0.1, 0.5, 0.1], [-7.4 + i * 0.95, 4.4 + i * 0.55, -1.2], 0.85, 0.03));
    }
  } else {
    /* A mast serving everybody in range, with other people's handsets on it
       as well as the customer's. */
    out.push({ shape: "cyl", size: [0.24, 6.4], pos: [6.6, 3.2, -1.8], seg: 10, shade: 1.0 });
    [0, 1, 2].forEach(function (k) {
      var a = k * 2.09;
      out.push(box([0.7, 1.1, 0.2], [6.6 + Math.cos(a) * 0.6, 5.6, -1.8 + Math.sin(a) * 0.6],
        1.0, 0.03));
    });
    for (i = 0; i < 5; i++) {
      out.push({ shape: "box", size: [0.3, 0.55, 0.07], pos: [-1.4 + i * 1.9, 0.4, 3.4], r: 0.03,
        shade: 0.8 });
    }
    [3.0, 5.2, 7.4].forEach(function (rad, k) {
      out.push({ shape: "torus", size: [rad, 0.07], pos: [6.6, 0.3, -1.8], rot: [P2, 0, 0],
        seg: 44, shade: 1.25 - k * 0.16 });
    });
  }
  return out;
}

/* ---------------------------------------------------------------------
   THE SCOPE HALF.

   The boundary is the same every time. What fits inside it is not.
   --------------------------------------------------------------------- */
/* A DIAMETER, not a radius: the scene engine takes size[0] on a torus and a
   cylinder as the across-the-middle measurement. Passed as a radius the ring
   came out half the size it was meant to be and the desk it is supposed to
   contain was wider than it — which, on the one model whose entire premise
   is "judge the scale by what fits inside", was the worst possible place to
   be out by a factor of two. */
const RING_D = 15;

function boundary() {
  return [
    { shape: "torus", size: [RING_D, 0.16], pos: [0, 0.3, 0], rot: [P2, 0, 0], seg: 72, shade: 1.0 },
    { shape: "torus", size: [RING_D - 0.9, 0.06], pos: [0, 0.3, 0], rot: [P2, 0, 0], seg: 72,
      shade: 0.7 }
  ];
}

/* Everything that lives inside the boundary, at the scale that puts it
   there. One desk, one floor, several buildings, a town, two towns, or a
   rack — and the reference objects shrink accordingly, which is the whole
   of the reading. */
function inside(key) {
  var out = [], i, j;
  if (key === "pan") {
    /* A desk, a chair and one person's things. Enormous, because the
       boundary is tiny. */
    out.push({ shape: "rbox", size: [6.4, 0.4, 3.2], pos: [0, 1.6, 0], r: 0.08, shade: 1.0 });
    [-2.6, 2.6].forEach(function (dx) {
      [-1.2, 1.2].forEach(function (dz) {
        out.push({ shape: "box", size: [0.3, 1.4, 0.3], pos: [dx, 0.7, dz], shade: 0.8 });
      });
    });
    out.push({ shape: "box", size: [2.4, 1.5, 0.16], pos: [-1.0, 2.55, -1.0], r: 0.04, shade: 0.86 });
    out.push({ shape: "box", size: [1.9, 0.1, 0.7], pos: [-1.0, 1.85, 0.2], r: 0.03, shade: 0.86 });
    out.push({ shape: "box", size: [0.6, 0.06, 1.1], pos: [1.6, 1.83, 0.1], r: 0.06, shade: 1.3 });
    out.push({ shape: "cyl", size: [0.5, 0.5], pos: [2.9, 2.05, -0.8], seg: 20, shade: 1.3 });
    out.push({ shape: "rbox", size: [1.4, 2.2, 1.4], pos: [0, 1.4, 4.0], r: 0.25, shade: 0.7 });
  } else if (key === "lan" || key === "wlan") {
    /* One building's floor, filling the boundary: rooms, desks, a cupboard. */
    out.push({ shape: "box", size: [11.0, 0.14, 7.4], pos: [0, 0.12, 0], r: 0.04, shade: 0.66 });
    [[-5.5, 0, 0.3, 7.4], [5.5, 0, 0.3, 7.4], [0, -3.7, 11.0, 0.3], [0, 3.7, 11.0, 0.3],
     [-1.8, -1.6, 0.3, 4.2], [2.6, 1.4, 0.3, 4.6]].forEach(function (w) {
      out.push({ shape: "box", size: [w[2], 1.0, w[3]], pos: [w[0], 0.5, w[1]], r: 0.02, shade: 1.0 });
    });
    for (i = 0; i < 8; i++) {
      out.push({ shape: "rbox", size: [1.2, 0.3, 0.8], pos: [-4.4 + (i % 4) * 1.5, 0.28,
        -2.6 + Math.floor(i / 4) * 1.6], r: 0.04, shade: 0.84 });
    }
    if (key === "wlan") {
      [[-3.0, -0.4], [2.8, 1.4]].forEach(function (a) {
        out.push({ shape: "cyl", size: [0.45, 0.16], pos: [a[0], 1.1, a[1]], seg: 18, shade: 1.4 });
        [2.4, 4.0].forEach(function (rad, k) {
          out.push({ shape: "torus", size: [rad, 0.07], pos: [a[0], 0.9, a[1]], rot: [P2, 0, 0],
            seg: 40, shade: 1.35 - k * 0.2 });
        });
      });
    } else {
      /* The cabling that IS this one, run back to a cupboard in the middle. */
      out.push({ shape: "rbox", size: [1.0, 1.6, 1.0], pos: [0.4, 0.8, 2.6], r: 0.04, shade: 1.3 });
      for (i = 0; i < 8; i++) {
        var dx = -4.4 + (i % 4) * 1.5, dz = -2.6 + Math.floor(i / 4) * 1.6;
        out.push({ shape: "box", size: [Math.abs(0.4 - dx), 0.08, 0.08], pos: [(0.4 + dx) / 2, 0.2, dz],
          r: 0.03, shade: 1.15 });
      }
    }
  } else if (key === "san") {
    /* One room, and only equipment in it. No desks and no people, which is
       what a student should notice first. */
    out.push({ shape: "box", size: [8.0, 0.14, 5.4], pos: [0, 0.12, 0], r: 0.04, shade: 0.66 });
    [[-4.0, 0, 0.3, 5.4], [4.0, 0, 0.3, 5.4], [0, -2.7, 8.0, 0.3], [0, 2.7, 8.0, 0.3]]
      .forEach(function (w) {
        out.push({ shape: "box", size: [w[2], 1.2, w[3]], pos: [w[0], 0.6, w[1]], r: 0.02, shade: 1.0 });
      });
    for (i = 0; i < 3; i++) {
      out.push({ shape: "rbox", size: [1.5, 2.6, 2.0], pos: [-2.4 + i * 2.4, 1.3, -0.6], r: 0.04,
        shade: 1.15 });
      for (j = 0; j < 5; j++) {
        out.push({ shape: "box", size: [1.2, 0.26, 0.1], pos: [-2.4 + i * 2.4, 0.5 + j * 0.44, 0.45],
          r: 0.02, shade: 0.72 });
      }
    }
    out.push({ shape: "box", size: [5.6, 0.1, 0.1], pos: [0, 2.75, -0.6], r: 0.03, shade: 1.4 });
  } else if (key === "can") {
    /* Several buildings and the ground between them, all of it one owner's. */
    [[-4.2, -2.2, 3.0, 2.4], [1.4, -2.6, 2.6, 2.0], [-3.0, 2.4, 2.4, 2.2], [2.8, 2.0, 3.2, 2.6]]
      .forEach(function (bldg) {
        out.push({ shape: "rbox", size: [bldg[2], 1.5, bldg[3]], pos: [bldg[0], 0.75, bldg[1]],
          r: 0.05, shade: 1.0 });
        out.push({ shape: "box", size: [bldg[2] * 0.7, 0.4, bldg[3] * 0.7],
          pos: [bldg[0], 1.65, bldg[1]], r: 0.06, shade: 0.86 });
      });
    /* a car park and a path, so the ground between reads as owned */
    out.push({ shape: "box", size: [4.0, 0.1, 1.6], pos: [-0.4, 0.06, 0.0], r: 0.03, shade: 0.6 });
    for (i = 0; i < 6; i++) {
      out.push({ shape: "box", size: [0.5, 0.22, 1.0], pos: [-2.0 + i * 0.7, 0.16, 0.0], r: 0.04,
        shade: 0.74 });
    }
    /* and the ducts joining them, which are the point */
    [[-4.2, -2.2, 1.4, -2.6], [1.4, -2.6, -3.0, 2.4], [-3.0, 2.4, 2.8, 2.0]].forEach(function (l) {
      var dx = l[2] - l[0], dz = l[3] - l[1];
      out.push({ shape: "box", size: [Math.hypot(dx, dz), 0.1, 0.16],
        pos: [(l[0] + l[2]) / 2, 0.1, (l[1] + l[3]) / 2], rot: [0, -Math.atan2(dz, dx), 0],
        r: 0.04, shade: 1.35 });
    });
  } else if (key === "man") {
    /* A town: a lot of buildings, streets, and three of them that belong to
       one organisation. Everything is small, and that IS the reading. */
    out.push({ shape: "box", size: [11.5, 0.1, 0.5], pos: [0, 0.06, -2.2], r: 0.02, shade: 0.6 });
    out.push({ shape: "box", size: [11.5, 0.1, 0.5], pos: [0, 0.06, 2.2], r: 0.02, shade: 0.6 });
    out.push({ shape: "box", size: [0.5, 0.1, 9.6], pos: [-2.6, 0.06, 0], r: 0.02, shade: 0.6 });
    out.push({ shape: "box", size: [0.5, 0.1, 9.6], pos: [3.4, 0.06, 0], r: 0.02, shade: 0.6 });
    var ours = [[-4.4, -4.2], [1.0, 1.4], [4.8, 4.2]];
    for (i = 0; i < 44; i++) {
      var bx = -5.5 + (i % 11) * 1.1, bz = -4.2 + Math.floor(i / 11) * 2.8;
      var mine = ours.some(function (o) { return Math.abs(o[0] - bx) < 0.7 && Math.abs(o[1] - bz) < 0.7; });
      out.push({ shape: "rbox", size: [0.72, mine ? 1.1 : 0.6, 0.72], pos: [bx, (mine ? 0.55 : 0.3), bz],
        r: 0.03, shade: mine ? 1.4 : 0.66 });
    }
    ours.forEach(function (o, k) {
      var q = ours[(k + 1) % ours.length];
      var dx = q[0] - o[0], dz = q[1] - o[1];
      out.push({ shape: "box", size: [Math.hypot(dx, dz), 0.08, 0.12],
        pos: [(o[0] + q[0]) / 2, 1.25, (o[1] + q[1]) / 2], rot: [0, -Math.atan2(dz, dx), 0],
        r: 0.03, shade: 1.2 });
    });
  } else {
    /* WAN: two towns, and a great deal of nothing between them — and the
       boundary is not big enough to hold either of them properly. */
    [[-4.4, -2.0], [4.2, 2.2]].forEach(function (t) {
      for (i = 0; i < 16; i++) {
        out.push({ shape: "rbox", size: [0.34, 0.34, 0.34],
          pos: [t[0] - 0.7 + (i % 4) * 0.48, 0.18, t[1] - 0.7 + Math.floor(i / 4) * 0.48],
          r: 0.02, shade: i === 5 ? 1.5 : 0.68 });
      }
    });
    /* the ocean or the moor or whatever it is: nothing at all, and one path
       across it that belongs to somebody else */
    out.push({ shape: "box", size: [9.4, 0.07, 0.14], pos: [-0.1, 0.5, 0.1],
      rot: [0, -Math.atan2(4.2, 8.6), 0], r: 0.03, shade: 1.2 });
    for (i = 0; i < 5; i++) {
      out.push({ shape: "cyl", size: [0.16, 0.9], pos: [-3.6 + i * 1.9, 0.45, -1.2 + i * 0.9],
        seg: 8, shade: 0.9 });
    }
    out.push({ shape: "box", size: [11.0, 0.06, 0.5], pos: [0, 0.04, 4.8], r: 0.02, shade: 0.5 });
  }
  return out;
}

/* ---------------------------------------------------------------------
   The model.
   --------------------------------------------------------------------- */
export function linkPlanModel(D) {
  var it = D.item;

  if (it.kind === "service") {
    var shareNote = { street: "Other premises on this run, joined to it before it gets " +
        "anywhere, and the plan draws the joins. Count them — what happens to this connection at " +
        "seven in the evening depends on them and on nothing you can configure.",
      provider: "One or two others, joining at the provider's equipment rather than in the " +
        "street. That is a different arrangement from sharing a segment and it behaves " +
        "differently at peak time.",
      none: "Nothing else joins this path anywhere on the plan. Whatever the ceiling on this one " +
        "turns out to be, it is not other people.",
      air: "There are other premises along the street and not one of them is joined to this by " +
        "anything at all. Whatever this shares, it does not share a cable — so if you want to " +
        "know who else is on it, look at the far end rather than at the neighbours." }[it.shared];

    return {
      kind: "drill",
      title: "One building, and what reaches it",
      caption: "The same street every time: the customer's building on the left, the road running " +
        "away to the right. Two things change. What arrives at the building — look at the wall, " +
        "and notice when there is nothing on it — and what is at the far end of the path, which " +
        "may be up the street, over a hill, or a very long way up. Count anything else joined to " +
        "the same run while you are there.",
      board: { size: [GROUND_W, 0.4, GROUND_D], pos: [0, -0.2, 0], color: "#38424a",
        build: [{ shape: "rbox", size: [GROUND_W, 0.4, GROUND_D], pos: [0, 0, 0], r: 0.14, shade: 1.0 }],
        scale: 1 },
      parts: [
        { key: "premises", label: "The building, and its neighbours", build: street(it.shared),
          finish: "matte", scale: 1, pos: [0, 0, 0], color: "#8d969d",
          spec: it.shared === "none" ? "One building, on its own"
            : (it.shared === "provider" ? "The customer's building and two others"
              : "The customer's building and five others"),
          note: shareNote },
        { key: "arrives", label: "What arrives at the wall", build: arrival(it.key),
          finish: "matte", scale: 1, pos: [0, 0, 0], color: "#c8a24a",
          spec: "Whatever is on the outside of the building",
          note: "Threads and a solid centre, a pair of wires into a small flat socket, a hinged " +
            "cover with glass behind it, a dish, or nothing on the wall whatsoever. Establish " +
            "this before anything else — it takes four seconds and removes most of the list." },
        { key: "path", label: "Where it goes, and what is at the end",
          build: farEnd(it.key), finish: "matte", scale: 1, pos: [0, 0, 0], color: "#3e7a5c",
          spec: "The run, and whatever it terminates on",
          note: "Follow it. A cabinet at the end of the street, poles going out of sight, a mast " +
            "on a hill you can see from the door, a craft a long way above the board, or a tower " +
            "with everybody in range hanging off it. Where the far end IS decides what the " +
            "ceiling is." }
      ],
      _mode: "service",
      camera: { dist: 22, yaw: 0.34, pitch: 0.5, target: [0, 1.4, 0], min: 8, max: 46 }
    };
  }

  return {
    kind: "drill",
    title: "One boundary, and what fits inside it",
    caption: "The boundary is exactly the same size every time. What is drawn inside it is not — " +
      "and that is the whole of the reading. If a desk fills it, this reaches across a desk. If a " +
      "town fits inside it with room to spare, it does not. Look at what is inside, then at " +
      "whether the ground between the pieces looks like something one organisation could own.",
    board: { size: [PLAN_W, 0.4, PLAN_W], pos: [0, -0.2, 0], color: "#38424a",
      build: [{ shape: "rbox", size: [PLAN_W, 0.4, PLAN_W], pos: [0, 0, 0], r: 0.14, shade: 1.0 }],
      scale: 1 },
    parts: [
      { key: "extent", label: "The boundary", build: boundary(), finish: "matte", scale: 1,
        pos: [0, 0, 0], color: "#c8a24a",
        spec: "Drawn the same size on every item in this half",
        note: "It never changes. Whatever the network reaches, the ring round it is this ring — " +
          "so the ring tells you nothing and everything inside it tells you everything. Judge " +
          "the scale by what has been drawn to fit." },
      { key: "contents", label: "What is inside it", build: inside(it.key), finish: "matte",
        scale: 1, pos: [0, 0, 0], color: "#7d97b5",
        spec: "Drawn to the same scale as each other, whatever that scale is",
        note: "Furniture, rooms, buildings, streets, or racks. Count what you can recognise and " +
          "ask how big the real thing would be — a chair is about half a metre and a house is " +
          "about eight, and everything else follows from that." }
    ],
    _mode: "scope",
    camera: { dist: 22, yaw: 0.18, pitch: 0.88, target: [0, 0.4, 0], min: 8, max: 46 }
  };
}
