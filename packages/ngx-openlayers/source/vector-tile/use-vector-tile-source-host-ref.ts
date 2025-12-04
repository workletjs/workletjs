import { inject, InjectOptions } from '@angular/core';
import { WolVectorTileLayerComponent } from '@workletjs/ngx-openlayers/layer/vector-tile';
import { FeatureLike } from 'ol/Feature';
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';

export type DisposeRef = () => void;

export interface VectorTileSourceHostRef<T extends VectorTileSource<FeatureLike>> {
  setSource(source: T): DisposeRef;
  getInstance(): VectorTileLayer | undefined;
}

export function useVectorTileSourceHostRef<T extends VectorTileSource<FeatureLike>>(
  sourceName: string,
): VectorTileSourceHostRef<T> {
  const options: InjectOptions = { host: true, optional: true };
  const vectorTileLayer = inject(WolVectorTileLayerComponent, options);

  if (vectorTileLayer) {
    return {
      setSource: (source) => {
        vectorTileLayer.getInstance()?.setSource(source);
        return () => {
          vectorTileLayer.getInstance()?.setSource(null);
        };
      },
      getInstance: () => vectorTileLayer.getInstance(),
    };
  }

  throw new Error(
    `No VectorTileSource host found. Please wrap the ${sourceName} component in a ` +
      `VectorTileLayer component.`,
  );
}
