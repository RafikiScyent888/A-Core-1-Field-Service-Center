/* =====================================================================
   Field Service Center — objective 2.2

   "Explain wireless networking technologies."

   An Explain objective, so a drill. But it needed a different kind of
   thinking about what to put in front of the student, because the obvious
   answer is wrong: you cannot tell 802.11ac from 802.11ax by looking at an
   access point. They are the same white plastic disc on the same ceiling.

   What IS real and spatial about 2.2 is COVERAGE. A band is a trade you
   make between how far the signal goes and how much it carries, and that
   trade is visible on a floor plan and nowhere else. So the instrument is a
   plan of a floor with one access point on it and the survey readings taken
   around it — which is exactly the artefact a technician works from.

   The graded facts follow from that: which band this must be, given how far
   it got and what it managed through a wall; what it would cost to move it
   to the other band; and how many of these can share a space before they
   start standing on each other.
   ===================================================================== */

export const WIRELESS = [
  {
    key: "dot11a", name: "802.11a", band: "5 GHz only",
    observed: "24 Mb/s", dense: "Falls apart — it was never designed for a crowd",
    rate: "Up to 54 Mb/s, and in practice about half of that",
    reach: "The shortest of the wireless standards \u2014 5 GHz is absorbed by walls and furniture, so it covers a room rather than a floor",
    room: "Plenty of channels and almost nobody else on them, because so little equipment ever supported it",
    use: "The first 5 GHz standard, and effectively extinct \u2014 worth knowing because it is the reason 5 GHz existed before it was popular",
    lookalike: "dot11g",
    lookalikeWhy: "Identical headline rate and completely different band. The pairing exists to make one point: a number on a box tells you nothing about how far it will reach. One of these covers a room, the other covers a floor, and both say 54."
  },
  {
    key: "dot11b", name: "802.11b", band: "2.4 GHz only",
    observed: "5 Mb/s", dense: "Falls apart, and drags every other device on the radio down with it",
    rate: "Up to 11 Mb/s, and it drags every other device on the same radio down to its own timing",
    reach: "The longest reach of any of them, because 2.4 GHz passes through walls that stop 5 GHz dead",
    room: "Three non-overlapping channels in the whole band \u2014 1, 6 and 11 \u2014 so a fourth access point in earshot is interfering with one of the other three",
    use: "The standard that made wireless ordinary, and now the one whose presence on a network slows everything else down",
    lookalike: "dot11g",
    lookalikeWhy: "Same band, same antennas, same access point, five times the difference in rate. This is the pair that matters operationally: leave the older one enabled and the newer one runs at the older one's pace."
  },
  {
    key: "dot11g", name: "802.11g", band: "2.4 GHz only",
    observed: "24 Mb/s", dense: "Degrades steeply — clients queue for the air one at a time",
    rate: "Up to 54 Mb/s, falling back hard when an older device joins",
    reach: "Long \u2014 the same 2.4 GHz reach through walls, at five times the rate of what came before it",
    room: "The same three non-overlapping channels, which is the ceiling on how many you can put in one building",
    use: "The standard that made 2.4 GHz fast enough to be useful, and still the fallback almost everything supports",
    lookalike: "dot11a",
    lookalikeWhy: "Same headline rate, different band, wildly different coverage. If two access points both claim 54 and one reaches the far office, it is this one."
  },
  {
    key: "dot11n", name: "802.11n (Wi-Fi 4)", band: "2.4 GHz and 5 GHz",
    observed: "110 Mb/s", dense: "Degrades steeply — clients queue for the air one at a time",
    rate: "Hundreds of megabits, depending on how many streams and how wide a channel it is allowed",
    reach: "Whatever the band gives it \u2014 which is the point, because it is the first one that can choose",
    room: "Bonding two channels together doubles the rate and halves how many access points fit in the band, which is a real decision rather than a setting",
    use: "The first standard with multiple antennas and multiple streams, and the first that could work on either band",
    lookalike: "dot11ac",
    lookalikeWhy: "Both fast, both multi-antenna, and one of them still works on 2.4 GHz. Turn the older devices' band off on the newer standard and they disappear entirely, because the newer one never went there."
  },
  {
    key: "dot11ac", name: "802.11ac (Wi-Fi 5)", band: "5 GHz only",
    observed: "380 Mb/s", dense: "Degrades steeply — clients queue for the air one at a time",
    rate: "Gigabit and beyond on wide channels with several streams",
    reach: "Short, because it is 5 GHz only \u2014 you buy the rate with the coverage",
    room: "Wide channels eat the band: at 80 MHz there are only a handful of non-overlapping options, and radar avoidance can move you off one without asking",
    use: "The standard that made wireless fast enough to replace a cable on a desk, at the cost of never reaching the far end of the building",
    lookalike: "dot11n",
    lookalikeWhy: "The mistake is assuming the newer one is better everywhere. It has no 2.4 GHz radio at all, so a warehouse scanner that only speaks 2.4 sees nothing."
  },
  {
    key: "dot11ax", name: "802.11ax (Wi-Fi 6)", band: "2.4 GHz and 5 GHz",
    observed: "390 Mb/s", dense: "Holds up — the floor stays usable because the channel is divided rather than queued",
    rate: "Similar peak to what came before it, and far better when a hundred devices want the air at once",
    reach: "Both bands again, so it covers like 2.4 and performs like 5 depending on which radio the client uses",
    room: "It divides a channel between several clients at once rather than making them queue, which is why it helps most exactly where the old standards struggled",
    use: "Built for density \u2014 a lecture theatre, a warehouse, an open-plan floor \u2014 rather than for a single fast client",
    lookalike: "dot11ac",
    lookalikeWhy: "The peak numbers look similar and people conclude the upgrade is not worth it. The difference does not show on a speed test with one laptop; it shows on a floor with two hundred."
  },
  {
    key: "wifi6e", name: "Wi-Fi 6E", band: "6 GHz, in addition to 2.4 and 5",
    observed: "410 Mb/s", dense: "Holds up — the floor stays usable because the channel is divided rather than queued",
    rate: "The same as Wi-Fi 6, on air that has almost nothing else in it",
    reach: "Shorter again \u2014 higher frequency, less penetration, so it is a same-room technology",
    room: "A great deal of clean spectrum with room for many wide channels, which is its entire appeal",
    use: "Getting away from the congestion in the older bands, for clients new enough to have a radio for it",
    lookalike: "dot11ax",
    lookalikeWhy: "Same standard, extra band, and a client without a 6 GHz radio simply never sees it. Deploying it and expecting the whole fleet to benefit is how the complaints start."
  },
  {
    key: "bluetooth", name: "Bluetooth", band: "2.4 GHz",
    observed: "2 Mb/s", dense: "Unaffected — it hops rather than sharing a channel",
    rate: "A few megabits at most \u2014 enough for audio, input and telemetry, not for files",
    reach: "About ten metres for the common class of device, and less through anything solid \u2014 note that it is on the same band as long-range wireless networking and goes nowhere near as far, because reach is decided by transmit power as well as by frequency",
    room: "It hops across the band many times a second rather than sitting on a channel, so it coexists with wireless networking instead of colliding with it",
    use: "Connecting a device to the thing in its owner's hand \u2014 a headset, a keyboard, a sensor",
    lookalike: "nfc",
    lookalikeWhy: "Both short-range, both on a handset, both called wireless. One needs pairing and reaches across a room; the other needs no pairing and reaches across a few centimetres."
  },
  {
    key: "nfc", name: "NFC", band: "13.56 MHz",
    rate: "A few hundred kilobits \u2014 enough for a credential or a handshake, and nothing more",
    reach: "A few centimetres, deliberately: the range IS the security model",
    room: "Proximity is what stops two of them interfering, because two readers a metre apart cannot hear each other at all",
    use: "Tapping to pay, tapping a badge to a reader, and handing a Bluetooth pairing over so the user does not have to",
    lookalike: "rfid",
    lookalikeWhy: "Closely related and constantly confused. This one is two-way and both ends can be active, which is why a phone can be the card and the reader; the other is one-way, and the tag has no power of its own."
  },
  {
    key: "rfid", name: "RFID", band: "125 kHz, 13.56 MHz or 860\u2013960 MHz depending on the type",
    rate: "Just enough to return an identifier",
    reach: "Centimetres on the low frequencies, several metres on the high ones \u2014 which is why stock control and door badges use different kinds",
    room: "Readers on the high frequencies can read many tags at once, which is the whole point in a warehouse",
    use: "Identifying a thing without touching it \u2014 stock, assets, badges, livestock",
    lookalike: "nfc",
    lookalikeWhy: "One of these is a two-way conversation between two powered devices; the other is a reader shouting at an unpowered tag and listening for the echo. The tag cannot start anything."
  },
  {
    key: "longrange", name: "Long-range fixed wireless", band: "Licensed or unlicensed, depending on what you are allowed to transmit at",
    rate: "From tens of megabits to gigabit, depending on the link and the distance",
    reach: "Kilometres, with clear line of sight \u2014 and nothing at all without it",
    room: "Directional antennas at both ends, so the signal goes where it is aimed and interferes with almost nothing else",
    use: "Joining two buildings without a trench, where a fibre run is not going to happen",
    lookalike: "dot11ac",
    lookalikeWhy: "Often the same underlying radio standard, pointed rather than broadcast. The difference is the antenna and the licensing, not the chipset \u2014 which is why the same kit appears in both jobs."
  },
  {
    key: "dot11be", name: "802.11be (Wi-Fi 7)", band: "2.4, 5 and 6 GHz together",
    observed: "780 Mb/s", dense: "Holds up, and a client can hold two bands open at once instead of choosing",
    rate: "Multi-gigabit where there is 6 GHz to use, on channels twice the width of anything before it",
    reach: "Whatever band it is using at the time \u2014 the 6 GHz radio is a same-room technology and the 2.4 GHz radio still crosses the floor",
    room: "Channels twice as wide as the previous generation, so the clean 6 GHz band fills up in half as many access points as people expect",
    use: "Where the demand is real and the clients are new \u2014 and where holding two bands open at once matters more than the headline number",
    lookalike: "wifi6e",
    lookalikeWhy: "Same disc on the same ceiling, same 6 GHz band, and a client that cannot use the wider channels or hold two links at once gets none of what was paid for. The generation on the box is not the generation in the laptop."
  },
  {
    key: "dot11ad", name: "802.11ad (WiGig)", band: "60 GHz",
    observed: "1.6 Gb/s", dense: "Not a factor \u2014 nothing else can hear it from the next room",
    rate: "Several gigabits, in one room, with nothing between the two ends",
    reach: "The shortest of any of them \u2014 60 GHz is stopped by a wall, by a door, and by a person walking between the two ends",
    room: "Almost unlimited, because two of these in adjoining rooms cannot hear each other at all \u2014 the walls that ruin the coverage are what make the reuse free",
    use: "Replacing a cable across a desk \u2014 a wireless dock, a display link \u2014 rather than covering a building",
    lookalike: "dot11ac",
    lookalikeWhy: "One letter apart, and it is the letter that decides whether the thing covers a floor or a desk. Ordering one when the drawing said the other is a mistake that survives a purchase order, because both boxes say 802.11 and a gigabit."
  },
  {
    key: "ble", name: "Bluetooth Low Energy", band: "2.4 GHz",
    observed: "0.2 Mb/s", dense: "Unaffected \u2014 it wakes, says one thing and goes back to sleep",
    rate: "A few hundred kilobits at most, in short bursts rather than a stream",
    reach: "Similar to the classic sort in metres, but the device runs for a year on a coin cell rather than a day on a battery",
    room: "It advertises in short bursts on three channels and negotiates on the rest, so hundreds of them coexist in one room without a plan",
    use: "Sensors, beacons, wearables and tags \u2014 anything that has to report a small thing occasionally and never be charged",
    lookalike: "bluetooth",
    lookalikeWhy: "The same name, the same band and the same logo on the box, and a headset will not pair with a radio that only speaks this. It is a different protocol wearing the same brand, and 'Bluetooth 5.0' on a datasheet does not tell you which of the two is supported."
  },
  {
    key: "activerfid", name: "Active RFID", band: "433 MHz or 860\u2013960 MHz, with a battery in the tag",
    observed: "0.05 Mb/s", dense: "Fine \u2014 a reader can take hundreds of reports, because each one is short and they are not synchronised",
    rate: "Just enough to report an identifier and sometimes a temperature, every few seconds",
    reach: "Tens to a hundred metres, through walls \u2014 because the tag transmits rather than reflecting",
    room: "One reader covers a whole area rather than a doorway, so the question stops being where to put the readers and becomes how to tell two areas apart",
    use: "Tracking things that move around a site on their own \u2014 vehicles, trolleys, high-value assets \u2014 rather than things that get carried past a reader",
    lookalike: "rfid",
    lookalikeWhy: "The same word, and the difference is a battery. One kind is read at a doorway because it has no power and has to be shouted at; this kind reports from across the yard and stops working when the cell dies, which is a maintenance job nobody costed."
  },
  {
    key: "licensed", name: "Licensed microwave link", band: "A licensed band, exclusive to the holder",
    rate: "Hundreds of megabits to gigabit, and it stays there",
    reach: "Kilometres with clear line of sight, and it keeps working when the unlicensed bands get busy",
    room: "Nobody else is allowed on the frequency \u2014 which is what is being bought, and interference becomes a matter somebody has to answer for",
    use: "A link that has to be there \u2014 a hospital site, a control system, a backhaul the business runs on",
    lookalike: "longrange",
    lookalikeWhy: "Two identical-looking dishes on two masts. The difference is not the hardware or the distance, it is whether anyone else may legally transmit on that frequency \u2014 and that is what the money buys. Specify the unlicensed one for a link that must not drop and the first busy summer is the test."
  }
];

