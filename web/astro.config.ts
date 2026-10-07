import sitemap from "@astrojs/sitemap"
import { defineConfig } from "astro/config"

export default defineConfig({
  site: "https://tadabbur.belambo.com",
  output: "static",
  trailingSlash: "always",
  integrations: [sitemap()],
})
