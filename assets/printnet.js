/* =====================================================================
   Field Service Center — printer networking, sharing and drivers

   The two printer tracks in this build are about the machine: rollers,
   fusers, heads, the seven-stage imaging process. Every one of those
   tickets assumes the job reached the printer.

   This track is about everything between the user and the machine, which
   is where most printer calls actually live. A printer that prints its own
   configuration page perfectly and will not print a user's document is not
   a printer fault, and the whole skill here is working out which link in
   the chain broke:

     the application → the driver → the local queue → the port →
     the network → the device's own queue → the device

   Seven places, and the caller always says the same six words about all of
   them: "the printer isn't working". Half of these tickets are settings,
   two are the device's own address, two are scanning rather than printing,
   and one is a deployment decision somebody made years ago that has been
   quietly costing the site a call a month ever since.

   Step four carries something none of the other tracks have: a DEPLOYMENT.
   Fixing today's fault is the first half; deciding how this device should
   have been put in so the fault stops recurring is the second, and it is
   graded against the site rather than against a rule of thumb.
   ===================================================================== */

/* =====================================================================
   The links in the chain, for the locate question
   ===================================================================== */
export const PRINTNET_PARTS = [
  {
    key: "workstation", label: "The user's workstation",
    role: "Holds the driver, the local queue and the port definition. Three separate things that all live here and all get called 'the printer'.",
    fails: "A wrong driver, a stopped spooler, a port pointing at an address that moved, or a default nobody looked at.",
    seen: "The queue on this machine is holding jobs that never left it."
  },
  {
    key: "usbcable", label: "The USB cable and its port",
    role: "The direct connection, on the devices that have one. Simple, reliable, and serves exactly one machine.",
    fails: "Rarely, and when it does the device disappears from the machine entirely rather than misbehaving.",
    seen: "Enumerated, seated, and the device is listed on the machine it is plugged into."
  },
  {
    key: "switch", label: "The switch and the VLAN boundary",
    role: "Carries the job from the workstation to the device — and decides what can see what.",
    fails: "Not by breaking. By doing exactly what it was configured to do to traffic that was never meant to cross it.",
    /* True on BOTH faults that point here: the one where broadcast discovery
       does not cross the boundary, and the one where a rule drops the print
       port across it. Naming only the first made this note a lie the day the
       second was written. */
    seen: "The port is up and the device answers on its address. What is being stopped is being stopped at this boundary, and on purpose."
  },
  {
    key: "printer", label: "The device itself",
    role: "Holds its own address, its own queue, its own user list and its own scan settings. It is a computer.",
    fails: "Usually in its configuration rather than its mechanism, and its own test page will tell you which.",
    seen: "It prints its own configuration page perfectly on demand."
  },
  {
    key: "server", label: "The print server",
    role: "Holds the shared queues, the drivers everyone downloads, and every job in flight for the whole site.",
    fails: "One stuck job at the head of a queue stops everything behind it, for everybody.",
    seen: "The service is running and the queue behind the held job is backing up."
  },
  {
    key: "ap", label: "The wireless access point",
    role: "How a device gets on the network without a cable, and one more thing between a job and a printer.",
    fails: "By being a network the device is on and the workstations are not.",
    seen: "Associated, full signal, nothing unusual in its log."
  }
];

/* =====================================================================
   The faults
   ===================================================================== */
