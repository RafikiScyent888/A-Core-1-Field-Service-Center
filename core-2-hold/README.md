# Held for Core 2 — CompTIA A+ 220-1202

Nothing in this folder is broken, unfinished or abandoned. It is Core 2
content that was built inside a project which is now Core 1 only, lifted out
whole on 23 August 2026 so it can go straight back when the Core 2 build
starts.

## What is here

**`winos.js`** — the Windows & OS troubleshooting track. Ten faults:
a startup application taking the machine, a driver that stopped the device, a
system drive with nothing left on it, an update that fails and retries every
boot, a damaged user profile, a service set to disabled, a page file too small
for the work, hardware Windows cannot start, something added to Windows rather
than Windows itself, and damaged system files.

It grades three things in order: the **scope** (this user, this machine, or
everybody), the **one tool** that answers the question, and then the
**smallest remedy that works** — with reimaging refused as too big on every
single ticket, which is the point of the track.

**`winos-app-blocks.js`** — the parts of `assets/app.js` that rendered it,
kept verbatim: the step-1 machine panel, `osTheoryQuestions`, `osStepTest`,
`osStepPlan`, and the preventive-measure map. Restoring the track is a paste
and four dispatch lines, not an archaeology exercise.

**`oswalk.mjs`** lives in the test scratchpad as `oswalk.mjs.core2-hold`.

## Verified state at the moment it was removed

15/15 tickets end to end. Reimaging correctly refused as disproportionate on
every ticket. Zero undefined strings, zero console errors, zero WCAG AAA
contrast failures. It worked; it is simply in the wrong exam.

## To put it back

1. `winos.js` returns to `assets/`.
2. Paste the blocks from `winos-app-blocks.js` back into `app.js` and restore
   the four dispatch lines: the `stepTheory` panel, `if (G.track === "winos")
   return osStepTest(t);`, the same for `osStepPlan`, and the `stepRequired`
   branch (`test: test-isolate/test-part`, `plan: plan-scope/plan-remedy`,
   `verify: verify-what/verify-prevent` — no locate question, because an
   operating system is not a thing in a room).
3. Re-register the track in `ticket.js`: the import, the `TRACKS` entry, the
   two seed-offset maps (`winos: 181` and `winos: 530003`), and the payload
   branch that calls `buildWinos`.
4. Restore the `winos` line in `hints.js`.

## Settled: the six power faults stay in Core 1

They were tagged `3.5 / safety` and held pending a decision. The decision is
that they stay, and that the tag was what was wrong rather than the tickets.

**Why they are Core 1.** Core 1's 5.1 is "Troubleshoot motherboards, RAM,
CPUs, **and power**". Every one of the six arrives as a power complaint — a
tingle off a case, a machine that misbehaves whenever the next circuit is
busy, random failures dating from the week a part was fitted — and every one
is isolated with an instrument already on the Core 1 power bench: a receptacle
tester, a clamp meter, a multimeter, a UPS front panel. What each one is
graded on is a diagnosis and a scope call. Not one of them is graded on
performing a safety procedure.

**Why it would have been wrong to move them.** All three "hand it to a
licensed electrician" answers on the track are among these six. Take them out
and one of the three scope calls at step four becomes unreachable, and with it
the most important professional lesson the track teaches: recognising the
point at which a job stops being yours. That recognition happens on a Core 1
call, with a Core 1 instrument, before any safety procedure begins.

**What IS Core 2, and is not here.** The procedures themselves — anti-static
strap and mat, electrical fire safety, lifting, disposal, the handling of a
component so it does not get damaged in the first place. None of that is built
in this repository and none of it should be salvaged from these tickets. Build
it fresh in Core 2 against its own objective.

**The one thing that was genuinely in the wrong place** was the `esdstatic`
fix line, which spelled out the anti-static handling procedure — mat, strap,
hold it by the edges — as though a Core 1 power ticket were where you learn
it. That ticket's Core 1 half is the diagnosis: every reading on the machine
is in tolerance and the failures date from the day a part was fitted, so the
fault is in the history rather than in the numbers. The fix now grades that
and names the handling as the cause without teaching it, and points at Core 2
for the procedure.

**Retagged.** All fifteen power faults carried `3.5 / 5.2` or `3.5 / safety`,
which are numbers from the old objective list — in the book's list 3.5 is
motherboards, CPUs and add-on cards, and 5.2 is drives and RAID. They now read
`5.1`, with `5.1 — escalates` on the three that end at an electrician and
`3.6 / 5.1` on the one whose graded answer is choosing a supply that fits the
chassis rather than diagnosing one that has failed.

### What Core 2 should build here

- ESD: strap, mat, bonding, and why a part that "works, mostly" is the usual
  outcome rather than a dead one.
- Electrical safety: what a technician may and may not touch, and what
  "report it in writing" actually means.
- Environmental: surge suppressor lifetime, battery backup, power management,
  and the disposal rules for a spent UPS battery.
- Equipment handling: lifting, and the safe removal of what has been replaced.
