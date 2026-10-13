# NgDoc migration to the Vite engine: docs

## Changes

- Target `build` runs the Vite engine; the original is kept as `build-legacy`.
- Target `serve` runs the Vite engine; the original is kept as `serve-legacy`.
- Created `apps/docs/ng-doc.config.legacy.ts`.
- Created `apps/docs/tsconfig.app.legacy.json`.
- Created `apps/docs/vite.ng-doc.config.mjs`.
- Changed `.gitignore`.
- `build-legacy` and `serve-legacy` write their generated files to `ng-doc-legacy/ng-doc/docs` (added to `.gitignore`), so the legacy builders and the Vite engine never share a generated folder.
- `vite` is `catalog:testing` (installed `7.3.1`); the Vite engine requires `^8.3.0` and does not start with another version. Update it: `npm i -D vite@^8.3.0`.

## Migrated

These options and settings moved to the Vite configuration or the new targets:

- `build.browser`: `browser: 'apps/docs/src/main.ts'` of createNgDocApplicationPlugin.
- `build.index`: Vite `root`: `apps/docs/src`.
- `build.polyfills`: `polyfills` of createNgDocApplicationPlugin.
- `build.styles`: `styles` of createNgDocApplicationPlugin.
- `build.assets`: `assets` of createNgDocApplicationPlugin.
- `build.inlineStyleLanguage`: `inlineStylesExtension: 'scss'` of createNgDocAngularPlugins.
- `build.outputPath`: `outputPath` of the vite-application target.
- `build.tsConfig`: `tsconfig` of createNgDocAngularPlugins and the generator.
- `build.sourceMap`: Vite `build.sourcemap`.
- `ngDoc.config`: `generator.configFile`: `apps/docs/ng-doc.config.ts`.
- `serve.buildTarget`: Each serve configuration sets the Vite mode of its build configuration.
- `extract-i18n.buildTarget`: now `docs:build-legacy`, so the Angular builder keeps reading the original build options.

## Dropped

These have no effect under Vite, or Vite already behaves this way:

- `build.assets`: `ng-doc/docs/assets`: the NgDoc Vite plugin serves and emits the generated assets itself.
- `onlyForTags`: The Vite engine applies `onlyForTags` of pages and categories, with the Vite mode as the build tag (the legacy engine ignored it).
- `build.allowedCommonJsDependencies`: Vite has no CommonJS warning to silence.
- `build.budgets`: Vite has no size budgets.
- `build.extractLicenses`: Vite keeps license comments in its output.
- `build.optimization`: Every `vite build` is optimized, in every mode; use the development server for unoptimized code.
- `build.outputHashing`: Vite hashes the output file names by default.
- `tsconfig`: `@ng-doc/generated` keeps pointing at the generated folder, which the Vite engine writes.

## Next steps

1. Install the dependencies if the schematic did not (`npm install`).
2. Run `ng serve` and `ng build`, and compare the pages with the legacy build (`ng run docs:build-legacy`).
3. The Vite targets write `ng-doc/docs` and the `-legacy` targets `ng-doc-legacy/ng-doc/docs`, so you can switch between them without deleting anything.
4. Commit the changes, including this folder if you want to keep `--revert` available.

## Roll back

Run `ng g @ng-doc/builder:migrate-to-vite --project docs --revert`. It restores the
original targets and the changed files, and deletes the files it created unless you edited
them. It keeps the added dependencies. Your version control remains the primary way back.
