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
import MouseWheelZoom from 'ol/interaction/MouseWheelZoom';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { useInteractionHostRef } from '@workletjs/ngx-openlayers/interaction/interaction';

/**
 * Zooms the map with wheel and trackpad gestures. See
 * [OpenLayers MouseWheelZoom](https://openlayers.org/en/latest/apidoc/module-ol_interaction_MouseWheelZoom-MouseWheelZoom.html).
 */
@Component({
  selector: 'wol-mouse-wheel-zoom-interaction',
  exportAs: 'wolMouseWheelZoomInteraction',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolMouseWheelZoomInteractionComponent implements OnChanges {
  /**
   * Whether the interaction handles events. Defaults to `true`. This model updates the
   * interaction and reflects active-state changes from OpenLayers.
   */
  readonly wolActive = model(true);
  /**
   * Predicate that decides whether to handle the wheel event. The default accepts wheel events.
   * Read at creation.
   */
  readonly wolCondition = input<Condition>();
  /**
   * Requires map focus when the target has a `tabindex` attribute. Defaults to `false`. Read at
   * creation.
   */
  readonly wolOnFocusOnly = input<boolean>();
  /**
   * Maximum zoom-level change applied to an accumulated mouse-wheel gesture. Defaults to `1`.
   * Read at creation.
   */
  readonly wolMaxDelta = input<number>();
  /**
   * Duration in milliseconds of the mouse-wheel zoom animation. Defaults to `250`. Read at
   * creation.
   */
  readonly wolDuration = input<number>();
  /**
   * Time window in milliseconds for accumulating mouse-wheel input. Defaults to `80`. Read at
   * creation.
   */
  readonly wolTimeout = input<number>();
  /**
   * Uses the pointer as the zoom anchor when `true`, or the view center when `false`. Defaults to
   * `true`. Changes update the existing interaction.
   */
  readonly wolUseAnchor = input<boolean>();
  /**
   * Whether this interaction forces discrete zoom levels. Defaults to `false`. A view-level
   * resolution constraint still applies. Read at creation.
   */
  readonly wolConstrainResolution = input<boolean>();
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

  private instance?: MouseWheelZoom;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useInteractionHostRef<MouseWheelZoom>('MouseWheelZoom');
    const eventsKeyMap: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const mouseWheelZoom = new MouseWheelZoom({
        condition: this.wolCondition(),
        onFocusOnly: this.wolOnFocusOnly(),
        maxDelta: this.wolMaxDelta(),
        duration: this.wolDuration(),
        timeout: this.wolTimeout(),
        useAnchor: this.wolUseAnchor(),
        constrainResolution: this.wolConstrainResolution(),
      });

      mouseWheelZoom.setActive(this.wolActive());

      if (this.wolProperties()) {
        mouseWheelZoom.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKeyMap['change'] = mouseWheelZoom.on('change', (event) => {
        this.wolChange.emit(event);
      });

      eventsKeyMap['change:active'] = mouseWheelZoom.on('change:active', () =>
        this.wolActive.set(mouseWheelZoom.getActive()),
      );

      eventsKeyMap['error'] = mouseWheelZoom.on('error', (event) => {
        this.wolError.emit(event);
      });

      eventsKeyMap['propertychange'] = mouseWheelZoom.on('propertychange', (event) => {
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
        hostRef.addInteraction(mouseWheelZoom);
      });

      this.instance = mouseWheelZoom;
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
        case 'wolUseAnchor':
          this.instance.setMouseAnchor(change.currentValue);
          break;
        case 'wolProperties':
          this.instance.setProperties(change.currentValue ?? {});
          break;
      }
    }
  }

  /**
   * Accesses the OpenLayers MouseWheelZoom interaction.
   *
   * @returns The underlying instance, or `undefined` before creation and after component
   * teardown.
   */
  getInstance(): MouseWheelZoom | undefined {
    return this.instance;
  }
}
