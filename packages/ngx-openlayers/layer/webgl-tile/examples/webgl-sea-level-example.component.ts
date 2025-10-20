import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolProjModule } from '@workletjs/ngx-openlayers/proj';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';
import { WolWebGLTileLayerModule } from '@workletjs/ngx-openlayers/layer/webgl-tile';
import { WolImageTileSourceModule } from '@workletjs/ngx-openlayers/source/image-tile';
import { Coordinate } from 'ol/coordinate';

@Component({
  selector: 'wol-webgl-sea-level-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatSliderModule,
    WolMapModule,
    WolViewModule,
    WolProjModule,
    WolWebGLTileLayerModule,
    WolImageTileSourceModule,
  ],
  template: `
    <wol-map class="h-96">
      <wol-view [wolCenter]="center() | wolFromLonLat" [wolZoom]="zoom()" />
      <wol-webgl-tile-layer>
        <wol-image-tile-source
          [wolUrl]="'https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=' + key"
          [wolAttributions]="attributions"
          [wolTileSize]="512"
          [wolMaxZoom]="22"
        />
      </wol-webgl-tile-layer>
      <wol-webgl-tile-layer [wolOpacity]="0.5" [wolStyle]="style" [wolVariables]="variables()">
        <wol-image-tile-source
          [wolUrl]="'https://api.maptiler.com/tiles/terrain-rgb-v2/{z}/{x}/{y}.webp?key=' + key"
          [wolTileSize]="512"
          [wolMaxZoom]="14"
        />
      </wol-webgl-tile-layer>
    </wol-map>
    <div class="flex items-center gap-2 mt-4">
      <label for="sea-level-slider">Sea Level: </label>
      <mat-slider id="sea-level-slider" min="0" max="100" step="1">
        <input matSliderThumb [(ngModel)]="seaLevel" />
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
export class WolWebGLSeaLevelExampleComponent {
  // Get your own API key at https://www.maptiler.com/cloud/
  readonly key = '8OyphSYjlGSuAe4ZUCkV';
  readonly attributions =
    '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
    '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';

  readonly center = signal<Coordinate>([-122.3267, 37.8377]);
  readonly zoom = signal<number>(11);
  readonly seaLevel = signal(0);
  readonly variables = computed(() => ({ level: this.seaLevel() }));
  readonly elevation = [
    '+',
    -10000,
    ['*', 0.1 * 255 * 256 * 256, ['band', 1]],
    ['*', 0.1 * 255 * 256, ['band', 2]],
    ['*', 0.1 * 255, ['band', 3]],
  ];
  readonly style = {
    variables: this.variables(),
    color: [
      'case',
      // use the `level` style variable to determine the color
      ['<=', this.elevation, ['var', 'level']],
      [139, 212, 255, 1],
      [139, 212, 255, 0],
    ],
  };

  relocate(event: PointerEvent): void {
    const target = event.target as HTMLElement;
    const data = target.dataset as Record<string, string>;
    this.center.set(data['center'].split(',').map(Number));
    this.zoom.set(Number(data['zoom']));
  }
}
