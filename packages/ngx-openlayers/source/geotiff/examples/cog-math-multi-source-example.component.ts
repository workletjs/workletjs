import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  signal,
  viewChild,
} from '@angular/core';
import { WolWebGLTileLayerModule } from '@workletjs/ngx-openlayers/layer/webgl-tile';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import {
  WolGeoTIFFSourceComponent,
  WolGeoTIFFSourceModule,
} from '@workletjs/ngx-openlayers/source/geotiff';
import { Style } from 'ol/layer/WebGLTile';
import { ViewOptions } from 'ol/View';

@Component({
  selector: 'wol-cog-math-multi-source-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WolMapModule, WolWebGLTileLayerModule, WolGeoTIFFSourceModule],
  template: `
    <wol-map class="h-96" [wolView]="viewOptions()">
      <wol-webgl-tile-layer [wolStyle]="style">
        <wol-geotiff-source
          [wolAttributions]="attributions"
          [wolSources]="[
            {
              url: 'https://s2downloads.eox.at/demo/Sentinel-2/3857/R10m.tif',
              bands: [3, 4],
              min: 0,
              nodata: 0,
              max: 65535,
            },
            {
              url: 'https://s2downloads.eox.at/demo/Sentinel-2/3857/R60m.tif',
              bands: [9],
              min: 0,
              nodata: 0,
              max: 65535,
            },
          ]"
        />
      </wol-webgl-tile-layer>
    </wol-map>
  `,
})
export class WolCOGMathMultiSourceExampleComponent {
  readonly attributions =
    `<a href='https://s2maps.eu'>Sentinel-2 cloudless</a> ` +
    `by <a href='https://eox.at/'>EOX IT Services GmbH</a> ` +
    `(Contains modified Copernicus Sentinel data 2019)`;
  readonly ndvi = ['/', ['-', ['band', 2], ['band', 1]], ['+', ['band', 2], ['band', 1]]];
  readonly ndwi = ['/', ['-', ['band', 3], ['band', 1]], ['+', ['band', 3], ['band', 1]]];
  readonly style: Style = {
    color: [
      'color',
      // red: | NDVI - NDWI |
      ['*', 255, ['abs', ['-', this.ndvi, this.ndwi]]],
      // green: NDVI
      ['*', 255, this.ndvi],
      // blue: NDWI
      ['*', 255, this.ndwi],
      // alpha
      ['band', 4],
    ],
  };
  readonly viewOptions = signal<Promise<ViewOptions> | undefined>(undefined);
  readonly geotiffRef = viewChild.required(WolGeoTIFFSourceComponent);

  constructor() {
    afterNextRender(() => {
      const geotiff = this.geotiffRef().getInstance();
      this.viewOptions.set(geotiff?.getView());
    });
  }
}