const BY = {};
WIRELESS.forEach(function (w) { BY[w.key] = w; });
export { BY as BY_KEY };

function pick(D, field, n, rnd) {
  var want = String(D.item[field]);
  var look = BY[D.item.lookalike];
  var out = [], seen = {};
  seen[want] = 1;
  function take(c) {
    var v = String(c[field]);
    if (out.length >= n || seen[v] || c.key === D.item.key) return;
    seen[v] = 1; out.push(c);
  }
  if (look) take(look);
  rnd(WIRELESS).forEach(take);
  return out.slice(0, n);
}

/* ---------------------------------------------------------------------
   The survey.

   Readings taken at four points on the plan, in the order a technician
   would walk them: standing under it, across the open floor, through one
   internal wall, and at the far corner. The numbers are a function of the
   item's band, so a student who understands the trade can read the band off
   the survey before they read it off anything else.
   --------------------------------------------------------------------- */
/* How far this technology's signal spreads, as one class.

   Exported and shared, because the plan and the panel MUST agree: a model
   that draws Bluetooth as a short-range bubble beside a survey describing it
   reaching the far corner is a question with no answer. Both read this. */
export function spreadFor(item) {
  if (item.key === "nfc" || item.key === "rfid") return "tiny";
  if (item.key === "longrange" || item.key === "licensed") return "beam";
  /* 60 GHz is its own shape and not a short version of 5 GHz: it does not
     degrade through a wall, it stops. Surveying it with the 5 GHz rows would
     describe a technology that does not exist. */
  if (item.key === "dot11ad") return "sixty";
  /* An active tag transmits instead of reflecting, so it covers an area and
     goes through walls \u2014 the opposite of the passive kind it shares a name
     with, and the whole of the question that separates them. */
  if (item.key === "activerfid") return "wide";
  if (item.key === "bluetooth" || item.key === "ble") return "short";
  return /6 GHz|5 GHz only/.test(item.band) ? "short" : "long";
}

