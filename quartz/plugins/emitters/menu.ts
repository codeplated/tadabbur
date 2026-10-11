import { FullSlug } from "../../util/path"
import { buildMenu } from "../../util/menu"
import { QuartzEmitterPlugin } from "../types"
import { write } from "./helpers"

// The site menu's data: the sections, what each holds, and a surah's ayah
// numbers. About 150 KB for the whole site, fetched once and cached, where the
// explorer plugin built its tree from the 20 MB content index. See
// quartz/util/menu.ts for how it is derived and components/SiteMenu.tsx for
// what reads it.
export const Menu: QuartzEmitterPlugin = () => ({
  name: "Menu",
  async *emit(ctx, content) {
    const menu = buildMenu(content.map(([, file]) => file.data))
    yield write({
      ctx,
      slug: "static/menu" as FullSlug,
      ext: ".json",
      content: JSON.stringify(menu),
    })
  },
  async *partialEmit(ctx, content) {
    const menu = buildMenu(content.map(([, file]) => file.data))
    yield write({
      ctx,
      slug: "static/menu" as FullSlug,
      ext: ".json",
      content: JSON.stringify(menu),
    })
  },
})
