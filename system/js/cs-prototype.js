/* cs-prototype.js — the PrototypeEmbed component.

   ONE component handles every kind of thing that can sit in a media slot on a
   case study, and the surrounding layout never knows or cares which kind it
   is. That is the whole point: swapping a placeholder for a real Figma
   prototype is a change to a case study's own media map, and nothing else
   moves.

   THE KINDS
     placeholder   nothing supplied yet — the drawn, labelled, hatched box
     image         a still: a photograph, a screenshot, a diagram
     video         an mp4/webm, or a gif, with an optional poster frame
     figma         a Figma prototype, by its share link or embed URL
     local         an HTML prototype living in /prototypes/<study>/...
     external      a prototype hosted anywhere else

   ISOLATION
   Everything but `placeholder`, `image` and `video` is rendered inside an
   <iframe>. That is not laziness — an iframe is a separate document with its
   own stylesheet and its own scripts, so a prototype physically cannot reach
   into the portfolio's CSS or JavaScript, and the portfolio cannot reach into
   it. Requirement met by the browser itself rather than by convention.

   WEIGHT
   An iframe is expensive, and a case study can hold several. None of them
   load until the reader asks: a prototype shows its poster (or its drawn
   placeholder) with a "run the prototype" button, and the iframe is created
   on the first click. A study can override this with `autoload: true`.

   SHAPE
   Every embed keeps the aspect ratio it was given, at any width. */
window.CS = window.CS || {};
(function (CS) {
  'use strict';

  var DEFAULT_RATIO = '16 / 9';

  /* A Figma share link works as an embed once it is wrapped. Given either
     form, return something an iframe can load. */
  function figmaUrl(src) {
    if (!src) return '';
    if (src.indexOf('figma.com/embed') !== -1) return src;
    if (src.indexOf('embed.figma.com') !== -1) return src;
    return 'https://www.figma.com/embed?embed_host=share&url=' +
           encodeURIComponent(src);
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  /* ---------- the drawn placeholder ----------
     What a slot looks like before anything has been supplied: the hatched
     box, the kind of thing wanted, the exact file name to give it, and a
     line saying what belongs there. */
  function placeholder(slot, media) {
    var kindWord = (media && media.wants === 'video') ? 'video or prototype' : 'image';
    var box = el('div', 'cs-media cs-media--' +
      ((media && media.wants === 'video') ? 'video' : 'image'));
    box.setAttribute('data-cs-stroke', '22');
    box.setAttribute('role', 'img');
    box.setAttribute('aria-label', 'Empty slot: ' + slot);
    box.appendChild(el('span', 'cs-media-kind', kindWord));
    box.appendChild(el('span', 'cs-media-name', slot));
    if (media && media.note) box.appendChild(el('span', 'cs-media-note', media.note));
    return box;
  }

  function stillImage(slot, media) {
    var box = el('div', 'cs-embed cs-embed--image');
    var img = el('img');
    img.src = media.src;
    img.alt = media.alt || media.note || '';
    img.loading = 'lazy';
    box.appendChild(img);
    return box;
  }

  function movie(slot, media) {
    var box = el('div', 'cs-embed cs-embed--video');
    if (/\.gif($|\?)/i.test(media.src)) {
      var gif = el('img');
      gif.src = media.src;
      gif.alt = media.alt || media.note || '';
      gif.loading = 'lazy';
      box.appendChild(gif);
      return box;
    }
    var v = document.createElement('video');
    v.src = media.src;
    if (media.poster) v.poster = media.poster;
    v.controls = media.controls !== false;
    v.playsInline = true;
    v.preload = 'none';
    if (media.loop) { v.loop = true; v.muted = true; v.autoplay = true; v.controls = false; }
    box.appendChild(v);
    return box;
  }

  /* ---------- anything that runs: figma, local, external ---------- */
  function frame(slot, media) {
    var url = media.kind === 'figma' ? figmaUrl(media.src) : media.src;
    var box = el('div', 'cs-embed cs-embed--frame');
    box.setAttribute('data-cs-stroke', '22');

    function load() {
      box.textContent = '';
      box.classList.add('is-running');
      var f = document.createElement('iframe');
      f.src = url;
      f.title = media.title || ('Prototype: ' + slot);
      f.loading = 'lazy';
      f.allowFullscreen = true;
      /* A prototype is a guest. It may run its own scripts and open links,
         and nothing else — it cannot reach this document, and this document
         does not reach into it. */
      f.setAttribute('sandbox',
        'allow-scripts allow-same-origin allow-popups allow-forms allow-downloads');
      f.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
      box.appendChild(f);
    }

    if (media.autoload) { load(); return box; }

    /* the resting state: a poster if there is one, and a way in */
    var cover = el('div', 'cs-embed-cover');
    if (media.poster) {
      cover.style.backgroundImage = 'url("' + media.poster + '")';
      cover.classList.add('has-poster');
    }
    var start = el('button', 'cs-embed-start');
    start.type = 'button';
    start.appendChild(el('span', 'cs-embed-start-mark'));
    start.appendChild(el('span', 'cs-embed-start-label',
      media.startLabel || 'Run the prototype'));
    start.addEventListener('click', load);
    cover.appendChild(start);
    if (media.note) cover.appendChild(el('span', 'cs-embed-cover-note', media.note));
    box.appendChild(cover);
    return box;
  }

  var BUILDERS = {
    image: stillImage,
    video: movie,
    figma: frame,
    local: frame,
    external: frame
  };

  /* ---------- the component ---------- */
  CS.PrototypeEmbed = {
    /* Build the thing that fills one named slot.
       `slot`  the slot's name, e.g. vid-17-prototype-option-a
       `media` what the case study says fills it, or nothing at all */
    create: function (slot, media) {
      var wrap = el('div', 'cs-slot');
      wrap.dataset.csSlot = slot;

      var build = media && BUILDERS[media.kind];
      var inner = build ? build(slot, media) : placeholder(slot, media);

      /* the shape is the slot's, not the content's, so a placeholder and the
         prototype that replaces it occupy exactly the same room */
      var ratio = (media && media.ratio) || null;
      if (ratio) wrap.style.setProperty('--cs-embed-ratio', ratio);

      wrap.appendChild(inner);
      return wrap;
    },

    /* Fill a slot that is already on the page — used by the carousels, which
       keep one slot and change what is in it. */
    fill: function (node, slot, media) {
      node.textContent = '';
      node.dataset.csSlot = slot;
      var build = media && BUILDERS[media.kind];
      node.style.setProperty('--cs-embed-ratio',
        (media && media.ratio) || DEFAULT_RATIO);
      node.appendChild(build ? build(slot, media) : placeholder(slot, media));
      if (CS.strokes) CS.strokes.apply(node);
      return node;
    },

    /* What a case study says fills a slot. Nothing means "not supplied yet",
       which is a placeholder, which is a perfectly good answer. */
    lookup: function (slot) {
      var m = CS.CASE_STUDY && CS.CASE_STUDY.media;
      return (m && m[slot]) || null;
    }
  };
})(window.CS);
