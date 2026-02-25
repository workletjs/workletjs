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

import { ObjectEvent } from 'ol/Object';
import { unByKey } from 'ol/Observable';
import { LoadFunction } from 'ol/Tile';
import { NearestDirectionFunction } from 'ol/array';
import { EventsKey } from 'ol/events';
import BaseEvent from 'ol/events/Event';
import Google from 'ol/source/Google';
import { AttributionLike } from 'ol/source/Source';
import { TileSourceEvent } from 'ol/source/Tile';

import { WolProperties, WolSafeAny } from '@workletjs/ngx-openlayers/core/types';
import { DisposeRef, useTileSourceHostRef } from '@workletjs/ngx-openlayers/source/tile';

@Component({
  selector: 'wol-google-source',
  exportAs: 'wolGoogleSource',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolGoogleSourceComponent implements OnChanges {
  readonly wolAttributions = input<AttributionLike>();
  readonly wolAttributionsCollapsible = input<boolean>();
  readonly wolKey = input.required<string>();
  readonly wolMapType = input<string>();
  readonly wolLanguage = input<string>();
  readonly wolRegion = input<string>();
  readonly wolImageFormat = input<string>();
  readonly wolScale = input<string>();
  readonly wolHighDpi = input<boolean>();
  readonly wolLayerTypes = input<string[]>();
  readonly wolOverlay = input<boolean>();
  readonly wolStyles = input<Record<string, WolSafeAny>[]>();
  readonly wolInterpolate = input<boolean>();
  readonly wolCacheSize = input<number>();
  readonly wolReprojectionErrorThreshold = input<number>();
  readonly wolTileLoadFunction = input<LoadFunction>();
  readonly wolApiOptions = input<string[]>();
  readonly wolWrapX = input<boolean>();
  readonly wolTransition = input<number>();
  readonly wolZDirection = input<number | NearestDirectionFunction>();
  readonly wolProperties = input<WolProperties>();

  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
  readonly wolPropertyChange = output<ObjectEvent>();
  readonly wolTileLoadEnd = output<TileSourceEvent>();
  readonly wolTileLoadError = output<TileSourceEvent>();
  readonly wolTileLoadStart = output<TileSourceEvent>();

  private instance?: Google;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useTileSourceHostRef<Google>('Google');
    const eventsKey: Record<string, EventsKey> = {};

    let disposeRef: DisposeRef;

    afterNextRender(() => {
      const google = new Google({
        key: this.wolKey(),
        mapType: this.wolMapType(),
        language: this.wolLanguage(),
        region: this.wolRegion(),
        imageFormat: this.wolImageFormat(),
        scale: this.wolScale(),
        highDpi: this.wolHighDpi(),
        layerTypes: this.wolLayerTypes(),
        overlay: this.wolOverlay(),
        styles: this.wolStyles(),
        attributionsCollapsible: this.wolAttributionsCollapsible(),
        interpolate: this.wolInterpolate(),
        cacheSize: this.wolCacheSize(),
        reprojectionErrorThreshold: this.wolReprojectionErrorThreshold(),
        tileLoadFunction: this.wolTileLoadFunction(),
        apiOptions: this.wolApiOptions(),
        wrapX: this.wolWrapX(),
        transition: this.wolTransition(),
        zDirection: this.wolZDirection(),
      });

      if (this.wolAttributions()) {
        google.setAttributions(this.wolAttributions());
      }

      if (this.wolProperties()) {
        google.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKey['change'] = google.on('change', (evt) => this.wolChange.emit(evt));

      eventsKey['error'] = google.on('error', (evt) => this.wolError.emit(evt));

      eventsKey['propertychange'] = google.on('propertychange', (evt) =>
        this.wolPropertyChange.emit(evt),
      );

      eventsKey['tileloadend'] = google.on('tileloadend', (evt) => this.wolTileLoadEnd.emit(evt));

      eventsKey['tileloaderror'] = google.on('tileloaderror', (evt) =>
        this.wolTileLoadError.emit(evt),
      );

      eventsKey['tileloadstart'] = google.on('tileloadstart', (evt) =>
        this.wolTileLoadStart.emit(evt),
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
        disposeRef = hostRef.setSource(google);
      });

      this.instance = google;
    });

    destroyRef.onDestroy(() => {
      unByKey(Object.values(eventsKey));

      if (disposeRef) {
        disposeRef();
      }

      this.instance = undefined;
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
          this.instance.setProperties(change.currentValue ?? {});
          break;
        case 'wolTileLoadFunction':
          this.instance.setTileLoadFunction(change.currentValue);
          break;
      }
    }
  }

  /**
   * Get the underlying OpenLayers Google instance.
   * @returns The Google instance
   */
  getInstance(): Google | undefined {
    return this.instance;
  }
}
