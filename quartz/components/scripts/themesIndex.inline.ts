// The Themes page (/tags). The generator writes every theme as a line in a
// plain list under its category's heading: a link, the Urdu name, the ayah
// count and a description. This script reads those lines and adds what a list
// cannot do alone: a filter, three arrangements (by topic, A to Z, most
// ayaat), descriptions on request, and categories that start closed where
// there is room for one column only, so a phone shows 13 headings, not 139
// rows. Without it the page is still the full list.
//
// The same <li> the generator wrote is moved between groups, never rebuilt,
// so its link keeps working as every other link on the site does.

type Theme = {
  li: HTMLLIElement
  name: string
  category: string
  count: number
  haystack: string
}

type State = { view: string; about: string; q: string }

const DEFAULTS: State = { view: "topic", about: "", q: "" }
const VIEWS: [string, string][] = [
  ["topic", "By Topic"],
  ["az", "A–Z"],
  ["most", "Most Ayaat"],
]
// At or under this width the index has one column.
const ONE_COLUMN = 600
const OPEN_KEY = "themes-index-open"

const ICON = {
  filter:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M7 12h10M10 18h4"/></svg>',
  clear:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  chevron:
    '<svg class="ti-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>',
}

// Lower-case, without Latin accents or Arabic vowel marks: "sabr" finds
// "Sabr", and an Urdu word typed without its marks still matches.
const fold = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ًͯ-ٰٟ]/g, "")

const byName = (a: Theme, b: Theme) => fold(a.name).localeCompare(fold(b.name), "en")

function readState(): State {
  const params = new URLSearchParams(location.search)
  const state = { ...DEFAULTS }
  for (const key of Object.keys(DEFAULTS) as (keyof State)[]) {
    const value = params.get(key)
    if (value !== null) state[key] = value
  }
  if (!VIEWS.some(([view]) => view === state.view)) state.view = DEFAULTS.view
  return state
}

// The arrangement and the filter live in the address, so coming back from a
// theme returns to the list as it was left, and a link to it can be shared.
function writeState(state: State) {
  const params = new URLSearchParams(location.search)
  for (const key of Object.keys(DEFAULTS) as (keyof State)[]) {
    if (state[key] === DEFAULTS[key]) params.delete(key)
    else params.set(key, state[key])
  }
  const query = params.toString()
  history.replaceState(
    history.state,
    "",
    location.pathname + (query ? "?" + query : "") + location.hash,
  )
}

// Which categories a reader opened, for this tab's lifetime. Private browsing
// can refuse storage; the page then simply forgets.
function readOpen(): Set<string> {
  try {
    return new Set(JSON.parse(sessionStorage.getItem(OPEN_KEY) ?? "[]") as string[])
  } catch {
    return new Set()
  }
}
function writeOpen(open: Set<string>) {
  try {
    sessionStorage.setItem(OPEN_KEY, JSON.stringify([...open]))
  } catch {
    // Nothing to do: the choice lasts until the page is left.
  }
}

function readThemes(host: Element): { themes: Theme[]; headings: Map<string, string> } {
  const themes: Theme[] = []
  const headings = new Map<string, string>()

  for (const heading of host.querySelectorAll<HTMLHeadingElement>(":scope > h2")) {
    const list = heading.nextElementSibling
    if (!(list instanceof HTMLUListElement)) continue
    const category = (heading.textContent ?? "").trim()
    headings.set(category, heading.id)

    for (const li of list.querySelectorAll<HTMLLIElement>(":scope > li")) {
      const link = li.querySelector<HTMLAnchorElement>(":scope > a")
      if (!link) continue
      const name = (link.textContent ?? "").trim()
      const urdu = li.querySelector(":scope > [lang]")?.textContent ?? ""
      const about = li.querySelector(":scope > small")?.textContent ?? ""
      const count = parseInt(li.querySelector(":scope > .count")?.textContent ?? "0", 10) || 0
      themes.push({
        li,
        name,
        category,
        count,
        haystack: fold([name, urdu, about, category].join(" ")),
      })
    }
    list.remove()
    heading.remove()
  }

  return { themes, headings }
}

