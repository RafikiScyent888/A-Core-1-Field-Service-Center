/* =====================================================================
   Field Service Center — the rack elevation for objective 2.3

   The second model that had to be designed around the fact that the object
   is not the evidence. Eight of the sixteen hosts in this pool are the same
   1U box, and drawing them more beautifully would not help anybody.

   What IS evidence, and what a technician genuinely reads a rack for:

     - the FORM. Hot-swap caddies mean storage. A beige tower with a floppy
       drive is not a server anybody bought this decade. A controller on a
       DIN rail with screw terminals under it is not an office machine at
       all. A sealed module on a bracket with one port is neither.
     - whether there is a VIDEO PORT. This is the whole file-server-against-
       appliance distinction and it is a real one you can see from the front.
     - the CABLING. What is immediately above and below a box in the path is
       most of what it is. The appliance under the provider's fibre handoff
       and the appliance in front of a row of identical servers are the same
       chassis doing opposite jobs.

   So the rack is constant — same frame, same patch panel, same switch,
   every item — and only the device and its cabling change. That is the
   comparison the student is being asked to make, held still.

   NOTHING IS LABELLED. There is no silkscreen, no asset tag and no text of
   any kind in the geometry. The parts are named for what they are — a
   chassis, a front panel, cabling, the rack — and never for what runs on
   them.
   ===================================================================== */

const P2 = Math.PI / 2;

/* One rack unit, and the frame's inside width. */
const U = 0.9;
const W = 5.9;

/* The centre height of a device `h` units tall whose bottom edge is at rack
   unit `u`, counting from 1 at the bottom. */
function uy(u, h) { return 0.55 + (u - 1) * U + (h * U) / 2; }

/* A device chassis in the rack. */
function chassisBox(u, h) {
  return { shape: "rbox", size: [W, h * U - 0.09, 1.15], pos: [0, uy(u, h), 0], r: 0.03, shade: 1.0 };
}

/* Front-panel furniture. Everything sits just proud of the front face, which
   is at z = +0.575, because the camera looks at the front of a rack the way
   a person standing in a comms room does. */
const FZ = 0.6;

function port(x, y, w, hgt, shade) {
  return { shape: "box", size: [w || 0.26, hgt || 0.2, 0.08], pos: [x, y, FZ], r: 0.01, shade: shade };
}
function led(x, y, shade) {
  return { shape: "cyl", size: [0.09, 0.06], pos: [x, y, FZ], rot: [P2, 0, 0], seg: 10, shade: shade };
}

/* Front-panel furniture has to read on two opposite grounds. A general-purpose
   server is light steel, so its ports and vents are the dark things on it. A
   network appliance is near-black, so its ports have to be the LIGHT things on
   it or they are not there at all — which is precisely what happened on the
   first cut: a black port on a black chassis, on a page built for damaged
   sight. Same geometry, same part, shades flipped by which ground it is
   standing on. */
function pal(dark) {
  return dark
    ? { ear: 1.32, feat: 1.14, deep: 0.96, screw: 1.2, lamp: 1.62, glass: 1.5, vent: 1.08 }
    : { ear: 0.78, feat: 0.5,  deep: 0.34, screw: 0.5, lamp: 0.62, glass: 1.55, vent: 0.4 };
}

/* ---------------------------------------------------------------------
   The six forms.

   Each returns { chassis, face, at } — the body, the things on its front,
   and where in the rack it ended up so the cabling knows where to start.
   `at` is null for the three that are not rack devices at all, which is
   itself a fact worth a student noticing.
   --------------------------------------------------------------------- */
function formGeneric1U(u) {
  var y = uy(u, 1), P = pal(false);
  return {
    chassis: [chassisBox(u, 1)],
    face: [
      /* Rack ears and the two captive screws that hold it in. */
      { shape: "box", size: [0.34, 0.7, 0.1], pos: [-W / 2 + 0.17, y, FZ], r: 0.01, shade: P.ear },
      { shape: "box", size: [0.34, 0.7, 0.1], pos: [W / 2 - 0.17, y, FZ], r: 0.01, shade: P.ear },
      { shape: "cyl", size: [0.13, 0.07], pos: [-W / 2 + 0.17, y, FZ + 0.04], rot: [P2, 0, 0], seg: 10, shade: P.screw },
      { shape: "cyl", size: [0.13, 0.07], pos: [W / 2 - 0.17, y, FZ + 0.04], rot: [P2, 0, 0], seg: 10, shade: P.screw },
      /* Ventilation across the middle: a general-purpose server breathes
         through its face because the drives are behind it. */
      { shape: "box", size: [0.07, 0.5, 0.06], pos: [-1.9, y, FZ], shade: P.vent,
        repeat: { count: 22, step: [0.17, 0, 0] } },
      /* Power button and two status lamps. */
      { shape: "cyl", size: [0.22, 0.08], pos: [-2.35, y, FZ], rot: [P2, 0, 0], seg: 12, shade: P.feat },
      led(2.05, y + 0.18, P.lamp), led(2.05, y - 0.18, P.feat),
      /* A console port and a video port — this is a computer somebody can
         sit in front of. */
      port(2.45, y + 0.16, 0.3, 0.16, P.deep),
      (function () { var v = port(2.45, y - 0.16, 0.34, 0.2, P.deep); v.videoPort = 1; return v; }())
    ],
    at: u, h: 1
  };
}

