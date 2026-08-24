/* =====================================================================
   Field Service Center — Windows and OS troubleshooting

   Every other track in this build assumes the operating system is fine.
   Twelve tracks of hardware, network, print paths and arrays, and all of
   them quietly hand the student a machine whose Windows is working.

   This one takes that away, and it is the only track with nothing to put
   your hands on. There is no bench, no model and no part to point at,
   because an operating system is not a thing in a room. What there is
   instead is a set of tools, and the whole skill is knowing which one
   answers the question in front of you:

     Event Viewer      what happened, and when
     Task Manager      what is using the machine right now
     Device Manager    what hardware Windows thinks it has, and its state
     Services          what is meant to be running and is not
     Storage           whether there is room to work
     Update history    what changed, and whether it stuck
     Reliability       the shape of the failures over weeks
     Safe mode         whether it is Windows or what was added to it

   Two ideas run through the whole track.

   THE SCOPE TELLS YOU WHERE TO LOOK. One user on one machine is a
   profile. Every user on one machine is that machine. Every machine of one
   build is what was pushed to it. Establishing which of those three before
   opening anything saves most of the visit.

   LEAST INVASIVE FIRST, AND STOP WHEN IT WORKS. There is always a bigger
   hammer, and reimaging fixes everything on this track. It also costs the
   customer their afternoon and teaches you nothing, and it is the answer
   people reach for when they have not established the scope.
   ===================================================================== */

/* =====================================================================
   The faults
   ===================================================================== */
