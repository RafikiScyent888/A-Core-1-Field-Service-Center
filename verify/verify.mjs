/* =====================================================================
   ONE COMMAND THAT CHECKS THE BUILD.

       node verify/verify.mjs                    everything, about four minutes
       node verify/verify.mjs --list             names the checks and exits
       node verify/verify.mjs --only=hints,route  runs a subset, for when you
                                                 are fixing one thing

   THERE IS NO WAY TO SKIP A CHECK ON A FULL RUN. There was a --quick that
   left out the slowest one, and it went the moment that one came down to
   under a minute: a flag whose purpose is to make the suite finish sooner is
   a flag whose purpose is to produce a pass that covered less, which is the
   thing this file exists to prevent. --only is for development and says
   loudly in the summary how many checks did not run.

   Exit code 0 means every check ran and every check passed. Anything else
   means read the output.

   THE RULE THIS FILE EXISTS TO ENFORCE: A CHECK THAT DID NOT RUN IS A
   FAILURE, NOT A PASS.

   That is not a general principle, it is the specific way this project has
   been misled, repeatedly, by its own tests:

     - A contrast sweep reported zero failures on a page it was not looking
       at. Twice. It had been pointed at drill.html while the change was on
       path.html, and "0 below AAA" is what a sweep of the wrong page says.
     - A contrast sweep reported zero failures because it ignored inherited
       opacity, and was believed. Thirty real failures were sitting in front
       of it.
     - A walker reported "0 problems" having answered most questions
       correctly by chance, so the thing it existed to exercise — the hint
       ladder — was never reached at all.
     - A reachability walk reported "500 exercises opened, 0 problems" on a
       build containing 543. Nothing in that sentence was false.

   So every check here declares what it EXPECTED to cover, expectations are
   derived from the build rather than typed in, and coverage below
   expectation fails the run. The two sweeps that can go blind carry
   calibration: they plant a fault they must detect, and a calibration that
   does not fire fails the check regardless of what else it found.
   ===================================================================== */
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { inventory } from "./inventory.mjs";
import { buildDrillItem, drillQuestions, SUBJECTS, homeOf } from "../assets/drill.js";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const ARGS = process.argv.slice(2);
const BROWSER = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".mjs": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml" };

/* Its own server on its own port, so the command needs nothing set up first
   and cannot accidentally test a stale copy somebody left running. */
function serve() {
  return new Promise((resolve) => {
    const s = createServer(async (req, res) => {
      const path = normalize(decodeURIComponent(req.url.split("?")[0])).replace(/^(\.\.[/\\])+/, "");
      const file = join(ROOT, path === "/" ? "index.html" : path);
      try {
        const body = await readFile(file);
        res.writeHead(200, { "Content-Type": TYPES[extname(file)] || "application/octet-stream" });
        res.end(body);
      } catch { res.writeHead(404); res.end("not found"); }
    });
    s.listen(0, "127.0.0.1", () => resolve({ port: s.address().port, close: () => s.close() }));
  });
}

