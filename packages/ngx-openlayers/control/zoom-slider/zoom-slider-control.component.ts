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

/**
 * Provides a slider for changing the map zoom across the view's available resolution range. See
 * [OpenLayers ZoomSlider](https://openlayers.org/en/latest/apidoc/module-ol_control_ZoomSlider-ZoomSlider.html)
 * .
 */
@Component({
  selector: 'wol-zoom-slider-control',
  exportAs: 'wolZoomSliderControl',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolZoomSliderControlComponent implements OnChanges {
  /**
   * CSS class for the slider. Defaults to `ol-zoomslider`. Read at creation.
   */
  readonly wolClassName = input<string>();
  /**
   * Duration of the animation when clicking the slider track, in milliseconds. Defaults to `200`
   * . Read at creation.
   */
  readonly wolDuration = input<number>();
  /**
   * Custom rendering callback that receives the map render event on an animation frame. It
   * replaces the default control renderer. Read at creation.
   */
  readonly wolRender = input<(event: MapEvent) => void>();
  /**
   * Element or element ID to host the control. The default is the map's control container. Set
   * this before the control is added to its map. Changing the target after attachment does not
   * move the control.
   */
  readonly wolTarget = input<HTMLElement | string>();
  /**
   * Observable properties to set on the OpenLayers instance. Updates assign the supplied keys and
   * leave other properties in place.
   */
  readonly wolProperties = input<WolProperties>();

  /**
   * Emits the native `change` event when the instance revision increases.
   */
  readonly wolChange = output<BaseEvent>();
  /**
   * Emits the native `error` event when the OpenLayers instance dispatches one.
   */
  readonly wolError = output<BaseEvent>();
  /**
   * Emits the native `propertychange` event with the changed property key and its previous value.
   */
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
   * Accesses the OpenLayers ZoomSlider control.
   *
   * @returns The underlying instance, or `undefined` before creation and after component
   * teardown.
   */
  getInstance(): ZoomSlider | undefined {
    return this.instance;
  }
}
