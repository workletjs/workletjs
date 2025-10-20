import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WolTileLayerModule } from '@workletjs/ngx-openlayers/layer/tile';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';
import { WolOSMSourceModule } from '@workletjs/ngx-openlayers/source/osm';
import { WolTileDebugSourceModule } from '@workletjs/ngx-openlayers/source/tile-debug';

@Component({
  selector: 'wol-canvas-tiles-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    WolMapModule,
    WolViewModule,
    WolTileLayerModule,
    WolOSMSourceModule,
    WolTileDebugSourceModule,
  ],
  template: `
    <wol-map class="h-96">
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="1" />
      <wol-tile-layer>
        <wol-osm-source />
      </wol-tile-layer>
      <wol-tile-layer>
        <wol-tile-debug-source />
      </wol-tile-layer>
    </wol-map>
  `,
})
export class WolCanvasTilesExampleComponent {}
