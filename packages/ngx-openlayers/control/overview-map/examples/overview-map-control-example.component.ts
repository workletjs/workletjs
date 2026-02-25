import { ChangeDetectionStrategy, Component } from '@angular/core';

import { defaults } from 'ol/control/defaults';

import { WolOverviewMapControlModule } from '@workletjs/ngx-openlayers/control/overview-map';
import { WolTileLayerModule } from '@workletjs/ngx-openlayers/layer/tile';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolOSMSourceModule } from '@workletjs/ngx-openlayers/source/osm';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';

@Component({
  selector: 'wol-overview-map-control-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    WolMapModule,
    WolViewModule,
    WolOverviewMapControlModule,
    WolTileLayerModule,
    WolOSMSourceModule,
  ],
  template: `
    <wol-map class="h-96" [wolControls]="controls">
      <wol-view [wolCenter]="[500000, 6000000]" [wolZoom]="7" />
      <wol-overview-map-control>
        <wol-tile-layer>
          <wol-osm-source />
        </wol-tile-layer>
      </wol-overview-map-control>
      <wol-tile-layer>
        <wol-osm-source />
      </wol-tile-layer>
    </wol-map>
  `,
})
export class WolOverviewMapControlExampleComponent {
  readonly controls = defaults();
}
