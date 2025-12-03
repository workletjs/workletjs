import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { WolTileLayerModule } from '@workletjs/ngx-openlayers/layer/tile';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';
import { WolZoomifySourceModule } from '@workletjs/ngx-openlayers/source/zoomify';
import { Extent } from 'ol/extent';
import TileSource from 'ol/source/Tile';
import View, { ViewOptions } from 'ol/View';

@Component({
  selector: 'wol-zoomify-source-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    WolMapModule,
    WolViewModule,
    WolTileLayerModule,
    WolZoomifySourceModule,
  ],
  template: `
    <wol-map class="h-96" (wolViewChange)="onViewChange($event)">
      <wol-tile-layer (wolSourceChange)="onZoomifySourceChange($event)">
        @switch (zoomifyProtocol()) {
          @case ('zoomify') {
            <wol-zoomify-source
              [wolUrl]="zoomifyUrl"
              [wolSize]="[imgWidth, imgHeight]"
              [wolCrossOrigin]="'anonymous'"
              [wolZDirection]="-1"
            />
          }
          @case ('zoomifyretina') {
            <wol-zoomify-source
              [wolUrl]="zoomifyUrl"
              [wolSize]="[imgWidth, imgHeight]"
              [wolCrossOrigin]="'anonymous'"
              [wolZDirection]="-1"
              [wolTilePixelRatio]="retinaPixelRatio"
              [wolTileSize]="256 / retinaPixelRatio"
            />
          }
        }
      </wol-tile-layer>
      @if (viewOptions(); as options) {
        <wol-view
          [wolResolutions]="options.resolutions"
          [wolExtent]="options.extent"
          [wolConstrainOnlyCenter]="true"
        />
      }
    </wol-map>
    <div class="mt-4">
      <mat-form-field appearance="outline" subscriptSizing="dynamic">
        <mat-select [(ngModel)]="zoomifyProtocol">
          <mat-option value="zoomify">Zoomify</mat-option>
          <mat-option value="zoomifyretina">Zoomify Retina</mat-option>
        </mat-select>
      </mat-form-field>
    </div>
  `,
})
export class WolZoomifySourceExampleComponent {
  readonly imgWidth = 4000;
  readonly imgHeight = 3000;

  readonly zoomifyUrl = 'https://ol-zoomify.surge.sh/zoomify/';
  readonly retinaPixelRatio = 2;

  readonly viewOptions = signal<{
    resolutions: number[];
    extent: Extent;
  } | null>(null);
  readonly zoomifyProtocol = signal('zoomify');

  onViewChange(view?: View | Promise<ViewOptions>): void {
    const viewOptions = this.viewOptions();
    if (view instanceof View && viewOptions) {
      view.fit(viewOptions.extent);
    }
  }

  onZoomifySourceChange(source?: TileSource): void {
    if (!source) {
      return;
    }

    const tileGrid = source.getTileGrid();
    const resolutions = tileGrid?.getResolutions();
    const extent = tileGrid?.getExtent();

    if (resolutions && extent) {
      this.viewOptions.set({ resolutions, extent });
    }
  }
}
