/* =====================================================================
   The route through — 1.1 to 5.6

   A picker tells a student what exists. It does not tell them where to
   start, what they have already done, or what is left, and on a build with
   twenty-seven objectives and several hundred exercises behind them that is
   most of the problem. (The exact total is counted below rather than written
   here: every number this file has ever had in prose has gone stale within a
   week of somebody adding a subject.)

   This is the map. Every objective in numbered order, what exercises it,
   how much of it the student has worked, and one button that goes to the
   next thing they have not finished.

   IT RECOMMENDS, IT DOES NOT GATE. Nothing here is locked behind anything
   else. A student sent to this build to revise printers the night before an
   exam should not have to work through mobile devices to reach them, and an
   instructor pulling one objective up on a projector should not have to
   defeat a lock to do it. The order is the order CompTIA numbers them, and
   it is a suggestion.
   ===================================================================== */
import { OBJECTIVES, DOMAINS, EXERCISES } from "./syllabus.js";
import { ticketSlots, drillSlots } from "./slots.js";
import { exerciseKeyFor, progressCount, progressCorrectCount, progressAvailable } from "./progress.js";

const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h !== undefined) n.innerHTML = h; return n; };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/* How many exercises sit behind one entry, and under which key its progress
   is recorded. Both have to agree with the pages themselves or the map will
   confidently report the wrong thing — so both are derived the same way the
   pages derive them, not copied. */
function unitFor(ex, obj) {
  if (ex.page === "drill") {
    return { key: exerciseKeyFor("drill", ex.subject), total: drillSlots(ex.subject),
      href: "drill.html?ex=" + encodeURIComponent(ex.id), kind: "Drill" };
  }
  /* A split track is two different exercise sets on one track — mobile is
     1.3 or 5.4, cloud is 4.1 or 4.2 — and the ticket page keys its progress
     by the sub-objective when it has one. Link WITH the objective so the key
     the map reads is the key the page writes. */
  const split = ex.split && obj;
  return {
    key: exerciseKeyFor("ticket", ex.track, split ? obj : null),
    total: ticketSlots(1, ex.track, split ? obj : null),
    href: "index.html?ex=" + encodeURIComponent(ex.id) + (split ? "&obj=" + encodeURIComponent(obj) : ""),
    kind: "Tickets"
  };
}

/* Objectives in the order they are numbered, each with whatever exercises
   it. Built from the syllabus rather than listed here, so an exercise added
   later appears on the route without anybody remembering to add it. */
function route() {
  const byObj = {};
  EXERCISES.forEach((ex) => {
    (ex.objs || []).forEach((o) => { (byObj[o] = byObj[o] || []).push(ex); });
  });
  return Object.keys(OBJECTIVES)
    .sort((a, b) => {
      const [ad, an] = a.split(".").map(Number), [bd, bn] = b.split(".").map(Number);
      return ad - bd || an - bn;
    })
    .map((o) => ({ obj: o, title: OBJECTIVES[o], exercises: byObj[o] || [] }));
}

const ROUTE = route();
const HAS_STORE = progressAvailable();

/* One row's state. `worked` counts exercises started, not answers right —
   the same rule the tick in the pickers obeys, and for the same reason. */
function stateOf(step) {
  let worked = 0, total = 0, correct = 0;
  step.exercises.forEach((ex) => {
    const u = unitFor(ex, step.obj);
    total += u.total;
    worked += Math.min(progressCount(u.key), u.total);
    correct += Math.min(progressCorrectCount(u.key), u.total);
  });
  return { worked, total, correct,
    done: total > 0 && worked >= total,
    started: worked > 0 };
}

