/* =====================================================================
   Field Service Center — the host model for objectives 4.1 and 4.2

   The last track to get a model, and the one that most nearly did not,
   because "explain virtualization concepts" has no object in it. A rendered
   box with CLOUD written on the side would be decoration, and this build
   already refused to do that once, on 2.1.

   But there IS something physical here, and it is the whole idea:

     A HOST IS A BOX WITH A FIXED AMOUNT OF STUFF IN IT, AND VIRTUALIZATION
     IS THE ACT OF PROMISING THAT STUFF TO SEVERAL MACHINES AT ONCE.

   So the model is that sentence, drawn. On the left, the machine with its
   lid off: memory modules standing in their slots, countable, and two
   processors under their heatsinks. That is what the host HAS. On the right,
   lanes — memory, processors, and three for storage — with a GATE part way
   down each one marking what the host owns. Into each lane go the blocks
   that have been promised: the hypervisor's own reservation first, because
   forgetting it is the commonest way a capacity plan comes out wrong, and
   then one block per guest.

   Blocks that stop before the gate are promises the host can keep. Blocks
   that run out past it are promises it cannot. That is oversubscription, and
   it is the only thing on this track that is genuinely spatial.

   The gate MOVES, and that is deliberate. A lane scaled to the hardware
   would have been unreadable on the one ticket that matters most: a host
   committed at nine times its physical cores would have put eight ninths of
   the answer somewhere off the end of the bench. Scaling each lane to the
   larger of what is owned and what is promised keeps the whole picture on
   the board and keeps the reading identical — the gate is the hardware,
   wherever it happens to fall.

   Two consequences worth stating, because they are the teaching rather than
   side effects of the drawing:

   1. On thirteen of the seventeen tickets, EVERYTHING FITS. The model shows
      a host doing exactly what it was told, with room to spare — and that is
      the answer, because those faults are a licence, a region, a quota or a
      snapshot and none of them is in this box. A student who has learned to
      look here first learns here that the box is usually not the problem.

   2. The physical half exists to be the wrong answer. "Host hardware",
      "more processors", "a failed datastore" are the reflexes this track's
      own fault data names, and all three are drawn, in front of the student,
      countable and intact.

   Same rule as every other model in the build: colour says what a part IS.
   The memory modules and the memory promised out of them share a hue because
   they are the same resource, one physical and one promised; nothing is
   tinted for being at fault, and nothing is labelled.
   ===================================================================== */

const P2 = Math.PI / 2;

/* Every lane is drawn LANE units long whatever the host's real numbers are,
   because what is being read is a RATIO — how much of it is spoken for — and
   not an absolute in gigabytes. The panel beside the model states the
   absolutes. */
const LANE = 11;
const LANE_X = -0.5;              // where every lane starts
const RAM_Z = -2.6;
const CPU_Z = 0.8;
const DS_Z = 4.0;                 // first datastore lane; the others step back
const DS_STEP = 1.5;

/* One lane's apparatus: a floor to lay blocks on, a back plate, and a gate
   marking what the host actually owns.

   The lane is always the same length on screen and it represents THE LARGER
   OF what the host has and what has been promised — so the gate slides back
   down the lane as the over-promise grows, instead of the blocks running off
   the end of the board. That matters: on a badly over-committed host the
   promise is seven times the hardware, and a lane scaled to the hardware
   would have put six-sevenths of the answer somewhere off the bench where
   nobody could see it. Scaled this way the picture is always on the board
   and always says the same thing — blocks before the gate are promises the
   host can keep, blocks past it are not.

   The gate is two posts and a crossbar rather than a solid wall, so a block
   that does not fit runs THROUGH it in plain sight instead of disappearing
   into a slab of opaque geometry. */
function laneRig(z, gateAt, depth) {
  var d = depth || 2.4;
  var out = [
    { shape: "box", size: [LANE + 0.4, 0.18, d], pos: [LANE_X + LANE / 2 - 0.2, 0.09, z], r: 0.02, shade: 1.0 },
    { shape: "box", size: [LANE + 0.4, 0.62, 0.22], pos: [LANE_X + LANE / 2 - 0.2, 0.4, z - d / 2 - 0.1], r: 0.02, shade: 0.8 },
    { shape: "box", size: [0.24, 0.66, d], pos: [LANE_X - 0.32, 0.42, z], r: 0.02, shade: 0.8 }
  ];
  /* Quarter marks measured against what the host OWNS, not against the
     drawn length, so the marks stay meaningful when the gate moves. */
  for (var q = 1; q <= 3; q++) {
    out.push({ shape: "box", size: [0.07, 0.05, d * 0.8], pos: [LANE_X + gateAt * q / 4, 0.2, z], shade: 1.5 });
  }
  return out;
}

