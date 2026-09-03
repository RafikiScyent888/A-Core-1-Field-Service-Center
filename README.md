# A+ Core 1 Field Service Center

Generated service calls for **CompTIA A+ Core 1 (220-1201)**. Each ticket is
one machine, one customer, and one fault, worked end to end through all six
steps of CompTIA's troubleshooting methodology — **gated in order**, because
that is the discipline the exam asks for and the habit the job requires.

Live site: https://rafikiscyent888.github.io/A-Core-1-Field-Service-Center/

Part of the **Cyber Warrior Program**. Same engine as the
[CySA CVSS Center](https://rafikiscyent888.github.io/CySA-CVSS-Center/) and the
[Security Awareness Center](https://rafikiscyent888.github.io/Security-Awareness-Center/),
pointed at the bench instead of the SOC.

> **Sixty-five tickets across thirteen tracks, drawn from 209 distinct faults, every one mapped to a CompTIA A+ Core 1 (220-1201) objective.**
> Every track deals five tickets from its own fault pool, so a shuffle changes
> which five you get as well as what the instruments say. Step four changes with
> the track: a part to order, a configuration to type, a decision worth real
> money, a procedure carried out in the right order without hurting yourself or
> the machine, eight conductors into eight slots, whether the job is yours at
> all, whether the data is still there, or how a device should have been
> deployed so the call stops coming. Eleven of the thirteen tracks put a 3D model
> of the real thing in front of the student, and from the third wrong answer on
> any graded control the page starts guiding rather than waiting.

## How it works

One seeded ticket object per scenario is the single source of truth. Every step
renders a different view onto it, and **every graded answer is computed from
that object rather than written beside the rows**. Press **Shuffle** and all
five tickets rebuild — the answers follow, because they were never separate
from the evidence. There is no answer bank to memorise and none to leak.

## The caller is not a reliable narrator

This is the part nobody drills, and it is step one of every ticket.

The person who raises the call is wrong in one of four realistic ways. They
report a **diagnosis** instead of a symptom — *"the graphics card has gone, I've
seen this before."* They **omit the change** — *"nothing's different, we haven't
touched anything,"* and the desks were rearranged Tuesday. They **misremember
the timing** — *"it's been doing this for months,"* and the first event log
entry is Thursday. Or they are **relaying it secondhand** and have not seen the
machine at all.

Every distortion buries a true observation inside a false frame, so the lesson
is to *separate the parts*, not to dismiss the user. Four statements are graded
**confirmed / contradicted / can't tell from here**:

- the caller's headline claim, which is wrong, and the instrument that settles it
- the observation underneath it, which holds up
- something true, checkable against the asset register, and completely beside
  the point — because a caller who is wrong about the fault is not wrong about
  everything
- something nothing on the page can settle, so **"can't tell from here" has to
  be a real answer** rather than a dodge

## What a shuffle changes

Five tickets, seven possible faults, so two sit out each session — **Shuffle
re-deals them, and it re-deals everything else with them.** Every instrument
seeds off the session as well as the ticket number, so the same ticket slot
comes back with different SMART values, a different event log, different
temperatures and fan speeds, a different change record, a different set of
caller's claims and a different order of bench tests. Measured across 200
shuffles of ticket one: 200 distinct SMART readings, 200 distinct event logs,
200 distinct thermal profiles, 198 distinct asset tags, 192 distinct red
herring sets.

Urgency is a property of the **site**, not the part. A dead power supply on the
only machine driving the label printer stops the line; the same fault on a
spare at the next desk is an annoyance. The reason is shown, so two students
looking at identical faults can see why the shipping call differs.

What stays stable is the ticket a student is actually working — the same seed
and slot always produce the same ticket, so nothing moves under them mid-call.


## The objective thread

Objectives are not a label on a ticket in this build. They are a thread
through it.

Every step of every track says which objective it is exercising and why,
and where a step reaches into a different objective it says so at the moment
it happens, with a line on where that thread gets picked up properly later.
A 1.1 laptop ticket splits along the objective's own two verbs: steps one to
three are **monitoring** the hardware, step four is **appropriate replacement
techniques** — and the objective is not "replace the part", it is replace it
*appropriately*.

On the antenna-lead ticket that produces three separate moments. Step three
tells the student that choosing an instrument rather than guessing is
objective **2.8**, and that 2.8 is where a Wi-Fi analyser gets taken seriously
on its own. Step four raises **2.2**, because a radio has to work on two
bands. Step five says that proving traffic moves is **5.5**, not laptop
repair. Across the two tracks that carry them that is 38 cross-objective moments \u2014
the spine now reaches all thirteen, and the cross moments are the next thing
to extend.

Two rules keep it honest. It never names a fault, a reading or a part, so a
student who reads every word still has the whole ticket to do — and that is
checked automatically against every graded answer and every bench-test label
on every render. And the cross-objective blocks are written in the past tense,
as a look back at work already done, so they stay **hidden until the step
opens**. A locked step says only that the block exists.

### It runs on all thirteen tracks now

Every step of every ticket says which objective you are in and what that
objective means AT THAT STEP. It is a band above the controls carrying the
number, the objective's own title, and a line written for that step — so a
student working a fuser or a degraded array is never more than one glance from
knowing what the exercise is for.

It used to render on two tracks out of thirteen. Laptop and mobile had a
spine; the other eleven had nothing, which meant a student could work a RAID
array or a print queue end to end without the page once naming the objective.
That is precisely the half of the request that was missing: veterans learn by
doing, and they need to understand the why.

Eight objectives got a spine of six step-lines each — 5.1, 5.2, 5.3, 5.5,
5.6, 4.1, 4.2, and a `5.x` for the mixed track, which is not one of the
twenty-seven because what it exercises is the methodology across all of domain
five. Two tracks carry two objectives and the band follows the FAULT rather
than the track: a mobile ticket says 1.3 when it is about setting a device up
and 5.4 when something on it has broken, and a cloud ticket says 4.1 or 4.2
depending on whether the subject is the hypervisor or the service. The mixed
track is deliberately exempt from that rule — two of its tickets are tagged
4.2 as their real domain, and letting the band read that would have told the
student which domain they were in on the one track whose entire exercise is
that nobody tells them.

### The tags were wrong on ten tracks out of thirteen

Retagging had to come first, and it turned up more than expected. Every fault
carries an `objective` string that instructor mode prints on the truth panel,
and outside laptop and power those strings were from the OLD objective list.
There is no 5.7 and no 1.4 in Core 1, and both appeared repeatedly. Worse were
the numbers that exist but belong to something else: the RAID track was tagged
3.3, which is RAM characteristics; laser and inkjet maintenance was tagged
3.7, which is deploying multifunction devices; the display track was tagged
1.2 and 5.4, which are accessories and mobile devices. An instructor reading
the truth panel was being told, in writing, that a ticket belonged to an
objective it did not.

A source-level check now validates all 209 tags against the book's own list,
two ways: that every number exists, and that every fault's tag mentions the
objective its track actually IS. It found 170 problems on the first run and
finds none now.

## Choosing what to work on

Two controls, in the order the book is organised: **the objective, then the
sub-objective inside it.** The picker is the same component on both pages,
because a domain does not respect the split between them — domain two is
three identification drills, domain five is six ticket tracks, and domain
three is both. Choosing an exercise that lives on the other page simply goes
there and opens it on the right thing.

**All twenty-seven sub-objectives are listed, and all twenty-seven now have
an exercise behind them.** Every domain is complete: 3.5 (boards, processors
and add-on cards) and 3.6 (power supplies) were the last two, and they closed
the map. The mechanism for showing a gap is still there and still empty, on
purpose — a picker that listed only what happens to be finished would be a
menu, and listing the empty parts as well is what makes it a map of the
course. The day a twenty-eighth objective appears there has to be somewhere
for it to say so. When something IS missing it appears disabled with the gap
named in words rather than signalled by the greying, because a browser
renders a disabled option in its own grey — about 4.4:1 on this ground, below
the 7:1 the rest of the page holds to, and not reliably overridable inside a
native dropdown.

**One exercise can serve two objectives, and one track can BE two
objectives.** Terminating a link correctly is 3.2 and finding the fault in it
is 5.5, so the cabling track appears under both. A mobile ticket is 1.3 when
it is about setting a device up and 5.4 when something on it has broken; a
cloud ticket is 4.1 or 4.2 depending on whether the subject is the hypervisor
or the service. On those two tracks the objective you chose narrows which
faults get dealt — pick 1.3 and you get the thirteen faults that are 1.3, not
whichever nine the seed happened to turn up. A navigation that quietly hands
you a battery replacement after you asked about application support would be
worse than no navigation at all, so a harness walks all twenty-four playable
entries and checks the tickets that come back are on the objective asked for.

The default is "All objectives", so a student revising broadly does not have
to choose a domain to see the whole list — and every option is still labelled
with its objective number, so the number and the exercise are never separated
even when nothing is filtered.

## Levelling the thin subjects

Five subjects sat below the seventeen the rest carry. Three are now level and
two are not, and the reason is worth recording rather than quietly padding:

| Subject | Objective | Was | Now | Added |
| --- | --- | --- | --- | --- |
| devices | 2.5 | 14 | **17** | DSL modem, layer 3 switch, SDN controller |
| storage | 3.4 | 14 | **17** | eSATA external drive, hybrid drive, hot-swap carrier |
| netconf | 2.4 | 15 | **17** | NS record, PTR record |
| links | 2.7 | 15 | **16** | wireless mesh network |
| tools | 2.8 | 14 | **14** | nothing — see below |

Three of those had been flagged as outright gaps: **DSL modem**, **SDN** and
**eSATA** were all on the objectives and nowhere in the build.

**tools and links stop short on purpose.** Objective 2.8 lists eleven tools and
this subject already carries fourteen; 2.7's connection and network types are
covered but for the mesh. Reaching seventeen on either means adding content
that is not on 220-1201 — Network+ instruments like a TDR or an OTDR — and the
standing rule for this build is exam-tight. A number is not worth teaching the
wrong exam for. If the count matters more than the boundary, the adjacent tools
are easy to add and are named here so the decision is a decision.

### Two guards came out of doing it

The device model dispatched on the item's key and returned null for one it did
not know — an item added without a drawing rendered an empty bench with
questions about an invisible device. It now throws, naming the key. That is the
fourth table in this build keyed by item that did not grow when the items did.

The links pool carries two different field shapes, one for a service and one
for a network, and nothing checked which an entry used. The mesh entry was
written to the wrong one: it parsed, imported and rendered nothing. The shape
is now asserted at load, naming the item and the missing field.

## Mixed drill mode

Every other drill tells you its objective before you look at the item, which is
an advantage the exam does not give and a bench does not give either. Half of
identifying something is knowing what kind of thing it is, and "this is objective
3.2" has already done that half for you.

**Mixed** deals twenty items from all sixteen subjects and says nothing. It
delegates the questions, the model, the readings panel and its caption to
whichever subject the item actually came from, so the only thing that changes is
that nobody tells you first. It sits under *After the objectives* on the route,
beside the mixed ticket track, for the same reason.

The pool holds the **same object references** the other subjects hold, tagged
with where they came from. Copies would stop matching the moment somebody edited
an original, and several question builders filter against their own pool by
identity.

Two things broke in the wiring and both were the same shape — an indirection
that works for fifteen subjects and not the sixteenth. Objective 2.1 has no model
at all (it renders a firewall rule table instead), so the model delegate threw on
every protocols item mixed dealt; and several subjects have no readings panel, so
the panel delegate returned null into something that expected rows. A missing
home subject is still an error and still says so. A home with no model is not.

## Levelling: what "17" cost, and what it did not

| Subject | Was | Now | Added |
| --- | --- | --- | --- |
| links | 16 | **17** | fibre to the cabinet |
| tools | 14 | **17** | coaxial compression tool, visual fault locator, spectrum analyser |

**Fibre to the cabinet was a genuine miss on my part.** 2.7 draws the
distinction, and it is the reason a service sold as fibre still needs a DSL modem
in the house — a technician who does not know it argues with the customer about
what they were sold instead of terminating the copper.

The three tools are more marginal and are named here so the judgement is
visible. Objective 2.8's own list was already covered by the fourteen. Each of
these earns its place by pairing with content this build already teaches: the
compression tool terminates the F-type connector in 3.2, the fault locator
belongs with the fibre connectors and the optical power meter, and the spectrum
analyser answers the wireless survey's blind spot — interference that is not
Wi-Fi, which no Wi-Fi tool can see. None is off the job; the first two are at the
edge of the objective.

Three subjects still sit at sixteen — wireless, hosts and accessories. They were
not on the thin list and I have not padded them.

## The gaps that were on the objectives and nowhere in the build

Eight items were named by 220-1201 and had no coverage anywhere here — not a
ticket, not a drill, not a question. All eight now do:

| Item | Objective | Where it lives now |
| --- | --- | --- |
| eSATA | 3.4 | storage drill |
| SDN | 2.5 | devices drill |
| DSL modem | 2.5 | devices drill |
| NetBIOS | 2.1 | protocols drill |
| ST fibre | 3.2 | connectors drill |
| Mini-DisplayPort | 3.2 | connectors drill |
| Thermal printers | 3.7 / 3.8 | **printers drill** (new) |
| Impact printers | 3.7 / 3.8 | printers drill |
| 3D printers | 3.7 / 3.8 | printers drill |

Two more were on the objectives, had headline status on them, and were graded
nowhere:

| Item | Objective | Where it lives now |
| --- | --- | --- |
| Wireless encryption and authentication | 2.2 / 2.6 | **wireless security drill** (new) |
| Memory channel configuration | 3.3 | **memory channels drill** (new) |

### Wireless security — 2.2 and 2.6

The wireless drill covered bands, throughput and reach. The small-office drill
covered addressing and channels. Nothing anywhere asked about encryption, on a
qualification where it is a headline topic and on a job where getting it wrong
is the difference between a network and an open one.

Seventeen settings, from open through WPA3-Enterprise, plus the five that are
not encryption at all and are constantly described as though they were — WPS,
MAC filtering, a hidden SSID, a captive portal, a RADIUS server. Four questions
carry it: **what does it actually encrypt**, **where does the key come from**
(which is the whole of personal against enterprise), **what stops working if you
turn it on**, and **would you configure it today**.

The instrument is an access point's security page **with the names of the
settings taken off**, because a technician who can only recognise the string
"WPA2" cannot tell it from WPA on a unit whose menu is in another language. You
get three things that are genuinely on the page — the cipher named, what the
page asks you for, where the setting sits — and you name it from those. The
first draft printed the name in column one and then asked which setting it was,
which is a reading exercise; the firewall table for 2.1 shows a port number and
never the protocol, and this now obeys the same rule.

A load-time guard refuses two settings that would show an identical page line,
because the naming question would then have two right answers and grade one of
them wrong.

### Memory channels — 3.3

The RAM drill identifies modules. The board drill asks which slots to use, once,
with identical modules, as one decision out of five. Nothing asked what mode a
machine ends up in, what mismatched modules do, or what fitting them wrongly
looks like — and that last one is why this exists:

**Fitting memory in the wrong slots does not fail.** The machine posts, boots,
counts every megabyte, logs nothing and beeps nothing, and runs at roughly half
the memory bandwidth for the rest of its life. There is no fault, so no method
in domain five will ever find it. The only way it gets caught is somebody opening
the case and looking.

Seventeen machines — towers, small-form-factor, workstations with four and six
channels, laptops with two slots, laptops with memory soldered on — and five
decisions on each: which slots, what mode that leaves you in, what speed it
really runs at, what going wrong looks like, and what to tell the customer about
adding more later. Then one wrinkle per scenario, drawn from five: capacities
that do not match, speeds that do not match, dual-rank load, an odd number of
modules, or a soldered half you cannot change.

Nothing is a table of answers. The slot labels come from the channel layout, the
recommended slots are computed from that layout by one rule — spread across the
channels before doubling up, and take the far slot of a channel first — and
"the second and the fourth" is simply what that rule produces on a four-slot
board rather than a fact to memorise.

Three things were caught building it, all by the checks rather than by reading:
a distractor that was the right slots listed in a different order (a student who
read the board correctly would have been marked wrong), an odd-module case that
dealt five modules to a four-slot board, and a soldered-memory board that drew a
slot the machine does not physically have.

### The printers drill

Laser and inkjet had full ticket tracks. The other three families the objective
names had nothing at all, which left a student who met one on the exam with
nothing to reason from and a student who met one at a till with nothing at all.

Seventeen machines across all five families, on four discriminators a technician
can see or touch: **what marks the page**, **what you replace**, **how the paper
moves**, and **whether anything strikes the sheet**. That last one is not trivia
— only an impact machine can make a carbon copy, which is why multipart forms
still come off dot matrix printers, and it is the question students most often
get wrong. The sprocket wheels and the ribbon are drawn deliberately on the
impact machines so it can be answered from the picture.

### The models had to be rebuilt once

Every machine first rendered as a plain slab. The ribbon, the carriage, the rail
and the tractor wheels were all placed at heights **inside** the body box, so the
geometry merge swallowed them. The browser walk passed it — the canvas was there,
the questions were there, the answers were right. Only looking at the picture
showed there was nothing to look at.

The resin printer was worse: `glass` is a **finish name** in this engine, not a
transparency flag, so its hood rendered opaque and hid the vat, the plate and the
lift column completely. It is now drawn with the hood lifted, which is also what
you see when identifying one.

There is a static check for this now (`buried.mjs` in the harnesses): for each
form it finds the largest primitive, treats it as the shell, and requires that
features actually protrude from it. Its first version only looked upward and
sideways and called a laser printer's paper tray buried when it sits proudly
below the body.

## The route through

`path.html` is the map: every objective from **1.1 to 5.6** in the order CompTIA
numbers them, what exercises each one, how much of it you have worked, and one
button that goes to the next thing you have not finished.

**It recommends, it does not gate.** Nothing is locked behind anything else. A
student revising printers the night before an exam should not have to work
through mobile devices to reach them, and an instructor pulling one objective up
on a projector should not have to defeat a lock to do it.

The route is built from the syllabus rather than listed in the page, so an
exercise added later appears on it without anybody remembering to add it. The
mixed track sits at the end under **After the objectives**, because not being
told which domain you are in is the exercise — it belongs to no numbered
objective and was falling off the map entirely.

State is carried by a **word** first (Finished / In progress / Not started), then
by a left rule whose style and weight differ, and only then by anything you could
call colour. Every row is legible in greyscale.

### One count, not two

The map and the pages disagreed the first time: the route told a student 1.3 held
five tickets where the page offered thirteen. Two filters for the same question,
both reasonable in isolation. `assets/slots.js` now holds the only definition and
everything that needs a count asks it. A map that confidently reports the wrong
number is worse than no map, because a student trusts it.

The grand total counts **distinct** exercises. Several tracks serve two
objectives — cabling is 3.2 and 5.5, the printer tracks are 3.8 and 5.6 — so
summing the rows counted those twice and announced 510 where 465 exist.

## Everything built is now reachable

For most of this build's life the picker offered **five** tickets per track and
five items per subject, against tracks holding fifteen to twenty-two faults and
subjects holding fourteen to twenty items. The deal was never the limit — a
constant was. **456 exercises existed and 140 could be opened.** A student who
worked all five and pressed the button got a reshuffle rather than the rest of
the track.

The count now comes from the pool, per track and per subject, so a track that
grows is reachable the day it grows rather than the next time somebody
remembers to raise a number.

### Progress stays in the student's browser

Which items they have worked is remembered in `localStorage` and nowhere else —
no account, no server, no identifier. On a shared classroom machine it leaves
nothing another student's browser can read, and nothing that reaches anybody
else.

- The picker marks worked items **✓ done**, and the count survives a reload.
- **Next unworked →** jumps to the first one they have not done, so nobody has
  to remember where they were on a twenty-two ticket track.
- **Clear progress** forgets the current track or subject only — resetting one
  should not cost them the other twelve. It asks first.

Two decisions worth knowing:

- **Worked is not the same as right.** An item is ticked once every question in
  it has been answered, whatever the answers were. Marking only perfect runs
  would hide the items a student most needs to come back to, which is the
  opposite of what a progress mark is for. Whether they got it all right is
  recorded alongside, for their own information.
- **It never blocks the page.** Storage throws in a private window, with site
  data blocked, and inside some embedded viewers. Every read and write is
  wrapped, and a failure means the page behaves exactly as it did before the
  feature existed — unmarked, not broken. The progress readout hides itself
  rather than showing a control that silently does nothing.

## One command that checks the build

```
node verify/verify.mjs                     everything, about four minutes
node verify/verify.mjs --list              names the checks and exits
node verify/verify.mjs --only=hints,route  a subset, for when you are fixing
                                           one thing
```

There is no way to skip a check on a full run. There was briefly a `--quick`
that left out the slowest one; it went as soon as that one came down to under a
minute, because a flag whose purpose is to make the suite finish sooner is a
flag whose purpose is to produce a pass that covered less. `--only` exists for
development and the summary says loudly how many checks did not run.

It serves the site itself on a spare port, so nothing has to be running first
and it cannot accidentally measure a stale copy somebody left open. Exit 0 means
every check ran and every check passed.

The site has no dependencies and is not acquiring any — it is static files you
upload. The checks need a browser, declared in `verify/package.json` alone:
`cd verify && npm install`.

### The rule it exists to enforce

**A check that did not run is a failure, not a pass.**

That is not a general principle. It is the specific way this project has been
misled, repeatedly, by its own tests:

- A contrast sweep reported zero failures on a page it was not looking at.
  Twice. It had been pointed at `drill.html` while the change was on
  `path.html`, and "0 below AAA" is exactly what a sweep of the wrong page says.
- A contrast sweep reported zero failures because it ignored inherited
  `opacity`, and was believed. Thirty real failures were sitting in front of it.
- A walker reported "0 problems" having answered most questions correctly by
  chance, so the hint ladder it existed to exercise was never opened once.
- A reachability walk reported "500 exercises opened, 0 problems" on a build
  containing 543. Nothing in that sentence was false and nothing in it was
  useful, because 500 corresponded to nothing.

So every check declares what it **expected** to cover; the expectations are
derived from the syllabus and the registries rather than typed in; and coverage
below expectation fails the run no matter how few problems were found. The two
sweeps that can go blind carry a **calibration**: they plant a fault they must
detect, and a calibration that does not fire fails the check whatever else it
found.

### What it checks

| Check | What it proves | Reconciled against |
| --- | --- | --- |
| registry | every exercise, subject and objective lines up | itself — cross-referenced |
| questions | every generated question has its answer among its choices, no duplicates, three options minimum, a hint and an explanation | every item of every subject × 12 seeds |
| mixed | the mixed drill can deal and fully render an item from every subject | the subject count |
| drill pages | every item renders an instrument and is distinct from the others | the derived drill total |
| hints | three wrong answers reaches the last rung, marks the evidence and offers a clean field | every drill subject |
| route | the route lists every objective and its total matches the build | the derived exercise total |
| contrast | AAA on every page, three widths, both themes, with a planted failure it must catch | every page, calibration per page |
| ticket pages | every ticket opens a distinct scenario and each track offers the number of tickets the build says it has | the derived ticket total |

### Writing the harness taught the same lesson three more times

The first run of this file failed three of its own checks, and all three were
faults in the checking rather than in the build:

- **drill pages** timed out. The drill picker also lists the ticket tracks, and
  choosing one navigates to `index.html` — after which every later call waited
  thirty seconds for an element on the wrong page. It now takes the subject list
  from the inventory and refuses to start if the picker offers fewer subjects
  than the build contains.
- **hints** drove nothing at all, for sixteen minutes. It was looking for class
  names the page does not use, and probing with the first option, which is
  sometimes the right one. It now reads the answer out of the data attribute
  instructor mode uses, so it can deliberately pick a wrong one, and it looks
  for the rungs the page actually renders.
- **contrast** reported that its calibration had not fired on `index.html` —
  which was correct, and was the file catching itself. The probe styled named
  classes, none of which exist on that page, so the calibration silently did
  nothing and the page's clean result meant nothing. It now inserts its own
  element and depends on no page's markup.

Every one of those would have read as a pass under the old harnesses.

## When a student is genuinely stuck

Nothing appears for the first two wrong answers. Somebody one guess away should
be allowed to get there on their own, and a page that starts helping the moment
anyone is wrong teaches them to guess and wait for it.

From the third wrong answer, **one rung per attempt, escalating** — and never
the answer:

| Rung | What it does |
| --- | --- |
| 1 | Sends them back to the right instrument. Most wrong answers here are given before the readings were read. |
| 2 | The reasoning move for that kind of question — how to eliminate, what to compare. |
| 3 | The strongest nudge: usually the one to rule out, and why. Still not the answer. |

### When the hints run out

The page **marks where to look and where to act**. The evidence gets a
`LOOK HERE` label, the question gets `CHANGE THIS`, and a button clears their
answer so they get a clean field to try it in — because the commonest reason a
stuck student stays stuck is their own wrong pick sitting in the box they are
staring at.

**The reset keeps the hints.** They were earned, and wiping them would send a
student who is finally reading the right panel back to a blank card. The
wrong-count survives too, so nobody can farm a fresh ladder by failing on
purpose.

Three things are deliberate here:

- **The target is derived, not listed.** Which panels get marked comes from the
  same `askKind()` that writes the hint text, so the mark can never point
  somewhere the words contradict. A track added later is covered on the day it
  is written rather than falling silently out of the feature.
- **Sometimes nothing is marked, and it says so.** Documentation, verification,
  prevention and backup questions are answered by reasoning about the person on
  the other side, not by re-reading a panel. Marking the nearest table anyway
  would be a lie dressed as help, and a student who followed it would hunt for
  an answer that is not there.
- **The 3D part is not highlighted, on purpose.** The scene engine can do it —
  but drill questions like *"which slot does it go in?"* ask which part, so
  marking the subject would hand over the answer. The stage, the readings and
  the control are marked instead.

The label is a printed word on a plate, not a glow. Colour alone says nothing to
a student who cannot separate the hue from the panel behind it, and this build
exists for students whose sight is damaged. Motion reinforces it and is dropped
entirely under `prefers-reduced-motion`.

## Two kinds of exercise

The book asks for two different things and the build answers them
differently.

Objectives worded **"Given a scenario"** get the six-step ticket. There is a
caller, a symptom and something to diagnose.

Objectives worded **"Compare and contrast"** or **"Summarize"** get an
**identification drill** instead, at `drill.html`. There is no caller and
nothing is broken; there is an object on the bench and either you know what it
is or you do not. Forcing that into a service call would be artificial, and it
would waste the thing that makes it work — a 3D model is at its most useful
when *looking* is the skill.

The drill runs on the same rules as everything else: seeded generation so
there is no answer bank, every wrong answer a real object, guidance on the
third wrong attempt that never gives it away, instructor PIN, AAA contrast.
Nothing in a drill model names the item — the label, the specification and the
note are written to be true of anything in the pool, and that is verified
automatically.

| Objective | Instrument | Pool |
|---|---|---|
| **1.2** Accessories and connectivity options | A 3D model on the desk | 16 accessories, in eight confusable pairs |
| **2.1** TCP and UDP ports and protocols | A firewall rule table | 20 services, in ten confusable pairs |
| **2.2** Wireless networking technologies | A 3D floor plan with the survey drawn on it, plus the survey readings | 16 technologies |
| **2.3** Services provided by networked hosts | A 3D rack elevation, plus a connection log | 16 host roles |
| **2.4** Network configuration concepts | A 3D address space, plus what the machine reports | 15 concepts |
| **2.5** Common networking hardware devices | A 3D bench with a board and a mains socket behind it, plus what is printed on the case | 14 devices |
| **2.6** Configuring a small office network | A 3D site plan with everything on it that will want an address, plus the customer's brief | 17 sites, generated |
| **2.7** Connection types and network types | One ground, two halves: a street with what arrives at the wall, or a boundary with what fits inside it | 15 — 8 services, 7 scopes |
| **2.8** Networking tools and their purposes | A 3D bench with the tool on the job it is for, plus what the tool is showing | 14 tools |
| **3.1** Display components and attributes | A 3D cross-section with the light drawn as rays, plus what the instruments read | 17 stacks |
| **3.3** RAM characteristics | A 3D module on the bench with the socket it goes in, keyed to match, plus what a ruler and the label give you | 17 modules |
| **3.4** Storage devices | A 3D device opened up with the thing it mates with, plus what the enclosure and a benchmark give you | 14 devices |
| **3.5** Installing boards, processors and cards | A 3D board laid flat to be counted and measured, with the parts that turned up beside it | 17 builds, generated |
| **3.6** Choosing a power supply | A 3D bench with the supply, every lead fanned out, the bay it has to fit, and the load drawn as a row of blocks | 17 jobs, generated |
| **3.2** Cable types and connectors | A 3D model on the bench | 17 connectors, in eight confusable pairs |

On 3.2 the graded facts are countable, so every contact is drawn as its own
primitive and a test checks that the number **drawn** equals the number
**graded** — "count them" is only fair advice if those match. On 1.2 the
graded facts are dependencies, so every model carries the physical evidence of
them: a mains inlet means its own supply, indicator lights mean it holds a
charge, a captive lead says how it attaches and no connector at all says it
does not.

**2.1 has no model, and that is a decision rather than an omission.** A port
is a number and a protocol is an agreement; a rendered box with 443 written
on the side would be decoration. So its instrument is what a technician
actually reads when ports matter — a firewall rule table with one rule
highlighted and five real rules around it as noise. The questions follow
from that: what did the rule allow, what stops working if you remove it, why
does this service use the transport it uses, and what else has to be open
before the thing works end to end. Knowing that 443 is HTTPS is a fact.
Knowing that a browser cannot reach it without 53 answering first is the
part that fixes tickets.

**3.3 draws the module AND the socket, because on that objective the socket
is half the evidence.** Where the notch sits along the edge connector is not a
marking, it is a mechanism — a module of the wrong generation physically will
not seat — so the socket is drawn beside it with its key in the matching place,
and whether the two line up is something to look at rather than something to be
told. One pair in that pool is physically identical in every respect and
differs only by a voltage printed on the label, and it is drawn identically on
purpose. A model that invented a difference there would be lying about the one
case a technician genuinely cannot see.

**And 3.3 taught a rule that is false on current hardware, until a check caught
it.** Everybody learns that a multiple of nine chips means error correction —
eight carrying data, one carrying check bits. That is true up to and including
the generation before the current one. A DDR5 module is TWO independent halves
of thirty-two bits, each with eight check bits of its own, so an
error-correcting rank is ten chips rather than nine. The scanner divides the
drawn chip count by the rank count and compares it against what the generation's
bus width demands; it rejected a twenty-chip module that the content had
labelled as error-correcting, and the fix was to the teaching rather than to the
test. The question now branches by generation and the hint says so.

**3.4 is built around a trap that costs money every week: two devices can be
the same shape and speak different buses.** An M.2 card carrying SATA and one
carrying PCIe are the same length in the same socket with the same screw, and
they differ by one notch. So they are drawn as the same card at the same length
differing by one notch — inventing a bigger difference would make the exercise
easier and the field harder. Beside it sits the asymmetry people get caught by:
a desktop drive drops into a SAS backplane and works, and a SAS drive will not
go into a desktop connector, because a bridge of plastic across the gap between
the data and power segments is filled in on one and open on the other. That
bridge is drawn, on the drive and on the host.

The tape cartridge on that objective was briefly drawn with a serial connector
on it. Its `bus` field names the bus the DRIVE speaks, and the connector routine
branched on bus before form — so a cartridge whose entire point is that it has
no electrical connector anywhere on it was given one. A check comparing the
prose against the geometry found it.

**3.5 and 3.6 are decision exercises, and both of them turn on things you can
only get by looking.** On 3.5 the board is drawn to be counted and measured:
the mounting holes ARE the form factor, the memory slots are drawn in their
interleaved pairs with the pairs shaded the way a board prints them on
itself, and every expansion slot is drawn at its real physical length — so a
slot that is sixteen long and wired to four lanes looks exactly like a slot
that is sixteen long and wired to sixteen, which is the whole of the third
decision. The socket is drawn as its mechanism, pins standing up in it or
holes waiting for pins on the processor, because which of the two it is
decides which part gets destroyed when somebody forces it. On 3.6 the parts
list gives every line's draw and deliberately gives NO total: the total is
the first answer, and a page that prints it has done the arithmetic for you.

**The slot answer on 3.5 was slot one every single time.** The layout table
was a single fixed arrangement, so whichever slot the card wanted, it was
always the first. No browser walk can see that — the walker reads the answer
from instructor mode and clicks the control that matches, so a constant
answer passes perfectly. Seeded layout tables fixed it, and the scanner now
asserts the answer lands on at least three distinct slots across every build
and seed.

**The watts question on 3.6 offered three choices whenever the right answer
sat at either end of the shelf.** The distractors were a fixed window of
offsets around the correct size, and on a small chassis the correct size is
the smallest one sold — so two of the four offsets fell off the end and the
question quietly became a one-in-three guess. The distractors are now walked
outward from the right answer in both directions until three have been found.
The wrong-answer feedback had the matching problem: it named the figure the
student was working towards, and that figure lands exactly on a shelf size
often enough to hand over the answer. Both branches now say which way to move
and why, and leave the arithmetic where it belongs.

**Every bounds check in this build was passing models whose parts ran through
each other.** Two solids that interpenetrate have exactly the same outer
bounds as two sitting side by side, so "does it overhang the bench" and "is
it below the bench" are both blind to it — and a browser walk cannot see
geometry at all. On 3.5 the expansion slots were drawn straight through the
middle of the processor socket, the memory slots through the wide power
connector, and the loose parts sat off the end of the bench entirely; on 3.6
the leads fanned through the inside of the bay and the bay's back panel hung
over the edge. A pairwise collision check found all of it at once.

The fix was not to nudge coordinates. Both models now compute their layout
from the outline in one place — `zones()` on the board, `layout()` on the
bench — with each region handing its far edge to the next, so a solid can
never leave the space it was given. Two things fell out of doing it properly:
the processor socket had been drawn at nearly twice the size of a real socket
assembly, which was what had pushed the expansion slots off the bottom of the
board in the first place; and the mounting holes, which are the evidence for
the first decision, had ended up bunched along two edges where a student
could not take the count from any single view. They are now placed on a ring
that skips ground already occupied, and the scanner checks they reach at
least three edges.

**The check itself then had to be aimed.** Run across every drill model it
reported all nine as broken, which was the tool being wrong rather than nine
models. Most of these models name FEATURES OF ONE ASSEMBLY — a memory module
and its contact edge, a device and its ports and its power inlet, a building
and the box mounted on its outside wall — and those are supposed to occupy
the same space. It applies only where separate objects are laid out side by
side, and that note is written at the top of the check so it does not get
misapplied later.

**The 3.6 model was naming the standard the supply conforms to, beside the
supply.** The shape decision is "which shape does this chassis take", and the
reading printed "the standard tower size" next to the model — the same defect
as printing an answer beside the rows. The published outlines are now the
source: the millimetres are the data, the drawn box is those millimetres over
a constant, and the reading gives the measurement rather than the name. A
scanner check asserts the drawn shape and the stated millimetres agree, so
the panel and the bench cannot drift apart.

**The two thinnest areas were brought up to the rest.** Printer networking had
ten tickets where every other ticket track had fifteen or more, and wireless had
eleven items where the drills around it had fourteen to twenty. Both are now
level: fifteen and sixteen.

The five new printer tickets are the ones a technician actually meets and the
track had no answer for: a finisher fitted to the device and never declared in
the driver, so every option it provides is greyed out before a job is sent; the
raw print port closed by a security rollout, so the device answers on ping and
its own web page while nothing prints; a static address inside the DHCP scope
that the scope has since leased to a laptop, which is the one fault on the track
that is INTERMITTENT and rules out the driver on that alone; a scan that leaves
the device correctly and is refused by the mail system for size, where the
one-page version arrived a minute earlier; and a tray set to a media type that
is not what is in it, where the panel asking for paper is itself the proof the
job got that far.

The five new wireless technologies are the ones that get specified by mistake:
Wi-Fi 7 against Wi-Fi 6E (same disc, same band, and a client that cannot use
the wider channels gets none of it), 802.11ad against 802.11ac (one letter, and
it decides whether the thing covers a floor or a desk), Bluetooth Low Energy
against classic Bluetooth (same name, same band, same logo, and a headset will
not pair with it), active RFID against passive (the difference is a battery, and
it changes the read range from a doorway to a yard), and a licensed microwave
link against an unlicensed one (identical dishes on identical masts; what is
being bought is that nobody else may legally transmit).

**The five thinnest drill subjects went from twelve to seventeen.** Every
drill is now between fourteen and twenty items, and every ticket track is at
fifteen or more. What went in was chosen to fill gaps in what the objective
covers rather than to pad a count:

- **2.6, five more sites** — each one a different segregation lesson the pool
  had no answer for: a building system a maintainer dials into from outside, a
  machine nobody is allowed to patch, staff phones nobody manages, a landlord's
  shared building network, and desk telephones, which are separated for call
  quality as much as for safety and still have to share one cable to the desk.
- **3.1, five more components** — a fine backlight against an ordinary
  full-array one, a quantum-dot film against an emissive panel (the confusion
  is the NAME and it is sold that way), a laser light source against a lamp
  (the imaging chip and the light source are two separate questions), an
  infrared touch frame against a bonded capacitive grid, and a privacy filter
  — which goes dark from the side exactly like a cheap panel does, and is the
  thing to take off before anybody orders a replacement.
- **3.3, five more modules** — the pair that share a contact count and differ
  only by notch position, so counting the pins actively misleads you; server
  memory that seats with a click in a desktop board and stops it posting;
  error-correcting memory of the current generation, where the trap is that
  every module of that generation corrects errors on the chip and that is not
  the same thing; a module carrying its own clock driver; and memory soldered
  to the board, which is the answer to "can we add more" and cannot be
  answered without opening the machine.
- **3.5, five more builds** — the controller mode that has to be decided
  before the operating system goes on, the monitor plugged into the board
  instead of the card that was paid for, the board that needs a firmware
  update before it will take the processor that is meant to run the update,
  the second fast drive that switches off two ordinary drive ports without
  saying so, and the two firmware settings a current operating system will not
  install without.
- **3.6, five more jobs** — modular leads swapped between supplies (the plug
  fits and the pinout does not), a supply fitted where the air is full of dust,
  a machine judged working because it powers on, a supply held in by three
  screws on a machine that gets wheeled between rooms, and a supply whose power
  factor correction the cheap battery backup cannot feed.

**Three more places where a table keyed by item did not grow with the item.**
The panel meter had a row per display and five new displays had none, so it
crashed inside a subscript rather than naming what was missing. The recent-
change picker had the same shape and the same fix. Both now throw with the
item's own key and what to write. This is the third time this exact pattern has
cost an afternoon, and the rule that comes out of it is simple: a table keyed
by item either derives itself or says which key it is missing.

**The backlight model decided edge-lit from a list of item names.** Two
backlights added afterwards were drawn as a strip of emitters along one edge
while their own readings described a grid across the whole panel — the picture
contradicting the words beside it, which is invisible to a walk because both
render perfectly. The item now declares whether it lights the whole back, how
many zones it dims apart, and whether its emitters are the fine sort; the model
reads all three, and a check asserts the drawn spread matches what was claimed.

**A module claimed a chip the model never drew.** The current generation's
clocked module is told apart from an ordinary one by a single extra chip near
the contact edge, and the reading said to look for it while the model drew
nothing. The check that should have caught it only ever fired in the other
direction — model draws something the content did not claim — so a reading that
sent a student looking for a chip that was not there passed cleanly. Both
directions are now checked.

**Two survey classes shipped with an empty row in them, and the page died
reading it.** Both new coverage shapes were written just above the line that
assigns the extra readings, and `var` hoisting made `[...].concat(extra)` legal
with `extra` still undefined — which appends one `undefined` to the array. The
panel rendered until it reached that row and then took the page down reading a
property of nothing. The contrast harness was what fell over, and it fell over
on the same two items every time; the walk had not touched those slots. A check
now asserts every survey row has both halves.

**The wireless survey rule had grown a list of exemptions.** It said "no Wi-Fi
band dies at the first wall" with long-range, NFC, RFID and Bluetooth excused
from it by name, and four honest new items would have had to be added to that
list in one sitting — which is the point at which a list of exceptions has
stopped being a test. It now reads the survey CLASS, which is the thing that
actually decides the shape, gives each class a rule, and separately asserts the
class is right for the band. Sixty gigahertz really does stop at the first wall,
and an active tag really does transmit through two of them.

**A fault added without a recent-change line took the page down two screens
later.** On the distortion where the caller leaves the change out, the change
record has to hold it — and with no line naming the new fault, the picker handed
`undefined` on to the next statement and the error named a property rather than
the fault that was missing a line. It now throws with the fault's own key and
what to do about it.

**The printnet walker had a hand-written table of ten faults in it**, so the
five new ones came back as "no test mapped" — the harness's own gap, reported as
an application failure. It now derives the mapping from each fault's `test`
field. Two more harness faults came out with it: it scraped the deployment
feedback in the same turn as the click and read the previous question's panel,
reporting the grader as accepting a wrong answer; and it demanded a browser walk
of forty tickets hit all fifteen faults, when a track deals five per seed and
missing one is ordinary luck. Reachability is a property of the dealer, so it is
now proved against the dealer over four hundred seeds instead.

**A colour check that compared hex strings was passing two colours one digit
apart.** `#c8a24a` against `#c9a24a` is not a difference anybody can see, and on
a legend whose whole job is that a colour names a part, it made a card look as
though it were covered in gold blocks. Replacing string equality with a
perceptual distance found three more collisions immediately — a slate body
against a slate host, amber light rays against an amber lamp, and a sage panel
against a slate plinth — none of which any other check would ever have caught.

**2.6 is the only exercise on the drill page whose verb is CONFIGURE, and
that changes what it is.** Every other one is compare, summarise or explain,
and there is a thing on the bench. Here nothing is broken, nobody has rung up
and there is nothing to name — there is a business, a plan of the premises,
and five decisions. So the item is a SITE rather than an object, its numbers
are generated from the seed, and every graded answer is computed from those
numbers: how many desks, how many devices that must keep the same address, how
many fed down their own cables, how many phones on the air, and what the owner
expects to grow to. Change the seed and the office is a different size, the
mask is different, the pool starts and stops somewhere else and the neighbours
are on different channels. There is no version of this that can be memorised,
which is the point.

The five decisions are deliberately the ones that bite. Sizing the block is
arithmetic on things you can count on the plan. The DHCP scope is the one
people get wrong twice — a pool that starts at the bottom hands out the
gateway's address, and a pool that runs to the top hands out the broadcast
address, and both of those are configured every week by somebody who has never
counted an address space. The channel question has a fourth option that looks
reasonable and is worse than picking a busy channel. And the last one asks how
to keep something apart, where three of the four answers change a name, a
password or a channel and separate nothing at all.

**The plan for 2.6 draws counts, not decorations.** One desk per person, one
upright cabinet per fixed address, one disc per device fed down its cable, one
slab per phone. An earlier version laid the phones round an arc and a busy
office put nineteen of them on top of one another — a count you cannot take is
not evidence, so both layouts are lattices with a fixed pitch now.

**2.7 is one objective made of two things that are not alike, and it is drawn
as two.** Half of it is what the provider brought to the building; half is how
far a network reaches. The service half is a street: the customer's building,
what arrives at its wall, what is at the far end of the run, and — the
characteristic candidates never look for — how many other premises are tapped
into the same run, drawn as buildings joined to it. The scope half is a
boundary drawn EXACTLY the same size every time, with the reference objects
inside it changing. A desk fills one of them. A town fits inside another with
room to spare. The ring tells you nothing and everything inside it tells you
everything, which is how anybody reads a map.

That boundary was half the size it was meant to be on the first cut, because
the scene engine takes `size[0]` on a torus and a cylinder as the measurement
ACROSS the middle rather than as a radius. On the one model in the build whose
entire premise is "judge the scale by what fits inside", being out by a factor
of two was the worst possible place for it, and only a bounds check caught it.

**2.8 asks what a tool will NOT tell you, and that is the question the whole
exercise is built around.** Naming the tools is not the objective — the book
says explain their purposes, and a purpose is a sentence about what you get
out of the thing. A continuity tester will cheerfully pass a run that cannot
carry a gigabit. A certifier will pass a cable plugged into the wrong port. A
tone probe will find you a cable that is cut clean through just as happily as
one that is perfect. Knowing where each instrument stops is what stops you
trusting a pass that does not mean what you thought it meant.

The multimeter on that objective had no case of its own in the model and fell
through to the fish tape's working end — a bug no bounds check, colour check or
browser walk could see, because a fish tape's eye is perfectly valid geometry
and the walker reads the answer from instructor mode and then clicks the option
matching it. The `default` branch now draws nothing at all, so the next tool
added without a case fails the empty-build check instead of quietly wearing
somebody else's business end.

**3.1 is the one model in the build where the object is useless.** Every
display in the pool is a black rectangle from the front, which is precisely why
"compare and contrast display components" is hard to teach from a photograph.
So it is drawn cut in half: the same cut in the same place every time, layers
stacked back to front, and the light path drawn as rays. Where the light comes
from — behind everything, along one edge with a guide, in a grid you can see
the zones in, in the pixels themselves with nothing behind them, out of a lens,
or nowhere at all — decides everything the objective asks about.

Two things had to be got right before the section taught anything. The default
view now looks ALONG the plane of the panel rather than at its face, because
looked at from the front a section is one grey rectangle with every other layer
hidden behind it. And the layers in front of the light-controlling layer are
drawn over half the width only, making it a genuine cutaway — without that, the
ray that stops at the crystal was hidden behind the layers in front of it, and
the one thing the model existed to show could not be seen.

**2.5 is the one where the object IS the evidence, and the sharpest tell is
the one nobody uses.** After three objectives whose evidence had to be
invented — a radio field, a log of sessions, an address space drawn as a line
— every item in this pool is a box you can pick up. So the bench draws all
four things a technician actually reads, and the fourth part of the model is
the one that does the work: **how power gets in**. It has five different
shapes, and three of the fourteen devices have no mains lead at all for three
completely different reasons. A patch panel has none because there is nothing
in it to power. A ceiling access point has none because its power arrives down
the same cable as its data — drawn as collars clamped round the network lead,
the same collars that appear on the two devices that PUT power there. A card
has none because the slot feeds it. And a plug-in extender has none because
the pins are moulded into its body. The socket on the board is drawn every
single time, in the same place, whether or not anything reaches it: an empty
socket is evidence, and it is only evidence if it is always in shot.

Two defects on this objective were the same defect. The router's console port
started on its left flank and the cable modem's threaded coaxial barrel
started on its left flank, and the page's default camera looks at the front
and the right. Both were features the plate beside the bench claims are there
— "somewhere to configure it: a console port" — with nothing visible behind
the claim. A discriminator on a face nobody sees is not a discriminator, and
the fix in both cases was to move it rather than to soften the prose.

**The plate beside the bench does not say where the power comes from, and that
is deliberate.** It did on the first cut, sitting directly above a question
that asks where the power comes from — which is not a drill, it is a reading
test. The plate now carries ports, what is set apart, whether there is a
console port, how it is fixed in place, and its indicators. Power is something
you look at.

**2.4 draws the one thing in it that is genuinely a picture.** Almost nothing
in this objective is an object — a mask is arithmetic, a lease is a promise
with a clock on it, a VLAN is a number on a switch port. But an ADDRESS SPACE
IS A LINE, and everything the objective carves out of one is a position or a
segment on it: a first and last address nobody may use, drawn as posts at each
end; a way off the line near the start, drawn taller than anything else
because it is the only address that leads somewhere else; the range a server
hands out, drawn as a band; and the machines pinned to one address each, drawn
as pegs standing in that band.

The item it was built for is the one students get wrong most. A machine that
gave up waiting and named itself is not further along the line — it is on a
SECOND line, drawn beside the first, with no way off it and nothing joining
the two. Every explanation of that in words has to fight the fact that
169.254.18.7 and 192.168.20.7 look like near neighbours. Drawn as two separate
strips they never look like neighbours again.

**2.2 and 2.3 draw the evidence, not the object.** Both hit the same wall
from opposite sides, and the answer in both cases was to work out what a
technician actually *looks at*.

On **2.2** the object is useless: 802.11ac and 802.11ax are the same white
disc on the same ceiling, and rendering it more beautifully helps nobody.
What is real and spatial about the objective is COVERAGE — a band is a trade
between how far the signal goes and how much it carries, and that trade is
visible on a floor plan and nowhere else. So the model is a plan of a floor
with one access point on it and the survey drawn the way a survey is drawn:
contour rings at the distances where the signal drops through each threshold.
A long-range band's outer ring crosses the outer wall and lands in the car
park; a short one does not get out of the room. The ground is drawn past the
building on purpose, because "your wireless does not stop at the wall" is half
of why the band choice matters. The plan and the readings panel share one
function for how far each technology spreads, so they cannot drift apart —
before they did, and Bluetooth was drawn as a small bubble beside a survey
describing it reaching the far corner.

On **2.3** the object is evidence for half the pool and useless for the other
half. Hot-swap caddies mean storage; a beige tower with a floppy drive is the
application nobody will let you touch; a controller on a DIN rail with screw
terminals under it is not an office machine at all. But a name server and a
logging server are the same 1U box. So 2.3 gets both instruments at once: a
rack elevation where the chassis, the front panel and the cabling identify
eight of the sixteen, and a connection log — who starts the conversation, what
they send, what comes back, how it looks to the monitoring — for the eight
that look identical.

The rack never changes. Same frame, same provider's handoff at the top, same
patch panel, same switch in the middle; only the device and its cables move.
That is the comparison the student is being asked to make, held still. The one
distinction the objective genuinely turns on — a general-purpose server against
an appliance — is drawn as the thing you can actually see from the front: a
video output. A server has one because somebody may have to stand in front of
it; an appliance has a small display and four buttons instead, because you
never will. A test asserts that the description and the geometry agree on
which devices have one, because prose and model drifting apart is a question
with no answer on the page. It caught seven at the first run.

**The port numbers are deliberately absent from 2.3's log panel.** Printing
53/udp beside the readings would turn the objective into a lookup of 2.1 and
the student would never reason about the role at all. The order is: work out
what it does from what it answers, then bring 2.1 to it and say what that role
listens on. That is 2.1 being *used* rather than copied — and it is the
difference between two objectives that touch and two that actually connect.

A drill's own data can leak, and this one did. If an item's description names
another item in the same pool, then whenever that other item is the answer
and this one is offered as a wrong choice, the feedback hands the answer
over — four services in the 2.1 pool described themselves in terms of their
encrypted twin. A source-level check now scans all five pools for it, restricted
to the fields that actually reach a question whose answer is a name, because
elsewhere a cross-reference is the teaching rather than a giveaway: SMTP
needing DNS is exactly what 2.1 is for.

**And a third kind, which neither of them could see.** The display track
carried two different bench tests with byte-identical labels — "Look at the
firmware screen before the operating system loads" isolated burn-in under one
key and a dead panel column under another. Any ticket that dealt both put two
identical buttons in front of the student, one of which counted and one of
which silently cost them the "straight to it" grade, with nothing on the page
to tell them apart because there was nothing to tell apart.

It survived eleven end-to-end walkers for weeks, showing up as an occasional
"step 3 did not complete" that never reproduced. It could not have been found
that way: a walker reads the answer out of instructor mode and then goes and
finds it BY LABEL, so it clicked the first card with that text and about half
the time that was the wrong one — and a walker that matches an answer to a
control cannot notice that two controls look the same. The failing ticket also
printed a misleading diagnosis, because the walker marked questions answered
by the presence of a CSS class the ticket page never sets.

The fix was on the content side, where the bug actually was: looking at the
firmware screen is one physical act, so it is now one test that isolates both
faults, with the observation it yields written per fault. A source-level
scanner now deals a real ticket for every fault on every track — 179 of them —
and asserts that no two test cards on one bench read the same and no two tests
in a pool share a label.

The browser walker catches the other kind. On 2.3 it found the log panel
printing "where it sits in the path" verbatim beside a question asking where
the host sits in the path — a leak the source-level check cannot see, because
nothing in the data named anything. The panel row was replaced with what the
monitoring shows instead, and placement is now read off the cabling on the
rack and off the role once the role is known.

## The one objective that nearly had no model

4.1 and 4.2 — virtualization and cloud — were the last track without a 3D
view, and the reason was honest: "explain virtualization concepts" has no
object in it. This build had already refused to fake one for 2.1, where a
rendered box with 443 written on the side would have been decoration.

But there is something physical here, and it is the whole idea:

> **A host is a box with a fixed amount of stuff in it, and virtualization is
> the act of promising that stuff to several machines at once.**

So the model is that sentence, drawn. On the left, the machine with its lid
off — memory modules standing in their slots, countable, two processors under
their heatsinks, empty sockets left visible because they are where an upgrade
conversation starts. That is what the host **has**. On the right, five lanes
— memory, processors, and three for storage — with a brass gate part way down
each one marking what the host owns. Into each lane goes what has been
**promised**: the hypervisor's own reservation first, stepped so it can be
told from the rest, then one block per guest. Blocks that stop before the gate
are promises the host can keep. A block that runs past it is one it cannot.

The gate moves, and that is deliberate. Each lane is scaled to the larger of
what is owned and what is promised, so on a host committed at nine times its
physical cores the gate sits near the start and eight ninths of the lane is
past it — instead of the answer being somewhere off the end of the bench where
nobody can see it.

Three things make it an exercise rather than an illustration:

**On thirteen of the seventeen tickets, everything fits.** Those faults are a
licence, a region, a quota, a snapshot, a clock — none of them is in this box.
The model's job on those is to let a student rule the hardware out, and a
picture that found something wrong on a licensing ticket would be a picture
that lies. A source-level check asserts exactly that: only the four resource
faults may show a lane past its gate, and each of the four must.

**The physical half exists to be the wrong answer.** "Host hardware", "more
processors", "a failed datastore" are the reflexes this track's own fault data
names, and all three are drawn in front of the student, countable and intact.

**Step three now asks you to point at it**, like every other track with a
bench. Thirteen of the seventeen right answers are "nothing on this host — it
is a service, a policy or a setting", and saying so is an answer rather than a
failure to find one. That is the objective.

## Where the line between Core 1 and Core 2 falls

Six faults on the power track were tagged `3.5 / safety` and held pending a
decision: an outlet with no ground, reversed hot and neutral, a module damaged
by static, chained power strips, a spent surge protector, a shared neutral.
Safety procedures are Core 2's, so the question was whether these belonged
here at all.

**They stay, and the tag was what was wrong rather than the tickets.** Core
1's 5.1 is "Troubleshoot motherboards, RAM, CPUs, **and power**". Every one of
the six arrives as a power complaint — a tingle off a case, equipment that
misbehaves whenever the next circuit is busy, random failures dating from the
week a part was fitted. Every one is isolated with an instrument already on
the Core 1 power bench: a receptacle tester, a clamp meter, a multimeter, a
UPS front panel. And every one is graded on a diagnosis and a scope call. Not
one is graded on performing a safety procedure.

The decision was nearly the other way until the arithmetic was checked. All
three "hand it to a licensed electrician" answers on the track are among these
six. Moving them out would have left one of the three scope calls at step four
unreachable, and taken with it the most important professional lesson the
track teaches — recognising the point at which a job stops being yours. That
recognition happens on a Core 1 call, with a Core 1 instrument, before any
safety procedure begins.

**What is genuinely Core 2 is not here and should not be salvaged from these
tickets**: the anti-static strap and mat, electrical fire safety, lifting,
disposal. Build it fresh against its own objective. The one place Core 2
content had leaked in was the static-damage ticket's fix line, which spelled
out the handling procedure as though a power ticket were where you learn it.
That ticket's Core 1 half is the diagnosis — every reading on the machine in
tolerance, the failures dating from the day a part was fitted, so the fault is
in the history rather than in the numbers — and the fix now grades that and
names the handling as the cause without teaching it.

**All fifteen power faults were retagged** while this was settled. They
carried `3.5 / 5.2` and `3.5 / safety`, which are numbers from the old
objective list — in the book's list 3.5 is motherboards, CPUs and add-on
cards, and 5.2 is drives and RAID, neither of which is this track. They now
read `5.1`, with `5.1 — escalates` on the three that end at an electrician and
`3.6 / 5.1` on the one whose graded answer is choosing a supply that fits the
chassis rather than diagnosing one that has failed.

That cross-tag stayed when 3.6 got an exercise of its own, and the track is
deliberately NOT listed under 3.6 in the picker. One ticket in fifteen does
not make a power track a supply-sizing exercise, and a student who picked 3.6
and landed on fourteen tickets about something else would rightly conclude the
map was lying. The tag records what that one ticket teaches; the picker
records what a track is.

## Thirteen tracks

Pick a track in the header. The six steps are the same on all of them, because
the methodology does not change when the fault does — what changes is the
instruments you read and the thing you build at step four.

| Track | Instruments | What step 4 builds |
|---|---|---|
| **Hardware** | POST codes, front-panel LEDs, SMART across two drives, temperatures and fan RPM, event log | A parts order — fit, budget, shipping |
| **Networking** | `ipconfig /all`, the same command on a machine that works, switch port speed/errors/VLAN, ARP table | An interface configuration, tested against the site's real topology |
| **Mobile** | Device and battery health, storage, signal and APN, management enrolment, and what you can see with it in your hand | A decision with a price on it — repair, replace, warranty claim, clean, or reconfigure |
| **Virtualization & cloud** | Host memory and cores against what is promised, datastore latency, tenant quota, licences, metered spend | A resource allocation against a host with a finite amount of everything |
| **Mixed** | Whatever the ticket needs, and no signpost saying which | Nothing — the build here is the *scoping*, and then the one action that fixes it |
| **Laser printers** | Status page and page counts against the maintenance interval, the printer's own error log, a test print, and the service manual's rotating-component table | A **procedure**, in order, with the safety steps in it and the forbidden ones kept out |
| **Inkjet printers** | Status page, ink and waste-pad levels, cleaning-cycle count, error log, and a nozzle check | A **procedure**, same rules — plus the cleaning method for every part the job touched |
| **Laptops** | The machine's own figures, battery health against cycle count, the change record, and whichever test can be run before it comes apart | A **teardown procedure** — battery out before anything else, and a quote that follows how deep the part is buried |
| **Displays & video** | A torch held against the screen, a spare monitor, what the device does in its first two seconds, and lamp hours on a projector | A single decision: what actually gets done, on a part that may be bonded to another one |
| **Cabling & termination** | A continuity tester's pin map, a certifier report, a tone probe, a reflectometer, and looking at both ends | The **termination itself** — eight conductors into eight slots, to the standard the rest of the site is on |
| **Power & safety** | A multimeter on the 24-pin connector against the published tolerances, a receptacle tester at the wall, a UPS front panel, the circuit's load arithmetic, and an hourly input-voltage log | A **scope call first** — yours, a licensed electrician's, or facilities' — and then the procedure, with seven steps on the list that must never be carried out |
| **RAID & storage arrays** | The array's state, every member slot by slot, the controller's cache and write policy, and a backup panel that is on every ticket whatever the fault | A **classification first** — redundancy fault or data loss — and then the action, one of which is the only irreversible thing on the track |
| **Printer networking & sharing** | The device's own configuration page, the workstation's driver, queue and port, the print server queue, and the device's scan log | **Which of four links** the job stopped at, the fix for today, and then a four-part **deployment** graded against this site |

Faults by track: **printnet** (15) — wrong page description language, an address
that moved, a stopped spooler, a printer shared off somebody's desk, the wrong
default device, release printing that cannot be released, scan to email after a
mail migration, scan to folder after a password change, discovery that will not
cross a subnet, one stuck job holding a whole site's printing, a finisher the
driver was never told about, the print port closed by a new firewall rule, a
static address inside the DHCP scope now leased to a laptop as well, a scan too
big for the mail system to accept, and a tray telling the device the wrong thing
is in it. **raid** (15) —
one failed member, two on single parity, predictive failure, an unassigned hot
spare, a failed cache battery, a foreign configuration, a stalled rebuild, RAID
0, a deletion on a healthy array, a replacement too small, a backplane taking a
group of slots, unwritten cache after an unclean shutdown, the wrong disk pulled,
an expansion that cannot proceed, a rebuild at low priority. **hardware** (18) — memory, power supply, drive, cooling,
video, SATA cable, CMOS battery, a supply's own fan, a card's seized fans, an
NVMe throttling for want of a heatsink, an M.2 that was never screwed down, a
worn-out front-panel switch, a dead memory slot, dried thermal paste, a bank of
bulged capacitors on the board, a mismatched module that trained the pair down,
a card that has worked loose in its slot, a case fan on an uncontrolled header. **networking** (17) — subnet mask, default
gateway, DNS, APIPA/exhausted scope, duplicate address, patch cable, switch
port VLAN, a static address left over from the old subnet, a duplex mismatch, a
port shut down by port security, a stale proxy, an adapter disabled in the
operating system, a wireless band mismatch, an MTU that breaks large frames, a
stale DNS record, a hosts-file entry nobody remembers, and a loop taking the
segment down. **mobile** (17) — battery, charging port, digitizer, thermal,
cellular/APN, enrolment, storage, a blocked earpiece, a swollen cell, wireless
calling, an expired profile, a backup that has never run, a lifted screen
protector faking a dead digitizer, a contactless radio switched off by a
battery-saving policy, camera glass abraded so photographs fail only in
daylight, a triggered liquid indicator that ends the warranty conversation, a
model past the manufacturer's support window. **cloud** (17) — host
memory oversubscription, virtualization extensions, VDI datastore, quota, sync
conflict, licence, metered spend, a snapshot left running for months, host clock
drift, a backup window that overruns, a lapsed second factor, a service in the
wrong region, vCPU over-commitment where every guest queues and none looks busy,
a thin-provisioned datastore that promised more than it owns, a guest migrated
onto a port group that does not exist, a retention policy shorter than the
recovery anybody assumed, and a bill whose increase is all data leaving the
provider's network.
**mixed** (15) — crossings, below. **laser** — pickup and separation, fuser,
a repeating defect you have to measure, transfer roller, laser scanner,
duplexer rollers, exit rollers, registration rollers, drive gears, ozone
filter. **inkjet** — encoder strip, capping station, printhead clog, carriage
belt, waste ink pad, platen, star wheels, feed encoder wheel, purge pump,
pickup roller. **power** — a rail that sags under load, a Power Good signal
that never arrives, an outlet with no ground, an outlet wired hot-to-neutral
reversed, a UPS pack at end of life, a UPS overloaded by a laser printer, mains
that sags at the same hour daily, a module damaged by static, chained power
strips, a circuit past its continuous limit, a spent surge protector, a shared
neutral, equipment off the protected supply, a supply of the wrong form factor,
a UPS that has never been self-tested. **laptop** — memory, drive, a swollen battery, keyboard,
antenna lead, cooling, DC jack, hinge, trackpad ribbon, mainboard.
**display** — backlight, backlight driver, panel, the cable through the hinge,
projector filter, graphics driver, wrong input, lamp hours, a dead column, a
dark strip. **cabling** — open conductor, short, reversed pair, transposed
pairs, split pair, excess untwist, over-length run, wrong category, mis-punched
keystone, unpatched panel port.

## The networking track's connectivity test

Step four is not a quiz about networking, it is a configuration you type and a
reachability engine that evaluates it. Seven checks run against whatever you
built, and each fault leaves a different fingerprint:

| Fault | own | peer | gateway | server | internet | by name | 2GB copy |
|---|---|---|---|---|---|---|---|
| Wrong subnet mask | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Wrong default gateway | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Wrong DNS | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ |
| APIPA / exhausted scope | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Duplicate address | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Damaged patch cable | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| Wrong switch port VLAN | ✓ | ✗ | ✓ | ✗ | ✓ | ✓ | ✗ |

That table is the thing worth learning. Read the row and you know the fault.

**Two of the seven are not configuration faults at all.** The damaged cable and
the wrong VLAN both arrive with a configuration that is already correct, and
the graded answer is to leave it alone and fix the real thing. Retype it anyway
and the page says so: *"You changed a configuration that was already correct.
It was correct when you arrived and it is correct now — all you have done is
give the next tech a reason to doubt it."* Retyping a perfectly good IP
configuration is the most common wasted half-hour in the job.

Delivery is modelled properly rather than faked. If your mask says a
destination is local you ARP for it directly, which only works if it genuinely
is on your wire; if your mask says it is remote you hand it to the gateway,
which only works if the gateway is set, is real, and is itself local by your
own mask. That is why an over-broad mask and an over-narrow one break different
things.

## The mobile track's decision

Step four here is not technical and that is the point. Four things decide it,
in this order:

**Is the data safe?** A device that has never been backed up does not leave the
user's hands, whatever you have decided. The backup question is asked before
the decision and graded separately, because it is the one that cannot be undone
afterwards.

**Is somebody else paying?** Under twelve months it is a warranty claim, and
opening it yourself ends the cover — which is the opposite of your job.

**Is it worth fixing?** The repair cost is weighed against what the device is
worth *now*, not what it cost three years ago. Spend more than about half a
device's remaining value on one fault and you are pouring money into it. A
battery swap usually clears that bar; an out-of-warranty screen usually does
not, and the crossover lands around two years.

**Is it broken at all?** Three of the seven faults are settings. One is five
minutes with a plastic pick and no part at all — a charging port full of pocket
lint, which gets replaced instead of cleaned more often than anyone would like
to admit.

The bench offers a factory reset on every ticket. It takes an hour, answers
almost nothing, and costs the user everything on the device. It is there
because it is the first thing people reach for.

## The mixed track

Every ticket here presents in one domain and lives in another. The user is not
being unhelpful — they are describing the thing they can see, and the thing
they can see is downstream of the thing that broke.

| The call | Where it actually lives |
|---|---|
| "The printer is broken" | The switch port was moved to the guest VLAN. The printer prints its own test page perfectly. |
| "The wireless is down in this corner" | One laptop's wireless card has failed. Four machines beside it are associated at full signal. |
| "The virtual desktops are slow" | One user's patch cable has a damaged pair. Eleven other sessions on the same host are fine. |
| "The cloud keeps losing my files" | The boot drive is failing and corrupting files before the sync client uploads them. |
| "The email server is down for me" | One handset lost its management profile in a reset. The same account works on the web and on the laptop. |

Step three is the scoping exercise: mark **all four domains**, in or out. Naming
the domain the fault lives in is the obvious half. **Ruling the innocent domain
out with a piece of evidence — rather than a shrug — is the half nobody drills**,
and it is what separates a technician from a parts-swapper. A tech who checks
the network on a power supply fault and confirms it is fine has done the job
properly; one who never checks has been lucky.

Step four offers ten actions, and five of them fix the domain the caller named.
Every one of those costs somebody money for nothing, and each says so: *"It
prints its own test page perfectly. Replacing a working printer is an expensive
way to avoid looking at the network."*

## The six steps

| Step | What the student does |
|---|---|
| 1 · Identify the problem | Works the call. Separates symptom from conclusion, checks the change record and the asset register, and backs up before touching anything |
| 2 · Establish a theory | Reads POST behaviour, front-panel LEDs and the change record, then commits to a probable cause and names the evidence that supports it |
| 3 · Test the theory | SMART across two drives, temperatures and fan RPM, the event log. Then **opens the machine and looks** — a model of the actual hardware with every part inspectable. Then picks **one** bench test from five: only one isolates this fault, the rest are honest work that tells you nothing, and the clock is running. Then **points at the part** in the model |
| 4 · Plan of action | **Orders the part.** Fit, budget and shipping, all graded |
| 5 · Verify and prevent | What actually counts as verification, and the preventive measure that addresses *this* cause |
| 6 · Document | The ticket note that saves the next tech an hour, and how to record a caller who got it wrong without editorialising about them |

A step opens when the one before it is **finished** — not merely attempted. A
locked step is removed from the page rather than dimmed, so nothing inside it
can be tabbed into or operated. Instructor mode opens everything.

## The part bench, and the 3D layer

Eleven of the thirteen tracks put something physical in front of the student in
step three: the machine open on the bench, the handset exploded into its layers, the
network run laid out from the desk to the gateway. Each one is a model you can
turn, zoom and click, and each one ends in a graded question — *point to it*.

**Naming a category is not the same as knowing which one.** A student who has
worked out "it's the memory" still has to say which of the two identical
modules, and the one-module bench test is what tells them. "It's the screen" is
not an answer when the display and the digitizer are two separate parts bonded
together and only one of them has failed. On the networking track the answer is
often *none of the copper* — five of the seven faults are settings on the
machine itself, and deciding you do not need a cable tester is worth as much as
using one.

| Track | The model | What the answer can be |
|---|---|---|
| Hardware | A tower with the side panel off — cooler, two memory slots, two drives, the SATA cable, the supply, the coin cell, the card, the fans | One of eleven parts, and on four faults it is a specific one of a matched pair |
| Mobile | The handset exploded: cover glass, digitizer, display, battery, logic board, port, camera, SIM, chassis | One of nine parts, or **no physical part at all** — four of the seven mobile faults are configuration |
| Networking | The run: workstation, patch cable, outlet, in-wall run, patch panel, patch lead, switch port, switch, uplink, router | One of ten points on the run — and on five of the seven faults that point is the workstation's own configuration |
| Laser | A cross-section of the paper path: tray, pickup, registration, the four imaging stages round the drum, fuser, exit, duplexer, gears, ozone filter | One of fourteen parts — and on the repeating-defect ticket, whichever one the measured interval names |
| Inkjet | A plan view of the carriage and everything the head passes over or parks in: platen, belt, encoder strip, capping station, wiper, pump, waste pad, star wheels | One of twelve parts |
| Laptop | The chassis opened from the bottom, stacked by depth: cover, battery, memory, drive, wireless card, fan, keyboard, DC jack, hinge, trackpad, board | One of twelve parts — and how deep it is buried is a second graded answer, because that is what the quote is made of |
| Displays & video | Not one device but everything you might point at: panel, backlight, driver board, the cable through the hinge, the graphics end, the port, and a projector's lamp and filter | One of eight parts — and half of them are cleared by a torch before anything is opened |
| Cabling | The link laid out in the order the signal meets it: the plug you crimped, the outlet, the run in the wall, the panel, the cord across, the switch port | One of seven points — and four of the ten faults turn on *which end*, not which part |
| Power & safety | Everything between the breaker and the board, in the order the current travels: panel, outlet, strip, UPS and its pack, supply, connector, module | One of eight — or **nothing on the bench at all**, because on one ticket the fault is the supply into the building |
| RAID & storage | Generated per ticket from the array itself: one carrier per disk in slot order, the controller, the cache and its battery, and the backup system off to one side | One of the slots, or the controller, the cache, the enclosure — or the backup, on the ticket where the array is perfect and the data is gone anyway |
| Printer networking | The path a job takes: workstation, USB cable, switch, print server, access point, device | One of six links — or **nothing in the chain**, on the ticket where the job was never sent down it |

Virtualization and cloud has no model, deliberately. There is nothing to put
your hands on in a hypervisor, and a 3D box with "HOST" written on it would be
decoration. Students can tell.

### Two rules the model obeys

**Colour says what a part is, never whether it is broken.** Memory is green
board, SATA cables are red, coin cells are bright metal, supplies are matt
black — the same on every ticket whatever is wrong with it. The first cut of
this did tint the faulty part, and a single screenshot gave the game away: you
could skip the evidence entirely and click the one that was a different colour.

The one exception is a fault a technician would genuinely see standing in front
of the machine — a fin stack packed with felted dust, a charging port full of
lint, a cable jacket flattened under a chair castor. Those are marked, because
in the room they are marked. A dying power supply, a failing drive and a worn
battery are not, and the inspection notes say so in as many words: *"Nothing to
see. It is a sealed unit with no lights on it."* That asymmetry is the lesson.
You look first because it is free, and when looking does not answer it you go
to the bench.

**Every part gets a note, and most of them mean nothing.** Dust, a scuffed
panel, a cable tie somebody cut off, fingerprints. Telling ordinary wear from a
fault is the whole skill, and a model where only the broken part has anything
written beside it teaches nobody anything.

### Parts are built, not boxed

Every part is a list of primitives merged into one geometry — a cooler is a
cold plate, four heat pipes, a twenty-six-fin stack, a shroud, a hub and seven
blades; a laser drum is a cylinder, two end caps and a sixteen-tooth drive
gear; a switch is a chassis, eighteen port blocks, nine link LEDs, rack ears
and a vent stack. Detail costs vertices rather than draw calls, so fourteen
parts stay fourteen draw calls however much is in them, and the whole hardware
bench is about 40,000 vertices.

Boxes carry real chamfers, because nothing manufactured has a perfectly sharp
edge and a small bevel is the cheapest thing that makes plastic read as
moulded. Parts carry a finish — matte, plastic, rubber, metal, steel, board,
glass — kept deliberately low-gloss: a specular highlight rolling across a
surface photographs well and takes legibility away from exactly the people
this was built for.

Nothing here is modelled on any manufacturer's product. The names in the build
are invented, and A+ is vendor-neutral by design — the exam tests what a fuser
*is*, not what one maker's fuser looks like.

### The controls come first, the picture second

Some of the people this was built for have damaged eyesight. A WebGL canvas is
an opaque rectangle to a screen reader, it does not reflow when the browser is
zoomed, and the contrast of a lit surface is a function of the lighting rather
than a token you can guarantee. So the model is never the control.

Every part exists first as a real, labelled, focusable button in ordinary HTML.
Those buttons carry the labels, the readings, the selection state and the
grading. The canvas is a second view of the same selection, and picking in it
is a convenience, not a path to anything the buttons cannot do. Alongside it
sit seven plain buttons — rotate, tilt, zoom, reset — so the view is fully
drivable from a keyboard or a switch, with no drag gesture required.

If WebGL is switched off, missing or broken, the page says so in a sentence and
carries on with the buttons. Nothing is lost but the picture, and three.js is
never even downloaded on a browser that cannot run it. Selection is shown three
ways at once — the part lifts out of the model, takes the accent colour, and
gets a marker in its label — because any one of those on its own fails
somebody.

Three.js ships in the repo (`assets/three.module.min.js`, 167KB gzipped) rather
than off a CDN, so the whole thing still works on a locked-down network or with
no internet at all.

## The printer tracks

Printers are the part of A+ people skip and the part of the job that fills a
technician's week. They are also the only device here where the fix is a
*procedure* rather than a part, and the only one with a named process the exam
expects you to know cold.

Two tracks, five tickets each.

| Laser | Inkjet |
|---|---|
| Pickup roller and separation pad — misfeeds and multi-feeds | Encoder strip — the carriage cannot read its own position |
| Fuser — the toner never bonds and rubs off the page | Capping station — the head dries out every night |
| A repeating defect — measure it, and it names the roller | Printhead — one channel gone from the nozzle check |
| Transfer roller — pale print, toner on the reverse | Carriage belt — doubled strokes and a carriage that overshoots |
| Laser scanner assembly — a white void down every page | Waste ink pad — the printer stops itself dead |

Twenty-six major moving parts across the two engines, each carrying what it
does, how it fails, what it looks like when it *is* the fault, the correct
cleaning method, and the plausible wrong method that destroys it.

### The repeating defect is arithmetic

A mark that repeats down a page is not "the drum". Every rotating component
turns at its own circumference, so the spacing between the marks names the
part. The marks are on the test print, the circumferences are on that model's
service manual page, and the subtraction is the difference between ordering
one roller and ordering a whole cartridge on a hunch.

The numbers move per ticket, so it cannot be memorised — a student reads the
manual in front of them every time, which is what the job actually looks like.
The bands are disjoint by design: the first cut let two components share a
measurement, which would have left the question with two right answers.

The measurements only appear once the student runs the measurement on the
bench. Otherwise the isolating test on that ticket is one whose answer is
already printed above it.

### Step four becomes a procedure

The other tracks grade a part, a configuration, a decision, an action or a
termination.
These two grade a **sequence**, because that is what a printer repair is. Three
kinds of step sit on one list together: the ones that belong here, honest ones
from a different repair, and eleven that must never appear at all.

A forbidden step fails the whole procedure however tidy the rest of it is.
Nobody gets partial credit for a well-ordered afternoon with a burn in the
middle of it.

The eleven are the real ones, and every one is something a reasonable person
reaches for:

| Never | Why |
|---|---|
| Vacuum toner with a workshop vacuum | The filter passes it straight back into the room, and the motor brushes can ignite an airborne cloud |
| Blow toner out with compressed air | That does not remove it, it aerosolises it — into the room, the optics, and you |
| Wash toner off with hot water | Cold only. Toner is *designed* to bond under heat — that is what the fuser does to it |
| Wipe the drum with a cloth | Skin oils mark it permanently, cloth scratches the coating, daylight fogs it in minutes |
| Pull the fuser out and get on with it | It holds around 200°C long after power-off |
| Oil the feed rollers | A feed roller works by gripping |
| Isopropyl on an encoder strip | Solvent dissolves the printed markings. It looks spotless and the carriage can no longer read it at all |
| Force the carriage by hand | It is locked when parked; forcing it strips the belt or the drive gear |
| Pull the plug mid-cycle | The head is left uncapped and drying |
| Run cleaning cycles back to back | Each one dumps ink onto the waste pad. Three that do not clear it means something mechanical is wrong |
| Rinse parts under the tap | Mineral deposits, in exactly the places that must stay clear |

### Cleaning is graded on every ticket

Not filed under maintenance — on a printer it is part of every job. Each ticket
lists the parts that job actually touched, and asks for the method for each.
The wrong answers are live options, and most of them cost the part.

The models follow the same rule as the other three: **colour says what a part
is, never whether it is broken.** That matters more here than anywhere else in
the build, because most printer faults genuinely *are* visible on inspection —
which would have made a colour cue a free answer on nearly every ticket.

## The printer networking track

The two printer tracks in this build are about the machine. Every one of those
tickets assumes the job reached the printer. This one is about everything
between the user and the device, which is where most printer calls actually
live:

> the application → the driver → the local queue → the port → the network →
> the device's own queue → the device

**Seven places, and the caller describes all seven with the same six words.**
The first useful question on a printer call is never "is the printer working" —
it is *how far did the job get*, and each panel on step three answers that for
one link.

**What the configuration page proves.** A device that prints its own page has a
working engine, working toner, a clear paper path and a working formatter.
Everything left is between it and the user. Half these tickets are settings, two
are the device's own address, two are scanning rather than printing, and one is
a deployment decision made years ago that has been costing a call a month ever
since.

### Step four ends with a deployment

Naming the link and doing the fix closes the ticket. The third control asks how
this device *should* have been put in, and it is graded against the site rather
than a rule of thumb — four choices covering connection, addressing, where the
queue lives, and which driver.

Two of the four are the same on every ticket, and they are the two these faults
keep coming from: **a reservation, never bare DHCP**, and **never shared off
somebody's workstation**. The other two follow the site — a startup with no
print server puts a queue on each desk; a corporate fleet uses the server and a
universal driver. Sharing a device off a desk works, costs nothing, and makes
one person's power switch a dependency for everybody else's printing.

## The RAID and storage track

One distinction runs through all fifteen faults, and a technician who cannot
make it on sight will eventually destroy somebody's data:

> A **redundancy fault** means a disk has gone and the data has not. The array is
> degraded, still serving, and what is lost is the margin.
>
> A **data-loss fault** means the redundancy is already spent. No rebuild and no
> recovery tool brings it back — a backup does, and the conversation is about the
> date on it.

Step three makes the student do the arithmetic that decides it: **usable
capacity** from the level and the member list, and **how many more failures this
array can survive right now** — which is not what the level says on paper. Both
are computed, so neither can be memorised.

**RAID is not a backup.** One ticket is a completely healthy array that has lost
data anyway, because somebody deleted a folder and every member got a perfect
copy of the deletion instantly. The finding on that ticket is that the backup job
has never once completed.

**Import, never clear.** On the foreign-configuration ticket the two options sit
next to each other on the controller screen, one of them is one word long, and
only one is reversible.

## The power and safety track

The one track where getting it wrong can hurt somebody, and the only one that
grades a question no other track asks: **is this yours?**

Every reading is computed from the fault and shown **beside its published
limit**, never pre-judged. A rail is not flagged as bad — it sits next to
"11.40 to 12.60 V" and the student does the comparison, because that is exactly
what they will be doing with a meter in their hand.

The ten faults split three ways, and telling them apart on sight is the skill.

**The supply in the machine.** A 12V rail that holds at idle and drops out of
tolerance under load. A Power Good signal that never asserts, which is
indistinguishable from a dead motherboard until you spend four minutes with a
supply tester instead of three hundred dollars on a board.

**The building.** An open ground, or an outlet wired hot-to-neutral reversed.
Neither is a computer fault and neither is yours to repair. Reversed polarity
reads hot-to-ground at nothing and neutral-to-ground at full line voltage —
which is the two conductors the wrong way round, and it means the chassis of
anything plugged in sits at line potential. What you do is label the outlet,
move the user, write down the readings, and hand it to somebody licensed.
That decision is graded, because "have a go" is how technicians get hurt.

**The load.** A UPS with a laser printer on the battery side. Chained power
strips with a warm plug between them. A circuit past 80% of its breaker — the
number nobody knows, and the reason a breaker trips at four o'clock. None of it
is fixed by fitting a bigger breaker, which is on the forbidden list for the
same reason it is on every electrician's: a breaker protects the wire, and a
larger one leaves the same wire carrying more current with nothing to stop it.

### Seven steps that must never be carried out

Opening a supply to check its capacitors. Defeating a ground pin with a
three-to-two adapter. Fitting a larger breaker. Rewiring an outlet box
yourself. Chaining a second strip. Binning a sealed lead-acid pack. Silencing
an overload alarm. Any one of them fails the whole procedure however tidy the
rest of it is.

### One ticket has no faulty part at all

On the brownout ticket the mains sags below the ±10% window at the same hour
every day, across more than one machine. Nothing on the bench is broken. The
part-bench answer is *nothing here — the fault is upstream of all of it*, and
saying so is the right answer rather than a failure to find one.

Note on objectives: power supply installation and troubleshooting is Core 1
(220-1201, **3.6** and **5.1**). This paragraph carried `3.5 and 5.2` until the
faults on this track were retagged — those are numbers from an older objective
list, and in the book's list 3.5 is motherboards, processors and add-on cards
and 5.2 is drives and RAID, neither of which is this track. ESD and electrical
safety procedures live in Core 2 (220-1202, 4.4). Both are in this track
because a technician meets them in the same call, and the objective label on
each ticket says which is which.

## The cabling track

The most hands-on thing in Core 1, and until now the part of the program with
no coverage at all. A technician terminates cable, and then reads a tester that
tells them what they just did wrong.

**The pin map is computed from the fault.** It is never a table sitting beside
the answer — change the fault and the readout changes with it, which is the
only way an exercise like this survives regenerating.

Three things it grades that nothing else here does.

**The pinout itself.** T568A and T568B are the same eight conductors in two
different orders, and they differ in exactly one way: orange and green trade
places, so pins 1 and 2 swap with 3 and 6. Blue and brown never move. A student
who holds that can derive either standard from the other and spot a crossover
on sight. Step four is the termination — eight selects, eight conductors, to
the standard the rest of the site is already on, because a cable that is
correct on its own and different from everything around it is the next ticket.

**What a tester is actually saying.** An open, a short, a reversed pair,
transposed pairs and a split pair are five readings with five causes and five
fixes, and only one of them is a re-crimp of the end you happen to be standing
next to. Four of the ten faults turn on *which end*.

**The split pair**, which is the one that matters. It passes a continuity test
perfectly — pin one to pin one, all the way across — and then fails under load,
because the conductors were paired up wrongly inside the twist. A cheap tester
says it is fine. It is not fine, and the only instrument that can see it costs
twelve minutes.

The tester panel deliberately shows pin numbers and pair *numbers* and no
colours at all, which is what a real tester reports. The first cut printed the
conductor colour beside each pin — and that put the answer to the step-four
termination exercise one step above the exercise. Naming a pair by colour is
now a question in its own right, because turning a pair number into a colour
takes the standard, and that is the knowledge being tested.

## Ordering the part

Three separate judgements, and the lazy answer loses all three ways.

**Fit is not negotiable.** A 650W ATX supply will not mount in a small-form-
factor case. A 165mm cooler will not let the side panel close. DDR5 will not
seat in a DDR4 slot, and a SODIMM is the laptop part. Every rejected option
explains itself in the terms a tech would use.

**Then the money.** The business tier sets the standing spending authority —
startup, small business, corporate — and each job carries a figure signed off
against it. Urgency lifts that figure, because a production outage loosens a
purse that an annoyance does not. **Over-buying fails as hard as under-buying:**
an 1,100W supply on a machine drawing 460W works perfectly and the customer is
paying for headroom nobody will ever use.

**Then shipping.** The right part sent the wrong way is still wrong. Production
down at a corporate site justifies overnight. Production down at a startup with
no expedite budget does not — you say so plainly and offer a loaner rather than
spending money they have not got.

And sometimes every part that works costs more than has been approved. That is
not a broken ticket, it is the most common hard conversation in the job, and
there is a graded path for it: stop, and go back to the customer with the
number. Neither overspending nor fitting something that will not do the work.

## Reading the instruments

The fault's signature is genuinely readable — a student who works the
instruments arrives at the right part without being told. The noise is
genuinely ordinary — every red herring is something healthy machines log every
day, so chasing one is a real mistake rather than falling for a trick.

The cable ticket is the one worth studying. CRC errors climb while every other
SMART attribute is spotless, because the disk is fine and its connection is
not. Condemn the drive and you have replaced a healthy part and left the fault
in place.

## Instructor mode

PIN **3693**, same as the rest of the toolkit. Opens every step, reveals every
answer, highlights the significant rows, marks the parts that fit, and shows
what the fault actually was. Switching it back off takes the answers away
again — and anything the student earned themselves stays on screen.

## Verification

Nothing here is asserted without being measured.

- **600 generated tickets**: every fault always has at least one working part
  and never has all of them, every rejected part carries a reason, the five
  tickets in a session are always five different faults, and red herrings never
  name the real part.
- **12,000 printer machines and 4,000 instrument reads**: every fault has a
  procedure with no forbidden step in it and its safety steps ahead of the
  hands-on work, every action in both pools explains itself, every touched part
  offers its correct method and its damaging one, and no two rotating
  components on a machine share a measurement.
- **20 printer tickets end to end in a browser**: forbidden steps refused 20/20,
  reversed procedures refused 20/20, wrong cleaning refused 20/20, and the part
  located correctly 20/20.
- **6,000 tickets through the models**: the correct part is always on the
  list and exactly one part on it is correct, every part carries a label, a
  spec and a note, no text ever renders `undefined`, every wrong answer has its
  own explanation rather than a shrug, and no part is ever geometrically buried
  inside another where it could not be clicked.
- **The bench, end to end in a browser**: 30 tickets across three tracks and
  both themes, every part read, every part confirmed. Exactly one grades
  correct on all 30; 280 wrong answers exercised and every one explained.
  Confirming with nothing selected is not counted as a wrong answer.
- **Degraded browsers**: with WebGL disabled, no canvas is created, the
  fallback sentence appears, three.js is never downloaded, and all three
  tracks still complete. With reduced motion set, the model renders and does
  not animate. Four shuffles and four track changes leave exactly one canvas
  on the page, never a stack of detached ones.
- **500 tickets through the instruments**: exactly one isolating bench test
  every time, claims always split one contradicted / two confirmed / one
  unknown, SMART flags the failing drive and only the failing drive, CRC errors
  appear only on the cabling fault, and thermals throttle only on the cooling
  fault.
- **15 tickets completed end to end in a browser**: the gate holds, nothing
  inside a locked step is operable, and a clean walk scores 100%.
- **Adversarial paths**: running a non-isolating bench test first is penalised
  and blocks the next step, a part that does not fit is rejected with the
  physical reason, an over-budget part is rejected against the approved figure,
  and the wrong shipping is rejected while still crediting the right part.
- **1,050 network fault/site combinations**: the ticket as found always fails
  at least one connectivity check, a configuration fault is always fully
  fixable by configuration, a physical fault is **never** fixable by
  configuration, a junk configuration never passes anything, every failing
  check explains itself, and all seven faults have distinct fingerprints.
- **1,000 network tickets through the instruments**: each fault flags its own
  field in `ipconfig` and no other, link speed degrades only on the cable
  fault, the VLAN is wrong only on the VLAN fault, and the ARP table shows a
  conflict only on the duplicate-address fault.
- **15 network tickets completed end to end in a browser**, plus the
  leave-it-alone rule enforced on every physical fault.
- **2,800 mobile device/fault combinations**: configuration faults never route
  to a part or a claim, physical faults never route to a setting, warranty
  claims only happen inside twelve months, the repair-or-replace threshold is
  applied consistently in both directions, every outcome right or wrong
  produces a real explanation, and the backup requirement always agrees with
  the outcome.
- **1,000 mobile tickets through the instruments**: each fault flags its own
  panel and no other, and the storage bar is always honest about free space.
- **15 mobile tickets completed end to end in a browser**, with the wrong
  backup call and the wrong outcome both rejected with reasons, every time.
- **2,800 cloud host/fault combinations**: the memory fault always arrives
  broken and the other six always arrive sound, the minimum allocation always
  passes, and starving a guest, over-promising memory and triple-provisioning
  all fail.
- **15 cloud and 15 mixed tickets completed end to end in a browser**, with
  inverted scoping, wrong actions, and touching a sound allocation all rejected
  with reasons.
- **2,000 cabling tickets**: the tester's pin map always matches the fault it
  was computed from — one pin open on an open, two shorted on a short, four
  transposed on a crossover, and a *perfect* map on the two faults continuity
  cannot see. Every fault has exactly one isolating instrument out of six,
  every instrument says something real when it is the wrong one, the correct
  wire order is always eight distinct conductors, and the part at fault is
  always on the link.
- **15 cabling tickets end to end in a browser**: all ten faults reached, the
  part located 15/15, the correct termination accepted 15/15, using the same
  conductor twice refused by name 15/15, and two conductors swapped refused
  with the offending pin numbers 15/15.
- **3,300 model builds across all eleven benches**: zero parts geometrically
  buried inside another, every locate target present on its own model, and no
  part text rendering `undefined`.
- **Wrong-answer feedback never names the right answer.** It explains why the
  choice in front of you is clear and sends you back to the evidence. Two
  controls used to name it, which quietly made their guided hints unreachable —
  nobody reaches a third attempt on a control that gave it away on the first.
- **130 page states × 11,465 rendered options**: nothing anywhere on the page
  renders as `undefined`, `NaN` or an empty choice, and no dropdown offers the
  same option twice. This check finds a class of bug the end-to-end walkers
  cannot see — they read the answer from instructor mode and then pick the
  option matching it, so a broken answer matches a broken option and the walk
  passes. It has caught four tracks offering `undefined` as a preventive
  measure, a hard-coded seven-item list that stopped offering five of one
  track's twelve faults, twenty printer tickets with no test-print description,
  and several duplicated option strings.

  Its first version used `\bundefined\b` and missed five whole tracks, because
  the string actually on the page read `"Fuser assemblyundefined"` — a missing
  value concatenated onto the end of a real word, with no word boundary for the
  pattern to match. The word boundary came out and the check immediately found a
  correct-answer explanation that had been empty on four tracks since they were
  built.
- **2,000 power tickets**: every rail reading is inside its published tolerance
  except on the one fault that puts it outside, and the outlet, UPS, circuit and
  mains-log signatures each appear on their own fault and no other. Every fault
  has exactly one isolating instrument out of eleven, every procedure is free of
  the seven forbidden steps, and every one of the four scope calls has a real
  explanation on every ticket.
- **15 power tickets end to end in a browser**: the part located 15/15, the
  right scope call accepted 15/15, a wrong scope call refused with a reason
  15/15, forbidden steps refused 15/15, and reversed procedures refused 15/15,
  with all three correct scope calls exercised.


- **4,500 arrays generated**: the array's stated condition and the arithmetic
  underneath it never disagree, every level always has at least its minimum
  member count, usable capacity always matches the level's own formula, and a
  data-loss classification is only ever reachable when the failures actually
  exceed what the level carries — or when what was lost was never a disk.
- **15 RAID tickets end to end in a browser**: usable capacity right 15/15,
  remaining tolerance right 15/15, all four classifications exercised, and a
  wrong classification refused with a reason 15/15.
- **15 printer-networking tickets end to end**: all four links exercised, all
  four site-dependent deployments reached, a wrong link refused 15/15 and a wrong
  deployment refused 15/15.
- **26,000 tickets generated across all thirteen tracks** with no crashes.
- **620 graded questions × 5 wrong answers each, across all thirteen tracks**:
  silent for the first two, guides on the third, escalates, and never states the
  answer.
- **780 page states swept** — all thirteen tracks, both themes, all five tickets,
  with every control exercised, the part bench read, the locate question answered
  both ways, hint panels forced on screen, and the procedure builder, cleaning
  module, termination builder, scope call, classification and deployment builder
  all driven into their refusals — for contrast. Zero failures.
- **Contrast**: every piece of text clears **WCAG AAA** (7:1 body, 4.5:1 large)
  in both themes at 1300px, 820px and 390px, on all thirteen tracks.

## What's here

```
index.html             page shell, theme bootstrap, instructor dialog
assets/ticket.js       the generator — one ticket object per scenario, all thirteen tracks
assets/network.js      the networking track: faults, topology, address maths,
                       and the reachability engine step four is graded against
assets/mobile.js       the mobile track: faults, device model, repair economics,
                       and the repair-or-replace decision
assets/cloud.js        the cloud track: faults, host capacity model, and the
                       allocation checker step four is graded against
assets/mixed.js        the mixed track: five crossings, and the scoping
                       judgement that is the whole exercise
assets/printer.js      both printer tracks: the seven-stage laser process,
                       twenty-six moving parts with cleaning methods, the
                       ordered procedures and the eleven forbidden actions
assets/laptop.js       the laptop track: faults, teardown depth and the quote
                       that follows from it, and the six actions that must
                       never appear in a procedure
assets/display.js      the display track: faults, the torch and spare-monitor
                       tests, and what the pixel words actually mean
assets/cabling.js      the cabling track: both pinouts, the computed tester
                       map, the certifier report, six instruments and what each
                       one cannot see
assets/raid.js         the RAID track: the levels as functions rather than a
                       table, computed capacity and fault tolerance, the array
                       generator, and the redundancy-against-data-loss call
assets/printnet.js     the printer networking track: the seven links, the
                       instruments for each, and the deployment builder graded
                       against the site
assets/power.js        the power and safety track: ATX tolerances and the
                       readings checked against them, outlet and UPS panels,
                       circuit arithmetic, the scope-of-work call, and the
                       seven forbidden steps
assets/hints.js        the guided hints — where to look, how to reason, and
                       which tempting option to rule out and why. Never the
                       answer
assets/instruments.js  POST, SMART, event log, thermals, change record,
                       caller's claims, bench tests
assets/models.js       the eleven physical models as pure data — every part,
                       where it sits, and what you see when you look at it.
                       The array's is generated per ticket, because the array is
assets/scene.js        the WebGL viewer: builds a declarative part list, reports
                       clicks back, and is allowed to fail without costing
                       anything
assets/three.module.min.js   three.js r160, vendored (MIT) so the build has no
                       CDN dependency
assets/app.js          the six gated steps, grading and page wiring
assets/style.css       tokens, step palette, tables, parts order, part bench
```

Plain static HTML/CSS and ES modules. No build step, no framework, no
dependencies. Because it uses ES modules it must be **served over HTTP** —
opening `index.html` from the filesystem will be blocked by CORS. GitHub Pages
serves it correctly; locally, any static server will do.

## Hosting 

GitHub Pages, deployed from `main` / root — Settings → Pages → Source: Deploy
from a branch → `main` → `/ (root)`.

## Disclaimer

Companies, callers, asset tags, part numbers and prices are synthetic. For
educational purposes only. Not affiliated with, endorsed by, or sponsored by
CompTIA®. All trademarks belong to their respective owners.
