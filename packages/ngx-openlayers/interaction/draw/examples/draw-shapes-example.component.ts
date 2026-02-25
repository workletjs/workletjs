import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { Coordinate } from 'ol/coordinate';
import { Polygon } from 'ol/geom';
import { GeometryFunction, createBox, createRegularPolygon } from 'ol/interaction/Draw';

import { WolDrawInteractionComponent } from '@workletjs/ngx-openlayers/interaction/draw';
import { WolTileLayerModule } from '@workletjs/ngx-openlayers/layer/tile';
import { WolVectorLayerModule } from '@workletjs/ngx-openlayers/layer/vector';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolOSMSourceModule } from '@workletjs/ngx-openlayers/source/osm';
import { WolVectorSourceModule } from '@workletjs/ngx-openlayers/source/vector';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';

@Component({
  selector: 'wol-draw-shapes-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    WolMapModule,
    WolViewModule,
    WolVectorLayerModule,
    WolTileLayerModule,
    WolVectorSourceModule,
    WolOSMSourceModule,
    WolDrawInteractionComponent,
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
          @case ('Circle') {
            <wol-draw-interaction [wolType]="'Circle'" [wolSource]="source" />
          }
          @case ('Square') {
            <wol-draw-interaction
              [wolType]="'Circle'"
              [wolGeometryFunction]="squareGeometryFunction"
              [wolSource]="source"
            />
          }
          @case ('Box') {
            <wol-draw-interaction
              [wolType]="'Circle'"
              [wolGeometryFunction]="boxGeometryFunction"
              [wolSource]="source"
            />
          }
          @case ('Star') {
            <wol-draw-interaction
              [wolType]="'Circle'"
              [wolGeometryFunction]="starGeometryFunction"
              [wolSource]="source"
            />
          }
        }
      }
    </wol-map>
    <div class="mt-4 flex items-center gap-4">
      <label>Shape type:</label>
      <mat-form-field appearance="outline" subscriptSizing="dynamic">
        <mat-select [(ngModel)]="type">
          <mat-option value="Circle">Circle</mat-option>
          <mat-option value="Square">Square</mat-option>
          <mat-option value="Box">Box</mat-option>
          <mat-option value="Star">Star</mat-option>
          <mat-option value="None">None</mat-option>
        </mat-select>
      </mat-form-field>
      <button matButton="outlined" (click)="undo()">Undo</button>
    </div>
  `,
})
export class WolDrawShapesExampleComponent {
  readonly type = signal('Circle');
  readonly squareGeometryFunction = createRegularPolygon(4);
  readonly boxGeometryFunction = createBox();
  readonly starGeometryFunction = this.createStar();

  readonly drawRef = viewChild.required(WolDrawInteractionComponent);

  undo(): void {
    this.drawRef().getInstance()?.removeLastPoint();
  }

  private createStar(): GeometryFunction {
    return (coordinates, geometry) => {
      const center = coordinates[0] as Coordinate;
      const last = coordinates[coordinates.length - 1] as Coordinate;
      const dx = center[0] - last[0];
      const dy = center[1] - last[1];
      const radius = Math.sqrt(dx * dx + dy * dy);
      const rotation = Math.atan2(dy, dx);
      const newCoordinates = [];
      const numPoints = 12;
      for (let i = 0; i < numPoints; ++i) {
        const angle = rotation + (i * 2 * Math.PI) / numPoints;
        const fraction = i % 2 === 0 ? 1 : 0.5;
        const offsetX = radius * fraction * Math.cos(angle);
        const offsetY = radius * fraction * Math.sin(angle);
        newCoordinates.push([center[0] + offsetX, center[1] + offsetY]);
      }
      newCoordinates.push(newCoordinates[0].slice());
      if (!geometry) {
        geometry = new Polygon([newCoordinates]);
      } else {
        geometry.setCoordinates([newCoordinates]);
      }
      return geometry;
    };
  }
}
