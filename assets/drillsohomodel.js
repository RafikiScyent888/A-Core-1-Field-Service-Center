/* =====================================================================
   Field Service Center — the site plan for objective 2.6

   The other models on this page show you a thing. This one shows you a JOB,
   because 2.6 is a configure objective and there is no thing: there is a
   small business, and five decisions.

   So the plan is drawn to be COUNTED. Four of the five decisions are
   arithmetic or judgement on numbers, and every one of those numbers is on
   the plan as a countable object rather than only as a line in the brief:

     - one desk per person, laid out in rows
     - one upright cabinet per device that must keep the same address
     - one disc per device fed down its own network cable
     - one slab per phone or tablet that comes and goes
     - one radio per neighbour, on the far side of the party wall, with the
       coverage it pushes across

   Add them up and you have the number the first decision needs. Nothing on
   the plan says what the answer is; the plan is the evidence and the brief
   beside it is the requirement.

   AND THE ENTRY POINT IS DRAWN AS WHAT IT ACTUALLY IS. A threaded barrel, a
   sealed box with a hinged cover, a filtered socket, or a mast with a dish
   on the gable. That is the whole of the fourth decision, and it is a shape
   rather than a word.

   NOTHING IS LABELLED. No room names, no channel numbers, no addresses.
   ===================================================================== */

import { siteFrom } from "./drillsoho.js";

const P2 = Math.PI / 2;

/* The unit: an outer shell with the equipment room at the back-left corner,
   and the party wall on the right with somebody else's premises past it. */
const HALF_X = 8.4;
const HALF_Z = 5.2;
const WALL_H = 1.7;
const WALL_T = 0.34;

function wall(x, z, w, d, h) {
  return { shape: "box", size: [w, h || WALL_H, d], pos: [x, (h || WALL_H) / 2, z], r: 0.02, shade: 1.0 };
}

/* ---------------------------------------------------------------------
   The shell.
   --------------------------------------------------------------------- */
function shell() {
  var b = [];
  b.push(wall(0, -HALF_Z, HALF_X * 2 + WALL_T, WALL_T));
  b.push(wall(0, HALF_Z, HALF_X * 2 + WALL_T, WALL_T));
  b.push(wall(-HALF_X, 0, WALL_T, HALF_Z * 2));
  /* The party wall. Thicker than the rest, because it is shared, and
     because the whole third decision is about what comes through it. */
  b.push(wall(HALF_X, 0, WALL_T * 1.8, HALF_Z * 2));
  /* The equipment room, partitioned off at the back left. */
  b.push(wall(-5.0, -3.1, 0.28, 4.2));
  b.push(wall(-6.7, -1.0, 3.4, 0.28));
  /* A partition halfway down, with a doorway in it, so the floor reads as
     rooms rather than as one hall. */
  b.push(wall(1.6, -3.9, 0.28, 2.6));
  b.push(wall(1.6, 3.6, 0.28, 3.2));
  /* Floor edging, so the shell reads as an inside rather than as five
     loose walls standing on a board. */
  b.push({ shape: "box", size: [HALF_X * 2, 0.1, HALF_Z * 2], pos: [0, 0.05, 0], r: 0.02, shade: 0.72 });
  return b;
}

/* ---------------------------------------------------------------------
   The people, and what they carry.

   Desks are flat and in rows; the phones and tablets are small upright
   slabs. One material, two shapes — a count you can take at a glance and a
   second count you can take beside it.
   --------------------------------------------------------------------- */
/* Both layouts are lattices with a fixed pitch rather than anything clever,
   because the counts run from three to nearly thirty and the only thing that
   matters is that a student can count what is drawn. An earlier version laid
   the tablets round an arc and a busy office put nineteen of them on top of
   one another — a count you cannot take is not evidence. */
