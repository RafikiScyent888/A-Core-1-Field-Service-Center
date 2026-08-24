/* =====================================================================
   Field Service Center — the laptop track

   The mobile track is handsets. This one is the machine a technician
   actually opens most often, and it is the only device in the build where
   getting the order wrong can hurt you rather than just cost the customer
   money.

   Three things are graded here that are graded nowhere else:

   1. THE BATTERY COMES OUT FIRST. Not "power off" — a laptop that is
      powered off still has a charged cell wired to a live board, and every
      short you have ever heard about happened between the bottom cover
      coming off and somebody remembering that. On a machine with an
      internal battery that means disconnecting it before anything else
      gets touched, and it is a hard gate in the procedure.

   2. A SWOLLEN CELL IS A HAZARD, NOT A FAULT. It does not get charged, it
      does not get punctured, it does not go in the ordinary bin, and the
      machine does not go back to the user while it is still in there. This
      is the one ticket in the build where the right first answer is about
      safety rather than diagnosis.

   3. WHAT ACTUALLY COMES APART, AND IN WHICH ORDER. A SODIMM is four
      minutes behind one cover. A keyboard on the same chassis can be the
      whole machine stripped to the frame. Knowing which job is which before
      you quote it is the difference between a service call and an
      afternoon.
   ===================================================================== */

/* =====================================================================
   Everything inside the chassis
   ===================================================================== */
export const LAPTOP_PARTS = [
  {
    key: "cover", label: "Bottom cover", depth: 1,
    role: "The service panel. On this chassis it is the whole underside, held by screws of two different lengths plus a run of clips around the edge.",
    fails: "Nothing fails here, but it is where most damage gets done — a metal screwdriver in the seam marks the case permanently and can crack a clip.",
    seen: "Screws intact, no previous tool marks around the seam."
  },
  {
    key: "battery", label: "Battery pack", depth: 2,
    role: "An internal lithium pack, screwed to the frame and plugged into the board by a short connector. It stays live with the machine off.",
    fails: "Degrades to nothing over a few years, and in a small number of cases the cells swell — which is a safety problem, not a performance one.",
    seen: "Visibly swollen. It has lifted the trackpad from underneath and the bottom cover no longer sits flat."
  },
  {
    key: "sodimm1", label: "Memory slot 1 (SODIMM)", depth: 2,
    role: "The lower memory slot, reachable behind the service cover on this model.",
    fails: "A marginal module gives random reboots and stop errors under load, and passes a short memory test.",
    seen: "Seated, latched, no scorching. It looks exactly like the one beside it."
  },
  {
    key: "sodimm2", label: "Memory slot 2 (SODIMM)", depth: 2,
    role: "The upper memory slot, stacked above the first.",
    fails: "Same failure mode as the slot below it.",
    seen: "Seated and latched, clean contacts."
  },
  {
    key: "ssd", label: "M.2 storage drive", depth: 2,
    role: "The boot drive, a single M.2 stick held by one screw at the far end.",
    fails: "Reallocated sectors climb, the machine stalls for seconds at a time, and eventually it will not boot.",
    seen: "Nothing to see. It is a sealed stick with no lights and no moving parts."
  },
  {
    key: "wifi", label: "Wireless card and antenna leads", depth: 2,
    role: "An M.2 wireless card with two hair-thin antenna leads that run up through the hinge into the display lid.",
    fails: "The card rarely fails. The leads pop off their tiny connectors, and after a hinge-side repair they get pinched or left disconnected.",
    seen: "The card is seated, but one antenna lead is lying loose beside its connector rather than clipped onto it."
  },
  {
    key: "fan", label: "Cooling fan and heatsink", depth: 3,
    role: "A blower fan and a heat pipe running to the processor. Under the board on this chassis, so it is not a cover-off job.",
    fails: "Chokes with a felt of dust and lint at the exhaust fins, and the machine throttles and runs hot.",
    seen: "A solid mat of dust across the exhaust fins. The fan itself spins freely."
  },
  {
    key: "keyboard", label: "Keyboard assembly", depth: 4,
    role: "Riveted or clipped into the top case from ABOVE, which is why it is the deepest job on the machine.",
    fails: "Liquid gets under it and kills a run of keys, often a whole row or a diagonal band.",
    seen: "A faint tide mark and slight stickiness under the affected keys. The rest of the deck is clean."
  },
  {
    key: "trackpad", label: "Trackpad", depth: 3,
    role: "Sits in the top case with its own ribbon to the board.",
    fails: "Clicks stop registering, or the whole surface lifts if something underneath it swells.",
    seen: "Sits flush, clicks evenly at all four corners."
  },
  {
    key: "board", label: "Mainboard", depth: 4,
    role: "Everything else plugs into it. Removing it means every ribbon, every screw and the heatsink first.",
    fails: "Rarely, and by the time it has you have usually eliminated everything else.",
    seen: "No corrosion, no liquid indicator triggered, all connectors seated."
  },
  {
    key: "displayasm", label: "Display assembly and hinges", depth: 3,
    role: "The whole lid: panel, bezel, camera, antennas and the video cable, all hinged to the base.",
    fails: "Hinges stiffen and start lifting the lid's plastics, and the cable through the hinge chafes.",
    seen: "Hinges firm, lid closes flat, no cracking around the hinge mounts."
  },
  {
    key: "ports", label: "Port board and DC input", depth: 3,
    role: "USB, video out and the charging socket, usually on a small daughterboard so a broken socket is not a mainboard job.",
    fails: "The charge socket goes loose or intermittent after years of being pulled sideways.",
    seen: "Sockets firm, no play in the charge connector, no scorching."
  }
];

