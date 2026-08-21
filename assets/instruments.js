/* =====================================================================
   Field Service Center — instruments

   The ticket object is the truth; this file is what the truth looks like
   through the things a technician can actually read. POST behaviour, SMART
   attributes, the event log, temperatures and fan speeds, the change
   record, and the bench tests available at step three.

   Two rules hold everywhere in here:

   1. The fault's signature has to be genuinely READABLE. If a student
      works the instruments properly they arrive at the right part without
      being told. Nothing is hidden that the evidence would not hide.

   2. The noise has to be genuinely ORDINARY. Every red herring is
      something that appears on healthy machines every day. A student who
      chases one has made a real mistake, not fallen for a trick.
   ===================================================================== */
import { mulberry32, dayName, CHANGE_FILLER } from "./ticket.js";

/* Every instrument seeds off G.seedBase, which moves with the session seed as
   well as the ticket number. Seeding on the ticket number alone meant ticket
   one showed the same SMART values, the same event-log noise, the same
   temperatures and the same bench-test order after every shuffle — only the
   fault and the customer changed, and a class that had seen ticket one once
   had seen its instruments for good. */

function R(seed) {
  var rng = mulberry32(seed);
  return {
    int: (a, b) => a + Math.floor(rng() * (b - a + 1)),
    pick: (a) => a[Math.floor(rng() * a.length)],
    shuffle: (a) => { var x = a.slice(); for (var i = x.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = x[i]; x[i] = x[j]; x[j] = t; } return x; }
  };
}

/* ---------------- POST and front-panel behaviour ---------------- */
export function postReport(G) {
  var f = G.fault;
  return {
    beeps: f.post.beeps,
    meaning: f.post.meaning,
    powerLed: f.key === "psu" ? "flashes amber, then off" : "solid white",
    driveLed: f.key === "drive" ? "solid, does not flicker" :
      f.key === "cable" ? "dark on the failing boots" : "flickers normally",
    display: f.key === "video" ? "No signal on any input" :
      f.key === "cable" ? "Reaches POST, then: no boot device found" :
        f.key === "cmos" ? "POST warning: system configuration reset, date/time not set" :
          "Reaches the desktop",
    fansSpin: f.key === "psu" ? "spin up for about a second, then stop" : "spin up and stay running"
  };
}

/* ---------------- SMART ----------------
   Two drives so there is something to compare against. The failing-drive
   ticket puts reallocated and pending sectors on the boot disk. The cable
   ticket is the one worth studying: CRC errors climb, and every other
   attribute is spotless — because the disk is fine and its connection is
   not. That distinction is the whole lesson of that ticket. */
export function smartRows(G) {
  var r = R(G.seedBase + 31);
  var failing = G.fault.key === "drive";
  var cabling = G.fault.key === "cable";
  var hours = r.int(19000, 41000);

  function disk(name, cap, primary) {
    var reall = primary && failing ? r.int(180, 940) : 0;
    var pend = primary && failing ? r.int(8, 64) : 0;
    var crc = primary && cabling ? r.int(240, 1900) : 0;
    return {
      name: name, cap: cap, primary: primary,
      rows: [
        { id: "05", attr: "Reallocated sector count", value: reall, threshold: 0,
          bad: reall > 0, note: reall > 0 ? "Sectors the drive has retired and replaced from its spare pool." : "" },
        { id: "C5", attr: "Current pending sector count", value: pend, threshold: 0,
          bad: pend > 0, note: pend > 0 ? "Sectors it cannot read and has not yet been able to reallocate." : "" },
        { id: "C7", attr: "UDMA CRC error count", value: crc, threshold: 0,
          bad: crc > 0, note: crc > 0 ? "Data corrupted in transit between drive and controller. This is a cabling attribute, not a platter attribute." : "" },
        { id: "09", attr: "Power-on hours", value: primary ? hours : hours - r.int(2000, 6000), threshold: null,
          bad: false, note: "" },
        { id: "BB", attr: "Reported uncorrectable errors", value: primary && failing ? r.int(1, 12) : 0,
          threshold: 0, bad: primary && failing, note: "" },
        { id: "C2", attr: "Temperature (°C)", value: r.int(31, 42), threshold: null, bad: false, note: "" }
      ],
      verdict: primary && failing ? "CAUTION" : "OK"
    };
  }

  return [
    disk(G.asset.driveIface === "NVMe" ? "nvme0n1 (boot)" : "sda (boot)", G.asset.driveCap + "GB", true),
    disk("sdb (data)", "2000GB", false)
  ];
}

