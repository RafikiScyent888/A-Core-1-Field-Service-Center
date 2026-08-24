/* =====================================================================
   Field Service Center — the bench for objective 2.5

   Three objectives in a row had to invent their evidence: a radio field, a
   log of sessions, an address space drawn as a line. This one does not.
   Every item in this pool is a box somebody can pick up, and the four
   things that separate them are all things you can see:

     - HOW MANY PORTS, and are they all the same. Drawn as the real count,
       so a student can count them. Twenty-four is not eight.
     - WHAT IS SET APART from that row. A threaded coaxial barrel, a pair of
       glass ferrules, a single port behind a raised divider, an uplink cage,
       a console port. Each is drawn as its own shape, not its own colour,
       because shape survives a monitor somebody cannot trust.
     - HOW POWER GETS IN. This is the sharpest tell in the pool and the one
       nobody uses. It is drawn as a separate part with its own colour, and
       it has five different shapes: a lead to the wall socket, a moulded
       plug straight into it, a card edge in a slot, a collar on the network
       cable where power is riding along with the data — and, for one item,
       an empty socket with nothing reaching it at all.
     - WHAT IS CABLED TO IT. One lead, two leads, a bundle of building
       cabling punched down behind it, or nothing whatsoever.

   The bench never changes: same top, same board behind it, same twin socket
   on that board in the same place. Only the device changes. That is the
   comparison, held still — the same idea as the rack in 2.3.

   NOTHING IS LABELLED. No silkscreen, no model number, no wattage printed
   on a case. The parts are named for what they are and never for what the
   device is.
   ===================================================================== */

const P2 = Math.PI / 2;

/* The bench top is the y = 0 plane. Everything sits on it. */
const BOARD = { w: 15, d: 6.4 };

/* The board behind the bench, and the twin mains socket screwed to it. Both
   are in the same place for every item in the pool, so the distance a lead
   has to travel is never a hint about anything. */
const WALL_Z = -3.0;
const WALL_FACE = WALL_Z + 0.18;
const SOCK = [-2.9, 2.3, WALL_FACE + 0.11];

/* How high off the bench a lead runs when it is dressed along it. High
   enough that a collar clamped round it does not sink into the bench top,
   which is what the first cut did. */
const FLOOR_RUN = 0.26;

/* How proud of a face the furniture on it sits. */
const FZ_PROUD = 0.06;

/* Sockets and lamps have to read on two opposite grounds — a light grey
   desktop box and a near-black rack chassis — from one material. Same
   geometry, shades flipped by which ground it is standing on. The rack in
   2.3 learned this the hard way: a dark port on a dark chassis is not a
   port, it is a rumour. */
function pal(dark) {
  return dark
    ? { sock: 1.62, deep: 1.2, lamp: 1.78, bez: 1.4, gold: 1.5 }
    : { sock: 0.4, deep: 0.24, lamp: 0.74, bez: 0.6, gold: 1.35 };
}

/* ---------------------------------------------------------------------
   Small primitives.
   --------------------------------------------------------------------- */
/* `dataPort` tags a member of the identical row and nothing else. The count
   of those is what the content claims, and a test asserts the two agree, so
   a socket that is deliberately NOT one of the row — the one behind the
   divider, the console, a cage — must not carry the tag. */
function socket(x, y, z, w, h, shade, rep) {
  var p = { shape: "box", size: [w, h, 0.15], pos: [x, y, z], r: 0.015, shade: shade, dataPort: 1 };
  if (rep) p.repeat = rep;
  return p;
}
function apart(x, y, z, w, h, shade) {
  var p = socket(x, y, z, w, h, shade);
  delete p.dataPort;
  p.setApart = 1;
  return p;
}
function lamp(x, y, z, shade, rep) {
  var p = { shape: "cyl", size: [0.08, 0.06], pos: [x, y, z], rot: [P2, 0, 0], seg: 10, shade: shade };
  if (rep) p.repeat = rep;
  return p;
}
/* A raised wall between one port and the rest of them. The divider is the
   only thing on the face that says the port beside it faces a different
   network, and it is geometry rather than a colour for exactly that reason. */
function divider(x, y, z, h) {
  return { shape: "box", size: [0.09, h || 0.5, 0.2], pos: [x, y, z], shade: 1.0, dividerWall: 1 };
}

/* ---------------------------------------------------------------------
   Two shells, because most of this pool is one of two shapes.
   --------------------------------------------------------------------- */
function deskShell(w, d, h) {
  var y = 0.12 + h / 2;
  var dev = [{ shape: "rbox", size: [w, h, d], pos: [0, y, 0], r: 0.07, shade: 1.0 }];
  [-1, 1].forEach(function (sx) {
    [-1, 1].forEach(function (sz) {
      dev.push({ shape: "cyl", size: [0.15, 0.12], pos: [sx * (w / 2 - 0.32), 0.06, sz * (d / 2 - 0.32)],
        seg: 8, shade: 0.66 });
    });
  });
  return { dev: dev, y: y, fz: d / 2 + FZ_PROUD, w: w, d: d, h: h };
}

