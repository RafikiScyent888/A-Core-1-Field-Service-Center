/* =====================================================================
   Field Service Center — objective 2.7

   "Compare and contrast internet connection types, network types, and their
   characteristics."

   ONE OBJECTIVE, TWO HALVES, AND THEY ARE NOT THE SAME KIND OF THING. Half
   of this is what the provider brought to the building — coaxial, a
   telephone pair, glass, a dish, an antenna. The other half is how far a
   network reaches and who owns the path between its ends. A drill that
   flattened those into one question set would teach neither.

   So every item carries a `kind`, and the second question changes with it:

     - a SERVICE is identified by what physically arrives and what is at the
       other end of it. There is something on the outside wall, there is
       something up the road, and between them there is usually somebody
       else's premises tapped into the same run.
     - a SCOPE is identified by how far it reaches, which you read off the
       plan by looking at what fits inside the boundary. A desk fits inside
       one of these. A town fits inside another.

   WHAT LIMITS IT is the question that matters on both halves and it is the
   one candidates get wrong. Every one of these has a ceiling, and the
   ceiling is never "the speed on the advertisement": it is a shared segment
   filling up at seven in the evening, a length of copper to an exchange, a
   line of sight through a tree that has grown, or thirty-six thousand
   kilometres of vacuum that light takes a quarter of a second to cross.

   The panel beside the model carries what a technician would MEASURE, never
   what the service is called and never how far it goes. Those are the
   answers.
   ===================================================================== */

