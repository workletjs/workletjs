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
import { ObjectEvent } from 'ol/Object';
import { EventsKey } from 'ol/events';
import { unByKey } from 'ol/Observable';
import BaseEvent from 'ol/events/Event';
import ImageLayer from 'ol/layer/Image';
import Map from 'ol/Map';
import RenderEvent from 'ol/render/Event';
import ImageSource from 'ol/source/Image';

@Component({
  selector: 'wol-image-layer',
  imports: [],
  template: `<ng-content />`,
  styles: ``,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolImageLayerComponent implements OnChanges {
  readonly wolClassName = input<string>();
  readonly wolOpacity = model<number>();
  readonly wolVisible = model<boolean>();
  readonly wolExtent = model<Extent>();
  readonly wolZIndex = model<number>();
  readonly wolMinResolution = model<number>();
  readonly wolMaxResolution = model<number>();
  readonly wolMinZoom = model<number>();
  readonly wolMaxZoom = model<number>();
  readonly wolMap = input<Map>();
  readonly wolSource = model<ImageSource>();
  readonly wolProperties = input<WolProperties>();

  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
  readonly wolPostRender = output<RenderEvent>();
  readonly wolPreRender = output<RenderEvent>();
  readonly wolPropertyChange = output<ObjectEvent>();
  readonly wolSourceReady = output<BaseEvent>();

  private instance?: ImageLayer<ImageSource>;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const host = useLayerHostRef<ImageLayer<ImageSource>>('ImageLayer');
    const eventsKey: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const imageLayer = new ImageLayer({
        className: this.wolClassName(),
        opacity: this.wolOpacity(),
        visible: this.wolVisible(),
        extent: this.wolExtent(),
        zIndex: this.wolZIndex(),
        minResolution: this.wolMinResolution(),
        maxResolution: this.wolMaxResolution(),
        minZoom: this.wolMinZoom(),
        maxZoom: this.wolMaxZoom(),
        map: this.wolMap(),
        source: this.wolSource(),
        properties: this.wolProperties(),
      });

      eventsKey['change'] = imageLayer.on('change', (event) => this.wolChange.emit(event));

      eventsKey['change:extent'] = imageLayer.on('change:extent', () =>
        this.wolExtent.set(imageLayer.getExtent()),
      );

      eventsKey['change:maxResolution'] = imageLayer.on('change:maxResolution', () =>
        this.wolMaxResolution.set(imageLayer.getMaxResolution()),
      );

      eventsKey['change:minResolution'] = imageLayer.on('change:minResolution', () =>
        this.wolMinResolution.set(imageLayer.getMinResolution()),
      );

      eventsKey['change:maxZoom'] = imageLayer.on('change:maxZoom', () =>
        this.wolMaxZoom.set(imageLayer.getMaxZoom()),
      );
      eventsKey['change:minZoom'] = imageLayer.on('change:minZoom', () =>
        this.wolMinZoom.set(imageLayer.getMinZoom()),
      );

      eventsKey['change:opacity'] = imageLayer.on('change:opacity', () =>
        this.wolOpacity.set(imageLayer.getOpacity()),
      );

      eventsKey['change:source'] = imageLayer.on('change:source', () =>
        this.wolSource.set(imageLayer.getSource() ?? undefined),
      );

      eventsKey['change:visible'] = imageLayer.on('change:visible', () =>
        this.wolVisible.set(imageLayer.getVisible()),
      );

      eventsKey['change:zIndex'] = imageLayer.on('change:zIndex', () =>
        this.wolZIndex.set(imageLayer.getZIndex()),
      );

      eventsKey['error'] = imageLayer.on('error', (event) => this.wolError.emit(event));

      eventsKey['postrender'] = imageLayer.on('postrender', (event) =>
        this.wolPostRender.emit(event),
      );

      eventsKey['prerender'] = imageLayer.on('prerender', (event) => this.wolPreRender.emit(event));

      eventsKey['propertychange'] = imageLayer.on('propertychange', (event) =>
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
        host.addLayer(imageLayer);
      });

      this.instance = imageLayer;
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
   * Respond to input property changes.
   * @param changes The changes object containing the changed properties.
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
        case 'wolProperties':
          this.instance.setProperties(change.currentValue);
          break;
        case 'wolSource':
          this.instance.setSource(change.currentValue);
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
   * Get the underlying OpenLayers ImageLayer instance.
   * @returns The OpenLayers ImageLayer instance or `undefined` if not yet initialized.
   */
  getInstance(): ImageLayer<ImageSource> | undefined {
    return this.instance;
  }
}
