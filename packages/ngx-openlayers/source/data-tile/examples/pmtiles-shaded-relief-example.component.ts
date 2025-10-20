import { ChangeDetectionStrategy, Component, computed, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import {
  WolWebGLTileLayerComponent,
  WolWebGLTileLayerModule,
} from '@workletjs/ngx-openlayers/layer/webgl-tile';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';
import { WolDataTileSourceModule } from '@workletjs/ngx-openlayers/source/data-tile';
import { PMTiles } from 'pmtiles';
import { ExpressionValue } from 'ol/expr/expression';
import { Loader } from 'ol/source/DataTile';
import { Coordinate } from 'ol/coordinate';
import { useGeographic } from 'ol/proj';
import MapBrowserEvent from 'ol/MapBrowserEvent';

@Component({
  selector: 'wol-pmtiles-shaded-relief-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatSliderModule,
    WolMapModule,
    WolViewModule,
    WolWebGLTileLayerModule,
    WolDataTileSourceModule,
  ],
  template: `
    <wol-map
      class="h-96"
      (wolPointerMove)="displayPixelValue($event)"
      (wolClick)="displayPixelValue($event)"
    >
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="1" />
      <wol-webgl-tile-layer
        [wolStyle]="{ variables: variables(), color: ['color', scaled] }"
        [wolVariables]="variables()"
      >
        <wol-data-tile-source
          [wolLoader]="loader"
          [wolWrapX]="true"
          [wolMaxZoom]="9"
          [wolAttributions]="attributions"
        />
      </wol-webgl-tile-layer>
    </wol-map>
    <table class="mt-4">
      <tr>
        <td>elevation</td>
        <td colspan="2">
          @if (elevation() !== null) {
            {{ elevation() }} m
          }
        </td>
      </tr>
      <tr>
        <td>location</td>
        <td colspan="2">
          @if (location() !== null) {
            {{ location() }}
          }
        </td>
      </tr>
      <tr>
        <td>
          <label for="vert">vertical exaggeration:</label>
        </td>
        <td>
          <mat-slider id="vert" min="5" max="50" step="1">
            <input matSliderThumb [(ngModel)]="verticalExaggeration" />
          </mat-slider>
        </td>
        <td>{{ verticalExaggeration() }} x</td>
      </tr>
      <tr>
        <td>
          <label for="sunEl">sun elevation:</label>
        </td>
        <td>
          <mat-slider id="sunEl" min="0" max="90" step="1">
            <input matSliderThumb [(ngModel)]="sunElevation" />
          </mat-slider>
        </td>
        <td>{{ sunElevation() }} °</td>
      </tr>
      <tr>
        <td>
          <label for="sunAz">sun azimuth:</label>
        </td>
        <td>
          <mat-slider id="sunAz" min="0" max="360" step="1">
            <input matSliderThumb [(ngModel)]="sunAzimuth" />
          </mat-slider>
        </td>
        <td>{{ sunAzimuth() }} °</td>
      </tr>
    </table>
  `,
})
export class WolPMTilesShadedReliefExampleComponent {
  private readonly tileLayer = viewChild.required(WolWebGLTileLayerComponent);
  readonly attributions =
    '<a href="https://github.com/tilezen/joerd/blob/master/docs/attribution.md#attribution">Tilezen Jörð</a>';
  readonly elevation = signal<number | null>(null);
  readonly location = signal<string | null>(null);
  readonly verticalExaggeration = signal(10);
  readonly sunElevation = signal(45);
  readonly sunAzimuth = signal(45);
  readonly variables = computed(() => ({
    vert: this.verticalExaggeration(),
    sunEl: this.sunElevation(),
    sunAz: this.sunAzimuth(),
  }));
  readonly scaled = this.createShadedReliefImage();

  readonly tiles = new PMTiles(
    'https://pub-9288c68512ed46eca46ddcade307709b.r2.dev/protomaps-sample-datasets/terrarium_z9.pmtiles',
  );

  readonly loader: Loader = async (z, x, y, { signal }) => {
    const response = await this.tiles.getZxy(z, x, y, signal);
    if (!response) {
      throw new Error('Tile not found');
    }
    const blob = new Blob([response.data]);
    const src = URL.createObjectURL(blob);
    const image = await this.loadImage(src);
    URL.revokeObjectURL(src);
    return image;
  };

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.addEventListener('load', () => resolve(img));
      img.addEventListener('error', () => reject(new Error('load failed')));
      img.src = src;
    });
  }

  /**
   * The method used to extract elevations from the DEM.
   * red * 256 + green + blue / 256 - 32768
   * @param xOffset
   * @param yOffset
   */
  private extractElevation(xOffset: number, yOffset: number): ExpressionValue {
    const red = ['band', 1, xOffset, yOffset];
    const green = ['band', 2, xOffset, yOffset];
    const blue = ['band', 3, xOffset, yOffset];

    // band math operates on normalized values from 0-1
    // so we scale by 255
    return ['+', ['*', 255 * 256, red], ['*', 255, green], ['*', 255 / 256, blue], -32768];
  }

  /**
   * Generates a shaded relief image given elevation data.
   * Uses a 3x3 neighborhood for determining slope and aspect.
   */
  private createShadedReliefImage(): ExpressionValue {
    const dp = ['*', 2, ['resolution']];
    const z0x = ['*', ['var', 'vert'], this.extractElevation(-1, 0)];
    const z1x = ['*', ['var', 'vert'], this.extractElevation(1, 0)];
    const dzdx = ['/', ['-', z1x, z0x], dp];
    const z0y = ['*', ['var', 'vert'], this.extractElevation(0, -1)];
    const z1y = ['*', ['var', 'vert'], this.extractElevation(0, 1)];
    const dzdy = ['/', ['-', z1y, z0y], dp];
    const slope = ['atan', ['sqrt', ['+', ['^', dzdx, 2], ['^', dzdy, 2]]]];
    const aspect = ['clamp', ['atan', ['-', 0, dzdx], dzdy], -Math.PI, Math.PI];
    const sunEl = ['*', Math.PI / 180, ['var', 'sunEl']];
    const sunAz = ['*', Math.PI / 180, ['var', 'sunAz']];

    const incidence = [
      '+',
      ['*', ['sin', sunEl], ['cos', slope]],
      ['*', ['cos', sunEl], ['sin', slope], ['cos', ['-', sunAz, aspect]]],
    ];
    const scaled = ['*', 255, incidence];
    return scaled;
  }

  private getElevation(data: Uint8Array): number {
    const red = data[0];
    const green = data[1];
    const blue = data[2];
    return red * 256 + green + blue / 256 - 32768;
  }

  private formatLocation([lon, lat]: Coordinate): string {
    const NS = lat < 0 ? 'S' : 'N';
    const EW = lon < 0 ? 'W' : 'E';
    return `${Math.abs(lat).toFixed(1)}° ${NS}, ${Math.abs(lon).toFixed(1)}° ${EW}`;
  }

  constructor() {
    useGeographic();
  }

  displayPixelValue(event: MapBrowserEvent<PointerEvent>): void {
    const tileLayer = this.tileLayer().getInstance();
    const data = tileLayer?.getData(event.pixel);

    if (!data) {
      return;
    }

    this.elevation.set(this.getElevation(data as Uint8Array));
    this.location.set(this.formatLocation(event.coordinate));
  }
}