function desks(n, mobiles) {
  var out = [], i;
  for (i = 0; i < n; i++) {
    var col = i % 5, row = Math.floor(i / 5);
    var x = -6.8 + col * 1.5;
    var z = -4.2 + (row % 6) * 1.55;
    out.push({ shape: "rbox", size: [1.3, 0.42, 0.8], pos: [x, 0.31, z], r: 0.04, shade: 1.0 });
    out.push({ shape: "box", size: [0.58, 0.44, 0.07], pos: [x, 0.74, z - 0.28], r: 0.02, shade: 0.78 });
  }
  for (i = 0; i < mobiles; i++) {
    /* On the other side of the partition, where the people carrying them
       are: put down on surfaces, nowhere in particular, but countable. */
    var mc = i % 6, mr = Math.floor(i / 6);
    var mx = 2.5 + mc * 0.98;
    var mz = -2.4 + (mr % 7) * 1.08;
    out.push({ shape: "box", size: [0.3, 0.5, 0.06], pos: [mx, 0.35, mz], r: 0.03,
      rot: [0, 0.4 + (i % 3) * 0.5, 0], shade: 1.35 });
  }
  return out;
}

/* Upright cabinets along the back wall: the things that must keep the same
   address. Tall where a desk is flat. */
function fixedKit(n) {
  var out = [];
  for (var i = 0; i < n; i++) {
    var col = i % 5, row = Math.floor(i / 5);
    var x = 2.5 + col * 1.2;
    var z = -4.3 + row * 1.25;
    out.push({ shape: "rbox", size: [0.8, 1.5, 0.65], pos: [x, 0.8, z], r: 0.04, shade: 1.0 });
    out.push({ shape: "box", size: [0.56, 0.1, 0.08], pos: [x, 1.35, z + 0.36], shade: 0.66,
      repeat: { count: 3, step: [0, -0.22, 0] } });
  }
  return out;
}

/* The devices fed down their own network cable: discs, high on the walls,
   with the cable that feeds them dropping to the equipment room. */
function poeKit(n) {
  var out = [];
  for (var i = 0; i < n; i++) {
    /* Alternating along the two long walls, starting at the far one, so they
       read as mounted on something rather than floating in the room. */
    var side = i % 2 ? 1 : -1;
    var k = Math.floor(i / 2);
    var z = side * (HALF_Z - 0.55);
    /* Starting clear of the equipment room. The first cut put one inside the
       cupboard, which is the one room in the building where a ceiling radio
       would never go. */
    var x = -3.2 + k * 3.4;
    if (x > HALF_X - 1.0) x = HALF_X - 1.0;
    /* Face on to the room rather than lying flat, so a disc on a wall reads
       as mounted on it. */
    out.push({ shape: "cyl", size: [0.5, 0.14], pos: [x, WALL_H - 0.45, z], rot: [P2, 0, 0],
      seg: 20, shade: 1.0 });
    /* the one cable each, running along the wall it is on */
    /* One cable each, running up the wall it is mounted on and away along
       the top of it. Short, because it is evidence that a cable reaches it
       rather than a route worth tracing. */
    out.push({ shape: "box", size: [0.09, 0.42, 0.09], pos: [x, WALL_H - 0.14, z - side * 0.1],
      shade: 0.55 });
    out.push({ shape: "box", size: [0.62, 0.09, 0.09], pos: [x - 0.31, WALL_H - 0.02, z - side * 0.1],
      shade: 0.55 });
  }
  return out;
}

/* ---------------------------------------------------------------------
   What the provider brought, and what it lands in.

   Four entry points, four different shapes, on the same corner of the same
   outside wall every time. The fourth decision is read off this and nowhere
   else.
   --------------------------------------------------------------------- */
const ENTRY_AT = [-HALF_X + 0.1, 1.15, -4.2];

