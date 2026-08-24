/* =====================================================================
   Field Service Center — objective 3.6

   "Install the appropriate power supply."

   THE POWER TRACK ALREADY TROUBLESHOOTS SUPPLIES — measuring rails, finding
   an open ground, deciding whether a supply or the thing it feeds is at
   fault. This is the other half and the book's own verb says so: INSTALL
   THE APPROPRIATE ONE. Nothing is broken. There is a machine to build, a
   parts list, and the question is which supply to order.

   So, like 2.6 and 3.5, this is a decision exercise with generated numbers:
   the parts list, the case, and the card all come from the seed, and every
   graded answer is arithmetic or a comparison on them.

   THE FIVE DECISIONS:

   1. HOW MANY WATTS. Add up what the parts actually draw, then leave
      headroom — because a supply run at its absolute limit is a supply run
      hot, loud and briefly. The arithmetic is on the page and the headroom
      figure is stated, so it is a calculation rather than a guess.
   2. WHICH CONNECTORS, AND HOW MANY. A supply with enough watts and the
      wrong plugs is the wrong supply. The card's connector is the one that
      catches people, and the current generation of them changed.
   3. WHICH FORM FACTOR. It has to physically fit the case and line up with
      the screws. A supply that is right in every other respect and three
      centimetres too long is a second delivery.
   4. WHAT THE EFFICIENCY RATING ACTUALLY BUYS. Not speed. Less heat and a
      smaller electricity bill, and on a machine that runs all day those are
      real; on one that runs an hour a week they are not.
   5. WHAT NOT TO DO. The one that is a safety answer rather than a
      specification answer, because this objective is the one where getting
      it wrong is a fire rather than a fault.

   The panel beside the bench carries the parts list with a draw against
   each line — the numbers a technician would have — and never a total,
   because the total is the first answer.
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

/* The sizes a supply is sold in. A technician picks from a shelf, not from
   a continuum, so the answer is the smallest one on the shelf that clears
   the requirement. */
const SIZES = [300, 400, 500, 550, 650, 750, 850, 1000, 1200, 1600];

/* The shapes, and what each one is for. */
const SHAPES = {
  atx:  { name: "the standard tower size", fits: "a tower or a mini tower with a normal bay" },
  sfx:  { name: "the small one, about two thirds the length", fits: "a small-form-factor chassis " +
    "where a standard one will not go in at all" },
  tfx:  { name: "the long thin one, laid on its side", fits: "a slim desktop case that lies flat " +
    "under a monitor" },
  flex: { name: "the very small one out of a compact machine", fits: "a compact chassis, and " +
    "usually only the one it came out of" }
};

/* What the card at the top of the parts list wants. The connector on the
   current generation is not the connector on the last one, and that is the
   detail that turns an order into a second order. */
const CARD_PLUGS = {
  none:   { plug: "none — nothing on this list needs a card connector at all",
    why: "Nothing on the list draws enough on its own to need one. The board feeds what there is." },
  six:    { plug: "one six-pin card lead",
    why: "A modest card takes one, and almost any supply of the right size has one." },
  eight:  { plug: "one eight-pin card lead, made of six pins and two that clip on beside them",
    why: "The two extra pins clip onto the six, which is why a lead like this is written as six " +
      "plus two — and why a supply that only has plain six-pin leads will not do." },
  double: { plug: "two eight-pin card leads, on separate cables rather than one cable split in two",
    why: "A card at this level wants two, and it wants them on separate cables. A single cable " +
      "with two heads on it is carrying both through one set of wires, which is how a connector " +
      "gets hot enough to discolour." },
  twelve: { plug: "one twelve-volt high-power card lead, the newer sort with the four small sense " +
      "pins beside the twelve big ones",
    why: "The current generation of card uses a single dense connector instead of two or three " +
      "of the older ones, and the four small pins beside the big ones are how the card asks the " +
      "supply how much it may draw. An adaptor from the old leads exists and is the thing that " +
      "has caused the melting people have read about — seat it fully and prefer a supply with " +
      "the connector natively." }
};