export const LINKS = [
  /* ---- what the provider brought to the building ------------------- */
  {
    key: "cable", name: "Cable broadband", kind: "service",
    arrives: "A threaded coaxial socket on an outside wall, with a solid-centred lead screwed to it",
    goesTo: "A cabinet at the end of the street, shared with the houses on either side",
    shared: "street",
    limit: "The segment it shares with the neighbours. The line to the cabinet is yours; " +
      "everything past it is not, so the ceiling moves with how many people are using it",
    use: "A small site that needs a lot of download and can live with the upload being a " +
      "fraction of it, where the street already has the cable in it",
    look: "Coaxial cable at the wall, and a run that joins the neighbours' runs before it gets " +
      "anywhere.",
    lookalike: "fibre",
    lookalikeWhy: "Both are sold as fast and both arrive at a box on a wall. One shares a segment " +
      "with the street and one does not, and that difference shows up at seven in the evening " +
      "rather than on the day of the install."
  },
  {
    key: "dsl", name: "DSL over the telephone line", kind: "service",
    arrives: "A telephone pair, into a small filtered socket with nothing else on the wall",
    goesTo: "The exchange, over a pair of copper wires that may be several kilometres long",
    shared: "none",
    limit: "The length of copper between the building and the exchange. Every extra hundred " +
      "metres costs speed, and nothing at either end can buy it back",
    use: "Premises where nothing better has been laid, or a second line kept as a fallback that " +
      "does not share anything with the first",
    look: "The flattest thing on the wall — a small filtered socket and a pair of wires. If you " +
      "are looking for a box and there is not one, that is the observation.",
    lookalike: "dialup",
    lookalikeWhy: "The same pair of copper wires into the same socket, and people describe both " +
      "as “the phone line”. One rides above the voice band and leaves the telephone usable; " +
      "the other occupies the line entirely and you cannot ring out while it is up."
  },
  {
    key: "fibre", name: "Fibre to the premises", kind: "service",
    arrives: "A fibre into a sealed box with a hinged cover, and one round ferrule inside it",
    goesTo: "The provider's equipment, with nothing electrical in the path the whole way",
    shared: "provider",
    limit: "Whatever the provider sold you, and after that the equipment inside the building. " +
      "The medium itself is not the ceiling and distance is not the ceiling",
    use: "Anywhere the upload matters as much as the download, or the site cannot afford the " +
      "evening to be slower than the morning",
    look: "A sealed box with a hinged cover and glass behind it. No threads, no copper pair, " +
      "nothing to unscrew.",
    lookalike: "cable",
    lookalikeWhy: "Both land in a box on a wall and both are sold on the same numbers. Open the " +
      "cover: a round ferrule with a dust cap is one thing and a threaded nut is another, and " +
      "what the two do at peak time is different."
  },
  {
    key: "fixedwireless", name: "Fixed wireless access", kind: "service",
    arrives: "A single cable coming down from a dish bolted to the gable end",
    goesTo: "A mast the dish is aimed at, several kilometres away and in plain view of it",
    shared: "air",
    limit: "Line of sight to the mast, and the weather and vegetation in between. A tree that " +
      "has grown two feet since the survey is a fault call",
    use: "Rural premises and sites the cable never reached, where there is a mast in view and " +
      "nothing in the way of it",
    look: "Nothing comes into the building from the street at all. There is a dish on the gable " +
      "with one cable coming down from it.",
    lookalike: "satellite",
    lookalikeWhy: "Two dishes on two gables, and from the ground they are the same object. One is " +
      "aimed at a mast on a hill you can see; the other is aimed at the sky. Follow where it " +
      "points and the answer is settled."
  },
  {
    key: "satellite", name: "Satellite", kind: "service",
    arrives: "A single cable coming down from a dish aimed at the sky rather than at anything on " +
      "the ground",
    goesTo: "A spacecraft, and then a ground station somewhere else entirely",
    shared: "air",
    limit: "The time light takes to make the trip. Throughput can be respectable and the delay " +
      "cannot be engineered away, so anything conversational suffers no matter what you buy",
    use: "Premises with no other option at all — a site with no mast in view, no cable in the " +
      "ground and no copper worth using",
    look: "A dish pointed at empty sky at a fixed angle, with nothing on the ground anywhere " +
      "along that line.",
    lookalike: "fixedwireless",
    lookalikeWhy: "Both are a dish and one cable. What separates them is the delay: one adds a " +
      "millisecond or two and the other adds most of a second, and no amount of bandwidth on the " +
      "second one makes a telephone call work properly."
  },
  {
    key: "cellular", name: "Cellular data", kind: "service",
    arrives: "Nothing on the wall at all. There is an antenna on a router, or a card in a device",
    goesTo: "The nearest mast, which is serving everybody else in range at the same time",
    shared: "air",
    limit: "How much of the mast's spectrum is left once everybody in range has had some. It is " +
      "excellent at eight in the morning on a quiet street and unusable at a festival",
    use: "Somewhere with no fixed service, a site that has to work before the line is installed, " +
      "or a backup path that does not follow the same route as the main one",
    look: "No socket, no dish and no cable to the outside. An antenna, and that is the whole of " +
      "the installation.",
    lookalike: "fixedwireless",
    lookalikeWhy: "Both are radio and both have no cable to the street. One is aimed at a " +
      "particular mast and stays aimed; the other takes whatever mast is nearest and shares it " +
      "with everybody walking past."
  },
  {
    key: "leased", name: "Leased line", kind: "service",
    arrives: "A fibre into the provider's own equipment, presented as one port with a contract " +
      "attached to it",
    goesTo: "The provider's network, over a path that carries nobody else's traffic",
    shared: "none",
    limit: "The contract. It is the same speed in both directions at three in the afternoon and " +
      "at nine in the evening, and what you are buying is that sentence being true",
    use: "A site where the connection failing has a cost per hour, and where somebody is prepared " +
      "to pay for a guarantee with penalties in it",
    look: "The same glass as any fibre service, into equipment the provider owns and will not " +
      "let you touch, with a service agreement in the folder beside it.",
    lookalike: "fibre",
    lookalikeWhy: "Identical media and often the identical box on the wall. The difference is not " +
      "physical at all: one is a share of something and the other is a guarantee with penalties " +
      "attached, and that is what the price difference buys."
  },
  {
    key: "dialup", name: "Dial-up", kind: "service",
    arrives: "A telephone pair into an ordinary telephone socket, with a modem plugged into it",
    goesTo: "Another modem at the far end, over a call placed for the purpose",
    shared: "none",
    limit: "The voice channel it is squeezed into. It is a telephone call carrying data, so it " +
      "cannot be faster than a telephone call, and it occupies the line while it is up",
    use: "Nothing, now, except as a fallback path on equipment old enough to need one — which " +
      "still turns up in plant rooms and on out-of-band management",
    look: "An ordinary telephone socket, an ordinary telephone lead, and a modem that makes a " +
      "call before anything works.",
    lookalike: "dsl",
    lookalikeWhy: "Same socket, same pair, same wall. Pick up the telephone: if there is a dial " +
      "tone while the data is flowing, it is the one that rides above the voice band. If the " +
      "line is dead, it is a call."
  },

  /* ---- how far a network reaches, and whose path it crosses -------- */
  {
    key: "pan", name: "Personal area network", kind: "scope",
    reach: "A few metres — one person and what they are carrying",
    spans: "One person's own devices: a handset, a headset, a watch, a keyboard",
    owns: "The person. There is no infrastructure and nothing is administered",
    limit: "Range, deliberately. It is short because a longer one would be somebody else's " +
      "problem, and the pairing is between two devices rather than to a network",
    use: "Joining one person's devices to each other without involving anything that has an " +
      "address on the building's network",
    look: "A boundary you could put your arms round, with a desk and one person inside it and " +
      "nothing else.",
    lookalike: "wlan",
    lookalikeWhy: "Both are wireless and people call both of them “the wireless”. One reaches " +
      "across a desk and joins devices to each other; the other reaches across a building and " +
      "joins devices to a network."
  },
  {
    key: "lan", name: "Local area network", kind: "scope",
    reach: "One building, or one floor of one",
    spans: "Everything on the premises: desks, printers, servers, the equipment in the cupboard",
    owns: "You do. Every cable, every switch and every metre of the path between two machines on it",
    limit: "The hundred-metre run. Everything about how a local network is laid out comes back to " +
      "that number, which is why there is a cupboard in the middle rather than one at the end",
    use: "The default for anything inside one set of walls, where you own the cabling and the " +
      "equipment and nobody else's traffic is on it",
    look: "A boundary that fits one building, with rooms and desks inside it and the street " +
      "outside.",
    lookalike: "wlan",
    lookalikeWhy: "The same building, the same address space and frequently the same equipment " +
      "cupboard, so the words get used for each other. One is what is in the walls; the other is " +
      "what is in the air, and only one of them has a hundred-metre limit."
  },
  {
    key: "wlan", name: "Wireless local area network", kind: "scope",
    reach: "One building, as far as the radios cover it",
    spans: "Everything joining without a cable, over the same premises as the wired network",
    owns: "You do — the access points and the cabling that feeds them, though not the air",
    limit: "The air, which is shared with everybody in range including the neighbours. Range is " +
      "not the same as coverage and coverage is not the same as capacity",
    use: "Anywhere people move about or bring their own equipment, laid over the wired network " +
      "rather than instead of it",
    look: "The same building as the wired network, with coverage drawn over it that does not stop " +
      "neatly at the walls.",
    lookalike: "lan",
    lookalikeWhy: "Same premises, same addresses, same equipment cupboard. One is a hundred metres " +
      "of cable you own; the other is a shared medium you do not, and everything that goes wrong " +
      "with the second one goes wrong because of that."
  },
  {
    key: "can", name: "Campus area network", kind: "scope",
    reach: "Several buildings on one site, a few hundred metres apart",
    spans: "A group of buildings the same organisation occupies, joined by its own cabling",
    owns: "You do, including the ducts between the buildings — which is what makes it a campus " +
      "rather than something else",
    limit: "The distance between buildings, which is past what copper manages, so the links " +
      "between them are fibre and the equipment at each end has to match",
    use: "A hospital, a school site, a business park unit with three buildings — anywhere one " +
      "organisation owns the ground between its own front doors",
    look: "A boundary round several buildings and the ground between them, with the public road " +
      "outside it.",
    lookalike: "man",
    lookalikeWhy: "Both cover more than one building and both look like a map with lines on it. " +
      "The question is not size, it is whether you own the ground the cable crosses: dig up your " +
      "own car park and you need a spade, dig up the road and you need somebody else entirely."
  },
  {
    key: "man", name: "Metropolitan area network", kind: "scope",
    reach: "A town or a city — sites several kilometres apart",
    spans: "An organisation's sites across one urban area, joined over paths that cross public land",
    owns: "Somebody else owns the ground in between, so the links are leased or provided rather " +
      "than laid",
    limit: "What the provider will sell across the city, and what happens when a contractor puts " +
      "a digger through a duct you do not own and cannot get to",
    use: "A council, a chain of branches, a hospital trust across one city — several sites too " +
      "far apart to cable and near enough that somebody sells a service between them",
    look: "A boundary round a town: streets, a lot of buildings, and the sites that belong to one " +
      "organisation scattered among buildings that do not.",
    lookalike: "wan",
    lookalikeWhy: "Both cross ground you do not own and both are drawn as sites with lines " +
      "between them. One fits inside one urban area; the other does not, and the difference is " +
      "which providers can sell you the path."
  },
  {
    key: "wan", name: "Wide area network", kind: "scope",
    reach: "Between towns, countries or continents — as far as it needs to go",
    spans: "Sites far enough apart that no single organisation could own the path between them",
    owns: "Somebody else, always. What you own is the equipment at each end and the agreement in " +
      "the middle",
    limit: "Distance itself, which shows up as delay you cannot remove, plus the fact that " +
      "everything between the two ends is out of your hands when it breaks",
    use: "Joining sites in different places, or joining any site to anything on the far side of " +
      "the internet",
    look: "A boundary too big for one town, with sites in different places and a great deal of " +
      "ground between them that belongs to nobody in the picture.",
    lookalike: "man",
    lookalikeWhy: "Neither one crosses ground you own, both are leased, and the equipment at the " +
      "ends is often identical. The distinction is whether the whole thing fits inside one city."
  },
  {
    key: "san", name: "Storage area network", kind: "scope",
    reach: "A room, usually one rack of it",
    spans: "Servers and the storage they use, joined by a network that carries nothing else",
    owns: "You do, and deliberately keep it separate from the network everything else is on",
    limit: "It is a network for one purpose. Put anything else on it and you have given away the " +
      "reason it exists, which is that a server's disks must not be waiting behind somebody's " +
      "email",
    use: "Anywhere servers need storage that behaves like a local disk rather than like a file " +
      "share, and where that traffic must not compete with anything",
    look: "A boundary that fits inside one room and holds servers and drive shelves and nothing " +
      "else — no desks, no people, no printers.",
    lookalike: "lan",
    lookalikeWhy: "Both are cables in a building and both use equipment that looks the same in a " +
      "rack. One carries everything the site does; the other carries one kind of traffic on " +
      "purpose, and mixing them is how a storage array ends up waiting behind a backup job."
  }
];

