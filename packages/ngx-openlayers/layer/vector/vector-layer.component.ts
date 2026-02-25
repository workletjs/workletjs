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

@Component({
  selector: 'wol-vector-layer',
  exportAs: 'wolVectorLayer',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolVectorLayerComponent implements OnChanges {
  readonly wolClassName = input<string>();
  readonly wolOpacity = model<number>();
  readonly wolVisible = model<boolean>();
  readonly wolExtent = model<Extent>();
  readonly wolZIndex = model<number>();
  readonly wolMinResolution = model<number>();
  readonly wolMaxResolution = model<number>();
  readonly wolMinZoom = model<number>();
  readonly wolMaxZoom = model<number>();
  readonly wolRenderOrder = input<OrderFunction>();
  readonly wolRenderBuffer = input<number>();
  readonly wolSource = model<VectorSource>();
  readonly wolMap = input<Map>();
  readonly wolDeclutter = input<boolean | string | number>();
  readonly wolStyle = input<StyleLike | FlatStyleLike | null>();
  readonly wolBackground = input<BackgroundColor>();
  readonly wolUpdateWhileAnimating = input<boolean>();
  readonly wolUpdateWhileInteracting = input<boolean>();
  readonly wolProperties = input<WolProperties>();

  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
  readonly wolPostRender = output<RenderEvent>();
  readonly wolPreRender = output<RenderEvent>();
  readonly wolPropertyChange = output<ObjectEvent>();
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
   * Get the underlying VectorLayer instance.
   * @returns The VectorLayer instance or undefined if not yet created.
   */
  getInstance(): VectorLayer | undefined {
    return this.instance;
  }
}