/* ------------------------------------------------------------------ */
/* The contrast scanner. Cascade-resolved, and it multiplies inherited  */
/* opacity into the foreground, which is the thing an earlier version   */
/* of this did not do while reporting a clean build.                    */
/* ------------------------------------------------------------------ */
const SCAN = `(() => {
  const lin=v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)};
  const lum=c=>0.2126*lin(c[0])+0.7152*lin(c[1])+0.0722*lin(c[2]);
  const ratio=(a,b)=>{const x=lum(a),y=lum(b);const[h,l]=x>y?[x,y]:[y,x];return (h+0.05)/(l+0.05)};
  const parse=s=>{const m=/rgba?\\(([^)]+)\\)/.exec(s);if(!m)return null;
    const p=m[1].split(',').map(Number);return{c:[p[0],p[1],p[2]],a:p.length>3?p[3]:1}};
  const over=(fg,a,bg)=>bg.map((v,i)=>fg[i]*a+v*(1-a));
  function ground(n){
    const stack=[];
    for(let e=n;e;e=e.parentElement){
      const cs=getComputedStyle(e);
      if(cs.backgroundImage&&cs.backgroundImage!=='none') return {bad:1};
      const p=parse(cs.backgroundColor); if(!p) continue;
      if(p.a>=0.999){let g=p.c;for(let i=stack.length-1;i>=0;i--)g=over(stack[i].c,stack[i].a,g);return {c:g}}
      if(p.a>0) stack.push(p);
    }
    let g=[255,255,255];
    for(let i=stack.length-1;i>=0;i--)g=over(stack[i].c,stack[i].a,g);
    return {c:g};
  }
  const out=[];
  document.querySelectorAll('*').forEach(n=>{
    const kids=[...n.childNodes].filter(x=>x.nodeType===3&&x.textContent.trim());
    if(!kids.length)return;
    const cs=getComputedStyle(n);
    if(cs.visibility==='hidden'||cs.display==='none'||+cs.opacity===0)return;
    const r=n.getBoundingClientRect(); if(r.width<2||r.height<2)return;
    const fgp=parse(cs.color); if(!fgp)return;
    const g=ground(n); if(g.bad)return;
    let alpha=fgp.a; for(let e=n;e;e=e.parentElement) alpha*=+getComputedStyle(e).opacity;
    const fg=alpha>=0.999?fgp.c:over(fgp.c,alpha,g.c);
    const px=parseFloat(cs.fontSize),bold=parseInt(cs.fontWeight,10)>=700;
    out.push({r:+ratio(fg,g.c).toFixed(2),need:(px>=24||(px>=18.66&&bold))?4.5:7,px,
      t:kids.map(x=>x.textContent.trim()).join(' ').slice(0,44)});
  });
  return out;
})()`;

/* ------------------------------------------------------------------ */
/* Checks. Each returns { covered, expected, problems, notes }.        */
/* Throwing counts as a failure; returning without a coverage number   */
/* counts as a failure too, which is the whole point of the file.      */
/* ------------------------------------------------------------------ */
const CHECKS = [];
const check = (name, what, fn) => CHECKS.push({ name, what, fn });

/* --only=<name>[,<name>] runs a subset. Useful while fixing one thing, and
   useful for proving a check can still fail: break something on purpose and
   run just that check. A suite that has never failed on purpose is a suite
   nobody has any reason to trust. */
const ONLY = (ARGS.find((a) => a.startsWith("--only=")) || "").slice(7)
  .split(",").filter(Boolean);

/* ---- 1. The registries agree with each other ---- */
check("registry", "every exercise, subject and objective lines up", async (ctx) => {
  const inv = ctx.inv;
  return { covered: inv.units, expected: inv.units, problems: inv.faults,
    notes: inv.drillSubjects + " drill subjects, " + inv.units + " units, " +
      inv.exercises + " exercises, " + inv.objectives + " objectives" };
});

/* ---- 2. Every generated question is well formed ---- */
check("questions", "every question on every drill item, over many seeds", async () => {
  const problems = [];
  const subjects = Object.keys(SUBJECTS);
  let covered = 0;
  for (const key of subjects) {
    const slots = SUBJECTS[key].slots || SUBJECTS[key].pool.length;
    for (let seed = 1; seed <= 12; seed++) {
      for (let slot = 1; slot <= slots; slot++) {
        const D = buildDrillItem(seed, slot, key);
        let qs;
        try { qs = drillQuestions(D); }
        catch (e) { problems.push(key + " s" + seed + "/" + slot + ": threw — " + e.message); continue; }
        if (!qs.length) { problems.push(key + " s" + seed + "/" + slot + ": no questions"); continue; }
        for (const q of qs) {
          covered++;
          const c = q.choices.map(String);
          const a = String(q.answer);
          if (c.indexOf(a) === -1) problems.push(key + " " + q.id + ": the answer is not among the choices");
          if (c.filter((x) => x === a).length > 1) problems.push(key + " " + q.id + ": the answer appears twice");
          if (new Set(c).size !== c.length) problems.push(key + " " + q.id + ": duplicate choice");
          if (c.length < 3) problems.push(key + " " + q.id + ": only " + c.length + " choices — a coin toss, not a question");
          if (!q.hint) problems.push(key + " " + q.id + ": no hint, so the ladder has nothing to end on");
          if (typeof q.why !== "function") problems.push(key + " " + q.id + ": no explanation");
        }
      }
    }
  }
  /* Expectation: at least one question per item per seed. Anything less
     means a subject stopped asking and nobody noticed. */
  const expected = subjects.reduce((n, k) =>
    n + (SUBJECTS[k].slots || SUBJECTS[k].pool.length) * 12, 0);
  return { covered, expected, problems,
    notes: covered + " questions across " + subjects.length + " subjects" };
});

