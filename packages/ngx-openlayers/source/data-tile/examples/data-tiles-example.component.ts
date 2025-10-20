import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WolWebGLTileLayerModule } from '@workletjs/ngx-openlayers/layer/webgl-tile';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';
import { WolDataTileSourceModule } from '@workletjs/ngx-openlayers/source/data-tile';
import { Loader } from 'ol/source/DataTile';

@Component({
  selector: 'wol-data-tiles-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WolMapModule, WolViewModule, WolWebGLTileLayerModule, WolDataTileSourceModule],
  template: `
    <wol-map class="h-96">
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="0" />
      <wol-webgl-tile-layer>
        <wol-data-tile-source [wolLoader]="loader" [wolTransition]="transition" />
      </wol-webgl-tile-layer>
    </wol-map>
  `,
})
export class WolDataTilesExampleComponent {
  readonly size = 256;
  readonly context: CanvasRenderingContext2D;
  readonly loader: Loader = (z, x, y) => {
    const lineHeight = 30;
    const half = this.size / 2;
    this.context.clearRect(0, 0, this.size, this.size);
    this.context.fillStyle = 'rgba(100, 100, 100, 0.5)';
    this.context.fillRect(0, 0, this.size, this.size);
    this.context.fillStyle = 'black';
    this.context.fillText(`z: ${z}`, half, half - lineHeight);
    this.context.fillText(`x: ${x}`, half, half);
    this.context.fillText(`y: ${y}`, half, half + lineHeight);
    this.context.strokeRect(0, 0, this.size, this.size);
    return this.context.getImageData(0, 0, this.size, this.size).data;
  };
  // disable opacity transition to avoid overlapping labels during tile loading
  readonly transition = 0;

  constructor() {
    const canvas = document.createElement('canvas');
    canvas.width = this.size;
    canvas.height = this.size;

    this.context = canvas.getContext('2d', {
      willReadFrequently: true,
    }) as CanvasRenderingContext2D;
    this.context.strokeStyle = 'white';
    this.context.textAlign = 'center';
    this.context.font = '24px sans-serif';
  }
}