function rackShell(w, d, h) {
  var y = 0.1 + h / 2;
  var dev = [{ shape: "rbox", size: [w, h, d], pos: [0, y, 0], r: 0.03, shade: 1.0 }];
  /* Rack ears, sticking out past the chassis at both ends. Nothing else in
     the pool has them and they are visible from across a room. */
  [-1, 1].forEach(function (sx) {
    dev.push({ shape: "box", size: [0.36, h * 0.82, 0.12], pos: [sx * (w / 2 + 0.18), y, d / 2 - 0.02],
      r: 0.01, shade: 0.82 });
    dev.push({ shape: "cyl", size: [0.11, 0.08], pos: [sx * (w / 2 + 0.18), y + 0.22, d / 2 + 0.04],
      rot: [P2, 0, 0], seg: 8, shade: 0.6 });
    dev.push({ shape: "cyl", size: [0.11, 0.08], pos: [sx * (w / 2 + 0.18), y - 0.22, d / 2 + 0.04],
      rot: [P2, 0, 0], seg: 8, shade: 0.6 });
  });
  [-1, 1].forEach(function (sx) {
    [-1, 1].forEach(function (sz) {
      dev.push({ shape: "box", size: [0.4, 0.1, 0.4], pos: [sx * (w / 2 - 0.5), 0.05, sz * (d / 2 - 0.4)],
        r: 0.02, shade: 0.66 });
    });
  });
  return { dev: dev, y: y, fz: d / 2 + FZ_PROUD, w: w, d: d, h: h };
}

/* A row of n identical sockets across the front of a shell, in one row or
   two depending on how many there are. Returns the built primitives; the
   count drawn is always exactly the count the content claims, which a test
   asserts, because prose and geometry drifting apart is the failure this
   whole build guards against. */
function portField(n, s, P, xEnd) {
  var out = [];
  var right = xEnd === undefined ? s.w / 2 - 0.35 : xEnd;
  if (n <= 8) {
    var step = 0.44, left = right - (n - 1) * step;
    out.push(socket(left, s.y + 0.02, s.fz, 0.3, 0.26, P.sock,
      n > 1 ? { count: n, step: [step, 0, 0] } : null));
    out.push(lamp(left, s.y + 0.27, s.fz, P.lamp,
      n > 1 ? { count: n, step: [step, 0, 0] } : null));
  } else {
    /* Twelve and twelve, the way a real face is laid out. */
    var half = n / 2, st = 0.46, l0 = right - (half - 1) * st;
    [0.2, -0.2].forEach(function (dy) {
      out.push(socket(l0, s.y + dy, s.fz, 0.32, 0.28, P.sock, { count: half, step: [st, 0, 0] }));
    });
  }
  return out;
}

function countPorts(list) {
  return list.reduce(function (a, p) {
    if (!p.dataPort) return a;
    return a + (p.repeat ? p.repeat.count : 1);
  }, 0);
}

/* ---------------------------------------------------------------------
   The fourteen devices.

   Each returns the chassis, everything socket-shaped on it, where its data
   cable leaves from, and where its power arrives.
   --------------------------------------------------------------------- */