export const WINOS_FAULTS = [
  {
    key: "startupapp", part: "a startup application taking the machine", target: "none",
    objective: "Core 2 \u2014 1.3 / 3.1", scope: "user", tool: "taskmgr",
    root: "An application added itself to startup and does several minutes of work at every login. The machine is not slow; it is busy, and it is busy with something nobody asked for.",
    observable: "it takes eight minutes to become usable after signing in and behaves perfectly for the rest of the day",
    symptoms: ["It takes forever to get going in the morning",
      "Once it's up it's fine", "It's been getting worse for months"],
    fixes: "Disable the startup entry, sign out and back in, and time it. If the application is needed, it is needed on demand rather than at every login.",
    wrongReflex: "memory",
    wrongWhy: "Memory sits at a third of what is fitted once the machine settles, and it settles on its own without anybody closing anything. A machine short of memory is slow all day, not slow for eight minutes.",
    evidence: "One startup entry rated high impact, with disk activity that falls to nothing once it finishes"
  },
  {
    key: "driverbad", part: "a driver that stopped the device", target: "none",
    objective: "Core 2 \u2014 1.3 / 3.1", scope: "machine", tool: "devmgr",
    root: "A driver update installed at the last patch cycle does not work on this hardware. Windows has stopped the device and flagged it.",
    observable: "one piece of hardware stopped working overnight with no physical change to the machine",
    symptoms: ["It stopped working on its own", "Nobody touched it",
      "It was fine on Friday"],
    fixes: "Roll the driver back to the previous version, confirm the device starts, and hold that version until the vendor fixes the new one.",
    wrongReflex: "the device",
    wrongWhy: "The device is listed, present and correctly identified, and it works in another machine. Windows has not failed to find it — it has found it, tried to start it with a driver that does not work, and stopped.",
    evidence: "A device flagged with a driver-reported problem code, dating from the driver's install date"
  },
  {
    key: "diskfull", part: "a system drive with nothing left on it", target: "none",
    objective: "Core 2 \u2014 1.3 / 3.1", scope: "machine", tool: "storage",
    root: "The system drive is full. Windows cannot write temporary files, updates cannot stage, applications cannot save, and everything that needs scratch space fails in its own way.",
    observable: "half a dozen unrelated things stopped working in the same week, all of them differently",
    symptoms: ["Nothing works properly any more", "It won't save",
      "The updates keep failing too"],
    fixes: "Clear the space — temporary files, previous Windows installations, the user's own downloads folder — then confirm the failures stop. Find out what filled it, because it will fill again.",
    wrongReflex: "reimage",
    wrongWhy: "Reimaging clears the drive as a side effect, which is why it appears to work. It also costs the customer their afternoon to solve a problem that a cleanup solves in ten minutes, and it does not answer what filled the drive.",
    evidence: "Free space on the system drive in the low hundreds of megabytes, with unrelated failures dating from the week it ran out"
  },
  {
    key: "updateloop", part: "an update that fails and retries every boot", target: "none",
    objective: "Core 2 \u2014 1.3 / 3.1", scope: "fleet", tool: "updates",
    root: "One update fails partway through installation, rolls itself back, and tries again at the next restart. Every boot costs twenty minutes and ends where it started.",
    observable: "every restart spends twenty minutes applying an update and then reports that it could not be completed",
    symptoms: ["It's always installing something", "It never finishes",
      "Everyone on this floor has the same thing"],
    fixes: "Clear the update cache and retry once. If it fails again, hide that update and raise it with whoever owns patching, because it is failing on every machine of this build rather than on this one.",
    wrongReflex: "this machine",
    wrongWhy: "Every machine of the same build is doing it, which makes this a property of the update rather than of any one machine. Working on the machine in front of you is working on the wrong one of forty.",
    evidence: "The same update failing with the same result on every machine of one build"
  },
  {
    key: "profilecorrupt", part: "a damaged user profile", target: "none",
    objective: "Core 2 \u2014 1.3 / 3.1", scope: "user", tool: "newprofile",
    root: "The user's profile is damaged. Windows loads it, applications behave oddly in ways that do not agree with each other, and everything is perfect for anybody else on the same machine.",
    observable: "one person has a machine full of strange behaviour and everybody else who signs in to it is fine",
    symptoms: ["It's only me", "My colleague signs in and it's normal",
      "It does something different every day"],
    fixes: "Create a fresh profile, migrate the user's data into it, and confirm the behaviour is gone before deleting anything. Back up the old profile first — it is the only copy of some of what is in it.",
    wrongReflex: "the machine",
    wrongWhy: "Another account on the same machine, on the same drive and the same Windows, works perfectly. Nothing that is true of the machine can explain a fault that only one account has.",
    evidence: "Strange behaviour for one account and a clean session for a second account on the same machine"
  },
  {
    key: "servicedisabled", part: "a service set to disabled", target: "none",
    objective: "Core 2 \u2014 1.3 / 3.1", scope: "machine", tool: "services",
    root: "A service was disabled — during a troubleshooting session, by a policy, or by somebody following a tuning guide — and the feature that depends on it has been dead ever since.",
    observable: "one feature of Windows does nothing at all, with no error and no entry in any log",
    symptoms: ["It just doesn't do anything", "There's no error, it's like the button isn't there",
      "Someone was fixing something else on it a while back"],
    fixes: "Set the service back to its correct startup type, start it, and confirm the feature works. Find out why it was disabled, because if a policy did it, it will do it again at the next refresh.",
    wrongReflex: "the application",
    wrongWhy: "Reinstalling the application puts back something that was never damaged. What is missing is underneath it, and a feature that fails silently with nothing in any log is usually something that was never started rather than something that broke.",
    evidence: "A service the feature depends on set to Disabled and not running, with nothing logged anywhere"
  },
  {
    key: "pagefile", part: "a page file too small for the work", target: "none",
    objective: "Core 2 \u2014 1.3 / 3.1", scope: "machine", tool: "perf",
    root: "The page file was set to a small fixed size on a machine with modest memory. Committed memory hits the ceiling under real work and applications are refused memory they asked for.",
    observable: "applications close on their own or refuse to open once several are running, on a machine with plenty of free disk",
    symptoms: ["Things close on their own when I've got a lot open",
      "It says out of memory and there's loads of disk", "One at a time it's fine"],
    fixes: "Set the page file back to system-managed, or size it properly for the memory fitted and the work being done. Then look at whether the machine wants more memory, because that is the real answer if this recurs.",
    wrongReflex: "the drive",
    wrongWhy: "The drive is healthy and has room on it. What has run out is committed memory, which is physical memory plus the page file — and one of those two was deliberately made small.",
    evidence: "Committed memory at its limit with the page file set to a small fixed size and free disk space plentiful"
  },
  {
    key: "devicecode10", part: "hardware Windows cannot start", target: "none",
    objective: "Core 2 \u2014 1.3 / 3.1", scope: "machine", tool: "devmgr",
    root: "The device is enumerated and Windows cannot start it. Its firmware and its driver are from different generations and disagree about how to talk to each other.",
    observable: "the device appears in Windows, is correctly named, and reports that it cannot start",
    symptoms: ["It's listed but it doesn't work", "It has a little triangle on it",
      "Reinstalling the driver doesn't help"],
    fixes: "Match the firmware and the driver — update whichever is behind, one at a time, testing between. Reinstalling the same driver against the same firmware produces the same disagreement.",
    wrongReflex: "reinstall the driver",
    wrongWhy: "It is the same driver going back against the same firmware, so it fails the same way. This is a mismatch between two versions rather than a damaged installation of either.",
    evidence: "A device present and correctly identified, reporting that it cannot start, with firmware and driver from different generations"
  },
  {
    key: "thirdparty", part: "something added to Windows rather than Windows", target: "none",
    objective: "Core 2 \u2014 1.3 / 3.1", scope: "machine", tool: "safemode",
    root: "The machine is unstable in normal use and completely stable in safe mode. Safe mode loads Windows and nothing else, so whatever is causing this is in the nothing else.",
    observable: "constant instability in normal use and a machine that runs perfectly for hours in safe mode",
    symptoms: ["It crashes several times a day", "It's fine in that stripped-down mode",
      "It's never the same error twice"],
    fixes: "Use a clean boot to bisect it: half the non-Microsoft services and startup items off, test, then half again. It takes a few restarts and it names the culprit exactly rather than guessing.",
    wrongReflex: "reinstall Windows",
    wrongWhy: "Safe mode already proved Windows itself is fine, and a reinstall would put the same third-party software back within a week. It also throws away the one piece of evidence you have, which is which half of the software list the fault lives in.",
    evidence: "Complete stability in safe mode and repeated instability in normal boot, on the same hardware"
  },
  {
    key: "sysfiles", part: "damaged Windows system files", target: "none",
    objective: "Core 2 \u2014 1.3 / 3.1", scope: "machine", tool: "eventvwr",
    root: "System files are damaged, most likely by the unclean shutdowns in the log. Windows starts, and components that depend on the damaged files fail in ways that do not look related.",
    observable: "unrelated parts of Windows failing, with the same component-corruption entries appearing in the log each time",
    symptoms: ["Different things break every day", "It's not one program",
      "It's been getting worse since the power cuts"],
    fixes: "Run the system file check and the servicing-store repair, in that order, then confirm the log stops producing corruption entries. Find out why it is shutting down uncleanly, or you will be back.",
    wrongReflex: "malware",
    wrongWhy: "A full scan comes back clean and the entries in the log name specific system components rather than anything that arrived from outside. Reaching for malware because a machine is behaving strangely is a guess, and this log is not a guess.",
    evidence: "Repeated component-corruption entries in the system log, dating from a run of unclean shutdowns"
  }
];

