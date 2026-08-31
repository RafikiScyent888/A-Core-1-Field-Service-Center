/* =====================================================================
   Field Service Center — the floor plan for objective 2.2

   The first model in this build that draws a phenomenon rather than an
   object, and it is here because the object would have been useless. Every
   access point in the pool is the same white disc; what differs is where
   the signal gets to, and that is only visible on a plan.

   So: a floor with real internal walls, an access point on the ceiling, and
   the coverage drawn the way a site survey draws it — as contour rings on
   the floor at the distances where the signal drops through each threshold.
   A short-range band gets small rings that stop at the first wall. A
   long-range band gets rings that reach the far corner.

   Same rule as every other model here: NOTHING NAMES THE TECHNOLOGY. The
   part is "the access point", the rings are labelled by signal level and
   not by band, and a student who reads every word still has to work out
   what is on the ceiling from how far it got.

   The rings are solid geometry rather than a translucent dome, because the
   scene engine merges everything into one opaque mesh — and because a
   survey is drawn as contours on a plan anyway, which is the artefact a
   technician actually reads.

   Split into six parts rather than drawn as one. A part carries a single
   material colour and `shade` can only lighten or darken it, so a
   one-part plan came out as six shades of the same grey: the car park, the
   floor slab, the walls, the access point and the contour rings all read as
   one object, and on a page built for damaged sight that is the same as
   drawing nothing. Each part is now a different THING — ground, floor,
   walls, access point, survey, survey points — so each gets its own colour
   and its own wire cage. The colours say what a part IS. None of them says
   anything about the band, which is what the student has to work out.
   ===================================================================== */

import { spreadFor } from "./drillwireless.js";

const P2 = Math.PI / 2;

/* A wall, as a low solid on the plan. Height is deliberately short so the
   plan reads from above rather than becoming a room you look into — but not
   as short as the first cut, where a 0.28-thick wall on a 21-unit plan was
   a hairline at the default zoom. */
function wall(x, z, len, horiz) {
  return {
    shape: "box",
    size: horiz ? [len, 1.1, 0.34] : [0.34, 1.1, len],
    pos: [x, 0.75, z], r: 0.02, shade: 1.0, wall: 1
  };
}

/* A contour ring: where the signal passes through one threshold. Drawn as a
   raised cord on the floor, which is how a survey prints it. */
function contour(radius, shade) {
  return {
    /* Lifted clear of the floor slab rather than sunk into it. At y 0.08 the
       tube was half-buried in the slab and read as a scratch in the floor;
       sitting on top it reads as a line drawn on the plan. */
    shape: "torus", size: [radius * 2, 0.3], pos: [0, 0.32, 0],
    rot: [P2, 0, 0], seg: 48, seg2: 8, shade: shade, contour: 1
  };
}

/* How far each threshold falls, per band. These are the whole point of the
   model: the ratios are what a student reads the band off. */
const SPREAD = {
  long:  [2.6, 4.4, 6.2],    // 2.4 GHz — through walls, reaches the corners
  short: [1.7, 2.7, 3.5],    // 5 or 6 GHz — a room, not a floor
  /* NFC and RFID: the range IS the security model, so it has to stay
     obviously tiny against a 15-unit floor. It was 0.5, which put the whole
     ring inside the 1.1-wide access point disc — from overhead the emitter
     hid its own coverage and the one thing the item is about was invisible.
     0.75 clears the disc and is still a rounding error next to the 1.7 a
     short band gets. */
  tiny:  [0.75],
  /* 60 GHz. Smaller than a 5 GHz room and with almost nothing between the
     rings, because it does not fade through a wall — it stops. Drawing it
     with the "short" rings would say it degrades gracefully, which is the
     one thing this technology does not do. */
  sixty: [1.0, 1.25, 1.45],
  /* An active tag transmits instead of reflecting, so it covers the site
     rather than a doorway — wider even than 2.4 GHz, which is the whole of
     what separates it from the passive kind it shares a name with. */
  wide:  [3.4, 5.4, 7.4],
  beam:  null                // aimed, not broadcast: drawn as a beam instead
};

