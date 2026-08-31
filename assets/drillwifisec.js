/* =====================================================================
   Field Service Center — objectives 2.2 and 2.6, the security half

   "Explain wireless networking technologies" includes the encryption
   standards, and "configure basic wired/wireless SOHO networks" is where a
   technician actually picks one. This build taught neither. The wireless
   drill covered bands, throughput and reach; the SOHO drill covered
   addressing and channels. Nothing anywhere graded encryption at all, on a
   qualification where it is a headline topic and on a job where getting it
   wrong is the difference between a network and an open one.

   What separates these items, in the order a technician meets them:

   1. IS IT ENCRYPTED, AND CAN IT BE BROKEN TODAY. Three of these should
      never be configured now, and knowing which three is most of it.
   2. WHERE DOES THE KEY COME FROM. A shared passphrase everybody knows, or
      a per-user credential checked by a server. That single distinction is
      personal against enterprise, and students conflate them constantly.
   3. WHAT DOES IT ACTUALLY PROTECT. Some of these encrypt the traffic. Some
      only decide who may associate. Two of them do neither and are widely
      believed to do both.
   4. WHAT BREAKS IF YOU TURN IT ON. Every one of these has a compatibility
      cost, and a network nobody can join is not more secure, it is broken.

   The instrument is an access point's configuration page, because that is
   what is in front of you when the decision is made.
   ===================================================================== */

