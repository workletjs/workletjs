import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  InjectOptions,
  OnChanges,
  SimpleChanges,
  ViewEncapsulation,
  afterNextRender,
  inject,
  input,
  model,
  output,
} from '@angular/core';

import Collection from 'ol/Collection';
import Map from 'ol/Map';
import { ObjectEvent } from 'ol/Object';
import { unByKey } from 'ol/Observable';
import OverviewMap from 'ol/control/OverviewMap';
import { EventsKey } from 'ol/events';
import BaseEvent from 'ol/events/Event';
import { Extent } from 'ol/extent';
import BaseLayer from 'ol/layer/Base';
import LayerGroup from 'ol/layer/Group';

import { WolOverviewMapControlComponent } from '@workletjs/ngx-openlayers/control/overview-map';
import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';

/**
 * Wraps an OpenLayers [LayerGroup](https://openlayers.org/en/latest/apidoc/module-ol_layer_Group-LayerGroup.html)
 * instance, a collection of layers that are handled together. A generic `change` event is triggered when the
 * group or its collection changes. Must be used inside a `wol-map`, `wol-overview-map-control`, or another
 * `wol-layer-group` component.
 *
 * @example
 * ```html
 * <wol-map>
 *   <wol-layer-group [wolOpacity]="0.8">
 *     <wol-tile-layer>...</wol-tile-layer>
 *   </wol-layer-group>
 * </wol-map>
 * ```
 *
 * @see https://openlayers.org/en/latest/apidoc/module-ol_layer_Group-LayerGroup.html
 */
@Component({
  selector: 'wol-layer-group',
  imports: [],
  template: `<ng-content />`,
  styles: ``,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolLayerGroupComponent implements OnChanges {
  /**
   * Opacity of the layer group, between `0` and `1`. Defaults to `1`.
   */
  readonly wolOpacity = model<number>();

  /**
   * Visibility of the layer group. Defaults to `true`.
   */
  readonly wolVisible = model<boolean>();

  /**
   * The bounding extent for layer rendering. The layer group will not be rendered outside of this
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
   * The minimum resolution (inclusive) at which this layer group will be visible.
   */
  readonly wolMinResolution = model<number>();

  /**
   * The maximum resolution (exclusive) below which this layer group will be visible.
   */
  readonly wolMaxResolution = model<number>();

  /**
   * The minimum view zoom level (exclusive) above which this layer group will be visible.
   */
  readonly wolMinZoom = model<number>();

  /**
   * The maximum view zoom level (inclusive) at which this layer group will be visible.
   */
  readonly wolMaxZoom = model<number>();

  /**
   * Child layers of the group.
   */
  readonly wolLayers = model<BaseLayer[] | Collection<BaseLayer>>();

  /**
   * Additional properties that will be set to the layer group instance.
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
   * Triggered when a property of the layer group is changed.
   */
  readonly wolPropertyChange = output<ObjectEvent>();

  private instance?: LayerGroup;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const host = useLayerGroupHostRef();
    const eventsKey: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const layerGroup = new LayerGroup({
        opacity: this.wolOpacity(),
        visible: this.wolVisible(),
        extent: this.wolExtent(),
        zIndex: this.wolZIndex(),
        minResolution: this.wolMinResolution(),
        maxResolution: this.wolMaxResolution(),
        minZoom: this.wolMinZoom(),
        maxZoom: this.wolMaxZoom(),
        layers: this.wolLayers(),
        properties: this.wolProperties(),
      });

      eventsKey['change'] = layerGroup.on('change', (event) => this.wolChange.emit(event));
      eventsKey['change:extent'] = layerGroup.on('change:extent', () =>
        this.wolExtent.set(layerGroup.getExtent()),
      );
      eventsKey['change:layers'] = layerGroup.on('change:layers', () =>
        this.wolLayers.set(layerGroup.getLayers()),
      );
      eventsKey['change:maxResolution'] = layerGroup.on('change:maxResolution', () =>
        this.wolMaxResolution.set(layerGroup.getMaxResolution()),
      );

      eventsKey['change:maxZoom'] = layerGroup.on('change:maxZoom', () =>
        this.wolMaxZoom.set(layerGroup.getMaxZoom()),
      );

      eventsKey['change:minResolution'] = layerGroup.on('change:minResolution', () =>
        this.wolMinResolution.set(layerGroup.getMinResolution()),
      );

      eventsKey['change:minZoom'] = layerGroup.on('change:minZoom', () =>
        this.wolMinZoom.set(layerGroup.getMinZoom()),
      );
      eventsKey['change:opacity'] = layerGroup.on('change:opacity', () =>
        this.wolOpacity.set(layerGroup.getOpacity()),
      );
      eventsKey['change:visible'] = layerGroup.on('change:visible', () =>
        this.wolVisible.set(layerGroup.getVisible()),
      );
      eventsKey['change:zIndex'] = layerGroup.on('change:zIndex', () =>
        this.wolZIndex.set(layerGroup.getZIndex()),
      );
      eventsKey['error'] = layerGroup.on('error', (event) => this.wolError.emit(event));
      eventsKey['propertychange'] = layerGroup.on('propertychange', (event) =>
        this.wolPropertyChange.emit(event),
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
        host.addLayer(layerGroup);
      });

      this.instance = layerGroup;
    });

    destroyRef.onDestroy(() => {
      if (this.instance) {
        unByKey(Object.values(eventsKey));
        host.removeLayer(this.instance);
        this.instance = undefined;
      }
    });
  }

  /**
   * Respond to input changes.
   * @param changes The changed inputs
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
        case 'wolLayers':
          this.instance.setLayers(this.wrapLayers(change.currentValue));
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
          this.instance.setProperties(change.currentValue, true);
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
   * Get the OpenLayers LayerGroup instance.
   * @returns The OpenLayers LayerGroup instance
   */
  getInstance(): LayerGroup | undefined {
    return this.instance;
  }

  /**
   * Wrap layers in a Collection if necessary.
   * @param layers The layers to wrap
   * @returns The layers as a Collection
   */
  private wrapLayers(
    layers: BaseLayer[] | Collection<BaseLayer> | undefined,
  ): Collection<BaseLayer> {
    if (layers instanceof Collection) {
      return layers;
    } else {
      return new Collection(layers ?? []);
    }
  }
}

