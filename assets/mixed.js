/* =====================================================================
   Field Service Center — the mixed track

   The other four tracks tell you where to look before you start. This one
   does not, and that is the whole exercise.

   Every ticket here presents in one domain and lives in another. "The
   printer is offline" is a network fault. "The laptop will not get on the
   wireless" is a hardware fault. "The cloud is slow" is a cable. The user
   is not being unhelpful — they are describing the thing they can see, and
   the thing they can see is downstream of the thing that broke.

   So the graded skill is scoping: naming the domain the fault actually
   lives in, and — the part nobody drills — ruling the innocent domain OUT
   with a piece of evidence rather than a shrug. A technician who checks the
   network on a power supply fault and confirms it is fine has done the job
   properly. One who never checks has been lucky.
   ===================================================================== */

export const DOMAINS = [
  { key: "hardware", label: "Hardware — something inside the machine" },
  { key: "network", label: "Networking — addressing, cabling or the switch" },
  { key: "mobile", label: "Mobile — the handset or its management" },
  { key: "cloud", label: "Virtualization and cloud — the host or the service" },
  /* Printers were missing, and their absence was a real bug rather than an
     omission: four of these crossings are reported as printer faults, and
     with nowhere to put that they were tagged with whatever domain the real
     fault turned out to be. One of them ended up reported and resolved in
     the same domain, which is a cross-domain ticket that does not cross. */
  { key: "printer", label: "Printers — the device, its queue or its consumables" }
];

/* ---------------- the five crossings ----------------
   Each carries: what the caller reports, the domain they name, the domain
   it is actually in, the evidence that clears the innocent one, and the
   evidence that convicts the real one. */
