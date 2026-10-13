This guide will help you get started with `@workletjs/ngx-openlayers` in your Angular project.

## Prerequisites

Builds from the current source require the following peer dependencies:

- `@angular/core`: ~22.2.0
- `@angular/cdk`: ~22.2.0
- `ol`: ~10.9.0

Make sure these dependencies are installed in your project.

The source package version remains `22.0.1`; the Angular 22.2 upgrade has not been released.
Previously published `22.0.x` packages require Angular Core and CDK `~22.0.0`. See the Version
Compatibility Matrix in Introduction for historical releases.

## Installation

For the current source build, use an Angular 22.2.x application with OpenLayers `~10.9.0` and CDK
`~22.2.0`. The commands below install a published release from the registry. Choose Angular and CDK
versions from that release's peer dependencies, which you can check with
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

## Usage

Import the component modules you want to use into your component.

```typescript name="app.component.ts" icon="angular"
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';

@Component({
  imports: [WolMapModule, WolViewModule],
})
export class AppComponent {}
```

And import style file link in angular.json.

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
