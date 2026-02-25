import { ChangeDetectionStrategy, Component } from '@angular/core';

import { defaults } from 'ol/interaction';

import { WolKeyboardZoomInteractionModule } from '@workletjs/ngx-openlayers/interaction/keyboard-zoom';
import { WolTileLayerModule } from '@workletjs/ngx-openlayers/layer/tile';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolOSMSourceModule } from '@workletjs/ngx-openlayers/source/osm';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';

@Component({
  selector: 'wol-keyboard-zoom-interaction-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    WolMapModule,
    WolViewModule,
    WolKeyboardZoomInteractionModule,
    WolTileLayerModule,
    WolOSMSourceModule,
  ],
  template: `
    <wol-map
      class="m-0.5 h-96 outline-blue-700 focus:outline-2"
      tabindex="0"
      [wolInteractions]="interactions"
    >
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="2" />
      <wol-keyboard-zoom-interaction />
      <wol-tile-layer>
        <wol-osm-source />
      </wol-tile-layer>
    </wol-map>
  `,
})
export class WolKeyboardZoomInteractionExampleComponent {
  // Disable the default keyboard interaction to avoid conflicts
  readonly interactions = defaults({ keyboard: false });
}
