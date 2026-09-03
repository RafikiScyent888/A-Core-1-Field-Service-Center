/* =====================================================================
   HELD FOR CORE 2 — 220-1202

   This is the Windows & OS troubleshooting track, lifted out of the Core 1
   build on 23 August 2026. Nothing here is wrong and nothing here is
   finished with; it is simply Core 2 content (Task Manager, Device Manager,
   Event Viewer, Services, safe mode) sitting in a project that is now Core 1
   only.

   It was verified working before it was removed: 15/15 tickets end to end,
   reimaging refused as too big on every one of them, zero contrast failures.
   When the Core 2 build starts, this goes back rather than being rewritten.

   The module itself is core-2-hold/winos.js. The blocks below are the parts
   of app.js that rendered it, kept verbatim so the wiring is a paste rather
   than an archaeology exercise.
   ===================================================================== */

/* ---- app.js: osTheoryQuestions + osStepTest + osStepPlan ---- */
function osTheoryQuestions(t) {
  const qs = [
    {
      id: "theory-cause", kind: "choice", shuffle: true,
      ask: "What is your theory of probable cause?",
      choices: () => TRACKS.winos.faults.map((f) => f.part),
      answer: () => G.fault.part,
      why: () => G.fault.root + " " + G.fault.fixes
    },
    {
      id: "theory-evidence", kind: "choice", shuffle: true,
      ask: "And what is the evidence for it?",
      choices: () => TRACKS.winos.faults.map((f) => f.evidence),
      answer: () => G.fault.evidence,
      why: () => "On this track the evidence is always one reading in one tool. The skill is knowing which tool " +
        "before you open it, because opening all of them takes the whole afternoon."
    }
  ];
  allQs = allQs.concat(renderQuestions(t.body, qs));
  return t;
}

