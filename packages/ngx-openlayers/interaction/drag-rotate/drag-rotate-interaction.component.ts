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
import DragRotate from 'ol/interaction/DragRotate';

@Component({
  selector: 'wol-drag-rotate-interaction',
  exportAs: 'wolDragRotateInteraction',
  template: '<ng-content />',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolDragRotateInteractionComponent implements OnChanges {
  readonly wolActive = model(true);
  readonly wolCondition = input<Condition>();
  readonly wolDuration = input<number>();
  readonly wolProperties = input<WolProperties>();

  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
  readonly wolPropertyChange = output<ObjectEvent>();

  private instance?: DragRotate;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useInteractionHostRef<DragRotate>('DragRotate');
    const eventsKeyMap: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const dragRotate = new DragRotate({
        condition: this.wolCondition(),
        duration: this.wolDuration(),
      });

      dragRotate.setActive(this.wolActive());

      if (this.wolProperties()) {
        dragRotate.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKeyMap['change'] = dragRotate.on('change', (event) => this.wolChange.emit(event));

      eventsKeyMap['change:active'] = dragRotate.on('change:active', () =>
        this.wolActive.set(dragRotate.getActive()),
      );

      eventsKeyMap['error'] = dragRotate.on('error', (event) => this.wolError.emit(event));

      eventsKeyMap['propertychange'] = dragRotate.on('propertychange', (event) =>
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
        hostRef.addInteraction(dragRotate);
      });

      this.instance = dragRotate;
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
   * Get the underlying OpenLayers DragRotate control instance.
   * @returns The DragRotate control instance
   */
  getInstance(): DragRotate | undefined {
    return this.instance;
  }
}
