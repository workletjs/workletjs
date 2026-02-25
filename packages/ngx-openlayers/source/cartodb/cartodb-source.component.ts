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
import { NearestDirectionFunction } from 'ol/array';
import { EventsKey } from 'ol/events';
import BaseEvent from 'ol/events/Event';
import { ProjectionLike } from 'ol/proj';
import CartoDB from 'ol/source/CartoDB';
import { AttributionLike } from 'ol/source/Source';
import { TileSourceEvent } from 'ol/source/Tile';

import { WolProperties, WolSafeAny } from '@workletjs/ngx-openlayers/core/types';
import { DisposeRef, useTileSourceHostRef } from '@workletjs/ngx-openlayers/source/tile';

@Component({
  selector: 'wol-carto-db-source',
  exportAs: 'wolCartoDBSource',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolCartoDBSourceComponent implements OnChanges {
  readonly wolAttributions = input<AttributionLike>();
  readonly wolCacheSize = input<number>();
  readonly wolCrossOrigin = input<string | null>();
  readonly wolProjection = input<ProjectionLike>();
  readonly wolMaxZoom = input<number>();
  readonly wolMinZoom = input<number>();
  readonly wolWrapX = input<boolean>();
  readonly wolConfig = input<Record<string, WolSafeAny>>();
  readonly wolMap = input<string>();
  readonly wolAccount = input<string>();
  readonly wolTransition = input<number>();
  readonly wolZDirection = input<number | NearestDirectionFunction>();
  readonly wolProperties = input<WolProperties>();

  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
  readonly wolPropertyChange = output<ObjectEvent>();
  readonly wolTileLoadEnd = output<TileSourceEvent>();
  readonly wolTileLoadError = output<TileSourceEvent>();
  readonly wolTileLoadStart = output<TileSourceEvent>();

  private instance?: CartoDB;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useTileSourceHostRef<CartoDB>('CartoDB');
    const eventsKey: Record<string, EventsKey> = {};

    let disposeRef: DisposeRef;

    afterNextRender(() => {
      const cartoDB = new CartoDB({
        attributions: this.wolAttributions(),
        cacheSize: this.wolCacheSize(),
        crossOrigin: this.wolCrossOrigin(),
        projection: this.wolProjection(),
        maxZoom: this.wolMaxZoom(),
        minZoom: this.wolMinZoom(),
        wrapX: this.wolWrapX(),
        config: this.wolConfig(),
        map: this.wolMap(),
        account: this.wolAccount(),
        transition: this.wolTransition(),
        zDirection: this.wolZDirection(),
      });

      if (this.wolProperties()) {
        cartoDB.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKey['change'] = cartoDB.on('change', (evt) => this.wolChange.emit(evt));

      eventsKey['error'] = cartoDB.on('error', (evt) => this.wolError.emit(evt));

      eventsKey['propertychange'] = cartoDB.on('propertychange', (evt) =>
        this.wolPropertyChange.emit(evt),
      );

      eventsKey['tileloadend'] = cartoDB.on('tileloadend', (evt) => this.wolTileLoadEnd.emit(evt));

      eventsKey['tileloaderror'] = cartoDB.on('tileloaderror', (evt) =>
        this.wolTileLoadError.emit(evt),
      );

      eventsKey['tileloadstart'] = cartoDB.on('tileloadstart', (evt) =>
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
        disposeRef = hostRef.setSource(cartoDB);
      });

      this.instance = cartoDB;
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
        case 'wolConfig':
          this.instance.setConfig(change.currentValue);
          break;
        case 'wolProperties':
          this.instance.setProperties(change.currentValue ?? {});
          break;
      }
    }
  }

  /**
   * Get the OpenLayers CartoDB instance.
   * @returns The OpenLayers CartoDB instance or undefined if not yet created.
   */
  getInstance(): CartoDB | undefined {
    return this.instance;
  }
}
