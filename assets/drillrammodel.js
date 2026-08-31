/* =====================================================================
   Field Service Center — the bench for objective 3.3

   The module on the bench, with the socket it is meant to go into beside
   it — because on this objective the socket is half the evidence.

   THREE THINGS ARE DRAWN AND THEY ARE THE THREE THINGS THE QUESTIONS ASK:

   1. THE CHIPS, drawn as the real count. Eight, nine, eighteen, twenty,
      thirty-six. The whole error-correction question is a counting exercise
      and it is only fair to ask it if the count on screen is the count in
      the content — which a test asserts, exactly as it does for the ports
      on 2.5 and the layers on 3.1.
   2. THE NOTCH, drawn in its real position along the edge connector. It is
      a mechanism rather than a marking: the socket has a matching key, and
      the two are drawn together so a student can see whether they line up.
      One pair in this pool has the notch in the identical place and differs
      only by a printed voltage, and that pair is drawn identically on
      purpose — a model that invented a difference there would be lying.
   3. ANYTHING ON IT THAT IS NOT A MEMORY CHIP. A register in the middle, a
      larger buffer, a power management chip, a thermal sensor. Its own
      part, its own colour, and for most of the pool that part is simply
      absent — which is itself the reading.

   NOTHING IS LABELLED. No capacity, no generation, no part number.
   ===================================================================== */

const P2 = Math.PI / 2;

const BOARD = { w: 15, d: 8.0 };

/* The module lies flat on the bench with its contact edge toward the
   viewer, and the socket sits behind it, keyed. */
const MOD_Y = 0.5;
/* Far enough back, and the camera high enough, that the socket is not simply
   hidden behind the module standing in front of it. On the first cut it was
   directly behind at eye level and the module occluded it completely — which
   on the one objective where the socket is half the evidence made half the
   evidence invisible. */
const SOCK_Z = -3.4;

function box(size, pos, shade, r) {
  return { shape: "box", size: size, pos: pos, shade: shade, r: r };
}

/* How long each form is, in bench units, and how tall the board is. */
function dims(it) {
  if (it.form === "camm") return { len: 7.0, hgt: 4.2, flat: true };
  /* SOLDERED IS FLAT AND FIXED. It shares the flat geometry with the card
     that screws down, because that is exactly the pair a student has to
     separate — but nothing holds it on, because nothing needs to. `fixed`
     is what takes the screws and the threaded posts away, and their absence
     IS the answer to "can we add memory to this machine". */
  if (it.form === "soldered") return { len: 6.2, hgt: 3.4, flat: true, fixed: true };
  if (it.form === "sodimm") return { len: 6.4, hgt: 1.7, flat: false };
  return { len: 11.4, hgt: 1.5, flat: false };
}

/* ---------------------------------------------------------------------
   The module board itself, and the contact edge with its notch.
   --------------------------------------------------------------------- */
function moduleBoard(it) {
  var d = dims(it), out = [];
  if (d.flat) {
    /* Not a stick. A flat board that lies against the machine's own board,
       with screw holes through it — drawn lying down because that is how it
       is fitted, and because the difference from a stick is the whole of
       the first question. */
    out.push({ shape: "rbox", size: [d.len, 0.22, d.hgt], pos: [0, 0.24, 0], r: 0.06, shade: 1.0 });
    if (!d.fixed) {
      [-1, 1].forEach(function (sx) {
        [-1, 1].forEach(function (sz) {
          out.push({ shape: "cyl", size: [0.5, 0.32], pos: [sx * (d.len / 2 - 0.5), 0.24,
            sz * (d.hgt / 2 - 0.4)], seg: 14, shade: 0.6 });
        });
      });
    }
  } else {
    /* A stick, stood on its contact edge so both the chips and the notch
       are in the same view. */
    out.push({ shape: "rbox", size: [d.len, d.hgt, 0.14], pos: [0, MOD_Y + d.hgt / 2, 0],
      r: 0.03, shade: 1.0 });
    /* the two locating notches in the top corners that the latches catch */
    [-1, 1].forEach(function (sx) {
      out.push(box([0.3, 0.3, 0.2], [sx * (d.len / 2 - 0.2), MOD_Y + d.hgt - 0.1, 0], 0.7, 0.02));
    });
  }
  return out;
}

/* The gold contact edge, and the notch cut out of it. The notch is drawn as
   a gap in the run of contacts rather than as a marked feature, which is
   what it physically is. */
