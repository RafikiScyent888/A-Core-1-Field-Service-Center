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

import { buildDrillItem, drillQuestions, DRILL_SLOTS, DRILL_OBJECTIVES,
  SUBJECTS, CONNECTORS } from "./drill.js";
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
import { mountPicker } from "./picker.js";

/* One page, one engine, one set of rules \u2014 and a model builder per
   subject, because a connector and a docking station are not looked at the
   same way. */
const MODEL_FOR = { connectors: connectorModel, accessories: accessoryModel,
  wireless: floorPlanModel, hosts: rackModel, netconf: addressModel,
  devices: deviceModel, soho: sitePlanModel, links: linkPlanModel, tools: toolModel,
  panels: panelSectionModel, ram: ramModel, storage: storageModel, build: boardModel,
  psu: psuModel };

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

function ruleTable(rows) {
  var wrap = el("div", "rules");
  var cap = el("p", "rules__cap",
    "Perimeter firewall &mdash; outbound and inbound rules, as found. " +
    "One rule is highlighted. Everything else on this device is a real rule doing a real job.");
  wrap.appendChild(cap);
  var scroll = el("div", "rules__scroll");
  var t = document.createElement("table");
  t.className = "rules__table";
  var head = document.createElement("tr");
  ["", "Port", "Transport", "Direction", "Action"].forEach(function (h) {
    var th = document.createElement("th");
    th.textContent = h;
    if (!h) th.setAttribute("aria-label", "Highlighted rule");
    head.appendChild(th);
  });
  t.appendChild(head);
  rows.forEach(function (r, i) {
    var tr = document.createElement("tr");
    if (r.subject) tr.className = "rules__row--subject";
    var mark = document.createElement("td");
    mark.textContent = r.subject ? "\u25B6" : "";
    if (r.subject) mark.setAttribute("aria-label", "This is the highlighted rule");
    tr.appendChild(mark);
    [r.port, r.transport, r.dir, r.action].forEach(function (v) {
      var td = document.createElement("td");
      td.textContent = v;
      tr.appendChild(td);
    });
    t.appendChild(tr);
  });
  scroll.appendChild(t);
  wrap.appendChild(scroll);
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

  var wrong = 0, done = false;
  btn.addEventListener("click", function () {
    if (done || !sel.value) return;
    var chosen = sel.value;
    var right = chosen === q.answer;
    answered++;
    if (right) {
      correct++; done = true;
      sel.disabled = true; btn.disabled = true;
      wrap.classList.add("q--right");
      fb.innerHTML = '<span class="fb__ok">Correct.</span> ' + esc(q.why(chosen));
    } else {
      wrong++;
      wrap.classList.add("q--wrong");
      var msg = '<span class="fb__no">Not that one.</span> ' + esc(q.why(chosen));
      /* Third wrong: start guiding. The hint points at where on the model to
         look, and never at what will be found there. */
      if (wrong >= 3) {
        msg += '<p class="fb__hint"><strong>Try this.</strong> ' + esc(q.hint) + "</p>";
      }
      fb.innerHTML = msg;
    }
    updateScore();
  });
  host.appendChild(wrap);
  return fb;
}

function updateScore() {
  var s = document.getElementById("score");
  if (!s) return;
  s.innerHTML = "Answered <strong>" + answered + "</strong> &middot; Correct <strong>" + correct +
    "</strong> &middot; Accuracy <strong>" +
    (answered ? Math.round((correct / answered) * 100) : 0) + "%</strong> &middot; Item <strong>" +
    SLOT + "</strong> of " + DRILL_SLOTS;
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
  var next = el("button", "btn btn--go", SLOT === DRILL_SLOTS ? "New set of five" : "Next item \u2192");
  next.type = "button";
  next.addEventListener("click", function () {
    if (SLOT === DRILL_SLOTS) { SEED = Math.floor(Math.random() * 90000) + 1000; SLOT = 1; }
    else SLOT++;
    render(); window.scrollTo(0, 0);
  });
  nav.appendChild(prev); nav.appendChild(next);
  return nav;
}

