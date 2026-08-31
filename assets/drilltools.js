/* =====================================================================
   Field Service Center — objective 2.8

   "Explain networking tools and their purposes."

   The most physical objective in the whole of domain two, and the easiest
   one to turn into a naming quiz. Naming them is not the objective. The
   objective says EXPLAIN THEIR PURPOSES, and a purpose is a sentence about
   what you get out of the thing, which is not the same as what it is
   called.

   So the four fields that matter here are:

   1. WHAT YOU GET FROM IT. A wiremap tester gives you an order. A certifier
      gives you a number and a verdict against a standard. A tone probe
      gives you a noise and nothing else — no reading, no pass, no fail,
      just a sound that gets louder.
   2. WHAT IT WILL NOT TELL YOU. This is the question that separates a
      technician from somebody who owns tools. A continuity tester will
      cheerfully pass a run that cannot carry a gigabit. A certifier will
      pass a cable that is plugged into the wrong port. Knowing where each
      instrument stops is most of the objective.
   3. DOES IT CHANGE THE CABLE OR ONLY LOOK AT IT. Three of these cut,
      crimp or seat conductors and cannot be undone; the rest only report.
      Reaching for the wrong category costs a cable.
   4. DOES IT NEED THE FAR END. Some need a second unit at the other end of
      the run, one IS the far end, and one needs you to walk to the other
      end yourself and listen.

   The panel beside the bench carries what the tool is showing at the moment
   the photograph was taken — a reading, a lamp sequence, a noise, or
   nothing at all, because some of these have no display.
   ===================================================================== */

