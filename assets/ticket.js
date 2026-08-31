/* =====================================================================
   Field Service Center — ticket generator

   One seeded object per ticket is the single source of truth. Every step
   of the methodology renders a different view onto it, and every graded
   answer is COMPUTED from the object rather than written beside the rows.
   Same contract as the CySA and Security+ builds, for the same reason:
   hand-matched answers drift the moment anything regenerates.

   What is different here is the caller. A+ is a customer-facing job, and
   the person who raises the ticket is not a reliable narrator — they
   report a conclusion instead of a symptom, or leave out the change that
   caused it, or misremember when it started. Separating what the user
   OBSERVED from what they CONCLUDED is step one of the methodology and
   the single most useful habit this page can build.
   ===================================================================== */

import { NETWORK_FAULTS, buildTopology, brokenConfig, correctConfig, correctAction }
  from "./network.js";
import { MOBILE_FAULTS, buildDevice, repairCost, correctOutcome, backupFirst }
  from "./mobile.js";
import { CLOUD_FAULTS, buildHost, correctAllocation, correctCloudAction }
  from "./cloud.js";
import { MIXED_FAULTS, domainVerdicts, scopeSummary, correctMixedAction }
  from "./mixed.js";
import { LASER_FAULTS, INKJET_FAULTS, buildPrinter, correctProcedure, touchedParts,
  printerTarget, repeatMatch } from "./printer.js";
import { LAPTOP_FAULTS, buildLaptop, laptopProcedure, laptopQuote } from "./laptop.js";
import { DISPLAY_FAULTS, buildScreen } from "./display.js";
import { CABLING_FAULTS, buildCable, siteStandard, correctOrder } from "./cabling.js";
import { POWER_FAULTS, buildPower, powerProcedure, scopeCall } from "./power.js";
import { RAID_FAULTS, buildArray, raidTarget, classOf, correctRaidAction } from "./raid.js";
import { PRINTNET_FAULTS, buildPrintSite, linkOf, correctPrintnetAction } from "./printnet.js";

export function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function R(rng) {
  return {
    int: (lo, hi) => lo + Math.floor(rng() * (hi - lo + 1)),
    pick: (a) => a[Math.floor(rng() * a.length)],
    shuffle: (a) => { var x = a.slice(); for (var i = x.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = x[i]; x[i] = x[j]; x[j] = t; } return x; },
    some: (a, n) => { var x = a.slice(), o = []; for (var i = 0; i < n && x.length; i++) o.push(x.splice(Math.floor(rng() * x.length), 1)[0]); return o; },
    chance: (p) => rng() < p
  };
}

/* ---------------- the methodology (objective 5.1) ---------------- */
export const STEPS = [
  { key: "identify", n: 1, name: "Identify the problem",
    hint: "Question the user, identify symptoms, determine if anything changed, and back up before making changes." },
  { key: "theory", n: 2, name: "Establish a theory of probable cause",
    hint: "Question the obvious first. Research symptoms internally and externally." },
  { key: "test", n: 3, name: "Test the theory to determine the cause",
    hint: "Once confirmed, decide the next steps. If it is not confirmed, form a new theory or escalate." },
  { key: "plan", n: 4, name: "Establish a plan of action and implement the solution",
    hint: "Refer to vendor documentation and consider the impact on the customer before you act." },
  { key: "verify", n: 5, name: "Verify full system functionality and implement preventive measures",
    hint: "Not 'it booted'. Everything the machine did before must still work." },
  { key: "document", n: 6, name: "Document findings, actions and outcomes",
    hint: "The next tech is you, six months from now, with no memory of this." }
];

/* ---------------- business context ---------------- */
/* Tier decides what you are allowed to spend, and urgency decides whether
   spending it is justified. Both are needed: a corporate budget does not
   make an expensive part correct, and a tight budget does not make a
   production outage wait. */
export const TIERS = {
  startup: {
    label: "Startup", staff: "11 staff", budget: 260,
    note: "Founder signs off every purchase personally. No spare stock, no service contract.",
    shipDefault: "standard", overnightOk: false
  },
  smallbiz: {
    label: "Small business", staff: "60 staff", budget: 700,
    note: "One-person IT department. A small shelf of spares, next-business-day contract on servers only.",
    shipDefault: "standard", overnightOk: true
  },
  corporate: {
    label: "Corporate", staff: "2,400 staff", budget: 2600,
    note: "Asset register, standard build, 4-hour contract on production hardware. Purchasing wants a part number.",
    shipDefault: "next-day", overnightOk: true
  }
};

export const URGENCY = {
  down: { key: "down", label: "Production down", weight: 3,
    note: "The work has stopped. Every hour is money." },
  degraded: { key: "degraded", label: "Degraded but working", weight: 2,
    note: "They can work around it. It is costing time, not stopping it." },
  annoyance: { key: "annoyance", label: "Annoyance", weight: 1,
    note: "It is irritating. Nobody is blocked." }
};

const ORGS = [
  { name: "Calder Dental", site: "single office", tier: "startup" },
  { name: "Rowan Design Studio", site: "open-plan loft", tier: "startup" },
  { name: "Pinehurst Veterinary", site: "clinic and back office", tier: "smallbiz" },
  { name: "Marek Machining", site: "shop floor and front office", tier: "smallbiz" },
  { name: "Delacroix Logistics", site: "warehouse and dispatch", tier: "smallbiz" },
  { name: "Ashgrove Regional Hospital", site: "four floors, two wings", tier: "corporate" },
  { name: "Vantage Financial", site: "twelve floors downtown", tier: "corporate" },
  { name: "Northport University", site: "campus, nine buildings", tier: "corporate" }
];

const FIRST = ["Dana", "Marcus", "Priya", "Aiden", "Rosa", "Tomas", "Nadia", "Chen", "Kofi",
  "Lena", "Ravi", "Maya", "Erik", "Sofia", "Jamal", "Iris", "Otto", "Talia", "Bea", "Curtis"];
const LAST = ["Whitfield", "Obi", "Nakamura", "Reyes", "Kaur", "Lindqvist", "Amari", "Bauer",
  "Castellanos", "Duarte", "Fontaine", "Greer", "Halloran", "Ivanov", "Mbeki", "Sorensen"];
const ROLES = [
  { title: "Accounts clerk", dept: "Finance", savvy: "low" },
  { title: "Receptionist", dept: "Front office", savvy: "low" },
  { title: "Warehouse supervisor", dept: "Operations", savvy: "low" },
  { title: "Graphic designer", dept: "Creative", savvy: "medium" },
  { title: "Practice nurse", dept: "Clinical", savvy: "low" },
  { title: "CAD technician", dept: "Engineering", savvy: "medium" },
  { title: "Office manager", dept: "Administration", savvy: "medium" },
  { title: "Junior developer", dept: "Software", savvy: "high" },
  { title: "Lab assistant", dept: "Research", savvy: "medium" },
  { title: "Shift lead", dept: "Dispatch", savvy: "low" }
];

/* ---------------- how the caller gets it wrong ----------------
   Four realistic distortions. Each one keeps a true observation buried
   inside a false frame, so there is always something salvageable in what
   the caller said — which is the point. You do not dismiss the user, you
   separate the parts. */
export const DISTORTIONS = {
  diagnosis: {
    key: "diagnosis", label: "Reported a diagnosis, not a symptom",
    lesson: "The caller handed you a conclusion. Conclusions are not evidence — take the observation underneath it and drop the rest."
  },
  omission: {
    key: "omission", label: "Left out the change",
    lesson: "'Nothing changed' almost always means 'nothing I think of as a change'. The methodology asks what changed for exactly this reason."
  },
  timing: {
    key: "timing", label: "Misremembered when it started",
    lesson: "People compress time when something is annoying. The logs know when it started; the caller knows how it feels."
  },
  secondhand: {
    key: "secondhand", label: "Reporting someone else's problem",
    lesson: "The person on the phone did not see it. Every detail is one retelling away from the machine — go to the person who was sitting there."
  }
};

/* ---------------- hardware faults ----------------
   Each fault carries: the true root cause, what the machine actually does,
   which instruments show it, the part that fixes it, and the plausible
   wrong parts a student might buy instead. The wrong parts matter as much
   as the right one — "replace the whole board" is the expensive reflex
   this page exists to break. */