/* =====================================================================
   Scope

   The first question on any Windows call, and the one that decides which
   tool is worth opening. Getting it right narrows the search from the
   whole estate to one profile.
   ===================================================================== */
export const SCOPE_OPTIONS = [
  { key: "user", label: "One user, on this machine — everybody else who signs in is fine" },
  { key: "machine", label: "This machine, for everybody who uses it" },
  { key: "fleet", label: "Every machine of this build — it arrived with something that was pushed" }
];

export function scopeOf(fault) { return fault.scope; }

export function osScopeWhy(fault, chosen) {
  var right = fault.scope;
  if (chosen === right) {
    return {
      user: "One user. Another account on the same machine, the same drive and the same Windows is perfectly happy, and nothing that is true of the machine can explain a fault only one account has. That puts the whole search inside one profile.",
      machine: "This machine, for everybody. It is not one person's settings and it is not something that arrived from outside — it is something about this installation, and every account that signs in meets it.",
      fleet: "Every machine of this build. The moment the same symptom turns up on a machine you have never touched, working on the one in front of you is working on the wrong one of forty."
    }[right];
  }
  return {
    user: "Saying one user means claiming a second account on the same machine would be fine. Check whether that is actually true before you spend an hour inside somebody's profile.",
    machine: "Saying this machine means claiming other machines of the same build are fine. Ask whether anybody else has reported it before you settle there.",
    fleet: "Saying every machine means this arrived with something pushed to all of them. That is worth checking, and it is also the answer that makes a technician stop looking at the machine in front of them."
  }[chosen];
}

