/* =====================================================================
   Field Service Center — the mobile track

   The hardware track grades a part you order against what physically fits.
   The networking track grades a configuration you type against what
   actually reaches. This one grades a decision: repair it, replace it,
   claim it on warranty, or change a setting and touch nothing.

   That decision is the whole of mobile support and it is almost never
   technical. A three-year-old handset with a $140 screen repair and a $190
   replacement price is not a repair job. The same fault on a nine-month-old
   device under warranty is not a repair job either, for the opposite
   reason — opening it voids the cover. And a device that has never been
   backed up is not going anywhere until it has been, whatever you decide.
   ===================================================================== */

/* ---------------- the seven mobile faults ---------------- */
export const MOBILE_FAULTS = [
  {
    key: "battery", part: "battery", objective: "1.1 + 5.4", kind: "repair",
    root: "The battery has degraded past its service life. Health is well down and the cycle count is high for the device's age.",
    observable: "the device drops from around half charge to nothing in minutes, and runs warm on the charger",
    symptoms: ["Dies at 40% with no warning", "Has to be plugged in by lunchtime",
      "Gets hot while it charges"],
    fixes: "Replace the battery, or replace the device if the repair costs more than it is worth.",
    wrongReflex: "charging cable",
    wrongWhy: "It charges to 100% on any cable and any brick. The problem is what happens after you unplug it.",
    evidence: "Battery health is well below the threshold and the cycle count is high for the device's age"
  },
  {
    key: "speaker", part: "earpiece speaker", objective: "1.1 + 5.4", kind: "repair",
    root: "The earpiece speaker mesh is packed with pocket debris. Calls are faint through the earpiece and perfect on speaker or a headset.",
    observable: "the caller can barely be heard on a normal call and is perfectly clear the moment it goes on speaker",
    symptoms: ["I can't hear anyone", "It's fine if I put it on loudspeaker",
      "They can hear me perfectly well"],
    fixes: "Clear the earpiece mesh carefully with a soft brush, then test a call. If that does not restore it, the earpiece assembly is the part.",
    wrongReflex: "microphone",
    wrongWhy: "The other end hears them perfectly, which clears the microphone entirely. The fault is only on the receiving half of the call and only through one of two speakers.",
    evidence: "Audio is faint through the earpiece and normal through the loudspeaker on the same call"
  },
  {
    key: "swollen", part: "a swollen battery", objective: "1.1 + 5.4", kind: "repair",
    root: "The cell has swelled and is lifting the display away from the chassis. This is a damaged lithium cell and it is a hazard from the moment you see it.",
    observable: "a visible gap opening around the screen, and the device rocks on a flat desk",
    symptoms: ["The screen is coming away at the edge", "It wobbles on the table now",
      "It has always lived on the charger in the van"],
    fixes: "Take it out of service immediately. Do not charge it, do not press the swelling down, and do not put it in general waste — it goes out as hazardous waste through the proper route.",
    wrongReflex: "screen",
    wrongWhy: "The display is being pushed out from behind, not failing. Fitting a new screen onto a swollen cell puts a new part on top of the hazard and clamps it down harder.",
    evidence: "A gap opening evenly around the display with the device rocking on a flat surface"
  },
  {
    key: "wificall", part: "wireless calling configuration", objective: "1.2 + 5.4", kind: "config",
    root: "Wi-Fi calling is switched off on a handset that lives in a basement with no cellular signal. There is nothing wrong with the device or the account.",
    observable: "calls fail in one particular part of the building and work perfectly everywhere else",
    symptoms: ["It doesn't work in the basement", "It's fine upstairs",
      "Everyone down there has the same problem"],
    fixes: "Turn on Wi-Fi calling and confirm a call completes on wireless with cellular switched off.",
    wrongReflex: "carrier",
    wrongWhy: "The carrier is delivering signal everywhere the building lets it in. Concrete and a basement are not a network fault, and no amount of calling the carrier changes what is between the handset and the mast.",
    evidence: "No cellular signal at all in that area with a strong wireless association, and calling disabled over wireless"
  },
  {
    key: "profile", part: "an expired configuration profile", objective: "1.1 + 5.4", kind: "config",
    root: "The management profile's certificate expired overnight. The device is still enrolled and everything the profile delivered has quietly stopped working.",
    observable: "mail, wireless and the company applications all stopped at the same moment overnight, on a device nobody touched",
    symptoms: ["Everything stopped at once", "I hadn't even picked it up",
      "It says something about a certificate"],
    fixes: "Push a renewed profile from the management console and confirm mail, wireless and the applications all come back.",
    wrongReflex: "password",
    wrongWhy: "A password would break one thing at a time and would prompt for a new one. Several unrelated services stopping at the same instant on an untouched device points at the thing that delivered all of them.",
    evidence: "Several unrelated services failing at the same timestamp, with the management console reporting an expired profile"
  },
  {
    key: "backupfail", part: "a backup that has not run", objective: "1.1 + 5.4", kind: "config",
    root: "The device has not backed up in months. It is set to back up only on wireless and mains power, and this user is never on both at once.",
    observable: "the last successful backup is months old on a device that is used every day",
    symptoms: ["It says it hasn't backed up since the spring", "I charge it in the van",
      "I didn't know it was supposed to"],
    fixes: "Get one backup completed on wireless and mains before anything else happens to this device, then fix the conditions so it keeps running.",
    wrongReflex: "storage",
    wrongWhy: "There is room in the account and room on the device. The backup is not failing — it has never been given the two conditions it needs at the same time.",
    evidence: "A last-successful-backup date months old with no error recorded and space available at both ends"
  },
  {
    key: "port", part: "charging port", objective: "1.1 + 5.4", kind: "repair",
    root: "The charging port is packed with pocket lint. The connector cannot seat fully, so charging is intermittent and depends on the angle.",
    observable: "it only charges if the cable is held at a particular angle, and stops the moment it is let go",
    symptoms: ["Only charges if you wedge it against something",
      "Says charging then stops a second later",
      "A new cable made no difference"],
    fixes: "Clear the port carefully with a non-conductive tool and re-test. This is a five-minute fix, not a part.",
    wrongReflex: "battery",
    wrongWhy: "Battery health is fine and the device holds charge normally once it actually gets to full. The fault is getting power in, not storing it.",
    evidence: "Charging drops out on movement, and the port is visibly obstructed"
  },
  {
    key: "digitizer", part: "digitizer", objective: "1.1 + 5.4", kind: "repair",
    root: "The digitizer is failing along one edge after a drop. Touch is dead in a band down the side of the screen; the display itself is fine.",
    observable: "one strip of the screen does not respond to touch at all, though the picture is perfect",
    symptoms: ["Cannot press the send button, it is right on the edge",
      "Works fine if you rotate the screen", "It was dropped in the car park"],
    fixes: "Replace the digitizer assembly, or the device, depending on what it is worth.",
    wrongReflex: "operating system",
    wrongWhy: "The dead band stays in the same physical place when the screen rotates. Software faults do not care which way up the device is.",
    evidence: "The unresponsive band stays in the same physical position through a rotation"
  },
  {
    key: "overheat", part: "thermal condition", objective: "1.1 + 5.4", kind: "config",
    root: "The device is in a heavy protective case, mounted on a windscreen in direct sun, and charging from a fast charger all day. It throttles and shuts down.",
    observable: "it slows to a crawl and shuts itself off during the afternoon, then works fine the next morning",
    symptoms: ["Turns itself off every afternoon", "Fine first thing, useless by two o'clock",
      "The screen goes dim on its own"],
    fixes: "Take it out of the case while it charges, get it out of direct sun, and stop fast-charging it in the cradle all day.",
    wrongReflex: "battery",
    wrongWhy: "Battery health is good and the cycle count is low. It is not the battery failing, it is the battery being cooked.",
    evidence: "Thermal shutdowns cluster in the afternoon and the device recovers completely overnight"
  },
  {
    key: "cellular", part: "cellular configuration", objective: "1.2 + 5.4", kind: "config",
    root: "The APN was changed by hand during a carrier migration and never put back. The device registers on the network but carries no data.",
    observable: "calls and texts work perfectly and nothing that needs data works at all",
    symptoms: ["Can ring people, cannot open anything", "Full bars and still nothing loads",
      "Works fine the moment it joins the office wireless"],
    fixes: "Restore the carrier's APN settings.",
    wrongReflex: "SIM",
    wrongWhy: "The SIM registers, the device has full signal, and voice works. A dead SIM does not give you five bars and a phone call.",
    evidence: "Full signal and a working voice path with no data path at all"
  },
  {
    key: "mdm", part: "device enrolment", objective: "1.1 + 5.4", kind: "config",
    root: "The management profile was removed when the user reset the device themselves. It is no longer enrolled, so company mail and the certificate went with it.",
    observable: "company mail stopped completely while everything personal on the device works",
    symptoms: ["Work email will not connect", "It asks for a password that does not work",
      "Everything else on the phone is fine"],
    fixes: "Re-enrol the device in management and let the profile and certificate reinstall.",
    wrongReflex: "mail password",
    wrongWhy: "The password is correct and works on the web. What is missing is the certificate the profile installs.",
    evidence: "The device shows as not enrolled and has not checked in since the reset"
  },
  {
    key: "storage", part: "device storage", objective: "1.1 + 5.4", kind: "config",
    root: "Internal storage is completely full, mostly with years of camera video that has never been offloaded. Updates fail and applications close on launch.",
    observable: "applications close the moment they open and the device refuses to update",
    symptoms: ["Camera says it cannot save", "Apps shut straight back down",
      "It has been telling me to update for months"],
    fixes: "Offload the media to the company storage, clear the caches, then let the update run.",
    wrongReflex: "device",
    wrongWhy: "There is nothing wrong with the hardware. It is a full disk, and a full disk on a phone breaks things in ways that look like failure.",
    evidence: "Free space is effectively zero and the failures are all write failures"
  },

  /* ---- five more, added because the twelve above left the same gap in the
     same place: every one of them was something wrong with the device. In
     the field, a good half of mobile calls are an accessory, a policy or a
     support window, and a technician who has only ever practised on broken
     hardware quotes a screen for a peeling protector. ---- */

  {
    key: "protector", part: "a lifted screen protector", objective: "1.1 + 5.4", kind: "repair",
    root: "The tempered-glass protector has lifted along one edge and there is an air gap under it. Touch is erratic exactly where the gap is. The panel underneath is perfect.",
    observable: "touch that misses along one edge, over a rainbow-edged air gap you can see under a raking light",
    symptoms: ["It won't register down the side any more",
      "You can see a sort of oily rainbow along that edge",
      "It got dropped in its case a fortnight ago and looked fine"],
    fixes: "Peel the protector off, clean the glass, and re-test touch across the whole panel before you quote anything. Fit a new protector if the user wants one — that is stock, not a repair.",
    wrongReflex: "digitizer",
    wrongWhy: "The dead area follows the lifted edge of the protector, not the panel. Peel it off and touch works everywhere — which is a two-minute test that stands between this ticket and a screen replacement nobody needed.",
    evidence: "An air gap visible under the protector along the same edge the touch fails on, with touch normal once it is removed"
  },
  {
    key: "nfcoff", part: "contactless radio setting", objective: "1.2 + 5.4", kind: "config",
    root: "The short-range contactless radio was switched off in a battery-saving sweep after the last update. The depot door reader and the fuel card both use it, and neither has worked since.",
    observable: "the handset will not present at any contactless reader while every other radio on it works normally",
    symptoms: ["It won't open the depot door any more",
      "The fuel card on the phone does nothing at the pump",
      "Everything else on it works, calls, maps, email"],
    fixes: "Turn the contactless radio back on and confirm it presents at a reader. Then look at why a battery-saving change switched it off, because it will have done the same to the rest of the fleet.",
    wrongReflex: "the card credential",
    wrongWhy: "The credential is valid and provisioned — it presents perfectly from a second handset with the same card on it. Nothing reaches the reader from this device because the radio that would carry it is switched off.",
    evidence: "The contactless radio disabled in settings on a handset whose card credential is valid and works from another device"
  },
  {
    key: "rearcam", part: "rear camera glass", objective: "1.1 + 5.4", kind: "repair",
    root: "The glass over the rear camera is abraded — a fine haze of scratches from grit in the pocket. Photographs flare and go milky in daylight and are almost normal indoors.",
    observable: "washed-out, flaring photographs in bright light from a camera that focuses and exposes correctly",
    symptoms: ["Site photos come out foggy outdoors",
      "Indoors they look all right", "The front camera is fine"],
    fixes: "Replace the rear camera glass, or the device, depending on what the repair costs against what it is now worth. Issue a case with a raised lip round the camera so it stops happening.",
    wrongReflex: "camera module",
    wrongWhy: "The module focuses, exposes and meters correctly, and the picture is fine in low light. A module that had failed would not care what the light was doing — this one is shooting through a scratched window.",
    evidence: "Flare and haze that appear only in bright light, over glass that shows a fine abrasion pattern under a raking light"
  },
  {
    key: "liquid", part: "liquid damage", objective: "1.1 + 5.4", kind: "repair",
    root: "The liquid contact indicator has triggered and there is green corrosion around the connectors on the board. It is working today. That is not the same as being reliable.",
    observable: "a triggered liquid indicator with visible corrosion on the board, on a device that currently works",
    symptoms: ["It went in a puddle on site and we dried it in rice",
      "It's been fine ever since, mostly",
      "It does odd things now and then and then stops doing them"],
    fixes: "Take it out of service and reissue from stock. Liquid damage is not covered by the warranty, and a board with corrosion on it will fail again at a time you do not choose.",
    wrongReflex: "warranty claim",
    wrongWhy: "A triggered liquid indicator ends the warranty conversation before it starts — that is what the indicator is there for. Submitting the claim wastes a fortnight and comes back refused with the device in somebody else's hands.",
    evidence: "A triggered liquid contact indicator and corrosion visible around the board connectors"
  },
  {
    /* Not kind "config", even though nothing is physically broken. The
       decision is a device decision, and marking it as a setting would have
       made "change the configuration" the graded answer to a ticket whose
       whole point is that no setting exists. */
    key: "eol", part: "a device past its support window", objective: "1.1 + 5.4", kind: "repair",
    root: "The handset is two major versions behind and the manufacturer stopped issuing updates for this model. The job-management application now requires a version this device cannot be given.",
    observable: "an application that refuses to start on a device with no update available and no fault of any kind",
    symptoms: ["The jobs app says my phone is too old",
      "There's no update showing, I've checked", "There's nothing else wrong with it at all"],
    fixes: "Replace the device. There is nothing to repair and nothing to configure — the model is outside its support window and no setting on it changes that.",
    wrongReflex: "the application",
    wrongWhy: "The application runs correctly on every other handset in the fleet. Reinstalling it on a device whose operating system it cannot run on produces the same refusal, slightly later.",
    evidence: "An operating system two majors behind with no update offered, on a model the manufacturer has stopped supporting"
  },

  /* ---- five more on 1.3 ----
     Configure connectivity, and provide application support. The eight
     already on this half of the track are mostly about the device talking to
     a carrier or a management server. These five are the other shapes the
     objective takes: a handset asked to BE the network, a pairing that has
     run out of room, a link that is up and carrying nothing, a tunnel doing
     exactly what it was told to, and an application that is installed,
     licensed, current and refused. */

  {
    key: "hotspot", part: "personal hotspot configuration", objective: "1.3 + 2.6", kind: "config",
    root: "The handset is meant to give the van's tablet a connection and personal hotspot is switched off. The plan carries tethering; nobody enabled it on the device.",
    observable: "a tablet that finds no network from a handset with full signal and working data of its own",
    symptoms: ["The tablet can't find anything to join",
      "The phone's own internet is fine", "It worked in the last van I was in"],
    fixes: "Turn on the personal hotspot, set a name and a passphrase that match the fleet standard, and check the band it advertises on before you hand it back.",
    wrongReflex: "the tablet",
    wrongWhy: "The tablet joins every other network you put in front of it, including the office one, which clears its radio entirely. It cannot find a network that is not being broadcast.",
    evidence: "Personal hotspot disabled on a handset with working cellular data, and a tablet that associates normally elsewhere"
  },
  {
    key: "btpair", part: "a full Bluetooth bond list", objective: "1.3 + 1.2", kind: "config",
    root: "The van headset will not pair. The handset's bond list is full of devices that have left the fleet, and it silently refuses new pairings rather than saying so.",
    observable: "a pairing that times out on a handset whose radio is on and which is already bonded to several devices that no longer exist",
    symptoms: ["It won't pair with the new headset", "Bluetooth is definitely on",
      "The headset pairs with my own phone straight away"],
    fixes: "Remove the bonds for devices that are no longer in service, then pair the headset. Put bond housekeeping into the handover checklist, because this is a fleet-wide problem waiting to happen.",
    wrongReflex: "the headset",
    wrongWhy: "The headset pairs with a different handset on the first attempt, which clears it completely. What is full is a list on this device, and nothing about the failure says so.",
    evidence: "A bond list at its limit, populated with devices retired from the fleet, on a handset whose radio is working"
  },
  {
    key: "captiveportal", part: "an unaccepted captive portal", objective: "1.3 + 2.3", kind: "config",
    root: "The handset has associated with the site's guest wireless and never been shown the sign-in page. A private DNS setting is stopping the redirect that would have produced it, so the link is up and nothing crosses it.",
    observable: "a strong wireless association with an address and a gateway, and no traffic reaching anything beyond them",
    symptoms: ["It says it's connected to the wifi but nothing loads",
      "Full bars on the wireless", "It works the second I turn wifi off and use mobile data"],
    fixes: "Turn the private DNS setting off for this network so the redirect can happen, accept the portal, then decide as a fleet whether that setting belongs on devices that visit sites like this one.",
    wrongReflex: "the wireless password",
    wrongWhy: "The device has associated, taken an address and can reach the gateway \u2014 all of which is impossible with a wrong passphrase. It is on the network and the network is not letting it any further until somebody agrees to something.",
    evidence: "An association with a valid address and gateway, no traffic beyond it, and a private DNS setting preventing the portal redirect"
  },
  {
    key: "vpnalways", part: "an always-on VPN profile", objective: "1.3 + 2.4", kind: "config",
    root: "An always-on tunnel was pushed to the fleet. It is working exactly as configured, and it is sending every packet to the data centre \u2014 including the ones meant for a printer in the same room.",
    observable: "a device that reaches every company service perfectly and cannot see anything on the network it is standing on",
    symptoms: ["It won't print to the printer three feet away",
      "Email and everything else on the system works fine",
      "It started when the security update went out"],
    fixes: "Configure split tunnelling so local subnets stay local, or add an exception for the site ranges. Nothing here is broken \u2014 the policy is doing what it was written to do and what it was written to do was too broad.",
    wrongReflex: "the printer",
    wrongWhy: "The printer prints its own configuration page and serves every other device in the room. A handset that can reach a data centre and not a device three feet away is not describing a printer fault; it is describing where its traffic is going.",
    evidence: "An always-on tunnel with no split tunnelling, on a device that reaches remote services and no local ones"
  },
  {
    key: "appperm", part: "a denied application permission", objective: "1.3 + 1.2", kind: "config",
    root: "The job application cannot attach site photographs. Camera access was denied at first launch, and the application shows an empty attachment list rather than an error anybody would act on.",
    observable: "an application that runs, signs in and syncs, and silently fails at the one thing that needs a piece of hardware",
    symptoms: ["I can't add photos to a job", "The app works for everything else",
      "The camera itself is fine, I use it all day"],
    fixes: "Grant the application the camera permission and check the others it needs while you are there. Then look at how the standard build hands these out, because a permission answered wrongly once stays wrong forever and nobody gets an error.",
    wrongReflex: "reinstalling the application",
    wrongWhy: "The application is current, licensed and signing in \u2014 and on most platforms a reinstall keeps the permission decisions anyway, so it comes back behaving identically half an hour later.",
    evidence: "The camera permission denied for the application, on a device whose camera works in every other application"
  }
];

