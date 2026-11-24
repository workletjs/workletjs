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

/**
 * Provides raster tiles from an anonymous CartoDB map definition or a named map template.
 *
 * See the [OpenLayers CartoDB reference](https://openlayers.org/en/latest/apidoc/module-ol_source_CartoDB-CartoDB.html).
 */
@Component({
  selector: 'wol-carto-db-source',
  exportAs: 'wolCartoDBSource',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolCartoDBSourceComponent implements OnChanges {
  /** Source credits shown by the attribution control. Changes update the existing source. */
  readonly wolAttributions = input<AttributionLike>();
  /**
   * Legacy tile cache option supplied at source creation for compatibility.
   * OpenLayers 10.11.0 manages the cache on the rendering layer.
   *
   * @deprecated Configure `wolCacheSize` on a compatible layer.
   */
  readonly wolCacheSize = input<number>();
  /**
   * Cross-origin mode for image requests. Reading pixels from a cross-origin image on a canvas also
   * requires the corresponding server CORS headers. Read at source creation.
   */
  readonly wolCrossOrigin = input<string | null>();
  /**
   * Projection used for the CartoDB tile grid. Defaults to `'EPSG:3857'`. Read at source creation.
   */
  readonly wolProjection = input<ProjectionLike>();
  /** Maximum tile zoom level. Defaults to `18`. Read at source creation. */
  readonly wolMaxZoom = input<number>();
  /** Minimum tile zoom level. Defaults to `0`. Read at source creation. */
  readonly wolMinZoom = input<number>();
  /**
   * Whether tiles wrap horizontally beyond the antimeridian. Defaults to `true`. Read at source
   * creation.
   */
  readonly wolWrapX = input<boolean>();
  /**
   * Map definition for anonymous maps or template parameters for named maps. Updating this binding
   * replaces the configuration and reinitializes the map.
   */
  readonly wolConfig = input<Record<string, WolSafeAny>>();
  /** Template name when requesting a named CartoDB map. Read at source creation. */
  readonly wolMap = input<string>();
  /** CartoDB username used in the service hostname. Read at source creation. */
  readonly wolAccount = input<string>();
  /**
   * Tile fade-in duration in milliseconds. Defaults to `250`. Set to `0` to disable the fade. Read
   * at source creation.
   */
  readonly wolTransition = input<number>();
  /**
   * Chooses the tile zoom at intermediate view resolutions. Defaults to `0` for the nearest level.
   * Use `1` to favor the coarser level, `-1` for the finer level, or provide a function. Read at
   * source creation.
   */
  readonly wolZDirection = input<number | NearestDirectionFunction>();
  /**
   * Additional OpenLayers source properties. Binding changes add or update keys on the existing
   * source.
   */
  readonly wolProperties = input<WolProperties>();

  /**
   * Emits when the source changes. Check the source state to detect successful or failed CartoDB
   * map initialization.
   */
  readonly wolChange = output<BaseEvent>();
  /** Forwards the OpenLayers source's `error` event. */
  readonly wolError = output<BaseEvent>();
  /** Emits a `propertychange` event with the changed property name and its previous value. */
  readonly wolPropertyChange = output<ObjectEvent>();
  /** Emits when a source tile finishes loading. The event identifies the tile. */
  readonly wolTileLoadEnd = output<TileSourceEvent>();
  /** Emits when a source tile fails to load. The event identifies the tile. */
  readonly wolTileLoadError = output<TileSourceEvent>();
  /** Emits when a source tile starts loading. The event identifies the tile. */
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
   * Gets the OpenLayers source created by this component.
   *
   * @returns The OpenLayers `CartoDB` instance, or `undefined` before creation and after
   * destruction.
   */
  getInstance(): CartoDB | undefined {
    return this.instance;
  }
}