/* =====================================================================
   The faults
   ===================================================================== */
export const LAPTOP_FAULTS = [
  {
    key: "lapram", part: "memory module", target: "sodimm1",
    objective: "1.1 + 3.3 + 5.1", kind: "component", depth: 2,
    root: "One of the two memory modules is marginal. It passes a short test and fails under sustained load.",
    observable: "it reboots on its own several times a day, always under load, with a different stop code each time",
    symptoms: ["It restarts by itself when I'm working",
      "Different error on the blue screen every time", "Fine if I just leave it on the desk doing nothing"],
    fixes: "Test one module at a time, replace the one that fails, and match the survivor's speed and capacity.",
    wrongReflex: "operating system",
    wrongWhy: "A different stop code every time is the signature of bad memory, not a bad driver. Software faults repeat themselves; memory faults corrupt whatever happens to be in the wrong cell that minute.",
    evidence: "Random stop codes under load with an extended memory test failing on one module alone"
  },
  {
    key: "lapssd", part: "storage drive", target: "ssd",
    objective: "1.1 + 3.4 + 5.2", kind: "component", depth: 2,
    root: "The M.2 boot drive is failing. Reallocated and pending sectors are climbing and the controller is stalling on reads.",
    observable: "the machine freezes completely for ten or fifteen seconds at a time, then carries on as though nothing happened",
    symptoms: ["It hangs for a few seconds and comes back",
      "Getting slower every week", "It failed to boot once and then was fine"],
    fixes: "Back up first, then image to a replacement M.2 of equal or greater capacity and swap it.",
    wrongReflex: "memory",
    wrongWhy: "Memory faults crash a machine. A machine that freezes and then recovers is waiting on something, and what it is waiting on is a drive retrying a read.",
    evidence: "Climbing reallocated and pending sector counts with the stalls lining up against disk activity"
  },
  {
    key: "lapbatt", part: "battery pack", target: "battery",
    objective: "1.1 + 5.4", kind: "hazard", depth: 2,
    root: "The battery has swollen. The cells have gassed, and the pack is pushing the trackpad up from underneath and lifting the bottom cover.",
    observable: "the machine rocks on the desk, the trackpad has stopped clicking properly, and the bottom cover no longer sits flush",
    symptoms: ["It wobbles now when it never used to",
      "The trackpad is stiff and won't click", "There's a gap round the bottom edge"],
    fixes: "Stop charging it, take it out of service, remove the pack without deforming it, and dispose of it as hazardous waste. Fit a new pack, never a used one.",
    wrongReflex: "trackpad",
    wrongWhy: "The trackpad is fine. It has been pushed up from below by a pack that has physically grown, and replacing it would put a new part on top of a hazard.",
    evidence: "A case that no longer sits flat and a trackpad lifted from underneath — mechanical, not electrical"
  },
  {
    key: "lapkbd", part: "keyboard assembly", target: "keyboard",
    objective: "1.1 + 5.4", kind: "component", depth: 4,
    root: "Liquid got under the keyboard. A band of keys has stopped responding and the membrane under them is damaged.",
    observable: "a run of keys across one row does nothing at all, while every other key works perfectly",
    symptoms: ["Half the top row is dead", "It happened after a coffee went over",
      "An external keyboard works fine"],
    fixes: "Replace the keyboard assembly. On this chassis that means stripping to the top case, so quote the labour honestly before you start.",
    wrongReflex: "driver",
    wrongWhy: "An external keyboard working proves the input stack, the driver and the operating system are all fine. What is broken is under the keys.",
    evidence: "A contiguous group of dead keys with an external keyboard working normally"
  },
  {
    key: "lapwifi", part: "antenna lead", target: "wifi",
    objective: "1.1 + 2.2 + 2.8 + 5.5", kind: "component", depth: 2,
    root: "One antenna lead was left off its connector after the last repair. The card runs on a single antenna, so it works at the desk and falls over anywhere else.",
    observable: "wireless is fine right beside the access point and unusable two rooms away, on a machine everyone else's works next to",
    symptoms: ["Fine in the office, useless upstairs",
      "It got worse after it came back from repair", "My old one was fine in the same spot"],
    fixes: "Refit the antenna lead onto its connector and route it clear of the hinge.",
    wrongReflex: "access point",
    wrongWhy: "Everyone else's machine works in the same spot on the same access point. A fault that follows one laptop around the building is in that laptop.",
    evidence: "Signal that collapses with distance on one machine only, dated from a previous repair"
  },
  {
    key: "lapthermal", part: "cooling fan and heatsink", target: "fan",
    objective: "1.1 + 5.1", kind: "service", depth: 3,
    root: "The heatsink fins are choked with a felt of dust and lint. The fan is fine; the air has nowhere to go.",
    observable: "it runs hot and loud, and anything demanding slows to a crawl after a few minutes and stays there",
    symptoms: ["It roars and then everything goes slow",
      "Too hot to keep on my lap", "Fine for the first five minutes"],
    fixes: "Strip to the fan and heatsink, clear the fin stack properly, and re-paste while it is apart.",
    wrongReflex: "processor",
    wrongWhy: "The processor is doing exactly what it is designed to do — slowing itself down so it does not cook. Replacing it would give you a new part throttling behind the same blocked fins.",
    evidence: "Temperature climbing to the throttle point within minutes and staying there, with clock speed dropping in step"
  },
  {
    key: "lapdc", part: "DC input jack", target: "ports",
    objective: "1.1 + 5.1", kind: "component", depth: 3,
    root: "The charging socket has gone loose on its daughterboard. Contact depends on which way the lead is pulled.",
    observable: "it only charges if the lead is held at a particular angle, and the charge light flickers if the cable is nudged",
    symptoms: ["I have to wedge the plug to make it charge",
      "The light flickers if I move the cable", "A new charger made no difference"],
    fixes: "Replace the port board. On this chassis the socket is a daughterboard, so it is not a mainboard job.",
    wrongReflex: "charger",
    wrongWhy: "A second known-good charger does exactly the same thing. The fault moves with the socket, not the lead.",
    evidence: "Charging that depends on the physical angle of the plug, unchanged by a known-good charger"
  },
  {
    key: "laphinge", part: "hinge assembly", target: "displayasm",
    objective: "1.1 + 5.3", kind: "component", depth: 3,
    root: "The hinges have seized. Every open and close now loads the lid's plastics instead of turning, and the bezel is lifting away from the corners.",
    observable: "the lid is stiff to open and the plastic around the bottom corners of the screen has started to lift and crack",
    symptoms: ["It's getting harder to open", "The screen surround is coming apart at the corners",
      "It creaks when I open it"],
    fixes: "Replace the display assembly, or the hinges and rear cover if they are available separately. Left alone it goes on to tear the video cable.",
    wrongReflex: "panel",
    wrongWhy: "The picture is perfect. This is mechanical damage working outward from the hinge, and the panel is only where it will end up if nobody stops it.",
    evidence: "Rising force to open with cracking that starts at the hinge mounts and spreads outward"
  },
  {
    key: "laptrack", part: "trackpad ribbon", target: "trackpad",
    objective: "1.1 + 5.4", kind: "component", depth: 3,
    root: "The trackpad ribbon is not fully seated in its latch. It was disturbed at the last repair and has been working its way out since.",
    observable: "the pointer jumps and freezes at random, and the trackpad drops out completely if the machine is picked up",
    symptoms: ["The cursor jumps all over the place",
      "It stops working if I pick the laptop up", "It started after it came back from repair"],
    fixes: "Reseat the trackpad ribbon and close the latch properly. Replace the ribbon if the contacts are damaged.",
    wrongReflex: "trackpad",
    wrongWhy: "The trackpad itself is fine. A fault that comes and goes when the chassis flexes is a connection, not a component, and swapping the part without seating the ribbon reproduces it exactly.",
    evidence: "Behaviour that changes when the chassis is flexed, dated from the previous repair"
  },
  {
    key: "lapboard", part: "mainboard", target: "board",
    objective: "1.1 + 5.1", kind: "component", depth: 4,
    root: "The mainboard has failed. Nothing responds — no light, no fan, no charge indication — and everything upstream of it tests good.",
    observable: "it is completely dead: no lights, no fan, no sound, and no reaction to the charger at all",
    symptoms: ["Nothing happens at all when I press the button",
      "No light, no fan, nothing", "It was working when I shut it down on Friday"],
    fixes: "Replace the mainboard, and weigh that against the machine's age before you order it — on a four-year-old laptop a board is often most of a new one.",
    wrongReflex: "power supply",
    wrongWhy: "The charger is delivering correct voltage at the jack and a known-good battery changes nothing. Power is arriving; the board is not doing anything with it.",
    evidence: "Correct voltage at the jack, a known-good battery fitted, and still no reaction of any kind"
  },
  {
    key: "lapfan", part: "cooling fan bearing", target: "fan", depth: 3,
    objective: "1.1 + 5.1", kind: "wear",
    root: "The fan bearing has gone dry. It still turns and it makes a noise that changes with the angle the machine sits at.",
    observable: "a rattle that comes and goes depending on how the machine is sitting, and no thermal problem at all",
    symptoms: ["It rattles when it's on my lap", "It stops if I lift the corner",
      "It doesn't seem to be running hot"],
    fixes: "Replace the fan assembly. It is a wear part and it is behind the same cover as everything else in this chassis.",
    wrongReflex: "drive",
    wrongWhy: "The drive is solid-state and has nothing in it that can rattle. A noise that changes with the angle of the machine is something spinning in a bearing, and there is only one of those in here.",
    evidence: "A noise that varies with the machine's angle, with every temperature inside its limit"
  },
  {
    key: "lapspeaker", part: "speaker assembly", target: "keyboard", depth: 3,
    objective: "1.1 + 5.4", kind: "component",
    root: "One of the two speakers has failed. Sound comes out of one side of the machine and headphones are perfect.",
    observable: "audio only from one side of the machine, and perfectly balanced through headphones",
    symptoms: ["The sound's all coming from one side", "Headphones are fine",
      "I've checked the balance setting"],
    fixes: "Replace the speaker assembly. It comes out with the top case on this chassis, so most of the labour is getting to it rather than fitting it.",
    wrongReflex: "sound settings",
    wrongWhy: "Headphones play both channels correctly through the same audio chip and the same driver. Everything above the speakers is working, which leaves the speakers.",
    evidence: "Balanced audio through headphones and one-sided audio through the built-in speakers"
  },
  {
    key: "lapwebcam", part: "camera and its cable", target: "displayasm", depth: 4,
    objective: "1.1 + 5.4", kind: "component",
    root: "The camera has stopped enumerating. It is not listed at all, which is a connection or a module rather than a driver.",
    observable: "the camera does not appear in the device list at all, and the privacy shutter is open",
    symptoms: ["Nobody can see me on calls", "It says no camera found",
      "The little light never comes on"],
    fixes: "Reseat or replace the camera module and its cable through the hinge. Check the privacy switch first, because it costs nothing and it is the answer more often than the module is.",
    wrongReflex: "driver",
    wrongWhy: "A driver fault leaves the device listed with a warning against it. This one is not listed at all, and something that does not enumerate has not got as far as needing a driver.",
    evidence: "No camera device present in the list at all, with the privacy shutter confirmed open"
  },
  {
    key: "lapbios", part: "the machine's own firmware settings", target: "none", depth: 1,
    objective: "1.1 + 5.1", kind: "config",
    root: "The boot device order was changed while somebody was booting from a USB stick, and never changed back. The drive is healthy and the machine is looking past it.",
    observable: "it reports no bootable device with a drive that passes every test",
    symptoms: ["It says no boot device", "The disk test passes",
      "Someone was doing something with a USB stick last week"],
    fixes: "Put the boot order back and save it. There is nothing to open and nothing to order — and if it will not hold the setting, then the coin cell is the next thing to look at.",
    wrongReflex: "drive",
    wrongWhy: "The drive passes a full surface scan and is listed in firmware with its correct capacity. A machine that can see its drive and will not boot from it is being told not to.",
    evidence: "A healthy drive present in firmware with the boot order pointing somewhere else"
  },
  {
    key: "lapdisplaycable", part: "the display cable connector at the board", target: "board", depth: 4,
    objective: "1.1 + 3.1 + 5.3", kind: "component",
    root: "The display cable has worked loose at the board end rather than in the hinge. The picture is intermittent and pressing the palm rest brings it back.",
    observable: "the picture drops and returns when the chassis is pressed, at any lid angle",
    symptoms: ["It flickers if I lean on it", "It's not about opening the lid",
      "An external screen is perfect"],
    fixes: "Reseat the display connector at the board and latch it properly. If the latch is broken the board is the part, and that is a very different quote.",
    wrongReflex: "panel",
    wrongWhy: "The panel is fine and an external monitor proves the graphics chain is too. A picture that answers to pressure on the chassis is a connection, and connections are cheaper than panels by an order of magnitude.",
    evidence: "A picture that responds to chassis flex rather than to lid angle, with an external display perfect"
  },

  /* ---- five more on 1.1 ----
     Each one carries a different second objective, because the point of this
     track is not fifteen laptop faults \u2014 it is showing a student that a
     laptop job is several objectives happening at once. Two of these serve
     the REPLACEMENT half of 1.1, which the original set under-served: what
     happens when a part cannot be replaced at all, and what happens when it
     can but the technique is the entire job. */

  {
    key: "lapsoldered", part: "memory that cannot be replaced", target: "sodimm1",
    objective: "1.1 + 3.3", kind: "component", depth: 2,
    root: "Eight gigabytes are soldered to the board and there is one empty SODIMM slot. The user has been quoted for 32GB by somebody who counted the slot and never read the board.",
    observable: "a machine reporting 8GB with one free slot, on a chassis whose service manual lists the base memory as onboard",
    symptoms: ["Everything stops when I have the design software and email open at once",
      "I was told it takes 32 gigs", "There's an empty slot in there, I've seen it"],
    fixes: "Fit the largest module the single slot supports, and tell them what the total will actually be before you order anything. The onboard half is not going anywhere.",
    wrongReflex: "a matched pair of modules",
    wrongWhy: "There is one slot to put them in. Half the memory in this machine is soldered to the board \u2014 it cannot be removed, cannot be matched and cannot be upgraded, and that is exactly why the specification sheet and the slot count disagree.",
    evidence: "Base memory listed as onboard in the service manual, with a single usable slot beside it"
  },
  {
    key: "lapadhesive", part: "a battery bonded to the chassis", target: "battery",
    objective: "1.1 + 5.4", kind: "component", depth: 2,
    root: "The battery is at the end of its life and it is held in by stretch-release adhesive strips rather than screws. It lifts out cleanly if the tabs are pulled correctly and not at all if they are not.",
    observable: "a worn battery in a chassis whose service manual specifies pull-tabs rather than fasteners",
    symptoms: ["It lasts about forty minutes now", "Three years old and it has never been off the charger",
      "The last place that opened one of these made a mess of it"],
    fixes: "Warm the strips, pull each tab slowly and straight along its own axis until it releases, and never lever against the cell. If a tab breaks, stop and use the manufacturer\u2019s stated recovery method rather than a spudger.",
    wrongReflex: "prying it out",
    wrongWhy: "There are no screws to remove, so a screwdriver has nothing to undo and everything to puncture. Levering against a lithium cell is how a routine battery swap becomes a fire, and it is the most common way this exact job goes wrong.",
    evidence: "Stretch-release adhesive specified in the service manual, with no battery fasteners present"
  },
  {
    key: "lapm2key", part: "a drive that will not seat", target: "ssd",
    objective: "1.1 + 3.4", kind: "component", depth: 2,
    root: "A replacement M.2 drive was ordered and it will not go into the socket. The socket is keyed for one notch position and the drive that arrived is keyed for another.",
    observable: "a replacement drive that stops a few millimetres short of the socket and will not seat however it is presented",
    symptoms: ["The new drive doesn\u2019t fit", "It\u2019s the same size as the old one",
      "It says M.2 on the box and M.2 in the machine"],
    fixes: "Match the key to the socket rather than the form factor to the slot. Order the drive whose notch sits where the old one\u2019s did, at the same length, and confirm what the socket actually speaks.",
    wrongReflex: "pushing harder",
    wrongWhy: "M.2 is a form factor, not an interface. Two drives the same size and shape can be electrically different and keyed apart on purpose, and the notch exists to stop precisely what is being attempted.",
    evidence: "A socket and a replacement drive whose keying notches sit in different positions"
  },
  {
    key: "lappaste", part: "dried thermal compound", target: "fan",
    objective: "1.1 + 5.1", kind: "component", depth: 3,
    root: "The compound between the processor and the heat pipe has dried and cracked. The fan is clean and turning, the fins are clear, and the heat is reaching neither of them.",
    observable: "the processor at its thermal limit under load with the fan at full speed and the heat pipe barely warm",
    symptoms: ["It crawls when it is working hard and the fan is screaming",
      "We had it cleaned out six months ago", "It is the original machine from five years ago"],
    fixes: "Clean both mating surfaces back to bare metal, apply fresh compound to the manufacturer\u2019s pattern, and refit the heat pipe evenly to its torque sequence. The fan and the heatsink are both fine.",
    wrongReflex: "the fan",
    wrongWhy: "The fan spins at the right speed on demand and the fins are clear \u2014 you can see both. A heatsink that stays cool while the processor cooks has not failed; it is being given nothing to carry.",
    evidence: "Processor at its limit with the fan at full speed and the heat pipe barely above ambient"
  },
  {
    key: "lapbacklight", part: "the display backlight", target: "displayasm",
    objective: "1.1 + 3.1 + 5.3", kind: "component", depth: 3,
    root: "The backlight has failed. The panel is producing a correct picture and there is nothing lighting it from behind.",
    observable: "a screen that looks dead until a torch is held against it at an angle, at which point the desktop is visible and correct",
    symptoms: ["The screen is black but the machine is definitely on",
      "You can hear it start up normally", "It is fine on the projector in the meeting room"],
    fixes: "Confirm with a torch and an external display before quoting anything. On this chassis the backlight is not separately serviceable, so the part is the whole display assembly.",
    wrongReflex: "the panel",
    wrongWhy: "The panel is working. Hold a torch against it at an angle and the desktop is there, correctly rendered, in the right colours \u2014 a failed panel shows you nothing under any light. What has gone is what lights it from behind.",
    evidence: "A correct picture visible under raking torchlight, with a perfect image on an external display"
  }
];

