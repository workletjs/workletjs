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
import { Condition } from 'ol/events/condition';
import DragBox, { DragBoxEvent, EndCondition } from 'ol/interaction/DragBox';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { useInteractionHostRef } from '@workletjs/ngx-openlayers/interaction/interaction';

/**
 * Draws a rectangle by dragging and exposes the rectangle geometry through the native
 * interaction. See
 * [OpenLayers DragBox](https://openlayers.org/en/latest/apidoc/module-ol_interaction_DragBox-DragBox.html).
 */
@Component({
  selector: 'wol-drag-box-interaction',
  exportAs: 'wolDragBoxInteraction',
  template: '<ng-content />',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolDragBoxInteractionComponent implements OnChanges {
  /**
   * Whether the interaction handles events. Defaults to `true`. This model updates the
   * interaction and reflects active-state changes from OpenLayers.
   */
  readonly wolActive = model(true);
  /**
   * CSS class for the drag rectangle. Defaults to `ol-dragbox`. Read at creation.
   */
  readonly wolClassName = input<string>();
  /**
   * Predicate that decides whether a map browser event starts drawing a box. By default, it
   * accepts the primary mouse button. Read at creation.
   */
  readonly wolCondition = input<Condition>();
  /**
   * Minimum squared length of the box diagonal, in squared pixels, for the default completion
   * predicate. Defaults to `64`. A custom `wolBoxEndCondition` controls completion itself. Read
   * at creation.
   */
  readonly wolMinArea = input<number>();
  /**
   * Predicate called with the releasing map browser event and the start and end pixels. Return
   * `true` to complete the box. By default, completion uses `wolMinArea`. Read at creation.
   */
  readonly wolBoxEndCondition = input<EndCondition>();
  /**
   * Callback invoked with the final map browser event just before `wolBoxEnd` emits. Read at
   * creation.
   */
  readonly wolOnBoxEnd = input<(event: MapBrowserEvent) => void>();
  /**
   * Observable properties to set on the OpenLayers instance. Updates assign the supplied keys and
   * leave other properties in place.
   */
  readonly wolProperties = input<WolProperties>();

  /**
   * Emits when drawing is cancelled, including when the completion predicate rejects the box. The
   * event includes the coordinate and the underlying map browser event.
   */
  readonly wolBoxCancel = output<DragBoxEvent>();
  /**
   * Emits as the pointer resizes the box. The event includes the coordinate and the underlying
   * map browser event.
   */
  readonly wolBoxDrag = output<DragBoxEvent>();
  /**
   * Emits when the box is completed. The event includes the coordinate and the underlying map
   * browser event.
   */
  readonly wolBoxEnd = output<DragBoxEvent>();
  /**
   * Emits when drawing starts. The event includes the coordinate and the underlying map browser
   * event.
   */
  readonly wolBoxStart = output<DragBoxEvent>();
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

  private instance?: DragBox;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useInteractionHostRef<DragBox>('DragBox');
    const eventsKeyMap: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const dragBox = new DragBox({
        className: this.wolClassName(),
        condition: this.wolCondition(),
        minArea: this.wolMinArea(),
        boxEndCondition: this.wolBoxEndCondition(),
        onBoxEnd: this.wolOnBoxEnd(),
      });

      dragBox.setActive(this.wolActive());

      if (this.wolProperties()) {
        dragBox.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKeyMap['boxcancel'] = dragBox.on('boxcancel', (event) => this.wolBoxCancel.emit(event));

      eventsKeyMap['boxdrag'] = dragBox.on('boxdrag', (event) => this.wolBoxDrag.emit(event));

      eventsKeyMap['boxend'] = dragBox.on('boxend', (event) => this.wolBoxEnd.emit(event));

      eventsKeyMap['boxstart'] = dragBox.on('boxstart', (event) => this.wolBoxStart.emit(event));

      eventsKeyMap['change'] = dragBox.on('change', (event) => this.wolChange.emit(event));

      eventsKeyMap['change:active'] = dragBox.on('change:active', () =>
        this.wolActive.set(dragBox.getActive()),
      );

      eventsKeyMap['error'] = dragBox.on('error', (event) => this.wolError.emit(event));

      eventsKeyMap['propertychange'] = dragBox.on('propertychange', (event) =>
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
        hostRef.addInteraction(dragBox);
      });

      this.instance = dragBox;
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
   * Accesses the OpenLayers DragBox interaction.
   *
   * @returns The underlying instance, or `undefined` before creation and after component
   * teardown.
   */
  getInstance(): DragBox | undefined {
    return this.instance;
  }
}
