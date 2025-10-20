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
import Map from 'ol/Map';
import BaseEvent from 'ol/events/Event';
import RenderEvent from 'ol/render/Event';
import WebGLTileLayer, { SourceType, Style } from 'ol/layer/WebGLTile';

@Component({
  selector: 'wol-webgl-tile-layer',
  imports: [],
  template: `<ng-content />`,
  styles: ``,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolWebGLTileLayerComponent implements OnChanges {
  readonly wolStyle = input<Style>();

  /**
   * Variables used by the layer style.
   */
  readonly wolVariables = input<Record<string, number>>();
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
  readonly wolSource = model<SourceType>();
  readonly wolSources = input<
    SourceType[] | ((extent: Extent, resolution: number) => SourceType[])
  >();
  readonly wolMap = input<Map>();
  readonly wolUseInterimTilesOnError = model<boolean>();
  readonly wolCacheSize = input<number>();
  readonly wolProperties = input<WolProperties>();

  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
  readonly wolPostRender = output<RenderEvent>();
  readonly wolPreRender = output<RenderEvent>();
  readonly wolPropertyChange = output<ObjectEvent>();
  readonly wolSourceReady = output<BaseEvent>();

  private instance?: WebGLTileLayer;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useLayerHostRef<WebGLTileLayer>('WebGLTileLayer');
    const eventsKey: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const webglTileLayer = new WebGLTileLayer({
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
        source: this.wolSource(),
        sources: this.wolSources(),
        map: this.wolMap(),
        useInterimTilesOnError: this.wolUseInterimTilesOnError(),
        cacheSize: this.wolCacheSize(),
        properties: this.wolProperties(),
      });

      if (this.wolVariables()) {
        webglTileLayer.updateStyleVariables(this.wolVariables() ?? {});
      }

      eventsKey['change'] = webglTileLayer.on('change', (evt) => this.wolChange.emit(evt));

      eventsKey['change:extent'] = webglTileLayer.on('change:extent', () =>
        this.wolExtent.set(webglTileLayer.getExtent()),
      );

      eventsKey['change:maxResolution'] = webglTileLayer.on('change:maxResolution', () =>
        this.wolMaxResolution.set(webglTileLayer.getMaxResolution()),
      );

      eventsKey['change:maxZoom'] = webglTileLayer.on('change:maxZoom', () =>
        this.wolMaxZoom.set(webglTileLayer.getMaxZoom()),
      );

      eventsKey['change:minResolution'] = webglTileLayer.on('change:minResolution', () =>
        this.wolMinResolution.set(webglTileLayer.getMinResolution()),
      );

      eventsKey['change:minZoom'] = webglTileLayer.on('change:minZoom', () =>
        this.wolMinZoom.set(webglTileLayer.getMinZoom()),
      );

      eventsKey['change:opacity'] = webglTileLayer.on('change:opacity', () =>
        this.wolOpacity.set(webglTileLayer.getOpacity()),
      );

      eventsKey['change:preload'] = webglTileLayer.on('change:preload', () =>
        this.wolPreload.set(webglTileLayer.getPreload()),
      );

      eventsKey['change:source'] = webglTileLayer.on('change:source', () =>
        this.wolSource.set(webglTileLayer.getSource() ?? undefined),
      );

      eventsKey['change:useInterimTilesOnError'] = webglTileLayer.on(
        'change:useInterimTilesOnError',
        () => this.wolUseInterimTilesOnError.set(webglTileLayer.getUseInterimTilesOnError()),
      );

      eventsKey['change:visible'] = webglTileLayer.on('change:visible', () =>
        this.wolVisible.set(webglTileLayer.getVisible()),
      );

      eventsKey['change:zIndex'] = webglTileLayer.on('change:zIndex', () =>
        this.wolZIndex.set(webglTileLayer.getZIndex()),
      );

      eventsKey['error'] = webglTileLayer.on('error', (evt) => this.wolError.emit(evt));

      eventsKey['postrender'] = webglTileLayer.on('postrender', (evt) =>
        this.wolPostRender.emit(evt),
      );

      eventsKey['prerender'] = webglTileLayer.on('prerender', (evt) => this.wolPreRender.emit(evt));

      eventsKey['propertychange'] = webglTileLayer.on('propertychange', (evt) =>
        this.wolPropertyChange.emit(evt),
      );

      eventsKey['sourceready'] = webglTileLayer.on('sourceready', (evt) =>
        this.wolSourceReady.emit(evt),
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
        hostRef.addLayer(webglTileLayer);
      });

      this.instance = webglTileLayer;
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
        case 'wolVariables':
          this.instance.updateStyleVariables(change.currentValue ?? {});
          break;
      }
    }
  }

  /**
   * Get the underlying WebGLTileLayer instance.
   * @returns The WebGLTileLayer instance.
   */
  getInstance(): WebGLTileLayer | undefined {
    return this.instance;
  }
}
