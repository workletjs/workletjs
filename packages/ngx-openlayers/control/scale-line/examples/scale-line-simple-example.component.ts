import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Renderer2,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';
import {
  WolScaleLineControlComponent,
  WolScaleLineControlModule,
} from '@workletjs/ngx-openlayers/control/scale-line';
import { WolTileLayerModule } from '@workletjs/ngx-openlayers/layer/tile';
import { WolOSMSourceModule } from '@workletjs/ngx-openlayers/source/osm';
import { Units } from 'ol/control/ScaleLine';

@Component({
  selector: 'wol-scale-line-simple-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    WolMapModule,
    WolViewModule,
    WolScaleLineControlModule,
    WolTileLayerModule,
    WolOSMSourceModule,
  ],
  template: `
    <wol-map class="h-96">
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="2" />
      <wol-tile-layer>
        <wol-osm-source />
      </wol-tile-layer>
      @switch (type()) {
        @case ('scaleline') {
          <wol-scale-line-control [wolUnits]="units()" />
        }
        @case ('scalebar') {
          <wol-scale-line-control
            #scaleBar
            [wolUnits]="units()"
            [wolBar]="true"
            [wolSteps]="4"
            [wolText]="true"
            [wolMinWidth]="140"
          />
        }
      }
    </wol-map>
    <div class="flex items-center gap-4 mt-4">
      <div>
        <label for="units">Units:</label>
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-select id="units" [(ngModel)]="units">
            <mat-option value="degrees">degrees</mat-option>
            <mat-option value="imperial">imperial inch</mat-option>
            <mat-option value="us">us inch</mat-option>
            <mat-option value="nautical">nautical mile</mat-option>
            <mat-option value="metric">metric</mat-option>
          </mat-select>
        </mat-form-field>
      </div>
      <div>
        <label for="type">Type:</label>
        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-select id="type" [(ngModel)]="type">
            <mat-option value="scaleline">ScaleLine</mat-option>
            <mat-option value="scalebar">ScaleBar</mat-option>
          </mat-select>
        </mat-form-field>
      </div>
    </div>
  `,
  styles: `
    :host {
      --mat-form-field-container-vertical-padding: 4px;
      --mat-form-field-container-height: 32px;
    }
  `,
})
export class WolScaleLineSimpleExampleComponent {
  private readonly renderer = inject(Renderer2);
  private readonly scaleBar = viewChild('scaleBar', { read: WolScaleLineControlComponent });

  readonly units = signal<Units>('metric');
  readonly type = signal<'scaleline' | 'scalebar'>('scaleline');
}
