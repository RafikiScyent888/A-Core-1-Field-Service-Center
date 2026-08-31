/* =====================================================================
   Field Service Center — the printer track

   Printers are the part of A+ people skip, and they are the part of the job
   that fills a technician's week. They are also the only device on the
   exam where you are expected to know a *process* — seven named stages for
   a laser — and where the fix is usually a procedure rather than a part.

   So this track grades three things the other five do not:

   1. WHICH rotating component. A repeating mark down a page is not "the
      drum". Every roller in the machine turns at its own circumference, so
      the distance between the marks names the part. You measure it, you
      look it up in the service manual for that model, and you order one
      thing instead of a maintenance kit.

   2. THE PROCEDURE, in order, with the safety steps in it. Step four of
      the methodology says implement the solution, and on a printer that is
      a sequence you can get wrong in ways that hurt — a fuser at 200°C, a
      drum that is ruined by a fingerprint, toner that a normal vacuum will
      happily aerosolise through its filter and into the room.

   3. HOW TO CLEAN IT. Not "clean it". A lint-free cloth and distilled water
      on an encoder strip; isopropyl on a metal guide; nothing at all on an
      OPC drum; cold water on toner because hot water fuses it into the
      fabric. Every one of those has a wrong answer that a reasonable person
      would try, and most of the wrong answers destroy the part.
   ===================================================================== */

/* =====================================================================
   The laser imaging process — the seven stages, in CompTIA's order.
   Named here because half the faults on this track are best explained by
   pointing at the stage that is failing.
   ===================================================================== */
export const LASER_STAGES = [
  { n: 1, key: "processing", name: "Processing",
    what: "The printer receives the job and builds the whole page in memory as a bitmap before anything moves." },
  { n: 2, key: "charging", name: "Charging",
    what: "The primary charge roller lays a uniform negative charge across the photosensitive drum." },
  { n: 3, key: "exposing", name: "Exposing",
    what: "The laser writes the page onto the drum, neutralising the charge everywhere the image goes." },
  { n: 4, key: "developing", name: "Developing",
    what: "The developer roller presents toner to the drum, and it sticks only to the exposed areas." },
  { n: 5, key: "transferring", name: "Transferring",
    what: "The transfer roller pulls the toner off the drum onto the paper. At this point it is loose powder sitting on the sheet." },
  { n: 6, key: "fusing", name: "Fusing",
    what: "Heat and pressure melt the toner into the fibres of the paper. This is the only stage that makes it permanent." },
  { n: 7, key: "cleaning", name: "Cleaning",
    what: "The cleaning blade scrapes leftover toner off the drum into the waste bin, and the drum is discharged ready for the next page." }
];

/* =====================================================================
   Every major moving part, both engines.

   `turns` marks a rotating component — those are the ones that can produce
   a repeating defect, and their circumference is what identifies them.
   `clean` is the correct method; `never` is the plausible, damaging wrong
   answer that goes on the list beside it.
   ===================================================================== */
export const LASER_PARTS = [
  {
    key: "pickup", label: "Pickup roller", turns: true, kit: true,
    role: "Presses down on the top sheet in the tray and rotates once to draw it in.",
    fails: "Goes hard and glazed with age and paper dust, then slips. The tray is full and the printer says it is empty.",
    seen: "Glazed and shiny where it should be matt, with a flat worn across one side. It squeaks when you turn it by hand.",
    clean: "lintwater",
    never: "alcohol",
    neverWhy: "Isopropyl dries the rubber out and glazes it harder. It buys you a week and costs you the roller."
  },
  {
    key: "separation", label: "Separation pad", turns: false, kit: true,
    role: "A friction pad that holds back sheet two while sheet one is pulled off the stack.",
    fails: "Wears smooth and stops separating, so the printer takes three sheets at once and jams.",
    seen: "Worn smooth and slightly cupped in the middle.",
    clean: "lintwater",
    never: "abrasive",
    neverWhy: "Sanding or scouring a separation pad removes the friction surface that is the entire point of it."
  },
  {
    key: "registration", label: "Registration rollers", turns: true, kit: false,
    role: "Stop the sheet square, then release it in time with the image on the drum.",
    fails: "Slip or mistime, and the print lands crooked or shifted down the page.",
    clean: "lintwater", never: "oil",
    neverWhy: "Lubricating a feed roller is how you turn a slipping roller into a roller that cannot grip at all."
  },
  {
    key: "charge", label: "Primary charge roller", turns: true, kit: false,
    role: "Lays the uniform negative charge onto the drum. Stage two of the process.",
    fails: "Contaminated or worn, it charges unevenly and you get grey banding or a repeating mark.",
    seen: "A dull contaminated band around it that does not wipe off.",
    clean: "none", never: "alcohol",
    neverWhy: "The charge roller has a conductive coating. Solvent takes it off and the drum never charges evenly again."
  },
  {
    key: "drum", label: "Photosensitive drum (OPC)", lname: "photosensitive drum (OPC)",
    turns: true, kit: false,
    role: "The green cylinder the image is written onto. Holds a charge, is discharged by the laser, and carries the toner to the paper.",
    fails: "Scratched, worn or light-struck, and it repeats the same defect every revolution for the life of the cartridge.",
    seen: "A small nick in the coating, visible when the light catches it, and it comes round to the same place every revolution.",
    clean: "none", never: "cloth",
    neverWhy: "Never touch the drum surface. Skin oils mark it permanently, cloth scratches the coating, and daylight fogs it in minutes."
  },
  {
    key: "developer", label: "Developer roller", turns: true, kit: false,
    role: "Carries toner from the hopper and presents it to the drum. Stage four.",
    fails: "Worn or unevenly coated, it puts down light or blotchy toner, repeating at its own interval.",
    seen: "Unevenly coated — bare in a stripe along its length where it should carry toner evenly.",
    clean: "none", never: "tonervac",
    neverWhy: "Even with the right vacuum, this one is sealed inside the toner cartridge. Opening a cartridge to get at it is how you end up wearing the toner, and the roller is not serviceable anyway."
  },
  {
    key: "transfer", label: "Transfer roller", turns: true, kit: true,
    role: "Sits under the paper and pulls the toner off the drum onto the sheet. Stage five.",
    fails: "Worn or contaminated, transfer goes weak — faded print, or toner ending up on the back of the next page.",
    seen: "Dull and patchy along its length, with a fingerprint clearly visible on the foam near one end.",
    clean: "none", never: "alcohol",
    neverWhy: "It is a foam roller that holds a charge. Solvent and handling both wreck it; it is a replace item, not a clean item."
  },
  {
    key: "fuser", label: "Fuser assembly", turns: true, kit: true,
    role: "A heated roller and a pressure roller that melt the toner into the paper. Stage six, and the hottest thing in the machine.",
    fails: "Worn sleeve or failed lamp and the toner never bonds — it rubs off the page with a thumb. Also the classic wrinkle and jam.",
    seen: "Sooty marks on the sleeve and a scored band across the pressure roller. It is still too hot to hold.",
    clean: "cooldry", never: "wetnow",
    neverWhy: "It runs around 200°C. It has to cool before you touch it, and putting anything wet near a hot fuser is a burn and a cracked roller."
  },
  {
    key: "exit", label: "Exit rollers", turns: true, kit: false,
    role: "Take the finished sheet out of the fuser and into the output tray.",
    fails: "Slip, and the page stalls half out of the machine as a jam at the exit.",
    clean: "lintwater", never: "oil",
    neverWhy: "Same as any feed roller — lubricant is the opposite of what a gripping surface needs."
  },
  {
    key: "duplex", label: "Duplexer rollers", turns: true, kit: false,
    role: "Turn the sheet around and feed it back through for the second side.",
    fails: "Jam on two-sided jobs only, which is why the fault looks intermittent until somebody notices the pattern.",
    clean: "lintwater", never: "oil",
    neverWhy: "As with every other feed roller: nothing that makes it slippery."
  },
  {
    key: "polygon", label: "Laser scanner assembly", turns: true, kit: false,
    role: "A spinning polygon mirror sweeps the laser across the drum, line by line. Stage three.",
    fails: "Dust on the mirror or the exit window puts a vertical white void down every page in the same place.",
    seen: "The exit window has an even film of dust on it, and a heavier band right where the white line falls.",
    clean: "brush", never: "alcohol",
    neverWhy: "Optical surfaces get a soft brush or dry air from a blower bulb. Solvent on a first-surface mirror ruins the coating."
  },
  {
    key: "waste", label: "Waste toner reservoir and cleaning blade", turns: false, kit: false,
    role: "The blade scrapes what did not transfer off the drum, and the waste bin catches it. Stage seven.",
    fails: "A full bin or a nicked blade puts a stripe of loose toner down the page.",
    clean: "tonervac", never: "shopvac",
    neverWhy: "A standard vacuum passes toner straight through the filter and back into the room, and the motor brushes can ignite the cloud. It needs a toner-rated, ESD-safe machine."
  },
  {
    key: "gears", label: "Drive gears and main motor", turns: true, kit: false,
    role: "One motor and a train of gears turn everything above in time with each other.",
    fails: "A stripped tooth gives a rhythmic knock and a smeared band where the drum stalls and catches up.",
    clean: "none", never: "oil",
    neverWhy: "These gears are dry by design. Grease collects toner and paper dust and turns into a grinding paste."
  },
  {
    key: "ozone", label: "Ozone filter", turns: false, kit: true,
    role: "Catches the ozone the charging stage produces. Fitted to older and higher-volume units.",
    fails: "Nothing prints wrong. It just stops filtering, and the room starts to smell sharp.",
    clean: "replace", never: "lintwater",
    neverWhy: "It is a consumable filter. Washing it destroys the medium — it gets replaced on the maintenance schedule."
  }
];

