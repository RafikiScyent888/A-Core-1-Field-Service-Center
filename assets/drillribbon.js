/* =====================================================================
   Field Service Center — objective 3.7, the thermal transfer ribbon path

   The printer-types drill already tells a direct thermal machine from a
   thermal transfer one, and says the ribbon is the whole difference. It
   never asks the student to THREAD the thing, and threading it is where
   the job is actually got wrong.

   WHY THIS IS NOT A DIAGRAM TO COPY. Label printers are built left-handed
   and right-handed: the same machine mirrored, supply and take-up swapped
   end for end. A technician who has learned the path on one machine by
   its shape has learned nothing about the other, and the service sheet on
   the wall is for whichever one the site bought first. So the machine here
   is randomly handed, and the exercise is built so that memorising a
   picture fails and understanding the rule works.

   THE RULE, and it is the only thing worth carrying out of here:

       THE COATED SIDE FACES THE LABEL. NEVER THE PRINT HEAD.

   Everything else follows from it. Which way the ribbon comes off the
   supply roll follows from which side the coating is on. Which spindle is
   which follows from the handedness. Get the rule and both machines are
   the same machine; memorise a path and you have one machine's worth of
   knowledge and a fifty-fifty chance.

   WHAT GOES WRONG, and why the wrong answers here are the real ones:

     Threaded backwards      the ribbon advances, the labels come out
                             blank, and the coating transfers onto the head
                             instead of the label. It looks like a dead
                             head and it is a threading error.
     Ribbon narrower than    the head runs directly on the label either
     the stock               side of the ribbon. That is abrasion on a
                             consumable-priced part, and it is silent.
     Wrong ribbon for the    it prints, and then it scratches off. Wax on
     stock                   a synthetic label is the classic.
     Ribbon empties first    NOT A FAULT. A ribbon roll and a label roll
                             are different lengths and never run out
                             together. One ticket here is this, and the
                             answer is to say nothing is wrong.
     No ribbon at all        one machine in the pool is DIRECT thermal.
                             There is no ribbon, no spindles and nothing to
                             thread, and the right answer is to say so
                             rather than to look for a path.

   Nothing below is a table of answers. The handedness, the coating side,
   the ribbon and stock widths and the symptom all come from the seed, and
   every graded answer is computed from them.
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

/* Ribbon chemistries against what they are meant to mark. Wax is cheap and
   soft, resin is tough and dear, and the mixture sits between them. Putting
   the cheap one on the tough stock is the mistake that prints beautifully
   and then wipes off in a week. */
export const RIBBONS = [
  { key: "wax", name: "Wax", suits: ["paper"],
    why: "Soft, cheap, and it marks uncoated paper well. It has no resistance to rubbing " +
      "and none at all to solvent." },
  { key: "waxresin", name: "Wax/resin", suits: ["paper", "coated"],
    why: "The middle option. It will take a coated paper label and stands up to handling, " +
      "which plain wax does not." },
  { key: "resin", name: "Resin", suits: ["synthetic"],
    why: "The tough one, and the only thing that will stay on a synthetic label. It needs more " +
      "head energy and it costs more, which is why people try to avoid it and then reprint " +
      "everything a fortnight later." }
];

export const STOCKS = [
  { key: "paper", name: "Uncoated paper label", life: "Indoor, short life, thrown away with the box" },
  { key: "coated", name: "Coated paper label", life: "Handled, scanned repeatedly, kept for months" },
  { key: "synthetic", name: "Synthetic (polypropylene) label", life: "Outdoors, chemicals, or the life of the asset" }
];

/* The stations the ribbon passes, in the order it meets them. Positions are
   given as a side — "supply", "guide", "head", "guide", "take-up" — and the
   handedness decides which physical end of the machine each side is at.
   That separation is the whole point: the ORDER never changes, the SIDES
   mirror, and a student who has the order has both machines. */
