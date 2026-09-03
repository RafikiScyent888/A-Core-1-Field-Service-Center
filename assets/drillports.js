/* =====================================================================
   Field Service Center — objective 2.1

   "Compare and contrast TCP and UDP ports, protocols, and their purposes."

   Compare and contrast, so it is a drill. But unlike 3.2 and 1.2 there is
   nothing to put in front of a camera: a port is a number and a protocol is
   an agreement. A 3D box with 443 written on the side would be decoration,
   and this build does not do decoration.

   So the instrument is the thing a technician actually reads when ports
   matter: a firewall rule table. One rule is highlighted and the rest are
   real rules on the same device, and the questions are the ones you would
   have to answer before touching any of them — what did that rule allow,
   what stops working if it goes, why does this service use the transport it
   uses, and what else has to be open before the thing works end to end.

   That last question is the one the objective is really about. Knowing that
   443 is HTTPS is a fact. Knowing that a browser cannot reach 443 without 53
   answering first is the difference between a technician and a flashcard.
   ===================================================================== */

export const SERVICES = [
  {
    key: "ftp", name: "FTP", port: "20 and 21", transport: "TCP",
    why: "TCP, because a file that arrives with a hole in it is not a file. Every byte is acknowledged and anything lost is sent again.",
    purpose: "Moving files to and from a server, in the clear",
    breaks: "File transfers to the server stop. Nothing else does",
    plaintext: true, counterpart: "Use SFTP over SSH on 22, or FTPS — FTP itself has no encryption to turn on",
    needs: "Two ports rather than one: 21 carries the commands and 20 carries the data, which is why it is the protocol firewalls hate",
    lookalike: "tftp",
    lookalikeWhy: "One letter apart and almost nothing else in common. This one is TCP, uses two ports, and authenticates; the trivial one is UDP, uses one port, and does not."
  },
  {
    key: "tftp", name: "TFTP", port: "69", transport: "UDP",
    why: "UDP, because it was built to be small enough to fit in a boot ROM. It does its own crude acknowledgement rather than asking the transport for one.",
    purpose: "Pulling a configuration or a boot image onto a device that barely has an operating system yet",
    breaks: "Network devices stop pulling their configurations and machines stop network-booting",
    plaintext: true, counterpart: "There is no secure version. It has no authentication at all, which is why it belongs on a management network and nowhere else",
    needs: "Nothing else, which is the point — it is meant to work on a device that has almost nothing configured",
    lookalike: "ftp",
    lookalikeWhy: "The name says it is a simpler FTP and that is misleading: it is a different transport, a different port and no authentication. You would never use it to move a user's files."
  },
  {
    key: "ssh", name: "SSH", port: "22", transport: "TCP",
    why: "TCP, because it is an interactive session and a dropped keystroke would be a corrupted command.",
    purpose: "An encrypted command line on a remote machine, and the tunnel that SFTP and SCP run inside",
    breaks: "Remote administration of servers and network devices stops, and so does any file transfer riding on it",
    plaintext: false, counterpart: "This IS the secure one — it is what replaced Telnet, and the replacement is the whole reason it exists",
    needs: "Nothing beyond reachability, though key management is what decides whether it is actually secure",
    lookalike: "telnet",
    lookalikeWhy: "They do the same job from the user's side: a command line on a machine somewhere else. One encrypts the session and one sends the password across the network in readable text."
  },
  {
    key: "telnet", name: "Telnet", port: "23", transport: "TCP",
    why: "TCP, for the same reason as SSH — it is an interactive session and every character has to arrive.",
    purpose: "An unencrypted command line on a remote machine, and a quick way to test whether a port is open at all",
    breaks: "Very little that should still be running. Its remaining honest use is checking whether something is listening",
    plaintext: true, counterpart: "SSH on 22 does the same job encrypted, and there is no good reason to leave this one open",
    needs: "Nothing, which is part of the problem",
    lookalike: "ssh",
    lookalikeWhy: "Identical experience, opposite security. If you find 23 open on anything reachable from outside, that is a finding rather than a configuration."
  },
  {
    key: "smtp", name: "SMTP", port: "25", transport: "TCP",
    why: "TCP, because mail is delivered once and has to be complete when it lands.",
    purpose: "Server-to-server mail delivery — the transport between mail systems, not between a client and its own server",
    breaks: "Mail stops flowing between servers. Users may still read what is already in their mailboxes",
    plaintext: true, counterpart: "587 with STARTTLS for clients submitting mail, or 465 for implicit TLS",
    needs: "DNS on 53, because the sending server has to look up the recipient domain's mail record before it can deliver anything",
    lookalike: "submission",
    lookalikeWhy: "Both carry mail outward and people call both of them SMTP. This one is servers talking to servers; the other is a user's client handing mail to its own server, and providers block this one from client networks for exactly that reason."
  },
  {
    key: "submission", name: "SMTP submission", port: "587", transport: "TCP",
    why: "TCP, same reasoning as any mail transport — delivery has to be complete and acknowledged.",
    purpose: "A mail client handing outgoing mail to its own server, authenticated and encrypted with STARTTLS",
    breaks: "Users can receive mail and cannot send any",
    plaintext: false, counterpart: "This IS the client-side secure one. 25 is the server-to-server port and is not for clients",
    needs: "An authentication mechanism, and a retrieval protocol alongside it — sending and receiving are separate services on separate ports",
    lookalike: "smtp",
    lookalikeWhy: "Same protocol, different job and a different port. A user who cannot send but can receive has a problem on this port; a whole organisation not receiving has a problem on 25."
  },
  {
    key: "dns", name: "DNS", port: "53", transport: "UDP, and TCP",
    why: "UDP for ordinary lookups, because a query and its answer fit in one small packet and asking again is cheaper than setting up a connection. TCP when the answer is too big for that, and for zone transfers.",
    purpose: "Turning names into addresses, before almost anything else on a network can happen",
    breaks: "Everything, in a way that looks like everything. Addresses still work and no name does",
    plaintext: true, counterpart: "DNS over TLS on 853, or DNS over HTTPS riding 443 — which is exactly why a private DNS setting can break a captive portal",
    needs: "Nothing before it, which is why it is the first thing to check when nothing works",
    lookalike: "dhcp",
    lookalikeWhy: "Both are UDP, both are infrastructure nobody notices until they stop, and both produce faults that look like the whole network is down. One hands out addresses; the other turns names into them."
  },
  {
    key: "dhcp", name: "DHCP", port: "67 and 68", transport: "UDP",
    why: "UDP, because a client asking for an address does not have one yet — it has to broadcast, and you cannot open a connection from an address you do not have.",
    purpose: "Handing out addresses, masks, gateways and name-server addresses to clients as they arrive",
    breaks: "New machines get a self-assigned address and reach nothing. Machines already leased carry on until their lease expires",
    plaintext: true, counterpart: "No encrypted version in common use; it is protected by controlling who can answer on the segment",
    needs: "A relay if the server is on a different subnet, because a broadcast does not cross a router on its own",
    lookalike: "dns",
    lookalikeWhy: "The two UDP services everything depends on, and the failure modes are told apart by one question: does a static address fix it? If yes, this one. If no, the other."
  },
  {
    key: "http", name: "HTTP", port: "80", transport: "TCP",
    why: "TCP, because a page assembled out of packets that arrived in the wrong order is not a page.",
    purpose: "Unencrypted web traffic, and the redirect that sends a browser to the encrypted version",
    breaks: "Plain web pages, and the redirect that would have taken a user to the secure site",
    plaintext: true, counterpart: "HTTPS on 443, which is where essentially all of it should go",
    needs: "DNS on 53 first — a browser cannot connect to a name it cannot resolve",
    lookalike: "https",
    lookalikeWhy: "Same protocol, one of them wrapped in TLS. Closing 80 entirely surprises people, because it is the port that carries the redirect telling the browser to go to 443."
  },
  {
    key: "https", name: "HTTPS", port: "443", transport: "TCP",
    why: "TCP, because it is HTTP inside TLS and both of them need every byte in order.",
    purpose: "Encrypted web traffic, and increasingly the tunnel that everything else hides inside",
    breaks: "Essentially all modern web traffic, and any application quietly using it as a transport",
    plaintext: false, counterpart: "This IS the encrypted one. HTTP on 80 is what it replaced",
    needs: "DNS on 53, and a certificate the client trusts — a name that resolves to the wrong host fails here rather than at the lookup",
    lookalike: "http",
    lookalikeWhy: "One digit apart in conversation and completely different on the wire. If a site loads on one and not the other, you are looking at a certificate or a redirect, not at connectivity."
  },
  {
    key: "pop3", name: "POP3", port: "110", transport: "TCP",
    why: "TCP, because a message downloaded with a piece missing is a corrupted mailbox.",
    purpose: "Downloading mail to one device, traditionally removing it from the server as it goes",
    breaks: "That client stops collecting mail. Mail keeps arriving on the server",
    plaintext: true, counterpart: "POP3S on 995",
    needs: "A separate outgoing service — this only retrieves, and a user who can read mail and not send it has one working and one not",
    lookalike: "imap",
    lookalikeWhy: "Both retrieve mail and users cannot tell them apart. This one pulls messages down to one device; the other leaves them on the server so several devices see the same mailbox. Pick this one for a user with three devices and they will lose track of their mail."
  },
  {
    key: "imap", name: "IMAP", port: "143", transport: "TCP",
    why: "TCP, because mailbox state is being synchronised and it has to be exact.",
    purpose: "Reading mail that stays on the server, so every device sees the same mailbox and the same folders",
    breaks: "Mail clients stop syncing. Webmail is unaffected, which is a useful thing to check",
    plaintext: true, counterpart: "IMAPS on 993",
    needs: "A separate outgoing service on 587, for the same reason as POP3",
    lookalike: "pop3",
    lookalikeWhy: "The choice between them is about how many devices the user has, not about which is newer. Both are plaintext on these ports and both have an encrypted twin on a different one."
  },
  {
    key: "imaps", name: "IMAPS", port: "993", transport: "TCP",
    why: "TCP, and wrapped in TLS from the first byte rather than upgrading partway through.",
    purpose: "A server-side mailbox read over a channel encrypted from the first byte, so several devices share one view of it",
    breaks: "Mail clients configured for the secure port stop syncing while webmail carries on working",
    plaintext: false, counterpart: "This IS the encrypted one; 143 is the plaintext original",
    needs: "A certificate the client trusts, and an outgoing service alongside it",
    lookalike: "pop3s",
    lookalikeWhy: "Two encrypted mail-retrieval ports three digits apart, and choosing the wrong one gives a client that cannot connect at all. The same server-versus-device distinction applies as it does to the plaintext pair."
  },
  {
    key: "pop3s", name: "POP3S", port: "995", transport: "TCP",
    why: "TCP, wrapped in TLS from the first byte.",
    purpose: "Downloading mail to a single device over an encrypted channel",
    breaks: "Clients set up for secure POP stop collecting, while anything on IMAP is unaffected",
    plaintext: false, counterpart: "This IS the encrypted one; 110 is the plaintext original",
    needs: "A certificate the client trusts, and a separate outgoing service",
    lookalike: "imaps",
    lookalikeWhy: "Both secure, both retrieval, both mail. The number decides which model the user gets, and getting it wrong on a multi-device user is how mail starts disappearing from phones."
  },
  {
    key: "snmp", name: "SNMP", port: "161 and 162", transport: "UDP",
    why: "UDP, because it is monitoring: a lost poll is repeated in thirty seconds and a connection per device per poll would cost more than the data is worth.",
    purpose: "Polling devices for status on 161, and receiving the traps they send unprompted on 162",
    breaks: "Monitoring goes blind. Everything keeps working and nobody can see that it is",
    plaintext: true, counterpart: "Version 3 adds authentication and encryption; the earlier versions send a community string in the clear",
    needs: "Two directions — you poll outward on 161 and they send traps inward on 162, and forgetting the second is why traps go missing",
    lookalike: "syslog",
    lookalikeWhy: "Both UDP, both monitoring, both silently unnoticed until an outage nobody was alerted about. This one is polled and answers; the other is pushed and never replies."
  },
  {
    key: "syslog", name: "Syslog", port: "514", transport: "UDP",
    why: "UDP, deliberately: a device in trouble should not have to complete a handshake before it can report that it is in trouble.",
    purpose: "Devices sending log messages to a collector, one way, with no acknowledgement",
    breaks: "Logs stop arriving and nothing tells you. The devices carry on sending into nothing",
    plaintext: true, counterpart: "Syslog over TLS on 6514, where the messages matter enough to protect",
    needs: "Nothing from the device's side, which is exactly why a failure here is silent",
    lookalike: "snmp",
    lookalikeWhy: "The pairing to know is that one of these is a conversation and one is a monologue. A collector that has stopped receiving gives you no error either way."
  },
  {
    key: "ldap", name: "LDAP", port: "389", transport: "TCP",
    why: "TCP, because a directory query and its result are a transaction and both ends need the whole of it.",
    purpose: "Looking up users, groups and computers in a directory",
    breaks: "Sign-ins that depend on the directory start failing, and address books stop resolving",
    plaintext: true, counterpart: "LDAPS on 636, or StartTLS on 389 itself",
    needs: "DNS, because clients find their directory servers by looking up service records rather than by being told an address",
    lookalike: "ldaps",
    lookalikeWhy: "Same directory, same queries, one encrypted. Credentials cross this one in a form worth reading, which is why the secure port is the one that should be open."
  },
  {
    key: "ldaps", name: "LDAPS", port: "636", transport: "TCP",
    why: "TCP, wrapped in TLS from the first byte.",
    purpose: "Directory lookups over a channel encrypted from the first byte",
    breaks: "Anything configured for secure directory access stops authenticating",
    plaintext: false, counterpart: "This IS the encrypted one; 389 is the plaintext original",
    needs: "A certificate chain the clients trust — this is the one that breaks when a certificate authority is replaced",
    lookalike: "ldap",
    lookalikeWhy: "Choosing between them is not a preference. One puts credentials on the wire in readable form and the other does not."
  },
  {
    key: "smb", name: "SMB", port: "445", transport: "TCP",
    why: "TCP, because file and printer sharing is bulk data that has to arrive intact and in order.",
    purpose: "Windows file and printer sharing, and the transport that mapped drives and shared print queues run on",
    breaks: "Mapped drives disappear and shared printers stop accepting jobs",
    plaintext: true, counterpart: "Modern versions encrypt in transit as an option; the port does not change when they do",
    needs: "Name resolution to find the server, and directory authentication to get into anything on it",
    lookalike: "rdp",
    lookalikeWhy: "Both are how Windows reaches another Windows machine and both are firewalled at the site edge for the same reason. One gives you the files and the other gives you the desktop."
  },
  {
    key: "rdp", name: "RDP", port: "3389", transport: "TCP",
    why: "TCP, because it is an interactive session carrying screen, keyboard and mouse, and a dropped packet is a visible glitch.",
    purpose: "Taking over a Windows desktop remotely, screen and input together",
    breaks: "Remote desktop sessions stop connecting. Everything else on the machine carries on",
    plaintext: false, counterpart: "Encrypted by default now, but exposing it to the internet is still how a great many networks get broken into",
    needs: "The service enabled and the user permitted — the port being open is necessary and nowhere near sufficient",
    lookalike: "smb",
    lookalikeWhy: "Two ports that should almost never face the internet, for the same reason and with the same consequences. Knowing which one is which decides what you have actually exposed."
  },
  {
    /* NetBIOS is on 2.1 and was nowhere in this build, which mattered more
       than a missing row: it is the thing a student meets when an old share
       resolves by name on one subnet and not on another, and without it they
       have no explanation for that at all. */
    key: "netbios", name: "NetBIOS", port: "137, 138 and 139", transport: "TCP and UDP",
    why: "Both, and for different jobs. Name registration and lookup go out as UDP broadcasts on " +
      "137 and 138 because they are asking the whole subnet a question; the session on 139 is TCP " +
      "because it carries the actual data.",
    purpose: "The older Windows naming and session service \u2014 how a machine announces its name " +
      "on the local network and how another one finds it without asking a server",
    breaks: "Machines stop seeing each other by name on the local network, though anything with " +
      "an address or a DNS entry keeps working. Browsing the network neighbourhood empties out",
    plaintext: true,
    counterpart: "There is none. The answer is to stop relying on it \u2014 modern sharing resolves " +
      "by DNS and connects on 445 without it",
    needs: "Nothing beyond the local subnet, which is exactly its limitation: broadcasts do not " +
      "cross a router, so it works in one office and stops at the boundary",
    lookalike: "smb",
    lookalikeWhy: "They do the same job in a student's head \u2014 'Windows file sharing' \u2014 and " +
      "they are firewalled together. But one is how the machine is FOUND and the other is how the " +
      "files are FETCHED. A share that works by address and fails by name has lost the first and " +
      "still has the second, and blocking 445 looks identical to blocking 139 until you test with " +
      "an address."
  },
];

