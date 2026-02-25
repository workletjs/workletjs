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
import BingMaps from 'ol/source/BingMaps';
import { AttributionLike } from 'ol/source/Source';
import { TileSourceEvent } from 'ol/source/Tile';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { DisposeRef, useTileSourceHostRef } from '@workletjs/ngx-openlayers/source/tile';

@Component({
  selector: 'wol-bing-maps-source',
  exportAs: 'wolBingMapsSource',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolBingMapsSourceComponent implements OnChanges {
  readonly wolAttributions = input<AttributionLike>();
  readonly wolCacheSize = input<number>();
  readonly wolHidpi = input<boolean>();
  readonly wolCulture = input<string>();
  readonly wolKey = input.required<string>();
  readonly wolImagerySet = input.required<string>();
  readonly wolInterpolate = input<boolean>();
  readonly wolMaxZoom = input<number>();
  readonly wolReprojectionErrorThreshold = input<number>();
  readonly wolTileLoadFunction = input<LoadFunction>();
  readonly wolWrapX = input<boolean>();
  readonly wolTransition = input<number>();
  readonly wolZDirection = input<number | NearestDirectionFunction>();
  readonly wolPlaceholderTiles = input<boolean>();
  readonly wolProperties = input<WolProperties>();

  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
  readonly wolPropertyChange = output<ObjectEvent>();
  readonly wolTileLoadEnd = output<TileSourceEvent>();
  readonly wolTileLoadError = output<TileSourceEvent>();
  readonly wolTileLoadStart = output<TileSourceEvent>();

  private instance?: BingMaps;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useTileSourceHostRef<BingMaps>('BingMaps');
    const eventsKey: Record<string, EventsKey> = {};

    let disposeRef: DisposeRef;

    afterNextRender(() => {
      const bingMaps = new BingMaps({
        cacheSize: this.wolCacheSize(),
        hidpi: this.wolHidpi(),
        culture: this.wolCulture(),
        key: this.wolKey(),
        imagerySet: this.wolImagerySet(),
        interpolate: this.wolInterpolate(),
        maxZoom: this.wolMaxZoom(),
        reprojectionErrorThreshold: this.wolReprojectionErrorThreshold(),
        tileLoadFunction: this.wolTileLoadFunction(),
        wrapX: this.wolWrapX(),
        transition: this.wolTransition(),
        zDirection: this.wolZDirection(),
        placeholderTiles: this.wolPlaceholderTiles(),
      });

      if (this.wolAttributions()) {
        bingMaps.setAttributions(this.wolAttributions());
      }

      if (this.wolProperties()) {
        bingMaps.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKey['change'] = bingMaps.on('change', (event) => this.wolChange.emit(event));

      eventsKey['error'] = bingMaps.on('error', (event) => this.wolError.emit(event));

      eventsKey['propertychange'] = bingMaps.on('propertychange', (event) =>
        this.wolPropertyChange.emit(event),
      );

      eventsKey['tileloadend'] = bingMaps.on('tileloadend', (event) =>
        this.wolTileLoadEnd.emit(event),
      );

      eventsKey['tileloaderror'] = bingMaps.on('tileloaderror', (event) =>
        this.wolTileLoadError.emit(event),
      );

      eventsKey['tileloadstart'] = bingMaps.on('tileloadstart', (event) =>
        this.wolTileLoadStart.emit(event),
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
        disposeRef = hostRef.setSource(bingMaps);
      });

      this.instance = bingMaps;
    });

    destroyRef.onDestroy(() => {
      if (disposeRef) {
        disposeRef();
      }

      unByKey(Object.values(eventsKey));

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
   * Get the underlying OpenLayers BingMaps instance.
   * @returns The BingMaps instance
   */
  getInstance(): BingMaps | undefined {
    return this.instance;
  }
}
