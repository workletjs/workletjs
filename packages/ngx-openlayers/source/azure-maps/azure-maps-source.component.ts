import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnChanges,
  SimpleChanges,
  ViewEncapsulation,
  afterNextRender,
  inject,
  input,
  output,
} from '@angular/core';

import { ObjectEvent } from 'ol/Object';
import { unByKey } from 'ol/Observable';
import { LoadFunction } from 'ol/Tile';
import { NearestDirectionFunction } from 'ol/array';
import { EventsKey } from 'ol/events';
import BaseEvent from 'ol/events/Event';
import { AttributionLike } from 'ol/source/Source';
import { TileSourceEvent } from 'ol/source/Tile';
import XYZ from 'ol/source/XYZ';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { DisposeRef, useTileSourceHostRef } from '@workletjs/ngx-openlayers/source/tile';

export type AzureMapsTileSize = 256 | 512;

/**
 * Provides raster tiles from the Azure Maps Render Get Map Tile API.
 *
 * `wolTilesetId` must identify a raster tileset, for example `microsoft.base.road` or
 * `microsoft.imagery`. Vector tilesets such as `microsoft.base` require a vector-tile renderer.
 * Azure requires the attribution returned by its Get Map Attribution API to be displayed with the
 * rendered tiles.
 *
 * @see [Azure Maps Get Map Tile](https://learn.microsoft.com/en-us/rest/api/maps/render/get-map-tile)
 */
