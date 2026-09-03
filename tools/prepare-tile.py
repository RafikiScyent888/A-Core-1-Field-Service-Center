#!/usr/bin/env python3
"""Check, seam-blend and embed a material tile into assets/tiles.js.

    python3 tools/prepare-tile.py rubber ~/photos/roller.jpg
    python3 tools/prepare-tile.py rubber ~/photos/roller.jpg --check-only

WHY THIS EXISTS

Two supplied images have already been rejected after the fact, and one of
them had to be pulled back out again:

  * brushed aluminium — a lighting gradient across the frame. Once tiled,
    that gradient becomes a visible checkerboard of light and dark squares.
    It is the one mistake that cannot be corrected afterwards, because the
    shading is baked into the pixels.
  * rubber roller — supplied as a product photograph of two rollers on a
    white background rather than a swatch filling the frame. There is no
    patch of it large enough or flat enough to crop a tile out of.

Both were caught by eye, late. Judged by eye, "is this too much of a
gradient" is a coin flip, so this measures instead, against the two tiles
whose verdict is already settled: the dust tile that is in and working, and
the brushed tile that was rejected. Every threshold below sits between
those two, and `--calibrate` re-runs that comparison so the numbers can be
checked rather than trusted.

Run it BEFORE sending a photograph. It takes a second and it will tell you
to reshoot while the part is still on the bench, which is the only time
reshooting is cheap.

WHAT IT DOES ONCE A PHOTO PASSES

Crops square, resizes to 512, and makes it repeat without a seam by an
offset blend — roll the image by half so each copy's wrapping seam lands in
the middle of the other, then blend across the join. Mirroring is also
seamless and it is unusable: it produces a kaleidoscope that any feature
larger than a few pixels gives away instantly.

Then it writes the entry into assets/tiles.js with an EMPTY look field, and
tells you to fill it in. The loader throws on a missing look line, on
purpose: a tile with no line saying what to look at is scenery.

Needs Pillow and numpy.
"""
import argparse
import base64
import io
import os
import re
import sys

TILE_PX = 512            # what the scene samples; the header documents this
MIN_SRC = 420            # below this a resize to 512 is invention, not detail
MAX_KB = 120             # per tile, encoded; these are embedded in a download

# Thresholds. Each sits BETWEEN the accepted dust tile and the rejected
# brushed one, with room on both sides — run --calibrate to re-measure both.
# As measured by this tool, after trimming:  dust / brushed
#   gradient   11.7 / 25.2      focus  1136 / 152
#   chroma     17.3 /  0.8      seam    1.1 / 1.6
# The gradient limit was 12.0 for one run, which passed dust by 0.3 of a
# point. A threshold that close to the thing it must accept is luck, not a
# judgement, and the next slightly-unevener good photo would have been
# rejected. 16 keeps four points of room under dust and nine over brushed.
MAX_GRADIENT = 16.0      # %
MIN_FOCUS = 60.0         # variance of Laplacian; a soft photo is a soft surface
MAX_CHROMA = 40.0        # mean RGB saturation; grain MULTIPLIES over part colour
MAX_SEAM = 1.8           # x the texture's own roughness; 1.0 = as smooth as any row pair

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TARGET = os.path.join(ROOT, "assets", "tiles.js")


def _np():
    try:
        import numpy as np
        return np
    except ImportError:
        sys.exit("numpy is not installed: pip install numpy Pillow")


def _pil():
    try:
        from PIL import Image
        return Image
    except ImportError:
        sys.exit("Pillow is not installed: pip install numpy Pillow")


def trim_border(im):
    """Strip a uniform frame — the dark surround a screenshot carries, or a
       letterbox from an export.

       This is not a nicety. A five-pixel dark frame ruins three separate
       measurements at once: it sits in the corner quadrants and reads as a
       lighting gradient (dust measured 29.8% with its frame on and 4.0% with
       it off), and it lands on the tile's outer edges so the wrap never
       matches. Every candidate so far has arrived as a screenshot with a
       frame, so trimming has to happen before anything is judged."""
    np = _np()
    a = np.asarray(im.convert("L"), dtype=float)
    h, w = a.shape

    # Find the content by asking which pixels differ from the FRAME colour,
    # sampled at the corners. Walking inward row by row while the row looks
    # uniform does not work on a rounded frame: the very first row that
    # clips a corner arc has dark ends and bright middle, so it fails the
    # uniformity test and the walk stops with the whole arc still in shot.
    ref = float(np.median([a[:3, :3].mean(), a[:3, -3:].mean(),
                           a[-3:, :3].mean(), a[-3:, -3:].mean()]))
    mask = np.abs(a - ref) > 12
    ys, xs = np.where(mask)
    if mask.mean() > 0.98 or ys.size == 0:
        top, left, bot, right = 0, 0, h, w      # no frame: a real full-frame swatch
    else:
        top, bot = int(ys.min()), int(ys.max()) + 1
        left, right = int(xs.min()), int(xs.max()) + 1
    if right - left < 16 or bot - top < 16:
        return im
    # Then inset. The bounding box still touches the corner arcs on a rounded
    # frame, and anything left there lands in the corner quadrants where the
    # gradient check reads it as a hotspot: dust measured 32.1% with the arcs
    # in and 4.0% with them out. 6% is well inside any real swatch.
    inset = int(min(right - left, bot - top) * 0.06)
    return im.crop((left + inset, top + inset, right - inset, bot - inset))


