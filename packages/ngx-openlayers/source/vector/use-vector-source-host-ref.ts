import { inject } from '@angular/core';
import { WolHeatmapLayerComponent } from '@workletjs/ngx-openlayers/layer/heatmap';
import { WolVectorLayerComponent } from '@workletjs/ngx-openlayers/layer/vector';
import { WolVectorImageLayerComponent } from '@workletjs/ngx-openlayers/layer/vector-image';
import { WolWebGLVectorLayerComponent } from '@workletjs/ngx-openlayers/layer/webgl-vector';
import { FeatureLike } from 'ol/Feature';
import Heatmap from 'ol/layer/Heatmap';
import VectorLayer from 'ol/layer/Vector';
import VectorImageLayer from 'ol/layer/VectorImage';
import WebGLVectorLayer from 'ol/layer/WebGLVector';
import VectorSource from 'ol/source/Vector';

export type DisposeRef = () => void;

export interface VectorSourceHostRef<T extends VectorSource<FeatureLike>> {
  setSource(source: T): DisposeRef;
  getInstance():
    | Heatmap<FeatureLike>
    | VectorImageLayer
    | VectorLayer
    | WebGLVectorLayer
    | undefined;
}

export function useVectorSourceHostRef<T extends VectorSource<FeatureLike>>(
  sourceName: string,
): VectorSourceHostRef<T> {
  const options = { host: true, optional: true };
  const heatmapLayer = inject(WolHeatmapLayerComponent, options);
  const vectorImageLayer = inject(WolVectorImageLayerComponent, options);
  const vectorLayer = inject(WolVectorLayerComponent, options);
  const webglVectorLayer = inject(WolWebGLVectorLayerComponent, options);

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
  } else if (vectorLayer) {
    return {
      setSource: (source) => {
        vectorLayer.getInstance()?.setSource(source);
        return () => {
          vectorLayer.getInstance()?.setSource(null);
        };
      },
      getInstance: () => vectorLayer.getInstance(),
    };
  } else if (webglVectorLayer) {
    return {
      setSource: (source) => {
        webglVectorLayer.getInstance()?.setSource(source);
        return () => {
          webglVectorLayer.getInstance()?.setSource(null);
        };
      },
      getInstance: () => webglVectorLayer.getInstance(),
    };
  }

  throw new Error(
    `No VectorSource host found. Please wrap the ${sourceName} component in a ` +
      `HeatmapLayer, VectorImageLayer, VectorLayer or WebGLVectorLayer component.`,
  );
}
