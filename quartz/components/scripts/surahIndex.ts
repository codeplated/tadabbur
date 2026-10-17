// The surah index beside a list of ayaat grouped by surah: a theme's page, a
// person's page and a Name's page. The index is there twice: a list beside the
// ayaat where there is a column for it (`rail`), and a select that stays under
// the top of the screen where there is not (`bar`, holding `select`). This
// marks the surah being read in both, keeps the list scrolled to it, and makes
// the select and the "top" links move the page.
//
// Each group is an element with an id (a surah's section or its heading); the
// list's links point at those ids and the select's values are them.

export type SurahIndex = {
  root: HTMLElement
  groups: HTMLElement[]
  rail: HTMLElement | null
  bar: HTMLElement | null
  select: HTMLSelectElement | null
  // Where "top" goes: this element, or the top of the page.
  top?: HTMLElement
}

export function followSurahs({ root, groups, rail, bar, select, top }: SurahIndex) {
  const links = new Map<string, HTMLAnchorElement>()
  for (const link of rail?.querySelectorAll<HTMLAnchorElement>("li > a") ?? []) {
    links.set(decodeURIComponent(link.hash.slice(1)), link)
  }

  let current: string | null = null
  let queued = false

  // The surah being read is the last one whose heading has passed the line
  // just under whatever is stuck to the top of the screen.
  function mark() {
    queued = false
    const barShown = bar !== null && bar.offsetParent !== null
    const line = (barShown ? bar.getBoundingClientRect().bottom : 0) + 32
    let id = ""
    for (const group of groups) {
      if (group.getBoundingClientRect().top > line) break
      id = group.id
    }
    if (id === current) return

    if (current) links.get(current)?.removeAttribute("aria-current")
    current = id
    const link = links.get(id)
    link?.setAttribute("aria-current", "location")
    if (select) select.value = id || groups[0].id

    // Back above the first surah, the list goes back to its start.
    if (rail && !link) rail.scrollTop = 0

    // Keep the marked surah in view in the list. The list's own scroll is
    // moved, not scrollIntoView, which would also move the page.
    if (rail && link && rail.scrollHeight > rail.clientHeight) {
      const top = link.getBoundingClientRect().top - rail.getBoundingClientRect().top
      const room = rail.clientHeight
      if (top < 48 || top > room - 80) {
        rail.scrollTop = Math.max(0, rail.scrollTop + top - room / 3)
      }
    }
  }

  const onScroll = () => {
    if (queued) return
    queued = true
    requestAnimationFrame(mark)
  }

  const onSelect = () => {
    if (!select) return
    const target = document.getElementById(select.value)
    if (!target) return
    target.scrollIntoView()
    history.replaceState(history.state, "", "#" + select.value)
  }

  const onTop = (event: Event) => {
    if (!(event.target as HTMLElement).closest(".tt-top")) return
    event.preventDefault()
    if (top) top.scrollIntoView()
    else window.scrollTo({ top: 0 })
    history.replaceState(history.state, "", location.pathname + location.search)
  }

  window.addEventListener("scroll", onScroll, { passive: true })
  window.addEventListener("resize", onScroll)
  select?.addEventListener("change", onSelect)
  root.addEventListener("click", onTop)
  window.addCleanup(() => {
    window.removeEventListener("scroll", onScroll)
    window.removeEventListener("resize", onScroll)
    select?.removeEventListener("change", onSelect)
    root.removeEventListener("click", onTop)
  })

  mark()
}
