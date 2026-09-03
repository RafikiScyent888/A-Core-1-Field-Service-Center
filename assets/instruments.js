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
import { noArticle } from "./ticket.js";

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
    powerLed: f.key === "psu" ? "flashes amber, then off"
      : f.key === "frontpanel" ? "nothing at all on most presses of the button"
      : f.key === "psufan" ? "solid white until it stops, then dark" : "solid white",
    driveLed: f.key === "drive" ? "solid, does not flicker"
      : f.key === "cable" ? "dark on the failing boots"
      : f.key === "m2loose" ? "dark on the boots that fail, normal on the ones that do not"
      : "flickers normally",
    display: f.key === "video" ? "No signal on any input"
      : f.key === "cable" ? "Reaches POST, then: no boot device found"
      : f.key === "m2loose" ? "Reaches POST, then: no boot device found, on about one start in three"
      : f.key === "cmos" ? "POST warning: system configuration reset, date/time not set"
      : f.key === "gpufan" ? "Reaches the desktop; blocks and tearing once a 3D load starts"
      : f.key === "frontpanel" ? "Nothing, on the presses that do not start it"
      : "Reaches the desktop",
    fansSpin: f.key === "psu" ? "spin up for about a second, then stop"
      : f.key === "psufan" ? "case fans spin normally; nothing audible from the supply itself"
      : f.key === "gpufan" ? "case and CPU fans spin; neither graphics fan turns"
      : "spin up and stay running"
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
  /* The three new drive-adjacent faults all leave SMART spotless, which is
     the point of every one of them: a healthy drive can still be the reason
     the machine is misbehaving. */
  var thermalDrive = G.fault.key === "nvmethermal";
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
        { id: "C2", attr: "Drive temperature under sustained write", value: primary && thermalDrive ? r.int(82, 89) : r.int(38, 51),
          threshold: 70, bad: primary && thermalDrive,
          note: primary && thermalDrive ? "Above the controller's throttling threshold. The drive is protecting itself by slowing down." : "" },
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
  ],
  psufan: [
    { level: "Critical", src: "Kernel-Power", id: 41, msg: "The system rebooted without cleanly shutting down first" },
    { level: "Critical", src: "Kernel-Power", id: 41, msg: "The system rebooted without cleanly shutting down first" },
    { level: "Information", src: "Kernel-Boot", id: 20, msg: "Boot completed after an unexpected power loss" }
  ],
  gpufan: [
    { level: "Error", src: "Display", id: 4101, msg: "Display driver stopped responding and has recovered" },
    { level: "Warning", src: "Display", id: 4, msg: "Graphics adapter reported a thermal throttling event" },
    { level: "Error", src: "Display", id: 4101, msg: "Display driver stopped responding and has recovered" }
  ],
  nvmethermal: [
    { level: "Warning", src: "disk", id: 153, msg: "The IO operation was retried" },
    { level: "Warning", src: "stornvme", id: 11, msg: "The driver detected a controller error and reduced throughput" },
    { level: "Warning", src: "disk", id: 153, msg: "The IO operation was retried" }
  ],
  m2loose: [
    { level: "Error", src: "disk", id: 157, msg: "Disk has been surprise removed" },
    { level: "Warning", src: "stornvme", id: 129, msg: "Reset to device was issued" },
    { level: "Error", src: "disk", id: 157, msg: "Disk has been surprise removed" }
  ],
  /* The front-panel ticket has nothing in the log at all, because a machine
     that never started never wrote anything. That absence is evidence. */
  frontpanel: [],
  ramslot: [
    { level: "Information", src: "Kernel-General", id: 1, msg: "Installed physical memory changed since last boot" },
    { level: "Warning", src: "Kernel-Boot", id: 20, msg: "Memory configuration differs from the previous session" },
    { level: "Information", src: "Kernel-General", id: 1, msg: "Installed physical memory changed since last boot" }
  ],
  cpupaste: [
    { level: "Warning", src: "Kernel-Processor-Power", id: 37, msg: "The processor has been throttled by thermal constraints" },
    { level: "Warning", src: "Kernel-Processor-Power", id: 37, msg: "The processor has been throttled by thermal constraints" },
    { level: "Critical", src: "Kernel-Power", id: 41, msg: "The system rebooted without cleanly shutting down first" }
  ],
  /* A machine whose processor supply collapses under load logs the same
     thing a machine with a dying power supply logs, which is the point:
     these two entries do not tell the two apart. The capacitors do. */
  bulgecap: [
    { level: "Critical", src: "WHEA-Logger", id: 18, msg: "A fatal hardware error has occurred" },
    { level: "Critical", src: "Kernel-Power", id: 41, msg: "The system rebooted without cleanly shutting down first" },
    { level: "Critical", src: "Kernel-Power", id: 41, msg: "The system rebooted without cleanly shutting down first" }
  ],
  dimmspeed: [
    { level: "Critical", src: "WHEA-Logger", id: 18, msg: "A fatal hardware error has occurred" },
    { level: "Critical", src: "Kernel-Power", id: 41, msg: "The system rebooted without cleanly shutting down first" },
    { level: "Warning", src: "Kernel-General", id: 1, msg: "Memory training completed at a reduced speed" }
  ],
  gpuseat: [
    { level: "Error", src: "Display", id: 4101, msg: "Display driver stopped responding and has recovered" },
    { level: "Warning", src: "Kernel-PnP", id: 219, msg: "A device was removed unexpectedly" },
    { level: "Error", src: "Display", id: 4101, msg: "Display driver stopped responding and has recovered" }
  ],
  /* Nothing at all. A fan that is too loud has never once been an error. */
  fanheader: []
};

