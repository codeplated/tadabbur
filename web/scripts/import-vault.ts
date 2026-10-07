/**
 * One-time conversion of the Obsidian vault (`../content`) into the typed JSON in
 * `data/`. Text is copied exactly; only the structure changes.
 *
 *   npm run import:vault [-- --vault ../content --out data --images src/assets/surahs]
 *
 * Nothing is written unless every entity parses against `src/data/schema.ts`, every
 * cross-link resolves, and the counts the vault states about itself (theme note counts,
 * per-surah theme tables, audio numbering, previous/next links) match what is imported.
 */
import { copyFile, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises"
import { basename, join, relative } from "node:path"
import { parseArgs } from "node:util"
import { parse as parseYaml } from "yaml"
import type { z } from "astro/zod"
import * as schema from "../src/data/schema.ts"

const { values: args } = parseArgs({
  options: {
    vault: { type: "string", default: "../content" },
    out: { type: "string", default: "data" },
    images: { type: "string", default: "src/assets/surahs" },
  },
})
const VAULT = args.vault
const OUT = args.out
const IMAGES = args.images

const EXPECTED = { surahs: 114, ayaat: 6236, names: 99, personalities: 79, themes: 139 }
const BISMILLAH = "بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ"
const EXPLORE = "0 - Explore"
/** The vault's headings separate their parts with a spaced em dash. */
const EM_DASH = String.fromCharCode(0x2014)
const DASH = ` ${EM_DASH} `

// Errors are collected, so one run reports every problem.

const problems: string[] = []
function fail(where: string, message: string): never {
  throw new Error(`${where}: ${message}`)
}
function check(ok: boolean, where: string, message: string) {
  if (!ok) problems.push(`${where}: ${message}`)
}

// Markdown helpers

interface Note {
  path: string
  frontmatter: Record<string, unknown>
  /** Between GENERATED:START and GENERATED:END. */
  generated: string
  /** The reader's own text after GENERATED:END, with the placeholder heading removed. */
  notes: string | undefined
}

async function readNote(path: string): Promise<Note> {
  const raw = (await readFile(join(VAULT, path), "utf8")).replace(/\r\n/g, "\n")
  const fm = /^---\n([\s\S]*?)\n---\n/.exec(raw)
  const body = fm ? raw.slice(fm[0].length) : raw
  const start = body.indexOf("<!-- GENERATED:START -->")
  const end = body.indexOf("<!-- GENERATED:END -->")
  const generated =
    start >= 0 && end > start ? body.slice(start + "<!-- GENERATED:START -->".length, end) : body
  const after = end >= 0 ? body.slice(end + "<!-- GENERATED:END -->".length) : ""
  const notes = after.replace(/^\s*##\s+(Study|Tafsir|Surah) Notes\s*$/m, "").trim()
  return {
    path,
    frontmatter: fm ? (parseYaml(fm[1]!) as Record<string, unknown>) : {},
    generated,
    notes: notes || undefined,
  }
}

/** `## Heading` to body text, with the `---` separators trimmed off. */
function sections(note: Note): Map<string, string> {
  const map = new Map<string, string>()
  for (const part of note.generated.split(/^## /m).slice(1)) {
    const newline = part.indexOf("\n")
    const heading = part.slice(0, newline).trim()
    const text = part
      .slice(newline + 1)
      .replace(/\n---\s*$/, "")
      .trim()
    map.set(heading, text)
  }
  return map
}

function section(note: Note, map: Map<string, string>, heading: string): string {
  const value = map.get(heading) ?? [...map].find(([key]) => key.startsWith(heading))?.[1]
  if (value === undefined) fail(note.path, `missing section "${heading}"`)
  return value
}

/** Targets of every `[[wikilink]]` in a piece of text, alias stripped. */
function wikilinks(text: string): string[] {
  return [...text.matchAll(/\[\[([^\]|]+?)(?:\\?\|[^\]]*)?\]\]/g)].map((m) => m[1]!.trim())
}

/** "- a\n- b" or "1. a\n2. b" to ["a", "b"]. */
function listItems(text: string): string[] {
  return text
    .split("\n")
    .map((line) => /^\s*(?:[-*]|\d+\.)\s+(.*)$/.exec(line)?.[1]?.trim())
    .filter((item): item is string => !!item)
}

/** Rows of every Markdown table in the text, as arrays of trimmed cells. */
function tableRows(text: string): string[][] {
  return text
    .split("\n")
    .filter((line) => line.startsWith("|") && !/^\|[-\s|]+\|$/.test(line))
    .map((line) =>
      line
        .slice(1, -1)
        .split(/(?<!\\)\|/)
        .map((cell) => cell.trim()),
    )
}

function str(note: Note, key: string): string {
  const value = note.frontmatter[key]
  if (typeof value === "number") return String(value)
  if (typeof value !== "string" || !value.trim()) fail(note.path, `frontmatter "${key}" missing`)
  return value.trim()
}

function num(note: Note, key: string): number {
  const value = Number(str(note, key))
  if (!Number.isInteger(value)) fail(note.path, `frontmatter "${key}" is not a number`)
  return value
}

function tags(note: Note): string[] {
  const value = note.frontmatter.tags
  if (!Array.isArray(value)) fail(note.path, `frontmatter "tags" missing`)
  return value.map((tag) => kebab(String(tag)))
}

/** "En / Ar / Ur" to { en, ar, ur }. */
function trilingual(note: Note, key: string) {
  const parts = str(note, key).split(" / ")
  if (parts.length !== 3) fail(note.path, `"${key}" is not "English / Arabic / Urdu"`)
  return { en: parts[0]!.trim(), ar: parts[1]!.trim(), ur: parts[2]!.trim() }
}

/** "1 / 114" to 1. */
function leadingNumber(note: Note, key: string): number {
  const match = /^(\d+)\s*\/\s*\d+$/.exec(str(note, key))
  if (!match) fail(note.path, `"${key}" is not "N / M"`)
  return Number(match[1])
}

function kebab(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

/** "**Tawheed** توحید" to { en, ur }. */
function boldLabel(where: string, cell: string) {
  const match = /^\*\*(.+?)\*\*\s+(.+)$/.exec(cell)
  if (!match) fail(where, `can't read label "${cell}"`)
  return { en: match[1]!.trim(), ur: match[2]!.trim() }
}

/** "[#tawheed](tags/tawheed)" to "tawheed". */
function tagCell(where: string, cell: string): string {
  const match = /^\[#([\w-]+)\]\(tags\/[\w-]+\)$/.exec(cell)
  if (!match) fail(where, `can't read tag "${cell}"`)
  return kebab(match[1]!)
}

/** "2_255" to "2:255". */
function ayahRef(where: string, link: string): string {
  const match = /^(?:.*\/)?(\d+)_(\d+)$/.exec(link)
  if (!match) fail(where, `"${link}" is not an ayah link`)
  return `${match[1]}:${match[2]}`
}

function validate<T extends z.ZodType>(type: T, where: string, value: unknown): z.infer<T> {
  const result = type.safeParse(value)
  if (!result.success) {
    for (const issue of result.error.issues) {
      problems.push(`${where}: ${issue.path.join(".")} ${issue.message}`)
    }
  }
  return value as z.infer<T>
}

type VaultTarget = { type: "ayah"; id: string } | { type: "path"; id: schema.Personality["path"] }

// Surahs and ayaat

const surahFolders = (await readdir(VAULT, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory() && /^[1-9]\d* - /.test(entry.name))
  .map((entry) => entry.name)
  .sort((a, b) => parseInt(a) - parseInt(b))

const surahs: schema.Surah[] = []
const ayaatBySurah = new Map<number, schema.Ayah[]>()
/** Per-surah theme tables as the vault states them, checked once themes are known. */
const statedSurahThemes = new Map<number, Map<string, number>>()
/** Vault path (without .md) to entity, for resolving canvas file nodes. */
const vaultPaths = new Map<string, VaultTarget>()
let globalNumber = 0

for (const folder of surahFolders) {
  const number = parseInt(folder)
  const index = await readNote(join(folder, "index.md"))
  const ayahCount = num(index, "ayaat")
  check(leadingNumber(index, "surah") === number, index.path, "surah number differs from folder")

  surahs.push(
    validate(schema.surah, index.path, {
      id: String(number),
      number,
      transliteration: str(index, "transliteration"),
      name: trilingual(index, "surah_name"),
      revelation: str(index, "type"),
      ayahCount,
      image: /\/attachments\/(surah_\d{3}\.png)$/.exec(str(index, "image"))?.[1],
      notes: index.notes,
    }),
  )

  const themeTable = section(index, sections(index), "Themes in this surah")
  statedSurahThemes.set(
    number,
    new Map(
      tableRows(themeTable)
        .slice(1)
        .map(([label = "", count = ""]) => {
          const tag = /\[#([\w-]+)\]/.exec(label)?.[1]
          if (!tag) fail(index.path, `can't read theme row "${label}"`)
          return [kebab(tag), Number(count)]
        }),
    ),
  )

  const ayaat: schema.Ayah[] = []
  for (let n = 1; n <= ayahCount; n++) {
    const note = await readNote(join(folder, `${number}_${n}.md`))
    const map = sections(note)
    const id = `${number}:${n}`
    globalNumber++

    check(leadingNumber(note, "surah") === number, note.path, "surah differs from folder")
    check(leadingNumber(note, "ayah") === n, note.path, "ayah differs from file name")
    check(str(note, "type") === str(index, "type"), note.path, "type differs from its surah")

    const audio = /ar\.alafasy\/(\d+)\.mp3/.exec(section(note, map, "Recitation"))?.[1]
    check(Number(audio) === globalNumber, note.path, `audio ${audio}, global ${globalNumber}`)

    const connections = section(note, map, "Connections")
    const previous = /\*\*Previous:\*\*\s*\[\[([^\]]+)\]\]/.exec(connections)?.[1]
    const next = /\*\*Next:\*\*\s*\[\[([^\]]+)\]\]/.exec(connections)?.[1]
    if (n > 1) check(previous === `${number}_${n - 1}`, note.path, `previous is ${previous}`)
    if (n < ayahCount) check(next === `${number}_${n + 1}`, note.path, `next is ${next}`)
    const thematic = /\*\*Thematic:\*\*(.*)$/m.exec(connections)?.[1] ?? ""

    // The Bismillah sits on its own line above the first ayah of every surah but 1 and 9.
    const arabicLines = section(note, map, "Arabic")
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean)
    const bismillah = arabicLines.length === 2 && arabicLines[0] === BISMILLAH
    check(arabicLines.length === 1 || bismillah, note.path, "unexpected Arabic layout")
    check(!bismillah || n === 1, note.path, "Bismillah line on a later ayah")

    const tafsirHeading = [...map.keys()].find((key) => key.startsWith(`Tafsir${DASH}`))
    if (!tafsirHeading) fail(note.path, "no tafsir section")

    ayaat.push(
      validate(schema.ayah, note.path, {
        id,
        surah: String(number),
        number: n,
        globalNumber,
        bismillah,
        arabic: arabicLines.at(-1),
        urdu: section(note, map, "Urdu"),
        english: section(note, map, "English"),
        tafsir: {
          source: tafsirHeading.slice(`Tafsir${DASH}`.length),
          paragraphs: map
            .get(tafsirHeading)!
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean),
        },
        themes: tags(note),
        related: wikilinks(thematic).map((link) => ayahRef(note.path, link)),
        notes: note.notes,
      }),
    )
    vaultPaths.set(join(folder, `${number}_${n}`), { type: "ayah", id })
  }
  ayaatBySurah.set(number, ayaat)
}

// Themes: category and description from the A-Z table, curated order from the home page.

const home = await readNote("index.md")
const themesNote = await readNote(join(EXPLORE, "Themes.md"))
const themeCategories: schema.ThemeCategory[] = []
const themes: schema.Theme[] = []
/** "Notes" column: how many notes the vault says carry each theme. */
const statedThemeCounts = new Map<string, number>()

{
  const details = new Map<string, { category: string; description: string }>()
  for (const [topic = "", tag = "", category = "", count = "", description = ""] of tableRows(
    themesNote.generated,
  ).slice(1)) {
    const id = tagCell(themesNote.path, tag)
    boldLabel(themesNote.path, topic)
    details.set(id, { category, description })
    statedThemeCounts.set(id, Number(count))
  }

  for (const block of home.generated.split(/^### /m).slice(1)) {
    const categoryLabel = block.slice(0, block.indexOf("\n")).trim()
    const categoryId = kebab(categoryLabel)
    themeCategories.push(
      validate(schema.themeCategory, home.path, {
        id: categoryId,
        label: categoryLabel,
        order: themeCategories.length + 1,
      }),
    )
    for (const [order = "", topic = "", tag = "", , description = ""] of tableRows(block).slice(
      1,
    )) {
      const id = tagCell(home.path, tag)
      const detail = details.get(id)
      check(!!detail, home.path, `theme ${id} is not in Themes.md`)
      check(detail?.description === description, home.path, `${id}: description differs`)
      check(
        kebab(detail?.category ?? "") === categoryId,
        home.path,
        `${id}: category ${detail?.category}, listed under ${categoryLabel}`,
      )
      themes.push(
        validate(schema.theme, home.path, {
          id,
          label: boldLabel(home.path, topic),
          category: categoryId,
          description,
          order: Number(order),
        }),
      )
    }
  }
  check(details.size === themes.length, themesNote.path, "A-Z table and home list differ")
}

// Names of Allah

const namesDir = join(EXPLORE, "Asma Ul Husna")
const nameFiles = (await readdir(join(VAULT, namesDir))).filter((f) => /^\d+ - .*\.md$/.test(f))
const nameIdByFile = new Map<string, string>()
const nameNotes: Note[] = []
for (const file of nameFiles) nameNotes.push(await readNote(join(namesDir, file)))
// Two pairs of Names share a transliteration (Al-Majid 49 and 66, Al-Wali 56 and 78);
// those, and only those, get their number appended to keep the slug unique.
const nameSlugUse = new Map<string, number>()
for (const note of nameNotes) {
  const slug = kebab(str(note, "transliteration"))
  nameSlugUse.set(slug, (nameSlugUse.get(slug) ?? 0) + 1)
}
const nameId = (note: Note) => {
  const slug = kebab(str(note, "transliteration"))
  return nameSlugUse.get(slug)! > 1 ? `${slug}-${num(note, "number")}` : slug
}
for (const note of nameNotes) nameIdByFile.set(basename(note.path, ".md"), nameId(note))

const nameCategories: schema.NameCategory[] = []
{
  const index = await readNote(join(namesDir, "index.md"))
  for (const heading of index.generated.matchAll(new RegExp(`^## (.+?)${DASH}\\d+$`, "gm"))) {
    nameCategories.push(
      validate(schema.nameCategory, index.path, {
        id: kebab(heading[1]!),
        label: heading[1]!,
        order: nameCategories.length + 1,
      }),
    )
  }
}

const names: schema.Name[] = nameNotes
  .map((note) => {
    const map = sections(note)
    return validate(schema.name, note.path, {
      id: nameId(note),
      number: num(note, "number"),
      transliteration: str(note, "transliteration"),
      arabic: str(note, "arabic"),
      urdu: str(note, "urdu"),
      english: str(note, "english"),
      root: str(note, "root"),
      rootMeaning: str(note, "root_meaning"),
      category: kebab(str(note, "category")),
      occurrences: num(note, "quran_occurrences"),
      meaning: {
        en: section(note, map, `Meaning${DASH}English`),
        ur: section(note, map, `معنی${DASH}`),
      },
      inDailyLife: section(note, map, "In Daily Life"),
      keyAyaat: wikilinks(section(note, map, "Key Ayaat")).map((l) => ayahRef(note.path, l)),
      related: wikilinks(map.get("Related Names") ?? "").map((link) => {
        const id = nameIdByFile.get(link)
        if (!id) fail(note.path, `unknown name "${link}"`)
        return id
      }),
      themes: tags(note),
      notes: note.notes,
    })
  })
  .sort((a, b) => a.number - b.number)

// Personalities

const peopleDir = join(EXPLORE, "Personalities")
const PATHS: Record<string, schema.Personality["path"]> = {
  "Straight Path": "straight",
  "Deviated Path": "deviated",
  [`Mixed${DASH}Erred, Repented, or Complex`]: "mixed",
}
const PATH_FILES: Record<string, schema.Personality["path"]> = {
  "Straight Path": "straight",
  "Deviated Path": "deviated",
  "Mixed Path": "mixed",
}

const peopleFiles = (await readdir(join(VAULT, peopleDir))).filter(
  (f) => f.endsWith(".md") && f !== "index.md",
)
const personIdByFile = new Map<string, string>()
const peopleNotes: Note[] = []
for (const file of peopleFiles) {
  const note = await readNote(join(peopleDir, file))
  peopleNotes.push(note)
  personIdByFile.set(basename(file, ".md"), kebab(str(note, "id")))
}

function personLink(where: string, link: string): string {
  const id = personIdByFile.get(link)
  if (!id) fail(where, `unknown personality "${link}"`)
  return id
}

// Kinds and the order within each kind come from the index; the order within a path from Filtered/.
const personalityKinds: schema.PersonalityKind[] = []
const kindOrder = new Map<string, number>()
const pathOrder = new Map<string, number>()
{
  const index = await readNote(join(peopleDir, "index.md"))
  for (const block of index.generated.split(/^## /m).slice(1)) {
    const heading = block.slice(0, block.indexOf("\n"))
    const [en = "", ur = ""] = heading.split(DASH).map((part) => part.trim())
    personalityKinds.push(
      validate(schema.personalityKind, index.path, {
        id: kebab(en),
        label: { en, ur },
        order: personalityKinds.length + 1,
      }),
    )
    for (const [order = "", nameCell = ""] of tableRows(block).slice(1)) {
      const [link] = wikilinks(nameCell)
      kindOrder.set(personLink(index.path, link ?? nameCell), Number(order))
    }
  }
  for (const [file, path] of Object.entries(PATH_FILES)) {
    const note = await readNote(join(peopleDir, "Filtered", `${file}.md`))
    vaultPaths.set(join(peopleDir, "Filtered", file), { type: "path", id: path })
    for (const [order = "", nameCell = ""] of tableRows(note.generated).slice(1)) {
      const [link] = wikilinks(nameCell)
      pathOrder.set(personLink(note.path, link ?? nameCell), Number(order))
    }
  }
}

/** Split "a (x, y), b" on commas outside parentheses; a lone em dash means none. */
function splitAliases(value: string): string[] {
  const out: string[] = []
  let depth = 0
  let current = ""
  for (const char of value) {
    if (char === "(") depth++
    if (char === ")") depth--
    if (char === "," && depth === 0) {
      out.push(current)
      current = ""
    } else current += char
  }
  out.push(current)
  return out.map((alias) => alias.trim()).filter((alias) => alias && alias !== EM_DASH)
}

const personalities: schema.Personality[] = peopleNotes
  .map((note) => {
    const map = sections(note)
    const id = kebab(str(note, "id"))
    const aliases = /\*\*Also known as:\*\*\s*(.*)$/m.exec(note.generated)?.[1] ?? ""
    const pathHeading = [...map.keys()].find((key) => key.startsWith(`Path${DASH}`))
    if (!pathHeading) fail(note.path, "no Path section")
    const [pathEn = "", pathUr = ""] = pathHeading
      .slice(`Path${DASH}`.length)
      .split(" | ")
      .map((part) => part.trim())
    const reason = /\*\*Reason:\*\*\s*([\s\S]*)$/.exec(map.get(pathHeading)!)?.[1]?.trim()

    return validate(schema.personality, note.path, {
      id,
      name: trilingual(note, "name"),
      aliases: splitAliases(aliases),
      kind: kebab(str(note, "type")),
      order: kindOrder.get(id),
      path: PATHS[str(note, "path")],
      pathOrder: pathOrder.get(id),
      pathLabel: { en: pathEn, ur: pathUr },
      pathReason: reason,
      era: str(note, "era"),
      story: {
        en: section(note, map, `Story${DASH}English`),
        ur: section(note, map, `کہانی${DASH}`),
      },
      lessons: listItems(section(note, map, "Lessons from the Quran")),
      ayaat: wikilinks(section(note, map, "Mentioned in Quran")).map((l) => ayahRef(note.path, l)),
      connected: wikilinks(map.get("Connected Personalities") ?? "").map((link) =>
        personLink(note.path, link),
      ),
      themes: tags(note),
      notes: note.notes,
    })
  })
  .sort((a, b) => a.id.localeCompare(b.id))

// Canvases

const canvases: schema.Canvas[] = []
for (const folder of ["", ...surahFolders]) {
  const files = (await readdir(join(VAULT, folder))).filter((f) => f.endsWith(".canvas"))
  for (const file of files) {
    const where = join(folder, file)
    const raw = JSON.parse(await readFile(join(VAULT, where), "utf8")) as {
      nodes: ({ type: string; file?: string } & Record<string, unknown>)[]
      edges: Record<string, unknown>[]
    }
    const title = basename(file, ".canvas")
    const nodes = raw.nodes.map(({ type, file: target = "", ...rest }) => {
      if (type !== "file") return { type, ...rest }
      const image = /^attachments\/(surah_\d{3}\.png)$/.exec(target)?.[1]
      if (image) return { ...rest, type: "image", image }
      const entity = vaultPaths.get(target.replace(/\.md$/, ""))
      if (!entity) fail(where, `canvas links to unknown "${target}"`)
      return entity.type === "ayah"
        ? { ...rest, type: "ayah", ayah: entity.id }
        : { ...rest, type: "path", path: entity.id }
    })
    canvases.push(
      validate(schema.canvas, where, {
        id: kebab(title),
        title,
        surah: folder ? String(parseInt(folder)) : undefined,
        nodes,
        edges: raw.edges,
      }),
    )
  }
}

// Cross-checks

const allAyaat = [...ayaatBySurah.values()].flat()
const counts = {
  surahs: surahs.length,
  ayaat: allAyaat.length,
  names: names.length,
  personalities: personalities.length,
  themes: themes.length,
}
for (const [key, expected] of Object.entries(EXPECTED)) {
  const actual = counts[key as keyof typeof counts]
  check(actual === expected, "counts", `${key}: ${actual}, expected ${expected}`)
}

const ayahIds = new Set(allAyaat.map((a) => a.id))
const themeIds = new Set(themes.map((t) => t.id))
const nameIds = new Set(names.map((n) => n.id))
const personIds = new Set(personalities.map((p) => p.id))
for (const [what, ids] of [
  ["names", names.map((n) => n.id)],
  ["personalities", personalities.map((p) => p.id)],
  ["themes", themes.map((t) => t.id)],
] as const) {
  check(new Set(ids).size === ids.length, what, "duplicate ids")
}

const refs = (where: string, ids: string[], known: Set<string>, what: string) => {
  for (const id of ids) check(known.has(id), where, `unknown ${what} "${id}"`)
}
for (const a of allAyaat) {
  refs(a.id, a.themes, themeIds, "theme")
  refs(a.id, a.related, ayahIds, "ayah")
}
for (const n of names) {
  refs(n.id, n.keyAyaat, ayahIds, "ayah")
  refs(n.id, n.related, nameIds, "name")
  refs(n.id, n.themes, themeIds, "theme")
  refs(n.id, [n.category], new Set(nameCategories.map((c) => c.id)), "name category")
}
for (const p of personalities) {
  refs(p.id, p.ayaat, ayahIds, "ayah")
  refs(p.id, p.connected, personIds, "personality")
  refs(p.id, p.themes, themeIds, "theme")
  refs(p.id, [p.kind], new Set(personalityKinds.map((k) => k.id)), "kind")
}

// The vault's own counts must match what was imported.
const themeUse = new Map<string, number>()
for (const item of [...allAyaat, ...names, ...personalities]) {
  for (const t of item.themes) themeUse.set(t, (themeUse.get(t) ?? 0) + 1)
}
for (const [id, stated] of statedThemeCounts) {
  check(
    themeUse.get(id) === stated,
    "Themes.md",
    `${id}: ${themeUse.get(id)} notes, says ${stated}`,
  )
}
for (const [surah, stated] of statedSurahThemes) {
  const actual = new Map<string, number>()
  for (const a of ayaatBySurah.get(surah)!) {
    for (const t of a.themes) actual.set(t, (actual.get(t) ?? 0) + 1)
  }
  for (const [id, count] of stated) {
    check(actual.get(id) === count, `surah ${surah}`, `${id}: ${actual.get(id)}, says ${count}`)
  }
}

// Obsidian syntax left in a text field means a field wasn't parsed fully.
const leftover = /\[\[|<audio|<!--/
for (const item of [...allAyaat, ...names, ...personalities]) {
  check(!leftover.test(JSON.stringify(item)), item.id, "Obsidian syntax left in text")
}

if (problems.length) {
  console.error(`${problems.length} problem(s), nothing written:\n`)
  console.error(problems.slice(0, 50).join("\n"))
  process.exit(1)
}

// Write

const json = (value: unknown) => JSON.stringify(value, null, 2) + "\n"
await rm(OUT, { recursive: true, force: true })
await mkdir(join(OUT, "ayaat"), { recursive: true })
await mkdir(join(OUT, "canvases"), { recursive: true })
await writeFile(join(OUT, "surahs.json"), json(surahs))
for (const [surah, ayaat] of ayaatBySurah) {
  await writeFile(join(OUT, "ayaat", `${String(surah).padStart(3, "0")}.json`), json(ayaat))
}
await writeFile(join(OUT, "themes.json"), json(themes))
await writeFile(join(OUT, "theme-categories.json"), json(themeCategories))
await writeFile(join(OUT, "names.json"), json(names))
await writeFile(join(OUT, "name-categories.json"), json(nameCategories))
await writeFile(join(OUT, "personalities.json"), json(personalities))
await writeFile(join(OUT, "personality-kinds.json"), json(personalityKinds))
for (const canvas of canvases) {
  await writeFile(join(OUT, "canvases", `${canvas.id}.json`), json(canvas))
}

await mkdir(IMAGES, { recursive: true })
for (const surah of surahs) {
  await copyFile(join(VAULT, "attachments", surah.image), join(IMAGES, surah.image))
}

console.log(`Imported ${relative(process.cwd(), VAULT)} into ${OUT}/`)
for (const [key, value] of Object.entries({ ...counts, canvases: canvases.length })) {
  console.log(`  ${key.padEnd(14)} ${value}`)
}
