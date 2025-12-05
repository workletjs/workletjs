import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { WolTileLayerModule } from '@workletjs/ngx-openlayers/layer/tile';
import {
  WolVectorLayerComponent,
  WolVectorLayerModule,
} from '@workletjs/ngx-openlayers/layer/vector';
import { WolMapComponent, WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';
import { WolClusterSourceModule } from '@workletjs/ngx-openlayers/source/cluster';
import { WolOSMSourceModule } from '@workletjs/ngx-openlayers/source/osm';
import { WolVectorSourceModule } from '@workletjs/ngx-openlayers/source/vector';
import Feature from 'ol/Feature';
import { Point } from 'ol/geom';
import CircleStyle from 'ol/style/Circle';
import Style, { StyleFunction } from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';
import Text from 'ol/style/Text';
import MapBrowserEvent from 'ol/MapBrowserEvent';
import { boundingExtent } from 'ol/extent';

@Component({
  selector: 'wol-clustered-features-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatSliderModule,
    WolMapModule,
    WolViewModule,
    WolTileLayerModule,
    WolVectorLayerModule,
    WolClusterSourceModule,
    WolOSMSourceModule,
    WolVectorSourceModule,
  ],
  template: `
    <wol-map class="h-96" (wolClick)="onClickMap($event)">
      <wol-view [wolZoom]="2" [wolCenter]="[0, 0]" />
      <wol-tile-layer>
        <wol-osm-source />
      </wol-tile-layer>
      <wol-vector-layer [wolStyle]="styleFn" #clusters>
        <wol-cluster-source [wolDistance]="distance()" [wolMinDistance]="minDistance()">
          <wol-vector-source [wolFeatures]="features" />
        </wol-cluster-source>
      </wol-vector-layer>
    </wol-map>
    <div class="mt-4 flex flex-col">
      <label>Cluster distance</label>
      <mat-slider [min]="0" [max]="200" [step]="1">
        <input matSliderThumb [(ngModel)]="distance" />
      </mat-slider>
      <small class="text-sm text-gray-500"
        >The distance within which features will be clustered together.</small
      >
    </div>
    <div class="mt-4 flex flex-col">
      <label>Minimum distance</label>
      <mat-slider [min]="0" [max]="200" [step]="1">
        <input matSliderThumb [(ngModel)]="minDistance" />
      </mat-slider>
      <small class="text-sm text-gray-500"
        >The minimum distance between clusters. Can't be larger than the configured distance.</small
      >
    </div>
  `,
})
export class WolClusteredFeaturesExampleComponent {
  private readonly mapRef = viewChild.required(WolMapComponent);
  private readonly clustersRef = viewChild.required('clusters', { read: WolVectorLayerComponent });

  readonly features: Feature<Point>[];
  readonly distance = signal(40);
  readonly minDistance = signal(20);

  readonly styleCache: Record<number, Style> = {};
  readonly styleFn: StyleFunction = (feature) => {
    const size = feature.get('features').length;
    let style = this.styleCache[size];
    if (!style) {
      style = new Style({
        image: new CircleStyle({
          radius: 10,
          stroke: new Stroke({
            color: '#fff',
          }),
          fill: new Fill({
            color: '#3399CC',
          }),
        }),
        text: new Text({
          text: size.toString(),
          fill: new Fill({
            color: '#fff',
          }),
        }),
      });
      this.styleCache[size] = style;
    }
    return style;
  };

  constructor() {
    const count = 20000;
    const features: Feature<Point>[] = new Array(count);
    const e = 4500000;

    for (let i = 0; i < count; ++i) {
      const coordinates = [2 * e * Math.random() - e, 2 * e * Math.random() - e];
      features[i] = new Feature(new Point(coordinates));
    }

    this.features = features;
  }

  onClickMap(evt: MapBrowserEvent<PointerEvent>): void {
    const map = this.mapRef().getInstance();
    const clusters = this.clustersRef().getInstance();

    if (evt.dragging || !map || !clusters) {
      return;
    }

    clusters.getFeatures(evt.pixel).then((clickedFeatures) => {
      if (clickedFeatures.length) {
        // Get clustered Coordinates
        const features = clickedFeatures[0].get('features') as Feature<Point>[];
        if (features.length > 1) {
          const extent = boundingExtent(
            features
              .map((r) => r.getGeometry()?.getCoordinates())
              .filter((coordinates) => !!coordinates),
          );
          map.getView().fit(extent, { duration: 1000, padding: [50, 50, 50, 50] });
        }
      }
    });
  }
}