/* =====================================================================
   The tools

   The bench on this track is a set of tools rather than a set of parts,
   and choosing between them is the exercise. Every one of them is the
   right answer somewhere on this track and the wrong answer everywhere
   else.
   ===================================================================== */
const TOOLS = [
  { key: "eventvwr", label: "Event Viewer — the system and application logs", mins: 8,
    isolates: ["sysfiles"],
    hit: "The same component-corruption entries, over and over, each one naming a system component — and a run of unexpected-shutdown entries underneath them going back weeks.",
    miss: "Warnings going back months, as there are on every Windows machine, and nothing that lines up with when this started." },
  { key: "taskmgr", label: "Task Manager — what is using the machine right now", mins: 4,
    isolates: ["startupapp"],
    hit: "One startup entry rated high impact, and disk activity that sits at 100% from sign-in and falls to nothing the moment it finishes.",
    miss: "Processor, memory and disk all sitting at ordinary levels, with nothing at the top of any column that should not be there." },
  { key: "devmgr", label: "Device Manager — what Windows thinks it has", mins: 4,
    isolates: ["driverbad", "devicecode10"],
    miss: "Every device present, started, and reporting that it is working properly." },
  { key: "services", label: "Services — what is meant to be running", mins: 5,
    isolates: ["servicedisabled"],
    hit: "The service the missing feature depends on is set to Disabled and is not running. Nothing about that is logged anywhere, which is why nothing turned up in the log.",
    miss: "Every service is at its correct startup type and the ones that should be running are running." },
  { key: "storage", label: "Storage — what is on the drive and how much room is left", mins: 4,
    isolates: ["diskfull"],
    hit: "The system drive has a few hundred megabytes free out of half a terabyte, and every one of the unrelated failures dates from the week it ran out.",
    miss: "Plenty of free space on every volume." },
  { key: "updates", label: "Update history — what changed and whether it stuck", mins: 5,
    isolates: ["updateloop"],
    hit: "The same update, failing with the same result, at every restart — and the same entry on two other machines of this build.",
    miss: "Everything applied cleanly, on schedule, with nothing pending and nothing retrying." },
  { key: "perf", label: "Performance — memory, commit and the page file", mins: 6,
    isolates: ["pagefile"],
    hit: "Committed memory is at its ceiling with physical memory not yet full, and the page file is set to a small fixed size rather than being system-managed.",
    miss: "Commit sits well below its limit, and the page file is system-managed and sized sensibly." },
  { key: "safemode", label: "Boot into safe mode and use it for an hour", mins: 25,
    isolates: ["thirdparty"],
    hit: "An hour in safe mode with no instability at all, on a machine that cannot manage forty minutes in normal use. Safe mode loads Windows and nothing else.",
    miss: "It behaves exactly the same way in safe mode, which puts the fault in Windows itself rather than in what was added to it." },
  { key: "newprofile", label: "Sign in as a second account on the same machine", mins: 6,
    isolates: ["profilecorrupt"],
    hit: "A second account on the same machine, the same drive and the same Windows behaves perfectly for half an hour. Nothing about the machine can explain a fault only one account has.",
    miss: "The second account meets exactly the same behaviour, which rules the profile out." },
  { key: "malwarescan", label: "Run a full malware scan", mins: 45,
    isolates: [],
    miss: "Clean, as it was always going to be. Forty-five minutes to rule out the thing nothing pointed at, while the user cannot work." },
  { key: "reimage", label: "Reimage the machine from the standard build", mins: 120,
    isolates: [],
    miss: "It fixes everything on this track, costs the customer the rest of the day, and teaches you nothing about what was wrong — including whether it will come back tomorrow." }
];

