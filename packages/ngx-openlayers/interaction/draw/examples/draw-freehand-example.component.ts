import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';
import { WolDrawInteractionModule } from '@workletjs/ngx-openlayers/interaction/draw';
import { WolVectorLayerModule } from '@workletjs/ngx-openlayers/layer/vector';
import { WolVectorSourceModule } from '@workletjs/ngx-openlayers/source/vector';
import { WolTileLayerModule } from '@workletjs/ngx-openlayers/layer/tile';
import { WolOSMSourceModule } from '@workletjs/ngx-openlayers/source/osm';
import { Type } from 'ol/geom/Geometry';

@Component({
  selector: 'wol-draw-freehand-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    WolMapModule,
    WolViewModule,
    WolDrawInteractionModule,
    WolVectorLayerModule,
    WolVectorSourceModule,
    WolTileLayerModule,
    WolOSMSourceModule,
  ],
  template: `
    <wol-map class="h-96">
      <wol-view [wolCenter]="[-11000000, 4600000]" [wolZoom]="4" />
      <wol-tile-layer>
        <wol-osm-source />
      </wol-tile-layer>
      <wol-vector-layer>
        <wol-vector-source #sourceRef [wolWrapX]="false" />
      </wol-vector-layer>
      @if (sourceRef.getInstance(); as source) {
        @switch (type()) {
          @case ('LineString') {
            <wol-draw-interaction
              [wolType]="'LineString'"
              [wolSource]="source"
              [wolFreehand]="true"
            />
          }
          @case ('Polygon') {
            <wol-draw-interaction [wolType]="'Polygon'" [wolSource]="source" [wolFreehand]="true" />
          }
          @case ('Circle') {
            <wol-draw-interaction [wolType]="'Circle'" [wolSource]="source" [wolFreehand]="true" />
          }
        }
      }
    </wol-map>
    <div class="mt-4 flex items-center gap-4">
      <label>Geometry type:</label>
      <mat-form-field appearance="outline" subscriptSizing="dynamic">
        <mat-select [(ngModel)]="type">
          <mat-option value="LineString">LineString</mat-option>
          <mat-option value="Polygon">Polygon</mat-option>
          <mat-option value="Circle">Circle</mat-option>
          <mat-option value="None">None</mat-option>
        </mat-select>
      </mat-form-field>
    </div>
  `,
})
export class WolDrawFreehandExampleComponent {
  readonly type = signal<Type>('LineString');
}
