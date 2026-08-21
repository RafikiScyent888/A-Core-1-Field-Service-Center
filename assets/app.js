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
  dayName } from "./ticket.js";
import { postReport, smartRows, eventRows, thermalRows, changeRows,
  callerClaims, benchTests, firstOccurrence } from "./instruments.js";

const PIN = "3693";
const SLOTS = 5;

let sessionSeed = Math.floor(Math.random() * 100000) + 1;
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
      input = el("select", "ans");
      input.innerHTML = '<option value="">— select —</option>' +
        opts.map((c) => `<option value="${esc(c)}">${esc(c)}</option>`).join("");
    } else {
      input = el("input"); input.type = "text";
      input.setAttribute("aria-label", String(q.ask).replace(/<[^>]+>/g, ""));
      if (q.placeholder) input.placeholder = q.placeholder;
    }
    const btn = el("button", "btn", "Check"); btn.type = "button";
    row.appendChild(input); row.appendChild(btn); card.appendChild(row);
    const fb = el("p", "fb"); fb.style.display = "none"; card.appendChild(fb);

    function check() {
      const val = input.value;
      if (!norm(val)) return;
      const ok = q.accept ? q.accept(val) : norm(val) === norm(q.answer());
      graded[q.id] = ok;
      if (q._answered) q._answered();
      fb.style.display = "";
      fb.className = "fb " + (ok ? "fb--ok" : "fb--no");
      fb.innerHTML = (ok ? "Correct" : "Not yet") + '<span class="fb__why">' + esc(q.why()) + "</span>";
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

function updateScore() {
  const done = Object.keys(graded).length;
  const right = Object.keys(graded).filter((k) => graded[k]).length;
  document.getElementById("scorebar").innerHTML =
    `<span>Answered <b>${done}</b> of <b>${allQs.length}</b></span>` +
    `<span>Correct <b>${right}</b></span>` +
    `<span>Accuracy <b>${done ? Math.round((right / done) * 100) : 0}%</b></span>` +
    `<span>Ticket <b>${slot}</b> of ${SLOTS}</span>`;
  applyGates();
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
        "A failed " + G.fault.wrongReflex.replace("gpu", "graphics card").replace("cpu", "processor"),
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
  const post = postReport(G);
  const ch = changeRows(G);

  const grid = el("div", "instr instr--two");
  const p1 = el("div", "panel");
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

function evidenceFor(G) {
  return {
    ram: "The POST beep code reports a memory failure",
    psu: "The fans spin for a second and stop, and the log shows unexpected shutdowns",
    drive: "SMART reports reallocated and pending sectors on the boot device",
    thermal: "The CPU fan reads zero RPM while the package sits near its limit",
    video: "The POST beep code reports a video adapter failure",
    cable: "CRC errors are climbing while every other SMART attribute is clean",
    cmos: "The clock and BIOS settings reset on every cold start"
  }[G.fault.key];
}

/* =====================================================================
   Step 3 — Test the theory
   ===================================================================== */
function stepTest() {
  const t = step(2);
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

  /* the bench */
  t.body.appendChild(el("p", "step__hint",
    "<strong>One test at a time.</strong> Pick the test that isolates your theory and run it. " +
    "Everything here is honest work; only one of them tells you anything about this fault."));

  const box = el("div", "tests");
  const ran = {};
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
      if (tt.isolating) {
        graded["test-isolate"] = tests.filter((x) => ran[x.key] && !x.isolating).length === 0;
        fb.style.display = "";
        fb.className = "fb " + (graded["test-isolate"] ? "fb--ok" : "fb--no");
        fb.innerHTML = (graded["test-isolate"] ? "Correct" : "Confirmed, eventually") +
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

  const qs = [
    {
      id: "test-part", kind: "choice",
      ask: "Theory confirmed. Which part are you replacing?",
      choices: () => ordShuffle("test-part", ["memory module", "power supply", "storage drive",
        "cooling", "graphics output", "SATA data cable", "CMOS battery"]),
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
  return {
    ram: "Run a full memory test on the surviving module before you leave, so you are not back for the other one",
    psu: "Record the machine's actual peak draw on the asset register, so the next upgrade is sized against it",
    drive: "Get this machine onto the backup schedule — it was not on it, which is why this was frightening",
    thermal: "Put the machine on the dust-and-airflow check list, and get it off the floor",
    video: "Note the card's power draw against the supply, so the next one fitted is checked before it is bought",
    cable: "Secure and route the cable properly rather than leaving it loose, and re-check after any desk move",
    cmos: "Note the fitting date so the next flat cell is expected rather than diagnosed from scratch"
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
      why: () => "“Fixed” and “replaced the " + G.fault.part + "” both tell the next person what you did and nothing about why, so they cannot tell whether your reasoning applies to the machine in front of them."
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
  [["Root cause", G.fault.root], ["Objective", G.fault.objective],
  ["Caller's distortion", G.report.distortion.label], ["First occurrence", firstOccurrence(G).label],
  ["Part fitted", G.fault.part], ["Correct options", G.need.fits.join(", ")],
  ["Approved budget", money(G.budget)], ["Shipping", G.shipping.key]].forEach(([k, v]) => {
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

function applyGates() {
  let prevComplete = true;                 // step one is always open
  STEPS.forEach((s) => {
    const sec = document.querySelector(`.step[data-step="${s.key}"]`);
    if (!sec) return;
    const ids = REQUIRED[s.key];
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
  G = buildTicket(sessionSeed, slot);
  allQs = [];
  Object.keys(graded).forEach((k) => delete graded[k]);

  document.getElementById("brief").innerHTML =
    `<strong>Ticket ${slot}</strong> &middot; ${esc(G.org.name)} &middot; ` +
    `${esc(G.caller.name)}, ${esc(G.caller.title)} &middot; raised ${esc(dayName(G.trueDay))} ` +
    `&middot; <strong>${esc(G.urgency.label)}</strong>`;

  const host = document.getElementById("steps");
  host.innerHTML = "";
  [stepIdentify(), stepTheory(), stepTest(), stepPlan(), stepVerify(), stepDocument()]
    .forEach((s) => host.appendChild(s.section));

  allQs = allQs.concat([{ id: "identify-claims" }, { id: "test-isolate" }, { id: "plan-order" }]);
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
const sel = document.getElementById("slotSelect");
for (let i = 1; i <= SLOTS; i++) {
  const o = document.createElement("option");
  o.value = String(i); o.textContent = "Ticket " + i;
  sel.appendChild(o);
}
sel.addEventListener("change", () => { slot = parseInt(sel.value, 10); render(); });
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
  }
  let saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) { /* storage unavailable */ }
  apply(saved === "light" || saved === "dark" ? saved : (root.getAttribute("data-theme") || sys()));
  btn.addEventListener("click", () => apply(root.getAttribute("data-theme") === "light" ? "dark" : "light"));
})();

render();