function build(it) {
  var dark = it.form === "rack" || it.form === "inline" || it.form === "card";
  var P = pal(dark);
  var dev = [], ports = [], s, i;

  switch (it.key) {

    case "unmanaged":
    case "hub": {
      s = deskShell(it.key === "hub" ? 3.0 : 3.9, 2.3, 0.72);
      dev = s.dev;
      ports = portField(it.ports, s, P);
      if (it.key === "hub") {
        /* One extra lamp, off on its own, that has nothing to do with any
           particular port. What it means is not written anywhere. */
        ports.push(lamp(-s.w / 2 + 0.4, s.y + 0.02, s.fz, P.lamp));
        ports.push({ shape: "torus", size: [0.2, 0.05], pos: [-s.w / 2 + 0.4, s.y + 0.02, s.fz],
          rot: [0, 0, 0], seg: 14, shade: P.bez });
      }
      return { dev: dev, ports: ports, s: s,
        dataAt: [s.w / 2 - 0.35, s.y + 0.02, s.fz], powerAt: [-s.w / 2 + 0.3, s.y, -s.d / 2 - 0.05] };
    }

    case "router": {
      s = deskShell(4.4, 2.4, 0.78);
      dev = s.dev;
      /* Four together on the right, then a wall, then one on its own. The
         gap and the wall are the entire point. */
      ports = portField(4, s, P, 1.35);
      ports.push(divider(-0.35, s.y + 0.02, s.fz, 0.62));
      ports.push(apart(-0.85, s.y + 0.02, s.fz, 0.34, 0.3, P.sock));
      ports.push(lamp(-0.85, s.y + 0.3, s.fz, P.lamp));
      /* A console port, on the front where it can be seen. It began on the
         left flank, facing away from every camera angle the page offers —
         which made "somewhere to configure it" a claim on the plate with
         nothing behind it. */
      ports.push({ shape: "box", size: [0.4, 0.19, 0.16], pos: [1.92, s.y + 0.02, s.fz],
        r: 0.02, shade: P.deep, consolePort: 1 });
      ports.push({ shape: "box", size: [0.48, 0.25, 0.06], pos: [1.92, s.y + 0.02, s.fz + 0.06],
        r: 0.01, shade: P.bez });
      /* Two antennas, because a small-office box of this kind has them. */
      [-1.2, 1.2].forEach(function (x) {
        dev.push({ shape: "cyl", size: [0.11, 1.7], pos: [x, s.y + 1.05, -s.d / 2 + 0.1],
          rot: [0.34, 0, 0], seg: 10, shade: 0.72 });
      });
      return { dev: dev, ports: ports, s: s,
        dataAt: [-0.85, s.y + 0.02, s.fz], powerAt: [s.w / 2 - 0.3, s.y, -s.d / 2 - 0.05] };
    }

    case "modem": {
      s = deskShell(2.4, 1.9, 1.5);
      dev = s.dev;
      ports = portField(1, s, P, 0.5);
      /* The threaded barrel, with its collar rings. There is nothing else in
         this pool shaped like it — which is worth nothing at all if it sits
         on the face the camera never sees, which is where it started. It is
         on the flank the page's default view looks at, near the front. */
      var bx = s.w / 2 + 0.14;
      ports.push({ shape: "cyl", size: [0.19, 0.4], pos: [bx, s.y, 0.25], rot: [0, 0, P2], seg: 14,
        shade: P.gold, coaxBarrel: 1 });
      ports.push({ shape: "torus", size: [0.22, 0.05], pos: [bx + 0.12, s.y, 0.25], rot: [0, 0, P2],
        seg: 14, shade: P.gold, repeat: { count: 3, step: [0.1, 0, 0] } });
      ports.push({ shape: "cyl", size: [0.06, 0.5], pos: [bx + 0.2, s.y, 0.25], rot: [0, 0, P2], seg: 8,
        shade: P.deep });
      ports.push(lamp(0.0, s.y + 0.5, s.fz, P.lamp, { count: 4, step: [0.34, 0, 0] }));
      return { dev: dev, ports: ports, s: s,
        dataAt: [0.5, s.y + 0.02, s.fz], powerAt: [s.w / 2 - 0.3, s.y, -s.d / 2 - 0.05] };
    }

    case "managed":
    case "poeswitch": {
      var deep = it.key === "poeswitch" ? 2.9 : 2.2;
      s = rackShell(7.2, deep, 0.92);
      dev = s.dev;
      ports = portField(24, s, P, 2.3);
      /* Two cages at the far end, taller than a socket and clearly not part
         of the row. */
      [2.86, 3.3].forEach(function (x) {
        ports.push({ shape: "box", size: [0.3, 0.44, 0.22], pos: [x, s.y + 0.02, s.fz], r: 0.02,
          shade: P.deep, uplinkCage: 1 });
      });
      ports.push({ shape: "box", size: [0.42, 0.2, 0.16], pos: [-3.28, s.y - 0.2, s.fz], r: 0.02,
        shade: P.deep, consolePort: 1 });
      ports.push({ shape: "box", size: [0.5, 0.26, 0.06], pos: [-3.28, s.y - 0.2, s.fz + 0.06], r: 0.01,
        shade: P.bez });
      ports.push(lamp(-3.28, s.y + 0.22, s.fz, P.lamp, { count: 2, step: [0.3, 0, 0] }));
      if (it.key === "poeswitch") {
        /* A supply that is physically bigger than the one next door, and a
           fan grille it needs because of it. Nothing says so in words. */
        dev.push({ shape: "rbox", size: [2.4, 0.8, 1.5], pos: [2.0, s.y, -s.d / 2 + 0.6], r: 0.03,
          shade: 0.74 });
        dev.push({ shape: "cyl", size: [0.5, 0.14], pos: [1.2, s.y, -s.d / 2 - 0.02], rot: [P2, 0, 0],
          seg: 18, shade: 0.5 });
        dev.push({ shape: "cyl", size: [0.5, 0.14], pos: [2.8, s.y, -s.d / 2 - 0.02], rot: [P2, 0, 0],
          seg: 18, shade: 0.5 });
      }
      return { dev: dev, ports: ports, s: s,
        dataAt: [2.86, s.y + 0.02, s.fz], powerAt: [-2.6, s.y, -s.d / 2 - 0.05] };
    }

    case "firewall": {
      s = rackShell(6.6, 2.2, 0.92);
      dev = s.dev;
      ports = portField(6, s, P, 2.6);
      ports.push(divider(-0.1, s.y + 0.02, s.fz, 0.66));
      ports.push(apart(-0.62, s.y + 0.02, s.fz, 0.36, 0.32, P.sock));
      ports.push(lamp(-0.62, s.y + 0.34, s.fz, P.lamp));
      /* A pair of fibre positions beside the port that faces out — a dark
         plate with two round ferrules standing in it. Drawn as boxes the
         same size as everything else they were simply two more ports, and
         "which medium arrives here" is half of what this face is for. */
      ports.push({ shape: "box", size: [0.78, 0.5, 0.14], pos: [-1.32, s.y + 0.02, s.fz], r: 0.02,
        shade: P.deep, fibreCage: 1 });
      [-1.5, -1.14].forEach(function (x) {
        ports.push({ shape: "cyl", size: [0.14, 0.34], pos: [x, s.y + 0.02, s.fz + 0.14],
          rot: [P2, 0, 0], seg: 14, shade: P.gold, fibreFerrule: 1 });
      });
      ports.push({ shape: "box", size: [0.42, 0.2, 0.16], pos: [-2.9, s.y - 0.2, s.fz], r: 0.02,
        shade: P.deep, consolePort: 1 });
      ports.push(lamp(-2.9, s.y + 0.22, s.fz, P.lamp, { count: 2, step: [0.3, 0, 0] }));
      return { dev: dev, ports: ports, s: s,
        dataAt: [-0.62, s.y + 0.02, s.fz], powerAt: [-2.4, s.y, -s.d / 2 - 0.05] };
    }

    case "patch": {
      s = rackShell(7.2, 1.2, 0.92);
      dev = s.dev;
      ports = portField(24, s, P, 2.9);
      /* And on the back, the other half of it: a punch-down block where the
         building's own cabling terminates permanently. */
      for (i = 0; i < 24; i++) {
        var px = -2.9 + (i % 12) * 0.46, py = s.y + (i < 12 ? 0.2 : -0.2);
        ports.push({ shape: "box", size: [0.34, 0.14, 0.18], pos: [px, py, -s.d / 2 - 0.08],
          shade: P.bez, punchDown: 1 });
      }
      return { dev: dev, ports: ports, s: s,
        dataAt: [2.9, s.y + 0.2, s.fz], powerAt: null };
    }

    case "ap": {
      /* A ceiling disc, stood on a cradle so the face somebody would look at
         is the face pointing at the camera. */
      var C = [0, 1.5, -0.25], R = 1.6, tilt = 1.18;
      dev = [
        { shape: "cyl", size: [R, 0.34], pos: C, rot: [tilt, 0, 0], seg: 40, shade: 1.0 },
        { shape: "cyl", size: [R * 0.72, 0.42], pos: [C[0], C[1] + 0.02, C[2] - 0.04], rot: [tilt, 0, 0],
          seg: 32, shade: 0.94 },
        /* The cradle holding it up. */
        { shape: "box", size: [1.8, 0.16, 0.9], pos: [0, 0.08, -0.5], r: 0.03, shade: 0.6 },
        { shape: "box", size: [0.24, 1.5, 0.8], pos: [-0.7, 0.75, -0.75], r: 0.03, shade: 0.6 },
        { shape: "box", size: [0.24, 1.5, 0.8], pos: [0.7, 0.75, -0.75], r: 0.03, shade: 0.6 }
      ];
      /* One socket, low on the face, and one lamp. That is the whole of it. */
      ports = [
        socket(0, 0.72, 0.62, 0.36, 0.3, P.sock),
        lamp(0, 2.1, 0.72, P.lamp)
      ];
      return { dev: dev, ports: ports, s: { y: 1.5, fz: 0.62, w: 3.2, d: 1.6 },
        dataAt: [0, 0.72, 0.62], powerAt: null };
    }

    case "ont": {
      /* On the board behind the bench, where one actually lives. */
      var wy = 2.2, wz = WALL_FACE + 0.45;
      dev = [
        { shape: "rbox", size: [2.3, 3.0, 0.9], pos: [0, wy, wz], r: 0.08, shade: 1.0 },
        /* The hinged cover, standing open. */
        { shape: "box", size: [2.0, 1.2, 0.1], pos: [0, wy - 1.5, wz + 1.05], rot: [1.3, 0, 0], r: 0.02,
          shade: 0.86 },
        { shape: "cyl", size: [0.08, 2.0], pos: [0, wy - 1.15, wz + 0.46], rot: [0, 0, P2], seg: 8,
          shade: 0.66 }
      ];
      ports = [
        /* Behind the cover: a fibre connector with its dust cap, and beside
           it the one copper socket. */
        { shape: "cyl", size: [0.13, 0.5], pos: [-0.5, wy - 0.6, wz + 0.6], rot: [P2, 0, 0], seg: 12,
          shade: P.gold, fibreFerrule: 1 },
        { shape: "cyl", size: [0.2, 0.14], pos: [-0.5, wy - 0.6, wz + 0.82], rot: [P2, 0, 0], seg: 12,
          shade: P.bez },
        socket(0.55, wy - 0.6, wz + 0.5, 0.36, 0.3, P.sock),
        lamp(-0.6, wy + 1.0, wz + 0.47, P.lamp, { count: 4, step: [0.4, 0, 0] })
      ];
      return { dev: dev, ports: ports, s: { y: wy, fz: wz + 0.5, w: 2.3, d: 0.9 },
        dataAt: [0.55, wy - 0.6, wz + 0.5], powerAt: [1.15, wy - 1.2, wz] };
    }

    case "nic": {
      /* A card standing on its edge in a slot, which is the only way one is
         ever seen doing its job. */
      var cy = 1.35;
      dev = [
        { shape: "box", size: [3.4, 1.8, 0.1], pos: [0, cy, 0], r: 0.02, shade: 1.0 },
        /* Components on it, and the bracket at one end. */
        { shape: "box", size: [0.7, 0.7, 0.24], pos: [-0.5, cy + 0.1, 0.16], r: 0.02, shade: 0.5 },
        { shape: "box", size: [0.3, 0.3, 0.18], pos: [0.5, cy + 0.4, 0.14], r: 0.02, shade: 0.72,
          repeat: { count: 3, step: [0.4, 0, 0] } },
        { shape: "box", size: [0.14, 2.6, 0.5], pos: [1.78, cy + 0.1, 0.1], r: 0.02, shade: 1.55 },
        { shape: "box", size: [0.5, 0.2, 0.5], pos: [1.78, cy + 1.4, 0.1], r: 0.02, shade: 1.55 }
      ];
      ports = [
        { shape: "box", size: [0.16, 0.34, 0.36], pos: [1.86, cy + 0.1, 0.1], r: 0.02, shade: P.sock,
          dataPort: 1 },
        lamp(1.86, cy - 0.5, 0.1, P.lamp)
      ];
      return { dev: dev, ports: ports, s: { y: cy, fz: 0.3, w: 3.4, d: 0.5 },
        dataAt: [2.0, cy + 0.1, 0.1], powerAt: [-0.4, cy - 0.9, 0] };
    }

    case "poeinj":
    case "converter": {
      var w = 1.9, hh = 0.7, dd = 1.2, by = 0.12 + hh / 2;
      dev = [{ shape: "rbox", size: [w, hh, dd], pos: [0, by, 0], r: 0.08, shade: 1.0 }];
      ports = [];
      if (it.key === "poeinj") {
        /* A socket at each end, and they are the same socket. */
        ports.push({ shape: "box", size: [0.18, 0.3, 0.34], pos: [-w / 2 - 0.04, by, 0], r: 0.02,
          shade: P.sock, dataPort: 1 });
        ports.push({ shape: "box", size: [0.18, 0.3, 0.34], pos: [w / 2 + 0.04, by, 0], r: 0.02,
          shade: P.sock, dataPort: 1 });
        ports.push(lamp(0, by + 0.18, dd / 2 + FZ_PROUD, P.lamp));
      } else {
        /* Copper at one end and two glass ferrules at the other. The two
           ends are not the same shape, and that is the whole item. */
        ports.push({ shape: "box", size: [0.18, 0.3, 0.34], pos: [-w / 2 - 0.04, by, 0], r: 0.02,
          shade: P.sock, dataPort: 1 });
        /* Two ferrules, drawn big enough to read as round from across the
           bench. At the size of a socket they were two more grey tabs, and
           the entire point of this item is that its two ends are not the
           same shape. */
        ports.push({ shape: "box", size: [0.12, 0.62, 0.78], pos: [w / 2 + 0.06, by, 0], r: 0.02,
          shade: P.deep });
        [-0.24, 0.24].forEach(function (dz) {
          ports.push({ shape: "cyl", size: [0.15, 0.62], pos: [w / 2 + 0.36, by, dz], rot: [0, 0, P2],
            seg: 14, shade: P.gold, fibreFerrule: 1 });
        });
        ports.push(lamp(0, by + 0.18, dd / 2 + FZ_PROUD, P.lamp));
      }
      return { dev: dev, ports: ports, s: { y: by, fz: dd / 2 + FZ_PROUD, w: w, d: dd },
        dataAt: [-w / 2 - 0.2, by, 0], powerAt: [0, by - 0.1, -dd / 2 - 0.05],
        secondData: [w / 2 + (it.key === "converter" ? 0.72 : 0.28), by, 0] };
    }

    case "extender": {
      /* Hanging on the socket, because that is where one lives. Nothing else
         in the pool is drawn touching the wall socket. */
      var ex = SOCK[0], ey = SOCK[1] - 0.95, ez = WALL_FACE + 0.75;
      dev = [
        { shape: "rbox", size: [1.7, 1.9, 0.95], pos: [ex, ey, ez], r: 0.12, shade: 1.0 }
      ];
      [-0.55, 0.55].forEach(function (dx) {
        dev.push({ shape: "cyl", size: [0.1, 1.6], pos: [ex + dx, ey + 1.5, ez - 0.1],
          rot: [0, 0, dx > 0 ? -0.4 : 0.4], seg: 10, shade: 0.72 });
      });
      ports = [
        socket(ex, ey - 0.75, ez + 0.5, 0.34, 0.28, P.sock),
        lamp(ex - 0.35, ey + 0.4, ez + 0.5, P.lamp, { count: 3, step: [0.35, 0, 0] })
      ];
      return { dev: dev, ports: ports, s: { y: ey, fz: ez + 0.48, w: 1.7, d: 0.95 },
        dataAt: null, powerAt: "plug" };
    }
  }
  return null;
}

