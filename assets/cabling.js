/* =====================================================================
   Field Service Center — the cabling track

   This is the most hands-on thing in Core 1 and the part of the program
   that had no coverage at all. A technician terminates cable, and then
   reads a tester that tells them what they just did wrong.

   Everything on this track is COMPUTED. The pin map a tester shows is
   derived from the fault and the standard used at each end — it is never a
   table written down beside the answer. Change the fault and the readout
   changes with it, which is the only way an exercise like this stays
   honest when it regenerates.

   Three things it grades that nothing else in the build does:

   1. THE PINOUT ITSELF. T568A and T568B differ in exactly one thing: the
      orange and green pairs trade places, so pins 1 and 2 swap with 3 and
      6. Blue and brown never move. A student who knows that can derive
      either standard from the other and can spot a crossover on sight.

   2. WHAT A TESTER IS ACTUALLY SAYING. Open, short, reversed pair,
      transposed pairs and split pair are five different readings with five
      different causes and five different fixes, and only one of them is a
      re-crimp of the end you happen to be standing next to.

   3. THE SPLIT PAIR, which is the one that matters. It passes a continuity
      test perfectly — pin one to pin one, all the way across — and then
      fails at gigabit, because the wires were paired up wrongly inside the
      twist. A cheap tester says it is fine. It is not fine.
   ===================================================================== */

/* Pin 1 through 8. A and B differ only in that the orange and green pairs
   change places; blue and brown sit in the middle and at the end whatever
   you do. */
export const T568B = ["white/orange", "orange", "white/green", "blue",
  "white/blue", "green", "white/brown", "brown"];
export const T568A = ["white/green", "green", "white/orange", "blue",
  "white/blue", "orange", "white/brown", "brown"];

/* Which pins belong to which twisted pair. This grouping is the same under
   both standards — it is the COLOUR of each pair that moves, not the pins
   it occupies. Which is why the pair numbers can be shown on a tester
   readout without giving away the pinout, and why naming the colour of a
   pair is a real question rather than a lookup.

   It is also the fact the split-pair fault turns on: 3 and 6 are a pair
   even though 4 and 5 sit between them. */
export const PAIRS = [
  { name: "Pair 1", pins: [4, 5] },
  { name: "Pair 2", pins: [1, 2] },
  { name: "Pair 3", pins: [3, 6] },
  { name: "Pair 4", pins: [7, 8] }
];

/* The four colours, in the order the pairs are numbered. Same set in both
   standards; only which pins they land on changes. */
export const PAIR_COLOURS = ["the blue pair", "the orange pair", "the green pair", "the brown pair"];

/* Which colour pair a pin carries UNDER A GIVEN STANDARD. Derived from the
   wire order rather than tabulated, so it cannot disagree with it. */
export function pairColour(pin, standard) {
  var colour = wireOrder(standard)[pin - 1].replace("white/", "");
  return "the " + colour + " pair";
}

export function wireOrder(standard) {
  return (standard === "A" ? T568A : T568B).slice();
}

/* =====================================================================
   The link, part by part

   A structured link is six things in a row, and a student who cannot name
   them cannot say where a fault is. Patch cord, plug, outlet, the run in
   the wall, the panel, the port. Every one of them is a place a fault can
   live and five of them are places people never look.
   ===================================================================== */
export const CABLE_PARTS = [
  {
    key: "plugnear", label: "Plug at the desk end",
    role: "The modular plug you crimped onto the patch cord at the workstation end.",
    fails: "Conductors short of the contacts, copper bridging inside, or a pair put in the wrong slots.",
    seen: "Held up to the light, the conductors do not all reach the front of the plug."
  },
  {
    key: "plugfar", label: "Plug at the far end",
    role: "The modular plug on the other end of the same cord, at the panel or the switch.",
    fails: "The same three ways as any plug — and being the end you are not standing next to.",
    seen: "The colour order through this plug does not match the one at the other end."
  },
  {
    key: "keystone", label: "Keystone jack in the outlet",
    role: "The punched-down jack in the faceplate at the desk. The fixed run terminates here.",
    fails: "Punched to the wrong standard, or with the pairs untwisted too far back to sit in the slots.",
    seen: "The pairs are untwisted well over an inch behind the punch-down block."
  },
  {
    key: "horizontal", label: "The horizontal run",
    role: "The solid-core cable in the wall and ceiling between the outlet and the patch panel.",
    fails: "Length, crushing, or a route that took it the long way round the building.",
    seen: "The route goes right around the ceiling void rather than across it."
  },
  {
    key: "panelport", label: "Patch panel port",
    role: "Where the horizontal run lands in the comms room, punched down on the back of the panel.",
    fails: "Punched to the other standard from the outlet, or never patched through to anything.",
    seen: "Neatly punched down, and nothing is plugged into the front of it."
  },
  {
    key: "patchcord", label: "Patch cord in the comms room",
    role: "The short factory cord from the panel port across to a switch port.",
    fails: "Rated below the speed the link is supposed to run at, or simply not there.",
    seen: "The category printed along the jacket is lower than everything else on this link."
  },
  {
    key: "switchport", label: "Switch port",
    role: "The port at the end of the chain. It negotiates speed and duplex with whatever it finds.",
    fails: "Rarely. It is the first thing blamed and almost never the thing at fault.",
    seen: "Comes straight up with a known-good cord in it."
  }
];