function entryPoint(kind) {
  var e = ENTRY_AT, out = [];
  if (kind === "coax") {
    out.push({ shape: "rbox", size: [0.5, 0.7, 0.7], pos: e, r: 0.04, shade: 1.0 });
    out.push({ shape: "cyl", size: [0.14, 0.5], pos: [e[0] + 0.45, e[1], e[2]], rot: [0, 0, P2],
      seg: 14, shade: 1.5, coaxBarrel: 1 });
    out.push({ shape: "torus", size: [0.16, 0.04], pos: [e[0] + 0.3, e[1], e[2]], rot: [0, 0, P2],
      seg: 12, shade: 1.5, repeat: { count: 3, step: [0.09, 0, 0] } });
  } else if (kind === "fibre") {
    out.push({ shape: "rbox", size: [0.55, 1.3, 1.0], pos: e, r: 0.05, shade: 1.0 });
    /* the cover, standing open */
    out.push({ shape: "box", size: [0.1, 0.9, 0.95], pos: [e[0] + 0.6, e[1] - 0.5, e[2] + 0.3],
      rot: [0, 0, -0.9], r: 0.02, shade: 0.8, hingedCover: 1 });
    out.push({ shape: "cyl", size: [0.1, 0.4], pos: [e[0] + 0.4, e[1] + 0.1, e[2]], rot: [0, 0, P2],
      seg: 12, shade: 1.55, fibreFerrule: 1 });
  } else if (kind === "dsl") {
    /* A small filtered socket and nothing else. The flattest thing on the
       wall, which is itself the tell. */
    out.push({ shape: "rbox", size: [0.16, 0.7, 0.9], pos: [e[0] + 0.2, e[1] - 0.2, e[2]], r: 0.03,
      shade: 1.0 });
    out.push({ shape: "box", size: [0.1, 0.24, 0.3], pos: [e[0] + 0.3, e[1] - 0.2, e[2]], r: 0.02,
      shade: 0.6, phoneSocket: 1 });
  } else {
    /* Nothing comes into the building from the street at all. It comes down
       a mast on the gable, which is drawn outside the wall. */
    out.push({ shape: "cyl", size: [0.12, 3.4], pos: [e[0] - 0.9, 1.8, e[2]], seg: 10, shade: 0.9 });
    out.push({ shape: "cyl", size: [0.75, 0.25], pos: [e[0] - 0.9, 3.3, e[2] + 0.35],
      rot: [1.1, 0, 0], seg: 24, shade: 1.0, dish: 1 });
    out.push({ shape: "cyl", size: [0.1, 0.6], pos: [e[0] - 0.9, 3.05, e[2] + 0.75], rot: [1.1, 0, 0],
      seg: 8, shade: 0.7 });
    out.push({ shape: "box", size: [0.14, 1.6, 0.14], pos: [e[0] - 0.45, 1.1, e[2]], shade: 0.75 });
  }
  return out;
}

/* The equipment in the back room: the box the service lands in, the router
   with its outside port, the switch, and the leads between them. */
function commsRoom(kind) {
  var out = entryPoint(kind);
  var sx = -6.6;
  /* the shelf */
  out.push({ shape: "box", size: [2.9, 0.14, 1.5], pos: [sx, 1.0, -3.2], r: 0.02, shade: 0.72 });
  /* the box the service lands in */
  out.push({ shape: "rbox", size: [1.0, 0.35, 0.8], pos: [sx - 0.85, 1.25, -3.2], r: 0.05, shade: 0.86 });
  /* the router, with one port drawn apart from the rest */
  out.push({ shape: "rbox", size: [1.5, 0.32, 0.9], pos: [sx + 0.7, 1.23, -3.2], r: 0.05, shade: 1.0 });
  out.push({ shape: "box", size: [0.09, 0.3, 0.22], pos: [sx + 0.16, 1.23, -2.78], shade: 1.5,
    dividerWall: 1 });
  /* the switch, under the shelf */
  out.push({ shape: "rbox", size: [2.4, 0.28, 1.0], pos: [sx, 0.42, -3.2], r: 0.03, shade: 0.78 });
  /* the lead from the entry point to the box, and from the box to the router */
  out.push({ shape: "box", size: [0.12, 0.12, 1.3], pos: [ENTRY_AT[0] + 0.5, 1.2, -3.7], shade: 0.6 });
  out.push({ shape: "box", size: [1.4, 0.12, 0.12], pos: [sx - 1.6, 1.2, -3.2], shade: 0.6 });
  out.push({ shape: "box", size: [0.5, 0.12, 0.12], pos: [sx - 0.1, 1.23, -2.78], shade: 0.6 });
  return out;
}

