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
import TileWMS from 'ol/source/TileWMS';
import { ServerType } from 'ol/source/wms';
import { TileGrid } from 'ol/tilegrid';

import { WolProperties, WolSafeAny } from '@workletjs/ngx-openlayers/core/types';
import { DisposeRef, useTileSourceHostRef } from '@workletjs/ngx-openlayers/source/tile';

/**
 * Requests raster tiles from a Web Map Service (WMS) using the service URL and GetMap parameters.
 *
 * @see [OpenLayers TileWMS](https://openlayers.org/en/latest/apidoc/module-ol_source_TileWMS-TileWMS.html)
 */
@Component({
  selector: 'wol-tile-wms-source',
  exportAs: 'wolTileWMSSource',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolTileWMSSourceComponent implements OnChanges {
  /**
   * Credits displayed for this source. Accepts a string, an array of strings, or a function.
   * Changes update the source.
   */
  readonly wolAttributions = input<AttributionLike>();
  /**
   * Whether the attribution control can collapse the source credits. Defaults to `true`. Set when
   * creating the source.
   */
  readonly wolAtrributionCollapsible = input<boolean>();
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
   * Required WMS parameters. Include `LAYERS`. OpenLayers defaults `STYLES` to an empty string and
   * `VERSION` to `1.3.0`, and derives `WIDTH`, `HEIGHT`, `BBOX`, and `CRS` or `SRS` per request.
   * Changes replace the parameter set.
   */
  readonly wolParams = input.required<{ [x: string]: WolSafeAny }>();
  /**
   * Extra pixels on each side of a requested tile, cropped before rendering to reduce seams.
   * Defaults to `0`. Read at creation.
   */
  readonly wolGutter = input<number>();
  /**
   * Whether requests use the map pixel ratio when `wolServerType` is supplied. Defaults to `true`.
   * Read at creation.
   */
  readonly wolHidpi = input<boolean>();
  /**
   * Projection of the source. OpenLayers uses the view projection when this input is omitted. Read
   * at creation.
   */
  readonly wolProjection = input<ProjectionLike>();
  /**
   * Maximum reprojection error in pixels. Defaults to `0.5`. A larger value trades precision for
   * faster reprojection. Read at creation.
   */
  readonly wolReprojectionErrorThreshold = input<number>();
  /**
   * Class used to create image tiles. Defaults to the OpenLayers `ImageTile` class. Read at
   * creation.
   */
  readonly wolTileClass = input<typeof ImageTile>();
  /**
   * Grid for tile requests. Match the service's resolutions, tile size, and extent. Without a
   * grid, OpenLayers derives one from the projection or a global fallback. Read at creation.
   */
  readonly wolTileGrid = input<TileGrid>();
  /**
   * Server implementation used for HiDPI requests. Supports `mapserver`, `geoserver`,
   * `carmentaserver`, and `qgis`. Read at creation.
   */
  readonly wolServerType = input<ServerType>();
  /**
   * Callback that receives an image tile and its URL. The default assigns the URL to the tile
   * image. Changes update the callback.
   */
  readonly wolTileLoadFunction = input<LoadFunction>();
  /**
   * WMS service URL. At creation, `wolUrls` takes precedence when supplied. Changes replace the
   * source's URL list with this endpoint.
   */
  readonly wolUrl = input<string>();
  /**
   * WMS endpoints used to distribute GetMap requests. At creation this list takes precedence over
   * `wolUrl`. Changes replace the endpoints.
   */
  readonly wolUrls = input<string[]>();
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
   * Selects the tile level between available resolutions. Positive favors coarser tiles, negative
   * favors finer tiles, and `0` (the default) selects the nearest. A function can choose the
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
   * Emits when a tile finishes loading successfully.
   * The event carries the tile.
   */
  readonly wolTileLoadEnd = output<TileSourceEvent>();
  /** Emits when a tile fails to load. The event carries the failed tile. */
  readonly wolTileLoadError = output<TileSourceEvent>();
  /** Emits when a tile begins loading. The event carries the tile. */
  readonly wolTileLoadStart = output<TileSourceEvent>();

  private instance?: TileWMS;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useTileSourceHostRef<TileWMS>('TileWMS');
    const eventsKey: Record<string, EventsKey> = {};

    let disposeRef: DisposeRef;

    afterNextRender(() => {
      const tileWMS = new TileWMS({
        attributions: this.wolAttributions(),
        attributionsCollapsible: this.wolAtrributionCollapsible(),
        cacheSize: this.wolCacheSize(),
        crossOrigin: this.wolCrossOrigin(),
        interpolate: this.wolInterpolate(),
        params: this.wolParams(),
        gutter: this.wolGutter(),
        hidpi: this.wolHidpi(),
        projection: this.wolProjection(),
        reprojectionErrorThreshold: this.wolReprojectionErrorThreshold(),
        tileClass: this.wolTileClass(),
        tileGrid: this.wolTileGrid(),
        serverType: this.wolServerType(),
        tileLoadFunction: this.wolTileLoadFunction(),
        url: this.wolUrl(),
        urls: this.wolUrls(),
        wrapX: this.wolWrapX(),
        transition: this.wolTransition(),
        zDirection: this.wolZDirection(),
      });

      if (this.wolProperties()) {
        tileWMS.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKey['change'] = tileWMS.on('change', (evt) => this.wolChange.emit(evt));

      eventsKey['error'] = tileWMS.on('error', (evt) => this.wolError.emit(evt));

      eventsKey['propertychange'] = tileWMS.on('propertychange', (evt) =>
        this.wolPropertyChange.emit(evt),
      );

      eventsKey['tileloadend'] = tileWMS.on('tileloadend', (evt) => this.wolTileLoadEnd.emit(evt));

      eventsKey['tileloaderror'] = tileWMS.on('tileloaderror', (evt) =>
        this.wolTileLoadError.emit(evt),
      );

      eventsKey['tileloadstart'] = tileWMS.on('tileloadstart', (evt) =>
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
        disposeRef = hostRef.setSource(tileWMS);
      });

      this.instance = tileWMS;
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
   * Returns the OpenLayers TileWMS instance.
   *
   * @returns The source after rendering, or `undefined` before creation and after destruction.
   */
  getInstance(): TileWMS | undefined {
    return this.instance;
  }
}
