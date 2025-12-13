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
import { unByKey } from 'ol/Observable';
import { ObjectEvent } from 'ol/Object';
import BaseEvent from 'ol/events/Event';
import Kinetic from 'ol/Kinetic';
import DragPan from 'ol/interaction/DragPan';

@Component({
  selector: 'wol-drag-pan-interaction',
  exportAs: 'wolDragPanInteraction',
  template: '<ng-content />',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolDragPanInteractionComponent implements OnChanges {
  readonly wolActive = model(true);
  readonly wolCondition = input<Condition>();
  readonly wolOnFocusOnly = input<boolean>();
  readonly wolKinetic = input<Kinetic>();
  readonly wolProperties = input<WolProperties>();

  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
  readonly wolPropertyChange = output<ObjectEvent>();

  private instance?: DragPan;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useInteractionHostRef<DragPan>('DragPan');
    const eventsKeyMap: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const dragPan = new DragPan({
        condition: this.wolCondition(),
        onFocusOnly: this.wolOnFocusOnly(),
        kinetic: this.wolKinetic(),
      });

      dragPan.setActive(this.wolActive());

      if (this.wolProperties()) {
        dragPan.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKeyMap['change'] = dragPan.on('change', (event) => this.wolChange.emit(event));

      eventsKeyMap['change:active'] = dragPan.on('change:active', () =>
        this.wolActive.set(dragPan.getActive()),
      );

      eventsKeyMap['error'] = dragPan.on('error', (event) => this.wolError.emit(event));

      eventsKeyMap['propertychange'] = dragPan.on('propertychange', (event) =>
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
        hostRef.addInteraction(dragPan);
      });

      this.instance = dragPan;
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
   * Get the underlying OpenLayers DragPan control instance.
   * @returns The DragPan control instance
   */
  getInstance(): DragPan | undefined {
    return this.instance;
  }
}