function contactEdge(it) {
  var d = dims(it), out = [], i;
  if (d.flat) {
    /* A field of contacts on the underside rather than a single edge. */
    for (i = 0; i < 24; i++) {
      out.push(box([0.16, 0.08, 2.6], [-d.len / 2 + 0.5 + i * 0.26, 0.14, 0], 1.0, 0.01));
    }
    return out;
  }
  var n = 34;
  var pitch = (d.len - 0.7) / n;
  var left = -d.len / 2 + 0.35;
  /* Which contact the notch falls at, from the module's own notch position. */
  var gapAt = Math.round(it.notch * n);
  for (i = 0; i < n; i++) {
    if (i === gapAt || i === gapAt + 1) continue;
    out.push(box([pitch * 0.6, 0.34, 0.18], [left + i * pitch, MOD_Y + 0.17, 0], 1.0, 0.01));
  }
  /* The notch itself: a block of the board's own colour standing in the gap,
     drawn proud so it reads as a key rather than as a missing contact. */
  out.push({ shape: "box", size: [pitch * 1.5, 0.5, 0.3],
    pos: [left + (gapAt + 0.5) * pitch, MOD_Y + 0.25, 0], r: 0.02, shade: 0.3, notchKey: 1 });
  return out;
}

/* ---------------------------------------------------------------------
   The chips. Drawn as the real count, on one face or two.
   --------------------------------------------------------------------- */
function chips(it) {
  var d = dims(it), out = [], i;
  var front = Math.min(it.chips, it.perSide);
  var back = it.chips - front;

  function row(count, z, y, span, cx) {
    if (!count) return;
    var step = span / count;
    for (var k = 0; k < count; k++) {
      out.push({ shape: "rbox", size: [Math.min(step * 0.72, 0.78), 0.5, 0.12],
        pos: [cx - span / 2 + step * (k + 0.5), y, z], r: 0.02, shade: 1.0, memChip: 1 });
    }
  }

  if (d.flat) {
    /* Two rows on the top face. */
    var per = Math.ceil(it.chips / 2);
    for (i = 0; i < it.chips; i++) {
      var r0 = i < per ? 0 : 1;
      var k0 = i < per ? i : i - per;
      var cnt = r0 ? it.chips - per : per;
      out.push({ shape: "rbox", size: [Math.min((d.len - 1.6) / cnt * 0.72, 0.78), 0.16, 0.9],
        pos: [-(d.len - 1.6) / 2 + (d.len - 1.6) / cnt * (k0 + 0.5), 0.4, r0 ? 1.0 : -1.0],
        r: 0.02, shade: 1.0, memChip: 1 });
    }
    return out;
  }

  /* On a stick the chips sit above the contacts. Where a module has a chip
     in the middle that is not memory, the memory chips are split around it,
     which is what a real one looks like and is why the middle is worth
     looking at. */
  var span = d.len - 1.0;
  var y = MOD_Y + d.hgt / 2 + 0.1;
  if (it.buffer === "none") {
    row(front, 0.14, y, span, 0);
    row(back, -0.14, y, span, 0);
  } else {
    var half = Math.floor(front / 2);
    row(half, 0.14, y, span / 2 - 0.5, -span / 4 - 0.25);
    row(front - half, 0.14, y, span / 2 - 0.5, span / 4 + 0.25);
    if (back) {
      var bh = Math.floor(back / 2);
      row(bh, -0.14, y, span / 2 - 0.5, -span / 4 - 0.25);
      row(back - bh, -0.14, y, span / 2 - 0.5, span / 4 + 0.25);
    }
  }
  return out;
}

/* Everything on the module that is not memory. Absent for most of the pool,
   and the part is left out entirely rather than drawn as a stub. */