/* ---- 3. Mixed can deal and render every subject ---- */
check("mixed", "the mixed drill can render an item from every subject", async () => {
  const all = Object.keys(SUBJECTS).filter((k) => k !== "mixed");
  const seen = {}; const problems = [];
  for (let seed = 1; seed <= 400 && Object.keys(seen).length < all.length; seed++) {
    for (let slot = 1; slot <= 20; slot++) {
      const D = buildDrillItem(seed, slot, "mixed");
      const home = D.item && D.item._home;
      try {
        if (!drillQuestions(D).length) problems.push(home + ": no questions when dealt by mixed");
        const sub = homeOf(D);
        if (sub.rules) {
          const sp = sub.rules(D);
          if (!sp || !(sp.tables || sp.rows)) problems.push(home + ": empty instrument when dealt by mixed");
        }
        if (sub.panel && !sub.panel(D)) problems.push(home + ": empty panel when dealt by mixed");
        seen[home] = true;
      } catch (e) { problems.push(home + ": threw when dealt by mixed — " + e.message); seen[home] = true; }
    }
  }
  all.filter((k) => !seen[k]).forEach((k) =>
    problems.push('subject "' + k + '" was never dealt by mixed in 400 seeds'));
  return { covered: Object.keys(seen).length, expected: all.length, problems,
    notes: Object.keys(seen).length + " of " + all.length + " subjects reached through mixed" };
});

/* ---- 4. Every drill exercise renders something ---- */
check("drill pages", "every item of every drill subject renders an instrument", async (ctx) => {
  const p = await ctx.page();
  const problems = []; let covered = 0;
  const subjects = await drillSubjectsOn(p, ctx);
  for (const s of subjects) {
    await p.selectOption("#subjectSelect", s);
    await p.waitForTimeout(280);
    const slots = await p.$$eval("#slotSelect option", (os) => os.map((o) => o.value));
    const fingerprints = new Set();
    for (const sl of slots) {
      await p.selectOption("#slotSelect", sl);
      await p.waitForTimeout(70);
      covered++;
      const has = await p.$$eval("canvas, .bench__nogl, .rules, .readings", (ns) => ns.length);
      if (!has) problems.push(s + " item " + sl + ": nothing rendered in place of the item");
      const qn = await p.$$eval(".q", (ns) => ns.length);
      if (!qn) problems.push(s + " item " + sl + ": no questions on the page");
      /* Fingerprint on the ANSWER OPTIONS, which are item-derived. Question
         WORDING is identical across a subject, and using it reported every
         item in a subject as a duplicate of the first. */
      const fp = await p.$$eval(".q select option, .readings dd, .kv dd, .rules__table td",
        (ns) => ns.map((n) => n.textContent).join("|"));
      if (!fp.trim()) problems.push(s + " item " + sl + ": nothing item-specific on the page");
      else if (fingerprints.has(fp)) problems.push(s + " item " + sl + ": identical to an earlier item");
      fingerprints.add(fp);
    }
  }
  return { covered, expected: ctx.inv.drillExercises, problems,
    notes: covered + " drill items opened" };
});