export const INKJET_PARTS = [
  {
    key: "printhead", label: "Printhead", turns: false, kit: false,
    role: "Fires ink through a few hundred microscopic nozzles — heated to a bubble on a thermal head, flexed by a crystal on a piezo one.",
    fails: "Nozzles dry and clog, and a whole colour channel drops out of the nozzle-check pattern.",
    seen: "Nothing visible at all. The nozzle plate looks exactly as it should; the blockage is inside it.",
    clean: "headclean",
    never: "abrasive",
    neverWhy: "Nothing rigid ever touches a nozzle plate. One wipe with the wrong thing and the head is scrap."
  },
  {
    key: "carriage", label: "Printhead carriage", turns: false, kit: false,
    role: "Carries the head back and forth across the page on a rail.",
    fails: "A dry or dirty rail makes it stick, stall mid-sweep and throw a carriage jam.",
    clean: "railgrease", never: "lintwater",
    neverWhy: "The rail is the one part here that is meant to be lubricated — with the manufacturer's grease, not wiped dry."
  },
  {
    key: "belt", label: "Carriage belt and motor", turns: true, kit: false,
    role: "A toothed belt drags the carriage along, driven by a stepper motor.",
    fails: "Stretched or slipping teeth and the print lands in the wrong place horizontally, or the carriage crashes into the frame.",
    seen: "Visibly slack, and the teeth are rounded off along one section of its length.",
    clean: "lintdry", never: "oil",
    neverWhy: "Oil on a toothed belt makes it slip on the pulley, which is the fault you were called out for."
  },
  {
    key: "encoder", label: "Encoder strip", turns: false, kit: false,
    role: "A clear plastic ribbon printed with fine markings, running the width of the machine. The carriage reads it to know exactly where it is.",
    fails: "Ink mist or a fingerprint on it and the carriage loses its place — banding, misregistration, or a hard carriage error.",
    seen: "A haze of ink mist along a section of it and a clear fingerprint about halfway across the travel.",
    clean: "distilled",
    never: "alcohol",
    neverWhy: "Alcohol and every other solvent dissolve the printed markings straight off the strip. It looks clean, and the printer can no longer read it at all. Distilled water on a lint-free cloth, nothing else, ever."
  },
  {
    key: "capping", label: "Capping station", turns: false, kit: false,
    role: "The rubber cup the head parks in. It seals the nozzles airtight so they do not dry out between jobs.",
    fails: "Clogged with dried ink, the seal fails, the head dries overnight and no amount of cleaning cycles brings it back.",
    seen: "The rubber lip is caked hard with dried ink and no longer sits flat against the nozzle plate.",
    clean: "distilled", never: "alcohol",
    neverWhy: "Solvent hardens and cracks the rubber lip, and a capping station that cannot seal is why the head dried out in the first place."
  },
  {
    key: "wiper", label: "Wiper blade", turns: false, kit: false,
    role: "A small rubber squeegee that wipes the nozzle plate each time the head parks.",
    fails: "Caked or torn, it smears ink across the nozzles instead of clearing them.",
    clean: "distilled", never: "abrasive",
    neverWhy: "It is a precision rubber edge. Scrub it and it no longer wipes flat."
  },
  {
    key: "pump", label: "Purge pump", turns: true, kit: false,
    role: "Sucks ink through the head during a cleaning cycle and pushes it out to the waste pad.",
    fails: "Weak or blocked, cleaning cycles stop pulling ink through and clogs stop clearing.",
    clean: "none", never: "distilled",
    neverWhy: "It is a sealed assembly in the ink path. This is a service part, not something you flush at the desk."
  },
  {
    key: "wastepad", label: "Waste ink pad and counter", turns: false, kit: true,
    role: "An absorbent pad that catches everything the purge pump throws away, with a counter tracking how full it is.",
    fails: "When the counter hits its limit the printer simply refuses to print, whatever else is working.",
    seen: "Saturated through to the edges and heavy with ink. There is nowhere left for a purge to go.",
    clean: "replace", never: "reset",
    neverWhy: "Resetting the counter without replacing the pad means the next purge goes onto a saturated pad and out onto the desk."
  },
  {
    key: "pickupij", label: "Pickup roller", turns: true, kit: false,
    role: "Draws the top sheet off the stack, same job as on a laser.",
    fails: "Glazes and slips, and the printer reports no paper with a full tray.",
    clean: "lintwater", never: "alcohol",
    neverWhy: "Solvent hardens the rubber. Water on a lint-free cloth, and replace it when that stops working."
  },
  {
    key: "starwheel", label: "Star wheels and pinch rollers", turns: true, kit: false,
    role: "Spiked wheels that hold the wet sheet flat against the platen without smearing the ink.",
    fails: "Clogged with dried ink they leave a track of dots down every page.",
    clean: "distilled", never: "abrasive",
    neverWhy: "Bent star wheel points mark the paper permanently."
  },
  {
    key: "platen", label: "Platen", turns: false, kit: false,
    role: "The flat bed the paper passes over while the head is printing.",
    fails: "Ink builds up on it and transfers onto the back of every sheet, usually on borderless jobs.",
    clean: "distilled", never: "alcohol",
    neverWhy: "Solvent on the platen can lift its coating and make the build-up worse, not better."
  },
  {
    key: "encoderwheel", label: "Feed encoder wheel", turns: true, kit: false,
    role: "A small marked disc on the paper feed motor that reports how far the sheet has advanced.",
    fails: "Dusty or oily, the feed loses count and you get horizontal banding at even intervals.",
    clean: "lintdry", never: "alcohol",
    neverWhy: "Same failure as the encoder strip — the markings are printed on, and solvent takes them off."
  }
];

/* The cleaning methods a technician actually has, plus the ones that turn a
   service call into a replacement. Both lists are offered together, which
   is the point: every wrong answer here is something a reasonable person
   would try. */
export const CLEAN_METHODS = {
  lintwater: "Lint-free cloth, lightly dampened with water",
  distilled: "Lint-free cloth with distilled water only",
  lintdry: "Dry lint-free cloth",
  alcohol: "Lint-free cloth with isopropyl alcohol",
  brush: "Soft optical brush, or a blower bulb",
  tonervac: "Toner-rated ESD-safe vacuum",
  shopvac: "Ordinary workshop vacuum",
  compressed: "Canned compressed air, at the desk",
  abrasive: "Scouring pad or fine abrasive",
  oil: "Light machine oil",
  railgrease: "The manufacturer's rail lubricant, sparingly",
  headclean: "The printer's own head-cleaning cycle, then a soak if that fails",
  cooldry: "Let it cool completely, then a dry lint-free cloth",
  wetnow: "Damp cloth, straight away",
  replace: "Do not clean it — replace it on schedule",
  reset: "Reset the counter and carry on",
  cloth: "Wipe it with a clean cloth",
  none: "Do not clean it at all — it is sealed or it is a replace-only part"
};

