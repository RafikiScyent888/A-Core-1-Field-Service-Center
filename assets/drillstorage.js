/* =====================================================================
   Field Service Center — objective 3.4

   "Compare and contrast storage devices."

   The RAID track already troubleshoots arrays. This is the other half and a
   different skill: nothing is broken, there is a drive on the bench, and
   the questions are what it is, what it is talking over, and what somebody
   accepted when they chose it.

   THE TRAP THIS OBJECTIVE IS BUILT AROUND, and it is a real one that costs
   money every week: TWO DEVICES CAN BE THE SAME SHAPE AND SPEAK DIFFERENT
   BUSES. An M.2 card carrying SATA and an M.2 card carrying PCIe are the
   same length, sit in the same kind of slot and look identical across a
   workshop — and a socket wired for one will not run the other. The keying
   is the only physical difference and it is two notches wide.

   So the four things drawn and asked about are:

   1. THE CONNECTOR AND ITS KEYING. Where the notches are, how many, and
      whether the data and power segments are joined or separate. This is
      also where the SATA-and-SAS asymmetry lives: one of those will drop
      into the other's backplane and the reverse is not true, and the reason
      is a bridge of plastic you can see.
   2. WHAT BUS IT IS ACTUALLY TALKING OVER. Not what shape it is. Two pairs
      in this pool are the same shape and different buses.
   3. WHAT IS INSIDE IT THAT CAN MOVE. Platters and heads, a disc and a
      laser, a spool of tape, or nothing at all. Everything about shock,
      noise, seek time and how it fails follows from that one answer.
   4. WHETHER IT COMES OUT AT ALL. One item in this pool is soldered down,
      and a customer asking to have "the drive" upgraded in that machine is
      asking for a new machine.

   The panel beside the bench carries what an enclosure and a benchmark give
   you — capacity, sequential rate, random rate, idle noise, and what the
   host reports the link as. Never the bus by name and never the form factor
   by name; those are the answers.
   ===================================================================== */