export { TOOLS };

export function winosTests(G, shuffle) {
  var right = TOOLS.filter(function (t) { return t.isolates.indexOf(G.fault.key) !== -1; });
  var wrong = TOOLS.filter(function (t) { return t.isolates.indexOf(G.fault.key) === -1; });
  var pick = right.slice(0, 1).concat(shuffle(wrong).slice(0, 4));
  return shuffle(pick).map(function (t) {
    var iso = t.isolates.indexOf(G.fault.key) !== -1;
    return {
      key: t.key, label: t.label, mins: t.mins, isolating: iso,
      result: iso ? (t.hit || devmgrHit(G)) : t.miss
    };
  });
}

function devmgrHit(G) {
  var w = G.winos;
  return G.fault.key === "driverbad"
    ? "The device is present and correctly named, with a driver-reported problem against it. The driver's install date is " +
      w.driverDate + ", which is the day this started."
    : "The device is present and correctly named and reports that it cannot start. Its firmware is " +
      w.fwVersion + " and its driver is " + w.drvVersion + " — two generations apart.";
}

/* =====================================================================
   Least invasive first

   Step four. Not a procedure with dependencies — an escalation ladder,
   graded on whether the student reached for the smallest thing that could
   work and stopped when it did.
   ===================================================================== */
export const REMEDIES = [
  { key: "disablestartup", label: "Disable the startup entry and sign back in", cost: 1 },
  { key: "rollback", label: "Roll the driver back to the previous version", cost: 1 },
  { key: "cleanup", label: "Clear temporary files and previous installations", cost: 1 },
  { key: "clearcache", label: "Clear the update cache and retry the update once", cost: 2 },
  { key: "setservice", label: "Set the service back to its correct startup type and start it", cost: 1 },
  { key: "setpagefile", label: "Set the page file back to system-managed", cost: 1 },
  { key: "matchfw", label: "Bring the firmware and the driver to matching generations", cost: 2 },
  { key: "cleanboot", label: "Clean-boot and bisect the non-Microsoft services and startup items", cost: 3 },
  { key: "sfc", label: "Run the system file check, then the servicing-store repair", cost: 2 },
  { key: "newprofile", label: "Create a fresh profile and migrate the user's data into it", cost: 3 },
  { key: "hideupdate", label: "Hide the failing update and raise it with whoever owns patching", cost: 2 },
  { key: "reimage", label: "Reimage the machine from the standard build", cost: 5 },
  { key: "reinstallapp", label: "Reinstall the application", cost: 2 },
  { key: "morereram", label: "Order more memory for the machine", cost: 4 }
];

export function remedyByKey(k) {
  return REMEDIES.filter(function (r) { return r.key === k; })[0];
}

export function correctRemedy(fault) {
  return {
    startupapp: "disablestartup", driverbad: "rollback", diskfull: "cleanup",
    updateloop: "clearcache", profilecorrupt: "newprofile", servicedisabled: "setservice",
    pagefile: "setpagefile", devicecode10: "matchfw", thirdparty: "cleanboot",
    sysfiles: "sfc"
  }[fault.key];
}

/* The graded judgement: the smallest thing that could work, and never a
   destructive one before a backup. */
