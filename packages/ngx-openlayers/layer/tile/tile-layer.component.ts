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
import { BackgroundColor } from 'ol/layer/Base';
import { ObjectEvent } from 'ol/Object';
import { EventsKey } from 'ol/events';
import { unByKey } from 'ol/Observable';
import BaseEvent from 'ol/events/Event';
import Map from 'ol/Map';
import RenderEvent from 'ol/render/Event';
import TileSource from 'ol/source/Tile';
import TileLayer from 'ol/layer/Tile';

@Component({
  selector: 'wol-tile-layer',
  imports: [],
  template: `<ng-content />`,
  styles: ``,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolTileLayerComponent implements OnChanges {
  readonly wolClassName = input<string>();
  readonly wolOpacity = model<number>();
  readonly wolVisible = model<boolean>();
  readonly wolExtent = model<Extent>();
  readonly wolZIndex = model<number>();
  readonly wolMinResolution = model<number>();
  readonly wolMaxResolution = model<number>();
  readonly wolMinZoom = model<number>();
  readonly wolMaxZoom = model<number>();
  readonly wolPreload = model<number>();
  readonly wolSource = model<TileSource>();
  readonly wolMap = input<Map>();
  readonly wolBackground = input<BackgroundColor>();
  readonly wolUseInterimTilesOnError = model<boolean>();
  readonly wolProperties = input<WolProperties>();
  readonly wolCacheSize = input<number>();

  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
  readonly wolPostRender = output<RenderEvent>();
  readonly wolPreRender = output<RenderEvent>();
  readonly wolPropertyChange = output<ObjectEvent>();
  readonly wolSourceReady = output<BaseEvent>();

  private instance?: TileLayer;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const host = useLayerHostRef<TileLayer>('TileLayer');
    const eventsKey: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const tileLayer = new TileLayer({
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
        source: this.wolSource(),
        map: this.wolMap(),
        background: this.wolBackground(),
        useInterimTilesOnError: this.wolUseInterimTilesOnError(),
        properties: this.wolProperties(),
        cacheSize: this.wolCacheSize(),
      });

      eventsKey['change'] = tileLayer.on('change', (event) => this.wolChange.emit(event));

      eventsKey['change:extent'] = tileLayer.on('change:extent', () =>
        this.wolExtent.set(tileLayer.getExtent()),
      );

      eventsKey['change:maxResolution'] = tileLayer.on('change:maxResolution', () =>
        this.wolMaxResolution.set(tileLayer.getMaxResolution()),
      );

      eventsKey['change:maxZoom'] = tileLayer.on('change:maxZoom', () =>
        this.wolMaxZoom.set(tileLayer.getMaxZoom()),
      );

      eventsKey['change:minResolution'] = tileLayer.on('change:minResolution', () =>
        this.wolMinResolution.set(tileLayer.getMinResolution()),
      );

      eventsKey['change:minZoom'] = tileLayer.on('change:minZoom', () =>
        this.wolMinZoom.set(tileLayer.getMinZoom()),
      );

      eventsKey['change:opacity'] = tileLayer.on('change:opacity', () =>
        this.wolOpacity.set(tileLayer.getOpacity()),
      );

      eventsKey['change:preload'] = tileLayer.on('change:preload', () =>
        this.wolPreload.set(tileLayer.getPreload()),
      );

      eventsKey['change:source'] = tileLayer.on('change:source', () =>
        this.wolSource.set(tileLayer.getSource() ?? undefined),
      );

      eventsKey['change:useInterimTilesOnError'] = tileLayer.on(
        'change:useInterimTilesOnError',
        () => this.wolUseInterimTilesOnError.set(tileLayer.getUseInterimTilesOnError()),
      );

      eventsKey['change:visible'] = tileLayer.on('change:visible', () =>
        this.wolVisible.set(tileLayer.getVisible()),
      );

      eventsKey['change:zIndex'] = tileLayer.on('change:zIndex', () =>
        this.wolZIndex.set(tileLayer.getZIndex()),
      );

      eventsKey['error'] = tileLayer.on('error', (event) => this.wolError.emit(event));

      eventsKey['postrender'] = tileLayer.on('postrender', (event) =>
        this.wolPostRender.emit(event),
      );

      eventsKey['prerender'] = tileLayer.on('prerender', (event) => this.wolPreRender.emit(event));

      eventsKey['propertychange'] = tileLayer.on('propertychange', (event) =>
        this.wolPropertyChange.emit(event),
      );

      eventsKey['sourceready'] = tileLayer.on('sourceready', (event) =>
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
        host.addLayer(tileLayer);
      });

      this.instance = tileLayer;
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
   * @param changes The changes object containing the changed inputs.
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
          this.instance.setSource(change.currentValue);
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
   * Get the underlying OpenLayers TileLayer instance
   * @returns The underlying OpenLayers TileLayer instance
   */
  getInstance(): TileLayer | undefined {
    return this.instance;
  }
}
