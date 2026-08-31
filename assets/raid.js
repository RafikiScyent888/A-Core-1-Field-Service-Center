/* =====================================================================
   Field Service Center — RAID and storage arrays

   One distinction runs through this whole track, and a technician who
   cannot make it on sight will eventually destroy somebody's data:

     A REDUNDANCY FAULT means a disk has gone and the data has not. The
     array is degraded, it is still serving, and what you have lost is your
     margin. It is urgent because the next failure is the one that costs
     everything — not because anything is lost yet.

     A DATA-LOSS FAULT means the redundancy is already spent. No rebuild,
     no recovery tool and no amount of confidence brings it back. What
     brings it back is a backup, and the conversation is about how old that
     backup is.

   The two look almost identical on a controller screen. One array says
   Degraded and one says Offline, and everything a technician does next
   follows from reading that correctly.

   The third thing this track exists to say, because it is the single most
   expensive misunderstanding in the domain: RAID IS NOT A BACKUP. It
   protects against a disk dying. It does not protect against a deletion, a
   corruption, a ransomware run or a mistake, because it replicates all
   four of those to every member instantly and perfectly.

   Everything here is COMPUTED. Usable capacity and fault tolerance are
   derived from the level and the member list, so the arithmetic is
   something the student does rather than something the page has done.
   ===================================================================== */

/* =====================================================================
   The levels

   `tolerance` is how many members can be lost before the array is gone.
   `usable(n, cap)` is what you actually get out of n disks of that size.
   Both are functions rather than tables, because both are the exam
   question and both are the thing people get wrong under pressure.
   ===================================================================== */
export const LEVELS = {
  "0": {
    key: "0", label: "RAID 0", name: "striping, no redundancy",
    tolerance: function () { return 0; },
    usable: function (n, cap) { return n * cap; },
    note: "Every byte is split across every member. Twice the speed, all of the capacity, and no protection whatsoever — one disk out and the array is gone.",
    minMembers: 2
  },
  "1": {
    key: "1", label: "RAID 1", name: "mirroring",
    tolerance: function () { return 1; },
    usable: function (n, cap) { return cap; },
    note: "Two disks holding identical copies. You pay half your capacity for the right to lose one of them.",
    minMembers: 2
  },
  "5": {
    key: "5", label: "RAID 5", name: "striping with distributed parity",
    tolerance: function () { return 1; },
    usable: function (n, cap) { return (n - 1) * cap; },
    note: "One disk's worth of the total goes to parity, spread across all of them. Survives one failure, and the rebuild afterwards reads every sector of every survivor.",
    minMembers: 3
  },
  "6": {
    key: "6", label: "RAID 6", name: "striping with double parity",
    tolerance: function () { return 2; },
    usable: function (n, cap) { return (n - 2) * cap; },
    note: "Two disks' worth of parity. It exists because on large disks a second failure during a rebuild stopped being rare.",
    minMembers: 4
  },
  "10": {
    key: "10", label: "RAID 10", name: "mirrored pairs, striped",
    tolerance: function () { return 1; },
    usable: function (n, cap) { return (n / 2) * cap; },
    note: "Mirrored pairs with a stripe across them. Half the capacity, fast rebuilds, and guaranteed to survive one failure — more only if the dice land on different pairs.",
    minMembers: 4
  }
};

/* Usable capacity, from the level and the members that make up the array.
   A mixed-size array is levelled down to its smallest member, which is the
   other half of why fitting a smaller replacement is a problem. */
export function usableCapacity(a) {
  var members = a.disks.filter(function (d) { return d.role === "member"; });
  var n = members.length;
  var cap = members.reduce(function (lo, d) { return Math.min(lo, d.capGb); }, Infinity);
  return Math.round(LEVELS[a.level].usable(n, cap));
}

/* How many MORE failures this array can take, right now, in the state it
   is in. This is the number that decides whether a job is urgent, and it
   is not the same as the level's headline tolerance. */
export function remainingTolerance(a) {
  var members = a.disks.filter(function (d) { return d.role === "member"; });
  var lost = members.filter(function (d) {
    return d.state === "Failed" || d.state === "Missing";
  }).length;
  var t = LEVELS[a.level].tolerance();
  return { total: t, lost: lost, left: Math.max(0, t - lost), offline: lost > t };
}

export const TOLERANCE_CHOICES = [
  "The array is already offline — the data on it is gone",
  "None. The next failure takes the array with it",
  "One more",
  "Two more"
];

export function toleranceAnswer(a) {
  var r = remainingTolerance(a);
  if (r.offline) return TOLERANCE_CHOICES[0];
  if (r.left === 0) return TOLERANCE_CHOICES[1];
  if (r.left === 1) return TOLERANCE_CHOICES[2];
  return TOLERANCE_CHOICES[3];
}

/* =====================================================================
   The parts

   The member disks are generated per ticket, because the array is. Only
   the fixed hardware is listed here.
   ===================================================================== */
export const RAID_FIXED_PARTS = [
  {
    key: "controller", label: "The RAID controller",
    role: "Owns the array. It decides what is a member, what is a spare, and what gets rebuilt onto what.",
    fails: "Rarely as hardware. Usually what has gone wrong is what it has been told.",
    seen: "Firmware current, all channels enumerating, no errors logged against the card itself."
  },
  {
    key: "cache", label: "The cache module and its battery",
    role: "Holds writes in memory and acknowledges them immediately. The battery is what makes that safe.",
    fails: "The battery or supercapacitor dies, the controller stops trusting its own cache, and everything gets slow.",
    seen: "Cache present and healthy; the backup unit beside it reports a failed cell and will not hold charge."
  },
  {
    key: "enclosure", label: "The drive enclosure and backplane",
    role: "Carries power and data to every slot, and tells the controller which slot is which.",
    fails: "A backplane fault takes out a slot or a group of slots at once rather than one disk.",
    seen: "Every slot powered, every slot enumerating, no group of them behaving alike."
  },
  {
    key: "backup", label: "The backup system",
    role: "The only thing on this bench that protects against anything other than a disk dying.",
    fails: "By not existing, by not having run, or by never having been tested with a restore.",
    seen: "Nothing has been backed up from this array. The job was configured and has never completed."
  }
];

