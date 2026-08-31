/* =====================================================================
   Field Service Center — the bench for objective 2.8

   The tool, drawn as the thing it is, on the thing it works on.

   The parts are chosen to answer the three questions that are not "what is
   it called":

     - THE WORKING END. A shaped die that closes round a plug, a single
       blade that pushes a wire into a slot, a screen, a speaker, a
       threaded adaptor for a ferrule, an eye on the end of a tape. It is
       drawn as its own part in its own colour, because it is the part a
       technician actually looks at.
     - WHAT IT IS ON. A plug being made up, a bundle of identical cables, a
       panel being terminated, a link with traffic on it, or a port on its
       own. The subject says as much about the tool as the tool does.
     - THE FAR END, when there is one. A second unit down the run, a light
       source, or nothing at all — and for one item in the pool the tool IS
       the far end, which is drawn as a plug with no cable on it whatsoever.

   The whole point of the second cue being SHAPE rather than colour holds
   here too: a blade and a die are both "the working end" and both the same
   material, and what separates them is that one is a wedge and one is a
   pair of jaws.

   NOTHING IS LABELLED. No brand, no model, no reading written in geometry.
   ===================================================================== */

const P2 = Math.PI / 2;

const BOARD = { w: 15, d: 8.4 };

function box(size, pos, shade, r) {
  return { shape: "box", size: size, pos: pos, shade: shade, r: r };
}
function cyl(d, len, pos, rot, seg, shade) {
  return { shape: "cyl", size: [d, len], pos: pos, rot: rot, seg: seg || 14, shade: shade };
}

/* A length of cable, dressed flat on the bench. */
function run(x0, x1, z, shade) {
  return box([Math.abs(x1 - x0), 0.22, 0.22], [(x0 + x1) / 2, 0.11, z], shade, 0.08);
}

/* A modular plug on the end of a cable. */
function plug(x, z, shade) {
  return [
    box([0.7, 0.42, 0.5], [x, 0.21, z], shade, 0.04),
    box([0.24, 0.26, 0.4], [x + 0.1, 0.5, z], shade * 0.8, 0.03)
  ];
}

/* ---------------------------------------------------------------------
   The tool bodies. Five shapes, and the shape is the first reading.
   --------------------------------------------------------------------- */
function body(it) {
  var f = it.form, out = [];
  if (f === "handheld") {
    out.push({ shape: "rbox", size: [2.0, 0.7, 3.4], pos: [-2.6, 0.5, 0], r: 0.12, shade: 1.0 });
    out.push({ shape: "rbox", size: [0.5, 0.34, 0.5], pos: [-2.6, 0.06, -1.9], r: 0.1, shade: 0.8 });
  } else if (f === "twopiece") {
    /* Two pieces that are NOT joined, which is the whole reading. */
    out.push({ shape: "rbox", size: [1.5, 0.6, 2.0], pos: [-4.3, 0.42, -1.2], r: 0.1, shade: 1.0 });
    out.push({ shape: "rbox", size: [0.9, 0.6, 3.6], pos: [-1.3, 0.42, 1.0], r: 0.24, shade: 1.0 });
  } else if (f === "hand") {
    /* Two handles, hinged, lying open on the bench. */
    [-0.42, 0.42].forEach(function (dz, k) {
      out.push({ shape: "rbox", size: [3.0, 0.4, 0.55],
        pos: [-3.0 + k * 0.1, 0.3, dz * 2.0], rot: [0, dz > 0 ? -0.12 : 0.12, 0], r: 0.14,
        shade: 1.0 });
    });
    out.push(cyl(0.34, 1.4, [-1.5, 0.32, 0], [P2, 0, 0], 12, 0.78));
  } else if (f === "small") {
    /* A centimetre of plastic, drawn large enough to see and no larger. */
    out.push({ shape: "rbox", size: [0.9, 0.62, 0.72], pos: [-1.0, 0.42, 0], r: 0.06, shade: 1.0 });
  } else if (f === "inline") {
    out.push({ shape: "rbox", size: [2.0, 0.7, 1.4], pos: [0, 0.46, 0], r: 0.1, shade: 1.0 });
  } else if (f === "reel") {
    /* A reel on its side with the tape wound on it. */
    out.push(cyl(3.4, 0.5, [-2.8, 1.75, 0], [P2, 0, 0], 30, 1.0));
    out.push(cyl(1.2, 0.7, [-2.8, 1.75, 0], [P2, 0, 0], 20, 0.8));
    out.push(box([0.4, 0.3, 0.9], [-1.1, 1.75, 0], 0.8, 0.06));
  } else {
    /* A screen, propped up so it can be read from the front. */
    out.push({ shape: "rbox", size: [4.2, 2.8, 0.3], pos: [-2.0, 1.55, -1.0], r: 0.08, shade: 1.0 });
    out.push(box([4.2, 0.3, 1.6], [-2.0, 0.15, -0.1], 0.82, 0.04));
    out.push(box([0.5, 1.2, 0.7], [-2.0, 0.6, -1.35], 0.82, 0.05));
  }
  return out;
}

