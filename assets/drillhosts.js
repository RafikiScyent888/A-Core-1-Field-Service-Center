/* =====================================================================
   Field Service Center — objective 2.3

   "Summarize services provided by networked hosts."

   A Summarize objective, so a drill rather than a service call. But it has
   the same problem 2.2 had, worse: eight of the sixteen hosts in this pool
   are the SAME 1U box. A domain name server and a logging server are one
   chassis, one pair of network ports and one power button apart from each
   other, and no amount of rendering will ever tell them apart.

   So the instrument is two things at once, which is how it works in a real
   comms room:

   1. WHAT IT LOOKS LIKE AND WHERE IT IS CABLED. This is genuine evidence
      for a good half of the pool. A chassis full of hot-swap caddies is
      storage. A beige tower with a floppy drive and a parallel port is the
      legacy application nobody will let you touch. A controller on a DIN
      rail in a field cabinet is not an office server at all. An appliance
      racked above the switch with the fibre handoff above IT is at the
      boundary, and an appliance racked below the switch in front of a row
      of identical servers is not.

   2. WHAT IT ANSWERS. For the eight that look identical, the only evidence
      is behaviour: who starts the conversation, what they send, what comes
      back, and what stops when the host stops.

   The port numbers are DELIBERATELY not in the log panel. Putting 53/udp
   beside the readings would turn 2.3 into a lookup of 2.1 and the student
   would never have to reason about the role at all. Instead the role is
   worked out from behaviour, and THEN a question asks which port it answers
   on — which is 2.1 being used rather than 2.1 being copied.
   ===================================================================== */