/* =====================================================================
   The faults
   ===================================================================== */
export const CABLING_FAULTS = [
  {
    key: "open", part: "an open conductor", target: "plugnear",
    objective: "3.2 + 5.5", kind: "termination",
    root: "One conductor never reached the end of the plug before it was crimped. The contact bit into insulation instead of copper.",
    observable: "the link will not come up at all, and the tester lights every pin but one",
    symptoms: ["No light on the port at all", "It worked at the old desk",
      "I made this one up myself last week"],
    fixes: "Cut the plug off and re-terminate that end, pushing every conductor hard against the front of the plug before crimping.",
    wrongReflex: "switch port",
    wrongWhy: "A known-good cable in the same port comes straight up. The port is fine; what is plugged into it is not.",
    evidence: "A single pin open on the tester with the other seven mapping straight through",
    tool: "tester"
  },
  {
    key: "short", part: "a short between two conductors", target: "plugnear",
    objective: "3.2 + 5.5", kind: "termination",
    root: "Two conductors are touching inside the plug — the jacket was stripped back too far and bare copper is bridging.",
    observable: "no link, and the tester flags two pins as shorted together",
    symptoms: ["Nothing at all on this one", "The tester is beeping oddly",
      "I stripped it back a fair way to get it in"],
    fixes: "Cut it off and re-terminate, stripping only the jacket and keeping the conductors insulated right up to the contacts.",
    wrongReflex: "cable run",
    wrongWhy: "The fault is at one end and the tester says which. Replacing a whole run because of a plug you crimped is an expensive way to avoid re-crimping it.",
    evidence: "Two pins reported shorted together, which is copper touching copper and nothing else",
    tool: "tester"
  },
  {
    key: "revpair", part: "a reversed pair", target: "plugfar",
    objective: "3.2 + 5.5", kind: "termination",
    root: "The two conductors of one pair were swapped at one end — the solid and the striped wire of the same colour went into each other's slots.",
    observable: "the tester maps every pin through, but two of them come out crossed with each other",
    symptoms: ["The tester says it's wired but something's wrong",
      "It half works", "The colours looked right to me"],
    fixes: "Re-terminate the end where the pair is reversed, keeping solid and striped in their proper slots.",
    wrongReflex: "the other end",
    wrongWhy: "Only one end is wrong, and the tester tells you which by showing the crossing on that side. Re-doing the good end changes nothing and costs you a plug.",
    evidence: "Two pins of the same pair mapping to each other rather than straight through",
    tool: "tester"
  },
  {
    key: "crossed", part: "transposed pairs", target: "plugfar",
    objective: "3.2 + 5.5", kind: "termination",
    root: "One end was terminated to T568A and the other to T568B. The orange and green pairs have traded places, which makes this a crossover cable.",
    observable: "pins 1 and 2 come out at 3 and 6 and the other way round, and the link behaves inconsistently from one piece of equipment to the next",
    symptoms: ["It works on the old switch and not the new one",
      "Sometimes it comes up, sometimes it doesn't", "It looks fine at both ends"],
    fixes: "Re-terminate one end to match the other. Pick the standard the rest of the site uses and stay on it.",
    wrongReflex: "port speed",
    wrongWhy: "Speed settings do not move pairs around. A cable that works on one switch and not another has had its pairs swapped, and modern gear hides that by auto-correcting for it — which is why it looks intermittent rather than broken.",
    evidence: "Pins 1 and 2 arriving at 3 and 6, which is precisely the difference between the two standards",
    tool: "tester"
  },
  {
    key: "split", part: "a split pair", target: "plugnear",
    objective: "3.2 + 5.5", kind: "termination",
    root: "The conductors were paired up wrongly inside the twist. Pin for pin it is perfect; electrically the pairs are not pairs at all.",
    observable: "the tester passes it end to end with every pin correct, and the link still negotiates at 100 and throws errors under load",
    symptoms: ["The tester says it's fine", "It won't go above 100 megabit",
      "Errors climb whenever anyone actually uses it"],
    fixes: "Re-terminate both ends with the conductors in their correct twisted pairs. A continuity tester cannot see this; a certifier can.",
    wrongReflex: "tester",
    wrongWhy: "The tester is telling the truth about the only thing it can measure — continuity, pin by pin. It has no way to know which wires are twisted together, and that is exactly what is wrong here.",
    evidence: "A perfect pin-for-pin map with the crosstalk measurement failing, which is the one fault continuity cannot see",
    tool: "certifier"
  },
  {
    key: "untwist", part: "excess untwist at the termination", target: "keystone",
    objective: "3.2 + 5.5", kind: "termination",
    root: "The pairs were untwisted about an inch back to make them easier to punch down. The twist is what rejects noise, and it is gone right where it matters.",
    observable: "it passes a continuity test and comes up at gigabit, then fails certification on crosstalk and drops packets under sustained load",
    symptoms: ["It works but it's slow when everyone's on",
      "Passed the cheap tester", "The certifier flagged it"],
    fixes: "Re-punch the keystone keeping the untwist under half an inch — the standard's limit for this category — and re-certify.",
    wrongReflex: "run length",
    wrongWhy: "The run is well inside its limit and the certifier gives you the distance to prove it. Length was never the problem; what was done to the pairs at the end of it was.",
    evidence: "A pass on continuity and length with a near-end crosstalk failure at the termination",
    tool: "certifier"
  },
  {
    key: "longrun", part: "an over-length run", target: "horizontal",
    objective: "3.2 + 5.5", kind: "install",
    root: "The horizontal run is longer than the standard allows. Somebody took it the long way round the ceiling and it has ended up past the limit.",
    observable: "the link comes up and drops repeatedly, and the tester reports the run at more than a hundred metres",
    symptoms: ["It keeps dropping and coming back", "This desk has always been bad",
      "It's the furthest one from the comms room"],
    fixes: "Re-route the run to bring it inside the limit, or put a switch closer to it. There is no plug you can fit that fixes distance.",
    wrongReflex: "cable quality",
    wrongWhy: "Better cable does not make a run shorter, and the limit is not about quality — it is about how far the signal survives before the timing stops working.",
    evidence: "A measured length beyond the hundred-metre limit for this kind of run",
    tool: "tdr"
  },
  {
    key: "wrongcat", part: "the wrong category of cable", target: "patchcord",
    objective: "3.2 + 5.5", kind: "install",
    root: "A lower-category patch cord has been used on a link that is supposed to run above gigabit. Every other component is rated for it; this one is not.",
    observable: "the link negotiates at a gigabit on equipment that should be doing ten, and it does it only at this one desk",
    symptoms: ["This one is slower than the rest", "Everything else on the floor is fine",
      "It's the same switch as everybody"],
    fixes: "Replace the patch cord with one rated for the speed the link is supposed to run at.",
    wrongReflex: "switch port",
    wrongWhy: "The port negotiates correctly with a rated cord in it. A link only runs as fast as its slowest component, and this is the only component that has not been checked.",
    evidence: "A speed ceiling that follows the patch cord rather than the port, with everything else on the link rated higher",
    tool: "inspect"
  },
  {
    key: "punchmiss", part: "a mis-punched keystone", target: "keystone",
    objective: "3.2 + 5.5", kind: "termination",
    root: "The outlet was punched down to one standard and the patch panel to the other. The fixed run in the wall is now a crossover and nobody can see it.",
    observable: "one desk behaves differently from every other desk on the same panel, and both ends look correctly and neatly terminated",
    symptoms: ["Only this desk does it", "It was fine before the refit",
      "Both ends look perfect"],
    fixes: "Re-punch whichever end does not match the rest of the site. Pick one standard and label the panel with it.",
    wrongReflex: "patch cord",
    wrongWhy: "Swapping the patch cord at either end changes nothing, because the transposition is inside the wall between them. The colour code on the two keystones is what has to be compared.",
    evidence: "A transposition that stays put when both patch cords are swapped, which places it in the fixed run",
    tool: "inspect"
  },
  {
    key: "noconnect", part: "an unpatched panel port", target: "panelport",
    objective: "3.2 + 5.5", kind: "install",
    root: "The outlet is punched down correctly and the run is perfect. Nobody ever patched that panel port through to a switch port.",
    observable: "no link light at the desk and none at the panel either, on a run that tests perfectly end to end",
    symptoms: ["Completely dead", "Nothing has ever worked at this desk",
      "It's a new desk from the office move"],
    fixes: "Patch the panel port through to a free switch port, and label both ends while you are there.",
    wrongReflex: "the run",
    wrongWhy: "The run tests perfectly from outlet to panel — the copper is fine and does not need touching. What it does not have is anything at the far end of it.",
    evidence: "A clean end-to-end test from outlet to panel with no switch port assigned to it at all",
    tool: "toner"
  },
  {
    key: "poeport", part: "a run with no power over Ethernet on it", target: "panelport",
    objective: "3.2 + 5.5", kind: "install",
    root: "The access point is plugged into a panel port patched to a switch port that does not supply power. The data is fine and there is nothing to power the device.",
    observable: "the access point is dead at one location and works immediately when it is moved to another outlet",
    symptoms: ["The new access point never came on", "It works on the other socket",
      "The cable tests fine"],
    fixes: "Patch the run through to a switch port that supplies power, or fit an injector. The copper is perfect and does not need touching.",
    wrongReflex: "access point",
    wrongWhy: "It powers up and works the moment it is plugged into a different outlet, which is the whole diagnosis. A device that works elsewhere on the same lead is not a broken device.",
    evidence: "A run that tests clean end to end, patched to a switch port with no power budget assigned to it",
    tool: "toner"
  },
  {
    key: "emi", part: "a run laid alongside mains cable", target: "horizontal",
    objective: "3.2 + 5.5", kind: "install",
    root: "The run was pulled through the same tray as the building's mains for most of its length. It certifies within limits and throws errors whenever the plant on that circuit runs.",
    observable: "errors on the link that come and go with something else in the building rather than with anything anyone is doing",
    symptoms: ["It drops when the machines start up", "It's fine at lunchtime",
      "The cable tester says it's good"],
    fixes: "Re-route the run out of the mains tray, keeping the separation the standard asks for, or change it for shielded cable properly bonded at one end.",
    wrongReflex: "switch port",
    wrongWhy: "The port is clean on every other run it carries, and the errors keep time with the plant rather than with the port. A fault that follows something outside the network is coming in from outside the network.",
    evidence: "Error bursts that correlate with plant on the same circuit, on a run certified inside its limits",
    tool: "certifier"
  },
  {
    key: "bendradius", part: "a run pulled tight around a corner", target: "horizontal",
    objective: "3.2 + 5.5", kind: "install",
    root: "The run was pulled hard round a structural corner and the bend is far tighter than the cable allows. The geometry inside the jacket is deformed and the pair spacing with it.",
    observable: "the run fails certification on return loss while passing continuity and length perfectly",
    symptoms: ["It passes the cheap tester", "The certifier fails it and I don't know why",
      "It was a tight pull round that beam"],
    fixes: "Re-pull that section with a proper radius, or fit a junction so the corner is made with a bend the cable can take. Nothing at either end will fix a fault in the middle.",
    wrongReflex: "termination",
    wrongWhy: "Both terminations are correct and the certifier reports the fault at a distance well inside the run rather than at either end. Re-crimping something the instrument has already located somewhere else is a wasted plug.",
    evidence: "A return-loss failure located partway along the run, with both terminations correct",
    tool: "certifier"
  },
  {
    key: "labelswap", part: "two runs labelled as each other", target: "panelport",
    objective: "3.2 + 5.5", kind: "install",
    root: "Two outlets were labelled the wrong way round when the floor was terminated. Every cable is perfect and everything is patched to the wrong desk.",
    observable: "two desks have each other's network, and both runs test perfectly",
    symptoms: ["He's on my VLAN and I'm on his", "Both cables test fine",
      "The labels look right to me"],
    fixes: "Tone both runs to find out which outlet is really which, re-label them, and re-patch. Then check the rest of that batch, because labels are done in batches.",
    wrongReflex: "switch configuration",
    wrongWhy: "The switch is doing exactly what it was configured to do, on the ports it was configured to do it on. The mistake is in which physical run arrives at which of those ports, and no amount of configuration finds that — a tone probe does.",
    evidence: "Two runs each testing perfectly and each arriving at the other's labelled outlet",
    tool: "toner"
  },
  {
    key: "fibrescratch", part: "a dirty fibre connector on the uplink", target: "patchcord",
    objective: "3.2 + 5.5", kind: "termination",
    root: "The fibre uplink's connector end face is contaminated. It links, it passes small traffic, and the optical loss is well outside budget.",
    observable: "the uplink comes up and drops under load, with the optical receive level far below what the budget allows",
    symptoms: ["The link between the floors keeps going", "It comes back on its own",
      "It was fine until the patching was redone"],
    fixes: "Clean both end faces with the proper cleaner and inspect them with a scope before they go back in. Never look into a fibre to check it — inspect it with a scope.",
    wrongReflex: "transceiver",
    wrongWhy: "The transceiver reports its own health as good and the same one works on a clean patch. Optical loss outside budget on a link that was just re-patched is contamination, and contamination is free to fix.",
    evidence: "An optical receive level below the link budget on a connector that was handled during the last patching job",
    tool: "certifier"
  }
];