function notMemory(it) {
  var d = dims(it), out = [];
  var y = MOD_Y + d.hgt / 2 + 0.1;
  if (it.buffer === "register") {
    out.push({ shape: "rbox", size: [0.9, 0.62, 0.16], pos: [0, y, 0.15], r: 0.02, shade: 1.0,
      registerChip: 1 });
  } else if (it.buffer === "buffer") {
    /* Bigger than a register, because it handles the data as well. */
    out.push({ shape: "rbox", size: [1.5, 0.8, 0.2], pos: [0, y, 0.15], r: 0.02, shade: 1.0,
      bufferChip: 1 });
  }
  if (/power management/.test(it.extraChip || "")) {
    var px = it.buffer === "none" ? 0 : -1.6;
    var py = d.flat ? 0.4 : y - 0.02;
    var pz = d.flat ? 0 : 0.15;
    out.push({ shape: "rbox", size: [0.5, d.flat ? 0.18 : 0.4, d.flat ? 0.5 : 0.14],
      pos: [px, py, pz], r: 0.02, shade: 1.45, pmicChip: 1 });
  }
  /* The clock driver, on the modules that regenerate the clock themselves.
     Drawn near the contact edge because that is where it sits and because
     "one extra small chip near the contact edge" is the whole of how this
     module is told apart from an ordinary one of the same generation. A
     reading that says count it and a model that does not draw it is the
     defect this build keeps finding, so it is drawn. */
  if (/clock driver/.test(it.extraChip || "")) {
    out.push({ shape: "rbox", size: [0.42, d.flat ? 0.16 : 0.34, d.flat ? 0.42 : 0.13],
      pos: [d.flat ? 1.6 : 1.9, d.flat ? 0.4 : MOD_Y + 0.55, d.flat ? 0 : 0.15],
      r: 0.02, shade: 0.55, clockChip: 1 });
  }
  return out;
}

/* ---------------------------------------------------------------------
   The socket, with its own key, standing behind the module.

   Drawn to the same generation as the module, so the key lines up — the
   comparison the student is asked to make is between a module and a socket
   that ACCEPTS it, and whether the two agree is something to look at rather
   than to be told.
   --------------------------------------------------------------------- */
function socket(it) {
  var d = dims(it), out = [], i;
  if (d.flat) {
    /* Not a socket at all: a field of pads on the board, with four threaded
       posts round it. */
    out.push(box([d.len + 0.6, 0.18, d.hgt + 0.6], [0, 0.09, SOCK_Z], 1.0, 0.03));
    for (i = 0; i < 24; i++) {
      out.push(box([0.16, 0.08, 2.6], [-d.len / 2 + 0.5 + i * 0.26, 0.2, SOCK_Z], 0.55, 0.01));
    }
    if (!d.fixed) {
      [-1, 1].forEach(function (sx) {
        [-1, 1].forEach(function (sz) {
          out.push({ shape: "cyl", size: [0.34, 0.5], pos: [sx * (d.len / 2 - 0.5), 0.3,
            SOCK_Z + sz * (d.hgt / 2 - 0.4)], seg: 10, shade: 0.7 });
        });
      });
    }
    return out;
  }
  /* A slot: a long body with a groove, a key standing in the groove, and a
     latch at each end. */
  out.push(box([d.len + 0.8, 0.55, 0.7], [0, 0.28, SOCK_Z], 1.0, 0.03));
  var n = 34, pitch = (d.len - 0.7) / n, left = -d.len / 2 + 0.35;
  var gapAt = Math.round(it.notch * n);
  for (i = 0; i < n; i++) {
    if (i === gapAt || i === gapAt + 1) continue;
    out.push(box([pitch * 0.5, 0.16, 0.1], [left + i * pitch, 0.5, SOCK_Z], 0.6, 0.01));
  }
  /* the key in the slot, in the same place as the module's notch */
  out.push({ shape: "box", size: [pitch * 1.4, 0.42, 0.22],
    pos: [left + (gapAt + 0.5) * pitch, 0.5, SOCK_Z], r: 0.02, shade: 0.45, socketKey: 1 });
  /* the latches, upright at each end — two on a full-length socket, and
     side clips on the short one */
  [-1, 1].forEach(function (sx) {
    if (it.form === "sodimm") {
      out.push(box([0.45, 0.3, 1.5], [sx * (d.len / 2 + 0.5), 0.5, SOCK_Z + 0.4], 0.75, 0.04));
    } else {
      out.push(box([0.5, 1.3, 0.6], [sx * (d.len / 2 + 0.5), 0.85, SOCK_Z], 0.75, 0.04));
    }
  });
  return out;
}

/* How many memory chips were actually drawn, so the count on screen and the
   count in the content can be asserted equal. */
function drawnChips(list) {
  return list.filter(function (p) { return p.memChip; }).length;
}

const FORM_COLOUR = {
  dimm: "#1f6b4a",
  sodimm: "#1f6b4a",
  camm: "#2a5f7a",
  /* A different green again: it is the MACHINE'S board, not a module, and
     the colour says which thing you are looking at rather than whether it
     is good or bad. */
  soldered: "#3f6b2a"
};