export const PRINTNET_FAULTS = [
  {
    key: "wrongdriver", part: "the wrong page description language", target: "workstation",
    objective: "3.7 + 5.6", link: "driver", test: "selfpage",
    root: "The workstation has a PostScript driver installed for a device that only speaks PCL. The job is being sent in a language the printer cannot read, so it prints the language.",
    observable: "pages and pages of code instead of the document, and the printer's own configuration page is perfect",
    symptoms: ["It's printing gibberish", "Pages and pages of it",
      "It was fine before the machine was rebuilt"],
    fixes: "Install the correct driver for this model and this language, then print the user's own job to confirm.",
    wrongReflex: "printer",
    wrongWhy: "It prints its own configuration page perfectly, which proves the engine, the toner, the paper path and the formatter all work. What it cannot do is understand what this one workstation is sending it.",
    evidence: "Perfect output from the device's own configuration page and code from every job sent to it"
  },
  {
    key: "dhcpprinter", part: "an address that moved", target: "printer",
    objective: "3.7 + 5.6", link: "network", test: "netpage",
    root: "The device is on DHCP with no reservation. It took a different address after a power cut, and every workstation's port is still pointing at the old one.",
    observable: "nobody can print to it and it is on the network, answering, and printing its own pages",
    symptoms: ["It stopped after the power cut", "It says it's offline on my machine",
      "The screen on the printer looks normal"],
    fixes: "Reserve the address in DHCP so it stops moving, then correct the port on the workstations — or point the ports at its hostname and let DNS follow it.",
    wrongReflex: "driver",
    wrongWhy: "The driver is unchanged and correct, and reinstalling it makes no difference because the port underneath it is still aimed at an address nothing is listening on.",
    evidence: "The device answering on one address while every workstation's port names a different one"
  },
  {
    key: "spooler", part: "a stopped print spooler", target: "workstation",
    objective: "3.7 + 5.6", link: "queue", test: "queuecheck",
    root: "The print spooler service on this workstation has stopped. Jobs go into a queue that nothing is servicing.",
    observable: "one user cannot print to anything at all, and everybody else prints to the same devices normally",
    symptoms: ["Nothing prints at all now", "It's not just one printer, it's all of them",
      "Everyone else is fine"],
    fixes: "Clear the queue, restart the spooler, and set it to restart itself on failure. If it keeps stopping, the job that kills it is the next thing to find.",
    wrongReflex: "network",
    wrongWhy: "The same user reaches every network resource they need and every colleague prints to the same devices. A fault that affects one machine and every printer on it is on that machine.",
    evidence: "Every printer failing for one user and no printer failing for anyone else, with the spooler service stopped"
  },
  {
    key: "sharedoffline", part: "a printer shared off somebody's workstation", target: "workstation",
    objective: "3.7 + 5.6", link: "queue", test: "whosepc",
    root: "The device is connected to one person's workstation and shared from it. That workstation is switched off at night and whenever its owner is away, and everybody downstream loses the printer with it.",
    observable: "the printer is unavailable to the whole team at exactly the times one particular person is not in",
    symptoms: ["It only works when Dana's in", "It's fine in the mornings",
      "It's been like this since we got it"],
    fixes: "Put the device on the network in its own right, with a reserved address and a queue on each workstation or on the print server. Sharing a device off a desk is a deployment decision, and this is what it costs.",
    wrongReflex: "workstation",
    wrongWhy: "There is nothing wrong with that workstation and nothing you can do to it that fixes this. Leaving it switched on is not a fix — it is a request that somebody change their habits to work around an architecture.",
    evidence: "Availability that follows one workstation's power state exactly, on a device with a network port nobody has used"
  },
  {
    key: "defaultprinter", part: "the wrong default device", target: "none",
    objective: "3.7 + 5.6", link: "driver", test: "wherewent",
    root: "The default printer is a PDF writer that Windows selected, so every job the user sends without thinking about it goes to a file instead of a device.",
    observable: "jobs vanish without error and the printer never wakes up, and printing deliberately to it works perfectly",
    symptoms: ["It just does nothing", "No error, nothing",
      "It works if I pick it from the list"],
    fixes: "Set the correct default and turn off the setting that lets Windows manage it. There is nothing wrong with the printer, the driver, the network or the device.",
    wrongReflex: "queue",
    wrongWhy: "The queue is empty because nothing was ever sent to it. Jobs that reach a queue and stop are a queue fault; jobs that never arrive went somewhere else, and finding out where is one look at the recent documents list.",
    evidence: "Jobs completing successfully to a file with the device's own queue empty throughout"
  },
  {
    key: "securedprint", part: "release printing the user cannot release", target: "printer",
    objective: "3.7 + 5.6", link: "device", test: "devicequeue",
    root: "The site uses badge release, and this user's badge was never enrolled against their account. Their jobs sit on the device waiting for a release that cannot happen.",
    observable: "jobs leave the workstation and reach the device, sit in its held queue, and expire without printing",
    symptoms: ["It says it printed but nothing comes out", "It works for everyone else",
      "I'm new"],
    fixes: "Enrol the badge against the account, then have the user release a job while you watch. Check the joiner process, because this will be true of the next new starter as well.",
    wrongReflex: "driver",
    wrongWhy: "The job reaches the device intact and sits in its held queue with the correct owner on it, which clears the driver, the port and the whole network path in one look at one screen.",
    evidence: "Jobs arriving in the device's held queue under the right name and expiring unreleased"
  },
  {
    key: "scanemail", part: "scan to email after the mail server changed", target: "printer",
    objective: "3.7 + 5.6", link: "device", test: "scanlog",
    root: "The mail server now requires authenticated submission on a different port. The device is still configured for anonymous relay on the old one.",
    observable: "printing is perfect and every scan to email fails, with copying and scan to folder working normally",
    symptoms: ["Scanning to email stopped", "Printing is fine",
      "It happened when they moved the email"],
    fixes: "Set the device's SMTP server, port and credentials to what the mail platform now requires, and send one scan to a real address while you are standing there.",
    wrongReflex: "scanner",
    wrongWhy: "The scanner is producing a perfect image — scan to folder proves it, and so does the copier. What has failed is what the device does with the file after it has scanned it.",
    evidence: "Scan to folder and copying working with scan to email failing on authentication"
  },
  {
    key: "scanfolder", part: "scan to folder after a password change", target: "printer",
    objective: "3.7 + 5.6", link: "device", test: "scanlog",
    root: "The device signs in to the file share with a service account, and that account's password was changed at the last policy review. Nobody told the printer.",
    observable: "scan to folder fails with an access error while scan to email and printing are both fine",
    symptoms: ["Scan to the shared drive stopped", "Email scanning is fine",
      "IT changed some passwords last month"],
    fixes: "Update the stored credentials on the device, and get that service account onto a policy that does not expire it — or into a password manager somebody actually reads.",
    wrongReflex: "permissions",
    wrongWhy: "The folder's permissions are unchanged and the account still has rights to it. What has changed is the password the device is presenting, and an account with perfect rights and the wrong password is refused exactly like one with no rights at all.",
    evidence: "An authentication failure against a share whose permissions are unchanged, dating from a password policy review"
  },
  {
    key: "discovery", part: "discovery that does not cross a subnet", target: "switch",
    objective: "3.7 + 5.6", link: "network", test: "pingprinter",
    root: "The device is being added by discovery, and discovery is broadcast traffic. The workstations are on a different subnet from the printers, and broadcasts do not cross that boundary.",
    observable: "the printer cannot be found by browsing from one floor and is found instantly from another, and it answers on its address from both",
    symptoms: ["It doesn't show up in the list", "It's in the list downstairs",
      "The IT person said it's on the network"],
    fixes: "Add it by a standard TCP/IP port to its reserved address or its hostname rather than by discovery. Discovery is a convenience on a flat network and nothing more.",
    wrongReflex: "printer",
    wrongWhy: "It answers on its address from the machine that cannot see it in the list, which proves the whole network path works. What does not work is the mechanism being used to find it, and that mechanism was never going to.",
    evidence: "A device that answers by address from a workstation that cannot discover it by browsing"
  },
  {
    key: "queuestuck", part: "a stuck job at the head of a server queue", target: "server",
    objective: "3.7 + 5.6", link: "queue", test: "queuecheck",
    root: "A malformed job has stalled at the head of the shared queue on the print server. Every job submitted since is sitting behind it, for everyone.",
    observable: "nobody in the building can print to that device, and the device itself is idle and healthy",
    symptoms: ["Nobody can print", "There's about forty things in the queue",
      "The printer's just sitting there"],
    fixes: "Delete the stalled job, let the queue drain, and find out what produced it — because whoever sent it will send another one on Thursday.",
    wrongReflex: "printer",
    wrongWhy: "The device is idle, online and prints its own pages. It is not refusing work; no work is reaching it, because everything is stacked up behind one job on a server nobody has looked at.",
    evidence: "A device idle and online with a server queue backed up behind a single job in an error state"
  },
  {
    key: "finishing", part: "a finisher the driver has never been told about", target: "workstation",
    objective: "3.7 + 5.6", link: "driver", test: "optionscheck",
    root: "The duplexer and the stapling finisher are fitted and working. The driver on this workstation was installed without the installed options declared, so everything the accessories can do is greyed out before the job is ever sent.",
    observable: "duplex and stapling greyed out on one machine while a colleague sends stapled double-sided work to the same device all day",
    symptoms: ["The stapler doesn't work", "It's greyed out, I can't even pick it",
      "It staples fine from Rosa's machine"],
    fixes: "Declare the installed options in the driver's device settings, or let it update itself from the device. Then send one stapled duplex job to prove it.",
    wrongReflex: "device",
    wrongWhy: "The finisher is fitted, the device's own configuration page lists it, and it staples all day for everybody whose driver knows it is there. Nothing about the hardware is in question.",
    evidence: "A device reporting a duplexer and a finisher on its own page against a driver whose device settings list neither"
  },
  {
    key: "portblocked", part: "the print port closed by a new rule", target: "switch",
    objective: "3.7 + 5.6", link: "network", test: "portprobe",
    root: "A security rollout put an access list between the workstation subnet and the printer subnet that permits web management and nothing else. The raw print port is dropped, so every job sits in the queue in an error state while the device looks perfectly healthy.",
    observable: "the device answers by address and its web page opens from the same machine that cannot print a single job to it",
    symptoms: ["It says error - printing", "I can open the printer's web page though",
      "It started the week they did the security work"],
    fixes: "Permit the raw print port from the workstation subnet to the printer subnet. The device, the driver, the queue and the port are all correct and none of them can do anything about a rule between them.",
    wrongReflex: "device",
    wrongWhy: "It prints its own configuration page and serves its own web interface to the machine that cannot print to it. A device answering on one port and refusing on another is not a broken device.",
    evidence: "Ping and the management page succeeding while the print port is refused, from the same workstation"
  },
  {
    key: "ipconflict", part: "a static address inside the DHCP scope", target: "printer",
    objective: "3.7 + 5.6", link: "network", test: "arpcheck",
    root: "The device was given a static address that sits inside the DHCP scope. The scope has since leased the same address to a laptop, and whichever of the two answers first gets the traffic.",
    observable: "printing that works about half the time, from everybody, with nothing changing in between",
    symptoms: ["It works sometimes", "It was fine yesterday afternoon",
      "It's not one person, it's everyone, and not all the time"],
    fixes: "End the conflict rather than the symptom: move the device to a reservation, or move its static address outside the scope, then release the laptop's lease so it takes a clean one.",
    wrongReflex: "driver",
    wrongWhy: "Intermittent is the tell, and it rules the driver out on its own. A wrong driver is wrong every single time; an address two machines answer on is wrong only when the wrong one answers first.",
    evidence: "Two different hardware addresses answering on one address, changing between one check and the next"
  },
  {
    key: "scansize", part: "a scan too big for the mail system to accept", target: "printer",
    objective: "3.7 + 5.6", link: "device", test: "twoscans",
    root: "Scan to email is configured correctly and works. The device's default is six hundred dots per inch in colour, and a long document at that setting produces a file past the attachment limit, which the mail system refuses after the device has finished sending it.",
    observable: "one-page scans arriving within seconds and the twenty-page one never arriving, with nothing on the panel to say so",
    symptoms: ["Big scans don't come through", "The short ones are fine",
      "It doesn't tell me anything's wrong"],
    fixes: "Set the scan default to something that produces a sane file — three hundred dots per inch, greyscale where colour is not needed, compressed PDF — and send long documents to a folder or a link rather than as an attachment.",
    wrongReflex: "network",
    wrongWhy: "The same device, the same path and the same mail server delivered the one-page scan a minute earlier. A path that carries a small file and refuses a big one is a size limit, and a size limit is a setting.",
    evidence: "Short scans delivered and long ones refused by the mail system for size, on a destination that is otherwise working"
  },
  {
    key: "traymedia", part: "a tray telling the device the wrong thing is in it", target: "printer",
    objective: "3.7 + 5.6", link: "device", test: "traytest",
    root: "Tray two holds plain paper and is set on the device as letterhead. The driver asks for plain, the device will not take paper from a tray it believes is something else, and every job either prompts at the panel or falls through to the multipurpose tray.",
    observable: "a device with full trays asking for paper on every job, or printing the whole day's work on headed paper",
    symptoms: ["It keeps asking for paper", "The trays are full, I checked",
      "Half of it came out on the headed stuff"],
    fixes: "Set each tray's media type and size on the device to what is actually in it, and check the other trays while the panel is open. The driver was right; the device had been told wrong.",
    wrongReflex: "queue",
    wrongWhy: "The job reached the device — that is precisely why the panel is asking for paper. A queue fault is a job that never got that far, and this one is standing at the device waiting for permission.",
    evidence: "Trays that are physically full against a media type on the device that does not match what is in them"
  },
  {
    /* The cable and the access point were both on this bench, with finished
       right-answer text written for them, and no ticket could ever be about
       either. Two links in a chain whose whole exercise is naming the link. */
    key: "usbfailed", part: "the cable on a directly attached device", target: "usbcable",
    objective: "3.6 + 5.6", link: "network", test: "swapcable",
    root: "The cable between the workstation and the device has failed. This one is not on the network at all — the cable IS the path, and it is the whole of it.",
    observable: "the device prints its own pages perfectly and the workstation does not see it at all, on a machine that has never been on the network",
    symptoms: ["It's just stopped seeing it", "The printer's own test page is fine",
      "It's plugged straight in, there's no network on it"],
    fixes: "Fit a known-good cable and confirm the device enumerates. If it is going to live at that desk, use a cable short enough to be within spec and route it where a chair cannot reach it.",
    wrongReflex: "driver",
    wrongWhy: "A driver problem leaves the device visible and the output wrong. This device is not there at all — the workstation cannot see something is plugged in, which happens below the driver and before it is ever consulted.",
    evidence: "A device that prints its own configuration page and does not enumerate on the workstation, with a known-good cable making it appear"
  },
  {
    key: "apisolation", part: "client isolation on the wireless network", target: "ap",
    objective: "2.3 + 5.6", link: "network", test: "wiredwireless",
    root: "Client isolation is on for that wireless network. Every wireless client can reach the internet and none of them can reach anything else on the same network, including the printer.",
    observable: "everybody on a cable can print and nobody on wireless can, on a device that is healthy and answering",
    symptoms: ["Only the laptops can't print", "The desktops are all fine",
      "The internet works fine on the laptops"],
    fixes: "Have client isolation turned off for the network the printers are on, or put the printers where the wireless clients are permitted to reach them. Nothing is wrong with the device or any of the laptops.",
    wrongReflex: "the laptops",
    wrongWhy: "Every wireless machine fails and every wired machine works, on the same driver and the same queue. A fault that sorts users by how they connect rather than by who they are is in what they connect through.",
    evidence: "Wired clients printing and wireless clients unable to reach the device at all, while the same wireless clients reach the internet normally"
  },
  {
    key: "printquota", part: "a print quota that has run out", target: "server",
    objective: "3.7 + 5.6", link: "queue", test: "quotalog",
    root: "The user has reached their page allocation. The server accepts each job, records it as denied, and deletes it, and nothing tells the user any of that.",
    observable: "one user's jobs vanish without an error while everybody else prints to the same queue normally",
    symptoms: ["It just disappears, there's no error",
      "Everyone else can print to it", "It says it's printing and then nothing"],
    fixes: "Clear or raise the allocation, and make the rejection visible to the user — a job that is silently deleted is the worst possible failure for the person waiting on it.",
    wrongReflex: "driver",
    wrongWhy: "The same driver on the same queue works for everybody else at that desk. A fault that follows one ACCOUNT rather than one machine or one device is somewhere that knows who people are, and the device does not.",
    evidence: "Jobs recorded on the server as received and denied against one account, with the same queue serving everybody else"
  },
  {
    key: "sleepdrop", part: "a device that drops its network in deep sleep", target: "printer",
    objective: "3.7 + 5.6", link: "device", test: "firstjob",
    root: "Deep sleep is shutting down the network interface. The first job of the day fails while the device wakes, and the second one goes through because it is awake by then.",
    observable: "the first job every morning fails and the next one works, and it never happens twice in a row",
    symptoms: ["The first thing I print in the morning never comes out",
      "If I send it again it's fine", "It's been doing it for months"],
    fixes: "Set the device's sleep mode to keep the network interface awake, or lengthen the delay before it sleeps. The trade is a few watts against every user's first job of the day.",
    wrongReflex: "the queue",
    wrongWhy: "A stuck queue holds every job behind the one at the head of it. This one loses exactly one job and then works perfectly, which is not a queue — it is something that was not listening yet.",
    evidence: "A failure that only ever hits the first job after a long idle period, with the retry succeeding every time"
  },
  {
    key: "ownport", part: "a hand-made port pointing at an old address", target: "workstation",
    objective: "3.7 + 5.6", link: "driver", test: "portcompare",
    root: "This user made their own TCP/IP port with the device's address typed into it, instead of connecting to the shared queue. The device moved and everybody on the shared queue followed it. This one did not.",
    observable: "one workstation cannot print and every other machine in the department can, to a device that has not moved since the change",
    symptoms: ["It's only me", "Everyone else is printing fine",
      "I set it up myself, it was quicker than waiting"],
    fixes: "Remove the hand-made port and connect the user to the shared queue like everybody else, so the next change reaches them the way it reached the others.",
    wrongReflex: "the device",
    wrongWhy: "The device is serving the whole department. One machine failing where twenty succeed puts the fault on that machine, and the thing that is different about it is that its port was typed in by hand rather than handed down.",
    evidence: "A local port with a hard-coded address on the one failing workstation, against a shared queue on every working one"
  }
];

