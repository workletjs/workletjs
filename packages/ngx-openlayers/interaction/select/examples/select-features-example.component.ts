import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';
import { WolSelectInteractionModule } from '@workletjs/ngx-openlayers/interaction/select';
import { WolVectorLayerModule } from '@workletjs/ngx-openlayers/layer/vector';
import { WolVectorSourceModule } from '@workletjs/ngx-openlayers/source/vector';
import { altKeyOnly, click, Condition, never, pointerMove } from 'ol/events/condition';
import GeoJSON from 'ol/format/GeoJSON';
import Style, { StyleFunction } from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import MapBrowserEvent from 'ol/MapBrowserEvent';
import { SelectEvent } from 'ol/interaction/Select';

const altClick: Condition = (event: MapBrowserEvent) => click(event) && altKeyOnly(event);

@Component({
  selector: 'wol-select-features-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
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
      @switch (actionType()) {
        @case ('singleclick') {
          <wol-select-interaction [wolStyle]="selectedStyle" (wolSelect)="onSelected($event)" />
        }
        @case ('click') {
          <wol-select-interaction
            [wolStyle]="selectedStyle"
            [wolCondition]="conditions.click"
            (wolSelect)="onSelected($event)"
          />
        }
        @case ('pointermove') {
          <wol-select-interaction
            [wolStyle]="selectedStyle"
            [wolCondition]="conditions.pointerMove"
            [wolToggleCondition]="conditions.never"
            (wolSelect)="onSelected($event)"
          />
        }
        @case ('altclick') {
          <wol-select-interaction
            [wolStyle]="selectedStyle"
            [wolCondition]="conditions.altClick"
            (wolSelect)="onSelected($event)"
          />
        }
      }
    </wol-map>
    <div class="mt-4 flex items-center gap-2">
      <label>Action type:</label>
      <mat-form-field appearance="outline" subscriptSizing="dynamic">
        <mat-select [(ngModel)]="actionType">
          <mat-option value="click">Click</mat-option>
          <mat-option value="singleclick">Single-click</mat-option>
          <mat-option value="pointermove">Hover</mat-option>
          <mat-option value="altclick">Alt+Click</mat-option>
          <mat-option value="none">None</mat-option>
        </mat-select>
      </mat-form-field>
    </div>
    <div class="mt-4">
      @if (lastSelectedCount() === null && deselectedCount() === null) {
        {{ selectedCount() }} selected features
      } @else {
        {{ selectedCount() }} selected features (last operation selected
        {{ lastSelectedCount() }} and deselected {{ deselectedCount() }} features)
      }
    </div>
  `,
})
export class WolSelectFeaturesExampleComponent {
  readonly url = 'https://openlayers.org/data/vector/ecoregions.json';
  readonly format = new GeoJSON();
  readonly conditions = {
    click,
    pointerMove,
    never,
    altClick,
  };
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
  readonly actionType = signal('click');
  readonly selectedCount = signal(0);
  readonly lastSelectedCount = signal<number | null>(null);
  readonly deselectedCount = signal<number | null>(null);

  onSelected(event: SelectEvent): void {
    this.selectedCount.set(event.target.getFeatures().getLength());
    this.lastSelectedCount.set(event.selected.length);
    this.deselectedCount.set(event.deselected.length);
  }
}
