/* =====================================================================
   Field Service Center — objective 2.5

   "Compare and contrast common networking hardware devices."

   After three objectives whose evidence had to be invented, this one is a
   relief: every item in the pool is a box you can pick up, and almost every
   distinction the exam asks for is visible on it.

   The discriminators, in the order a technician actually uses them:

   1. HOW MANY PORTS, and are they all the same? Twenty-four identical ports
      is a different animal from four identical ones and a fifth set apart.
   2. IS THERE A POWER LEAD AT ALL? This is the cleanest tell in the pool and
      it is the one people never think of. A patch panel has no power because
      it does nothing; a ceiling access point has no power lead because its
      power arrives down the same cable as its data. Both look like "no
      power" until you ask WHY.
   3. WHAT IS ON THE OUTSIDE FACE. A threaded coaxial socket, a pair of
      fibre ferrules, a single port set apart from the others behind a
      divider — each of those says which side of the boundary the box lives
      on.
   4. IS THERE A CONSOLE PORT. Something you can configure has somewhere to
      configure it from.

   So the model draws all four and the panel carries what the box would tell
   you if you asked it. Nothing on the page names the device.
   ===================================================================== */

export const DEVICES = [
  {
    key: "unmanaged", name: "Unmanaged switch", form: "desktop",
    ports: 8, portKind: "identical copper ports", console: false, powered: "a mains lead",
    outside: "nothing set apart — every port is the same as every other",
    does: "Connects machines on one network to each other, sending each frame only to the " +
      "port the destination is actually on",
    decides: "By hardware address. It learns which address is on which port and stops " +
      "sending traffic anywhere it does not belong",
    use: "Adding ports where there is no need for anything to be configured",
    look: "A small box with a row of identical ports, a mains lead and nothing else — no " +
      "console port, no port set apart, nothing to log into.",
    lookalike: "managed",
    lookalikeWhy: "Identical from the front, and this is the pair that gets ordered wrong. " +
      "Look for somewhere to plug a console cable. Nothing on this one can be changed, " +
      "which is fine until somebody needs a VLAN on it."
  },
  {
    key: "managed", name: "Managed switch", form: "rack",
    ports: 24, portKind: "identical copper ports plus a pair of uplink cages",
    console: true, powered: "a mains lead",
    outside: "two cages at one end for a faster uplink",
    does: "The same as its simpler cousin, plus everything you configure: separating " +
      "traffic, controlling what a port may do, and reporting on itself",
    decides: "By hardware address, with the difference that you can tell it which ports " +
      "belong to which network and what to do with a port that misbehaves",
    use: "Anywhere traffic has to be kept apart, ports have to be controlled, or somebody " +
      "will need to see what a port is doing",
    look: "A rack-width box with a long row of identical ports, an uplink pair at one end, " +
      "a console port, and a mains lead.",
    lookalike: "unmanaged",
    lookalikeWhy: "The port rows look the same at a glance. The console port is the tell, " +
      "and it is the difference between a network you can segment and one you cannot."
  },
  {
    key: "router", name: "Router", form: "desktop",
    ports: 4, portKind: "identical copper ports, plus one set apart behind a divider",
    console: true, powered: "a mains lead",
    outside: "a single port on its own, separated from the rest",
    does: "Joins two different networks and passes traffic between them, deciding by " +
      "network address which way each packet goes",
    decides: "By network address. It looks at where a packet is ultimately going, not at " +
      "which machine sent it",
    use: "Anywhere one network has to reach another one, which in a small office means the " +
      "boundary between the desks and the outside",
    look: "A small box whose ports are not all equal: several together, and one on its own " +
      "behind a divider because it faces a different network.",
    lookalike: "firewall",
    lookalikeWhy: "Both sit at the boundary, both have an inside and an outside face, and " +
      "in a small office they are frequently the same box. One decides where traffic goes; " +
      "the other decides whether it is allowed to. Buying the first when you needed the " +
      "second is the mistake."
  },
  {
    key: "firewall", name: "Firewall", form: "rack",
    ports: 6, portKind: "identical copper ports, plus one set apart for the outside",
    console: true, powered: "a mains lead",
    outside: "one port set well apart from the others, and a pair of fibre cages beside it",
    does: "Inspects what crosses the boundary and permits or refuses it according to a " +
      "policy somebody wrote",
    decides: "By policy. Address and port and, on the newer ones, what the traffic actually " +
      "appears to be",
    use: "At the boundary, in the path, so that nothing crosses without being looked at",
    look: "A rack appliance with a port set apart for the outside, fibre cages beside it, a " +
      "console port and no drive bays.",
    lookalike: "router",
    lookalikeWhy: "Same position in the rack and the same two faces. Ask what it does with " +
      "traffic it has no rule for: one forwards it, the other drops it. That single " +
      "difference is what somebody is paying for."
  },
  {
    key: "ap", name: "Wireless access point", form: "disc",
    ports: 1, portKind: "one copper port", console: false, powered: "nothing — power arrives down the network cable",
    outside: "nothing on the face at all; the radios are inside the housing",
    does: "Puts a wired network on the air, so devices with no cable can join it",
    decides: "Nothing about routing. It is a bridge between a radio and a wire and it hands " +
      "everything on",
    use: "Wherever people work without a cable, mounted where the coverage needs to be " +
      "rather than where it is convenient",
    look: "A flat disc for a ceiling, with one network port and no power lead of its own — " +
      "its power comes down the same cable as its data.",
    lookalike: "extender",
    lookalikeWhy: "Both produce a wireless network and people use the words " +
      "interchangeably. This one is fed by a cable and adds capacity; the other is fed by " +
      "the air it is repeating and halves it. Solving a coverage complaint with the wrong " +
      "one of these makes the complaint worse."
  },
  {
    key: "patch", name: "Patch panel", form: "rack",
    ports: 24, portKind: "identical copper ports, with punch-downs on the back",
    console: false, powered: "nothing at all — it is not an electrical device",
    outside: "the back, where the building's own cabling is punched down permanently",
    does: "Terminates the fixed cabling of the building so that the fragile end of every " +
      "run is a short patch lead you can replace, rather than a wall",
    decides: "Nothing. It is a junction, and there is no electronics in it whatsoever",
    use: "Between the building's permanent cabling and the equipment, so that moves and " +
      "changes are a patch lead rather than a cable puller",
    look: "A rack-width strip of identical ports with the building's cabling punched down " +
      "behind it — and no power lead, because there is nothing in it to power.",
    lookalike: "unmanaged",
    lookalikeWhy: "A row of identical ports in a rack, which is what people see. The " +
      "cleanest way to tell them apart is to look for a power lead: one of these has none, " +
      "because it does nothing to the signal at all."
  },
  {
    key: "hub", name: "Hub", form: "desktop",
    ports: 4, portKind: "identical copper ports", console: false, powered: "a mains lead",
    outside: "nothing set apart",
    does: "Repeats everything it receives out of every other port, so every device on it " +
      "hears everything and they take turns to talk",
    decides: "Nothing. It does not learn, does not look, and cannot keep two conversations " +
      "apart",
    use: "Nothing, now. Worth recognising because one still occasionally turns up, and " +
      "because it is the reason a switch is described the way it is",
    look: "A small box with a few identical ports and a lamp that flickers when anything " +
      "anywhere is talking, because everything is one conversation.",
    lookalike: "unmanaged",
    lookalikeWhy: "The same shape, the same ports, and one of them is why the other was " +
      "invented. The difference is invisible from outside and total in practice: one sends " +
      "each frame where it belongs and the other shouts everything at everybody."
  },
  {
    key: "modem", name: "Cable modem", form: "desktop",
    ports: 1, portKind: "one copper port", console: false, powered: "a mains lead",
    outside: "a threaded coaxial socket",
    does: "Converts between the signalling the provider uses on their coaxial network and " +
      "the Ethernet the equipment inside the building speaks",
    decides: "Nothing about traffic. It is a translator between two ways of carrying the " +
      "same bits",
    use: "At the point the provider's service enters the building, where their medium stops " +
      "and yours starts",
    look: "A small box with one network port and, on the other side, a threaded socket for " +
      "a coaxial lead with a solid centre conductor.",
    lookalike: "ont",
    lookalikeWhy: "Both sit at the point the service enters the building and both hand you " +
      "one Ethernet port. Look at what arrives: a threaded coaxial socket is one provider's " +
      "medium and a pair of glass ferrules is another's, and the box for one will not do " +
      "the other's job."
  },
  {
    key: "ont", name: "Optical network terminal", form: "wall",
    ports: 1, portKind: "one copper port", console: false, powered: "a mains lead, with a battery beside it",
    outside: "a fibre connector behind a hinged cover",
    does: "Ends the provider's fibre and converts the light on it into the Ethernet the " +
      "building uses",
    decides: "Nothing about traffic — but it is the provider's equipment and the boundary " +
      "of what you may touch",
    use: "Where a fibre service enters, usually on a wall near where the fibre comes in, " +
      "with a battery so that a telephone service on it survives a power cut",
    look: "A wall-mounted box with a hinged cover over a fibre connector, one network port, " +
      "and a battery pack beside it.",
    lookalike: "modem",
    lookalikeWhy: "Same job at the same point in the building, different medium arriving. " +
      "Open the cover: glass and a dust cap on one, a threaded coaxial nut on the other."
  },
  {
    key: "nic", name: "Network interface card", form: "card",
    ports: 1, portKind: "one copper port on a bracket", console: false, powered: "the slot it sits in",
    outside: "nothing — it lives inside a machine",
    does: "Gives one machine its connection to the network, and carries the hardware " +
      "address everything else on the segment knows it by",
    decides: "Nothing beyond its own traffic. It is one machine's door onto the network",
    use: "Adding or replacing a machine's connection, or giving one machine a second " +
      "connection onto a different network",
    look: "A card with an edge connector along the bottom and a metal bracket at one end " +
      "carrying the port — it is powered by the slot, not by a lead.",
    lookalike: "converter",
    lookalikeWhy: "Both are small, both have exactly one network port, and both end up in " +
      "the same drawer. One is powered by a slot inside a machine; the other sits in the " +
      "open with its own supply and no machine anywhere near it."
  },
  {
    key: "poeinj", name: "Power over Ethernet injector", form: "inline",
    ports: 2, portKind: "two copper ports, one in and one out", console: false,
    powered: "a mains lead of its own",
    outside: "nothing — it sits in the middle of a run",
    does: "Adds power to a network cable so that the device at the far end needs no supply " +
      "of its own",
    decides: "Nothing. It passes the data straight through and puts voltage on the pairs " +
      "that were not carrying any",
    use: "Feeding one device that needs power down its cable, where the switch it is " +
      "plugged into cannot supply it",
    look: "A small block in the middle of a run with a port in, a port out, and its own " +
      "mains lead — three leads on a box with no front panel.",
    lookalike: "converter",
    lookalikeWhy: "Both are small inline blocks with a lead at each end and a supply. One " +
      "changes what the cable carries in addition to data; the other changes what the cable " +
      "IS. Fitting the wrong one leaves you with a link that is dark or a device that is dead."
  },
  {
    key: "converter", name: "Media converter", form: "inline",
    ports: 1, portKind: "one copper port and one fibre pair", console: false,
    powered: "a mains lead of its own",
    outside: "a pair of fibre ferrules on the opposite face to the copper",
    does: "Joins a copper segment to a fibre one, so a run can go further than copper " +
      "manages or cross somewhere copper must not",
    decides: "Nothing. It changes the medium and leaves the traffic alone",
    use: "Extending a link past the distance copper allows, or crossing between buildings " +
      "where a copper run would carry a difference in earth potential",
    look: "A small block with copper on one face and two glass ferrules on the other, and " +
      "its own mains lead.",
    lookalike: "poeinj",
    lookalikeWhy: "Two small blocks with a supply and a lead at each end. Look at the far " +
      "face: two ferrules means the medium changes here, and two copper ports means it does not."
  },
  {
    key: "extender", name: "Wireless repeater or extender", form: "plug",
    ports: 1, portKind: "one copper port, sometimes",
    console: false, powered: "the socket it plugs into",
    outside: "antennas, and a plug moulded into the body",
    does: "Hears an existing wireless network and repeats it, so that the coverage reaches " +
      "further than the original alone would",
    decides: "Nothing. It relays, which means everything it carries crosses the air twice",
    use: "Reaching one awkward corner where running a cable is genuinely impossible, and " +
      "accepting the cost of doing so",
    look: "A unit that plugs straight into a wall socket, with antennas and no cable to " +
      "anything — the giveaway is that nothing wired reaches it at all.",
    lookalike: "ap",
    lookalikeWhy: "Both make wireless appear somewhere it was not. Look for a cable: one " +
      "is fed by the network and adds capacity; the other is fed by the air and halves the " +
      "throughput of everything that goes through it, because it transmits everything twice."
  },
  {
    key: "poeswitch", name: "Power over Ethernet switch", form: "rack",
    ports: 24, portKind: "identical copper ports, all able to supply power",
    console: true, powered: "a mains lead, and a noticeably large one",
    outside: "an uplink pair, and a power budget printed on the case",
    does: "Everything a managed switch does, and feeds power down the cables to the devices " +
      "that need it",
    decides: "By hardware address, as any switch does — plus how much of a finite power " +
      "budget each port may draw",
    use: "Where a number of devices are fed down their network cables and each of them has " +
      "to come from somewhere",
    look: "A rack switch that looks like any other until you notice the size of its power " +
      "supply and the total wattage printed on the case.",
    lookalike: "managed",
    lookalikeWhy: "Identical port rows and identical console ports. The difference is a " +
      "number — a budget in watts — and it runs out. Ports that stop feeding devices when " +
      "the last few are plugged in is that budget, not a fault."
  },
  {
    /* The objective lists two provider-edge boxes and the build only had
       one. A student who has only ever seen the coaxial one answers "cable
       modem" to anything at the demarc. */
    key: "dslmodem", name: "DSL modem", form: "desktop",
    ports: 1, portKind: "one copper port", console: false, powered: "a mains lead",
    outside: "a small square telephone socket",
    does: "Converts between the signalling the provider runs over the telephone line and " +
      "the Ethernet the equipment inside the building speaks",
    decides: "Nothing about traffic. It is a translator between two ways of carrying the " +
      "same bits",
    use: "Where the service arrives over the telephone pair rather than over coaxial or fibre",
    look: "A small box with one network port and, beside it, a socket too small for a " +
      "network lead \u2014 six or four contacts rather than eight.",
    lookalike: "modem",
    lookalikeWhy: "Both are provider-edge boxes handing you a single Ethernet port, and " +
      "people call both of them 'the modem'. The socket on the back settles it: a threaded " +
      "coaxial connector with a solid centre pin, or a small square telephone socket. " +
      "Ordering the wrong one means a second visit."
  },
  {
    key: "l3switch", name: "Layer 3 switch", form: "rack",
    ports: 24, portKind: "identical copper ports", console: true,
    powered: "a mains lead",
    outside: "a console port, and a small screen or button panel at one end",
    does: "Switches within each network the way any switch does, and also routes between " +
      "the networks configured on it, without a separate router in the path",
    decides: "By hardware address inside a network, and by network address between them \u2014 " +
      "both, in the same box",
    use: "Where several networks meet inside one building and sending all of that traffic " +
      "out to a router and back would be the slow way round",
    look: "A rack box that looks exactly like a managed switch \u2014 same port count, same " +
      "console port. What tells you is what it has been configured to do, not what is on the front.",
    lookalike: "managed",
    lookalikeWhy: "There is no outside difference worth the name, and that is the lesson: " +
      "this is the one pair in the pool you cannot separate by looking. You separate them by " +
      "asking what the box is doing \u2014 whether traffic between two networks passes through " +
      "it or has to leave and come back."
  },
  {
    /* SDN is on the objective and is a concept rather than a box, which sits
       awkwardly in a subject built on things you can pick up. The controller
       IS a box, so the item is the controller and the questions are about
       what moves off the other boxes when one arrives. */
    key: "sdncontroller", name: "Software-defined networking controller", form: "rack",
    ports: 2, portKind: "two copper ports for management, and nothing else",
    console: true, powered: "two mains leads, one either side",
    outside: "a console port, two power inlets, and no user-facing ports at all",
    does: "Holds the configuration for every switch and router under it and pushes it out, " +
      "so the decisions live in one place instead of in each box",
    decides: "Nothing about individual frames. It decides what all the other boxes will " +
      "decide, and they carry it out",
    use: "Where changing a rule everywhere means changing it on one machine rather than " +
      "logging into forty",
    look: "A rack box with almost nothing on the front \u2014 two management ports, a console " +
      "port and two power inlets. No traffic passes through it at all.",
    lookalike: "firewall",
    lookalikeWhy: "Both are rack boxes with few ports and dual power, and neither looks like " +
      "a switch. The difference is whether traffic goes THROUGH it: a firewall is in the " +
      "path and drops what it does not like, and this one is beside the path telling the " +
      "other boxes what to do."
  },
];