/* ---- 5. The hint ladder actually gets reached and spent ---- */
check("hints", "three wrong answers reaches the last rung and marks the evidence", async (ctx) => {
  const p = await ctx.page();
  const problems = []; let covered = 0, marked = 0, resets = 0, lastRung = 0;
  const rungs = new Set();
  const subjects = await drillSubjectsOn(p, ctx);
  for (const s of subjects) {
    await p.selectOption("#subjectSelect", s).catch(() => {});
    await p.waitForTimeout(300);
    let drove = false;
    for (const card of await p.$$(".q")) {
      if (drove) break;
      const sel = await card.$("select"); const btn = await card.$("button.btn");
      if (!sel || !btn) continue;
      const opts = await sel.evaluate((x) => [...x.options].map((o) => o.value).filter(Boolean));
      if (opts.length < 2) continue;
      /* ANSWER DELIBERATELY WRONG. An earlier version probed with the first
         option and guessed right often enough to report a clean run having
         never opened a single hint — the check passed without exercising the
         thing it exists to exercise. The answer sits in a data attribute
         that only reaches the screen in instructor mode; reading it here is
         how the harness knows which option NOT to pick. */
      const answer = await card.$eval(".fb", (x) => x.dataset.answer || "").catch(() => "");
      const wrong = opts.find((o) => o !== answer);
      if (!wrong) continue;
      for (let a = 0; a < 6 && !drove; a++) {
        if (await sel.evaluate((x) => x.disabled)) break;
        await sel.selectOption(wrong).catch(() => {});
        await btn.click().catch(() => {});
        await p.waitForTimeout(40);
        const label = await card.$eval(".hint__n", (x) => x.textContent.trim()).catch(() => null);
        if (label) {
          rungs.add(label);
          const m = label.match(/Hint (\d+) of (\d+)/);
          if (m) {
            lastRung = Math.max(lastRung, Number(m[2]));
            if (m[1] === m[2]) drove = true;
          }
        }
      }
      if (!drove) continue;
      covered++;
      /* The ladder is spent: the instrument and the control should now be
         marked, and a clean field offered. */
      if (await card.$(".hint__t--last")) marked++;
      if (await card.$(".btn--again")) resets++;
      if (!(await p.$(".lit[data-lit]"))) {
        problems.push(s + ": the ladder ran out and nothing on the page was marked.");
      }
    }
    if (!drove) problems.push(s + ": could not be driven to the last rung.");
  }
  if (!covered) {
    problems.push("The ladder was never reached on any subject. Either nothing answers wrongly " +
      "any more, or this check has stopped being able to drive the page — and a clean result " +
      "from a check that could not run is the failure this file exists to prevent.");
  }
  if (covered && marked < covered) {
    problems.push("The ladder ended without its closing rung on " + (covered - marked) +
      " subjects.");
  }
  if (covered && resets < covered) {
    problems.push("No clean-field button after a spent ladder on " + (covered - resets) +
      " subjects.");
  }
  return { covered, expected: subjects.length, problems,
    notes: covered + " of " + subjects.length + " subjects driven to rung " + lastRung +
      "; evidence marked on " + marked + ", clean field offered on " + resets };
});

/* ---- 6. The route map agrees with the build ---- */
check("route", "the route lists every objective and totals what exists", async (ctx) => {
  const p = await ctx.page();
  const problems = [];
  await p.goto(ctx.url("/path.html"), { waitUntil: "networkidle" });
  const nums = await p.$$eval(".step-row__num", (ns) => ns.map((n) => n.textContent.trim()));
  const numbered = nums.filter((n) => /^\d+\.\d+$/.test(n));
  if (numbered.length !== ctx.inv.objectives) {
    problems.push("The route shows " + numbered.length + " numbered objectives; the syllabus has " +
      ctx.inv.objectives + ".");
  }
  const overall = await p.$eval("#overall", (n) => n.textContent);
  const claimed = (overall.match(/of\s+(\d+)\s+exercises/) || [])[1];
  if (!claimed) problems.push("The route does not state a total, so nothing can be reconciled against it.");
  else if (Number(claimed) !== ctx.inv.exercises) {
    problems.push("The route claims " + claimed + " exercises; the build contains " +
      ctx.inv.exercises + ".");
  }
  const dead = await p.$$eval(".step-row__none", (ns) => ns.length);
  const links = await p.$$eval(".step-link", (ns) => ns.length);
  if (!links) problems.push("The route offers no links at all.");
  return { covered: numbered.length, expected: ctx.inv.objectives, problems,
    notes: numbered.length + " objectives, " + links + " links, total claimed " +
      (claimed || "none") + ", " + dead + " objectives with nothing on them" };
});

