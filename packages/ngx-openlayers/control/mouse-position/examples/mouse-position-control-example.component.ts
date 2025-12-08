import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';
import { WolMousePositionControlModule } from '@workletjs/ngx-openlayers/control/mouse-position';
import { WolTileLayerModule } from '@workletjs/ngx-openlayers/layer/tile';
import { WolOSMSourceModule } from '@workletjs/ngx-openlayers/source/osm';
import { defaults } from 'ol/control/defaults';
import { ProjectionLike } from 'ol/proj';
import { CoordinateFormat, createStringXY } from 'ol/coordinate';

@Component({
  selector: 'wol-mouse-position-control-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    WolMapModule,
    WolViewModule,
    WolMousePositionControlModule,
    WolTileLayerModule,
    WolOSMSourceModule,
  ],
  template: `
    <wol-map class="h-96" [wolControls]="controls">
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="2" />
      <wol-mouse-position-control
        [wolProjection]="projection()"
        [wolCoordinateFormat]="coordinateFormat()"
        [wolClassName]="'custom-mouse-position'"
        [wolTarget]="mousePositionElement"
      />
      <wol-tile-layer>
        <wol-osm-source />
      </wol-tile-layer>
    </wol-map>
    <div #mousePositionElement class="mt-4"></div>
    <div class="mt-4 flex items-center gap-4">
      <div class="flex items-center gap-2">
        <label>Projection</label>
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-select [(ngModel)]="projection">
            <mat-option value="EPSG:4326">EPSG:4326</mat-option>
            <mat-option value="EPSG:3857">EPSG:3857</mat-option>
          </mat-select>
        </mat-form-field>
      </div>
      <div class="flex items-center gap-2">
        <label>Precision</label>
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <input matInput type="number" min="0" max="12" [(ngModel)]="precision" />
        </mat-form-field>
      </div>
    </div>
  `,
})
export class WolMousePositionControlExampleComponent {
  readonly controls = defaults();

  readonly projection = signal<ProjectionLike>('EPSG:4326');
  readonly precision = signal(4);
  readonly coordinateFormat = computed<CoordinateFormat>(() => createStringXY(this.precision()));
}