export const WIFISEC = [
  {
    key: "open", name: "Open (no security)", era: "legacy",
    cipher: "None",
    asks: "Nothing — there is no key field",
    section: "Security → SSID",
    encrypts: "Nothing. Every frame is readable by anyone in range with a receiver",
    keyFrom: "There is no key",
    protects: "Nothing at all",
    breaks: "Nothing — everything joins, which is exactly the problem",
    verdict: "Never on a network carrying anything. It is defensible only for a guest segment " +
      "that is isolated and treated as hostile",
    tell: "The configuration page shows no key field at all, and clients join without a prompt",
    lookalike: "owe",
    lookalikeWhy: "Both let a client join without a passphrase, so both look identical to a " +
      "user. One sends every frame in clear; the other negotiates a key per client and " +
      "encrypts anyway. A guest network that needs no password is not automatically " +
      "unencrypted, and assuming it is has gone the other way too."
  },
  {
    key: "wep", name: "WEP", era: "legacy",
    cipher: "RC4, offered as 64-bit or 128-bit",
    asks: "A hex key or a passphrase of fixed length, plus an open-or-shared choice",
    section: "Security → SSID",
    encrypts: "Traffic, with a cipher broken in minutes by software anyone can download",
    keyFrom: "A shared static key, typed as hex or as a passphrase",
    protects: "Nothing in practice. It is encryption that no longer works",
    breaks: "Very little — almost everything still supports it, which is why it lingers",
    verdict: "Never. If you find it, the job is to replace it, and the equipment carrying it " +
      "is usually old enough to replace as well",
    tell: "A key length offered in bits — 64 or 128 — and a choice of open or shared " +
      "authentication, neither of which any current standard offers",
    lookalike: "wpa2psk",
    lookalikeWhy: "Both take one key that everybody in the building shares, so they are " +
      "configured the same way and feel the same to a user. One is unbroken and the other has " +
      "been trivially breakable for twenty years. The tell is on the page: bits and a shared " +
      "or open choice means you are looking at the broken one."
  },
  {
    key: "wpapsk", name: "WPA (TKIP)", era: "legacy",
    cipher: "TKIP, often as a mixed mode beside AES",
    asks: "A passphrase",
    section: "Security → SSID",
    encrypts: "Traffic, with TKIP — a stopgap built to run on hardware designed for the " +
      "broken standard before it",
    keyFrom: "A shared passphrase",
    protects: "Better than nothing and worse than anything current. It has known weaknesses",
    breaks: "Nothing, but selecting it drags the whole network down to its speeds",
    verdict: "Never now. Its one purpose was to buy time on hardware that could not do better, " +
      "and that hardware is long past replacing",
    tell: "TKIP named on the page as the cipher, often as a mixed mode alongside AES",
    lookalike: "wpa2psk",
    lookalikeWhy: "The names differ by one digit and the page often offers them as a mixed " +
      "mode, so both get left on. Leaving the older one enabled does not just weaken the " +
      "network: on many access points it caps the whole radio at legacy rates, so the fastest " +
      "client on the site runs at a fraction of what it paid for."
  },
  {
    key: "wpa2psk", name: "WPA2-Personal (PSK)", era: "current",
    cipher: "AES-CCMP",
    asks: "A passphrase",
    section: "Security → SSID",
    encrypts: "Traffic, with AES-CCMP",
    keyFrom: "One passphrase shared by everybody on the network",
    protects: "The traffic, against anybody who does not have the passphrase — and against " +
      "nobody who does",
    breaks: "Almost nothing. It is the widest-supported current option",
    verdict: "The sensible floor for a home or a small office, on the understanding that " +
      "everybody who has ever been told the passphrase can still decrypt what they capture",
    tell: "AES or CCMP named as the cipher, and a single passphrase field",
    lookalike: "wpa2ent",
    lookalikeWhy: "Same standard, same cipher, and the page calls them WPA2-Personal and " +
      "WPA2-Enterprise a line apart. Where the key comes from is the whole difference: one " +
      "passphrase everybody types, or a credential per person checked against a server. " +
      "Changing staff is a rekey of the whole site on one and a single account edit on the other."
  },
  {
    key: "wpa2ent", name: "WPA2-Enterprise (802.1X)", era: "current",
    cipher: "AES-CCMP, keyed per client session",
    asks: "A RADIUS address, a port and a shared secret",
    section: "Security → SSID",
    encrypts: "Traffic, with AES-CCMP, on a key derived per client session",
    keyFrom: "A per-user credential, checked by a RADIUS server before the client is let on",
    protects: "The traffic, and it identifies who each client is — which a shared passphrase " +
      "cannot do at all",
    breaks: "Anything that cannot do 802.1X: some printers, some sensors, and older " +
      "consumer equipment. Those need a separate network",
    verdict: "The right answer anywhere with staff who join and leave, because a departure is " +
      "an account change rather than a site-wide rekey",
    tell: "Fields for a RADIUS server address, a port and a shared secret, and no passphrase " +
      "field for clients at all",
    lookalike: "wpa3ent",
    lookalikeWhy: "Both authenticate per user against a server and both look the same on the " +
      "configuration page. The newer one hardens the handshake and mandates protected " +
      "management frames; the older one is still perfectly serviceable, which is why sites " +
      "run it for years after the newer one is available."
  },
  {
    key: "wpa3psk", name: "WPA3-Personal (SAE)", era: "current",
    cipher: "AES-CCMP, with an SAE handshake",
    asks: "A passphrase",
    section: "Security → SSID",
    encrypts: "Traffic, with a handshake that does not leak anything useful to somebody " +
      "capturing it",
    keyFrom: "A shared passphrase, exchanged by a method that resists offline guessing",
    protects: "The traffic, and each client from the others — one passphrase no longer means " +
      "one key for everybody",
    breaks: "Older clients that cannot do it. Transition mode runs both and is the usual " +
      "answer, at the cost of the weaknesses of the older one remaining available",
    verdict: "The right answer for a home or small office now, in transition mode until the " +
      "last old client is gone",
    tell: "SAE named on the page, and often a transition or mixed option beside it",
    lookalike: "wpa2psk",
    lookalikeWhy: "Both are a single passphrase for the site and both are configured " +
      "identically. Under the older one, anybody with the passphrase can decrypt everybody " +
      "else's traffic including what they captured last month; under the newer one they " +
      "cannot. That is not a small difference on a network with guests."
  },
  {
    key: "wpa3ent", name: "WPA3-Enterprise", era: "current",
    cipher: "GCMP-256, keyed per client session",
    asks: "A RADIUS address, a port and a shared secret",
    section: "Security → SSID",
    encrypts: "Traffic, with per-session keys and a hardened handshake",
    keyFrom: "A per-user credential checked by a RADIUS server",
    protects: "The traffic, the identity of each client, and the management frames as well",
    breaks: "Anything without current firmware, and it requires protected management frames, " +
      "which some older clients will not do",
    verdict: "The right answer for an organisation, where the equipment supports it throughout",
    tell: "RADIUS fields as with the older enterprise mode, plus protected management frames " +
      "shown as required rather than optional",
    lookalike: "wpa2ent",
    lookalikeWhy: "Identical to configure and identical to a user. The difference is in the " +
      "handshake and in management frame protection being mandatory rather than optional, " +
      "which is what closes the deauthentication attacks the older one permits."
  },
  {
    key: "owe", name: "Enhanced Open (OWE)", era: "current",
    cipher: "AES-CCMP, on a key agreed per client",
    asks: "Nothing — there is no key field",
    section: "Security → SSID",
    encrypts: "Traffic, on a key negotiated per client with no passphrase involved",
    keyFrom: "Nowhere — it is agreed between client and access point without a shared secret",
    protects: "The traffic against passive capture. It does NOT authenticate anybody",
    breaks: "Clients that do not support it, which is why it is usually run in a transition " +
      "mode alongside a plain open network",
    verdict: "What a public or guest network should be doing instead of running open, because " +
      "it costs the user nothing and stops the person in the car park reading everything",
    tell: "The page offers it as an open network with encryption, or as Enhanced Open, and " +
      "there is still no passphrase field",
    lookalike: "open",
    lookalikeWhy: "The user experience is identical — no password, straight on. One encrypts " +
      "and one does not, and no client shows the difference in a way anybody notices. A cafe " +
      "that has switched to this has genuinely improved things and nobody has thanked them."
  },
  {
    key: "wps", name: "WPS", era: "legacy",
    cipher: "Whatever the SSID is already set to",
    asks: "An eight-digit PIN, or a button on the unit",
    section: "Security → Quick setup",
    encrypts: "Nothing itself. It is a way of handing over the key, not a way of protecting " +
      "traffic",
    keyFrom: "It gives the client the existing passphrase, after a button press or an eight-" +
      "digit PIN",
    protects: "Nothing. The PIN method can be brute-forced in hours because it is checked in " +
      "two halves",
    breaks: "Nothing — turning it off inconveniences nobody who can type a passphrase",
    verdict: "Off. It is the one setting on a consumer access point that reliably undoes the " +
      "encryption chosen above it",
    tell: "A physical button on the unit and a PIN field on the page, usually enabled by default",
    lookalike: "wpa2psk",
    lookalikeWhy: "People describe it as a security setting and it appears in the security " +
      "section, so it is read as an encryption choice. It is not one: it is a shortcut for " +
      "distributing the key you already chose, and its PIN method hands that key to anyone " +
      "patient enough to ask for it repeatedly."
  },
  {
    key: "macfilter", name: "MAC filtering", era: "theatre",
    cipher: "None",
    asks: "A list of hardware addresses, allow or deny",
    section: "Security → Access control",
    encrypts: "Nothing",
    keyFrom: "No key. It is a list of hardware addresses allowed to associate",
    protects: "Nothing against anybody capable. Addresses are broadcast in clear and can be " +
      "copied in seconds",
    breaks: "Your own administration. Every new device is a support call, and a replaced " +
      "handset is another",
    verdict: "Not a security control. It has a legitimate use as a tidiness measure on a small " +
      "fixed estate, and no place in a threat model",
    tell: "A table of addresses on the page with allow or deny beside it",
    lookalike: "hiddenssid",
    lookalikeWhy: "Both are recommended constantly, both feel like security, and neither " +
      "resists anybody who has downloaded a tool. They are the two settings a customer will " +
      "tell you they have already done, and the two you should not count."
  },
  {
    key: "hiddenssid", name: "Hidden SSID", era: "theatre",
    cipher: "None",
    asks: "A broadcast-name tickbox, unticked",
    section: "Wireless → SSID",
    encrypts: "Nothing",
    keyFrom: "No key. The network simply stops announcing its name",
    protects: "Nothing. The name appears in client probe requests, so a hidden network " +
      "advertises itself through every device that has ever joined it",
    breaks: "Client behaviour — devices roam worse, join slower, and some will not connect at all",
    verdict: "Not a security control, and it makes the network worse. Leave the name visible",
    tell: "A broadcast SSID checkbox, unticked",
    lookalike: "macfilter",
    lookalikeWhy: "The same category of advice from the same era, and both are believed by " +
      "customers who have read one article. Neither stops anybody, and this one actively " +
      "degrades the thing it is applied to."
  },
  {
    key: "guestiso", name: "Guest network with client isolation", era: "current",
    cipher: "Whatever that SSID is set to",
    asks: "That SSID's own key, plus an isolation tickbox",
    section: "Guest network",
    encrypts: "Whatever the guest network itself is set to — this is a separate control",
    keyFrom: "Its own passphrase, or none if it is an open or Enhanced Open guest network",
    protects: "The rest of the estate. Isolated clients can reach the internet and not each " +
      "other, and not the wired side",
    breaks: "Anything a guest needs to reach locally — printing, casting, file shares. That is " +
      "the point, and it surprises people",
    verdict: "The right answer whenever anybody who is not staff is given access, and it is " +
      "orthogonal to the encryption choice rather than an alternative to it",
    tell: "A separate SSID with its own security settings, plus an isolation or AP-isolation " +
      "option beside it",
    lookalike: "vlanwifi",
    lookalikeWhy: "Both separate guests from the estate and people use the words " +
      "interchangeably. One stops clients on the same network reaching each other; the other " +
      "puts them in a different network entirely. On a small router the first is all you get, " +
      "and it is not the same thing."
  },
  {
    key: "vlanwifi", name: "SSID mapped to a VLAN", era: "current",
    cipher: "Whatever that SSID is set to",
    asks: "A VLAN identifier beside the SSID",
    section: "Wireless → SSID → VLAN",
    encrypts: "Whatever that SSID is set to",
    keyFrom: "That SSID's own settings",
    protects: "The estate, by putting the traffic in a different broadcast domain before it " +
      "reaches anything",
    breaks: "Anything that assumed one flat network, and it needs a switch and a router that " +
      "understand tagging",
    verdict: "How separation is actually done on equipment that can do it, with isolation as " +
      "the poor relation on equipment that cannot",
    tell: "A VLAN identifier field beside each SSID on the configuration page",
    lookalike: "guestiso",
    lookalikeWhy: "The same intent at two different layers. Isolation is enforced by the " +
      "access point between clients it can see; a VLAN is enforced by the network. Selling one " +
      "as the other is how a guest ends up able to reach the till system."
  },
  {
    key: "radius", name: "RADIUS server", era: "current",
    cipher: "None of its own",
    asks: "An address, a port and a shared secret pointing elsewhere",
    section: "Security → RADIUS servers",
    encrypts: "Nothing itself. It is what the enterprise modes ask when a client tries to join",
    keyFrom: "It IS where the key comes from — it holds or checks the credentials",
    protects: "Nothing on its own. It is the piece that makes per-user authentication possible",
    breaks: "Everything, if it is unreachable. A network whose authentication server is down " +
      "does not let anybody on at all, which is why it is the first thing to check when " +
      "nobody can join and the radio looks fine",
    verdict: "Required for either enterprise mode, and worth understanding as a dependency " +
      "rather than as a setting",
    tell: "An address, a port and a shared secret on the access point's page, pointing " +
      "somewhere else entirely",
    lookalike: "wpa2ent",
    lookalikeWhy: "One is the mode you select and the other is the server that mode depends " +
      "on, and they are described together so often that they merge. Knowing they are separate " +
      "is what lets you diagnose 'nobody can join' as a server being down rather than as " +
      "wireless being broken."
  },
  {
    key: "pmf", name: "Protected management frames (802.11w)", era: "current",
    cipher: "Applies to management frames, not to traffic",
    asks: "A choice of disabled, optional or required",
    section: "Security → SSID → Advanced",
    encrypts: "The management frames — the ones that tell a client to disconnect",
    keyFrom: "No key of its own. It rides on whichever mode is configured",
    protects: "Against somebody sending forged disconnect frames to knock clients off, which " +
      "is otherwise trivial and needs no key at all",
    breaks: "Older clients when it is set to required rather than optional",
    verdict: "Optional under WPA2, mandatory under WPA3, and the reason a deauthentication " +
      "attack stops working",
    tell: "A setting offering disabled, optional or required, usually near the encryption choice",
    lookalike: "wpa3psk",
    lookalikeWhy: "It arrives with the newer standard and is mandatory there, so it gets " +
      "remembered as part of it. It is separate and can be switched on under the older " +
      "standard too, which is often the cheapest fix for clients being knocked off a network."
  },
  {
    key: "captive", name: "Captive portal", era: "current",
    cipher: "None of its own",
    asks: "Nothing — whatever the portal page asks is not a key",
    section: "Guest network → Portal",
    encrypts: "Nothing. It intercepts the first request and shows a page",
    keyFrom: "No key. Whatever the portal asks for — an email address, a room number, a " +
      "tick-box — is not a key and does not protect anything",
    protects: "Nothing technically. It exists for terms of use, for logging, and for " +
      "commercial reasons",
    breaks: "Devices with no browser, and anything that needs to connect before a human can " +
      "accept a page. Printers and sensors will sit there forever",
    verdict: "A business control, not a security one. Run it over an encrypted guest network " +
      "rather than instead of one",
    tell: "A redirect page after joining, and an open or Enhanced Open network behind it",
    lookalike: "open",
    lookalikeWhy: "The network underneath a portal is almost always open, so people report " +
      "the portal as the security. It is a page, and the traffic either side of it is exactly " +
      "as protected as the network it is running on — which is usually not at all."
  },
  {
    key: "wpa3trans", name: "WPA2/WPA3 transition mode", era: "current",
    cipher: "AES-CCMP, both handshakes offered on one SSID",
    asks: "A passphrase",
    section: "Security → SSID",
    encrypts: "Traffic, with each client getting whichever of the two it can do",
    keyFrom: "One passphrase, used by both modes",
    protects: "Newer clients properly, older clients as well as the older standard ever did",
    breaks: "Almost nothing, which is the point — it is how a site moves without a flag day",
    verdict: "The realistic answer during a migration, remembering that the network is only " +
      "as strong as the weakest mode it still accepts",
    tell: "The page names both standards on one SSID, often as WPA2/WPA3-Personal",
    lookalike: "wpa3psk",
    lookalikeWhy: "It is selected from the same menu and looks like the newer standard with a " +
      "compatibility note. It is not: an attacker can still negotiate the older one, so the " +
      "protections that made the newer standard worth having are available to anyone who " +
      "declines to use it. It is a migration step, not a destination."
  }
];