export function surveyRows(D) {
  var it = D.item;
  var kind = spreadFor(it);

  if (kind === "tiny") {
    /* Not a floor-covering technology at all, so it does not get floor
       readings. Distance is measured in centimetres and the failure is
       total rather than graceful. */
    return it.key === "nfc"
      ? [
          { k: "Touching the reader", v: "Reads first time, every time" },
          { k: "Two centimetres away", v: "Reads" },
          { k: "Ten centimetres away", v: "Nothing" },
          { k: "Through one internal wall", v: "Nothing, and that is the security model rather than a limitation" },
          { k: "Far corner of the floor", v: "Nothing" }
        ]
      : [
          { k: "Tag held to the reader", v: "Reads" },
          { k: "Half a metre away", v: "Reads on the high-frequency type, nothing on the low" },
          { k: "Four metres away", v: "Reads on the ultra-high-frequency type only" },
          { k: "Through one internal wall", v: "Nothing \u2014 it is a line-of-sight read, not a network" },
          { k: "Far corner of the floor", v: "Nothing" }
        ];
  }
  if (kind === "beam") {
    return [
      { k: "At the antenna", v: "Full rate" },
      { k: "Across the open floor", v: "Not applicable \u2014 it is aimed, not broadcast" },
      { k: "Through one internal wall", v: "Nothing. It needs to see the other end" },
      { k: "The next building, line of sight", v: "Full rate at 1.4 km" },
      { k: "The next building, tree in the way", v: "Link drops" }
    ];
  }
  var extra = it.observed
    ? [{ k: "Best observed throughput", v: it.observed },
       { k: "With sixty clients associated", v: it.dense }]
    : [];

  if (kind === "sixty") {
    return [
      { k: "Standing under it", v: "Full rate, multi-gigabit" },
      { k: "Across the open floor", v: "Rate collapses \u2014 and drops entirely when somebody walks through it" },
      { k: "Through one internal wall", v: "Nothing at all" },
      { k: "Through two walls", v: "Nothing at all" },
      { k: "Far corner of the floor", v: "Nothing at all" }
    ].concat(extra);
  }
  if (kind === "wide") {
    return [
      { k: "Tag held to the reader", v: "Reads" },
      { k: "Across the open floor", v: "Reads, and reports on its own without being asked" },
      { k: "Through one internal wall", v: "Still reporting" },
      { k: "Through two walls", v: "Still reporting, more weakly" },
      { k: "Far corner of the floor", v: "Still reporting \u2014 the tag has its own transmitter" }
    ].concat(extra);
  }
  if (kind === "short") {
    /* A room, not a floor. It survives one partition badly and nothing after
       that, which is exactly where it parts company with 2.4 GHz. */
    return [
      { k: "Standing under it", v: "\u221240 dBm, full rate" },
      { k: "Across the open floor", v: "\u221268 dBm, rate halved" },
      { k: "Through one internal wall", v: "\u221278 dBm, barely usable" },
      { k: "Through two walls", v: "No association" },
      { k: "Far corner of the floor", v: "No association" }
    ].concat(extra);
  }
  return [
    { k: "Standing under it", v: "\u221240 dBm, full rate" },
    { k: "Across the open floor", v: "\u221258 dBm, near full rate" },
    { k: "Through one internal wall", v: "\u221265 dBm, usable" },
    { k: "Through two walls", v: "\u221274 dBm, slow but connected" },
    { k: "Far corner of the floor", v: "\u221278 dBm, associated at the lowest rate" }
  ].concat(extra);
}

