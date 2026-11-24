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
import { EventsKey } from 'ol/events';
import BaseEvent from 'ol/events/Event';
import { ProjectionLike } from 'ol/proj';
import OGCMapTile from 'ol/source/OGCMapTile';
import { AttributionLike } from 'ol/source/Source';
import { TileSourceEvent } from 'ol/source/Tile';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { DisposeRef, useTileSourceHostRef } from '@workletjs/ngx-openlayers/source/tile';

/**
 * Discovers and loads raster map tiles from an OGC API Tiles tileset.
 *
 * See the [OpenLayers OGCMapTile reference](https://openlayers.org/en/latest/apidoc/module-ol_source_OGCMapTile-OGCMapTile.html).
 *
 * The service must expose the core and tileset conformance classes. Selecting collections requires
 * the collections selection conformance class.
 */
@Component({
  selector: 'wol-ogc-map-tile-source',
  exportAs: 'wolOGCMapTileSource',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolOGCMapTileSourceComponent implements OnChanges {
  /**
   * Required URL of the OGC map tileset metadata endpoint. Recreate the component to read metadata
   * from another endpoint. On a running source, binding changes are forwarded to the tile URL
   * setter.
   */
  readonly wolUrl = input.required<string>();
  /**
   * Values for extra placeholders in the service's tile URL template. OpenLayers provides
   * `tileMatrix`, `tileRow`, and `tileCol`. Read at source creation.
   */
  readonly wolContext = input<object>();
  /**
   * Tile media type to request, such as `'image/png'`. When omitted, OpenLayers chooses an item
   * link offering a supported image format. Read at source creation.
   */
  readonly wolMediaType = input<string>();
  /**
   * Projection override for the tileset. OpenLayers normally takes it from the tile matrix set's
   * coordinate reference system. Read at source creation.
   */
  readonly wolProjection = input<ProjectionLike>();
  /** Source credits shown by the attribution control. Changes update the existing source. */
  readonly wolAttributions = input<AttributionLike>();
  /**
   * Legacy tile cache option supplied at source creation for compatibility.
   * OpenLayers 10.11.0 manages the cache on the rendering layer.
   *
   * @deprecated Configure `wolCacheSize` on a compatible layer.
   */
  readonly wolCacheSize = input<number>();
  /**
   * Cross-origin mode for image requests. Reading pixels from a cross-origin image on a canvas also
   * requires the corresponding server CORS headers. Read at source creation.
   */
  readonly wolCrossOrigin = input<string | null>();
  /**
   * Whether to use linear interpolation when resampling. Defaults to `true`. Set to `false` for
   * nearest-neighbor sampling. Read at source creation.
   */
  readonly wolInterpolate = input<boolean>();
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
   * Names of collections to include for a dataset tileset. Omit to use the complete dataset. Select
   * collections only when the endpoint serves multiple collections. Read at source creation.
   */
  readonly wolCollections = input<string[]>();
  /** Referrer policy applied to outgoing image requests. Read at source creation. */
  readonly wolReferrerPolicy = input<ReferrerPolicy>();
  /**
   * Additional OpenLayers source properties. Binding changes add or update keys on the existing
   * source.
   */
  readonly wolProperties = input<WolProperties>();

  /**
   * Emits when the source changes. Check the source state during tileset metadata retrieval,
   * including state `error` on failure.
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

  private instance?: OGCMapTile;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);

    const hostRef = useTileSourceHostRef<OGCMapTile>('OGCMapTile');
    const eventsKey: Record<string, EventsKey> = {};

    let disposeRef: DisposeRef;

    afterNextRender(() => {
      const ogcMapTile = new OGCMapTile({
        url: this.wolUrl(),
        context: this.wolContext(),
        mediaType: this.wolMediaType(),
        projection: this.wolProjection(),
        attributions: this.wolAttributions(),
        cacheSize: this.wolCacheSize(),
        crossOrigin: this.wolCrossOrigin(),
        interpolate: this.wolInterpolate(),
        reprojectionErrorThreshold: this.wolReprojectionErrorThreshold(),
        tileLoadFunction: this.wolTileLoadFunction(),
        wrapX: this.wolWrapX(),
        transition: this.wolTransition(),
        collections: this.wolCollections(),
        referrerPolicy: this.wolReferrerPolicy(),
      });

      if (this.wolProperties()) {
        ogcMapTile.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKey['change'] = ogcMapTile.on('change', (evt) => this.wolChange.emit(evt));

      eventsKey['error'] = ogcMapTile.on('error', (evt) => this.wolError.emit(evt));

      eventsKey['propertychange'] = ogcMapTile.on('propertychange', (evt) =>
        this.wolPropertyChange.emit(evt),
      );

      eventsKey['tileloadend'] = ogcMapTile.on('tileloadend', (evt) =>
        this.wolTileLoadEnd.emit(evt),
      );

      eventsKey['tileloaderror'] = ogcMapTile.on('tileloaderror', (evt) =>
        this.wolTileLoadError.emit(evt),
      );

      eventsKey['tileloadstart'] = ogcMapTile.on('tileloadstart', (evt) =>
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
        disposeRef = hostRef.setSource(ogcMapTile);
      });

      this.instance = ogcMapTile;
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
        case 'wolProperties':
          this.instance.setProperties(change.currentValue ?? {});
          break;
        case 'wolTileLoadFunction':
          this.instance.setTileLoadFunction(change.currentValue);
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
   * @returns The OpenLayers `OGCMapTile` instance, or `undefined` before creation and after
   * destruction.
   */
  getInstance(): OGCMapTile | undefined {
    return this.instance;
  }
}
