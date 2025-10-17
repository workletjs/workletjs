import { inject } from '@angular/core';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import Control from 'ol/control/Control';
import Map from 'ol/Map';

export interface ControlHostRef<T extends Control> {
  addControl(control: T): void;
  removeControl(control: T): T | undefined;
  getInstance(): Map | undefined;
}

export function useControlHostRef<T extends Control>(controlName: string): ControlHostRef<T> {
  const mapRef = inject(WolMapComponent, { host: true, optional: true });

  if (mapRef) {
    return {
      addControl: (control) => {
        mapRef.getInstance()?.addControl(control);
      },
      removeControl: (control) => {
        return mapRef.getInstance()?.removeControl(control) as T | undefined;
      },
      getInstance: () => mapRef.getInstance(),
    };
  }

  throw new Error(
    `No control host found. Please wrap the ${controlName} control component in a Map component.`,
  );
}
