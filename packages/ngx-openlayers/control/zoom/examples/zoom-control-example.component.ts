import { ChangeDetectionStrategy, Component } from '@angular/core';

import { defaults } from 'ol/control/defaults';

import { WolTileLayerModule } from '@workletjs/ngx-openlayers/layer/tile';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolOSMSourceModule } from '@workletjs/ngx-openlayers/source/osm';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';

import { WolZoomControlModule } from '../zoom-control.module';

@Component({
  selector: 'wol-zoom-control-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    WolMapModule,
    WolViewModule,
    WolZoomControlModule,
    WolTileLayerModule,
    WolOSMSourceModule,
  ],
  template: `
    <wol-map class="h-96" [wolControls]="controls">
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="2" />
      <wol-zoom-control />
      <wol-tile-layer>
        <wol-osm-source />
      </wol-tile-layer>
    </wol-map>
  `,
})
export class WolZoomControlExampleComponent {
  // Disable the default zoom control to avoid having two zoom controls
  readonly controls = defaults({ zoom: false });
}
