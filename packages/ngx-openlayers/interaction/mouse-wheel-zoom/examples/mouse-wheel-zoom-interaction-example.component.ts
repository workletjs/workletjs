import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';
import { WolMouseWheelZoomInteractionModule } from '@workletjs/ngx-openlayers/interaction/mouse-wheel-zoom';
import { WolTileLayerModule } from '@workletjs/ngx-openlayers/layer/tile';
import { WolOSMSourceModule } from '@workletjs/ngx-openlayers/source/osm';
import { defaults } from 'ol/interaction';

@Component({
  selector: 'wol-mouse-wheel-zoom-interaction-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    WolMapModule,
    WolViewModule,
    WolMouseWheelZoomInteractionModule,
    WolTileLayerModule,
    WolOSMSourceModule,
  ],
  template: `
    <wol-map class="h-96" [wolInteractions]="interactions">
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="2" />
      <wol-mouse-wheel-zoom-interaction />
      <wol-tile-layer>
        <wol-osm-source />
      </wol-tile-layer>
    </wol-map>
  `,
})
export class WolMouseWheelZoomInteractionExampleComponent {
  readonly interactions = defaults({
    mouseWheelZoom: false, // Disable default mouse wheel zoom interaction
  });
}
