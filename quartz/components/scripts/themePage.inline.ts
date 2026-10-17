// A theme's page (/tags/<key>): where am I, and how do I get elsewhere.
//
// A busy theme runs to hundreds of ayaat across dozens of surahs. The page
// carries its surah index twice (see the tag-page patch): a list beside the
// ayaat where there is a column for it, and a select that stays under the top
// of the screen where there is not. surahIndex.ts marks the surah being read
// in both, keeps the list scrolled to it, and makes the select and the "top"
// links move the page.
//
// Without it the list is still a list of working links.

import { followSurahs } from "./surahIndex"

document.addEventListener("nav", () => {
  const page = document.querySelector<HTMLElement>(".tt-tag-page")
  if (!page) return
  const groups = [...page.querySelectorAll<HTMLElement>(".tt-groups > .tt-group[id]")]
  if (groups.length < 2) return

  followSurahs({
    root: page,
    groups,
    rail: page.querySelector<HTMLElement>(".tt-jump"),
    bar: page.querySelector<HTMLElement>(".tt-bar"),
    select: page.querySelector<HTMLSelectElement>(".tt-select"),
  })
})
