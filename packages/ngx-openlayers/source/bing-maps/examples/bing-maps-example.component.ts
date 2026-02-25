import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import { WolTileLayerModule } from '@workletjs/ngx-openlayers/layer/tile';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolBingMapsSourceModule } from '@workletjs/ngx-openlayers/source/bing-maps';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';

@Component({
  selector: 'wol-bing-maps-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    WolMapModule,
    WolViewModule,
    WolTileLayerModule,
    WolBingMapsSourceModule,
  ],
  template: `
    <wol-map class="h-96">
      <wol-view [wolCenter]="[-6655.5402445057125, 6709968.258934638]" [wolZoom]="13" />
      @for (item of styles; track $index) {
        <wol-tile-layer [wolVisible]="item.value === selected()" [wolPreload]="preload">
          <wol-bing-maps-source
            [wolKey]="key"
            [wolImagerySet]="item.value"
            [wolPlaceholderTiles]="placeholderTiles"
          />
        </wol-tile-layer>
      }
    </wol-map>
    <div class="mt-4">
      <mat-form-field appearance="outline">
        <mat-select [(ngModel)]="selected">
          @for (item of styles; track $index) {
            <mat-option [value]="item.value">{{ item.name }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
    </div>
  `,
})
export class WolBingMapsExampleComponent {
  readonly styles = [
    {
      name: 'Aerial',
      value: 'Aerial',
    },
    {
      name: 'Aerial with labels',
      value: 'AerialWithLabelsOnDemand',
    },
    {
      name: 'Road',
      value: 'RoadOnDemand',
    },
    {
      name: 'Road dark',
      value: 'CanvasDark',
    },
    {
      name: 'Ordnance Survey',
      value: 'OrdnanceSurvey',
    },
  ];
  readonly selected = signal('AerialWithLabelsOnDemand');
  readonly preload = Infinity;

  // Your Bing Maps Key from https://www.bingmapsportal.com/ here
  readonly key = 'ApnZqi0Y-RQjo6Kv-Gmoz517qAzexzpOcBcZNY5yNUcuqNFdDnqyNzM_k5VtBinx';

  // Optional. Prevents showing of BingMaps placeholder tiles
  readonly placeholderTiles = false;
}
