import { ChangeDetectionStrategy, Component } from '@angular/core';

import { createLoader } from 'ol/source/wms';

import { WolImageLayerModule } from '@workletjs/ngx-openlayers/layer/image';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolImageSourceModule } from '@workletjs/ngx-openlayers/source/image';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';

@Component({
  selector: 'wol-mapserver-wms-example',
  imports: [WolMapModule, WolViewModule, WolImageLayerModule, WolImageSourceModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <wol-map class="h-96">
      <wol-view [wolProjection]="'EPSG:4326'" [wolCenter]="[0, 0]" [wolZoom]="2" />
      <wol-image-layer>
        <wol-image-source [wolLoader]="loader" />
      </wol-image-layer>
    </wol-map>
  `,
})
export class WolMapServerWMSExampleComponent {
  readonly loader = createLoader({
    url: 'https://demo.mapserver.org/cgi-bin/wms?',
    params: {
      LAYERS: ['bluemarble,country_bounds,cities'],
      VERSION: '1.3.0',
      FORMAT: 'image/png',
    },
    projection: 'EPSG:4326',
    // note serverType only needs to be set when hidpi is true
    hidpi: true,
    serverType: 'mapserver',
  });
}