/* The instrument: an access point's configuration page, with the line in
   question highlighted among real settings doing real jobs — the same
   contract the firewall table obeys for 2.1.

   IT DOES NOT PRINT THE NAME. The firewall table shows a port number and the
   student names the protocol; this shows what the page displays for a line
   and the student names the setting. A table with the answer in column one
   is a reading exercise, and the first draft of this was exactly that.

   The three columns are all things genuinely on an access point's page, and
   none of them decides an answer alone: eight of the seventeen sit in the
   same section, four name no cipher, and five ask for a passphrase. Together
   they narrow it to one. That is the exercise. */
export function apPage(D, rnd) {
  const it = D.item;
  const others = rnd(WIFISEC.filter((w) => w.key !== it.key)).slice(0, 5);
  const line = (w, subject) => ({ subject: subject, cells: [w.cipher, w.asks, w.section] });
  const rows = others.map((w) => line(w, false));
  rows.splice(rnd([0, 1, 2, 3, 4])[0] % (rows.length + 1), 0, line(it, true));
  return {
    caption: "The access point's security page, as found, with the names of the settings " +
      "taken off. One line is highlighted. Every other line is a real setting this device " +
      "offers — the page states what is configured, never whether it is wise.",
    columns: ["Cipher named", "What the page asks for", "Where it sits"],
    rows: rows
  };
}

