# Workletjs - Angular Map Component Library

**Workletjs** is an **[Angular](https://angular.dev/)** map component library that provides seamless
integration with **[OpenLayers](https://openlayers.org/)**, enabling developers to create
interactive and customizable maps with ease.

This library developed under the
**[Nx monorepo](https://nx.dev/docs/getting-started/tutorials/angular-monorepo-tutorial)**
architecture and documented using **[NgDoc](https://ng-doc.com/)**.

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
pnpm build          # Build the ngx-openlayers library
pnpm build:docs     # Build the docs app
pnpm build:docs-preview # Build docs for the /preview/ path
pnpm lint           # Lint library and docs
pnpm test           # Run script, library, and docs tests
pnpm test:lib       # Run library tests only
pnpm test:docs      # Run docs tests only
pnpm test:scripts   # Run release, deployment, and dependency contract tests
```

### Documentation builds and engine fallback

The docs app uses the NgDoc 22.1 Vite engine. `pnpm build:docs` builds for `/`; the preview shortcut
builds for `/preview/`. For another deployment path, set `DOCS_BASE_HREF` with leading and trailing
slashes:

```bash
DOCS_BASE_HREF=/v22.0.1/ pnpm build:docs
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

Builds from the current source require the following peer dependencies:

- [`@angular/core`](https://angular.dev/): ~22.2.0
- [`@angular/cdk`](https://material.angular.dev/cdk): ~22.2.0
- [`ol`](https://openlayers.org/): ~10.11.0

Make sure these dependencies are installed in your project.

Text along paths requires `Intl.Segmenter`. Host applications supporting browsers without it must
provide a [polyfill](https://formatjs.github.io/docs/polyfills/intl-segmenter/).

The source package version remains `22.0.1`; the Angular 22.2 and OpenLayers 10.11 upgrades have not
been released. Previously published packages retain their original peer dependencies: the published
`22.0.x` series requires Angular Core and CDK `~22.0.0` and OpenLayers `~10.9.0`.

## 📦 Installation

For the current source build, use an Angular 22.2.x application and install matching peer
dependencies:

```bash
npm install 'ol@~10.11.0' '@angular/cdk@~22.2.0' --save
// or
yarn add 'ol@~10.11.0' '@angular/cdk@~22.2.0'
// or
pnpm add 'ol@~10.11.0' '@angular/cdk@~22.2.0'
```

To install a published release, use the commands below. Choose Angular, CDK and OpenLayers versions
from that release's peer dependencies instead of the current-source requirements above. Check them
with `npm view @workletjs/ngx-openlayers@<version> peerDependencies`.

```bash
npm install @workletjs/ngx-openlayers --save
// or
yarn add @workletjs/ngx-openlayers
// or
pnpm add @workletjs/ngx-openlayers
```

## 🔨 Usage

Import the component modules you want to use into your component.

```ts
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';

@Component({
  imports: [WolMapModule, WolViewModule],
})
export class AppComponent {}
```

And import style file link in angular.json.

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
    <wol-map>
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
