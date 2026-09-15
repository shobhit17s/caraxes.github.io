/* cs-drawer.js — the drawer.
   Anything in the copy marked as worth digging into opens a panel over the
   slides: from the right on a desktop, up from the bottom on a phone. The
   whole move takes 1200ms, and the contents arrive a beat after the panel. */
window.CS = window.CS || {};
(function (CS) {
  'use strict';

  CS.initDrawer = function () {
    var drawer = document.getElementById('cs-drawer');
    var scrim = document.getElementById('cs-scrim');
    if (!drawer) return;
    var titleEl = document.getElementById('cs-drawer-title');
    var imgEl = document.getElementById('cs-drawer-image');
    var capEl = document.getElementById('cs-drawer-caption');
    var textEl = document.getElementById('cs-drawer-text');
    var closeBtn = document.getElementById('cs-drawer-close');
    var opener = null;

    function open(id) {
      var d = CS.DRAWERS[id];
      if (!d) return;
      titleEl.textContent = d.title;
      CS.fillMedia(imgEl, d.media, d.mediaNote, d.mediaKind);
      capEl.textContent = d.caption;
      textEl.innerHTML = d.body.map(function (p) { return '<p>' + p + '</p>'; }).join('');
      document.body.classList.add('cs-drawer-open');
      drawer.setAttribute('aria-hidden', 'false');
      setTimeout(function () { closeBtn.focus(); }, 420);
    }

    function close() {
      document.body.classList.remove('cs-drawer-open');
      drawer.setAttribute('aria-hidden', 'true');
      if (opener) opener.focus();
    }

    document.querySelectorAll('[data-cs-drawer]').forEach(function (el) {
      el.addEventListener('click', function () {
        opener = el;
        open(el.dataset.csDrawer);
      });
    });

    closeBtn.addEventListener('click', close);
    scrim.addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('cs-drawer-open')) close();
    });

    CS.drawer = { open: open, close: close };
  };
})(window.CS);