/* Where the access point hangs, and therefore where every ring is centred. */
const AP = [-3.2, -1.0];

export function floorPlanModel(D) {
  var it = D.item;
  var kind = spreadFor(it);

  /* ---- the ground -------------------------------------------------- */
  /* The site, not just the building. A 2.4 GHz contour genuinely reaches
     past the outer wall and into the car park, and that is worth seeing
     rather than cropping — "your wireless does not stop at the wall" is
     half of why the band choice matters. So the ground extends beyond the
     walls and the rings are allowed to cross them.

     Two plates, not one: the car park, and a paving band inside it. The
     band matters because the outer wall is dark and the car park is dark,
     so without a lighter strip on the outside the building's own edge
     disappears into the ground it stands on. */
  var site = [
    { shape: "plate", size: [21, 0.22, 15], pos: [0, 0, 0], shade: 1.0 },
    { shape: "plate", size: [18.4, 0.04, 12.8], pos: [0, 0.13, 0], shade: 1.3 }
  ];

  /* ---- the floor slab ---------------------------------------------- */
  var floor = [
    { shape: "plate", size: [15, 0.06, 11], pos: [0, 0.16, 0], shade: 1.0 }
  ];

  /* ---- the walls ---------------------------------------------------- */
  /* An open floor with two rooms partitioned off it and a corridor between
     them, so "through one wall" and "through two walls" are places you can
     actually point at. */
  var walls = [
    wall(0, -5.4, 15, true), wall(0, 5.4, 15, true),
    wall(-7.4, 0, 11, false), wall(7.4, 0, 11, false),
    wall(2.2, -1.6, 7.6, false),
    wall(4.8, -1.6, 5.2, true),
    wall(2.2, 3.2, 10.4, true)
  ];

  /* ---- the access point, on the ceiling of the open floor ----------- */
  /* Hung above the wall line, on a drop, so it reads as ceiling-mounted
     rather than as a disc lying on the carpet. */
  var ap = [
    { shape: "cyl", size: [1.1, 0.22], pos: [AP[0], 1.5, AP[1]], seg: 22, shade: 1.0, ap: 1 },
    { shape: "cyl", size: [0.34, 0.14], pos: [AP[0], 1.66, AP[1]], seg: 14, shade: 0.86 },
    { shape: "cyl", size: [0.1, 0.9], pos: [AP[0], 2.15, AP[1]], seg: 8, shade: 0.7 }
  ];

  /* ---- the survey ---------------------------------------------------- */
  var survey = [];
  if (kind === "beam") {
    /* Aimed rather than broadcast: a narrow corridor of signal leaving the
       building, which is exactly what a directional link looks like drawn.
       It leaves the building, which is the point of a directional link —
       but it has to stay on the board, so it stops at the plan's edge
       rather than flying off into nothing. */
    survey.push(
      { shape: "box", size: [0.7, 0.28, 8.4], pos: [AP[0], 0.32, 2.0], r: 0.05, shade: 0.85, contour: 1 },
      { shape: "cone", size: [0.1, 1.1, 1.0], pos: [AP[0], 0.6, -2.1], rot: [-P2, 0, 0], seg: 14, shade: 1.15 }
    );
  } else {
    /* Inner ring darkest: strongest signal, heaviest line. That is the way
       a contour plot is read and it survives being looked at in greyscale,
       which matters more here than it does anywhere else in the build. */
    var shades = [0.62, 0.88, 1.16];
    SPREAD[kind].forEach(function (r, i) {
      var c = contour(r, shades[i] || 1.0);
      c.pos = [AP[0], 0.32, AP[1]];
      survey.push(c);
    });
  }

  /* ---- survey points ------------------------------------------------- */
  /* Four of them, marked so the readings beside the plan have somewhere to
     refer to. Numbered rather than named, because naming them would start
     describing what is found there. */
  var points = [];
  [[AP[0], AP[1]], [1.0, -1.0], [4.2, -3.0], [6.2, 4.4]].forEach(function (p) {
    points.push({ shape: "cyl", size: [0.5, 0.16], pos: [p[0], 0.24, p[1]], seg: 12, shade: 1.0, point: 1 });
    points.push({ shape: "cyl", size: [0.26, 0.5], pos: [p[0], 0.55, p[1]], seg: 10, shade: 0.78 });
  });

  function part(key, label, build, color, spec, note) {
    return {
      key: key, label: label, build: build, finish: "matte", scale: 1,
      pos: [0, 0, 0], color: color, spec: spec, note: note
    };
  }

  return {
    kind: "drill",
    title: "One floor, one access point",
    caption: "A plan of the floor with the access point on the ceiling of the open area, and the " +
      "survey drawn the way a survey is drawn: rings where the signal passes through each " +
      "threshold. The ground runs past the outer wall on purpose, because a long-range band " +
      "genuinely reaches the car park and a short one does not get out of the room. Nothing here " +
      "says what is on the ceiling — but where the rings stop, and which walls they cross, is " +
      "decided by the band before anything else.",
    board: { size: [23, 0.3, 17], pos: [0, -0.8, 0], color: "#4c565f",
      build: [{ shape: "rbox", size: [23, 0.3, 17], pos: [0, 0, 0], r: 0.12, shade: 1.0 }], scale: 1 },
    decor: [],
    parts: [
      /* The survey leads, because it is the part the student is actually
         being asked to read. Everything after it is the room it is drawn
         on. */
      /* The spec line says how many lines are drawn and nothing about how far
         they got. An earlier version printed "outer edge at 6.2 units", which
         is the single number the whole drill is asking the student to read
         off the plan — handing it over in the legend turned reading a survey
         into reading a caption. */
      part("survey", "The survey", survey, "#2f5fbf",
        kind === "beam"
          ? "One aimed path leaving the building, not a ring"
          : (SPREAD[kind].length === 1
              ? "One threshold drawn, where it falls"
              : SPREAD[kind].length + " thresholds drawn, each where it falls"),
        "Read the rings against the walls. How far the signal gets before it drops a " +
        "threshold, and whether it survives a partition at all, is the trade this objective is " +
        "about — and the readings beside the plan give you the numbers to go with it. The " +
        "heaviest line is the strongest signal; each line out is one threshold down."),
      part("site", "The car park", site, "#4a4744",
        "Ground outside the building, 21 by 15",
        "Drawn because coverage does not stop at the wall. If a ring crosses this, the signal " +
        "is available to anyone standing on it — which is a security question as well as a " +
        "coverage one."),
      part("floor", "The floor slab", floor, "#c6c0b1",
        "The building footprint, 15 by 11",
        "The open area is the left two thirds of the floor. The access point hangs over it."),
      part("walls", "The walls", walls, "#2e3a42",
        "Outer walls plus two partitions and a corridor",
        "Two internal partitions on the right, which is what makes “through one wall” and " +
        "“through two walls” places you can point at rather than phrases in a book."),
      part("ap", "The access point", ap, "#ecebe4",
        "Ceiling-mounted, on a drop, over the open area",
        "Every access point in this drill looks exactly like this one. Nothing about the box " +
        "tells you what it is running — only the survey does."),
      part("points", "The survey points", points, "#a8480f",
        "Four positions where a reading was taken",
        "The readings listed beside the plan were taken standing on these. Point 1 is under " +
        "the access point; the rest walk away from it and through the partitions.")
    ],
    /* Nearly square-on and steeply tilted, because this is a plan and a plan
       is read from above. Enough yaw left in it that the walls still have
       thickness and the access point still hangs off a ceiling. */
    camera: { dist: 24, yaw: 0.26, pitch: 1.02, target: [0, 0, 0], min: 10, max: 46 }
  };
}