/* =====================================================================
   The faults
   ===================================================================== */
export const LASER_FAULTS = [
  {
    key: "pickup", engine: "laser", part: "pickup roller and separation pad",
    objective: "3.8 + 5.6", kind: "wear", partSpec: "maintkit",
    root: "The pickup roller is glazed and the separation pad is worn smooth. Between them they either take nothing or take three sheets at once.",
    observable: "it reports an empty tray with paper in it, and when it does feed it drags two or three sheets through together",
    symptoms: ["Says out of paper when it is full", "Takes a handful of sheets at once",
      "Jams at the tray, never further in"],
    fixes: "Fit the maintenance kit: pickup roller, separation pad, transfer roller and fuser, then reset the maintenance counter.",
    wrongReflex: "paper",
    wrongWhy: "The paper is fine, and a fresh ream out of a sealed pack does exactly the same thing. It is the rollers that stopped gripping.",
    evidence: "Misfeeds and multi-feeds at the tray with a page count well past the maintenance interval",
    stage: null
  },
  {
    key: "fuser", engine: "laser", part: "fuser assembly",
    objective: "3.8 + 5.6", kind: "component", partSpec: "fuser",
    root: "The fuser is failing. It is not reaching temperature reliably, so the toner is being laid down correctly and never bonded to the paper.",
    observable: "the print rubs off the page with a thumb, and the sheets come out creased down one side",
    symptoms: ["The words smudge when you touch them", "Pages come out wrinkled",
      "It throws a fuser error about once a day"],
    fixes: "Replace the fuser assembly. Let it cool first — it runs at around 200°C — then reset the maintenance counter.",
    wrongReflex: "toner",
    wrongWhy: "The toner cartridge is doing its job perfectly. Everything up to stage five is right; the image is on the paper. What is missing is the heat that makes it permanent.",
    evidence: "Toner that transfers to the page and then rubs straight off it",
    stage: "fusing"
  },
  {
    key: "repeat", engine: "laser", part: "the rotating component that matches the interval",
    objective: "3.8 + 5.6", kind: "repeat", partSpec: "component",
    root: "One rotating component is marked, and it prints that mark onto the page once every revolution.",
    observable: "the same small defect appears down the page at a perfectly even spacing, and it does it on every sheet",
    symptoms: ["The same blob every few inches down the page",
      "It does it on any document", "Always the same distance apart"],
    fixes: "Measure the spacing, look it up against the rotating components for this model, and replace the one that matches.",
    wrongReflex: "cartridge",
    wrongWhy: "Swapping the whole cartridge is the reflex, and on some models it is even right — but only if the interval matches the drum or the developer roller. Measure before you spend.",
    evidence: "A defect repeating at a fixed interval, which is the signature of a rotating part",
    stage: null
  },
  {
    key: "transfer", engine: "laser", part: "transfer roller",
    objective: "3.8 + 5.6", kind: "component", partSpec: "transfer",
    root: "The transfer roller is worn and no longer pulling the toner cleanly off the drum onto the paper.",
    observable: "print is washed-out and pale across the whole page, and there is loose toner on the back of the sheets",
    symptoms: ["Everything comes out faint", "Toner marks on the back of the pages",
      "A new cartridge made no difference at all"],
    fixes: "Replace the transfer roller. Handle it by the ends — it is a charged foam roller and skin oil on the surface causes exactly this fault.",
    wrongReflex: "toner",
    wrongWhy: "A new cartridge was already tried and changed nothing, which rules out stages three and four and points squarely at stage five.",
    evidence: "Uniformly faint print that a fresh cartridge does not fix, plus toner on the reverse",
    stage: "transferring"
  },
  {
    key: "scanner", engine: "laser", part: "laser scanner assembly",
    objective: "3.8 + 5.6", kind: "component", partSpec: "scanner",
    root: "Dust has settled on the laser exit window, so a narrow strip of the drum never gets written to.",
    observable: "a clean white vertical line runs the full length of every page, always in the same place",
    symptoms: ["A white stripe down every page", "Same place every time",
      "It is there even on the printer's own test page"],
    fixes: "Clean the laser exit window with a soft optical brush or a blower bulb. Nothing wet, nothing solvent.",
    wrongReflex: "drum",
    wrongWhy: "A drum defect repeats down the page at the drum's interval. A line that runs unbroken from top to bottom is the laser being blocked, not the drum being marked.",
    evidence: "An unbroken vertical void the full length of the page, present on the printer's own test print",
    stage: "exposing"
  },
  {
    key: "duplexjam", engine: "laser", part: "duplexer rollers",
    objective: "3.8 + 5.6", kind: "wear", partSpec: "component",
    root: "The duplexer rollers have gone hard and no longer grip. Single-sided work is untouched because the sheet never goes near them.",
    observable: "it jams on every two-sided job and never on a one-sided one",
    symptoms: ["Only jams when we print double-sided", "Single sided is perfect",
      "The jam is always inside the back door"],
    fixes: "Replace the duplexer rollers, or clean them if they are only glazed rather than worn.",
    wrongReflex: "paper",
    wrongWhy: "The same ream goes through single-sided all day without a murmur. The variable is not the paper, it is whether the sheet takes the second trip.",
    evidence: "Jams that occur only on duplex jobs, always at the same point in the path",
    stage: null
  },
  {
    key: "exitjam", engine: "laser", part: "exit rollers",
    objective: "3.8 + 5.6", kind: "wear", partSpec: "component",
    root: "The exit rollers are slipping, so the sheet stalls with its trailing edge still in the fuser.",
    observable: "pages stop half out of the machine and have to be pulled the rest of the way by hand",
    symptoms: ["It leaves the page hanging out", "We have to pull every one out",
      "The paper comes out hot and creased"],
    fixes: "Replace the exit rollers. Clear the path and let the fuser cool before reaching in for the stalled sheet.",
    wrongReflex: "fuser",
    wrongWhy: "The toner is properly fused — the print does not rub off. The sheet is getting through the fuser correctly and then not being pulled clear of it.",
    evidence: "Sheets stalling at the exit with the image correctly fused",
    stage: null
  },
  {
    key: "regskew", engine: "laser", part: "registration rollers",
    objective: "3.8 + 5.6", kind: "component", partSpec: "component",
    root: "The registration rollers are slipping, so the sheet is not being squared and released in time with the drum.",
    observable: "every page is printed slightly crooked and shifted down the sheet, by about the same amount every time",
    symptoms: ["Everything comes out on a slant", "The margin at the top is too big now",
      "It does it from both trays"],
    fixes: "Replace the registration rollers and check the tray guides are set to the paper actually in them.",
    wrongReflex: "tray",
    wrongWhy: "It does it identically from every tray, which rules the trays and their guides out. What is common to both paths is the registration stage.",
    evidence: "A consistent skew and downward shift on every sheet from every tray",
    stage: null
  },
  {
    key: "gearnoise", engine: "laser", part: "drive gears",
    objective: "3.8 + 5.6", kind: "component", partSpec: "component",
    root: "A tooth has stripped in the drive train. The drum stalls for an instant each revolution and then catches up.",
    observable: "a rhythmic knock while it prints, and a smeared band across the page at the same spacing as the knock",
    symptoms: ["It's started clicking as it prints", "A smudged stripe across every page",
      "The noise and the mark keep time with each other"],
    fixes: "Replace the drive gear. Nothing here is lubricated — these gears run dry and grease turns paper dust into grinding paste.",
    wrongReflex: "drum",
    wrongWhy: "A marked drum prints a clean repeating defect quietly. A drum that is being driven unevenly smears, and it does it in time with a noise you can hear from across the room.",
    evidence: "An audible knock keeping time with a smeared band on the page",
    stage: null
  },
  {
    key: "ozone", engine: "laser", part: "ozone filter",
    objective: "3.8 + 5.6", kind: "consumable", partSpec: "component",
    root: "The ozone filter is long past its service life. Print quality is unaffected; the room is not.",
    observable: "a sharp smell in the room whenever it runs a long job, and nothing at all wrong with the print",
    symptoms: ["There's a smell like a thunderstorm", "The print is fine",
      "It's worse when we run the big reports"],
    fixes: "Replace the ozone filter. It is a consumable on the maintenance schedule and washing it destroys the medium.",
    wrongReflex: "fuser",
    wrongWhy: "A fuser problem smells of hot plastic and shows on the page. This shows on nothing, which is exactly what makes it easy to ignore until somebody complains about the air.",
    evidence: "A sharp smell tied to run length with no print defect of any kind",
    stage: "charging"
  },
  {
    key: "sepwear", engine: "laser", part: "separation pad in the multipurpose tray",
    objective: "3.8 + 5.6", kind: "wear", partSpec: "component",
    root: "The multipurpose tray's own separation pad is worn through to the backing. The main tray has its own pad and that one is fine.",
    observable: "it multi-feeds every time from the manual tray and feeds perfectly from the main one",
    symptoms: ["It only does it on the side tray", "The main tray is fine",
      "We use the side one for letterhead"],
    fixes: "Fit a new separation pad to the multipurpose tray. It is a separate part from the main tray's and it wears faster because that tray takes the heavy stock.",
    wrongReflex: "pickup roller",
    wrongWhy: "The roller is picking sheets up perfectly well — the problem is that nothing is stopping the second one. A pad that cannot hold the sheet underneath is a separation fault, not a pickup one.",
    evidence: "Multi-feeds confined to one tray, with the other tray feeding single sheets all day",
    stage: null
  },
  {
    key: "cleanblade", engine: "laser", part: "cleaning blade in the cartridge",
    objective: "3.8 + 5.6", kind: "component", partSpec: "component",
    root: "The cleaning blade is no longer scraping the drum clean, so residual toner is carried round and laid down again a drum-circumference later.",
    observable: "a smeared band down every page that gets worse the longer the job runs",
    symptoms: ["It smears down the page", "It's worse on long jobs",
      "The first page or two look all right"],
    fixes: "Fit a replacement cartridge — the blade and the drum are one sealed assembly and the blade is not serviced separately.",
    wrongReflex: "fuser",
    wrongWhy: "Fuser problems rub off under a fingernail because the toner never bonded. This toner is fused hard and in the wrong place, which puts the fault before the fuser rather than at it.",
    evidence: "Fused-in smearing that worsens through a job, with the waste chamber filling faster than the page count explains",
    stage: "cleaning"
  },
  {
    key: "tonerlow", engine: "laser", part: "toner distribution in a low cartridge",
    objective: "3.8 + 5.6", kind: "consumable", partSpec: "component",
    root: "The cartridge is genuinely low. Print has faded on one side of the page because the toner left in it has settled away from the developer roller.",
    observable: "print fading down one side of every page, and it comes back for a few hundred sheets if the cartridge is rocked",
    symptoms: ["It goes light on one side", "Shaking it fixes it for a bit",
      "It says low but we thought there was plenty left"],
    fixes: "Replace the cartridge. Rocking it redistributes what is left and buys a few hundred pages, which is a way to finish today's job and not a repair.",
    wrongReflex: "drum",
    wrongWhy: "A drum fault repeats at the drum's own circumference down the page. This is a fade across the width that changes when the cartridge is moved, which is toner distribution and nothing mechanical.",
    evidence: "Fading confined to one side of the page that temporarily clears when the cartridge is rocked",
    stage: "developing"
  },
  {
    key: "trayguide", engine: "laser", part: "paper tray guides",
    objective: "3.8 + 5.6", kind: "wear", partSpec: "none",
    root: "The tray's side guides were left set for a wider stock, so every sheet arrives at the registration rollers already crooked.",
    observable: "every page comes out at a slight angle, from one tray, on every kind of job",
    symptoms: ["Everything comes out skewed", "It's been like it since the paper changed",
      "The other tray is fine"],
    fixes: "Set the tray guides to the stock actually loaded, so they touch the stack without bowing it, and fan the ream before it goes in.",
    wrongReflex: "registration rollers",
    wrongWhy: "The registration rollers can only square a sheet that arrives close to straight. Feed one in crooked enough and no roller downstream of it will fix that — the correction happens at the tray.",
    evidence: "Consistent skew from one tray with the guides visibly set wider than the stack",
    stage: null
  },
  {
    key: "wrongmedia", engine: "laser", part: "media type setting",
    objective: "3.8 + 5.6", kind: "clean", partSpec: "none",
    root: "Heavy card is being run with the tray still set to plain paper, so the fuser runs at the wrong temperature for it and the toner never bonds properly.",
    observable: "toner rubs off the card and the plain paper in the other tray is perfect",
    symptoms: ["It comes off the card if you scratch it", "Normal paper is fine",
      "We started doing the covers on it"],
    fixes: "Set the tray's media type to match the stock in it, so the fuser runs at the temperature that stock needs. There is nothing to replace.",
    wrongReflex: "fuser",
    wrongWhy: "The fuser bonds plain paper perfectly all day. A fuser that had failed would fail on everything, and this one is being asked to bond heavy card at a plain-paper temperature.",
    evidence: "Toner that rubs off heavy stock only, with plain paper from another tray fusing correctly",
    stage: "fusing"
  }
];

