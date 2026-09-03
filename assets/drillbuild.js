/* =====================================================================
   Field Service Center — objective 3.5

   "Install and configure motherboards, CPUs, and add-on cards."

   INSTALL AND CONFIGURE. Not compare, not summarise — so this is a decision
   exercise like 2.6 and not an identification drill. Nothing is broken.
   There is a board on the bench, a box of parts somebody ordered, and five
   decisions that have to be made in order before the machine will start.

   The item is a BUILD, its numbers come from the seed, and every graded
   answer is computed from those numbers. Change the seed and the board is a
   different size with a different socket, a different number of memory
   slots, a different set of expansion slots and a processor that may or may
   not fit. There is no version of this that can be memorised.

   THE FIVE DECISIONS, and why these five:

   1. WILL THE PROCESSOR GO IN AT ALL. Socket first, always, and it is a
      mechanism rather than a preference. Two families use the same word for
      a socket and put the pins on opposite parts, and forcing one is how a
      board becomes scrap.
   2. WHICH MEMORY SLOTS. The one everybody gets wrong: with two modules and
      four slots, the pair to fill is the SECOND and FOURTH, not the first
      two. Fill the first two and the machine runs — at half the memory
      bandwidth, silently, forever.
   3. WHICH EXPANSION SLOT. A slot has a physical length AND an electrical
      width, and they are frequently not the same number. A card in a slot
      that is long enough but wired narrow works, slowly, and nothing warns
      you.
   4. WHAT HAS TO BE CONNECTED BEFORE IT WILL POST. The board connector and
      the processor's own connector are two different plugs, and a machine
      with only the first fitted does absolutely nothing — no beep, no fan,
      no picture. It is the single most common first build failure.
   5. WHAT TO SET AFTERWARDS. The configure half, which is the half the
      objective's verb names second and which most people skip.

   The panel beside the bench carries the delivery note — what was ordered
   and what turned up — because half of these decisions are made by reading
   a box rather than a board.
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
function pickInt(r, lo, hi) { return lo + Math.floor(r() * (hi - lo + 1)); }
function pickOne(r, a) { return a[Math.floor(r() * a.length)]; }

/* The two ways a processor and a socket meet, and what happens if you get
   it wrong. Named by the mechanism rather than by a manufacturer, because
   the mechanism is what the exam is asking about and what decides whether
   the damage lands on the cheap part or the expensive one. */
const HOLDS = {
  land: { name: "a land grid — the pins are in the socket and the processor has flat pads",
    risk: "The delicate part is the BOARD. Bend those and the board is scrap, and it is not a " +
      "repair anybody in a workshop is going to make" },
  pin: { name: "a pin grid — the pins are on the processor and the socket has holes",
    risk: "The delicate part is the PROCESSOR. Bend those and the processor is scrap, which is " +
      "expensive but at least it is the part you can replace on its own" }
};

/* Boards, in the sizes that turn up. The mounting-hole count is the tell a
   technician actually uses, and it is a count you can take off the plan. */
const FORMS = {
  eatx:     { name: "the largest board that will go in a full tower", holes: 9, dimm: 8, slots: 7 },
  atx:      { name: "a full-size board for a tower", holes: 9, dimm: 4, slots: 7 },
  microatx: { name: "a shorter board for a mini tower", holes: 6, dimm: 4, slots: 4 },
  miniitx:  { name: "a square board for a small chassis", holes: 4, dimm: 2, slots: 1 }
};

