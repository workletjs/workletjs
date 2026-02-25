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
  signal,
} from '@angular/core';

import { ObjectEvent } from 'ol/Object';
import { unByKey } from 'ol/Observable';
import { EventsKey } from 'ol/events';
import BaseEvent from 'ol/events/Event';
import { Extent } from 'ol/extent';
import { BackgroundColor } from 'ol/layer/Base';
import WebGLVectorTileLayer from 'ol/layer/WebGLVectorTile';
import RenderEvent from 'ol/render/Event';
import RenderFeature from 'ol/render/Feature';
import VectorTileSource from 'ol/source/VectorTile';
import { FlatStyleLike, StyleVariables } from 'ol/style/flat';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { useLayerHostRef } from '@workletjs/ngx-openlayers/layer/layer';

@Component({
  selector: 'wol-webgl-vector-tile-layer',
  exportAs: 'wolWebGLVectorTileLayer',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolWebGLVectorTileLayerComponent implements OnChanges {
  /**
   * A CSS class name to set to the layer element.
   */
  readonly wolClassName = input<string>();

  /**
   * Opacity (0–1).
   */
  readonly wolOpacity = model<number>();

  /**
   * Whether the layer is visible.
   */
  readonly wolVisible = model<boolean>();

  /**
   * The bounding extent for layer rendering. The layer will not be rendered outside of this extent.
   *
   * @remarks Not yet supported by the underlying OpenLayers `WebGLVectorTileLayer`.
   */
  readonly wolExtent = model<Extent>();

  /**
   * The z-index for layer rendering. Layers are ordered by z-index, then by position.
   * When `undefined`, a `zIndex` of 0 is assumed for layers added to the map's `layers`
   * collection, or `Infinity` when the layer's `setMap()` method is used.
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
   * The `VectorTile` source for this layer.
   */
  readonly wolSource = model<VectorTileSource<RenderFeature>>();

  /**
   * Layer style definition. Accepts a `FlatStyleLike` value — an array of flat style rules
   * with optional `filter` expressions for WebGL-based rendering.
   *
   * This input is **required**.
   */
  readonly wolStyle = input.required<FlatStyleLike>();

  /**
   * Style variables. Each variable must hold a literal value (not an expression).
   * Variables can be referenced inside style expressions via the `['var', 'varName']` operator.
   * Update variables at runtime using `updateStyleVariables()` or by rebinding this input.
   */
  readonly wolVariables = input<StyleVariables>();

  /**
   * Background color for the layer. If not specified, no background is rendered.
   *
   * @remarks Not yet supported by the underlying OpenLayers `WebGLVectorTileLayer`.
   */
  readonly wolBackground = input<BackgroundColor>();

  /**
   * When `true`, disables hit detection on this layer.
   * Provides a slight performance boost but prevents `forEachFeatureAtPixel` from matching
   * features on this layer.
   */
  readonly wolDisableHitDetection = input<boolean>();

  /**
   * Arbitrary observable properties. Accessible via `#get()` and `#set()` on the underlying
   * OpenLayers object.
   */
  readonly wolProperties = input<WolProperties>();

  /**
   * Emitted when the layer object changes.
   */
  readonly wolChange = output<BaseEvent>();

  /**
   * Emitted when an error occurs.
   */
  readonly wolError = output<BaseEvent>();

  /**
   * Emitted after the layer is rendered.
   */
  readonly wolPostRender = output<RenderEvent>();

  /**
   * Emitted before the layer is rendered.
   */
  readonly wolPreRender = output<RenderEvent>();

  /**
   * Emitted when an observable property on the layer changes.
   */
  readonly wolPropertyChange = output<ObjectEvent>();

  /**
   * Emitted when the layer's source is ready (i.e., the source has finished loading initial data).
   */
  readonly wolSourceReady = output<BaseEvent>();

  private readonly instance = signal<WebGLVectorTileLayer<
    VectorTileSource<RenderFeature>,
    RenderFeature
  > | null>(null);

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef =
      useLayerHostRef<WebGLVectorTileLayer<VectorTileSource<RenderFeature>, RenderFeature>>(
        'WebGLVectorTileLayer',
      );
    const eventsKey: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const webglVectorTileLayer = new WebGLVectorTileLayer<
        VectorTileSource<RenderFeature>,
        RenderFeature
      >({
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

      eventsKey['change'] = webglVectorTileLayer.on('change', (event) =>
        this.wolChange.emit(event),
      );

      eventsKey['change:extent'] = webglVectorTileLayer.on('change:extent', () =>
        this.wolExtent.set(webglVectorTileLayer.getExtent()),
      );

      eventsKey['change:maxResolution'] = webglVectorTileLayer.on('change:maxResolution', () =>
        this.wolMaxResolution.set(webglVectorTileLayer.getMaxResolution()),
      );

      eventsKey['change:minResolution'] = webglVectorTileLayer.on('change:minResolution', () =>
        this.wolMinResolution.set(webglVectorTileLayer.getMinResolution()),
      );

      eventsKey['change:maxZoom'] = webglVectorTileLayer.on('change:maxZoom', () =>
        this.wolMaxZoom.set(webglVectorTileLayer.getMaxZoom()),
      );

      eventsKey['change:minZoom'] = webglVectorTileLayer.on('change:minZoom', () =>
        this.wolMinZoom.set(webglVectorTileLayer.getMinZoom()),
      );

      eventsKey['change:opacity'] = webglVectorTileLayer.on('change:opacity', () =>
        this.wolOpacity.set(webglVectorTileLayer.getOpacity()),
      );

      eventsKey['change:source'] = webglVectorTileLayer.on('change:source', () =>
        this.wolSource.set(webglVectorTileLayer.getSource() ?? undefined),
      );

      eventsKey['change:visible'] = webglVectorTileLayer.on('change:visible', () =>
        this.wolVisible.set(webglVectorTileLayer.getVisible()),
      );

      eventsKey['change:zIndex'] = webglVectorTileLayer.on('change:zIndex', () =>
        this.wolZIndex.set(webglVectorTileLayer.getZIndex() ?? 0),
      );

      eventsKey['error'] = webglVectorTileLayer.on('error', (event) => this.wolError.emit(event));

      eventsKey['postrender'] = webglVectorTileLayer.on('postrender', (event) =>
        this.wolPostRender.emit(event),
      );

      eventsKey['prerender'] = webglVectorTileLayer.on('prerender', (event) =>
        this.wolPreRender.emit(event),
      );

      eventsKey['propertychange'] = webglVectorTileLayer.on('propertychange', (event) =>
        this.wolPropertyChange.emit(event),
      );

      eventsKey['sourceready'] = webglVectorTileLayer.on('sourceready', (event) =>
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
        hostRef.addLayer(webglVectorTileLayer);
      });

      this.instance.set(webglVectorTileLayer);
    });

    destroyRef.onDestroy(() => {
      const webglVectorTileLayer = this.instance();

      unByKey(Object.values(eventsKey));

      if (webglVectorTileLayer) {
        hostRef.removeLayer(webglVectorTileLayer);
        webglVectorTileLayer.dispose();
        this.instance.set(null);
      }
    });
  }

  /**
   * Respond to input changes.
   * @param changes The changes object containing the changed inputs.
   * @internal
   */
  ngOnChanges(changes: SimpleChanges): void {
    const webglVectorTileLayer = this.instance();
    if (!webglVectorTileLayer) {
      return;
    }

    for (const [key, change] of Object.entries(changes)) {
      switch (key) {
        case 'wolExtent':
          webglVectorTileLayer.setExtent(change.currentValue);
          break;
        case 'wolMaxResolution':
          webglVectorTileLayer.setMaxResolution(change.currentValue);
          break;
        case 'wolMinResolution':
          webglVectorTileLayer.setMinResolution(change.currentValue);
          break;
        case 'wolMaxZoom':
          webglVectorTileLayer.setMaxZoom(change.currentValue);
          break;
        case 'wolMinZoom':
          webglVectorTileLayer.setMinZoom(change.currentValue);
          break;
        case 'wolOpacity':
          webglVectorTileLayer.setOpacity(change.currentValue);
          break;
        case 'wolProperties':
          webglVectorTileLayer.setProperties(change.currentValue);
          break;
        case 'wolSource':
          webglVectorTileLayer.setSource(change.currentValue);
          break;
        case 'wolStyle':
          webglVectorTileLayer.setStyle(change.currentValue);
          break;
        case 'wolVariables':
          webglVectorTileLayer.updateStyleVariables(change.currentValue);
          break;
        case 'wolVisible':
          webglVectorTileLayer.setVisible(change.currentValue);
          break;
        case 'wolZIndex':
          webglVectorTileLayer.setZIndex(change.currentValue);
          break;
      }
    }
  }

  /**
   * Get the underlying WebGLVectorTileLayer instance.
   * @returns The WebGLVectorTileLayer instance or undefined if not yet created.
   */
  getInstance(): WebGLVectorTileLayer<VectorTileSource<RenderFeature>, RenderFeature> | undefined {
    return this.instance() ?? undefined;
  }
}