/* =====================================================================
   The faults
   ===================================================================== */
export const RAID_FAULTS = [
  {
    key: "member1", part: "a single failed member", target: "slotFailed",
    objective: "3.4 + 5.2", cls: "redundancy", test: "arraystatus",
    root: "One disk in the array has failed. The array is degraded, every byte of the data is still there, and the redundancy that was protecting it is now spent.",
    observable: "the array reports degraded, an amber light is on one slot, and everybody is still working normally",
    symptoms: ["There's an orange light on the server",
      "It's beeping in the comms room", "Everything seems fine though"],
    fixes: "Replace the failed member with a disk of equal or greater capacity and let the array rebuild. Until that rebuild finishes there is no protection at all, so it is today's job rather than this week's.",
    wrongReflex: "nothing",
    wrongWhy: "It is still serving every user, which is exactly why this gets left. A degraded array is a working array with no margin — the failure that costs the company its data is the next one, and it has no reason to wait.",
    evidence: "One member reporting Failed with the array degraded and still online"
  },
  {
    key: "member2", part: "a second failure on a single-parity array", target: "slotFailed",
    objective: "3.4 + 5.2", cls: "dataloss", test: "arraystatus",
    root: "A second disk failed while the array was already degraded. RAID 5 survives one failure and this is the second, so the array is offline and the data on it is gone.",
    observable: "the array is offline, the volume has disappeared from the server, and nobody can work",
    symptoms: ["The drive has vanished off the server",
      "It was beeping for a couple of weeks and we meant to call",
      "Can you not just rebuild it?"],
    fixes: "There is nothing to rebuild. Restore from backup onto a rebuilt array, and the honest conversation is about how old that backup is and what happened between then and now.",
    wrongReflex: "rebuild",
    wrongWhy: "A rebuild reconstructs a missing disk from the parity on the others. With two gone on a single-parity array there is not enough left to reconstruct anything, and forcing members back online in the wrong order is how a recoverable situation becomes a permanent one.",
    evidence: "Two members reporting Failed on an array whose level tolerates one"
  },
  {
    key: "predfail", part: "a member reporting predictive failure", target: "slotPred",
    objective: "3.4 + 5.2", cls: "preventive", test: "smartall",
    root: "One member is still Online and serving, and its own SMART data says it is going. Reallocated sectors are climbing and the controller has flagged it predictively.",
    observable: "the array is optimal, nothing has failed, and the controller is warning about one member",
    symptoms: ["It says something about a predicted failure",
      "Everything is working fine", "Is it urgent?"],
    fixes: "Replace it as a planned job while the array is still optimal. Replacing a disk that has not failed yet means the rebuild runs with full redundancy behind it, which is the safest version of this job you will ever get.",
    wrongReflex: "wait",
    wrongWhy: "Waiting for it to fail turns a scheduled swap into a degraded array and a rebuild with no protection. The whole value of a predictive warning is the choice it gives you about when to do the work.",
    evidence: "An Online member with climbing reallocated sectors and a predictive-failure flag, on an optimal array"
  },
  {
    key: "spareidle", part: "a hot spare that is not assigned to anything", target: "slotSpare",
    objective: "3.4 + 5.2", cls: "redundancy", test: "sparecheck",
    root: "There is a hot spare in the enclosure, spun up and healthy, and it belongs to no array. The degraded array beside it has been waiting for a rebuild that will never start on its own.",
    observable: "the array has been degraded for days with a healthy spare sitting in the next slot doing nothing",
    symptoms: ["It's been like that for a fortnight",
      "I thought it had a spare disk in it", "Nothing has changed"],
    fixes: "Assign the spare to this array and let the rebuild run, then replace the failed member so there is a spare again. A spare that is not assigned is a disk in a box.",
    wrongReflex: "disk",
    wrongWhy: "There is nothing to order. The disk you would buy is already in the machine, spinning, and has been the whole time — what is missing is one line of configuration on the controller.",
    evidence: "A healthy unassigned disk in the enclosure with a degraded array that has not started rebuilding"
  },
  {
    key: "bbu", part: "a failed cache battery", target: "cache",
    objective: "3.4 + 5.2", cls: "performance", test: "ctrlpanel",
    root: "The controller's cache battery has failed, so the controller has dropped from write-back to write-through to protect data it can no longer guarantee. Every write now waits for the disks.",
    observable: "everything on the array has become slow at once, with every disk healthy and the array optimal",
    symptoms: ["The whole server got slow overnight",
      "Nothing has changed that we know of", "All the disks are green"],
    fixes: "Replace the cache battery or supercapacitor module. The controller returns to write-back on its own once it trusts the cache again, and the speed comes back with it.",
    wrongReflex: "disks",
    wrongWhy: "Every member is optimal, no queue depth is unusual, and the slowdown arrived across the whole array at one moment rather than creeping. Disks do not all get slower on the same night; a policy change does.",
    evidence: "An optimal array with the controller in write-through and the cache backup unit reporting a failed battery"
  },
  {
    key: "foreign", part: "members reinserted in the wrong slots", target: "slotForeign",
    objective: "3.4 + 5.2", cls: "redundancy", test: "cfgcheck",
    root: "The chassis was moved and the disks were taken out and put back in a different order. The controller sees a valid configuration it did not expect and has flagged the members as foreign rather than assembling them.",
    observable: "the array will not come online after the move, and the disks are all healthy and all reporting foreign",
    symptoms: ["It was working before we moved it",
      "We took the disks out to move it", "They're all in, I checked"],
    fixes: "Import the foreign configuration so the controller adopts the array as it finds it. Every disk is healthy and the data is intact — this is a configuration decision, not a repair.",
    wrongReflex: "clear",
    wrongWhy: "Clearing a foreign configuration discards it. On a screen the two options sit next to each other and one of them says 'clear', and choosing it here destroys an array that was about to come back on its own. Import; never clear, unless you know exactly what you are throwing away.",
    evidence: "Every member healthy and reporting a foreign configuration, on an array that will not assemble"
  },
  {
    key: "rebuildstall", part: "a rebuild stalled by media errors on a survivor", target: "slotPred",
    objective: "3.4 + 5.2", cls: "redundancy", test: "rebuildlog",
    root: "The rebuild has been running for days and is not progressing. A surviving member has unreadable sectors, and a rebuild has to read every sector of every survivor to reconstruct the missing one.",
    observable: "the rebuild has sat at the same percentage for days with the array still degraded",
    symptoms: ["It says rebuilding and the number never changes",
      "It's been like it since Tuesday", "The other disks are all green"],
    fixes: "Take a fresh backup before anything else, because the array is at its most fragile right now. Then replace the survivor with the media errors and rebuild onto known-good disks.",
    wrongReflex: "restart",
    wrongWhy: "Restarting the rebuild runs it into the same unreadable sectors again, and every attempt is another full read of a disk that is already struggling. Doing it repeatedly is how the second failure happens.",
    evidence: "A rebuild stalled at a fixed percentage with medium errors logged against a member that still reports Online"
  },
  {
    key: "raid0", part: "a striped array with no redundancy by design", target: "slotFailed",
    objective: "3.4 + 5.2", cls: "dataloss", test: "arraystatus",
    root: "A member of a RAID 0 array has failed. RAID 0 has no parity and no mirror — it never had any protection to lose.",
    observable: "the volume has disappeared entirely after a single disk failure",
    symptoms: ["Only one disk has failed", "Surely it can rebuild from the others",
      "It was set up for speed"],
    fixes: "Restore from backup onto an array with redundancy. The real finding for the ticket is that this data was on RAID 0 at all, and that is a decision to write up rather than a fault to fix.",
    wrongReflex: "rebuild",
    wrongWhy: "There is nothing to rebuild from. Striping splits every file across every member, so a missing member means missing pieces of every file — the surviving disks hold fragments, not copies.",
    evidence: "A single failed member on a level whose fault tolerance is zero"
  },
  {
    key: "nobackup", part: "deleted data on a healthy array", target: "backup",
    objective: "5.2", cls: "dataloss", test: "backupcheck",
    root: "Somebody deleted a folder. The array is completely healthy and did exactly what it is built to do, which is write that deletion to every member instantly and perfectly.",
    observable: "a folder full of work has gone, with every disk optimal and no error anywhere on the array",
    symptoms: ["We lost a whole folder", "But it's on RAID, isn't it?",
      "Nothing's broken, that's what I don't understand"],
    fixes: "Restore the folder from backup — and the finding on this ticket is that the backup job has never completed. Get one running and tested before you leave, because nothing on this array protects it against a second Tuesday like this one.",
    wrongReflex: "array",
    wrongWhy: "Nothing on the array is broken and nothing about it was ever going to help. RAID protects against a disk dying. A deletion is not a disk dying — it is valid data being written, and every member has a perfect copy of the result.",
    evidence: "An optimal array with every member healthy, and a backup job that has never completed"
  },
  {
    key: "smallreplace", part: "a replacement smaller than the array's members", target: "slotSmall",
    objective: "3.4 + 5.2", cls: "redundancy", test: "cfgcheck",
    root: "The replacement disk fitted for the failed member is smaller than the others. The controller will not rebuild onto it, because it cannot fit a member's worth of data on it.",
    observable: "the new disk is in, the controller sees it, and the rebuild has not started",
    symptoms: ["I put the new one in yesterday", "It's still saying degraded",
      "It was the one we had on the shelf"],
    fixes: "Fit a replacement of equal or greater capacity than the array's member size, then start the rebuild. A larger disk works and the extra is wasted; a smaller one does not work at all.",
    wrongReflex: "controller",
    wrongWhy: "The controller is telling you plainly what is wrong and is refusing to do something that could not work. A rebuild onto a disk too small to hold a member's stripe would fail part way through, which is worse than not starting.",
    evidence: "An unconfigured disk of smaller capacity than the array's member size, with the rebuild not started"
  },
  {
    key: "backplane", part: "a backplane fault taking out a group of slots", target: "enclosure",
    objective: "3.4 + 5.2", cls: "redundancy", test: "slotpattern",
    root: "A section of the backplane has failed. Two adjacent slots dropped out at the same instant, and the disks in them are both healthy.",
    observable: "two adjacent slots went at once, and both disks from them pass a full test in another enclosure",
    symptoms: ["Two of them failed together", "The disks test fine outside it",
      "It happened all at once, not one at a time"],
    fixes: "Replace the enclosure or its backplane, then reinsert the members and import the configuration. Ordering two disks for two disks that are not broken is the mistake this ticket exists to stop.",
    wrongReflex: "disks",
    wrongWhy: "Two disks do not fail in the same second, and both pass a full surface test in another chassis. Failures that arrive together and in adjacent slots are a property of what those slots have in common.",
    evidence: "Adjacent slots failing simultaneously with every disk from them testing clean elsewhere"
  },
  {
    key: "cachedirty", part: "unwritten cache after an unclean shutdown", target: "cache",
    objective: "3.4 + 5.2", cls: "dataloss", test: "ctrlpanel",
    root: "The controller lost power with writes still in cache and a battery that had already failed. The array came back with data the filesystem believes it wrote and the disks never received.",
    observable: "the array is optimal and the volume mounts with corruption scattered through files written just before the outage",
    symptoms: ["It says everything is fine", "Some files won't open",
      "It's only the ones from Friday afternoon"],
    fixes: "Restore the affected files from backup. The array is healthy and cannot repair this, because as far as it is concerned nothing went wrong — the writes it lost were never on it.",
    wrongReflex: "rebuild",
    wrongWhy: "There is nothing to rebuild. Every member is Online and consistent with every other member; what is missing was never written to any of them, and parity across a set of disks that agree with each other cannot reconstruct data none of them ever had.",
    evidence: "An optimal array with a cache battery that had already failed and corruption confined to writes from just before the outage"
  },
  {
    key: "wrongslot", part: "the wrong disk pulled from a degraded array", target: "slotPred",
    objective: "3.4 + 5.2", cls: "dataloss", test: "arraystatus",
    root: "Somebody pulled a disk to replace the failed one and pulled a healthy member instead. On a single-parity array that is a second failure, and the array went offline in their hands.",
    observable: "the array was degraded and serving, a disk was pulled, and it went offline immediately",
    symptoms: ["It was still working before I touched it", "I pulled the one with the light on",
      "It went off as soon as I took it out"],
    fixes: "Put the healthy member straight back and see whether the controller will bring the array back rather than treating it as foreign. If it will not, restore from backup — and the finding is that nobody identified the slot before pulling.",
    wrongReflex: "the new disk",
    wrongWhy: "Fitting the replacement changes nothing while a second member is missing. What matters is the disk that was taken out, and whether the controller will accept it back before anything else is done to the array.",
    evidence: "An array that went from degraded to offline at the moment a member was removed"
  },
  {
    key: "expandwrong", part: "an expansion that cannot proceed", target: "controller",
    objective: "3.4 + 5.2", cls: "preventive", test: "cfgcheck",
    root: "Disks were added to grow the array and the expansion has not started, because the controller will not expand a level that is already at its maximum member count on this card.",
    observable: "new disks are fitted and recognised, the array is optimal, and the capacity has not changed",
    symptoms: ["I put the new disks in a week ago", "It still says the old size",
      "Nothing is broken as far as I can tell"],
    fixes: "Check the controller's supported member count for this level before anything else. If the array cannot grow, the new disks become a second array or the data moves — and either is a planned job with a maintenance window.",
    wrongReflex: "the new disks",
    wrongWhy: "The disks are recognised, healthy and the right size. What has refused is the operation, and the controller has a documented limit that explains exactly why.",
    evidence: "New members recognised and unconfigured with the array optimal and its capacity unchanged"
  },
  {
    key: "rebuildslow", part: "a rebuild competing with production load", target: "controller",
    objective: "3.4 + 5.2", cls: "redundancy", test: "rebuildlog",
    root: "The rebuild is progressing and it is progressing slowly, because the controller's rebuild priority is set low and the array is busy all day.",
    observable: "the rebuild advances a few percent a day and the array is degraded the whole time",
    symptoms: ["It's rebuilding but it's taking days", "It does move, just barely",
      "Everything else on it works fine"],
    fixes: "Raise the rebuild priority and, if the site can take it, run it overnight when the array is quiet. Every extra day at low priority is another day with no redundancy at all.",
    wrongReflex: "the replacement disk",
    wrongWhy: "The replacement is healthy and the rebuild is genuinely progressing, which is what tells you the disk is fine. What is slow is how much of the controller's attention it is being given, and that is a setting.",
    evidence: "A rebuild advancing steadily but slowly, with rebuild priority set low and the array busy"
  }
];

