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

@Component({
  selector: 'wol-image-static-source',
  imports: [],
  template: `<ng-content />`,
  styles: ``,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolImageStaticSourceComponent implements OnChanges {
  readonly wolAttributions = input<AttributionLike>();
  readonly wolCrossOrigin = input<null | string>();
  readonly wolImageExtent = input.required<Extent>();
  readonly wolImageLoadFunction = input<LoadFunction>();
  readonly wolInterpolate = input<boolean>();
  readonly wolProjection = input<ProjectionLike>();
  readonly wolUrl = input.required<string>();
  readonly wolReferrerPolicy = input<ReferrerPolicy>();
  readonly wolProperties = input<WolProperties>();

  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
  readonly wolImageLoadEnd = output<ImageSourceEvent>();
  readonly wolImageLoadError = output<ImageSourceEvent>();
  readonly wolImageLoadStart = output<ImageSourceEvent>();
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
   * Get the underlying OpenLayers Static instance.
   * @returns The OpenLayers Static instance (or `undefined` if not yet initialized)
   */
  getInstance(): Static | undefined {
    return this.instance;
  }
}
