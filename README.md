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

> **Stage 1 of a larger build.** This is the hardware track: five tickets, seven
> possible faults. Networking, mobile, virtualization/cloud and a set of
> cross-domain tickets follow, along with a 3D layer over the physical domains.

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

## The six steps

| Step | What the student does |
|---|---|
| 1 · Identify the problem | Works the call. Separates symptom from conclusion, checks the change record and the asset register, and backs up before touching anything |
| 2 · Establish a theory | Reads POST behaviour, front-panel LEDs and the change record, then commits to a probable cause and names the evidence that supports it |
| 3 · Test the theory | SMART across two drives, temperatures and fan RPM, the event log — then picks **one** bench test from five. Only one isolates this fault; the rest are honest work that tells you nothing, and the clock is running |
| 4 · Plan of action | **Orders the part.** Fit, budget and shipping, all graded |
| 5 · Verify and prevent | What actually counts as verification, and the preventive measure that addresses *this* cause |
| 6 · Document | The ticket note that saves the next tech an hour, and how to record a caller who got it wrong without editorialising about them |

A step opens when the one before it is **finished** — not merely attempted. A
locked step is removed from the page rather than dimmed, so nothing inside it
can be tabbed into or operated. Instructor mode opens everything.

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
- **Contrast**: every piece of text clears **WCAG AAA** (7:1 body, 4.5:1 large)
  in both themes at 1300px, 820px and 390px.

## What's here

```
index.html             page shell, theme bootstrap, instructor dialog
assets/ticket.js       the generator — one ticket object per scenario
assets/instruments.js  POST, SMART, event log, thermals, change record,
                       caller's claims, bench tests
assets/app.js          the six gated steps, grading and page wiring
assets/style.css       tokens, step palette, tables, parts order
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