function osStepTest(t) {
  const w = G.winos;

  const mp = el("div", "panel");
  mp.appendChild(el("h3", null, "What the tools say, if you open them"));
  const mdl = el("dl", "kv");
  osToolRows(G).forEach((r) => {
    const dt = el("dt", null, esc(r.k)), dd = el("dd", null, esc(r.v));
    if (r.bad) { dt.setAttribute("data-bad", "1"); dd.setAttribute("data-bad", "1"); }
    mdl.appendChild(dt); mdl.appendChild(dd);
  });
  mp.appendChild(mdl);
  mp.appendChild(el("p", "count",
    "This panel is here so the readings exist. On a real call none of it is in front of you until you " +
    "have decided which tool to open, which is what the bench below is for."));
  t.body.appendChild(mp);

  const sp = el("div", "panel");
  sp.appendChild(el("h3", null, "Scope, as reported"));
  const sdl = el("dl", "kv");
  [["A second account on this machine", w.secondAccount],
  ["The same machine in safe mode", w.safeMode],
  ["Anybody else on this build", w.others]].forEach(([k, v]) => {
    const dt = el("dt", null, esc(k)), dd = el("dd", null, esc(v));
    sdl.appendChild(dt); sdl.appendChild(dd);
  });
  sp.appendChild(sdl);
  t.body.appendChild(sp);

  t.body.appendChild(holdKey("Hold to read: scope first, what safe mode proves, and least invasive first",
    WINOS_FACTS));

  t.body.appendChild(el("p", "step__hint",
    "<strong>There is nothing to open and nothing to point at.</strong> Pick the one tool that answers the " +
    "question in front of you. Every one of these is the right answer somewhere on this track and the wrong " +
    "answer everywhere else, and two of them cost most of the visit."));

  const box = el("div", "tests");
  const benchHint = hintBox(box);
  const ran = {};
  const timeSpent = el("p", "count", "Time spent: 0 minutes");
  const fb = el("p", "fb"); fb.style.display = "none";
  const tests = winosTests(G, (x) => ordShuffle("ostest", x));
  tests.forEach((tt) => {
    const card = el("div", "test");
    const out = el("span", "test__out"); out.hidden = true;
    const run = el("button", "btn", "Open it"); run.type = "button";
    run.addEventListener("click", () => {
      ran[tt.key] = true;
      out.hidden = false; out.textContent = tt.result; run.disabled = true;
      const spent = tests.filter((x) => ran[x.key]).reduce((acc, x) => acc + x.mins, 0);
      timeSpent.textContent = "Time spent: " + spent + " minutes";
      if (tt.isolating) benchHint.right(); else benchHint.wrong(CONTROL_HINTS.bench);
      if (tt.isolating) {
        const clean = tests.filter((x) => ran[x.key] && !x.isolating).length === 0;
        graded["test-isolate"] = clean;
        fb.style.display = "";
        fb.className = "fb " + (clean ? "fb--ok" : "fb--no");
        fb.innerHTML = (clean ? "Correct" : "Confirmed, eventually") + '<span class="fb__why">' +
          esc(clean
            ? "Straight to it in " + tt.mins + " minutes, with one tool opened once."
            : "That is the tool that answers it, but you spent " + spent + " minutes getting there" +
            (ran.reimage ? " — including reimaging the machine, which fixes everything on this track and explains none of it."
              : ran.malwarescan ? " — including three quarters of an hour ruling out the thing nothing pointed at."
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

  allQs = allQs.concat(renderQuestions(t.body, [
    {
      id: "test-part", kind: "choice", shuffle: true,
      ask: "Theory confirmed. What is actually wrong?",
      choices: () => TRACKS.winos.faults.map((f) => f.part),
      answer: () => G.fault.part,
      why: () => G.fault.root + " " + G.fault.fixes
    }
  ]));
  return t;
}

function osStepPlan(t) {
  t.body.appendChild(el("p", "step__hint",
    "<strong>Say the scope out loud first.</strong> One user, one machine, or every machine of this build. It " +
    "is the question that decides whether you are working on the right computer at all, and the two things that " +
    "answer it &mdash; a second account and a word with anybody else &mdash; are already on the last step."));

  /* ---- scope ---- */
  const sp = el("div", "panel");
  sp.appendChild(el("h3", null, "Who is affected?"));
  const slist = el("div", "pbtnlist");
  const sbtns = {};
  let sChosen = null;
  OS_SCOPE_OPTIONS.forEach((o) => {
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
  const sBtn = el("button", "btn", "Set the scope");
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
      sFb.textContent = "Pick one of the three first.";
      return;
    }
    sRevealed = false; sBeneath = null;
    const ok = sChosen === G.osScope;
    graded["plan-scope"] = ok;
    sFb.style.display = "";
    sFb.className = "fb " + (ok ? "fb--ok" : "fb--no");
    sFb.innerHTML = (ok ? "Correct" : "Not that scope") +
      '<span class="fb__why">' + esc(osScopeWhy(G.fault, sChosen)) + "</span>";
    if (ok) sHints.right(); else sHints.wrong(CONTROL_HINTS.osscope);
    updateScore();
  });
  allQs.push({
    id: "plan-scope",
    _reveal: () => {
      if (!sRevealed) sBeneath = { html: sFb.innerHTML, cls: sFb.className, disp: sFb.style.display };
      sRevealed = true;
      if (sbtns[G.osScope]) sbtns[G.osScope].classList.add("pbtn--answer");
      sFb.style.display = ""; sFb.className = "fb fb--ok";
      sFb.innerHTML = "Answer: " + esc(OS_SCOPE_OPTIONS.filter((o) => o.key === G.osScope)[0].label) +
        '<span class="fb__why">' + esc(osScopeWhy(G.fault, G.osScope)) + "</span>";
    },
    _unreveal: () => {
      if (!sRevealed) return;
      sRevealed = false;
      if (sbtns[G.osScope]) sbtns[G.osScope].classList.remove("pbtn--answer");
      sFb.innerHTML = sBeneath ? sBeneath.html : "";
      sFb.className = sBeneath ? sBeneath.cls : "fb";
      sFb.style.display = sBeneath ? sBeneath.disp : "none";
      sBeneath = null;
    }
  });

  /* ---- the escalation ladder ---- */
  t.body.appendChild(el("p", "step__hint",
    "<strong>Now the smallest thing that fixes it.</strong> Every option below would work on some ticket on " +
    "this track, and one of them works on all of them &mdash; which is exactly what makes it the wrong answer " +
    "everywhere. Reimaging costs the customer the rest of the day, tells you nothing about the cause, and tells " +
    "you nothing about whether it comes back on Thursday."));

  const rp = el("div", "panel");
  rp.appendChild(el("h3", null, "What do you do?"));
  rp.appendChild(el("p", "count",
    "Ordered on the list below by how much they cost the customer, cheapest first. Pick the least " +
    "invasive one that actually addresses what you found."));
  const rlist = el("div", "pbtnlist");
  const rbtns = {};
  let rChosen = null;
  ordShuffle("osremedy", REMEDIES.slice()).forEach((o) => {
    const b = el("button", "pbtn", esc(o.label));
    b.type = "button";
    b.setAttribute("aria-pressed", "false");
    b.addEventListener("click", () => {
      rChosen = o.key;
      Object.keys(rbtns).forEach((k) => rbtns[k].setAttribute("aria-pressed", k === o.key ? "true" : "false"));
    });
    rbtns[o.key] = b;
    rlist.appendChild(b);
  });
  rp.appendChild(rlist);
  const rrow = el("div", "q__row");
  const rBtn = el("button", "btn", "Do it");
  rBtn.type = "button";
  rrow.appendChild(rBtn);
  rp.appendChild(rrow);
  const rFb = el("p", "fb"); rFb.style.display = "none";
  rp.appendChild(rFb);
  const rHints = hintBox(rp);
  t.body.appendChild(rp);

  let rRevealed = false, rBeneath = null;
  rBtn.addEventListener("click", () => {
    if (!rChosen) {
      rFb.style.display = ""; rFb.className = "fb";
      rFb.textContent = "Pick one first.";
      return;
    }
    rRevealed = false; rBeneath = null;
    const ok = rChosen === G.remedy;
    graded["plan-remedy"] = ok;
    rFb.style.display = "";
    rFb.className = "fb " + (ok ? "fb--ok" : "fb--no");
    rFb.innerHTML = (ok ? "Correct" : "Not that one") +
      '<span class="fb__why">' + esc(remedyWhy(G.fault, rChosen)) + "</span>";
    if (ok) rHints.right(); else rHints.wrong(CONTROL_HINTS.ladder);
    updateScore();
  });
  allQs.push({
    id: "plan-remedy",
    _reveal: () => {
      if (!rRevealed) rBeneath = { html: rFb.innerHTML, cls: rFb.className, disp: rFb.style.display };
      rRevealed = true;
      if (rbtns[G.remedy]) rbtns[G.remedy].classList.add("pbtn--answer");
      rFb.style.display = ""; rFb.className = "fb fb--ok";
      rFb.innerHTML = "Answer: " + esc(remedyByKey(G.remedy).label) +
        '<span class="fb__why">' + esc(remedyWhy(G.fault, G.remedy)) + "</span>";
    },
    _unreveal: () => {
      if (!rRevealed) return;
      rRevealed = false;
      if (rbtns[G.remedy]) rbtns[G.remedy].classList.remove("pbtn--answer");
      rFb.innerHTML = rBeneath ? rBeneath.html : "";
      rFb.className = rBeneath ? rBeneath.cls : "fb";
      rFb.style.display = rBeneath ? rBeneath.disp : "none";
      rBeneath = null;
    }
  });
  return t;
}

/* ---- app.js: preventFor winos map ---- */
  if (G.track === "winos") {
    return { startupapp: "Get the startup list into the standard build so software cannot add itself to every login unasked",
      driverbad: "Pin this driver version in the fleet until the vendor fixes the new one, and pilot driver updates before they go out to everybody",
      diskfull: "Alert on system-drive free space at 10%, so this is a warning rather than six unrelated failures",
      updateloop: "Take the failing update out of the ring and pilot updates on a small group before the whole build gets them",
      profilecorrupt: "Get this user's data off the profile and into the redirected folders, so the next profile rebuild costs nothing",
      servicedisabled: "Find out what disabled it \u2014 if it was policy, it will do it again at the next refresh",
      pagefile: "Put the page file back to system-managed in the build, so a machine set up by hand cannot arrive with it fixed small",
      devicecode10: "Record the working firmware and driver pairing on the asset register, so the next update is checked against it",
      thirdparty: "Get the software list under control on this build, because a machine anybody can install on will be unstable again",
      sysfiles: "Find out why it is shutting down uncleanly \u2014 the corruption is a symptom and the power is the cause"
    }[G.fault.key];
  }

/* ---- app.js: stepTheory winos panel ---- */
  if (G.track === "winos") {
    p1.appendChild(el("h3", null, "The machine"));
    const wdl = el("dl", "kv");
    osMachineRows(G).forEach((r) => {
      const dt = el("dt", null, esc(r.k)), dd = el("dd", null, esc(r.v));
      if (r.bad) { dt.setAttribute("data-bad", "1"); dd.setAttribute("data-bad", "1"); }
      wdl.appendChild(dt); wdl.appendChild(dd);
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
    return osTheoryQuestions(t);
  }

