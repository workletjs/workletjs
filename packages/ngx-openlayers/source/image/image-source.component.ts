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

import { Loader } from 'ol/Image';
import { ObjectEvent } from 'ol/Object';
import { unByKey } from 'ol/Observable';
import { EventsKey } from 'ol/events';
import BaseEvent from 'ol/events/Event';
import { ProjectionLike } from 'ol/proj';
import ImageSource, { ImageSourceEvent } from 'ol/source/Image';
import { AttributionLike, State } from 'ol/source/Source';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';

import { DisposeRef, useImageSourceHostRef } from './use-image-source-host-ref';

/**
 * Provides a single image for the requested extent and resolution through an OpenLayers image
 * loader.
 *
 * See the [OpenLayers ImageSource reference](https://openlayers.org/en/latest/apidoc/module-ol_source_Image-ImageSource.html).
 */
@Component({
  selector: 'wol-image-source',
  imports: [],
  template: `<ng-content />`,
  styles: ``,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolImageSourceComponent implements OnChanges {
  /** Source credits shown by the attribution control. Changes update the existing source. */
  readonly wolAttributions = input<AttributionLike>();
  /**
   * Whether to use linear interpolation when resampling. Defaults to `true`. Set to `false` for
   * nearest-neighbor sampling. Read at source creation.
   */
  readonly wolInterpolate = input<boolean>();
  /**
   * Image loader called with the requested extent, resolution, and pixel ratio. Use a custom loader
   * or a loader factory from OpenLayers, such as WMS or ArcGIS REST. Read at source creation.
   */
  readonly wolLoader = input<Loader>();
  /** Coordinate reference system of the loaded images. Read at source creation. */
  readonly wolProjection = input<ProjectionLike>();
  /**
   * Resolutions from which to choose the nearest to a requested view resolution, in projection
   * units per pixel. Read at source creation.
   */
  readonly wolResolutions = input<number[]>();
  /** Initial OpenLayers source state. Defaults to `'ready'`. Read at source creation. */
  readonly wolState = input<State>();
  /**
   * Additional OpenLayers source properties. Binding changes add or update keys silently on the
   * existing source.
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

  private instanece?: ImageSource;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const host = useImageSourceHostRef<ImageSource>('ImageSource');
    const eventsKey: Record<string, EventsKey> = {};

    let disposeRef: DisposeRef;

    afterNextRender(() => {
      const imageSource = new ImageSource({
        attributions: this.wolAttributions(),
        interpolate: this.wolInterpolate(),
        loader: this.wolLoader(),
        projection: this.wolProjection(),
        resolutions: this.wolResolutions(),
        state: this.wolState(),
      });

      if (this.wolProperties()) {
        imageSource.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKey['change'] = imageSource.on('change', (event) => this.wolChange.emit(event));

      eventsKey['error'] = imageSource.on('error', (event) => this.wolError.emit(event));

      eventsKey['imageloadend'] = imageSource.on('imageloadend', (event) =>
        this.wolImageLoadEnd.emit(event),
      );

      eventsKey['imageloaderror'] = imageSource.on('imageloaderror', (event) =>
        this.wolImageLoadError.emit(event),
      );

      eventsKey['imageloadstart'] = imageSource.on('imageloadstart', (event) =>
        this.wolImageLoadStart.emit(event),
      );

      eventsKey['propertychange'] = imageSource.on('propertychange', (event) =>
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
        disposeRef = host.setSource(imageSource);
      });

      this.instanece = imageSource;
    });

    destroyRef.onDestroy(() => {
      if (this.instanece) {
        if (disposeRef) {
          disposeRef();
        }

        unByKey(Object.values(eventsKey));

        this.instanece = undefined;
      }
    });
  }

  /**
   * Respond to input changes.
   * @param changes The changed inputs
   * @internal
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (!this.instanece) {
      return;
    }

    for (const [key, change] of Object.entries(changes)) {
      switch (key) {
        case 'wolAttributions':
          this.instanece.setAttributions(change.currentValue);
          break;
        case 'wolProperties':
          this.instanece.setProperties(change.currentValue, true);
          break;
      }
    }
  }

  /**
   * Gets the OpenLayers source created by this component.
   *
   * @returns The OpenLayers `ImageSource` instance, or `undefined` before creation and after
   * destruction.
   */
  getInstance(): ImageSource | undefined {
    return this.instanece;
  }
}
