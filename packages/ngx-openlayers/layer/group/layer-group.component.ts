import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  InjectOptions,
  input,
  model,
  OnChanges,
  output,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { Extent } from 'ol/extent';
import { ObjectEvent } from 'ol/Object';
import { EventsKey } from 'ol/events';
import { unByKey } from 'ol/Observable';
import Map from 'ol/Map';
import Collection from 'ol/Collection';
import BaseEvent from 'ol/events/Event';
import BaseLayer from 'ol/layer/Base';
import LayerGroup from 'ol/layer/Group';

@Component({
  selector: 'wol-layer-group',
  imports: [],
  template: `<ng-content />`,
  styles: ``,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolLayerGroupComponent implements OnChanges {
  readonly wolOpacity = model<number>();
  readonly wolVisible = model<boolean>();
  readonly wolExtent = model<Extent>();
  readonly wolZIndex = model<number>();
  readonly wolMinResolution = model<number>();
  readonly wolMaxResolution = model<number>();
  readonly wolMinZoom = model<number>();
  readonly wolMaxZoom = model<number>();
  readonly wolLayers = model<BaseLayer[] | Collection<BaseLayer>>();
  readonly wolProperties = input<WolProperties>();

  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
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
          this.instance.setLayers(change.currentValue);
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
}

export interface LayerGroupHostRef {
  addLayer: (layer: LayerGroup) => void;
  removeLayer: (layer: LayerGroup) => LayerGroup | undefined;
  getInstance: () => Map | LayerGroup | undefined;
}

export function useLayerGroupHostRef(): LayerGroupHostRef {
  const options: InjectOptions = { host: true, optional: true };
  const mapHost = inject(WolMapComponent, options);
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
    `No LayerGroup host found. Please wrap the LayerGroup component in a Map or LayerGroup component.`,
  );
}