/* =====================================================================
   Redundancy against data loss

   The classification this whole track exists for, graded on its own,
   before the action.
   ===================================================================== */
export const CLASS_OPTIONS = [
  { key: "redundancy", label: "Redundancy fault — the data is intact and the protection is gone" },
  { key: "dataloss", label: "Data-loss fault — the redundancy is spent and this comes back from backup or not at all" },
  { key: "preventive", label: "Neither yet — nothing has failed and this is a planned replacement" },
  { key: "performance", label: "Neither — the array is healthy and something else is making it slow" }
];

export function classOf(fault) { return fault.cls; }

export function classWhy(fault, chosen) {
  var right = fault.cls;
  if (chosen === right) {
    return {
      redundancy: "A redundancy fault. Every byte is still there and the thing you have lost is your margin — which makes this urgent rather than catastrophic, and makes 'it is still working, leave it' the most expensive sentence on the ticket.",
      dataloss: "A data-loss fault. The redundancy is already spent, and no rebuild, recovery tool or amount of confidence reconstructs what is not there. What comes next is a restore and an honest conversation about the date on it.",
      preventive: "Neither, yet. Nothing has failed and the array is optimal — which is exactly why this is the best possible time to do the work, because the rebuild will run with full protection behind it.",
      performance: "Neither. Every member is healthy and the array is optimal; what has changed is how the controller is handling writes. Reaching for a disk here means replacing a working part to fix something that is not about disks at all."
    }[right];
  }
  return {
    redundancy: "Calling this a redundancy fault means believing the data is still there and can be rebuilt back into protection. Read the member states and the level's tolerance again and check whether that is true.",
    dataloss: "Calling this a data-loss fault means telling a customer their data is gone. Before you say that to anybody, count the failed members against what this level actually tolerates.",
    preventive: "A planned replacement is what you do when nothing has failed and the array is optimal. Check whether that describes what is in front of you.",
    performance: "A performance answer says every member is healthy and the array is fine. Look at the member states before you settle on that."
  }[chosen];
}