const HARDWARE_FAULTS = [
  {
    key: "ram", part: "memory module", objective: "3.3 + 5.1",
    root: "One DIMM has failed. The machine posts, then throws memory errors under load.",
    symptoms: ["Blue screens at random, different stop codes each time",
      "Sometimes fails to POST, sometimes posts fine after a reseat",
      "Applications close on their own with no error"],
    observable: "random blue screens with different stop codes",
    post: { beeps: "3 short", meaning: "memory failure", code: "" },
    thermalNormal: true, smartClean: true,
    eventKeys: ["WHEA memory", "unexpected shutdown"],
    fixes: "Replace the failed module with one matching the surviving stick's type, speed and capacity.",
    partSpec: "ram",
    wrongReflex: "motherboard",
    wrongWhy: "The board posts, enumerates every other device, and passes with the other stick alone. Nothing points at the board."
  },
  {
    key: "psu", part: "power supply", objective: "3.6 + 5.1",
    root: "The power supply cannot hold rail voltage under load. It was undersized for the graphics card added last year.",
    symptoms: ["Shuts off completely under load, no blue screen, no warning",
      "Fans spin for a second on power-on, then stop",
      "Fine all day for light work, dies within minutes of anything heavy"],
    observable: "hard power-off under load with no blue screen",
    post: { beeps: "none", meaning: "no POST on the failed attempts", code: "" },
    thermalNormal: true, smartClean: true,
    eventKeys: ["Kernel-Power 41"],
    fixes: "Replace the power supply with one rated above the measured peak draw, with the right connectors for the card.",
    partSpec: "psu",
    wrongReflex: "gpu",
    wrongWhy: "The card is fine — it works in another machine and the failure follows the load, not the card."
  },
  {
    key: "drive", part: "storage drive", objective: "3.4 + 5.1",
    root: "The boot drive is failing. Reallocated sectors are climbing and the pending count is non-zero.",
    symptoms: ["Boots slower every week, now several minutes",
      "Freezes for thirty seconds at a time, then carries on",
      "One folder throws read errors, the rest of the disk is fine"],
    observable: "long freezes and a boot time that keeps growing",
    post: { beeps: "none", meaning: "posts normally", code: "" },
    thermalNormal: true, smartClean: false,
    eventKeys: ["disk controller error", "bad block"],
    fixes: "Image the drive to a replacement of equal or greater capacity, then replace it. Back up before anything else.",
    partSpec: "drive",
    wrongReflex: "ram",
    wrongWhy: "Memory tests pass clean and the freezes line up with disk I/O in the logs, not with memory pressure."
  },
  {
    key: "thermal", part: "cooling", objective: "3.5 + 5.1",
    root: "The CPU cooler fan has seized and the heatsink is packed with dust. The machine throttles, then shuts down.",
    symptoms: ["Gets slower the longer it is on, fine again after a night off",
      "Shuts down during anything heavy",
      "Much louder than it used to be, then suddenly quiet"],
    observable: "performance falls off the longer it runs, and it shuts down under load",
    post: { beeps: "none", meaning: "posts normally", code: "" },
    thermalNormal: false, smartClean: true,
    eventKeys: ["thermal event", "unexpected shutdown"],
    fixes: "Replace the failed fan, clear the heatsink, and reapply thermal paste. Check the case intake path while you are in there.",
    partSpec: "fan",
    wrongReflex: "cpu",
    wrongWhy: "The processor is not damaged — it throttles exactly as designed and recovers completely once it cools."
  },
  {
    key: "video", part: "graphics output", objective: "3.5 + 5.1",
    root: "The graphics card has failed. Integrated graphics drive the same monitor and cable without a problem.",
    symptoms: ["No picture at all, but the machine is clearly running",
      "Artifacts and coloured blocks across the screen before it went dark",
      "The monitor says no signal on every input"],
    observable: "no video output, though the machine is running",
    post: { beeps: "1 long, 2 short", meaning: "video adapter failure", code: "" },
    thermalNormal: true, smartClean: true,
    eventKeys: ["display driver recovered"],
    fixes: "Replace the graphics card with one the power supply can feed and the case can physically fit.",
    partSpec: "gpu",
    wrongReflex: "monitor",
    wrongWhy: "The same monitor and cable work perfectly on the integrated output. The display is not the failing part."
  },
  {
    key: "cable", part: "SATA data cable", objective: "3.4 + 5.1",
    root: "A SATA data cable has worked loose. The drive is healthy and drops off the bus intermittently.",
    symptoms: ["Sometimes says no boot device, sometimes boots normally",
      "Started after the machine was moved to another desk",
      "The drive shows up in BIOS about half the time"],
    observable: "the boot device disappears and reappears between restarts",
    post: { beeps: "none", meaning: "posts, then no boot device", code: "" },
    thermalNormal: true, smartClean: true,
    eventKeys: ["disk not ready"],
    fixes: "Reseat or replace the data cable and secure the run. Confirm the drive is healthy before condemning it.",
    partSpec: "cable",
    wrongReflex: "drive",
    wrongWhy: "SMART is clean on every attribute and the drive passes a full surface scan. The disk is not the problem — its connection is."
  },
  {
    key: "cmos", part: "CMOS battery", objective: "3.5 + 5.1",
    root: "The CMOS battery is flat. Settings and clock reset every time the machine is unplugged.",
    symptoms: ["Clock is wrong every morning, always by the same amount",
      "Complains about boot order or date on every cold start",
      "Fine once it is running, wrong again the next day"],
    observable: "the clock and BIOS settings reset on every cold start",
    post: { beeps: "none", meaning: "posts with a configuration warning", code: "" },
    thermalNormal: true, smartClean: true,
    eventKeys: ["time service", "config reset"],
    fixes: "Replace the coin cell, then set the clock and reapply the BIOS settings.",
    partSpec: "cmos",
    wrongReflex: "motherboard",
    wrongWhy: "Everything else on the board works. A dead coin cell is a two-dollar part, not a board swap."
  },
  {
    key: "psufan", part: "power supply cooling", objective: "3.6 + 5.1",
    root: "The fan inside the power supply has stopped. The supply heats up, protects itself, and shuts down — then works again once it is cold.",
    symptoms: ["It runs for about twenty minutes and dies",
      "Leave it an hour and it starts again like nothing happened",
      "It used to hum and now it is silent"],
    observable: "it shuts down completely after twenty minutes or so and starts again once it has cooled",
    post: { beeps: "none", meaning: "posts normally until it gets hot", code: "" },
    thermalNormal: true, smartClean: true,
    eventKeys: ["Kernel-Power 41"],
    fixes: "Replace the whole supply. A power supply is a sealed part with a lethal charge inside it and no serviceable fan — it is tested from outside and replaced whole.",
    partSpec: "psu",
    wrongReflex: "cooling",
    wrongWhy: "The processor and case temperatures are normal right up to the moment it stops, which is not what a cooling fault looks like. The heat is inside the supply, where none of the machine's sensors can see it."
  },
  {
    key: "gpufan", part: "graphics card cooling", objective: "3.5 + 5.1",
    root: "Both fans on the graphics card have seized. It throttles hard within a minute of any 3D load and throws artifacts before it does.",
    symptoms: ["It is fine for everything except the CAD work",
      "The drawing goes blocky and then it slows to nothing",
      "It sounds different since we moved it downstairs"],
    observable: "the picture breaks up and the machine slows to a crawl within a minute of any heavy graphics work",
    post: { beeps: "none", meaning: "posts normally", code: "" },
    thermalNormal: true, smartClean: true,
    eventKeys: ["display driver recovered"],
    fixes: "Replace the graphics card with a like-for-like part the supply can feed and the case can fit. Check the intake path while you are in there — this is what killed the last one.",
    partSpec: "gpu",
    wrongReflex: "driver",
    wrongWhy: "A driver fault does not clear when the card cools down and come back when it warms up. The symptom follows temperature, and temperature is a mechanical problem."
  },
  {
    key: "nvmethermal", part: "M.2 heatsink", objective: "3.4 + 5.1",
    root: "The NVMe drive has no heatsink and throttles under sustained writes. It is a healthy drive being asked to work in still air under a graphics card.",
    symptoms: ["Copying big files starts fast and then crawls",
      "Small files are fine, it is the big ones",
      "It has done it since the day it was built"],
    observable: "large file copies start at full speed and collapse to a fraction of it after about thirty seconds",
    post: { beeps: "none", meaning: "posts normally", code: "" },
    thermalNormal: true, smartClean: true,
    eventKeys: ["disk latency"],
    fixes: "Fit an M.2 heatsink to the drive and check there is airflow over it. The drive is healthy and does not need replacing.",
    partSpec: "cable", needKind: "m2-heatsink",
    wrongReflex: "drive",
    wrongWhy: "SMART is clean on every attribute and the drive runs at full speed for the first thirty seconds of every transfer. A drive that is failing is slow from the start; a drive that is hot is fast and then slow."
  },
  {
    key: "m2loose", part: "M.2 mounting screw", objective: "3.4 + 5.1",
    root: "The M.2 drive was never screwed down. It sits at an angle in its socket and loses contact whenever the machine is moved.",
    symptoms: ["It says no boot device after anyone knocks the desk",
      "Push it and it comes back", "It has been like it since the office move"],
    observable: "the boot device disappears whenever the machine is knocked or moved, and comes back on its own",
    post: { beeps: "none", meaning: "posts, then no boot device on the failing attempts", code: "" },
    thermalNormal: true, smartClean: true,
    eventKeys: ["disk not ready"],
    fixes: "Seat the drive properly and fit the mounting screw. It is a three-cent part and a two-minute job.",
    partSpec: "cable", needKind: "m2-screw",
    wrongReflex: "drive",
    wrongWhy: "SMART is clean and the drive passes a full surface scan. A drive that comes back when you press on it is not a drive that is dying — it is a drive that is not held down."
  },
  {
    key: "frontpanel", part: "front panel power switch", objective: "3.5 + 5.1",
    root: "The front-panel power switch has worn out. The machine starts perfectly when the header pins are shorted with a screwdriver and not at all from the button.",
    symptoms: ["You have to press it about ten times",
      "It goes on eventually if you hold it just right",
      "It is the oldest machine in the office"],
    observable: "the button does nothing most of the time, and the machine is otherwise perfectly healthy once it is running",
    post: { beeps: "none", meaning: "posts normally on the attempts that start", code: "" },
    thermalNormal: true, smartClean: true,
    eventKeys: [],
    fixes: "Replace the front-panel switch and lead. Confirm the machine starts ten times from the button before you close it up.",
    partSpec: "cable", needKind: "fp-switch",
    wrongReflex: "power supply",
    wrongWhy: "Every rail is inside tolerance and the machine runs perfectly for days once it is started. A supply that could not start a machine could not run one either."
  },
  {
    key: "ramslot", part: "a failed memory slot", objective: "3.3 + 5.1",
    root: "One memory slot has failed. Either module works perfectly in the other slot and neither works in this one.",
    symptoms: ["It only sees half the memory", "I swapped the sticks and it made no difference",
      "It was fine before it was upgraded"],
    observable: "the machine reports half the memory that is fitted, whichever module is in which slot",
    post: { beeps: "none", meaning: "posts, reporting half the fitted memory", code: "" },
    thermalNormal: true, smartClean: true,
    eventKeys: ["config reset"],
    fixes: "Run both modules in the working slots. The board is the only real repair and on a machine this age that is a replacement decision, not a repair.",
    partSpec: "ram",
    wrongReflex: "memory module",
    wrongWhy: "Both modules pass a full test individually in the same working slot. Two modules that are both good and a slot that kills either of them is a board fault, and buying memory will not change it."
  },
  {
    key: "cpupaste", part: "thermal paste", objective: "3.5 + 5.1",
    root: "The thermal paste has dried out and cracked. The fan is fine, the heatsink is clean, and the heat is not getting from the processor into either of them.",
    symptoms: ["It throttles under load and the fans are fine",
      "It's spotless inside", "It's the original machine from six years ago"],
    observable: "the processor reaches its limit under load with the cooler running correctly and the heatsink barely warm",
    post: { beeps: "none", meaning: "posts normally", code: "" },
    thermalNormal: false, smartClean: true,
    eventKeys: ["thermal event"],
    fixes: "Clean both surfaces properly and reapply thermal paste. The cooler itself is fine and does not need replacing.",
    partSpec: "fan",
    wrongReflex: "cooler",
    wrongWhy: "The fan spins at the right speed and the fins are clear, and a heatsink that stays cool while the processor cooks is not a heatsink that has failed — it is one that is not being given the heat."
  },
  {
    /* The one fault on this track where the board itself is the order.
       It is here because identifying a vented capacitor is a skill you use
       with your eyes and nothing else — no meter reads it, no log names it,
       and a technician who has never been told what a healthy one looks
       like will keep replacing supplies and memory on a machine whose
       regulation has already failed. */
    key: "bulgecap", part: "a motherboard with failed capacitors", objective: "3.5 + 5.1",
    root: "The electrolytic capacitors on the processor's voltage regulator have failed. Five of the bank are domed instead of flat-topped and one has split at its vent and dried. The board can no longer hold the processor's supply steady under load.",
    symptoms: ["It restarts by itself, mostly when it's busy",
      "It's been getting worse for a couple of months", "It smells faintly of fish when it's been on a while"],
    observable: "capacitors beside the processor socket that are domed rather than flat, with dried electrolyte on one of them, on a machine that resets under load",
    post: { beeps: "none", meaning: "posts, and sometimes does not finish", code: "" },
    thermalNormal: true, smartClean: true,
    eventKeys: ["WHEA processor", "unexpected shutdown"],
    fixes: "Order a replacement motherboard matched to the processor, the memory and the case, and move the working components across to it. The capacitors are not separately serviceable in the field.",
    partSpec: "mobo",
    wrongReflex: "power supply",
    wrongWhy: "The supply's rails measure inside tolerance at the connector under the same load that resets the machine. What has failed is the regulation the board does after the supply, and you can see it — the capacitors doing that job are swollen."
  },
  {
    key: "dimmspeed", part: "a mismatched memory module", objective: "3.3 + 5.1",
    root: "A second module was added at a lower speed than the one already fitted. The pair runs down to the slower one and the machine is unstable at the timings the board negotiated.",
    symptoms: ["It's been odd since we added the extra memory",
      "It shows the right total", "It locks up under anything heavy"],
    observable: "instability under load on a machine that reports the correct total memory, dating from the upgrade",
    post: { beeps: "none", meaning: "posts and reports the correct total", code: "" },
    thermalNormal: true, smartClean: true,
    eventKeys: ["WHEA memory", "unexpected shutdown"],
    fixes: "Replace the added module with one matching the original's type, speed and capacity, so the pair runs at the speed both were rated for.",
    partSpec: "ram",
    wrongReflex: "motherboard",
    wrongWhy: "The board posts, reports the correct total and runs perfectly on the original module alone. It is doing exactly what it should with two modules it was given that do not match."
  },
  {
    key: "gpuseat", part: "a graphics card that has worked loose", objective: "3.5 + 5.1",
    root: "The card has lifted at the rear of its slot after the machine was moved. It is enumerated intermittently and the picture drops when the case is knocked.",
    symptoms: ["It flickers if you nudge the desk", "It started after we moved offices",
      "Sometimes there's no picture at all until you restart"],
    observable: "the picture drops when the case is knocked and comes back on its own or after a restart",
    post: { beeps: "none", meaning: "posts, and reports the card intermittently", code: "" },
    thermalNormal: true, smartClean: true,
    eventKeys: ["display driver recovered"],
    fixes: "Reseat the card, fit its retaining screw, and support the far end if the chassis has a bracket for it. There is nothing to order.",
    partSpec: "gpu",
    wrongReflex: "graphics card",
    wrongWhy: "It works perfectly for hours once it is seated properly, and it works in another machine. A card that answers to being pressed down is a card that is not held down."
  },
  {
    key: "fanheader", part: "a case fan on the wrong header", objective: "3.5 + 5.1",
    root: "The case fan was plugged into a header the board does not control, so it runs at full speed all day. Nothing is failing and the office has complained about the noise for months.",
    symptoms: ["It's so loud we can hear it across the room",
      "It's not hot, it's just loud", "It's been like it since it was built"],
    observable: "one fan running flat out constantly on a machine whose temperatures are entirely normal",
    post: { beeps: "none", meaning: "posts normally", code: "" },
    thermalNormal: true, smartClean: true,
    eventKeys: [],
    fixes: "Move the fan to a controlled header and set its curve. If the board has no spare controlled header, a quieter fan is the answer rather than a louder complaint.",
    partSpec: "cable", needKind: "case-fan",
    wrongReflex: "cooling",
    wrongWhy: "Every temperature in the machine is normal and the processor never throttles. A fan running flat out on a cool machine is a fan nobody is telling to slow down."
  }
];

