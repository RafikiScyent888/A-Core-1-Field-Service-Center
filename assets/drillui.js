/* =====================================================================
   Field Service Center — the drill interface

   Deliberately not the ticket page. A ticket is six gated steps because
   troubleshooting is a sequence; a drill is five items in a row because
   identification is not. What the two share is the discipline: the answer
   is never on the page, the wrong answers are all real, the page starts
   guiding on the third wrong attempt without ever giving it away, and
   every control is reachable and readable without a mouse or good sight.

   The 3D view is the exercise here rather than an illustration of it, so
   it gets the top of the page and the camera controls are labelled buttons
   like everywhere else on this build.
   ===================================================================== */

import { buildDrillItem, drillQuestions, DRILL_SLOTS, drillSlotsFor, DRILL_OBJECTIVES,
  SUBJECTS, CONNECTORS } from "./drill.js";
import { drillHints } from "./hints.js";
import { exerciseKeyFor, progressMark, progressCount, progressHas, nextUnseen,
  progressClear, progressAvailable } from "./progress.js";
import { connectorModel } from "./drillmodels.js";
import { accessoryModel } from "./drillaccmodels.js";
import { floorPlanModel } from "./drillwifimodel.js";
import { rackModel } from "./drillrackmodel.js";
import { addressModel } from "./drillnetconfmodel.js";
import { deviceModel } from "./drilldevicemodel.js";
import { sitePlanModel } from "./drillsohomodel.js";
import { linkPlanModel } from "./drillconnmodel.js";
import { toolModel } from "./drilltoolmodel.js";
import { panelSectionModel } from "./drillpanelmodel.js";
import { ramModel } from "./drillrammodel.js";
import { storageModel } from "./drillstoragemodel.js";
import { boardModel } from "./drillbuildmodel.js";
import { psuModel } from "./drillpsumodel.js";
import { printerModel } from "./drillprintmodel.js";
import { mountPicker } from "./picker.js";

/* One page, one engine, one set of rules \u2014 and a model builder per
   subject, because a connector and a docking station are not looked at the
   same way. */
const MODEL_FOR = { connectors: connectorModel, accessories: accessoryModel,
  wireless: floorPlanModel, hosts: rackModel, netconf: addressModel,
  devices: deviceModel, soho: sitePlanModel, links: linkPlanModel, tools: toolModel,
  panels: panelSectionModel, ram: ramModel, storage: storageModel, build: boardModel,
  psu: psuModel, printers: printerModel };

/* The ribbon drill draws the printer bench, because it is the same machine
   and a second copy of that geometry would drift from it. The two subjects
   describe a machine differently though — the printer-types pool identifies
   a machine by what it IS ("transfer"), the ribbon pool by which way round
   it is BUILT ("desk-l") — so the item is translated here, in one place,
   rather than either pool being bent to suit the other. A transfer machine
   is what makes the bench draw the second spindle and the take-up. */
MODEL_FOR.ribbon = function (D) {
  var m = D.item;
  return printerModel(Object.assign({}, D, {
    item: Object.assign({}, m, { key: m.direct ? "label" : "transfer" })
  }));
};

/* Mixed delegates its picture to whichever subject the item came from. A
   lookup keyed by the SUBJECT would have drawn nothing here, because the
   subject is "mixed" and mixed has no model of its own. */
MODEL_FOR.mixed = function (D) {
  var home = D.item && D.item._home;
  if (!home || !SUBJECTS[home]) {
    throw new Error('drillui: mixed dealt an item with no home subject.');
  }
  /* Not every subject HAS a model — 2.1 renders a rule table in its place.
     Returning null here is what lets the instrument branch run, and the
     first version threw instead, which broke every protocols item mixed
     dealt. A missing home is still an error; a home with no model is not. */
  return MODEL_FOR[home] ? MODEL_FOR[home](D) : null;
};

/* Objective 2.1 has nothing to put in front of a camera. Rather than fake a
   model, it gets the instrument a technician actually reads when ports
   matter: a firewall rule table with one rule highlighted and five real
   rules around it as noise. Same principle as the ticket tracks \u2014 the
   panel states values, never verdicts. */
/* A readings panel beside a model, for subjects where the picture shows
   where and the numbers say how much. Values only, never verdicts. */
