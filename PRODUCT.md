# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The reader that decisions favour when they conflict: **researchers and
writers**. Someone preparing an article, a talk, a lesson or a piece of study
who needs every ayah the Quran has on a topic or a person, and who wants
reference pages that are dense, quick to scan, and can be filtered and
rearranged.

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
of 140, in 13 categories. So a theme's page is the complete set of ayaat on
it, in Quran order, each shown with its translation, and the same tags tie in
the 99 Names of Allah and the 79 personalities the Quran speaks about. A
reader moves from a verse to an idea to every other verse on that idea.

## Operating Context

- The site has four sections, shown the same way as four cards on the front
  page and four parents in the menu, in this order: **The Quran,
  Personalities, Asma Ul Husna, Themes.**
- **The front page** is a heading over a band of pattern, one line saying what
  the site is, the four cards, then what the word Tadabbur means. A card says
  what its section holds and how its page can be arranged, and shows three
  entries from it with their counts.
- **The menu** shows the four sections with one open to its list (surahs,
  people, Names or themes). The surah being read shows its ayaat as a grid of
  numbers. On a phone the menu is a drawer under a bar at the top.
- **The three listing pages** (Themes, Personalities, Asma Ul Husna) are built
  one way: an index of entries under headings, in columns, with a filter box,
  a row of arrangements and a switch for details. Themes can be arranged by
  topic, A to Z or by most ayaat; Personalities by type, by path, A to Z or by
  most ayaat; the Names by meaning, 1 to 99, A to Z or by most in the Quran.
  On a narrow screen the groups start closed.
- **A theme's page** has its own heading with the Urdu name, its description,
  and one line of facts; then its ayaat grouped by surah in Quran order, each
  with its English translation. An index of those surahs stays in reach: a
  list in the right-hand column on a desktop, a select stuck under the top of
  the screen anywhere narrower.
- **A person's page and a Name's page** open with the heading, a line or two
  under it (the name in Urdu; a Name's meaning in English and Urdu) and the
  facts in lines, with the type or category and every theme as a link.
- **An ayah's page** is the verse first: a head that says where it is (its
  surah's name links back to it in the surah's text), the player between the
  steps to the ayaat either side, the Arabic, English and Urdu, its themes by
  name, then the two Urdu tafsirs, folded.
- **The Quran page** is a listing like the other three: the 114 surahs in
  order, which can be filtered and arranged (Meccan / Medinan, A to Z,
  longest). Its filter also takes a reference such as 2:255 and goes there.
- **A surah's page** is the surah: a short head (names, place, its most
  frequent themes, each leading to this surah's ayaat on that theme), then
  every ayah in Arabic, English and Urdu with its themes. A bar stays at the
  top with a field that goes to any ayah and the number of the ayah being
  read; switches show or hide each language.
- **Reaching an ayah** takes one step from anywhere a reader can type: 2:255
  (or Baqarah 255) in the Quran page's filter, a surah's go-to field, or
  search.
- Researchers and writers move between a listing and the ayaat behind each
  entry, and back. A listing keeps its arrangement, its filter and its open
  groups when the reader returns to it.
- The owner also keeps the same notes as an Obsidian vault and writes personal
  reflections in them. The site is generated from that vault, and every page
  is still readable there and with scripts off: a listing is plain headings
  and lists, the menu is four links.

## Capabilities and Constraints

- **Content is generated.** A separate generator repo
  (`/home/bee/Documents/obsi/quran-markdown`) writes the vault, and it is
  mirrored into `content/`. Structure and content are changed in the
  generator, never by hand here and never by site-side remapping.
- **Built on Quartz 5**, on the `main` branch, deployed to Cloudflare Pages at
  `tadabbur.belambo.com` on every push to `main`. Free hosting plans only.