export const STATIONS = [
  { key: "supply",   name: "Ribbon supply spindle",
    note: "The full roll. It pays out under light back-tension so the ribbon does not go slack." },
  { key: "backbar",  name: "Rear guide bar",
    note: "Turns the ribbon from the roll into the plane of the paper path and keeps it square." },
  { key: "head",     name: "Print head and platen",
    note: "The only place anything is printed. The ribbon and the label pass through together, " +
      "and which of them faces the head is the whole exercise." },
  { key: "frontbar", name: "Front guide bar",
    note: "Peels the spent ribbon away from the label after the head, so the two separate cleanly." },
  { key: "takeup",   name: "Ribbon take-up spindle",
    note: "Winds the spent ribbon on. It is driven, and over-tensioning it is what tears ribbons." }
];

/* ---------------------------------------------------------------------
   THE MACHINES

   Handedness and type belong to the MACHINE, not to the seed: a model is
   built one way round and stays that way, and half the point of the
   exercise is that the technician meets both builds across a fleet. What
   the seed decides is the stock, the widths and what has gone wrong.

   Four of the seventeen are direct thermal and have no ribbon at all.
   --------------------------------------------------------------------- */
export const MACHINES = [
  { key: "desk-l",    name: "Desktop label printer, under a counter", hand: "left",  direct: false, form: "label",
    note: "The commonest machine on a small site, and the one people learn the path on" },
  { key: "desk-r",    name: "Desktop label printer, on a packing bench", hand: "right", direct: false, form: "label",
    note: "The same machine as the one under the counter, built the other way round" },
  { key: "ind-l",     name: "Industrial label printer in a despatch bay", hand: "left",  direct: false, form: "label",
    note: "Metal-bodied, runs all shift, and the head is a scheduled part" },
  { key: "ind-r",     name: "Industrial label printer on a second line", hand: "right", direct: false, form: "label",
    note: "Same make and duty as the despatch machine, opposite build" },
  { key: "dt-desk",   name: "Desktop shipping label printer", hand: "right", direct: true, form: "label",
    note: "Sits beside the transfer machines and looks like one of them" },
  { key: "dt-receipt",name: "Till receipt printer", hand: "left",  direct: true, form: "receipt",
    note: "Continuous roll, torn off at the bar. No labels and no ribbon" },
  { key: "wide-l",    name: "Wide-format label printer, pallet labels", hand: "left",  direct: false, form: "label",
    note: "Wide stock, and wide stock is where ribbon width goes wrong" },
  { key: "wide-r",    name: "Wide-format label printer, second bay", hand: "right", direct: false, form: "label",
    note: "The mirror of the pallet machine" },
  { key: "dt-port",   name: "Belt-worn portable label printer", hand: "right", direct: true, form: "label",
    note: "Battery, printed from a handheld. There is no room in it for a ribbon" },
  { key: "table-r",   name: "Tabletop label printer in a laboratory", hand: "right", direct: false, form: "label",
    note: "Small synthetic labels that live on equipment for years" },
  { key: "table-l",   name: "Tabletop label printer in a stores cage", hand: "left",  direct: false, form: "label",
    note: "Asset tags, handled constantly" },
  { key: "apply-r",   name: "Print-and-apply head on a conveyor", hand: "right", direct: false, form: "label",
    note: "Prints and applies in one movement, and stops the line when it jams" },
  { key: "narrow-l",  name: "Desktop printer running narrow cable labels", hand: "left", direct: false, form: "label",
    note: "Narrow stock on a machine that will take much wider" },
  { key: "ind-wide-r",name: "Industrial printer running drum labels", hand: "right", direct: false, form: "label",
    note: "Chemical drums, so the label has to survive what is in them" },
  { key: "desk-r2",   name: "Desktop printer at a goods-in desk", hand: "right", direct: false, form: "label",
    note: "Shared between two people on different shifts, threaded by both" },
  { key: "dt-ship",   name: "Carrier-supplied shipping printer", hand: "left",  direct: true, form: "label",
    note: "Supplied by the courier and not on the site's own maintenance list" },
  { key: "ind-l2",    name: "Industrial printer in a cold store", hand: "left",  direct: false, form: "label",
    note: "Cold, damp, and hard on both consumables" }
];

