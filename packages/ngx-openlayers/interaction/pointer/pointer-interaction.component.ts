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
import BaseEvent from 'ol/events/Event';
import PointerInteraction from 'ol/interaction/Pointer';
import MapBrowserEvent from 'ol/MapBrowserEvent';

@Component({
  selector: 'wol-pointer-interaction',
  exportAs: 'wolPointerInteraction',
  template: '<ng-content />',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolPointerInteractionComponent implements OnChanges {
  readonly wolActive = model(true);
  readonly wolHandleDownEvent = input<(event: MapBrowserEvent) => boolean>();
  readonly wolHandleDragEvent = input<(event: MapBrowserEvent) => void>();
  readonly wolHandleEvent = input<(event: MapBrowserEvent) => boolean>();
  readonly wolHandleMoveEvent = input<(event: MapBrowserEvent) => void>();
  readonly wolHandleUpEvent = input<(event: MapBrowserEvent) => boolean>();
  readonly wolStopDown = input<(isDblClick: boolean) => boolean>();
  readonly wolProperties = input<WolProperties>();

  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
  readonly wolPropertyChange = output<ObjectEvent>();

  private instance?: PointerInteraction;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useInteractionHostRef<PointerInteraction>('PointerInteraction');
    const eventsKeyMap: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const pointerInteraction = new PointerInteraction({
        handleDownEvent: this.wolHandleDownEvent(),
        handleDragEvent: this.wolHandleDragEvent(),
        handleEvent: this.wolHandleEvent(),
        handleMoveEvent: this.wolHandleMoveEvent(),
        handleUpEvent: this.wolHandleUpEvent(),
        stopDown: this.wolStopDown(),
      });

      pointerInteraction.setActive(this.wolActive());

      if (this.wolProperties()) {
        pointerInteraction.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKeyMap['change'] = pointerInteraction.on('change', (event) => {
        this.wolChange.emit(event);
      });

      eventsKeyMap['change:active'] = pointerInteraction.on('change:active', () =>
        this.wolActive.set(pointerInteraction.getActive()),
      );

      eventsKeyMap['error'] = pointerInteraction.on('error', (event) => {
        this.wolError.emit(event);
      });

      eventsKeyMap['propertychange'] = pointerInteraction.on('propertychange', (event) => {
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
        hostRef.addInteraction(pointerInteraction);
      });

      this.instance = pointerInteraction;
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
   * Get the underlying OpenLayers PointerInteraction control instance.
   * @returns The PointerInteraction control instance
   */
  getInstance(): PointerInteraction | undefined {
    return this.instance;
  }
}
