---
name: Tadabbur
description: A structured Quran knowledge base, recorded as it looks on 2026-10-12
colors:
  parchment: "#f7f3ea"
  parchment-edge: "#e4ddcf"
  faded-ink: "#7f7768"
  faded-ink-strong: "#5f594e"
  soft-ink: "#3b3833"
  black-ink: "#24221e"
  ink-teal: "#2c6461"
  olive-leaf: "#607300"
  ink-teal-wash: "rgba(44, 100, 97, 0.08)"
  gilt-marker: "#f0d58a99"
  night-desk: "#1c1b19"
  night-edge: "#33312c"
  night-faded: "#8a8478"
  night-faded-strong: "#aba599"
  night-soft: "#cfc8bb"
  night-paper: "#e8e2d6"
  ink-teal-lit: "#8fbfb5"
  ink-teal-lit-wash: "rgba(143, 191, 181, 0.1)"
  gilt-marker-dim: "#a8862f66"
typography:
  display:
    fontFamily: "Lora, Georgia, serif"
    fontSize: "2.6rem"
    fontWeight: 700
    lineHeight: 1.2
  headline:
    fontFamily: "Lora, Georgia, serif"
    fontSize: "1.75rem"
    fontWeight: 700
  title:
    fontFamily: "Lora, Georgia, serif"
    fontSize: "1.4rem"
    fontWeight: 600
    letterSpacing: "0.01em"
  body:
    fontFamily: "Literata, Georgia, serif"
    fontSize: "1.05rem"
    fontWeight: 400
    lineHeight: 1.8
  label:
    fontFamily: "Literata, Georgia, serif"
    fontSize: "0.9rem"
    fontWeight: 400
  entry:
    fontFamily: "Literata, Georgia, serif"
    fontSize: "0.95rem"
    fontWeight: 400
    lineHeight: 1.45
  count:
    fontFamily: "Literata, Georgia, serif"
    fontSize: "0.8rem"
    fontWeight: 400
  arabic:
    fontFamily: "Scheherazade New, Noto Naskh Arabic, serif"
    fontSize: "1.9rem"
    fontWeight: 400
    lineHeight: 2.2
  urdu:
    fontFamily: "Noto Nastaliq Urdu, serif"
    fontSize: "1.2rem"
    fontWeight: 400
    lineHeight: 2.5
rounded:
  sm: "6px"
  md: "10px"
  lg: "16px"
spacing:
  grid-gap: "5px"
  gutter: "1rem"
  tap-target: "2.75rem"
  control: "2.5rem"
  app-bar: "3.5rem"
  index-column: "18.5rem"
  card-column: "17rem"
components:
  tag-chip:
    backgroundColor: "{colors.ink-teal-wash}"
    textColor: "{colors.ink-teal}"
    rounded: "{rounded.sm}"
    padding: "0 0.6rem"
  arrangement-on:
    backgroundColor: "{colors.ink-teal}"
    textColor: "{colors.parchment}"
    typography: "{typography.entry}"
    rounded: "{rounded.md}"
    height: "{spacing.control}"
  arrangement-off:
    backgroundColor: "transparent"
    textColor: "{colors.soft-ink}"
    typography: "{typography.entry}"
    rounded: "{rounded.md}"
    height: "{spacing.control}"
  field-filter:
    backgroundColor: "transparent"
    textColor: "{colors.black-ink}"
    rounded: "{rounded.md}"
    height: "{spacing.control}"
  row-entry:
    backgroundColor: "transparent"
    textColor: "{colors.ink-teal}"
    typography: "{typography.entry}"
  row-current:
    backgroundColor: "{colors.ink-teal-wash}"
    textColor: "{colors.black-ink}"
    rounded: "{rounded.sm}"
  button-step:
    backgroundColor: "transparent"
    textColor: "{colors.ink-teal}"
    rounded: "{rounded.md}"
    height: "{spacing.tap-target}"
  card-section:
    backgroundColor: "transparent"
    textColor: "{colors.soft-ink}"
    rounded: "{rounded.lg}"
    padding: "1rem 1.1rem 0.7rem"
  card-surah:
    backgroundColor: "{colors.ink-teal-wash}"
    textColor: "{colors.soft-ink}"
    rounded: "{rounded.lg}"
  field-search:
    backgroundColor: "transparent"
    textColor: "{colors.soft-ink}"
    rounded: "{rounded.md}"
    height: "{spacing.tap-target}"
  box-properties:
    backgroundColor: "transparent"
    textColor: "{colors.soft-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
