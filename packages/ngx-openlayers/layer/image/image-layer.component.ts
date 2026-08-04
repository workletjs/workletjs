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
import ImageLayer from 'ol/layer/Image';
import RenderEvent from 'ol/render/Event';
import ImageSource from 'ol/source/Image';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { useLayerHostRef } from '@workletjs/ngx-openlayers/layer/layer';

/**
 * Wraps an OpenLayers [ImageLayer](https://openlayers.org/en/latest/apidoc/module-ol_layer_Image-ImageLayer.html),
 * which renders server-side images available for arbitrary extents and resolutions.
 *
 * @example
 * ```html
 * <wol-map>
 *   <wol-image-layer [wolSource]="source"></wol-image-layer>
 * </wol-map>
 * ```
 *
 * @see https://openlayers.org/en/latest/apidoc/module-ol_layer_Image-ImageLayer.html
 */
@Component({
  selector: 'wol-image-layer',
  imports: [],
  template: `<ng-content />`,
  styles: ``,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolImageLayerComponent implements OnChanges {
  /**
   * A CSS class name to set to the layer element. Defaults to `'ol-layer'`.
   */
  readonly wolClassName = input<string>();

  /**
   * Opacity of the layer, between `0` and `1`. Defaults to `1`.
   */
  readonly wolOpacity = model<number>();

  /**
   * Visibility of the layer. Defaults to `true`.
   */
  readonly wolVisible = model<boolean>();

  /**
   * The bounding extent for layer rendering. The layer will not be rendered outside of this
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
   * The minimum resolution (inclusive) at which this layer will be visible.
   */
  readonly wolMinResolution = model<number>();

  /**
   * The maximum resolution (exclusive) below which this layer will be visible.
   */
  readonly wolMaxResolution = model<number>();

  /**
   * The minimum view zoom level (exclusive) above which this layer will be visible.
   */
  readonly wolMinZoom = model<number>();

  /**
   * The maximum view zoom level (inclusive) at which this layer will be visible.
   */
  readonly wolMaxZoom = model<number>();

  /**
   * Sets the layer as an overlay rendered on top of all other layers on a map. The map will not
   * manage this layer in its layers collection. Use `map.addLayer()` for managed layers.
   */
  readonly wolMap = input<Map>();

  /**
   * Source for this layer.
   */
  readonly wolSource = model<ImageSource>();

  /**
   * Background color for the layer. No background will be rendered when not specified.
   */
  readonly wolBackground = input<BackgroundColor>();

  /**
   * Additional properties that will be set to the layer instance.
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
   * Triggered after the layer is rendered.
   */
  readonly wolPostRender = output<RenderEvent>();

  /**
   * Triggered before the layer is rendered.
   */
  readonly wolPreRender = output<RenderEvent>();

  /**
   * Triggered when a property of the layer is changed.
   */
  readonly wolPropertyChange = output<ObjectEvent>();

  /**
   * Triggered when the layer source is ready.
   */
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
        background: this.wolBackground(),
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

      eventsKey['sourceready'] = imageLayer.on('sourceready', (event) =>
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
        case 'wolBackground':
          this.instance.setBackground(change.currentValue);
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
