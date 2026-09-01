# Material tiles — what to shoot

## Status

**Done: dust.** A dusty-heatsink tile is in and wired to the damage mesh, so
`lapthermal`, `lapfan` and `psufanseized` now draw a felted mat instead of a
flat brown lump. It is in `assets/tiles.js` with its provenance recorded.

**Still open: moulded, rubber, steel.** Those three painters in
`assets/surface.js` are still written and applied to nothing.

**Rejected: brushed aluminium.** A tile was supplied and could not be used —
the photograph has a lighting gradient across it, light at one corner and
dark at the other. Once tiled, that gradient becomes a visible checkerboard
of light and dark squares. This is exactly the hotspot problem in the "how to
shoot them" notes below, and it is the one mistake that cannot be corrected
afterwards: the shading is baked into the pixels. The generated `brushed`
surface is still in use and looks better.

**Not needed: bare circuit board.** A good tile was supplied, but `pcb` is
generated and stays that way — the generated one derives from the ticket, and
a photographed board cannot. Traces also cannot be made to repeat without
either mirroring (a visible kaleidoscope) or blending (visibly broken traces).

---

Three tiles and four reference photographs. Not photographs of components: photographs of **surfaces**.
Each one becomes a small repeating tile that every part made of that material
shares, so one good shot of bare circuit board does the work for every board on
every track.

This is the half of the detail that code cannot fake well. Traces, silkscreen,
pads and labels are better generated — they can be derived from the ticket, so a
drive label shows the capacity that ticket actually generated. Material *grain*
is the opposite: it is irregular in a way that reads as fake the moment it is
generated, and a photograph settles it.

---

## How to get them to me

**Commit them to any repository this session can see** — `core-1-sims` is
fine, a folder called `photos/` at the root — and say which repo and folder.
They come through as real files and land on disk, tested with a binary file
and confirmed. This is the route that works.

Pasting a photograph into a chat message does NOT work. It is visible but
there is no file behind it, so it cannot be resized, embedded or read. Four
searches of the filesystem across this session found nothing.

If you have terminal access to the working machine instead, put them in
`field-service-center/incoming/` and say so.

## How to shoot them

The framing matters more than the camera. A phone is fine.

**Fill the frame with the surface.** No edges, no background, no context. If you
can see where the object stops, you are too far back. Think "a swatch", not "a
photo of a part".

**Flat on.** Camera square to the surface, not at an angle. An angled shot
carries perspective into the tile and the grain skews when it is wrapped.

**Soft, even light.** Near a window on an overcast day, or under a diffused
lamp. **No flash, no direct sun, no single bright bulb** — a hotspot bakes a
permanent shine into the tile that then appears on every part in the build,
lit from a direction that does not match the scene.

**No shadows across the frame.** Your own shadow, the phone's shadow, a cable
lying over it: all of them tile.

**Hold it steady and let it focus.** These get looked at close up. A soft
photograph makes a soft surface.

**Roughly square crop**, about 1000px on the side. The embed tool resizes, so
anything from 1000px up is fine. Bigger is not better here.

Send them as ordinary JPEGs. Filenames do not matter; tell me which is which.

---

## The eight

| # | Surface | Where to find one | What has to be in frame |
|---|---------|-------------------|-------------------------|
| 1 | **Bare circuit board** | A dead motherboard or expansion card. An area with *no* components — between the slots, or the back of the board. | The fibreglass weave under the solder mask, and the faint texture of the mask itself. Green is ideal since most boards here are green. If you can get a clear patch with a few traces running through it, better. |
| 2 | **Brushed aluminium** | A laptop lid or bottom cover, a heatsink base, a drive caddy. | The drawn lines running one way. That directional grain is the entire reason aluminium looks different from painted metal under a light. |
| 3 | **Painted steel** | A PC case side panel, a rack rail, a PSU shell. | Flat industrial paint over metal — slightly orange-peel, not glossy. Scuffs and handling marks are welcome, they are what makes it real. |
| 4 | **Moulded ABS plastic** | A printer shell, a keyboard base, a monitor back. | The fine pebble or bead-blast finish on the moulding. Get close enough that the texture is clearly visible rather than a smooth grey field. |
| 5 | **Rubber roller** | A printer pickup or transfer roller, or a platen. | The matte rubber surface. If you have one worn to a shine in a band, shoot **two**: one worn, one healthy. That pair is worth more than most of this list. |
| 6 | **Anodised black** | A laptop hinge, a camera-style black aluminium part, a black heatsink. | Black that still shows surface — the thing flat black paint in a render never does. |
| 7 | **Dust and felt** | A neglected heatsink fin stack or a fan filter, packed. | The matted, felted grey mass. This one is a *fault* texture and it is the one students are asked to recognise most often. Do not clean it up first. |
| 8 | **Paper / label stock** | A drive label, an asset tag, a spec sticker. | The paper surface and the printed edge quality. Shoot a blank or unimportant area — the text gets generated, not photographed. |

---

## Worth doing if you have the parts

Not tiles — these would be **reference photographs** shown beside the model,
the way the RJ45 plug already is on the cabling track. They are the cases
where a drawn model genuinely cannot carry the information.

- A **domed capacitor bank** next to a flat one, same board if possible.
- A **swollen laptop cell**, on the bench so the rock is visible.
- A **T568A and a T568B plug** side by side, close enough to read the
  conductor colours through the body.
- A **scorched patch** on a board, close.

---

## Getting them in

```
python3 tools/embed-photo.py <part-key> path/to/photo.jpg
```

It resizes, re-encodes and refuses anything that would bloat the page. Then
fill in the `alt` and `look` fields it leaves empty — the build refuses to load
until you do, on purpose: a photograph with no description is invisible to a
student using a screen reader, and one with no line saying what to look at is
scenery.
