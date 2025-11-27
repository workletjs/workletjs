import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WolTileLayerModule } from '@workletjs/ngx-openlayers/layer/tile';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';
import { WolOSMSourceModule } from '@workletjs/ngx-openlayers/source/osm';
import { WolWMTSSourceModule } from '@workletjs/ngx-openlayers/source/wmts';
import { get as getProjection, ProjectionLike } from 'ol/proj';
import { Extent, getTopLeft, getWidth } from 'ol/extent';
import WMTSTileGrid from 'ol/tilegrid/WMTS';

@Component({
  selector: 'wol-wmts-source-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    WolMapModule,
    WolViewModule,
    WolTileLayerModule,
    WolOSMSourceModule,
    WolWMTSSourceModule,
  ],
  template: `
    <wol-map class="h-96">
      <wol-view [wolCenter]="[-11158582, 4813697]" [wolZoom]="4" />
      <wol-tile-layer>
        <wol-osm-source />
      </wol-tile-layer>
      <wol-tile-layer [wolOpacity]="0.7">
        <wol-wmts-source
          [wolAttributions]="attributions"
          [wolUrl]="'https://mrdata.usgs.gov/mapcache/wmts'"
          [wolLayer]="'sgmc2'"
          [wolMatrixSet]="'GoogleMapsCompatible'"
          [wolFormat]="'image/png'"
          [wolProjection]="projection"
          [wolTileGrid]="tileGrid"
          [wolStyle]="'default'"
          [wolWrapX]="true"
        />
      </wol-tile-layer>
    </wol-map>
  `,
})
export class WolWMTSSourceExampleComponent {
  readonly attributions =
    'Tiles © <a href="https://mrdata.usgs.gov/geology/state/" target="_blank">USGS</a>';
  readonly projection: ProjectionLike;
  readonly projectionExtent: Extent;
  readonly resolutions: number[];
  readonly matrixIds: string[];
  readonly tileGrid: WMTSTileGrid;

  constructor() {
    const projection = getProjection('EPSG:3857');

    if (!projection) {
      throw new Error('Projection EPSG:3857 not found');
    }

    this.projection = projection;
    this.projectionExtent = projection.getExtent();

    const size = getWidth(this.projectionExtent) / 256;
    const matrixIds: string[] = [];
    const resolutions: number[] = [];

    for (let z = 0; z < 19; ++z) {
      // generate resolutions and matrixIds arrays for this WMTS
      resolutions[z] = size / Math.pow(2, z);
      matrixIds[z] = `${z}`;
    }

    this.matrixIds = matrixIds;
    this.resolutions = resolutions;

    this.tileGrid = new WMTSTileGrid({
      origin: getTopLeft(this.projectionExtent),
      resolutions: resolutions,
      matrixIds: matrixIds,
    });
  }
}
