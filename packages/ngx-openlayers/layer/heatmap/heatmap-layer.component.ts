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
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { WolProperties, WolSafeAny } from '@workletjs/ngx-openlayers/core/types';
import { useLayerHostRef } from '@workletjs/ngx-openlayers/layer/layer';
import { Extent } from 'ol/extent';
import { EventsKey } from 'ol/events';
import { Geometry } from 'ol/geom';
import { ObjectEvent } from 'ol/Object';
import { unByKey } from 'ol/Observable';
import { BooleanExpression, NumberExpression } from 'ol/style/flat';
import Feature, { FeatureLike } from 'ol/Feature';
import BaseEvent from 'ol/events/Event';
import RenderEvent from 'ol/render/Event';
import Heatmap, { WeightExpression } from 'ol/layer/Heatmap';
import VectorSource from 'ol/source/Vector';

@Component({
  selector: 'wol-heatmap-layer',
  exportAs: 'wolHeatmapLayer',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolHeatmapLayerComponent implements OnChanges {
  readonly wolClassName = input<string>();
  readonly wolOpacity = model<number>();
  readonly wolVisible = model<boolean>();
  readonly wolExtent = model<Extent>();
  readonly wolZIndex = model<number>();
  readonly wolMinResolution = model<number>();
  readonly wolMaxResolution = model<number>();
  readonly wolMinZoom = model<number>();
  readonly wolMaxZoom = model<number>();
  readonly wolGradient = model<string[]>();
  readonly wolRadius = model<NumberExpression>();
  readonly wolBlur = model<NumberExpression>();
  readonly wolWeight = input<WeightExpression>();
  readonly wolFilter = input<BooleanExpression>();
  readonly wolVariables = input<Record<string, number | number[] | string | boolean>>();
  readonly wolSource = model<VectorSource<Feature<Geometry>>>();
  readonly wolProperties = input<WolProperties>();

  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
  readonly wolPostRender = output<RenderEvent>();
  readonly wolPreRender = output<RenderEvent>();
  readonly wolPropertyChange = output<ObjectEvent>();
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
