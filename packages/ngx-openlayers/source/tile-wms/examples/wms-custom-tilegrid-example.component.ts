import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WolTileLayerModule } from '@workletjs/ngx-openlayers/layer/tile';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';
import { WolOSMSourceModule } from '@workletjs/ngx-openlayers/source/osm';
import { WolTileWMSSourceModule } from '@workletjs/ngx-openlayers/source/tile-wms';
import { TileGrid } from 'ol/tilegrid';
import { get as getProjection } from 'ol/proj';
import { getWidth } from 'ol/extent';

@Component({
  selector: 'wol-wms-custom-tilegrid-example',
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
      <wol-view [wolCenter]="[-10997148, 4569099]" [wolZoom]="4" />
      <wol-tile-layer>
        <wol-osm-source />
      </wol-tile-layer>
      <wol-tile-layer [wolExtent]="[-13884991, 2870341, -7455066, 6338219]">
        <wol-tile-wms-source
          [wolUrl]="'https://ahocevar.com/geoserver/wms'"
          [wolParams]="{ LAYERS: 'topp:states', TILED: true }"
          [wolTileGrid]="tileGrid"
          [wolServerType]="'geoserver'"
        />
      </wol-tile-layer>
    </wol-map>
  `,
})
export class WolWMSCustomTileGridExampleComponent {
  readonly tileGrid: TileGrid;

  constructor() {
    const projection = getProjection('EPSG:3857');

    if (!projection) {
      throw new Error('Projection EPSG:3857 not found');
    }

    const projExtent = projection.getExtent();
    const startResolution = getWidth(projExtent) / 256;
    const resolutions = new Array(22);
    for (let i = 0, ii = resolutions.length; i < ii; ++i) {
      resolutions[i] = startResolution / Math.pow(2, i);
    }
    this.tileGrid = new TileGrid({
      extent: [-13884991, 2870341, -7455066, 6338219],
      resolutions: resolutions,
      tileSize: [512, 256],
    });
  }
}
