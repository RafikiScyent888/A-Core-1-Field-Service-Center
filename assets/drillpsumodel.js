/* =====================================================================
   Field Service Center — the bench for objective 3.6

   The supply with its loom fanned out, and the bay it has to go into.

   THE LEADS ARE THE MODEL. Watts are a number on a box and a number is not
   a thing to draw; what a supply physically IS, from the point of view of
   somebody choosing one, is a set of connectors — and whether it has the
   right ones is half the objective. So every lead is drawn, at its real
   connector count, fanned out where they can be counted:

     - the wide board connector, one, always
     - the processor's own, one or two depending on the size
     - the card leads, drawn as what THIS card needs: none, one six-pin, an
       eight made of six and two, two eights on separate cables, or the
       newer dense one with its four small sense pins beside the twelve big
       ones
     - the drive leads, with several connectors along each

   THE BAY IS DRAWN TOO, at the shape this chassis takes, because the third
   decision is decided by the case and by nothing else. A supply that is
   right on every other count and three centimetres too long is a second
   delivery, and that is something to see rather than to be told.

   AND THE PARTS THE SUPPLY HAS TO FEED are drawn as a row of blocks whose
   HEIGHTS are their draw. The tallest one is the card, every time, which is
   why the card decides both the size and the connectors.

   NOTHING IS LABELLED. No wattage, no rating, no numbers anywhere.
   ===================================================================== */

import { jobFrom, HEADROOM } from "./drillpsu.js";

const P2 = Math.PI / 2;

const BOARD = { w: 16, d: 10.0 };

function box(size, pos, shade, r) {
  return { shape: "box", size: size, pos: pos, shade: shade, r: r };
}

/* The supply itself, at the shape this chassis takes.

   THE MILLIMETRES ARE THE SOURCE AND THE DRAWING FOLLOWS FROM THEM, rather
   than the other way round. These are the real published outlines, and the
   drawn size is nothing but those figures divided by a constant — so the
   reading beside the model and the shape on the bench cannot disagree, and
   a student who measures the drawing gets the same answer as one who reads
   the panel. The first draft had hand-picked proportions with the standard's
   NAME printed beside them, which is the same defect as printing the answer
   next to the rows: it made the shape decision a reading exercise instead of
   a fitting one. The name is gone; the outline is what you get. */
const MM_PER_UNIT = 34;
const CASE_MM = {
  atx:  { w: 150, h: 86,   d: 140 },
  sfx:  { w: 125, h: 63.5, d: 100 },
  tfx:  { w: 85,  h: 64,   d: 175 },
  flex: { w: 81.5, h: 40.5, d: 150 }
};
function caseDims(shapeKey) {
  var mm = CASE_MM[shapeKey] || CASE_MM.atx;
  return { w: mm.w / MM_PER_UNIT, h: mm.h / MM_PER_UNIT, d: mm.d / MM_PER_UNIT, mm: mm };
}
function outlineText(c) {
  return c.mm.w + " wide, " + c.mm.h + " tall, " + c.mm.d + " deep, in millimetres";
}

/* ---------------------------------------------------------------------
   WHERE THE FOUR THINGS SIT, worked out from the case size rather than
   fixed by hand.

   The supply's real depth runs from 100 mm to 175 mm, which is nearly a
   factor of two, and hand-placed positions that suited one shape put the
   bay's back panel through the edge of the bench on another and fanned the
   loom straight through the middle of the bay. So the bench is divided
   left to right — bay, supply, then the leads fanning into the open — and
   the load blocks take the front strip below all three. Every position
   below comes from `layout()`, so a change to a case size cannot leave a
   stale coordinate behind somewhere else in the file. */
const BENCH = { w: 16, d: 10 };

function layout(J) {
  var c = caseDims(J.shapeKey);
  var left = -BENCH.w / 2 + 0.3;
  /* The three solid things share the BACK of the bench, left to right, and
     the load chart has the front to itself. Putting the chart at the left
     instead left it tangled up behind the bay from every camera angle, and
     the whole right-hand half of the bench empty. */
  var backZ = -BENCH.d / 2 + (c.d + 0.6) / 2 + 0.35;
  var bayW = c.w + 0.98;
  var bay = { x: left + bayW / 2, z: backZ, w: bayW, d: c.d + 0.6 };
  /* the supply beside it, clear by a hand's width */
  var psu = { x: bay.x + bayW / 2 + 0.6 + c.w / 2, z: backZ };
  /* the leads fan out to the right of the supply into open bench */
  var loom = { x0: psu.x + c.w / 2, z0: psu.z, reach: 1.4 };
  /* the load chart across the front, centred on the bench rather than
     started at one end — the headroom band spans the whole row, and a row
     that starts at the left edge puts the band's own end off the bench */
  var load = { centre: 0.4, z: BENCH.d / 2 - 0.9, pitch: 1.05 };
  return { c: c, bay: bay, psu: psu, loom: loom, load: load };
}

