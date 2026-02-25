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
  output,
} from '@angular/core';

import MapEvent from 'ol/MapEvent';
import { ObjectEvent } from 'ol/Object';
import { unByKey } from 'ol/Observable';
import ZoomSlider from 'ol/control/ZoomSlider';
import { EventsKey } from 'ol/events';
import BaseEvent from 'ol/events/Event';

import { useControlHostRef } from '@workletjs/ngx-openlayers/control/control';
import { WolProperties } from '@workletjs/ngx-openlayers/core/types';

@Component({
  selector: 'wol-zoom-slider-control',
  exportAs: 'wolZoomSliderControl',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolZoomSliderControlComponent implements OnChanges {
  readonly wolClassName = input<string>();
  readonly wolDuration = input<number>();
  readonly wolRender = input<(event: MapEvent) => void>();
  readonly wolTarget = input<HTMLElement | string>();
  readonly wolProperties = input<WolProperties>();

  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
  readonly wolPropertyChange = output<ObjectEvent>();

  private instance?: ZoomSlider;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useControlHostRef<ZoomSlider>('ZoomSlider');
    const eventsKeyMap: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const zoomSlider = new ZoomSlider({
        className: this.wolClassName(),
        duration: this.wolDuration(),
        render: this.wolRender(),
        target: this.wolTarget(),
      });

      if (this.wolProperties()) {
        zoomSlider.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKeyMap['change'] = zoomSlider.on('change', (event) => this.wolChange.emit(event));

      eventsKeyMap['error'] = zoomSlider.on('error', (event) => this.wolError.emit(event));

      eventsKeyMap['propertychange'] = zoomSlider.on('propertychange', (event) =>
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
        hostRef.addControl(zoomSlider);
      });

      this.instance = zoomSlider;
    });

    destroyRef.onDestroy(() => {
      if (this.instance) {
        unByKey(Object.values(eventsKeyMap));
        hostRef.removeControl(this.instance);
        this.instance.dispose();
        this.instance = undefined;
      }
    });
  }

  /**
   * Respond to input changes.
   * @param changes The changed inputs
   * @internal
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (!this.instance) {
      return;
    }

    for (const [key, change] of Object.entries(changes)) {
      switch (key) {
        case 'wolProperties':
          this.instance.setProperties(change.currentValue ?? {});
          break;
        case 'wolTarget':
          this.instance.setTarget(change.currentValue);
          break;
      }
    }
  }

  /**
   * Get the underlying OpenLayers ZoomSlider instance.
   * @returns The ZoomSlider instance
   */
  getInstance(): ZoomSlider | undefined {
    return this.instance;
  }
}