function setup(article: HTMLElement) {
  // The headings and lists sit in a wrapper inside the article, not in the
  // article itself; whatever holds the first heading holds them all.
  const firstHeading = article.querySelector("h2")
  const host = firstHeading?.parentElement
  if (!firstHeading || !host) return

  const toolbar = document.createElement("div")
  toolbar.className = "ti-toolbar"
  toolbar.innerHTML =
    `<div class="ti-filter">${ICON.filter}` +
    `<input type="search" placeholder="Filter by name, Urdu or description" aria-label="Filter themes" autocomplete="off" spellcheck="false" />` +
    `<button type="button" class="ti-clear" aria-label="Clear the filter" hidden>${ICON.clear}</button></div>` +
    `<div class="ti-views" role="group" aria-label="Arrange">` +
    VIEWS.map(
      ([view, label]) => `<button type="button" data-view="${view}">${label}</button>`,
    ).join("") +
    `</div>` +
    `<label class="ti-check"><input type="checkbox" /> Descriptions</label>` +
    `<p class="ti-status" role="status"></p>`

  const index = document.createElement("div")
  index.className = "ti-index"

  const empty = document.createElement("p")
  empty.className = "ti-empty"
  empty.hidden = true
  empty.innerHTML =
    `<strong>No theme matches “<span></span>”.</strong> Try another word, in English or Urdu, or ` +
    `<button type="button" class="ti-link">clear the filter</button>.`

  firstHeading.before(toolbar, index, empty)
  const { themes, headings } = readThemes(host)
  const categories = [...headings.keys()]

  const input = toolbar.querySelector<HTMLInputElement>("input[type=search]")!
  const clear = toolbar.querySelector<HTMLButtonElement>(".ti-clear")!
  const about = toolbar.querySelector<HTMLInputElement>("input[type=checkbox]")!
  const status = toolbar.querySelector<HTMLElement>(".ti-status")!
  const viewButtons = [...toolbar.querySelectorAll<HTMLButtonElement>("[data-view]")]

  const state = readState()
  const opened = readOpen()
  const isOneColumn = () => index.clientWidth <= ONE_COLUMN
  let oneColumn = isOneColumn()

  function group(title: string, items: Theme[], open: boolean, ranked = false): HTMLDetailsElement {
    const details = document.createElement("details")
    details.className = "ti-group"
    details.open = open
    details.dataset.group = `${state.view}:${title}`

    const summary = document.createElement("summary")
    const heading = document.createElement("h2")
    heading.textContent = title
    const id = state.view === "topic" ? headings.get(title) : undefined
    if (id) heading.id = id
    const count = document.createElement("span")
    count.className = "ti-n"
    count.textContent = String(items.length)
    summary.append(heading, count)
    summary.insertAdjacentHTML("beforeend", ICON.chevron)

    const list = document.createElement(ranked ? "ol" : "ul")
    list.append(...items.map((theme) => theme.li))
    details.append(summary, list)
    return details
  }

  function render() {
    const words = fold(state.q.trim()).split(/\s+/).filter(Boolean)
    const filtering = words.length > 0
    const hits = themes.filter((theme) => words.every((word) => theme.haystack.includes(word)))
    oneColumn = isOneColumn()

    // With room for columns everything is open. In one column a category is
    // open only if the reader opened it; a filter opens whatever it finds.
    const open = (title: string) => filtering || !oneColumn || opened.has(`${state.view}:${title}`)
    const groups: HTMLDetailsElement[] = []

    if (state.view === "topic") {
      for (const category of categories) {
        const items = hits.filter((theme) => theme.category === category)
        if (items.length) groups.push(group(category, items, open(category)))
      }
    } else if (state.view === "az") {
      const letters = new Map<string, Theme[]>()
      for (const theme of [...hits].sort(byName)) {
        const letter = fold(theme.name).charAt(0).toUpperCase()
        letters.set(letter, [...(letters.get(letter) ?? []), theme])
      }
      for (const [letter, items] of letters) groups.push(group(letter, items, open(letter)))
    } else if (hits.length) {
      const ranked = [...hits].sort((a, b) => b.count - a.count || byName(a, b))
      groups.push(group("Most ayaat", ranked, true, true))
    }

    index.replaceChildren(...groups)
    index.classList.toggle("ti-ranked", state.view === "most")
    index.classList.toggle("ti-one-column", oneColumn)
    // A filter shows each match's description, so it is clear why it matched.
    index.classList.toggle("ti-with-about", state.about === "1" || filtering)

    status.textContent = filtering
      ? `${hits.length} of ${themes.length} themes`
      : `${themes.length} themes`
    empty.hidden = hits.length > 0
    empty.querySelector("span")!.textContent = state.q.trim()
    clear.hidden = state.q === ""
    about.checked = state.about === "1"
    for (const button of viewButtons) {
      button.setAttribute("aria-pressed", String(button.dataset.view === state.view))
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
    state.view = button.dataset.view ?? DEFAULTS.view
    render()
  }
  const onAbout = () => {
    state.about = about.checked ? "1" : ""
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

  // A link straight to a category opens it.
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
  const article = document.querySelector<HTMLElement>("article.themes-index")
  if (article && !article.classList.contains("ti-ready")) setup(article)
})
