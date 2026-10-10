/**
 * Shapes of the JSON in `data/`: the contract with the generator, exported as JSON
 * Schema by `npm run schemas`. `content.config.ts` swaps the plain id strings for
 * `reference()`s so a broken link fails the build.
 *
 * Ids: surahs are their number as a string ("2"), ayaat are "2:255", everything else is
 * a kebab-case slug.
 */
import { z } from "astro/zod"

const text = z.string().trim().min(1)
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
const ayahId = z.string().regex(/^\d{1,3}:\d{1,3}$/)
const count = z.number().int().positive()
const surahImage = z.string().regex(/^surah_\d{3}\.png$/)
export const personalityPath = z.enum(["straight", "deviated", "mixed"])

/** English / Arabic / Urdu names of one thing. */
export const trilingual = z.object({ en: text, ar: text, ur: text })
export const bilingual = z.object({ en: text, ur: text })

/** The "Study Notes" area: absent until someone writes one. */
const notes = text.optional()

export const surah = z.object({
  id: z.string().regex(/^\d{1,3}$/),
  number: count.max(114),
  transliteration: text,
  name: trilingual,
  revelation: z.enum(["meccan", "medinan"]),
  ayahCount: count,
  /** File name under `src/assets/surahs/`. */
  image: surahImage,
  notes,
})

export const ayah = z.object({
  id: ayahId,
  surah: z.string(),
  number: count,
  /** 1 to 6236 across the whole Quran; the recitation audio is keyed on it. */
  globalNumber: count.max(6236),
  /** The first ayah of 112 surahs is preceded by the Bismillah, which isn't counted in it. */
  bismillah: z.boolean(),
  arabic: text,
  urdu: text,
  english: text,
  tafsir: z.object({ source: text, paragraphs: z.array(text).min(1) }),
  themes: z.array(slug),
  /** Hand-picked thematic links; empty everywhere today. */
  related: z.array(ayahId),
  notes,
})

export const themeCategory = z.object({ id: slug, label: text, order: count })

export const theme = z.object({
  id: slug,
  label: bilingual,
  category: slug,
  description: text,
  /** Position in the curated topic list on the home page. */
  order: count,
})

export const nameCategory = z.object({ id: slug, label: text, order: count })

export const name = z.object({
  id: slug,
  number: count.max(99),
  transliteration: text,
  arabic: text,
  urdu: text,
  english: text,
  root: text,
  rootMeaning: text,
  category: slug,
  occurrences: z.number().int().nonnegative(),
  meaning: bilingual,
  inDailyLife: text,
  keyAyaat: z.array(ayahId),
  related: z.array(slug),
  themes: z.array(slug),
  notes,
})

export const personalityKind = z.object({ id: slug, label: bilingual, order: count })

export const personality = z.object({
  id: slug,
  name: trilingual,
  aliases: z.array(text),
  kind: slug,
  /** Position within its kind on the personalities index. */
  order: count,
  path: personalityPath,
  /** Position in the list of everyone on the same path (roughly chronological). */
  pathOrder: count,
  pathLabel: bilingual,
  pathReason: text,
  era: text,
  story: bilingual,
  lessons: z.array(text),
  ayaat: z.array(ayahId),
  connected: z.array(slug),
  themes: z.array(slug),
  notes,
})

const canvasNodeBase = z.object({
  id: text,
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  color: z.string().optional(),
})

export const canvas = z.object({
  id: slug,
  title: text,
  surah: z.string().optional(),
  nodes: z.array(
    z.discriminatedUnion("type", [
      canvasNodeBase.extend({ type: z.literal("ayah"), ayah: ayahId }),
      /** A link to the list of personalities on one path. */
      canvasNodeBase.extend({ type: z.literal("path"), path: personalityPath }),
      canvasNodeBase.extend({ type: z.literal("image"), image: surahImage }),
      /** The reader's own reflection, in Markdown. */
      canvasNodeBase.extend({ type: z.literal("text"), text: z.string() }),
      canvasNodeBase.extend({ type: z.literal("group"), label: z.string().optional() }),
    ]),
  ),
  edges: z.array(
    z.object({
      id: text,
      fromNode: text,
      toNode: text,
      fromSide: z.enum(["top", "right", "bottom", "left"]).optional(),
      toSide: z.enum(["top", "right", "bottom", "left"]).optional(),
      toEnd: z.enum(["none", "arrow"]).optional(),
      label: z.string().optional(),
      color: z.string().optional(),
    }),
  ),
})

export type Surah = z.infer<typeof surah>
export type Ayah = z.infer<typeof ayah>
export type Theme = z.infer<typeof theme>
export type ThemeCategory = z.infer<typeof themeCategory>
export type Name = z.infer<typeof name>
export type NameCategory = z.infer<typeof nameCategory>
export type Personality = z.infer<typeof personality>
export type PersonalityKind = z.infer<typeof personalityKind>
export type Canvas = z.infer<typeof canvas>