export function ramModel(D) {
  var it = D.item;
  var made = { board: moduleBoard(it), edge: contactEdge(it), chip: chips(it), other: notMemory(it) };
  var drawn = drawnChips(made.chip);

  var parts = [
    { key: "module", label: "The module board", build: made.board, finish: "matte", scale: 1,
      pos: [0, 0, 0], color: FORM_COLOUR[it.form],
      spec: it.form === "soldered" ? "Not a module at all — the machine's own board"
        : it.form === "camm" ? "A flat board, not a stick"
        : it.form === "sodimm" ? "A short stick" : "A full-length stick",
      note: "Length first. A full-length stick, a short one, or something that is not a stick at " +
        "all and lies flat against the board with screws through it — those three go in three " +
        "completely different fittings, and no amount of pressing will change that." },
    { key: "chips", label: "The memory chips", build: made.chip, finish: "matte", scale: 1,
      pos: [0, 0, 0], color: "#3f4750",
      spec: drawn + " chips, " + (it.chips === it.perSide ? "all on one face"
        : it.perSide + " on each face"),
      note: "Count them, on both faces, and divide by the rank count on the label beside the " +
        "bench. Then ask how many chips the data alone would need on this generation — anything " +
        "above that is a spare chip doing something other than holding your data. It is a " +
        "two-second count and it settles the characteristic this objective asks about most." },
    { key: "edge", label: "The contact edge and its notch", build: made.edge, finish: "matte",
      scale: 1, pos: [0, 0, 0], color: "#c8a24a",
      spec: it.form === "soldered" ? "Solder joints under each chip — nothing that separates"
        : it.form === "camm" ? "A field of contacts on the underside"
        : "One row of contacts with a gap in it",
      note: "The gap is not a marking, it is a key — and the socket behind has a matching one " +
        "standing in it. Look at whether the two line up. Where along the edge that gap falls " +
        "moves with each generation, and it is what stops somebody putting a module in a socket " +
        "that would destroy it." },
    { key: "socket", label: "The socket it is meant for", build: socket(it), finish: "matte",
      scale: 1, pos: [0, 0, 0], color: "#5b656d",
      spec: it.form === "soldered" ? "None. There is no socket, and no screw either"
        : it.form === "camm" ? "A field of pads with threaded posts round it"
        : it.form === "sodimm" ? "A short slot with side clips" : "A full-length slot with end latches",
      note: "Drawn to match this module, so the key and the notch line up. Two things are worth " +
        "reading off it: whether it holds the module upright or presses it flat, and where its " +
        "key sits — because a socket from a different generation has that key somewhere else and " +
        "nothing will persuade it otherwise." }
  ];

  if (made.other.length) {
    parts.push({ key: "extra", label: "What is on it that is not memory", build: made.other,
      finish: "matte", scale: 1, pos: [0, 0, 0], color: "#a8721f",
      spec: made.other.length === 1 ? "One chip that is not a memory chip"
        : made.other.length + " chips that are not memory chips",
      note: "Look at the middle of the row. A chip there that is not memory changes what kind of " +
        "board will accept the module at all — and a board that is not expecting one gives you a " +
        "machine that does not post rather than a machine that runs badly. A small one somewhere " +
        "else on the module is a different thing again and belongs to the newest generation." });
  }

  return {
    kind: "drill",
    title: "One module, and the socket it goes in",
    caption: "The module stood on its contact edge with the socket behind it, drawn to the same " +
      "generation so the key and the notch line up. Take it in order: how long is it, where along " +
      "the edge is the notch, how many chips are there, and is there anything on it that is not a " +
      "memory chip. One pair in this pool is physically identical and differs only by a voltage " +
      "printed on the label — the panel has that.",
    board: { size: [BOARD.w, 0.4, BOARD.d], pos: [0, -0.2, 0], color: "#3b434a",
      build: [{ shape: "rbox", size: [BOARD.w, 0.4, BOARD.d], pos: [0, 0, 0], r: 0.12, shade: 1.0 }],
      scale: 1 },
    parts: parts,
    _chips: drawn,
    _notch: it.notch,
    _form: it.form,
    camera: { dist: 15.0, yaw: 0.2, pitch: 0.72, target: [0, 0.5, -1.5], min: 6, max: 34 }
  };
}
