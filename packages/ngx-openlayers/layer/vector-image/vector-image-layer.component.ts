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
import VectorImageLayer from 'ol/layer/VectorImage';
import { OrderFunction } from 'ol/render';
import RenderEvent from 'ol/render/Event';
import VectorSource from 'ol/source/Vector';
import { StyleLike } from 'ol/style/Style';
import { FlatStyleLike } from 'ol/style/flat';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { useLayerHostRef } from '@workletjs/ngx-openlayers/layer/layer';

/**
 * Wraps an OpenLayers [VectorImageLayer](https://openlayers.org/en/latest/apidoc/module-ol_layer_VectorImage-VectorImageLayer.html),
 * which renders vector data as images for smoother pan and zoom performance.
 *
 * @example
 * ```html
 * <wol-map>
 *   <wol-vector-image-layer [wolSource]="source"></wol-vector-image-layer>
 * </wol-map>
 * ```
 *
 * @see https://openlayers.org/en/latest/apidoc/module-ol_layer_VectorImage-VectorImageLayer.html
 */
@Component({
  selector: 'wol-vector-image-layer',
  exportAs: 'wolVectorImageLayer',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolVectorImageLayerComponent implements OnChanges {
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
   * Render order function used to sort features before rendering.
   */
  readonly wolRenderOrder = input<OrderFunction>();

  /**
   * The buffer in pixels around the viewport used to query features from the vector source.
   */
  readonly wolRenderBuffer = input<number>();

  /**
   * Vector source for this layer.
   */
  readonly wolSource = model<VectorSource>();

  /**
   * Sets the layer as an overlay rendered on top of all other layers on a map. The map will not
   * manage this layer in its layers collection. Use `map.addLayer()` for managed layers.
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
   * The size ratio between rendered image and viewport. Higher values can reduce edge artifacts.
   */
  readonly wolImageRatio = input<number>();

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

  private instance?: VectorImageLayer;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useLayerHostRef<VectorImageLayer>('VectorImageLayer');
    const eventsKey: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const vectorImageLayer = new VectorImageLayer({
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
        source: this.wolSource(),
        map: this.wolMap(),
        declutter: this.wolDeclutter(),
        style: this.wolStyle(),
        background: this.wolBackground(),
        imageRatio: this.wolImageRatio(),
        properties: this.wolProperties(),
      });

      eventsKey['change'] = vectorImageLayer.on('change', (event) => this.wolChange.emit(event));

      eventsKey['change:extent'] = vectorImageLayer.on('change:extent', () =>
        this.wolExtent.set(vectorImageLayer.getExtent()),
      );

      eventsKey['change:maxResolution'] = vectorImageLayer.on('change:maxResolution', () =>
        this.wolMaxResolution.set(vectorImageLayer.getMaxResolution()),
      );

      eventsKey['change:maxZoom'] = vectorImageLayer.on('change:maxZoom', () =>
        this.wolMaxZoom.set(vectorImageLayer.getMaxZoom()),
      );

      eventsKey['change:minResolution'] = vectorImageLayer.on('change:minResolution', () =>
        this.wolMinResolution.set(vectorImageLayer.getMinResolution()),
      );

      eventsKey['change:minZoom'] = vectorImageLayer.on('change:minZoom', () =>
        this.wolMinZoom.set(vectorImageLayer.getMinZoom()),
      );

      eventsKey['change:opacity'] = vectorImageLayer.on('change:opacity', () =>
        this.wolOpacity.set(vectorImageLayer.getOpacity()),
      );

      eventsKey['change:source'] = vectorImageLayer.on('change:source', () =>
        this.wolSource.set(vectorImageLayer.getSource() ?? undefined),
      );

      eventsKey['change:visible'] = vectorImageLayer.on('change:visible', () =>
        this.wolVisible.set(vectorImageLayer.getVisible()),
      );

      eventsKey['change:zIndex'] = vectorImageLayer.on('change:zIndex', () =>
        this.wolZIndex.set(vectorImageLayer.getZIndex() ?? 0),
      );

      eventsKey['error'] = vectorImageLayer.on('error', (event) => this.wolError.emit(event));

      eventsKey['postrender'] = vectorImageLayer.on('postrender', (event) =>
        this.wolPostRender.emit(event),
      );

      eventsKey['prerender'] = vectorImageLayer.on('prerender', (event) =>
        this.wolPreRender.emit(event),
      );

      eventsKey['propertychange'] = vectorImageLayer.on('propertychange', (event) =>
        this.wolPropertyChange.emit(event),
      );

      eventsKey['sourceready'] = vectorImageLayer.on('sourceready', (event) =>
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
        hostRef.addLayer(vectorImageLayer);
      });

      this.instance = vectorImageLayer;
    });

    destroyRef.onDestroy(() => {
      unByKey(Object.values(eventsKey));

      if (this.instance) {
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
        case 'wolDeclutter':
          this.instance.setDeclutter(change.currentValue);
          break;
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
        case 'wolProperties':
          this.instance.setProperties(change.currentValue);
          break;
        case 'wolSource':
          this.instance.setSource(change.currentValue);
          break;
        case 'wolStyle':
          this.instance.setStyle(change.currentValue);
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
   * Get the underlying OpenLayers VectorImageLayer instance.
   * @returns The VectorImageLayer instance.
   */
  getInstance(): VectorImageLayer | undefined {
    return this.instance;
  }
}
