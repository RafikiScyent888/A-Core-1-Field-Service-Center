/* =====================================================================
   Field Service Center — the identification drill engine

   The ticket engine answers "what is wrong with this". This one answers
   "what IS this", which is a different skill and most of what the
   compare-and-contrast objectives actually ask for. 3.1 Cables &
   Connectors is not a service call — there is no caller, no symptom and
   nothing to diagnose. There is a thing in your hand, and either you know
   what it is or you do not.

   Same three rules as the rest of the build:

   1. Ground truth is a function of a seeded object, never a literal sitting
      beside the item. The connector is generated; every graded answer is
      computed from its spec. There is no answer bank to memorise because
      there are no answers written down anywhere.

   2. The wrong answers are real. Every distractor is another connector that
      genuinely exists, and the nearest one is the one this item actually
      gets confused with in the field — RJ45 against RJ11, SATA data against
      SATA power, HDMI against DisplayPort. Telling those apart IS the
      objective.

   3. Nothing on the page tells you the answer. The 3D model is the item,
      not an illustration of it: the contacts are countable, the keying is
      visible, the latch is drawn as the mechanism it is. Look at it.
   ===================================================================== */

import { mulberry32 } from "./ticket.js";
import { ACCESSORIES, accessoryQuestions } from "./drillacc.js";
import { SERVICES, serviceQuestions, firewallRules } from "./drillports.js";
import { WIRELESS, wirelessQuestions, surveyRows } from "./drillwireless.js";
import { HOSTS, hostQuestions, logRows } from "./drillhosts.js";
import { NETCONF, netconfQuestions, readoutRows } from "./drillnetconf.js";
import { DEVICES, deviceQuestions, plateRows } from "./drilldevices.js";
import { SITES, sohoQuestions, briefRows } from "./drillsoho.js";
import { LINKS, linkQuestions, readingRows } from "./drillconn.js";
import { TOOLS, toolQuestions, panelRows } from "./drilltools.js";
import { PANELS, panelQuestions, meterRows } from "./drillpanels.js";
import { MODULES, ramQuestions, labelRows } from "./drillram.js";
import { DRIVES, driveQuestions, benchRows } from "./drillstorage.js";
import { BUILDS, buildQuestions, noteRows } from "./drillbuild.js";
import { JOBS, psuQuestions, listRows } from "./drillpsu.js";

function R(seed) {
  var f = mulberry32(seed >>> 0);
  return {
    int: function (a, b) { return a + Math.floor(f() * (b - a + 1)); },
    pick: function (a) { return a[Math.floor(f() * a.length)]; },
    shuffle: function (a) {
      var x = a.slice();
      for (var i = x.length - 1; i > 0; i--) {
        var j = Math.floor(f() * (i + 1)); var t = x[i]; x[i] = x[j]; x[j] = t;
      }
      return x;
    }
  };
}

/* ---------------------------------------------------------------------
   The connectors.

   `lookalike` is the teaching heart of the file: the one other connector
   this gets mistaken for, and why. It is always offered as a distractor,
   because a drill whose wrong answers are obviously wrong teaches nothing.

   Every field here is something a technician can establish by looking at
   the thing or by knowing the standard. Nothing is invented.
   --------------------------------------------------------------------- */