/* ---------------- red herrings ----------------
   Findings that look alarming and are ordinary. A tech who chases these is
   doing the thing this page is built to stop. Each carries the reason it
   is normal, because "ignore it" without a reason teaches nothing. */
const RED_HERRINGS = [
  { text: "Event Viewer is full of warnings from the last three months",
    why: "Every Windows machine is. Warnings are not errors, and a clean event log is rarer than a full one." },
  { text: "A DISTRIBUTEDCOM 10016 error appears every single boot",
    why: "A permissions quirk Microsoft has documented and declined to fix for years. Cosmetic." },
  { text: "The case fan is louder than the user remembers",
    why: "Fans get louder as bearings age and dust builds. Loud is not the same as failed — check the RPM before you believe the ear." },
  { text: "One drive shows a non-zero power-on hours count in the thousands",
    why: "That is just age. A four-year-old drive has about 35,000 hours on it and that is entirely normal." },
  { text: "The machine is two years past its refresh date on the asset register",
    why: "Old is not broken. Age tells you what to budget for, not what failed today." },
  { text: "Windows Update installed a cumulative update last Tuesday",
    why: "It does that every month. It is only a lead if the symptom starts at the install, and here it does not." },
  { text: "A previous tech left a note saying 'flaky, watch it'",
    why: "No symptom, no date, no evidence. A note is a rumour until something confirms it." },
  { text: "The user has 40 browser tabs open and the machine has 8GB of RAM",
    why: "It will feel slow, and that is a conversation to have. It does not cause blue screens or hard power-offs." }
];

/* ---------------- change history ----------------
   The thing the caller forgot. For the omission distortion this is the
   lead; for everything else it is context. */
/* Extra recent activity that is never the cause. Widened so the change record
   does not read the same twice. */
export const CHANGE_FILLER = [
  "Monthly cumulative update applied by policy",
  "Printer driver updated fleet-wide",
  "New starter account created in this department",
  "Antivirus definitions updated automatically",
  "Office suite upgraded to the current channel",
  "Password policy extended to 14 characters",
  "A second network printer added to the floor",
  "Backup agent updated on all workstations",
  "The building's guest wireless was reconfigured",
  "A department-wide mailbox quota increase was applied"
];

