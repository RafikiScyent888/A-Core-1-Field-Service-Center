/* =====================================================================
   Field Service Center — the display and video track

   Almost every display fault in the field is settled by two free tests
   done in the right order, and almost nobody does them.

   The torch test: hold a light against a black screen at an angle and look
   for the desktop. If the image is there, the panel and everything driving
   it are alive and the backlight is out. If it is not, the picture never
   arrived. Thirty seconds, no tools, and it splits the fault in half.

   The external monitor: plug in another screen. If that one is right, the
   graphics chain is fine and the fault is in the panel, its cable or its
   backlight. If it is wrong the same way, the panel was never the problem.

   The rest of this track is about the distinctions people get wrong — a
   dead pixel is not a stuck pixel, image retention is not burn-in, and a
   projector that runs for twenty minutes and quits is not a lamp fault.
   ===================================================================== */

export const DISPLAY_PARTS = [
  {
    key: "panel", label: "Display panel",
    role: "The liquid-crystal layer itself. It makes the image but produces no light of its own.",
    fails: "Cracks, pressure marks, dead columns, or a blotch that spreads over weeks.",
    seen: "A spreading dark bloom in one corner with fine lines running out of it."
  },
  {
    key: "backlight", label: "Backlight assembly",
    role: "The LED strip and diffuser behind the panel. Everything you see is this shining through the crystal layer.",
    fails: "Strips fail and the screen goes black while the machine carries on working perfectly.",
    seen: "Completely dark, and a torch held at an angle shows the desktop sitting there."
  },
  {
    key: "driver", label: "Backlight driver board",
    role: "Steps voltage up to run the backlight and handles the brightness control.",
    fails: "Flickers, dims unevenly, or drops the backlight a few seconds after power-on.",
    seen: "The screen lights for two seconds at power-on and then goes dark, every time."
  },
  {
    key: "vidcable", label: "Video cable through the hinge",
    role: "Carries the picture from the board up into the lid, folded through the hinge.",
    fails: "Chafes where it folds, so the image glitches, flickers or drops at particular lid angles.",
    seen: "The picture is stable at one lid angle and breaks up as soon as it is moved."
  },
  {
    key: "gpu", label: "Graphics output",
    role: "The chip and port that generate the signal.",
    fails: "Artefacts, wrong colour, or no signal at all — and it does the same thing on any screen you attach.",
    seen: "The same corruption appears on an external monitor, which puts it upstream of the panel."
  },
  {
    key: "vidport", label: "Cable and input",
    role: "The lead between machine and monitor, and the input it is plugged into.",
    fails: "A bent pin, a damaged lead, or the monitor simply sitting on the wrong input.",
    seen: "No signal on this input; the monitor's own menu comes up fine, and another input works."
  },
  {
    key: "lamp", label: "Projector lamp",
    role: "The light source. Dims over its rated hours and eventually fails.",
    fails: "Gradual dimming with hours, then failure. It does not cause shutdowns on a timer.",
    seen: "Well inside its rated hours, and the image is at full brightness right up to the moment it quits."
  },
  {
    key: "filter", label: "Projector air filter and fan",
    role: "Keeps dust out and heat moving. The whole thermal budget of the machine depends on it.",
    fails: "Clogs, the unit overheats, and the protection circuit shuts it down after twenty minutes or so.",
    seen: "The filter is a solid mat of dust and the exhaust is barely moving air."
  }
];