export const MIXED_FAULTS = [
  {
    key: "printer", part: "switch port VLAN",
    presentsAs: "printer", livesIn: "network",
    reportedDomain: "printer",
    objective: "2.5 + 5.x", kind: "cross",
    headline: "The printer is broken",
    root: "The printer is fine. Its switch port was moved to the guest VLAN during a patching job, so it gets an address on a network nobody can print from.",
    observable: "nobody can print to it over the network, and it prints its own test page perfectly",
    clears: {
      domain: "printer",
      evidence: "The printer prints its own configuration page on demand and reports no errors. A printer that prints is not a broken printer."
    },
    convicts: "The address on the printer's configuration page is from the guest range, and the switch port shows the guest VLAN.",
    fixes: "Have the switch port moved back to the staff VLAN. Nothing on the printer needs touching.",
    wrongReflex: "printer",
    wrongWhy: "It prints. It has toner, it has paper, it passes its own self-test. Everything it cannot do is on the other side of the network cable."
  },
  {
    key: "slowcloud", part: "power supply",
    presentsAs: "cloud", livesIn: "hardware",
    reportedDomain: "cloud",
    objective: "3.6 + 5.x", kind: "cross",
    headline: "The cloud application has become unusable on this desk",
    root: "The application is fine. This workstation's supply cannot hold its rails under load, so the machine throttles and stalls whenever anything works it — and the heaviest thing it runs is the browser.",
    observable: "one user finds the hosted application unusable while the rest of their team, on the same service, are fine",
    clears: {
      domain: "cloud",
      evidence: "The service's own status page is green, eleven colleagues are using it right now, and the same account on a loaner laptop at the same desk performs perfectly."
    },
    convicts: "The 12V rail measures below tolerance under load on this machine, and the stalls line up exactly with the load rather than with anything the service is doing.",
    fixes: "Replace the workstation's power supply. Nothing about the hosted service needs touching.",
    wrongReflex: "cloud service",
    wrongWhy: "A hosted service that had degraded would degrade for everybody on it. One user on one machine is a property of that machine, and the fastest way to prove it is to sit them at a different one."
  },
  {
    key: "mobiledns", part: "DNS configuration",
    presentsAs: "mobile", livesIn: "network",
    reportedDomain: "mobile",
    objective: "2.4 + 5.x", kind: "cross",
    headline: "The handsets cannot reach anything when they are in the office",
    root: "The handsets are fine. The wireless network hands out a resolver that was decommissioned, so anything joining that network resolves nothing — and the phones are the only devices that join it.",
    observable: "handsets work perfectly on cellular and fail on the office wireless, while laptops on the same wireless are fine",
    clears: {
      domain: "mobile",
      evidence: "Every handset behaves identically, they all work perfectly the moment they leave the building, and a factory-fresh device out of the box does exactly the same thing."
    },
    convicts: "The wireless network's scope hands out a resolver that stopped answering in the last refresh. The laptops are on a different network with a different scope, which is why nobody noticed.",
    fixes: "Correct the resolver in the wireless network's DHCP scope. There is nothing to do to a single handset.",
    wrongReflex: "handset",
    wrongWhy: "A fault on every device of one kind, including one still in its box, is not a fault in any of those devices. It is a property of the thing they all have in common."
  },
  {
    key: "printerspool", part: "the print server's boot drive",
    presentsAs: "network", livesIn: "hardware",
    reportedDomain: "network",
    objective: "3.4 + 5.x", kind: "cross",
    headline: "Printing over the network has become unbearably slow",
    root: "The network and the printer are both fine. The print server's boot drive is failing, so every job sits in a spool queue on a disk that stalls for thirty seconds at a time.",
    observable: "jobs sent over the network take minutes to start, and the same file printed from a USB stick at the printer comes out immediately",
    clears: {
      domain: "network",
      evidence: "The link to the print server is up at a gigabit with no errors, latency across the floor is normal, and a large file copies to the same server at full speed until it does not."
    },
    convicts: "The print server's boot drive is reallocating sectors, and the spool stalls line up with the disk stalls in the event log rather than with anything on the wire.",
    fixes: "Back up, image and replace the print server's boot drive. Nothing on the network or the printer needs touching.",
    wrongReflex: "network",
    wrongWhy: "A file printed at the device comes out immediately, which puts the delay between the user and the printer rather than at either end. And the wire between them is measurably idle."
  },
  {
    key: "vdiprofile", part: "cloud storage quota",
    presentsAs: "printer", livesIn: "cloud",
    reportedDomain: "hardware",
    objective: "4.2 + 5.x", kind: "cross",
    headline: "The thin clients are dying — they take twenty minutes to log in",
    root: "The thin clients are fine. The roaming profile store has hit its quota, so every login waits for a profile sync that cannot complete and eventually gives up.",
    observable: "logins take twenty minutes on every thin client in the building and complete instantly for a brand-new account",
    clears: {
      domain: "hardware",
      evidence: "A brand-new account logs in on the same thin client in eight seconds, and swapping in a factory-fresh unit changes nothing at all."
    },
    convicts: "The profile store is at its quota and the sync log shows the same files retrying on every login.",
    fixes: "Clear space or raise the profile store's quota, then let the backlog drain and confirm a normal login time.",
    wrongReflex: "thin client",
    wrongWhy: "A new account on the same hardware logs in instantly. Whatever is slow follows the account rather than the device, and replacing hardware that a new account uses perfectly is a purchase order with nothing behind it."
  },
  {
    key: "laptopvpn", part: "device compliance policy",
    presentsAs: "network", livesIn: "mobile",
    reportedDomain: "network",
    objective: "1.3 + 5.x", kind: "cross",
    headline: "The remote workers have lost the VPN",
    root: "The VPN is fine. A management policy pushed a certificate change and these laptops fell out of compliance, so the VPN is refusing them exactly as it was configured to.",
    observable: "a group of remote machines cannot connect while everybody else on the same VPN is working normally",
    clears: {
      domain: "network",
      evidence: "The concentrator is up, sessions are established on it right now, and one of the affected users connects fine from the same house on a compliant machine."
    },
    convicts: "The management console shows those machines non-compliant since the certificate change, and the VPN's own log gives compliance as the refusal reason.",
    fixes: "Bring the machines back into compliance from the management console. The VPN needs no change, and turning the compliance check off to get people working is not a fix.",
    wrongReflex: "VPN",
    wrongWhy: "The concentrator is carrying sessions right now, and the affected users can connect from the same house on a different machine. The VPN is doing exactly what it was told to do."
  },
  {
    key: "wifi", part: "wireless adapter",
    presentsAs: "network", livesIn: "hardware",
    reportedDomain: "network",
    objective: "2.2 + 5.x", kind: "cross",
    headline: "The wireless is down in this corner of the building",
    root: "The wireless is fine. This one laptop's wireless card has failed — it enumerates, scans, and cannot associate with anything.",
    observable: "one laptop cannot join any wireless network anywhere in the building, while everyone around it is connected",
    clears: {
      domain: "network",
      evidence: "Four other machines in the same corner are associated to the same access point at full signal, and the laptop fails on every network in every part of the building."
    },
    convicts: "The adapter scans and lists networks, then fails association on all of them, including a phone hotspot two feet away.",
    fixes: "Replace the wireless card, or use a USB adapter if the machine is close to replacement anyway.",
    wrongReflex: "access point",
    wrongWhy: "Everyone else on that access point is working. A failed access point does not single out one laptop and follow it around the building."
  },
  {
    key: "vdicable", part: "patch cable",
    presentsAs: "cloud", livesIn: "network",
    reportedDomain: "cloud",
    objective: "3.2 + 5.x", kind: "cross",
    headline: "The virtual desktops are slow",
    root: "The virtual desktop platform is healthy. This user's patch cable has a damaged pair, so their session is being delivered over a link running at a tenth of its speed.",
    observable: "one person's virtual desktop is unusable while everybody else's on the same host is fine",
    clears: {
      domain: "cloud",
      evidence: "Host CPU, memory and storage latency are all normal, and eleven other users on the same host report no problem at all."
    },
    convicts: "The user's switch port negotiated 100Mb half duplex with a rising error count, on a gigabit switch.",
    fixes: "Replace the patch cable and confirm the link comes back at full speed.",
    wrongReflex: "VDI host",
    wrongWhy: "The host is carrying eleven other sessions without complaint. If the host were the problem, it would be everybody's problem."
  },
  {
    key: "syncdisk", part: "storage drive",
    presentsAs: "cloud", livesIn: "hardware",
    reportedDomain: "cloud",
    objective: "3.4 + 5.x", kind: "cross",
    headline: "The cloud storage keeps losing my files",
    root: "The cloud is fine. The workstation's boot drive is failing, so files are corrupted locally before the sync client ever uploads them.",
    observable: "files sync up damaged, and the same files open perfectly from the cloud on another machine",
    clears: {
      domain: "cloud",
      evidence: "The service reports healthy, the quota is nowhere near full, and every file that reached the cloud opens correctly from a different machine."
    },
    convicts: "SMART on the boot drive shows climbing reallocated and pending sectors, and the corruption is present in the local copy before upload.",
    fixes: "Back up what is still readable, image the drive to a replacement, and replace it. Stop the sync client first so it does not push more damage up.",
    wrongReflex: "sync client",
    wrongWhy: "The client is faithfully uploading exactly what it finds on disk. What it finds on disk is already damaged."
  },
  {
    key: "phonemail", part: "device enrolment",
    presentsAs: "cloud", livesIn: "mobile",
    reportedDomain: "cloud",
    objective: "1.3 + 5.x", kind: "cross",
    headline: "The email server is down for me",
    root: "The mail service is fine and everyone else is on it. This handset lost its management profile in a reset, so it no longer holds the certificate the mail service asks for.",
    observable: "one person's phone cannot reach company mail while the same account works on the web and on their laptop",
    clears: {
      domain: "cloud",
      evidence: "The same account signs in on the web portal and on the user's laptop without complaint, and the tenant reports the service healthy."
    },
    convicts: "The management console shows the device unenrolled with no check-in since the reset, and the mail profile and its certificate are gone.",
    fixes: "Re-enrol the handset and let the profile and certificate reinstall.",
    wrongReflex: "mail service",
    wrongWhy: "The service is answering everyone else in the building, and it is answering this user on two other devices."
  },
  {
    key: "raidslow", part: "cache battery",
    presentsAs: "cloud", livesIn: "hardware",
    reportedDomain: "cloud",
    objective: "5.2 + 5.x", kind: "cross",
    headline: "The virtual machines have all gone slow since the weekend",
    root: "The hypervisor is fine and so is every guest. The array underneath them dropped to write-through when its cache battery failed, so every write on every guest now waits for the disks.",
    observable: "every virtual machine on one host slowed down at the same moment, with no change to any of them",
    clears: {
      domain: "cloud",
      evidence: "Host memory and cores are barely used, no guest has been changed, and guests migrated to the second host run at full speed on the same storage network."
    },
    convicts: "The array's controller is in write-through with its cache backup unit reporting a failed battery, and the slowdown starts at the timestamp that happened.",
    fixes: "Replace the controller's cache battery module. Nothing about the hypervisor or any guest needs touching.",
    wrongReflex: "host capacity",
    wrongWhy: "The host is barely using its memory or its cores, and adding more of either would change nothing. Everything on one host slowing down at one instant is something underneath all of them, not a shortage in any of them."
  },
  {
    key: "printpower", part: "a circuit loaded past its breaker",
    presentsAs: "printer", livesIn: "hardware",
    reportedDomain: "printer",
    objective: "5.1 + 5.x", kind: "cross",
    headline: "The printer keeps dying halfway through big jobs",
    root: "Nothing about the printer has failed. Its fuser draws heavily on warm-up, and the circuit it shares with four workstations and a kettle is already over its continuous limit, so the breaker trips and takes the printer with it.",
    observable: "the printer stops mid-job, and it always happens at the same times of day rather than on the same kind of job",
    clears: {
      domain: "printer",
      evidence: "It is on USB to one machine and never touches the network, it fails identically when that machine is the only thing printing, and its own log records no error of any kind \u2014 because from the printer's point of view nothing went wrong, it simply stopped being supplied."
    },
    convicts: "The measured total on that circuit is over 80% of the breaker's rating, and every failure lines up with the breaker tripping rather than with anything the printer did.",
    fixes: "Get the load spread across circuits and the arithmetic put in writing. The printer is not the problem — what it shares a breaker with is.",
    wrongReflex: "printer",
    wrongWhy: "It completes the same jobs perfectly at eight in the morning and fails at eleven. A printer that works depending on the time of day is telling you about something else in the building."
  },
  {
    key: "scanstore", part: "the scan destination's storage quota",
    presentsAs: "printer", livesIn: "cloud",
    reportedDomain: "printer",
    objective: "4.2 + 5.x", kind: "cross",
    headline: "The scanner on the big printer has stopped working",
    root: "The scanner is perfect. It scans to a cloud folder that has hit its quota, so every scan is accepted by the device and refused at the far end.",
    observable: "scanning to the shared folder fails while copying and scanning to email both work perfectly on the same device",
    clears: {
      domain: "printer",
      evidence: "Copying produces a flawless image from the same glass and the same lamp, and scan to email delivers full-size files from the same scan."
    },
    convicts: "The destination account is at its storage limit and every rejection in the device's log is a quota refusal.",
    fixes: "Clear space or raise the quota, then let the backlog drain and send one scan while you are standing there.",
    wrongReflex: "scanner",
    wrongWhy: "The copier uses the same scanner and produces a perfect page. Whatever is failing happens after the image exists, which puts it past every part of the device you could replace."
  },
  {
    key: "vpnprinter", part: "the access point's switch port VLAN",
    presentsAs: "mobile", livesIn: "network",
    reportedDomain: "mobile",
    objective: "2.5 + 5.x", kind: "cross",
    headline: "The tablets in the warehouse cannot reach anything company",
    root: "The tablets are fine and enrolled. The wireless access point they associate to was patched into a port left on the guest VLAN during the comms room tidy, so everything on it is on the guest network.",
    observable: "every device on one access point reaches the internet and nothing on the company network, and the same devices work on the next access point along",
    clears: {
      domain: "mobile",
      evidence: "The same tablets, unchanged, work perfectly on the access point at the other end of the warehouse, and a factory-fresh tablet does exactly the same thing on the failing one."
    },
    convicts: "The access point's switch port is on the guest VLAN and it is handing out guest addresses to everything associated with it.",
    fixes: "Have the port moved back to the staff VLAN. There is nothing to do to a single tablet.",
    wrongReflex: "enrolment",
    wrongWhy: "A device that is not enrolled fails everywhere. These fail on one access point and work on another with nothing changed, which makes it a property of the access point rather than of any device."
  },
  {
    key: "backupdisk", part: "storage array",
    presentsAs: "cloud", livesIn: "hardware",
    reportedDomain: "cloud",
    objective: "5.2 + 5.x", kind: "cross",
    headline: "The nightly backup to the cloud has not finished for a fortnight",
    root: "The cloud target is healthy and so is the circuit. The array the backup reads from has been degraded for two weeks, and a degraded array reads slowly enough that the job no longer finishes inside its window.",
    observable: "a backup job that used to finish overnight now runs into the working day, with the destination and the circuit both idle",
    clears: {
      domain: "cloud",
      evidence: "The destination reports plenty of quota, accepts a test upload at full speed, and the circuit is barely used for the whole run."
    },
    convicts: "The source array has been degraded since the same night the backup first overran, and its read throughput has halved.",
    fixes: "Replace the failed member and let the array rebuild. The backup window comes back on its own once the array is whole, and it is worth watching one run to confirm it.",
    wrongReflex: "bandwidth",
    wrongWhy: "The circuit is almost idle for the entire run, and a test upload to the same destination goes at full speed. Nothing is being throttled at the far end — the data is not arriving fast enough at the near one."
  }
];