export const CONNECTORS = [
  {
    key: "rj45", name: "RJ45 (8P8C)", family: "network",
    contacts: 8, media: "twisted-pair copper",
    carries: "Ethernet — data only, and power too if the port supplies it",
    mates: "an 8P8C jack: a wall outlet, a patch panel port or a switch port",
    retention: "a moulded spring clip on the top that you press to release",
    reach: "100 metres of channel, and that figure is the whole run, not the cable in your hand",
    rate: "1 Gb/s on Cat5e, 10 Gb/s on Cat6a",
    look: "Eight gold contacts side by side in a clear plastic body wider than a telephone plug.",
    lookalike: "rj11",
    lookalikeWhy: "Both are clear modular plugs with a spring clip, and at arm's length they are the same object. Count the contacts and look at the width — the telephone plug is visibly narrower and has six positions, not eight."
  },
  {
    key: "rj11", name: "RJ11 (6P4C)", family: "network",
    contacts: 4, media: "twisted-pair copper",
    carries: "an analogue telephone line, or DSL up to the modem",
    mates: "a six-position modular jack: a telephone outlet or the line port on a DSL modem",
    retention: "a moulded spring clip on the top that you press to release",
    reach: "far enough that distance is the telephone company's problem, not yours",
    rate: "not rated in Gb/s — DSL speed is a function of distance to the exchange",
    look: "A narrow clear plastic plug with six positions and only the middle four fitted with contacts.",
    lookalike: "rj45",
    lookalikeWhy: "It is the same shape as an Ethernet plug and narrower. It will drop into an 8P8C jack and sit there crooked, contacting nothing useful, which is why a network port that is 'plugged in and dead' is worth actually looking at."
  },
  {
    key: "usba", name: "USB Type-A", family: "data",
    contacts: 4, media: "copper",
    carries: "data and bus power, in one orientation only",
    mates: "a rectangular Type-A port on a computer, hub or charger",
    retention: "friction — nothing latches, it is held by the shell",
    reach: "5 metres for USB 2.0, 3 metres for the faster generations",
    rate: "480 Mb/s at USB 2.0, 5 Gb/s and up on the blue-tongued generations",
    look: "A flat rectangular metal shell with a plastic tongue inside carrying four contacts along one face.",
    lookalike: "usbb",
    lookalikeWhy: "Both are USB and both are held by friction, but they are opposite ends of the same cable. The flat rectangle goes to the computer; the squarer one goes to the device."
  },
  {
    key: "usbb", name: "USB Type-B", family: "data",
    contacts: 4, media: "copper",
    carries: "data and bus power to a peripheral, in one orientation only",
    mates: "the square Type-B socket on a printer, scanner or powered hub",
    retention: "friction — nothing latches, it is held by the shell",
    reach: "5 metres for USB 2.0, 3 metres for the faster generations",
    rate: "480 Mb/s at USB 2.0, 5 Gb/s on the SuperSpeed version",
    look: "A near-square metal shell with the two top corners cut off at an angle, so it only goes in one way up.",
    lookalike: "usba",
    lookalikeWhy: "Same cable, other end. If you are holding this one, the computer end is the flat rectangle and it is somewhere behind the desk."
  },
  {
    key: "usbc", name: "USB Type-C", family: "data",
    contacts: 24, perFace: 12, media: "copper",
    carries: "data, video and up to 240 W of power, either way up",
    mates: "an oval Type-C port — on a phone, a laptop, a dock or a monitor",
    retention: "friction, with a detent you can feel as it seats",
    reach: "1 metre for the full-rate passive cables, longer only with active ones",
    rate: "10 Gb/s and up, to 40 Gb/s where the cable and both ends support Thunderbolt",
    look: "A small oval shell with rounded ends and a central tongue carrying contacts on both faces.",
    lookalike: "lightning",
    lookalikeWhy: "Both are small, reversible and go into phones. This one is an oval shell with the contacts inside it; the other is a flat solid tab with the contacts on the outside."
  },
  {
    key: "lightning", name: "Lightning", family: "data",
    contacts: 8, media: "copper",
    carries: "data and charge to an Apple handset or tablet, either way up",
    mates: "the Lightning port on the device it was made for, and nothing else",
    retention: "friction, held by small detents on the sides of the tab",
    reach: "2 metres in the common lengths; it is a device cable, not a run",
    rate: "480 Mb/s — USB 2.0 speed, whatever the charger is capable of",
    look: "A flat solid metal tab with eight visible contacts on each face and no surrounding shell.",
    lookalike: "usbc",
    lookalikeWhy: "Both are reversible and both charge a phone, and people carry one assuming it will fit the other. This one is a solid tab; Type-C is a hollow oval. They do not interchange in either direction."
  },
  {
    key: "hdmi", name: "HDMI", family: "video",
    contacts: 19, media: "copper",
    carries: "digital video and audio together, in one cable",
    mates: "an HDMI port on a display, projector, television or graphics card",
    retention: "friction — no latch, no screws, which is why it works loose",
    reach: "about 15 metres passive before the picture starts to fail",
    rate: "4K at 60 Hz on High Speed, and higher on the later versions",
    look: "A flat trapezoid shell, wider at the top than the bottom, with nineteen contacts in two staggered rows.",
    lookalike: "displayport",
    lookalikeWhy: "Both are flat digital connectors carrying picture and sound, and both go into the back of a monitor. DisplayPort has one square corner and one clipped corner with a latch you must press; HDMI is a symmetrical trapezoid with nothing to press."
  },
  {
    key: "displayport", name: "DisplayPort", family: "video",
    contacts: 20, media: "copper",
    carries: "digital video and audio, and can drive several monitors from one port in a chain",
    mates: "a DisplayPort socket on a graphics card, dock or monitor",
    retention: "a sprung latch with a release you squeeze before pulling",
    reach: "about 3 metres at full rate passive, further with an active cable",
    rate: "4K at 120 Hz and beyond depending on the version at both ends",
    look: "A flat shell with one square corner and one clipped corner, twenty contacts, and a small latch release on the moulding.",
    lookalike: "hdmi",
    lookalikeWhy: "Same job, same part of the same monitor. Look at the corners: this one is asymmetric and latches, HDMI is symmetric and does not. Pulling this one without squeezing the release is how the latch ends up broken."
  },
  {
    key: "dvid", name: "DVI-D", family: "video",
    contacts: 24, perFace: 12, media: "copper",
    carries: "digital video only — no audio, no analogue",
    mates: "a DVI socket whose flat blade slot has no pins beside it",
    retention: "two thumbscrews, one at each end",
    reach: "about 5 metres before a digital signal starts dropping out",
    rate: "1920 x 1200 on single link, 2560 x 1600 on dual link",
    look: "A wide white plastic shell with three rows of eight pins and a flat blade at one end with no pins around it.",
    lookalike: "vga",
    lookalikeWhy: "Both are wide, both have thumbscrews, and both live on the back of older machines. Count the rows: DVI has three rows of square-packed pins and a flat blade; VGA has three rows of fifteen in a D-shaped shell and no blade."
  },
  {
    key: "vga", name: "VGA (DE-15)", family: "video",
    contacts: 15, media: "copper",
    carries: "analogue video only — no audio, and no digital signal at all",
    mates: "a blue D-shaped 15-pin socket on an older monitor, projector or machine",
    retention: "two thumbscrews, one at each end",
    reach: "about 5 metres before the picture goes soft and starts ghosting",
    rate: "no data rate — it is analogue, and quality falls off with distance rather than stopping",
    look: "A D-shaped shell, usually blue, with fifteen pins in three rows of five.",
    lookalike: "dvid",
    lookalikeWhy: "Both are wide screw-down video connectors on the back of the same generation of machine. The D-shaped one with fifteen pins in neat rows of five is analogue; the wider white one with a flat blade is digital."
  },
  {
    key: "satadata", name: "SATA data", family: "storage",
    contacts: 7, media: "copper",
    carries: "data between a drive and the board — and no power whatsoever",
    mates: "the narrow L-shaped port on a drive or a board's SATA header",
    retention: "friction, or a metal clip on the cables that have one",
    reach: "1 metre, which is a limit people meet inside large cases",
    rate: "6 Gb/s on SATA III",
    look: "A narrow flat plug with seven contacts and an L-shaped step in the moulding that stops it going in upside down.",
    lookalike: "satapower",
    lookalikeWhy: "Both are flat, both are L-keyed and both go into the same drive an inch apart. This is the narrow one with seven contacts; the wide one with fifteen is power. A drive with only this connected spins up on nothing and is never detected."
  },
  {
    key: "satapower", name: "SATA power", family: "storage",
    contacts: 15, media: "copper",
    carries: "3.3 V, 5 V and 12 V from the supply to a drive — power only, no data",
    mates: "the wide L-shaped power port on a drive, fed from the supply's loom",
    retention: "friction, sometimes with a clip on modular cables",
    reach: "as far as the loom reaches; it is not a signal path",
    rate: "no data rate — this connector carries no data at all",
    look: "A wide flat plug with fifteen contacts and the same L-shaped step as its narrow neighbour.",
    lookalike: "satadata",
    lookalikeWhy: "Same shape, same keying, side by side on the drive, and about twice the width. Fifteen contacts is power, seven is data, and a drive needs both before anything happens."
  },
  {
    key: "molex", name: "Molex (4-pin peripheral)", family: "storage",
    contacts: 4, media: "copper",
    carries: "5 V and 12 V to older drives, fans and case lighting",
    mates: "a four-pin peripheral socket on an older drive, fan or adapter",
    retention: "friction, and it is stiff enough that people pull the loom instead of the plug",
    reach: "as far as the loom reaches; it is not a signal path",
    rate: "no data rate — power only",
    look: "A chunky white nylon shell with four round pins and two bevelled corners at one edge.",
    lookalike: "satapower",
    lookalikeWhy: "Both are power-only plugs off the same loom. This one is thick white nylon with four round pins; SATA power is a flat wide blade with fifteen. Adapters between them exist and are the usual reason both are in the same case."
  },
  {
    key: "lc", name: "LC fibre", family: "fibre",
    contacts: 2, countLabel: "ferrules", media: "glass fibre",
    carries: "light — one strand transmits, the other receives, so it is normally a duplex pair",
    mates: "an LC port on a transceiver, patch panel or switch module",
    retention: "a small push-pull latch, like a modular plug's clip in miniature",
    reach: "hundreds of metres on multimode, tens of kilometres on single-mode",
    rate: "10, 40 and 100 Gb/s depending on the transceiver at each end",
    look: "Two small square-bodied plugs clipped together as a duplex pair, each with its own 1.25 mm ceramic ferrule \u2014 one strand out, one strand back.",
    lookalike: "sc",
    lookalikeWhy: "Both are square-bodied push-pull fibre connectors and both come in duplex pairs. This is the small one — its ferrule is 1.25 mm against the other's 2.5 mm, which is why it fits twice as many ports in a panel."
  },
  {
    key: "sc", name: "SC fibre", family: "fibre",
    contacts: 2, countLabel: "ferrules", media: "glass fibre",
    carries: "light — one strand each way, usually clipped as a duplex pair",
    mates: "an SC port on a patch panel, media converter or older transceiver",
    retention: "a square push-pull body that clicks in and pulls straight out",
    reach: "hundreds of metres on multimode, tens of kilometres on single-mode",
    rate: "1 and 10 Gb/s on the equipment that commonly uses it",
    look: "Two larger square plastic bodies clipped as a duplex pair, each with a 2.5 mm ceramic ferrule, and a positive click as each one seats.",
    lookalike: "lc",
    lookalikeWhy: "The same idea at twice the size. If two square fibre plugs are side by side, the bigger ferrule is SC and the smaller is LC, and neither will enter the other's port."
  },
  {
    key: "ftype", name: "F-type", family: "network",
    contacts: 1, countLabel: "centre conductors", media: "75-ohm coaxial",
    carries: "cable television and cable-internet signal on one centre conductor",
    mates: "a threaded F socket on a cable modem, splitter or wall plate",
    retention: "a knurled nut you screw down finger tight",
    reach: "long enough that the loss budget matters more than the length",
    rate: "whatever the modem negotiates — the connector does not set it",
    look: "A threaded barrel with the cable's own solid centre conductor standing proud in the middle as the pin.",
    lookalike: "bnc",
    lookalikeWhy: "Both are coaxial and both are round. This one screws down with a threaded nut; the other twists a quarter turn and locks. Look at whether it has threads or two little slots."
  },
  {
    key: "bnc", name: "BNC", family: "network",
    contacts: 1, countLabel: "centre conductors", media: "coaxial",
    carries: "video, or legacy coaxial Ethernet, on one centre conductor",
    mates: "a BNC socket with two lugs, on test equipment, a camera or older network gear",
    retention: "a bayonet — push and twist a quarter turn and it locks",
    reach: "185 metres on the old coaxial Ethernet segments it was used for",
    rate: "10 Mb/s where it carried Ethernet; video otherwise",
    look: "A round barrel with a slotted collar that twists a quarter turn onto two lugs.",
    lookalike: "ftype",
    lookalikeWhy: "Both round, both coaxial, both on the back of equipment nobody has replaced. This one twists and locks; the F-type screws. If you are turning it more than a quarter turn, it is the wrong one."
  }
];

