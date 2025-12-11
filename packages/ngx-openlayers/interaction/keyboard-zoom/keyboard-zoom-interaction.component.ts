import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  model,
  OnChanges,
  output,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { useInteractionHostRef } from '@workletjs/ngx-openlayers/interaction/interaction';
import { EventsKey } from 'ol/events';
import { Condition } from 'ol/events/condition';
import { ObjectEvent } from 'ol/Object';
import { unByKey } from 'ol/Observable';
import BaseEvent from 'ol/events/Event';
import KeyboardZoom from 'ol/interaction/KeyboardZoom';

@Component({
  selector: 'wol-keyboard-zoom-interaction',
  exportAs: 'wolKeyboardZoomInteraction',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolKeyboardZoomInteractionComponent implements OnChanges {
  readonly wolActive = model(true);
  readonly wolDuration = input<number>();
  readonly wolCondition = input<Condition>();
  readonly wolDelta = input<number>();
  readonly wolProperties = input<WolProperties>();

  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
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
   * Get the underlying OpenLayers KeyboardZoom control instance.
   * @returns The KeyboardZoom control instance
   */
  getInstance(): KeyboardZoom | undefined {
    return this.instance;
  }
}
