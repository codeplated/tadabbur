import type { Element, ElementContent, Root, RootContent, Text } from "hast"
import { QuartzTransformerPlugin } from "../types"

// Notes carry no language markup, so Arabic vs Urdu is inferred from letters
// only one of them uses: Urdu writes ی ک ہ where Arabic writes ي ك ه, plus
// Urdu-only letters like ٹ ڈ ڑ ں ے. Tagging lang lets CSS pick the right
// font for every page, not just sections under known headings.
const ARABIC_SCRIPT = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/
const ARABIC_SCRIPT_G = new RegExp(ARABIC_SCRIPT.source, "g")
const LATIN_G = /[A-Za-zÀ-ɏ]/g
// Harakat and other combining marks sit on a letter, so counting them as
// letters makes a short Arabic phrase look longer than the Latin next to it.
const MARKS_G = /[ً-ٰٟۖ-ۭ]/g
// A block only turns RTL when it is overwhelmingly Arabic-script. A cell like
// "**Asma ul Husna** اسماء الحسنیٰ" keeps its Latin direction and just gets the
// Arabic run wrapped, so a mixed column stays aligned row to row.
const RTL_RATIO = 3
const URDU_ONLY = /[ٹپچڈڑژکگںھہ-ۃیےۓ]/
const ARABIC_ONLY = /[كيۖ-ۭ]/
const A = ARABIC_SCRIPT.source.slice(1, -1)
const RUN = new RegExp(
  `[${A}](?:[${A}\\s\\u200c\\u200d.,:;!?"'()\\-\\u2013\\u2014\\u00ab\\u00bb]*[${A}])?`,
  "g",
)

const BLOCKS = new Set([
  "p",
  "li",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "td",
  "th",
  "dt",
  "dd",
  "figcaption",
])
const SKIP = new Set(["code", "pre", "script", "style", "svg", "math", "kbd", "samp"])

type Lang = "ar" | "ur"

function textOf(node: RootContent | Root): string {
  if (node.type === "text") return node.value
  if (node.type === "element" || node.type === "root") {
    return (node.children as RootContent[]).map(textOf).join("")
  }
  return ""
}

function detect(text: string, fallback: Lang): Lang {
  if (URDU_ONLY.test(text)) return "ur"
  if (ARABIC_ONLY.test(text)) return "ar"
  return fallback
}

function wrapRuns(text: Text, lang: Lang | undefined, blockLang: Lang): ElementContent[] {
  const out: ElementContent[] = []
  let last = 0
  for (const m of text.value.matchAll(RUN)) {
    const runLang = detect(m[0], blockLang)
    if (runLang === lang) continue
    if (m.index! > last) out.push({ type: "text", value: text.value.slice(last, m.index) })
    out.push({
      type: "element",
      tagName: "span",
      properties: { lang: runLang },
      children: [{ type: "text", value: m[0] }],
    })
    last = m.index! + m[0].length
  }
  if (last === 0) return [text]
  if (last < text.value.length) out.push({ type: "text", value: text.value.slice(last) })
  return out
}

function walk(parent: Element | Root, lang: Lang | undefined, blockLang: Lang) {
  const next: RootContent[] = []
  for (const child of parent.children) {
    if (child.type === "text") {
      next.push(...(ARABIC_SCRIPT.test(child.value) ? wrapRuns(child, lang, blockLang) : [child]))
      continue
    }
    if (child.type === "element" && !SKIP.has(child.tagName)) {
      let childLang = (child.properties?.lang as Lang | undefined) ?? lang
      let childBlockLang = blockLang
      if (BLOCKS.has(child.tagName)) {
        const text = textOf(child)
        const arabic = text.match(ARABIC_SCRIPT_G)?.length ?? 0
        if (arabic > 0) {
          childBlockLang = detect(text, "ar")
          const letters = arabic - (text.match(MARKS_G)?.length ?? 0)
          if (letters > RTL_RATIO * (text.match(LATIN_G)?.length ?? 0)) {
            child.properties = { ...child.properties, lang: childBlockLang }
            childLang = childBlockLang
          }
        }
      }
      walk(child, childLang, childBlockLang)
    }
    next.push(child)
  }
  parent.children = next as typeof parent.children
}

export const ScriptLang: QuartzTransformerPlugin = () => ({
  name: "ScriptLang",
  htmlPlugins() {
    return [() => (tree: Root) => walk(tree, undefined, "ar")]
  },
})