const CHANGES = [
  { text: "Desks were rearranged across the floor", relevant: ["cable"] },
  { text: "A second monitor was added to this workstation", relevant: ["psu", "video"] },
  { text: "A graphics card was fitted last year for CAD work", relevant: ["psu"] },
  { text: "The machine was moved from a carpeted office to the shop floor", relevant: ["thermal", "cable"] },
  { text: "A memory upgrade was fitted by a member of staff, not by IT", relevant: ["ram"] },
  { text: "The building lost power twice during a storm", relevant: ["psu", "drive", "cmos"] },
  { text: "The machine has run sixteen hours a day in a warm office since it was bought", relevant: ["bulgecap"] },
  { text: "It came back from a repair shop a year ago and has never been right since", relevant: ["bulgecap", "gpuseat"] },
  { text: "The machine sat unplugged in storage for four months", relevant: ["cmos"] },
  { text: "A standing desk was installed and the tower now sits on the floor", relevant: ["thermal"] },
  { text: "The comms cabinet was re-patched over the weekend", relevant: ["vlan", "patch"] },
  { text: "Somebody from head office changed the network settings by hand last week", relevant: ["mask", "gateway", "dns"] },
  { text: "Eleven new starters joined this month, all on this floor", relevant: ["apipa"] },
  { text: "A new network printer was installed near this desk", relevant: ["duplicate"] },
  { text: "The workstation was moved to a different desk and re-patched", relevant: ["patch", "duplicate", "vlan"] },
  { text: "The DNS servers were renumbered during the server refresh", relevant: ["dns"] },
  { text: "A second router was trialled on the subnet and then removed", relevant: ["gateway"] },
  { text: "The user reset the handset themselves to clear a problem", relevant: ["mdm", "storage"] },
  { text: "The fleet moved to a new mobile carrier last month", relevant: ["cellular"] },
  { text: "Tablets were issued to the vans to replace paper job sheets", relevant: ["hotspot"] },
  { text: "Handsets have been passed between crews as people moved teams", relevant: ["btpair"] },
  { text: "A security update was pushed to every handset a fortnight ago", relevant: ["vpnalways", "captiveportal"] },
  { text: "The job application was reinstalled on this device by the user", relevant: ["appperm"] },
  { text: "Heavy protective cases were issued to everyone in the field", relevant: ["overheat", "port"] },
  { text: "Windscreen cradles and fast chargers were fitted to the vans", relevant: ["overheat", "battery"] },
  { text: "The handset was dropped in the car park", relevant: ["digitizer"] },
  { text: "The device has been in daily field use for two years without a swap", relevant: ["battery", "port", "rearcam"] },
  { text: "Tempered-glass protectors were fitted to the whole fleet by a supplier", relevant: ["protector"] },
  { text: "A battery-saving policy was pushed to every handset after the last update", relevant: ["nfcoff"] },
  { text: "One of the vans got caught in a downpour with the tailgate up", relevant: ["liquid"] },
  { text: "The job-management application was upgraded across the business", relevant: ["eol"] },
  { text: "Video recording was switched on for site reports", relevant: ["storage"] },
  { text: "A new virtual machine was built for the reporting project", relevant: ["vmram"] },
  { text: "Twelve more virtual desktops were added to the pool", relevant: ["vdi"] },
  { text: "A test environment was stood up for a project that has since finished", relevant: ["spend"] },
  { text: "The database was given more processors to speed it up", relevant: ["cpuready"] },
  { text: "A guest was migrated onto the second host over the weekend", relevant: ["portgroup"] },
  { text: "The reporting team rewrote their nightly job in the spring", relevant: ["egress"] },
  { text: "Several machines on the shared datastore have grown steadily all year", relevant: ["thinprov"] },
  { text: "A member of staff left and their project folder was tidied up", relevant: ["retention"] },
  { text: "The team started keeping scanned records in the shared drive", relevant: ["quota"] },
  { text: "Two people were away and worked offline on the same document", relevant: ["sync"] },
  { text: "A new starter joined and was set up on the standard build", relevant: ["licence"] },
  { text: "This workstation was rebuilt from the current image", relevant: ["virtext"] },
  { text: "The comms room was re-patched and several ports were moved", relevant: ["printer", "vdicable"] },
  { text: "A laptop came back from a repair vendor last week", relevant: ["wifi", "lapadhesive"] },
  { text: "The user was quoted for a memory upgrade by somebody who never opened the machine", relevant: ["lapsoldered"] },
  { text: "A replacement drive was ordered from the part number on the invoice", relevant: ["lapm2key"] },
  { text: "This machine was cleaned out and re-pasted by a vendor six months ago", relevant: ["lappaste"] },
  { text: "The meeting-room projector was used with this laptop all last week", relevant: ["lapbacklight"] },
  { text: "This workstation has been making a clicking noise for a while", relevant: ["syncdisk"] },
  { text: "The user reset their handset after a software update failed", relevant: ["phonemail"] },
  { text: "A cheaper brand of paper was ordered this month", relevant: ["pickup"] },
  { text: "The office was redecorated and the machines sat under dust sheets", relevant: ["pickup", "scanner"] },
  { text: "Somebody refilled the toner cartridge instead of replacing it", relevant: ["repeat", "transfer"] },
  { text: "A label sheet was fed through it and peeled off inside", relevant: ["fuser", "repeat"] },
  { text: "The printer was moved across the room and knocked on the way", relevant: ["scanner", "transfer"] },
  { text: "Its monthly volume tripled when the second team started using it", relevant: ["fuser", "pickup", "wastepad"] },
  { text: "The office was closed for a fortnight over the holidays", relevant: ["capping", "head"] },
  { text: "Somebody cleared a jam by pulling the paper out sideways", relevant: ["belt", "encoder"] },
  { text: "Third-party refill cartridges were bought in to save money", relevant: ["head", "encoder", "wastepad"] },
  { text: "It was cleaned by an outside contractor a fortnight ago", relevant: ["encoder", "capping", "belt"] },
  { text: "The laptop came back from a hinge repair three weeks ago", relevant: ["lapwifi", "vidcable"] },
  { text: "A drink went over the desk and everything was wiped down", relevant: ["lapkbd"] },
  { text: "It has been left on charge on a desk dock continuously for two years", relevant: ["lapbatt"] },
  { text: "Memory was upgraded by the user from parts bought online", relevant: ["lapram"] },
  { text: "The machine was carried in a bag with a full water bottle", relevant: ["panel", "lapkbd"] },
  { text: "The boardroom was recarpeted and everything was put back afterwards", relevant: ["projector"] },
  { text: "The monitor was unplugged and moved between two desks", relevant: ["vidport"] },
  { text: "The laptop has been opened and closed on a hot-desk twice a day for years", relevant: ["vidcable", "driver"] },
  { text: "Nothing was serviced on it in the four years it has been here", relevant: ["backlight", "lapssd", "projector", "ozone", "lampdim"] },
  { text: "It has lived on a bed or a sofa rather than a desk", relevant: ["lapthermal"] },
  { text: "The charger has been yanked out sideways by the cable for years", relevant: ["lapdc"] },
  { text: "It is opened and closed a dozen times a day on a hot desk", relevant: ["laphinge", "laptrack"] },
  { text: "There was a power cut over the weekend and it has not been on since", relevant: ["lapboard"] },
  { text: "Double-sided printing was made the default across the office", relevant: ["duplexjam", "exitjam"] },
  { text: "The paper trays were refilled from a different pallet", relevant: ["regskew", "ijfeed"] },
  { text: "It has been making a new noise for about a week", relevant: ["gearnoise"] },
  { text: "Somebody started printing photographs on it borderless", relevant: ["platen", "starwheel"] },
  { text: "The office was dusty for a fortnight while work was done overhead", relevant: ["feedenc", "lapthermal"] },
  { text: "Head cleaning has been run most days for a month", relevant: ["pumpfail"] },
  { text: "A graphics driver update was pushed to the fleet", relevant: ["gpuart"] },
  { text: "The desks were rearranged and everything was re-cabled", relevant: ["noinput"] },
  { text: "The screen has had a bag pressed against it in transit", relevant: ["deadcolumn", "partialbl"] },
  { text: "Somebody made up their own patch leads to save waiting on an order", relevant: ["open", "short", "revpair", "split"] },
  { text: "A contractor terminated the new outlets and nobody checked which standard they used", relevant: ["crossed", "punchmiss", "untwist"] },
  { text: "Half the floor was re-cabled over a weekend by a second contractor", relevant: ["punchmiss", "crossed", "noconnect"] },
  { text: "The comms room was moved to the other end of the building", relevant: ["longrun"] },
  { text: "Desks were added along the far wall past where the plan stopped", relevant: ["longrun", "noconnect"] },
  { text: "A box of cheap patch cords was bought in for the office move", relevant: ["wrongcat"] },
  { text: "The switches were upgraded to ten-gigabit over the holiday", relevant: ["wrongcat"] },
  { text: "The pairs were combed out flat to make the punch-downs quicker", relevant: ["untwist", "split"] },
  { text: "A run was pulled hard round a corner to reach the last outlet", relevant: ["open", "longrun"] },
  { text: "New outlets were fitted at the desks but the panel was left for later", relevant: ["noconnect"] },
  { text: "Unused ports were shut down during a security tidy last quarter", relevant: ["portdisabled"] },
  { text: "The cord under that desk gets caught by a chair several times a day", relevant: ["plugstrain"] },
  { text: "A batch of patch cords was made up in-house from a box of wall cable", relevant: ["solidplug"] },
  { text: "The run was fixed to the joists with a staple gun", relevant: ["staplecrush"] },
  { text: "The ceiling void on that floor is used to return air to the plant room", relevant: ["plenumjacket"] },
  { text: "That device is plugged straight into the machine and has never been on the network", relevant: ["usbfailed"] },
  { text: "The laptops were all moved onto the new guest-style wireless network", relevant: ["apisolation"] },
  { text: "Print accounting was switched on across the department this term", relevant: ["printquota"] },
  { text: "Energy settings were tightened on every device to cut standby power", relevant: ["sleepdrop"] },
  { text: "That user sets their own equipment up rather than waiting for the desk", relevant: ["ownport"] },
  { text: "A graphics card was fitted to this machine for the CAD work", relevant: ["railsag"] },
  { text: "The machine was shut down over the long weekend and not switched on since", relevant: ["pgdelay", "railsag"] },
  { text: "This wing was refitted by a contractor who has since gone out of business", relevant: ["openground", "revpolarity"] },
  { text: "The desks along that wall were added after the electrical sign-off", relevant: ["openground", "circuitload"] },
  { text: "Nobody has been in the comms cupboard since the UPS was installed", relevant: ["upsbattery"] },
  { text: "The department printer was moved next to the UPS to free up a desk", relevant: ["upsoverload"] },
  { text: "A compressor was installed in the unit next door", relevant: ["brownout"] },
  { text: "A memory upgrade was fitted at the desk, on the carpet, in January", relevant: ["esdstatic"] },
  { text: "Four more desks were squeezed in and everything was plugged in where it reached", relevant: ["stripchain", "circuitload"] },
  { text: "The kitchen was moved and its sockets came off the office circuit", relevant: ["circuitload"] },
  { text: "Somebody bought a box of power strips to solve the socket shortage", relevant: ["stripchain"] },
  { text: "The machine was moved onto the workshop floor where the extraction runs", relevant: ["psufan", "gpufan"] },
  { text: "The team started working with very large scan files this quarter", relevant: ["nvmethermal"] },
  { text: "This machine was built in-house rather than bought as a standard unit", relevant: ["nvmethermal", "m2loose"] },
  { text: "Everything was unplugged and carried across the office in a trolley", relevant: ["m2loose"] },
  { text: "It is the last machine left from the original office fit-out", relevant: ["frontpanel"] },
  { text: "The CAD work was moved onto this machine when the other one went", relevant: ["gpufan"] },
  { text: "The whole floor was renumbered onto a new address range last month", relevant: ["wrongsubnet"] },
  { text: "A small unmanaged switch appeared under one of the desks", relevant: ["portsec"] },
  { text: "A switch port was hard-set during an outage a couple of years ago", relevant: ["duplex"] },
  { text: "The old web proxy was decommissioned in the last refresh", relevant: ["proxy"] },
  { text: "The helpdesk had this user disabling things while they diagnosed something else", relevant: ["nicoff"] },
  { text: "The handset lives loose in a work trouser pocket all day", relevant: ["speaker"] },
  { text: "It has been left on the van charger overnight, every night, for two years", relevant: ["swollen"] },
  { text: "The archive team moved down to the basement store rooms", relevant: ["wificall"] },
  { text: "The management platform's signing certificate came up for renewal", relevant: ["profile"] },
  { text: "This user has never plugged the handset in anywhere but the van", relevant: ["backupfail"] },
  { text: "The line-of-business application was upgraded a few months ago", relevant: ["snapshot"] },
  { text: "The host was rebuilt and never rejoined to the time source", relevant: ["timedrift"] },
  { text: "The nightly backup was extended to cover the new file shares", relevant: ["backupwin"] },
  { text: "This user was issued a new handset a couple of weeks ago", relevant: ["mfa"] },
  { text: "A new service was stood up quickly for a deadline last quarter", relevant: ["region"] },
  { text: "A graphics card was fitted to this desk for the new drawing work", relevant: ["slowcloud"] },
  { text: "The old resolver was retired during the server refresh", relevant: ["mobiledns"] },
  { text: "The print server has been making a clicking noise for a few weeks", relevant: ["printerspool"] },
  { text: "The roaming profiles were moved onto the shared store last year", relevant: ["vdiprofile"] },
  { text: "A certificate change was pushed to the managed laptops", relevant: ["laptopvpn"] },
  { text: "The server has been beeping in the comms room for a fortnight", relevant: ["member1", "member2", "spareidle"] },
  { text: "A disk was replaced on this array a few months ago", relevant: ["member2", "spareidle", "smallreplace"] },
  { text: "The server was moved to the new comms room over the weekend", relevant: ["foreign"] },
  { text: "The disks were taken out to lift the chassis and put back afterwards", relevant: ["foreign"] },
  { text: "The array has never been serviced in the six years it has run", relevant: ["predfail", "bbu", "rebuildstall"] },
  { text: "This array was set up for speed when the video work started", relevant: ["raid0"] },
  { text: "A user was tidying up the shared drive on Tuesday afternoon", relevant: ["nobackup"] },
  { text: "The backup job was reconfigured when the software was upgraded", relevant: ["nobackup"] },
  { text: "A disk off the shelf was fitted by somebody on site", relevant: ["smallreplace"] },
  { text: "A rebuild was started last week and nobody has looked since", relevant: ["rebuildstall"] },
  { text: "The letterheaded paper started going through the side tray", relevant: ["sepwear"] },
  { text: "The office started printing its own report covers on card", relevant: ["wrongmedia", "headstrike"] },
  { text: "Nobody has changed a cartridge on it since it was installed", relevant: ["cleanblade", "tonerlow"] },
  { text: "The paper was switched to a narrower size for one job and switched back", relevant: ["trayguide"] },
  { text: "The cartridges were sent away to be refilled this quarter", relevant: ["chipreset"] },
  { text: "It was moved and tipped on its side to get it through the door", relevant: ["airlock"] },
  { text: "A cheaper uncoated paper was bought in for the whole floor", relevant: ["waterink"] },
  { text: "Somebody wiped the inside of it down with a solvent cleaner", relevant: ["carriagerail"] },
  { text: "This machine has been used on a lap and a sofa for two years", relevant: ["lapfan"] },
  { text: "A drink was spilled near the speaker grille a while back", relevant: ["lapspeaker"] },
  { text: "It came back from a repair three weeks ago and has not been right since", relevant: ["lappipeloose", "lapspeakerloom"] },
  { text: "It is on its fourth year and has never had a new battery", relevant: ["lapbatthealth"] },
  { text: "The user works by a big window on the south side", relevant: ["lapadaptive"] },
  { text: "The machine is taken to site and used away from a desk most days", relevant: ["lappowerplan"] },
  { text: "It came back from a screen repair a few weeks ago", relevant: ["lapwebcam", "lapdisplaycable"] },
  { text: "Somebody was booting it from a USB stick last week", relevant: ["lapbios"] },
  { text: "It gets carried between three sites in a shoulder bag", relevant: ["lapdisplaycable"] },
  { text: "New monitors were rolled out across the floor last month", relevant: ["refresh", "colourprofile"] },
  { text: "This screen has had the same application open on it for two years", relevant: ["burnin"] },
  { text: "An adapter was bought so the laptop would reach the boardroom screen", relevant: ["hdcp"] },
  { text: "Docking stations were issued to the hot-desk floor", relevant: ["dockdisplay"] },
  { text: "An access point was fitted at that end of the warehouse", relevant: ["poeport"] },
  { text: "New plant was installed and the cable tray was shared with it", relevant: ["emi"] },
  { text: "A run was pulled hard round the structural beam during the fit-out", relevant: ["bendradius"] },
  { text: "The outlets on that wall were labelled by a contractor in one batch", relevant: ["labelswap"] },
  { text: "The inter-floor patching was redone during the comms room tidy", relevant: ["fibrescratch"] },
  { text: "This workstation was rebuilt from the current image last week", relevant: ["wrongdriver", "defaultprinter"] },
  { text: "The building lost power on Sunday and everything came back up on its own", relevant: ["dhcpprinter"] },
  { text: "Somebody printed a very large drawing on Friday afternoon", relevant: ["spooler", "queuestuck"] },
  { text: "The printer was bought by the department rather than through IT", relevant: ["sharedoffline"] },
  { text: "A new starter joined this department this week", relevant: ["securedprint"] },
  { text: "The mail platform was migrated at the weekend", relevant: ["scanemail"] },
  { text: "Service account passwords were rotated at the policy review", relevant: ["scanfolder"] },
  { text: "The printers were moved onto their own subnet during the network tidy", relevant: ["discovery"] },
  { text: "Print queues were consolidated onto the server last month", relevant: ["queuestuck", "sharedoffline"] },
  { text: "A finisher and a second paper tray were fitted to the device in the spring", relevant: ["finishing"] },
  { text: "Security tightened the rules between the office and the printer subnet", relevant: ["portblocked"] },
  { text: "The DHCP scope was widened when the floor filled up", relevant: ["ipconflict"] },
  { text: "Attachment limits were reduced on the mail platform this quarter", relevant: ["scansize"] },
  { text: "A box of headed paper was loaded for a mailshot and the rest put back", relevant: ["traymedia"] },
  { text: "There was a bad storm a couple of summers ago", relevant: ["surgedead"] },
  { text: "The workshop machines were put on a circuit off the same panel", relevant: ["neutralshare"] },
  { text: "A standby generator was installed and some outlets were rewired to it", relevant: ["genset"] },
  { text: "A replacement supply was ordered on wattage from a catalogue", relevant: ["psuwrongform"] },
  { text: "The UPS has sat in the corner untouched since the office opened", relevant: ["upsselftest"] },
  { text: "An engineer was out to service the UPS in the spring", relevant: ["upsbypass"] },
  { text: "The workstations were all replaced last year and the UPS was kept", relevant: ["upswaveform"] },
  { text: "This machine came over from the other office in the back of a car", relevant: ["voltselector"] },
  { text: "The machine sits in a cupboard under the stairs with the door shut", relevant: ["psufanseized"] },
  { text: "This half of the building predates the rewire and was never brought up", relevant: ["bootlegground"] },
  { text: "Two more disks were bought to make the array bigger", relevant: ["expandwrong"] },
  { text: "Somebody swapped a disk on the array without logging it", relevant: ["wrongslot"] },
  { text: "The building lost power on Sunday with no warning", relevant: ["cachedirty"] },
  { text: "The array enclosure was knocked when the rack was re-dressed", relevant: ["backplane"] },
  { text: "A rebuild was started during the working day and left running", relevant: ["rebuildslow"] },
  { text: "The virtual machines were all migrated onto one host for the weekend", relevant: ["raidslow"] },
  { text: "A kettle and a heater appeared on the office floor this winter", relevant: ["printpower"] },
  { text: "Scanning to the shared cloud folder was rolled out to everybody", relevant: ["scanstore"] },
  { text: "The warehouse access points were re-patched during the comms tidy", relevant: ["vpnprinter"] },
  { text: "The nightly backup was pointed at the cloud instead of tape", relevant: ["backupdisk"] },
  { text: "A document sync client was rolled out to this department", relevant: ["startupapp"] },
  { text: "Driver updates went out with last month's patch cycle", relevant: ["driverbad", "devicecode10"] },
  { text: "This user has been keeping a lot of video on the machine", relevant: ["diskfull"] },
  { text: "A new cumulative update was released a fortnight ago", relevant: ["updateloop"] },
  { text: "This account was migrated from the old domain last year", relevant: ["profilecorrupt"] },
  { text: "Somebody worked through a tuning guide on this machine", relevant: ["servicedisabled", "pagefile"] },
  { text: "The machine was set up by a contractor rather than from the image", relevant: ["pagefile", "servicedisabled"] },
  { text: "A colleague installed some software they found online", relevant: ["thirdparty"] },
  { text: "There have been several power cuts in this part of the building", relevant: ["sysfiles"] },
  { text: "Memory was added to this machine by somebody on site", relevant: ["ramslot"] },
  { text: "It is the original machine from the first office fit-out", relevant: ["cpupaste"] },
  { text: "A second memory module was added by somebody with what was on the shelf", relevant: ["dimmspeed"] },
  { text: "Everything was unplugged and moved when the department relocated", relevant: ["gpuseat"] },
  { text: "This machine was built up from spares rather than bought", relevant: ["fanheader", "ramslot"] },
  { text: "Nobody has had the side off it in six years", relevant: ["cpupaste"] },
  { text: "The file server was renumbered when it moved to the new rack", relevant: ["dnsold"] },
  { text: "Somebody was testing the migration from this machine months ago", relevant: ["hosts"] },
  { text: "A second wireless radio was added to this floor", relevant: ["wifiband"] },
  { text: "A site-to-site tunnel was stood up to the other office", relevant: ["mtu"] },
  { text: "Somebody spent an afternoon tidying the cables under the desks", relevant: ["loop"] }
];