---

# Design System: Tadabbur

This file records the site **as it looks on 2026-10-12**. It is a description,
not a commitment: the owner has said the whole identity (name, logo, keffiyeh
band, colours, fonts) is open to change. A redesign replaces this file.

## Overview

**Creative North Star: "The Study Desk"**

A working reference laid open. The verse, its translations, its commentary and
the indexes that lead to other verses are all within reach on one surface. The
owner's words for the present look are plain, dense and practical: it is a tool
for looking things up and comparing, and atmosphere comes second to
information.

The surface is paper-coloured with dark ink for text and one deep green-blue
for anything that leads somewhere. Everything is set in serif type. There is
almost no decoration: boxes are drawn with a single thin line, and the only
ornament is a band of keffiyeh pattern across the front page.

The pages that list things are indexes, as at the back of a book: names in
columns under headings, a number at the end of each line. Tables with tabs,
which the site used until 2026-10-12, are gone.

**Key Characteristics:**

- Paper and ink, in a light theme and a dark theme with the same roles.
- One colour for links at rest, a second for hover and focus.
- Serif type throughout, with dedicated faces for Arabic and Urdu.
- Thin lines, rounded corners, almost no shadow.
- Indexes in columns, not tables: a name, and its count at the end of the row.
- Three columns on a wide screen (menu, page, and a rail of contents and
  backlinks); the listing pages and a theme's page give the rail's width to
  the page.

## Colors

Warm neutrals for the page and the text, and two greens that never swap roles.

### Primary

- **Ink Teal** (`ink-teal`): every link at rest, the menu's section names,
  breadcrumbs, tag chips, the fill of the selected arrangement on a listing
  page and of the skip link. In the dark theme its place is taken by **Ink
  Teal Lit** (`ink-teal-lit`).

### Secondary

- **Olive Leaf** (`olive-leaf`): every hover and pressed state, and the focus
  ring, on every page, in both themes. The same value in light and dark, by
  choice. It is 3.2:1 on the dark page: enough for a ring or a border, not for
  text that has to stay readable, so nothing rests in it.

### Neutral

- **Parchment** (`parchment`): the page. Dark theme: **Night Desk**.
- **Parchment Edge** (`parchment-edge`): lines and borders around things that
  are not controls: cards, the properties box, dividers. Dark theme: **Night
  Edge**.