/* =====================================================================
   The machine
   ===================================================================== */
const MODELS = [
  { name: "Calder Ultrabook 14", year: 3, slots: 1, cover: "single service cover", teardown: "clip-and-screw" },
  { name: "Marek Workbook 15", year: 2, slots: 2, cover: "full bottom cover", teardown: "screws of two lengths" },
  { name: "Rowan Studio 16", year: 4, slots: 2, cover: "full bottom cover", teardown: "screws plus edge clips" },
  { name: "Delacroix Rugged 14", year: 5, slots: 2, cover: "sealed, gasketed cover", teardown: "captive screws and a gasket" }
];

export function buildLaptop(r, fault) {
  var m = r.pick(MODELS);
  var l = {
    model: m.name,
    ageMonths: r.int(m.year * 12 - 6, m.year * 12 + 14),
    serial: "LT" + r.int(100000, 999999),
    slots: m.slots,
    cover: m.cover,
    teardown: m.teardown,
    ramGb: r.pick([8, 16, 32]),
    ramSpeed: r.pick([2666, 3200]),
    ssdGb: r.pick([256, 512, 1000]),
    batteryHealth: fault.key === "lapbatt" ? r.int(41, 63) : r.int(74, 96),
    cycles: r.int(320, 1180),
    swollen: fault.key === "lapbatt",
    /* How far in the faulty part is. This is what turns a diagnosis into a
       quote, and it is the number technicians get wrong. */
    depth: fault.depth,
    labourMins: { 1: 10, 2: 25, 3: 60, 4: 145 }[fault.depth]
  };
  l.warranty = l.ageMonths <= 24;
  return l;
}

