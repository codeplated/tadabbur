/**
 * Full-page screenshots of the built site for design review.
 *
 *   npm run preview &   # serves dist/ on :8080
 *   npx tsx scripts/screenshots.ts [out-dir] [width] [path ...]
 */
import { chromium } from "@playwright/test"

const [out = "screenshots", width = "390", ...paths] = process.argv.slice(2)
const pages = paths.length
  ? paths
  : [
      "/",
      "/surahs/",
      "/2/",
      "/2/255/",
      "/themes/",
      "/themes/tawheed/",
      "/names/",
      "/names/allah/",
      "/people/",
      "/people/musa/",
      "/canvas/the-opener/",
      "/search/?q=mercy",
    ]

const browser = await chromium.launch()
const context = await browser.newContext({
  viewport: { width: Number(width), height: 844 },
  deviceScaleFactor: 1,
  colorScheme: (process.env.SCHEME as "light" | "dark" | undefined) ?? "light",
})
const page = await context.newPage()
for (const path of pages) {
  await page.goto(`http://localhost:8080${path}`, { waitUntil: "networkidle" })
  await page.evaluate(() => document.fonts.ready)
  const name = path.replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "") || "home"
  await page.screenshot({ path: `${out}/${width}-${name}.png`, fullPage: process.env.FULL !== "0" })
  console.log(`${out}/${width}-${name}.png`)
}
await browser.close()