/* =====================================================================
   What actually gets done
   ===================================================================== */
export const RAID_ACTIONS = [
  { key: "replace", label: "Replace the failed member and let the array rebuild" },
  { key: "planned", label: "Schedule a planned replacement while the array is still optimal" },
  { key: "assign", label: "Assign the idle spare to this array and start the rebuild" },
  { key: "cachebatt", label: "Replace the cache battery module" },
  { key: "import", label: "Import the foreign configuration so the controller adopts the array" },
  { key: "clearcfg", label: "Clear the foreign configuration and build the array again" },
  { key: "backupthen", label: "Take a fresh backup first, then replace the member with media errors" },
  { key: "restore", label: "Rebuild the array and restore from backup" },
  { key: "restorefix", label: "Restore from backup, then get a backup job running and tested" },
  { key: "bigger", label: "Fit a replacement of equal or greater capacity, then rebuild" },
  { key: "rebuildagain", label: "Restart the rebuild and let it run" },
  { key: "newcontroller", label: "Replace the RAID controller" },
  { key: "swapenclosure", label: "Replace the enclosure, then reinsert the members and import the configuration" },
  { key: "restorefiles", label: "Restore the affected files from backup" },
  { key: "putback", label: "Put the healthy member straight back and see whether the array comes up" },
  { key: "checklimit", label: "Check the controller's supported member count before planning the expansion" },
  { key: "raisepriority", label: "Raise the rebuild priority and run it while the array is quiet" }
];

