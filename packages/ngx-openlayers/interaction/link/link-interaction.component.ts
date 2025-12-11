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
import { ObjectEvent } from 'ol/Object';
import { unByKey } from 'ol/Observable';
import { AnimationOptions } from 'ol/View';
import BaseEvent from 'ol/events/Event';
import Link, { Params } from 'ol/interaction/Link';

@Component({
  selector: 'wol-link-interaction',
  exportAs: 'wolLinkInteraction',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolLinkInteractionComponent implements OnChanges {
  readonly wolActive = model(true);
  readonly wolAnimation = input<boolean | AnimationOptions>();
  readonly wolParams = input<Params[]>(['x', 'y', 'z', 'r', 'l']);
  readonly wolReplace = input<boolean>();
  readonly wolPrefix = input<string>();
  readonly wolProperties = input<WolProperties>();

  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
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
   * Get the underlying OpenLayers Link control instance.
   * @returns The Link control instance
   */
  getInstance(): Link | undefined {
    return this.instance;
  }
}
