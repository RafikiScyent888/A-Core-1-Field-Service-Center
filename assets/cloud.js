/* =====================================================================
   Field Service Center — the virtualization and cloud track

   Hardware grades a part against what physically fits. Networking grades a
   configuration against what actually reaches. Mobile grades a decision
   against what it costs. This one grades an allocation against a host that
   has a finite amount of everything.

   The lesson is oversubscription. A hypervisor will happily let you promise
   more memory than the host owns, and it will do it without complaining
   until the moment every guest wants its share at once. Giving one virtual
   machine everything it asks for is the easy half; leaving enough for the
   others and for the hypervisor itself is the job.

   Three of the seven faults are not resource faults at all. Their
   allocation is already correct and the answer is somewhere else entirely
   — a licence nobody assigned, a quota nobody watched, a sync conflict
   nobody resolved. Reaching for the resource sliders on those is the cloud
   equivalent of retyping a working IP configuration.
   ===================================================================== */

/* ---------------- the seven faults ---------------- */
export const CLOUD_FAULTS = [
  {
    key: "vmram", part: "virtual machine memory allocation", objective: "4.2", kind: "resource",
    root: "The host is oversubscribed on memory. Somebody assigned a new virtual machine more RAM than the host had left, and now guests are swapping or refusing to start.",
    observable: "one virtual machine will not start at all and the ones that are running have gone treacle-slow",
    symptoms: ["The new VM says there is not enough memory to start",
      "The other machines were fine until Tuesday",
      "The host itself is sluggish to log into"],
    fixes: "Bring the total assigned memory back under what the host actually has, leaving the hypervisor its overhead.",
    wrongReflex: "host hardware",
    wrongWhy: "The host has not failed. It is doing exactly what it was told to do with more memory than it owns.",
    evidence: "Assigned memory across the guests exceeds the host's physical memory once the hypervisor's own reservation is counted"
  },
  {
    key: "snapshot", part: "snapshots left running", objective: "4.2", kind: "service",
    root: "A snapshot taken 'just in case' before an upgrade months ago was never deleted. Every write since has gone into a delta file that has quietly eaten the datastore.",
    observable: "the datastore is nearly full and nobody has added anything to it, and every guest on it has slowed down",
    symptoms: ["The datastore is filling up on its own", "Nobody has put anything new on there",
      "It has got slower every month since the upgrade"],
    fixes: "Consolidate the snapshot after checking the guest is healthy, and set a policy that snapshots are deleted within days rather than kept as a substitute for backups.",
    wrongReflex: "storage",
    wrongWhy: "Buying storage to hold a delta file that should not exist is paying for a mistake by the terabyte. The space is not being used by anything anybody wants.",
    evidence: "A snapshot dated months ago with a delta file larger than the guest's own disk"
  },
  {
    key: "timedrift", part: "host clock drift", objective: "4.2", kind: "config",
    root: "The host is not synchronised to a time source, and it has drifted several minutes. Every guest takes its clock from it, so authentication starts refusing tickets.",
    observable: "users on those guests cannot sign in to anything that uses the domain, and the error mentions time",
    symptoms: ["It says the security token is not yet valid",
      "It's every machine on that host", "They can sign in on their laptops fine"],
    fixes: "Point the host at the site's time source, let the guests re-sync from it, and confirm the drift is inside the tolerance authentication allows.",
    wrongReflex: "password",
    wrongWhy: "Their passwords are correct — they sign in on other machines with the same credentials. Authentication that fails on one host and works everywhere else is not a credential problem.",
    evidence: "The host clock several minutes away from the site's time source, with the failures confined to that host's guests"
  },
  {
    key: "backupwin", part: "a backup window that overruns", objective: "4.1", kind: "service",
    root: "The backup job now takes longer than the window it was given. It is still running when the working day starts, so the storage it reads from is saturated exactly when people need it.",
    observable: "everything is slow first thing in the morning and perfectly normal by mid-morning, every working day",
    symptoms: ["It's terrible until about ten", "It's fine by lunchtime",
      "It's been creeping worse for months"],
    fixes: "Re-plan the window against how long the job now actually takes, or change the job so it does less each night. The job is not failing — it has outgrown the time it was given.",
    wrongReflex: "network",
    wrongWhy: "The network is idle by every measure at the time this happens. The saturation is on the storage the backup is reading from, and it clears the moment the job finishes.",
    evidence: "A backup job finishing hours into the working day, with storage latency falling the instant it completes"
  },
  {
    key: "mfa", part: "a lapsed multi-factor enrolment", objective: "4.1", kind: "service",
    root: "The user's second factor was tied to a handset that has been replaced. The account is fine, the licence is fine, and the sign-in cannot complete.",
    observable: "one user cannot sign in to the cloud service from anywhere, with correct credentials, on any device",
    symptoms: ["It takes my password and then stops", "I've tried on three devices",
      "I got a new phone a couple of weeks ago"],
    fixes: "Re-enrol the second factor against the device they actually have now, through the proper identity-verification process rather than by turning the requirement off.",
    wrongReflex: "password reset",
    wrongWhy: "The password is accepted — that is what makes this one confusing. The sign-in gets past the credential and stops at the step after it, and resetting the password again changes nothing about the step that is failing.",
    evidence: "Sign-in logs showing the credential accepted and the second factor never completing, on every device they try"
  },
  {
    key: "region", part: "a service provisioned in the wrong region", objective: "4.1", kind: "service",
    root: "The service was stood up in a region on the other side of the world. It works perfectly and every request makes a round trip nobody budgeted for.",
    observable: "the application is usable and slow for everybody in the office, all the time, in a way that never varies",
    symptoms: ["It's just slow, always", "It's the same for everyone",
      "It was quick in the demo"],
    fixes: "Re-provision the service in the region the users are actually in, and add region to the checklist for standing anything up.",
    wrongReflex: "bandwidth",
    wrongWhy: "The circuit is barely used and adding more of it changes nothing, because the delay is distance rather than capacity. You cannot buy your way out of the speed of light.",
    evidence: "A consistent round-trip time to the service an order of magnitude above anything local, with the circuit almost idle"
  },
  {
    key: "virtext", part: "virtualization extensions", objective: "4.2", kind: "config",
    root: "Hardware virtualization is switched off in the workstation's firmware. The hypervisor installs and runs but cannot start a single 64-bit guest.",
    observable: "no virtual machine will start on this workstation, with an error about hardware support",
    symptoms: ["Every VM fails the moment you press start",
      "It worked on the old machine", "The software says the processor is not supported"],
    fixes: "Enable the virtualization extensions in firmware and reboot. No licence, no hardware, no reinstall.",
    wrongReflex: "processor",
    wrongWhy: "The processor supports it perfectly well. The setting that exposes it to the operating system is turned off.",
    evidence: "The processor reports the extensions as present but disabled in firmware"
  },
  {
    key: "vdi", part: "VDI host storage", objective: "4.1", kind: "resource",
    root: "The VDI host's storage is saturated. Too many desktops were placed on one datastore and they are all waiting on the same disks every morning.",
    observable: "every virtual desktop on one host is slow at the same times of day and fine the rest of the time",
    symptoms: ["Unusable between eight and half past nine",
      "Perfectly fine by eleven", "Only the people on one host complain"],
    fixes: "Move some of the desktops onto the second datastore so the morning login storm is not all landing on the same disks.",
    wrongReflex: "network",
    wrongWhy: "The network is idle during the slowdown. What is queued is disk, not bandwidth.",
    evidence: "Storage latency spikes to hundreds of milliseconds at the exact times the users complain about, with the network flat"
  },
  {
    key: "quota", part: "cloud storage quota", objective: "4.1", kind: "service",
    root: "The team's cloud storage is at its quota. Uploads fail silently and the sync client has been retrying the same files for a fortnight.",
    observable: "files appear to save and then are not there for anyone else",
    symptoms: ["I saved it, they say it is not there",
      "The little icon has been spinning for days", "It only happens with the big files"],
    fixes: "Clear the space or raise the quota, then let the backlog drain.",
    wrongReflex: "sync client",
    wrongWhy: "Reinstalling the client gives you a fresh client that cannot write to a full account either.",
    evidence: "The account is at its storage limit and every failure in the client log is a quota rejection"
  },
  {
    key: "sync", part: "file synchronisation conflict", objective: "4.1", kind: "service",
    root: "Two people edited the same document offline and both copies came back. The sync client kept both and nobody noticed which one they were working from.",
    observable: "work that was definitely done has disappeared, and there are two versions of the same file",
    symptoms: ["My changes are gone", "There is a second copy with somebody's name on it",
      "We were both working on it on the train"],
    fixes: "Merge the conflicted copies deliberately, keep one, and get the team off offline editing of shared documents.",
    wrongReflex: "backup restore",
    wrongWhy: "Nothing was lost, so there is nothing to restore. Both versions are present and one of them is being ignored.",
    evidence: "The folder holds a conflicted copy alongside the original, both modified the same afternoon"
  },
  {
    key: "licence", part: "software licence assignment", objective: "4.1", kind: "service",
    root: "The user has an account but no licence assigned to it. They can sign in to the portal and cannot open the application they need.",
    observable: "sign-in works and the application refuses to open, for one person only",
    symptoms: ["It lets me log in and then does nothing",
      "It works on my colleague's machine with her account",
      "I started on Monday"],
    fixes: "Assign the licence, and check whether the joiner process is meant to do that automatically.",
    wrongReflex: "installation",
    wrongWhy: "The application is installed and identical to everyone else's. It is the entitlement behind the account that is missing.",
    evidence: "The tenant shows the account active with no licence attached, while colleagues on the same build have one"
  },
  {
    key: "spend", part: "metered consumption", objective: "4.1", kind: "service",
    root: "A test environment was spun up for a project and never turned off. It has been billing by the hour for six weeks.",
    observable: "the monthly cloud bill has roughly doubled with no change in what anybody is doing",
    symptoms: ["Finance are asking why the bill went up",
      "Nobody has started any new projects", "It has been climbing since the summer"],
    fixes: "Shut down the idle environment, and put a budget alert on the subscription so the next one is caught in days rather than weeks.",
    wrongReflex: "billing error",
    wrongWhy: "The bill is correct. Metered means you pay for what is running, and something has been running.",
    evidence: "Instances tagged for a finished project are still running and account for almost all of the increase"
  }
,

  /* ---- five more. The twelve above are all a resource, a setting or a
     bill. These add the two shapes that were missing: a system doing
     exactly what it was configured to do while failing the thing it was
     bought for, and a number that looks like capacity and is actually
     something else entirely. ---- */

  {
    key: "cpuready", part: "vCPU over-commitment", objective: "4.2", kind: "resource",
    root: "Every guest on the host has been given far more virtual processors than it uses, and between them they are promised several times the cores the host physically owns. Guests now spend their time queuing for a core rather than running on one.",
    observable: "guests that are slow across the board while not one of them shows high processor usage",
    symptoms: ["Everything on that host feels like wading",
      "The processor graphs are all showing about fifteen percent",
      "It got worse when we gave the database more processors to speed it up"],
    fixes: "Cut the assigned vCPU count back towards what the guests actually use, so a guest that wants a core can have one without waiting behind three others.",
    wrongReflex: "more processors",
    wrongWhy: "Adding vCPUs is what caused this. A guest with eight virtual processors has to wait until eight physical cores are free before it runs at all — the wider you make it, the longer it queues. The usage graphs look idle because waiting is not usage.",
    evidence: "Assigned vCPU several times the host's physical core count, with processor-ready time high and processor usage low on every guest"
  },
  {
    key: "thinprov", part: "thin-provisioned datastore over-commitment", objective: "4.1", kind: "resource",
    root: "The datastore is thin-provisioned and the disks on it have been promised more space than the datastore has. It worked until the guests actually grew into what they were promised, and now the datastore is full and every guest on it is paused.",
    observable: "every guest on one datastore paused at once, on a datastore whose provisioned total is far beyond its real capacity",
    symptoms: ["All the machines on that store stopped at the same moment",
      "The storage report said we had plenty free last month",
      "Nobody has added a new machine to it since spring"],
    fixes: "Free real space on the datastore to un-pause the guests, then reclaim the blocks the guests have deleted and cap provisioning against real capacity rather than against optimism.",
    wrongReflex: "a failed datastore",
    wrongWhy: "The storage is healthy and every disk in it is fine. Thin provisioning is a promise to supply space later, and this datastore has promised more than it owns — the day the guests came to collect is today.",
    evidence: "Provisioned capacity far above the datastore's real size, with actual free space at zero and every guest on it paused"
  },
  {
    key: "portgroup", part: "virtual switch port group", objective: "4.2", kind: "config",
    root: "The guest was migrated to a second host where the port group has a different name. Its virtual network adapter is connected to nothing, so the machine runs perfectly and reaches nowhere.",
    observable: "one guest with no network at all, on a host whose other guests are on the network normally",
    symptoms: ["That one server is off the network completely",
      "It was fine before it was moved on Friday",
      "The others on the same host are all working"],
    fixes: "Reconnect the guest's adapter to the matching port group on the new host, then make the port group names consistent across the cluster so the next migration does not do this.",
    wrongReflex: "the guest's IP configuration",
    wrongWhy: "The address inside the guest is correct and has not changed. An adapter connected to no port group carries nothing regardless of what is configured behind it \u2014 the cable, in effect, is not plugged into anything.",
    evidence: "A guest whose virtual adapter shows no port group on a host where the other guests are connected normally"
  },
  {
    key: "retention", part: "backup retention policy", objective: "4.1", kind: "service",
    root: "Every backup has succeeded every night. The retention is fourteen days, and the file being asked for was deleted six weeks ago. Nothing failed; the policy never matched what the business needed to be able to recover.",
    observable: "an unbroken run of successful backups that cannot produce a file deleted outside the retention period",
    symptoms: ["We need a file back from before the summer",
      "The backup report is green every single morning",
      "Nobody told us there was a limit on how far back it went"],
    fixes: "Tell them plainly that the file is gone, then set the retention to match what the business actually needs to recover and get that agreed in writing rather than assumed.",
    wrongReflex: "a failed backup job",
    wrongWhy: "The job has not missed a night in a year, and the logs prove it. A backup that runs perfectly and keeps fourteen days cannot produce something from six weeks ago \u2014 that is the policy working exactly as written, against a requirement nobody ever wrote down.",
    evidence: "An unbroken run of successful jobs with a retention period shorter than the age of the file being requested"
  },
  {
    key: "egress", part: "data transfer charges", objective: "4.1", kind: "service",
    root: "A reporting job was changed to pull a full copy of a large dataset back on-premises every night instead of processing it where it sits. The compute is unchanged; the bill is data leaving the provider's network, charged by the gigabyte.",
    observable: "a bill that has climbed steadily with no new services running, where almost all of the increase is data transfer out",
    symptoms: ["The bill has nearly doubled since the spring",
      "We have not switched anything new on",
      "The reporting team rewrote their nightly job around then"],
    fixes: "Move the processing to run inside the provider's network and bring back only the result, or transfer only what has changed. Then put an alert on transfer volume, not just on total spend.",
    wrongReflex: "the compute bill",
    wrongWhy: "Compute is within a few dollars of what it was in January, and so is storage. Broken down by charge type, almost all of the increase is one line, and it is not a line anybody thinks about when they picture a cloud bill.",
    evidence: "A bill broken down by charge type showing data transfer out accounting for nearly all of the increase, with compute and storage flat"
  }
];

