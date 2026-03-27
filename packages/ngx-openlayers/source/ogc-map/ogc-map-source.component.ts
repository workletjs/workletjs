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
  readonly wolAttributions = input<AttributionLike>();
  readonly wolCrossOrigin = input<null | string>();
  readonly wolReferrerPolicy = input<ReferrerPolicy>();
  readonly wolHidpi = input<boolean>();
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
  readonly wolImageLoadError = output<ImageSourceEvent>();
  readonly wolImageLoadStart = output<ImageSourceEvent>();
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
