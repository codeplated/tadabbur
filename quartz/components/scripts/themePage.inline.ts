// A theme's page (/tags/<key>): where am I, and how do I get elsewhere.
//
// A busy theme runs to hundreds of ayaat across dozens of surahs. The page
// carries its surah index twice (see the tag-page patch): a list beside the
// ayaat where there is a column for it, and a select that stays under the top
// of the screen where there is not. This marks the surah being read in both,
// keeps the list scrolled to it, and makes the select and the "top" links
// move the page.
//
// Without it the list is still a list of working links.

document.addEventListener("nav", () => {
  const page = document.querySelector<HTMLElement>(".tt-tag-page")
  if (!page) return
  const groups = [...page.querySelectorAll<HTMLElement>(".tt-groups > .tt-group[id]")]
  if (groups.length < 2) return

  const rail = page.querySelector<HTMLElement>(".tt-jump")
  const bar = page.querySelector<HTMLElement>(".tt-bar")
  const select = page.querySelector<HTMLSelectElement>(".tt-select")
  const links = new Map<string, HTMLAnchorElement>()
  for (const link of page.querySelectorAll<HTMLAnchorElement>(".tt-jump li > a")) {
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
      // The list is the link's offset parent wherever it scrolls (it is sticky).
      const top = link.offsetTop
      const room = rail.clientHeight
      if (top < rail.scrollTop + 48 || top > rail.scrollTop + room - 80) {
        rail.scrollTop = Math.max(0, top - room / 3)
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
    window.scrollTo({ top: 0 })
    history.replaceState(history.state, "", location.pathname + location.search)
  }

  window.addEventListener("scroll", onScroll, { passive: true })
  window.addEventListener("resize", onScroll)
  select?.addEventListener("change", onSelect)
  page.addEventListener("click", onTop)
  window.addCleanup(() => {
    window.removeEventListener("scroll", onScroll)
    window.removeEventListener("resize", onScroll)
  })

  mark()
})