function render() {
  const host = document.getElementById("route");
  host.innerHTML = "";
  let firstUnfinished = null;
  /* Counted by DISTINCT unit, not by row. Several tracks serve two
     objectives — cabling is 3.2 and 5.5, the printer tracks are 3.8 and 5.6
     — so summing the rows counted those twice and announced about a tenth
     more exercises than exist. Each row still shows what ITS objective exercises,
     which is the useful number there; only the grand total dedupes. */
  const seenUnits = new Map();

  DOMAINS.forEach((d) => {
    const steps = ROUTE.filter((s) => s.obj.split(".")[0] === d.key);
    if (!steps.length) return;
    const sec = el("section", "domain");
    sec.appendChild(el("h2", "domain__h", esc(d.label)));
    const list = el("ol", "steps");

    steps.forEach((step) => {
      const st = stateOf(step);
      step.exercises.forEach((ex) => {
        const u = unitFor(ex, step.obj);
        if (!seenUnits.has(u.key)) {
          seenUnits.set(u.key, { total: u.total, worked: Math.min(progressCount(u.key), u.total) });
        }
      });
      if (!st.done && !firstUnfinished) firstUnfinished = step;

      const li = el("li", "step-row" + (st.done ? " step-row--done" : st.started ? " step-row--part" : ""));
      const head = el("div", "step-row__head");
      head.appendChild(el("span", "step-row__num", esc(step.obj)));
      head.appendChild(el("span", "step-row__title", esc(step.title)));
      /* A word, not just a colour — a state carried by hue alone says
         nothing to a student who cannot separate it from the row. */
      if (HAS_STORE) {
        head.appendChild(el("span", "step-row__state",
          st.done ? "Finished" : st.started ? "In progress" : "Not started"));
      }
      li.appendChild(head);

      const links = el("div", "step-row__links");
      step.exercises.forEach((ex) => {
        const u = unitFor(ex, step.obj);
        const a = el("a", "step-link");
        a.href = u.href;
        a.innerHTML = '<b>' + esc(ex.label) + '</b>' +
          '<span class="step-link__meta">' + esc(u.kind) + " · " + u.total + " to work" +
          (HAS_STORE ? " · " + Math.min(progressCount(u.key), u.total) + " done" : "") + "</span>";
        links.appendChild(a);
      });
      if (!step.exercises.length) {
        links.appendChild(el("p", "step-row__none",
          "Nothing exercises this objective yet."));
      }
      li.appendChild(links);

      if (HAS_STORE && st.total) {
        const bar = el("div", "bar");
        const fill = el("i", "bar__fill");
        fill.style.width = Math.round((st.worked / st.total) * 100) + "%";
        bar.appendChild(fill);
        bar.setAttribute("role", "img");
        bar.setAttribute("aria-label", st.worked + " of " + st.total + " worked");
        li.appendChild(bar);
        li.appendChild(el("p", "step-row__count",
          st.worked + " of " + st.total + " worked" +
          (st.correct ? " · " + st.correct + " with everything right" : "")));
      }
      list.appendChild(li);
    });
    sec.appendChild(list);
    host.appendChild(sec);
  });

  /* THE END OF THE ROUTE.

     One exercise deliberately belongs to no single objective: the mixed
     track, where the domain is not given and finding it is the exercise.
     It was falling off the map entirely — the route's total came up short by
     exactly that track, and a student working down it would never have met it. It goes last,
     because it only makes sense once the numbered objectives are familiar. */
  const loose = EXERCISES.filter((ex) => !(ex.objs || []).some((o) => OBJECTIVES[o]));
  if (loose.length) {
    const sec = el("section", "domain");
    sec.appendChild(el("h2", "domain__h", "After the objectives"));
    sec.appendChild(el("p", "pathnote",
      "This one is not tied to a numbered objective, because not being told which " +
      "domain you are in is the exercise. Work it once the rest are familiar \u2014 on a " +
      "real call nobody tells you either."));
    const list = el("ol", "steps");
    loose.forEach((ex) => {
      const u = unitFor(ex, null);
      if (!seenUnits.has(u.key)) {
        seenUnits.set(u.key, { total: u.total, worked: Math.min(progressCount(u.key), u.total) });
      }
      const done = Math.min(progressCount(u.key), u.total);
      const li = el("li", "step-row" + (done >= u.total ? " step-row--done" : done ? " step-row--part" : ""));
      const head = el("div", "step-row__head");
      head.appendChild(el("span", "step-row__num", "5.x"));
      head.appendChild(el("span", "step-row__title", esc(ex.label)));
      if (HAS_STORE) {
        head.appendChild(el("span", "step-row__state",
          done >= u.total ? "Finished" : done ? "In progress" : "Not started"));
      }
      li.appendChild(head);
      const links = el("div", "step-row__links");
      const a = el("a", "step-link");
      a.href = u.href;
      a.innerHTML = "<b>" + esc(ex.label) + "</b><span class=\"step-link__meta\">" +
        esc(u.kind) + " \u00b7 " + u.total + " to work" +
        (HAS_STORE ? " \u00b7 " + done + " done" : "") + "</span>";
      links.appendChild(a);
      li.appendChild(links);
      list.appendChild(li);
    });
    sec.appendChild(list);
    host.appendChild(sec);
  }

  const overall = document.getElementById("overall");
  if (!HAS_STORE) {
    overall.textContent = "This browser is not letting the page remember anything — a private " +
      "window, or site data switched off. Everything still works; nothing will be marked.";
  } else {
    let gw = 0, gt = 0;
    seenUnits.forEach((v) => { gw += v.worked; gt += v.total; });
    overall.innerHTML = "<b>" + gw + "</b> of <b>" + gt +
      "</b> exercises worked \u2014 every numbered objective, and the mixed track after them.";
  }

  const btn = document.getElementById("continueBtn");
  if (!firstUnfinished) {
    btn.textContent = "Every objective finished";
    btn.disabled = true;
  } else {
    const ex = firstUnfinished.exercises[0];
    if (!ex) { btn.disabled = true; btn.textContent = "Nothing to continue"; return; }
    btn.textContent = "Continue: " + firstUnfinished.obj + " — " + ex.label;
    btn.addEventListener("click", () => { location.href = unitFor(ex, firstUnfinished.obj).href; });
  }
}

render();

/* Theme, same contract as the other two pages. */
(function () {
  const root = document.documentElement, btn = document.getElementById("themeBtn");
  const KEY = "fsc-theme";
  const sys = () => (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  function apply(t) {
    root.setAttribute("data-theme", t);
    btn.textContent = t === "dark" ? "Light" : "Dark";
    btn.setAttribute("aria-pressed", t === "dark" ? "true" : "false");
    try { localStorage.setItem(KEY, t); } catch (e) { /* storage unavailable */ }
  }
  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) { /* storage unavailable */ }
  apply(saved === "light" || saved === "dark" ? saved : (root.getAttribute("data-theme") || sys()));
  btn.addEventListener("click", () => apply(root.getAttribute("data-theme") === "light" ? "dark" : "light"));
})();
