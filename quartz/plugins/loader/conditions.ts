import { QuartzComponentProps } from "../../components/types"

export type ConditionPredicate = (props: QuartzComponentProps) => boolean

// Tadabbur: a theme's own page is tags/<key>; tags/index is the Themes page.
const isThemePage = (slug?: string) =>
  slug !== undefined && slug.startsWith("tags/") && slug !== "tags/index"

const builtinConditions: Record<string, ConditionPredicate> = {
  "not-index": (props) => props.fileData.slug !== "index",
  // A theme's page draws its own heading, with the Urdu name beside it, and
  // says what its properties box held in a line under that (tag-page patch).
  "not-index-or-theme": (props) =>
    props.fileData.slug !== "index" && !isThemePage(props.fileData.slug),
  // Reading time means nothing on a list: the Themes page is an index, and a
  // theme's page is its ayaat, which "1 min read" got wrong by an hour.
  "not-index-or-tags": (props) =>
    props.fileData.slug !== "index" && !(props.fileData.slug ?? "").startsWith("tags/"),
  "has-tags": (props) => {
    const tags = props.fileData.frontmatter?.tags
    return Array.isArray(tags) && tags.length > 0
  },
  "has-backlinks": (props) => {
    const backlinks = (props.fileData as Record<string, unknown>).backlinks
    return Array.isArray(backlinks) && backlinks.length > 0
  },
  "has-toc": (props) => {
    const toc = (props.fileData as Record<string, unknown>).toc
    return Array.isArray(toc) && toc.length > 0
  },
}

const customConditions = new Map<string, ConditionPredicate>()

export function registerCondition(name: string, predicate: ConditionPredicate): void {
  customConditions.set(name, predicate)
}

export function getCondition(name: string): ConditionPredicate | undefined {
  return customConditions.get(name) ?? builtinConditions[name]
}

export function getAllConditionNames(): string[] {
  return [...Object.keys(builtinConditions), ...customConditions.keys()]
}