export const BUILDS = [
  {
    key: "designer", name: "A designer's workstation, built from parts",
    brief: "Two memory modules, a graphics card, and a processor that was ordered separately from " +
      "the board.",
    form: "atx", holds: "land",
    configureFirst: "Enable the memory profile, so the modules run at the speed printed on them " +
      "rather than at the slower speed they default to",
    configureWhy: "Memory does not run at its rated speed out of the box. It starts at a safe " +
      "common speed and stays there until somebody turns the profile on, and a machine that is " +
      "quietly a third slower than it was paid for is the most common thing nobody notices."
  },
  {
    key: "reception", name: "A reception machine in a small chassis",
    brief: "Two memory modules, no expansion card of any kind, and a low-profile cooler.",
    form: "miniitx", holds: "land",
    configureFirst: "Set the boot order, so it starts from the drive you installed to rather than " +
      "from whatever it found first",
    configureWhy: "A machine that boots to a network prompt or to the wrong drive is not broken, " +
      "it is unconfigured — and it is the first thing to check before anybody starts suspecting " +
      "the drive."
  },
  {
    key: "cad", name: "A drawing office replacement",
    brief: "Four memory modules, a graphics card that wants full width, and a capture card.",
    form: "atx", holds: "pin",
    configureFirst: "Enable the memory profile, so the modules run at the speed printed on them " +
      "rather than at the slower speed they default to",
    configureWhy: "Memory does not run at its rated speed out of the box. It starts at a safe " +
      "common speed and stays there until somebody turns the profile on, and a machine that is " +
      "quietly a third slower than it was paid for is the most common thing nobody notices."
  },
  {
    key: "till", name: "A till system rebuild",
    brief: "Two memory modules and a serial card for the equipment behind the counter.",
    form: "microatx", holds: "pin",
    configureFirst: "Turn on the setting that starts the machine again by itself after the power " +
      "comes back",
    configureWhy: "A till that stays off after a power cut is a shop that cannot trade until " +
      "somebody with a key arrives. It is one setting and it is the difference between an outage " +
      "of a minute and an outage of an hour."
  },
  {
    key: "server", name: "A small server for a back office",
    brief: "Four memory modules, a storage controller, and a network card.",
    form: "eatx", holds: "land",
    configureFirst: "Enable the virtualisation extensions, because nothing that has to run " +
      "machines inside itself will start without them",
    configureWhy: "They are off by default on a great many boards, and the failure looks like the " +
      "software being broken rather than like a setting — the hypervisor simply refuses to start " +
      "and says something unhelpful about hardware support."
  },
  {
    key: "editing", name: "A video editing machine",
    brief: "Four memory modules, a graphics card, and a fast storage card.",
    form: "atx", holds: "land",
    configureFirst: "Enable the memory profile, so the modules run at the speed printed on them " +
      "rather than at the slower speed they default to",
    configureWhy: "Memory does not run at its rated speed out of the box. It starts at a safe " +
      "common speed and stays there until somebody turns the profile on, and a machine that is " +
      "quietly a third slower than it was paid for is the most common thing nobody notices."
  },
  {
    key: "lab", name: "A machine for a college teaching lab",
    brief: "Two memory modules, no card, and a chassis that has to be locked shut.",
    form: "microatx", holds: "land",
    configureFirst: "Set a firmware password and turn off booting from anything removable",
    configureWhy: "Anybody who can boot a lab machine from a stick of their own owns it entirely. " +
      "The lock on the case is the second line, and this is the first."
  },
  {
    key: "cctv", name: "A recorder for a camera system",
    brief: "Two memory modules, a network card with several ports, and a great many drives.",
    form: "atx", holds: "pin",
    configureFirst: "Turn on the setting that starts the machine again by itself after the power " +
      "comes back",
    configureWhy: "A recorder that stays off after a power cut is not recording, and nobody " +
      "discovers that until the week somebody asks for the footage."
  },
  {
    key: "audio", name: "A studio machine that has to be quiet",
    brief: "Four memory modules, an audio interface card, and a large slow-turning cooler.",
    form: "atx", holds: "land",
    configureFirst: "Set the fan curve, so the machine is quiet at idle rather than running " +
      "everything flat out",
    configureWhy: "A board with no curve set runs its fans to a default that is safe and loud. In " +
      "a room where the machine has to be inaudible, that default is the whole job."
  },
  {
    key: "kiosk", name: "A kiosk in a public foyer",
    brief: "Two memory modules, no expansion card, and a chassis mounted behind a screen.",
    form: "miniitx", holds: "pin",
    configureFirst: "Set a firmware password and turn off booting from anything removable",
    configureWhy: "A machine anybody can walk up to is a machine anybody can boot from a stick of " +
      "their own. It is bolted behind a screen, which stops nothing at all on its own."
  },
  {
    key: "render", name: "A render node for a small studio",
    brief: "Four memory modules, two graphics cards, and no display of its own.",
    form: "eatx", holds: "land",
    configureFirst: "Enable the virtualisation extensions, because nothing that has to run " +
      "machines inside itself will start without them",
    configureWhy: "They are off by default on a great many boards, and the failure looks like the " +
      "software being broken rather than like a setting — the hypervisor simply refuses to start " +
      "and says something unhelpful about hardware support."
  },
  {
    key: "office", name: "An ordinary office desktop, rebuilt",
    brief: "Two memory modules, no card, and the drive from the machine it is replacing.",
    form: "microatx", holds: "land",
    configureFirst: "Set the boot order, so it starts from the drive you installed to rather than " +
      "from whatever it found first",
    configureWhy: "A machine that boots to a network prompt or to the wrong drive is not broken, " +
      "it is unconfigured — and it is the first thing to check before anybody starts suspecting " +
      "the drive."
  },
  {
    key: "clinic", name: "A machine for a treatment room", brief:
      "Two memory modules, no card, and a drive that has to be installed to before anything else " +
      "happens.",
    form: "microatx", holds: "land",
    configureFirst: "Set the storage controller's mode before the operating system goes on, " +
      "because changing it afterwards stops the machine booting",
    configureWhy: "The controller can present drives one way or another, and whichever it is set " +
      "to when the operating system installs is the one the operating system builds its driver " +
      "around. Change it later and the machine stops at a blue screen before it reaches the " +
      "desktop — the drive is fine, the install is fine, and the machine will not start. Decide " +
      "it once, before the install, and write it on the build sheet."
  },
  {
    key: "studio", name: "A photographer's machine with a card fitted", brief:
      "Four memory modules, a graphics card, and a monitor that arrived with the machine.",
    form: "atx", holds: "pin",
    configureFirst: "Set the display output the machine uses, and check the cable is in the card " +
      "rather than in the board",
    configureWhy: "A board with graphics of its own and a card fitted has two sets of sockets a " +
      "hand's width apart, and the ones on the board are the ones nearest the other cables. A " +
      "machine plugged into the board runs on the board's graphics — it works, nothing is broken, " +
      "and the card that was paid for is doing nothing. It is the most expensive cable in the " +
      "wrong hole in this whole objective."
  },
  {
    key: "engineering", name: "A machine built around a newer processor", brief:
      "Two memory modules, one card, and a processor newer than the board on the shelf.",
    form: "atx", holds: "land",
    configureFirst: "Check the board's firmware version against what the processor needs BEFORE " +
      "the old processor comes out",
    configureWhy: "A board sold before a processor existed often supports it only after a firmware " +
      "update — and the update usually needs a working processor to run. Fit the new one first and " +
      "the machine will not post, will not show a screen, and gives you nothing to update with. " +
      "Some boards can update with no processor fitted at all; if this one cannot, the order is " +
      "update, then swap, and getting it the wrong way round means borrowing a processor back."
  },
  {
    key: "archive", name: "A machine with a second drive going in", brief:
      "Two memory modules, no card, and a second fast drive to be added to the one already there.",
    form: "microatx", holds: "pin",
    configureFirst: "Read which sockets the second fast drive shares its lanes with, before " +
      "anything is plugged in",
    configureWhy: "A board has a fixed number of lanes and hands them out. Filling the second fast " +
      "drive socket switches off two of the ordinary drive ports on most boards — quietly, with no " +
      "message. The drives that vanish are the ones that were working before you started, so it " +
      "reads as damage you caused. It is in a table in the board's manual and nowhere on the board."
  },
  {
    key: "training", name: "A batch machine for a training room", brief:
      "Four memory modules, no card, and an operating system that will not install as delivered.",
    form: "eatx", holds: "pin",
    configureFirst: "Turn on the firmware's security module and the signed-boot setting, because " +
      "the operating system will not install without them",
    configureWhy: "A current operating system checks for both before it will install, and boards " +
      "ship with at least one of them off. The installer refuses with a message about the machine " +
      "not being supported, which sends people looking for a hardware problem on a machine that " +
      "is entirely capable. Two settings in the firmware, and on a batch of identical machines it " +
      "is worth doing to all of them before the first install rather than after the first refusal."
  }
];