/* ---------------- the device ---------------- */
export function buildDevice(r, fault) {
  var models = [
    { name: "Pilot 7", newPrice: 430, screenRepair: 155, batteryRepair: 72, portRepair: 0, camRepair: 64 },
    { name: "Pilot 7 Compact", newPrice: 350, screenRepair: 138, batteryRepair: 68, portRepair: 0, camRepair: 58 },
    { name: "Aria X2", newPrice: 620, screenRepair: 210, batteryRepair: 88, portRepair: 0, camRepair: 92 },
    { name: "Fieldmate 4 rugged", newPrice: 780, screenRepair: 245, batteryRepair: 96, portRepair: 0, camRepair: 110 },
    { name: "Aria Lite", newPrice: 240, screenRepair: 128, batteryRepair: 64, portRepair: 0, camRepair: 52 }
  ];
  var m = r.pick(models);
  var ageMonths = r.int(4, 46);
  var warranty = ageMonths <= 12;
  /* A device the business bought at full price loses value like everything
     else. This is the number the repair has to be weighed against, and it is
     not the price on the invoice three years ago. */
  var residual = Math.max(40, Math.round(m.newPrice * Math.pow(0.78, ageMonths / 12) / 5) * 5);

  var health = fault.key === "battery" ? r.int(58, 76) : r.int(86, 99);
  var cycles = fault.key === "battery" ? r.int(780, 1450) : r.int(90, 520);

  return {
    model: m.name,
    imei: "35" + r.int(1000000, 9999999) + "" + r.int(10000, 99999),
    ageMonths: ageMonths,
    warranty: warranty,
    newPrice: m.newPrice,
    residual: residual,
    screenRepair: m.screenRepair,
    batteryRepair: m.batteryRepair,
    camRepair: m.camRepair,
    os: r.pick(["17.2", "17.4", "18.0", "18.1"]),
    osCurrent: r.pick(["18.1", "18.2"]),
    storageGb: r.pick([64, 128, 256]),
    batteryHealth: health,
    cycles: cycles,
    /* Whether anyone has ever backed this thing up. It is the first question
       on any repair-or-replace decision and the one most often skipped. */
    lastBackup: r.pick(["never", "never", "3 weeks ago", "last night", "8 months ago"])
  };
}

