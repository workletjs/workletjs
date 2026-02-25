import { inject } from '@angular/core';

import { FeatureLike } from 'ol/Feature';
import VectorLayer from 'ol/layer/Vector';
import Cluster from 'ol/source/Cluster';

import { WolVectorLayerComponent } from '@workletjs/ngx-openlayers/layer/vector';

export type DisposeRef = () => void;

export interface ClusterSourceHostRef<T extends Cluster<FeatureLike>> {
  setSource(source: T): DisposeRef;
  getInstance(): VectorLayer | undefined;
}

export function useClusterSourceHostRef<T extends Cluster<FeatureLike>>(
  sourceName: string,
): ClusterSourceHostRef<T> {
  const options = { host: true, optional: true };
  const vectorLayer = inject(WolVectorLayerComponent, options);

  if (vectorLayer) {
    return {
      setSource: (source) => {
        vectorLayer.getInstance()?.setSource(source);
        return () => {
          vectorLayer.getInstance()?.setSource(null);
        };
      },
      getInstance: () => vectorLayer.getInstance(),
    };
  }

  throw new Error(
    `No ClusterSource host found. Please wrap the ${sourceName} component in a ` +
      `VectorLayer component.`,
  );
}
