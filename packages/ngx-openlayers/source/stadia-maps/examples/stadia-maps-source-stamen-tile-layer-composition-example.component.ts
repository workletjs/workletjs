import { ChangeDetectionStrategy, Component } from '@angular/core';

import { WolTileLayerModule } from '@workletjs/ngx-openlayers/layer/tile';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolProjModule } from '@workletjs/ngx-openlayers/proj';
import { WolStadiaMapsSourceModule } from '@workletjs/ngx-openlayers/source/stadia-maps';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';

@Component({
  selector: 'wol-stadia-maps-source-stamen-tile-layer-composition-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    WolMapModule,
    WolViewModule,
    WolTileLayerModule,
    WolStadiaMapsSourceModule,
    WolProjModule,
  ],
  template: `
    <wol-map class="h-96">
      <wol-view [wolCenter]="[-122.416667, 37.783333] | wolFromLonLat" [wolZoom]="12" />
      <wol-tile-layer>
        <wol-stadia-maps-source wolLayer="stamen_watercolor" />
      </wol-tile-layer>
      <wol-tile-layer>
        <wol-stadia-maps-source wolLayer="stamen_terrain_labels" />
      </wol-tile-layer>
    </wol-map>
  `,
})
export class WolStadiaMapsSourceStamenTileLayerCompositionExampleComponent {
  // NOTE: Layers from Stadia Maps do not require an API key for localhost development or most production
  // web deployments. See https://docs.stadiamaps.com/authentication/ for details.
}
