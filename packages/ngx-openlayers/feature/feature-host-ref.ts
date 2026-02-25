import { InjectOptions, inject } from '@angular/core';

import Feature from 'ol/Feature';
import Cluster from 'ol/source/Cluster';
import VectorSource from 'ol/source/Vector';

import { WolClusterSourceComponent } from '@workletjs/ngx-openlayers/source/cluster';
import { WolVectorSourceComponent } from '@workletjs/ngx-openlayers/source/vector';

export interface WolFeatureHostRef {
  addFeature(feature: Feature): void;
  removeFeature(feature: Feature): void;
  getInstance(): Cluster<Feature> | VectorSource<Feature> | undefined;
}

export function useFeatureHostRef(): WolFeatureHostRef {
  const options: InjectOptions = { host: true, optional: true };
  const clusterRef = inject(WolClusterSourceComponent, options);
  const vectorSourceRef = inject(WolVectorSourceComponent, options);

  if (clusterRef) {
    return {
      addFeature: (feature) => {
        clusterRef.getInstance()?.addFeature(feature);
      },
      removeFeature: (feature) => {
        clusterRef.getInstance()?.removeFeature(feature);
      },
      getInstance: () => clusterRef.getInstance(),
    };
  }

  if (vectorSourceRef) {
    return {
      addFeature: (feature) => {
        vectorSourceRef.getInstance()?.addFeature(feature);
      },
      removeFeature: (feature) => {
        vectorSourceRef.getInstance()?.removeFeature(feature);
      },
      getInstance: () => vectorSourceRef.getInstance() as VectorSource<Feature> | undefined,
    };
  }

  throw new Error(
    `No feature host found. Please wrap the feature component in a Vector or Cluster source component.`,
  );
}
