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
import { Condition } from 'ol/events/condition';
import KeyboardZoom from 'ol/interaction/KeyboardZoom';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { useInteractionHostRef } from '@workletjs/ngx-openlayers/interaction/interaction';

/**
 * Changes the zoom when the keyboard event target receives the plus or minus key. See
 * [OpenLayers KeyboardZoom](https://openlayers.org/en/latest/apidoc/module-ol_interaction_KeyboardZoom-KeyboardZoom.html).
 */
@Component({
  selector: 'wol-keyboard-zoom-interaction',
  exportAs: 'wolKeyboardZoomInteraction',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolKeyboardZoomInteractionComponent implements OnChanges {
  /**
   * Whether the interaction handles events. Defaults to `true`. This model updates the
   * interaction and reflects active-state changes from OpenLayers.
   */
  readonly wolActive = model(true);
  /**
   * Duration in milliseconds of a keyboard zoom animation. Defaults to `100`. Read at creation.
   */
  readonly wolDuration = input<number>();
  /**
   * Predicate for keyboard zoom events. By default, it accepts events outside editable elements
   * when the platform modifier key is released. Read at creation.
   */
  readonly wolCondition = input<Condition>();
  /**
   * Change in zoom levels per key press. Defaults to `1`. Read at creation.
   */
  readonly wolDelta = input<number>();
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

  private instance?: KeyboardZoom;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useInteractionHostRef<KeyboardZoom>('KeyboardZoom');
    const eventsKeyMap: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const keyboardZoom = new KeyboardZoom({
        duration: this.wolDuration(),
        condition: this.wolCondition(),
        delta: this.wolDelta(),
      });

      keyboardZoom.setActive(this.wolActive());

      if (this.wolProperties()) {
        keyboardZoom.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKeyMap['change'] = keyboardZoom.on('change', (event) => {
        this.wolChange.emit(event);
      });

      eventsKeyMap['change:active'] = keyboardZoom.on('change:active', () =>
        this.wolActive.set(keyboardZoom.getActive()),
      );

      eventsKeyMap['error'] = keyboardZoom.on('error', (event) => {
        this.wolError.emit(event);
      });

      eventsKeyMap['propertychange'] = keyboardZoom.on('propertychange', (event) => {
        this.wolPropertyChange.emit(event);
      });
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
        hostRef.addInteraction(keyboardZoom);
      });

      this.instance = keyboardZoom;
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
   * Accesses the OpenLayers KeyboardZoom interaction.
   *
   * @returns The underlying instance, or `undefined` before creation and after component
   * teardown.
   */
  getInstance(): KeyboardZoom | undefined {
    return this.instance;
  }
}