function formBays(u, hasVideo) {
  var y = uy(u, 2), P = pal(false);
  var face = [
    { shape: "box", size: [0.3, 1.55, 0.1], pos: [-W / 2 + 0.15, y, FZ], r: 0.01, shade: P.ear },
    { shape: "box", size: [0.3, 1.55, 0.1], pos: [W / 2 - 0.15, y, FZ], r: 0.01, shade: P.ear }
  ];
  /* Six hot-swap caddies, two rows of three: a latch handle and an activity
     lamp on each. This is the one form in the pool you can identify from the
     far side of the room.

     Six rather than eight because the right-hand third of the face is where
     the ACTUAL question lives — video port or status display — and with
     eight caddies that third was full of drives and the discriminator was
     squeezed into the ear plate where the patch lead crossed it. */
  [0, 1].forEach(function (row) {
    for (var i = 0; i < 3; i++) {
      var cx = -2.15 + i * 1.15, cy = y + (row ? 0.4 : -0.4);
      face.push({ shape: "box", size: [1.02, 0.7, 0.12], pos: [cx, cy, FZ], r: 0.02, shade: P.feat });
      face.push({ shape: "box", size: [0.15, 0.56, 0.16], pos: [cx - 0.41, cy, FZ + 0.05], r: 0.02, shade: P.deep });
      face.push(led(cx + 0.36, cy, P.lamp));
    }
  });
  if (hasVideo) {
    /* Somewhere to plug a crash cart: a serial console and, next to it, a
       video output. Drawn big and out in the open, because whether this
       exists is the whole file-server-against-appliance question and a
       student should not have to hunt for it. */
    face.push(port(1.35, y + 0.34, 0.44, 0.26, P.deep));
    /* Tagged, so a test can assert that the thing the content SAYS is the
       discriminator is the thing that actually got drawn. Prose and geometry
       drifting apart is the failure mode this whole build guards against. */
    var vid = port(2.1, y + 0.34, 0.62, 0.34, P.deep); vid.videoPort = 1;
    face.push(vid);
    face.push({ shape: "box", size: [0.66, 0.38, 0.06], pos: [2.1, y + 0.34, FZ + 0.04], r: 0.01, shade: P.ear });
    face.push({ shape: "box", size: [0.07, 0.5, 0.06], pos: [1.1, y - 0.36, FZ], shade: P.vent,
      repeat: { count: 11, step: [0.17, 0, 0] } });
  } else {
    /* An appliance has a small status display and four navigation buttons
       instead — and no video output anywhere on it, because you are never
       meant to be standing in front of it. */
    face.push({ shape: "box", size: [1.7, 0.52, 0.1], pos: [1.75, y + 0.36, FZ], r: 0.02, shade: P.deep,
      statusPanel: 1 });
    face.push({ shape: "box", size: [1.5, 0.36, 0.06], pos: [1.75, y + 0.36, FZ + 0.05], r: 0.01, shade: P.glass });
    face.push({ shape: "cyl", size: [0.19, 0.08], pos: [1.2, y - 0.36, FZ], rot: [P2, 0, 0], seg: 8, shade: P.feat,
      repeat: { count: 4, step: [0.36, 0, 0] } });
  }
  return { chassis: [chassisBox(u, 2)], face: face, at: u, h: 2 };
}