/* The gate is drawn separately from the lane it stands in, because it needs
   a colour of its own rather than a multiplier on the apparatus. The first
   cut brightened the near-black rig colour to make the posts stand out; a
   near-black multiplied is still dark, and the single most important feature
   in the picture was invisible on a page built for damaged sight. */
function laneGate(z, gateAt, depth) {
  var d = depth || 2.4;
  return [
    { shape: "box", size: [0.32, 1.5, 0.32], pos: [LANE_X + gateAt, 0.75, z - d / 2 + 0.16], r: 0.03, shade: 1.0 },
    { shape: "box", size: [0.32, 1.5, 0.32], pos: [LANE_X + gateAt, 0.75, z + d / 2 - 0.16], r: 0.03, shade: 1.0 },
    { shape: "box", size: [0.32, 0.3, d], pos: [LANE_X + gateAt, 1.38, z], r: 0.03, shade: 0.86 }
  ];
}

/* A lane's arithmetic, in one place so the rig and the blocks cannot
   disagree about where the gate goes. */
function laneScale(physical, promised) {
  var total = Math.max(physical, promised) || 1;
  return { unit: LANE / total, gate: (physical / total) * LANE, fits: promised <= physical };
}

/* Lay a run of blocks end to end down a lane. Returns the blocks and how far
   past the gate the last one got, which the caption never states and the
   geometry always shows. */
function layBlocks(items, unitsPer, z, depth, y, h) {
  var out = [], x = LANE_X + 0.1;
  items.forEach(function (it) {
    var len = Math.max(0.18, it.amount * unitsPer);
    out.push({
      shape: "rbox", size: [len - 0.12, h, depth], pos: [x + len / 2, y, z], r: 0.04,
      shade: it.shade, block: 1
    });
    /* The hypervisor's own reservation is stepped rather than plain, so it
       is told apart by SHAPE and not only by tone — the one block in the
       lane that is not a guest, and the one people forget. */
    /* The remainder is ribbed rather than smooth: it is not a guest and it
       must not be counted as one. Shape, again, rather than tone alone. */
    if (it.ribbed) {
      var ribs = Math.max(2, Math.min(24, Math.round(len / 0.45)));
      out.push({ shape: "box", size: [0.1, h * 0.5, depth * 0.8],
        pos: [x + 0.35, y + h * 0.34, z], shade: it.shade * 2.1,
        repeat: { count: ribs, step: [Math.max(0.3, (len - 0.7) / Math.max(1, ribs - 1)), 0, 0] } });
    }
    if (it.stepped) {
      out.push({ shape: "rbox", size: [len - 0.4, h * 0.55, depth * 0.62],
        pos: [x + len / 2, y + h * 0.72, z], r: 0.04, shade: it.shade });
    }
    x += len;
  });
  return { build: out, end: x - LANE_X };
}

/* How many 16GB modules a host of this size is built from, and how many
   slots the board has for them. Countable on the model, which is the point:
   "the host has 128GB" stops being a number in a table. */
const MODULE_GB = 16;
const SLOTS = 16;

