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
import { DragBoxEvent } from 'ol/interaction/DragBox';
import DragZoom from 'ol/interaction/DragZoom';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { useInteractionHostRef } from '@workletjs/ngx-openlayers/interaction/interaction';

/**
 * Fits the view to a dragged rectangle or zooms out by the corresponding amount. See
 * [OpenLayers DragZoom](https://openlayers.org/en/latest/apidoc/module-ol_interaction_DragZoom-DragZoom.html).
 */
@Component({
  selector: 'wol-drag-zoom-interaction',
  exportAs: 'wolDragZoomInteraction',
  template: '<ng-content />',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolDragZoomInteractionComponent implements OnChanges {
  /**
   * Whether the interaction handles events. Defaults to `true`. This model updates the
   * interaction and reflects active-state changes from OpenLayers.
   */
  readonly wolActive = model(true);
  /**
   * CSS class for the zoom rectangle. Defaults to `ol-dragzoom`. Read at creation.
   */
  readonly wolClassName = input<string>();
  /**
   * Predicate that decides whether a map browser event starts drawing the zoom box. Defaults to
   * the Shift-only condition. Read at creation.
   */
  readonly wolCondition = input<Condition>();
  /**
   * Duration of the zoom animation in milliseconds. Defaults to `200`. Read at creation.
   */
  readonly wolDuration = input<number>();
  /**
   * Whether to zoom out using the drawn box. Defaults to `false`, which fits the view to the box.
   * Read at creation.
   */
  readonly wolOut = input<boolean>();
  /**
   * Minimum squared length of the box diagonal, in squared pixels, required to complete the drag.
   * Defaults to `64`. Read at creation.
   */
  readonly wolMinArea = input<number>();
  /**
   * Observable properties to set on the OpenLayers instance. Updates assign the supplied keys and
   * leave other properties in place.
   */
  readonly wolProperties = input<WolProperties>();

  /**
   * Emits when the box is cancelled without applying a zoom. The event includes the coordinate
   * and the underlying map browser event.
   */
  readonly wolBoxCancel = output<DragBoxEvent>();
  /**
   * Emits while the zoom box is being drawn. The event includes the coordinate and the underlying
   * map browser event.
   */
  readonly wolBoxDrag = output<DragBoxEvent>();
  /**
   * Emits when the box is completed and the zoom has been requested. The event includes the
   * coordinate and the underlying map browser event.
   */
  readonly wolBoxEnd = output<DragBoxEvent>();
  /**
   * Emits when the zoom box starts. The event includes the coordinate and the underlying map
   * browser event.
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

  private instance?: DragZoom;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useInteractionHostRef<DragZoom>('DragZoom');
    const eventsKeyMap: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const dragZoom = new DragZoom({
        className: this.wolClassName(),
        condition: this.wolCondition(),
        duration: this.wolDuration(),
        out: this.wolOut(),
        minArea: this.wolMinArea(),
      });

      dragZoom.setActive(this.wolActive());

      if (this.wolProperties()) {
        dragZoom.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKeyMap['boxcancel'] = dragZoom.on('boxcancel', (event) =>
        this.wolBoxCancel.emit(event),
      );

      eventsKeyMap['boxdrag'] = dragZoom.on('boxdrag', (event) => this.wolBoxDrag.emit(event));

      eventsKeyMap['boxend'] = dragZoom.on('boxend', (event) => this.wolBoxEnd.emit(event));

      eventsKeyMap['boxstart'] = dragZoom.on('boxstart', (event) => this.wolBoxStart.emit(event));

      eventsKeyMap['change'] = dragZoom.on('change', (event) => this.wolChange.emit(event));

      eventsKeyMap['change:active'] = dragZoom.on('change:active', () =>
        this.wolActive.set(dragZoom.getActive()),
      );

      eventsKeyMap['error'] = dragZoom.on('error', (event) => this.wolError.emit(event));

      eventsKeyMap['propertychange'] = dragZoom.on('propertychange', (event) =>
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
        hostRef.addInteraction(dragZoom);
      });

      this.instance = dragZoom;
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
   * Accesses the OpenLayers DragZoom interaction.
   *
   * @returns The underlying instance, or `undefined` before creation and after component
   * teardown.
   */
  getInstance(): DragZoom | undefined {
    return this.instance;
  }
}