const BY = {};
BUILDS.forEach(function (b) { BY[b.key] = b; });
export { BY as BY_KEY };

/* ---------------------------------------------------------------------
   The build's own numbers, derived from the seed.
   --------------------------------------------------------------------- */
export function buildFrom(D) {
  var it = D.item;
  var mix = 0;
  for (var c = 0; c < it.key.length; c++) mix = (mix * 131 + it.key.charCodeAt(c)) >>> 0;
  var r = rand((D.seedBase + 0x3B5 + mix) >>> 0);

  var form = FORMS[it.form];

  /* How many memory modules turned up, against how many slots the board has.
     Two modules in a four-slot board is the case the whole second decision
     exists for. */
  var slots = form.dimm;
  var modules = slots === 2 ? 2 : pickOne(r, [2, 2, 2, 4]);

  /* Whether the processor that arrived actually matches the board. The
     socket generation is a number rather than a manufacturer's name — the
     exam is asking about the mechanism, not the marketing. */
  var boardSocket = pickInt(r, 1150, 1900);
  var mismatch = r() < 0.34;
  var cpuSocket = mismatch ? boardSocket + pickOne(r, [-100, -50, 50, 100, 151]) : boardSocket;

  /* The expansion slots on this board, and what the card needs. A slot has a
     physical length and an electrical width and they are often different,
     which is the whole of the third decision. */
  /* Several real layouts per size, chosen by seed, rather than one fixed
     table. With a single layout the widest slot was always the first one and
     the answer to the third decision was ALWAYS "slot 1" — which no browser
     walker can see, because it reads the answer out of instructor mode and
     then clicks the option matching it. A question with a constant answer is
     not a question. */
  var LAYOUTS = {
    7: [
      [[16,16],[1,1],[16,4],[1,1],[16,8],[1,1],[4,4]],
      [[1,1],[16,16],[1,1],[16,8],[4,4],[16,4],[1,1]],
      [[16,8],[1,1],[16,16],[4,4],[1,1],[16,4],[1,1]],
      [[4,4],[16,4],[1,1],[16,16],[1,1],[16,8],[1,1]],
      [[1,1],[16,4],[16,8],[1,1],[4,4],[1,1],[16,16]]
    ],
    4: [
      [[16,16],[1,1],[16,4],[1,1]],
      [[1,1],[16,16],[4,4],[16,4]],
      [[16,4],[1,1],[16,16],[1,1]],
      [[4,4],[16,8],[1,1],[16,16]]
    ],
    1: [ [[16,16]] ]
  };
  var choices = LAYOUTS[form.slots] || LAYOUTS[1];
  var lanes = pickOne(r, choices).map(function (p) { return { len: p[0], wired: p[1] }; });
  var needsCard = /card/.test(it.brief) && !/no expansion card|no card/.test(it.brief);
  var cardWants = needsCard ? pickOne(r, [16, 16, 8, 4, 1]) : 0;

  /* The best slot for that card: physically long enough, and wired to the
     most lanes of any that fits. Index from 1, the way a manual numbers
     them. */
  var best = 0, bestWired = -1;
  if (needsCard) {
    for (var i = 0; i < lanes.length; i++) {
      if (lanes[i].len < cardWants) continue;
      if (lanes[i].wired > bestWired) { bestWired = lanes[i].wired; best = i + 1; }
    }
  }

  return {
    build: it, form: form, formKey: it.form,
    slots: slots, modules: modules,
    boardSocket: boardSocket, cpuSocket: cpuSocket, fits: boardSocket === cpuSocket,
    holds: HOLDS[it.holds],
    lanes: lanes, needsCard: needsCard, cardWants: cardWants,
    bestSlot: best, bestWired: bestWired
  };
}