export const INKJET_FAULTS = [
  {
    key: "encoder", engine: "inkjet", part: "encoder strip",
    objective: "3.8 + 5.6", kind: "clean", partSpec: "none",
    root: "Ink mist and a fingerprint on the encoder strip mean the carriage can no longer read its own position.",
    observable: "it prints a band of nonsense partway across, and every so often throws a carriage error and gives up",
    symptoms: ["Garbled band across the middle of the page",
      "Carriage error, then it works again for a while", "It sounds like it hits something"],
    fixes: "Clean the encoder strip with a lint-free cloth and distilled water only. No alcohol, no solvent — they dissolve the markings and destroy the strip.",
    wrongReflex: "printhead",
    wrongWhy: "The nozzle check is perfect. Every colour fires correctly — the ink is going down fine, it is going down in the wrong place.",
    evidence: "Position errors with a clean nozzle check, which separates where the ink lands from whether it fires"
  },
  {
    key: "capping", engine: "inkjet", part: "capping station",
    objective: "3.8 + 5.6", kind: "clean", partSpec: "none",
    root: "The capping station is caked with dried ink and no longer seals. The head dries out every night it sits idle.",
    observable: "the first job each morning prints with missing lines, and it takes two or three cleaning cycles to come good",
    symptoms: ["Terrible first thing, fine by mid-morning",
      "We run a head clean most days", "It is getting through cartridges"],
    fixes: "Clean the capping station and the wiper blade with distilled water on a lint-free swab so the cap seals again. Cleaning the head alone treats the symptom and burns ink doing it.",
    wrongReflex: "head",
    wrongWhy: "Head cleaning does work — every morning, temporarily, at the cost of a slug of ink. It comes back because nothing is sealing the nozzles overnight.",
    evidence: "A fault that is worst after the machine has stood idle and clears with cycles that cost ink"
  },
  {
    key: "head", engine: "inkjet", part: "printhead",
    objective: "3.8 + 5.6", kind: "component", partSpec: "printhead",
    root: "One colour channel is genuinely blocked. The nozzle check shows that channel missing entirely and cleaning cycles are not recovering it.",
    observable: "everything prints with a colour cast, and the nozzle check comes out with one block of the pattern completely blank",
    symptoms: ["All the photos look wrong", "One colour is just not there",
      "We have run the cleaning six times"],
    fixes: "Stop running cycles — each one wastes ink and is not clearing it. Soak the head, and replace it if the soak does not recover the channel.",
    wrongReflex: "cartridge",
    wrongWhy: "The cartridge is over half full and the printer reports it as good. The ink is there; it is not getting through the nozzles.",
    evidence: "One channel absent from the nozzle-check pattern with ink present in the cartridge"
  },
  {
    key: "belt", engine: "inkjet", part: "carriage belt",
    objective: "3.8 + 5.6", kind: "component", partSpec: "belt",
    root: "The carriage belt has stretched and is slipping a tooth on the drive pulley.",
    observable: "vertical lines do not line up between one pass and the next, and the carriage sometimes bangs into the end of its travel",
    symptoms: ["Text looks doubled or shadowed", "It crashes at one end sometimes",
      "Alignment does not stay put"],
    fixes: "Replace the carriage belt and re-run the head alignment. Nothing lubricated — oil on a toothed belt causes exactly this.",
    wrongReflex: "alignment",
    wrongWhy: "Running the alignment routine helps for a page or two. It cannot compensate for a belt that slips a different amount each pass.",
    evidence: "Misregistration that changes between passes, plus a carriage that overshoots its stop"
  },
  {
    key: "wastepad", engine: "inkjet", part: "waste ink pad",
    objective: "3.8 + 5.6", kind: "consumable", partSpec: "wastepad",
    root: "The waste ink pad is saturated and its counter has hit the limit, so the firmware has stopped the printer to keep it from leaking onto the desk.",
    observable: "it refuses to print anything at all and shows a service message, while every mechanical part of it works perfectly",
    symptoms: ["It says it needs servicing and stops dead",
      "Nothing is jammed and nothing is empty", "It was printing fine an hour before"],
    fixes: "Replace the waste ink pad, then reset the counter. Resetting the counter on its own puts the next purge onto a full pad and out onto the desk.",
    wrongReflex: "reset",
    wrongWhy: "There is a counter reset, and on its own it is the wrong half of the job. The pad is physically full — the counter is only reporting it.",
    evidence: "A hard stop with a service message on a machine where nothing mechanical is wrong"
  },
  {
    key: "platen", engine: "inkjet", part: "platen",
    objective: "3.8 + 5.6", kind: "clean", partSpec: "none",
    root: "Ink has built up on the platen, and every sheet picks it up on the way past.",
    observable: "a smear of ink on the back of every page, worst on anything printed borderless",
    symptoms: ["Every sheet is marked on the back", "The front is perfect",
      "It got bad after we started printing photos edge to edge"],
    fixes: "Clean the platen and its ribs with distilled water on a lint-free cloth, and leave it to dry before printing.",
    wrongReflex: "paper",
    wrongWhy: "A fresh ream out of the wrapper comes out marked in exactly the same place. The ink is being applied after the paper arrives, not before.",
    evidence: "Marking on the reverse only, in the same position on every sheet"
  },
  {
    key: "starwheel", engine: "inkjet", part: "star wheels",
    objective: "3.8 + 5.6", kind: "clean", partSpec: "none",
    root: "The star wheels are clogged with dried ink and are printing a track of dots down the page.",
    observable: "evenly spaced rows of small dots running down the sheet in the direction of travel",
    symptoms: ["Little dotted lines down every page", "Always in the same places",
      "The nozzle check is perfect"],
    fixes: "Clean the star wheels with distilled water on a swab. Do not scour them — a bent point marks the paper permanently.",
    wrongReflex: "printhead",
    wrongWhy: "A perfect nozzle check says every nozzle is firing correctly. Marks in fixed tracks down the sheet come from something touching the paper, not from something spraying at it.",
    evidence: "Dot tracks in fixed positions across the sheet with a clean nozzle check"
  },
  {
    key: "feedenc", engine: "inkjet", part: "feed encoder wheel",
    objective: "3.8 + 5.6", kind: "clean", partSpec: "none",
    root: "The feed encoder wheel is dusty, so the printer is losing count of how far the paper has advanced.",
    observable: "pale horizontal bands at even intervals down the page, and the spacing is the same on every sheet",
    symptoms: ["Stripes across the page, evenly spaced", "Nozzle check is fine",
      "Head cleaning made no difference"],
    fixes: "Clean the feed encoder wheel with a dry lint-free cloth. Never solvent — the markings are printed on and it takes them off.",
    wrongReflex: "printhead",
    wrongWhy: "The nozzle check is complete and cleaning cycles change nothing. The ink is firing correctly; the paper is not arriving where the printer thinks it is.",
    evidence: "Banding at a fixed pitch across the paper direction with a clean nozzle check"
  },
  {
    key: "pumpfail", engine: "inkjet", part: "purge pump",
    objective: "3.8 + 5.6", kind: "component", partSpec: "printhead",
    root: "The purge pump has lost suction. Cleaning cycles run through their motions and pull almost no ink through the head.",
    observable: "cleaning cycles complete normally and change nothing, and the waste level is not going up the way it should",
    symptoms: ["Cleaning does nothing at all now", "It used to fix it",
      "The waste counter has barely moved"],
    fixes: "Replace the purge pump assembly. Running more cycles with a dead pump wastes the time and clears nothing.",
    wrongReflex: "head",
    wrongWhy: "The head may well be blocked, but it will stay blocked — the machine has lost the means to clear it. Replacing the head without fixing the pump gives you a new head with nothing to keep it clean.",
    evidence: "Cleaning cycles completing without moving the waste counter, which means no ink is being drawn"
  },
  {
    key: "ijfeed", engine: "inkjet", part: "pickup roller",
    objective: "3.8 + 5.6", kind: "wear", partSpec: "none",
    root: "The pickup roller is glazed and no longer grips the top sheet reliably.",
    observable: "it reports no paper with a full tray, and when it does feed it often takes two sheets at once",
    symptoms: ["Says out of paper when it's full", "Grabs two at a time",
      "You have to help it in by hand"],
    fixes: "Clean the pickup roller with water on a lint-free cloth, and replace it if that no longer restores the grip.",
    wrongReflex: "paper",
    wrongWhy: "A fresh ream behaves identically. The paper has not changed; the surface that is supposed to grip it has.",
    evidence: "Misfeeds and double feeds from a full tray with fresh paper"
  },
  {
    key: "airlock", engine: "inkjet", part: "an air lock in the ink line",
    objective: "3.8 + 5.6", kind: "component", partSpec: "component",
    root: "Air has been drawn into the line between the cartridge and the head, so one channel gets no ink however many cleaning cycles are run.",
    observable: "one colour missing from the nozzle check and no amount of head cleaning brings it back",
    symptoms: ["One colour just will not print", "I've cleaned it about six times",
      "The cartridge is nearly full"],
    fixes: "Purge the line to draw the air through, then run one nozzle check to confirm. If the channel is still empty after a purge the head is the part, not the line.",
    wrongReflex: "cartridge",
    wrongWhy: "The cartridge is nearly full and reseating it changes nothing, because the gap is downstream of it. A cleaning cycle pulls against an air bubble and moves it around rather than out.",
    evidence: "A channel completely blank on the nozzle check with its cartridge nearly full, unchanged by repeated cleaning"
  },
  {
    key: "headstrike", engine: "inkjet", part: "head strike damage from thick media",
    objective: "3.8 + 5.6", kind: "component", partSpec: "component",
    root: "Card thicker than the machine's rated media was run through it, and the head has been catching the sheet. There are scuff marks across the print and ink smearing at the edges.",
    observable: "horizontal scuffing across every page and smearing along the leading edge, dating from the day the card was used",
    symptoms: ["It's marking the paper", "It started when we did the invitations",
      "It smears at the top of the page"],
    fixes: "Set the platen gap for the media, keep the stock inside what the machine is rated for, and clean the head face. If the nozzle plate is scored the head is the part.",
    wrongReflex: "rollers",
    wrongWhy: "The rollers are feeding cleanly and the marks run across the page rather than along it. Marks in the direction the head travels come from the head, not from anything that turns.",
    evidence: "Scuffing across the sheet in the direction of head travel, dating from the day thicker stock was used"
  },
  {
    key: "waterink", engine: "inkjet", part: "dye ink on the wrong paper",
    objective: "3.8 + 5.6", kind: "clean", partSpec: "none",
    root: "Dye-based ink is being printed onto an uncoated stock that wicks it. The print bleeds along the fibres and looks soft at every edge.",
    observable: "text with furry edges and colours bleeding into each other, on one paper stock and not on another",
    symptoms: ["It looks fuzzy", "It's fine on the good paper",
      "We bought a cheaper box this month"],
    fixes: "Use a stock rated for inkjet, or set the driver's paper type so it lays down less ink. There is nothing wrong with the printer.",
    wrongReflex: "printhead",
    wrongWhy: "A head fault leaves missing lines in a nozzle check, and this one is perfect. Print that is present, correct and soft at the edges is the paper absorbing it, which is a property of the paper.",
    evidence: "Soft edges and colour bleed on one paper stock and crisp print on another, from the same file and the same head",
    stage: null
  },
  {
    key: "carriagerail", engine: "inkjet", part: "a dry carriage rail",
    objective: "3.8 + 5.6", kind: "wear", partSpec: "component",
    root: "The rail the carriage rides on has been cleaned with a solvent that stripped its lubricant. The carriage now judders as it travels and the print bands.",
    observable: "banding that lines up with the carriage travel, and an audible judder as the head crosses the page",
    symptoms: ["It sounds rough going across", "There are lines down the print",
      "It was cleaned a few weeks ago"],
    fixes: "Clean the rail and re-lubricate it with the manufacturer's grease. Household oils gum the rail and pick up paper dust, which is how this happens twice.",
    wrongReflex: "belt",
    wrongWhy: "The belt is tensioned correctly and the carriage reaches both ends of its travel. A belt fault doubles or shifts the whole stroke; a dry rail makes it stutter within the stroke.",
    evidence: "Banding that lines up with carriage travel, on a correctly tensioned belt, with the rail dry to the touch"
  },
  {
    key: "chipreset", engine: "inkjet", part: "a cartridge the printer will not accept",
    objective: "3.8 + 5.6", kind: "consumable", partSpec: "component",
    root: "A refilled cartridge has been fitted and its chip still reports the level it had before it was refilled, so the printer refuses to use it.",
    observable: "a full cartridge that the printer insists is empty, and it refuses to print at all",
    symptoms: ["It says empty and it is full", "We had them refilled to save money",
      "It worked with the last set"],
    fixes: "Fit a cartridge the machine will accept, and put the cost of the refills next to the cost of the visits in the ticket so somebody can make the decision with the numbers in front of them.",
    wrongReflex: "printer",
    wrongWhy: "The machine prints perfectly with a cartridge it accepts, which is what proves it is not broken. This is a consumable decision that arrives at the helpdesk dressed as a fault.",
    evidence: "A refused cartridge reporting a level from before it was refilled, with the machine printing normally on one it accepts"
  }
];