/* ---------------- event log ----------------
   Mostly ordinary. Every Windows machine on earth logs most of these, and
   a student who reads a full event log as "this machine is dying" has
   learned the wrong thing. The fault's own entries are in here, dated to
   the real first occurrence — which is what settles the caller's timing
   claim when they say it has been going on for months. */
const BENIGN_EVENTS = [
  { level: "Error", src: "DistributedCOM", id: 10016, msg: "The application-specific permission settings do not grant Local Activation permission" },
  { level: "Warning", src: "Group Policy", id: 1500, msg: "Group Policy processing took longer than expected" },
  { level: "Information", src: "Windows Update", id: 19, msg: "Cumulative update installed successfully" },
  { level: "Warning", src: "Dhcp-Client", id: 1003, msg: "Lease renewal deferred, retrying" },
  { level: "Error", src: "Service Control Manager", id: 7031, msg: "A service terminated unexpectedly and was restarted" },
  { level: "Information", src: "Defender", id: 1001, msg: "Scheduled scan completed, no threats" },
  { level: "Warning", src: "Print Spooler", id: 372, msg: "The document failed to print and was resubmitted" },
  { level: "Information", src: "User Profile Service", id: 2, msg: "Roaming profile loaded" },
  { level: "Warning", src: "Kernel-PnP", id: 219, msg: "A driver could not load for a device" },
  { level: "Error", src: "Application Error", id: 1000, msg: "A user-mode application stopped working" },
  { level: "Warning", src: "Time-Service", id: 129, msg: "NtpClient could not reach a manually configured peer" },
  { level: "Information", src: "BITS", id: 3, msg: "Transfer job completed" },
  { level: "Warning", src: "WLAN-AutoConfig", id: 4003, msg: "Failed to connect to a wireless network, retried" },
  { level: "Information", src: "Winlogon", id: 7001, msg: "User logon notification received" }
];

const FAULT_EVENTS = {
  ram: [
    { level: "Critical", src: "WHEA-Logger", id: 18, msg: "A corrected hardware error occurred in a memory module" },
    { level: "Critical", src: "BugCheck", id: 1001, msg: "The computer restarted after a bugcheck: 0x0000001A MEMORY_MANAGEMENT" },
    { level: "Critical", src: "BugCheck", id: 1001, msg: "The computer restarted after a bugcheck: 0x0000004E PFN_LIST_CORRUPT" }
  ],
  psu: [
    { level: "Critical", src: "Kernel-Power", id: 41, msg: "The system rebooted without cleanly shutting down first" },
    { level: "Critical", src: "Kernel-Power", id: 41, msg: "The system rebooted without cleanly shutting down first" },
    { level: "Warning", src: "Kernel-Boot", id: 29, msg: "The previous shutdown was unexpected" }
  ],
  drive: [
    { level: "Error", src: "disk", id: 7, msg: "The device has a bad block" },
    { level: "Error", src: "Ntfs", id: 55, msg: "The file system structure on the volume needs to be checked" },
    { level: "Warning", src: "disk", id: 153, msg: "The IO operation was retried" }
  ],
  thermal: [
    { level: "Warning", src: "Kernel-Processor-Power", id: 37, msg: "The speed of the processor has been limited by thermal conditions" },
    { level: "Critical", src: "Kernel-Power", id: 41, msg: "The system rebooted without cleanly shutting down first" },
    { level: "Warning", src: "Kernel-Processor-Power", id: 37, msg: "The speed of the processor has been limited by thermal conditions" }
  ],
  video: [
    { level: "Error", src: "Display", id: 4101, msg: "Display driver stopped responding and has recovered" },
    { level: "Error", src: "Display", id: 4101, msg: "Display driver stopped responding and has recovered" },
    { level: "Critical", src: "Kernel-Power", id: 41, msg: "The system rebooted without cleanly shutting down first" }
  ],
  cable: [
    { level: "Warning", src: "storahci", id: 129, msg: "Reset to device, \\Device\\RaidPort0, was issued" },
    { level: "Error", src: "disk", id: 157, msg: "Disk has been surprise removed" },
    { level: "Warning", src: "storahci", id: 129, msg: "Reset to device, \\Device\\RaidPort0, was issued" }
  ],
  cmos: [
    { level: "Information", src: "Kernel-General", id: 1, msg: "The system time changed by more than an hour" },
    { level: "Warning", src: "Time-Service", id: 134, msg: "Rejected a time sample because the local clock is too far out" },
    { level: "Information", src: "Kernel-General", id: 1, msg: "The system time changed by more than an hour" }
  ]
};

