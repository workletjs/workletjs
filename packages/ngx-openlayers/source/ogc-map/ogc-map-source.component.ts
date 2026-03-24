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

@Component({
  selector: 'wol-ogc-map-source',
  exportAs: 'wolOGCMapSource',
  imports: [],
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolOGCMapSourceComponent implements OnChanges {
  /**
   * Attributions.
   */
  readonly wolAttributions = input<AttributionLike>();

  /**
   * Cross-origin setting for loaded images. Note that you must provide a `crossOrigin` value if you want to access pixel data with the Canvas renderer.
   * See https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image for more detail.
   */
  readonly wolCrossOrigin = input<null | string>();

  /**
   * Referrer policy for loaded images. See https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy for more detail.
   */
  readonly wolReferrerPolicy = input<ReferrerPolicy>();

  /**
   * If `true`, the device pixel ratio is used to request higher resolution tiles.
   * The `wolTileLoadFunction` will be called with a tile that has a higher resolution than the map's view resolution.
   */
  readonly wolHidpi = input<boolean>();

  /**
   * Optional function to load an image given a URL.
   */
  readonly wolImageLoadFunction = input<LoadFunction>();

  /**
   * Use interpolated values when resampling. By default, linear interpolation is used when resampling. Set to false to use the nearest neighbor instead.
   */
  readonly wolInterpolate = input<boolean>();

  /**
   * OGC Maps request parameters. No param is required by default. `width`, `height`, `bbox`, `crs` and `bbox-crs` will be set dynamically.
   */
  readonly wolParams = input<{ [key: string]: WolSafeAny }>();

  /**
   * Projection. Default is the view projection.
   */
  readonly wolProjection = input<ProjectionLike>();

  /**
   * Ratio. `1` means image requests are the size of the map viewport, `2` means twice the width and height of the map viewport, and so on. Must be `1` or higher.
   */
  readonly wolRatio = input<number>();

  /**
   * Resolutions. If specified, requests will be made for these resolutions only.
   */
  readonly wolResolutions = input<number[]>();

  /**
   * OGC Maps service URL.
   */
  readonly wolUrl = input<string>();

  /**
   * Arbitrary properties that will be set on the source.
   */
  readonly wolProperties = input<WolProperties>();

  /**
   * Event emitted when the source state changes.
   */
  readonly wolChange = output<BaseEvent>();

  /**
   * Event emitted when the source encounters an error.
   */
  readonly wolError = output<BaseEvent>();

  /**
   * Event emitted when an image loading ends.
   */
  readonly wolImageLoadEnd = output<ImageSourceEvent>();

  /**
   * Event emitted when an image loading encounters an error.
   */
  readonly wolImageLoadError = output<ImageSourceEvent>();

  /**
   * Event emitted when an image starts loading.
   */
  readonly wolImageLoadStart = output<ImageSourceEvent>();

  /**
   * Event emitted when a property of the source changes.
   */
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
   * Get the OpenLayers OGCMap instance.
   * @returns The OpenLayers OGCMap instance or undefined if not yet created.
   */
  getInstance(): OGCMap | undefined {
    return this.instance;
  }
}