const BY = {};
SERVICES.forEach(function (s) { BY[s.key] = s; });
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
  rnd(SERVICES.filter(function (c) { return c.transport === D.item.transport; })).forEach(take);
  rnd(SERVICES).forEach(take);
  return out.slice(0, n);
}

/* ---------------------------------------------------------------------
   The instrument: a firewall rule table.

   The highlighted rule is the item. The rest are real rules that would
   plausibly be on the same device, and they are noise in the same sense as
   everything else in this build — every one of them is a service that
   exists, so reading the wrong row costs you the question.
   --------------------------------------------------------------------- */
export function firewallRules(D, rnd) {
  var it = D.item;
  var others = rnd(SERVICES.filter(function (s) { return s.key !== it.key; })).slice(0, 5);
  var rows = others.map(function (s) {
    return { port: s.port, transport: s.transport, action: "Allow",
      dir: s.key === "dhcp" || s.key === "snmp" ? "Inbound" : "Outbound", subject: false };
  });
  rows.splice(rnd([0, 1, 2, 3])[0] % (rows.length + 1), 0, {
    port: it.port, transport: it.transport, action: "Allow",
    dir: it.key === "dhcp" || it.key === "snmp" || it.key === "syslog" ? "Inbound" : "Outbound",
    subject: true
  });
  /* The renderer takes a spec now, so this describes its own instrument
     rather than relying on the page to know it is a firewall. */
  return {
    caption: "Perimeter firewall \u2014 outbound and inbound rules, as found. One rule is " +
      "highlighted. Everything else on this device is a real rule doing a real job.",
    columns: ["Port", "Transport", "Direction", "Action"],
    rows: rows.map(function (r) {
      return { subject: r.subject, cells: [r.port, r.transport, r.dir, r.action] };
    })
  };
}

