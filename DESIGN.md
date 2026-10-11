---
name: Tadabbur
description: A structured Quran knowledge base, recorded as it looks on 2026-10-11
colors:
  parchment: "#f7f3ea"
  parchment-edge: "#e4ddcf"
  faded-ink: "#7f7768"
  soft-ink: "#3b3833"
  black-ink: "#24221e"
  ink-teal: "#2c6461"
  olive-leaf: "#607300"
  ink-teal-wash: "rgba(44, 100, 97, 0.08)"
  gilt-marker: "#f0d58a99"
  night-desk: "#1c1b19"
  night-edge: "#33312c"
  night-faded: "#8a8478"
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
  app-bar: "3.5rem"
components:
  tag-chip:
    backgroundColor: "{colors.ink-teal-wash}"
    textColor: "{colors.ink-teal}"
    rounded: "{rounded.sm}"
    padding: "0 0.6rem"
  tab-active:
    backgroundColor: "{colors.ink-teal}"
    textColor: "{colors.parchment}"
    rounded: "{rounded.md}"
    padding: "0 0.9rem"
  tab-idle:
    backgroundColor: "{colors.parchment}"
    textColor: "{colors.soft-ink}"
    rounded: "{rounded.md}"
    padding: "0 0.9rem"
  button-step:
    backgroundColor: "transparent"
    textColor: "{colors.ink-teal}"
    rounded: "{rounded.md}"
    height: "{spacing.tap-target}"
  card-section:
    backgroundColor: "transparent"
    textColor: "{colors.soft-ink}"
    rounded: "{rounded.lg}"
    padding: "1rem 1.1rem"
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

This file records the site **as it looks on 2026-10-11**. It is a description,
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

**Key Characteristics:**

- Paper and ink, in a light theme and a dark theme with the same roles.
- One colour for links at rest, a second for every hover and selected state.
- Serif type throughout, with dedicated faces for Arabic and Urdu.
- Thin lines, rounded corners, almost no shadow.
- Three columns on a wide screen: menu, page, and a rail of contents and
  backlinks.

## Colors

Warm neutrals for the page and the text, and two greens that never swap roles.

### Primary

- **Ink Teal** (`ink-teal`): every link at rest, the menu's section names,
  breadcrumbs, tag chips, the active tab's fill. In the dark theme its place is
  taken by **Ink Teal Lit** (`ink-teal-lit`).

### Secondary

- **Olive Leaf** (`olive-leaf`): every hover, focus, pressed and selected
  state, on every page, in both themes. The same value in light and dark, by
  choice.

### Neutral

- **Parchment** (`parchment`): the page. Dark theme: **Night Desk**.
- **Parchment Edge** (`parchment-edge`): every line and border. Dark theme:
  **Night Edge**.
- **Faded Ink** (`faded-ink`): secondary text such as counts and "Showing 139
  of 139". Dark theme: **Night Faded**.
- **Soft Ink** (`soft-ink`): body text. Dark theme: **Night Soft**.
- **Black Ink** (`black-ink`): headings, the site title, the Arabic verse.
  Dark theme: **Night Paper**.
- **Ink Teal Wash** (`ink-teal-wash`): the faint fill behind a link, a tag chip
  and a surah card. Dark theme: **Ink Teal Lit Wash**.
- **Gilt Marker** (`gilt-marker`): highlighted text. Dark theme: **Gilt Marker
  Dim**.

### Named Rules

**The Two Greens Rule.** Ink Teal means "this leads somewhere". Olive Leaf
means "you are pointing at this, or you are here". Neither is used for the
other's job, and plugin controls are brought into line with it.

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
- **Label** (400, 0.9rem): table cells, the properties box, the small line on
  a front page card.
- **Arabic** (400, 1.9rem, 2.2): the verse.
- **Urdu** (400, 1.2rem, 2.5): Urdu translation and tafsir.

Menu entries, links and chips are set at weight 600.

### Named Rules

**The Marked Language Rule.** Arabic and Urdu text is tagged with its language
so that it gets its own face, its own line spacing and right-to-left direction.
Latin text never borrows those settings and they never borrow Latin ones.

## Layout

