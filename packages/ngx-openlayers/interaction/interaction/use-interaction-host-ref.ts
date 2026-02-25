import { inject } from '@angular/core';

import Map from 'ol/Map';
import Interaction from 'ol/interaction/Interaction';

import { WolMapComponent } from '@workletjs/ngx-openlayers/map';

export interface InteractionHostRef<T extends Interaction> {
  addInteraction(interaction: T): void;
  removeInteraction(interaction: T): T | undefined;
  getInstance(): Map | undefined;
}

export function useInteractionHostRef<T extends Interaction>(
  interactionName: string,
): InteractionHostRef<T> {
  const mapRef = inject(WolMapComponent, { host: true, optional: true });

  if (mapRef) {
    return {
      addInteraction: (interaction) => {
        mapRef.getInstance()?.addInteraction(interaction);
      },
      removeInteraction: (interaction) => {
        return mapRef.getInstance()?.removeInteraction(interaction) as T | undefined;
      },
      getInstance: () => mapRef.getInstance(),
    };
  }

  throw new Error(
    `No interaction host found. Please wrap the ${interactionName} interaction component in a Map component.`,
  );
}
