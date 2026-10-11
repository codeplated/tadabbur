import { buildMenu } from "../util/menu"
import { resolveRelative, FullSlug } from "../util/path"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

/**
 * The site's menu: its sections, each of which opens to a list of what it
 * holds. It replaced the explorer plugin, a file tree of every note.
 *
 * What is drawn here is all a reader with scripts off gets, and it is enough
 * to get anywhere: the sections, as links. The lists inside them, the surah's
 * ayah numbers, the mark on the page being read and the phone's drawer come
 * from scripts/siteMenu.inline.ts, which reads static/menu.json. The button
 * that opens it on a phone is SiteMenuToggle.tsx.
 *
 * Added to the left sidebar of every page type by loadQuartzLayout in
 * quartz/plugins/loader/config-loader.ts. Styling: "Site menu" in custom.scss.
 */
export default (() => {
  const SiteMenu: QuartzComponent = ({ fileData, allFiles }: QuartzComponentProps) => {
    const { sections } = buildMenu(allFiles)
    const here = fileData.slug as FullSlug

    return (
      <nav class="site-menu" id="site-menu" aria-label="Site">
        <ul class="sm-sections">
          {sections.map((section) => (
            <li class="sm-section" data-section={section.slug}>
              <div class="sm-head">
                <a
                  href={resolveRelative(here, `${section.slug}/index` as FullSlug)}
                  data-no-popover="true"
                >
                  {section.title}
                </a>
                <button
                  type="button"
                  class="sm-twist"
                  aria-label={`${section.title}: list`}
                  aria-expanded="false"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m9 6 6 6-6 6" />
                  </svg>
                </button>
              </div>
              <div class="sm-list" hidden></div>
            </li>
          ))}
        </ul>
      </nav>
    )
  }

  return SiteMenu
}) satisfies QuartzComponentConstructor
