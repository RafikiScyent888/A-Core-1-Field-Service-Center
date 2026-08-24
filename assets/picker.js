/* =====================================================================
   Field Service Center — the objective picker

   Two controls, in the order the book is organised: choose the domain, then
   choose the sub-objective inside it. It is the same component on both
   pages, because a domain does not respect the split between them — domain
   two is three identification drills, domain five is six ticket tracks, and
   domain three is both. Picking an exercise that lives on the other page
   simply goes there.

   Two decisions worth writing down.

   THE DEFAULT IS "ALL OBJECTIVES". Not because objective-first is optional,
   but because a student revising broadly should not have to choose a domain
   to see the whole list, and because the exercise select then behaves
   exactly as the old track select did. Every option is still labelled with
   its objective number, so the number and the exercise are never separated
   even when nothing is filtered.

   THE SELECT IS KEYED BY POSITION, NOT BY VALUE. One exercise can appear
   twice under one domain — the cloud track is 4.1 and 4.2, and both are in
   domain four — so two options can legitimately carry the same value. The
   change handler reads selectedIndex against the list it built, which also
   means the option values stay the plain track and subject keys the rest of
   the build already uses.
   ===================================================================== */

import { DOMAINS, EXERCISES, entriesFor, entryLabel, exerciseById } from "./syllabus.js";

/* Every exercise, once, with nothing filtered. What "All objectives" shows. */
function allList() {
  return EXERCISES.map(function (e) {
    return { obj: null, ex: e, label: e.objs.join(" / ") + "   " + e.label };
  });
}

function domainList(domain) {
  return entriesFor(domain).map(function (en) {
    return { obj: en.ex ? en.obj : null, ex: en.ex || null, gap: en.gap, label: entryLabel(en) };
  });
}

/* An option's value is the plain track or subject key when the exercise
   lives on the page doing the rendering, and a prefixed key when it lives on
   the other one. The plain keys are what the rest of the build \u2014 and every
   end-to-end harness \u2014 already uses to address an exercise, and there was
   no reason to make them all learn a new spelling because a second select
   appeared above them. */
function optionValue(item, page) {
  if (!item.ex) return "";
  var own = item.ex.page === page;
  if (item.ex.page === "drill") return own ? item.ex.subject : "drill:" + item.ex.subject;
  return own ? item.ex.track : "index:" + item.ex.track;
}

/* Read where we were sent from, if anywhere. */
export function requested() {
  var q = new URLSearchParams(location.search);
  var ex = exerciseById(q.get("ex") || "");
  return ex ? { ex: ex, obj: q.get("obj") || null } : null;
}

/* opts = { page, domSelect, exSelect, onChoose(exercise, objectiveOrNull) } */
export function mountPicker(opts) {
  var domSel = opts.domSelect, exSel = opts.exSelect;
  var items = [];

  DOMAINS.forEach(function (d) {
    var o = document.createElement("option");
    o.value = d.key; o.textContent = d.label;
    domSel.appendChild(o);
  });
  var all = document.createElement("option");
  all.value = ""; all.textContent = "All objectives";
  domSel.insertBefore(all, domSel.firstChild);
  domSel.value = "";

  function fill(domain, selectId, selectObj) {
    items = domain ? domainList(domain) : allList();
    /* Choosing a domain does not choose an exercise. Without this the first
       sub-objective in the domain was selected the instant the domain
       changed, and where that first one lived on the other page the browser
       left before the student had picked anything at all. Two choices, in
       the order the instruction asked for them. */
    if (domain && !selectId) items.unshift({ ex: null, placeholder: true, label: "\u2014 choose a sub-objective \u2014" });
    exSel.innerHTML = "";
    items.forEach(function (it, i) {
      var o = document.createElement("option");
      o.value = optionValue(it, opts.page);
      o.textContent = it.label;
      /* An objective with nothing behind it is shown and cannot be chosen.
         Leaving it out would make the picker a list of what happens to be
         finished rather than a map of the course. */
      if (!it.ex) o.disabled = !it.placeholder;
      exSel.appendChild(o);
      if (it.ex && it.ex.id === selectId &&
          (!selectObj || it.obj === selectObj || it.obj === null)) exSel.selectedIndex = i;
    });
    /* Never leave a disabled option selected \u2014 but the placeholder is a
       legitimate resting state, so it is left alone. */
    var cur = items[exSel.selectedIndex];
    if (!cur || (!cur.ex && !cur.placeholder)) {
      var first = items.findIndex(function (x) { return x.ex || x.placeholder; });
      if (first >= 0) exSel.selectedIndex = first;
    }
    var sel = items[exSel.selectedIndex];
    return sel && sel.ex ? sel : null;
  }

  function go(item, quiet) {
    if (!item || !item.ex) return;
    if (item.ex.page !== opts.page) {
      var page = item.ex.page === "drill" ? "drill.html" : "index.html";
      location.href = page + "?ex=" + encodeURIComponent(item.ex.id) +
        (item.obj ? "&obj=" + encodeURIComponent(item.obj) : "");
      return;
    }
    /* Only a split exercise is narrowed by the objective. Everywhere else
       one exercise is one objective and there is nothing to filter. */
    if (!quiet) opts.onChoose(item.ex, item.ex.split ? item.obj : null);
  }

  domSel.addEventListener("change", function () {
    /* Refill and stop. The student picks the sub-objective next. */
    fill(domSel.value, null, null);
  });
  exSel.addEventListener("change", function () {
    go(items[exSel.selectedIndex]);
  });

  /* Opening state: whatever the URL asked for, else this page's first. */
  var req = requested();
  var startDomain = req && req.obj ? req.obj.charAt(0) : "";
  domSel.value = startDomain;
  var start = fill(startDomain, req ? req.ex.id : null, req ? req.obj : null);
  if (start && start.ex && start.ex.page !== opts.page) {
    /* Asked for something that lives elsewhere — fall back to this page's
       first entry rather than bouncing the browser straight back out. */
    start = null;
  }
  return {
    start: start,
    objectiveOf: function () {
      var it = items[exSel.selectedIndex];
      return it && it.ex && it.ex.split ? it.obj : null;
    },
    /* Point the exercise select at a track this page switched to by some
       other route, without firing the change handler again. */
    sync: function (id) {
      for (var i = 0; i < items.length; i++) {
        if (items[i].ex && items[i].ex.id === id) { exSel.selectedIndex = i; return; }
      }
    }
  };
}
