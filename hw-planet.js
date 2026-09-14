/* hw-planet.js — one low-poly planet, drawn as if by hand.
   Geometry gives us the silhouette and the way light falls; everything you
   actually *see* is a stroke: wobbling facet creases, a chalk contour, pencil
   hatching in the shadows, and your own drawings pinned to the surface. */
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

      /* Project the whole planet for this frame. */
      update: function (cam, time, motion) {
        var angle = time * def.spin * (motion ? 1 : 0.18);
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

        var sx = function (i) { return screen[i].x + jx[i * 2] * wob; };
        var sy = function (i) { return screen[i].y + jx[i * 2 + 1] * wob; };

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
        var lightOf = new Float32Array(faces.length);
        var front = new Uint8Array(faces.length);

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
          ctx.moveTo(sx(fa[0]), sy(fa[0]));
          ctx.lineTo(sx(fa[1]), sy(fa[1]));
          ctx.lineTo(sx(fa[2]), sy(fa[2]));
          ctx.closePath();
          ctx.fillStyle = HW.shade(def.color, light);
          ctx.fill();
          // a crease, not an outline: just enough to see the fold
          ctx.strokeStyle = 'rgba(11,15,28,' + (0.05 + 0.16 * (1 - light)).toFixed(3) + ')';
          ctx.lineWidth = 1;
          ctx.stroke();

          // pencil hatching where the light does not reach
          if (light < 0.3 && radiusPx > 40) {
            ctx.save();
            ctx.globalAlpha = 0.2;
            ctx.strokeStyle = P.ink;
            ctx.lineWidth = 1;
            var mx = (sx(fa[0]) + sx(fa[1]) + sx(fa[2])) / 3;
            var my = (sy(fa[0]) + sy(fa[1]) + sy(fa[2])) / 3;
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

        /* --- the inked contour: only the edges where the planet turns away --- */
        var edges = geo.edges;
        ctx.save();
        ctx.lineCap = 'round';
        for (var pass = 0; pass < 2; pass++) {
          ctx.beginPath();
          for (var ei = 0; ei < edges.length; ei++) {
            var e = edges[ei];
            if (e.f[1] < 0) continue;
            if (front[e.f[0]] === front[e.f[1]]) continue;
            var ax = sx(e.a), ay = sy(e.a), bx = sx(e.b), by = sy(e.b);
            var mx2 = (ax + bx) / 2, my2 = (ay + by) / 2;
            var dx = bx - ax, dy = by - ay;
            var offs = (pass === 0 ? 1 : -1) * wob * 0.9;
            ctx.moveTo(ax, ay);
            ctx.quadraticCurveTo(mx2 - dy * 0.05 + offs, my2 + dx * 0.05 + offs, bx, by);
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
