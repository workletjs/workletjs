import {
  ChangeDetectionStrategy,
  Component,
  Renderer2,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';

import MapBrowserEvent from 'ol/MapBrowserEvent';
import MVT from 'ol/format/MVT';

import { WolVectorTileLayerModule } from '@workletjs/ngx-openlayers/layer/vector-tile';
import { WolMapComponent, WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolVectorTileSourceModule } from '@workletjs/ngx-openlayers/source/vector-tile';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';

@Component({
  selector: 'wol-vector-tile-info-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WolMapModule, WolViewModule, WolVectorTileLayerModule, WolVectorTileSourceModule],
  template: `
    <wol-map class="h-96" (wolPointerMove)="onPointerMove($event)">
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="2" />
      <wol-vector-tile-layer>
        <wol-vector-tile-source [wolFormat]="format" [wolUrl]="url" />
      </wol-vector-tile-layer>
      <div
        class="pointer-events-none absolute bottom-0 left-0 z-1 max-h-96 overflow-x-auto bg-sky-700/60 text-white opacity-0 transition-opacity duration-100 ease-in"
        [class.opacity-100]="featureInfo() !== null"
      >
        <pre>{{ featureInfo() }}</pre>
      </div>
    </wol-map>
  `,
})
export class WolVectorTileInfoExampleComponent {
  readonly format = new MVT();
  readonly url =
    'https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer/tile/{z}/{y}/{x}.pbf';

  readonly featureInfo = signal<string | null>(null);

  private readonly mapRef = viewChild.required(WolMapComponent);
  private readonly renderer = inject(Renderer2);

  constructor() {
    afterNextRender(() => {
      const map = this.mapRef().getInstance();

      if (!map) {
        return;
      }

      this.renderer.listen(map.getViewport(), 'pointerleave', (evt) => {
        this.showInfo(evt);
      });
    });
  }

  onPointerMove(evt: MapBrowserEvent<PointerEvent>): void {
    if (evt.dragging) {
      return;
    }
    this.showInfo(evt);
  }

  showInfo(evt: MapBrowserEvent<PointerEvent>): void {
    const map = this.mapRef().getInstance();

    if (!map) {
      return;
    }

    const features = evt.type === 'pointerleave' ? [] : map.getFeaturesAtPixel(evt.pixel);

    if (features.length == 0) {
      this.featureInfo.set(null);
      return;
    }

    const properties = features[0].getProperties();
    this.featureInfo.set(JSON.stringify(properties, null, 2));
  }
}