/* ---------------- the host ---------------- */
export function buildHost(r, fault) {
  /* The hypervisor is not free. Forgetting its reservation is the single
     most common way a capacity plan comes out wrong. */
  var hvRamGb = 8;
  var hvCores = 2;

  var names = ["APP-01", "DB-01", "FILE-01", "TEST-01", "BUILD-01", "PRINT-01"];
  var roles = { "APP-01": "line-of-business application", "DB-01": "database",
    "FILE-01": "file server", "TEST-01": "test environment",
    "BUILD-01": "build agent", "PRINT-01": "print server" };
  var picked = r.shuffle(names).slice(0, 4);
  var guests = picked.map(function (n) {
    var minRam = r.pick([4, 8, 8, 16]);
    var minCores = r.pick([2, 2, 4]);
    return { name: n, role: roles[n], minRam: minRam, minCores: minCores,
      ram: minRam, cores: minCores };
  });

  /* Size the host to the workload rather than picking a number and hoping.
     Generating the two independently produced hosts that could not hold even
     the minimum allocation, which is a ticket with no right answer. */
  var minRamTotal = guests.reduce(function (a, g) { return a + g.minRam; }, 0);
  var minCoreTotal = guests.reduce(function (a, g) { return a + g.minCores; }, 0);
  var ramGb = [64, 96, 128, 192].filter(function (x) {
    return x >= hvRamGb + minRamTotal + 16;
  })[0] || 256;
  var cores = [16, 24, 32, 48].filter(function (x) {
    return x * 2 >= minCoreTotal + 4;
  })[0] || 64;

  if (fault.key === "vmram") {
    /* Push the total past what the host has, the way it actually happens:
       one machine handed far more than it needs by somebody who did not
       check what was left. */
    var greedy = guests[r.int(0, guests.length - 1)];
    var others = minRamTotal - greedy.minRam;
    greedy.ram = ramGb - hvRamGb - others + r.int(8, 32);
  }

  return {
    cores: cores, ramGb: ramGb, hvRamGb: hvRamGb, hvCores: hvCores,
    guests: guests,
    datastores: [
      { name: "DS-FAST-01", desktops: fault.key === "vdi" ? r.int(58, 74) : r.int(22, 30), capacity: 40 },
      { name: "DS-FAST-02", desktops: fault.key === "vdi" ? r.int(2, 8) : r.int(18, 26), capacity: 40 }
    ],
    /* Extra readings the five newer tickets turn on. Every one of them is
       drawn per ticket and read against a stated limit, same as the rest. */
    snapshotDays: fault.key === "snapshot" ? r.int(94, 260) : 0,
    snapshotGb: fault.key === "snapshot" ? r.int(340, 890) : 0,
    guestDiskGb: r.int(180, 280),
    dsFreePct: fault.key === "snapshot" ? r.int(2, 7) : r.int(31, 58),
    clockDriftSec: fault.key === "timedrift" ? r.int(320, 900) : r.int(0, 2),
    clockTolerance: 300,
    backupWindow: "22:00 to 05:00",
    backupFinished: fault.key === "backupwin"
      ? "10:" + (r.int(10, 55)) : "0" + r.int(2, 4) + ":" + r.int(10, 55),
    mfaState: fault.key === "mfa" ? "Enrolled against a device last seen 3 weeks ago" : "Enrolled and completing",
    serviceRegion: fault.key === "region" ? r.pick(["ap-southeast-2", "ap-northeast-1", "sa-east-1"]) : "local",
    rttMs: fault.key === "region" ? r.int(280, 420) : r.int(6, 24),
    circuitPct: r.int(4, 19),
    /* Readings for the five newest tickets. Each one is a number a student
       reads against a stated limit, in the same shape as the twelve above:
       nothing here is a label saying "this one is broken". */
    vcpuRatio: fault.key === "cpuready" ? r.int(5, 9) : 1,
    cpuReadyPct: fault.key === "cpuready" ? r.int(14, 31) : r.int(0, 2),
    cpuUsagePct: fault.key === "cpuready" ? r.int(9, 18) : r.int(24, 51),
    provisionedGb: fault.key === "thinprov" ? r.int(1900, 2600) : r.int(400, 900),
    datastoreGb: 1200,
    thinFreeGb: fault.key === "thinprov" ? 0 : r.int(240, 620),
    portGroupOk: fault.key !== "portgroup",
    retentionDays: 14,
    requestedAgeDays: fault.key === "retention" ? r.int(38, 71) : r.int(2, 11),
    backupSuccessDays: r.int(280, 400),
    egressPct: fault.key === "egress" ? r.int(76, 91) : r.int(3, 9),
    billRisePct: fault.key === "egress" ? r.int(64, 98) : r.int(0, 4)
  };
}