export const TOOLS = [
  {
    key: "wiremap", name: "Wiremap tester", form: "handheld", alters: false, farEnd: "remote",
    gives: "The order the eight conductors are in at each end, and whether any of them is broken, " +
      "shorted to another, or paired with the wrong partner",
    wont: "Whether the run will actually carry the speed it is meant to. It checks that the " +
      "conductors go where they should, at a voltage low enough to prove nothing about " +
      "interference, length or the quality of the twist",
    use: "Immediately after terminating anything, and first on any run that has just stopped " +
      "working — because most of what goes wrong at a termination is an order somebody got wrong",
    look: "A small unit with a row of numbered lamps and a second, smaller unit that goes on the " +
      "far end of the run.",
    shows: "A row of lamps flashing in sequence, one per conductor",
    lookalike: "certifier",
    lookalikeWhy: "Both are boxes you plug a cable into and both say pass. One says the wires are " +
      "in the right order and the other says the run meets a standard at a stated frequency, and " +
      "only the second one is worth anything to somebody signing off an installation."
  },
  {
    key: "certifier", name: "Cable certifier", form: "handheld", alters: false, farEnd: "remote",
    gives: "A measurement of the run against a published standard — loss, crosstalk, delay and " +
      "length — and a result you can put in a report with a date on it",
    wont: "Anything about whether the run is patched to the right place. A perfect result on a " +
      "cable plugged into the wrong port is a perfect result",
    use: "Handing over an installation somebody is paying for, or settling an argument about " +
      "whether the cabling or the equipment is at fault",
    look: "A large two-piece instrument with a screen, in a padded case, with adaptors for " +
      "different standards.",
    shows: "A screen of measured figures against limits, and one word at the top",
    lookalike: "wiremap",
    lookalikeWhy: "They do the same gesture — plug in, press a button, read a verdict — and cost " +
      "two orders of magnitude apart. One proves the wires are in order; the other proves the run " +
      "performs, and only one of those two is evidence."
  },
  {
    key: "toner", name: "Tone generator and probe", form: "twopiece", alters: false, farEnd: "walk",
    gives: "A noise. You clip the generator to one end and carry the probe until the noise gets " +
      "loud, and that is the whole of what it tells you",
    wont: "Anything at all about whether the cable works. It will find you a cable that is cut " +
      "clean through just as happily as one that is perfect",
    use: "An unlabelled bundle. Sixty identical white cables in a rack and one of them is the one " +
      "you want — nothing else in the bag solves that problem",
    look: "Two pieces that are not joined to each other: a small box with clips, and a wand with " +
      "a speaker in the handle.",
    shows: "Nothing to read. A tone, getting louder",
    lookalike: "wiremap",
    lookalikeWhy: "Both are two pieces and both get used on a run that is not working. One tells " +
      "you WHERE a cable is and the other tells you WHAT is wrong with it, and reaching for the " +
      "wrong one wastes an afternoon."
  },
  {
    key: "punchdown", name: "Punch-down tool", form: "hand", alters: true, farEnd: "none",
    gives: "A conductor seated into an insulation-displacement contact, with the waste end cut " +
      "off in the same movement",
    wont: "Any indication of whether you seated it correctly. It makes a noise when it fires and " +
      "that noise means the spring released, not that the connection is good",
    use: "Terminating solid-core cable onto the back of a patch panel or a wall outlet, which is " +
      "where the building's own cabling ends",
    look: "A handle with a spring in it and a removable blade at the end, marked so that one side " +
      "cuts and the other does not.",
    shows: "Nothing. It has no display and never has",
    lookalike: "crimper",
    lookalikeWhy: "Both are hand tools that make a permanent joint on the end of a cable, and " +
      "people say “crimp it down” for both. One seats solid conductors into a block; the other " +
      "squeezes a plug onto stranded cable, and neither will do the other's job."
  },
  {
    key: "crimper", name: "Crimping tool", form: "hand", alters: true, farEnd: "none",
    gives: "A modular plug permanently squeezed onto the end of a cable, with the contacts driven " +
      "through the insulation and the strain relief closed behind them",
    wont: "Whether the conductors were in the right order when you closed the handles. It commits " +
      "whatever you put in front of it",
    use: "Making up a patch lead, or putting a plug on a run that has to end in one rather than " +
      "in an outlet",
    look: "Two handles with a shaped die between them, sized for one kind of plug and no other.",
    shows: "Nothing. It has no display and never has",
    lookalike: "punchdown",
    lookalikeWhy: "Both make a joint that cannot be undone, and both get called crimping. Look at " +
      "the business end: a shaped die that closes around a plug, or a single blade that pushes a " +
      "wire into a slot."
  },
  {
    key: "strippers", name: "Cable jacket stripper", form: "hand", alters: true, farEnd: "none",
    gives: "The outer jacket removed cleanly, at a set depth, without touching the insulation on " +
      "the conductors underneath it",
    wont: "Any warning that you have gone too deep. A nicked conductor looks perfect and fails " +
      "later, under vibration or under load",
    use: "Every termination, before anything else happens — and the depth setting is the whole " +
      "reason to own one rather than using a knife",
    look: "A small ring or a clamshell body with a blade whose depth is adjustable, that you turn " +
      "around the cable rather than dragging along it.",
    shows: "Nothing. It has no display and never has",
    lookalike: "snips",
    lookalikeWhy: "Both are small cutting tools that live in the same pocket of the same bag. One " +
      "is set to cut part-way through and the other is set to cut all the way, and using the " +
      "second where you wanted the first costs you the length you just pulled."
  },
  {
    key: "snips", name: "Cable cutters", form: "hand", alters: true, farEnd: "none",
    gives: "A clean square cut through the whole cable, with the conductors ending level with " +
      "each other",
    wont: "Anything. It is a cutting tool and the only judgement in it is yours",
    use: "Cutting a run to length, and squaring off a bundle of conductors before they go into a " +
      "plug so that they all reach the contacts",
    look: "Short curved jaws that shear rather than pinch, so the cut end stays round instead of " +
      "being squashed flat.",
    shows: "Nothing. It has no display and never has",
    lookalike: "strippers",
    lookalikeWhy: "The same pocket, the same size and the same gesture. One goes all the way " +
      "through on purpose and the other must not, and the difference matters the moment you " +
      "reach without looking."
  },
  {
    key: "loopback", name: "Loopback plug", form: "small", alters: false, farEnd: "isthefarend",
    gives: "A path from a port's transmit side straight back to its own receive side, so the " +
      "machine can send something and see whether it comes back",
    wont: "Anything about the cabling, the switch or anything else beyond the port. It proves one " +
      "interface can talk to itself and stops exactly there",
    use: "Deciding whether a port is dead before anybody goes looking at the cable, the patch " +
      "panel or the switch on the other end of it",
    look: "A plug with no cable on it at all — the wires loop back inside the body, which is " +
      "usually a centimetre long.",
    shows: "Nothing itself. Whatever it proves shows up on the machine it is plugged into",
    lookalike: "wiremap",
    lookalikeWhy: "Both answer “is this end all right”, and both are cheap. One needs a whole run " +
      "and a unit at the far end; the other is the far end, and it never leaves the room."
  },
  {
    key: "tap", name: "Network tap", form: "inline", alters: false, farEnd: "none",
    gives: "A copy of everything crossing a link, sent out of a third port, without the two ends " +
      "of that link knowing anything has happened",
    wont: "Any interpretation. It hands you traffic; something else has to make sense of it, and " +
      "it will not tell you which of the two directions a problem is in either",
    use: "Watching a link you are not allowed to interrupt, or one where the switch cannot mirror " +
      "the port and you need to see what is genuinely on the wire",
    look: "A small box in the middle of a run with a port in, a port out, and a third port that " +
      "only ever sends.",
    lookalike: "analyser",
    lookalikeWhy: "They are used in the same breath and one is usually plugged into the other. " +
      "One is how you GET the traffic and the other is what READS it, and a copy of a link with " +
      "nothing looking at it is a wasted afternoon.",
    shows: "Nothing to read. A lamp on each port and no display of any kind"
  },
  {
    key: "analyser", name: "Protocol analyser", form: "screen", alters: false, farEnd: "none",
    gives: "Every frame on the link, decoded, with the timing between them — so you can see who " +
      "asked, whether anything answered, and how long it took",
    wont: "Anything about a link it is not on. It sees the segment it is attached to and nothing " +
      "beyond the first device that decides where traffic goes",
    use: "Once the physical layer is proved and the fault is still there — when the question has " +
      "stopped being “is it plugged in” and become “what is it actually saying”",
    look: "A screen full of numbered lines, one per frame, with a filter box at the top. Software " +
      "as often as it is a box.",
    shows: "A list of frames scrolling, with times against them",
    lookalike: "tap",
    lookalikeWhy: "One collects and the other interprets, and they are almost always used " +
      "together. If you have only one of the two, you either have traffic nobody is reading or a " +
      "reader with nothing to read."
  },
  {
    key: "wifianalyser", name: "Wi-Fi analyser", form: "screen", alters: false, farEnd: "none",
    gives: "What is on the air where you are standing: which networks, on which channels, at what " +
      "strength — and how much of the band is already taken",
    wont: "Anything about anything with a cable on it. If the complaint turns out to be a switch " +
      "port, this instrument will spend all afternoon telling you the air is fine",
    use: "Before choosing a channel, and every time somebody says it works in this room and not " +
      "in that one",
    look: "A screen showing bars or a graph across a band, usually on a handset or a laptop.",
    shows: "A graph across a band, with a bar for each network found",
    lookalike: "analyser",
    lookalikeWhy: "Both are screens full of measurements and both have “analyser” in the name. " +
      "One reads the air and one reads the wire, and pointing either at the other's problem " +
      "produces a very confident report about the wrong thing."
  },
  {
    key: "opticalmeter", name: "Optical power meter", form: "handheld", alters: false, farEnd: "source",
    gives: "How much light is arriving at the far end, in decibels, so you can compare it with " +
      "how much was put in and know what the run cost you",
    wont: "Where the loss is. It gives you a total for the whole path and says nothing about " +
      "which splice, which connector or which bend is responsible",
    use: "Commissioning or fault-finding a fibre run, with a light source of a known output at " +
      "the other end of it",
    look: "A small meter with a threaded adaptor on the top for the connector, and a separate " +
      "source that goes on the far end.",
    shows: "One number, in decibels, and the wavelength it was measured at",
    lookalike: "certifier",
    lookalikeWhy: "Both measure a run and produce a figure with a limit beside it. One works on " +
      "copper and one on glass, and the adaptors on the front are the giveaway — a modular jack " +
      "or a threaded ferrule mount."
  },
  {
    key: "fishtape", name: "Fish tape and rods", form: "reel", alters: false, farEnd: "none",
    gives: "A cable pulled through a space you cannot reach into — a conduit, a wall cavity, a " +
      "floor void — with something on the end of it to pull",
    wont: "Anything electrical whatsoever. It is a pulling tool, and whether what you pulled is " +
      "any good is a separate instrument and a separate question",
    use: "Getting a run from where it is to where it needs to be, when the route is enclosed and " +
      "nobody is taking the wall down",
    look: "A flat steel or fibreglass tape on a reel, or a set of screw-together rods, with an " +
      "eye at the end to attach a cable to.",
    shows: "Nothing. It has no display and never has",
    lookalike: "snips",
    lookalikeWhy: "Not a pairing about appearance — a pairing about the order of the job. One " +
      "gets the cable to the place and the other trims it when it arrives, and doing the second " +
      "before the first leaves you a run that is too short."
  },
  {
    key: "multimeter", name: "Multimeter", form: "handheld", alters: false, farEnd: "none",
    gives: "Voltage, resistance and continuity between two points you choose, on anything with " +
      "conductors in it",
    wont: "Anything about a network as a network. It will tell you a conductor is continuous " +
      "without any opinion at all about what is at either end of it or whether the pairs are in " +
      "order",
    use: "Proving there is or is not a path, and checking a supply — including the moment " +
      "somebody suspects a device is being fed down its cable and nothing is arriving",
    look: "A meter with a dial, two leads and two probes, that measures things other than " +
      "networks most of the time.",
    shows: "One figure at a time, on whichever range the dial is set to",
    lookalike: "wiremap",
    lookalikeWhy: "Both prove continuity and both are cheap and both live in the same bag. One " +
      "checks two points you chose; the other checks all eight conductors against each other and " +
      "tells you the order, which is what a network cable actually needs."
  },
  {
    /* Pairs with the F-type connector in the 3.2 drill. A student who can
       identify that connector and cannot terminate it has half the skill. */
    key: "compression", name: "Coaxial compression tool", form: "hand", alters: true, farEnd: "none",
    gives: "Nothing. It has no display and it reports nothing \u2014 it is a tool that changes " +
      "the cable rather than one that measures it",
    wont: "Tell you whether the termination is any good. That is a separate test with a " +
      "separate instrument, and skipping it is how a bad end reaches the customer",
    use: "Terminating coaxial runs \u2014 seating a compression connector onto prepared cable " +
      "so the centre conductor stands out at the right length and the shield is captured",
    look: "A hand tool with a shaped cradle at one end and a plunger at the other, sized for " +
      "one family of connector.",
    shows: "Nothing. There is no display on it at all",
    lookalike: "crimper",
    lookalikeWhy: "Both are hand tools that permanently attach a connector, and both are " +
      "called crimpers on site. One folds contacts down onto conductors in a modular plug; the " +
      "other pushes a sleeve along a coaxial body until it seats. Neither will do the other's " +
      "job and a connector done with the wrong one fails intermittently rather than outright."
  },
  {
    /* Pairs with the LC, SC and ST connectors in 3.2, and with the optical
       power meter already here — the meter says how much light; this says
       where the light stops. */
    key: "vfl", name: "Visual fault locator", form: "handheld", alters: false, farEnd: "none",
    gives: "A visible red light injected into the fibre, so a break, a tight bend or a bad " +
      "termination glows where it is",
    wont: "Any number at all. It tells you WHERE, not how much \u2014 a link can pass this and " +
      "still be too lossy to work",
    use: "Finding a break in a short run, checking continuity end to end, and confirming which " +
      "of two identical fibres is which before you cut anything",
    look: "A pen-sized handheld with a threaded adapter at the tip and a bright red source " +
      "behind it.",
    shows: "Nothing on a display. The evidence is on the cable, not on the tool",
    lookalike: "opticalmeter",
    lookalikeWhy: "Both are handhelds you attach to a fibre and both come out of the same " +
      "pouch. One measures received power in dB and gives you a number to compare against a " +
      "budget; the other just makes the fault visible. Reporting a link good because this one " +
      "lit up is exactly the mistake it invites."
  },
  {
    /* Pairs with the wireless survey in 2.2, which currently teaches coverage
       with no way to see what is competing for the air. */
    key: "spectrum", name: "Spectrum analyser", form: "screen", alters: false, farEnd: "none",
    gives: "Everything using the air in the band, whether it is Wi-Fi or not \u2014 energy " +
      "against frequency, over time",
    wont: "Name a network or read a frame. It does not know what Wi-Fi is; it sees radio energy " +
      "and shows you where it is",
    use: "When the survey looks fine and the link still will not hold \u2014 a microwave, a " +
      "cordless phone, a camera or a neighbour's radar sits in the band and no Wi-Fi tool can " +
      "see any of it",
    look: "A screen showing a waterfall or a sweep across a frequency range, with a stubby " +
      "antenna rather than a network port.",
    shows: "A trace across a band, with peaks where something is transmitting",
    lookalike: "wifianalyser",
    lookalikeWhy: "Both are screens you carry round a building looking at wireless problems, " +
      "and both draw graphs of the same bands. One decodes Wi-Fi and lists networks, channels " +
      "and strengths; the other sees ALL radio energy and names none of it. Interference that " +
      "is not Wi-Fi is invisible to the first and obvious on the second, which is exactly the " +
      "fault you reach for it on."
  },
];

