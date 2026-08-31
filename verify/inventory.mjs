/* =====================================================================
   WHAT THIS BUILD CONTAINS, DERIVED FROM THE BUILD.

   Every check in verify.mjs has to say how much it covered, and that number
   is worthless without something to compare it against. This is that
   something: the inventory, computed from the syllabus and the registries
   rather than written down.

   The reason it exists is a specific and repeated failure. A walker would
   report "500 exercises opened, 0 problems" and look like a pass, when the
   build contained 543 and the walker had quietly stopped following one kind
   of link. Nothing in that output was false and nothing in it was useful,
   because 500 corresponded to nothing. A count with no expectation beside it
   cannot fail, and a check that cannot fail is decoration.
   ===================================================================== */
import { EXERCISES, OBJECTIVES, DOMAINS } from "../assets/syllabus.js";
import { ticketSlots, drillSlots } from "../assets/slots.js";
import { SUBJECTS, DRILL_OBJECTIVES } from "../assets/drill.js";

/* One unit is one exercise set with its own progress key: a drill subject,
   or a ticket track — counted once even where two objectives both point at
   it, which is how the route total came to be overstated by a tenth before
   it was deduped. */
export function units() {
  const out = new Map();
  for (const ex of EXERCISES) {
    if (ex.page === "drill") {
      out.set("drill|" + ex.subject,
        { kind: "drill", key: ex.subject, id: ex.id, slots: drillSlots(ex.subject) });
      continue;
    }
    const objs = ex.split ? (ex.objs || []) : [null];
    for (const o of objs) {
      out.set("ticket|" + ex.track + "|" + (o || ""),
        { kind: "ticket", key: ex.track, id: ex.id, obj: o,
          slots: ticketSlots(1, ex.track, o || null) });
    }
  }
  return out;
}

export function inventory() {
  const u = units();
  let exercises = 0, drillExercises = 0, ticketExercises = 0;
  u.forEach((v) => {
    exercises += v.slots;
    if (v.kind === "drill") drillExercises += v.slots; else ticketExercises += v.slots;
  });
  const drillSubjects = Object.keys(SUBJECTS);
  const objectives = Object.keys(OBJECTIVES);

  /* Everything the registries claim, cross-checked against each other. An
     exercise pointing at a subject that does not exist, or a subject with no
     way in, is a build fault rather than a walker fault, and it is found
     here rather than by a browser failing to render something. */
  const faults = [];
  for (const ex of EXERCISES) {
    if (ex.page === "drill") {
      if (!SUBJECTS[ex.subject]) {
        faults.push('syllabus exercise "' + ex.id + '" names drill subject "' + ex.subject +
          '", which is not in SUBJECTS.');
      }
      if (!DRILL_OBJECTIVES[ex.subject]) {
        faults.push('drill subject "' + ex.subject + '" has no DRILL_OBJECTIVES entry, so its ' +
          "page would render without a title or a pairing.");
      }
    }
    (ex.objs || []).forEach((o) => {
      if (!OBJECTIVES[o] && o !== "5.x" && o !== "1.x") {
        faults.push('exercise "' + ex.id + '" claims objective "' + o + '", which the syllabus ' +
          "does not list.");
      }
    });
  }
  for (const key of drillSubjects) {
    if (key === "mixed") continue;
    if (!EXERCISES.some((e) => e.page === "drill" && e.subject === key)) {
      faults.push('drill subject "' + key + '" has no exercise in the syllabus, so nothing on ' +
        "the picker or the route can reach it.");
    }
    if (!SUBJECTS[key].tag) {
      faults.push('drill subject "' + key + '" has no tag for the caption above the item.');
    }
    if (!SUBJECTS[key].questions) faults.push('drill subject "' + key + '" asks nothing.');
    if (!SUBJECTS[key].pool || !SUBJECTS[key].pool.length) {
      faults.push('drill subject "' + key + '" has an empty pool.');
    }
  }

  return {
    exercises: exercises,
    drillExercises: drillExercises,
    ticketExercises: ticketExercises,
    units: u.size,
    drillSubjects: drillSubjects.length,
    objectives: objectives.length,
    domains: DOMAINS.length,
    faults: faults,
    list: u
  };
}