export const DRIVES = [
  {
    key: "hdd35", name: "3.5-inch hard drive", form: "brick35", bus: "SATA",
    moving: "Platters spinning at a fixed speed, with heads flying over them on an arm",
    keying: "An L-shaped data connector and a wider L-shaped power connector beside it, with a " +
      "gap between the two",
    removable: true, capacityRange: "1 TB to 24 TB", seqRate: "180 to 280 MB/s",
    randRate: "under 2 MB/s at small random sizes", noise: "audible seek and a constant hum",
    use: "Bulk capacity where the cost per terabyte matters more than how fast it responds — " +
      "archives, surveillance recording, the second drive in a desktop",
    look: "A heavy rectangular brick with a machined lid, screw holes on the sides and bottom, " +
      "and two connectors at one end.",
    lookalike: "hdd25",
    lookalikeWhy: "The same technology in two sizes, with the same connectors on the end. One " +
      "needs a supply that can start a bigger motor and a bay to match; ordering the wrong size " +
      "gives you something that will not physically mount."
  },
  {
    key: "hdd25", name: "2.5-inch hard drive", form: "brick25", bus: "SATA",
    moving: "Platters spinning at a fixed speed, with heads flying over them on an arm",
    keying: "An L-shaped data connector and a wider L-shaped power connector beside it, with a " +
      "gap between the two",
    removable: true, capacityRange: "500 GB to 5 TB", seqRate: "100 to 140 MB/s",
    randRate: "under 1 MB/s at small random sizes", noise: "a quiet seek and a faint hum",
    use: "A laptop or a small machine that needs capacity cheaply, and where the drop in " +
      "responsiveness against a solid-state one is acceptable",
    look: "A small flat rectangle with a machined lid, mounting holes in the sides, and the same " +
      "two connectors as its larger cousin.",
    lookalike: "ssd25",
    lookalikeWhy: "Identical outline, identical connectors, identical mounting. Pick both up: one " +
      "is noticeably heavier and, if you turn it over gently, you can feel it resist. The other " +
      "has nothing inside it that moves."
  },
  {
    key: "ssd25", name: "2.5-inch SATA solid-state drive", form: "brick25", bus: "SATA",
    moving: "Nothing at all. There are no moving parts anywhere in it",
    keying: "An L-shaped data connector and a wider L-shaped power connector beside it, with a " +
      "gap between the two",
    removable: true, capacityRange: "240 GB to 8 TB", seqRate: "500 to 560 MB/s",
    randRate: "60 to 100 MB/s at small random sizes", noise: "silent",
    use: "Replacing a spinning drive in any machine that has the bay for it — the cheapest single " +
      "change that makes an old machine feel new",
    look: "A light plastic or thin metal rectangle the same size as a laptop hard drive, with the " +
      "same two connectors.",
    lookalike: "hdd25",
    lookalikeWhy: "The same box, the same connectors and the same bay. The weight is the tell, and " +
      "so is the sequential figure on a benchmark — one of them stops at about a hundred and forty " +
      "and the other at about five hundred and sixty, because that is where the bus itself ends."
  },
  {
    key: "m2sata", name: "M.2 SATA solid-state drive", form: "card", bus: "SATA",
    moving: "Nothing at all. There are no moving parts anywhere in it",
    keying: "Two notches in the edge connector, one near each end of the contact run",
    removable: true, capacityRange: "128 GB to 2 TB", seqRate: "500 to 560 MB/s",
    randRate: "60 to 100 MB/s at small random sizes", noise: "silent",
    use: "A machine with an M.2 socket wired for the older bus, or a socket that takes either and " +
      "where the cost matters more than the speed",
    look: "A bare card about the size of a stick of chewing gum, with chips on it and two notches " +
      "in the edge connector.",
    lookalike: "m2nvme",
    lookalikeWhy: "This is the pairing that costs people money. The same card, the same length, " +
      "the same screw, the same socket shape — and a different bus. Count the notches in the edge " +
      "connector: two means it can speak the older bus and one means it cannot, and a socket wired " +
      "for only one of the two will not run the other."
  },
  {
    key: "m2nvme", name: "M.2 NVMe solid-state drive", form: "card", bus: "PCIe",
    moving: "Nothing at all. There are no moving parts anywhere in it",
    keying: "One notch in the edge connector, near one end of the contact run",
    removable: true, capacityRange: "256 GB to 8 TB", seqRate: "3 500 to 7 400 MB/s",
    randRate: "300 to 900 MB/s at small random sizes",
    noise: "silent, and warm enough that some of them come with a spreader",
    use: "Anywhere responsiveness matters and the board has lanes to spare — the system drive in " +
      "any current machine",
    look: "A bare card the same size and shape as its slower twin, with one notch in the edge " +
      "connector rather than two.",
    lookalike: "m2sata",
    lookalikeWhy: "Same card, same slot, same screw, ten times the sequential figure. One notch " +
      "against two is the entire physical difference, and a customer who has bought on price " +
      "rather than on notches has bought something their board may refuse."
  },
  {
    key: "u2", name: "U.2 solid-state drive", form: "brick25", bus: "PCIe",
    moving: "Nothing at all. There are no moving parts anywhere in it",
    keying: "A single wide connector, deeper than a laptop drive's, carrying both power and " +
      "several lanes in one piece",
    removable: true, capacityRange: "1 TB to 15 TB", seqRate: "3 000 to 7 000 MB/s",
    randRate: "400 to 1 500 MB/s at small random sizes", noise: "silent, and it needs airflow",
    use: "A server that wants the speed of a card but the serviceability of a hot-swap bay — a " +
      "drive you can pull from the front of a chassis without opening it",
    look: "The outline of a laptop drive, usually thicker, with one wide connector instead of the " +
      "familiar pair.",
    lookalike: "ssd25",
    lookalikeWhy: "The same outline in the same caddies, and both are silent. Look at the end: " +
      "two separate connectors with a gap, or one wide one. They do not fit each other's " +
      "backplanes and the faster one needs lanes the other's bay does not carry."
  },
  {
    key: "sas", name: "SAS hard drive", form: "brick25", bus: "SAS",
    moving: "Platters spinning at a fixed speed, with heads flying over them on an arm",
    keying: "The same outline as a laptop drive, but with the bridge between the data and power " +
      "segments filled in rather than open",
    removable: true, capacityRange: "600 GB to 2.4 TB", seqRate: "200 to 250 MB/s",
    randRate: "under 3 MB/s at small random sizes", noise: "an audible, faster seek",
    use: "A server backplane that wants dual paths to the drive and a duty cycle a desktop drive " +
      "would not survive",
    look: "A laptop-sized drive whose end connector is one continuous piece rather than two with " +
      "a gap between them.",
    lookalike: "hdd25",
    lookalikeWhy: "Nearly the same object, and the asymmetry catches people out: the desktop sort " +
      "will drop into this one's backplane and work, and this one will NOT go into a desktop " +
      "board's connector, because the bridge between the two segments is filled in. Look at the " +
      "gap before you push."
  },
  {
    key: "nvmecard", name: "NVMe add-in card", form: "aic", bus: "PCIe",
    moving: "Nothing at all — though many of them carry a fan, which does",
    keying: "A PCIe edge connector with a notch near one end, and a bracket at the other",
    removable: true, capacityRange: "1 TB to 30 TB", seqRate: "5 000 to 14 000 MB/s",
    randRate: "800 to 2 500 MB/s at small random sizes",
    noise: "silent unless it has a fan on it, which the fast ones do",
    use: "A workstation or server with a spare expansion slot and no M.2 socket free, or where " +
      "the drive needs more lanes and more cooling than a bare card can be given",
    look: "A full expansion card with a bracket, going into a slot on the board rather than " +
      "lying flat on it.",
    lookalike: "m2nvme",
    lookalikeWhy: "The same bus and often the same controller, in two shapes. One lies flat in a " +
      "small socket and one stands up in an expansion slot with a bracket — so which one fits is " +
      "decided by what is free on the board rather than by what is faster."
  },
  {
    key: "msata", name: "mSATA solid-state drive", form: "card", bus: "SATA",
    moving: "Nothing at all. There are no moving parts anywhere in it",
    keying: "A single notch, on a shorter and wider card than the current one, with a different " +
      "contact pitch",
    removable: true, capacityRange: "32 GB to 1 TB", seqRate: "500 to 550 MB/s",
    randRate: "40 to 80 MB/s at small random sizes", noise: "silent",
    use: "Nothing you would specify now. Recognise it because it is still in machines people " +
      "bring in, and because it will drop into a socket it must not go in",
    look: "A short wide card with one notch, in a socket that looks like a wireless card's — " +
      "which is exactly the problem.",
    lookalike: "m2sata",
    lookalikeWhy: "Both are bare cards held down with one screw, both speak the older bus, and " +
      "the sockets look alike at a glance. The older one is shorter and wider with a different " +
      "contact pitch, and it shares a socket shape with a wireless card, which is how one ends up " +
      "in the wrong slot."
  },
  {
    key: "optical", name: "Optical drive", form: "brick35", bus: "SATA",
    moving: "A disc spinning on a spindle, and a laser assembly tracking across it on rails",
    keying: "The same L-shaped data connector and wider power connector as a hard drive, with a " +
      "gap between the two, on a taller chassis with a tray at the front",
    removable: true, capacityRange: "700 MB to 100 GB per disc", seqRate: "20 to 60 MB/s",
    randRate: "negligible — the seek time is measured in hundreds of milliseconds", noise: "loud",
    use: "Reading media somebody still has, and writing something that has to be handed over on a " +
      "disc — which in some regulated work is still a requirement",
    look: "A wide flat chassis with a tray that comes out of the front, and the same two " +
      "connectors on the back as a hard drive.",
    lookalike: "hdd35",
    lookalikeWhy: "The same connectors, the same bay width and the same cables. One takes media " +
      "out of the front and the other never opens, and the pair get confused mostly on the " +
      "ordering form rather than on the bench."
  },
  {
    key: "flash", name: "USB flash drive", form: "stick", bus: "USB",
    moving: "Nothing at all. There are no moving parts anywhere in it",
    keying: "A USB plug moulded into the body, so it needs no cable and no separate power",
    removable: true, capacityRange: "8 GB to 1 TB", seqRate: "20 to 400 MB/s depending on the generation",
    randRate: "1 to 40 MB/s at small random sizes", noise: "silent",
    use: "Moving something from one machine to another, carrying an installer, or as the boot " +
      "medium for a rescue tool",
    look: "A small body with a plug moulded into one end and no cable anywhere.",
    lookalike: "sdcard",
    lookalikeWhy: "Both are pocket flash storage, both are what a customer means by “my memory " +
      "stick”, and both fail the same way. One carries its own plug and the other needs a slot or " +
      "a reader — which decides whether the machine in front of you can read it at all."
  },
  {
    key: "sdcard", name: "SD or microSD card", form: "flat", bus: "SD",
    moving: "Nothing at all. There are no moving parts anywhere in it",
    keying: "A bevelled corner and a row of flat contacts on one face, so it only goes in one way",
    removable: true, capacityRange: "16 GB to 1 TB", seqRate: "20 to 300 MB/s depending on the class",
    randRate: "1 to 20 MB/s at small random sizes", noise: "silent",
    use: "Cameras, handsets, single-board computers and anything with a slot — and as the thing a " +
      "customer hands you when the photographs are the only copy",
    look: "A thin flat card with one corner cut off and contacts on one face, with no plug on it " +
      "at all.",
    lookalike: "flash",
    lookalikeWhy: "The same technology in two packages and the same conversation with the " +
      "customer. One plugs straight in; the other needs a slot or a reader, and the speed class " +
      "marked on it decides whether it can keep up with what wrote to it."
  },
  {
    key: "tape", name: "Tape cartridge", form: "flat", bus: "SAS",
    moving: "A spool of tape, wound past a head — the drive pulls the tape out of the cartridge " +
      "and winds it onto a second spool inside itself",
    keying: "A shuttered opening at one edge and a write-protect slider, with no electrical " +
      "connector on the cartridge at all",
    removable: true, capacityRange: "6 TB to 18 TB uncompressed per cartridge",
    seqRate: "300 to 400 MB/s once it is streaming",
    randRate: "none worth measuring — reaching a file can take a minute or more", noise: "the drive is loud",
    use: "Keeping copies somewhere that is not the building and not on anything a machine can " +
      "reach — the only medium on this bench that is genuinely offline once it is on a shelf",
    look: "A sealed plastic cartridge with a shutter along one edge, a slider on the corner, and " +
      "no contacts anywhere on it.",
    lookalike: "sdcard",
    lookalikeWhy: "Not a pairing about appearance — a pairing about what people think backup is. " +
      "One is removable storage somebody carries about; the other is the only thing here that " +
      "sits on a shelf with nothing able to reach it, which is the whole point of it."
  },
  {
    key: "emmc", name: "eMMC soldered storage", form: "chip", bus: "SD",
    moving: "Nothing at all. There are no moving parts anywhere in it",
    keying: "None. It is a chip soldered to the machine's own board with no connector of any kind",
    removable: false, capacityRange: "32 GB to 256 GB", seqRate: "150 to 300 MB/s",
    randRate: "5 to 20 MB/s at small random sizes", noise: "silent",
    use: "The cheapest machines and many tablets, where the storage is part of the board and the " +
      "price reflects that",
    look: "A single square chip soldered flat to the board, with no connector, no screw and no " +
      "way to lift it.",
    lookalike: "m2nvme",
    lookalikeWhy: "Both are the system storage of a small modern machine and a customer calls " +
      "both “the drive”. One comes out with a screwdriver and the other comes out with a hot air " +
      "station and a new board — so “can you put a bigger drive in it” has two completely " +
      "different answers, and one of them is no."
  },
  {
    /* eSATA is on the objective and was nowhere in this build, so a student
       met every internal interface and only one external one. */
    key: "esata", name: "eSATA external drive", form: "brick35", bus: "SATA",
    moving: "A platter stack and heads, in a caddy on the desk rather than inside the machine",
    keying: "An L-shaped connector like the internal one but with a deeper shell and no notch \u2014 " +
      "it will not mate with an internal SATA lead, and that is deliberate",
    removable: true, capacityRange: "1 TB to 18 TB", seqRate: "150 to 260 MB/s",
    randRate: "0.5 to 2 MB/s at small random sizes", noise: "audible \u2014 spin-up and seeks",
    use: "Where an external drive has to run at the speed of the drive rather than the speed of " +
      "the port, and the machine has the socket for it",
    look: "A desktop caddy with its own power brick and a flat data socket that looks almost like " +
      "the one inside the machine but will not take that lead.",
    lookalike: "hdd35",
    lookalikeWhy: "The same drive is inside both, and that is the point: what differs is the " +
      "enclosure and the socket, not the storage. Reaching for an internal SATA lead to connect " +
      "this is the mistake, and the shell shape is what stops you."
  },
  {
    key: "sshd", name: "Solid-state hybrid drive", form: "brick25", bus: "SATA",
    moving: "A platter and heads, with a small block of flash in front of them",
    keying: "Identical to any other 2.5-inch drive \u2014 nothing on the outside says which of " +
      "the two it is",
    removable: true, capacityRange: "500 GB to 2 TB", seqRate: "100 to 140 MB/s sustained",
    randRate: "uneven \u2014 fast for anything the cache has seen, slow for anything it has not",
    noise: "audible, though quieter than a desktop drive",
    use: "Almost nothing you would specify now. Recognise it because a machine that is quick on " +
      "the things it does daily and slow on everything else is behaving as designed, not failing",
    look: "A 2.5-inch drive indistinguishable from any other until you read the label or watch " +
      "how unevenly it performs.",
    lookalike: "hdd25",
    lookalikeWhy: "Same size, same socket, same weight, same noise. The tell is behavioural: two " +
      "runs of the same benchmark disagree, because the second is reading from cache and the " +
      "first was not."
  },
  {
    key: "hotswap", name: "Hot-swap drive in a carrier", form: "brick35", bus: "SAS or SATA",
    moving: "Whatever is in the carrier \u2014 the carrier itself is just a frame",
    keying: "No cable at all. The drive mates straight into a backplane when the carrier is " +
      "pushed home",
    removable: true, capacityRange: "whatever the drive in it is",
    seqRate: "whatever the drive in it is", randRate: "whatever the drive in it is",
    noise: "whatever the drive in it is",
    use: "In a server or array where a failed drive comes out without powering anything down, " +
      "and where pulling the wrong one turns a rebuild into a restore",
    look: "A drive in a metal frame with a latch and a lamp on the front, and no data or power " +
      "lead anywhere on it.",
    lookalike: "sas",
    lookalikeWhy: "The drive inside the carrier may well BE the SAS drive. What you are asked to " +
      "recognise is the carrier: no leads, a latch, a backplane behind it. That is what makes it " +
      "hot-swappable, not the drive."
  },
];

