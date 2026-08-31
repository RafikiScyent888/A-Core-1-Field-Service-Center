/* =====================================================================
   Field Service Center — the power and safety track

   The one track where getting it wrong can hurt somebody.

   Everything else in this build is about a machine that has stopped
   working. This is about the thing the machine is plugged into, and it
   splits three ways that a technician has to be able to tell apart on
   sight:

   1. THE SUPPLY IN THE MACHINE. A rail out of tolerance under load, or a
      Power Good signal that never arrives. Measurable, yours to fix, and
      the tolerances are published numbers rather than opinions.

   2. THE BUILDING. An open ground or a reversed-polarity outlet is not a
      computer fault and it is not yours to repair. It is a shock hazard
      you found, and what you do with it is label it, report it in
      writing, move the user to a good outlet, and hand it to somebody
      licensed. Deciding that is a graded answer here, because "have a go"
      is how technicians get hurt.

   3. THE LOAD. A breaker sized for the wire rather than the equipment, a
      UPS with a laser printer on the battery side, a strip chained into
      another strip. All arithmetic, all preventable, and none of it fixed
      by fitting a bigger breaker — which is on the forbidden list for the
      same reason it is on every electrician's.

   Every reading on this track is COMPUTED from the fault and compared
   against the published limit, so the tolerance is something the student
   applies rather than something the page has already applied for them.
   ===================================================================== */

/* =====================================================================
   Published limits

   ATX rails are specified at ±5%, except the negative rail at ±10%. Power
   Good has to assert between 100 and 500ms after the rails come up: too
   early and the board starts before the rails are stable, too late or
   never and it does not start at all.
   ===================================================================== */
export const RAILS = [
  { key: "v12", label: "+12V", nominal: 12, tol: 0.05 },
  { key: "v5", label: "+5V", nominal: 5, tol: 0.05 },
  { key: "v33", label: "+3.3V", nominal: 3.3, tol: 0.05 },
  { key: "vsb", label: "+5VSB (standby)", nominal: 5, tol: 0.05 },
  { key: "vneg", label: "-12V", nominal: -12, tol: 0.10 }
];

export function railLimits(rail) {
  var lo = rail.nominal * (1 - rail.tol), hi = rail.nominal * (1 + rail.tol);
  return rail.nominal < 0 ? { lo: hi, hi: lo } : { lo: lo, hi: hi };
}

export function inTolerance(rail, v) {
  var L = railLimits(rail);
  return v >= L.lo - 1e-9 && v <= L.hi + 1e-9;
}

export const PG_MIN = 100, PG_MAX = 500;

/* Nominal mains, and the ±10% the equipment is built to ride out. */
export const MAINS_NOMINAL = 120, MAINS_TOL = 0.10;

/* A circuit is loaded to 80% of its breaker for anything running longer
   than three hours. That is the number people do not know, and it is the
   difference between "it fits" and "it trips at four o'clock". */
export const CONTINUOUS = 0.80;

/* =====================================================================
   The parts you might point at
   ===================================================================== */
export const POWER_PARTS = [
  {
    key: "psu", label: "The power supply",
    role: "Converts mains to the rails the board runs on, and asserts Power Good when they are stable.",
    fails: "Rails that hold at idle and sag under load, or a Power Good signal that never arrives.",
    seen: "Nothing to see. It looks and sounds exactly like a healthy one, which is why this is measured rather than inspected.",
    /* Two of this part's faults DO leave something to see, and saying
       "nothing to see" on those tickets would be the model lying to a
       student who is being taught to look. */
    seenBy: {
      psufanseized: "The exhaust grille is felted over with dust and the fan behind it does not move when you nudge it. " +
        "The case is far too hot for a machine that has been off for ten minutes.",
      voltselector: "Clean, undamaged, correctly seated, and the red slide switch beside the inlet is pushed over to 230V."
    }
  },
  {
    key: "atx24", label: "The 24-pin connector",
    role: "Where every rail is available to a meter probe without taking anything apart.",
    fails: "Rarely itself — it is where you measure, not usually what is wrong.",
    seen: "Seated, latched, no discolouration on any pin."
  },
  {
    key: "outlet", label: "The wall outlet",
    role: "Hot, neutral and ground. The ground is the one that only matters on the day something goes wrong.",
    fails: "A ground that was never connected, or a hot and neutral swapped behind the faceplate.",
    seen: "Ordinary. There is nothing about a dangerous outlet that looks different from a safe one."
  },
  {
    key: "ups", label: "The UPS",
    role: "Rides out sags and short cuts, and gives the machine long enough to shut down on a long one.",
    fails: "Overloaded, or asked to do a job it was not bought for.",
    seen: "Front panel lit, load bar high, alarm sounding.",
    seenBy: {
      upsbypass: "Front panel lit and steady, load bar low, no alarm — and the bypass indicator beside it is on. " +
        "The unit is passing mains straight through and telling you so.",
      upswaveform: "Front panel lit, load bar low, no alarm, no fault of any kind. There is nothing wrong with this " +
        "unit to see, because there is nothing wrong with this unit."
    }
  },
  {
    key: "upscell", label: "The UPS battery pack",
    role: "Sealed lead-acid cells. They have a service life in years whether they are ever used or not.",
    fails: "Capacity falls off a cliff at around three to five years, and the runtime goes with it.",
    seen: "Case slightly bowed, terminals sound, date sticker four years old."
  },
  {
    key: "strip", label: "The power strip",
    role: "Extends one outlet into several. A surge-protected one also has a joule rating that gets used up.",
    fails: "Chained into another strip, loaded past its rating, or protecting nothing because the joules are spent.",
    seen: "One strip plugged into another, and the protection light is out on the first one."
  },
  {
    key: "breaker", label: "The breaker",
    role: "Protects the wire in the wall from carrying more current than it can safely carry.",
    fails: "It does not fail. It does its job, and its job is to stop.",
    seen: "Tripped, and warm. It is doing exactly what it was fitted to do."
  },
  {
    key: "module", label: "The expansion module",
    role: "The card or module fitted at the last visit.",
    fails: "Static damage does not kill outright. It leaves a part that works, mostly, for a while.",
    seen: "No visible damage at all. Static damage never leaves a mark you can see."
  }
];

/* =====================================================================
   The faults
   ===================================================================== */
