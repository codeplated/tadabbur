// The site menu (components/SiteMenu.tsx). The page arrives with the sections
// as links; this fills in the rest from static/menu.json:
//
//   - the list inside the open section (one section is open at a time, and
//     the others stay in reach under it);
//   - for the surah being read, its ayaat as a grid of numbers;
//   - the mark on the page being read, and the list scrolled to it;
//   - on a phone, the drawer the menu button opens.
//
// The file is about 150 KB for the whole site and is fetched once. Nothing is
// built for a section until it is opened.

type Leaf = [string, string]
type Item = { href: string; title: string; leaves?: Leaf[] }
type Section = { slug: string; href: string; title: string; items: Item[] }
type Menu = { sections: Section[] }

const NARROW = "(max-width: 800px)"
const ARABIC = "؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿"
// "2 - The Cow البقرة", "Abu Bakr As-Siddiq — أبو بكر", "Tawheed": an optional
// number, a name, and an optional name in Arabic script at the end.
const NUMBERED = /^(\d+)\s*-\s*(.+)$/
const WITH_ARABIC = new RegExp(`^(.*?)[\\s—-]*([${ARABIC}][^A-Za-z]*)$`)

let menu: Promise<Menu> | undefined
// What the reader last opened, and how far each list was scrolled. The menu is
// redrawn on every page, so these carry it across.
let chosen: string | null = null
const scrolled = new Map<string, number>()

const base = () => document.body.dataset.basepath ?? ""
const trim = (path: string) => path.replace(/\/index$/, "").replace(/\/$/, "")

function load(): Promise<Menu> {
  menu ??= fetch(`${base()}/static/menu.json`).then((response) => response.json() as Promise<Menu>)
  return menu
}

function span(className: string, text: string, lang?: string): HTMLSpanElement {
  const el = document.createElement("span")
  el.className = className
  el.textContent = text
  if (lang) el.lang = lang
  return el
}

function row(item: Item, here: string): HTMLLIElement {
  const li = document.createElement("li")
  const link = document.createElement("a")
  link.className = "sm-item"
  link.href = `${base()}/${item.href}`
  link.dataset.noPopover = "true"

  const numbered = NUMBERED.exec(item.title)
  const rest = numbered ? numbered[2] : item.title
  const split = WITH_ARABIC.exec(rest)
  const name = split && split[1].trim() ? split[1].trim() : rest
  if (numbered) link.append(span("sm-num", numbered[1]), " ")
  link.append(span("sm-name", name))
  if (split && split[1].trim()) link.append(" ", span("sm-ar", split[2].trim(), "ar"))

  const path = trim(item.href)
  const inside = here.startsWith(path + "/")
  if (here === path) link.setAttribute("aria-current", "page")
  if (inside) link.classList.add("sm-trail")
  li.append(link)

  // The surah being read shows its ayaat. One stop for the Tab key, then the
  // arrow keys move through the numbers: 286 stops would bury the page.
  if (item.leaves && (inside || here === path)) {
    const grid = document.createElement("ol")
    grid.className = "sm-grid"
    grid.setAttribute("aria-label", `Ayaat of ${name}`)
    let current: HTMLAnchorElement | undefined
    for (const [label, file] of item.leaves) {
      const cell = document.createElement("li")
      const leaf = document.createElement("a")
      leaf.href = `${base()}/${item.href}${file}`
      leaf.textContent = label
      leaf.tabIndex = -1
      leaf.dataset.noPopover = "true"
      if (here === `${path}/${file}`) {
        leaf.setAttribute("aria-current", "page")
        current = leaf
      }
      cell.append(leaf)
      grid.append(cell)
    }
    const first = current ?? grid.querySelector("a")
    if (first) first.tabIndex = 0
    li.append(grid)
  }
  return li
}

// Left and right step by one, up and down by a row, Home and End to the ends.
function gridKeys(event: KeyboardEvent) {
  const from = event.target as HTMLElement
  const grid = from.closest(".sm-grid")
  if (!grid || !(from instanceof HTMLAnchorElement)) return
  const cells = [...grid.querySelectorAll<HTMLAnchorElement>("a")]
  const at = cells.indexOf(from)
  const top = cells[0].offsetTop
  const perRow = Math.max(
    1,
    cells.findIndex((cell) => cell.offsetTop !== top),
  )
  const step: Record<string, number> = {
    ArrowRight: 1,
    ArrowLeft: -1,
    ArrowDown: perRow,
    ArrowUp: -perRow,
    Home: -at,
    End: cells.length - 1 - at,
  }
  if (!(event.key in step)) return
  const to = cells[Math.min(cells.length - 1, Math.max(0, at + step[event.key]))]
  event.preventDefault()
  from.tabIndex = -1
  to.tabIndex = 0
  to.focus()
}

