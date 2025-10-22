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
import { ViewOptions } from 'ol/View';

@Component({
  selector: 'wol-geotiff-with-overviews-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WolMapModule, WolWebGLTileLayerModule, WolGeoTIFFSourceModule],
  template: `
    <wol-map class="h-96" [wolView]="viewOptions()">
      <wol-webgl-tile-layer>
        <wol-geotiff-source
          [wolSources]="[
            {
              url: 'https://openlayers.org/data/raster/no-overviews.tif',
              overviews: ['https://openlayers.org/data/raster/no-overviews.tif.ovr'],
            },
          ]"
        />
      </wol-webgl-tile-layer>
    </wol-map>
  `,
})
export class WolGeoTIFFWithOverviewsExampleComponent {
  readonly geotiffRef = viewChild.required(WolGeoTIFFSourceComponent);
  readonly viewOptions = signal<Promise<ViewOptions> | undefined>(undefined);

  constructor() {
    afterNextRender(() => {
      const geotiff = this.geotiffRef().getInstance();
      this.viewOptions.set(geotiff?.getView());
    });
  }
}
