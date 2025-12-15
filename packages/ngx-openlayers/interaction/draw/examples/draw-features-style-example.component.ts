import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { WolTileLayerModule } from '@workletjs/ngx-openlayers/layer/tile';
import { WolVectorLayerModule } from '@workletjs/ngx-openlayers/layer/vector';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolOSMSourceModule } from '@workletjs/ngx-openlayers/source/osm';
import { WolVectorSourceModule } from '@workletjs/ngx-openlayers/source/vector';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';
import { WolDrawInteractionModule } from '@workletjs/ngx-openlayers/interaction/draw';
import { Type } from 'ol/geom/Geometry';

@Component({
  selector: 'wol-draw-features-style-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    WolMapModule,
    WolViewModule,
    WolVectorLayerModule,
    WolVectorSourceModule,
    WolTileLayerModule,
    WolOSMSourceModule,
    WolDrawInteractionModule,
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
          @case ('Point') {
            <wol-draw-interaction
              [wolType]="'Point'"
              [wolSource]="source"
              [wolStyle]="{
                'circle-radius': 5,
                'circle-fill-color': 'red',
              }"
            />
          }
          @case ('LineString') {
            <wol-draw-interaction
              [wolType]="'LineString'"
              [wolSource]="source"
              [wolStyle]="{
                'circle-radius': 5,
                'circle-fill-color': 'red',
                'stroke-color': 'yellow',
                'stroke-width': 2,
              }"
            />
          }
          @case ('Polygon') {
            <wol-draw-interaction
              [wolType]="'Polygon'"
              [wolSource]="source"
              [wolStyle]="{
                'circle-radius': 5,
                'circle-fill-color': 'red',
                'stroke-color': 'yellow',
                'stroke-width': 2,
                'fill-color': 'blue',
              }"
            />
          }
          @case ('Circle') {
            <wol-draw-interaction
              [wolType]="'Circle'"
              [wolSource]="source"
              [wolStyle]="{
                'circle-radius': 5,
                'circle-fill-color': 'red',
                'stroke-color': 'blue',
                'stroke-width': 2,
                'fill-color': 'yellow',
              }"
            />
          }
        }
      }
    </wol-map>
    <div class="mt-4 flex items-center gap-4">
      <label>Geometry type:</label>
      <mat-form-field appearance="outline" subscriptSizing="dynamic">
        <mat-select [(ngModel)]="type">
          <mat-option value="Point">Point</mat-option>
          <mat-option value="LineString">LineString</mat-option>
          <mat-option value="Polygon">Polygon</mat-option>
          <mat-option value="Circle">Circle</mat-option>
          <mat-option value="None">None</mat-option>
        </mat-select>
      </mat-form-field>
    </div>
  `,
})
export class WolDrawFeaturesStyleExampleComponent {
  readonly type = signal<Type>('Point');
}
