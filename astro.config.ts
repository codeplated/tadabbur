import sitemap from "@astrojs/sitemap"
import { defineConfig } from "astro/config"

export default defineConfig({
  site: "https://tadabbur.belambo.com",
  output: "static",
  trailingSlash: "always",
  // The feedback Worker accepts localhost:8080 as an origin.
  server: { port: 8080 },
  // Shared CSS and JS as cached files rather than repeated inline in 6,700 pages.
  build: { inlineStylesheets: "never" },
  vite: { build: { assetsInlineLimit: 0 } },
  integrations: [sitemap({ filter: (page) => !page.endsWith("/404/") })],
})