/* ---------------- parts catalogue ----------------
   The build tile. Every part is real enough to reason about: it either
   physically fits and electrically works, or it does not. Price is a
   second, separate gate. */
const CATALOGUE = {
  ram: [
    { id: "M-1", name: "8GB DDR4-2666 UDIMM", price: 34, spec: { type: "DDR4", speed: 2666, cap: 8 } },
    { id: "M-2", name: "8GB DDR4-3200 UDIMM", price: 41, spec: { type: "DDR4", speed: 3200, cap: 8 } },
    { id: "M-3", name: "16GB DDR4-3200 UDIMM", price: 66, spec: { type: "DDR4", speed: 3200, cap: 16 } },
    { id: "M-4", name: "8GB DDR5-4800 UDIMM", price: 58, spec: { type: "DDR5", speed: 4800, cap: 8 } },
    { id: "M-5", name: "8GB DDR4-2666 SODIMM", price: 36, spec: { type: "DDR4", speed: 2666, cap: 8, form: "SODIMM" } },
    { id: "M-6", name: "32GB DDR4-3200 UDIMM kit", price: 148, spec: { type: "DDR4", speed: 3200, cap: 32 } }
  ],
  psu: [
    { id: "P-1", name: "450W 80+ Bronze ATX", price: 52, spec: { watts: 450, pcie: 1, form: "ATX" } },
    { id: "P-2", name: "650W 80+ Bronze ATX", price: 79, spec: { watts: 650, pcie: 2, form: "ATX" } },
    { id: "P-3", name: "850W 80+ Gold ATX", price: 139, spec: { watts: 850, pcie: 4, form: "ATX" } },
    { id: "P-4", name: "1200W 80+ Platinum ATX", price: 289, spec: { watts: 1200, pcie: 6, form: "ATX" } },
    { id: "P-5", name: "500W 80+ Bronze SFX", price: 88, spec: { watts: 500, pcie: 1, form: "SFX" } },
    { id: "P-6", name: "600W 80+ Gold SFX", price: 124, spec: { watts: 600, pcie: 2, form: "SFX" } },
    { id: "P-7", name: "750W 80+ Platinum SFX", price: 178, spec: { watts: 750, pcie: 3, form: "SFX" } }
  ],
  drive: [
    { id: "D-1", name: "500GB SATA SSD", price: 39, spec: { iface: "SATA", cap: 500 } },
    { id: "D-2", name: "1TB SATA SSD", price: 62, spec: { iface: "SATA", cap: 1000 } },
    { id: "D-3", name: "2TB SATA SSD", price: 118, spec: { iface: "SATA", cap: 2000 } },
    { id: "D-4", name: "1TB NVMe M.2 SSD", price: 71, spec: { iface: "NVMe", cap: 1000 } },
    { id: "D-5", name: "1TB 7200rpm SATA HDD", price: 44, spec: { iface: "SATA", cap: 1000, rpm: 7200 } },
    { id: "D-6", name: "4TB SATA SSD", price: 249, spec: { iface: "SATA", cap: 4000 } }
  ],
  fan: [
    { id: "F-1", name: "Replacement CPU cooler, LGA1200/AM4, 95W TDP", price: 24, spec: { socket: "both", tdp: 95, height: 150 } },
    { id: "F-2", name: "Low-profile CPU cooler, LGA1200/AM4, 65W TDP", price: 19, spec: { socket: "both", tdp: 65, height: 58 } },
    { id: "F-3", name: "Tower CPU cooler, LGA1200/AM4, 150W TDP", price: 44, spec: { socket: "both", tdp: 150, height: 165 } },
    { id: "F-4", name: "240mm AIO liquid cooler, 250W TDP", price: 118, spec: { socket: "both", tdp: 250, height: 52, aio: true } },
    { id: "F-5", name: "Replacement CPU cooler, LGA1700 only, 95W TDP", price: 26, spec: { socket: "LGA1700", tdp: 95, height: 150 } },
    { id: "F-6", name: "Low-profile CPU cooler, LGA1200/AM4, 95W TDP", price: 31, spec: { socket: "both", tdp: 95, height: 59 } },
    { id: "F-7", name: "Low-profile CPU cooler, LGA1200/AM4, 125W TDP", price: 47, spec: { socket: "both", tdp: 125, height: 55 } }
  ],
  gpu: [
    { id: "G-1", name: "Entry GPU, 75W, no aux power, half-height", price: 119, spec: { watts: 75, aux: 0, length: 168 } },
    { id: "G-2", name: "Mid GPU, 170W, 1× 8-pin", price: 289, spec: { watts: 170, aux: 1, length: 242 } },
    { id: "G-3", name: "High GPU, 285W, 2× 8-pin", price: 549, spec: { watts: 285, aux: 2, length: 304 } },
    { id: "G-4", name: "Workstation GPU, 130W, 1× 8-pin", price: 449, spec: { watts: 130, aux: 1, length: 267 } },
    { id: "G-5", name: "Flagship GPU, 450W, 3× 8-pin", price: 1099, spec: { watts: 450, aux: 3, length: 336 } },
    { id: "G-6", name: "Short-length GPU, 130W, 1× 8-pin", price: 319, spec: { watts: 130, aux: 1, length: 172 } },
    { id: "G-7", name: "Short-length GPU, 170W, 1× 8-pin", price: 379, spec: { watts: 170, aux: 1, length: 178 } }
  ],
  /* The small-parts bin. Four faults order out of here and each one needs a
     different thing from it, which is why the wrong answers are all real
     parts a technician might grab. */
  cable: [
    { id: "C-1", name: "SATA data cable, straight, 45cm", price: 4, spec: { kind: "sata-data" } },
    { id: "C-2", name: "SATA data cable, right-angle, 30cm", price: 5, spec: { kind: "sata-data" } },
    { id: "C-3", name: "SATA power splitter", price: 6, spec: { kind: "sata-power" } },
    { id: "C-4", name: "M.2 mounting screw kit", price: 3, spec: { kind: "m2-screw" } },
    { id: "C-5", name: "M.2 heatsink with thermal pads", price: 11, spec: { kind: "m2-heatsink" } },
    { id: "C-6", name: "Front panel power switch and lead", price: 7, spec: { kind: "fp-switch" } },
    { id: "C-7", name: "Case fan, 120mm, 3-pin", price: 9, spec: { kind: "case-fan" } }
  ],
  /* Boards. A board is the one order on this track where three separate
     things all have to line up at once — the socket the processor sits in,
     the memory already in the machine, and the shape that bolts into the
     case they have got. Get any one wrong and the parcel is useless, which
     is exactly the lesson: you cannot order a motherboard from a symptom,
     only from a specification you went and read. */
  mobo: [
    { id: "MB-1", name: "LGA1200 ATX board, DDR4, 4 DIMM slots", price: 109,
      spec: { socket: "LGA1200", ram: "DDR4", form: "ATX" } },
    { id: "MB-2", name: "LGA1200 microATX board, DDR4, 2 DIMM slots", price: 84,
      spec: { socket: "LGA1200", ram: "DDR4", form: "microATX" } },
    { id: "MB-3", name: "AM4 ATX board, DDR4, 4 DIMM slots", price: 115,
      spec: { socket: "AM4", ram: "DDR4", form: "ATX" } },
    { id: "MB-4", name: "AM4 microATX board, DDR4, 2 DIMM slots", price: 88,
      spec: { socket: "AM4", ram: "DDR4", form: "microATX" } },
    { id: "MB-5", name: "LGA1700 ATX board, DDR5, 4 DIMM slots", price: 189,
      spec: { socket: "LGA1700", ram: "DDR5", form: "ATX" } },
    { id: "MB-6", name: "LGA1700 microATX board, DDR4, 4 DIMM slots", price: 132,
      spec: { socket: "LGA1700", ram: "DDR4", form: "microATX" } },
    { id: "MB-7", name: "AM4 mini-ITX board, DDR4, 2 DIMM slots", price: 121,
      spec: { socket: "AM4", ram: "DDR4", form: "mini-ITX" } },
    { id: "MB-8", name: "LGA1200 ATX workstation board, DDR4, dual NIC, 10 SATA", price: 279,
      spec: { socket: "LGA1200", ram: "DDR4", form: "ATX", pro: true } }
  ],
  cmos: [
    { id: "B-1", name: "CR2032 coin cell", price: 3, spec: { kind: "CR2032" } },
    { id: "B-2", name: "CR2016 coin cell", price: 3, spec: { kind: "CR2016" } },
    { id: "B-3", name: "CR2032 coin cell, 5-pack", price: 9, spec: { kind: "CR2032", pack: 5 } }
  ]
};
export { CATALOGUE };

