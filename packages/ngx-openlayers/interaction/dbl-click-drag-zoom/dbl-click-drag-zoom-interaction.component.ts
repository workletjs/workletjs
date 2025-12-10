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
import DblClickDragZoom from 'ol/interaction/DblClickDragZoom';

@Component({
  selector: 'wol-dbl-click-drag-zoom-interaction',
  exportAs: 'wolDblClickDragZoomInteraction',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolDblClickDragZoomInteractionComponent implements OnChanges {
  readonly wolActive = model(true);
  readonly wolDuration = input<number>();
  readonly wolDelta = input<number>();
  readonly wolStopDown = input<(isDblClick: boolean) => boolean>();
  readonly wolProperties = input<WolProperties>();

  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
  readonly wolPropertyChange = output<ObjectEvent>();

  private instance?: DblClickDragZoom;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useInteractionHostRef<DblClickDragZoom>('DblClickDragZoom');
    const eventsKeyMap: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const dblClickDragZoom = new DblClickDragZoom({
        duration: this.wolDuration(),
        delta: this.wolDelta(),
        stopDown: this.wolStopDown(),
      });

      dblClickDragZoom.setActive(this.wolActive());

      if (this.wolProperties()) {
        dblClickDragZoom.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKeyMap['change'] = dblClickDragZoom.on('change', (event) => this.wolChange.emit(event));

      eventsKeyMap['change:active'] = dblClickDragZoom.on('change:active', () => {
        this.wolActive.set(dblClickDragZoom.getActive());
      });

      eventsKeyMap['error'] = dblClickDragZoom.on('error', (event) => this.wolError.emit(event));

      eventsKeyMap['propertychange'] = dblClickDragZoom.on('propertychange', (event) =>
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
        hostRef.addInteraction(dblClickDragZoom);
      });

      this.instance = dblClickDragZoom;
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
   * Get the underlying OpenLayers DblClickDragZoom control instance.
   * @returns The DblClickDragZoom control instance
   */
  getInstance(): DblClickDragZoom | undefined {
    return this.instance;
  }
}
