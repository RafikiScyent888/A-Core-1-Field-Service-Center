/* =====================================================================
   Field Service Center — objective 2.4

   "Explain common network configuration concepts."

   An Explain objective, so a drill. The difficulty is that none of it is an
   object: a subnet mask is arithmetic, a lease is a promise with a clock on
   it, a VLAN is a number in a switch, and a VPN is a tunnel that does not
   exist anywhere you can point at.

   But ONE thing here is genuinely spatial and it is the thing students get
   wrong most: an address space is a LINE. It has a first address that
   nobody can use and a last address that nobody can use. The gateway sits at
   one end of it by convention. The DHCP scope is a segment of it, and the
   reservations are pegs inside that segment. The mask decides where the line
   is cut. And a machine that has fallen back to a self-assigned address is
   not further along the line — it is on a completely different line, which
   is exactly why it cannot reach the gateway no matter how long you wait.

   So the model draws the line, and the panel carries the readout a
   technician would actually be looking at. Between them, everything in this
   pool can be worked out rather than recalled.

   Same rules as the other four drills: the answer is nowhere on the page,
   every wrong answer is a real concept, and no field describes itself in
   terms of another item in the pool.
   ===================================================================== */

export const NETCONF = [
  {
    key: "arecord", name: "A record", kind: "dns",
    what: "A single line in a zone that maps one name to one IPv4 address",
    does: "Lets everything else refer to a machine by something a person can remember and " +
      "type, so the address can change underneath without anybody being told",
    breaks: "The name stops resolving. Anything that already had the answer keeps working " +
      "until its copy expires, which is why the outage looks like it started at different " +
      "times on different machines",
    where: "In the forward lookup zone on the name server that is authoritative for it",
    reads: "A lookup returns one address and a time-to-live in seconds",
    lookalike: "aaaarecord",
    lookalikeWhy: "The same job for the other address family, and the pair is why a host can " +
      "resolve perfectly and still be unreachable: a client with no working route for one " +
      "family will happily take that family's answer and then sit there."
  },
  {
    key: "aaaarecord", name: "AAAA record", kind: "dns",
    what: "The same kind of line, mapping one name to one IPv6 address",
    does: "Publishes the address a client should use where both ends can route the newer " +
      "family, which most clients now prefer when they are offered both",
    breaks: "Clients fall back to the older family, which usually works and occasionally " +
      "does not — and when it does not, the fault looks intermittent because it depends on " +
      "which family the client tried first",
    where: "In the same forward lookup zone, alongside the older record for the same name",
    reads: "A lookup returns an address with colons in it rather than dots",
    lookalike: "arecord",
    lookalikeWhy: "Two records, one name, two answers. A client that prefers the newer " +
      "family and cannot route it will take the answer, fail, and time out before falling " +
      "back — which the user reports as “slow” rather than as broken."
  },
  {
    key: "mxrecord", name: "MX record", kind: "dns",
    what: "A line that names which host accepts mail for a domain, and in what order to try them",
    does: "Tells every other organisation's mail server where to deliver, and lets you put " +
      "a filter in front of the mailboxes without telling the world about it",
    breaks: "Inbound mail stops arriving. Senders queue it and retry for days before it " +
      "bounces, so nobody outside notices and nobody inside is told",
    where: "In the public zone for the domain, pointing at a name that itself resolves to an address",
    reads: "A lookup returns one or more hostnames each with a preference number",
    lookalike: "txtrecord",
    lookalikeWhy: "Both are published for mail and both get edited in the same session " +
      "during a migration. One decides where mail is delivered; the other decides whether " +
      "what you send is believed. Getting the second one wrong is silent for weeks."
  },
  {
    key: "txtrecord", name: "TXT record", kind: "dns",
    what: "A line holding free text, used in practice to publish policy that other " +
      "organisations check",
    does: "Carries the statements that say which servers may send mail as this domain and " +
      "what to do with anything else — the mechanism the receiving side uses to decide " +
      "whether to believe you",
    breaks: "Mail you send starts landing in other people's junk folders, or is rejected " +
      "outright, while everything inside the organisation looks perfectly healthy",
    where: "In the public zone, as plain text with a syntax the checking side agrees on",
    reads: "A lookup returns a quoted string rather than an address",
    lookalike: "mxrecord",
    lookalikeWhy: "Both are about mail and neither is about a mailbox. The one that " +
      "controls delivery TO you is not the one that controls whether what you send is " +
      "trusted, and a migration that updates only the first produces a fortnight of " +
      "mysteriously rejected mail."
  },
  {
    key: "cname", name: "CNAME record", kind: "dns",
    what: "A line that makes one name an alias for another name rather than for an address",
    does: "Lets several names follow one real host, so a service can be moved by editing " +
      "one record instead of a dozen",
    breaks: "The alias stops resolving, or resolves in a loop if two of them were pointed " +
      "at each other — which is a fault that survives a reboot and confuses everyone",
    where: "In the forward lookup zone, pointing at another name in the same or another zone",
    reads: "A lookup returns a second name, which then has to be resolved in its own right",
    lookalike: "arecord",
    lookalikeWhy: "Both are how a name gets answered and people use the words " +
      "interchangeably. One ends the question; the other passes it on. A chain of aliases " +
      "that ends at nothing looks exactly like a name server that is down."
  },
  {
    key: "scope", name: "DHCP scope", kind: "dhcp",
    what: "The range of addresses a server is allowed to hand out on one segment",
    does: "Defines the pool. Everything the server gives away comes from inside it, and " +
      "anything outside it is somebody's job to assign by hand",
    breaks: "When it runs out, new machines get nothing and fall back to a self-assigned " +
      "address. Machines that were already on stay on, so the fault spreads through the " +
      "day as people arrive",
    where: "On the server, per segment, defined as a first and last address",
    reads: "A count of addresses in use against addresses available, and a percentage",
    lookalike: "reservation",
    lookalikeWhy: "Both are configured in the same place on the same server and both are " +
      "about which address a machine ends up with. One is the pool everybody draws from; " +
      "the other pins one machine to one address inside it. Sizing the first without " +
      "counting the second is how a range that looks half empty runs dry."
  },
  {
    key: "lease", name: "DHCP lease", kind: "dhcp",
    what: "A loan of an address for a stated length of time, which the client is expected " +
      "to renew halfway through",
    does: "Lets addresses come back to the pool when machines leave, without anybody having " +
      "to take them back by hand",
    breaks: "Nothing, at first. Then machines start dropping off as their loans expire and " +
      "cannot be renewed — which is why the fault appears gradually over a day rather than " +
      "all at once",
    where: "Set on the server as a duration; visible on the client as an obtained time and " +
      "an expiry time",
    reads: "An obtained-at and an expires-at timestamp on the client, and a count on the server",
    lookalike: "scope",
    lookalikeWhy: "One is how many addresses there are and the other is how long each one " +
      "is kept. A short duration in a room full of visitors is what keeps a small range " +
      "working; a long one in the same room is what exhausts it."
  },
  {
    key: "reservation", name: "DHCP reservation", kind: "dhcp",
    what: "An instruction that one particular machine always receives one particular address",
    does: "Gives a device a fixed address while leaving it configured to ask, so it is " +
      "still managed centrally rather than typed into the device and forgotten",
    breaks: "The device gets an ordinary address from the pool instead, and anything that " +
      "was pointed at its old one — a print queue, a scan destination, a firewall rule — " +
      "stops finding it",
    where: "On the server, matched against the device's hardware address",
    reads: "An entry pairing a hardware address with an address, listed separately from the pool",
    lookalike: "staticaddr",
    lookalikeWhy: "Both produce a device that always has the same address, and on the " +
      "device they look identical. One is recorded on the server where the next technician " +
      "will find it; the other is typed into the device where nobody will. That difference " +
      "is invisible until the day the range is renumbered."
  },
  {
    key: "staticaddr", name: "Static addressing", kind: "addressing",
    what: "An address, mask, gateway and name server typed into the device itself",
    does: "Guarantees an address without depending on a server being up, which is why the " +
      "infrastructure that the server itself depends on is configured this way",
    breaks: "Nothing, until the network is renumbered or the device is moved to another " +
      "segment — at which point it keeps insisting on an address that no longer means " +
      "anything there",
    where: "On the device, in its own network settings",
    reads: "A configuration that reports the assignment was not obtained from a server",
    lookalike: "reservation",
    lookalikeWhy: "The outcome is the same and the maintenance is not. This one is only " +
      "written down inside the device; change the addressing scheme and every device " +
      "configured this way has to be visited."
  },
  {
    key: "apipa", name: "APIPA / link-local address", kind: "addressing",
    what: "An address a machine gives itself when it asked for one and got no answer",
    does: "Allows machines on the same wire to talk to each other with no server at all — " +
      "which is occasionally useful and mostly just a symptom",
    breaks: "It IS the break. A machine holding one is announcing that it asked and nobody " +
      "answered, and it will not reach the gateway however long you wait, because it is " +
      "not on the same address space as the gateway at all",
    where: "Nowhere. It is what a client does on its own when the request goes unanswered",
    reads: "An address beginning 169.254, with no gateway listed at all",
    lookalike: "scope",
    lookalikeWhy: "One is the cause and the other the symptom, and they are reported as " +
      "the same complaint. A machine that self-assigns is telling you something about the " +
      "server or the path to it, and replacing the machine's adapter tells you nothing."
  },
  {
    key: "mask", name: "Subnet mask", kind: "addressing",
    what: "The line that separates the part of an address naming the network from the part " +
      "naming the machine",
    does: "Tells a machine which addresses it can reach directly and which it must hand to " +
      "the gateway, which is the single decision it makes about every packet it sends",
    breaks: "Some destinations work and some do not, and which ones depends on arithmetic " +
      "rather than on anything the user did — which is why it is reported as “the network " +
      "is flaky” rather than as a configuration fault",
    where: "On the device, beside the address, and handed out with it where a server is used",
    reads: "A second dotted value, or a slash and a number after the address",
    lookalike: "gateway",
    lookalikeWhy: "Both decide where a packet goes and getting either wrong produces " +
      "partial reachability. One says which addresses are local; the other says where to " +
      "send everything that is not. A machine with the wrong one of these can often still " +
      "ping its neighbour, which is what makes it hard to see."
  },
  {
    key: "gateway", name: "Default gateway", kind: "addressing",
    what: "The address a machine sends anything to when the destination is not on its own segment",
    does: "Is the way out. Everything that is not local goes here and the machine does not " +
      "need to know anything else about the wider network",
    breaks: "Anything on the same segment still works perfectly and nothing else does at " +
      "all, which is a very distinctive shape once you have seen it once",
    where: "On the device, and handed out with the address where a server is used",
    reads: "One address, which must itself be inside the machine's own local range",
    lookalike: "mask",
    lookalikeWhy: "The classic pairing, because both are about reaching things off the " +
      "machine. This one being wrong breaks everything remote and nothing local; the other " +
      "being wrong breaks an arbitrary-looking subset of both."
  },
  {
    key: "vlan", name: "VLAN", kind: "segmentation",
    what: "A number carried on a switch port that decides which broadcast domain the port " +
      "belongs to",
    does: "Lets one physical switch carry several separate networks, so traffic can be kept " +
      "apart without buying another switch or running another cable",
    breaks: "A device is physically connected, its link light is on, and it is on the wrong " +
      "network — so it either gets an address from a server it was never meant to reach, " +
      "or gets nothing at all",
    where: "On the switch, per port, with a list of which numbers a trunk is allowed to carry",
    reads: "A port's assigned number, and for a trunk the set of numbers permitted across it",
    lookalike: "vpn",
    lookalikeWhy: "Both are described as separating traffic and both get called " +
      "“virtual”. One divides a network you own into pieces; the other joins something " +
      "outside your building onto a network you own. They are nearly opposite operations."
  },
  {
    key: "vpn", name: "VPN", kind: "tunnel",
    what: "An encrypted tunnel that carries traffic across a network you do not control, " +
      "so that both ends behave as though they were on the same one",
    does: "Puts a remote machine, or a remote site, onto the inside — with an inside " +
      "address, inside name resolution and inside routing",
    breaks: "The remote user reaches nothing internal while reaching everything on the " +
      "internet perfectly, which they will report as the applications being down",
    where: "On a concentrator or firewall at the edge, and as a profile on the client",
    reads: "A tunnel state, an assigned inside address, and a policy for which traffic uses it",
    lookalike: "vlan",
    lookalikeWhy: "Both are sold as “keeping traffic separate” and the words get swapped " +
      "in meetings. Ask which direction it works in: one carves a local network up, the " +
      "other extends it outward across something you do not own."
  },
  {
    key: "dhcprelay", name: "DHCP relay", kind: "dhcp",
    what: "A setting on a router that forwards address requests from a segment to a server " +
      "on another one",
    does: "Lets one server serve many segments, because the request itself is a broadcast " +
      "and a broadcast does not cross a router on its own",
    breaks: "One whole segment gets no addresses while every other segment is fine — and " +
      "the server looks healthy, because from its point of view nobody on that segment " +
      "ever asked",
    where: "On the router or layer-three switch owning the segment, pointed at the server's address",
    reads: "A helper address configured on the segment's own interface",
    lookalike: "scope",
    lookalikeWhy: "Both produce a segment with no addresses and the server is innocent in " +
      "one of the two cases. If the pool is not exhausted and one segment alone is dead, " +
      "the requests are not arriving rather than being refused."
  }
];

