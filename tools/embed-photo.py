#!/usr/bin/env python3
"""Put a photograph into assets/photos.js.

    python3 tools/embed-photo.py plugnear ~/photos/rj45.jpg

This site fetches nothing — it has to work from a memory stick in a room
with no network — so a photograph is stored as base64 inside a JavaScript
file rather than as an image next to it. Doing that by hand is how a 30MB
camera original ends up in the repo, so this resizes and re-encodes first
and refuses anything that would bloat the page.

It writes the entry with EMPTY alt and look fields and then tells you to
fill them in, deliberately. A photograph with no alt text is invisible to a
student using a screen reader, and one with no "look" line is scenery; the
loader in photos.js throws on either, so a half-finished entry fails loudly
at load rather than quietly in front of a class.

Needs Pillow for the resize. Without it, resize the image yourself to about
1000px on the long edge and pass --no-resize.
"""
import argparse
import base64
import io
import os
import re
import sys

MAX_EDGE = 1000          # plenty for a part photograph in a panel this size
MAX_KB = 220             # per photograph, once encoded
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TARGET = os.path.join(ROOT, "assets", "photos.js")


def encode(path, resize=True, quality=78):
    raw = open(path, "rb").read()
    if not resize:
        return raw
    try:
        from PIL import Image
    except ImportError:
        sys.exit("Pillow is not installed. Either `pip install Pillow`, or resize the "
                 "image to about %dpx on the long edge yourself and pass --no-resize."
                 % MAX_EDGE)
    im = Image.open(io.BytesIO(raw))
    im = im.convert("RGB")
    if max(im.size) > MAX_EDGE:
        scale = MAX_EDGE / float(max(im.size))
        im = im.resize((max(1, int(im.width * scale)), max(1, int(im.height * scale))),
                       Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, format="JPEG", quality=quality, optimize=True, progressive=True)
    return buf.getvalue()


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("part", help="the part key the model already uses, e.g. plugnear")
    ap.add_argument("image", help="path to the photograph")
    ap.add_argument("--no-resize", action="store_true", help="embed the file as it is")
    ap.add_argument("--quality", type=int, default=78)
    a = ap.parse_args()

    if not os.path.exists(a.image):
        sys.exit("No such file: " + a.image)
    data = encode(a.image, resize=not a.no_resize, quality=a.quality)
    b64 = base64.b64encode(data).decode("ascii")
    kb = len(b64) / 1024.0
    if kb > MAX_KB:
        sys.exit("That comes to %.0f KB encoded, over the %d KB limit. Every photograph "
                 "is carried by every student on every page load, including the ones on "
                 "a phone tethered in a classroom. Crop it tighter or drop the quality."
                 % (kb, MAX_KB))

    src = open(TARGET, encoding="utf-8").read()
    if re.search(r'^\s*%s\s*:\s*\{' % re.escape(a.part), src, re.M):
        sys.exit('"%s" already has a photograph in assets/photos.js. Remove that entry '
                 "first if you mean to replace it." % a.part)

    entry = (
        '  %s: {\n'
        '    src: "data:image/jpeg;base64,%s",\n'
        '    alt: "",   /* DESCRIBE the photograph. This is what a student using a screen\n'
        '                  reader gets instead of it. Not "photo of a plug": say what is\n'
        '                  in the frame and what can be seen. */\n'
        '    look: ""   /* One line: what to look AT, and why the model cannot show it. */\n'
        '  },\n' % (a.part, b64)
    )
    out = src.replace("export const PHOTOS = {\n", "export const PHOTOS = {\n" + entry, 1)
    if out == src:
        sys.exit("Could not find the PHOTOS table in assets/photos.js.")
    open(TARGET, "w", encoding="utf-8").write(out)

    print("Added %s to assets/photos.js  (%.0f KB encoded)" % (a.part, kb))
    print()
    print("NOW FILL IN alt AND look. photos.js throws at load until you do, which means")
    print("the page will not open rather than opening with a photograph nobody can use.")


if __name__ == "__main__":
    main()
