import { inject, InjectOptions } from '@angular/core';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolLayerGroupComponent } from '@workletjs/ngx-openlayers/layer/group';
import BaseLayer from 'ol/layer/Base';
import LayerGroup from 'ol/layer/Group';
import Map from 'ol/Map';

export interface LayerHostRef<T extends BaseLayer> {
  addLayer(layer: T): void;
  removeLayer(layer: T): T | undefined;
  getInstance(): Map | LayerGroup | undefined;
}

export function useLayerHostRef<T extends BaseLayer>(layerName: string): LayerHostRef<T> {
  const options: InjectOptions = { host: true, optional: true };
  const mapHost = inject(WolMapComponent, options);
  const layerGroupHost = inject(WolLayerGroupComponent, options);

  if (layerGroupHost) {
    return {
      addLayer: (layer) => {
        layerGroupHost.getInstance()?.getLayers().push(layer);
      },
      removeLayer: (layer) => {
        return layerGroupHost.getInstance()?.getLayers().remove(layer) as typeof layer;
      },
      getInstance: () => layerGroupHost.getInstance(),
    };
  }

  if (mapHost) {
    return {
      addLayer: (layer) => {
        mapHost.getInstance()?.addLayer(layer);
      },
      removeLayer: (layer) => {
        return mapHost.getInstance()?.removeLayer(layer) as typeof layer;
      },
      getInstance: () => mapHost.getInstance(),
    };
  }

  throw new Error(
    `No layer host found. Please wrap the ${layerName} component in a Map or LayerGroup component.`,
  );
}