const BY = {};
LINKS.forEach(function (l) { BY[l.key] = l; });
export { BY as BY_KEY };

/* Distractors of the same kind where the question only makes sense within a
   kind, and from the whole pool where it does not. */
function pick(D, field, n, rnd, sameKind) {
  var it = D.item;
  var want = String(it[field]);
  var look = BY[it.lookalike];
  var pool = sameKind
    ? LINKS.filter(function (l) { return l.kind === it.kind; })
    : LINKS;
  var out = [], seen = {};
  seen[want] = 1;
  function take(c) {
    if (c.key === it.key || pool.indexOf(c) === -1) return;
    var v = String(c[field]);
    if (out.length >= n || seen[v] || v === "undefined") return;
    seen[v] = 1; out.push(c);
  }
  if (look) take(look);
  rnd(pool).forEach(take);
  return out.slice(0, n);
}

/* ---------------------------------------------------------------------
   The instrument.

   What a technician would measure, on the day, standing at the site. Never
   what the service is called, never what physically arrives and never how
   far it goes — those three are the answers to the first two questions.

   The readings are characteristics, which is the word the objective itself
   uses. Round-trip time separates a satellite from everything else without
   anybody saying the word. Two figures an hour apart separate a shared
   segment from a guaranteed one. Whether the two directions match separates
   a consumer service from a leased one.
   --------------------------------------------------------------------- */
