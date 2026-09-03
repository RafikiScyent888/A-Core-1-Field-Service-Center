/* =====================================================================
   WHAT A BROKEN PART LOOKS LIKE

   Measured, before this existed: across forty tickets on the four priority
   tracks, the bench rendered SEVEN distinct machines. The hardware track
   gave four — the capacitor bank doming was built deliberately — and
   laptop, laser and display gave one apiece. Every fault on those three
   tracks drew the identical, undamaged machine. A student told to look for
   what is wrong was looking at scenery.

   THE APPROACH. Not hand-drawn damage per fault — there are two hundred and
   fourteen faults and that would rot the first time a part moved. Instead a
   handful of TRANSFORMS that take a healthy part's build array and return
   the damage to lay on top of it. `swell` domes a cell. `scorch` burns a
   patch. `crack` opens a split. `foul` mats a surface with debris. `lift`
   tilts a part out of true. `scar` glazes a band around a roller.

   Each transform is a function of the healthy geometry, so a part that gets
   redrawn keeps its damage, and none of this is a table of literals sitting
   beside the model waiting to disagree with it.

   TWO THINGS THIS GOT WRONG FIRST TIME, both found by looking at the render
   rather than at a number, and both worth stating because the numbers said
   everything was fine.

   Damage was a REPAINT. The fault recoloured the whole part, so a scorched
   mainboard came out brown from edge to edge and a fouled fan came out
   brown all over. That is not what burnt or dirty looks like, and it
   destroyed the exact cue it was meant to add: a technician reads a healthy
   green board with a black patch on it. Damage now comes back as its own
   small set of pieces — `harm` — that the scene draws in its own material
   over an otherwise untouched part.

   And `lift` DISASSEMBLED the part. It added a rotation to every piece
   about that piece's own origin, so a memory module standing proud of its
   slot rendered as a handful of sticks scattered across the board. A tilt
   is a rigid motion: the pieces turn about a shared hinge, together.

   WHAT DOES NOT GET DAMAGE. A driver problem, a wrong setting, a network
   misconfiguration — these have no physical tell, and inventing one would
   teach students to look for something that is not there on a real call.
   Those faults keep an undamaged machine on purpose, and the inspection
   note is where the evidence lives. `tellFor` returns null for them, and
   the count of nulls is reported by the verifier rather than hidden.
   ===================================================================== */

import { expand } from "./shape.js";

const clone = (build) => (build || []).map((p) => Object.assign({}, p, {
  size: p.size ? p.size.slice() : undefined,
  pos: p.pos ? p.pos.slice() : undefined,
  rot: p.rot ? p.rot.slice() : undefined
}));

/* ---------------------------------------------------------------------
   WHERE THE SURFACE ACTUALLY IS

   The first version guessed: it took build[0] as the body and put the
   damage a fixed distance above it. On a fan — a disc authored in the XZ
   plane whose first piece is the hub — that buried every speck of debris
   inside the housing, and the render came back looking clean. So measure
   the part instead of guessing at it.

   Sizes are full extents, matching the scene's primitives: a box is its
   size, a cylinder is diameter by height, a sphere is a diameter.
   --------------------------------------------------------------------- */
function halfExtent(p) {
  const s = p.size || [1, 1, 1];
  let e;
  switch (p.shape) {
    case "cyl": case "tube": e = [s[0] / 2, (s[1] || 0) / 2, s[0] / 2]; break;
    case "cone": e = [Math.max(s[0], s[2] || 0) / 2, (s[1] || 0) / 2,
                      Math.max(s[0], s[2] || 0) / 2]; break;
    case "sphere": e = [s[0] / 2, s[0] / 2, s[0] / 2]; break;
    case "torus": e = [(s[0] + (s[1] || 0)) / 2, (s[0] + (s[1] || 0)) / 2,
                       (s[1] || 0) / 2]; break;
    default: e = [(s[0] || 0) / 2, (s[1] || 0) / 2, (s[2] || 0) / 2];
  }
  /* A rotated piece no longer lines up with the axes. Rather than carry a
     matrix around, take the largest half-extent in every direction — too
     big is safe here, too small puts damage inside the part. */
  if (p.rot && (p.rot[0] || p.rot[1] || p.rot[2])) {
    const r = Math.max(e[0], e[1], e[2]);
    e = [r, r, r];
  }
  return e;
}

function bounds(build) {
  const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  /* Measure what will actually be drawn. A `repeat` describes one chip and
     five copies of it; measuring the description rather than the expansion
     said a memory module was the width of one chip, and put the scorch mark
     a long way off the end of the part. */
  expand(build).forEach((p) => {
    const c = p.pos || [0, 0, 0], e = halfExtent(p);
    for (let i = 0; i < 3; i++) {
      lo[i] = Math.min(lo[i], c[i] - e[i]);
      hi[i] = Math.max(hi[i], c[i] + e[i]);
    }
  });
  if (!isFinite(lo[0])) { lo[0] = lo[1] = lo[2] = -0.5; hi[0] = hi[1] = hi[2] = 0.5; }
  return {
    lo: lo, hi: hi,
    size: [hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]],
    mid: [(lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2, (lo[2] + hi[2]) / 2]
  };
}

/* The biggest piece — the body of the part, whatever order it was authored
   in. Used where the damage belongs to one component rather than to the
   whole assembly. */
function body(build) {
  let best = null, bestV = -1;
  (build || []).forEach((p) => {
    const e = halfExtent(p), v = e[0] * e[1] * e[2];
    if (v > bestV) { bestV = v; best = p; }
  });
  return best;
}

/* Turn a local offset by a piece's own rotation, so a band placed along a
   roller runs along THAT roller rather than along the world's Y axis. */
function rotVec(v, rot) {
  const [rx, ry, rz] = rot || [0, 0, 0];
  let [x, y, z] = v;
  let t;
  t = y * Math.cos(rx) - z * Math.sin(rx); z = y * Math.sin(rx) + z * Math.cos(rx); y = t;
  t = x * Math.cos(ry) + z * Math.sin(ry); z = -x * Math.sin(ry) + z * Math.cos(ry); x = t;
  t = x * Math.cos(rz) - y * Math.sin(rz); y = x * Math.sin(rz) + y * Math.cos(rz); x = t;
  return [x, y, z];
}

