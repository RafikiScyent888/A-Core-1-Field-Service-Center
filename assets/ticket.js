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
    key: "ram", part: "memory module", objective: "3.2 / 5.2",
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
    key: "psu", part: "power supply", objective: "3.5 / 5.2",
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
    key: "drive", part: "storage drive", objective: "3.3 / 5.3",
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
    key: "thermal", part: "cooling", objective: "3.4 / 5.2",
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
    key: "video", part: "graphics output", objective: "3.4 / 5.4",
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
    key: "cable", part: "SATA data cable", objective: "3.3 / 5.3",
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
    key: "cmos", part: "CMOS battery", objective: "3.4 / 5.2",
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
  { text: "The machine sat unplugged in storage for four months", relevant: ["cmos"] },
  { text: "A standing desk was installed and the tower now sits on the floor", relevant: ["thermal"] }
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
  cable: [
    { id: "C-1", name: "SATA data cable, straight, 45cm", price: 4, spec: { kind: "sata-data" } },
    { id: "C-2", name: "SATA data cable, right-angle, 30cm", price: 5, spec: { kind: "sata-data" } },
    { id: "C-3", name: "SATA power splitter", price: 6, spec: { kind: "sata-power" } },
    { id: "C-4", name: "M.2 mounting screw kit", price: 3, spec: { kind: "m2-screw" } }
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
export function dealHardware(seed) {
  var r = R(mulberry32(seed * 2654435761));
  var pool = [];
  HARDWARE_FAULTS.forEach(function (f) {
    ORGS.forEach(function (o) { pool.push({ fault: f, org: o }); });
  });
  // one ticket per fault key, so all seven fault types are reachable and
  // the five dealt are always distinct
  var byFault = {};
  r.shuffle(pool).forEach(function (p) { if (!byFault[p.fault.key]) byFault[p.fault.key] = p; });
  return r.shuffle(Object.keys(byFault).map(function (k) { return byFault[k]; }));
}

export function buildTicket(seed, slot) {
  var G_assetRecord;
  var rng = mulberry32(seed * 7919 + slot * 104729);
  var r = R(rng);
  var hand = dealHardware(seed)[(slot - 1) % 5];
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
  var STOPS = ["psu", "video", "cable"];
  var HALFWAY = ["drive", "thermal"];
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
  var change = dKey === "omission"
    ? r.pick(causal)
    : r.pick(causal.concat(CHANGES.filter(function (c) { return c.relevant.indexOf(fault.key) === -1; }).slice(0, 2)));
  var changeIsCause = change.relevant.indexOf(fault.key) !== -1;

  var report;
  if (dKey === "diagnosis") {
    report = {
      quote: "The " + fault.wrongReflex.replace("gpu", "graphics card").replace("cpu", "processor")
        + " has gone. It needs replacing. I've seen this before.",
      claimed: "the " + fault.wrongReflex.replace("gpu", "graphics card").replace("cpu", "processor") + " has failed",
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

  /* ---- the part that fixes it ---- */
  var need = correctPart(fault, asset);

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
    slot: slot, domain: "hardware",
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
    catalogue: CATALOGUE[fault.partSpec],
    shipping: requiredShipping(urgency, tier)
  };

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
  var affordable = G.catalogue.filter(function (p) {
    return need.fits.indexOf(p.id) !== -1 && p.price <= G.budget;
  });
  var cheapestFit = G.catalogue.filter(function (p) { return need.fits.indexOf(p.id) !== -1; })
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
      if (s.kind !== "sata-data") { ok = false; why = "Wrong cable entirely — the fault is on the data run, not power or mounting."; }
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
