/* =====================================================================
   Shorthand in a part description, expanded into real primitives

   `repeat` stamps a primitive along a step vector; `ring` arranges copies
   around an axis. Between them, a forty-fin heatsink and a seven-blade fan
   are three lines of description each instead of forty-seven.

   This lives on its own, apart from the renderer, because two things need
   it and they must not each have their own copy. The scene expands a part
   before drawing it; the damage transforms expand a part before tilting it,
   and when only the scene could, tilting a memory module rotated the base
   chip while its four repeated copies carried on marching along the old
   axis — the module came apart into a splayed fan of sticks. Nothing here
   touches the renderer, so importing it does not drag three.js in.
   ===================================================================== */
export function expand(list) {
  var out = [];
  (list || []).forEach(function (p) {
    if (p.ring) {
      var n = p.ring.count, rad = p.ring.radius, ax = p.ring.axis || "y";
      for (var i = 0; i < n; i++) {
        var a = (i / n) * Math.PI * 2 + (p.ring.phase || 0);
        var q = Object.assign({}, p); delete q.ring;
        var px = p.pos ? p.pos[0] : 0, py = p.pos ? p.pos[1] : 0, pz = p.pos ? p.pos[2] : 0;
        var r0 = p.rot ? p.rot.slice() : [0, 0, 0];
        if (ax === "y") {
          q.pos = [px + Math.cos(a) * rad, py, pz + Math.sin(a) * rad];
          q.rot = [r0[0], r0[1] - a, r0[2]];
        } else if (ax === "x") {
          q.pos = [px, py + Math.cos(a) * rad, pz + Math.sin(a) * rad];
          q.rot = [r0[0] - a, r0[1], r0[2]];
        } else {
          q.pos = [px + Math.cos(a) * rad, py + Math.sin(a) * rad, pz];
          q.rot = [r0[0], r0[1], r0[2] - a];
        }
        out.push(q);
      }
      return;
    }
    if (p.repeat) {
      var c = p.repeat.count, st = p.repeat.step || [0, 0, 0];
      for (var j = 0; j < c; j++) {
        var w = Object.assign({}, p); delete w.repeat;
        var b = p.pos || [0, 0, 0];
        w.pos = [b[0] + st[0] * j, b[1] + st[1] * j, b[2] + st[2] * j];
        out.push(w);
      }
      return;
    }
    out.push(p);
  });
  return out;
}

