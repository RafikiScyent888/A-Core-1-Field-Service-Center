/* =====================================================================
   Guided hints

   Nothing appears for the first two wrong answers. A student who is one
   guess from it should be allowed to get there on their own, and a page
   that starts helping the moment somebody is wrong teaches them to guess
   and wait.

   From the third wrong answer, one nudge per attempt, escalating. The
   rule every one of them obeys: NEVER the answer, and never a shortlist so
   narrow that the answer falls out of it. What they give instead is the
   thing a good instructor gives — where to look, how to reason, and which
   tempting option to rule out and why.

   The last hint in each list is deliberately the strongest, because the
   point of this is that a student who keeps working gets there. It still
   does not say the answer; it hands them the reasoning that produces it.
   ===================================================================== */

/* Where the evidence for this track physically lives on the page. Hint one
   is always "go back and read the right instrument", because most wrong
   answers on this build come from answering before reading. */
const WHERE = {
  hardware: "the POST report, the SMART table, the temperatures and the event log",
  network: "the ipconfig output, the machine at the next desk that works, the switch port and the ARP table",
  mobile: "the handset's own readouts — health and cycle count, signal and enrolment, and free space",
  cloud: "the host's memory and cores against what has been promised, the datastore latency and the spend",
  mixed: "whichever instruments this call actually needs — nothing is telling you which",
  laser: "the status page, the printer's own error log, the test print and the service manual table",
  inkjet: "the status page, the error log, the nozzle check and the ink and waste levels",
  laptop: "the machine's own figures, the change record and whichever test you can run before it comes apart",
  display: "the torch, a spare monitor, and what the device does in the first two seconds",
  cabling: "the tester's pin map, the certifier report, and the six places on the link a fault can actually live",
  power: "the rail readings against the range printed beside them, the outlet, the UPS panel, the circuit arithmetic and the input log",
  raid: "the array's state, the member list slot by slot, the controller's write policy, and the backup panel that is on every ticket on this track",
  printnet: "the device's own page, the workstation's driver and queue and port, the server queue, and the scan log \u2014 one panel per link in the chain",
};

/* The reasoning move, per kind of question. */
const HOW = {
  identify: "Split what the caller said into two piles: things they SAW, and things they CONCLUDED. " +
    "A symptom is something a camera in the room could have recorded. A conclusion is their guess at a cause.",
  cause: "Stop trying to recognise it and start ruling things out. Take each option in turn and look for the " +
    "one piece of evidence that would make it impossible. The option you cannot kill is your answer.",
  evidence: "Evidence is not the same as the symptom. The symptom is what is happening; the evidence is the " +
    "specific reading that tells you WHY, and it will be one line in one of the panels above.",
  part: "You have already confirmed the cause. This is asking you to name the thing you will actually put in " +
    "your hand — go back to what your isolating test told you and read it literally.",
  verify: "Ask what the user was doing when they called, and whether what you have just done would let them " +
    "do it again. Anything that proves the machine works but not that the job works is not verification.",
  prevent: "A preventive measure has to address THIS cause. Read each option and ask whether it would have " +
    "stopped this exact fault, or whether it is just good practice that happens to be true.",
  doc: "Write for the person who picks this ticket up in six months knowing nothing. What would they need " +
    "in order to trust your conclusion rather than just repeat your action?"
};

/* Which of the six methodology steps a question belongs to, for hint one. */
function askKind(id) {
  if (/identify-symptom/.test(id)) return "identify";
  if (/identify-backup/.test(id)) return "backup";
  if (/theory-cause|test-part|plan-action|mixed-domain/.test(id)) return "cause";
  if (/theory-evidence/.test(id)) return "evidence";
  if (/test-depth/.test(id)) return "depth";
  if (/verify-what/.test(id)) return "verify";
  if (/verify-prevent/.test(id)) return "prevent";
  if (/doc-/.test(id)) return "doc";
  return "cause";
}

/* =====================================================================
   WHERE TO LOOK, once the hints are spent.

   Derived from the same askKind() the hint text uses, so the highlight can
   never point somewhere the words contradict. Three cases, and the third is
   the one worth being honest about:

     instruments  the readings in this step. The hint for these kinds already
                  says "go back and read the instruments", and the step only
                  renders the panels it needs, so every panel in it IS the
                  right granularity.
     brief        the caller's own words. Sending a student to the SMART
                  table to settle what somebody SAID is advice that cannot
                  help, which is why the hint text refuses to do it.
     none         nothing on the page bears on it. Documentation, verification
                  and prevention are answered by reasoning about the person on
                  the other side, not by re-reading a panel. Highlighting
                  something anyway — the nearest table, the step intro — would
                  be a lie dressed as help, and a student who followed it
                  would be looking for an answer that is not there.
   ===================================================================== */
