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
import { ProjectionLike } from 'ol/proj';
import { AttributionLike } from 'ol/source/Source';
import { TileSourceEvent } from 'ol/source/Tile';
import TileArcGISRest from 'ol/source/TileArcGISRest';
import { TileGrid } from 'ol/tilegrid';

import { WolProperties, WolSafeAny } from '@workletjs/ngx-openlayers/core/types';
import { DisposeRef, useTileSourceHostRef } from '@workletjs/ngx-openlayers/source/tile';

/**
 * Requests tiled map or image exports from an ArcGIS REST service.
 *
 * @see [OpenLayers TileArcGISRest](https://openlayers.org/en/latest/apidoc/module-ol_source_TileArcGISRest-TileArcGISRest.html)
 */
@Component({
  selector: 'wol-tile-arcgis-rest-source',
  exportAs: 'wolTileArcGISRestSource',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolTileArcGISRestSourceComponent implements OnChanges {
  /**
   * Credits displayed for this source. Accepts a string, an array of strings, or a function.
   * Changes update the source.
   */
  readonly wolAttributions = input<AttributionLike>();
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
   * Parameters for ArcGIS export requests. Defaults include `format: png32`, `f: image`, and
   * `transparent: true`. OpenLayers sets `bbox`, `size`, `bboxSR`, and `imageSR` per tile. Use
   * `layers` to override service layer visibility. Changes replace the request parameters.
   */
  readonly wolParams = input<{ [key: string]: WolSafeAny }>();
  /**
   * Uses the map pixel ratio when requesting the export images. Defaults to `true`. Read at
   * creation.
   */
  readonly wolHidpi = input<boolean>();
  /**
   * Grid for tile requests. Match the service's resolutions, tile size, and extent. Without a
   * grid, OpenLayers derives one from the projection or a global fallback. Read at creation.
   */
  readonly wolTileGrid = input<TileGrid>();
  /**
   * Projection of the tile source. The view projection is used when omitted. Provide a code with a
   * numeric suffix such as `EPSG:3857`, or a valid ArcGIS spatial reference. Read at creation.
   */
  readonly wolProjection = input<ProjectionLike>();
  /**
   * Maximum reprojection error in pixels. Defaults to `0.5`. A larger value trades precision for
   * faster reprojection. Read at creation.
   */
  readonly wolReprojectionErrorThreshold = input<number>();
  /**
   * Callback that receives an image tile and its URL. The default assigns the URL to the tile
   * image. Changes update the callback.
   */
  readonly wolTileLoadFunction = input<LoadFunction>();
  /**
   * ArcGIS service URL containing `/MapServer` or `/ImageServer`. At creation, `wolUrls` takes
   * precedence when supplied. Changes replace the source's URL list with this endpoint.
   */
  readonly wolUrl = input<string>();
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
   * Endpoints used to distribute export requests. At creation this list takes precedence over
   * `wolUrl`. Changes replace the endpoints.
   */
  readonly wolUrls = input<string[]>();
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

  private instance?: TileArcGISRest;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useTileSourceHostRef<TileArcGISRest>('TileArcGISRest');
    const eventsKey: Record<string, EventsKey> = {};

    let disposeRef: DisposeRef;

    afterNextRender(() => {
      const tileArcGISRest = new TileArcGISRest({
        attributions: this.wolAttributions(),
        cacheSize: this.wolCacheSize(),
        crossOrigin: this.wolCrossOrigin(),
        interpolate: this.wolInterpolate(),
        params: this.wolParams(),
        hidpi: this.wolHidpi(),
        tileGrid: this.wolTileGrid(),
        projection: this.wolProjection(),
        reprojectionErrorThreshold: this.wolReprojectionErrorThreshold(),
        tileLoadFunction: this.wolTileLoadFunction(),
        url: this.wolUrl(),
        wrapX: this.wolWrapX(),
        transition: this.wolTransition(),
        urls: this.wolUrls(),
        referrerPolicy: this.wolReferrerPolicy(),
        zDirection: this.wolZDirection(),
      });

      if (this.wolProperties()) {
        tileArcGISRest.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKey['change'] = tileArcGISRest.on('change', (evt) => this.wolChange.emit(evt));

      eventsKey['error'] = tileArcGISRest.on('error', (evt) => this.wolError.emit(evt));

      eventsKey['propertychange'] = tileArcGISRest.on('propertychange', (evt) =>
        this.wolPropertyChange.emit(evt),
      );

      eventsKey['tileloadend'] = tileArcGISRest.on('tileloadend', (evt) =>
        this.wolTileLoadEnd.emit(evt),
      );

      eventsKey['tileloaderror'] = tileArcGISRest.on('tileloaderror', (evt) =>
        this.wolTileLoadError.emit(evt),
      );

      eventsKey['tileloadstart'] = tileArcGISRest.on('tileloadstart', (evt) =>
        this.wolTileLoadStart.emit(evt),
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
        disposeRef = hostRef.setSource(tileArcGISRest);
      });

      this.instance = tileArcGISRest;
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

    for (const [key, change] of Object.entries(changes)) {
      switch (key) {
        case 'wolAttributions':
          this.instance.setAttributions(change.currentValue);
          break;
        case 'wolParams':
          this.instance.setParams(change.currentValue);
          break;
        case 'wolProperties':
          this.instance.setProperties(change.currentValue ?? {});
          break;
        case 'wolTileLoadFunction':
          this.instance.setTileLoadFunction(change.currentValue);
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
   * Returns the OpenLayers TileArcGISRest instance.
   *
   * @returns The source after rendering, or `undefined` before creation and after destruction.
   */
  getInstance(): TileArcGISRest | undefined {
    return this.instance;
  }
}