/* =====================================================================
   The tester

   The pin map is derived from the fault. `null` is an open, an array is a
   short, and anything else is the far-end pin that near-end pin reaches.
   ===================================================================== */
export function pinMap(G) {
  var f = G.fault.key, c = G.cable;
  var map = [1, 2, 3, 4, 5, 6, 7, 8];
  if (f === "open") { map[c.badPin - 1] = null; }
  else if (f === "short") { map[c.shortA - 1] = [c.shortA, c.shortB]; map[c.shortB - 1] = [c.shortA, c.shortB]; }
  else if (f === "revpair") {
    var p = c.revPins; var i = p[0] - 1, j = p[1] - 1;
    map[i] = p[1]; map[j] = p[0];
  } else if (f === "crossed" || f === "punchmiss") {
    map[0] = 3; map[1] = 6; map[2] = 1; map[5] = 2;
  } else if (f === "noconnect") { map = [null, null, null, null, null, null, null, null]; }
  return map;
}

/* What the tester shows. Deliberately NOT the conductor colours: a tester
   reports pin numbers, and printing the colour order beside them would put
   the answer to the termination exercise one step above the exercise. The
   pair number is safe to show because it is the same under both standards. */
export function testerRows(G) {
  var map = pinMap(G);
  return map.map(function (v, i) {
    var pin = i + 1;
    var reads = v === null ? "open" : Array.isArray(v) ? "short with " + v.filter(function (x) { return x !== pin; })[0]
      : String(v);
    return {
      pin: pin, pair: pairOf(pin).name, reads: reads,
      bad: v === null || Array.isArray(v) || v !== pin
    };
  });
}