export function lookTarget(id) {
  const kind = askKind(id);
  if (kind === "identify") return "brief";
  if (kind === "doc" || kind === "verify" || kind === "prevent" || kind === "backup") return "none";
  return "instruments";
}

/* What the highlight says about itself. Never names the answer. */
export const LOOK_LABEL = {
  instruments: "The answer is in the readings, not in the options. Re-read what is marked.",
  brief: "This is settled by what the caller actually said. Re-read the marked quote, slowly.",
  none: "Nothing on this page will settle this one \u2014 that is why nothing is marked. " +
    "It is answered by thinking about the person who reads this next, not by finding a reading."
};

/* The escalating list for an ordinary graded question. */
export function questionHints(id, track, fault) {
  const kind = askKind(id);
  const where = WHERE[track] || "the panels above";
  const out = [];

  if (kind === "backup") {
    out.push("This one is not about the fault at all. It is about what you would lose if the next thing " +
      "you did went wrong.");
    out.push("The methodology puts one step ahead of every repair, and it is the same step whether the job " +
      "is five minutes behind a cover or a full rebuild. Ask what is irreplaceable here.");
    out.push("Everything on this list is something a technician might reasonably do. Only one of them protects " +
      "the customer from you. Which option leaves them no worse off if the repair goes badly?");
    return out;
  }

  if (kind === "depth") {
    out.push("This is not asking how hard the fault is to diagnose. It is asking how much of the machine has " +
      "to come apart to reach the part.");
    out.push("Look at the exploded view again. The parts are stacked by depth — how many layers do you have " +
      "to get through before you can put a hand on the one you named?");
    out.push("Anything behind the service cover is a short job. Anything that needs the board out, or that " +
      "fits from the top rather than the bottom, is the long one. Which side of that line is your part?");
    return out;
  }

  /* Step one is about the call, not the instruments — sending a student to
     the SMART table to answer a question about what the caller said is
     advice that cannot help them. */
  if (kind === "identify") {
    out.push("Nothing in the instruments will settle this one. Go back to the caller's own words at the top " +
      "of this step and read them again, slowly.");
  } else if (kind === "doc" || kind === "verify" || kind === "prevent") {
    out.push("This is not a diagnosis question, so re-reading the instruments will not help. Think about the " +
      "person on the other side of it — the user, or the technician who picks this up next.");
  } else {
    out.push("Go back and read " + where + " again. Almost every wrong answer on this page is an answer given " +
      "before the instruments were read properly.");
  }
  out.push(HOW[kind] || HOW.cause);

  /* The strongest hint: what it is NOT, and why. This eliminates the one
     option a student is most likely to have picked, and hands over the
     reasoning rather than the conclusion. */
  if (fault && fault.wrongWhy && (kind === "cause" || kind === "evidence" || kind === "part")) {
    out.push("Here is the one to rule out. The obvious answer here is " +
      (fault.wrongReflex ? "the " + fault.wrongReflex : "the first thing most people reach for") +
      " — and it is wrong, because: " + fault.wrongWhy + " Now ask what is left.");
  } else if (fault && fault.observable) {
    out.push("Read the observation once more, slowly: " + fault.observable + ". Then ask which option would " +
      "produce exactly that, and nothing more and nothing less.");
  }
  return out;
}

/* =====================================================================
   DRILL HINTS

   The drills shipped with one hint per question and repeated it forever, so
   a stuck student saw the identical sentence on the third attempt and on the
   twentieth. That is not guidance, it is a stuck record.

   This builds the same escalating ladder the tickets use WITHOUT rewriting
   eighty-two hints by hand: rung one sends them back to the instrument, rung
   two is the reasoning move for that kind of question, and rung three is the
   hint the question already carried — which was always written as the
   strongest nudge, so it belongs last rather than first.

   Unrecognised question ids fall to a general elimination move rather than
   to nothing. A drill added next year gets a working ladder on the day it is
   written, which is the failure mode this build keeps hitting: a table keyed
   by item that does not grow when the items do.
   ===================================================================== */
