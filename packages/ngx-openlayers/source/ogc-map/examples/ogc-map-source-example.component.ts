import { ChangeDetectionStrategy, Component } from '@angular/core';

import { WolImageLayerModule } from '@workletjs/ngx-openlayers/layer/image';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolOGCMapSourceModule } from '@workletjs/ngx-openlayers/source/ogc-map';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';

@Component({
  selector: 'wol-ogc-map-source-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WolMapModule, WolViewModule, WolImageLayerModule, WolOGCMapSourceModule],
  template: `
    <wol-map class="h-96">
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="4" />
      <wol-image-layer>
        <wol-ogc-map-source wolUrl="https://maps.gnosis.earth/ogcapi/collections/blueMarble/map" />
      </wol-image-layer>
    </wol-map>
  `,
})
export class WolOGCMapSourceExampleComponent {}
