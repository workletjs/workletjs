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
import VectorTileLayer, { VectorTileRenderType } from 'ol/layer/VectorTile';
import { OrderFunction } from 'ol/render';
import RenderEvent from 'ol/render/Event';
import VectorTileSource from 'ol/source/VectorTile';
import { StyleLike } from 'ol/style/Style';
import { FlatStyleLike } from 'ol/style/flat';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { useLayerHostRef } from '@workletjs/ngx-openlayers/layer/layer';

@Component({
  selector: 'wol-vector-tile-layer',
  exportAs: 'wolVectorTileLayer',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolVectorTileLayerComponent implements OnChanges {
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
  readonly wolRenderMode = input<VectorTileRenderType>();
  readonly wolSource = model<VectorTileSource>();
  readonly wolMap = input<Map>();
  readonly wolDeclutter = input<boolean | string | number>();
  readonly wolStyle = input<StyleLike | FlatStyleLike | null>();
  readonly wolBackground = input<BackgroundColor>();
  readonly wolUpdateWhileAnimating = input<boolean>();
  readonly wolUpdateWhileInteracting = input<boolean>();
  readonly wolPreload = model<number>();
  readonly wolUseInterimTilesOnError = model<boolean>();
  readonly wolProperties = input<WolProperties>();
  readonly wolCacheSize = input<number>();

  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
  readonly wolPostRender = output<RenderEvent>();
  readonly wolPreRender = output<RenderEvent>();
  readonly wolPropertyChange = output<ObjectEvent>();
  readonly wolSourceReady = output<BaseEvent>();

  private instance?: VectorTileLayer;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useLayerHostRef<VectorTileLayer>('VectorTileLayer');
    const eventsKey: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const vectorTileLayer = new VectorTileLayer({
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
        renderMode: this.wolRenderMode(),
        source: this.wolSource(),
        map: this.wolMap(),
        declutter: this.wolDeclutter(),
        style: this.wolStyle(),
        background: this.wolBackground(),
        updateWhileAnimating: this.wolUpdateWhileAnimating(),
        updateWhileInteracting: this.wolUpdateWhileInteracting(),
        preload: this.wolPreload(),
        useInterimTilesOnError: this.wolUseInterimTilesOnError(),
        properties: this.wolProperties(),
        cacheSize: this.wolCacheSize(),
      });

      eventsKey['change'] = vectorTileLayer.on('change', (event) => this.wolChange.emit(event));

      eventsKey['change:extent'] = vectorTileLayer.on('change:extent', () =>
        this.wolExtent.set(vectorTileLayer.getExtent()),
      );

      eventsKey['change:maxResolution'] = vectorTileLayer.on('change:maxResolution', () =>
        this.wolMaxResolution.set(vectorTileLayer.getMaxResolution()),
      );

      eventsKey['change:maxZoom'] = vectorTileLayer.on('change:maxZoom', () =>
        this.wolMaxZoom.set(vectorTileLayer.getMaxZoom()),
      );

      eventsKey['change:minResolution'] = vectorTileLayer.on('change:minResolution', () =>
        this.wolMinResolution.set(vectorTileLayer.getMinResolution()),
      );

      eventsKey['change:minZoom'] = vectorTileLayer.on('change:minZoom', () =>
        this.wolMinZoom.set(vectorTileLayer.getMinZoom()),
      );

      eventsKey['change:opacity'] = vectorTileLayer.on('change:opacity', () =>
        this.wolOpacity.set(vectorTileLayer.getOpacity()),
      );

      eventsKey['change:preload'] = vectorTileLayer.on('change:preload', () =>
        this.wolPreload.set(vectorTileLayer.getPreload()),
      );

      eventsKey['change:source'] = vectorTileLayer.on('change:source', () =>
        this.wolSource.set(vectorTileLayer.getSource() ?? undefined),
      );

      eventsKey['change:useInterimTilesOnError'] = vectorTileLayer.on(
        'change:useInterimTilesOnError',
        () => this.wolUseInterimTilesOnError.set(vectorTileLayer.getUseInterimTilesOnError()),
      );

      eventsKey['change:visible'] = vectorTileLayer.on('change:visible', () =>
        this.wolVisible.set(vectorTileLayer.getVisible()),
      );

      eventsKey['change:zIndex'] = vectorTileLayer.on('change:zIndex', () =>
        this.wolZIndex.set(vectorTileLayer.getZIndex()),
      );

      eventsKey['error'] = vectorTileLayer.on('error', (event) => this.wolError.emit(event));

      eventsKey['postrender'] = vectorTileLayer.on('postrender', (event) =>
        this.wolPostRender.emit(event),
      );

      eventsKey['prerender'] = vectorTileLayer.on('prerender', (event) =>
        this.wolPreRender.emit(event),
      );

      eventsKey['propertychange'] = vectorTileLayer.on('propertychange', (event) =>
        this.wolPropertyChange.emit(event),
      );

      eventsKey['sourceready'] = vectorTileLayer.on('sourceready', (event) =>
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
        hostRef.addLayer(vectorTileLayer);
      });

      this.instance = vectorTileLayer;
    });

    destroyRef.onDestroy(() => {
      if (this.instance) {
        unByKey(Object.values(eventsKey));
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
        case 'wolBackground':
          this.instance.setBackground(change.currentValue);
          break;
        case 'wolDeclutter':
          this.instance.setDeclutter(change.currentValue);
          break;
        case 'wolExtent':
          this.instance.setExtent(change.currentValue);
          break;
        case 'wolMap':
          this.instance.setMap(change.currentValue ?? null);
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
        case 'wolPreload':
          this.instance.setPreload(change.currentValue);
          break;
        case 'wolProperties':
          this.instance.setProperties(change.currentValue);
          break;
        case 'wolSource':
          this.instance.setSource(change.currentValue ?? null);
          break;
        case 'wolStyle':
          this.instance.setStyle(change.currentValue);
          break;
        case 'wolUseInterimTilesOnError':
          this.instance.setUseInterimTilesOnError(change.currentValue);
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
   * Get the underlying OpenLayers VectorTileLayer instance
   * @returns The underlying OpenLayers VectorTileLayer instance
   */
  getInstance(): VectorTileLayer | undefined {
    return this.instance;
  }
}
