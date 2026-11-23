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
  signal,
} from '@angular/core';

import { ObjectEvent } from 'ol/Object';
import { unByKey } from 'ol/Observable';
import { EventsKey } from 'ol/events';
import BaseEvent from 'ol/events/Event';
import PinchZoom from 'ol/interaction/PinchZoom';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { useInteractionHostRef } from '@workletjs/ngx-openlayers/interaction/interaction';

/**
 * Changes the map resolution as the user pinches or spreads two touch pointers. See
 * [OpenLayers PinchZoom](https://openlayers.org/en/latest/apidoc/module-ol_interaction_PinchZoom-PinchZoom.html).
 */
@Component({
  selector: 'wol-pinch-zoom-interaction',
  exportAs: 'wolPinchZoomInteraction',
  template: '<ng-content />',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolPinchZoomInteractionComponent implements OnChanges {
  /**
   * Whether the interaction handles events. Defaults to `true`. This model updates the
   * interaction and reflects active-state changes from OpenLayers.
   */
  readonly wolActive = model(true);
  /**
   * Duration in milliseconds of the animation after the pinch ends. Defaults to `400`. Read at
   * creation.
   */
  readonly wolDuration = input<number>();
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

  /**
   * Signal for the OpenLayers PinchZoom instance. Its value is `undefined` before creation and
   * after component teardown.
   */
  readonly pinchZoomInstance = signal<PinchZoom | undefined>(undefined);

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useInteractionHostRef<PinchZoom>('PinchZoom');
    const eventsKeyMap: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const pinchZoom = new PinchZoom({
        duration: this.wolDuration(),
      });

      pinchZoom.setActive(this.wolActive());

      if (this.wolProperties()) {
        pinchZoom.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKeyMap['change'] = pinchZoom.on('change', (event) => this.wolChange.emit(event));

      eventsKeyMap['change:active'] = pinchZoom.on('change:active', () =>
        this.wolActive.set(pinchZoom.getActive()),
      );

      eventsKeyMap['error'] = pinchZoom.on('error', (event) => this.wolError.emit(event));

      eventsKeyMap['propertychange'] = pinchZoom.on('propertychange', (event) =>
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
        hostRef.addInteraction(pinchZoom);
      });

      this.pinchZoomInstance.set(pinchZoom);
    });

    destroyRef.onDestroy(() => {
      const pinchZoom = this.pinchZoomInstance();
      if (pinchZoom) {
        unByKey(Object.values(eventsKeyMap));
        hostRef.removeInteraction(pinchZoom);
        pinchZoom.dispose();
        this.pinchZoomInstance.set(undefined);
      }
    });
  }

  /**
   * Respond to input changes.
   * @param changes The changed inputs
   * @internal
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (!this.pinchZoomInstance()) {
      return;
    }

    for (const [key, change] of Object.entries(changes)) {
      switch (key) {
        case 'wolActive':
          this.pinchZoomInstance()?.setActive(change.currentValue);
          break;
        case 'wolProperties':
          this.pinchZoomInstance()?.setProperties(change.currentValue ?? {});
          break;
      }
    }
  }

  /**
   * Accesses the OpenLayers PinchZoom interaction.
   *
   * @returns The underlying instance, or `undefined` before creation and after component
   * teardown.
   */
  getInstance(): PinchZoom | undefined {
    return this.pinchZoomInstance();
  }
}
