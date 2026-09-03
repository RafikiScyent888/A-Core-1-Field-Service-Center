/* =====================================================================
   Field Service Center — the networking track

   The hardware track grades a part you order. This one grades a
   configuration you type, against a reachability engine that actually
   evaluates it. Set the mask wrong and half the floor goes unreachable;
   set the gateway wrong and the LAN is fine while the internet is dead;
   set DNS wrong and everything works by address and nothing by name.
   The connectivity test tells you which, exactly as it would on a real
   call.

   Two of the seven faults are not configuration at all. Their config is
   correct, was correct before the tech arrived, and stays correct — and
   the graded answer is to leave it alone and fix the actual thing. That
   is deliberate. Retyping a perfectly good IP configuration is the most
   common wasted half-hour in the job.
   ===================================================================== */

/* ---------------- address arithmetic ---------------- */
export function ipToInt(s) {
  var p = String(s).trim().split(".");
  if (p.length !== 4) return null;
  var n = 0;
  for (var i = 0; i < 4; i++) {
    var o = Number(p[i]);
    if (!/^\d+$/.test(p[i]) || o < 0 || o > 255) return null;
    n = (n * 256) + o;
  }
  return n;
}
export function intToIp(n) {
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(".");
}
/* A mask is valid only if it is a run of ones followed by a run of zeros.
   255.255.0.255 is a number, not a mask, and students type it. */
export function maskToPrefix(m) {
  var n = ipToInt(m);
  if (n === null) return null;
  var seenZero = false, bits = 0;
  for (var i = 31; i >= 0; i--) {
    var bit = (n >>> i) & 1;
    if (bit === 1) { if (seenZero) return null; bits++; } else seenZero = true;
  }
  return bits;
}
export function prefixToMask(p) {
  return intToIp(p === 0 ? 0 : (0xFFFFFFFF << (32 - p)) >>> 0);
}
export function sameSubnet(a, b, mask) {
  var ai = ipToInt(a), bi = ipToInt(b), mi = ipToInt(mask);
  if (ai === null || bi === null || mi === null) return false;
  return ((ai & mi) >>> 0) === ((bi & mi) >>> 0);
}
export function isApipa(ip) {
  var n = ipToInt(ip);
  return n !== null && (n >>> 16) === 0xA9FE;      // 169.254.0.0/16
}
/* Network and broadcast addresses are not host addresses, and assigning
   one is a classic self-inflicted outage. */
export function isUsableHost(ip, mask) {
  var n = ipToInt(ip), m = ipToInt(mask), p = maskToPrefix(mask);
  if (n === null || m === null || p === null || p > 30) return false;
  var net = (n & m) >>> 0;
  var bcast = (net | (~m >>> 0)) >>> 0;
  return n !== net && n !== bcast;
}

