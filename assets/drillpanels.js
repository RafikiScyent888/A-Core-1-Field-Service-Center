/* =====================================================================
   Field Service Center — objective 3.1

   "Compare and contrast display components and attributes."

   The book already troubleshoots displays on 5.3, and that track is built.
   This is the other half and it is a different skill entirely: nothing is
   broken here. There is a panel, and the question is what KIND of panel and
   what that costs you — because every display technology in this pool is a
   set of trade-offs somebody accepted on purpose.

   THE ORGANISING IDEA: A DISPLAY IS A STACK, AND THE STACK IS THE ANSWER.
   Cut one in half and you can see what it is. A panel with a backlight
   behind it, an edge-lit sheet with a light guide, a panel with no
   backlight at all because the pixels make their own light, a mirror and a
   lamp throwing an image across a room. Where the light comes from and how
   many layers sit in front of it decides everything the exam asks about:
   how black the blacks are, what happens when you look at it from the side,
   how thick it is and what it draws.

   So the model draws each one IN CROSS-SECTION, layer by layer, and the
   panel beside it carries measurements a technician would take with an
   instrument rather than read off a box.

   THE ATTRIBUTES, kept separate from the components on purpose, because the
   book names both and candidates run them together: resolution, aspect
   ratio, refresh rate, brightness and response are properties of a display
   and NOT technologies. They are asked about here as what a given stack can
   and cannot do.
   ===================================================================== */