export function readingRows(D) {
  var it = D.item;
  if (it.kind === "service") {
    var lat = { cable: "14 ms", dsl: "22 ms", fibre: "6 ms", fixedwireless: "18 ms",
      satellite: "620 ms", cellular: "38 ms", leased: "4 ms", dialup: "180 ms" }[it.key];
    var peak = { cable: "falls to about a third of it", dsl: "is much the same",
      fibre: "is much the same", fixedwireless: "falls by half",
      satellite: "is much the same, and the delay does not change either",
      cellular: "varies hour to hour and street to street", leased: "is identical, guaranteed",
      dialup: "is much the same, which is not a compliment" }[it.key];
    var sym = { cable: "download many times the upload", dsl: "download several times the upload",
      fibre: "download a few times the upload, or the same both ways",
      fixedwireless: "download several times the upload",
      satellite: "download many times the upload", cellular: "download several times the upload",
      leased: "identical in both directions", dialup: "identical in both directions, and tiny" }[it.key];
    var others = { street: "a number of other premises are on the same segment",
      provider: "one or two, and they join at the provider's equipment rather than in the street",
      none: "nobody, anywhere on the path",
      air: "nobody on the path — there is no path to be on. Whatever is at the far end is " +
        "serving other people at the same time" }[it.shared];
    return [
      { k: "Round trip to the first hop outside", v: lat },
      { k: "The same test at nine in the evening", v: "Throughput " + peak },
      { k: "The two directions", v: sym },
      { k: "Who else is on the path", v: others },
      { k: "What the provider's paperwork promises", v: it.shared === "none" && it.key === "leased"
          ? "A figure, in writing, with money attached to it if they miss it"
          : "A figure described as “up to”, with no penalty attached" }
    ];
  }
  var hops = { pan: "1 — the two devices are talking to each other",
    lan: "1 or 2 — a switch, sometimes two", wlan: "2 — the access point, then a switch",
    can: "3 or 4 — a switch in this building, then one in another", man: "5 to 8, and some of them " +
      "belong to somebody else", wan: "12 or more, most of them nobody you can telephone",
    san: "1 — a switch that carries nothing else" }[it.key];
  var rtt = { pan: "under a millisecond", lan: "under a millisecond", wlan: "2 to 4 ms",
    can: "1 to 2 ms", man: "3 to 8 ms", wan: "30 ms and up, more the further you go",
    san: "well under a millisecond, and it has to be" }[it.key];
  var admin = { pan: "Nobody. There is no equipment to administer",
    lan: "You, entirely", wlan: "You, entirely", can: "You, including the ducts between buildings",
    man: "You at each site, somebody else in between",
    wan: "You at each end and nobody you have met in the middle",
    san: "You, and it is kept separate from everything else on purpose" }[it.key];
  return [
    { k: "Hops from one end to the other", v: hops },
    { k: "Round trip end to end", v: rtt },
    { k: "Who administers it", v: admin },
    { k: "What is at each end", v: it.spans },
    { k: "What happens when the middle breaks", v: it.owns.indexOf("Somebody else") === 0 ||
        it.owns.indexOf("somebody else") !== -1
        ? "You telephone somebody and wait"
        : "You go and look at it yourself" }
  ];
}

