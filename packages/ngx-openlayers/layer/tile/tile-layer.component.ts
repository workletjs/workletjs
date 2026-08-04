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
  model,
  output,
} from '@angular/core';

import Map from 'ol/Map';
import { ObjectEvent } from 'ol/Object';
import { unByKey } from 'ol/Observable';
import { EventsKey } from 'ol/events';
import BaseEvent from 'ol/events/Event';
import { Extent } from 'ol/extent';
import { BackgroundColor } from 'ol/layer/Base';
import TileLayer from 'ol/layer/Tile';
import RenderEvent from 'ol/render/Event';
import TileSource from 'ol/source/Tile';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { useLayerHostRef } from '@workletjs/ngx-openlayers/layer/layer';

/**
 * Wraps an OpenLayers [TileLayer](https://openlayers.org/en/latest/apidoc/module-ol_layer_Tile-TileLayer.html),
 * used for tiled raster sources.
 *
 * @example
 * ```html
 * <wol-map>
 *   <wol-tile-layer [wolSource]="source"></wol-tile-layer>
 * </wol-map>
 * ```
 *
 * @see https://openlayers.org/en/latest/apidoc/module-ol_layer_Tile-TileLayer.html
 */
@Component({
  selector: 'wol-tile-layer',
  imports: [],
  template: `<ng-content />`,
  styles: ``,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolTileLayerComponent implements OnChanges {
  /**
   * A CSS class name to set to the layer element. Defaults to `'ol-layer'`.
   */
  readonly wolClassName = input<string>();

  /**
   * Opacity of the layer, between `0` and `1`. Defaults to `1`.
   */
  readonly wolOpacity = model<number>();

  /**
   * Visibility of the layer. Defaults to `true`.
   */
  readonly wolVisible = model<boolean>();

  /**
   * The bounding extent for layer rendering. The layer will not be rendered outside of this
   * extent.
   */
  readonly wolExtent = model<Extent>();

  /**
   * The z-index for layer rendering. Layers are ordered first by z-index, then by position. When
   * undefined, a z-index of `0` is assumed for layers added to the map's layers collection, or
   * `Infinity` when `setMap()` was used.
   */
  readonly wolZIndex = model<number>();

  /**
   * The minimum resolution (inclusive) at which this layer will be visible.
   */
  readonly wolMinResolution = model<number>();

  /**
   * The maximum resolution (exclusive) below which this layer will be visible.
   */
  readonly wolMaxResolution = model<number>();

  /**
   * The minimum view zoom level (exclusive) above which this layer will be visible.
   */
  readonly wolMinZoom = model<number>();

  /**
   * The maximum view zoom level (inclusive) at which this layer will be visible.
   */
  readonly wolMaxZoom = model<number>();

  /**
   * Preload level for low-resolution tiles. `0` disables preloading.
   */
  readonly wolPreload = model<number>();

  /**
   * Tile source for this layer.
   */
  readonly wolSource = model<TileSource>();

  /**
   * Sets the layer as an overlay rendered on top of all other layers on a map. The map will not
   * manage this layer in its layers collection. Use `map.addLayer()` for managed layers.
   */
  readonly wolMap = input<Map>();

  /**
   * Background color for the layer. No background will be rendered when not specified.
   */
  readonly wolBackground = input<BackgroundColor>();

  /**
   * Whether interim tiles are used when a tile load error occurs.
   */
  readonly wolUseInterimTilesOnError = model<boolean>();

  /**
   * Additional properties that will be set to the layer instance.
   */
  readonly wolProperties = input<WolProperties>();

  /**
   * The internal texture cache size. Must be large enough to render two zoom levels of tiles.
   */
  readonly wolCacheSize = input<number>();

  /**
   * Generic change event. Triggered when the revision counter is increased.
   */
  readonly wolChange = output<BaseEvent>();

  /**
   * Generic error event. Triggered when an error occurs.
   */
  readonly wolError = output<BaseEvent>();

  /**
   * Triggered after the layer is rendered.
   */
  readonly wolPostRender = output<RenderEvent>();

  /**
   * Triggered before the layer is rendered.
   */
  readonly wolPreRender = output<RenderEvent>();

  /**
   * Triggered when a property of the layer is changed.
   */
  readonly wolPropertyChange = output<ObjectEvent>();

  /**
   * Triggered when the layer source is ready.
   */
  readonly wolSourceReady = output<BaseEvent>();

  private instance?: TileLayer;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const host = useLayerHostRef<TileLayer>('TileLayer');
    const eventsKey: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const tileLayer = new TileLayer({
        className: this.wolClassName(),
        opacity: this.wolOpacity(),
        visible: this.wolVisible(),
        extent: this.wolExtent(),
        zIndex: this.wolZIndex(),
        minResolution: this.wolMinResolution(),
        maxResolution: this.wolMaxResolution(),
        minZoom: this.wolMinZoom(),
        maxZoom: this.wolMaxZoom(),
        preload: this.wolPreload(),
        source: this.wolSource(),
        map: this.wolMap(),
        background: this.wolBackground(),
        useInterimTilesOnError: this.wolUseInterimTilesOnError(),
        properties: this.wolProperties(),
        cacheSize: this.wolCacheSize(),
      });

      eventsKey['change'] = tileLayer.on('change', (event) => this.wolChange.emit(event));

      eventsKey['change:extent'] = tileLayer.on('change:extent', () =>
        this.wolExtent.set(tileLayer.getExtent()),
      );

      eventsKey['change:maxResolution'] = tileLayer.on('change:maxResolution', () =>
        this.wolMaxResolution.set(tileLayer.getMaxResolution()),
      );

      eventsKey['change:maxZoom'] = tileLayer.on('change:maxZoom', () =>
        this.wolMaxZoom.set(tileLayer.getMaxZoom()),
      );

      eventsKey['change:minResolution'] = tileLayer.on('change:minResolution', () =>
        this.wolMinResolution.set(tileLayer.getMinResolution()),
      );

      eventsKey['change:minZoom'] = tileLayer.on('change:minZoom', () =>
        this.wolMinZoom.set(tileLayer.getMinZoom()),
      );

      eventsKey['change:opacity'] = tileLayer.on('change:opacity', () =>
        this.wolOpacity.set(tileLayer.getOpacity()),
      );

      eventsKey['change:preload'] = tileLayer.on('change:preload', () =>
        this.wolPreload.set(tileLayer.getPreload()),
      );

      eventsKey['change:source'] = tileLayer.on('change:source', () =>
        this.wolSource.set(tileLayer.getSource() ?? undefined),
      );

      eventsKey['change:useInterimTilesOnError'] = tileLayer.on(
        'change:useInterimTilesOnError',
        () => this.wolUseInterimTilesOnError.set(tileLayer.getUseInterimTilesOnError()),
      );

      eventsKey['change:visible'] = tileLayer.on('change:visible', () =>
        this.wolVisible.set(tileLayer.getVisible()),
      );

      eventsKey['change:zIndex'] = tileLayer.on('change:zIndex', () =>
        this.wolZIndex.set(tileLayer.getZIndex()),
      );

      eventsKey['error'] = tileLayer.on('error', (event) => this.wolError.emit(event));

      eventsKey['postrender'] = tileLayer.on('postrender', (event) =>
        this.wolPostRender.emit(event),
      );

      eventsKey['prerender'] = tileLayer.on('prerender', (event) => this.wolPreRender.emit(event));

      eventsKey['propertychange'] = tileLayer.on('propertychange', (event) =>
        this.wolPropertyChange.emit(event),
      );

      eventsKey['sourceready'] = tileLayer.on('sourceready', (event) =>
        this.wolSourceReady.emit(event),
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
        host.addLayer(tileLayer);
      });

      this.instance = tileLayer;
    });

    destroyRef.onDestroy(() => {
      if (this.instance) {
        unByKey(Object.values(eventsKey));
        host.removeLayer(this.instance);
        this.instance = undefined;
      }
    });
  }

  /**
   * Respond to input changes.
   * @param changes The changes object containing the changed inputs.
   * @internal
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (!this.instance) {
      return;
    }

    for (const [key, change] of Object.entries(changes)) {
      switch (key) {
        case 'wolExtent':
          this.instance.setExtent(change.currentValue);
          break;
        case 'wolMap':
          this.instance.setMap(change.currentValue ?? null);
          break;
        case 'wolMaxResolution':
          this.instance.setMaxResolution(change.currentValue);
          break;
        case 'wolMaxZoom':
          this.instance.setMaxZoom(change.currentValue);
          break;
        case 'wolMinResolution':
          this.instance.setMinResolution(change.currentValue);
          break;
        case 'wolMinZoom':
          this.instance.setMinZoom(change.currentValue);
          break;
        case 'wolOpacity':
          this.instance.setOpacity(change.currentValue);
          break;
        case 'wolPreload':
          this.instance.setPreload(change.currentValue);
          break;
        case 'wolProperties':
          this.instance.setProperties(change.currentValue);
          break;
        case 'wolSource':
          this.instance.setSource(change.currentValue);
          break;
        case 'wolUseInterimTilesOnError':
          this.instance.setUseInterimTilesOnError(change.currentValue);
          break;
        case 'wolVisible':
          this.instance.setVisible(change.currentValue);
          break;
        case 'wolZIndex':
          this.instance.setZIndex(change.currentValue);
          break;
      }
    }
  }

  /**
   * Get the underlying OpenLayers TileLayer instance.
   * @returns The TileLayer instance or `undefined` if not yet created.
   */
  getInstance(): TileLayer | undefined {
    return this.instance;
  }
}
