/* =====================================================================
   Field Service Center — objectives 3.7 and 3.8

   "Deploy and configure multifunction devices/printers and settings", and
   "Perform appropriate printer maintenance."

   The build had two printer tracks, laser and inkjet, and they are the two
   a technician meets most. They are also only two of the five the objective
   names. Thermal, impact and 3D printers had no coverage anywhere in this
   build at all — not a ticket, not a drill, not a question — which left a
   student who met one on the exam with nothing to reason from and a student
   who met one at a till with nothing at all.

   The discriminators here are not subtle, and that is the point: every one
   of them is something you can see or touch on the machine.

   1. WHAT MAKES THE MARK. Heat against treated paper, a ribbon struck by
      pins, powder fused by heat, ink sprayed, or plastic laid down in
      layers. Naming this names the machine.
   2. WHAT YOU REPLACE, AND HOW OFTEN. The consumable is the maintenance,
      and it is different on all five. Two of them have a consumable that is
      the paper itself.
   3. HOW THE PAPER MOVES. A roll, a tractor feed with sprocket holes, a
      tray, or no paper at all.
   4. CAN IT MAKE A CARBON COPY. Exactly one family can, because exactly one
      family strikes the page. This single question separates the impact
      printers from everything else and it is the one students get wrong.

   The maintenance half is graded on the same items, because the objective
   pairs them and because a technician who cannot name the machine cannot
   service it either.
   ===================================================================== */