export const POWER_FAULTS = [
  {
    key: "railsag", part: "a supply that cannot hold its rails under load", target: "psu",
    objective: "5.1", scope: "yours", test: "railload",
    root: "The supply holds every rail at idle and drops the 12V rail below tolerance the moment the machine is asked to do anything.",
    observable: "it runs perfectly for light work and switches itself off within minutes of anything heavy",
    symptoms: ["It's fine for email and dies when she renders",
      "No blue screen, it just goes off", "It's worse in the afternoon"],
    fixes: "Replace the supply with one rated above the machine's measured peak draw, and load-test the replacement before the panel goes back on.",
    wrongReflex: "processor",
    wrongWhy: "The processor throttles and recovers; it does not switch the machine off at the wall. A rail measured out of tolerance under load is not a symptom of something else — it is the fault.",
    evidence: "A rail inside tolerance at idle and outside it under load, measured against the published ±5%"
  },
  {
    key: "pgdelay", part: "a Power Good signal that never arrives", target: "psu",
    objective: "5.1", scope: "yours", test: "pgcheck",
    root: "The rails come up and the supply never asserts Power Good, so the board holds itself in reset and nothing happens.",
    observable: "the fans spin for a moment on the button and then nothing at all — no beeps, no display, no POST",
    symptoms: ["Fans twitch and stop", "No beeps, nothing on screen",
      "It was fine when we shut it down on Friday"],
    fixes: "Replace the supply. The rails alone do not start a board — the signal that says they are stable is what releases it.",
    wrongReflex: "motherboard",
    wrongWhy: "The board is being held in reset by a supply that never told it to start, which is exactly what a dead board looks like from the outside. A supply tester separates the two in four minutes and a board costs three hundred.",
    evidence: "Rails all present and correct with Power Good never asserting inside its 100–500ms window"
  },
  {
    key: "openground", part: "an outlet with no ground connection", target: "outlet",
    objective: "5.1 — escalates", scope: "electrician", test: "recept",
    root: "The outlet has hot and neutral connected and no ground at all. Everything plugged into it works, and nothing plugged into it is protected.",
    observable: "a faint tingle off the case when the user leans on the desk, and everything otherwise working normally",
    symptoms: ["I get a little buzz off it sometimes",
      "It's been like that since we moved in", "Everything works fine though"],
    fixes: "Label the outlet out of service, move the user to a known-good one so they can work, report it in writing, and hand it to a licensed electrician. Retest it yourself once it is signed off.",
    wrongReflex: "machine",
    wrongWhy: "There is nothing wrong with the machine. The tingle is leakage current with nowhere to go, and it is going through the user instead. Swapping the computer moves the hazard to a different computer.",
    evidence: "Hot to neutral at nominal with hot to ground reading nothing at all"
  },
  {
    key: "revpolarity", part: "an outlet wired with hot and neutral reversed", target: "outlet",
    objective: "5.1 — escalates", scope: "electrician", test: "recept",
    root: "Hot and neutral are swapped behind the faceplate. Everything works, and the chassis of anything plugged into it sits at line potential the moment a switch is opened.",
    observable: "equipment that is switched off is still live to the touch, and one outlet on this wall behaves differently from the rest",
    symptoms: ["It shocked me and it wasn't even on",
      "This one socket has always been odd", "The other ones are fine"],
    fixes: "Stop. Unplug it, label the outlet out of service, move the user, report it in writing, and get a licensed electrician to it. Nothing goes back into that outlet until somebody qualified has signed it off.",
    wrongReflex: "surge protector",
    wrongWhy: "A surge protector does nothing about reversed polarity — it will happily pass it through and light its own green light while it does. Putting one in makes the outlet look safer and changes nothing about what is behind it.",
    evidence: "Hot to ground reading nothing and neutral to ground reading full line voltage, which is the two conductors the wrong way round"
  },
  {
    key: "upsbattery", part: "a UPS battery pack at the end of its life", target: "upscell",
    objective: "5.1", scope: "yours", test: "upspanel",
    root: "The cells are four years old. They hold enough charge to light the panel and not enough to carry the load for more than a moment.",
    observable: "the UPS carries the machine for a few seconds on a cut and then drops it, on a load it used to hold for twenty minutes",
    symptoms: ["It used to give us ages and now it gives us nothing",
      "It's beeping at us", "The light on the front has gone amber"],
    fixes: "Move the load to the surge-only side, fit the correct replacement pack for that model, send the old one out as hazardous waste, then run a self-test and let it recalibrate. Write the fitting date on the pack.",
    wrongReflex: "UPS",
    wrongWhy: "The electronics are fine and they are the expensive half. Sealed lead-acid cells are a consumable with a service life measured in years, and replacing a whole unit because its consumable is finished is the same mistake as buying a printer because it needs toner.",
    evidence: "A failed self-test and a runtime estimate collapsed against a load the unit is comfortably rated for"
  },
  {
    key: "upsoverload", part: "a UPS loaded past its rating", target: "ups",
    objective: "5.1", scope: "yours", test: "upspanel",
    root: "Somebody plugged a laser printer into the battery side. A fuser draws more on warm-up than the whole rest of the load put together.",
    observable: "the UPS alarms and drops to bypass every time the printer warms up, taking the machines with it",
    symptoms: ["It screams whenever anyone prints",
      "Everything reboots at the same time", "It's only started since the printer moved"],
    fixes: "Move the printer to a surge-only outlet, off the battery side. Add up what is left against the unit's watt rating and confirm it fits before you leave.",
    wrongReflex: "battery",
    wrongWhy: "The battery is healthy and the self-test passes. Fitting a new pack to a unit that is being asked to carry more than it is rated for buys you a few weeks and the same call back.",
    evidence: "A load percentage over 100 of the unit's watt rating, rising and falling with the printer rather than with the machines"
  },
  {
    key: "brownout", part: "mains that sags below tolerance at a predictable time", target: "none",
    objective: "5.1", scope: "yours", test: "mainslog",
    root: "The incoming supply dips below the equipment's tolerance whenever something large on the site starts. Nothing in this room is faulty.",
    observable: "machines across the floor drop or reboot together at the same time each day, and nothing else connects them",
    symptoms: ["It happens at the same time every day", "It's not just my machine",
      "It started when they put the new compressor in"],
    fixes: "Fit a line-interactive UPS with automatic voltage regulation, which corrects a sag without going to battery. Report the sag pattern to facilities with the log, because the building has a problem your equipment is only absorbing.",
    wrongReflex: "power supply",
    wrongWhy: "Every supply on the floor cannot have failed at four o'clock together. A fault that hits several machines at the same moment is upstream of all of them, and a new supply in one of them fixes nothing.",
    evidence: "A logged input voltage below the ±10% window at the same time each day, across more than one machine"
  },
  {
    key: "esdstatic", part: "a module damaged by static when it was fitted", target: "module",
    objective: "5.1", scope: "yours", test: "swapmod",
    root: "The module was fitted on a carpet, in winter, without a strap. Static damage rarely kills outright — it leaves a part that works, mostly, and fails at random from then on.",
    observable: "random failures that started the week the part was fitted, with every measurement on the machine inside tolerance",
    symptoms: ["It's been odd ever since the upgrade",
      "It's never the same thing twice", "The person who fitted it said it was fine"],
    /* This ticket teaches two different things and only one of them is Core
       1. The DIAGNOSIS is: every reading on the machine is in tolerance and
       the failures date from the day a part was fitted, so the fault is in
       the history rather than in the numbers. That is 5.1 and it is what is
       graded. HOW to handle a module without damaging it — mat, strap, hold
       it by the edges — is a safety procedure, which is Core 2's, and it
       used to be spelled out here as though this were the place to learn it.
       It is named as the cause and pointed forward, not taught. */
    fixes: "Order a replacement module and have it fitted by somebody following proper anti-static handling, because the first one was not. Nothing on this machine needs repairing — the part is damaged and the way it was handled is why. The handling procedure itself is Core 2 safety material; what this ticket asks of you is to work out that a part damaged on fitting is what you are looking at.",
    wrongReflex: "driver",
    wrongWhy: "A driver fault is repeatable and this is not. Random failures that arrived with a part, on a machine whose rails and temperatures are all in tolerance, point at the part and at how it was handled.",
    evidence: "Every rail and every temperature inside tolerance, with the failures dating from the day the module was fitted"
  },
  {
    key: "stripchain", part: "power strips chained into one another", target: "strip",
    objective: "5.1", scope: "facilities", test: "walkstrip",
    root: "One strip is plugged into another to reach the far desks, and the protection indicator on the first one has been out for years. It is carrying more than it is rated for through a joint nobody has looked at.",
    observable: "a warm plug, a strip that smells faintly of hot plastic, and a protection light that is out",
    symptoms: ["The plug gets warm", "There's a funny smell under that desk",
      "We ran out of sockets so we added another one"],
    fixes: "Take the chained strips out and put in one properly rated unit fed from its own outlet. Add up what is on it. Get facilities to plan sockets for the desks that are actually there, because the desks are not going away.",
    wrongReflex: "surge protector",
    wrongWhy: "The joules in a surge protector are consumed by the surges it absorbs, and when they are gone the unit carries on working as an ordinary strip with a light that has gone out. A replacement strip solves the protection and none of the chaining.",
    evidence: "One strip fed from another, with the total plugged load above what the first one is rated to carry"
  },
  {
    key: "circuitload", part: "a circuit loaded past what its breaker allows", target: "breaker",
    objective: "5.1", scope: "facilities", test: "clampcircuit",
    root: "Everything on the circuit together is over the continuous-load limit for that breaker. It holds until the last thing switches on and then it does exactly what it is fitted to do.",
    observable: "the breaker trips at the same point in the day, taking a group of machines out together",
    symptoms: ["It goes off when someone puts the kettle on",
      "It's always the same set of desks", "Facilities keep resetting it"],
    fixes: "Add up what is actually on the circuit, compare it to 80% of the breaker rating, and get the load spread across circuits. Put the arithmetic in writing so the next person to add a desk sees it.",
    wrongReflex: "breaker",
    wrongWhy: "The breaker is the only part of this that is working correctly. It protects the wire in the wall, not the equipment, and fitting a bigger one leaves the same wire carrying more current with nothing to stop it.",
    evidence: "A measured total above 80% of the breaker's rating, which is the limit for anything running more than three hours"
  },
  {
    key: "surgedead", part: "a surge protector with nothing left in it", target: "strip",
    objective: "5.1", scope: "yours", test: "stripcheck",
    root: "The surge protector has absorbed everything it was rated for. It still works as an extension lead and it is protecting nothing, and the light that says so has been out for years.",
    observable: "everything works perfectly, and the protection indicator on the strip is dark",
    symptoms: ["The little light went out ages ago", "Everything still works",
      "We had a storm a couple of summers back"],
    fixes: "Replace the unit. The joules in a surge protector are consumed by the surges it absorbs, and when they are gone it carries on working as an ordinary strip with a dead light.",
    wrongReflex: "nothing",
    wrongWhy: "Nothing is failing, which is exactly why this gets left. A protector with no joules left is a piece of equipment that is doing half the job it was bought for and telling you so with the only signal it has.",
    evidence: "A protection indicator out on a unit that is still passing power normally"
  },
  {
    key: "neutralshare", part: "a shared neutral carrying two circuits", target: "breaker",
    objective: "5.1 — escalates", scope: "electrician", test: "clampneutral",
    root: "Two circuits share a neutral that was never wired as a proper multi-wire branch, so the neutral carries the sum of both rather than the difference. It runs hot under load.",
    observable: "a warm neutral at the panel and equipment that misbehaves on one circuit whenever the other one is busy",
    symptoms: ["It plays up when the workshop is running", "There's a burning smell near the panel",
      "Both circuits are on the same side"],
    fixes: "Stop. Label both circuits out of service, report it in writing with the readings, and get a licensed electrician to it. A neutral carrying more than it is rated for is a fire, not a fault.",
    wrongReflex: "equipment",
    wrongWhy: "The equipment works perfectly whenever the other circuit is idle, and swapping it changes nothing. A fault that appears on one circuit because of load on a different one is in what those two circuits share.",
    evidence: "A neutral measuring the sum of two circuits rather than their difference, and running warm"
  },
  {
    key: "genset", part: "equipment left off the protected supply", target: "outlet",
    objective: "5.1", scope: "facilities", test: "outletmap",
    root: "The site has a generator and a set of protected outlets, and this equipment is plugged into ordinary ones. It goes down on every cut while the machines beside it stay up.",
    observable: "one group of equipment drops on every power cut while equipment on the next desk carries on",
    symptoms: ["It goes off every time and hers doesn't", "We're on the same wall",
      "Nobody told us there were special sockets"],
    fixes: "Get the equipment moved onto the protected outlets, and get the protected ones labelled so the next person can tell them apart. There is nothing wrong with any of the equipment.",
    wrongReflex: "UPS",
    wrongWhy: "Buying a UPS for each desk duplicates a generator the site already paid for, and does it at the worst possible price. The supply that would have carried this equipment is already there and is already in the wall.",
    evidence: "Equipment on unprotected outlets failing on every cut while identical equipment on protected ones stays up"
  },
  {
    key: "psuwrongform", part: "a supply that does not fit the chassis", target: "psu",
    objective: "3.6 / 5.1", scope: "yours", test: "psufit",
    root: "A replacement supply was ordered on wattage alone. It is the wrong form factor for a small-form-factor chassis, and it will not mount or reach.",
    observable: "the replacement supply is on the bench, the machine is still in pieces, and nothing fits",
    symptoms: ["The new one won't go in", "It was the right wattage",
      "The connectors don't reach either"],
    fixes: "Order the correct form factor for this chassis, with the connectors this board and this card need and enough length on the loom. Wattage is one of four things that have to be right.",
    wrongReflex: "chassis",
    wrongWhy: "The chassis is standard and the supply that came out of it fitted perfectly. What was ordered was sized on one number when four of them matter, and modifying a case to take the wrong supply is how a machine stops being serviceable.",
    evidence: "A replacement of the correct wattage in the wrong form factor for the chassis it is meant to go in"
  },
  {
    key: "upsselftest", part: "a UPS that has never been tested", target: "ups",
    objective: "5.1", scope: "yours", test: "upspanel",
    root: "The unit has been sitting online for four years with self-test disabled, so nobody has ever found out whether it would carry the load. The first test of a UPS should not be a power cut.",
    observable: "the unit reports itself online and normal, and has never once run a self-test in four years",
    symptoms: ["It's always said online", "We've never had to use it",
      "It's been there since we moved in"],
    fixes: "Enable the scheduled self-test and run one now, on a load you can afford to drop. What it reports is the ticket; the fact that nobody knew is the finding.",
    wrongReflex: "nothing",
    wrongWhy: "A green light on an untested UPS means the unit believes it is online. It does not mean the battery would carry the load, and the only way to find out is to ask it on a day of your choosing rather than on a day of the weather's.",
    evidence: "A self-test log with no entries at all on a unit four years into service"
  },
  {
    key: "psufanseized", part: "a supply shutting itself down on temperature", target: "psu",
    objective: "5.1", scope: "yours", test: "psuthermal",
    root: "The fan in the supply has stopped. The supply runs until it reaches its thermal limit and then protects itself by switching off, which is the supply working correctly on a machine that has stopped.",
    observable: "it runs for half an hour from cold and then switches off, and it will not start again until it has stood for a while",
    symptoms: ["It goes off after about half an hour",
      "If you leave it a bit it comes back on", "It's worse now the heating's on"],
    fixes: "Replace the supply. A supply is a sealed part — it is tested from outside and replaced whole, and the fan inside it is not a serviceable item however easy the four screws look.",
    wrongReflex: "processor",
    wrongWhy: "A processor at its thermal limit throttles and keeps going; it does not cut the machine's power. Something that switches off after a predictable warm-up and needs a cool-down before it will start is a thermal protection circuit doing its job, and the one that cuts everything is in the supply.",
    evidence: "Rails all inside tolerance, no air at all from the supply's exhaust, and a stop that arrives on a timer rather than on a workload"
  },
  {
    key: "voltselector", part: "a supply with its input voltage selector set wrong", target: "psu",
    objective: "5.1", scope: "yours", test: "psuinput",
    root: "The red slide switch on the back of the supply is set to 230V and the building runs at 120V. The supply is fine and it is being told it is somewhere else.",
    observable: "the machine does nothing at all on the button, on a supply that was working in the last office",
    symptoms: ["It worked at the old place", "It's completely dead, no fans, nothing",
      "It got moved over in somebody's car"],
    fixes: "Unplug it, set the selector to match local mains, and confirm the setting before it goes back on. Then look for the machine that came over in the same load, because they were all set by the same person.",
    wrongReflex: "power supply",
    wrongWhy: "The supply is not faulty and a replacement would arrive with a selector on it too. This is the cheapest fault in this whole track and it is invisible to a meter pointed at the rails, because there are no rails to meter until the switch is right.",
    evidence: "A 115/230 selector set to 230 on a 120V supply, which is a five-second look before anything is measured"
  },
  {
    key: "upsbypass", part: "a UPS sitting in maintenance bypass", target: "ups",
    objective: "5.1", scope: "yours", test: "upspanel",
    root: "The unit was put into maintenance bypass for a service visit and never taken out of it. It passes mains straight through to the load and protects nothing, and it has been doing that for months.",
    observable: "the UPS is on, the load is running through it, and the machines went down with everything else in the last cut",
    symptoms: ["The UPS is on, we checked", "It went off with everything else",
      "Somebody was working on it in the spring"],
    fixes: "Take the unit out of maintenance bypass, confirm it transfers on a test, and put the date on the service record. Then find out why a bypass switch was left thrown, because it will be left again.",
    wrongReflex: "battery",
    wrongWhy: "The pack is healthy and it was never asked for anything — a unit in bypass does not touch its battery on a cut, so a fresh pack would have made exactly no difference to the outage that generated this call.",
    evidence: "A front panel reporting maintenance bypass rather than online, on a unit whose battery and self-test are both fine"
  },
  {
    key: "upswaveform", part: "a UPS whose output the supply will not accept", target: "ups",
    objective: "5.1", scope: "yours", test: "upstransfer",
    root: "The UPS produces a stepped approximation of a sine wave. The active power factor correction in these supplies cannot follow it, so they drop the moment the unit goes to battery rather than riding through.",
    observable: "the machines drop the instant the power goes, on a UPS that is not overloaded and passes every test it has",
    symptoms: ["It doesn't seem to do anything when the power goes",
      "It says it's fine", "The old machines were all right on it"],
    fixes: "Fit a UPS whose output waveform these supplies will accept on battery, sized on the watt figure rather than the VA one. The unit that is there is not faulty and it is not the right unit for active PFC supplies.",
    wrongReflex: "battery",
    wrongWhy: "The pack is young, the self-test passes and the load is well inside the rating. Nothing about this unit is failing — it is doing exactly what it was built to do, and what it was built to do is not enough for the supplies now plugged into it.",
    evidence: "Machines dropping on transfer to battery with the unit reporting normal, on a stepped-approximation output feeding active PFC supplies"
  },
  {
    key: "bootlegground", part: "an outlet with its ground bonded to neutral behind the faceplate", target: "outlet",
    objective: "5.1 — escalates", scope: "electrician", test: "groundcheck",
    root: "Somebody has jumpered the ground terminal to the neutral terminal inside the box. A receptacle tester reads that as correct wiring, and there is no protective conductor back to the panel at all.",
    observable: "a receptacle tester that shows correct wiring on an outlet whose circuit was never run with a ground",
    symptoms: ["It tests fine, we checked it with the plug-in thing",
      "This half of the building is older", "It's the same as all the others on this wall"],
    fixes: "Stop. Label the outlet out of service, move the user, report it in writing with what you found and how you found it, and get a licensed electrician to it. Nothing goes back in until somebody qualified has traced the ground to the panel.",
    wrongReflex: "receptacle tester",
    wrongWhy: "The tester is not lying and it is not broken — it is answering the only question it can ask, which is whether a low-impedance path exists between the ground pin and neutral. A jumper inside the box makes that true, and it is exactly what a real ground would look like to three lamps.",
    evidence: "A tester showing correct wiring on an outlet where ground and neutral are the same conductor, so the only fault path is back through the neutral"
  }
];