export function linkQuestions(D, rnd) {
  var it = D.item;
  var qs = [];
  var isService = it.kind === "service";

  qs.push({
    id: "which",
    ask: "Which is this?",
    hint: isService
      ? "Start at the wall. Something physical arrives at every building, or conspicuously does " +
        "not — and then follow it to whatever is at the other end of it."
      : "Look at what fits inside the boundary on the plan, and then at who owns the ground it " +
        "crosses. Those two between them separate the whole of this half.",
    answer: it.name,
    choices: [it.name].concat(pick(D, "name", 3, rnd, true).map(function (c) { return c.name; })),
    why: function (chosen) {
      if (chosen === it.name) return it.look + " " + it.lookalikeWhy;
      var o = LINKS.filter(function (c) { return c.name === chosen; })[0];
      return o ? "That is a real one and it is not this one. " + o.look
        : "That is not what is in front of you.";
    }
  });

  if (isService) {
    qs.push({
      id: "arrives",
      ask: "What physically arrives at the building?",
      hint: "Three of these arrive as copper, two as glass and two as nothing at all — and one " +
        "of those two has a dish and the other does not. Look at the wall before you look at " +
        "anything else.",
      answer: it.arrives,
      choices: [it.arrives].concat(pick(D, "arrives", 3, rnd, true)
        .map(function (c) { return c.arrives; })),
      why: function (chosen) {
        if (chosen === it.arrives) {
          return "Correct. " + it.arrives + ". What arrives at the wall is the first thing that " +
            "narrows this down and it takes four seconds to establish.";
        }
        return "That arrives at a different kind of service. Go back to the outside wall on the " +
          "plan: threads, a pair of wires, a hinged cover with glass behind it, a dish, or " +
          "nothing whatsoever.";
      }
    });
  } else {
    qs.push({
      id: "reach",
      ask: "How far does it reach?",
      hint: "Do not guess from the name. Look at what has been drawn inside the boundary and " +
        "work out what would fit — a desk, a building, several of them, or a town.",
      answer: it.reach,
      choices: [it.reach].concat(pick(D, "reach", 3, rnd, true).map(function (c) { return c.reach; })),
      why: function (chosen) {
        if (chosen === it.reach) {
          return "Yes — " + it.reach + ". " + it.owns + ", and that second sentence is the one " +
            "that actually decides what you can do about it.";
        }
        return "That is a different reach. The plan draws what fits inside the boundary; count " +
          "the buildings, or notice that there are not any.";
      }
    });
  }

  qs.push({
    id: "limit",
    ask: "What actually limits it?",
    hint: "Not the number on the advertisement. Every one of these has a ceiling somewhere, and " +
      "it is usually a length, a share, a line of sight, or a distance light has to travel.",
    answer: it.limit,
    choices: [it.limit].concat(pick(D, "limit", 3, rnd, false).map(function (c) { return c.limit; })),
    why: function (chosen) {
      if (chosen === it.limit) {
        return "Right. " + it.limit + ". A customer asking why it is slower than they were sold " +
          "is asking about this and nothing else.";
      }
      return "That is what limits something else on the list. Work from the readings beside the " +
        "plan: a figure that collapses in the evening, a figure that never changes, and a delay " +
        "no equipment can shorten each point somewhere different.";
    }
  });

  qs.push({
    id: "use",
    ask: "What would you specify it for?",
    hint: "Not what it does — what somebody was trying to achieve when they chose it over the " +
      "other options, and what they accepted in exchange.",
    answer: it.use,
    choices: [it.use].concat(pick(D, "use", 3, rnd, true).map(function (c) { return c.use; })),
    why: function (chosen) {
      if (chosen === it.use) return "Right. " + it.use + ".";
      return "That is why something else on the list gets chosen. Work back from what limits " +
        "this one: whatever that ceiling is, the site that chose it had decided it could live " +
        "with it.";
    }
  });

  qs.push({
    id: "confused",
    ask: "Which one does it get confused with?",
    hint: "Not the one with the similar name — the one somebody surveys, quotes or installs " +
      "instead of it and then has to go back and explain.",
    answer: BY[it.lookalike].name,
    choices: (function () {
      var set = [BY[it.lookalike].name];
      pick(D, "name", 6, rnd, true).forEach(function (c) {
        if (set.length < 4 && c.key !== it.lookalike && set.indexOf(c.name) === -1) set.push(c.name);
      });
      return set;
    })(),
    why: function (chosen) {
      if (chosen === BY[it.lookalike].name) return it.lookalikeWhy;
      return "That one is separable at a glance. The pairing this question wants is the one that " +
        "costs somebody a survey, a quotation or a second visit.";
    }
  });

  return qs;
}
