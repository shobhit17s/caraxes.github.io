# Four Small Worlds — a case study presentation system

```
handdrawn-worlds/
│
├── index.html                  the landing page: four planets you travel between
├── css/  js/  assets/          everything that page needs
│
├── common/
│   └── type.css                ONE typographic system, read by every surface
│
├── system/                     THE ENGINE — no case study content lives here
│   ├── css/                    tokens, layout, the slide templates, components,
│   │                           the stroke layer, the prototype component
│   └── js/                     the renderer, the templates, PrototypeEmbed,
│                               the carousels, the drawer, the views
│
├── case-studies/
│   └── industry-dashboard/     ONE case study
│       ├── index.html          a thin shell — it holds no content at all
│       ├── content.js          every word, every slide, every slot  ← the study
│       ├── theme.css           its two accent colours
│       ├── assets.css          where its drawings are
│       └── assets/             its drawings
│
└── prototypes/
    ├── README.md               how to put a prototype into a slot
    ├── _template/              a skeleton to copy
    └── industry-dashboard/     this study's prototypes
```

## The idea

A case study is **data**, not markup. `content.js` says which template each
slide uses and what goes in it; the engine builds the page. Two case studies
can tell completely different stories, in a different order, with a different
number of slides — and run on the same engine with no code change at all.

**To add a case study:** copy `case-studies/industry-dashboard/`, empty out
`content.js`, and write the new story. Nothing in `system/` is touched.

## The four separations

| what | where | why |
| --- | --- | --- |
| content | `case-studies/<study>/content.js` | the words change per study |
| styling | `system/css/` + the study's `theme.css` | the look is shared; two accents are not |
| layout | `system/js/cs-templates.js` | a template is a template everywhere |
| prototypes | `prototypes/<study>/` | they run in their own frame, isolated |

## The slide templates

Named after the layout spec sheets. Every one is a function in
`system/js/cs-templates.js` that is handed a slide's data.

`hero` · `context-1` · `context-2` · `title-figure` · `title-figure-caption` ·
`figure` · `sections` · `impact-text` · `impact-bg` · `persona` · `logo` ·
`wireframe` · `backend` · `strip-figure` · `strip-text`

Add one there and every case study can use it.

## Pictures and prototypes

Every picture, video and prototype is a **named slot**. The slide says where
it sits; the `media` map at the bottom of `content.js` says what fills it.
Leave a slot out of the map and it renders as the drawn placeholder.

Swapping a placeholder for a real Figma prototype is one entry in one file.
See `prototypes/README.md`.

## Keyboard

`s` drawn lines on or off · `g` the slide grid · `w` the window grid
