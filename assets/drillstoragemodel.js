/* =====================================================================
   Field Service Center — the bench for objective 3.4

   The drive on the bench, cut open, with the thing it plugs into beside it.

   THE SAME STRUCTURE AS 3.3 AND FOR THE SAME REASON: on a storage objective
   the CONNECTOR is half the evidence, and a connector is only evidence if
   you can see what it mates with. So the host side is drawn too, keyed to
   match, and whether the two line up is something to look at rather than
   something to be told.

   THREE THINGS ARE DRAWN AND THEY ARE THE THREE THINGS THE QUESTIONS ASK:

   1. WHAT IS INSIDE THAT CAN MOVE. The lid comes off. Platters and an arm,
      a disc and a laser on rails, a spool of tape, or a flat field of chips
      with nothing that moves anywhere in it. This is drawn rather than
      described because "what moves" decides how it fails, how it sounds and
      what it does on small random reads, and one look settles it.
   2. THE CONNECTOR AND ITS KEYING, drawn with the notches in their real
      places. The two M.2 cards in this pool are the same card at the same
      length and differ by one notch — so they are drawn as the same card at
      the same length, differing by one notch. Inventing a bigger difference
      would make the exercise easier and the field harder.
   3. THE BRIDGE. On the pair where one drive drops into the other's
      backplane and the reverse does not, the reason is a bridge of plastic
      between the data and power segments. It is drawn, on the drive and on
      the host, because that asymmetry is worth more than a sentence.

   NOTHING IS LABELLED. No capacity, no model, no bus written anywhere.
   ===================================================================== */

const P2 = Math.PI / 2;

const BOARD = { w: 15, d: 8.6 };
const HOST_Z = -3.2;

function box(size, pos, shade, r) {
  return { shape: "box", size: size, pos: pos, shade: shade, r: r };
}

/* Outline of each form, in bench units. */
function dims(it) {
  switch (it.form) {
    case "brick35": return { w: 7.4, h: 1.3, d: 5.2 };
    case "brick25": return { w: 5.2, h: 0.9, d: 4.0 };
    case "card":    return { w: it.key === "msata" ? 3.4 : 5.6, h: 0.22, d: it.key === "msata" ? 1.6 : 1.2 };
    case "aic":     return { w: 8.0, h: 0.24, d: 2.6 };
    case "stick":   return { w: 2.4, h: 0.6, d: 1.1 };
    case "flat":    return { w: it.key === "tape" ? 4.4 : 1.6, h: it.key === "tape" ? 1.0 : 0.14,
                             d: it.key === "tape" ? 4.0 : 2.0 };
    default:        return { w: 1.4, h: 0.2, d: 1.4 };   // chip
  }
}

/* ---------------------------------------------------------------------
   The body, with the lid off where there is something inside worth seeing.
   --------------------------------------------------------------------- */
