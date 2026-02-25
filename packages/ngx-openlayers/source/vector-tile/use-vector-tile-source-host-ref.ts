import { InjectOptions, inject } from '@angular/core';

import { FeatureLike } from 'ol/Feature';
import VectorTileLayer from 'ol/layer/VectorTile';
import WebGLVectorTileLayer from 'ol/layer/WebGLVectorTile';
import RenderFeature from 'ol/render/Feature';
import VectorTileSource from 'ol/source/VectorTile';

import { WolVectorTileLayerComponent } from '@workletjs/ngx-openlayers/layer/vector-tile';
import { WolWebGLVectorTileLayerComponent } from '@workletjs/ngx-openlayers/layer/webgl-vector-tile';

export type DisposeRef = () => void;

export interface VectorTileSourceHostRef<T extends VectorTileSource<FeatureLike>> {
  setSource(source: T): DisposeRef;
  getInstance(): VectorTileLayer | WebGLVectorTileLayer | undefined;
}

export function useVectorTileSourceHostRef<T extends VectorTileSource<FeatureLike>>(
  sourceName: string,
): VectorTileSourceHostRef<T> {
  const options: InjectOptions = { host: true, optional: true };
  const vectorTileLayer = inject(WolVectorTileLayerComponent, options);
  const webGLVectorTileLayer = inject(WolWebGLVectorTileLayerComponent, options);

  if (vectorTileLayer) {
    return {
      setSource: (source) => {
        vectorTileLayer.getInstance()?.setSource(source);
        return () => {
          vectorTileLayer.getInstance()?.setSource(null);
        };
      },
      getInstance: () => vectorTileLayer.getInstance(),
    };
  }

  if (webGLVectorTileLayer) {
    return {
      setSource: (source) => {
        webGLVectorTileLayer.getInstance()?.setSource(source as VectorTileSource<RenderFeature>);
        return () => {
          webGLVectorTileLayer.getInstance()?.setSource(null);
        };
      },
      getInstance: () => webGLVectorTileLayer.getInstance(),
    };
  }

  throw new Error(
    `No VectorTileSource host found. Please wrap the ${sourceName} component in a ` +
      `VectorTileLayer or WebGLVectorTileLayer component.`,
  );
}
