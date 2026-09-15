/* cs-strokes.js — the stroke layer.

   THE IDEA: a CSS border is a perfect, even line. A real pen is not. So for
   every element that wants a hand-drawn edge we hide its CSS border and draw
   the same shape again as an SVG outline: the path wanders slightly off the
   true edge, its thickness swells and thins the way pressure does, it
   overshoots the corner it started from, and it is drawn twice — because a
   person going round a box twice never lands on the same line.

   The four numbers that control it were settled in the stroke lab against
   Caraxes's own Procreate strokes: roughness 3.2, detail 24, pressure 0.39,
   overshoot 0.018, two passes. */
window.CS = window.CS || {};
(function (CS) {
  'use strict';
  var S = CS.STROKE;
  var SVG_NS = 'http://www.w3.org/2000/svg';
  var queue = new Set();
  var frame = null;

  function rng(seed) {
    var s = (seed >>> 0) || 7;
    return function () {
      s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0;
      return s / 4294967296;
    };
  }

  /* smooth wander: a few sine waves of different lengths added together, the
     way a hand drifts rather than jitters */
  function wobbler(seed) {
    var r = rng(seed);
    var a = [], f = [], ph = [];
    for (var i = 0; i < 4; i++) {
      a.push(1 / (i + 1));
      f.push((i + 1) * (1.1 + r() * 1.4));
      ph.push(r() * Math.PI * 2);
    }
    return function (t) {
      var v = 0, sum = 0;
      for (var i = 0; i < 4; i++) {
        v += a[i] * Math.sin(t * Math.PI * 2 * f[i] + ph[i]);
        sum += a[i];
      }
      return v / sum;
    };
  }

  /* the true outline of a rounded rectangle, sampled evenly, with the outward
     direction at every point */
  function outline(w, h, r, count) {
    r = Math.max(0, Math.min(r, Math.min(w, h) / 2));
    var seg = [];
    var k = r * Math.PI / 2;                       // length of one corner arc
    seg.push({ t: 'l', len: w - 2 * r, x1: r, y1: 0, x2: w - r, y2: 0, nx: 0, ny: -1 });
    seg.push({ t: 'a', len: k, cx: w - r, cy: r, a0: -Math.PI / 2 });
    seg.push({ t: 'l', len: h - 2 * r, x1: w, y1: r, x2: w, y2: h - r, nx: 1, ny: 0 });
    seg.push({ t: 'a', len: k, cx: w - r, cy: h - r, a0: 0 });
    seg.push({ t: 'l', len: w - 2 * r, x1: w - r, y1: h, x2: r, y2: h, nx: 0, ny: 1 });
    seg.push({ t: 'a', len: k, cx: r, cy: h - r, a0: Math.PI / 2 });
    seg.push({ t: 'l', len: h - 2 * r, x1: 0, y1: h - r, x2: 0, y2: r, nx: -1, ny: 0 });
    seg.push({ t: 'a', len: k, cx: r, cy: r, a0: Math.PI });

    var total = seg.reduce(function (a, s) { return a + Math.max(0, s.len); }, 0);
    if (total <= 0) return { pts: [], total: 0 };

    function at(dist) {
      var d = ((dist % total) + total) % total;
      for (var i = 0; i < seg.length; i++) {
        var s = seg[i];
        var L = Math.max(0, s.len);
        if (d <= L || i === seg.length - 1) {
          var u = L ? d / L : 0;
          if (s.t === 'l') {
            return { x: s.x1 + (s.x2 - s.x1) * u, y: s.y1 + (s.y2 - s.y1) * u, nx: s.nx, ny: s.ny };
          }
          var a = s.a0 + u * Math.PI / 2;
          return { x: s.cx + r * Math.cos(a), y: s.cy + r * Math.sin(a), nx: Math.cos(a), ny: Math.sin(a) };
        }
        d -= L;
      }
      return { x: 0, y: 0, nx: 0, ny: 0 };
    }

    var pts = [];
    var over = total * S.overshoot;
    var n = Math.max(24, Math.round(count * (total / 1200 + 1)));
    for (var i = 0; i <= n; i++) {
      var dist = -over + (total + over * 2) * (i / n);
      var p = at(dist);
      p.u = i / n;
      pts.push(p);
    }
    return { pts: pts, total: total };
  }

  function pathFor(pts, from, to, wob, rough) {
    var d = '';
    for (var i = from; i <= to && i < pts.length; i++) {
      var p = pts[i];
      var off = wob(p.u) * rough;
      var x = (p.x + p.nx * off).toFixed(2);
      var y = (p.y + p.ny * off).toFixed(2);
      d += (i === from ? 'M' : 'L') + x + ' ' + y;
      if (i < to) d += ' ';
    }
    return d;
  }

  function render(el) {
    var w = el.offsetWidth, h = el.offsetHeight;   // layout size, never the
    if (!w || !h) return;                          // transformed size
    var cs = getComputedStyle(el);
    var r = parseFloat(el.dataset.csStroke);
    if (isNaN(r)) r = parseFloat(cs.borderTopLeftRadius) || 0;

    var old = el.querySelector(':scope > .cs-stroke');
    if (old) old.remove();

    var svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'cs-stroke');
    svg.setAttribute('width', w);
    svg.setAttribute('height', h);
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    svg.setAttribute('aria-hidden', 'true');

    var seed = (w * 31 + h * 17 + (el.dataset.csSeed ? +el.dataset.csSeed : 0)) | 0;
    var o = outline(w, h, r, S.detail);
    if (!o.pts.length) return;

    var chunks = 8;
    for (var pass = 0; pass < S.passes; pass++) {
      var wob = wobbler(seed + pass * 977);
      var press = wobbler(seed + pass * 331 + 5);
      var rough = S.roughness * (pass === 0 ? 1 : 1.18);
      var base = S.baseWidth * (pass === 0 ? 1 : 0.72);
      var step = Math.ceil((o.pts.length - 1) / chunks);
      for (var c = 0; c < chunks; c++) {
        var from = c * step;
        var to = Math.min(o.pts.length - 1, from + step);
        if (to <= from) continue;
        var path = document.createElementNS(SVG_NS, 'path');
        path.setAttribute('d', pathFor(o.pts, from, to, wob, rough));
        var t = (c + 0.5) / chunks;
        var width = base * (1 + S.pressure * press(t));
        path.setAttribute('stroke-width', Math.max(0.5, width).toFixed(2));
        if (pass === 1) path.setAttribute('opacity', '0.68');
        svg.appendChild(path);
      }
    }
    el.insertBefore(svg, el.firstChild);
  }

  function flush() {
    frame = null;
    queue.forEach(render);
    queue.clear();
  }

  function schedule(el) {
    queue.add(el);
    if (!frame) frame = requestAnimationFrame(flush);
  }

  var observer = ('ResizeObserver' in window) ? new ResizeObserver(function (entries) {
    entries.forEach(function (e) { schedule(e.target); });
  }) : null;

  CS.strokes = {
    /* Give every element carrying data-cs-stroke a drawn outline, and keep it
       in step when the element changes size. */
    apply: function (root) {
      var list = (root || document).querySelectorAll('[data-cs-stroke]');
      list.forEach(function (el) {
        schedule(el);
        if (observer) observer.observe(el);
      });
    },
    refresh: function () {
      document.querySelectorAll('[data-cs-stroke]').forEach(schedule);
    }
  };
})(window.CS);