/* The four domains as a set of judgements: for each, is it implicated, and
   what is the evidence either way. This is the scoping exercise, and the
   "not this one, and here is why" half is the half that matters. */
export function domainVerdicts(G) {
  var f = G.fault;
  return DOMAINS.map(function (d) {
    if (d.key === f.livesIn) {
      return { key: d.key, label: d.label, implicated: true, evidence: f.convicts };
    }
    if (d.key === f.clears.domain) {
      return { key: d.key, label: d.label, implicated: false, evidence: f.clears.evidence };
    }
    return { key: d.key, label: d.label, implicated: false,
      evidence: "Nothing on this ticket points here, and nothing you have found rules it in." };
  });
}

/* What the caller named, versus where it turned out to live. */
export function scopeSummary(G) {
  var f = G.fault;
  return {
    reported: DOMAINS.filter(function (d) { return d.key === f.reportedDomain; })[0],
    actual: DOMAINS.filter(function (d) { return d.key === f.livesIn; })[0],
    crossed: f.reportedDomain !== f.livesIn
  };
}

export const MIXED_ACTIONS = [
  { key: "vlanport", label: "Raise a change to move the switch port back to the staff VLAN" },
  { key: "wifinic", label: "Replace the laptop's wireless card" },
  { key: "cable", label: "Replace the patch cable and re-test the link speed" },
  { key: "drive", label: "Back up, image and replace the failing boot drive" },
  { key: "enrol", label: "Re-enrol the handset in device management" },
  { key: "printer", label: "Replace the printer" },
  { key: "ap", label: "Replace the wireless access point" },
  { key: "vdihost", label: "Add capacity to the VDI host" },
  { key: "syncclient", label: "Reinstall the file sync client" },
  { key: "mailcase", label: "Open a case with the mail provider" },
  { key: "psu", label: "Replace the workstation's power supply" },
  { key: "scopedns", label: "Correct the resolver in the wireless network's DHCP scope" },
  { key: "profilequota", label: "Clear or raise the roaming profile store's quota and let it drain" },
  { key: "compliance", label: "Bring the machines back into compliance from the management console" },
  { key: "cloudcase", label: "Raise a case with the hosted application's provider" },
  { key: "thinclient", label: "Replace the thin clients" },
  { key: "vpnbox", label: "Restart the VPN concentrator" },
  { key: "cachebatt", label: "Replace the storage controller's cache battery module" },
  { key: "spreadload", label: "Spread the electrical load across circuits and put the arithmetic in writing" },
  { key: "raidmember", label: "Replace the failed array member and let it rebuild" },
  { key: "biggerhost", label: "Add memory and cores to the virtualization host" },
  { key: "newscanner", label: "Replace the scanner unit in the multifunction device" },
  { key: "morebandwidth", label: "Order more bandwidth on the site circuit" }
];

