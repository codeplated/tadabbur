/**
 * Writes the data contract as JSON Schema, one file per kind of file in `data/`, for
 * the generator repo to validate its output against before it syncs here.
 *
 *   npm run schemas   # -> schemas/*.schema.json
 */
import { mkdir, writeFile } from "node:fs/promises"
import { z } from "astro/zod"
import * as schema from "../src/data/schema"

const files: Record<string, { title: string; shape: z.ZodType }> = {
  surahs: { title: "data/surahs.json", shape: z.array(schema.surah) },
  ayaat: {
    title: "data/ayaat/NNN.json (one surah's ayaat, in order)",
    shape: z.array(schema.ayah),
  },
  themes: { title: "data/themes.json", shape: z.array(schema.theme) },
  "theme-categories": { title: "data/theme-categories.json", shape: z.array(schema.themeCategory) },
  names: { title: "data/names.json", shape: z.array(schema.name) },
  "name-categories": { title: "data/name-categories.json", shape: z.array(schema.nameCategory) },
  personalities: { title: "data/personalities.json", shape: z.array(schema.personality) },
  "personality-kinds": {
    title: "data/personality-kinds.json",
    shape: z.array(schema.personalityKind),
  },
  canvas: { title: "data/canvases/<slug>.json", shape: schema.canvas },
}

await mkdir("schemas", { recursive: true })
for (const [file, { title, shape }] of Object.entries(files)) {
  const json = { title, ...z.toJSONSchema(shape, { io: "input" }) }
  await writeFile(`schemas/${file}.schema.json`, `${JSON.stringify(json, null, 2)}\n`)
  console.log(`schemas/${file}.schema.json`)
}