const BY = {};
DRIVES.forEach(function (d) { BY[d.key] = d; });
export { BY as BY_KEY };

function pick(D, field, n, rnd) {
  var it = D.item;
  var want = String(it[field]);
  var look = BY[it.lookalike];
  var out = [], seen = {};
  seen[want] = 1;
  function take(c) {
    if (c.key === it.key) return;
    var v = String(c[field]);
    if (out.length >= n || seen[v]) return;
    seen[v] = 1; out.push(c);
  }
  if (look) take(look);
  rnd(DRIVES).forEach(take);
  return out.slice(0, n);
}

/* ---------------------------------------------------------------------
   What an enclosure and a benchmark give you.

   Capacity, throughput, latency and noise — the numbers a technician would
   actually have in front of them. Never the bus by name, never the form
   factor by name, and never whether it comes out, because those three are
   the answers to three of the five questions.

   The random figure and the noise figure between them separate the whole
   pool into what moves and what does not, without either being said.
   --------------------------------------------------------------------- */
export function benchRows(D) {
  var it = D.item;
  return [
    { k: "Capacity it is sold in", v: it.capacityRange },
    { k: "Sequential read on the bench", v: it.seqRate },
    { k: "Random read at 4 KB", v: it.randRate },
    { k: "What you can hear from a foot away", v: it.noise },
    { k: "What the host reports the link as", v: it.bus === "PCIe"
        ? "A number of lanes and a generation"
        : it.bus === "USB" ? "A generation and a negotiated speed"
        : it.bus === "SD" ? "A bus width and a mode"
        : "A single link at a negotiated speed in gigabits" }
  ];
}