function formAppliance(u, kind) {
  var y = uy(u, 1), P = pal(true);
  var face = [
    { shape: "box", size: [0.34, 0.7, 0.1], pos: [-W / 2 + 0.17, y, FZ], r: 0.01, shade: P.ear },
    { shape: "box", size: [0.34, 0.7, 0.1], pos: [W / 2 - 0.17, y, FZ], r: 0.01, shade: P.ear },
    port(2.5, y - 0.2, 0.3, 0.16, P.feat)               // console, on every appliance
  ];
  if (kind === "balancer") {
    /* A row of eight identical ports, and a pair set well apart from them
       for the link to the twin that takes over. */
    face.push({ shape: "box", size: [0.3, 0.24, 0.09], pos: [-2.35, y, FZ], r: 0.01, shade: P.feat,
      repeat: { count: 8, step: [0.42, 0, 0] } });
    face.push(port(1.72, y + 0.2, 0.28, 0.22, P.deep));
    face.push(port(2.06, y + 0.2, 0.28, 0.22, P.deep));
    face.push(led(2.5, y + 0.2, P.lamp));
  } else {
    /* The mail filter: two ports, and a single large drive bay, because a
       gateway that filters mail has to be able to hold what it is holding. */
    face.push(port(-2.4, y, 0.3, 0.24, P.feat));
    face.push(port(-2.02, y, 0.3, 0.24, P.feat));
    face.push({ shape: "box", size: [1.5, 0.6, 0.12], pos: [-0.4, y, FZ], r: 0.02, shade: P.deep });
    face.push({ shape: "box", size: [0.16, 0.48, 0.16], pos: [-1.06, y, FZ + 0.05], r: 0.02, shade: P.feat });
    face.push(led(0.28, y, P.lamp));
    face.push({ shape: "box", size: [0.07, 0.44, 0.06], pos: [1.0, y, FZ], shade: P.vent,
      repeat: { count: 7, step: [0.17, 0, 0] } });
  }
  return { chassis: [chassisBox(u, 1)], face: face, at: u, h: 1 };
}

function formEdge(u) {
  var y = uy(u, 1), P = pal(true);
  return {
    chassis: [chassisBox(u, 1)],
    face: [
      { shape: "box", size: [0.34, 0.7, 0.1], pos: [-W / 2 + 0.17, y, FZ], r: 0.01, shade: P.ear },
      { shape: "box", size: [0.34, 0.7, 0.1], pos: [W / 2 - 0.17, y, FZ], r: 0.01, shade: P.ear },
      /* One port on its own behind a raised divider: the side that faces
         out. Nothing says so in words — the divider says it. */
      port(-2.25, y, 0.32, 0.26, P.deep),
      { shape: "box", size: [0.08, 0.62, 0.14], pos: [-1.95, y, FZ], shade: P.glass },
      /* Two fibre cages, then the copper that goes down to the switch. */
      { shape: "box", size: [0.24, 0.3, 0.14], pos: [-1.5, y, FZ], r: 0.01, shade: P.deep },
      { shape: "box", size: [0.24, 0.3, 0.14], pos: [-1.18, y, FZ], r: 0.01, shade: P.deep },
      { shape: "box", size: [0.3, 0.24, 0.09], pos: [-0.5, y, FZ], r: 0.01, shade: P.feat,
        repeat: { count: 6, step: [0.42, 0, 0] } },
      port(2.5, y - 0.2, 0.3, 0.16, P.feat),
      led(2.5, y + 0.2, P.lamp)
    ],
    at: u, h: 1
  };
}

/* Not a rack device: a tower on the floor to the left of the frame. */
const TOWER = [-4.9, 2.4, 0];
function formBeige() {
  var P = pal(false);
  return {
    chassis: [
      { shape: "rbox", size: [1.9, 4.4, 2.0], pos: TOWER, r: 0.05, shade: 1.0 }
    ],
    face: [
      /* An optical bay and a floppy slot. Nothing else in this pool has a
         removable-media slot on the front of it. */
      { shape: "box", size: [1.45, 0.4, 0.1], pos: [TOWER[0], TOWER[1] + 1.6, 1.05], r: 0.02, shade: 0.7 },
      { shape: "box", size: [0.5, 0.1, 0.08], pos: [TOWER[0] + 0.4, TOWER[1] + 1.6, 1.1], shade: 0.35 },
      { shape: "box", size: [1.2, 0.26, 0.1], pos: [TOWER[0], TOWER[1] + 1.05, 1.05], r: 0.02, shade: 0.7 },
      { shape: "box", size: [0.9, 0.08, 0.08], pos: [TOWER[0] - 0.05, TOWER[1] + 1.05, 1.1], shade: 0.3 },
      { shape: "cyl", size: [0.3, 0.1], pos: [TOWER[0] - 0.55, TOWER[1] - 0.4, 1.05], rot: [P2, 0, 0], seg: 12, shade: 0.6 },
      { shape: "cyl", size: [0.14, 0.08], pos: [TOWER[0] + 0.2, TOWER[1] - 0.4, 1.05], rot: [P2, 0, 0], seg: 10, shade: P.lamp },
      { shape: "box", size: [0.07, 1.5, 0.06], pos: [TOWER[0] - 0.6, TOWER[1] - 1.4, 1.03], shade: 0.4,
        repeat: { count: 8, step: [0.17, 0, 0] } },
      /* And on its left flank, where the camera can still see them: a
         serial port and a parallel port. Two ports nothing modern has. */
      { shape: "box", size: [0.1, 0.22, 0.5], pos: [TOWER[0] - 0.98, TOWER[1] + 0.3, -0.3], r: 0.02, shade: 0.45 },
      { shape: "box", size: [0.1, 0.26, 1.0], pos: [TOWER[0] - 0.98, TOWER[1] - 0.25, -0.3], r: 0.02, shade: 0.45 }
    ],
    at: null, h: 0, from: [TOWER[0] + 0.9, TOWER[1] + 1.6, 0.4]
  };
}