export const PRINTER_FAULTS = LASER_FAULTS.concat(INKJET_FAULTS);

/* =====================================================================
   The machine

   Circumferences are drawn per ticket so the repeat-interval answer cannot
   be memorised across tickets — a student has to read the manual in front
   of them every time, which is what the job actually looks like.
   ===================================================================== */
const LASER_MODELS = [
  { name: "Meridian LP-4400n", ppm: 40, kitInterval: 110000, mono: true },
  { name: "Meridian LP-2200dn", ppm: 28, kitInterval: 80000, mono: true },
  { name: "Corvid CX-620 colour", ppm: 32, kitInterval: 120000, mono: false },
  { name: "Halden 7100 workgroup", ppm: 55, kitInterval: 150000, mono: true }
];
const INKJET_MODELS = [
  { name: "Corvid IJ-880 all-in-one", ppm: 18, headType: "thermal" },
  { name: "Meridian PJ-3200 wide format", ppm: 12, headType: "piezoelectric" },
  { name: "Halden Officejet 260", ppm: 22, headType: "thermal" },
  { name: "Corvid IJ-410 desktop", ppm: 15, headType: "thermal" }
];

export function buildPrinter(r, fault) {
  var laser = fault.engine === "laser";
  var m = r.pick(laser ? LASER_MODELS : INKJET_MODELS);
  var p = {
    engine: fault.engine,
    model: m.name,
    ppm: m.ppm,
    serial: "PRN" + r.int(100000, 999999),
    ageMonths: r.int(8, 62),
    pageCount: 0,
    connection: r.pick(["network", "network", "network", "USB direct", "shared from a workstation"])
  };

  if (laser) {
    p.mono = m.mono;
    p.kitInterval = m.kitInterval;
    /* A worn-roller fault means the machine is genuinely overdue. Everything
       else is somewhere sensible in its life, so "just fit a kit" is not a
       free win on the other four. */
    p.pageCount = fault.key === "pickup"
      ? Math.round(m.kitInterval * (1.08 + r.int(0, 40) / 100))
      : Math.round(m.kitInterval * (0.18 + r.int(0, 45) / 100));
    p.sinceKit = p.pageCount;
    p.tonerPct = fault.key === "transfer" ? r.int(55, 80) : r.int(28, 88);
    p.drumPct = r.int(40, 92);
    /* Each rotating component turns at its own circumference. These are the
       numbers the student measures against, and they move per ticket. */
    /* Drawn from disjoint bands with a guard gap between them. Real
       components genuinely do have distinct circumferences within one
       model — that is why the measurement identifies the part — and
       overlapping them here would leave the question with two right
       answers, which is worse than no question at all. */
    p.circ = {
      charge: r.int(35, 38),
      registration: r.int(42, 45),
      developer: r.int(49, 52),
      pickup: r.int(56, 59),
      transfer: r.int(63, 66),
      fuser: r.int(70, 74),
      drum: r.int(79, 88),
      pressure: r.int(94, 104)
    };
    /* Which one is marked, on the repeating-defect ticket. Deliberately not
       always the drum — the whole lesson is that it is worth measuring. */
    p.repeatPart = r.pick(["drum", "developer", "charge", "transfer", "fuser"]);
    p.repeatMm = p.circ[p.repeatPart];
  } else {
    p.headType = m.headType;
    p.pageCount = r.int(4000, 41000);
    p.wastePct = fault.key === "wastepad" ? 100 : r.int(22, 79);
    p.inks = ["Black", "Cyan", "Magenta", "Yellow"].map(function (c) {
      return { c: c, pct: r.int(35, 92) };
    });
    /* On a genuine head clog exactly one channel is dead in the nozzle
       check. On every other inkjet fault the pattern is perfect, and that
       is what separates "it is not firing" from "it is landing wrong". */
    p.deadChannel = fault.key === "head" ? r.pick(["Cyan", "Magenta", "Yellow", "Black"]) : null;
    p.cleaningCycles = fault.key === "capping" ? r.int(18, 44)
      : fault.key === "head" ? r.int(6, 11) : r.int(0, 3);
  }
  return p;
}

