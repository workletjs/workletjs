import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';

import { Type } from 'ol/geom/Geometry';

import { WolDrawInteractionModule } from '@workletjs/ngx-openlayers/interaction/draw';
import { WolModifyInteractionModule } from '@workletjs/ngx-openlayers/interaction/modify';
import {
  WolSelectInteractionComponent,
  WolSelectInteractionModule,
} from '@workletjs/ngx-openlayers/interaction/select';
import { WolSnapInteractionModule } from '@workletjs/ngx-openlayers/interaction/snap';
import { WolTileLayerModule } from '@workletjs/ngx-openlayers/layer/tile';
import { WolVectorLayerModule } from '@workletjs/ngx-openlayers/layer/vector';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolOSMSourceModule } from '@workletjs/ngx-openlayers/source/osm';
import { WolVectorSourceModule } from '@workletjs/ngx-openlayers/source/vector';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';

@Component({
  selector: 'wol-snap-interaction-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatRadioModule,
    WolMapModule,
    WolViewModule,
    WolDrawInteractionModule,
    WolModifyInteractionModule,
    WolSelectInteractionModule,
    WolSnapInteractionModule,
    WolTileLayerModule,
    WolVectorLayerModule,
    WolVectorSourceModule,
    WolOSMSourceModule,
  ],
  template: `
    <wol-map class="h-96" [class.cursor-grabbing]="snapped()" [class.cursor-default]="!snapped()">
      <wol-view [wolZoom]="4" [wolCenter]="[-11000000, 4600000]" />
      <wol-tile-layer>
        <wol-osm-source />
      </wol-tile-layer>
      <wol-vector-layer
        [wolStyle]="{
          'fill-color': 'rgba(255, 255, 255, 0.2)',
          'stroke-color': '#ffcc33',
          'stroke-width': 2,
          'circle-radius': 7,
          'circle-fill-color': '#ffcc33',
        }"
      >
        <wol-vector-source #vectorSourceRef />
      </wol-vector-layer>
      <wol-select-interaction #selectRef [wolActive]="interactionType() === 'modify'" />
      @if (selectRef.getInstance(); as select) {
        <wol-modify-interaction
          [wolActive]="interactionType() === 'modify'"
          [wolFeatures]="select.getFeatures()"
        />
      }
      @if (vectorSourceRef.vectorSourceInstance(); as vectorSource) {
        <wol-draw-interaction
          [wolActive]="interactionType() === 'draw' && drawType() === 'Point'"
          [wolType]="'Point'"
          [wolSource]="vectorSource"
        />
        <wol-draw-interaction
          [wolActive]="interactionType() === 'draw' && drawType() === 'LineString'"
          [wolType]="'LineString'"
          [wolSource]="vectorSource"
        />
        <wol-draw-interaction
          [wolActive]="interactionType() === 'draw' && drawType() === 'Polygon'"
          [wolType]="'Polygon'"
          [wolSource]="vectorSource"
        />
        <wol-draw-interaction
          [wolActive]="interactionType() === 'draw' && drawType() === 'Circle'"
          [wolType]="'Circle'"
          [wolSource]="vectorSource"
        />
        <wol-snap-interaction
          [wolSource]="vectorSource"
          [wolIntersection]="true"
          (wolSnap)="snapped.set(true)"
          (wolUnsnap)="snapped.set(false)"
        />
      }
    </wol-map>
    <div class="mt-4">Snapped: {{ snapped() }}</div>
    <div class="mt-4">
      <mat-radio-group class="flex flex-col" [(ngModel)]="interactionType">
        <mat-radio-button value="draw">
          <div class="flex items-center gap-4">
            <span>Draw</span>
            <mat-form-field appearance="outline" subscriptSizing="dynamic">
              <mat-select [(ngModel)]="drawType">
                <mat-option value="Point">Point</mat-option>
                <mat-option value="LineString">LineString</mat-option>
                <mat-option value="Polygon">Polygon</mat-option>
                <mat-option value="Circle">Circle</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </mat-radio-button>
        <mat-radio-button value="modify">Modify</mat-radio-button>
      </mat-radio-group>
    </div>
  `,
})
export class WolSnapInteractionExampleComponent {
  readonly interactionType = signal<'draw' | 'modify'>('draw');
  readonly drawType = signal<Type>('Point');
  readonly snapped = signal(false);

  private readonly selectRef = viewChild.required(WolSelectInteractionComponent);

  constructor() {
    toObservable(this.interactionType)
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        const select = this.selectRef().getInstance();

        if (!select) {
          return;
        }

        const selectedFeatures = select.getFeatures();

        selectedFeatures.forEach((feature) => {
          selectedFeatures.remove(feature);
        });
      });
  }
}