/* ---------------------------------------------------------------------
   Cabling. Right angles, dressed the way anybody dresses a bench.
   --------------------------------------------------------------------- */
const T = 0.15;
function runY(x, y0, y1, z, sh) {
  return { shape: "box", size: [T, Math.abs(y1 - y0), T], pos: [x, (y0 + y1) / 2, z], r: 0.05, shade: sh === undefined ? 1 : sh };
}
function runX(x0, x1, y, z, sh) {
  return { shape: "box", size: [Math.abs(x1 - x0), T, T], pos: [(x0 + x1) / 2, y, z], r: 0.05, shade: sh === undefined ? 1 : sh };
}
function runZ(x, y, z0, z1, sh) {
  return { shape: "box", size: [T, T, Math.abs(z1 - z0)], pos: [x, y, (z0 + z1) / 2], r: 0.05, shade: sh === undefined ? 1 : sh };
}

/* From a socket, out into the room, down to the bench, along it and away
   into the board behind. Where a cable GOES is never the question in this
   pool, so every lead leaves by the same route. */
function leadAway(from, exitX, sh) {
  var lane = from[2] + 0.55, floor = FLOOR_RUN, up = 1.9;
  return [
    runZ(from[0], from[1], from[2], lane, sh),
    runY(from[0], from[1], floor, lane, sh),
    runX(from[0], exitX, floor, lane, sh),
    runZ(exitX, floor, lane, WALL_FACE + 0.06, sh),
    runY(exitX, floor, up, WALL_FACE + 0.06, sh),
    /* A grommet where it leaves for the rest of the building. Without it the
       lead rose into empty air and read as unfinished geometry rather than
       as a cable going somewhere. */
    { shape: "rbox", size: [0.6, 0.6, 0.16], pos: [exitX, up, WALL_FACE + 0.08], r: 0.06, shade: 0.72 },
    { shape: "cyl", size: [0.17, 0.2], pos: [exitX, up, WALL_FACE + 0.14], rot: [P2, 0, 0], seg: 12,
      shade: 0.45 }
  ];
}

