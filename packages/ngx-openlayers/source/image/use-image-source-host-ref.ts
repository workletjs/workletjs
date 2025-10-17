import { inject } from '@angular/core';
import { WolImageLayerComponent } from '@workletjs/ngx-openlayers/layer/image';
import ImageLayer from 'ol/layer/Image';
import ImageSource from 'ol/source/Image';

export interface ImageSourceHostRef<T extends ImageSource> {
  setSource(source: T | null): void;
  getInstance(): ImageLayer<T> | undefined;
}

export function useImageSourceHostRef<T extends ImageSource>(
  sourceName: string,
): ImageSourceHostRef<T> {
  const imageLayer = inject(WolImageLayerComponent, { host: true, optional: true });

  if (imageLayer) {
    return {
      setSource: (source) => {
        imageLayer.getInstance()?.setSource(source);
      },
      getInstance: () => imageLayer.getInstance() as ImageLayer<T> | undefined,
    };
  }

  throw new Error(
    `No image source host found. Please wrap the ${sourceName} source component in an ImageLayer component.`,
  );
}
