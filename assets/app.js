/* =====================================================================
   Field Service Center — page wiring

   Six steps of CompTIA's troubleshooting methodology, gated in order,
   worked against one generated ticket. Every graded answer is a function
   of the ticket object, never a literal written beside the rows.

   The gating is not decoration. You cannot establish a theory before you
   have identified the problem, and you cannot order parts before you have
   tested the theory. That is the discipline the exam asks for and the
   habit the job requires, and a page that lets a student jump to the fix
   and back-fill the reasoning teaches the opposite.
   ===================================================================== */
import { buildTicket, mulberry32, STEPS, TIERS, URGENCY, SHIPPING, DISTORTIONS,
  TRACKS, dayName, dealFaults } from "./ticket.js";
import { postReport, smartRows, eventRows, thermalRows, changeRows,
  callerClaims, benchTests, firstOccurrence,
  ipconfigRows, knownGoodRows, linkRows, arpRows, netBenchTests,
  deviceRows, mobileNetRows, inspectionRows, mobBenchTests,
  printerStatus, printerEvents, defectReport, defectMarks, nozzleRows, printerBenchTests,
  hostRows, guestRows, datastoreRows, cloudServiceRows, cloudBenchTests } from "./instruments.js";
import { connectivity, ACTIONS, actionWhy, correctAction, NETWORK_FAULTS } from "./network.js";
import { MOBILE_FAULTS, OUTCOMES, outcomeWhy, repairCost } from "./mobile.js";
import { CLOUD_FAULTS, CLOUD_ACTIONS, checkAllocation, cloudActionWhy } from "./cloud.js";
import { MIXED_FAULTS, MIXED_ACTIONS, DOMAINS, mixedActionWhy } from "./mixed.js";
import { hardwareModel, mobileModel, networkModel, laserModel, inkjetModel,
  laptopModel, displayModel, cablingModel, powerModel, raidModel, printnetModel,
  locateTarget, locateWhy, locateChoices } from "./models.js";
import { hostModel } from "./cloudmodel.js";
import { photoFor } from "./photos.js";
import { mountPicker } from "./picker.js";
import { faultObjective } from "./syllabus.js";
import { threadFor, objectivesOn, OBJECTIVES, primaryFor } from "./thread.js";
import { noArticle } from "./ticket.js";
import { LAPTOP_PARTS, LAPTOP_ACTIONS, laptopActionByKey, laptopProcedureWhy,
  laptopTests } from "./laptop.js";
import { DISPLAY_PARTS, DISPLAY_FAULTS, displayTests, PIXEL_FACTS } from "./display.js";
import { CABLE_PARTS, PAIR_COLOURS, testerRows, certRows, toolsFor, conductorPool,
  correctOrder, siteStandard, PINOUT_FACTS, pairColour } from "./cabling.js";
import * as PNETMOD from "./printnet.js";
/* deviceRows already means something else on this page — the mobile track's
   handset panel — so the printer-network panels come in under their own
   names rather than shadowing it. */
import { PRINTNET_ACTIONS, printnetActionWhy, printnetTests,
  deviceRows as pnetDeviceRows, stationRows as pnetStationRows,
  serverRows as pnetServerRows, scanRows as pnetScanRows,
  LINK_OPTIONS, linkWhy, DEPLOY_FIELDS, correctDeploy, deployWhy,
  PRINTNET_FACTS } from "./printnet.js";
import * as RAIDMOD from "./raid.js";
import { RAID_FIXED_PARTS, RAID_ACTIONS, raidActionWhy, raidTests, arrayRows, diskRows,
  controllerRows, backupRows, CLASS_OPTIONS, classWhy, TOLERANCE_CHOICES, toleranceAnswer,
  usableCapacity, remainingTolerance, LEVELS, RAID_FACTS } from "./raid.js";
import { POWER_PARTS, POWER_ACTIONS, powerActionByKey, powerProcedureWhy, powerTests,
  railRows, outletRows, upsRows, circuitRows, circuitTotals, mainsRows,
  SCOPE_OPTIONS, scopeWhy, POWER_FACTS } from "./power.js";
import { questionHints, CONTROL_HINTS, lookTarget, LOOK_LABEL } from "./hints.js";
import { ticketSlots } from "./slots.js";
import { exerciseKeyFor, progressHas, progressMark, progressCount, nextUnseen,
  progressClear, progressAvailable } from "./progress.js";
import { actionsFor, actionByKey, procedureWhy, partsFor, methodChoices, methodWhy,
  CLEAN_METHODS, circumferenceRows, LASER_STAGES } from "./printer.js";

const PIN = "3693";
const PRINTER_TRACKS = ["laser", "inkjet"];
/* HOW MANY TICKETS A STUDENT CAN ACTUALLY REACH.

   This was a flat 5 against tracks holding fifteen to twenty-two faults, so
   most of what is built here could not be opened: 214 ticket scenarios
   exist and 65 were reachable. `dealFaults` already returns one ticket per
   fault key, so the deal was never the limit — this constant was.

   It now follows the deal. Reading the length of what was actually dealt,
   rather than the length of the fault list, means a track that filters by
   sub-objective (mobile is 1.3 or 5.4, cloud is 4.1 or 4.2) offers exactly
   the tickets that survived the filter and never a slot with nothing
   behind it. */
function slotsFor(tr, obj) {
  /* One definition, in slots.js, because there were two and they disagreed:
     the route map reported five tickets on an objective the page offered
     thirteen of. */
  return ticketSlots(sessionSeed, tr, obj);
}
let SLOTS = 5;

let sessionSeed = Math.floor(Math.random() * 100000) + 1;
let track = "hardware";
/* Set when the student picked a sub-objective on a track that carries two
   of them — a mobile ticket is 1.3 or 5.4, a cloud ticket 4.1 or 4.2 — so
   the deal only offers faults on the objective they asked for. Null means
   the whole track. */
let objective = null;
let slot = 1;
let G = null;
let instructor = false;
const graded = {};
let allQs = [];
let stepDone = {};

const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h !== undefined) n.innerHTML = h; return n; };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const norm = (s) => String(s).trim().toLowerCase().replace(/\s+/g, " ");
const money = (n) => "$" + n.toLocaleString();

/* Questions whose correct answer is the same string on every ticket sit at
   option one in all five unless they are shuffled. Deterministic off the
   ticket, so the position moves per ticket and holds still while a student
   works. */
function ordShuffle(key, arr) {
  let h = (2166136261 ^ G.slot ^ (sessionSeed << 5)) >>> 0;
  for (let i = 0; i < key.length; i++) { h ^= key.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  const rng = mulberry32(h);
  const x = arr.slice();
  for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); const t = x[i]; x[i] = x[j]; x[j] = t; }
  return x;
}

function table(cols, rows, cell) {
  const w = el("div", "logwrap");
  const t = el("table", "log");
  t.innerHTML = "<thead><tr>" + cols.map((c) => `<th>${esc(c)}</th>`).join("") + "</tr></thead>";
  const tb = el("tbody");
  rows.forEach((r) => {
    const tr = el("tr");
    if (r._bad) tr.setAttribute("data-bad", "1");
    tr.innerHTML = cell(r);
    tb.appendChild(tr);
  });
  t.appendChild(tb); w.appendChild(t);
  const out = el("div");
  out.appendChild(w);
  const cap = el("p", "logcount", `${rows.length} entries`);
  out.appendChild(cap);
  requestAnimationFrame(() => {
    if (w.scrollHeight > w.clientHeight + 2) cap.innerHTML = `${rows.length} entries &mdash; scroll for the rest`;
  });
  return out;
}

/* =====================================================================
   Guided hints

   Silent for the first two wrong answers — a student one guess away should
   get there on their own, and a page that helps the moment somebody is
   wrong teaches them to guess and wait for it.

   From the third, one nudge per attempt, escalating. None of them is ever
   the answer.
   ===================================================================== */
/* Everything currently marked, so a second question's highlight does not
   leave the first one's glowing behind it. */
let litNodes = [];
function clearHighlight() {
  litNodes.forEach((n) => { n.classList.remove("lit"); n.removeAttribute("data-lit"); });
  litNodes = [];
}

/* WHAT TO LOOK AT, once the hints are spent.

   The rule this obeys: mark where the answer LIVES, never which option it
   is. Marking the readings is the same instruction the hint text already
   gave, made impossible to miss; marking the control is so a student who
   has scrolled away knows where to come back to. Neither narrows the
   choices, so a student still has to make the call.

   `card` is the question's own control, always marked. `where` comes from
   the question id, so it cannot drift from what the hints say. */
function highlight(card, where) {
  clearHighlight();
  const step = card.closest(".step");
  let marks = [];
  if (where === "instruments" && step) marks = [...step.querySelectorAll(".panel")];
  else if (where === "brief" && step) marks = [...step.querySelectorAll(".quote")];
  marks.forEach((n, i) => {
    n.classList.add("lit");
    /* A number, not just a glow: colour alone would say nothing to a student
       who cannot see it, and "look here" is useless if several things glow
       and none of them says why. */
    n.setAttribute("data-lit", marks.length > 1 ? "Look here " + (i + 1) + " of " + marks.length : "Look here");
    litNodes.push(n);
  });
  card.classList.add("lit");
  card.setAttribute("data-lit", "Change this");
  litNodes.push(card);
  return marks.length;
}

/* Twenty of the graded controls on this page are not ordinary questions —
   bench tests, the locate grid, the procedure builder — and they call this
   with no options at all. Defaulting from `host` rather than requiring each
   of them to be wired means they get the highlight and the reset for free,
   and cannot silently fall out of the feature later when a new control is
   added. Anything that needs different behaviour still passes it. */
function hintBox(host, opts) {
  opts = opts || {};
  if (!opts.onLight) opts.onLight = (w) => highlight(host, w);
  if (!opts.onReset) opts.onReset = () => {
    const fields = host.querySelectorAll("input, select");
    fields.forEach((f) => {
      if (f.type === "checkbox" || f.type === "radio") f.checked = false;
      else f.value = "";
    });
    host.querySelectorAll(".fb").forEach((f) => {
      f.style.display = "none"; f.innerHTML = ""; f.className = "fb";
    });
    if (fields[0]) fields[0].focus();
  };
  const box = el("div", "hint");
  box.hidden = true;
  box.setAttribute("role", "status");
  box.setAttribute("aria-live", "polite");
  host.appendChild(box);
  let wrong = 0;
  const wipe = () => {
    wrong = 0; box.hidden = true; box.innerHTML = "";
    if (opts.onFourth) opts.onFourth(false);
  };
  return {
    right: () => { wipe(); clearHighlight(); },
    wrong: (list) => {
      wrong++;
      /* On the fourth, mark it on the machine as well as in words. Three
         wrong guesses is where the written hints start; a student still
         wrong after the fourth has read a hint and not been able to turn it
         into a part, which is a different problem from not knowing, and
         more words will not fix it. */
      if (wrong === 4 && opts.onFourth) opts.onFourth(true);
      if (wrong < 3 || !list || !list.length) return;
      const i = Math.min(wrong - 3, list.length - 1);
      const last = i === list.length - 1;
      box.hidden = false;
      box.innerHTML = '<b class="hint__n">Hint ' + (i + 1) + " of " + list.length + "</b>" +
        '<span class="hint__t">' + esc(list[i]) + "</span>";
      if (!last) return;

      /* The hints are spent. Show them where to look, and give them a clean
         field to try it in — because the commonest reason a stuck student
         stays stuck is that their own wrong pick is still sitting in the box
         they are staring at. */
      const where = opts.where || "instruments";
      const marked = opts.onLight ? opts.onLight(where) : 0;
      box.appendChild(el("span", "hint__t hint__t--last",
        (where === "none" || !marked) ? LOOK_LABEL.none : LOOK_LABEL[where]));
      if (opts.onReset) {
        const again = el("button", "btn btn--again", "Clear my answer and try again");
        again.type = "button";
        again.addEventListener("click", () => {
          opts.onReset();
          /* The hints stay. They were earned, and wiping them would send a
             student who is finally reading the right panel back to a blank
             card. The wrong-count stays too, so nobody can farm a fresh
             ladder by failing on purpose. */
          again.disabled = true;
          again.textContent = "Cleared \u2014 your turn";
        });
        box.appendChild(again);
      }
    },
    reset: () => { wipe(); clearHighlight(); },
    /* How many wrong so far. The locate step needs it because a student can
       reach the bench with the outline already earned — going back a step
       and forward again must not take the help away. */
    wrongCount: () => wrong
  };
}

/* ---------------- questions ---------------- */
function renderQuestions(host, qs) {
  const box = el("div", "qs");
  qs.forEach((q) => {
    const card = el("div", "q");
    card.appendChild(el("p", "q__ask", q.ask));
    if (q.note) card.appendChild(el("p", "q__note", esc(q.note)));
    const row = el("div", "q__row");
    let input;
    if (q.kind === "choice") {
      const opts = q.shuffle ? ordShuffle(q.id, q.choices()) : q.choices();
      /* A NATIVE SELECT CANNOT SHOW A SENTENCE.

         Nearly every choice on this page is a full statement — the evidence
         options run to a hundred and forty characters. A select sizes its
         popup to the longest option and the browser then clips that at the
         window edge, so the end of every line is simply gone; the closed
         control truncates mid-word with no ellipsis. Both were happening at
         once, and on a build whose students were chosen partly because
         reading is hard for them, an unreadable control is not a cosmetic
         fault.

         Options that fit stay a select, because a radio list for five short
         answers is three screens of scrolling for nothing. Anything longer
         becomes a radio list, which wraps, which is fully readable at any
         width, and which a screen reader announces one option at a time.

         The group exposes `value` and `focus()` so every caller — the
         checker, the hint reset, the keyboard handler — is unchanged. */
      const LONG = 60;
      if (opts.some((c) => String(c).length > LONG)) {
        input = el("div", "ans ans--list");
        input.setAttribute("role", "radiogroup");
        input.setAttribute("aria-label", String(q.ask).replace(/<[^>]+>/g, ""));
        opts.forEach((c, i) => {
          const id = "opt-" + q.id + "-" + i;
          const lab = el("label", "opt");
          const rad = el("input"); rad.type = "radio"; rad.name = "r-" + q.id;
          rad.value = String(c); rad.id = id;
          const txt = el("span", "opt__t", esc(c));
          lab.appendChild(rad); lab.appendChild(txt);
          input.appendChild(lab);
        });
        Object.defineProperty(input, "value", {
          get() {
            const on = input.querySelector("input:checked");
            return on ? on.value : "";
          },
          set(v) {
            input.querySelectorAll("input").forEach((r) => {
              r.checked = String(v) !== "" && r.value === String(v);
            });
          }
        });
        input.focus = function () {
          const first = input.querySelector("input");
          if (first) first.focus();
        };
      } else {
        input = el("select", "ans");
        input.innerHTML = '<option value="">— select —</option>' +
          opts.map((c) => `<option value="${esc(c)}">${esc(c)}</option>`).join("");
      }
    } else {
      input = el("input"); input.type = "text";
      input.setAttribute("aria-label", String(q.ask).replace(/<[^>]+>/g, ""));
      if (q.placeholder) input.placeholder = q.placeholder;
    }
    const btn = el("button", "btn", "Check"); btn.type = "button";
    row.appendChild(input); row.appendChild(btn); card.appendChild(row);
    const fb = el("p", "fb"); fb.style.display = "none"; card.appendChild(fb);
    const hints = hintBox(card, {
      where: lookTarget(q.id),
      onLight: (w) => highlight(card, w),
      onReset: () => {
        /* Clears the attempt, not the progress. The feedback goes with the
           pick that produced it — leaving "Not yet" above an empty box reads
           as a verdict on nothing. */
        input.value = "";
        fb.style.display = "none"; fb.innerHTML = ""; fb.className = "fb";
        input.focus();
      }
    });

    function check() {
      const val = input.value;
      if (!norm(val)) return;
      const ok = q.accept ? q.accept(val) : norm(val) === norm(q.answer());
      graded[q.id] = ok;
      if (q._answered) q._answered();
      fb.style.display = "";
      fb.className = "fb " + (ok ? "fb--ok" : "fb--no");
      fb.innerHTML = (ok ? "Correct" : "Not yet") + '<span class="fb__why">' + esc(q.why()) + "</span>";
      if (ok) hints.right();
      else hints.wrong(q.hints ? q.hints() : questionHints(q.id, G.track, G.fault));
      updateScore();
    }
    btn.addEventListener("click", check);
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); check(); } });

    let revealed = false, beneath = null;
    q._reveal = () => {
      if (!revealed) beneath = { html: fb.innerHTML, cls: fb.className, disp: fb.style.display };
      revealed = true;
      fb.style.display = ""; fb.className = "fb fb--ok";
      fb.innerHTML = "Answer: " + esc(q.answer()) + '<span class="fb__why">' + esc(q.why()) + "</span>";
    };
    q._unreveal = () => {
      if (!revealed) return;
      revealed = false;
      fb.innerHTML = beneath ? beneath.html : "";
      fb.className = beneath ? beneath.cls : "fb";
      fb.style.display = beneath ? beneath.disp : "none";
      beneath = null;
    };
    q._answered = () => { revealed = false; beneath = null; };
    box.appendChild(card);
  });
  host.appendChild(box);
  return qs;
}

/* Which exercise this is, for the progress store. The sub-objective is part
   of the key: a mobile ticket on 1.3 and one on 5.4 are different work. */
function exerciseKey() { return exerciseKeyFor("ticket", track, objective); }

function updateScore() {
  const done = Object.keys(graded).length;
  const right = Object.keys(graded).filter((k) => graded[k]).length;
  /* Worked, not necessarily right — see the note in progress.js. A student
     who struggled through a ticket has still seen it, and hiding the mark
     until they are perfect would send them back over the ones they already
     understand. */
  if (allQs.length && done >= allQs.length) {
    progressMark(exerciseKey(), slot, right === allQs.length);
    markSlotDone(slot);
  }
  const seen = progressCount(exerciseKey());
  document.getElementById("scorebar").innerHTML =
    `<span>Answered <b>${done}</b> of <b>${allQs.length}</b></span>` +
    `<span>Correct <b>${right}</b></span>` +
    `<span>Accuracy <b>${done ? Math.round((right / done) * 100) : 0}%</b></span>` +
    `<span>Ticket <b>${slot}</b> of ${SLOTS}</span>` +
    (progressAvailable() ? `<span>Worked <b>${seen}</b> of ${SLOTS} on this track</span>` : "");
  applyGates();
}

/* Update the one option rather than rebuilding the list, so the dropdown
   does not close under the student mid-ticket. */
function markSlotDone(n) {
  const sel = document.getElementById("slotSelect");
  if (!sel) return;
  const o = sel.querySelector(`option[value="${n}"]`);
  if (o && o.textContent.indexOf("\u2713") === -1) o.textContent = "Ticket " + n + "  \u2713 done";
}

/* ---------------- hold-to-read key ---------------- */
function holdKey(labelText, entries) {
  const wrap = el("div");
  const btn = el("button", "btn btn--peek", labelText);
  btn.type = "button";
  btn.setAttribute("aria-expanded", "false");
  const panel = el("div", "gloss");
  panel.hidden = true;
  panel.innerHTML = entries.map(([k, v]) => `<div><b>${esc(k)}</b><span>${esc(v)}</span></div>`).join("");
  btn.setAttribute("aria-controls", panel.id = "key-" + Math.random().toString(36).slice(2, 8));
  let held = false;
  const show = (e) => { if (e) e.preventDefault(); held = true; panel.hidden = false; btn.setAttribute("aria-expanded", "true"); };
  const hide = () => { if (!held) return; held = false; panel.hidden = true; btn.setAttribute("aria-expanded", "false"); };
  btn.addEventListener("mousedown", show);
  btn.addEventListener("touchstart", show, { passive: false });
  ["mouseup", "mouseleave", "touchend", "touchcancel", "blur"].forEach((ev) => btn.addEventListener(ev, hide));
  btn.addEventListener("keydown", (e) => { if ((e.key === " " || e.key === "Enter") && !held) show(e); });
  btn.addEventListener("keyup", (e) => { if (e.key === " " || e.key === "Enter") hide(); });
  wrap.appendChild(btn); wrap.appendChild(panel);
  return wrap;
}

/* ---------------- the objective thread ----------------
   Which objective this step is actually exercising, and why. Rendered on
   every step of a track that has been mapped to the book, so a student sees
   the connective tissue while they are in it rather than as a list
   afterwards. It never names the fault, the reading or the part \u2014 a
   student who reads all of it still has the whole ticket to do. */
/* Every track's home objective, in the book's numbering. Two of them carry
   more than one and `primaryFor` narrows those per fault: a mobile ticket is
   1.3 or 5.4, a cloud ticket 4.1 or 4.2. The value here is the fallback for
   everything else on the track.

   This used to list two tracks. Eleven of the thirteen therefore rendered no
   objective band at all, which meant a student could work a RAID array or a
   fuser end to end without the page once saying which objective they were
   in. */
const TRACK_PRIMARY = {
  laptop: "1.1", mobile: "1.3",
  hardware: "5.1", power: "5.1",
  raid: "5.2", display: "5.3",
  network: "5.5", cabling: "5.5",
  laser: "5.6", inkjet: "5.6", printnet: "5.6",
  cloud: "4.1",
  mixed: "5.x"
};

function objectiveBand(stepKey) {
  const fallback = TRACK_PRIMARY[G.track];
  if (!fallback) return null;
  /* The mobile track sits on two objectives and which one a ticket belongs to
     is a property of the fault, not of the track. */
  const primary = primaryFor(G.fault, fallback);
  const t = threadFor(G.fault, stepKey, primary);
  if (!t) return null;

  const box = el("div", "objband");
  const head = el("p", "objband__head");
  head.innerHTML = '<span class="objband__no">' + esc(t.primary) + "</span>" +
    '<span class="objband__title">' + esc(t.primaryTitle) + "</span>";
  box.appendChild(head);
  box.appendChild(el("p", "objband__line", esc(t.line)));

  if (t.crosses.length) {
    const pend = el("p", "objband__pending",
      t.crosses.length === 1
        ? "This step also reaches into objective " + esc(t.crosses[0].obj) +
          ". That comes up once the step opens \u2014 it is a look back at what you did, not a hint."
        : "This step also reaches into objectives " +
          esc(t.crosses.map((c) => c.obj).join(" and ")) +
          ". Those come up once the step opens \u2014 they are a look back at what you did, not a hint.");
    box.appendChild(pend);
  }
  t.crosses.forEach((c) => {
    const x = el("div", "objband__cross");
    x.innerHTML = '<p class="objband__head"><span class="objband__no objband__no--x">' +
      esc(c.obj) + '</span><span class="objband__title">' + esc(c.title) + "</span></p>" +
      '<p class="objband__line">' + esc(c.line) + "</p>" +
      '<p class="objband__fwd"><strong>Where this goes next.</strong> ' + esc(c.forward) + "</p>";
    box.appendChild(x);
  });
  return box;
}

/* ---------------- step shell ---------------- */
const HUES = ["crimson", "cyan", "amber", "green", "violet", "blue"];
function step(i) {
  const s = STEPS[i];
  const sec = el("section", "step");
  sec.setAttribute("data-hue", HUES[i]);
  sec.setAttribute("data-step", s.key);
  const h = el("div", "step__head");
  h.appendChild(el("span", "step__n", String(s.n)));
  h.appendChild(el("h2", null, esc(s.name)));
  const st = el("span", "step__state", "");
  h.appendChild(st);
  sec.appendChild(h);
  const b = el("div", "step__body");
  b.appendChild(el("p", "step__hint", esc(s.hint)));
  const band = objectiveBand(s.key);
  if (band) b.appendChild(band);
  const lock = el("div", "lockbox");
  b.appendChild(lock);
  const work = el("div", "step__work");
  b.appendChild(work);
  sec.appendChild(b);
  return { section: sec, body: work, lock: lock, state: st, key: s.key };
}

/* =====================================================================
   Step 1 — Identify the problem
   ===================================================================== */
function stepIdentify() {
  const t = step(0);
  const claims = callerClaims(G);

  t.body.appendChild(el("p", "count",
    `${esc(G.org.name)} · ${esc(G.tier.label)}, ${esc(G.tier.staff)} · ${esc(G.org.site)}` +
    ` · asset ${esc(G.asset.tag)} · ${esc(G.urgency.label)} — ${esc(G.urgencyWhy)}`));

  const ar = el("div", "panel");
  ar.appendChild(el("h3", null, "Asset register"));
  const adl = el("dl", "kv");
  [["Asset", G.assetRecord.tag], ["Age", G.assetRecord.age],
  ["Last service", G.assetRecord.lastService], ["Prior tickets", G.assetRecord.prior]].forEach(([k, v]) => {
    adl.appendChild(el("dt", null, esc(k)));
    adl.appendChild(el("dd", null, esc(v)));
  });
  ar.appendChild(adl);
  t.body.appendChild(ar);

  const q = el("div", "quote");
  q.innerHTML = "&ldquo;" + esc(G.report.quote) + "&rdquo;" +
    `<b>${esc(G.caller.name)} — ${esc(G.caller.title)}, ${esc(G.caller.dept)}</b>`;
  t.body.appendChild(q);

  t.body.appendChild(el("p", "step__hint",
    "<strong>Work the call, not the caller.</strong> Some of this holds up and some of it does not. " +
    "Mark each statement against what you can actually establish &mdash; and if nothing on this page settles it, say so. " +
    "Guessing is what got the caller here."));

  const box = el("div", "claims");
  claims.forEach((c, i) => {
    const card = el("div", "claim");
    card.setAttribute("data-verdict", "Answer: " + c.verdict + " — " + c.source);
    card.appendChild(el("p", "claim__text", esc(c.text)));
    const opts = el("div", "claim__opts");
    [["confirmed", "Confirmed"], ["contradicted", "Contradicted"], ["unknown", "Can't tell from here"]]
      .forEach(([v, lbl]) => {
        const id = "cl" + i + v;
        const l = el("label");
        l.innerHTML = `<input type="radio" name="claim${i}" value="${v}" id="${id}"><span>${lbl}</span>`;
        opts.appendChild(l);
      });
    card.appendChild(opts);
    box.appendChild(card);
  });
  t.body.appendChild(box);

  const chk = el("button", "btn", "Check the call"); chk.type = "button";
  chk.style.marginTop = ".7rem";
  const fb = el("p", "fb"); fb.style.display = "none";
  chk.addEventListener("click", () => {
    const picks = claims.map((c, i) => {
      const sel = box.querySelector(`input[name="claim${i}"]:checked`);
      return sel ? sel.value : null;
    });
    if (picks.some((p) => p === null)) {
      fb.style.display = ""; fb.className = "fb fb--no";
      fb.innerHTML = "Not yet" + '<span class="fb__why">Mark every statement before checking. Leaving one blank is not the same as saying you cannot tell.</span>';
      return;
    }
    const wrong = claims.map((c, i) => picks[i] === c.verdict ? null : c).filter(Boolean);
    const ok = wrong.length === 0;
    graded["identify-claims"] = ok;
    fb.style.display = "";
    fb.className = "fb " + (ok ? "fb--ok" : "fb--no");
    fb.innerHTML = (ok ? "Correct" : "Not yet") + '<span class="fb__why">' + esc(
      (ok ? "" : "Not right yet: " + wrong.map((c) => "“" + c.text + "” is " + c.verdict + ". " + c.why).join("  ") + "  ") +
      G.report.distortion.label + " — " + G.report.distortion.lesson) + "</span>";
    updateScore();
  });
  t.body.appendChild(chk); t.body.appendChild(fb);

  const qs = [
    {
      id: "identify-symptom", kind: "choice", shuffle: true,
      ask: "Strip the call back. What is the <em>symptom</em> — the thing that was actually observed?",
      choices: () => [
        G.fault.observable,
        /* Same article problem as the caller's quote: the sentence supplies
           "A failed", so the phrase must not bring its own. */
        "A failed " + noArticle(G.fault.wrongReflex.replace("gpu", "graphics card")
          .replace("cpu", "processor")),
        "An old machine that needs replacing",
        "Something the user did"
      ],
      answer: () => G.fault.observable,
      why: () => "A symptom is what the machine does. The others are conclusions, blame, or a budget conversation — none of them are evidence, and all three get reached for on real calls."
    },
    {
      id: "identify-backup", kind: "choice", shuffle: true,
      ask: "Before you touch anything, what does the methodology require?",
      choices: () => [
        "Back up the user's data, or confirm a current backup exists",
        "Restart the machine and see if it clears",
        "Order the replacement part so it arrives sooner",
        "Reinstall the operating system to rule out software"
      ],
      answer: () => "Back up the user's data, or confirm a current backup exists",
      why: () => "Step one ends with backing up before making changes. On this ticket that matters" +
        (G.fault.key === "drive" ? " more than usual — the drive is failing, and every hour it stays powered is a risk to data you have not copied yet." : ", because every step after this one can lose data if it goes wrong.")
    }
  ];
  allQs = allQs.concat(renderQuestions(t.body, qs));
  return t;
}

/* =====================================================================
   Step 2 — Establish a theory
   ===================================================================== */