/* ---------------- the seven network faults ---------------- */
export const NETWORK_FAULTS = [
  {
    key: "mask", part: "subnet mask", objective: "2.4 + 5.5", kind: "config",
    root: "The subnet mask on this workstation is wrong. It was typed by hand and nobody checked it against the rest of the floor.",
    observable: "some machines on the same floor answer and others do not, with no pattern the user can see",
    symptoms: ["Can reach the person next to them but not the person across the room",
      "The printer works, the file server does not",
      "It was fine at the old desk"],
    fixes: "Correct the mask to match the subnet the rest of the floor uses.",
    wrongReflex: "network cable",
    wrongWhy: "The link is up at full speed with no errors, and some traffic passes perfectly. A broken cable does not pick and choose which addresses reach.",
    evidence: "The mask on this interface does not match the mask on every other machine in the same room"
  },
  {
    key: "gateway", part: "default gateway", objective: "2.4 + 5.5", kind: "config",
    root: "The default gateway is set to an address that is not the router. Anything that stays on the local subnet works; anything that has to leave it does not.",
    observable: "everything inside the building works and nothing outside it does",
    symptoms: ["Can open the intranet, cannot open anything on the internet",
      "Email to colleagues works, email to customers does not",
      "The network printer prints fine"],
    fixes: "Set the default gateway to the router's address on this subnet.",
    wrongReflex: "internet connection",
    wrongWhy: "Every other machine on the same switch is on the internet right now. The circuit is up.",
    evidence: "The configured gateway does not answer, and it is not the address the rest of the subnet uses"
  },
  {
    key: "dns", part: "DNS configuration", objective: "2.4 + 5.5", kind: "config",
    root: "The DNS servers on this interface point at something that is not answering. Addresses resolve nowhere, so nothing that uses a name works.",
    observable: "nothing loads by name, but everything works if you type the address",
    symptoms: ["Every site says it cannot find the server",
      "A colleague sent an IP address and that opened fine",
      "It started after somebody 'fixed' it last week"],
    fixes: "Point DNS at the resolver this site actually uses.",
    wrongReflex: "browser",
    wrongWhy: "Every browser on the machine behaves the same way, and so does ping. This is below the application.",
    evidence: "Name lookups time out while the same destination answers by address"
  },
  {
    key: "wrongsubnet", part: "an address left over from the old subnet", objective: "2.4 + 5.5", kind: "config",
    root: "The floor was renumbered and this machine kept the static address it was given at the old site. Every field is filled in, and every one of them describes a network that is not here any more.",
    observable: "nothing on the network answers at all, and the machine insists it is configured correctly",
    symptoms: ["It says it's connected and nothing works",
      "It worked in the old building", "Nobody has touched the settings"],
    fixes: "Put the machine back on the address range this floor actually uses, with this floor's mask, gateway and resolver.",
    wrongReflex: "switch port",
    wrongWhy: "A known-good laptop in the same port comes straight up on DHCP. The port is handing out this floor's network and this machine is not listening, because it was told not to.",
    evidence: "A static address in a completely different range from the gateway, the neighbour and the scope"
  },
  {
    key: "duplex", part: "a duplex mismatch on the switch port", objective: "2.5 + 5.5", kind: "physical",
    root: "The switch port was hard-set to half duplex during a fault years ago and never put back. The adapter negotiates full, the port insists on half, and both are certain they are right.",
    observable: "everything works and everything is slow, and it gets worse the more people use it",
    symptoms: ["It's fine for email and hopeless for the shared drive",
      "Small things are quick, big things time out", "It's worse in the morning"],
    fixes: "Raise a change with whoever owns the switch to put the port back to auto-negotiate on both sides. There is nothing to fix on the workstation.",
    wrongReflex: "patch cable",
    wrongWhy: "A new cable changes nothing, because both ends are agreeing to disagree rather than failing to connect. The error counter that is climbing is late collisions, and late collisions are a duplex word, not a copper word.",
    evidence: "A link up at half duplex with late collisions climbing, on an adapter set to auto-negotiate"
  },
  {
    key: "portsec", part: "a port shut down by port security", objective: "2.5 + 5.5", kind: "physical",
    root: "Somebody plugged a small switch into the wall socket to get more ports. The switch saw several MAC addresses on one access port and shut it down, exactly as it was configured to.",
    observable: "no link light at all at the desk, on a run and a machine that both test perfectly",
    symptoms: ["It's completely dead", "It happened right after we added the little box under the desk",
      "The cable is fine, we tested it"],
    fixes: "Take the unmanaged switch off the port, then raise a change with whoever owns the switch to clear the security violation and re-enable it. Get the desks the ports they actually need.",
    wrongReflex: "cable",
    wrongWhy: "The run certifies clean end to end and the adapter loops back at full speed. Nothing is broken — the port was switched off on purpose by a rule that did exactly what it was written to do.",
    evidence: "A port in an error-disabled state with a security violation counter, on a run that tests perfectly"
  },
  {
    key: "proxy", part: "a stale proxy setting", objective: "2.3 + 5.5", kind: "physical",
    root: "The browser is still pointed at a proxy server that was decommissioned in the last refresh. Everything below the browser is perfect.",
    observable: "the network is completely healthy by every test and no web page will open",
    symptoms: ["The internet is down", "Email works fine though",
      "It says it can't connect to the proxy server"],
    fixes: "Clear the stale proxy configuration so the browser goes direct, and check whether it came from a policy that still needs changing centrally.",
    wrongReflex: "DNS",
    wrongWhy: "Names resolve correctly — you can prove it at a command prompt in five seconds. A resolver fault breaks name lookups everywhere, not just in a browser, and email would have gone with it.",
    evidence: "Every connectivity test green, names resolving correctly, and only the browser failing"
  },
  {
    key: "nicoff", part: "a network adapter disabled in the operating system", objective: "2.5 + 5.5", kind: "physical",
    root: "The adapter is disabled in the operating system. It was switched off to test something and never switched back on.",
    observable: "the machine reports no network at all, and the socket, the run and the switch port are all fine",
    symptoms: ["There's a red cross on the network icon", "The cable is definitely plugged in",
      "I was on a call with the helpdesk about something else yesterday"],
    fixes: "Re-enable the adapter, then confirm it picks up a lease and reaches the file server. There is nothing to type and nothing to order.",
    wrongReflex: "network adapter",
    wrongWhy: "The adapter is present, healthy and listed — it is switched off, which is not the same as broken. Ordering a card to replace one that works is the most expensive way to click Enable.",
    evidence: "An interface reporting media disconnected with a link light lit on the switch port"
  },
  {
    key: "apipa", part: "address assignment", objective: "2.4 + 5.5", kind: "config",
    root: "The DHCP scope for this subnet is exhausted, so the workstation gave up and assigned itself a link-local address.",
    observable: "no network at all, and an address starting 169.254",
    symptoms: ["Nothing on the network works at all",
      "It worked yesterday and the machine has not been touched",
      "Three other people on the floor had the same thing this morning"],
    fixes: "Assign a static address inside the subnet and outside the DHCP scope, then get the scope widened.",
    wrongReflex: "network adapter",
    wrongWhy: "The adapter is fine — it has link, it sent DHCP discovers, and nothing answered. A failed adapter does not negotiate a link.",
    evidence: "A 169.254 address is the machine telling you it asked for a lease and nobody replied"
  },
  {
    key: "duplicate", part: "IP address", objective: "2.4 + 5.5", kind: "config",
    root: "This workstation was given a static address that is already in use by a network printer. Both devices work intermittently and neither works properly.",
    observable: "the network works for a few seconds at a time and then stops, over and over",
    symptoms: ["Drops out every couple of minutes and comes back",
      "Somebody in another office is complaining the printer keeps going offline",
      "A warning about an address conflict appeared once"],
    fixes: "Move the workstation to a free address in the subnet, or put it back on DHCP.",
    wrongReflex: "switch port",
    wrongWhy: "The switch port shows a clean link with no errors and no flapping. The conflict is at layer three, not layer one.",
    evidence: "The ARP table shows this address answering from two different hardware addresses"
  },
  {
    key: "patch", part: "patch cable", objective: "3.2 + 5.5", kind: "physical",
    root: "The patch cable has a damaged pair. The link negotiates down to 100Mb half duplex and throws errors under load.",
    observable: "the network works but everything on it is painfully slow, and large transfers fail",
    symptoms: ["Everything takes forever, but it does eventually work",
      "Copying a big file fails part way through",
      "It got worse after the desk was moved"],
    fixes: "Replace the patch cable and confirm the link comes back up at full speed.",
    wrongReflex: "IP configuration",
    wrongWhy: "The address, mask, gateway and DNS on this machine are all correct and match the rest of the floor. Nothing you type will repair a broken pair.",
    evidence: "The link negotiated 100Mb half duplex on a gigabit switch port, with a rising error count"
  },
  {
    key: "vlan", part: "switch port assignment", objective: "2.5 + 5.5", kind: "physical",
    root: "The switch port was left on the guest VLAN after a patching job. The workstation gets a perfectly valid address — on the wrong network.",
    observable: "the internet works but nothing inside the company does",
    symptoms: ["Can browse the web, cannot reach any company system",
      "The address looks different from everyone else's",
      "It started after the comms cabinet was tidied up"],
    fixes: "Have the switch port moved back to the staff VLAN. This is a change for whoever owns the switch, not a change on the workstation.",
    wrongReflex: "IP configuration",
    wrongWhy: "The workstation is configured for DHCP and DHCP answered correctly — for the VLAN the port is currently in. Typing a staff address into a guest VLAN gets you nothing at all.",
    evidence: "The address handed out is from the guest range, and the switch port shows the guest VLAN"
  },
  {
    key: "dnsold", part: "a cached record for a server that moved", objective: "2.4 + 5.5", kind: "physical",
    root: "The file server was renumbered and this machine is still holding the old record. Its resolver is correct and its cache is not.",
    observable: "one machine cannot reach one server by name while reaching everything else, and the address it is trying is the server's old one",
    symptoms: ["I can't get to the file server", "Everything else is fine",
      "It moved to the new rack last week"],
    fixes: "Flush the resolver cache and confirm the name resolves to the new address. Nothing about the configuration needs changing.",
    wrongReflex: "DNS servers",
    wrongWhy: "The resolvers are correct and every other name on the site resolves through them perfectly. What is stale is this machine's own copy of one answer, not where it goes for answers.",
    evidence: "One name resolving to an address the server no longer has, with every other name correct"
  },
  {
    key: "hosts", part: "an entry left in the hosts file", objective: "2.4 + 5.5", kind: "physical",
    root: "Somebody put a temporary entry in the hosts file during a migration and never took it out. It overrides DNS for that one name and has done for months.",
    observable: "one name resolves to an address nothing else on the site resolves it to, on one machine",
    symptoms: ["It goes to the old site", "It's right on everyone else's machine",
      "Someone was testing something on here months ago"],
    fixes: "Remove the stale entry from the hosts file. Note that it was there, because a hosts entry beats DNS silently and nobody looks.",
    wrongReflex: "DNS",
    wrongWhy: "A query at the command prompt against the resolver returns the correct address. The machine is not asking DNS for this name at all — it is reading it off a file first, which is what a hosts entry is for and why it hides so well.",
    evidence: "A name resolving one way through the resolver and another way in the application, on one machine"
  },
  {
    key: "wifiband", part: "a client stuck on the wrong band", objective: "2.2 + 5.5", kind: "physical",
    root: "The adapter is associating to the 2.4GHz radio and staying there, on a floor where the 5GHz radio has all the capacity. It is connected, it is slow, and it is not roaming.",
    observable: "one laptop is slow on wireless in a spot where everybody else is fast, and it is associated the whole time",
    symptoms: ["The wireless is slow at my desk", "Everyone else is fine at the same desk",
      "It's showing full signal"],
    fixes: "Set the adapter to prefer the 5GHz band and update its driver. If it still will not roam, the adapter is a replacement rather than a configuration.",
    wrongReflex: "access point",
    wrongWhy: "Four other machines at the same desk are on the fast radio through the same access point. An access point that had failed would not be selective about which client it served well.",
    evidence: "One client associated to the slower radio at full signal while every other client at the same desk is on the faster one"
  },
  {
    key: "mtu", part: "an MTU that is too large for the path", objective: "2.4 + 5.5", kind: "physical",
    root: "The site's tunnel adds overhead and the interface is still set to a full-size frame. Small packets cross perfectly and anything large is dropped silently.",
    observable: "small things work and large things hang forever — pages start and never finish, and file transfers stall at the same point",
    symptoms: ["Pages load halfway and stop", "Ping works fine",
      "It only happens to the sites over the tunnel"],
    fixes: "Set the interface's MTU to fit the path, or turn on the clamping the tunnel should be doing. Ping with progressively larger packets tells you the number.",
    wrongReflex: "bandwidth",
    wrongWhy: "The circuit is barely used and small transfers are instant. A capacity problem slows everything down proportionally; this one works perfectly up to a size and then stops completely.",
    evidence: "Small packets crossing and large ones dropped at a consistent size, with the circuit almost idle"
  },
  {
    key: "loop", part: "a loop somebody made under a desk", objective: "2.5 + 5.5", kind: "physical",
    root: "Two wall ports were joined by a patch lead under a desk. Without loop protection that would take the floor down; with it, the switch has shut both ports and the desks on them are dead.",
    observable: "two desks went dead at the same moment and the rest of the floor slowed down for a minute beforehand",
    symptoms: ["Two of us went off together", "Everyone said it was slow just before",
      "Someone was tidying the cables"],
    fixes: "Find and remove the lead joining the two ports, then have the shut ports re-enabled. Get the spare wall ports capped, because this happens where there are loose leads and empty sockets.",
    wrongReflex: "the switch",
    wrongWhy: "The switch is doing exactly what loop protection is for, and it did it in the second the loop appeared. Replacing it removes the thing that stopped the floor going down.",
    evidence: "Two ports shut by loop protection at the same timestamp, with a broadcast spike immediately before"
  },
];