/* Shipping is the second half of the budget lesson: the right part sent
   the wrong way is still the wrong answer. */
export const SHIPPING = [
  { key: "standard", label: "Standard (3–5 days)", price: 0 },
  { key: "next-day", label: "Next business day", price: 22 },
  { key: "overnight", label: "Overnight, before 9am", price: 65 }
];

function pad(n) { return n < 10 ? "0" + n : "" + n; }
export function hhmm(sec) { return pad(Math.floor(sec / 3600) % 24) + ":" + pad(Math.floor(sec / 60) % 60); }
export function dayName(i) {
  return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"][((i % 5) + 5) % 5];
}

/* Deal distinct fault + org pairings so no two tickets in a session open
   the same way. */
export const TRACKS = {
  hardware: { key: "hardware", label: "Hardware", faults: HARDWARE_FAULTS,
    blurb: "Seven faults inside the box. POST codes, SMART, thermals — and a part to order." },
  network: { key: "network", label: "Networking", faults: NETWORK_FAULTS,
    blurb: "Seven faults on the wire. ipconfig, ping, ARP, switch port — and a configuration to build." },
  mobile: { key: "mobile", label: "Mobile", faults: MOBILE_FAULTS,
    blurb: "Seven faults on a handset. Battery health, enrolment, storage, signal — and a decision worth real money." },
  cloud: { key: "cloud", label: "Virtualization & cloud", faults: CLOUD_FAULTS,
    blurb: "Seven faults above the metal. Host capacity, sync, quotas, licences, metered spend — and an allocation that has to fit." },
  mixed: { key: "mixed", label: "Mixed — find the domain", faults: MIXED_FAULTS,
    blurb: "Five calls that present in one domain and live in another. Nobody tells you where to look, and ruling a domain out counts for as much as ruling one in." },
  laser: { key: "laser", label: "Laser printers", faults: LASER_FAULTS,
    blurb: "Five faults across the seven-stage imaging process. Measure the repeating defect, order the right roller, and do the job in an order that does not burn you." },
  inkjet: { key: "inkjet", label: "Inkjet printers", faults: INKJET_FAULTS,
    blurb: "Five faults around the carriage. Nozzle checks, capping, the encoder strip that solvent destroys — and a cleaning method per part where the wrong one costs the printer." },
  laptop: { key: "laptop", label: "Laptops", faults: LAPTOP_FAULTS,
    blurb: "Five faults inside the chassis. How deep the part is buried decides the quote, the battery comes out before anything else, and one ticket is a hazard rather than a fault." },
  display: { key: "display", label: "Displays & video", faults: DISPLAY_FAULTS,
    blurb: "Five faults you settle with a torch and a spare monitor. Backlight against panel, driver against backlight, and a projector that is not a lamp problem." },
  printnet: { key: "printnet", label: "Printer networking & sharing", faults: PRINTNET_FAULTS,
    blurb: "Five faults between the user and the printer. A device that prints its own page perfectly and will not print a document is not a printer fault \u2014 work out which of seven links the job stopped at, then decide how the device should have been deployed so it stops happening." },
  raid: { key: "raid", label: "RAID & storage arrays", faults: RAID_FAULTS,
    blurb: "Five faults on an array. Read the member list against the level's own tolerance, work out whether the data is intact or already gone, and know which of the two options on the controller screen is the one you cannot undo. One ticket is a perfectly healthy array that has lost data anyway." },
  power: { key: "power", label: "Power & safety", faults: POWER_FAULTS,
    blurb: "Five faults on the power. Rails against their published tolerance, an outlet that is a shock hazard and not yours to repair, a UPS asked to do the wrong job, and a breaker doing exactly what it was fitted to do. One graded answer here is whether the job is yours at all." },
  cabling: { key: "cabling", label: "Cabling & termination", faults: CABLING_FAULTS,
    blurb: "Five faults on the copper. Read what the tester is actually saying, work out which of six places on the link it is, then put eight conductors in the right eight slots — including the one fault a continuity tester says is fine." }
};

/* `keep` narrows which faults may be dealt. It exists for the two tracks
   that carry two objectives — a mobile ticket is 1.3 or 5.4 depending on the
   fault, a cloud ticket 4.1 or 4.2 — so that a student who picked an
   objective in the navigation is given tickets on THAT objective rather than
   on whatever the seed happened to turn up. Omitted, nothing is filtered and
   the deal is byte-for-byte what it always was. */
export function dealFaults(seed, track, keep) {
  var r = R(mulberry32(seed * 2654435761 + { hardware: 0, network: 7, mobile: 19, cloud: 31, mixed: 43, laser: 59, inkjet: 71, laptop: 83, display: 97, cabling: 109, power: 127, raid: 149, printnet: 163 }[track]));
  var pool = [];
  TRACKS[track].faults.filter(function (f) { return !keep || keep(f); }).forEach(function (f) {
    ORGS.forEach(function (o) { pool.push({ fault: f, org: o }); });
  });
  // one ticket per fault key, so all seven fault types are reachable and
  // the five dealt are always distinct
  var byFault = {};
  r.shuffle(pool).forEach(function (p) { if (!byFault[p.fault.key]) byFault[p.fault.key] = p; });
  return r.shuffle(Object.keys(byFault).map(function (k) { return byFault[k]; }));
}
export function dealHardware(seed) { return dealFaults(seed, "hardware"); }

