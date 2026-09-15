/* cs-main.js — start everything, in the order the page needs it. */
window.CS = window.CS || {};
(function (CS) {
  'use strict';

  /* The grid overlays behind the `g` shortcut are the same twelve bars on
     every slide, so they are built here rather than typed out 21 times. */
  function buildGridOverlays() {
    document.querySelectorAll('.cs-slide').forEach(function (slide) {
      if (slide.querySelector(':scope > .cs-grid-overlay')) return;
      var o = document.createElement('div');
      o.className = 'cs-grid-overlay';
      o.setAttribute('aria-hidden', 'true');
      for (var i = 0; i < 12; i++) o.appendChild(document.createElement('span'));
      slide.insertBefore(o, slide.firstChild);
    });
  }

  function boot() {
    document.body.classList.add('cs-drawn');
    buildGridOverlays();

    var topTitle = document.getElementById('cs-topbar-title');
    if (topTitle) topTitle.textContent = CS.META.title;

    var back = document.getElementById('cs-back');
    if (back) {
      back.href = CS.META.backHref;
      back.textContent = '← ' + CS.META.backLabel;
    }

    CS.initViews();
    CS.initWireframes();
    CS.initDiagrams();
    CS.initPersonas();
    CS.initDrawer();
    CS.initParallax();
    CS.initShortcuts();

    // the drawn outlines go on last, once every panel has its real size
    var draw = function () { CS.strokes.apply(document); };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
    requestAnimationFrame(draw);
    window.addEventListener('resize', function () {
      clearTimeout(CS._t);
      CS._t = setTimeout(function () { CS.strokes.refresh(); }, 180);
    });

    // arriving from a planet: land on the slide that was clicked
    if (location.hash && location.hash !== '#nutshell') {
      var target = document.querySelector(location.hash);
      // the view holding it has already been opened by CS.initViews
      if (target) setTimeout(function () { target.scrollIntoView({ block: 'center' }); }, 80);
    }

    document.body.classList.add('cs-ready');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window.CS);