/* ---------------------------------------------------------------------
   The delivery note.

   What was ordered and what turned up. Counts and part numbers, never a
   verdict — whether the processor fits is arithmetic on two numbers that
   are both printed here, and doing that arithmetic is the first question.
   --------------------------------------------------------------------- */
export function noteRows(D) {
  var B = buildFrom(D);
  return [
    { k: "The job", v: B.build.brief },
    { k: "Board, as marked on the box", v: "Socket " + B.boardSocket + ", " + B.form.holes +
        " mounting holes, " + B.slots + " memory slots, " + B.lanes.length + " expansion slots" },
    { k: "Processor, as marked on the box", v: "Socket " + B.cpuSocket },
    { k: "How the socket holds it", v: B.holds.name },
    { k: "Memory that turned up", v: B.modules + " identical modules" },
    { k: "Expansion card that turned up", v: B.needsCard
        ? "One card, and its edge connector is " + B.cardWants + " lanes long"
        : "None — nothing on this job goes in an expansion slot" }
  ];
}

/* ---------------------------------------------------------------------
   The five decisions.
   --------------------------------------------------------------------- */
export function buildQuestions(D, rnd) {
  var B = buildFrom(D);
  var qs = [];

  /* 1 — will it go in at all. */
  var fitAnswer = B.fits
    ? "Yes. The two socket numbers are the same, so it drops in — and the delicate part is what " +
      "the socket does, not what you do"
    : "No. The two socket numbers are different, and nothing on either part can be persuaded " +
      "otherwise";
  var fitWrong = [
    "Yes, provided the cooler is a matching one — the socket number only describes the mounting",
    "No, but an adaptor makes it fit, and they are sold for exactly this",
    "It depends on the firmware version, which is what a socket number really refers to",
    B.fits
      ? "No. The two socket numbers are different, and nothing on either part can be persuaded otherwise"
      : "Yes. The two socket numbers are the same, so it drops in — and the delicate part is what " +
        "the socket does, not what you do"
  ];
  qs.push({
    id: "socket",
    ask: "Will the processor that turned up go into this board?",
    hint: "Two numbers on the delivery note answer this and nothing else does. Compare them " +
      "before you take anything out of its packet — this decision comes first, every time.",
    answer: fitAnswer,
    choices: [fitAnswer].concat(rnd(fitWrong).slice(0, 3)),
    why: function (chosen) {
      if (chosen === fitAnswer) {
        return (B.fits
          ? "Right — both say " + B.boardSocket + ", so it seats. "
          : "Right — the board says " + B.boardSocket + " and the processor says " + B.cpuSocket +
            ", so it does not, and no amount of pressure will change that. ") +
          "And while you are there: this one is " + B.holds.name + ". " + B.holds.risk + ".";
      }
      return "No. A socket number is a mechanical fact, not a preference: it says how many " +
        "contacts there are and where they sit. Two different numbers cannot be made to meet, and " +
        "an adaptor for this does not exist.";
    }
  });

  /* 2 — which memory slots. The classic. */
  var memAnswer, memWrong;
  if (B.slots === 2) {
    memAnswer = "Both of them — there are only two, and two modules fill them";
    memWrong = [
      "The one nearest the processor only, and keep the second module as a spare",
      "The one furthest from the processor only, so the cooler has room",
      "Either one on its own. With two slots the second is only ever for capacity"
    ];
  } else if (B.modules === B.slots) {
    memAnswer = "All of them — you have as many modules as slots, so every slot gets one";
    memWrong = [
      "The two nearest the processor, and keep the other two as spares",
      "The second and fourth only, because that is the pair that gives two channels",
      "The first and second only, and leave the rest for a later upgrade"
    ];
  } else {
    memAnswer = "The second and fourth, counting out from the processor";
    memWrong = [
      "The first and second, counting out from the processor",
      "The first and third, counting out from the processor",
      "Any two of them. With identical modules the positions make no difference"
    ];
  }
  qs.push({
    id: "memory",
    ask: B.modules + " identical modules, " + B.slots + " slots on the board. Which slots do you " +
      "populate?",
    hint: "The slots are not interchangeable. They are wired in pairs, and a pair has to be one " +
      "slot from each group — which on a four-slot board is not the two nearest the processor, " +
      "however sensible that looks.",
    answer: memAnswer,
    choices: [memAnswer].concat(rnd(memWrong).slice(0, 3)),
    why: function (chosen) {
      if (chosen === memAnswer) {
        return (B.slots === 2 || B.modules === B.slots
          ? "Correct — with " + B.modules + " modules and " + B.slots + " slots there is no " +
            "choice to get wrong here, and that is worth knowing too."
          : "Correct. On a four-slot board the two channels are interleaved, so the pair to fill " +
            "is the second and the fourth. Fill the first two instead and the machine posts, " +
            "boots and runs perfectly — on one channel, at half the memory bandwidth, silently, " +
            "for the rest of its life. Nothing warns you and nobody notices.") +
          " Whichever board it is, the manual prints the pair and it takes ten seconds to check.";
      }
      return "Not the pair this board wants. The slots are wired as two interleaved groups, so a " +
        "pair has to take one slot from each — and the machine will not tell you if you get it " +
        "wrong, it will just run at half the bandwidth it should.";
    }
  });

  /* 3 — which expansion slot. */
  if (B.needsCard) {
    var slotAnswer = "Slot " + B.bestSlot + ", which is long enough and is wired to " +
      B.bestWired + " lanes";
    var slotWrong = [];
    B.lanes.forEach(function (s, i) {
      var n = i + 1;
      if (n === B.bestSlot) return;
      if (s.len < B.cardWants) {
        slotWrong.push("Slot " + n + ", which is " + s.len + " lanes long — the card will need " +
          "the end of it cutting off");
      } else {
        slotWrong.push("Slot " + n + ", which is long enough and is wired to " + s.wired + " lanes");
      }
    });
    slotWrong.push("Any slot the card physically fits in. Length is the only thing that matters");
    qs.push({
      id: "slot",
      ask: "The card's edge connector is " + B.cardWants + " lanes long. Which slot does it go in?",
      hint: "A slot has two numbers and they are frequently different: how long it physically is, " +
        "and how many lanes are actually wired to it. Find the ones long enough first, then " +
        "choose between them on the second number.",
      answer: slotAnswer,
      choices: [slotAnswer].concat(rnd(slotWrong).slice(0, 3)),
      why: function (chosen) {
        if (chosen === slotAnswer) {
          return "Right. Slot " + B.bestSlot + " is physically long enough and carries " +
            B.bestWired + " lanes, which is the most of any slot that fits. A card in a slot " +
            "that is long enough but wired narrow works perfectly and runs slowly, and nothing " +
            "anywhere warns you — which is why this is a decision rather than a guess.";
        }
        return "Not the best slot here. Check both numbers: physically long enough, and then the " +
          "most lanes of the ones that are. A card that is too long for a slot does not go in at " +
          "all unless the slot is open-ended, and a card in a narrow slot runs quietly slower " +
          "than it should.";
      }
    });
  } else {
    /* No card on this job — so the question becomes the one that matters
       when there is nothing to fit: what goes in the slots instead. */
    var noneAnswer = "Nothing. There is no card on this job, and an empty slot needs no attention " +
      "at all";
    qs.push({
      id: "slot",
      ask: "What goes in the expansion slots on this build?",
      hint: "Read the delivery note before you look at the board. Not every job has a card in it, " +
        "and a slot with nothing to go in it is not a problem to be solved.",
      answer: noneAnswer,
      choices: [noneAnswer,
        "A blanking card in each, or the airflow through the chassis will be wrong",
        "The graphics card, in the longest slot — every build needs one",
        "Whatever was in the machine this one replaces, moved across"],
      why: function (chosen) {
        if (chosen === noneAnswer) {
          return "Right. Nothing on this job goes in a slot. The blanking plates on the CHASSIS " +
            "matter for airflow; the slots themselves do not need filling.";
        }
        return "Not on this job. The delivery note says what turned up, and nothing on it goes " +
          "in an expansion slot — the blanking plates that matter are on the back of the chassis " +
          "rather than on the board.";
      }
    });
  }

  /* 4 — what has to be connected before it will post. */
  var postAnswer = "Both power connectors — the wide one for the board AND the separate one for " +
      "the processor — plus the switch lead from the front of the case";
  qs.push({
    id: "post",
    ask: "What has to be connected before it will do anything at all?",
    hint: "More than one thing, and the one people miss is not the obvious one. Ask what a " +
      "machine does when the board has power but the processor has none: the answer is nothing " +
      "whatsoever, which looks exactly like a dead board.",
    answer: postAnswer,
    choices: [postAnswer,
      "The wide board connector and the switch lead. The processor is fed through the board",
      "The wide board connector on its own — everything else can be added once it starts",
      "The wide board connector, the switch lead, and a display, or it will not begin the check"],
    why: function (chosen) {
      if (chosen === postAnswer) {
        return "Correct, and the second one is the whole point. The processor has its own " +
          "connector, separate from the wide one, usually at the top corner of the board. Leave " +
          "it off and the machine does nothing at all — no beep, no fan, no picture — which looks " +
          "identical to a dead board and is the single most common first-build failure there is.";
      }
      return "Not enough. The processor is fed by its own connector, separate from the wide board " +
        "one and usually at the top corner. A board with the wide one fitted and that one missing " +
        "is completely silent, and every symptom points at the board rather than at a plug.";
    }
  });

  /* 5 — the configure half. */
  var others = BUILDS.filter(function (b) {
    return b.configureFirst !== B.build.configureFirst;
  });
  var seen = {}, cfgWrong = [];
  rnd(others).forEach(function (b) {
    if (cfgWrong.length >= 3 || seen[b.configureFirst]) return;
    seen[b.configureFirst] = 1; cfgWrong.push(b.configureFirst);
  });
  qs.push({
    id: "configure",
    ask: "It posts. What do you set before you hand it over?",
    hint: "The objective's verb is install AND configure, and this is the second half. Work from " +
      "what this machine is for and where it lives — the setting that matters is the one whose " +
      "absence somebody would notice on this job and not on another.",
    answer: B.build.configureFirst,
    choices: [B.build.configureFirst].concat(cfgWrong),
    why: function (chosen) {
      if (chosen === B.build.configureFirst) return B.build.configureWhy;
      return "That is worth setting on a different machine. Ask what this one is for and where it " +
        "stands: the setting that matters most is the one whose absence somebody would actually " +
        "notice here.";
    }
  });

  return qs;
}
