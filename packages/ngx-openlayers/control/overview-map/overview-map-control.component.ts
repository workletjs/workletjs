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

import Collection from 'ol/Collection';
import MapEvent from 'ol/MapEvent';
import { ObjectEvent } from 'ol/Object';
import { unByKey } from 'ol/Observable';
import View from 'ol/View';
import OverviewMap from 'ol/control/OverviewMap';
import { EventsKey } from 'ol/events';
import BaseEvent from 'ol/events/Event';
import BaseLayer from 'ol/layer/Base';

import { useControlHostRef } from '@workletjs/ngx-openlayers/control/control';
import { WolProperties } from '@workletjs/ngx-openlayers/core/types';

/**
 * Shows an overview map with a box marking the main map's current viewport. See
 * [OpenLayers OverviewMap](https://openlayers.org/en/latest/apidoc/module-ol_control_OverviewMap-OverviewMap.html)
 * .
 */
@Component({
  selector: 'wol-overview-map-control',
  exportAs: 'wolOverviewMapControl',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolOverviewMapControlComponent implements OnChanges {
  /**
   * CSS class for the overview map. Defaults to `ol-overviewmap`. Read at creation.
   */
  readonly wolClassName = input<string>();
  /**
   * Whether the overview map starts collapsed. Defaults to `true`. Update the binding to change
   * the state while the control is collapsible.
   */
  readonly wolCollapsed = input<boolean>();
  /**
   * Text or element shown on the button when the overview map is expanded. Defaults to `‹`. Read
   * at creation.
   */
  readonly wolCollapseLabel = input<string | HTMLElement>();
  /**
   * Whether the overview map can collapse. Defaults to `true` and can be updated after creation.
   */
  readonly wolCollapsible = input<boolean>();
  /**
   * Text or element shown on the button when the overview map is collapsed. Defaults to `›`.
   * Read at creation.
   */
  readonly wolLabel = input<string | HTMLElement>();
  /**
   * Array or collection of layers initially added to the overview map. Read at creation.
   */
  readonly wolLayers = input<BaseLayer[] | Collection<BaseLayer>>();
  /**
   * Custom rendering callback that receives the map render event on an animation frame. It
   * replaces the default control renderer. Read at creation.
   */
  readonly wolRender = input<(event: MapEvent) => void>();
  /**
   * Whether the overview map rotates with the main view. Defaults to `false` and can be updated
   * after creation.
   */
  readonly wolRotateWithView = input<boolean>();
  /**
   * Element or element ID to host the control. The default is the map's control container. Set
   * this before the control is added to its map. Changing the target after attachment does not
   * move the control.
   */
  readonly wolTarget = input<string | HTMLElement>();
  /**
   * Tooltip text for the overview map button. Defaults to `Overview map`. Read
   * at creation.
   */
  readonly wolTipLabel = input<string>();
  /**
   * View for the overview map. Use the same projection as the main map. When omitted, OpenLayers
   * creates a view and matches the main map's projection. Read at creation.
   */
  readonly wolView = input<View>();
  /**
   * Observable properties to set on the OpenLayers instance. Updates assign the supplied keys and
   * leave other properties in place.
   */
  readonly wolProperties = input<WolProperties>();

  /**
   * Emits the native `change` event when the instance revision increases.
   */
  readonly wolChange = output<BaseEvent>();
  /**
   * Emits the native `error` event when the OpenLayers instance dispatches one.
   */
  readonly wolError = output<BaseEvent>();
  /**
   * Emits the native `propertychange` event with the changed property key and its previous value.
   */
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
        case 'wolCollapsed':
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
   * Accesses the OpenLayers OverviewMap control.
   *
   * @returns The underlying instance, or `undefined` before creation and after component
   * teardown.
   */
  getInstance(): OverviewMap | undefined {
    return this.instance;
  }
}
