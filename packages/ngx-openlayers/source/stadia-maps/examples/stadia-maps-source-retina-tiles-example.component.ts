import { ChangeDetectionStrategy, Component } from '@angular/core';

import { WolTileLayerModule } from '@workletjs/ngx-openlayers/layer/tile';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolProjModule } from '@workletjs/ngx-openlayers/proj';
import { WolStadiaMapsSourceModule } from '@workletjs/ngx-openlayers/source/stadia-maps';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';

@Component({
  selector: 'wol-stadia-maps-source-retina-tiles-example',
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
      <wol-view [wolCenter]="[24.750645, 59.444351] | wolFromLonLat" [wolZoom]="14" />
      <wol-tile-layer>
        <wol-stadia-maps-source wolLayer="alidade_smooth_dark" [wolRetina]="true" />
      </wol-tile-layer>
    </wol-map>
  `,
})
export class WolStadiaMapsSourceRetinaTilesExampleComponent {
  // NOTE: Layers from Stadia Maps do not require an API key for localhost development or most production
  // web deployments. See https://docs.stadiamaps.com/authentication/ for details.
}
