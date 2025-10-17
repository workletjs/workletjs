import { inject, InjectOptions } from '@angular/core';
import { WolImageLayerComponent } from '@workletjs/ngx-openlayers/layer/image';
import { WolRasterSourceComponent } from '@workletjs/ngx-openlayers/source/raster';
import ImageLayer from 'ol/layer/Image';
import ImageSource from 'ol/source/Image';
import RasterSource from 'ol/source/Raster';

export interface DisposeRef {
  (): void;
}

export interface ImageSourceHostRef<T extends ImageSource> {
  setSource(source: T): DisposeRef;
  getInstance(): ImageLayer<T> | RasterSource | undefined;
}

export function useImageSourceHostRef<T extends ImageSource>(
  sourceName: string,
): ImageSourceHostRef<T> {
  const options: InjectOptions = { host: true, optional: true };
  const rasterSource = inject(WolRasterSourceComponent, options);
  const imageLayer = inject(WolImageLayerComponent, options);

  if (rasterSource) {
    return {
      setSource: (source) => {
        rasterSource.addSource(source);
        return () => {
          rasterSource.removeSource(source);
        };
      },
      getInstance: () => rasterSource.getInstance(),
    };
  }

  if (imageLayer) {
    return {
      setSource: (source) => {
        imageLayer.getInstance()?.setSource(source);
        return () => {
          imageLayer.getInstance()?.setSource(null);
        };
      },
      getInstance: () => imageLayer.getInstance() as ImageLayer<T> | undefined,
    };
  }

  throw new Error(
    `No image source host found. Please wrap the ${sourceName} source component in an ImageLayer component.`,
  );
}