export interface LayerGroupHostRef {
  addLayer: (layer: LayerGroup) => void;
  removeLayer: (layer: LayerGroup) => LayerGroup | undefined;
  getInstance: () => Map | OverviewMap | LayerGroup | undefined;
}

export function useLayerGroupHostRef(): LayerGroupHostRef {
  const options: InjectOptions = { host: true, optional: true };
  const mapHost = inject(WolMapComponent, options);
  const overviewMap = inject(WolOverviewMapControlComponent, options);
  const layerGroupHost = inject(WolLayerGroupComponent, { ...options, skipSelf: true });

  if (layerGroupHost) {
    return {
      addLayer: (layer) => {
        layerGroupHost.getInstance()?.getLayers().push(layer);
      },
      removeLayer: (layer) => {
        return layerGroupHost.getInstance()?.getLayers().remove(layer) as typeof layer;
      },
      getInstance: () => layerGroupHost.getInstance(),
    };
  }

  if (overviewMap) {
    return {
      addLayer: (layer) => {
        overviewMap.getInstance()?.getOverviewMap().getLayers().push(layer);
      },
      removeLayer: (layer) => {
        return overviewMap.getInstance()?.getOverviewMap().getLayers().remove(layer) as
          | LayerGroup
          | undefined;
      },
      getInstance: () => overviewMap.getInstance(),
    };
  }

  if (mapHost) {
    return {
      addLayer: (layer) => {
        mapHost.getInstance()?.addLayer(layer);
      },
      removeLayer: (layer) => {
        return mapHost.getInstance()?.removeLayer(layer) as typeof layer;
      },
      getInstance: () => mapHost.getInstance(),
    };
  }

  throw new Error(
    `No LayerGroup host found. Please wrap the LayerGroup component in a Map, OverviewMap or LayerGroup component.`,
  );
}
