import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { WolMapComponent, WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';
import { WolWebGLTileLayerModule } from '@workletjs/ngx-openlayers/layer/webgl-tile';
import { WolImageTileSourceModule } from '@workletjs/ngx-openlayers/source/image-tile';
import { WolOSMSourceModule } from '@workletjs/ngx-openlayers/source/osm';
import { getRenderPixel } from 'ol/render';
import { Size } from 'ol/size';
import RenderEvent from 'ol/render/Event';

@Component({
  selector: 'wol-webgl-layer-swipe-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatSliderModule,
    WolMapModule,
    WolViewModule,
    WolWebGLTileLayerModule,
    WolImageTileSourceModule,
    WolOSMSourceModule,
  ],
  template: `
    <wol-map class="h-96">
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="2" />
      <wol-webgl-tile-layer>
        <wol-osm-source [wolWrapX]="true" />
      </wol-webgl-tile-layer>
      <wol-webgl-tile-layer
        (wolPreRender)="onPreRender($event)"
        (wolPostRender)="onPostRender($event)"
      >
        <wol-image-tile-source
          [wolUrl]="'https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=' + key"
          [wolAttributions]="attributions"
          [wolMaxZoom]="20"
        />
      </wol-webgl-tile-layer>
    </wol-map>
    <div class="px-6 mt-4">
      <mat-slider class="!w-full !m-0" min="0" max="100" step="1">
        <input matSliderThumb [ngModel]="swipeValue()" (ngModelChange)="onSwipeChange($event)" />
      </mat-slider>
    </div>
  `,
})
export class WolWebGLLayerSwipeExampleComponent {
  // Get your own API key at https://www.maptiler.com/cloud/
  readonly key = '8OyphSYjlGSuAe4ZUCkV';
  readonly attributions =
    '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
    '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';

  readonly map = viewChild(WolMapComponent);
  readonly swipeValue = signal(50);

  onSwipeChange(value: number): void {
    this.swipeValue.set(value);
    this.map()?.getInstance()?.render();
  }

  onPreRender(event: RenderEvent): void {
    const map = this.map()?.getInstance();

    if (!map) {
      return;
    }

    const gl = event.context as WebGLRenderingContext;
    gl.enable(gl.SCISSOR_TEST);

    const mapSize = map.getSize() as Size; // [width, height] in CSS pixels

    // get render coordinates and dimensions given CSS coordinates
    const bottomLeft = getRenderPixel(event, [0, mapSize[1]]);
    const topRight = getRenderPixel(event, [mapSize[0], 0]);

    const width = Math.round(((topRight[0] - bottomLeft[0]) * this.swipeValue()) / 100);
    const height = topRight[1] - bottomLeft[1];

    gl.scissor(bottomLeft[0], bottomLeft[1], width, height);
  }

  onPostRender(event: RenderEvent): void {
    const gl = event.context as WebGLRenderingContext;
    gl.disable(gl.SCISSOR_TEST);
  }
}