export const HOSTS = [
  {
    key: "dns", name: "DNS server", form: "u1", portKey: "53",
    use: "Turning names into addresses, so that people and configuration files can refer to " +
      "machines by something they can remember",
    asks: "A name",
    returns: "An address, and a note of how long the asker may keep it",
    starts: "Every client on the network, constantly, without anybody asking it to",
    size: "A few hundred bytes each way",
    sessions: "Thousands an hour, each one lasting a few milliseconds",
    stops: "Nothing resolves by name. Anything already holding an address carries on working until " +
      "that answer expires, which is why the outage looks like it started at random times on " +
      "different machines",
    where: "On the inside with the clients, and never only one of them",
    port: "53 — UDP for ordinary lookups, TCP when the answer is too big for one datagram",
    look: "A plain 1U server: rack ears, a row of vents, a power button, and a console port " +
      "and a video output on the right-hand end. Nothing on the chassis distinguishes it from " +
      "any other 1U server in this pool, which is the point \u2014 but it HAS a video output, and " +
      "that alone separates it from every appliance in the rack.",
    lookalike: "dhcp",
    lookalikeWhy: "Both hand a client something it cannot work without, both are very often on the " +
      "same box, and both produce the same phone call: “the internet is down”. One answers " +
      "questions about names. The other hands out the address the questions get asked from."
  },
  {
    key: "dhcp", name: "DHCP server", form: "u1", portKey: "67",
    use: "Handing a machine that has just been switched on everything it needs to be on the " +
      "network at all — without anybody typing it in",
    asks: "A broadcast from a machine that has no address yet and cannot ask anybody directly",
    returns: "An address, a mask, a gateway and the address of a name server, on a lease with a " +
      "clock on it",
    starts: "Any machine that has just joined, woken or had its cable moved",
    size: "Four small broadcast exchanges and then silence for hours",
    sessions: "Four packets when a machine arrives, and then nothing from it for hours",
    stops: "Nothing at first — existing leases run on. Then machines begin dropping onto " +
      "self-assigned 169.254 addresses as their leases expire and cannot be renewed, so the fault " +
      "spreads slowly over a day instead of all at once",
    where: "On the client's own broadcast domain, or relayed onto it by the router",
    port: "67 and 68 on UDP — the server listens on one and answers to the other",
    look: "A plain 1U server: rack ears, a row of vents, a power button, and a console port " +
      "and a video output on the right-hand end. Nothing on the chassis distinguishes it from " +
      "any other 1U server in this pool, which is the point \u2014 but it HAS a video output, and " +
      "that alone separates it from every appliance in the rack.",
    lookalike: "dns",
    lookalikeWhy: "They are usually the same machine and they fail differently. Lose the name " +
      "service and everything breaks at once; lose this one and nothing breaks until leases start " +
      "expiring. If the complaints arrived gradually over a morning, this is the one to look at."
  },
  {
    key: "fileserver", name: "File server", form: "u2bays", portKey: "445",
    use: "Keeping documents in one place that can be permissioned, audited and backed up, " +
      "instead of on forty desktops",
    asks: "A request for a folder or a file, from a user the network has already signed in",
    returns: "The file, after a permission check that decides whether that user may have it",
    starts: "Users, all day, and whatever backup job runs at night",
    size: "Anything from a few kilobytes to a very large document, in bursts",
    sessions: "One per signed-in user, held open all working day",
    stops: "Mapped drives go stale, documents refuse to save, and within the hour people are " +
      "emailing attachments to themselves to get on with the day",
    where: "In the rack on the office network, with its storage attached to it",
    port: "445 for Windows clients, and 2049 where the clients are Unix",
    look: "A 2U chassis with six hot-swap drive caddies across the front — and, beside them, a " +
      "console port and a video output, because it is a general-purpose computer somebody may " +
      "need to sit in front of.",
    lookalike: "nas",
    lookalikeWhy: "This is the pairing the objective exists for. From the front they are both a " +
      "chassis full of drives. This one is a computer: it has video out and a console port, it " +
      "runs an operating system you chose, and you can install anything else on it. The other has " +
      "no video output at all, because you are never meant to sit in front of it."
  },
  {
    key: "nas", name: "Network attached storage", form: "u2bays", portKey: "nas445",
    use: "Storage as a device rather than as a computer — shares and a backup target without a " +
      "server to build, patch and licence",
    asks: "A request for a share, from users during the day and from the backup job at night",
    returns: "The files, served by a fixed appliance operating system that is configured through a " +
      "web page rather than logged in to",
    starts: "Users, and the backup software that treats it as somewhere to put last night's copy",
    size: "Large sustained transfers overnight, small ones during the day",
    sessions: "A handful during the day, and one very long one every night",
    stops: "The shares vanish — and so does last night's backup, which is the part nobody " +
      "notices until they need it",
    where: "In the rack beside the servers, very often as the thing everything else is backed up to",
    port: "445 and 2049 for the shares, plus 443 for the web console that is the only way in",
    look: "A 2U chassis full of hot-swap caddies with a small status display and four navigation " +
      "buttons — and no video output anywhere on it.",
    lookalike: "fileserver",
    lookalikeWhy: "Same drives, same front, completely different thing to own. Look for a video " +
      "port. An appliance does not have one because it has no console to show you; a server does, " +
      "because sooner or later somebody has to stand in front of it with a crash cart."
  },
  {
    key: "printserver", name: "Print server", form: "module", portKey: "9100",
    use: "Putting a printer on the network and holding the queue, so that jobs are not lost when " +
      "the machine that sent them goes to sleep",
    asks: "A print job, in a page language the device on the end of it understands",
    returns: "A queue position, and eventually a page out of the printer",
    starts: "Users, and any application that prints without being watched",
    size: "Small for text, very large for anything with a photograph in it",
    sessions: "One per job, for as long as the job takes to spool",
    stops: "Jobs queue and nothing comes out. Within twenty minutes somebody is walking to the " +
      "device with a memory stick",
    where: "On the office network near the devices it serves, or built into the printer itself",
    port: "9100 for raw jobs, 631 where it speaks IPP, and 515 for the old queues",
    look: "Not a rack device: a small sealed box on a bracket with one network port, one USB " +
      "port for the device it feeds, and a status light. No screen, no drives, nothing to log " +
      "in to.",
    lookalike: "iot",
    lookalikeWhy: "Both are small sealed boxes with one network port and no screen, and both get " +
      "written down as “network box” on an inventory. One accepts work and hands it to a " +
      "device. The other reports readings and takes instructions. Getting them the wrong way round " +
      "is how a print queue ends up on the building-management network."
  },
  {
    key: "mail", name: "Mail server", form: "u1", portKey: "25",
    use: "Holding everybody's mailboxes and moving messages between this organisation and every " +
      "other one",
    asks: "A message to send, or a request for whatever is waiting in a mailbox",
    returns: "Delivery to the next hop, or the contents of the mailbox to the client asking",
    starts: "Users all day, and other organisations' servers at any hour",
    size: "Small messages and occasionally enormous attachments",
    sessions: "A few hundred a day from staff, and a steady trickle from other organisations at all hours",
    stops: "Mail stops moving. Messages sent to the organisation queue at the sender and are " +
      "retried for days before they bounce, so the damage is invisible from the inside for a while",
    where: "On the inside, behind whatever filters what arrives from outside",
    port: "25 between servers, 587 for clients sending, and 993 for clients reading",
    look: "A plain 1U server: rack ears, a row of vents, a power button, and a console port " +
      "and a video output on the right-hand end. Nothing on the chassis distinguishes it from " +
      "any other 1U server in this pool, which is the point \u2014 but it HAS a video output, and " +
      "that alone separates it from every appliance in the rack.",
    lookalike: "spamgw",
    lookalikeWhy: "They handle the same messages a second apart and both live in the same rack. " +
      "The giveaway is direction: the outside world delivers to the filter first, and this box only " +
      "ever sees what the filter passed on."
  },
  {
    key: "spamgw", name: "Spam gateway", form: "appliance", portKey: "gw25",
    use: "Being the address the outside world's mail actually goes to, so that what reaches the " +
      "mailboxes has already been filtered",
    asks: "Every message arriving from outside, before anything on the inside has seen it",
    returns: "The ones that survive the filter, forwarded on — the rest quarantined, with a " +
      "digest to the intended recipient",
    starts: "The internet, unprompted and at all hours",
    size: "Everything inbound, including the nine tenths of it that will be discarded",
    sessions: "A constant stream from the internet, nine tenths of which are refused before they finish",
    stops: "Either mail stops arriving at all, or it starts arriving unfiltered — and which of " +
      "those happens depends entirely on whether the outside world has a second address to fall " +
      "back to",
    where: "At the boundary, in front of the mailboxes — it is the address published to the " +
      "outside world",
    port: "25 inbound from the internet, and a web console for releasing what it held back",
    look: "A 1U appliance: two network ports, one large drive bay because it has to queue what it " +
      "is holding, a console port, and no video output.",
    lookalike: "mail",
    lookalikeWhy: "Same protocol, same rack, one hop apart. Ask which one the outside world is " +
      "told to deliver to. That is this one, and everything it does happens before the mailboxes " +
      "exist as far as the sender is concerned."
  },
  {
    key: "web", name: "Web server", form: "u1", portKey: "443",
    use: "Serving pages and application responses to whoever asks for them",
    asks: "A request for a particular page or resource by name",
    returns: "The page, an image, or an answer produced by an application sitting behind it",
    starts: "Browsers, from wherever the site is published to",
    size: "Many small requests and a few large ones",
    sessions: "Hundreds at once, most of them lasting seconds",
    stops: "That site stops answering. Nothing else on the network notices at all, which is what " +
      "makes it easy to isolate",
    where: "Behind whatever spreads the load, or on its own in front of the application it fronts",
    port: "80 for plain requests and 443 for encrypted ones",
    look: "A plain 1U server: rack ears, a row of vents, a power button, and a console port " +
      "and a video output on the right-hand end. Nothing on the chassis distinguishes it from " +
      "any other 1U server in this pool, which is the point \u2014 but it HAS a video output, and " +
      "that alone separates it from every appliance in the rack.",
    lookalike: "proxy",
    lookalikeWhy: "Both speak the same protocol and both sit in a rack answering requests. This " +
      "one holds the content and is the destination. The other holds nothing and is a middleman — " +
      "which is why pointing a browser at the wrong one produces a page nobody can explain."
  },
  {
    key: "proxy", name: "Proxy server", form: "u1", portKey: "3128",
    use: "Making outbound requests on the clients' behalf, so they can be cached, logged, and " +
      "refused when policy says so",
    asks: "A request from an inside client for something that lives outside",
    returns: "The page — fetched on the client's behalf, possibly from cache, and possibly " +
      "replaced with a refusal",
    starts: "Inside clients only. Nothing outside ever starts a conversation with it",
    size: "Whatever the clients are browsing, plus a log line for every one of them",
    sessions: "One per inside client, and not a single one started from outside",
    stops: "Browsing stops for every client configured to use it, while anything that was not " +
      "configured to use it carries on perfectly — which is the fingerprint of this fault",
    where: "Between the clients and the boundary, facing the clients",
    port: "3128 or 8080 by convention, and in practice whatever the administrator chose",
    look: "A plain 1U server: rack ears, a row of vents, a power button, and a console port " +
      "and a video output on the right-hand end. Nothing on the chassis distinguishes it from " +
      "any other 1U server in this pool, which is the point \u2014 but it HAS a video output, and " +
      "that alone separates it from every appliance in the rack.",
    lookalike: "loadbalancer",
    lookalikeWhy: "Both stand in the middle and pass traffic on, which is why they get muddled. " +
      "The difference is which way they face. This one faces the clients and asks on their behalf; " +
      "the other faces the outside and spreads what arrives across a row of identical servers."
  },
  {
    key: "loadbalancer", name: "Load balancer", form: "appliance", portKey: "passthrough",
    use: "Making several identical servers answer as one address, and quietly taking the sick " +
      "ones out of rotation",
    asks: "Every connection arriving for one published address",
    returns: "The same connection, handed to whichever server behind it is healthiest",
    starts: "Whoever the service is published to — and itself, continuously, health-checking " +
      "everything behind it",
    size: "Everything the published service carries, plus a small check to each server every few " +
      "seconds",
    sessions: "Every session the published service has, plus a two-second heartbeat to each machine behind it",
    stops: "The published address stops answering even though every server behind it is running " +
      "perfectly — which is why the first report is always “the servers are fine”",
    where: "In front of a row of identical servers, on the inside of the boundary",
    port: "Whatever the published service uses — and separately, a health check against every " +
      "server behind it",
    look: "A 1U appliance with a row of eight identical network ports, a pair set apart from the " +
      "rest for the link to its twin, and a console port.",
    lookalike: "proxy",
    lookalikeWhy: "Both are middlemen and neither holds the content. Ask who starts the " +
      "conversation. If it is an inside client reaching out, it is a proxy; if it is the outside " +
      "world reaching in, it is this."
  },
  {
    key: "aaa", name: "Authentication server", form: "u1", portKey: "1812",
    use: "Deciding who gets in and what they are allowed to do, once, in one place, for every " +
      "switch, wireless controller and VPN on the network",
    asks: "Credentials — forwarded by a switch, a wireless controller or a VPN concentrator on " +
      "a user's behalf",
    returns: "Accept or reject, and the set of permissions that go with the answer",
    starts: "Network equipment, never users directly",
    size: "Tiny exchanges, one per login attempt",
    sessions: "One tiny exchange per login attempt, and nothing at all between them",
    stops: "Nobody new can log in. Sessions already open carry on untroubled, which is why the " +
      "outage gets reported half an hour after it began and only by people who arrived late",
    where: "On the inside, reachable by every device that authenticates anybody",
    port: "1812 and 1813 on UDP for RADIUS, and 49 where it is TACACS+",
    look: "A plain 1U server: rack ears, a row of vents, a power button, and a console port " +
      "and a video output on the right-hand end. Nothing on the chassis distinguishes it from " +
      "any other 1U server in this pool, which is the point \u2014 but it HAS a video output, and " +
      "that alone separates it from every appliance in the rack.",
    lookalike: "syslog",
    lookalikeWhy: "Both are servers that network equipment talks to and users never see, and both " +
      "get configured on the same line of a switch config. One decides whether somebody gets in. " +
      "The other writes down that they did. Point the switch at the wrong one and you get a log " +
      "full of nothing and a door that will not open."
  },
  {
    key: "syslog", name: "Logging server", form: "u1", portKey: "514",
    use: "Collecting what every other device on the network has to say, in one place, so that " +
      "there is something to read after the event",
    asks: "Nothing. Events are pushed at it by everything else, unprompted",
    returns: "Nothing to the sender — it is a one-way write",
    starts: "Every switch, router, firewall and server on the network",
    size: "A constant trickle, and a flood the moment something goes wrong",
    sessions: "None. Nothing ever connects to it and waits for a reply",
    stops: "Nothing appears to break at all. You find out weeks later, when you need the record " +
      "of an incident and there is a hole where it should be",
    where: "On the inside, with everything on the network pointed at it",
    port: "514 on UDP by tradition, and 6514 where the stream is encrypted",
    look: "A plain 1U server: rack ears, a row of vents, a power button, and a console port " +
      "and a video output on the right-hand end. Nothing on the chassis distinguishes it from " +
      "any other 1U server in this pool, which is the point \u2014 but it HAS a video output, and " +
      "that alone separates it from every appliance in the rack.",
    lookalike: "aaa",
    lookalikeWhy: "Configured side by side on the same equipment and easily transposed. This one " +
      "never answers anybody — if the box you are looking at is sending replies back to the " +
      "switches, it is not this."
  },
  {
    key: "utm", name: "Unified threat management appliance", form: "edge", portKey: "inline",
    use: "Doing at the boundary, in one box, what used to take a firewall, a filter, an " +
      "intrusion sensor and a scanner",
    asks: "Every packet crossing the boundary, in both directions",
    returns: "The ones policy allows — inspected, filtered, and written to the log",
    starts: "Nobody. It is in the path, not a destination",
    size: "All of it. Everything the site sends or receives passes through",
    sessions: "Not counted that way — everything the site does passes through it",
    stops: "Either nothing leaves the site at all, or everything does with nothing inspecting it, " +
      "depending on how it was set to fail",
    where: "At the boundary itself, between the site and the handoff from the provider",
    port: "None of its own — it is inline rather than something you connect to. Its management " +
      "page runs on 443",
    look: "A 1U appliance racked at the very top, with a fibre pair going up to the provider's " +
      "handoff and copper going down to the switch. One port is set apart from the others and " +
      "labelled for the outside.",
    lookalike: "loadbalancer",
    lookalikeWhy: "Two identical-looking 1U appliances with a row of ports and no drives. Follow " +
      "the cables. This one has the provider's handoff on one side of it; the other has a row of " +
      "servers on one side of it. Rack them the wrong way round and the security policy ends up " +
      "behind the thing it was bought to protect."
  },
  {
    key: "scada", name: "SCADA / ICS controller", form: "dinrail", portKey: "502",
    use: "Running a physical process — pumps, valves, doors, air handling — and reporting " +
      "what it is doing",
    asks: "Readings from field devices, on a fixed schedule that does not vary",
    returns: "Setpoints and commands back to those devices",
    starts: "Itself, on a timer, forever",
    size: "Very small messages at very regular intervals",
    sessions: "The same fixed set, reopened on a timer, for years",
    stops: "The plant carries on doing whatever it was last told to do, and nobody can see it or " +
      "change it — which is worse than it stopping",
    where: "In a field cabinet on its own industrial network, and it should never be reachable " +
      "from the office one",
    port: "502 for Modbus over TCP, and a list of others depending entirely on the vendor",
    look: "Not a rack device at all: a controller clipped to a DIN rail in a wall cabinet, with " +
      "screw terminal blocks under it and field wiring leaving the bottom.",
    lookalike: "legacy",
    lookalikeWhy: "Both are equipment nobody is allowed to patch and everybody is nervous of, and " +
      "both get the same shrug on an asset register. One is controlling something physical right " +
      "now, in real time. The other is only running an old application. Rebooting the first one to " +
      "see what happens is how people get hurt."
  },
  {
    key: "legacy", name: "Legacy system", form: "beige", portKey: "legacy",
    use: "Running the one application the business still depends on that was never rewritten, " +
      "will not run on anything newer, and has no supported replacement",
    asks: "Whatever the application in front of it speaks, which is usually proprietary and " +
      "usually undocumented",
    returns: "The one thing the business still needs from it",
    starts: "A handful of users in one department, on machines chosen to match it",
    size: "Whatever it was designed for, decades ago",
    sessions: "Six, from the same six desks, every working day",
    stops: "One department stops working entirely, and there is no second copy of it anywhere",
    where: "Wherever it was installed, usually on the office network, usually on an operating " +
      "system that stopped receiving patches years ago",
    port: "Whatever it was written for — often a high-numbered port nobody wrote down",
    look: "Not a rack device: a beige tower standing on the floor beside the rack, with an optical " +
      "bay, a floppy drive, and serial and parallel ports on the back.",
    lookalike: "scada",
    lookalikeWhy: "Both are untouchable and both are somebody else's problem until they are " +
      "yours. Ask what happens physically when it stops. If the answer is “a department cannot " +
      "work” it is this; if the answer involves something moving or not moving, it is not."
  },
  {
    key: "iot", name: "IoT device", form: "module", portKey: "iot443",
    use: "Sensing or controlling one small thing — a temperature, a door, a camera — and " +
      "reporting it somewhere it can be seen",
    asks: "Nothing of the network. It reports in, and it is told what to do",
    returns: "Readings, and an acknowledgement that it did what it was told",
    starts: "Itself, outbound, to a service that is usually the manufacturer's",
    size: "Very small and very frequent",
    sessions: "One, outbound, held open to somewhere that is not on this network",
    stops: "A thermostat, a camera or a door reader stops responding — and usually nobody " +
      "notices until somebody is standing in front of it",
    where: "On a segment of its own if anybody thought about it, and on the office network if " +
      "nobody did",
    port: "443 outbound to the manufacturer, and frequently nothing listening on the inside at all",
    look: "Not a rack device: a small sealed module on a bracket with a single network port " +
      "that also carries its power, and a sensor behind a dome on the front. No console, no " +
      "drives, nothing to log into.",
    lookalike: "printserver",
    lookalikeWhy: "Two small sealed boxes with one port each, and neither has a screen. Look at " +
      "what else is on it. A second port for a device it feeds means work goes through it; a lens " +
      "or a sensor and nothing else means it only ever reports."
  }
];

