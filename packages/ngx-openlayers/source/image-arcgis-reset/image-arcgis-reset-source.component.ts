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
import ImageArcGISRest from 'ol/source/ImageArcGISRest';
import { AttributionLike } from 'ol/source/Source';

import { WolSafeAny } from '@workletjs/ngx-openlayers/core/types';
import { DisposeRef, useImageSourceHostRef } from '@workletjs/ngx-openlayers/source/image';

/**
 * Requests single dynamic images from an ArcGIS REST map or image service.
 *
 * See the [OpenLayers ImageArcGISRest reference](https://openlayers.org/en/latest/apidoc/module-ol_source_ImageArcGISRest-ImageArcGISRest.html).
 */
@Component({
  selector: 'wol-image-arcgis-reset-source',
  imports: [],
  template: `<ng-content />`,
  styles: ``,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolImageArcGISResetSourceComponent implements OnChanges {
  /** Source credits shown by the attribution control. Changes update the existing source. */
  readonly wolAttributions = input<AttributionLike>();
  /**
   * Cross-origin mode for image requests. Reading pixels from a cross-origin image on a canvas also
   * requires the corresponding server CORS headers. Read at source creation.
   */
  readonly wolCrossOrigin = input<null | string>();
  /**
   * Uses the map's pixel ratio in image requests when enabled. Defaults to `true`. Read at source
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
   * ArcGIS export parameters. OpenLayers defaults to PNG32 images with transparency and computes
   * `bbox`, `size`, `bboxSR`, and `imageSR` for each request. Set `layers` to select which service
   * layers to render. Changes replace the request parameters.
   */
  readonly wolParams = input<{ [key: string]: WolSafeAny }>();
  /**
   * ArcGIS spatial reference for the requested images. OpenLayers uses the view projection when
   * omitted. Supply a code ending in a numeric spatial reference ID or a complete ArcGIS spatial
   * reference definition. Read at source creation.
   */
  readonly wolProjection = input<ProjectionLike>();
  /**
   * Factor by which to scale the requested image extent in each dimension. Defaults to `1.5`, and
   * `1` requests the viewport extent. Read at source creation.
   */
  readonly wolRatio = input<number>();
  /**
   * Restricts image requests to the supplied resolutions, in projection units per pixel. Read at
   * source creation.
   */
  readonly wolResolutions = input<number[]>();
  /**
   * ArcGIS REST service URL ending in `/MapServer` or `/ImageServer`. Changes switch the URL on the
   * existing source.
   */
  readonly wolUrl = input<string>();

  /** Emits when the OpenLayers source revision advances, including source state changes. */
  readonly wolChange = output<BaseEvent>();
  /** Forwards the OpenLayers source's `error` event. */
  readonly wolError = output<BaseEvent>();
  /** Emits when a source image fails to load. The event identifies the image that failed. */
  readonly wolImageLoadError = output<ImageSourceEvent>();
  /** Emits when a source image starts loading. The event identifies the image being loaded. */
  readonly wolImageLoadStart = output<ImageSourceEvent>();
  /** Emits when a source image finishes loading. The event identifies the loaded image. */
  readonly wolImageLoadEnd = output<ImageSourceEvent>();
  /** Emits a `propertychange` event with the changed property name and its previous value. */
  readonly wolPropertyChange = output<ObjectEvent>();

  private instance?: ImageArcGISRest;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const host = useImageSourceHostRef<ImageArcGISRest>('ImageArcGISRest');
    const eventsKey: Record<string, EventsKey> = {};

    let disposeRef: DisposeRef;

    afterNextRender(() => {
      const imageSource = new ImageArcGISRest({
        attributions: this.wolAttributions(),
        crossOrigin: this.wolCrossOrigin(),
        hidpi: this.wolHidpi(),
        imageLoadFunction: this.wolImageLoadFunction(),
        interpolate: this.wolInterpolate(),
        params: this.wolParams(),
        projection: this.wolProjection(),
        ratio: this.wolRatio(),
        resolutions: this.wolResolutions(),
        url: this.wolUrl(),
      });

      eventsKey['change'] = imageSource.on('change', (evt) => this.wolChange.emit(evt));

      eventsKey['error'] = imageSource.on('error', (evt) => this.wolError.emit(evt));

      eventsKey['imageloaderror'] = imageSource.on('imageloaderror', (evt) =>
        this.wolImageLoadError.emit(evt),
      );

      eventsKey['imageloadstart'] = imageSource.on('imageloadstart', (evt) =>
        this.wolImageLoadStart.emit(evt),
      );

      eventsKey['imageloadend'] = imageSource.on('imageloadend', (evt) =>
        this.wolImageLoadEnd.emit(evt),
      );

      eventsKey['propertychange'] = imageSource.on('propertychange', (evt) =>
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
        disposeRef = host.setSource(imageSource);
      });

      this.instance = imageSource;
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
        case 'wolProperties':
          this.instance.setProperties(change.currentValue);
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
   * @returns The OpenLayers `ImageArcGISRest` instance, or `undefined` before creation and after
   * destruction.
   */
  getInstance(): ImageArcGISRest | undefined {
    return this.instance;
  }
}
