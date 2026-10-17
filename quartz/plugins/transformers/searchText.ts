import { QuartzTransformerPlugin } from "../types"

// What search holds of a page: its text, which the description plugin puts in
// file.data.text and the content-index emitter writes to contentIndex.json,
// the file every page downloads before search can answer.
//
// Two kinds of page are cut short:
//   - an ayah's page keeps everything up to its tafsirs (head, Arabic,
//     English, Urdu, themes) and leaves the tafsirs out;
//   - a surah's page keeps its head (names, place, themes) and leaves out its
//     text, which is each of its ayaat's own pages over again.
//
// Since 2026-10-16 every ayah a tafsir passage covers carries the whole
// passage, and each surah's page the whole surah. Indexed in full that came to
// 33.4 MiB, over the 25 MiB a file may be on Cloudflare Pages, and the deploy
// failed. Cut, it is about 8 MiB. Search finds every ayah by its Arabic,
// English or Urdu text and every surah by name; the tafsirs are not searched
// (owner's choice, 2026-10-17).
//
// The cuts go by lines the generator writes, the summary of the first tafsir
// ("Tafsir: Bayan ul Quran …") and the "Ayaat" heading. If those change, the
// page is indexed whole again and the size comes back: check the file.
//
// Registered after the configured transformers (config-loader.ts), so it runs
// once description has set the text.

const hasClass = (classes: unknown, name: string) =>
  Array.isArray(classes) ? classes.includes(name) : classes === name

const CUTS: [string, RegExp][] = [
  ["ayah", /\n[ \t]*Tafsir: /],
  ["surah", /\n[ \t]*Ayaat[ \t]*\n/],
]

export const SearchText: QuartzTransformerPlugin = () => ({
  name: "SearchText",
  htmlPlugins() {
    return [
      () => (_tree, file) => {
        const data = file.data as { text?: string; frontmatter?: { cssclasses?: unknown } }
        const text = data.text
        if (typeof text !== "string") return
        for (const [kind, marker] of CUTS) {
          if (!hasClass(data.frontmatter?.cssclasses, kind)) continue
          const at = text.search(marker)
          if (at > 0) data.text = text.slice(0, at)
          return
        }
      },
    ]
  },
})
