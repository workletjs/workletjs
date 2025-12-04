import { inject } from '@angular/core';
import { WolHeatmapLayerComponent } from '@workletjs/ngx-openlayers/layer/heatmap';
import { WolVectorImageLayerComponent } from '@workletjs/ngx-openlayers/layer/vector-image';
import { FeatureLike } from 'ol/Feature';
import Heatmap from 'ol/layer/Heatmap';
import VectorImageLayer from 'ol/layer/VectorImage';
import VectorSource from 'ol/source/Vector';

export type DisposeRef = () => void;

export interface VectorSourceHostRef<T extends VectorSource<FeatureLike>> {
  setSource(source: T): DisposeRef;
  getInstance(): Heatmap<FeatureLike> | VectorImageLayer | undefined;
}

export function useVectorSourceHostRef<T extends VectorSource<FeatureLike>>(
  sourceName: string,
): VectorSourceHostRef<T> {
  const options = { host: true, optional: true };
  const heatmapLayer = inject(WolHeatmapLayerComponent, options);
  const vectorImageLayer = inject(WolVectorImageLayerComponent, options);

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
  } else if (vectorImageLayer) {
    return {
      setSource: (source) => {
        vectorImageLayer.getInstance()?.setSource(source);
        return () => {
          vectorImageLayer.getInstance()?.setSource(null);
        };
      },
      getInstance: () => vectorImageLayer.getInstance(),
    };
  }

  throw new Error(
    `No VectorSource host found. Please wrap the ${sourceName} component in a ` +
      `HeatmapLayer, VectorImageLayer component.`,
  );
}