/* ---------------------------------------------------------------------
   THE MACHINE ON THIS TICKET
   --------------------------------------------------------------------- */
export function buildJob(D) {
  const m = D.item;
  if (!m || !m.hand) {
    throw new Error("drillribbon: dealt an item that is not a machine. The pool is MACHINES.");
  }
  /* Seeded on the MACHINE as well as the session. Seeding on the session
     alone gave every ticket in a sitting the same stock, the same coating
     side and the same fault — seventeen machines and one scenario, which a
     student would spot in about four minutes and stop reading the panel. */
  let h = 0;
  for (let i = 0; i < m.key.length; i++) h = (h * 31 + m.key.charCodeAt(i)) | 0;
  const r = rand(((D.seedBase || 1) + 4421) ^ (h * 2654435761));

  const hand = m.hand;
  const direct = !!m.direct;
  const coated = pickOne(r, ["in", "out"]);
  const stock = pickOne(r, STOCKS);
  const stockWidth = pickOne(r, [50, 75, 100, 104]);

  /* What has gone wrong, if anything. Two of the six draws are "nothing",
     because a drill where something is always wrong teaches a student to
     find a fault whether or not there is one. */
  const fault = direct ? "none" : pickOne(r,
    ["ok", "ok", "backwards", "narrow", "wrongtype", "ribbonout"]);

  const correctRibbon = RIBBONS.filter((x) => x.suits.indexOf(stock.key) >= 0)[0] ||
    RIBBONS[RIBBONS.length - 1];
  const fittedRibbon = fault === "wrongtype"
    ? (RIBBONS.filter((x) => x.suits.indexOf(stock.key) < 0)[0] || RIBBONS[0])
    : correctRibbon;

  /* A ribbon must be at least as wide as the stock, or the head runs on the
     label. Narrower is the fault; wider is normal and correct. */
  const ribbonWidth = fault === "narrow"
    ? stockWidth - pickOne(r, [15, 20, 25])
    : stockWidth + pickOne(r, [0, 5, 10]);

  return {
    machine: m, direct: direct, hand: hand, coated: coated,
    stock: stock, stockWidth: stockWidth,
    ribbon: fittedRibbon, correctRibbon: correctRibbon, ribbonWidth: ribbonWidth,
    fault: fault,
    model: (direct ? "DT-" : "TT-") + (200 + Math.floor(r() * 90)) +
      (hand === "left" ? "L" : "R")
  };
}

/* Which physical end of the machine each station sits at. Derived from the
   handedness — never written down twice — so a right-handed machine is the
   mirror of a left-handed one by construction rather than by a second
   table somebody has to remember to update. */
export function sideOf(J, stationKey) {
  if (stationKey === "head") return "centre";
  const nearSide = J.hand === "left" ? "left" : "right";
  const farSide = J.hand === "left" ? "right" : "left";
  if (stationKey === "supply" || stationKey === "backbar") return nearSide;
  return farSide;
}

/* Which way the ribbon leaves the supply roll.

   Not a fact to memorise — it falls out of the geometry, and the exercise
   says so. Take the ribbon at the TOP of a roll: the face that was against
   the core is now pointing down. Take it from the BOTTOM: that same face
   points up. The coating has to end up pointing down at the label, so:

     coated side IN  (against the core)  -> it must come off the TOP
     coated side OUT (facing the world)  -> it must come off the BOTTOM  */
export function unwindOf(J) {
  return J.coated === "in" ? "over the top of the roll" : "from underneath the roll";
}

