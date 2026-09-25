import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

/**
 * Front page hero: the tagline, then a band of keffiyeh pattern. Renders only
 * on the index page, so content/index.md doesn't have to change.
 *
 * The pattern is quartz/static/keffiyeh.svg used as a CSS mask, tiled
 * horizontally, so its colour comes from the theme — see "Front page hero" in
 * custom.scss.
 */
export default (() => {
  const HomeHero: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
    if (fileData.slug !== "index") return null
    return (
      <div class="home-hero">
        <h1 class="home-hero-title">A structured Quran Knowledge Base</h1>
        <div class="home-hero-pattern" aria-hidden="true"></div>
      </div>
    )
  }

  return HomeHero
}) satisfies QuartzComponentConstructor