export function eventRows(G) {
  var r = R(G.seedBase + 43);
  var rows = [];
  // the fault's own entries, none of them older than the real first occurrence
  FAULT_EVENTS[G.fault.key].forEach(function (e, i) {
    rows.push(Object.assign({}, e, {
      day: G.trueDay + Math.floor(i / 2),
      t: G.t0 - r.int(600, 20000),
      _t: "fault"
    }));
  });
  // ordinary traffic, spread across the last fortnight
  r.shuffle(BENIGN_EVENTS).slice(0, 7).forEach(function (e) {
    rows.push(Object.assign({}, e, {
      day: r.int(-9, 4), t: r.int(7, 18) * 3600 + r.int(0, 59) * 60, _t: "benign"
    }));
  });
  rows.sort(function (a, b) { return a.day - b.day || a.t - b.t; });
  return rows;
}

/* First time the machine complained. This is the number that settles a
   caller who says it has been happening for months. */
export function firstOccurrence(G) {
  return { day: G.trueDay, label: dayName(G.trueDay) + " this week" };
}

/* ---------------- temperatures and fans ---------------- */
export function thermalRows(G) {
  var r = R(G.seedBase + 61);
  var hot = G.fault.key === "thermal";
  return {
    rows: [
      { name: "CPU package", idle: hot ? r.int(62, 71) : r.int(31, 41),
        load: hot ? r.int(97, 100) : r.int(58, 74), limit: 100, bad: hot },
      { name: "Graphics", idle: r.int(33, 44), load: r.int(61, 76), limit: 92, bad: false },
      { name: "Motherboard", idle: r.int(28, 34), load: r.int(36, 45), limit: 80, bad: false }
    ],
    fans: [
      { name: "CPU fan", rpm: hot ? 0 : r.int(900, 1600), expect: "900–1800", bad: hot },
      { name: "Case intake", rpm: r.int(700, 1200), expect: "600–1400", bad: false },
      { name: "Case exhaust", rpm: r.int(700, 1200), expect: "600–1400", bad: false }
    ],
    throttling: hot
  };
}

/* ---------------- change record ----------------
   The thing the caller did not mention. Present on every ticket, because
   "what changed" is asked on every ticket — but only one entry is ever the
   cause, and on the other three distortions none of them are. */
export function changeRows(G) {
  var r = R(G.seedBase + 71);
  var filler = CHANGE_FILLER;
  var rows = [{ day: G.trueDay - r.int(1, 3), text: G.change.text, _t: G.changeIsCause ? "cause" : "benign" }];
  r.shuffle(filler).slice(0, 4).forEach(function (t) {
    rows.push({ day: r.int(-11, 3), text: t, _t: "benign" });
  });
  rows.sort(function (a, b) { return a.day - b.day; });
  return rows;
}

/* ---------------- the caller's claims ----------------
   Step one, and the reason this page exists. Four claims. One is the
   caller's headline and it is wrong, and the evidence that settles it is
   named. One is the observation buried underneath it and it holds up. One
   is true and completely beside the point, because a caller who is wrong
   about the fault is not wrong about everything. And one genuinely cannot
   be settled from anything on this page, so "can't tell from here" has to
   be a real answer rather than a dodge. */
