import { ChangeDetectionStrategy, Component, computed, signal, viewChild } from '@angular/core';

import MapBrowserEvent from 'ol/MapBrowserEvent';
import GeoJSON from 'ol/format/GeoJSON';
import { FlatStyleLike, StyleVariables } from 'ol/style/flat';

import { WolWebGLTileLayerModule } from '@workletjs/ngx-openlayers/layer/webgl-tile';
import { WolWebGLVectorLayerModule } from '@workletjs/ngx-openlayers/layer/webgl-vector';
import { WolMapComponent, WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolOSMSourceModule } from '@workletjs/ngx-openlayers/source/osm';
import { WolVectorSourceModule } from '@workletjs/ngx-openlayers/source/vector';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';

@Component({
  selector: 'wol-webgl-vector-layer-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    WolMapModule,
    WolViewModule,
    WolWebGLTileLayerModule,
    WolWebGLVectorLayerModule,
    WolOSMSourceModule,
    WolVectorSourceModule,
  ],
  template: `
    <wol-map
      class="h-96"
      (wolPointerMove)="displayFeatureInfo($event)"
      (wolClick)="displayFeatureInfo($event)"
    >
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="1" />
      <wol-webgl-tile-layer>
        <wol-osm-source />
      </wol-webgl-tile-layer>
      <wol-webgl-vector-layer [wolStyle]="style" [wolVariables]="variables()">
        <wol-vector-source
          [wolFormat]="format"
          [wolUrl]="'https://openlayers.org/data/vector/ecoregions.json'"
        />
      </wol-webgl-vector-layer>
    </wol-map>
    <div class="mt-4 min-h-6">{{ ecoName() }}</div>
  `,
})
export class WolWebGLVectorLayerExampleComponent {
  readonly format = new GeoJSON();
  readonly style: FlatStyleLike = [
    {
      filter: ['==', ['var', 'highlightedId'], ['id']],
      style: {
        'stroke-color': 'white',
        'stroke-width': 3,
        'stroke-offset': -1,
        'fill-color': [255, 255, 255, 0.4],
      },
    },
    {
      else: true,
      style: {
        'stroke-color': ['*', ['get', 'COLOR'], [220, 220, 220]],
        'stroke-width': 2,
        'stroke-offset': -1,
        'fill-color': ['*', ['get', 'COLOR'], [255, 255, 255, 0.6]],
      },
    },
  ];
  readonly ecoName = signal('');
  readonly highlightedId = signal<string | number>(-1);
  readonly variables = computed<StyleVariables>(() => ({ highlightedId: this.highlightedId() }));

  private readonly mapRef = viewChild.required(WolMapComponent);

  displayFeatureInfo(evt: MapBrowserEvent<PointerEvent>): void {
    const map = this.mapRef().getInstance();

    if (evt.dragging || !map) {
      return;
    }

    const feature = map.forEachFeatureAtPixel(evt.pixel, (feature) => feature);

    if (feature) {
      this.ecoName.set(feature.get('ECO_NAME') || '');
    } else {
      this.ecoName.set('');
    }

    const id = feature?.getId() ?? -1;

    if (id !== this.highlightedId()) {
      this.highlightedId.set(id);
    }
  }
}