function stepTheory() {
  const t = step(1);
  const grid = el("div", "instr instr--two");
  const p1 = el("div", "panel");
  if (G.track === "network") {
    /* Two panels side by side, because half of network troubleshooting is
       "compare it against one that works" and a student who never thinks to
       do that is slower for their whole career. */
    p1.appendChild(el("h3", null, "ipconfig /all &mdash; " + esc(G.asset.tag)));
    const idl = el("dl", "kv");
    ipconfigRows(G).forEach((r) => {
      const dt = el("dt", null, esc(r.k));
      const dd = el("dd", null, esc(r.v));
      if (r.bad) { dt.setAttribute("data-bad", "1"); dd.setAttribute("data-bad", "1"); }
      idl.appendChild(dt); idl.appendChild(dd);
    });
    p1.appendChild(idl);
    grid.appendChild(p1);
    const pk = el("div", "panel");
    pk.appendChild(el("h3", null, "The machine at the next desk, which works"));
    const kdl = el("dl", "kv");
    knownGoodRows(G).forEach((r) => {
      kdl.appendChild(el("dt", null, esc(r.k)));
      kdl.appendChild(el("dd", null, esc(r.v)));
    });
    pk.appendChild(kdl);
    grid.appendChild(pk);
    const pc = el("div", "panel");
    pc.appendChild(el("h3", null, "Change record &mdash; last three weeks"));
    const cdl = el("dl", "kv");
    changeRows(G).forEach((c) => {
      cdl.appendChild(el("dt", null, c.day >= 0 ? esc(dayName(c.day)) : esc("wk-" + Math.ceil(-c.day / 5))));
      cdl.appendChild(el("dd", null, esc(c.text)));
    });
    pc.appendChild(cdl);
    grid.appendChild(pc);
    t.body.appendChild(grid);
    t.body.appendChild(el("p", "count",
      "Site: " + esc(G.topo.base) + "/" + G.topo.prefix + " \u00b7 gateway " + esc(G.topo.gw) +
      " \u00b7 resolvers " + esc(G.topo.dns1) + " and " + esc(G.topo.dns2) +
      " \u00b7 DHCP scope " + esc(G.topo.scope.from) + " to " + esc(G.topo.scope.to) +
      " \u00b7 switch port " + esc(G.switchPort)));
    return netTheoryQuestions(t);
  }
  if (G.track === "mixed") {
    p1.appendChild(el("h3", null, "What the call says"));
    const mdl = el("dl", "kv");
    [["Reported as", G.fault.headline],
    ["Caller's department blames", G.scope.reported.label.split(" — ")[0]],
    ["What is actually happening", G.fault.observable]].forEach(([k, v]) => {
      mdl.appendChild(el("dt", null, esc(k)));
      mdl.appendChild(el("dd", null, esc(v)));
    });
    p1.appendChild(mdl);
    grid.appendChild(p1);

    const pc4 = el("div", "panel");
    pc4.appendChild(el("h3", null, "Change record &mdash; last three weeks"));
    const cdl4 = el("dl", "kv");
    changeRows(G).forEach((c) => {
      cdl4.appendChild(el("dt", null, c.day >= 0 ? esc(dayName(c.day)) : esc("wk-" + Math.ceil(-c.day / 5))));
      cdl4.appendChild(el("dd", null, esc(c.text)));
    });
    pc4.appendChild(cdl4);
    grid.appendChild(pc4);
    t.body.appendChild(grid);
    t.body.appendChild(el("p", "count",
      "Nobody has told you which domain this lives in. That is the exercise."));
    return mixedTheoryQuestions(t);
  }
  if (G.track === "cloud") {
    const hr = hostRows(G);
    p1.appendChild(el("h3", null, "Host &mdash; what it owns and what has been promised"));
    const hdl = el("dl", "kv");
    hr.rows.forEach((r) => {
      const dt = el("dt", null, esc(r.k)), dd = el("dd", null, esc(r.v));
      if (r.bad) { dt.setAttribute("data-bad", "1"); dd.setAttribute("data-bad", "1"); }
      hdl.appendChild(dt); hdl.appendChild(dd);
    });
    p1.appendChild(hdl);
    grid.appendChild(p1);

    const ps = el("div", "panel");
    ps.appendChild(el("h3", null, "Tenant and subscription"));
    const sdl = el("dl", "kv");
    cloudServiceRows(G).forEach((r) => {
      const dt = el("dt", null, esc(r.k)), dd = el("dd", null, esc(r.v));
      if (r.bad) { dt.setAttribute("data-bad", "1"); dd.setAttribute("data-bad", "1"); }
      sdl.appendChild(dt); sdl.appendChild(dd);
    });
    ps.appendChild(sdl);
    grid.appendChild(ps);

    const pc3 = el("div", "panel");
    pc3.appendChild(el("h3", null, "Change record &mdash; last three weeks"));
    const cdl3 = el("dl", "kv");
    changeRows(G).forEach((c) => {
      cdl3.appendChild(el("dt", null, c.day >= 0 ? esc(dayName(c.day)) : esc("wk-" + Math.ceil(-c.day / 5))));
      cdl3.appendChild(el("dd", null, esc(c.text)));
    });
    pc3.appendChild(cdl3);
    grid.appendChild(pc3);
    t.body.appendChild(grid);
    return cloudTheoryQuestions(t);
  }
  if (G.track === "mobile") {
    const dv = deviceRows(G);
    p1.appendChild(el("h3", null, "Device &mdash; " + esc(G.device.model)));
    const ddl = el("dl", "kv");
    dv.rows.forEach((r) => {
      const dt = el("dt", null, esc(r.k)), dd = el("dd", null, esc(r.v));
      if (r.bad) { dt.setAttribute("data-bad", "1"); dd.setAttribute("data-bad", "1"); }
      ddl.appendChild(dt); ddl.appendChild(dd);
    });
    p1.appendChild(ddl);
    grid.appendChild(p1);

    const pi = el("div", "panel");
    pi.appendChild(el("h3", null, "In your hand"));
    const idl2 = el("dl", "kv");
    inspectionRows(G).forEach((r) => {
      const dt = el("dt", null, esc(r.k)), dd = el("dd", null, esc(r.v));
      if (r.bad) { dt.setAttribute("data-bad", "1"); dd.setAttribute("data-bad", "1"); }
      idl2.appendChild(dt); idl2.appendChild(dd);
    });
    pi.appendChild(idl2);
    grid.appendChild(pi);

    const pc2 = el("div", "panel");
    pc2.appendChild(el("h3", null, "Change record &mdash; last three weeks"));
    const cdl2 = el("dl", "kv");
    changeRows(G).forEach((c) => {
      cdl2.appendChild(el("dt", null, c.day >= 0 ? esc(dayName(c.day)) : esc("wk-" + Math.ceil(-c.day / 5))));
      cdl2.appendChild(el("dd", null, esc(c.text)));
    });
    pc2.appendChild(cdl2);
    grid.appendChild(pc2);
    t.body.appendChild(grid);
    t.body.appendChild(el("p", "count",
      "Bought for " + money(G.device.newPrice) + " \u00b7 worth about " + money(G.device.residual) +
      " today \u00b7 " + (G.device.warranty ? "still in warranty" : "warranty expired at 12 months") +
      (G.repairCost === null ? "" : " \u00b7 repair quoted at " + money(G.repairCost))));
    return mobTheoryQuestions(t);
  }

  if (G.track === "laptop") {
    p1.appendChild(el("h3", null, "The call, and what the machine says"));
    const ldl = el("dl", "kv");
    [["Model", G.laptop.model], ["Age", G.laptop.ageMonths + " months"],
    ["Battery health", G.laptop.batteryHealth + "% over " + G.laptop.cycles + " cycles"],
    ["Service access", G.laptop.cover]].forEach(([k, v]) => {
      ldl.appendChild(el("dt", null, esc(k))); ldl.appendChild(el("dd", null, esc(v)));
    });
    p1.appendChild(ldl);
    grid.appendChild(p1);
    const lp2 = el("div", "panel");
    lp2.appendChild(el("h3", null, "Change record — last three weeks"));
    const lul = el("div", "kv");
    changeRows(G).forEach((c) => {
      lul.appendChild(el("dt", null, c.day >= 0 ? esc(dayName(c.day)) : esc("wk-" + Math.ceil(-c.day / 5))));
      lul.appendChild(el("dd", null, esc(c.text)));
    });
    lp2.appendChild(lul);
    grid.appendChild(lp2);
    t.body.appendChild(grid);
    return lapTheoryQuestions(t);
  }

  if (G.track === "display") {
    p1.appendChild(el("h3", null, "The display"));
    const ddl = el("dl", "kv");
    [["Device", G.screen.model], ["Panel technology", G.screen.panelType],
    ["Resolution", G.screen.res], ["Age", G.screen.ageMonths + " months"]].forEach(([k, v]) => {
      ddl.appendChild(el("dt", null, esc(k))); ddl.appendChild(el("dd", null, esc(v)));
    });
    p1.appendChild(ddl);
    grid.appendChild(p1);
    const dp2 = el("div", "panel");
    dp2.appendChild(el("h3", null, "Change record — last three weeks"));
    const dul = el("div", "kv");
    changeRows(G).forEach((c) => {
      dul.appendChild(el("dt", null, c.day >= 0 ? esc(dayName(c.day)) : esc("wk-" + Math.ceil(-c.day / 5))));
      dul.appendChild(el("dd", null, esc(c.text)));
    });
    dp2.appendChild(dul);
    grid.appendChild(dp2);
    t.body.appendChild(grid);
    return dispTheoryQuestions(t);
  }


  if (G.track === "printnet") {
    p1.appendChild(el("h3", null, "The device, as the caller found it"));
    const ndl = el("dl", "kv");
    [["Device", G.printnet.model],
    ["What it is for", G.printnet.deviceKind],
    ["How it connects", G.printnet.connection],
    ["Its own configuration page", G.printnet.selfPage]].forEach(([k, v]) => {
      ndl.appendChild(el("dt", null, esc(k))); ndl.appendChild(el("dd", null, esc(v)));
    });
    p1.appendChild(ndl);
    grid.appendChild(p1);
    const np2 = el("div", "panel");
    np2.appendChild(el("h3", null, "Change record — last three weeks"));
    const nul = el("div", "kv");
    changeRows(G).forEach((c) => {
      nul.appendChild(el("dt", null, c.day >= 0 ? esc(dayName(c.day)) : esc("wk-" + Math.ceil(-c.day / 5))));
      nul.appendChild(el("dd", null, esc(c.text)));
    });
    np2.appendChild(nul);
    grid.appendChild(np2);
    t.body.appendChild(grid);
    return pnetTheoryQuestions(t);
  }

  if (G.track === "raid") {
    p1.appendChild(el("h3", null, "The array as reported"));
    const adl = el("dl", "kv");
    [["Volume", G.array.volume],
    ["Level", G.array.levelLabel + " — " + G.array.levelName],
    ["Members", G.array.disks.filter((d) => d.role === "member").length + " × " + G.array.memberGb + "GB"],
    ["State", G.array.state]].forEach(([k, v]) => {
      const dt = el("dt", null, esc(k)), dd = el("dd", null, esc(v));
      if (k === "State" && G.array.state !== "Optimal") {
        dt.setAttribute("data-bad", "1"); dd.setAttribute("data-bad", "1");
      }
      adl.appendChild(dt); adl.appendChild(dd);
    });
    p1.appendChild(adl);
    grid.appendChild(p1);
    const rp2 = el("div", "panel");
    rp2.appendChild(el("h3", null, "Change record — last three weeks"));
    const rul = el("div", "kv");
    changeRows(G).forEach((c) => {
      rul.appendChild(el("dt", null, c.day >= 0 ? esc(dayName(c.day)) : esc("wk-" + Math.ceil(-c.day / 5))));
      rul.appendChild(el("dd", null, esc(c.text)));
    });
    rp2.appendChild(rul);
    grid.appendChild(rp2);
    t.body.appendChild(grid);
    return raidTheoryQuestions(t);
  }

  if (G.track === "power") {
    p1.appendChild(el("h3", null, "The site"));
    const wdl = el("dl", "kv");
    [["Machine", G.power.machine],
    ["Supply fitted", G.power.psuWatts + "W"],
    ["Outlet", "Standard duplex receptacle at the desk"],
    ["UPS", G.power.ups.va + " VA / " + G.power.ups.watts + " W"],
    ["Circuit", G.power.circuit.breaker + "A breaker at 120V"]].forEach(([k, v]) => {
      wdl.appendChild(el("dt", null, esc(k))); wdl.appendChild(el("dd", null, esc(v)));
    });
    p1.appendChild(wdl);
    grid.appendChild(p1);
    const wp2 = el("div", "panel");
    wp2.appendChild(el("h3", null, "Change record — last three weeks"));
    const wul = el("div", "kv");
    changeRows(G).forEach((c) => {
      wul.appendChild(el("dt", null, c.day >= 0 ? esc(dayName(c.day)) : esc("wk-" + Math.ceil(-c.day / 5))));
      wul.appendChild(el("dd", null, esc(c.text)));
    });
    wp2.appendChild(wul);
    grid.appendChild(wp2);
    t.body.appendChild(grid);
    return pwrTheoryQuestions(t);
  }

  if (G.track === "cabling") {
    p1.appendChild(el("h3", null, "The link"));
    const cdl = el("dl", "kv");
    [["Location", G.cable.site], ["Outlet", G.cable.outlet],
    ["Patch panel", G.cable.panel],
    ["Standard used across this site", "T568" + G.standard],
    ["Link is meant to run at", G.cable.certTo]].forEach(([k, v]) => {
      cdl.appendChild(el("dt", null, esc(k))); cdl.appendChild(el("dd", null, esc(v)));
    });
    p1.appendChild(cdl);
    grid.appendChild(p1);
    const cp2 = el("div", "panel");
    cp2.appendChild(el("h3", null, "Change record — last three weeks"));
    const cul = el("div", "kv");
    changeRows(G).forEach((c) => {
      cul.appendChild(el("dt", null, c.day >= 0 ? esc(dayName(c.day)) : esc("wk-" + Math.ceil(-c.day / 5))));
      cul.appendChild(el("dd", null, esc(c.text)));
    });
    cp2.appendChild(cul);
    grid.appendChild(cp2);
    t.body.appendChild(grid);
    return cabTheoryQuestions(t);
  }

  if (PRINTER_TRACKS.indexOf(G.track) !== -1) {
    p1.appendChild(el("h3", null, "Printer status page"));
    const pdl = el("dl", "kv");
    printerStatus(G).forEach((r) => {
      const dt = el("dt", null, esc(r.k)), dd = el("dd", null, esc(r.v));
      if (r.bad) { dt.setAttribute("data-bad", "1"); dd.setAttribute("data-bad", "1"); }
      pdl.appendChild(dt); pdl.appendChild(dd);
    });
    p1.appendChild(pdl);
    grid.appendChild(p1);

    const p2p = el("div", "panel");
    p2p.appendChild(el("h3", null, "Change record — last three weeks"));
    const pul = el("div", "kv");
    changeRows(G).forEach((c) => {
      pul.appendChild(el("dt", null, c.day >= 0 ? esc(dayName(c.day)) : esc("wk-" + Math.ceil(-c.day / 5))));
      pul.appendChild(el("dd", null, esc(c.text)));
    });
    p2p.appendChild(pul);
    grid.appendChild(p2p);
    t.body.appendChild(grid);

    if (G.printer.engine === "laser") {
      /* The seven stages, on the page, because half of these faults are
         best named by pointing at the stage that is failing — and because
         the process itself is examinable. */
      t.body.appendChild(holdKey("Hold to read: the seven stages of laser printing",
        LASER_STAGES.map((st) => [st.n + ". " + st.name, st.what])));
    }
    return prnTheoryQuestions(t);
  }

  const post = postReport(G);
  const ch = changeRows(G);
  p1.appendChild(el("h3", null, "Power-on self test"));
  const dl = el("dl", "kv");
  [["Beep code", post.beeps], ["Meaning", post.meaning], ["Power LED", post.powerLed],
  ["Drive LED", post.driveLed], ["Fans", post.fansSpin], ["Screen", post.display]].forEach(([k, v]) => {
    dl.appendChild(el("dt", null, esc(k)));
    dl.appendChild(el("dd", null, esc(v)));
  });
  p1.appendChild(dl);
  grid.appendChild(p1);

  const p2 = el("div", "panel");
  p2.appendChild(el("h3", null, "Change record — last three weeks"));
  const ul = el("div", "kv");
  ch.forEach((c) => {
    ul.appendChild(el("dt", null, c.day >= 0 ? esc(dayName(c.day)) : esc("wk-" + Math.ceil(-c.day / 5))));
    ul.appendChild(el("dd", null, esc(c.text)));
  });
  p2.appendChild(ul);
  grid.appendChild(p2);
  t.body.appendChild(grid);

  t.body.appendChild(el("p", "count",
    `Machine: ${esc(G.asset.caseType)}, ${esc(G.asset.socket)}, ${G.asset.cpuTdp}W processor, ` +
    `${G.asset.ramCap}GB ${esc(G.asset.ramType)}-${G.asset.ramSpeed}, ${esc(G.asset.psuWatts)}W supply, ` +
    `${G.asset.driveCap}GB ${esc(G.asset.driveIface)} boot device, ${G.asset.age} years old`));

  const qs = [
    {
      id: "theory-cause", kind: "choice",
      ask: "Question the obvious first. What is your theory of probable cause?",
      choices: () => ordShuffle("theory-cause", [
        G.fault.root.split(".")[0] + ".",
        "The operating system is corrupt and needs reinstalling.",
        "The user is doing something wrong.",
        "The machine is past its refresh date and is simply worn out.",
        "A recent Windows update broke it."
      ]),
      answer: () => G.fault.root.split(".")[0] + ".",
      why: () => G.fault.root + " The other four are the theories techs reach for when they have not looked yet — and each one costs somebody a day to disprove."
    },
    {
      id: "theory-evidence", kind: "choice", shuffle: true,
      ask: "Which piece of evidence in front of you most supports that theory?",
      choices: () => [
        evidenceFor(G),
        "The machine is " + G.asset.age + " years old",
        "The event log has warnings going back weeks",
        "The user says it has never been reliable"
      ],
      answer: () => evidenceFor(G),
      why: () => "Age, a noisy event log and a user's general impression are true of almost every machine in the building. Evidence has to point at this fault and not at all the others."
    }
  ];
  allQs = allQs.concat(renderQuestions(t.body, qs));
  return t;
}

/* Step two on the network track. Same two questions as the hardware track —
   commit to a cause, then name the evidence — against different instruments. */
function netTheoryQuestions(t) {
  const qs = [
    {
      id: "theory-cause", kind: "choice",
      ask: "Question the obvious first. What is your theory of probable cause?",
      choices: () => ordShuffle("theory-cause", NETWORK_FAULTS.map((f) => f.root.split(".")[0] + ".")),
      answer: () => G.fault.root.split(".")[0] + ".",
      why: () => G.fault.root + " " + G.fault.wrongWhy
    },
    {
      id: "theory-evidence", kind: "choice", shuffle: true,
      ask: "Which piece of evidence in front of you most supports that theory?",
      choices: () => [
        evidenceFor(G),
        "The machine is " + G.asset.age + " years old",
        "The user says the network has never been reliable",
        "Other people in the building have had network problems before"
      ],
      answer: () => evidenceFor(G),
      why: () => "Age, hearsay and the general history of the building are true of almost every machine here. Evidence has to point at this fault and not at all the others."
    }
  ];
  allQs = allQs.concat(renderQuestions(t.body, qs));
  return t;
}

function mixedTheoryQuestions(t) {
  const qs = [
    {
      id: "theory-cause", kind: "choice",
      ask: "Question the obvious first. What is your theory of probable cause?",
      choices: () => ordShuffle("theory-cause", MIXED_FAULTS.map((f) => f.root.split(".")[0] + ".")),
      answer: () => G.fault.root.split(".")[0] + ".",
      why: () => G.fault.root + " " + G.fault.wrongWhy
    },
    {
      id: "theory-evidence", kind: "choice", shuffle: true,
      ask: "Which piece of evidence in front of you most supports that theory?",
      choices: () => [
        evidenceFor(G),
        "The user is certain about what is wrong",
        "This has happened somewhere in the building before",
        "The equipment involved is getting old"
      ],
      answer: () => evidenceFor(G),
      why: () => "The caller's certainty, a vague precedent and the age of the kit are available on every ticket ever raised. Evidence has to point at this fault and not at all the others."
    }
  ];
  allQs = allQs.concat(renderQuestions(t.body, qs));
  return t;
}

function cloudTheoryQuestions(t) {
  const qs = [
    {
      id: "theory-cause", kind: "choice",
      ask: "Question the obvious first. What is your theory of probable cause?",
      choices: () => ordShuffle("theory-cause", CLOUD_FAULTS.map((f) => f.root.split(".")[0] + ".")),
      answer: () => G.fault.root.split(".")[0] + ".",
      why: () => G.fault.root + " " + G.fault.wrongWhy
    },
    {
      id: "theory-evidence", kind: "choice", shuffle: true,
      ask: "Which piece of evidence in front of you most supports that theory?",
      choices: () => [
        evidenceFor(G),
        "The host has been up for a long time without a reboot",
        "The provider has had outages before",
        "Users always say things are slow"
      ],
      answer: () => evidenceFor(G),
      why: () => "Uptime, the provider's history and general complaints about speed are true of nearly every estate. Evidence has to point at this fault and not at all the others."
    }
  ];
  allQs = allQs.concat(renderQuestions(t.body, qs));
  return t;
}

function mobTheoryQuestions(t) {
  const qs = [
    {
      id: "theory-cause", kind: "choice",
      ask: "Question the obvious first. What is your theory of probable cause?",
      choices: () => ordShuffle("theory-cause", MOBILE_FAULTS.map((f) => f.root.split(".")[0] + ".")),
      answer: () => G.fault.root.split(".")[0] + ".",
      why: () => G.fault.root + " " + G.fault.wrongWhy
    },
    {
      id: "theory-evidence", kind: "choice", shuffle: true,
      ask: "Which piece of evidence in front of you most supports that theory?",
      choices: () => [
        evidenceFor(G),
        "The device is " + G.device.ageMonths + " months old",
        "The user says it has never been the same since they got it",
        "Other people in the field have had trouble with these handsets"
      ],
      answer: () => evidenceFor(G),
      why: () => "Age, hearsay and the general reputation of the model are true of half the fleet. Evidence has to point at this fault and not at all the others."
    }
  ];
  allQs = allQs.concat(renderQuestions(t.body, qs));
  return t;
}

function evidenceFor(G) {
  if (G.track === "mixed") return G.fault.convicts;
  if (G.track === "cloud") {
    return { vmram: "Assigned memory across the guests exceeds what the host physically has",
      virtext: "The processor reports the extensions present but disabled in firmware",
      vdi: "Storage latency spikes into the hundreds of milliseconds exactly when users complain, with the network flat",
      quota: "The account is at its storage limit and every client failure is a quota rejection",
      sync: "A conflicted copy sits alongside the original, both modified the same afternoon",
      licence: "The account is active in the tenant with no licence attached",
      spend: "One resource tag from a finished project accounts for almost all of the increase",
      snapshot: "A snapshot months old with a delta file larger than the guest's own disk",
      timedrift: "The host clock several minutes from the time source, with the failures confined to its guests",
      backupwin: "The backup job still running hours into the working day, and latency dropping the moment it finishes",
      mfa: "The credential accepted every time and the second factor never completing, on every device",
      region: "A round trip an order of magnitude above anything local, on a circuit that is almost idle",
      cpuready: "Processor usage in the teens on every guest with ready time in the twenties, on a host promising several times the cores it owns",
      thinprov: "A datastore with roughly twice its own size promised out of it and no real free space left",
      portgroup: "One guest's adapter connected to a port group that does not exist on this host, with the rest of the host on the network normally",
      retention: "An unbroken run of successful backups on a fourteen-day retention, against a file deleted six weeks ago",
      egress: "A bill broken down by charge type where nearly all of the increase is data transferred out, with compute and storage flat"
    }[G.fault.key];
  }
  if (G.track === "mobile") {
    return { battery: "Battery health is well below the service threshold with a cycle count to match",
      port: "Charging drops out on movement and the port is visibly obstructed",
      digitizer: "The dead band stays in the same physical place when the screen is rotated",
      overheat: "The shutdowns cluster in the afternoon and the device recovers completely overnight",
      cellular: "Full signal and working voice with no data path at all",
      mdm: "The management console has no check-in since the device was reset",
      storage: "Free space is effectively zero and every failure is a write failure",
      speaker: "Faint through the earpiece and clear on loudspeaker, on the same call",
      swollen: "A gap opening evenly around the display, and the device rocking on a flat desk",
      wificall: "No cellular service at all in that area, a strong wireless association, and calling over wireless switched off",
      hotspot: "Sharing switched off on a handset with working data of its own, and a tablet that joins other networks normally",
      btpair: "A paired-device list at its limit and full of retired devices, with the accessory pairing to a second handset first time",
      captiveportal: "An association with an address and an answering gateway, nothing reachable past it, and a private DNS setting blocking the redirect",
      vpnalways: "Every remote service answering and nothing on the local network, on an always-on tunnel with no split tunnelling",
      appperm: "One permission denied for one application, with the same hardware working in every other application on the device",
      protector: "An air gap under the lifted edge of the protector on the same side touch fails, and touch perfect across the whole panel once it is off",
      nfcoff: "The short-range radio switched off in settings, with the same credential opening the door from a second handset",
      rearcam: "Flare and haze in daylight only, from a camera that focuses and exposes correctly, over glass hazed with fine scratches",
      liquid: "A triggered liquid contact indicator with green corrosion around two board connectors",
      eol: "An operating system two majors below what the application needs, on a model the manufacturer no longer updates",
      profile: "Several unrelated services stopping at the same timestamp on a device nobody touched",
      backupfail: "A last-successful-backup date months old with no error recorded and space at both ends"
    }[G.fault.key];
  }
  if (G.track === "network") {
    return { mask: "The mask on this interface does not match the machine at the next desk",
      gateway: "The configured gateway does not answer and is not the address the rest of the subnet uses",
      dns: "Names time out while the same destination answers by address",
      apipa: "A 169.254 address, which is the machine saying nobody answered its request for a lease",
      duplicate: "The ARP table shows one address answering from two hardware addresses",
      patch: "The port negotiated 100Mb half duplex on a gigabit switch with the error count climbing",
      vlan: "The address handed out is from the guest range and the switch port shows the guest VLAN",
      wrongsubnet: "A static address in a completely different range from the gateway, the neighbour and the scope",
      duplex: "A link up at half duplex with late collisions climbing, on an adapter set to auto-negotiate",
      portsec: "A port in an error-disabled state with a security violation counter, on a run that tests perfectly",
      proxy: "Every connectivity test green, names resolving correctly, and only the browser failing",
      nicoff: "An interface reporting media disconnected with a link light lit on the switch port",
      dnsold: "One name resolving to an address the server no longer has, with every other name correct",
      hosts: "A name resolving one way at the resolver and another way in the application, on one machine",
      wifiband: "One client on the slower radio at full signal while every machine beside it is on the faster one",
      mtu: "Small packets crossing and full-size ones dropped at a consistent size, on an idle circuit",
      loop: "Two ports shut by loop protection at the same timestamp, with a broadcast spike before it"
    }[G.fault.key];
  }
  return {
    ram: "The POST beep code reports a memory failure",
    psu: "The fans spin for a second and stop, and the log shows unexpected shutdowns",
    drive: "SMART reports reallocated and pending sectors on the boot device",
    thermal: "The CPU fan reads zero RPM while the package sits near its limit",
    video: "The POST beep code reports a video adapter failure",
    cable: "CRC errors are climbing while every other SMART attribute is clean",
    cmos: "The clock and BIOS settings reset on every cold start",
    psufan: "It stops after twenty minutes with every sensor in the machine reading normal",
    gpufan: "The graphics fans read zero RPM while the card sits at its thermal limit",
    nvmethermal: "The drive's temperature is above its throttling threshold with every other attribute clean",
    m2loose: "The boot device disappears on a knock and SMART is clean on every attribute",
    frontpanel: "It starts every time from the header and almost never from the button",
    ramslot: "Either module reports its full size in another slot and neither is seen in this one",
    cpupaste: "The processor at its limit with the fan turning correctly and the heatsink barely warm",
    bulgecap: "Capacitors beside the processor socket that are domed instead of flat, one of them split and dried, on a machine that resets under load with its supply rails in tolerance",
    dimmspeed: "Two modules at different speeds, with the pair trained down and the machine stable on the original alone",
    gpuseat: "A picture that returns when the card is pressed home and drops when the chassis is knocked",
    fanheader: "One fan at full speed constantly on a machine whose every temperature is normal"
  }[G.fault.key];
}

/* =====================================================================
   The part bench

   Three of the five tracks have something you can physically put your hands
   on, and this is it: the machine open on the bench, the handset in
   layers, the run from the desk to the gateway.

   The list of buttons is the interface. It carries every label, every
   reading and the whole keyboard path, and it is what the answer is graded
   from. The canvas beside it is a second view of the same selection and it
   is allowed to fail — no WebGL, an old graphics driver, a browser with it
   switched off — without costing the student a single thing. That ordering
   is not a compromise. Some of the people using this cannot rely on a lit
   3D surface holding its contrast, and a rectangle a screen reader cannot
   enter is not a control no matter how good it looks.
   ===================================================================== */
let liveScene = null;

/* Probed here rather than in scene.js, so a browser that cannot run it
   never downloads the graphics library at all. */
function webglOk() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch (e) { return false; }
}

