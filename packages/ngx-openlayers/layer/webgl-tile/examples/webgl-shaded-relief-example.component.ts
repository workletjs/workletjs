import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';
import { WolWebGLTileLayerModule } from '@workletjs/ngx-openlayers/layer/webgl-tile';
import { WolImageTileSourceModule } from '@workletjs/ngx-openlayers/source/image-tile';
import { WolOSMSourceComponent } from '@workletjs/ngx-openlayers/source/osm';
import { ExpressionValue } from 'ol/expr/expression';

@Component({
  selector: 'wol-webgl-shaded-relief-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatSliderModule,
    WolMapModule,
    WolViewModule,
    WolWebGLTileLayerModule,
    WolImageTileSourceModule,
    WolOSMSourceComponent,
  ],
  template: `
    <wol-map class="h-96">
      <wol-view [wolCenter]="[-13615645, 4497969]" [wolZoom]="13" />
      <wol-webgl-tile-layer>
        <wol-osm-source />
      </wol-webgl-tile-layer>
      <wol-webgl-tile-layer
        [wolOpacity]="0.3"
        [wolStyle]="{
          variables: this.variables(),
          color: ['color', this.scaled],
        }"
        [wolVariables]="variables()"
      >
        <wol-image-tile-source
          [wolUrl]="'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'"
          [wolMaxZoom]="15"
          [wolAttributions]="attributions"
        />
      </wol-webgl-tile-layer>
    </wol-map>
    <table class="mt-4">
      <tr>
        <td>
          <label for="vert">vertical exaggeration:</label>
        </td>
        <td>
          <mat-slider id="vert" min="1" max="5" step="1">
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
export class WolWebGLShadedReliefExampleComponent {
  readonly attributions =
    '<a href="https://github.com/tilezen/joerd/blob/master/docs/attribution.md" target="_blank">Data sources and attribution</a>';
  readonly verticalExaggeration = signal(1);
  readonly sunElevation = signal(45);
  readonly sunAzimuth = signal(45);
  readonly variables = computed(() => ({
    vert: this.verticalExaggeration(),
    sunEl: this.sunElevation(),
    sunAz: this.sunAzimuth(),
  }));
  readonly scaled = this.createShadedReliefImage();

  /**
   * The method used to extract elevations from the DEM.
   * In this case the format used is Terrarium
   * red * 256 + green + blue / 256 - 32768
   *
   * Other frequently used methods include the Mapbox format
   * (red * 256 * 256 + green * 256 + blue) * 0.1 - 10000
   *
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

    const cosIncidence = [
      '+',
      ['*', ['sin', sunEl], ['cos', slope]],
      ['*', ['cos', sunEl], ['sin', slope], ['cos', ['-', sunAz, aspect]]],
    ];
    const scaled = ['*', 255, cosIncidence];
    return scaled;
  }
}