export function serviceQuestions(D, rnd) {
  var it = D.item;
  var qs = [];

  qs.push({
    id: "which",
    ask: "What does the highlighted rule allow?",
    hint: "Read the port and the transport together. Several services share a number across the two transports, and the pair is what identifies it.",
    answer: it.name,
    choices: [it.name].concat(pick(D, "name", 3, rnd).map(function (c) { return c.name; })),
    why: function (chosen) {
      if (chosen === it.name) return it.purpose + ". " + it.lookalikeWhy;
      /* Describe the wrong choice rather than naming it, the way the other
         two drills do. Several names in this pool nest inside each other \u2014
         HTTP inside HTTPS, POP3 inside POP3S \u2014 so naming one is one
         keystroke away from handing over another. */
      var o = SERVICES.filter(function (c) { return c.name === chosen; })[0];
      return o ? "That one runs on " + o.port + " over " + o.transport +
        ", and it is for " + o.purpose.charAt(0).toLowerCase() + o.purpose.slice(1) +
        ". Read the highlighted row again." : "That is not what the rule says.";
    }
  });

  qs.push({
    id: "transport",
    ask: "Why does this service use that transport?",
    hint: "The question is never “because the standard says so”. Ask what the service would lose if it used the other one.",
    answer: it.why,
    choices: [it.why].concat(pick(D, "why", 3, rnd).map(function (c) { return c.why; })),
    why: function (chosen) {
      if (chosen === it.why) {
        return "Exactly. This is the whole of 2.1 in one sentence: the transport is chosen for what " +
          "the service needs, and knowing why tells you how it fails.";
      }
      return "That is the reasoning behind a different service's choice. Work from what this one is " +
        "actually doing — whether it can afford to lose a packet, and whether it has an address yet.";
    }
  });

  qs.push({
    id: "breaks",
    ask: "You remove this rule. What stops working?",
    hint: "Be precise about the blast radius. Some of these take one application down and some take the site down.",
    answer: it.breaks,
    choices: [it.breaks].concat(pick(D, "breaks", 3, rnd).map(function (c) { return c.breaks; })),
    why: function (chosen) {
      if (chosen === it.breaks) return "Right — " + it.breaks + ". Knowing that before you close a port is the difference between a change and an outage.";
      return "That is what a different rule was holding up. Go back to what this service is for.";
    }
  });

  qs.push({
    id: "needs",
    ask: "What else has to work before this does?",
    hint: "Almost nothing on a network stands alone. Work out what has to happen before the first packet of this service is even sent.",
    answer: it.needs,
    choices: [it.needs].concat(pick(D, "needs", 3, rnd).map(function (c) { return c.needs; })),
    why: function (chosen) {
      if (chosen === it.needs) {
        return "Yes. " + it.needs + " Knowing that 443 is HTTPS is a fact; knowing that a browser " +
          "cannot reach it without 53 answering first is the part that fixes tickets.";
      }
      return "That is another service's dependency. This is the question that separates memorising " +
        "a port list from being able to use one.";
    }
  });

  qs.push({
    id: "secure",
    ask: "Is it encrypted, and what is the other half of the pair?",
    hint: "Most of these come in plaintext and encrypted versions on different ports. A few are one or the other and nothing else.",
    answer: it.counterpart,
    choices: [it.counterpart].concat(pick(D, "counterpart", 3, rnd).map(function (c) { return c.counterpart; })),
    why: function (chosen) {
      if (chosen === it.counterpart) {
        return (it.plaintext
          ? "Correct, and note that this one is in the clear. "
          : "Correct, and this is the encrypted half. ") + it.counterpart + ".";
      }
      return "That is a different service's pairing. The plaintext and encrypted versions of a " +
        "protocol live on different ports, and confusing the two is how a client ends up unable to " +
        "connect at all.";
    }
  });

  qs.push({
    id: "confused",
    ask: "Which service does this get confused with?",
    hint: "Not the one that does something similar — the one that gets typed into a firewall rule by mistake.",
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
      return "That one is distinguishable at a glance. The pairing this question wants is the one " +
        "that gets the wrong rule written.";
    }
  });

  return qs;
}