function body(it) {
  var d = dims(it), out = [];
  var y = d.h / 2;
  if (it.form === "brick35" || it.form === "brick25") {
    /* A tray with walls and no lid, so the inside is visible. */
    out.push(box([d.w, 0.16, d.d], [0, 0.08, 0], 1.0, 0.03));
    out.push(box([d.w, d.h, 0.2], [0, y, -d.d / 2 + 0.1], 1.0, 0.02));
    out.push(box([d.w, d.h, 0.2], [0, y, d.d / 2 - 0.1], 1.0, 0.02));
    out.push(box([0.2, d.h, d.d], [-d.w / 2 + 0.1, y, 0], 1.0, 0.02));
    out.push(box([0.2, d.h, d.d], [d.w / 2 - 0.1, y, 0], 1.0, 0.02));
    /* mounting holes down each flank */
    [-1, 1].forEach(function (sx) {
      out.push({ shape: "cyl", size: [0.3, 0.24], pos: [sx * (d.w / 2 - 0.02), y, -1.2],
        rot: [0, 0, P2], seg: 10, shade: 0.6, repeat: { count: 3, step: [0, 0, 1.2] } });
    });
  } else if (it.form === "card" || it.form === "aic") {
    out.push({ shape: "rbox", size: [d.w, d.h, d.d], pos: [0, 0.2, 0], r: 0.03, shade: 1.0 });
    if (it.form === "aic") {
      /* the bracket at one end, which is what makes it an expansion card */
      out.push(box([0.16, 2.6, 2.2], [d.w / 2 + 0.1, 1.3, 0], 0.8, 0.02));
      out.push(box([0.5, 0.3, 0.6], [d.w / 2 + 0.1, 2.5, 0], 0.8, 0.02));
    } else {
      /* the screw at the far end, which is all that holds one down */
      out.push({ shape: "cyl", size: [0.5, 0.22], pos: [d.w / 2 - 0.3, 0.28, 0], seg: 12,
        shade: 0.65 });
    }
  } else if (it.form === "stick") {
    out.push({ shape: "rbox", size: [d.w, d.h, d.d], pos: [-0.6, 0.42, 0], r: 0.12, shade: 1.0 });
  } else if (it.form === "flat") {
    if (it.key === "tape") {
      out.push({ shape: "rbox", size: [d.w, d.h, d.d], pos: [0, y + 0.05, 0], r: 0.08, shade: 1.0 });
      /* the shutter along one edge, and the write-protect slider on a corner */
      out.push(box([2.6, 0.16, 0.2], [0, y + 0.05, d.d / 2 - 0.05], 0.6, 0.02));
      out.push(box([0.5, 0.2, 0.5], [-d.w / 2 + 0.5, y + 0.05, d.d / 2 - 0.5], 0.55, 0.04));
    } else {
      /* a card with a bevelled corner, drawn as a chamfer block */
      out.push({ shape: "rbox", size: [d.w, d.h, d.d], pos: [0, 0.12, 0], r: 0.04, shade: 1.0 });
      out.push({ shape: "box", size: [0.5, 0.2, 0.5], pos: [-d.w / 2 + 0.2, 0.12, -d.d / 2 + 0.2],
        rot: [0, 0.78, 0], shade: 0.45, bevel: 1 });
    }
  } else {
    /* eMMC: a chip, and the board it is soldered to. */
    out.push({ shape: "rbox", size: [d.w, d.h, d.d], pos: [0, 0.24, 0], r: 0.02, shade: 1.0 });
  }
  return out;
}

/* ---------------------------------------------------------------------
   What is inside it that can move — or, for most of the pool, what is
   inside it that does not.
   --------------------------------------------------------------------- */
function insides(it) {
  var d = dims(it), out = [], i;
  var spin = /platters/i.test(it.moving);
  var disc = /disc spinning/i.test(it.moving);
  var tape = /spool of tape/i.test(it.moving);

  if (spin) {
    /* Two platters on a spindle, and an arm with a head on the end of it,
       swung out over them. */
    var cx = -d.w * 0.15;
    [0.42, 0.66].forEach(function (yy) {
      out.push({ shape: "cyl", size: [d.d * 0.78, 0.1], pos: [cx, yy, 0], seg: 32, shade: 1.0,
        platter: 1 });
    });
    out.push({ shape: "cyl", size: [0.7, 0.9], pos: [cx, 0.5, 0], seg: 16, shade: 0.6 });
    /* the arm, pivoting from the corner */
    var px = d.w / 2 - 0.9, pz = -d.d / 2 + 0.9;
    out.push({ shape: "cyl", size: [0.8, 1.0], pos: [px, 0.5, pz], seg: 14, shade: 0.62 });
    out.push({ shape: "box", size: [2.4, 0.14, 0.4], pos: [px - 1.2, 0.78, pz + 0.7],
      rot: [0, -0.5, 0], r: 0.05, shade: 1.35, headArm: 1 });
    out.push(box([0.34, 0.12, 0.3], [px - 2.3, 0.78, pz + 1.25], 1.5, 0.02));
    return out;
  }
  if (disc) {
    /* A disc on a spindle, and a laser sled on two rails. */
    out.push({ shape: "cyl", size: [d.d * 0.82, 0.08], pos: [0, 0.5, 0], seg: 36, shade: 1.0,
      platter: 1 });
    out.push({ shape: "cyl", size: [0.5, 0.5], pos: [0, 0.45, 0], seg: 14, shade: 0.6 });
    [-0.6, 0.6].forEach(function (dz) {
      out.push({ shape: "cyl", size: [0.16, d.w * 0.8], pos: [0, 0.3, dz], rot: [0, 0, P2],
        seg: 8, shade: 0.6 });
    });
    out.push(box([0.9, 0.34, 1.4], [-1.6, 0.36, 0], 1.35, 0.03));
    out.push({ shape: "cyl", size: [0.34, 0.2], pos: [-1.6, 0.56, 0], seg: 12, shade: 1.5,
      headArm: 1 });
    return out;
  }
  if (tape) {
    /* One spool inside, with the tape wound on it — and only one, because
       the other one lives in the drive. */
    /* Lying flat inside the cartridge, the way it actually sits. Drawn on
        edge it was a disc taller than the cartridge holding it, with half of
        it under the bench. */
    out.push({ shape: "cyl", size: [3.4, 0.42], pos: [0.3, 0.78, 0], seg: 32,
      shade: 1.0, platter: 1 });
    out.push({ shape: "cyl", size: [1.2, 0.5], pos: [0.3, 0.8, 0], seg: 20, shade: 0.6 });
    out.push(box([1.6, 0.1, 0.16], [-1.2, 0.6, 1.85], 1.35, 0.02));
    return out;
  }
  /* Nothing that moves: a controller and a field of packages, and on one
     item a fan, which is the only thing on it that turns. */
  var n = it.form === "brick25" ? 8 : it.form === "aic" ? 8 : 4;
  var span = d.w - 1.4;
  var yy = (it.form === "card" || it.form === "aic") ? 0.36
    : it.form === "chip" ? 0.4 : (d.h + 0.14);
  for (i = 0; i < n; i++) {
    out.push({ shape: "rbox", size: [Math.min(span / n * 0.7, 0.9), 0.16, Math.min(d.d * 0.5, 1.0)],
      pos: [-span / 2 + span / n * (i + 0.5), yy, it.form === "brick25" ? -0.7 : 0], r: 0.02,
      shade: 1.0, nandChip: 1 });
  }
  out.push({ shape: "rbox", size: [0.8, 0.18, 0.8], pos: [span / 2 + 0.3, yy, 0], r: 0.02,
    shade: 0.6, controller: 1 });
  if (it.key === "nvmecard") {
    out.push({ shape: "cyl", size: [1.8, 0.3], pos: [-1.8, 0.55, 0], seg: 20, shade: 0.72,
      fan: 1 });
    for (i = 0; i < 7; i++) {
      out.push({ shape: "box", size: [0.7, 0.24, 0.14], pos: [-1.8, 0.55, 0],
        rot: [0, i * 0.9, 0], shade: 0.5 });
    }
  }
  return out;
}