export function correctRaidAction(fault) {
  return {
    member1: "replace", member2: "restore", predfail: "planned", spareidle: "assign",
    bbu: "cachebatt", foreign: "import", rebuildstall: "backupthen", raid0: "restore",
    nobackup: "restorefix", smallreplace: "bigger",
    backplane: "swapenclosure", cachedirty: "restorefiles", wrongslot: "putback",
    expandwrong: "checklimit", rebuildslow: "raisepriority"
  }[fault.key];
}

export function raidActionWhy(fault, chosen) {
  if (chosen === correctRaidAction(fault)) return fault.fixes;
  return {
    replace: "Nothing here is fixed by swapping a member and rebuilding. Check what the member states actually say before you pull a disk out of a live array.",
    planned: "A planned replacement is for an array that is still optimal. This one is not in that state.",
    assign: "There is no idle spare sitting in this enclosure waiting to be given a job.",
    cachebatt: "The cache and its battery are both healthy, and the controller is in write-back. The cache is not what is wrong here.",
    import: "There is no foreign configuration to import. Every member is where the controller expects it.",
    clearcfg: "Clearing a configuration discards it. On the one ticket where a foreign configuration exists, this is the answer that destroys an array that was about to come back on its own — and everywhere else there is nothing to clear.",
    backupthen: "No rebuild is stalled and no survivor is throwing media errors.",
    restore: "Telling a customer to restore from backup means telling them the data on the array is gone. Count the failures against the level's tolerance before you say it.",
    restorefix: "This one is for an array that is perfectly healthy and has lost data anyway. That is not what the member states are describing.",
    bigger: "The replacement fitted is the right size, or there is no replacement in this ticket at all.",
    rebuildagain: "Running the same rebuild at the same unreadable sectors gets the same result and puts another full read across a disk that is already struggling.",
    newcontroller: "The controller is enumerating every channel, running current firmware and logging nothing against itself. It is doing its job — usually what has gone wrong is what it has been told.",
    swapenclosure: "No group of slots has failed together, and nothing about this points at what the slots have in common.",
    restorefiles: "Nothing on this volume is corrupt. The files that are there are the files that were written.",
    putback: "No healthy member has been pulled from this array, so there is nothing to put back.",
    checklimit: "No expansion has been attempted here, and the array's capacity is what it has always been.",
    raisepriority: "No rebuild is running, so there is no priority to raise."
  }[chosen];
}

/* =====================================================================
   The tests
   ===================================================================== */
const TESTS = [
  { key: "arraystatus", label: "Read the array's state and every member's state", mins: 3,
    isolates: ["member1", "member2", "raid0", "wrongslot"],
    miss: "Array optimal, every member Online, no member missing. Whatever this is, it is not a failed disk." },
  { key: "smartall", label: "Pull SMART from every member and compare them", mins: 8,
    isolates: ["predfail"],
    hit: "One member is Online and serving, with reallocated sectors climbing week on week and a predictive flag against it. The others are clean.",
    miss: "Every member's attributes are clean and comparable. Nothing is trending anywhere." },
  { key: "sparecheck", label: "List the spares and what each one is assigned to", mins: 4,
    isolates: ["spareidle"],
    hit: "One healthy disk in the enclosure, spun up, assigned to nothing at all — beside an array that has been degraded for days.",
    miss: "Every disk in the enclosure is either a member or is not there. There is no spare sitting idle." },
  { key: "ctrlpanel", label: "Read the controller's cache and write policy", mins: 4,
    isolates: ["bbu", "cachedirty"],
    miss: "Write-back enabled, cache healthy, backup unit charged and passing its own test." },
  { key: "rebuildlog", label: "Read the rebuild progress and the medium-error counters", mins: 5,
    isolates: ["rebuildstall", "rebuildslow"],
    miss: "No rebuild running, and no member logging medium errors." },
  { key: "cfgcheck", label: "Compare the controller's configuration against the disks it can see", mins: 5,
    isolates: ["foreign", "smallreplace", "expandwrong"],
    miss: "The configuration on the card matches the disks in the slots, and every disk is the size the array expects." },
  { key: "backupcheck", label: "Check when this array was last backed up and whether a restore has ever been tested", mins: 6,
    isolates: ["nobackup"],
    hit: "The job was configured eleven months ago and has never completed once. Nothing on this array has ever been backed up.",
    miss: "Backed up nightly, last restore test passed, retention as documented." },
  { key: "slotpattern", label: "Check which slots failed and test those disks in another chassis", mins: 15,
    isolates: ["backplane"],
    hit: "Two adjacent slots went in the same second, and both disks out of them pass a full surface test in another chassis. Disks do not fail in formation.",
    miss: "The failures are not adjacent and are not simultaneous, and the disks that failed fail everywhere." },
  { key: "reseat", label: "Reseat every disk and every cable in the enclosure", mins: 20,
    isolates: [],
    miss: "No change, and you have just taken every member of a live array out and put it back. On a degraded array that is a risk taken for nothing." },
  { key: "chkdsk", label: "Run a filesystem check across the volume", mins: 45,
    isolates: [],
    miss: "The filesystem is consistent. It was always going to be — a filesystem check looks above the array, and everything interesting here is below it." },
  { key: "fwupdate", label: "Update the controller firmware", mins: 30,
    isolates: [],
    miss: "It was already current, and firmware on a degraded array is a change you make when there is a reason, not while you are looking for one." }
];