function readingsPanel(title, rows) {
  var box = el("div", "readings");
  box.appendChild(el("h4", "readings__h", esc(title)));
  var dl = el("dl", "kv");
  rows.forEach(function (r) {
    dl.appendChild(el("dt", null, esc(r.k)));
    dl.appendChild(el("dd", null, esc(r.v)));
  });
  box.appendChild(dl);
  return box;
}

/* A TABLE AS THE INSTRUMENT, for subjects with nothing to put in front of a
   camera. This was hardwired to firewalls — the caption, the five column
   headings and the four row fields were all literals — so a second subject
   that needed a table had nowhere to go. It now takes a spec, and each
   subject describes its own instrument: a firewall rule list for 2.1, an
   access point's configuration page for wireless security.

   The highlighted row is a first-class idea and stays: one line matters and
   the rest are real entries doing real jobs, which is the whole exercise.

   SOME INSTRUMENTS ARE TWO TABLES. Memory channels needs the slots on the
   board AND what turned up in the box, and neither is readable folded into
   the other. So a spec may carry `tables: [...]`; a single-table spec is
   normalised into that shape here rather than supported as a second code
   path, because two code paths for one instrument is how the first version
   of this drifted. */
function instrumentTable(spec) {
  var wrap = el("div", "rules");
  var tables = spec.tables || [spec];
  tables.forEach(function (tb, i) {
    if (!tb.caption || !tb.columns || !tb.rows) {
      throw new Error("drillui: table " + (i + 1) + " of this instrument has no caption, " +
        "columns or rows.");
    }
    wrap.appendChild(el("p", "rules__cap", tb.caption));
    var scroll = el("div", "rules__scroll");
    var t = document.createElement("table");
    t.className = "rules__table";
    var head = document.createElement("tr");
    [""].concat(tb.columns).forEach(function (h) {
      var th = document.createElement("th");
      th.textContent = h;
      if (!h) th.setAttribute("aria-label", "Highlighted row");
      head.appendChild(th);
    });
    t.appendChild(head);
    tb.rows.forEach(function (r) {
      var tr = document.createElement("tr");
      if (r.subject) tr.className = "rules__row--subject";
      var mark = document.createElement("td");
      mark.textContent = r.subject ? "\u25B6" : "";
      if (r.subject) mark.setAttribute("aria-label", "This is the highlighted row");
      tr.appendChild(mark);
      r.cells.forEach(function (v) {
        var td = document.createElement("td");
        td.textContent = v;
        tr.appendChild(td);
      });
      t.appendChild(tr);
    });
    scroll.appendChild(t);
    wrap.appendChild(scroll);
  });
  return wrap;
}

function el(tag, cls, html) {
  var n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html !== undefined && html !== null) n.innerHTML = html;
  return n;
}
function esc(s) {
  return String(s).replace(/[&<>"]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
  });
}

/* WebGL is probed here rather than in the scene module, so a browser that
   cannot run it never loads the renderer at all. */
