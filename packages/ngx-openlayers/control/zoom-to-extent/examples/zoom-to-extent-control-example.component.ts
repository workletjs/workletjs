import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';
import { WolZoomToExtentControlModule } from '@workletjs/ngx-openlayers/control/zoom-to-extent';
import { WolTileLayerModule } from '@workletjs/ngx-openlayers/layer/tile';
import { WolOSMSourceModule } from '@workletjs/ngx-openlayers/source/osm';
import { WolProjModule } from '@workletjs/ngx-openlayers/proj';

@Component({
  selector: 'wol-zoom-to-extent-control-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    WolMapModule,
    WolViewModule,
    WolZoomToExtentControlModule,
    WolTileLayerModule,
    WolOSMSourceModule,
    WolProjModule,
  ],
  template: `
    <wol-map class="h-96">
      <wol-view [wolCenter]="[500000, 6000000]" [wolZoom]="7" />

      <wol-zoom-to-extent-control
        [wolExtent]="[-180, -90, 180, 90] | wolTransformExtent: 'EPSG:4326' : 'EPSG:3857'"
        [wolTipLabel]="'Zoom to the world'"
      ></wol-zoom-to-extent-control>

      <wol-tile-layer>
        <wol-osm-source />
      </wol-tile-layer>
    </wol-map>
  `,
})
export class WolZoomToExtentControlExampleComponent {}
