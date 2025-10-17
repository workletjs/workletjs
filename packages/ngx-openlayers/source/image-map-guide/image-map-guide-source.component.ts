import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  OnChanges,
  output,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { WolProperties, WolSafeAny } from '@workletjs/ngx-openlayers/core/types';
import { DisposeRef, useImageSourceHostRef } from '@workletjs/ngx-openlayers/source/image';
import { LoadFunction } from 'ol/Image';
import { ObjectEvent } from 'ol/Object';
import { ProjectionLike } from 'ol/proj';
import { ImageSourceEvent } from 'ol/source/Image';
import { AttributionLike } from 'ol/source/Source';
import { EventsKey } from 'ol/events';
import { unByKey } from 'ol/Observable';
import BaseEvent from 'ol/events/Event';
import ImageMapGuide from 'ol/source/ImageMapGuide';

@Component({
  selector: 'wol-image-map-guide-source',
  imports: [],
  template: `<ng-content />`,
  styles: ``,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolImageMapGuideSourceComponent implements OnChanges {
  readonly wolAttributions = input<AttributionLike>();
  readonly wolUrl = input<string>();
  readonly wolCrossOrigin = input<null | string>();
  readonly wolDisplayDpi = input<number>();
  readonly wolMetersPerUnit = input<number>();
  readonly wolHidpi = input<boolean>();
  readonly wolUseOverlay = input<boolean>();
  readonly wolProjection = input<ProjectionLike>();
  readonly wolRatio = input<number>();
  readonly wolResolutions = input<number[]>();
  readonly wolImageLoadFunction = input<LoadFunction>();
  readonly wolInterpolate = input<boolean>();
  readonly wolParams = input<{ [key: string]: WolSafeAny }>();
  readonly wolProperties = input<WolProperties>();

  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
  readonly wolImageLoadEnd = output<ImageSourceEvent>();
  readonly wolImageLoadError = output<ImageSourceEvent>();
  readonly wolImageLoadStart = output<ImageSourceEvent>();
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
        unByKey(Object.values(eventsKey));
        disposeRef && disposeRef();
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
   * Get the OpenLayers ImageMapGuide source instance.
   * @returns The OpenLayers ImageMapGuide source instance or undefined if not yet created.
   */
  getInstance(): ImageMapGuide | undefined {
    return this.instance;
  }
}