/* ---------------------------------------------------------------------
   The connector, with its keying — and the host it mates with, drawn to
   match.
   --------------------------------------------------------------------- */
function edge(it, host) {
  var d = dims(it), out = [];
  var z = host ? HOST_Z : 0;
  var flip = host ? -1 : 1;
  var s = host ? 0.6 : 1.0;

  if (it.bus === "SATA" && (it.form === "brick35" || it.form === "brick25")) {
    /* Two L-shaped pieces with a gap between them. */
    var ex = -d.w / 2 - (host ? -0.35 : 0.18);
    out.push(box([0.34, 0.5, 1.3], [ex, 0.36, z - 0.9], s, 0.02));
    out.push(box([0.34, 0.5, 1.9], [ex, 0.36, z + 0.9], s, 0.02));
    if (!host) out.push({ shape: "box", size: [0.12, 0.5, 0.5], pos: [ex, 0.36, z], shade: 0.35,
      sataGap: 1 });
    return out;
  }
  if (it.key === "tape") {
    /* No electrical connector anywhere on it — the whole point of the item.
       What there is, is a shutter the drive opens. This branch has to come
       before the bus branches: the cartridge's bus is the DRIVE's bus, and
       an earlier version reached the serial-connector branch on that basis
       and drew a connector on a thing that has none. */
    out.push(box([2.6, 0.2, 0.24], [0, 0.6, z + (host ? 0 : d.d / 2 - 0.05)], s, 0.02));
    return out;
  }
  if (it.bus === "SAS") {
    /* The same outline with the bridge between the two segments filled in.
       That single block is why one of these fits the other's backplane and
       the reverse does not. */
    var sx = -d.w / 2 - (host ? -0.35 : 0.18);
    out.push(box([0.34, 0.5, 3.7], [sx, 0.36, z], s, 0.02));
    out.push({ shape: "box", size: [0.4, 0.56, 0.6], pos: [sx, 0.36, z], r: 0.02, shade: s * 0.8,
      sasBridge: 1 });
    return out;
  }
  if (it.form === "card" || it.form === "aic") {
    /* A contact run with one notch or two, in their real places. */
    var n = it.form === "aic" ? 26 : 18;
    var span = d.w * 0.62;
    var left = -span / 2 - d.w * 0.18;
    var pitch = span / n;
    var gaps = it.keying.indexOf("Two notches") === 0 ? [Math.round(n * 0.24), Math.round(n * 0.74)]
      : it.form === "aic" ? [Math.round(n * 0.18)]
      : [Math.round(n * 0.74)];
    for (var i = 0; i < n; i++) {
      if (gaps.indexOf(i) !== -1) continue;
      out.push(box([pitch * 0.55, host ? 0.16 : 0.1, 0.5],
        [left + i * pitch, host ? 0.3 : 0.26, z + (host ? 0 : -d.d / 2 - 0.02)], s, 0.01));
    }
    gaps.forEach(function (g) {
      out.push({ shape: "box", size: [pitch * 1.1, host ? 0.3 : 0.24, 0.6],
        pos: [left + g * pitch, host ? 0.36 : 0.3, z + (host ? 0 : -d.d / 2 - 0.02)],
        r: 0.02, shade: host ? 0.35 : 0.3, keyNotch: 1 });
    });
    return out;
  }
  if (it.form === "stick") {
    /* A plug moulded into the body, and a port for it on the host. */
    out.push(box([1.3, 0.34, 0.9], [host ? -0.2 : 0.85, 0.42, z], s, 0.02));
    out.push(box([1.0, 0.14, 0.7], [host ? -0.2 : 0.85, 0.42, z], s * 0.5, 0.01));
    return out;
  }
  if (it.form === "flat" && it.key === "sdcard") {
    for (var k = 0; k < 8; k++) {
      out.push(box([0.16, 0.08, 0.18], [-d.w / 2 + 0.3, host ? 0.28 : 0.2, z - 0.6 + k * 0.18],
        s, 0.01));
    }
    return out;
  }
  /* eMMC: a field of solder balls under the chip, and pads on the board. */
  for (var a = 0; a < 5; a++) {
    for (var b = 0; b < 5; b++) {
      out.push({ shape: "cyl", size: [0.14, 0.1], pos: [-0.5 + a * 0.25, host ? 0.2 : 0.13,
        z - 0.5 + b * 0.25], seg: 6, shade: s });
    }
  }
  return out;
}

