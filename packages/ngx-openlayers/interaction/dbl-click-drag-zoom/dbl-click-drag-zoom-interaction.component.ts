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
import DblClickDragZoom from 'ol/interaction/DblClickDragZoom';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { useInteractionHostRef } from '@workletjs/ngx-openlayers/interaction/interaction';

/**
 * Zooms the map while the user drags vertically after a double tap or double click. See
 * [OpenLayers DblClickDragZoom](https://openlayers.org/en/latest/apidoc/module-ol_interaction_DblClickDragZoom-DblClickDragZoom.html).
 */
@Component({
  selector: 'wol-dbl-click-drag-zoom-interaction',
  exportAs: 'wolDblClickDragZoomInteraction',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolDblClickDragZoomInteractionComponent implements OnChanges {
  /**
   * Whether the interaction handles events. Defaults to `true`. This model updates the
   * interaction and reflects active-state changes from OpenLayers.
   */
  readonly wolActive = model(true);
  /**
   * Duration in milliseconds of the zoom adjustment after releasing the pointer. With OpenLayers
   * 10.11.0, it defaults to `250`. Read at creation.
   */
  readonly wolDuration = input<number>();
  /**
   * Change in resolution scale per vertical pixel of movement. With OpenLayers 10.11.0, an
   * omitted or zero value uses `0.01`. Read at creation.
   */
  readonly wolDelta = input<number>();
  /**
   * Decides whether to stop a pointer-down event from reaching other interactions. Receives
   * whether this interaction handled the event and returns `true` to stop it. By default, handled
   * events are stopped. Read at creation.
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

  private instance?: DblClickDragZoom;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useInteractionHostRef<DblClickDragZoom>('DblClickDragZoom');
    const eventsKeyMap: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const dblClickDragZoom = new DblClickDragZoom({
        duration: this.wolDuration(),
        delta: this.wolDelta(),
        stopDown: this.wolStopDown(),
      });

      dblClickDragZoom.setActive(this.wolActive());

      if (this.wolProperties()) {
        dblClickDragZoom.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKeyMap['change'] = dblClickDragZoom.on('change', (event) => this.wolChange.emit(event));

      eventsKeyMap['change:active'] = dblClickDragZoom.on('change:active', () => {
        this.wolActive.set(dblClickDragZoom.getActive());
      });

      eventsKeyMap['error'] = dblClickDragZoom.on('error', (event) => this.wolError.emit(event));

      eventsKeyMap['propertychange'] = dblClickDragZoom.on('propertychange', (event) =>
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
        hostRef.addInteraction(dblClickDragZoom);
      });

      this.instance = dblClickDragZoom;
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
   * Accesses the OpenLayers DblClickDragZoom interaction.
   *
   * @returns The underlying instance, or `undefined` before creation and after component
   * teardown.
   */
  getInstance(): DblClickDragZoom | undefined {
    return this.instance;
  }
}