function pick(D, field, n, rnd) {
  const it = D.item;
  const seen = {};
  return rnd(WIFISEC.filter((w) => w.key !== it.key && w[field] !== it[field])
    .filter((w) => (seen[w[field]] ? false : (seen[w[field]] = true)))).slice(0, n);
}

export function wifisecQuestions(D, rnd) {
  const it = D.item;
  const qs = [];

  qs.push({
    id: "name",
    ask: "Which setting is the highlighted line?",
    hint: "Take the three columns in turn. Where it sits rules out most of the list — access " +
      "control and quick setup are not encryption modes. The cipher rules out most of what " +
      "is left. What the page asks for decides between the last two.",
    answer: it.name,
    choices: [it.name].concat(pick(D, "name", 3, rnd).map((c) => c.name)),
    why: (chosen) => chosen === it.name
      ? it.tell + " " + it.lookalikeWhy
      : "No. What is on the page is: " + it.name + ". " + it.tell
  });

  qs.push({
    id: "encrypts",
    ask: "What does it actually encrypt?",
    hint: "Three things on this list protect nothing and are believed to protect a great " +
      "deal. Ask what a person sitting in the car park with a receiver would be able to read.",
    answer: it.encrypts,
    choices: [it.encrypts].concat(pick(D, "encrypts", 3, rnd).map((c) => c.encrypts)),
    why: (chosen) => chosen === it.encrypts
      ? "Yes. " + it.encrypts + "."
      : "No. " + it.encrypts + ". What a setting encrypts and what it is believed to " +
        "encrypt are different questions on half of this list."
  });

  qs.push({
    id: "keyfrom",
    ask: "Where does the key come from?",
    hint: "One passphrase everybody types, a credential per person checked by a server, or " +
      "no key at all. That single question is what personal and enterprise means.",
    answer: it.keyFrom,
    choices: [it.keyFrom].concat(pick(D, "keyFrom", 3, rnd).map((c) => c.keyFrom)),
    why: (chosen) => chosen === it.keyFrom
      ? "Yes. " + it.keyFrom + "."
      : "No. " + it.keyFrom + ". Where the key comes from decides what happens when somebody " +
        "leaves: a site-wide rekey, or one account edit."
  });

  qs.push({
    id: "breaks",
    ask: "What stops working if you turn it on?",
    hint: "A network nobody can join is not more secure, it is broken. Every one of these has " +
      "a compatibility cost and some of them have a client that will never come back.",
    answer: it.breaks,
    choices: [it.breaks].concat(pick(D, "breaks", 3, rnd).map((c) => c.breaks)),
    why: (chosen) => chosen === it.breaks
      ? "Yes. " + it.breaks + "."
      : "No. " + it.breaks + ". The compatibility cost is part of the decision, not a " +
        "detail to find out afterwards."
  });

  qs.push({
    id: "verdict",
    ask: "Would you configure this on a site today?",
    hint: "Three of these should never be configured now and two more are not security " +
      "controls at all, whatever the customer has read.",
    answer: it.verdict,
    choices: [it.verdict].concat(pick(D, "verdict", 3, rnd).map((c) => c.verdict)),
    why: (chosen) => chosen === it.verdict
      ? it.verdict + "."
      : "No. " + it.verdict + "."
  });

  qs.push({
    id: "lookalike",
    ask: "Which setting is this most often confused with?",
    hint: "Not the one that does a different job — the one a customer or a colleague would " +
      "use the same words for.",
    answer: WIFISEC.filter((w) => w.key === it.lookalike)[0].name,
    choices: (function () {
      const set = [WIFISEC.filter((w) => w.key === it.lookalike)[0].name];
      pick(D, "name", 6, rnd).forEach((c) => {
        if (set.length < 4 && c.key !== it.lookalike && set.indexOf(c.name) === -1) set.push(c.name);
      });
      return set;
    })(),
    why: (chosen) => {
      const la = WIFISEC.filter((w) => w.key === it.lookalike)[0];
      return chosen === la.name ? it.lookalikeWhy
        : "No — it is confused with " + la.name + ". " + it.lookalikeWhy;
    }
  });

  return qs;
}