/* =====================================================================
   The teardown

   Same shape as the printer procedures: steps that belong, honest steps
   from a deeper or shallower job, and six that must never appear. The
   battery gate is the one that matters — on a laptop, "powered off" and
   "safe to work on" are different states.
   ===================================================================== */
export const LAPTOP_ACTIONS = [
  { key: "backup", label: "Back the machine up before it is opened" },
  { key: "quote", label: "Tell the user how long it will be and what the labour comes to" },
  { key: "poweroff", label: "Shut it down properly and unplug the charger" },
  { key: "esd", label: "Ground yourself and work on an anti-static mat" },
  { key: "covers", label: "Remove the bottom cover, keeping the two screw lengths separate" },
  { key: "battdisc", label: "Disconnect the internal battery before touching anything else" },
  { key: "sodimm", label: "Release the latches and lift out the memory module" },
  { key: "m2", label: "Remove the retaining screw and lift out the M.2 drive" },
  { key: "antenna", label: "Clip the antenna lead back onto the card and dress it clear of the hinge" },
  { key: "battout", label: "Unscrew the battery pack and lift it out without flexing it" },
  { key: "hazbin", label: "Bag the swollen pack and send it out as hazardous waste" },
  { key: "topcase", label: "Strip the machine to the top case, releasing each ribbon latch first" },
  { key: "kbdswap", label: "Fit the replacement keyboard assembly" },
  { key: "reassemble", label: "Reassemble, putting every screw back in the hole it came out of" },
  { key: "battconn", label: "Reconnect the battery once everything else is back together" },
  { key: "boot", label: "Power up and confirm it posts before the cover goes on" },
  { key: "test", label: "Run the machine through the user's own work with them watching" },
  /* ---- the six that must never appear ---- */
  { key: "livework", label: "Leave the battery connected and work carefully around it", forbidden: true,
    why: "A laptop that is switched off still has a charged pack wired to a live board. Every shorted mainboard you will ever hear about happened in the gap between the cover coming off and somebody remembering the battery. It is disconnected first, every time, before anything else is touched." },
  { key: "pry", label: "Open the seam with a flat screwdriver", forbidden: true,
    why: "Metal in a plastic seam marks the case permanently and snaps the clips underneath, and the marks are on the outside of the machine where the customer sees them for the rest of its life. Nylon spudger, every time." },
  { key: "yankribbon", label: "Pull the ribbon cables straight out of their sockets", forbidden: true,
    why: "Those connectors have a latch that has to be flipped up first. Pulling against a closed latch tears the ribbon or lifts the socket off the board, and a lifted socket turns a keyboard job into a mainboard job." },
  { key: "puncture", label: "Press the swelling down or pierce it to release the gas", forbidden: true,
    why: "Never. A punctured lithium cell can vent and ignite in your hands, and the gas inside is not something to be standing over. It comes out intact or it does not come out today." },
  { key: "chargeswollen", label: "Put it on charge to see whether the swelling settles", forbidden: true,
    why: "Charging a swollen cell is the single most dangerous thing on this ticket. The swelling is gas from cells that have already failed; putting energy back into them is how a fault becomes a fire." },
  { key: "binswollen", label: "Drop the old pack in the office bin", forbidden: true,
    why: "A damaged lithium pack in general waste is a fire in a bin lorry. It is hazardous waste and it goes out through the proper route, in a bag, on its own." }
];