/* =====================================================================
   The instruments

   Every number is derived from the fault and from the machine, and every
   one is shown beside its published limit rather than pre-judged.
   ===================================================================== */

/* The rails, at idle and under load. */
export function railRows(G) {
  var p = G.power, f = G.fault.key;
  return RAILS.map(function (r) {
    var idle = p.rail[r.key].idle, load = p.rail[r.key].load;
    return {
      label: r.label,
      limits: railLimits(r),
      idle: idle, load: load,
      idleOk: inTolerance(r, idle), loadOk: inTolerance(r, load),
      bad: !inTolerance(r, idle) || !inTolerance(r, load)
    };
  }).concat([{
    label: "Power Good", limits: { lo: PG_MIN, hi: PG_MAX }, ms: true,
    idle: p.pgMs, load: p.pgMs,
    idleOk: p.pgMs !== null && p.pgMs >= PG_MIN && p.pgMs <= PG_MAX,
    loadOk: p.pgMs !== null && p.pgMs >= PG_MIN && p.pgMs <= PG_MAX,
    bad: f === "pgdelay"
  }]);
}

/* The outlet. Three readings and the lamp pattern a receptacle tester
   shows, because the pattern is what a technician actually reads. */
export function outletRows(G) {
  var o = G.power.outlet;
  return [
    { k: "Hot to neutral", v: o.hn.toFixed(1) + " V", bad: o.hn < 108 || o.hn > 132 },
    { k: "Hot to ground", v: o.hg.toFixed(1) + " V", bad: o.hg < 108 },
    { k: "Neutral to ground", v: o.ng.toFixed(1) + " V", bad: o.ng > 3 },
    { k: "Receptacle tester", v: o.lamps, bad: o.lamps !== "Correct" }
  ];
}

