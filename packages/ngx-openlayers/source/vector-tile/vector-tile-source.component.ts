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

import { FeatureLike } from 'ol/Feature';
import { ObjectEvent } from 'ol/Object';
import { unByKey } from 'ol/Observable';
import { LoadFunction, UrlFunction } from 'ol/Tile';
import VectorTile from 'ol/VectorTile';
import { NearestDirectionFunction } from 'ol/array';
import { EventsKey } from 'ol/events';
import BaseEvent from 'ol/events/Event';
import { Extent } from 'ol/extent';
import FeatureFormat from 'ol/format/Feature';
import { ProjectionLike } from 'ol/proj';
import { Size } from 'ol/size';
import { AttributionLike, State } from 'ol/source/Source';
import { TileSourceEvent } from 'ol/source/Tile';
import VectorTileSource from 'ol/source/VectorTile';
import { TileGrid } from 'ol/tilegrid';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';

import { DisposeRef, useVectorTileSourceHostRef } from './use-vector-tile-source-host-ref';

/**
 * Loads tiled vector features for rendering in a vector tile layer.
 *
 * @see [OpenLayers VectorTile](https://openlayers.org/en/latest/apidoc/module-ol_source_VectorTile-VectorTile.html)
 */
@Component({
  selector: 'wol-vector-tile-source',
  exportAs: 'wolVectorTileSource',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolVectorTileSourceComponent implements OnChanges {
  /**
   * Credits displayed for this source. Accepts a string, an array of strings, or a function.
   * Changes update the source.
   */
  readonly wolAttributions = input<AttributionLike>();
  /**
   * Whether the attribution control can collapse the source credits. Defaults to `true`. Set when
   * creating the source.
   */
  readonly wolAttributionsCollapsible = input<boolean>();
  /**
   * Initial source tile cache size. OpenLayers can grow it to hold at least twice the tiles in the
   * viewport. Read at creation.
   */
  readonly wolCacheSize = input<number>();
  /**
   * Extent in source coordinates for the generated grid. Defaults to the projection extent. A
   * supplied `wolTileGrid` determines its own extent. Read at creation.
   */
  readonly wolExtent = input<Extent>();
  /**
   * Parser for tile features, such as MVT. The default tile loader requires a format. Read at
   * creation.
   */
  readonly wolFormat = input<FeatureFormat<FeatureLike>>();
  /**
   * Allows overlapping geometries by default. Set to `false` if features do not overlap so the
   * renderer can optimize fills and strokes. Read at creation.
   */
  readonly wolOverlaps = input<boolean>();
  /** Projection for the vector tiles. Defaults to `EPSG:3857`. Read at creation. */
  readonly wolProjection = input<ProjectionLike>();
  /** Initial state of the source, such as `ready` or `loading`. Defaults to `ready`. */
  readonly wolState = input<State>();
  /**
   * Class used to create vector tiles. Defaults to the OpenLayers `VectorTile` class. Read at
   * creation.
   */
  readonly wolTileClass = input<typeof VectorTile>();
  /**
   * Highest zoom of the generated grid. Defaults to `22`. A supplied `wolTileGrid` determines its
   * own zoom levels. Read at creation.
   */
  readonly wolMaxZoom = input<number>();
  /**
   * Lowest zoom of the generated grid. Defaults to `0`. A supplied `wolTileGrid` determines its
   * own zoom levels. Read at creation.
   */
  readonly wolMinZoom = input<number>();
  /**
   * Tile size for the generated grid in pixels. Defaults to `512`. A supplied `wolTileGrid`
   * determines its own tile size. Read at creation.
   */
  readonly wolTileSize = input<number | Size>();
  /**
   * Resolution at zoom zero for the generated grid. A supplied `wolTileGrid` determines its own
   * resolutions. Read at creation.
   */
  readonly wolMaxResolution = input<number>();
  /**
   * Tile grid for the service. When omitted, OpenLayers builds a grid from the extent, tile size,
   * and zoom options. Read at creation.
   */
  readonly wolTileGrid = input<TileGrid>();
  /**
   * Callback that loads a vector tile given its URL. The default uses `wolFormat`. A custom
   * callback can install a loader for extent-aware decoding and supply the decoded features to the
   * tile. Changes update the callback.
   */
  readonly wolTileLoadFunction = input<LoadFunction>();
  /**
   * Callback that picks a URL using the tile coordinate, pixel ratio, and projection. At creation,
   * omit `wolUrl` and `wolUrls` to use the callback. Changes set the callback on the existing
   * source.
   */
  readonly wolTileUrlFunction = input<UrlFunction>();
  /**
   * Tile URL template containing `{z}`, `{x}`, and `{y}` or `{-y}`. At creation `wolUrls` takes
   * precedence when supplied. Changes replace the URL list with this template.
   */
  readonly wolUrl = input<string>();
  /**
   * Tile fade-in duration in milliseconds. Set to `0` to disable the transition. Read at creation.
   */
  readonly wolTransition = input<number>();
  /**
   * Tile URL templates used to distribute requests. At creation this list takes precedence over
   * `wolUrl`. Changes replace the templates.
   */
  readonly wolUrls = input<string[]>();
  /**
   * Whether the source wraps horizontally across world boundaries. Defaults to `true`. Set when
   * creating the source.
   */
  readonly wolWrapX = input<boolean>();
  /**
   * Selects the tile level between available resolutions. Defaults to `1` (coarser tiles). A
   * negative value favors finer tiles, and `0` selects the nearest. A function can choose the
   * direction. Read at creation.
   */
  readonly wolZDirection = input<number | NearestDirectionFunction>();
  /**
   * Observable OpenLayers properties to set on the source. New values update the supplied keys.
   * Omitted keys keep their current values.
   */
  readonly wolProperties = input<WolProperties>();

  /** Emits the source's `change` event when its revision increases. */
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

  private instance?: VectorTileSource<FeatureLike>;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useVectorTileSourceHostRef<VectorTileSource<FeatureLike>>('VectorTileSource');
    const eventsKey: Record<string, EventsKey> = {};

    let disposeRef: DisposeRef;

    afterNextRender(() => {
      const vectorTileSource = new VectorTileSource<FeatureLike>({
        attributions: this.wolAttributions(),
        attributionsCollapsible: this.wolAttributionsCollapsible(),
        cacheSize: this.wolCacheSize(),
        extent: this.wolExtent(),
        format: this.wolFormat(),
        overlaps: this.wolOverlaps(),
        projection: this.wolProjection(),
        state: this.wolState(),
        tileClass: this.wolTileClass(),
        maxZoom: this.wolMaxZoom(),
        minZoom: this.wolMinZoom(),
        tileSize: this.wolTileSize(),
        maxResolution: this.wolMaxResolution(),
        tileGrid: this.wolTileGrid(),
        tileLoadFunction: this.wolTileLoadFunction(),
        tileUrlFunction: this.wolTileUrlFunction(),
        url: this.wolUrl(),
        transition: this.wolTransition(),
        urls: this.wolUrls(),
        wrapX: this.wolWrapX(),
        zDirection: this.wolZDirection(),
      });

      if (this.wolProperties()) {
        vectorTileSource.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKey['change'] = vectorTileSource.on('change', (event) => this.wolChange.emit(event));

      eventsKey['error'] = vectorTileSource.on('error', (event) => this.wolError.emit(event));

      eventsKey['propertychange'] = vectorTileSource.on('propertychange', (event) =>
        this.wolPropertyChange.emit(event),
      );

      eventsKey['tileloadend'] = vectorTileSource.on('tileloadend', (event) =>
        this.wolTileLoadEnd.emit(event),
      );

      eventsKey['tileloaderror'] = vectorTileSource.on('tileloaderror', (event) =>
        this.wolTileLoadError.emit(event),
      );

      eventsKey['tileloadstart'] = vectorTileSource.on('tileloadstart', (event) =>
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
        disposeRef = hostRef.setSource(vectorTileSource);
      });

      this.instance = vectorTileSource;
    });

    destroyRef.onDestroy(() => {
      unByKey(Object.values(eventsKey));

      if (disposeRef) {
        disposeRef();
      }

      this.instance = undefined;
    });
  }

  /**
   * Respond to input changes.
   * @param changes The changes object containing the changed inputs.
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
        case 'wolTileUrlFunction':
          this.instance.setTileUrlFunction(change.currentValue);
          break;
        case 'wolUrl':
          this.instance.setUrl(change.currentValue);
          break;
        case 'wolUrls':
          this.instance.setUrls(change.currentValue);
          break;
      }
    }
  }

  /**
   * Returns the OpenLayers VectorTile instance.
   *
   * @returns The source after rendering, or `undefined` before creation and after destruction.
   */
  getInstance(): VectorTileSource<FeatureLike> | undefined {
    return this.instance;
  }
}
