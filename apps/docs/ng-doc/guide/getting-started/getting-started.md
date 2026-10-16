This guide will help you get started with `@workletjs/ngx-openlayers` in your Angular project.

## Prerequisites

Builds from the current source require the following peer dependencies:

- `@angular/core`: ~22.2.0
- `@angular/cdk`: ~22.2.0
- `ol`: ~10.11.0

Make sure these dependencies are installed in your project.

The source package version remains `22.0.1`; the Angular 22.2 and OpenLayers 10.11 upgrades have not
been released. Previously published `22.0.x` packages require Angular Core and CDK `~22.0.0` and
OpenLayers `~10.9.0`. See the Version Compatibility Matrix in Introduction for historical releases.

## Angular CLI setup (current source)

These schematics support **Angular CLI 22.2.x standard workspaces**. Use a build or release that
contains this collection; these commands are not retroactively available in earlier published
`22.0.x` packages. Nx host workspaces are outside this first version's support.

Run from an existing Angular workspace:

```bash
ng add @workletjs/ngx-openlayers --project my-app
```

The command saves the library as an application dependency, adds missing compatible CDK and
OpenLayers dependencies, and configures OpenLayers global CSS. It preserves compatible dependency
declarations and reports conflicts instead of upgrading Angular. Requirements come from the
installed library's peer dependencies, including when you install a local package build.

An interactive prompt asks whether to generate a **map example**, defaulting to **No**. Explicit
`--example` or `--no-example` skips that prompt; non-interactive runs also default to no example.

```bash
ng add @workletjs/ngx-openlayers --project my-app --no-example
ng add @workletjs/ngx-openlayers --project my-app --example
ng add @workletjs/ngx-openlayers --project my-app --example --example-name demo-map --route demo
```

The default example is `map-example` at `/map`; the customized example above is available at
`/demo`. It uses public standalone components, an OSM tile layer, a `[0, 0]` center, zoom `2`, a
`400px` map height, and keyboard focus. Existing root templates and home pages are preserved. Its
lazy route is inserted first while retaining the relative order of existing routes.

### Create a map application

In an existing workspace that has this library installed, generate a **map application template**:

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

## Manual installation

For the current source build, use an Angular 22.2.x application with OpenLayers `~10.11.0` and CDK
`~22.2.0`. The commands below install a published release from the registry. Choose Angular, CDK and
OpenLayers versions from that release's peer dependencies, which you can check with
`npm view @workletjs/ngx-openlayers@<version> peerDependencies`.

```bash group="Installation" name="npm"
npm install ol @angular/cdk --save           # install the peerDependencies
npm install @workletjs/ngx-openlayers --save # install this library
```

```bash group="Installation" name="yarn"
yarn add ol @angular/cdk           # install the peerDependencies
yarn add @workletjs/ngx-openlayers # install this library
```

```bash group="Installation" name="pnpm"
pnpm add ol @angular/cdk           # install the peerDependencies
pnpm add @workletjs/ngx-openlayers # install this library
```

## Upgrading to OpenLayers 10.11

The current source adopts the upstream behavior changes in
[OpenLayers 10.10](https://github.com/openlayers/openlayers/releases/tag/v10.10.0) and
[OpenLayers 10.11](https://github.com/openlayers/openlayers/releases/tag/v10.11.0), while preserving
the existing Angular component API:

- Text drawn along a path requires `Intl.Segmenter`. If your application supports browsers without
  it, provide a [polyfill](https://formatjs.github.io/docs/polyfills/intl-segmenter/) in the host
  application; the component library does not include one.
- GeoJSON geometries with empty coordinate arrays are read as `null` geometries, except for
  `GeometryCollection`. Review any application handling of empty geometries.
- The `interpolate` style operator now mixes colors in sRGB on both Canvas and WebGL. Canvas
  gradients may change; use `interpolate-hcl` on Canvas to retain the previous gradient.
- WMTS capability parsing honors `TileMatrixSetLimits`. The tile grid extent comes only from an
  advertised `BoundingBox`, and `tileGrid.getExtent()` returns `null` without one. The first tile
  matrix determines world wrapping; override `wrapX: false` if a regional layer should stay in one
  world copy.
- OpenLayers has deprecated its BingMaps source. The existing BingMaps component remains available;
  plan a service migration using the upstream guidance.

## Usage

For manual setup, import the component modules you want to use into your component.

```typescript name="app.component.ts" icon="angular"
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';

@Component({
  imports: [WolMapModule, WolViewModule],
})
export class AppComponent {}
```

For manual setup, add the OpenLayers CSS to `angular.json`. The schematic already configures it.

```diff name="angular.json"
{
  "styles": [
+    "node_modules/ol/ol.css"
  ]
}
```

## Example

Here is a simple map with an OSM source.

```typescript name="app.component.ts" icon="angular"
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