/* ---------------- the allocation, graded ----------------
   Three ways to be wrong and one way to be right, which is the same shape
   as every other build on this page. Starve a guest and it will not run.
   Over-promise and the host cannot honour it. Forget the hypervisor's own
   reservation and you have done both. */
export function checkAllocation(host, alloc) {
  var out = [];
  var totalRam = 0, totalCores = 0;
  host.guests.forEach(function (g) {
    var a = alloc[g.name] || { ram: 0, cores: 0 };
    totalRam += a.ram; totalCores += a.cores;
    out.push({
      label: g.name + " (" + g.role + ")",
      ok: a.ram >= g.minRam && a.cores >= g.minCores,
      why: a.ram < g.minRam
        ? "Needs at least " + g.minRam + "GB to run its workload; it has " + a.ram + "GB."
        : a.cores < g.minCores
          ? "Needs at least " + g.minCores + " vCPU; it has " + a.cores + "."
          : ""
    });
  });
  var ramLeft = host.ramGb - host.hvRamGb - totalRam;
  out.push({
    label: "Host memory: " + totalRam + "GB assigned of " + (host.ramGb - host.hvRamGb) + "GB available",
    ok: ramLeft >= 0,
    why: ramLeft < 0
      ? "That is " + (-ramLeft) + "GB more than the host has once the hypervisor's " + host.hvRamGb + "GB is set aside. A hypervisor will let you promise it and then cannot deliver it."
      : ""
  });
  out.push({
    label: "Host vCPU: " + totalCores + " assigned of " + host.cores + " physical cores",
    ok: totalCores <= host.cores * 2,
    why: totalCores > host.cores * 2
      ? "Beyond about two vCPU per physical core the guests spend their time queueing for a turn rather than working."
      : ""
  });
  /* Waste is a failure too, quietly. Over-provisioning is how a host that
     could have taken another six desktops takes none. */
  var waste = host.guests.reduce(function (a, g) {
    var al = alloc[g.name] || { ram: 0 };
    return a + Math.max(0, al.ram - g.minRam * 2);
  }, 0);
  out.push({
    label: "Headroom for what comes next",
    ok: waste === 0 && ramLeft >= 4,
    why: waste > 0
      ? "One or more guests carry more than twice what they need. It runs, and the host has nothing left for the next request."
      : ramLeft < 4 ? "Nothing left over at all. The next machine anybody asks for needs somewhere to go." : ""
  });
  return out;
}

