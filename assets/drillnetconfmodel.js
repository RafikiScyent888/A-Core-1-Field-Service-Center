/* =====================================================================
   Field Service Center — the address space for objective 2.4

   The third model in this build that draws an idea rather than an object,
   and the one where the idea is most nearly a picture already.

     AN ADDRESS SPACE IS A LINE.

   It has a first address nobody can use and a last address nobody can use.
   The gateway sits near one end of it by convention. The pool a server hands
   out is a SEGMENT of it, and the fixed pairings are pegs inside that
   segment. The mask decides where the line is cut, and cutting it in the
   wrong place is why some destinations work and others do not.

   And the thing students get wrong most, drawn as the thing it actually is:
   a machine that gave up waiting and named itself is NOT further along the
   line. It is on a second line, off to the side, with no gateway on it at
   all — which is the entire reason it will never reach anything no matter
   how long anybody waits. Every explanation of that in words competes with
   the fact that 169.254.18.7 and 192.168.20.7 look like near neighbours.
   Drawn as two separate strips, they never look like neighbours again.

   The other three kinds in this pool are drawn as what they are: name
   resolution as a card that gets answered, segmentation as two strips that
   share one switch and touch nowhere, and a tunnel as exactly that — a
   bridge from a strip outside the building onto the one inside it.

   Nothing is labelled with the concept being asked about. The strips carry
   addresses because addresses are what a technician reads; they never carry
   the word "scope" or "gateway" or "reservation".
   ===================================================================== */

const P2 = Math.PI / 2;

/* The strip. 256 addresses drawn as one run, so a position along it means
   the same thing every time. */
const CELLS = 256;
const STRIP_LEN = 17;
const CELL = STRIP_LEN / CELLS;
const STRIP_Z = 0;
const STRIP_X = -8.5;

function at(n) { return STRIP_X + n * CELL; }

/* A run of cells, from `a` up to and including `b`. */
function run(a, b, z, y, h, d, shade, tag) {
  var len = (b - a + 1) * CELL;
  var o = {
    shape: "rbox", size: [len - 0.02, h, d], pos: [at(a) + len / 2, y, z],
    r: 0.02, shade: shade
  };
  if (tag) o[tag] = 1;
  return o;
}

/* The ruler under a strip: a mark every sixteen addresses, so a student can
   count position rather than estimate it. */
function ruler(z) {
  var out = [];
  for (var n = 0; n <= CELLS; n += 16) {
    out.push({ shape: "box", size: [0.06, 0.05, n % 64 === 0 ? 1.1 : 0.6],
      pos: [at(n), 0.06, z + 1.5], shade: n % 64 === 0 ? 1.5 : 1.1 });
  }
  return out;
}