function webglOk() {
  try {
    var c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch (e) { return false; }
}

var SEED = Math.floor(Math.random() * 90000) + 1000;
var SLOT = 1;
var SUBJECT = "connectors";
var answered = 0, correct = 0;
/* Per ITEM, not per session. The two counters above run cumulatively across
   a subject, so they cannot tell when one item has been finished — which is
   the moment the progress mark is earned. */
var itemAnswered = 0, itemCorrect = 0, itemTotal = 0;
var liveScene = null;

/* Options are shuffled per question so their order is not a tell, and the
   shuffle is seeded so the same seed gives the same page twice. */
function ordShuffle(key, list, seedBase) {
  var h = 0;
  for (var i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  var s = (seedBase + h) >>> 0;
  var out = list.slice();
  for (var j = out.length - 1; j > 0; j--) {
    s = (s * 1664525 + 1013904223) >>> 0;
    var k = s % (j + 1); var t = out[j]; out[j] = out[k]; out[k] = t;
  }
  return out;
}

function renderQuestion(host, q, D) {
  var wrap = el("div", "q");
  wrap.appendChild(el("p", "q__ask", esc(q.ask)));

  var row = el("div", "q__row");
  var sel = document.createElement("select");
  /* .ans is the styling the ticket pages already use and already pass AAA on;
     without it these fell through to the header's dark select rule. */
  sel.className = "ans";
  sel.setAttribute("aria-label", q.ask);
  var blank = document.createElement("option");
  blank.value = ""; blank.textContent = "— select —";
  sel.appendChild(blank);
  ordShuffle(q.id, q.choices, D.seedBase).forEach(function (c) {
    var o = document.createElement("option");
    o.value = c; o.textContent = c;
    sel.appendChild(o);
  });
  var btn = el("button", "btn", "Check");
  btn.type = "button";
  row.appendChild(sel); row.appendChild(btn);
  wrap.appendChild(row);

  var fb = el("div", "fb");
  fb.setAttribute("role", "status");
  fb.setAttribute("aria-live", "polite");
  wrap.appendChild(fb);

  /* Instructor mode. The answer lives in a data attribute that only ever
     reaches the screen when the body carries the reveal class, so a student
     reading the DOM finds the same thing a student reading the page does. */
  fb.dataset.answer = q.answer;

  var ladder = drillHints(q, SUBJECTS[SUBJECT].instrument || "model");
  var wrong = 0, done = false;
  btn.addEventListener("click", function () {
    if (done || !sel.value) return;
    var chosen = sel.value;
    var right = chosen === q.answer;
    answered++;
    if (!q.__counted) { q.__counted = true; itemAnswered++; if (right) itemCorrect++; }
    else if (right && !q.__wasRight) { itemCorrect++; }
    q.__wasRight = q.__wasRight || right;
    if (itemTotal && itemAnswered >= itemTotal) {
      /* Worked, not necessarily right — the tick is for having done it. */
      progressMark(drillKey(), SLOT, itemCorrect >= itemTotal);
      markSlotDone(SLOT);
    }
    if (right) {
      correct++; done = true;
      sel.disabled = true; btn.disabled = true;
      wrap.classList.add("q--right");
      wrap.classList.remove("lit"); wrap.removeAttribute("data-lit");
      clearDrillHighlight();
      fb.innerHTML = '<span class="fb__ok">Correct.</span> ' + esc(q.why(chosen));
    } else {
      wrong++;
      wrap.classList.add("q--wrong");
      var msg = '<span class="fb__no">Not that one.</span> ' + esc(q.why(chosen));
      /* From the third wrong, one rung per attempt rather than the same
         sentence forever. */
      if (wrong >= 3) {
        var i = Math.min(wrong - 3, ladder.length - 1);
        msg += '<div class="hint"><b class="hint__n">Hint ' + (i + 1) + " of " + ladder.length +
          '</b><span class="hint__t">' + esc(ladder[i]) + "</span></div>";
      }
      fb.innerHTML = msg;
      /* Ladder spent: mark the instrument and the control, and offer a clean
         field. Same contract as the ticket steps — where to look and where to
         act, never which option. */
      if (wrong - 3 >= ladder.length - 1) {
        var marked = drillHighlight(wrap);
        var box = fb.querySelector(".hint");
        if (box && !box.querySelector(".hint__t--last")) {
          box.appendChild(el("span", "hint__t hint__t--last", marked
            ? "The answer is in what is marked, not in the options. Look again before you pick."
            : "Everything you need is on this page. Work it from there."));
          var again = el("button", "btn btn--again", "Clear my answer and try again");
          again.type = "button";
          again.addEventListener("click", function () {
            sel.value = "";
            wrap.classList.remove("q--wrong");
            fb.innerHTML = "";
            /* The hints and the wrong-count both survive: nothing earned is
               taken away, and nobody can farm a fresh ladder by failing. */
            fb.appendChild(box);
            again.disabled = true; again.textContent = "Cleared \u2014 your turn";
            sel.focus();
          });
          box.appendChild(again);
        }
      }
    }
    updateScore();
  });
  host.appendChild(wrap);
  return fb;
}

/* Marking, for the drills. The evidence here is whatever instrument this
   subject actually put on screen — the readings beside the model, the rule
   table, or the model stage itself — so it is found rather than named, and a
   subject added later is covered on the day it is written. */
var drillLit = [];
function clearDrillHighlight() {
  drillLit.forEach(function (n) { n.classList.remove("lit"); n.removeAttribute("data-lit"); });
  drillLit = [];
}
function drillHighlight(card) {
  clearDrillHighlight();
  var marks = [].slice.call(document.querySelectorAll(".readings, .rules, .bench"));
  marks.forEach(function (n, i) {
    n.classList.add("lit");
    n.setAttribute("data-lit", marks.length > 1 ? "Look here " + (i + 1) + " of " + marks.length : "Look here");
    drillLit.push(n);
  });
  card.classList.add("lit");
  card.setAttribute("data-lit", "Change this");
  drillLit.push(card);
  return marks.length;
}

/* How many items this subject actually has. Read from the pool rather than
   from a constant, so a subject that grows is reachable the moment it does
   — the old flat 5 was silently hiding two-thirds of every subject. */
function slotCount() { return drillSlotsFor(SUBJECT); }

function drillKey() { return exerciseKeyFor("drill", SUBJECT); }

/* Update the one option rather than rebuilding the list, so the dropdown
   does not close under the student mid-item. */
function markSlotDone(n) {
  var sel = document.getElementById("slotSelect");
  if (!sel) return;
  var o = sel.querySelector('option[value="' + n + '"]');
  if (o && o.textContent.indexOf("\u2713") === -1) o.textContent = "Item " + n + "  \u2713 done";
}

/* Rebuilt on every subject change, because the subjects are not the same
   size — fourteen items on tools, twenty on protocols. Building this once
   at startup was what pinned every subject to five. */
function rebuildSlots() {
  var sel = document.getElementById("slotSelect");
  if (!sel) return;
  var total = slotCount();
  if (SLOT > total) SLOT = 1;
  sel.innerHTML = "";
  for (var i = 1; i <= total; i++) {
    var o = document.createElement("option");
    o.value = String(i);
    o.textContent = "Item " + i + (progressHas(drillKey(), i) ? "  \u2713 done" : "");
    sel.appendChild(o);
  }
  sel.value = String(SLOT);
}

function updateScore() {
  var s = document.getElementById("score");
  if (!s) return;
  s.innerHTML = "Answered <strong>" + answered + "</strong> &middot; Correct <strong>" + correct +
    "</strong> &middot; Accuracy <strong>" +
    (answered ? Math.round((correct / answered) * 100) : 0) + "%</strong> &middot; Item <strong>" +
    SLOT + "</strong> of " + slotCount() +
    (progressAvailable() ? " &middot; Worked <strong>" + progressCount(drillKey()) +
      "</strong> of " + slotCount() + " in this subject" : "");
}

function mountModel(stage, cam, model) {
  if (!webglOk()) {
    stage.innerHTML = "";
    stage.appendChild(el("p", "bench__nogl",
      "This browser has WebGL switched off, so there is no 3D view. The written description " +
      "beside this says everything the model would have shown you, and the drill grades the same."));
    return;
  }
  var loading = el("p", "count", "Loading the model…");
  stage.appendChild(loading);
  import("./scene.js").then(function (S) {
    /* A plan needs room. A connector at 400px is a connector; a floor plan
       at 400px is a smudge with rings on it. */
    var h = S.mountScene(stage, model, { height: model.parts.length > 1 ? 560 : 400 });
    if (!h) { stage.innerHTML = ""; stage.appendChild(el("p", "bench__nogl", "The 3D view could not start.")); return; }
    liveScene = h;
    if (loading.parentNode) loading.remove();
    [["←", "Rotate the view left", function () { h.orbit(-0.3, 0); }],
     ["→", "Rotate the view right", function () { h.orbit(0.3, 0); }],
     ["↑", "Tilt the view up", function () { h.orbit(0, 0.18); }],
     ["↓", "Tilt the view down", function () { h.orbit(0, -0.18); }],
     ["＋", "Zoom in", function () { h.zoom(-1.2); }],
     ["−", "Zoom out", function () { h.zoom(1.2); }],
     ["Reset", "Reset the view", function () { h.reset(); }]].forEach(function (spec) {
      var b = el("button", "btn btn--cam", spec[0]);
      b.type = "button";
      b.setAttribute("aria-label", spec[1]); b.title = spec[1];
      b.addEventListener("click", spec[2]);
      cam.appendChild(b);
    });
  }).catch(function () {
    stage.innerHTML = "";
    stage.appendChild(el("p", "bench__nogl", "The 3D view could not load. The description beside it still holds."));
  });
}

function navRow() {
  var nav = el("div", "drillnav");
  var prev = el("button", "btn", "\u2190 Previous item");
  prev.type = "button"; prev.disabled = SLOT === 1;
  prev.addEventListener("click", function () { SLOT--; render(); window.scrollTo(0, 0); });
  var next = el("button", "btn btn--go", SLOT === slotCount() ? "Start this subject again" : "Next item \u2192");
  next.type = "button";
  next.addEventListener("click", function () {
    if (SLOT === slotCount()) { SEED = Math.floor(Math.random() * 90000) + 1000; SLOT = 1; }
    else SLOT++;
    render(); window.scrollTo(0, 0);
  });
  nav.appendChild(prev); nav.appendChild(next);
  return nav;
}

export function render() {
  var app = document.getElementById("app");
  /* LET GO OF THE OLD SCENE BEFORE THROWING THE PAGE AWAY.
     Emptying the container drops the canvas out of the document but leaves
     the WebGL context, its geometries, its materials and its environment
     probe alive with nothing pointing at them. A student working through a
     drill subject changes item a dozen times in a sitting and a browser
     will only hold so many contexts before it starts dropping the oldest,
     at which point a model quietly stops appearing.

     Measured: the sweep that opens all 329 drill items slowed from 223s to
     359s over the session and began failing on an item near the end with
     "nothing rendered" — an item that loads in 1.4 seconds every time when
     it is opened on its own. The leak was always here; giving every scene
     its own environment probe, which was the right fix for a different
     bug, made each leaked scene several times heavier and turned a slow
     creep into a failure. */
  if (liveScene) { try { liveScene.dispose(); } catch (e) {} }
  liveScene = null;
  app.innerHTML = "";

  var D = buildDrillItem(SEED, SLOT, SUBJECT);
  var subject = DRILL_OBJECTIVES[SUBJECT];
  var model = MODEL_FOR[SUBJECT] ? MODEL_FOR[SUBJECT](D) : null;

  /* ---- the pairing, stated rather than implied ---- */
  var head = el("section", "step step--open");
  var hh = el("div", "step__head");
  hh.appendChild(el("h2", null, "Identify it \u2014 " + esc(subject.title)));
  hh.appendChild(el("span", "step__tag", esc(subject.home)));
  head.appendChild(hh);
  var hb = el("div", "step__body");
  hb.appendChild(el("p", "pairing", esc(subject.pairing)));
  head.appendChild(hb);
  app.appendChild(head);

  /* ---- the item ---- */
  var box = el("section", "step step--open");
  var bh = el("div", "step__head");
  bh.appendChild(el("h2", null, "Item " + SLOT + " of " + slotCount()));
  /* "In your hand" is right for a connector and wrong for a firewall rule.
     This was a ternary chain keyed by subject with "In your hand" as its
     default, which is the eighth time this build has had a table keyed by
     item that did not grow with the items: every subject added after it was
     written silently got the connector's caption. The tag lives on the
     subject now, and a subject without one says so. */
  var tag = SUBJECTS[SUBJECT].tag;
  if (!tag) {
    throw new Error('drillui: subject "' + SUBJECT + '" has no tag, so the caption above the ' +
      'item would silently read "In your hand" whatever the item actually is.');
  }
  bh.appendChild(el("span", "step__tag", tag));
  box.appendChild(bh);
  var body = el("div", "step__body");

  if (!model) {
    /* No model, so the instrument stands in its place. */
    /* Mixed has no rules of its own; the item's home subject does. */
    var rulesFn = SUBJECTS[SUBJECT].rules ||
      (D.item && D.item._home && SUBJECTS[D.item._home].rules);
    if (!rulesFn) {
      throw new Error('drillui: subject "' + SUBJECT + '" has neither a model nor a table, ' +
        'so there is nothing to put in front of the student.');
    }
    var spec = rulesFn(D);
    var ok = spec && (spec.tables ? spec.tables.length : (spec.rows && spec.columns && spec.caption));
    if (!ok) {
      throw new Error('drillui: subject "' + SUBJECT + '" returned an instrument with no ' +
        'tables, or a table with no caption, columns or rows. Each subject describes its own.');
    }
    body.appendChild(instrumentTable(spec));
    var qhostR = el("div", "qs");
    var qsR = drillQuestions(D);
    itemAnswered = 0; itemCorrect = 0; itemTotal = qsR.length;
    qsR.forEach(function (q) { renderQuestion(qhostR, q, D); });
    body.appendChild(qhostR);
    body.appendChild(navRow());
    box.appendChild(body);
    app.appendChild(box);
    updateScore();
    if (document.body.classList.contains("reveal")) applyReveal();
    return;
  }

  /* A one-object model sits beside its reading in two columns. A model with
     a legend does not: six readings stacked in a narrow right-hand column
     left a screen and a half of white space beside a 400px canvas. So a
     multi-part model goes full width, gets a taller stage, and puts its
     legend underneath in columns. */
  var wide = model.parts.length > 1;
  var bench = el("div", "bench" + (wide ? " bench--wide" : ""));
  var view = el("div", "bench__view");
  var stage = el("div", "bench__stage");
  var cam = el("div", "bench__cam");
  view.appendChild(stage); view.appendChild(cam);
  bench.appendChild(view);

  var list = el("div", "bench__list");
  list.appendChild(el("h4", null, esc(model.title)));
  list.appendChild(el("p", "count", esc(model.caption)));
  /* Most drill models are one object and get one reading. The floor plan for
     2.2 is six parts in six colours, and a colour that means something needs
     to be named — so every part gets its own reading, with a swatch beside
     it. The swatch is a second cue, never the only one: the label carries
     the meaning on its own for anyone who cannot use the colour. */
  var reads = el("div", "bench__reads");
  model.parts.forEach(function (p) {
    var read = el("div", "bench__read");
    var h = el("h4", "bench__part");
    if (wide && p.color) {
      var sw = el("span", "bench__swatch");
      sw.style.background = p.color;
      sw.setAttribute("aria-hidden", "true");
      h.appendChild(sw);
    }
    h.appendChild(document.createTextNode(p.label));
    read.appendChild(h);
    read.appendChild(el("p", "bench__spec", esc(p.spec)));
    read.appendChild(el("p", null, esc(p.note)));
    reads.appendChild(read);
  });
  list.appendChild(reads);
  bench.appendChild(list);
  body.appendChild(bench);

  if (SUBJECTS[SUBJECT].panel) {
    /* The title used to be a ternary chain ending in a default, so a new
       subject silently inherited the wireless one — the printers drill came
       up captioned "Survey readings". It belongs to the subject, and a
       subject that renders a panel without naming it now says so. */
    if (!SUBJECTS[SUBJECT].panelTitle) {
      throw new Error('drillui: subject "' + SUBJECT + '" renders a panel but has no ' +
        'panelTitle. Add one, or it will inherit another subject\'s caption.');
    }
    var pt = SUBJECTS[SUBJECT].panelTitle;
    var rows = SUBJECTS[SUBJECT].panel(D);
    /* Mixed delegates its panel, and several subjects have none at all — so
       the delegate returns null and there is simply nothing to render. */
    if (rows && rows.length) {
      list.appendChild(readingsPanel(typeof pt === "function" ? pt(D) : pt, rows));
    }
  }

  var qhost = el("div", "qs");
  var qsM = drillQuestions(D);
  itemAnswered = 0; itemCorrect = 0; itemTotal = qsM.length;
  qsM.forEach(function (q) { renderQuestion(qhost, q, D); });
  body.appendChild(qhost);

  /* ---- move on ---- */
  var nav = el("div", "drillnav");
  var prev = el("button", "btn", "← Previous item");
  prev.type = "button"; prev.disabled = SLOT === 1;
  prev.addEventListener("click", function () { SLOT--; render(); window.scrollTo(0, 0); });
  var next = el("button", "btn btn--go", SLOT === slotCount() ? "Start this subject again" : "Next item →");
  next.type = "button";
  next.addEventListener("click", function () {
    if (SLOT === slotCount()) { SEED = Math.floor(Math.random() * 90000) + 1000; SLOT = 1; }
    else SLOT++;
    render(); window.scrollTo(0, 0);
  });
  nav.appendChild(prev); nav.appendChild(next);
  body.appendChild(nav);

  box.appendChild(body);
  app.appendChild(box);

  mountModel(stage, cam, model);
  updateScore();
  if (document.body.classList.contains("reveal")) applyReveal();
}

/* ---- instructor mode ---- */
function applyReveal() {
  document.querySelectorAll(".fb").forEach(function (fb) {
    if (fb.querySelector(".fb__reveal") || !fb.dataset.answer) return;
    var r = el("p", "fb__reveal", "Answer: " + esc(fb.dataset.answer));
    fb.appendChild(r);
  });
}
function clearReveal() {
  document.querySelectorAll(".fb__reveal").forEach(function (n) { n.remove(); });
}

export function wire() {
  /* Objective first, then the sub-objective inside it \u2014 the same picker
     the ticket page uses, so a domain that spans both pages is one list and
     choosing a ticket track from here simply goes there. */
  var picker = mountPicker({
    page: "drill",
    domSelect: document.getElementById("domainSelect"),
    exSelect: document.getElementById("subjectSelect"),
    onChoose: function (ex) {
      SUBJECT = ex.subject; SLOT = 1;
      answered = 0; correct = 0;
      rebuildSlots();
      render(); window.scrollTo(0, 0);
    }
  });
  if (picker.start && picker.start.ex) SUBJECT = picker.start.ex.subject;
  document.getElementById("shuffleBtn").addEventListener("click", function () {
    SEED = Math.floor(Math.random() * 90000) + 1000; SLOT = 1; render(); window.scrollTo(0, 0);
  });
  var slotSel = document.getElementById("slotSelect");
  rebuildSlots();
  slotSel.addEventListener("change", function () { SLOT = parseInt(slotSel.value, 10); render(); });

  /* Jump to the first item they have not worked. On a twenty-item subject a
     student should not have to remember where they got to. */
  var nextBtn = document.getElementById("nextNewBtn");
  if (nextBtn) nextBtn.addEventListener("click", function () {
    var n = nextUnseen(drillKey(), slotCount(), SLOT);
    if (n === null) { nextBtn.textContent = "All worked in this subject"; nextBtn.disabled = true; return; }
    SLOT = n; slotSel.value = String(n); render(); window.scrollTo(0, 0);
  });

  var clearBtn = document.getElementById("clearProgBtn");
  if (clearBtn) clearBtn.addEventListener("click", function () {
    /* Destructive and easy to hit by accident, so it asks. This subject
       only — resetting one should not cost them the other fourteen. */
    if (!window.confirm("Forget which items you have worked in this subject? Nothing else is stored, and this cannot be undone.")) return;
    progressClear(drillKey());
    rebuildSlots();
    if (nextBtn) { nextBtn.disabled = false; nextBtn.innerHTML = "Next unworked &rarr;"; }
    render();
  });

  var overlay = document.getElementById("pinOverlay");
  document.getElementById("instructorBtn").addEventListener("click", function () {
    if (document.body.classList.contains("reveal")) {
      document.body.classList.remove("reveal"); clearReveal();
      document.getElementById("instructorBtn").setAttribute("aria-pressed", "false");
      return;
    }
    overlay.classList.remove("hidden");
    document.getElementById("pinInput").focus();
  });
  document.getElementById("pinOk").addEventListener("click", function () {
    if (document.getElementById("pinInput").value === "3693") {
      document.body.classList.add("reveal"); applyReveal();
      document.getElementById("instructorBtn").setAttribute("aria-pressed", "true");
      overlay.classList.add("hidden");
    }
    document.getElementById("pinInput").value = "";
  });
  document.getElementById("pinCancel").addEventListener("click", function () {
    overlay.classList.add("hidden");
    document.getElementById("pinInput").value = "";
  });
  document.getElementById("themeBtn").addEventListener("click", function () {
    var dark = document.documentElement.getAttribute("data-theme") === "dark";
    document.documentElement.setAttribute("data-theme", dark ? "light" : "dark");
    this.textContent = dark ? "DARK" : "LIGHT";
  });
  render();
}

/* Exposed so a test can enumerate the pool without driving the interface. */
export { CONNECTORS };
