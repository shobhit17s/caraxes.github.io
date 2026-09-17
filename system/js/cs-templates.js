/* cs-templates.js — the slide templates, as components.

   Every template from the layout specs is a function here. It is handed a
   slide's DATA and returns a finished slide. It knows the shape of that
   template and nothing else: not what this case study is about, not what its
   pictures are called, not a single word of its copy.

   A case study's content.js says, for each slide, which template to use and
   what goes in its slots. Add a template here and every case study can use
   it; write a slide there and no code changes at all.

   THE SLOTS A TEMPLATE CAN ASK FOR
     title / title2      a section title, with an optional eyebrow above it
     body / body2        running copy: a string, or a list of strings
     media / media2      a named media slot — see cs-prototype.js
     caption             the line under a picture
     impact              a large statement
     stage               tiles, a flow, or anything else built by a helper
   A template uses the ones it needs and ignores the rest. */
window.CS = window.CS || {};
(function (CS) {
  'use strict';

  /* ---------- small builders ---------- */

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.innerHTML = text;
    return n;
  }

  function title(text, opts) {
    opts = opts || {};
    var h = el('h2', 'cs-section-title ' + (opts.slot || 'cs-sec-1-title'));
    if (opts.eyebrow) {
      h.appendChild(el('span', 'cs-meta cs-eyebrow', opts.eyebrow));
    }
    h.insertAdjacentHTML('beforeend', text);
    return h;
  }

  /* Copy arrives as one string or as several paragraphs. Either way it comes
     out as a block that can be placed. */
  function body(content, slotClass, extraClass) {
    var wrap = el('div', 'cs-body ' + slotClass + (extraClass ? ' ' + extraClass : ''));
    (Array.isArray(content) ? content : [content]).forEach(function (part) {
      if (part && part.kind) { wrap.appendChild(piece(part)); return; }
      wrap.appendChild(el('p', null, part));
    });
    return wrap;
  }

  /* the few richer things a body can hold */
  function piece(p) {
    if (p.kind === 'quote') return el('p', 'cs-quote', p.text);
    if (p.kind === 'drawer') {
      var b = el('button', 'cs-dig', p.text);
      b.type = 'button';
      b.dataset.csDrawer = p.drawer;
      return b;
    }
    if (p.kind === 'questions') {
      var ul = el('ul', 'cs-questions' + (p.wide ? ' cs-questions--wide' : ''));
      p.items.forEach(function (q) { ul.appendChild(el('li', null, q)); });
      return ul;
    }
    if (p.kind === 'flow') return flow(p);
    if (p.kind === 'tiles') return tiles(p);
    if (p.kind === 'note') return el('p', 'cs-meta', p.text);
    return el('p', null, String(p));
  }

  function flow(p) {
    var wrap = el('div', 'cs-flow' + (p.stacked ? ' cs-flow--stacked' : ''));
    p.steps.forEach(function (step, i) {
      if (i) wrap.appendChild(el('span', 'cs-flow-arrow'));
      var box = el('div', 'cs-flow-step' + (step.quiet ? ' cs-flow-step--quiet' : ''));
      box.setAttribute('data-cs-stroke', '24');
      if (step.label) box.appendChild(el('p', 'cs-meta', step.label));
      box.appendChild(el('p', 'cs-body', step.text));
      if (step.note) box.appendChild(el('p', 'cs-meta', step.note));
      wrap.appendChild(box);
    });
    return wrap;
  }

  function tiles(p) {
    var ul = el('ul', 'cs-tiles cs-tiles--static');
    p.items.forEach(function (t) {
      var li = el('li', 'cs-tile');
      li.setAttribute('data-cs-stroke', '24');
      li.appendChild(el('span', 'cs-tile-mark'));
      li.appendChild(el('span', 'cs-tile-label', t.label));
      if (t.note) li.appendChild(el('span', 'cs-tile-note', t.note));
      ul.appendChild(li);
    });
    return ul;
  }

  /* A media slot. What fills it is the case study's business, not the
     template's — the template only decides where it sits. */
  function slot(name, extraClass) {
    var node = CS.PrototypeEmbed.create(name, CS.PrototypeEmbed.lookup(name));
    if (extraClass) node.className += ' ' + extraClass;
    return node;
  }

  function stage(content, extraClass) {
    var s = el('div', 'cs-stage' + (extraClass ? ' ' + extraClass : ''));
    s.appendChild(content);
    return s;
  }

  function caption(text) { return el('p', 'cs-caption', text); }

  function draftMark(d) {
    var n = el('p', 'cs-meta cs-draft', typeof d === 'string' ? d : 'draft copy');
    return n;
  }

  /* ---------- the templates ---------- */
  /* Each returns an array of children; the renderer puts them in the slide. */

  var T = {

    /* #1 — hero */
    'hero': function (d) {
      var out = [];
      var h1 = el('h1', 'cs-hero-title', d.title);
      if (d.subtitle) h1.appendChild(el('span', 'cs-hero-sub', d.subtitle));
      out.push(h1);
      out.push(el('div', 'cs-hero-rule cs-figure fig-hero-rule'));
      if (d.lead) out.push(el('p', 'cs-lead cs-hero-lead', d.lead));
      if (d.tags) {
        var ul = el('ul', 'cs-hero-tags');
        d.tags.forEach(function (t) {
          var li = el('li', 'cs-tag', t);
          li.setAttribute('data-cs-stroke', '');
          ul.appendChild(li);
        });
        out.push(ul);
      }
      if (d.artwork) out.push(el('div', 'cs-hero-image cs-art ' + d.artwork));
      else if (d.media) out.push(slot(d.media, 'cs-hero-image'));
      return out;
    },

    /* #2.1 — a picture, two sections beside it
       #2.3 — the same, with a picture where the second body would be */
    'context-2': function (d) {
      var out = [slot(d.media, 'cs-context-figure')];
      out.push(title(d.title, { eyebrow: d.eyebrow }));
      out.push(body(d.body, 'cs-sec-1-body'));
      out.push(title(d.title2, { slot: 'cs-sec-2-title' }));
      out.push(d.media2 ? slot(d.media2, 'cs-sec-2-body')
                        : body(d.body2, 'cs-sec-2-body'));
      return out;
    },

    /* #2.2 — a picture, one section beside it */
    'context-1': function (d) {
      return [
        slot(d.media, 'cs-context-figure'),
        title(d.title, { eyebrow: d.eyebrow }),
        body(d.body, 'cs-sec-1-body')
      ];
    },

    /* #3.1 — section title, picture, caption */
    'title-figure-caption': function (d) {
      return [
        title(d.title, { eyebrow: d.eyebrow }),
        stage(d.stage ? piece(d.stage) : slot(d.media), d.band ? 'cs-stage--band' : ''),
        caption(d.caption || '')
      ];
    },

    /* #3.2 — picture and caption, no title */
    'figure': function (d) {
      return [slot(d.media), caption(d.caption || '')];
    },

    /* #3.3 — section title and picture, no caption */
    'title-figure': function (d) {
      return [
        title(d.title, { eyebrow: d.eyebrow }),
        stage(d.stage ? piece(d.stage) : slot(d.media), d.band ? 'cs-stage--band' : '')
      ];
    },

    /* #4.1 and #4.2 — two sections, stacked, nothing else */
    'sections': function (d) {
      return [
        title(d.title, { eyebrow: d.eyebrow }),
        d.media ? slot(d.media, 'cs-sec-1-body')
                : body(d.body, 'cs-sec-1-body', d.split ? 'cs-split' : ''),
        title(d.title2, { slot: 'cs-sec-2-title' }),
        d.media2 ? slot(d.media2, 'cs-sec-2-body')
                 : body(d.body2, 'cs-sec-2-body', d.split2 ? 'cs-split' : '')
      ];
    },

    /* #5.1 — impact text with a small mark */
    'impact-text': function (d) {
      var out = [];
      if (d.media) out.push(slot(d.media, 'cs-impact-mark'));
      out.push(el('p', 'cs-impact', d.impact));
      if (d.caption) out.push(caption(d.caption));
      return out;
    },

    /* #5.2 — impact text over a picture */
    'impact-bg': function (d) {
      return [slot(d.media), el('p', 'cs-impact', d.impact)];
    },

    /* #10.1 — slide strip: picture and caption */
    'strip-figure': function (d) {
      return [slot(d.media), caption(d.caption || '')];
    },

    /* #10.2 — slide strip: header text only */
    'strip-text': function (d) {
      var out = [];
      if (d.title) out.push(title(d.title));
      out.push(el('p', 'cs-impact', d.impact));
      return out;
    },

    /* #6 — the interactive persona slide. Built empty here; cs-carousels.js
       fills it from the study's people. */
    'persona': function () {
      var carousel = el('div', 'cs-persona-carousel');
      carousel.appendChild(arrowButton('prev', 'Previous person', 'cs-persona-step cs-persona-step--prev'));
      var stageEl = el('div', 'cs-persona-stage');
      stageEl.appendChild(el('p', 'cs-persona-name'));
      carousel.appendChild(stageEl);
      carousel.appendChild(arrowButton('next', 'Next person', 'cs-persona-step cs-persona-step--next'));
      var pager = el('div', 'cs-pager');
      pager.appendChild(arrowButton('prev', 'Previous person'));
      pager.appendChild(el('span', null, 'swipe the people'));
      pager.appendChild(arrowButton('next', 'Next person'));
      carousel.appendChild(pager);

      var tabs = el('div', 'cs-tiles');
      tabs.setAttribute('role', 'tablist');
      tabs.setAttribute('aria-label', 'What to read about this person');

      return [carousel, tabs, title('', { slot: 'cs-sec-1-title' }), el('p', 'cs-body cs-sec-1-body')];
    },

    /* #7 — the app logo slide */
    'logo': function (d) {
      var out = [el('div', 'cs-logo-flow')];
      out[0].setAttribute('aria-hidden', 'true');
      (d.tiles || ['START tile', 'AUTH tile']).forEach(function (t, i) {
        var tile = el('p', 'cs-flow-tile cs-flow-tile--' + (i === 0 ? 'start' : 'auth'), t);
        tile.setAttribute('data-cs-stroke', '28');
        out.push(tile);
      });
      var row = el('div', 'cs-logo-row');
      row.appendChild(arrowButton('prev', 'Previous app', 'cs-logo-step--prev'));
      var box = slot(d.media, 'cs-logo-box');
      box.setAttribute('data-cs-stroke', '48');
      row.appendChild(box);
      row.appendChild(arrowButton('next', 'Next app', 'cs-logo-step--next'));
      out.push(row);
      return out;
    },

    /* #8 — the wireframe slide. Empty; cs-carousels.js fills it. */
    'wireframe': function () {
      return [
        controlPanel(true),
        arrowButton('prev', 'Previous screen', 'cs-step cs-step--prev'),
        wireStage(),
        arrowButton('next', 'Next screen', 'cs-step cs-step--next'),
        caption('')
      ];
    },

    /* #9 — the backend diagram slide. Empty; cs-carousels.js fills it. */
    'backend': function () {
      var panel = el('div', 'cs-control-panel');
      panel.appendChild(el('div', 'cs-toggle-panel'));
      var stageEl = el('div', 'cs-diagram-stage');
      return [panel, stageEl, caption('')];
    }
  };

  /* ---------- pieces the templates share ---------- */

  function arrowButton(dir, label, extra) {
    var b = el('button', 'cs-arrow cs-arrow--' + dir + (extra ? ' ' + extra : ''));
    b.type = 'button';
    b.setAttribute('aria-label', label);
    var mark = el('span', 'cs-arrow-mark');
    mark.setAttribute('aria-hidden', 'true');
    b.appendChild(mark);
    return b;
  }

  function controlPanel(withSecondary) {
    var panel = el('div', 'cs-control-panel');
    var tabs = el('div', 'cs-tab-panel');
    tabs.setAttribute('role', 'tablist');
    tabs.setAttribute('aria-label', 'Workflows');
    panel.appendChild(tabs);
    if (withSecondary) {
      panel.appendChild(el('div', 'cs-separator'));
      var right = el('div', 'cs-right-controls');
      panel.appendChild(right);
    }
    return panel;
  }

  function wireStage() {
    var s = el('div', 'cs-wire-stage');
    var pager = el('div', 'cs-pager');
    pager.appendChild(arrowButton('prev', 'Previous screen', 'cs-pager-prev'));
    pager.appendChild(el('span', 'cs-pager-label', '1 / 1'));
    pager.appendChild(arrowButton('next', 'Next screen', 'cs-pager-next'));
    s.appendChild(pager);
    return s;
  }

  CS.templates = {
    /* every template the system knows, by name */
    registry: T,
    /* the helpers a case study's content can reach through `stage` */
    piece: piece,
    slot: slot,
    arrowButton: arrowButton,
    controlPanel: controlPanel,
    names: function () { return Object.keys(T); }
  };
})(window.CS);
