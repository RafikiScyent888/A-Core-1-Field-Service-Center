/* =====================================================================
   Field Service Center — the board for objective 3.5

   The motherboard laid out flat, drawn to be COUNTED and MEASURED, because
   four of the five decisions on this objective are counts or comparisons
   taken off the board itself:

     - THE MOUNTING HOLES. How many there are is the form factor, and it is
       the one thing you can establish from across a bench. Drawn as the
       real count.
     - THE MEMORY SLOTS, drawn in their interleaved pairs with the pairs
       shaded differently — because the decision that catches everybody is
       WHICH two of four, and a board prints that pairing on itself in
       exactly this way.
     - THE EXPANSION SLOTS, drawn at their real physical lengths. A slot
       that is long and wired narrow is drawn long, because that is what it
       looks like and the whole point is that looking is not enough.
     - THE TWO POWER CONNECTORS, drawn in the two places they actually sit,
       far apart from each other. The one at the top corner is the one that
       gets missed, and it gets missed because it is nowhere near the other.

   THE SOCKET IS DRAWN AS ITS MECHANISM. A grid of pins standing up in the
   socket, or a grid of holes waiting for pins on the processor — because
   which of those it is decides which part you destroy when it goes wrong,
   and that is worth seeing rather than reading.

   NOTHING IS LABELLED. No slot numbers, no socket number, no silkscreen.
   ===================================================================== */

import { buildFrom } from "./drillbuild.js";

const P2 = Math.PI / 2;

const BOARD = { w: 16, d: 10.5 };

function box(size, pos, shade, r) {
  return { shape: "box", size: size, pos: pos, shade: shade, r: r };
}

/* ---------------------------------------------------------------------
   THE LAYOUT, AND WHY IT IS COMPUTED RATHER THAN EYEBALLED.

   The first version of this board placed each group at a fraction of the
   outline that looked about right, and at four form factors and seven slot
   counts the groups walked into each other: expansion slots ran through the
   middle of the processor socket, the memory slots ran through the wide
   power connector, and on the smallest board the loose parts sat off the end
   of the bench entirely. None of it was visible to the checks in place —
   two solids that interpenetrate have exactly the same outer bounds as two
   that sit side by side, and a browser walk cannot see geometry at all.

   So the board is divided into zones that are worked out from the outline,
   each one handing its far edge to the next, and a solid never leaves the
   zone it was given:

     rear edge  -> the shroud
     top strip  -> the processor's own power connector
     upper left -> the socket
     upper right-> the memory slots
     lower left -> the expansion slots
     lower right-> the wide power connector, then the front panel header

   `zones()` is the single place any of it is decided. If two groups ever
   collide again it is because a number here is wrong, not because six
   builders each guessed.
   --------------------------------------------------------------------- */
function outline(formKey) {
  switch (formKey) {
    case "eatx":     return { w: 10.2, d: 8.6 };
    case "atx":      return { w: 9.0,  d: 7.6 };
    case "microatx": return { w: 7.0,  d: 6.6 };
    default:         return { w: 5.4,  d: 5.4 };   // mini-ITX, square on purpose
  }
}

/* The board sits left of the bench centre by exactly the room the loose
   parts need on the right, so that a board of any size and its parts
   together are centred and neither runs off the edge. */
const PARTS_W = 4.4;                 // the widest loose part, the card
const PARTS_GAP = 0.4;
const BOARD_X = -(PARTS_GAP + PARTS_W) / 2;

