# Prototypes

Every prototype in the portfolio lives in this folder, under the case study it
belongs to:

```
prototypes/
  industry-dashboard/
    kids-page/
      index.html        ← a self-contained HTML prototype
      app.css
      app.js
    option-a.mp4        ← or just a recording
    option-a-poster.png
  <another-case-study>/
    …
```

Nothing outside this folder needs to change when you add one.

---

## How a picture slot works

Every picture, video and prototype on a case study is a **slot with a name**.
The slide says *where* the slot sits. A single map at the bottom of that case
study's `content.js` says *what fills it*. Nothing else in the project knows
or cares.

Leave a slot out of the map and it renders as the drawn, labelled placeholder
— the hatched box with the file name in it. That is the resting state, and it
is a perfectly good answer while you are still drawing.

**So replacing a placeholder with a real prototype is a change to one entry in
one file.** The slide does not move, the layout does not move, nothing around
it is touched.

---

## The five kinds

Open `case-studies/<study>/content.js` and find the `media` map at the bottom.

### 1. A Figma prototype

```js
'vid-19-final-kids-page': {
  kind: 'figma',
  src: 'https://www.figma.com/proto/AbC123/KIDs?node-id=1-2&scaling=scale-down',
  ratio: '16 / 9',
  poster: 'assets/kids-page-poster.png',
  startLabel: 'Open the prototype'
}
```

Paste the ordinary Figma **share link** — the component wraps it into an embed
URL for you. An already-wrapped `figma.com/embed?…` URL works too.

### 2. A prototype you built yourself, hosted here

Put the files in `prototypes/<study>/<name>/`, then:

```js
'vid-17-prototype-option-a': {
  kind: 'local',
  src: '../../prototypes/industry-dashboard/kids-page/index.html',
  ratio: '16 / 9'
}
```

The path is relative to the case study's `index.html`, which sits two folders
deep — hence the `../../`.

### 3. A prototype hosted somewhere else

```js
'vid-18-prototype-option-b': {
  kind: 'external',
  src: 'https://my-prototype.vercel.app/',
  ratio: '16 / 10'
}
```

### 4. A video or a GIF

```js
'vid-19-final-kids-page': {
  kind: 'video',
  src: '../../prototypes/industry-dashboard/final.mp4',
  poster: '../../prototypes/industry-dashboard/final-poster.png',
  ratio: '16 / 9',
  loop: true          // silent, looping, no controls — good for a short clip
}
```

A `.gif` works with the same `kind: 'video'`; it is recognised by its
extension and rendered as an image.

### 5. A still image

```js
'img-02-business-problem': { kind: 'image', src: 'assets/business-problem.png' }
```

---

## Every kind takes these

| key | what it does | default |
| --- | --- | --- |
| `ratio` | the shape the slot holds at any width | `16 / 9` |
| `note` | the line shown on the placeholder, and under a resting prototype | — |
| `poster` | a still shown before a prototype is started | — |
| `startLabel` | the words on the button that starts it | `Run the prototype` |
| `autoload` | `true` loads it immediately instead of waiting for a click | `false` |
| `title` | the iframe's accessible name | `Prototype: <slot>` |

---

## Why a prototype cannot break the portfolio

Anything that *runs* — Figma, local, external — is rendered inside an
`<iframe>`. An iframe is a separate document with its own stylesheet and its
own scripts. A prototype physically cannot reach the portfolio's CSS or
JavaScript, and the portfolio cannot reach into it. That is not a convention
anyone has to remember; it is the browser refusing.

The iframe is also sandboxed: a prototype may run its own scripts, open links
and submit its own forms, and nothing else.

**Nothing loads until asked.** A case study can hold several prototypes, and
several iframes would make the page heavy. Each one rests as its poster (or
its drawn placeholder) with a button, and the iframe is created on the first
click. Set `autoload: true` if you want one to load straight away.

---

## Writing a local prototype

It is an ordinary web page. Two things worth knowing:

1. **It is completely on its own.** It does not inherit the portfolio's type,
   colours or reset. If you want them, link `common/type.css` yourself.
2. **Build it to fill its frame**, not to a fixed size: `html, body { margin: 0;
   height: 100% }`. The slot decides how big it is; the prototype fills it.

A skeleton is in `prototypes/_template/`.
