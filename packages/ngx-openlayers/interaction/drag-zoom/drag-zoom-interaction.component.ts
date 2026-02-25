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

@Component({
  selector: 'wol-drag-zoom-interaction',
  exportAs: 'wolDragZoomInteraction',
  template: '<ng-content />',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolDragZoomInteractionComponent implements OnChanges {
  readonly wolActive = model(true);
  readonly wolClassName = input<string>();
  readonly wolCondition = input<Condition>();
  readonly wolDuration = input<number>();
  readonly wolOut = input<boolean>();
  readonly wolMinArea = input<number>();
  readonly wolProperties = input<WolProperties>();

  readonly wolBoxCancel = output<DragBoxEvent>();
  readonly wolBoxDrag = output<DragBoxEvent>();
  readonly wolBoxEnd = output<DragBoxEvent>();
  readonly wolBoxStart = output<DragBoxEvent>();
  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
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
   * Get the underlying OpenLayers DragZoom control instance.
   * @returns The DragZoom control instance
   */
  getInstance(): DragZoom | undefined {
    return this.instance;
  }
}
