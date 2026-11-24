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

import ImageTile from 'ol/ImageTile';
import { ObjectEvent } from 'ol/Object';
import { unByKey } from 'ol/Observable';
import { LoadFunction } from 'ol/Tile';
import { NearestDirectionFunction } from 'ol/array';
import { EventsKey } from 'ol/events';
import BaseEvent from 'ol/events/Event';
import { ProjectionLike } from 'ol/proj';
import { AttributionLike } from 'ol/source/Source';
import { TileSourceEvent } from 'ol/source/Tile';
import WMTS, { RequestEncoding } from 'ol/source/WMTS';
import WMTSTileGrid from 'ol/tilegrid/WMTS';

import { WolProperties, WolSafeAny } from '@workletjs/ngx-openlayers/core/types';
import { DisposeRef, useTileSourceHostRef } from '@workletjs/ngx-openlayers/source/tile';

/**
 * Requests tiles from a Web Map Tile Service (WMTS) for a configured layer, style, and tile matrix
 * set.
 *
 * @see [OpenLayers WMTS](https://openlayers.org/en/latest/apidoc/module-ol_source_WMTS-WMTS.html)
 */
@Component({
  selector: 'wol-wmts-source',
  exportAs: 'wolWMTSSource',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolWMTSSourceComponent implements OnChanges {
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
   * Legacy tile cache option supplied at source creation for compatibility.
   * OpenLayers 10.11.0 manages the cache on the rendering layer.
   *
   * @deprecated Configure `wolCacheSize` on a compatible layer.
   */
  readonly wolCacheSize = input<number>();
  /**
   * CORS mode for the tile images. Set a value and enable CORS on the server for canvas pixel
   * access. Read at creation.
   */
  readonly wolCrossOrigin = input<string | null>();
  /**
   * Uses linear interpolation when resampling by default. Set to `false` for nearest-neighbor
   * sampling. Read at creation.
   */
  readonly wolInterpolate = input<boolean>();
  /**
   * Required grid for the advertised WMTS tile matrix set. Until source creation it sets the
   * source grid. Changing it afterward can register a grid for `wolProjection` when both inputs
   * are set and that projection has no registered grid.
   */
  readonly wolTileGrid = input.required<WMTSTileGrid>();
  /**
   * Projection of the source grid. The view projection is used when omitted. After creation,
   * changes can register `wolTileGrid` for this projection when both inputs are set and that
   * projection has no registered grid.
   */
  readonly wolProjection = input<ProjectionLike>();
  /**
   * Maximum reprojection error in pixels. Defaults to `0.5`. A larger value trades precision for
   * faster reprojection. Read at creation.
   */
  readonly wolReprojectionErrorThreshold = input<number>();
  /** Encodes requests as `KVP` (the default) or fills a `REST` URL template. Read at creation. */
  readonly wolRequestEncoding = input<RequestEncoding>();
  /** Required layer identifier as advertised in the WMTS capabilities. Read at creation. */
  readonly wolLayer = input.required<string>();
  /** Required style identifier from the advertised styles for the layer. Read at creation. */
  readonly wolStyle = input.required<string>();
  /**
   * Class used to create image tiles. Defaults to the OpenLayers `ImageTile` class. Read at
   * creation.
   */
  readonly wolTileClass = input<typeof ImageTile>();
  /**
   * Ratio of actual tile image pixels to the advertised tile size. Defaults to `1`. Use `2` for
   * 512-pixel images served as 256-pixel tiles. Read at creation.
   */
  readonly wolTilePixelRatio = input<number>();
  /** Image MIME type used for KVP requests. Defaults to `image/jpeg`. Read at creation. */
  readonly wolFormat = input<string>();
  /** WMTS protocol version. Defaults to `1.0.0`. Read at creation. */
  readonly wolVersion = input<string>();
  /** Required identifier of the advertised tile matrix set. Read at creation. */
  readonly wolMatrixSet = input.required<string>();
  /**
   * Values keyed by advertised WMTS dimension, such as `Time`. Changes merge the supplied values
   * into the source's current dimensions.
   */
  readonly wolDimensions = input<{ [key: string]: WolSafeAny }>();
  /**
   * Service endpoint for KVP requests or tile URL template for REST requests. At creation
   * `wolUrls` takes precedence when supplied. Changes replace the URL list.
   */
  readonly wolUrl = input<string>();
  /**
   * Callback that receives an image tile and its URL. The default assigns the URL to the tile
   * image. The binding is read only at creation.
   */
  readonly wolTileLoadFunction = input<LoadFunction>();
  /**
   * Service endpoints or REST templates used to distribute tile requests. At creation this list
   * takes precedence over `wolUrl`. Changes replace the URLs.
   */
  readonly wolUrls = input<string[]>();
  /**
   * Whether the source wraps horizontally across world boundaries. Defaults to `false`. Read at
   * creation.
   */
  readonly wolWrapX = input<boolean>();
  /**
   * Tile fade-in duration in milliseconds. Set to `0` to disable the transition. Read at creation.
   */
  readonly wolTransition = input<number>();
  /**
   * Selects the tile level between available resolutions. Positive favors coarser tiles, negative
   * favors finer tiles, and `0` (the default) selects the nearest. A function can choose the
   * direction. Read at creation.
   */
  readonly wolZDirection = input<number | NearestDirectionFunction>();
  /** Referrer policy used when requesting tile images. Set when creating the source. */
  readonly wolReferrerPolicy = input<ReferrerPolicy>();
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
   * Emits when a tile finishes loading successfully.
   * The event carries the tile.
   */
  readonly wolTileLoadEnd = output<TileSourceEvent>();
  /** Emits when a tile fails to load. The event carries the failed tile. */
  readonly wolTileLoadError = output<TileSourceEvent>();
  /** Emits when a tile begins loading. The event carries the tile. */
  readonly wolTileLoadStart = output<TileSourceEvent>();

  private instance?: WMTS;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useTileSourceHostRef<WMTS>('WMTS');
    const eventsKey: Record<string, EventsKey> = {};

    let disposeRef: DisposeRef;

    afterNextRender(() => {
      const wmts = new WMTS({
        attributions: this.wolAttributions(),
        attributionsCollapsible: this.wolAttributionsCollapsible(),
        cacheSize: this.wolCacheSize(),
        crossOrigin: this.wolCrossOrigin(),
        interpolate: this.wolInterpolate(),
        tileGrid: this.wolTileGrid(),
        projection: this.wolProjection(),
        reprojectionErrorThreshold: this.wolReprojectionErrorThreshold(),
        requestEncoding: this.wolRequestEncoding(),
        layer: this.wolLayer(),
        style: this.wolStyle(),
        tileClass: this.wolTileClass(),
        tilePixelRatio: this.wolTilePixelRatio(),
        format: this.wolFormat(),
        version: this.wolVersion(),
        matrixSet: this.wolMatrixSet(),
        dimensions: this.wolDimensions(),
        url: this.wolUrl(),
        tileLoadFunction: this.wolTileLoadFunction(),
        urls: this.wolUrls(),
        wrapX: this.wolWrapX(),
        transition: this.wolTransition(),
        zDirection: this.wolZDirection(),
        referrerPolicy: this.wolReferrerPolicy(),
      });

      if (this.wolProperties()) {
        wmts.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKey['change'] = wmts.on('change', (event) => this.wolChange.emit(event));

      eventsKey['error'] = wmts.on('error', (event) => this.wolError.emit(event));

      eventsKey['propertychange'] = wmts.on('propertychange', (event) =>
        this.wolPropertyChange.emit(event),
      );

      eventsKey['tileloadend'] = wmts.on('tileloadend', (event) => this.wolTileLoadEnd.emit(event));

      eventsKey['tileloaderror'] = wmts.on('tileloaderror', (event) =>
        this.wolTileLoadError.emit(event),
      );

      eventsKey['tileloadstart'] = wmts.on('tileloadstart', (event) =>
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
        disposeRef = hostRef.setSource(wmts);
      });

      this.instance = wmts;
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
   * @param changes The changed inputs
   * @internal
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (!this.instance) {
      return;
    }

    const tileGrid = this.wolTileGrid();
    const projection = this.wolProjection();

    for (const [key, change] of Object.entries(changes)) {
      switch (key) {
        case 'wolAttributions':
          this.instance.setAttributions(change.currentValue);
          break;
        case 'wolProperties':
          this.instance.setProperties(change.currentValue ?? {});
          break;
        case 'wolLoadFunction':
          this.instance.setTileLoadFunction(change.currentValue);
          break;
        case 'wolUrl':
          this.instance.setUrl(change.currentValue);
          break;
        case 'wolUrls':
          this.instance.setUrls(change.currentValue);
          break;
        case 'wolDimensions':
          this.instance.updateDimensions(change.currentValue);
          break;
        case 'wolTileGrid':
        case 'wolProjection':
          if (tileGrid && projection) {
            this.instance.setTileGridForProjection(projection, tileGrid);
          }
          break;
      }
    }
  }

  /**
   * Returns the OpenLayers WMTS instance.
   *
   * @returns The source after rendering, or `undefined` before creation and after destruction.
   */
  getInstance(): WMTS | undefined {
    return this.instance;
  }
}
