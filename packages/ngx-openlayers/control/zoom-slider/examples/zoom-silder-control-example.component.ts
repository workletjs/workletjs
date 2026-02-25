import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  effect,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

import {
  WolZoomSliderControlComponent,
  WolZoomSliderControlModule,
} from '@workletjs/ngx-openlayers/control/zoom-slider';
import { WolTileLayerModule } from '@workletjs/ngx-openlayers/layer/tile';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolOSMSourceModule } from '@workletjs/ngx-openlayers/source/osm';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';

@Component({
  selector: 'wol-zoom-slider-control-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    WolMapModule,
    WolViewModule,
    WolZoomSliderControlModule,
    WolTileLayerModule,
    WolOSMSourceModule,
  ],
  template: `
    @switch (style()) {
      @case ('placedBetweenZoomControls') {
        <wol-map class="placed-between-zoom-controls h-96">
          <wol-view [wolZoom]="2" [wolCenter]="[0, 0]" />
          <wol-zoom-slider-control />
          <wol-tile-layer>
            <wol-osm-source />
          </wol-tile-layer>
        </wol-map>
      }
      @case ('horizontal') {
        <wol-map class="horizontal-zoom-slider h-96">
          <wol-view [wolZoom]="2" [wolCenter]="[0, 0]" />
          <wol-zoom-slider-control />
          <wol-tile-layer>
            <wol-osm-source />
          </wol-tile-layer>
        </wol-map>
      }
      @default {
        <wol-map class="h-96">
          <wol-view [wolZoom]="2" [wolCenter]="[0, 0]" />
          <wol-zoom-slider-control />
          <wol-tile-layer>
            <wol-osm-source />
          </wol-tile-layer>
        </wol-map>
      }
    }
    <div class="mt-4">
      <mat-form-field class="w-full" appearance="outline" subscriptSizing="dynamic">
        <mat-select [(ngModel)]="style">
          <mat-option value="default">Default style</mat-option>
          <mat-option value="placedBetweenZoomControls">Placed between zoom controls</mat-option>
          <mat-option value="horizontal">Horizontal and completely re-styled</mat-option>
        </mat-select>
      </mat-form-field>
    </div>
  `,
  styles: `
    .placed-between-zoom-controls {
      .ol-zoom .ol-zoom-out {
        margin-top: 200px;
      }

      .ol-zoomslider {
        background-color: transparent;
        /*
        Zoom control top: 0.5em
        Zoom control padding: 2px
        Zoom in button margin top: 1px
        Zoom in button height: font size 1.14em * 1.375 height
        */
        top: calc(0.5em + 2px + 1px + 1.14 * 1.375em);
      }

      .ol-touch .ol-zoom .ol-zoom-out {
        margin-top: 212px;
      }

      .ol-touch .ol-zoomslider {
        top: 2.75em;
      }

      .ol-zoom-in.ol-has-tooltip:hover [role='tooltip'],
      .ol-zoom-in.ol-has-tooltip:focus [role='tooltip'] {
        top: 3px;
      }

      .ol-zoom-out.ol-has-tooltip:hover [role='tooltip'],
      .ol-zoom-out.ol-has-tooltip:focus [role='tooltip'] {
        top: 232px;
      }
    }

    .horizontal-zoom-slider {
      .ol-zoomslider {
        top: 8px;
        left: auto;
        right: 8px;
        background-color: rgba(255, 69, 0, 0.2);
        width: 200px;
        height: 15px;
        padding: 0;
        box-shadow: 0 0 5px rgb(255, 69, 0);
        border-radius: 7.5px;
      }

      .ol-zoomslider:hover {
        background-color: rgba(255, 69, 0, 0.3);
      }

      .ol-zoomslider-thumb {
        height: 15px;
        width: 15px;
        margin: 0;
        filter: none;
        background-color: rgba(255, 69, 0, 0.6);
        border-radius: 7.5px;
      }

      a.ol-zoomslider-handle:hover {
        background-color: rgba(255, 69, 0, 0.7);
      }
    }
  `,
})
export class WolZoomSliderControlExampleComponent {
  readonly style = signal('default');
}
