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

@Component({
  selector: 'wol-keyboard-pan-interaction',
  exportAs: 'wolKeyboardPanInteraction',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolKeyboardPanInteractionComponent implements OnChanges {
  readonly wolActive = model(true);
  readonly wolCondition = input<Condition>();
  readonly wolDuration = input<number>();
  readonly wolPixelDelta = input<number>();
  readonly wolProperties = input<WolProperties>();

  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
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
   * Get the underlying OpenLayers KeyboardPan control instance.
   * @returns The KeyboardPan control instance
   */
  getInstance(): KeyboardPan | undefined {
    return this.instance;
  }
}
