# Tadabbur (تدبّر)

Tadabbur is a structured Quran knowledge base, published as a static site built with
[Astro](https://astro.build). Every ayah of the 114 surahs has its recitation, Arabic
text, Urdu and English translations and Urdu tafsir. Themes, the Names of Allah and
the people of the Quran link the ayaat together.

Site: [tadabbur.belambo.com](https://tadabbur.belambo.com)

The content is written by the separate Tadabbur generator repo as JSON in `data/`.
This repo turns that JSON into about 6,700 static pages, a search index and a feedback
form.

## Stack

- [Astro 7](https://astro.build), fully static output (no server, no adapter)
- Content collections over the JSON in `data/`, validated with Zod
- [Pagefind](https://pagefind.app) for search, built after the site
- d3-force for the local graphs, laid out at build time
- No UI framework in the browser: small custom elements only
- Fonts self-hosted through Fontsource
- Recitation audio streamed from `cdn.islamic.app`, never stored here
- Hosted on Cloudflare Pages; a small Cloudflare Worker forwards feedback to Telegram

## Getting started

Requires Node 22.12 or later (`.node-version` pins 22).

```bash
git clone https://github.com/codeplated/tadabbur.git
cd tadabbur
npm ci
npm run dev
```

The dev server runs at <http://localhost:8080>.

To build and serve the production site locally:

```bash
npm run build
npm run preview
```

For the end-to-end tests, install the Playwright browser once:

```bash
npx playwright install chromium
```

## Scripts

| Script             | Does                                                      |
| ------------------ | --------------------------------------------------------- |
| `npm run dev`      | Dev server with hot reload on port 8080                   |
| `npm run build`    | Static site into `dist/`, then the Pagefind index into it |
| `npm run preview`  | Serves `dist/` on port 8080                               |
| `npm run check`    | `astro check` (types), ESLint and Prettier                |
| `npm run format`   | Prettier, writing fixes                                   |
| `npm test`         | Data integrity tests over `data/` (Vitest)                |
| `npm run test:e2e` | Playwright flows and axe checks on a phone and a desktop  |
| `npm run schemas`  | Writes the data contract as JSON Schema into `schemas/`   |

`npm run test:e2e` serves the last build, so run `npm run build` first. CI runs all of
them on every push and pull request (`.github/workflows/ci.yml`).

Port 8080 is not arbitrary: the feedback Worker only accepts requests from the live
site and `http://localhost:8080`.

## Repo structure

```
data/                  the content, generated: surahs, ayaat/001-114, themes, names,
                       personalities, their categories, canvases/
schemas/               JSON Schema for data/, the contract with the generator
src/
  content.config.ts    content collections over data/
  data/schema.ts       Zod schemas: the source of the collections and schemas/
  lib/                 site.ts (lookups), graph.ts (layout), format.ts, images.ts
  pages/               one route per kind of page (see Routes)
  layouts/Base.astro   page shell, head, preferences script
  components/          header, footer, verse, search, settings, player, graph
  scripts/prefs.ts     reader preferences in the browser
  styles/global.css    design tokens and global styles
  assets/surahs/       surah art, optimised at build time
public/                copied as is: icon, logo, og-image, keffiyeh, _headers, robots.txt
assets-src/            source art (Keffiyeh.svg), not published
scripts/               export-schemas.ts, screenshots.ts
tests/unit/            data integrity (Vitest)
tests/e2e/             user flows and accessibility (Playwright, axe)
feedback-worker/       Cloudflare Worker for the feedback form, deployed on its own
```

## How it fits together

```
data/*.json  ->  src/content.config.ts  ->  src/lib/site.ts  ->  src/pages/**
(the content)    (collections + Zod)        (indexes, lookups)   (one route per thing)
```

- **`src/data/schema.ts`** is the contract. The collections and the JSON Schemas in
  `schemas/` both come from it. In the collections, ids become `reference()`s, so a
  link to something missing fails the build.
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

Each interactive part is a small custom element or a delegated listener: search
(`site-search`, Pagefind loaded on first use), recitation (`play-recitation`,
`surah-player`), the canvas zoom (`canvas-view`), the home page go-to box (`go-to`),
dialogs (`[data-open]`/`[data-close]`), and reader preferences.

Preferences (theme, Arabic size, which translations show) are saved in localStorage
under `tadabbur:prefs` and applied by an inline script in `<head>` before first paint,
as `data-*` attributes on `<html>` that the CSS reads.

### Design

- Colours come from the logo: teal `#2C6461` and gold `#A5822F` on a cool white, with a
  dark theme of its own. Gold is ornament only (ayah markers, the keffiyeh band).
- Literata for Latin text, Scheherazade New for the Quran, Noto Nastaliq Urdu for Urdu.
- Phones come first. Check layout changes at 390, 768, 820 and 1280 px.
- Full-screen UI uses `dvh`, never `vh`. Tap targets are at least `--tap` (2.75rem).

To capture screenshots from a running preview:

```bash
npx tsx scripts/screenshots.ts screenshots 390 / /2/255/
```

`FULL=0` captures the viewport only; `SCHEME=dark` switches the colour scheme.

### Search

Pagefind indexes `<main data-pagefind-body>` on ayah, surah, theme, Name and person
pages. A page's kind comes from `searchKind` on the layout. Each Arabic block has a
hidden copy without harakat, so a search typed without them still matches. Long lists
on a page (an ayah's themes, a person's ayaat) are `data-pagefind-ignore`, so results
point at the page about the thing, not every page that mentions it.

## Content updates

Content is never edited here. Fix it in the generator, which writes `data/` against
`schemas/`. To update the site:

1. Copy the generator's output over `data/`.
2. Check and build:

   ```bash
   npm test
   npm run build
   ```

   `npm test` checks counts, numbering, references and audio across the whole data
   set; the build fails on any reference to something missing.

3. Commit it in one commit. Every push to `main` is a Cloudflare build, and the free
   plan allows 500 a month.

If the data format has to change, change `src/data/schema.ts`, run `npm run schemas`,
commit `schemas/` with it, and make the same change in the generator.

## Deployment

Cloudflare Pages builds every push to `main`:

```
Repository:         github.com/codeplated/tadabbur
Root directory:     (blank)
Build command:      npm run build
Build output dir:   dist
Node version:       22   (from .node-version)
Custom domain:      tadabbur.belambo.com
```

DNS for `belambo.com` is at IONOS, which holds a `CNAME tadabbur` to the Pages project.
Analytics is Cloudflare Web Analytics, enabled in the Pages dashboard; there is no
analytics code in the site. `public/_headers` marks hashed assets immutable and sets
the security headers.

## Feedback

The "Send feedback" form (`src/components/Feedback.astro`) posts to a Cloudflare
Worker in `feedback-worker/`, which forwards each message to Telegram. It is deployed
separately with wrangler; setup is in [`feedback-worker/README.md`](./feedback-worker/README.md).
Its bot token and chat ID are wrangler secrets and never go in the repo.

## Troubleshooting

- **`npm ci` warns about `allow-scripts` for esbuild and fsevents.** The build works
  without them. To allow them, run `npm approve-scripts esbuild fsevents`.
- **`npm run preview` says a server is already running.** Astro keeps one preview
  server per project and runs it in the background when started by an AI agent. Stop
  it with `npx astro preview stop`.
- **The feedback form fails locally.** The dev server must be on port 8080, the only
  local origin the Worker accepts.
