# Tadabbur (Astro)

The Tadabbur Quran knowledge base as a static Astro site: every ayah of the 114 surahs
with recitation, Arabic, Urdu and English, Urdu tafsir, and the themes, Names of Allah
and people that link the Quran together.

Site: [tadabbur.belambo.com](https://tadabbur.belambo.com). The content comes from the
separate Tadabbur generator repo as JSON in `data/`.

## Getting started

Requires Node 22.12 or later.

```bash
npm ci
npm run dev        # http://localhost:8080
```

| Script             | Does                                                           |
| ------------------ | -------------------------------------------------------------- |
| `npm run build`    | Static site into `dist/`, then the Pagefind search index       |
| `npm run preview`  | Serves `dist/` on port 8080                                    |
| `npm run check`    | `astro check`, ESLint, Prettier                                |
| `npm test`         | Data integrity tests (Vitest)                                  |
| `npm run test:e2e` | Playwright flows and axe on a phone and a desktop; build first |
| `npm run schemas`  | Writes the data contract as JSON Schema into `schemas/`        |

Port 8080 is not arbitrary: the feedback Worker only accepts requests from
`http://localhost:8080` and the live site.

## How it fits together

```
data/*.json  ->  src/content.config.ts  ->  src/lib/site.ts  ->  src/pages/**
(the content)    (collections + Zod)        (indexes, lookups)   (one route per thing)
```

- **`data/`** is the content: `surahs.json`, `ayaat/001.json` to `114.json`,
  `themes.json`, `names.json`, `personalities.json`, their category files, and
  `canvases/*.json`. It is generated; fix content in the generator, not here.
- **`src/data/schema.ts`** is the contract. The collections and the JSON Schemas in
  `schemas/` (for the generator) both come from it. In the collections, ids become
  `reference()`s, so a link to something missing fails the build.
- **`src/lib/site.ts`** loads every collection once per build and adds what the data
  stores only one way round: which Names and people mention an ayah, what carries a
  theme, the curated orders.
- **`src/lib/graph.ts`** lays out each page's local graph with d3-force at build time.
  The browser gets a finished SVG; no simulation runs on a phone.

### Routes

| Route                    | Page                                                    |
| ------------------------ | ------------------------------------------------------- |
| `/`                      | Home: go to an ayah, start reading, topics              |
| `/surahs/`               | All 114 surahs                                          |
| `/2/`                    | A surah: art, themes, ayah index, the whole surah       |
| `/2/255/`                | An ayah: recitation, Arabic, Urdu, English, tafsir      |
| `/themes/`, `/themes/x/` | Themes, and every ayah carrying one, grouped by surah   |
| `/names/`, `/names/x/`   | The 99 Names                                            |
| `/people/`, `/people/x/` | People of the Quran; `/people/path/x/` by path          |
| `/canvas/x/`             | A reflection canvas, with a list view for small screens |
| `/search/`               | Pagefind search, filterable by kind                     |

### In the browser

There is no framework runtime. Each interactive part is a small custom element or a
delegated listener: search (`site-search`, Pagefind loaded on first use), recitation
(`play-recitation`, `surah-player`), the canvas zoom (`canvas-view`), the home page
go-to box (`go-to`), dialogs (`[data-open]`/`[data-close]`), and reader preferences.

Preferences (theme, Arabic size, which translations show) are saved in localStorage
under `tadabbur:prefs` and applied by an inline script in `<head>` before first paint,
as `data-*` attributes on `<html>` that the CSS reads.

### Design

- Colours come from the logo: teal `#2C6461` and gold `#A5822F` on a cool white, with a
  dark theme of its own. Gold is ornament only (ayah markers, the keffiyeh band).
- Literata for Latin text, Scheherazade New for the Quran, Noto Nastaliq Urdu for Urdu,
  all self-hosted through Fontsource.
- Phones come first. Check layout changes at 390, 768, 820 and 1280 px;
  `scripts/screenshots.ts` captures pages from a running preview.
- Full-screen UI uses `dvh`, never `vh`. Tap targets are at least `--tap` (2.75rem).

### Search

Pagefind indexes `<main data-pagefind-body>` on ayah, surah, theme, Name and person
pages. A page's kind comes from `searchKind` on the layout. Each Arabic block has a
hidden copy without harakat, so a search typed without them still matches. Long lists
on a page (an ayah's themes, a person's ayaat) are `data-pagefind-ignore`, so results
point at the page about the thing, not every page that mentions it.

## Content updates

The generator writes `data/` against `schemas/`. Sync its output in one commit (every
push to `main` is a Cloudflare build), then:

```bash
npm test
npm run build
```

`npm test` checks counts, numbering, references and audio across the whole data set.

## Deployment

Cloudflare Pages, custom domain `tadabbur.belambo.com` (DNS at IONOS, a `CNAME` to the
Pages project):

```
Root directory:     (blank)
Build command:      npm run build
Build output dir:   dist
Node version:       22   (from .node-version)
```

`public/_headers` marks hashed assets immutable. Audio is streamed from
`cdn.islamic.app` and never stored here. Analytics is Cloudflare Web Analytics, set in
the Pages dashboard.

## Feedback

The feedback form posts to a Cloudflare Worker in `feedback-worker/`, which forwards
each message to Telegram. It is deployed separately with wrangler; see its README.