const BY = {};
TOOLS.forEach(function (t) { BY[t.key] = t; });
export { BY as BY_KEY };

function pick(D, field, n, rnd) {
  var it = D.item;
  var want = String(it[field]);
  var look = BY[it.lookalike];
  var out = [], seen = {};
  seen[want] = 1;
  function take(c) {
    if (c.key === it.key) return;
    var v = String(c[field]);
    if (out.length >= n || seen[v]) return;
    seen[v] = 1; out.push(c);
  }
  if (look) take(look);
  rnd(TOOLS).forEach(take);
  return out.slice(0, n);
}

/* ---------------------------------------------------------------------
   What the tool is showing.

   Not what it is called and not what it is for. Several of these have
   nothing to show, and "no display of any kind" is a reading in its own
   right — a tool that cannot report is a tool that does something instead.
   --------------------------------------------------------------------- */
export function panelRows(D) {
  var it = D.item;
  var end = { remote: "A second unit, on the far end of the run",
    walk: "None — the other piece is not joined to this one and you carry it",
    isthefarend: "None. This IS what goes on the far end",
    source: "A separate source of known output, on the far end",
    none: "None. It works where it is" }[it.farEnd];
  return [
    { k: "On the display", v: it.shows },
    { k: "What it needs at the other end", v: end },
    { k: "What it leaves behind", v: it.alters
        ? "A permanent change to the cable, which cannot be undone"
        : "Nothing. The cable is exactly as it was" },
    { k: "How long it takes", v: it.alters ? "Seconds, and then it is done"
        : it.farEnd === "walk" ? "As long as it takes you to walk the bundle"
        : "Seconds to plug in, longer to understand" }
  ];
}