/* What the certifier says. Continuity is only half the story, and on two of
   these faults it is the wrong half. */
export function certRows(G) {
  var f = G.fault.key, c = G.cable;
  var wiremapPass = ["split", "untwist", "longrun", "wrongcat"].indexOf(f) !== -1;
  return [
    { k: "Wiremap", v: wiremapPass ? "PASS — every pin straight through" : "FAIL — see the pin map", bad: !wiremapPass },
    { k: "Length", v: c.metres + "m of a 100m limit" + (f === "longrun" ? " — FAIL" : " — PASS"), bad: f === "longrun" },
    { k: "Near-end crosstalk", v: f === "split" ? "FAIL — " + c.nextDb + "dB, well under margin"
      : f === "untwist" ? "FAIL — " + c.nextDb + "dB at the termination" : "PASS", bad: f === "split" || f === "untwist" },
    { k: "Insertion loss", v: f === "longrun" ? "FAIL — beyond limit for the length" : "PASS", bad: f === "longrun" },
    { k: "Certified to", v: c.certTo, bad: f === "wrongcat" }
  ];
}

/* The tools, and what each one can and cannot see. Choosing the tool is
   half the skill; knowing what a passing result from it does NOT prove is
   the other half. */
export const TOOLS = [
  { key: "tester", label: "Continuity tester", mins: 3,
    sees: "Opens, shorts, reversed pairs and transposed pairs — anything about which pin reaches which.",
    blind: "It cannot see a split pair, because a split pair is correct pin for pin. It cannot measure length or noise." },
  { key: "certifier", label: "Cable certifier", mins: 12,
    sees: "Everything the continuity tester sees, plus crosstalk, insertion loss, length and the category the link actually qualifies for.",
    blind: "It costs twelve minutes and a certifier you may not have in the van." },
  { key: "tdr", label: "Time-domain reflectometer", mins: 8,
    sees: "How far along the run a fault is, and the total length. It gives you a distance in metres to walk to.",
    blind: "It tells you where, not what. A distance is not a diagnosis." },
  { key: "toner", label: "Tone generator and probe", mins: 10,
    sees: "Which port at the far end is the other end of this cable, on an unlabelled panel.",
    blind: "It says nothing at all about whether the cable is any good — only where it goes." },
  { key: "inspect", label: "Look at both terminations", mins: 5,
    sees: "The colour order through the plug, how far the jacket is stripped, how much untwist there is, and whether the two ends match each other.",
    blind: "Nothing electrical. It is free, it is first, and it settles more of these than any tool in the bag." },
  { key: "loopback", label: "Loopback plug at the far end", mins: 6,
    sees: "Whether the port and the interface can talk to themselves with the run taken out of the picture.",
    blind: "It tests the equipment, not the cable — which is the point, but only once the cable is cleared." }
];