export function callerClaims(G) {
  var r = R(G.seedBase + 83);
  var d = G.report.distortion.key;
  var claims = [];

  if (d === "diagnosis") {
    claims.push({
      text: "The " + G.fault.wrongReflex.replace("gpu", "graphics card").replace("cpu", "processor") + " has failed and needs replacing",
      verdict: "contradicted", source: "Bench tests and the instruments",
      why: G.fault.wrongWhy
    });
  } else if (d === "omission") {
    claims.push({
      text: "Nothing changed before this started",
      verdict: "contradicted", source: "Change record",
      why: "The change record shows: " + G.change.text + ". Callers do not think of that as a change, which is exactly why the methodology asks."
    });
  } else if (d === "timing") {
    claims.push({
      text: "It has been doing this for months",
      verdict: "contradicted", source: "Event log",
      why: "The first entry of this kind is " + dayName(G.trueDay) + " this week. People compress time when something is irritating."
    });
  } else {
    claims.push({
      text: "The machine will not come on at all",
      verdict: "contradicted", source: "POST and boot behaviour",
      why: "It is a secondhand account. The machine does power on. What it actually shows is: " + G.fault.observable + "."
    });
  }

  claims.push({
    text: "What it is actually doing: " + G.fault.observable,
    verdict: "confirmed", source: "Event log and bench tests",
    why: "This is the observation worth keeping. It survived the retelling and the instruments back it up."
  });

  claims.push({
    text: r.pick([
      "This machine is " + G.asset.age + " years old",
      "This machine has been worked on before",
      "This machine is on the asset register as " + G.assetRecord.tag
    ]),
    verdict: "confirmed", source: "Asset record",
    why: "True, checkable, and beside the point. A caller who is wrong about the fault is not wrong about everything, and dismissing them wholesale is its own mistake."
  });

  claims.push({
    text: r.pick([
      "Nobody else in the office is having the same trouble",
      "It only happens when the accounting package is open",
      "It is noticeably louder than it was a year ago",
      "It never does it when somebody is watching"
    ]),
    verdict: "unknown", source: "—",
    why: "Nothing on this page settles it. You would have to ask, or watch it. Marking it confirmed or contradicted is guessing, and guessing is what got the caller here."
  });

  return r.shuffle(claims);
}

/* ---------------- bench tests (step three) ----------------
   Test the theory. One test isolates this fault; the rest are honest work
   that tells you nothing about it. Choosing well is the difference between
   a twenty-minute call and an afternoon. */
const TESTS = [
  { key: "onestick", label: "Boot with one memory module at a time", mins: 15, isolates: "ram",
    hit: "Boots and stays up on the second module alone. Fails within a minute on the first.",
    miss: "Boots identically on either module. No change." },
  { key: "psuswap", label: "Substitute a known-good power supply", mins: 25, isolates: "psu",
    hit: "Runs a full load test without dropping. The fault does not follow the machine.",
    miss: "Behaves exactly the same on the substitute supply." },
  { key: "smarttest", label: "Run the drive's extended self-test", mins: 45, isolates: "drive",
    hit: "Fails at 40% with a read element failure.",
    miss: "Completes without error." },
  { key: "recable", label: "Reseat and substitute the SATA data cable", mins: 5, isolates: "cable",
    hit: "Twenty consecutive clean boots, and the CRC count stops climbing.",
    miss: "Still intermittent on a new cable." },
  { key: "igpu", label: "Move the display to the integrated graphics output", mins: 5, isolates: "video",
    hit: "Picture returns immediately on the same monitor and cable.",
    miss: "Still no signal on the integrated output either." },
  { key: "loadtemp", label: "Watch temperatures and fan speed under sustained load", mins: 20, isolates: "thermal",
    hit: "CPU reaches 99°C in four minutes, clocks drop by half, CPU fan reads zero throughout.",
    miss: "Peaks in the low seventies with the fan ramping normally." },
  { key: "coincell", label: "Fit a fresh coin cell and cold-boot twice", mins: 10, isolates: "cmos",
    hit: "Clock and boot order survive being unplugged overnight.",
    miss: "Settings still reset on the next cold start." },
  { key: "reimage", label: "Reimage the machine from the standard build", mins: 90, isolates: null,
    hit: "", miss: "Same behaviour on a clean image. You have spent ninety minutes proving it is not software." },
  { key: "updates", label: "Roll back last month's updates", mins: 30, isolates: null,
    hit: "", miss: "No change. The symptom predates the update and follows the hardware." },
  { key: "newprofile", label: "Create a fresh user profile and sign in", mins: 10, isolates: null,
    hit: "", miss: "Identical on a new profile. Nothing here is user-specific." }
];

export function benchTests(G) {
  var r = R(G.seedBase + 97);
  var right = TESTS.filter(function (t) { return t.isolates === G.fault.key; });
  var wrong = r.shuffle(TESTS.filter(function (t) { return t.isolates !== G.fault.key; })).slice(0, 4);
  return r.shuffle(right.concat(wrong)).map(function (t) {
    return {
      key: t.key, label: t.label, mins: t.mins,
      isolating: t.isolates === G.fault.key,
      result: t.isolates === G.fault.key ? t.hit : t.miss
    };
  });
}

export { TESTS };