/* =====================================================================
   Where in the chain

   Four links, and naming the right one is most of the diagnosis. This is
   the same discipline as the mixed track's scoping, pointed at the one
   chain that produces more helpdesk calls than anything else in the job.
   ===================================================================== */
export const LINK_OPTIONS = [
  { key: "driver", label: "On the workstation — the driver, or what the user is sending" },
  { key: "queue", label: "In a queue — on the workstation or on the print server" },
  /* "Network" covers the whole path between the two, which on a directly
     attached device is one cable and nothing else. */
  { key: "network", label: "On the path between the two — the network, or the cable on a direct connection" },
  { key: "device", label: "On the device — its own configuration, not its mechanism" }
];

export function linkOf(fault) { return fault.link; }

export function linkWhy(fault, chosen) {
  var right = fault.link;
  if (chosen === right) {
    return {
      driver: "On the workstation. The device is healthy, the network is fine, and what is wrong is what this one machine is sending or where it is sending it. That is why every other user prints to the same device without noticing anything.",
      queue: "In a queue. The job left the application and stopped somewhere it can be seen and counted — which is the most useful kind of printer fault, because a queue tells you exactly how far the job got.",
      network: "On the network path. The device is healthy and the workstation is configured correctly; what is broken is the two of them finding each other, and that is a different fix from either end.",
      device: "On the device. Not its mechanism — it prints and scans perfectly — but its own configuration, which is a computer's configuration and gets stale exactly like any other."
    }[right];
  }
  return {
    driver: "Putting this on the workstation means saying the device and the network are both fine and this one machine is sending something wrong. Check whether other users are affected before you settle there.",
    queue: "A queue fault means the job got as far as a queue and stopped. Look at whether there is anything in any queue at all — a job that never arrived is a different problem entirely.",
    network: "A network answer means the job cannot reach the device. Check whether it reaches it and whether the device answers on its address before you spend time there.",
    device: "Putting this on the device means the job reached it and it did something wrong with it. Check whether the job ever got that far."
  }[chosen];
}