export function remedyWhy(fault, chosen) {
  var right = correctRemedy(fault);
  var r = remedyByKey(chosen), w = remedyByKey(right);
  if (chosen === right) {
    return "The smallest thing that fixes this. " + fault.fixes;
  }
  if (chosen === "reimage") {
    return "Reimaging fixes every fault on this track, which is exactly what makes it the wrong answer to all of them. " +
      "It costs the customer the rest of the day, it does not tell you what was wrong, and it does not tell you " +
      "whether it will happen again on Thursday.";
  }
  if (r && w && r.cost > w.cost) {
    return "That would probably work, and there is something smaller that also works. On this track you reach " +
      "for the least invasive thing that could fix it and you stop when it does — because the customer pays " +
      "for the difference and you learn nothing from the bigger one.";
  }
  return "That does not address what you have found. Go back to what the tool actually told you and ask what " +
    "the smallest change is that would make that reading go away.";
}

/* =====================================================================
   The machine
   ===================================================================== */
var BUILDS = ["Standard desktop build 24.2", "Standard laptop build 24.2",
  "Standard desktop build 23.4", "Engineering build 24.1"];
var DEVICES = ["the wireless adapter", "the graphics adapter", "the fingerprint reader",
  "the card reader", "the audio device"];
var SERVICES = ["Print Spooler", "Windows Search", "Windows Audio",
  "Windows Update", "Background Intelligent Transfer"];
var STARTUPS = ["a document sync client", "a vendor update helper",
  "a hardware control panel", "an inventory agent"];

export function buildWinos(r, fault) {
  var f = fault.key;
  var ramGb = r.pick([8, 8, 16]);
  var driveGb = r.pick([256, 512]);
  var freeMb = f === "diskfull" ? r.int(180, 940) : r.int(60000, 210000);

  return {
    build: r.pick(BUILDS),
    ramGb: ramGb,
    driveGb: driveGb,
    freeMb: freeMb,
    freeLabel: freeMb < 2000 ? freeMb + " MB" : Math.round(freeMb / 1000) + " GB",
    /* Committed memory is physical plus page file, and the page-file ticket
       is the one where the second half of that has been made small. */
    pageFile: f === "pagefile" ? "Fixed, 512 MB" : "System-managed",
    commitUsedGb: f === "pagefile" ? ramGb + 0.4 : Math.round(ramGb * 0.45 * 10) / 10,
    commitLimitGb: f === "pagefile" ? ramGb + 0.5 : ramGb * 2,
    device: r.pick(DEVICES),
    deviceState: f === "driverbad" ? "Stopped — the driver reported a problem"
      : f === "devicecode10" ? "Cannot start"
      : "Working properly",
    driverDate: f === "driverbad" ? "the " + r.int(2, 26) + "th of last month" : "over a year ago",
    fwVersion: f === "devicecode10" ? "1." + r.int(2, 6) : "3." + r.int(1, 9),
    drvVersion: f === "devicecode10" ? "3." + r.int(1, 9) : "3." + r.int(1, 9),
    service: r.pick(SERVICES),
    serviceState: f === "servicedisabled" ? "Disabled, not running" : "Automatic, running",
    startup: r.pick(STARTUPS),
    startupImpact: f === "startupapp" ? "High" : "Low",
    loginMins: f === "startupapp" ? r.int(6, 12) : 1,
    updateState: f === "updateloop"
      ? "Failed and retrying at every restart" : "Up to date, last applied on schedule",
    updateOthers: f === "updateloop" ? "The same failure on every machine of this build" : "Nothing outstanding anywhere",
    safeMode: f === "thirdparty" ? "Stable for an hour with no instability at all"
      : "Behaves exactly as it does in normal use",
    secondAccount: f === "profilecorrupt" ? "Clean for half an hour"
      : "Meets exactly the same behaviour",
    corruption: f === "sysfiles" ? r.int(9, 44) + " component-corruption entries in the last fortnight" : "None",
    uncleanShutdowns: f === "sysfiles" ? r.int(6, 19) : r.int(0, 1),
    malware: "Clean",
    others: f === "updateloop" ? "Two other machines of this build report the same thing"
      : "Nobody else has reported anything like it"
  };
}

