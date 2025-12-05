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
import { BackgroundColor } from 'ol/layer/Base';
import { FlatStyleLike, StyleVariables } from 'ol/style/flat';
import BaseEvent from 'ol/events/Event';
import RenderEvent from 'ol/render/Event';
import VectorSource from 'ol/source/Vector';
import WebGLVectorLayer from 'ol/layer/WebGLVector';

@Component({
  selector: 'wol-webgl-vector-layer',
  exportAs: 'wolWebGLVectorLayer',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolWebGLVectorLayerComponent implements OnChanges {
  readonly wolClassName = input<string>();
  readonly wolOpacity = model<number>();
  readonly wolVisible = model<boolean>();
  readonly wolExtent = model<Extent>();
  readonly wolZIndex = model<number>();
  readonly wolMinResolution = model<number>();
  readonly wolMaxResolution = model<number>();
  readonly wolMinZoom = model<number>();
  readonly wolMaxZoom = model<number>();
  readonly wolSource = model<VectorSource>();
  readonly wolStyle = input.required<FlatStyleLike>();
  readonly wolVariables = input<StyleVariables>();
  readonly wolBackground = input<BackgroundColor>();
  readonly wolDisableHitDetection = input<boolean>();
  readonly wolProperties = input<WolProperties>();

  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
  readonly wolPostRender = output<RenderEvent>();
  readonly wolPreRender = output<RenderEvent>();
  readonly wolPropertyChange = output<ObjectEvent>();
  readonly wolSourceReady = output<BaseEvent>();

  private instance?: WebGLVectorLayer;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useLayerHostRef<WebGLVectorLayer>('WebGLVectorLayer');
    const eventsKey: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const webglVectorLayer = new WebGLVectorLayer({
        className: this.wolClassName(),
        opacity: this.wolOpacity(),
        visible: this.wolVisible(),
        extent: this.wolExtent(),
        zIndex: this.wolZIndex(),
        minResolution: this.wolMinResolution(),
        maxResolution: this.wolMaxResolution(),
        minZoom: this.wolMinZoom(),
        maxZoom: this.wolMaxZoom(),
        source: this.wolSource(),
        style: this.wolStyle(),
        variables: this.wolVariables(),
        background: this.wolBackground(),
        disableHitDetection: this.wolDisableHitDetection(),
        properties: this.wolProperties(),
      });

      eventsKey['change'] = webglVectorLayer.on('change', (event) => this.wolChange.emit(event));

      eventsKey['change:extent'] = webglVectorLayer.on('change:extent', () =>
        this.wolExtent.set(webglVectorLayer.getExtent()),
      );

      eventsKey['change:maxResolution'] = webglVectorLayer.on('change:maxResolution', () =>
        this.wolMaxResolution.set(webglVectorLayer.getMaxResolution()),
      );

      eventsKey['change:minResolution'] = webglVectorLayer.on('change:minResolution', () =>
        this.wolMinResolution.set(webglVectorLayer.getMinResolution()),
      );

      eventsKey['change:maxZoom'] = webglVectorLayer.on('change:maxZoom', () =>
        this.wolMaxZoom.set(webglVectorLayer.getMaxZoom()),
      );

      eventsKey['change:minZoom'] = webglVectorLayer.on('change:minZoom', () =>
        this.wolMinZoom.set(webglVectorLayer.getMinZoom()),
      );

      eventsKey['change:opacity'] = webglVectorLayer.on('change:opacity', () =>
        this.wolOpacity.set(webglVectorLayer.getOpacity()),
      );

      eventsKey['change:source'] = webglVectorLayer.on('change:source', () =>
        this.wolSource.set(webglVectorLayer.getSource() ?? undefined),
      );

      eventsKey['change:visible'] = webglVectorLayer.on('change:visible', () =>
        this.wolVisible.set(webglVectorLayer.getVisible()),
      );

      eventsKey['change:zIndex'] = webglVectorLayer.on('change:zIndex', () =>
        this.wolZIndex.set(webglVectorLayer.getZIndex() ?? 0),
      );

      eventsKey['error'] = webglVectorLayer.on('error', (event) => this.wolError.emit(event));

      eventsKey['postrender'] = webglVectorLayer.on('postrender', (event) =>
        this.wolPostRender.emit(event),
      );

      eventsKey['prerender'] = webglVectorLayer.on('prerender', (event) =>
        this.wolPreRender.emit(event),
      );

      eventsKey['propertychange'] = webglVectorLayer.on('propertychange', (event) =>
        this.wolPropertyChange.emit(event),
      );

      eventsKey['sourceready'] = webglVectorLayer.on('sourceready', (event) =>
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
        hostRef.addLayer(webglVectorLayer);
      });

      this.instance = webglVectorLayer;
    });

    destroyRef.onDestroy(() => {
      unByKey(Object.values(eventsKey));

      if (this.instance) {
        hostRef.removeLayer(this.instance);
        this.instance.dispose();
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
        case 'wolVariables':
          this.instance.updateStyleVariables(change.currentValue);
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
   * Get the underlying WebGLVectorLayer instance.
   * @returns The WebGLVectorLayer instance or undefined if not yet created.
   */
  getInstance(): WebGLVectorLayer | undefined {
    return this.instance;
  }
}
