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

import { ObjectEvent } from 'ol/Object';
import { unByKey } from 'ol/Observable';
import { EventsKey } from 'ol/events';
import BaseEvent from 'ol/events/Event';
import { Extent } from 'ol/extent';
import { BackgroundColor } from 'ol/layer/Base';
import WebGLVectorLayer from 'ol/layer/WebGLVector';
import RenderEvent from 'ol/render/Event';
import VectorSource from 'ol/source/Vector';
import { FlatStyleLike, StyleVariables } from 'ol/style/flat';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { useLayerHostRef } from '@workletjs/ngx-openlayers/layer/layer';

/**
 * Wraps an OpenLayers [WebGLVectorLayer](https://openlayers.org/en/latest/apidoc/module-ol_layer_WebGLVector-WebGLVectorLayer.html),
 * used for WebGL rendering of vector data.
 *
 * @example
 * ```html
 * <wol-map>
 *   <wol-webgl-vector-layer [wolSource]="source" [wolStyle]="style"></wol-webgl-vector-layer>
 * </wol-map>
 * ```
 *
 * @see https://openlayers.org/en/latest/apidoc/module-ol_layer_WebGLVector-WebGLVectorLayer.html
 */
@Component({
  selector: 'wol-webgl-vector-layer',
  exportAs: 'wolWebGLVectorLayer',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolWebGLVectorLayerComponent implements OnChanges {
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
   * Vector source for this layer.
   */
  readonly wolSource = model<VectorSource>();

  /**
   * Layer style definition. Accepts a `FlatStyleLike` value.
   *
   * This input is **required**.
   */
  readonly wolStyle = input.required<FlatStyleLike>();

  /**
   * Style variables referenced by style expressions.
   */
  readonly wolVariables = input<StyleVariables>();

  /**
   * Background color for the layer. No background will be rendered when not specified.
   */
  readonly wolBackground = input<BackgroundColor>();

  /**
   * When `true`, disables hit detection for this layer.
   */
  readonly wolDisableHitDetection = input<boolean>();

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

  private instance?: WebGLVectorLayer;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useLayerHostRef<WebGLVectorLayer>('WebGLVectorLayer');
    const eventsKey: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const webglVectorLayer = new WebGLVectorLayer({
        className: this.wolClassName(),
        opacity: this.wolOpacity(),
        visible: this.wolVisible(),
        extent: this.wolExtent(),
        zIndex: this.wolZIndex(),
        minResolution: this.wolMinResolution(),
        maxResolution: this.wolMaxResolution(),
        minZoom: this.wolMinZoom(),
        maxZoom: this.wolMaxZoom(),
        source: this.wolSource(),
        style: this.wolStyle(),
        variables: this.wolVariables(),
        background: this.wolBackground(),
        disableHitDetection: this.wolDisableHitDetection(),
        properties: this.wolProperties(),
      });

      eventsKey['change'] = webglVectorLayer.on('change', (event) => this.wolChange.emit(event));

      eventsKey['change:extent'] = webglVectorLayer.on('change:extent', () =>
        this.wolExtent.set(webglVectorLayer.getExtent()),
      );

      eventsKey['change:maxResolution'] = webglVectorLayer.on('change:maxResolution', () =>
        this.wolMaxResolution.set(webglVectorLayer.getMaxResolution()),
      );

      eventsKey['change:minResolution'] = webglVectorLayer.on('change:minResolution', () =>
        this.wolMinResolution.set(webglVectorLayer.getMinResolution()),
      );

      eventsKey['change:maxZoom'] = webglVectorLayer.on('change:maxZoom', () =>
        this.wolMaxZoom.set(webglVectorLayer.getMaxZoom()),
      );

      eventsKey['change:minZoom'] = webglVectorLayer.on('change:minZoom', () =>
        this.wolMinZoom.set(webglVectorLayer.getMinZoom()),
      );

      eventsKey['change:opacity'] = webglVectorLayer.on('change:opacity', () =>
        this.wolOpacity.set(webglVectorLayer.getOpacity()),
      );

      eventsKey['change:source'] = webglVectorLayer.on('change:source', () =>
        this.wolSource.set(webglVectorLayer.getSource() ?? undefined),
      );

      eventsKey['change:visible'] = webglVectorLayer.on('change:visible', () =>
        this.wolVisible.set(webglVectorLayer.getVisible()),
      );

      eventsKey['change:zIndex'] = webglVectorLayer.on('change:zIndex', () =>
        this.wolZIndex.set(webglVectorLayer.getZIndex() ?? 0),
      );

      eventsKey['error'] = webglVectorLayer.on('error', (event) => this.wolError.emit(event));

      eventsKey['postrender'] = webglVectorLayer.on('postrender', (event) =>
        this.wolPostRender.emit(event),
      );

      eventsKey['prerender'] = webglVectorLayer.on('prerender', (event) =>
        this.wolPreRender.emit(event),
      );

      eventsKey['propertychange'] = webglVectorLayer.on('propertychange', (event) =>
        this.wolPropertyChange.emit(event),
      );

      eventsKey['sourceready'] = webglVectorLayer.on('sourceready', (event) =>
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
        hostRef.addLayer(webglVectorLayer);
      });

      this.instance = webglVectorLayer;
    });

    destroyRef.onDestroy(() => {
      unByKey(Object.values(eventsKey));

      if (this.instance) {
        hostRef.removeLayer(this.instance);
        this.instance.dispose();
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
        case 'wolVariables':
          this.instance.updateStyleVariables(change.currentValue);
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
   * Get the underlying WebGLVectorLayer instance.
   * @returns The WebGLVectorLayer instance or undefined if not yet created.
   */
  getInstance(): WebGLVectorLayer | undefined {
    return this.instance;
  }
}