export function raidTests(G, shuffle) {
  var right = TESTS.filter(function (t) { return t.isolates.indexOf(G.fault.key) !== -1; });
  var wrong = TESTS.filter(function (t) { return t.isolates.indexOf(G.fault.key) === -1; });
  var pick = right.slice(0, 1).concat(shuffle(wrong).slice(0, 4));
  return shuffle(pick).map(function (t) {
    var iso = t.isolates.indexOf(G.fault.key) !== -1;
    return {
      key: t.key, label: t.label, mins: t.mins, isolating: iso,
      result: iso ? (t.hit || sharedHit(G, t.key)) : t.miss
    };
  });
}

/* Two instruments serve more than one fault, and the reading is what
   separates them — which is the point, because on a real call you read one
   screen and it has to tell you which of three things you are looking at. */
function sharedHit(G, key) {
  var a = G.array, f = G.fault.key;
  var lost = a.disks.filter(function (d) {
    return d.role === "member" && (d.state === "Failed" || d.state === "Missing");
  });
  if (key === "arraystatus") {
    if (f === "wrongslot") {
      var gone = a.disks.filter(function (d) { return d.state === "Missing"; })[0];
      var died = a.disks.filter(function (d) { return d.state === "Failed"; })[0];
      return "Slot " + died.slot + " is Failed and slot " + gone.slot +
        " is Missing. The failed one is still in the machine; the missing one was healthy and was taken out.";
    }
    if (f === "member1")
      return "Array degraded, still serving. One member Failed in slot " + lost[0].slot +
        " and the rest Online. " + LEVELS[a.level].label + " tolerates exactly one, and that one is now spent.";
    if (f === "member2")
      return "Array offline. Two members Failed — slots " + lost.map(function (d) { return d.slot; }).join(" and ") +
        " — on a level that tolerates one.";
    return "Array offline after a single failure in slot " + lost[0].slot + ". " +
      LEVELS[a.level].label + " has a fault tolerance of zero, so there was never anything to lose it from.";
  }
  if (key === "ctrlpanel") {
    return f === "bbu"
      ? "The controller has dropped to write-through, and the cache backup unit reports a failed battery that will not hold charge."
      : "The cache backup unit failed some time ago, and the last shutdown was unclean with writes still in cache. " +
        "The array is optimal and consistent \u2014 what is missing was never written to any member.";
  }
  if (key === "rebuildlog") {
    return f === "rebuildstall"
      ? "The rebuild has sat at the same percentage for " + a.rebuildDays +
        " days, and one surviving member is logging medium errors every time it is read."
      : "The rebuild is at " + a.rebuildPct + "% after " + a.rebuildDays +
        " days and still advancing, with rebuild priority set to " + a.rebuildPriority +
        " on an array that is busy all day.";
  }
  if (key === "cfgcheck") {
    if (f === "expandwrong") {
      var news = a.disks.filter(function (d) { return d.role === "new"; });
      return news.length + " new disks recognised at " + news[0].capGb +
        "GB each and members of nothing, on an optimal array whose capacity has not changed. " +
        "The card has a documented member limit for this level and this array is already at it.";
    }
    if (f === "foreign")
      return "Every disk healthy, and every one of them reporting a foreign configuration. The card is seeing a valid array it does not believe is its own.";
    var small = a.disks.filter(function (d) { return d.role === "small"; })[0];
    return "The replacement in slot " + small.slot + " is " + small.capGb + "GB against a member size of " +
      a.memberGb + "GB. The controller will not rebuild onto it, and it is telling you why.";
  }
  return "";
}

/* =====================================================================
   The array

   Sized and stated per ticket. Every member state is set from the fault,
   so the panel and the arithmetic can never disagree with each other.
   ===================================================================== */
var MODELS = ["Corvid EN-4 enterprise SATA", "Meridian DX enterprise SAS",
  "Halden NL-8 nearline SATA", "Calder SE enterprise SAS"];