function zones(B) {
  var o = outline(B.formKey);
  var hw = o.w / 2, hd = o.d / 2;

  /* the rear shroud, hard against the back edge */
  var shroud = { z0: -hd, z1: -hd + 0.35, x0: -o.w * 0.45, x1: -o.w * 0.10 };

  /* the processor's own power connector, in the strip along the top and to
     the right of the shroud — far from the wide one, which is the point */
  var cpuPwr = { x: shroud.x1 + 0.70, z: -hd + 0.45, w: 1.1, d: 0.62 };

  /* The socket, below the top strip. The proportion matters: at 0.26 of the
     short side this came out around eighty millimetres square at board
     scale, near enough twice a real socket assembly, and an oversized socket
     pushed the expansion slots so far down the board that seven of them no
     longer fitted between it and the bottom edge. Everything below inherits
     this number, so it is the one to check first if the layout ever goes
     tight again. */
  var s = Math.min(o.w, o.d) * 0.17;
  var frame = s + 0.5;
  var sock = { x: -o.w * 0.12, z: -hd + 0.35 + frame / 2 + 0.55, s: s, frame: frame };
  /* how far down the board the socket's mechanism actually reaches: the
     lever and the retention arm stand proud of the frame on that side */
  sock.z1 = sock.z + s / 2 + 0.45;

  /* the wide power connector, down the right-hand edge and low */
  var pinD = Math.min(2.4, o.d * 0.38);
  /* Held a full width in from the edge, and the memory block with it, so the
     ring of mounting holes has somewhere to go down the right-hand side. Hard
     against the edge they left the ring with nowhere free but the top and the
     left, and nine holes bunched along two edges is a count nobody can take
     from a single view — which is the whole of the first decision. */
  var pin24 = { x: hw - 1.25, z: hd - 0.35 - pinD / 2, w: 0.7, d: pinD };
  pin24.z0 = pin24.z - pinD / 2;

  /* the memory slots, in the upper right, between the mounting holes along
     the top edge and the wide connector below them. Latches stand 0.27
     beyond the slot body at each end and are counted here, not discovered
     later by a bounds check. */
  var LATCH = 0.27;
  var mz0 = -hd + 1.0 + LATCH, mz1 = pin24.z0 - 0.3 - LATCH;
  var mDepth = Math.min(o.d * 0.40, mz1 - mz0);
  /* The block is RIGHT-ALIGNED against the mounting-hole ring and grows
     leftwards, rather than starting at a fraction of the width and running
     right until it hits something. Started from the left it collided with
     the ring on every four-slot board, and the pitch that avoided it was so
     narrow the slots stopped reading as slots. */
  var dPitch = 0.55;
  var dRight = hw - 1.25;
  var dLeft = dRight - (B.slots - 1) * dPitch;
  /* if that would reach the socket, close the pitch up rather than move into it */
  var sockRight = sock.x + frame / 2 + 0.5;
  if (dLeft < sockRight) {
    dPitch = Math.max(0.24, (dRight - sockRight) / Math.max(B.slots - 1, 1));
    dLeft = dRight - (B.slots - 1) * dPitch;
  }
  var dimm = { x0: dLeft, z: mz0 + mDepth / 2, depth: mDepth, latch: LATCH, pitch: dPitch };

  /* the front panel header, along the bottom edge and left of the wide one */
  var head = { x: hw - 2.4, z: hd - 0.45, w: 1.3, d: 0.4 };

  /* the expansion slots: everything below the socket, stopping short of the
     header row, and never reaching the wide power connector */
  var exp = {
    xLeft: -hw + 0.75,
    xLimit: pin24.x - pin24.w / 2 - 0.25,
    z0: sock.z1 + 0.5,
    /* short of the bottom edge, which belongs to the mounting holes */
    z1: hd - 1.25
  };
  /* On a narrow board the longest slot reaches under the memory block. The
     answer is to start the slots BELOW the memory rather than to shorten
     them: a sixteen-lane slot cut down to clear the memory ends up the same
     length as an eight, and the whole of the third decision is that the
     length you can see is not the same as the width it is wired to. */
  var dimmBottom = dimm.z + mDepth / 2 + LATCH;
  var expReach = exp.xLeft + 4.0;
  if (expReach > dimm.x0 - dPitch / 2) exp.z0 = Math.max(exp.z0, dimmBottom + 0.45);

  /* THE MOUNTING HOLES GO WHERE NOTHING ELSE IS. An inset ring alone is not
     enough — every connector on this board hugs an edge, so a naive ring
     runs straight through the wide power connector and the panel header. So
     the ring is generated finely and then every candidate standing on ground
     already spoken for is dropped. A hole drawn under a socket or a
     connector is not a cosmetic slip: it is a standoff under a socket, which
     is the short circuit the note beside this part warns about. */
  var reserved = [
    [shroud.x0, shroud.x1, shroud.z0, shroud.z1],
    [cpuPwr.x - cpuPwr.w / 2, cpuPwr.x + cpuPwr.w / 2,
      cpuPwr.z - cpuPwr.d / 2, cpuPwr.z + cpuPwr.d / 2],
    [sock.x - frame / 2, sock.x + frame / 2 + 0.6, sock.z - frame / 2, sock.z1],
    [dimm.x0 - dPitch / 2, dRight + dPitch / 2,
      dimm.z - mDepth / 2 - LATCH, dimm.z + mDepth / 2 + LATCH],
    [pin24.x - pin24.w / 2, pin24.x + pin24.w / 2, pin24.z - pinD / 2, pin24.z + pinD / 2],
    [head.x - head.w / 2, head.x + head.w / 2, head.z - head.d / 2, head.z + head.d / 2],
    [exp.xLeft, exp.xLimit, exp.z0 - 0.25, exp.z1 + 0.25]
  ];
  var ring = { inset: 0.55, reserved: reserved };

  return { o: o, hw: hw, hd: hd, shroud: shroud, cpuPwr: cpuPwr, sock: sock,
    pin24: pin24, dimm: dimm, head: head, exp: exp, ring: ring };
}

