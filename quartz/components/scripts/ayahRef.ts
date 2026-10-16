// What a reader types to reach an ayah, turned into the page it names.
//
// A reference is written many ways: 2:255, 2 255, 2.255, Baqarah 255,
// al-baqarah:255, the cow 255, البقرة 255. A surah alone (2, Baqarah, the
// cow) names the surah's page. The surahs, their names and their ayaat come
// from static/menu.json, the file the site menu already fetches, so nothing
// here names a surah or a folder: the section whose entries have ayaat is the
// Quran.
//
// Used by the go-to field on a surah's page, the filter on the Quran's page and
// the search field. Each script is bundled on its own, so the menu file is
// shared through the window and fetched once.

type Leaf = [string, string]
type Item = { href: string; title: string; aka?: string; leaves?: Leaf[] }
type Menu = { sections: { items: Item[] }[] }

export type Surah = {
  number: number
  name: string
  aka: string
  arabic: string
  href: string
  ayaat: Map<number, string>
  keys: string[]
}

// Where a reference leads, and what to call it: "Al-Baqarah 2:255".
export type Found = { href: string; label: string }
// Why it leads nowhere: "Al-Baqarah has 286 ayaat."
export type Refused = { error: string }

declare global {
  interface Window {
    tadabburMenu?: Promise<Menu>
  }
}

const base = () => document.body.dataset.basepath ?? ""

export function loadMenu(): Promise<Menu> {
  window.tadabburMenu ??= fetch(`${base()}/static/menu.json`).then(
    (response) => response.json() as Promise<Menu>,
  )
  return window.tadabburMenu
}

// Lower-case, without Latin accents, Arabic vowel marks or the stretch between
// letters, with ٱ as a plain alef. The marks are written as escapes: typed as
// characters, an editor may reorder two that sit together and widen a range.
const fold = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ًͯ-ٰٟـۖ-ۭ]/g, "")
    .replace(/ٱ/g, "ا")

// A name as it is matched: no article (al-, an-, ash- …, "the", ال), no
// apostrophes, hyphens or spaces. "Al-Baqarah", "baqarah" and "Baqara h" meet.
const key = (text: string) =>
  fold(text)
    .replace(/^(the\s+|a[lnrstdzh]{1,2}-|ال)/, "")
    .replace(/[^a-z0-9؀-ۿ]/g, "")

const NUMBERED = /^(\d+)\s*-\s*(.+?)\s*([؀-ۿ].*)?$/

let cached: Promise<Surah[]> | undefined

export function loadSurahs(): Promise<Surah[]> {
  cached ??= loadMenu().then((menu) => {
    const section = menu.sections.find((candidate) =>
      candidate.items.some((item) => item.leaves?.length),
    )
    const surahs: Surah[] = []
    for (const item of section?.items ?? []) {
      const parts = NUMBERED.exec(item.title)
      if (!parts || !item.leaves) continue
      const name = parts[2].trim()
      const arabic = (parts[3] ?? "").trim()
      const aka = item.aka ?? name
      surahs.push({
        number: Number(parts[1]),
        name,
        aka,
        arabic,
        href: item.href,
        ayaat: new Map(item.leaves.map(([label, file]) => [Number(label), item.href + file])),
        keys: [aka, name, arabic].filter(Boolean).map(key),
      })
    }
    return surahs.sort((a, b) => a.number - b.number)
  })
  return cached
}

// The surah a name means: an exact name first, then the first whose name
// begins with what was typed ("baq" is Al-Baqarah), then the first that holds
// it ("imran" is Ali 'Imran).
function byName(surahs: Surah[], typed: string): Surah | undefined {
  const wanted = key(typed)
  if (!wanted) return undefined
  return (
    surahs.find((surah) => surah.keys.includes(wanted)) ??
    surahs.find((surah) => surah.keys.some((name) => name.startsWith(wanted))) ??
    (wanted.length > 2
      ? surahs.find((surah) => surah.keys.some((name) => name.includes(wanted)))
      : undefined)
  )
}

const page = (href: string) => `${base()}/${href}`

function ayah(surah: Surah, number: number): Found | Refused {
  const href = surah.ayaat.get(number)
  if (!href) {
    return { error: `${surah.aka} has ${surah.ayaat.size} ayaat.` }
  }
  return { href: page(href), label: `${surah.aka} ${surah.number}:${number}` }
}

/**
 * What `typed` refers to, or null if it does not look like a reference.
 *
 * `here` is the surah being read, if any: on its page a number alone is one
 * of its ayaat. Anywhere else a number alone is a surah. `names` decides
 * whether a surah's name alone counts (the Quran's filter leaves names to
 * the filter itself).
 */
export function resolve(
  surahs: Surah[],
  typed: string,
  options: { here?: Surah; names?: boolean } = {},
): Found | Refused | null {
  const text = fold(latinDigits(typed)).trim()
  if (!text) return null

  // 2:255, 2 255, 2.255, 2/255
  const both = /^(\d{1,3})\s*[:.\/,\s]\s*(\d{1,3})$/.exec(text)
  if (both) {
    const surah = surahs.find((candidate) => candidate.number === Number(both[1]))
    if (!surah) return { error: `There are ${surahs.length} surahs.` }
    return ayah(surah, Number(both[2]))
  }

  // 255 on a surah's page; 2 anywhere else.
  const one = /^(\d{1,3})$/.exec(text)
  if (one) {
    if (options.here) return ayah(options.here, Number(one[1]))
    const surah = surahs.find((candidate) => candidate.number === Number(one[1]))
    if (!surah) return { error: `There are ${surahs.length} surahs.` }
    return { href: page(surah.href), label: `${surah.number} ${surah.aka}` }
  }

  // Baqarah 255, the cow:255, البقرة ٢٥٥
  const named = /^(.*?[^\d\s:.,\/])\s*[:.,\s]\s*(\d{1,3})$/.exec(text)
  if (named) {
    const surah = byName(surahs, named[1])
    if (surah) return ayah(surah, Number(named[2]))
    return null
  }

  if (options.names) {
    const surah = byName(surahs, text)
    if (surah) return { href: page(surah.href), label: `${surah.number} ${surah.aka}` }
  }
  return null
}

// Arabic-Indic and Persian digits as Latin ones, so ٢:٢٥٥ works too.
export const latinDigits = (text: string) =>
  text.replace(/[٠-٩۰-۹]/g, (digit) => String(digit.charCodeAt(0) & 0xf))

export function go(found: Found) {
  const url = new URL(found.href, location.href)
  if (window.spaNavigate) window.spaNavigate(url)
  else location.assign(url)
}
