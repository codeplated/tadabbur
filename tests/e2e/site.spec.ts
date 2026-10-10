import { expect, test } from "@playwright/test"

test("go-to box opens an ayah", async ({ page }) => {
  await page.goto("/")
  await page.getByLabel("Go to a surah or ayah").fill("2:255")
  await page.getByRole("button", { name: "Go", exact: true }).click()
  await expect(page).toHaveURL(/\/2\/255\/$/)
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Ayah 255")
})

test("an ayah page has its recitation and neighbours", async ({ page }) => {
  await page.goto("/2/255/")
  await expect(page.locator("audio#recitation")).toHaveAttribute(
    "src",
    "https://cdn.islamic.app/quran/audio/ar.alafasy/262.mp3",
  )
  await expect(page.locator('a[rel="prev"]')).toHaveAttribute("href", "/2/254/")
  await expect(page.locator('a[rel="next"]')).toHaveAttribute("href", "/2/256/")
})

test("arrow keys step between ayaat", async ({ page, isMobile }) => {
  test.skip(isMobile, "keyboard only")
  await page.goto("/2/255/")
  await page.keyboard.press("ArrowRight")
  await expect(page).toHaveURL(/\/2\/256\/$/)
})

test("the last ayah of a surah leads into the next surah", async ({ page }) => {
  await page.goto("/1/7/")
  await expect(page.locator('a[rel="next"]')).toHaveAttribute("href", "/2/1/")
})

test("reader preferences survive a reload", async ({ page }) => {
  await page.goto("/1/1/")
  await page.getByRole("button", { name: /reading settings/i }).click()
  await page.getByLabel("Urdu translation").uncheck()
  await page.reload()
  await expect(page.locator("html")).toHaveAttribute("data-hide-urdu", "")
  await expect(page.locator(".t-urdu").first()).toBeHidden()
})

test("search finds English, and Arabic typed without harakat", async ({ page }) => {
  await page.goto("/search/?q=mercy")
  await expect(page.locator("main .results li").first()).toBeVisible()

  await page.goto(`/search/?q=${encodeURIComponent("الرحمن")}`)
  await expect(page.locator("main .results")).toContainText("Ar-Rahman")
})

test("search filters by kind", async ({ page }) => {
  await page.goto("/search/?q=musa")
  await page.locator('main [data-kind="Personality"]').click()
  await expect(page.locator("main .results li").first()).toContainText(/Musa/)
})

test("a theme page groups ayaat by surah", async ({ page }) => {
  await page.goto("/themes/tawheed/")
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Tawheed")
  await expect(page.locator('a[href="/1/2/"]').first()).toBeVisible()
})

test("the canvas draws its cards and arrows", async ({ page }) => {
  await page.goto("/canvas/the-opener/")
  expect(await page.locator(".node.ayah").count()).toBeGreaterThan(3)
  expect(await page.locator(".edges path").count()).toBeGreaterThan(3)
})

test("an unknown address gets the 404 page", async ({ page }) => {
  const response = await page.goto("/no-such-page/")
  expect(response?.status()).toBe(404)
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
})