/* ---------------------------------------------------------------------
   The working end. This is the part that answers the question.
   --------------------------------------------------------------------- */
function workingEnd(it) {
  var out = [], i;
  switch (it.key) {
    case "wiremap":
      /* A row of numbered lamps, and a jack to plug the run into. */
      out.push(box([1.9, 0.08, 0.5], [-2.6, 0.87, 0.4], 0.35, 0.02));
      for (i = 0; i < 8; i++) {
        out.push(cyl(0.36, 0.3, [-3.4 + i * 0.22, 0.98, 0.4], [0, 0, 0], 12, i < 5 ? 1.5 : 0.85));
      }
      out.push(box([0.5, 0.34, 0.24], [-2.6, 0.5, 1.72], 0.45, 0.02));
      break;
    case "certifier":
      /* A screen with rows on it, and a threaded adaptor. */
      out.push(box([1.7, 0.16, 2.3], [-2.6, 0.92, 0.1], 1.5, 0.02));
      for (i = 0; i < 5; i++) out.push(box([1.3, 0.06, 0.16], [-2.6, 1.01, -0.72 + i * 0.36], 0.4, 0.01));
      out.push(cyl(0.6, 0.5, [-2.6, 0.62, 1.85], [P2, 0, 0], 16, 0.7));
      out.push(box([0.44, 0.3, 0.2], [-2.6, 0.62, 2.0], 0.4, 0.02));
      break;
    case "toner":
      /* Two clips on one piece, and a speaker in the other. There is no
         cable between them and there never is. */
      [-0.35, 0.35].forEach(function (dz) {
        out.push(cyl(0.2, 1.3, [-3.7, 0.5, -1.2 + dz], [0, 0, P2], 8, 0.6));
        out.push(box([0.5, 0.2, 0.24], [-3.15, 0.5, -1.2 + dz], 1.4, 0.03));
      });
      out.push(cyl(0.75, 0.16, [-1.3, 0.74, 1.9], [0, 0, 0], 20, 0.5));
      for (i = 0; i < 5; i++) out.push(cyl(0.12, 0.08, [-1.5 + i * 0.1, 0.8, 1.9], [0, 0, 0], 6, 1.4));
      /* the probe tip: a spike, and nothing else in the pool is a spike */
      out.push({ shape: "cone", size: [0.34, 1.1, 0.03], pos: [-1.3, 0.42, -1.4], rot: [-P2, 0, 0],
        seg: 14, shade: 1.5 });
      break;
    case "punchdown":
      /* One blade: a wedge with a slot down the middle. */
      out.push(box([0.9, 0.5, 0.34], [0.2, 0.34, 0], 0.6, 0.02));
      out.push({ shape: "box", size: [0.5, 0.62, 0.12], pos: [0.75, 0.34, 0], r: 0.01, shade: 1.5,
        blade: 1 });
      out.push(box([0.5, 0.14, 0.06], [0.78, 0.34, 0], 0.3, 0.01));
      break;
    case "crimper":
      /* A die: two shaped jaws that close around a plug, drawn open. */
      out.push({ shape: "box", size: [1.0, 0.26, 0.62], pos: [0.1, 0.66, 0], r: 0.03, shade: 1.5,
        die: 1 });
      out.push({ shape: "box", size: [1.0, 0.26, 0.62], pos: [0.1, 0.06, 0], r: 0.03, shade: 1.5,
        die: 1 });
      for (i = 0; i < 8; i++) {
        out.push(box([0.08, 0.2, 0.06], [-0.25 + i * 0.1, 0.5, 0], 0.5, 0.01));
      }
      break;
    case "strippers":
      /* A ring that goes round the cable, with an adjustable blade in it. */
      out.push({ shape: "torus", size: [1.5, 0.28], pos: [0.4, 0.95, 0], rot: [0, 0, P2], seg: 24,
        shade: 1.0 });
      out.push({ shape: "box", size: [0.12, 0.34, 0.14], pos: [0.4, 0.63, 0], r: 0.01, shade: 1.5,
        blade: 1 });
      out.push(cyl(0.34, 0.5, [0.4, 1.55, 0], [0, 0, P2], 10, 0.7));
      break;
    case "snips":
      /* Two curved jaws that meet. */
      [-1, 1].forEach(function (sz) {
        out.push({ shape: "box", size: [1.3, 0.2, 0.3], pos: [0.2, 0.42 + sz * 0.14, sz * 0.12],
          rot: [0, sz * 0.16, 0], r: 0.09, shade: 1.5, blade: 1 });
      });
      break;
    case "loopback":
      /* The whole point: a plug, and no cable behind it. */
      out.push(box([0.34, 0.3, 0.42], [-0.5, 0.42, 0], 0.5, 0.02));
      out.push({ shape: "torus", size: [0.5, 0.1], pos: [-1.0, 0.42, 0], rot: [0, 0, P2], seg: 18,
        shade: 1.4, loop: 1 });
      break;
    case "tap":
      /* Two ports in line and a third that only ever sends. */
      out.push(box([0.24, 0.34, 0.4], [-1.05, 0.46, 0], 0.5, 0.02));
      out.push(box([0.24, 0.34, 0.4], [1.05, 0.46, 0], 0.5, 0.02));
      out.push(box([0.34, 0.3, 0.34], [0, 0.46, 0.75], 1.5, 0.02));
      out.push(cyl(0.18, 0.08, [-0.5, 0.83, 0], [0, 0, 0], 8, 1.4));
      out.push(cyl(0.18, 0.08, [0.5, 0.83, 0], [0, 0, 0], 8, 1.4));
      break;
    case "analyser":
      /* Rows of frames, and a filter box at the top. */
      out.push(box([3.6, 0.36, 0.1], [-2.0, 2.6, -0.82], 1.5, 0.02));
      for (i = 0; i < 9; i++) {
        out.push(box([3.4, 0.16, 0.08], [-2.0, 2.2 - i * 0.24, -0.82],
          i === 3 ? 1.55 : 0.5, 0.01));
      }
      break;
    case "wifianalyser":
      /* Bars across a band. Nothing else in the pool is a bar chart. */
      [0.5, 1.4, 0.9, 2.1, 0.7, 1.7, 1.1].forEach(function (h, k) {
        out.push(box([0.38, h, 0.1], [-3.6 + k * 0.55, 0.55 + h / 2, -0.82], 1.5, 0.02));
      });
      out.push(box([4.0, 0.08, 0.1], [-2.0, 0.53, -0.82], 0.5, 0.01));
      break;
    case "opticalmeter":
      /* One large figure's worth of screen, and a threaded mount for a
         ferrule rather than a jack for a plug. */
      out.push(box([1.5, 0.16, 1.1], [-2.6, 0.92, -0.4], 1.5, 0.02));
      out.push(box([1.05, 0.06, 0.34], [-2.6, 1.02, -0.4], 0.4, 0.01));
      out.push(cyl(0.7, 0.6, [-2.6, 0.66, 1.9], [P2, 0, 0], 16, 0.62));
      out.push({ shape: "torus", size: [0.66, 0.09], pos: [-2.6, 0.66, 2.0], rot: [P2, 0, 0],
        seg: 16, shade: 0.4, repeat: { count: 3, step: [0, 0, 0.12] } });
      out.push(cyl(0.22, 0.5, [-2.6, 0.66, 2.3], [P2, 0, 0], 12, 1.5, 0));
      break;
    case "fishtape":
      /* An eye on the end of the tape, and the tape itself. */
      out.push(box([5.0, 0.1, 0.14], [1.4, 0.5, 0], 1.0, 0.04));
      out.push({ shape: "torus", size: [0.62, 0.12], pos: [4.0, 0.5, 0], rot: [P2, 0, 0], seg: 18,
        shade: 1.5, eye: 1 });
      break;
    case "multimeter":
      /* A dial with a pointer on it, and two sockets for the leads. Nothing
         else in the pool has a dial, and a dial means it measures one thing
         at a time on whichever range you turned it to. */
      out.push(cyl(1.5, 0.14, [-2.6, 0.9, -0.5], [0, 0, 0], 24, 0.45));
      out.push(box([0.14, 0.1, 0.55], [-2.6, 0.99, -0.75], 1.5, 0.02));
      for (i = 0; i < 8; i++) {
        var a = i * (Math.PI / 4);
        out.push(box([0.1, 0.08, 0.16], [-2.6 + Math.sin(a) * 0.95, 0.92, -0.5 - Math.cos(a) * 0.95],
          1.3, 0.01));
      }
      out.push(box([1.5, 0.06, 0.7], [-2.6, 0.89, 1.0], 1.5, 0.02));
      [-0.4, 0.4].forEach(function (dx) {
        out.push(cyl(0.34, 0.2, [-2.6 + dx, 0.82, 1.62], [0, 0, 0], 12, 0.35));
      });
      break;
    case "compression":
      /* A cradle at one end and a plunger at the other. No display anywhere,
         which is itself the answer to two of the questions. */
      out.push(box([1.1, 0.5, 0.9], [-2.2, 0.7, -0.4], 1.2, 0.06));
      out.push(cyl(0.5, 0.9, [-2.2, 0.7, 0.5], [P2, 0, 0], 14, 0.55));
      out.push(cyl(0.26, 1.4, [-2.2, 0.7, 1.4], [P2, 0, 0], 12, 1.5));
      out.push(box([0.35, 0.3, 1.6], [-2.2, 0.28, 0.1], 0.9, 0.05));
      break;
    case "vfl":
      /* Pen-sized, with a threaded adapter at the tip and nothing to read. */
      out.push(cyl(0.42, 2.6, [-2.6, 0.66, 0.2], [P2, 0, 0], 16, 1.15));
      out.push(cyl(0.3, 0.5, [-2.6, 0.66, 1.7], [P2, 0, 0], 14, 0.6));
      out.push({ shape: "torus", size: [0.32, 0.06], pos: [-2.6, 0.66, 1.8], rot: [P2, 0, 0],
        seg: 14, shade: 0.9, repeat: { count: 3, step: [0, 0, 0.1] } });
      out.push(cyl(0.12, 0.4, [-2.6, 0.66, 2.05], [P2, 0, 0], 10, 1.6));
      out.push(box([0.22, 0.16, 0.3], [-2.35, 0.9, -0.5], 1.5, 0.02));
      break;
    case "spectrum":
      /* A screen with a stubby antenna rather than a network port — the two
         things that separate it from the Wi-Fi analyser beside it. */
      out.push(box([1.7, 0.18, 1.2], [-2.6, 0.92, -0.4], 1.5, 0.02));
      out.push(box([1.35, 0.06, 0.9], [-2.6, 1.02, -0.4], 0.4, 0.01));
      /* the trace, drawn as rising bars so the screen reads as a spectrum */
      [0.32, 0.55, 0.2, 0.72, 0.28, 0.44].forEach(function (h, i) {
        out.push(box([0.12, 0.03, h], [-3.1 + i * 0.2, 1.06, -0.62 + h / 2], 1.1, 0.01));
      });
      out.push(cyl(0.16, 1.5, [-3.25, 1.6, -0.4], [0, 0, 0.18], 12, 0.7));
      out.push(cyl(0.24, 0.2, [-3.25, 0.95, -0.4], [0, 0, 0], 12, 0.55));
      break;
    default:
      /* Deliberately empty. An unhandled tool reaches the page with no
         working end at all, which the geometry check rejects — far better
         than quietly inheriting the previous case's. */
      break;
  }
  return out;
}

