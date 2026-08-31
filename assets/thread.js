/* =====================================================================
   Field Service Center — the objective thread

   A student working a laptop ticket is not working "objective 1.1" for
   twenty minutes. They spend two minutes monitoring hardware, four minutes
   holding a tool, six minutes replacing a part and two minutes proving a
   network link came back — and those are four different objectives on the
   exam. Nobody ever tells them that, so they learn the job and then meet
   the objectives again as a list of unfamiliar sentences.

   This file is the connective tissue. Every step of every ticket declares
   which objective it is actually exercising and why, and where a step
   reaches into another objective it says so at the moment it happens, plus
   where that thread gets picked up properly later.

   Two rules, both learned the hard way on the rest of this build:

   1. It never gives anything away. The thread says WHICH objective a step
      belongs to and WHY that is the objective. It never says what the
      fault is, what the tool will show, or which part to order. A student
      who reads every word of it still has to do the whole ticket.

   2. It is written for somebody who wants the reason. "This is 2.8" is
      useless on its own. "You just chose an instrument over guessing, and
      choosing the instrument is its own objective because the wrong tool
      answers a question nobody asked" is the version worth reading.
   ===================================================================== */

/* The objectives, in the book's own numbering, so the thread and the
   navigation cannot drift apart. */
export const OBJECTIVES = {
  "1.1": "Monitor mobile device hardware and use appropriate replacement techniques",
  "1.2": "Compare and contrast accessories and connectivity options",
  "1.3": "Configure basic mobile device network connectivity and provide application support",
  "2.1": "Compare and contrast TCP and UDP ports, protocols, and their purposes",
  "2.2": "Explain wireless networking technologies",
  "2.3": "Summarize services provided by networked hosts",
  "2.4": "Explain common network configuration concepts",
  "2.5": "Compare and contrast common networking hardware devices",
  "2.6": "Configure basic wired/wireless small office/home office networks",
  "2.7": "Compare and contrast internet connection types, network types, and their characteristics",
  "2.8": "Explain networking tools and their purposes",
  "3.1": "Compare and contrast display components and attributes",
  "3.2": "Summarize basic cable types and their connectors, features, and purposes",
  "3.3": "Compare and contrast RAM characteristics",
  "3.4": "Compare and contrast storage devices",
  "3.5": "Install and configure motherboards, CPUs, and add-on cards",
  "3.6": "Install the appropriate power supply",
  "3.7": "Deploy and configure multifunction devices/printers and settings",
  "3.8": "Perform appropriate printer maintenance",
  "4.1": "Explain virtualization concepts",
  "4.2": "Summarize cloud computing concepts",
  "5.1": "Troubleshoot motherboards, RAM, CPUs, and power",
  "5.2": "Troubleshoot drive and RAID issues",
  "5.3": "Troubleshoot video, projector, and display issues",
  "5.4": "Troubleshoot common mobile device issues",
  "5.5": "Troubleshoot network issues",
  "5.6": "Troubleshoot printer issues",
  /* Not one of the twenty-seven. The mixed track needs somewhere to live and
     what it exercises is the methodology across all of domain five, so it
     gets a number of its own rather than borrowing one. Without an entry
     here the band rendered the word "undefined" where the objective's name
     should have been. */
  "5.x": "Across 5.1 to 5.6 \u2014 the ticket does not say which"
};

/* ---------------------------------------------------------------------
   The spine of a 1.1 ticket.

   1.1 is two verbs, and the ticket splits along them: you MONITOR the
   hardware for the first half and you REPLACE it in the second. Saying so
   at each step is most of what makes the objective mean anything.
   --------------------------------------------------------------------- */
