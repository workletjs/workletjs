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

import { ObjectEvent } from 'ol/Object';
import { unByKey } from 'ol/Observable';
import { EventsKey } from 'ol/events';
import BaseEvent from 'ol/events/Event';
import { Extent } from 'ol/extent';
import Graticule from 'ol/layer/Graticule';
import RenderEvent from 'ol/render/Event';
import Stroke from 'ol/style/Stroke';
import Text from 'ol/style/Text';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { useLayerHostRef } from '@workletjs/ngx-openlayers/layer/layer';

/**
 * Wraps an OpenLayers [Graticule](https://openlayers.org/en/latest/apidoc/module-ol_layer_Graticule-Graticule.html)
 * layer, which renders a coordinate grid for EPSG:4326. Note that the view projection must define both
 * `extent` and `worldExtent`.
 *
 * @example
 * ```html
 * <wol-map>
 *   <wol-graticule-layer [wolShowLabels]="true"></wol-graticule-layer>
 * </wol-map>
 * ```
 *
 * @see https://openlayers.org/en/latest/apidoc/module-ol_layer_Graticule-Graticule.html
 */
@Component({
  selector: 'wol-graticule-layer',
  exportAs: 'wolGraticuleLayer',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolGraticuleLayerComponent implements OnChanges {
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
   * The maximum number of meridians and parallels from the center of the map. A value of `100`
   * renders at most 200 meridians and 200 parallels. Increase this value for non-conformal
   * projections. Defaults to `100`.
   */
  readonly wolMaxLines = input<number>();

  /**
   * The stroke style for drawing the graticule lines. Defaults to a semi-transparent black stroke
   * (`rgba(0, 0, 0, 0.2)`).
   */
  readonly wolStrokeStyle = input<Stroke>();

  /**
   * The target size of the graticule cells, in pixels. Defaults to `100`.
   */
  readonly wolTargetSize = input<number>();

  /**
   * Whether to render a label with the respective latitude/longitude for each graticule line.
   * Defaults to `false`.
   */
  readonly wolShowLabels = input<boolean>();

  /**
   * Label formatter for longitudes. Called with the longitude in degrees and should return the
   * formatted label string. By default labels are formatted as degrees, minutes, seconds and
   * hemisphere.
   */
  readonly wolLonLabelFormatter = input<(lon: number) => string>();

  /**
   * Label formatter for latitudes. Called with the latitude in degrees and should return the
   * formatted label string. By default labels are formatted as degrees, minutes, seconds and
   * hemisphere.
   */
  readonly wolLatLabelFormatter = input<(lat: number) => string>();

  /**
   * Longitude label position in fractions (`0`..`1`) of view extent. `0` means at the bottom of
   * the viewport, `1` means at the top. Defaults to `0`.
   */
  readonly wolLonLabelPosition = input<number>();

  /**
   * Latitude label position in fractions (`0`..`1`) of view extent. `0` means at the left of the
   * viewport, `1` means at the right. Defaults to `1`.
   */
  readonly wolLatLabelPosition = input<number>();

  /**
   * Longitude label text style. When not provided a default style with `textBaseline: 'bottom'`
   * is used.
   */
  readonly wolLonLabelStyle = input<Text>();

  /**
   * Latitude label text style. When not provided a default style with `textAlign: 'end'` is used.
   */
  readonly wolLatLabelStyle = input<Text>();

  /**
   * Intervals in degrees for the graticule lines, in descending order. Defaults to a set covering
   * from 90° down to 1/3600°. Example to limit to 30° and 10° intervals: `[30, 10]`.
   */
  readonly wolIntervals = input<number[]>();

  /**
   * Whether to repeat the graticule horizontally. Defaults to `true`.
   */
  readonly wolWrapX = input<boolean>();

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

  private instance?: Graticule;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useLayerHostRef<Graticule>('Graticule');
    const eventsKey: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const graticuleLayer = new Graticule({
        className: this.wolClassName(),
        opacity: this.wolOpacity(),
        visible: this.wolVisible(),
        extent: this.wolExtent(),
        zIndex: this.wolZIndex(),
        minResolution: this.wolMinResolution(),
        maxResolution: this.wolMaxResolution(),
        minZoom: this.wolMinZoom(),
        maxZoom: this.wolMaxZoom(),
        maxLines: this.wolMaxLines(),
        strokeStyle: this.wolStrokeStyle(),
        targetSize: this.wolTargetSize(),
        showLabels: this.wolShowLabels(),
        lonLabelFormatter: this.wolLonLabelFormatter(),
        latLabelFormatter: this.wolLatLabelFormatter(),
        lonLabelPosition: this.wolLonLabelPosition(),
        latLabelPosition: this.wolLatLabelPosition(),
        lonLabelStyle: this.wolLonLabelStyle(),
        latLabelStyle: this.wolLatLabelStyle(),
        intervals: this.wolIntervals(),
        wrapX: this.wolWrapX(),
        properties: this.wolProperties(),
      });

      eventsKey['change'] = graticuleLayer.on('change', (event) => this.wolChange.emit(event));

      eventsKey['change:extent'] = graticuleLayer.on('change:extent', () =>
        this.wolExtent.set(graticuleLayer.getExtent()),
      );

      eventsKey['change:maxResolution'] = graticuleLayer.on('change:maxResolution', () =>
        this.wolMaxResolution.set(graticuleLayer.getMaxResolution()),
      );

      eventsKey['change:maxZoom'] = graticuleLayer.on('change:maxZoom', () =>
        this.wolMaxZoom.set(graticuleLayer.getMaxZoom()),
      );

      eventsKey['change:minResolution'] = graticuleLayer.on('change:minResolution', () =>
        this.wolMinResolution.set(graticuleLayer.getMinResolution()),
      );

      eventsKey['change:minZoom'] = graticuleLayer.on('change:minZoom', () =>
        this.wolMinZoom.set(graticuleLayer.getMinZoom()),
      );

      eventsKey['change:opacity'] = graticuleLayer.on('change:opacity', () =>
        this.wolOpacity.set(graticuleLayer.getOpacity()),
      );

      eventsKey['change:visible'] = graticuleLayer.on('change:visible', () =>
        this.wolVisible.set(graticuleLayer.getVisible()),
      );

      eventsKey['change:zIndex'] = graticuleLayer.on('change:zIndex', () =>
        this.wolZIndex.set(graticuleLayer.getZIndex()),
      );

      eventsKey['error'] = graticuleLayer.on('error', (event) => this.wolError.emit(event));

      eventsKey['postrender'] = graticuleLayer.on('postrender', (event) =>
        this.wolPostRender.emit(event),
      );

      eventsKey['prerender'] = graticuleLayer.on('prerender', (event) =>
        this.wolPreRender.emit(event),
      );

      eventsKey['propertychange'] = graticuleLayer.on('propertychange', (event) =>
        this.wolPropertyChange.emit(event),
      );

      eventsKey['sourceready'] = graticuleLayer.on('sourceready', (event) =>
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
        hostRef.addLayer(graticuleLayer);
      });

      this.instance = graticuleLayer;
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
        case 'wolExtent':
          this.instance.setExtent(change.currentValue);
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
          this.instance.setProperties(change.currentValue ?? {});
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
   * Get the underlying Graticule instance.
   * @returns The Graticule instance or undefined if not yet created.
   */
  getInstance(): Graticule | undefined {
    return this.instance;
  }
}