export const BY_KEY = {};
CONNECTORS.forEach(function (c) { BY_KEY[c.key] = c; });

/* ---------------------------------------------------------------------
   One drilled item.

   The seed decides which connector and which distractors, the same way a
   ticket's seed decides its fault. Two students on the same seed see the
   same item; a shuffle rebuilds all of them.
   --------------------------------------------------------------------- */
export function buildDrillItem(seed, slot, subject) {
  var sub = SUBJECTS[subject] || SUBJECTS.connectors;
  var rng = R(seed * 7919 + slot * 104729 + sub.offset);
  /* Deal without repeats inside a session: the slot indexes into a shuffle
     of the whole pool rather than picking at random, so five slots are five
     different items rather than the same one twice. */
  var order = R(seed * 2654435761 + 17 + sub.offset).shuffle(sub.pool);
  var item = order[(slot - 1) % order.length];
  return {
    seed: seed, slot: slot, subject: sub.key,
    item: item,
    seedBase: (seed * 7919 + slot * 104729 + sub.offset) >>> 0,
    rng: rng
  };
}

/* How many drilled items a session deals. Five, like every other track. */
export const DRILL_SLOTS = 5;

/* ---------------------------------------------------------------------
   The graded questions.

   Every answer below is read off the item's own spec. There is no answer
   written next to the model, and the distractors are other real connectors
   — with the lookalike always among them, because that is the mistake the
   objective exists to prevent.
   --------------------------------------------------------------------- */