/* ---------------- the site's network ---------------- */
export function buildTopology(r, fault) {
  var third = r.int(10, 60);
  var base = "10.20." + third + ".0";
  var prefix = r.pick([24, 24, 24, 23]);
  var mask = prefixToMask(prefix);
  var gw = "10.20." + third + ".1";
  var dns1 = "10.20." + third + ".10";
  var dns2 = "10.20." + third + ".11";
  /* On the mask ticket the neighbour has to sit in the same wrong block as
     the workstation, or the symptom is "nothing works" rather than the
     "some answer and some do not" the caller actually describes. */
  var peer = fault && fault.key === "mask"
    ? "10.20." + third + "." + r.int(150, 190)
    : "10.20." + third + "." + r.int(20, 90);
  var printer = "10.20." + third + "." + r.int(200, 240);
  var server = "10.30." + r.int(5, 40) + "." + r.int(10, 60);   // different subnet on purpose
  var scopeFrom = 100, scopeTo = 199;

  return {
    base: base, prefix: prefix, mask: mask, gw: gw,
    dns1: dns1, dns2: dns2, peer: peer, printer: printer, server: server,
    scope: { from: "10.20." + third + "." + scopeFrom, to: "10.20." + third + "." + scopeTo },
    guestBase: "192.168.7.0", guestMask: "255.255.255.0", guestGw: "192.168.7.1",
    third: third,
    intranet: "intranet.local", public: "9.9.9.9", publicName: "example-supplier.com"
  };
}

