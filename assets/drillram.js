/* =====================================================================
   Field Service Center — objective 3.3

   "Compare and contrast RAM characteristics."

   This objective is a gift, because a memory module is the one component in
   the whole syllabus where nearly every characteristic the exam asks about
   is a physical feature you can see and count. Nothing has to be invented
   and nothing has to be read off a box.

   THE FOUR THINGS A TECHNICIAN ACTUALLY LOOKS AT, in order:

   1. WHERE THE NOTCH IS. The keying is not a hint, it is a mechanism: a
      module of the wrong generation physically will not seat, and the notch
      moves along the edge connector with each generation. This is the first
      thing to look at and it settles more than half the pool in one glance.
   2. HOW LONG IT IS. A full-length module and a laptop module are the same
      technology in two lengths, and one will not go in the other's socket.
   3. HOW MANY CHIPS THERE ARE, PER RANK. Count them and divide by the rank
      count on the label. Up to the generation before the current one a rank
      is sixty-four data bits, so eight chips carry data and a ninth carries
      check bits — hence the rule everybody learns, that a multiple of nine
      means error correction. THAT RULE IS WRONG ON THE CURRENT GENERATION.
      A module of the newest sort is two independent halves of thirty-two
      bits, each with eight check bits of its own, so an error-correcting
      rank is TEN chips rather than nine. The characteristic is the same
      idea — is there a spare chip beyond what the data needs — and the
      arithmetic changed underneath it.
   4. IS THERE ANYTHING ON IT THAT IS NOT A MEMORY CHIP. A register in the
      middle, a buffer, a power management chip, a thermal sensor. Each of
      those is a different kind of module that a different kind of board
      demands, and fitting the wrong one gives you a machine that does not
      post rather than a machine that runs slowly.

   THE QUESTION THAT MATTERS MOST is what it will NOT work in. Almost every
   RAM call-out in the field is a compatibility question rather than a fault:
   somebody has bought the right capacity of the wrong thing.

   The panel beside the bench carries what a ruler and a meter give you —
   length, contact count, marked voltage, speed grade. Never the generation
   by name and never what the extra chips are for.
   ===================================================================== */

