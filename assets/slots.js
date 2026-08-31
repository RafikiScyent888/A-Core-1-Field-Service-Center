/* =====================================================================
   How many exercises are behind one entry

   One function, because there were two and they disagreed.

   The ticket page filtered a split track with `faultObjective(...) === obj`
   and the route map filtered it with `String(f.objective).indexOf(obj)`, and
   the map told a student that 1.3 held five tickets when the page offered
   thirteen. Both looked reasonable in isolation. A map that confidently
   reports the wrong number is worse than no map, because a student trusts
   it — so the count now has exactly one definition and everything that
   needs it asks here.
   ===================================================================== */
import { dealFaults, TRACKS } from "./ticket.js";
import { faultObjective } from "./syllabus.js";
import { primaryFor } from "./thread.js";
import { drillSlotsFor } from "./drill.js";

/* The deal dedupes by fault key, so its length is the number of distinct
   faults that survive the filter — the same for every seed. That is what
   lets the route map state a total without dealing the student's session. */
export function ticketSlots(seed, track, objective) {
  const keep = objective ? (f) => faultObjective(track, f, primaryFor) === objective : null;
  const dealt = dealFaults(seed || 1, track, keep);
  if (!dealt.length) {
    /* An objective filter that matches nothing would leave a picker with no
       slots at all. Say so rather than quietly offering one. */
    throw new Error('slots: track "' + track + '" has no faults on objective "' +
      objective + '". The filter or the objective tag is wrong.');
  }
  return dealt.length;
}

export function drillSlots(subject) { return drillSlotsFor(subject); }

export { TRACKS };
