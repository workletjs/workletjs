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
import { EventsKey } from 'ol/events';
import BaseEvent from 'ol/events/Event';
import { Projection } from 'ol/proj';
import { Size } from 'ol/size';
import SentinelHub, {
  AuthConfig,
  Evalscript,
  ProcessRequestInputDataItem,
} from 'ol/source/SentinelHub';
import { AttributionLike } from 'ol/source/Source';
import { TileSourceEvent } from 'ol/source/Tile';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { DisposeRef, useTileSourceHostRef } from '@workletjs/ngx-openlayers/source/tile';

/**
 * Generates raster tiles from satellite imagery through the Sentinel Hub Processing API.
 *
 * @see [OpenLayers SentinelHub](https://openlayers.org/en/latest/apidoc/module-ol_source_SentinelHub-SentinelHub.html)
 */
@Component({
  selector: 'wol-sentinel-hub-source',
  exportAs: 'wolSentinelHubSource',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolSentinelHubSourceComponent implements OnChanges {
  /**
   * Credits displayed for this source. Accepts a string, an array of strings, or a function.
   * Changes update the source.
   */
  readonly wolAttributions = input<AttributionLike>();
  /**
   * Whether the attribution control can collapse the source credits. Defaults to `true`. Set when
   * creating the source.
   */
  readonly wolAttributionCollapsible = input<boolean>();
  /**
   * Authentication configuration with `clientId` and `clientSecret`, or an access token string.
   * The source waits for authentication, input data, and an Evalscript. Changes update
   * authentication on the source.
   */
  readonly wolAuth = input<AuthConfig | string>();
  /**
   * Input data in the Processing API request, such as the collection and date range. Changes
   * update subsequent requests.
   */
  readonly wolData = input<ProcessRequestInputDataItem[]>();
  /**
   * An Evalscript string or an object whose functions OpenLayers serializes into an Evalscript.
   * Those functions can use values available to the Processing API but cannot close over
   * application variables. Changes update the source.
   */
  readonly wolEvalscript = input<Evalscript | string>();

  /**
   * MIME type sent as `responses[].format.type`. Supports `image/png`, `image/jpeg`, and
   * `image/webp`. Defaults to `image/png`, including when a binding is reset to `undefined`.
   * Changes reload tiles when the source is ready. Unsupported formats throw an error.
   */
  readonly wolFormat = input<string>();

  /**
   * Width and height of the requested tiles in pixels. Defaults to `[512, 512]`. Set when creating
   * the source.
   */
  readonly wolTileSize = input<number | Size>();
  /**
   * Processing API endpoint. Defaults to `https://services.sentinel-hub.com/api/v1/process`. Read
   * at creation.
   */
  readonly wolUrl = input<string>();
  /** Projection for tile requests. Defaults to `EPSG:3857`. Set when creating the source. */
  readonly wolProjection = input<Projection>();
  /**
   * Uses linear interpolation when resampling by default. Set to `false` for nearest-neighbor
   * sampling. Read at creation.
   */
  readonly wolInterpolate = input<boolean>();
  /**
   * Whether the source wraps horizontally across world boundaries. Defaults to `true`. Set when
   * creating the source.
   */
  readonly wolWrapX = input<boolean>();
  /**
   * Tile fade-in duration in milliseconds. Set to `0` to disable the transition. Read at creation.
   */
  readonly wolTransition = input<number>();
  /**
   * Observable OpenLayers properties to set on the source. New values update the supplied keys.
   * Omitted keys keep their current values.
   */
  readonly wolProperties = input<WolProperties>();

  /**
   * Emits when the source revision increases. Inspect its state for `ready` or `error` when
   * configuring authentication or the Evalscript.
   */
  readonly wolChange = output<BaseEvent>();
  /** Forwards the native `error` event emitted by the source. */
  readonly wolError = output<BaseEvent>();
  /**
   * Emits when an observable source property changes. The event provides the property key and its
   * previous value.
   */
  readonly wolPropertyChange = output<ObjectEvent>();
  /**
   * Emits when tile loading finishes, including when a tile that is no longer needed is canceled.
   * The event carries the tile.
   */
  readonly wolTileLoadEnd = output<TileSourceEvent>();
  /** Emits when a tile fails to load. The event carries the failed tile. */
  readonly wolTileLoadError = output<TileSourceEvent>();
  /** Emits when a tile begins loading. The event carries the tile. */
  readonly wolTileLoadStart = output<TileSourceEvent>();

  private instance?: SentinelHub;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useTileSourceHostRef<SentinelHub>('SentinelHub');
    const eventsKey: Record<string, EventsKey> = {};

    let disposeRef: DisposeRef;

    afterNextRender(() => {
      const sentinelHub = new SentinelHub({
        auth: this.wolAuth(),
        data: this.wolData(),
        evalscript: this.wolEvalscript(),
        format: this.wolFormat(),
        tileSize: this.wolTileSize(),
        url: this.wolUrl(),
        projection: this.wolProjection(),
        attributionsCollapsible: this.wolAttributionCollapsible(),
        interpolate: this.wolInterpolate(),
        wrapX: this.wolWrapX(),
        transition: this.wolTransition(),
      });

      if (this.wolAttributions()) {
        sentinelHub.setAttributions(this.wolAttributions());
      }

      if (this.wolProperties()) {
        sentinelHub.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKey['change'] = sentinelHub.on('change', (event) => this.wolChange.emit(event));

      eventsKey['error'] = sentinelHub.on('error', (event) => this.wolError.emit(event));

      eventsKey['propertychange'] = sentinelHub.on('propertychange', (event) =>
        this.wolPropertyChange.emit(event),
      );

      eventsKey['tileloadend'] = sentinelHub.on('tileloadend', (event) =>
        this.wolTileLoadEnd.emit(event),
      );

      eventsKey['tileloaderror'] = sentinelHub.on('tileloaderror', (event) =>
        this.wolTileLoadError.emit(event),
      );

      eventsKey['tileloadstart'] = sentinelHub.on('tileloadstart', (event) =>
        this.wolTileLoadStart.emit(event),
      );

      /**
       * Adding control to the map must be done after the map is rendered,
       * if used with control flow of Angular.
       *
       * In Angular, when rendering a component's template, the control flow statements,
       * such as @if, @else, @else if, @for, and @switch, are evaluated during the template
       * rendering process. This evaluation happens before the actual content within the blocks
       * is rendered to the DOM.
       */
      Promise.resolve().then(() => {
        disposeRef = hostRef.setSource(sentinelHub);
      });

      this.instance = sentinelHub;
    });

    destroyRef.onDestroy(() => {
      if (disposeRef) {
        disposeRef();
      }

      unByKey(Object.values(eventsKey));

      this.instance = undefined;
    });
  }

  /**
   * Respond to input changes.
   * @param changes The changed inputs
   * @internal
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (!this.instance) {
      return;
    }

    for (const [key, change] of Object.entries(changes)) {
      switch (key) {
        case 'wolAttributions':
          this.instance.setAttributions(change.currentValue);
          break;
        case 'wolAuth':
          this.instance.setAuth(change.currentValue);
          break;
        case 'wolData':
          this.instance.setData(change.currentValue);
          break;
        case 'wolEvalscript':
          this.instance.setEvalscript(change.currentValue);
          break;
        case 'wolFormat':
          this.instance.setFormat(change.currentValue ?? 'image/png');
          break;
        case 'wolProperties':
          this.instance.setProperties(change.currentValue ?? {});
          break;
      }
    }
  }

  /**
   * Returns the OpenLayers SentinelHub instance.
   *
   * @returns The source after rendering, or `undefined` before creation and after destruction.
   */
  getInstance(): SentinelHub | undefined {
    return this.instance;
  }
}