export const PRINTERS = [
  {
    key: "receipt", name: "Direct thermal receipt printer", family: "thermal", form: "receipt",
    marks: "Heat applied directly to paper that darkens where it is heated",
    consumable: "The paper roll, and nothing else. There is no ink, no ribbon and no toner in it",
    interval: "Clean the print head with isopropyl alcohol every few rolls, and clear the " +
      "paper dust that builds up around the cutter",
    feed: "A roll dropped into a hinged bin, pulled through by a rubber roller",
    carbon: false,
    output: "Receipts and tickets that fade in months and go black in a hot car",
    look: "A small box beside a till with a lid that flips open for the roll, one rubber " +
      "roller, a serrated tear bar or a cutter, and no cartridge of any kind inside.",
    fault: "Print fades across the whole width, or drops out in one vertical stripe",
    faultWhy: "A whole-width fade is a tired head or the wrong paper; one clean vertical " +
      "stripe is a single dead heating element, and no amount of cleaning brings that back",
    lookalike: "label",
    lookalikeWhy: "The same technology in a different box, and people call both of them " +
      "'the thermal printer'. What differs is what comes out: a continuous roll you tear, or " +
      "die-cut stock the machine has to find the gap between. The second one has a sensor " +
      "the first does not, and that sensor is what fails."
  },
  {
    key: "label", name: "Direct thermal label printer", family: "thermal", form: "label",
    marks: "Heat applied directly to label stock that darkens where it is heated",
    consumable: "The label roll. Again no ink \u2014 the stock is the consumable",
    interval: "Clean the head, and recalibrate the gap sensor whenever the label size changes",
    feed: "A roll on a spindle, with a sensor watching for the gap between labels",
    carbon: false,
    output: "Shipping and shelf labels that will not survive a year in sunlight",
    look: "A squarer box than a receipt printer with a wide roll on a spindle inside, an " +
      "adjustable guide either side of it, and a small sensor looking across the paper path.",
    fault: "It feeds several blank labels for every one it prints, or prints across the gap",
    faultWhy: "That is calibration, not a fault. The machine has lost where one label ends " +
      "and has started guessing, and the fix is to run the calibration rather than to " +
      "replace anything",
    lookalike: "transfer",
    lookalikeWhy: "Identical from the outside and they take the same rolls. Open the lid: " +
      "if there is a ribbon in there it is a transfer machine, and if there is not, the " +
      "label itself is heat-sensitive. Putting plain stock in one and treated stock in the " +
      "other gives you blank labels either way."
  },
  {
    key: "transfer", name: "Thermal transfer label printer", family: "thermal", form: "label",
    marks: "Heat applied to a ribbon, melting its coating onto ordinary label stock",
    consumable: "Two things, and they run out at different rates \u2014 the ribbon and the labels",
    interval: "Head clean at every ribbon change, and match the ribbon type to the stock",
    feed: "A roll on a spindle, with the ribbon running with it between head and label",
    carbon: false,
    output: "Labels that survive weather, abrasion and years, which is why they go on assets",
    look: "A label printer with a second spindle inside carrying a ribbon, and a take-up " +
      "spool winding the used ribbon back on.",
    fault: "Print is perfect on one side of the label and missing on the other",
    faultWhy: "The ribbon is narrower than the stock, or it has crept sideways. The head is " +
      "working across its whole width; there is simply nothing under part of it",
    lookalike: "label",
    lookalikeWhy: "Same shape, same rolls, same software. The ribbon is the whole difference, " +
      "and it is the difference between a label that lasts a decade and one that fades in a " +
      "summer. Ordering the wrong stock for the machine you have wastes both."
  },
  {
    key: "dotmatrix", name: "Dot matrix printer", family: "impact", form: "impact",
    marks: "Pins driven against an inked ribbon, striking the paper",
    consumable: "The ribbon cartridge, and the print head itself eventually",
    interval: "Replace the ribbon before it fades, and keep the platen and paper path clear " +
      "of the paper dust this machine makes more of than any other",
    feed: "A tractor feed pulling continuous paper by its sprocket holes",
    carbon: true,
    output: "Multipart forms \u2014 the copy underneath is made by the blow, not by the ink",
    look: "A wide slab of a machine with a carriage that travels, a ribbon cartridge across " +
      "the front of it, and sprocket wheels either side of the paper path.",
    fault: "One horizontal line is missing from every character on the page",
    faultWhy: "A dead pin in the head. It is not a ribbon fault and it is not software \u2014 " +
      "the same row is missing everywhere because the same pin fails to fire everywhere",
    lookalike: "line",
    lookalikeWhy: "Both strike the page and both take continuous paper, so both make carbon " +
      "copies. One has a head that travels across the page; the other has a mechanism as wide " +
      "as the paper and does a whole line at once. Listen to it: one sweeps, the other hammers."
  },
  {
    key: "line", name: "Line printer", family: "impact", form: "impact",
    marks: "A band or chain of characters struck against the paper through a ribbon",
    consumable: "The ribbon, and the band or chain, which wears and is a scheduled part",
    interval: "Ribbon changes, band inspection, and the paper path swept out \u2014 these run " +
      "for hours at a time and make dust the whole time they do",
    feed: "A tractor feed pulling continuous paper by its sprocket holes",
    carbon: true,
    output: "High-volume reports and multipart forms where speed matters more than looks",
    look: "A large floor-standing or cabinet machine with a mechanism spanning the full paper " +
      "width, no travelling carriage, and a lid that has to close before it will run.",
    fault: "Characters are printed but drift up and down within the line",
    faultWhy: "The band or chain timing has slipped against the hammers. It is a mechanical " +
      "adjustment, and it will not be fixed by anything in the driver",
    lookalike: "dotmatrix",
    lookalikeWhy: "Both are impact, both take sprocket-fed paper and both do carbons. The " +
      "difference is a whole line at a time against one character at a time, and it shows in " +
      "the noise and the speed rather than in the output."
  },
  {
    key: "fdm", name: "3D printer, filament (FDM)", family: "3d", form: "fdm",
    marks: "Molten plastic laid down in layers by a moving nozzle",
    consumable: "Filament on a spool, and nozzles, which wear and clog and are consumable " +
      "whatever the manual implies",
    interval: "Level the bed, clean the nozzle, check the belts for tension \u2014 and keep " +
      "filament dry, because damp filament prints badly and looks like a hardware fault",
    feed: "No paper at all. A heated bed the object is built on, and it has to be level",
    carbon: false,
    output: "A solid object, built up in layers, over hours rather than seconds",
    look: "An open frame with a gantry moving in two axes, a spool of plastic on the side, a " +
      "heated bed underneath, and no paper path anywhere on it.",
    fault: "The first layer will not stick, or the print detaches part way up",
    faultWhy: "Bed level and bed temperature, in that order, before anything else is " +
      "suspected. Almost every failed print on this machine failed in its first millimetre",
    lookalike: "resin",
    lookalikeWhy: "Both build an object in layers and both are called 'the 3D printer'. One " +
      "melts plastic through a nozzle in the open air; the other cures liquid resin with " +
      "light in a sealed vat, and the second one needs gloves, ventilation and a wash station " +
      "the first does not. Treating them alike is a safety problem, not a preference."
  },
  {
    key: "resin", name: "3D printer, resin (SLA/MSLA)", family: "3d", form: "resin",
    marks: "Liquid resin cured layer by layer by ultraviolet light",
    consumable: "Resin, and the film in the bottom of the vat, which clouds and must be replaced",
    interval: "Filter and store the resin, replace the vat film, and clean the build plate. " +
      "Gloves and ventilation every time \u2014 uncured resin is an irritant and a skin sensitiser",
    feed: "No paper. A build plate that rises out of a vat of liquid",
    carbon: false,
    output: "A finer, smoother object than filament gives, which then has to be washed and cured",
    look: "A sealed box with an orange or red hood, a vat of liquid in the bottom, and a " +
      "plate that lifts out of it. No spool and no nozzle anywhere.",
    fault: "Layers separate, or the print is stuck to the vat rather than the plate",
    faultWhy: "Adhesion and exposure. The plate is not level or the exposure is too short, and " +
      "the print has cured to the film instead of to the plate",
    lookalike: "fdm",
    lookalikeWhy: "Both are 3D printers and both build in layers. The consumables, the " +
      "maintenance and the safety precautions have almost nothing in common, and a technician " +
      "who servicing one the way they service the other will get resin on their hands."
  },
  {
    key: "laserdesk", name: "Laser printer", family: "laser", form: "laser",
    marks: "Powder attracted to a charged drum and then fused to the page by heat and pressure",
    consumable: "Toner, and on many machines a drum or imaging unit with a life of its own",
    interval: "Replace toner and drum on their counters, and clean the paper path \u2014 with " +
      "a toner-rated vacuum, never a domestic one and never compressed air",
    feed: "A tray of cut sheets, picked one at a time",
    carbon: false,
    output: "Fast, sharp, dry pages that do not smudge",
    look: "A closed box with a front or side door hiding a cartridge, a paper tray underneath, " +
      "and a fuser behind that runs hot enough to warn you about.",
    fault: "A repeating mark down the page at a regular interval",
    faultWhy: "Something round is dirty or damaged, and the interval tells you which roller: " +
      "measure the gap and match it to the circumference",
    lookalike: "inkjetdesk",
    lookalikeWhy: "Both sit on a desk, take a tray of paper and hide a cartridge behind a " +
      "door. One fuses powder with heat and the other sprays liquid. Run a highlighter over " +
      "the output: one smears and one does not."
  },
  {
    key: "inkjetdesk", name: "Inkjet printer", family: "inkjet", form: "inkjet",
    marks: "Liquid ink sprayed through nozzles onto the page",
    consumable: "Ink cartridges, and on many machines a waste ink pad with a counter that " +
      "eventually stops the machine",
    interval: "Run a nozzle check before assuming a fault, clean heads sparingly because each " +
      "clean spends ink, and keep it powered so it can maintain itself",
    feed: "A tray or a rear feed of cut sheets",
    carbon: false,
    output: "Photographic quality on the right paper, and output that is wet when it emerges",
    look: "A lighter machine than a laser with a carriage that travels across the page on a " +
      "rail, cartridges riding on it or fed by tubes, and no fuser.",
    fault: "Bands missing from the print, and a nozzle check with gaps in it",
    faultWhy: "Blocked nozzles, usually from sitting unused. That is a cleaning cycle, not a " +
      "cartridge \u2014 replacing ink that is not empty fixes nothing and costs money",
    lookalike: "laserdesk",
    lookalikeWhy: "The same footprint and the same paper tray, and the words are used " +
      "interchangeably by callers. What is inside is completely different, and so is what you " +
      "do when it goes wrong."
  },
  {
    key: "mfp", name: "Multifunction device", family: "laser", form: "laser",
    marks: "Whichever engine is inside it \u2014 usually laser, sometimes inkjet",
    consumable: "The engine's consumable, plus a scanner that needs its glass and its feed " +
      "rollers kept clean",
    interval: "Everything the print engine needs, and the document feeder's rollers and " +
      "separation pad, which wear out long before anything else does",
    feed: "A tray for printing, and a document feeder on top for scanning",
    carbon: false,
    output: "Print, scan, copy and often fax, from one queue and one address",
    look: "A printer with a lid and a glass platen on top, a document feeder above that, and " +
      "a panel with more on it than a printer needs.",
    fault: "Copies show a thin dark line down the page but prints from a computer are clean",
    faultWhy: "That is the scanner, not the printer. A speck on the glass at the feeder's " +
      "scan line marks every sheet in the same place \u2014 and prints, which never pass the " +
      "glass, are unaffected",
    lookalike: "laserdesk",
    lookalikeWhy: "It IS a laser printer, with a scanner on top. What that adds is a second " +
      "set of things that go wrong and a second set of consumables, and the fastest way to " +
      "split the two is to compare a copy against a print."
  },
  {
    key: "widecarriage", name: "Wide-carriage impact printer", family: "impact", form: "impact",
    marks: "Pins driven against an inked ribbon, on paper up to a full ledger width",
    consumable: "A long ribbon cartridge, and the head",
    interval: "As the narrow machine, and check the paper is tracking straight \u2014 wide " +
      "stock drifts and tears at the sprockets when it does",
    feed: "A tractor feed at full ledger width",
    carbon: true,
    output: "Wide multipart forms \u2014 invoices, waybills, anything with a carbon underneath",
    look: "A dot matrix printer, but wide enough to take paper sideways, with the tractors " +
      "set far apart and often a second pair of them.",
    fault: "Paper tears at the sprocket holes, or the print walks off the right of the page",
    faultWhy: "Tractor spacing or tension. The tractors have to match the paper and be even " +
      "with each other, and wide stock is far less forgiving of being slightly out",
    lookalike: "dotmatrix",
    lookalikeWhy: "Same technology, same ribbon idea, same carbons. The width is the whole " +
      "difference and it is the reason it exists \u2014 order the narrow one for a site that " +
      "prints ledger-width forms and none of their stationery fits."
  },
  {
    key: "kiosk", name: "Kiosk thermal printer", family: "thermal", form: "receipt",
    marks: "Heat applied directly to paper, in a mechanism built into something else",
    consumable: "The paper roll, in a machine nobody thinks of as a printer until it stops",
    interval: "Head clean and cutter clearance, on a schedule, because nobody will report it " +
      "until there is a queue",
    feed: "A roll inside a cabinet, with a presenter pushing the ticket out to the customer",
    carbon: false,
    output: "Tickets, parking stubs, queue numbers",
    look: "No case of its own \u2014 a mechanism bolted inside a kiosk or a machine, with a " +
      "slot on the outside and everything else hidden.",
    fault: "It prints but the ticket does not come out, or comes out uncut",
    faultWhy: "The cutter or the presenter, not the print engine. The print is on the paper; " +
      "the machine has failed to hand it over",
    lookalike: "receipt",
    lookalikeWhy: "The same engine in a different housing. What differs is access: a counter " +
      "unit is opened in seconds and this one may need the cabinet unlocked and half of it " +
      "removed, which is a scheduling problem more than a technical one."
  },
  {
    key: "photoinkjet", name: "Photo inkjet printer", family: "inkjet", form: "inkjet",
    marks: "Liquid ink sprayed through nozzles, from more colours than an office machine has",
    consumable: "Six or more separate cartridges, and any one of them empty stops the machine",
    interval: "Nozzle checks and head alignment, and use it \u2014 the fastest way to ruin one " +
      "is to leave it standing",
    feed: "A tray, and usually a rear path for heavy or glossy stock that must not bend",
    carbon: false,
    output: "Photographic prints on coated paper, at a cost per page nobody checks first",
    look: "An inkjet with a row of small separate cartridges rather than two big ones, and a " +
      "straight-through paper path at the back.",
    fault: "Colours are wrong rather than missing, and a nozzle check looks clean",
    faultWhy: "Alignment or profile, not blockage. A clean nozzle check rules out the thing " +
      "everybody replaces first",
    lookalike: "inkjetdesk",
    lookalikeWhy: "Both spray ink and both are inkjets. Count the cartridges: an office " +
      "machine has two or four and this has six or more, and the running cost differs by an " +
      "order of magnitude. Recommending one where the other was wanted is an expensive mistake."
  },
  {
    key: "impactslip", name: "Slip and validation printer", family: "impact", form: "impact",
    marks: "Pins striking a ribbon, onto a single sheet fed in by hand",
    consumable: "A small ribbon cartridge",
    interval: "Ribbon changes and keeping the insert slot clear \u2014 it is fed by hand, so it " +
      "collects whatever the hand brings with it",
    feed: "No roll and no tractor. A single slip inserted into a slot and gripped",
    carbon: true,
    output: "Endorsements on cheques, passbooks, and slips that need a carbon copy",
    look: "A small impact machine with a slot in the front rather than a paper tray, and a " +
      "sensor that starts it when something is pushed in.",
    fault: "It grips the slip but prints in the wrong place on it",
    faultWhy: "The insert sensor or the stop position, so the machine has the wrong idea of " +
      "where the top of the document is",
    lookalike: "dotmatrix",
    lookalikeWhy: "Both are impact and both do carbons, which is why one gets ordered for the " +
      "other. The paper handling is the whole difference: continuous stock pulled through " +
      "against single sheets pushed in, and neither machine can do the other's job."
  },
  {
    key: "plotter", name: "Wide-format inkjet plotter", family: "inkjet", form: "inkjet",
    marks: "Liquid ink sprayed through nozzles, across paper up to a metre wide",
    consumable: "Large ink tanks and a roll of media, plus a cutter blade",
    interval: "Nozzle checks, media loading squared up, and the cutter checked \u2014 a skewed " +
      "roll wastes the whole roll rather than one sheet",
    feed: "A roll on a spindle, cut to length after each drawing",
    carbon: false,
    output: "Drawings, plans and posters at full size",
    look: "A machine wider than a desk on its own stand, with a roll loaded across the back " +
      "and a bin or basket underneath to catch the output.",
    fault: "The drawing is skewed on the paper, or the machine reports a media error mid-plot",
    faultWhy: "The roll is not square on the spindle. It reads as a fault and it is a loading " +
      "error, and it repeats until somebody reloads it properly",
    lookalike: "photoinkjet",
    lookalikeWhy: "Both are inkjets, both use roll or sheet stock and both are bought for " +
      "output quality. The scale is the difference and so is the failure that matters: on one, " +
      "a bad load wastes a sheet; on the other, it wastes a roll."
  },
  {
    key: "portablethermal", name: "Portable thermal printer", family: "thermal", form: "receipt",
    marks: "Heat applied directly to paper, from a battery",
    consumable: "The paper roll, and the battery, which is a consumable whatever anyone says",
    interval: "Head clean, and battery health checked \u2014 a machine that prints on the bench " +
      "and dies in the van has a battery fault, not a print fault",
    feed: "A small roll in a clamshell body",
    carbon: false,
    output: "Receipts and dockets printed at the vehicle or the door",
    look: "A hand-sized clamshell with a rubber-armoured case, a battery door, and a wireless " +
      "or Bluetooth pairing button.",
    fault: "It prints when docked and fails in the field",
    faultWhy: "Battery under load, or the pairing dropping when it leaves the building. Both " +
      "look like a broken printer to the person carrying it",
    lookalike: "receipt",
    lookalikeWhy: "The same engine and the same rolls. Everything that goes wrong with this " +
      "one is about power and pairing rather than printing, which is why sending a counter " +
      "unit's fault list out with it helps nobody."
  },
  {
    key: "dyesub", name: "Dye-sublimation photo printer", family: "thermal", form: "label",
    marks: "Heat driving dye off a ribbon and into the surface of coated stock",
    consumable: "A ribbon and paper sold together as a kit, matched, and counted in prints",
    interval: "Keep it dust-free \u2014 a speck under the head marks every print in the batch \u2014 " +
      "and replace the ribbon and paper as the pair they were sold as",
    feed: "A cassette of coated sheets, passed under the head once per colour",
    carbon: false,
    output: "Continuous-tone photographs, dry and touchable as they leave the machine",
    look: "A small squarish box with a cassette in the front, a ribbon inside, and paper that " +
      "moves in and out several times for a single print.",
    fault: "Every print in a batch has the same mark in the same place",
    faultWhy: "Contamination under the head or on the ribbon path, which is the whole reason " +
      "the maintenance is about dust rather than about parts",
    lookalike: "transfer",
    lookalikeWhy: "Both use heat and a ribbon and neither is what people mean by 'thermal'. " +
      "One melts a coating onto the surface to make a durable mark; the other drives dye into " +
      "the stock to make a photograph. The consumables are not interchangeable."
  }
];