- **Faded Ink** (`faded-ink`): the outline of a control (the filter field, the
  arrangement buttons, a group's rule on a listing page), where a line has to
  be seen: Parchment Edge is 1.2:1 against the page. Dark theme: **Night
  Faded**.
- **Faded Ink Strong** (`faded-ink-strong`): small secondary text: counts, an
  entry's number, "139 themes". The stylesheet computes it, Faded Ink taken
  35% of the way to Black Ink, because Faded Ink alone is 4.0:1 on the page;
  this is about 6:1. Dark theme: **Night Faded Strong**.
- **Soft Ink** (`soft-ink`): body text. Dark theme: **Night Soft**.
- **Black Ink** (`black-ink`): headings, the site title, the Arabic verse.
  Dark theme: **Night Paper**.
- **Ink Teal Wash** (`ink-teal-wash`): the faint fill behind a link in prose,
  a tag chip, a surah card, a hovered row, and the page being read in the
  menu. Dark theme: **Ink Teal Lit Wash**.
- **Gilt Marker** (`gilt-marker`): highlighted text. Dark theme: **Gilt Marker
  Dim**.

### Named Rules

**The Two Greens Rule.** Ink Teal means "this leads somewhere". Olive Leaf
means "you are pointing at this". Neither is used for the other's job, and
plugin controls are brought into line with it.

**The You Are Here Rule.** The page being read (in the menu, in a theme's
surah index) is marked by weight 600 and an Ink Teal Wash, and says so to a
screen reader. A selected arrangement is filled with Ink Teal. Neither uses
Olive Leaf, and neither relies on colour alone.

**The Readable Small Text Rule.** Text under 1rem is never set in Faded Ink.
It uses Faded Ink Strong or darker.

## Typography

**Display and heading font:** Lora (with Georgia, serif)
**Body font:** Literata (with Georgia, serif)
**Arabic font:** Scheherazade New (with Noto Naskh Arabic)
**Urdu font:** Noto Nastaliq Urdu
**Code font:** IBM Plex Mono

**Character:** Two bookish serifs for English, and for Arabic and Urdu the
scripts' own traditional forms (Naskh for the verse, Nastaliq for Urdu) at
sizes and line spacing that give their marks room.

### Hierarchy

- **Display** (700, 2.6rem, 1.2): the heading over the front page's pattern
  band, and nowhere else.
- **Headline** (700, 1.75rem): a page's title. The site name in the menu uses
  the same size.
- **Title** (600, 1.4rem, 0.01em tracking): section headings inside a page,
  such as Arabic, English and Tafsir on an ayah.
- **Body** (400, 1.05rem, 1.8): prose, translations.
- **Label** (400, 0.9rem): the properties box, the small line on a front page
  card, a row in a theme's surah index.
- **Entry** (400, 0.95rem, 1.45): a line in an index: a listing page's
  entries, the menu's entries, the arrangement buttons.
- **Count** (400, 0.8rem, tabular figures): the number at the end of a row, an
  entry's number, a detail line under an entry.
- **Arabic** (400, 1.9rem, 2.2): the verse.
- **Urdu** (400, 1.2rem, 2.5): Urdu translation and tafsir.

A group's heading on a listing page is Lora at 1.05rem. Links in prose, chips
and the page being read are weight 600; an entry in an index or in the menu is
weight 400.

### Named Rules

**The Marked Language Rule.** Arabic and Urdu text is tagged with its language
so that it gets its own face, its own line spacing and right-to-left direction.
Latin text never borrows those settings and they never borrow Latin ones. Where
the generator knows the language it says so in the note; the site guesses only
what is left.

## Layout

Three ways of laying out the same page, switched by width:

- **Below 800px:** one column, exactly as wide as the screen. The menu becomes
  a 3.5rem bar fixed to the top with a drawer under it; the right rail stacks
  under the page.
- **800px to 1200px:** two columns, the menu (320px) and the page.
- **Above 1200px:** three columns: the menu (320px growing to 23rem with the
  window), the page, and a 320px rail holding the table of contents, the graph
  and backlinks. The whole layout stops growing at about 1500px and is centred
  beyond that. The page is as wide as the room beside the window's scrollbar,
  never 100vw, which counts the scrollbar. The front page keeps the rail empty.

The three listing pages and a theme's page have nothing for the rail, so on a
wide screen they take its width: a listing gets a third column of entries, and
a theme's page puts its surah index there.

Inside the page, two things lay themselves out by the room they have and not
by the screen:

- **An index** runs in columns of 18.5rem. Where only one fits (a phone, a
  tablet held upright) its groups start closed.
- **The front page's cards** sit two by two, and stack where two cards of
  17rem do not fit.

Columns are separated by a 5px gap. On a wide screen the page begins 6rem from
the top. A control is 2.5rem tall with a mouse and 2.75rem on a touch screen,
which is the least anything a finger has to hit may be. There is no formal
spacing scale: values are set per component.

## Elevation & Depth

Left undecided by the owner on 2026-10-11, so this is a description and not a
rule. The site is almost flat. Containers are marked by a 1px Parchment Edge
line. One faint shadow exists in the page, on the surah cards
(`0 2px 8px rgba(0, 0, 0, 0.08)`). The feedback button, which floats over the
page, carries its own. Nothing else is lifted.

## Shapes

Corners are rounded at three sizes and nothing is square or fully round:

- **Small (6px):** inline things: a link's fill, a tag chip, a quotation's
  edge, a row in the menu or on a front page card.
- **Medium (10px):** controls and media: buttons, the filter field, the
  arrangement buttons, the search field, the audio player, images.
- **Large (16px):** containers: cards, the properties box, pop-ups.

Borders are always 1px. Around a container the line is Parchment Edge; around
a control it is Faded Ink.

## Components

The owner left the overall feel of controls undecided, so each is described as
it is.

### Index (the three listing pages)

- **Entry:** a row: the name as an Ink Teal link, the name in Urdu or Arabic
  beside it, and the count at the end in Faded Ink Strong. A Name's row begins
  with its number. Details (a description, a path, a meaning, a root) sit under
  the row in Count size when the switch is on.
- **Group:** a Lora heading over a 1px Faded Ink rule, with how many entries
  it holds and a chevron. It opens and closes.
- **Filter field:** outlined in Faded Ink, 10px corners, 2.5rem tall, a
  magnifier at the start and a clear button at the end.
- **Arrangements:** a row of joined buttons in one outline. The selected one
  is filled Ink Teal with Parchment text; hover is Olive Leaf text. Four
  buttons sit two by two on a phone.
- **Details switch:** a checkbox and its label, Entry size.

### Menu

- **Sections:** four names in Lora and Ink Teal, weight 600, each with a
  chevron button. One is open at a time.
- **Entries:** Entry type in Soft Ink: a number where the title has one, the
  name, and an Arabic name at the end. A name that does not fit is cut with an
  ellipsis and never wraps.
- **A surah's ayaat:** a grid of numbers in Count size under the surah's name.
- **The page being read:** weight 600 on an Ink Teal Wash.
- **Phone:** a single 3.5rem bar (menu, logo and name, search, theme), with
  the menu as a drawer under it.

### Front page cards

- **Style:** outlined in Parchment Edge, 16px corners, transparent. A Lora
  title in Ink Teal over a small line of description; then, under a thin line,
  three rows from the section: a name at weight 600 and its count at the other
  end.
- **Behaviour:** the whole card is the link to its section, and each row is a
  link to its entry across its whole width. Hovering the card turns its
  outline Olive Leaf; hovering a row gives the row an Ink Teal Wash.

### A page's own head (a theme, a person, a Name)

- **Style:** the heading, with the Urdu name at the other end of the line on a
  theme's page; a line or two under it at 1.15rem; then the facts as plain
  lines, links in Ink Teal and the lesser parts in Faded Ink Strong. No box.

### Surah index (on a theme's page)

- **Wide screen:** a list in the right-hand column: number, name, count, in
  Label size; the surah being read on an Ink Teal Wash.
- **Narrower:** one select stuck under the top of the screen with a "top" link
  beside it.

### Tag chip

- **Style:** Ink Teal text on Ink Teal Wash, 6px corners, weight 600.
- **Hover:** fills with Olive Leaf, text turns Parchment.

### Step buttons (Next and Prev under the recitation)

- **Style:** outlined, 10px corners, Ink Teal text at weight 600, a chevron on
  the outer side. Next sits left, Prev sits right.
- **Hover:** Olive Leaf.

### Surah cards

- **Style:** a thumbnail over a title, 16px corners, Ink Teal Wash fill, 1px
  line and the page's one shadow. Three across on a wide screen and a tablet,
  two on a phone.

### Properties box (an ayah's page)

- **Style:** outlined, 16px corners, label-size text, one row per field,
  collapsible.

### Search field

- **Style:** outlined, 10px corners, a magnifier and the word Search. It fills
  the menu's column. Opens a full search panel.

### Focus ring and skip link

- **Focus ring:** 2px Olive Leaf, 2px off the thing it is on, on everything
  that takes focus.
- **Skip link:** "Skip to the page", the first Tab stop on every page: Ink Teal
  fill, Parchment text, 10px corners, out of sight until it has focus.

### Signature: the pattern band

A band of keffiyeh pattern across the front page under the heading, drawn as a
mask so it takes the theme's colour.

## Do's and Don'ts

### Do:

- **Do** use Ink Teal for links at rest and Olive Leaf for hover, pressed and
  the focus ring, including on controls a plugin draws.
- **Do** mark the page being read with weight and an Ink Teal Wash, and a
  selected control with an Ink Teal fill.
- **Do** set small secondary text in Faded Ink Strong, and outline a control
  in Faded Ink.
- **Do** mark Arabic and Urdu text with its language so it gets its own face.
- **Do** keep anything a finger must hit at least 2.75rem tall.
- **Do** list things as an index (names in columns, count at the end of the
  row), with a filter and arrangements where the list is long.
- **Do** use `dvh`, never `vh`, for anything that fills a phone screen.

### Don't:

- **Don't** treat these present faults as part of the system. They are
  recorded so they are not copied: hovered text in Olive Leaf is 3.2:1 on the
  dark page; the
  feedback button floats over the page's content; the phone's bar loses the
  site's name when the text size is doubled; tag chips on an ayah's page show a
  theme's key and not its name.
- **Don't** bring back a table with tabs for a list of entries. Three of them
  were replaced by indexes in October 2026, after being 7 to 16 screens long.
- **Don't** read the Elevation and Components sections as rules. The owner
  left both undecided.
- **Don't** treat any of this as binding identity. All of it is open to change
  with the owner's approval.
