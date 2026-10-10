/**
 * Integrity of the committed JSON in `data/`, as written by the generator: counts,
 * numbering, references and audio.
 */
import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import type { z } from "astro/zod"
import * as schema from "../../src/data/schema"

const DATA = join(import.meta.dirname, "../../data")
const read = (file: string): unknown => JSON.parse(readFileSync(join(DATA, file), "utf8"))
const parseAll = <T extends z.ZodType>(type: T, value: unknown) => type.array().parse(value)

const surahs = parseAll(schema.surah, read("surahs.json"))
const ayaat = readdirSync(join(DATA, "ayaat"))
  .sort()
  .flatMap((file) => parseAll(schema.ayah, read(join("ayaat", file))))
const themes = parseAll(schema.theme, read("themes.json"))
const themeCategories = parseAll(schema.themeCategory, read("theme-categories.json"))
const names = parseAll(schema.name, read("names.json"))
const nameCategories = parseAll(schema.nameCategory, read("name-categories.json"))
const personalities = parseAll(schema.personality, read("personalities.json"))
const personalityKinds = parseAll(schema.personalityKind, read("personality-kinds.json"))
const canvases = readdirSync(join(DATA, "canvases")).map((file) =>
  schema.canvas.parse(read(join("canvases", file))),
)

const ids = (items: { id: string }[]) => new Set(items.map((item) => item.id))
const expectKnown = (refs: string[], known: Set<string>) =>
  expect(refs.filter((ref) => !known.has(ref))).toEqual([])

describe("counts", () => {
  it("has every surah, ayah, name, personality and theme", () => {
    expect(surahs).toHaveLength(114)
    expect(ayaat).toHaveLength(6236)
    expect(names).toHaveLength(99)
    expect(personalities).toHaveLength(79)
    expect(themes).toHaveLength(139)
  })

  it("has unique ids in every collection", () => {
    for (const items of [surahs, ayaat, themes, names, personalities, canvases]) {
      expect(ids(items).size).toBe(items.length)
    }
  })
})

describe("surahs and ayaat", () => {
  it("numbers surahs 1 to 114 in order", () => {
    expect(surahs.map((s) => s.number)).toEqual(Array.from({ length: 114 }, (_, i) => i + 1))
  })

  it("gives each surah exactly its stated ayaat, numbered from 1", () => {
    for (const surah of surahs) {
      const own = ayaat.filter((a) => a.surah === surah.id).map((a) => a.number)
      expect(own).toEqual(Array.from({ length: surah.ayahCount }, (_, i) => i + 1))
    }
  })

  it("numbers ayaat 1 to 6236 across the Quran without gaps", () => {
    expect(ayaat.map((a) => a.globalNumber)).toEqual(Array.from({ length: 6236 }, (_, i) => i + 1))
  })

  it("puts the Bismillah before the first ayah of every surah but 1 and 9", () => {
    const withBismillah = ayaat.filter((a) => a.bismillah).map((a) => a.surah)
    expect(withBismillah).toEqual(
      surahs.filter((s) => s.number !== 1 && s.number !== 9).map((s) => s.id),
    )
  })
})

describe("references", () => {
  const ayahIds = ids(ayaat)
  const themeIds = ids(themes)

  it("ayaat point at known themes and ayaat", () => {
    expectKnown(
      ayaat.flatMap((a) => a.themes),
      themeIds,
    )
    expectKnown(
      ayaat.flatMap((a) => a.related),
      ayahIds,
    )
  })

  it("themes sit in known categories, in a unique order", () => {
    expectKnown(
      themes.map((t) => t.category),
      ids(themeCategories),
    )
    expect(new Set(themes.map((t) => t.order)).size).toBe(themes.length)
  })

  it("names point at known ayaat, names, themes and categories", () => {
    expectKnown(
      names.flatMap((n) => n.keyAyaat),
      ayahIds,
    )
    expectKnown(
      names.flatMap((n) => n.related),
      ids(names),
    )
    expectKnown(
      names.flatMap((n) => n.themes),
      themeIds,
    )
    expectKnown(
      names.map((n) => n.category),
      ids(nameCategories),
    )
  })

  it("personalities point at known ayaat, people, themes and kinds", () => {
    expectKnown(
      personalities.flatMap((p) => p.ayaat),
      ayahIds,
    )
    expectKnown(
      personalities.flatMap((p) => p.connected),
      ids(personalities),
    )
    expectKnown(
      personalities.flatMap((p) => p.themes),
      themeIds,
    )
    expectKnown(
      personalities.map((p) => p.kind),
      ids(personalityKinds),
    )
  })

  it("canvases point at known ayaat, surahs and nodes", () => {
    for (const canvas of canvases) {
      const nodeIds = ids(canvas.nodes)
      expectKnown(
        canvas.nodes.flatMap((n) => (n.type === "ayah" ? [n.ayah] : [])),
        ayahIds,
      )
      expectKnown(
        canvas.edges.flatMap((e) => [e.fromNode, e.toNode]),
        nodeIds,
      )
      if (canvas.surah) expectKnown([canvas.surah], ids(surahs))
    }
  })
})
