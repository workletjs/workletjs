import { ChangeDetectionStrategy, Component } from '@angular/core';

import { WolTileLayerModule } from '@workletjs/ngx-openlayers/layer/tile';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolOSMSourceModule } from '@workletjs/ngx-openlayers/source/osm';
import { WolTileArcGISRestSourceModule } from '@workletjs/ngx-openlayers/source/tile-arcgis-rest';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';

@Component({
  selector: 'wol-arcgis-tiled-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    WolMapModule,
    WolViewModule,
    WolTileLayerModule,
    WolOSMSourceModule,
    WolTileArcGISRestSourceModule,
  ],
  template: `
    <wol-map class="h-96">
      <wol-view [wolCenter]="[-10997148, 4569099]" [wolZoom]="4" />
      <wol-tile-layer>
        <wol-osm-source />
      </wol-tile-layer>
      <wol-tile-layer [wolExtent]="[-13884991, 2870341, -7455066, 6338219]">
        <wol-tile-arcgis-rest-source [wolUrl]="url" />
      </wol-tile-layer>
    </wol-map>
  `,
})
export class WolArcGISTiledExampleComponent {
  readonly url = 'https://sampleserver6.arcgisonline.com/ArcGIS/rest/services/USA/MapServer';
}