const DRILL_LOOK = {
  page: "Read the highlighted line again, all three columns of it. The page shows what is configured and never what it is called \u2014 that is the question.",
  rules: "Read the rule table again, line by line. The one that matters is in there with real rules around it.",
  readings: "Go back to the numbers beside the picture and read them against the range printed with them.",
  model: "Turn the model and look at it again. Nearly every wrong answer here is given before the thing was examined."
};

const DRILL_HOW = {
  name: "Do not try to recognise it whole. Take the two or three features you can actually see \u2014 how many " +
    "contacts, what shape, how it holds on \u2014 and ask which candidates each one rules OUT.",
  carries: "Ask what has to travel down it for the device on the end to work. Power, data, light, or more than one.",
  contacts: "Count what is in front of you rather than what you remember. If the two disagree, the thing in front of you is right.",
  retention: "Look at how it is held rather than what it is. Clip, thread, lugs, screw \u2014 or nothing, which is also an answer.",
  mates: "Work forward from what you have already identified it as. A connector fits its own port and nothing else.",
  lookalike: "Not the one that does the same JOB. The one that would fool you across a bench in bad light.",
  fault: "Take each option and look for the one reading that would make it impossible. The one you cannot kill is the answer.",
  spec: "The figure is printed somewhere in front of you. This is a reading question, not a memory question."
};

export function drillHints(q, instrument) {
  const out = [];
  out.push(DRILL_LOOK[instrument] || DRILL_LOOK.model);
  const kind = Object.keys(DRILL_HOW).find((k) => q.id === k || String(q.id).indexOf(k) !== -1);
  out.push(kind ? DRILL_HOW[kind]
    : "Rule things out rather than trying to recognise the answer. Take each option and look for the one " +
      "thing in front of you that makes it impossible.");
  /* The question's own hint, kept as the strongest and final rung. */
  if (q.hint) out.push(q.hint);
  return out;
}