/* What the repair for this fault actually costs, and whether there is one. */
export function repairCost(dev, fault) {
  if (fault.key === "digitizer") return dev.screenRepair;
  if (fault.key === "battery" || fault.key === "swollen") return dev.batteryRepair;
  if (fault.key === "rearcam") return dev.camRepair;
  /* A clean-out, a brush or a peel: real work, no part, no cost. */
  if (fault.key === "port" || fault.key === "speaker" || fault.key === "protector") return 0;
  return null;                                      // nothing to repair
}

/* ---------------- the decision ----------------
   Four outcomes, and which one is right is a function of warranty, age,
   what the repair costs against what the device is worth, and whether the
   fault is physical at all. */
export const OUTCOMES = [
  { key: "warranty", label: "Raise a warranty claim with the manufacturer" },
  { key: "repair", label: "Repair it — order the part and fit it" },
  { key: "clean", label: "Fix it on the spot with no parts at all" },
  { key: "replace", label: "Replace the device and retire this one" },
  { key: "configure", label: "Change the configuration — there is nothing physically wrong" },
  { key: "nothing", label: "Wipe and reissue the device from stock" }
];

export function correctOutcome(dev, fault) {
  if (fault.kind === "config") return "configure";
  if (fault.key === "port" || fault.key === "speaker" || fault.key === "protector") return "clean";
  /* Two faults where the economics do not get a vote for reasons that have
     nothing to do with money. A triggered liquid indicator ends the warranty
     conversation and leaves a board that will fail again on its own
     schedule; a model outside its support window cannot be given the
     operating system the work needs, whatever anybody spends on it. */
  if (fault.key === "liquid" || fault.key === "eol") return "replace";
  /* A swollen cell is the one fault on this track where the economics do not
     get a vote. It comes out of service today whatever it is worth and
     whatever the warranty says, because it is a hazard rather than a
     malfunction. */
  if (fault.key === "swollen") return "replace";
  if (dev.warranty) return "warranty";
  var cost = repairCost(dev, fault);
  /* The rule most shops actually use: if the repair is more than about half
     what the device is now worth, you are pouring money into it. */
  return cost > dev.residual * 0.5 ? "replace" : "repair";
}

