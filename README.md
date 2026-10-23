# Workletjs - Angular Map Component Library

**Workletjs** is an **[Angular](https://angular.dev/)** map component library that provides seamless
integration with **[OpenLayers](https://openlayers.org/)**, enabling developers to create
interactive and customizable maps with ease.

This library developed under the
**[Nx monorepo](https://nx.dev/docs/getting-started/tutorials/angular-monorepo-tutorial)**
architecture and documented using **[NgDoc](https://ng-doc.com/)**.

Read the documentation: [Installation](https://workletjs.github.io/get-started/installation),
[First Map](https://workletjs.github.io/get-started/first-map),
[Component Usage](https://workletjs.github.io/development/component-usage), and
[Compatibility](https://workletjs.github.io/reference/compatibility).

---

## 🚀 Features

- 📌 Built on [OpenLayers](https://openlayers.org/) - high-performance mapping engine
- 🧱 Componentized architecture for interactive map development
- 🧩 Built with [Nx](https://nx.dev) for scalable multi-project workspace
- 📘 Component documentation powered by [NgDoc](https://ngdoc.io/)
- 🧪 Testable and maintainable design
- 🌐 Ideal for multi-layer visualization, spatial analysis, and geospatial applications

## 🛠 Development Commands

To develop this workspace, use Node.js `>=24.15.0 <25` and pnpm `10.34.5`. CI uses Node.js 24.
Install the lockfile-defined dependencies before running the root workspace scripts:

```bash
pnpm install --frozen-lockfile
```

```bash
pnpm start          # Serve the docs app locally
pnpm build          # Build the library and bundled schematics
pnpm build:docs     # Build the docs app
pnpm build:docs-preview # Build docs for the /preview/ path
pnpm lint           # Lint library, docs, and schematics
pnpm test           # Run script, library, schematics, and docs tests
pnpm test:lib       # Run library and compiled-collection schematics tests
pnpm test:docs      # Run docs tests only
pnpm test:scripts   # Run release, deployment, and dependency contract tests
pnpm format         # Format library, docs, and schematics
pnpm format:check   # Check formatting for all three projects
pnpm exec nx build schematics # Build the private collection independently
pnpm exec nx test schematics  # Run the collection Node Vitest suite
pnpm exec nx lint schematics  # Lint the internal project
```

The private Nx project `schematics` (`@workletjs/schematics`) is bundled with the library; it is not
published separately.

### Documentation builds and engine fallback

The docs app uses the NgDoc 22.1 Vite engine. `pnpm build:docs` builds for `/`; the preview shortcut
builds for `/preview/`. For another deployment path, set `DOCS_BASE_HREF` with leading and trailing
slashes:

```bash
DOCS_BASE_HREF=/v22.2.0/ pnpm build:docs
```

The output is `dist/apps/docs/browser`. The deployment workflows copy `index.html` to `404.html` for
GitHub Pages deep-link fallback. PR checks build both the library and the production docs. Nx
caching is disabled for docs builds so that changing the environment cannot reuse the previous
deployment path; NgDoc's own content cache remains enabled.

The official migration retains the legacy targets with a separate generated-content folder:

```bash
pnpm exec nx run docs:build-legacy
pnpm exec nx run docs:serve-legacy
```

Both engines use the same browser output folder, so run them one at a time. The legacy builder uses
`--base-href` for subpath builds; `DOCS_BASE_HREF` applies to the Vite engine. Angular size budgets
remain on the legacy target; the Vite engine does not enforce them.

To restore the legacy `build` and `serve` targets, first commit local changes and preview the
[official engine revert](https://ng-doc.com/docs/upgrade/migrate-to-the-new-engine/#roll-back) using
the docs workspace's installed schematic collection:

```bash
pnpm exec nx g \
  "$PWD/apps/docs/node_modules/@ng-doc/builder/schematics/collection.json:migrate-to-vite" \
  --project docs --revert --dry-run
```

Then run the same command without `--dry-run`. Keep `.ng-doc-migration/docs/`, including its
original state and backups, committed until engine rollback is no longer needed. The revert restores
the original targets, removes unchanged files created by the schematic, and cleans both
generated-content folders and the engine cache. Edited generated configuration files may remain;
dependencies and the later application, test, and deployment changes remain as well. After an engine
revert, build preview with `pnpm exec nx build docs --base-href=/preview/` and supply `--base-href`
for version subpaths, or revert the deployment commits to restore the old shortcuts. Use Git to undo
the complete upgrade, including dependencies and deployment changes. The
[migration report](.ng-doc-migration/docs/report.md) records the manual adjustments and rollback
boundary.

---

## 🛠 Prerequisites

Version `22.2.0` requires the following peer dependencies:

- [`@angular/core`](https://angular.dev/): ~22.2.0
- [`@angular/cdk`](https://material.angular.dev/cdk): ~22.2.0
- [`ol`](https://openlayers.org/): ~10.11.0

Make sure these dependencies are installed in your project.

Text along paths requires `Intl.Segmenter`. Host applications supporting browsers without it must
provide a [polyfill](https://formatjs.github.io/docs/polyfills/intl-segmenter/).

Earlier `22.0.x` releases retain their original peer dependencies: Angular Core and CDK `~22.0.0`
and OpenLayers `~10.9.0`. Check the peer dependencies of the version you install.

## Angular CLI setup

The Angular CLI collection introduced in `22.2.0` supports **Angular CLI 22.2.x standard
workspaces**. Earlier `22.0.x` packages do not contain this collection. Nx host workspaces are
outside this collection's support.

Run from an existing Angular workspace:

```bash
ng add @workletjs/ngx-openlayers@22.2.0 --project my-app
```

The command saves the library as an application dependency, adds missing compatible CDK and
OpenLayers dependencies, and configures OpenLayers global CSS. It preserves compatible dependency
declarations and reports conflicts instead of upgrading Angular. Requirements come from the
installed library's peer dependencies, including when you install a local package build.

An interactive prompt asks whether to generate a **map example**, defaulting to **No**. Explicit
`--example` or `--no-example` skips that prompt; non-interactive runs also default to no example.

```bash
ng add @workletjs/ngx-openlayers@22.2.0 --project my-app --no-example
ng add @workletjs/ngx-openlayers@22.2.0 --project my-app --example
ng add @workletjs/ngx-openlayers@22.2.0 --project my-app --example --example-name demo-map --route demo
```

The default example is `map-example` at `/map`; the customized example above is available at
`/demo`. It uses public standalone components, an OSM tile layer, a `[0, 0]` center, zoom `2`, a
`400px` map height, and keyboard focus. Existing root templates and home pages are preserved. Its
lazy route is inserted first while retaining the relative order of existing routes.

### Create a map application

In an existing workspace with `@workletjs/ngx-openlayers@22.2.0` installed, generate a **map
application template**:

```bash
ng generate @workletjs/ngx-openlayers:application map-app
ng generate @workletjs/ngx-openlayers:application city-map --project-root apps/city-map --example-name city-view --route explore
ng serve city-map
```

The official Angular application generator creates the base application. The template uses
standalone, zoneless, CSS, Router, and Vitest, without SSR. Its home page redirects to `/map`, or
`/explore` in the customized example above. Existing workspace defaults do not override these fixed
template choices.

### Options

| Option                       | Command       | Default / behavior                                                                          |
| ---------------------------- | ------------- | ------------------------------------------------------------------------------------------- |
| `<name>`                     | `application` | Required application name; follows Angular's validation.                                    |
| `--project`                  | `ng add`      | Current CLI directory's application, or the only application; otherwise specify explicitly. |
| `--example` / `--no-example` | `ng add`      | Interactive confirmation, default No; false in non-interactive runs.                        |
| `--example-name`             | Both          | `map-example`; one lowercase kebab-case segment.                                            |
| `--route`                    | Both          | `map`; one lowercase kebab-case segment, without a leading slash.                           |
| `--project-root`             | `application` | Uses the official generator's workspace location convention.                                |
| `--skip-install`             | Both          | `false`; skips the schematic's follow-up dependency installation.                           |

Names and routes start with a lowercase letter and contain lowercase letters, digits, and single
hyphens separating nonempty segments. Nested paths, route parameters, wildcards, and query strings
are not accepted. `--example-name` and `--route` only affect `ng add` when the example is enabled.
`--skip-install` does not skip Angular CLI's installation of the library itself.

### Requirements and errors

Automatic examples require an existing standalone application with Router and a primary outlet in
its root component. NgModule applications and apps without routing can use the dependency and style
setup with `--no-example`. The schematic does not add Router or rewrite the root template.

Static route arrays may be inline, in a local variable, or directly imported from a relative module.
Dynamic configuration, spread arrays, path aliases, and indirect configuration composition are
rejected with guidance for manual setup. The application generator creates its own Router and
outlet, so these existing-app conditions do not require manual setup for new applications.

| Error                                                                | What to do                                                                                                                                                                |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Several candidate applications                                       | Retry with `--project <application>`.                                                                                                                                     |
| Incompatible dependency                                              | Use versions satisfying the installed library's peer dependencies, then retry. For local/tag/non-semver declarations, install first so the actual version can be checked. |
| Missing Router/outlet, NgModule, or unsupported static configuration | Use `--no-example` and follow the manual setup below, or adjust the standalone application's static routing configuration before retrying.                                |
| Existing route, conflicting file, or partial example                 | Choose a different valid name/path, or resolve the existing state manually; user files are not overwritten.                                                               |

Repeating the same successful setup does not duplicate styles, routes, or files, and preserves edits
to an already complete example. Requesting a different route for the same component does not create
an alias. Validation completes before schematic Tree edits are applied; it does not roll back the
library installation Angular CLI may already have performed.

The collection follows the
[official Angular library schematics workflow](https://angular.dev/tools/cli/schematics-for-libraries).

## 📦 Manual Installation

For version `22.2.0`, use an Angular 22.2.x application and install the library with compatible peer
dependencies:

```bash
npm install @workletjs/ngx-openlayers@22.2.0 'ol@~10.11.0' '@angular/cdk@~22.2.0' --save
# or
yarn add @workletjs/ngx-openlayers@22.2.0 'ol@~10.11.0' '@angular/cdk@~22.2.0'
# or
pnpm add @workletjs/ngx-openlayers@22.2.0 'ol@~10.11.0' '@angular/cdk@~22.2.0'
```

For another library version, choose Angular, CDK and OpenLayers versions from that release's peer
dependencies. Check them with `npm view @workletjs/ngx-openlayers@<version> peerDependencies`.

## 🔨 Usage

For manual setup, import the component modules you want to use into your component.

```ts
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';

@Component({
  imports: [WolMapModule, WolViewModule],
})
export class AppComponent {}
```

For manual setup, add the OpenLayers CSS to `angular.json`. The schematic already configures it.

```diff
{
  "styles": [
+    "node_modules/ol/ol.css"
  ]
}
```

## ✨ Example

Here is a simple map with an OSM source.

```ts
import { Component } from '@angular/core';

import { WolTileLayerModule } from '@workletjs/ngx-openlayers/layer/tile';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolOSMSourceModule } from '@workletjs/ngx-openlayers/source/osm';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';

@Component({
  selector: 'app-root',
  imports: [WolMapModule, WolViewModule, WolTileLayerModule, WolOSMSourceModule],
  template: `
    <wol-map tabindex="0">
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="2" />
      <wol-tile-layer>
        <wol-osm-source />
      </wol-tile-layer>
    </wol-map>
  `,
  styles: `
    :host > wol-map {
      height: 400px;
    }
  `,
})
export class AppComponent {}
```

---

## 📖 Naming Conventions

- Component selector prefix: wol-\*

- Input property prefix: wol\* (e.g. wolControls, wolLayers)

- Output event prefix: wol\* (e.g. wolClick, wolViewChange)

## ☀️ License

[![GitHub license](https://img.shields.io/github/license/mashape/apistatus.svg?style=flat-square)](https://github.com/workletjs/workletjs/blob/master/LICENSE)