document.addEventListener("nav", () => {
  const found = document.querySelector<HTMLElement>(".site-menu")
  if (!found) return
  const nav: HTMLElement = found
  const toggle = document.querySelector<HTMLButtonElement>(".sm-toggle")
  const sections = [...nav.querySelectorAll<HTMLElement>(".sm-section")]
  const here = trim(document.body.dataset.slug ?? "")
  const narrow = window.matchMedia(NARROW)

  const listOf = (section: HTMLElement) => section.querySelector<HTMLElement>(".sm-list")!
  const isOpen = () => nav.classList.contains("sm-open")

  // Bring the page being read into view in its list, by moving the list's own
  // scroll: scrollIntoView would move the page as well.
  function settle(section: HTMLElement) {
    const list = listOf(section)
    // The list scrolls by itself, except on a short screen, where the whole
    // menu does (see "Site menu" in custom.scss).
    const scroller = getComputedStyle(list).overflowY === "visible" ? nav : list
    const mark =
      list.querySelector<HTMLElement>(".sm-grid [aria-current]") ??
      list.querySelector<HTMLElement>("[aria-current], .sm-trail")
    const remembered = scrolled.get(section.dataset.section ?? "")
    if (remembered !== undefined) scroller.scrollTop = remembered
    if (!mark) return
    const top =
      mark.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop
    const seen =
      top >= scroller.scrollTop &&
      top + mark.offsetHeight <= scroller.scrollTop + scroller.clientHeight
    if (!seen) scroller.scrollTop = Math.max(0, top - scroller.clientHeight / 3)
  }

  async function show(slug: string | null) {
    for (const section of sections) {
      const on = section.dataset.section === slug
      section.classList.toggle("sm-on", on)
      section.querySelector(".sm-twist")!.setAttribute("aria-expanded", String(on))
      listOf(section).hidden = !on
    }
    const section = sections.find((candidate) => candidate.dataset.section === slug)
    if (!section) return
    const list = listOf(section)
    if (!list.firstChild) {
      const data = (await load()).sections.find((candidate) => candidate.slug === slug)
      if (!data || list.firstChild) return
      const items = document.createElement("ul")
      items.append(...data.items.map((item) => row(item, here)))
      list.append(items)
    }
    settle(section)
  }

  // ── The drawer (narrow screens) ──────────────────────────────────────────
  // Closed, nothing in it can be reached: not by Tab, not by a screen reader.
  const sync = () => nav.toggleAttribute("inert", narrow.matches && !isOpen())

  function setOpen(open: boolean, returnFocus = false) {
    nav.classList.toggle("sm-open", open)
    toggle?.setAttribute("aria-expanded", String(open))
    document.documentElement.classList.toggle("sm-lock", open && narrow.matches)
    sync()
    if (open) {
      const on = sections.find((section) => section.classList.contains("sm-on"))
      if (on) settle(on)
      // Into the drawer, at the page being read if it is listed: the bar's
      // other buttons sit between the menu button and the drawer.
      const mark = nav.querySelector<HTMLElement>(".sm-grid [aria-current], [aria-current]")
      ;(mark ?? nav.querySelector<HTMLElement>(".sm-head a"))?.focus({ preventScroll: true })
    } else if (returnFocus) {
      toggle?.focus()
    }
  }

  const onToggle = () => setOpen(!isOpen())
  const onKey = (event: KeyboardEvent) => {
    if (event.key === "Escape" && isOpen() && narrow.matches) setOpen(false, true)
  }
  const onPanelClick = (event: Event) => {
    const target = event.target as HTMLElement
    const twist = target.closest<HTMLElement>(".sm-twist")
    if (twist) {
      const slug = twist.closest<HTMLElement>(".sm-section")!.dataset.section ?? null
      chosen = twist.getAttribute("aria-expanded") === "true" ? null : slug
      void show(chosen)
      return
    }
    // A link was followed: the page is about to change under the drawer.
    if (target.closest("a") && narrow.matches) setOpen(false)
  }
  const onListScroll = (event: Event) => {
    const scroller = event.target as HTMLElement
    const section =
      scroller === nav
        ? sections.find((candidate) => candidate.classList.contains("sm-on"))
        : scroller.closest?.<HTMLElement>(".sm-section")
    if (section && (scroller === nav || scroller.classList.contains("sm-list"))) {
      scrolled.set(section.dataset.section ?? "", scroller.scrollTop)
    }
  }
  const onResize = () => setOpen(false)

  toggle?.addEventListener("click", onToggle)
  nav.addEventListener("click", onPanelClick)
  nav.addEventListener("keydown", gridKeys)
  nav.addEventListener("scroll", onListScroll, true)
  document.addEventListener("keydown", onKey)
  narrow.addEventListener("change", onResize)
  // All of them come off again. SPA navigation keeps the button and the menu
  // in the page and runs this once more: a second click listener on the same
  // button would open the drawer and shut it in one tap.
  window.addCleanup(() => {
    toggle?.removeEventListener("click", onToggle)
    nav.removeEventListener("click", onPanelClick)
    nav.removeEventListener("keydown", gridKeys)
    nav.removeEventListener("scroll", onListScroll, true)
    document.removeEventListener("keydown", onKey)
    narrow.removeEventListener("change", onResize)
    document.documentElement.classList.remove("sm-lock")
  })

  // The section this page belongs to opens; on a page outside every section
  // (the home page) whatever the reader last opened stays.
  const mine = here.split("/")[0]
  const own = sections.find((section) => section.dataset.section === mine)
  if (own) {
    chosen = mine
    if (here === mine) own.querySelector(".sm-head a")!.setAttribute("aria-current", "page")
  }
  setOpen(false)
  void show(chosen)
})