export const JOBS = [
  {
    key: "tower", name: "A tower for a design office", shape: "atx",
    duty: "all day, every working day",
    dontDo: "Do not reuse the supply out of the machine this replaces just because it is the " +
      "right size and it works",
    dontWhy: "A supply that has run all day for six years has capacitors that have dried out. It " +
      "measures fine at idle and sags under the load the new parts will put on it, and the fault " +
      "that follows looks like the memory, the board or the drive — anything except the part " +
      "everybody assumes is fine because it powers on."
  },
  {
    key: "slim", name: "A slim desktop under a counter", shape: "tfx",
    duty: "all day, every working day",
    dontDo: "Do not open the supply to look, whatever the symptoms are",
    dontWhy: "There are capacitors in there that hold a lethal charge after it is unplugged, and " +
      "there is nothing serviceable inside for anybody who is not equipped for it. A supply is a " +
      "sealed replaceable part, and the sticker saying so is the only warning you get."
  },
  {
    key: "sff", name: "A small-form-factor machine for a reception desk", shape: "sfx",
    duty: "office hours",
    dontDo: "Do not fit a standard-size supply by leaving the case side off",
    dontWhy: "A chassis is part of the cooling. Running one open changes where the air goes, and " +
      "on top of that the machine now has a hole in it in a public area — which is a different " +
      "kind of problem and a worse one."
  },
  {
    key: "render", name: "A render node that runs continuously", shape: "atx",
    duty: "continuously, day and night",
    dontDo: "Do not run it at more than about eighty per cent of its rating just because it is " +
      "rated for more",
    dontWhy: "A supply at its limit runs hot, runs its fan flat out, and ages fast. Headroom is " +
      "not waste — it is the difference between a part that lasts five years and one that lasts " +
      "eighteen months, and on a machine that never stops that is the whole calculation."
  },
  {
    key: "till", name: "A till machine behind a counter", shape: "flex",
    duty: "trading hours",
    dontDo: "Do not fit a supply with a manual voltage selector set to the wrong position",
    dontWhy: "The older sort has a red switch on the back with two numbers on it. Set to the " +
      "lower one on a higher supply, it destroys itself and sometimes the machine, immediately " +
      "and audibly. Check it before the machine is ever plugged in."
  },
  {
    key: "editor", name: "An editing workstation", shape: "atx",
    duty: "all day, every working day",
    dontDo: "Do not use the adaptor that came in the card's box in preference to a supply with " +
      "the right connector on it",
    dontWhy: "An adaptor turns several old leads into one new one and puts every one of those " +
      "joints in the path of a very large current. Seated even slightly proud, it is the " +
      "connector that gets hot — and this is the failure people have photographs of."
  },
  {
    key: "cctv", name: "A recorder with a lot of drives", shape: "atx",
    duty: "continuously, day and night",
    dontDo: "Do not daisy-chain every drive onto one lead because the connectors are there",
    dontWhy: "A drive lead has several connectors on it because most machines have one or two " +
      "drives, not because the wire behind them was sized for all of them at once. Spread them " +
      "across the leads the supply gives you."
  },
  {
    key: "lab", name: "A teaching lab machine", shape: "atx",
    duty: "office hours",
    dontDo: "Do not fit a supply from an unbranded seller because the number on the box is large " +
      "enough",
    dontWhy: "The number on the box is a claim. On the cheapest supplies it is a peak the part " +
      "cannot hold, protection circuits are absent, and when it fails it takes the board with it " +
      "— which turns a cheap supply into an expensive afternoon."
  },
  {
    key: "kiosk", name: "A kiosk behind a screen", shape: "flex",
    duty: "all day, every working day",
    dontDo: "Do not mount it where its fan is against a panel",
    dontWhy: "It has to draw air in and push it out, and a machine bolted flat against something " +
      "does neither. The supply cooks itself slowly and the failure is months away, which makes " +
      "it very hard for anybody to connect to the installation."
  },
  {
    key: "server", name: "A back-office server", shape: "atx",
    duty: "continuously, day and night",
    dontDo: "Do not assume two supplies in the chassis means either one can be pulled at any time",
    dontWhy: "Two supplies are redundant only if each one on its own can carry the whole load. If " +
      "the machine was specified so that both are needed at peak, pulling one is an outage rather " +
      "than a test — check the figures before anybody proves it."
  },
  {
    key: "audio", name: "A studio machine that has to be silent", shape: "atx",
    duty: "office hours",
    dontDo: "Do not choose the smallest supply that clears the total",
    dontWhy: "A supply loafing at a third of its rating runs its fan slowly or not at all; the " +
      "same load on a supply that only just clears it runs the fan hard. On a machine chosen for " +
      "silence, the headroom is the feature."
  },
  {
    key: "compact", name: "A compact machine for a workshop bench", shape: "sfx",
    duty: "office hours",
    dontDo: "Do not force the leads flat behind the board to make the side panel close",
    dontWhy: "The bend radius on a heavy lead matters, and a connector under sideways load pulls " +
      "out of true over time. If it will not close without forcing, the supply is the wrong shape " +
      "for that chassis and no amount of pressure changes that."
  },
  {
    key: "surgery", name: "A machine in a treatment room", shape: "sfx",
    duty: "clinic hours, with the machine never switched off between patients",
    dontDo: "Do not mix leads from a different supply, even when the plug fits the socket",
    dontWhy: "Modular leads are not a standard. The socket on the supply and the plug on the lead " +
      "are the same shape between manufacturers and sometimes between models of one manufacturer, " +
      "and the pinout behind them is not. It fits, it powers on, and it puts twelve volts where " +
      "the board expected ground. Keep each supply with the bag its own leads came in."
  },
  {
    key: "warehouse", name: "A stock terminal on a warehouse mezzanine", shape: "flex",
    duty: "two shifts a day, six days a week",
    dontDo: "Do not fit a supply without checking what its fan draws through",
    dontWhy: "A machine in a place with dust in the air fills its supply with it, and a supply " +
      "full of dust runs hotter every month. The decision at fit time is a filter that somebody " +
      "can clean, not a bigger number on the box — because the number does not change what the " +
      "air is carrying."
  },
  {
    key: "boardroom", name: "A machine behind a boardroom display", shape: "tfx",
    duty: "a few hours a week, and it must start every time",
    dontDo: "Do not judge a supply by whether the machine powers on when you press the button",
    dontWhy: "Powering on proves the standby rail and nothing else. A supply that has sagged on " +
      "one rail starts a machine perfectly and drops it the moment something asks for current — " +
      "which on a machine used twice a week means the fault appears in front of the people who " +
      "booked the room, and never on the bench."
  },
  {
    key: "classroom", name: "A machine on a classroom trolley that gets moved", shape: "sfx",
    duty: "school hours, moved between rooms most days",
    dontDo: "Do not leave the supply held in by fewer than its four screws because three line up",
    dontWhy: "On a machine that never moves, three screws holds. On one that is wheeled between " +
      "rooms, the supply works against its own weight every trip, the leads take the movement, " +
      "and what turns up months later is an intermittent that looks like anything but a loose " +
      "supply. If three line up and the fourth does not, it is the wrong shape."
  },
  {
    key: "reception", name: "A reception machine that must survive a power cut", shape: "atx",
    duty: "all day, every working day, on a battery backup",
    dontDo: "Do not put a supply with active power factor correction on a cheap battery backup " +
      "without checking the two together",
    dontWhy: "The cheaper sort of backup produces a stepped approximation of mains rather than a " +
      "sine wave, and the correction circuit in a modern supply can refuse it — so the machine " +
      "shuts down at the exact moment the backup was bought to prevent. The supply is not faulty " +
      "and neither is the backup; they are the wrong pair, and that is a decision made at fit " +
      "time rather than a fault found later."
  }
];

