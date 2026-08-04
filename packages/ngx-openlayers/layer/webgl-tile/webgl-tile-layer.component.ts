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
import WebGLTileLayer, { SourceType, Style } from 'ol/layer/WebGLTile';
import RenderEvent from 'ol/render/Event';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { useLayerHostRef } from '@workletjs/ngx-openlayers/layer/layer';

/**
 * Wraps an OpenLayers [WebGLTileLayer](https://openlayers.org/en/latest/apidoc/module-ol_layer_WebGLTile-WebGLTileLayer.html),
 * which renders tiled raster data with WebGL styling support.
 *
 * @example
 * ```html
 * <wol-map>
 *   <wol-webgl-tile-layer [wolSource]="source"></wol-webgl-tile-layer>
 * </wol-map>
 * ```
 *
 * @see https://openlayers.org/en/latest/apidoc/module-ol_layer_WebGLTile-WebGLTileLayer.html
 */
@Component({
  selector: 'wol-webgl-tile-layer',
  imports: [],
  template: `<ng-content />`,
  styles: ``,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolWebGLTileLayerComponent implements OnChanges {
  /**
   * WebGL style definition for this layer.
   */
  readonly wolStyle = input<Style>();

  /**
   * Variables used by the layer style.
   */
  readonly wolVariables = input<Record<string, number>>();

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
   * Primary source used by this layer.
   */
  readonly wolSource = model<SourceType>();

  /**
   * Multi-source factory for dynamic source selection per extent/resolution.
   */
  readonly wolSources = input<
    SourceType[] | ((extent: Extent, resolution: number) => SourceType[])
  >();

  /**
   * Sets the layer as an overlay rendered on top of all other layers on a map. The map will not
   * manage this layer in its layers collection. Use `map.addLayer()` for managed layers.
   */
  readonly wolMap = input<Map>();

  /**
   * Whether interim tiles are used when a tile load error occurs.
   */
  readonly wolUseInterimTilesOnError = model<boolean>();

  /**
   * The internal texture cache size. Must be large enough to render two zoom levels of tiles.
   */
  readonly wolCacheSize = input<number>();

  /**
   * Additional properties that will be set to the layer instance.
   */
  readonly wolProperties = input<WolProperties>();

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

  private instance?: WebGLTileLayer;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useLayerHostRef<WebGLTileLayer>('WebGLTileLayer');
    const eventsKey: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const webglTileLayer = new WebGLTileLayer({
        style: this.wolStyle(),
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
        sources: this.wolSources(),
        map: this.wolMap(),
        useInterimTilesOnError: this.wolUseInterimTilesOnError(),
        cacheSize: this.wolCacheSize(),
        properties: this.wolProperties(),
      });

      if (this.wolVariables()) {
        webglTileLayer.updateStyleVariables(this.wolVariables() ?? {});
      }

      eventsKey['change'] = webglTileLayer.on('change', (evt) => this.wolChange.emit(evt));

      eventsKey['change:extent'] = webglTileLayer.on('change:extent', () =>
        this.wolExtent.set(webglTileLayer.getExtent()),
      );

      eventsKey['change:maxResolution'] = webglTileLayer.on('change:maxResolution', () =>
        this.wolMaxResolution.set(webglTileLayer.getMaxResolution()),
      );

      eventsKey['change:maxZoom'] = webglTileLayer.on('change:maxZoom', () =>
        this.wolMaxZoom.set(webglTileLayer.getMaxZoom()),
      );

      eventsKey['change:minResolution'] = webglTileLayer.on('change:minResolution', () =>
        this.wolMinResolution.set(webglTileLayer.getMinResolution()),
      );

      eventsKey['change:minZoom'] = webglTileLayer.on('change:minZoom', () =>
        this.wolMinZoom.set(webglTileLayer.getMinZoom()),
      );

      eventsKey['change:opacity'] = webglTileLayer.on('change:opacity', () =>
        this.wolOpacity.set(webglTileLayer.getOpacity()),
      );

      eventsKey['change:preload'] = webglTileLayer.on('change:preload', () =>
        this.wolPreload.set(webglTileLayer.getPreload()),
      );

      eventsKey['change:source'] = webglTileLayer.on('change:source', () =>
        this.wolSource.set(webglTileLayer.getSource() ?? undefined),
      );

      eventsKey['change:useInterimTilesOnError'] = webglTileLayer.on(
        'change:useInterimTilesOnError',
        () => this.wolUseInterimTilesOnError.set(webglTileLayer.getUseInterimTilesOnError()),
      );

      eventsKey['change:visible'] = webglTileLayer.on('change:visible', () =>
        this.wolVisible.set(webglTileLayer.getVisible()),
      );

      eventsKey['change:zIndex'] = webglTileLayer.on('change:zIndex', () =>
        this.wolZIndex.set(webglTileLayer.getZIndex()),
      );

      eventsKey['error'] = webglTileLayer.on('error', (evt) => this.wolError.emit(evt));

      eventsKey['postrender'] = webglTileLayer.on('postrender', (evt) =>
        this.wolPostRender.emit(evt),
      );

      eventsKey['prerender'] = webglTileLayer.on('prerender', (evt) => this.wolPreRender.emit(evt));

      eventsKey['propertychange'] = webglTileLayer.on('propertychange', (evt) =>
        this.wolPropertyChange.emit(evt),
      );

      eventsKey['sourceready'] = webglTileLayer.on('sourceready', (evt) =>
        this.wolSourceReady.emit(evt),
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
        hostRef.addLayer(webglTileLayer);
      });

      this.instance = webglTileLayer;
    });

    destroyRef.onDestroy(() => {
      if (this.instance) {
        unByKey(Object.values(eventsKey));
        hostRef.removeLayer(this.instance);
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
          this.instance.setMap(change.currentValue);
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
        case 'wolVariables':
          this.instance.updateStyleVariables(change.currentValue ?? {});
          break;
      }
    }
  }

  /**
   * Get the underlying WebGLTileLayer instance.
   * @returns The WebGLTileLayer instance or `undefined` if not yet created.
   */
  getInstance(): WebGLTileLayer | undefined {
    return this.instance;
  }
}
