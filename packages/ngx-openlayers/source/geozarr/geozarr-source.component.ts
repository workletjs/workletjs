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
import { EventsKey } from 'ol/events';
import BaseEvent from 'ol/events/Event';
import GeoZarr, { Options } from 'ol/source/GeoZarr';
import { AttributionLike } from 'ol/source/Source';
import { TileSourceEvent } from 'ol/source/Tile';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { DisposeRef, useDataTileSourceHostRef } from '@workletjs/ngx-openlayers/source/data-tile';

/**
 * Provides tiled GeoZarr raster data to a Raster, WebGLTile, Tile, or Flow host.
 *
 * See the [OpenLayers GeoZarr reference](https://github.com/openlayers/openlayers/blob/v10.11.0/src/ol/source/GeoZarr.js).
 *
 * Recreate the component to apply a new store configuration. Use the instance's
 * `updateDimensions()` method to update non-spatial dimension indices.
 *
 * @experimental GeoZarr is experimental in OpenLayers and its API may change.
 */
@Component({
  selector: 'wol-geozarr-source',
  exportAs: 'wolGeoZarrSource',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolGeoZarrSourceComponent implements OnChanges {
  /**
   * Required URL of the data group. For band/group pairs, supply the base URL from which the group
   * paths are resolved. Read at source creation.
   */
  readonly wolUrl = input.required<Options['url']>();
  /**
   * Band names from a single group or pairs of band names and group paths. Choose this for stores
   * with separate band arrays. Supply either `wolBands` or `wolVariable`. Read at source creation.
   */
  readonly wolBands = input<Options['bands']>();
  /**
   * Fetch options such as headers and credentials forwarded to the Zarr store. Read at source
   * creation.
   */
  readonly wolStoreOptions = input<Options['storeOptions']>();
  /**
   * Source projection. OpenLayers infers it from GeoZarr metadata when omitted. Read at source
   * creation.
   */
  readonly wolProjection = input<Options['projection']>();
  /**
   * Tile fade-in duration in milliseconds. Defaults to `250`. Set to `0` to disable the fade. Read
   * at source creation.
   */
  readonly wolTransition = input<Options['transition']>();
  /**
   * Whether tiles may wrap horizontally beyond the tile grid extent. Defaults to `false`. Read at
   * source creation.
   */
  readonly wolWrapX = input<Options['wrapX']>();
  /**
   * Resampling method used when the requested band is unavailable at a multiscale level. Defaults
   * to `'linear'`. Read at source creation.
   */
  readonly wolResample = input<Options['resample']>();
  /**
   * Initial indices or coordinate labels keyed by non-spatial dimension name. Unspecified
   * dimensions start at index `0`. With `wolVariable`, one dimension can select multiple entries as
   * separate output bands. Use `updateDimensions()` on the native instance to change a single-value
   * dimension by integer index. Read at source creation.
   */
  readonly wolDimensions = input<Options['dimensions']>();
  /**
   * Name of the multidimensional array to render when it contains all the bands. Supply either
   * `wolVariable` or `wolBands`. Read at source creation.
   */
  readonly wolVariable = input<Options['variable']>();
  /**
   * Fallback data extent in source coordinates. OpenLayers uses this when metadata and coordinate
   * arrays provide no extent. Read at source creation.
   */
  readonly wolExtent = input<Options['extent']>();
  /**
   * Fallback row orientation for south-up data. Set to `true` when the y coordinates increase and
   * the store provides no orientation information. Read at source creation.
   */
  readonly wolFlipY = input<Options['flipY']>();
  /** Source credits shown by the attribution control. Changes update the existing source. */
  readonly wolAttributions = input<AttributionLike>();
  /**
   * Additional OpenLayers source properties. Binding changes add or update keys on the existing
   * source.
   */
  readonly wolProperties = input<WolProperties>();

  /**
   * Emits when the source changes. Inspect `getState()` on the source for `loading`, `ready`, or
   * `error` during metadata initialization.
   */
  readonly wolChange = output<BaseEvent>();
  /**
   * Forwards the native `error` event. Use `wolChange` to detect a metadata initialization failure
   * and `wolTileLoadError` for a tile read failure.
   */
  readonly wolError = output<BaseEvent>();
  /** Emits a `propertychange` event with the changed property name and its previous value. */
  readonly wolPropertyChange = output<ObjectEvent>();
  /** Emits when a source tile starts loading. The event identifies the tile. */
  readonly wolTileLoadStart = output<TileSourceEvent>();
  /** Emits when a source tile finishes loading. The event identifies the tile. */
  readonly wolTileLoadEnd = output<TileSourceEvent>();
  /**
   * Emits when an individual tile fails to load. Metadata initialization failures are reported
   * through `wolChange` with source state `error`.
   */
  readonly wolTileLoadError = output<TileSourceEvent>();

  private instance?: GeoZarr;

  /** @internal */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useDataTileSourceHostRef<GeoZarr>('GeoZarrSource');
    const eventsKey: Record<string, EventsKey> = {};
    let disposeRef: DisposeRef | undefined;

    afterNextRender(() => {
      const source = new GeoZarr({
        url: this.wolUrl(),
        bands: this.wolBands(),
        storeOptions: this.wolStoreOptions(),
        projection: this.wolProjection(),
        transition: this.wolTransition(),
        wrapX: this.wolWrapX(),
        resample: this.wolResample(),
        dimensions: this.wolDimensions(),
        variable: this.wolVariable(),
        extent: this.wolExtent(),
        flipY: this.wolFlipY(),
      });

      source.setAttributions(this.wolAttributions());
      if (this.wolProperties()) {
        source.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKey['change'] = source.on('change', (event) => this.wolChange.emit(event));
      eventsKey['error'] = source.on('error', (event) => this.wolError.emit(event));
      eventsKey['propertychange'] = source.on('propertychange', (event) =>
        this.wolPropertyChange.emit(event),
      );
      eventsKey['tileloadstart'] = source.on('tileloadstart', (event) =>
        this.wolTileLoadStart.emit(event),
      );
      eventsKey['tileloadend'] = source.on('tileloadend', (event) =>
        this.wolTileLoadEnd.emit(event),
      );
      eventsKey['tileloaderror'] = source.on('tileloaderror', (event) =>
        this.wolTileLoadError.emit(event),
      );

      this.instance = source;

      // Wait until hosts created by Angular control flow have completed rendering.
      Promise.resolve().then(() => {
        if (!destroyRef.destroyed) {
          disposeRef = hostRef.setSource(source);
        }
      });
    });

    destroyRef.onDestroy(() => {
      disposeRef?.();
      unByKey(Object.values(eventsKey));
      this.instance = undefined;
    });
  }

  /** @internal */
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
      }
    }
  }

  /**
   * Gets the OpenLayers source created by this component.
   *
   * @returns The OpenLayers `GeoZarr` instance, or `undefined` before creation and after
   * destruction.
   */
  getInstance(): GeoZarr | undefined {
    return this.instance;
  }
}
