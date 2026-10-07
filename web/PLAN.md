# Tadabbur on Astro: migration plan

Status: draft for review. Nothing outside `web/` changes until the cutover phase, and
that phase needs your explicit approval.

## Decisions taken

- All work stays on the `astro` branch. `main` is not touched.
- One-time import: the Obsidian vault in `content/` is converted to typed JSON in
  `web/data/`. After cutover the vault is deleted, and the generator repo is changed
  to emit that JSON directly.
- The new app lives in `web/`, next to Quartz, until cutover.
- v1 features: full-text search, canvas pages, graph view, study notes.
- Full visual redesign. Branding assets (logo, icon, keffiyeh, og-image) are kept.
- Application code is written from scratch. The data is respected as-is: no text is
  rewritten, only restructured.

## What the data actually is

Surveyed from `content/`:

| Entity        | Count | Source today                                     |
| ------------- | ----- | ------------------------------------------------ |
| Surahs        | 114   | `N - Name/index.md` frontmatter + body           |
| Ayaat         | 6,236 | `N - Name/S_A.md`, fixed `##` sections           |
| Names (Asma)  | 99    | `0 - Explore/Asma Ul Husna/*.md`                 |
| Personalities | 79    | `0 - Explore/Personalities/*.md`                 |
| Themes (tags) | 139   | tables in `0 - Explore/Themes.md` and `index.md` |
| Canvases      | 1     | `1 - The Opener/The Opener.canvas`               |
| Surah images  | 114   | `attachments/surah_NNN.png` (0.6 to 1.3 MB each) |

Every file follows the same structure (all headings present in 100% of files), so
the import is deterministic. No file has user-written text after
`<!-- GENERATED:END -->`; the "Study Notes", "Tafsir Notes" and "Surah Notes"
sections are all empty placeholders today.

`Quran.base` and the explore index pages are views, not data. They become pages in
the app.

## Repo layout (inside `web/`)

```
web/
├── data/                    ← imported JSON, committed, the single source of truth
│   ├── surahs.json
│   ├── ayaat/001.json … 114.json   ← one file per surah, keeps diffs and files small
│   ├── names.json
│   ├── personalities.json
│   ├── themes.json
│   └── canvases/the-opener.json
├── public/                  ← robots.txt, static files copied as-is
├── scripts/
│   └── import-vault.ts      ← one-time vault → JSON converter, with integrity checks
├── src/
│   ├── content.config.ts    ← collections + Zod schemas
│   ├── lib/                 ← pure functions: indexes, theme counts, graph, audio URLs
│   ├── components/          ← .astro components; islands only where JS is needed
│   ├── layouts/
│   ├── pages/               ← routes
│   ├── styles/              ← design tokens + global CSS
│   └── assets/surahs/       ← surah images, optimized at build
├── tests/
│   ├── unit/                ← Vitest: importer, lib functions, data integrity
│   └── e2e/                 ← Playwright + axe, at 390 / 768 / 820 / 1180 px
├── astro.config.ts
├── package.json
└── tsconfig.json
```

## Data model

All collections are Astro content-layer collections with Zod schemas. Cross-links use
`reference()`, so a broken link fails the build instead of shipping a dead link.

**surahs**: `number`, `transliteration` ("Al-Fatihah"), `name.en / .ar / .ur`,
`revelation` (`meccan | medinan`), `ayahCount`, `image`, `notes?`.

**ayaat** (id `"2:255"`): `surah` → surahs, `number`, `globalNumber` (1 to 6236,
computed at import; the audio URL is derived from it, so no HTML is stored),
`arabic`, `urdu`, `english`, `tafsir: { source: "Bayan ul Quran", paragraphs[] }`,
`themes[]` → themes, `related[]` → ayaat (the empty "Thematic" connections),
`notes?`.

**names**: `number`, `transliteration`, `arabic`, `urdu`, `english`, `root`,
`rootMeaning`, `category`, `occurrences`, `meaning.en / .ur`, `inDailyLife`,
`keyAyaat[]` → ayaat, `related[]` → names, `themes[]` → themes, `notes?`.