/* ---- 7. Contrast, on every page, with a calibration that must fire ---- */
check("contrast", "AAA on every page, at three widths, in both themes", async (ctx) => {
  const problems = []; const fails = new Set();
  let covered = 0, calibrations = 0, pagesDone = 0;
  const pages = [["/index.html", null], ["/path.html", null]]
    .concat(Object.keys(SUBJECTS).map((s) => ["/drill.html?ex=" + drillIdFor(s, ctx), s]));
  for (const [path, wantSubject] of pages) {
    if (path.endsWith("=undefined")) continue;
    for (const w of [1300, 820, 390]) {
      for (const theme of ["light", "dark"]) {
        const p = await ctx.page({ width: w, height: 1300, colorScheme: theme });
        await p.goto(ctx.url(path), { waitUntil: "networkidle" });
        await p.evaluate((t) => document.documentElement.setAttribute("data-theme", t), theme);
        if (wantSubject) {
          const landed = await p.$eval("#subjectSelect", (s) => s.value).catch(() => null);
          if (landed !== wantSubject) {
            problems.push("Asked for subject \"" + wantSubject + "\" and landed on \"" + landed +
              "\" — this sweep would have measured the wrong page and passed.");
          }
        }
        if (w === 1300 && theme === "light") {
          /* PLANT A FAILURE THIS SWEEP MUST SEE. A sweep that cannot see is
             indistinguishable from a clean one, and has twice been believed
             on this project.

             The first version of this planted a colour on named classes, and
             on index.html none of those classes existed — so the calibration
             silently did not fire and the page's clean result meant nothing,
             which is the exact failure it was written to catch. It now
             inserts its own element, so it depends on no page's markup. */
          const fired = await p.evaluate(() => {
            const n = document.createElement("p");
            n.id = "__calib";
            n.textContent = "calibration probe";
            n.style.cssText = "color:#c9c9c9;background:#ffffff;font-size:14px;padding:4px";
            document.body.appendChild(n);
            return true;
          });
          await p.waitForTimeout(50);
          const probe = (await p.evaluate(SCAN)).filter((o) => o.r < o.need &&
            /calibration probe/.test(o.t));
          if (!fired || !probe.length) {
            problems.push("Calibration did not fire on " + path + ": a deliberately unreadable " +
              "element was planted and this sweep did not see it, so its clean result on that " +
              "page means nothing.");
          } else calibrations++;
          await p.evaluate(() => { const n = document.getElementById("__calib"); if (n) n.remove(); });
          await p.waitForTimeout(30);
        }
        const out = await p.evaluate(SCAN);
        covered += out.length;
        out.filter((o) => o.r < o.need).forEach((x) =>
          fails.add(path + " " + theme + " " + w + "px — " + x.r + ":1 needs " + x.need +
            ' at ' + x.px + 'px — "' + x.t + '"'));
        await p.close();
      }
    }
    pagesDone++;
  }
  [...fails].forEach((f) => problems.push(f));
  if (!calibrations) problems.push("No calibration fired anywhere in the contrast sweep.");
  return { covered, expected: pagesDone, problems,
    notes: covered + " text elements measured across " + pagesDone + " pages, " +
      calibrations + " calibrations fired" };
});