export function buildTicket(seed, slot, track, keep) {
  track = track || "hardware";
  var G_assetRecord;
  var rng = mulberry32(seed * 7919 + slot * 104729 + { hardware: 0, network: 55001, mobile: 91009, cloud: 130003, mixed: 171013,
      laser: 210001, inkjet: 250007, laptop: 290011, display: 330017, cabling: 370009, power: 410021, raid: 450011, printnet: 490019 }[track]);
  var r = R(rng);
  /* Modulo the deal's own length rather than a hard five. Unfiltered every
     track deals ten or more, so slots one to five index the same five
     tickets they always did; filtered to one objective a track can offer
     fewer, and a hard five would have indexed off the end of the list. */
  var deal = dealFaults(seed, track, keep);
  var hand = deal[(slot - 1) % deal.length];
  var fault = hand.fault;
  var org = hand.org;
  var tier = TIERS[org.tier];

  var caller = (function () {
    var f = r.pick(FIRST), l = r.pick(LAST), role = r.pick(ROLES);
    return { name: f + " " + l, title: role.title, dept: role.dept, savvy: role.savvy };
  })();

  /* Spec the machine coherently. A small-form-factor box does not ship with a
     650W supply and a 125W processor — building it that way produced tickets
     with no correct answer, because no real part fits an unreal machine. */
  var caseType = r.pick(["mid tower", "small form factor"]);
  var sff = caseType === "small form factor";
  var asset = {
    tag: "WS-" + r.pick(["FIN", "OPS", "ENG", "ADM", "CLI"]) + "-" + r.int(1000, 9999),
    age: r.int(2, 6),
    cpuTdp: sff ? r.pick([65, 95]) : r.pick([65, 95, 125]),
    socket: r.pick(["LGA1200", "AM4"]),
    ramType: "DDR4",
    ramSpeed: r.pick([2666, 3200]),
    ramCap: r.pick([8, 16]),
    psuWatts: sff ? r.pick([400, 450, 500]) : r.pick([450, 500, 650]),
    caseType: caseType,
    driveCap: r.pick([500, 1000]),
    driveIface: r.pick(["SATA", "NVMe"])
  };
  asset.caseMaxGpu = asset.caseType === "small form factor" ? 200 : 320;
  asset.caseMaxCooler = asset.caseType === "small form factor" ? 60 : 170;
  /* The measured peak is what the meter says the machine actually pulls, not
     what the old unit was labelled. This is the number the replacement has to
     clear, and it is deliberately close to the fitted supply's rating —
     which is why the supply is dying. */
  asset.peakDraw = Math.round(asset.psuWatts * (0.92 + rng() * 0.14));
  /* The failed card's own draw. A service call replaces like with like; it is
     not an opportunity to fit a flagship on the customer's invoice. */
  asset.gpuWatts = sff ? r.pick([75, 130]) : r.pick([75, 130, 170]);

  /* ---- urgency, and the tier it lands on ---- */
  /* How badly a fault hurts is a property of the site, not the part. A dead
     supply on the only machine that drives the label printer stops the line;
     the same fault on a spare at the next desk is an annoyance. The fault
     sets the typical severity, the site moves it, and the reason is shown so
     the student can see why the shipping call differs between two identical
     faults. */
  var STOPS = ["psu", "video", "cable", "apipa", "vlan", "gateway", "mdm", "digitizer",
    "vmram", "virtext", "licence", "printer", "phonemail", "wastepad", "fuser", "lapbatt", "lapssd", "backlight", "panel",
    "lapboard", "gpuart", "partialbl", "pumpfail", "noconnect", "open", "short",
    "pgdelay", "revpolarity", "circuitload", "brownout", "psufan", "frontpanel", "m2loose",
    "wrongsubnet", "portsec", "nicoff", "swollen", "profile", "mfa", "timedrift", "slowcloud", "mobiledns", "laptopvpn",
    "member2", "raid0", "nobackup", "foreign", "chipreset", "airlock",
    "queuestuck", "sharedoffline", "dhcpprinter", "portblocked", "traymedia",
    "neutralshare", "genset", "wrongslot", "cachedirty", "backplane", "vpnprinter",
    /* A machine that will not start at all, and an outlet that tests correct
       while having no ground behind it. Both stop the job dead. */
    "voltselector", "bootlegground",
    "diskfull", "thirdparty", "sysfiles", "dimmspeed", "gpuseat", "loop", "lapbios", "lapdisplaycable", "poeport", "labelswap", "fibrescratch", "dockdisplay"];
  var HALFWAY = ["drive", "thermal", "duplicate", "patch", "dns", "battery", "port", "storage",
    "vdi", "quota", "sync", "wifi", "vdicable", "syncdisk",
    "pickup", "encoder", "capping", "head", "belt",
    "lapram", "lapkbd", "driver", "projector",
    "lapthermal", "lapdc", "laptrack", "duplexjam", "exitjam", "regskew",
    "gearnoise", "platen", "feedenc", "ijfeed", "deadcolumn", "lampdim",
    "crossed", "longrun", "punchmiss", "split", "untwist", "revpair", "wrongcat",
    "railsag", "openground", "upsbattery", "upsoverload", "esdstatic", "stripchain",
    "gpufan", "nvmethermal", "duplex", "proxy", "speaker", "wificall", "backupfail", "snapshot", "backupwin", "region", "printerspool", "vdiprofile",
    "member1", "rebuildstall", "spareidle", "smallreplace", "bbu",
    "sepwear", "cleanblade", "tonerlow", "trayguide", "wrongmedia",
    "headstrike", "waterink", "carriagerail",
    "lapfan", "lapspeaker", "lapwebcam", "refresh", "burnin", "hdcp", "colourprofile",
    "emi", "bendradius",
    "wrongdriver", "spooler", "securedprint", "scanemail", "scanfolder", "discovery",
    "finishing", "ipconflict", "scansize",
    "surgedead", "psuwrongform", "upsselftest", "expandwrong", "rebuildslow",
    "psufanseized", "upsbypass", "upswaveform",
    "plugstrain", "solidplug", "staplecrush", "plenumjacket",
    "printquota", "sleepdrop", "ownport",
    "lappipeloose", "lapspeakerloom", "lapbatthealth", "lapadaptive", "lappowerplan",
    /* A port shut down, a cable that has failed, and a wireless network that
       will not carry a print job: all three stop the work dead. */
    "portdisabled", "usbfailed", "apisolation",
    "raidslow", "printpower", "scanstore", "backupdisk",
    "startupapp", "driverbad", "updateloop", "profilecorrupt", "servicedisabled",
    "pagefile", "devicecode10", "ramslot", "cpupaste", "fanheader", "dnsold", "hosts", "wifiband", "mtu"];
  var band = STOPS.indexOf(fault.key) !== -1
    ? r.pick(["down", "down", "down", "degraded"])
    : HALFWAY.indexOf(fault.key) !== -1
      ? r.pick(["degraded", "degraded", "down", "annoyance"])
      : r.pick(["annoyance", "annoyance", "degraded", "degraded", "down"]);
  var urgency = URGENCY[band];
  var URGENCY_WHY = {
    down: ["It is the only machine that drives the label printer.",
      "The whole of dispatch works off this one terminal.",
      "It runs the booking system and there is no second copy.",
      "Reception cannot check anyone in without it."],
    degraded: ["There is a spare at the next desk, but it is slower and shared.",
      "They can work off a laptop for now, badly.",
      "One person is blocked and the rest have found a way round it.",
      "The work is getting done, just at half the pace."],
    annoyance: ["It is a spare machine nobody depends on today.",
      "The user has a second machine and mostly uses that one.",
      "It only matters at month end, and that is three weeks away.",
      "Everyone has stopped mentioning it and started living with it."]
  };
  var urgencyWhy = r.pick(URGENCY_WHY[band]);

  /* ---- the caller's account, distorted ---- */
  var dKey = r.pick(Object.keys(DISTORTIONS));
  var distortion = DISTORTIONS[dKey];
  var trueObservation = fault.observable;
  var trueDay = r.int(0, 4);
  /* On the "nothing changed" ticket the change record has to actually hold
     the change, or the caller's omission is not an omission and the student
     has nothing to find. On the other three distortions the recent change is
     allowed to be unrelated — most changes are. */
  var causal = CHANGES.filter(function (c) { return c.relevant.indexOf(fault.key) !== -1; });
  /* EVERY FAULT NEEDS AT LEAST ONE CHANGE THAT CAUSED IT. On the "omission"
     distortion the caller leaves the change out, so the change record has to
     hold it — and a fault added without a line here used to hand `undefined`
     to the next statement and take the page down two screens later, with an
     error naming a property rather than the fault that was missing a line.
     If this ever fires again the message says which fault to write one for. */
  if (!causal.length) {
    throw new Error('no recent-change line names the fault "' + fault.key +
      '" — add one to CHANGES with it in `relevant`');
  }
  var change = dKey === "omission"
    ? r.pick(causal)
    : r.pick(causal.concat(CHANGES.filter(function (c) { return c.relevant.indexOf(fault.key) === -1; }).slice(0, 2)));
  var changeIsCause = change.relevant.indexOf(fault.key) !== -1;

  /* A caller names the thing they have already blamed. Some faults write that
     phrase with an article on it and some without, and the template supplies
     one \u2014 which produced "The the wireless password has gone." on every
     ticket whose distortion was a diagnosis. Strip whatever is there and let
     the sentence provide it. */
  var reflex = noArticle(String(fault.wrongReflex || "")
    .replace("gpu", "graphics card").replace("cpu", "processor"));

  var report;
  if (dKey === "diagnosis") {
    report = {
      quote: "The " + reflex + " has gone. It needs replacing. I've seen this before.",
      claimed: "the " + reflex + " has failed",
      buried: trueObservation,
      truth: fault.root
    };
  } else if (dKey === "omission") {
    report = {
      quote: "It just started doing it. Nothing's changed, nothing's different, we haven't touched anything.",
      claimed: "nothing changed before the fault appeared",
      buried: trueObservation,
      truth: change.text + " — which the caller does not think of as a change."
    };
  } else if (dKey === "timing") {
    report = {
      quote: "It's been doing this for months and we've just put up with it. It's got unbearable now.",
      claimed: "the fault has been present for months",
      buried: trueObservation,
      truth: "The logs show the first occurrence on " + dayName(trueDay) + " this week."
    };
  } else {
    report = {
      quote: "I'm calling for " + r.pick(FIRST) + " in " + caller.dept + ". They said it's broken and won't come on. I haven't seen it myself.",
      claimed: "a secondhand account of what the machine is doing",
      buried: trueObservation,
      truth: "The person who actually sat at the machine reports: " + trueObservation + "."
    };
  }
  report.distortion = distortion;

  /* ---- red herrings ---- */
  var herrings = r.some(RED_HERRINGS, 4);

  /* ---- the part that fixes it (hardware track only) ----
     The network track's step four grades a configuration against a
     reachability engine rather than a part against a catalogue, so none of
     the ordering machinery below applies to it. */
  var need = track === "hardware" ? correctPart(fault, asset) : { fits: [], why: {} };

  /* What the asset register knows. Step one needs something to check the
     caller's incidental claims against, or "confirmed" is a coin toss. */
  G_assetRecord = {
    tag: asset.tag,
    age: asset.age + " years old, " + (asset.age >= 4 ? "past" : "inside") + " the refresh window",
    lastService: r.pick(["never serviced", "cleaned and re-pasted 14 months ago",
      "memory upgraded 2 years ago", "moved between sites last summer"]),
    prior: r.pick([
      "Ticket 4821 last year — failed keyboard, replaced under warranty",
      "Ticket 5307 last year — user could not print, driver reinstalled",
      "Ticket 3990 two years ago — monitor swapped after a dead pixel column",
      "No previous tickets against this asset"
    ])
  };

  var G = {
    slot: slot, domain: track, track: track,
    /* Every instrument seeds off this. It moves with the session seed, so a
       shuffle changes the readings and not only the fault. */
    seedBase: (seed * 7919 + slot * 104729) >>> 0,
    org: org, tier: tier, tierKey: org.tier,
    caller: caller, asset: asset, fault: fault,
    urgency: urgency, urgencyWhy: urgencyWhy, report: report,
    change: change, changeIsCause: changeIsCause,
    trueDay: trueDay, herrings: herrings,
    t0: r.int(8, 15) * 3600 + r.int(0, 59) * 60,
    need: need,
    assetRecord: G_assetRecord,
    catalogue: track === "hardware" ? CATALOGUE[fault.partSpec] : [],
    shipping: requiredShipping(urgency, tier)
  };

  /* ---- the network track's own payload ---- */
  if (track === "network") {
    G.topo = buildTopology(r, fault);
    G.found = brokenConfig(r, fault, G.topo);
    G.want = correctConfig(G.topo, fault, G.found);
    G.action = correctAction(fault);
    G.mac = "AC:1F:6B:" + [r.int(16,255), r.int(16,255), r.int(16,255)]
      .map(function (x) { return x.toString(16).toUpperCase().padStart(2, "0"); }).join(":");
    G.switchPort = "Gi1/0/" + r.int(2, 46);
  }

  /* ---- the mobile track's own payload ---- */
  if (track === "mobile") {
    G.device = buildDevice(r, fault);
    G.repairCost = repairCost(G.device, fault);
    G.outcome = correctOutcome(G.device, fault);
    G.backup = backupFirst(G.device, fault);
  }

  /* ---- the cloud track's own payload ---- */
  if (track === "cloud") {
    G.host = buildHost(r, fault);
    G.found = {};
    G.host.guests.forEach(function (g) { G.found[g.name] = { ram: g.ram, cores: g.cores }; });
    G.want = correctAllocation(G.host);
    G.action = correctCloudAction(fault);
    G.spend = {
      lastMonth: r.int(2100, 4200), thisMonth: 0, budget: 0,
      idleTag: r.pick(["proj-harbour", "proj-kestrel", "migration-2025"])
    };
    G.spend.thisMonth = fault.key === "spend"
      ? Math.round(G.spend.lastMonth * (1.8 + rng() * 0.5))
      : Math.round(G.spend.lastMonth * (0.95 + rng() * 0.12));
    G.spend.budget = Math.round(G.spend.lastMonth * 1.15 / 50) * 50;
    G.quotaPct = fault.key === "quota" ? 100 : r.int(38, 74);
  }

  /* ---- the two printer tracks' own payload ---- */
  if (track === "laser" || track === "inkjet") {
    G.printer = buildPrinter(r, fault);
    G.procedure = correctProcedure(fault);
    G.touched = touchedParts(fault);
    /* On the repeating-defect ticket the part is not known until the student
       has measured the interval, so it is resolved from the machine rather
       than written down beside the fault. */
    G.partTarget = fault.key === "repeat"
      ? repeatMatch(G.printer, G.printer.repeatMm).key
      : printerTarget(fault);
  }

  /* ---- the laptop track's own payload ---- */
  if (track === "laptop") {
    G.laptop = buildLaptop(r, fault);
    G.procedure = laptopProcedure(fault);
    G.quote = laptopQuote(G.laptop, fault);
    G.partTarget = fault.target;
  }

  /* ---- the printer-networking track's own payload ---- */
  if (track === "printnet") {
    G.printnet = buildPrintSite(r, fault, org.tier);
    G.link = linkOf(fault);
    G.action = correctPrintnetAction(fault);
    G.partTarget = fault.target;
  }

  /* ---- the RAID track's own payload ---- */
  if (track === "raid") {
    G.array = buildArray(r, fault);
    G.class = classOf(fault);
    G.action = correctRaidAction(fault);
    /* Which slot the locate question points at is resolved from the array
       rather than written beside the fault, because on most of these
       tickets it is a different slot every time. */
    G.partTarget = raidTarget(G);
  }

  /* ---- the power track's own payload ---- */
  if (track === "power") {
    G.power = buildPower(r, fault);
    G.procedure = powerProcedure(fault);
    G.scope = scopeCall(fault);
    G.partTarget = fault.target;
  }

  /* ---- the cabling track's own payload ---- */
  if (track === "cabling") {
    G.cable = buildCable(r, fault);
    /* The standard to terminate to, and the order that satisfies it, are
       both derived from the site rather than written beside the fault. */
    G.standard = siteStandard(G);
    G.wire = correctOrder(G);
    G.partTarget = fault.target;
  }

  /* ---- the display track's own payload ---- */
  if (track === "display") {
    G.screen = buildScreen(r, fault);
    G.partTarget = fault.target;
  }

  /* ---- the mixed track's own payload ---- */
  if (track === "mixed") {
    G.verdicts = domainVerdicts({ fault: fault });
    G.scope = scopeSummary({ fault: fault });
    G.action = correctMixedAction(fault);
  }

  /* The tier sets the standing spending authority; the individual job gets a
     figure signed off against it, which is how purchasing actually works. A
     corporate site does not hand a tech $2,600 for a coin cell. Urgency lifts
     it, because a production outage loosens a purse that an annoyance does
     not. */
  G.budget = Math.round(tier.budget * (0.30 + rng() * 0.55) * (1 + (urgency.weight - 1) * 0.18) / 5) * 5;

  /* Sometimes the correct part costs more than the customer has approved.
     That is not a broken ticket, it is the most common hard conversation in
     the job. The answer is neither to overspend nor to fit something that
     does not do the work — it is to go back with the number. */
  var affordable = track !== "hardware" ? [{ _na: true }] : G.catalogue.filter(function (p) {
    return need.fits.indexOf(p.id) !== -1 && p.price <= G.budget;
  });
  var cheapestFit = (track !== "hardware" ? [] : G.catalogue.filter(function (p) { return need.fits.indexOf(p.id) !== -1; }))
    .reduce(function (lo, p) { return lo === null || p.price < lo.price ? p : lo; }, null);
  G.approval = {
    needed: affordable.length === 0,
    cheapestFit: cheapestFit,
    over: cheapestFit ? cheapestFit.price - G.budget : 0,
    why: affordable.length === 0
      ? "Every part that actually works costs more than " + org.name + " has approved. The cheapest correct option is "
        + cheapestFit.name + " at $" + cheapestFit.price + ", which is $" + (cheapestFit.price - G.budget)
        + " over the ceiling. Fitting something cheaper that does not do the job, or spending their money without asking, are both worse than a five-minute phone call."
      : "The correct part is within what this customer has approved, so no approval call is needed. Order it."
  };
  return G;
}