export function toolQuestions(D, rnd) {
  var it = D.item;
  var qs = [];

  qs.push({
    id: "which",
    ask: "Which tool is this?",
    hint: "Look at the working end first, then at whether there is anything to read on it. A tool " +
      "with no display does something rather than reports something, and that halves the list.",
    answer: it.name,
    choices: [it.name].concat(pick(D, "name", 3, rnd).map(function (c) { return c.name; })),
    why: function (chosen) {
      if (chosen === it.name) return it.look + " " + it.lookalikeWhy;
      var o = TOOLS.filter(function (c) { return c.name === chosen; })[0];
      return o ? "That is a real tool and it is not this one. " + o.look
        : "That is not what is on the bench.";
    }
  });

  qs.push({
    id: "gives",
    ask: "What do you get out of it?",
    hint: "Not what it is for — what it hands you. An order, a number against a standard, a " +
      "noise, a copy of some traffic, or a permanent change to a cable.",
    answer: it.gives,
    choices: [it.gives].concat(pick(D, "gives", 3, rnd).map(function (c) { return c.gives; })),
    why: function (chosen) {
      if (chosen === it.gives) {
        return "Yes. " + it.gives + ". That sentence is the purpose, and the purpose is what the " +
          "objective actually asks you to explain.";
      }
      return "That is what a different tool hands you. Look at what is on the display beside the " +
        "bench, and at whether there is a display at all.";
    }
  });

  /* The one worth building the whole exercise around. */
  qs.push({
    id: "wont",
    ask: "What will it NOT tell you?",
    hint: "Every instrument stops somewhere, and the fault you are chasing is often just past " +
      "where this one stops. Ask what somebody could conclude from a pass on it that would still " +
      "be wrong.",
    answer: it.wont,
    choices: [it.wont].concat(pick(D, "wont", 3, rnd).map(function (c) { return c.wont; })),
    why: function (chosen) {
      if (chosen === it.wont) {
        return "Correct, and this is the important one. " + it.wont + ". Knowing where an " +
          "instrument stops is what stops you trusting a pass that does not mean what you thought.";
      }
      return "That is where a different instrument stops. Work from what this one measures: " +
        "anything it does not measure, it has no opinion about, however confident the lamp looks.";
    }
  });

  qs.push({
    id: "use",
    ask: "When do you reach for it?",
    hint: "The moment in the job, not the category of tool. Some of these come out before " +
      "anything is terminated, some the instant a run stops working, and one only after the " +
      "physical layer has already been proved.",
    answer: it.use,
    choices: [it.use].concat(pick(D, "use", 3, rnd).map(function (c) { return c.use; })),
    why: function (chosen) {
      if (chosen === it.use) return "Right. " + it.use + ".";
      return "That is when a different tool comes out. Work back from what this one hands you: " +
        "the moment you need that particular thing is the moment you reach for it.";
    }
  });

  qs.push({
    id: "confused",
    ask: "Which tool does it get confused with?",
    hint: "Not the one that looks most like it — the one somebody reaches for instead, and then " +
      "draws a confident conclusion from.",
    answer: BY[it.lookalike].name,
    choices: (function () {
      var set = [BY[it.lookalike].name];
      pick(D, "name", 6, rnd).forEach(function (c) {
        if (set.length < 4 && c.key !== it.lookalike && set.indexOf(c.name) === -1) set.push(c.name);
      });
      return set;
    })(),
    why: function (chosen) {
      if (chosen === BY[it.lookalike].name) return it.lookalikeWhy;
      return "That one is separable at a glance. The pairing this question wants is the one that " +
        "ends with somebody certain of something that is not true.";
    }
  });

  return qs;
}