/* A collar clamped round a network cable where power is riding along it.
   Drawn in the power colour, on top of the data lead, because that is
   exactly what is happening: one cable, two things in it. */
function collar(from, exitX) {
  var lane = from[2] + 0.55, out = [], span = from[1] - FLOOR_RUN;
  /* Only on the vertical drop if there is enough of one to clamp anything
     to. An inline block sits two inches off the bench and a collar hung
     halfway down its lead ends up under the bench. */
  if (span > 0.7) {
    [0.35, 0.7].forEach(function (f) {
      out.push({ shape: "cyl", size: [0.27, 0.5], pos: [from[0], from[1] - span * f, lane],
        seg: 14, shade: 1.0, poeCollar: 1 });
    });
  }
  [0.3, 0.55, 0.8].forEach(function (f) {
    out.push({ shape: "cyl", size: [0.27, 0.5], pos: [from[0] + (exitX - from[0]) * f, FLOOR_RUN, lane],
      rot: [0, 0, P2], seg: 14, shade: 1.0, poeCollar: 1 });
  });
  return out;
}

/* The twin socket on the board. Always drawn, for every item, whether or
   not anything reaches it. */
function socketPlate() {
  return [
    { shape: "rbox", size: [1.7, 1.1, 0.22], pos: [SOCK[0], SOCK[1], WALL_FACE + 0.11], r: 0.05, shade: 1.0 },
    { shape: "box", size: [0.6, 0.6, 0.1], pos: [SOCK[0] - 0.38, SOCK[1], WALL_FACE + 0.2], r: 0.02, shade: 0.62 },
    { shape: "box", size: [0.6, 0.6, 0.1], pos: [SOCK[0] + 0.38, SOCK[1], WALL_FACE + 0.2], r: 0.02, shade: 0.62 },
    { shape: "cyl", size: [0.09, 0.08], pos: [SOCK[0], SOCK[1] + 0.44, WALL_FACE + 0.24], rot: [P2, 0, 0],
      seg: 8, shade: 0.7 },
    { shape: "cyl", size: [0.09, 0.08], pos: [SOCK[0], SOCK[1] - 0.44, WALL_FACE + 0.24], rot: [P2, 0, 0],
      seg: 8, shade: 0.7 }
  ];
}

