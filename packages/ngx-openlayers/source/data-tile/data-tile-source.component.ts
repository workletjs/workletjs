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
import { NearestDirectionFunction } from 'ol/array';
import { EventsKey } from 'ol/events';
import BaseEvent from 'ol/events/Event';
import { ProjectionLike } from 'ol/proj';
import { Size } from 'ol/size';
import DataTileSource, { CrossOriginAttribute, Loader } from 'ol/source/DataTile';
import { AttributionLike, State } from 'ol/source/Source';
import { TileSourceEvent } from 'ol/source/Tile';
import { TileGrid } from 'ol/tilegrid';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';

import { DisposeRef, useDataTileSourceHostRef } from './use-data-tile-source-host-ref';

/**
 * Provides tiles containing raster band values or images from a custom loader.
 *
 * See the [OpenLayers DataTileSource reference](https://openlayers.org/en/latest/apidoc/module-ol_source_DataTile-DataTileSource.html).
 */
@Component({
  selector: 'wol-data-tile-source',
  imports: [],
  template: `<ng-content />`,
  styles: ``,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolDataTileSourceComponent implements OnChanges {
  /**
   * Loads a tile using its `z`, `x`, and `y` coordinates and loader options. Return tile data or a
   * promise for it. When returning an image promise, resolve it once the image has loaded. Read at
   * source creation.
   */
  readonly wolLoader = input<Loader>();
  /** Source credits shown by the attribution control. Changes update the existing source. */
  readonly wolAttributions = input<AttributionLike>();
  /**
   * Whether the attribution control may collapse this source's credits. Defaults to `true`. Read at
   * source creation.
   */
  readonly wolAttributionsCollapsible = input<boolean>();
  /**
   * Maximum zoom level for the default tile grid. Defaults to `42`. Supply this only when
   * OpenLayers creates the tile grid. Read at source creation.
   */
  readonly wolMaxZoom = input<number>();
  /**
   * Minimum zoom level for the default tile grid. Defaults to `0`. Supply this only when OpenLayers
   * creates the tile grid. Read at source creation.
   */
  readonly wolMinZoom = input<number>();
  /**
   * Width and height of the source tiles in pixels. A single number specifies square tiles.
   * Defaults to `[256, 256]` with the default grid. Read at source creation.
   */
  readonly wolTileSize = input<number | Size>();
  /**
   * Border pixels to discard on each edge of a source tile. Defaults to `0`. Include twice the
   * gutter in the image or data dimensions returned by the loader. Read at source creation.
   */
  readonly wolGutter = input<number>();
  /**
   * Resolution in projection units per pixel at zoom level zero. This sets the scale of the default
   * tile grid. Read at source creation.
   */
  readonly wolMaxResolution = input<number>();
  /**
   * Initial tile projection. Defaults to `'EPSG:3857'`. After creation, this input identifies the
   * target projection when registering `wolTileGrid` for reprojection.
   */
  readonly wolProjection = input<ProjectionLike>();
  /**
   * Initial tile grid. After creation, a new grid is registered for a supplied projection only if
   * OpenLayers has yet to assign a grid to that projection.
   */
  readonly wolTileGrid = input<TileGrid>();
  /** Initial OpenLayers source state. Defaults to `'ready'`. Read at source creation. */
  readonly wolState = input<State>();
  /**
   * Whether tiles wrap horizontally beyond the antimeridian. Defaults to `false`. Read at source
   * creation.
   */
  readonly wolWrapX = input<boolean>();
  /**
   * Tile fade-in duration in milliseconds. Defaults to `250`. Set to `0` to disable the fade. Read
   * at source creation.
   */
  readonly wolTransition = input<number>();
  /** Number of bands in the tile data. Defaults to `4`. Read at source creation. */
  readonly wolBandCount = input<number>();

  /**
   * Whether the tile data already contains an alpha band.
   * When `false`, reprojection appends a coverage alpha band to make areas outside
   * the source footprint transparent. When `true`, no coverage band is appended.
   * If omitted, OpenLayers infers `true` for 2 (luminance alpha) or 4 (RGBA) bands
   * and `false` for other band counts. The default band count is 4.
   * This option is only used when the source is created.
   */
  readonly wolHasAlpha = input<boolean>();

  /**
   * Whether to use linear interpolation when resampling. Defaults to `false`, which uses
   * nearest-neighbor sampling. Read at source creation.
   */
  readonly wolInterpolate = input<boolean>();
  /**
   * Cross-origin mode passed to the loader for image data. It corresponds to the OpenLayers
   * `crossOrigin` option and defaults to `'anonymous'`. Read at source creation.
   */
  readonly wolCrop = input<CrossOriginAttribute>();
  /** Cache key used for tiles from this source. Read at source creation. */
  readonly wolKey = input<string>();
  /**
   * Chooses the tile zoom at intermediate view resolutions. Defaults to `0` for the nearest level.
   * Use `1` to favor the coarser level, `-1` for the finer level, or provide a function. Read at
   * source creation.
   */
  readonly wolZDirection = input<number | NearestDirectionFunction>();
  /**
   * Additional OpenLayers source properties to merge when the binding changes after source
   * creation.
   */
  readonly wolProperties = input<WolProperties>();

  /** Emits when the OpenLayers source revision advances, including source state changes. */
  readonly wolChange = output<BaseEvent>();
  /** Forwards the OpenLayers source's `error` event. */
  readonly wolError = output<BaseEvent>();
  /** Emits a `propertychange` event with the changed property name and its previous value. */
  readonly wolPropertychange = output<ObjectEvent>();
  /** Emits when a source tile finishes loading. The event identifies the tile. */
  readonly wolTileLoadEnd = output<TileSourceEvent>();
  /** Emits when a source tile fails to load. The event identifies the tile. */
  readonly wolTileLoadError = output<TileSourceEvent>();
  /** Emits when a source tile starts loading. The event identifies the tile. */
  readonly wolTileLoadStart = output<TileSourceEvent>();

  private instance?: DataTileSource;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useDataTileSourceHostRef<DataTileSource>('DataTileSource');
    const eventsKey: Record<string, EventsKey> = {};

    let disposeRef: DisposeRef;

    afterNextRender(() => {
      const dataTileSource = new DataTileSource({
        loader: this.wolLoader(),
        attributions: this.wolAttributions(),
        attributionsCollapsible: this.wolAttributionsCollapsible(),
        maxZoom: this.wolMaxZoom(),
        minZoom: this.wolMinZoom(),
        tileSize: this.wolTileSize(),
        gutter: this.wolGutter(),
        maxResolution: this.wolMaxResolution(),
        projection: this.wolProjection(),
        tileGrid: this.wolTileGrid(),
        state: this.wolState(),
        wrapX: this.wolWrapX(),
        transition: this.wolTransition(),
        bandCount: this.wolBandCount(),
        hasAlpha: this.wolHasAlpha(),
        interpolate: this.wolInterpolate(),
        crossOrigin: this.wolCrop(),
        key: this.wolKey(),
        zDirection: this.wolZDirection(),
      });

      if (!this.wolProperties()) {
        dataTileSource.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKey['change'] = dataTileSource.on('change', (event) => this.wolChange.emit(event));

      eventsKey['error'] = dataTileSource.on('error', (event) => this.wolError.emit(event));

      eventsKey['propertychange'] = dataTileSource.on('propertychange', (event) =>
        this.wolPropertychange.emit(event),
      );

      eventsKey['tileloadend'] = dataTileSource.on('tileloadend', (event) =>
        this.wolTileLoadEnd.emit(event),
      );

      eventsKey['tileloaderror'] = dataTileSource.on('tileloaderror', (event) =>
        this.wolTileLoadError.emit(event),
      );

      eventsKey['tileloadstart'] = dataTileSource.on('tileloadstart', (event) =>
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
        disposeRef = hostRef.setSource(dataTileSource);
      });

      this.instance = dataTileSource;
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

    const projection = this.wolProjection();
    const tileGrid = this.wolTileGrid();

    for (const [key, change] of Object.entries(changes)) {
      switch (key) {
        case 'wolAttributions':
          this.instance.setAttributions(change.currentValue);
          break;
        case 'wolProperties':
          this.instance.setProperties(change.currentValue ?? {});
          break;
        case 'wolProjection':
        case 'wolTileGrid':
          if (projection && tileGrid) {
            this.instance.setTileGridForProjection(projection, tileGrid);
          }
          break;
      }
    }
  }

  /**
   * Gets the OpenLayers source created by this component.
   *
   * @returns The OpenLayers `DataTileSource` instance, or `undefined` before creation and after
   * destruction.
   */
  getInstance(): DataTileSource | undefined {
    return this.instance;
  }
}
