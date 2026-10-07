/**
 * Reader preferences, kept in localStorage. The inline script in `Base.astro` applies
 * them before first paint; this module reads, writes and re-applies them afterwards.
 * Keep the two in step.
 */
export interface Prefs {
  urdu: boolean
  english: boolean
  tafsir: boolean
  arabicSize: "m" | "l" | "xl"
  theme: "system" | "light" | "dark"
}

const KEY = "tadabbur:prefs"
const DEFAULTS: Prefs = {
  urdu: true,
  english: true,
  tafsir: true,
  arabicSize: "m",
  theme: "system",
}

export function readPrefs(): Prefs {
  try {
    return { ...DEFAULTS, ...(JSON.parse(localStorage.getItem(KEY) ?? "{}") as Partial<Prefs>) }
  } catch {
    return DEFAULTS
  }
}

export function writePrefs(prefs: Prefs) {
  try {
    localStorage.setItem(KEY, JSON.stringify(prefs))
  } catch {
    // Private browsing: the choice lasts for this page only.
  }
}

export function applyPrefs(prefs: Prefs) {
  const root = document.documentElement
  const dark =
    prefs.theme === "dark" ||
    (prefs.theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches)
  root.dataset.theme = dark ? "dark" : "light"
  root.dataset.arabicSize = prefs.arabicSize
  root.toggleAttribute("data-hide-urdu", !prefs.urdu)
  root.toggleAttribute("data-hide-english", !prefs.english)
  root.toggleAttribute("data-hide-tafsir", !prefs.tafsir)
}
