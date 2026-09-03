/* =====================================================================
   Field Service Center — objective 3.3, the channels half

   "Compare and contrast RAM characteristics" names channel configuration
   and the build did not grade it anywhere. The RAM drill identifies modules
   — generation, form, ranks, error correction. The board drill asks which
   slots to use, once, with identical modules, as one decision out of five.
   Nothing asked what channel mode a machine ends up in, what happens when
   the modules are not identical, or what the machine does when you get it
   wrong. That last one is the whole reason this matters:

   FITTING MEMORY IN THE WRONG SLOTS DOES NOT FAIL. The machine posts, it
   boots, every megabyte is present and correct, nothing is logged and
   nobody notices — and it runs at half the memory bandwidth for the rest of
   its life. There is no fault to find because there is no fault. It is the
   most common silent mistake in this trade and it is invisible to every
   troubleshooting method in domain five.

   So this is a decision exercise like 2.6, 3.5 and 3.6, not an
   identification drill: the board, the modules and their numbers all come
   from the seed, and every graded answer is derived from them.

   THE FIVE DECISIONS:

   1. WHICH SLOTS. Not the first ones. On a board with two slots per
      channel the pair goes in the SECOND slot of each channel — the two
      further from the processor — which on a four-slot board means slots
      two and four.
   2. WHAT MODE IT ENDS UP IN. Count the channels you have put memory in,
      not the modules. Four modules in two channels is still dual channel.
   3. WHAT SPEED IT ACTUALLY RUNS AT. Every module in the machine runs at
      one speed: the slowest thing in the chain, which is the slowest
      module, or the board's ceiling, or — most often — the JEDEC default,
      because the profile on the label does nothing until it is switched on.
   4. WHAT GOING WRONG LOOKS LIKE. Nothing. That is the answer, and it is
      why this is worth an exercise.
   5. THE WRINKLE. One thing about this particular box of modules is not
      straightforward, and it is a different thing each time: capacities
      that do not match, speeds that do not match, ranks, an odd number of
      modules, or memory soldered to the board that you cannot remove.

   Nothing here is a table of answers. The slot labels are generated from
   the board's channel layout, the recommended slots are computed from that
   layout by the rule above, and the mode, the speed and the wrinkle are all
   derived from the modules that turned up.
   ===================================================================== */

