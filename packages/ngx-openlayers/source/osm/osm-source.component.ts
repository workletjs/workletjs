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
import OSM from 'ol/source/OSM';
import { AttributionLike } from 'ol/source/Source';
import { TileSourceEvent } from 'ol/source/Tile';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { DisposeRef, useTileSourceHostRef } from '@workletjs/ngx-openlayers/source/tile';

/**
 * Provides raster map tiles from OpenStreetMap with the standard tile URL and attribution.
 *
 * @see [OpenLayers OSM](https://openlayers.org/en/latest/apidoc/module-ol_source_OSM-OSM.html)
 */
@Component({
  selector: 'wol-osm-source',
  imports: [],
  template: `<ng-content />`,
  styles: ``,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolOSMSourceComponent implements OnChanges {
  /**
   * Credits displayed for this source. OpenStreetMap attribution is used by default. Changes
   * update the current source.
   */
  readonly wolAttributions = input<AttributionLike>();
  /**
   * Legacy source-level tile cache option. Set when creating the source.
   *
   * @deprecated Configure `wolCacheSize` on the tile layer instead.
   */
  readonly wolCacheSize = input<number>();
  /** CORS mode for the tile images. Defaults to `anonymous`. Set when creating the source. */
  readonly wolCrossOrigin = input<null | string>();
  /**
   * Uses linear interpolation when resampling by default. Set to `false` for nearest-neighbor
   * sampling. Read at creation.
   */
  readonly wolInterpolate = input<boolean>();
  /** Highest tile zoom level available from the provider. Defaults to `19`. Read at creation. */
  readonly wolMaxZoom = input<number>();
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
   * Tile fade-in duration in milliseconds. Defaults to `250`. Set to `0` to disable it. Read at
   * creation.
   */
  readonly wolTransition = input<number>();
  /**
   * Tile URL template with `{z}`, `{x}`, and `{y}` or `{-y}`. Defaults to
   * `https://tile.openstreetmap.org/{z}/{x}/{y}.png`. Changes update the source's tile URL.
   */
  readonly wolUrl = input<string>();
  /**
   * Whether the source wraps horizontally across world boundaries. Defaults to `true`. Set when
   * creating the source.
   */
  readonly wolWrapX = input<boolean>();
  /**
   * Selects the tile level between available resolutions. Positive favors coarser tiles, negative
   * favors finer tiles, and `0` (the default) selects the nearest. A function can choose the
   * direction. Read at creation.
   */
  readonly wolZDirection = input<number | NearestDirectionFunction>();
  /**
   * Referrer policy used for tile requests. Defaults to `origin-when-cross-origin`. Set when
   * creating the source.
   */
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
   * Emits when tile loading finishes, including when a tile that is no longer needed is canceled.
   * The event carries the tile.
   */
  readonly wolTileLoadEnd = output<TileSourceEvent>();
  /** Emits when a tile fails to load. The event carries the failed tile. */
  readonly wolTileLoadError = output<TileSourceEvent>();
  /** Emits when a tile begins loading. The event carries the tile. */
  readonly wolTileLoadStart = output<TileSourceEvent>();

  private instance?: OSM;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const host = useTileSourceHostRef<OSM>('OSM');
    const eventsKey: Record<string, EventsKey> = {};

    let disposeRef: DisposeRef;

    afterNextRender(() => {
      const osmSource = new OSM({
        attributions: this.wolAttributions(),
        cacheSize: this.wolCacheSize(),
        crossOrigin: this.wolCrossOrigin(),
        interpolate: this.wolInterpolate(),
        maxZoom: this.wolMaxZoom(),
        reprojectionErrorThreshold: this.wolReprojectionErrorThreshold(),
        tileLoadFunction: this.wolTileLoadFunction(),
        transition: this.wolTransition(),
        url: this.wolUrl(),
        wrapX: this.wolWrapX(),
        referrerPolicy: this.wolReferrerPolicy(),
        zDirection: this.wolZDirection(),
      });

      if (this.wolProperties()) {
        osmSource.setProperties(this.wolProperties() as WolProperties, true);
      }

      eventsKey['change'] = osmSource.on('change', (evt) => this.wolChange.emit(evt));

      eventsKey['error'] = osmSource.on('error', (evt) => this.wolError.emit(evt));

      eventsKey['propertychange'] = osmSource.on('propertychange', (evt) =>
        this.wolPropertyChange.emit(evt),
      );

      eventsKey['tileloadend'] = osmSource.on('tileloadend', (evt) =>
        this.wolTileLoadEnd.emit(evt),
      );

      eventsKey['tileloaderror'] = osmSource.on('tileloaderror', (evt) =>
        this.wolTileLoadError.emit(evt),
      );

      eventsKey['tileloadstart'] = osmSource.on('tileloadstart', (evt) =>
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
        disposeRef = host.setSource(osmSource);
      });

      this.instance = osmSource;
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
          this.instance.setProperties(change.currentValue ?? {}, false);
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
   * Returns the OpenLayers OSM instance.
   *
   * @returns The source after rendering, or `undefined` before creation and after destruction.
   */
  getInstance(): OSM | undefined {
    return this.instance;
  }
}
