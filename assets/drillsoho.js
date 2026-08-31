/* =====================================================================
   Field Service Center — objective 2.6

   "Configure basic wired/wireless small office/home office networks."

   THE VERB IS DIFFERENT AND SO IS THE EXERCISE. Every other exercise on
   this page is an identification drill, because the book's verb is compare,
   summarise or explain and there is a thing on the bench. Here the verb is
   CONFIGURE. Nothing is broken, nobody has rung up, and there is nothing to
   name. There is a small business, a set of requirements, and five
   decisions somebody has to make before anything works.

   So this is the same engine with a different subject: the item is a SITE
   rather than an object, and every graded answer is computed from that
   site's own numbers rather than looked up beside them. Change the seed and
   the office has a different number of desks, a different number of things
   that must keep the same address, and different neighbours on the air —
   and every one of the five answers moves with it. There is no version of
   this that can be memorised.

   THE FIVE DECISIONS, and why these five:

   1. HOW BIG A NETWORK. The count of things on the site, plus room to grow,
      against the masks a technician actually picks from. Arithmetic, done
      on numbers you can see on the plan.
   2. WHERE THE POOL STARTS AND STOPS. The one that bites: a scope that
      starts at the bottom hands out the gateway's address, and a scope that
      runs to the top hands out the broadcast address. Both are configured
      by people who have never counted an address space. (2.4 is where the
      idea comes from; this is where it is set.)
   3. WHICH CHANNEL. The survey found the neighbours. Choosing the free one
      of the three that do not overlap is the decision; splitting the
      difference between two busy ones is the classic wrong answer. (2.2.)
   4. WHAT GOES IN THE PORT THAT IS SET APART. The service arrives in a box
      and the router's outside port goes to that box and nothing else.
      Which box depends on what the provider brought to the building. (2.5
      and 2.7.)
   5. KEEPING SOMETHING APART. Card machines, cameras, door controllers,
      the public. A second wireless name is not separation, and a longer
      password is not separation. This is the question that separates
      somebody who has configured a network from somebody who has clicked
      through the wizard.
   ===================================================================== */

/* A seeded generator of the site's own numbers, kept local so this file has
   no dependency on the page that deals it. Same seed, same office. */
