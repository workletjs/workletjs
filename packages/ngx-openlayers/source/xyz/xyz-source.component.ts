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
import { LoadFunction, UrlFunction } from 'ol/Tile';
import { NearestDirectionFunction } from 'ol/array';
import { EventsKey } from 'ol/events';
import BaseEvent from 'ol/events/Event';
import { ProjectionLike } from 'ol/proj';
import { Size } from 'ol/size';
import { AttributionLike } from 'ol/source/Source';
import { TileSourceEvent } from 'ol/source/Tile';
import XYZ from 'ol/source/XYZ';
import { TileGrid } from 'ol/tilegrid';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { DisposeRef, useTileSourceHostRef } from '@workletjs/ngx-openlayers/source/tile';

/**
 * Loads raster tiles from an XYZ URL template, with support for TMS-style Y coordinates.
 *
 * @see [OpenLayers XYZ](https://openlayers.org/en/latest/apidoc/module-ol_source_XYZ-XYZ.html)
 */
@Component({
  selector: 'wol-xyz-source',
  exportAs: 'wolXYZSource',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolXYZSourceComponent implements OnChanges {
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
   * Source projection, `EPSG:3857` by default. After creation, changes can register `wolTileGrid`
   * for this projection when both inputs are set and that projection has no registered grid.
   */
  readonly wolProjection = input<ProjectionLike>();
  /**
   * Maximum reprojection error in pixels. Defaults to `0.5`. A larger value trades precision for
   * faster reprojection. Read at creation.
   */
  readonly wolReprojectionErrorThreshold = input<number>();
  /**
   * Highest zoom level of the generated grid. Defaults to `42`. A supplied `wolTileGrid`
   * determines its own maximum. Read at creation.
   */
  readonly wolMaxZoom = input<number>();
  /**
   * Lowest zoom level of the generated grid. Defaults to `0`. A supplied `wolTileGrid` determines
   * its own minimum. Read at creation.
   */
  readonly wolMinZoom = input<number>();
  /**
   * Resolution at zoom zero of the generated grid. A supplied `wolTileGrid` determines its own
   * resolutions. Read at creation.
   */
  readonly wolMaxResolution = input<number>();
  /**
   * Grid for the tile service. When omitted, the source builds an XYZ grid. After creation,
   * changes can register a grid for `wolProjection` when both inputs are set and that projection
   * has no registered grid.
   */
  readonly wolTileGrid = input<TileGrid>();
  /**
   * Callback that receives an image tile and its URL. The default assigns the URL to the tile
   * image. The binding is read only at creation.
   *
   * @deprecated Use `wolLoader` on `WolImageTileSourceComponent` for custom image tile loading.
   */
  readonly wolTileLoadFunction = input<LoadFunction>();
  /**
   * Ratio of actual tile image pixels to the advertised tile size. Defaults to `1`. Use `2` for
   * 512-pixel images served as 256-pixel tiles. Read at creation.
   */
  readonly wolTilePixelRatio = input<number>();
  /**
   * Tile size in pixels for the generated grid. Defaults to `[256, 256]`. A supplied `wolTileGrid`
   * determines its own tile size. Read at creation.
   */
  readonly wolTileSize = input<number | Size>();
  /**
   * Number of pixels ignored around each tile. Defaults to `0`. Images with a gutter must add
   * twice this value to each dimension. Read at creation.
   */
  readonly wolGutter = input<number>();
  /**
   * Callback that chooses the URL from the tile coordinate, pixel ratio, and projection. Omit URL
   * templates to use this callback. The binding is read at creation. Recreate the component to
   * apply a different function.
   *
   * @deprecated Use a `wolUrl` function on `WolImageTileSourceComponent` instead.
   */
  readonly wolTileUrlFunction = input<UrlFunction>();
  /**
   * URL template with `{z}`, `{x}`, and `{y}` (or `{-y}` for TMS on the default grid). A range
   * such as `{a-c}` can distribute requests across hosts. At creation `wolUrls` takes precedence
   * when supplied. Changes replace the URL list.
   */
  readonly wolUrl = input<string>();
  /**
   * Tile URL templates used to distribute requests. At creation this list takes precedence over
   * `wolUrl`. Changes replace the templates.
   *
   * @deprecated Use the `wolUrl` array on `WolImageTileSourceComponent` instead.
   */
  readonly wolUrls = input<string[]>();
  /**
   * Whether the source wraps horizontally across world boundaries. Defaults to `true`. Set when
   * creating the source.
   */
  readonly wolWrapX = input<boolean>();
  /**
   * Tile fade-in duration in milliseconds. Defaults to `250`. Set to `0` to disable it. Read at
   * creation.
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

  private instance?: XYZ;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useTileSourceHostRef<XYZ>('XYZ');
    const eventsKey: Record<string, EventsKey> = {};

    let disposeRef: DisposeRef;

    afterNextRender(() => {
      const xyz = new XYZ({
        attributions: this.wolAttributions(),
        attributionsCollapsible: this.wolAttributionsCollapsible(),
        cacheSize: this.wolCacheSize(),
        crossOrigin: this.wolCrossOrigin(),
        interpolate: this.wolInterpolate(),
        projection: this.wolProjection(),
        reprojectionErrorThreshold: this.wolReprojectionErrorThreshold(),
        maxZoom: this.wolMaxZoom(),
        minZoom: this.wolMinZoom(),
        maxResolution: this.wolMaxResolution(),
        tileGrid: this.wolTileGrid(),
        tileLoadFunction: this.wolTileLoadFunction(),
        tilePixelRatio: this.wolTilePixelRatio(),
        tileSize: this.wolTileSize(),
        gutter: this.wolGutter(),
        tileUrlFunction: this.wolTileUrlFunction(),
        url: this.wolUrl(),
        urls: this.wolUrls(),
        referrerPolicy: this.wolReferrerPolicy(),
        wrapX: this.wolWrapX(),
        transition: this.wolTransition(),
        zDirection: this.wolZDirection(),
      });

      if (this.wolProperties()) {
        xyz.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKey['change'] = xyz.on('change', (evt) => this.wolChange.emit(evt));

      eventsKey['error'] = xyz.on('error', (evt) => this.wolError.emit(evt));

      eventsKey['propertychange'] = xyz.on('propertychange', (evt) =>
        this.wolPropertyChange.emit(evt),
      );

      eventsKey['tileloadend'] = xyz.on('tileloadend', (evt) => this.wolTileLoadEnd.emit(evt));

      eventsKey['tileloaderror'] = xyz.on('tileloaderror', (evt) =>
        this.wolTileLoadError.emit(evt),
      );

      eventsKey['tileloadstart'] = xyz.on('tileloadstart', (evt) =>
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
        disposeRef = hostRef.setSource(xyz);
      });

      this.instance = xyz;
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
        case 'wolTileGrid':
        case 'wolProjection':
          if (tileGrid && projection) {
            this.instance.setTileGridForProjection(projection, tileGrid);
          }
          break;
        case 'wolLoadFunction':
          this.instance.setTileLoadFunction(change.currentValue);
          break;
        case 'wolUrlFunction':
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
   * Returns the OpenLayers XYZ instance.
   *
   * @returns The source after rendering, or `undefined` before creation and after destruction.
   */
  getInstance(): XYZ | undefined {
    return this.instance;
  }
}
