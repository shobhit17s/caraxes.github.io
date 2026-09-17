/* hw-planet.js — one low-poly planet, drawn as if by hand.
   Geometry gives us the silhouette and the way light falls; everything you
   actually *see* is a stroke: seams between facets that wander the way a hand
   does, a chalk contour, pencil hatching in the shadows, and your own drawings
   pinned to the surface.

   Two different kinds of line live here, on purpose:
     - inside the planet, the seams wander but never change. They are drawn
       once and carried around as the planet turns.
     - around the edge, the contour boils — it is redrawn a few times a second,
       because that is what an inked outline does in hand-drawn animation. */
window.HW = window.HW || {};
(function (HW) {
  'use strict';
  var V = HW.V;
  var BOIL_SETS = 3;

  HW.createPlanet = function (def, index) {
    var geo = HW.icosphere(def.detail);
    var rand = HW.rng(917 + index * 613);
    var n = geo.verts.length;

    // Nudge each corner in or out so the sphere reads as folded paper,
    // never as a perfect ball.
    var local = new Array(n);
    for (var i = 0; i < n; i++) {
      var r = def.radius * (1 + (rand() - 0.5) * 0.16);
      local[i] = V.mul(geo.verts[i], r);
    }

    // Pre-rolled "hands": three slightly different wobbles we cycle between so
    // the line boils the way ink does in hand-drawn animation.
    var jitter = [];
    for (var s = 0; s < BOIL_SETS; s++) {
      var set = new Float32Array(n * 2);
      for (var j = 0; j < n; j++) {
        set[j * 2] = (rand() - 0.5) * 2;
        set[j * 2 + 1] = (rand() - 0.5) * 2;
      }
      jitter.push(set);
    }

    var faceTone = new Float32Array(geo.faces.length);
    for (var f = 0; f < geo.faces.length; f++) faceTone[f] = (rand() - 0.5) * 0.09;

    /* Every seam between two facets wanders, and it wanders the SAME way for
       both facets that meet along it — so the shapes still tile with no gaps,
       they just no longer meet along a ruler-straight line. Unlike the
       contour, this wander is rolled once and never changes: the inside of a
       planet is drawn, not animated. */
    var WAVE = 2;                                  // bends per seam
    var edgeWave = new Float32Array(geo.edges.length * WAVE);
    var edgeWidth = new Float32Array(geo.edges.length);
    var edgePts = new Float32Array(geo.edges.length * WAVE * 2);
    var edgeNorm = new Float32Array(geo.edges.length * 2);
    for (var ew = 0; ew < geo.edges.length; ew++) {
      for (var wv = 0; wv < WAVE; wv++) edgeWave[ew * WAVE + wv] = (rand() - 0.5) * 2;
      edgeWidth[ew] = 0.65 + rand() * 0.75;        // a little pressure variation
    }

    /* which three seams belong to each facet, and which way round */
    var edgeLookup = {};
    for (var el = 0; el < geo.edges.length; el++) {
      edgeLookup[geo.edges[el].a + '_' + geo.edges[el].b] = el;
    }
    var faceEdges = geo.faces.map(function (face) {
      var out = [];
      for (var e = 0; e < 3; e++) {
        var p1 = face[e], q1 = face[(e + 1) % 3];
        out.push({ e: edgeLookup[Math.min(p1, q1) + '_' + Math.max(p1, q1)], rev: p1 > q1 });
      }
      return out;
    });

    var props = (def.props || []).map(function (p) {
      return {
        dir: HW.latLon(p.lat, p.lon), size: p.size, src: p.src, img: null,
        href: p.href || null, label: p.label || ''   // a prop with an href is a door
      };
    });

    // snacks: like props, but clickable, and they grow back after they are eaten
    var food = (def.food || []).map(function (p, i) {
      return {
        dir: HW.latLon(p.lat, p.lon), size: p.size, src: p.src, img: null,
        eatenAt: 0, phase: i * 1.9
      };
    });

    var world = new Array(n);
    var screen = new Array(n);
    for (var k = 0; k < n; k++) { world[k] = { x: 0, y: 0, z: 0 }; screen[k] = { x: 0, y: 0, depth: 0, ok: false }; }

    return {
      def: def,
      props: props,
      food: food,
      hotspots: [],        // clickable things on screen: snacks and doors
      hoverFood: null,
      hoverLink: null,
      geo: geo,
      screen: { x: 0, y: 0, r: 0, depth: 0, visible: false },

      /* Project the whole planet for this frame. `spinTime` is the rotation
         clock from the scene, not wall time. */
      update: function (cam, spinTime, motion) {
        var angle = spinTime * def.spin * (motion ? 1 : 0.18);
        var m = HW.spinMatrix(def.tilt.x, def.tilt.z, angle);
        this.matrix = m;
        for (var i = 0; i < n; i++) {
          var w = HW.applyMatrix(m, local[i]);
          world[i].x = w.x + def.pos.x;
          world[i].y = w.y + def.pos.y;
          world[i].z = w.z + def.pos.z;
          cam.project(world[i], screen[i]);
        }
        var c = cam.project(def.pos, {});
        this.screen.x = c.x; this.screen.y = c.y;
        this.screen.depth = c.depth;
        this.screen.r = c.ok ? def.radius * cam.focal / c.depth : 0;
        this.screen.visible = c.ok && c.depth > 0.2;
      },

      draw: function (ctx, cam, time, motion) {
        this.hotspots.length = 0;
        if (!this.screen.visible || this.screen.r < 2) return;
        var P = HW.PALETTE;
        var L = V.norm(HW.SETTINGS.lightDir);
        var camPos = cam.pos;
        var faces = geo.faces;
        var radiusPx = this.screen.r;

        // how far the hand slips, in pixels — bigger planets, looser line
        var wob = HW.clamp(radiusPx * 0.014, 0.35, 2.4);
        var setIndex = motion ? (Math.floor(time * HW.SETTINGS.boilFps) % BOIL_SETS) : 0;
        var jx = jitter[setIndex];

        /* --- atmosphere: a loose chalk circle drawn a little too big --- */
        ctx.save();
        ctx.globalAlpha = 0.16;
        ctx.strokeStyle = P.chalk;
        ctx.lineWidth = 1.2;
        ctx.setLineDash([radiusPx * 0.12, radiusPx * 0.1]);
        ctx.beginPath();
        ctx.ellipse(this.screen.x, this.screen.y, radiusPx * 1.13, radiusPx * 1.1,
          time * 0.04, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        if (def.ring) {
          ctx.save();
          ctx.globalAlpha = 0.4;
          ctx.strokeStyle = P.chalk;
          ctx.lineWidth = 1.6;
          ctx.setLineDash([7, 6]);
          ctx.beginPath();
          ctx.ellipse(this.screen.x, this.screen.y, radiusPx * 1.75, radiusPx * 0.42,
            -0.42, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        /* --- facets --- */
        var edges = geo.edges;
        var lightOf = new Float32Array(faces.length);
        var front = new Uint8Array(faces.length);

        // the inside of the planet sits still: it uses the first wobble set,
        // never the one that changes with time
        var js = jitter[0];
        var sxS = function (i) { return screen[i].x + js[i * 2] * wob; };
        var syS = function (i) { return screen[i].y + js[i * 2 + 1] * wob; };

        // where each seam wanders, this frame, in screen space
        for (var ei2 = 0; ei2 < edges.length; ei2++) {
          var ed = edges[ei2];
          var ax0 = sxS(ed.a), ay0 = syS(ed.a), bx0 = sxS(ed.b), by0 = syS(ed.b);
          var dxE = bx0 - ax0, dyE = by0 - ay0;
          var lenE = Math.sqrt(dxE * dxE + dyE * dyE) || 1;
          var nxE = -dyE / lenE, nyE = dxE / lenE;
          edgeNorm[ei2 * 2] = nxE;
          edgeNorm[ei2 * 2 + 1] = nyE;
          var ampE = HW.clamp(lenE * 0.05, 0.5, 8);
          for (var kk = 0; kk < WAVE; kk++) {
            var tt = (kk + 1) / (WAVE + 1);
            var off = edgeWave[ei2 * WAVE + kk] * ampE;
            edgePts[(ei2 * WAVE + kk) * 2] = ax0 + dxE * tt + nxE * off;
            edgePts[(ei2 * WAVE + kk) * 2 + 1] = ay0 + dyE * tt + nyE * off;
          }
        }

        function traceFace(fi) {
          var fa = faces[fi], fe = faceEdges[fi];
          ctx.moveTo(sxS(fa[0]), syS(fa[0]));
          for (var e = 0; e < 3; e++) {
            var info = fe[e];
            for (var k = 0; k < WAVE; k++) {
              var idx = info.rev ? (WAVE - 1 - k) : k;
              var o = (info.e * WAVE + idx) * 2;
              ctx.lineTo(edgePts[o], edgePts[o + 1]);
            }
            ctx.lineTo(sxS(fa[(e + 1) % 3]), syS(fa[(e + 1) % 3]));
          }
          ctx.closePath();
        }

        for (var fi = 0; fi < faces.length; fi++) {
          var fa = faces[fi];
          var a = world[fa[0]], b = world[fa[1]], c2 = world[fa[2]];
          var nrm = V.norm(V.cross(V.sub(b, a), V.sub(c2, a)));
          var cx = (a.x + b.x + c2.x) / 3, cy = (a.y + b.y + c2.y) / 3, cz = (a.z + b.z + c2.z) / 3;
          var toCam = V.norm({ x: camPos.x - cx, y: camPos.y - cy, z: camPos.z - cz });
          var isFront = V.dot(nrm, toCam) > 0;
          front[fi] = isFront ? 1 : 0;
          if (!isFront) continue;
          if (!screen[fa[0]].ok || !screen[fa[1]].ok || !screen[fa[2]].ok) { front[fi] = 0; continue; }

          var light = HW.clamp01(V.dot(nrm, L) * 0.5 + 0.5);
          light = HW.clamp01(light * light * 1.25 + faceTone[fi]);
          lightOf[fi] = light;

          ctx.beginPath();
          traceFace(fi);
          ctx.fillStyle = HW.shade(def.color, light);
          ctx.fill();

          // pencil hatching where the light does not reach
          if (light < 0.3 && radiusPx > 40) {
            ctx.save();
            ctx.globalAlpha = 0.2;
            ctx.strokeStyle = P.ink;
            ctx.lineWidth = 1;
            var mx = (sxS(fa[0]) + sxS(fa[1]) + sxS(fa[2])) / 3;
            var my = (syS(fa[0]) + syS(fa[1]) + syS(fa[2])) / 3;
            var hl = radiusPx * 0.06;
            ctx.beginPath();
            for (var h = -1; h <= 1; h++) {
              ctx.moveTo(mx - hl + h * 3, my + hl + h * 3.4);
              ctx.lineTo(mx + hl + h * 3, my - hl + h * 3.4);
            }
            ctx.stroke();
            ctx.restore();
          }
        }

        /* --- the seams, drawn one at a time so each keeps its own weight --- */
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        if (radiusPx > 34) {
          for (var ci = 0; ci < edges.length; ci++) {
            var ce = edges[ci];
            if (ce.f[1] < 0) continue;
            if (!front[ce.f[0]] || !front[ce.f[1]]) continue;   // contour, or hidden
            var lt = (lightOf[ce.f[0]] + lightOf[ce.f[1]]) * 0.5;
            ctx.beginPath();
            ctx.moveTo(sxS(ce.a), syS(ce.a));
            for (var k2 = 0; k2 < WAVE; k2++) {
              var o2 = (ci * WAVE + k2) * 2;
              ctx.lineTo(edgePts[o2], edgePts[o2 + 1]);
            }
            ctx.lineTo(sxS(ce.b), syS(ce.b));
            ctx.strokeStyle = 'rgba(11,15,28,' + (0.08 + 0.24 * (1 - lt)).toFixed(3) + ')';
            ctx.lineWidth = edgeWidth[ci];
            ctx.stroke();
          }
        } else {
          // far away, the seams are one faint batched pass
          ctx.beginPath();
          for (var cj = 0; cj < edges.length; cj++) {
            var cf = edges[cj];
            if (cf.f[1] < 0 || !front[cf.f[0]] || !front[cf.f[1]]) continue;
            ctx.moveTo(sxS(cf.a), syS(cf.a));
            for (var k3 = 0; k3 < WAVE; k3++) {
              var o3 = (cj * WAVE + k3) * 2;
              ctx.lineTo(edgePts[o3], edgePts[o3 + 1]);
            }
            ctx.lineTo(sxS(cf.b), syS(cf.b));
          }
          ctx.strokeStyle = 'rgba(11,15,28,0.16)';
          ctx.lineWidth = 0.9;
          ctx.stroke();
        }
        ctx.restore();

        /* --- the inked contour: only the edges where the planet turns away.
               This one still boils, because a contour is the line a person
               redraws every frame. --- */
        ctx.save();
        ctx.lineCap = 'round';
        for (var pass = 0; pass < 2; pass++) {
          ctx.beginPath();
          for (var ei = 0; ei < edges.length; ei++) {
            var e = edges[ei];
            if (e.f[1] < 0) continue;
            if (front[e.f[0]] === front[e.f[1]]) continue;
            var nx = edgeNorm[ei * 2], ny = edgeNorm[ei * 2 + 1];
            var lean = (pass === 0 ? 1 : -1) * wob * 0.7;
            ctx.moveTo(sxS(e.a), syS(e.a));
            for (var q = 0; q < WAVE; q++) {
              var oq = (ei * WAVE + q) * 2;
              // the wander of the seam, plus a shiver that changes with the
              // boil — the contour is the one line that stays alive
              var shiver = jx[((e.a + q * 7 + ei) % (jx.length / 2)) * 2] * wob * 1.1;
              ctx.lineTo(edgePts[oq] + nx * (shiver + lean),
                         edgePts[oq + 1] + ny * (shiver + lean));
            }
            ctx.lineTo(sxS(e.b), syS(e.b));
          }
          ctx.strokeStyle = pass === 0
            ? 'rgba(242,237,225,0.5)'
            : 'rgba(242,237,225,0.78)';
          ctx.lineWidth = pass === 0 ? 3.2 : 1.5;
          ctx.stroke();
        }
        ctx.restore();

        /* --- the habitat: your drawings, standing on the surface --- */
        var m2 = this.matrix;
        var list = [];
        for (var pi = 0; pi < props.length; pi++) {
          var pr = props[pi];
          if (!pr.img || !pr.img.complete || !pr.img.naturalWidth) continue;
          var dirW = HW.applyMatrix(m2, pr.dir);
          var base = {
            x: def.pos.x + dirW.x * def.radius * 0.99,
            y: def.pos.y + dirW.y * def.radius * 0.99,
            z: def.pos.z + dirW.z * def.radius * 0.99
          };
          var toCamP = V.norm(V.sub(camPos, base));
          var facing = V.dot(dirW, toCamP);
          if (facing < 0.14) continue;
          var sp = cam.project(base, {});
          if (!sp.ok) continue;
          var tip = cam.project({
            x: base.x + dirW.x * 0.5, y: base.y + dirW.y * 0.5, z: base.z + dirW.z * 0.5
          }, {});
          list.push({
            pr: pr, sp: sp, tip: tip, depth: sp.depth, facing: facing,
            light: HW.clamp01(V.dot(dirW, L) * 0.5 + 0.62)
          });
        }
        list.sort(function (p, q) { return q.depth - p.depth; });

        for (var li = 0; li < list.length; li++) {
          var it = list[li];
          var hpx = it.pr.size * cam.focal / it.depth;
          if (hpx < 6) continue;
          var wpx = hpx * (it.pr.img.naturalWidth / it.pr.img.naturalHeight);
          var ang = Math.atan2(it.tip.y - it.sp.y, it.tip.x - it.sp.x) + Math.PI / 2;
          var isDoor = !!it.pr.href;
          var lit = isDoor && this.hoverLink === it.pr;
          ctx.save();
          ctx.translate(it.sp.x, it.sp.y);
          ctx.rotate(ang);
          ctx.globalAlpha = HW.clamp01(HW.smoothstep(0.14, 0.34, it.facing)) *
                            (0.55 + 0.45 * it.light);
          ctx.beginPath();
          ctx.ellipse(0, 0, wpx * 0.3, hpx * 0.05, 0, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(11,15,28,0.3)';
          ctx.fill();
          if (lit) {
            ctx.save();
            ctx.globalAlpha = 1;
            ctx.strokeStyle = 'rgba(242,237,225,0.75)';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([5, 6]);
            ctx.beginPath();
            ctx.ellipse(0, -hpx * 0.48, hpx * 0.66, hpx * 0.66, time * 0.5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          }
          ctx.drawImage(it.pr.img, -wpx / 2, -hpx * (lit ? 1.02 : 0.97), wpx,
                        hpx * (lit ? 1.06 : 1));
          ctx.restore();

          if (isDoor && it.facing > 0.26 && hpx > 12) {
            this.hotspots.push({
              kind: 'link', item: it.pr, label: it.pr.label, href: it.pr.href,
              x: it.sp.x + Math.sin(ang) * hpx * 0.48,
              y: it.sp.y - Math.cos(ang) * hpx * 0.48,
              r: Math.max(16, hpx * 0.55)
            });
          }
        }
        /* --- the snacks --- */
        for (var qi = 0; qi < food.length; qi++) {
          var snack = food[qi];
          if (!snack.img || !snack.img.complete || !snack.img.naturalWidth) continue;

          var grow = 1;
          if (snack.eatenAt) {
            var since = time - snack.eatenAt;
            if (since < HW.SNACKS.regrow) continue;
            grow = HW.clamp01((since - HW.SNACKS.regrow) / 0.7);
            if (grow >= 1) snack.eatenAt = 0;
            grow = 0.25 + 0.75 * grow;              // pops back into place
          }

          var sdir = HW.applyMatrix(m2, snack.dir);
          var sbase = {
            x: def.pos.x + sdir.x * def.radius * 0.99,
            y: def.pos.y + sdir.y * def.radius * 0.99,
            z: def.pos.z + sdir.z * def.radius * 0.99
          };
          var sFacing = V.dot(sdir, V.norm(V.sub(camPos, sbase)));
          if (sFacing < 0.2) continue;
          var ssp = cam.project(sbase, {});
          if (!ssp.ok) continue;
          var stip = cam.project({
            x: sbase.x + sdir.x * 0.5, y: sbase.y + sdir.y * 0.5, z: sbase.z + sdir.z * 0.5
          }, {});

          var hovered = this.hoverFood === snack;
          var shpx = snack.size * grow * (hovered ? 1.16 : 1) * cam.focal / ssp.depth;
          if (shpx < 5) continue;
          var swpx = shpx * (snack.img.naturalWidth / snack.img.naturalHeight);
          var sang = Math.atan2(stip.y - ssp.y, stip.x - ssp.x) + Math.PI / 2;
          var bob = motion ? Math.sin(time * 1.9 + snack.phase) * 0.1 : 0;

          ctx.save();
          ctx.translate(ssp.x, ssp.y);
          ctx.rotate(sang);
          ctx.globalAlpha = HW.clamp01(HW.smoothstep(0.2, 0.4, sFacing));
          if (hovered) {
            ctx.strokeStyle = 'rgba(242,237,225,0.6)';
            ctx.lineWidth = 1.4;
            ctx.setLineDash([4, 5]);
            ctx.beginPath();
            ctx.ellipse(0, -shpx * 0.5, shpx * 0.72, shpx * 0.72, time * 0.6, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
          }
          ctx.drawImage(snack.img, -swpx / 2, -shpx * (0.97 + bob), swpx, shpx);
          ctx.restore();

          this.hotspots.push({
            kind: 'snack', item: snack, world: sbase,
            x: ssp.x + Math.sin(sang) * shpx * 0.5,
            y: ssp.y - Math.cos(sang) * shpx * 0.5,
            r: Math.max(16, shpx * 0.6)
          });
        }

        ctx.globalAlpha = 1;
      }
    };
  };
})(window.HW);
