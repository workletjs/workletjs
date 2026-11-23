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
import DoubleClickZoom from 'ol/interaction/DoubleClickZoom';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { useInteractionHostRef } from '@workletjs/ngx-openlayers/interaction/interaction';

/**
 * Zooms at the pointer position on double click. Holding Shift reverses the direction. See
 * [OpenLayers DoubleClickZoom](https://openlayers.org/en/latest/apidoc/module-ol_interaction_DoubleClickZoom-DoubleClickZoom.html).
 */
@Component({
  selector: 'wol-double-click-zoom-interaction',
  exportAs: 'wolDoubleClickZoomInteraction',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolDoubleClickZoomInteractionComponent implements OnChanges {
  /**
   * Whether the interaction handles events. Defaults to `true`. This model updates the
   * interaction and reflects active-state changes from OpenLayers.
   */
  readonly wolActive = model(true);
  /**
   * Duration of a double-click zoom animation in milliseconds. Defaults to `250`. The component
   * reads this model at creation. Read at creation.
   */
  readonly wolDuration = model<number>();
  /**
   * Change in zoom levels per double click. Defaults to `1`. The component reads this model at
   * creation. Read at creation.
   */
  readonly wolDelta = model<number>();
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

  private instance?: DoubleClickZoom;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useInteractionHostRef<DoubleClickZoom>('DoubleClickZoom');
    const eventsKeyMap: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const doubleClickZoom = new DoubleClickZoom({
        duration: this.wolDuration(),
        delta: this.wolDelta(),
      });

      doubleClickZoom.setActive(this.wolActive());

      if (this.wolProperties()) {
        doubleClickZoom.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKeyMap['change'] = doubleClickZoom.on('change', (event) => this.wolChange.emit(event));

      eventsKeyMap['change:active'] = doubleClickZoom.on('change:active', () => {
        this.wolActive.set(doubleClickZoom.getActive());
      });

      eventsKeyMap['error'] = doubleClickZoom.on('error', (event) => this.wolError.emit(event));

      eventsKeyMap['propertychange'] = doubleClickZoom.on('propertychange', (event) =>
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
        hostRef.addInteraction(doubleClickZoom);
      });

      this.instance = doubleClickZoom;
    });

    destroyRef.onDestroy(() => {
      if (this.instance) {
        unByKey(Object.values(eventsKeyMap));
        hostRef.removeInteraction(this.instance);
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
        case 'wolActive':
          this.instance.setActive(change.currentValue);
          break;
        case 'wolProperties':
          this.instance.setProperties(change.currentValue ?? {});
          break;
      }
    }
  }

  /**
   * Accesses the OpenLayers DoubleClickZoom interaction.
   *
   * @returns The underlying instance, or `undefined` before creation and after component
   * teardown.
   */
  getInstance(): DoubleClickZoom | undefined {
    return this.instance;
  }
}