/* =====================================================================
   The deployment

   Step four's second half, and the thing that separates fixing a call from
   stopping it. What is correct depends on the site and on what the device
   is for — a printer used by one person at one desk and a floor MFD used
   by sixty are not the same deployment, and neither of them is ever shared
   off somebody's workstation.
   ===================================================================== */
export const DEPLOY_FIELDS = [
  {
    key: "connection", label: "How the device connects",
    options: [
      "USB, directly to the one machine that uses it",
      "Ethernet, to the network in its own right",
      "Wireless, to the network in its own right"
    ]
  },
  {
    key: "address", label: "How its address is fixed",
    options: [
      "DHCP, as it comes",
      "DHCP with a reservation, so it never moves",
      "A static address inside the DHCP scope",
      "Nothing — it does not need one"
    ]
  },
  {
    key: "queue", label: "Where the queue lives",
    options: [
      "A local queue on the one workstation",
      "Shared from one person's workstation to everybody else",
      "A local queue on each workstation, pointing at the device",
      "A shared queue on the print server"
    ]
  },
  {
    key: "driver", label: "Which driver",
    options: [
      "The manufacturer's driver for this exact model",
      "The manufacturer's universal driver, managed centrally",
      "Whatever the operating system finds on its own"
    ]
  }
];

/* The correct deployment, computed from the site and the device. */
export function correctDeploy(G) {
  var single = G.printnet.deviceKind === "desktop printer";
  var tier = G.tierKey;
  if (single) {
    return {
      connection: "USB, directly to the one machine that uses it",
      address: "Nothing — it does not need one",
      queue: "A local queue on the one workstation",
      driver: "The manufacturer's driver for this exact model"
    };
  }
  return {
    connection: "Ethernet, to the network in its own right",
    address: "DHCP with a reservation, so it never moves",
    /* A site with a print server should be using it; a site without one
       puts a queue on each desk rather than on somebody's PC. */
    queue: tier === "startup"
      ? "A local queue on each workstation, pointing at the device"
      : "A shared queue on the print server",
    driver: tier === "corporate"
      ? "The manufacturer's universal driver, managed centrally"
      : "The manufacturer's driver for this exact model"
  };
}

