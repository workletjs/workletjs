import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WolTileLayerModule } from '@workletjs/ngx-openlayers/layer/tile';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';
import { WolOSMSourceModule } from '@workletjs/ngx-openlayers/source/osm';
import { WolTileWMSSourceModule } from '@workletjs/ngx-openlayers/source/tile-wms';

@Component({
  selector: 'wol-tiled-wms-wrapping-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    WolMapModule,
    WolViewModule,
    WolTileLayerModule,
    WolOSMSourceModule,
    WolTileWMSSourceModule,
  ],
  template: `
    <wol-map class="h-96">
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="1" />
      <wol-tile-layer>
        <wol-osm-source />
      </wol-tile-layer>
      <wol-tile-layer>
        <wol-tile-wms-source
          [wolUrl]="'https://ahocevar.com/geoserver/ne/wms'"
          [wolParams]="{ LAYERS: 'ne:ne_10m_admin_0_countries', TILED: true }"
          [wolServerType]="'geoserver'"
        />
      </wol-tile-layer>
    </wol-map>
  `,
})
export class WolTiledWMSWrappingExampleComponent {}
