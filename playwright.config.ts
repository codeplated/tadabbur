import { defineConfig, devices } from "@playwright/test"

/** End-to-end tests run against the built site, the same files Cloudflare serves. */
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: "http://localhost:8080" },
  projects: [
    { name: "phone", use: { ...devices["Pixel 7"] } },
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    // --ignore-lock keeps it in the foreground; Astro backgrounds it under an agent.
    command: "npm run preview -- --ignore-lock",
    url: "http://localhost:8080/",
    reuseExistingServer: !process.env.CI,
  },
})