const BY = {};
HOSTS.forEach(function (h) { BY[h.key] = h; });
export { BY as BY_KEY };

/* Distractors for one field.

   The lookalike is offered first wherever it can be, because the pairing IS
   the objective. `avoidPort` is the exception: on the port question the
   lookalike is very often the host that answers on the SAME port — a file
   server and its appliance twin both serve 445 — and offering both makes a
   question with two defensible answers. So that one question excludes any
   host sharing the item's port group. */
function pick(D, field, n, rnd, avoidPort) {
  var want = String(D.item[field]);
  var look = BY[D.item.lookalike];
  var out = [], seen = {};
  seen[want] = 1;
  function usable(c) {
    if (c.key === D.item.key) return false;
    if (avoidPort && c.portKey === D.item.portKey) return false;
    return true;
  }
  function take(c) {
    if (!usable(c)) return;
    var v = String(c[field]);
    if (out.length >= n || seen[v]) return;
    seen[v] = 1; out.push(c);
  }
  if (look) take(look);
  rnd(HOSTS).forEach(take);
  return out.slice(0, n);
}

/* ---------------------------------------------------------------------
   The connection log.

   What a technician would actually have in front of them: not a packet
   capture, but the summary any monitoring page gives you about a host.
   Who talks to it, what they send, what comes back, how big, and what
   happens when it is gone.

   No port numbers, and no statement of where the host sits either. Both are
   graded questions, and the browser walker caught the second one: the panel
   was printing "where it sits in the path" verbatim beside a question asking
   where it sits in the path. Placement is read off the CABLING on the rack,
   and off the role once the role is known. See the file header for why the
   ports are held back.
   --------------------------------------------------------------------- */