**personalities**: `slug` ("abu-bakr"), `name.en / .ar / .ur`, `aliases[]`,
`kind` (Prophet, Companion, …), `path` (`straight | deviated | mixed`),
`pathReason`, `era`, `story.en / .ur`, `lessons[]`, `ayaat[]` → ayaat,
`connected[]` → personalities, `themes[]` → themes, `notes?`.

**themes**: `id` ("tawheed"), `label.en / .ur`, `category` (Belief, Hereafter, …),
`order` (the curated order from the home page), `description`. Counts are computed
at build, not stored.

**canvases**: JSON Canvas 1.0, with file nodes rewritten from vault paths to ayah ids.

The `notes?` fields keep the Study Notes area as data: empty today, rendered only when
present.

The importer refuses to write output unless: counts match the table above, every
reference resolves, every ayah has Arabic, Urdu, English and tafsir, and global
numbers run 1 to 6236 without gaps. A Vitest suite re-checks the committed JSON on
every CI run.

## Routes

| URL                             | Page                                                        |
| ------------------------------- | ----------------------------------------------------------- |
| `/`                             | Home: hero, how to read, themes by category, surah entry    |
| `/surahs/`                      | All 114 surahs as cards                                     |
| `/2/`                           | Surah: overview, themes in this surah, ayah grid            |
| `/2/255/`                       | Ayah: audio, Arabic, Urdu, English, tafsir, themes, graph   |
| `/themes/`                      | All themes, grouped by category, with counts                |
| `/themes/tawheed/`              | Theme: ayaat grouped by surah in Quran order, related pages |
| `/names/`, `/names/al-rahman/`  | The 99 Names                                                |
| `/people/`, `/people/abu-bakr/` | Personalities                                               |
| `/canvas/the-opener/`           | Reflection canvas                                           |
| `/search/`                      | Search (also opened as a dialog from every page)            |
| `/404`                          | Not found                                                   |

`/2/255/` follows the convention of quran.com and most Quran sites. The site is not
live, so no redirects from Quartz URLs are needed.

About 6,700 static pages in total.

## Build-time logic

Everything the Quartz patches did becomes ordinary, typed code in `src/lib/`:

- theme pages grouped by surah, in Quran order, with a surah jump bar
- per-surah theme table, previous/next ayah, previous/next surah
- backlinks ("this ayah appears in: Name X, Personality Y")
- theme counts across ayaat, names and personalities
- the local graph for each page, laid out at build time (see below)

## JavaScript in the browser (islands only)

Pages ship zero JS by default. Islands:

- **Search**: Pagefind, indexed after build. English, Urdu and Arabic, with filters
  for surah, theme and page type. The Arabic index is normalized so a search without
  harakat still matches.
- **Audio**: native `<audio>` per ayah, plus an optional "play surah continuously"
  player that follows along.
- **Reader preferences**: show or hide Urdu, English and tafsir, Arabic font size,
  theme. Saved in `localStorage`, applied before first paint so nothing flashes.
- **Graph**: the local graph (page plus direct links, capped at about 50 nodes) is
  computed and laid out with d3-force at build time and shipped as static SVG. It
  works on phones with no JS. Pan and zoom are an enhancement on desktop only. A
  global graph page is out of scope for v1.
- **Canvas**: rendered at build as positioned cards; a small island adds pan and zoom.
- **Feedback**: reuses the existing `feedback-worker/` unchanged.

## Design

Full redesign, mobile first, presented to you as mockups before any page is built.

Fixed constraints carried over from what was learned on Quartz:

- most readers are on phones; nothing above the verse that does not earn its space
- `dvh`, not `vh`; 44 px minimum tap targets on touch; `(hover: none)` vs width
  queries kept separate
- Arabic and Urdu set in their own fonts and direction (`lang`, `dir` set from the
  data, not guessed from text)
- light and dark themes
- WCAG 2.2 AA contrast and keyboard navigation