export const PANELS = [
  {
    key: "twisted", name: "Twisted nematic LCD", kind: "lcd",
    layers: ["a backlight across the whole back", "a diffuser", "the liquid crystal layer",
      "two polarisers, one each side"],
    light: "A separate backlight behind everything. The crystal only blocks light; it never makes any",
    strength: "It switches faster than anything else in this pool, and it is cheap",
    weakness: "Colour and brightness shift the moment you move off axis — look at it from the " +
      "side and it washes out or inverts",
    black: "Grey. The backlight is always on, so the darkest it gets is however much light leaks " +
      "through a closed crystal",
    use: "Somewhere fast response matters more than how it looks — and somewhere only one person " +
      "is ever sitting straight in front of it",
    look: "A stack with a lamp behind it, and a picture that changes colour as you walk past.",
    lookalike: "ips",
    lookalikeWhy: "The same sandwich, the same backlight and often the same chassis. The crystals " +
      "are aligned differently and that one difference decides whether the picture survives being " +
      "looked at from an angle — which is the entire reason to pay more."
  },
  {
    key: "ips", name: "In-plane switching LCD", kind: "lcd",
    layers: ["a backlight across the whole back", "a diffuser", "the liquid crystal layer",
      "two polarisers, one each side"],
    light: "A separate backlight behind everything. The crystal only blocks light; it never makes any",
    strength: "The picture holds its colour from almost any angle, which is why it is what gets " +
      "specified wherever more than one person looks at the screen",
    weakness: "It switches more slowly than the cheap alternative, and it needs a brighter " +
      "backlight to get to the same brightness — so it draws more",
    black: "Grey, for the same reason as any panel with a lamp behind it",
    use: "Anywhere the picture is looked at by more than one person, or where colour has to be " +
      "right — design work, medical images, a shared screen in a meeting room",
    look: "A stack with a lamp behind it, and a picture that does not change as you walk past.",
    lookalike: "twisted",
    lookalikeWhy: "Identical from the front while you are sitting still. Stand up and walk to one " +
      "side: one of them stays the same and the other goes grey or inverts, and that is the whole " +
      "of the difference somebody paid for."
  },
  {
    key: "vaa", name: "Vertical alignment LCD", kind: "lcd",
    layers: ["a backlight across the whole back", "a diffuser", "the liquid crystal layer",
      "two polarisers, one each side"],
    light: "A separate backlight behind everything. The crystal only blocks light; it never makes any",
    strength: "It closes further than the others, so the dark parts of the picture are genuinely " +
      "darker than any other panel with a lamp behind it",
    weakness: "It is slower still than the wide-angle sort, and dark detail smears when it moves",
    black: "Much closer to black than the others in its family, though still not black — the lamp " +
      "is still on behind it",
    use: "Watching things in a dark room, where contrast matters more than how fast the picture " +
      "changes",
    look: "A stack with a lamp behind it whose dark scenes look genuinely dark until something " +
      "moves quickly.",
    lookalike: "ips",
    lookalikeWhy: "Both are sold on picture quality and both hold up better than the cheap sort. " +
      "One is bought for its angles and the other for its blacks, and each is the wrong answer to " +
      "the other's problem."
  },
  {
    key: "oled", name: "OLED", kind: "emissive",
    layers: ["the emissive layer — the pixels themselves", "a thin front glass"],
    light: "There is no backlight. Each pixel makes its own light and a pixel showing black is " +
      "simply switched off",
    strength: "Black is actually black, because nothing is lit. It is also very thin and it can " +
      "be bent, because there is no lamp assembly behind it",
    weakness: "A static image left on it long enough marks the panel permanently, and the " +
      "brightest whites are dimmer than a good backlit panel can manage",
    black: "Black. The pixel is off and no light is being produced at that point at all",
    use: "Handsets, and anywhere thinness or a genuinely black black matters more than the risk " +
      "of a menu bar being burned into the panel",
    look: "A stack with nothing behind the pixels — no lamp, no diffuser, no light guide. Two " +
      "layers and that is the whole of it.",
    lookalike: "vaa",
    lookalikeWhy: "Both are bought for their blacks and in a lit room they look the same. Turn " +
      "the lights off and show something dark: one goes black and the other goes very dark grey, " +
      "and only one of the two has anything behind the pixels."
  },
  {
    key: "edgelit", name: "Edge-lit LED backlight", kind: "backlight",
    layers: ["a row of emitters along one edge", "a light guide that spreads them across the back",
      "a diffuser", "the panel in front of it"],
    light: "Emitters along one edge only, with a sheet behind the panel that carries the light " +
      "across it",
    strength: "It makes the thinnest possible backlit display, because the lamps are not behind " +
      "the picture at all",
    weakness: "The light is never quite even. The edges are brighter than the middle and a dark " +
      "scene shows clouding, and there is nothing to be done about it",
    black: "Uneven grey — and the unevenness is the complaint that brings a technician out",
    use: "Thin panels and anywhere the depth of the chassis is the constraint",
    look: "Emitters along one edge and a clear sheet spreading their light sideways behind the " +
      "picture.",
    lookalike: "directlit",
    lookalikeWhy: "Both are LED backlights and both get sold with the same three letters on the " +
      "box. Take the back off: lamps along one edge and a light guide, or lamps in a grid across " +
      "the whole back. One is thin and uneven; the other is thicker and can dim one part of the " +
      "picture without dimming the rest."
  },
  {
    key: "directlit", name: "Direct-lit LED backlight", kind: "backlight",
    /* `array` says the emitters are behind the whole panel rather than along
       one edge, and `zones` how many groups can be dimmed apart. The model
       reads both. It used to decide edge-or-array from a list of keys, so a
       backlight added afterwards was drawn along one edge whatever its own
       reading said about it. */
    array: true, zones: 3, fine: false,
    layers: ["a grid of emitters across the whole back", "a diffuser", "the panel in front of it"],
    light: "Emitters spread across the entire back, in zones that can be dimmed separately",
    strength: "Even light, and the ability to turn down the lamps behind the dark parts of the " +
      "picture while leaving the bright parts alone",
    weakness: "It is thicker, and the dimming shows as a halo around anything bright on a dark " +
      "background",
    black: "Very dark where a zone is turned down, and grey again the moment anything bright " +
      "appears in that zone",
    use: "Where picture quality justifies the depth — televisions, and monitors bought for " +
      "contrast rather than for a thin bezel",
    look: "A grid of emitters covering the whole back, with a diffuser between them and the panel.",
    lookalike: "edgelit",
    lookalikeWhy: "The same technology in the same words on the same box. The difference is where " +
      "the lamps are, which decides how thick it is and whether it can dim part of the picture — " +
      "and you cannot tell from the front until you show it something dark."
  },
  {
    key: "dlp", name: "DLP projector", kind: "projector",
    layers: ["a lamp", "a colour wheel", "a chip covered in tiny mirrors", "a lens"],
    light: "One lamp, thrown off a chip covered in mirrors that tilt thousands of times a second, " +
      "and out through a lens onto a surface somewhere else",
    strength: "There is no panel at all, so the image can be as large as the room allows and the " +
      "device can be small",
    weakness: "It needs a dark room and a surface, the lamp is a consumable with a life measured " +
      "in hours, and some people see colour breaking up as the wheel spins",
    black: "Whatever the wall is when the lamp is throwing nothing at it, which is not black in " +
      "any room with a light on",
    use: "A room where the image needs to be bigger than any panel anybody would buy, and where " +
      "the lights can be turned down",
    look: "No screen anywhere on the device. A lens on the front and a lamp inside it, and the " +
      "picture is on a wall.",
    lookalike: "lcdprojector",
    lookalikeWhy: "Two boxes with a lens on the front doing the same job in the same room. One " +
      "bounces light off mirrors and the other shines it through panels, and what you notice is " +
      "the mirrors' colour flicker against the panels' visible pixel grid."
  },
  {
    key: "lcdprojector", name: "LCD projector", kind: "projector",
    layers: ["a lamp", "three small LCD panels, one per colour", "a prism that recombines them",
      "a lens"],
    light: "One lamp shone through three small panels, one for each colour, recombined and pushed " +
      "out of a lens",
    strength: "Bright, colour-accurate and free of the flicker some people see on the mirror sort",
    weakness: "The panels have a visible grid between the pixels, the filters fade with hours, " +
      "and dust inside shows up as a permanent mark on every image it throws",
    black: "Grey — the lamp is on and the panels leak, exactly as they do in a monitor",
    use: "A room that cannot be made properly dark, where raw brightness matters more than how " +
      "black the blacks are",
    look: "No screen on the device. A lens, a lamp, and a filter you have to clean.",
    lookalike: "dlp",
    lookalikeWhy: "Identical shape, identical job and often identical price. Look at a white " +
      "image very closely for a grid, or at a bright edge on a dark background for a flicker of " +
      "colour, and you will know which one you have."
  },
  {
    key: "touchcap", name: "Capacitive touch layer", kind: "overlay",
    layers: ["a grid of transparent conductors", "the cover glass", "the display underneath it"],
    light: "None of its own. It is a layer in front of a display and it produces nothing",
    strength: "It reads more than one finger at once, needs no pressure at all, and the glass in " +
      "front of it can be as tough as you like",
    weakness: "It needs a conductor to touch it, which is why it ignores a gloved hand and a " +
      "stylus that is not made for it, and why a wet screen behaves as if somebody is touching it " +
      "everywhere",
    black: "Not applicable. It shows nothing — it sits in front of something that does",
    use: "Anything anybody touches with a bare finger, which is most things now",
    look: "A transparent grid in front of the display, with the cover glass in front of that. It " +
      "has no light of its own anywhere in the stack.",
    lookalike: "touchres",
    lookalikeWhy: "Both are layers in front of a display and both are called touchscreens. One " +
      "senses a conductor and one senses pressure, and the difference decides whether somebody in " +
      "gloves on a loading bay can use it at all."
  },
  {
    key: "touchres", name: "Resistive touch layer", kind: "overlay",
    layers: ["two conductive sheets with a gap between them", "a flexible top surface",
      "the display underneath it"],
    light: "None of its own. It is a layer in front of a display and it produces nothing",
    strength: "Anything that presses it works — a gloved hand, a pen, the corner of a clipboard — " +
      "and it is cheap and robust",
    weakness: "One point at a time, a softer surface that scratches, and a layer that takes some " +
      "of the light out of the picture behind it",
    black: "Not applicable. It shows nothing — it sits in front of something that does",
    use: "Industrial panels, outdoor terminals and anywhere people are wearing gloves or using " +
      "whatever is in their hand",
    look: "Two sheets with a gap between them and a top surface that flexes when you press it.",
    lookalike: "touchcap",
    lookalikeWhy: "Both are the layer in front. Press one gently with a fingernail: one responds " +
      "and one does not, and which of the two is fitted is the difference between a terminal that " +
      "works in a warehouse and one that does not."
  },
  {
    key: "digitizer", name: "Digitizer with an active pen", kind: "overlay",
    layers: ["a sensing grid behind the display", "the display", "the cover glass"],
    light: "None of its own — and unusually, its sensing layer is BEHIND the display rather than " +
      "in front of it",
    strength: "It knows how hard the pen is pressed and which way it is tilted, and it can ignore " +
      "the hand resting on the glass while it does",
    weakness: "It only works with its own pen, that pen has a battery or a coil in it, and " +
      "replacing a lost one costs a noticeable fraction of the device",
    black: "Not applicable. It shows nothing — it sits with something that does",
    use: "Drawing and note-taking devices, and signature capture where the pressure and the shape " +
      "of the stroke matter",
    look: "A sensing layer behind the panel rather than in front of it, and nothing added to the " +
      "front of the glass at all.",
    lookalike: "touchcap",
    lookalikeWhy: "Both are on the same device and both feel like touch. One reads any finger " +
      "from in front of the picture; the other reads one particular pen from behind it, and a " +
      "customer saying “the touchscreen has stopped working” may mean either."
  },
  {
    key: "inverter", name: "Inverter and CCFL backlight", kind: "backlight",
    layers: ["a fluorescent tube along one edge", "a reflector and a light guide", "a diffuser",
      "the panel in front of it"],
    light: "A cold-cathode fluorescent tube, driven by a small board that steps mains-level " +
      "voltage up to strike it",
    strength: "Nothing, now. It is in this pool because it is still in machines people bring in, " +
      "and because of what is on the board behind it",
    weakness: "The tube dims and goes pink with age, the board that drives it fails more often " +
      "than the tube, and that board holds a charge that will hurt you after the machine is " +
      "switched off",
    black: "Grey, and a grey that changes colour as the tube ages",
    use: "Nothing you would specify. Recognise it so that you know what is behind the panel " +
      "before you put a screwdriver near it",
    look: "A thin glass tube along one edge with a small board beside it carrying two fine wires " +
      "to it.",
    lookalike: "edgelit",
    lookalikeWhy: "Both light a panel from one edge and both sit in a laptop lid. One is a row of " +
      "small emitters run at a few volts; the other is a glass tube run at hundreds, off a board " +
      "that stays live after the lid is open — and knowing which is in front of you before you " +
      "reach in is not a matter of taste."
  },
  {
    key: "miniled", name: "Mini-LED backlight with local dimming", kind: "backlight",
    array: true, zones: 4, fine: true,
    layers: ["hundreds of very small emitters in a grid behind the panel", "a diffuser",
      "the panel in front of it", "a controller that dims each zone separately"],
    light: "A grid of hundreds of very small emitters behind the panel, each group dimmed on its own",
    strength: "It gets close to a truly black picture on a technology that cannot switch its own " +
      "light off, and it does it while staying far brighter than an emissive panel can",
    weakness: "A bright thing on a dark background carries a faint halo, because a zone is bigger " +
      "than a pixel and the zone has to be lit for the bright thing to appear",
    black: "Nearly black where a whole zone is off, and grey where a zone has to stay lit for " +
      "something small and bright inside it",
    look: "A dense grid of very small emitters across the whole back rather than a strip along " +
      "one edge, with a controller board that has far more connections than a plain backlight.",
    lookalike: "directlit",
    lookalikeWhy: "Both light the panel from behind across the whole area, and from the front the " +
      "two are the same picture until something bright appears on something dark. The difference " +
      "is how many zones there are and whether they can be dimmed apart from each other — which " +
      "is a specification, not a shape, and it is what the price is."
  },
  {
    key: "qdfilm", name: "Quantum-dot film in the backlight path", kind: "backlight",
    array: true, zones: 1, fine: false,
    layers: ["a blue emitter across the back", "a film of quantum dots that converts the blue",
      "a diffuser", "the panel in front of it"],
    light: "A blue emitter behind a film that converts some of the blue into pure red and green, " +
      "so the white reaching the panel is made of three clean colours",
    strength: "A far wider range of colour than a plain white backlight, at ordinary panel " +
      "brightness and without any of the wear an emissive panel has",
    weakness: "It is still a backlight behind a crystal, so it cannot make a black. Everything the " +
      "underlying panel is bad at, it is still bad at",
    black: "Whatever the panel in front of it manages. The film changes the colour of the light, " +
      "not whether it can be switched off",
    look: "A blue emitter rather than a white one, with a film in front of it that looks faintly " +
      "yellow when the display is switched off.",
    lookalike: "oled",
    lookalikeWhy: "THE CONFUSION IS THE NAME, and it is sold that way. A name with a Q in it is a " +
      "film in front of a backlight on an ordinary crystal panel; a name with an O in it is a " +
      "panel where every pixel makes its own light. One can be very bright and cannot make black, " +
      "the other makes perfect black and cannot be as bright. Ask what makes the light."
  },
  {
    key: "laserproj", name: "Projector with a laser light source", kind: "projector",
    layers: ["a laser light source", "a colour-generating stage", "the imaging chip",
      "the lens"],
    light: "A laser rather than a lamp — no bulb, no strike time, and no consumable to change",
    strength: "It reaches full brightness immediately, it does not lose much brightness over its " +
      "life, and nobody ever has to order a lamp for it",
    weakness: "It costs more at the start, and when the light source does eventually fail it is " +
      "not a part anybody changes on site — the unit goes away",
    black: "Better than a lamp gives you, because the source can be dimmed or switched off for " +
      "dark scenes rather than being blocked all the time",
    look: "No lamp door anywhere on the case, no lamp-hours counter in the menu, and a fan that " +
      "runs far more quietly than a lamp machine's.",
    lookalike: "dlp",
    lookalikeWhy: "THE IMAGING CHIP AND THE LIGHT SOURCE ARE TWO SEPARATE QUESTIONS and this pair " +
      "exists to force them apart. A machine can be a mirror-chip projector with a lamp or with a " +
      "laser, and the answer to \u201cwhat maintenance does it need\u201d comes from the light source " +
      "while the answer to \u201cwhy do I see a rainbow when I move my eyes\u201d comes from the chip."
  },
  {
    key: "irtouch", name: "Infrared touch frame", kind: "overlay",
    layers: ["a frame of emitters down two sides", "a frame of detectors down the other two",
      "the display behind the frame"],
    light: "None of its own that you can see. The frame emits infrared across the face of the " +
      "display and watches for the beams being broken",
    strength: "Anything that breaks a beam works — a gloved hand, a pen, a board rubber — and " +
      "nothing is added in front of the picture, so the display is as bright as it was",
    weakness: "It senses a touch slightly before anything reaches the glass, it can be fooled by " +
      "dust and strong sunlight, and the frame stands proud of the surface where it collects dirt",
    black: "Not applicable. It shows nothing — it sits in front of something that does",
    use: "Large interactive displays in classrooms and meeting rooms, where the screen is too big " +
      "for the other kinds and people use whatever is in their hand",
    look: "A raised frame all the way round the display with a narrow channel in it, and nothing " +
      "at all added in front of the picture.",
    lookalike: "touchcap",
    lookalikeWhy: "Both are called touchscreens and both take a finger. One is a grid bonded to " +
      "the glass and the other is a frame around the outside that nothing is bonded to — which is " +
      "why one of them registers a touch a hair before contact, and why cleaning the channel round " +
      "the edge is a maintenance task on one and not on the other."
  },
  {
    key: "privacy", name: "Privacy filter", kind: "overlay",
    layers: ["a film of very fine vertical louvres", "a carrier layer holding them",
      "the display behind it"],
    light: "None of its own. It takes light away rather than adding any, by blocking everything " +
      "leaving the screen at an angle",
    strength: "Somebody standing beside the user cannot read the screen, which on a reception " +
      "desk or a train is the entire requirement and cannot be met any other way",
    weakness: "It costs the user brightness straight away, it puts a faint texture over the " +
      "picture, and a display fitted with one gets reported as faulty by whoever inherits the desk",
    black: "Not applicable. It shows nothing — it sits in front of something that does",
    use: "A screen the public can walk past: a reception desk, a clinic, a machine somebody works " +
      "on in transit",
    look: "A separate sheet clipped or taped over the display, with a texture you can see when " +
      "you tip it, and a picture that goes dark as you step to the side.",
    lookalike: "twisted",
    lookalikeWhy: "BOTH GO DARK WHEN YOU MOVE OFF TO THE SIDE, and that is the whole of the " +
      "diagnostic. One is a panel whose crystals shift colour off axis and one is a film doing it " +
      "deliberately. Before anybody orders a replacement panel for a screen that is \u201cdark from " +
      "the side\u201d, take whatever is clipped to the front of it off and look again."
  }
];

