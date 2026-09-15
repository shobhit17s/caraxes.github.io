/* cs-shortcuts.js — the three keys this page answers to.
   s = drawn lines on/off, g = the slide grid, w = the window grid.
   They are working tools, not features: they exist so the layout can be
   checked against the spec sheets without opening anything else. */
window.CS = window.CS || {};
(function (CS) {
  'use strict';

  CS.initShortcuts = function () {
    var hint = document.getElementById('cs-key-hint');

    function flash(msg) {
      if (!hint) return;
      hint.textContent = msg;
      hint.classList.add('is-on');
      clearTimeout(hint._t);
      hint._t = setTimeout(function () { hint.classList.remove('is-on'); }, 1400);
    }

    document.addEventListener('keydown', function (e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      var tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      var k = e.key.toLowerCase();
      if (k === 's') {
        document.body.classList.toggle('cs-drawn');
        flash(document.body.classList.contains('cs-drawn') ? 'drawn lines' : 'plain lines');
      } else if (k === 'g') {
        document.body.classList.toggle('cs-show-slide-grid');
        flash('slide grid · 12 × 8');
      } else if (k === 'w') {
        document.body.classList.toggle('cs-show-window-grid');
        flash('window grid · 8 columns');
      }
    });

    var themeBtn = document.getElementById('cs-theme');
    if (themeBtn) {
      themeBtn.addEventListener('click', function () {
        var root = document.documentElement;
        var light = root.getAttribute('data-cs-mode') === 'light';
        root.setAttribute('data-cs-mode', light ? 'dark' : 'light');
        themeBtn.textContent = light ? 'light mode' : 'dark mode';
      });
    }
  };
})(window.CS);