function distractors(D, field, n) {
  var want = D.item[field];
  var pool = CONNECTORS.filter(function (c) {
    return c.key !== D.item.key && String(c[field]) !== String(want);
  });
  var near = pool.filter(function (c) { return c.family === D.item.family; });
  var far = pool.filter(function (c) { return c.family !== D.item.family; });
  var look = BY_KEY[D.item.lookalike];
  var out = [], seen = { };
  seen[String(want)] = 1;
  /* Dedupe on the VALUE, not on the connector. Two different connectors can
     describe the same thing \u2014 RJ45 and RJ11 are both held by the same
     moulded clip \u2014 and offering that sentence twice in one question is
     both a giveaway and a question with two right answers. */
  function take(c) {
    var v = String(c[field]);
    if (out.length >= n || seen[v]) return;
    seen[v] = 1; out.push(c);
  }
  if (look) take(look);
  R(D.seedBase + 41).shuffle(near).forEach(take);
  R(D.seedBase + 97).shuffle(far).forEach(take);
  return out.slice(0, n);
}

function connectorQuestions(D) {
  var it = D.item;
  var qs = [];

  qs.push({
    id: "name",
    ask: "What is this connector?",
    hint: "Count the contacts and look at how it locks. Those two facts alone separate it from everything it could be confused with.",
    answer: it.name,
    choices: [it.name].concat(distractors(D, "name", 3).map(function (c) { return c.name; })),
    why: function (chosen) {
      if (chosen === it.name) return it.look + " " + it.lookalikeWhy;
      var other = CONNECTORS.filter(function (c) { return c.name === chosen; })[0];
      if (!other) return "That is not what is in front of you.";
      return "That is a real connector, and it is not this one. " + other.look +
        " Look again at the item and count what is actually there.";
    }
  });

  qs.push({
    id: "carries",
    ask: "What does it carry?",
    hint: "Some of these move data, some move power, some move both, and one or two move light. Which is this?",
    answer: it.carries,
    choices: [it.carries].concat(distractors(D, "carries", 3).map(function (c) { return c.carries; })),
    why: function (chosen) {
      if (chosen === it.carries) return "Yes. " + it.name + " carries " + it.carries + ".";
      return "That is what a different connector carries. What this one moves is decided by the " +
        "standard it belongs to, not by the shape of the shell — go back to what you identified it as.";
    }
  });

  /* Worded off the item, because "contacts" is the wrong noun for a fibre
     connector and because a connector with contacts on both faces is a trap:
     count one face of a Type-C and you get half the real number. The hint
     has to send them to the right count rather than to a confident wrong one. */
  var noun = it.countLabel || "contacts";
  qs.push({
    id: "contacts",
    ask: "How many " + noun + " does it have?",
    hint: it.perFace
      ? "They are drawn. Count one face \u2014 then turn it over before you answer, because this is one of the ones with contacts on both sides and they are not the same ones."
      : "They are drawn. Turn the model until you are looking straight into the face of it and count them.",
    answer: String(it.contacts),
    choices: (function () {
      var set = [String(it.contacts)];
      distractors(D, "contacts", 5).forEach(function (c) {
        if (set.length < 4 && set.indexOf(String(c.contacts)) === -1) set.push(String(c.contacts));
      });
      var pad = [1, 4, 7, 8, 15, 19, 20, 24];
      for (var i = 0; set.length < 4 && i < pad.length; i++) {
        if (set.indexOf(String(pad[i])) === -1) set.push(String(pad[i]));
      }
      return set;
    })(),
    why: function (chosen) {
      if (chosen === String(it.contacts)) {
        return "Correct — " + it.contacts + ". " + it.look;
      }
      return "Not what is on the model. This is a question you answer by looking rather than by " +
        "remembering: turn it face-on and count.";
    }
  });

  qs.push({
    id: "retention",
    ask: "What holds it in?",
    hint: "Look at the moulding for a clip, a thread, a pair of lugs or a screw. If there is nothing, that is itself the answer.",
    answer: it.retention,
    choices: [it.retention].concat(distractors(D, "retention", 3).map(function (c) { return c.retention; })),
    why: function (chosen) {
      if (chosen === it.retention) {
        return "Yes — " + it.retention + ". How a connector is retained decides how it fails: " +
          "the ones held by friction work loose, and the ones with a latch get their latch snapped.";
      }
      return "That is how a different connector is held. Look at the model for what is actually there.";
    }
  });

  qs.push({
    id: "mates",
    ask: "What will it go into?",
    hint: "A connector fits its own port and nothing else. Work from what you have identified it as.",
    answer: it.mates,
    choices: [it.mates].concat(distractors(D, "mates", 3).map(function (c) { return c.mates; })),
    why: function (chosen) {
      if (chosen === it.mates) return "Correct. It mates with " + it.mates + ".";
      return "That is another connector's port. Forcing a plug into the wrong socket is how both ends " +
        "get damaged, and it happens most between the two that look alike.";
    }
  });

  qs.push({
    id: "lookalike",
    ask: "Which connector is this most often mistaken for?",
    hint: "Not the one that does the same job — the one that looks the same in a dim comms room.",
    answer: BY_KEY[it.lookalike].name,
    choices: (function () {
      var set = [BY_KEY[it.lookalike].name];
      distractors(D, "name", 6).forEach(function (c) {
        if (set.length < 4 && c.key !== it.lookalike && set.indexOf(c.name) === -1) set.push(c.name);
      });
      return set;
    })(),
    why: function (chosen) {
      if (chosen === BY_KEY[it.lookalike].name) return it.lookalikeWhy;
      return "That one is distinguishable at a glance from what you are holding. The pairing this " +
        "question is after is the one that costs people a trip back to the van.";
    }
  });

  return qs;
}

