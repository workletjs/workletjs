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
import ZoomToExtent from 'ol/control/ZoomToExtent';
import { EventsKey } from 'ol/events';
import BaseEvent from 'ol/events/Event';
import { Extent } from 'ol/extent';

import { useControlHostRef } from '@workletjs/ngx-openlayers/control/control';
import { WolProperties } from '@workletjs/ngx-openlayers/core/types';

/**
 * Fits the map view to a configured extent when the control's button is clicked. See
 * [OpenLayers ZoomToExtent](https://openlayers.org/en/latest/apidoc/module-ol_control_ZoomToExtent-ZoomToExtent.html)
 * .
 */
@Component({
  selector: 'wol-zoom-to-extent-control',
  exportAs: 'wolZoomToExtentControl',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolZoomToExtentControlComponent implements OnChanges {
  /**
   * CSS class for the fit-to-extent control. Defaults to `ol-zoom-extent`. Read at creation.
   */
  readonly wolClassName = input<string>();
  /**
   * Element or element ID to host the control. The default is the map's control container. Set
   * this before the control is added to its map. Changing the target after attachment does not
   * move the control.
   */
  readonly wolTarget = input<string | HTMLElement>();
  /**
   * Text or element displayed on the fit button. Defaults to `E`. Read at creation.
   */
  readonly wolLabel = input<string | HTMLElement>();
  /**
   * Tooltip text for the fit button. Defaults to `Fit to extent`. Read at
   * creation.
   */
  readonly wolTipLabel = input<string>();
  /**
   * Extent fitted on a button click. Defaults to the validity extent of the view projection. Read
   * at creation.
   */
  readonly wolExtent = input<Extent>();
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
   * Accesses the OpenLayers ZoomToExtent control.
   *
   * @returns The underlying instance, or `undefined` before creation and after component
   * teardown.
   */
  getInstance(): ZoomToExtent | undefined {
    return this.instance;
  }
}