/* ---------------------------------------------------------------------
   The neighbours.

   One radio per busy channel, on the far side of the party wall, each with
   an arc of coverage crossing into the unit. Not labelled and not measured
   — how much is coming through is not the question. WHICH CHANNELS ARE
   TAKEN is the question, and the brief says that in words; the plan says
   how many there are and how close.
   --------------------------------------------------------------------- */
function neighbours(n) {
  var out = [];
  /* Somebody else's premises, drawn as a strip past the party wall. Without
     it the radios floated on the board with nothing round them, and "who
     else is on the air" reads very differently when the answer is standing
     in a building rather than in mid-air. */
  out.push({ shape: "box", size: [3.6, 0.1, HALF_Z * 2], pos: [HALF_X + 1.9, 0.05, 0], r: 0.02,
    shade: 0.34 });
  /* Low kerbs rather than full walls. At full height the neighbour's shell
     was a solid block of colour taller than the coverage it is supposed to
     be pushing across, which put the loudest thing in the picture in front
     of the thing worth looking at. */
  out.push({ shape: "box", size: [3.6, 0.4, WALL_T], pos: [HALF_X + 1.9, 0.2, -HALF_Z],
    r: 0.02, shade: 0.42 });
  out.push({ shape: "box", size: [3.6, 0.4, WALL_T], pos: [HALF_X + 1.9, 0.2, HALF_Z],
    r: 0.02, shade: 0.42 });
  out.push({ shape: "box", size: [WALL_T, 0.4, HALF_Z * 2], pos: [HALF_X + 3.7, 0.2, 0],
    r: 0.02, shade: 0.42 });
  for (var i = 0; i < n; i++) {
    var z = -2.6 + i * (5.2 / Math.max(n - 1, 1));
    var x = HALF_X + 1.4;
    out.push({ shape: "cyl", size: [0.45, 0.2], pos: [x, 1.35, z], seg: 18, shade: 1.5 });
    out.push({ shape: "cyl", size: [0.13, 1.3], pos: [x, 0.7, z], seg: 8, shade: 1.2 });
    /* two rings each, pushing across the party wall and drawn above it, so
       that crossing is something you can see rather than something you are
       told. */
    [2.6, 4.0].forEach(function (rad, k) {
      out.push({ shape: "torus", size: [rad, 0.085], pos: [x, WALL_H + 0.15, z], rot: [P2, 0, 0],
        seg: 44, shade: k ? 1.1 : 1.45 });
    });
  }
  return out;
}

/* ---------------------------------------------------------------------
   The model.
   --------------------------------------------------------------------- */