/* ---------------------------------------------------------------------
   THE TRANSFORMS

   Each takes the healthy build and returns { build, harm }: the part as it
   should now be drawn, and the damage to lay over it. Most leave `build`
   alone — burning a board does not move it — and only `swell` and `lift`
   change the part itself, because a gassed cell really is a different
   shape and a popped module really is in a different place.
   --------------------------------------------------------------------- */

/* SWELL — a cell that has gassed. The pack grows in its thinnest axis and
   the top face domes. A real one rocks on the bench and will not sit flat,
   so the tell is a curved top where there should be a flat one. Built as a
   short stack of shrinking slabs rather than a ball stuck on top: a ball
   read as a balloon tied to the battery. */
function swell(build) {
  const out = clone(build), b = body(out), bb = bounds(out);
  if (b && b.size) {
    const thin = b.size.indexOf(Math.min.apply(null, b.size));
    b.size[thin] *= 1.35;
  }
  const harm = [];
  const top = bb.hi[1], w = bb.size[0], d = bb.size[2];
  /* Four shallow layers with a lot of overlap and a generous corner radius,
     rather than three obvious ones: at three steps it read as a stack of
     trays somebody had left on the pack instead of as the pack itself
     swelling. */
  const step = Math.max(0.04, bb.size[1] * 0.19);
  [[0.93, 0.95], [0.82, 0.86], [0.66, 0.72], [0.44, 0.52]].forEach((f, i) => {
    harm.push({ shape: "rbox", size: [w * f[0], step * 1.9, d * f[1]], r: step * 0.9,
      pos: [bb.mid[0], top + step * (i * 0.8 + 0.1), bb.mid[2]],
      shade: 1 + i * 0.045 });
  });
  return { build: out, harm: harm };
}

/* SCORCH — heat damage. A dark patch with blistered components at its
   centre, sitting on the part, off to one side the way a failed rail
   actually burns. The part underneath keeps its own colour, because that
   contrast IS the tell. */
function scorch(build) {
  const bb = bounds(build);
  const w = bb.size[0], d = bb.size[2], top = bb.hi[1];
  const cx = bb.mid[0] + w * 0.17, cz = bb.mid[2] - d * 0.10;
  const t = Math.max(0.02, bb.size[1] * 0.05);
  return { build: clone(build), harm: [
    { shape: "plate", size: [w * 0.44, t, d * 0.46], pos: [cx, top + t * 0.4, cz], shade: 1 },
    { shape: "plate", size: [w * 0.26, t * 1.2, d * 0.28], pos: [cx, top + t, cz], shade: 0.55 },
    { shape: "sphere", size: [Math.min(w, d) * 0.16],
      pos: [cx - w * 0.05, top + t * 1.4, cz], shade: 1.35 },
    { shape: "sphere", size: [Math.min(w, d) * 0.10],
      pos: [cx + w * 0.09, top + t * 1.2, cz + d * 0.08], shade: 1.15 }
  ] };
}

/* CRACK — a split across a rigid face. One long run with two branches off
   it, standing just proud of the surface so it catches an edge and reads
   from any angle rather than only from straight on. */
function crack(build) {
  const bb = bounds(build);
  const w = bb.size[0], d = bb.size[2], top = bb.hi[1];
  const t = Math.max(0.03, bb.size[1] * 0.09);
  const th = Math.max(0.04, Math.min(w, d) * 0.045);
  return { build: clone(build), harm: [
    { shape: "box", size: [w * 0.80, t, th], r: 0.005,
      pos: [bb.mid[0] - w * 0.04, top, bb.mid[2] + d * 0.06], rot: [0, 0.34, 0], shade: 1 },
    { shape: "box", size: [w * 0.36, t, th * 0.8], r: 0.005,
      pos: [bb.mid[0] + w * 0.22, top, bb.mid[2] - d * 0.16], rot: [0, -0.62, 0], shade: 0.85 },
    { shape: "box", size: [w * 0.24, t, th * 0.7], r: 0.005,
      pos: [bb.mid[0] - w * 0.26, top, bb.mid[2] - d * 0.10], rot: [0, -1.05, 0], shade: 0.85 }
  ] };
}

/* FOUL — felted dust in a fin stack, toner packed behind a blade, debris
   wound round a hub. A mat across the surface plus lumps sitting half sunk
   into it, so it reads as something that has built up over months rather
   than as a part that has been painted a different colour. */
function foul(build) {
  const bb = bounds(build);
  const w = bb.size[0], d = bb.size[2], top = bb.hi[1];
  const r = Math.min(w, d);
  const harm = [{ shape: "plate", size: [w * 0.82, Math.max(0.02, bb.size[1] * 0.06), d * 0.78],
    pos: [bb.mid[0], top + 0.01, bb.mid[2]], shade: 0.9 }];
  for (let i = 0; i < 9; i++) {
    const a = i * 2.399;                      // spread the lumps, don't line them up
    const rad = r * (0.10 + 0.07 * Math.abs(Math.sin(i * 1.7)));
    harm.push({ shape: "sphere", size: [rad * 2],
      pos: [bb.mid[0] + Math.cos(a) * w * 0.30,
            top + rad * 0.55,
            bb.mid[2] + Math.sin(a) * d * 0.28],
      shade: 0.78 + 0.18 * ((i % 3) / 2) });
  }
  return { build: clone(build), harm: harm };
}

/* LIFT — a part no longer sitting true: a module popped at one end, a hinge
   sprung, a cover standing proud. A RIGID tilt about the far end, which is
   how a part that is still attached at one edge actually sits. Rotating
   each piece where it stood scattered the part into loose sticks. */
function lift(build) {
  const bb = bounds(build);
  return { build: turn(build, 2, [bb.lo[0], bb.lo[1], bb.mid[2]], 0.26), harm: [] };
}

