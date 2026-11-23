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
import ImageMapGuide from 'ol/source/ImageMapGuide';
import { AttributionLike } from 'ol/source/Source';

import { WolProperties, WolSafeAny } from '@workletjs/ngx-openlayers/core/types';
import { DisposeRef, useImageSourceHostRef } from '@workletjs/ngx-openlayers/source/image';

/**
 * Loads single map images from a MapGuide map agent.
 *
 * See the [OpenLayers ImageMapGuide reference](https://openlayers.org/en/latest/apidoc/module-ol_source_ImageMapGuide-ImageMapGuide.html).
 */
@Component({
  selector: 'wol-image-map-guide-source',
  imports: [],
  template: `<ng-content />`,
  styles: ``,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolImageMapGuideSourceComponent implements OnChanges {
  /** Source credits applied when the attribution binding changes after creation. */
  readonly wolAttributions = input<AttributionLike>();
  /** MapGuide map agent URL. Read at source creation. */
  readonly wolUrl = input<string>();
  /**
   * Cross-origin mode for image requests. Reading pixels from a cross-origin image on a canvas also
   * requires the corresponding server CORS headers. Read at source creation.
   */
  readonly wolCrossOrigin = input<null | string>();
  /**
   * Display resolution, in dots per inch, sent with the map request. Defaults to `96`. Read at
   * source creation.
   */
  readonly wolDisplayDpi = input<number>();
  /**
   * Number of meters represented by one map coordinate unit. Used to compute the map scale and
   * defaults to `1`. Read at source creation.
   */
  readonly wolMetersPerUnit = input<number>();
  /**
   * Uses the map's pixel ratio in image requests when enabled. Defaults to `true`. Read at source
   * creation.
   */
  readonly wolHidpi = input<boolean>();
  /**
   * Uses the `GETDYNAMICMAPOVERLAYIMAGE` operation when enabled. Defaults to `false`, which uses
   * `GETMAPIMAGE`. Read at source creation.
   */
  readonly wolUseOverlay = input<boolean>();
  /**
   * Projection of the requested imagery. OpenLayers uses the map view projection when omitted. Read
   * at source creation.
   */
  readonly wolProjection = input<ProjectionLike>();
  /**
   * Factor by which to scale the request extent in each dimension. Defaults to `1`, the viewport
   * extent. Use a value of at least `1`. Read at source creation.
   */
  readonly wolRatio = input<number>();
  /**
   * Restricts image requests to the supplied resolutions, in projection units per pixel. Read at
   * source creation.
   */
  readonly wolResolutions = input<number[]>();
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
   * Additional MapGuide request parameters. Changes replace the parameters on the existing source.
   */
  readonly wolParams = input<{ [key: string]: WolSafeAny }>();
  /**
   * Additional OpenLayers source properties. Updates after creation add or replace keys silently.
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

  private instance?: ImageMapGuide;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useImageSourceHostRef<ImageMapGuide>('ImageMapGuide');
    const eventsKey: Record<string, EventsKey> = {};

    let disposeRef: DisposeRef;

    afterNextRender(() => {
      const imageMapGuide = new ImageMapGuide({
        url: this.wolUrl(),
        crossOrigin: this.wolCrossOrigin(),
        displayDpi: this.wolDisplayDpi(),
        metersPerUnit: this.wolMetersPerUnit(),
        hidpi: this.wolHidpi(),
        useOverlay: this.wolUseOverlay(),
        projection: this.wolProjection(),
        ratio: this.wolRatio(),
        resolutions: this.wolResolutions(),
        imageLoadFunction: this.wolImageLoadFunction(),
        interpolate: this.wolInterpolate(),
        params: this.wolParams(),
      });

      if (!this.wolAttributions()) {
        imageMapGuide.setAttributions(this.wolAttributions());
      }

      if (!this.wolProperties()) {
        imageMapGuide.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKey['change'] = imageMapGuide.on('change', (event) => this.wolChange.emit(event));

      eventsKey['error'] = imageMapGuide.on('error', (event) => this.wolError.emit(event));

      eventsKey['imageloadend'] = imageMapGuide.on('imageloadend', (event) =>
        this.wolImageLoadEnd.emit(event),
      );

      eventsKey['imageloaderror'] = imageMapGuide.on('imageloaderror', (event) =>
        this.wolImageLoadError.emit(event),
      );

      eventsKey['imageloadstart'] = imageMapGuide.on('imageloadstart', (event) =>
        this.wolImageLoadStart.emit(event),
      );

      eventsKey['propertychange'] = imageMapGuide.on('propertychange', (event) =>
        this.wolPropertyChange.emit(event),
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
        disposeRef = hostRef.setSource(imageMapGuide);
      });

      this.instance = imageMapGuide;
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
          this.instance.setProperties(change.currentValue ?? {}, true);
          break;
      }
    }
  }

  /**
   * Gets the OpenLayers source created by this component.
   *
   * @returns The OpenLayers `ImageMapGuide` instance, or `undefined` before creation and after
   * destruction.
   */
  getInstance(): ImageMapGuide | undefined {
    return this.instance;
  }
}