const BY = {};
PANELS.forEach(function (p) { BY[p.key] = p; });
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
  rnd(PANELS).forEach(take);
  return out.slice(0, n);
}

/* ---------------------------------------------------------------------
   What the instruments say.

   A meter on the front of the screen and a clamp on its supply — never the
   name of the technology and never where the light comes from, because
   those are the first two answers.

   The readings are the ATTRIBUTES half of the objective doing real work:
   a contrast ratio, a response time, a viewing angle and a power figure
   between them identify most of this pool without a single word about
   what is inside it.
   --------------------------------------------------------------------- */
export function meterRows(D) {
  var it = D.item;
  var m = {
    twisted:      ["1 000:1", "1 ms", "170° across, and the picture changes over most of it", "14 W"],
    ips:          ["1 200:1", "5 ms", "178° across, with almost no change", "22 W"],
    vaa:          ["4 000:1", "8 ms", "178° across, with a shift in the dark tones", "19 W"],
    oled:         ["measured as infinite — the meter reads zero on a black field", "0.2 ms",
                   "178° across, with almost no change", "6 W on a dark image, 24 W on a white one"],
    edgelit:      ["1 100:1, and different at the edges from the middle", "5 ms",
                   "depends entirely on the panel in front of it", "17 W"],
    directlit:    ["6 000:1 with the zones working, 1 200:1 with them switched off", "6 ms",
                   "depends entirely on the panel in front of it", "31 W"],
    dlp:          ["2 000:1 in a dark room, far less with the lights on", "under 1 ms",
                   "as wide as the surface it is thrown on", "260 W, most of it heat"],
    lcdprojector: ["1 500:1 in a dark room, far less with the lights on", "16 ms",
                   "as wide as the surface it is thrown on", "290 W, most of it heat"],
    touchcap:     ["not measurable — it produces no light", "8 ms from touch to response",
                   "not applicable", "0.3 W"],
    touchres:     ["not measurable — it produces no light", "12 ms from touch to response",
                   "not applicable", "0.2 W"],
    digitizer:    ["not measurable — it produces no light", "3 ms from pen to line",
                   "not applicable", "0.4 W"],
    inverter:     ["600:1, falling as the hours go on", "16 ms",
                   "depends entirely on the panel in front of it", "9 W at the tube, and several " +
                   "hundred volts to strike it"],
    miniled:      ["45 000:1 with the zones working, 1 300:1 with them switched off", "5 ms",
                   "depends entirely on the panel in front of it", "38 W, and far less on a dark " +
                   "image because most of the grid is off"],
    qdfilm:       ["1 300:1, and a far wider range of colour than the number suggests", "5 ms",
                   "depends entirely on the panel in front of it", "26 W"],
    laserproj:    ["3 000:1 in a dark room, and it holds it as the hours go on", "under 1 ms",
                   "as wide as the surface it is thrown on", "190 W, and no lamp hours counted " +
                   "anywhere in the menu"],
    irtouch:      ["not measurable — it produces no light", "20 ms from touch to response",
                   "not applicable", "2.5 W across the whole frame"],
    privacy:      ["not measurable — it produces no light, it takes it away", "not applicable",
                   "under 30° each side, deliberately", "none — it is a film"]
  }[it.key];
  /* EVERY ITEM NEEDS A ROW HERE. A table keyed by item is the one thing in
     this file that does not grow by itself, and five items added without
     entries took the page down inside a subscript rather than saying what
     was missing. */
  if (!m) {
    throw new Error('no meter reading for panel "' + it.key +
      '" — add a row to meterRows');
  }
  return [
    { k: "Contrast, measured on a full black field", v: m[0] },
    { k: "Time to change a pixel", v: m[1] },
    { k: "Angle before the picture changes", v: m[2] },
    { k: "Drawn at the supply", v: m[3] }
  ];
}