/* The allocation this host actually wants: everything at its minimum, which
   leaves the most room for whatever is asked for next. */
export function correctAllocation(host) {
  var out = {};
  host.guests.forEach(function (g) { out[g.name] = { ram: g.minRam, cores: g.minCores }; });
  return out;
}

/* ---------------- what actually fixes it ---------------- */
export const CLOUD_ACTIONS = [
  { key: "realloc", label: "Rebalance the resource allocation on the host" },
  { key: "firmware", label: "Enable the virtualization extensions in firmware and reboot" },
  { key: "datastore", label: "Move some desktops onto the second datastore" },
  { key: "quota", label: "Clear space or raise the storage quota, then let the backlog drain" },
  { key: "merge", label: "Merge the conflicted copies and keep one deliberately" },
  { key: "licence", label: "Assign the missing licence to the account" },
  { key: "shutdown", label: "Shut the idle environment down and set a budget alert" },
  { key: "buyhost", label: "Buy a bigger host" },
  { key: "consolidate", label: "Consolidate the stale snapshot and set a retention policy" },
  { key: "timesync", label: "Point the host at the site's time source and let the guests re-sync" },
  { key: "window", label: "Re-plan the backup window against how long the job now takes" },
  { key: "reenrol", label: "Re-enrol the second factor against the device they have now" },
  { key: "reregion", label: "Re-provision the service in the region the users are in" },
  { key: "vcpu", label: "Cut the assigned vCPU count back towards what the guests actually use" },
  { key: "reclaim", label: "Free real space on the datastore and cap provisioning against its actual size" },
  { key: "portgroup", label: "Reconnect the guest's adapter to the matching port group on this host" },
  { key: "retention", label: "Tell them the file is gone, then set retention to match what has to be recoverable" },
  { key: "processlocal", label: "Move the processing to run inside the provider's network and bring back only the result" }
];

