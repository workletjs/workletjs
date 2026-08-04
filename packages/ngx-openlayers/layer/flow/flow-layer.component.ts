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
import FlowLayer, { SourceType, Style } from 'ol/layer/Flow';
import RenderEvent from 'ol/render/Event';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { useLayerHostRef } from '@workletjs/ngx-openlayers/layer/layer';

/**
 * Wraps an OpenLayers [FlowLayer](https://openlayers.org/en/latest/apidoc/module-ol_layer_Flow-FlowLayer.html)
 * instance, an experimental WebGL tile layer that renders particles moving through a vector field.
 * Use this component with a `DataTile` source whose tiles encode velocity data and optionally provide
 * a flow style to colorize the rendered particles.
 *
 * @experimental FlowLayer is experimental in OpenLayers and this wrapper may change along with the
 * upstream API.
 *
 * @example
 * ```html
 * <wol-map>
 *   <wol-flow-layer
 *     [wolSource]="windSource"
 *     [wolMaxSpeed]="24"
 *     [wolStyle]="windStyle"
 *   ></wol-flow-layer>
 * </wol-map>
 * ```
 *
 * @see https://openlayers.org/en/latest/apidoc/module-ol_layer_Flow-FlowLayer.html
 */
@Component({
  selector: 'wol-flow-layer',
  exportAs: 'wolFlowLayer',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolFlowLayerComponent implements OnChanges {
  /**
   * The maximum particle speed used to normalize the velocity field. This value is required and
   * should match the maximum magnitude encoded in the source tiles.
   */
  readonly wolMaxSpeed = input.required<number>();

  /**
   * A larger factor increases the rate at which particles cross the screen. Defaults to `0.001`.
   */
  readonly wolSpeedFactor = input<number>();

  /**
   * The number of particles to render. Higher values improve density at the cost of more GPU work.
   * Defaults to `65536`.
   */
  readonly wolParticles = input<number>();

  /**
   * Style to apply to the layer. Use `variables` and a `color` expression to map velocity values to
   * rendered particle colors. Runtime style updates should provide the style variables to
   * `wolStyle`, which are forwarded to `FlowLayer#updateStyleVariables`.
   */
  readonly wolStyle = input<Style>();

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
   * Preload. Load low-resolution tiles up to `preload` levels. `0` means no preloading. Defaults
   * to `0`.
   */
  readonly wolPreload = model<number>();

  /**
   * Source for this layer. Provide a `DataTile` source whose tiles encode vector-field velocity
   * data for the flow renderer.
   */
  readonly wolSource = model<SourceType | null>();

  /**
   * Whether to keep using interim tiles after loading errors. Defaults to `true`.
   */
  readonly wolUseInterimTilesOnError = model<boolean>();

  /**
   * The internal texture cache size. This needs to be large enough to render two zoom levels worth
   * of tiles. Defaults to `512`.
   */
  readonly wolCacheSize = input<number>();

  /**
   * Additional properties that will be set on the layer instance.
   */
  readonly wolProperties = input<WolProperties>();

  /**
   * Event emitted when the layer state changes.
   */
  readonly wolChange = output<BaseEvent>();

  /**
   * Event emitted when the layer encounters an error.
   */
  readonly wolError = output<BaseEvent>();

  /**
   * Event emitted after the layer is rendered.
   */
  readonly wolPostRender = output<RenderEvent>();

  /**
   * Event emitted before the layer is rendered.
   */
  readonly wolPreRender = output<RenderEvent>();

  /**
   * Event emitted when a property of the layer changes.
   */
  readonly wolPropertyChange = output<ObjectEvent>();

  /**
   * Event emitted when the source is ready.
   */
  readonly wolSourceReady = output<BaseEvent>();

  private instance = signal<FlowLayer | null>(null);

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useLayerHostRef<FlowLayer>('FlowLayer');
    const eventsKey: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const flowLayer = new FlowLayer({
        maxSpeed: this.wolMaxSpeed(),
        speedFactor: this.wolSpeedFactor(),
        particles: this.wolParticles(),
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
        source: this.wolSource() ?? undefined,
        useInterimTilesOnError: this.wolUseInterimTilesOnError(),
        cacheSize: this.wolCacheSize(),
      });

      if (this.wolProperties()) {
        flowLayer.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKey['change'] = flowLayer.on('change', (event) => this.wolChange.emit(event));

      eventsKey['change:extent'] = flowLayer.on('change:extent', () =>
        this.wolExtent.set(flowLayer.getExtent()),
      );

      eventsKey['change:maxResolution'] = flowLayer.on('change:maxResolution', () =>
        this.wolMaxResolution.set(flowLayer.getMaxResolution()),
      );

      eventsKey['change:maxZoom'] = flowLayer.on('change:maxZoom', () =>
        this.wolMaxZoom.set(flowLayer.getMaxZoom()),
      );

      eventsKey['change:minResolution'] = flowLayer.on('change:minResolution', () =>
        this.wolMinResolution.set(flowLayer.getMinResolution()),
      );

      eventsKey['change:minZoom'] = flowLayer.on('change:minZoom', () =>
        this.wolMinZoom.set(flowLayer.getMinZoom()),
      );

      eventsKey['change:opacity'] = flowLayer.on('change:opacity', () =>
        this.wolOpacity.set(flowLayer.getOpacity()),
      );

      eventsKey['change:preload'] = flowLayer.on('change:preload', () =>
        this.wolPreload.set(flowLayer.getPreload()),
      );

      eventsKey['change:source'] = flowLayer.on('change:source', () =>
        this.wolSource.set(flowLayer.getSource()),
      );

      eventsKey['change:useInterimTilesOnError'] = flowLayer.on(
        'change:useInterimTilesOnError',
        () => this.wolUseInterimTilesOnError.set(flowLayer.getUseInterimTilesOnError()),
      );

      eventsKey['change:visible'] = flowLayer.on('change:visible', () =>
        this.wolVisible.set(flowLayer.getVisible()),
      );

      eventsKey['change:zIndex'] = flowLayer.on('change:zIndex', () =>
        this.wolZIndex.set(flowLayer.getZIndex()),
      );

      eventsKey['error'] = flowLayer.on('error', (event) => this.wolError.emit(event));

      eventsKey['postrender'] = flowLayer.on('postrender', (event) =>
        this.wolPostRender.emit(event),
      );

      eventsKey['prerender'] = flowLayer.on('prerender', (event) => this.wolPreRender.emit(event));

      eventsKey['propertychange'] = flowLayer.on('propertychange', (event) =>
        this.wolPropertyChange.emit(event),
      );

      eventsKey['sourceready'] = flowLayer.on('sourceready', (event) =>
        this.wolSourceReady.emit(event),
      );

      /**
       * Adding this layer to the map must be done after the map is rendered
       * when used with Angular's control flow.
       *
       * In Angular, when rendering a component's template, the control flow statements,
       * such as @if, @else, @else if, @for, and @switch, are evaluated during the template
       * rendering process. This evaluation happens before the actual content within the blocks
       * is rendered to the DOM.
       */
      Promise.resolve().then(() => {
        hostRef.addLayer(flowLayer);
      });

      this.instance.set(flowLayer);
    });

    destroyRef.onDestroy(() => {
      unByKey(Object.values(eventsKey));

      const flowLayer = this.instance();

      if (flowLayer) {
        hostRef.removeLayer(flowLayer);
        flowLayer.dispose();
        this.instance.set(null);
      }
    });
  }

  /**
   * Respond to input changes.
   *
   * @param changes  The changes object containing the changed inputs.
   * @internal
   */
  ngOnChanges(changes: SimpleChanges): void {
    const flowLayer = this.instance();

    if (!flowLayer) {
      return;
    }

    for (const [key, change] of Object.entries(changes)) {
      switch (key) {
        case 'wolExtent':
          flowLayer.setExtent(change.currentValue);
          break;
        case 'wolMaxResolution':
          flowLayer.setMaxResolution(change.currentValue);
          break;
        case 'wolMaxZoom':
          flowLayer.setMaxZoom(change.currentValue);
          break;
        case 'wolMinResolution':
          flowLayer.setMinResolution(change.currentValue);
          break;
        case 'wolMinZoom':
          flowLayer.setMinZoom(change.currentValue);
          break;
        case 'wolOpacity':
          flowLayer.setOpacity(change.currentValue);
          break;
        case 'wolPreload':
          flowLayer.setPreload(change.currentValue);
          break;
        case 'wolSource':
          flowLayer.setSource(change.currentValue ?? null);
          break;
        case 'wolUseInterimTilesOnError':
          flowLayer.setUseInterimTilesOnError(change.currentValue);
          break;
        case 'wolVisible':
          flowLayer.setVisible(change.currentValue);
          break;
        case 'wolZIndex':
          flowLayer.setZIndex(change.currentValue);
          break;
        case 'wolProperties':
          flowLayer.setProperties(change.currentValue ?? {});
          break;
        case 'wolStyle':
          flowLayer.updateStyleVariables(change.currentValue);
          break;
      }
    }
  }

  /**
   * Get the underlying FlowLayer instance.
   *
   * @returns The FlowLayer instance or undefined if not yet created.
   */
  getInstance(): FlowLayer | undefined {
    return this.instance() ?? undefined;
  }
}