function rand(seed) {
  var a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function pickInt(r, lo, hi) { return lo + Math.floor(r() * (hi - lo + 1)); }

/* The masks a technician genuinely chooses between on a site this size, and
   how many addresses each one leaves once the network and broadcast
   addresses are taken out of it. */
const MASKS = [
  { bits: 28, mask: "255.255.255.240", usable: 14 },
  { bits: 27, mask: "255.255.255.224", usable: 30 },
  { bits: 26, mask: "255.255.255.192", usable: 62 },
  { bits: 25, mask: "255.255.255.128", usable: 126 },
  { bits: 24, mask: "255.255.255.0", usable: 254 }
];
function maskLabel(m) {
  return "/" + m.bits + "  (" + m.mask + ") — " + m.usable + " usable addresses";
}

/* What the service arrives in, by what the provider brought to the wall.
   Named the way the boxes are named on 2.5, deliberately: the two
   objectives are the same equipment seen from two sides. */
const ENTRY = {
  coax: { arrives: "a threaded coaxial socket on an outside wall",
    box: "The cable modem, on its coaxial socket",
    wrong: "There is coaxial cable coming into this building, not a fibre and not a telephone pair." },
  fibre: { arrives: "a fibre, into a sealed box with a hinged cover",
    box: "The optical network terminal, on its fibre connector",
    wrong: "The provider brought glass to this building. Whatever ends that glass is what the " +
      "outside port connects to." },
  dsl: { arrives: "a telephone pair, into a small filtered socket",
    box: "The DSL modem, on the telephone pair",
    wrong: "What arrives here is a telephone pair. It has to be turned into Ethernet before " +
      "anything on this site can use it." },
  fixedwireless: { arrives: "a lead down from a dish on the gable end",
    box: "The outdoor radio unit, down its single cable",
    wrong: "There is no cable into this building from the street at all. Look at the roof." }
};

/* Every wrong way to keep something apart, and why each fails. These are the
   four that get configured in the field. */
const APART_WRONG = [
  { text: "A second wireless network with its own name and its own password, on the same " +
      "underlying network as everything else",
    why: "A second name is not a second network. Both sets of clients land in the same address " +
      "space, see each other, and reach the same things. This is the one that gets configured " +
      "most often and it separates nothing at all." },
  { text: "The same wireless network for everything, with a longer and more complicated password",
    why: "A password decides who gets on. It does not decide what they can reach once they are " +
      "on, and everything on this list is a question about what somebody can reach." },
  { text: "A separate wireless network on a different channel from the main one",
    why: "A channel is which part of the air the radio uses. Two networks on different channels " +
      "are still the same network the moment the traffic reaches the cable." },
  { text: "The main wireless network, with a list of permitted hardware addresses on the access " +
      "point",
    why: "A list of permitted addresses is an admission control, and a weak one — the addresses " +
      "are broadcast in the clear and can be copied. It also says nothing about what a permitted " +
      "device may then reach." }
];

export const SITES = [
  {
    key: "dental", name: "A dental practice on a high street", floors: 1,
    place: "Four surgeries off one corridor, a reception at the front and a small room at the " +
      "back with the equipment in it.",
    service: "fibre", users: 14, poe: 3,
    fixedKinds: ["the imaging server", "the two imaging workstations", "the network printer"],
    apart: "The card machine at reception, which the practice's payment provider requires to be " +
      "unable to reach the rest of the network",
    apartAnswer: "Its own network on the switch, with no route to the office network at all",
    apartWhy: "A payment device gets its own segment and one way out, and that is a requirement " +
      "somebody else will audit. The office network must not be reachable from it and it must " +
      "not be reachable from the office network."
  },
  {
    key: "letting", name: "A letting agency over two floors", floors: 2,
    place: "Desks downstairs at the front, offices upstairs, and a waiting area where members of " +
      "the public sit.",
    service: "coax", users: 11, poe: 2,
    fixedKinds: ["the file store", "the network printer"],
    apart: "Wireless for the people waiting in reception, who must not be able to reach anything " +
      "the agency runs",
    apartAnswer: "A separate wireless network on its own segment, with clients kept from seeing " +
      "each other and no route to the office network",
    apartWhy: "Guest wireless is two things at once: separated from the business, and separated " +
      "from itself, because the people sitting in a waiting room have no business reaching each " +
      "other's laptops either."
  },
  {
    key: "workshop", name: "A vehicle workshop with an office attached", floors: 1,
    place: "A workshop with three bays, and a partitioned office at one end with the equipment " +
      "on a shelf.",
    service: "dsl", users: 8, poe: 2,
    fixedKinds: ["the diagnostic rig", "the parts terminal"],
    apart: "The four cameras over the bays, which the insurer requires and which must not be " +
      "reachable from anywhere except the recorder",
    apartAnswer: "Their own network on the switch, reaching the recorder and nothing else — " +
      "including no way out to the internet",
    apartWhy: "Cameras are computers with a lens on the front and firmware nobody updates. They " +
      "get a segment that reaches the recorder and has no route out, which also stops them " +
      "phoning home."
  },
  {
    key: "cafe", name: "A coffee shop with tables outside", floors: 1,
    place: "A counter, a seating area, and a cupboard behind the counter with the equipment in it.",
    service: "coax", users: 6, poe: 2,
    fixedKinds: ["the till system", "the order screen in the kitchen"],
    apart: "Wireless for customers, which the tills must be nowhere near",
    apartAnswer: "A separate wireless network on its own segment, with clients kept from seeing " +
      "each other and no route to the till network",
    apartWhy: "The customers are strangers and the tills take money. Those two facts settle it: " +
      "one segment for the public that reaches the internet and nothing else."
  },
  {
    key: "gallery", name: "A picture gallery in a converted chapel", floors: 1,
    place: "One large room with thick stone walls, a mezzanine, and a small office behind the " +
      "desk.",
    service: "fibre", users: 5, poe: 4,
    fixedKinds: ["the sales terminal", "the print archive"],
    apart: "The eight cameras covering the hanging space, which the gallery's insurer requires",
    apartAnswer: "Their own network on the switch, reaching the recorder and nothing else — " +
      "including no way out to the internet",
    apartWhy: "Cameras are computers with a lens on the front and firmware nobody updates. They " +
      "get a segment that reaches the recorder and has no route out, which also stops them " +
      "phoning home."
  },
  {
    key: "accountants", name: "An accountants' practice on the first floor", floors: 1,
    place: "Six offices off a landing, a meeting room, and a cupboard on the landing with the " +
      "equipment in it.",
    service: "fibre", users: 17, poe: 2,
    fixedKinds: ["the file store", "the two network printers", "the backup appliance"],
    apart: "Wireless in the meeting room, used by clients who come in with their own laptops",
    apartAnswer: "A separate wireless network on its own segment, with clients kept from seeing " +
      "each other and no route to the office network",
    apartWhy: "A client's laptop in a meeting room is somebody else's computer on your premises. " +
      "It gets the internet and nothing of yours."
  },
  {
    key: "vets", name: "A veterinary surgery with a boarding wing", floors: 1,
    place: "Consulting rooms, a theatre, a boarding wing along the back, and a comms cupboard by " +
      "the staff room.",
    service: "coax", users: 12, poe: 5,
    fixedKinds: ["the practice server", "the x-ray workstation", "the network printer"],
    apart: "The cameras in the boarding wing, which the owners can view but which must not reach " +
      "the practice system",
    apartAnswer: "Their own network on the switch, reaching the recorder and nothing else — " +
      "including no way out to the internet",
    apartWhy: "Cameras are computers with a lens on the front and firmware nobody updates. They " +
      "get a segment that reaches the recorder and has no route out, which also stops them " +
      "phoning home."
  },
  {
    key: "storage", name: "A self-storage site with a portacabin office", floors: 1,
    place: "Three rows of units, a portacabin at the gate, and equipment on a shelf inside it.",
    service: "fixedwireless", users: 4, poe: 6,
    fixedKinds: ["the gate controller", "the office terminal"],
    apart: "The door controllers on each row, which unlock units and must not be reachable from " +
      "the office network",
    apartAnswer: "Their own network on the switch, reaching the controller software and nothing " +
      "else",
    apartWhy: "Anything that opens a lock gets its own segment. There is no version of this where " +
      "a machine in the office should be able to talk directly to a door."
  },
  {
    key: "salon", name: "A hair salon with a treatment room upstairs", floors: 2,
    place: "A salon floor, a small kitchen, and a treatment room upstairs where the signal has " +
      "always been poor.",
    service: "dsl", users: 7, poe: 2,
    fixedKinds: ["the booking terminal", "the card terminal"],
    apart: "Wireless for clients under the dryers, who must not be able to reach the booking " +
      "system",
    apartAnswer: "A separate wireless network on its own segment, with clients kept from seeing " +
      "each other and no route to the office network",
    apartWhy: "The people using it are customers, and the booking system holds their details and " +
      "takes their money. One segment for the public, reaching the internet only."
  },
  {
    key: "printshop", name: "A print shop with a production floor", floors: 1,
    place: "A shop front, a production floor behind it with the large-format machines, and a rack " +
      "on the wall of the finishing room.",
    service: "fibre", users: 9, poe: 3,
    fixedKinds: ["the large-format printer", "the proofing station", "the file store"],
    apart: "The two production machines, which the manufacturer supports remotely and which run " +
      "software nobody may update locally",
    apartAnswer: "Their own network on the switch, with only the one way out the manufacturer " +
      "needs",
    apartWhy: "Equipment somebody else supports remotely, running software you are not allowed to " +
      "patch, is equipment that gets its own segment and exactly the access its support contract " +
      "requires."
  },
  {
    key: "charity", name: "A charity office in a shared building", floors: 1,
    place: "One large office in a building the charity shares with two other tenants, and a " +
      "cupboard by the door.",
    service: "coax", users: 15, poe: 2,
    fixedKinds: ["the file store", "the network printer"],
    apart: "Wireless for the volunteers, who bring their own laptops and change every week",
    apartAnswer: "A separate wireless network on its own segment, with clients kept from seeing " +
      "each other and no route to the office network",
    apartWhy: "Machines you do not own and cannot inspect go on their own segment. That the people " +
      "carrying them are volunteers rather than strangers does not change what is on the laptop."
  },
  {
    key: "surveyor", name: "A surveyor's office above a shop", floors: 1,
    place: "Two rooms above a shop, reached by a stair at the side, with the equipment on a shelf " +
      "in the smaller one.",
    service: "dsl", users: 6, poe: 1,
    fixedKinds: ["the plotter", "the drawing archive"],
    apart: "The plotter and the archive, which must stay reachable from the office but must not " +
      "be reachable from the wireless the shop below has been given a password to",
    apartAnswer: "Their own network on the switch, with the office network allowed in and the " +
      "wireless not",
    apartWhy: "Separation is not always guest-against-everything. Here the two things that hold " +
      "the work stay on the wired side, and the network the neighbours can reach does not get in."
  },
  {
    key: "leisure", name: "A leisure centre with a plant room", floors: 2,
    place: "A reception, a gym floor, two studios upstairs, and a plant room with the heating and " +
      "the door controllers in it.",
    service: "fibre", users: 16, poe: 6,
    fixedKinds: ["the booking server", "the door controller", "the network printer"],
    apart: "The heating and door control system, which the company that maintains it dials into " +
      "from outside",
    apartAnswer: "Its own network on the switch, reaching its own controller and the one " +
      "workstation that manages it, with the maintainer's access ending there",
    apartWhy: "The building system needs to be reachable by the people who maintain it and by " +
      "nothing else, and their way in must not also be a way into the centre's own network. Put " +
      "it on its own segment and let exactly one workstation cross into it — because a remote " +
      "session that lands on a flat network has landed on everything."
  },
  {
    key: "pharmacy", name: "A pharmacy with a dispensing robot", floors: 1,
    place: "A shop floor, a dispensary behind it, and a consulting room to one side.",
    service: "dsl", users: 7, poe: 2,
    fixedKinds: ["the dispensing robot", "the patient record terminal", "the label printer"],
    apart: "The dispensing robot, whose supplier will not support it on anything newer than the " +
      "operating system it came with",
    apartAnswer: "Its own network on the switch, reaching the one terminal that talks to it, with " +
      "no route out to the internet at all",
    apartWhy: "A machine that cannot be patched is not a machine you argue with — it is one you " +
      "put somewhere it cannot be reached from and cannot reach out of. Two rules: one workstation " +
      "gets to it, and it gets to nothing. That is the whole control, and it costs nothing."
  },
  {
    key: "estate", name: "A groundworks firm in a yard office", floors: 1,
    place: "A portable office with four desks, a weighbridge outside, and no cable to the road.",
    service: "fixedwireless", users: 6, poe: 3,
    fixedKinds: ["the weighbridge controller", "the network printer"],
    apart: "The staff's own phones, which everybody wants on the wireless and none of which the " +
      "firm manages",
    apartAnswer: "A separate wireless network that reaches the internet and nothing on the " +
      "business network at all",
    apartWhy: "A personal phone is a device nobody controls, and saying no to it does not work — " +
      "people share the office password instead, which is worse. Give it a way to the internet " +
      "and no way to anything else, and the argument stops being a security decision."
  },
  {
    key: "chambers", name: "A set of offices in a shared building", floors: 1,
    place: "Six rooms off a landlord's corridor, with the building's own network sockets already " +
      "in the walls.",
    service: "coax", users: 9, poe: 2,
    fixedKinds: ["the case file store", "the network printer"],
    apart: "The building's own network, which the landlord provides to every tenant on the floor " +
      "and which this firm's equipment must not be reachable from",
    apartAnswer: "The firm's own equipment behind its own router, with nothing of the firm's " +
      "reachable from the building's network",
    apartWhy: "A shared building's network is somebody else's network with other people's tenants " +
      "on it. Being a tenant does not make it yours and does not make it trustworthy. The firm's " +
      "kit goes behind its own boundary, and what the landlord provides is treated exactly like " +
      "the internet."
  },
  {
    key: "callcentre", name: "A small call centre in a unit", floors: 1,
    place: "One open floor with twenty desks, a supervisor's office, and a comms cabinet in the " +
      "corner.",
    service: "fibre", users: 22, poe: 8,
    fixedKinds: ["the call server", "the recording store", "the network printer"],
    apart: "The desk telephones, which the provider says must not share a segment with the " +
      "computers",
    apartAnswer: "Their own network on the switch, reaching the call server, with the desk ports " +
      "carrying both networks so one cable serves a phone and the computer behind it",
    apartWhy: "Voice is separated for two reasons at once, and only one of them is security: it " +
      "also lets the network treat calls differently from everything else, which is what stops a " +
      "large file upload breaking somebody's call. The desk still gets one cable — the phone takes " +
      "the voice network and passes the computer through on the other."
  }
];

const BY = {};
SITES.forEach(function (s) { BY[s.key] = s; });
export { BY as BY_KEY };

/* ---------------------------------------------------------------------
   The site's own numbers, derived from the seed.

   Everything graded comes out of here, so nothing on the page can be
   memorised: the same office at a different seed has a different desk
   count, a different number of fixed addresses and different neighbours.
   --------------------------------------------------------------------- */
export function siteFrom(D) {
  var it = D.item;
  /* The site's own key goes into the seed. Without it every site at a given
     slot drew identical numbers, so twelve different businesses all had the
     same two tablets on the air and the same free channel — deterministic,
     which was the point, but identical, which was not. */
  var mix = 0;
  for (var c = 0; c < it.key.length; c++) mix = (mix * 131 + it.key.charCodeAt(c)) >>> 0;
  var r = rand((D.seedBase + 0x5150 + mix) >>> 0);

  var desks = it.users + pickInt(r, -3, 8);
  if (desks < 3) desks = 3;
  /* Everything that will want an address: a desk each, the things that must
     keep the same one, whatever is fed down its cable, and the phones and
     tablets that belong to nobody in particular.

     These ranges are wide on purpose. Narrow ones meant nearly every site
     landed on the same two masks, and a size question with two possible
     answers is a coin toss rather than a calculation. */
  var fixed = it.fixedKinds.length + pickInt(r, 0, 3);
  var mobiles = pickInt(r, 0, it.users + 4);
  var devices = desks + fixed + it.poe + mobiles;
  /* Room to grow, at the figure the brief states in words so that the
     arithmetic is fully determined by what is on the page. */
  var growth = Math.ceil(devices * 0.5);
  var need = devices + growth;

  var chosen = null;
  for (var i = 0; i < MASKS.length; i++) {
    if (MASKS[i].usable >= need) { chosen = MASKS[i]; break; }
  }
  if (!chosen) chosen = MASKS[MASKS.length - 1];

  /* The inside network, and the addresses set by hand at the bottom of it.
     The router takes the first one. */
  var third = pickInt(r, 10, 40);
  var net = "192.168." + third;
  var lastStatic = 1 + fixed;          // .1 is the router, then the fixed ones
  /* The block starts at .0, so the count of usable addresses IS the last
     usable one: .0 is the network address and the one above the last usable
     is the broadcast address. Off by one here and the pool hands out the
     broadcast address, which is exactly the fault this question is about. */
  var top = chosen.usable;

  /* Which of the three non-overlapping channels the neighbours have left
     alone. Generated so exactly one is free — which is the situation a
     survey in a terraced high street actually finds. */
  var free = [1, 6, 11][pickInt(r, 0, 2)];
  var busy = [1, 6, 11].filter(function (c) { return c !== free; });
  /* One neighbour sitting between the non-overlapping channels, because in a
     terraced high street there always is one, and because it is the shape of
     the wrong answer this question is built around. */
  var strays = [3, 4, 8, 9];
  var stray = strays[pickInt(r, 0, strays.length - 1)];

  return {
    site: it, desks: desks, fixed: fixed, mobiles: mobiles, poe: it.poe,
    devices: devices, growth: growth, need: need,
    mask: chosen, net: net, lastStatic: lastStatic, top: top,
    freeChannel: free, busyChannels: busy, strayChannel: stray,
    entry: ENTRY[it.service]
  };
}

/* ---------------------------------------------------------------------
   What the customer has told you, and what the survey found.

   Requirements and counts, never a decision. Every number here is an INPUT
   to one of the five questions and none of them is an answer: the answers
   are arithmetic on these, or a judgement about them.
   --------------------------------------------------------------------- */
export function briefRows(D) {
  var S = siteFrom(D);
  return [
    { k: "The premises", v: S.site.place },
    { k: "People working there", v: S.desks + " at desks, plus phones and tablets that come and " +
        "go — " + (S.mobiles ? S.mobiles + " of those on the air the day you survey"
          : "none of those on the air the day you survey, which will not stay true") },
    { k: "Must keep the same address", v: S.fixed + " devices, including " +
        S.site.fixedKinds.join(", ") },
    { k: "Fed down their own network cable", v: S.poe + " devices, with no supply of their own" },
    { k: "Room to grow", v: "The owner expects to be about half again as big within two years, and " +
        "wants the network sized for that rather than for today" },
    { k: "What the provider brought to the wall", v: S.entry.arrives },
    { k: "On the air already", v: "The survey found the neighbours using channels " +
        S.busyChannels.join(" and ") + ", and one further along on channel " + S.strayChannel },
    { k: "The customer has also asked for", v: S.site.apart }
  ];
}

/* ---------------------------------------------------------------------
   The five decisions.
   --------------------------------------------------------------------- */
export function sohoQuestions(D, rnd) {
  var S = siteFrom(D);
  var qs = [];

  /* 1 — how big. */
  var others = MASKS.filter(function (m) { return m.bits !== S.mask.bits; });
  qs.push({
    id: "mask",
    ask: "How big do you make the inside network?",
    hint: "Add up everything on the brief that will want an address — the desks, the fixed ones, " +
      "the ones fed down their cables, and the phones and tablets. Then leave room to grow, and " +
      "find the smallest block that still fits.",
    answer: maskLabel(S.mask),
    choices: [maskLabel(S.mask)].concat(rnd(others).slice(0, 3).map(maskLabel)),
    why: function (chosen) {
      if (chosen === maskLabel(S.mask)) {
        return "Right. " + S.devices + " devices today — " + S.desks + " desks, " + S.fixed +
          " fixed, " + S.poe + " fed down their cables and " + S.mobiles + " on the air — plus " +
          S.growth + " for growth is " + S.need + ", and " + S.mask.usable + " usable addresses " +
          "is the smallest block on the list that holds it. Two of those addresses are gone " +
          "before you start: the network address and the broadcast address, which is why the " +
          "count is " + S.mask.usable + " and not " + (S.mask.usable + 2) + ".";
      }
      var m = MASKS.filter(function (x) { return maskLabel(x) === chosen; })[0];
      if (!m) return "That is not one of the blocks on the list.";
      if (m.usable < S.need) {
        return "That block holds " + m.usable + " usable addresses and this site needs " + S.need +
          " — " + (S.need - m.usable) + " short. It would work on the day you installed it and " +
          "run out later, which is worse than not working at all.";
      }
      return "That would fit, but it is bigger than it needs to be — " + m.usable + " addresses " +
        "for a site that needs " + S.need + ". Work down the list until the next one down is too " +
        "small, and stop there.";
    }
  });

  /* 2 — the scope. */
  var right = S.net + "." + (S.lastStatic + 1) + " to " + S.net + "." + S.top;
  var wrongs = [
    { t: S.net + ".1 to " + S.net + "." + S.top,
      w: "That starts at the first address in the block, which is the one the router is on. The " +
        "first machine to ask for an address is handed the gateway's, and then nothing on the " +
        "site can get out." },
    { t: S.net + ".2 to " + S.net + "." + S.top,
      w: "That starts one above the router, which is exactly where the " + S.fixed + " devices " +
        "that must keep the same address are sitting. They were set by hand, so nothing knows " +
        "they are taken — and they get handed out to somebody else." },
    { t: S.net + "." + (S.lastStatic + 1) + " to " + S.net + "." + (S.top + 1),
      w: "That runs one past the end. The last address in a block is the broadcast address and " +
        "belongs to nobody; handing it to a machine breaks that machine and confuses everything " +
        "else on the segment." },
    { t: S.net + "." + Math.floor(S.top / 3) + " to " + S.net + "." + Math.floor(S.top * 2 / 3),
      w: "A block out of the middle, which is what gets configured when nobody counts. It fits " +
        "today. It leaves the addresses above and below it unused and unaccounted for, and the " +
        "site outgrows the pool while most of the block sits empty." }
  ];
  qs.push({
    id: "scope",
    ask: "The router is on " + S.net + ".1 and the " + S.fixed + " fixed devices are set by hand " +
      "immediately above it. What range do you give the pool to hand out?",
    hint: "Two addresses in any block belong to nobody and one belongs to the router. Then count " +
      "past the ones somebody has already set by hand. The pool starts after all of that and " +
      "stops before the top.",
    answer: right,
    choices: [right].concat(rnd(wrongs).slice(0, 3).map(function (x) { return x.t; })),
    why: function (chosen) {
      if (chosen === right) {
        return "Correct. The router has " + S.net + ".1, the " + S.fixed + " fixed devices run " +
          "from ." + 2 + " to ." + S.lastStatic + ", so the pool starts at ." + (S.lastStatic + 1) +
          " — and it stops at ." + S.top + ", because the address above that is the broadcast " +
          "address for this block and is not anybody's to have.";
      }
      var m = wrongs.filter(function (x) { return x.t === chosen; })[0];
      return m ? m.w : "That is not one of the ranges offered.";
    }
  });

  /* 3 — the channel. */
  var chOpts = [
    { t: "Channel " + S.freeChannel, ok: true },
    { t: "Channel " + S.busyChannels[0], ok: false,
      w: "A neighbour is already on it. Two networks on the same channel take turns, which is " +
        "orderly and halves what each of them gets." },
    { t: "Channel " + S.busyChannels[1], ok: false,
      w: "A neighbour is already on it. Two networks on the same channel take turns, which is " +
        "orderly and halves what each of them gets." },
    { t: "Channel " + S.strayChannel + ", between the ones in use", ok: false,
      w: "This is the classic wrong answer and it is worse than picking a busy channel. Only " +
        "three channels in this band do not overlap; anything between them overlaps TWO of the " +
        "neighbours at once, and overlapping traffic is noise rather than something to take " +
        "turns with." }
  ];
  qs.push({
    id: "channel",
    ask: "Which channel do you set the access points to in the 2.4 GHz band?",
    hint: "Only three channels in this band do not overlap each other. Find which of those three " +
      "the survey did not report, and do not be tempted by the gap in between.",
    answer: "Channel " + S.freeChannel,
    choices: chOpts.map(function (x) { return x.t; }),
    why: function (chosen) {
      if (chosen === "Channel " + S.freeChannel) {
        return "Yes. Channels 1, 6 and 11 are the three in this band that do not overlap, the " +
          "neighbours have " + S.busyChannels.join(" and ") + ", and that leaves " +
          S.freeChannel + ". Anything else either shares a channel or overlaps two of them.";
      }
      var m = chOpts.filter(function (x) { return x.t === chosen; })[0];
      return m ? m.w : "That is not one of the channels offered.";
    }
  });

  /* 4 — what the outside port connects to. */
  var boxes = Object.keys(ENTRY).map(function (k) { return ENTRY[k]; });
  var wrongBoxes = boxes.filter(function (b) { return b.box !== S.entry.box; });
  qs.push({
    id: "outside",
    ask: "The router has one port set apart from the others. What goes into it?",
    hint: "That port faces a different network from every other port on the box. Read what the " +
      "provider actually brought to the wall, and work out what has to turn it into something " +
      "the router can accept.",
    answer: S.entry.box,
    choices: [S.entry.box].concat(rnd(wrongBoxes).slice(0, 3).map(function (b) { return b.box; })),
    why: function (chosen) {
      if (chosen === S.entry.box) {
        return "Right — " + S.entry.arrives + ", and that is what ends it. The outside port goes " +
          "to that box and to nothing else: put a machine or a switch on it and you have joined " +
          "the inside of the network to the outside of it.";
      }
      var m = boxes.filter(function (b) { return b.box === chosen; })[0];
      return m ? m.wrong + " " + S.entry.arrives + "." : "That is not one of the options.";
    }
  });

  /* 5 — keeping something apart. */
  qs.push({
    id: "apart",
    ask: "The customer asked for this: " + S.site.apart + ". How do you configure it?",
    hint: "Ask what the thing being kept apart must be able to REACH, not what it must be called. " +
      "Three of these four change a name, a password or a channel and leave everything reachable " +
      "from everything.",
    answer: S.site.apartAnswer,
    choices: [S.site.apartAnswer].concat(rnd(APART_WRONG.slice()).slice(0, 3)
      .map(function (x) { return x.text; })),
    why: function (chosen) {
      if (chosen === S.site.apartAnswer) return S.site.apartWhy;
      var m = APART_WRONG.filter(function (x) { return x.text === chosen; })[0];
      return m ? m.why : "That is not one of the options.";
    }
  });

  return qs;
}
