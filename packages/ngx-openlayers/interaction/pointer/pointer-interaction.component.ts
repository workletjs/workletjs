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

import MapBrowserEvent from 'ol/MapBrowserEvent';
import { ObjectEvent } from 'ol/Object';
import { unByKey } from 'ol/Observable';
import { EventsKey } from 'ol/events';
import BaseEvent from 'ol/events/Event';
import PointerInteraction from 'ol/interaction/Pointer';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { useInteractionHostRef } from '@workletjs/ngx-openlayers/interaction/interaction';

/**
 * Builds a custom pointer interaction from callbacks for browser events and drag sequences. See
 * [OpenLayers PointerInteraction](https://openlayers.org/en/latest/apidoc/module-ol_interaction_Pointer-PointerInteraction.html).
 */
@Component({
  selector: 'wol-pointer-interaction',
  exportAs: 'wolPointerInteraction',
  template: '<ng-content />',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolPointerInteractionComponent implements OnChanges {
  /**
   * Whether the interaction handles events. Defaults to `true`. This model updates the
   * interaction and reflects active-state changes from OpenLayers.
   */
  readonly wolActive = model(true);
  /**
   * Handles a pointer-down map browser event. Return `true` to start a drag sequence. Read at
   * creation.
   */
  readonly wolHandleDownEvent = input<(event: MapBrowserEvent) => boolean>();
  /**
   * Handles pointer-drag events while a drag sequence is active. Read at creation.
   */
  readonly wolHandleDragEvent = input<(event: MapBrowserEvent) => void>();
  /**
   * Replaces the built-in pointer event handler. Return `false` to stop the map browser event
   * from reaching later interactions. Read at creation.
   */
  readonly wolHandleEvent = input<(event: MapBrowserEvent) => boolean>();
  /**
   * Handles pointer-move events while no drag sequence is active. Read at creation.
   */
  readonly wolHandleMoveEvent = input<(event: MapBrowserEvent) => void>();
  /**
   * Handles a pointer-up event in a drag sequence. Return `false` to end the sequence. Read at
   * creation.
   */
  readonly wolHandleUpEvent = input<(event: MapBrowserEvent) => boolean>();
  /**
   * Decides whether to stop a pointer-down event from reaching other interactions. Receives
   * whether the down event was handled and returns `true` to stop it. The default stops handled
   * events. Read at creation.
   */
  readonly wolStopDown = input<(isDblClick: boolean) => boolean>();
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

  private instance?: PointerInteraction;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useInteractionHostRef<PointerInteraction>('PointerInteraction');
    const eventsKeyMap: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const pointerInteraction = new PointerInteraction({
        handleDownEvent: this.wolHandleDownEvent(),
        handleDragEvent: this.wolHandleDragEvent(),
        handleEvent: this.wolHandleEvent(),
        handleMoveEvent: this.wolHandleMoveEvent(),
        handleUpEvent: this.wolHandleUpEvent(),
        stopDown: this.wolStopDown(),
      });

      pointerInteraction.setActive(this.wolActive());

      if (this.wolProperties()) {
        pointerInteraction.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKeyMap['change'] = pointerInteraction.on('change', (event) => {
        this.wolChange.emit(event);
      });

      eventsKeyMap['change:active'] = pointerInteraction.on('change:active', () =>
        this.wolActive.set(pointerInteraction.getActive()),
      );

      eventsKeyMap['error'] = pointerInteraction.on('error', (event) => {
        this.wolError.emit(event);
      });

      eventsKeyMap['propertychange'] = pointerInteraction.on('propertychange', (event) => {
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
        hostRef.addInteraction(pointerInteraction);
      });

      this.instance = pointerInteraction;
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
   * Accesses the OpenLayers PointerInteraction interaction.
   *
   * @returns The underlying instance, or `undefined` before creation and after component
   * teardown.
   */
  getInstance(): PointerInteraction | undefined {
    return this.instance;
  }
}
