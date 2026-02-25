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

import MapEvent from 'ol/MapEvent';
import { ObjectEvent } from 'ol/Object';
import { unByKey } from 'ol/Observable';
import Attribution from 'ol/control/Attribution';
import { EventsKey } from 'ol/events';
import BaseEvent from 'ol/events/Event';

import { useControlHostRef } from '@workletjs/ngx-openlayers/control/control';
import { WolProperties } from '@workletjs/ngx-openlayers/core/types';

@Component({
  selector: 'wol-attribution-control',
  exportAs: 'wolAttributionControl',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolAttributionControlComponent implements OnChanges {
  readonly wolClassName = input<string>();
  readonly wolTarget = input<string | HTMLElement>();
  readonly wolCollapsible = input<boolean>();
  readonly wolCollapsed = input<boolean>();
  readonly wolTipLabel = input<string>();
  readonly wolLabel = input<string | HTMLElement>();
  readonly wolExpandClassName = input<string>();
  readonly wolCollapseLabel = input<string | HTMLElement>();
  readonly wolCollapseClassName = input<string>();
  readonly wolRender = input<(event: MapEvent) => void>();
  readonly wolAttributions = input<string | string[]>();
  readonly wolProperties = input<WolProperties>();

  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
  readonly wolPropertyChange = output<ObjectEvent>();

  private instance?: Attribution;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useControlHostRef<Attribution>('Attribution');
    const eventsKeyMap: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const attribution = new Attribution({
        className: this.wolClassName(),
        target: this.wolTarget(),
        collapsible: this.wolCollapsible(),
        collapsed: this.wolCollapsed(),
        tipLabel: this.wolTipLabel(),
        label: this.wolLabel(),
        expandClassName: this.wolExpandClassName(),
        collapseLabel: this.wolCollapseLabel(),
        collapseClassName: this.wolCollapseClassName(),
        render: this.wolRender(),
        attributions: this.wolAttributions(),
      });

      if (this.wolProperties()) {
        attribution.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKeyMap['change'] = attribution.on('change', (evt) => this.wolChange.emit(evt));

      eventsKeyMap['error'] = attribution.on('error', (evt) => this.wolError.emit(evt));

      eventsKeyMap['propertychange'] = attribution.on('propertychange', (evt) =>
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
        hostRef.addControl(attribution);
      });

      this.instance = attribution;
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
        case 'wolCollapsed':
          this.instance.setCollapsed(change.currentValue);
          break;
        case 'wolCollapsible':
          this.instance.setCollapsible(change.currentValue);
          break;
        case 'wolProperties':
          this.instance.setProperties(change.currentValue ?? {});
          break;
      }
    }
  }

  /**
   * Get the OpenLayers Attribution control instance.
   * @returns The Attribution control instance
   */
  getInstance(): Attribution | undefined {
    return this.instance;
  }
}
