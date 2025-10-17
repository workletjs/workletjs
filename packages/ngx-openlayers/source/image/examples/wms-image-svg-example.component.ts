import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WolImageLayerModule } from '@workletjs/ngx-openlayers/layer/image';
import { WolTileLayerModule } from '@workletjs/ngx-openlayers/layer/tile';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';
import { WolImageSourceModule } from '@workletjs/ngx-openlayers/source/image';
import { WolOSMSourceModule } from '@workletjs/ngx-openlayers/source/osm';
import { createLoader } from 'ol/source/wms';
import { load } from 'ol/Image';

@Component({
  selector: 'wol-wms-image-svg-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    WolMapModule,
    WolViewModule,
    WolImageLayerModule,
    WolTileLayerModule,
    WolImageSourceModule,
    WolOSMSourceModule,
  ],
  template: `
    <wol-map class="h-96">
      <wol-view [wolCenter]="[-10997148, 4569099]" [wolZoom]="4" />
      <wol-tile-layer>
        <wol-osm-source />
      </wol-tile-layer>
      <wol-image-layer>
        <wol-image-source [wolLoader]="loader" />
      </wol-image-layer>
    </wol-map>
  `,
})
export class WolWMSImageSVGExampleComponent {
  readonly loader = createLoader({
    url: 'https://ahocevar.com/geoserver/wms',
    params: { LAYERS: 'topp:states', FORMAT: 'image/svg+xml' },
    ratio: 1,
    load: load,
  });
}