/* =====================================================================
   The panels
   ===================================================================== */
export function osMachineRows(G) {
  var w = G.winos;
  return [
    { k: "Build", v: w.build, bad: false },
    { k: "Memory fitted", v: w.ramGb + " GB", bad: false },
    { k: "System drive", v: w.driveGb + " GB, " + w.freeLabel + " free", bad: w.freeMb < 2000 },
    { k: "Time from sign-in to usable", v: w.loginMins + " minute" + (w.loginMins === 1 ? "" : "s"),
      bad: w.loginMins > 3 },
    { k: "Anybody else affected", v: w.others, bad: w.others.indexOf("Two other") === 0 }
  ];
}

export function osToolRows(G) {
  var w = G.winos;
  return [
    { k: "Event Viewer — corruption entries", v: w.corruption, bad: w.corruption !== "None" },
    { k: "Event Viewer — unclean shutdowns", v: String(w.uncleanShutdowns), bad: w.uncleanShutdowns > 3 },
    { k: "Task Manager — highest startup impact", v: w.startup + ", rated " + w.startupImpact,
      bad: w.startupImpact === "High" },
    { k: "Device Manager — " + w.device, v: w.deviceState, bad: w.deviceState !== "Working properly" },
    { k: "Services — " + w.service, v: w.serviceState, bad: w.serviceState !== "Automatic, running" },
    { k: "Performance — committed memory", v: w.commitUsedGb + " GB of " + w.commitLimitGb + " GB",
      bad: w.commitUsedGb / w.commitLimitGb > 0.9 },
    { k: "Performance — page file", v: w.pageFile, bad: w.pageFile !== "System-managed" },
    { k: "Update history", v: w.updateState, bad: w.updateState.indexOf("Failed") === 0 },
    { k: "Full malware scan", v: w.malware, bad: false }
  ];
}

/* =====================================================================
   The reference key
   ===================================================================== */
export const WINOS_FACTS = [
  ["Establish the scope before you open anything",
    "One user on one machine is a profile. Every user on one machine is that installation. Every machine of one build is something that was pushed. Two questions — does a second account see it, and does anybody else — narrow the search more than any tool does."],
  ["What safe mode actually proves",
    "Safe mode loads Windows and nothing else. A machine that is stable in safe mode and unstable in normal use has a working Windows and a problem in what was added to it, and a clean boot bisects the difference in a few restarts."],
  ["Committed memory is not physical memory",
    "Commit is physical memory plus the page file, and it is what applications are actually allowed to ask for. A machine can refuse memory with free RAM showing and gigabytes of free disk, if the page file was made small on purpose."],
  ["A silent failure is usually something not started",
    "A feature that produces an error left an entry somewhere. A feature that does nothing at all, with nothing in any log, is usually a service that is not running — and a service that was disabled does not log the fact."],
  ["A full drive fails in unrelated ways",
    "Windows needs scratch space for almost everything. When it runs out, updates fail, applications cannot save, profiles misbehave and printing stops — six symptoms with one cause, and none of them mention the drive."],
  ["Rolling back is not the same as reinstalling",
    "Reinstalling the same driver against the same firmware produces the same result, because nothing about the pairing changed. Rolling back changes one half of it, which is why it is the answer on a driver that worked last week."],
  ["Least invasive first, and stop when it works",
    "There is always a bigger hammer and reimaging fixes everything here. It also costs the customer their afternoon, tells you nothing about the cause, and tells you nothing about whether it comes back — which is the question they will ask you next week."],
  ["Back up before the destructive step",
    "A fresh profile is the right fix and the old one is the only copy of some of what is in it. The order is: create, migrate, verify, and only then remove."]
];