export function logRows(D) {
  var it = D.item;
  return [
    { k: "Who starts the conversation", v: it.starts },
    { k: "What the other end sends", v: it.asks },
    { k: "What comes back", v: it.returns },
    { k: "Volume and shape", v: it.size },
    { k: "Sessions, as the monitoring sees them", v: it.sessions }
  ];
}

export function hostQuestions(D, rnd) {
  var it = D.item;
  var qs = [];

  qs.push({
    id: "role",
    ask: "What is this host's role?",
    hint: "Two sources of evidence and you need both. The chassis and its cabling narrow it down " +
      "— drives, ports, whether it is in the rack at all. The log says what it actually " +
      "answers. Start with whichever one is less ambiguous.",
    answer: it.name,
    choices: [it.name].concat(pick(D, "name", 3, rnd).map(function (c) { return c.name; })),
    why: function (chosen) {
      if (chosen === it.name) return it.look + " " + it.lookalikeWhy;
      var o = HOSTS.filter(function (c) { return c.name === chosen; })[0];
      if (!o) return "That is not what is in front of you.";
      return "That is a real role and it is not this one. " + o.look +
        " Go back to the log: the line that separates them is who starts the conversation.";
    }
  });

  qs.push({
    id: "use",
    ask: "What is one of these actually for?",
    hint: "Not what it does mechanically — why an organisation pays to have one. Every host in " +
      "this pool exists because something was unmanageable without it.",
    answer: it.use,
    choices: [it.use].concat(pick(D, "use", 3, rnd).map(function (c) { return c.use; })),
    why: function (chosen) {
      if (chosen === it.use) return "Yes. " + it.use + ".";
      return "That is why a different host exists. Work back from the log: what would somebody " +
        "have to do by hand if this box were not here?";
    }
  });

  qs.push({
    id: "stops",
    ask: "What stops working when this host stops?",
    hint: "This is the question that turns a definition into a diagnosis. Some of these take the " +
      "whole network down at once, some take it down slowly, and one of them breaks nothing you " +
      "can see for weeks.",
    answer: it.stops,
    choices: [it.stops].concat(pick(D, "stops", 3, rnd).map(function (c) { return c.stops; })),
    why: function (chosen) {
      if (chosen === it.stops) {
        return "Right. " + it.stops + ". Knowing the shape of the outage is how you work backwards " +
          "from a phone call to a box.";
      }
      return "That is another host's blast radius. Read the log again — how often clients talk " +
        "to it, and whether they hold on to the answer, decides how fast the failure shows up.";
    }
  });

  /* The 2.1 cross. The log deliberately never mentioned a port, so this is
     the student applying the ports objective rather than reading it off the
     panel. */
  qs.push({
    id: "port",
    ask: "What does it answer on?",
    hint: "This one is not on the panel and it is not meant to be. You identified the role from " +
      "behaviour; now bring 2.1 to it and say what that role listens on.",
    answer: it.port,
    choices: [it.port].concat(pick(D, "port", 3, rnd, true).map(function (c) { return c.port; })),
    why: function (chosen) {
      if (chosen === it.port) {
        return "Correct — " + it.port + ". That is objective 2.1 doing real work: a role you " +
          "worked out from behaviour, and the port you know goes with it.";
      }
      return "That belongs to a different service. Do not go looking on the panel for it — the " +
        "port is not there on purpose. Name the role first, then say what that role listens on.";
    }
  });

  /* The 2.5 / 2.6 cross: a host's position in the path is as much a part of
     its identity as what it serves. */
  qs.push({
    id: "where",
    ask: "Where does one of these belong in the path?",
    hint: "Follow the cabling on the model. What is on each side of it — the provider's " +
      "handoff, the switch, a row of identical servers, a field cabinet — is most of the answer.",
    answer: it.where,
    choices: [it.where].concat(pick(D, "where", 3, rnd).map(function (c) { return c.where; })),
    why: function (chosen) {
      if (chosen === it.where) {
        return "Yes — " + it.where + ". Where a host sits decides what it can protect, what it " +
          "can see and what takes it down with it, which is why 2.5 and 2.6 keep coming back to this.";
      }
      return "That is where a different host belongs. Trace the cables on the model rather than " +
        "reasoning about it in the abstract: what is immediately upstream of this box?";
    }
  });

  qs.push({
    id: "confused",
    ask: "Which of these does it get confused with?",
    hint: "Not the one that does something vaguely similar — the one that gets bought, racked " +
      "or rebooted by mistake because it looks the same from the front.",
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
      return "That one is separable without much thought. The pairing this question is after is " +
        "the one that costs somebody a maintenance window.";
    }
  });

  return qs;
}
