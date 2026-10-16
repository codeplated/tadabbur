// A surah's page: the whole surah, ayah by ayah (Arabic, English, Urdu and its
// themes), under a short head. The generator writes it as one list; this adds
// what a list cannot do alone:
//
//   - a panel for what is about the surah rather than in it (its picture, its
//     facts, its themes), which on a desktop takes the right-hand column;
//   - one row of controls: a field that goes to any ayah (255 here, or 3:18
//     anywhere), switches that show or hide each language and the themes, and
//     the number of the ayah being read. Below a desktop's width it stays
//     under the top of the screen; on a desktop it sits in the panel, which
//     stays in view. The switches are kept in this browser for every surah;
//   - every ayah a way to its own page: a click anywhere on it that is not a
//     link or a selection opens it, as its number does.
//
// Without it the page is still the whole surah, every number a link.

import { go, loadSurahs, resolve, Surah } from "./ayahRef"

const PARTS = [
  { key: "ar", label: "Arabic", text: true },
  { key: "en", label: "English", text: true },
  { key: "ur", label: "Urdu", text: true },
  { key: "themes", label: "Themes", text: false },
] as const

const SHOWN = "tadabbur:surah-show"
const DESKTOP = "(min-width: 1200px)"

const ICON = {
  go: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  top: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg>',
  show: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h10M4 12h16M4 18h7"/><circle cx="17" cy="6" r="2"/><circle cx="14" cy="18" r="2"/></svg>',
}

// Storage can be refused (private browsing); the page then forgets.
function readShown(): Set<string> {
  try {
    const saved = localStorage.getItem(SHOWN)
    if (saved !== null) return new Set(saved.split(",").filter(Boolean))
  } catch {}
  return new Set(PARTS.map((part) => part.key))
}

function writeShown(shown: Set<string>) {
  try {
    localStorage.setItem(SHOWN, [...shown].join(","))
  } catch {}
}

