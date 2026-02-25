import { ChangeDetectionStrategy, Component } from '@angular/core';

import { defaults } from 'ol/interaction';

import { WolDoubleClickZoomInteractionModule } from '@workletjs/ngx-openlayers/interaction/double-click-zoom';
import { WolTileLayerModule } from '@workletjs/ngx-openlayers/layer/tile';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolOSMSourceModule } from '@workletjs/ngx-openlayers/source/osm';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';

@Component({
  selector: 'wol-double-click-zoom-interaction-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    WolMapModule,
    WolViewModule,
    WolDoubleClickZoomInteractionModule,
    WolTileLayerModule,
    WolOSMSourceModule,
  ],
  template: `
    <wol-map class="h-96" [wolInteractions]="interactions">
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="2" />
      <wol-double-click-zoom-interaction />
      <wol-tile-layer>
        <wol-osm-source />
      </wol-tile-layer>
    </wol-map>
  `,
})
export class WolDoubleClickZoomExampleComponent {
  // Disable the default double-click-zoom interaction
  readonly interactions = defaults({
    doubleClickZoom: false,
  });
}
