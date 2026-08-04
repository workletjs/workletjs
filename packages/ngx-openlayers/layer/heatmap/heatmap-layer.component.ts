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

import Feature, { FeatureLike } from 'ol/Feature';
import { ObjectEvent } from 'ol/Object';
import { unByKey } from 'ol/Observable';
import { EventsKey } from 'ol/events';
import BaseEvent from 'ol/events/Event';
import { Extent } from 'ol/extent';
import { Geometry } from 'ol/geom';
import Heatmap, { WeightExpression } from 'ol/layer/Heatmap';
import RenderEvent from 'ol/render/Event';
import VectorSource from 'ol/source/Vector';
import { BooleanExpression, NumberExpression } from 'ol/style/flat';

import { WolProperties, WolSafeAny } from '@workletjs/ngx-openlayers/core/types';
import { useLayerHostRef } from '@workletjs/ngx-openlayers/layer/layer';

/**
 * Wraps an OpenLayers [Heatmap](https://openlayers.org/en/latest/apidoc/module-ol_layer_Heatmap-Heatmap.html)
 * layer, which renders vector point data as a heatmap.
 *
 * @example
 * ```html
 * <wol-map>
 *   <wol-heatmap-layer [wolSource]="source" [wolRadius]="10"></wol-heatmap-layer>
 * </wol-map>
 * ```
 *
 * @see https://openlayers.org/en/latest/apidoc/module-ol_layer_Heatmap-Heatmap.html
 */
@Component({
  selector: 'wol-heatmap-layer',
  exportAs: 'wolHeatmapLayer',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolHeatmapLayerComponent implements OnChanges {
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
   * The color gradient of the heatmap, specified as an array of CSS color strings.
   * Defaults to `['#00f', '#0ff', '#0f0', '#ff0', '#f00']`.
   */
  readonly wolGradient = model<string[]>();

  /**
   * Radius size in pixels. For `LineString` features, the line width will be double the radius.
   * Supports expressions. Defaults to `8`.
   */
  readonly wolRadius = model<NumberExpression>();

  /**
   * Blur size in pixels, added to `wolRadius` to produce the final blur effect size. Supports
   * expressions. Defaults to `15`.
   */
  readonly wolBlur = model<NumberExpression>();

  /**
   * The feature attribute or expression to use as the heatmap weight. Accepts a feature attribute
   * name (string), a number expression, or a function returning a number. Weight values should be
   * in the range `[0, 1]`. Defaults to `'weight'`.
   */
  readonly wolWeight = input<WeightExpression>();

  /**
   * Optional filter expression to control which features are rendered.
   */
  readonly wolFilter = input<BooleanExpression>();

  /**
   * Variables used in expressions for `wolWeight`, `wolRadius`, `wolBlur`, or `wolFilter`.
   */
  readonly wolVariables = input<Record<string, number | number[] | string | boolean>>();

  /**
   * Point vector source for the heatmap.
   */
  readonly wolSource = model<VectorSource<Feature<Geometry>>>();

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

  private instance?: Heatmap<Feature<Geometry>>;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useLayerHostRef<Heatmap>('Heatmap');
    const eventsKey: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const heatmap = new Heatmap({
        className: this.wolClassName(),
        opacity: this.wolOpacity(),
        visible: this.wolVisible(),
        extent: this.wolExtent(),
        zIndex: this.wolZIndex(),
        minResolution: this.wolMinResolution(),
        maxResolution: this.wolMaxResolution(),
        minZoom: this.wolMinZoom(),
        maxZoom: this.wolMaxZoom(),
        gradient: this.wolGradient(),
        radius: this.wolRadius(),
        blur: this.wolBlur(),
        weight: this.wolWeight(),
        filter: this.wolFilter(),
        variables: this.wolVariables(),
        source: this.wolSource(),
        properties: this.wolProperties(),
      });

      eventsKey['change'] = heatmap.on('change', (event) => this.wolChange.emit(event));

      eventsKey['change:blur'] = heatmap.on('change:blur' as WolSafeAny, () =>
        this.wolBlur.set(heatmap.getBlur()),
      );

      eventsKey['change:extent'] = heatmap.on('change:extent', () =>
        this.wolExtent.set(heatmap.getExtent()),
      );

      eventsKey['change:gradient'] = heatmap.on('change:gradient' as WolSafeAny, () =>
        this.wolGradient.set(heatmap.getGradient()),
      );

      eventsKey['change:maxResolution'] = heatmap.on('change:maxResolution', () =>
        this.wolMaxResolution.set(heatmap.getMaxResolution()),
      );

      eventsKey['change:maxZoom'] = heatmap.on('change:maxZoom', () =>
        this.wolMaxZoom.set(heatmap.getMaxZoom()),
      );

      eventsKey['change:minResolution'] = heatmap.on('change:minResolution', () =>
        this.wolMinResolution.set(heatmap.getMinResolution()),
      );

      eventsKey['change:minZoom'] = heatmap.on('change:minZoom', () =>
        this.wolMinZoom.set(heatmap.getMinZoom()),
      );

      eventsKey['change:opacity'] = heatmap.on('change:opacity', () =>
        this.wolOpacity.set(heatmap.getOpacity()),
      );

      eventsKey['change:source'] = heatmap.on('change:source', () =>
        this.wolSource.set(heatmap.getSource() ?? undefined),
      );

      eventsKey['change:radius'] = heatmap.on('change:radius' as WolSafeAny, () =>
        this.wolRadius.set(heatmap.getRadius()),
      );

      eventsKey['change:visible'] = heatmap.on('change:visible', () =>
        this.wolVisible.set(heatmap.getVisible()),
      );

      eventsKey['change:zIndex'] = heatmap.on('change:zIndex', () =>
        this.wolZIndex.set(heatmap.getZIndex()),
      );

      eventsKey['error'] = heatmap.on('error', (event) => this.wolError.emit(event));

      eventsKey['postrender'] = heatmap.on('postrender', (event) => this.wolPostRender.emit(event));

      eventsKey['prerender'] = heatmap.on('prerender', (event) => this.wolPreRender.emit(event));

      eventsKey['propertychange'] = heatmap.on('propertychange', (event) =>
        this.wolPropertyChange.emit(event),
      );

      eventsKey['sourceready'] = heatmap.on('sourceready', (event) =>
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
        hostRef.addLayer(heatmap);
      });

      this.instance = heatmap;
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
        case 'wolBlur':
          this.instance.setBlur(change.currentValue);
          break;
        case 'wolExtent':
          this.instance.setExtent(change.currentValue);
          break;
        case 'wolFilter':
          this.instance.setFilter(change.currentValue);
          break;
        case 'wolGradient':
          this.instance.setGradient(change.currentValue);
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
          this.instance.setProperties(change.currentValue ?? {});
          break;
        case 'wolRadius':
          this.instance.setRadius(change.currentValue);
          break;
        case 'wolSource':
          this.instance.setSource(change.currentValue ?? null);
          break;
        case 'wolVisible':
          this.instance.setVisible(change.currentValue);
          break;
        case 'wolWeight':
          this.instance.setWeight(change.currentValue);
          break;
        case 'wolZIndex':
          this.instance.setZIndex(change.currentValue);
          break;
        case 'wolVariables':
          this.instance.updateStyleVariables(change.currentValue);
          break;
      }
    }
  }

  /**
   * Get the underlying OpenLayers Heatmap instance
   * @returns The underlying OpenLayers Heatmap instance
   */
  getInstance(): Heatmap<FeatureLike> | undefined {
    return this.instance;
  }
}