const BY = {};
NETCONF.forEach(function (c) { BY[c.key] = c; });
export { BY as BY_KEY };

function pick(D, field, n, rnd) {
  var want = String(D.item[field]);
  var look = BY[D.item.lookalike];
  var out = [], seen = {};
  seen[want] = 1;
  function take(c) {
    if (c.key === D.item.key) return;
    var v = String(c[field]);
    if (out.length >= n || seen[v]) return;
    seen[v] = 1; out.push(c);
  }
  if (look) take(look);
  rnd(NETCONF).forEach(take);
  return out.slice(0, n);
}

/* ---------------------------------------------------------------------
   The readout.

   What a technician has in front of them when configuration is the
   question: the client's own view of itself, and then whichever of the
   three server-side views the item belongs to. It states values and never
   verdicts, and it never names the concept being asked about.
   --------------------------------------------------------------------- */
export function readoutRows(D) {
  var it = D.item;
  var base = [
    { k: "Address on the client", v: it.key === "apipa" ? "169.254.18.7" : "192.168.20.64" },
    { k: "Mask", v: it.key === "apipa" ? "255.255.0.0" : "255.255.255.0" },
    { k: "Gateway", v: it.key === "apipa" ? "not set" : "192.168.20.1" },
    { k: "Assignment", v: it.key === "staticaddr" ? "typed into this device"
        : it.key === "apipa" ? "self-assigned after no answer" : "obtained from a server" }
  ];
  if (it.kind === "dns") {
    return base.concat([
      { k: "Lookup issued for", v: "the name the user typed" },
      { k: "What came back", v: it.reads },
      { k: "Zone answering", v: "the one the organisation publishes for itself" }
    ]);
  }
  if (it.kind === "dhcp") {
    return base.concat([
      { k: "Pool", v: "192.168.20.100 to 192.168.20.199" },
      { k: "In use", v: it.key === "scope" ? "100 of 100" : "61 of 100" },
      { k: "Fixed pairings held", v: it.key === "reservation" ? "9" : "2" },
      { k: "Loan period", v: it.key === "lease" ? "8 days" : "8 hours" },
      { k: "Helper on this segment", v: it.key === "dhcprelay" ? "not configured" : "192.168.10.9" }
    ]);
  }
  if (it.kind === "segmentation") {
    return base.concat([
      { k: "Switch port", v: "GigabitEthernet1/0/14" },
      { k: "Number assigned to the port", v: "40" },
      { k: "Numbers permitted on the uplink", v: "10, 20, 30" },
      { k: "Link", v: "up, 1 Gb/s, full duplex" }
    ]);
  }
  if (it.kind === "tunnel") {
    return base.concat([
      { k: "Tunnel", v: "established, 41 minutes" },
      { k: "Address assigned inside it", v: "10.99.4.22" },
      { k: "Traffic sent through it", v: "everything for 10.0.0.0/8 only" },
      { k: "Everything else", v: "goes out the local connection" }
    ]);
  }
  return base.concat([
    { k: "Reaches its own segment", v: it.key === "gateway" ? "yes" : "yes" },
    { k: "Reaches anything beyond it", v: it.key === "gateway" ? "no" : it.key === "apipa" ? "no" : "yes" },
    { k: "Name resolution", v: it.key === "apipa" ? "no server known" : "answering" }
  ]);
}

