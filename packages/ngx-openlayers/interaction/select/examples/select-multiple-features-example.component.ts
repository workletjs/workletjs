import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import { always } from 'ol/events/condition';
import GeoJSON from 'ol/format/GeoJSON';
import { SelectEvent } from 'ol/interaction/Select';

import { WolSelectInteractionModule } from '@workletjs/ngx-openlayers/interaction/select';
import { WolVectorLayerModule } from '@workletjs/ngx-openlayers/layer/vector';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolProjModule } from '@workletjs/ngx-openlayers/proj';
import { WolVectorSourceModule } from '@workletjs/ngx-openlayers/source/vector';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';

@Component({
  selector: 'wol-select-multiple-features-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    WolMapModule,
    WolViewModule,
    WolSelectInteractionModule,
    WolVectorLayerModule,
    WolVectorSourceModule,
    WolProjModule,
  ],
  template: `
    <wol-map class="h-96">
      <wol-view [wolZoom]="4" [wolCenter]="[-100, 38.5] | wolFromLonLat" [wolMultiWorld]="true" />
      <wol-vector-layer [wolBackground]="'white'">
        <wol-vector-source [wolUrl]="url" [wolFormat]="formate" />
      </wol-vector-layer>
      <wol-select-interaction
        [wolToggleCondition]="toggleCondition"
        [wolMulti]="true"
        (wolSelect)="onSelected($event)"
      />
    </wol-map>
    <div class="mt-4 min-h-6">{{ selectedCount() }} selected features</div>
  `,
})
export class WolSelectMultipleFeaturesExampleComponent {
  readonly url = 'https://openlayers.org/data/vector/us-states.json';
  readonly formate = new GeoJSON();
  readonly toggleCondition = always;
  readonly selectedCount = signal(0);

  onSelected(event: SelectEvent): void {
    this.selectedCount.set(event.target.getFeatures().getLength());
  }
}