/* The repeating-defect answer: which rotating component matches the measured
   spacing. Ground truth, computed, never written beside the rows. */
export function repeatMatch(printer, measuredMm) {
  var best = null, bestGap = 1e9;
  Object.keys(printer.circ).forEach(function (k) {
    var gap = Math.abs(printer.circ[k] - measuredMm);
    if (gap < bestGap) { bestGap = gap; best = k; }
  });
  return { key: best, gap: bestGap, exact: bestGap <= 2 };
}

/* The rows a student reads the interval against — the service manual page
   for this model, shuffled so position carries no information. */
export function circumferenceRows(printer, shuffle) {
  var names = {
    charge: "Primary charge roller", developer: "Developer roller",
    transfer: "Transfer roller", drum: "Photosensitive drum",
    fuser: "Fuser heat roller", pressure: "Fuser pressure roller",
    registration: "Registration roller", pickup: "Pickup roller"
  };
  var rows = Object.keys(printer.circ).map(function (k) {
    return { key: k, name: names[k], mm: printer.circ[k] };
  });
  return shuffle ? shuffle(rows) : rows;
}

/* Which part each fault actually replaces or cleans, for the locate step and
   the parts order. */
export function printerTarget(fault) {
  return {
    pickup: "pickup", fuser: "fuser", transfer: "transfer", scanner: "polygon",
    repeat: null,                       // resolved from the measured interval
    duplexjam: "duplex", exitjam: "exit", regskew: "registration",
    gearnoise: "gears", ozone: "ozone",
    encoder: "encoder", capping: "capping", head: "printhead",
    belt: "belt", wastepad: "wastepad",
    platen: "platen", starwheel: "starwheel", feedenc: "encoderwheel",
    pumpfail: "pump", ijfeed: "pickupij",
    sepwear: "separation", cleanblade: "drum", tonerlow: "developer",
    trayguide: "registration", wrongmedia: "fuser",
    airlock: "pump", headstrike: "printhead", waterink: "platen",
    carriagerail: "carriage", chipreset: "printhead"
  }[fault.key];
}

