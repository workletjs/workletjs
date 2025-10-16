import { Component } from '@angular/core';
import { WolTileLayerModule } from '@workletjs/ngx-openlayers/layer/tile';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolOSMSourceModule } from '@workletjs/ngx-openlayers/source/osm';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';

@Component({
  selector: 'wol-simple-map-example',
  imports: [WolMapModule, WolViewModule, WolTileLayerModule, WolOSMSourceModule],
  template: `
    <wol-map class="h-96">
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="2" />
      <wol-tile-layer>
        <wol-osm-source />
      </wol-tile-layer>
    </wol-map>
  `,
})
export class WolSimpleMapExampleComponent {}