function supplyBody(J) {
  var L = layout(J), c = L.c, out = [];
  var p = [L.psu.x, 0, L.psu.z];
  out.push({ shape: "rbox", size: [c.w, c.h, c.d], pos: [p[0], c.h / 2, p[2]], r: 0.06, shade: 1.0 });
  /* the fan, on the face a technician looks at */
  var fanD = Math.min(c.w, c.d) * 0.78;
  out.push({ shape: "cyl", size: [fanD, 0.16], pos: [p[0], c.h + 0.02, p[2]], seg: 24, shade: 0.6 });
  for (var i = 0; i < 7; i++) {
    out.push({ shape: "box", size: [fanD * 0.44, 0.1, 0.14], pos: [p[0], c.h + 0.06, p[2]],
      rot: [0, i * 0.9, 0], shade: 0.45 });
  }
  /* the inlet and the rocker on the back face */
  out.push(box([0.7, 0.6, 0.16], [p[0] - c.w / 2 + 0.7, c.h * 0.4, p[2] - c.d / 2 - 0.05], 0.5, 0.02));
  out.push(box([0.4, 0.34, 0.16], [p[0] - c.w / 2 + 1.5, c.h * 0.4, p[2] - c.d / 2 - 0.05], 0.72, 0.02));
  /* the four mounting screws, which are what have to line up */
  [-1, 1].forEach(function (sx) {
    [-1, 1].forEach(function (sy) {
      out.push({ shape: "cyl", size: [0.24, 0.12], pos: [p[0] + sx * (c.w / 2 - 0.35),
        c.h / 2 + sy * (c.h / 2 - 0.35), p[2] - c.d / 2 - 0.02], rot: [P2, 0, 0], seg: 8,
        shade: 0.55, psuScrew: 1 });
    });
  });
  return out;
}

/* ---------------------------------------------------------------------
   The loom. Every lead, at its real connector count, fanned out.
   --------------------------------------------------------------------- */
function lead(fromX, fromZ, toX, toZ, y, thick) {
  var dx = toX - fromX, dz = toZ - fromZ;
  return { shape: "box", size: [Math.hypot(dx, dz), thick || 0.16, thick || 0.16],
    pos: [(fromX + toX) / 2, y, (fromZ + toZ) / 2], rot: [0, -Math.atan2(dz, dx), 0],
    r: 0.05, shade: 1.0 };
}

function loom(J) {
  var L = layout(J), out = [];
  var ox = L.loom.x0, oz = L.loom.z0;
  var y = 0.2;

  /* Each lead ends in a plug drawn as a block of the real pin count, laid
     out in two rows the way a connector is. */
  function plug(x, z, pins, tag) {
    var rows = pins > 8 ? 2 : pins > 4 ? 2 : 1;
    var per = Math.ceil(pins / rows);
    var body = { shape: "rbox", size: [Math.max(per * 0.22, 0.5), 0.34, rows * 0.26 + 0.12],
      pos: [x, y + 0.1, z], r: 0.03, shade: 0.62 };
    if (tag) body[tag] = 1;
    body.pins = pins;
    out.push(body);
    for (var rI = 0; rI < rows; rI++) {
      for (var k = 0; k < per && rI * per + k < pins; k++) {
        out.push(box([0.14, 0.1, 0.14],
          [x - (per - 1) * 0.11 + k * 0.22, y + 0.28, z - (rows - 1) * 0.13 + rI * 0.26],
          1.45, 0.01));
      }
    }
  }

  /* The leads fan out to the RIGHT of the supply and nowhere else. An
     earlier version fanned them a fixed distance regardless of how deep the
     supply was, which on the long thin shapes put the widest plug over the
     edge of the bench and the rest of them inside the bay. The reach is
     taken from the supply's own right face, and the plug is placed by its
     own width so a twenty-four-pin block and a four-pin one both land
     clear. */
  var slot = 0;
  function place(pins, tag) {
    /* the fan opens FORWARD from the supply, not backwards past it: the
       supply now sits against the back of the bench, and a fan centred on it
       put half the plugs over the edge */
    var z = oz - 0.9 + slot * 0.95;
    slot++;
    var per = Math.ceil(pins / (pins > 4 ? 2 : 1));
    var wide = Math.max(per * 0.22, 0.5);
    var x = ox + L.loom.reach + wide / 2 + (slot % 2) * 0.35;
    /* clear of the supply's own face: a lead drawn from the face itself
       sweeps back into the case when it runs at an angle */
    out.push(lead(ox + 0.25, oz, x - wide / 2 - 0.1, z, y, 0.18));
    plug(x, z, pins, tag);
  }

  /* the wide board connector — one, always, and the biggest */
  place(24, "boardPlug");
  /* the processor's own — two on the larger supplies */
  place(8, "cpuPlug");
  if (J.chosen >= 750) place(8, "cpuPlug");
  /* the card leads, at exactly what this card needs */
  if (J.cardKind === "six") place(6, "cardPlug");
  if (J.cardKind === "eight") place(8, "cardPlug");
  if (J.cardKind === "double") { place(8, "cardPlug"); place(8, "cardPlug"); }
  if (J.cardKind === "twelve") place(16, "cardPlug");
  /* drive leads, with several connectors along each */
  var driveLeads = Math.max(1, Math.ceil(J.drives / 4));
  for (var i = 0; i < driveLeads; i++) place(5, "drivePlug");
  return out;
}