/* The configuration as the tech finds it. For a config fault this is the
   thing that is wrong; for a physical fault it is already correct, which is
   the whole point of those two tickets. */
export function brokenConfig(r, fault, topo) {
  var good = {
    dhcp: false, ip: "10.20." + topo.third + "." + r.int(120, 190),
    mask: topo.mask, gateway: topo.gw, dns: topo.dns1
  };
  switch (fault.key) {
    case "mask":
      /* Upper half of a /25: the neighbour is inside it, the gateway is not.
         Local traffic to some of the floor works and nothing routed does. */
      return Object.assign({}, good, { ip: "10.20." + topo.third + "." + r.int(160, 190),
        mask: "255.255.255.128" });
    case "gateway":
      return Object.assign({}, good, { gateway: r.pick(["10.20." + topo.third + ".254", "10.20." + topo.third + ".2", ""]) });
    case "dns":
      return Object.assign({}, good, { dns: r.pick(["10.20." + topo.third + ".250", "10.99.99.99", ""]) });
    case "apipa":
      return { dhcp: true, ip: "169.254." + r.int(1, 254) + "." + r.int(1, 254),
        mask: "255.255.0.0", gateway: "", dns: "" };
    case "duplicate":
      return Object.assign({}, good, { ip: topo.printer });
    case "wrongsubnet":
      /* Every field filled in, every one of them describing the old site. */
      return { dhcp: false, ip: "10.44." + r.int(3, 40) + "." + r.int(20, 200),
        mask: "255.255.255.0", gateway: "10.44.1.1", dns: "10.44.1.10" };
    case "vlan":
      return { dhcp: true, ip: "192.168.7." + r.int(50, 200), mask: topo.guestMask,
        gateway: topo.guestGw, dns: "192.168.7.1" };
    case "patch":
    default:
      return good;                                   // already correct
  }
}