export function deployWhy(G, field, chosen) {
  var want = correctDeploy(G)[field];
  var single = G.printnet.deviceKind === "desktop printer";
  var tier = G.tierKey;
  if (chosen === want) {
    return {
      connection: single
        ? "USB. One machine uses it, it sits on that desk, and putting a single-user device on the network gives everybody else something to print to by accident."
        : "Ethernet. A device that never moves has no reason to be on wireless, and a shared device has every reason to be on the network in its own right rather than behind somebody's PC.",
      address: single
        ? "None. It is on the end of a cable and nothing has to find it."
        : "A reservation. It keeps the same address across power cuts and firmware updates without taking it out of DHCP's hands, which is the failure this whole track is full of.",
      queue: single
        ? "One queue on the one machine that uses it."
        : tier === "startup"
          ? "A queue on each workstation pointing straight at the device. There is no print server at this site, and putting one desk in the middle of everybody else's printing is the thing that causes the call about somebody being on holiday."
          : "A queue on the print server. It is what the server is for, it puts the driver in one place, and it means a stuck job is fixed once rather than on every desk.",
      driver: tier === "corporate"
        ? "The universal driver, managed centrally. Across a fleet this size the alternative is a different driver per model on every machine, and that is a rollout rather than a printer."
        : "The model's own driver. It exposes everything the device can do, and at this size there is no fleet-management reason to give that up."
    }[field];
  }
  return {
    connection: chosen.indexOf("Wireless") === 0
      ? "Wireless on a device that has not moved since it was delivered adds a radio, an association and an access point to a path that could have been a cable."
      : chosen.indexOf("USB") === 0
        ? "USB serves exactly one machine. Everybody else then reaches it through that machine, which is the deployment this track exists to argue with."
        : "That is not what this device needs.",
    address: chosen === "DHCP, as it comes"
      ? "An address that can move is an address that will move, and every port pointing at it breaks the day it does."
      : chosen === "A static address inside the DHCP scope"
        ? "A static address inside the scope is an address conflict waiting for the day the scope hands it to something else. Static goes outside the scope, or better, use a reservation."
        : "That is not right for this device.",
    queue: chosen.indexOf("Shared from one person") === 0
      ? "Sharing off a workstation makes one person's machine a dependency for everybody else's printing. It works until they go on holiday, and then it is a ticket."
      : "That is not where this device's queue should live at this site.",
    driver: chosen.indexOf("Whatever the operating system") === 0
      ? "Whatever the operating system finds is a driver nobody chose, and on a managed fleet it is a different driver on every machine."
      : "That is not the right driver choice for a site this size."
  }[field];
}

/* =====================================================================
   The instruments
   ===================================================================== */
export function deviceRows(G) {
  var d = G.printnet;
  return [
    { k: "Device", v: d.model + " (" + d.deviceKind + ")", bad: false },
    { k: "Connection", v: d.connection, bad: false },
    { k: "Address", v: d.ip + " (" + d.how + ")", bad: d.how === "DHCP, no reservation" },
    { k: "Hostname", v: d.hostname, bad: false },
    { k: "Subnet", v: d.printerSubnet, bad: false },
    { k: "Device status", v: d.deviceStatus, bad: d.deviceStatus !== "Ready" },
    { k: "Own configuration page", v: d.selfPage, bad: d.selfPage !== "Prints correctly on demand" },
    { k: "Page description languages", v: d.pdl, bad: false },
    { k: "Installed options, on the device's own page", v: d.deviceOptions, bad: false },
    { k: "Trays, and what is physically in them", v: d.trayHolds, bad: false },
    { k: "Trays, and what the device is set to believe", v: d.traySet, bad: d.trayBad },
    { k: "Management page from the workstation", v: d.mgmtPage, bad: false },
    { k: "Print port from the workstation", v: d.printPort, bad: d.portBlocked },
    { k: "Answering on that address", v: d.answering, bad: d.answeringBad }
  ];
}

export function stationRows(G) {
  var d = G.printnet;
  return [
    { k: "Workstation subnet", v: d.stationSubnet, bad: false },
    { k: "Default printer", v: d.defaultPrinter, bad: d.defaultPrinter.indexOf("PDF") !== -1 },
    { k: "Windows manages the default", v: d.managedDefault, bad: d.managedDefault === "Yes" },
    { k: "Print spooler service", v: d.spooler, bad: d.spooler !== "Running" },
    { k: "Port this queue uses", v: d.port, bad: d.portBad },
    { k: "Driver installed", v: d.driver, bad: d.driverBad },
    { k: "Queue on this workstation", v: d.localQueue, bad: d.localQueue.indexOf("held") !== -1 },
    { k: "Installed options, as the driver has them", v: d.driverOptions, bad: d.optionsBad }
  ];
}

export function serverRows(G) {
  var d = G.printnet;
  return [
    { k: "Print server", v: d.server, bad: false },
    { k: "Shared queue", v: d.serverQueue, bad: d.serverQueueBad },
    { k: "Jobs waiting", v: String(d.serverJobs), bad: d.serverJobs > 12 },
    { k: "Head of queue", v: d.headJob, bad: d.headJob.indexOf("Error") === 0 }
  ];
}

export function scanRows(G) {
  var d = G.printnet;
  return [
    { k: "Copying", v: "Works", bad: false },
    { k: "Scan to email", v: d.scanEmail, bad: d.scanEmail !== "Last success this morning" },
    { k: "SMTP configured on the device", v: d.smtp, bad: d.smtpBad },
    { k: "Scan to folder", v: d.scanFolder, bad: d.scanFolder !== "Last success this morning" },
    { k: "Folder account on the device", v: d.folderAccount, bad: d.folderBad },
    { k: "Scan defaults on the device", v: d.scanDefaults, bad: d.scanDefaultsBad },
    { k: "Attachment limit it has to fit inside", v: d.attachLimit, bad: false }
  ];
}

/* =====================================================================
   The tests
   ===================================================================== */
