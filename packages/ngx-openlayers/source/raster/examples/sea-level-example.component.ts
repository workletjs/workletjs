import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { WolImageLayerModule } from '@workletjs/ngx-openlayers/layer/image';
import { WolTileLayerModule } from '@workletjs/ngx-openlayers/layer/tile';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolProjModule } from '@workletjs/ngx-openlayers/proj';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';
import { WolImageTileSourceModule } from '@workletjs/ngx-openlayers/source/image-tile';
import { WolRasterSourceModule } from '@workletjs/ngx-openlayers/source/raster';
import RasterSource, { Operation, RasterSourceEvent } from 'ol/source/Raster';
import { Coordinate } from 'ol/coordinate';

@Component({
  selector: 'wol-sea-level-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatSliderModule,
    WolMapModule,
    WolViewModule,
    WolProjModule,
    WolImageLayerModule,
    WolTileLayerModule,
    WolImageTileSourceModule,
    WolRasterSourceModule,
  ],
  template: `
    <wol-map class="h-96">
      <wol-view [wolCenter]="center() | wolFromLonLat" [wolZoom]="zoom()" />
      <wol-tile-layer>
        <wol-image-tile-source
          [wolAttributions]="attributions"
          [wolUrl]="'https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=' + key"
          [wolTileSize]="512"
          [wolMaxZoom]="22"
        />
      </wol-tile-layer>
      <wol-image-layer [wolOpacity]="0.6">
        <wol-raster-source
          #rasterSource
          [wolOperation]="floodOperation"
          (wolBeforeOperations)="onBeforeOperations($event)"
        >
          <wol-image-tile-source
            [wolUrl]="'https://api.maptiler.com/tiles/terrain-rgb-v2/{z}/{x}/{y}.webp?key=' + key"
            [wolTileSize]="512"
            [wolMaxZoom]="14"
            [wolInterpolate]="false"
          />
        </wol-raster-source>
      </wol-image-layer>
    </wol-map>
    <div class="flex items-center gap-2 mt-4">
      <label for="sea-level-slider">Sea Level: </label>
      <mat-slider id="sea-level-slider" min="0" max="100" step="1">
        <input
          matSliderThumb
          [(ngModel)]="seaLevel"
          (ngModelChange)="update(rasterSource.getInstance()!)"
        />
      </mat-slider>
      <span>+{{ seaLevel() }} m</span>
    </div>
    <div class="locations">
      <span>Go to </span>
      <a data-center="-122.3267,37.8377" data-zoom="11" (click)="relocate($event)">San Francisco</a>
      <span>, </span>
      <a data-center="-73.9338,40.6861" data-zoom="11" (click)="relocate($event)">New York</a>
      <span>, </span>
      <a data-center="72.9481,18.9929" data-zoom="11" (click)="relocate($event)">Mumbai</a>
      <span>, or </span>
      <a data-center="120.831,31.160" data-zoom="9" (click)="relocate($event)">Shanghai</a>
    </div>
  `,
  styles: `
    :host > .locations > a {
      cursor: pointer;
      text-decoration: none;
      color: var(--ng-doc-link-color);

      &:hover {
        text-decoration: underline;
      }
    }
  `,
})
export class WolSeaLevelExampleComponent {
  // Get your own API key at https://www.maptiler.com/cloud/
  readonly key = '8OyphSYjlGSuAe4ZUCkV';
  readonly attributions =
    '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
    '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';

  readonly floodOperation: Operation = (pixels, data) => {
    const pixel = pixels[0] as number[];
    if (pixel[3]) {
      const height = -10000 + (pixel[0] * 256 * 256 + pixel[1] * 256 + pixel[2]) * 0.1;
      if (height <= data.level) {
        pixel[0] = 134;
        pixel[1] = 203;
        pixel[2] = 249;
        pixel[3] = 255;
      } else {
        pixel[3] = 0;
      }
    }
    return pixel;
  };

  readonly center = signal<Coordinate>([-122.3267, 37.8377]);
  readonly zoom = signal<number>(11);
  readonly seaLevel = signal(1);

  update(rasterSource: RasterSource): void {
    rasterSource.changed();
  }

  onBeforeOperations(event: RasterSourceEvent): void {
    event.data.level = this.seaLevel();
  }

  relocate(event: PointerEvent): void {
    const target = event.target as HTMLElement;
    const data = target.dataset as Record<string, string>;
    this.center.set(data['center'].split(',').map(Number));
    this.zoom.set(Number(data['zoom']));
  }
}