export function outcomeWhy(dev, fault, chosen) {
  var right = correctOutcome(dev, fault);
  var cost = repairCost(dev, fault);
  if (chosen === right) {
    return {
      configure: "Nothing here is physically broken. " + fault.fixes + " No part, no claim, no replacement — just the setting that was wrong.",
      clean: fault.key === "speaker"
        ? "An earpiece mesh full of pocket debris is two minutes with a soft brush, and the loudspeaker test told you it was that before you touched it. No part, no cost, no downtime."
        : fault.key === "protector"
        ? "The protector comes off in under a minute and touch is perfect underneath it. A $" + dev.screenRepair + " screen repair was one peel away from being ordered on this ticket, and the only thing standing between the two was looking at the glass under a raking light."
        : "A charging port full of pocket lint is five minutes with a plastic pick, and it is astonishing how often it gets replaced instead. No part, no cost, no downtime.",
      warranty: "The device is " + dev.ageMonths + " months old and still under cover. Opening it yourself ends that cover and puts the cost on the customer, which is the opposite of your job here.",
      repair: "The repair is $" + cost + " against a device now worth about $" + dev.residual + ". That is well under half, so repairing is the cheaper of the two real options.",
      replace: fault.key === "liquid"
        ? "Liquid damage is not covered, so there is no claim to make however new the device is — that is what the indicator is for. And a board with corrosion on it is not repaired, it is postponed: it works today and it will stop on a day you do not choose, probably on site. It comes out of service and the user gets a device from stock."
        : fault.key === "eol"
        ? "There is nothing wrong with it, and that is the point. The model is outside its support window, so the operating system the work needs is one nobody can give it. No repair, no setting, no claim — the device has simply reached the end and the fleet plan should have seen it coming."
        : fault.key === "swollen"
        ? "A swollen cell comes out of service today, and the economics do not get a vote. It is not charged, not pressed, not opened at the desk and not put in a bin — it goes out as hazardous waste and the user gets a replacement device. This is the one ticket on this track where the cheapest answer is also the wrong question."
        : "The repair is $" + cost + " against a device now worth about $" + dev.residual +
        ". Spending more than half a device's remaining value on one fault is how a fleet budget disappears — retire it and reissue."
    }[right];
  }
  return {
    configure: "There is a physical fault here. Changing settings will not mend it.",
    clean: "Nothing on this ticket is going to be fixed by cleaning a port.",
    warranty: fault.key === "liquid"
      ? "The liquid contact indicator is triggered, and liquid damage is excluded from the cover. The claim comes back refused in a fortnight with the device in somebody else's hands."
      : dev.warranty
      ? "It is under warranty, but this is not a warranty fault."
      : "The device is " + dev.ageMonths + " months old. The warranty ran out at twelve, so there is no claim to make.",
    repair: cost === null
      ? "There is no part to fit. Nothing here is physically broken."
      : "You can repair it for $" + cost + ", but weigh that against the $" + dev.residual + " the device is now worth before you do.",
    replace: cost === null
      ? "Retiring a working device because a setting is wrong is an expensive way to change a setting."
      : "Replacing costs the business the whole residual value of a device that a $" + cost + " repair would fix.",
    nothing: "Wiping and reissuing loses the user's data and does not address what is actually wrong."
  }[chosen];
}

/* The backup question sits in front of everything. A device that has never
   been backed up does not leave the desk, whatever the decision. */
export function backupFirst(dev, fault) {
  var risky = ["warranty", "repair", "replace", "nothing"].indexOf(correctOutcome(dev, fault)) !== -1;
  return {
    required: risky,
    state: dev.lastBackup,
    why: risky
      ? (dev.lastBackup === "never" || /months/.test(dev.lastBackup)
        ? "The last backup was " + dev.lastBackup + " and the device is about to leave the user's hands. Back it up before anything else, or the fault becomes the smallest part of this ticket."
        : "The last backup was " + dev.lastBackup + ", which is current enough to proceed.")
      : "Nothing here removes the device from the user, so there is no data at risk in the fix itself. Check the backup anyway — you are holding the device and it costs a minute."
  };
}