const TESTS = [
  /* THE FIVE NEWEST TESTS COME FIRST ON PURPOSE. `printnetTests` offers the
     first entry that isolates the fault, so ordering is what decides which
     diagnostic a student is given. Several of the older tests are also listed
     as isolating the newer faults — not because they prove them, but because
     a test that would report something MISLEADING about a fault must never be
     offered as one of the wrong choices. Naming it as isolating keeps it out
     of that pool while the better diagnostic above it stays the one on offer. */
  { key: "swapcable", label: "Put a known-good cable on it and watch whether the workstation sees the device appear", mins: 4,
    isolates: ["usbfailed"],
    hit: "The device appears the moment the other cable goes on, with no driver touched and nothing reinstalled. It prints its own page on either cable, because its own page never crosses one.",
    miss: "The workstation sees the device on either cable, so what connects them is not the problem." },
  { key: "wiredwireless", label: "Print the same job from a wired machine and a wireless one, side by side", mins: 5,
    isolates: ["apisolation"],
    hit: "The wired machine prints. The wireless one beside it cannot reach the device at all, while reaching the internet perfectly. Same driver, same queue, same device — the difference is how they are attached.",
    miss: "Both machines behave the same way, so how they connect is not what separates them." },
  { key: "quotalog", label: "Read the server's job log for this user and for somebody who can print", mins: 4,
    isolates: ["printquota"],
    hit: "Every one of this user's jobs is logged as received and then denied on quota, and deleted. The other user's jobs on the same queue go straight through. Nothing was ever told to the person waiting.",
    miss: "The log shows this user's jobs going through exactly like everybody else's." },
  { key: "firstjob", label: "Leave it idle overnight, send one job in the morning, then send a second", mins: 8,
    isolates: ["sleepdrop"],
    hit: "The first job is lost and the second goes through in seconds, repeatably, on a device with an empty queue both times. It was asleep for the first one and awake for the second.",
    miss: "Both jobs behave identically, whether it has been idle or not." },
  { key: "portcompare", label: "Compare the failing workstation's printer port with a working machine's", mins: 4,
    isolates: ["ownport"],
    hit: "The working machines are all connected to the shared queue. The failing one has a local TCP/IP port with an address typed into it, and that address is not where the device is any more.",
    miss: "Both machines reach the device the same way, through the same queue." },
  { key: "optionscheck", label: "Compare the installed options on the device's own page with the driver's device settings", mins: 4,
    isolates: ["finishing"],
    hit: "The device's page lists a duplexer and a finisher. The driver's device settings list neither, which is why every option they provide is greyed out before the job is sent.",
    miss: "The driver's device settings and the device's own page agree about what is fitted." },
  { key: "portprobe", label: "From the workstation, reach the device by address and then on the port the queue uses", mins: 4,
    isolates: ["portblocked"],
    hit: "It answers by address and its management page opens. The port the queue prints on is refused from the same machine, in the same second.",
    miss: "Both the address and the print port answer from this workstation." },
  { key: "arpcheck", label: "Look at what is actually answering on the device's address", mins: 5,
    isolates: ["ipconflict"],
    hit: "Two different hardware addresses have answered on that one address, and which one replies changes between checks. One of them is not a printer.",
    miss: "One hardware address, the device's own, and it is the same on every check." },
  { key: "twoscans", label: "Send a one-page scan and a twenty-page scan to the same destination", mins: 6,
    isolates: ["scansize"],
    hit: "The one-page scan arrives in seconds. The twenty-page scan leaves the device successfully and is refused by the mail system for size. The scanner, the settings and the path are all working.",
    miss: "Both scans arrive, or neither does. Size is not what separates them." },
  { key: "traytest", label: "Look at what each tray holds and what the device thinks is in it", mins: 4,
    isolates: ["traymedia"],
    hit: "Tray two is full of plain paper and the device has it set as letterhead. The driver asked for plain, and the device will not take paper from a tray it believes is something else.",
    miss: "Every tray's media type matches what is physically in it." },
  { key: "selfpage", label: "Print the device's own configuration page, then send one job to it", mins: 4,
    isolates: ["wrongdriver", "portblocked", "ipconflict", "traymedia", "finishing"],
    hit: "Its own page is flawless and the job comes out as pages of PostScript. The device is fine and cannot read what it is being sent.",
    miss: "Both come out correctly, or both come out wrong in the same way." },
  { key: "netpage", label: "Read the address off the device's own page and compare it with the port", mins: 4,
    isolates: ["dhcpprinter"],
    hit: "The device is on one address and every workstation's port names another. It moved and nothing followed it.",
    miss: "The address on the device and the address in the port are the same." },
  { key: "queuecheck", label: "Look at every queue between the user and the device", mins: 5,
    isolates: ["spooler", "queuestuck", "portblocked", "ipconflict"],
    miss: "Every queue is empty and every spooler is running. Nothing is stopping anywhere you can see." },
  { key: "whosepc", label: "Find out what the device is actually connected to", mins: 4,
    isolates: ["sharedoffline"],
    hit: "It is on a USB cable to one desk and shared from there, and the network port on the back of it has never been used. The outage follows that desk's power switch.",
    miss: "It is on the network in its own right, with nothing between it and the workstations." },
  { key: "wherewent", label: "Send a test job and then find out where it went", mins: 3,
    isolates: ["defaultprinter", "portblocked", "ipconflict"],
    hit: "The job completed successfully — to a PDF file in the user's documents. The device's queue never saw it.",
    miss: "The job went to the device, and can be seen arriving." },
  { key: "devicequeue", label: "Look at the device's own held-job queue at the panel", mins: 4,
    isolates: ["securedprint"],
    hit: "The jobs are all there under the right name, held, waiting for a release that has never come. Everything upstream of the device worked perfectly.",
    miss: "Nothing held at the device, and nothing waiting for release." },
  { key: "scanlog", label: "Read the device's own scan log for the failing destination", mins: 5,
    isolates: ["scanemail", "scanfolder", "scansize"],
    miss: "Every scan destination has succeeded today, including the one the user says is broken." },
  { key: "pingprinter", label: "From the workstation that cannot see it, reach it by address", mins: 3,
    isolates: ["discovery", "portblocked", "ipconflict"],
    hit: "It answers immediately by address from the machine that cannot find it by browsing. The path works; the way it is being looked for does not.",
    miss: "It does not answer by address either, so this is not about how it is being found." },
  { key: "reinstall", label: "Remove and reinstall the printer on the user's workstation", mins: 25,
    isolates: [],
    miss: "Twenty-five minutes and identical behaviour, because a fresh install of the same thing pointing at the same place does the same thing." },
  { key: "rebootall", label: "Power-cycle the printer and reboot the workstation", mins: 12,
    isolates: [],
    miss: "No change. It is worth doing once and it is not worth doing twice." },
  { key: "newcable", label: "Replace the network cable to the device", mins: 8,
    isolates: [],
    miss: "The link was up at a gigabit with no errors before and it is up at a gigabit with no errors now." }
];

export function printnetTests(G, shuffle) {
  var right = TESTS.filter(function (t) { return t.isolates.indexOf(G.fault.key) !== -1; });
  var wrong = TESTS.filter(function (t) { return t.isolates.indexOf(G.fault.key) === -1; });
  var pick = right.slice(0, 1).concat(shuffle(wrong).slice(0, 4));
  return shuffle(pick).map(function (t) {
    var iso = t.isolates.indexOf(G.fault.key) !== -1;
    return {
      key: t.key, label: t.label, mins: t.mins, isolating: iso,
      result: iso ? (t.hit || sharedHit(G, t.key)) : t.miss
    };
  });
}

/* What a test that has no single `hit` line reports, for the fault in hand.

   Several tests are listed as isolating more faults than they can actually
   prove. That is deliberate — it keeps them out of the wrong-answer pool for
   a fault they would report something MISLEADING about — but it means each of
   them has to have something true to say when it is the one on offer. A test
   that says "every queue is empty" on a ticket where the queue is full of
   errors is worse than no test at all. */