/* A mains lead from the socket to wherever the device takes it. */
/* Down the board, across it, then forward and down into the inlet. It runs
   at head height against the board rather than along the bench, because on
   the bench it lay behind the device in its own colour on a ground the same
   value and simply was not there. */
function mainsLead(to) {
  var lane = WALL_FACE + 0.34, hi = 1.15, x0 = SOCK[0] - 0.38;
  return [
    { shape: "rbox", size: [0.7, 0.5, 0.55], pos: [x0, SOCK[1], lane + 0.1], r: 0.06, shade: 0.9 },
    runY(x0, SOCK[1] - 0.3, hi, lane),
    runX(x0, to[0], hi, lane),
    runZ(to[0], hi, lane, to[2]),
    runY(to[0], hi, to[1], to[2]),
    /* The inlet it lands in. */
    { shape: "box", size: [0.42, 0.34, 0.2], pos: to, r: 0.02, shade: 0.72 }
  ];
}

/* ---------------------------------------------------------------------
   The model.
   --------------------------------------------------------------------- */
const FORM_COLOUR = {
  desktop: "#c3cad0",
  rack: "#242c33",
  disc: "#e7e6e0",
  wall: "#dcd7ca",
  card: "#1f6b4a",
  inline: "#39404a",
  plug: "#efeee8"
};