const BY = {};
DEVICES.forEach(function (d) { BY[d.key] = d; });
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
  rnd(DEVICES).forEach(take);
  return out.slice(0, n);
}

/* How each form is held in place. Derived rather than written out fourteen
   times, because it follows from the shape and nothing else — and because a
   second copy of a fact is a fact that goes stale. */
const FIXING = {
  desktop: "four rubber feet",
  rack:    "rack ears at both ends, with captive screws",
  disc:    "a bracket that twists onto a plate",
  wall:    "keyhole slots for two screws",
  card:    "a metal bracket with one screw tab",
  inline:  "nothing — it hangs on its own cables",
  plug:    "nothing — the pins hold it"
};

/* The label on the box. What a device would tell you about itself if you
   turned it over and read the plate — counts and fittings, never a verdict
   and never its own name.

   AND NEVER WHERE ITS POWER COMES FROM. That was on this plate on the first
   cut, sitting directly above a question that asks where its power comes
   from, which is not a drill, it is a reading test. Power is evidence you
   look at on the bench: a lead, a moulded plug, a card edge, a collar round
   a network cable, or an empty socket. It is not a line in a panel. */
export function plateRows(D) {
  var it = D.item;
  return [
    { k: "Ports on the face", v: it.ports + " — " + it.portKind },
    { k: "Anything set apart", v: it.outside },
    { k: "Somewhere to configure it", v: it.console ? "a console port" : "none fitted" },
    { k: "How it is fixed in place", v: FIXING[it.form] },
    { k: "Indicators", v: it.console
        ? "one per port, plus a status lamp"
        : it.powered.indexOf("nothing at all") === 0 ? "none" : "one per port" }
  ];
}

