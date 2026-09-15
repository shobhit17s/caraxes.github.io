/* cs-carousels.js — the two stepping-through components: the wireframe slide
   (a tab picks a workflow, prev/next walk its screens) and the persona slide
   (prev/next change person, the four tiles change what you read about them).

   Every picture in them is still a named slot, so stepping through a workflow
   changes which slot you are looking at and what it is called. */
window.CS = window.CS || {};
(function (CS) {
  'use strict';

  /* Fill one artwork slot: what kind of thing goes in it, the file name to
     give it, and a line saying what it should show. */
  CS.fillMedia = function (el, name, note, kind) {
    if (!el) return;
    kind = kind || 'image';
    el.classList.toggle('cs-media--video', kind === 'video');
    el.classList.toggle('cs-media--image', kind !== 'video');
    var parts = {
      'cs-media-kind': kind === 'video' ? 'video or prototype' : 'image',
      'cs-media-name': name || '',
      'cs-media-note': note || ''
    };
    Object.keys(parts).forEach(function (cls) {
      var span = el.querySelector('.' + cls);
      if (!span) {
        span = document.createElement('span');
        span.className = cls;
        el.appendChild(span);
      }
      span.textContent = parts[cls];
    });
    el.setAttribute('aria-label',
      (kind === 'video' ? 'Video slot: ' : 'Image slot: ') + (name || ''));
  };

  CS.initWireframes = function () {
    var slide = document.getElementById('cs-slide-wireframe');
    if (!slide) return;
    var panel = slide.querySelector('.cs-tab-panel');
    var stage = slide.querySelector('.cs-wire-figure');
    var caption = slide.querySelector('.cs-caption');
    var prev = slide.querySelector('.cs-step--prev');
    var next = slide.querySelector('.cs-step--next');
    var pagerLabel = slide.querySelector('.cs-pager-label');
    var flow = CS.WORKFLOWS[0];
    var index = 0;

    function show() {
      var shot = flow.shots[index];
      stage.style.opacity = '0';
      setTimeout(function () {
        CS.fillMedia(stage, shot.name, shot.note, 'image');
        stage.style.opacity = '1';
      }, 150);
      caption.textContent = shot.caption;
      if (pagerLabel) pagerLabel.textContent = (index + 1) + ' / ' + flow.shots.length;
    }

    function step(d) {
      index = (index + d + flow.shots.length) % flow.shots.length;
      show();
    }

    CS.makeTabs(panel, CS.WORKFLOWS, function (w) { flow = w; index = 0; show(); });
    [prev, slide.querySelector('.cs-pager-prev')].forEach(function (b) {
      if (b) b.addEventListener('click', function () { step(-1); });
    });
    [next, slide.querySelector('.cs-pager-next')].forEach(function (b) {
      if (b) b.addEventListener('click', function () { step(1); });
    });
    show();
  };

  CS.initDiagrams = function () {
    var slide = document.getElementById('cs-slide-backend');
    if (!slide) return;
    var panel = slide.querySelector('.cs-toggle-panel');
    var slots = slide.querySelectorAll('.cs-diagram-stage .cs-media');
    var caption = slide.querySelector('.cs-caption');

    CS.DIAGRAMS.forEach(function (d, i) {
      if (slots[i]) CS.fillMedia(slots[i], d.name, d.note, 'image');
    });

    CS.makeToggles(panel, CS.DIAGRAMS, function (d, i) {
      slots.forEach(function (f, j) { f.classList.toggle('is-on', j === i); });
      caption.textContent = d.caption;
    });
    if (slots[0]) slots[0].classList.add('is-on');
    caption.textContent = CS.DIAGRAMS[0].caption;
  };

  CS.initPersonas = function () {
    var slide = document.getElementById('cs-slide-persona');
    if (!slide) return;
    var slots = slide.querySelectorAll('.cs-persona-stage .cs-media');
    var nameEl = slide.querySelector('.cs-persona-name');
    var tiles = slide.querySelectorAll('.cs-tiles .cs-tile');
    var title = slide.querySelector('.cs-sec-1-title');
    var bodyEl = slide.querySelector('.cs-sec-1-body');
    var who = 0, tile = 0;

    CS.PERSONAS.forEach(function (p, i) {
      if (slots[i]) CS.fillMedia(slots[i], p.media, p.mediaNote, 'image');
    });

    function show() {
      var p = CS.PERSONAS[who];
      slots.forEach(function (f, j) { f.classList.toggle('is-on', j === who); });
      nameEl.innerHTML = '<span class="cs-section-title">' + p.name +
        '</span><br><span class="cs-meta">' + p.meta + '</span>';
      tiles.forEach(function (t, j) { t.setAttribute('aria-selected', j === tile ? 'true' : 'false'); });
      title.textContent = CS.TILES[tile];
      bodyEl.textContent = p.panels[tile];
    }

    slide.querySelectorAll('.cs-persona-step').forEach(function (b) {
      b.addEventListener('click', function () {
        who = (who + (b.classList.contains('cs-persona-step--prev') ? -1 : 1) + CS.PERSONAS.length) % CS.PERSONAS.length;
        show();
      });
    });
    slide.querySelectorAll('.cs-pager button').forEach(function (b, i) {
      b.addEventListener('click', function () {
        who = (who + (i === 0 ? -1 : 1) + CS.PERSONAS.length) % CS.PERSONAS.length;
        show();
      });
    });
    tiles.forEach(function (t, j) {
      t.addEventListener('click', function () { tile = j; show(); });
    });
    show();
  };
})(window.CS);
