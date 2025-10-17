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
import { WolSafeAny } from '@workletjs/ngx-openlayers/core/types';
import { useImageSourceHostRef } from '@workletjs/ngx-openlayers/source/image';
import { LoadFunction } from 'ol/Image';
import { ObjectEvent } from 'ol/Object';
import { ProjectionLike } from 'ol/proj';
import { ImageSourceEvent } from 'ol/source/Image';
import { AttributionLike } from 'ol/source/Source';
import { EventsKey } from 'ol/events';
import { unByKey } from 'ol/Observable';
import BaseEvent from 'ol/events/Event';
import ImageArcGISRest from 'ol/source/ImageArcGISRest';

@Component({
  selector: 'wol-image-arcgis-reset-source',
  imports: [],
  template: `<ng-content />`,
  styles: ``,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolImageArcGISResetSourceComponent implements OnChanges {
  readonly wolAttributions = input<AttributionLike>();
  readonly wolCrossOrigin = input<null | string>();
  readonly wolHidpi = input<boolean>();
  readonly wolImageLoadFunction = input<LoadFunction>();
  readonly wolInterpolate = input<boolean>();
  readonly wolParams = input<{ [key: string]: WolSafeAny }>();
  readonly wolProjection = input<ProjectionLike>();
  readonly wolRatio = input<number>();
  readonly wolResolutions = input<number[]>();
  readonly wolUrl = input<string>();

  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
  readonly wolImageLoadError = output<ImageSourceEvent>();
  readonly wolImageLoadStart = output<ImageSourceEvent>();
  readonly wolImageLoadEnd = output<ImageSourceEvent>();
  readonly wolPropertyChange = output<ObjectEvent>();

  private instance?: ImageArcGISRest;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const host = useImageSourceHostRef<ImageArcGISRest>('ImageArcGISRest');
    const eventsKey: Record<string, EventsKey> = {};

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
        host.setSource(imageSource);
      });
      
      this.instance = imageSource;
    });

    destroyRef.onDestroy(() => {
      if (this.instance) {
        unByKey(Object.values(eventsKey));
        host.setSource(null);
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
   * Get the underlying OpenLayers instance.
   * @returns The OpenLayers ImageArcGISRest instance
   */
  getInstance(): ImageArcGISRest | undefined {
    return this.instance;
  }
}