function partBench(t, model) {
  const box = el("div", "bench");

  /* A seam for the verifier, not for the student.
     "Is the broken part actually drawn broken?" was being answered by
     photographing the canvas and comparing pixels, and that measurement
     could not tell a part that never changed from a part that changed by
     less than the comparison could see — it reported both as "identical".
     Reading the built model directly answers it exactly. Nothing on the
     page reads this; it exists so the claim can be checked. */
  /* The grading state, exposed read-only on the same seam the model uses.
     The step gates are computed from it, and until this was here the only
     way to ask "did that unlock step four" was to look at a screenshot. A
     lock that fires wrongly is invisible to every other check in the suite. */
  window.__FSCgraded = () => Object.assign({}, graded);
  window.__FSCrequired = (k) => requiredFor(k);
  window.__FSC = { track: G.track, fault: G.fault && G.fault.key,
    target: G.partTarget, model: model };

  /* ---- the picture ---- */
  const view = el("div", "bench__view");
  const stage = el("div", "bench__stage");
  view.appendChild(stage);
  const cam = el("div", "bench__cam");
  view.appendChild(cam);
  /* A photograph of the real thing, under the model, for the parts where a
     drawing is not enough. Empty and hidden until a part that has one is
     selected — an empty frame sitting there would read as something that
     failed to load. */
  const photo = el("figure", "bench__photo");
  photo.hidden = true;
  view.appendChild(photo);
  box.appendChild(view);

  /* ---- the control ---- */
  const list = el("div", "bench__list");
  list.appendChild(el("h4", null, esc(model.title)));
  list.appendChild(el("p", "count", esc(model.caption)));
  const choices = locateChoices(model, G.track);
  const btns = {};
  const grid = el("div", "pbtnlist");
  choices.forEach((c) => {
    const b = el("button", "pbtn" + (c.key === "none" ? " pbtn--none" : ""), esc(c.label));
    b.type = "button";
    b.setAttribute("aria-pressed", "false");
    /* The part this button stands for, so a check can name one exactly
       rather than matching on its label. Matching on the label is what led
       a check to mis-drive the "no physical part" answer, whose label is
       written differently on every track that offers it. */
    b.setAttribute("data-part", c.key);
    b.addEventListener("click", () => pick(c.key));
    btns[c.key] = b;
    grid.appendChild(b);
  });
  list.appendChild(grid);
  box.appendChild(list);
  t.body.appendChild(box);

  /* ---- what you see when you look at it ---- */
  const read = el("div", "bench__read");
  read.setAttribute("role", "status");
  read.setAttribute("aria-live", "polite");
  read.innerHTML = '<p class="count">Pick a part to look at it. Most of what is in there is ' +
    'ordinary wear on a machine that has been used &mdash; telling that from a fault is the job.</p>';
  t.body.appendChild(read);

  let chosen = null, claimBtn = null;
  function pick(k) {
    chosen = k;
    Object.keys(btns).forEach((x) => btns[x].setAttribute("aria-pressed", x === k ? "true" : "false"));
    if (liveScene) liveScene.select(k === "none" ? null : k);
    const p = model.parts.filter((x) => x.key === k)[0];
    read.innerHTML = p
      ? "<h4>" + esc(p.label) + "</h4>" +
        '<p class="bench__spec">' + esc(p.spec) + "</p><p>" + esc(p.note) + "</p>"
      : "<h4>No physical part</h4>" +
        '<p class="bench__spec">Nothing on the bench</p>' +
        "<p>You are saying there is nothing here to replace &mdash; that what is wrong is how the " +
        "device is set up or how it is being used.</p>";
    showPhoto(k);
  }

  /* The photograph for the selected part, if there is one. Most parts have
     none and that is not a gap: a photograph is for the things a drawing
     cannot carry, and hanging one on every part would train students to
     stop reading the bench. */
  function showPhoto(k) {
    const ph = photoFor(k);
    if (!ph) { photo.hidden = true; photo.innerHTML = ""; return; }
    photo.hidden = false;
    photo.innerHTML =
      '<img class="bench__photoimg" src="' + ph.src + '" alt="' + esc(ph.alt) + '">' +
      '<figcaption class="bench__photocap"><b>The real thing.</b> ' + esc(ph.look) + "</figcaption>";
  }

  /* ---- the canvas, if this browser can have one ---- */
  function flat(msg) {
    stage.innerHTML = "";
    stage.appendChild(el("p", "bench__nogl", msg));
    view.classList.add("bench__view--flat");
  }
  if (webglOk()) {
    const loading = el("p", "count", "Loading the model…");
    stage.appendChild(loading);
    import("./scene.js").then((S) => {
      const h = S.mountScene(stage, model, {
        height: Math.min(520, Math.max(340, (model.parts || []).length * 34)),
        onPick: pick
      });
      if (!h) { flat("The 3D view could not start. Nothing is lost — every part is in the list beside it."); return; }
      liveScene = h;
      if (window.__FSC) window.__FSC.scene = h;
      if (loading.parentNode) loading.remove();
      [["←", "Rotate the view left", () => h.orbit(-0.3, 0)],
       ["→", "Rotate the view right", () => h.orbit(0.3, 0)],
       ["↑", "Tilt the view up", () => h.orbit(0, 0.18)],
       ["↓", "Tilt the view down", () => h.orbit(0, -0.18)],
       ["＋", "Zoom in", () => h.zoom(-2)],
       ["−", "Zoom out", () => h.zoom(2)],
       ["Reset", "Reset the view", () => h.reset()]].forEach(([g, aria, fn]) => {
        const b = el("button", "btn btn--cam", g);
        b.type = "button"; b.setAttribute("aria-label", aria); b.title = aria;
        b.addEventListener("click", fn);
        cam.appendChild(b);
      });
      if (chosen) h.select(chosen);
    }).catch(() => flat("The 3D view could not load. Nothing is lost — every part is in the list beside it."));
  } else {
    flat("This browser has WebGL switched off, so there is no 3D view. That changes nothing about the " +
      "exercise — every part is in the list beside this and reads exactly the same way.");
  }

  /* ---- the graded half, appended later so it sits after the bench tests ---- */
  return {
    askLocate: function () {
      const target = locateTarget(G);
      /* The graded answer, for the verifier. It is NOT always the part the
         damage is drawn on: on the laptop, laser and display tracks
         locateTarget returns G.partTarget and the two are the same object,
         but the hardware track resolves its answer through its own map. A
         check that read the damage target and called it the answer passed
         on three tracks and reported the fourth as broken. */
      if (window.__FSC) window.__FSC.locate = target;
      const q = el("div", "q");
      /* POINT AT THE MACHINE, NOT AT A LIST. The whole reason the bench is
         drawn is that a technician finds a fault by looking at the thing, so
         clicking the part in the model is the way this is asked. The list
         beside it does exactly the same job and is named second rather than
         dropped: it is how the exercise is done on a keyboard, with a screen
         reader, at 400% zoom, or on a machine with WebGL switched off, and
         none of those is a lesser way to answer. */
      q.appendChild(el("p", "q__ask", webglOk()
        ? "Now point to it. Click the faulty part in the model above — or choose it " +
          "from the list beside it, whichever you would rather — then confirm."
        : "Now point to it. Select the part above that is actually at fault, then confirm."));
      /* The note has to describe the track's own matched pairs, or it teaches
         the right lesson about the wrong machine. */
      q.appendChild(el("p", "q__note", G.track === "printnet"
        ? "Naming a category is not the same as naming a link. \u201cThe printer\u201d covers seven different " +
          "things between the user and the paper, and the device at the end of them is the one people reach for " +
          "first and the one that is least often at fault \u2014 on one of these tickets nothing in the chain is."
        : G.track === "raid"
        ? "Naming a category is not the same as knowing which slot. Every carrier in the enclosure is the same " +
          "colour and the same shape, and which one is at fault is on the controller screen rather than on the " +
          "front of the machine \u2014 and on two of these tickets the answer is not a disk at all."
        : G.track === "power"
        ? "Naming a category is not the same as knowing which side of the outlet. Everything on the customer's " +
          "side is equipment you can measure and replace; everything on the other side is the building. One of " +
          "these tickets has nothing faulty on the bench at all, and saying so is the right answer rather than a " +
          "failure to find one."
        : G.track === "cloud"
        ? "Most of these are not a part at all. Thirteen of the seventeen tickets on this track are a " +
          "subscription, a policy, a region or a setting, and the honest answer is that nothing on this host " +
          "is faulty \u2014 which is an answer rather than a failure to find one. The machine is drawn so that " +
          "you can rule it out: the memory is countable, the processors are intact, and a host doing exactly " +
          "what it was told with more than it owns has not broken."
        : G.track === "cabling"
        ? "Naming a category is not the same as knowing where. A link has two plugs, two punch-downs and " +
          "a run between them, and “it is the cable” is true of five of those and useless about all five. " +
          "Re-terminating the end you happen to be standing next to is the commonest wasted trip on this job."
        : "Naming a category is not the same as knowing which one. Two identical memory modules, two " +
          "drives, a display bonded to a digitizer — the wrong one of a matched pair is a part " +
          "ordered, fitted and still broken."));
      const row = el("div", "q__row");
      claimBtn = el("button", "btn", "This is the faulty part");
      claimBtn.type = "button";
      row.appendChild(claimBtn);
      q.appendChild(row);
      const fb = el("p", "fb"); fb.style.display = "none";
      q.appendChild(fb);
      /* THE OUTLINE ON THE FOURTH WRONG GUESS. It marks the part on the
         machine, which is where the student is looking by then. When there
         is no canvas — WebGL off, or a browser that cannot — the list is
         the machine, so the same mark goes on the button instead. Neither
         path says the answer in words; both of them point. */
      const hints = hintBox(q, {
        onFourth: (on) => {
          if (liveScene) liveScene.flash(on && target !== "none" ? target : null);
          if (btns[target]) btns[target].classList.toggle("pbtn--found", !!on);
        }
      });
      t.body.appendChild(q);

      let revealed = false, beneath = null;
      /* The "no part" option is worded differently on each track that offers
         it, so the reveal has to read the label off the choice list rather
         than repeating one track's wording at the others. */
      const answerName = () => {
        const p = model.parts.filter((x) => x.key === target)[0];
        if (p) return p.label;
        const c = choices.filter((x) => x.key === target)[0];
        return c ? c.label : "No physical part";
      };
      claimBtn.addEventListener("click", () => {
        /* Nothing selected is not a wrong answer, so it does not get graded
           as one. Say what is missing and leave the score alone. */
        if (!chosen) {
          fb.style.display = "";
          fb.className = "fb";
          fb.textContent = liveScene
            ? "Click a part in the model first, or pick one from the list, then confirm."
            : "Select a part in the list above first, then confirm.";
          return;
        }
        revealed = false; beneath = null;
        const ok = chosen === target;
        graded["test-locate"] = ok;
        fb.style.display = "";
        fb.className = "fb " + (ok ? "fb--ok" : "fb--no");
        fb.innerHTML = (ok ? "Correct" : "Not that one") +
          '<span class="fb__why">' + esc(locateWhy(G, chosen, model)) + "</span>";
        if (ok) hints.right(); else hints.wrong(CONTROL_HINTS.locate);
        updateScore();
      });

      allQs.push({
        id: "test-locate",
        _reveal: () => {
          if (!revealed) beneath = { html: fb.innerHTML, cls: fb.className, disp: fb.style.display };
          revealed = true;
          if (liveScene) liveScene.highlight(target === "none" ? null : target);
          if (btns[target]) btns[target].classList.add("pbtn--answer");
          fb.style.display = ""; fb.className = "fb fb--ok";
          fb.innerHTML = "Answer: " + esc(answerName()) +
            '<span class="fb__why">' + esc(locateWhy(G, target, model)) + "</span>";
        },
        _unreveal: () => {
          if (!revealed) return;
          revealed = false;
          if (liveScene) liveScene.highlight(null);
          if (btns[target]) btns[target].classList.remove("pbtn--answer");
          fb.innerHTML = beneath ? beneath.html : "";
          fb.className = beneath ? beneath.cls : "fb";
          fb.style.display = beneath ? beneath.disp : "none";
          beneath = null;
        }
      });
    }
  };
}

/* =====================================================================
   The two printer tracks

   Printers are the only device on this build where the fix is a procedure
   rather than a part, so step four stops being "order the right thing" and
   becomes "do the right things in the right order, and do not do the three
   that hurt". And because a printer is the one machine a technician cleans
   as part of every visit, cleaning is graded on every ticket rather than
   filed under maintenance.
   ===================================================================== */

function prnTheoryQuestions(t) {
  const qs = [
    {
      id: "theory-cause", kind: "choice", shuffle: true,
      ask: "What is your theory of probable cause?",
      choices: () => TRACKS[G.track].faults.map((f) => f.part),
      answer: () => G.fault.part,
      why: () => G.fault.root + " " + G.fault.fixes
    },
    {
      id: "theory-evidence", kind: "choice", shuffle: true,
      ask: "And what is the evidence for it?",
      choices: () => TRACKS[G.track].faults.map((f) => f.evidence),
      answer: () => G.fault.evidence,
      why: () => "A theory you cannot point at evidence for is a guess, and on a printer a guess costs a consumable."
    }
  ];
  allQs = allQs.concat(renderQuestions(t.body, qs));
  return t;
}

/* Step three. The printer's own log, the test print, and on a laser the
   service manual page you measure against. */
function prnStepTest(t) {
  const p = G.printer;
  const laser = p.engine === "laser";

  /* ---- the printer's own error log ---- */
  const ep = el("div", "panel");
  ep.appendChild(el("h3", null, "Printer error log"));
  const ev = printerEvents(G);
  ev.forEach((r) => { r._bad = r._t === "fault"; });
  ep.appendChild(table(["When", "Level", "Message"], ev,
    (r) => `<td>${esc(r.day >= 0 ? dayName(r.day) : "wk-" + Math.ceil(-r.day / 5))}</td>` +
      `<td>${esc(r.level)}</td><td class="wrapcell">${esc(r.msg)}</td>`));
  t.body.appendChild(ep);

  /* ---- the test print ---- */
  const dp = el("div", "panel");
  dp.appendChild(el("h3", null, "Test print"));
  dp.appendChild(el("p", null, esc(defectReport(G))));
  t.body.appendChild(dp);

  /* ---- inkjet: the nozzle check ---- */
  if (!laser) {
    const np = el("div", "panel");
    np.appendChild(el("h3", null, "Nozzle check"));
    const rows = nozzleRows(G);
    rows.forEach((r) => { r._bad = r.bad; });
    np.appendChild(table(["Channel", "Ink remaining", "Result"], rows,
      (r) => `<td>${esc(r.c)}</td><td class="num">${r.pct}%</td><td>${esc(r.result)}</td>`));
    np.appendChild(el("p", "count",
      "A channel with ink in the cartridge and no bars on the page is a blockage. " +
      "A pattern where every channel prints means the ink is firing correctly &mdash; " +
      "whatever else is wrong, it is not the nozzles."));
    t.body.appendChild(np);
  }

  /* ---- laser: the ruler and the service manual ----
     This is the arithmetic ticket. The marks are on the page, the
     circumferences are in the manual, and the answer is the subtraction
     nobody bothers to do before ordering a cartridge. */
  const marks = laser ? defectMarks(G) : null;
  let onMeasure = () => {};
  if (marks) {
    /* The service manual is reference material — you always have it. The
       measurements are not: they appear when the student actually runs the
       measurement on the bench, because otherwise the isolating test on this
       ticket is one whose answer is already printed above it. */
    const sm0 = el("div", "panel");
    sm0.appendChild(el("h3", null, "Service manual — rotating components, " + esc(p.model)));
    const rows0 = circumferenceRows(p, (a) => ordShuffle("circ", a));
    sm0.appendChild(table(["Component", "Circumference"], rows0,
      (r) => `<td>${esc(r.name)}</td><td class="num">${r.mm}mm</td>`));
    t.body.appendChild(sm0);

    const hint = el("p", "step__hint",
      "<strong>You have not measured it yet.</strong> The marks are clearly evenly spaced, but " +
      "&ldquo;evenly spaced&rdquo; does not name a part. Run the measurement on the bench below and " +
      "the figures will appear here.");
    t.body.appendChild(hint);

    const gated = el("div");
    gated.hidden = true;
    t.body.appendChild(gated);
    onMeasure = () => { gated.hidden = false; hint.hidden = true; };

    const mp = el("div", "panel");
    mp.appendChild(el("h3", null, "The repeating marks, measured down the page"));
    mp.appendChild(el("p", "count",
      "Distance from the top edge of the sheet to each mark, in millimetres:"));
    const strip = el("p", "marks", marks.marks.map((m) => m + "mm").join("  ·  "));
    mp.appendChild(strip);
    mp.appendChild(el("p", "count",
      "The spacing between them is the circumference of whatever is printing it, " +
      "because it prints the mark once per revolution."));
    gated.appendChild(mp);

    allQs = allQs.concat(renderQuestions(gated, [
      {
        id: "test-interval", kind: "text",
        ask: "What is the spacing between the marks, in millimetres?",
        placeholder: "e.g. 84",
        note: "Subtract one mark position from the next. They are evenly spaced, so any adjacent pair gives you the same answer.",
        accept: (v) => parseInt(String(v).replace(/[^0-9]/g, ""), 10) === marks.gap,
        answer: () => String(marks.gap),
        why: () => "The marks are " + marks.gap + "mm apart, and the manual puts exactly one component at " +
          marks.gap + "mm: the " + prnPartProse(G.partTarget) +
          ". Measuring took two minutes and it is the difference between ordering one part and ordering a whole cartridge on a hunch."
      }
    ]));
  }

  /* ---- open it up and look ---- */
  t.body.appendChild(el("p", "step__hint",
    "<strong>Open it up and look.</strong> " + (laser
      ? "The paper path runs left to right: out of the tray, round the drum, through the fuser and out. Most of what is in here is ordinary wear on a machine that prints all day."
      : "The head runs along the belt and parks in the capping station at the end of its travel. Almost every inkjet fault is somewhere on that journey.")));
  const bench = partBench(t, laser
    ? laserModel(G, partsFor("laser"))
    : inkjetModel(G, partsFor("inkjet")));

  /* ---- the bench ---- */
  t.body.appendChild(el("p", "step__hint",
    "<strong>One test at a time.</strong> " + (laser
      ? "A laser printer will happily let you spend an afternoon reinstalling drivers for a fault its own configuration page would have shown you in three minutes."
      : "Every cleaning cycle you run costs ink and fills the waste pad. Pick the test that tells you something.")));

  const box = el("div", "tests");
  const benchHint = hintBox(box);
  const ran = {};
  let benchClean = true;
  const timeSpent = el("p", "count", "Bench time spent: 0 minutes");
  const fb = el("p", "fb"); fb.style.display = "none";
  const tests = printerBenchTests(G);
  tests.forEach((tt) => {
    const card = el("div", "test");
    const out = el("span", "test__out"); out.hidden = true;
    const run = el("button", "btn", "Run"); run.type = "button";
    run.addEventListener("click", () => {
      ran[tt.key] = true;
      out.hidden = false; out.textContent = tt.result; run.disabled = true;
      if (tt.key === "measure") onMeasure();
      const spent = tests.filter((x) => ran[x.key]).reduce((a, x) => a + x.mins, 0);
      timeSpent.textContent = "Bench time spent: " + spent + " minutes";
      /* Running a test that cannot isolate anything is not a wrong answer,
         it is wasted bench time — so it counts the same way. */
      if (tt.isolating) benchHint.right(); else benchHint.wrong(CONTROL_HINTS.bench);
      if (tt.isolating) {
        const clean = tests.filter((x) => ran[x.key] && !x.isolating).length === 0;
        /* FINDING IT IS THE PASS. HOW TIDILY IS THE FEEDBACK.

           This used to be `graded["test-isolate"] = clean`, and `clean` is
           false the moment a student opens any other tool first. The button
           then disables, so the flag could never become true again — and
           step four gates on `=== true`. A student who explored one wrong
           tool before finding the right one had the rest of the ticket
           locked against them permanently, with a lock message telling them
           to finish a step they had just finished.

           Trying the wrong instrument first is what diagnosis looks like.
           It costs bench time, it is said plainly in the feedback below, and
           it does not take the ticket away. */
        graded["test-isolate"] = true;
        benchClean = clean;
        fb.style.display = "";
        fb.className = "fb " + (clean ? "fb--ok" : "fb--no");
        fb.innerHTML = (clean ? "Correct" : "Confirmed, eventually") + '<span class="fb__why">' +
          esc(clean
            ? "Straight to it in " + tt.mins + " minutes. On a printer the cheap test is nearly always the machine's own test page — it separates the printer from everything upstream of it before you touch a driver."
            : "That is the isolating test, but you spent " + spent + " minutes getting there" +
            (ran.driverlaser || ran.driverink ? " — including reinstalling a driver for a fault the printer was producing on its own report." : ".")) +
          "</span>";
        updateScore();
      }
    });
    card.appendChild(el("span", "test__label", esc(tt.label)));
    card.appendChild(el("span", "test__mins", tt.mins + " min"));
    card.appendChild(run); card.appendChild(out);
    box.appendChild(card);
  });
  t.body.appendChild(box);
  t.body.appendChild(timeSpent);
  t.body.appendChild(fb);

  bench.askLocate();

  allQs = allQs.concat(renderQuestions(t.body, [
    {
      id: "test-part", kind: "choice", shuffle: true,
      ask: "Theory confirmed. What is actually wrong?",
      choices: () => TRACKS[G.track].faults.map((f) => f.part),
      answer: () => G.fault.part,
      why: () => G.fault.root + " " + G.fault.fixes
    }
  ]));
  return t;
}

function prnPartLabel(key) {
  const p = partsFor(G.printer.engine).filter((x) => x.key === key)[0];
  return p ? p.label : key;
}

/* The name as it reads mid-sentence. Lowercasing the label wholesale turned
   "Photosensitive drum (OPC)" into "(opc)", so parts that carry an acronym
   spell out how they want to be written in prose. */
function prnPartProse(key) {
  const p = partsFor(G.printer.engine).filter((x) => x.key === key)[0];
  if (!p) return key;
  return p.lname || p.label.toLowerCase();
}

/* =====================================================================
   Step four — the procedure

   The other tracks grade a part, a configuration, a decision or an action.
   This one grades a sequence, because that is what the job is. Three kinds
   of thing sit on the list together: the steps that belong here, honest
   steps that belong to a different repair, and the ones that must never
   appear at all.

   A forbidden step fails the whole procedure however tidy the rest of it
   is, which is the correct weighting. Nobody gets partial credit for a
   well-ordered afternoon with a burn in the middle of it.
   ===================================================================== */
/* The procedure builder serves three tracks now. These resolve which pool of
   actions and which explanations belong to the one on screen, so the builder
   itself does not have to know. */
/* One procedure builder, four engines. Each supplies its own action pool,
   its own lookup and its own explanation of why a step does not belong on
   this job; everything about ordering, forbidden steps and grading is
   shared, because those rules do not change with the machine. */
function procActions(engine) {
  return engine === "laptop" ? LAPTOP_ACTIONS
    : engine === "power" ? POWER_ACTIONS : actionsFor(engine);
}
function procAction(engine, key) {
  return engine === "laptop" ? laptopActionByKey(key)
    : engine === "power" ? powerActionByKey(key) : actionByKey(engine, key);
}
function procWhy(fault, key, engine) {
  return engine === "laptop" ? laptopProcedureWhy(fault, key)
    : engine === "power" ? powerProcedureWhy(fault, key) : procedureWhy(fault, key);
}

/* The power track reaches the builder through its own step four, which
   makes the scope call first. */
function pwrProcedure(t) { return prnStepPlan(t); }

function prnStepPlan(t) {
  const laptop = G.track === "laptop";
  const power = G.track === "power";
  const engine = laptop ? "laptop" : power ? "power" : G.printer.engine;
  const want = G.procedure;

  t.body.appendChild(el("p", "step__hint",
    "<strong>" + (power ? "Now build the procedure, in order." : "Build the procedure, in order.") +
    "</strong> Click the steps you are going to carry out, in the " +
    "sequence you will carry them out. Some of what is on this list belongs to a different repair, and " +
    "some of it must never happen at all &mdash; " + (laptop
      ? "a laptop that is switched off still has a charged cell wired to a live board, and a swollen one does not get charged, pressed or binned."
      : power
        ? "a power supply holds a lethal charge long after it is unplugged, a ground pin is the last thing between a fault and the user, and a bigger breaker protects nothing but your afternoon."
        : "a fuser holds 200&deg;C long after the power is off, a drum is ruined by one fingerprint, and an ordinary vacuum will put a cloud of toner through its filter and into the room you are standing in.")));

  const money2 = el("div", "money");
  money2.innerHTML =
    `<span>${power ? "Site" : "Machine"} <b>${esc(laptop ? G.laptop.model : power ? G.power.machine : G.printer.model)}</b></span>` +
    `<span>Urgency <b>${esc(G.urgency.label)}</b></span>` +
    `<span>Correct procedure <b>${want.length} steps</b></span>`;
  t.body.appendChild(money2);

  const wrap = el("div", "proc");

  /* the pool */
  const poolBox = el("div", "proc__pool");
  poolBox.appendChild(el("h3", null, "Available steps"));
  const poolList = el("div", "proclist");
  poolBox.appendChild(poolList);

  /* the answer */
  const seqBox = el("div", "proc__seq");
  seqBox.appendChild(el("h3", null, "Your procedure"));
  const seqList = el("ol", "proc__list");
  seqBox.appendChild(seqList);
  const empty = el("p", "count", "Nothing added yet. Click a step on the left to add it.");
  seqBox.appendChild(empty);

  wrap.appendChild(poolBox);
  wrap.appendChild(seqBox);
  t.body.appendChild(wrap);

  const chosen = [];
  const pool = ordShuffle("proc", procActions(engine).slice());
  const btns = {};

  function redraw() {
    seqList.innerHTML = "";
    empty.hidden = chosen.length > 0;
    chosen.forEach((k, i) => {
      const a = procAction(engine, k);
      const li = el("li", "proc__step");
      li.appendChild(el("span", "proc__label", esc(a.label)));
      const rm = el("button", "btn btn--cam", "Remove");
      rm.type = "button";
      rm.setAttribute("aria-label", "Remove step " + (i + 1) + ", " + a.label);
      rm.addEventListener("click", () => {
        chosen.splice(i, 1);
        btns[k].disabled = false;
        btns[k].setAttribute("aria-pressed", "false");
        redraw();
      });
      li.appendChild(rm);
      seqList.appendChild(li);
    });
  }

  pool.forEach((a) => {
    const b = el("button", "procbtn", esc(a.label));
    b.type = "button";
    b.setAttribute("aria-pressed", "false");
    b.addEventListener("click", () => {
      if (chosen.indexOf(a.key) !== -1) return;
      chosen.push(a.key);
      b.disabled = true;
      b.setAttribute("aria-pressed", "true");
      redraw();
    });
    btns[a.key] = b;
    poolList.appendChild(b);
  });
  redraw();

  const row = el("div", "q__row");
  const check = el("button", "btn", "Check the procedure");
  check.type = "button";
  row.appendChild(check);
  const q = el("div", "q");
  q.appendChild(el("p", "q__ask", "Ready? Check it before you touch the machine."));
  q.appendChild(row);
  const fb = el("p", "fb"); fb.style.display = "none";
  q.appendChild(fb);
  const hints = hintBox(q);
  t.body.appendChild(q);

  let revealed = false, beneath = null;

  check.addEventListener("click", () => {
    if (!chosen.length) {
      fb.style.display = ""; fb.className = "fb";
      fb.textContent = "Add the steps you would carry out, then check it.";
      return;
    }
    revealed = false; beneath = null;

    /* 1. anything forbidden fails outright, and says why in full. */
    const bad = chosen.filter((k) => (procAction(engine, k) || {}).forbidden);
    let ok = false, headline = "", why = "";
    if (bad.length) {
      headline = "Stop";
      why = bad.map((k) => {
        const a = procAction(engine, k);
        return [a.label, a.why];
      });
    } else {
      const missing = want.filter((k) => chosen.indexOf(k) === -1);
      const extra = chosen.filter((k) => want.indexOf(k) === -1);
      if (missing.length || extra.length) {
        headline = "Not yet";
        const bits = [];
        if (missing.length) bits.push(missing.length + " step" + (missing.length > 1 ? "s" : "") +
          " missing — the first one you have left out is “" +
          procAction(engine, missing[0]).label + "”.");
        if (extra.length) bits.push(extra.length + " step" + (extra.length > 1 ? "s" : "") +
          " that does not belong on this job. " + procWhy(G.fault, extra[0], engine));
        why = bits.join(" ");
      } else {
        /* right steps — now the order */
        let firstWrong = -1;
        for (let i = 0; i < want.length; i++) if (chosen[i] !== want[i]) { firstWrong = i; break; }
        if (firstWrong === -1) {
          ok = true;
          headline = "Correct";
          why = "Every step that belongs here, in an order that keeps you and the machine intact. " +
            "Note where the safety steps sit — not as a preamble you skim, but as steps " +
            (firstSafety(engine)) + " of the job itself.";
        } else {
          headline = "Right steps, wrong order";
          why = "Step " + (firstWrong + 1) + " should be “" +
            procAction(engine, want[firstWrong]).label + "”, and you have “" +
            procAction(engine, chosen[firstWrong]).label + "” there instead. " +
            orderWhy(engine, want[firstWrong], chosen[firstWrong]);
        }
      }
    }
    graded["plan-procedure"] = ok;
    fb.style.display = "";
    fb.className = "fb " + (ok ? "fb--ok" : "fb--no");
    fb.innerHTML = headline + '<span class="fb__why">' + (Array.isArray(why)
      ? '<ul class="fb__ul">' + why.map((l) => "<li><b>" + esc(l[0]) + "</b> &mdash; " +
        esc(l[1]) + "</li>").join("") + "</ul>"
      : esc(why)) + "</span>";
    if (ok) hints.right(); else hints.wrong(CONTROL_HINTS.procedure);
    updateScore();
  });

  allQs.push({
    id: "plan-procedure",
    _reveal: () => {
      if (!revealed) beneath = { html: fb.innerHTML, cls: fb.className, disp: fb.style.display };
      revealed = true;
      fb.style.display = ""; fb.className = "fb fb--ok";
      /* An ordered list, not a run-on sentence. This is a procedure — the
         one thing on the page whose whole meaning is the sequence — and
         fifteen steps separated by spaces is unreadable for anybody, let
         alone somebody working at 200% zoom. */
      fb.innerHTML = "Answer, in order:" + '<span class="fb__why"><ol class="fb__ol">' +
        want.map((k) => "<li>" + esc(procAction(engine, k).label) + "</li>").join("") +
        "</ol></span>";
    },
    _unreveal: () => {
      if (!revealed) return;
      revealed = false;
      fb.innerHTML = beneath ? beneath.html : "";
      fb.className = beneath ? beneath.cls : "fb";
      fb.style.display = beneath ? beneath.disp : "none";
      beneath = null;
    }
  });
  return t;
}

function firstSafety(engine) {
  return engine === "laser" ? "two and three" : "two and three";
}

function orderWhy(engine, wantKey, gotKey) {
  const pairs = {
    power: "Power comes off before anything else is touched. Everything after it depends on that being true.",
    cool: "The fuser cools before the covers come off. Twenty minutes of waiting is cheaper than a burn.",
    parkhead: "The head has to park itself before the power goes off, or it sits uncapped and dries out overnight.",
    unplug: "Unplug only once the head is capped.",
    testpage: "The test print comes after the repair, not before it — it is how you prove the fix.",
    resetcounter: "The counter is reset at the end, once the parts are actually in.",
    nozzlecheck: "The nozzle check is how you confirm the clean worked, so it comes after it.",
    reassemble: "It goes back together after the work, not before.",
    servicepos: "Drive the carriage across before you try to reach what is behind it.",
    battdisc: "The battery comes off the board before anything else is touched. Powered off is not the same as safe, and this is the step that stops a slipped screwdriver becoming a new mainboard.",
    covers: "The cover comes off before you can reach the battery connector under it.",
    quote: "The customer hears the number before the work starts, not after.",
    backup: "The backup happens while the machine still works, which is now.",
    esd: "Ground yourself before you handle a board, not after you have already touched one.",
    battconn: "The battery goes back on last, once everything else is seated.",
    hazbin: "The pack is bagged and sent out as soon as it is off the machine, not left on a bench.",
    boot: "Confirm it posts before the cover goes back on, or you are taking it apart twice."
  };
  return pairs[wantKey] || pairs[gotKey] ||
    "The order matters here: each step assumes the one before it has already happened.";
}

/* =====================================================================
   Step five — verify, and clean what you touched

   Cleaning is graded on every printer ticket because on a printer it is
   part of every printer job. The wrong methods on this list are not
   strawmen: solvent on an encoder strip, a workshop vacuum on toner, an
   abrasive on a separation pad. Every one of them is something a
   reasonable person tries, and every one of them costs the part.
   ===================================================================== */
function prnStepVerify(t) {
  t.body.appendChild(el("p", "step__hint",
    "<strong>Print the work the user actually prints.</strong> A test page proves the engine runs. " +
    "It does not prove the duplexer works, or that the tray they use every day feeds, or that the " +
    "job they were trying to send at nine o'clock this morning comes out right."));

  const cp = el("div", "panel");
  cp.appendChild(el("h3", null, "Clean what you touched"));
  cp.appendChild(el("p", "tile__intro",
    "Every part you had your hands on, and the correct method for each. " +
    "The wrong answers here are not silly ones — they are what gets reached for, and most of them " +
    "cost you the part."));

  const parts = G.touched;
  const sels = {};
  const rows = el("div", "cleanlist");
  parts.forEach((part, i) => {
    const rowEl = el("div", "cleanrow");
    const lab = el("label", "cleanrow__name");
    lab.setAttribute("for", "clean" + i);
    lab.innerHTML = "<b>" + esc(part.label) + "</b><span>" + esc(part.role) + "</span>";
    const sel = el("select", "ans");
    sel.id = "clean" + i;
    const opts = methodChoices(part, (a) => ordShuffle("clean" + part.key, a));
    sel.innerHTML = '<option value="">— select —</option>' +
      opts.map((o) => `<option value="${esc(o.key)}">${esc(o.label)}</option>`).join("");
    sels[part.key] = sel;
    rowEl.appendChild(lab);
    rowEl.appendChild(sel);
    rows.appendChild(rowEl);
  });
  cp.appendChild(rows);

  const cRow = el("div", "q__row");
  const cCheck = el("button", "btn btn--check", "Check the cleaning");
  cCheck.type = "button";
  cRow.appendChild(cCheck);
  cp.appendChild(cRow);
  const cFb = el("p", "fb"); cFb.style.display = "none";
  cp.appendChild(cFb);
  const cHints = hintBox(cp);
  t.body.appendChild(cp);

  let revealed = false, beneath = null;
  cCheck.addEventListener("click", () => {
    const unanswered = parts.filter((p) => !sels[p.key].value);
    if (unanswered.length) {
      cFb.style.display = ""; cFb.className = "fb";
      cFb.textContent = "Choose a method for every part first — " + unanswered.length + " still blank.";
      return;
    }
    revealed = false; beneath = null;
    const wrong = parts.filter((p) => sels[p.key].value !== p.clean);
    const ok = wrong.length === 0;
    graded["verify-clean"] = ok;
    cFb.style.display = "";
    cFb.className = "fb " + (ok ? "fb--ok" : "fb--no");
    const lines = ok
      ? parts.map((p) => [p.label, methodWhy(p, p.clean)])
      : wrong.map((p) => [p.label, methodWhy(p, sels[p.key].value)]);
    cFb.innerHTML = (ok ? "Correct" : wrong.length + " of " + parts.length + " wrong") +
      '<span class="fb__why"><ul class="fb__ul">' +
      lines.map((l) => "<li><b>" + esc(l[0]) + "</b> &mdash; " + esc(l[1]) + "</li>").join("") +
      "</ul></span>";
    if (ok) cHints.right(); else cHints.wrong(CONTROL_HINTS.cleaning);
    updateScore();
  });

  allQs.push({
    id: "verify-clean",
    _reveal: () => {
      if (!revealed) beneath = { html: cFb.innerHTML, cls: cFb.className, disp: cFb.style.display };
      revealed = true;
      cFb.style.display = ""; cFb.className = "fb fb--ok";
      cFb.innerHTML = "Answer:" + '<span class="fb__why"><ul class="fb__ul">' +
        parts.map((p) => "<li><b>" + esc(p.label) + "</b> &mdash; " +
          esc(CLEAN_METHODS[p.clean]) + "</li>").join("") + "</ul></span>";
    },
    _unreveal: () => {
      if (!revealed) return;
      revealed = false;
      cFb.innerHTML = beneath ? beneath.html : "";
      cFb.className = beneath ? beneath.cls : "fb";
      cFb.style.display = beneath ? beneath.disp : "none";
      beneath = null;
    }
  });

  const qs = [
    {
      id: "verify-what", kind: "choice", shuffle: true,
      ask: "What counts as verifying this printer is fixed?",
      choices: () => [
        "Print the user's own job, from their machine, on the tray they use, with them watching",
        "Print the printer's internal configuration page",
        "Confirm the error has cleared from the panel",
        "Send a test page from your laptop and pack up"
      ],
      answer: () => "Print the user's own job, from their machine, on the tray they use, with them watching",
      why: () => "The configuration page comes from the printer's own memory and never touches the driver, the network or the tray they actually use. Your laptop is not their machine. The only thing that proves this ticket is closed is the job that opened it."
    },
    {
      id: "verify-prevent", kind: "choice",
      ask: "And the preventive measure — what stops this one coming back?",
      choices: () => ordShuffle("verify-prevent", TRACKS[G.track].faults.map((f) => PREVENT[f.key])),
      answer: () => PREVENT[G.fault.key],
      why: () => PREVENT_WHY[G.fault.key]
    }
  ];
  allQs = allQs.concat(renderQuestions(t.body, qs));
  return t;
}