export const DISPLAY_FAULTS = [
  {
    key: "backlight", part: "backlight assembly", target: "backlight",
    objective: "3.1 + 5.3", kind: "component",
    root: "The backlight has failed. The panel is still being driven correctly — there is simply nothing lighting it.",
    observable: "the screen is black, but the machine is plainly running and a torch held against it shows the desktop",
    symptoms: ["The screen is dead but I can hear it working",
      "If I shine my phone at it I can just see the icons", "It still makes the startup sound"],
    fixes: "Replace the backlight assembly, or the whole display assembly if the panel is bonded to it.",
    wrongReflex: "panel",
    wrongWhy: "The panel is fine and it is proving it — a torch shows the image sitting there, correctly rendered. What is missing is the light behind it.",
    evidence: "A visible image under a torch, which puts the panel, the cable and the graphics chain all in the clear"
  },
  {
    key: "driver", part: "backlight driver board", target: "driver",
    objective: "3.1 + 5.3", kind: "component",
    root: "The backlight driver is failing. It strikes the backlight at power-on and then shuts it down a second or two later.",
    observable: "the screen lights up normally for about two seconds every time it starts, then goes black with the machine still running",
    symptoms: ["I get a flash of the desktop and then nothing",
      "Always about two seconds", "An external screen is perfect"],
    fixes: "Replace the backlight driver board.",
    wrongReflex: "backlight",
    wrongWhy: "A failed backlight never lights at all. One that comes on and is then switched off is being told to switch off, and the thing telling it is the driver.",
    evidence: "The backlight striking successfully and then being cut, which proves the backlight itself works"
  },
  {
    key: "panel", part: "display panel", target: "panel",
    objective: "3.1 + 5.3", kind: "component",
    root: "The panel is physically damaged. A pressure mark has bloomed into a spreading dark patch with lines running out of it.",
    observable: "a black blotch in one corner that has grown over a few weeks, with thin lines spreading from it",
    symptoms: ["A dark patch that keeps getting bigger", "Lines coming out of it now",
      "It was dropped in a bag a month ago"],
    fixes: "Replace the panel, or the display assembly on a bonded unit.",
    wrongReflex: "graphics",
    wrongWhy: "An external monitor is perfect, which puts everything upstream of the panel in the clear. Damage that spreads physically over weeks is not something a graphics chip does.",
    evidence: "Damage that grows over time and an external monitor showing a perfect picture"
  },
  {
    key: "vidcable", part: "video cable", target: "vidcable",
    objective: "3.2 + 5.3", kind: "component",
    root: "The video cable is chafed where it folds through the hinge. The picture holds at some lid angles and breaks up at others.",
    observable: "the image flickers and tears when the lid is moved, and is rock solid if it is left at one particular angle",
    symptoms: ["It flickers when I move the screen", "Fine if I don't touch it",
      "Sometimes it goes off completely and comes back"],
    fixes: "Replace the video cable and route it correctly through the hinge channel.",
    wrongReflex: "panel",
    wrongWhy: "A failing panel does not care what angle the lid is at. A fault that tracks the hinge is in something that bends with the hinge.",
    evidence: "Corruption that changes with lid angle and settles completely when the lid is left still"
  },
  {
    key: "projector", part: "air filter", target: "filter",
    objective: "3.1 + 5.3", kind: "service",
    root: "The projector's air filter is choked. It runs normally until it heats up, then the thermal protection shuts it down.",
    observable: "it runs perfectly for about twenty minutes and then shuts itself off, and will not restart until it has cooled",
    symptoms: ["It dies partway through every presentation",
      "Always about twenty minutes in", "It won't come back on straight away"],
    fixes: "Clean or replace the air filter, clear the intake, and check the fan is moving air.",
    wrongReflex: "lamp",
    wrongWhy: "The lamp is well inside its hours and the picture is at full brightness right up to the second it quits. A dying lamp dims for weeks; it does not run bright and switch off on a timer.",
    evidence: "A shutdown that always happens after roughly the same warm-up time and needs a cool-down before it will restart"
  },
  {
    key: "gpuart", part: "graphics output", target: "gpu",
    objective: "3.5 + 5.3", kind: "component",
    root: "The graphics output is failing. It corrupts the picture before it ever reaches a screen.",
    observable: "coloured speckles and torn blocks across the image, and an external monitor shows exactly the same corruption",
    symptoms: ["Coloured dots and broken blocks everywhere",
      "The spare monitor does it too", "It's there on the firmware screen before Windows loads"],
    fixes: "Replace the graphics hardware — on a laptop that is the mainboard, so weigh it against the machine's value.",
    wrongReflex: "panel",
    wrongWhy: "An external monitor showing the identical corruption puts the fault upstream of every panel. Two screens do not develop the same fault on the same afternoon.",
    evidence: "Identical corruption on an external monitor, and visible before the operating system loads"
  },
  {
    key: "noinput", part: "cable and input", target: "vidport",
    objective: "3.2 + 5.3", kind: "config",
    root: "Nothing is wrong with the display. It is sitting on an input with nothing plugged into it, and the lead is in a different socket.",
    observable: "the monitor says no signal, but its own menu comes up perfectly and another input shows a picture straight away",
    symptoms: ["It just says no signal", "The menu works fine",
      "It happened after we moved the desks"],
    fixes: "Select the input the lead is actually in, or move the lead. Nothing needs replacing.",
    wrongReflex: "monitor",
    wrongWhy: "A monitor that can draw its own menu is alive, lit and being driven correctly. What it is not doing is looking at the socket you plugged into.",
    evidence: "The monitor's own on-screen menu displaying normally while it reports no signal"
  },
  {
    key: "lampdim", part: "projector lamp", target: "lamp",
    objective: "3.1 + 5.3", kind: "consumable",
    root: "The projector lamp is at the end of its life. Output has dropped and shifted yellow, gradually, over months.",
    observable: "the image is dim and yellowish and has been getting slowly worse for months, and it runs indefinitely without shutting down",
    symptoms: ["We have to turn the lights off now to see it",
      "Everything looks yellow", "It's been getting worse all year"],
    fixes: "Replace the lamp and reset the lamp hour counter. Check the filter while it is open.",
    wrongReflex: "filter",
    wrongWhy: "A blocked filter shuts the unit down on a timer. This one runs all day — it is simply running dim, which is what a lamp does at the end of its hours.",
    evidence: "Gradual dimming and colour shift over months with no shutdown and lamp hours at their rated limit"
  },
  {
    key: "deadcolumn", part: "panel column driver", target: "panel",
    objective: "3.1 + 5.3", kind: "component",
    root: "A column driver on the panel has failed. One vertical line of pixels is permanently black.",
    observable: "a single black line one pixel wide running the full height of the screen, in the same place on everything",
    symptoms: ["A thin black line down the screen", "It's there on everything, even the login screen",
      "It doesn't move"],
    fixes: "Replace the panel. A failed column driver is not repairable and no software will bring it back.",
    wrongReflex: "cable",
    wrongWhy: "A cable fault flickers, tears or changes with movement. A single dead column that never moves and never varies is inside the panel.",
    evidence: "One permanently black column, unchanged by lid movement and present before the operating system loads"
  },
  {
    key: "partialbl", part: "backlight strip section", target: "backlight",
    objective: "3.1 + 5.3", kind: "component",
    root: "One section of the backlight strip has failed. The rest of it is still lit.",
    observable: "the bottom third of the screen is dark while the top two thirds are normal, and the image is visible in the dark part under a torch",
    symptoms: ["The bottom of the screen has gone dark",
      "The top half is completely normal", "I can just see the taskbar if I shine a light on it"],
    fixes: "Replace the backlight assembly, or the display assembly on a bonded unit.",
    wrongReflex: "panel",
    wrongWhy: "The image is present in the dark region — a torch shows it. A backlight is a strip of separate emitters, and losing a section of it darkens a band rather than the whole screen.",
    evidence: "A sharply bounded dark band with the image still readable inside it under a torch"
  },
  {
    key: "refresh", part: "refresh rate set below the panel's capability", target: "none",
    objective: "3.1 + 5.3", kind: "config",
    root: "The monitor is a high-refresh panel running at 60Hz because nothing ever set it any higher. It is not broken and it is not doing what it was bought to do.",
    observable: "motion looks less smooth than the identical monitor at the next desk, on the same machine model",
    symptoms: ["It doesn't look as smooth as hers", "It's the same model as hers",
      "It's fine really, just not right"],
    fixes: "Set the refresh rate to what the panel and the cable support. Check the cable is rated for it too, because a lower-grade lead silently caps this.",
    wrongReflex: "monitor",
    wrongWhy: "The monitor is doing exactly what it was told. Replacing it puts an identical panel on the desk, set to 60Hz by the same default, and the user calls again.",
    evidence: "A panel rated far higher than the refresh rate actually selected, with an identical unit beside it set correctly"
  },
  {
    key: "burnin", part: "image retention on an OLED panel", target: "panel",
    objective: "3.1 + 5.3", kind: "component",
    root: "A static interface has been on screen for most of two years and the panel has retained it. The faint outline of a toolbar sits over everything.",
    observable: "a ghost of the application's toolbar visible on every screen, including the firmware screen before the operating system loads",
    symptoms: ["I can see the old menu bar through everything",
      "It's on all the time now", "It used to fade if I left it off"],
    fixes: "Replace the panel. Retention that has stopped fading is permanent, and the preventive part of this ticket matters more than the repair — screen blanking and a moving interface are what stop the next one.",
    wrongReflex: "software",
    wrongWhy: "It is visible on the firmware screen before anything has loaded, which puts it below every piece of software on the machine. Nothing you install or uninstall touches it.",
    evidence: "A retained image visible before the operating system loads, on a panel technology prone to it"
  },
  {
    key: "hdcp", part: "content protection handshake", target: "vidcable",
    objective: "5.3", kind: "config",
    root: "The adapter chain between the laptop and the boardroom screen cannot complete the content-protection handshake, so protected video is black while everything else is fine.",
    observable: "the desktop and slides display perfectly and any protected video plays as a black rectangle with sound",
    symptoms: ["The training videos are just black", "The sound is fine",
      "Everything else shows up"],
    fixes: "Take the adapter chain out and use a single rated cable end to end. Every extra converter in the path is another place the handshake can fail.",
    wrongReflex: "projector",
    wrongWhy: "The projector shows everything else perfectly, including full-screen images at the same resolution. A display that can show one video and not another is not failing to display — something in the path is refusing to pass it.",
    evidence: "Protected content black with audio present, and unprotected content at the same resolution perfect"
  },
  {
    key: "colourprofile", part: "colour profile", target: "none",
    objective: "3.1 + 5.3", kind: "config",
    root: "A colour profile meant for a different monitor was applied to this one, so everything on screen has a cast that prints correctly and never looks right.",
    observable: "a colour cast on screen that does not appear in anything printed from the same machine",
    symptoms: ["Everything looks yellow", "It prints out fine",
      "It started after the new monitors arrived"],
    fixes: "Apply the profile that matches this monitor, or reset to the default. The panel is fine and the printer already proved it.",
    wrongReflex: "panel",
    wrongWhy: "The same file prints with correct colour from the same machine, which puts the fault between the operating system and the screen rather than in either. A failing panel does not produce colour that is correct everywhere except on itself.",
    evidence: "A screen cast that does not appear in output printed from the same machine"
  },
  {
    key: "dockdisplay", part: "the dock's display output", target: "vidport",
    objective: "1.2 + 5.3", kind: "component",
    root: "One of the dock's two display outputs has failed. The same monitor and the same cable work on the other output and on the laptop directly.",
    observable: "one monitor is dead on the dock and comes back the moment it is moved to the other port",
    symptoms: ["The left screen has gone", "It works if I swap them over",
      "It's fine if I plug it into the laptop"],
    fixes: "Replace the dock. Swapping the monitors is a workaround that gets them working today and leaves half a dock in service.",
    wrongReflex: "monitor",
    wrongWhy: "The monitor works on the other port on the same dock, with the same cable, immediately. It is the port that has failed and the monitor that proved it.",
    evidence: "One dock output dead with the same monitor and lead working on the other output"
  }
];