export function wirelessQuestions(D, rnd) {
  var it = D.item;
  var qs = [];

  qs.push({
    id: "band",
    ask: "Which band is this operating on?",
    hint: "Read the survey rather than guessing. How far it got, and what it managed through a wall, is decided by the band before anything else.",
    answer: it.band,
    choices: [it.band].concat(pick(D, "band", 3, rnd).map(function (c) { return c.band; })),
    why: function (chosen) {
      if (chosen === it.band) {
        return "Yes \u2014 " + it.band + ". " + it.reach;
      }
      return "That is a different technology's band. Go back to the survey: the reading through a " +
        "wall is the one that separates the bands, because that is where the trade actually bites.";
    }
  });

  qs.push({
    id: "which",
    ask: "Which technology is this?",
    hint: "Band and rate together. Several of these share one or the other, and only the pair identifies it.",
    answer: it.name,
    choices: [it.name].concat(pick(D, "name", 3, rnd).map(function (c) { return c.name; })),
    why: function (chosen) {
      if (chosen === it.name) return it.use + ". " + it.lookalikeWhy;
      var o = WIRELESS.filter(function (c) { return c.name === chosen; })[0];
      return o ? "That one runs on " + o.band.charAt(0).toLowerCase() + o.band.slice(1) +
        ", and " + o.rate.charAt(0).toLowerCase() + o.rate.slice(1) +
        ". Read the survey again." : "That is not what the survey describes.";
    }
  });

  qs.push({
    id: "rate",
    ask: "What throughput should this actually deliver?",
    hint: "Not the number on the box. The realistic figure, and what drags it down.",
    answer: it.rate,
    choices: [it.rate].concat(pick(D, "rate", 3, rnd).map(function (c) { return c.rate; })),
    why: function (chosen) {
      if (chosen === it.rate) return "Correct. " + it.rate + ".";
      return "That is another technology's ceiling. A headline rate is measured at the access " +
        "point with one client and nothing else in the air, which is not a situation anybody works in.";
    }
  });

  qs.push({
    id: "reach",
    ask: "How far does it reach, and why that far?",
    hint: "The why matters more than the number. What is it about this band that decides where the coverage stops?",
    answer: it.reach,
    choices: [it.reach].concat(pick(D, "reach", 3, rnd).map(function (c) { return c.reach; })),
    why: function (chosen) {
      if (chosen === it.reach) {
        return "Right. " + it.reach + " That trade \u2014 reach against throughput \u2014 is the whole of " +
          "this objective in one sentence.";
      }
      return "That is a different technology's coverage. Higher frequencies carry more and " +
        "penetrate less, and every decision on this objective comes back to that.";
    }
  });

  qs.push({
    id: "room",
    ask: "What limits how many of these can work in the same space?",
    hint: "Every one of these has a different answer, and it is rarely the number of devices. Think about what they have to share.",
    answer: it.room,
    choices: [it.room].concat(pick(D, "room", 3, rnd).map(function (c) { return c.room; })),
    why: function (chosen) {
      if (chosen === it.room) {
        return "Yes. " + it.room + " This is the question that decides how many access points a " +
          "floor can actually take, and it is the one people skip when they add another one to fix a complaint.";
      }
      return "That is what constrains a different technology. Work from what this one has to share \u2014 " +
        "a channel, the whole band, or nothing at all because it cannot hear anything a metre away.";
    }
  });

  qs.push({
    id: "confused",
    ask: "Which technology does this get confused with?",
    hint: "Not the one that does something similar \u2014 the one that gets specified by mistake, and costs money when it does.",
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
      return "That one is distinguishable without much thought. The pairing this question wants is " +
        "the one that gets the wrong equipment ordered or the wrong band switched off.";
    }
  });

  return qs;
}