/* The UPS front panel. */
export function upsRows(G) {
  var u = G.power.ups;
  return [
    { k: "Model rating", v: u.va + " VA / " + u.watts + " W", bad: false },
    { k: "Connected load", v: u.load + " W (" + u.pct + "% of rating)", bad: u.pct > 100 },
    { k: "Estimated runtime", v: u.runtime + " minutes", bad: u.runtime < 5 },
    { k: "Battery age", v: u.battMonths + " months", bad: u.battMonths >= 40 },
    { k: "Last self-test", v: u.selfTest, bad: u.selfTest !== "Passed" },
    { k: "Transfers to battery this month", v: String(u.transfers), bad: u.transfers > 25 },
    /* Not flagged. A stepped output is not a fault in the unit — it is a
       specification, and whether it is the wrong one depends on what is
       plugged into it. Flagging it would answer the ticket. */
    { k: "Output waveform on battery", v: u.wave, bad: false },
    { k: "Front panel", v: u.panel, bad: u.panel !== "Online, normal" }
  ];
}

/* What is on the circuit, and the arithmetic nobody does. */
export function circuitRows(G) {
  var c = G.power.circuit;
  return c.items.map(function (it) {
    return { name: it.name, amps: it.amps, bad: false };
  });
}

export function circuitTotals(G) {
  var c = G.power.circuit;
  var total = c.items.reduce(function (a, i) { return a + i.amps; }, 0);
  var limit = c.breaker * CONTINUOUS;
  return {
    total: Math.round(total * 10) / 10,
    breaker: c.breaker,
    limit: Math.round(limit * 10) / 10,
    over: total > limit,
    headroom: Math.round((limit - total) * 10) / 10
  };
}

/* The mains log — a day of input voltage, sampled hourly. */
export function mainsRows(G) {
  return G.power.mains.map(function (m) {
    return {
      k: m.hour, v: m.volts.toFixed(0) + " V",
      bad: m.volts < MAINS_NOMINAL * (1 - MAINS_TOL) || m.volts > MAINS_NOMINAL * (1 + MAINS_TOL)
    };
  });
}

/* =====================================================================
   The tests
   ===================================================================== */