const SPINE = {
  "1.1": {
    identify: {
      obj: "1.1",
      line: "You are on the monitoring half of 1.1 before you have touched the machine. " +
        "The objective says monitor the hardware — and the first thing to monitor is what " +
        "the user told you, because most of a laptop call arrives already diagnosed by " +
        "somebody who was not there."
    },
    theory: {
      obj: "1.1",
      line: "Still monitoring. The machine's own figures — battery cycles, temperatures, " +
        "drive health, the change record — are what the objective means by monitoring, and " +
        "they are free. Every one of them is available before you remove a single screw."
    },
    test: {
      obj: "1.1",
      line: "The last of the monitoring. You are choosing one test that separates two " +
        "explanations, rather than running everything and hoping. On a laptop that matters " +
        "more than anywhere else, because the next step costs you the machine in pieces."
    },
    plan: {
      obj: "1.1",
      line: "This is the replacement-techniques half of 1.1, and it is the half people skip. " +
        "The objective is not 'replace the part' — it is replace it APPROPRIATELY: the " +
        "battery comes out before anything else that carries current, and how deep the part " +
        "is buried is what the quote is actually made of."
    },
    verify: {
      obj: "1.1",
      line: "Monitoring again, at the other end. A replacement is not finished when the part " +
        "is in; it is finished when the figures you read before the job read correctly after it, " +
        "and when everything the machine did before it came apart it still does."
    },
    document: {
      obj: "1.1",
      line: "The part of 1.1 that pays you back in six months. What went in, what came out, " +
        "what it cost and what you saw on the way — because the next technician on this " +
        "asset is you, with no memory of any of it."
    }
  },

  /* 1.3 — configure connectivity and provide application support.
     Nothing comes apart on this half of the mobile track. The device is
     healthy and something about how it is set up, enrolled or permitted is
     not, which makes the discipline entirely different: you are reading
     state rather than reading damage. */
  "1.3": {
    identify: {
      obj: "1.3",
      line: "Before anything else, work out whether this is a configuration call at all. " +
        "1.3 is about how a device is set up and supported, not about what has broken on it " +
        "\u2014 and half of what gets reported as a broken phone is a setting somebody changed."
    },
    theory: {
      obj: "1.3",
      line: "Read the state. Signal, registration, the data path, enrolment, what the " +
        "applications are permitted to do \u2014 all of it is on the device and free to look at. " +
        "A configuration fault is visible in a panel; you do not have to earn it."
    },
    test: {
      obj: "1.3",
      line: "One test that separates two settings. On this half of the track that usually means " +
        "comparing this device against one standing beside it, because two handsets on the same " +
        "policy that behave differently have a difference you can find."
    },
    plan: {
      obj: "1.3",
      line: "The support half of the objective. The fix is a setting, a permission, a profile or " +
        "a pairing \u2014 and the discipline is to change the one thing that is wrong rather than " +
        "resetting the device, which fixes everything and teaches nobody anything."
    },
    verify: {
      obj: "1.3",
      line: "Prove the actual work works, not that a toggle moved. The user rang about a job, " +
        "not about a setting, so the test is the job: the call completes, the photo uploads, " +
        "the door opens."
    },
    document: {
      obj: "1.3",
      line: "Configuration faults come in batches, because policies are pushed to fleets rather " +
        "than to handsets. Write down what was set wrong and why, because the next twelve " +
        "tickets are probably the same one."
    }
  },

  /* 5.4 — troubleshoot common mobile device issues. The other half of the
     same track, and the reason it is worth keeping the track whole: a caller
     cannot tell you which of these two they have got. */
  "5.4": {
    identify: {
      obj: "5.4",
      line: "Something physical is suspected. Establish what was actually observed before you " +
        "accept that \u2014 a handset that \u201cbroke itself\u201d has usually been dropped, charged on the " +
        "wrong thing, or had an accessory fitted to it."
    },
    theory: {
      obj: "5.4",
      line: "The device in your hand is the instrument. Health figures, cycle counts, indicators, " +
        "and what you can see under a raking light \u2014 mobile troubleshooting is unusually visual " +
        "because there is almost nothing to take apart before you have decided."
    },
    test: {
      obj: "5.4",
      line: "Substitute or compare. Speaker against loudspeaker, this handset against another on " +
        "the same policy, the screen with an accessory on and off. One change at a time."
    },
    plan: {
      obj: "5.4",
      line: "The decision is economic before it is technical. What the repair costs against what " +
        "the device is now worth decides it \u2014 except on the two tickets where a hazard or a " +
        "support window overrules the arithmetic entirely."
    },
    verify: {
      obj: "5.4",
      line: "Everything it did before must still work, and the backup question comes before the " +
        "device leaves your hands rather than after."
    },
    document: {
      obj: "5.4",
      line: "Record what the device is worth, what was done and what it cost, because a fleet " +
        "decision is made out of twenty of these and not out of one."
    }
  },

  /* ------------------------------------------------------------------
     The eight objectives the thread did not reach.

     For a long time the band only rendered on the laptop and mobile tracks,
     which meant eleven of the thirteen tracks said nothing at all about
     which objective a student was working. The point of the exercise, in the
     words of the person who asked for it, is that they need to understand
     the why — and a ticket that never names its objective is a ticket you
     can finish without ever learning what it was for.
     ------------------------------------------------------------------ */

  /* 5.1 — troubleshoot motherboards, RAM, CPUs and power.
     Hardware and power both land here. */
  "5.1": {
    identify: {
      obj: "5.1",
      line: "The objective names four things and the caller will name none of them. " +
        "\u201cIt will not turn on\u201d covers a dead supply, a shorted board, a module that " +
        "never seated and a wall socket, and your first job is to stop that list getting " +
        "shorter for the wrong reason."
    },
    theory: {
      obj: "5.1",
      line: "This is the objective where guessing costs the most, because three of its four " +
        "subjects are the most expensive parts in the machine. A theory here is a statement " +
        "about WHICH of the four, and about what would prove it."
    },
    test: {
      obj: "5.1",
      line: "Here 5.1 stops being a list of parts. A POST code, a panel lamp, a rail voltage, " +
        "a temperature \u2014 each rules out a whole subject of the objective, and one of them " +
        "will rule out the one you were about to order."
    },
    plan: {
      obj: "5.1",
      line: "The diagnosis ends here and the fit begins: socket, memory type, form factor, " +
        "wattage. A correct diagnosis and the wrong part is still a second visit, which is " +
        "why this step is graded on the order and not on the answer."
    },
    verify: {
      obj: "5.1",
      line: "Boards, memory, processors and supplies all fail intermittently, which makes " +
        "\u201cit is working now\u201d the weakest sentence on this objective. Load it, warm it, " +
        "and read the same figures you read before you started."
    },
    document: {
      obj: "5.1",
      line: "Write down what you MEASURED, not what you concluded. The rail voltages and the " +
        "POST code are what let the next person tell a second failure from the same one " +
        "coming back."
    }
  },

  /* 5.2 — troubleshoot drive and RAID issues. */
  "5.2": {
    identify: {
      obj: "5.2",
      line: "The one objective where the wrong first move destroys the thing you were called " +
        "about. Before any theory at all: is this a redundancy fault or a data-loss event, " +
        "and is there a backup?"
    },
    theory: {
      obj: "5.2",
      /* Reworded: this used to say "an array has a state and every member has
         a state", which is a paraphrase of the isolating test's own label and
         therefore told the student at step two what to run at step three.
         A theory block should say what the theory must ASSERT, not how to go
         and find it. */
      line: "A theory here has to be more specific than \u201ca disk has failed\u201d. Which one, " +
        "and has this array already spent the redundancy it had, or is it still carrying " +
        "it? Those are two different tickets with two different urgencies."
    },
    test: {
      obj: "5.2",
      line: "Read the controller, slot by slot. The front of the enclosure tells you almost " +
        "nothing \u2014 every carrier is the same colour and the same shape, and which one is " +
        "failing is on a screen rather than on the machine."
    },
    plan: {
      obj: "5.2",
      line: "There is exactly one irreversible action in this objective, and knowing which " +
        "one it is is most of the objective. Classify first \u2014 redundancy or data \u2014 and " +
        "only then act."
    },
    verify: {
      obj: "5.2",
      line: "A rebuild is not a fix until it finishes. Watch it to completion, confirm the " +
        "array is redundant again rather than merely running, and check the backup still works."
    },
    document: {
      obj: "5.2",
      line: "Slot numbers and serials, and the state before and after. An array that loses a " +
        "second member within a month is a batch, and only the record makes that visible."
    }
  },

  /* 5.3 — troubleshoot video, projector and display issues. */
  "5.3": {
    identify: {
      obj: "5.3",
      line: "Half of this objective is deciding whether a picture is being made at all. " +
        "\u201cThe screen is black\u201d and \u201cthe screen is dark\u201d are different faults, and " +
        "callers use the two phrases interchangeably."
    },
    theory: {
      obj: "5.3",
      line: "Everything between the application and the glass can break: the source, the " +
        "cable, the input selection, the backlight, the panel. A theory here names one link " +
        "in that chain rather than the chain."
    },
    test: {
      obj: "5.3",
      line: "Two tests on this objective cost nothing and halve the problem twice \u2014 a torch " +
        "held against the screen, and a display you know works. Both come before anything " +
        "comes apart."
    },
    plan: {
      obj: "5.3",
      line: "On a bonded assembly the part you name is the part that gets ordered, and panel " +
        "and digitizer arrive as one. On two of these tickets the answer is a setting, and " +
        "the right plan changes nothing physical at all."
    },
    verify: {
      obj: "5.3",
      line: "Check it at the resolution and refresh the user actually works at, on the input " +
        "they actually use. A picture at the default proves only that a default works."
    },
    document: {
      obj: "5.3",
      line: "Which link in the chain it was, and what the display did in its first two " +
        "seconds. That is the detail nobody records and everybody wants next time."
    }
  },

  /* 5.5 — troubleshoot network issues. Networking and cabling both land here. */
  "5.5": {
    identify: {
      obj: "5.5",
      line: "A network fault is always reported by the application that broke and never by " +
        "the layer that broke. \u201cEmail is down\u201d is a symptom of eight different faults and " +
        "a fact about none of them."
    },
    theory: {
      obj: "5.5",
      line: "Work up from the bottom. A theory that starts at the application has skipped the " +
        "four layers underneath it, which is where the fault nearly always is."
    },
    test: {
      obj: "5.5",
      line: "One command on the machine that works, the same command on the machine that does " +
        "not, and the difference between the two. A great deal of this objective is that " +
        "single comparison."
    },
    plan: {
      obj: "5.5",
      line: "Configure it against the site's real topology rather than the one in your head. " +
        "An address, a mask, a gateway and a name server that are each plausible and " +
        "collectively wrong is the commonest way this step is failed."
    },
    verify: {
      obj: "5.5",
      line: "Test the thing the user complained about, not the thing you changed. A ping that " +
        "answers is not an application that opens."
    },
    document: {
      obj: "5.5",
      line: "The values before and the values after. A network that was changed and not " +
        "recorded is the reason the next fault on it takes a day instead of an hour."
    }
  },

  /* 5.6 — troubleshoot printer issues. Laser, inkjet and printer networking. */
  "5.6": {
    identify: {
      obj: "5.6",
      line: "A print job passes through an application, a driver, a queue, a network and a " +
        "device, and the caller has no idea which of the five they are describing. " +
        "\u201cThe printer is broken\u201d is a statement about the last one and evidence about none."
    },
    theory: {
      obj: "5.6",
      line: "The device is the thing people reach for first and the thing least often at " +
        "fault. A theory on this objective says WHERE between the application and the paper " +
        "the job actually stops."
    },
    test: {
      obj: "5.6",
      line: "The device's own status page is free and it carries the page counts, the " +
        "maintenance interval and the error log \u2014 which between them decide whether you are " +
        "looking at a fault or at a service that is overdue."
    },
    plan: {
      obj: "5.6",
      line: "What you build here is a PROCEDURE, in order, with the safety steps in it. A " +
        "correct part fitted in the wrong order is how somebody gets burned on a fuser, and " +
        "the order is graded for that reason."
    },
    verify: {
      obj: "5.6",
      line: "Print the job that failed, from the machine it failed on, as the user it failed " +
        "for. A test page from the front panel proves the engine works and nothing else."
    },
    document: {
      obj: "5.6",
      line: "The page count at the time, and what was replaced. Printer faults recur on a " +
        "schedule, and the count is the only thing that makes the schedule visible."
    }
  },

  /* 4.1 — explain virtualization concepts. */
  "4.1": {
    identify: {
      obj: "4.1",
      line: "The caller is describing a machine and the machine is not real. Sort what they " +
        "told you into what is about the guest and what is about the host it is a tenant of, " +
        "because those have different owners and different fixes."
    },
    theory: {
      obj: "4.1",
      line: "A host owns a fixed amount of everything, and virtualization is the act of " +
        "promising it several times over. A theory on this objective usually names which " +
        "resource has been promised past what exists."
    },
    test: {
      obj: "4.1",
      line: "Read the host rather than the guest. Memory assigned against memory present, " +
        "vCPU committed against cores owned, space promised against space held \u2014 each one " +
        "is a number against a limit."
    },
    plan: {
      obj: "4.1",
      line: "The commonest correct answer on this objective is to change nothing. Most of " +
        "what breaks on a virtual platform is a setting or a policy rather than a shortage, " +
        "and rebalancing a sound allocation makes a second fault out of the first."
    },
    verify: {
      obj: "4.1",
      line: "Check the guest AND its neighbours. A host is shared, and a fix that takes " +
        "memory back from something else has moved the fault rather than cleared it."
    },
    document: {
      obj: "4.1",
      line: "What was assigned before and after, on every guest you touched. A capacity plan " +
        "nobody wrote down is a capacity plan nobody can honour."
    }
  },

  /* 4.2 — summarize cloud computing concepts. */
  "4.2": {
    identify: {
      obj: "4.2",
      line: "The service is not in this building and neither is the fault. Establish what is " +
        "actually being reported \u2014 a service, a subscription, a licence, or the link to it " +
        "\u2014 because only one of those is yours to fix."
    },
    theory: {
      obj: "4.2",
      line: "On this objective the thing that broke is very often not a thing: a licence " +
        "never assigned, a quota reached, a region chosen badly, a retention period that " +
        "quietly expired."
    },
    test: {
      obj: "4.2",
      line: "The evidence is in a console rather than on a bench, and it is nearly always a " +
        "number against a stated limit. Read the limit before you read the number, or the " +
        "number tells you nothing."
    },
    plan: {
      obj: "4.2",
      line: "There is usually nothing to repair. The action is administrative, and knowing " +
        "that is what the objective is for \u2014 buying hardware to fix a subscription is the " +
        "expensive mistake this exists to prevent."
    },
    verify: {
      obj: "4.2",
      line: "Confirm it from the user's side of the service, not the administrator's. A " +
        "console that says the licence is assigned is not an application that opens."
    },
    document: {
      obj: "4.2",
      line: "Which subscription, which tenant, which region. Cloud faults recur across a " +
        "fleet, and only the specifics make the pattern show up."
    }
  },

  /* 5.x — the mixed track. Not one of the twenty-seven, and deliberately so:
     what it exercises is the methodology itself, on a ticket that refuses to
     say which domain it belongs to. */
  "5.x": {
    identify: {
      obj: "5.x",
      line: "Nothing here tells you which domain this belongs to, and that is the exercise. " +
        "Scope it before you theorise: what is actually broken, and whose objective is it? " +
        "The domain the caller reports from is very often not the domain the fault is in."
    },
    theory: {
      obj: "5.x",
      line: "A theory formed in the wrong domain sends you to the wrong instruments and " +
        "wastes the visit. The first real decision on this ticket is which of the five " +
        "domains you are standing in."
    },
    test: {
      obj: "5.x",
      line: "Reach for the instrument the domain calls for \u2014 and notice, while you do, how " +
        "little of the method changes when the domain does. Six steps, every time, whatever " +
        "is broken."
    },
    plan: {
      obj: "5.x",
      line: "One action fixes this. The work was the scoping; the plan is only what follows " +
        "from having scoped it correctly."
    },
    verify: {
      obj: "5.x",
      line: "Verify in the domain the fault was in, which may not be the domain it was " +
        "reported from. Checking that the printer prints does not close a ticket whose fault " +
        "was on a switch port."
    },
    document: {
      obj: "5.x",
      line: "Record the domain as well as the fix. A ticket that crossed domains once is the " +
        "one most likely to be mis-routed the second time."
    }
  }
};

