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
  output,
} from '@angular/core';

import { ObjectEvent } from 'ol/Object';
import { unByKey } from 'ol/Observable';
import Zoom from 'ol/control/Zoom';
import { EventsKey } from 'ol/events';
import BaseEvent from 'ol/events/Event';

import { useControlHostRef } from '@workletjs/ngx-openlayers/control/control';
import { WolProperties } from '@workletjs/ngx-openlayers/core/types';

@Component({
  selector: 'wol-zoom-control',
  exportAs: 'wolZoomControl',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolZoomControlComponent implements OnChanges {
  readonly wolDuration = input<number>();
  readonly wolClassName = input<string>();
  readonly wolZoomInClassName = input<string>();
  readonly wolZoomOutClassName = input<string>();
  readonly wolZoomInLabel = input<string | HTMLElement>();
  readonly wolZoomOutLabel = input<string | HTMLElement>();
  readonly wolZoomInTipLabel = input<string>();
  readonly wolZoomOutTipLabel = input<string>();
  readonly wolDelta = input<number>();
  readonly wolTarget = input<string | HTMLElement>();
  readonly wolProperties = input<WolProperties>();

  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
  readonly wolPropertyChange = output<ObjectEvent>();

  private instance?: Zoom;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useControlHostRef<Zoom>('Zoom');
    const eventsKeyMap: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const zoomControl = new Zoom({
        duration: this.wolDuration(),
        className: this.wolClassName(),
        zoomInClassName: this.wolZoomInClassName(),
        zoomOutClassName: this.wolZoomOutClassName(),
        zoomInLabel: this.wolZoomInLabel(),
        zoomOutLabel: this.wolZoomOutLabel(),
        zoomInTipLabel: this.wolZoomInTipLabel(),
        zoomOutTipLabel: this.wolZoomOutTipLabel(),
        delta: this.wolDelta(),
        target: this.wolTarget(),
      });

      if (this.wolProperties()) {
        zoomControl.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKeyMap['change'] = zoomControl.on('change', (event) => this.wolChange.emit(event));

      eventsKeyMap['error'] = zoomControl.on('error', (event) => this.wolError.emit(event));

      eventsKeyMap['propertychange'] = zoomControl.on('propertychange', (event) =>
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
        hostRef.addControl(zoomControl);
      });

      this.instance = zoomControl;
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
   * Get the underlying OpenLayers Zoom instance.
   * @returns The Zoom instance
   */
  getInstance(): Zoom | undefined {
    return this.instance;
  }
}