export function eventRows(G) {
  var r = R(G.seedBase + 43);
  var rows = [];
  /* The fault's own entries, none of them older than the real first
     occurrence. A fault with no entries is legitimate — a machine that never
     started has nothing to say — but a fault MISSING from this table is a
     bug, so it is treated as one rather than silently producing no rows. */
  var own = FAULT_EVENTS[G.fault.key];
  if (!own) throw new Error("no event fingerprint defined for fault: " + G.fault.key);
  own.forEach(function (e, i) {
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
  /* Two faults put the processor at its limit and they look nothing alike on
     this panel: one has a dead fan, the other has a fan turning perfectly. */
  var hot = G.fault.key === "thermal" || G.fault.key === "cpupaste";
  var deadFan = G.fault.key === "thermal";
  var gpuHot = G.fault.key === "gpufan";
  var loudFan = G.fault.key === "fanheader";
  return {
    rows: [
      { name: "CPU package", idle: hot ? r.int(62, 71) : r.int(31, 41),
        load: hot ? r.int(97, 100) : r.int(58, 74), limit: 100, bad: hot },
      { name: "Graphics", idle: gpuHot ? r.int(52, 61) : r.int(33, 44),
        load: gpuHot ? r.int(90, 92) : r.int(61, 76), limit: 92, bad: gpuHot },
      { name: "Motherboard", idle: r.int(28, 34), load: r.int(36, 45), limit: 80, bad: false }
    ],
    fans: [
      { name: "CPU fan", rpm: deadFan ? 0 : r.int(900, 1600), expect: "900–1800", bad: deadFan },
      { name: "Graphics fans", rpm: gpuHot ? 0 : r.int(1100, 2100), expect: "1000–2400", bad: gpuHot },
      { name: "Case intake", rpm: loudFan ? r.int(2200, 2600) : r.int(700, 1200),
        expect: "600–1400", bad: loudFan },
      { name: "Case exhaust", rpm: r.int(700, 1200), expect: "600–1400", bad: false }
    ],
    throttling: hot || gpuHot
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
      /* Same article problem as the caller's quote and the step-6 summary:
         the sentence supplies "The", so the phrase must not bring its own. */
      text: "The " + noArticle(G.fault.wrongReflex.replace("gpu", "graphics card").replace("cpu", "processor")) + " has failed and needs replacing",
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
  { key: "slotswap", label: "Move each module into each slot in turn and read the reported total", mins: 18, isolates: "ramslot",
    hit: "Either module reports its full size in the other slots and neither is seen in this one. Two good modules and one slot that kills both of them.",
    miss: "Every module reports correctly in every slot." },
  { key: "heatsinkfeel", label: "Load it, then compare the processor temperature with the heatsink's own", mins: 14, isolates: "cpupaste",
    hit: "The processor is at its limit and the heatsink is barely warm, with the fan turning at the right speed. The heat is not getting out of the processor into the metal.",
    miss: "The heatsink warms with the processor as it should." },
  { key: "specmodules", label: "Read each module's type, speed and capacity and compare them", mins: 9, isolates: "dimmspeed",
    hit: "The two modules are different speeds, and the board has trained the pair down to the slower one. On the original module alone it runs for days.",
    miss: "Both modules are the same type, speed and capacity." },
  /* The only test on this track you run with a torch instead of a tool. It
     is cheap, it is fast, and on nine tickets out of ten it finds nothing —
     which is exactly why it belongs in the list rather than being a hint. */
  { key: "boardlook", label: "Light the board and inspect the capacitor bank around the processor socket", mins: 8, isolates: "bulgecap",
    hit: "Five of the seven cans beside the socket are domed rather than flat-topped, and one has split at the score on its top and dried brown down the side. The rails they smooth feed the processor.",
    miss: "Every capacitor on the board is flat-topped, clean and dry." },
  { key: "pressdown", label: "Press the card down in its slot while watching the picture", mins: 5, isolates: "gpuseat",
    hit: "The picture returns the moment the card is pressed home and drops again when the chassis is knocked. It has lifted at the rear of the slot.",
    miss: "No change to the picture however hard the card is pressed." },
  { key: "fanheaderlook", label: "Check which header each fan is on and read its controlled speed", mins: 7, isolates: "fanheader",
    hit: "The noisy fan is on a header the board does not control, so it runs flat out regardless \u2014 on a machine whose every temperature is normal.",
    miss: "Every fan is on a controlled header and ramping with temperature." },
  { key: "psuheat", label: "Run it until it stops, then feel the supply and read every temperature", mins: 30, isolates: "psufan",
    hit: "The machine stops after twenty-two minutes with every sensor in the machine reading normal, and the supply itself is too hot to keep a hand on.",
    miss: "It runs for an hour without stopping and the supply stays barely warm." },
  { key: "gpuload", label: "Put a 3D load on it and watch the card's own temperature and fans", mins: 12, isolates: "gpufan",
    hit: "The card reaches its limit inside a minute with both of its fans reading zero, and clocks halve.",
    miss: "The card warms up, its fans ramp, and it holds its clocks." },
  { key: "bigcopy", label: "Copy a large file and watch the transfer rate all the way through", mins: 8, isolates: "nvmethermal",
    hit: "Full speed for the first thirty seconds, then it collapses to a fraction of it — and recovers completely after five minutes idle.",
    miss: "The transfer holds its rate from the first second to the last." },
  { key: "pressm2", label: "Press down on the drive and restart it twenty times", mins: 10, isolates: "m2loose",
    hit: "Twenty clean boots while it is held down, and it drops out again the first time the case is nudged.",
    miss: "No change either way. It boots the same whether it is pressed or not." },
  { key: "shortheader", label: "Short the power header with a screwdriver instead of using the button", mins: 4, isolates: "frontpanel",
    hit: "Starts first time, every time, from the header. From the button it takes about ten presses.",
    miss: "Behaves exactly the same from the header as from the button." },
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

/* =====================================================================
   Networking track instruments

   The hardware track reads POST codes and SMART. This one reads what a
   technician actually types at a command prompt, plus the two things only
   the switch can tell you. Same two rules: the fault's signature is
   genuinely readable, and the noise is genuinely ordinary.
   ===================================================================== */

/* ipconfig /all, as found. This is where four of the seven faults are
   visible if you read it properly, and it is the first thing a tech should
   look at rather than the last. */
export function ipconfigRows(G) {
  var c = G.found, t = G.topo;
  var f = G.fault.key;
  return [
    { k: "Connection state", v: f === "nicoff" ? "Media disconnected (adapter disabled)"
      : (f === "portsec" || f === "loop") ? "Media disconnected" : "Media connected",
      bad: f === "nicoff" || f === "portsec" || f === "loop" },
    { k: "Description", v: "Intel(R) Ethernet Connection I219-LM", bad: false },
    { k: "Physical address", v: G.mac, bad: false },
    { k: "DHCP enabled", v: c.dhcp ? "Yes" : "No",
      bad: G.fault.key === "apipa" },
    { k: "IPv4 address", v: c.ip || "(none)",
      bad: G.fault.key === "apipa" || G.fault.key === "duplicate" || G.fault.key === "vlan"
        || G.fault.key === "wrongsubnet" },
    { k: "Subnet mask", v: c.mask || "(none)", bad: G.fault.key === "mask" },
    { k: "Default gateway", v: c.gateway || "(none)", bad: G.fault.key === "gateway" || G.fault.key === "wrongsubnet" },
    { k: "DHCP server", v: c.dhcp && G.fault.key !== "apipa" ? t.gw : "(none)", bad: false },
    { k: "DNS servers", v: c.dns || "(none)", bad: G.fault.key === "dns" },
    { k: "Lease obtained", v: c.dhcp && G.fault.key !== "apipa" ? "this morning, 07:41" : "(none)", bad: false }
  ];
}

/* What the same command shows on the machine at the next desk. Half of
   network troubleshooting is "compare it with one that works", and a
   student who never thinks to do that is slower for their whole career. */
export function knownGoodRows(G) {
  var t = G.topo;
  return [
    { k: "IPv4 address", v: "10.20." + t.third + "." + (parseInt(t.peer.split(".")[3], 10)) },
    { k: "Subnet mask", v: t.mask },
    { k: "Default gateway", v: t.gw },
    { k: "DNS servers", v: t.dns1 + ", " + t.dns2 },
    { k: "Link speed", v: "1.0 Gbps full duplex" }
  ];
}

/* The physical layer, which is the whole story on one ticket and completely
   unremarkable on the other six. */
export function linkRows(G) {
  var r = R(G.seedBase + 113);
  var f = G.fault.key;
  var bad = f === "patch";
  var looped = f === "loop";
  /* A damaged pair, a duplex mismatch and a shut-down port all look wrong on
     this panel and they look wrong in three different ways. Telling those
     three apart from one screen is the point of the panel. */
  var dup = f === "duplex";
  var shut = f === "portsec";
  var off = f === "nicoff";
  return {
    speed: looped ? "no link — port shut by loop protection"
      : shut ? "no link — port error-disabled"
      : off ? "no link — adapter disabled at the workstation"
      : dup ? "100 Mbps half duplex (port hard-set)"
      : bad ? "100 Mbps half duplex" : "1.0 Gbps full duplex",
    speedBad: bad || dup || shut || off || looped,
    errors: dup ? r.int(1800, 9400) : bad ? r.int(4200, 26000) : shut ? 0 : r.int(0, 3),
    errorsBad: bad || dup,
    errorKind: dup ? "late collisions" : bad ? "CRC and runts" : "errors",
    port: G.switchPort,
    portState: looped ? "shut by loop protection, with the port opposite, at the same timestamp"
      : shut ? "err-disabled (security violation, 4 MAC addresses seen)"
      : off ? "up, no traffic since 07:12" : "up",
    portStateBad: shut || looped,
    vlan: f === "vlan" ? "17 (Guest)" : "12 (Staff)",
    vlanBad: f === "vlan",
    poe: "not required",
    uptimeMins: r.int(400, 9000)
  };
}

/* The ARP table. One ticket lives or dies here: an address answering from
   two different hardware addresses is a conflict and nothing else is. */
export function arpRows(G) {
  var r = R(G.seedBase + 127);
  function mac() {
    return ["00", "1B", "44"].concat([r.int(16, 255), r.int(16, 255), r.int(16, 255)]
      .map(function (x) { return x.toString(16).toUpperCase().padStart(2, "0"); })).join(":");
  }
  var t = G.topo;
  var rows = [
    { ip: t.gw, mac: mac(), type: "dynamic", _bad: false },
    { ip: t.peer, mac: mac(), type: "dynamic", _bad: false },
    { ip: t.dns1, mac: mac(), type: "dynamic", _bad: false }
  ];
  if (G.fault.key === "duplicate") {
    var dup = mac();
    rows.push({ ip: t.printer, mac: G.mac, type: "dynamic", _bad: true });
    rows.push({ ip: t.printer, mac: dup, type: "dynamic", _bad: true });
  } else {
    rows.push({ ip: t.printer, mac: mac(), type: "dynamic", _bad: false });
  }
  for (var i = 0; i < 3; i++) {
    rows.push({ ip: "10.20." + t.third + "." + r.int(20, 240), mac: mac(), type: "dynamic", _bad: false });
  }
  return rows;
}

/* Bench tests for the network track. Same shape as the hardware bench:
   five offered, one isolates, and the clock is running. */
const NET_TESTS = [
  { key: "flushtest", label: "Resolve the failing name at a prompt, then flush and resolve again", mins: 4, isolates: ["dnsold"],
    hit: "It resolves to the server's old address, and to the new one the moment the cache is flushed. The resolver had the right answer all along.",
    miss: "The same correct address before and after a flush." },
  { key: "hostslook", label: "Query the resolver directly, then read the hosts file", mins: 4, isolates: ["hosts"],
    hit: "The resolver returns the correct address and the machine is not using it, because there is an entry for that name in the hosts file overriding it.",
    miss: "The hosts file has nothing in it but comments, and the resolver's answer is what the machine uses." },
  { key: "bandcheck", label: "Read which radio this client is on and compare with the machines beside it", mins: 5, isolates: ["wifiband"],
    hit: "This client is associated to the 2.4GHz radio at full signal while four machines at the same desk are on 5GHz through the same access point.",
    miss: "Every client at that desk is on the same radio." },
  { key: "pingsize", label: "Ping with progressively larger packets until they stop getting through", mins: 6, isolates: ["mtu"],
    hit: "Everything crosses up to a consistent size and nothing above it does, which is the path's frame size rather than anything about capacity.",
    miss: "Full-size packets cross the path without being fragmented or dropped." },
  { key: "looplook", label: "Read the port state and the broadcast counters for the last hour", mins: 6, isolates: ["loop"],
    hit: "Two ports shut by loop protection at the same timestamp, with a broadcast spike in the minute before it. The switch did what it was fitted to do.",
    miss: "No ports shut and no broadcast spike anywhere in the hour." },
  { key: "swstate", label: "Read the switch port's state and error counters", mins: 6, isolates: ["duplex", "portsec"],
    hit: "The port tells you plainly what it is doing, and the two answers look nothing like each other: one is up at half duplex with late collisions climbing, the other is error-disabled after seeing four MAC addresses on an access port.",
    miss: "Port up, full duplex at a gigabit, no errors, correct VLAN. Nothing on the switch has anything to say about this." },
  { key: "nslookup", label: "Resolve a name at a command prompt, then fetch the same page in a browser", mins: 4, isolates: ["proxy"],
    hit: "The name resolves instantly at the prompt and the browser reports it cannot reach the proxy server. Everything below the browser is working.",
    miss: "Both agree with each other, which tells you the fault is not between the resolver and the browser." },
  { key: "adapters", label: "Open the adapter list and check the interface is enabled", mins: 2, isolates: ["nicoff"],
    hit: "The adapter is present, healthy, and disabled. Two minutes, no tools, and it was the second thing to check.",
    miss: "Adapter enabled, driver loaded, no warning against it." },
  { key: "compare", label: "Compare ipconfig with the working machine at the next desk", mins: 5, isolates: ["mask", "gateway", "dns", "vlan", "wrongsubnet"],
    hit: "Every field matches except one, and that one field is the whole ticket.",
    miss: "Both machines are configured identically. The difference is not in the configuration." },
  { key: "pingchain", label: "Ping outward in order: yourself, the gateway, a public address, then a name", mins: 5, isolates: ["gateway", "dns"],
    hit: "The chain breaks at exactly one hop, and that hop names the fault.",
    miss: "The chain breaks at the first hop and tells you nothing about what is beyond it." },
  { key: "arp", label: "Read the ARP table for a duplicate address", mins: 5, isolates: ["duplicate"],
    hit: "One address, two hardware addresses. That is a conflict and it is not ambiguous.",
    miss: "Every address answers from exactly one adapter. No conflict here." },
  { key: "swport", label: "Check the switch port for speed, errors and VLAN", mins: 10, isolates: ["patch", "vlan"],
    hit: "The port tells you plainly what the workstation could not.",
    miss: "The port is clean: full speed, no errors, correct VLAN." },
  { key: "swapcable", label: "Substitute a known-good patch cable", mins: 5, isolates: ["patch"],
    hit: "Link comes straight back up at a gigabit and the error counter stops moving.",
    miss: "Identical behaviour on a new cable." },
  { key: "dhcplease", label: "Release and renew the DHCP lease", mins: 5, isolates: ["apipa"],
    hit: "The renew fails and the machine goes straight back to a 169.254 address. Nothing is handing out leases.",
    miss: "Renews cleanly and comes back with the same configuration it had." },
  { key: "reinstalldrv", label: "Reinstall the network adapter driver", mins: 25, isolates: [],
    hit: "", miss: "No change. The adapter was never the problem — it had link the whole time." },
  { key: "reboot", label: "Reboot the workstation and try again", mins: 10, isolates: [],
    hit: "", miss: "Comes back exactly as it was. Nothing here is a transient." },
  { key: "isprouter", label: "Reboot the site router", mins: 15, isolates: [],
    hit: "", miss: "Everyone else drops off the internet for ninety seconds and this machine is unchanged. Do not do this again on a hunch." }
];

export { NET_TESTS };

export function netBenchTests(G) {
  var r = R(G.seedBase + 131);
  var right = NET_TESTS.filter(function (t) { return t.isolates.indexOf(G.fault.key) !== -1; });
  var wrong = r.shuffle(NET_TESTS.filter(function (t) { return t.isolates.indexOf(G.fault.key) === -1; }));
  /* Some faults have more than one honest way in — comparing against a known
     good machine finds four of them. Take the cheapest isolating test as the
     one that counts and offer at most two, so the choice stays a choice. */
  right = right.sort(function (a, b) { return a.mins - b.mins; }).slice(0, 2);
  return r.shuffle(right.concat(wrong.slice(0, 5 - right.length))).map(function (t) {
    var iso = t.isolates.indexOf(G.fault.key) !== -1;
    return { key: t.key, label: t.label, mins: t.mins, isolating: iso,
      result: iso ? t.hit : t.miss };
  });
}

/* =====================================================================
   Mobile track instruments

   A handset does not have a POST code or a SMART table. What it has is a
   settings screen, a battery health figure, an enrolment record and a
   storage bar — and the same rule applies: the fault is readable and the
   noise is ordinary.
   ===================================================================== */

export function deviceRows(G) {
  var d = G.device;
  var full = G.fault.key === "storage";
  var usedGb = full ? d.storageGb - (G.seedBase % 2) - 1 : Math.round(d.storageGb * 0.3 + (G.seedBase % 20));
  if (usedGb > d.storageGb) usedGb = d.storageGb - 1;
  return {
    rows: [
      { k: "Model", v: d.model, bad: false },
      { k: "IMEI", v: d.imei, bad: false },
      { k: "Age", v: d.ageMonths + " months" + (d.warranty ? " — in warranty" : " — out of warranty"), bad: false },
      { k: "OS version", v: d.os + (d.os === d.osCurrent ? " (current)" : " (current is " + d.osCurrent + ")"),
        bad: full },
      { k: "Storage", v: usedGb + "GB of " + d.storageGb + "GB used", bad: full },
      { k: "Battery health", v: d.batteryHealth + "%", bad: G.fault.key === "battery" },
      { k: "Charge cycles", v: String(d.cycles), bad: G.fault.key === "battery" },
      { k: "Last backup", v: d.lastBackup, bad: /never|months/.test(d.lastBackup) }
    ],
    usedGb: usedGb, freeGb: d.storageGb - usedGb
  };
}

/* Signal, data path and enrolment. Two faults live here and they look
   nothing alike once you read the right line. */
export function mobileNetRows(G) {
  var r = R(G.seedBase + 149);
  var f = G.fault.key;
  var cell = f === "cellular";
  var mdm = f === "mdm";
  /* The five newest configuration faults are all read off this panel, the
     same way the first two are: a stated value against a stated expectation,
     with nothing labelled "broken". */
  return [
    { k: "Cellular signal", v: r.int(3, 5) + " of 5 bars, LTE", bad: false },
    { k: "Carrier registration", v: "Registered, home network", bad: false },
    { k: "Voice", v: "Working", bad: false },
    { k: "APN", v: cell ? "internet.legacy-carrier (manual)" : "broadband.carrier (automatic)", bad: cell },
    { k: "Cellular data", v: cell ? "No data path" : "Working", bad: cell },
    { k: "Wi-Fi", v: "Connected to the office network", bad: false },
    { k: "Management enrolment", v: mdm ? "Not enrolled" : "Enrolled and compliant", bad: mdm },
    { k: "Last management check-in", v: mdm ? "never since the device was reset" : "26 minutes ago", bad: mdm },
    { k: "Work mail profile", v: mdm ? "Missing \u2014 no certificate installed" : "Installed", bad: mdm },
    { k: "Wireless state", v: f === "captiveportal"
      ? "Associated, addressed, gateway answering \u2014 nothing reachable beyond it"
      : "Associated and passing traffic", bad: f === "captiveportal" },
    { k: "Private DNS", v: f === "captiveportal" ? "Set to a fixed provider for all networks"
      : "Automatic", bad: f === "captiveportal" },
    { k: "Personal hotspot", v: f === "hotspot" ? "Off" : "On, WPA2, 5 GHz", bad: f === "hotspot" },
    { k: "Tethering on the plan", v: "Included", bad: false },
    { k: "Bluetooth", v: "On, radio working", bad: false },
    { k: "Paired devices", v: f === "btpair"
      ? r.int(7, 9) + " of " + r.int(7, 9) + " slots used, most of them retired from the fleet"
      : r.int(1, 3) + " paired", bad: f === "btpair" },
    { k: "VPN", v: f === "vpnalways" ? "Always-on, no split tunnelling \u2014 all traffic to the data centre"
      : "On demand, split tunnelling enabled", bad: f === "vpnalways" },
    { k: "Application permissions", v: f === "appperm"
      ? "Camera denied for the job application, granted elsewhere"
      : "All granted as the build specifies", bad: f === "appperm" }
  ];
}

/* What you can see and feel with the device in your hand, which on this
   track is often the whole diagnosis. */
export function inspectionRows(G) {
  var f = G.fault.key;
  return [
    { k: "Screen", v: f === "digitizer" ? "Hairline crack from the top-left corner; picture is perfect"
      : "No damage", bad: f === "digitizer" },
    { k: "Touch response", v: f === "digitizer" ? "Dead band roughly 8mm wide down the right edge, stays put when rotated"
      : "Responds across the whole panel", bad: f === "digitizer" },
    { k: "Charging port", v: f === "port" ? "Visibly packed with lint; connector will not seat fully"
      : "Clean, connector seats firmly", bad: f === "port" },
    { k: "Chassis", v: f === "battery" ? "Slight separation along the back edge"
      : f === "swollen" ? "Display lifting evenly all the way round; it rocks on a flat desk"
      : "No deformation",
      bad: f === "battery" || f === "swollen" },
    { k: "Earpiece", v: f === "speaker" ? "Mesh packed solid with pocket debris"
      : "Clear", bad: f === "speaker" },
    { k: "Case and mounting", v: f === "overheat" ? "Heavy rubber case, windscreen cradle, fast charger left connected all day"
      : "Standard case", bad: f === "overheat" },
    { k: "Surface temperature", v: f === "overheat" ? "48°C after an hour on the cradle" : "Ambient", bad: f === "overheat" },
    { k: "Screen protector", v: f === "protector"
      ? "Tempered glass, lifted along the right edge with a rainbow-edged air gap under it"
      : "Fitted flat, no gap", bad: f === "protector" },
    { k: "Rear camera glass", v: f === "rearcam"
      ? "Hazed with fine scratches; catches the light like frosted glass"
      : "Clear", bad: f === "rearcam" },
    { k: "Liquid contact indicator", v: f === "liquid"
      ? "Red. Green corrosion visible around two board connectors"
      : "White, no corrosion", bad: f === "liquid" },
    { k: "Software", v: f === "eol"
      ? "Two major versions behind, no update offered, model outside the manufacturer's support window"
      : "Current or one version behind with an update available", bad: f === "eol" }
  ];
}

/* Bench tests for the mobile track. */
const MOB_TESTS = [
  { key: "speakertest", label: "Make a call, then switch it to loudspeaker mid-sentence", mins: 3, isolates: ["speaker"],
    hit: "Barely audible through the earpiece, perfectly clear the instant it goes to loudspeaker, and the other end never noticed anything. One speaker, not the call.",
    miss: "Identical on both speakers, which means the fault is not in either of them." },
  { key: "flatdesk", label: "Stand it on a flat surface and press each corner in turn", mins: 2, isolates: ["swollen"],
    hit: "It rocks on the desk and the gap around the display opens further under a finger. That is a swollen cell and the device is out of service from this moment.",
    miss: "Sits flat, no rock, no gap anywhere around the display." },
  { key: "signalwalk", label: "Walk it through the building watching cellular and wireless signal together", mins: 8, isolates: ["wificall"],
    hit: "No cellular service at all in that part of the building, with a strong wireless association the whole time — and calling over wireless switched off.",
    miss: "Cellular signal holds everywhere the user goes." },
  { key: "profilecheck", label: "Check the profile's validity dates in the management console", mins: 4, isolates: ["profile"],
    hit: "The profile's certificate expired overnight, which is the same moment every one of the failing services stopped.",
    miss: "Profile valid, installed, and not due to renew for months." },
  { key: "backupdate", label: "Read the last successful backup date and the conditions it needs", mins: 3, isolates: ["backupfail"],
    hit: "Last successful backup was months ago, with no error recorded — it is set to run only on wireless and mains, and this device is never on both.",
    miss: "Backed up last night, as it has every night." },
  { key: "batstats", label: "Read battery health and cycle count in settings", mins: 3, isolates: ["battery"],
    hit: "Health well under the service threshold with a cycle count to match. That battery is finished.",
    miss: "Health is high and the cycle count is modest for the device's age. The battery is fine." },
  { key: "rotate", label: "Rotate the screen and re-test the unresponsive area", mins: 3, isolates: ["digitizer"],
    hit: "The dead band stays in the same physical place. That is the panel, not the software.",
    miss: "Touch works across the whole panel in both orientations." },
  { key: "portlook", label: "Inspect and clear the charging port under a light", mins: 5, isolates: ["port"],
    hit: "A compressed plug of lint comes out and the cable seats with a click. Charging is solid on any cable.",
    miss: "The port is clean and the connector already seats properly." },
  { key: "thermlog", label: "Log surface temperature and charge state across a working day", mins: 30, isolates: ["overheat"],
    hit: "Climbs through the morning, peaks at 48°C on the cradle in the sun, and shuts down. Cool overnight, fine again by nine.",
    miss: "Sits at ambient all day and never throttles." },
  { key: "apn", label: "Compare the APN against the carrier's published settings", mins: 5, isolates: ["cellular"],
    hit: "The APN is the old carrier's, entered by hand. That is why voice works and data does not.",
    miss: "The APN matches the carrier exactly." },
  { key: "enrol", label: "Check the device against the management console", mins: 5, isolates: ["mdm"],
    hit: "The console has no record of a check-in since the reset. The profile and its certificate are gone.",
    miss: "Enrolled, compliant, and checked in half an hour ago." },
  { key: "freespace", label: "Check free space and try the pending update", mins: 5, isolates: ["storage"],
    hit: "Under a gigabyte free and the update refuses to stage. Every failure on this device is a write failure.",
    miss: "Plenty of free space and the update stages without complaint." },
  { key: "peel", label: "Lift the screen protector off and re-test touch across the whole panel", mins: 4, isolates: ["protector"],
    hit: "The dead area goes with the protector. Touch is perfect everywhere on the bare glass, and the panel has not got a mark on it.",
    miss: "No protector fitted, or removing it changes nothing at all." },
  { key: "readerpresent", label: "Present the handset at a reader, then present a second handset carrying the same credential", mins: 6, isolates: ["nfcoff"],
    hit: "The second handset opens the door on the first try with the same credential on it. This one produces nothing at any reader, and the short-range radio is switched off in its settings.",
    miss: "It presents at the reader normally." },
  { key: "camlight", label: "Photograph the same subject indoors and then in direct sunlight", mins: 6, isolates: ["rearcam"],
    hit: "Indoors it is sharp and correctly exposed. Outdoors it flares and goes milky across the whole frame — and the glass over the lens is hazed with fine scratches under a raking light.",
    miss: "Both photographs are clean, and the front and rear cameras agree." },
  { key: "lci", label: "Read the liquid contact indicator and look at the board connectors", mins: 6, isolates: ["liquid"],
    hit: "The indicator has gone from white to red, and there is green corrosion creeping out from under two of the board connectors. It is running now and that is all you can say for it.",
    miss: "Indicator white, connectors clean, no corrosion anywhere on the board." },
  { key: "supportwindow", label: "Check the installed version against what the application needs and what the model can be given", mins: 8, isolates: ["eol"],
    hit: "The application needs a version two majors above what is on here, and the manufacturer stopped issuing updates for this model last year. There is no upgrade path to offer.",
    miss: "The device is current, or an update is available that takes it where it needs to be." },
  { key: "tetherlook", label: "Check the sharing settings, then look for the network from the tablet", mins: 6, isolates: ["hotspot"],
    hit: "The handset is not broadcasting anything \u2014 sharing is switched off in its settings. The tablet joins the office network from the same spot on the first attempt.",
    miss: "The handset is broadcasting and the tablet can see it." },
  { key: "bondlist", label: "Read the paired-device list, then pair the same accessory to a second handset", mins: 8, isolates: ["btpair"],
    hit: "The list is at its limit and most of it is devices that left the fleet. The accessory pairs with the second handset immediately, which puts the fault on this one's list rather than on the accessory.",
    miss: "There is room in the list and the accessory pairs normally." },
  { key: "portalcheck", label: "Check the address and gateway, then try to reach anything past them", mins: 7, isolates: ["captiveportal"],
    hit: "Associated, addressed, gateway answering \u2014 and nothing beyond it. The sign-in page it should have been redirected to never arrives, and a private DNS setting is why.",
    miss: "Traffic passes the gateway normally and the association is fully usable." },
  { key: "tunnelroute", label: "Reach a company service and a device in the same room, one after the other", mins: 6, isolates: ["vpnalways"],
    hit: "Every remote service answers and nothing on the local network does, which is exactly the shape of traffic that is all being sent somewhere else before it is allowed to go anywhere.",
    miss: "Local and remote both answer normally." },
  { key: "permcheck", label: "Read the application's permissions, then use the same hardware in another application", mins: 5, isolates: ["appperm"],
    hit: "The permission is denied for this application and granted everywhere else, and the hardware works perfectly in a second application on the same device.",
    miss: "Every permission the application needs has been granted." },
  { key: "factory", label: "Factory reset the device", mins: 60, isolates: [],
    hit: "", miss: "Same behaviour on a clean device, and the user's data is now gone. This was not the test to reach for first." },
  { key: "newcable", label: "Try a different cable and charger", mins: 3, isolates: [],
    hit: "", miss: "Identical on three different cables and two chargers." },
  { key: "simswap", label: "Move the SIM to a known-good handset", mins: 5, isolates: [],
    hit: "", miss: "The SIM works perfectly in the other handset, which tells you the SIM is not the problem and nothing else." }
];

/* Exported so a test harness can derive the isolating test for a fault from
   the source rather than keeping its own copy, which goes stale. */
export { MOB_TESTS };

export function mobBenchTests(G) {
  var r = R(G.seedBase + 151);
  var right = MOB_TESTS.filter(function (t) { return t.isolates.indexOf(G.fault.key) !== -1; });
  var wrong = r.shuffle(MOB_TESTS.filter(function (t) { return t.isolates.indexOf(G.fault.key) === -1; }));
  return r.shuffle(right.concat(wrong.slice(0, 5 - right.length))).map(function (t) {
    var iso = t.isolates.indexOf(G.fault.key) !== -1;
    return { key: t.key, label: t.label, mins: t.mins, isolating: iso, result: iso ? t.hit : t.miss };
  });
}

/* =====================================================================
   Virtualization and cloud track instruments

   No POST code, no SMART table, no battery. What this track has is a
   management console: what the host owns against what has been promised
   away, how long the disks are taking, and the four service-side numbers
   that explain the other half of the faults.
   ===================================================================== */

export function hostRows(G) {
  var h = G.host;
  var assigned = h.guests.reduce(function (a, g) { return a + g.ram; }, 0);
  var over = assigned > h.ramGb - h.hvRamGb;
  return {
    assigned: assigned,
    available: h.ramGb - h.hvRamGb,
    rows: [
      { k: "Physical memory", v: h.ramGb + "GB", bad: false },
      { k: "Reserved for the hypervisor", v: h.hvRamGb + "GB", bad: false },
      { k: "Available to guests", v: (h.ramGb - h.hvRamGb) + "GB", bad: false },
      { k: "Assigned to guests", v: assigned + "GB" + (over ? " — more than the host has" : ""), bad: over },
      { k: "Physical cores", v: String(h.cores), bad: false },
      { k: "vCPU assigned", v: String(h.guests.reduce(function (a, g) { return a + g.cores; }, 0)), bad: false },
      { k: "vCPU to physical core ratio", v: h.vcpuRatio + ":1", bad: h.vcpuRatio >= 4 },
      { k: "Processor usage, guest average", v: h.cpuUsagePct + "%", bad: false },
      { k: "Processor ready time, guest average", v: h.cpuReadyPct + "% (over 5% means guests are queuing for a core)",
        bad: h.cpuReadyPct > 5 },
      { k: "Datastore provisioned / actual", v: h.provisionedGb + "GB promised on " + h.datastoreGb + "GB",
        bad: h.provisionedGb > h.datastoreGb },
      { k: "Datastore real free space", v: h.thinFreeGb + "GB", bad: h.thinFreeGb === 0 },
      { k: "Guest network adapters", v: h.portGroupOk
        ? "All connected to a port group that exists on this host"
        : "One adapter connected to a port group this host does not have", bad: !h.portGroupOk },
      { k: "Backup retention", v: h.retentionDays + " days, " + h.backupSuccessDays + " consecutive successful nights", bad: false },
      { k: "Age of the file being asked for", v: h.requestedAgeDays + " days", bad: h.requestedAgeDays > h.retentionDays },
      { k: "Bill change since January", v: (h.billRisePct > 5 ? "+" : "") + h.billRisePct + "%", bad: h.billRisePct > 20 },
      { k: "Share of that change that is data transfer out", v: h.egressPct + "%", bad: h.egressPct > 50 },
      { k: "Host uptime", v: (28 + (G.seedBase % 90)) + " days", bad: false }
    ]
  };
}

export function guestRows(G) {
  return G.host.guests.map(function (g) {
    return { name: g.name, role: g.role, ram: g.ram, cores: g.cores,
      minRam: g.minRam, minCores: g.minCores,
      _bad: g.ram > g.minRam * 2 };
  });
}

export function datastoreRows(G) {
  var r = R(G.seedBase + 167);
  var hot = G.fault.key === "vdi";
  return G.host.datastores.map(function (d, i) {
    var busy = hot && i === 0;
    return {
      name: d.name,
      desktops: d.desktops,
      capacity: d.capacity,
      latencyIdle: r.int(2, 6),
      latencyPeak: busy ? r.int(180, 420) : r.int(8, 18),
      _bad: busy || d.desktops > d.capacity
    };
  });
}

/* The service side: the four numbers that between them explain four of the
   seven faults, and are entirely unremarkable on the other three. */
export function cloudServiceRows(G) {
  var f = G.fault.key;
  var lic = f === "licence";
  return [
    { k: "Tenant service health", v: "All services operational", bad: false },
    { k: "Storage quota used", v: G.quotaPct + "%" + (G.quotaPct >= 100 ? " — at the limit" : ""),
      bad: f === "quota" },
    { k: "Sync client status", v: f === "sync" ? "Idle — 1 conflicted copy kept"
      : f === "quota" ? "Retrying 214 files (quota exceeded)" : "Up to date", bad: f === "sync" || f === "quota" },
    { k: "Licence pool", v: lic ? "38 of 40 assigned — this account has none"
      : "37 of 40 assigned", bad: lic },
    { k: "This account's licence", v: lic ? "None assigned" : "Assigned and active", bad: lic },
    { k: "Spend, month to date", v: "$" + G.spend.thisMonth.toLocaleString() +
      " against a $" + G.spend.budget.toLocaleString() + " budget", bad: f === "spend" },
    { k: "Spend, last month", v: "$" + G.spend.lastMonth.toLocaleString(), bad: false },
    { k: "Virtualization extensions", v: f === "virtext" ? "Present but disabled in firmware"
      : "Enabled", bad: f === "virtext" }
  ];
}

const CLOUD_TESTS = [
  { key: "snaplist", label: "List the snapshots on the host with their age and size", mins: 4, isolates: ["snapshot"],
    hit: "One snapshot dated months ago, with a delta file larger than the guest's own disk. Every write since the upgrade has gone into it.",
    miss: "No snapshot on this host older than the retention policy allows." },
  { key: "clockcheck", label: "Compare the host clock against the site's time source", mins: 3, isolates: ["timedrift"],
    hit: "The host is several minutes away from the time source, which is well outside what authentication will accept.",
    miss: "The host is synchronised and inside tolerance." },
  { key: "joblog", label: "Read the backup job log for start and finish times over a fortnight", mins: 6, isolates: ["backupwin"],
    hit: "The job starts on time every night and finishes hours into the working day, and storage latency drops the moment it does.",
    miss: "Starts and finishes inside its window every night, with time to spare." },
  { key: "signinlog", label: "Read the sign-in log for this account", mins: 4, isolates: ["mfa"],
    hit: "The credential is accepted every time and the second factor never completes, on every device they have tried.",
    miss: "Sign-ins complete normally, including the second factor." },
  { key: "rtt", label: "Measure the round trip to the service and the circuit's utilisation together", mins: 5, isolates: ["region"],
    hit: "A round trip an order of magnitude above anything local, on a circuit that is almost idle. That is distance, not capacity.",
    miss: "Round trip in single-figure milliseconds with the circuit barely used." },
  { key: "capacity", label: "Add up assigned memory against what the host physically has", mins: 5, isolates: ["vmram"],
    hit: "The guests between them are promised more memory than the host owns once the hypervisor's reservation is counted.",
    miss: "Assigned memory sits comfortably inside what the host has." },
  { key: "firmware", label: "Check the virtualization extensions in firmware", mins: 5, isolates: ["virtext"],
    hit: "Present in the processor, switched off in firmware. That is the whole ticket.",
    miss: "Enabled, as it should be." },
  { key: "latency", label: "Graph storage latency against the times users complain", mins: 15, isolates: ["vdi"],
    hit: "Latency spikes into the hundreds of milliseconds exactly across the morning login window, and the network is flat throughout.",
    miss: "Latency sits in single figures all day on both datastores." },
  { key: "quota", label: "Check the storage quota and read the sync client log", mins: 5, isolates: ["quota"],
    hit: "The account is at its limit and every rejection in the log is the quota refusing a write.",
    miss: "Plenty of quota left and no rejections in the log." },
  { key: "conflict", label: "List the folder and look for conflicted copies", mins: 5, isolates: ["sync"],
    hit: "Two files, same document, both modified the same afternoon, one with a name on it. Nothing was lost.",
    miss: "One copy of everything, no conflicts." },
  { key: "tenant", label: "Compare this account with a colleague's in the tenant", mins: 5, isolates: ["licence"],
    hit: "Same group, same build, same everything — except this one has no licence attached.",
    miss: "The two accounts are entitled identically." },
  { key: "billing", label: "Break the bill down by resource tag", mins: 10, isolates: ["spend"],
    hit: "One tag accounts for almost all of the increase, and it belongs to a project that finished in the summer.",
    miss: "Spend is spread the way it always is, with no one tag standing out." },
  { key: "readytime", label: "Read processor-ready time alongside processor usage on every guest", mins: 8, isolates: ["cpuready"],
    hit: "Usage in the teens on every guest and ready time in the twenties. They are not working, they are queuing \u2014 and the assigned vCPU across the host is several times the cores it owns.",
    miss: "Ready time is under a percent everywhere, which means nothing is waiting for a core." },
  { key: "provisioned", label: "Compare the datastore's provisioned total against its actual size and free space", mins: 6, isolates: ["thinprov"],
    hit: "The disks on it are promised roughly twice what the datastore physically holds, and real free space is zero. Every guest on it paused at the moment the last block went.",
    miss: "Provisioned sits comfortably inside the datastore's real size, with free space to spare." },
  { key: "adapter", label: "Check the guest's virtual adapter and which port group it is connected to", mins: 5, isolates: ["portgroup"],
    hit: "The adapter is present, connected and up \u2014 and attached to a port group that does not exist on this host. It has been talking to nothing since the migration.",
    miss: "Connected to a valid port group, same as every other guest on the host." },
  { key: "retentioncheck", label: "Read the retention setting against the age of the file being asked for", mins: 4, isolates: ["retention"],
    hit: "Retention is fourteen days. The file was deleted six weeks ago. Every job in between succeeded, and not one of them still holds it.",
    miss: "The file is well inside the retention period and there are restore points covering it." },
  { key: "chargetype", label: "Break the bill down by charge type rather than by service", mins: 8, isolates: ["egress"],
    hit: "Compute and storage are within a few dollars of January. Almost the entire increase is one line: data transferred out of the provider's network.",
    miss: "Transfer charges are a rounding error and the increase is somewhere else entirely." },
  { key: "rebuild", label: "Rebuild the host from scratch", mins: 240, isolates: [],
    hit: "", miss: "Four hours, every guest offline, and the same behaviour at the end of it." },
  { key: "reinstallsync", label: "Uninstall and reinstall the sync client", mins: 20, isolates: [],
    hit: "", miss: "A brand-new client that behaves identically to the old one." },
  { key: "supportcase", label: "Open a case with the cloud provider", mins: 30, isolates: [],
    hit: "", miss: "They confirm the service is healthy and ask what you have checked, which is a fair question." }
];

export { CLOUD_TESTS };

export function cloudBenchTests(G) {
  var r = R(G.seedBase + 173);
  var right = CLOUD_TESTS.filter(function (t) { return t.isolates.indexOf(G.fault.key) !== -1; });
  var wrong = r.shuffle(CLOUD_TESTS.filter(function (t) { return t.isolates.indexOf(G.fault.key) === -1; }));
  return r.shuffle(right.concat(wrong.slice(0, 5 - right.length))).map(function (t) {
    var iso = t.isolates.indexOf(G.fault.key) !== -1;
    return { key: t.key, label: t.label, mins: t.mins, isolating: iso, result: iso ? t.hit : t.miss };
  });
}

/* =====================================================================
   Printer instruments — both engines

   What a technician actually has in front of them at a printer: the
   machine's own status page, its error log, a test print, and on an inkjet
   a nozzle check. Plus, on the repeating-defect ticket, a ruler.

   Same two rules as everywhere else in this file. The fault's signature is
   genuinely readable off these, and the noise around it is genuinely
   ordinary — printers log jams and low-toner warnings all week without
   anything being wrong.
   ===================================================================== */

export function printerStatus(G) {
  var p = G.printer, out = [];
  out.push({ k: "Model", v: p.model, bad: false });
  out.push({ k: "Serial", v: p.serial, bad: false });
  out.push({ k: "Connection", v: p.connection, bad: false });
  out.push({ k: "Age", v: p.ageMonths + " months", bad: false });
  out.push({ k: "Lifetime page count", v: p.pageCount.toLocaleString(), bad: false });
  if (p.engine === "laser") {
    out.push({ k: "Rated speed", v: p.ppm + " ppm, " + (p.mono ? "mono" : "colour"), bad: false });
    out.push({ k: "Maintenance kit due at", v: p.kitInterval.toLocaleString() + " pages", bad: false });
    out.push({
      k: "Pages since last kit", v: p.sinceKit.toLocaleString() +
        (p.sinceKit > p.kitInterval ? " — OVERDUE" : ""), bad: p.sinceKit > p.kitInterval
    });
    out.push({ k: "Toner remaining", v: p.tonerPct + "%", bad: false });
    out.push({ k: "Drum life remaining", v: p.drumPct + "%", bad: false });
  } else {
    out.push({ k: "Head type", v: p.headType, bad: false });
    p.inks.forEach(function (i) { out.push({ k: i.c + " ink", v: i.pct + "%", bad: false }); });
    out.push({
      k: "Waste ink pad", v: p.wastePct + "%" + (p.wastePct >= 100 ? " — SERVICE REQUIRED" : ""),
      bad: p.wastePct >= 100
    });
    out.push({ k: "Cleaning cycles this month", v: String(p.cleaningCycles), bad: p.cleaningCycles > 15 });
  }
  return out;
}

/* The printer's own log. Most of it is a normal week. */
const PRN_NOISE = [
  { level: "Info", msg: "Paper jam cleared at the rear door" },
  { level: "Info", msg: "Tray 2 opened and closed" },
  { level: "Warning", msg: "Toner low — order a replacement" },
  { level: "Info", msg: "Firmware check completed, no update available" },
  { level: "Warning", msg: "Tray 1 out of paper" },
  { level: "Info", msg: "Sleep mode entered" },
  { level: "Info", msg: "Job cancelled at the panel" },
  { level: "Warning", msg: "Paper size mismatch — job held" },
  { level: "Info", msg: "Cover opened" },
  { level: "Info", msg: "Network link renegotiated at 100Mb" }
];

const PRN_SIGNATURE = {
  pickup: [{ level: "Error", msg: "Misfeed from Tray 1 — no sheet detected at the registration sensor" },
    { level: "Error", msg: "Multiple sheets detected at the registration sensor" }],
  fuser: [{ level: "Error", msg: "Fuser did not reach target temperature within the warm-up window" },
    { level: "Error", msg: "Jam at the fuser exit" }],
  repeat: [{ level: "Info", msg: "Print quality report requested from the panel" }],
  transfer: [{ level: "Warning", msg: "Transfer voltage out of range on the last calibration" }],
  scanner: [{ level: "Info", msg: "Print quality report requested from the panel" }],
  encoder: [{ level: "Error", msg: "Carriage position error — encoder signal lost mid-sweep" }],
  capping: [{ level: "Warning", msg: "Automatic head cleaning performed at power-on" },
    { level: "Warning", msg: "Automatic head cleaning performed at power-on" }],
  head: [{ level: "Warning", msg: "Nozzle check requested from the panel" },
    { level: "Warning", msg: "Head cleaning cycle completed" }],
  belt: [{ level: "Error", msg: "Carriage stalled against the right-hand stop" }],
  wastepad: [{ level: "Error", msg: "Waste ink counter at limit — printing halted, service required" }]
};

export function printerEvents(G) {
  var r = R(G.seedBase + 211);
  var rows = r.shuffle(PRN_NOISE).slice(0, 6).map(function (n) {
    return { day: r.int(-10, 0), level: n.level, msg: n.msg, _t: "noise" };
  });
  (PRN_SIGNATURE[G.fault.key] || []).forEach(function (sig) {
    rows.push({ day: r.int(G.trueDay - 1, G.trueDay), level: sig.level, msg: sig.msg, _t: "fault" });
  });
  return rows.sort(function (a, b) { return a.day - b.day; });
}

/* What the test print actually looks like. On four of the five laser faults
   this is the whole diagnosis; on the fifth there is nothing wrong with the
   print at all, because it is a feed fault. */
export function defectReport(G) {
  var p = G.printer, f = G.fault.key;
  return {
    pickup: "The sheets that make it through are perfect — sharp, correctly registered, nothing wrong with the image. Getting one to feed is the whole problem.",
    fuser: "The image is complete and correctly placed, and the toner sits on the surface of the paper. Rubbing it with a thumb smears it across the page. The trailing edge is creased.",
    repeat: "A dark mark roughly 4mm across repeats down the page at a perfectly even spacing. Everything else about the print is correct.",
    transfer: "Uniformly pale across the whole sheet — no dark areas anywhere, and it does not vary top to bottom. There is loose toner on the reverse of the following page.",
    scanner: "An unbroken white line about 2mm wide runs the entire length of the page, " +
      (p.circ ? "" : "") + "the same distance from the left edge every time. It is there on the printer's own report as well as on user documents.",
    encoder: "The top third is correct. Partway down, one band of the image is displaced sideways and overprinted.",
    capping: "The first page has fine white lines through the solid areas. The third page is clean.",
    head: "Colours are wrong across the whole page. The nozzle check tells you why.",
    belt: "Vertical strokes are doubled — printed once, then again a fraction of a millimetre to the side.",
    wastepad: "There is no test print. The printer will not accept a job at all.",
    duplexjam: "The first side prints perfectly. The sheet is retrieved crumpled from inside the rear door with the second side blank.",
    exitjam: "The image is complete and properly fused. The sheet is stalled with its trailing edge still inside the machine.",
    regskew: "The whole image sits at an angle on the page and the top margin is larger than it should be. The image itself is sharp and correctly formed.",
    gearnoise: "A smeared band across the page at an even spacing, and a knock from inside the machine that keeps time with it.",
    ozone: "The print is flawless from the first sheet to the last. There is nothing on the page to report.",
    platen: "The face of the sheet is correct. It is the reverse of the next one out that is marked, in the same place every time.",
    starwheel: "Rows of small evenly spaced dots run down the sheet in fixed tracks, through the solid areas. The nozzle check is complete.",
    feedenc: "Horizontal bands at an even pitch across the paper direction, with every channel of the nozzle check printing in full.",
    pumpfail: "One channel is missing entirely and stays missing however many cleaning cycles are run.",
    ijfeed: "The sheets that feed are perfect. Getting them to feed one at a time is the problem.",
    sepwear: "Sheets from the main tray are perfect. Sheets from the multipurpose tray come through two and three at a time, printed on the top one only.",
    cleanblade: "A smeared band down the page that is worse on sheet fifty than on sheet one, and none of it rubs off under a thumb.",
    tonerlow: "The image fades progressively toward one side of the page. The other side is correctly dense.",
    trayguide: "The image is sharp and the machine is not marking the paper. Every sheet is simply at an angle.",
    wrongmedia: "On plain paper the toner is bonded hard. On the heavy stock the same image lifts under a thumbnail.",
    airlock: "One colour is missing from everything, and the nozzle check shows that channel completely blank while its cartridge reads nearly full.",
    headstrike: "Scuffing straight across the sheet in the direction the head travels, with ink smeared along the leading edge.",
    waterink: "The image is complete and correctly placed, and every edge in it is soft. Colours have bled into one another along the paper fibres.",
    carriagerail: "Banding that lines up with the carriage travel, and the sound of the head stuttering across the page as it prints.",
    chipreset: "There is no test print. The machine refuses to print at all and reports a cartridge as empty."
  }[f] || "";
}

/* The ruler. Positions of the repeating marks down the page, from which the
   spacing — and therefore the component — is computed. Deliberately given as
   positions rather than a spacing, because subtracting them is the exercise. */
export function defectMarks(G) {
  if (G.fault.key !== "repeat") return null;
  var r = R(G.seedBase + 223);
  var gap = G.printer.repeatMm;
  var start = r.int(12, 30);
  var marks = [];
  for (var y = start; y <= 290; y += gap) marks.push(y);
  return { marks: marks, gap: gap };
}

/* Inkjet nozzle check. One block per channel; exactly one is missing on a
   genuine clog and none on anything else, which is what separates "it is not
   firing" from "it is landing in the wrong place". */
export function nozzleRows(G) {
  var p = G.printer;
  return p.inks.map(function (i) {
    var dead = p.deadChannel === i.c;
    return {
      c: i.c, pct: i.pct,
      result: dead ? "no bars printed" : "all bars present",
      bad: dead
    };
  });
}

/* The bench tests. One isolates this fault; the rest are honest work. */
const PRN_TESTS = {
  laser: [
    { key: "selftest", label: "Print the printer's own configuration page", mins: 3, isolates: "scanner",
      hit: "The white line is on the printer's own report too, so nothing upstream of the engine is involved.",
      miss: "The configuration page shows the same fault as the user's documents. The printer is producing it, not the PC." },
    { key: "feedcount", label: "Feed ten sheets from each tray and count the misfeeds", mins: 10, isolates: "pickup",
      hit: "Four misfeeds and two double-feeds out of ten from every tray, with a fresh ream. It is not the paper and it is not one tray.",
      miss: "Twenty sheets from each tray, no misfeeds at all." },
    { key: "rubtest", label: "Print a solid black block and rub it with a thumb", mins: 3, isolates: "fuser",
      hit: "It smears straight off the page. The toner was never bonded.",
      miss: "It does not mark at all. The toner is properly fused." },
    { key: "measure", label: "Measure the spacing between the repeating marks", mins: 5, isolates: "repeat",
      hit: "Evenly spaced the whole way down, which means a rotating component is printing it once per revolution.",
      miss: "There is nothing repeating on the page to measure." },
    { key: "newcart", label: "Fit a known-good toner cartridge and reprint", mins: 8, isolates: "transfer",
      hit: "Identical result on a brand new cartridge, which clears the drum, the charge roller and the developer in one test.",
      miss: "No change, but then nothing here pointed at the cartridge." },
    { key: "duplextest", label: "Send the same job single-sided and then double-sided", mins: 8, isolates: "duplexjam",
      hit: "Twenty sheets single-sided without a murmur; it jams on the second of the double-sided run, inside the rear door.",
      miss: "Both runs complete without a jam." },
    { key: "watchexit", label: "Watch a sheet come out and see where it stops", mins: 4, isolates: "exitjam",
      hit: "It clears the fuser correctly, then stalls with the trailing edge still inside. The image is properly fused.",
      miss: "Sheets stack normally in the tray." },
    { key: "measureskew", label: "Measure the top margin and the skew on sheets from every tray", mins: 8, isolates: "regskew",
      hit: "The same skew and the same oversized top margin from all three trays, which rules the trays out.",
      miss: "Margins are square and identical from every tray." },
    { key: "listen", label: "Listen to a page print and match the noise against the mark", mins: 5, isolates: "gearnoise",
      hit: "A knock once per revolution, and the smeared band lands at exactly the same spacing. They keep time.",
      miss: "It runs smoothly with no rhythmic noise." },
    { key: "smell", label: "Run a long job and check the print and the air", mins: 10, isolates: "ozone",
      hit: "The print is flawless from first sheet to last, and the air by the exhaust is sharp enough to notice from the door.",
      miss: "Nothing unusual about the air after a long run." },
    { key: "traycompare", label: "Feed ten sheets from the multipurpose tray and ten from the main tray", mins: 8, isolates: "sepwear",
      hit: "Six double-feeds out of ten from the multipurpose tray and ten clean single sheets from the main one. Same ream, same machine, two different pads.",
      miss: "Both trays feed single sheets, ten out of ten." },
    { key: "longrun", label: "Print fifty pages and compare the first sheet with the last", mins: 9, isolates: "cleanblade",
      hit: "The first two are almost clean and the smearing gets worse every sheet after that, and none of it rubs off.",
      miss: "Sheet fifty is identical to sheet one." },
    { key: "rocktest", label: "Rock the cartridge, reprint, then print another two hundred pages", mins: 12, isolates: "tonerlow",
      hit: "The fade clears completely for a couple of hundred sheets and comes back on the same side. That is toner distribution, not a component.",
      miss: "Rocking the cartridge changes nothing at all." },
    { key: "guidecheck", label: "Measure the skew, then look at where the tray guides are set", mins: 6, isolates: "trayguide",
      hit: "Consistent skew from that tray, and the guides are set a good centimetre wider than the stack sitting in it.",
      miss: "Guides are snug against the stack and the sheets come out square." },
    { key: "mediacompare", label: "Print the same job on plain paper and on the heavy stock", mins: 7, isolates: "wrongmedia",
      hit: "The plain paper fuses perfectly and the toner comes off the card under a thumbnail. One fuser, one temperature, two very different papers.",
      miss: "Both stocks fuse identically." },
    { key: "driverlaser", label: "Remove and reinstall the print driver on the user's PC", mins: 35, isolates: null,
      hit: "", miss: "Identical output from a clean driver, and from a second machine. Thirty-five minutes to prove it was never the driver." },
    { key: "reboot", label: "Power-cycle the printer and reprint", mins: 5, isolates: null,
      hit: "", miss: "Exactly the same after a full power cycle." }
  ],
  inkjet: [
    { key: "nozzle", label: "Print a nozzle check pattern", mins: 3, isolates: "head",
      hit: "One channel prints no bars at all while the others are complete. The ink is in the cartridge and it is not reaching the paper.",
      miss: "Every channel prints its full block. Nothing is blocked." },
    { key: "encoderlook", label: "Inspect the encoder strip along its full length under a light", mins: 5, isolates: "encoder",
      hit: "Ink mist across a section of it and a clear fingerprint near the middle of the travel.",
      miss: "Clean and unmarked from end to end." },
    { key: "capinspect", label: "Inspect the capping station and the wiper blade", mins: 5, isolates: "capping",
      hit: "The rubber lip is caked with dried ink and does not sit flat. It has not been sealing for a while.",
      miss: "Cap is soft and clean, wiper is intact, and the seal is good." },
    { key: "beltcheck", label: "Watch a full carriage sweep and check the belt tension", mins: 8, isolates: "belt",
      hit: "It slips audibly at one end of the travel, and the belt has visible slack.",
      miss: "Smooth, quiet, correctly tensioned across the whole sweep." },
    { key: "counters", label: "Read the service counters from the maintenance menu", mins: 4, isolates: "wastepad",
      hit: "The waste ink counter is at its limit. That is the firmware stopping the machine on purpose.",
      miss: "Every counter is inside its normal range." },
    { key: "backcheck", label: "Print one sheet and look at the back of the next one through", mins: 4, isolates: "platen",
      hit: "The reverse is marked in the same place every time, and it is worst on the borderless job.",
      miss: "The reverse of every sheet is clean." },
    { key: "trackcheck", label: "Print a solid fill and look for marks in fixed tracks", mins: 4, isolates: "starwheel",
      hit: "Rows of small dots in fixed positions across the sheet, running the way the paper travels. The nozzle check is perfect.",
      miss: "The solid fill is even with no tracking marks." },
    { key: "bandpitch", label: "Measure the spacing of the horizontal bands", mins: 6, isolates: "feedenc",
      hit: "Evenly pitched bands across the paper direction, with a complete nozzle check. The ink is fine; the paper is not arriving where it should.",
      miss: "No banding to measure." },
    { key: "wastewatch", label: "Run one cleaning cycle and watch the waste counter", mins: 6, isolates: "pumpfail",
      hit: "The cycle completes normally and the waste counter does not move. Nothing is being drawn through the head at all.",
      miss: "The counter steps up as it should, so the pump is pulling ink." },
    { key: "feedten", label: "Feed ten sheets from the tray and count what happens", mins: 8, isolates: "ijfeed",
      hit: "Three misfeeds and two double feeds out of ten, with a fresh ream straight from the wrapper.",
      miss: "Ten sheets, ten clean feeds." },
    { key: "purgetest", label: "Run a purge cycle and watch that channel on a nozzle check", mins: 7, isolates: "airlock",
      hit: "Nothing after six cleaning cycles, and the channel comes back completely after one purge. There was a bubble in the line, not a blockage in the head.",
      miss: "The channel is the same before and after a purge." },
    { key: "mediathick", label: "Print on the card, then on ordinary paper, and look at both", mins: 6, isolates: "headstrike",
      hit: "Scuffing straight across the card in the direction the head travels, and the ordinary paper comes out clean. The head is catching the thicker stock.",
      miss: "Both come out unmarked." },
    { key: "papercompare", label: "Print the same page on the office stock and on inkjet-rated paper", mins: 5, isolates: "waterink",
      hit: "Furry edges and bleeding on the office stock, crisp on the rated paper, from the same file and the same head.",
      miss: "Both stocks print with identical sharpness." },
    { key: "railfeel", label: "Move the carriage by hand along its full travel with the power off", mins: 5, isolates: "carriagerail",
      hit: "It drags and catches partway across instead of gliding, and the rail is dry to the touch where it should be greased.",
      miss: "It glides end to end with no resistance." },
    { key: "cartswap", label: "Fit one cartridge the machine accepts and try to print", mins: 6, isolates: "chipreset",
      hit: "It prints immediately and perfectly with a cartridge it accepts. The machine was never broken — it was refusing a consumable.",
      miss: "It behaves exactly the same with a different cartridge in it." },
    { key: "driverink", label: "Remove and reinstall the print driver on the user's PC", mins: 35, isolates: null,
      hit: "", miss: "Same output from a clean driver and from a second machine." },
    { key: "newink", label: "Fit a full set of new ink cartridges", mins: 10, isolates: null,
      hit: "", miss: "No change, and you have just spent a set of cartridges finding that out." }
  ]
};

export function printerBenchTests(G) {
  var r = R(G.seedBase + 229);
  var pool = PRN_TESTS[G.printer.engine];
  var right = pool.filter(function (t) { return t.isolates === G.fault.key; });
  var wrong = r.shuffle(pool.filter(function (t) { return t.isolates !== G.fault.key; })).slice(0, 4);
  return r.shuffle(right.concat(wrong)).map(function (t) {
    return {
      key: t.key, label: t.label, mins: t.mins,
      isolating: t.isolates === G.fault.key,
      result: t.isolates === G.fault.key ? t.hit : t.miss
    };
  });
}
