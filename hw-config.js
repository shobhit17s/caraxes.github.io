/* hw-config.js — the only file you need to touch to change the story.
   Worlds, their colours, what lives on them, and where the camera stands.
   Swap any `src` for a Procreate export at the same viewBox and it just works. */
window.HW = window.HW || {};
(function (HW) {
  'use strict';

  HW.PALETTE = {
    ink:      '#0B0F1C',   // the darkest line
    sky:      '#131829',   // toned paper we are drawing on
    chalk:    '#F2EDE1',   // white pencil
    chalkDim: '#8E98B4'
  };

  HW.SETTINGS = {
    fov: 40,               // degrees
    lightDir: { x: -0.42, y: 0.72, z: 0.55 },
    boilFps: 9,            // how often the hand-drawn line re-wobbles
    starCount: 150,
    assetBase: 'assets/'
  };

  /* Where a case study opens.
     Paste the real case-study page's address between the quotes and every
     object on the Drafting Fields will point at it. Later, give each object
     its own `href` in the props list below and they become six separate
     case studies. A full web address opens in a new tab; a plain path like
     'case-studies/sample.html' opens in place. */
  HW.CASE_STUDY_URL = 'https://shobhit-kenath.framer.website/#about';

  /* Each world is a planet AND a page. The words live in index.html (so the
     page reads without JavaScript); this file holds only what the renderer
     needs. `href` is what the planet links to — point these at your real
     case-study pages when the site is assembled. */
  HW.WORLDS = [
    {
      id: 'home',
      nav: 'About',
      name: 'Home Hollow',
      href: '#hw-world-home',
      side: 'left',         // which side of the screen the writing sits on
      pin: true,            // the opening panel stays in the left margin
      lift: 0.06,           // nudge the planet down-screen
      color: { h: 132, s: 26, l: 56, drift: 10 },
      radius: 1.4,
      detail: 1,
      pos: { x: 0, y: 0, z: 0 },
      tilt: { x: -0.22, z: 0.12 },
      spin: 0.05,
      props: [
        { src: 'props/home-hut.svg',      lat: 26,  lon: -8,  size: 0.62 },
        { src: 'props/home-pine.svg',     lat: 6,   lon: -22, size: 0.55 },
        { src: 'props/home-pine.svg',     lat: 44,  lon: 30,  size: 0.45 },
        { src: 'props/home-pine.svg',     lat: -16, lon: -15, size: 0.48 },
        { src: 'props/home-pine.svg',     lat: 30,  lon: 32,  size: 0.4 },
        { src: 'props/home-campfire.svg', lat: 4,   lon: 22,  size: 0.3 },
        { src: 'props/home-hut.svg',      lat: -30, lon: 34,  size: 0.45 }
      ],
      food: [
        { src: 'food/apple.svg',   lat: 10,  lon: 16,  size: 0.3 },
        { src: 'food/berries.svg', lat: -12, lon: -10, size: 0.28 }
      ]
    },
    {
      id: 'work',
      nav: 'Work',
      name: 'The Drafting Fields',
      href: '#hw-world-work',
      side: 'right',
      lift: 0.02,
      color: { h: 36, s: 58, l: 58, drift: 12 },
      radius: 2.1,
      detail: 2,
      pos: { x: 4.98, y: 3.54, z: -18.32 },
      tilt: { x: 0.18, z: -0.16 },
      spin: 0.038,
      props: [
        { src: 'props/work-pavilion.svg',  lat: 24,  lon: 2,   size: 0.7,
          href: HW.CASE_STUDY_URL, label: 'Hospital wayfinding' },
        { src: 'props/work-easel.svg',     lat: -2,  lon: -26, size: 0.48,
          href: HW.CASE_STUDY_URL, label: 'Onboarding for a bank' },
        { src: 'props/work-pavilion.svg',  lat: 48,  lon: 36,  size: 0.46,
          href: HW.CASE_STUDY_URL, label: 'A design system from scratch' },
        { src: 'props/work-pavilion.svg',  lat: -24, lon: -22, size: 0.5,
          href: HW.CASE_STUDY_URL, label: 'Fleet dispatch console' },
        { src: 'props/work-easel.svg',     lat: 14,  lon: 40,  size: 0.42,
          href: HW.CASE_STUDY_URL, label: 'Museum audio guide' },
        { src: 'props/work-pavilion.svg',  lat: -8,  lon: -46, size: 0.44,
          href: HW.CASE_STUDY_URL, label: 'Rewriting a returns flow' },
        { src: 'props/work-flagstack.svg', lat: 40,  lon: -22, size: 0.42 }
      ],
      food: [
        { src: 'food/bun.svg',  lat: 8,   lon: -16, size: 0.44 },
        { src: 'food/cone.svg', lat: -14, lon: 18,  size: 0.42 }
      ]
    },
    {
      id: 'play',
      nav: 'Play',
      name: 'The Tinker Belt',
      href: '#hw-world-play',
      side: 'left',
      lift: 0,
      color: { h: 248, s: 42, l: 60, drift: 14 },
      radius: 1.25,
      detail: 1,
      pos: { x: 6.97, y: -8.1, z: -25.2 },
      tilt: { x: 0.4, z: 0.3 },
      spin: 0.085,
      ring: true,
      props: [
        { src: 'props/play-balloon.svg',  lat: 32,  lon: -12, size: 0.6 },
        { src: 'props/play-arch.svg',     lat: -6,  lon: 34,  size: 0.5 },
        { src: 'props/play-windmill.svg', lat: 16,  lon: -40, size: 0.46 },
        { src: 'props/play-arch.svg',     lat: 40,  lon: 48,  size: 0.34 },
        { src: 'props/play-balloon.svg',  lat: -22, lon: 8,   size: 0.4 }
      ],
      food: [
        { src: 'food/mushroom.svg', lat: 22,  lon: 20,  size: 0.3 },
        { src: 'food/melon.svg',    lat: -10, lon: -18, size: 0.28 }
      ]
    },
    {
      id: 'signal',
      nav: 'Contact',
      name: 'Signal Point',
      href: '#hw-world-signal',
      side: 'right',
      lift: 0.02,
      color: { h: 10, s: 50, l: 57, drift: 10 },
      radius: 1.45,
      detail: 1,
      pos: { x: -14.17, y: -11.5, z: -35.36 },
      tilt: { x: -0.3, z: 0.2 },
      spin: 0.06,
      props: [
        { src: 'props/signal-lighthouse.svg', lat: 36,  lon: 6,   size: 0.86 },
        { src: 'props/signal-antenna.svg',    lat: -2,  lon: -25, size: 0.55 },
        { src: 'props/signal-buoy.svg',       lat: 8,   lon: 32,  size: 0.32 },
        { src: 'props/signal-buoy.svg',       lat: -20, lon: 18,  size: 0.3 },
        { src: 'props/signal-antenna.svg',    lat: 30,  lon: 44,  size: 0.38 }
      ],
      food: [
        { src: 'food/cone.svg',    lat: 12, lon: -20, size: 0.32 },
        { src: 'food/berries.svg', lat: -8, lon: 16,  size: 0.3 }
      ]
    }
  ];

  /* Snacks. Every world grows a couple; click one and the traveller eats it.
     Purely for fun — nothing on the page depends on them. */
  HW.SNACKS = {
    fly: 0.62,      // seconds for a snack to sail over to him
    chew: 0.8,      // seconds of chewing
    regrow: 15      // seconds before the snack grows back
  };

  HW.CHARACTER = {
    // The traveller, drawn by hand. Three versions of the same strokes live in
    // assets/character/: 'hero-filled.png' is the drawing with its inside
    // filled in like paper, 'hero-ink.png' is exactly as drawn (open, no fill),
    // 'hero-chalk.png' is the same lines in white pencil. Swap the filename.
    src: 'character/hero-filled.png',
    size: 0.78,       // world units tall
    hover: -0.1,      // sink the feet slightly, so they meet the flat facets
    arc: 0.075,       // jump height, as a fraction of the distance travelled
    legTop: 0.466,    // where the legs meet the body, measured up from the soles
    bend: 0.62        // how far the knees fold when loading a jump
  };
})(window.HW);