/* ---- 8. Every ticket exercise opens ---- */
check("ticket pages", "every ticket of every track opens a distinct scenario", async (ctx) => {
  const p = await ctx.page();
  const problems = []; let covered = 0;
  /* Reached by the exercise's own deep link rather than by driving the two
     pickers, because a track that serves two objectives appears twice and
     the picker's value alone does not say which half is being dealt. */
  const wanted = [];
  for (const [, u] of ctx.inv.list) {
    if (u.kind !== "ticket") continue;
    wanted.push({ id: u.id, obj: u.obj,
      href: "/index.html?ex=" + encodeURIComponent(u.id) +
        (u.obj ? "&obj=" + encodeURIComponent(u.obj) : ""), slots: u.slots });
  }
  for (const e of wanted) {
    await p.goto(ctx.url(e.href), { waitUntil: "networkidle" });
    await p.waitForTimeout(220);
    const offered = await p.$$eval("#slotSelect option", (os) => os.length);
    if (offered !== e.slots) {
      problems.push(e.id + (e.obj ? " (" + e.obj + ")" : "") + ": the page offers " + offered +
        " tickets, the build says " + e.slots + ".");
    }
    const slots = await p.$$eval("#slotSelect option", (os) => os.map((o) => o.value));
    const seen = new Set();
    for (const sl of slots) {
      await p.selectOption("#slotSelect", sl); await p.waitForTimeout(70);
      covered++;
      const fp = await p.$$eval(".q select option, .kv dd, .panel dd, .ticket__body",
        (ns) => ns.map((n) => n.textContent).join("|")).catch(() => "");
      if (!fp.trim()) problems.push(e + " ticket " + sl + ": nothing scenario-specific rendered");
      else if (seen.has(fp)) problems.push(e + " ticket " + sl + ": identical to an earlier ticket");
      seen.add(fp);
    }
  }
  return { covered, expected: ctx.inv.ticketExercises, problems,
    notes: covered + " tickets opened" };
});

/* The exercise id that reaches a drill subject, so the contrast sweep deep
   links the way a student would rather than assuming id === subject. */
function drillIdFor(subject, ctx) {
  for (const [, u] of ctx.inv.list) if (u.kind === "drill" && u.key === subject) return u.id;
  return undefined;
}

/* The drill picker also lists the TICKET tracks, and choosing one navigates
   to index.html — after which #subjectSelect no longer exists and every
   subsequent call waits thirty seconds for an element on the wrong page.
   That is what an earlier run of this file did, and it reported the timeout
   rather than the eighteen subjects it never reached. */
async function drillSubjectsOn(p, ctx) {
  await p.goto(ctx.url("/drill.html"), { waitUntil: "networkidle" });
  const wanted = new Set();
  for (const [, u] of ctx.inv.list) if (u.kind === "drill") wanted.add(u.key);
  const offered = await p.$$eval("#subjectSelect option", (os) => os.map((o) => o.value));
  const usable = offered.filter((v) => wanted.has(v));
  if (usable.length !== wanted.size) {
    throw new Error("The drill picker offers " + usable.length + " of the " + wanted.size +
      " drill subjects the build contains. Missing: " +
      [...wanted].filter((w) => !usable.includes(w)).join(", "));
  }
  return usable;
}

/* ------------------------------------------------------------------ */
/* The runner.                                                         */
/* ------------------------------------------------------------------ */
if (ARGS.includes("--list")) {
  CHECKS.forEach((c) => console.log("  " + c.name + " — " + c.what));
  process.exit(0);
}
const unknownOnly = ONLY.filter((n) => !CHECKS.some((c) => c.name === n));
if (unknownOnly.length) {
  console.error("No such check: " + unknownOnly.join(", ") + "\nTry --list.");
  process.exit(2);
}

/* Loaded here rather than at the top so --list works on a bare checkout.
   The site itself has no dependencies and is not going to acquire any — it
   is static files somebody uploads — so the browser this needs is declared
   in verify/package.json and nowhere else. */
let chromium;
try { ({ chromium } = await import("playwright")); }
catch {
  console.error("This needs Playwright, which the site itself does not.\n" +
    "  cd verify && npm install\n" +
    "Then run it again from the top of the repo: node verify/verify.mjs");
  process.exit(2);
}

const server = await serve();
const launch = { args: ["--headless=new", "--use-gl=swiftshader", "--enable-unsafe-swiftshader"] };
/* Use the pre-installed browser when there is one, and Playwright's own
   otherwise, so this runs on a plain machine as well as on a build box. */
