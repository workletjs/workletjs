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
  signal,
} from '@angular/core';

import { ObjectEvent } from 'ol/Object';
import { unByKey } from 'ol/Observable';
import { EventsKey } from 'ol/events';
import BaseEvent from 'ol/events/Event';
import PinchRotate from 'ol/interaction/PinchRotate';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { useInteractionHostRef } from '@workletjs/ngx-openlayers/interaction/interaction';

@Component({
  selector: 'wol-pinch-rotate-interaction',
  exportAs: 'wolPinchRotateInteraction',
  template: '<ng-content />',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolPinchRotateInteractionComponent implements OnChanges {
  readonly wolActive = model(true);
  readonly wolDuration = input<number>();
  readonly wolThreshold = input<number>();
  readonly wolProperties = input<WolProperties>();

  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
  readonly wolPropertyChange = output<ObjectEvent>();

  readonly pinchRotateInstance = signal<PinchRotate | undefined>(undefined);

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useInteractionHostRef<PinchRotate>('PinchRotate');
    const eventsKeyMap: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const pinchRotate = new PinchRotate({
        duration: this.wolDuration(),
        threshold: this.wolThreshold(),
      });

      pinchRotate.setActive(this.wolActive());

      if (this.wolProperties()) {
        pinchRotate.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKeyMap['change'] = pinchRotate.on('change', (event) => this.wolChange.emit(event));

      eventsKeyMap['change:active'] = pinchRotate.on('change:active', () =>
        this.wolActive.set(pinchRotate.getActive()),
      );

      eventsKeyMap['error'] = pinchRotate.on('error', (event) => this.wolError.emit(event));

      eventsKeyMap['propertychange'] = pinchRotate.on('propertychange', (event) =>
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
        hostRef.addInteraction(pinchRotate);
      });

      this.pinchRotateInstance.set(pinchRotate);
    });

    destroyRef.onDestroy(() => {
      const pinchRotate = this.pinchRotateInstance();
      if (pinchRotate) {
        unByKey(Object.values(eventsKeyMap));
        hostRef.removeInteraction(pinchRotate);
        pinchRotate.dispose();
        this.pinchRotateInstance.set(undefined);
      }
    });
  }

  /**
   * Respond to input changes.
   * @param changes The changed inputs
   * @internal
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (!this.pinchRotateInstance()) {
      return;
    }

    for (const [key, change] of Object.entries(changes)) {
      switch (key) {
        case 'wolActive':
          this.pinchRotateInstance()?.setActive(change.currentValue);
          break;
        case 'wolProperties':
          this.pinchRotateInstance()?.setProperties(change.currentValue ?? {});
          break;
      }
    }
  }

  /**
   * Get the underlying OpenLayers PinchRotate interaction instance.
   * @returns The PinchRotate interaction instance
   */
  getInstance(): PinchRotate | undefined {
    return this.pinchRotateInstance();
  }
}