/* Not a rack device: a field cabinet on the wall to the right. */
const CAB = [5.4, 4.6, 0];
function formDinRail() {
  var P = pal(false);
  var f = [];
  /* The rail itself, and the controller clipped onto it. */
  f.push({ shape: "box", size: [2.3, 0.16, 0.12], pos: [CAB[0], CAB[1] + 0.62, 0.4], shade: 0.55 });
  f.push({ shape: "rbox", size: [0.95, 0.9, 0.5], pos: [CAB[0] - 0.5, CAB[1] + 0.3, 0.42], r: 0.02, shade: 0.35 });
  f.push(led(CAB[0] - 0.78, CAB[1] + 0.55, P.lamp));
  f.push(led(CAB[0] - 0.6, CAB[1] + 0.55, P.lamp));
  f.push({ shape: "box", size: [0.3, 0.22, 0.1], pos: [CAB[0] - 0.5, CAB[1] - 0.02, 0.68], r: 0.01, shade: 0.5 });
  /* Two expansion modules beside it, then the terminal blocks: rows of
     screw terminals with field wiring dropping out of the bottom. Nothing
     in an office rack has screw terminals on it. */
  f.push({ shape: "rbox", size: [0.5, 0.9, 0.5], pos: [CAB[0] + 0.22, CAB[1] + 0.3, 0.42], r: 0.02, shade: 0.45 });
  f.push({ shape: "rbox", size: [0.5, 0.9, 0.5], pos: [CAB[0] + 0.78, CAB[1] + 0.3, 0.42], r: 0.02, shade: 0.45 });
  f.push({ shape: "box", size: [2.3, 0.4, 0.4], pos: [CAB[0], CAB[1] - 0.55, 0.4], r: 0.02, shade: 0.62 });
  f.push({ shape: "cyl", size: [0.13, 0.12], pos: [CAB[0] - 1.0, CAB[1] - 0.55, 0.62], rot: [P2, 0, 0], seg: 8, shade: 0.4,
    repeat: { count: 10, step: [0.22, 0, 0] } });
  return {
    chassis: [
      /* The cabinet: a back plate and a frame around it, so the controller
         reads as being INSIDE something rather than screwed to a wall. */
      { shape: "rbox", size: [3.1, 3.0, 0.3], pos: [CAB[0], CAB[1], 0.0], r: 0.03, shade: 1.0 },
      { shape: "box", size: [3.1, 0.2, 0.9], pos: [CAB[0], CAB[1] + 1.4, 0.35], shade: 0.86 },
      { shape: "box", size: [3.1, 0.2, 0.9], pos: [CAB[0], CAB[1] - 1.4, 0.35], shade: 0.86 },
      { shape: "box", size: [0.2, 3.0, 0.9], pos: [CAB[0] - 1.45, CAB[1], 0.35], shade: 0.86 },
      { shape: "box", size: [0.2, 3.0, 0.9], pos: [CAB[0] + 1.45, CAB[1], 0.35], shade: 0.86 }
    ],
    face: f, at: null, h: 0, from: [CAB[0] - 0.5, CAB[1] - 0.85, 0.5]
  };
}

/* Not a rack device: a sealed module on a bracket, off to the right of the
   frame and above head height. */
