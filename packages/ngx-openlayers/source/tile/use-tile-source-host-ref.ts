import { inject, InjectOptions } from '@angular/core';
import { WolTileLayerComponent } from '@workletjs/ngx-openlayers/layer/tile';
import TileLayer from 'ol/layer/Tile';
import TileSource from 'ol/source/Tile';

export interface TileSourceHostRef<T extends TileSource> {
  setSource(source: T | null): void;
  getInstance(): TileLayer | undefined;
}

export function useTileSourceHostRef<T extends TileSource>(
  sourceName: string,
): TileSourceHostRef<T> {
  const options: InjectOptions = { host: true, optional: true };
  const tileLayerHost = inject(WolTileLayerComponent, options);

  if (tileLayerHost) {
    return {
      setSource: (source) => {
        tileLayerHost.getInstance()?.setSource(source);
      },
      getInstance: () => tileLayerHost.getInstance(),
    };
  }

  throw new Error(
    `No tile layer host found. Please wrap the ${sourceName} component in a TileLayer component.`,
  );
}