const PREVENT = {
  pickup: "Put the maintenance kit on the page count, not on the complaint — fit it when the counter says so",
  fuser: "Track the page count against the kit interval so the fuser is changed on schedule, not on failure",
  repeat: "Record the page count and the component fitted, so the next repeating defect starts from a known baseline",
  transfer: "Handle transfer rollers by the ends and fit them as part of the scheduled kit",
  scanner: "Keep the covers shut and get it out of the path of the office dust and the redecorating",
  encoder: "Write the 'distilled water only' rule on the machine itself, where whoever cleans it will read it",
  capping: "Leave the printer powered on so it parks and caps the head, and run a page a week if it sits idle",
  head: "Print something in every colour once a week rather than letting it stand, and stop after three cleaning cycles",
  belt: "Clear jams by pulling paper the way it was travelling, never sideways against the carriage",
  wastepad: "Watch the waste counter as a scheduled item so the pad is changed before the printer stops itself",
  sepwear: "Put the multipurpose tray's pad on the maintenance list in its own right, because it wears faster than the main tray's and gets forgotten",
  cleanblade: "Note the page count at every cartridge change, so the next smearing complaint starts from a known baseline",
  tonerlow: "Keep one spare cartridge on the shelf, so a low cartridge is a two-minute swap rather than a call-out",
  trayguide: "Show whoever loads the trays how to set the guides, because this comes back every time the paper size changes",
  wrongmedia: "Label each tray with the stock it holds and the media type it is set to, so the two cannot drift apart",
  airlock: "Keep the machine upright when it is moved, and stop at three cleaning cycles rather than running six",
  headstrike: "Write the machine's rated media thickness on it, because the card that caused this will be ordered again",
  waterink: "Standardise on an inkjet-rated stock for this machine and take the uncoated paper off its shelf",
  carriagerail: "Write the 'manufacturer's grease only' rule on the machine, where whoever cleans it next will read it",
  chipreset: "Put the refill saving next to the call-out cost in writing, so the decision gets made with the numbers rather than by the helpdesk",
  duplexjam: "Fit the duplexer rollers with the rest of the maintenance kit rather than waiting for the jams to start",
  exitjam: "Check the exit rollers whenever the fuser is changed — they sit in the same heat and wear at the same rate",
  regskew: "Fan and square the paper into the tray, set the guides to the stock, and keep one paper weight per tray",
  gearnoise: "Log the noise and the page count now, so the gear train is opened at the next service rather than in the middle of a run",
  ozone: "Put the filter on the maintenance schedule and change it by date, because nothing about it looks worn until it is",
  platen: "Turn borderless printing off unless the job needs it, and wipe the platen when the waste pad is checked",
  starwheel: "Keep the media weight inside what the machine is rated for, so the wheels ride over paper rather than digging into it",
  feedenc: "Keep the machine out of the dust and blow the encoder wheel out at every service, before the count starts drifting",
  pumpfail: "Stop the daily cleaning cycles — set a limit of three and escalate instead, because each one works the pump and fills the pad",
  ijfeed: "Order one paper stock and keep the tray to it, and clean the roller when the waste pad is checked"
};

const PREVENT_WHY = {
  pickup: "Rollers wear on pages, not on months. A counter tells you when; a complaint tells you that you were late.",
  fuser: "A fuser that fails in service takes a day of printing with it. One changed on schedule takes twenty minutes.",
  repeat: "The next tech measuring a repeating mark needs to know what was fitted and at what page count, or they start from nothing.",
  transfer: "Skin oil on a transfer roller causes precisely the fault you were called out for, so the handling rule is the prevention.",
  scanner: "This is a dust fault. Everything that keeps dust out of the optics prevents it, and nothing else does.",
  encoder: "The strip was destroyed by somebody trying to help. The prevention is making the rule visible to the next person who tries.",
  capping: "The head dried because it was not sealed. Anything that keeps it parked and capped fixes the cause rather than the symptom.",
  head: "Nozzles clog when ink sits still. Regular light use costs a page a week and saves a printhead.",
  belt: "Belts get damaged by people clearing jams the fastest way rather than the right way.",
  wastepad: "The pad fills predictably. Treating it as a scheduled consumable means the printer never stops itself in the middle of a print run.",
  sepwear: "Two trays, two pads, and only one of them ever gets replaced because only one of them is in the kit.",
  cleanblade: "Nothing prevents a blade wearing out. What the page count buys you is knowing whether it has, rather than guessing.",
  tonerlow: "This is a consumable running out. The prevention is having the next one on the shelf, not doing anything to the printer.",
  trayguide: "It is a loading habit rather than a fault, which means the fix is a person rather than a part.",
  wrongmedia: "The tray setting and the paper in the tray drift apart every time somebody changes one without the other. Labelling ties them together.",
  airlock: "Air gets into a line when the machine is tipped or when the pump is worked hard for nothing. Both are avoidable.",
  headstrike: "The head cannot know how thick the paper is. Somebody has to, and the number has to be where they will see it.",
  waterink: "The printer is fine and the paper is wrong. Taking the wrong paper out of reach is the only thing that stops it.",
  carriagerail: "This was caused by cleaning. The prevention is making the right method visible to whoever cleans it next.",
  chipreset: "Nothing technical prevents this. What prevents it is somebody seeing the two numbers side by side once.",
  duplexjam: "These rollers are in the kit and they are the ones nobody fits, because the duplexer only gets used when somebody turns it on.",
  exitjam: "Exit rollers cook beside the fuser. Changing them together costs nothing extra in labour and saves the second visit.",
  regskew: "Skew is a paper-handling fault before it is a roller fault. Fix how the tray is loaded and most of it never happens.",
  gearnoise: "A gear train tells you it is going long before it goes. Writing down what it sounded like and when is what makes that warning usable.",
  ozone: "A filter is a date item, not a wear item — it looks identical on the day it stops working, so only the schedule protects you.",
  platen: "Borderless printing sprays past the edge of the paper by design. Using it only when the job needs it is the prevention.",
  starwheel: "The wheels are shaped for ordinary stock. Heavy media is what bends them, so the media rule is the fix.",
  feedenc: "The wheel counts by reading marks. Anything that keeps the marks readable prevents the fault, and nothing else does.",
  pumpfail: "The pump is worked by cleaning cycles. Somebody running one every day is the cause, so the limit is the prevention.",
  ijfeed: "Rollers grip one paper surface well and another badly. Keeping the tray to one stock is what stops the misfeeds coming back with the next pallet."
};

/* =====================================================================
   The laptop track

   The other tracks ask what is wrong. This one also asks how deep it is,
   because on a laptop that is the difference between a bench job and half
   a day, and it is the number a technician has to say out loud before they
   start rather than after.
   ===================================================================== */
function lapTheoryQuestions(t) {
  const qs = [
    {
      id: "theory-cause", kind: "choice", shuffle: true,
      ask: "What is your theory of probable cause?",
      choices: () => TRACKS.laptop.faults.map((f) => f.part),
      answer: () => G.fault.part,
      why: () => G.fault.root + " " + G.fault.fixes
    },
    {
      id: "theory-evidence", kind: "choice", shuffle: true,
      ask: "And what is the evidence for it?",
      choices: () => TRACKS.laptop.faults.map((f) => f.evidence),
      answer: () => G.fault.evidence,
      why: () => "On a laptop the evidence also tells you how far in you are going, and that is what the customer is really asking about."
    }
  ];
  allQs = allQs.concat(renderQuestions(t.body, qs));
  return t;
}

function lapStepTest(t) {
  const l = G.laptop;

  const sp = el("div", "panel");
  sp.appendChild(el("h3", null, "Machine"));
  const sdl = el("dl", "kv");
  [["Model", l.model], ["Serial", l.serial], ["Age", l.ageMonths + " months"],
  ["Warranty", l.warranty ? "in warranty" : "expired at 24 months"],
  ["Memory", l.ramGb + "GB " + l.ramSpeed + " across " + l.slots + " slot" + (l.slots > 1 ? "s" : "")],
  ["Storage", l.ssdGb + "GB M.2"],
  ["Battery health", l.batteryHealth + "% over " + l.cycles + " cycles"],
  ["Service access", l.cover + ", " + l.teardown]].forEach(([k, v]) => {
    sdl.appendChild(el("dt", null, esc(k)));
    sdl.appendChild(el("dd", null, esc(v)));
  });
  sp.appendChild(sdl);
  t.body.appendChild(sp);

  /* The chassis, and how far in each part is. */
  t.body.appendChild(el("p", "step__hint",
    "<strong>Open it up.</strong> Every part in here is at a different depth, and the depth is the quote. " +
    "A memory module is four minutes behind one cover; a keyboard on the same machine is the whole thing " +
    "stripped to the top case."));
  const bench = partBench(t, laptopModel(G, LAPTOP_PARTS));

  t.body.appendChild(el("p", "step__hint",
    "<strong>One test at a time.</strong> A laptop is slow to open and slower to close, so the tests worth " +
    "running are the ones you can do before it comes apart."));

  const box = el("div", "tests");
  const benchHint = hintBox(box);
  const ran = {};
  let benchClean = true;
  const timeSpent = el("p", "count", "Bench time spent: 0 minutes");
  const fb = el("p", "fb"); fb.style.display = "none";
  const tests = laptopTests(G, (a) => ordShuffle("laptest", a));
  tests.forEach((tt) => {
    const card = el("div", "test");
    const out = el("span", "test__out"); out.hidden = true;
    const run = el("button", "btn", "Run"); run.type = "button";
    run.addEventListener("click", () => {
      ran[tt.key] = true;
      out.hidden = false; out.textContent = tt.result; run.disabled = true;
      const spent = tests.filter((x) => ran[x.key]).reduce((a, x) => a + x.mins, 0);
      timeSpent.textContent = "Bench time spent: " + spent + " minutes";
      /* Running a test that cannot isolate anything is not a wrong answer,
         it is wasted bench time — so it counts the same way. */
      if (tt.isolating) benchHint.right(); else benchHint.wrong(CONTROL_HINTS.bench);
      if (tt.isolating) {
        const clean = tests.filter((x) => ran[x.key] && !x.isolating).length === 0;
        /* FINDING IT IS THE PASS. HOW TIDILY IS THE FEEDBACK.

           This used to be `graded["test-isolate"] = clean`, and `clean` is
           false the moment a student opens any other tool first. The button
           then disables, so the flag could never become true again — and
           step four gates on `=== true`. A student who explored one wrong
           tool before finding the right one had the rest of the ticket
           locked against them permanently, with a lock message telling them
           to finish a step they had just finished.

           Trying the wrong instrument first is what diagnosis looks like.
           It costs bench time, it is said plainly in the feedback below, and
           it does not take the ticket away. */
        graded["test-isolate"] = true;
        benchClean = clean;
        fb.style.display = "";
        fb.className = "fb " + (clean ? "fb--ok" : "fb--no");
        fb.innerHTML = (clean ? "Correct" : "Confirmed, eventually") + '<span class="fb__why">' +
          esc(clean
            ? "Straight to it in " + tt.mins + " minutes, and without taking the machine apart to find out."
            : "That is the isolating test, but you spent " + spent + " minutes getting there — and on a laptop most of that is screws.") +
          "</span>";
        updateScore();
      }
    });
    card.appendChild(el("span", "test__label", esc(tt.label)));
    card.appendChild(el("span", "test__mins", tt.mins + " min"));
    card.appendChild(run); card.appendChild(out);
    box.appendChild(card);
  });
  t.body.appendChild(box);
  t.body.appendChild(timeSpent);
  t.body.appendChild(fb);

  bench.askLocate();

  allQs = allQs.concat(renderQuestions(t.body, [
    {
      id: "test-part", kind: "choice", shuffle: true,
      ask: "Theory confirmed. What is actually wrong?",
      choices: () => TRACKS.laptop.faults.map((f) => f.part),
      answer: () => G.fault.part,
      why: () => G.fault.root + " " + G.fault.fixes
    },
    {
      id: "test-depth", kind: "choice", shuffle: true,
      ask: "Before you quote it — how far into the machine is that part?",
      note: "This is the number the customer actually cares about, and it is the one that gets guessed. " +
        "Getting it wrong by one level is the difference between a bench job and most of a day.",
      choices: () => ["Behind a single cover — minutes",
        "Behind the bottom cover — a short bench job",
        "Under the board or in the lid — most of an hour",
        "Stripped to the top case — the deep one"],
      answer: () => ({
        1: "Behind a single cover — minutes",
        2: "Behind the bottom cover — a short bench job",
        3: "Under the board or in the lid — most of an hour",
        4: "Stripped to the top case — the deep one"
      })[G.quote.depth],
      why: () => G.quote.band + " Around " + G.quote.mins + " minutes of labour on this chassis, which is what " +
        "goes on the quote before you pick up a screwdriver rather than after."
    }
  ]));
  return t;
}

/* =====================================================================
   The display track

   Two free tests settle almost all of this, and the whole track is built
   around making a student reach for them before they reach for a part.
   ===================================================================== */
function dispTheoryQuestions(t) {
  const qs = [
    {
      id: "theory-cause", kind: "choice", shuffle: true,
      ask: "What is your theory of probable cause?",
      choices: () => TRACKS.display.faults.map((f) => f.part),
      answer: () => G.fault.part,
      why: () => G.fault.root + " " + G.fault.fixes
    },
    {
      id: "theory-evidence", kind: "choice", shuffle: true,
      ask: "And what is the evidence for it?",
      choices: () => TRACKS.display.faults.map((f) => f.evidence),
      answer: () => G.fault.evidence,
      why: () => "Nearly every display fault is settled by a torch and a spare monitor. Neither costs anything and neither needs the machine opened."
    }
  ];
  allQs = allQs.concat(renderQuestions(t.body, qs));
  return t;
}

function dispStepTest(t) {
  const sc = G.screen;

  const sp = el("div", "panel");
  sp.appendChild(el("h3", null, "The display"));
  const sdl = el("dl", "kv");
  const rows = [["Device", sc.model], ["Type", sc.kind], ["Resolution", sc.res],
  ["Panel technology", sc.panelType], ["Age", sc.ageMonths + " months"]];
  if (sc.kind === "projector") {
    rows.push(["Lamp hours", sc.lampHours + " of " + sc.lampRated + " rated"]);
    rows.push(["Shuts down after", sc.shutdownMins + " minutes"]);
    rows.push(["Intake temperature at shutdown", sc.intakeC + "°C (limit " + sc.intakeLimit + "°C)"]);
  }
  rows.forEach(([k, v]) => {
    const dt = el("dt", null, esc(k)), dd = el("dd", null, esc(v));
    if (k === "Intake temperature at shutdown") { dt.setAttribute("data-bad", "1"); dd.setAttribute("data-bad", "1"); }
    sdl.appendChild(dt); sdl.appendChild(dd);
  });
  sp.appendChild(sdl);
  t.body.appendChild(sp);

  t.body.appendChild(holdKey("Hold to read: what the pixel words actually mean",
    PIXEL_FACTS));

  t.body.appendChild(el("p", "step__hint",
    "<strong>The two free tests come first.</strong> A torch against the screen tells you whether the image " +
    "is being made at all. A spare monitor tells you whether anything upstream of the panel is at fault. " +
    "Between them they halve the problem twice, and they cost nothing but the walk to the store cupboard."));

  const bench = partBench(t, displayModel(G, DISPLAY_PARTS));

  const box = el("div", "tests");
  const benchHint = hintBox(box);
  const ran = {};
  let benchClean = true;
  const timeSpent = el("p", "count", "Bench time spent: 0 minutes");
  const fb = el("p", "fb"); fb.style.display = "none";
  const tests = displayTests(G, (a) => ordShuffle("disptest", a));
  tests.forEach((tt) => {
    const card = el("div", "test");
    const out = el("span", "test__out"); out.hidden = true;
    const run = el("button", "btn", "Run"); run.type = "button";
    run.addEventListener("click", () => {
      ran[tt.key] = true;
      out.hidden = false; out.textContent = tt.result; run.disabled = true;
      const spent = tests.filter((x) => ran[x.key]).reduce((a, x) => a + x.mins, 0);
      timeSpent.textContent = "Bench time spent: " + spent + " minutes";
      /* Running a test that cannot isolate anything is not a wrong answer,
         it is wasted bench time — so it counts the same way. */
      if (tt.isolating) benchHint.right(); else benchHint.wrong(CONTROL_HINTS.bench);
      if (tt.isolating) {
        const clean = tests.filter((x) => ran[x.key] && !x.isolating).length === 0;
        /* FINDING IT IS THE PASS. HOW TIDILY IS THE FEEDBACK.

           This used to be `graded["test-isolate"] = clean`, and `clean` is
           false the moment a student opens any other tool first. The button
           then disables, so the flag could never become true again — and
           step four gates on `=== true`. A student who explored one wrong
           tool before finding the right one had the rest of the ticket
           locked against them permanently, with a lock message telling them
           to finish a step they had just finished.

           Trying the wrong instrument first is what diagnosis looks like.
           It costs bench time, it is said plainly in the feedback below, and
           it does not take the ticket away. */
        graded["test-isolate"] = true;
        benchClean = clean;
        fb.style.display = "";
        fb.className = "fb " + (clean ? "fb--ok" : "fb--no");
        fb.innerHTML = (clean ? "Correct" : "Confirmed, eventually") + '<span class="fb__why">' +
          esc(clean
            ? "Straight to it in " + tt.mins + " minutes, with a torch and a spare lead."
            : "That is the isolating test, but you spent " + spent + " minutes getting there" +
            (ran.reinstall ? " — including reinstalling a driver for a fault that was visible before the operating system loaded." : ".")) +
          "</span>";
        updateScore();
      }
    });
    card.appendChild(el("span", "test__label", esc(tt.label)));
    card.appendChild(el("span", "test__mins", tt.mins + " min"));
    card.appendChild(run); card.appendChild(out);
    box.appendChild(card);
  });
  t.body.appendChild(box);
  t.body.appendChild(timeSpent);
  t.body.appendChild(fb);

  bench.askLocate();

  allQs = allQs.concat(renderQuestions(t.body, [
    {
      id: "test-part", kind: "choice", shuffle: true,
      ask: "Theory confirmed. What is actually wrong?",
      choices: () => TRACKS.display.faults.map((f) => f.part),
      answer: () => G.fault.part,
      why: () => G.fault.root + " " + G.fault.fixes
    }
  ]));
  return t;
}

/* Step four on the display track is a single decision rather than a
   procedure — these are swap-the-module jobs, and the judgement is whether
   the part is worth fitting at all. */
function dispStepPlan(t) {
  t.body.appendChild(el("p", "step__hint",
    "<strong>Now decide what actually gets done.</strong> On a bonded assembly the panel and the backlight " +
    "come as one part, which changes the price and sometimes the answer. A display that costs more to repair " +
    "than to replace is a conversation, not a repair."));

  const qs = [
    {
      id: "plan-action", kind: "choice", shuffle: true,
      ask: "What is the action?",
      choices: () => TRACKS.display.faults.map((f) => f.fixes),
      answer: () => G.fault.fixes,
      why: () => G.fault.root + " " + G.fault.wrongWhy
    }
  ];
  allQs = allQs.concat(renderQuestions(t.body, qs));
  return t;
}

/* =====================================================================
   The Windows and OS track

   The only track with no bench and no model, because an operating system
   is not a thing in a room and a 3D box with WINDOWS written on it would
   be decoration. What replaces the bench is the tools: eleven of them,
   one of which answers the question in front of you and ten of which are
   honest work that tells you nothing.

   Step four is an escalation ladder rather than a procedure. There is
   always a bigger hammer; the graded judgement is reaching for the
   smallest thing that could work and stopping when it does.
   ===================================================================== */

/* =====================================================================
   The printer networking track

   Step four here has three parts rather than two, and the third is the
   one that matters longest: after naming the link and doing the fix, the
   student specifies how this device should have been deployed. The fix
   closes the ticket; the deployment stops the ticket.
   ===================================================================== */
function pnetTheoryQuestions(t) {
  const qs = [
    {
      id: "theory-cause", kind: "choice", shuffle: true,
      ask: "What is your theory of probable cause?",
      choices: () => TRACKS.printnet.faults.map((f) => f.part),
      answer: () => G.fault.part,
      why: () => G.fault.root + " " + G.fault.fixes
    },
    {
      id: "theory-evidence", kind: "choice", shuffle: true,
      ask: "And what is the evidence for it?",
      choices: () => TRACKS.printnet.faults.map((f) => f.evidence),
      answer: () => G.fault.evidence,
      why: () => "Every one of these is a statement about how far the job got. That is the only question worth " +
        "asking on a printer call, and the caller will never answer it for you."
    }
  ];
  allQs = allQs.concat(renderQuestions(t.body, qs));
  return t;
}

function pnetStepTest(t) {
  const d = G.printnet;
  const panel = (title, rows, note) => {
    const p = el("div", "panel");
    p.appendChild(el("h3", null, title));
    const dl = el("dl", "kv");
    rows.forEach((r) => {
      const dt = el("dt", null, esc(r.k)), dd = el("dd", null, esc(r.v));
      if (r.bad) { dt.setAttribute("data-bad", "1"); dd.setAttribute("data-bad", "1"); }
      dl.appendChild(dt); dl.appendChild(dd);
    });
    p.appendChild(dl);
    if (note) p.appendChild(el("p", "count", note));
    t.body.appendChild(p);
  };

  panel("The device", pnetDeviceRows(G),
    "A device that prints its own configuration page has a working engine, working toner, a clear paper " +
    "path and a working formatter. Everything left is between it and the user.");
  panel("The user's workstation", pnetStationRows(G));
  panel("The print server", pnetServerRows(G));
  panel("Scan and copy services", pnetScanRows(G),
    "Copying uses the scanner and nothing else. If copying works, the glass, the lamp and the feeder are all fine.");

  t.body.appendChild(holdKey("Hold to read: the seven places a job can stop, and what the configuration page proves",
    PRINTNET_FACTS));

  t.body.appendChild(el("p", "step__hint",
    "<strong>Ask how far the job got, not whether the printer is working.</strong> Every one of these panels " +
    "answers that question for one link in the chain, and the caller has described all seven of them with the " +
    "same six words."));

  const bench = partBench(t, printnetModel(G, PNETMOD));

  const box = el("div", "tests");
  const benchHint = hintBox(box);
  const ran = {};
  let benchClean = true;
  const timeSpent = el("p", "count", "Time spent: 0 minutes");
  const fb = el("p", "fb"); fb.style.display = "none";
  const tests = printnetTests(G, (x) => ordShuffle("pnettest", x));
  tests.forEach((tt) => {
    const card = el("div", "test");
    const out = el("span", "test__out"); out.hidden = true;
    const run = el("button", "btn", "Run"); run.type = "button";
    run.addEventListener("click", () => {
      ran[tt.key] = true;
      out.hidden = false; out.textContent = tt.result; run.disabled = true;
      const spent = tests.filter((x) => ran[x.key]).reduce((acc, x) => acc + x.mins, 0);
      timeSpent.textContent = "Time spent: " + spent + " minutes";
      if (tt.isolating) benchHint.right(); else benchHint.wrong(CONTROL_HINTS.bench);
      if (tt.isolating) {
        const clean = tests.filter((x) => ran[x.key] && !x.isolating).length === 0;
        /* FINDING IT IS THE PASS. HOW TIDILY IS THE FEEDBACK.

           This used to be `graded["test-isolate"] = clean`, and `clean` is
           false the moment a student opens any other tool first. The button
           then disables, so the flag could never become true again — and
           step four gates on `=== true`. A student who explored one wrong
           tool before finding the right one had the rest of the ticket
           locked against them permanently, with a lock message telling them
           to finish a step they had just finished.

           Trying the wrong instrument first is what diagnosis looks like.
           It costs bench time, it is said plainly in the feedback below, and
           it does not take the ticket away. */
        graded["test-isolate"] = true;
        benchClean = clean;
        fb.style.display = "";
        fb.className = "fb " + (clean ? "fb--ok" : "fb--no");
        fb.innerHTML = (clean ? "Correct" : "Confirmed, eventually") + '<span class="fb__why">' +
          esc(clean
            ? "Straight to it in " + tt.mins + " minutes, by finding out how far the job got."
            : "That is the test that settles it, but you spent " + spent + " minutes getting there" +
            (ran.reinstall
              ? " — including reinstalling a printer, which reinstalls the same driver pointing at the same place."
              : ".")) +
          "</span>";
        updateScore();
      }
    });
    card.appendChild(el("span", "test__label", esc(tt.label)));
    card.appendChild(el("span", "test__mins", tt.mins + " min"));
    card.appendChild(run); card.appendChild(out);
    box.appendChild(card);
  });
  t.body.appendChild(box);
  t.body.appendChild(timeSpent);
  t.body.appendChild(fb);

  bench.askLocate();

  allQs = allQs.concat(renderQuestions(t.body, [
    {
      id: "test-part", kind: "choice", shuffle: true,
      ask: "Theory confirmed. What is actually wrong?",
      choices: () => TRACKS.printnet.faults.map((f) => f.part),
      answer: () => G.fault.part,
      why: () => G.fault.root + " " + G.fault.fixes
    }
  ]));
  return t;
}

function pnetStepPlan(t) {
  t.body.appendChild(el("p", "step__hint",
    "<strong>Name the link first.</strong> A printer call is a chain, and every fix on this track belongs to " +
    "exactly one part of it. Saying which one out loud before you act is what stops an afternoon of reinstalling " +
    "drivers for a device whose address moved."));

  /* ---- which link ---- */
  const lp = el("div", "panel");
  lp.appendChild(el("h3", null, "Where in the chain is it?"));
  const llist = el("div", "pbtnlist");
  const lbtns = {};
  let lChosen = null;
  LINK_OPTIONS.forEach((o) => {
    const b = el("button", "pbtn", esc(o.label));
    b.type = "button";
    b.setAttribute("aria-pressed", "false");
    b.addEventListener("click", () => {
      lChosen = o.key;
      Object.keys(lbtns).forEach((k) => lbtns[k].setAttribute("aria-pressed", k === o.key ? "true" : "false"));
    });
    lbtns[o.key] = b;
    llist.appendChild(b);
  });
  lp.appendChild(llist);
  const lrow = el("div", "q__row");
  const lBtn = el("button", "btn", "Name the link");
  lBtn.type = "button";
  lrow.appendChild(lBtn);
  lp.appendChild(lrow);
  const lFb = el("p", "fb"); lFb.style.display = "none";
  lp.appendChild(lFb);
  const lHints = hintBox(lp);
  t.body.appendChild(lp);

  let lRevealed = false, lBeneath = null;
  lBtn.addEventListener("click", () => {
    if (!lChosen) {
      lFb.style.display = ""; lFb.className = "fb";
      lFb.textContent = "Pick one of the four first.";
      return;
    }
    lRevealed = false; lBeneath = null;
    const ok = lChosen === G.link;
    graded["plan-link"] = ok;
    lFb.style.display = "";
    lFb.className = "fb " + (ok ? "fb--ok" : "fb--no");
    lFb.innerHTML = (ok ? "Correct" : "Not that link") +
      '<span class="fb__why">' + esc(linkWhy(G.fault, lChosen)) + "</span>";
    if (ok) lHints.right(); else lHints.wrong(CONTROL_HINTS.printlink);
    updateScore();
  });
  allQs.push({
    id: "plan-link",
    _reveal: () => {
      if (!lRevealed) lBeneath = { html: lFb.innerHTML, cls: lFb.className, disp: lFb.style.display };
      lRevealed = true;
      if (lbtns[G.link]) lbtns[G.link].classList.add("pbtn--answer");
      lFb.style.display = ""; lFb.className = "fb fb--ok";
      lFb.innerHTML = "Answer: " + esc(LINK_OPTIONS.filter((o) => o.key === G.link)[0].label) +
        '<span class="fb__why">' + esc(linkWhy(G.fault, G.link)) + "</span>";
    },
    _unreveal: () => {
      if (!lRevealed) return;
      lRevealed = false;
      if (lbtns[G.link]) lbtns[G.link].classList.remove("pbtn--answer");
      lFb.innerHTML = lBeneath ? lBeneath.html : "";
      lFb.className = lBeneath ? lBeneath.cls : "fb";
      lFb.style.display = lBeneath ? lBeneath.disp : "none";
      lBeneath = null;
    }
  });

  allQs = allQs.concat(renderQuestions(t.body, [
    {
      id: "plan-action", kind: "choice", shuffle: true,
      ask: "And what actually gets done today?",
      choices: () => PRINTNET_ACTIONS.map((x) => x.label),
      answer: () => PRINTNET_ACTIONS.filter((x) => x.key === G.action)[0].label,
      why: () => G.fault.root + " " + G.fault.wrongWhy
    }
  ]));

  /* ---- the deployment ---- */
  t.body.appendChild(el("p", "step__hint",
    "<strong>Now the part that stops it coming back.</strong> Say how this device should be deployed at this " +
    "site. Two of these answers are the same on every ticket on this track and two of them depend on where you " +
    "are standing &mdash; and one option in the list is never right anywhere, which is why half these calls exist."));

  const dp = el("div", "panel");
  dp.appendChild(el("h3", null, "How this device should be deployed"));
  dp.appendChild(el("p", "count",
    esc(G.printnet.deviceKind + " at " + G.org.name + " — " + G.tier.label.toLowerCase() +
      ", " + G.tier.staff + ", " + (G.printnet.server.indexOf("None") === 0
        ? "no print server on site" : "print server on site"))));

  const grid = el("div", "pinout pinout--wide");
  const picks = {};
  DEPLOY_FIELDS.forEach((fld) => {
    const cell = el("div", "pinout__slot");
    const id = "dep-" + fld.key + "-" + Math.random().toString(36).slice(2, 7);
    const lab = el("label", "pinout__n", fld.label);
    lab.setAttribute("for", id);
    const sel = el("select", "ans");
    sel.id = id;
    sel.innerHTML = '<option value="">— select —</option>' +
      ordShuffle("dep" + fld.key, fld.options.slice())
        .map((o) => `<option value="${esc(o)}">${esc(o)}</option>`).join("");
    cell.appendChild(lab); cell.appendChild(sel);
    grid.appendChild(cell);
    picks[fld.key] = sel;
  });
  dp.appendChild(grid);

  const drow = el("div", "q__row");
  const dBtn = el("button", "btn", "Check the deployment");
  dBtn.type = "button";
  drow.appendChild(dBtn);
  dp.appendChild(drow);
  const dFb = el("p", "fb"); dFb.style.display = "none";
  dp.appendChild(dFb);
  const dHints = hintBox(dp);
  t.body.appendChild(dp);

  let dRevealed = false, dBeneath = null;
  dBtn.addEventListener("click", () => {
    const want = correctDeploy(G);
    const got = {};
    let blank = false;
    DEPLOY_FIELDS.forEach((f) => { got[f.key] = picks[f.key].value; if (!got[f.key]) blank = true; });
    if (blank) {
      dFb.style.display = ""; dFb.className = "fb";
      dFb.textContent = "Answer all four before you check it.";
      return;
    }
    dRevealed = false; dBeneath = null;
    const wrong = DEPLOY_FIELDS.filter((f) => got[f.key] !== want[f.key]);
    const ok = wrong.length === 0;
    graded["plan-deploy"] = ok;
    dFb.style.display = "";
    dFb.className = "fb " + (ok ? "fb--ok" : "fb--no");
    dFb.innerHTML = (ok ? "Correct" : "Not this deployment") + '<span class="fb__why">' +
      esc(ok
        ? DEPLOY_FIELDS.map((f) => deployWhy(G, f.key, want[f.key])).join(" ")
        /* Name the fields that are wrong and say why THOSE choices are
           wrong, without naming the right ones — the guided hints are what
           walk somebody the rest of the way. */
        : wrong.length + " of the 4 are not right for this site: " +
          wrong.map((f) => f.label.toLowerCase()).join(", ") + ". " +
          deployWhy(G, wrong[0].key, got[wrong[0].key])) +
      "</span>";
    if (ok) dHints.right(); else dHints.wrong(CONTROL_HINTS.deploy);
    updateScore();
  });
  allQs.push({
    id: "plan-deploy",
    _reveal: () => {
      if (!dRevealed) dBeneath = { html: dFb.innerHTML, cls: dFb.className, disp: dFb.style.display };
      dRevealed = true;
      const want = correctDeploy(G);
      DEPLOY_FIELDS.forEach((f) => { picks[f.key].value = want[f.key]; });
      dFb.style.display = ""; dFb.className = "fb fb--ok";
      dFb.innerHTML = "Answer: as filled in above" + '<span class="fb__why">' +
        esc(DEPLOY_FIELDS.map((f) => deployWhy(G, f.key, want[f.key])).join(" ")) + "</span>";
    },
    _unreveal: () => {
      if (!dRevealed) return;
      dRevealed = false;
      DEPLOY_FIELDS.forEach((f) => { picks[f.key].value = ""; });
      dFb.innerHTML = dBeneath ? dBeneath.html : "";
      dFb.className = dBeneath ? dBeneath.cls : "fb";
      dFb.style.display = dBeneath ? dBeneath.disp : "none";
      dBeneath = null;
    }
  });
  return t;
}