/* ---------------- the reachability engine ----------------
   Seven checks, each computed from the configuration the student typed and
   the network the machine is PHYSICALLY sitting in. This is the network
   track's equivalent of the Security page's traffic test: the feedback is
   "your configuration still cannot reach the file server", not "wrong
   answer".

   The two physical faults are modelled rather than special-cased, because
   special-casing them let a student type nonsense and still see all green.
   A machine on the guest VLAN is on the guest VLAN whatever you type into
   it — a staff address there reaches nothing at all, which is exactly what
   makes that ticket worth doing. And a cable with a damaged pair passes
   small packets and fails a large transfer, which is why the last check
   exists. */
export function connectivity(cfg, topo, fault) {
  var inGuest = fault.key === "vlan";
  /* Three separate reasons sustained throughput dies and pings do not: a
     damaged pair, a duplex mismatch, and nothing at all. They are modelled
     rather than special-cased for the same reason the other two are. */
  var badCable = fault.key === "patch" || fault.key === "duplex";
  /* Two faults take the wire away entirely, and no configuration reaches
     past either of them. */
  var noLink = fault.key === "portsec" || fault.key === "nicoff" || fault.key === "loop";
  /* Four faults leave the configuration perfectly correct and break one
     specific thing above or beside it. */
  var staleName = fault.key === "dnsold" || fault.key === "hosts";
  var bigFrames = fault.key === "mtu";
  var slowRadio = fault.key === "wifiband";
  var proxyStale = fault.key === "proxy";

  var realGw = inGuest ? topo.guestGw : topo.gw;
  var realDns = inGuest ? [topo.guestGw] : [topo.dns1, topo.dns2];

  var maskOk = maskToPrefix(cfg.mask) !== null;
  var addrOk = ipToInt(cfg.ip) !== null && maskOk && isUsableHost(cfg.ip, cfg.mask);
  var conflict = cfg.ip === topo.printer;
  var linkLocal = isApipa(cfg.ip);

  /* Delivery, the way a host actually decides it. If your mask says the
     destination is local you ARP for it directly, which only works if it is
     genuinely on your wire. If your mask says it is remote you hand it to the
     gateway, which only works if the gateway is set, is real, and is itself
     local by your own mask. An over-broad mask breaks the second case; an
     over-narrow one breaks the first. */
  var gwLocal = addrOk && !linkLocal && sameSubnet(cfg.ip, realGw, cfg.mask);
  var gwUsable = gwLocal && cfg.gateway === realGw && !conflict;

  function reach(target, physicallyOnWire) {
    if (noLink) return false;
    if (!addrOk || linkLocal || conflict) return false;
    return sameSubnet(cfg.ip, target, cfg.mask) ? physicallyOnWire : gwUsable;
  }

  var onStaffLan = !inGuest;
  var out = [];
  function add(label, ok, why) { out.push({ label: label, ok: !!ok, why: ok ? "" : why }); }

  /* Pinging yourself proves the adapter and the stack are alive and nothing
     else whatsoever. It succeeds on a link-local address too, which is why
     it is a useless first test and a useful lesson. */
  add("Ping your own address (" + (cfg.ip || "unset") + ")",
    ipToInt(cfg.ip) !== null && maskOk && isUsableHost(cfg.ip, cfg.mask) && !conflict,
    !maskOk ? "That is not a valid subnet mask. A mask has to be a run of ones followed by a run of zeros."
      : ipToInt(cfg.ip) === null ? "That is not a valid address."
        : !isUsableHost(cfg.ip, cfg.mask) ? "That is the network or broadcast address for this subnet, not a host address."
          : "Intermittent. Another device on this network is already answering on that address.");

  add("Ping the workstation on this floor (" + topo.peer + ")",
    reach(topo.peer, onStaffLan),
    noLink ? (fault.key === "nicoff"
      ? "The interface is administratively down. Nothing leaves a disabled adapter, whatever is typed into it."
      : "The port is error-disabled. Nothing leaves a port the switch has shut down, whatever is typed into the machine.")
      : linkLocal ? "A 169.254 address is the machine telling you it asked for a lease and nobody answered."
      : conflict ? "Intermittent — two devices are answering on your address."
        : inGuest ? "This port is not on the staff network, so nothing on the staff network is reachable from it whatever you type."
          : !sameSubnet(cfg.ip, topo.peer, cfg.mask) ? "Your mask puts that machine on a different subnet, so it goes to the gateway instead of straight down the wire."
            : "Your address and mask do not put you on the same subnet as them.");

  add("Ping the default gateway (" + realGw + ")",
    gwLocal && !conflict && !noLink,
    noLink ? "There is no link to send it down."
      : linkLocal ? "No lease, no gateway."
      : conflict ? "Intermittent — the address conflict breaks it both ways."
        : "The gateway has to sit inside the subnet your own address and mask describe, or the machine never sends anything to it.");

  add("Ping the file server (" + topo.server + ", different subnet)",
    reach(topo.server, false) && onStaffLan,
    inGuest ? "The guest network has no route to company systems. That is what a guest network is for."
      : "Anything off your own subnet leaves through the default gateway, so the gateway has to be set and has to be the real one.");

  add("Ping " + topo.public + " on the internet", reach(topo.public, false),
    "Out through the gateway, same as anything else off-subnet.");

  add("Open " + topo.publicName + " by name",
    reach(topo.public, false) && realDns.indexOf(cfg.dns) !== -1 && !staleName,
    staleName
      ? (fault.key === "hosts"
        ? "It opens the wrong site. The resolver returns the right address and the machine is not asking it — a hosts entry is read first and beats DNS silently."
        : "It resolves to an address the server no longer has. The resolver is correct; this machine's own cached copy of the answer is not.")
      : reach(topo.public, false)
        ? "The route out is fine, so this is the resolver. Names need a DNS server that actually answers."
        : "Names cannot resolve while nothing off-subnet is reachable at all.");

  add("Copy a 2GB file to the file server",
    reach(topo.server, false) && onStaffLan && !badCable && !bigFrames && !slowRadio,
    bigFrames
      ? "Stalls at exactly the same point every time. Small packets cross the path perfectly and full-size frames are dropped silently, which is a frame-size problem rather than a capacity one."
      : slowRadio
      ? "Crawls at a fraction of what the machine at the next desk manages, on the same access point, at full signal."
      : fault.key === "duplex"
      ? "Crawls, then times out. Both ends are agreeing to disagree about duplex, so every sustained transfer collides with itself."
      : badCable ? "Times out part way through. Small packets cross a damaged pair; sustained throughput does not."
        : "Needs the file server reachable first.");

  /* The browser check exists for one ticket, and its value is that on that
     ticket every line above it is green. A perfect ipconfig is not the same
     as a working machine. */
  add("Open the intranet portal in a browser",
    reach(topo.server, false) && onStaffLan && !proxyStale,
    proxyStale
      ? "The browser reports it cannot connect to the proxy server. Everything underneath the browser is answering — this is above the network."
      : "Needs the network underneath it working first.");

  return out;
}