const PROCEDURES = {
  /* The five newest. lapsoldered and lapm2key both stop at the service cover
     because neither of them is a teardown \u2014 one is a conversation and the
     other is an ordering mistake, and pulling a machine apart to prove either
     is work nobody is paying for. */
  lapsoldered: ["quote", "poweroff", "esd", "covers", "sodimm", "reassemble", "boot", "test"],
  lapm2key: ["quote", "backup", "poweroff", "esd", "covers", "battdisc", "m2",
    "battconn", "reassemble", "boot", "test"],
  lapadhesive: ["quote", "backup", "poweroff", "esd", "covers", "battdisc", "battout",
    "battconn", "reassemble", "boot", "test"],
  lappaste: ["quote", "backup", "poweroff", "esd", "covers", "battdisc", "topcase",
    "battconn", "reassemble", "boot", "test"],
  lapbacklight: ["quote", "backup", "poweroff", "esd", "covers", "battdisc", "topcase",
    "battconn", "reassemble", "boot", "test"],
  lapfan: ["quote", "backup", "poweroff", "esd", "covers", "battdisc", "topcase",
    "battconn", "reassemble", "boot", "test"],
  lapspeaker: ["quote", "backup", "poweroff", "esd", "covers", "battdisc", "topcase",
    "battconn", "reassemble", "boot", "test"],
  lapwebcam: ["quote", "backup", "poweroff", "esd", "covers", "battdisc", "antenna",
    "battconn", "reassemble", "boot", "test"],
  lapbios: ["quote", "boot", "test"],
  lapdisplaycable: ["quote", "backup", "poweroff", "esd", "covers", "battdisc", "topcase",
    "battconn", "reassemble", "boot", "test"],
  lapram: ["quote", "backup", "poweroff", "esd", "covers", "battdisc", "sodimm",
    "battconn", "reassemble", "boot", "test"],
  lapssd: ["quote", "backup", "poweroff", "esd", "covers", "battdisc", "m2",
    "battconn", "reassemble", "boot", "test"],
  lapbatt: ["quote", "backup", "poweroff", "esd", "covers", "battdisc", "battout",
    "hazbin", "reassemble", "boot", "test"],
  lapkbd: ["quote", "backup", "poweroff", "esd", "covers", "battdisc", "topcase",
    "kbdswap", "battconn", "reassemble", "boot", "test"],
  lapwifi: ["quote", "backup", "poweroff", "esd", "covers", "battdisc", "antenna",
    "battconn", "reassemble", "boot", "test"],
  lapthermal: ["quote", "backup", "poweroff", "esd", "covers", "battdisc", "topcase",
    "reassemble", "battconn", "boot", "test"],
  lapdc: ["quote", "backup", "poweroff", "esd", "covers", "battdisc", "topcase",
    "reassemble", "battconn", "boot", "test"],
  laphinge: ["quote", "backup", "poweroff", "esd", "covers", "battdisc", "topcase",
    "reassemble", "battconn", "boot", "test"],
  laptrack: ["quote", "backup", "poweroff", "esd", "covers", "battdisc", "topcase",
    "reassemble", "battconn", "boot", "test"],
  lapboard: ["quote", "backup", "poweroff", "esd", "covers", "battdisc", "topcase",
    "reassemble", "battconn", "boot", "test"]
};

