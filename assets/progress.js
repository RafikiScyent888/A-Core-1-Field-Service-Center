/* =====================================================================
   Progress memory

   Which items a student has already worked, so that opening a subject with
   seventeen items in it does not mean guessing which five they have seen.

   Three rules this obeys:

   1. IT NEVER LEAVES THE MACHINE. localStorage only — no account, no
      server, no identifier. A student on a shared classroom PC leaves
      nothing behind that another student's browser can read, and nothing
      that reaches me or anybody else.

   2. IT NEVER BLOCKS THE PAGE. Storage throws in a private window, with
      site data blocked, and inside some embedded viewers. Every read and
      write is wrapped, and a failure means the page works exactly as it did
      before this file existed — unmarked, not broken.

   3. WORKED IS NOT THE SAME AS RIGHT. An item counts as done when every
      question in it has been answered, whatever the answers were. Marking
      only perfect runs would hide the items a student most needs to come
      back to, which is the opposite of what a progress mark is for. Whether
      they got it all right is recorded separately, for the student's own
      information.
   ===================================================================== */

const KEY = "fsc_progress_v1";

function readAll() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const v = JSON.parse(raw);
    return (v && typeof v === "object") ? v : {};
  } catch (e) { return {}; }
}

function writeAll(v) {
  try { localStorage.setItem(KEY, JSON.stringify(v)); return true; }
  catch (e) { return false; }
}

/* One key per exercise. The sub-objective is part of it, because a mobile
   ticket on 1.3 and one on 5.4 are different work even on the same track. */
export function exerciseKeyFor(page, name, objective) {
  return page + ":" + name + (objective ? "@" + objective : "");
}

export function progressHas(key, slot) {
  const e = readAll()[key];
  return !!(e && e[String(slot)]);
}

export function progressAllCorrect(key, slot) {
  const e = readAll()[key];
  return !!(e && e[String(slot)] && e[String(slot)].c);
}

/* Record that this slot was worked. `allCorrect` is stored but never gates
   the tick — see rule 3. */
export function progressMark(key, slot, allCorrect) {
  const all = readAll();
  if (!all[key]) all[key] = {};
  const prev = all[key][String(slot)];
  all[key][String(slot)] = { c: !!allCorrect || !!(prev && prev.c) };
  return writeAll(all);
}

export function progressCount(key) {
  const e = readAll()[key];
  return e ? Object.keys(e).length : 0;
}

export function progressCorrectCount(key) {
  const e = readAll()[key];
  if (!e) return 0;
  return Object.keys(e).filter((k) => e[k] && e[k].c).length;
}

/* The lowest slot they have not worked, so "next unseen" can skip past what
   they have already done rather than making them hunt the dropdown. Returns
   null when the whole exercise is finished, which is what lets the button
   say so instead of silently looping back to the top. */
export function nextUnseen(key, total, from) {
  const e = readAll()[key] || {};
  const start = from || 0;
  for (let i = start + 1; i <= total; i++) if (!e[String(i)]) return i;
  for (let i = 1; i <= start; i++) if (!e[String(i)]) return i;
  return null;
}

export function progressClear(key) {
  const all = readAll();
  if (key) delete all[key]; else return writeAll({});
  return writeAll(all);
}

/* Is storage usable at all? The page uses this to decide whether to offer
   progress at all, rather than showing a control that silently does
   nothing. */
export function progressAvailable() {
  try {
    const probe = KEY + "_probe";
    localStorage.setItem(probe, "1");
    localStorage.removeItem(probe);
    return true;
  } catch (e) { return false; }
}