/* COMPOSING TWO ROTATIONS.

   The pose transforms turn a part that is already built out of pieces at
   their own angles — a memory module's contacts, a hinge barrel, a fan
   blade. Adding the tilt to each piece's rotation triple looked right and
   was wrong: Euler angles do not add unless both rotations are about the
   same axis, so a module with angled pieces came apart into a splayed fan
   of sticks the moment it was tilted. Twice I read that render as the tilt
   being too strong and made it smaller, which hid the symptom and left the
   part broken in a subtler way.

   These three do it properly: build the matrices, multiply them in the
   right order, read the angles back. Same convention as the scene's own
   Euler — X, then Y, then Z. */
function rotMatrix(e) {
  const [x, y, z] = e || [0, 0, 0];
  const a = Math.cos(x), b = Math.sin(x);
  const c = Math.cos(y), d = Math.sin(y);
  const f = Math.cos(z), g = Math.sin(z);
  return [
    [c * f, -c * g, d],
    [a * g + b * d * f, a * f - b * d * g, -b * c],
    [b * g - a * d * f, b * f + a * d * g, a * c]
  ];
}
function matMul(m, n) {
  const o = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
    o[i][j] = m[i][0] * n[0][j] + m[i][1] * n[1][j] + m[i][2] * n[2][j];
  }
  return o;
}
function matEuler(m) {
  const s = Math.max(-1, Math.min(1, m[0][2]));
  const y = Math.asin(s);
  if (Math.abs(s) < 0.9999999) {
    return [Math.atan2(-m[1][2], m[2][2]), y, Math.atan2(-m[0][1], m[0][0])];
  }
  return [Math.atan2(m[2][1], m[1][1]), y, 0];
}
/* The tilt happens in the world, so it goes on the OUTSIDE of whatever
   angle the piece was already drawn at. */
const compose = (outer, inner) => matEuler(matMul(rotMatrix(outer), rotMatrix(inner)));

/* Rotate a whole build rigidly about a hinge point, in one plane. The four
   pose faults below differ only in which plane and which end, so they share
   this rather than each growing their own copy of the arithmetic. */
function turn(build, axis, hinge, angle) {
  /* Expand first. `repeat` and `ring` step their copies along a fixed
     vector, so turning the description turned the base piece and left its
     copies marching off along the axis they were authored on. */
  const out = clone(expand(build));
  const c = Math.cos(angle), s = Math.sin(angle);
  /* axis 2 turns in the XY plane (a part standing up at one end); axis 1
     turns in the XZ plane (a part crooked in plan, seen from above). The
     XZ turn runs the opposite way round from a positive rotation about Y,
     which is why the delta below carries the minus sign. */
  const b = axis === 1 ? 2 : 1;
  const delta = axis === 1 ? [0, -angle, 0] : [0, 0, angle];
  out.forEach((p) => {
    const q = (p.pos || [0, 0, 0]).slice();
    const da = q[0] - hinge[0], db = q[b] - hinge[b];
    q[0] = hinge[0] + da * c - db * s;
    q[b] = hinge[b] + da * s + db * c;
    p.pos = q;
    p.rot = compose(delta, p.rot);
  });
  return out;
}

/* SAG — a module hanging off its cable instead of sitting in its housing.
   The opposite end from `lift`, and downward: something that has come out
   and is dangling, not something that has popped up. */
function sag(build) {
  const bb = bounds(build);
  return { build: turn(build, 2, [bb.hi[0], bb.hi[1], bb.mid[2]], -0.30), harm: [] };
}

/* SKEW — crooked in plan. A registration assembly that feeds the sheet in
   at an angle is square from the side and visibly turned from above, which
   is a different picture from one that has popped up at one end. */
function skew(build) {
  const bb = bounds(build);
  return { build: turn(build, 1, [bb.lo[0], bb.mid[1], bb.mid[2]], 0.22), harm: [] };
}

/* SHIFT — not against the stack. No rotation at all: the part is square and
   simply in the wrong place, leaving the finger's width of play the note
   describes. The absence of a tilt is what tells it from a skew. */
function shift(build) {
  const bb = bounds(build);
  const out = clone(expand(build));
  const by = Math.max(0.25, bb.size[2] * 0.35);
  out.forEach((p) => {
    const q = (p.pos || [0, 0, 0]).slice();
    q[2] += by;
    p.pos = q;
  });
  return { build: out, harm: [] };
}

/* SCAR — the glazed band around a roller that has done its miles. Bands run
   round the roller, along its own axis rather than the world's, and stand a
   little proud of it so the wear catches the light the way a polished patch
   on rubber does. */
function scar(build) {
  const out = clone(build);
  const roll = (out.filter((p) => p.shape === "cyl" || p.shape === "tube")
    .sort((a, b) => (b.size ? b.size[0] : 0) - (a.size ? a.size[0] : 0)))[0] || body(out);
  const harm = [];
  if (roll && (roll.shape === "cyl" || roll.shape === "tube")) {
    const dia = roll.size[0], len = roll.size[1] || dia;
    const at = roll.pos || [0, 0, 0], rot = roll.rot || [0, 0, 0];
    [[0.0, 0.20, 1], [-0.26, 0.10, 0.8], [0.28, 0.07, 0.9]].forEach((band) => {
      const off = rotVec([0, len * band[0], 0], rot);
      harm.push({ shape: "cyl", size: [dia * 1.06, len * band[1]],
        pos: [at[0] + off[0], at[1] + off[1], at[2] + off[2]],
        rot: rot.slice(), seg: 24, shade: band[2] });
    });
  } else {
    /* Not a roller — a pad or a plate worn to a shine. A band across it. */
    const bb = bounds(out);
    harm.push({ shape: "plate", size: [bb.size[0] * 0.7, Math.max(0.02, bb.size[1] * 0.08),
      bb.size[2] * 0.34], pos: [bb.mid[0], bb.hi[1] + 0.01, bb.mid[2]], shade: 1 });
  }
  return { build: out, harm: harm };
}

/* STRIPE — one line of pixels dead the full height of a panel. Not a crack
   and not a scorch: a single narrow bar running the whole way across, which
   is what the fault actually looks like and what tells it apart from a
   cracked panel on the same part. */