export function laptopProcedure(fault) { return PROCEDURES[fault.key].slice(); }

export function laptopActionByKey(key) {
  return LAPTOP_ACTIONS.filter(function (a) { return a.key === key; })[0];
}

export function laptopProcedureWhy(fault, key) {
  var a = laptopActionByKey(key);
  if (!a) return "";
  if (a.forbidden) return a.why;
  if (PROCEDURES[fault.key].indexOf(key) !== -1) return "";
  var deeper = {
    topcase: "Stripping to the top case is the keyboard job. Nothing on this ticket is behind the board.",
    kbdswap: "There is nothing wrong with the keyboard on this ticket.",
    battout: "The pack is healthy. Taking it out is work the customer pays for and does not need.",
    hazbin: "Nothing here is hazardous waste — the battery on this machine is fine.",
    antenna: "The antennas are connected and dressed correctly.",
    sodimm: "The memory is not at fault here, and pulling a module you do not need to is a chance to bend a latch for nothing.",
    m2: "The drive is healthy on this ticket."
  };
  return deeper[key] ||
    "Honest work, and it belongs to a different job on this machine. Every extra step is time the customer is paying for.";
}

/* What the fault costs to reach — the number that turns a diagnosis into a
   quote, and the one people guess at. */
export function laptopQuote(l, fault) {
  var band = {
    1: "Behind a single cover. Minutes.",
    2: "Behind the bottom cover. A short bench job.",
    3: "Under the board or in the lid. Most of an hour.",
    4: "Stripped to the top case. This is the deep one, and it is worth saying so before you start rather than after."
  }[fault.depth];
  return { mins: l.labourMins, band: band, depth: fault.depth };
}