export function netconfQuestions(D, rnd) {
  var it = D.item;
  var qs = [];

  qs.push({
    id: "which",
    ask: "Which configuration concept is this?",
    hint: "Read the plan and the readout together. Where the address sits on the line, and " +
      "whether it was obtained or typed, narrows it before any of the wording does.",
    answer: it.name,
    choices: [it.name].concat(pick(D, "name", 3, rnd).map(function (c) { return c.name; })),
    why: function (chosen) {
      if (chosen === it.name) return it.what + ". " + it.lookalikeWhy;
      var o = NETCONF.filter(function (c) { return c.name === chosen; })[0];
      return o ? "That is a real concept and it is not this one. " + o.what +
        ". Go back to the readout — the line that separates them is what was configured " +
        "where, not what the symptom was." : "That is not what is in front of you.";
    }
  });

  qs.push({
    id: "does",
    ask: "What is it actually for?",
    hint: "Not the mechanism — the reason somebody bothered. Every one of these exists " +
      "because something was unmanageable without it.",
    answer: it.does,
    choices: [it.does].concat(pick(D, "does", 3, rnd).map(function (c) { return c.does; })),
    why: function (chosen) {
      if (chosen === it.does) return "Yes. " + it.does + ".";
      return "That is what a different concept is for. Work back from the readout: what " +
        "would somebody have to do by hand if this were not configured?";
    }
  });

  qs.push({
    id: "breaks",
    ask: "What does it look like when this is wrong or missing?",
    hint: "The SHAPE of the failure is the point. Some of these break everything at once, " +
      "some break a subset that looks random, and one of them breaks nothing you can see " +
      "for a fortnight.",
    answer: it.breaks,
    choices: [it.breaks].concat(pick(D, "breaks", 3, rnd).map(function (c) { return c.breaks; })),
    why: function (chosen) {
      if (chosen === it.breaks) {
        return "Right. " + it.breaks + ". Knowing the shape of the failure is how you get " +
          "from a phone call to a setting.";
      }
      return "That is a different concept's failure. Read the plan again — what a machine " +
        "can still reach when this is wrong is usually the whole clue.";
    }
  });

  qs.push({
    id: "where",
    ask: "Where is it configured?",
    hint: "On the device, on a server, on a switch port, or at the edge. Which of those it " +
      "is decides who you have to talk to before anything can change.",
    answer: it.where,
    choices: [it.where].concat(pick(D, "where", 3, rnd).map(function (c) { return c.where; })),
    why: function (chosen) {
      if (chosen === it.where) {
        return "Correct — " + it.where + ". Half of fixing a configuration fault is " +
          "knowing whose console it lives on.";
      }
      return "That is where something else is set. A concept configured on a server and a " +
        "concept configured on a switch port produce similar symptoms and belong to " +
        "different people.";
    }
  });

  qs.push({
    id: "confused",
    ask: "Which concept does it get confused with?",
    hint: "Not the one that sounds similar — the one that gets configured by mistake " +
      "instead of it, and produces a fault nobody can explain.",
    answer: BY[it.lookalike].name,
    choices: (function () {
      var set = [BY[it.lookalike].name];
      pick(D, "name", 6, rnd).forEach(function (c) {
        if (set.length < 4 && c.key !== it.lookalike && set.indexOf(c.name) === -1) set.push(c.name);
      });
      return set;
    })(),
    why: function (chosen) {
      if (chosen === BY[it.lookalike].name) return it.lookalikeWhy;
      return "That one is separable without much thought. The pairing this question wants " +
        "is the one that gets typed into the wrong box.";
    }
  });

  return qs;
}