export function correctCloudAction(fault) {
  return { vmram: "realloc", virtext: "firmware", vdi: "datastore", quota: "quota",
    sync: "merge", licence: "licence", spend: "shutdown",
    snapshot: "consolidate", timedrift: "timesync", backupwin: "window",
    mfa: "reenrol", region: "reregion",
    cpuready: "vcpu", thinprov: "reclaim", portgroup: "portgroup",
    retention: "retention", egress: "processlocal" }[fault.key];
}

export function cloudActionWhy(fault, chosen) {
  var right = correctCloudAction(fault);
  if (chosen === right) {
    return { realloc: "The host was never short of memory. It was short of memory that had not already been promised to something else.",
      firmware: "A firmware setting and a reboot. No licence, no hardware, no reinstall — and it is worth checking the standard build, because if one machine shipped with it off, others did.",
      datastore: "The desktops were fine; the disks underneath them were not. Spreading the login storm across both datastores is the fix, and it costs nothing.",
      quota: "A full account cannot accept a file however many times the client retries. Clear it or raise it, then watch the backlog drain.",
      merge: "Nothing was lost. Both versions are sitting there and somebody has to decide which is the document — that is a conversation, not a restore.",
      licence: "The account was fine and the software was fine. What was missing was the entitlement joining them, which is a two-minute change and a question about why the joiner process did not do it.",
      shutdown: "Metered means you pay for what runs. Turning it off stops the bleeding; the budget alert is what stops it happening again.",
      consolidate: "The space was never being used by anything anybody wanted. A snapshot is a rollback point for the next twenty minutes, not a backup for the next six months — and treating it as one is how a datastore fills with a file nobody knew existed.",
      timesync: "The credentials were right the whole time, which is exactly why it looked like a credential problem. Authentication will not accept a ticket from a clock several minutes out, and the clock is the host's rather than the user's.",
      window: "The job is not failing and nothing is broken. It has simply outgrown the time it was given, and the fix is arithmetic about the window rather than anything technical.",
      reenrol: "The account, the licence and the password were all correct. What is missing is the second factor, tied to a handset that no longer exists — and re-enrolling it properly is the fix, not switching the requirement off because it is in the way.",
      reregion: "The service works perfectly. It is simply thousands of miles from the people using it, and the delay is distance. No amount of bandwidth shortens a round trip.",
      vcpu: "Narrower guests run sooner. A machine that needs two cores gets scheduled the moment two are free; the same machine given eight has to wait for eight, and spends the difference queuing \u2014 which is why every graph looked idle while every user was waiting.",
      reclaim: "Thin provisioning is a promise to supply space later, and later arrived. Freeing real space restarts the guests; capping what can be promised against what the datastore actually holds is what stops it happening again on a day nobody is watching.",
      portgroup: "The guest was never broken and neither was the network. Its adapter was connected to a port group that does not exist on this host, so it has been running perfectly and talking to nothing since Friday.",
      retention: "Nothing failed and there is nothing to fix, which is the hardest version of this conversation to have. The job kept exactly what it was told to keep. What was never agreed is how far back \u2014 and that is a policy question with a cost attached, not a technical one.",
      processlocal: "Compute and storage were never the problem. The charge is for data leaving the provider's network, and the fix is to stop moving it \u2014 do the work where the data already is and bring back the answer instead of the dataset."
    }[right];
  }
  return { realloc: "The allocation on this host is already sound. Moving the sliders will not change what is wrong.",
    firmware: "Virtualization is already enabled here — guests start perfectly well.",
    datastore: "Storage latency is normal on both datastores. Moving desktops around will not help.",
    quota: "There is plenty of space in the account. The quota is not what is stopping this.",
    merge: "There are no conflicted copies. Nothing here is a sync collision.",
    licence: "The licence is assigned and the account is entitled. That is not the gap.",
    shutdown: "Nothing is running that should not be, and the bill is what it has always been.",
    consolidate: "There are no snapshots on this host older than the retention policy allows.",
    timesync: "The host clock is synchronised and inside tolerance. Time is not what is refusing these sign-ins.",
    window: "The backup job finishes inside its window and has done every night this month.",
    reenrol: "The second factor is enrolled and completing. The sign-in is not stopping there.",
    reregion: "The service is provisioned in the local region and the round trip proves it.",
    vcpu: "The vCPU assignment on this host is already sensible against the cores it has, and processor-ready time is where it should be.",
    reclaim: "Provisioned capacity on these datastores is inside what they physically hold, and there is real free space on both.",
    portgroup: "Every guest's adapter is connected to a port group that exists on this host, and the ones that are meant to be on the network are on it.",
    retention: "The file being asked for is well inside the retention period, so it is still there to restore. Retention is not what is in the way here.",
    processlocal: "Broken down by charge type, data transfer is a rounding error on this bill. Moving the processing would change almost nothing.",
    buyhost: "Buying hardware to solve a problem you have not finished diagnosing is the most expensive guess available. Nothing here says the host is too small."
  }[chosen];
}
