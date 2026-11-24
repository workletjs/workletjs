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
import { Extent } from 'ol/extent';
import { Versions } from 'ol/format/IIIFInfo';
import { ProjectionLike } from 'ol/proj';
import { Size } from 'ol/size';
import IIIF from 'ol/source/IIIF';
import { AttributionLike, State } from 'ol/source/Source';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { DisposeRef, useTileSourceHostRef } from '@workletjs/ngx-openlayers/source/tile';

/**
 * Provides tiles for a raster image from a IIIF Image API service.
 *
 * See the [OpenLayers IIIF reference](https://openlayers.org/en/latest/apidoc/module-ol_source_IIIF-IIIF.html).
 *
 * Use OpenLayers `IIIFInfo` to parse the service's `info.json` into image sizes, scale factors, and
 * capabilities.
 */
@Component({
  selector: 'wol-iiif-source',
  exportAs: 'wolIIIFSource',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolIIIFSourceComponent implements OnChanges {
  /** Source credits shown by the attribution control. Changes update the existing source. */
  readonly wolAttributions = input<AttributionLike>();
  /**
   * Whether the attribution control may collapse this source's credits. Defaults to `true`. Read at
   * source creation.
   */
  readonly wolAttributionCollapsible = input<boolean>();
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
  readonly wolCrossOrigin = input<null | string>();
  /**
   * Image extent in source coordinates. Defaults to `[0, -height, width, 0]`. Read at source
   * creation.
   */
  readonly wolExtent = input<Extent>();
  /** Image format requested from the service. Defaults to `'jpg'`. Read at source creation. */
  readonly wolFormat = input<string>();
  /**
   * Whether to use linear interpolation when resampling. Defaults to `true`. Set to `false` for
   * nearest-neighbor sampling. Read at source creation.
   */
  readonly wolInterpolate = input<boolean>();
  /** Projection of the image extent and tile grid. Read at source creation. */
  readonly wolProjection = input<ProjectionLike>();
  /**
   * IIIF image quality to request. Defaults to `'native'` for version 1 and `'default'` for
   * versions 2 and 3. Read at source creation.
   */
  readonly wolQuality = input<string>();
  /**
   * Maximum reprojection error in pixels. Defaults to `0.5`. Increasing this value trades accuracy
   * for faster reprojection. Read at source creation.
   */
  readonly wolReprojectionErrorThreshold = input<number>();
  /** Supported image downsampling factors from IIIF `scaleFactors`. Read at source creation. */
  readonly wolResolutions = input<number[]>();
  /**
   * Required full image width and height in pixels. Both values must be positive. Read at source
   * creation.
   */
  readonly wolSize = input.required<Size>();
  /**
   * Image sizes the service offers at reduced resolutions, expressed as width and height pairs from
   * `info.json`. Read at source creation.
   */
  readonly wolSizes = input<Size[]>();
  /** Initial OpenLayers source state. Defaults to `'ready'`. Read at source creation. */
  readonly wolState = input<State>();
  /**
   * IIIF capabilities used to decide which region and size operations the service can handle.
   * Defaults to an empty list. Read at source creation.
   */
  readonly wolSupports = input<string[]>();
  /** Image pixels per logical tile pixel. Defaults to `1`. Read at source creation. */
  readonly wolTilePixelRatio = input<number>();
  /**
   * Tile width and height from the service metadata. A single value gives a square tile. For
   * services supporting arbitrary tiling, the default is `256` pixels. Read at source creation.
   */
  readonly wolTileSize = input<number | Size>();
  /**
   * Tile fade-in duration in milliseconds. Defaults to `250`. Set to `0` to disable the fade. Read
   * at source creation.
   */
  readonly wolTransition = input<number>();
  /**
   * Base image service URL matching the IIIF image identifier. Recreate the component to build IIIF
   * tile requests for a different image. On an existing source, the binding is forwarded to
   * OpenLayers `setUrl()`.
   */
  readonly wolUrl = input<string>();
  /** IIIF Image API version. Defaults to version 2. Read at source creation. */
  readonly wolVersion = input<Versions>();
  /**
   * Chooses the tile zoom at intermediate view resolutions. Defaults to `0` for the nearest level.
   * Use `1` to favor the coarser level, `-1` for the finer level, or provide a function. Read at
   * source creation.
   */
  readonly wolZDirection = input<number | NearestDirectionFunction>();
  /**
   * Additional OpenLayers source properties. Binding changes add or update keys on the existing
   * source.
   */
  readonly wolProperties = input<WolProperties>();

  /** Emits when the OpenLayers source revision advances, including source state changes. */
  readonly wolChange = output<BaseEvent>();
  /** Forwards the OpenLayers source's `error` event. */
  readonly wolError = output<BaseEvent>();
  /** Emits a `propertychange` event with the changed property name and its previous value. */
  readonly wolPropertyChange = output<ObjectEvent>();
  /** Forwards the native `tileloadend` event as a `BaseEvent` after a tile loads. */
  readonly wolTileLoadEnd = output<BaseEvent>();
  /** Forwards the native `tileloaderror` event as a `BaseEvent` when a tile fails. */
  readonly wolTileLoadError = output<BaseEvent>();
  /** Forwards the native `tileloadstart` event as a `BaseEvent` when a tile starts loading. */
  readonly wolTileLoadStart = output<BaseEvent>();

  private instance?: IIIF;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useTileSourceHostRef<IIIF>('IIIF');
    const eventsKey: Record<string, EventsKey> = {};

    let disposeRef: DisposeRef;

    afterNextRender(() => {
      const iiif = new IIIF({
        attributions: this.wolAttributions(),
        attributionsCollapsible: this.wolAttributionCollapsible(),
        cacheSize: this.wolCacheSize(),
        crossOrigin: this.wolCrossOrigin(),
        extent: this.wolExtent(),
        format: this.wolFormat(),
        interpolate: this.wolInterpolate(),
        projection: this.wolProjection(),
        quality: this.wolQuality(),
        reprojectionErrorThreshold: this.wolReprojectionErrorThreshold(),
        resolutions: this.wolResolutions(),
        size: this.wolSize(),
        sizes: this.wolSizes(),
        state: this.wolState(),
        supports: this.wolSupports(),
        tilePixelRatio: this.wolTilePixelRatio(),
        tileSize: this.wolTileSize(),
        transition: this.wolTransition(),
        url: this.wolUrl(),
        version: this.wolVersion(),
        zDirection: this.wolZDirection(),
      });

      if (this.wolProperties()) {
        iiif.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKey['change'] = iiif.on('change', (evt) => this.wolChange.emit(evt));

      eventsKey['error'] = iiif.on('error', (evt) => this.wolError.emit(evt));

      eventsKey['propertychange'] = iiif.on('propertychange', (evt) =>
        this.wolPropertyChange.emit(evt),
      );

      eventsKey['tileloadend'] = iiif.on('tileloadend', (evt) => this.wolTileLoadEnd.emit(evt));

      eventsKey['tileloaderror'] = iiif.on('tileloaderror', (evt) =>
        this.wolTileLoadError.emit(evt),
      );

      eventsKey['tileloadstart'] = iiif.on('tileloadstart', (evt) =>
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
        disposeRef = hostRef.setSource(iiif);
      });

      this.instance = iiif;
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
        case 'wolUrl':
          this.instance.setUrl(change.currentValue);
          break;
      }
    }
  }

  /**
   * Gets the OpenLayers source created by this component.
   *
   * @returns The OpenLayers `IIIF` instance, or `undefined` before creation and after destruction.
   */
  getInstance(): IIIF | undefined {
    return this.instance;
  }
}
