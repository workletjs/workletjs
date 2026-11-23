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

import Kinetic from 'ol/Kinetic';
import { ObjectEvent } from 'ol/Object';
import { unByKey } from 'ol/Observable';
import { EventsKey } from 'ol/events';
import BaseEvent from 'ol/events/Event';
import { Condition } from 'ol/events/condition';
import DragPan from 'ol/interaction/DragPan';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { useInteractionHostRef } from '@workletjs/ngx-openlayers/interaction/interaction';

/**
 * Pans the map in response to pointer dragging, with optional kinetic movement. See
 * [OpenLayers DragPan](https://openlayers.org/en/latest/apidoc/module-ol_interaction_DragPan-DragPan.html).
 */
@Component({
  selector: 'wol-drag-pan-interaction',
  exportAs: 'wolDragPanInteraction',
  template: '<ng-content />',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolDragPanInteractionComponent implements OnChanges {
  /**
   * Whether the interaction handles events. Defaults to `true`. This model updates the
   * interaction and reflects active-state changes from OpenLayers.
   */
  readonly wolActive = model(true);
  /**
   * Predicate that decides whether a map browser event starts a pan. By default, it accepts the
   * primary action with no modifier keys. Read at creation.
   */
  readonly wolCondition = input<Condition>();
  /**
   * Requires map focus when the target has a `tabindex` attribute. Defaults to `false`. Read at
   * creation.
   */
  readonly wolOnFocusOnly = input<boolean>();
  /**
   * Kinetic inertia configuration used to continue a fast pan after the pointer is released. Read
   * at creation.
   */
  readonly wolKinetic = input<Kinetic>();
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

  private instance?: DragPan;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useInteractionHostRef<DragPan>('DragPan');
    const eventsKeyMap: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const dragPan = new DragPan({
        condition: this.wolCondition(),
        onFocusOnly: this.wolOnFocusOnly(),
        kinetic: this.wolKinetic(),
      });

      dragPan.setActive(this.wolActive());

      if (this.wolProperties()) {
        dragPan.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKeyMap['change'] = dragPan.on('change', (event) => this.wolChange.emit(event));

      eventsKeyMap['change:active'] = dragPan.on('change:active', () =>
        this.wolActive.set(dragPan.getActive()),
      );

      eventsKeyMap['error'] = dragPan.on('error', (event) => this.wolError.emit(event));

      eventsKeyMap['propertychange'] = dragPan.on('propertychange', (event) =>
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
        hostRef.addInteraction(dragPan);
      });

      this.instance = dragPan;
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
   * Accesses the OpenLayers DragPan interaction.
   *
   * @returns The underlying instance, or `undefined` before creation and after component
   * teardown.
   */
  getInstance(): DragPan | undefined {
    return this.instance;
  }
}