/* =====================================================================
   The two free tests, and the pixel distinctions people get wrong
   ===================================================================== */
export function torchTest(G) {
  var f = G.fault.key;
  return {
    ran: false,
    result: f === "backlight"
      ? "The desktop is there — icons, taskbar, the lot — just unlit. The panel is being driven correctly."
      : f === "driver"
        ? "In the two seconds it is lit, the image is perfect. Under the torch afterwards it is still there, unlit."
        : f === "panel"
          ? "The image is there and correctly lit everywhere except the damaged area, which stays dark under the torch too."
          : f === "vidcable"
            ? "The image is lit normally. What it shows is torn and glitching, which is not a lighting problem."
            : "The image is bright and correct. Nothing here is a backlight fault.",
    splits: f === "backlight" || f === "driver"
  };
}

export function externalTest(G) {
  var f = G.fault.key;
  return {
    result: (f === "backlight" || f === "driver" || f === "panel" || f === "vidcable")
      ? "The external monitor is perfect — correct resolution, correct colour, rock steady. Everything that generates the picture is fine."
      : "The external monitor shows exactly the same thing, which puts the fault upstream of any panel.",
    clearsGraphics: f !== "projector"
  };
}

export const PIXEL_FACTS = [
  ["Dead pixel", "Permanently black. The transistor driving it has failed and no amount of software will bring it back."],
  ["Stuck pixel", "Permanently lit in one colour — red, green or blue. Sometimes recoverable, because the crystal is stuck rather than dead."],
  ["Image retention", "A faint ghost of a static image that fades on its own within minutes to hours. Temporary."],
  ["Burn-in", "The same ghost, permanent, from months of the same static image. Common on OLED, effectively never on modern LCD."],
  ["Backlight bleed", "Light leaking at the edges of a dark screen. A uniformity complaint, not a failure."],
  ["Pressure mark", "A bright or dark bloom where something pressed on the panel. It spreads. It does not recover."]
];