export function buildArray(r, fault) {
  var f = fault.key;

  /* The level has to be able to have the fault. A double failure needs
     single parity to be catastrophic; a RAID 0 ticket needs RAID 0. */
  var level = f === "raid0" ? "0"
    /* A double failure is only catastrophic on single parity, and a group
       of two slots is only survivable on double parity. Each fault gets a
       level that lets it be the thing it is meant to be. */
    : f === "member2" || f === "wrongslot" ? "5"
    : f === "backplane" ? "6"
    : f === "bbu" || f === "nobackup" || f === "cachedirty" ? r.pick(["1", "5", "6", "10"])
    : r.pick(["5", "5", "6", "10"]);

  var L = LEVELS[level];
  var count = level === "1" ? 2
    : level === "10" ? r.pick([4, 6])
    : level === "6" ? r.pick([4, 5, 6])
    : level === "0" ? r.pick([2, 3])
    : r.pick([3, 4, 5]);

  var memberGb = r.pick([1000, 2000, 4000, 8000]);
  var model = r.pick(MODELS);
  var hours = r.int(21000, 44000);

  var disks = [];
  for (var i = 0; i < count; i++) {
    disks.push({
      slot: i + 1, model: model, capGb: memberGb, role: "member", state: "Online",
      reall: 0, medium: 0, hours: hours - r.int(0, 900), predFail: false
    });
  }

  /* Which slots the fault lands on, drawn per ticket so the answer is never
     in the same place twice. */
  var pick1 = r.int(1, count);
  var pick2 = pick1 === count ? 1 : pick1 + 1;

  if (f === "member1" || f === "raid0") {
    disks[pick1 - 1].state = "Failed";
  } else if (f === "member2") {
    disks[pick1 - 1].state = "Failed";
    disks[pick2 - 1].state = "Failed";
  } else if (f === "predfail") {
    disks[pick1 - 1].predFail = true;
    disks[pick1 - 1].reall = r.int(220, 1400);
  } else if (f === "spareidle") {
    disks[pick1 - 1].state = "Failed";
    disks.push({
      slot: count + 1, model: model, capGb: memberGb, role: "spare", state: "Online",
      reall: 0, medium: 0, hours: r.int(9000, 20000), predFail: false, assigned: null
    });
  } else if (f === "foreign") {
    disks.forEach(function (d) { d.state = "Foreign"; });
  } else if (f === "rebuildstall") {
    disks[pick1 - 1].state = "Failed";
    disks[pick2 - 1].medium = r.int(14, 260);
    disks[pick2 - 1].reall = r.int(60, 700);
  } else if (f === "backplane") {
    /* Adjacent, and simultaneous — which is the signature. */
    var a1 = Math.min(pick1, count - 1);
    disks[a1 - 1].state = "Failed";
    disks[a1].state = "Failed";
  } else if (f === "wrongslot") {
    disks[pick1 - 1].state = "Failed";     // the one that actually failed
    disks[pick2 - 1].state = "Missing";    // the healthy one somebody pulled
  } else if (f === "rebuildslow") {
    disks[pick1 - 1].state = "Failed";
  } else if (f === "expandwrong") {
    /* The new disks are present, recognised, and members of nothing. */
    for (var e = 0; e < 2; e++) {
      disks.push({
        slot: count + 1 + e, model: model, capGb: memberGb, role: "new",
        state: "Unconfigured — recognised, not a member", reall: 0, medium: 0,
        hours: r.int(40, 400), predFail: false
      });
    }
  } else if (f === "smallreplace") {
    /* The configuration still expects N members and one of them is gone —
       the failed disk was pulled. What is physically in that slot now is a
       replacement too small to rebuild onto, and it is listed as its own
       row rather than standing in for the member, because the controller
       does not consider it one. Overwriting the member entry here dropped
       the array below its level's minimum member count. */
    disks[pick1 - 1].state = "Missing";
    disks.push({
      slot: pick1, model: r.pick(MODELS), capGb: memberGb / 2, role: "small",
      state: "Unconfigured — too small for this array", reall: 0, medium: 0,
      hours: r.int(200, 3000), predFail: false
    });
  }

  var a = {
    level: level, levelLabel: L.label, levelName: L.name,
    memberGb: memberGb, disks: disks,
    controller: r.pick(["Corvid MR-940 8-port", "Meridian RC-620i", "Halden SR-1200"]),
    firmware: "51." + r.int(10, 34) + "." + r.int(0, 9),
    stripeKb: r.pick([64, 128, 256]),
    writePolicy: f === "bbu" ? "Write-through (forced)" : "Write-back",
    cacheState: f === "bbu" ? "Healthy, not in use" : "Healthy",
    bbuState: (f === "bbu" || f === "cachedirty") ? "Failed — will not hold charge" : "Charged, passing",
    rebuildPct: f === "rebuildstall" ? r.int(11, 38)
      : f === "rebuildslow" ? r.int(9, 44) : null,
    rebuildDays: f === "rebuildstall" ? r.int(3, 9) : f === "rebuildslow" ? r.int(4, 11) : 0,
    rebuildPriority: f === "rebuildslow" ? "Low (10%)" : "Normal (50%)",
    /* An unclean shutdown with a dead battery is the one way a healthy
       array comes back missing data it believes it wrote. */
    lastShutdown: f === "cachedirty" ? "Unclean — power lost during writes" : "Clean",
    volumeCheck: f === "cachedirty" ? "Corruption in files written in the hour before the outage" : "Consistent",
    lastBackup: f === "nobackup" ? "never — job configured " + r.int(7, 15) + " months ago and has never completed"
      : "last night, " + r.pick(["01:12", "02:40", "23:05"]) + ", verified",
    restoreTested: f === "nobackup" ? "never" : r.pick(["3 months ago, passed", "last quarter, passed"]),
    usedPct: r.int(38, 79),
    volume: r.pick(["FILESHARE", "APPDATA", "ARCHIVE", "VMSTORE"])
  };

  /* The array's own state, derived rather than declared, so it cannot
     disagree with the member list beside it. */
  var t = remainingTolerance(a);
  a.state = t.offline ? "Offline"
    : f === "foreign" ? "Not assembled — foreign configuration"
    : (f === "rebuildstall" || f === "rebuildslow") ? "Degraded, rebuilding"
    : t.lost > 0 ? "Degraded"
    : "Optimal";
  a.usableGb = usableCapacity(a);
  return a;
}

/* =====================================================================
   The panels
   ===================================================================== */
