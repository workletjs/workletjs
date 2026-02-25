import { ChangeDetectionStrategy, Component } from '@angular/core';

import GeoJSON from 'ol/format/GeoJSON';

import { WolModifyInteractionModule } from '@workletjs/ngx-openlayers/interaction/modify';
import { WolSelectInteractionModule } from '@workletjs/ngx-openlayers/interaction/select';
import { WolVectorLayerModule } from '@workletjs/ngx-openlayers/layer/vector';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolProjModule } from '@workletjs/ngx-openlayers/proj';
import { WolVectorSourceModule } from '@workletjs/ngx-openlayers/source/vector';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';

@Component({
  selector: 'wol-modify-features-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    WolMapModule,
    WolViewModule,
    WolVectorLayerModule,
    WolVectorSourceModule,
    WolModifyInteractionModule,
    WolSelectInteractionModule,
    WolProjModule,
  ],
  template: `
    <wol-map class="h-96">
      <wol-view [wolCenter]="[-100, 38.5] | wolFromLonLat" [wolZoom]="4" />
      <wol-vector-layer [wolBackground]="'white'">
        <wol-vector-source [wolUrl]="url" [wolFormat]="format" [wolWrapX]="false" />
      </wol-vector-layer>
      <wol-select-interaction #selectRef />
      @if (selectRef.selectInstance(); as select) {
        <wol-modify-interaction [wolFeatures]="select.getFeatures()" />
      }
    </wol-map>
  `,
})
export class WolModifyFeaturesExampleComponent {
  readonly url = 'https://openlayers.org/data/vector/us-states.json';
  readonly format = new GeoJSON();
}
