import { QuartzPluginData } from "../plugins/vfile"

/**
 * The site menu's data, worked out from the content and nothing else.
 *
 * The explorer plugin this replaced drew every one of the 6,673 notes as a row
 * on every page, from a 20 MB index of the whole site. The menu needs far
 * less: the sections, what is in each, and for a surah the numbers of its
 * ayaat. That is what this builds, once per build; the Menu emitter writes it
 * to static/menu.json and the SiteMenu component reads the sections from it.
 *
 * Nothing here names a folder. A section is a top-level folder with an index
 * note, in the order the home page links to them, so the generator decides
 * both what the sections are and how they are ordered.
 */

/** A note inside an item, shown as a number in a grid: [label, file name]. */
export type MenuLeaf = [string, string]

export type MenuItem = {
  /** Site path without a leading slash; a folder's ends in "/". */
  href: string
  title: string
  /** The name readers cite it by, when the note gives one (`transliteration`). */
  aka?: string
  /** A folder's notes that carry an `ayah` number, in order. */
  leaves?: MenuLeaf[]
}

export type MenuSection = {
  slug: string
  href: string
  title: string
  items: MenuItem[]
}

export type Menu = { sections: MenuSection[] }

// Harakat and Quranic marks crowd a name at menu size, and ٱ reads as ا there.
// Page content keeps them; this is for the menu only.
const tidy = (title: string) => title.replace(/[ً-ٰٟۖ-ۭ]/g, "").replace(/ٱ/g, "ا")

const byTitle = (a: MenuItem, b: MenuItem) =>
  a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: "base" })

const stripIndex = (slug: string) => slug.replace(/\/index$/, "").replace(/\/$/, "")

const firstNumber = (value: unknown): number | null => {
  const n = parseInt(String(value ?? "").split("/")[0], 10)
  return Number.isFinite(n) ? n : null
}

let cached: { files: QuartzPluginData[]; menu: Menu } | undefined

export function buildMenu(allFiles: QuartzPluginData[]): Menu {
  if (cached?.files === allFiles) return cached.menu

  const titleOf = (file: QuartzPluginData) =>
    tidy(String(file.frontmatter?.title ?? file.slug?.split("/").pop() ?? ""))

  // Every note by the folder it sits in.
  const indexNotes = new Map<string, QuartzPluginData>()
  const notesIn = new Map<string, QuartzPluginData[]>()
  for (const file of allFiles) {
    const slug = file.slug as string | undefined
    if (!slug || file.unlisted === true) continue
    if (slug.endsWith("/index")) {
      indexNotes.set(stripIndex(slug), file)
      continue
    }
    const folder = slug.includes("/") ? slug.slice(0, slug.lastIndexOf("/")) : ""
    notesIn.set(folder, [...(notesIn.get(folder) ?? []), file])
  }

  // Sections in the order the home page links to them, then any it does not.
  const home = allFiles.find((file) => file.slug === "index")
  const homeOrder = ((home?.links as string[] | undefined) ?? []).map(stripIndex)
  const rank = (slug: string) => {
    const at = homeOrder.indexOf(slug)
    return at === -1 ? Number.MAX_SAFE_INTEGER : at
  }
  const sectionSlugs = [...indexNotes.keys()]
    .filter((slug) => slug !== "" && !slug.includes("/"))
    .sort((a, b) => rank(a) - rank(b) || a.localeCompare(b))

  const sections = sectionSlugs.map((slug): MenuSection => {
    const items: MenuItem[] = (notesIn.get(slug) ?? []).map((file) => ({
      href: file.slug as string,
      title: titleOf(file),
    }))

    // Folders inside the section: each surah, with its ayaat as leaves.
    for (const [folder, index] of indexNotes) {
      if (!folder.startsWith(slug + "/") || folder.slice(slug.length + 1).includes("/")) continue
      const leaves = (notesIn.get(folder) ?? [])
        .map((file) => ({ file, number: firstNumber(file.frontmatter?.ayah) }))
        .filter((leaf): leaf is { file: QuartzPluginData; number: number } => leaf.number !== null)
        .sort((a, b) => a.number - b.number)
        .map(({ file, number }): MenuLeaf => [
          String(number),
          (file.slug as string).split("/").pop()!,
        ])
      const aka = index.frontmatter?.transliteration
      items.push({
        href: folder + "/",
        title: titleOf(index),
        ...(typeof aka === "string" && aka ? { aka } : {}),
        ...(leaves.length ? { leaves } : {}),
      })
    }

    return {
      slug,
      href: slug + "/",
      title: titleOf(indexNotes.get(slug)!),
      items: items.sort(byTitle),
    }
  })

  cached = { files: allFiles, menu: { sections } }
  return cached.menu
}