/* ---------------------------------------------------------------------
   The subjects.

   One engine, one page, one set of rules \u2014 and a registry so a new
   objective is a pool plus a question generator rather than a second
   application. The seed offset keeps two subjects from dealing in lockstep
   on the same seed.
   --------------------------------------------------------------------- */
export const SUBJECTS = {
  connectors: {
    key: "connectors", offset: 611953,
    pool: CONNECTORS, questions: connectorQuestions
  },
  /* 2.1 has no object to look at, so its instrument is a firewall rule table
     rather than a model. Flagged here rather than faked: a rendered box with
     a port number on the side would be decoration. */
  protocols: {
    key: "protocols", offset: 1299709,
    pool: SERVICES,
    instrument: "rules",
    questions: function (D) {
      return serviceQuestions(D, function (list) { return R(D.seedBase + 71).shuffle(list); });
    },
    rules: function (D) {
      return firewallRules(D, function (list) { return R(D.seedBase + 89).shuffle(list); });
    }
  },
  /* 2.2 is the first subject whose model draws a phenomenon rather than an
     object \u2014 every access point in the pool looks identical, and what
     differs is where the signal gets to. So it carries a survey panel
     alongside the plan: the plan shows where, the panel says how much. */
  wireless: {
    key: "wireless", offset: 1610599,
    pool: WIRELESS,
    panel: surveyRows,
    questions: function (D) {
      return wirelessQuestions(D, function (list) { return R(D.seedBase + 113).shuffle(list); });
    }
  },
  /* 2.3 is the second subject whose object is not the evidence: eight of its
     sixteen hosts are the same 1U box. So it carries both — a rack elevation
     where form and cabling identify half the pool, and a connection log
     where behaviour identifies the rest. */
  hosts: {
    key: "hosts", offset: 2038073,
    pool: HOSTS,
    panel: logRows,
    questions: function (D) {
      return hostQuestions(D, function (list) { return R(D.seedBase + 131).shuffle(list); });
    }
  },
  /* 2.4 is the third subject whose instrument is an idea rather than an
     object \u2014 but the idea is very nearly a picture already, because an
     address space is a line and everything this objective carves out of one
     is a position or a segment on it. */
  netconf: {
    key: "netconf", offset: 2750159,
    pool: NETCONF,
    panel: readoutRows,
    questions: function (D) {
      return netconfQuestions(D, function (list) { return R(D.seedBase + 149).shuffle(list); });
    }
  },
  /* 2.5 is the relief after three objectives whose evidence had to be
     invented. Every item in this pool is a box you can pick up, and all four
     discriminators are visible on it — so the bench is the instrument and
     the plate beside it carries only what is genuinely printed on a case. */
  devices: {
    key: "devices", offset: 3187459,
    pool: DEVICES,
    panel: plateRows,
    questions: function (D) {
      return deviceQuestions(D, function (list) { return R(D.seedBase + 167).shuffle(list); });
    }
  },
  /* 2.6 is the only exercise on this page whose verb is CONFIGURE. Nothing is
     broken and there is nothing to name — there is a business, a plan of it
     and five decisions. So the item is a SITE, its numbers are generated from
     the seed, and every graded answer is computed from those numbers rather
     than looked up beside them. */
  soho: {
    key: "soho", offset: 3433781,
    pool: SITES,
    panel: briefRows,
    questions: function (D) {
      return sohoQuestions(D, function (list) { return R(D.seedBase + 181).shuffle(list); });
    }
  },
  /* 2.7 is one objective made of two things that are not alike: what the
     provider brought to the building, and how far a network reaches. The
     pool carries both and the model draws both on the same ground, because
     comparing and contrasting is impossible across two different scales. */
  links: {
    key: "links", offset: 3671417,
    pool: LINKS,
    panel: readingRows,
    questions: function (D) {
      return linkQuestions(D, function (list) { return R(D.seedBase + 193).shuffle(list); });
    }
  },
  /* 2.8 is the most physical objective in the domain and the easiest one to
     turn into a naming quiz. The book says EXPLAIN THEIR PURPOSES, so the
     questions are about what you get out of each tool and — the one that
     matters — where it stops telling you anything. */
  tools: {
    key: "tools", offset: 3911477,
    pool: TOOLS,
    panel: panelRows,
    questions: function (D) {
      return toolQuestions(D, function (list) { return R(D.seedBase + 211).shuffle(list); });
    }
  },
  /* 3.1 is the one subject where the object itself is useless: every display
     in the pool is a black rectangle from the front. So it is drawn cut in
     half, and the whole objective becomes visible — how many layers, and
     which one of them is producing light. */
  panels: {
    key: "panels", offset: 4211339,
    pool: PANELS,
    panel: meterRows,
    questions: function (D) {
      return panelQuestions(D, function (list) { return R(D.seedBase + 227).shuffle(list); });
    }
  },
  /* 3.3 is the one objective where nearly every characteristic the exam asks
     about is a physical feature you can count or a key you can line up. The
     model draws the module AND the socket, because on this objective the
     socket is half the evidence. */
  ram: {
    key: "ram", offset: 4507951,
    pool: MODULES,
    panel: labelRows,
    questions: function (D) {
      return ramQuestions(D, function (list) { return R(D.seedBase + 233).shuffle(list); });
    }
  },
  /* 3.4 is built around a trap that costs money every week: two devices can
     be the same shape and speak different buses. The model draws the drive
     opened AND the thing it mates with, because the keying is the only
     physical difference between the pair that gets ordered wrong. */
  storage: {
    key: "storage", offset: 4721093,
    pool: DRIVES,
    panel: benchRows,
    questions: function (D) {
      return driveQuestions(D, function (list) { return R(D.seedBase + 251).shuffle(list); });
    }
  },
  /* 3.5's verb is INSTALL AND CONFIGURE, so like 2.6 it is a decision
     exercise rather than an identification drill. The item is a build, its
     numbers come from the seed, and four of the five answers are counts or
     comparisons taken off the board itself. */
  build: {
    key: "build", offset: 4933739,
    pool: BUILDS,
    panel: noteRows,
    questions: function (D) {
      return buildQuestions(D, function (list) { return R(D.seedBase + 269).shuffle(list); });
    }
  },
  /* 3.6's verb is INSTALL THE APPROPRIATE one, so it is a sizing and
     selection decision rather than the troubleshooting the power track
     already does. Every answer is arithmetic or a comparison on a generated
     parts list. */
  psu: {
    key: "psu", offset: 5140273,
    pool: JOBS,
    panel: listRows,
    questions: function (D) {
      return psuQuestions(D, function (list) { return R(D.seedBase + 281).shuffle(list); });
    }
  },
  accessories: {
    key: "accessories", offset: 917503,
    pool: ACCESSORIES,
    questions: function (D) {
      return accessoryQuestions(D, function (list) { return R(D.seedBase + 53).shuffle(list); });
    }
  }
};