function stripe(build) {
  const bb = bounds(build);
  const long = bb.size[0] >= bb.size[2] ? 0 : 2;
  const wide = long === 0 ? 2 : 0;
  const size = [0, Math.max(0.02, bb.size[1] * 0.07), 0];
  size[long] = bb.size[long] * 0.96;
  size[wide] = Math.max(0.03, bb.size[wide] * 0.022);
  return { build: clone(build), harm: [
    /* Out near one long edge, because that is where the note puts it —
       "a band down one long edge" — and a dead column a student is told to
       find at the edge should not be drawn up the middle. */
    { shape: "plate", size: size,
      pos: [long === 0 ? bb.mid[0] : bb.mid[0] + bb.size[0] * 0.36,
            bb.hi[1] + 0.01,
            long === 0 ? bb.mid[2] + bb.size[2] * 0.36 : bb.mid[2]], shade: 1 }
  ] };
}

/* GHOST — an image burnt into a panel. Flat blocks with nothing raised
   about them, because burn-in is a stain and not a defect you could feel;
   a student who has been taught to look for shape damage should find this
   one reads differently, since it is a different kind of failure. */
function ghost(build) {
  const bb = bounds(build);
  const w = bb.size[0], d = bb.size[2], y = bb.hi[1] + 0.008;
  const t = Math.max(0.015, bb.size[1] * 0.04);
  return { build: clone(build), harm: [
    { shape: "plate", size: [w * 0.72, t, d * 0.10], pos: [bb.mid[0], y, bb.mid[2] - d * 0.30], shade: 1 },
    { shape: "plate", size: [w * 0.10, t, d * 0.52], pos: [bb.mid[0] - w * 0.34, y, bb.mid[2] + d * 0.06], shade: 0.9 },
    { shape: "plate", size: [w * 0.46, t, d * 0.08], pos: [bb.mid[0] + w * 0.10, y, bb.mid[2] + d * 0.32], shade: 0.85 }
  ] };
}

/* ENDCHAR — cooked at one end. A backlight strip that has lost its lower
   third is dark at that end and normal at the other, and the asymmetry is
   the diagnosis: a whole strip that has failed looks nothing like this. */
function endchar(build) {
  const bb = bounds(build);
  const long = bb.size[0] >= bb.size[2] ? 0 : 2;
  const size = [bb.size[0] * 0.9, Math.max(0.03, bb.size[1] * 0.16), bb.size[2] * 0.9];
  size[long] = bb.size[long] * 0.34;
  const pos = [bb.mid[0], bb.hi[1] + size[1] * 0.3, bb.mid[2]];
  pos[long] = bb.lo[long] + bb.size[long] * 0.19;
  const fade = [bb.mid[0], bb.hi[1] + size[1] * 0.25, bb.mid[2]];
  fade[long] = bb.lo[long] + bb.size[long] * 0.42;
  const fadeSize = size.slice();
  fadeSize[long] = bb.size[long] * 0.16;
  return { build: clone(build), harm: [
    { shape: "plate", size: size, pos: pos, shade: 1 },
    { shape: "plate", size: fadeSize, pos: fade, shade: 0.55 }
  ] };
}

/* SOAK — saturated right through. A waste pad heavy with ink, a filter that
   has taken all it can. One flat slab across nearly the whole face, because
   the tell is that there is nowhere clean left, not that there is a mark on
   it somewhere. */
function soak(build) {
  const bb = bounds(build);
  return { build: clone(build), harm: [
    { shape: "plate", size: [bb.size[0] * 0.94, Math.max(0.02, bb.size[1] * 0.10), bb.size[2] * 0.94],
      pos: [bb.mid[0], bb.hi[1] + 0.008, bb.mid[2]], shade: 1 },
    { shape: "plate", size: [bb.size[0] * 0.62, Math.max(0.02, bb.size[1] * 0.12), bb.size[2] * 0.58],
      pos: [bb.mid[0] - bb.size[0] * 0.08, bb.hi[1] + 0.02, bb.mid[2] + bb.size[2] * 0.06], shade: 0.7 }
  ] };
}

/* SCUFF — fine scratches, ink mist, a hazed lens. Thin streaks lying flat
   on the face rather than lumps standing off it, because that is the
   difference between a surface that is dirty and a surface that is marked. */
function scuff(build) {
  const bb = bounds(build);
  const long = bb.size[0] >= bb.size[2] ? 0 : 2;
  const wide = long === 0 ? 2 : 0;
  const t = Math.max(0.012, bb.size[1] * 0.04);
  const harm = [];
  for (let i = 0; i < 7; i++) {
    const size = [0, t, 0];
    size[long] = bb.size[long] * (0.30 + 0.16 * Math.abs(Math.sin(i * 2.3)));
    size[wide] = Math.max(0.02, bb.size[wide] * 0.018);
    const pos = [bb.mid[0], bb.hi[1] + 0.006, bb.mid[2]];
    pos[long] += bb.size[long] * (0.20 * Math.sin(i * 1.9));
    pos[wide] += bb.size[wide] * (-0.34 + 0.11 * i);
    harm.push({ shape: "plate", size: size, pos: pos, shade: 0.7 + 0.3 * ((i % 3) / 2) });
  }
  return { build: clone(build), harm: harm };
}

/* BEND — a run that does not go where it should: flattened under a chair
   castor, taken the long way round a void, pulled tighter than its bend
   radius. The middle of the part is pushed sideways so the route reads as
   a detour rather than a straight line. */
function bend(build) {
  const out = clone(expand(build));
  const bb = bounds(build);
  const long = bb.size[0] >= bb.size[2] ? 0 : 2;
  const wide = long === 0 ? 2 : 0;
  const span = bb.size[long] || 1;
  out.forEach((p) => {
    const q = (p.pos || [0, 0, 0]).slice();
    /* Nought at the ends, most in the middle, so whatever is anchored stays
       anchored and the run between them bows out. */
    const t = ((q[long] - bb.lo[long]) / span) * Math.PI;
    q[wide] += Math.sin(Math.max(0, Math.min(Math.PI, t))) * bb.size[wide === 0 ? 0 : 2] * 0.9
      + Math.sin(Math.max(0, Math.min(Math.PI, t))) * span * 0.13;
    p.pos = q;
  });
  return { build: out, harm: [] };
}

