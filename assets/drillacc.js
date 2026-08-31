/* =====================================================================
   Field Service Center — objective 1.2

   "Compare and contrast accessories and connectivity options."

   A Compare-and-contrast objective, so it is a drill and not a service
   call. But it is a different drill from 3.2: connectors are answered by
   counting and looking, and accessories are answered by knowing what a
   thing NEEDS and what it CANNOT do. Two boxes on a desk can look
   identical and behave completely differently the moment one of them is
   asked to drive a second monitor.

   So the graded questions here are about dependency rather than shape:
   how it attaches, what it wants from the host, where its power comes
   from, and — the one that actually separates these in the field — what
   it will not do no matter how it is plugged in.

   Every pair in this file is a pair people genuinely confuse, and the
   confusion costs money: a port replicator bought when a dock was needed,
   a capacitive stylus bought for a machine with a digitizer in it, a
   Thunderbolt dock hung off a port that cannot feed it.
   ===================================================================== */

export const ACCESSORIES = [
  {
    key: "dock", name: "Docking station", family: "expansion",
    connects: "One cable to the host — Thunderbolt, USB-C or a proprietary edge connector",
    power: "Its own mains supply, and it feeds the laptop back down the same cable",
    needs: "A host port that carries display and data, plus its driver or firmware kept current",
    cannot: "Drive more displays than the laptop's own graphics can address. The dock provides the ports; the machine still decides how many screens it can paint",
    look: "A substantial block with a mains barrel jack, several video outputs, Ethernet, and a short captive lead to the host.",
    lookalike: "portrep",
    lookalikeWhy: "They sit on the same desk doing what looks like the same job. The dock has its own mains supply and charges the laptop through the one cable; the replicator does not. If it has a power brick of its own, that is the tell."
  },
  {
    key: "portrep", name: "Port replicator", family: "expansion",
    connects: "One cable to the host, usually USB-C or a proprietary connector",
    power: "Drawn from the host — there is no mains supply of its own",
    needs: "Nothing beyond the port it hangs off, which is also its limit",
    cannot: "Charge the laptop, or add capability the host has not already got. It fans out what is there and adds nothing",
    look: "A slim bar of connectors with no mains inlet anywhere on it and a single lead to the machine.",
    lookalike: "dock",
    lookalikeWhy: "The same row of ports on the back of both. Look for a mains inlet: a docking station has one and pushes power back into the laptop, a replicator has none and takes power out of it."
  },
  {
    key: "usbchub", name: "USB-C multiport adapter", family: "expansion",
    connects: "Plugs straight into a USB-C port with no cable at all, or a very short pigtail",
    power: "Bus-powered from the host, with an optional pass-through inlet on some of them",
    needs: "A USB-C port whose alternate modes include video, if you want the video output to work",
    cannot: "Deliver full bandwidth to everything at once. Every device on it shares the one port, and the video output shares it too",
    look: "A palm-sized slab with a captive USB-C plug and a handful of ports crowded along its edges.",
    lookalike: "tbdock",
    lookalikeWhy: "Both end in a USB-C plug and both add ports. This one is bus-powered and shares one port's bandwidth between everything; the Thunderbolt dock has its own supply and its own lanes."
  },
  {
    key: "tbdock", name: "Thunderbolt dock", family: "expansion",
    connects: "A single Thunderbolt cable, which is the same shape as USB-C and is not the same thing",
    power: "Its own mains supply, delivering up to around 100 W back to the host",
    needs: "A host port that is genuinely Thunderbolt. The plug will fit a plain USB-C port and the dock will not perform on one",
    cannot: "Exceed what the host port negotiates. Plugged into a non-Thunderbolt port it degrades quietly rather than refusing",
    look: "A heavy block with a mains inlet, a Thunderbolt symbol beside its host port, and several high-bandwidth outputs.",
    lookalike: "usbchub",
    lookalikeWhy: "Identical plug, identical socket, wildly different capability. The symbol next to the port is the only thing that tells you whether the machine can actually feed this, and it is the difference between two 4K displays and one that stutters."
  },
  {
    key: "activepen", name: "Active pen", family: "input",
    connects: "Wirelessly to a digitizer built into the display itself",
    power: "Its own battery or supercapacitor, charged or replaced",
    needs: "A display with the matching digitizer technology underneath the glass",
    cannot: "Do anything at all on a screen without that digitizer. It is not a substitute for a finger",
    look: "A pen with a fine hard tip, a barrel button or two, and a charging contact or battery compartment.",
    lookalike: "capstylus",
    lookalikeWhy: "Both are pens for a touchscreen and one of them costs ten times the other. This one talks to hardware in the panel and gives pressure and tilt; the cheap one is just something conductive on a stick."
  },
  {
    key: "capstylus", name: "Capacitive stylus", family: "input",
    connects: "Nothing. It is a conductive tip that the touchscreen reads as a finger",
    power: "None whatsoever",
    needs: "Any capacitive touchscreen, which is effectively all of them",
    cannot: "Report pressure, report tilt, or let the screen ignore your palm. The screen does not know it is a pen",
    look: "A pen with a soft rubber dome or a fabric-mesh tip, no buttons, no battery and no contacts.",
    lookalike: "activepen",
    lookalikeWhy: "Same silhouette in a drawer. Look at the tip: a broad soft dome is capacitive and dumb, a fine hard nib means there is a digitizer under the glass expecting to hear from it."
  },
  {
    key: "drawtablet", name: "Drawing tablet", family: "input",
    connects: "USB to the host, or a wireless receiver",
    power: "Bus-powered over its own cable",
    needs: "A driver on the host. The digitizer is in the tablet, not in any screen",
    cannot: "Show you anything. You look at the monitor and your hand is somewhere else, which is the whole learning curve",
    look: "A flat slate with an active area marked on it, express keys down one edge, and its own pen.",
    lookalike: "activepen",
    lookalikeWhy: "Both give pressure and tilt and both come with a pen. The difference is where the digitizer lives — in this slab on the desk, or under the glass you are already looking at."
  },
  {
    key: "btheadset", name: "Bluetooth headset", family: "audio",
    connects: "A wireless pairing with the host, held in both devices' bond lists",
    power: "Its own rechargeable battery",
    needs: "To be paired and in range, and for the host to have a working radio",
    cannot: "Be plugged into anything. If the pairing is broken there is no cable that rescues it",
    look: "An earpiece or a headband with a charging port, a power button and status light, and no cable to anywhere.",
    lookalike: "usbheadset",
    lookalikeWhy: "On a call they sound the same and the user calls both 'my headset'. This one fails by losing a pairing; the wired one fails by losing a port."
  },
  {
    key: "usbheadset", name: "USB headset", family: "audio",
    connects: "A USB port, and it enumerates as its own sound device",
    power: "Bus-powered from the port",
    needs: "A free USB port. It brings its own converter, so the host's audio hardware is irrelevant",
    cannot: "Work on a device with no USB host port, and it will not appear until the machine has selected it as the output",
    look: "A headband with a boom microphone and a captive cable ending in a USB plug, often with an inline control pod.",
    lookalike: "trsheadset",
    lookalikeWhy: "Same headband, same boom, different plug and a completely different failure mode. This one appears as a separate sound device to be selected; the analogue one just takes over the socket it is in."
  },
  {
    key: "trsheadset", name: "3.5 mm headset", family: "audio",
    connects: "A single four-conductor jack carrying stereo out and a microphone in",
    power: "None — the host drives it directly",
    needs: "A combined headset socket. A machine with separate microphone and headphone sockets needs a splitter",
    cannot: "Carry the microphone into a three-conductor headphone socket. Sound comes out, nothing goes in",
    look: "A headband with a boom microphone and a plug with three dark bands on it rather than two.",
    lookalike: "usbheadset",
    lookalikeWhy: "Identical from the neck up. Count the bands on the plug — three separators means four conductors and a microphone; two means headphones only and a user nobody can hear."
  },
  {
    key: "microsd", name: "microSD card", family: "storage",
    connects: "A microSD slot, or a full-size adapter into an SD slot",
    power: "Drawn from the slot",
    needs: "A slot that supports its capacity class, or the reader will see it as a smaller card or not at all",
    cannot: "Go straight into a full-size SD slot. It needs the carrier, and the carrier is the thing everybody loses",
    look: "A fingernail-sized card with a notched corner and contacts along one short edge.",
    lookalike: "sdcard",
    lookalikeWhy: "Same technology, same filesystem, one fits inside the other. The adapter is passive — it is a shell with traces, and if a card works in the adapter and not without it, the adapter is not the problem."
  },
  {
    key: "sdcard", name: "SD card", family: "storage",
    connects: "A full-size SD slot",
    power: "Drawn from the slot",
    needs: "A slot supporting its capacity class, and its write-protect switch pushed the right way",
    cannot: "Be written to with the lock switch down, and it gives no error worth reading when it happens",
    look: "A postage-stamp-sized card with an angled corner and a small sliding switch on one long edge.",
    lookalike: "microsd",
    lookalikeWhy: "The big one has a physical lock switch and the small one does not, which is why a card that suddenly went read-only is usually this one and usually a knocked switch rather than a failure."
  },
  {
    key: "powerbank", name: "Power bank", family: "power",
    connects: "USB-C or USB-A out to the device, and its own inlet to recharge",
    power: "Stored in its own cells, and it is a consumable like any other battery",
    needs: "To negotiate a power profile with the device. Both ends have to agree before anything fast happens",
    cannot: "Charge a laptop unless it supports the profile that laptop asks for. It will trickle or do nothing, quietly",
    look: "A slab with a capacity printed on it, a row of charge indicator lights, and both an input and an output port.",
    lookalike: "charger",
    lookalikeWhy: "Both hand power to a phone over the same cable. This one holds a charge and runs out; the other one is a wall socket and does not. On a bench they are told apart by whether there are indicator lights and an input port."
  },
  {
    key: "charger", name: "USB-C wall charger", family: "power",
    connects: "A mains outlet on one side and a USB-C cable on the other",
    power: "The mains — it stores nothing",
    needs: "A cable rated for the current it wants to push, and a device that negotiates the same profile",
    cannot: "Force a device to charge fast. Both ends and the cable have to agree, and the weakest of the three decides",
    look: "A small mains plug body with a wattage marked on it and one or two USB-C sockets in the face.",
    lookalike: "powerbank",
    lookalikeWhy: "Same output, same cable, same result while it is plugged in. This one has mains pins and no indicator lights, and it never goes flat."
  },
  {
    key: "webcam", name: "External webcam", family: "conference",
    connects: "USB, enumerating as a camera and usually as a microphone too",
    power: "Bus-powered from the port",
    needs: "The conferencing application to have it selected. Plugging it in does not switch anything over",
    cannot: "Override the built-in camera on its own. Something has to choose it, and that something is software",
    look: "A small barrel or bar on a clip that hooks over a monitor, with a lens, an indicator light and a captive USB lead.",
    lookalike: "speakerphone",
    lookalikeWhy: "Both are USB conference kit that arrive in the same box and get plugged into the same hub. Both also enumerate as a microphone, which is why a room can end up using one device's camera and the other's audio without anybody choosing it."
  },
  {
    key: "speakerphone", name: "USB speakerphone", family: "conference",
    connects: "USB, enumerating as both a sound output and a microphone",
    power: "Bus-powered, or its own battery on the portable ones",
    needs: "To be selected as both the speaker and the microphone, or half of the room stops working",
    cannot: "Fix a room's acoustics. It cancels echo from its own output, not from a second speaker somebody left running",
    look: "A round puck with a speaker grille on top, a ring of buttons round the edge and a microphone array inside it.",
    lookalike: "webcam",
    lookalikeWhy: "Same USB, same conference room, same box of kit. This one has a speaker grille and no lens — and it is the one to check when the far end says they can hear themselves."
  }
];