/* ---------------------------------------------------------------------
   What it is used on.
   --------------------------------------------------------------------- */
function subject(it) {
  var out = [], i;
  if (it.key === "toner") {
    /* A bundle of identical cables, which is the entire reason this tool
       exists. Sixty would not render; twelve makes the point. */
    for (i = 0; i < 12; i++) {
      out.push(run(-0.2, 6.2, -2.2 + (i % 6) * 0.44, i === 4 ? 1.35 : 1.0));
      if (i >= 6) out[out.length - 1].pos[1] = 0.33;
    }
    out.push(box([0.5, 0.9, 2.8], [2.6, 0.5, -1.1], 0.6, 0.04));
  } else if (it.key === "punchdown") {
    /* A panel with a punch block on it and conductors going in. */
    out.push(box([5.4, 1.1, 0.9], [2.6, 0.6, 0], 1.0, 0.03));
    for (i = 0; i < 12; i++) {
      out.push(box([0.28, 0.44, 0.24], [0.4 + i * 0.4, 0.9, 0.42], 0.55, 0.02));
      out.push(box([0.1, 0.1, 0.9], [0.4 + i * 0.4, 0.9, 0.95], 1.4, 0.03));
    }
  } else if (it.key === "crimper" || it.key === "strippers" || it.key === "snips") {
    out.push(run(1.4, 6.4, 0, 1.0));
    if (it.key === "crimper") out = out.concat(plug(1.1, 0, 1.35));
    if (it.key === "strippers") {
      /* the jacket already removed at the end, with the pairs showing */
      for (i = 0; i < 4; i++) {
        out.push(box([1.1, 0.1, 0.1], [1.9, 0.11 + (i % 2) * 0.14, -0.14 + (i > 1 ? 0.28 : 0)],
          1.4, 0.04));
      }
    }
    if (it.key === "snips") out.push(box([0.12, 0.3, 0.3], [1.42, 0.11, 0], 1.5, 0.02));
  } else if (it.key === "loopback") {
    /* One port on a machine, and nothing else at all. */
    out.push(box([2.4, 2.0, 1.6], [1.6, 1.0, 0], 1.0, 0.05));
    out.push(box([0.5, 0.42, 0.3], [0.5, 0.9, 0], 0.5, 0.02));
    out.push(cyl(0.2, 0.1, [0.5, 1.4, 0], [0, 0, P2], 8, 1.3));
  } else if (it.key === "tap" || it.key === "analyser") {
    out.push(run(-6.4, -1.1, 0, 1.0));
    out.push(run(1.1, 6.4, 0, 1.0));
    if (it.key === "tap") out.push(run(0, 0, 0, 1.0));
    if (it.key === "analyser") {
      /* the link it is watching, and a switch at each end of it */
      out.push(box([1.6, 1.0, 1.2], [-6.0, 0.6, 0], 0.8, 0.04));
      out.push(box([1.6, 1.0, 1.2], [6.0, 0.6, 0], 0.8, 0.04));
      out.push(box([0.16, 0.16, 2.4], [1.6, 0.5, -1.2], 1.3, 0.05));
    } else {
      out.push(box([0.16, 0.16, 2.2], [0, 0.5, 1.9], 1.3, 0.05));
      out.push(box([1.4, 0.9, 1.0], [0, 0.5, 3.3], 0.8, 0.04));
    }
  } else if (it.key === "wifianalyser") {
    /* A room with two access points in it and a wall between. */
    out.push(box([5.6, 0.12, 3.8], [3.4, 0.06, 0], 0.66, 0.02));
    out.push(box([0.24, 1.2, 3.8], [3.0, 0.6, 0], 1.0, 0.02));
    [[1.6, -1.1], [5.0, 1.1]].forEach(function (a) {
      out.push(cyl(0.9, 0.2, [a[0], 1.3, a[1]], [0, 0, 0], 18, 1.3));
      out.push(cyl(0.16, 1.1, [a[0], 0.7, a[1]], [0, 0, 0], 8, 0.8));
    });
  } else if (it.key === "opticalmeter") {
    /* Glass, not copper: a run ending in a ferrule. */
    out.push(run(1.0, 6.4, 0, 1.0));
    out.push(cyl(0.34, 0.9, [0.6, 0.11, 0], [0, 0, P2], 12, 1.45));
    out.push(box([0.5, 0.42, 0.42], [1.2, 0.11, 0], 0.7, 0.03));
  } else if (it.key === "fishtape") {
    /* A wall with a conduit through it, which is why the tool exists. */
    out.push(box([1.2, 3.6, 5.0], [4.4, 1.8, 0], 1.0, 0.04));
    out.push(cyl(1.1, 1.6, [4.4, 0.5, 0], [0, 0, P2], 16, 0.5));
    out.push(box([0.22, 0.22, 0.22], [6.4, 0.5, 0], 1.4, 0.06));
  } else if (it.key === "multimeter") {
    out.push(run(1.0, 6.4, 0, 1.0));
    /* two probes, touching two different points */
    [-0.5, 0.5].forEach(function (dz) {
      out.push({ shape: "cone", size: [0.22, 0.9, 0.03], pos: [1.6 - dz * 1.2, 0.5, dz * 0.9],
        rot: [0.6, 0, 0], seg: 10, shade: 1.5 });
      out.push(box([0.24, 0.7, 0.24], [1.6 - dz * 1.2, 1.15, dz * 0.9 - 0.3], 0.7, 0.08));
    });
  } else {
    /* wiremap and certifier: a run going away with a second unit on it */
    out.push(run(-1.4, 5.4, 1.72, 1.0));
  }
  return out;
}