/* Values only, never verdicts — the same contract every other panel in this
   build obeys. What the plate says is what the machine would tell you; what
   it means is the question. */
export function printerRows(D) {
  const it = D.item;
  return [
    { k: "Marks the page by", v: it.marks },
    { k: "Paper handling", v: it.feed },
    { k: "Consumable", v: it.consumable },
    { k: "Reported symptom", v: it.fault }
  ];
}

function pick(D, field, n, rnd) {
  const it = D.item;
  const others = PRINTERS.filter((p) => p.key !== it.key && p[field] !== it[field]);
  const seen = {};
  const uniq = others.filter((p) => (seen[p[field]] ? false : (seen[p[field]] = true)));
  return rnd(uniq).slice(0, n);
}

export function printerQuestions(D, rnd) {
  const it = D.item;
  const qs = [];

  qs.push({
    id: "name",
    ask: "Which printer is this?",
    hint: "Work from what marks the page, then from what you would replace. Those two " +
      "together separate every family in the pool before you have to think about the model.",
    answer: it.name,
    choices: [it.name].concat(pick(D, "name", 3, rnd).map((c) => c.name)),
    why: (chosen) => {
      if (chosen === it.name) return it.look + " " + it.lookalikeWhy;
      const o = PRINTERS.filter((c) => c.name === chosen)[0];
      return o ? "That is a real machine and it is not this one. " + o.look +
        " Go back and look at what is actually on the bench."
        : "That is not what is in front of you.";
    }
  });

  qs.push({
    id: "consumable",
    ask: "What do you replace on it, and how often?",
    hint: "On two families in this pool the paper IS the consumable. On one there are two " +
      "consumables that run out at different rates. Look at what is loaded in it.",
    answer: it.consumable,
    choices: [it.consumable].concat(pick(D, "consumable", 3, rnd).map((c) => c.consumable)),
    why: (chosen) => chosen === it.consumable
      ? "Yes. " + it.consumable + ". " + it.interval
      : "No. On this machine it is: " + it.consumable + ". Ordering the wrong consumable is " +
        "the commonest way a printer call becomes two visits."
  });

  /* The one question that separates a family cleanly, and the one students
     get wrong: only a machine that STRIKES the page can make a carbon copy. */
  qs.push({
    id: "carbon",
    ask: "Can this machine print a multipart form with a carbon copy underneath?",
    hint: "A carbon copy is made by pressure, not by ink. Ask whether anything on this " +
      "machine actually hits the paper.",
    answer: it.carbon ? "Yes — it strikes the page, so the blow makes the copy"
      : "No — nothing strikes the page, so there is nothing to make the copy",
    choices: ["Yes — it strikes the page, so the blow makes the copy",
      "No — nothing strikes the page, so there is nothing to make the copy",
      "Yes, if you fit the right consumable for it",
      "Only with a special multipart driver setting"],
    why: (chosen) => {
      const right = it.carbon ? "Yes" : "No";
      if (chosen.indexOf(right) === 0 && chosen.indexOf("special") === -1 &&
          chosen.indexOf("consumable") === -1) {
        return it.carbon
          ? "Yes. This is an impact machine: pins or a band strike a ribbon against the paper, " +
            "and that blow presses through to the copy underneath. It is the only family that can."
          : "No. This machine marks the page with " + it.marks.toLowerCase() + ", and none of " +
            "that touches the sheet underneath. No consumable and no driver setting changes it.";
      }
      return "No. Multipart forms are made by the impact, and only the impact family strikes " +
        "the page. This one marks the page by " + it.marks.toLowerCase() + ". It is a property " +
        "of the mechanism, not a setting and not a consumable.";
    }
  });

  qs.push({
    id: "maintain",
    ask: "What does its scheduled maintenance actually consist of?",
    hint: "Maintenance follows the mechanism. Something that heats needs cleaning where it " +
      "heats; something with a bed needs it level; something with rollers needs them clear.",
    answer: it.interval,
    choices: [it.interval].concat(pick(D, "interval", 3, rnd).map((c) => c.interval)),
    why: (chosen) => chosen === it.interval
      ? "Yes. " + it.interval
      : "No \u2014 that is another machine's schedule. On this one: " + it.interval
  });

  qs.push({
    id: "fault",
    ask: "It is reported as: \u201c" + it.fault + "\u201d. What is actually happening?",
    hint: "The symptom names the part on most of these. Ask which component could produce " +
      "exactly that pattern and nothing else.",
    answer: it.faultWhy,
    choices: [it.faultWhy].concat(pick(D, "faultWhy", 3, rnd).map((c) => c.faultWhy)),
    why: (chosen) => chosen === it.faultWhy
      ? "Yes. " + it.faultWhy + "."
      : "No. " + it.faultWhy + ". The pattern of the fault is what points at the part."
  });

  qs.push({
    id: "lookalike",
    ask: "Which machine is this most often confused with?",
    hint: "Not the one that does a similar job \u2014 the one that looks the same on a counter " +
      "or takes the same stock.",
    answer: PRINTERS.filter((p) => p.key === it.lookalike)[0].name,
    choices: (function () {
      const set = [PRINTERS.filter((p) => p.key === it.lookalike)[0].name];
      pick(D, "name", 6, rnd).forEach((c) => {
        if (set.length < 4 && c.key !== it.lookalike && set.indexOf(c.name) === -1) set.push(c.name);
      });
      return set;
    })(),
    why: (chosen) => {
      const la = PRINTERS.filter((p) => p.key === it.lookalike)[0];
      return chosen === la.name ? it.lookalikeWhy
        : "No \u2014 the one it gets mistaken for is the " + la.name + ". " + it.lookalikeWhy;
    }
  });

  return qs;
}

/* The shape every entry must have. Written as a check rather than as a
   comment because this build has shipped an item missing a field more than
   once, and each time it rendered an empty bench instead of saying so. */
const SHAPE = ["key", "name", "family", "form", "marks", "consumable", "interval",
  "feed", "output", "look", "fault", "faultWhy", "lookalike", "lookalikeWhy"];
PRINTERS.forEach((p) => {
  const missing = SHAPE.filter((f) => p[f] === undefined || p[f] === "");
  if (missing.length) {
    throw new Error('drillprint: "' + (p.key || "?") + '" is missing ' + missing.join(", ") +
      ". It would render an incomplete bench.");
  }
  if (typeof p.carbon !== "boolean") {
    throw new Error('drillprint: "' + p.key + '" must say true or false for carbon.');
  }
  if (!PRINTERS.some((o) => o.key === p.lookalike)) {
    throw new Error('drillprint: "' + p.key + '" names lookalike "' + p.lookalike +
      '", which is not in the pool.');
  }
});