/* =====================================================================
   The RAID and storage track

   Step three carries two computed answers nothing else in the build asks
   for: what this array's usable capacity actually is, and how many more
   failures it can take right now. Both are derived from the level and the
   member list, so neither can be memorised and both are the arithmetic a
   technician does in their head standing in front of a beeping server.

   Step four asks the question the whole track is about before it asks what
   to do: is the data intact, or is it already gone?
   ===================================================================== */
function raidTheoryQuestions(t) {
  const qs = [
    {
      id: "theory-cause", kind: "choice", shuffle: true,
      ask: "What is your theory of probable cause?",
      choices: () => TRACKS.raid.faults.map((f) => f.part),
      answer: () => G.fault.part,
      why: () => G.fault.root + " " + G.fault.fixes
    },
    {
      id: "theory-evidence", kind: "choice", shuffle: true,
      ask: "And what is the evidence for it?",
      choices: () => TRACKS.raid.faults.map((f) => f.evidence),
      answer: () => G.fault.evidence,
      why: () => "On an array the evidence is a member list read against the level's own tolerance. Everything " +
        "that matters on this track is on one screen, and reading it correctly is the difference between a " +
        "rebuild and a restore."
    }
  ];
  allQs = allQs.concat(renderQuestions(t.body, qs));
  return t;
}

function raidStepTest(t) {
  const a = G.array;

  /* ---- the array ---- */
  const ap = el("div", "panel");
  ap.appendChild(el("h3", null, "Array status"));
  const adl = el("dl", "kv");
  arrayRows(G).forEach((r) => {
    const dt = el("dt", null, esc(r.k)), dd = el("dd", null, esc(r.v));
    if (r.bad) { dt.setAttribute("data-bad", "1"); dd.setAttribute("data-bad", "1"); }
    adl.appendChild(dt); adl.appendChild(dd);
  });
  ap.appendChild(adl);
  t.body.appendChild(ap);

  /* ---- the members ---- */
  const dp = el("div", "panel");
  dp.appendChild(el("h3", null, "Members and disks"));
  const drows = diskRows(G);
  drows.forEach((r) => { r._bad = r.bad; });
  dp.appendChild(table(["Slot", "Role", "Capacity", "State", "Realloc", "Medium err", "Hours"], drows,
    (r) => `<td>${r.slot}</td><td>${esc(r.role)}</td><td>${esc(r.cap)}</td>` +
      `<td>${esc(r.state)}</td><td>${r.reall}</td><td>${r.medium}</td><td>${r.hours.toLocaleString()}</td>`));
  dp.appendChild(el("p", "count",
    "The state column is the controller's own word for each disk. What that word means for this array " +
    "depends entirely on the level above it."));
  t.body.appendChild(dp);

  /* ---- the controller ---- */
  const cp = el("div", "panel");
  cp.appendChild(el("h3", null, "Controller"));
  const cdl = el("dl", "kv");
  controllerRows(G).forEach((r) => {
    const dt = el("dt", null, esc(r.k)), dd = el("dd", null, esc(r.v));
    if (r.bad) { dt.setAttribute("data-bad", "1"); dd.setAttribute("data-bad", "1"); }
    cdl.appendChild(dt); cdl.appendChild(dd);
  });
  cp.appendChild(cdl);
  t.body.appendChild(cp);

  /* ---- the backup, which is not part of the array ---- */
  const bp = el("div", "panel");
  bp.appendChild(el("h3", null, "Backup"));
  const bdl = el("dl", "kv");
  backupRows(G).forEach((r) => {
    const dt = el("dt", null, esc(r.k)), dd = el("dd", null, esc(r.v));
    if (r.bad) { dt.setAttribute("data-bad", "1"); dd.setAttribute("data-bad", "1"); }
    bdl.appendChild(dt); bdl.appendChild(dd);
  });
  bp.appendChild(bdl);
  bp.appendChild(el("p", "count",
    "This panel is on every ticket on this track, whatever the fault, because on this track it is always " +
    "relevant and it is never part of the array."));
  t.body.appendChild(bp);

  t.body.appendChild(holdKey("Hold to read: what each level costs, and why the rebuild is the dangerous part",
    RAID_FACTS));

  t.body.appendChild(el("p", "step__hint",
    "<strong>Do the arithmetic before you touch anything.</strong> The level tells you how many failures the " +
    "array was built to survive. The member list tells you how many of those you have already spent. The " +
    "difference between those two numbers is the only thing that decides whether this is a rebuild or a restore."));

  const bench = partBench(t, raidModel(G, RAIDMOD));

  const box = el("div", "tests");
  const benchHint = hintBox(box);
  const ran = {};
  let benchClean = true;
  const timeSpent = el("p", "count", "Time spent: 0 minutes");
  const fb = el("p", "fb"); fb.style.display = "none";
  const tests = raidTests(G, (x) => ordShuffle("raidtest", x));
  tests.forEach((tt) => {
    const card = el("div", "test");
    const out = el("span", "test__out"); out.hidden = true;
    const run = el("button", "btn", "Run"); run.type = "button";
    run.addEventListener("click", () => {
      ran[tt.key] = true;
      out.hidden = false; out.textContent = tt.result; run.disabled = true;
      const spent = tests.filter((x) => ran[x.key]).reduce((acc, x) => acc + x.mins, 0);
      timeSpent.textContent = "Time spent: " + spent + " minutes";
      if (tt.isolating) benchHint.right(); else benchHint.wrong(CONTROL_HINTS.bench);
      if (tt.isolating) {
        const clean = tests.filter((x) => ran[x.key] && !x.isolating).length === 0;
        /* FINDING IT IS THE PASS. HOW TIDILY IS THE FEEDBACK.

           This used to be `graded["test-isolate"] = clean`, and `clean` is
           false the moment a student opens any other tool first. The button
           then disables, so the flag could never become true again — and
           step four gates on `=== true`. A student who explored one wrong
           tool before finding the right one had the rest of the ticket
           locked against them permanently, with a lock message telling them
           to finish a step they had just finished.

           Trying the wrong instrument first is what diagnosis looks like.
           It costs bench time, it is said plainly in the feedback below, and
           it does not take the ticket away. */
        graded["test-isolate"] = true;
        benchClean = clean;
        fb.style.display = "";
        fb.className = "fb " + (clean ? "fb--ok" : "fb--no");
        fb.innerHTML = (clean ? "Correct" : "Confirmed, eventually") + '<span class="fb__why">' +
          esc(clean
            ? "Straight to it in " + tt.mins + " minutes, off the screen that was already in front of you."
            : "That is the test that settles it, but you spent " + spent + " minutes getting there" +
            (ran.reseat
              ? " — including taking every member of a live array out and putting it back, which on a degraded array is a risk taken for nothing."
              : ".")) +
          "</span>";
        updateScore();
      }
    });
    card.appendChild(el("span", "test__label", esc(tt.label)));
    card.appendChild(el("span", "test__mins", tt.mins + " min"));
    card.appendChild(run); card.appendChild(out);
    box.appendChild(card);
  });
  t.body.appendChild(box);
  t.body.appendChild(timeSpent);
  t.body.appendChild(fb);

  bench.askLocate();

  /* The two computed answers. Both are shuffled against distractors built
     from the same array, so a student who guesses the shape of the number
     rather than working it out gets it wrong. */
  const mem = a.disks.filter((d) => d.role === "member");
  const cap = Math.min.apply(null, mem.map((d) => d.capGb));
  const usable = usableCapacity(a);
  const gb = (n) => (n >= 1000 ? (n / 1000).toFixed(n % 1000 ? 1 : 0) + " TB" : n + " GB");

  allQs = allQs.concat(renderQuestions(t.body, [
    {
      id: "test-part", kind: "choice", shuffle: true,
      ask: "Theory confirmed. What is actually wrong?",
      choices: () => TRACKS.raid.faults.map((f) => f.part),
      answer: () => G.fault.part,
      why: () => G.fault.root + " " + G.fault.fixes
    },
    {
      id: "test-usable", kind: "choice", shuffle: true,
      ask: "How much usable capacity does this array have?",
      note: mem.length + " members of " + cap + "GB each, at " + a.levelLabel +
        ". Work it out from the level rather than from the total.",
      /* The distractors are what the OTHER levels would give you from the
         same disks, which is exactly the confusion being tested. Deduped
         against each other, because on RAID 0 the usable capacity and the
         total of every disk are the same number and offering both put the
         identical option in the list twice. */
      choices: () => {
        const opts = [gb(usable)];
        const add = (v) => { if (opts.indexOf(v) === -1) opts.push(v); };
        add(gb(mem.length * cap));
        ["5", "6", "10", "1"].forEach((k) => {
          const L = LEVELS[k];
          if (mem.length >= L.minMembers) add(gb(Math.round(L.usable(mem.length, cap))));
        });
        /* Guarantee four distinct options even on a small array where the
           levels happen to agree with each other. */
        let extra = 1;
        while (opts.length < 4) { add(gb(cap * (mem.length + extra))); extra++; }
        return opts.slice(0, 4);
      },
      answer: () => gb(usable),
      why: () => a.levelLabel + " with " + mem.length + " members of " + cap + "GB gives " + gb(usable) +
        ". " + LEVELS[a.level].note + " The total of every disk in the box is a number that never appears " +
        "on any level except RAID 0."
    },
    {
      id: "test-tolerance", kind: "choice", shuffle: true,
      ask: "In the state it is in right now, how many more failures can this array survive?",
      note: "Not what the level tolerates on paper — what is left of that after the members you can see.",
      choices: () => TOLERANCE_CHOICES,
      answer: () => toleranceAnswer(a),
      why: () => {
        const r = remainingTolerance(a);
        return a.levelLabel + " tolerates " + r.total + " failure" + (r.total === 1 ? "" : "s") +
          ", and " + (r.lost === 0 ? "none of that has been spent" : r.lost + " of that has been spent") +
          ". " + (r.offline
            ? "More members have gone than the level can carry, which is why the array is offline and why nothing you do to it reconstructs the data."
            : r.left === 0
              ? "That leaves nothing. A degraded array is a working array with a fault tolerance of zero, and that is the whole reason this is today's job."
              : "That leaves " + r.left + ", which buys you time and is not a reason to take any.");
      },
      hints: () => [
        "Two numbers make this, and they are on two different panels. One is a property of the level; the " +
          "other is a property of what the member list says right now.",
        "Start from the level's own tolerance — the reference key on this step spells out what each one is. " +
          "Then count how many members are no longer contributing to it.",
        "Subtract the second from the first, and note that a member reporting Missing counts exactly the same " +
          "as one reporting Failed. If the answer comes out below zero, the array is not degraded — it is gone."
      ]
    }
  ]));
  return t;
}

/* Step four. The classification comes first, because on this track the
   action follows from it completely and getting it the wrong way round is
   how somebody tells a customer their data is gone when it is not. */
function raidStepPlan(t) {
  t.body.appendChild(el("p", "step__hint",
    "<strong>First: is the data still there?</strong> Everything you do next follows from this and nothing " +
    "else does. A degraded array gets a disk and a rebuild. An offline one gets a restore and a conversation " +
    "about the date on the backup. Saying the second when you meant the first is the worst call on this track."));

  const cp = el("div", "panel");
  cp.appendChild(el("h3", null, "What kind of fault is this?"));
  cp.appendChild(el("p", "count",
    "Read it off the member list and the level, not off how bad the phone call sounded."));
  const clist = el("div", "pbtnlist");
  const cbtns = {};
  let cChosen = null;
  CLASS_OPTIONS.forEach((o) => {
    const b = el("button", "pbtn", esc(o.label));
    b.type = "button";
    b.setAttribute("aria-pressed", "false");
    b.addEventListener("click", () => {
      cChosen = o.key;
      Object.keys(cbtns).forEach((k) => cbtns[k].setAttribute("aria-pressed", k === o.key ? "true" : "false"));
    });
    cbtns[o.key] = b;
    clist.appendChild(b);
  });
  cp.appendChild(clist);
  const crow = el("div", "q__row");
  const cBtn = el("button", "btn", "Make the call");
  cBtn.type = "button";
  crow.appendChild(cBtn);
  cp.appendChild(crow);
  const cFb = el("p", "fb"); cFb.style.display = "none";
  cp.appendChild(cFb);
  const cHints = hintBox(cp);
  t.body.appendChild(cp);

  let cRevealed = false, cBeneath = null;
  cBtn.addEventListener("click", () => {
    if (!cChosen) {
      cFb.style.display = ""; cFb.className = "fb";
      cFb.textContent = "Pick one of the four first.";
      return;
    }
    cRevealed = false; cBeneath = null;
    const ok = cChosen === G.class;
    graded["plan-class"] = ok;
    cFb.style.display = "";
    cFb.className = "fb " + (ok ? "fb--ok" : "fb--no");
    cFb.innerHTML = (ok ? "Correct" : "Not that call") +
      '<span class="fb__why">' + esc(classWhy(G.fault, cChosen)) + "</span>";
    if (ok) cHints.right(); else cHints.wrong(CONTROL_HINTS.raidclass);
    updateScore();
  });
  allQs.push({
    id: "plan-class",
    _reveal: () => {
      if (!cRevealed) cBeneath = { html: cFb.innerHTML, cls: cFb.className, disp: cFb.style.display };
      cRevealed = true;
      if (cbtns[G.class]) cbtns[G.class].classList.add("pbtn--answer");
      cFb.style.display = ""; cFb.className = "fb fb--ok";
      cFb.innerHTML = "Answer: " + esc(CLASS_OPTIONS.filter((o) => o.key === G.class)[0].label) +
        '<span class="fb__why">' + esc(classWhy(G.fault, G.class)) + "</span>";
    },
    _unreveal: () => {
      if (!cRevealed) return;
      cRevealed = false;
      if (cbtns[G.class]) cbtns[G.class].classList.remove("pbtn--answer");
      cFb.innerHTML = cBeneath ? cBeneath.html : "";
      cFb.className = cBeneath ? cBeneath.cls : "fb";
      cFb.style.display = cBeneath ? cBeneath.disp : "none";
      cBeneath = null;
    }
  });

  t.body.appendChild(el("p", "step__hint",
    "<strong>Now the action.</strong> One of the options below is the only irreversible thing on this track. " +
    "It sits on a controller screen next to the option that saves the array, it is one word long, and choosing " +
    "it in the wrong place destroys data that was about to come back on its own."));

  allQs = allQs.concat(renderQuestions(t.body, [
    {
      id: "plan-action", kind: "choice", shuffle: true,
      ask: "What actually gets done?",
      choices: () => RAID_ACTIONS.map((x) => x.label),
      answer: () => RAID_ACTIONS.filter((x) => x.key === G.action)[0].label,
      /* Explains the cause and the reflex to rule out, the way every other
         action question on this build does — not the fix text, which would
         hand over the option a wrong answer is still looking for. */
      why: () => G.fault.root + " " + G.fault.wrongWhy
    }
  ]));
  return t;
}

/* =====================================================================
   The power and safety track

   Every instrument here shows a reading beside its published limit rather
   than a verdict, because applying the tolerance is the exercise. A rail
   at 11.2V is not flagged as bad — it is shown next to "11.40 to 12.60"
   and the student does the comparison, which is what they will be doing
   with a meter in their hand.

   Step four gains a control nothing else in the build has: the decision
   about whether the job is yours at all. Two of these ten faults are
   licensed electrical work, and a technician who is sure they could sort
   it out is exactly the technician this page exists to slow down.
   ===================================================================== */
function pwrTheoryQuestions(t) {
  const qs = [
    {
      id: "theory-cause", kind: "choice", shuffle: true,
      ask: "What is your theory of probable cause?",
      choices: () => TRACKS.power.faults.map((f) => f.part),
      answer: () => G.fault.part,
      why: () => G.fault.root + " " + G.fault.fixes
    },
    {
      id: "theory-evidence", kind: "choice", shuffle: true,
      ask: "And what is the evidence for it?",
      choices: () => TRACKS.power.faults.map((f) => f.evidence),
      answer: () => G.fault.evidence,
      why: () => "On this track the evidence is always a number against a published limit. There is no judgement " +
        "about whether a reading looks healthy — it is inside the specification or it is outside it."
    }
  ];
  allQs = allQs.concat(renderQuestions(t.body, qs));
  return t;
}

function pwrStepTest(t) {
  const P = G.power;

  /* ---- the rails, each beside its own limit ---- */
  const rp = el("div", "panel");
  rp.appendChild(el("h3", null, "Multimeter at the 24-pin connector"));
  const rr = railRows(G);
  rr.forEach((r) => { r._bad = r.bad; });
  rp.appendChild(table(["Rail", "Permitted range", "At idle", "Under load"], rr,
    (r) => `<td>${esc(r.label)}</td>` +
      `<td>${r.ms ? r.limits.lo + "–" + r.limits.hi + " ms"
        : r.limits.lo.toFixed(2) + " to " + r.limits.hi.toFixed(2) + " V"}</td>` +
      `<td>${r.idle === null ? "never asserts" : r.ms ? r.idle + " ms" : r.idle.toFixed(2) + " V"}</td>` +
      `<td>${r.load === null ? "never asserts" : r.ms ? r.load + " ms" : r.load.toFixed(2) + " V"}</td>`));
  rp.appendChild(el("p", "count",
    "The range is the specification, not a guideline. Compare each reading against the column beside it — " +
    "nothing on this page has done that comparison for you."));
  t.body.appendChild(rp);

  /* ---- the outlet ---- */
  const op = el("div", "panel");
  op.appendChild(el("h3", null, "At the wall outlet"));
  const odl = el("dl", "kv");
  outletRows(G).forEach((r) => {
    const dt = el("dt", null, esc(r.k)), dd = el("dd", null, esc(r.v));
    if (r.bad) { dt.setAttribute("data-bad", "1"); dd.setAttribute("data-bad", "1"); }
    odl.appendChild(dt); odl.appendChild(dd);
  });
  op.appendChild(odl);
  t.body.appendChild(op);

  /* ---- the UPS ---- */
  const up = el("div", "panel");
  up.appendChild(el("h3", null, "UPS front panel"));
  const udl = el("dl", "kv");
  upsRows(G).forEach((r) => {
    const dt = el("dt", null, esc(r.k)), dd = el("dd", null, esc(r.v));
    if (r.bad) { dt.setAttribute("data-bad", "1"); dd.setAttribute("data-bad", "1"); }
    udl.appendChild(dt); udl.appendChild(dd);
  });
  up.appendChild(udl);
  t.body.appendChild(up);

  /* ---- the circuit, and the arithmetic ---- */
  const cp = el("div", "panel");
  cp.appendChild(el("h3", null, "What is on this circuit"));
  const crows = circuitRows(G);
  cp.appendChild(table(["On the circuit", "Draw"], crows,
    (r) => `<td>${esc(r.name)}</td><td>${r.amps.toFixed(1)} A</td>`));
  const tot = circuitTotals(G);
  const tdl = el("dl", "kv");
  [["Measured total", tot.total.toFixed(1) + " A"],
  ["Breaker", tot.breaker + " A"],
  ["Continuous limit (80% of the breaker)", tot.limit.toFixed(1) + " A"]].forEach(([k, v], i) => {
    const dt = el("dt", null, esc(k)), dd = el("dd", null, esc(v));
    if (tot.over && i === 0) { dt.setAttribute("data-bad", "1"); dd.setAttribute("data-bad", "1"); }
    tdl.appendChild(dt); tdl.appendChild(dd);
  });
  cp.appendChild(tdl);
  t.body.appendChild(cp);

  /* ---- the mains log ---- */
  const mp = el("div", "panel");
  mp.appendChild(el("h3", null, "Input voltage, logged hourly"));
  const mdl = el("dl", "kv");
  mainsRows(G).forEach((r) => {
    const dt = el("dt", null, esc(r.k)), dd = el("dd", null, esc(r.v));
    if (r.bad) { dt.setAttribute("data-bad", "1"); dd.setAttribute("data-bad", "1"); }
    mdl.appendChild(dt); mdl.appendChild(dd);
  });
  mp.appendChild(mdl);
  mp.appendChild(el("p", "count",
    "Equipment is built to ride out ±10% of nominal, which is 108V to 132V here."));
  t.body.appendChild(mp);

  t.body.appendChild(holdKey("Hold to read: tolerances, the 80% rule, and what a breaker is for", POWER_FACTS));

  t.body.appendChild(el("p", "step__hint",
    "<strong>Two of these instruments answer a question about the building rather than the machine.</strong> " +
    "Before you run anything, decide which side of the outlet you think the fault is on &mdash; because a meter " +
    "pointed at the wrong side of it will give you a perfectly accurate reading of something that is working."));

  const bench = partBench(t, powerModel(G, POWER_PARTS));

  const box = el("div", "tests");
  const benchHint = hintBox(box);
  const ran = {};
  let benchClean = true;
  const timeSpent = el("p", "count", "Time spent: 0 minutes");
  const fb = el("p", "fb"); fb.style.display = "none";
  const tests = powerTests(G, (a) => ordShuffle("pwrtest", a));
  tests.forEach((tt) => {
    const card = el("div", "test");
    const out = el("span", "test__out"); out.hidden = true;
    const run = el("button", "btn", "Run"); run.type = "button";
    run.addEventListener("click", () => {
      ran[tt.key] = true;
      out.hidden = false; out.textContent = tt.result; run.disabled = true;
      const spent = tests.filter((x) => ran[x.key]).reduce((a, x) => a + x.mins, 0);
      timeSpent.textContent = "Time spent: " + spent + " minutes";
      if (tt.isolating) benchHint.right(); else benchHint.wrong(CONTROL_HINTS.bench);
      if (tt.isolating) {
        const clean = tests.filter((x) => ran[x.key] && !x.isolating).length === 0;
        /* FINDING IT IS THE PASS. HOW TIDILY IS THE FEEDBACK.

           This used to be `graded["test-isolate"] = clean`, and `clean` is
           false the moment a student opens any other tool first. The button
           then disables, so the flag could never become true again — and
           step four gates on `=== true`. A student who explored one wrong
           tool before finding the right one had the rest of the ticket
           locked against them permanently, with a lock message telling them
           to finish a step they had just finished.

           Trying the wrong instrument first is what diagnosis looks like.
           It costs bench time, it is said plainly in the feedback below, and
           it does not take the ticket away. */
        graded["test-isolate"] = true;
        benchClean = clean;
        fb.style.display = "";
        fb.className = "fb " + (clean ? "fb--ok" : "fb--no");
        fb.innerHTML = (clean ? "Correct" : "Confirmed, eventually") + '<span class="fb__why">' +
          esc(clean
            ? "Straight to it in " + tt.mins + " minutes, with the instrument pointed at the right side of the outlet."
            : "That is the test that settles it, but you spent " + spent + " minutes getting there" +
            (ran.recept && tt.key !== "recept"
              ? " — and the two-minute one you could have started with was on the list."
              : ".")) +
          "</span>";
        updateScore();
      }
    });
    card.appendChild(el("span", "test__label", esc(tt.label)));
    card.appendChild(el("span", "test__mins", tt.mins + " min"));
    card.appendChild(run); card.appendChild(out);
    box.appendChild(card);
  });
  t.body.appendChild(box);
  t.body.appendChild(timeSpent);
  t.body.appendChild(fb);

  bench.askLocate();

  allQs = allQs.concat(renderQuestions(t.body, [
    {
      id: "test-part", kind: "choice", shuffle: true,
      ask: "Theory confirmed. What is actually wrong?",
      choices: () => TRACKS.power.faults.map((f) => f.part),
      answer: () => G.fault.part,
      why: () => G.fault.root + " " + G.fault.fixes
    }
  ]));
  return t;
}

/* Step four. The scope call comes before the procedure, because on two of
   these tickets the correct procedure is entirely about handing it over,
   and a student who has not made that decision cannot build it. */
function pwrStepPlan(t) {
  t.body.appendChild(el("p", "step__hint",
    "<strong>First: is this yours?</strong> Being able to see what is wrong is not the same as being the person " +
    "who fixes it. Some of what turns up on a power call is the building's fixed wiring, which is licensed work " +
    "in every jurisdiction you will ever stand in, and some of it is a planning problem that no repair will touch."));

  /* ---- the scope call ---- */
  const sp = el("div", "panel");
  sp.appendChild(el("h3", null, "Scope of work"));
  sp.appendChild(el("p", "count",
    "Pick the one that describes what happens next. All four are things a technician has said on a real call."));
  const slist = el("div", "pbtnlist");
  const sbtns = {};
  let sChosen = null;
  SCOPE_OPTIONS.forEach((o) => {
    const b = el("button", "pbtn", esc(o.label));
    b.type = "button";
    b.setAttribute("aria-pressed", "false");
    b.addEventListener("click", () => {
      sChosen = o.key;
      Object.keys(sbtns).forEach((k) => sbtns[k].setAttribute("aria-pressed", k === o.key ? "true" : "false"));
    });
    sbtns[o.key] = b;
    slist.appendChild(b);
  });
  sp.appendChild(slist);
  const srow = el("div", "q__row");
  const sBtn = el("button", "btn", "Make the call");
  sBtn.type = "button";
  srow.appendChild(sBtn);
  sp.appendChild(srow);
  const sFb = el("p", "fb"); sFb.style.display = "none";
  sp.appendChild(sFb);
  const sHints = hintBox(sp);
  t.body.appendChild(sp);

  let sRevealed = false, sBeneath = null;
  sBtn.addEventListener("click", () => {
    if (!sChosen) {
      sFb.style.display = ""; sFb.className = "fb";
      sFb.textContent = "Pick one of the four first.";
      return;
    }
    sRevealed = false; sBeneath = null;
    const ok = sChosen === G.scope;
    graded["plan-scope"] = ok;
    sFb.style.display = "";
    sFb.className = "fb " + (ok ? "fb--ok" : "fb--no");
    sFb.innerHTML = (ok ? "Correct" : "Not that call") +
      '<span class="fb__why">' + esc(scopeWhy(G.fault, sChosen)) + "</span>";
    if (ok) sHints.right(); else sHints.wrong(CONTROL_HINTS.scope);
    updateScore();
  });
  allQs.push({
    id: "plan-scope",
    _reveal: () => {
      if (!sRevealed) sBeneath = { html: sFb.innerHTML, cls: sFb.className, disp: sFb.style.display };
      sRevealed = true;
      if (sbtns[G.scope]) sbtns[G.scope].classList.add("pbtn--answer");
      sFb.style.display = ""; sFb.className = "fb fb--ok";
      sFb.innerHTML = "Answer: " +
        esc(SCOPE_OPTIONS.filter((o) => o.key === G.scope)[0].label) +
        '<span class="fb__why">' + esc(scopeWhy(G.fault, G.scope)) + "</span>";
    },
    _unreveal: () => {
      if (!sRevealed) return;
      sRevealed = false;
      if (sbtns[G.scope]) sbtns[G.scope].classList.remove("pbtn--answer");
      sFb.innerHTML = sBeneath ? sBeneath.html : "";
      sFb.className = sBeneath ? sBeneath.cls : "fb";
      sFb.style.display = sBeneath ? sBeneath.disp : "none";
      sBeneath = null;
    }
  });

  /* ---- then the procedure, on the shared builder ---- */
  return pwrProcedure(t);
}

/* =====================================================================
   The cabling track

   The only track where step four is work rather than a purchase. There is
   nothing to order — you put eight conductors in eight slots and you are
   either right or you do it again, which is exactly how the job goes.

   The tester panel is the centrepiece of step three, and it is computed
   from the fault rather than written beside it. Two of these faults show a
   perfect tester readout, and a student who has learned to read the map
   without learning what the map cannot see will fail both of them.
   ===================================================================== */
function cabTheoryQuestions(t) {
  const qs = [
    {
      id: "theory-cause", kind: "choice", shuffle: true,
      ask: "What is your theory of probable cause?",
      choices: () => TRACKS.cabling.faults.map((f) => f.part),
      answer: () => G.fault.part,
      why: () => G.fault.root + " " + G.fault.fixes
    },
    {
      id: "theory-evidence", kind: "choice", shuffle: true,
      ask: "And what is the evidence for it?",
      choices: () => TRACKS.cabling.faults.map((f) => f.evidence),
      answer: () => G.fault.evidence,
      why: () => "On copper the evidence is a reading, not an impression. Every one of these theories is either " +
        "confirmed or killed by one line on one instrument, and picking the instrument is the skill."
    }
  ];
  allQs = allQs.concat(renderQuestions(t.body, qs));
  return t;
}

/* The pin map, drawn as the tester draws it: near pin on the left, what it
   reaches on the right, and the conductor colour that pin should carry
   under the standard this site uses. */
