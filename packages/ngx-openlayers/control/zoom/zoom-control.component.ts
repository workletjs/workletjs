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

/**
 * Adds zoom-in and zoom-out buttons for changing the view zoom in steps. See
 * [OpenLayers Zoom](https://openlayers.org/en/latest/apidoc/module-ol_control_Zoom-Zoom.html).
 */
@Component({
  selector: 'wol-zoom-control',
  exportAs: 'wolZoomControl',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolZoomControlComponent implements OnChanges {
  /**
   * Animation duration in milliseconds for a button click. Defaults to `250`. Read at creation.
   */
  readonly wolDuration = input<number>();
  /**
   * CSS class for the zoom control. Defaults to `ol-zoom`. Read at creation.
   */
  readonly wolClassName = input<string>();
  /**
   * CSS class for the zoom-in button. Defaults to the control class followed by `-in`. Read at
   * creation.
   */
  readonly wolZoomInClassName = input<string>();
  /**
   * CSS class for the zoom-out button. Defaults to the control class followed by `-out`. Read at
   * creation.
   */
  readonly wolZoomOutClassName = input<string>();
  /**
   * Text or element displayed on the zoom-in button. Defaults to `+`. Read at creation.
   */
  readonly wolZoomInLabel = input<string | HTMLElement>();
  /**
   * Text or element displayed on the zoom-out button. Defaults to `–`. Read at creation.
   */
  readonly wolZoomOutLabel = input<string | HTMLElement>();
  /**
   * Tooltip text of the zoom-in button. Defaults to `Zoom in`. Read at creation.
   */
  readonly wolZoomInTipLabel = input<string>();
  /**
   * Tooltip text of the zoom-out button. Defaults to `Zoom out`. Read at
   * creation.
   */
  readonly wolZoomOutTipLabel = input<string>();
  /**
   * Number of zoom levels added or subtracted per button click. Defaults to `1`. Read at
   * creation.
   */
  readonly wolDelta = input<number>();
  /**
   * Element or element ID to host the control. The default is the map's control container. Set
   * this before the control is added to its map. Changing the target after attachment does not
   * move the control.
   */
  readonly wolTarget = input<string | HTMLElement>();
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
   * Accesses the OpenLayers Zoom control.
   *
   * @returns The underlying instance, or `undefined` before creation and after component
   * teardown.
   */
  getInstance(): Zoom | undefined {
    return this.instance;
  }
}
