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
  selector: 'wol-cloud-optimized-geotiff-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WolMapModule, WolWebGLTileLayerModule, WolGeoTIFFSourceModule],
  template: `
    <wol-map class="h-96" [wolView]="viewOptions()">
      <wol-webgl-tile-layer>
        <wol-geotiff-source
          [wolSources]="[
            {
              url: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/36/Q/WD/2020/7/S2A_36QWD_20200701_0_L2A/TCI.tif',
            },
          ]"
        />
      </wol-webgl-tile-layer>
    </wol-map>
  `,
})
export class WolCloudOptimizedGeoTIFFExampleComponent {
  readonly geotiffRef = viewChild.required(WolGeoTIFFSourceComponent);
  readonly viewOptions = signal<Promise<ViewOptions> | undefined>(undefined);

  constructor() {
    afterNextRender(() => {
      const geotiff = this.geotiffRef().getInstance();
      this.viewOptions.set(geotiff?.getView());
    });
  }
}
