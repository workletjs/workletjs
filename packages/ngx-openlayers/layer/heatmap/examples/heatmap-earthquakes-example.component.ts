import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';
import { WolHeatmapLayerModule } from '@workletjs/ngx-openlayers/layer/heatmap';
import { WolStadiaMapsSourceModule } from '@workletjs/ngx-openlayers/source/stadia-maps';
import { WolTileLayerModule } from '@workletjs/ngx-openlayers/layer/tile';
import { WolVectorSourceModule } from '@workletjs/ngx-openlayers/source/vector';
import { WeightExpression } from 'ol/layer/Heatmap';
import KML from 'ol/format/KML';

@Component({
  selector: 'wol-heatmap-earthquakes-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatSliderModule,
    WolMapModule,
    WolViewModule,
    WolHeatmapLayerModule,
    WolTileLayerModule,
    WolStadiaMapsSourceModule,
    WolVectorSourceModule,
  ],
  template: `
    <wol-map class="h-96">
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="2" />
      <wol-tile-layer>
        <wol-stadia-maps-source wolLayer="stamen_toner" />
      </wol-tile-layer>
      <wol-heatmap-layer [wolBlur]="blur()" [wolRadius]="radius()" [wolWeight]="weight">
        <wol-vector-source [wolFormat]="format" [wolUrl]="url" />
      </wol-heatmap-layer>
    </wol-map>
    <div class="mt-4 flex items-center gap-4">
      <div class="flex items-center gap-2">
        <label>radius size:</label>
        <mat-slider min="1" max="50" step="1">
          <input matSliderThumb [(ngModel)]="radius" />
        </mat-slider>
      </div>
      <div class="flex items-center gap-2">
        <label>blur size:</label>
        <mat-slider min="1" max="50" step="1">
          <input matSliderThumb [(ngModel)]="blur" />
        </mat-slider>
      </div>
    </div>
  `,
})
export class WolHeatmapEarthquakesExampleComponent {
  readonly blur = signal(15);
  readonly radius = signal(5);
  readonly weight: WeightExpression = (feature) => {
    // 2012_Earthquakes_Mag5.kml stores the magnitude of each earthquake in a
    // standards-violating <magnitude> tag in each Placemark.  We extract it from
    // the Placemark's name instead.
    const name = feature.get('name');
    const magnitude = parseFloat(name.substr(2));
    return magnitude - 5;
  };
  readonly format = new KML({ extractStyles: false });
  readonly url = 'https://openlayers.org/en/latest/examples/data/kml/2012_Earthquakes_Mag5.kml';
}