document.addEventListener("nav", () => {
  const article = document.querySelector<HTMLElement>("article.surah")
  const heading = article?.querySelector<HTMLElement>("h2#ayaat")
  const list = article?.querySelector<HTMLUListElement>("h2#ayaat ~ ul")
  if (!article || !heading || !list || article.classList.contains("sp-ready")) return

  const ayaat = [...list.querySelectorAll<HTMLLIElement>(":scope > li")]
  const total = ayaat.length

  // ── The panel: what is about the surah ──────────────────────────────────
  // On a desktop it takes the right-hand column and stays in view, with the
  // controls in it (owner's choice, 2026-10-16, over one that scrolled away
  // and left the column empty while the surah was read).
  const line = article.querySelector<HTMLElement>("h1 + p")
  const aside = document.createElement("aside")
  aside.className = "sp-aside"
  aside.setAttribute("aria-label", "About this surah")
  const picture = article.querySelector<HTMLElement>("p:has(> img)")
  const facts = article.querySelector<HTMLElement>("blockquote")
  const allThemes = article.querySelector<HTMLElement>("details.surah-themes")
  aside.append(...[picture, facts, allThemes].filter((part): part is HTMLElement => !!part))
  ;(line ?? heading).after(aside)

  // ── Show and hide ───────────────────────────────────────────────────────
  const shown = readShown()
  const show = document.createElement("div")
  show.className = "sp-show"
  show.id = "sp-show"
  show.setAttribute("role", "group")
  show.setAttribute("aria-label", "Show in the text")
  show.innerHTML = PARTS.map(
    (part) => `<button type="button" data-part="${part.key}">${part.label}</button>`,
  ).join("")
  const switches = [...show.querySelectorAll<HTMLButtonElement>("button")]

  function applyShown() {
    // One language always stays: a surah with no text is a column of numbers.
    if (!PARTS.some((part) => part.text && shown.has(part.key))) shown.add("ar")
    for (const part of PARTS) article!.classList.toggle(`sp-no-${part.key}`, !shown.has(part.key))
    const languages = PARTS.filter((part) => part.text && shown.has(part.key)).length
    for (const button of switches) {
      const part = PARTS.find((candidate) => candidate.key === button.dataset.part)!
      const on = shown.has(part.key)
      button.setAttribute("aria-pressed", String(on))
      // The last language left cannot be switched off.
      button.disabled = on && part.text && languages === 1
    }
  }

  const onSwitch = (event: Event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("button[data-part]")
    if (!button || button.disabled) return
    const key = button.dataset.part!
    if (shown.has(key)) shown.delete(key)
    else shown.add(key)
    writeShown(shown)
    applyShown()
  }
  show.addEventListener("click", onSwitch)

  // ── The controls: go to an ayah, what to show, where the reader is ────────
  const bar = document.createElement("div")
  bar.className = "sp-bar"
  bar.innerHTML =
    `<form class="sp-goto" role="search" aria-label="Go to an ayah">` +
    `<label for="sp-goto-input">Go to<span class="sp-word"> ayah</span></label>` +
    `<input id="sp-goto-input" type="text" autocomplete="off" spellcheck="false" ` +
    `enterkeyhint="go" placeholder="${Math.min(total, 255)} or 3:18" aria-describedby="sp-msg" />` +
    `<button type="submit" aria-label="Go">${ICON.go}</button></form>` +
    `<div class="sp-show-wrap">` +
    `<button type="button" class="sp-show-toggle" aria-expanded="false" aria-controls="sp-show">` +
    `${ICON.show}<span>Show</span></button></div>` +
    `<a class="sp-top" href="#" aria-label="Back to the top of the surah">` +
    `${ICON.top}<span class="sp-where"></span></a>` +
    `<span class="sp-progress" aria-hidden="true"><span></span></span>` +
    `<p class="sp-msg" id="sp-msg" role="status"></p>`
  bar.querySelector(".sp-show-wrap")!.append(show)

  const form = bar.querySelector<HTMLFormElement>("form")!
  const input = bar.querySelector<HTMLInputElement>("input")!
  const where = bar.querySelector<HTMLElement>(".sp-where")!
  const message = bar.querySelector<HTMLElement>(".sp-msg")!
  const top = bar.querySelector<HTMLAnchorElement>(".sp-top")!
  const progress = bar.querySelector<HTMLElement>(".sp-progress > span")!
  const showToggle = bar.querySelector<HTMLButtonElement>(".sp-show-toggle")!

  // Where there is no room for the four switches in the row, they fold behind
  // one button and open under it.
  function setShowOpen(open: boolean) {
    bar.classList.toggle("sp-show-open", open)
    showToggle.setAttribute("aria-expanded", String(open))
  }
  const onShowToggle = () => setShowOpen(!bar.classList.contains("sp-show-open"))
  const onOutside = (event: Event) => {
    if (bar.classList.contains("sp-show-open") && !bar.contains(event.target as Node)) {
      setShowOpen(false)
    }
  }
  const onEscape = (event: KeyboardEvent) => {
    if (event.key === "Escape" && bar.classList.contains("sp-show-open")) {
      setShowOpen(false)
      showToggle.focus()
    }
  }
  showToggle.addEventListener("click", onShowToggle)
  document.addEventListener("click", onOutside)
  document.addEventListener("keydown", onEscape)

  // On a desktop the panel holds the controls; anywhere else they stay over
  // the text.
  const desktop = window.matchMedia(DESKTOP)
  function place() {
    // The full list of themes is open in the panel, folded in the flow.
    if (allThemes) (allThemes as HTMLDetailsElement).open = desktop.matches
    if (desktop.matches) {
      if (allThemes) aside.insertBefore(bar, allThemes)
      else aside.append(bar)
    } else {
      heading!.before(bar)
    }
    onScroll()
  }

  // The surah being read, for "255" to mean one of its ayaat.
  const slug = (document.body.dataset.slug ?? "").replace(/index$/, "")
  let here: Surah | undefined
  const surahs = loadSurahs().then((all) => {
    here = all.find((surah) => surah.href === slug)
    return all
  })

  const onSubmit = async (event: Event) => {
    event.preventDefault()
    const found = resolve(await surahs, input.value, { here, names: true })
    if (found && "href" in found) {
      message.textContent = ""
      go(found)
    } else {
      message.textContent = found
        ? found.error
        : `Type an ayah number, such as ${Math.min(total, 255)}, or a reference, such as 3:18.`
    }
  }
  const onInput = () => {
    message.textContent = ""
  }
  form.addEventListener("submit", onSubmit)
  input.addEventListener("input", onInput)

  const onTop = (event: Event) => {
    event.preventDefault()
    article.scrollIntoView()
    input.focus({ preventScroll: true })
  }
  top.addEventListener("click", onTop)

  // ── Every ayah opens its own page ───────────────────────────────────────
  // A click on a link inside it (a theme) goes where that link goes, and a
  // click that ends a selection is a reader copying the text, not asking to
  // leave. The keyboard and a screen reader use the number, which says where
  // it leads.
  for (const ayah of ayaat) {
    const number = ayah.querySelector<HTMLAnchorElement>(":scope > a")
    if (number)
      number.setAttribute("aria-label", `Ayah ${number.textContent}: tafsir and recitation`)
  }
  const onAyah = (event: MouseEvent) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return
    const target = event.target as HTMLElement
    if (target.closest("a, button")) return
    const ayah = target.closest("li")
    if (!ayah || ayah.parentElement !== list) return
    if (String(window.getSelection() ?? "").trim()) return
    ayah.querySelector<HTMLAnchorElement>(":scope > a")?.click()
  }
  list.addEventListener("click", onAyah)

  // ── The ayah being read ─────────────────────────────────────────────────
  // The first with more than a few lines still in view under the controls
  // (or, beside the sticky panel, under the top of the screen): a sliver of
  // the one before it is not what is being read. Searched by halves:
  // Al-Baqarah has 286.
  let queued = false
  function mark() {
    queued = false
    const inPanel = aside.contains(bar)
    const line = inPanel ? 120 : bar.getBoundingClientRect().bottom + 48
    let low = 0
    let high = total - 1
    while (low < high) {
      const middle = (low + high) >> 1
      if (ayaat[middle].getBoundingClientRect().bottom < line) low = middle + 1
      else high = middle
    }
    const atText = list!.getBoundingClientRect().top < line
    where.innerHTML = atText
      ? `<span class="sp-word">Ayah </span>${low + 1}<span class="sp-word"> of ${total}</span>`
      : `${total}<span class="sp-word"> ayaat</span>`
    progress.style.width = atText ? `${(((low + 1) / total) * 100).toFixed(2)}%` : "0"
    bar.classList.toggle("sp-reading", atText)
  }
  function onScroll() {
    if (queued) return
    queued = true
    requestAnimationFrame(mark)
  }
  window.addEventListener("scroll", onScroll, { passive: true })
  window.addEventListener("resize", onScroll, { passive: true })
  desktop.addEventListener("change", place)

  window.addCleanup(() => {
    window.removeEventListener("scroll", onScroll)
    window.removeEventListener("resize", onScroll)
    desktop.removeEventListener("change", place)
    show.removeEventListener("click", onSwitch)
    showToggle.removeEventListener("click", onShowToggle)
    document.removeEventListener("click", onOutside)
    document.removeEventListener("keydown", onEscape)
    form.removeEventListener("submit", onSubmit)
    input.removeEventListener("input", onInput)
    top.removeEventListener("click", onTop)
    list.removeEventListener("click", onAyah)
  })

  applyShown()
  place()
  // Before going to an ayah: the class sets the two-column layout on a
  // desktop, which changes every ayah's height.
  article.classList.add("sp-ready")

  // A link to one ayah (#255) was followed before the panel and the controls
  // were put in place and a hidden language taken out of the text, which moved
  // it; go to it again.
  const target = location.hash
    ? document.getElementById(decodeURIComponent(location.hash.slice(1)))
    : null
  // Instant, not the page's smooth scroll: a glide of 100,000px is no help,
  // and the second landing below has to know where the first one ended.
  if (target && list.contains(target)) {
    target.scrollIntoView({ behavior: "instant" })
    // The Arabic and Urdu faces arrive after the page, in more than one wave,
    // and every ayah above the target changes height when they do. Until the
    // reader does anything, or for five seconds, each change lands again.
    const settle = new ResizeObserver(() => target.scrollIntoView({ behavior: "instant" }))
    const stop = () => {
      settle.disconnect()
      for (const type of ["wheel", "touchstart", "keydown", "pointerdown"]) {
        window.removeEventListener(type, stop)
      }
    }
    settle.observe(list)
    for (const type of ["wheel", "touchstart", "keydown", "pointerdown"]) {
      window.addEventListener(type, stop, { passive: true })
    }
    setTimeout(stop, 5000)
    window.addCleanup(stop)
  }

  mark()
})