/* ---------------------------------------------------------------------
   The board itself, and its mounting holes.
   --------------------------------------------------------------------- */
function boardPlate(B) {
  var Z = zones(B), o = Z.o, out = [];
  /* `seat` marks the one solid every other part is MEANT to sit into. Without
     it a collision check reports all six groups as running through the board,
     which is true of the arithmetic and false of the thing being drawn. */
  out.push({ shape: "rbox", size: [o.w, 0.2, o.d], pos: [0, 0.1, 0], r: 0.06, shade: 1.0,
    seat: 1 });
  /* The rear panel shroud along the back edge, which is the other thing that
     says which way round a board goes in. */
  var sh = Z.shroud;
  out.push(box([sh.x1 - sh.x0, 0.7, sh.z1 - sh.z0], [(sh.x0 + sh.x1) / 2, 0.45,
    (sh.z0 + sh.z1) / 2], 0.72, 0.03));

  /* The mounting holes, at the real count for this form factor, walked round
     an inset ring. Counting them is how a technician establishes the form
     factor, so the count drawn is the count the content claims and a test
     asserts it. */
  var n = B.form.holes;
  var i, hx = Z.hw - Z.ring.inset, hz = Z.hd - Z.ring.inset;
  var HOLE_R = 0.2, CLEAR = 0.1;

  /* walk the ring finely, then keep only the ground nothing else is standing on */
  var ring = [], STEPS = 15;
  for (i = 0; i < STEPS; i++) ring.push([-hx + (2 * hx) * (i / STEPS), -hz]);
  for (i = 0; i < STEPS; i++) ring.push([hx, -hz + (2 * hz) * (i / STEPS)]);
  for (i = 0; i < STEPS; i++) ring.push([hx - (2 * hx) * (i / STEPS), hz]);
  for (i = 0; i < STEPS; i++) ring.push([-hx, hz - (2 * hz) * (i / STEPS)]);

  var free = ring.filter(function (p) {
    return !Z.ring.reserved.some(function (r) {
      return p[0] + HOLE_R + CLEAR > r[0] && p[0] - HOLE_R - CLEAR < r[1] &&
             p[1] + HOLE_R + CLEAR > r[2] && p[1] - HOLE_R - CLEAR < r[3];
    });
  });
  /* Spread the count evenly over what is left, rather than taking the first
     n — otherwise a nine-hole board ends up with every hole along one edge
     and the count stops reading as a form factor. */
  var used = [];
  for (i = 0; i < n && free.length; i++) {
    var p = free[Math.round(i * free.length / n) % free.length];
    /* two holes on the same spot would make the count a lie */
    if (used.some(function (q) { return Math.hypot(q[0] - p[0], q[1] - p[1]) < 0.5; })) {
      p = free.filter(function (c) {
        return !used.some(function (q) { return Math.hypot(q[0] - c[0], q[1] - c[1]) < 0.5; });
      })[0];
      if (!p) break;
    }
    used.push(p);
    out.push({ shape: "cyl", size: [0.4, 0.32], pos: [p[0], 0.16, p[1]], seg: 12, shade: 0.5,
      mountHole: 1 });
  }
  return out;
}

/* ---------------------------------------------------------------------
   The socket, drawn as the mechanism it is.
   --------------------------------------------------------------------- */
