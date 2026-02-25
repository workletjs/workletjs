import { InjectOptions, inject } from '@angular/core';

import Feature from 'ol/Feature';
import { Geometry } from 'ol/geom';

import { WolFeatureComponent } from '@workletjs/ngx-openlayers/feature';

export interface wolGeometryHostRef<T extends Geometry> {
  setGeometry(geometry: T): void;
  getGeometry(): T | undefined;
  getInstance(): Feature<T> | undefined;
}

export function useGeometryHostRef<T extends Geometry>(
  geometryName: string,
): wolGeometryHostRef<T> {
  const options: InjectOptions = { optional: true, host: true };
  const featureRef = inject(WolFeatureComponent, options);

  if (featureRef) {
    return {
      setGeometry(geometry: T): void {
        featureRef.getInstance()?.setGeometry(geometry);
      },
      getGeometry(): T | undefined {
        return featureRef.getInstance()?.getGeometry() as T | undefined;
      },
      getInstance(): Feature<T> | undefined {
        return featureRef.getInstance() as Feature<T> | undefined;
      },
    };
  }

  throw new Error(
    `No geometry host found. Please wrap the ${geometryName} geometry component in a Feature component.`,
  );
}