/* ---------------------------------------------------------------------
   The far end, where there is one. Empty for most, and the part is left
   out entirely rather than drawn as a stub — a legend entry for a thing
   that is not there would be a lie about the picture.
   --------------------------------------------------------------------- */
function farEnd(it) {
  var out = [];
  if (it.farEnd === "remote") {
    out.push({ shape: "rbox", size: [1.1, 0.5, 1.8], pos: [6.0, 0.4, 1.72], r: 0.1, shade: 1.0 });
    out.push(box([0.4, 0.26, 0.2], [6.0, 0.4, 0.78], 0.5, 0.02));
    out.push(cyl(0.24, 0.1, [6.0, 0.68, 1.72], [0, 0, 0], 8, 1.4));
  } else if (it.farEnd === "source") {
    out.push({ shape: "rbox", size: [1.1, 0.5, 1.6], pos: [6.4, 0.4, 0], r: 0.1, shade: 1.0 });
    out.push(cyl(0.4, 0.4, [6.4, 0.4, -0.9], [P2, 0, 0], 12, 0.6));
    out.push(cyl(0.24, 0.1, [6.4, 0.68, 0.3], [0, 0, 0], 8, 1.5));
  } else if (it.farEnd === "walk") {
    /* The other piece is in your hand, at the other end of the bundle, and
       nothing joins the two. Drawn as a pair of footprints, because the
       distance between the two pieces IS the tool. */
    for (var i = 0; i < 4; i++) {
      out.push(box([0.5, 0.06, 0.9], [-3.0 + i * 1.4, 0.03, 3.3 + (i % 2) * 0.7], 1.0, 0.1));
    }
  }
  return out;
}

