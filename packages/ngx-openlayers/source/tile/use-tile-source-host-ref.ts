import { inject, InjectOptions } from '@angular/core';
import { WolTileLayerComponent } from '@workletjs/ngx-openlayers/layer/tile';
import { WolWebGLTileLayerComponent } from '@workletjs/ngx-openlayers/layer/webgl-tile';
import { WolRasterSourceComponent } from '@workletjs/ngx-openlayers/source/raster';
import TileLayer from 'ol/layer/Tile';
import WebGLTileLayer from 'ol/layer/WebGLTile';
import DataTileSource from 'ol/source/DataTile';
import RasterSource from 'ol/source/Raster';
import TileSource from 'ol/source/Tile';

export type DisposeRef = () => void;

export interface TileSourceHostRef<T extends TileSource | DataTileSource> {
  setSource(source: T): DisposeRef;
  getInstance(): TileLayer | WebGLTileLayer | RasterSource | undefined;
}

export function useTileSourceHostRef<T extends TileSource | DataTileSource>(
  sourceName: string,
): TileSourceHostRef<T> {
  const options: InjectOptions = { host: true, optional: true };
  const rasterSource = inject(WolRasterSourceComponent, options);
  const webglTileLayer = inject(WolWebGLTileLayerComponent, options);
  const tileLayer = inject(WolTileLayerComponent, options);

  if (rasterSource) {
    return {
      setSource: (source) => {
        rasterSource.addSource(source);
        return () => {
          rasterSource.removeSource(source);
        };
      },
      getInstance: () => rasterSource.getInstance(),
    };
  }

  if (webglTileLayer) {
    return {
      setSource: (source) => {
        webglTileLayer.getInstance()?.setSource(source as DataTileSource);
        return () => {
          webglTileLayer.getInstance()?.setSource(null);
        };
      },
      getInstance: () => webglTileLayer.getInstance(),
    };
  }

  if (tileLayer) {
    return {
      setSource: (source) => {
        tileLayer.getInstance()?.setSource(source);
        return () => {
          tileLayer.getInstance()?.setSource(null);
        };
      },
      getInstance: () => tileLayer.getInstance(),
    };
  }

  throw new Error(
    `No TileSource host found. Please wrap the ${sourceName} component in a RasterSource, ` +
      `WebGLTileLayer or TileLayer component.`,
  );
}