export function driveQuestions(D, rnd) {
  var it = D.item;
  var qs = [];

  qs.push({
    id: "which",
    ask: "Which device is this?",
    hint: "Shape and connector, in that order. Then look at the benchmark beside it — the random " +
      "figure and the noise between them tell you whether anything inside it is moving, and that " +
      "halves the pool before you have decided anything else.",
    answer: it.name,
    choices: [it.name].concat(pick(D, "name", 3, rnd).map(function (c) { return c.name; })),
    why: function (chosen) {
      if (chosen === it.name) return it.look + " " + it.lookalikeWhy;
      var o = DRIVES.filter(function (c) { return c.name === chosen; })[0];
      return o ? "That is a real device and it is not this one. " + o.look
        : "That is not what is on the bench.";
    }
  });

  /* The bus question, which is the trap this objective is built around. */
  var BUSES = {
    SATA: "A single serial link, at a few gigabits, that tops out around five hundred and sixty " +
      "megabytes a second no matter what is behind it",
    PCIe: "Several lanes straight to the processor, with no controller in between capping it",
    USB: "A general-purpose external bus shared with whatever else is plugged into the machine",
    SD: "A narrow bus of its own, a few bits wide, designed for low power rather than for speed",
    SAS: "A serial link like the desktop one but with two paths to the drive and a command set " +
      "built for equipment that never stops"
  };
  var busAnswer = BUSES[it.bus];
  qs.push({
    id: "bus",
    ask: "What is it actually talking over?",
    hint: "Not what shape it is — two pairs in this pool are the same shape and different buses. " +
      "Look at the notches in the connector, and at where the sequential figure on the bench " +
      "stops, because a bus has a ceiling and a device cannot exceed it.",
    answer: busAnswer,
    choices: [busAnswer].concat(Object.keys(BUSES).filter(function (b) { return b !== it.bus; })
      .map(function (b) { return BUSES[b]; }).slice(0, 3)),
    why: function (chosen) {
      if (chosen === busAnswer) {
        return "Yes. " + busAnswer + ". The sequential figure on the bench is that sentence as a " +
          "number: a device sitting just under a ceiling is sitting under the bus's ceiling and " +
          "not its own.";
      }
      return "That is a different bus. Two things point at the right one: how many notches are in " +
        "the connector, and where the sequential figure stops — a device that reads at five " +
        "hundred and fifty is not being held back by its chips.";
    }
  });

  qs.push({
    id: "moving",
    ask: "What is inside it that can move?",
    hint: "Read the random figure and the noise line together. Anything that has to move a head " +
      "or a spool before it can answer is orders of magnitude slower at small random reads, and " +
      "you can usually hear it.",
    answer: it.moving,
    choices: [it.moving].concat(pick(D, "moving", 3, rnd).map(function (c) { return c.moving; })),
    why: function (chosen) {
      if (chosen === it.moving) {
        return "Correct. " + it.moving + ". Everything about how it fails, how it sounds, how it " +
          "survives being knocked and how it behaves on small reads follows from that one " +
          "sentence.";
      }
      return "That is what moves inside something else here. Go back to the random figure: a " +
        "device that reads megabytes per second at four kilobytes has nothing to position, and " +
        "one that manages a fraction of a megabyte has.";
    }
  });

  qs.push({
    id: "use",
    ask: "What would you fit one for?",
    hint: "What the person choosing it was optimising for, and what they gave up. Cost per " +
      "terabyte, responsiveness, serviceability, portability, or being genuinely unreachable.",
    answer: it.use,
    choices: [it.use].concat(pick(D, "use", 3, rnd).map(function (c) { return c.use; })),
    why: function (chosen) {
      if (chosen === it.use) return "Right. " + it.use + ".";
      return "That is why something else here gets fitted. Work from the numbers on the bench and " +
        "from what is inside it — whatever this one is unusually good or unusually bad at is what " +
        "somebody was deciding about.";
    }
  });

  qs.push({
    id: "confused",
    ask: "Which device does it get confused with?",
    hint: "Not the one furthest away — the one somebody orders, fits or quotes instead, and then " +
      "finds will not go in or will not run.",
    answer: BY[it.lookalike].name,
    choices: (function () {
      var set = [BY[it.lookalike].name];
      pick(D, "name", 6, rnd).forEach(function (c) {
        if (set.length < 4 && c.key !== it.lookalike && set.indexOf(c.name) === -1) set.push(c.name);
      });
      return set;
    })(),
    why: function (chosen) {
      if (chosen === BY[it.lookalike].name) return it.lookalikeWhy;
      return "That one is separable at a glance. The pairing this question wants is the one that " +
        "ends with a part on the bench that does not fit or does not run.";
    }
  });

  return qs;
}