function socket(B) {
  var Z = zones(B), out = [];
  var sx = Z.sock.x, sz = Z.sock.z, s = Z.sock.s;
  /* the frame, and the lever that holds the load plate down */
  out.push(box([s + 0.5, 0.24, s + 0.5], [sx, 0.32, sz], 1.0, 0.03));
  out.push({ shape: "cyl", size: [0.16, s + 0.9], pos: [sx, 0.42, sz + s / 2 + 0.35],
    rot: [0, 0, P2], seg: 8, shade: 0.7 });
  out.push(box([0.34, 0.24, 0.9], [sx + s / 2 + 0.45, 0.42, sz + s / 2 + 0.1], 0.7, 0.03));

  /* Pins standing up in the socket, or holes waiting for pins on the
     processor. Which of the two it is decides which part gets destroyed
     when somebody forces it, so it is drawn rather than described. */
  var land = /land grid/.test(B.holds.name);
  var g = 7, step = s / g;
  for (var i = 0; i < g; i++) {
    for (var j = 0; j < g; j++) {
      var px = sx - s / 2 + step * (i + 0.5), pz = sz - s / 2 + step * (j + 0.5);
      if (land) {
        out.push({ shape: "cyl", size: [step * 0.3, 0.22], pos: [px, 0.45, pz], seg: 6,
          shade: 1.45, socketPin: 1 });
      } else {
        out.push({ shape: "cyl", size: [step * 0.44, 0.16], pos: [px, 0.3, pz], seg: 6,
          shade: 0.32, socketHole: 1 });
      }
    }
  }
  return out;
}

/* ---------------------------------------------------------------------
   The memory slots, in their interleaved pairs.

   The pairing is drawn as two tones, alternating — which is exactly how a
   board prints it on itself, and it is the whole of the decision that
   catches people out. Slot one is nearest the processor.
   --------------------------------------------------------------------- */
function dimms(B) {
  var Z = zones(B), d = Z.dimm, out = [];
  for (var i = 0; i < B.slots; i++) {
    var x = d.x0 + i * d.pitch;
    /* Alternating tone: slots 1 and 3 are one channel, 2 and 4 the other,
       and the pair to fill with two modules is the second and the fourth. */
    var shade = (i % 2) ? 1.4 : 0.62;
    out.push(box([d.pitch * 0.5, 0.36, d.depth], [x, 0.38, d.z], shade, 0.02));
    /* the latch at each end */
    [-1, 1].forEach(function (sz2) {
      out.push(box([d.pitch * 0.5, 0.5, 0.3], [x, 0.45, d.z + sz2 * (d.depth / 2 + 0.12)],
        shade, 0.03));
    });
  }
  return out;
}

/* ---------------------------------------------------------------------
   The expansion slots, at their real physical lengths.

   A slot wired to four lanes but sixteen long is drawn sixteen long. That
   is what it looks like on a board, and the point of the question is that
   looking at the length is not enough.
   --------------------------------------------------------------------- */
function expansion(B) {
  var Z = zones(B), e = Z.exp, out = [];
  var n = B.lanes.length;
  var span = e.z1 - e.z0;
  var pitch = n > 1 ? span / (n - 1) : 0;
  var room = e.xLimit - e.xLeft;
  for (var i = 0; i < n; i++) {
    var s = B.lanes[i];
    var len = (s.len === 16 ? 4.0 : s.len === 8 ? 2.4 : s.len === 4 ? 1.6 : 0.8);
    /* a slot never reaches the wide power connector; on the smallest board
       that shortens the longest slot, and it stays the longest */
    len = Math.min(len, room - 0.35);
    var z = e.z0 + i * pitch;
    var body = box([len, 0.34, 0.34], [e.xLeft + len / 2, 0.37, z], 1.0, 0.02);
    /* Tagged here rather than by guessing from the geometry afterwards. An
       earlier version identified slot bodies by their dimensions and then
       wrote the index onto whatever happened to be last in the array, which
       was the retention tab. */
    body.expSlot = 1; body.slotNo = i + 1; body.wired = s.wired; body.physical = s.len;
    out.push(body);
    /* the retention tab at the far end of any slot long enough to have one */
    if (s.len >= 4) {
      out.push(box([0.24, 0.42, 0.3], [e.xLeft + len + 0.1, 0.41, z], 0.62, 0.03));
    }
  }
  return out;
}

/* ---------------------------------------------------------------------
   The two power connectors, in the two places they actually are.

   Far apart, because that is why one of them gets missed. Plus the front
   panel header, which is the third thing that has to be connected and the
   fiddliest.
   --------------------------------------------------------------------- */