const TESTS = [
  { key: "railidle", label: "Meter the rails at idle", mins: 3,
    isolates: [],
    miss: "Every rail is inside its ±5% with the machine sitting at the desktop. Which tells you what the supply does when nothing is being asked of it." },
  { key: "railload", label: "Meter the rails again under full load", mins: 6,
    isolates: ["railsag"],
    hit: "The 12V rail drops out of tolerance within seconds of the load coming on, and comes back the moment it stops.",
    miss: "Every rail holds inside its ±5% with the machine at full load. The supply is doing its job." },
  { key: "pgcheck", label: "Check Power Good with a supply tester", mins: 4,
    isolates: ["pgdelay"],
    hit: "Every rail comes up and Power Good never asserts at all. The board is being held in reset by a supply that never released it.",
    miss: "Power Good asserts inside its window and every rail is present. The supply starts correctly." },
  { key: "recept", label: "Put a receptacle tester in the outlet", mins: 2,
    isolates: ["openground", "revpolarity"],
    miss: "Correct wiring — hot, neutral and ground all where they should be, and the ground reads as a ground." },
  { key: "upspanel", label: "Read the UPS panel and run a self-test", mins: 5,
    isolates: ["upsbattery", "upsoverload", "upsselftest", "upsbypass"],
    miss: "Online and normal, load comfortably inside the rating, self-test passed, runtime as expected." },
  { key: "mainslog", label: "Pull the input voltage log off the UPS", mins: 4,
    isolates: ["brownout"],
    hit: "The input drops below the ±10% window at the same hour every day, and recovers a few minutes later.",
    miss: "Input voltage sits inside the ±10% window all day with no excursions." },
  { key: "swapmod", label: "Swap the suspect module for a known-good one and watch it", mins: 12,
    isolates: ["esdstatic"],
    hit: "Two days on the replacement with no failures, and the original fails again within an hour of going back in.",
    miss: "It behaves exactly the same way on the known-good module. Whatever this is, it is not that part." },
  { key: "walkstrip", label: "Get under the desks and trace what is plugged into what", mins: 5,
    isolates: ["stripchain"],
    hit: "One strip is fed from another, the plug between them is warm, and the protection indicator on the first is out.",
    miss: "Every strip is fed straight from a wall outlet, nothing is chained, and the protection lights are all on." },
  { key: "clampcircuit", label: "Clamp-meter the circuit with everything on it running", mins: 8,
    isolates: ["circuitload"],
    hit: "The measured total is over the continuous-load limit for that breaker, which is 80% of its rating.",
    miss: "The circuit measures comfortably inside 80% of the breaker's rating with everything running." },
  { key: "stripcheck", label: "Look at the protection indicator on every strip on this floor", mins: 4,
    isolates: ["surgedead"],
    hit: "The unit passes power perfectly and its protection indicator is dark. It has absorbed everything it was rated for and is an extension lead now.",
    miss: "Every protection indicator on the floor is lit." },
  { key: "clampneutral", label: "Clamp the neutral at the panel with both circuits loaded", mins: 9,
    isolates: ["neutralshare"],
    hit: "The neutral is carrying the sum of both circuits rather than the difference, and it is warm. That is a shared neutral wired wrongly, and it is a fire risk rather than a fault.",
    miss: "The neutral carries what it should and stays cool with both circuits loaded." },
  { key: "outletmap", label: "Find out which outlets are on the protected supply and which are not", mins: 6,
    isolates: ["genset"],
    hit: "The equipment that stays up is on the protected outlets and the equipment that drops is not, and nothing distinguishes the two on the wall.",
    miss: "Every outlet on this wall is fed the same way." },
  { key: "psufit", label: "Offer the replacement supply up to the chassis before fitting anything", mins: 5,
    isolates: ["psuwrongform"],
    hit: "The wattage is right and nothing else is: it will not mount in this chassis and the loom will not reach the board.",
    miss: "It mounts, it reaches, and the connectors are the ones this machine needs." },
  /* These two read their result off the generated machine rather than
     carrying a fixed sentence, so the minutes and the switch position on
     the page are the ones the ticket actually dealt. */
  { key: "psuthermal", label: "Run it until it stops, then feel the supply's exhaust and check its fan", mins: 14,
    isolates: ["psufanseized"],
    miss: "It runs the whole time without stopping, the exhaust is warm and moving air, and the fan turns freely." },
  { key: "psuinput", label: "Look at the input voltage selector on the back of the supply", mins: 1,
    isolates: ["voltselector"],
    miss: "The selector is set to match local mains, or the supply is auto-ranging and has no selector to set." },
  { key: "upstransfer", label: "Pull the UPS input and watch what the machines actually do", mins: 6,
    isolates: ["upswaveform"],
    hit: "Every machine on the battery side drops the instant it transfers, and the unit reports the transfer as normal. " +
      "The output is a stepped approximation and these supplies will not follow it.",
    miss: "The machines ride the transfer without so much as a flicker, and carry on running off the battery." },
  { key: "groundcheck", label: "Check the ground back to the panel, not just across the receptacle", mins: 11,
    isolates: ["bootlegground"],
    hit: "The receptacle tester says correct wiring and there is no protective conductor in that box at all. " +
      "Ground and neutral are jumpered together behind the faceplate, which is what the tester was reading as a ground.",
    miss: "The ground runs back to the panel as a separate conductor and reads as one." },
  { key: "walldraw", label: "Meter the machine's own draw at the wall", mins: 4,
    isolates: [],
    miss: "It draws what a machine of this specification should draw. A number that is exactly what you expected has told you nothing." },
  { key: "eventlog", label: "Read the event log for power entries", mins: 3,
    isolates: [],
    miss: "Kernel-Power 41 on every unexpected stop, which is Windows saying it was not shut down cleanly. It records that the power went, never why." }
];

export function powerTests(G, shuffle) {
  var right = TESTS.filter(function (t) { return t.isolates.indexOf(G.fault.key) !== -1; });
  var wrong = TESTS.filter(function (t) { return t.isolates.indexOf(G.fault.key) === -1; });
  var pick = right.slice(0, 1).concat(shuffle(wrong).slice(0, 4));
  return shuffle(pick).map(function (t) {
    var iso = t.isolates.indexOf(G.fault.key) !== -1;
    return {
      key: t.key, label: t.label, mins: t.mins, isolating: iso,
      result: iso ? (t.hit || outletHit(G) || upsHit(G) || psuHit(G)) : t.miss
    };
  });
}

/* Two instruments serve two faults each, and the reading is what separates
   them — which is the point, because in the van you carry one tester and
   it has to tell you which of two things you are looking at. */
function outletHit(G) {
  var o = G.power.outlet;
  if (G.fault.key === "openground")
    return "Hot to neutral " + o.hn.toFixed(0) + "V, hot to ground nothing at all. The tester shows open ground. " +
      "There is no protective conductor behind that faceplate.";
  if (G.fault.key === "revpolarity")
    return "Hot to ground reads nothing and neutral to ground reads " + o.ng.toFixed(0) + "V. " +
      "The tester shows hot and neutral reversed. The chassis of anything plugged in sits at line potential.";
  return null;
}
function upsHit(G) {
  var u = G.power.ups;
  if (G.fault.key === "upsselftest")
    return "Online and normal, and the self-test log has no entries at all in " + u.battMonths +
      " months of service. Nobody has ever found out whether it would carry the load.";
  if (G.fault.key === "upsbattery")
    return "Self-test failed. Runtime estimate " + u.runtime + " minutes on a " + u.pct +
      "% load the unit is rated to hold for far longer, on a pack " + u.battMonths + " months old.";
  if (G.fault.key === "upsoverload")
    return "Load reads " + u.pct + "% of the unit's " + u.watts + "W rating and the overload alarm is sounding. " +
      "It rises and falls with the printer, not with the machines.";
  if (G.fault.key === "upsbypass")
    return "The panel reads maintenance bypass, not online. Battery " + u.battMonths + " months old and healthy, " +
      "self-test passed, load " + u.pct + "% — and none of that matters, because in bypass the load is fed " +
      "straight off the mains and the battery is not in the circuit at all.";
  return null;
}
/* The two things on the outside of a supply that a meter never sees. */
function psuHit(G) {
  var p = G.power;
  if (G.fault.key === "psufanseized")
    return "It stops at " + p.psuMinutesToStop + " minutes. No air at all out of the back, the case too hot to keep a " +
      "hand on, and the fan does not turn. Every rail was inside tolerance right up to the moment it went, which is " +
      "what a thermal cut-out looks like from the meter's side.";
  if (G.fault.key === "voltselector")
    return "The selector on the back is set to " + p.psuSelector + " and this building runs at " +
      MAINS_NOMINAL + "V. Nothing was ever going to happen on that button, and no meter pointed at the rails would " +
      "have told you so, because there are no rails until the switch is right.";
  return null;
}