function sharedHit(G, key) {
  var f = G.fault.key, d = G.printnet;
  if (key === "queuecheck") {
    if (f === "spooler") return "Every queue on this workstation is holding jobs and the spooler service is stopped. The same user's colleagues are printing to the same devices normally.";
    if (f === "portblocked") return "The workstation's queue holds every job in an error state, the spooler is running, and the server's queue is clean. The jobs are leaving here and not arriving there.";
    if (f === "ipconflict") return "The queue holds a job in an error state, and the one sent five minutes earlier went through. Nothing about the queue explains why one and not the other.";
    return "The workstation's queue is empty because the job went straight to the server, and the server's queue has " +
      d.serverJobs + " jobs stacked behind one in an error state.";
  }
  if (key === "scanlog") {
    if (f === "scanemail") return "Scan to folder succeeded twenty minutes ago and every scan to email since Tuesday has failed on SMTP authentication. The scanner is producing perfect files.";
    if (f === "scansize") return "The log shows scans to that same address both succeeding and failing today. The device recorded every one of them as sent.";
    return "Scan to email succeeded this morning and every scan to folder is being refused by the file server. The account exists and its rights are unchanged.";
  }
  if (key === "selfpage") {
    if (f === "portblocked") return "Its own page is perfect. The job never reaches it at all — the device has no record of anything arriving.";
    if (f === "ipconflict") return "Its own page is perfect. Send the job twice and it arrives once, which is not something a device does to itself.";
    if (f === "traymedia") return "Its own page comes out of the multipurpose tray. The job reaches the device and stops at the panel asking for paper, so it got there.";
    if (f === "finishing") return "Its own page is perfect and the job prints perfectly — plain, single-sided and unstapled, because that is all this workstation is able to ask for.";
    return "";
  }
  if (key === "wherewent") {
    if (f === "portblocked") return "It left the workstation, entered the queue and never arrived. The device has no record of it.";
    if (f === "ipconflict") return "This one arrived. The one before it did not, and nothing was changed between them.";
    return "";
  }
  if (key === "pingprinter") {
    if (f === "portblocked") return "It answers by address without any difficulty, from the machine that cannot print a page to it.";
    if (f === "ipconflict") return "It answers — and the replies are not all coming from the same place.";
    return "";
  }
  return "";
}

/* =====================================================================
   What actually gets done
   ===================================================================== */
export const PRINTNET_ACTIONS = [
  { key: "fixdriver", label: "Install the correct driver for this model and language" },
  { key: "reserve", label: "Reserve the device's address, then correct the ports that point at it" },
  { key: "restartspool", label: "Clear the queue, restart the spooler, and set it to recover itself" },
  { key: "networkit", label: "Put the device on the network in its own right and rebuild the queues" },
  { key: "setdefault", label: "Set the correct default printer and stop Windows managing it" },
  { key: "enrolbadge", label: "Enrol the badge against the account and watch a job release" },
  { key: "fixsmtp", label: "Update the device's SMTP server, port and credentials" },
  { key: "fixcreds", label: "Update the stored folder credentials on the device" },
  { key: "tcpport", label: "Add the device by a standard TCP/IP port instead of by discovery" },
  { key: "killjob", label: "Delete the stalled job and let the queue drain" },
  { key: "declareoptions", label: "Declare the installed options in the driver, then send a stapled duplex job" },
  { key: "openport", label: "Permit the print port from the workstation subnet to the printer subnet" },
  { key: "fixconflict", label: "Take the device's address out of the DHCP scope's reach, then release the other lease" },
  { key: "scandefaults", label: "Set the scan defaults to a resolution and format that produces a sendable file" },
  { key: "settray", label: "Set each tray's media type and size on the device to what is actually in it" },
  { key: "newcable", label: "Fit a known-good cable and confirm the device enumerates" },
  { key: "apisolate", label: "Have client isolation turned off for the network the printers are on" },
  { key: "quotaraise", label: "Clear or raise the allocation, and make the rejection visible to the user" },
  { key: "wakeonlan", label: "Set the device to keep its network interface awake in sleep" },
  { key: "useshared", label: "Remove the hand-made port and connect the user to the shared queue" },
  { key: "replaceprinter", label: "Replace the printer" },
  { key: "reimage", label: "Reimage the user's workstation" }
];

export function correctPrintnetAction(fault) {
  return {
    wrongdriver: "fixdriver", dhcpprinter: "reserve", spooler: "restartspool",
    sharedoffline: "networkit", defaultprinter: "setdefault", securedprint: "enrolbadge",
    scanemail: "fixsmtp", scanfolder: "fixcreds", discovery: "tcpport", queuestuck: "killjob",
    finishing: "declareoptions", portblocked: "openport", ipconflict: "fixconflict",
    scansize: "scandefaults", traymedia: "settray",
    usbfailed: "newcable", apisolation: "apisolate", printquota: "quotaraise",
    sleepdrop: "wakeonlan", ownport: "useshared"
  }[fault.key];
}

export function printnetActionWhy(fault, chosen) {
  if (chosen === correctPrintnetAction(fault)) return fault.fixes;
  return {
    newcable: "The workstation sees the device on the cable that is fitted. What connects them is not the problem here.",
    apisolate: "Wired and wireless machines behave identically on this ticket, so nothing is being kept apart by how it connects.",
    quotaraise: "This user's jobs are logged as printed, not denied, and nobody on this queue is against an allocation.",
    wakeonlan: "It fails on every job rather than only the first one after an idle period, so nothing here was asleep.",
    useshared: "The failing workstation reaches the device the same way every working one does. There is no hand-made port to remove.",
    fixdriver: "The driver is correct for this model and this language, and the device understands what it is being sent.",
    reserve: "The device's address has not moved, and every port that points at it names the address it is actually on.",
    restartspool: "The spooler is running and the local queue is empty. There is nothing stuck on this workstation.",
    networkit: "The device is already on the network in its own right, with nothing sitting between it and the workstations.",
    setdefault: "The default printer is correct and the jobs are reaching the device they were meant for.",
    enrolbadge: "There is no held queue on this device and nothing waiting for a release.",
    fixsmtp: "Scan to email succeeded this morning. The device's mail settings are current.",
    fixcreds: "Scan to folder succeeded this morning. The stored credentials are working.",
    tcpport: "The device is being found and added without any difficulty from this workstation.",
    killjob: "Nothing is stalled at the head of any queue, and no jobs are backed up behind anything.",
    declareoptions: "The driver already knows what is fitted, and everything the accessories can do is offered in the print dialogue.",
    openport: "The print port answers from the workstation that is failing. Nothing between the two is refusing anything.",
    fixconflict: "One hardware address answers on the device's address and it is the device's own. Nothing is contending for it.",
    scandefaults: "Scans of every length are arriving at their destination, so the files this device produces are not what is stopping anything.",
    settray: "Every tray's media type matches what is physically in it, and no job on this device is waiting for paper.",
    replaceprinter: "It prints its own configuration page perfectly on demand, which clears the engine, the toner, the paper path and the formatter in one page. Replacing a device that prints is an expensive way to avoid looking at the seven things between it and the user.",
    reimage: "Nothing about this points at the operating system, and an hour of reimaging proves it while the user cannot print for the whole hour."
  }[chosen];
}

