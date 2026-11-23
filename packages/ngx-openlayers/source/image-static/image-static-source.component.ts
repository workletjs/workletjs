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
import { Extent } from 'ol/extent';
import { ProjectionLike } from 'ol/proj';
import { ImageSourceEvent } from 'ol/source/Image';
import Static from 'ol/source/ImageStatic';
import { AttributionLike } from 'ol/source/Source';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { DisposeRef, useImageSourceHostRef } from '@workletjs/ngx-openlayers/source/image';

/**
 * Places one image at a fixed extent in the source projection.
 *
 * See the [OpenLayers Static reference](https://openlayers.org/en/latest/apidoc/module-ol_source_ImageStatic-Static.html).
 */
@Component({
  selector: 'wol-image-static-source',
  imports: [],
  template: `<ng-content />`,
  styles: ``,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolImageStaticSourceComponent implements OnChanges {
  /** Source credits shown by the attribution control. Changes update the existing source. */
  readonly wolAttributions = input<AttributionLike>();
  /**
   * Cross-origin mode for image requests. Reading pixels from a cross-origin image on a canvas also
   * requires the corresponding server CORS headers. Read at source creation.
   */
  readonly wolCrossOrigin = input<null | string>();
  /**
   * Required image bounds as `[minX, minY, maxX, maxY]` in the image projection. Read at source
   * creation.
   */
  readonly wolImageExtent = input.required<Extent>();
  /**
   * Callback that loads an image using the supplied URL. By default, OpenLayers assigns the URL to
   * the image. Read at source creation.
   */
  readonly wolImageLoadFunction = input<LoadFunction>();
  /**
   * Whether to use linear interpolation when resampling. Defaults to `true`. Set to `false` for
   * nearest-neighbor sampling. Read at source creation.
   */
  readonly wolInterpolate = input<boolean>();
  /**
   * Projection of the image extent. Specify it when the coordinates use a different projection than
   * the map view. Read at source creation.
   */
  readonly wolProjection = input<ProjectionLike>();
  /** Required URL of the image to display. Read at source creation. */
  readonly wolUrl = input.required<string>();
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
  /** Forwards the native `propertychange` notification as a `BaseEvent`. */
  readonly wolPropertyChange = output<BaseEvent>();

  private instance?: Static;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useImageSourceHostRef<Static>('ImageStatic');
    const eventsKey: Record<string, EventsKey> = {};

    let disposeRef: DisposeRef;

    afterNextRender(() => {
      const staticSource = new Static({
        attributions: this.wolAttributions(),
        crossOrigin: this.wolCrossOrigin(),
        imageExtent: this.wolImageExtent(),
        imageLoadFunction: this.wolImageLoadFunction(),
        interpolate: this.wolInterpolate(),
        projection: this.wolProjection(),
        url: this.wolUrl(),
        referrerPolicy: this.wolReferrerPolicy(),
      });

      if (!this.wolProperties()) {
        staticSource.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKey['change'] = staticSource.on('change', (evt) => this.wolChange.emit(evt));

      eventsKey['error'] = staticSource.on('error', (evt) => this.wolError.emit(evt));

      eventsKey['imageloadend'] = staticSource.on('imageloadend', (evt) =>
        this.wolImageLoadEnd.emit(evt),
      );

      eventsKey['imageloaderror'] = staticSource.on('imageloaderror', (evt) =>
        this.wolImageLoadError.emit(evt),
      );

      eventsKey['imageloadstart'] = staticSource.on('imageloadstart', (evt) =>
        this.wolImageLoadStart.emit(evt),
      );

      eventsKey['propertychange'] = staticSource.on('propertychange', (evt) =>
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
        disposeRef = hostRef.setSource(staticSource);
      });

      this.instance = staticSource;
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
        case 'wolProperties':
          this.instance.setProperties(change.currentValue ?? {}, false);
          break;
      }
    }
  }

  /**
   * Gets the OpenLayers source created by this component.
   *
   * @returns The OpenLayers `Static` instance, or `undefined` before creation and after
   * destruction.
   */
  getInstance(): Static | undefined {
    return this.instance;
  }
}
