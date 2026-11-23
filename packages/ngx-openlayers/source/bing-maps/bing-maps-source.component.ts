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
import BingMaps from 'ol/source/BingMaps';
import { AttributionLike } from 'ol/source/Source';
import { TileSourceEvent } from 'ol/source/Tile';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { DisposeRef, useTileSourceHostRef } from '@workletjs/ngx-openlayers/source/tile';

/**
 * Provides tiles from a Bing Maps imagery set.
 *
 * See the [OpenLayers BingMaps reference](https://openlayers.org/en/latest/apidoc/module-ol_source_BingMaps-BingMaps.html).
 *
 * Use `wolChange` to check the source state while it retrieves Bing imagery metadata.
 *
 * @deprecated The upstream BingMaps source is deprecated because Bing Maps for Enterprise is retiring. Migrate to ImageTile with Azure Maps. See the [Azure Maps example](https://openlayers.org/en/latest/examples/azure-maps.html).
 */
@Component({
  selector: 'wol-bing-maps-source',
  exportAs: 'wolBingMapsSource',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolBingMapsSourceComponent implements OnChanges {
  /**
   * Custom credits to apply to Bing Maps. OpenLayers sets provider and coverage credits when the
   * imagery metadata arrives. Changes to this input update the existing source.
   */
  readonly wolAttributions = input<AttributionLike>();
  /**
   * Capacity of the source tile cache. Read at source creation.
   *
   * @deprecated Configure `wolCacheSize` on the tile layer.
   */
  readonly wolCacheSize = input<number>();
  /**
   * Requests the high-resolution variant of each map tile when enabled. Defaults to `false`. Read
   * at source creation.
   */
  readonly wolHidpi = input<boolean>();
  /**
   * Culture code for labels and text supplied by Bing Maps. Defaults to `'en-us'`. Read at source
   * creation.
   */
  readonly wolCulture = input<string>();
  /** Required Bing Maps API key for imagery metadata and tiles. Read at source creation. */
  readonly wolKey = input.required<string>();
  /** Required Bing Maps imagery set identifier, such as `'Aerial'`. Read at source creation. */
  readonly wolImagerySet = input.required<string>();
  /**
   * Whether to use linear interpolation when resampling. Defaults to `true`. Set to `false` for
   * nearest-neighbor sampling. Read at source creation.
   */
  readonly wolInterpolate = input<boolean>();
  /**
   * Highest tile zoom level. When omitted, OpenLayers uses the maximum advertised by the Bing
   * imagery set. Read at source creation.
   */
  readonly wolMaxZoom = input<number>();
  /**
   * Maximum reprojection error in pixels. Defaults to `0.5`. Increasing this value trades accuracy
   * for faster reprojection. Read at source creation.
   */
  readonly wolReprojectionErrorThreshold = input<number>();
  /**
   * Callback that loads a tile using its URL. By default, OpenLayers assigns the URL to the tile
   * image. Changes update the loader on the existing source.
   */
  readonly wolTileLoadFunction = input<LoadFunction>();
  /**
   * Whether tiles wrap horizontally beyond the antimeridian. Defaults to `true`. Read at source
   * creation.
   */
  readonly wolWrapX = input<boolean>();
  /**
   * Tile fade-in duration in milliseconds. Defaults to `250`. Set to `0` to disable the fade. Read
   * at source creation.
   */
  readonly wolTransition = input<number>();
  /**
   * Chooses the tile zoom at intermediate view resolutions. Defaults to `0` for the nearest level.
   * Use `1` to favor the coarser level, `-1` for the finer level, or provide a function. Read at
   * source creation.
   */
  readonly wolZDirection = input<number | NearestDirectionFunction>();
  /**
   * Whether Bing should supply placeholder tiles beyond the available zoom for an area. Set to
   * `false` to suppress them. The default depends on the imagery set. Read at source creation.
   */
  readonly wolPlaceholderTiles = input<boolean>();
  /**
   * Additional OpenLayers source properties. Binding changes add or update keys on the existing
   * source.
   */
  readonly wolProperties = input<WolProperties>();

  /**
   * Emits when the source changes. Check the source state for imagery metadata loading, success, or
   * failure.
   */
  readonly wolChange = output<BaseEvent>();
  /** Forwards the OpenLayers source's `error` event. */
  readonly wolError = output<BaseEvent>();
  /** Emits a `propertychange` event with the changed property name and its previous value. */
  readonly wolPropertyChange = output<ObjectEvent>();
  /** Emits when a source tile finishes loading. The event identifies the tile. */
  readonly wolTileLoadEnd = output<TileSourceEvent>();
  /** Emits when a source tile fails to load. The event identifies the tile. */
  readonly wolTileLoadError = output<TileSourceEvent>();
  /** Emits when a source tile starts loading. The event identifies the tile. */
  readonly wolTileLoadStart = output<TileSourceEvent>();

  private instance?: BingMaps;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useTileSourceHostRef<BingMaps>('BingMaps');
    const eventsKey: Record<string, EventsKey> = {};

    let disposeRef: DisposeRef;

    afterNextRender(() => {
      const bingMaps = new BingMaps({
        cacheSize: this.wolCacheSize(),
        hidpi: this.wolHidpi(),
        culture: this.wolCulture(),
        key: this.wolKey(),
        imagerySet: this.wolImagerySet(),
        interpolate: this.wolInterpolate(),
        maxZoom: this.wolMaxZoom(),
        reprojectionErrorThreshold: this.wolReprojectionErrorThreshold(),
        tileLoadFunction: this.wolTileLoadFunction(),
        wrapX: this.wolWrapX(),
        transition: this.wolTransition(),
        zDirection: this.wolZDirection(),
        placeholderTiles: this.wolPlaceholderTiles(),
      });

      if (this.wolAttributions()) {
        bingMaps.setAttributions(this.wolAttributions());
      }

      if (this.wolProperties()) {
        bingMaps.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKey['change'] = bingMaps.on('change', (event) => this.wolChange.emit(event));

      eventsKey['error'] = bingMaps.on('error', (event) => this.wolError.emit(event));

      eventsKey['propertychange'] = bingMaps.on('propertychange', (event) =>
        this.wolPropertyChange.emit(event),
      );

      eventsKey['tileloadend'] = bingMaps.on('tileloadend', (event) =>
        this.wolTileLoadEnd.emit(event),
      );

      eventsKey['tileloaderror'] = bingMaps.on('tileloaderror', (event) =>
        this.wolTileLoadError.emit(event),
      );

      eventsKey['tileloadstart'] = bingMaps.on('tileloadstart', (event) =>
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
        disposeRef = hostRef.setSource(bingMaps);
      });

      this.instance = bingMaps;
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
        case 'wolProperties':
          this.instance.setProperties(change.currentValue ?? {});
          break;
        case 'wolTileLoadFunction':
          this.instance.setTileLoadFunction(change.currentValue);
          break;
      }
    }
  }

  /**
   * Gets the OpenLayers source created by this component.
   *
   * @returns The OpenLayers `BingMaps` instance, or `undefined` before creation and after
   * destruction.
   */
  getInstance(): BingMaps | undefined {
    return this.instance;
  }
}
