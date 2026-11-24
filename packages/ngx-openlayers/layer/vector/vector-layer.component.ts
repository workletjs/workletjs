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
import VectorLayer from 'ol/layer/Vector';
import { OrderFunction } from 'ol/render';
import RenderEvent from 'ol/render/Event';
import VectorSource from 'ol/source/Vector';
import { StyleLike } from 'ol/style/Style';
import { FlatStyleLike } from 'ol/style/flat';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { useLayerHostRef } from '@workletjs/ngx-openlayers/layer/layer';

/**
 * Wraps an OpenLayers [VectorLayer](https://openlayers.org/en/latest/apidoc/module-ol_layer_Vector-VectorLayer.html),
 * which renders vector features client-side with full style fidelity.
 *
 * @example
 * ```html
 * <wol-map>
 *   <wol-vector-layer [wolSource]="source"></wol-vector-layer>
 * </wol-map>
 * ```
 *
 * @see https://openlayers.org/en/latest/apidoc/module-ol_layer_Vector-VectorLayer.html
 */
@Component({
  selector: 'wol-vector-layer',
  exportAs: 'wolVectorLayer',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolVectorLayerComponent implements OnChanges {
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
   * Buffer in pixels around the viewport used to select features for rendering and hit detection.
   * Defaults to `100`.
   *
   * @remarks The component reads this option when creating the OpenLayers instance.
   */
  readonly wolRenderBuffer = input<number>();

  /**
   * Vector source for this layer.
   */
  readonly wolSource = model<VectorSource>();

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
   *
   * @remarks The component reads this option when creating the OpenLayers instance.
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

  private instance?: VectorLayer;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useLayerHostRef<VectorLayer>('VectorLayer');
    const eventsKey: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const vectorLayer = new VectorLayer({
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
        updateWhileAnimating: this.wolUpdateWhileAnimating(),
        updateWhileInteracting: this.wolUpdateWhileInteracting(),
        properties: this.wolProperties(),
      });

      eventsKey['change'] = vectorLayer.on('change', (event) => this.wolChange.emit(event));

      eventsKey['change:extent'] = vectorLayer.on('change:extent', () =>
        this.wolExtent.set(vectorLayer.getExtent()),
      );

      eventsKey['change:maxResolution'] = vectorLayer.on('change:maxResolution', () =>
        this.wolMaxResolution.set(vectorLayer.getMaxResolution()),
      );

      eventsKey['change:minResolution'] = vectorLayer.on('change:minResolution', () =>
        this.wolMinResolution.set(vectorLayer.getMinResolution()),
      );

      eventsKey['change:maxZoom'] = vectorLayer.on('change:maxZoom', () =>
        this.wolMaxZoom.set(vectorLayer.getMaxZoom()),
      );

      eventsKey['change:minZoom'] = vectorLayer.on('change:minZoom', () =>
        this.wolMinZoom.set(vectorLayer.getMinZoom()),
      );

      eventsKey['change:opacity'] = vectorLayer.on('change:opacity', () =>
        this.wolOpacity.set(vectorLayer.getOpacity()),
      );

      eventsKey['change:source'] = vectorLayer.on('change:source', () =>
        this.wolSource.set(vectorLayer.getSource() ?? undefined),
      );

      eventsKey['change:visible'] = vectorLayer.on('change:visible', () =>
        this.wolVisible.set(vectorLayer.getVisible()),
      );

      eventsKey['change:zIndex'] = vectorLayer.on('change:zIndex', () =>
        this.wolZIndex.set(vectorLayer.getZIndex() ?? 0),
      );

      eventsKey['error'] = vectorLayer.on('error', (event) => this.wolError.emit(event));

      eventsKey['postrender'] = vectorLayer.on('postrender', (event) =>
        this.wolPostRender.emit(event),
      );

      eventsKey['prerender'] = vectorLayer.on('prerender', (event) =>
        this.wolPreRender.emit(event),
      );

      eventsKey['propertychange'] = vectorLayer.on('propertychange', (event) =>
        this.wolPropertyChange.emit(event),
      );

      eventsKey['sourceready'] = vectorLayer.on('sourceready', (event) =>
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
        hostRef.addLayer(vectorLayer);
      });

      this.instance = vectorLayer;
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
        case 'wolMinResolution':
          this.instance.setMinResolution(change.currentValue);
          break;
        case 'wolMaxZoom':
          this.instance.setMaxZoom(change.currentValue);
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
   * Gets the OpenLayers `VectorLayer` instance managed by the component.
   *
   * @returns The `VectorLayer` instance, or `undefined` before creation and after destruction.
   */
  getInstance(): VectorLayer | undefined {
    return this.instance;
  }
}