Three ways of laying out the same page, switched by width:

- **Below 800px:** one column. The menu becomes a 3.5rem bar fixed to the top
  with a drawer; the right rail stacks under the page.
- **800px to 1200px:** two columns, the menu and the page.
- **Above 1200px:** three columns: the menu (320px growing to 26.5rem with the
  window), the page, and a 320px rail holding the table of contents, the graph
  and backlinks. The whole layout stops growing at about 1500px and is centred
  beyond that.

Columns are separated by a 5px gap. On a wide screen the page begins 6rem from
the top. Anything a finger has to hit is at least 2.75rem tall. There is no
formal spacing scale: values are set per component.

## Elevation & Depth

Left undecided by the owner on 2026-10-11, so this is a description and not a
rule. The site is almost flat. Containers are marked by a 1px Parchment Edge
line. One faint shadow exists, on the surah cards
(`0 2px 8px rgba(0, 0, 0, 0.08)`). Nothing else is lifted.

## Shapes

Corners are rounded at three sizes and nothing is square or fully round:

- **Small (6px):** inline things: a link's fill, a tag chip, a quotation's edge.
- **Medium (10px):** controls and media: buttons, tabs, the search field, the
  audio player, images, tables.
- **Large (16px):** containers: cards, the properties box, pop-ups.

Borders are always 1px and always Parchment Edge.

## Components

The owner left the overall feel of controls undecided, so each is described as
it is.

### Tag chip

- **Style:** Ink Teal text on Ink Teal Wash, 6px corners, weight 600.
- **Hover:** fills with Olive Leaf, text turns Parchment.

### Tabs (Personalities and Themes tables)

- **Idle:** Parchment fill, 1px Parchment Edge line, 10px corners.
- **Active:** Ink Teal fill, Parchment text.

### Step buttons (Next and Prev under the recitation)

- **Style:** outlined, 10px corners, Ink Teal text at weight 600, a chevron on
  the outer side. Next sits left, Prev sits right.
- **Hover:** Olive Leaf.

### Front page cards

- **Style:** outlined, 16px corners, transparent, padded 1rem by 1.1rem. A
  Lora title in Ink Teal over one small line of description. The whole card is
  the link. Two by two; one column on a phone.

### Surah cards

- **Style:** a thumbnail over a title, 16px corners, Ink Teal Wash fill, 1px
  line and the site's one shadow. Three across on a wide screen and a tablet,
  two on a phone.

### Properties box

- **Style:** outlined, 16px corners, label-size text, one row per field,
  collapsible.

### Search field

- **Style:** outlined, 10px corners, a magnifier and the word Search. Opens a
  full search panel.

### Tables

- **Style:** label-size text, a Lora header row, rows separated by a thin
  line, group headings on a tinted band. Column headings sort when clicked.

### Navigation

- **Menu:** a tree of four sections. Section names in Lora and Ink Teal with a
  chevron; entries beneath in Literata and Black Ink, indented behind a thin
  line. A name that does not fit is cut with an ellipsis and never wraps.
- **Breadcrumbs:** Ink Teal, weight 600, separated by a chevron.
- **Phone:** a single 3.5rem bar: menu, logo and name, search, theme.

### Signature: the pattern band

A band of keffiyeh pattern across the front page under the heading, drawn as a
mask so it takes the theme's colour.

## Do's and Don'ts

### Do:

- **Do** use Ink Teal for links at rest and Olive Leaf for hover, focus,
  pressed and selected, including on controls a plugin draws.
- **Do** mark Arabic and Urdu text with its language so it gets its own face.
- **Do** keep anything a finger must hit at least 2.75rem tall.
- **Do** use `dvh`, never `vh`, for anything that fills a phone screen.

### Don't:

- **Don't** treat these present faults as part of the system. They are
  recorded so they are not copied: the tabs are set in Arial, a plugin default
  that was never overridden; table rows use 2rem line spacing on 0.9rem text;
  the tables sit 16px off their frame; the search field does not fill the
  widened menu column.
- **Don't** read the Elevation and Components sections as rules. The owner
  left both undecided.
- **Don't** treat any of this as binding identity. All of it is open to change
  with the owner's approval.
