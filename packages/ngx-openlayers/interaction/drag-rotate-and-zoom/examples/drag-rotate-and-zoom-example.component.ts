import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';
import { WolDragRotateAndZoomInteractionModule } from '@workletjs/ngx-openlayers/interaction/drag-rotate-and-zoom';
import { WolTileLayerModule } from '@workletjs/ngx-openlayers/layer/tile';
import { WolOSMSourceModule } from '@workletjs/ngx-openlayers/source/osm';

@Component({
  selector: 'wol-drag-rotate-and-zoom-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    WolMapModule,
    WolViewModule,
    WolDragRotateAndZoomInteractionModule,
    WolTileLayerModule,
    WolOSMSourceModule,
  ],
  template: `
    <wol-map class="h-96">
      <wol-view [wolZoom]="2" [wolCenter]="[0, 0]" />
      <wol-tile-layer>
        <wol-osm-source />
      </wol-tile-layer>
      <wol-drag-rotate-and-zoom-interaction />
    </wol-map>
  `,
})
export class WolDragRotateAndZoomExampleComponent {}