/* SPLAY — a bundle that has come apart: pairs untwisted well behind the
   punch-down, conductors fanned instead of held together. Each piece turns
   by a little more than the last, so the bundle opens like a fan. This is
   the picture `lift` used to draw by accident, drawn on purpose and only
   where a bundle really has been opened up. */
function splay(build) {
  const out = clone(expand(build));
  const bb = bounds(build);
  const n = Math.max(1, out.length - 1);
  out.forEach((p, i) => {
    const a = (i / n - 0.5) * 0.9;
    const q = (p.pos || [0, 0, 0]).slice();
    const dx = q[0] - bb.lo[0];
    q[2] += Math.sin(a) * dx * 0.8;
    q[1] += Math.abs(Math.sin(a)) * dx * 0.18;
    p.pos = q;
    p.rot = compose([0, -a, 0], p.rot);
  });
  return { build: out, harm: [] };
}

/* REORDER — the wires are in the wrong order. Nothing is broken and nothing
   is dirty; the pattern is simply not the pattern at the other end, and
   comparing the two ends is the whole job. The tones of the repeated
   conductors are permuted, so the sequence visibly differs from its pair
   while every piece stays exactly where it was. */
function reorder(build) {
  const bb = bounds(build);
  const long = bb.size[0] >= bb.size[2] ? 0 : 2;
  const wide = long === 0 ? 2 : 0;
  /* A ramp light-to-dark across the eight positions, with two pairs put in
     the wrong place. The tell is the SEQUENCE, read against the plug at the
     other end, which carries the same eight bars in order.

     Not the wires' real colours: a part is one merged mesh with one
     material, so eight colours inside one plug cannot be drawn. A tell that
     needs a colour the renderer cannot produce is a tell that is not there,
     and a student told to compare colours against a picture that has none
     learns to distrust the picture. Tone can be drawn, ordering is what the
     fault is about, and the note beside it says so in words. */
  const ramp = [0.35, 1.55, 0.60, 1.30, 0.85, 1.05, 0.45, 1.45];
  const sw = (a, b) => { const t = ramp[a]; ramp[a] = ramp[b]; ramp[b] = t; };
  sw(2, 4); sw(5, 6);                       // one crossed pair, one reversed
  const harm = [];
  for (let i = 0; i < 8; i++) {
    const size = [0, Math.max(0.03, bb.size[1] * 0.5), 0];
    size[long] = bb.size[long] * 0.52;
    size[wide] = Math.max(0.02, (bb.size[wide] * 0.86) / 8) * 0.72;
    const pos = [bb.mid[0], bb.hi[1] + size[1] * 0.3, bb.mid[2]];
    pos[long] = bb.mid[long] + bb.size[long] * 0.12;
    pos[wide] = bb.lo[wide] + bb.size[wide] * (0.10 + 0.80 * (i / 7));
    harm.push({ shape: "plate", size: size, pos: pos, shade: ramp[i] });
  }
  return { build: clone(build), harm: harm };
}

/* LAMP — an indicator saying something. A carrier light on a failed disk, a
   UPS alarming, a surge strip whose protection light has gone out. Not
   damage: a reading, and the one a technician takes at the front of a rack
   before opening anything. Drawn as a small raised block on the face that
   is toward the viewer, because that is where an indicator lives. */
function lamp(build) {
  const bb = bounds(build);
  const w = bb.size[0], d = bb.size[2];
  const s = Math.max(0.08, Math.min(w, d) * 0.16);
  return { build: clone(build), harm: [
    { shape: "rbox", size: [s * 1.6, s * 0.7, s * 1.6], r: s * 0.2,
      pos: [bb.lo[0] + w * 0.14, bb.hi[1] + s * 0.3, bb.mid[2]], shade: 1 },
    { shape: "rbox", size: [s * 0.9, s * 0.5, s * 0.9], r: s * 0.15,
      pos: [bb.lo[0] + w * 0.14, bb.hi[1] + s * 0.6, bb.mid[2]], shade: 1.4 }
  ] };
}

export const TRANSFORM = { swell, scorch, crack, foul, scar, stripe, ghost, endchar,
  soak, scuff, lamp, lift, sag, skew, shift, bend, splay, reorder };

/* The transforms that move the part and add nothing. Kept as a set rather
   than as a check against one name, because the first version tested
   `how === "lift"` and the moment a second pose transform existed the
   check started calling it a mistake. */
const POSE_ONLY = { lift: 1, sag: 1, skew: 1, shift: 1, bend: 1, splay: 1 };

/* ---------------------------------------------------------------------
   WHAT THE DAMAGE IS MADE OF

   Named by what it is, not by which fault produced it, so the same burn
   looks the same wherever it turns up and there is one place to change it.
   Deliberately not a warning colour: the point is that the part looks
   WRONG, not that it has been labelled. A student should have to look, and
   a student whose colour vision is not what it was should still see a
   change of SHAPE as well as of tone.
   --------------------------------------------------------------------- */
const HARM = {
  burn:  { tint: "#241a12", finish: "scorched" },  // charred board, cooked plastic
  soot:  { tint: "#1b1917", finish: "corroded" },  // packed toner, waste
  /* The one damage material carrying a photographed surface. Felted lint is
     the texture students are asked to recognise most often and the one that
     defeated every attempt to generate it — see assets/tiles.js. */
  dust:  { tint: "#8b8175", finish: "matte", skin: "dust" },
  split: { tint: "#14181c", finish: "matte" },     // a crack, a chafed cable
  glaze: { tint: "#9a9184", finish: "plastic" },   // a worn band polished shiny
  bulge: { tint: "#54836d", finish: "matte" },     // the dome on a gassed cell
  bare:  { tint: "#8d9199", finish: "steel" },     // a fresh break face, bright
  ink:   { tint: "#151318", finish: "plastic" },   // wet or dried ink, still shiny
  haze:  { tint: "#b9b6ae", finish: "matte" },     // fine scratches, ink mist on glass
  green: { tint: "#5c7a54", finish: "corroded" },  // the bloom of liquid corrosion
  /* Indicator colours. Small, and always paired with something the student
     can read in words, because a lamp that only says its meaning in hue
     says nothing to a good part of this class. */
  alarm: { tint: "#b8781f", finish: "plastic" },   // lit, and asking for attention
  failed:{ tint: "#9c3326", finish: "plastic" },   // lit, and reporting a dead member
  unlit: { tint: "#2b2f33", finish: "plastic" },   // out, when it should be on
  pose:  { tint: null, finish: null }              // nothing added — the tell is the pose
};

