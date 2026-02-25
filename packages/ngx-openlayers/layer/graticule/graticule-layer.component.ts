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

@Component({
  selector: 'wol-graticule-layer',
  exportAs: 'wolGraticuleLayer',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolGraticuleLayerComponent implements OnChanges {
  readonly wolClassName = input<string>();
  readonly wolOpacity = model<number>();
  readonly wolVisible = model<boolean>();
  readonly wolExtent = model<Extent>();
  readonly wolZIndex = model<number>();
  readonly wolMinResolution = model<number>();
  readonly wolMaxResolution = model<number>();
  readonly wolMinZoom = model<number>();
  readonly wolMaxZoom = model<number>();
  readonly wolMaxLines = input<number>();
  readonly wolStrokeStyle = input<Stroke>();
  readonly wolTargetSize = input<number>();
  readonly wolShowLabels = input<boolean>();
  readonly wolLonLabelFormatter = input<(lon: number) => string>();
  readonly wolLatLabelFormatter = input<(lat: number) => string>();
  readonly wolLonLabelPosition = input<number>();
  readonly wolLatLabelPosition = input<number>();
  readonly wolLonLabelStyle = input<Text>();
  readonly wolLatLabelStyle = input<Text>();
  readonly wolIntervals = input<number[]>();
  readonly wolWrapX = input<boolean>();
  readonly wolProperties = input<WolProperties>();

  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
  readonly wolPostRender = output<RenderEvent>();
  readonly wolPreRender = output<RenderEvent>();
  readonly wolPropertyChange = output<ObjectEvent>();
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
