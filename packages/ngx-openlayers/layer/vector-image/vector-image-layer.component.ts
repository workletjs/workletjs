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
import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { useLayerHostRef } from '@workletjs/ngx-openlayers/layer/layer';
import { Extent } from 'ol/extent';
import { EventsKey } from 'ol/events';
import { ObjectEvent } from 'ol/Object';
import { unByKey } from 'ol/Observable';
import { OrderFunction } from 'ol/render';
import { FlatStyleLike } from 'ol/style/flat';
import { StyleLike } from 'ol/style/Style';
import { BackgroundColor } from 'ol/layer/Base';
import Map from 'ol/Map';
import BaseEvent from 'ol/events/Event';
import RenderEvent from 'ol/render/Event';
import VectorSource from 'ol/source/Vector';
import VectorImageLayer from 'ol/layer/VectorImage';

@Component({
  selector: 'wol-vector-image-layer',
  exportAs: 'wolVectorImageLayer',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolVectorImageLayerComponent implements OnChanges {
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
  readonly wolImageRatio = input<number>();
  readonly wolProperties = input<WolProperties>();

  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
  readonly wolPostRender = output<RenderEvent>();
  readonly wolPreRender = output<RenderEvent>();
  readonly wolPropertyChange = output<ObjectEvent>();
  readonly wolSourceReady = output<BaseEvent>();

  private instance?: VectorImageLayer;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useLayerHostRef<VectorImageLayer>('VectorImageLayer');
    const eventsKey: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const vectorImageLayer = new VectorImageLayer({
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
        imageRatio: this.wolImageRatio(),
        properties: this.wolProperties(),
      });

      eventsKey['change'] = vectorImageLayer.on('change', (event) => this.wolChange.emit(event));

      eventsKey['change:extent'] = vectorImageLayer.on('change:extent', () =>
        this.wolExtent.set(vectorImageLayer.getExtent()),
      );

      eventsKey['change:maxResolution'] = vectorImageLayer.on('change:maxResolution', () =>
        this.wolMaxResolution.set(vectorImageLayer.getMaxResolution()),
      );

      eventsKey['change:maxZoom'] = vectorImageLayer.on('change:maxZoom', () =>
        this.wolMaxZoom.set(vectorImageLayer.getMaxZoom()),
      );

      eventsKey['change:minResolution'] = vectorImageLayer.on('change:minResolution', () =>
        this.wolMinResolution.set(vectorImageLayer.getMinResolution()),
      );

      eventsKey['change:minZoom'] = vectorImageLayer.on('change:minZoom', () =>
        this.wolMinZoom.set(vectorImageLayer.getMinZoom()),
      );

      eventsKey['change:opacity'] = vectorImageLayer.on('change:opacity', () =>
        this.wolOpacity.set(vectorImageLayer.getOpacity()),
      );

      eventsKey['change:source'] = vectorImageLayer.on('change:source', () =>
        this.wolSource.set(vectorImageLayer.getSource() ?? undefined),
      );

      eventsKey['change:visible'] = vectorImageLayer.on('change:visible', () =>
        this.wolVisible.set(vectorImageLayer.getVisible()),
      );

      eventsKey['change:zIndex'] = vectorImageLayer.on('change:zIndex', () =>
        this.wolZIndex.set(vectorImageLayer.getZIndex() ?? 0),
      );

      eventsKey['error'] = vectorImageLayer.on('error', (event) => this.wolError.emit(event));

      eventsKey['postrender'] = vectorImageLayer.on('postrender', (event) =>
        this.wolPostRender.emit(event),
      );

      eventsKey['prerender'] = vectorImageLayer.on('prerender', (event) =>
        this.wolPreRender.emit(event),
      );

      eventsKey['propertychange'] = vectorImageLayer.on('propertychange', (event) =>
        this.wolPropertyChange.emit(event),
      );

      eventsKey['sourceready'] = vectorImageLayer.on('sourceready', (event) =>
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
        hostRef.addLayer(vectorImageLayer);
      });

      this.instance = vectorImageLayer;
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
   * Get the underlying OpenLayers VectorImageLayer instance.
   * @returns The VectorImageLayer instance.
   */
  getInstance(): VectorImageLayer | undefined {
    return this.instance;
  }
}
