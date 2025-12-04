import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WolVectorTileLayerModule } from '@workletjs/ngx-openlayers/layer/vector-tile';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';
import { WolOGCVectorTileSourceModule } from '@workletjs/ngx-openlayers/source/ogc-vector-tile';
import MVT from 'ol/format/MVT';

@Component({
  selector: 'wol-ogc-vector-tiles-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WolMapModule, WolViewModule, WolVectorTileLayerModule, WolOGCVectorTileSourceModule],
  template: `
    <wol-map class="h-96">
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="1" />
      <wol-vector-tile-layer
        [wolBackground]="'#d1d1d1'"
        [wolStyle]="{
          'stroke-width': 0.6,
          'stroke-color': '#8c8b8b',
          'fill-color': '#f7f7e9',
        }"
      >
        <wol-ogc-vector-tile-source [wolFormat]="format" [wolUrl]="url" />
      </wol-vector-tile-layer>
    </wol-map>
  `,
})
export class WolOGCVectorTilesExampleComponent {
  readonly format = new MVT();
  readonly url =
    'https://maps.gnosis.earth/ogcapi/collections/NaturalEarth:cultural:ne_10m_admin_0_countries' +
    '/tiles/WebMercatorQuad';
}