/* =====================================================================
   Scope of work

   The judgement this track exists for. Two of these are not a technician's
   to repair at any level of confidence, and knowing that is worth more
   than knowing how the wiring works.
   ===================================================================== */
export const SCOPE_OPTIONS = [
  { key: "yours", label: "This one is yours — make it safe and do the work" },
  { key: "electrician", label: "Make it safe, then hand it to a licensed electrician" },
  { key: "facilities", label: "Make it safe, then hand it to facilities to re-plan the load" },
  { key: "none", label: "Nothing here needs doing — leave it alone" }
];

export function scopeCall(fault) { return fault.scope; }

export function scopeWhy(fault, chosen) {
  var right = fault.scope;
  if (chosen === right) {
    return {
      yours: "Yours. It is equipment on the customer's side of the outlet, it is measurable, and fixing it does not " +
        "involve touching anything in the building's wiring.",
      electrician: "Not yours, and confidence has nothing to do with it. This is the building's fixed wiring, it is a " +
        "shock hazard as it stands, and the work is licensed in every jurisdiction you will ever work in. What you do " +
        "is make it safe, write down what you measured, get the user working somewhere else, and hand it over.",
      facilities: "Not a repair at all. The equipment is fine and there is too much of it on one circuit, which is a " +
        "planning problem. You supply the arithmetic and facilities supply the sockets — and the arithmetic in " +
        "writing is what stops the next person adding one more desk to it."
    }[right];
  }
  var wrong = {
    yours: "Taking this one on yourself is the answer that gets technicians hurt or fired. Read what the reading " +
      "actually says about where the fault is: if it is behind the faceplate or in the panel, it is not on your side of the outlet.",
    electrician: "An electrician has nothing to do here. Nothing behind the faceplate is wrong — the readings on the " +
      "outlet are correct — and calling one out costs the customer a visit to be told that.",
    facilities: "Facilities cannot fix this. The fault is in a piece of equipment, not in how much of it is plugged " +
      "in where, and re-planning sockets around a broken part leaves the part broken.",
    none: "Something here does need doing. Deciding a live fault is acceptable because it has not stopped anybody yet " +
      "is how the tingle off the case becomes an incident report."
  };
  /* Deliberately does not name the right call. The guided hints exist to
     walk somebody to it over several attempts, and a first wrong answer that
     hands it over means they never reach them. */
  return wrong[chosen] + " Go back to the readings and ask which side of the outlet they put the fault on.";
}

/* =====================================================================
   The procedure

   Same builder the printers and the laptop use, and the same rule: a
   forbidden step fails the whole thing however tidy the rest of it is.
   Seven of these must never appear, and every one of the seven is
   something somebody has actually done.
   ===================================================================== */
export const POWER_ACTIONS = [
  { key: "quote", label: "Tell the customer what you have found and what it will cost them in downtime" },
  { key: "receptacle", label: "Test the outlet with a receptacle tester before anything else goes into it" },
  { key: "unplugmains", label: "Unplug the machine from the wall before the side panel comes off" },
  { key: "discharge", label: "Hold the power button down with it unplugged to bleed the standby rail" },
  { key: "esd", label: "Fit a wrist strap bonded to the chassis and work on an anti-static mat" },
  { key: "psuswap", label: "Fit a supply rated above the machine's measured peak draw" },
  { key: "cableroute", label: "Route and dress the new supply's cables clear of the fans" },
  { key: "psutest", label: "Load-test the new supply before the side panel goes back on" },
  { key: "labeloutlet", label: "Label the outlet out of service so nobody uses it" },
  { key: "movecircuit", label: "Move the user to a known-good outlet on another circuit so they can work" },
  { key: "reportfac", label: "Report it to facilities in writing, with the readings you took" },
  { key: "electrician", label: "Hand the wiring to a licensed electrician and do not touch it yourself" },
  { key: "retest", label: "Retest the outlet yourself once it has been signed off" },
  { key: "upsload", label: "Move the load to the surge-only side before the pack comes out" },
  { key: "upsbatt", label: "Fit the correct replacement battery pack for that model" },
  { key: "hazups", label: "Send the old sealed lead-acid pack out as hazardous waste" },
  { key: "upsdate", label: "Write the fitting date on the new pack" },
  { key: "upscal", label: "Run a self-test and let the unit recalibrate its runtime estimate" },
  { key: "movelaser", label: "Move the laser printer to a surge-only outlet, off the battery side" },
  { key: "avrups", label: "Fit a line-interactive UPS with automatic voltage regulation" },
  { key: "loadcalc", label: "Add up what is actually connected and compare it to the rating" },
  { key: "spreadload", label: "Get the load spread across circuits and the arithmetic put in writing" },
  { key: "stripout", label: "Take the chained strips out and fit one properly rated unit from its own outlet" },
  { key: "modswap", label: "Fit the replacement module, holding it by its edges" },
  { key: "test", label: "Run the machine through the user's own work with them watching" },
  { key: "newstrip", label: "Replace the surge protector with a rated unit" },
  { key: "labelprotected", label: "Get the protected outlets labelled so they can be told apart" },
  { key: "moveprotected", label: "Move the equipment onto the protected supply" },
  { key: "orderform", label: "Order the correct form factor with the connectors this machine needs" },
  { key: "enabletest", label: "Enable the scheduled self-test and run one now" },
  { key: "setvoltsel", label: "Set the input voltage selector to match local mains and check it before switching on" },
  { key: "outofbypass", label: "Take the unit out of maintenance bypass and confirm it transfers on a test" },
  { key: "sinewave", label: "Fit a UPS whose output waveform these supplies will accept on battery" },
  { key: "checkothers", label: "Check the other machines that arrived in the same move" },
  /* ---- the seven that must never appear ---- */
  { key: "openpsu", label: "Open the power supply and check its capacitors", forbidden: true,
    why: "Never. The capacitors inside a supply hold a lethal charge for a long time after it is unplugged, there is " +
      "nothing inside one you are meant to service, and the case is riveted shut for exactly that reason. A supply is " +
      "a sealed part: it is tested from outside and replaced whole." },
  { key: "cheater", label: "Fit a three-to-two adapter so it runs without the ground pin", forbidden: true,
    why: "The ground pin is the conductor that carries a fault to earth instead of through the person touching the " +
      "case. Defeating it does not solve a grounding problem, it removes the last thing standing between a fault and " +
      "the user — and it converts a documented hazard into one nobody can see." },
  { key: "biggerbreaker", label: "Fit a larger breaker so it stops tripping", forbidden: true,
    why: "A breaker protects the wire in the wall, not the equipment on the end of it. Fitting a bigger one leaves the " +
      "same wire carrying more current than it is rated for, with nothing left to stop it. This is how electrical " +
      "fires start, and it is the single most common dangerous 'fix' in this whole domain." },
  { key: "rewire", label: "Swap the hot and neutral back over in the outlet box yourself", forbidden: true,
    why: "Fixed building wiring is licensed work, and the fact that you can see what is wrong does not make it yours. " +
      "You would also be working in a box you have not proved is dead, on a circuit whose labelling has already been " +
      "shown to be wrong once." },
  { key: "chainstrip", label: "Plug a second power strip into the first to get more sockets", forbidden: true,
    why: "Chaining strips puts the whole downstream load through one strip's rating and one plug's contacts, and the " +
      "joint is where the heat goes. It is prohibited by every workplace electrical policy you will work under, and " +
      "the reason is the warm plug you were called out about." },
  { key: "binups", label: "Drop the old UPS battery in the office bin", forbidden: true,
    why: "A sealed lead-acid pack is hazardous waste. It goes out through the proper route, terminals taped, and not " +
      "into general waste where it can short against something metal." },
  { key: "silence", label: "Silence the overload alarm so the office stops complaining", forbidden: true,
    why: "The alarm is the unit telling you it is being asked to carry more than it can. Muting it does not reduce the " +
      "load by a single watt — it removes the only warning anybody gets before the thing drops the machines it was " +
      "bought to protect." }
];

