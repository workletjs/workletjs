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
import MapBrowserEvent from 'ol/MapBrowserEvent';
import DragBox, { DragBoxEvent, EndCondition } from 'ol/interaction/DragBox';

@Component({
  selector: 'wol-drag-box-interaction',
  exportAs: 'wolDragBoxInteraction',
  template: '<ng-content />',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolDragBoxInteractionComponent implements OnChanges {
  readonly wolActive = model(true);
  readonly wolClassName = input<string>();
  readonly wolCondition = input<Condition>();
  readonly wolMinArea = input<number>();
  readonly wolBoxEndCondition = input<EndCondition>();
  readonly wolOnBoxEnd = input<(event: MapBrowserEvent) => void>();
  readonly wolProperties = input<WolProperties>();

  readonly wolBoxCancel = output<DragBoxEvent>();
  readonly wolBoxDrag = output<DragBoxEvent>();
  readonly wolBoxEnd = output<DragBoxEvent>();
  readonly wolBoxStart = output<DragBoxEvent>();
  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
  readonly wolPropertyChange = output<ObjectEvent>();

  private instance?: DragBox;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useInteractionHostRef<DragBox>('DragBox');
    const eventsKeyMap: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const dragBox = new DragBox({
        className: this.wolClassName(),
        condition: this.wolCondition(),
        minArea: this.wolMinArea(),
        boxEndCondition: this.wolBoxEndCondition(),
        onBoxEnd: this.wolOnBoxEnd(),
      });

      dragBox.setActive(this.wolActive());

      if (this.wolProperties()) {
        dragBox.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKeyMap['boxcancel'] = dragBox.on('boxcancel', (event) => this.wolBoxCancel.emit(event));

      eventsKeyMap['boxdrag'] = dragBox.on('boxdrag', (event) => this.wolBoxDrag.emit(event));

      eventsKeyMap['boxend'] = dragBox.on('boxend', (event) => this.wolBoxEnd.emit(event));

      eventsKeyMap['boxstart'] = dragBox.on('boxstart', (event) => this.wolBoxStart.emit(event));

      eventsKeyMap['change'] = dragBox.on('change', (event) => this.wolChange.emit(event));

      eventsKeyMap['change:active'] = dragBox.on('change:active', () =>
        this.wolActive.set(dragBox.getActive()),
      );

      eventsKeyMap['error'] = dragBox.on('error', (event) => this.wolError.emit(event));

      eventsKeyMap['propertychange'] = dragBox.on('propertychange', (event) =>
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
        hostRef.addInteraction(dragBox);
      });

      this.instance = dragBox;
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
   * Get the underlying OpenLayers DragBox control instance.
   * @returns The DragBox control instance
   */
  getInstance(): DragBox | undefined {
    return this.instance;
  }
}
