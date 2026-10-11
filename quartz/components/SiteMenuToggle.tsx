import { QuartzComponent, QuartzComponentConstructor } from "./types"

/**
 * The menu button of the phone's top bar: it opens the site menu
 * (SiteMenu.tsx) as a drawer. Its own component, first in the left sidebar, so
 * the Tab key reaches it where the eye does: before the site's name, not after
 * the search and theme buttons. Hidden where the menu is a permanent column.
 */
export default (() => {
  const SiteMenuToggle: QuartzComponent = () => (
    <button
      type="button"
      class="sm-toggle"
      aria-label="Menu"
      aria-expanded="false"
      aria-controls="site-menu"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 7h16M4 12h16M4 17h16" />
      </svg>
    </button>
  )

  return SiteMenuToggle
}) satisfies QuartzComponentConstructor