@Component({
  selector: 'wol-azure-maps-source',
  exportAs: 'wolAzureMapsSource',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolAzureMapsSourceComponent implements OnChanges {
  /** Credits displayed for this source. Changes update the existing source. */
  readonly wolAttributions = input<AttributionLike>();
  /** CORS mode for the tile images. Set when creating the source. */
  readonly wolCrossOrigin = input<string | null>();
  /** Whether to use linear interpolation when resampling. Read at source creation. */
  readonly wolInterpolate = input<boolean>();
  /** Azure Maps subscription key. Read when the source is created. */
  readonly wolSubscriptionKey = input.required<string>();
  /** Azure Maps tileset identifier. Use a raster tileset with this image source. */
  readonly wolTilesetId = input.required<string>();
  /** Azure Maps service endpoint. Defaults to the Azure public-cloud endpoint. */
  readonly wolEndpoint = input('https://atlas.microsoft.com');
  /** Azure Maps Render API version. Defaults to `2024-04-01`. */
  readonly wolApiVersion = input('2024-04-01');
  /** Optional IETF language tag forwarded to Azure Maps. Changes update tile URLs. */
  readonly wolLanguage = input<string>();
  /** Optional ISO 8601 timestamp, used by Azure weather tiles. Changes update tile URLs. */
  readonly wolTimeStamp = input<string>();
  /** Optional Azure Maps localized view, such as `AR`, `US`, `Auto`, or `Unified`. */
  readonly wolView = input<string>();
  /** Returned tile size. Azure Maps supports only 256 or 512 pixels. Defaults to `256`. */
  readonly wolTileSize = input<AzureMapsTileSize>(256);
  /** Highest tile zoom level. Read at source creation. */
  readonly wolMaxZoom = input<number>();
  /** Maximum reprojection error in pixels. Read at source creation. */
  readonly wolReprojectionErrorThreshold = input<number>();
  /** Callback that loads a tile image. Changes update the existing source. */
  readonly wolTileLoadFunction = input<LoadFunction>();
  /** Whether tiles wrap horizontally beyond the antimeridian. Read at source creation. */
  readonly wolWrapX = input<boolean>();
  /** Tile fade-in duration in milliseconds. Read at source creation. */
  readonly wolTransition = input<number>();
  /** Selects the tile level between available resolutions. Read at source creation. */
  readonly wolZDirection = input<number | NearestDirectionFunction>();
  /** Additional OpenLayers source properties. Changes update the existing source. */
  readonly wolProperties = input<WolProperties>();

  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
  readonly wolPropertyChange = output<ObjectEvent>();
  readonly wolTileLoadEnd = output<TileSourceEvent>();
  readonly wolTileLoadError = output<TileSourceEvent>();
  readonly wolTileLoadStart = output<TileSourceEvent>();

  private instance?: XYZ;

  /** @internal */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useTileSourceHostRef<XYZ>('XYZ');
    const eventsKey: Record<string, EventsKey> = {};
    let disposeRef: DisposeRef;

    afterNextRender(() => {
      const azureMaps = new XYZ({
        attributions: this.wolAttributions(),
        crossOrigin: this.wolCrossOrigin(),
        interpolate: this.wolInterpolate(),
        maxZoom: this.wolMaxZoom(),
        reprojectionErrorThreshold: this.wolReprojectionErrorThreshold(),
        tileLoadFunction: this.wolTileLoadFunction(),
        tileSize: this.wolTileSize(),
        url: this.getTileUrl(),
        wrapX: this.wolWrapX(),
        transition: this.wolTransition(),
        zDirection: this.wolZDirection(),
      });

      if (this.wolProperties()) {
        azureMaps.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKey['change'] = azureMaps.on('change', (event) => this.wolChange.emit(event));
      eventsKey['error'] = azureMaps.on('error', (event) => this.wolError.emit(event));
      eventsKey['propertychange'] = azureMaps.on('propertychange', (event) =>
        this.wolPropertyChange.emit(event),
      );
      eventsKey['tileloadend'] = azureMaps.on('tileloadend', (event) =>
        this.wolTileLoadEnd.emit(event),
      );
      eventsKey['tileloaderror'] = azureMaps.on('tileloaderror', (event) =>
        this.wolTileLoadError.emit(event),
      );
      eventsKey['tileloadstart'] = azureMaps.on('tileloadstart', (event) =>
        this.wolTileLoadStart.emit(event),
      );

      Promise.resolve().then(() => {
        disposeRef = hostRef.setSource(azureMaps);
      });

      this.instance = azureMaps;
    });

    destroyRef.onDestroy(() => {
      unByKey(Object.values(eventsKey));
      disposeRef?.();
      this.instance = undefined;
    });
  }

  /** @internal */
  ngOnChanges(changes: SimpleChanges): void {
    if (!this.instance) {
      return;
    }

    for (const [key, change] of Object.entries(changes)) {
      switch (key) {
        case 'wolAttributions':
          this.instance.setAttributions(change.currentValue);
          break;
        case 'wolProperties':
          this.instance.setProperties(change.currentValue ?? {});
          break;
        case 'wolTileLoadFunction':
          this.instance.setTileLoadFunction(change.currentValue);
          break;
        case 'wolApiVersion':
        case 'wolEndpoint':
        case 'wolLanguage':
        case 'wolSubscriptionKey':
        case 'wolTileSize':
        case 'wolTilesetId':
        case 'wolTimeStamp':
        case 'wolView':
          this.instance.setUrl(this.getTileUrl());
          break;
      }
    }
  }

  /** Returns the OpenLayers XYZ instance after rendering. */
  getInstance(): XYZ | undefined {
    return this.instance;
  }

  private getTileUrl(): string {
    const params = [
      ['subscription-key', this.wolSubscriptionKey()],
      ['api-version', this.wolApiVersion()],
      ['tilesetId', this.wolTilesetId()],
      ['tileSize', this.wolTileSize()],
    ];

    const language = this.wolLanguage();
    const timeStamp = this.wolTimeStamp();
    const view = this.wolView();

    if (language) params.push(['language', language]);
    if (timeStamp) params.push(['timeStamp', timeStamp]);
    if (view) params.push(['view', view]);

    const query = params
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join('&');

    return `${this.wolEndpoint().replace(/\/$/, '')}/map/tile?${query}&zoom={z}&x={x}&y={y}`;
  }
}