export function deviceQuestions(D, rnd) {
  var it = D.item;
  var qs = [];

  qs.push({
    id: "which",
    ask: "Which device is this?",
    hint: "Count the ports and ask whether they are all equal. Then look for a power lead " +
      "and for somewhere to plug a console cable. Those three between them separate almost " +
      "the whole pool.",
    answer: it.name,
    choices: [it.name].concat(pick(D, "name", 3, rnd).map(function (c) { return c.name; })),
    why: function (chosen) {
      if (chosen === it.name) return it.look + " " + it.lookalikeWhy;
      var o = DEVICES.filter(function (c) { return c.name === chosen; })[0];
      return o ? "That is a real device and it is not this one. " + o.look +
        " Go back and count what is actually on the bench."
        : "That is not what is in front of you.";
    }
  });

  qs.push({
    id: "decides",
    ask: "What does it decide about the traffic passing through it?",
    hint: "Some of these look at a hardware address, one looks at a network address, one " +
      "applies a policy, and several decide nothing whatsoever — which is not a criticism, " +
      "it is what they are for.",
    answer: it.decides,
    choices: [it.decides].concat(pick(D, "decides", 3, rnd).map(function (c) { return c.decides; })),
    why: function (chosen) {
      if (chosen === it.decides) {
        return "Yes. " + it.decides + ". What a device decides is the whole of what " +
          "separates it from the box beside it that looks the same.";
      }
      return "That is what a different device decides. A box with no console port and no " +
        "power lead is not deciding anything at all, and that is worth reading off the bench.";
    }
  });

  qs.push({
    id: "power",
    ask: "Where does its power come from?",
    hint: "Three of these have no mains lead and for three different reasons. Working out " +
      "which reason applies here identifies the device on its own.",
    answer: it.powered,
    choices: [it.powered].concat(pick(D, "powered", 3, rnd).map(function (c) { return c.powered; })),
    why: function (chosen) {
      if (chosen === it.powered) {
        return "Correct — " + it.powered + ". This is the cleanest tell in the whole pool " +
          "and the one nobody thinks to use.";
      }
      return "Not how this one is fed. Look at the bench: a lead going to a socket, a lead " +
        "going only to the network, a slot inside a machine, or nothing at all.";
    }
  });

  qs.push({
    id: "use",
    ask: "What would you put one in for?",
    hint: "Not what it does mechanically — the job somebody was trying to get done when " +
      "they bought it.",
    answer: it.use,
    choices: [it.use].concat(pick(D, "use", 3, rnd).map(function (c) { return c.use; })),
    why: function (chosen) {
      if (chosen === it.use) return "Right. " + it.use + ".";
      return "That is why a different device gets fitted. Work back from what this one " +
        "decides: a box that decides nothing is there to carry, convert or terminate " +
        "something, and which of those it is shows on its faces.";
    }
  });

  qs.push({
    id: "confused",
    ask: "Which device does it get confused with?",
    hint: "Not the one with a similar name — the one that gets ordered, racked or fitted " +
      "instead of it and does not do the job.",
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
      return "That one is separable at a glance. The pairing this question wants is the one " +
        "that costs somebody a delivery and a second visit.";
    }
  });

  return qs;
}
