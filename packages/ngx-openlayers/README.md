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

---

## 🛠 Prerequisites

This library depends on the following peer dependencies:

- [`@angular/core`](https://angular.dev/): ~22.0.0
- [`@angular/cdk`](https://material.angular.dev/cdk): ~22.0.0
- [`ol`](https://openlayers.org/): ~10.9.0

Make sure these dependencies are installed in your project.

## 📦 Installation

Install the peerDependencies.

```bash
npm install ol @angular/cdk --save
// or
yarn add ol @angular/cdk
// or
pnpm add ol @angular/cdk
```

Install this library.

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