export function toolsFor(G, shuffle) {
  var right = TOOLS.filter(function (t) { return t.key === G.fault.tool; });
  var wrong = shuffle(TOOLS.filter(function (t) { return t.key !== G.fault.tool; })).slice(0, 4);
  return shuffle(right.concat(wrong)).map(function (t) {
    var iso = t.key === G.fault.tool;
    return {
      key: t.key, label: t.label, mins: t.mins, isolating: iso,
      result: iso ? toolHit(G, t.key) : toolMiss(G, t.key)
    };
  });
}

function toolHit(G, key) {
  var f = G.fault.key, c = G.cable;
  return {
    tester: f === "open" ? "Pin " + c.badPin + " reads open. The other seven map straight through."
      : f === "short" ? "Pins " + c.shortA + " and " + c.shortB + " read shorted together."
      : f === "revpair" ? "Pins " + c.revPins[0] + " and " + c.revPins[1] + " come out crossed with each other — the two halves of one pair."
      : "Pins 1 and 2 arrive at 3 and 6, and 3 and 6 arrive at 1 and 2. The orange and green pairs have swapped.",
    certifier: f === "split"
      ? "Wiremap passes perfectly, pin for pin. Near-end crosstalk fails at " + c.nextDb + "dB. The pins are right and the pairs are not."
      : "Wiremap and length pass. Near-end crosstalk fails right at the termination, which is where the twist was taken out.",
    tdr: "The run measures " + c.metres + " metres, which is past the hundred-metre limit for a horizontal run.",
    toner: "The tone comes up on the outlet and on the panel port, and nowhere on the switch. That panel port has never been patched through.",
    inspect: f === "wrongcat"
      ? "The patch cord is printed " + c.cordCat + " while every other component on the link is rated higher."
      : "The outlet is punched to one standard and the panel to the other. Both are neat; they simply do not match."
  }[key];
}

