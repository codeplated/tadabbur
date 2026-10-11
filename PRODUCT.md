# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The reader that decisions favour when they conflict: **researchers and
writers**. Someone preparing an article, a talk, a lesson or a piece of study
who needs every ayah the Quran has on a topic or a person, and who wants
reference pages that are dense, sortable and quick to scan.

They read **English and Urdu equally**. Neither language is secondary: the
menus and headings are English, the translations are in both, and the tafsir
is Urdu.

They work on **every kind of screen in equal measure**: phone, tablet,
foldable, laptop, desktop monitor and high-resolution display. No device is
the fallback for another.

Some of them **cannot see the screen, or use it differently**: blind readers
using a screen reader, readers with low vision, readers who cannot use a mouse
or a touch screen, and readers with other disabilities. The owner wants the
site to serve them as fully as anyone else.

Other readers (people reading for personal reflection, students in a study
circle) are welcome and use the same pages. They were not chosen as the
primary reader.

## Product Purpose

Tadabbur (تدبّر) means reflecting deeply on the Quran. The site is a
structured companion for that reflection, and the one thing it must do best is
**let a reader follow a theme across the whole Quran**: start from a topic
such as patience or Tawheed and reach every ayah that carries it.

Reading one ayah closely, finding an ayah quickly and reading a surah through
all stay. When space or attention is short, following a theme wins.

Success, as the owner put it on 2026-10-11: production-grade software with the
best possible UI and UX, where nothing looks broken and nothing is a guess.

## Positioning

Every one of the 6,236 ayaat is tagged with themes drawn from one curated set
of 139, in 13 categories. So a theme's page is the complete set of ayaat on
it, in Quran order, each shown with its translation, and the same tags tie in
the 99 Names of Allah and the 79 personalities the Quran speaks about. A
reader moves from a verse to an idea to every other verse on that idea.

## Operating Context

- The site has four sections, shown the same way as four cards on the front
  page and four parents in the left menu, in this order: **The Quran,
  Personalities, Asma Ul Husna, Themes.**
- A theme's page lists its ayaat grouped by surah. An ayah's page holds, in
  order: recitation, Arabic, Urdu translation, English translation, two Urdu
  tafsirs, and its connections.
- Researchers and writers move between a listing (themes, people, names) and
  the ayaat behind each entry, and back. Listings are tables with tabs that
  filter and columns that sort.
- The owner also keeps the same notes as an Obsidian vault and writes personal
  reflections in them. The site is generated from that vault.

## Capabilities and Constraints

- **Content is generated.** A separate generator repo
  (`/home/bee/Documents/obsi/quran-markdown`) writes the vault, and it is
  mirrored into `content/`. Structure and content are changed in the
  generator, never by hand here and never by site-side remapping.
- **Built on Quartz 5**, on the `main` branch, deployed to Cloudflare Pages at
  `tadabbur.belambo.com` on every push to `main`. Free hosting plans only.
- **Stock plugin or our own component: decided case by case.** Where a
  third-party plugin cannot do a job well (the listing tables and the left
  menu are both plugin-drawn today), the owner is shown what styling alone
  reaches and what a custom component would add, and chooses each time.
- **Page addresses may change** when the structure improves; no redirects are
  kept.
- Recitation audio is streamed from a CDN, not hosted here.
- Scale: 6,236 ayah pages, 114 surahs, 139 themes, 99 Names, 79 personalities.
- Terminology readers see: surah, ayah (plural ayaat), tafsir, Themes (served
  at `/tags`), Personalities, Asma Ul Husna, Straight / Mixed / Deviated Path.
- Prose that readers see avoids em dashes; titles are capitalised.

**Open to change (owner, 2026-10-11):** the whole current identity. The name
and logo, the keffiyeh band on the front page, the colours and the fonts are
none of them binding. Any of them may be replaced, with the owner's approval of
the replacement.

## Evidence on Hand

- The full text: Arabic, English (Sahih International) and Urdu (Syed Abul
  A'la Maududi) for every ayah.
- Two Urdu tafsirs: Bayan ul Quran (Dr. Israr Ahmad) and Tazkirul Quran
  (Maulana Wahiduddin Khan).
- Recitation by Mishary Rashid Alafasy for every ayah.
- 114 surah thumbnails in `content/attachments/`.
- Theme tags for every ayah, 99 Name notes and 79 personality notes.
- A feedback form that reaches the owner by Telegram.

Not on hand, and not to be invented: usage numbers or analytics findings,
testimonials, endorsements, and permission to republish. Permission for both
tafsirs and the licences for the translations and audio are unresolved and
tracked in the generator's `docs/LICENSES.md`.

## Product Principles

1. **A theme leads to all of its ayaat.** Any change is judged first by
   whether it makes following a theme across the Quran faster and clearer.
2. **Reference before reading mood.** The primary reader is looking things up
   and comparing. Listings favour density, sorting and scanning.
3. **No second class.** English and Urdu; phone, tablet, foldable, laptop,
   desktop and high-resolution display; sighted readers and readers using
   assistive technology. Each is designed for, none is a fallback.
4. **One structure, shown the same way everywhere.** The same four sections in
   the same order on the front page and in the menu.
5. **Shown and measured, not assumed.** A visible change is checked on the
   running site with measurements and before/after pictures, and the owner
   chooses between options before a layout that touches every page changes.

## Accessibility & Inclusion

**Requirement (owner, 2026-10-11):** the site should serve blind readers and
readers with other disabilities.

**Working standard: WCAG 2.2 level AA.** Proposed by Claude on the same date as
the usual measurable target for that requirement; it stands until the owner
sets a different one.

What that means on this site in particular:

- **Screen readers.** Every page makes sense read aloud in order: one main
  heading, headings in sequence, named landmarks, a way to skip the menu, and
  links and buttons that say what they do. The left menu holds thousands of
  entries and must not have to be read through to reach the page.
- **Three languages, marked.** Arabic, Urdu and English text each carry their
  language, so a screen reader switches voice and braille tables correctly and
  the browser picks the right direction. This matters most for the verses.
- **Recitation.** The player is reachable and operable by keyboard and screen
  reader, and never starts on its own. The Arabic text beside it is the
  equivalent for readers who cannot hear it.
- **Keyboard only.** Everything a pointer can do (tabs, sorting a column, the
  menu, search, Next and Prev, the feedback form) can be done from the
  keyboard, with focus always visible.
- **Low vision.** Text and controls meet AA contrast in both themes; the page
  still works at 200% zoom and at 400% without sideways scrolling; nothing
  depends on colour alone.
- **Touch and motor.** Targets are large enough to hit, and no action needs a
  hover, a drag or a precise gesture.
- **Motion and attention.** Animation is sparing and respects the reader's
  reduced-motion setting.

**Not yet measured.** The site has not been audited against this standard, so
how far it is from it today is unknown.
