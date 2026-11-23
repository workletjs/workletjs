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
import { CrossOriginAttribute } from 'ol/source/DataTile';
import ImageTileSource, { Loader, UrlLike } from 'ol/source/ImageTile';
import { AttributionLike, State } from 'ol/source/Source';
import { TileSourceEvent } from 'ol/source/Tile';
import { TileGrid } from 'ol/tilegrid';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { DisposeRef, useTileSourceHostRef } from '@workletjs/ngx-openlayers/source/tile';

/**
 * Provides image tiles from URL templates or a custom tile image loader.
 *
 * See the [OpenLayers ImageTileSource reference](https://openlayers.org/en/latest/apidoc/module-ol_source_ImageTile-ImageTileSource.html).
 */
@Component({
  selector: 'wol-image-tile-source',
  imports: [],
  template: `<ng-content />`,
  styles: ``,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolImageTileSourceComponent implements OnChanges {
  /**
   * A URL template, array of templates, or function that returns a URL from `z`, `x`, `y`, and
   * loader options. A supplied URL takes precedence over `wolLoader`. Changes replace the loader
   * with one based on the new URL.
   */
  readonly wolUrl = input<UrlLike>();
  /**
   * Custom loader that receives `z`, `x`, `y` and loader options and returns a tile image or a
   * promise for a loaded image. Used when `wolUrl` is omitted. Read at source creation.
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
  /**
   * Initial source state when a loader is available. Defaults to `'ready'`. Without a loader or
   * URL, the source initially reports `'loading'`. Read at source creation.
   */
  readonly wolState = input<State>();
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
   * Whether to use linear interpolation when resampling. Defaults to `true`. Set to `false` for
   * nearest-neighbor sampling. Read at source creation.
   */
  readonly wolInterpolate = input<boolean>();
  /**
   * Cross-origin mode passed to image tile loaders. Defaults to `'anonymous'`. Read at source
   * creation.
   */
  readonly wolCrossOrigin = input<CrossOriginAttribute>();
  /**
   * Chooses the tile zoom at intermediate view resolutions. Defaults to `0` for the nearest level.
   * Use `1` to favor the coarser level, `-1` for the finer level, or provide a function. Read at
   * source creation.
   */
  readonly wolZDirection = input<number | NearestDirectionFunction>();
  /** Referrer policy applied to outgoing image requests. Read at source creation. */
  readonly wolReferrerPolicy = input<ReferrerPolicy>();
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
  readonly wolPropertyChange = output<ObjectEvent>();
  /** Emits when a source tile finishes loading. The event identifies the tile. */
  readonly wolTileLoadEnd = output<TileSourceEvent>();
  /** Emits when a source tile fails to load. The event identifies the tile. */
  readonly wolTileLoadError = output<TileSourceEvent>();
  /** Emits when a source tile starts loading. The event identifies the tile. */
  readonly wolTileLoadStart = output<TileSourceEvent>();

  private instance?: ImageTileSource;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useTileSourceHostRef<ImageTileSource>('ImageTile');
    const eventsKey: Record<string, EventsKey> = {};

    let disposeRef: DisposeRef;

    afterNextRender(() => {
      const imageTileSource = new ImageTileSource({
        url: this.wolUrl(),
        loader: this.wolLoader(),
        attributions: this.wolAttributions(),
        attributionsCollapsible: this.wolAttributionsCollapsible(),
        referrerPolicy: this.wolReferrerPolicy(),
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
        interpolate: this.wolInterpolate(),
        crossOrigin: this.wolCrossOrigin(),
        zDirection: this.wolZDirection(),
      });

      if (!this.wolProperties()) {
        imageTileSource.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKey['change'] = imageTileSource.on('change', (event) => this.wolChange.emit(event));

      eventsKey['error'] = imageTileSource.on('error', (event) => this.wolError.emit(event));

      eventsKey['propertychange'] = imageTileSource.on('propertychange', (event) =>
        this.wolPropertyChange.emit(event),
      );

      eventsKey['tileloadend'] = imageTileSource.on('tileloadend', (event) =>
        this.wolTileLoadEnd.emit(event),
      );

      eventsKey['tileloaderror'] = imageTileSource.on('tileloaderror', (event) =>
        this.wolTileLoadError.emit(event),
      );

      eventsKey['tileloadstart'] = imageTileSource.on('tileloadstart', (event) =>
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
        disposeRef = hostRef.setSource(imageTileSource);
      });

      this.instance = imageTileSource;
    });

    destroyRef.onDestroy(() => {
      if (this.instance) {
        if (disposeRef) {
          disposeRef();
        }

        unByKey(Object.values(eventsKey));

        this.instance = undefined;
      }
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
          this.instance.setProperties(change.currentValue ?? {}, false);
          break;
        case 'wolProjection':
        case 'wolTileGrid':
          if (projection && tileGrid) {
            this.instance.setTileGridForProjection(projection, tileGrid);
          }
          break;
        case 'wolUrl':
          this.instance.setUrl(change.currentValue);
          break;
      }
    }
  }

  /**
   * Gets the OpenLayers source created by this component.
   *
   * @returns The OpenLayers `ImageTileSource` instance, or `undefined` before creation and after
   * destruction.
   */
  getInstance(): ImageTileSource | undefined {
    return this.instance;
  }
}
