import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';
import { WolWebGLVectorLayerModule } from '@workletjs/ngx-openlayers/layer/webgl-vector';
import { WolVectorSourceModule } from '@workletjs/ngx-openlayers/source/vector';
import { WolFlowLayerModule } from '@workletjs/ngx-openlayers/layer/flow';
import { WolDataTileSourceModule } from '@workletjs/ngx-openlayers/source/data-tile';
import { DEVICE_PIXEL_RATIO } from 'ol/has';
import { Loader } from 'ol/source/DataTile';
import { createXYZ, wrapX } from 'ol/tilegrid';
import { get as getProjection, Projection, transform } from 'ol/proj';
import GeoJSON from 'ol/format/GeoJSON';
import colormap from 'colormap';

/**
 * Performs bilinear interpolation for the given values.
 */
function bilinearInterpolation(
  xAlong: number,
  yAlong: number,
  v11: number,
  v21: number,
  v12: number,
  v22: number,
): number {
  const q11 = (1 - xAlong) * (1 - yAlong) * v11;
  const q21 = xAlong * (1 - yAlong) * v21;
  const q12 = (1 - xAlong) * yAlong * v12;
  const q22 = xAlong * yAlong * v22;
  return q11 + q21 + q12 + q22;
}

/**
 * Interpolates the pixel values at the given position between the four surrounding pixels.
 */
function interpolatePixels(
  xAlong: number,
  yAlong: number,
  p11: number[],
  p21: number[],
  p12: number[],
  p22: number[],
): number[] {
  return p11.map((_, i) => bilinearInterpolation(xAlong, yAlong, p11[i], p21[i], p12[i], p22[i]));
}

const windData = new Promise<{ data: Uint8ClampedArray; width: number; height: number }>(
  (resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const width = image.width;
      const height = image.height;
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext('2d') as CanvasRenderingContext2D;
      context.drawImage(image, 0, 0);
      const data = context.getImageData(0, 0, width, height).data;
      resolve({ data, width, height });
    };
    image.onerror = () => {
      reject(new Error('failed to load'));
    };
    image.crossOrigin = 'anonymous';
    image.src = 'https://openlayers.org/en/latest/examples/data/wind.png';
  },
);

@Component({
  selector: 'wol-wind-example',
  imports: [
    WolMapModule,
    WolViewModule,
    WolWebGLVectorLayerModule,
    WolVectorSourceModule,
    WolFlowLayerModule,
    WolDataTileSourceModule,
  ],
  template: `
    <wol-map class="h-96" [wolPixelRatio]="pixelRatio">
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="0" />
      <wol-webgl-vector-layer
        [wolStyle]="{
          'fill-color': '#555555',
        }"
      >
        <wol-vector-source
          [wolUrl]="'https://openlayers.org/data/vector/ocean.json'"
          [wolFormat]="geojsonFormat"
        />
      </wol-webgl-vector-layer>
      <wol-flow-layer [wolMaxSpeed]="maxSpeed" [wolStyle]="style">
        <wol-data-tile-source [wolTransition]="0" [wolWrapX]="true" [wolLoader]="loader" />
      </wol-flow-layer>
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolWindExampleComponent {
  destroyed = false;
  readonly pixelRatio = Math.min(DEVICE_PIXEL_RATIO, 2);
  readonly geojsonFormat = new GeoJSON();

  readonly maxSpeed = 20;
  readonly style = {
    color: ['interpolate', ['linear'], ['get', 'speed'], ...this.createColorStops()],
  };
  readonly loader: Loader = async (z: number, x: number, y: number) => {
    const dataTileGrid = createXYZ();
    const dataTileSize = 256;

    const inputImageProjection = getProjection('EPSG:4326') as Projection;
    const dataTileProjection = getProjection('EPSG:3857') as Projection;

    const inputBands = 4;
    const dataBands = 3;

    // range of wind velocities
    // these values are stretched between 0 and 255 in the png
    const minU = -21.32;
    const maxU = 26.8;
    const deltaU = maxU - minU;
    const minV = -21.57;
    const maxV = 21.42;
    const deltaV = maxV - minV;

    const { data: inputData, width: inputWidth, height: inputHeight } = await windData;

    const tileCoord = wrapX(dataTileGrid, [z, x, y], dataTileProjection);
    const extent = dataTileGrid.getTileCoordExtent(tileCoord);
    const resolution = dataTileGrid.getResolution(z);
    const data = new Float32Array(dataTileSize * dataTileSize * dataBands);

    for (let row = 0; row < dataTileSize; ++row) {
      let offset = row * dataTileSize * dataBands;
      const mapY = extent[3] - row * resolution;
      for (let col = 0; col < dataTileSize; ++col) {
        const mapX = extent[0] + col * resolution;
        const [lon, lat] = transform([mapX, mapY], dataTileProjection, inputImageProjection);

        const x = (inputWidth * (lon + 180)) / 360;
        let x1 = Math.floor(x);
        let x2 = Math.ceil(x);
        const xAlong = x - x1;
        if (x1 < 0) {
          x1 += inputWidth;
        }
        if (x2 >= inputWidth) {
          x2 -= inputWidth;
        }

        const y = (inputHeight * (90 - lat)) / 180;
        let y1 = Math.floor(y);
        let y2 = Math.ceil(y);
        const yAlong = y - y1;
        if (y1 < 0) {
          y1 = 0;
        }
        if (y2 >= inputHeight) {
          y2 = inputHeight - 1;
        }

        const corners = [
          [x1, y1],
          [x2, y1],
          [x1, y2],
          [x2, y2],
        ];

        const pixels = corners.map(([cx, cy]) => {
          const inputOffset = (cy * 360 + cx) * inputBands;
          return [inputData[inputOffset], inputData[inputOffset + 1]];
        });

        const interpolated = interpolatePixels(
          xAlong,
          yAlong,
          pixels[0],
          pixels[1],
          pixels[2],
          pixels[3],
        );
        const u = minU + (deltaU * interpolated[0]) / 255;
        const v = minV + (deltaV * interpolated[1]) / 255;

        data[offset] = u;
        data[offset + 1] = v;
        offset += dataBands;
      }
    }
    return data;
  };

  private createColorStops() {
    const colors = colormap({
      colormap: 'viridis',
      nshades: 10,
      alpha: 0.75,
      format: 'rgba',
    });
    const colorStops = [];
    for (let i = 0; i < colors.length; ++i) {
      colorStops.push((i * this.maxSpeed) / (colors.length - 1));
      colorStops.push(colors[i]);
    }
    return colorStops;
  }
}