/* ---------------------------------------------------------------------
   The bay it has to go into, at the shape this chassis takes.
   --------------------------------------------------------------------- */
function bay(J) {
  var L = layout(J), c = L.c, out = [];
  var bx = L.bay.x, bz = L.bay.z;
  /* a three-sided opening, sized to this shape and no other */
  out.push(box([c.w + 0.5, 0.24, c.d + 0.6], [bx, 0.12, bz], 1.0, 0.03));
  out.push(box([0.24, c.h + 0.4, c.d + 0.6], [bx - c.w / 2 - 0.25, (c.h + 0.4) / 2, bz], 1.0, 0.03));
  out.push(box([0.24, c.h + 0.4, c.d + 0.6], [bx + c.w / 2 + 0.25, (c.h + 0.4) / 2, bz], 1.0, 0.03));
  out.push(box([c.w + 0.98, c.h + 0.4, 0.24], [bx, (c.h + 0.4) / 2, bz - c.d / 2 - 0.4], 1.0, 0.03));
  /* the four screw holes in the back panel, which are what have to line up */
  [-1, 1].forEach(function (sx) {
    [-1, 1].forEach(function (sy) {
      out.push({ shape: "cyl", size: [0.28, 0.3], pos: [bx + sx * (c.w / 2 - 0.35),
        (c.h + 0.4) / 2 + sy * (c.h / 2 - 0.35), bz - c.d / 2 - 0.4], rot: [P2, 0, 0], seg: 8,
        shade: 0.45, bayHole: 1 });
    });
  });
  return out;
}

/* ---------------------------------------------------------------------
   What it has to feed, drawn as a row of blocks whose heights are the draw.

   No numbers anywhere. The tallest block is the card every time it is
   fitted, which is the point: the card decides the size AND the connectors,
   and one look at this row says so.
   --------------------------------------------------------------------- */
function load(J) {
  var L = layout(J), out = [];
  var rows = [
    ["cpu", J.cpuW], ["board", J.boardW], ["memory", J.dimmW],
    ["drives", J.driveW], ["fans", J.fanW], ["card", J.cardW]
  ].filter(function (r) { return r[1] > 0; });
  var scale = 2.6 / Math.max.apply(null, rows.map(function (r) { return r[1]; }));
  var sum = rows.reduce(function (a, r) { return a + r[1]; }, 0);
  /* the headroom takes a place in the row, so the row is one block wider */
  var x0 = L.load.centre - rows.length * L.load.pitch / 2;
  rows.forEach(function (r, i) {
    var h = Math.max(r[1] * scale, 0.12);
    out.push({ shape: "rbox", size: [0.8, h, 0.8],
      pos: [x0 + i * L.load.pitch, h / 2, L.load.z], r: 0.04,
      shade: 1.0, loadBar: 1, watts: r[1] });
  });
  /* THE HEADROOM AS A BLOCK IN THE SAME ROW, at its real height: the
     percentage the specification asks for, taken on the SUM of everything to
     its left. Drawn as a flat band above the row it read as a shelf resting
     on the tallest block, which is not what headroom is and told a student
     nothing about how big it is. Standing in the row at its own height, it
     can be compared with the parts it is protecting — and on a machine with
     a card in it, it is visibly smaller than the card, which is the point
     people get wrong in both directions. */
  out.push({ shape: "rbox", size: [0.8, Math.max(sum * HEADROOM * scale, 0.12), 0.8],
    pos: [x0 + rows.length * L.load.pitch, Math.max(sum * HEADROOM * scale, 0.12) / 2, L.load.z],
    r: 0.04, shade: 0.45, headroomBand: 1 });
  return out;
}

