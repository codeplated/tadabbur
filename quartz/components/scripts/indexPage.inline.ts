// The listing pages: Themes (/tags), Personalities and Asma Ul Husna. The
// generator writes each entry as a line in a plain list under a heading: a
// link, the name in Arabic or Urdu, a count and some details. This script
// reads those lines and adds what a list cannot do alone: a filter, several
// arrangements, details on request, and groups that start closed where there
// is room for one column only, so a phone shows a dozen headings, not a
// hundred rows. Without it the page is still the full list.
//
// The same <li> the generator wrote is moved between groups, never rebuilt,
// so its link keeps working as every other link on the site does.
//
// Class names begin `ti-` because the Themes index was the first of the three.

// How one arrangement groups the entries:
//   heading  the groups the generator wrote, in its order
//   letter   by first letter of the name
//   count    one list, largest count first
//   number   one list, by the number each line begins with
//   .path    (any selector) by the text of that element in the line, in the
//            order its data-rank gives
type View = { key: string; label: string; by: string }

type Page = {
  views: View[]
  // The checkbox that shows each line's <small>, and whether it starts ticked.
  details: string
  detailsOn: boolean
  hint: string
  // One of them, several of them: "1 of 139 themes", "No theme matches".
  noun: [string, string]
}

const AZ: View = { key: "az", label: "A–Z", by: "letter" }

// Keyed by the class the generator gives the page beside `index-page`.
const PAGES: Record<string, Page> = {
  "themes-index": {
    views: [
      { key: "topic", label: "By Topic", by: "heading" },
      AZ,
      { key: "most", label: "Most Ayaat", by: "count" },
    ],
    details: "Descriptions",
    detailsOn: false,
    hint: "Filter by name, Urdu or description",
    noun: ["theme", "themes"],
  },
  "people-index": {
    views: [
      { key: "type", label: "By Type", by: "heading" },
      { key: "path", label: "By Path", by: ".path" },
      AZ,
      { key: "most", label: "Most Ayaat", by: "count" },
    ],
    details: "Details",
    detailsOn: false,
    hint: "Filter by name, Urdu or era",
    noun: ["personality", "personalities"],
  },
  // A Name's meaning is in its details, so they start shown.
  "names-index": {
    views: [
      { key: "meaning", label: "By Meaning", by: "heading" },
      { key: "order", label: "1–99", by: "number" },
      AZ,
      { key: "most", label: "Most in Quran", by: "count" },
    ],
    details: "Details",
    detailsOn: true,
    hint: "Filter by name, meaning or root",
    noun: ["Name", "Names"],
  },
}

type Entry = {
  li: HTMLLIElement
  name: string
  group: string
  count: number
  number: number
  haystack: string
}

type State = { view: string; about: string; q: string }

// At or under this width the index has one column.
const ONE_COLUMN = 600

const ICON = {
  filter:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M7 12h10M10 18h4"/></svg>',
  clear:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  chevron:
    '<svg class="ti-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>',
}

// Lower-case, without Latin accents, Arabic vowel marks or the stretch between
// letters (ـ), and with the alef a Name is written with (ٱ) as a plain one:
// "sabr" finds "Sabr", and an Arabic or Urdu word typed without its marks
// still matches. The marks are written as escapes: typed as characters, an
// editor may reorder two that sit together, which silently widens a range.
const fold = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f\u064b-\u065f\u0670\u0640]/g, "")
    .replace(/\u0671/g, "\u0627")

// What a name is filed under: itself without the Arabic article, so Al-Hayy is
// under H and Ar-Rahman under R. Filed by their first letter, 97 of the 99
// Names would be under A.
const filed = (name: string) => fold(name).replace(/^a[a-z]{1,2}-/, "")

const byName = (a: Entry, b: Entry) => filed(a.name).localeCompare(filed(b.name), "en")

// "2,699 times" is 2699.
const digits = (text: string | null | undefined) =>
  parseInt((text ?? "").replace(/[^\d]/g, ""), 10) || 0

function readEntries(host: Element): { entries: Entry[]; headings: Map<string, string> } {
  const entries: Entry[] = []
  const headings = new Map<string, string>()

  for (const heading of host.querySelectorAll<HTMLHeadingElement>(":scope > h2")) {
    const list = heading.nextElementSibling
    if (!(list instanceof HTMLUListElement)) continue
    const group = (heading.textContent ?? "").trim()
    headings.set(group, heading.id)

    for (const li of list.querySelectorAll<HTMLLIElement>(":scope > li")) {
      const link = li.querySelector<HTMLAnchorElement>(":scope > a")
      if (!link) continue
      const name = (link.textContent ?? "").trim()
      const other = [...li.querySelectorAll("[lang]")].map((el) => el.textContent ?? "").join(" ")
      const about = li.querySelector(":scope > small")?.textContent ?? ""
      const text = fold([name, other, about, group].join(" "))
      entries.push({
        li,
        name,
        group,
        count: digits(li.querySelector(":scope > .count")?.textContent),
        number: digits(li.querySelector(":scope > .num")?.textContent),
        // A root is written ح-ي-و; typed without the hyphens it still matches.
        haystack: text + " " + text.replace(/-/g, ""),
      })
    }
    list.remove()
    heading.remove()
  }

  return { entries, headings }
}

