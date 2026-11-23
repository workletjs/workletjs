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
import VectorTile from 'ol/VectorTile';
import { NearestDirectionFunction } from 'ol/array';
import { EventsKey } from 'ol/events';
import BaseEvent from 'ol/events/Event';
import FeatureFormat from 'ol/format/Feature';
import { OGCVectorTile } from 'ol/source';
import { AttributionLike } from 'ol/source/Source';
import { TileSourceEvent } from 'ol/source/Tile';

import { WolProperties, WolSafeAny } from '@workletjs/ngx-openlayers/core/types';
import {
  DisposeRef,
  useVectorTileSourceHostRef,
} from '@workletjs/ngx-openlayers/source/vector-tile';

/**
 * Reads vector tiles and their tile matrix metadata from an OGC API - Tiles service.
 *
 * @see [OpenLayers OGCVectorTile](https://openlayers.org/en/latest/apidoc/module-ol_source_OGCVectorTile-OGCVectorTile.html)
 */
@Component({
  selector: 'wol-ogc-vector-tile-source',
  exportAs: 'wolOGCVectorTileSource',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolOGCVectorTileSourceComponent implements OnChanges {
  /**
   * Required OGC vector tileset metadata URL. Supply it at creation. After creation, changing this
   * input sets the tile URL template on the existing source. Recreate the component to load a
   * different tileset and its metadata.
   */
  readonly wolUrl = input.required<string>();
  /**
   * Extra values for the service's tile URL template. The source supplies `{tileMatrix}`,
   * `{tileRow}`, and `{tileCol}` itself. Read at creation.
   */
  readonly wolContext = input<Record<string, WolSafeAny>>();
  /**
   * Feature parser for the service's tiles, such as MVT. The default tile loader requires a
   * format. Its supported media types also help choose a tile link. Read at creation.
   */
  readonly wolFormat = input<FeatureFormat<FeatureLike>>();
  /**
   * Tile MIME type to select from the tileset links, for example
   * `application/vnd.mapbox-vector-tile`. By default the source looks for a vector tile link
   * compatible with `wolFormat`. Read at creation.
   */
  readonly wolMediaType = input<string>();
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
   * Legacy source-level tile cache option. Set when creating the source.
   *
   * @deprecated Configure `wolCacheSize` on the tile layer instead.
   */
  readonly wolCacheSize = input<number>();
  /**
   * Allows overlapping geometries by default. Set to `false` if features do not overlap so the
   * renderer can optimize fills and strokes. Read at creation.
   */
  readonly wolOverlaps = input<boolean>();
  /**
   * Projection code for the tile grid. OpenLayers starts with `EPSG:3857` by default and resolves
   * the grid against the tileset metadata. Read at creation.
   */
  readonly wolProjection = input<string>();
  /**
   * Class used to create vector tiles. Defaults to the OpenLayers `VectorTile` class. Read at
   * creation.
   */
  readonly wolTileClass = input<typeof VectorTile>();
  /**
   * Tile fade-in duration in milliseconds. Set to `0` to disable the transition. Read at creation.
   */
  readonly wolTransition = input<number>();
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
   * Identifiers of collections to include from a dataset-level tileset. Omit to request the entire
   * dataset. Set when creating the source.
   */
  readonly wolCollections = input<string[]>();
  /**
   * Observable OpenLayers properties to set on the source. New values update the supplied keys.
   * Omitted keys keep their current values.
   */
  readonly wolProperties = input<WolProperties>();

  /**
   * Emits when the source revision increases. Check its state for `ready` or `error` after loading
   * the tileset metadata.
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

  private instance?: OGCVectorTile<FeatureLike>;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useVectorTileSourceHostRef<OGCVectorTile<FeatureLike>>('OGCVectorTile');
    const eventsKey: Record<string, EventsKey> = {};

    let disposeRef: DisposeRef;

    afterNextRender(() => {
      const ogcVectorTile = new OGCVectorTile({
        url: this.wolUrl(),
        context: this.wolContext(),
        format: this.wolFormat(),
        mediaType: this.wolMediaType(),
        attributions: this.wolAttributions(),
        attributionsCollapsible: this.wolAttributionsCollapsible(),
        cacheSize: this.wolCacheSize(),
        overlaps: this.wolOverlaps(),
        projection: this.wolProjection(),
        tileClass: this.wolTileClass(),
        transition: this.wolTransition(),
        wrapX: this.wolWrapX(),
        zDirection: this.wolZDirection(),
        collections: this.wolCollections(),
      });

      if (this.wolProperties()) {
        ogcVectorTile.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKey['change'] = ogcVectorTile.on('change', (evt) => this.wolChange.emit(evt));

      eventsKey['error'] = ogcVectorTile.on('error', (evt) => this.wolError.emit(evt));

      eventsKey['propertychange'] = ogcVectorTile.on('propertychange', (evt) =>
        this.wolPropertyChange.emit(evt),
      );

      eventsKey['tileloadend'] = ogcVectorTile.on('tileloadend', (evt) =>
        this.wolTileLoadEnd.emit(evt),
      );

      eventsKey['tileloaderror'] = ogcVectorTile.on('tileloaderror', (evt) =>
        this.wolTileLoadError.emit(evt),
      );

      eventsKey['tileloadstart'] = ogcVectorTile.on('tileloadstart', (evt) =>
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
        disposeRef = hostRef.setSource(ogcVectorTile);
      });

      this.instance = ogcVectorTile;
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
        case 'wolUrl':
          this.instance.setUrl(change.currentValue);
          break;
      }
    }
  }

  /**
   * Returns the OpenLayers OGCVectorTile instance.
   *
   * @returns The source after rendering, or `undefined` before creation and after destruction.
   */
  getInstance(): OGCVectorTile<FeatureLike> | undefined {
    return this.instance;
  }
}