function rand(seed) {
  var a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function pickOne(r, a) { return a[Math.floor(r() * a.length)]; }

/* What each generation is actually sold at. The DEFAULT is what the machine
   runs at with nothing configured — the JEDEC speed the module reports — and
   the PROFILE speeds are what is printed on the box and does nothing at all
   until XMP or EXPO is enabled in firmware. Students learn the second number
   and are then surprised by the first, which is the point of decision 3. */
const GEN = {
  ddr3: { label: "DDR3", base: [1333, 1600], profile: [1866, 2133], caps: [4, 8],
    profileName: "XMP" },
  ddr4: { label: "DDR4", base: [2133, 2400, 2666], profile: [3000, 3200, 3600], caps: [8, 16, 32],
    profileName: "XMP (or DOCP / EXPO, depending whose firmware it is)" },
  ddr5: { label: "DDR5", base: [4800, 5600], profile: [6000, 6400, 7200], caps: [16, 32, 48],
    profileName: "EXPO or XMP" }
};

/* THE BOARDS. Seventeen real machines a technician meets, each described by
   its channel layout rather than by a list of which slots to use — the slot
   labels and the recommended slots are both computed from this. A board
   added here needs no answer written anywhere. */
export const BOARDS = [
  { key: "atx-ddr4", name: "A full-size desktop board in a tower", gen: "ddr4",
    channels: 2, perChannel: 2, form: "DIMM", ceiling: 3200,
    note: "The commonest board in the trade and the commonest place this goes wrong" },
  { key: "atx-ddr5", name: "A current desktop board in a tower", gen: "ddr5",
    channels: 2, perChannel: 2, form: "DIMM", ceiling: 6400,
    note: "Two slots per channel, and filling all four is not free on this generation" },
  { key: "microatx", name: "A short desktop board in a mini tower", gen: "ddr4",
    channels: 2, perChannel: 2, form: "DIMM", ceiling: 2933,
    note: "The same layout as a full-size board with everything closer together" },
  { key: "miniitx", name: "A square board in a small chassis", gen: "ddr4",
    channels: 2, perChannel: 1, form: "DIMM", ceiling: 3200,
    note: "Two slots and two channels, so there is nowhere wrong to put them" },
  { key: "miniitx5", name: "A square board in a current small chassis", gen: "ddr5",
    channels: 2, perChannel: 1, form: "DIMM", ceiling: 6000,
    note: "One slot per channel, which is why small boards often clock higher than large ones" },
  { key: "hedt4", name: "A workstation board with four channels", gen: "ddr4",
    channels: 4, perChannel: 1, form: "DIMM", ceiling: 2933,
    note: "Four slots and four channels: every slot is a different channel" },
  { key: "hedt8", name: "A workstation board with four channels and eight slots", gen: "ddr4",
    channels: 4, perChannel: 2, form: "DIMM", ceiling: 2666,
    note: "Eight slots, two per channel, and half of them are the wrong half to start with" },
  { key: "server6", name: "A server board with six channels per processor", gen: "ddr4",
    channels: 6, perChannel: 1, form: "RDIMM", ceiling: 2933,
    note: "Registered modules only, and a partly filled board runs in fewer channels" },
  { key: "laptop2", name: "A business laptop with two memory slots", gen: "ddr4",
    channels: 2, perChannel: 1, form: "SODIMM", ceiling: 3200,
    note: "Both slots under one cover, and a machine shipped with one module in it" },
  { key: "laptop2-5", name: "A current laptop with two memory slots", gen: "ddr5",
    channels: 2, perChannel: 1, form: "SODIMM", ceiling: 5600,
    note: "Two slots, and the machine left the factory with only one filled" },
  { key: "laptop-sold", name: "A thin laptop with memory soldered on and one free slot",
    gen: "ddr4", channels: 2, perChannel: 1, form: "SODIMM", ceiling: 3200, soldered: 8,
    note: "One channel is soldered to the board and cannot be changed" },
  { key: "laptop-sold5", name: "A current thin laptop with soldered memory and one free slot",
    gen: "ddr5", channels: 2, perChannel: 1, form: "SODIMM", ceiling: 5600, soldered: 16,
    note: "The soldered half decides how much of the upgrade actually runs in dual channel" },
  { key: "aio", name: "An all-in-one behind the screen", gen: "ddr4",
    channels: 2, perChannel: 1, form: "SODIMM", ceiling: 2666,
    note: "Laptop modules in a desktop, reached through a hatch in the stand" },
  { key: "sff", name: "A small-form-factor desktop under a monitor", gen: "ddr4",
    channels: 2, perChannel: 2, form: "DIMM", ceiling: 2666,
    note: "A full four-slot layout squeezed into a case that lies flat" },
  { key: "legacy", name: "An older tower still in service", gen: "ddr3",
    channels: 2, perChannel: 2, form: "DIMM", ceiling: 1600,
    note: "Old enough that the profile speeds on the box exceed what the board will do" },
  { key: "nuc", name: "A palm-sized machine on the back of a monitor", gen: "ddr4",
    channels: 2, perChannel: 1, form: "SODIMM", ceiling: 2666,
    note: "Two slots stacked on top of each other, and the lower one is easy to miss" },
  { key: "hedt4-5", name: "A current workstation board with four channels", gen: "ddr5",
    channels: 4, perChannel: 1, form: "DIMM", ceiling: 5600,
    note: "Four channels, one slot each, and a partly filled board loses channels not capacity" }
];

/* ---------------------------------------------------------------------
   THE LAYOUT, COMPUTED.

   Slots are labelled by channel and by position within it — DIMM_A1, A2,
   B1, B2 — and laid out on the board grouped by channel, in channel order,
   with the position-1 slot of each channel nearer the processor. That is
   how boards are actually silkscreened, and it is why the answer to "which
   two slots" is two and four rather than one and two.
   --------------------------------------------------------------------- */
const CH = "ABCDEFGH";

export function layout(board) {
  const out = [];
  /* A board with memory soldered on has one channel that is not a slot at
     all. Generating a slot for it put a DIMM_A1 on the table for a machine
     that physically has one socket, which is the sort of thing a student
     opens the case and cannot find. Channel A is the soldered one. */
  const start = board.soldered ? 1 : 0;
  for (let c = start; c < board.channels; c++) {
    for (let p = 0; p < board.perChannel; p++) {
      out.push({ label: board.form + "_" + CH[c] + (p + 1), channel: CH[c], pos: p + 1 });
    }
  }
  return out.map((s, i) => Object.assign({ index: i + 1 }, s));
}

export function slotCountOf(board) {
  return (board.channels - (board.soldered ? 1 : 0)) * board.perChannel;
}

/* Which slots to fill with k modules, derived from the layout rather than
   listed: one module per channel, going round the channels before doubling
   up, and within a channel the FURTHER slot first. On a two-per-channel
   board that is the second slot of each channel, which is where "the second
   and the fourth" comes from — it is not a rule to memorise, it is what
   this ordering produces. */
export function fillOrder(board) {
  const slots = layout(board);
  const order = [];
  for (let p = board.perChannel; p >= 1; p--) {
    for (let c = 0; c < board.channels; c++) {
      const s = slots.find((x) => x.channel === CH[c] && x.pos === p);
      if (s) order.push(s);
    }
  }
  if (order.length !== slots.length) {
    throw new Error('drillchan: board "' + board.key + '" has ' + slots.length +
      " slots but the fill order came out at " + order.length +
      ". The layout and the order disagree, so the graded answer would be wrong.");
  }
  return order;
}

export function recommended(board, k) {
  return fillOrder(board).slice(0, k);
}

const MODE = { 1: "single channel", 2: "dual channel", 3: "triple channel",
  4: "quad channel", 5: "five channels", 6: "six channels", 8: "eight channels" };

export function modeName(n) {
  if (!MODE[n]) {
    throw new Error("drillchan: nothing is named for " + n + " populated channels. " +
      "A board was added with a channel count this does not cover.");
  }
  return MODE[n];
}

/* --------------------------------------------------------------------- */
/* THE JOB: a board, a box of modules, and one wrinkle.                   */
/* --------------------------------------------------------------------- */

const WRINKLES = ["capacity", "speed", "ranks", "count", "soldered"];

export function buildJob(D) {
  const board = D.item;
  const r = rand(D.seedBase + 401);
  const g = GEN[board.gen];
  if (!g) {
    throw new Error('drillchan: board "' + board.key + '" is generation "' + board.gen +
      '", which has no speeds or capacities defined.');
  }
  const slots = layout(board);

  /* A board with memory soldered to it always gets the soldered wrinkle:
     there is only one slot to fill and the interesting question is what the
     part you cannot remove does to the answer. */
  let wrinkle = board.soldered ? "soldered"
    : pickOne(r, WRINKLES.filter((w) => w !== "soldered"));
  /* Ranks and odd counts need somewhere to put the extra modules. */
  if ((wrinkle === "count" || wrinkle === "ranks") && slots.length < 4) wrinkle = "capacity";

  /* How many modules turned up. */
  let k;
  if (board.soldered) k = 1;
  else if (wrinkle === "count") {
    /* An awkward number: one more than the channels where there is room for
       it, otherwise one fewer, which leaves a channel empty and is just as
       real. Asking for channels+1 on a board with one slot per channel put
       five modules in four slots and the layout lookup ran off the end. */
    k = slots.length > board.channels ? board.channels + 1 : board.channels - 1;
  } else if (wrinkle === "ranks") k = Math.min(slots.length, board.channels * 2);
  else k = board.channels;
  if (k < 1 || k > slots.length) {
    throw new Error('drillchan: board "' + board.key + '" was dealt ' + k + " modules for " +
      slots.length + ' slots on the "' + wrinkle + '" case. Every module must have a slot.');
  }

  const baseCap = pickOne(r, g.caps);
  const baseSpeed = pickOne(r, g.profile);
  const modules = [];
  for (let i = 0; i < k; i++) {
    modules.push({ cap: baseCap, speed: baseSpeed, ranks: wrinkle === "ranks" ? 2 : 1 });
  }
  if (wrinkle === "capacity" && modules.length > 1) {
    modules[modules.length - 1].cap = baseCap === g.caps[0] ? g.caps[1] : g.caps[0];
  }
  if (wrinkle === "speed" && modules.length > 1) {
    const slower = g.profile.filter((s) => s < baseSpeed);
    modules[modules.length - 1].speed = slower.length ? slower[0] : pickOne(r, g.base);
  }

  /* The soldered half of a laptop, when there is one — a module in every
     respect except that it is not coming out. */
  const solderedMod = board.soldered
    ? { cap: board.soldered, speed: pickOne(r, g.base), ranks: 1, fixed: true } : null;
  if (solderedMod) modules[0].cap = pickOne(r, g.caps.filter((c) => c >= board.soldered));

  /* WHAT IT ENDS UP DOING, all derived.

     Channels populated: one per module until the channels run out. The
     soldered board always has both channels in play, because one of them is
     the soldered part. */
  const populated = board.soldered ? 2 : Math.min(modules.length, board.channels);
  const all = solderedMod ? [solderedMod].concat(modules) : modules;

  /* Speed: every module in a machine runs at one speed, and it is the
     lowest of the slowest module, the board's ceiling, and — until somebody
     enables the profile — the generation's own default. */
  const slowestModule = Math.min.apply(null, all.map((m) => m.speed));
  const jedec = Math.max.apply(null, g.base);
  const asShipped = Math.min(slowestModule, board.ceiling, jedec);
  const withProfile = Math.min(slowestModule, board.ceiling);

  /* Capacity that actually interleaves. Where the capacities differ, the
     matched part of each channel runs interleaved and the remainder runs on
     its own — flex mode, and the answer students most often get wrong by
     saying it will not work at all. */
  const perChannel = {};
  all.forEach((m, i) => {
    const c = solderedMod ? (i === 0 ? "A" : "B")
      : recommended(board, modules.length)[i].channel;
    perChannel[c] = (perChannel[c] || 0) + m.cap;
  });
  const chanTotals = Object.keys(perChannel).map((c) => perChannel[c]);
  const smallest = Math.min.apply(null, chanTotals);
  const total = chanTotals.reduce((a, b) => a + b, 0);
  const interleaved = smallest * chanTotals.length;
  const flex = interleaved < total;

  return { board: board, gen: g, slots: slots, modules: modules, soldered: solderedMod,
    all: all, wrinkle: wrinkle, k: modules.length, populated: populated,
    where: recommended(board, modules.length),
    asShipped: asShipped, withProfile: withProfile, jedec: jedec,
    total: total, interleaved: interleaved, flex: flex, chanTotals: chanTotals };
}

/* --------------------------------------------------------------------- */
/* THE INSTRUMENT: the board's slots, and what is in the box.             */
/* --------------------------------------------------------------------- */

export function channelTables(D) {
  const J = buildJob(D);
  const b = J.board;
  /* The distance-from-the-processor column only exists on a board with two
     slots per channel. On a board with one, every row said "nearer the
     processor" — a column that reads the same on every line teaches nothing
     and takes width away from the ones that do. */
  const paired = b.perChannel > 1;
  const cols = ["Position on the board", "Silkscreen label", "Channel"]
    .concat(paired ? ["Where it sits in its channel"] : []);
  const slotRows = J.slots.map((s) => ({
    subject: false,
    cells: [s.index + " of " + J.slots.length, s.label, "Channel " + s.channel]
      .concat(paired ? [s.pos === 1 ? "Nearer the processor" : "Further from the processor"] : [])
  }));
  if (J.soldered) {
    slotRows.unshift({ subject: false,
      cells: ["Not a slot",
        "Soldered to the board — " + J.soldered.cap + " GB at " + J.soldered.speed + " MT/s",
        "Channel A"].concat(paired ? ["—"] : []) });
  }
  const modRows = J.modules.map((m, i) => ({
    subject: false,
    cells: ["Module " + (i + 1), m.cap + " GB", m.speed + " MT/s",
      m.ranks === 2 ? "Dual rank" : "Single rank"]
  }));
  return {
    tables: [
      { caption: b.name + ". " + b.note + ". It takes " + J.gen.label + " " + b.form +
          " modules and the board will run them at up to " + b.ceiling + " MT/s. " +
          "Nothing is fitted yet — this is how the slots are silkscreened.",
        columns: cols, rows: slotRows },
      { caption: "What turned up in the box. The speeds are what is printed on the label, " +
          "which is what the module is capable of rather than what it will do on its own.",
        columns: ["", "Capacity", "Rated speed", "Ranks"],
        rows: modRows }
    ]
  };
}

/* --------------------------------------------------------------------- */
/* THE FIVE DECISIONS.                                                    */
/* --------------------------------------------------------------------- */

/* A set of slots always reads in the order they sit on the board, whichever
   order the rule produced them in. The first version listed the recommended
   pair in fill order and offered its reverse as a distractor, which is the
   SAME SLOTS: a student who read the board correctly and said them the other
   way round was marked wrong. Sorting by position makes that impossible to
   express, which is better than remembering not to. */
const list = (slots) => slots.slice().sort((a, b) => a.index - b.index)
  .map((s) => s.label).join(" and ");
const setKey = (slots) => slots.map((s) => s.index).sort((a, b) => a - b).join(",");

export function channelQuestions(D, rnd) {
  const J = buildJob(D);
  const b = J.board;
  const qs = [];
  const order = fillOrder(b);

  /* 1. WHICH SLOTS. The wrong answers are the ones people actually reach
     for: the first slots on the board, and both slots of one channel. */
  if (J.modules.length < J.slots.length) {
    const k = J.modules.length;
    const byIndex = J.slots.slice().sort((a, b) => a.index - b.index);
    const right = list(J.where);
    const rightKey = setKey(J.where);

    /* Candidate wrong answers, as SETS of slots — the placements people
       actually reach for. A candidate that turns out to be the same set as
       the answer is dropped, not reworded. */
    const candidates = [
      byIndex.slice(0, k),                                   /* the first slots along */
      byIndex.slice(-k),                                     /* the last slots along */
      byIndex.filter((s) => s.channel === byIndex[0].channel).slice(0, k), /* one channel */
      byIndex.filter((s) => s.pos === 1).slice(0, k),         /* the nearer slot of each */
      byIndex.filter((s, i) => i % 2 === 1).slice(0, k),      /* every other one */
      byIndex.filter((s, i) => i % 2 === 0).slice(0, k),
      byIndex.slice(1, 1 + k),                               /* off by one along the board */
      order.slice().reverse().slice(0, k)                     /* the fill rule run backwards */
    ];
    const seen = {}; seen[rightKey] = true;
    const wrong = [];
    candidates.forEach((c) => {
      if (c.length !== k) return;
      const key = setKey(c);
      if (seen[key]) return;
      seen[key] = true;
      wrong.push(list(c));
    });
    /* Three real wrong answers or the question does not get asked. A
       two-option multiple choice is a coin toss dressed as a question, and
       silently shipping one is what the first version of this did. */
    if (wrong.length >= 3) {
      const oneChannelSet = list(byIndex.filter((s) => s.channel === byIndex[0].channel).slice(0, k));
      qs.push({
        id: "where",
        ask: k + (k === 1 ? " module" : " modules") + ", " + J.slots.length +
          " slots. Which do you fit?",
        hint: "Spread them across the channels before you double up in one, and where a channel " +
          "has two slots, the one further from the processor is the one to start with.",
        answer: right,
        choices: [right].concat(rnd(wrong).slice(0, 3)),
        why: (chosen) => chosen === right
          ? "Yes — " + right + ". One in each channel before any channel gets two, and where " +
            "a channel has a pair of slots the further one comes first. That is what puts the " +
            "answer at the second and the fourth on an ordinary four-slot board — it is not a " +
            "rule to memorise, it is what spreading across the channels produces."
          : "No — " + right + ". " +
            (chosen === oneChannelSet
              ? "What you have chosen puts every module in one channel, which is single channel " +
                "and half the bandwidth."
              : "What you have chosen fills the channels unevenly, so part of the memory has " +
                "nothing to interleave with.") +
            " The machine will run either way and say nothing about it, which is precisely why " +
            "this has to be right the first time."
      });
    }
  }

  /* 2. WHAT MODE. Count channels, not modules.

     The wording used to say "fitted the way you have just described", which
     read as a dangling reference on every board where the slots question is
     not asked — a board with one slot per channel has nowhere wrong to put
     anything, so there is nothing described. It asks about the board it can
     see instead. */
  const mode = modeName(J.populated);
  const askedWhere = qs.some((q) => q.id === "where");
  const modeWrong = [1, 2, 3, 4, 6, 8].filter((n) => n !== J.populated && MODE[n] &&
    n <= Math.max(4, b.channels)).map((n) => modeName(n));
  qs.push({
    id: "mode",
    ask: askedWhere
      ? "Fitted in the slots you have just chosen, what does this machine run in?"
      : "With " + (J.soldered ? "that module in the one slot" :
          "all " + J.modules.length + " modules fitted") + ", what does this machine run in?",
    hint: "Count the CHANNELS you have put memory into, not the modules. Four modules in two " +
      "channels is not four channels.",
    answer: mode,
    choices: [mode].concat(rnd(modeWrong).slice(0, 3)),
    why: (chosen) => chosen === mode
      ? "Yes — " + mode + ". " + J.modules.length +
        (J.modules.length === 1 ? " module" : " modules") +
        (J.soldered ? " plus what is soldered on" : "") + " across " + J.populated +
        (J.populated === 1 ? " channel" : " channels") + ". The mode is the channel count."
      : "No — " + mode + ". The mode is how many channels have memory in them. " +
        "Modules per channel changes the capacity, not the mode."
  });

  /* 3. WHAT SPEED. Three ceilings and the machine takes the lowest. */
  const shipAns = J.asShipped + " MT/s";
  const rated = Math.max.apply(null, J.all.map((m) => m.speed));
  /* Every wrong speed here is a number genuinely in play on this machine —
     what is printed on the label, what the board would do, what the profile
     would give — plus the generation's other JEDEC steps. Built as a set and
     counted, because the first version assembled them ad hoc and sometimes
     came up with two, shipping a question with three options. */
  const seenSpeed = {}; seenSpeed[J.asShipped] = true;
  const speedWrong = [];
  [rated, b.ceiling, J.withProfile]
    .concat(J.gen.base, J.gen.profile)
    .concat(J.all.map((m) => m.speed))
    .forEach((n) => {
      if (!n || seenSpeed[n]) return;
      seenSpeed[n] = true;
      speedWrong.push(n + " MT/s");
    });
  speedWrong.push("Each module at its own rated speed");
  if (speedWrong.length < 3) {
    throw new Error('drillchan: board "' + b.key + '" produced only ' + speedWrong.length +
      " wrong speeds, so the speed question would ship with fewer than four options.");
  }
  qs.push({
    id: "speed",
    ask: "You fit them, close it up and switch on, changing nothing in firmware. What speed " +
      "is the memory running at?",
    hint: "Three things cap it: the slowest module, what the board will do, and the default " +
      "the memory reports for itself. The number printed on the box is none of those until " +
      "somebody turns it on.",
    answer: shipAns,
    choices: [shipAns].concat(rnd(speedWrong).slice(0, 3)),
    why: (chosen) => chosen === shipAns
      ? "Yes — " + shipAns + ". Out of the box it runs at the " + J.gen.label +
        " default of " + J.jedec + " MT/s" +
        (J.withProfile > J.asShipped
          ? ", and it stays there until " + J.gen.profileName + " is enabled, which would take " +
            "it to " + J.withProfile + " MT/s"
          : "") +
        ". Every module in the machine runs at the same speed, and it is the lowest of them."
      : "No — " + shipAns + ". The label speed is what the module CAN do. Until the profile " +
        "is enabled the machine runs the " + J.gen.label + " default of " + J.jedec +
        " MT/s, and it never exceeds the slowest module or the board's " + b.ceiling + " MT/s."
  });

  /* 4. WHAT GETTING IT WRONG LOOKS LIKE. The answer is "nothing", and that
     is the reason this objective is worth a drill at all. */
  if (J.slots.length > J.modules.length && b.perChannel > 1) {
    const nothing = "It posts, boots and reports every megabyte. Nothing is logged and nothing " +
      "beeps — it just runs in single channel at roughly half the memory bandwidth, for " +
      "the rest of its life";
    const w4 = [
      "It will not post, and the board beeps a memory code",
      "It posts but reports only half the memory installed",
      "It posts, then becomes unstable and restarts under load",
      "The modules are damaged by being in the wrong channel"
    ];
    qs.push({
      id: "wrong",
      ask: "Suppose they went into the first two slots instead. What does the machine do?",
      hint: "Ask yourself what would actually tell you. Would a beep? A log? A missing figure " +
        "in the memory count? Work out which of those the machine has any reason to produce.",
      answer: nothing,
      choices: [nothing].concat(rnd(w4).slice(0, 3)),
      why: (chosen) => chosen === nothing
        ? "Yes, and this is the point of the whole exercise. There is no fault, so there is " +
          "nothing to find: the memory is all there, the machine is stable, and no method in " +
          "domain five will ever surface it. The only way it gets caught is somebody opening " +
          "the case and looking at which slots are filled."
        : "No. It posts and runs perfectly, with all the memory present. Wrong slots do not " +
          "fail — they halve the bandwidth silently, which is exactly why this is worth " +
          "knowing. A machine that will not post has a different problem."
    });
  }

  /* 5. WHAT TO TELL THEM ABOUT LATER. Always asked, because it is the
     question the customer always asks and because a board with one slot per
     channel — where there is nowhere wrong to put anything — would otherwise
     be a very short exercise. Derived from what is left free. */
  const free = J.slots.length - J.modules.length;
  const later = b.soldered
    ? "Only the slot can change. The soldered " + b.soldered + " GB is fixed, so anything " +
      "beyond " + b.soldered + " GB in that slot runs single channel"
    : free === 0
      ? "Every slot is full, so more memory means replacing what is in there, not adding to it"
      : b.perChannel > 1
        ? free + (free === 1 ? " slot is" : " slots are") + " free, but adding a single module " +
          "leaves the channels uneven — the tidy upgrade is a matched pair"
        : free + (free === 1 ? " slot is" : " slots are") + " free, and filling " +
          (free === 1 ? "it" : "them") + " adds a channel as well as capacity";
  const laterWrong = [
    "Every slot is full, so more memory means replacing what is in there, not adding to it",
    "A slot is free, so they can drop any module they like into it with no other consequence",
    "Nothing can be added — memory capacity is fixed once the machine is built",
    "They should replace it with a single larger module, which is always faster than two"
  ].filter((x) => x !== later);
  qs.push({
    id: "later",
    ask: "The customer asks about adding more later. What do you tell them?",
    hint: "Count what is left empty, and remember that what matters is not only whether a " +
      "module will fit but whether the channels stay even once it is in.",
    answer: later,
    choices: [later].concat(rnd(laterWrong).slice(0, 3)),
    why: (chosen) => chosen === later
      ? "Yes. " + later + ". Worth saying at the time rather than on the second visit."
      : "No — " + later + ". The honest answer depends on what is free and on whether adding " +
        "to it keeps the channels balanced, and it is cheaper to say so before the order."
  });

  /* 6. THE WRINKLE, whichever one this box has. */
  qs.push(wrinkleQuestion(J, rnd));
  return qs;
}

function wrinkleQuestion(J, rnd) {
  const b = J.board, caps = J.all.map((m) => m.cap);
  const distinct = caps.filter((c, i) => caps.indexOf(c) === i);

  if (J.wrinkle === "capacity" || (J.soldered && J.flex)) {
    const ans = "Yes. " + J.interleaved + " GB of the " + J.total + " runs interleaved across " +
      "both channels and the remaining " + (J.total - J.interleaved) + " GB runs on one";
    const wrong = [
      "No. The capacities have to match or the machine falls back to single channel entirely",
      "No. Mismatched capacities will not post at all",
      "Yes, and all " + J.total + " GB of it runs in dual channel",
      "Yes, but only if the smaller module goes in the first channel"
    ];
    return {
      id: "wrinkle",
      ask: "The modules are not the same size — " + distinct.join(" GB and ") +
        " GB. Does this machine still run in dual channel?",
      hint: "Think about it as two piles rather than one. As much as both channels can match, " +
        "they interleave. Whatever is left over on one side has nothing to pair with.",
      answer: ans,
      choices: [ans].concat(rnd(wrong).slice(0, 3)),
      why: (chosen) => chosen === ans
        ? "Yes. It is called flex mode, and it is why unequal modules are worth fitting rather " +
          "than leaving in a drawer. The matched part interleaves; the remainder runs single. " +
          "You get most of the benefit and all of the capacity."
        : "No — " + ans + ". Unequal capacities do not stop dual channel and certainly do " +
          "not stop it posting. The matched portion interleaves and the surplus does not."
    };
  }

  if (J.wrinkle === "speed") {
    const slow = Math.min.apply(null, J.all.map((m) => m.speed));
    const fast = Math.max.apply(null, J.all.map((m) => m.speed));
    const ans = "Everything runs at " + slow + " MT/s — the whole machine drops to the " +
      "slowest module";
    const wrong = [
      "Each module runs at its own rated speed",
      "The faster module runs at " + fast + " MT/s and the slower one is ignored",
      "The machine refuses to post until the speeds match",
      "They average out, at about " + Math.round((slow + fast) / 2) + " MT/s"
    ];
    return {
      id: "wrinkle",
      ask: "One module is rated " + fast + " MT/s and another " + slow +
        " MT/s. What happens?",
      hint: "There is one memory clock in the machine, not one per module. So ask what number " +
        "every module in it has to be able to manage.",
      answer: ans,
      choices: [ans].concat(rnd(wrong).slice(0, 3)),
      why: (chosen) => chosen === ans
        ? "Yes. There is one clock and everything on it runs at that clock, so the slowest " +
          "module sets the speed for the whole machine. A fast module added to a slow one buys " +
          "capacity and nothing else."
        : "No — " + ans + ". One clock, one speed, and it is the speed the slowest module " +
          "can manage. Nothing runs at its own rating and nothing is ignored."
    };
  }

  if (J.wrinkle === "ranks") {
    const ans = "It is more load on each channel, and on many boards the memory has to run " +
      "slower to stay stable — so filling every slot can be slower than filling half of them";
    const wrong = [
      "Nothing at all. Ranks are a manufacturing detail with no effect on the machine",
      "It doubles the channel count, so the machine runs in four channels instead of two",
      "It halves the usable capacity, because only one rank is addressable at a time",
      "It requires error-correcting memory and a board that supports it"
    ];
    return {
      id: "wrinkle",
      ask: "All " + J.modules.length + " of these are dual rank, and they fill every slot. " +
        "What does that cost?",
      hint: "A rank is another set of chips the memory controller has to drive. Ask what " +
        "driving twice as many of them, on twice as many modules, does to how hard the " +
        "controller is working.",
      answer: ans,
      choices: [ans].concat(rnd(wrong).slice(0, 3)),
      why: (chosen) => chosen === ans
        ? "Yes. Every rank is another electrical load on the channel, and a fully populated " +
          "board of dual-rank modules is the heaviest case there is. Boards routinely drop the " +
          "supported speed for it — which is why two modules can genuinely be quicker than " +
          "four of the same total capacity."
        : "No — " + ans + ". Ranks are not channels and they do not hide capacity. They are " +
          "load, and load is what costs you speed at the top of the range."
    };
  }

  if (J.wrinkle === "count") {
    const ans = modeName(Math.min(b.channels, J.modules.length)) + " for as much as pairs up, " +
      "and the odd module's surplus on its own — it works, it is just not symmetrical";
    const wrong = [
      "It will not post with an odd number of modules",
      "The odd module is ignored and its capacity is not available",
      "All " + J.modules.length + " modules interleave regardless, because the controller " +
        "handles it",
      "It falls back to single channel entirely until a fourth module is fitted"
    ];
    return {
      id: "wrinkle",
      ask: J.modules.length + " modules turned up for a " + b.channels +
        "-channel board. What does the customer get?",
      hint: "Nothing is wasted and nothing is refused. Ask what has a partner and what does not.",
      answer: ans,
      choices: [ans].concat(rnd(wrong).slice(0, 3)),
      why: (chosen) => chosen === ans
        ? "Yes. An odd module is not a fault and it is not wasted: what can pair up interleaves, " +
          "the surplus runs on its own, and every megabyte is available. It is worth telling " +
          "the customer, because the tidy answer is one more module rather than one fewer."
        : "No — " + ans + ". An odd count is untidy rather than broken. The capacity is all " +
          "there and the machine posts perfectly well."
    };
  }

  /* soldered */
  const added = J.modules[0];
  const ans = J.flex
    ? "Partly. " + J.interleaved + " GB runs in dual channel and the remaining " +
      (J.total - J.interleaved) + " GB runs on its own"
    : "Yes, fully. The module matches what is soldered on, so all " + J.total +
      " GB runs in dual channel";
  const wrong = [
    "No. Soldered memory always runs on its own and the slot is a second, separate channel " +
      "that never interleaves",
    "No. Dual channel needs two removable modules",
    "Yes, fully — the controller pairs whatever it is given regardless of size",
    "Only if the soldered memory is disabled in firmware first"
  ];
  return {
    id: "wrinkle",
    ask: "This machine has " + b.soldered + " GB soldered on and you are fitting a " +
      added.cap + " GB module in the one slot. Does it run in dual channel?",
    hint: "The soldered part is one channel and the slot is the other. So the question is how " +
      "much of the two sides matches — and what happens to whatever does not.",
    answer: ans,
    choices: [ans].concat(rnd(wrong).slice(0, 3)),
    why: (chosen) => chosen === ans
      ? (J.flex
        ? "Yes. The soldered " + b.soldered + " GB pairs with " + b.soldered + " GB of the " +
          "module and interleaves; the surplus runs single. Worth knowing before you quote, " +
          "because a matched module costs less and performs better than a bigger mismatched one."
        : "Yes. Matched sides, both channels, everything interleaved — which is exactly why " +
          "the size of the soldered half is the number to look up before ordering.")
      : "No — " + ans + ". Soldered memory is an ordinary channel; it simply cannot be " +
        "removed. It pairs with the slot for as much as the two sides match."
  };
}

/* Asserted at load. A board whose layout and fill order disagree would grade
   a correct answer wrong, and would do it silently. */
const SHAPE = ["key", "name", "gen", "channels", "perChannel", "form", "ceiling", "note"];
const SEEN = {};
BOARDS.forEach((b) => {
  const missing = SHAPE.filter((f) => b[f] === undefined || b[f] === "");
  if (missing.length) {
    throw new Error('drillchan: board "' + (b.key || "?") + '" is missing ' +
      missing.join(", ") + ".");
  }
  if (!GEN[b.gen]) {
    throw new Error('drillchan: board "' + b.key + '" is generation "' + b.gen +
      '", which has no speeds defined.');
  }
  if (SEEN[b.key]) throw new Error('drillchan: two boards share the key "' + b.key + '".');
  SEEN[b.key] = true;
  if (layout(b).length !== slotCountOf(b)) {
    throw new Error('drillchan: board "' + b.key + '" should have ' + slotCountOf(b) +
      " slots but its layout came out at " + layout(b).length + ".");
  }
  fillOrder(b);           /* throws if the order does not cover the layout */
  modeName(b.channels);   /* throws if nothing names this channel count */
  if (b.soldered && b.perChannel !== 1) {
    throw new Error('drillchan: board "' + b.key + '" has soldered memory and more than one ' +
      "slot per channel. The soldered case assumes one slot to fill.");
  }
});
