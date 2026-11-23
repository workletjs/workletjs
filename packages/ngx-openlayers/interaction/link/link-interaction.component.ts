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
import { AnimationOptions } from 'ol/View';
import { EventsKey } from 'ol/events';
import BaseEvent from 'ol/events/Event';
import Link, { Params } from 'ol/interaction/Link';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { useInteractionHostRef } from '@workletjs/ngx-openlayers/interaction/interaction';

/**
 * Synchronizes view state and layer visibility with URL search parameters and browser history.
 * See
 * [OpenLayers Link](https://openlayers.org/en/latest/apidoc/module-ol_interaction_Link-Link.html).
 */
@Component({
  selector: 'wol-link-interaction',
  exportAs: 'wolLinkInteraction',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolLinkInteractionComponent implements OnChanges {
  /**
   * Whether the interaction handles events. Defaults to `true`. This model updates the
   * interaction and reflects active-state changes from OpenLayers.
   */
  readonly wolActive = model(true);
  /**
   * Whether to animate view changes from the URL, or the animation options to use. Defaults to
   * `true`. Read at creation.
   */
  readonly wolAnimation = input<boolean | AnimationOptions>();
  /**
   * State to synchronize. The default list is `x` and `y` for center, `z` for zoom, `r` for
   * rotation, and `l` for layer visibility. Read at creation.
   */
  readonly wolParams = input<Params[]>(['x', 'y', 'z', 'r', 'l']);
  /**
   * Whether to replace the current history entry on a map state update. Defaults to `false`,
   * which adds an entry. Read at creation.
   */
  readonly wolReplace = input<boolean>();
  /**
   * Prefix for the URL search parameters written by this interaction. Defaults to an empty
   * prefix. Read at creation.
   */
  readonly wolPrefix = input<string>();
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

  private instance?: Link;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useInteractionHostRef<Link>('Link');
    const eventsKeyMap: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const linkInteraction = new Link({
        animate: this.wolAnimation(),
        params: this.wolParams(),
        replace: this.wolReplace(),
        prefix: this.wolPrefix(),
      });

      linkInteraction.setActive(this.wolActive());

      if (this.wolProperties()) {
        linkInteraction.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKeyMap['change'] = linkInteraction.on('change', (event) => {
        this.wolChange.emit(event);
      });

      eventsKeyMap['change:active'] = linkInteraction.on('change:active', () =>
        this.wolActive.set(linkInteraction.getActive()),
      );

      eventsKeyMap['error'] = linkInteraction.on('error', (event) => {
        this.wolError.emit(event);
      });

      eventsKeyMap['propertychange'] = linkInteraction.on('propertychange', (event) => {
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
        hostRef.addInteraction(linkInteraction);
      });

      this.instance = linkInteraction;
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
   * Accesses the OpenLayers Link interaction.
   *
   * @returns The underlying instance, or `undefined` before creation and after component
   * teardown.
   */
  getInstance(): Link | undefined {
    return this.instance;
  }
}