export const MODULES = [
  {
    key: "ddr3", name: "DDR3 UDIMM", form: "dimm", gen: 3,
    contacts: 240, length: "133 mm", notch: 0.44, chips: 8, perSide: 8, ranks: 1,
    ecc: false, buffer: "none", extraChip: "none", volts: "1.5 V",
    speed: "1066 to 1866 MT/s",
    wont: "A board of any other generation. The notch is in a different place on each one and the " +
      "module physically will not seat — which is a mercy, because seating one in the wrong slot " +
      "would destroy it",
    use: "A desktop or a tower of that era, where the board takes full-length modules and does " +
      "not ask for error correction",
    look: "A full-length stick with eight chips along one face and the notch a little left of " +
      "centre.",
    lookalike: "ddr3l",
    lookalikeWhy: "The same length, the same notch in the same place, the same number of chips, " +
      "and they will both seat in the same socket. The difference is the voltage printed on the " +
      "label, and putting the higher-voltage one in a board that only supplies the lower one is " +
      "how a laptop comes back not posting."
  },
  {
    key: "ddr3l", name: "DDR3L UDIMM", form: "dimm", gen: 3,
    contacts: 240, length: "133 mm", notch: 0.44, chips: 8, perSide: 8, ranks: 1,
    ecc: false, buffer: "none", extraChip: "none", volts: "1.35 V",
    speed: "1333 to 1866 MT/s",
    wont: "Nothing it fits, usually — it runs at the lower voltage and most boards of that era " +
      "will drive it. The trap is the other way round, and it is the label rather than the shape " +
      "that tells you",
    use: "Anywhere the board or the laptop specifies the lower voltage, and as a safe substitute " +
      "in most boards that specify the higher one",
    look: "Identical to its full-voltage cousin in every physical respect. The only difference is " +
      "printed on the label.",
    lookalike: "ddr3",
    lookalikeWhy: "There is no physical difference at all — same length, same notch, same chips, " +
      "same socket. This is the one pair in the pool you genuinely cannot separate by looking at " +
      "the module, and the fault it causes looks like a dead board."
  },
  {
    key: "ddr3so", name: "DDR3 SODIMM", form: "sodimm", gen: 3,
    contacts: 204, length: "67 mm", notch: 0.52, chips: 8, perSide: 8, ranks: 1,
    ecc: false, buffer: "none", extraChip: "none", volts: "1.5 V",
    speed: "1066 to 1866 MT/s",
    wont: "Any full-length socket. It is half the length and the socket holds it at an angle and " +
      "clips it flat, which is a completely different mechanism",
    use: "A laptop, a small-form-factor machine or an all-in-one of that era",
    look: "A short stick, about half the length of a desktop module, with eight chips on it.",
    lookalike: "ddr4so",
    lookalikeWhy: "Two short sticks that go in the same shape of socket and look the same across " +
      "a workshop. The notch is in a different place on each and the newer one has a curved edge " +
      "along the bottom of the contacts — look at the edge before you push."
  },
  {
    key: "ddr4", name: "DDR4 UDIMM", form: "dimm", gen: 4,
    contacts: 288, length: "133 mm", notch: 0.485, chips: 8, perSide: 8, ranks: 1,
    ecc: false, buffer: "none", extraChip: "none", volts: "1.2 V",
    speed: "2133 to 3200 MT/s",
    wont: "A board of any other generation, and any board that demands error correction or a " +
      "registered module — both of those refuse a plain one",
    use: "The ordinary desktop and workstation module of its generation, where the board wants " +
      "full-length unbuffered memory",
    look: "A full-length stick with eight chips, a notch near the middle, and an edge connector " +
      "whose bottom edge curves slightly rather than running straight.",
    lookalike: "ddr4ecc",
    lookalikeWhy: "The same length, the same notch, the same socket and the same generation. " +
      "Count the chips: eight is ordinary and nine is error-correcting, and a board that requires " +
      "the second will not post with the first in it."
  },
  {
    key: "ddr4so", name: "DDR4 SODIMM", form: "sodimm", gen: 4,
    contacts: 260, length: "70 mm", notch: 0.42, chips: 8, perSide: 8, ranks: 1,
    ecc: false, buffer: "none", extraChip: "none", volts: "1.2 V",
    speed: "2133 to 3200 MT/s",
    wont: "Any full-length socket, and any laptop of a different generation — the notch moved",
    use: "A laptop, a small-form-factor machine or a mini PC of its generation",
    look: "A short stick with eight chips and a curved bottom edge on the contacts.",
    lookalike: "ddr3so",
    lookalikeWhy: "The same shape, the same socket mechanism and the same job one generation " +
      "apart. The notch has moved and the contact edge is curved on the newer one, and a customer " +
      "who has bought the wrong one has bought something that will not go in."
  },
  {
    key: "ddr4ecc", name: "DDR4 ECC unbuffered DIMM", form: "dimm", gen: 4,
    contacts: 288, length: "133 mm", notch: 0.485, chips: 9, perSide: 9, ranks: 1,
    ecc: true, buffer: "none", extraChip: "none", volts: "1.2 V",
    speed: "2133 to 3200 MT/s",
    wont: "A board that does not support error correction. It may post and simply ignore the " +
      "extra chip, or it may refuse outright, and which of those happens is the board's decision " +
      "rather than yours",
    use: "A small server or a workstation whose board supports error correction but does not " +
      "require registered modules — the middle ground, and the one people order wrong",
    look: "A full-length stick that looks ordinary until you count the chips and find nine rather " +
      "than eight.",
    lookalike: "ddr4",
    lookalikeWhy: "Identical length, identical notch, identical socket. One extra chip per rank " +
      "is the entire difference, and that chip is what stores the check bits. Count them — it " +
      "takes two seconds and it is the whole answer."
  },
  {
    key: "ddr4rdimm", name: "DDR4 registered DIMM", form: "dimm", gen: 4,
    contacts: 288, length: "133 mm", notch: 0.485, chips: 18, perSide: 9, ranks: 2,
    ecc: true, buffer: "register", extraChip: "a register in the middle of the module",
    volts: "1.2 V", speed: "2133 to 3200 MT/s",
    wont: "Any ordinary desktop board. The register changes how the board addresses it, so a " +
      "board that does not expect one will not post at all — no beep, no picture, nothing",
    use: "A server board that requires registered memory, where the point is to hang far more " +
      "modules off one channel than an unbuffered design could drive",
    look: "A full-length stick with chips on both faces and one chip in the middle of the row " +
      "that is a different size from the rest.",
    lookalike: "ddr4ecc",
    lookalikeWhy: "Both correct errors, both go in the same shape of socket, and both get " +
      "described as “server memory”. Look at the middle of the module for a chip that is not a " +
      "memory chip: with one, a desktop board will not post; without one, a server board that " +
      "demands it will not post either."
  },
  {
    key: "ddr4lrdimm", name: "DDR4 load-reduced DIMM", form: "dimm", gen: 4,
    contacts: 288, length: "133 mm", notch: 0.485, chips: 36, perSide: 18, ranks: 4,
    ecc: true, buffer: "buffer", extraChip: "a buffer in the middle, larger than a register",
    volts: "1.2 V", speed: "2133 to 3200 MT/s",
    wont: "Any board that is not expecting one — including most boards that happily take " +
      "registered modules. Mixing it with registered modules in the same machine is refused too",
    use: "The largest capacities on a server board that supports them, where every rank on the " +
      "channel is buffered so that many more of them can be driven at full speed",
    look: "A full-length stick crowded with chips on both faces, a large chip in the middle, and " +
      "usually a metal spreader over the lot.",
    lookalike: "ddr4rdimm",
    lookalikeWhy: "Both are server modules with a chip in the middle and both correct errors. The " +
      "buffer on this one is bigger and handles the data as well as the addressing, and the two " +
      "may not be mixed in the same machine — which is the mistake that turns an upgrade into a " +
      "machine that will not start."
  },
  {
    key: "ddr5", name: "DDR5 UDIMM", form: "dimm", gen: 5,
    contacts: 288, length: "133 mm", notch: 0.53, chips: 8, perSide: 8, ranks: 1,
    ecc: false, buffer: "none", extraChip: "a power management chip on the module itself",
    volts: "1.1 V", speed: "4800 to 6400 MT/s",
    wont: "Any board of an earlier generation. Same contact count as the generation before it and " +
      "a notch in a different place, which is the only thing stopping somebody forcing one in",
    use: "The ordinary desktop module of its generation. Note that its power regulation is on the " +
      "module rather than on the board, which is why it has a chip that earlier ones do not",
    look: "A full-length stick with eight chips and one small extra chip near the middle that is " +
      "not memory, with the notch further to the right than the generation before.",
    lookalike: "ddr4",
    lookalikeWhy: "The same length and the same number of contacts, which is exactly why the " +
      "notch had to move. It is the same count and a different key, so somebody comparing the " +
      "specification sheet rather than looking at the module will order the wrong one."
  },
  {
    key: "ddr5so", name: "DDR5 SODIMM", form: "sodimm", gen: 5,
    contacts: 262, length: "70 mm", notch: 0.47, chips: 8, perSide: 8, ranks: 1,
    ecc: false, buffer: "none", extraChip: "a power management chip on the module itself",
    volts: "1.1 V", speed: "4800 to 5600 MT/s",
    wont: "Any laptop of an earlier generation, and any full-length socket",
    use: "A laptop or a mini PC of its generation, where the socket is the short one and the " +
      "board expects the newer keying",
    look: "A short stick with eight chips and a small extra chip that is not memory.",
    lookalike: "ddr4so",
    lookalikeWhy: "Two short sticks two contacts apart on the specification sheet, which is no " +
      "help at all in a workshop. The notch has moved and the newer one carries a chip the older " +
      "one does not — and it will not go into the older socket."
  },
  {
    key: "ddr5rdimm", name: "DDR5 registered DIMM", form: "dimm", gen: 5,
    contacts: 288, length: "133 mm", notch: 0.53, chips: 20, perSide: 10, ranks: 2,
    ecc: true, buffer: "register", extraChip: "a register and a power management chip",
    volts: "1.1 V", speed: "4800 to 5600 MT/s",
    wont: "Any desktop board, and any server board of an earlier generation. The keying stops the " +
      "second and the register stops the first",
    use: "A current server board that requires registered memory, where the capacities and the " +
      "channel counts are beyond what an unbuffered module could drive",
    look: "A full-length stick crowded with chips on both faces, a register in the middle, a " +
      "second small chip that is not memory, and the notch well to the right.",
    lookalike: "ddr4rdimm",
    lookalikeWhy: "Two server sticks with a chip in the middle, the same length and the same " +
      "contact count. The notch is in a different place and the newer one carries its own power " +
      "regulation, so a shelf holding both is a shelf somebody will pick wrong from."
  },
  {
    key: "camm2", name: "CAMM2 module", form: "camm", gen: 5,
    contacts: 644, length: "78 mm across, and flat", notch: 0, chips: 16, perSide: 16, ranks: 2,
    ecc: false, buffer: "none", extraChip: "a power management chip on the module itself",
    volts: "1.1 V", speed: "5600 to 7500 MT/s",
    wont: "Any socket that holds a stick. It is not a stick — it lies flat against the board on a " +
      "field of contacts and is held down with screws",
    use: "A thin laptop where there is no room for a stick standing up or lying at an angle, and " +
      "where the machine still has to be serviceable rather than soldered",
    look: "Not a stick at all: a flat rectangular board that lies against the machine's own board " +
      "on a compression connector, with screws through it.",
    lookalike: "ddr5so",
    lookalikeWhy: "Both are the current generation in a laptop and both get called “the memory”. " +
      "One is a stick that clips into a socket and one is a flat board screwed down onto a field " +
      "of contacts, and a machine takes one or the other and never both."
  },
  {
    key: "ddr2", name: "DDR2 UDIMM", form: "dimm", gen: 2,
    contacts: 240, length: "133 mm", notch: 0.58, chips: 8, perSide: 8, ranks: 1,
    ecc: false, buffer: "none", extraChip: "none", volts: "1.8 V",
    speed: "400 to 800 MT/s",
    wont: "Any board of a later generation, and it is the notch that stops you rather than the " +
      "contact count \u2014 which is the same as the generation after it",
    use: "Equipment old enough that nobody replaces the machine: a machine tool controller, a " +
      "test rig, a till that still works. You meet it because the thing it is in cannot be " +
      "replaced, not because anybody chose it",
    look: "A full-length stick with eight chips and the notch noticeably right of where the next " +
      "generation puts it.",
    lookalike: "ddr3",
    lookalikeWhy: "The same length and THE SAME NUMBER OF CONTACTS \u2014 two hundred and forty on " +
      "both, which is why a specification sheet will not separate them. Only the notch does, and " +
      "it is in a different place. This is the pair where counting the pins actively misleads you."
  },
  {
    key: "ddr3rdimm", name: "DDR3 registered DIMM", form: "dimm", gen: 3,
    contacts: 240, length: "133 mm", notch: 0.44, chips: 18, perSide: 9, ranks: 2,
    ecc: true, buffer: "register", extraChip: "a register in the middle of the module",
    volts: "1.5 V", speed: "1066 to 1866 MT/s",
    wont: "Any ordinary desktop board of its own generation \u2014 it fits the socket perfectly and " +
      "the board will not run it, which is the whole trap",
    use: "A server of that era. It turns up in a workshop because a decommissioned server gets " +
      "stripped and the memory looks exactly like desktop memory of the same generation",
    look: "A full-length stick with nine chips a side and one narrow chip in the middle that is " +
      "not memory.",
    lookalike: "ddr3",
    lookalikeWhy: "Same generation, same length, same notch, same socket \u2014 it seats with a " +
      "click and the machine does not post. Server memory out of a stripped rack is the most " +
      "common source of memory that fits and does not work, and the register in the middle is the " +
      "thing to look for before it goes anywhere near a desktop board."
  },
  {
    key: "ddr5ecc", name: "DDR5 ECC unbuffered DIMM", form: "dimm", gen: 5,
    contacts: 288, length: "133 mm", notch: 0.53, chips: 20, perSide: 10, ranks: 2,
    ecc: true, buffer: "none", extraChip: "a power management chip on the module itself",
    volts: "1.1 V", speed: "4800 to 5600 MT/s",
    wont: "A board that does not support error correction \u2014 and note that this generation makes " +
      "that harder to establish, not easier, because every module of it corrects some errors " +
      "internally whether or not it is an error-correcting module",
    use: "A workstation or a small server whose board asks for error correction without asking " +
      "for registered modules",
    look: "A full-length stick with ten chips a side rather than eight, plus the small power chip " +
      "every module of this generation carries.",
    lookalike: "ddr5",
    lookalikeWhy: "THE CONFUSION HERE IS NOT PHYSICAL, IT IS A WORD. Every module of this " +
      "generation has error correction ON THE CHIPS, which fixes faults inside the chip and " +
      "reports nothing to the machine. That is not the same as an error-correcting module, which " +
      "carries extra chips and tells the board what it found. A datasheet saying the ordinary " +
      "module has on-die correction is telling the truth and answering a different question."
  },
  {
    key: "ddr5cudimm", name: "DDR5 clocked UDIMM", form: "dimm", gen: 5,
    contacts: 288, length: "133 mm", notch: 0.53, chips: 16, perSide: 8, ranks: 2,
    ecc: false, buffer: "none",
    extraChip: "a clock driver chip near the contact edge, and the power management chip every " +
      "module of this generation carries",
    volts: "1.1 V", speed: "6400 to 8000 MT/s",
    wont: "Nothing, physically \u2014 it seats in any socket of its generation. What it will not do " +
      "is run at its rated speed on a board that cannot drive it, where it falls back and behaves " +
      "like an ordinary module",
    use: "A desktop being built for the top speeds of its generation, on a board whose " +
      "specification says it supports the clocked sort",
    look: "A full-length stick of the current generation with one extra small chip near the " +
      "contact edge, in addition to the power chip they all carry.",
    lookalike: "ddr5",
    lookalikeWhy: "Same generation, same notch, same socket, same length, and the difference is " +
      "one small chip that regenerates the clock on the module instead of relying on the board. " +
      "Buy it for a board that cannot use it and you have paid for a speed the machine will never " +
      "show \u2014 and nothing is faulty, which makes it a very hard conversation."
  },
  {
    key: "lpddr", name: "Soldered LPDDR memory", form: "soldered", gen: 5,
    contacts: 0, length: "not a module \u2014 chips on the machine's own board", notch: 0,
    chips: 4, perSide: 4, ranks: 1,
    ecc: false, buffer: "none", extraChip: "none", volts: "1.05 V",
    speed: "6400 to 8533 MT/s",
    wont: "It does not go anywhere, because it is already where it is going to be. There is no " +
      "socket in the machine and nothing to remove",
    use: "A thin laptop or a tablet, where the memory is part of the board and the amount ordered " +
      "on the day the machine was bought is the amount it will have for its whole life",
    look: "Not a stick and not a card. Four flat chips soldered directly to the machine\u2019s own " +
      "board, with no socket, no latch and no screw anywhere near them.",
    lookalike: "camm2",
    lookalikeWhy: "Both are flat, both are in a thin laptop, and both get answered with \u201cyes, " +
      "we can add memory\u201d by somebody who has not opened the machine. One is a serviceable " +
      "board held down with screws and the other is soldered on. THE QUESTION TO ANSWER BEFORE " +
      "QUOTING is which of the two this machine has, and the only way to know is to look."
  }
];

