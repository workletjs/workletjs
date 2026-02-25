This guide will help you get started with `@workletjs/ngx-openlayers` in your Angular project.

## Prerequisites

This library depends on the following peer dependencies:

- `@angular/cdk`: ^20.2.0
- `ol`: ^10.6.1

Make sure these dependencies are installed in your project.

## Installation

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
