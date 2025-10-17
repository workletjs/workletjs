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
import { useControlHostRef } from '@workletjs/ngx-openlayers/control/control';
import { EventsKey } from 'ol/events';
import { ObjectEvent } from 'ol/Object';
import { unByKey } from 'ol/Observable';
import MapEvent from 'ol/MapEvent';
import BaseEvent from 'ol/events/Event';
import ScaleLine, { Units } from 'ol/control/ScaleLine';

@Component({
  selector: 'wol-scale-line-control',
  imports: [],
  template: `<ng-content />`,
  styles: ``,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolScaleLineControlComponent implements OnChanges {
  readonly wolClassName = input<string>();
  readonly wolMinWidth = input<number>();
  readonly wolMaxWidth = input<number>();
  readonly wolRender = input<(evt: MapEvent) => void>();
  readonly wolTarget = input<HTMLElement | string>();
  readonly wolUnits = model<Units>();
  readonly wolBar = input<boolean>();
  readonly wolSteps = input<number>();
  readonly wolText = input<boolean>();
  readonly wolDpi = input<number>();
  readonly wolProperties = input<Record<string, WolProperties>>();

  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
  readonly wolPropertyChange = output<ObjectEvent>();

  private instance?: ScaleLine;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const host = useControlHostRef('ScaleLine');
    const eventsKey: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const scaleLine = new ScaleLine({
        className: this.wolClassName(),
        minWidth: this.wolMinWidth(),
        maxWidth: this.wolMaxWidth(),
        render: this.wolRender(),
        target: this.wolTarget(),
        units: this.wolUnits(),
        bar: this.wolBar(),
        steps: this.wolSteps(),
        text: this.wolText(),
        dpi: this.wolDpi(),
      });

      if (this.wolProperties()) {
        scaleLine.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKey['change'] = scaleLine.on('change', (evt) => this.wolChange.emit(evt));

      eventsKey['change:units'] = scaleLine.on('change:units', () =>
        this.wolUnits.set(scaleLine.getUnits()),
      );

      eventsKey['error'] = scaleLine.on('error', (evt) => this.wolError.emit(evt));

      eventsKey['propertychange'] = scaleLine.on('propertychange', (evt) =>
        this.wolPropertyChange.emit(evt),
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
        host.addControl(scaleLine);
      });

      this.instance = scaleLine;
    });

    destroyRef.onDestroy(() => {
      if (this.instance) {
        unByKey(Object.values(eventsKey));
        host.removeControl(this.instance);
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
        case 'wolDpi':
          this.instance.setDpi(change.currentValue);
          break;
        case 'wolProperties':
          this.instance.setProperties(change.currentValue ?? {}, false);
          break;
        case 'wolTarget':
          this.instance.setTarget(change.currentValue);
          break;
        case 'wolUnits':
          this.instance.setUnits(change.currentValue);
          break;
      }
    }
  }

  /**
   * Get the underlying OpenLayers ScaleLine instance.
   * @returns The OpenLayers ScaleLine instance, or undefined if not yet created.
   */
  getInstance(): ScaleLine | undefined {
    return this.instance;
  }
}
