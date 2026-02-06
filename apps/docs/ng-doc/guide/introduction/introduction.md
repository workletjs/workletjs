**Workletjs** is a powerful **[Angular](https://angular.dev/)** component library designed to provide a seamless and idiomatic integration with **[OpenLayers](https://openlayers.org/)**. It allows developers to build complex, interactive maps using declarative Angular components and directives, abstracting away much of the imperative boilerplate code typically associated with OpenLayers.

## What is Workletjs?

Workletjs serves as a bridge between the Angular framework and the OpenLayers mapping engine. Instead of manually creating `ol.Map`, `ol.View`, and `ol.layer.Tile` instances and managing their state, you can use Angular components like `<wol-map>`, `<wol-view>`, and `<wol-tile-layer>`.

This approach brings the full power of Angular's ecosystem—dependency injection, change detection, and lifecycle hooks—to your mapping applications.

## Key Features

- **Declarative Syntax**: Define your map structure using HTML templates.
- **Angular Native**: Built specifically for Angular, leveraging its core features.
- **OpenLayers Integration**: Full access to the robust capabilities of OpenLayers.
- **Componentized**: Modular components for maps, views, layers, sources, controls and interactions.
- **Type Safe**: Written in TypeScript with full type definitions.
- **Reactive**: Updates to Input properties automatically reflect on the map.

## Why Workletjs?

OpenLayers is a powerful library, but using it in an Angular application can often lead to verbose and imperative code that is hard to maintain. Workletjs solves this by wrapping OpenLayers constructs into Angular components.

### Comparison

**Without Workletjs (Imperative):**

```typescript {10,21-32} name="app.component.ts" icon="angular"
import { afterNextRender, Component } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';

@Component({
  selector: 'app-root',
  imports: [],
  template: `<div id="map" class="map"></div>`,
  styles: [`
    :host > .map {
      width: 100%;
      height: 100%;
    }
  `],
})
export class AppComponent {
  constructor() {
    afterNextRender(() => {
      const map = new Map({
        target: 'map',
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
        ],
        view: new View({
          center: [0, 0],
          zoom: 2,
        }),
      });
    });
  }
}
```

**With Workletjs (Declarative):**

```typescript {11-16} name="app.component.ts" icon="angular"
import { Component } from '@angular/core';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';
import { WolTileLayerModule } from '@workletjs/ngx-openlayers/layer/tile';
import { WolOSMSourceModule } from '@workletjs/ngx-openlayers/source/osm';

@Component({
  selector: 'app-root',
  imports: [],
  template: `
    <wol-map>
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="2"/>
      <wol-tile-layer>
        <wol-osm-source />
      </wol-tile-layer>
    </wol-map>
  `,
  styles: `
    :host > wol-map {
      width: 100%;
      height: 100%;
    }
  `,
})
export class AppComponent {}
```

## Architecture

Workletjs is developed using the **[Nx](https://nx.dev)** monorepo architecture, ensuring scalability and maintainability. It is organized into packages that can be used independently or together.

- **@workletjs/ngx-openlayers**: The core package containing all map components.

## Version Compatibility Matrix 

Workletjs | Angular | OpenLayers
---|---|---
<=0.7.0 | ^20.2.0 | ^10.6.1
~21.0.0 | ^21.0.9 | ^10.7.0


## License

Workletjs is open-source software licensed under the [MIT License](https://opensource.org/licenses/MIT).