function cabStepTest(t) {
  const c = G.cable;

  const tp = el("div", "panel");
  tp.appendChild(el("h3", null, "Continuity tester — near end to far end"));
  const rows = testerRows(G);
  rows.forEach((r) => { r._bad = r.bad; });
  tp.appendChild(table(["Pin", "Twisted pair", "Reaches far-end pin"], rows,
    (r) => `<td>${r.pin}</td><td>${esc(r.pair)}</td><td>${esc(r.reads)}</td>`));
  tp.appendChild(el("p", "count",
    "A tester reports pin numbers, not colours \u2014 it has no idea what colour anything is. A pin that " +
    "reads its own number is straight through; anything else is the tester telling you what you did. The " +
    "pair grouping is the same under both standards, which is why it can be shown here."));
  t.body.appendChild(tp);

  const cp = el("div", "panel");
  cp.appendChild(el("h3", null, "Certifier report"));
  const cdl = el("dl", "kv");
  certRows(G).forEach((r) => {
    const dt = el("dt", null, esc(r.k)), dd = el("dd", null, esc(r.v));
    if (r.bad) { dt.setAttribute("data-bad", "1"); dd.setAttribute("data-bad", "1"); }
    cdl.appendChild(dt); cdl.appendChild(dd);
  });
  cp.appendChild(cdl);
  t.body.appendChild(cp);

  t.body.appendChild(holdKey("Hold to read: the two standards, and what a tester cannot see", PINOUT_FACTS));

  t.body.appendChild(el("p", "step__hint",
    "<strong>Read the map before you reach for anything.</strong> A pin that reads open, two pins that read " +
    "shorted, two pins that read each other's numbers and a map that is entirely correct are four different " +
    "faults with four different fixes &mdash; and the fourth one is still a fault."));

  const bench = partBench(t, cablingModel(G, CABLE_PARTS));

  const box = el("div", "tests");
  const benchHint = hintBox(box);
  const ran = {};
  let benchClean = true;
  const timeSpent = el("p", "count", "Time spent: 0 minutes");
  const fb = el("p", "fb"); fb.style.display = "none";
  const tools = toolsFor(G, (a) => ordShuffle("cabtool", a));
  tools.forEach((tt) => {
    const card = el("div", "test");
    const out = el("span", "test__out"); out.hidden = true;
    const run = el("button", "btn", "Use it"); run.type = "button";
    run.addEventListener("click", () => {
      ran[tt.key] = true;
      out.hidden = false; out.textContent = tt.result; run.disabled = true;
      const spent = tools.filter((x) => ran[x.key]).reduce((a, x) => a + x.mins, 0);
      timeSpent.textContent = "Time spent: " + spent + " minutes";
      if (tt.isolating) benchHint.right(); else benchHint.wrong(CONTROL_HINTS.bench);
      if (tt.isolating) {
        const clean = tools.filter((x) => ran[x.key] && !x.isolating).length === 0;
        /* Finding it is the pass; how tidily is the feedback. See the
           note on the other benches: grading the gate on a clean run meant
           one wrong tool locked the rest of the ticket for good. */
        graded["test-isolate"] = true;
        benchClean = clean;
        fb.style.display = "";
        fb.className = "fb " + (clean ? "fb--ok" : "fb--no");
        fb.innerHTML = (clean ? "Correct" : "Confirmed, eventually") + '<span class="fb__why">' +
          esc(clean
            ? "Straight to it in " + tt.mins + " minutes with the one instrument that could settle it."
            : "That is the instrument that settles it, but you spent " + spent + " minutes getting there" +
            (ran.certifier && tt.key !== "certifier"
              ? " — including twelve of them certifying a cable to find out what a two-minute look would have told you."
              : ".")) +
          "</span>";
        updateScore();
      }
    });
    card.appendChild(el("span", "test__label", esc(tt.label)));
    card.appendChild(el("span", "test__mins", tt.mins + " min"));
    card.appendChild(run); card.appendChild(out);
    box.appendChild(card);
  });
  t.body.appendChild(box);
  t.body.appendChild(timeSpent);
  t.body.appendChild(fb);

  bench.askLocate();

  const qs = [
    {
      id: "test-part", kind: "choice", shuffle: true,
      ask: "Theory confirmed. What is actually wrong?",
      choices: () => TRACKS.cabling.faults.map((f) => f.part),
      answer: () => G.fault.part,
      why: () => G.fault.root + " " + G.fault.fixes
    }
  ];

  /* On the three faults that name specific pins, naming the PAIR those pins
     belong to is a separate piece of knowledge and the one people get wrong,
     because pins 3 and 6 are a pair with two other pins sitting between
     them. Computed from the pins the ticket drew, never written down. */
  const pinned = { open: [c.badPin], short: [c.shortA, c.shortB], revpair: c.revPins }[G.fault.key];
  if (pinned) {
    qs.unshift({
      id: "test-pair", kind: "choice", shuffle: true,
      ask: "The tester is reporting on pin" + (pinned.length > 1 ? "s " + pinned.join(" and ") : " " + pinned[0]) +
        ". Which pair is that, by colour?",
      note: "The tester gives you a pair number. Turning that into a colour takes the standard this site uses, " +
        "which is on the ticket \u2014 and note that three of the four pairs are neighbouring pins and one is not.",
      choices: () => PAIR_COLOURS,
      answer: () => pairColour(pinned[0], G.standard),
      why: () => "The tester can only tell you the pair number. Which COLOUR that is depends on the standard " +
        "the link was terminated to, and the two standards differ in exactly one way: orange and green trade " +
        "places, so they swap between pins 1 and 2 and pins 3 and 6. Blue is on 4 and 5 and brown is on 7 " +
        "and 8 either way — which is also why pins 3 and 6 are a pair with two other pins sitting between them.",
      hints: () => [
        "The tester gives you the pair number and stops there. Turning a pair number into a colour needs one " +
          "more thing, and the ticket header tells you what this site uses.",
        "Two of the four pairs are the same colour under both standards, so if this is one of those you do not " +
          "need the standard at all. Work out whether it is before you do anything harder.",
        "If it is one of the two that move, you only have to know which way round they are in the standard " +
          "named at the top of this ticket. There are two possibilities and one of them makes this a crossover " +
          "cable at a site that is not using crossovers."
      ]
    });
  }

  allQs = allQs.concat(renderQuestions(t.body, qs));
  return t;
}

/* Step four. Nothing to order and nothing to quote — you terminate it. */
function cabStepPlan(t) {
  t.body.appendChild(el("p", "step__hint",
    "<strong>Now do the work.</strong> There is no part to order on this ticket. Put the eight conductors in " +
    "the eight slots, to the standard the rest of this site is already on &mdash; because a cable that is " +
    "correct on its own and different from everything around it is the next ticket."));

  const std = siteStandard(G);
  const want = correctOrder(G);

  const panel = el("div", "panel");
  panel.appendChild(el("h3", null, "Terminate to T568" + std));
  panel.appendChild(el("p", "count",
    "Pin 1 is the contact nearest the latch side when you look into the front of the plug with the clip " +
    "underneath. Work left to right."));

  const grid = el("div", "pinout");
  const picks = [];
  const pool = conductorPool((a) => ordShuffle("cabpool", a));
  for (let i = 0; i < 8; i++) {
    const cell = el("div", "pinout__slot");
    const lab = el("label", "pinout__n", "Pin " + (i + 1));
    const id = "pin" + (i + 1) + "-" + Math.random().toString(36).slice(2, 7);
    lab.setAttribute("for", id);
    const sel = el("select", "ans");
    sel.id = id;
    sel.innerHTML = '<option value="">— select —</option>' +
      pool.map((cc) => `<option value="${esc(cc)}">${esc(cc)}</option>`).join("");
    cell.appendChild(lab); cell.appendChild(sel);
    grid.appendChild(cell);
    picks.push(sel);
  }
  panel.appendChild(grid);

  const row = el("div", "q__row");
  const crimp = el("button", "btn", "Crimp it and test");
  crimp.type = "button";
  row.appendChild(crimp);
  panel.appendChild(row);
  const fb = el("p", "fb"); fb.style.display = "none";
  panel.appendChild(fb);
  const hints = hintBox(panel);
  t.body.appendChild(panel);

  let revealed = false, beneath = null;
  crimp.addEventListener("click", () => {
    const got = picks.map((s) => s.value);
    if (got.some((v) => !v)) {
      fb.style.display = ""; fb.className = "fb";
      fb.textContent = "Every pin needs a conductor before you crimp. Fill the empty slots first.";
      return;
    }
    revealed = false; beneath = null;
    const wrongPins = [];
    got.forEach((v, i) => { if (v !== want[i]) wrongPins.push(i + 1); });
    /* Using a conductor twice is a different mistake from putting the right
       eight in the wrong order, and it is worth saying so. */
    const dupes = got.filter((v, i) => got.indexOf(v) !== i);
    const ok = wrongPins.length === 0;
    graded["plan-terminate"] = ok;
    fb.style.display = "";
    fb.className = "fb " + (ok ? "fb--ok" : "fb--no");
    fb.innerHTML = (ok ? "Correct" : "It will not pass") + '<span class="fb__why">' +
      esc(ok
        ? "Eight for eight to T568" + std + ", which is what the rest of this site is on. The tester maps " +
          "straight through and the pairs are made up correctly, which is the half of it a tester would not " +
          "have told you."
        : dupes.length
          ? "You have used the same conductor on more than one pin, which leaves at least one with nothing in " +
            "it. There are eight conductors and eight slots, and each goes exactly once."
          : wrongPins.length + " of the 8 pins " + (wrongPins.length === 1 ? "is" : "are") +
            " in the wrong place: pin" + (wrongPins.length === 1 ? " " : "s ") + wrongPins.join(", ") +
            ". Read the standard back to yourself one pin at a time rather than fixing the one you doubt.") +
      "</span>";
    if (ok) hints.right(); else hints.wrong(CONTROL_HINTS.terminate);
    updateScore();
  });

  allQs.push({
    id: "plan-terminate",
    _reveal: () => {
      if (!revealed) beneath = { html: fb.innerHTML, cls: fb.className, disp: fb.style.display };
      revealed = true;
      picks.forEach((s, i) => { s.value = want[i]; });
      fb.style.display = ""; fb.className = "fb fb--ok";
      fb.innerHTML = "Answer: T568" + std + '<span class="fb__why">' +
        esc(want.map((w, i) => (i + 1) + " " + w).join(" · ")) + "</span>";
    },
    _unreveal: () => {
      if (!revealed) return;
      revealed = false;
      picks.forEach((s) => { s.value = ""; });
      fb.innerHTML = beneath ? beneath.html : "";
      fb.className = beneath ? beneath.cls : "fb";
      fb.style.display = beneath ? beneath.disp : "none";
      beneath = null;
    }
  });

  allQs = allQs.concat(renderQuestions(t.body, [
    {
      id: "plan-action", kind: "choice", shuffle: true,
      ask: "And what is the action on this ticket?",
      choices: () => TRACKS.cabling.faults.map((f) => f.fixes),
      answer: () => G.fault.fixes,
      why: () => G.fault.root + " " + G.fault.wrongWhy
    }
  ]));
  return t;
}

/* =====================================================================
   Step 3 — Test the theory
   ===================================================================== */
function stepTest() {
  const t = step(2);
  if (G.track === "network") return netStepTest(t);
  if (G.track === "mobile") return mobStepTest(t);
  if (G.track === "cloud") return cloudStepTest(t);
  if (G.track === "mixed") return mixedStepTest(t);
  if (PRINTER_TRACKS.indexOf(G.track) !== -1) return prnStepTest(t);
  if (G.track === "laptop") return lapStepTest(t);
  if (G.track === "display") return dispStepTest(t);
  if (G.track === "cabling") return cabStepTest(t);
  if (G.track === "power") return pwrStepTest(t);
  if (G.track === "raid") return raidStepTest(t);
  if (G.track === "printnet") return pnetStepTest(t);
  const smart = smartRows(G);
  const ev = eventRows(G);
  const th = thermalRows(G);
  const tests = benchTests(G);

  /* the instruments */
  const boot = smart[0];
  const sp = el("div", "panel");
  sp.appendChild(el("h3", null, "SMART — " + boot.name + ", " + boot.cap));
  boot.rows.forEach((r) => { r._bad = r.bad; });
  sp.appendChild(table(["ID", "Attribute", "Value", "Note"], boot.rows,
    (r) => `<td>${esc(r.id)}</td><td>${esc(r.attr)}</td><td>${r.value}</td><td>${esc(r.note)}</td>`));
  sp.appendChild(el("p", "count", "Overall assessment: " + boot.verdict +
    " · second drive " + smart[1].name + ": " + smart[1].verdict));
  t.body.appendChild(sp);

  const tp = el("div", "panel");
  tp.appendChild(el("h3", null, "Temperatures and fans under load"));
  th.rows.forEach((r) => {
    const b = el("div", "bar");
    b.appendChild(el("span", "test__mins", esc(r.name)));
    const track = el("div", "bar__track");
    const fill = el("div", "bar__fill" + (r.bad ? " bar__fill--hatch" : ""));
    fill.style.width = Math.min(100, Math.round(100 * r.load / r.limit)) + "%";
    track.appendChild(fill);
    b.appendChild(track);
    b.appendChild(el("span", "bar__n", r.load + "°C of " + r.limit + (r.bad ? " ✗" : " ✓")));
    tp.appendChild(b);
  });
  th.fans.forEach((f) => {
    tp.appendChild(el("p", "count",
      esc(f.name) + ": " + f.rpm + " RPM (expected " + esc(f.expect) + ")" + (f.bad ? " ✗" : " ✓")));
  });
  t.body.appendChild(tp);

  const ep = el("div", "panel");
  ep.appendChild(el("h3", null, "Event log"));
  ev.forEach((r) => { r._bad = r._t === "fault"; });
  ep.appendChild(table(["When", "Level", "Source", "ID", "Message"], ev,
    (r) => `<td>${esc(r.day >= 0 ? dayName(r.day) : "wk-" + Math.ceil(-r.day / 5))}</td>` +
      `<td>${esc(r.level)}</td><td>${esc(r.src)}</td><td>${r.id}</td><td>${esc(r.msg)}</td>`));
  t.body.appendChild(ep);

  /* Open it up and look, before you touch a tester. It is free, it takes a
     minute, and on two of the seven faults it answers the question. */
  t.body.appendChild(el("p", "step__hint",
    "<strong>Take the side off and look first.</strong> It costs nothing and it is the step people " +
    "skip. Some faults are visible from the doorway; some are completely invisible and no amount of " +
    "staring will change that. Knowing which is which is why you look."));
  const bench = partBench(t, hardwareModel(G));

  /* the bench */
  t.body.appendChild(el("p", "step__hint",
    "<strong>One test at a time.</strong> Pick the test that isolates your theory and run it. " +
    "Everything here is honest work; only one of them tells you anything about this fault."));

  const box = el("div", "tests");
  const benchHint = hintBox(box);
  const ran = {};
  let benchClean = true;
  tests.forEach((tt) => {
    const card = el("div", "test");
    const lab = el("span", "test__label", esc(tt.label));
    const mins = el("span", "test__mins", tt.mins + " min");
    const run = el("button", "btn", "Run"); run.type = "button";
    const out = el("span", "test__out"); out.hidden = true;
    run.addEventListener("click", () => {
      ran[tt.key] = true;
      out.hidden = false;
      out.textContent = tt.result;
      run.disabled = true;
      const spent = tests.filter((x) => ran[x.key]).reduce((a, x) => a + x.mins, 0);
      timeSpent.textContent = "Bench time spent: " + spent + " minutes";
      /* Running a test that cannot isolate anything is not a wrong answer,
         it is wasted bench time — so it counts the same way. */
      if (tt.isolating) benchHint.right(); else benchHint.wrong(CONTROL_HINTS.bench);
      if (tt.isolating) {
        const clean = tests.filter((x) => ran[x.key] && !x.isolating).length === 0;
        /* Finding it is the pass; how tidily is the feedback. See the
           note on the other benches: grading the gate on a clean run meant
           one wrong tool locked the rest of the ticket for good. */
        graded["test-isolate"] = true;
        benchClean = clean;
        fb.style.display = "";
        fb.className = "fb " + (clean ? "fb--ok" : "fb--no");
        fb.innerHTML = (clean ? "Correct" : "Confirmed, eventually") +
          '<span class="fb__why">' + esc(graded["test-isolate"]
            ? "Straight to it, in " + tt.mins + " minutes. That is the difference between a short call and an afternoon."
            : "That is the right test, but you spent " + spent + " minutes getting there. On a " +
            G.urgency.label.toLowerCase() + " ticket the customer is counting every one of them.") + "</span>";
        updateScore();
      }
    });
    card.appendChild(lab); card.appendChild(mins); card.appendChild(run); card.appendChild(out);
    box.appendChild(card);
  });
  t.body.appendChild(box);
  const timeSpent = el("p", "count", "Bench time spent: 0 minutes");
  t.body.appendChild(timeSpent);
  const fb = el("p", "fb"); fb.style.display = "none";
  t.body.appendChild(fb);

  bench.askLocate();

  const qs = [
    {
      id: "test-part", kind: "choice",
      ask: "Theory confirmed. Which part are you replacing?",
      /* Derived from the fault list rather than typed out, so a fault added
         to the track is offered here automatically. The hand-written version
         of this list silently stopped offering five of the twelve. */
      choices: () => ordShuffle("test-part", TRACKS.hardware.faults.map((f) => f.part)),
      answer: () => G.fault.part,
      why: () => G.fault.root + " " + G.fault.fixes
    }
  ];
  allQs = allQs.concat(renderQuestions(t.body, qs));
  return t;
}

/* =====================================================================
   Step 4 — Plan of action, and order the part
   ===================================================================== */
function stepPlan() {
  const t = step(3);
  if (G.track === "network") return netStepPlan(t);
  if (G.track === "mobile") return mobStepPlan(t);
  if (G.track === "cloud") return cloudStepPlan(t);
  if (G.track === "mixed") return mixedStepPlan(t);
  if (PRINTER_TRACKS.indexOf(G.track) !== -1) return prnStepPlan(t);
  if (G.track === "laptop") return prnStepPlan(t);   // same procedure builder
  if (G.track === "display") return dispStepPlan(t);
  if (G.track === "cabling") return cabStepPlan(t);
  if (G.track === "power") return pwrStepPlan(t);
  if (G.track === "raid") return raidStepPlan(t);
  if (G.track === "printnet") return pnetStepPlan(t);

  t.body.appendChild(el("p", "step__hint",
    "<strong>This is the one that costs money.</strong> The part has to physically fit and electrically work &mdash; " +
    "that is not negotiable. Then it has to sit inside what this customer has approved, and the shipping has to match " +
    "how badly they need it. A part that fits, blows the budget and arrives overnight for an annoyance is three " +
    "decisions and two of them are wrong."));

  const m = el("div", "money");
  m.innerHTML =
    `<span>Customer <b>${esc(G.tier.label)}</b></span>` +
    `<span>Approved for this job <b>${money(G.budget)}</b></span>` +
    `<span>Urgency <b>${esc(G.urgency.label)}</b></span>`;
  t.body.appendChild(m);
  t.body.appendChild(el("p", "count", esc(G.tier.note) + " " + esc(G.urgency.note) +
    " " + esc(G.urgencyWhy)));

  const box = el("div", "parts");
  G.catalogue.forEach((p) => {
    const lab = el("label", "part");
    lab.setAttribute("data-fits", G.need.fits.indexOf(p.id) !== -1 ? "1" : "0");
    lab.innerHTML = `<input type="radio" name="part" value="${esc(p.id)}">` +
      `<span class="part__id">${esc(p.id)}</span>` +
      `<span class="part__name">${esc(p.name)}</span>` +
      `<span class="part__price">${money(p.price)}</span>`;
    box.appendChild(lab);
  });
  t.body.appendChild(box);

  const appr = el("label", "part");
  appr.style.marginTop = ".5rem";
  appr.innerHTML = '<input type="radio" name="part" value="__approval">' +
    '<span class="part__id">CALL</span>' +
    '<span class="part__name">Stop and go back to the customer — the part this needs costs more than they have approved</span>' +
    '<span class="part__price">—</span>';
  t.body.appendChild(appr);

  const ship = el("div", "ship");
  SHIPPING.forEach((s) => {
    const l = el("label");
    if (s.key === G.shipping.key) l.setAttribute("data-correct", "1");
    l.innerHTML = `<input type="radio" name="ship" value="${esc(s.key)}"><span>${esc(s.label)}</span>` +
      `<span class="ship__price">${s.price ? "+" + money(s.price) : "included"}</span>`;
    ship.appendChild(l);
  });
  t.body.appendChild(el("p", "count", "Shipping"));
  t.body.appendChild(ship);

  const chk = el("button", "btn", "Place the order"); chk.type = "button";
  chk.style.marginTop = ".7rem";
  const fb = el("p", "fb"); fb.style.display = "none";
  chk.addEventListener("click", () => {
    const pSel = t.body.querySelector('input[name="part"]:checked');
    const sSel = t.body.querySelector('input[name="ship"]:checked');
    if (!pSel || !sSel) {
      fb.style.display = ""; fb.className = "fb fb--no";
      fb.innerHTML = "Not yet" + '<span class="fb__why">Choose a part and a shipping option. Both are part of the order.</span>';
      return;
    }
    const pid = pSel.value;
    const shipKey = sSel.value;
    const shipOk = shipKey === G.shipping.key;
    let ok = false, msg = "";

    if (pid === "__approval") {
      ok = G.approval.needed && shipOk;
      msg = G.approval.needed
        ? (shipOk ? G.approval.why
          : "Right call on the budget. " + shipWhy(shipKey))
        : "There is no need to stop. " + G.approval.why;
    } else {
      const part = G.catalogue.filter((x) => x.id === pid)[0];
      const fits = G.need.fits.indexOf(pid) !== -1;
      const total = part.price + SHIPPING.filter((s) => s.key === shipKey)[0].price;
      const affordable = part.price <= G.budget;
      ok = fits && affordable && shipOk && !G.approval.needed;
      if (!fits) {
        msg = part.name + " does not work here. " + G.need.why[pid];
      } else if (G.approval.needed) {
        msg = "That part does work — but " + G.approval.why;
      } else if (!affordable) {
        msg = part.name + " at " + money(part.price) + " is over the " + money(G.budget) +
          " approved for this job. Something correct is available inside the budget; spending a customer's money without asking is not a technical decision.";
      } else if (!shipOk) {
        msg = "Right part. " + shipWhy(shipKey);
      } else {
        msg = "Fits, works, inside budget, and shipped to match how badly they need it. Order total " + money(total) +
          ". " + G.shipping.why;
      }
    }
    graded["plan-order"] = ok;
    fb.style.display = "";
    fb.className = "fb " + (ok ? "fb--ok" : "fb--no");
    fb.innerHTML = (ok ? "Correct" : "Not yet") + '<span class="fb__why">' + esc(msg) + "</span>";
    updateScore();
  });
  t.body.appendChild(chk); t.body.appendChild(fb);
  return t;
}

function shipWhy(chosen) {
  const want = SHIPPING.filter((s) => s.key === G.shipping.key)[0];
  const got = SHIPPING.filter((s) => s.key === chosen)[0];
  const faster = SHIPPING.indexOf(got) > SHIPPING.indexOf(want);
  return (faster
    ? "You paid " + money(got.price) + " to get it here faster than this ticket justifies. "
    : "You have it coming " + got.label.toLowerCase() + " when this ticket needed " + want.label.toLowerCase() + ". ")
    + G.shipping.why;
}

/* =====================================================================
   Step 5 — Verify, and prevent
   ===================================================================== */
function stepVerify() {
  const t = step(4);
  if (PRINTER_TRACKS.indexOf(G.track) !== -1) return prnStepVerify(t);
  t.body.appendChild(el("p", "step__hint",
    "<strong>&ldquo;It booted&rdquo; is not verification.</strong> Everything the machine did before the fault has to do it again, " +
    "and the customer has to see it working before you leave."));

  const qs = [
    {
      id: "verify-what", kind: "choice", shuffle: true,
      ask: "What counts as verifying full system functionality here?",
      choices: () => [
        "Run the machine through the work the user actually does, with the user watching",
        "Confirm it reaches the desktop",
        "Check the part shows up in Device Manager",
        "Leave it running overnight and ask them to call if it happens again"
      ],
      answer: () => "Run the machine through the work the user actually does, with the user watching",
      why: () => "Reaching the desktop proves it boots. Device Manager proves the part is present. Neither proves the fault is gone, and asking the customer to be your monitoring system is how a ticket gets reopened."
    },
    {
      id: "verify-prevent", kind: "choice",
      ask: "And the preventive measure — what stops this one coming back?",
      choices: () => ordShuffle("verify-prevent", [
        preventFor(G),
        "Tell the user to shut down properly every night",
        "Schedule a full reimage every six months",
        "Add the machine to the replacement list for next year"
      ]),
      answer: () => preventFor(G),
      why: () => "Preventive means acting on the cause you just found. The other three are general hygiene, and general hygiene does not stop a specific fault recurring."
    }
  ];
  allQs = allQs.concat(renderQuestions(t.body, qs));
  return t;
}

function preventFor(G) {
  if (G.track === "mixed") {
    return { printer: "Get the patch panel labelled, so the next tidy-up does not put a staff port on the guest VLAN",
      wifi: "Note the failure against the model — if one wireless card has gone, the fleet is worth watching",
      vdicable: "Check link speed as part of the standard desk build, so a degraded link is caught before a user reports it",
      syncdisk: "Get this machine onto the monitoring that watches SMART, and onto the backup schedule it was not on",
      phonemail: "Restrict the reset option on managed handsets so a user cannot unenrol themselves by accident",
      slowcloud: "Record the machine's measured peak draw on the asset register, so the next card fitted to it is sized against a number",
      mobiledns: "Get every DHCP scope on the site checked against the resolvers that actually exist, because one was missed and others may have been",
      printerspool: "Get the print server onto the monitoring that watches drive health, and onto the backup schedule it was not on",
      vdiprofile: "Put an alert on the profile store at 85%, so this is a warning rather than a morning of twenty-minute logins",
      laptopvpn: "Stage compliance-affecting policy changes to a pilot group first, so the next certificate change locks out ten people instead of a department",
      raidslow: "Put the storage controller's cache battery on the same replacement schedule as everything else in that rack",
      printpower: "Get the printer onto its own circuit, and the circuit arithmetic onto the wall by the panel",
      scanstore: "Alert on the scan destination's quota at 85%, so it is a warning rather than a week of failed scans",
      vpnprinter: "Get the comms room labelled so the next tidy-up cannot put an access point on the guest VLAN",
      backupdisk: "Alert on the backup job overrunning as well as failing, because a job that finishes late tells you something before a job that fails does"
    }[G.fault.key];
  }
  if (G.track === "cloud") {
    return { vmram: "Put a capacity check in the build process, so nobody can create a guest the host cannot hold",
      virtext: "Fix the standard image so the extensions are on before the machine reaches a desk",
      vdi: "Set a desktop-per-datastore limit and hold to it as the pool grows",
      quota: "Put an alert on the quota at 85%, so it is a warning rather than a fortnight of silent failures",
      sync: "Get the team off offline editing of shared documents, and turn on version history",
      licence: "Attach licence assignment to the joiner process so it is not a thing anyone has to remember",
      spend: "Put a budget alert on the subscription so the next idle environment is caught in days",
      snapshot: "Set a snapshot retention policy and alert on any that outlive it, so one taken before an upgrade cannot quietly become permanent",
      timedrift: "Put every host on the site time source as part of the build, and alert on drift before authentication starts refusing",
      backupwin: "Review the backup window against the job's actual duration each quarter, because the data grows and the window does not",
      mfa: "Make re-enrolling the second factor part of handing over a replacement handset, so the account never outlives the device",
      region: "Put region on the checklist for standing anything up, since it is a two-second decision that cannot be undone cheaply later",
      cpuready: "Size guests to what they use rather than to what sounds generous, and put ready time on the monitoring beside usage, because usage alone will never show you this",
      thinprov: "Alert on provisioned-against-actual rather than on free space, since free space looks healthy right up until the morning it does not",
      portgroup: "Make the port group names identical across every host in the cluster, so a migration cannot quietly disconnect a machine",
      retention: "Get the recovery requirement agreed in writing and set retention to match it, because a green backup report answers a question nobody asked",
      egress: "Alert on transfer volume as well as on total spend, and make \u201cwhere does this run\u201d part of signing off any job that touches a large dataset"
    }[G.fault.key];
  }
  if (G.track === "mobile") {
    return { battery: "Put this model on a battery-health check at every fleet review, so the next one is swapped before it strands somebody",
      port: "Issue port plugs to the field teams — this is a five-minute fix that keeps happening",
      digitizer: "Review the case standard for the people who work outdoors",
      overheat: "Change the cradle guidance: out of the case to charge, and out of direct sun",
      cellular: "Push the carrier APN by policy so nobody has to type it again",
      mdm: "Restrict the reset option on managed devices, so a user cannot unenrol themselves by accident",
      storage: "Turn on automatic offload for site video before the next device fills up",
      speaker: "Add an earpiece check to the fleet review, because this is a two-minute clean that gets billed as a repair",
      swollen: "Change the charging guidance for the vans — a device that lives on a charger is the one that swells, and this will not be the only one",
      wificall: "Turn wireless calling on across the fleet by policy, so the next person who works in a basement never raises this ticket",
      hotspot: "Put sharing into the standard build for van handsets, because every one of them will be asked to do this eventually",
      btpair: "Clear the bond list at handover, since a device that changes hands three times arrives full and gives no error when it is",
      captiveportal: "Decide as a fleet whether a fixed private DNS belongs on handsets that visit customer sites, because this will happen at every one of them",
      vpnalways: "Get split tunnelling into the profile before the next push, and pilot policy changes on a small group rather than the whole fleet",
      appperm: "Pre-grant the permissions the job application needs in the build, so a first-launch prompt answered wrongly cannot silently disable half the job",
      protector: "Put \u201clook under the protector\u201d in front of every screen quote, because a peel costs a minute and a panel costs a hundred and fifty",
      nfcoff: "Find out what that battery-saving change touched across the rest of the fleet, because it will not have picked on this handset alone",
      rearcam: "Issue cases with a raised lip around the camera, since the glass is only getting scratched because it sits flat on whatever the phone is put down on",
      liquid: "Get the fleet off rice and onto a reporting rule \u2014 a handset that goes in water comes back to the bench the same day, where it is worth looking at, rather than a year later with corrosion under the connectors",
      eol: "Put the manufacturer's support dates on the asset register beside the purchase dates, so devices are replaced on a plan rather than on the day an application stops opening",
      profile: "Put the profile's expiry on the same calendar as the certificate that signs it, so renewal happens before it lapses rather than after",
      backupfail: "Alert on a device that has not backed up in fourteen days, so the gap is caught in a fortnight rather than in a quarter"
    }[G.fault.key];
  }
  if (G.track === "laptop") {
    return { lapram: "Note that the module was fitted from outside the standard build, and get the machine's supported memory recorded where the next person will look",
      lapssd: "Get this machine onto the backup schedule it was not on, and onto the monitoring that watches drive health",
      lapbatt: "Change the docking guidance — a machine that lives on charge needs its charge ceiling capped, not a battery every two years",
      lapkbd: "Nothing prevents a spilt drink, but a keyboard-only replacement instead of a top-case swap is worth writing down for the next one",
      lapwifi: "Check that the antenna leads are reseated whenever a lid or hinge job is done, because this is a repair that causes this fault",
      lapthermal: "Put the machine on the dust-and-airflow check at every visit, and tell the user what a soft surface does to the intakes",
      lapdc: "Fit the strain-relief guidance to the user, and note the connector type on the asset record so the next one is ordered before the trip",
      laphinge: "Get the lid closed and the machine carried properly, and catch a loosening hinge at the next visit before it takes the cable with it",
      laptrack: "Note the model against this fault — a trackpad that lifts under a swelling cell is a battery warning, not a trackpad fault",
      lapboard: "Record the board revision and the failure, because a machine at this age failing this way is a fleet decision rather than a repair",
      lapfan: "Tell the user what a soft surface does to the intakes, and put the fan on the check list at the next visit",
      lapspeaker: "Note that headphones cleared everything above the speakers, so the next person on this model does not start with the audio settings",
      lapsoldered: "Put the real maximum memory on the asset register against the model, so the next person quoting an upgrade quotes one that exists",
      lapadhesive: "Get the adhesive procedure and a spare strip kit into the van stock for every chassis on the fleet that uses them, before somebody improvises",
      lapm2key: "Record the socket key and length against the asset, because 'M.2' on a purchase order is not a specification",
      lappaste: "Add re-pasting to the schedule for machines past four years, since compound dries out on a timescale nobody is watching",
      lapbacklight: "Keep a torch in the kit and use it before quoting any dark screen \u2014 it costs nothing and it separates the cheap fault from the expensive one",
      lapwebcam: "Check the privacy shutter first on every camera call, because it costs nothing and it is the answer more often than the module is",
      lapbios: "Note the boot order against the asset, and if it will not hold the setting get the coin cell changed before it becomes a real call-out",
      lapdisplaycable: "Check the display connector latch whenever the lid or the top case comes off, since this is a repair that causes this fault"
    }[G.fault.key];
  }
  if (G.track === "display") {
    return { backlight: "Note that the machine and the panel are fine — write down the torch test so the next person does not condemn a whole display",
      driver: "Record the two-second symptom against the model, because it is the one that gets a working panel thrown away",
      panel: "Review how the machines are carried, since pressure damage arrives in a bag rather than at a desk",
      vidcable: "Check the hinge routing whenever a lid job is done, and catch a chafing cable before the picture goes",
      projector: "Put the filter on a cleaning schedule, because a thermal shutdown here is dust and not a lamp",
      gpuart: "Pin the graphics driver to the version that works and take this machine out of the automatic rollout until the vendor fixes it",
      noinput: "Label both ends of the desk leads so the next re-cable puts the right source on the right input",
      lampdim: "Track lamp hours against the rating and order the replacement before the room is dark, not after",
      deadcolumn: "Review how the screens are transported — a bag pressed against a panel is a preventable fault",
      partialbl: "Note the failure against the model, because backlight strips that go one section at a time go in batches",
      refresh: "Set the refresh rate as part of the standard desk build, so a high-refresh panel is not bought and then run at sixty",
      burnin: "Turn screen blanking on across the fleet and get the static interface moved, because the panel that replaces this one will do the same thing",
      hdcp: "Standardise on one rated cable per room and take the adapter chains out, since every converter in the path is another handshake to fail",
      colourprofile: "Tie the profile to the monitor model in the build, so a new panel does not inherit the old one\u2019s profile",
      dockdisplay: "Note the dock model and the failed output, because docks fail one port at a time and this floor has forty of them"
    }[G.fault.key];
  }
  if (G.track === "printnet") {
    return { wrongdriver: "Put the correct driver in the standard build for this model, so a rebuilt machine comes back with the right one",
      dhcpprinter: "Reserve every printer's address and point the ports at hostnames, so the next power cut costs nobody a morning",
      spooler: "Set the spooler to restart itself on failure, and find the job that stopped it before it is sent again",
      sharedoffline: "Get every device off somebody's desk and onto the network in its own right, because this one will not be the only one",
      defaultprinter: "Turn off the setting that lets Windows pick the default, and set it in the build instead",
      securedprint: "Put badge enrolment into the joiner process, so the next new starter never raises this ticket",
      scanemail: "Add the multifunction devices to the list of things checked when a mail platform moves",
      scanfolder: "Take the device's service account off the expiring password policy, or put its renewal on the same calendar",
      discovery: "Add printers by TCP/IP port in the build rather than by discovery, so a subnet change does not break them",
      queuestuck: "Alert on a queue that stops draining, so a stuck job is minutes rather than a morning of calls",
      finishing: "Declare the installed options in the packaged driver, so a machine that gets it never has to be told twice",
      portblocked: "Get printing into the rule set as a named service, so the next tightening does not take it out again",
      ipconflict: "Take every static address out of the DHCP scope and move them to reservations, because this one will not be the last",
      scansize: "Set sane scan defaults on the fleet and tell people where long documents go, since the limit will be hit again next week",
      traymedia: "Make setting the tray part of loading it, so special paper never gets left behind for the next person"
    }[G.fault.key];
  }
  if (G.track === "raid") {
    return { member1: "Get the array onto monitoring that raises a ticket the moment it goes degraded, because a fortnight of amber light is a fortnight with no protection",
      member2: "Move this data onto a level that survives two failures, and get the alerting fixed — the array told somebody for two weeks and nobody was listening",
      predfail: "Keep replacing on the predictive warning rather than on the failure, and hold a spare of the array's member size on the shelf",
      spareidle: "Check that every spare in every enclosure is actually assigned to something, because a spare that is not assigned is a disk in a box",
      bbu: "Put the cache battery on a replacement schedule with the rest of the consumables, so the next one is a planned swap rather than a slow week",
      foreign: "Label every carrier with its slot before the next time this chassis is moved, so the disks go back the way they came out",
      rebuildstall: "Run a scheduled consistency check across the array, so latent unreadable sectors are found while there is still redundancy to absorb them",
      raid0: "Get this data off RAID 0 and write down why — the decision that put it there is the finding, not the disk that failed",
      nobackup: "Get a backup job running, get it monitored, and get a restore tested, because until a restore has been tested there is no backup",
      smallreplace: "Record the array's member size on the asset register and keep a matching spare, so the next replacement is the right one before anyone drives out",
      backplane: "Note that the failure was a group rather than a disk, so the next person to see a row of amber lights checks the enclosure before ordering disks",
      cachedirty: "Put the cache battery on a replacement schedule, because an unclean shutdown with a dead battery is the one way a healthy array loses data",
      wrongslot: "Make identifying the slot part of the procedure — read the serial, blink the light, confirm, then pull. Never on the amber alone",
      expandwrong: "Check the controller's supported member count before buying disks to grow an array, because the disks are not returnable once they are in",
      rebuildslow: "Set rebuild priority as part of the array build, so a degraded array is not left at low priority for a fortnight"
    }[G.fault.key];
  }
  if (G.track === "power") {
    return { railsag: "Record the machine's measured peak draw on the asset register, so the next card fitted to it is sized against a number rather than a guess",
      pgdelay: "Note the supply's age and the failure mode, because a batch that starts failing this way keeps failing this way",
      openground: "Get the whole floor's outlets tested and the results written down, because an outlet wired like this was never tested when it was fitted",
      revpolarity: "Get every outlet on that circuit tested before anyone plugs anything back in — wiring done wrong once is rarely wrong only once",
      upsbattery: "Put the pack's fitting date on the unit and on the asset register, so the next one is a scheduled swap rather than an outage",
      upsoverload: "Label the battery outlets with what may go in them, and write the remaining watt headroom on the unit",
      brownout: "Keep the input log running and give facilities the pattern, because the sag is the building's problem and your equipment is only absorbing it",
      esdstatic: "Get an anti-static mat and a strap into the van and make them part of every board-level job, on carpet or not",
      stripchain: "Get facilities to plan sockets for the desks that are actually there, because the desks are not going away and the strips will come back",
      circuitload: "Put the circuit's load arithmetic on the wall by the panel, so the next person to add a desk sees the headroom before they use it",
      surgedead: "Put the surge protectors on a replacement schedule and teach people what the indicator means, because a dark light is the only warning they give",
      neutralshare: "Get the whole panel inspected, because wiring done this way once is rarely done this way once",
      genset: "Get the protected outlets labelled and mapped, so the next person plugging something in can tell which supply they are on",
      psuwrongform: "Record the chassis form factor and the connector set on the asset register, so the next supply is ordered against four numbers rather than one",
      upsselftest: "Turn scheduled self-test on across every unit on site, because the first test of a UPS should never be a power cut"
    }[G.fault.key];
  }
  if (G.track === "cabling") {
    return { open: "Test every lead you make before it leaves your hand — a tester on the van costs less than one return visit",
      short: "Strip the jacket to the marked length on the crimp tool rather than by eye, and check before the crimp",
      revpair: "Lay the pairs out and read them back against the standard before the plug goes on, every time",
      crossed: "Write the site's standard on the panel and on the wall of the comms room, so nobody has to guess it",
      split: "Certify what you install rather than buzzing it out, because the one fault that matters here passes a buzz test",
      untwist: "Hold the untwist to half an inch at every punch-down and re-certify, and make that the site's rule",
      longrun: "Get the run lengths onto the floor plan so the next desk past the limit is caught on paper rather than on site",
      wrongcat: "Standardise the patch cords the site buys, and take the lower-rated ones out of the cupboard",
      punchmiss: "Label the panel with the standard it is punched to, so the next outlet is matched to it and not guessed",
      noconnect: "Make patching and labelling part of signing off an outlet, so a run is never handed over dead",
      poeport: "Record which switch ports carry power and how much budget is left, so the next device is patched somewhere that can feed it",
      emi: "Get the cable routes onto the floor plan with the mains runs marked, so the next pull does not share a tray with them",
      bendradius: "Put the cable\u2019s minimum bend radius on the installation standard, and check corners before the ceiling goes back",
      labelswap: "Tone and verify every outlet before it is signed off, and re-check the rest of that batch because labels are done in batches",
      fibrescratch: "Cap every fibre connector the moment it comes out, and inspect with a scope before anything goes back in \u2014 never by eye"
    }[G.fault.key];
  }
  if (G.track === "network") {
    return { mask: "Get this subnet into the build documentation so the next person types the right mask",
      gateway: "Put the machine back on DHCP so the gateway comes from the scope and not from memory",
      dns: "Record the site's resolvers where the next tech will look for them",
      apipa: "Get the DHCP scope widened — the static address you set is a workaround, not a fix",
      duplicate: "Reserve the printer's address in DHCP so nobody hands it out by hand again",
      patch: "Label and dress the run properly, and re-check the link after any desk move",
      vlan: "Get the patch panel labelled so the next tidy-up does not put a staff port on the guest VLAN",
      wrongsubnet: "Put the machine back on DHCP so the next renumber reaches it without anybody having to remember this desk",
      duplex: "Get the site's switch ports audited for anything hard-set years ago and never put back",
      portsec: "Get the desks the ports they actually need, because the unmanaged switch will reappear otherwise",
      proxy: "Find out whether policy is still pushing the dead proxy, and clear it centrally rather than one machine at a time",
      nicoff: "Note the adapter check as the second thing on the network runbook, since two minutes here saves an hour of everything else",
      dnsold: "Lower the record's time-to-live before a server moves, so caches expire on their own instead of needing a visit each",
      hosts: "Get the hosts files checked in the build audit, because a temporary entry left in one is invisible and permanent",
      wifiband: "Set the band preference in the standard build, so a machine does not arrive preferring the slow radio",
      mtu: "Turn the tunnel's clamping on centrally, so the next machine on that path does not need its interface touched",
      loop: "Cap the spare wall ports and get the loose leads off the floor, because this happens wherever both exist"
    }[G.fault.key];
  }
  return {
    ram: "Run a full memory test on the surviving module before you leave, so you are not back for the other one",
    psu: "Record the machine's actual peak draw on the asset register, so the next upgrade is sized against it",
    drive: "Get this machine onto the backup schedule — it was not on it, which is why this was frightening",
    thermal: "Put the machine on the dust-and-airflow check list, and get it off the floor",
    video: "Note the card's power draw against the supply, so the next one fitted is checked before it is bought",
    cable: "Secure and route the cable properly rather than leaving it loose, and re-check after any desk move",
    cmos: "Note the fitting date so the next flat cell is expected rather than diagnosed from scratch",
    psufan: "Put the machine on the dust-and-airflow check list, because a supply fan dies in dust before it dies of age",
    gpufan: "Get the machine off the floor and onto the airflow check, since this is the second card this room has cooked",
    nvmethermal: "Add a heatsink to the standard build spec for this chassis, so the next machine leaves with one on it",
    m2loose: "Add the mounting screw to the build checklist — it is the part that gets forgotten because nothing goes wrong until the machine moves",
    frontpanel: "Note the switch against the model and the age, because this is a wear part on a machine this old and there will be others",
    ramslot: "Record the dead slot on the asset register, so the next person to upgrade this machine does not spend an hour finding it again",
    cpupaste: "Add re-pasting to the schedule for machines past four years, because paste dries out on a timescale nobody watches",
    bulgecap: "Put a torch on the capacitor bank at every service visit for the rest of this batch, because boards from the same age and the same warm room fail the same way and you would rather find them before they take a day's work with them",
    dimmspeed: "Record the fitted module's type, speed and capacity on the asset register, so the next upgrade is matched rather than guessed",
    gpuseat: "Fit the retaining screws on every card as part of the build, and check them after any office move",
    fanheader: "Check fan headers as part of the build sign-off, so a machine does not leave the bench running flat out"
  }[G.fault.key];
}