export function correctMixedAction(fault) {
  return { printer: "vlanport", wifi: "wifinic", vdicable: "cable",
    syncdisk: "drive", phonemail: "enrol",
    slowcloud: "psu", mobiledns: "scopedns", printerspool: "drive",
    vdiprofile: "profilequota", laptopvpn: "compliance",
    raidslow: "cachebatt", printpower: "spreadload", scanstore: "profilequota",
    vpnprinter: "vlanport", backupdisk: "raidmember" }[fault.key];
}

export function mixedActionWhy(fault, chosen) {
  if (chosen === correctMixedAction(fault)) return fault.fixes;
  return {
    vlanport: "The switch port is on the right VLAN and handing out the right addresses.",
    wifinic: "The wireless card associates and passes traffic. It is not the adapter.",
    cable: "The link is up at full speed with no errors. The cable is fine.",
    drive: "SMART is clean on every attribute and the drive passes a full surface scan.",
    enrol: "The device is enrolled, compliant, and checked in half an hour ago.",
    printer: "It prints its own test page perfectly. Replacing a working printer is an expensive way to avoid looking at the network.",
    ap: "Everybody else on that access point is working right now.",
    vdihost: "The host is carrying eleven other sessions without complaint. Buying capacity you do not need is how a budget disappears.",
    syncclient: "A fresh client will upload exactly the same damaged files, because the damage is on the disk it is reading from.",
    mailcase: "The provider will confirm the service is healthy and ask what you have checked, which is a fair question when the same account works on two other devices.",
    psu: "Every rail on this machine measures inside tolerance at idle and under load. The supply is not what is wrong.",
    scopedns: "The scope hands out a resolver that answers, and everything on that network resolves names correctly.",
    profilequota: "There is room in the profile store and the sync completes on every login. The quota is not what is holding this up.",
    compliance: "The machines are compliant and the console says so. There is nothing to bring back.",
    cloudcase: "The provider will tell you the service is healthy, and the colleagues using it right now already have.",
    thinclient: "A brand-new account logs in on that same unit in seconds. Whatever is slow is not the hardware, and a box of replacements will do exactly the same thing.",
    vpnbox: "The concentrator is carrying sessions right now. Restarting it drops the people who are working to fix the people who are not.",
    cachebatt: "The storage controller is in write-back with a charged cache backup unit. The cache is doing its job.",
    spreadload: "The circuit measures comfortably inside its continuous limit with everything on it running.",
    raidmember: "Every member of the array is Online and the array is optimal. There is nothing to rebuild.",
    biggerhost: "The host is barely using the memory and cores it already has. Buying more of what is not being used is a purchase order with nothing behind it.",
    newscanner: "The copier produces a flawless page from the same glass and the same lamp. The scanner is not what has failed.",
    morebandwidth: "The circuit is almost idle throughout, and a test transfer to the same destination runs at full speed."
  }[chosen];
}
