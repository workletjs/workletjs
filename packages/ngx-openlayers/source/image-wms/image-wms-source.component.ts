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
import { useImageSourceHostRef } from '@workletjs/ngx-openlayers/source/image';
import { LoadFunction } from 'ol/Image';
import { ProjectionLike } from 'ol/proj';
import { ImageSourceEvent } from 'ol/source/Image';
import { AttributionLike } from 'ol/source/Source';
import { ServerType } from 'ol/source/wms';
import { EventsKey } from 'ol/events';
import { unByKey } from 'ol/Observable';
import BaseEvent from 'ol/events/Event';
import ImageWMS from 'ol/source/ImageWMS';

@Component({
  selector: 'wol-image-wms-source',
  imports: [],
  template: `<ng-content />`,
  styles: ``,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolImageWMSSourceComponent implements OnChanges {
  readonly wolAttributions = input<AttributionLike>();
  readonly wolCrossOrigin = input<null | string>();
  readonly wolHidpi = input<boolean>();
  readonly wolServerType = input<ServerType>();
  readonly wolImageLoadFunction = input<LoadFunction>();
  readonly wolInterpolate = input<boolean>();
  readonly wolParams = input<{ [key: string]: WolSafeAny }>();
  readonly wolProjection = input<ProjectionLike>();
  readonly wolRatio = input<number>();
  readonly wolResolutions = input<number[]>();
  readonly wolUrl = input<string>();
  readonly wolProperties = input<WolProperties>();

  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
  readonly wolImageLoadEnd = output<ImageSourceEvent>();
  readonly WolImageLoadError = output<ImageSourceEvent>();
  readonly wolImageLoadStart = output<ImageSourceEvent>();
  readonly wolPropertyChange = output<BaseEvent>();

  private instance?: ImageWMS;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const host = useImageSourceHostRef<ImageWMS>('ImageWMS');
    const eventsKey: Record<string, EventsKey> = {};

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
        this.WolImageLoadError.emit(evt),
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
        host.setSource(imageWMS);
      });
      
      this.instance = imageWMS;
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
   * Get the OpenLayers ImageWMS instance.
   * @returns The OpenLayers ImageWMS instance or undefined if not yet created.
   */
  getInstance(): ImageWMS | undefined {
    return this.instance;
  }
}