const BY = {};
MODULES.forEach(function (m) { BY[m.key] = m; });
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
  rnd(MODULES).forEach(take);
  return out.slice(0, n);
}

/* ---------------------------------------------------------------------
   What a ruler, a meter and the label give you.

   Never the generation by name, never what the extra chips are for, and
   never the chip count — the count is something you take off the model,
   because counting is the skill this objective is really testing.
   --------------------------------------------------------------------- */
export function labelRows(D) {
  var it = D.item;
  return [
    { k: "Overall length", v: it.length },
    { k: "Contacts on the edge", v: String(it.contacts) },
    { k: "Marked operating voltage", v: it.volts },
    { k: "Speed grades it is sold in", v: it.speed },
    { k: "Organisation, as printed", v: it.ranks + "R x8" },
    { k: "How it is held in place", v: it.form === "camm"
        ? "Screws, flat against the board"
        : it.form === "sodimm"
          ? "Two side clips, with the module lying at an angle then pressed flat"
          : "Two end latches, with the module standing upright" }
  ];
}

export function ramQuestions(D, rnd) {
  var it = D.item;
  var qs = [];

  qs.push({
    id: "which",
    ask: "Which module is this?",
    hint: "Look at the notch first — where it sits along the edge is the generation, and it is a " +
      "mechanism rather than a marking. Then look at the length, then count the chips.",
    answer: it.name,
    choices: [it.name].concat(pick(D, "name", 3, rnd).map(function (c) { return c.name; })),
    why: function (chosen) {
      if (chosen === it.name) return it.look + " " + it.lookalikeWhy;
      var o = MODULES.filter(function (c) { return c.name === chosen; })[0];
      return o ? "That is a real module and it is not this one. " + o.look
        : "That is not what is on the bench.";
    }
  });

  /* The counting question, which is the heart of this objective.

     Note that the rule changes at the newest generation, and that is not a
     detail — it is the thing candidates get wrong. Up to and including the
     generation before it, a rank is sixty-four data bits, so eight chips
     carry data and a ninth carries check bits. The newest module is TWO
     independent halves of thirty-two bits, each with eight check bits of its
     own, so an error-correcting rank is ten chips rather than nine. Teaching
     "a multiple of nine means ECC" as a universal rule would be teaching
     something that is false on everything currently being sold. */
  var COUNT_TELLS = [
    "Eight per rank — every chip on it is carrying data and there is nothing spare for checking it",
    "Nine per rank — eight chips carrying data and one more carrying check bits",
    "Eight per rank — the module is two independent halves of thirty-two bits each, and nothing " +
      "on it is spare for checking",
    "Ten per rank — the module is two independent halves of thirty-two bits, each with eight more " +
      "bits for checking, so five chips serve each half"
  ];
  var countAnswer = it.gen >= 5 ? (it.ecc ? COUNT_TELLS[3] : COUNT_TELLS[2])
    : (it.ecc ? COUNT_TELLS[1] : COUNT_TELLS[0]);
  qs.push({
    id: "count",
    ask: "Count the chips on it. How many is that per rank, and what does it tell you?",
    hint: "Count both faces, then divide by the rank count on the label. Up to the generation " +
      "before this one a rank was sixty-four data bits wide; on the newest, a module is two " +
      "independent halves of thirty-two. Work out how many chips that needs before you decide " +
      "whether there is a spare one.",
    answer: countAnswer,
    choices: [countAnswer].concat(COUNT_TELLS.filter(function (t) { return t !== countAnswer; })),
    why: function (chosen) {
      if (chosen === countAnswer) {
        return "Correct. " + it.chips + " chips over " + it.ranks + " rank" +
          (it.ranks > 1 ? "s" : "") + " is " + (it.chips / it.ranks) + " per rank. " +
          (it.ecc
            ? "That is one more than the data needs, and the spare is holding check bits — so it " +
              "corrects errors, and a board that demands that will take it while a board that " +
              "does not may refuse it outright."
            : "That is exactly what the data needs and no more, so nothing on it is checking " +
              "anything — and a board that requires correction will not post with it in.");
      }
      return "Not what this count is telling you. Divide the chips by the rank count on the " +
        "label, and then ask how wide a rank is on THIS generation — the answer changed at the " +
        "newest one, and a rule learned on the older modules gives the wrong answer here.";
    }
  });

  qs.push({
    id: "wont",
    ask: "What will it NOT work in?",
    hint: "Almost every memory call-out is a compatibility question rather than a fault. Ask what " +
      "would physically refuse it, and then what would accept it mechanically and still not post.",
    answer: it.wont,
    choices: [it.wont].concat(pick(D, "wont", 3, rnd).map(function (c) { return c.wont; })),
    why: function (chosen) {
      if (chosen === it.wont) {
        return "Right. " + it.wont + ". A machine that does not post after a memory change is " +
          "almost always this rather than a faulty module.";
      }
      return "That is what stops a different module. Work from what is physically on this one: " +
        "where the notch is, how long it is, and whether there is anything on it that a plain " +
        "board would not expect.";
    }
  });

  qs.push({
    id: "use",
    ask: "What would you fit one in?",
    hint: "Not the technology — the machine. Somebody chose this over the module beside it on the " +
      "shelf because of what their board demanded.",
    answer: it.use,
    choices: [it.use].concat(pick(D, "use", 3, rnd).map(function (c) { return c.use; })),
    why: function (chosen) {
      if (chosen === it.use) return "Right. " + it.use + ".";
      return "That is what a different module goes in. Work back from what is on the module and " +
        "what refuses it — the machine it belongs in is the one that demands exactly those things.";
    }
  });

  qs.push({
    id: "confused",
    ask: "Which module does it get confused with?",
    hint: "Not the one furthest away in the list — the one somebody orders, fits or stocks beside " +
      "it and then cannot get a machine to start with.",
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
        "ends with a machine on the bench that will not post.";
    }
  });

  return qs;
}