export function addressModel(D) {
  var it = D.item;
  var kind = it.kind;

  /* ---- the bed every strip lies on -------------------------------- */
  var bed = [
    { shape: "plate", size: [STRIP_LEN + 1.4, 0.2, 4.0], pos: [STRIP_X + STRIP_LEN / 2, 0.1, STRIP_Z], shade: 1.0 }
  ].concat(ruler(STRIP_Z));

  /* ---- the usable range, and the two addresses that are not ------- */
  /* First and last are drawn dark and low: they exist, they are part of the
     line, and nobody may have them. That is a fact about every address
     space and it is easier seen than said. */
  /* One cell out of 256 on a 17-unit strip is a tenth of a unit wide, which
     is invisible. The two unusable addresses are therefore drawn as POSTS at
     their own positions rather than as flat cells \u2014 same place on the line,
     tall enough to see, and standing up because they are the two ends of the
     space rather than part of the run between them. */
  var space = [
    run(1, 254, STRIP_Z, 0.3, 0.34, 3.0, 1.0, "usable"),
    { shape: "rbox", size: [0.34, 1.15, 3.0], pos: [at(0), 0.72, STRIP_Z], r: 0.03, shade: 0.42, edge: 1 },
    { shape: "rbox", size: [0.34, 1.15, 3.0], pos: [at(255), 0.72, STRIP_Z], r: 0.03, shade: 0.42, edge: 1 }
  ];

  /* ---- what has been carved out of it ------------------------------ */
  var carved = [];
  var second = [];        // the second strip, where there is one
  var links = [];

  if (kind === "addressing" || kind === "dhcp") {
    /* The gateway, at .1, standing taller than everything else because it
       is the one address on the line that is a way OFF the line. */
    carved.push(run(1, 1, STRIP_Z, 0.95, 1.75, 3.0, 1.0, "gate"));
    /* The pool: a segment, .100 to .199. */
    carved.push(run(100, 199, STRIP_Z, 0.52, 0.44, 2.6, 1.0, "pool"));
    /* Pegs inside it — the machines pinned to one address each. */
    [104, 117, 138, 152, 181].forEach(function (n) {
      carved.push({ shape: "cyl", size: [0.16, 0.62], pos: [at(n), 0.85, STRIP_Z], seg: 8, shade: 0.8, peg: 1 });
    });
    /* The machine the readout is about. */
    var me = it.key === "apipa" ? null : 64;
    if (me !== null) {
      carved.push({ shape: "cone", size: [0.34, 0.6, 0.02], pos: [at(me), 0.95, STRIP_Z],
        rot: [Math.PI, 0, 0], seg: 10, shade: 1.0, here: 1 });
    }
  }

  if (it.key === "apipa") {
    /* THE point of the whole model. A second strip, set apart, with nothing
       on it that leads anywhere — and the machine standing on that one. */
    var z2 = STRIP_Z + 4.6;
    second = [
      { shape: "plate", size: [STRIP_LEN + 1.4, 0.2, 4.0], pos: [STRIP_X + STRIP_LEN / 2, 0.1, z2], shade: 1.0 },
      run(0, 255, z2, 0.3, 0.34, 3.0, 1.0, "usable")
    ].concat(ruler(z2));
    carved.push({ shape: "cone", size: [0.34, 0.6, 0.02], pos: [at(78), 0.95, z2],
      rot: [Math.PI, 0, 0], seg: 10, shade: 1.0, here: 1 });
    /* Deliberately NO gateway drawn on the second strip, and deliberately no
       link between the two. The absence is the answer. */
  }

  if (kind === "segmentation") {
    /* Two strips that share one switch and touch nowhere. */
    var zb = STRIP_Z + 4.6;
    second = [
      { shape: "plate", size: [STRIP_LEN + 1.4, 0.2, 4.0], pos: [STRIP_X + STRIP_LEN / 2, 0.1, zb], shade: 1.0 },
      run(1, 254, zb, 0.3, 0.34, 3.0, 1.0, "usable"),
      { shape: "rbox", size: [0.34, 1.15, 3.0], pos: [at(0), 0.72, zb], r: 0.03, shade: 0.42, edge: 1 },
      { shape: "rbox", size: [0.34, 1.15, 3.0], pos: [at(255), 0.72, zb], r: 0.03, shade: 0.42, edge: 1 },
      run(1, 1, zb, 0.95, 1.75, 3.0, 1.0, "gate")
    ].concat(ruler(zb));
    carved.push(run(1, 1, STRIP_Z, 0.95, 1.75, 3.0, 1.0, "gate"));
    carved.push({ shape: "cone", size: [0.34, 0.6, 0.02], pos: [at(64), 0.95, STRIP_Z],
      rot: [Math.PI, 0, 0], seg: 10, shade: 1.0, here: 1 });
    /* One switch, under both, with a port going to each. Same box, two
       networks: that is the whole of what the number on a port does. */
    links.push({ shape: "rbox", size: [4.4, 0.7, 1.2], pos: [STRIP_X + 3.2, 0.55, STRIP_Z + 2.3], r: 0.04, shade: 1.0 });
    links.push({ shape: "box", size: [0.24, 0.24, 0.1], pos: [STRIP_X + 1.6, 0.62, STRIP_Z + 1.72], r: 0.01, shade: 0.45,
      repeat: { count: 8, step: [0.42, 0, 0] } });
    links.push({ shape: "box", size: [0.18, 0.18, 1.1], pos: [STRIP_X + 2.0, 0.9, STRIP_Z + 1.3], shade: 0.7 });
    links.push({ shape: "box", size: [0.18, 0.18, 2.4], pos: [STRIP_X + 3.6, 0.9, STRIP_Z + 3.5], shade: 0.7 });
  }

  if (kind === "tunnel") {
    /* A strip outside the building, and a bridge from it onto the one
       inside. Drawn as a span rather than a cable, because what crosses it
       is carried rather than connected. */
    var zt = STRIP_Z + 5.4;
    second = [
      { shape: "plate", size: [10, 0.2, 3.2], pos: [STRIP_X + 4.0, 0.1, zt], shade: 0.78 },
      { shape: "rbox", size: [9.2, 0.34, 2.2], pos: [STRIP_X + 4.0, 0.3, zt], r: 0.02, shade: 0.9 },
      { shape: "cone", size: [0.34, 0.6, 0.02], pos: [STRIP_X + 2.4, 0.95, zt],
        rot: [Math.PI, 0, 0], seg: 10, shade: 1.0, here: 1 }
    ];
    carved.push(run(1, 1, STRIP_Z, 0.95, 1.75, 3.0, 1.0, "gate"));
    carved.push(run(100, 199, STRIP_Z, 0.52, 0.44, 2.6, 1.0, "pool"));
    /* The span, arched so it reads as going OVER rather than THROUGH. */
    for (var i = 0; i < 9; i++) {
      var t = i / 8;
      links.push({ shape: "box", size: [0.5, 0.28, 0.62],
        pos: [STRIP_X + 2.4 + t * 1.2, 1.1 + Math.sin(t * Math.PI) * 1.5, STRIP_Z + 1.9 + t * (zt - STRIP_Z - 1.9) / 1 * 0.0 + t * 3.4],
        r: 0.06, shade: 1.0 });
    }
  }

  if (kind === "dns") {
    /* No second strip. A lookup is a question and an answer, so it is drawn
       as a card handed across to a responder and a value coming back — and
       the value lands ON the strip, which is the thing worth seeing: a name
       resolves TO a position in an address space. */
    carved.push(run(1, 1, STRIP_Z, 0.95, 1.75, 3.0, 1.0, "gate"));
    carved.push({ shape: "cone", size: [0.34, 0.6, 0.02], pos: [at(64), 0.95, STRIP_Z],
      rot: [Math.PI, 0, 0], seg: 10, shade: 1.0, here: 1 });
    links.push({ shape: "rbox", size: [3.4, 0.16, 2.2], pos: [STRIP_X + 5.0, 1.9, STRIP_Z + 4.2], r: 0.06, shade: 1.0 });
    links.push({ shape: "box", size: [2.6, 0.06, 0.16], pos: [STRIP_X + 5.0, 2.0, STRIP_Z + 3.7], shade: 0.6 });
    links.push({ shape: "box", size: [2.0, 0.06, 0.16], pos: [STRIP_X + 4.7, 2.0, STRIP_Z + 4.2], shade: 0.6 });
    links.push({ shape: "box", size: [1.4, 0.06, 0.16], pos: [STRIP_X + 4.4, 2.0, STRIP_Z + 4.7], shade: 0.6 });
    /* and the answer, dropping onto the strip */
    links.push({ shape: "box", size: [0.2, 1.5, 0.2], pos: [at(64), 1.2, STRIP_Z + 2.6], shade: 1.25 });
    links.push({ shape: "box", size: [0.2, 0.2, 2.0], pos: [at(64), 1.9, STRIP_Z + 3.4], shade: 1.25 });
  }

  /* The board has to hold whatever this item actually drew. A name lookup
     has no second strip but does have a card standing behind the first one,
     and sizing on "is there a second strip" alone ran it off the bench. */
  var depth = second.length ? 13 : (kind === "dns" ? 9.5 : 5.5);

  return {
    kind: "drill",
    title: "One address space, drawn as the line it is",
    caption: "Two hundred and fifty-six addresses, laid out in order, with a mark every " +
      "sixteen so you can count rather than guess. The first and the last are drawn dark " +
      "because they are part of the space and nobody may use them. What has been carved " +
      "out of the rest — a way off the line, a range handed out automatically, machines " +
      "pinned to one address each — is what this objective is about. Where a second strip " +
      "appears, look hard at what does and does not join the two.",
    board: { size: [21, 0.5, depth + 2], pos: [0, -0.5, depth / 2 - 2.0], color: "#3f4750",
      build: [{ shape: "rbox", size: [21, 0.5, depth + 2], pos: [0, 0, 0], r: 0.12, shade: 1.0 }], scale: 1 },
    decor: [],
    parts: [
      { key: "space", label: "The address space", build: bed.concat(space), finish: "matte", scale: 1,
        pos: [0, 0, 0], color: "#8d969d",
        spec: "256 addresses, marked every 16",
        note: "The whole line, in order. The dark block at each end is an address that " +
          "exists and cannot be assigned to anything — one names the network itself and " +
          "the other reaches everything on it at once. Every space has both, whatever size " +
          "it is, which is why a range of 256 never gives you 256 machines." },
      { key: "carved", label: "What has been carved out of it", build: carved, finish: "matte", scale: 1,
        pos: [0, 0, 0], color: "#2f5fbf",
        spec: "Ranges, fixed pairings, and the machine the readout came from",
        note: "The tall block near the start is the one address on the line that leads " +
          "somewhere else. The long low band is a range something hands out on request. The " +
          "pegs standing in it are machines pinned to one address each. The marker is where " +
          "the machine in the readout is actually standing." },
      { key: "second", label: second.length ? "The other strip" : "No second strip on this one",
        build: second.length ? second : [{ shape: "box", size: [0.02, 0.02, 0.02], pos: [0, -4, 0], shade: 1 }],
        finish: "matte", scale: 1, pos: [0, 0, 0], color: "#7a6a4e",
        spec: second.length ? "A second address space, drawn beside the first" : "Not used here",
        note: second.length
          ? "Two spaces on one bench. Look at what joins them and what does not: a machine " +
            "standing on one of these cannot reach anything on the other unless something " +
            "drawn here carries it across, and on one of these items nothing does."
          : "This item happens on one address space, so there is only one line to read." },
      { key: "links", label: "What crosses between them", build: links.length ? links
          : [{ shape: "box", size: [0.02, 0.02, 0.02], pos: [0, -4, 0], shade: 1 }],
        finish: "matte", scale: 1, pos: [0, 0, 0], color: "#a8721f",
        spec: links.length ? "Equipment and paths drawn between the strips" : "Nothing crosses here",
        note: links.length
          ? "Follow it. Whether two address spaces are joined, kept apart, or bridged over " +
            "something you do not own is the difference between three of the concepts in " +
            "this pool that get muddled constantly."
          : "Nothing is drawn crossing anywhere on this item, and that is worth noticing " +
            "rather than skipping." }
    ],
    camera: { dist: 21, yaw: 0.16, pitch: 0.62, target: [0, 0.5, depth / 2 - 2.6], min: 8, max: 42 }
  };
}