/* The configuration this site actually wants. Used to grade and to explain. */
export function correctConfig(topo, fault, current) {
  if (fault.kind === "physical") {
    return Object.assign({}, current, { _leaveAlone: true });
  }
  if (fault.key === "apipa") {
    return { dhcp: false, ip: "10.20." + topo.third + ".60", mask: topo.mask, gateway: topo.gw, dns: topo.dns1 };
  }
  if (fault.key === "duplicate") {
    return { dhcp: false, ip: "10.20." + topo.third + ".61", mask: topo.mask, gateway: topo.gw, dns: topo.dns1 };
  }
  /* On this one the address itself is the thing that is wrong, so keeping
     what was found and correcting the rest around it fixes nothing. */
  if (fault.key === "wrongsubnet") {
    return { dhcp: false, ip: "10.20." + topo.third + ".62", mask: topo.mask, gateway: topo.gw, dns: topo.dns1 };
  }
  return { dhcp: false, ip: current.ip, mask: topo.mask, gateway: topo.gw, dns: topo.dns1 };
}

/* ---------------- what actually fixes it ----------------
   Separating "change the configuration" from "replace the cable" from
   "this belongs to the switch owner" is the judgement the two physical
   tickets exist to build. */
export const ACTIONS = [
  { key: "config", label: "Apply the corrected IP configuration on this workstation" },
  { key: "cable", label: "Replace the patch cable and re-test the link speed" },
  { key: "vlanport", label: "Raise a change with whoever owns the switch to move the port back to the staff VLAN" },
  { key: "nic", label: "Order and fit a replacement network adapter" },
  { key: "isp", label: "Call the internet provider and report the circuit" },
  { key: "reimage", label: "Reimage the workstation from the standard build" },
  { key: "duplexport", label: "Raise a change to put the switch port back to auto-negotiate on both sides" },
  { key: "portsecfix", label: "Remove the unmanaged switch, then have the port's security violation cleared" },
  { key: "proxyfix", label: "Clear the stale proxy configuration and check whether policy is still pushing it" },
  { key: "enablenic", label: "Re-enable the network adapter in the operating system" },
  { key: "flushdns", label: "Flush the resolver cache and confirm the name resolves to the new address" },
  { key: "hostsfix", label: "Remove the stale entry from the hosts file" },
  { key: "bandpref", label: "Set the adapter to prefer the 5GHz band and update its driver" },
  { key: "mtufix", label: "Set the interface MTU to fit the path, or turn on the tunnel's clamping" },
  { key: "removeloop", label: "Remove the lead joining the two ports and have them re-enabled" }
];