/* =====================================================================
   Step 6 — Document
   ===================================================================== */
function stepDocument() {
  const t = step(5);
  t.body.appendChild(el("p", "step__hint",
    "<strong>The next tech is you, six months from now, with no memory of this.</strong> " +
    "Write the entry that would save that person an hour."));

  const qs = [
    {
      id: "doc-content", kind: "choice", shuffle: true,
      ask: "Which of these is the useful ticket note?",
      choices: () => [
        "Symptom, what the instruments showed, the test that confirmed it, the part fitted, and what was verified",
        "Fixed.",
        "Replaced " + G.fault.part + ".",
        "User reported the machine was broken. Resolved on site."
      ],
      answer: () => "Symptom, what the instruments showed, the test that confirmed it, the part fitted, and what was verified",
      why: () => "“Fixed” and “replaced the " + noArticle(G.fault.part) + "” both tell the next person what you did and nothing about why, so they cannot tell whether your reasoning applies to the machine in front of them."
    },
    {
      id: "doc-caller", kind: "choice", shuffle: true,
      ask: "The caller's original account was wrong. What goes in the record about that?",
      choices: () => [
        "Record what was reported and what was found, without editorialising about the caller",
        "Note that the user gave incorrect information",
        "Leave the caller's account out entirely",
        "Write it up as the caller described it, to avoid contradicting them"
      ],
      answer: () => "Record what was reported and what was found, without editorialising about the caller",
      why: () => "Both halves matter: the reported symptom is how it will be reported next time, and the finding is what it turned out to be. Editorialising about the user makes the record about them; omitting it loses the pattern; writing it up as they described it makes the record wrong."
    }
  ];
  allQs = allQs.concat(renderQuestions(t.body, qs));

  const sum = el("div");
  sum.id = "truthPanel";
  sum.hidden = true;
  sum.appendChild(el("p", "step__hint", "<strong>What it actually was</strong>"));
  const dl = el("dl", "kv");
  (G.track === "mixed"
    ? [["Root cause", G.fault.root], ["Objective", G.fault.objective],
      ["Caller's distortion", G.report.distortion.label], ["First occurrence", firstOccurrence(G).label],
      ["Reported as", G.scope.reported.label], ["Actually lives in", G.scope.actual.label],
      ["What was wrong", G.fault.part],
      ["What clears the innocent domain", G.fault.clears.evidence],
      ["What convicts the real one", G.fault.convicts],
      ["Action that fixes it", G.action]]
    : G.track === "cloud"
    ? [["Root cause", G.fault.root], ["Objective", G.fault.objective],
      ["Caller's distortion", G.report.distortion.label], ["First occurrence", firstOccurrence(G).label],
      ["What was wrong", G.fault.part],
      ["Fault kind", G.fault.kind === "resource" ? "capacity — the allocation has to change" : "service or setting — leave the allocation alone"],
      ["Correct allocation", G.host.guests.map((g) => g.name + " " + G.want[g.name].ram + "GB/" + G.want[g.name].cores + "v").join(", ")],
      ["Action that fixes it", G.action]]
    : G.track === "mobile"
    ? [["Root cause", G.fault.root], ["Objective", G.fault.objective],
      ["Caller's distortion", G.report.distortion.label], ["First occurrence", firstOccurrence(G).label],
      ["What was wrong", G.fault.part],
      ["Device", G.device.model + ", " + G.device.ageMonths + " months, " + (G.device.warranty ? "in warranty" : "out of warranty")],
      ["Repair cost", G.repairCost === null ? "nothing to repair" : money(G.repairCost)],
      ["Worth today", money(G.device.residual)],
      ["Correct outcome", G.outcome],
      ["Backup needed first", (G.backup.required || /never|months/.test(G.device.lastBackup)) ? "yes" : "no"]]
    : G.track === "network"
    ? [["Root cause", G.fault.root], ["Objective", G.fault.objective],
      ["Caller's distortion", G.report.distortion.label], ["First occurrence", firstOccurrence(G).label],
      ["What was wrong", G.fault.part], ["Fault kind", G.fault.kind === "physical" ? "physical — do not touch the configuration" : "configuration"],
      ["Correct address", G.want._leaveAlone ? "leave exactly as found" : G.want.ip],
      ["Correct mask", G.want._leaveAlone ? "leave as found" : G.want.mask],
      ["Correct gateway", G.want._leaveAlone ? "leave as found" : G.want.gateway],
      ["Correct DNS", G.want._leaveAlone ? "leave as found" : G.want.dns],
      ["Action that fixes it", G.action]]
    : [["Root cause", G.fault.root], ["Objective", G.fault.objective],
      ["Caller's distortion", G.report.distortion.label], ["First occurrence", firstOccurrence(G).label],
      ["Part fitted", G.fault.part], ["Correct options", G.need.fits.join(", ")],
      ["Approved budget", money(G.budget)], ["Shipping", G.shipping.key]]).forEach(([k, v]) => {
    dl.appendChild(el("dt", null, esc(k)));
    dl.appendChild(el("dd", null, esc(String(v))));
  });
  sum.appendChild(dl);
  t.body.appendChild(sum);
  return t;
}

/* ---------------- gating ----------------
   A step opens when the one before it has been answered correctly. Not
   merely attempted — the methodology is a sequence of conclusions, and a
   wrong conclusion carried forward is how a tech ends up replacing a
   motherboard because a coin cell was flat. */
/* =====================================================================
   Networking track — steps three and four
   ===================================================================== */

/* Step three. The link, the ARP table, and a bench where the clock runs. */
function netStepTest(t) {
  const lk = linkRows(G);
  const arp = arpRows(G);
  const tests = netBenchTests(G);

  const lp = el("div", "panel");
  lp.appendChild(el("h3", null, "Switch port " + esc(lk.port)));
  const ldl = el("dl", "kv");
  [["Negotiated speed", lk.speed, lk.speedBad],
  ["Port state", lk.portState, lk.portStateBad],
  ["Input errors", lk.errors + " " + lk.errorKind, lk.errorsBad],
  ["Access VLAN", lk.vlan, lk.vlanBad],
  ["Power over Ethernet", lk.poe, false],
  ["Port up for", Math.floor(lk.uptimeMins / 60) + "h " + (lk.uptimeMins % 60) + "m", false]].forEach(([k, v, bad]) => {
    const dt = el("dt", null, esc(k)), dd = el("dd", null, esc(v));
    if (bad) { dt.setAttribute("data-bad", "1"); dd.setAttribute("data-bad", "1"); }
    ldl.appendChild(dt); ldl.appendChild(dd);
  });
  lp.appendChild(ldl);
  t.body.appendChild(lp);

  const ap = el("div", "panel");
  ap.appendChild(el("h3", null, "ARP table"));
  ap.appendChild(table(["Address", "Hardware address", "Type"], arp,
    (r) => `<td>${esc(r.ip)}</td><td>${esc(r.mac)}</td><td>${esc(r.type)}</td>`));
  t.body.appendChild(ap);

  /* Walk the run. Five of the seven faults on this track are settings and
     have no physical home at all — which is exactly what makes deciding
     whether to pick up a cable tester worth grading. */
  t.body.appendChild(el("p", "step__hint",
    "<strong>Walk the run.</strong> Desk to gateway, every link in the chain. Two of the faults on " +
    "this track are down here in the copper. The other five are settings on the machine itself and " +
    "you could stare at this diagram all afternoon without seeing them."));
  const bench = partBench(t, networkModel(G, lk));

  t.body.appendChild(el("p", "step__hint",
    "<strong>One test at a time.</strong> Pick the test that isolates your theory and run it. " +
    "Everything here is honest work; only some of it tells you anything about this fault."));

  const box = el("div", "tests");
  const benchHint = hintBox(box);
  const ran = {};
  let benchClean = true;
  const timeSpent = el("p", "count", "Bench time spent: 0 minutes");
  const fb = el("p", "fb"); fb.style.display = "none";
  tests.forEach((tt) => {
    const card = el("div", "test");
    const out = el("span", "test__out"); out.hidden = true;
    const run = el("button", "btn", "Run"); run.type = "button";
    run.addEventListener("click", () => {
      ran[tt.key] = true;
      out.hidden = false; out.textContent = tt.result; run.disabled = true;
      const spent = tests.filter((x) => ran[x.key]).reduce((a, x) => a + x.mins, 0);
      timeSpent.textContent = "Bench time spent: " + spent + " minutes";
      /* Running a test that cannot isolate anything is not a wrong answer,
         it is wasted bench time — so it counts the same way. */
      if (tt.isolating) benchHint.right(); else benchHint.wrong(CONTROL_HINTS.bench);
      if (tt.isolating) {
        const clean = tests.filter((x) => ran[x.key] && !x.isolating).length === 0;
        /* FINDING IT IS THE PASS. HOW TIDILY IS THE FEEDBACK.

           This used to be `graded["test-isolate"] = clean`, and `clean` is
           false the moment a student opens any other tool first. The button
           then disables, so the flag could never become true again — and
           step four gates on `=== true`. A student who explored one wrong
           tool before finding the right one had the rest of the ticket
           locked against them permanently, with a lock message telling them
           to finish a step they had just finished.

           Trying the wrong instrument first is what diagnosis looks like.
           It costs bench time, it is said plainly in the feedback below, and
           it does not take the ticket away. */
        graded["test-isolate"] = true;
        benchClean = clean;
        fb.style.display = "";
        fb.className = "fb " + (clean ? "fb--ok" : "fb--no");
        fb.innerHTML = (clean ? "Correct" : "Confirmed, eventually") + '<span class="fb__why">' +
          esc(clean
            ? "Straight to it, in " + tt.mins + " minutes. On the network track the cheap test is almost always the comparison — most faults show up the moment you put a working machine next to a broken one."
            : "That is an isolating test, but you spent " + spent + " minutes getting there. On a " +
              G.urgency.label.toLowerCase() + " ticket the customer is counting every one of them.") + "</span>";
        updateScore();
      }
    });
    card.appendChild(el("span", "test__label", esc(tt.label)));
    card.appendChild(el("span", "test__mins", tt.mins + " min"));
    card.appendChild(run); card.appendChild(out);
    box.appendChild(card);
  });
  t.body.appendChild(box);
  t.body.appendChild(timeSpent);
  t.body.appendChild(fb);

  bench.askLocate();

  const qs = [
    {
      id: "test-part", kind: "choice",
      ask: "Theory confirmed. What is actually wrong?",
      choices: () => ordShuffle("test-part", NETWORK_FAULTS.map((f) => f.part)),
      answer: () => G.fault.part,
      why: () => G.fault.root + " " + G.fault.fixes
    }
  ];
  allQs = allQs.concat(renderQuestions(t.body, qs));
  return t;
}

/* Step four. Build the configuration, test it against the site, and then say
   what actually fixes the ticket — which on two of the seven is not the
   configuration at all. */
function netStepPlan(t) {
  t.body.appendChild(el("p", "step__hint",
    "<strong>Build it and test it.</strong> The configuration below is what you found on the machine. " +
    "Change what needs changing &mdash; and change nothing that does not &mdash; then run the connectivity test. " +
    "Two of the faults on this track are not configuration faults at all, and on those the right answer is to leave " +
    "this panel exactly as you found it."));

  const cfg = Object.assign({}, G.found);
  const wrap = el("div", "panel");
  wrap.appendChild(el("h3", null, "Interface configuration &mdash; " + esc(G.asset.tag)));

  const dhcpLab = el("label", "part");
  dhcpLab.innerHTML = '<input type="checkbox" id="cfgDhcp"' + (cfg.dhcp ? " checked" : "") +
    '><span class="part__name">Obtain an address automatically (DHCP)</span>';
  wrap.appendChild(dhcpLab);

  const fields = [["ip", "IPv4 address"], ["mask", "Subnet mask"],
  ["gateway", "Default gateway"], ["dns", "DNS server"]];
  const inputs = {};
  const grid = el("div", "cfgrid");
  fields.forEach(([k, label]) => {
    const l = el("label", "cfgrow");
    const inp = el("input");
    inp.type = "text"; inp.value = cfg[k] || ""; inp.setAttribute("aria-label", label);
    inp.addEventListener("input", () => { cfg[k] = inp.value.trim(); });
    inputs[k] = inp;
    l.appendChild(el("span", "cfgrow__label", esc(label)));
    l.appendChild(inp);
    grid.appendChild(l);
  });
  wrap.appendChild(grid);
  dhcpLab.querySelector("input").addEventListener("change", (e) => {
    cfg.dhcp = e.target.checked;
    Object.keys(inputs).forEach((k) => { inputs[k].disabled = e.target.checked; });
  });
  if (cfg.dhcp) Object.keys(inputs).forEach((k) => { inputs[k].disabled = true; });
  t.body.appendChild(wrap);

  const revert = el("button", "btn btn--peek", "Put it back the way I found it");
  revert.type = "button"; revert.style.marginTop = ".6rem"; revert.style.cursor = "pointer";
  revert.addEventListener("click", () => {
    Object.keys(G.found).forEach((k) => { cfg[k] = G.found[k]; });
    fields.forEach(([k]) => { inputs[k].value = G.found[k] || ""; inputs[k].disabled = !!G.found.dhcp; });
    dhcpLab.querySelector("input").checked = !!G.found.dhcp;
  });
  t.body.appendChild(revert);

  const testBtn = el("button", "btn", "Run the connectivity test");
  testBtn.type = "button"; testBtn.style.marginTop = ".6rem"; testBtn.style.marginLeft = ".4rem";
  const results = el("div");
  t.body.appendChild(testBtn); t.body.appendChild(results);

  /* DHCP on this site hands out a correct configuration — unless the port is
     in the wrong VLAN, in which case it hands out a correct configuration for
     the wrong network, which is the entire lesson of that ticket. */
  function effective() {
    if (!cfg.dhcp) return cfg;
    return G.fault.key === "vlan"
      ? { dhcp: true, ip: G.found.ip, mask: G.topo.guestMask, gateway: G.topo.guestGw, dns: G.topo.guestGw }
      : G.fault.key === "apipa"
        ? { dhcp: true, ip: G.found.ip, mask: "255.255.0.0", gateway: "", dns: "" }
        : { dhcp: true, ip: "10.20." + G.topo.third + ".140", mask: G.topo.mask,
          gateway: G.topo.gw, dns: G.topo.dns1 };
  }

  testBtn.addEventListener("click", () => {
    const rows = connectivity(effective(), G.topo, G.fault);
    results.innerHTML = "";
    rows.forEach((r) => { r._bad = !r.ok; });
    results.appendChild(table(["Check", "Result", "Why"], rows,
      (r) => `<td>${esc(r.label)}</td><td>${r.ok ? "\u2713 pass" : "\u2717 fail"}</td>` +
        `<td class="wrapcell">${esc(r.why)}</td>`));
  });

  t.body.appendChild(el("p", "step__hint",
    "<strong>And what actually fixes the ticket?</strong> A configuration you have corrected is only the fix if " +
    "the configuration was the fault."));
  const acts = el("div", "ship");
  ACTIONS.forEach((a) => {
    const l = el("label");
    if (a.key === G.action) l.setAttribute("data-correct", "1");
    l.innerHTML = `<input type="radio" name="netaction" value="${esc(a.key)}"><span>${esc(a.label)}</span>`;
    acts.appendChild(l);
  });
  t.body.appendChild(acts);

  const done = el("button", "btn", "Close the ticket"); done.type = "button";
  done.style.marginTop = ".7rem";
  const fb = el("p", "fb"); fb.style.display = "none";
  done.addEventListener("click", () => {
    const sel = t.body.querySelector('input[name="netaction"]:checked');
    if (!sel) {
      fb.style.display = ""; fb.className = "fb fb--no";
      fb.innerHTML = "Not yet" + '<span class="fb__why">Say what fixes it before you close it.</span>';
      return;
    }
    const eff = effective();
    const rows = connectivity(eff, G.topo, G.fault);
    const allPass = rows.every((r) => r.ok);
    const untouched = ["ip", "mask", "gateway", "dns"].every((k) => (eff[k] || "") === (G.found[k] || ""))
      && !!eff.dhcp === !!G.found.dhcp;
    const actionOk = sel.value === G.action;
    let ok, msg;

    if (G.fault.kind === "physical") {
      ok = untouched && actionOk;
      msg = !untouched
        ? "You changed a configuration that was already correct. It was correct when you arrived and it is correct now — all you have done is give the next tech a reason to doubt it. " + actionWhy(G.fault, sel.value)
        : actionOk
          ? actionWhy(G.fault, sel.value)
          : actionWhy(G.fault, sel.value);
    } else {
      ok = allPass && actionOk;
      msg = !allPass
        ? "Still failing: " + rows.filter((r) => !r.ok).map((r) => r.label.split(" (")[0]).join("; ") +
          ". Run the connectivity test and read which hop breaks."
        : actionOk
          ? actionWhy(G.fault, sel.value) + " Every check passes."
          : "The configuration is right now. " + actionWhy(G.fault, sel.value);
    }
    graded["plan-order"] = ok;
    fb.style.display = "";
    fb.className = "fb " + (ok ? "fb--ok" : "fb--no");
    fb.innerHTML = (ok ? "Correct" : "Not yet") + '<span class="fb__why">' + esc(msg) + "</span>";
    updateScore();
  });
  t.body.appendChild(done); t.body.appendChild(fb);
  return t;
}

/* =====================================================================
   Mobile track — steps three and four
   ===================================================================== */

function mobStepTest(t) {
  const nrows = mobileNetRows(G);
  const tests = mobBenchTests(G);

  const np = el("div", "panel");
  np.appendChild(el("h3", null, "Connectivity and enrolment"));
  const ndl = el("dl", "kv");
  nrows.forEach((r) => {
    const dt = el("dt", null, esc(r.k)), dd = el("dd", null, esc(r.v));
    if (r.bad) { dt.setAttribute("data-bad", "1"); dd.setAttribute("data-bad", "1"); }
    ndl.appendChild(dt); ndl.appendChild(dd);
  });
  np.appendChild(ndl);
  t.body.appendChild(np);

  const dv = deviceRows(G);
  const sp = el("div", "panel");
  sp.appendChild(el("h3", null, "Storage"));
  const bar = el("div", "bar");
  bar.appendChild(el("span", "test__mins", "Used"));
  const track2 = el("div", "bar__track");
  const fill = el("div", "bar__fill" + (G.fault.key === "storage" ? " bar__fill--hatch" : ""));
  fill.style.width = Math.round(100 * dv.usedGb / G.device.storageGb) + "%";
  track2.appendChild(fill);
  bar.appendChild(track2);
  bar.appendChild(el("span", "bar__n", dv.usedGb + " of " + G.device.storageGb + "GB" +
    (G.fault.key === "storage" ? " \u2717" : " \u2713")));
  sp.appendChild(bar);
  sp.appendChild(el("p", "count", dv.freeGb + "GB free"));
  t.body.appendChild(sp);

  /* Exploded, because the fault this view exists to teach — display against
     digitizer — is invisible on an assembled phone, and getting it wrong is
     an expensive part that arrives and does not fix anything. */
  /* The counts are computed rather than written down. They were written
     down once, and stayed at "four of the seven" while the track grew to
     seventeen faults, quietly telling the student something untrue. */
  const mobParts = TRACKS.mobile.faults.filter((f) => locateTarget({ track: "mobile", fault: f }) !== "none").length;
  const mobNone = TRACKS.mobile.faults.length - mobParts;
  t.body.appendChild(el("p", "step__hint",
    "<strong>Open it up.</strong> The handset in layers, cover glass down to chassis. " + mobNone +
    " of the " + TRACKS.mobile.faults.length + " faults on this track have no part in here at all " +
    "&mdash; and of the " + mobParts + " that do, one of them is the layer most people order by the " +
    "wrong name and another is not the device at all but something stuck to the front of it."));
  const bench = partBench(t, mobileModel(G));

  t.body.appendChild(el("p", "step__hint",
    "<strong>One test at a time.</strong> A factory reset answers almost nothing and costs the user everything " +
    "on the device. It is on the list because it is the first thing people reach for."));

  const box = el("div", "tests");
  const benchHint = hintBox(box);
  const ran = {};
  let benchClean = true;
  const timeSpent = el("p", "count", "Bench time spent: 0 minutes");
  const fb = el("p", "fb"); fb.style.display = "none";
  tests.forEach((tt) => {
    const card = el("div", "test");
    const out = el("span", "test__out"); out.hidden = true;
    const run = el("button", "btn", "Run"); run.type = "button";
    run.addEventListener("click", () => {
      ran[tt.key] = true;
      out.hidden = false; out.textContent = tt.result; run.disabled = true;
      const spent = tests.filter((x) => ran[x.key]).reduce((a, x) => a + x.mins, 0);
      timeSpent.textContent = "Bench time spent: " + spent + " minutes";
      /* Running a test that cannot isolate anything is not a wrong answer,
         it is wasted bench time — so it counts the same way. */
      if (tt.isolating) benchHint.right(); else benchHint.wrong(CONTROL_HINTS.bench);
      if (tt.isolating) {
        const clean = tests.filter((x) => ran[x.key] && !x.isolating).length === 0;
        /* FINDING IT IS THE PASS. HOW TIDILY IS THE FEEDBACK.

           This used to be `graded["test-isolate"] = clean`, and `clean` is
           false the moment a student opens any other tool first. The button
           then disables, so the flag could never become true again — and
           step four gates on `=== true`. A student who explored one wrong
           tool before finding the right one had the rest of the ticket
           locked against them permanently, with a lock message telling them
           to finish a step they had just finished.

           Trying the wrong instrument first is what diagnosis looks like.
           It costs bench time, it is said plainly in the feedback below, and
           it does not take the ticket away. */
        graded["test-isolate"] = true;
        benchClean = clean;
        fb.style.display = "";
        fb.className = "fb " + (clean ? "fb--ok" : "fb--no");
        fb.innerHTML = (clean ? "Correct" : "Confirmed, eventually") + '<span class="fb__why">' +
          esc(clean
            ? "Straight to it, in " + tt.mins + " minutes. Most mobile faults are three minutes in a settings screen if you know which screen."
            : "That is the isolating test, but you spent " + spent + " minutes getting there" +
              (ran.factory ? " — and you factory reset a device to find out something a settings screen would have told you." : ".")) + "</span>";
        updateScore();
      }
    });
    card.appendChild(el("span", "test__label", esc(tt.label)));
    card.appendChild(el("span", "test__mins", tt.mins + " min"));
    card.appendChild(run); card.appendChild(out);
    box.appendChild(card);
  });
  t.body.appendChild(box);
  t.body.appendChild(timeSpent);
  t.body.appendChild(fb);

  bench.askLocate();

  const qs = [
    {
      id: "test-part", kind: "choice",
      ask: "Theory confirmed. What is actually wrong?",
      choices: () => ordShuffle("test-part", MOBILE_FAULTS.map((f) => f.part)),
      answer: () => G.fault.part,
      why: () => G.fault.root + " " + G.fault.fixes
    }
  ];
  allQs = allQs.concat(renderQuestions(t.body, qs));
  return t;
}

