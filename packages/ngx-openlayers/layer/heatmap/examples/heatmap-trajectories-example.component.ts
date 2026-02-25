import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';

import GeoJSON from 'ol/format/GeoJSON';
import { WeightExpression } from 'ol/layer/Heatmap';

import { WolHeatmapLayerModule } from '@workletjs/ngx-openlayers/layer/heatmap';
import { WolTileLayerModule } from '@workletjs/ngx-openlayers/layer/tile';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolProjModule } from '@workletjs/ngx-openlayers/proj';
import { WolStadiaMapsSourceModule } from '@workletjs/ngx-openlayers/source/stadia-maps';
import { WolVectorSourceModule } from '@workletjs/ngx-openlayers/source/vector';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';

@Component({
  selector: 'wol-heatmap-trajectories-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSliderModule,
    WolMapModule,
    WolViewModule,
    WolHeatmapLayerModule,
    WolTileLayerModule,
    WolStadiaMapsSourceModule,
    WolVectorSourceModule,
    WolProjModule,
  ],
  template: `
    <wol-map class="h-96">
      <wol-view [wolCenter]="[11.86, 57.67] | wolFromLonLat" [wolZoom]="12" />
      <wol-tile-layer>
        <wol-stadia-maps-source wolLayer="alidade_smooth_dark" />
      </wol-tile-layer>
      <wol-heatmap-layer
        [wolBlur]="['/', ['var', 'blur'], 2]"
        [wolRadius]="['/', ['var', 'radius'], 2]"
        [wolVariables]="variables()"
        [wolFilter]="[
          'any',
          ['==', ['var', 'shipType'], 'All'],
          ['==', ['var', 'shipType'], ['get', 'ShipType']],
        ]"
        [wolWeight]="weight"
      >
        <wol-vector-source
          [wolFormat]="format"
          [wolUrl]="'https://openlayers.org/en/latest/examples/data/geojson/ship-trajectories.json'"
          [wolAttributions]="'Danish Maritime Authority'"
        />
      </wol-heatmap-layer>
    </wol-map>
    <div class="mt-4 grid grid-cols-3 gap-4">
      <div class="flex flex-col gap-2">
        <label>radius size:</label>
        <mat-slider min="1" max="50" step="1">
          <input matSliderThumb [(ngModel)]="radius" />
        </mat-slider>
      </div>
      <div class="flex flex-col gap-2">
        <label>blur size:</label>
        <mat-slider min="1" max="50" step="1">
          <input matSliderThumb [(ngModel)]="blur" />
        </mat-slider>
      </div>
      <div class="flex flex-col gap-2">
        <label>Filter by type of ship:</label>
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-select [(ngModel)]="shipType">
            <mat-option value="All">All</mat-option>
            <mat-option value="Passenger">Passenger</mat-option>
            <mat-option value="HSC">HSC</mat-option>
            <mat-option value="Tanker">Tanker</mat-option>
            <mat-option value="Cargo">Cargo</mat-option>
            <mat-option value="Sailing">Sailing</mat-option>
            <mat-option value="Other">Other</mat-option>
            <mat-option value="Tug">Tug</mat-option>
            <mat-option value="SAR">SAR</mat-option>
            <mat-option value="Pleasure">Pleasure</mat-option>
            <mat-option value="Dredging">Dredging</mat-option>
            <mat-option value="Law">Law enforcement</mat-option>
            <mat-option value="Pilot">Pilot</mat-option>
            <mat-option value="Fishing">Fishing</mat-option>
            <mat-option value="Diving">Diving</mat-option>
            <mat-option value="Spare">Spare 2</mat-option>
            <mat-option value="Undefined">Undefined</mat-option>
          </mat-select>
        </mat-form-field>
      </div>
    </div>
  `,
})
export class WolHeatmapTrajectoriesExampleComponent {
  readonly radius = signal(5);
  readonly blur = signal(15);
  readonly shipType = signal('All');
  readonly variables = computed(() => ({
    blur: this.blur(),
    radius: this.radius(),
    shipType: this.shipType(),
  }));
  readonly weight: WeightExpression = () => 0.1;
  readonly format = new GeoJSON();
}