export function panelQuestions(D, rnd) {
  var it = D.item;
  var qs = [];

  qs.push({
    id: "which",
    ask: "Which is this?",
    hint: "Count the layers in the section and find the light. Whether there is a lamp behind the " +
      "picture, along one edge, in a grid, or nowhere at all separates this pool into four groups " +
      "before you have looked at anything else.",
    answer: it.name,
    choices: [it.name].concat(pick(D, "name", 3, rnd).map(function (c) { return c.name; })),
    why: function (chosen) {
      if (chosen === it.name) return it.look + " " + it.lookalikeWhy;
      var o = PANELS.filter(function (c) { return c.name === chosen; })[0];
      return o ? "That is a real one and it is not this. " + o.look
        : "That is not what is in the section.";
    }
  });

  qs.push({
    id: "light",
    ask: "Where does the light come from?",
    hint: "Look at the back of the section. Behind everything, along one edge, in a grid across " +
      "the whole back, from the pixels themselves, out of a lens — or from nothing at all, " +
      "because two things in this pool produce no light and are not displays.",
    answer: it.light,
    choices: [it.light].concat(pick(D, "light", 3, rnd).map(function (c) { return c.light; })),
    why: function (chosen) {
      if (chosen === it.light) {
        return "Yes. " + it.light + ". Everything the exam asks about a display follows from " +
          "that one sentence — how black the blacks are, how thick it is, and what it draws.";
      }
      return "That is where a different one gets its light. Read the section from the back " +
        "forwards and stop at the first layer that is producing anything.";
    }
  });

  qs.push({
    id: "black",
    ask: "How black is black on it?",
    hint: "Ask what is happening at a pixel showing black. If a lamp is still on behind it, the " +
      "answer is grey however good the panel is — and how grey depends on how far the layer in " +
      "front of the lamp can close.",
    answer: it.black,
    choices: [it.black].concat(pick(D, "black", 3, rnd).map(function (c) { return c.black; })),
    why: function (chosen) {
      if (chosen === it.black) {
        return "Correct. " + it.black + ". The contrast figure on the meter is that sentence " +
          "expressed as a number, and it is the one measurement that separates these families.";
      }
      return "That belongs to a different stack. Work from where the light comes from: a lamp " +
        "that stays on cannot produce black no matter what is in front of it.";
    }
  });

  qs.push({
    id: "weakness",
    ask: "What did somebody accept when they chose it?",
    hint: "Every one of these is a trade. Something was given up to get whatever this one is good " +
      "at, and the complaint that eventually comes in is almost always that thing.",
    answer: it.weakness,
    choices: [it.weakness].concat(pick(D, "weakness", 3, rnd)
      .map(function (c) { return c.weakness; })),
    why: function (chosen) {
      if (chosen === it.weakness) {
        return "Right. " + it.weakness + ". A customer reporting exactly that is not reporting a " +
          "fault — they are reporting the trade, and telling those two apart is the job.";
      }
      return "That is what a different one costs you. Start from what this one is good at and ask " +
        "what had to be given up to get it.";
    }
  });

  qs.push({
    id: "confused",
    ask: "Which one does it get confused with?",
    hint: "Not the one with the nearest name — the one that gets ordered, fitted or quoted " +
      "instead, and then disappoints somebody in a way they cannot quite describe.",
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
        "looks identical until somebody shows it something dark, or moves.";
    }
  });

  return qs;
}