export function render() {
  var app = document.getElementById("app");
  app.innerHTML = "";
  liveScene = null;

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
  bh.appendChild(el("h2", null, "Item " + SLOT + " of " + DRILL_SLOTS));
  /* "In your hand" is right for a connector and wrong for a firewall rule.
     The tag follows the subject's instrument. */
  bh.appendChild(el("span", "step__tag",
    SUBJECTS[SUBJECT].instrument === "rules" ? "On the firewall"
      : SUBJECT === "wireless" ? "On the plan"
      : SUBJECT === "hosts" ? "In the rack"
      : SUBJECT === "netconf" ? "On the address space"
      : SUBJECT === "devices" ? "On the bench"
      : SUBJECT === "soho" ? "On the plan"
      : SUBJECT === "links" ? "On the ground"
      : SUBJECT === "tools" ? "In your hand"
      : SUBJECT === "panels" ? "Cut through"
      : SUBJECT === "ram" ? "On the bench"
      : SUBJECT === "storage" ? "Opened up"
      : SUBJECT === "build" ? "On the bench"
      : SUBJECT === "psu" ? "On the bench"
      : SUBJECT === "accessories" ? "On the desk" : "In your hand"));
  box.appendChild(bh);
  var body = el("div", "step__body");

  if (!model) {
    /* No model, so the instrument stands in its place. */
    body.appendChild(ruleTable(SUBJECTS[SUBJECT].rules(D)));
    var qhostR = el("div", "qs");
    drillQuestions(D).forEach(function (q) { renderQuestion(qhostR, q, D); });
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
    list.appendChild(readingsPanel(
      SUBJECT === "hosts" ? "Connection log"
        : SUBJECT === "netconf" ? "What the machine reports"
        : SUBJECT === "devices" ? "What is printed on the case"
        : SUBJECT === "soho" ? "What the customer told you, and what the survey found"
        : SUBJECT === "links" ? "What you measured, standing at the site"
        : SUBJECT === "tools" ? "What the tool is showing"
        : SUBJECT === "panels" ? "What the instruments read"
        : SUBJECT === "ram" ? "What a ruler and the label give you"
        : SUBJECT === "storage" ? "What the enclosure and the benchmark give you"
        : SUBJECT === "build" ? "The delivery note"
        : SUBJECT === "psu" ? "The parts list, and what each line draws"
        : "Survey readings",
      SUBJECTS[SUBJECT].panel(D)));
  }

  var qhost = el("div", "qs");
  drillQuestions(D).forEach(function (q) { renderQuestion(qhost, q, D); });
  body.appendChild(qhost);

  /* ---- move on ---- */
  var nav = el("div", "drillnav");
  var prev = el("button", "btn", "← Previous item");
  prev.type = "button"; prev.disabled = SLOT === 1;
  prev.addEventListener("click", function () { SLOT--; render(); window.scrollTo(0, 0); });
  var next = el("button", "btn btn--go", SLOT === DRILL_SLOTS ? "New set of five" : "Next item →");
  next.type = "button";
  next.addEventListener("click", function () {
    if (SLOT === DRILL_SLOTS) { SEED = Math.floor(Math.random() * 90000) + 1000; SLOT = 1; }
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
      document.getElementById("slotSelect").value = "1";
      answered = 0; correct = 0;
      render(); window.scrollTo(0, 0);
    }
  });
  if (picker.start && picker.start.ex) SUBJECT = picker.start.ex.subject;
  document.getElementById("shuffleBtn").addEventListener("click", function () {
    SEED = Math.floor(Math.random() * 90000) + 1000; SLOT = 1; render(); window.scrollTo(0, 0);
  });
  var slotSel = document.getElementById("slotSelect");
  for (var i = 1; i <= DRILL_SLOTS; i++) {
    var o = document.createElement("option");
    o.value = String(i); o.textContent = "Item " + i;
    slotSel.appendChild(o);
  }
  slotSel.addEventListener("change", function () { SLOT = parseInt(slotSel.value, 10); render(); });

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