/* =====================================================================
   The site
   ===================================================================== */
var MODELS = ["Meridian MX-4200 multifunction", "Corvid WorkCentre 850",
  "Halden LaserJet 4300n", "Calder SmartPrint 620", "Marek MFC-9800"];

export function buildPrintSite(r, fault, tierKey) {
  var f = fault.key;
  /* A device shared off somebody's desk has to be the kind of device that
     gets shared off a desk, and a badge-release site has to be big enough
     to have badges. */
  var kind = f === "sharedoffline" ? "desktop printer"
    : f === "securedprint" ? "workgroup MFD"
    : r.pick(["workgroup MFD", "workgroup MFD", "floor MFD"]);

  var third = r.int(10, 60);
  var stationSubnet = "10.20." + third + ".0/24";
  var printerSubnet = f === "discovery" ? "10.20." + (third + 6) + ".0/24 (printers)" : stationSubnet;
  var realIp = (f === "discovery" ? "10.20." + (third + 6) : "10.20." + third) + "." + r.int(200, 240);
  var oldIp = "10.20." + third + "." + r.int(200, 240);

  var d = {
    model: r.pick(MODELS),
    deviceKind: kind,
    connection: f === "sharedoffline" ? "USB to one workstation, shared from it" : "Ethernet",
    ip: realIp,
    how: f === "dhcpprinter" ? "DHCP, no reservation" : r.pick(["DHCP reservation", "Static, outside the scope"]),
    hostname: "PRN-" + r.pick(["FIN", "OPS", "ENG", "ADM"]) + "-" + r.int(1, 9),
    stationSubnet: stationSubnet,
    printerSubnet: printerSubnet,
    deviceStatus: "Ready",
    selfPage: "Prints correctly on demand",
    pdl: f === "wrongdriver" ? "PCL 6 only" : "PCL 6, PostScript 3",
    defaultPrinter: f === "defaultprinter" ? "Microsoft Print to PDF" : "the device on this ticket",
    managedDefault: f === "defaultprinter" ? "Yes" : "No",
    spooler: f === "spooler" ? "Stopped" : "Running",
    port: f === "dhcpprinter" ? "TCP/IP to " + oldIp : "TCP/IP to " + realIp,
    portBad: f === "dhcpprinter",
    driver: f === "wrongdriver" ? "PostScript driver, generic" : "Model driver, current version",
    driverBad: f === "wrongdriver",
    localQueue: f === "spooler" ? "6 jobs held, spooler stopped" : "Empty",
    server: tierKey === "startup" ? "None — queues are local to each workstation" : "PRINT-01",
    serverQueue: f === "queuestuck" ? "Shared, jobs not draining" : "Shared, draining normally",
    serverQueueBad: f === "queuestuck",
    serverJobs: f === "queuestuck" ? r.int(24, 61) : r.int(0, 3),
    headJob: f === "queuestuck" ? "Error — printing, 0 of 4 pages, no progress for 90 minutes" : "None waiting",
    scanEmail: f === "scanemail" ? "Failing since Tuesday — SMTP authentication refused" : "Last success this morning",
    smtp: f === "scanemail" ? "Anonymous relay, port 25" : "Authenticated, port 587",
    smtpBad: f === "scanemail",
    scanFolder: f === "scanfolder" ? "Failing since the policy review — access denied" : "Last success this morning",
    folderAccount: f === "scanfolder" ? "svc-scan (password last set 14 months ago)" : "svc-scan (current)",
    folderBad: f === "scanfolder",
    /* The five newer faults, each with its evidence somewhere a student can
       actually read it. A fault whose proof is only in the prose is a fault
       nobody can find. */
    deviceOptions: "Duplex unit, 500-sheet feeder, stapling finisher",
    driverOptions: f === "finishing" ? "None declared" : "Duplex unit, 500-sheet feeder, stapling finisher",
    optionsBad: f === "finishing",
    mgmtPage: "Opens from the workstation",
    printPort: f === "portblocked" ? "9100 — refused from the workstation subnet" : "9100 — open",
    portBlocked: f === "portblocked",
    answering: f === "ipconflict"
      ? "Two hardware addresses, changing between checks"
      : "One hardware address, the device's own",
    answeringBad: f === "ipconflict",
    scanDefaults: f === "scansize" ? "600 dpi, colour, uncompressed PDF" : "300 dpi, greyscale, compressed PDF",
    scanDefaultsBad: f === "scansize",
    attachLimit: "10 MB on the mail system",
    trayHolds: "Tray 1 plain A4, tray 2 plain A4, tray 3 plain A4",
    traySet: f === "traymedia"
      ? "Tray 1 plain A4, tray 2 LETTERHEAD A4, tray 3 plain A4"
      : "Tray 1 plain A4, tray 2 plain A4, tray 3 plain A4",
    trayBad: f === "traymedia",
    oldIp: oldIp
  };
  /* On the sharing ticket the queue really does live on somebody's desk,
     because that is the fault. */
  if (f === "sharedoffline") {
    d.server = tierKey === "startup" ? "None — shared from a workstation" : "PRINT-01 (this device is not on it)";
    d.owner = r.pick(["Dana", "Marcus", "Priya", "Rosa"]);
  }
  return d;
}

/* =====================================================================
   The reference key
   ===================================================================== */
export const PRINTNET_FACTS = [
  ["The seven places a print job can stop",
    "The application, the driver, the local queue, the port, the network, the device's own queue, and the device itself. The caller describes all seven the same way, and the first useful question is always how far the job actually got."],
  ["What the configuration page proves",
    "A device that prints its own page has a working engine, working toner, a clear paper path and a working formatter. Everything left is between it and the user, which is where most printer calls live."],
  ["Reservation, not static, not neither",
    "A reservation keeps a device on one address without taking it out of DHCP's hands. A static address inside the scope is a conflict waiting to happen; DHCP without a reservation is an address that will move and take every port with it."],
  ["Why discovery stops at a subnet",
    "Browsing for a printer is broadcast traffic, and broadcasts do not cross a router. On a flat network discovery looks like magic; the moment printers get their own subnet it stops working and nothing about the printer has changed."],
  ["Shared off a workstation is a decision, not a fault",
    "It works, it costs nothing, and it makes one person's power switch a dependency for everybody else's printing. When that call comes in, the fix is the architecture rather than the workstation."],
  ["PCL and PostScript",
    "Two languages for describing a page. Send one to a device that only speaks the other and it prints the instructions instead of the document — which looks alarming and is a driver away from fixed."],
  ["A device is a computer",
    "It holds an address, a queue, a user list, mail settings and stored credentials. All of those go stale exactly the way a server's do, and none of them are visible from a workstation."],
  ["One stuck job stops everybody",
    "A shared queue is a single file of jobs. A malformed one at the head of it holds the entire site's printing to that device, and the device sits there idle looking innocent."]
];
