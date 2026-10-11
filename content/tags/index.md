---
title: Themes
---
The 139 themes of the Quran, in 13 categories. See them by topic or A–Z, or click a column heading to sort by it. Open a theme for every ayah that carries it.

```base
filters:
  and:
    - file.hasProperty("theme")
properties:
  note.theme:
    displayName: Theme
  note.urdu:
    displayName: Urdu
views:
  - type: table
    name: By Topic
    groupBy:
      property: note.category
      direction: ASC
    order:
      - note.theme
      - note.urdu
      - note.notes
      - note.description
    sort:
      - property: note.order
        direction: ASC
  - type: table
    name: A–Z
    order:
      - note.theme
      - note.urdu
      - note.category
      - note.notes
      - note.description
    sort:
      - property: note.title
        direction: ASC
```

*Notes* is the number of notes that carry a theme: the ayaat, plus any personality or Name of Allah notes that share it.
