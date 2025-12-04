import { inject } from '@angular/core';
import { WolHeatmapLayerComponent } from '@workletjs/ngx-openlayers/layer/heatmap';
import { FeatureLike } from 'ol/Feature';
import Heatmap from 'ol/layer/Heatmap';
import VectorSource from 'ol/source/Vector';

export type DisposeRef = () => void;

export interface VectorSourceHostRef<T extends VectorSource<FeatureLike>> {
  setSource(source: T): DisposeRef;
  getInstance(): Heatmap<FeatureLike> | undefined;
}

export function useVectorSourceHostRef<T extends VectorSource<FeatureLike>>(
  sourceName: string,
): VectorSourceHostRef<T> {
  const options = { host: true, optional: true };
  const heatmapLayer = inject(WolHeatmapLayerComponent, options);

  if (heatmapLayer) {
    return {
      setSource: (source) => {
        heatmapLayer.getInstance()?.setSource(source);
        return () => {
          heatmapLayer.getInstance()?.setSource(null);
        };
      },
      getInstance: () => heatmapLayer.getInstance(),
    };
  }

  throw new Error(
    `No VectorSource host found. Please wrap the ${sourceName} component in a ` +
      `HeatmapLayer component.`,
  );
}
