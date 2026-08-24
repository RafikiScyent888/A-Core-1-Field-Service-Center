/* =====================================================================
   Field Service Center — the syllabus, and what is built against it

   One place that knows the shape of CompTIA A+ Core 1 (220-1201) and which
   exercise in this build teaches which part of it. Both pages read it, so
   the navigation cannot drift away from the content, and neither can this
   file's own account of what is finished.

   THE HONEST BIT. Every one of the book's twenty-seven sub-objectives is
   listed here whether or not anything has been built for it, and the ones
   with nothing behind them say so in the picker rather than quietly not
   appearing. A student is entitled to see the whole map, including the
   parts of it that are still empty — and an instructor is entitled to see
   it without reading a README.

   THREE THINGS THAT ARE NOT ONE-TO-ONE, and are modelled rather than
   flattened:

   1. One exercise can serve two objectives. Terminating a link correctly
      is 3.2 and finding the fault in it is 5.5, and the cabling track does
      both on the same ticket. It is listed under both, because pretending
      otherwise would hide it from half the students looking for it.

   2. One TRACK can be two objectives, split by fault. A mobile ticket is
      1.3 when it is about setting a device up and 5.4 when something on it
      has broken; a cloud ticket is 4.1 or 4.2 depending on whether the
      subject is the hypervisor or the service. Picking the objective there
      narrows which faults get dealt, so the navigation does not lie about
      what it is going to give you.

   3. Some objectives have no home yet. They are listed, disabled, with what
      is missing named.
   ===================================================================== */

/* The book's five domains. */
export const DOMAINS = [
  { key: "1", label: "1.0  Mobile Devices" },
  { key: "2", label: "2.0  Networking" },
  { key: "3", label: "3.0  Hardware" },
  { key: "4", label: "4.0  Virtualization and Cloud Computing" },
  { key: "5", label: "5.0  Hardware and Network Troubleshooting" }
];

/* The book's twenty-seven sub-objectives, in its own numbering and order. */
export const OBJECTIVES = {
  "1.1": "Monitor mobile device hardware and use appropriate replacement techniques",
  "1.2": "Compare and contrast accessories and connectivity options",
  "1.3": "Configure basic mobile device network connectivity and provide application support",
  "2.1": "Compare and contrast TCP and UDP ports, protocols, and their purposes",
  "2.2": "Explain wireless networking technologies",
  "2.3": "Summarize services provided by networked hosts",
  "2.4": "Explain common network configuration concepts",
  "2.5": "Compare and contrast common networking hardware devices",
  "2.6": "Configure basic wired/wireless small office/home office networks",
  "2.7": "Compare and contrast internet connection types, network types, and their characteristics",
  "2.8": "Explain networking tools and their purposes",
  "3.1": "Compare and contrast display components and attributes",
  "3.2": "Summarize basic cable types and their connectors, features, and purposes",
  "3.3": "Compare and contrast RAM characteristics",
  "3.4": "Compare and contrast storage devices",
  "3.5": "Install and configure motherboards, CPUs, and add-on cards",
  "3.6": "Install the appropriate power supply",
  "3.7": "Deploy and configure multifunction devices/printers and settings",
  "3.8": "Perform appropriate printer maintenance",
  "4.1": "Explain virtualization concepts",
  "4.2": "Summarize cloud computing concepts",
  "5.1": "Troubleshoot motherboards, RAM, CPUs, and power",
  "5.2": "Troubleshoot drive and RAID issues",
  "5.3": "Troubleshoot video, projector, and display issues",
  "5.4": "Troubleshoot common mobile device issues",
  "5.5": "Troubleshoot network issues",
  "5.6": "Troubleshoot printer issues"
};

/* Everything that has actually been built, and what it teaches.

   `page`    which of the two pages it lives on
   `track`   the ticket track, on the six-step page
   `subject` the drill subject, on the identification page
   `objs`    every objective this exercise genuinely serves
   `split`   the objective chosen decides which faults get dealt */
