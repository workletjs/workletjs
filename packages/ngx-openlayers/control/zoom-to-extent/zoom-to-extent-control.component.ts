import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  OnChanges,
  output,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { useControlHostRef } from '@workletjs/ngx-openlayers/control/control';
import { Extent } from 'ol/extent';
import { EventsKey } from 'ol/events';
import { ObjectEvent } from 'ol/Object';
import { unByKey } from 'ol/Observable';
import BaseEvent from 'ol/events/Event';
import ZoomToExtent from 'ol/control/ZoomToExtent';

@Component({
  selector: 'wol-zoom-to-extent-control',
  exportAs: 'wolZoomToExtentControl',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolZoomToExtentControlComponent implements OnChanges {
  readonly wolClassName = input<string>();
  readonly wolTarget = input<string | HTMLElement>();
  readonly wolLabel = input<string | HTMLElement>();
  readonly wolTipLabel = input<string>();
  readonly wolExtent = input<Extent>();
  readonly wolProperties = input<WolProperties>();

  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
  readonly wolPropertyChange = output<ObjectEvent>();

  private instance?: ZoomToExtent;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useControlHostRef<ZoomToExtent>('ZoomToExtent');
    const eventsKeyMap: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const zoomToExtent = new ZoomToExtent({
        className: this.wolClassName(),
        target: this.wolTarget(),
        label: this.wolLabel(),
        tipLabel: this.wolTipLabel(),
        extent: this.wolExtent(),
      });

      if (this.wolProperties()) {
        zoomToExtent.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKeyMap['change'] = zoomToExtent.on('change', (event) => this.wolChange.emit(event));

      eventsKeyMap['error'] = zoomToExtent.on('error', (event) => this.wolError.emit(event));

      eventsKeyMap['propertychange'] = zoomToExtent.on('propertychange', (event) =>
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
        hostRef.addControl(zoomToExtent);
      });

      this.instance = zoomToExtent;
    });

    destroyRef.onDestroy(() => {
      if (this.instance) {
        unByKey(Object.values(eventsKeyMap));
        hostRef.removeControl(this.instance);
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
        case 'wolProperties':
          this.instance.setProperties(change.currentValue ?? {});
          break;
        case 'wolTarget':
          this.instance.setTarget(change.currentValue);
          break;
      }
    }
  }

  /**
   * Get the underlying OpenLayers ZoomToExtent instance.
   * @returns The ZoomToExtent instance
   */
  getInstance(): ZoomToExtent | undefined {
    return this.instance;
  }
}