Fonts are self-hosted via Fontsource and subset (Scheherazade New, Noto Naskh Arabic,
Noto Nastaliq Urdu, plus a Latin face), replacing the Google Fonts request. Surah
images go through `astro:assets` to AVIF/WebP at the sizes actually shown (114 images,
so build cost is small).

## Stack

- Astro 7, TypeScript strict, static output
- Plain CSS with design tokens (custom properties) and logical properties for RTL.
  No CSS framework unless the design phase shows a need.
- Pagefind, `@astrojs/sitemap`
- ESLint, Prettier, `astro check`
- Vitest for importer and lib; Playwright with axe for e2e and accessibility
- GitHub Actions: check, test, build, Lighthouse budget on a sample of pages
- Cloudflare Pages: root directory `web`, build `npm run build`, output `dist`

## Phases and review gates

Each phase ends with something you review. Nothing proceeds without your OK.

1. **Scaffold**: empty Astro app in `web/`, tooling, CI.
2. **Import**: `import-vault.ts`, the JSON in `web/data/`, integrity tests.
   Review: the schema and a sample of the data.
3. **Skeleton**: collections, every route, unstyled. Review: navigate the whole site.
4. **Design**: mockups of home, surah, ayah, theme pages on phone and desktop.
   Review: pick a direction.
5. **Build-out**: design system and all pages.
6. **Islands**: search, audio, preferences, graph, canvas, feedback.
7. **QA**: Playwright, axe, Lighthouse, real-phone check, Cloudflare preview deploy.
8. **Cutover** (destructive, needs your explicit approval): move `web/` to the repo
   root, delete Quartz (`quartz/`, `quartz.ts`, `quartz.config.yaml`, `patches/`),
   delete `content/`, rewrite `CLAUDE.md` and `README.md`, point Cloudflare Pages at
   the new build. All of this happens on the `astro` branch; `main` is never touched.
   Merging to `main` is your call, outside this plan.

## Outside this repo

- **Generator**: change it to write `web/data/*.json` matching the Zod schemas. The
  schemas will be exported as JSON Schema so the generator can validate against them.
  Until then, `import-vault.ts` stays runnable on fresh vault output.
- **Cloudflare Pages**: change the build settings at cutover.

## Open questions (resolved)

1. Personality slugs come from the frontmatter `id` in kebab case (`abu_bakr` becomes
   `abu-bakr`).
2. Name slugs come from the transliteration (`al-rahman`). Two pairs of Names share a
   transliteration, so those four take their number as a suffix: `al-majid-49`,
   `al-majid-66`, `al-wali-56`, `al-wali-78`.
3. The interface is English only for v1. The content stays trilingual.

## Status

Phases 1 to 7 are done in `web/` on the `astro` branch. Phase 8 is prepared but not
run: see `CUTOVER.md`.

- **Data**: `npm run import:vault` converts the vault in about a second and refuses to
  write if any count, reference or numbering check fails. 114 surahs, 6,236 ayaat, 99
  Names, 79 themes, 139 people, 1 canvas. JSON Schemas for the generator are in
  `schemas/` (`npm run schemas`).
- **Build**: 6,678 pages in about 10 seconds, then Pagefind indexes 6,667 of them.
  An ayah page is about 28 KB of HTML; the largest pages are the long theme pages
  (`/themes/kufr/`, about 580 KB raw, 120 KB compressed).
- **Checks**: `npm run check` (astro check, ESLint, Prettier), `npm test` (11 data
  integrity tests), `npm run test:e2e` (Playwright on a phone and a desktop: 20 flow
  tests and axe on 12 pages, no serious or critical findings). CI runs all of them.
- **Reviewed by screenshot** at 390, 820 and 1280 px. Fixes from that pass: the
  feedback button no longer floats over the verse (it is in the menu and the footer),
  the verse is a step smaller on phones, the canvas opens at a readable zoom, and
  search excerpts no longer run page facts together.

Not done, and needs you:

- A check on a real phone, and a Lighthouse run against a Cloudflare preview deploy.
- `npm approve-scripts` for esbuild and fsevents (npm 11 asks once; the build works
  without it).
- The generator change to emit `data/*.json` directly.