function toolMiss(G, key) {
  var f = G.fault.key, c = G.cable;
  var contPass = ["split", "untwist", "longrun", "wrongcat", "punchmiss"].indexOf(f) !== -1;
  return {
    tester: contPass
      ? "Every pin maps straight through, one to one. As far as continuity goes this cable is perfect."
      : "It confirms there is a wiring fault, which you already knew from the link state.",
    certifier: "It passes every parameter — wiremap, length, crosstalk and loss. Twelve minutes to confirm the cable is fine.",
    tdr: "The run measures " + c.metres + " metres, comfortably inside the limit, with no reflection along it.",
    toner: "The tone traces cleanly from the outlet to the panel port and on to the switch port. The path is exactly where it should be.",
    inspect: "Both ends are terminated neatly to the same standard, with the jacket stripped back the right amount and minimal untwist.",
    loopback: "The port loops back cleanly at full speed, which clears the switch and the interface and says nothing about the cable."
  }[key];
}

/* =====================================================================
   The cable
   ===================================================================== */
export function buildCable(r, fault) {
  var site = r.pick(["a new desk on the second floor", "the far corner of the warehouse",
    "a hot desk by the window", "the workshop bench", "reception"]);
  var c = {
    site: site,
    /* Whichever standard this site uses. The point of the crossed and
       mis-punched tickets is that the two ends disagree, so the near end is
       recorded and the far end is derived. */
    nearStd: r.pick(["A", "B"]),
    metres: fault.key === "longrun" ? r.int(104, 131) : r.int(28, 84),
    cordCat: fault.key === "wrongcat" ? "Cat 5e" : r.pick(["Cat 6", "Cat 6a"]),
    certTo: fault.key === "wrongcat" ? "1 Gbps only" : r.pick(["1 Gbps", "10 Gbps"]),
    nextDb: r.int(2, 9),
    panel: "Panel " + r.int(1, 3) + ", port " + r.int(2, 46),
    outlet: "Outlet " + r.pick(["A", "B", "C"]) + "-" + r.int(2, 40)
  };
  c.farStd = (fault.key === "crossed" || fault.key === "punchmiss")
    ? (c.nearStd === "A" ? "B" : "A") : c.nearStd;
  /* Which pin, and which pair, on the faults that name one. Drawn per
     ticket so the reading is never the same twice. */
  c.badPin = r.pick([1, 2, 3, 6, 7, 8]);
  var sp = r.pick([[1, 2], [3, 6], [7, 8]]);
  c.shortA = sp[0]; c.shortB = sp[1];
  c.revPins = r.pick([[1, 2], [3, 6], [4, 5], [7, 8]]);
  return c;
}