/* ---------------------------------------------------------------------
   The model.
   --------------------------------------------------------------------- */
const FORM_COLOUR = {
  handheld: "#c9c3b4",
  twopiece: "#2f6f5e",
  hand: "#3f4750",
  small: "#4a5cab",
  inline: "#39404a",
  reel: "#b08a3a",
  screen: "#20262c"
};

export function toolModel(D) {
  var it = D.item;

  var parts = [
    { key: "tool", label: "The tool", build: body(it), finish: "matte", scale: 1, pos: [0, 0, 0],
      color: FORM_COLOUR[it.form],
      spec: it.form === "twopiece" ? "Two pieces, not joined to each other"
        : it.form === "hand" ? "A hand tool with two handles"
        : it.form === "reel" ? "A reel"
        : it.form === "small" ? "Small enough to lose"
        : it.form === "screen" ? "A screen"
        : it.form === "inline" ? "A small box that sits in the middle of a run"
        : "A handheld instrument",
      spec2: null,
      note: "Shape first, and then ask whether there is anything on it to read. Two handles and a " +
        "hinge means it changes the cable and cannot be undone. A screen means it reports and " +
        "changes nothing. Two pieces that are not joined to each other means the distance between " +
        "them is the whole idea." },
    { key: "end", label: "The working end", build: workingEnd(it), finish: "matte", scale: 1,
      pos: [0, 0, 0], color: "#c8a24a",
      spec: "The part that does the work, or shows the result",
      note: "A wedge with a slot, a pair of shaped jaws, a spike, a threaded mount, a row of " +
        "lamps, a graph, a list. Each of those belongs to one kind of tool and to no other, and " +
        "it is a shape rather than a colour on purpose." },
    { key: "subject", label: "What it is being used on", build: subject(it), finish: "matte",
      scale: 1, pos: [0, 0, 0], color: "#6d7d8c",
      spec: "The cable, panel, port, link or wall in front of it",
      note: "What a tool is pointed at says as much as the tool does. A bundle of identical " +
        "cables is one kind of problem, a panel being terminated is another, and one port on its " +
        "own with nothing plugged into it is a third." }
  ];

  var fe = farEnd(it);
  if (fe.length) {
    parts.push({ key: "farend", label: "What is at the other end", build: fe, finish: "matte",
      scale: 1, pos: [0, 0, 0], color: "#8a5a3c",
      spec: it.farEnd === "walk" ? "Nothing joined to it — you take the other piece and walk"
        : it.farEnd === "source" ? "A separate source, on the far end of the run"
        : "A second unit, on the far end of the run",
      note: it.farEnd === "walk"
        ? "The two pieces of this are not connected to each other by anything. Whatever passes " +
          "between them does so through the cable and the air, and you have to be at both ends of " +
          "the run in turn."
        : "It needs something at the other end before it can tell you anything, which means a run " +
          "with both ends reachable — and that is a constraint on when you can use it at all." });
  }

  return {
    kind: "drill",
    title: "One tool, on the job it is for",
    caption: "The same bench every time. Look at the shape of the tool, then at its working end, " +
      "then at what it is pointed at — and check the panel for whether it has anything to show " +
      "you at all. Several of these have no display, and that is not a missing feature: a tool " +
      "with nothing to read does something to the cable instead of reporting on it.",
    board: { size: [BOARD.w, 0.4, BOARD.d], pos: [0, -0.2, 0], color: "#3f474d",
      build: [{ shape: "rbox", size: [BOARD.w, 0.4, BOARD.d], pos: [0, 0, 0], r: 0.12, shade: 1.0 }],
      scale: 1 },
    parts: parts,
    _alters: it.alters,
    _far: it.farEnd,
    camera: { dist: 11.4, yaw: 0.3, pitch: 0.58, target: [0.4, 0.6, 0.2], min: 5, max: 28 }
  };
}