export function arrayRows(G) {
  var a = G.array;
  return [
    { k: "Volume", v: a.volume, bad: false },
    { k: "Level", v: a.levelLabel + " — " + a.levelName, bad: false },
    { k: "Members", v: a.disks.filter(function (d) { return d.role === "member"; }).length + " × " + a.memberGb + "GB", bad: false },
    { k: "Stripe size", v: a.stripeKb + "KB", bad: false },
    { k: "State", v: a.state, bad: a.state !== "Optimal" },
    { k: "Rebuild", v: a.rebuildPct === null ? "not running"
      : G.fault.key === "rebuildslow"
        ? a.rebuildPct + "% after " + a.rebuildDays + " days, and still advancing"
        : a.rebuildPct + "% — unchanged for " + a.rebuildDays + " days",
      bad: a.rebuildPct !== null },
    { k: "Rebuild priority", v: a.rebuildPriority, bad: a.rebuildPriority.indexOf("Low") === 0 },
    { k: "Last shutdown", v: a.lastShutdown, bad: a.lastShutdown !== "Clean" },
    { k: "Volume consistency check", v: a.volumeCheck, bad: a.volumeCheck !== "Consistent" },
    { k: "Volume used", v: a.usedPct + "%", bad: false }
  ];
}

export function diskRows(G) {
  var a = G.array;
  return a.disks.map(function (d) {
    return {
      slot: d.slot,
      model: d.model,
      cap: d.capGb + "GB",
      role: d.role === "member" ? "Member"
        : d.role === "spare" ? "Hot spare (unassigned)"
        : d.role === "new" ? "Newly added, not a member"
        : "Replacement fitted",
      state: d.state + (d.predFail ? " — predictive failure" : ""),
      reall: d.reall,
      medium: d.medium,
      hours: d.hours,
      bad: d.state === "Failed" || d.state === "Missing" || d.predFail
        || d.medium > 0 || d.role === "small" || d.role === "new" || d.state === "Foreign"
    };
  });
}

export function controllerRows(G) {
  var a = G.array;
  return [
    { k: "Controller", v: a.controller, bad: false },
    { k: "Firmware", v: a.firmware + " (current)", bad: false },
    { k: "Write policy", v: a.writePolicy, bad: a.writePolicy !== "Write-back" },
    { k: "Cache", v: a.cacheState, bad: a.cacheState !== "Healthy" },
    { k: "Cache backup unit", v: a.bbuState, bad: a.bbuState.indexOf("Failed") === 0 }
  ];
}

export function backupRows(G) {
  var a = G.array;
  return [
    { k: "Last successful backup", v: a.lastBackup, bad: a.lastBackup.indexOf("never") === 0 },
    { k: "Restore last tested", v: a.restoreTested, bad: a.restoreTested === "never" }
  ];
}

/* Which slot the locate question is pointing at, resolved from the array
   rather than written beside the fault. */
export function raidTarget(G) {
  var a = G.array, t = G.fault.target;
  if (t === "slotFailed") {
    var f = a.disks.filter(function (d) { return d.role === "member" && d.state === "Failed"; })[0];
    return "slot" + f.slot;
  }
  if (t === "slotPred") {
    /* On the wrong-slot ticket the disk that matters is the healthy one
       somebody pulled, not the one that failed. */
    if (G.fault.key === "wrongslot") {
      var m = a.disks.filter(function (d) { return d.state === "Missing"; })[0];
      return "slot" + m.slot;
    }
    var p = a.disks.filter(function (d) { return d.predFail || d.medium > 0; })[0];
    return "slot" + p.slot;
  }
  if (t === "slotSpare") {
    var s = a.disks.filter(function (d) { return d.role === "spare"; })[0];
    return "slot" + s.slot;
  }
  if (t === "slotSmall") {
    var m = a.disks.filter(function (d) { return d.role === "small"; })[0];
    return "slot" + m.slot;
  }
  if (t === "slotForeign") {
    /* Every member is foreign, so the honest answer is that no single disk
       is at fault — the configuration is. */
    return "controller";
  }
  return t;
}

/* =====================================================================
   The reference key
   ===================================================================== */
export const RAID_FACTS = [
  ["What each level actually costs you",
    "RAID 0 gives all of the capacity and no protection. RAID 1 gives half and survives one failure. RAID 5 gives you one disk less than the total and survives one. RAID 6 gives you two less and survives two. RAID 10 gives you half and survives one for certain."],
  ["Fault tolerance is not a property of the disks",
    "It is a property of the level, and it is spent the moment a member fails. A degraded array has a tolerance of zero regardless of what its level says on paper, and that is why a degraded array is today's job."],
  ["RAID is not a backup",
    "It protects against a disk dying and nothing else. A deletion, a corruption, an encryption or a mistake is valid data being written, and every member gets a perfect copy of it instantly. The only thing that protects against those is a copy that is not attached to the array."],
  ["Why the rebuild is the dangerous part",
    "Reconstructing a member means reading every sector of every survivor. Disks that have sat quietly for years get their first full read in a long time, and unreadable sectors that were never noticed surface exactly when there is no redundancy left to absorb them."],
  ["Import, never clear",
    "A foreign configuration is an array the controller has found and does not yet own. Importing adopts it with the data intact. Clearing discards it. The two sit next to each other on the screen and only one of them is reversible."],
  ["Replacements go up, never down",
    "A replacement of equal or greater capacity works, and anything above the member size is wasted. A smaller one will not rebuild at all, because the controller cannot fit a member's worth of stripe on it."],
  ["A hot spare has to be assigned",
    "A disk sitting in a slot is a disk sitting in a slot. Until it is assigned to an array it is not a spare, and a degraded array will wait next to it indefinitely."],
  ["Write-back and write-through",
    "With a healthy cache battery the controller acknowledges a write as soon as it is in cache. Without one it waits for the disks, because it can no longer promise to finish what it accepted. Everything still works and everything is slower — and no disk is at fault."]
];