/* =====================================================================
   The termination itself

   Step four on this track is not "order a part" — there is nothing to
   order. It is "put eight conductors in the right eight slots", which is
   the actual work, and it is graded the way the crimp is graded: right or
   re-do it.

   The standard asked for is the one the rest of the site uses, which the
   ticket already records. On the two transposition faults that is the
   whole point of the fix — you do not pick a standard, you match one.
   ===================================================================== */
export function siteStandard(G) { return G.cable.nearStd; }

export function correctOrder(G) { return wireOrder(siteStandard(G)); }

/* The eight conductors, shuffled, for the student to place. */
export function conductorPool(shuffle) {
  return shuffle(["white/orange", "orange", "white/green", "blue",
    "white/blue", "green", "white/brown", "brown"]);
}

export const PINOUT_FACTS = [
  ["What the two standards actually are",
    "T568A and T568B are the same eight conductors in two different orders, and they differ in exactly one way: " +
      "the orange pair and the green pair change places. Blue stays on 4 and 5 and brown stays on 7 and 8 in both." ],
  ["Why the blue pair sits in the middle",
    "Pins 4 and 5 were left where an ordinary telephone plug expects them, so a phone could share the same " +
      "outlet. That is also why pins 3 and 6 are a pair with two other pins sitting between them." ],
  ["Straight-through against crossover",
    "Same standard both ends is a straight-through cable. Different standards at each end is a crossover. " +
      "Modern equipment corrects for a crossover automatically, which is why one turns up as intermittent " +
      "behaviour rather than a dead link." ],
  ["Striped first, with one exception",
    "In the orange, green and brown pairs the striped conductor takes the lower-numbered pin and the solid one " +
      "takes the higher. The blue pair is the other way round: solid blue on pin 4, white/blue on pin 5. It is " +
      "the single most common slip in a hand-made lead."],
  ["Why the twist matters",
    "Each pair is twisted so noise arrives on both conductors equally and cancels. Untwist it at the " +
      "termination and you have removed the only thing rejecting that noise, right where the signal is weakest." ],
  ["What a continuity tester cannot tell you",
    "It checks which pin reaches which pin. It has no idea which conductors are twisted together, so a cable " +
      "with the pairs made up wrongly passes it perfectly and then fails under load." ],
  ["The hundred-metre limit",
    "Ninety metres of solid-core run plus ten metres of patch cords at both ends. It is a timing limit, not " +
      "a signal-strength one, and no grade of cable moves it."]
];

/* Which pair a pin belongs to — the lookup the split-pair ticket turns on. */
export function pairOf(pin) {
  return PAIRS.filter(function (p) { return p.pins.indexOf(pin) !== -1; })[0];
}