/* The bench tests for this track. One isolates; the rest are honest. */
const TESTS = [
  { key: "refreshcheck", label: "Read the panel's rating and compare it with the refresh rate selected", mins: 3,
    isolates: ["refresh"],
    hit: "The panel is rated far higher than the rate it is running at, and the identical monitor beside it is set correctly. Nothing is broken.",
    miss: "The selected rate is the highest the panel and the cable support." },
  /* One test, two faults. There used to be two tests here with the SAME
     LABEL \u2014 one isolating burn-in, one isolating a dead column \u2014 which
     put two identical buttons in front of the student, only one of which
     counted. There is no way to choose between them by reading them, because
     they read the same, and picking the wrong one silently cost the "straight
     to it" grade on a ticket that had been answered correctly.

     Looking at the firmware screen is a single physical act, so it is a
     single test that isolates both. What it SHOWS still differs by fault, so
     `hit` may be a map keyed by fault instead of one string. */
  { key: "firmwarescreen", label: "Look at the firmware screen before the operating system loads", mins: 3,
    isolates: ["burnin", "deadcolumn"],
    hit: {
      burnin: "The ghost of the toolbar is there on the firmware screen, before anything has loaded. That puts it below every piece of software on the machine.",
      deadcolumn: "The dead column is there on the firmware screen too, in the same place, which rules out everything software."
    },
    miss: "The firmware screen is completely clean." },
  { key: "protected", label: "Play protected video and unprotected video at the same resolution", mins: 4,
    isolates: ["hdcp"],
    hit: "The unprotected clip plays perfectly and the protected one is a black rectangle with sound. The display is displaying; something in the path is refusing to pass one of them.",
    miss: "Both play identically." },
  { key: "printcompare", label: "Print the file that looks wrong and compare it with the screen", mins: 5,
    isolates: ["colourprofile"],
    hit: "The print is correct and the screen is not, from the same file on the same machine. That puts it between the operating system and the panel.",
    miss: "The print has the same cast as the screen, so this is not the screen." },
  { key: "portswap", label: "Move the dead monitor to the dock's other display output", mins: 3,
    isolates: ["dockdisplay"],
    hit: "The same monitor and the same lead come straight up on the other output. The port has failed, not the screen.",
    miss: "It behaves the same on either output." },
  { key: "torch", label: "Hold a torch against the screen at an angle and look for the image", mins: 2,
    isolates: ["backlight", "driver"],
    hit: "The desktop is there under the light, unlit. The panel and everything driving it are alive; the light behind them is not.",
    miss: "The screen is already lit and the image is visible without help. Nothing to learn here." },
  { key: "external", label: "Plug in an external monitor and compare", mins: 5,
    isolates: ["panel"],
    hit: "The external screen is flawless while the built-in one is not, which clears the graphics chain and puts the fault in the lid.",
    miss: "The external monitor shows the same thing, so the panel was never the problem." },
  { key: "hinge", label: "Move the lid slowly through its full range while watching the image", mins: 3,
    isolates: ["vidcable"],
    hit: "It tears at about forty degrees and clears again past ninety, reproducibly. That is a cable flexing in the hinge.",
    miss: "The image is unaffected at every angle." },
  { key: "warm", label: "Run it until it fails and read the temperature and hours", mins: 25,
    isolates: ["projector"],
    hit: "It shuts down at twenty-one minutes with the intake temperature well over limit, and the lamp is at a third of its rated hours.",
    miss: "It runs indefinitely at a normal temperature." },
  { key: "extcompare", label: "Compare the built-in screen and an external one side by side", mins: 6,
    isolates: ["gpuart"],
    hit: "Both screens show the identical corruption at the same time, which puts the fault upstream of either of them.",
    miss: "The two screens disagree, so whatever is wrong is downstream of the signal." },
  { key: "inputmenu", label: "Open the monitor's own menu and check which input is selected", mins: 2,
    isolates: ["noinput"],
    hit: "The menu draws perfectly — so the monitor is alive and lit — and it is set to an input with nothing in it.",
    miss: "The menu confirms it is on the right input and still shows nothing." },
  { key: "hours", label: "Read the lamp hours and compare the brightness against a known-good unit", mins: 6,
    isolates: ["lampdim"],
    hit: "The lamp is at its rated hours and measurably dimmer and yellower than the identical unit next door.",
    miss: "Hours are low and brightness matches the reference unit." },
  { key: "torchband", label: "Torch the dark region and look for the image inside it", mins: 2,
    isolates: ["partialbl"],
    hit: "The image is there in the dark band, correctly rendered and unlit, with a sharp boundary against the lit part.",
    miss: "Nothing is visible under the torch anywhere." },
  { key: "lamphours", label: "Read the lamp hours from the service menu", mins: 3, isolates: [],
    hit: "", miss: "The lamp is nowhere near its rated hours." },
  { key: "reinstall", label: "Reinstall the graphics driver", mins: 25, isolates: [],
    hit: "", miss: "No change at all, and the fault was visible before the operating system loaded." },
  { key: "safemode", label: "Boot to the firmware screen and look at it there", mins: 5, isolates: [],
    hit: "", miss: "Identical before the operating system starts, which rules out anything software." }
];