/* What it goes into: a board, a backplane, a socket or a port. */
function hostSide(it) {
  var d = dims(it), out = [];
  if (it.form === "brick35" || it.form === "brick25") {
    /* A backplane standing up behind the drive, with the mating connector. */
    out.push(box([d.w + 1.6, 2.2, 0.4], [0, 1.1, HOST_Z - 0.4], 1.0, 0.03));
  } else if (it.form === "card") {
    /* A socket on a board, with the standoff the screw goes into. */
    out.push(box([d.w + 1.8, 0.16, 3.0], [0, 0.08, HOST_Z], 1.0, 0.03));
    out.push(box([d.w * 0.7, 0.5, 0.9], [0, 0.3, HOST_Z], 0.8, 0.03));
    out.push({ shape: "cyl", size: [0.55, 0.4], pos: [d.w / 2 - 0.3, 0.3, HOST_Z], seg: 12,
      shade: 0.7 });
  } else if (it.form === "aic") {
    out.push(box([d.w + 1.8, 0.16, 3.0], [0, 0.08, HOST_Z], 1.0, 0.03));
    out.push(box([d.w * 0.66, 0.5, 0.8], [-0.8, 0.3, HOST_Z], 0.8, 0.03));
  } else if (it.form === "stick") {
    out.push(box([3.0, 1.2, 2.0], [-0.6, 0.6, HOST_Z], 1.0, 0.04));
    out.push(box([1.4, 0.5, 0.3], [-0.6, 0.6, HOST_Z + 1.0], 0.6, 0.02));
  } else if (it.key === "tape") {
    /* A drive with a slot in the front — and the second spool inside it,
       which is why a cartridge has only one. */
    out.push(box([6.0, 2.4, 3.0], [0, 1.2, HOST_Z - 0.4], 1.0, 0.04));
    out.push(box([4.4, 0.5, 0.3], [0, 1.0, HOST_Z + 1.1], 0.5, 0.02));
  } else if (it.form === "chip") {
    /* The machine's own board, which is what it is soldered to. */
    out.push(box([7.0, 0.18, 4.0], [0, 0.09, HOST_Z + 1.0], 1.0, 0.03));
  } else {
    /* A card slot in a reader. */
    out.push(box([3.0, 1.0, 2.4], [0, 0.5, HOST_Z], 1.0, 0.04));
    out.push(box([1.9, 0.26, 0.3], [0, 0.5, HOST_Z + 1.2], 0.5, 0.02));
  }
  return out.concat(edge(it, true));
}

function countTag(list, tag) { return list.filter(function (p) { return p[tag]; }).length; }

