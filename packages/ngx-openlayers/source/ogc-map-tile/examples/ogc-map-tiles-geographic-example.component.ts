import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WolTileLayerModule } from '@workletjs/ngx-openlayers/layer/tile';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';
import { WolOGCMapTileSourceModule } from '@workletjs/ngx-openlayers/source/ogc-map-tile';

@Component({
  selector: 'wol-ogc-map-tiles-geographic-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WolMapModule, WolViewModule, WolTileLayerModule, WolOGCMapTileSourceModule],
  template: `
    <wol-map class="h-96">
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="1" [wolProjection]="'EPSG:4326'" />
      <wol-tile-layer>
        <wol-ogc-map-tile-source
          wolUrl="https://maps.gnosis.earth/ogcapi/collections/blueMarble/map/tiles/WorldCRS84Quad"
        />
      </wol-tile-layer>
    </wol-map>
  `,
})
export class WolOGCMapTilesGeographicExampleComponent {}