const PROCEDURES = {
  surgedead: ["quote", "newstrip", "loadcalc", "test"],
  neutralshare: ["receptacle", "labeloutlet", "movecircuit", "reportfac", "electrician", "retest", "test"],
  genset: ["quote", "loadcalc", "moveprotected", "labelprotected", "reportfac", "test"],
  psuwrongform: ["quote", "unplugmains", "discharge", "esd", "orderform", "psuswap",
    "cableroute", "psutest", "test"],
  upsselftest: ["quote", "enabletest", "upscal", "test"],
  railsag: ["quote", "unplugmains", "discharge", "esd", "psuswap", "cableroute", "psutest", "test"],
  pgdelay: ["quote", "unplugmains", "discharge", "esd", "psuswap", "cableroute", "psutest", "test"],
  openground: ["receptacle", "labeloutlet", "movecircuit", "reportfac", "electrician", "retest", "test"],
  revpolarity: ["receptacle", "labeloutlet", "movecircuit", "reportfac", "electrician", "retest", "test"],
  upsbattery: ["quote", "upsload", "upsbatt", "hazups", "upsdate", "upscal", "test"],
  upsoverload: ["quote", "loadcalc", "movelaser", "upscal", "test"],
  brownout: ["quote", "loadcalc", "avrups", "reportfac", "test"],
  esdstatic: ["quote", "unplugmains", "discharge", "esd", "modswap", "test"],
  stripchain: ["quote", "stripout", "loadcalc", "reportfac", "test"],
  circuitload: ["quote", "loadcalc", "spreadload", "reportfac", "test"],
  /* A supply is a sealed part, so a stopped fan inside one is a supply
     replacement and never a fan replacement. The forbidden step on this
     ticket is the tempting one. */
  psufanseized: ["quote", "unplugmains", "discharge", "esd", "psuswap", "cableroute", "psutest", "test"],
  voltselector: ["quote", "unplugmains", "setvoltsel", "checkothers", "test"],
  upsbypass: ["quote", "outofbypass", "upscal", "test"],
  upswaveform: ["quote", "loadcalc", "sinewave", "upscal", "test"],
  bootlegground: ["receptacle", "labeloutlet", "movecircuit", "reportfac", "electrician", "retest", "test"]
};

export function powerProcedure(fault) { return PROCEDURES[fault.key].slice(); }

export function powerActionByKey(key) {
  return POWER_ACTIONS.filter(function (a) { return a.key === key; })[0];
}

export function powerProcedureWhy(fault, key) {
  var a = powerActionByKey(key);
  if (!a) return "";
  if (a.forbidden) return a.why;
  if (PROCEDURES[fault.key].indexOf(key) !== -1) return "";
  var specific = {
    psuswap: "The supply on this machine measures inside tolerance on every rail. Fitting another one is a part " +
      "the customer pays for to fix something that is not wrong.",
    electrician: "There is nothing in the building's wiring to fix here. The outlet tests correct.",
    labeloutlet: "The outlet is fine. Taking a working socket out of service on a floor that is short of them is a " +
      "second problem you have created.",
    upsbatt: "The pack passes its self-test and holds the load. It is a consumable, and this is not the day for it.",
    movelaser: "There is no printer on the battery side of anything on this ticket.",
    avrups: "The incoming supply sits inside its window all day. Regulating a voltage that is already correct " +
      "changes nothing and costs the customer a unit.",
    stripout: "Nothing is chained here. Every strip is fed straight from a wall outlet.",
    spreadload: "The circuit measures inside its continuous limit. There is nothing to spread.",
    modswap: "The module is not at fault on this ticket, and pulling a working card is a chance to damage one for nothing.",
    retest: "Nothing has been handed to anybody to sign off, so there is nothing to retest.",
    hazups: "No battery has come out on this ticket.",
    newstrip: "Every strip on this ticket is rated, lit and doing its job.",
    labelprotected: "There is no protected supply on this site to tell apart from anything.",
    moveprotected: "Nothing here is on the wrong supply — there is only one supply.",
    orderform: "The supply that is fitted is the right form factor for this chassis.",
    enabletest: "The unit's self-test is scheduled and passing, so there is nothing to enable.",
    setvoltsel: "The selector on this supply already matches local mains, and moving a switch that is right is a " +
      "way of turning a working machine into a repair.",
    outofbypass: "The unit is online rather than in bypass. There is no bypass to come out of.",
    sinewave: "The machines on this unit ride a transfer to battery without a flicker, so its output is one they " +
      "are happy with. Replacing a UPS that does its job is a unit the customer buys twice.",
    checkothers: "Nothing about this fault travels between machines. It is this one, and looking at the others is " +
      "time on the ticket that finds nothing."
  };
  return specific[key] ||
    "Honest work, and it belongs to a different job. Every extra step is time the customer is paying for.";
}

/* =====================================================================
   The site
   ===================================================================== */
