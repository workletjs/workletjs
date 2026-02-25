import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { WolTileLayerModule } from '@workletjs/ngx-openlayers/layer/tile';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolCartoDBSourceModule } from '@workletjs/ngx-openlayers/source/cartodb';
import { WolOSMSourceModule } from '@workletjs/ngx-openlayers/source/osm';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';

@Component({
  selector: 'wol-carto-db-source-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    WolMapModule,
    WolViewModule,
    WolTileLayerModule,
    WolCartoDBSourceModule,
    WolOSMSourceModule,
  ],
  template: `
    <wol-map class="h-96">
      <wol-view [wolCenter]="[8500000, 8500000]" [wolZoom]="2" />
      <wol-tile-layer>
        <wol-osm-source />
      </wol-tile-layer>
      <wol-tile-layer>
        <wol-carto-db-source [wolAccount]="'documentation'" [wolConfig]="mapConfig()" />
      </wol-tile-layer>
    </wol-map>
    <div class="mt-4 flex items-center gap-2">
      <span>Show european countries larger than</span>
      <mat-form-field appearance="outline" [subscriptSizing]="'dynamic'">
        <mat-select [(ngModel)]="area">
          <mat-option [value]="0">0 ㎢</mat-option>
          <mat-option [value]="5000">5000 ㎢</mat-option>
          <mat-option [value]="10000">10000 ㎢</mat-option>
          <mat-option [value]="50000">50000 ㎢</mat-option>
          <mat-option [value]="100000">100000 ㎢</mat-option>
        </mat-select>
      </mat-form-field>
    </div>
  `,
})
export class WolCartoDBSourceExampleComponent {
  readonly area = signal(0);
  readonly mapConfig = computed(() => ({
    layers: [
      {
        type: 'cartodb',
        options: {
          cartocss_version: '2.1.1',
          cartocss: '#layer { polygon-fill: #F00; }',
          sql: `select * from european_countries_e where area > ${this.area()}`,
        },
      },
    ],
  }));
}