/* =====================================================================
   The bench tests

   Every isolating test here can be done before a single screw comes out,
   which is the point: a laptop is slow to open and slower to close, and
   the tests worth running are the ones that do not require it.
   ===================================================================== */
const TESTS = [
  { key: "tiltnoise", label: "Run it flat, then lift one corner, and listen", mins: 5, isolates: "lapfan",
    hit: "The rattle stops the moment the corner comes up and starts again when it goes down. Every temperature stays inside its limit throughout.",
    miss: "It sounds identical at any angle." },
  { key: "headphones", label: "Play the same audio through the speakers and through headphones", mins: 4, isolates: "lapspeaker",
    hit: "Both channels are correct and balanced through headphones, and only one side of the machine makes any sound. Everything above the speakers works.",
    miss: "Headphones and speakers behave the same way, so the fault is above both of them." },
  { key: "devicelist", label: "Check whether the camera enumerates at all, and check the privacy shutter", mins: 4, isolates: "lapwebcam",
    hit: "The shutter is open and the camera is not in the device list at all. Something that does not enumerate has not got as far as needing a driver.",
    miss: "The camera is listed, healthy, and the shutter is open." },
  { key: "bootorder", label: "Read the boot order in firmware and check the drive is listed", mins: 5, isolates: "lapbios",
    hit: "The drive is there with its correct capacity, and the boot order is pointing at a USB device that was removed a week ago.",
    miss: "Boot order correct, drive first, and it still will not boot from it." },
  { key: "flexpicture", label: "Press the palm rest while watching the picture, at a fixed lid angle", mins: 5, isolates: "lapdisplaycable",
    hit: "The picture drops and returns to pressure on the chassis, with the lid held still. An external monitor is perfect throughout.",
    miss: "The picture is unaffected by pressure on the chassis." },
  { key: "onestick", label: "Boot on one memory module at a time under load", mins: 20, isolates: "lapram",
    hit: "Stable for an hour on the second module alone. Fails within ten minutes on the first.",
    miss: "Identical behaviour on either module, and on both together." },
  { key: "smart", label: "Read the drive's SMART data from a live USB", mins: 8, isolates: "lapssd",
    hit: "Reallocated sectors climbing and a non-zero pending count, with the stalls lining up against disk activity.",
    miss: "Every SMART attribute is inside its threshold." },
  { key: "flat", label: "Stand it on a flat surface and press each corner", mins: 3, isolates: "lapbatt",
    hit: "It rocks on a flat bench and the bottom cover has a visible gap along one edge. Something inside has grown.",
    miss: "Sits flat and solid, no gap anywhere around the cover." },
  { key: "extkbd", label: "Plug in an external keyboard and test the dead keys", mins: 5, isolates: "lapkbd",
    hit: "Every one of those keys works perfectly on the external keyboard, which clears the driver, the input stack and the operating system in one go.",
    miss: "The external keyboard behaves exactly the same, so the fault is not in the built-in one." },
  { key: "walk", label: "Walk it around the building beside a known-good laptop", mins: 12, isolates: "lapwifi",
    hit: "Signal collapses within twenty metres while the machine beside it holds a full connection the whole way.",
    miss: "The two machines track each other closely everywhere you go." },
  { key: "thermal", label: "Load it and watch temperature and clock speed together", mins: 15, isolates: "lapthermal",
    hit: "It reaches the throttle point in four minutes and the clock halves and stays there. The fan is at full speed the whole time.",
    miss: "Temperatures stay in the sixties and the clock holds its boost." },
  { key: "jackangle", label: "Measure at the jack while flexing the plug through its travel", mins: 8, isolates: "lapdc",
    hit: "Voltage at the jack drops out entirely at certain angles and returns when the plug is held over. The charger output never moves.",
    miss: "Voltage is rock steady at the jack at every angle." },
  { key: "hingeforce", label: "Open and close the lid slowly and watch the bezel corners", mins: 4, isolates: "laphinge",
    hit: "The bezel visibly lifts away from the corner every time the lid moves, and the hinge is stiff enough to lift the whole base.",
    miss: "It opens smoothly and nothing moves that should not." },
  { key: "flex", label: "Flex the chassis gently while watching the pointer", mins: 5, isolates: "laptrack",
    hit: "The pointer drops out the moment the case is twisted and comes back when it is released, repeatably.",
    miss: "No change at all under flex." },
  { key: "elimination", label: "Fit a known-good battery and measure at the jack", mins: 12, isolates: "lapboard",
    hit: "Correct voltage at the jack, a known-good battery fitted, and still nothing at all. Everything that feeds the board is good.",
    miss: "It reacts normally once power is confirmed good." },
  { key: "readspec", label: "Read the service manual\u2019s memory section against what the machine reports", mins: 6, isolates: "lapsoldered",
    hit: "The manual lists the base memory as onboard and gives one accessible slot. The total the user was quoted cannot be reached in this chassis by any combination of parts.",
    miss: "The manual lists both slots as accessible and nothing is soldered." },
  { key: "manualbatt", label: "Read the battery removal procedure before touching anything", mins: 4, isolates: "lapadhesive",
    hit: "No fasteners. The procedure specifies stretch-release adhesive and gives a pull direction and a recovery method for a broken tab \u2014 which tells you this job is technique rather than tools.",
    miss: "The battery is screwed to the frame and comes out with a driver, as most of them do." },
  { key: "keycompare", label: "Hold the replacement against the socket and compare the notch positions", mins: 3, isolates: "lapm2key",
    hit: "The notch on the replacement sits in a different position from the socket\u2019s key. It is the same length and the same form factor and it is not going in.",
    miss: "The notches line up and the drive seats with light pressure." },
  { key: "pipefeel", label: "Load it, then compare the processor temperature with the heat pipe\u2019s own", mins: 14, isolates: "lappaste",
    hit: "The processor sits at its limit with the fan at full speed while the heat pipe stays close to ambient. The heat is not getting out of the chip into the metal.",
    miss: "The heat pipe warms with the processor as it should." },
  { key: "torch", label: "Hold a torch against the screen at an angle in a dark room", mins: 4, isolates: "lapbacklight",
    hit: "The desktop is there under the torch \u2014 correct, sharp and in the right colours. The panel is producing a picture that nothing is lighting.",
    miss: "Nothing at all under the torch, at any angle." },
  { key: "reimage", label: "Reimage it from the standard build", mins: 90, isolates: null,
    hit: "", miss: "Identical on a clean image. Ninety minutes to prove it was never software." },
  { key: "drivers", label: "Update every driver from the vendor's site", mins: 30, isolates: null,
    hit: "", miss: "No change, and the symptom predates the driver versions you have just replaced." },
  { key: "battreport", label: "Generate a battery health report", mins: 5, isolates: null,
    hit: "", miss: "It confirms what the status page already showed and tells you nothing about the fault." }
];

export function laptopTests(G, shuffle) {
  var right = TESTS.filter(function (t) { return t.isolates === G.fault.key; });
  var wrong = shuffle(TESTS.filter(function (t) { return t.isolates !== G.fault.key; })).slice(0, 4);
  return shuffle(right.concat(wrong)).map(function (t) {
    return { key: t.key, label: t.label, mins: t.mins,
      isolating: t.isolates === G.fault.key,
      result: t.isolates === G.fault.key ? t.hit : t.miss };
  });
}
