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
import DoubleClickZoom from 'ol/interaction/DoubleClickZoom';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { useInteractionHostRef } from '@workletjs/ngx-openlayers/interaction/interaction';

@Component({
  selector: 'wol-double-click-zoom-interaction',
  exportAs: 'wolDoubleClickZoomInteraction',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolDoubleClickZoomInteractionComponent implements OnChanges {
  readonly wolActive = model(true);
  readonly wolDuration = model<number>();
  readonly wolDelta = model<number>();
  readonly wolProperties = input<WolProperties>();

  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
  readonly wolPropertyChange = output<ObjectEvent>();

  private instance?: DoubleClickZoom;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useInteractionHostRef<DoubleClickZoom>('DoubleClickZoom');
    const eventsKeyMap: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const doubleClickZoom = new DoubleClickZoom({
        duration: this.wolDuration(),
        delta: this.wolDelta(),
      });

      doubleClickZoom.setActive(this.wolActive());

      if (this.wolProperties()) {
        doubleClickZoom.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKeyMap['change'] = doubleClickZoom.on('change', (event) => this.wolChange.emit(event));

      eventsKeyMap['change:active'] = doubleClickZoom.on('change:active', () => {
        this.wolActive.set(doubleClickZoom.getActive());
      });

      eventsKeyMap['error'] = doubleClickZoom.on('error', (event) => this.wolError.emit(event));

      eventsKeyMap['propertychange'] = doubleClickZoom.on('propertychange', (event) =>
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
        hostRef.addInteraction(doubleClickZoom);
      });

      this.instance = doubleClickZoom;
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
   * Get the underlying OpenLayers DoubleClickZoom control instance.
   * @returns The DoubleClickZoom control instance
   */
  getInstance(): DoubleClickZoom | undefined {
    return this.instance;
  }
}
