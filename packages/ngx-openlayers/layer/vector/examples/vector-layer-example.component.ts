import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';

import { FeatureLike } from 'ol/Feature';
import MapBrowserEvent from 'ol/MapBrowserEvent';
import GeoJSON from 'ol/format/GeoJSON';

import {
  WolVectorLayerComponent,
  WolVectorLayerModule,
} from '@workletjs/ngx-openlayers/layer/vector';
import { WolMapComponent, WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolVectorSourceModule } from '@workletjs/ngx-openlayers/source/vector';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';

@Component({
  selector: 'wol-vector-layer-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WolMapModule, WolViewModule, WolVectorLayerModule, WolVectorSourceModule],
  template: `
    <wol-map
      class="h-96"
      (wolClick)="displayFeatureInfo($event)"
      (wolPointerMove)="displayFeatureInfo($event)"
    >
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="1" />
      <wol-vector-layer
        [wolBackground]="'#1a2b39'"
        [wolStyle]="{
          'fill-color': ['string', ['get', 'COLOR'], '#eee'],
        }"
      >
        <wol-vector-source
          [wolUrl]="'https://openlayers.org/data/vector/ecoregions.json'"
          [wolFormat]="format"
        />
      </wol-vector-layer>
      <wol-vector-layer
        #featureOverlay
        [wolStyle]="{
          'stroke-color': 'rgba(255, 255, 255, 0.7)',
          'stroke-width': 2,
        }"
      >
        <wol-vector-source />
      </wol-vector-layer>
    </wol-map>
    <div class="mt-4 min-h-6">{{ ecoName() }}</div>
  `,
})
export class WolVectorLayerExampleComponent {
  readonly format = new GeoJSON();
  readonly ecoName = signal<string>('');

  private highlight?: FeatureLike;
  private readonly mapRef = viewChild.required(WolMapComponent);
  private readonly featureOverlayRef = viewChild.required('featureOverlay', {
    read: WolVectorLayerComponent,
  });

  displayFeatureInfo(evt: MapBrowserEvent<PointerEvent>): void {
    const map = this.mapRef().getInstance();
    const featureOverlay = this.featureOverlayRef().getInstance();

    if (evt.dragging || !map || !featureOverlay) {
      return;
    }

    const feature = map.forEachFeatureAtPixel(evt.pixel, (feature) => feature);

    if (feature) {
      this.ecoName.set(feature.get('ECO_NAME') || '');
    } else {
      this.ecoName.set('');
    }

    if (feature !== this.highlight) {
      if (this.highlight) {
        featureOverlay.getSource()?.removeFeature(this.highlight);
      }
      if (feature) {
        featureOverlay.getSource()?.addFeature(feature);
      }
      this.highlight = feature;
    }
  }
}
