import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WolImageLayerModule } from '@workletjs/ngx-openlayers/layer/image';
import { WolTileLayerModule } from '@workletjs/ngx-openlayers/layer/tile';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';
import { WolOSMSourceModule } from '@workletjs/ngx-openlayers/source/osm';
import { WolImageWMSSourceModule } from '@workletjs/ngx-openlayers/source/image-wms';

@Component({
  selector: 'wol-single-image-wms-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    WolMapModule,
    WolViewModule,
    WolTileLayerModule,
    WolImageLayerModule,
    WolOSMSourceModule,
    WolImageWMSSourceModule,
  ],
  template: `
    <wol-map class="h-96">
      <wol-view [wolCenter]="[-10997148, 4569099]" [wolZoom]="4" />
      <wol-tile-layer>
        <wol-osm-source />
      </wol-tile-layer>
      <wol-image-layer [wolExtent]="[-13884991, 2870341, -7455066, 6338219]">
        <wol-image-wms-source
          [wolUrl]="'https://ahocevar.com/geoserver/wms'"
          [wolParams]="{ LAYERS: 'topp:states' }"
          [wolRatio]="1"
          [wolServerType]="'geoserver'"
        />
      </wol-image-layer>
    </wol-map>
  `,
})
export class WolSingleImageWMSExampleComponent {}
