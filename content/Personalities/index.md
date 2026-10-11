---
title: Personalities
---
The 79 prophets, angels, companions, groups and other figures the Quran speaks about. Choose a path to narrow the list, or click a column heading to sort by it.

```base
filters:
  and:
    - file.hasProperty("path")
    - file.hasProperty("era")
views:
  - type: table
    name: All
    groupBy:
      property: note.type
      direction: ASC
    order:
      - file.name
      - note.path
      - note.era
    sort:
      - property: note.order
        direction: ASC
  - type: table
    name: Straight Path
    filters:
      and:
        - note.path == "Straight Path"
    order:
      - file.name
      - note.type
      - note.era
    sort:
      - property: note.order
        direction: ASC
  - type: table
    name: Mixed Path
    filters:
      and:
        - note.path == "Mixed — Erred, Repented, or Complex"
    order:
      - file.name
      - note.type
      - note.era
    sort:
      - property: note.order
        direction: ASC
  - type: table
    name: Deviated Path
    filters:
      and:
        - note.path == "Deviated Path"
    order:
      - file.name
      - note.type
      - note.era
    sort:
      - property: note.order
        direction: ASC
```

**Mixed Path.** These figures fit cleanly into neither the straight path nor the deviated one. Their stories show the complexity of moral life and the power of repentance.

**Deviated Path.** Understanding why they deviated is as important as understanding why the righteous succeeded. The Quran presents them as warnings, not as targets for hatred.