const MOD = [4.4, 6.3, 0];
function formModule(kind) {
  var P = pal(false);
  var face = [
    /* The bracket it is screwed to. */
    { shape: "box", size: [0.24, 1.0, 0.5], pos: [MOD[0] - 0.72, MOD[1], 0.1], r: 0.02, shade: 0.7 },
    /* One network port that also carries its power. */
    port(MOD[0] - 0.35, MOD[1] - 0.28, 0.3, 0.24, P.deep),
    led(MOD[0] + 0.35, MOD[1] - 0.28, P.lamp)
  ];
  if (kind === "print") {
    /* A second port, for the device it feeds — and the device, on the floor
       under it, so what the second port is FOR is visible rather than
       inferred. */
    face.push({ shape: "box", size: [0.34, 0.3, 0.12], pos: [MOD[0] + 0.05, MOD[1] - 0.28, 0.42], r: 0.02, shade: 0.35 });
  } else {
    /* A lens behind a dome, and nothing else. It only ever reports. */
    face.push({ shape: "sphere", size: [0.52], pos: [MOD[0], MOD[1] + 0.16, 0.42], seg: 16, shade: 0.75 });
    face.push({ shape: "cyl", size: [0.26, 0.14], pos: [MOD[0], MOD[1] + 0.16, 0.64], rot: [P2, 0, 0], seg: 14, shade: 0.25 });
  }
  return {
    chassis: [{ shape: "rbox", size: [1.2, 0.85, 0.8], pos: [MOD[0], MOD[1], 0.2], r: 0.06, shade: 1.0 }],
    face: face, at: null, h: 0, from: [MOD[0] - 0.6, MOD[1] - 0.4, 0.3]
  };
}

/* Which form each host wears, and what colour that form's chassis is. A
   beige tower is beige; a network appliance is dark; a rack server is
   steel. That is not decoration and it is not a hint about whether anything
   is broken — it is what the object is made of, and it is the first thing a
   technician uses to narrow down what they are looking at. */
const FORMS = {
  /* Light steel for a general-purpose server, near-black for a network
     appliance, beige for the tower, and off-white for the sealed module.
     Those are the colours these things genuinely are — and, just as
     importantly, none of them is the colour of the rack, so the device being
     asked about separates from its own background. Everything here was one
     shade of slate on the first cut and the answer was invisible inside the
     frame holding it. */
  u1:        { build: function () { return formGeneric1U(4); },        color: "#bcc4c9" },
  u2bays:    { build: function (h) { return formBays(2, h.key === "fileserver"); }, color: "#bcc4c9" },
  appliance: { build: function (h) { return formAppliance(5, h.key === "loadbalancer" ? "balancer" : "mail"); },
               color: "#242c33" },
  edge:      { build: function () { return formEdge(7); },             color: "#242c33" },
  beige:     { build: function () { return formBeige(); },             color: "#cabfa2" },
  dinrail:   { build: function () { return formDinRail(); },           color: "#9aa39a" },
  module:    { build: function (h) { return formModule(h.key === "printserver" ? "print" : "sensor"); },
               color: "#e4e3dd" }
};

/* ---------------------------------------------------------------------
   The rack itself, and what is always in it.

   Constant across every item: the frame, a patch panel at the top, the
   provider's fibre handoff above that, a switch in the middle, and blanking
   plates over the empty units. Only the device and its cabling change,
   which is what makes the comparison readable.
   --------------------------------------------------------------------- */
/* Nine units, not thirteen. The first cut was a full-height rack, and in a
   landscape canvas that meant a tall thin sliver down the middle with the top
   cropped and two thirds of the frame empty. A nine-unit wall cabinet is a
   real thing, it fills the view, and the ordering that matters — provider at
   the top, switch in the middle, equipment below — survives intact. */
const SWITCH_U = 6;
const PANEL_U = 8;
const DEMARC_U = 9;
const RACK_TOP = 0.55 + 9 * 0.9;