function power(B) {
  var Z = zones(B), out = [], i;
  /* The wide one, down the right-hand edge. */
  var p = Z.pin24;
  out.push(box([p.w, 0.6, p.d], [p.x, 0.5, p.z], 1.0, 0.03));
  var rows = 6, rowGap = (p.d - 0.5) / (rows - 1);
  for (i = 0; i < 12; i++) {
    out.push(box([0.22, 0.1, 0.16], [p.x + (i % 2 ? 0.18 : -0.18), 0.78,
      p.z - (p.d - 0.5) / 2 + Math.floor(i / 2) * rowGap], 0.5, 0.01));
  }
  /* The processor's own, at the top of the board and nowhere near the other
     one. Tagged, because "both connectors exist and they are far apart" is
     the whole of the fourth question. */
  var c = Z.cpuPwr;
  out.push({ shape: "box", size: [c.w, 0.6, c.d], pos: [c.x, 0.5, c.z],
    r: 0.03, shade: 1.0, cpuPower: 1 });
  for (i = 0; i < 8; i++) {
    out.push(box([0.18, 0.1, 0.18], [c.x - 0.39 + (i % 4) * 0.26, 0.78,
      c.z - 0.15 + Math.floor(i / 4) * 0.3], 0.5, 0.01));
  }
  /* The front panel header, along the bottom edge. */
  var h = Z.head;
  out.push({ shape: "box", size: [h.w, 0.34, h.d], pos: [h.x, 0.37, h.z],
    r: 0.02, shade: 0.7, panelHeader: 1 });
  for (i = 0; i < 10; i++) {
    out.push(box([0.08, 0.24, 0.08], [h.x - 0.48 + (i % 5) * 0.24, 0.5,
      h.z - 0.1 + Math.floor(i / 5) * 0.2], 1.4, 0.01));
  }
  return out;
}

/* ---------------------------------------------------------------------
   The parts waiting to be fitted, off to one side of the board.
   --------------------------------------------------------------------- */
function parts(B) {
  var Z = zones(B), out = [];
  /* clear of the board's right edge by the gap the bench was sized for */
  var px = Z.hw + PARTS_GAP + PARTS_W / 2;
  /* the processor, face up, with its own pads or pins */
  var land = /land grid/.test(B.holds.name);
  out.push({ shape: "rbox", size: [1.8, 0.16, 1.8], pos: [px, 0.18, -2.4], r: 0.04, shade: 1.0 });
  var g = 6, step = 1.4 / g;
  for (var i = 0; i < g; i++) {
    for (var j = 0; j < g; j++) {
      var cx = px - 0.7 + step * (i + 0.5), cz = -2.4 - 0.7 + step * (j + 0.5);
      if (land) {
        out.push(box([step * 0.6, 0.05, step * 0.6], [cx, 0.28, cz], 1.4, 0.005));
      } else {
        out.push({ shape: "cyl", size: [step * 0.3, 0.2], pos: [cx, 0.08, cz], seg: 6, shade: 1.4,
          cpuPin: 1 });
      }
    }
  }
  /* the memory modules that turned up, stacked */
  for (i = 0; i < B.modules; i++) {
    out.push({ shape: "rbox", size: [3.4, 0.16, 0.5], pos: [px, 0.14 + i * 0.24, 0.2],
      r: 0.03, shade: 0.66, modulePart: 1 });
  }
  /* the card, if there is one, at its real edge-connector length */
  if (B.needsCard) {
    var len = (B.cardWants === 16 ? 4.0 : B.cardWants === 8 ? 2.4 : B.cardWants === 4 ? 1.6 : 0.8);
    out.push({ shape: "rbox", size: [PARTS_W, 0.16, 1.8], pos: [px, 0.2, 3.0], r: 0.03, shade: 0.5 });
    out.push({ shape: "box", size: [len, 0.24, 0.34], pos: [px - PARTS_W / 2 + len / 2, 0.2, 2.2],
      r: 0.02, shade: 1.45, cardEdge: 1 });
  }
  return out;
}

function countTag(list, tag) { return list.filter(function (p) { return p[tag]; }).length; }

/* Everything above is authored with the board's own centre at the origin,
   which is the only way six builders can share one set of zones. The whole
   assembly then slides left by exactly the room the loose parts take on the
   right, so that a board of any size and its parts together sit centred on
   the bench. Doing it here, once, is why no builder has to know about the
   bench at all. */
function slid(list) {
  return list.map(function (p) {
    var q = {}; for (var k in p) if (p.hasOwnProperty(k)) q[k] = p[k];
    q.pos = [p.pos[0] + BOARD_X, p.pos[1], p.pos[2]];
    return q;
  });
}