export function hostModel(G) {
  var h = G.host;
  var guests = h.guests;

  /* ---- the machine, lid off ------------------------------------------ */
  var HX = -9.0, HZ = 0.4;
  var host = [
    /* A tray rather than a closed box. The walls are deliberately low: a 2U
       chassis drawn at full height hid its own contents from every camera
       angle a student can reach, and the contents are the exercise. */
    { shape: "box", size: [9.8, 0.22, 9.0], pos: [HX, 0.11, HZ], r: 0.03, shade: 1.0 },
    { shape: "box", size: [9.8, 0.6, 0.26], pos: [HX, 0.4, HZ + 4.37], r: 0.02, shade: 0.86 },
    { shape: "box", size: [9.8, 0.6, 0.26], pos: [HX, 0.4, HZ - 4.37], r: 0.02, shade: 0.86 },
    { shape: "box", size: [0.26, 0.6, 9.0], pos: [HX - 4.77, 0.4, HZ], r: 0.02, shade: 0.86 },
    { shape: "box", size: [0.26, 0.6, 9.0], pos: [HX + 4.77, 0.4, HZ], r: 0.02, shade: 0.86 },
    /* The board it is all screwed to. */
    { shape: "box", size: [8.9, 0.1, 8.0], pos: [HX, 0.27, HZ], r: 0.02, shade: 0.72 },
    /* Rack ears, so it reads as a machine that lives in a rack rather than
       a tray on a bench. */
    { shape: "box", size: [0.5, 0.5, 0.9], pos: [HX - 5.1, 0.4, HZ + 4.0], r: 0.02, shade: 0.9 },
    { shape: "box", size: [0.5, 0.5, 0.9], pos: [HX + 5.1, 0.4, HZ + 4.0], r: 0.02, shade: 0.9 },
    /* Four drive caddies across the front face, and the ports beside them. */
    { shape: "box", size: [1.7, 0.44, 0.16], pos: [HX - 3.2, 0.4, HZ + 4.52], r: 0.02, shade: 0.66,
      repeat: { count: 4, step: [1.85, 0, 0] } },
    { shape: "box", size: [0.34, 0.22, 0.1], pos: [HX + 4.2, 0.44, HZ + 4.55], r: 0.01, shade: 0.5 },
    { shape: "cyl", size: [0.13, 0.08], pos: [HX + 4.2, 0.24, HZ + 4.55], rot: [P2, 0, 0], seg: 10, shade: 1.5 }
  ];

  /* The memory sockets: all sixteen of them, whether or not there is a
     module in one. An empty socket is a fact about this host and it is the
     start of every upgrade conversation, so it is drawn. */
  var slotX = function (i) { return HX - 4.05 + (i < 8 ? i * 0.5 : 0.9 + i * 0.5); };
  for (var i = 0; i < SLOTS; i++) {
    host.push({ shape: "box", size: [0.34, 0.24, 2.5], pos: [slotX(i), 0.44, HZ + 1.6], r: 0.02, shade: 0.55 });
  }

  /* ---- what the host physically has ---------------------------------- */
  var fitted = Math.max(1, Math.min(SLOTS, Math.round(h.ramGb / MODULE_GB)));
  var dimms = [];
  for (var m = 0; m < fitted; m++) {
    dimms.push({ shape: "box", size: [0.17, 1.15, 2.3], pos: [slotX(m), 1.12, HZ + 1.6], r: 0.02, shade: 1.0 });
    /* A notch and a label strip, so a module reads as a module. */
    dimms.push({ shape: "box", size: [0.19, 0.3, 0.16], pos: [slotX(m), 1.0, HZ + 0.5], shade: 0.7 });
    dimms.push({ shape: "box", size: [0.19, 0.34, 1.5], pos: [slotX(m), 1.5, HZ + 1.6], shade: 1.35 });
  }

  var cpus = [];
  [-2.3, 2.3].forEach(function (dx) {
    /* The socket, then the heatsink on it: a base and a stack of fins, so
       it is recognisable as the thing under which a processor lives. */
    cpus.push({ shape: "box", size: [2.6, 0.14, 2.6], pos: [HX + dx, 0.39, HZ - 2.4], r: 0.02, shade: 0.7 });
    cpus.push({ shape: "box", size: [2.3, 0.22, 2.3], pos: [HX + dx, 0.57, HZ - 2.4], r: 0.02, shade: 1.0 });
    cpus.push({ shape: "box", size: [0.11, 0.85, 2.2], pos: [HX + dx - 1.0, 1.1, HZ - 2.4], shade: 1.18,
      repeat: { count: 14, step: [0.155, 0, 0] } });
    cpus.push({ shape: "cyl", size: [0.22, 0.5], pos: [HX + dx - 1.15, 0.7, HZ - 3.55], seg: 8, shade: 0.6 });
    cpus.push({ shape: "cyl", size: [0.22, 0.5], pos: [HX + dx + 1.15, 0.7, HZ - 3.55], seg: 8, shade: 0.6 });
  });

  /* ---- what has been promised out of it ------------------------------ */
  var ramPromised = h.hvRamGb + guests.reduce(function (a, g) { return a + g.ram; }, 0);
  var ramScale = laneScale(h.ramGb, ramPromised);
  var ramItems = [{ amount: h.hvRamGb, shade: 0.62, stepped: true }].concat(
    guests.map(function (g, k) { return { amount: g.ram, shade: [0.85, 1.0, 1.15, 1.3][k % 4] }; }));
  var ramLaid = layBlocks(ramItems, ramScale.unit, RAM_Z, 2.0, 0.62, 0.85);

  /* The processors are the one lane where the four guests on the page are
     not the whole story. A host's vCPU commitment is a property of the host,
     and where the ticket says this one is committed at several times its
     physical cores, the rest of that commitment belongs to guests that are
     not on this page. Drawing it is not an invention — it is the host's own
     figure — and leaving it out was worse: the lane sat comfortably inside
     its gate on the one ticket whose entire subject is that it does not. */
  var cpuGuests = h.hvCores + guests.reduce(function (a, g) { return a + g.cores; }, 0);
  /* Only where the host REPORTS a ratio above one. A default of 1 means "not
     over-committed", not "committed to exactly every core it owns" \u2014 and
     reading it the second way drew a filler block on every ordinary ticket
     that packed the lane out to the gate and said something about the host
     that was not true. */
  var ratio = h.vcpuRatio > 1 ? h.vcpuRatio : 1;
  var cpuCommitted = ratio > 1 ? Math.max(cpuGuests, h.cores * ratio) : cpuGuests;
  var cpuScale = laneScale(h.cores, cpuCommitted);
  var cpuItems = [{ amount: h.hvCores, shade: 0.62, stepped: true }].concat(
    guests.map(function (g, k) { return { amount: g.cores, shade: [0.85, 1.0, 1.15, 1.3][k % 4] }; }));
  var elsewhere = cpuCommitted - cpuGuests;
  if (elsewhere > 0.01) cpuItems.push({ amount: elsewhere, shade: 0.45, ribbed: true });
  var cpuLaid = layBlocks(cpuItems, cpuScale.unit, CPU_Z, 2.0, 0.62, 0.85);

  /* ---- storage -------------------------------------------------------- */
  /* Three short lanes rather than one long one: the two datastores by how
     many desktops are sitting on them, and underneath them the space that
     has been PROMISED on the datastore against the space it has. Thin
     provisioning is the only place on this track where a promise can run
     past its gate without anybody having typed a wrong number anywhere. */
  var store = [];
  var dsScales = [];
  h.datastores.forEach(function (d, k) {
    var sc = laneScale(d.capacity, d.desktops);
    dsScales.push(sc);
    var len = Math.max(0.2, d.desktops * sc.unit);
    store.push({ shape: "rbox", size: [len, 0.7, 0.95], pos: [LANE_X + 0.1 + len / 2, 0.56, DS_Z + k * DS_STEP],
      r: 0.04, shade: [1.0, 1.2][k] || 1.0, block: 1 });
  });
  var thinScale = laneScale(h.datastoreGb, h.provisionedGb);
  dsScales.push(thinScale);
  var thin = Math.max(0.2, h.provisionedGb * thinScale.unit);
  store.push({ shape: "rbox", size: [thin, 0.7, 0.95],
    pos: [LANE_X + 0.1 + thin / 2, 0.56, DS_Z + 2 * DS_STEP], r: 0.04, shade: 0.8, block: 1 });
  /* And the disks themselves, off to the side of their lanes, because a
     datastore is a shelf of drives before it is a bar on a chart. */
  /* A fourth row, in line with the lanes rather than beside them. Set off to
     the right of them it ran clean off the end of the board \u2014 which nothing
     had caught, because the smoke test built the parts without ever asking
     whether they landed on the bench. */
  store.push({ shape: "box", size: [5.4, 0.22, 2.2],
    pos: [LANE_X + 2.8, 0.15, DS_Z + 3 * DS_STEP], r: 0.02, shade: 0.85 });
  for (var s2 = 0; s2 < 8; s2++) {
    store.push({ shape: "box", size: [0.5, 0.72, 1.8],
      pos: [LANE_X + 0.6 + s2 * 0.6, 0.6, DS_Z + 3 * DS_STEP], r: 0.02, shade: 0.68 });
  }

  /* ---- the apparatus, which is scenery and not a part ------------------ */
  var LANES = [[RAM_Z, ramScale.gate, 2.4], [CPU_Z, cpuScale.gate, 2.4],
    [DS_Z, dsScales[0].gate, 1.2], [DS_Z + DS_STEP, dsScales[1].gate, 1.2],
    [DS_Z + 2 * DS_STEP, dsScales[2].gate, 1.2]];
  var rig = [], gates = [];
  LANES.forEach(function (L) {
    rig = rig.concat(laneRig(L[0], L[1], L[2]));
    gates = gates.concat(laneGate(L[0], L[1], L[2]));
  });

  return {
    kind: "cloud",
    title: "The host, and what has been promised out of it",
    caption: "On the left, the machine with its lid off: the memory modules are countable and the " +
      "two processors are under their heatsinks. That is what this host HAS. On the right, the " +
      "lanes — memory, processors, and three for storage — each with a gate part way down it " +
      "marking what the host owns. Into each lane goes what has been promised: the hypervisor's " +
      "own reservation first, stepped so you can tell it from the rest, then one block per guest. " +
      "Blocks that stop before the gate are promises the host can keep. A block that runs out past " +
      "the gate is one it cannot. The gate sits where the hardware falls, so on a badly " +
      "over-committed host it is close to the near end and most of the lane is past it.",
    board: { size: [28, 0.5, 17], pos: [-1.8, -0.6, 2.6], color: "#454d54",
      build: [{ shape: "rbox", size: [28, 0.5, 17], pos: [0, 0, 0], r: 0.14, shade: 1.0 }], scale: 1 },
    decor: [
      { key: "rig", build: rig, pos: [0, 0, 0], color: "#2a3138" },
      /* Brass, and the only warm light thing on the bench. Whether a block
         stops before this or runs past it is the entire reading. */
      { key: "gates", build: gates, pos: [0, 0, 0], color: "#e0c46a" }
    ],
    parts: [
      {
        key: "host", label: "The host itself", build: host, finish: "matte", scale: 1,
        pos: [0, 0, 0], color: "#aab3b9",
        spec: "One physical server, lid off, four drive bays",
        note: "The machine everything else on this page is running on. It is drawn so that you can " +
          "look at it and rule it out, which on this track is what usually happens to it: a host " +
          "that is doing exactly what it was told to do with more than it owns has not failed."
      },
      {
        key: "dimms", label: "The memory in the host", build: dimms, finish: "matte", scale: 1,
        pos: [0, 0, 0], color: "#3f6ea8",
        spec: fitted + " modules of " + MODULE_GB + "GB in " + SLOTS + " slots",
        note: "Count them. This is the physical memory the host owns and the only number in the " +
          "picture that cannot be changed by typing — everything in the memory lane is measured " +
          "against it. The empty sockets are real too, and they are where an upgrade conversation " +
          "starts if one is genuinely needed."
      },
      {
        key: "ramplan", label: "The memory promised to the guests", build: ramLaid.build,
        finish: "matte", scale: 1, pos: [0, 0, 0], color: "#8fb4dd",
        spec: "Hypervisor reservation plus " + guests.length + " guests, laid against " + h.ramGb + "GB",
        note: "The same colour family as the modules because it is the same resource — one half of " +
          "it physical, the other half promised. The stepped block at the start is the hypervisor's " +
          "own reservation, which is not optional and is the piece most often left out of the sum. " +
          "Whether the run ends before the gate or past it is the whole question on a memory ticket."
      },
      {
        key: "cpus", label: "The processors", build: cpus, finish: "matte", scale: 1,
        pos: [0, 0, 0], color: "#8a5a1f",
        spec: h.cores + " cores across two sockets",
        note: "Under the heatsinks, and not coming out. Worth knowing that processors are the one " +
          "resource where promising more than you have is normal practice rather than a mistake — " +
          "guests take turns, and the cost of taking turns shows up as waiting rather than as a " +
          "refusal to start."
      },
      {
        key: "cpuplan", label: "The vCPU promised to the guests", build: cpuLaid.build,
        finish: "matte", scale: 1, pos: [0, 0, 0], color: "#d5a765",
        spec: "Hypervisor plus " + guests.length + " guests, laid against " + h.cores + " cores",
        note: "Read this lane differently from the memory one. A memory promise past the gate " +
          "cannot be kept at all; a processor promise past it usually can, until the waiting gets " +
          "long enough to notice — which is why the number that finally settles it is how long " +
          "guests spend queueing for a core, and that is on the panel. The ribbed block, where " +
          "there is one, is the rest of this host\u2019s commitment: vCPU handed to guests that are " +
          "not on this page. It is the host\u2019s own figure, and it counts."
      },
      {
        key: "datastore", label: "The datastores", build: store, finish: "matte", scale: 1,
        pos: [0, 0, 0], color: "#3e7a5c",
        spec: h.datastores.length + " datastores, plus what has been promised on them",
        note: "The top two lanes are how many desktops are sitting on each datastore against what " +
          "each was sized for. The third is different and worth understanding: it is the space " +
          "PROMISED to the guests against the space the datastore physically has. Thin provisioning " +
          "lets that run past the gate deliberately, and it works right up until the guests try to " +
          "use what they were promised."
      }
    ],
    /* Squared up on the lanes and tilted well over, because three parallel
       runs against three gates is a thing you read from above. */
    camera: { dist: 27, yaw: 0.34, pitch: 0.72, target: [-1.8, 0.4, 2.6], min: 10, max: 48 },
    /* Not rendered anywhere — carried so a test can assert that the geometry
       overruns exactly when the arithmetic says it should. */
    _fits: { ram: ramScale.fits, cpu: cpuScale.fits,
      store: dsScales.map(function (x) { return x.fits; }),
      cpuCommitted: cpuCommitted }
  };
}