/* Step four on the mobile track is a decision with a price on it. Repair,
   replace, claim, clean, or change a setting — and back it up first if the
   device is leaving the user's hands. */
function mobStepPlan(t) {
  const d = G.device;
  t.body.appendChild(el("p", "step__hint",
    "<strong>This one is a business decision, not a technical one.</strong> What it costs to fix, what the device is " +
    "worth now, whether anyone else is paying, and whether the user's data survives. Get those four in the right " +
    "order and the technical part is the easy half."));

  const m = el("div", "money");
  m.innerHTML =
    `<span>Bought for <b>${money(d.newPrice)}</b></span>` +
    `<span>Worth today <b>${money(d.residual)}</b></span>` +
    `<span>Repair <b>${G.repairCost === null ? "n/a" : money(G.repairCost)}</b></span>` +
    `<span>Age <b>${d.ageMonths} mo</b></span>` +
    `<span>Warranty <b>${d.warranty ? "in cover" : "expired"}</b></span>`;
  t.body.appendChild(m);

  /* The backup question comes before the decision, because it is the one
     that cannot be undone afterwards. */
  t.body.appendChild(el("p", "step__hint",
    "<strong>Before anything else.</strong> Last backup: <em>" + esc(d.lastBackup) + "</em>."));
  const buBox = el("div", "ship");
  const needBackupNow = G.backup.required || /never|months/.test(d.lastBackup);
  [["backup", "Back the device up before doing anything else"],
  ["skip", "Get on with the fix — a backup is not needed for this ticket"]].forEach(([k, lbl]) => {
    const l = el("label");
    if ((k === "backup") === needBackupNow) l.setAttribute("data-correct", "1");
    l.innerHTML = `<input type="radio" name="mobbackup" value="${k}"><span>${esc(lbl)}</span>`;
    buBox.appendChild(l);
  });
  t.body.appendChild(buBox);

  t.body.appendChild(el("p", "step__hint", "<strong>And then?</strong>"));
  const outBox = el("div", "ship");
  OUTCOMES.forEach((o) => {
    const l = el("label");
    if (o.key === G.outcome) l.setAttribute("data-correct", "1");
    l.innerHTML = `<input type="radio" name="moboutcome" value="${esc(o.key)}"><span>${esc(o.label)}</span>`;
    outBox.appendChild(l);
  });
  t.body.appendChild(outBox);

  const done = el("button", "btn", "Commit to it"); done.type = "button";
  done.style.marginTop = ".7rem";
  const fb = el("p", "fb"); fb.style.display = "none";
  done.addEventListener("click", () => {
    const bu = t.body.querySelector('input[name="mobbackup"]:checked');
    const oc = t.body.querySelector('input[name="moboutcome"]:checked');
    if (!bu || !oc) {
      fb.style.display = ""; fb.className = "fb fb--no";
      fb.innerHTML = "Not yet" + '<span class="fb__why">Answer the backup question and choose what happens to the device.</span>';
      return;
    }
    const stale = /never|months/.test(d.lastBackup);
    /* A backup is required whenever the device leaves the user's hands, and
       whenever what is on it is already at risk. */
    const backupNeeded = G.backup.required || stale;
    const backupOk = (bu.value === "backup") === backupNeeded;
    const outcomeOk = oc.value === G.outcome;
    const ok = backupOk && outcomeOk;
    let msg = "";
    if (!backupOk) {
      msg = backupNeeded
        ? "Back it up first. The last backup was " + d.lastBackup + " and " +
          (G.backup.required ? "this device is about to leave the user's hands." :
            "there is nothing protecting what is on it right now.") + " "
        : "A backup is not wrong, it is just not the thing standing between this user and a working device. ";
    }
    msg += outcomeWhy(d, G.fault, oc.value);
    graded["plan-order"] = ok;
    fb.style.display = "";
    fb.className = "fb " + (ok ? "fb--ok" : "fb--no");
    fb.innerHTML = (ok ? "Correct" : "Not yet") + '<span class="fb__why">' + esc(msg) + "</span>";
    updateScore();
  });
  t.body.appendChild(done); t.body.appendChild(fb);
  return t;
}

/* =====================================================================
   Virtualization and cloud track — steps three and four
   ===================================================================== */

function cloudStepTest(t) {
  const ds = datastoreRows(G);
  const gs = guestRows(G);
  const tests = cloudBenchTests(G);

  const gp = el("div", "panel");
  gp.appendChild(el("h3", null, "Guests on this host"));
  gs.forEach((g) => { g._bad = g._bad; });
  gp.appendChild(table(["Machine", "Role", "Memory assigned", "Needs at least", "vCPU"], gs,
    (r) => `<td>${esc(r.name)}</td><td>${esc(r.role)}</td><td>${r.ram}GB</td>` +
      `<td>${r.minRam}GB</td><td>${r.cores}</td>`));
  t.body.appendChild(gp);

  const dp = el("div", "panel");
  dp.appendChild(el("h3", null, "Datastores"));
  ds.forEach((d) => {
    const b = el("div", "bar");
    b.appendChild(el("span", "test__mins", esc(d.name)));
    const tr = el("div", "bar__track");
    const fl = el("div", "bar__fill" + (d._bad ? " bar__fill--hatch" : ""));
    fl.style.width = Math.min(100, Math.round(100 * d.desktops / d.capacity)) + "%";
    tr.appendChild(fl);
    b.appendChild(tr);
    b.appendChild(el("span", "bar__n", d.desktops + " desktops of " + d.capacity + (d._bad ? " \u2717" : " \u2713")));
    dp.appendChild(b);
    dp.appendChild(el("p", "count", esc(d.name) + " latency: " + d.latencyIdle +
      "ms idle, " + d.latencyPeak + "ms at peak" + (d._bad ? " — that is queueing, not working" : "")));
  });
  t.body.appendChild(dp);

  t.body.appendChild(el("p", "step__hint",
    "<strong>One test at a time.</strong> Rebuilding the host takes four hours and every guest goes down with it. " +
    "It is on the list because somebody always suggests it."));

  const bench = partBench(t, hostModel(G));

  const box = el("div", "tests");
  const benchHint = hintBox(box);
  const ran = {};
  let benchClean = true;
  const timeSpent = el("p", "count", "Time spent: 0 minutes");
  const fb = el("p", "fb"); fb.style.display = "none";
  tests.forEach((tt) => {
    const card = el("div", "test");
    const out = el("span", "test__out"); out.hidden = true;
    const run = el("button", "btn", "Run"); run.type = "button";
    run.addEventListener("click", () => {
      ran[tt.key] = true;
      out.hidden = false; out.textContent = tt.result; run.disabled = true;
      const spent = tests.filter((x) => ran[x.key]).reduce((a, x) => a + x.mins, 0);
      timeSpent.textContent = "Time spent: " + spent + " minutes";
      /* Running a test that cannot isolate anything is not a wrong answer,
         it is wasted bench time — so it counts the same way. */
      if (tt.isolating) benchHint.right(); else benchHint.wrong(CONTROL_HINTS.bench);
      if (tt.isolating) {
        const clean = tests.filter((x) => ran[x.key] && !x.isolating).length === 0;
        /* FINDING IT IS THE PASS. HOW TIDILY IS THE FEEDBACK.

           This used to be `graded["test-isolate"] = clean`, and `clean` is
           false the moment a student opens any other tool first. The button
           then disables, so the flag could never become true again — and
           step four gates on `=== true`. A student who explored one wrong
           tool before finding the right one had the rest of the ticket
           locked against them permanently, with a lock message telling them
           to finish a step they had just finished.

           Trying the wrong instrument first is what diagnosis looks like.
           It costs bench time, it is said plainly in the feedback below, and
           it does not take the ticket away. */
        graded["test-isolate"] = true;
        benchClean = clean;
        fb.style.display = "";
        fb.className = "fb " + (clean ? "fb--ok" : "fb--no");
        fb.innerHTML = (clean ? "Correct" : "Confirmed, eventually") + '<span class="fb__why">' +
          esc(clean
            ? "Straight to it, in " + tt.mins + " minutes. Most of this track is arithmetic and a console — the answer is usually a number somebody has not added up."
            : "That is the isolating test, but you spent " + spent + " minutes getting there" +
              (ran.rebuild ? " — including rebuilding a host that was never the problem." : ".")) + "</span>";
        updateScore();
      }
    });
    card.appendChild(el("span", "test__label", esc(tt.label)));
    card.appendChild(el("span", "test__mins", tt.mins + " min"));
    card.appendChild(run); card.appendChild(out);
    box.appendChild(card);
  });
  t.body.appendChild(box);
  t.body.appendChild(timeSpent);
  t.body.appendChild(fb);

  const qs = [
    {
      id: "test-part", kind: "choice",
      ask: "Theory confirmed. What is actually wrong?",
      choices: () => ordShuffle("test-part", CLOUD_FAULTS.map((f) => f.part)),
      answer: () => G.fault.part,
      why: () => G.fault.root + " " + G.fault.fixes
    }
  ];
  allQs = allQs.concat(renderQuestions(t.body, qs));
  bench.askLocate();
  return t;
}

/* Step four. Set the allocation, test it against a host with a finite amount
   of everything, then say what actually fixes the ticket — which on four of
   the seven is not the allocation at all. */
function cloudStepPlan(t) {
  const h = G.host;
  t.body.appendChild(el("p", "step__hint",
    "<strong>The host has a fixed amount of everything.</strong> Every guest needs its minimum or it will not run, " +
    "the total cannot exceed what the host owns once the hypervisor has its share, and anything you hand out beyond " +
    "what a machine needs is capacity the next request cannot have. " +
    TRACKS.cloud.faults.filter((f) => f.kind !== "resource").length + " of the " +
    TRACKS.cloud.faults.length + " faults on this track are not allocation faults at all, and on those the " +
    "right answer is to leave these numbers alone."));

  const alloc = {};
  h.guests.forEach((g) => { alloc[g.name] = { ram: G.found[g.name].ram, cores: G.found[g.name].cores }; });

  const wrap = el("div", "panel");
  wrap.appendChild(el("h3", null, "Resource allocation"));
  const inputs = {};
  h.guests.forEach((g) => {
    const row = el("div", "cfgrow");
    row.appendChild(el("span", "cfgrow__label", esc(g.name)));
    const ri = el("input"); ri.type = "number"; ri.min = "0"; ri.step = "1";
    ri.value = String(alloc[g.name].ram);
    ri.setAttribute("aria-label", g.name + " memory in GB");
    ri.addEventListener("input", () => { alloc[g.name].ram = parseInt(ri.value, 10) || 0; });
    const ci = el("input"); ci.type = "number"; ci.min = "0"; ci.step = "1";
    ci.value = String(alloc[g.name].cores);
    ci.setAttribute("aria-label", g.name + " vCPU count");
    ci.addEventListener("input", () => { alloc[g.name].cores = parseInt(ci.value, 10) || 0; });
    inputs[g.name] = { ram: ri, cores: ci };
    row.appendChild(el("span", "cfgrow__unit", "GB"));
    row.appendChild(ri);
    row.appendChild(el("span", "cfgrow__unit", "vCPU"));
    row.appendChild(ci);
    wrap.appendChild(row);
  });
  wrap.appendChild(el("p", "count",
    "Host: " + h.ramGb + "GB physical, " + h.hvRamGb + "GB reserved for the hypervisor, " +
    (h.ramGb - h.hvRamGb) + "GB available to guests \u00b7 " + h.cores + " physical cores"));
  t.body.appendChild(wrap);

  const revert = el("button", "btn btn--peek", "Put it back the way I found it");
  revert.type = "button"; revert.style.marginTop = ".6rem"; revert.style.cursor = "pointer";
  revert.addEventListener("click", () => {
    h.guests.forEach((g) => {
      alloc[g.name].ram = G.found[g.name].ram; alloc[g.name].cores = G.found[g.name].cores;
      inputs[g.name].ram.value = String(G.found[g.name].ram);
      inputs[g.name].cores.value = String(G.found[g.name].cores);
    });
  });
  t.body.appendChild(revert);

  const testBtn = el("button", "btn", "Check the allocation");
  testBtn.type = "button"; testBtn.style.marginTop = ".6rem"; testBtn.style.marginLeft = ".4rem";
  const results = el("div");
  testBtn.addEventListener("click", () => {
    const rows = checkAllocation(h, alloc);
    rows.forEach((r) => { r._bad = !r.ok; });
    results.innerHTML = "";
    results.appendChild(table(["Check", "Result", "Why"], rows,
      (r) => `<td>${esc(r.label)}</td><td>${r.ok ? "\u2713 pass" : "\u2717 fail"}</td>` +
        `<td class="wrapcell">${esc(r.why)}</td>`));
  });
  t.body.appendChild(testBtn); t.body.appendChild(results);

  t.body.appendChild(el("p", "step__hint", "<strong>And what actually fixes the ticket?</strong>"));
  const acts = el("div", "ship");
  CLOUD_ACTIONS.forEach((a) => {
    const l = el("label");
    if (a.key === G.action) l.setAttribute("data-correct", "1");
    l.innerHTML = `<input type="radio" name="cloudaction" value="${esc(a.key)}"><span>${esc(a.label)}</span>`;
    acts.appendChild(l);
  });
  t.body.appendChild(acts);

  const done = el("button", "btn", "Close the ticket"); done.type = "button";
  done.style.marginTop = ".7rem";
  const fb = el("p", "fb"); fb.style.display = "none";
  done.addEventListener("click", () => {
    const sel = t.body.querySelector('input[name="cloudaction"]:checked');
    if (!sel) {
      fb.style.display = ""; fb.className = "fb fb--no";
      fb.innerHTML = "Not yet" + '<span class="fb__why">Say what fixes it before you close it.</span>';
      return;
    }
    const rows = checkAllocation(h, alloc);
    const allPass = rows.every((r) => r.ok);
    const untouched = h.guests.every((g) =>
      alloc[g.name].ram === G.found[g.name].ram && alloc[g.name].cores === G.found[g.name].cores);
    const actionOk = sel.value === G.action;
    const isResource = G.fault.kind === "resource";
    let ok, msg;
    if (isResource) {
      ok = allPass && actionOk;
      msg = !allPass
        ? "The allocation still does not work: " + rows.filter((r) => !r.ok).map((r) => r.label.split(":")[0]).join("; ") +
          ". Check it and read which line fails."
        : actionOk ? cloudActionWhy(G.fault, sel.value) + " Every check passes."
          : "The allocation is right now. " + cloudActionWhy(G.fault, sel.value);
    } else {
      ok = untouched && actionOk;
      msg = !untouched
        ? "You changed an allocation that was already sound. Nothing on this ticket was a capacity problem, and now the host is configured differently for no reason anybody will be able to explain in six months. " +
          cloudActionWhy(G.fault, sel.value)
        : cloudActionWhy(G.fault, sel.value);
    }
    graded["plan-order"] = ok;
    fb.style.display = "";
    fb.className = "fb " + (ok ? "fb--ok" : "fb--no");
    fb.innerHTML = (ok ? "Correct" : "Not yet") + '<span class="fb__why">' + esc(msg) + "</span>";
    updateScore();
  });
  t.body.appendChild(done); t.body.appendChild(fb);
  return t;
}

/* =====================================================================
   Mixed track — steps three and four

   The graded skill here is scoping, and scoping has two halves. Naming the
   domain the fault lives in is the obvious one. Ruling the innocent domain
   out with a piece of evidence — rather than a shrug — is the one nobody
   drills and the one that separates a technician from a parts-swapper.
   ===================================================================== */

function mixedStepTest(t) {
  t.body.appendChild(el("p", "step__hint",
    "<strong>Four domains. Which of them is this in?</strong> Mark every one, and be as sure about the ones you " +
    "are ruling out as the one you are ruling in. &ldquo;Probably not&rdquo; is not a finding; a reason is."));

  const verdicts = ordShuffle("mixed-domains", G.verdicts.slice());
  const box = el("div", "claims");
  verdicts.forEach((v, i) => {
    const card = el("div", "claim");
    card.setAttribute("data-verdict", "Answer: " + (v.implicated ? "implicated" : "ruled out"));
    card.appendChild(el("p", "claim__text", esc(v.label)));
    const opts = el("div", "claim__opts");
    [["in", "The fault is here"], ["out", "Ruled out"]].forEach(([val, lbl]) => {
      const l = el("label");
      l.innerHTML = `<input type="radio" name="dom${i}" value="${val}"><span>${esc(lbl)}</span>`;
      opts.appendChild(l);
    });
    card.appendChild(opts);
    box.appendChild(card);
  });
  t.body.appendChild(box);

  const chk = el("button", "btn", "Scope it"); chk.type = "button";
  chk.style.marginTop = ".7rem";
  const fb = el("p", "fb"); fb.style.display = "none";
  chk.addEventListener("click", () => {
    const picks = verdicts.map((v, i) => {
      const sel = box.querySelector(`input[name="dom${i}"]:checked`);
      return sel ? sel.value : null;
    });
    if (picks.some((x) => x === null)) {
      fb.style.display = ""; fb.className = "fb fb--no";
      fb.innerHTML = "Not yet" + '<span class="fb__why">Mark all four. Leaving one blank is not the same as ruling it out.</span>';
      return;
    }
    const wrong = verdicts.filter((v, i) => (picks[i] === "in") !== v.implicated);
    const ok = wrong.length === 0;
    graded["test-isolate"] = ok;
    fb.style.display = "";
    fb.className = "fb " + (ok ? "fb--ok" : "fb--no");
    fb.innerHTML = (ok ? "Correct" : "Not yet") + '<span class="fb__why">' + esc(
      (ok ? "" : "Not right yet: " + wrong.map((v) => v.label.split(" — ")[0] + " is " +
        (v.implicated ? "where the fault is. " : "not where the fault is. ") + v.evidence).join("  ") + "  ") +
      "The call came in as " + G.scope.reported.label.split(" — ")[0].toLowerCase() +
      " and the fault lives in " + G.scope.actual.label.split(" — ")[0].toLowerCase() +
      ". " + G.fault.clears.evidence) + "</span>";
    updateScore();
  });
  t.body.appendChild(chk); t.body.appendChild(fb);

  const qs = [
    {
      id: "test-part", kind: "choice",
      ask: "So what is actually wrong?",
      choices: () => ordShuffle("test-part", MIXED_FAULTS.map((f) => f.part)),
      answer: () => G.fault.part,
      why: () => G.fault.root + " " + G.fault.fixes
    }
  ];
  allQs = allQs.concat(renderQuestions(t.body, qs));
  return t;
}

function mixedStepPlan(t) {
  t.body.appendChild(el("p", "step__hint",
    "<strong>Fix the thing that is broken, not the thing that was reported.</strong> Half of these options address " +
    "the domain the caller named, and every one of them costs somebody money for nothing."));

  const acts = el("div", "ship");
  MIXED_ACTIONS.forEach((a) => {
    const l = el("label");
    if (a.key === G.action) l.setAttribute("data-correct", "1");
    l.innerHTML = `<input type="radio" name="mixaction" value="${esc(a.key)}"><span>${esc(a.label)}</span>`;
    acts.appendChild(l);
  });
  t.body.appendChild(acts);

  const done = el("button", "btn", "Close the ticket"); done.type = "button";
  done.style.marginTop = ".7rem";
  const fb = el("p", "fb"); fb.style.display = "none";
  done.addEventListener("click", () => {
    const sel = t.body.querySelector('input[name="mixaction"]:checked');
    if (!sel) {
      fb.style.display = ""; fb.className = "fb fb--no";
      fb.innerHTML = "Not yet" + '<span class="fb__why">Say what fixes it before you close it.</span>';
      return;
    }
    const ok = sel.value === G.action;
    graded["plan-order"] = ok;
    fb.style.display = "";
    fb.className = "fb " + (ok ? "fb--ok" : "fb--no");
    fb.innerHTML = (ok ? "Correct" : "Not yet") + '<span class="fb__why">' +
      esc(mixedActionWhy(G.fault, sel.value)) + "</span>";
    updateScore();
  });
  t.body.appendChild(done); t.body.appendChild(fb);
  return t;
}

/* What each step requires before it counts as finished. A step opens when
   the one before it is finished — not merely attempted. A wrong conclusion
   carried forward is how a tech ends up replacing a motherboard because a
   coin cell was flat. */
const REQUIRED = {
  identify: ["identify-claims", "identify-symptom", "identify-backup"],
  theory: ["theory-cause", "theory-evidence"],
  test: ["test-isolate", "test-part"],
  plan: ["plan-order"],
  verify: ["verify-what", "verify-prevent"],
  document: ["doc-content", "doc-caller"]
};

/* Three of the five tracks have a physical model to point at, so step three
   carries an extra graded answer on those and not on the other two. Building
   the list per track rather than hard-coding it keeps cloud and mixed
   tickets from waiting forever on an id their page never renders. */
const BENCH_TRACKS = ["hardware", "mobile", "network"];

/* The printer tracks grade a different set: step four is a procedure rather
   than a part, step five adds the cleaning, and the laser repeating-defect
   ticket adds the measurement. Held per render rather than as a static list,
   because the measurement question only exists on one of the tickets
   and gating on an id the page never rendered would lock the step forever. */
let stepRequired = null;

function requiredFor(key) {
  if (stepRequired && stepRequired[key]) return stepRequired[key];
  const base = REQUIRED[key];
  return key === "test" && BENCH_TRACKS.indexOf(track) !== -1
    ? base.concat(["test-locate"]) : base;
}

function applyGates() {
  let prevComplete = true;                 // step one is always open
  STEPS.forEach((s) => {
    const sec = document.querySelector(`.step[data-step="${s.key}"]`);
    if (!sec) return;
    const ids = requiredFor(s.key);
    const complete = ids.every((id) => graded[id] === true);
    const open = instructor || prevComplete;
    sec.classList.toggle("step--locked", !open);
    sec.classList.toggle("step--done", complete);
    const lock = sec.querySelector(".lockbox");
    if (lock) {
      lock.hidden = open;
      if (!open) {
        const prev = STEPS[s.n - 2];
        lock.innerHTML = "<strong>Locked.</strong> Finish step " + (s.n - 1) + " &mdash; " +
          esc(prev.name.toLowerCase()) + " &mdash; first. The methodology is a sequence for a reason: " +
          "a conclusion you skipped is one you carry into every step after it.";
      }
    }
    const st = sec.querySelector(".step__state");
    if (st) st.textContent = !open ? "Locked" : complete ? "Done" : "In progress";
    prevComplete = complete;
  });
}

/* ---------------- render ---------------- */
function render() {
  /* Clearing the container removes the canvas but leaves the old render loop
     running against a detached context. Shut it down first or every shuffle
     leaks one. */
  if (liveScene) { try { liveScene.dispose(); } catch (e) {} liveScene = null; }
  G = buildTicket(sessionSeed, slot, track,
    objective ? (f) => faultObjective(track, f, primaryFor) === objective : null);
  allQs = [];
  Object.keys(graded).forEach((k) => delete graded[k]);

  if (track === "laptop") {
    stepRequired = {
      test: ["test-isolate", "test-locate", "test-part", "test-depth"],
      plan: ["plan-procedure"],
      verify: ["verify-what", "verify-prevent"]
    };
  } else if (track === "cloud") {
    /* The cloud track got its bench last, and with it a locate answer. On
       thirteen of the seventeen the right answer there is "nothing on this
       host", which is the objective rather than an evasion. */
    stepRequired = {
      test: ["test-isolate", "test-locate", "test-part"],
      plan: ["plan-order"],
      verify: ["verify-what", "verify-prevent"]
    };
  } else if (track === "display") {
    stepRequired = {
      test: ["test-isolate", "test-locate", "test-part"],
      plan: ["plan-action"],
      verify: ["verify-what", "verify-prevent"]
    };
  } else if (track === "printnet") {
    stepRequired = {
      test: ["test-isolate", "test-locate", "test-part"],
      plan: ["plan-link", "plan-action", "plan-deploy"],
      verify: ["verify-what", "verify-prevent"]
    };
  } else if (track === "raid") {
    stepRequired = {
      test: ["test-isolate", "test-locate", "test-part", "test-usable", "test-tolerance"],
      plan: ["plan-class", "plan-action"],
      verify: ["verify-what", "verify-prevent"]
    };
  } else if (track === "power") {
    stepRequired = {
      test: ["test-isolate", "test-locate", "test-part"],
      plan: ["plan-scope", "plan-procedure"],
      verify: ["verify-what", "verify-prevent"]
    };
  } else if (track === "cabling") {
    /* The pair question only exists on the three faults that name pins, so
       it is only required on those three. Gating a step behind a question
       that was never rendered locks the page. */
    stepRequired = {
      test: ["open", "short", "revpair"].indexOf(G.fault.key) !== -1
        ? ["test-isolate", "test-pair", "test-locate", "test-part"]
        : ["test-isolate", "test-locate", "test-part"],
      plan: ["plan-terminate", "plan-action"],
      verify: ["verify-what", "verify-prevent"]
    };
  } else stepRequired = PRINTER_TRACKS.indexOf(track) === -1 ? null : {
    test: G.fault.key === "repeat"
      ? ["test-isolate", "test-interval", "test-locate", "test-part"]
      : ["test-isolate", "test-locate", "test-part"],
    plan: ["plan-procedure"],
    verify: ["verify-what", "verify-prevent", "verify-clean"]
  };

  document.getElementById("brief").innerHTML =
    `<strong>${esc(TRACKS[track].label)} ticket ${slot}</strong> &middot; ${esc(G.org.name)} &middot; ` +
    `${esc(G.caller.name)}, ${esc(G.caller.title)} &middot; raised ${esc(dayName(G.trueDay))} ` +
    `&middot; <strong>${esc(G.urgency.label)}</strong>`;

  const host = document.getElementById("steps");
  host.innerHTML = "";
  [stepIdentify(), stepTheory(), stepTest(), stepPlan(), stepVerify(), stepDocument()]
    .forEach((s) => host.appendChild(s.section));

  /* Register every graded control this track actually renders, derived from
     the gates' own required map rather than from a list typed here.

     The list WAS typed here, and it named three ids while eleven exist —
     test-locate, plan-procedure, verify-clean, plan-link, plan-deploy,
     plan-class, plan-scope and plan-terminate all wrote a grade that
     nothing was counting. The scorebar has been undercounting its own
     total ever since those controls were added ("answered 10 of 15" on a
     ticket holding eighteen), and a track can grade more things than it
     admits to needing. requiredFor() is what the gates consult, so
     deriving from it means a control added next year is counted the day it
     is written. */
  const known = new Set(allQs.map((q) => q.id));
  STEPS.forEach((st) => {
    requiredFor(st.key).forEach((id) => {
      if (!known.has(id)) { known.add(id); allQs.push({ id: id }); }
    });
  });
  applyInstructor();
  updateScore();
}

function applyInstructor() {
  document.body.classList.toggle("reveal", instructor);
  const tp = document.getElementById("truthPanel");
  if (tp) tp.hidden = !instructor;
  allQs.forEach((q) => {
    if (instructor) { if (q._reveal) q._reveal(); }
    else if (q._unreveal) q._unreveal();
  });
  applyGates();
}

/* ---------------- chrome ---------------- */
/* Objective first, then the sub-objective inside it. The picker owns both
   selects and knows which exercises live on which page, so choosing a
   drill from here simply goes to the drill page. */
const picker = mountPicker({
  page: "index",
  domSelect: document.getElementById("domainSelect"),
  exSelect: document.getElementById("trackSelect"),
  onChoose: (ex, obj) => {
    track = ex.track; objective = obj; slot = 1;
    rebuildSlots();
    render();
  }
});
if (picker.start && picker.start.ex) {
  track = picker.start.ex.track;
  objective = picker.start.ex.split ? picker.start.obj : null;
}

const sel = document.getElementById("slotSelect");

/* The slot list has to be rebuilt whenever the track changes, because the
   tracks are not the same size — fifteen faults on cabling, twenty-two on
   mobile. Building it once at startup was what pinned every track to the
   same five and made the rest unreachable. */
function rebuildSlots() {
  SLOTS = slotsFor(track, objective);
  if (slot > SLOTS) slot = 1;
  sel.innerHTML = "";
  for (let i = 1; i <= SLOTS; i++) {
    const o = document.createElement("option");
    o.value = String(i);
    o.textContent = "Ticket " + i + (progressHas(exerciseKey(), i) ? "  \u2713 done" : "");
    sel.appendChild(o);
  }
  sel.value = String(slot);
}
sel.addEventListener("change", () => { slot = parseInt(sel.value, 10); render(); });
/* Jump to the first ticket on this track they have not worked. Without this
   a student on a twenty-two ticket track has to remember where they were,
   which is exactly the job the progress store exists to take off them. */
const nextBtn = document.getElementById("nextNewBtn");
if (nextBtn) nextBtn.addEventListener("click", () => {
  const n = nextUnseen(exerciseKey(), SLOTS, slot);
  if (n === null) {
    nextBtn.textContent = "All worked on this track";
    nextBtn.disabled = true;
    return;
  }
  slot = n;
  document.getElementById("slotSelect").value = String(n);
  render();
});

const clearBtn = document.getElementById("clearProgBtn");
if (clearBtn) clearBtn.addEventListener("click", () => {
  /* Destructive and easy to hit by accident, so it asks once. It clears
     THIS track only — a student wanting to reset one subject should not
     lose the other twelve. */
  if (!window.confirm("Forget which tickets you have worked on this track? Nothing else is stored, and this cannot be undone.")) return;
  progressClear(exerciseKey());
  rebuildSlots();
  if (nextBtn) { nextBtn.disabled = false; nextBtn.innerHTML = "Next unworked &rarr;"; }
  render();
});

document.getElementById("shuffleBtn").addEventListener("click", () => {
  sessionSeed = Math.floor(Math.random() * 100000) + 1;
  render();
});

const ov = document.getElementById("pinOverlay");
const pinInput = document.getElementById("pinInput");
const pinErr = document.getElementById("pinErr");
const insBtn = document.getElementById("instructorBtn");
function closePin() { ov.classList.add("hidden"); pinInput.value = ""; pinErr.style.display = "none"; }
insBtn.addEventListener("click", () => {
  if (instructor) { instructor = false; insBtn.textContent = "Instructor mode"; applyInstructor(); return; }
  ov.classList.remove("hidden"); pinInput.focus();
});
document.getElementById("pinCancel").addEventListener("click", closePin);
document.getElementById("pinOk").addEventListener("click", tryPin);
pinInput.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); tryPin(); } });
ov.addEventListener("click", (e) => { if (e.target === ov) closePin(); });
function tryPin() {
  if (pinInput.value.trim() === PIN) {
    instructor = true; insBtn.textContent = "Instructor mode: on";
    closePin(); applyInstructor();
  } else { pinErr.style.display = ""; pinErr.textContent = "Wrong PIN."; }
}

(function () {
  const root = document.documentElement;
  const btn = document.getElementById("themeBtn");
  const KEY = "fsc-theme";
  const sys = () => window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  function apply(th) {
    root.setAttribute("data-theme", th);
    btn.textContent = th === "light" ? "Light" : "Dark";
    btn.setAttribute("aria-pressed", th === "light" ? "true" : "false");
    try { localStorage.setItem(KEY, th); } catch (e) { /* storage unavailable */ }
    /* The model reads its ground and its outlines off the page tokens, so it
       has to be told when they change or a dark model sits on a light page. */
    if (liveScene) { try { liveScene.retheme(); } catch (e) {} }
  }
  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) { /* storage unavailable */ }
  apply(saved === "light" || saved === "dark" ? saved : (root.getAttribute("data-theme") || sys()));
  btn.addEventListener("click", () => apply(root.getAttribute("data-theme") === "light" ? "dark" : "light"));
})();


/* Build the slot list before the first paint, or the dropdown keeps the
   five options the markup shipped with and the rest stay unreachable. */
rebuildSlots();
render();
