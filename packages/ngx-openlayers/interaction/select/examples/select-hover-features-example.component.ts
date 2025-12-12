import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';
import { WolSelectInteractionModule } from '@workletjs/ngx-openlayers/interaction/select';
import { WolVectorLayerModule } from '@workletjs/ngx-openlayers/layer/vector';
import { WolVectorSourceModule } from '@workletjs/ngx-openlayers/source/vector';
import GeoJSON from 'ol/format/GeoJSON';
import Style, { StyleFunction } from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import { pointerMove } from 'ol/events/condition';
import { SelectEvent } from 'ol/interaction/Select';

@Component({
  selector: 'wol-select-hover-features-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    WolMapModule,
    WolViewModule,
    WolSelectInteractionModule,
    WolVectorLayerModule,
    WolVectorSourceModule,
  ],
  template: `
    <wol-map class="h-96">
      <wol-view [wolZoom]="2" [wolCenter]="[0, 0]" />
      <wol-vector-layer [wolBackground]="'white'" [wolStyle]="style">
        <wol-vector-source [wolUrl]="url" [wolFormat]="format" />
      </wol-vector-layer>
      <wol-select-interaction
        [wolStyle]="selectedStyle"
        [wolCondition]="pointerMove"
        (wolSelect)="onSelected($event)"
      />
    </wol-map>
    <div class="mt-4 min-h-6">{{ ecoName() }}</div>
  `,
})
export class WolSelectHoverFeaturesExampleComponent {
  readonly url = 'https://openlayers.org/data/vector/ecoregions.json';
  readonly format = new GeoJSON();
  readonly style: StyleFunction = (feature) =>
    new Style({
      fill: new Fill({
        color: feature.get('COLOR') || '#eeeeee',
      }),
    });
  readonly selectedStyle: StyleFunction = (feature) =>
    new Style({
      fill: new Fill({
        color: feature.get('COLOR') || '#eeeeee',
      }),
      stroke: new Stroke({
        color: 'rgba(255, 255, 255, 0.7)',
        width: 2,
      }),
    });
  readonly pointerMove = pointerMove;
  readonly ecoName = signal('');

  onSelected(event: SelectEvent): void {
    if (event.selected.length > 0) {
      this.ecoName.set(event.selected[0].get('ECO_NAME') || '');
    } else {
      this.ecoName.set('');
    }
  }
}