export function boardModel(D) {
  var B = buildFrom(D);
  var made = {
    plate: slid(boardPlate(B)), sock: slid(socket(B)), dimm: slid(dimms(B)),
    exp: slid(expansion(B)), pwr: slid(power(B)), part: slid(parts(B))
  };
  var land = /land grid/.test(B.holds.name);

  return {
    kind: "drill",
    title: "One board, and the parts that turned up for it",
    caption: "The board laid flat with the parts beside it. Almost every decision here is a count " +
      "or a comparison you take off this picture: how many mounting holes, how many memory slots " +
      "and which of them are paired, how long each expansion slot is, and where the two power " +
      "connectors are — because they are nowhere near each other and that is why one of them gets " +
      "missed. Look at the socket before anything else.",
    board: { size: [BOARD.w, 0.4, BOARD.d], pos: [0, -0.2, 0], color: "#3b434a",
      build: [{ shape: "rbox", size: [BOARD.w, 0.4, BOARD.d], pos: [0, 0, 0], r: 0.12, shade: 1.0 }],
      scale: 1 },
    parts: [
      { key: "plate", label: "The board and its mounting holes", build: made.plate, finish: "matte",
        scale: 1, pos: [0, 0, 0], color: "#1f6b4a",
        spec: countTag(made.plate, "mountHole") + " mounting holes",
        note: "Count the holes. That count IS the form factor, and it is the one thing you can " +
          "establish from the other side of a bench — it decides which chassis the board goes in " +
          "and which standoffs have to be in place before it does. A standoff under a board " +
          "where there is no hole is a short circuit." },
      { key: "socket", label: "The socket, and how it holds", build: made.sock, finish: "matte",
        scale: 1, pos: [0, 0, 0], color: "#8a6bb0",
        spec: land ? "Pins standing in the socket" : "Holes in the socket, waiting for pins",
        note: "Look at which side the pins are on before you open anything. If they are standing " +
          "up in the socket, the fragile part is the BOARD and a bent one makes it scrap. If the " +
          "socket has holes, the fragile part is the processor. Either way the answer is the " +
          "same — it drops in under its own weight and the lever does the rest — but knowing " +
          "which part you are about to destroy changes how carefully you move." },
      { key: "dimms", label: "The memory slots", build: made.dimm, finish: "matte", scale: 1,
        pos: [0, 0, 0], color: "#c8a24a",
        spec: B.slots + " slots, in alternating pairs",
        note: "The two tones are the two channels, and they alternate — which is how a board " +
          "prints its own pairing. Slot one is nearest the processor. With two modules in four " +
          "slots the pair to fill is one of each tone, and the machine will run perfectly if you " +
          "get it wrong: at half the memory bandwidth, silently, for the rest of its life." },
      { key: "expansion", label: "The expansion slots", build: made.exp, finish: "matte", scale: 1,
        pos: [0, 0, 0], color: "#2f5fbf",
        spec: B.lanes.length + " slots, drawn at their real lengths",
        note: "Length is what you can see; width is what you cannot. A slot drawn full length may " +
          "be wired to a quarter of the lanes, and a card in it works perfectly and runs slower " +
          "with nothing anywhere warning you. The delivery note gives the card's length; the " +
          "board's manual gives the wiring, and both numbers matter." },
      { key: "power", label: "Where power comes in", build: made.pwr, finish: "matte", scale: 1,
        pos: [0, 0, 0], color: "#a8623f",
        spec: "Two connectors, plus the header for the front of the case",
        note: "Two connectors, and look how far apart they are. The wide one is down the edge " +
          "where you cannot miss it; the processor's own is at the top corner, on its own, behind " +
          "wherever the cooler ends up. That distance is the entire reason it is the connector " +
          "that gets left off — and a machine with it left off is completely silent." },
      { key: "parts", label: "What turned up in the box", build: made.part, finish: "matte",
        scale: 1, pos: [0, 0, 0], color: "#6d7d8c",
        spec: B.modules + " modules, one processor" + (B.needsCard ? ", one card" : ", no card"),
        note: "The parts as delivered, beside the board they are meant for. Compare before you " +
          "unwrap: the processor against the socket, the number of modules against the number of " +
          "slots, and the card's edge connector against the slots it might go in." }
    ],
    _holes: countTag(made.plate, "mountHole"),
    _dimms: B.slots,
    _slots: countTag(made.exp, "expSlot"),
    _land: land,
    _cpuPower: countTag(made.pwr, "cpuPower"),
    camera: { dist: 19.5, yaw: 0.2, pitch: 0.82, target: [1.4, 0.3, 0], min: 7, max: 40 }
  };
}
