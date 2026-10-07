# Cutover: Quartz out, Astro to the repo root

Phase 8 of `PLAN.md`. Destructive, so nothing here has been run. Do it on the `astro`
branch, in one commit, after the review of everything else. `main` is not touched;
merging is a separate decision.

## Before

- Phases 1 to 7 reviewed and committed on `astro`.
- `web/data/` is current: run `npm run import:vault` in `web/` on the latest vault
  sync, then `npm test`. After cutover the vault (`content/`) is gone, and the
  importer with it, so this is the last import from Obsidian.
- The generator either already writes `data/*.json` against `schemas/`, or will
  before the next content update.

## Steps

Run from the repo root.

1. Delete Quartz, its content and its tooling:

   ```bash
   git rm -r -q quartz quartz.ts quartz.config.yaml patches content assets-src globals.d.ts index.d.ts tsconfig.json package.json package-lock.json .prettierrc .prettierignore .npmrc .node-version
   ```

   `assets-src/Keffiyeh.svg` is the source of `web/public/keffiyeh.svg`; keep it if
   you want the original art in the repo (move it to `web/assets-src/` first).

2. Move the app up:

   ```bash
   git mv web/* web/.node-version web/.prettierrc web/.prettierignore .
   ```

   Then merge `web/.gitignore` into the root `.gitignore` (drop the Quartz entries:
   `/public`, `.quartz-cache`, `.quartz/`, `.obsidian`, `tsconfig.tsbuildinfo`) and
   remove `web/`.

3. Remove the importer, which reads a vault that no longer exists:

   ```bash
   git rm scripts/import-vault.ts
   npm pkg delete scripts.import:vault devDependencies.yaml
   ```

4. CI: in `.github/workflows/web.yml`, drop the `paths` filters, the
   `working-directory: web` default, and the `web/` prefix on `.node-version`,
   `package-lock.json` and `test-results`.

5. Docs: replace the root `CLAUDE.md` and `README.md` with `web/CLAUDE.md` and
   `web/README.md`, dropping their "until cutover" notes and the `import:vault` rows.

6. `.claude/launch.json`: drop `--prefix web` from both configurations.

7. Check from a clean tree:

   ```bash
   rm -rf node_modules dist && npm ci && npm run check && npm test && npm run build && npm run test:e2e
   ```

## Cloudflare Pages

In the Pages project settings, Builds:

```
Root directory:     (blank)
Build command:      npm run build
Build output dir:   dist
```

Node 22 still comes from `.node-version`. The custom domain, the IONOS `CNAME`, Web
Analytics and the feedback Worker do not change.

## Old URLs

The Quartz URLs (`/1-The-Opener/1_1`, `/tags/kufr` and the like) are not redirected.
The site has not launched, so nothing links to them. If that changes before cutover,
add a `public/_redirects` file mapping the old patterns to the new routes.