/* Some tracks sit on one objective. The mobile track sits on two, and which
   one a ticket belongs to is a property of the fault rather than the track —
   which is the point of keeping it whole: the caller cannot tell you whether
   they have a configuration problem or a broken phone, and neither can you
   until you have looked. */
const FAULT_PRIMARY = {
  wificall: "1.3", cellular: "1.3", mdm: "1.3", profile: "1.3", backupfail: "1.3",
  storage: "1.3", nfcoff: "1.3", eol: "1.3",
  hotspot: "1.3", btpair: "1.3", captiveportal: "1.3", vpnalways: "1.3", appperm: "1.3",
  battery: "5.4", speaker: "5.4", swollen: "5.4", port: "5.4", digitizer: "5.4",
  overheat: "5.4", protector: "5.4", rearcam: "5.4", liquid: "5.4"
};

export function primaryFor(fault, trackDefault) {
  /* A fault's own tag wins where it names the objective outright. The cloud
     track is 4.1 or 4.2 depending on whether the subject is the hypervisor
     or the service, and that is recorded in the content rather than in a
     second list here \u2014 a second list is a thing that goes stale the first
     time a fault is added. */
  /* ...but only on the track that split is about. Two MIXED tickets are
     tagged 4.2 as their real domain, and reading the tag blindly moved them
     onto the cloud spine \u2014 which would have told a student which domain
     they were in on the one track whose entire exercise is that nobody
     tells them. */
  if (trackDefault === "4.1") {
    var own = String(fault.objective || "").split(/[+/]/)[0].trim();
    if (own === "4.1" || own === "4.2") return own;
  }
  return FAULT_PRIMARY[fault.key] || trackDefault;
}

