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

/**
 * Displays attribution notices from rendered layers and from explicitly configured attribution
 * strings. See
 * [OpenLayers Attribution](https://openlayers.org/en/latest/apidoc/module-ol_control_Attribution-Attribution.html)
 * .
 */
@Component({
  selector: 'wol-attribution-control',
  exportAs: 'wolAttributionControl',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolAttributionControlComponent implements OnChanges {
  /**
   * CSS class for the attribution control. Defaults to `ol-attribution`. Read at creation.
   */
  readonly wolClassName = input<string>();
  /**
   * Element or element ID to host the control. The default is the map's control container. Set
   * this before the control is added to its map. Changing the target after attachment does not
   * move the control.
   */
  readonly wolTarget = input<string | HTMLElement>();
  /**
   * Whether the notice can collapse. When omitted at creation, the rendered sources decide
   * through their attribution settings. The binding can update collapsibility after creation.
   */
  readonly wolCollapsible = input<boolean>();
  /**
   * Whether the notice starts collapsed. Defaults to `true`. Update the binding to change the
   * state while the control is collapsible.
   */
  readonly wolCollapsed = input<boolean>();
  /**
   * Tooltip text for the attribution button. Defaults to `Attributions`. Read at
   * creation.
   */
  readonly wolTipLabel = input<string>();
  /**
   * Text or element shown on the button when the notice is collapsed. Defaults to `i`. Read at
   * creation.
   */
  readonly wolLabel = input<string | HTMLElement>();
  /**
   * CSS class of the expand label. Defaults to the control class followed by `-expand`. Read at
   * creation.
   */
  readonly wolExpandClassName = input<string>();
  /**
   * Text or element shown on the button when the notice is expanded. Defaults to `›`. Read at
   * creation.
   */
  readonly wolCollapseLabel = input<string | HTMLElement>();
  /**
   * CSS class of the collapse label. Defaults to the control class followed by `-collapse`. Read
   * at creation.
   */
  readonly wolCollapseClassName = input<string>();
  /**
   * Custom rendering callback that receives the map render event on an animation frame. It
   * replaces the default control renderer. Read at creation.
   */
  readonly wolRender = input<(event: MapEvent) => void>();
  /**
   * HTML attribution text or a list of attribution strings shown regardless of which layers
   * render. Provide trusted or sanitized content. Read at creation.
   */
  readonly wolAttributions = input<string | string[]>();
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
   * Accesses the OpenLayers Attribution control.
   *
   * @returns The underlying instance, or `undefined` before creation and after component
   * teardown.
   */
  getInstance(): Attribution | undefined {
    return this.instance;
  }
}