const BY = {};
JOBS.forEach(function (j) { BY[j.key] = j; });
export { BY as BY_KEY };

/* How much headroom to leave, stated on the page so the arithmetic is
   determined by what a student can read rather than by a rule of thumb they
   have to already know. */
export const HEADROOM = 0.30;

/* ---------------------------------------------------------------------
   The parts list, and what it draws.
   --------------------------------------------------------------------- */
export function jobFrom(D) {
  var it = D.item;
  var mix = 0;
  for (var c = 0; c < it.key.length; c++) mix = (mix * 131 + it.key.charCodeAt(c)) >>> 0;
  var r = rand((D.seedBase + 0x7C3 + mix) >>> 0);

  var small = it.shape === "sfx" || it.shape === "flex";

  /* The card is the biggest single line and the one that decides the
     connectors, so it is generated first. */
  var cardKind = small ? pickOne(r, ["none", "none", "six"])
    : pickOne(r, ["none", "six", "eight", "eight", "double", "twelve", "twelve"]);
  var cardW = { none: 0, six: 75, eight: 180, double: 340, twelve: 450 }[cardKind];

  var cpuW = small ? pickInt(r, 35, 65) : pickInt(r, 65, 170);
  var boardW = pickInt(r, 30, 55);
  var dimms = small ? 2 : pickOne(r, [2, 2, 4]);
  var dimmW = dimms * 4;
  var drives = it.key === "cctv" ? pickInt(r, 6, 10) : pickInt(r, 1, 3);
  var driveW = drives * pickOne(r, [6, 8, 9]);
  var fans = small ? pickInt(r, 1, 2) : pickInt(r, 3, 6);
  var fanW = fans * 3;

  var total = cardW + cpuW + boardW + dimmW + driveW + fanW;
  var need = Math.round(total * (1 + HEADROOM));

  var chosen = SIZES.filter(function (w) { return w >= need; })[0] || SIZES[SIZES.length - 1];

  return {
    job: it, shape: SHAPES[it.shape], shapeKey: it.shape,
    cardKind: cardKind, card: CARD_PLUGS[cardKind], cardW: cardW,
    cpuW: cpuW, boardW: boardW, dimms: dimms, dimmW: dimmW,
    drives: drives, driveW: driveW, fans: fans, fanW: fanW,
    total: total, need: need, chosen: chosen
  };
}

