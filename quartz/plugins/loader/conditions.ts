import { QuartzComponentProps } from "../../components/types"

export type ConditionPredicate = (props: QuartzComponentProps) => boolean

// Tadabbur: a theme's own page is tags/<key>; tags/index is the Themes page.
const isThemePage = (slug?: string) =>
  slug !== undefined && slug.startsWith("tags/") && slug !== "tags/index"

// Tadabbur: the generator says what kind of page a note is with a class.
// `index-page` is a listing (The Quran, Themes, Personalities, Asma Ul Husna);
// `profile` is a person's or a Name's page, `surah` a surah's and `ayah` an
// ayah's. Those three draw their own heading and say their fields in lines
// under it, as a theme's page does.
const hasClass = (props: QuartzComponentProps, name: string) => {
  const classes = props.fileData.frontmatter?.cssclasses
  return Array.isArray(classes) ? classes.includes(name) : classes === name
}

const OWN_HEAD = ["profile", "surah", "ayah"]

const drawsOwnHead = (props: QuartzComponentProps) =>
  isThemePage(props.fileData.slug) || OWN_HEAD.some((name) => hasClass(props, name))

const builtinConditions: Record<string, ConditionPredicate> = {
  "not-index": (props) => props.fileData.slug !== "index",
  // The stock title and the properties box stay off the home page and off any
  // page that draws its own heading: a theme's page (tag-page patch), and a
  // person's, a Name's, a surah's and an ayah's page (written into the note by
  // the generator).
  "stock-head": (props) => props.fileData.slug !== "index" && !drawsOwnHead(props),
  // Reading time means nothing on a list (the listing pages; a theme's page is
  // its ayaat, which "1 min read" got wrong by an hour), and on a page with its
  // own head it stood between the heading and the first line.
  "reading-time": (props) =>
    props.fileData.slug !== "index" &&
    !(props.fileData.slug ?? "").startsWith("tags/") &&
    !hasClass(props, "index-page") &&
    !drawsOwnHead(props),
  // The tag chips show keys (`story_adam`). A person's, a Name's and an
  // ayah's page name their themes in the note instead.
  "tag-chips": (props) => !hasClass(props, "profile") && !hasClass(props, "ayah"),
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