export const EXERCISES = [
  { id: "laptop", page: "index", track: "laptop", objs: ["1.1"],
    label: "Laptops — six-step tickets" },
  { id: "accessories", page: "drill", subject: "accessories", objs: ["1.2"],
    label: "Accessories — identification drill" },
  { id: "mobile", page: "index", track: "mobile", objs: ["1.3", "5.4"], split: true,
    label: "Mobile devices — six-step tickets" },
  { id: "protocols", page: "drill", subject: "protocols", objs: ["2.1"],
    label: "Ports and protocols — identification drill" },
  { id: "wireless", page: "drill", subject: "wireless", objs: ["2.2"],
    label: "Wireless technologies — identification drill" },
  { id: "hosts", page: "drill", subject: "hosts", objs: ["2.3"],
    label: "Networked hosts — identification drill" },
  { id: "netconf", page: "drill", subject: "netconf", objs: ["2.4"],
    label: "Network configuration concepts — identification drill" },
  { id: "devices", page: "drill", subject: "devices", objs: ["2.5"],
    label: "Networking hardware devices — identification drill" },
  { id: "soho", page: "drill", subject: "soho", objs: ["2.6"],
    label: "Configuring a small office network — five decisions" },
  { id: "links", page: "drill", subject: "links", objs: ["2.7"],
    label: "Connection types and network types — identification drill" },
  { id: "tools", page: "drill", subject: "tools", objs: ["2.8"],
    label: "Networking tools — identification drill" },
  { id: "panels", page: "drill", subject: "panels", objs: ["3.1"],
    label: "Display components and attributes — identification drill" },
  { id: "ram", page: "drill", subject: "ram", objs: ["3.3"],
    label: "RAM characteristics — identification drill" },
  { id: "storage", page: "drill", subject: "storage", objs: ["3.4"],
    label: "Storage devices — identification drill" },
  { id: "build", page: "drill", subject: "build", objs: ["3.5"],
    label: "Installing boards, processors and cards — five decisions" },
  { id: "psu", page: "drill", subject: "psu", objs: ["3.6"],
    label: "Choosing a power supply — five decisions" },
  { id: "connectors", page: "drill", subject: "connectors", objs: ["3.2"],
    label: "Cables and connectors — identification drill" },
  { id: "cabling", page: "index", track: "cabling", objs: ["3.2", "5.5"],
    label: "Cabling and termination — six-step tickets" },
  { id: "printnet", page: "index", track: "printnet", objs: ["3.7", "5.6"],
    label: "Printer networking and sharing — six-step tickets" },
  { id: "laser", page: "index", track: "laser", objs: ["3.8", "5.6"],
    label: "Laser printers — six-step tickets" },
  { id: "inkjet", page: "index", track: "inkjet", objs: ["3.8", "5.6"],
    label: "Inkjet printers — six-step tickets" },
  { id: "cloud", page: "index", track: "cloud", objs: ["4.1", "4.2"], split: true,
    label: "Virtualization and cloud — six-step tickets" },
  { id: "hardware", page: "index", track: "hardware", objs: ["5.1"],
    label: "Hardware — six-step tickets" },
  { id: "power", page: "index", track: "power", objs: ["5.1"],
    label: "Power and safety — six-step tickets" },
  { id: "raid", page: "index", track: "raid", objs: ["5.2"],
    label: "RAID and storage arrays — six-step tickets" },
  { id: "display", page: "index", track: "display", objs: ["5.3"],
    label: "Displays and video — six-step tickets" },
  { id: "network", page: "index", track: "network", objs: ["5.5"],
    label: "Networking — six-step tickets" },
  /* The mixed track has no single objective, and that IS the exercise: the
     ticket does not say which domain it belongs to and working that out is
     the first thing you are graded on. It lives at the end of domain five,
     where the methodology is the subject. */
  { id: "mixed", page: "index", track: "mixed", objs: ["5.x"],
    label: "Mixed — the domain is not given, find it first" }
];

/* Objectives with nothing behind them yet, and what is missing. Shown in the
   picker, disabled, rather than left out — the empty parts of the map are
   part of the map.

   IT IS EMPTY, AND THAT IS THE POINT OF LEAVING IT HERE. Every one of the
   book's twenty-seven sub-objectives now has an exercise behind it. The
   mechanism stays because the honest thing for a course map to do is show
   the gaps, and the day somebody adds a twenty-eighth objective there needs
   to be somewhere for it to say so. */
export const GAPS = {};

/* The pseudo-objective the mixed track sits under, so it has somewhere to
   appear without pretending to be one of the twenty-seven. */
export const CROSS = { "5.x": "Across 5.1 to 5.6 — the ticket does not tell you which" };

const OBJ_TITLE = function (obj) { return OBJECTIVES[obj] || CROSS[obj] || obj; };
export { OBJ_TITLE as objectiveTitle };

/* Which objective a given fault belongs to, on the two tracks that carry
   more than one. Everywhere else a track is one objective and this returns
   null, meaning "do not filter".

   Deliberately reads the fault's own data rather than a list kept here: the
   cloud faults carry their objective in the content, and the mobile split
   is already decided by the objective thread. A second copy of either would
   go stale the first time a fault was added. */
export function faultObjective(track, fault, primaryFor) {
  if (track === "mobile") return primaryFor ? primaryFor(fault, "1.3") : null;
  if (track === "cloud") return String(fault.objective || "").split("/")[0].trim() || null;
  return null;
}

/* Every pickable entry for one domain, in objective order: the exercises
   that serve it, and the objectives that have nothing yet. */
export function entriesFor(domain) {
  var out = [];
  var objs = Object.keys(OBJECTIVES).filter(function (o) { return o.charAt(0) === domain; });
  objs.forEach(function (obj) {
    var hits = EXERCISES.filter(function (e) { return e.objs.indexOf(obj) !== -1; });
    if (!hits.length) {
      out.push({ obj: obj, title: OBJECTIVES[obj], gap: GAPS[obj] || "no exercise yet" });
      return;
    }
    hits.forEach(function (e) { out.push({ obj: obj, title: OBJECTIVES[obj], ex: e }); });
  });
  /* The cross-domain track, at the end of the domain it belongs to. */
  EXERCISES.filter(function (e) {
    return e.objs.some(function (o) { return CROSS[o] && o.charAt(0) === domain; });
  }).forEach(function (e) {
    out.push({ obj: e.objs[0], title: CROSS[e.objs[0]], ex: e });
  });
  return out;
}

/* Every pickable entry across every domain, in book order. */
export function allEntries() {
  return DOMAINS.reduce(function (a, d) { return a.concat(entriesFor(d.key)); }, []);
}

export function exerciseById(id) {
  return EXERCISES.filter(function (e) { return e.id === id; })[0] || null;
}

/* How the picker labels one entry. The objective number leads, always, so
   that the number and the exercise are never separated in a student's head. */
export function entryLabel(entry) {
  var head = entry.obj + "  " + entry.title;
  if (!entry.ex) return head + "  —  " + entry.gap;
  var many = EXERCISES.filter(function (e) { return e.objs.indexOf(entry.obj) !== -1; }).length > 1;
  return many ? head + "  ·  " + entry.ex.label : head;
}

export function entryValue(entry) {
  return entry.ex ? entry.ex.id + "@" + entry.obj : "";
}