const { existsSync } = await import("node:fs");
if (existsSync(BROWSER)) launch.executablePath = BROWSER;
const browser = await chromium.launch(launch);

const pageErrors = [];
const ctx = {
  inv: inventory(),
  url: (p) => "http://127.0.0.1:" + server.port + p,
  page: async (opts) => {
    const p = await browser.newPage({
      viewport: { width: (opts && opts.width) || 1300, height: (opts && opts.height) || 1200 },
      colorScheme: (opts && opts.colorScheme) || "light" });
    p.on("pageerror", (e) => pageErrors.push(e.message));
    p.on("console", (m) => {
      if (m.type() === "error" && !/favicon/.test(m.text())) pageErrors.push(m.text());
    });
    return p;
  }
};

console.log("Field Service Center — verifying");
console.log("  " + ctx.inv.exercises + " exercises in " + ctx.inv.units + " units, " +
  ctx.inv.drillSubjects + " drill subjects, " + ctx.inv.objectives + " objectives");
if (ONLY.length) console.log("  --only: running " + ONLY.join(", ") + " and nothing else");
console.log("");

const results = [];
for (const c of CHECKS) {
  if (ONLY.length && !ONLY.includes(c.name)) {
    results.push({ name: c.name, skipped: true });
    continue;
  }
  const t0 = Date.now();
  let r;
  try { r = await c.fn(ctx); }
  catch (e) { r = { threw: e.message }; }
  const secs = ((Date.now() - t0) / 1000).toFixed(0) + "s";

  /* A check that threw, returned nothing, or covered less than it expected,
     FAILS — no matter how few problems it found. */
  let verdict = "PASS", why = "";
  if (r.threw) { verdict = "ERROR"; why = r.threw; }
  else if (typeof r.covered !== "number" || typeof r.expected !== "number") {
    verdict = "ERROR"; why = "the check reported no coverage, so its result cannot be trusted";
  } else if (r.covered < r.expected) {
    verdict = "FAIL";
    why = "covered " + r.covered + " of an expected " + r.expected +
      " — it did not check everything it was supposed to";
  } else if (r.problems && r.problems.length) {
    verdict = "FAIL"; why = r.problems.length + " problem" + (r.problems.length === 1 ? "" : "s");
  }
  results.push({ name: c.name, verdict, why, r, secs });
  console.log(verdict.padEnd(6) + c.name.padEnd(14) + secs.padStart(5) + "  " +
    (r.notes || why || ""));
  if (verdict !== "PASS") {
    if (why && r.notes) console.log("        " + why);
    (r.problems || []).slice(0, 12).forEach((x) => console.log("        - " + x));
    if ((r.problems || []).length > 12) {
      console.log("        - ...and " + (r.problems.length - 12) + " more");
    }
  }
}

if (pageErrors.length) {
  console.log("\nJavaScript errors on the pages (" + pageErrors.length + "):");
  [...new Set(pageErrors)].slice(0, 10).forEach((e) => console.log("  - " + e.slice(0, 150)));
}

await browser.close();
server.close();

const failed = results.filter((x) => x.verdict && x.verdict !== "PASS");
const skipped = results.filter((x) => x.skipped);
const ran = results.filter((x) => x.verdict).length;
const notRun = CHECKS.length - ran;
console.log("");
if (failed.length) {
  console.log(failed.length + " of the " + ran + " checks that ran failed: " +
    failed.map((f) => f.name).join(", "));
} else if (pageErrors.length) {
  console.log("Every check passed, but the pages threw " + pageErrors.length +
    " JavaScript errors. That is a failure.");
} else {
  /* Say plainly how many did NOT run. "All checks passed" over a filtered
     run is the same kind of sentence this whole file exists to stop. */
  console.log(ran + " of " + CHECKS.length + " checks ran, and all of them passed." +
    (notRun ? " " + notRun + " did NOT run, filtered out by --only, so this is not a " +
      "clean bill of health for the build." : ""));
}
process.exit(failed.length || pageErrors.length ? 1 : 0);