/* The graded controls that are not ordinary questions get their own. */
export const CONTROL_HINTS = {
  locate: [
    "Read the inspection note for each part again. Most of them describe ordinary wear on a machine that " +
      "has been used, and telling wear from a fault is the whole exercise.",
    "Your isolating test named a category, not an item. Now ask which specific one — and remember that some " +
      "of these come in matched pairs where only one of them is at fault.",
    "Work from the test result rather than the picture. If a test told you which of two behaved differently, " +
      "that is the one, and the model is only there to help you point at it."
  ],
  procedure: [
    "Start from what has to be true before anything is touched, and build outward from there. The first two " +
      "or three steps of every job on this track are about making it safe to do the job at all.",
    "Take each step you have chosen and ask what it DEPENDS on. Anything that assumes the machine is safe to " +
      "put a hand inside has to come after the step that makes it safe.",
    "Read your list back as though you were carrying it out, one line at a time. The first moment you would " +
      "be reaching into something you have not yet made safe — or putting it back together before you have " +
      "proved it works — is where the order breaks. And if a step on your list would hurt you or the machine " +
      "no matter where you put it, take it off."
  ],
  cleaning: [
    "For each part, ask what it is MADE of first — rubber, foam, a coated roller, printed plastic, a sealed " +
      "assembly — and then ask what that material would not survive.",
    "Some of these are not cleaned at all. A sealed unit, or a part that is replaced on a schedule, is " +
      "damaged by being cleaned rather than helped by it.",
    "One wrong answer on this page destroys the part it is used on. If a method would dissolve something " +
      "printed, strip a coating, or put toner into the air, that is the one to keep away from — and the " +
      "part it would ruin is the one you are least sure about."
  ],
  osscope: [
    "Two facts already on the last step answer this completely, and neither of them needs a tool. Go back and " +
      "read what a second account did and what anybody else on this build reported.",
    "Work outwards. If a second account on the same machine is fine, nothing about the machine can explain it. " +
      "If a second account meets it too, ask whether anybody else has \u2014 and if they have, you are standing " +
      "at the wrong computer.",
    "There are only three answers and each one is ruled in or out by one line on the scope panel. A clean second " +
      "account rules one in. A machine nobody else reports rules another in. The same symptom on a machine you " +
      "have never touched rules the third in, and it is the one people never check for."
  ],
  ladder: [
    "Every option here would work on some ticket on this track. Ask a narrower question: which one addresses the " +
      "specific reading the tool gave you, rather than which one would probably clear it up?",
    "The list is ordered by what it costs the customer. Start at the top and work down until you reach the first " +
      "one that actually addresses what you found \u2014 not the first one you are confident in.",
    "One option on this list fixes every fault on this track, and that is exactly what makes it wrong on all of " +
      "them. If your answer would have been the same before you opened the tool, it is not an answer to what " +
      "the tool said."
  ],
  printlink: [
    "Stop asking whether the printer works and start asking how far the job got. Every panel on the last step " +
      "answers that for one link, and one of them is where the job stopped.",
    "Work forwards from the user. Did the job leave the application? Did it reach a queue anywhere? Did it reach " +
      "the device? Each of those three questions has a panel that answers it, and the first NO is your link.",
    "If nothing is in any queue, the job never got that far and the fault is on the workstation with what was sent " +
      "or where it was sent. If it is sitting in a queue, that queue is the link. If it reached the device and the " +
      "device did something wrong with it, the device is holding a setting that has gone stale."
  ],
  deploy: [
    "Two of these four are the same answer on every ticket on this track, and they are the two that this whole " +
      "track's faults keep coming from. Work out which two before you worry about the site.",
    "One option in the queue list is never correct anywhere, and one option in the address list is never correct " +
      "anywhere. Both of them are things somebody actually did, and both of them are why half these calls exist. " +
      "Rule those two out first.",
    "The two that depend on the site depend on two facts you have already been told: whether there is a print " +
      "server, and how many machines are being managed. A site with a server should be using it; a fleet large " +
      "enough to make per-model drivers a rollout should not be managing per-model drivers."
  ],
  raidclass: [
    "This is not a judgement call and it is not about how bad the phone call sounded. It is two numbers: what " +
      "the level tolerates, and how many members are no longer contributing to it.",
    "Work out what is left of the tolerance first. If something is left, the data is still there. If nothing " +
      "is left but nothing more has gone, the data is still there and you have no margin. If more has gone " +
      "than the level carries, it is not there any more.",
    "There is one ticket on this track where all of that arithmetic comes out perfect and the data is gone " +
      "anyway, because what was lost was not a disk. If every member is Online and something is still " +
      "missing, ask what RAID actually protects against \u2014 and check the panel that is not part of the array."
  ],
  scope: [
    "This is not a question about how confident you are. Ask a different one: which side of the outlet is the fault " +
      "on? Everything on the customer's side is equipment. Everything on the other side is the building.",
    "Take the fix you have already decided on and ask who is allowed to carry it out. If the answer involves opening " +
      "anything that is fixed to the structure, or changing what is fed from where, it stopped being yours a step ago.",
    "There are three real calls here and one that is never right on this track. Of the three: equipment on the " +
      "customer's side is yours; fixed wiring is licensed work whoever can see the problem; and too much equipment " +
      "on one circuit is nobody's repair, because nothing is broken. Which of those three describes what you found?"
  ],
  terminate: [
    "Do not try to remember the order. Derive it. Write down the four pairs, then place the two that never " +
      "move in either standard, and see how few slots are left.",
    "Two of the four pairs sit in exactly the same slots under both standards, so half of this does not depend " +
      "on which standard you were asked for at all. The reference key in step three names them \u2014 place those " +
      "four conductors first and see how little is left to decide.",
    "The two standards differ in exactly one thing, so if you can hold one of them you can derive the other. " +
      "Orange and green trade places between pins 1-and-2 and pins 3-and-6, and nothing else moves. Within a " +
      "pair the striped conductor takes the lower-numbered slot \u2014 in three pairs out of four. One pair is the " +
      "other way round, and the reference key in step three says which. Between those rules and the four " +
      "pins that never move, there is only one arrangement left \u2014 read your slots back one at a time and " +
      "find the one that breaks a rule."
  ],
  bench: [
    "You are being timed on this. Before you run anything else, ask what each test would tell you if it came " +
      "back clean — a test whose answer changes nothing is a test not worth running.",
    "Look at what the instruments have already told you, and pick the test that would CONFIRM that rather " +
      "than the one that explores something new.",
    "The cheapest test that separates two possibilities beats the thorough one that separates none. Which " +
      "single test would let you cross off the largest number of options at once?"
  ]
};