export function partsFor(engine) {
  return engine === "laser" ? LASER_PARTS : INKJET_PARTS;
}

/* =====================================================================
   The procedure

   Step four of the methodology says "implement the solution", and on a
   printer that is a sequence rather than a swap. Getting it wrong is not
   abstract: a fuser at 200°C burns you, a fingerprint ruins a drum, and a
   workshop vacuum will cheerfully pass toner through its filter and blow a
   cloud of fine plastic into the room you are standing in.

   So the pool below mixes three kinds of action, and all three are on the
   list together:

   - the steps that belong in this repair, in an order that matters
   - honest steps that belong in a different repair
   - things that must never appear at all, each of which is something a
     reasonable person would try

   Anything in the third group fails the step outright however good the rest
   of the order is, which is the correct weighting. You do not get partial
   credit for a tidy procedure with a burn in the middle of it.
   ===================================================================== */

export const LASER_ACTIONS = [
  { key: "notify", label: "Tell the user how long the printer will be out of service" },
  { key: "power", label: "Power the printer off and unplug it" },
  { key: "cool", label: "Leave the fuser to cool for twenty minutes before going near it" },
  { key: "tray", label: "Pull the paper trays out" },
  { key: "cover", label: "Open the covers and take off the rear access panel" },
  { key: "cartridge", label: "Take the toner cartridge out and put it in a dark bag" },
  { key: "fitpickup", label: "Fit the new pickup roller" },
  { key: "fitpad", label: "Fit the new separation pad" },
  { key: "fitfuser", label: "Fit the new fuser assembly" },
  { key: "fittransfer", label: "Fit the new transfer roller, handling it by the ends only" },
  { key: "cleanwindow", label: "Brush the laser exit window with a soft optical brush" },
  { key: "swapcomponent", label: "Replace the rotating component the repeat interval identified" },
  { key: "tonervac", label: "Lift the loose toner with a toner-rated ESD-safe vacuum" },
  { key: "wiperollers", label: "Wipe the feed rollers with a lint-free cloth and water" },
  { key: "dust", label: "Clear the paper dust out of the paper path" },
  { key: "reassemble", label: "Refit the cartridge, the panels and the trays" },
  { key: "reconnect", label: "Reconnect the power and switch it on" },
  { key: "testpage", label: "Print the printer's own configuration page" },
  { key: "resetcounter", label: "Reset the maintenance counter" },
  { key: "fitseppad", label: "Fit a new separation pad to the multipurpose tray" },
  { key: "rockcart", label: "Rock the cartridge to redistribute what toner is left" },
  { key: "fitcart", label: "Fit a replacement toner cartridge" },
  { key: "setguides", label: "Set the tray guides to the stock actually loaded" },
  { key: "fanream", label: "Fan the ream before it goes in the tray" },
  { key: "setmedia", label: "Set the tray's media type to match the stock in it" },
  /* ---- the six that must never appear ---- */
  { key: "shopvac", label: "Vacuum the loose toner out with the workshop vacuum", forbidden: true,
    why: "A standard vacuum's filter passes toner straight through and back into the room, and the motor brushes can ignite an airborne cloud of it. This is the single most common dangerous mistake on a laser printer." },
  { key: "airblast", label: "Blow the toner out with canned compressed air", forbidden: true,
    why: "That does not remove the toner, it aerosolises it — into the room, into the machine's optics, and into you. Toner is a fine plastic powder and it is not something to breathe." },
  { key: "hotwater", label: "Wash the toner off your hands with hot soapy water", forbidden: true,
    why: "Cold water only. Toner is designed to melt and bond under heat — that is literally what the fuser does to it. Hot water fuses it into your skin and into the fabric of your clothes." },
  { key: "touchdrum", label: "Wipe the drum surface clean with a cloth", forbidden: true,
    why: "Never touch the drum. Skin oils mark it permanently, cloth scratches the coating, and daylight fogs it within minutes. A drum is cleaned by the blade inside the cartridge and by nothing else." },
  { key: "hotfuser", label: "Pull the fuser straight out and get on with it", forbidden: true,
    why: "It runs at around 200°C and holds that heat for a long time after power-off. This is the step that puts a technician in the burns unit." },
  { key: "oilrollers", label: "Put a little light oil on the feed rollers", forbidden: true,
    why: "A feed roller works by gripping. Lubricating one turns a roller that slips sometimes into a roller that cannot grip at all." }
];

export const INKJET_ACTIONS = [
  { key: "notify", label: "Tell the user how long the printer will be out of service" },
  { key: "parkhead", label: "Let the carriage park itself, then power off at the button" },
  { key: "unplug", label: "Unplug it once the head is capped" },
  { key: "servicepos", label: "Drive the carriage to the service position from the printer's menu" },
  { key: "cleanencoder", label: "Clean the encoder strip with distilled water on a lint-free cloth" },
  { key: "cleancap", label: "Clean the capping station and the wiper blade with distilled water" },
  { key: "cleanstar", label: "Clear dried ink off the star wheels and the platen" },
  { key: "fitbelt", label: "Fit the new carriage belt and set its tension" },
  { key: "fitpad", label: "Fit the new waste ink pad" },
  { key: "resetwaste", label: "Reset the waste ink counter" },
  { key: "soak", label: "Soak the printhead in the manufacturer's cleaning solution" },
  { key: "fithead", label: "Fit the replacement printhead" },
  { key: "headclean", label: "Run one head-cleaning cycle" },
  { key: "nozzlecheck", label: "Print a nozzle check pattern" },
  { key: "align", label: "Run the printhead alignment routine" },
  { key: "purgeline", label: "Purge the ink line to draw the air through" },
  { key: "setgap", label: "Set the platen gap for the media being used" },
  { key: "cleanface", label: "Clean the face of the head with the manufacturer's solution" },
  { key: "setpaper", label: "Set the driver's paper type so it lays down less ink" },
  { key: "cleanrail", label: "Clean the carriage rail and re-lubricate it with the specified grease" },
  { key: "fitcartij", label: "Fit a cartridge the machine will accept" },
  { key: "costnote", label: "Put the cost of the refills beside the cost of the visits in the ticket" },
  { key: "reassemble", label: "Close the covers and refit the trays" },
  { key: "testpage", label: "Print a test page and check it with the user" },
  /* ---- the five that must never appear ---- */
  { key: "alcoholencoder", label: "Clean the encoder strip with isopropyl alcohol", forbidden: true,
    why: "Alcohol dissolves the printed markings straight off the strip. It will look spotless and the carriage will no longer be able to read its position at all — you have turned a five-minute clean into a part order. Distilled water, nothing else, ever." },
  { key: "shovecarriage", label: "Slide the carriage across by hand to get at things", forbidden: true,
    why: "On most machines the carriage is locked when parked, and forcing it strips the belt or the drive gear. It gets moved from the service menu, or with the power off on the models that allow it — never against a lock." },
  { key: "yankpower", label: "Pull the plug out to stop it mid-cycle", forbidden: true,
    why: "Cut the power mid-cycle and the head is left sitting outside the capping station, uncapped, drying. You will arrive back to a clog you caused." },
  { key: "manycycles", label: "Run cleaning cycles back to back until the pattern comes good", forbidden: true,
    why: "Each cycle dumps a slug of ink onto the waste pad. Three cycles that do not clear it means something mechanical is wrong; the fourth through the tenth just empty a cartridge and fill the pad." },
  { key: "tapwater", label: "Rinse the parts under the tap", forbidden: true,
    why: "Tap water leaves mineral deposits in exactly the places that have to stay clear. Distilled, or the manufacturer's fluid." }
];

