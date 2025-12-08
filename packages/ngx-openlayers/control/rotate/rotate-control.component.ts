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
import { EventsKey } from 'ol/events';
import { ObjectEvent } from 'ol/Object';
import { unByKey } from 'ol/Observable';
import BaseEvent from 'ol/events/Event';
import MapEvent from 'ol/MapEvent';
import Rotate from 'ol/control/Rotate';

@Component({
  selector: 'wol-rotate-control',
  exportAs: 'wolRotateControl',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolRotateControlComponent implements OnChanges {
  readonly wolClassName = input<string>();
  readonly wolLabel = input<string | HTMLElement>();
  readonly wolTipLabel = input<string>();
  readonly wolCompassClassName = input<string>();
  readonly wolDuration = input<number>();
  readonly wolAutoHide = input<boolean>();
  readonly wolRender = input<(event: MapEvent) => void>();
  readonly wolResetNorth = input<() => void>();
  readonly wolTarget = input<string | HTMLElement>();
  readonly wolProperties = input<WolProperties>();

  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
  readonly wolPropertyChange = output<ObjectEvent>();

  private instance?: Rotate;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useControlHostRef<Rotate>('Rotate');
    const eventsKeyMap: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const rotate = new Rotate({
        className: this.wolClassName(),
        label: this.wolLabel(),
        tipLabel: this.wolTipLabel(),
        compassClassName: this.wolCompassClassName(),
        duration: this.wolDuration(),
        autoHide: this.wolAutoHide(),
        render: this.wolRender(),
        resetNorth: this.wolResetNorth(),
        target: this.wolTarget(),
      });

      if (this.wolProperties()) {
        rotate.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKeyMap['change'] = rotate.on('change', (event) => this.wolChange.emit(event));

      eventsKeyMap['error'] = rotate.on('error', (event) => this.wolError.emit(event));

      eventsKeyMap['propertychange'] = rotate.on('propertychange', (event) =>
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
        hostRef.addControl(rotate);
      });

      this.instance = rotate;
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
          this.instance.setProperties(change.currentValue);
          break;
        case 'wolTarget':
          this.instance.setTarget(change.currentValue);
          break;
      }
    }
  }

  /**
   * Get the underlying OpenLayers Rotate control instance.
   * @returns The Rotate control instance
   */
  getInstance(): Rotate | undefined {
    return this.instance;
  }
}