/* Which catalogue entries actually work in this machine. Returns the set of
   acceptable ids plus the reason each rejected part is wrong, so the build
   tile can explain itself rather than just scoring. */
/* Part names and reflex phrases in this build are written to read naturally
   in a sentence, so some of them carry their own article \u2014 "a battery bonded
   to the chassis", "an address that moved", "the fan". Every template that
   supplies an article has to strip whatever is already there, or the page
   prints "replaced the a battery bonded to the chassis". Exported because
   four separate files had the same bug independently. */
export function noArticle(s) { return String(s || "").replace(/^(the|a|an)\s+/i, ""); }

export function correctPart(fault, asset) {
  var list = CATALOGUE[fault.partSpec];
  var out = { fits: [], why: {} };
  list.forEach(function (p) {
    var s = p.spec, ok = true, why = "";
    if (fault.partSpec === "ram") {
      if (s.form === "SODIMM") { ok = false; why = "SODIMM is the laptop form factor. This is a desktop and the slots are UDIMM."; }
      else if (s.type !== asset.ramType) { ok = false; why = s.type + " will not physically seat in a " + asset.ramType + " slot — the notch is in a different place."; }
      else if (s.cap !== asset.ramCap) { ok = false; why = "The surviving stick is " + asset.ramCap + "GB. Mismatched capacities work, but you lose dual-channel and the customer paid for a matched pair."; }
      else if (s.speed < asset.ramSpeed) { ok = false; why = "Slower than the surviving stick — the pair would run down at " + s.speed + "."; }
    } else if (fault.partSpec === "psu") {
      var peak = asset.peakDraw;
      if (s.form !== "ATX" && asset.caseType !== "small form factor") { ok = false; why = "SFX is the small-form-factor size. It will not mount in a mid tower without a bracket."; }
      else if (asset.caseType === "small form factor" && s.form !== "SFX") { ok = false; why = "An ATX supply will not fit a small-form-factor case."; }
      else if (s.watts < peak * 1.2) { ok = false; why = s.watts + "W against a measured peak of " + peak + "W leaves no headroom. Supplies are rated at their limit, not their comfortable output — that is the fault you were called out for, bought again."; }
      else if (s.watts > peak * 2.2) { ok = false; why = s.watts + "W is more than double anything this machine can draw. It works, and the customer is paying for headroom nobody will ever use."; }
    } else if (fault.partSpec === "drive") {
      if (s.iface !== asset.driveIface) { ok = false; why = s.iface + " does not fit this machine's " + asset.driveIface + " boot device."; }
      else if (s.cap < asset.driveCap) { ok = false; why = "Smaller than the drive being replaced — the image will not fit."; }
      else if (s.cap > asset.driveCap * 2.5) { ok = false; why = "Several times the capacity in use. Fine technically, hard to justify on the invoice."; }
    } else if (fault.partSpec === "fan") {
      if (s.socket !== "both" && s.socket !== asset.socket) { ok = false; why = "Wrong socket — this machine is " + asset.socket + "."; }
      else if (s.tdp < asset.cpuTdp) { ok = false; why = "Rated for " + s.tdp + "W against a " + asset.cpuTdp + "W processor. You would be back next month."; }
      else if (s.height > asset.caseMaxCooler) { ok = false; why = s.height + "mm will not close the side panel on a " + asset.caseType + " (" + asset.caseMaxCooler + "mm clearance)."; }
      else if (s.tdp > asset.cpuTdp * 2.2) { ok = false; why = "Enormously over-specified for a " + asset.cpuTdp + "W processor."; }
    } else if (fault.partSpec === "gpu") {
      var headroom = asset.psuWatts - 150;
      if (s.watts > headroom) { ok = false; why = s.watts + "W against a " + asset.psuWatts + "W supply already feeding the rest of the machine. You would be replacing the supply too, and nobody approved that."; }
      else if (s.length > asset.caseMaxGpu) { ok = false; why = s.length + "mm will not physically fit a " + asset.caseType + " (" + asset.caseMaxGpu + "mm)."; }
      else if (s.watts < asset.gpuWatts * 0.7) { ok = false; why = "Slower than the " + asset.gpuWatts + "W card it replaces. The user's work would get worse, and they will call you again."; }
      else if (s.watts > asset.gpuWatts * 1.6) { ok = false; why = "Substantially faster than the " + asset.gpuWatts + "W card it replaces. A repair restores what they had — an upgrade is a quote, not a service call."; }
    } else if (fault.partSpec === "cable") {
      /* Four different faults order out of this bin, so what counts as the
         right part is a property of the fault rather than of the group. */
      var want = fault.needKind || "sata-data";
      if (s.kind !== want) {
        ok = false;
        why = {
          "sata-data": "The fault is on the data run. This is not a data cable.",
          "m2-screw": "The drive is healthy and seated in the right socket — what it has not got is the screw that holds it down. This is not that screw.",
          "m2-heatsink": "The drive is healthy and it is overheating. Nothing here takes heat out of it.",
          "fp-switch": "The fault is the button on the front of the case. Nothing here is that button.",
          "case-fan": "The fault is which header a case fan is on. Nothing here is a case fan."
        }[want];
      }
    } else if (fault.partSpec === "mobo") {
      /* Socket and memory are hard walls — the wrong one physically cannot
         be made to work. Form factor splits into two different failures: an
         ATX board will not go into a small case at all, while a smaller
         board will bolt into a big one and quietly cost the customer the
         slots they had. Both are wrong; only one of them is obvious. */
      var wantForm = asset.caseType === "small form factor" ? "microATX" : "ATX";
      if (s.socket !== asset.socket) {
        ok = false;
        why = "The processor in this machine is " + asset.socket + ". An " + s.socket +
          " board takes a different processor, and the one you have is not it — you would be " +
          "quoting for a processor as well, which nobody approved.";
      } else if (s.ram !== asset.ramType) {
        ok = false;
        why = "This machine's memory is " + asset.ramType + " and this board takes " + s.ram +
          ". The notch is in a different place, so the sticks in your hand will not seat.";
      } else if (s.form === "ATX" && wantForm !== "ATX") {
        ok = false;
        why = "A full ATX board will not go into a " + asset.caseType +
          ". The standoffs are not there and the rear cut-out is the wrong size.";
      } else if (s.form !== wantForm) {
        ok = false;
        why = "It will bolt in, and it is a smaller board than the one coming out — " +
          "fewer memory slots and fewer expansion slots than the customer had this morning. " +
          "A repair puts them back where they were.";
      } else if (s.pro) {
        ok = false;
        why = "A workstation board with two network ports and ten drive channels, going into a " +
          "machine that uses one of each. It fits and it works, and you are billing for it.";
      }
    } else if (fault.partSpec === "cmos") {
      if (s.kind !== "CR2032") { ok = false; why = "Wrong cell size. The board takes a CR2032."; }
    }
    if (ok) out.fits.push(p.id); else out.why[p.id] = why;
  });
  return out;
}

/* Urgency decides the shipping the customer is entitled to; tier decides
   whether they can have it. Both have to line up. */
export function requiredShipping(urgency, tier) {
  if (urgency.key === "down" && tier.overnightOk) return { key: "overnight", why: "Production is down and this customer's tier supports it. The shipping cost is smaller than another day of lost work." };
  if (urgency.key === "down") return { key: "standard", why: "Production is down, but this customer has no budget for expedited shipping. Say so plainly and offer a loaner or a workaround instead of spending money they have not got." };
  if (urgency.key === "degraded") return { key: tier.shipDefault, why: "They can work around it. Expedited shipping on a machine that still runs is money spent to feel busy." };
  return { key: "standard", why: "Nobody is blocked. Standard shipping, and it goes on the next scheduled visit." };
}

export { HARDWARE_FAULTS, RED_HERRINGS, ORGS };
