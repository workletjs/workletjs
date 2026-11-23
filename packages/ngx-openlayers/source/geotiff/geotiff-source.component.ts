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
import { ProjectionLike } from 'ol/proj';
import GeoTIFFSource, { GeoTIFFSourceOptions, SourceInfo } from 'ol/source/GeoTIFF';
import { AttributionLike } from 'ol/source/Source';
import { TileSourceEvent } from 'ol/source/Tile';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { DisposeRef, useTileSourceHostRef } from '@workletjs/ngx-openlayers/source/tile';

/**
 * Reads GeoTIFF rasters and overviews and exposes their bands as data tiles.
 *
 * See the [OpenLayers GeoTIFFSource reference](https://openlayers.org/en/latest/apidoc/module-ol_source_GeoTIFF-GeoTIFFSource.html).
 *
 * Use `wolChange` and the source's `getState()` to wait for its metadata. A source instance can be
 * available before the data is ready.
 */
@Component({
  selector: 'wol-geotiff-source',
  exportAs: 'wolGeoTIFFSource',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolGeoTIFFSourceComponent implements OnChanges {
  /** Source credits shown by the attribution control. Changes update the existing source. */
  readonly wolAttributions = input<AttributionLike>();
  /**
   * Required list of GeoTIFF inputs with band selection and optional nodata values. Multiple inputs
   * need compatible resolution sets after scaling. Their selected bands are combined into output
   * tiles, with an alpha band when needed for nodata. Read at source creation.
   */
  readonly wolSources = input.required<SourceInfo[]>();
  /**
   * Read options forwarded to geotiff.js when opening remote datasets and their external overviews.
   * Read at source creation.
   */
  readonly wolSourceOptions = input<GeoTIFFSourceOptions>();
  /**
   * Converts supported photometric encodings to RGB when `true`, or automatically converts CMYK,
   * YCbCr, CIELab and ICCLab when set to `'auto'`. Defaults to `false`. Read at source creation.
   */
  readonly wolConvertToRGB = input<boolean | 'auto'>();
  /**
   * Normalizes sample values to the `0` to `1` range using per-source bounds or raster statistics.
   * Defaults to `true`. Set to `false` to use raw values in style expressions. Read at source
   * creation.
   */
  readonly wolNormalize = input<boolean>();
  /**
   * Source coordinate reference system. OpenLayers reads the GeoTIFF metadata when omitted. Read at
   * source creation.
   */
  readonly wolProjection = input<ProjectionLike>();
  /**
   * Tile fade-in duration in milliseconds. Defaults to `250`. Set to `0` to disable the fade. Read
   * at source creation.
   */
  readonly wolTransition = input<number>();
  /**
   * Whether tiles wrap horizontally beyond the antimeridian. Defaults to `false`. Read at source
   * creation.
   */
  readonly wolWrapX = input<boolean>();
  /**
   * Whether to use linear interpolation when resampling. Defaults to `true`. Set to `false` for
   * nearest-neighbor sampling. Read at source creation.
   */
  readonly wolInterpolate = input<boolean>();
  /**
   * Additional OpenLayers source properties. Binding changes add or update keys on the existing
   * source.
   */
  readonly wolProperties = input<WolProperties>();

  /**
   * Emits when the source changes. Check `getState()` for `loading`, `ready`, or `error` during
   * GeoTIFF metadata initialization.
   */
  readonly wolChange = output<BaseEvent>();
  /**
   * Forwards the native `error` event. GeoTIFF metadata failures are reported through `wolChange`
   * with source state `error`.
   */
  readonly wolError = output<BaseEvent>();
  /** Emits a `propertychange` event with the changed property name and its previous value. */
  readonly wolPropertyChange = output<ObjectEvent>();
  /** Emits when a source tile finishes loading. The event identifies the tile. */
  readonly wolTileLoadEnd = output<TileSourceEvent>();
  /** Emits when a source tile fails to load. The event identifies the tile. */
  readonly wolTileLoadError = output<TileSourceEvent>();
  /** Emits when a source tile starts loading. The event identifies the tile. */
  readonly wolTileLoadStart = output<TileSourceEvent>();

  private instance?: GeoTIFFSource;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useTileSourceHostRef<GeoTIFFSource>('GeoTIFFSource');
    const eventsKey: Record<string, EventsKey> = {};

    let disposeRef: DisposeRef;

    afterNextRender(() => {
      const geotiff = new GeoTIFFSource({
        sources: this.wolSources(),
        sourceOptions: this.wolSourceOptions(),
        convertToRGB: this.wolConvertToRGB(),
        normalize: this.wolNormalize(),
        projection: this.wolProjection(),
        transition: this.wolTransition(),
        wrapX: this.wolWrapX(),
        interpolate: this.wolInterpolate(),
        attributions: this.wolAttributions(),
      });

      if (this.wolProperties()) {
        geotiff.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKey['change'] = geotiff.on('change', (evt) => this.wolChange.emit(evt));

      eventsKey['error'] = geotiff.on('error', (evt) => this.wolError.emit(evt));

      eventsKey['propertychange'] = geotiff.on('propertychange', (evt) =>
        this.wolPropertyChange.emit(evt),
      );

      eventsKey['tileloadend'] = geotiff.on('tileloadend', (evt) => this.wolTileLoadEnd.emit(evt));

      eventsKey['tileloaderror'] = geotiff.on('tileloaderror', (evt) =>
        this.wolTileLoadError.emit(evt),
      );

      eventsKey['tileloadstart'] = geotiff.on('tileloadstart', (evt) =>
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
        disposeRef = hostRef.setSource(geotiff);
      });

      this.instance = geotiff;
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
        case 'wolProperties':
          this.instance.setProperties(change.currentValue ?? {});
          break;
      }
    }
  }

  /**
   * Gets the OpenLayers source created by this component.
   *
   * @returns The OpenLayers `GeoTIFFSource` instance, or `undefined` before creation and after
   * destruction.
   */
  getInstance(): GeoTIFFSource | undefined {
    return this.instance;
  }
}