function setup(article: HTMLElement, page: Page, pageKey: string) {
  // The headings and lists sit in a wrapper inside the article, not in the
  // article itself; whatever holds the first heading holds them all.
  const firstHeading = article.querySelector("h2")
  const host = firstHeading?.parentElement
  if (!firstHeading || !host) return

  const defaults: State = { view: page.views[0].key, about: page.detailsOn ? "1" : "0", q: "" }
  const openKey = `index-open:${pageKey}`

  function readState(): State {
    const params = new URLSearchParams(location.search)
    const state = { ...defaults }
    for (const key of Object.keys(defaults) as (keyof State)[]) {
      const value = params.get(key)
      if (value !== null) state[key] = value
    }
    if (!page.views.some((view) => view.key === state.view)) state.view = defaults.view
    return state
  }

  // The arrangement and the filter live in the address, so coming back from an
  // entry returns to the list as it was left, and a link to it can be shared.
  function writeState(state: State) {
    const params = new URLSearchParams(location.search)
    for (const key of Object.keys(defaults) as (keyof State)[]) {
      if (state[key] === defaults[key]) params.delete(key)
      else params.set(key, state[key])
    }
    const query = params.toString()
    history.replaceState(
      history.state,
      "",
      location.pathname + (query ? "?" + query : "") + location.hash,
    )
  }

  // Which groups a reader opened, for this tab's lifetime. Private browsing
  // can refuse storage; the page then simply forgets.
  function readOpen(): Set<string> {
    try {
      return new Set(JSON.parse(sessionStorage.getItem(openKey) ?? "[]") as string[])
    } catch {
      return new Set()
    }
  }
  function writeOpen(open: Set<string>) {
    try {
      sessionStorage.setItem(openKey, JSON.stringify([...open]))
    } catch {
      // Nothing to do: the choice lasts until the page is left.
    }
  }

  const toolbar = document.createElement("div")
  toolbar.className = "ti-toolbar"
  toolbar.innerHTML =
    `<div class="ti-filter">${ICON.filter}` +
    `<input type="search" placeholder="${page.hint}" aria-label="Filter ${page.noun[1]}" autocomplete="off" spellcheck="false" />` +
    `<button type="button" class="ti-clear" aria-label="Clear the filter" hidden>${ICON.clear}</button></div>` +
    `<div class="ti-views" role="group" aria-label="Arrange">` +
    page.views
      .map((view) => `<button type="button" data-view="${view.key}">${view.label}</button>`)
      .join("") +
    `</div>` +
    `<label class="ti-check"><input type="checkbox" /> ${page.details}</label>` +
    `<p class="ti-status" role="status"></p>`

  const index = document.createElement("div")
  index.className = "ti-index"

  const empty = document.createElement("p")
  empty.className = "ti-empty"
  empty.hidden = true
  empty.innerHTML =
    `<strong>No ${page.noun[0]} matches “<span></span>”.</strong> Try another word, in English or Urdu, or ` +
    `<button type="button" class="ti-link">clear the filter</button>.`

  firstHeading.before(toolbar, index, empty)
  const { entries, headings } = readEntries(host)

  const input = toolbar.querySelector<HTMLInputElement>("input[type=search]")!
  const clear = toolbar.querySelector<HTMLButtonElement>(".ti-clear")!
  const about = toolbar.querySelector<HTMLInputElement>("input[type=checkbox]")!
  const status = toolbar.querySelector<HTMLElement>(".ti-status")!
  const viewButtons = [...toolbar.querySelectorAll<HTMLButtonElement>("[data-view]")]

  const state = readState()
  const opened = readOpen()
  const isOneColumn = () => index.clientWidth <= ONE_COLUMN
  let oneColumn = isOneColumn()

  function group(
    view: View,
    title: string,
    items: Entry[],
    open: boolean,
    ranked = false,
  ): HTMLDetailsElement {
    const details = document.createElement("details")
    details.className = "ti-group"
    details.open = open
    details.dataset.group = `${view.key}:${title}`

    const summary = document.createElement("summary")
    const heading = document.createElement("h2")
    heading.textContent = title
    const id = view.by === "heading" ? headings.get(title) : undefined
    if (id) heading.id = id
    const count = document.createElement("span")
    count.className = "ti-n"
    count.textContent = String(items.length)
    summary.append(heading, count)
    summary.insertAdjacentHTML("beforeend", ICON.chevron)

    const list = document.createElement(ranked ? "ol" : "ul")
    list.append(...items.map((entry) => entry.li))
    details.append(summary, list)
    return details
  }

  // Entries under the text of one element of their line, in the order that
  // element's data-rank gives; a line without it goes last.
  function byFacet(hits: Entry[], selector: string): Map<string, Entry[]> {
    const found = new Map<string, { rank: number; items: Entry[] }>()
    for (const entry of hits) {
      const facet = entry.li.querySelector<HTMLElement>(selector)
      const title = (facet?.textContent ?? "").trim() || "Other"
      const rank = Number(facet?.dataset.rank) || Infinity
      const slot = found.get(title) ?? { rank, items: [] }
      slot.items.push(entry)
      found.set(title, slot)
    }
    return new Map(
      [...found].sort((a, b) => a[1].rank - b[1].rank).map(([title, slot]) => [title, slot.items]),
    )
  }

  function render() {
    const view = page.views.find((candidate) => candidate.key === state.view) ?? page.views[0]
    const words = fold(state.q.trim()).split(/\s+/).filter(Boolean)
    const filtering = words.length > 0
    const hits = entries.filter((entry) => words.every((word) => entry.haystack.includes(word)))
    oneColumn = isOneColumn()

    // With room for columns everything is open. In one column a group is open
    // only if the reader opened it; a filter opens whatever it finds.
    const open = (title: string) => filtering || !oneColumn || opened.has(`${view.key}:${title}`)
    const groups: HTMLDetailsElement[] = []
    const single = view.by === "count" || view.by === "number"

    if (view.by === "heading") {
      for (const title of headings.keys()) {
        const items = hits.filter((entry) => entry.group === title)
        if (items.length) groups.push(group(view, title, items, open(title)))
      }
    } else if (view.by === "letter") {
      const letters = new Map<string, Entry[]>()
      for (const entry of [...hits].sort(byName)) {
        const letter = filed(entry.name).charAt(0).toUpperCase()
        letters.set(letter, [...(letters.get(letter) ?? []), entry])
      }
      for (const [letter, items] of letters) groups.push(group(view, letter, items, open(letter)))
    } else if (single) {
      const sorted =
        view.by === "count"
          ? [...hits].sort((a, b) => b.count - a.count || byName(a, b))
          : [...hits].sort((a, b) => a.number - b.number)
      if (sorted.length) groups.push(group(view, view.label, sorted, true, true))
    } else {
      for (const [title, items] of byFacet(hits, view.by)) {
        groups.push(group(view, title, items, open(title)))
      }
    }

    index.replaceChildren(...groups)
    index.classList.toggle("ti-ranked", single)
    index.classList.toggle("ti-one-column", oneColumn)
    // A filter shows each match's details, so it is clear why it matched.
    index.classList.toggle("ti-with-about", state.about === "1" || filtering)

    status.textContent = filtering
      ? `${hits.length} of ${entries.length} ${page.noun[1]}`
      : `${entries.length} ${page.noun[1]}`
    empty.hidden = hits.length > 0
    empty.querySelector("span")!.textContent = state.q.trim()
    clear.hidden = state.q === ""
    about.checked = state.about === "1"
    for (const button of viewButtons) {
      button.setAttribute("aria-pressed", String(button.dataset.view === view.key))
    }
    writeState(state)
  }

  const reset = () => {
    state.q = input.value = ""
    render()
    input.focus()
  }

  const onInput = () => {
    state.q = input.value
    render()
  }
  const onView = (event: Event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-view]")
    if (!button) return
    state.view = button.dataset.view ?? defaults.view
    render()
  }
  const onAbout = () => {
    state.about = about.checked ? "1" : "0"
    render()
  }
  // `toggle` does not bubble, so it is caught on the way down.
  const onToggle = (event: Event) => {
    const details = event.target as HTMLDetailsElement
    if (!details.dataset?.group || !oneColumn || state.q.trim()) return
    if (details.open) opened.add(details.dataset.group)
    else opened.delete(details.dataset.group)
    writeOpen(opened)
  }

  input.addEventListener("input", onInput)
  toolbar.querySelector(".ti-views")!.addEventListener("click", onView)
  about.addEventListener("change", onAbout)
  clear.addEventListener("click", reset)
  empty.querySelector("button")!.addEventListener("click", reset)
  index.addEventListener("toggle", onToggle, true)

  // Turning a phone, or resizing a window, can change between one column and
  // several; only that change redraws.
  const observer = new ResizeObserver(() => {
    if (isOneColumn() !== oneColumn) render()
  })
  observer.observe(index)
  window.addCleanup(() => observer.disconnect())

  input.value = state.q
  render()

  // A link straight to a group opens it: a theme's page links its category,
  // a person's page its type, a Name's page its category.
  const target = location.hash
    ? document.getElementById(decodeURIComponent(location.hash.slice(1)))
    : null
  const targetGroup = target?.closest("details")
  if (target && targetGroup && index.contains(targetGroup)) {
    targetGroup.open = true
    target.scrollIntoView()
  }

  article.classList.add("ti-ready")
}

document.addEventListener("nav", () => {
  const article = document.querySelector<HTMLElement>("article.index-page")
  if (!article || article.classList.contains("ti-ready")) return
  const pageKey = Object.keys(PAGES).find((key) => article.classList.contains(key))
  if (pageKey) setup(article, PAGES[pageKey], pageKey)
})
