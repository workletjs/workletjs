import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  model,
  OnChanges,
  output,
  signal,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';

import { EventsKey } from 'ol/events';
import BaseEvent from 'ol/events/Event';
import { Extent } from 'ol/extent';
import FlowLayer, { SourceType, Style } from 'ol/layer/Flow';
import { ObjectEvent } from 'ol/Object';
import { unByKey } from 'ol/Observable';
import RenderEvent from 'ol/render/Event';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { useLayerHostRef } from '@workletjs/ngx-openlayers/layer/layer';

@Component({
  selector: 'wol-flow-layer',
  exportAs: 'wolFlowLayer',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolFlowLayerComponent implements OnChanges {
  /**
   * The maximum particle speed.
   */
  readonly wolMaxSpeed = input.required<number>();

  /**
   * A larger factor increases the rate at which particles cross the screen.
   */
  readonly wolSpeedFactor = input<number>();

  /**
   * The number of particles to render.
   */
  readonly wolParticles = input<number>();

  /**
   * Style to apply to the layer.
   */
  readonly wolStyle = input<Style>();

  /**
   * A CSS class name to set to the layer element.
   */
  readonly wolClassName = input<string>();

  /**
   * Opacity (0, 1).
   */
  readonly wolOpacity = model<number>();

  /**
   * Visibility.
   */
  readonly wolVisible = model<boolean>();

  /**
   * The bounding extent for layer rendering. The layer will not be rendered outside of this extent.
   */
  readonly wolExtent = model<Extent>();

  /**
   * The z-index for layer rendering. At rendering time, the layers will be ordered, first by Z-index
   * and then by position.
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
   * Preload. Load low-resolution tiles up to `preload` levels. `0` means no preloading.
   */
  readonly wolPreload = model<number>();

  /**
   * Source for this layer.
   */
  readonly wolSource = model<SourceType | null>();

  /**
   * Use interim tiles on error.
   */
  readonly wolUseInterimTilesOnError = model<boolean>();

  /**
   * The internal texture cache size. This needs to be large enough to render two zoom levels worth
   * of tiles.
   */
  readonly wolCacheSize = input<number>();

  /**
   * Additional properties that will be set to the layer instance.
   */
  readonly wolProperties = input<WolProperties>();

  /**
   * Event emitted when the layer changes.
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
       * Adding control to the map must be done after the map is rendered,
       * if used with control flow of Angular.
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