function countTag(list, tag) { return list.filter(function (p) { return p[tag]; }).length; }

export function psuModel(D) {
  var J = jobFrom(D);
  var made = { psu: supplyBody(J), loom: loom(J), bay: bay(J), load: load(J) };
  var cardPlugs = countTag(made.loom, "cardPlug");

  return {
    kind: "drill",
    title: "One supply, its loom, and the bay it has to go in",
    caption: "The supply with every lead fanned out where it can be counted, the bay it has to " +
      "fit, and the load it has to carry drawn as a row of blocks whose heights are what each " +
      "part draws. Three of the five decisions are read straight off this: count the leads and " +
      "look at the pins on them, compare the supply's outline with the bay's, and notice which " +
      "block is tallest — because that one decides both the size and the connectors.",
    board: { size: [BOARD.w, 0.4, BOARD.d], pos: [0, -0.2, 0], color: "#3b434a",
      build: [{ shape: "rbox", size: [BOARD.w, 0.4, BOARD.d], pos: [0, 0, 0], r: 0.12, shade: 1.0 }],
      scale: 1 },
    parts: [
      { key: "supply", label: "The supply", build: made.psu, finish: "matte", scale: 1,
        pos: [0, 0, 0], color: "#6f7a82",
        spec: outlineText(caseDims(J.shapeKey)),
        note: "Shape first, and the outline is what tells you — not a label on the box. The four " +
          "screws on its back face are what have to line up with the four holes in the bay, and a " +
          "supply that is right in every other respect and too long for the chassis is a second " +
          "delivery. Note the fan face too: it has to be able to draw air and push it out, which " +
          "decides which way round it goes in." },
      { key: "loom", label: "Every lead on it", build: made.loom, finish: "matte", scale: 1,
        pos: [0, 0, 0], color: "#c8a24a",
        spec: countTag(made.loom, "boardPlug") + " board, " + countTag(made.loom, "cpuPlug") +
          " processor, " + cardPlugs + " card, " + countTag(made.loom, "drivePlug") + " drive",
        note: "Count the leads and count the pins on each. Watts are only half the decision — a " +
          "supply with the right number on the box and the wrong leads in the bag is the wrong " +
          "supply. Look particularly at the card leads: the current generation of card takes one " +
          "dense connector with four small sense pins beside the big ones, and the older sort " +
          "will not do even with an adaptor if you can avoid one." },
      { key: "bay", label: "The bay it goes in", build: made.bay, finish: "matte", scale: 1,
        pos: [0, 0, 0], color: "#4d5a66",
        spec: "Opening cut " + outlineText(caseDims(J.shapeKey)),
        note: "The case decides this one entirely, and nothing else does. Hold the outline of the " +
          "supply against the opening and check the four holes: they line up or they do not, and " +
          "no amount of headroom or correct connectors changes it. The chassis line on the parts " +
          "list is what names the machine; the opening is what has to be measured." },
      { key: "load", label: "What it has to carry", build: made.load, finish: "matte", scale: 1,
        pos: [0, 0, 0], color: "#8a6bb0",
        spec: countTag(made.load, "loadBar") + " things drawing power, plus the headroom",
        note: "One block per line on the parts list, and the height of each is what that part " +
          "draws. Notice which one is tallest — where there is a card, it is the card, every " +
          "time, and that single block decides both how big a supply you need and which leads it " +
          "has to have. The last block in the row is the headroom the specification asks for, " +
          "at its own height on the same scale as the rest — it is the part people leave out of " +
          "the sum, and seeing how big it is is the point of drawing it." }
    ],
    _cardPlugs: cardPlugs,
    _cardKind: J.cardKind,
    _bars: countTag(made.load, "loadBar"),
    _shape: J.shapeKey,
    camera: { dist: 17.5, yaw: 0.24, pitch: 0.62, target: [-0.4, 0.9, 0.4], min: 6, max: 38 }
  };
}