const BY = {};
ACCESSORIES.forEach(function (a) { BY[a.key] = a; });
export { BY as BY_KEY };

/* Distractors, deduped on the VALUE rather than on the item, because two
   accessories can honestly need the same thing and offering that sentence
   twice is a question with two right answers. */
function pick(D, field, n, rnd) {
  var want = String(D.item[field]);
  var look = BY[D.item.lookalike];
  var out = [], seen = {};
  seen[want] = 1;
  function take(c) {
    var v = String(c[field]);
    if (out.length >= n || seen[v] || c.key === D.item.key) return;
    seen[v] = 1; out.push(c);
  }
  if (look) take(look);
  rnd(ACCESSORIES.filter(function (c) { return c.family === D.item.family; })).forEach(take);
  rnd(ACCESSORIES.filter(function (c) { return c.family !== D.item.family; })).forEach(take);
  return out.slice(0, n);
}

export function accessoryQuestions(D, rnd) {
  var it = D.item;
  var qs = [];

  qs.push({
    id: "name",
    ask: "What is this accessory?",
    hint: "Work from what it has on it rather than from what it looks like overall. A mains inlet, a lens, a lock switch, indicator lights — each of those rules something out.",
    answer: it.name,
    choices: [it.name].concat(pick(D, "name", 3, rnd).map(function (c) { return c.name; })),
    why: function (chosen) {
      if (chosen === it.name) return it.look + " " + it.lookalikeWhy;
      var o = ACCESSORIES.filter(function (c) { return c.name === chosen; })[0];
      return o ? "That is a real accessory and it is not this one. " + o.look +
        " Look again at what is actually on the model." : "That is not what is in front of you.";
    }
  });

  qs.push({
    id: "connects",
    ask: "How does it attach to the host?",
    hint: "Look for a captive lead, a socket, a plug, or nothing at all. Something with no connector anywhere on it is telling you it is wireless.",
    answer: it.connects,
    choices: [it.connects].concat(pick(D, "connects", 3, rnd).map(function (c) { return c.connects; })),
    why: function (chosen) {
      if (chosen === it.connects) return "Yes. " + it.connects + ".";
      return "That is how something else attaches. How a thing connects decides how it fails, " +
        "so it is worth being certain before you start testing anything.";
    }
  });

  qs.push({
    id: "power",
    ask: "Where does its power come from?",
    hint: "Three possibilities and they look different: a mains inlet, a cell of its own with a charge indicator, or nothing but the host's port.",
    answer: it.power,
    choices: [it.power].concat(pick(D, "power", 3, rnd).map(function (c) { return c.power; })),
    why: function (chosen) {
      if (chosen === it.power) {
        return "Correct. " + it.power + ". Where an accessory's power comes from is most of what " +
          "separates it from the thing it gets confused with.";
      }
      return "That is another accessory's supply. Check the model for a mains inlet and for any " +
        "indicator that suggests it holds a charge.";
    }
  });

  qs.push({
    id: "needs",
    ask: "What does it need from the host before it will work?",
    hint: "Not what it plugs into — what has to be true at the other end. A port, a driver, a pairing, a mode, a piece of software making a choice.",
    answer: it.needs,
    choices: [it.needs].concat(pick(D, "needs", 3, rnd).map(function (c) { return c.needs; })),
    why: function (chosen) {
      if (chosen === it.needs) return "Right. " + it.needs + ".";
      return "That is another accessory's dependency. This is the question that decides whether a " +
        "purchase works on the machines you actually have, and it is the one people skip.";
    }
  });

  qs.push({
    id: "cannot",
    ask: "What will it NOT do, however it is connected?",
    hint: "Every one of these has a hard limit that no cable and no setting gets round. That limit is usually why the wrong one was bought.",
    answer: it.cannot,
    choices: [it.cannot].concat(pick(D, "cannot", 3, rnd).map(function (c) { return c.cannot; })),
    why: function (chosen) {
      if (chosen === it.cannot) {
        return "Yes — " + it.cannot + ". Knowing the limit before you order is the difference " +
          "between a solved problem and a second parcel.";
      }
      return "That is a different accessory's ceiling. Go back to what this one is and what it " +
        "depends on; the limit follows from both.";
    }
  });

  qs.push({
    id: "lookalike",
    ask: "Which accessory is it most often confused with?",
    hint: "Not the one that does a similar job — the one that sits next to it on the desk looking almost identical.",
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
      return "That one is distinguishable at a glance. The pairing this question wants is the one " +
        "that gets the wrong item ordered.";
    }
  });

  return qs;
}