export function pathOf(J) {
  return STATIONS.map(function (s) {
    return { key: s.key, name: s.name, side: sideOf(J, s.key), note: s.note };
  });
}

/* ---------------------------------------------------------------------
   THE REFERENCE PANEL — what the student can read off the machine.
   Deliberately does NOT state the path or the coating side: those are the
   answers, and printing them beside the question is how a drill becomes a
   reading test.
   --------------------------------------------------------------------- */
export function ribbonPanel(D) {
  const J = buildJob(D);
  const rows = [
    { k: "Machine", v: J.machine.name },
    { k: "Model", v: J.model },
    { k: "Type", v: J.direct ? "Direct thermal" : "Thermal transfer" },
    { k: "Build", v: J.hand === "left" ? "Left-handed" : "Right-handed" },
    { k: "Label stock", v: J.stock.name },
    { k: "Stock width", v: J.stockWidth + " mm" }
  ];
  if (!J.direct) {
    rows.push({ k: "Ribbon fitted", v: J.ribbon.name });
    rows.push({ k: "Ribbon width", v: J.ribbonWidth + " mm" });
    rows.push({ k: "Ribbon wind", v: J.coated === "in" ? "Coated side in" : "Coated side out" });
  }
  return rows;
}

/* ---------------------------------------------------------------------
   THE GRADED DECISIONS
   --------------------------------------------------------------------- */
