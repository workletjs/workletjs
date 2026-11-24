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
import VectorTileLayer, { VectorTileRenderType } from 'ol/layer/VectorTile';
import { OrderFunction } from 'ol/render';
import RenderEvent from 'ol/render/Event';
import VectorTileSource from 'ol/source/VectorTile';
import { StyleLike } from 'ol/style/Style';
import { FlatStyleLike } from 'ol/style/flat';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { useLayerHostRef } from '@workletjs/ngx-openlayers/layer/layer';

/**
 * Wraps an OpenLayers [VectorTileLayer](https://openlayers.org/en/latest/apidoc/module-ol_layer_VectorTile-VectorTileLayer.html),
 * used for rendering tiled vector data.
 *
 * @example
 * ```html
 * <wol-map>
 *   <wol-vector-tile-layer [wolSource]="source"></wol-vector-tile-layer>
 * </wol-map>
 * ```
 *
 * @see https://openlayers.org/en/latest/apidoc/module-ol_layer_VectorTile-VectorTileLayer.html
 */
@Component({
  selector: 'wol-vector-tile-layer',
  exportAs: 'wolVectorTileLayer',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolVectorTileLayerComponent implements OnChanges {
  /**
   * A CSS class name to set to the layer element. Defaults to `'ol-layer'`.
   *
   * @remarks The component reads this option when creating the OpenLayers instance.
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
   * Function that sorts features before drawing. OpenLayers uses feature creation order by default.
   *
   * @remarks The component reads this option when creating the OpenLayers instance.
   */
  readonly wolRenderOrder = input<OrderFunction>();

  /**
   * Buffer in pixels around each tile extent used to select features for rendering and hit
   * detection. Defaults to `100`.
   *
   * @remarks The component reads this option when creating the OpenLayers instance.
   */
  readonly wolRenderBuffer = input<number>();

  /**
   * Defaults to `hybrid`, where lines and polygons are rendered as images and point symbols and
   * labels remain vectors. `vector` renders every feature as a vector and preserves drawing order.
   *
   * @remarks The component reads this option when creating the OpenLayers instance.
   */
  readonly wolRenderMode = input<VectorTileRenderType>();

  /**
   * Vector tile source for this layer.
   */
  readonly wolSource = model<VectorTileSource>();

  /**
   * Map to which OpenLayers also attaches the layer outside that map’s layer collection.
   *
   * @remarks The component still registers the layer with its host. Passing the host map to
   * `wolMap` as well triggers a duplicate registration assertion. For ordinary use, nest the
   * component in the map without setting `wolMap`.
   */
  readonly wolMap = input<Map>();

  /**
   * Declutter mode for text and image styles. Accepts a boolean or a declutter group key.
   */
  readonly wolDeclutter = input<boolean | string | number>();

  /**
   * Layer style. Set to `null` to render only features that have their own style.
   */
  readonly wolStyle = input<StyleLike | FlatStyleLike | null>();

  /**
   * Background color for the layer. No background will be rendered when not specified.
   */
  readonly wolBackground = input<BackgroundColor>();

  /**
   * Rebuilds feature batches during animations when `true`. This can reduce clipping at a
   * performance cost. Defaults to `false`.
   *
   * @remarks The component reads this option when creating the OpenLayers instance.
   */
  readonly wolUpdateWhileAnimating = input<boolean>();

  /**
   * Rebuilds feature batches while the user interacts with the map when `true`. Defaults to
   * `false`.
   *
   * @remarks The component reads this option when creating the OpenLayers instance.
   */
  readonly wolUpdateWhileInteracting = input<boolean>();

  /**
   * Preload level for low-resolution tiles. `0` disables preloading.
   */
  readonly wolPreload = model<number>();

  /**
   * Compatibility model for the native interim tile setting. Defaults to `true`.
   *
   * @deprecated The OpenLayers 10.11.0 renderer handles interim tiles independently of this setting.
   */
  readonly wolUseInterimTilesOnError = model<boolean>();

  /**
   * Additional properties that will be set to the layer instance.
   */
  readonly wolProperties = input<WolProperties>();

  /**
   * Internal tile cache size. Defaults to `0`. OpenLayers grows the cache when necessary to
   * accommodate two zoom levels of tiles.
   *
   * @remarks The component reads this option when creating the OpenLayers instance.
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

  private instance?: VectorTileLayer;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useLayerHostRef<VectorTileLayer>('VectorTileLayer');
    const eventsKey: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const vectorTileLayer = new VectorTileLayer({
        className: this.wolClassName(),
        opacity: this.wolOpacity(),
        visible: this.wolVisible(),
        extent: this.wolExtent(),
        zIndex: this.wolZIndex(),
        minResolution: this.wolMinResolution(),
        maxResolution: this.wolMaxResolution(),
        minZoom: this.wolMinZoom(),
        maxZoom: this.wolMaxZoom(),
        renderOrder: this.wolRenderOrder(),
        renderBuffer: this.wolRenderBuffer(),
        renderMode: this.wolRenderMode(),
        source: this.wolSource(),
        map: this.wolMap(),
        declutter: this.wolDeclutter(),
        style: this.wolStyle(),
        background: this.wolBackground(),
        updateWhileAnimating: this.wolUpdateWhileAnimating(),
        updateWhileInteracting: this.wolUpdateWhileInteracting(),
        preload: this.wolPreload(),
        useInterimTilesOnError: this.wolUseInterimTilesOnError(),
        properties: this.wolProperties(),
        cacheSize: this.wolCacheSize(),
      });

      eventsKey['change'] = vectorTileLayer.on('change', (event) => this.wolChange.emit(event));

      eventsKey['change:extent'] = vectorTileLayer.on('change:extent', () =>
        this.wolExtent.set(vectorTileLayer.getExtent()),
      );

      eventsKey['change:maxResolution'] = vectorTileLayer.on('change:maxResolution', () =>
        this.wolMaxResolution.set(vectorTileLayer.getMaxResolution()),
      );

      eventsKey['change:maxZoom'] = vectorTileLayer.on('change:maxZoom', () =>
        this.wolMaxZoom.set(vectorTileLayer.getMaxZoom()),
      );

      eventsKey['change:minResolution'] = vectorTileLayer.on('change:minResolution', () =>
        this.wolMinResolution.set(vectorTileLayer.getMinResolution()),
      );

      eventsKey['change:minZoom'] = vectorTileLayer.on('change:minZoom', () =>
        this.wolMinZoom.set(vectorTileLayer.getMinZoom()),
      );

      eventsKey['change:opacity'] = vectorTileLayer.on('change:opacity', () =>
        this.wolOpacity.set(vectorTileLayer.getOpacity()),
      );

      eventsKey['change:preload'] = vectorTileLayer.on('change:preload', () =>
        this.wolPreload.set(vectorTileLayer.getPreload()),
      );

      eventsKey['change:source'] = vectorTileLayer.on('change:source', () =>
        this.wolSource.set(vectorTileLayer.getSource() ?? undefined),
      );

      eventsKey['change:useInterimTilesOnError'] = vectorTileLayer.on(
        'change:useInterimTilesOnError',
        () => this.wolUseInterimTilesOnError.set(vectorTileLayer.getUseInterimTilesOnError()),
      );

      eventsKey['change:visible'] = vectorTileLayer.on('change:visible', () =>
        this.wolVisible.set(vectorTileLayer.getVisible()),
      );

      eventsKey['change:zIndex'] = vectorTileLayer.on('change:zIndex', () =>
        this.wolZIndex.set(vectorTileLayer.getZIndex()),
      );

      eventsKey['error'] = vectorTileLayer.on('error', (event) => this.wolError.emit(event));

      eventsKey['postrender'] = vectorTileLayer.on('postrender', (event) =>
        this.wolPostRender.emit(event),
      );

      eventsKey['prerender'] = vectorTileLayer.on('prerender', (event) =>
        this.wolPreRender.emit(event),
      );

      eventsKey['propertychange'] = vectorTileLayer.on('propertychange', (event) =>
        this.wolPropertyChange.emit(event),
      );

      eventsKey['sourceready'] = vectorTileLayer.on('sourceready', (event) =>
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
        hostRef.addLayer(vectorTileLayer);
      });

      this.instance = vectorTileLayer;
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
        case 'wolBackground':
          this.instance.setBackground(change.currentValue);
          break;
        case 'wolDeclutter':
          this.instance.setDeclutter(change.currentValue);
          break;
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
          this.instance.setSource(change.currentValue ?? null);
          break;
        case 'wolStyle':
          this.instance.setStyle(change.currentValue);
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
   * Gets the OpenLayers `VectorTileLayer` instance managed by the component.
   *
   * @returns The `VectorTileLayer` instance, or `undefined` before creation and after destruction.
   */
  getInstance(): VectorTileLayer | undefined {
    return this.instance;
  }
}
