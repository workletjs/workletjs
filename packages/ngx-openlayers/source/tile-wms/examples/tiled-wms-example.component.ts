import { ChangeDetectionStrategy, Component } from '@angular/core';

import { WolWebGLTileLayerModule } from '@workletjs/ngx-openlayers/layer/webgl-tile';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolOSMSourceModule } from '@workletjs/ngx-openlayers/source/osm';
import { WolTileWMSSourceModule } from '@workletjs/ngx-openlayers/source/tile-wms';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';

@Component({
  selector: 'wol-tiled-wms-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    WolMapModule,
    WolViewModule,
    WolWebGLTileLayerModule,
    WolOSMSourceModule,
    WolTileWMSSourceModule,
  ],
  template: `
    <wol-map class="h-96">
      <wol-view [wolCenter]="[-10997148, 4569099]" [wolZoom]="4" />
      <wol-webgl-tile-layer>
        <wol-osm-source />
      </wol-webgl-tile-layer>
      <wol-webgl-tile-layer [wolExtent]="[-13884991, 2870341, -7455066, 6338219]">
        <wol-tile-wms-source
          [wolUrl]="'https://ahocevar.com/geoserver/wms'"
          [wolParams]="{ LAYERS: 'topp:states', TILED: true }"
          [wolServerType]="'geoserver'"
          [wolTransition]="0"
        />
      </wol-webgl-tile-layer>
    </wol-map>
  `,
})
export class WolTiledWMSExampleComponent {}
