import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

const pages = [
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

for (const path of pages) {
  test(`no serious accessibility problems on ${path}`, async ({ page }) => {
    await page.goto(path)
    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze()
    const serious = violations.filter((v) => v.impact === "serious" || v.impact === "critical")
    expect(
      serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`),
    ).toEqual([])
  })
}
