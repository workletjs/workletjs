import { Component } from '@angular/core';

import { WolTileLayerComponent } from '@workletjs/ngx-openlayers/layer/tile';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolOSMSourceComponent } from '@workletjs/ngx-openlayers/source/osm';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

@Component({
  selector: 'app-first-map-example',
  imports: [WolMapComponent, WolViewComponent, WolTileLayerComponent, WolOSMSourceComponent],
  template: `
    <wol-map tabindex="0">
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="2" />
      <wol-tile-layer>
        <wol-osm-source />
      </wol-tile-layer>
    </wol-map>
  `,
  styles: `
    wol-map {
      height: 400px;
    }
  `,
})
export class FirstMapExampleComponent {}
