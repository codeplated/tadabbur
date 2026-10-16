// Three small things for reaching and reading an ayah.
//
// At the end of an ayah's page, a line that opens the feedback form about
// that ayah.
//
// On an ayah's page the two tafsirs are folded (<details class="tafsir">).
// A reader who opens one is usually reading the tafsir through, ayah after
// ayah, so the next ayah opens the same ones. Kept in this browser; without
// storage, or without this script, both start folded and open with a click.
//
// In the search field, a reference (2:255, Baqarah 255) followed by Enter
// goes straight to the ayah instead of searching for the text "2:255".

import { go, loadSurahs, resolve } from "./ayahRef"

const OPEN = "tadabbur:tafsir-open"

function readOpen(): Set<string> {
  try {
    return new Set((localStorage.getItem(OPEN) ?? "").split(",").filter(Boolean))
  } catch {
    return new Set()
  }
}

document.addEventListener("nav", () => {
  const tafsirs = [...document.querySelectorAll<HTMLDetailsElement>("article.ayah details.tafsir")]
  if (!tafsirs.length) return

  // A way to report a mistake in this ayah, at the end of it: it opens the
  // feedback form (static/feedback.js) saying which ayah the message is about.
  const article = tafsirs[0].closest("article")!
  if (!article.querySelector(".ap-report")) {
    const reference = (article.querySelector("h1")?.textContent ?? "").trim()
    const report = document.createElement("p")
    report.className = "ap-report"
    report.append("Spotted a mistake in this ayah's text, translation, tafsir or themes? ")
    const tell = document.createElement("button")
    tell.type = "button"
    tell.dataset.feedback = reference
    tell.textContent = "Tell us"
    report.append(tell)
    tafsirs[tafsirs.length - 1].after(report)
  }

  const open = readOpen()
  // Known by their place, first or second; the titles may be reworded.
  tafsirs.forEach((tafsir, at) => {
    tafsir.dataset.tafsir = String(at)
    tafsir.open = open.has(String(at))
  })

  const onToggle = (event: Event) => {
    const tafsir = event.target as HTMLDetailsElement
    const at = tafsir.dataset.tafsir
    if (at === undefined) return
    const now = readOpen()
    if (tafsir.open) now.add(at)
    else now.delete(at)
    try {
      localStorage.setItem(OPEN, [...now].join(","))
    } catch {}
  }
  for (const tafsir of tafsirs) tafsir.addEventListener("toggle", onToggle)
  window.addCleanup(() => {
    for (const tafsir of tafsirs) tafsir.removeEventListener("toggle", onToggle)
  })
})

// Caught on the way down, before the search plugin's own Enter opens a result.
// Only a reference is taken; any other text searches as before.
document.addEventListener(
  "keydown",
  (event) => {
    const field = event.target
    // The Enter handed back below is untrusted, and must reach the search.
    if (event.key !== "Enter" || !event.isTrusted || !(field instanceof HTMLInputElement)) return
    if (!field.classList.contains("search-bar")) return
    const typed = field.value
    if (!/\d/.test(typed)) return
    event.preventDefault()
    event.stopImmediatePropagation()
    loadSurahs().then((surahs) => {
      const found = resolve(surahs, typed)
      if (found && "href" in found) {
        // Close the search panel as its own Escape does.
        field.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))
        go(found)
      } else {
        // Not a reference after all: let the search do what Enter does.
        field.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }))
      }
    })
  },
  true,
)