- **Stock plugin or our own component: decided case by case.** Where a
  third-party plugin cannot do a job well, the owner is shown what styling
  alone reaches and what a custom component would add, and chooses each time.
  Chosen so far: the listing pages are plain lists from the generator with a
  script of our own (2026-10-11 for Themes, 2026-10-12 for the other two); a
  theme's page is a patch to the tag-page plugin with a script of our own
  (2026-10-11); the menu is our own component and the explorer plugin is gone
  (2026-10-12); a surah's page and an ayah's page are written by the generator
  with a script of our own (2026-10-16). Still drawn by a plugin: search, the
  graph and backlinks.
- **Page addresses may change** when the structure improves; no redirects are
  kept.
- Recitation audio is streamed from a CDN, not hosted here.
- Scale: 6,236 ayah pages, 114 surahs, 140 themes, 99 Names, 79 personalities.
- Terminology readers see: surah, ayah (plural ayaat), tafsir, Themes (served
  at `/tags`), Personalities, Asma Ul Husna, Straight / Mixed / Deviated Path.
  On a listing: Filter, Details (Descriptions on Themes), and the arrangement
  names above.
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
   and comparing. Listings favour density, filtering, rearranging and scanning.
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

**Standard: WCAG 2.2 level AA.** Proposed by Claude on 2026-10-11 as the usual
measurable target for that requirement, and confirmed by the owner on
2026-10-12.

What that means on this site in particular:

- **Screen readers.** Every page makes sense read aloud in order: one main
  heading, headings in sequence, named landmarks, a way to skip the menu, and
  links and buttons that say what they do. The page being read is marked in
  the menu.
- **Three languages, marked.** Arabic, Urdu and English text each carry their
  language, so a screen reader switches voice and braille tables correctly and
  the browser picks the right direction. This matters most for the verses.
- **Recitation.** The player is reachable and operable by keyboard and screen
  reader, and never starts on its own. The Arabic text beside it is the
  equivalent for readers who cannot hear it.
- **Keyboard only.** Everything a pointer can do (the menu and its grid of
  ayah numbers, a listing's filter, arrangements, switch and groups, a theme's
  surah index, search, Next and Prev, the feedback form) can be done from the
  keyboard, with focus always visible.
- **Low vision.** Text and controls meet AA contrast in both themes; the page
  still works with the browser's text size doubled and at 400% zoom without
  sideways scrolling; nothing depends on colour alone.
- **Touch and motor.** Targets are large enough to hit (2.75rem on a touch
  screen), and no action needs a hover, a drag or a precise gesture.
- **Motion and attention.** Animation is sparing and respects the reader's
  reduced-motion setting.
- **Scripts off.** The content and the way to it remain: listings are plain
  lists, the menu is its four section links.

**Measured so far (2026-10-11 and 12).** In headless Chrome only, on a build of
the site, at widths from 320px to 2560px, touch and mouse, both themes: the
front page, the three listing pages, a person's page, a Name's page and the
menu. On those: one main heading each; no sideways scroll; text contrast 6:1
or better; every control reachable and usable from the keyboard with a
visible focus ring; Arabic and Urdu marked. On the front page and the listing
pages, nothing is off-screen with the text size doubled on a phone. A "Skip to the page" link is the first Tab stop on
every page.

**Known gaps.**

- Olive Leaf (`#607300`), the hover colour, is 3.2:1 on the dark page: enough
  for a focus ring, under the 4.5:1 that hovered text needs.
- With the text size doubled on a phone, the bar at the top loses the site's
  name.
- On a tablet and a desktop the feedback button floats over the page's
  content. (On a phone it is in the thumb bar.)

**Measured 2026-10-16** (headless Chrome, a build of the site, 344px to
1920px, touch and mouse): a surah's page, an ayah's page and The Quran page.
No sideways scroll at any width; the go-to bar one row at every width; a link
to an ayah lands under the bar; every control reachable by keyboard.

**Not measured.** A theme's page against this standard, the new pages' contrast
in numbers, search, the graph and the feedback form. Nothing
has been tried with a real screen reader, in Safari or Firefox, on a real
phone, or at 400% zoom.
