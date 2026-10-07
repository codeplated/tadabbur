/**
 * Content collections over the JSON in `data/`. The shapes live in `src/data/schema.ts`;
 * here the plain id strings become `reference()`s, so a link to something that doesn't
 * exist fails the build.
 */
import { readdir, readFile } from "node:fs/promises"
import { defineCollection, reference } from "astro:content"
import { file, glob, type Loader } from "astro/loaders"
import { z } from "astro/zod"
import * as schema from "./data/schema"

const DATA = "./data"

/** One JSON file per surah, each an array of ayaat. */
function ayaatLoader(): Loader {
  return {
    name: "ayaat-loader",
    load: async ({ store, parseData, watcher }) => {
      const dir = new URL(`../${DATA}/ayaat/`, import.meta.url)
      watcher?.add(dir.pathname)
      store.clear()
      for (const name of (await readdir(dir)).sort()) {
        const ayaat = JSON.parse(await readFile(new URL(name, dir), "utf8")) as { id: string }[]
        for (const ayah of ayaat) {
          store.set({ id: ayah.id, data: await parseData({ id: ayah.id, data: ayah }) })
        }
      }
    },
  }
}

const surahs = defineCollection({
  loader: file(`${DATA}/surahs.json`),
  schema: schema.surah,
})

const ayaat = defineCollection({
  loader: ayaatLoader(),
  schema: schema.ayah.extend({
    surah: reference("surahs"),
    themes: z.array(reference("themes")),
    related: z.array(reference("ayaat")),
  }),
})

const themeCategories = defineCollection({
  loader: file(`${DATA}/theme-categories.json`),
  schema: schema.themeCategory,
})

const themes = defineCollection({
  loader: file(`${DATA}/themes.json`),
  schema: schema.theme.extend({ category: reference("themeCategories") }),
})

const nameCategories = defineCollection({
  loader: file(`${DATA}/name-categories.json`),
  schema: schema.nameCategory,
})

const names = defineCollection({
  loader: file(`${DATA}/names.json`),
  schema: schema.name.extend({
    category: reference("nameCategories"),
    keyAyaat: z.array(reference("ayaat")),
    related: z.array(reference("names")),
    themes: z.array(reference("themes")),
  }),
})

const personalityKinds = defineCollection({
  loader: file(`${DATA}/personality-kinds.json`),
  schema: schema.personalityKind,
})

const personalities = defineCollection({
  loader: file(`${DATA}/personalities.json`),
  schema: schema.personality.extend({
    kind: reference("personalityKinds"),
    ayaat: z.array(reference("ayaat")),
    connected: z.array(reference("personalities")),
    themes: z.array(reference("themes")),
  }),
})

const canvases = defineCollection({
  loader: glob({ pattern: "*.json", base: `${DATA}/canvases` }),
  schema: schema.canvas,
})

export const collections = {
  surahs,
  ayaat,
  themeCategories,
  themes,
  nameCategories,
  names,
  personalityKinds,
  personalities,
  canvases,
}