function rackBuild(taken) {
  var b = [];
  /* Uprights, base and top. */
  b.push({ shape: "box", size: [0.34, RACK_TOP, 1.5], pos: [-W / 2 - 0.17, RACK_TOP / 2, 0], r: 0.02, shade: 1.0 });
  b.push({ shape: "box", size: [0.34, RACK_TOP, 1.5], pos: [W / 2 + 0.17, RACK_TOP / 2, 0], r: 0.02, shade: 1.0 });
  b.push({ shape: "box", size: [7.0, 0.5, 1.9], pos: [0, 0.25, 0], r: 0.03, shade: 0.8 });
  /* A back panel. Without it the frame is see-through and the page's own
     background shows between every unit as a bright sliver — which on an
     open rack is honest and on a screen is just glare. A wall cabinet has a
     back anyway. */
  b.push({ shape: "box", size: [7.0, RACK_TOP, 0.2], pos: [0, RACK_TOP / 2, -0.72], r: 0.02, shade: 0.62 });
  b.push({ shape: "box", size: [7.0, 0.3, 1.9], pos: [0, RACK_TOP + 0.15, 0], r: 0.03, shade: 0.8 });
  /* Mounting holes down both rails, because a rack has them and because
     they give the frame a sense of scale. */
  b.push({ shape: "cyl", size: [0.11, 0.1], pos: [-W / 2 - 0.17, 0.75, 0.78], rot: [P2, 0, 0], seg: 6, shade: 0.55,
    repeat: { count: 18, step: [0, 0.45, 0] } });
  b.push({ shape: "cyl", size: [0.11, 0.1], pos: [W / 2 + 0.17, 0.75, 0.78], rot: [P2, 0, 0], seg: 6, shade: 0.55,
    repeat: { count: 18, step: [0, 0.45, 0] } });

  /* The provider's handoff, at the very top: a small box with a fibre pair
     leaving it. This is the outside of the building. */
  var dy = uy(DEMARC_U, 1);
  b.push({ shape: "rbox", size: [W, U - 0.09, 1.15], pos: [0, dy, 0], r: 0.03, shade: 0.72 });
  b.push({ shape: "box", size: [0.24, 0.3, 0.14], pos: [-0.3, dy, FZ], r: 0.01, shade: 0.4 });
  b.push({ shape: "box", size: [0.24, 0.3, 0.14], pos: [0.02, dy, FZ], r: 0.01, shade: 0.4 });

  /* Patch panel: two rows of twelve. */
  var py = uy(PANEL_U, 1);
  b.push({ shape: "rbox", size: [W, U - 0.09, 1.15], pos: [0, py, 0], r: 0.03, shade: 0.9 });
  b.push({ shape: "box", size: [0.3, 0.22, 0.1], pos: [-2.4, py + 0.16, FZ], r: 0.01, shade: 0.5,
    repeat: { count: 12, step: [0.42, 0, 0] } });
  b.push({ shape: "box", size: [0.3, 0.22, 0.1], pos: [-2.4, py - 0.16, FZ], r: 0.01, shade: 0.5,
    repeat: { count: 12, step: [0.42, 0, 0] } });

  /* The switch: one row of twenty-four with an uplink pair at the end. */
  var sy = uy(SWITCH_U, 1);
  b.push({ shape: "rbox", size: [W, U - 0.09, 1.15], pos: [0, sy, 0], r: 0.03, shade: 0.66 });
  b.push({ shape: "box", size: [0.19, 0.22, 0.1], pos: [-2.5, sy + 0.14, FZ], r: 0.01, shade: 0.42,
    repeat: { count: 12, step: [0.4, 0, 0] } });
  b.push({ shape: "box", size: [0.19, 0.22, 0.1], pos: [-2.5, sy - 0.14, FZ], r: 0.01, shade: 0.42,
    repeat: { count: 12, step: [0.4, 0, 0] } });
  b.push({ shape: "box", size: [0.26, 0.3, 0.14], pos: [2.55, sy, FZ], r: 0.01, shade: 0.3 });

  /* Blanking plates over everything else, so the empty units read as empty
     rather than as missing geometry. */
  for (var u = 1; u <= DEMARC_U; u++) {
    if (taken[u]) continue;
    /* Darker than the frame, not lighter. At shade 1.12 the empty units were
       the brightest thing in the picture and the device being asked about
       disappeared between them. */
    b.push({ shape: "box", size: [W, U - 0.16, 0.16], pos: [0, uy(u, 1), 0.5], r: 0.02, shade: 0.78 });
  }
  return b;
}

/* ---------------------------------------------------------------------
   Cabling.

   A patch lead dressed the way a rack is dressed: out of the port, across
   to the side, up or down the upright, and back in. Right angles, because
   that is what a tidy rack looks like and because a diagonal in a merged
   opaque mesh reads as a mistake.
   --------------------------------------------------------------------- */
const T = 0.16;   // lead cross-section

function runY(x, y0, y1, z) {
  return { shape: "box", size: [T, Math.abs(y1 - y0), T], pos: [x, (y0 + y1) / 2, z], r: 0.05, shade: 1.0 };
}
function runX(x0, x1, y, z) {
  return { shape: "box", size: [Math.abs(x1 - x0), T, T], pos: [(x0 + x1) / 2, y, z], r: 0.05, shade: 1.0 };
}
function runZ(x, y, z0, z1) {
  return { shape: "box", size: [T, T, Math.abs(z1 - z0)], pos: [x, y, (z0 + z1) / 2], r: 0.05, shade: 1.0 };
}

/* One lead from a point on a device's face to a point on another device's
   face, dressed out to the side rail at `lane`. */