/* The correct sequence, per fault. Order is graded, and the safety steps are
   part of the sequence rather than a preamble — because that is where they
   are in the job. */
const PROCEDURES = {
  /* --- laser --- */
  sepwear: ["notify", "power", "cool", "tray", "fitseppad", "reassemble",
    "reconnect", "testpage"],
  cleanblade: ["notify", "power", "cool", "cover", "cartridge", "fitcart",
    "tonervac", "reassemble", "reconnect", "testpage"],
  tonerlow: ["notify", "power", "cool", "cover", "cartridge", "rockcart", "fitcart",
    "reassemble", "reconnect", "testpage"],
  trayguide: ["notify", "tray", "setguides", "fanream", "testpage"],
  wrongmedia: ["notify", "tray", "setmedia", "testpage"],
  /* --- inkjet --- */
  airlock: ["notify", "parkhead", "purgeline", "nozzlecheck", "testpage"],
  headstrike: ["notify", "parkhead", "unplug", "servicepos", "cleanface", "setgap",
    "reassemble", "nozzlecheck", "testpage"],
  waterink: ["notify", "setpaper", "testpage"],
  carriagerail: ["notify", "parkhead", "unplug", "servicepos", "cleanrail",
    "reassemble", "align", "testpage"],
  chipreset: ["notify", "fitcartij", "nozzlecheck", "costnote", "testpage"],
  pickup: ["notify", "power", "cool", "tray", "cover", "tonervac", "dust",
    "fitpickup", "fitpad", "fittransfer", "fitfuser", "reassemble", "reconnect",
    "testpage", "resetcounter"],
  fuser: ["notify", "power", "cool", "cover", "fitfuser", "reassemble",
    "reconnect", "testpage", "resetcounter"],
  repeat: ["notify", "power", "cool", "cover", "cartridge", "swapcomponent",
    "reassemble", "reconnect", "testpage"],
  transfer: ["notify", "power", "cool", "cover", "cartridge", "fittransfer",
    "reassemble", "reconnect", "testpage"],
  scanner: ["notify", "power", "cool", "cover", "cartridge", "cleanwindow",
    "reassemble", "reconnect", "testpage"],
  /* --- inkjet --- */
  encoder: ["notify", "parkhead", "unplug", "servicepos", "cleanencoder",
    "reassemble", "testpage"],
  capping: ["notify", "parkhead", "unplug", "servicepos", "cleancap",
    "reassemble", "headclean", "nozzlecheck"],
  head: ["notify", "parkhead", "unplug", "servicepos", "soak", "nozzlecheck",
    "fithead", "align", "testpage"],
  belt: ["notify", "parkhead", "unplug", "servicepos", "fitbelt", "reassemble",
    "align", "testpage"],
  wastepad: ["notify", "parkhead", "unplug", "fitpad", "resetwaste",
    "reassemble", "testpage"],
  duplexjam: ["notify", "power", "cool", "cover", "wiperollers", "dust", "reassemble", "reconnect", "testpage"],
  exitjam: ["notify", "power", "cool", "cover", "wiperollers", "dust", "reassemble", "reconnect", "testpage"],
  regskew: ["notify", "power", "cool", "cover", "wiperollers", "reassemble", "reconnect", "testpage"],
  gearnoise: ["notify", "power", "cool", "cover", "cartridge", "swapcomponent", "reassemble", "reconnect", "testpage"],
  ozone: ["notify", "power", "cool", "cover", "tonervac", "reassemble", "reconnect", "testpage"],
  platen: ["notify", "parkhead", "unplug", "cleanstar", "reassemble", "testpage"],
  starwheel: ["notify", "parkhead", "unplug", "cleanstar", "reassemble", "testpage"],
  feedenc: ["notify", "parkhead", "unplug", "servicepos", "cleanencoder", "reassemble", "testpage"],
  pumpfail: ["notify", "parkhead", "unplug", "servicepos", "cleancap", "reassemble", "headclean", "nozzlecheck"],
  ijfeed: ["notify", "parkhead", "unplug", "cleanstar", "reassemble", "testpage"]
};

export function correctProcedure(fault) { return PROCEDURES[fault.key].slice(); }

export function actionsFor(engine) {
  return engine === "laser" ? LASER_ACTIONS : INKJET_ACTIONS;
}

export function actionByKey(engine, key) {
  return actionsFor(engine).filter(function (a) { return a.key === key; })[0];
}

/* Why a chosen step does or does not belong here. The forbidden ones carry
   their own explanation on the action itself; everything else is judged
   against this fault's sequence. */
export function procedureWhy(fault, key) {
  var a = actionByKey(fault.engine, key);
  if (!a) return "";
  if (a.forbidden) return a.why;
  var want = PROCEDURES[fault.key];
  if (want.indexOf(key) !== -1) return "";
  return "Honest work, and it belongs to a different repair. Nothing on this ticket calls for it, " +
    "and every extra step on a printer is time the user is not printing.";
}

/* Which parts this ticket actually touched, and therefore which ones the
   student has to know how to clean. Cleaning is graded on every printer
   job, because on a printer it is part of every printer job. */
const TOUCHED = {
  sepwear: ["separation", "pickup", "registration"],
  cleanblade: ["drum", "waste", "developer"],
  tonerlow: ["developer", "drum", "waste"],
  trayguide: ["registration", "pickup", "separation"],
  wrongmedia: ["fuser", "exit", "transfer"],
  airlock: ["printhead", "pump", "capping"],
  headstrike: ["printhead", "platen", "starwheel"],
  waterink: ["platen", "starwheel", "pickupij"],
  carriagerail: ["carriage", "belt", "encoder"],
  chipreset: ["printhead", "capping", "wiper"],
  pickup: ["pickup", "separation", "registration", "transfer", "fuser", "waste"],
  fuser: ["fuser", "exit", "registration"],
  repeat: ["drum", "developer", "charge", "transfer"],
  transfer: ["transfer", "drum", "waste"],
  scanner: ["polygon", "drum", "waste"],
  encoder: ["encoder", "carriage", "belt"],
  capping: ["capping", "wiper", "printhead"],
  head: ["printhead", "capping", "wiper"],
  belt: ["belt", "carriage", "encoder"],
  wastepad: ["wastepad", "capping", "pump"],
  duplexjam: ["duplex", "exit", "registration"],
  exitjam: ["exit", "fuser", "duplex"],
  regskew: ["registration", "pickup", "separation"],
  gearnoise: ["gears", "drum", "transfer"],
  ozone: ["ozone", "charge", "waste"],
  platen: ["platen", "starwheel", "pickupij"],
  starwheel: ["starwheel", "platen", "printhead"],
  feedenc: ["encoderwheel", "pickupij", "platen"],
  pumpfail: ["pump", "capping", "wiper"],
  ijfeed: ["pickupij", "platen", "starwheel"]
};

export function touchedParts(fault) {
  var pool = partsFor(fault.engine);
  return TOUCHED[fault.key].map(function (k) {
    return pool.filter(function (p) { return p.key === k; })[0];
  }).filter(Boolean);
}

/* The method list a student picks from for a given part: the right one, the
   damaging one written for that part, and enough plausible others that it
   is a judgement rather than a coin toss. */
export function methodChoices(part, shuffle) {
  var keys = [part.clean, part.never];
  ["lintwater", "distilled", "alcohol", "lintdry", "tonervac", "replace", "none", "brush"]
    .forEach(function (k) { if (keys.indexOf(k) === -1 && keys.length < 6) keys.push(k); });
  var out = keys.map(function (k) { return { key: k, label: CLEAN_METHODS[k] }; });
  return shuffle ? shuffle(out) : out;
}

export function methodWhy(part, chosen) {
  if (chosen === part.clean) {
    return part.role + " " + (part.clean === "none"
      ? "Which is why the right answer is to leave it alone."
      : "Correct method, and it is the one the manufacturer specifies.");
  }
  if (chosen === part.never) return part.neverWhy;
  return "That is not the method for this part. " + part.role + " " +
    (part.clean === "none"
      ? "It is sealed or replace-only — the right answer here is not to clean it at all."
      : "The right answer is: " + CLEAN_METHODS[part.clean].toLowerCase() + ".");
}