export function drillQuestions(D) {
  var sub = SUBJECTS[D.subject] || SUBJECTS.connectors;
  return sub.questions(D);
}

/* Where these drills live, in the book's numbering.

   3.2 is its home: "Summarize basic cable types and their connectors,
   features, and purposes." It is a Summarize objective, which is exactly
   why it is a drill and not a service call \u2014 there is no caller and no
   symptom, there is a thing on the bench.

   It is shown alongside the two objectives that later depend on it, because
   knowing a connector is not the end of the story. A student who cannot tell
   RJ45 from RJ11 cannot work 5.5, and a student who cannot tell a tone probe
   from a certifier cannot work 2.8. That is what the pairing line says on
   screen: this is where the vocabulary comes from, and here is where you
   will be asked to use it. */
export const DRILL_OBJECTIVES = {
  wireless: {
    title: "Wireless networking technologies",
    home: "2.2",
    objectives: ["2.2"],
    feeds: ["2.6", "5.5"],
    pairing: "This is objective 2.2 \u2014 explain wireless networking technologies. It gets a plan " +
      "rather than a photograph, because every access point in this pool is the same white disc on " +
      "the same ceiling and what actually differs is where the signal gets to. Higher frequencies " +
      "carry more and penetrate less, and every decision on this objective comes back to that one " +
      "trade. Get it straight and 2.6 gets easier, because configuring a small network is mostly " +
      "choosing bands and channels \u2014 and so does 5.5, where \u201cit works in this room and not that " +
      "one\u201d stops being a mystery.",
    modelKind: "plan"
  },
  hosts: {
    title: "Services provided by networked hosts",
    home: "2.3",
    objectives: ["2.3"],
    feeds: ["2.1", "2.5", "5.5"],
    pairing: "This is objective 2.3 — summarise the services provided by networked hosts. It " +
      "gets a rack rather than a photograph of one server, because half of what identifies a host " +
      "is what is around it: what is racked above it, what its cables go to, and whether it is in " +
      "the rack at all. The other half is behaviour, so the connection log beside it says who " +
      "starts the conversation and what comes back — and says nothing at all about ports, on " +
      "purpose. You name the role from what it does, then bring 2.1 to it and say what that role " +
      "listens on. Get this solid and 2.5 stops being a list of boxes, and 5.5 gets much shorter, " +
      "because “what broke” is usually “which host stopped”.",
    modelKind: "rack"
  },
  netconf: {
    title: "Common network configuration concepts",
    home: "2.4",
    objectives: ["2.4"],
    feeds: ["2.6", "5.5"],
    pairing: "This is objective 2.4 \u2014 explain common network configuration concepts. " +
      "Almost none of it is an object: a mask is arithmetic, a lease is a promise with a " +
      "clock on it, a VLAN is a number on a switch port. But one thing here IS spatial and " +
      "it is the thing people get wrong most \u2014 an address space is a LINE, with a first " +
      "and last address nobody may use, a way off it near one end, and a range handed out " +
      "in the middle. Get that straight and 2.6 becomes setting up a small network rather " +
      "than copying numbers, and 5.5 gets much shorter, because most network faults are " +
      "one of these concepts configured somewhere it should not have been.",
    modelKind: "space"
  },
  devices: {
    title: "Common networking hardware devices",
    home: "2.5",
    objectives: ["2.5"],
    feeds: ["2.6", "2.7", "5.5"],
    pairing: "This is objective 2.5 — compare and contrast common networking hardware devices. " +
      "After three objectives whose evidence had to be invented, this one is a bench: every item " +
      "in the pool is a box you can pick up, and all four things that separate them are visible " +
      "from where you are standing. Count the sockets and ask whether they are all alike. Look " +
      "for whatever is set apart from that row. Then — and this is the one nobody uses — work " +
      "out how power gets in, because three of these have no mains lead and for three completely " +
      "different reasons. Get this solid and 2.6 becomes choosing equipment rather than guessing " +
      "at it, 2.7 gets easier because the box where the service enters the building is in this " +
      "pool twice, and 5.5 gets shorter, because half of “the network is down” is one of these " +
      "boxes doing exactly what it was always going to do.",
    modelKind: "bench"
  },
  soho: {
    title: "Configuring a small office network",
    home: "2.6",
    objectives: ["2.6"],
    feeds: ["2.2", "2.4", "2.5", "5.5"],
    pairing: "This is objective 2.6 — configure a basic wired and wireless small office network. " +
      "It is the only exercise here whose verb is CONFIGURE, and that changes what it is: nothing " +
      "is broken, nobody has rung up, and there is nothing to name. There is a business, a plan " +
      "of the premises with everything on it that will want an address, and five decisions. Four " +
      "of them are arithmetic or judgement on numbers you count off the plan, and all five move " +
      "when the seed does, so there is no version of this that can be memorised. It is where the " +
      "three objectives before it are spent: 2.2 decides the channel, 2.4 decides the block and " +
      "where the pool starts, 2.5 decides what the outside port connects to. Get this one right " +
      "and 5.5 gets much shorter, because a network configured properly on day one does not " +
      "generate most of the tickets on that objective.",
    modelKind: "site"
  },
  links: {
    title: "Internet connection types and network types",
    home: "2.7",
    objectives: ["2.7"],
    feeds: ["2.6", "4.2", "5.5"],
    pairing: "This is objective 2.7 — compare and contrast internet connection types, network " +
      "types and their characteristics. It is one objective made of two things that are not " +
      "alike, so the drill treats them as two: half the pool is what the provider brought to the " +
      "building, identified from what physically arrives at the wall and what is at the far end " +
      "of it; half is how far a network reaches, identified by looking at what fits inside the " +
      "boundary. The question that matters on both halves is what actually LIMITS it, and it is " +
      "never the number on the advertisement — it is a shared segment, a length of copper, a " +
      "line of sight, or a distance light has to cross. Get this straight and 2.6 gets easier, " +
      "because specifying a service is choosing which of those ceilings you can live with, and " +
      "so does 5.5, where “it is slow in the evening” stops being a mystery.",
    modelKind: "street"
  },
  tools: {
    title: "Networking tools and their purposes",
    home: "2.8",
    objectives: ["2.8"],
    feeds: ["3.2", "5.5"],
    pairing: "This is objective 2.8 — explain networking tools and their purposes. Naming them " +
      "is not the objective; a purpose is a sentence about what you get OUT of the thing. So the " +
      "questions are what it hands you, when you reach for it, and above all what it will NOT " +
      "tell you — because a continuity tester will cheerfully pass a run that cannot carry a " +
      "gigabit, and a certifier will pass a cable plugged into the wrong port. Knowing where each " +
      "instrument stops is what stops you trusting a pass that does not mean what you thought it " +
      "meant. It sits directly on top of 3.2, because every one of these acts on a connector you " +
      "have to be able to name, and it is most of what makes 5.5 quick.",
    modelKind: "toolbench"
  },
  panels: {
    title: "Display components and attributes",
    home: "3.1",
    objectives: ["3.1"],
    feeds: ["1.1", "5.3"],
    pairing: "This is objective 3.1 — compare and contrast display components and attributes. The " +
      "display track already troubleshoots these; this is the other half, and nothing here is " +
      "broken. Every one of these is a set of trade-offs somebody accepted on purpose, and the " +
      "question that matters is what they gave up to get whatever it is good at — because the " +
      "complaint that eventually comes in is almost always that thing rather than a fault. It is " +
      "drawn cut in half because from the front they are all the same black rectangle. Get it " +
      "straight and 5.3 gets much shorter, because half of “the screen looks wrong” is a display " +
      "doing exactly what that kind of display does — and 1.1 gets safer, because one of the " +
      "twelve has several hundred volts behind it after the machine is switched off.",
    modelKind: "section"
  },
  ram: {
    title: "RAM characteristics",
    home: "3.3",
    objectives: ["3.3"],
    feeds: ["3.5", "5.1"],
    pairing: "This is objective 3.3 — compare and contrast RAM characteristics. It is the one " +
      "objective in the syllabus where nearly everything the exam asks about is a physical " +
      "feature: where the notch sits along the edge, how long the module is, how many chips are " +
      "on it, and whether any of them is not a memory chip. The error-correction question is a " +
      "counting exercise — a rank is eight chips wide, so a total that divides by nine has one " +
      "spare chip per rank — and the question that actually earns its keep is what the module " +
      "will NOT work in, because almost every memory call-out in the field is a compatibility " +
      "question rather than a fault. Get this solid and 3.5 gets easier, because half of " +
      "installing a board is knowing what memory it demands, and 5.1 gets much shorter, because " +
      "“it will not post after an upgrade” stops being a mystery.",
    modelKind: "modulebench"
  },
  storage: {
    title: "Storage devices",
    home: "3.4",
    objectives: ["3.4"],
    feeds: ["3.5", "5.2"],
    pairing: "This is objective 3.4 — compare and contrast storage devices. The RAID track " +
      "already troubleshoots arrays; this is the other half, and nothing here is broken. It is " +
      "built around a trap that costs money every week: TWO DEVICES CAN BE THE SAME SHAPE AND " +
      "SPEAK DIFFERENT BUSES. Two cards in this pool are the same length in the same socket with " +
      "the same screw, and they differ by one notch. Beside that sits the other question worth " +
      "the time — what is inside it that can move — because everything about how a device fails, " +
      "how it sounds, whether dropping it matters and what it does on small random reads follows " +
      "from that one answer. Get this solid and 3.5 gets easier, and 5.2 gets much shorter.",
    modelKind: "drivebench"
  },
  build: {
    title: "Installing boards, processors and add-on cards",
    home: "3.5",
    objectives: ["3.5"],
    feeds: ["3.3", "3.6", "5.1"],
    pairing: "This is objective 3.5 — install and configure motherboards, CPUs and add-on cards. " +
      "The verb is install AND configure, so this is a decision exercise rather than an " +
      "identification drill: nothing is broken, there is a board on the bench and a box of parts " +
      "somebody ordered, and five decisions that have to be made in order. Two of them are the " +
      "ones that cost real time in the field. Two modules in four slots go in the SECOND and " +
      "FOURTH — put them in the first two and the machine runs perfectly at half the memory " +
      "bandwidth, silently, forever. And the processor has its own power connector, at the far " +
      "corner from the wide one, and a board with that left off is completely silent — no beep, " +
      "no fan, no picture — which looks exactly like a dead board. It sits on top of 3.3, and " +
      "3.6 is the next decision after it.",
    modelKind: "boardbench"
  },
  psu: {
    title: "Installing the appropriate power supply",
    home: "3.6",
    objectives: ["3.6"],
    feeds: ["3.5", "5.1"],
    pairing: "This is objective 3.6 — install the APPROPRIATE power supply. The power track " +
      "already troubleshoots them; this is the other half, and the book's own verb says so. " +
      "Nothing is broken: there is a machine to build, a parts list with a draw against every " +
      "line, and the question is which supply to order. Watts are only the first of five " +
      "decisions and they are the easiest — a supply with the right number on the box and the " +
      "wrong leads in the bag is still the wrong supply, and the card connector changed at the " +
      "current generation. It follows 3.5 directly: once you know what is going in the machine, " +
      "this is what feeds it, and it is the one objective on which getting it wrong is a fire " +
      "rather than a fault.",
    modelKind: "psubench"
  },
  protocols: {
    title: "TCP and UDP ports and protocols",
    home: "2.1",
    objectives: ["2.1"],
    feeds: ["2.3", "5.5"],
    instrument: "rules",
    pairing: "This is objective 2.1 \u2014 compare and contrast TCP and UDP ports, protocols and " +
      "their purposes. There is nothing to put in front of a camera here: a port is a number and " +
      "a protocol is an agreement, so the instrument is what you would actually be reading when " +
      "ports matter, which is a firewall rule table. Knowing that 443 is HTTPS is a fact. Knowing " +
      "that a browser cannot reach it without 53 answering first is what fixes tickets \u2014 which " +
      "is why 2.3 and 5.5 both get easier once this is solid.",
    modelKind: "none"
  },
  accessories: {
    title: "Accessories and connectivity options",
    home: "1.2",
    objectives: ["1.2"],
    feeds: ["1.1", "3.2"],
    pairing: "This is objective 1.2 \u2014 compare and contrast accessories and connectivity " +
      "options. Compare and contrast is the instruction, so the questions are not \u201cwhat is " +
      "this\u201d so much as \u201cwhat does it need, and what will it never do\u201d. Two boxes can look " +
      "identical on a desk and behave completely differently the moment one of them is asked to " +
      "drive a second monitor. Get this straight and 1.1 gets easier, because half of what walks " +
      "into a laptop job is an accessory rather than the machine \u2014 and 3.2 gets easier too, " +
      "because every one of these arrives on the end of a connector you will have to name.",
    modelKind: "accessory"
  },
  connectors: {
    title: "Cable types and connectors",
    home: "3.2",
    objectives: ["3.2"],
    feeds: ["5.5", "2.8"],
    pairing: "This is objective 3.2 \u2014 summarise the cable types, their connectors and what " +
      "each one is for. It is a drill rather than a service call because the book asks you to " +
      "summarise rather than to troubleshoot: nobody has rung up, nothing is broken, and there is " +
      "a connector on the bench. Get this one right and two later objectives get easier, because " +
      "5.5 asks you to troubleshoot a network you cannot troubleshoot without naming what is " +
      "plugged into it, and 2.8 asks about the tools you would reach for once you have."
  }
};