function lead(from, to, lane, shade) {
  var z = 0.95;
  var out = [
    runZ(from[0], from[1], from[2], z),
    runX(from[0], lane, from[1], z),
    runY(lane, from[1], to[1], z),
    runX(lane, to[0], to[1], z),
    runZ(to[0], to[1], z, to[2])
  ];
  if (shade !== undefined) out.forEach(function (p) { p.shade = shade; });
  return out;
}

export function rackModel(D) {
  var it = D.item;
  var form = FORMS[it.form];
  var made = form.build(it);

  var taken = {};
  taken[SWITCH_U] = 1; taken[PANEL_U] = 1; taken[DEMARC_U] = 1;
  if (made.at) for (var k = 0; k < made.h; k++) taken[made.at + k] = 1;

  var sy = uy(SWITCH_U, 1);
  var links = [];
  var decor = [];
  var linkNote;

  if (it.form === "edge") {
    /* Fibre up to the provider's handoff, copper down to the switch. The
       box is BETWEEN the outside and everything else, and the cabling is
       the only thing that says so. */
    var ey = uy(made.at, 1);
    links = links
      .concat(lead([-1.34, ey, FZ], [-0.14, uy(DEMARC_U, 1), FZ], -3.4, 0.72))
      .concat(lead([0.4, ey, FZ], [-0.5, sy + 0.14, FZ], 3.4));
    /* Describes what is drawn and stops there. An earlier version finished
       the thought for the student — "everything the site sends or receives
       goes through this device" — which is the answer to the placement
       question written out in the panel. */
    linkNote = "A fibre pair going up out of it, and copper going down out of it. Trace which of " +
      "the two ends nearer the outside of the building, and what is on the other end of each.";
  } else if (it.form === "beige" || it.form === "dinrail" || it.form === "module") {
    /* Into the near end of the switch, not the far one. Routed to the far
        end, an off-rack device's lead ran horizontally across the whole face
        of the rack and hid everything behind it. */
    var side = made.from[0] < 0 ? -1 : 1;
    links = links.concat(lead(made.from, [side * 2.1, sy - 0.14, FZ], side * 4.2));
    if (it.form === "dinrail") {
      /* Field wiring leaving the bottom of the terminal blocks and going
         off to whatever it controls. Deliberately not to the rack. */
      links.push(runY(CAB[0] - 0.8, CAB[1] - 1.9, CAB[1] - 0.75, 0.6));
      links.push(runY(CAB[0] - 0.4, CAB[1] - 1.9, CAB[1] - 0.75, 0.6));
      links.push(runY(CAB[0] + 0.4, CAB[1] - 1.9, CAB[1] - 0.75, 0.6));
      links.push(runY(CAB[0] + 0.8, CAB[1] - 1.9, CAB[1] - 0.75, 0.6));
      /* What the field wiring actually goes to. Scenery rather than part of
         the cabling, or it comes out cable-coloured and reads as a loop of
         wire instead of as the thing being controlled. */
      decor.push({ shape: "rbox", size: [1.5, 0.7, 0.9], pos: [CAB[0], CAB[1] - 2.3, 0.4], r: 0.05,
        shade: 1.0, color: "#6d7a68" });
      linkNote = "One lead back to the rack, and four heavier wires leaving the bottom of the " +
        "terminal blocks to the box beneath it. Count how many of its cables go to the rack and " +
        "how many do not.";
    } else if (it.form === "beige") {
      linkNote = "One long lead from the floor up to an ordinary switch port, and nothing else. " +
        "It is patched into the same switch as everything else in this rack.";
    } else {
      /* The print server's second cable, to the device it feeds. */
      if (it.key === "printserver") {
        links.push(runY(MOD[0] + 0.05, 4.6, MOD[1] - 0.4, 0.75));
        decor.push({ shape: "rbox", size: [1.9, 1.3, 1.5], pos: [MOD[0] + 0.4, 3.9, 0.4], r: 0.06,
          shade: 1.0, color: "#cfccc4" });
        decor.push({ shape: "box", size: [1.5, 0.12, 0.5], pos: [MOD[0] + 0.4, 3.55, 1.0],
          shade: 0.55, color: "#cfccc4" });
        linkNote = "One lead to a switch port, and a second, shorter cable going down to the " +
          "machine sitting under it. Two cables out of a box this small is worth noticing, and so " +
          "is what the second one lands on.";
      } else {
        linkNote = "One lead, and only one. Nothing else is connected to it at all \u2014 no second " +
          "cable, no separate power. Note where it is mounted as well as what reaches it.";
      }
    }
  } else {
    var y = uy(made.at, made.h);
    /* On a 2U device the lead leaves from the lower half, so it does not run
       across the port cluster or the status display on the upper half —
       which is the one part of the face the student needs to see. */
    links = links.concat(lead([2.55, y - (made.h > 1 ? 0.5 : 0), FZ], [2.1, sy + 0.14, FZ], 3.4));
    if (it.form === "appliance" && it.key === "loadbalancer") {
      /* The row of identical servers it fronts, and a lead to each. Nothing
         else in the rack has a fan-out like this. */
      [1, 2, 3].forEach(function (n) {
        var ry = uy(n + 1, 1);
        links = links.concat(lead([-2.2, y, FZ], [-2.2, ry, FZ], -3.4, 0.86));
      });
      linkNote = "One lead up to the switch, and three more going down to three machines below " +
        "it that are identical to each other. Count them, and notice that they are the same.";
    } else if (it.form === "appliance") {
      links = links.concat(lead([-2.2, y, FZ], [-2.2, uy(DEMARC_U, 1), FZ], -3.4, 0.72));
      linkNote = "A lead to the switch, and a second one running all the way up to the box at " +
        "the top of the rack. Two leads going in opposite directions is worth a second look: " +
        "follow where each one ends.";
    } else {
      linkNote = "One lead to a switch port. Nothing about the cabling narrows this down, which " +
        "means the log beside the plan is where the answer is.";
    }
  }

  /* Load balancer only: the row of identical servers it fronts has to exist
     as geometry or the fan-out lands on blanking plates. */
  var extra = [];
  if (it.key === "loadbalancer") {
    [2, 3, 4].forEach(function (u) {
      taken[u] = 1;
      extra.push({ shape: "rbox", size: [W, U - 0.09, 1.15], pos: [0, uy(u, 1), 0], r: 0.03, shade: 0.78 });
      extra.push({ shape: "box", size: [0.07, 0.5, 0.06], pos: [-1.6, uy(u, 1), FZ], shade: 0.42,
        repeat: { count: 18, step: [0.17, 0, 0] } });
    });
  }

  return {
    kind: "drill",
    title: "One rack, one device in question",
    caption: "The same rack every time: the provider's handoff at the top, a patch panel under " +
      "it, a switch in the middle. Only the device being asked about changes, and where its " +
      "cables go. Half of this pool can be identified from the chassis and the cabling alone — " +
      "drives, ports, whether it is even in the rack. The other half is eight identical 1U boxes, " +
      "and for those the connection log beside the rack is the only evidence there is.",
    board: { size: [15, 0.4, 5.4], pos: [0, -0.35, 0], color: "#3f474d",
      build: [{ shape: "rbox", size: [15, 0.4, 5.4], pos: [0, 0, 0], r: 0.12, shade: 1.0 }], scale: 1 },
    decor: decor,
    parts: [
      { key: "device", label: "The device in question", build: made.chassis, finish: "matte", scale: 1,
        pos: [0, 0, 0], color: form.color,
        spec: made.at ? made.h + "U, racked" : "Not a rack device",
        note: made.at
          ? "It is in the rack, which already rules out the three in this pool that are not. Its " +
            "height and what it is made of narrow it further before you read a single word."
          : "It is not in the rack. Three of the sixteen hosts in this pool are not rack " +
            "equipment at all, and noticing that removes thirteen of them in one look." },
      { key: "face", label: "Its front panel", build: made.face, finish: "matte", scale: 1,
        pos: [0, 0, 0], color: "#7d8a92",
        spec: "Bays, ports, lamps and whatever else is on the front",
        note: "The one thing worth looking for first is a video output. A general-purpose server " +
          "has somewhere to plug a screen because somebody may have to stand in front of it; an " +
          "appliance has a small display and buttons instead, because you are never meant to." },
      { key: "links", label: "What it is cabled to", build: links, finish: "matte", scale: 1,
        pos: [0, 0, 0], color: "#2f5fbf",
        spec: "Every lead in or out of the device",
        note: linkNote },
      { key: "rack", label: "The rack around it", build: rackBuild(taken).concat(extra), finish: "matte",
        scale: 1, pos: [0, 0, 0], color: "#6d777e",
        spec: "Frame, handoff, patch panel, switch, blanking plates",
        note: "This never changes. The box at the very top is the line from the provider, the one " +
          "under it is the patch panel, and the one with twenty-four ports is the switch. Anything " +
          "above the switch is nearer the outside world than anything below it." }
    ],
    camera: { dist: 15.5, yaw: 0.42, pitch: 0.16, target: [0, 4.3, 0], min: 6, max: 34 }
  };
}