/* ---------------------------------------------------------------------
   WHICH FAULT SHOWS AS WHAT.

   Keyed by fault, because the fault is what the student is hunting. A
   fault absent from here has no physical tell and keeps a clean machine —
   that is a decision, not an oversight, and `withoutTell` lists them so the
   decision stays visible.
   --------------------------------------------------------------------- */
export const TELL = {
  /* ---- laptop ---- */
  lapbatt:        { how: "swell",  harm: "bulge",
                    say: "The cell has gassed: the pack is domed enough to rock on the bench and it has lifted the trackpad above it." },
  /* The cold plate standing off the die is a POSE — the part is intact and
     it is not sitting where it should be, which is exactly what `lift` is
     for. `lapspeakerloom` and `lapbatthealth` are deliberately absent: a
     connector left out of its socket and a pack whose cells have simply got
     smaller both look perfect, and on this track that is the lesson. The
     two configuration faults have no part at all. */
  lappipeloose:   { how: "lift",   harm: "pose",
                    say: "The cold plate is standing off the die at one corner rather than sitting flat on it." },
  lapthermal:     { how: "foul",   harm: "dust",
                    say: "The fin stack is packed solid with felted dust and the fan cannot move air through it." },
  lapfan:         { how: "foul",   harm: "soot",
                    say: "Debris is wound around the hub and one blade is fouled." },
  lapboard:       { how: "scorch", harm: "burn",
                    say: "There is a scorched patch beside the power rail with a blistered component at its centre." },
  lapdc:          { how: "scorch", harm: "burn",
                    say: "The barrel jack's solder pads are darkened and one has lifted from the board." },
  laphinge:       { how: "lift",   harm: "pose",
                    say: "The hinge no longer sits flush — the assembly stands proud on one side and the bezel has parted." },
  lapram:         { how: "lift",   harm: "pose",
                    say: "One module is standing out of its slot at an angle rather than clipped flat." },
  lapm2key:       { how: "lift",   harm: "pose",
                    say: "The stick is not seated — the notch does not line up with this socket's key." },
  lapssd:         { how: "scorch", harm: "burn",
                    say: "The controller on the stick is discoloured and warm to the touch." },
  lapkbd:         { how: "lift",   harm: "pose",
                    say: "A run of keycaps sits proud of the others where the membrane below has swollen." },
  laptrack:       { how: "crack",  harm: "split",
                    say: "The glass is cracked from the lower corner and the surface no longer tracks across it." },
  lapdisplaycable:{ how: "crack",  harm: "split",
                    say: "The ribbon is chafed where it passes the hinge and the shield has split." },
  lapbacklight:   { how: "scorch", harm: "burn",
                    say: "The backlight driver is darkened at one end and there is a smell of hot varnish." },
  lapwebcam:      { how: "sag",    harm: "pose",
                    say: "The module hangs from its cable rather than sitting in its housing." },
  lapspeaker:     { how: "crack",  harm: "split",
                    say: "The cone is split and the surround has come away on one side." },
  lapadhesive:    { how: "lift",   harm: "pose",
                    say: "The cover is lifting at the edge where the adhesive has let go." },
  lapsoldered:    { how: "scorch", harm: "burn",
                    say: "The memory is soldered down — there is no socket here, and one package is discoloured." },

  /* ---- laser printer ---- */
  fuser:          { how: "scar",   harm: "burn",
                    say: "The fuser sleeve is glazed and scorched in a band, and toner is baking onto it rather than into the paper." },
  pickup:         { how: "scar",   harm: "glaze",
                    say: "The pickup tyre is polished smooth and scored around its circumference." },
  sepwear:        { how: "scar",   harm: "glaze",
                    say: "The separation pad is worn through to a shiny band." },
  transfer:       { how: "scar",   harm: "glaze",
                    say: "The transfer roller is worn in a band the width of the page." },
  repeat:         { how: "scar",   harm: "soot",
                    say: "There is a mark around the drum at one point of its rotation." },
  cleanblade:     { how: "foul",   harm: "soot",
                    say: "Waste toner has packed behind the cleaning blade and is spilling past it." },
  tonerlow:       { how: "foul",   harm: "soot",
                    say: "Toner has settled to one end of the cartridge and the window is nearly clear." },
  ozone:          { how: "foul",   harm: "dust",
                    say: "The ozone filter is grey and matted flat." },
  gearnoise:      { how: "crack",  harm: "bare",
                    say: "A tooth is missing from the drive gear and the break face is bright." },
  duplexjam:      { how: "crack",  harm: "split",
                    say: "The duplex guide is cracked and a flap of it stands into the paper path." },
  exitjam:        { how: "lift",   harm: "pose",
                    say: "The exit flag is bent and no longer falls back into place." },
  regskew:        { how: "skew",   harm: "pose",
                    say: "The registration assembly sits crooked and feeds the sheet in at an angle." },
  trayguide:      { how: "shift",  harm: "pose",
                    say: "The tray guide is not against the stack — there is a finger's width of play." },
  scanner:        { how: "scorch", harm: "burn",
                    say: "The laser scanner window is fogged and there is a burnt smell from the assembly." },

  /* ---- display ---- */
  panel:          { how: "crack",  harm: "split",
                    say: "The panel is cracked from the corner and the damage spreads as a dark bloom." },
  deadcolumn:     { how: "stripe", harm: "split",
                    say: "A single column runs dead the full height of the panel." },
  backlight:      { how: "scorch", harm: "burn",
                    say: "One end of the backlight strip is darkened and the diffuser above it is stained." },
  partialbl:      { how: "endchar", harm: "burn",
                    say: "The lower third of the backlight is out — the strip is discoloured at that end." },
  lampdim:        { how: "foul",   harm: "dust",
                    say: "The projector lamp is clouded and the filter behind it is matted with dust." },
  driver:         { how: "scorch", harm: "burn",
                    say: "The driver board has a blistered component and a dark ring around its pad." },
  vidcable:       { how: "crack",  harm: "split",
                    say: "The cable is split behind the moulding and the screen shows it." },
  gpuart:         { how: "scorch", harm: "burn",
                    say: "The graphics card is running hot enough to discolour the board around the core." },
  burnin:         { how: "ghost",  harm: "glaze",
                    say: "A ghost of the old layout is burnt into the panel and will not clear." },
  projector:      { how: "foul",   harm: "dust",
                    say: "The optical path is dusty and the image has lost contrast across the whole frame." },

  /* ---- desktop hardware ----
     Only three of the eighteen. That is not an omission: read the notes on
     this track and most of them say, in so many words, that there is
     nothing to see — "no scorching, no corrosion, it looks exactly like the
     one next to it", "nothing to see, it is a sealed unit", "seated, power
     connector home, fans spin at power-on". Hardware is diagnosed with POST
     codes, SMART and a thermometer, and drawing damage on those parts would
     turn the instruments into decoration. The domed capacitor bank is drawn
     by the board builder itself, which knows which pieces are capacitors. */
  thermal:        { how: "foul",   harm: "dust",
                    say: "The fan is not turning and the fin stack is packed solid with felted dust." },
  cable:          { how: "bend",   harm: "pose",
                    say: "Routed with a tight bend right at the connector, and the latch does not click home." },

  /* ---- mobile ----
     Two of these are traps and must stay clean. The battery on the health
     ticket is explicitly unmarked — the health figure is the fault and you
     cannot see a number — and the one whose fault is called "swollen" has a
     battery that is flat, with its adhesive tabs intact. Drawing a bulge on
     either would hand over an answer that the ticket is built to withhold. */
  port:           { how: "foul",   harm: "dust",
                    say: "The port is packed with compressed grey pocket lint; a cable stops three quarters of the way in." },
  digitizer:      { how: "stripe", harm: "split",
                    say: "A band about 8mm wide down one long edge registers nothing, and it stays put when the device is rotated." },
  protector:      { how: "lift",   harm: "pose",
                    say: "A tempered-glass protector has lifted along one edge, with a rainbow-edged air gap under it. The glass beneath is unmarked." },
  speaker:        { how: "foul",   harm: "soot",
                    say: "The earpiece mesh is packed solid with pocket debris." },
  liquid:         { how: "foul",   harm: "green",
                    say: "The liquid contact indicator has gone from white to red and there is a bloom of green corrosion creeping out from under the shield." },
  rearcam:        { how: "scuff",  harm: "haze",
                    say: "The glass in front of the module is hazed with fine scratches. The module itself focuses and meters correctly." },

  /* ---- inkjet ----
     Eleven of the fifteen keep a clean machine, and the printhead tickets
     are the reason the track exists: "nothing visible at all, the nozzle
     plate looks exactly as it should, the blockage is inside it". A nozzle
     check on paper is the instrument; the carriage is not. */
  belt:           { how: "sag",    harm: "pose",
                    say: "The belt is visibly slack and the teeth are rounded off along one section of its length." },
  capping:        { how: "foul",   harm: "ink",
                    say: "The rubber lip is caked hard with dried ink and no longer sits flat against the nozzle plate." },
  wastepad:       { how: "soak",   harm: "ink",
                    say: "Saturated through to the edges and heavy with ink. There is nowhere left for a purge to go." },
  encoder:        { how: "scuff",  harm: "haze",
                    say: "A haze of ink mist along a section of the strip, and a clear fingerprint about halfway across the travel." },

  /* ---- cabling ----
     Three of these parts carry more than one fault, and they SHOULD draw
     the same picture: conductors short of the front of the plug look the
     same whether the link reads open, short or split, and telling those
     apart is what the tester is for. The patch cord and the panel port stay
     clean because their tell is printed text and a correct punch-down. */
  open:           { how: "shift",  harm: "pose",
                    say: "Held up to the light, the conductors do not all reach the front of the plug." },
  short:          { how: "shift",  harm: "pose",
                    say: "Held up to the light, the conductors do not all reach the front of the plug." },
  split:          { how: "shift",  harm: "pose",
                    say: "Held up to the light, the conductors do not all reach the front of the plug." },
  /* Drawn as a light-to-dark sequence rather than as wire colours, because
     one part is one mesh with one material and eight colours inside a plug
     cannot be drawn. What the picture shows is that the order is wrong; the
     note and the tester say which pairs and how. */
  crossed:        { how: "reorder", harm: "bare",
                    say: "The conductors enter this plug out of sequence — two pairs are not where the standard puts them, and the plug at the other end is terminated to a different one." },
  revpair:        { how: "reorder", harm: "bare",
                    say: "The conductors enter this plug out of sequence — one pair is reversed within its own position." },
  untwist:        { how: "splay",  harm: "pose",
                    say: "The pairs are untwisted well over an inch behind the punch-down block." },
  punchmiss:      { how: "splay",  harm: "pose",
                    say: "The pairs are untwisted well over an inch behind the punch-down block." },
  emi:            { how: "bend",   harm: "pose",
                    say: "The route goes right around the ceiling void rather than across it." },
  longrun:        { how: "bend",   harm: "pose",
                    say: "The route goes right around the ceiling void rather than across it." },
  bendradius:     { how: "bend",   harm: "pose",
                    say: "The route goes right around the ceiling void rather than across it, and is pulled tighter than its bend radius on the way." },

  /* ---- networking ----
     One of seventeen. Every other note on this track says the adapter is
     fitted and enabled with its link light lit, or that the switch port is
     steady green — because the fault is in what the machine believes, and
     ipconfig is where that lives. A cable a chair has been parked on is the
     one thing here you find by looking. */
  patch:          { how: "bend",   harm: "pose",
                    say: "The jacket is flattened where the chair castors have been over it, and the boot at the wall end has lost its latch." },

  /* ---- RAID ----
     The lights on the front of the carriers, which say the same thing the
     controller says. Reading them is the first thing done at a rack and it
     is worth practising; the controller table stays the authority, and the
     three faults that live on the card itself keep a clean machine because
     the card reports no errors against itself. */
  member1:        { how: "lamp",   harm: "failed",
                    say: "The carrier light on this member is lit for a failure, and the controller says the same." },
  member2:        { how: "lamp",   harm: "failed",
                    say: "The carrier light on this member is lit for a failure, and the controller says the same." },
  raid0:          { how: "lamp",   harm: "failed",
                    say: "The carrier light on this member is lit for a failure, and on this level that is the whole array." },
  predfail:       { how: "lamp",   harm: "alarm",
                    say: "The carrier light is flagging a predictive failure — still online, still serving, and reallocating sectors." },
  rebuildstall:   { how: "lamp",   harm: "alarm",
                    say: "The carrier light is flagging errors on a member that is still online, which is what is stalling the rebuild." },
  smallreplace:   { how: "lamp",   harm: "unlit",
                    say: "The carrier light is out and the controller reports the slot missing." },
  wrongslot:      { how: "lamp",   harm: "unlit",
                    say: "The carrier light is out and the controller reports the slot missing." },
  bbu:            { how: "lamp",   harm: "alarm",
                    say: "The backup unit beside the cache is flagging a failed cell and will not hold charge." },
  cachedirty:     { how: "lamp",   harm: "alarm",
                    say: "The backup unit beside the cache is flagging a failed cell, which is why the cache cannot be trusted to flush." },

  /* ---- power & safety ----
     The three outlet faults are the most important clean machines in the
     build: "there is nothing about a dangerous outlet that looks different
     from a safe one" is the lesson, and it is a safety one. The same goes
     for the supply — measured, not inspected — and for static damage, which
     never leaves a mark. */
  upsbattery:     { how: "swell",  harm: "bulge",
                    say: "The cell case is bowed. The terminals are sound and the date sticker is four years old." },
  upsselftest:    { how: "lamp",   harm: "alarm",
                    say: "The front panel is lit with the load bar high and the alarm sounding." },
  upsoverload:    { how: "lamp",   harm: "alarm",
                    say: "The front panel is lit with the load bar high and the alarm sounding." },
  surgedead:      { how: "lamp",   harm: "unlit",
                    say: "The protection light on the strip is out, so what is left is an extension lead." },
  stripchain:     { how: "lamp",   harm: "unlit",
                    say: "One strip is plugged into another and the protection light on the first one is out." },
  circuitload:    { how: "lift",   harm: "pose",
                    say: "The breaker has tripped to the middle position and is warm. It is doing exactly what it was fitted to do." },
  neutralshare:   { how: "lift",   harm: "pose",
                    say: "The breaker has tripped to the middle position and is warm, on a circuit sharing its neutral with another." },
  /* A supply that has cut out on temperature is the one supply fault on this
     track with something to look at, and what there is to look at is the
     dust. The other two supply faults stay clean on purpose.
     `upswaveform` and `bootlegground` are absent from this table for the
     same reason as the outlets above them: a healthy-looking UPS and a
     receptacle tester reading CORRECT are the entire lesson. */
  psufanseized:   { how: "foul",   harm: "dust",
                    say: "The exhaust grille is felted over and the fan behind it does not turn." },
  upsbypass:      { how: "lamp",   harm: "alarm",
                    say: "The bypass indicator on the front panel is lit, with the load bar low and no alarm." }
};