/* Asserted at load, because this build has shipped an item missing a field
   more than once and each time it rendered an incomplete exercise instead of
   saying so. */
const SHAPE = ["key", "name", "era", "cipher", "asks", "section", "encrypts", "keyFrom",
  "protects", "breaks", "verdict", "tell", "lookalike", "lookalikeWhy"];
const SEEN_PAGE = {};
WIFISEC.forEach((w) => {
  const missing = SHAPE.filter((f) => !w[f]);
  if (missing.length) {
    throw new Error('drillwifisec: "' + (w.key || "?") + '" is missing ' + missing.join(", ") + ".");
  }
  if (!WIFISEC.some((o) => o.key === w.lookalike)) {
    throw new Error('drillwifisec: "' + w.key + '" names lookalike "' + w.lookalike +
      '", which is not in the pool.');
  }
  /* The page no longer prints the name, so the three observables ARE the
     question. Two items showing the same three make that question
     unanswerable — the student would be marked wrong for reading the
     evidence correctly. Caught here rather than in front of a class. */
  const sig = w.cipher + "|" + w.asks + "|" + w.section;
  if (SEEN_PAGE[sig]) {
    throw new Error('drillwifisec: "' + w.key + '" and "' + SEEN_PAGE[sig] + '" show the ' +
      'identical page line (' + sig + '). Nothing on the page could tell them apart, so ' +
      'the naming question has two right answers and grades one of them wrong.');
  }
  SEEN_PAGE[sig] = w.key;
});
