// A person's page and a Name's page (`cssclasses: [profile]`): their ayaat as
// a theme's page shows them.
//
// The generator lists the ayaat last, under "Mentioned in Quran" (a person) or
// "Key Ayaat" (a Name): a heading per surah, then each ayah's reference, its
// English and its themes. That much is the page with scripts off. This adds
// what a theme's page has around its ayaat:
//   - on a desktop, a column beside the page that stays in view: the page's
//     sections, then the surahs with how many ayaat each, the one being read
//     marked (it replaces the stock contents, graph and backlinks there);
//   - anywhere narrower, a select of the surahs that stays under the top of
//     the screen while the ayaat are read;
//   - a click anywhere on an ayah opens its page, as on a surah's page.
// surahIndex.ts does the marking and the moving, for theme pages too.

import { followSurahs } from "./surahIndex"

const AYAAT = "h2#mentioned-in-quran, h2#key-ayaat"

const CHEVRON_UP =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 15 6-6 6 6"/></svg>'

// A heading's words without its anchor icon, its number, its Arabic or Urdu, or
// its count, and without what joined them ("Path — Straight Path | …").
function words(heading: HTMLElement): string {
  const copy = heading.cloneNode(true) as HTMLElement
  copy.querySelectorAll('a[role="anchor"], .num, [lang], .count').forEach((part) => part.remove())
  return (
    copy.textContent
      ?.replace(/\s+/g, " ")
      .replace(/[\s|—·]+$/, "")
      .trim() ?? ""
  )
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (text !== undefined) node.textContent = text
  return node
}

document.addEventListener("nav", () => {
  const article = document.querySelector<HTMLElement>("article.profile")
  const body = article?.querySelector<HTMLElement>(":scope > div")
  const heading = body?.querySelector<HTMLElement>(`:scope > :is(${AYAAT})`)
  if (!article || !body || !heading || article.classList.contains("pf-ready")) return

  // ── The ayaat as one section ────────────────────────────────────────────
  // So the select stays stuck only while the ayaat are read.
  const section = el("section", "pf-ayaat")
  section.setAttribute("aria-labelledby", heading.id)
  heading.before(section)
  let node: ChildNode | null = heading
  while (
    node &&
    !(node !== heading && node instanceof HTMLHeadingElement && node.tagName === "H2")
  ) {
    const next: ChildNode | null = node.nextSibling
    section.append(node)
    node = next
  }

  const groups = [...section.querySelectorAll<HTMLElement>(":scope > h3[id]")]
  const surahs = groups.map((group) => ({
    id: group.id,
    num: group.querySelector(".num")?.textContent?.trim() ?? "",
    name: words(group),
    count: group.querySelector(".count")?.firstChild?.textContent?.trim() ?? "",
  }))

  // ── The column beside the page (a desktop) ──────────────────────────────
  const aside = el("aside", "pf-aside")
  aside.setAttribute("aria-label", "On this page")

  const contents = el("nav", "pf-contents")
  contents.setAttribute("aria-label", "Sections")
  contents.append(el("div", "pf-rail-head", "On this page"))
  const sections = el("ul", "")
  for (const h2 of body.querySelectorAll<HTMLElement>("h2[id]")) {
    const link = el("a", "", words(h2))
    link.href = `#${h2.id}`
    if (h2.lang) link.lang = h2.lang
    const item = el("li", "")
    item.append(link)
    sections.append(item)
  }
  contents.append(sections)
  aside.append(contents)

  let rail: HTMLElement | null = null
  let bar: HTMLElement | null = null
  let select: HTMLSelectElement | null = null
  if (groups.length > 1) {
    rail = el("nav", "tt-jump")
    rail.setAttribute("aria-label", "Surahs on this page")
    const head = el("div", "tt-jump-head")
    head.append(el("span", "", "Surahs"))
    const top = el("a", "tt-top", "Top")
    top.href = `#${heading.id}`
    head.append(top)
    const list = el("ul", "")
    for (const surah of surahs) {
      const link = el("a", "")
      link.href = `#${surah.id}`
      link.append(
        el("span", "tt-jump-num", surah.num),
        el("span", "tt-jump-name", surah.name),
        el("span", "tt-count", surah.count),
      )
      const item = el("li", "")
      item.append(link)
      list.append(item)
    }
    rail.append(head, list)
    aside.append(rail)

    // ── The select (anywhere narrower) ────────────────────────────────────
    bar = el("div", "tt-bar")
    const wrap = el("span", "tt-select-wrap")
    select = el("select", "tt-select")
    select.setAttribute("aria-label", "Jump to surah")
    for (const surah of surahs) {
      const option = el("option", "", `${surah.num}. ${surah.name} (${surah.count})`)
      option.value = surah.id
      select.append(option)
    }
    wrap.append(select)
    const up = el("a", "tt-top")
    up.href = `#${heading.id}`
    up.setAttribute("aria-label", "Back to the first surah")
    up.innerHTML = CHEVRON_UP
    bar.append(wrap, up)
    heading.after(bar)
  }

  // The page goes into one block beside the column, so its spacing is what it
  // was. The column comes first: the keyboard reaches a surah in a few steps,
  // not after every ayah and theme on the page.
  const main = el("div", "pf-main")
  main.append(...body.childNodes)
  body.append(aside, main)

  // ── Every ayah opens its own page ───────────────────────────────────────
  // A click on a link inside it (a theme) goes where that link goes, and a
  // click that ends a selection is a reader copying the text.
  for (const number of section.querySelectorAll<HTMLAnchorElement>(
    ":scope > ul > li > a:first-child",
  )) {
    number.setAttribute("aria-label", `Ayah ${number.textContent}: tafsir and recitation`)
  }
  const onAyah = (event: MouseEvent) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return
    const target = event.target as HTMLElement
    if (target.closest("a, button, select")) return
    const ayah = target.closest("li")
    if (!ayah || ayah.parentElement?.parentElement !== section) return
    if (String(window.getSelection() ?? "").trim()) return
    ayah.querySelector<HTMLAnchorElement>(":scope > a")?.click()
  }
  section.addEventListener("click", onAyah)
  window.addCleanup(() => section.removeEventListener("click", onAyah))

  article.classList.add("pf-ready")
  if (groups.length > 1) followSurahs({ root: article, groups, rail, bar, select, top: heading })

  // A link to a surah or a section was followed before the page was laid out
  // in two columns, which moved it; go to it again.
  const target = location.hash
    ? document.getElementById(decodeURIComponent(location.hash.slice(1)))
    : null
  if (target && body.contains(target)) target.scrollIntoView({ behavior: "instant" })
})