const FORM_COLOUR = {
  brick35: "#9aa3a9",
  brick25: "#9aa3a9",
  card: "#1f6b4a",
  aic: "#1f6b4a",
  stick: "#4a5cab",
  /* Khaki, not slate. Slate is what the host side is drawn in, and the two
     were four hex digits apart — indistinguishable on a legend whose swatches
     are how a student tells one part from another. */
  flat: "#8c7f5a",
  chip: "#3f4750"
};

export function storageModel(D) {
  var it = D.item;
  var made = {
    body: body(it), inside: insides(it), edge: edge(it, false), host: hostSide(it)
  };
  var moves = countTag(made.inside, "platter") + countTag(made.inside, "headArm")
    + countTag(made.inside, "fan");

  return {
    kind: "drill",
    title: "One device, opened, and what it plugs into",
    caption: "The device with its lid off and the thing it mates with behind it. Take it in " +
      "order: what is inside that can move, then the connector and how it is keyed, then the " +
      "numbers on the bench. Two pairs in this pool are the same shape and a different bus, and " +
      "in each case the difference is a notch — so count the notches before you decide anything.",
    board: { size: [BOARD.w, 0.4, BOARD.d], pos: [0, -0.2, 0], color: "#3b434a",
      build: [{ shape: "rbox", size: [BOARD.w, 0.4, BOARD.d], pos: [0, 0, 0], r: 0.12, shade: 1.0 }],
      scale: 1 },
    parts: [
      { key: "body", label: "The body", build: made.body, finish: "matte", scale: 1, pos: [0, 0, 0],
        color: FORM_COLOUR[it.form],
        spec: it.form === "brick35" ? "A full-width bay device, lid off"
          : it.form === "brick25" ? "A laptop-width device, lid off"
          : it.form === "aic" ? "An expansion card with a bracket"
          : it.form === "card" ? "A bare card held by one screw"
          : it.form === "chip" ? "A chip on the machine's own board"
          : it.form === "stick" ? "A body with a plug moulded into it"
          : "A flat item with no screw and no plug",
        note: "Outline first, and then ask how it is held in. Screws through the flanks, one " +
          "screw at the far end, a bracket in a slot, a friction fit, or solder — and one item " +
          "here is held in by solder, which changes the answer to “can it be upgraded” from a " +
          "price to a no." },
      /* NOT amber. The connector part is amber, and an earlier version gave
         the insides #c8a24a against the connector's #c9a24a — two colours one
         hex digit apart, which a string-equality check happily passed and
         which on screen made a card look as though it were covered in gold
         blocks. The legend's whole job is that a colour names a part. */
      { key: "inside", label: "What is inside it", build: made.inside, finish: "matte", scale: 1,
        pos: [0, 0, 0], color: "#7b5ea8",
        spec: moves ? moves + (moves === 1 ? " part in it that moves" : " parts in it that move")
          : "Nothing in it that moves",
        note: "Platters with an arm swung over them, a disc with a laser on rails, a spool of " +
          "tape, or a flat field of packages with nothing to position. That single observation " +
          "decides how it fails, whether you can hear it, whether dropping it matters, and what " +
          "it does on small random reads — which is the figure on the bench beside it." },
      { key: "edge", label: "Its connector, and how it is keyed", build: made.edge, finish: "matte",
        scale: 1, pos: [0, 0, 0], color: "#c9a24a",
        spec: "The contacts, with the notches in their real places",
        note: "Count the notches and look at whether the connector is one piece or two with a gap " +
          "between them. On the two cards in this pool that are the same size, the notch count is " +
          "the only physical difference and it decides which bus the socket has to be wired for. " +
          "On the two bay drives that are nearly the same, a bridge of plastic across the gap is " +
          "why one fits the other's backplane and the reverse does not." },
      { key: "host", label: "What it plugs into", build: made.host, finish: "matte", scale: 1,
        pos: [0, 0, 0], color: "#5b656d",
        spec: "Drawn keyed to match this device",
        note: "Drawn to accept this one, so the key and the notch line up. Look at the mating " +
          "face rather than at the drive: a socket with a key in the wrong place will refuse a " +
          "card that is otherwise identical, and that refusal is the whole of several questions " +
          "on this objective." }
    ],
    _moves: moves,
    _bus: it.bus,
    _notches: countTag(made.edge, "keyNotch"),
    camera: { dist: 14.0, yaw: 0.24, pitch: 0.72, target: [0, 0.4, -1.4], min: 5, max: 32 }
  };
}
