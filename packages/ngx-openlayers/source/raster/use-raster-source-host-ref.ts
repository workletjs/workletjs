import { inject } from '@angular/core';
import { WolImageLayerComponent } from '@workletjs/ngx-openlayers/layer/image';
import ImageLayer from 'ol/layer/Image';
import RasterSource from 'ol/source/Raster';

export interface RasterSourceHostRef {
  setSource(source: RasterSource | null): void;
  getInstance(): ImageLayer<RasterSource> | undefined;
}

export function useRasterSourceHostRef(): RasterSourceHostRef {
  const imageLayer = inject(WolImageLayerComponent, { host: true, optional: true });

  if (imageLayer) {
    return {
      setSource: (source) => {
        imageLayer.getInstance()?.setSource(source);
      },
      getInstance: () => imageLayer.getInstance() as ImageLayer<RasterSource> | undefined,
    };
  }

  throw new Error(
    `No raster source host found. Please wrap the Raster source component in an ImageLayer component.`,
  );
}