export function tellFor(faultKey) {
  return TELL[faultKey] || null;
}

/* Apply a tell to one healthy part. Returns the part unchanged when this
   fault has no physical sign, which is most of the configuration ones. */
export function damage(part, faultKey) {
  const t = tellFor(faultKey);
  if (!t) return part;
  const fn = TRANSFORM[t.how];
  if (!fn) {
    throw new Error('damage: fault "' + faultKey + '" asks for transform "' + t.how +
      '", which does not exist. Add it to TRANSFORM or fix the tell.');
  }
  const mat = HARM[t.harm];
  if (!mat) {
    throw new Error('damage: fault "' + faultKey + '" asks for damage material "' + t.harm +
      '", which does not exist. Add it to HARM or fix the tell.');
  }
  const r = fn(part.build);
  return Object.assign({}, part, {
    build: r.build,
    harm: r.harm,
    harmColor: mat.tint,
    harmFinish: mat.finish,
    /* Most damage materials are a flat tint. One of them is a photograph. */
    harmSkin: mat.skin || null,
    damaged: true
  });
}

/* Which faults on a track deliberately have no physical sign. Reported by
   the verifier so "no tell" stays a stated decision. */
export function withoutTell(faultKeys) {
  return (faultKeys || []).filter((k) => !TELL[k]);
}

/* Load-time check: every tell names a transform and a material that exist,
   and says something. A typo here would otherwise surface as one clean
   machine out of fifteen, which is exactly the kind of thing nobody
   notices until a student is marked wrong for not seeing it. */
Object.keys(TELL).forEach(function (k) {
  const t = TELL[k];
  if (!TRANSFORM[t.how]) {
    throw new Error('damage: tell "' + k + '" names transform "' + t.how +
      '", which does not exist.');
  }
  if (!HARM[t.harm]) {
    throw new Error('damage: tell "' + k + '" names damage material "' + t.harm +
      '", which does not exist.');
  }
  if (!t.say) throw new Error('damage: tell "' + k + '" has no inspection line.');
  /* A transform that adds pieces needs a material to draw them in, and a
     transform that only moves the part must not claim one — otherwise the
     two tables drift and nobody finds out until it renders. */
  if (!!POSE_ONLY[t.how] !== (t.harm === "pose")) {
    throw new Error('damage: tell "' + k + '" pairs transform "' + t.how +
      '" with material "' + t.harm + '". ' + Object.keys(POSE_ONLY).join(", ") +
      ' move the part and add nothing, so they take "pose"; every other ' +
      'transform adds pieces and needs a real material.');
  }
});
