import { InjectOptions, inject } from '@angular/core';

import Map from 'ol/Map';
import OverviewMap from 'ol/control/OverviewMap';
import BaseLayer from 'ol/layer/Base';
import LayerGroup from 'ol/layer/Group';

import { WolOverviewMapControlComponent } from '@workletjs/ngx-openlayers/control/overview-map';
import { WolLayerGroupComponent } from '@workletjs/ngx-openlayers/layer/group';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';

export interface LayerHostRef<T extends BaseLayer> {
  addLayer(layer: T): void;
  removeLayer(layer: T): T | undefined;
  getInstance(): Map | OverviewMap | LayerGroup | undefined;
}

export function useLayerHostRef<T extends BaseLayer>(layerName: string): LayerHostRef<T> {
  const options: InjectOptions = { host: true, optional: true };
  const mapHost = inject(WolMapComponent, options);
  const overviewMap = inject(WolOverviewMapControlComponent, options);
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

  if (overviewMap) {
    return {
      addLayer: (layer) => {
        overviewMap.getInstance()?.getOverviewMap().getLayers().push(layer);
      },
      removeLayer: (layer) => {
        return overviewMap.getInstance()?.getOverviewMap().getLayers().remove(layer) as
          | T
          | undefined;
      },
      getInstance: () => overviewMap.getInstance(),
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
