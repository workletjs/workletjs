import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WolTileLayerModule } from '@workletjs/ngx-openlayers/layer/tile';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolOSMSourceModule } from '@workletjs/ngx-openlayers/source/osm';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';
import { WolExtentInteractionModule } from '@workletjs/ngx-openlayers/interaction/extent';
import { shiftKeyOnly } from 'ol/events/condition';

@Component({
  selector: 'wol-extent-interaction-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    WolMapModule,
    WolViewModule,
    WolTileLayerModule,
    WolOSMSourceModule,
    WolExtentInteractionModule,
  ],
  template: `
    <wol-map class="h-96">
      <wol-view [wolZoom]="2" [wolCenter]="[0, 0]" />
      <wol-tile-layer>
        <wol-osm-source />
      </wol-tile-layer>
      <wol-extent-interaction [wolCondition]="shiftKeyOnly" />
    </wol-map>
  `,
})
export class WolExtentInteractionExampleComponent {
  readonly shiftKeyOnly = shiftKeyOnly;
}