/* ---------------------------------------------------------------------
   Where a ticket reaches into another objective.

   Keyed by fault, and placed at the step where it genuinely happens rather
   than listed at the top where nobody would connect it to anything. Each
   one carries a `forward` — the honest statement that this is a passing
   touch and the objective has a whole section of its own coming.
   --------------------------------------------------------------------- */
const CROSSES = {
  lapwifi: [
    { at: "test", obj: "2.8",
      line: "Stop and notice what you just did. You reached for an instrument instead of a " +
        "guess — signal strength read at the machine, against the same reading from a device " +
        "standing beside it. Choosing the right instrument is its own objective, because the " +
        "wrong one answers a question nobody asked and costs you an hour.",
      forward: "2.8 is where the tools get taken seriously on their own: what a Wi-Fi analyser " +
        "tells you that a laptop's signal bars do not, and when a tone probe beats guessing." },
    { at: "verify", obj: "5.5",
      line: "Proving the link came back is network troubleshooting, not laptop repair. You are " +
        "not asking 'is the part fitted' — you are asking 'does traffic move', and those are " +
        "different questions with different evidence behind them.",
      forward: "5.5 turns this around: the network is the fault rather than a symptom of a " +
        "loose lead, and the machine in front of you is healthy the whole way through." },
    { at: "plan", obj: "2.2",
      line: "However this one resolves, the band a laptop associates on decides how far it " +
        "reaches and how much it carries. There are two of them, a machine can hold one " +
        "perfectly while failing on the other, and \u201cworks in this room, not that one\u201d is a " +
        "sentence you will hear for the rest of your career.",
      forward: "2.2 is the wireless standards themselves — which band reaches further, which " +
        "carries more, and why a laptop can show full bars and still be on the wrong one." }
  ],
  lapssd: [
    { at: "theory", obj: "5.2",
      line: "The attributes you are reading are drive troubleshooting. A drive that is failing " +
        "and a drive that has failed look identical from the outside and completely different " +
        "in SMART, which is the whole reason the objective exists.",
      forward: "5.2 puts this on arrays, where one failing member is a job today and two is a " +
        "restore from a backup that may never have run." },
    { at: "plan", obj: "3.4",
      line: "Choosing the replacement is a storage-devices question before it is a repair one. " +
        "Interface, form factor and capacity all have to line up, and a drive that fits the " +
        "bay and not the bus is a wasted trip.",
      forward: "3.4 is where the device types get compared properly — what actually separates " +
        "the options and which one belongs in which machine." }
  ],
  lapram: [
    { at: "test", obj: "5.1",
      line: "One module at a time is the memory half of 5.1. It is the oldest test in the " +
        "trade and it works because it changes exactly one thing.",
      forward: "5.1 is the same reasoning applied to a desktop, where the board, the processor " +
        "and the supply are all in play and any of them can produce this." },
    { at: "plan", obj: "3.3",
      line: "Matching the replacement is a RAM-characteristics question. Type, speed, capacity " +
        "and form factor — and SODIMM against UDIMM is the one that gets ordered wrong.",
      forward: "3.3 compares those characteristics head-on, including the ones that only bite " +
        "when you mix two modules." }
  ],
  lapdisplaycable: [
    { at: "theory", obj: "5.3",
      line: "You are separating a panel from what drives it, which is the display-troubleshooting " +
        "objective in one sentence. An external monitor answers it in thirty seconds.",
      forward: "5.3 covers the rest of it — backlight against panel, and a projector that is " +
        "not a lamp problem." },
    { at: "plan", obj: "3.1",
      line: "What you are about to reseat feeds a panel with its own attributes — resolution, " +
        "refresh, panel type. Knowing which panel is in this lid is what stops a replacement " +
        "arriving that fits mechanically and looks wrong.",
      forward: "3.1 is display components and attributes as a subject in its own right." }
  ],
  laphinge: [
    { at: "theory", obj: "5.3",
      line: "A hinge is a mechanical fault with a video symptom, and that pairing is why this " +
        "one gets misdiagnosed. The picture changes when the lid moves, which is not something " +
        "a panel does on its own.",
      forward: "5.3 is where video faults are diagnosed without the mechanical clue to help you." }
  ],
  lapbatt: [
    { at: "identify", obj: "5.4",
      line: "A swollen cell is a mobile-device issue and a hazard in the same object. The " +
        "objective covers both, and the hazard half outranks everything else on this ticket.",
      forward: "5.4 covers the rest of the mobile symptoms, most of which are not dangerous " +
        "and none of which look like this." }
  ],
  lapthermal: [
    { at: "theory", obj: "5.1",
      line: "Temperature under load against fan behaviour is thermal troubleshooting, and the " +
        "same reasoning runs on any machine with a fan in it.",
      forward: "5.1 does this on a desktop, where the cooler is bigger, the airflow is yours to " +
        "design, and the failure modes are the same." }
  ],
  lapdc: [
    { at: "test", obj: "5.1",
      line: "You are testing a power path, which is the power quarter of 5.1. Whether charge " +
        "reaches the board is a different question from whether the battery holds it.",
      forward: "5.1 and 3.6 take power apart properly — rails, tolerances and what a supply " +
        "does as it dies." }
  ],
  lapboard: [
    { at: "plan", obj: "5.1",
      line: "Concluding it is the board is the end of 5.1's reasoning, not the start of it. " +
        "Everything cheaper has to be cleared first, and on a laptop the board is most of the " +
        "machine's value.",
      forward: "5.1 on a desktop gives you the same conclusion at a tenth of the cost, which " +
        "is worth knowing before you quote this one." }
  ],
  laptrack: [
    { at: "test", obj: "5.4",
      line: "An input device that works intermittently after the machine is flexed is a mobile " +
        "hardware symptom, and the test is mechanical rather than electrical.",
      forward: "5.4 covers the same class of fault on handsets, where there is no ribbon you " +
        "can reseat." }
  ],
  lapkbd: [
    { at: "test", obj: "5.4",
      line: "Substituting an external keyboard splits the input device from what reads it, " +
        "which is the whole diagnostic move on this class of fault.",
      forward: "5.4 is where input, display and battery symptoms get separated on a device you " +
        "cannot plug anything into." }
  ],
  lapfan: [
    { at: "theory", obj: "5.1",
      line: "A bearing you can hear is a fault you diagnose with your ears before any " +
        "instrument, and noise-against-temperature is a real reading.",
      forward: "5.1 covers cooling where the noise is normal and the temperature is not." }
  ],
  lapspeaker: [
    { at: "test", obj: "5.4",
      line: "Substituting the output path — headset against internal speaker — is the same " +
        "move as swapping a monitor, applied to audio.",
      forward: "5.4 has the handset version, where the earpiece and the loudspeaker are two " +
        "separate parts that fail separately." }
  ],
  lapwebcam: [
    { at: "identify", obj: "5.4",
      line: "The free explanations come first. Monitoring hardware means exhausting everything " +
        "that costs nothing before you quote anything that does \u2014 and on this class of fault " +
        "there is usually more than one thing in that category.",
      forward: "5.4 has more of these — symptoms with a free explanation that people " +
        "quote for anyway." }
  ],
  lapsoldered: [
    { at: "theory", obj: "3.3",
      line: "What is fitted, and what CAN be fitted, are two different readings. Type, speed, " +
        "capacity, form factor and how much of it is even removable \u2014 those are RAM " +
        "characteristics, and they decide the answer here before any part is ordered.",
      forward: "3.3 compares those characteristics on their own terms, including the ones that " +
        "only matter when you try to mix two modules." }
  ],
  lapadhesive: [
    { at: "plan", obj: "5.4",
      line: "This is the sharpest version of \u201cappropriate replacement techniques\u201d on the whole " +
        "track. The part is ordinary and the method is the entire job \u2014 get the technique " +
        "wrong here and the failure mode is not a broken clip, it is a fire.",
      forward: "5.4 covers the handset equivalents, where almost everything is bonded and there " +
        "is no version of the job that does not involve adhesive." }
  ],
  lapm2key: [
    { at: "plan", obj: "3.4",
      line: "This one never becomes a repair, because the fault is an ordering decision that was " +
        "made before you arrived. Knowing what actually separates one storage device from " +
        "another is what stops the same parcel arriving twice.",
      forward: "3.4 is where those distinctions get compared properly \u2014 interface against form " +
        "factor against keying, which are three things people treat as one." }
  ],
  lappaste: [
    { at: "test", obj: "5.1",
      line: "Reading two temperatures against each other, rather than one against a number you " +
        "remember, is thermal troubleshooting. The comparison is the measurement.",
      forward: "5.1 runs the same reasoning on a desktop, where the cooler is bigger, the airflow " +
        "is yours to design, and the failure modes are identical." }
  ],
  lapbacklight: [
    { at: "test", obj: "5.3",
      line: "A torch and a spare monitor settle this in four minutes, and between them they " +
        "separate three things people treat as one: the panel, what lights it, and what feeds " +
        "it a picture.",
      forward: "5.3 takes that apart properly, including the projector faults that look like a " +
        "lamp and are not." },
    { at: "plan", obj: "3.1",
      line: "What you order depends on how the assembly is built \u2014 whether the part that failed " +
        "is separately serviceable on this chassis or arrives bonded to everything around it. " +
        "That is a display-components question and it changes the quote by a factor of five.",
      forward: "3.1 is display components and attributes as a subject: what the layers are, what " +
        "each one does, and which of them can be bought on its own." }
  ],
  /* ---- the mobile track ----
     Deliberately dense. Every one of these reaches somewhere, because a
     handset is the most cross-objective device in the whole exam: it is
     hardware, it is a network client, it is an accessory host and it is an
     application platform, all at once and all in one hand. */
  wificall: [
    { at: "theory", obj: "2.2",
      line: "Two radios, and the question is which one should be carrying this. Knowing what " +
        "each is good for \u2014 range against throughput, what concrete does to one and not the " +
        "other \u2014 is a wireless-technologies question before it is a handset question.",
      forward: "2.2 is those technologies on their own terms: the standards, the bands, and why " +
        "a device can show full bars and still be on the wrong one." },
    { at: "verify", obj: "5.5",
      line: "Proving a call completes where it previously failed is network troubleshooting. You " +
        "are not testing a toggle, you are testing whether traffic crosses the path you just " +
        "chose for it.",
      forward: "5.5 removes the handset from the story and makes the network itself the fault." }
  ],
  cellular: [
    { at: "theory", obj: "2.7",
      line: "Voice working and data not is a clue about which service is failing, not which " +
        "device. Cellular is a connection type with its own characteristics, and it fails in " +
        "its own particular ways.",
      forward: "2.7 compares the connection types properly \u2014 what each one costs you in " +
        "latency, in reach and in what happens at the edge of coverage." }
  ],
  mdm: [
    { at: "theory", obj: "2.3",
      line: "The thing that is missing lives on a server, not on the handset. Management, mail " +
        "and certificate services are all networked hosts, and what they provide is an objective " +
        "in its own right.",
      forward: "2.3 covers those services from the other end \u2014 what each one does and what " +
        "stops working when it is unreachable." }
  ],
  profile: [
    { at: "test", obj: "2.3",
      line: "You are checking something a service issued, with a validity window it set. That " +
        "is a networked-host question wearing a handset's clothes.",
      forward: "2.3 is where those services and what they hand out get covered directly." }
  ],
  backupfail: [
    { at: "plan", obj: "4.2",
      line: "Where the backup goes, what it costs and when it is allowed to run are cloud " +
        "questions. A backup policy that only runs on wireless and mains is a decision somebody " +
        "made about somebody else's bill.",
      forward: "4.2 covers the cloud concepts underneath that \u2014 what the models are and what " +
        "you are actually paying for." }
  ],
  storage: [
    { at: "theory", obj: "3.4",
      line: "Storage on a handset is soldered, fixed at purchase and shared with the operating " +
        "system \u2014 which makes it a very different device from anything with a slot in it.",
      forward: "3.4 compares storage devices where you can still choose: interface, form factor " +
        "and what each one is actually for." }
  ],
  nfcoff: [
    { at: "theory", obj: "1.2",
      line: "The short-range radio is a connectivity option, and connectivity options are their " +
        "own objective. What a device can talk to is a list, and every item on it can be " +
        "switched off independently.",
      forward: "1.2 puts every one of those options side by side, along with the accessories " +
        "that depend on them." }
  ],
  eol: [
    { at: "plan", obj: "1.1",
      line: "This is where a support call becomes a hardware decision. Nothing is broken and the " +
        "device still gets replaced, which is the part of monitoring hardware that has nothing " +
        "to do with the hardware.",
      forward: "1.1 is the rest of that: monitoring what a device is doing, and replacing what " +
        "can be replaced when it is worth replacing." }
  ],
  hotspot: [
    { at: "theory", obj: "2.6",
      line: "A handset sharing its connection is a small office network with one client and a " +
        "battery. Band, security, client count and the name it advertises are all the same " +
        "decisions you would make on a router.",
      forward: "2.6 makes those decisions properly, on equipment that is not also a telephone." }
  ],
  btpair: [
    { at: "theory", obj: "1.2",
      line: "A pairing is a connectivity option with a limit nobody reads: a bond list with a " +
        "finite number of slots in it. The accessory is fine and the list is full.",
      forward: "1.2 covers the accessories that live on the end of those pairings and what each " +
        "of them needs from the host." }
  ],
  captiveportal: [
    { at: "test", obj: "2.3",
      line: "What has not happened here is a name resolving to the address that would have " +
        "redirected you. That is a networked service doing its job somewhere else, or not " +
        "doing it here.",
      forward: "2.3 covers what those services are and what each one is responsible for." },
    { at: "verify", obj: "5.5",
      line: "Associated and not connected is the single most useful distinction in wireless " +
        "troubleshooting, and it is worth being able to say out loud: the radio link is up and " +
        "nothing is crossing it.",
      forward: "5.5 is where that distinction gets used on networks with no handset in them." }
  ],
  vpnalways: [
    { at: "plan", obj: "2.4",
      line: "Routing, name resolution and what an always-on tunnel does to local traffic are " +
        "network configuration concepts. The handset is only where you are standing.",
      forward: "2.4 covers those concepts directly \u2014 what a tunnel changes about where " +
        "traffic goes and what still resolves once it is up." }
  ],
  appperm: [
    { at: "plan", obj: "1.2",
      line: "An application asking for a camera, a location or a radio is asking for hardware, " +
        "and every one of those can be refused independently of whether it works. Denied is not " +
        "broken, and it does not look different from the outside.",
      forward: "1.2 is the connectivity options themselves, which is the other half of why an " +
        "application can be perfectly installed and still do nothing." }
  ],
  battery: [
    { at: "plan", obj: "1.1",
      line: "The decision here is the replacement-technique half of the mobile objective, and on " +
        "a handset it is almost always adhesive rather than fasteners.",
      forward: "1.1 covers monitoring and replacement on machines you can still get inside " +
        "without heat." }
  ],
  swollen: [
    { at: "identify", obj: "1.1",
      line: "A swollen cell is the one fault on this track where the objective stops being about " +
        "economics and starts being about safety. It comes out of service today.",
      forward: "1.1 has the laptop version of the same hazard, where there is more chassis " +
        "around it and exactly the same rule." }
  ],
  port: [
    { at: "theory", obj: "3.2",
      line: "You are looking into a connector and judging whether it is damaged, obstructed or " +
        "fine. Knowing what that connector should look like when it is healthy is a cable-and-" +
        "connector question.",
      forward: "3.2 is every connector you will meet, and what each one is supposed to look like." }
  ],
  digitizer: [
    { at: "theory", obj: "3.1",
      line: "Panel and touch layer are two components bonded together, and telling them apart is " +
        "a display-components question. Order the wrong one and you have bought a working part.",
      forward: "3.1 takes the display stack apart properly \u2014 what each layer does and which " +
        "of them can be bought on its own." }
  ],
  overheat: [
    { at: "identify", obj: "1.2",
      line: "The case, the cradle and the charger are accessories, and accessories cause faults. " +
        "Nothing here is wrong with the device \u2014 it is what has been fitted around it.",
      forward: "1.2 compares those accessories and what each one does to the device it is on." }
  ],
  protector: [
    { at: "test", obj: "1.2",
      line: "The fault is an accessory, and the test is to remove it. That is worth noticing: " +
        "the cheapest diagnostic on this track is taking something off rather than opening " +
        "anything up.",
      forward: "1.2 is the accessories themselves, including the ones that cause more trouble " +
        "than they prevent." }
  ],
  rearcam: [
    { at: "plan", obj: "1.1",
      line: "Whether this is worth repairing at all is the monitoring-and-replacement judgment, " +
        "and it turns on what the device is now worth rather than on what it cost.",
      forward: "1.1 is that judgment applied where the parts are larger and the arithmetic is " +
        "the same." }
  ],
  liquid: [
    { at: "plan", obj: "1.1",
      line: "A triggered indicator ends the warranty conversation before it starts, which makes " +
        "this a replacement decision rather than a repair one however well the device is " +
        "working today.",
      forward: "1.1 covers the same judgment on larger hardware, where the indicators are " +
        "harder to find and the arithmetic behind the decision is identical." }
  ],
  speaker: [
    { at: "test", obj: "1.2",
      line: "Splitting the output path \u2014 earpiece against loudspeaker against a headset \u2014 is " +
        "the move, and the headset is an accessory you keep in the van precisely for this.",
      forward: "1.2 compares those audio accessories and where each one puts the conversion." }
  ],
  lapbios: [
    { at: "plan", obj: "5.1",
      line: "Nothing comes apart on this one. A machine that can see its drive and will not " +
        "boot from it is being told not to, and firmware is where you are told.",
      forward: "5.1 covers the firmware settings that stop a desktop posting at all, which is " +
        "the louder version of this." }
  ]
};

/* ---------------------------------------------------------------------
   What to show at a given step of a given ticket.
   --------------------------------------------------------------------- */
export function threadFor(fault, step, primary) {
  var spine = SPINE[primary || "1.1"];
  if (!spine || !spine[step]) return null;
  var base = spine[step];
  var crosses = (CROSSES[fault.key] || []).filter(function (c) { return c.at === step; });
  return {
    primary: base.obj,
    primaryTitle: OBJECTIVES[base.obj],
    line: base.line,
    crosses: crosses.map(function (c) {
      return { obj: c.obj, title: OBJECTIVES[c.obj], line: c.line, forward: c.forward };
    })
  };
}

/* Every objective this ticket touches, for the header. Ordered with the
   primary first and the rest in the book's order, because a student
   scanning it should see where they are before where they are going. */
export function objectivesOn(fault, primary) {
  var p = primary || "1.1";
  var out = [p];
  (CROSSES[fault.key] || []).forEach(function (c) {
    if (out.indexOf(c.obj) === -1) out.push(c.obj);
  });
  var rest = out.slice(1).sort();
  return [p].concat(rest);
}

export { CROSSES, SPINE };
