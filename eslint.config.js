import js from "@eslint/js"
import astro from "eslint-plugin-astro"
import { defineConfig } from "eslint/config"
import globals from "globals"
import tseslint from "typescript-eslint"

export default defineConfig(
  { ignores: ["dist/", ".astro/", "data/"] },
  js.configs.recommended,
  tseslint.configs.strict,
  astro.configs.recommended,
  { languageOptions: { globals: { ...globals.node, ...globals.browser } } },
  {
    // `!` marks lookups that can't miss: an element in the component's own markup, a
    // capture group right after its regex matched, an id the data tests guarantee.
    // The strictest tsconfig (noUncheckedIndexedAccess) would otherwise demand a
    // dead branch at each one.
    rules: { "@typescript-eslint/no-non-null-assertion": "off" },
  },
)