export function buildPower(r, fault) {
  var f = fault.key;

  /* ---- the rails ---- */
  var rail = {};
  RAILS.forEach(function (rr) {
    var L = railLimits(rr);
    /* A healthy rail sits near nominal and moves a little under load. The
       figures are drawn inside tolerance and then the fault, if it is this
       one, pushes exactly one of them out — so the student is comparing
       against the published limit rather than spotting an odd-looking number. */
    var span = Math.abs(rr.nominal) * rr.tol;
    var idle = rr.nominal + (r.int(-60, 60) / 100) * span * 0.7;
    var load = idle - (rr.nominal < 0 ? -1 : 1) * (r.int(8, 34) / 100) * span;
    if (f === "railsag" && rr.key === "v12") {
      load = L.lo - r.int(30, 90) / 100;      // clearly under the floor
    }
    rail[rr.key] = {
      idle: Math.round(idle * 100) / 100,
      load: Math.round(load * 100) / 100
    };
  });

  /* ---- the outlet ---- */
  var hn = MAINS_NOMINAL + r.int(-40, 40) / 10;
  var outlet;
  if (f === "openground") {
    outlet = { hn: hn, hg: 0, ng: 0, lamps: "Open ground" };
  } else if (f === "revpolarity") {
    outlet = { hn: hn, hg: r.int(0, 8) / 10, ng: hn - r.int(0, 6) / 10, lamps: "Hot and neutral reversed" };
  } else {
    outlet = { hn: hn, hg: hn - r.int(2, 14) / 10, ng: r.int(2, 18) / 10, lamps: "Correct" };
  }

  /* ---- the UPS ---- */
  var va = r.pick([700, 900, 1000, 1500]);
  var watts = Math.round(va * 0.6 / 5) * 5;
  var ups = { va: va, watts: watts };
  if (f === "upsoverload") {
    ups.load = Math.round(watts * (1.12 + r.int(0, 30) / 100));
    ups.battMonths = r.int(6, 22);
    ups.selfTest = "Passed";
    ups.runtime = 2;
    ups.transfers = r.int(4, 14);
    ups.panel = "Overload — alarm sounding";
  } else if (f === "upsbattery") {
    ups.load = Math.round(watts * (0.34 + r.int(0, 18) / 100));
    ups.battMonths = r.int(44, 67);
    ups.selfTest = "Failed";
    ups.runtime = r.int(1, 4);
    ups.transfers = r.int(2, 9);
    ups.panel = "Replace battery";
  } else if (f === "upsselftest") {
    ups.load = Math.round(watts * (0.30 + r.int(0, 20) / 100));
    ups.battMonths = r.int(44, 58);
    ups.selfTest = "Never run — scheduled self-test disabled";
    ups.runtime = r.int(14, 30);
    ups.transfers = r.int(0, 3);
    ups.panel = "Online, normal";
  } else if (f === "brownout") {
    ups.load = Math.round(watts * (0.30 + r.int(0, 20) / 100));
    ups.battMonths = r.int(7, 26);
    ups.selfTest = "Passed";
    ups.runtime = r.int(19, 34);
    ups.transfers = r.int(46, 128);          // it keeps riding out the sags
    ups.panel = "Online, normal";
  } else if (f === "upsbypass") {
    /* Everything about this unit is healthy and none of it is in the
       circuit. The only reading that is wrong is the one people skip. */
    ups.load = Math.round(watts * (0.31 + r.int(0, 19) / 100));
    ups.battMonths = r.int(8, 24);
    ups.selfTest = "Passed";
    ups.runtime = r.int(21, 38);
    ups.transfers = 0;                       // in bypass it never transfers
    ups.panel = "Maintenance bypass — load not protected";
  } else if (f === "upswaveform") {
    /* Nothing here is failing. The unit is healthy, unloaded and wrong. */
    ups.load = Math.round(watts * (0.29 + r.int(0, 17) / 100));
    ups.battMonths = r.int(5, 19);
    ups.selfTest = "Passed";
    ups.runtime = r.int(22, 40);
    ups.transfers = r.int(2, 9);
    ups.panel = "Online, normal";
  } else {
    ups.load = Math.round(watts * (0.28 + r.int(0, 24) / 100));
    ups.battMonths = r.int(5, 27);
    ups.selfTest = "Passed";
    ups.runtime = r.int(18, 41);
    ups.transfers = r.int(0, 7);
    ups.panel = "Online, normal";
  }
  ups.pct = Math.round(ups.load / watts * 100);
  /* The output waveform is on the unit's own panel and almost nobody reads
     it, which is why the ticket that turns on it is worth having. */
  ups.wave = f === "upswaveform"
    ? "Simulated sine — stepped approximation"
    : "Sine wave";

  /* ---- the circuit ---- */
  var breaker = r.pick([15, 15, 20]);
  var base = [
    { name: "Four workstations and monitors", amps: r.int(19, 28) / 10 },
    { name: "Two multifunction printers on standby", amps: r.int(6, 11) / 10 },
    { name: "The comms cabinet on this wall", amps: r.int(8, 15) / 10 }
  ];
  var extra = f === "circuitload"
    ? [{ name: "The kitchen kettle, shared off this circuit", amps: r.int(110, 127) / 10 },
       { name: "A portable heater under the far desk", amps: r.int(48, 62) / 10 }]
    : [{ name: "A desk fan", amps: r.int(3, 6) / 10 }];
  var circuit = { breaker: breaker, items: base.concat(extra) };
  /* Guarantee the fault is real and the healthy case is comfortable, rather
     than hoping the dice landed the right way. */
  var sum = circuit.items.reduce(function (a, i) { return a + i.amps; }, 0);
  var lim = breaker * CONTINUOUS;
  if (f === "circuitload" && sum <= lim) circuit.items.push({ name: "A second heater by the window", amps: 5.4 });
  if (f !== "circuitload" && sum > lim * 0.85) {
    circuit.items = circuit.items.map(function (i) {
      return { name: i.name, amps: Math.round(i.amps * 0.5 * 10) / 10 };
    });
  }

  /* ---- the mains, hour by hour ---- */
  var sagHour = r.int(13, 16);
  var mains = [];
  for (var h = 8; h <= 18; h++) {
    var v = MAINS_NOMINAL + r.int(-30, 30) / 10;
    if (f === "brownout" && h === sagHour) v = r.int(940, 1060) / 10;
    mains.push({ hour: (h < 10 ? "0" : "") + h + ":00", volts: v });
  }

  return {
    rail: rail,
    pgMs: f === "pgdelay" ? null : r.int(140, 420),
    outlet: outlet,
    ups: ups,
    circuit: circuit,
    mains: mains,
    sagHour: (sagHour < 10 ? "0" : "") + sagHour + ":00",
    machine: r.pick(["Meridian T400 tower", "Corvid WS-12 workstation",
      "Halden 900 small-form-factor", "Meridian T600 tower"]),
    psuWatts: r.pick([400, 450, 500, 650]),
    /* Two things on the outside of a supply that a meter never sees: the
       input selector, and whether anything is coming out of the exhaust. */
    psuSelector: f === "voltselector" ? "230V" : r.pick(["115V", "115V", "Auto-ranging (no selector)"]),
    psuFan: f === "psufanseized" ? "Not turning" : "Turning freely",
    psuMinutesToStop: f === "psufanseized" ? r.int(24, 41) : null,
    peakDraw: 0
  };
}

/* =====================================================================
   The reference key
   ===================================================================== */
export const POWER_FACTS = [
  ["What the tolerances actually are",
    "Every ATX rail is specified at ±5% of nominal, except -12V which is allowed ±10%. That makes the 12V rail legal " +
      "between 11.40 and 12.60 volts and nothing else. A rail at 11.2 is not 'a bit low' — it is out of specification."],
  ["Power Good is a signal, not a rail",
    "After the rails come up, the supply asserts Power Good between 100 and 500 milliseconds later, and the board " +
      "holds itself in reset until it arrives. Too early and the board starts before the rails are stable; never, and " +
      "the machine looks exactly like a dead motherboard."],
  ["Why an outlet's ground only matters once",
    "A protective ground carries fault current to earth instead of through whoever is touching the case. Everything " +
      "plugged into an ungrounded outlet works perfectly right up until the day something goes wrong, which is the " +
      "day the ground was for."],
  ["The 80% rule",
    "A branch circuit is loaded to 80% of its breaker for anything drawing continuously for three hours or more. A " +
      "15A circuit is a 12A circuit in practice, and a 20A circuit is a 16A one. Nearly every 'random' trip is this " +
      "arithmetic not being done."],
  ["A breaker protects the wire",
    "Not the equipment, and not the building's contents — the wire in the wall. That is why fitting a larger one to " +
      "stop the tripping is the most dangerous thing in this domain: the wire is unchanged and its protection is gone."],
  ["Static damage does not look like damage",
    "A discharge you cannot feel is around 3,000 volts and a module can be damaged by a few hundred. It usually " +
      "does not kill outright — it leaves a part that works for a while and fails at random, which is why the fault " +
      "always seems to be something else."],
  ["When the strap comes off",
    "A wrist strap is bonded to the chassis and worn for anything on the board. It is never worn near anything that " +
      "stores high voltage — a power supply, a display's inverter, a laser printer's high-voltage section — and the " +
      "reason is that those are not opened at all."],
  ["What a receptacle tester can and cannot tell you",
    "Three lamps test for continuity between the ground pin and neutral, and a ground jumpered to neutral inside " +
      "the box satisfies that perfectly. A tester reading CORRECT proves the conductors are not swapped and the " +
      "ground pin is connected to something. It does not prove there is a protective conductor back to the panel."],
  ["A supply is a sealed part",
    "The fan inside one is not a serviceable item, however easy the four screws look. It is tested from outside — " +
      "rails, Power Good, exhaust, fan — and replaced whole. A supply that cuts out after a predictable warm-up is " +
      "its thermal protection working, which makes it the answer rather than a symptom."],
  ["Not every UPS output is a sine wave",
    "Cheaper units produce a stepped approximation, and the active power factor correction in a modern supply " +
      "cannot follow it — so the machines drop on transfer instead of riding through. The unit is not faulty and " +
      "it is not the right unit, and its panel will report normal throughout."],
  ["VA is not watts",
    "A UPS carries two numbers and the smaller one is the one that matters. Sizing off the VA figure is how a unit " +
      "ends up overloaded on a load that looked like it fitted."]
];
