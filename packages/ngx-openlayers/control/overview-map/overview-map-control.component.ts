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
import Collection from 'ol/Collection';
import { EventsKey } from 'ol/events';
import { ObjectEvent } from 'ol/Object';
import { unByKey } from 'ol/Observable';
import BaseEvent from 'ol/events/Event';
import BaseLayer from 'ol/layer/Base';
import MapEvent from 'ol/MapEvent';
import View from 'ol/View';
import OverviewMap from 'ol/control/OverviewMap';

@Component({
  selector: 'wol-overview-map-control',
  exportAs: 'wolOverviewMapControl',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolOverviewMapControlComponent implements OnChanges {
  readonly wolClassName = input<string>();
  readonly wolCollapsed = input<boolean>();
  readonly wolCollapseLabel = input<string | HTMLElement>();
  readonly wolCollapsible = input<boolean>();
  readonly wolLabel = input<string | HTMLElement>();
  readonly wolLayers = input<BaseLayer[] | Collection<BaseLayer>>();
  readonly wolRender = input<(event: MapEvent) => void>();
  readonly wolRotateWithView = input<boolean>();
  readonly wolTarget = input<string | HTMLElement>();
  readonly wolTipLabel = input<string>();
  readonly wolView = input<View>();
  readonly wolProperties = input<WolProperties>();

  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
  readonly wolPropertyChange = output<ObjectEvent>();

  private instance?: OverviewMap;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useControlHostRef<OverviewMap>('OverviewMap');
    const eventsKeyMap: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const overviewMap = new OverviewMap({
        className: this.wolClassName(),
        collapsed: this.wolCollapsed(),
        collapseLabel: this.wolCollapseLabel(),
        collapsible: this.wolCollapsible(),
        label: this.wolLabel(),
        layers: this.wolLayers(),
        render: this.wolRender(),
        rotateWithView: this.wolRotateWithView(),
        target: this.wolTarget(),
        tipLabel: this.wolTipLabel(),
        view: this.wolView(),
      });

      if (this.wolProperties()) {
        overviewMap.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKeyMap['change'] = overviewMap.on('change', (event) => this.wolChange.emit(event));

      eventsKeyMap['error'] = overviewMap.on('error', (event) => this.wolError.emit(event));

      eventsKeyMap['propertychange'] = overviewMap.on('propertychange', (event) =>
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
        hostRef.addControl(overviewMap);
      });

      this.instance = overviewMap;
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
        case 'wolColapsed':
          this.instance.setCollapsed(change.currentValue);
          break;
        case 'wolCollapsible':
          this.instance.setCollapsible(change.currentValue);
          break;
        case 'wolProperties':
          this.instance.setProperties(change.currentValue ?? {}, false);
          break;
        case 'wolRotateWithView':
          this.instance.setRotateWithView(change.currentValue);
          break;
        case 'wolTarget':
          this.instance.setTarget(change.currentValue);
          break;
      }
    }
  }

  /**
   * Get the underlying OpenLayers OverviewMap instance.
   * @returns The OverviewMap instance
   */
  getInstance(): OverviewMap | undefined {
    return this.instance;
  }
}
