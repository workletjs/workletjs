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

import { LoadFunction } from 'ol/Image';
import { ObjectEvent } from 'ol/Object';
import { unByKey } from 'ol/Observable';
import { EventsKey } from 'ol/events';
import BaseEvent from 'ol/events/Event';
import { ProjectionLike } from 'ol/proj';
import { ImageSourceEvent } from 'ol/source/Image';
import OGCMap from 'ol/source/OGCMap';
import { AttributionLike } from 'ol/source/Source';

import { WolProperties, WolSafeAny } from '@workletjs/ngx-openlayers/core/types';
import { DisposeRef, useImageSourceHostRef } from '@workletjs/ngx-openlayers/source/image';

/**
 * Requests single, untiled images from an OGC API Maps service.
 *
 * See the [OpenLayers OGCMap reference](https://openlayers.org/en/latest/apidoc/module-ol_source_OGCMap-OGCMap.html).
 */
@Component({
  selector: 'wol-ogc-map-source',
  exportAs: 'wolOGCMapSource',
  imports: [],
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolOGCMapSourceComponent implements OnChanges {
  /** Source credits shown by the attribution control. Changes update the existing source. */
  readonly wolAttributions = input<AttributionLike>();

  /**
   * Cross-origin mode for image requests. Reading pixels from a cross-origin image on a canvas also
   * requires the corresponding server CORS headers. Read at source creation.
   */
  readonly wolCrossOrigin = input<null | string>();

  /** Referrer policy applied to outgoing image requests. Read at source creation. */
  readonly wolReferrerPolicy = input<ReferrerPolicy>();

  /**
   * Uses the map's pixel ratio when requesting a single image from the OGC Maps service. Defaults
   * to `true`. The resulting image URL is passed to `wolImageLoadFunction`. Read at source
   * creation.
   */
  readonly wolHidpi = input<boolean>();

  /**
   * Callback that loads an image using the supplied URL. By default, OpenLayers assigns the URL to
   * the image. Changes update the existing source.
   */
  readonly wolImageLoadFunction = input<LoadFunction>();

  /**
   * Whether to use linear interpolation when resampling. Defaults to `true`. Set to `false` for
   * nearest-neighbor sampling. Read at source creation.
   */
  readonly wolInterpolate = input<boolean>();

  /**
   * Optional OGC Maps request parameters. OpenLayers computes `width`, `height`, `bbox`, `crs`, and
   * `bbox-crs`. Changes replace the request parameters.
   */
  readonly wolParams = input<{ [key: string]: WolSafeAny }>();

  /**
   * Projection of the requested imagery. OpenLayers uses the map view projection when omitted. Read
   * at source creation.
   */
  readonly wolProjection = input<ProjectionLike>();

  /**
   * Factor by which to scale the requested image extent in each dimension. Defaults to `1.5`.
   * Values start at `1`, which requests the viewport extent. Read at source creation.
   */
  readonly wolRatio = input<number>();

  /**
   * Restricts image requests to the supplied resolutions, in projection units per pixel. Read at
   * source creation.
   */
  readonly wolResolutions = input<number[]>();

  /** OGC Maps service URL. Changes update the existing source. */
  readonly wolUrl = input<string>();

  /**
   * Additional OpenLayers source properties. Binding changes add or update keys on the existing
   * source.
   */
  readonly wolProperties = input<WolProperties>();

  /** Emits when the OpenLayers source revision advances, including source state changes. */
  readonly wolChange = output<BaseEvent>();

  /** Forwards the OpenLayers source's `error` event. */
  readonly wolError = output<BaseEvent>();

  /** Emits when a source image finishes loading. The event identifies the loaded image. */
  readonly wolImageLoadEnd = output<ImageSourceEvent>();

  /** Emits when a source image fails to load. The event identifies the image that failed. */
  readonly wolImageLoadError = output<ImageSourceEvent>();

  /** Emits when a source image starts loading. The event identifies the image being loaded. */
  readonly wolImageLoadStart = output<ImageSourceEvent>();

  /** Emits a `propertychange` event with the changed property name and its previous value. */
  readonly wolPropertyChange = output<ObjectEvent>();

  private instance?: OGCMap;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const host = useImageSourceHostRef<OGCMap>('OGCMap');
    const eventsKey: Record<string, EventsKey> = {};

    let disposeRef: DisposeRef;

    afterNextRender(() => {
      const ogcMap = new OGCMap({
        attributions: this.wolAttributions(),
        crossOrigin: this.wolCrossOrigin(),
        referrerPolicy: this.wolReferrerPolicy(),
        hidpi: this.wolHidpi(),
        imageLoadFunction: this.wolImageLoadFunction(),
        interpolate: this.wolInterpolate(),
        params: this.wolParams(),
        projection: this.wolProjection(),
        ratio: this.wolRatio(),
        resolutions: this.wolResolutions(),
        url: this.wolUrl(),
      });

      if (this.wolProperties()) {
        ogcMap.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKey['change'] = ogcMap.on('change', (evt) => this.wolChange.emit(evt));

      eventsKey['error'] = ogcMap.on('error', (evt) => this.wolError.emit(evt));

      eventsKey['imageloadend'] = ogcMap.on('imageloadend', (evt) =>
        this.wolImageLoadEnd.emit(evt),
      );

      eventsKey['imageloaderror'] = ogcMap.on('imageloaderror', (evt) =>
        this.wolImageLoadError.emit(evt),
      );

      eventsKey['imageloadstart'] = ogcMap.on('imageloadstart', (evt) =>
        this.wolImageLoadStart.emit(evt),
      );

      eventsKey['propertychange'] = ogcMap.on('propertychange', (evt) =>
        this.wolPropertyChange.emit(evt),
      );

      /**
       * Setting the source to the image layer must be done after the map is rendered,
       * if used with control flow of Angular.
       *
       * In Angular, when rendering a component's template, the control flow statements,
       * such as @if, @else, @else if, @for, and @switch, are evaluated during the template
       * rendering process. This evaluation happens before the actual content within the blocks
       * is rendered to the DOM.
       */
      Promise.resolve().then(() => {
        disposeRef = host.setSource(ogcMap);
      });

      this.instance = ogcMap;
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

    for (const [key, change] of Object.entries(changes)) {
      switch (key) {
        case 'wolAttributions':
          this.instance.setAttributions(change.currentValue);
          break;
        case 'wolImageLoadFunction':
          this.instance.setImageLoadFunction(change.currentValue);
          break;
        case 'wolParams':
          this.instance.setParams(change.currentValue);
          break;
        case 'wolUrl':
          this.instance.setUrl(change.currentValue);
          break;
        case 'wolProperties':
          this.instance.setProperties(change.currentValue ?? {}, false);
          break;
      }
    }
  }

  /**
   * Gets the OpenLayers source created by this component.
   *
   * @returns The OpenLayers `OGCMap` instance, or `undefined` before creation and after
   * destruction.
   */
  getInstance(): OGCMap | undefined {
    return this.instance;
  }
}