export function sitePlanModel(D) {
  var S = siteFrom(D);

  var entryNote = {
    coax: "A box on the outside wall with a threaded barrel on it, and a lead with a solid centre " +
      "conductor screwed onto that barrel. Nothing else on this plan is threaded.",
    fibre: "A sealed box on the outside wall with its cover standing open, and one round ferrule " +
      "inside it with a fibre on the end. Glass, not copper.",
    dsl: "The flattest thing on the wall: a small socket with a filter in it and a pair of wires " +
      "behind it. If you are looking for a box and cannot find one, that IS the observation.",
    fixedwireless: "Nothing comes into this building from the street. There is a mast on the gable " +
      "with a dish on it and one cable coming down — so what ends the service is outdoors and " +
      "above your head."
  }[S.site.service];

  return {
    kind: "drill",
    title: "One site, before anything is configured",
    caption: "The premises as surveyed, with everything on it that will want an address. Count " +
      "the desks, count the upright cabinets, count the discs high on the walls and count the " +
      "slabs lying about — that total, plus room to grow, decides how big you make the network. " +
      "Then look at the corner of the outside wall to see what the provider actually brought, and " +
      "over the party wall to see who else is already on the air.",
    board: { size: [24, 0.4, 12.6], pos: [0, -0.2, 0], color: "#39414a",
      build: [{ shape: "rbox", size: [24, 0.4, 12.6], pos: [0, 0, 0], r: 0.14, shade: 1.0 }], scale: 1 },
    parts: [
      { key: "building", label: "The premises", build: shell(), finish: "matte", scale: 1,
        pos: [0, 0, 0], color: "#8d969d",
        spec: S.site.floors > 1 ? "The ground floor of a two-storey unit" : "A single-floor unit",
        note: "One outer shell, a partitioned room at the back left with the equipment in it, and " +
          "a party wall down the right-hand side that is thicker than the others because it is " +
          "shared. Which wall is shared matters more here than the shape of the rooms." },
      { key: "desks", label: "Desks, and what people carry", build: desks(S.desks, S.mobiles),
        finish: "matte", scale: 1, pos: [0, 0, 0], color: "#3f6ea8",
        spec: S.desks + " desks, and " + S.mobiles + " devices that come and go",
        note: "Flat ones are desks and upright slabs are phones and tablets. Both want an " +
          "address; only one of them is there tomorrow. Count them separately and then add them, " +
          "because a network sized for the desks alone is a network that runs out at lunchtime." },
      { key: "fixed", label: "Must keep the same address", build: fixedKit(S.fixed),
        finish: "matte", scale: 1, pos: [0, 0, 0], color: "#a8721f",
        spec: S.fixed + " devices along the back wall",
        note: "Anything something else has to find by address rather than by asking. They are set " +
          "by hand, which means nothing else on the network knows those addresses are taken — so " +
          "where they sit in the block decides where everything else may start." },
      { key: "poe", label: "Fed down their own cable", build: poeKit(S.poe), finish: "matte",
        scale: 1, pos: [0, 0, 0], color: "#7b5ea8",
        spec: S.poe + " devices high on the walls, with one cable each",
        note: "One cable each, carrying both things they need, and no supply anywhere near them. " +
          "They are on the network like everything else, so they count — and what feeds them has " +
          "to come from somewhere, which is a decision about the switch you buy." },
      { key: "service", label: "Where the service arrives, and the equipment",
        build: commsRoom(S.site.service), finish: "matte", scale: 1, pos: [0, 0, 0],
        color: "#3e7a5c",
        spec: "The entry point on the outside wall, and the shelf in the back room",
        note: entryNote + " On the shelf: the box it lands in, the router with one port drawn " +
          "apart from the rest, and the switch under it." },
      { key: "neighbours", label: "Who else is on the air", build: neighbours(S.busyChannels.length),
        finish: "matte", scale: 1, pos: [0, 0, 0], color: "#96565b",
        spec: S.busyChannels.length + " radios past the party wall, with their coverage drawn",
        note: "Somebody else's equipment, close enough that their coverage crosses the wall. The " +
          "brief says which channels they are on. What you do about it is a choice between three " +
          "channels in that band and only three, and the gaps between those three are not a " +
          "fourth option." }
    ],
    _counts: { desks: S.desks, mobiles: S.mobiles, fixed: S.fixed, poe: S.poe,
      neighbours: S.busyChannels.length, entry: S.site.service },
    camera: { dist: 23, yaw: 0.16, pitch: 0.8, target: [0.6, 0.4, 0], min: 9, max: 46 }
  };
}