def square(im):
    """Centre crop to a square. A tile is square by definition; cropping here
       rather than asking for it means a slightly-off phone shot still works."""
    s = min(im.size)
    l = (im.width - s) // 2
    t = (im.height - s) // 2
    return im.crop((l, t, l + s, t + s))


def gradient(im):
    """Corner-to-corner luminance spread as a percentage of the mean. This is
       the measurement that would have caught the brushed tile before it was
       embedded: an even swatch is flat corner to corner, a hotspot is not."""
    np = _np()
    a = np.asarray(im.convert("L"), dtype=float)
    q = max(4, min(a.shape) // 4)
    c = [a[:q, :q].mean(), a[:q, -q:].mean(), a[-q:, :q].mean(), a[-q:, -q:].mean()]
    return (max(c) - min(c)) / max(1e-9, a.mean()) * 100.0


def focus(im):
    """Variance of the Laplacian — the standard sharpness proxy. These tiles
       get looked at close up, so a soft photograph makes a soft surface."""
    np = _np()
    a = np.asarray(im.convert("L"), dtype=float)
    lap = (-4 * a[1:-1, 1:-1] + a[:-2, 1:-1] + a[2:, 1:-1] + a[1:-1, :-2] + a[1:-1, 2:])
    return float(lap.var())


def chroma(im):
    """How coloured the tile is: mean RGB saturation, max channel minus min.

       A MATERIAL GRAIN carries no colour of its own — it multiplies over
       whatever colour the part already is — so a strongly tinted tile would
       push that tint onto every part sharing it. (A `printed` surface is the
       opposite and would fail this on purpose; those are generated here, not
       photographed.)

       This was first written against PIL's LAB, on the assumption that its a
       and b channels are neutral at 128. They are not — measured on the dust
       tile they run 0..255 with means of 6.6 and 25.0, so every candidate
       scored around 250 and the check failed everything including the tile
       already in use. Saturation in RGB has no such ambiguity."""
    np = _np()
    a = np.asarray(im.convert("RGB"), dtype=float)
    return float((a.max(axis=2) - a.min(axis=2)).mean())


def seamless(im):
    """Offset-roll and blend so the tile repeats without a visible join."""
    np = _np()
    Image = _pil()
    a = np.asarray(im.convert("RGB"), dtype=float)
    n = a.shape[0]
    h = n // 2
    rolled = np.roll(np.roll(a, h, axis=0), h, axis=1)
    # Blend a band either side of the seam the roll just moved to the middle.
    band = max(8, n // 12)
    ramp = np.linspace(0.0, 1.0, band * 2)[:, None, None]
    out = rolled.copy()
    ys = slice(h - band, h + band)
    out[ys, :, :] = rolled[ys, :, :] * (1 - ramp) + np.flip(rolled[ys, :, :], axis=0) * ramp
    ramp2 = np.linspace(0.0, 1.0, band * 2)[None, :, None]
    xs = slice(h - band, h + band)
    out[:, xs, :] = out[:, xs, :] * (1 - ramp2) + np.flip(out[:, xs, :], axis=1) * ramp2
    return Image.fromarray(np.clip(out, 0, 255).astype("uint8"))


def seam(im):
    """Residual discontinuity where the tile wraps, as a MULTIPLE of the
       texture's own roughness. 1.0 means the join is as continuous as any
       other pair of neighbouring rows; a hard seam is several times that.

       The first version of this divided the edge mismatch by the mean
       brightness and called it a percentage. That measures the texture, not
       the seam: on a felted dust mat two ADJACENT rows already differ by
       ~15% of the mean, so the accepted tile scored 15.3% against a 6% limit
       and was rejected by a check written to approve it. What matters is not
       how different the two edges are, but whether they are more different
       than neighbouring rows normally are."""
    np = _np()
    a = np.asarray(im.convert("L"), dtype=float)
    natural = max(1e-9, (np.abs(np.diff(a, axis=0)).mean() + np.abs(np.diff(a, axis=1)).mean()) / 2.0)
    v = np.abs(a[0, :] - a[-1, :]).mean()
    h = np.abs(a[:, 0] - a[:, -1]).mean()
    return max(v, h) / natural


def assess(path):
    """Measure a candidate. Returns (rows, ok) — rows are (name, value, limit,
       passed) so the caller can print the whole picture rather than the first
       thing that failed. Somebody reshooting wants every problem at once."""
    Image = _pil()
    im = trim_border(Image.open(path).convert("RGB"))
    src_edge = min(im.size)
    work = square(im).resize((TILE_PX, TILE_PX), Image.LANCZOS)
    blended = seamless(work)
    # Measured once each. An earlier version called gradient() and chroma()
    # twice per row — same answer, but it invited them to drift apart.
    g, f, c, s = gradient(work), focus(work), chroma(work), seam(blended)
    rows = [
        ("source short edge", src_edge, ">= %d px" % MIN_SRC, src_edge >= MIN_SRC),
        ("lighting gradient", g, "<= %.1f %%" % MAX_GRADIENT, g <= MAX_GRADIENT),
        ("focus", f, ">= %.0f" % MIN_FOCUS, f >= MIN_FOCUS),
        ("colour cast", c, "<= %.0f" % MAX_CHROMA, c <= MAX_CHROMA),
        ("seam after blend", s, "<= %.1f x" % MAX_SEAM, s <= MAX_SEAM),
    ]
    return rows, blended, all(r[3] for r in rows)


def report(name, rows, ok):
    print("\n  %s" % name)
    for n, v, lim, good in rows:
        val = ("%8.1f" % v) if isinstance(v, float) else ("%8d" % v)
        print("    %-18s %s   %-12s %s" % (n, val, lim, "ok" if good else "FAILS"))
    print("    -> %s" % ("usable" if ok else "NOT usable as a tile"))
    return ok


def calibrate(args):
    """Re-measure the two tiles whose verdict is already settled. The accepted
       one must pass and the rejected one must fail, or the thresholds here
       have drifted away from the decisions they were derived from."""
    if len(args) != 2:
        sys.exit("--calibrate needs two paths: the accepted dust source, then "
                 "the rejected brushed one.")
    good_rows, _, good_ok = assess(args[0])
    bad_rows, _, bad_ok = assess(args[1])
    report("ACCEPTED (dust) — must pass", good_rows, good_ok)
    report("REJECTED (brushed) — must fail", bad_rows, bad_ok)
    if good_ok and not bad_ok:
        print("\n  calibrated: the check agrees with both settled decisions.\n")
        return 0
    print("\n  NOT CALIBRATED. The thresholds no longer reproduce the decisions "
          "they came from; fix them before trusting a verdict.\n")
    return 1


def embed(key, blended, credit):
    Image = _pil()
    for q in (82, 76, 70, 64, 58):
        buf = io.BytesIO()
        blended.save(buf, format="JPEG", quality=q, optimize=True, progressive=True)
        if len(buf.getvalue()) <= MAX_KB * 1024:
            break
    else:
        sys.exit("Even at quality 58 this is over %d KB. These are embedded in "
                 "something students download over a phone tether." % MAX_KB)
    b64 = base64.b64encode(buf.getvalue()).decode("ascii")
    src = open(TARGET).read()
    if re.search(r'^\s{2}%s:\s*\{' % re.escape(key), src, re.M):
        sys.exit('tiles.js already has a "%s" entry. Remove it first — this '
                 'tool will not silently replace a tile somebody chose.' % key)
    entry = (
        '  %s: {\n'
        '    /* FILL THIS IN: what this surface is and where it came from. */\n'
        '    credit: %s,\n'
        '    look: "",\n'
        '    src: "data:image/jpeg;base64,%s"\n'
        '  },\n' % (key, ('"%s"' % credit) if credit else '""', b64)
    )
    marker = "export const TILES = {\n"
    if marker not in src:
        sys.exit("Could not find the TILES table in assets/tiles.js.")
    open(TARGET, "w").write(src.replace(marker, marker + entry, 1))
    print("\n  written into assets/tiles.js as \"%s\" (%d KB encoded)" % (key, len(b64) // 1024))
    print("  NOW FILL IN `look` (and `credit` if it is empty). The loader throws")
    print("  on an empty look line on purpose — a tile with no line saying what")
    print("  to look at is scenery.\n")


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("key", nargs="?", help="painter name: moulded, rubber or steel")
    ap.add_argument("image", nargs="?", help="path to the photograph")
    ap.add_argument("--check-only", action="store_true",
                    help="measure and report, write nothing")
    ap.add_argument("--credit", default="", help="provenance line for the tile")
    ap.add_argument("--calibrate", nargs=2, metavar=("ACCEPTED", "REJECTED"),
                    help="re-measure the dust and brushed images to prove the "
                         "thresholds still reproduce those two decisions")
    a = ap.parse_args()

    if a.calibrate:
        sys.exit(calibrate(a.calibrate))
    if not a.key or not a.image:
        ap.error("give a painter name and an image, or use --calibrate")

    rows, blended, ok = assess(a.image)
    report(os.path.basename(a.image), rows, ok)
    if not ok:
        print("\n  Not embedded. See tools/PHOTO-SHOT-LIST.md for how to shoot "
              "these —\n  the usual cause is a hotspot or shooting too far back.\n")
        sys.exit(1)
    if a.check_only:
        print("\n  --check-only: nothing written.\n")
        return
    embed(a.key, blended, a.credit)


if __name__ == "__main__":
    main()
