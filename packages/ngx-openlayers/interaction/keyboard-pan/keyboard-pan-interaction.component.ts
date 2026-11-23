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
import KeyboardPan from 'ol/interaction/KeyboardPan';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { useInteractionHostRef } from '@workletjs/ngx-openlayers/interaction/interaction';

/**
 * Pans the map when the keyboard event target receives an arrow key. See
 * [OpenLayers KeyboardPan](https://openlayers.org/en/latest/apidoc/module-ol_interaction_KeyboardPan-KeyboardPan.html).
 */
@Component({
  selector: 'wol-keyboard-pan-interaction',
  exportAs: 'wolKeyboardPanInteraction',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolKeyboardPanInteractionComponent implements OnChanges {
  /**
   * Whether the interaction handles events. Defaults to `true`. This model updates the
   * interaction and reflects active-state changes from OpenLayers.
   */
  readonly wolActive = model(true);
  /**
   * Predicate for keyboard pan events. By default, it accepts keys without modifiers when the
   * event target is outside an editable element. Read at creation.
   */
  readonly wolCondition = input<Condition>();
  /**
   * Duration in milliseconds of a keyboard pan animation. Defaults to `100`. Read at creation.
   */
  readonly wolDuration = input<number>();
  /**
   * Number of pixels to pan per arrow-key press. Defaults to `128`. Read at creation.
   */
  readonly wolPixelDelta = input<number>();
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

  private instance?: KeyboardPan;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useInteractionHostRef<KeyboardPan>('KeyboardPan');
    const eventsKeyMap: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const keyboardPan = new KeyboardPan({
        condition: this.wolCondition(),
        duration: this.wolDuration(),
        pixelDelta: this.wolPixelDelta(),
      });

      keyboardPan.setActive(this.wolActive());

      if (this.wolProperties()) {
        keyboardPan.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKeyMap['change'] = keyboardPan.on('change', (event) => {
        this.wolChange.emit(event);
      });

      eventsKeyMap['change:active'] = keyboardPan.on('change:active', () =>
        this.wolActive.set(keyboardPan.getActive()),
      );

      eventsKeyMap['error'] = keyboardPan.on('error', (event) => {
        this.wolError.emit(event);
      });

      eventsKeyMap['propertychange'] = keyboardPan.on('propertychange', (event) => {
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
        hostRef.addInteraction(keyboardPan);
      });

      this.instance = keyboardPan;
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
   * Accesses the OpenLayers KeyboardPan interaction.
   *
   * @returns The underlying instance, or `undefined` before creation and after component
   * teardown.
   */
  getInstance(): KeyboardPan | undefined {
    return this.instance;
  }
}