export function correctAction(fault) {
  return { mask: "config", gateway: "config", dns: "config", apipa: "config",
    duplicate: "config", patch: "cable", vlan: "vlanport",
    wrongsubnet: "config", duplex: "duplexport", portsec: "portsecfix",
    proxy: "proxyfix", nicoff: "enablenic",
    dnsold: "flushdns", hosts: "hostsfix", wifiband: "bandpref",
    mtu: "mtufix", loop: "removeloop" }[fault.key];
}

export function actionWhy(fault, chosen) {
  var right = correctAction(fault);
  if (chosen === right) {
    return { mask: "The mask was wrong and now it is not. Nothing physical needed replacing.",
      gateway: "The gateway was wrong and now it is not.",
      dns: "The resolver was wrong and now it is not.",
      apipa: "A static address inside the subnet and outside the scope gets them working today. Widening the scope is the follow-up, not the fix in front of you.",
      duplicate: "Moving off the printer's address ends the conflict for both devices.",
      patch: "The cable had a damaged pair. Replacing it is the whole fix, and the configuration never needed touching.",
      vlan: "The workstation was configured correctly the entire time. The port is in the wrong VLAN and that is a switch change, not a workstation change — going round the network team to 'fix' it locally is how you end up with two problems.",
      wrongsubnet: "Every field was filled in and every one of them described a building this machine is not in any more. Putting it on this floor's range is the fix, and putting it back on DHCP is what stops it happening at the next move.",
      duplex: "Nothing on the workstation was wrong and nothing on the workstation fixes it. Both ends have to agree, and only one end of this is yours — so the fix is a change request with the readings attached.",
      portsec: "The port did exactly what it was configured to do. Taking the unmanaged switch off is the half you can do standing there; clearing the violation is the half that belongs to whoever owns the switch. The desks still need more ports, and that goes in the ticket.",
      proxy: "Every layer underneath the browser was working and the ipconfig was perfect, which is precisely why this one catches people. Clearing the stale proxy is the fix — and finding out whether policy is still pushing it is what stops it coming back on the next login.",
      dnsold: "The configuration was correct the whole time, which is why retyping it would have changed nothing. What was stale was one cached answer, and a flush is a command and a confirmation rather than a change.",
      hosts: "A hosts entry beats DNS and does it silently, which is why this hides so well and why it is worth looking at whenever one name behaves differently on one machine. Take it out, and write down that it was there.",
      wifiband: "The adapter is associating to the slower radio and staying there. Setting the band preference is a setting; if it still will not roam after a driver update, the adapter itself is the answer.",
      mtu: "The path is smaller than the frames being sent, and the fix is to make the frames fit rather than to buy a bigger path. Nothing about the circuit was ever the problem.",
      loop: "The switch did exactly what loop protection is for, in the second the loop appeared. Take the lead out, have the ports re-enabled, and cap the spare sockets \u2014 because this happens wherever there are loose leads and empty ports.",
      nicoff: "It was switched off, not broken. Two minutes, no parts, no change request — and the reason it is worth doing early is that the expensive answers all look plausible until you have looked." }[fault.key];
  }
  return { config: "Retyping the configuration does not help here — it was already correct, and it will be correct after you finish typing it again.",
    cable: "The cable is fine. The link is up at full speed with no errors.",
    vlanport: "The port is on the right VLAN and handing out the right addresses. Sending this to the network team wastes their afternoon and yours.",
    nic: "The adapter negotiates a link and passes traffic. It is not the adapter.",
    isp: "Every other machine on this switch is on the internet right now. The circuit is up.",
    reimage: "Ninety minutes to prove the problem is not in the operating system, which nothing suggested it was.",
    duplexport: "The port is negotiating a full-duplex gigabit link with no late collisions. There is nothing about its duplex to change.",
    portsecfix: "The port is up and forwarding, with one MAC address on it and no violation recorded. It has not been shut down by anything.",
    proxyfix: "There is no proxy configured on this machine, and the browser is not the layer that is failing.",
    enablenic: "The adapter is enabled and passing traffic. Enabling something that is already enabled is a click and a wasted trip.",
    flushdns: "Every name on this machine resolves to the address the resolver holds for it. There is no stale answer cached here.",
    hostsfix: "The hosts file has nothing in it but the default comments.",
    bandpref: "The adapter is on the faster radio and roaming correctly.",
    mtufix: "Full-size frames cross the path without being dropped, so the frame size fits.",
    removeloop: "No ports are shut and there is no loop on this floor." }[chosen];
}