export function displayTests(G, shuffle) {
  var right = TESTS.filter(function (t) { return t.isolates.indexOf(G.fault.key) !== -1; });
  var wrong = TESTS.filter(function (t) { return t.isolates.indexOf(G.fault.key) === -1; });
  var pick = right.slice(0, 1).concat(shuffle(wrong).slice(0, 4));
  return shuffle(pick).map(function (t) {
    var iso = t.isolates.indexOf(G.fault.key) !== -1;
    /* `hit` is a string on tests that isolate one fault and a map keyed by
       fault on the one that isolates two, because what the firmware screen
       shows you depends on what is wrong with the panel. */
    var hit = typeof t.hit === "string" ? t.hit : t.hit[G.fault.key];
    return { key: t.key, label: t.label, mins: t.mins, isolating: iso,
      result: iso ? hit : t.miss };
  });
}

/* The machine under the fault. */
const SCREENS = [
  { name: "Calder 24\" desktop monitor", kind: "monitor" },
  { name: "Marek Workbook 15 built-in panel", kind: "laptop" },
  { name: "Rowan Studio 16 built-in panel", kind: "laptop" },
  { name: "Delacroix boardroom projector", kind: "projector" }
];

export function buildScreen(r, fault) {
  /* The machine has to be able to have the fault. A cable chafing through a
     hinge needs a hinge, so that ticket is always a laptop; a thermal
     shutdown on a filter is always the projector. Pairing a fault with a
     device that cannot have it produces a ticket with no sensible answer. */
  var only = {
    projector: "projector", lampdim: "projector",
    /* A cable chafing through a hinge needs a hinge. A dock output, a
       refresh rate and a colour profile all need a desktop monitor.
       A content-protection handshake needs the boardroom projector. */
    vidcable: "laptop", noinput: "monitor", dockdisplay: "monitor",
    refresh: "monitor", colourprofile: "monitor", hdcp: "projector"
  }[fault.key];
  var pool = only
    ? SCREENS.filter(function (s) { return s.kind === only; })
    : SCREENS.filter(function (s) { return s.kind !== "projector"; });
  var m = r.pick(pool);
  return {
    model: m.name, kind: m.kind,
    ageMonths: r.int(9, 58),
    res: m.kind === "projector" ? "1920 x 1080" : r.pick(["1920 x 1080", "2560 x 1440", "3840 x 2160"]),
    panelType: m.kind === "projector" ? "DLP" : r.pick(["IPS", "TN", "VA", "OLED"]),
    lampHours: fault.key === "projector" ? r.int(600, 1400)
      : fault.key === "lampdim" ? r.int(2860, 3040) : 0,
    lampRated: 3000,
    shutdownMins: fault.key === "projector" ? r.int(18, 24) : 0,
    intakeC: fault.key === "projector" ? r.int(64, 78) : 0,
    intakeLimit: 60
  };
}