const POWER_NOTE = {
  mains: "A lead from the socket to an inlet on the case. Ordinary, and worth confirming rather " +
    "than assuming — three of the fourteen devices in this pool do not have one, for three " +
    "different reasons.",
  poe: "There is no mains lead. Look at what is clamped round the network cable instead: the " +
    "power is travelling down the same cable as the data, which means something at the far end " +
    "is putting it there.",
  slot: "No lead of any kind. The gold fingers along the bottom edge sit in a connector, and " +
    "everything this device needs — power and data both — comes through them.",
  plug: "No lead at all: the body is hanging on the socket, and the pins are moulded into it. " +
    "Nothing else in this pool is drawn touching the wall socket.",
  none: "The socket on the board is empty and nothing on the bench reaches it. Before deciding " +
    "that is a fault, ask whether this device would have anything to do with electricity in the " +
    "first place."
};

export function deviceModel(D) {
  var it = D.item;
  var made = build(it);
  var dark = it.form === "rack" || it.form === "inline" || it.form === "card";

  /* --- power ------------------------------------------------------- */
  var mode = it.key === "ap" ? "poe"
    : it.key === "nic" ? "slot"
    : it.key === "extender" ? "plug"
    : it.key === "patch" ? "none"
    : "mains";

  var power = socketPlate();
  var cable = [];
  var exitX = 5.8;

  if (mode === "mains") power = power.concat(mainsLead(made.powerAt));
  if (/battery/i.test(it.powered)) {
    /* Some equipment carries its own reserve, and the content says so. A
       promise in prose with nothing drawn beside it is the failure this
       build keeps catching, so it is drawn — and a test checks it is. */
    var bx = made.powerAt[0] + 1.35;
    power.push({ shape: "rbox", size: [1.1, 1.5, 0.8], pos: [bx, made.powerAt[1] + 0.15, WALL_FACE + 0.42],
      r: 0.05, shade: 0.88, battery: 1 });
    power.push({ shape: "box", size: [0.16, 0.16, 0.12], pos: [bx - 0.28, made.powerAt[1] + 0.72, WALL_FACE + 0.84],
      shade: 1.3, repeat: { count: 2, step: [0.56, 0, 0] } });
    power.push(runX(made.powerAt[0], bx, made.powerAt[1] - 0.5, WALL_FACE + 0.5));
  }
  if (mode === "plug") {
    /* The moulded plug, going straight into the socket with no lead. */
    power.push({ shape: "box", size: [0.9, 0.66, 0.44], pos: [SOCK[0], SOCK[1] - 0.02, WALL_FACE + 0.4],
      r: 0.05, shade: 0.9 });
    power.push({ shape: "box", size: [0.14, 0.34, 0.14], pos: [SOCK[0] - 0.2, SOCK[1] + 0.06, WALL_FACE + 0.16],
      shade: 0.66, repeat: { count: 2, step: [0.4, 0, 0] } });
  }
  if (mode === "slot") {
    /* The slot, and the gold fingers sitting in it. */
    power.push({ shape: "rbox", size: [3.0, 0.34, 0.7], pos: [0, 0.3, 0], r: 0.03, shade: 0.8 });
    power.push({ shape: "box", size: [0.1, 0.28, 0.06], pos: [-1.2, 0.52, 0.06],
      shade: 1.35, repeat: { count: 18, step: [0.14, 0, 0] } });
  }

  /* --- what is cabled to it ---------------------------------------- */
  var cableNote;
  if (it.key === "patch") {
    /* The building's own cabling, arriving from above and punched down on
       the back. Twenty-four of them, and not one is a patch lead. */
    for (var i = 0; i < 24; i++) {
      var px = -2.9 + (i % 12) * 0.46;
      cable.push(runY(px, made.s.y + (i < 12 ? 0.2 : -0.2), 3.5, -made.s.d / 2 - 0.2));
    }
    cable.push(runX(-3.0, 2.4, 3.4, -made.s.d / 2 - 0.2));
    cableNote = "Twenty-four cables, all arriving from the same direction and all terminating on " +
      "the back rather than plugging into the front. Count how many of them are patch leads you " +
      "could unplug with your fingers.";
  } else if (made.dataAt) {
    if (made.secondData) {
      /* Each lead leaves by its own side. Routed both to the same side they
         crossed back over the device, and a cable running through the thing
         it is supposed to be entering is not a picture of anything. */
      cable = leadAway(made.dataAt, -exitX).concat(leadAway(made.secondData, exitX));
      cableNote = "Two leads, one out of each end. Whatever this does, it does it to something " +
        "already travelling between two points — so the question is what is different about the " +
        "two ends. Compare the sockets they come out of, and compare the leads along their length.";
    } else {
      cable = leadAway(made.dataAt, exitX);
      cableNote = it.key === "ap"
        ? "One lead, and only one. Look at what is clamped round it before deciding what that " +
          "single cable is carrying."
        : "One lead to the rest of the network. Where it goes is the same for every item on this " +
          "bench, so the cabling is not what tells them apart — the faces are.";
    }
  } else {
    cableNote = null;
  }

  /* PoE collars: the two devices that put power on a cable and the one that
     takes it off. Same geometry all three times, which is the point. */
  if (mode === "poe") power = power.concat(collar(made.dataAt, exitX));
  if (it.key === "poeinj") power = power.concat(collar(made.secondData, exitX));
  if (it.key === "poeswitch") power = power.concat(collar(made.dataAt, exitX));

  var drawn = countPorts(made.ports);

  var parts = [
    { key: "device", label: "The device itself", build: made.dev, finish: "matte", scale: 1,
      pos: [0, 0, 0], color: FORM_COLOUR[it.form],
      spec: "The case, and how it is meant to be held in place",
      note: "Shape first. Rack ears mean a rack; a bracket for a ceiling or a wall means it is not " +
        "going on a desk; a bare board with an edge along the bottom means it lives inside a " +
        "machine. That narrows the fourteen down to two or three before you read anything." },
    { key: "ports", label: "Everything socket-shaped on it", build: made.ports, finish: "matte",
      scale: 1, pos: [0, 0, 0], color: "#8b959c",
      spec: drawn === 1
        ? "One socket in the row, and whatever else is on the faces"
        : drawn + " identical sockets in the row, and whatever else is on the faces",
      note: "Count the ones that are identical to each other, then look for anything that is not: " +
        "a taller cage, a threaded barrel, a round ferrule, a slim rectangle for a console cable, " +
        "or a single socket with a raised wall between it and the rest. Every one of those means " +
        "something specific." },
    { key: "power", label: "How power gets in", build: power, finish: "matte", scale: 1,
      pos: [0, 0, 0], color: "#8a5a3c",
      spec: "The socket on the board, and whatever does or does not reach it",
      note: POWER_NOTE[mode] }
  ];
  if (cable.length) {
    parts.push({ key: "cable", label: "What is cabled to it", build: cable, finish: "matte", scale: 1,
      pos: [0, 0, 0], color: "#2f5fbf",
      spec: "Every data lead in or out",
      note: cableNote });
  }

  return {
    kind: "drill",
    title: "One bench, one device on it",
    caption: "The same bench every time, and the same twin socket on the board behind it. Only " +
      "the device changes. Four things separate this pool and all four are visible from where you " +
      "are standing: how many sockets there are and whether they are all alike, what is set apart " +
      "from them, how power gets in, and what is cabled to it. Take them in that order.",
    board: { size: [BOARD.w, 0.4, BOARD.d], pos: [0, -0.2, 0], color: "#3f474d",
      build: [{ shape: "rbox", size: [BOARD.w, 0.4, BOARD.d], pos: [0, 0, 0], r: 0.12, shade: 1.0 }],
      scale: 1 },
    decor: [
      { shape: "box", size: [BOARD.w, 4.4, 0.36], pos: [0, 2.0, WALL_Z], r: 0.04, shade: 1.0,
        color: "#59636a" },
      { shape: "box", size: [BOARD.w, 0.14, 0.5], pos: [0, 4.2, WALL_Z + 0.2], shade: 0.82,
        color: "#59636a" }
    ],
    parts: parts,
    /* For the tests: the count actually drawn, and how power was routed.
       Both are asserted against the content rather than trusted. */
    _ports: drawn,
    _power: mode,
    _dark: dark,
    camera: { dist: 12.2, yaw: 0.34, pitch: 0.28, target: [-0.3, 1.5, -0.5], min: 5, max: 28 }
  };
}