/* ---------------------------------------------------------------------
   The parts list.

   Every line with its draw, and deliberately NO TOTAL — the total is the
   first answer, and a page that prints it is a page that has done the
   arithmetic for you.
   --------------------------------------------------------------------- */
export function listRows(D) {
  var J = jobFrom(D);
  return [
    { k: "Processor", v: J.cpuW + " W under load" },
    { k: "Board and everything on it", v: J.boardW + " W" },
    { k: "Memory", v: J.dimms + " modules, " + J.dimmW + " W between them" },
    { k: "Drives", v: J.drives + " of them, " + J.driveW + " W between them" },
    { k: "Fans", v: J.fans + ", " + J.fanW + " W between them" },
    { k: "Expansion card", v: J.cardW ? J.cardW + " W under load" : "None on this list" },
    { k: "Headroom the specification asks for", v: Math.round(HEADROOM * 100) + " per cent above " +
        "the measured total" },
    { k: "How the machine is used", v: J.job.duty },
    { k: "The chassis", v: J.shape.fits }
  ];
}

/* ---------------------------------------------------------------------
   The five decisions.
   --------------------------------------------------------------------- */
export function psuQuestions(D, rnd) {
  var J = jobFrom(D);
  var qs = [];

  /* 1 — how many watts. */
  /* The wrong sizes are the shelf's own neighbours, walked OUTWARD from the
     right one in both directions until three have been found. Taking a fixed
     window of offsets is what a first draft does, and it quietly collapses to
     two distractors whenever the right answer sits at either end of the
     shelf — which for a small chassis is most of the time. A question with
     three choices instead of four is a question a student can win by
     guessing, and no browser walk can see it happen. */
  var idx = SIZES.indexOf(J.chosen);
  var wattWrong = [];
  for (var step = 1; step < SIZES.length && wattWrong.length < 3; step++) {
    [idx - step, idx + step].forEach(function (i) {
      if (wattWrong.length >= 3) return;
      if (i >= 0 && i < SIZES.length && SIZES[i] !== J.chosen) wattWrong.push(SIZES[i] + " W");
    });
  }
  qs.push({
    id: "watts",
    ask: "Which size do you order?",
    hint: "Add every line on the list, then add the headroom the specification asks for. Then " +
      "take the smallest size on the shelf that clears the result — supplies are sold in steps, " +
      "not in whatever number you calculated.",
    answer: J.chosen + " W",
    choices: [J.chosen + " W"].concat(rnd(wattWrong).slice(0, 3)),
    why: function (chosen) {
      if (chosen === J.chosen + " W") {
        return "Right. The lines add to " + J.total + " W, plus " + Math.round(HEADROOM * 100) +
          " per cent is " + J.need + " W, and " + J.chosen + " is the smallest size sold that " +
          "clears it. Headroom is not waste: a supply run near its limit runs hot, runs its fan " +
          "hard and ages fast.";
      }
      /* NEITHER of these may print the figure the student is working towards.
         The headroom total lands exactly on a shelf size often enough that
         naming it hands over the answer, and the point of the exercise is the
         arithmetic. Both branches say which way to move and why. */
      var n = parseInt(chosen, 10);
      if (n < J.need) {
        return "That is under what the machine needs. The lines add to " + J.total + " W, and the " +
          "specification asks for " + Math.round(HEADROOM * 100) + " per cent on top of that — " +
          "work the second figure out before you go back to the shelf. A supply that cannot hold " +
          "the peak shuts the machine off under load rather than failing politely.";
      }
      return "That clears the figure, but it is not the size you would order: there is at least " +
        "one smaller size on the shelf that also clears it. Work back down the shelf until you " +
        "reach the smallest one that still does. Buying two steps up is money spent on nothing, " +
        "unless the machine is one where the headroom itself is the feature.";
    }
  });

  /* 2 — which connectors. */
  var plugAnswer = J.card.plug;
  var plugWrong = Object.keys(CARD_PLUGS).filter(function (k) { return k !== J.cardKind; })
    .map(function (k) { return CARD_PLUGS[k].plug; });
  qs.push({
    id: "plugs",
    ask: "What must it have on it for the card on this list?",
    hint: "Watts are only half of it. A supply with the right number on the box and the wrong " +
      "leads in the bag is the wrong supply — and the card connector changed at the current " +
      "generation, so an assumption from two years ago is not safe.",
    answer: plugAnswer,
    choices: [plugAnswer].concat(rnd(plugWrong).slice(0, 3)),
    why: function (chosen) {
      if (chosen === plugAnswer) return J.card.why;
      var k = Object.keys(CARD_PLUGS).filter(function (x) { return CARD_PLUGS[x].plug === chosen; })[0];
      return "That is what a different card wants. " + (k ? CARD_PLUGS[k].why + " " : "") +
        "Read the card's own line on the list and match the supply to it, rather than assuming " +
        "the leads that were right on the last build are right on this one.";
    }
  });

  /* 3 — which shape. */
  var shapeAnswer = J.shape.name;
  var shapeWrong = Object.keys(SHAPES).filter(function (k) { return k !== J.shapeKey; })
    .map(function (k) { return SHAPES[k].name; });
  qs.push({
    id: "shape",
    ask: "Which shape of supply does this chassis take?",
    hint: "This one is decided by the case and by nothing else. A supply that is right on every " +
      "other count and will not physically go in is a second delivery and a wasted visit.",
    answer: shapeAnswer,
    choices: [shapeAnswer].concat(rnd(shapeWrong).slice(0, 3)),
    why: function (chosen) {
      if (chosen === shapeAnswer) {
        return "Right — this chassis is " + J.shape.fits + ", so it takes " + J.shape.name + ". " +
          "Measure or check the model before ordering: the mounting screws line up or they do not.";
      }
      return "That shape belongs in a different chassis. The case decides this one entirely, and " +
        "no amount of headroom or the right connectors makes a supply fit a bay it is too long for.";
    }
  });

  /* 4 — what the efficiency rating buys. */
  var heavy = /continuously/.test(J.job.duty);
  var effAnswer = heavy
    ? "Less heat and a noticeably smaller electricity bill — and on a machine that never stops, " +
      "that difference is worth paying for"
    : "Less heat and a smaller electricity bill, which on a machine used this lightly will take " +
      "years to pay for the difference in price";
  var effWrong = [
    heavy
      ? "Less heat and a smaller electricity bill, which on a machine used this lightly will take " +
        "years to pay for the difference in price"
      : "Less heat and a noticeably smaller electricity bill — and on a machine that never stops, " +
        "that difference is worth paying for",
    "More available watts. A better-rated supply of the same size can deliver more than its " +
      "number says",
    "A cleaner supply to the board, which is what actually makes a machine stable",
    "A longer warranty, which is the only real difference between the ratings"
  ];
  qs.push({
    id: "efficiency",
    ask: "What does paying for a higher efficiency rating actually buy on THIS machine?",
    hint: "Efficiency is about what is wasted as heat on the way through, not about what comes " +
      "out the other side. So the value of it depends entirely on how many hours the machine is " +
      "running — read the line on the list that says how it is used.",
    answer: effAnswer,
    choices: [effAnswer].concat(rnd(effWrong.filter(function (t) { return t !== effAnswer; }))
      .slice(0, 3)),
    why: function (chosen) {
      if (chosen === effAnswer) {
        return "Correct. Efficiency is how much of what goes in comes out rather than becoming " +
          "heat, so its value is measured in hours. This machine runs " + J.job.duty +
          (heavy ? ", so it pays back — and the lower heat is worth having on its own."
                 : ", so the saving is real but small, and the money may be better spent " +
                   "elsewhere on the build.");
      }
      return "Not what it buys. A rating describes how much is wasted as heat on the way through " +
        "— it does not change the watts available, does not make the output cleaner, and is not " +
        "a warranty. What it is worth depends on how many hours the machine runs.";
    }
  });

  /* 5 — the safety answer. */
  var dontWrong = JOBS.filter(function (j) { return j.dontDo !== J.job.dontDo; });
  var seen = {}, picks = [];
  rnd(dontWrong).forEach(function (j) {
    if (picks.length >= 3 || seen[j.dontDo]) return;
    seen[j.dontDo] = 1; picks.push(j.dontDo);
  });
  qs.push({
    id: "dont",
    ask: "What is the thing NOT to do on this particular job?",
    hint: "Every one of these is a real mistake somebody makes. The one that matters here follows " +
      "from this machine's chassis, its duty and what is on its parts list — so read those before " +
      "you choose.",
    answer: J.job.dontDo,
    choices: [J.job.dontDo].concat(picks),
    why: function (chosen) {
      if (chosen === J.job.dontDo) return J.job.dontWhy;
      return "That is a real mistake, and it is not the one this job invites. Work from what is " +
        "in front of you: the shape of the chassis, how many hours it runs, and what is on the " +
        "parts list.";
    }
  });

  return qs;
}
