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
import DragRotateAndZoom from 'ol/interaction/DragRotateAndZoom';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { useInteractionHostRef } from '@workletjs/ngx-openlayers/interaction/interaction';

/**
 * Rotates and zooms the view together by dragging relative to the viewport center. See
 * [OpenLayers DragRotateAndZoom](https://openlayers.org/en/latest/apidoc/module-ol_interaction_DragRotateAndZoom-DragRotateAndZoom.html).
 */
@Component({
  selector: 'wol-drag-rotate-and-zoom-interaction',
  exportAs: 'wolDragRotateAndZoomInteraction',
  template: '<ng-content />',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolDragRotateAndZoomInteractionComponent implements OnChanges {
  /**
   * Whether the interaction handles events. Defaults to `true`. This model updates the
   * interaction and reflects active-state changes from OpenLayers.
   */
  readonly wolActive = model(true);
  /**
   * Predicate that decides whether the drag can start. Defaults to the Shift-only condition. Read
   * at creation.
   */
  readonly wolCondition = input<Condition>();
  /**
   * Animation duration in milliseconds when the gesture ends. Defaults to `400`. Read at
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

  private instance?: DragRotateAndZoom;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useInteractionHostRef<DragRotateAndZoom>('DragRotateAndZoom');
    const eventsKeyMap: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const dragRotateAndZoom = new DragRotateAndZoom({
        condition: this.wolCondition(),
        duration: this.wolDuration(),
      });

      dragRotateAndZoom.setActive(this.wolActive());

      if (this.wolProperties()) {
        dragRotateAndZoom.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKeyMap['change'] = dragRotateAndZoom.on('change', (event) =>
        this.wolChange.emit(event),
      );

      eventsKeyMap['change:active'] = dragRotateAndZoom.on('change:active', () =>
        this.wolActive.set(dragRotateAndZoom.getActive()),
      );

      eventsKeyMap['error'] = dragRotateAndZoom.on('error', (event) => this.wolError.emit(event));

      eventsKeyMap['propertychange'] = dragRotateAndZoom.on('propertychange', (event) =>
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
        hostRef.addInteraction(dragRotateAndZoom);
      });

      this.instance = dragRotateAndZoom;
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
   * Accesses the OpenLayers DragRotateAndZoom interaction.
   *
   * @returns The underlying instance, or `undefined` before creation and after component
   * teardown.
   */
  getInstance(): DragRotateAndZoom | undefined {
    return this.instance;
  }
}
