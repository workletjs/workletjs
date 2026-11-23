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
import { unByKey } from 'ol/Observable';
import { EventsKey } from 'ol/events';
import BaseEvent from 'ol/events/Event';
import { ProjectionLike } from 'ol/proj';
import { ImageSourceEvent } from 'ol/source/Image';
import ImageWMS from 'ol/source/ImageWMS';
import { AttributionLike } from 'ol/source/Source';
import { ServerType } from 'ol/source/wms';

import { WolProperties, WolSafeAny } from '@workletjs/ngx-openlayers/core/types';
import { DisposeRef, useImageSourceHostRef } from '@workletjs/ngx-openlayers/source/image';

/**
 * Requests a single georeferenced map image from a WMS service.
 *
 * See the [OpenLayers ImageWMS reference](https://openlayers.org/en/latest/apidoc/module-ol_source_ImageWMS-ImageWMS.html).
 */
@Component({
  selector: 'wol-image-wms-source',
  imports: [],
  template: `<ng-content />`,
  styles: ``,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolImageWMSSourceComponent implements OnChanges {
  /** Source credits shown by the attribution control. Changes update the existing source. */
  readonly wolAttributions = input<AttributionLike>();
  /**
   * Cross-origin mode for image requests. Reading pixels from a cross-origin image on a canvas also
   * requires the corresponding server CORS headers. Read at source creation.
   */
  readonly wolCrossOrigin = input<null | string>();
  /**
   * Uses the map's pixel ratio in image requests when `wolServerType` is set. Defaults to `true`.
   * Read at source creation.
   */
  readonly wolHidpi = input<boolean>();
  /**
   * Server's vendor identifier used for high-DPI requests. Accepted values are `'mapserver'`,
   * `'geoserver'`, `'carmentaserver'`, and `'qgis'`. Read at source creation.
   */
  readonly wolServerType = input<ServerType>();
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
   * WMS request parameters including `LAYERS`. The default `VERSION` is `'1.3.0'` and `STYLES` is
   * empty. OpenLayers computes `WIDTH`, `HEIGHT`, `BBOX`, and `CRS` or `SRS`. Changes replace the
   * request parameters.
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
  /** WMS service URL. Changes update the existing source. */
  readonly wolUrl = input<string>();
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
  /** Emits when a source image finishes loading. The event identifies the loaded image. */
  readonly wolImageLoadEnd = output<ImageSourceEvent>();
  /** Emits when a source image fails to load. The event identifies the image that failed. */
  readonly wolImageLoadError = output<ImageSourceEvent>();
  /** Emits when a source image starts loading. The event identifies the image being loaded. */
  readonly wolImageLoadStart = output<ImageSourceEvent>();
  /** Emits a `propertychange` event with the changed property name and its previous value. */
  readonly wolPropertyChange = output<BaseEvent>();

  private instance?: ImageWMS;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const host = useImageSourceHostRef<ImageWMS>('ImageWMS');
    const eventsKey: Record<string, EventsKey> = {};

    let disposeRef: DisposeRef;

    afterNextRender(() => {
      const imageWMS = new ImageWMS({
        attributions: this.wolAttributions(),
        crossOrigin: this.wolCrossOrigin(),
        hidpi: this.wolHidpi(),
        serverType: this.wolServerType(),
        imageLoadFunction: this.wolImageLoadFunction(),
        interpolate: this.wolInterpolate(),
        params: this.wolParams(),
        projection: this.wolProjection(),
        ratio: this.wolRatio(),
        resolutions: this.wolResolutions(),
        url: this.wolUrl(),
        referrerPolicy: this.wolReferrerPolicy(),
      });

      if (!this.wolProperties()) {
        imageWMS.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKey['change'] = imageWMS.on('change', (evt) => this.wolChange.emit(evt));

      eventsKey['error'] = imageWMS.on('error', (evt) => this.wolError.emit(evt));

      eventsKey['imageloadend'] = imageWMS.on('imageloadend', (evt) =>
        this.wolImageLoadEnd.emit(evt),
      );

      eventsKey['imageloaderror'] = imageWMS.on('imageloaderror', (evt) =>
        this.wolImageLoadError.emit(evt),
      );

      eventsKey['imageloadstart'] = imageWMS.on('imageloadstart', (evt) =>
        this.wolImageLoadStart.emit(evt),
      );

      eventsKey['propertychange'] = imageWMS.on('propertychange', (evt) =>
        this.wolPropertyChange.emit(evt),
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
        disposeRef = host.setSource(imageWMS);
      });

      this.instance = imageWMS;
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
   * @returns The OpenLayers `ImageWMS` instance, or `undefined` before creation and after
   * destruction.
   */
  getInstance(): ImageWMS | undefined {
    return this.instance;
  }
}
