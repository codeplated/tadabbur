/**
 * Everything the pages need, loaded once per build and indexed: lookups by id, the
 * curated orders, and the reverse links the data only stores one way (which names and
 * personalities mention an ayah, what carries a theme).
 */
import { getCollection, type CollectionEntry, type CollectionKey } from "astro:content"

export type Surah = CollectionEntry<"surahs">["data"]
export type Ayah = CollectionEntry<"ayaat">["data"]
export type Theme = CollectionEntry<"themes">["data"]
export type ThemeCategory = CollectionEntry<"themeCategories">["data"]
export type Name = CollectionEntry<"names">["data"]
export type NameCategory = CollectionEntry<"nameCategories">["data"]
export type Personality = CollectionEntry<"personalities">["data"]
export type PersonalityKind = CollectionEntry<"personalityKinds">["data"]
export type Canvas = CollectionEntry<"canvases">["data"]
export type Path = Personality["path"]

export interface ThemeUse {
  ayaat: Ayah[]
  names: Name[]
  personalities: Personality[]
}

const data = async <C extends CollectionKey>(
  collection: C,
): Promise<CollectionEntry<C>["data"][]> =>
  (await getCollection(collection)).map((entry) => entry.data)

function byId<T extends { id: string }>(items: T[]): Map<string, T> {
  return new Map(items.map((item) => [item.id, item]))
}

function groupBy<T, K>(items: T[], key: (item: T) => K): Map<K, T[]> {
  const map = new Map<K, T[]>()
  for (const item of items) {
    const k = key(item)
    const list = map.get(k)
    if (list) list.push(item)
    else map.set(k, [item])
  }
  return map
}

function get<T>(map: Map<string, T>, id: string, what: string): T {
  const value = map.get(id)
  if (!value) throw new Error(`Unknown ${what} "${id}"`)
  return value
}

async function load() {
  const [
    surahList,
    ayahList,
    themeList,
    themeCategoryList,
    nameList,
    nameCategoryList,
    personList,
    kindList,
    canvasList,
  ] = await Promise.all([
    data("surahs"),
    data("ayaat"),
    data("themes"),
    data("themeCategories"),
    data("names"),
    data("nameCategories"),
    data("personalities"),
    data("personalityKinds"),
    data("canvases"),
  ])

  const surahs = surahList.sort((a, b) => a.number - b.number)
  const ayaat = ayahList.sort((a, b) => a.globalNumber - b.globalNumber)
  const themes = themeList.sort((a, b) => a.order - b.order)
  const themeCategories = themeCategoryList.sort((a, b) => a.order - b.order)
  const names = nameList.sort((a, b) => a.number - b.number)
  const nameCategories = nameCategoryList.sort((a, b) => a.order - b.order)
  const personalities = personList.sort((a, b) => a.name.en.localeCompare(b.name.en))
  const personalityKinds = kindList.sort((a, b) => a.order - b.order)

  const surahById = byId(surahs)
  const ayahById = byId(ayaat)
  const themeById = byId(themes)
  const nameById = byId(names)
  const personById = byId(personalities)

  const ayaatBySurah = groupBy(ayaat, (a) => a.surah.id)

  const themeUse = new Map<string, ThemeUse>(
    themes.map((t) => [t.id, { ayaat: [], names: [], personalities: [] }]),
  )
  for (const a of ayaat) for (const t of a.themes) themeUse.get(t.id)!.ayaat.push(a)
  for (const n of names) for (const t of n.themes) themeUse.get(t.id)!.names.push(n)
  for (const p of personalities) {
    for (const t of p.themes) themeUse.get(t.id)!.personalities.push(p)
  }

  const mentions = new Map<string, { names: Name[]; personalities: Personality[] }>()
  const mentionsOf = (id: string) => {
    let entry = mentions.get(id)
    if (!entry) mentions.set(id, (entry = { names: [], personalities: [] }))
    return entry
  }
  for (const n of names) for (const a of n.keyAyaat) mentionsOf(a.id).names.push(n)
  for (const p of personalities) for (const a of p.ayaat) mentionsOf(a.id).personalities.push(p)

  return {
    surahs,
    ayaat,
    themes,
    themeCategories,
    names,
    nameCategories,
    personalities,
    personalityKinds,
    canvases: canvasList,

    surah: (id: string) => get(surahById, id, "surah"),
    ayah: (id: string) => get(ayahById, id, "ayah"),
    theme: (id: string) => get(themeById, id, "theme"),
    name: (id: string) => get(nameById, id, "name"),
    person: (id: string) => get(personById, id, "personality"),

    ayaatOf: (surahId: string) => ayaatBySurah.get(surahId) ?? [],
    themeUse: (id: string) => get(themeUse, id, "theme"),
    themesIn: (categoryId: string) => themes.filter((t) => t.category.id === categoryId),
    namesIn: (categoryId: string) => names.filter((n) => n.category.id === categoryId),
    peopleOfKind: (kindId: string) =>
      personalities.filter((p) => p.kind.id === kindId).sort((a, b) => a.order - b.order),
    peopleOnPath: (path: Path) =>
      personalities.filter((p) => p.path === path).sort((a, b) => a.pathOrder - b.pathOrder),
    mentions: (ayahId: string) => mentions.get(ayahId) ?? { names: [], personalities: [] },
    canvasesOf: (surahId: string) => canvasList.filter((c) => c.surah === surahId),

    /** Themes of a surah's ayaat, most used first. */
    surahThemes(surahId: string): { theme: Theme; count: number }[] {
      const counts = new Map<string, number>()
      for (const a of ayaatBySurah.get(surahId) ?? []) {
        for (const t of a.themes) counts.set(t.id, (counts.get(t.id) ?? 0) + 1)
      }
      return [...counts]
        .map(([id, count]) => ({ theme: get(themeById, id, "theme"), count }))
        .sort((a, b) => b.count - a.count || a.theme.order - b.theme.order)
    },
  }
}

export type Site = Awaited<ReturnType<typeof load>>

let cache: Promise<Site> | undefined
/** The whole site's data, loaded once per build. */
export const site = (): Promise<Site> => (cache ??= load())
