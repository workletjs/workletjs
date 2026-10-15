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
 * Provides GeoZarr raster data to a Raster, WebGLTile, Tile or Flow host.
 * Constructor inputs are read once. Remount this component to apply new configuration,
 * or use the instance's `updateDimensions()` method to change non-spatial dimension indices.
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
  /** The GeoZarr group or store URL. Required; read only at initialization. */
  readonly wolUrl = input.required<Options['url']>();
  /** Band names or band/group pairs. Mutually exclusive with `wolVariable`. */
  readonly wolBands = input<Options['bands']>();
  /** Request headers and credentials forwarded to the store. */
  readonly wolStoreOptions = input<Options['storeOptions']>();
  /** Source projection; inferred from metadata when omitted. */
  readonly wolProjection = input<Options['projection']>();
  /** Opacity transition duration; use zero to disable it. */
  readonly wolTransition = input<Options['transition']>();
  /** Whether tiles may render beyond the tile grid extent. */
  readonly wolWrapX = input<Options['wrapX']>();
  /** Resampling method for bands unavailable at a multi-scale level. */
  readonly wolResample = input<Options['resample']>();
  /** Initial non-spatial dimension indices, labels or band selections. */
  readonly wolDimensions = input<Options['dimensions']>();
  /** A single multi-dimensional variable. Mutually exclusive with `wolBands`. */
  readonly wolVariable = input<Options['variable']>();
  /** Fallback extent in source coordinates when metadata cannot provide one. */
  readonly wolExtent = input<Options['extent']>();
  /** Fallback south-up orientation when metadata cannot provide one. */
  readonly wolFlipY = input<Options['flipY']>();
  /** Attribution; updates the existing source when changed. */
  readonly wolAttributions = input<AttributionLike>();
  /** Additional source properties; updates the existing source when changed. */
  readonly wolProperties = input<WolProperties>();

  /** Native change event; inspect `getState()` to track initialization failures. */
  readonly wolChange = output<BaseEvent>();
  /** Native error event. GeoZarr initialization failures do not emit this event. */
  readonly wolError = output<BaseEvent>();
  readonly wolPropertyChange = output<ObjectEvent>();
  readonly wolTileLoadStart = output<TileSourceEvent>();
  readonly wolTileLoadEnd = output<TileSourceEvent>();
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

  /** Returns the native GeoZarr source, or undefined before creation and after destruction. */
  getInstance(): GeoZarr | undefined {
    return this.instance;
  }
}
