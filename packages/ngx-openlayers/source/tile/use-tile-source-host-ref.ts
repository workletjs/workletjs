import { inject, InjectOptions } from '@angular/core';
import { WolTileLayerComponent } from '@workletjs/ngx-openlayers/layer/tile';
import { WolRasterSourceComponent } from '@workletjs/ngx-openlayers/source/raster';
import TileLayer from 'ol/layer/Tile';
import RasterSource from 'ol/source/Raster';
import TileSource from 'ol/source/Tile';

export type DisposeRef = () => void;

export interface TileSourceHostRef<T extends TileSource> {
  setSource(source: T): DisposeRef;
  getInstance(): TileLayer | RasterSource | undefined;
}

export function useTileSourceHostRef<T extends TileSource>(
  sourceName: string,
): TileSourceHostRef<T> {
  const options: InjectOptions = { host: true, optional: true };
  const rasterSource = inject(WolRasterSourceComponent, options);
  const tileLayerHost = inject(WolTileLayerComponent, options);

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

  if (tileLayerHost) {
    return {
      setSource: (source) => {
        tileLayerHost.getInstance()?.setSource(source);
        return () => {
          tileLayerHost.getInstance()?.setSource(null);
        };
      },
      getInstance: () => tileLayerHost.getInstance(),
    };
  }

  throw new Error(
    `No tile layer host found. Please wrap the ${sourceName} component in a TileLayer component.`,
  );
}