export function ribbonQuestions(D, rnd) {
  const J = buildJob(D);
  const qs = [];
  const other = J.hand === "left" ? "right" : "left";

  /* 1. IS THERE A RIBBON AT ALL. Asked on every ticket, because the answer
     is only interesting when it is sometimes no. */
  qs.push({
    id: "hasribbon",
    ask: "Before you open anything: does this machine take a ribbon?",
    hint: "One line on the panel settles it, and it is not the model number. What makes the " +
      "mark on a direct thermal machine?",
    answer: J.direct ? "No — it is direct thermal, there is nothing to thread"
                     : "Yes — it is thermal transfer, and the ribbon has to be threaded",
    choices: ["Yes — it is thermal transfer, and the ribbon has to be threaded",
              "No — it is direct thermal, there is nothing to thread",
              "Only when printing on synthetic stock",
              "Only on right-handed machines"],
    why: function (chosen) {
      const right = J.direct ? "No — it is direct thermal" : "Yes — it is thermal transfer";
      if (J.direct) {
        return chosen.indexOf("No") === 0
          ? "Right. A direct thermal machine marks heat-sensitive stock directly: no ribbon, no " +
            "spindles, nothing to thread. Somebody fitting a ribbon to one of these has bought a " +
            "consumable the machine cannot use."
          : "No — this one is direct thermal. The panel says so, and the whole path question " +
            "does not exist on this machine. Looking for a ribbon path here is the mistake, and " +
            "reading the type line first is what avoids it.";
      }
      return chosen.indexOf("Yes") === 0
        ? "Right. Thermal transfer melts a coating off a ribbon onto ordinary stock, so there is " +
          "a ribbon and it has to go in the right way round."
        : "No — " + right + ". The panel names the type, and it is the first thing to read: it " +
          "decides whether there is a path to get right at all.";
    }
  });

  if (J.direct) return qs;

  /* 2. WHICH SPINDLE IS WHICH. The mirror question. */
  const supplySide = sideOf(J, "supply");
  qs.push({
    id: "spindles",
    /* The handedness is on the plate beside the model and NOT in the
       question. Putting it in the question turns "read the machine in
       front of you" into "read the sentence", which is the habit this
       exercise exists to break. */
    ask: "Which spindle on this machine is the SUPPLY — the full roll?",
    hint: "The plate says which way round this machine is built. Do not reach for the path " +
      "you used on the last one; work out which end THIS one runs from.",
    answer: "The " + supplySide + "-hand spindle",
    choices: ["The " + supplySide + "-hand spindle",
              "The " + other + "-hand spindle",
              "Whichever one has the larger roll on it",
              "Either — the machine works it out and drives the empty one"],
    why: function (chosen) {
      return chosen === "The " + supplySide + "-hand spindle"
        ? "Yes. On a " + J.hand + "-handed machine the ribbon runs from the " + supplySide +
          " and winds on at the " + other + ". Fit the same machine in its other handedness and " +
          "that swaps end for end — which is exactly why the answer to remember is the rule " +
          "about the coated side and not a picture of one machine."
        : "No — the " + supplySide + "-hand spindle. " +
          (chosen.indexOf("larger") >= 0
            ? "Judging it by roll size works until you meet a machine somebody has half used, or " +
              "a fresh take-up that came with a starter wind on it."
            : "The spindles are not interchangeable: one pays out under back-tension and the " +
              "other is driven. This machine is " + J.hand + "-handed, and that decides it.");
    }
  });

  /* 3. WHICH FACE MEETS THE LABEL. The rule itself. */
  qs.push({
    id: "coatedface",
    ask: "At the head, which side of the ribbon has to face the label?",
    hint: "Think about what actually has to move from the ribbon to the label, and what would " +
      "happen to the head if it went the other way.",
    answer: "The coated side — the coating has to reach the label",
    choices: ["The coated side — the coating has to reach the label",
              "The uncoated side, so the coating is protected from the label",
              "Whichever side the roll happens to present",
              "It only matters on synthetic stock"],
    why: function (chosen) {
      return chosen.indexOf("The coated side") === 0
        ? "Yes, and this is the one rule to carry out of here. The coating is the ink: it has to " +
          "be against the label for the head to melt it across. Turn it round and the head melts " +
          "the coating onto ITSELF — blank labels, and a head being progressively gummed up by " +
          "the thing that was meant to print."
        : "No — the coated side faces the label. " +
          "Threaded the other way the ribbon still advances and the machine still sounds right, " +
          "so it presents as a dead head rather than as a threading mistake. That is why it is " +
          "worth being certain rather than trying it.";
    }
  });

  /* 4. WHICH WAY OFF THE ROLL. Derived from the coating side, and the
     reasoning is given rather than the fact. */
  const unwind = unwindOf(J);
  const wrongUnwind = J.coated === "in" ? "from underneath the roll" : "over the top of the roll";
  qs.push({
    id: "unwind",
    ask: "Which way does the ribbon come off the supply roll?",
    hint: "Picture the ribbon leaving the very top of the roll: the face that was against the " +
      "core is now pointing down. Leaving from the bottom, that same face points up. You know " +
      "which face has to end up pointing down at the label.",
    answer: unwind,
    choices: [unwind, wrongUnwind,
              "Straight off the end of the roll, sideways",
              "Either way — the guide bar turns it over"],
    why: function (chosen) {
      return chosen === unwind
        ? "Yes — " + unwind + ". Coated side " + J.coated + " means the coating is " +
          (J.coated === "in" ? "against the core, so the ribbon has to come over the top to put " +
            "that face downward at the head." : "on the outside, so it has to feed from " +
            "underneath to put that face downward at the head.") +
          " Nothing to memorise: it falls out of where the coating is."
        : chosen === wrongUnwind
          ? "No — " + unwind + ". That is the right idea and the wrong way round: coming off " +
            "the " + (J.coated === "in" ? "bottom" : "top") + " presents the UNcoated face to " +
            "the label, which is the backwards-threading fault with extra steps."
          : "No — " + unwind + ". The guide bar squares the ribbon up and keeps it in the paper " +
            "path; it does not flip it over. Which face is down is decided at the roll.";
    }
  });

  /* 5. THE WIDTH RULE. */
  const widthOK = J.ribbonWidth >= J.stockWidth;
  qs.push({
    id: "width",
    ask: "Read the two widths on the plate. Is the ribbon fitted right for this stock?",
    hint: "Ask what the head is running on wherever the ribbon is not.",
    answer: widthOK
      ? "Yes — the ribbon is at least as wide as the stock"
      : "No — the ribbon is narrower than the stock and must be changed",
    choices: ["Yes — the ribbon is at least as wide as the stock",
              "No — the ribbon is narrower than the stock and must be changed",
              "No — the ribbon should be narrower so it does not overhang",
              "It does not matter as long as the print fits inside the label"],
    why: function (chosen) {
      const right = widthOK
        ? "Yes — the ribbon is at least as wide as the stock"
        : "No — the ribbon is narrower than the stock and must be changed";
      return chosen === right
        ? (widthOK
          ? "Right. Ribbon the same width as the stock or wider, always. Wider costs a little " +
            "more and protects the head; the same width is fine."
          : "Right, and this one has to be changed before it is run. Wherever the ribbon does " +
            "not cover the label, the head is in direct contact with the label face and abrading " +
            "against it. The print will look perfectly acceptable while that is happening.")
        : "No — " + right + ". " +
          (chosen.indexOf("narrower so it does not overhang") >= 0
            ? "Overhang is not a problem; bare head on bare label is. A ribbon narrower than the " +
              "stock leaves the head running on the label at both edges."
            : "This is not about whether the print fits. It is about what the head touches " +
              "outside the printed area, and a head is not a consumable.");
    }
  });

  /* 6. THE SYMPTOM. Only asked where the seed produced one. */
  const SYMPTOM = {
    backwards: {
      seen: "The ribbon advances normally, the labels come out completely blank, and there is a " +
        "mirror image of the print building up on the ribbon itself.",
      right: "The ribbon is threaded the wrong way round",
      why: "The coating is going onto the head instead of the label. The mirror image on the " +
        "spent ribbon is the giveaway and it is visible without a tool: what should have been " +
        "printed IS printed, on the wrong surface."
    },
    narrow: {
      seen: "The print is clean, but the head has developed a scratched band at each edge of the " +
        "label and the machine is only a few months old.",
      right: "The ribbon is narrower than the label stock",
      why: "Where the ribbon does not cover the label, the head runs on the label face. The " +
        "print stays good the whole time this is happening, which is why it goes unnoticed until " +
        "the head is worn."
    },
    wrongtype: {
      seen: "It prints sharply, and a fortnight later the labels coming back off the shelf are " +
        "smudged where they have been handled.",
      right: "The ribbon chemistry does not suit the stock",
      why: "A " + J.ribbon.name.toLowerCase() + " ribbon on " + J.stock.name.toLowerCase() +
        ". It transfers and looks right; it has no durability on this material. " +
        J.correctRibbon.why
    },
    ribbonout: {
      seen: "The ribbon has run out with most of the label roll still on the spindle. The " +
        "operator wants to know what is wrong with the machine.",
      right: "Nothing is wrong — they are different lengths and never run out together",
      why: "A ribbon roll and a label roll hold different lengths, and a transfer machine gets " +
        "through them at different rates. This is a consumable being consumed. Telling the " +
        "operator that, rather than looking for a fault, is the answer."
    }
  };
  const sym = SYMPTOM[J.fault];
  if (sym) {
    const wrong = Object.keys(SYMPTOM).filter(function (k) { return k !== J.fault; })
      .map(function (k) { return SYMPTOM[k].right; });
    qs.push({
      id: "symptom",
      ask: sym.seen + " What is it?",
      hint: "Work from what the evidence rules OUT. Something that prints sharply has a working " +
        "head and a ribbon that is transferring; something that prints nothing at all does not.",
      answer: sym.right,
      choices: [sym.right].concat(rnd(wrong).slice(0, 3)),
      why: function (chosen) {
        return chosen === sym.right
          ? "Yes. " + sym.why
          : "No — " + sym.right + ". " + sym.why;
      }
    });
  }

  return qs;
}
