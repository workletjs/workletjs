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
import MouseWheelZoom from 'ol/interaction/MouseWheelZoom';

@Component({
  selector: 'wol-mouse-wheel-zoom-interaction',
  exportAs: 'wolMouseWheelZoomInteraction',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolMouseWheelZoomInteractionComponent implements OnChanges {
  readonly wolActive = model(true);
  readonly wolCondition = input<Condition>();
  readonly wolOnFocusOnly = input<boolean>();
  readonly wolMaxDelta = input<number>();
  readonly wolDuration = input<number>();
  readonly wolTimeout = input<number>();
  readonly wolUseAnchor = input<boolean>();
  readonly wolConstrainResolution = input<boolean>();
  readonly wolProperties = input<WolProperties>();

  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
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
   * Get the underlying OpenLayers MouseWheelZoom control instance.
   * @returns The MouseWheelZoom control instance
   */
  getInstance(): MouseWheelZoom | undefined {
    return this.instance;
  }
}
