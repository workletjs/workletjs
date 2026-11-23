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
import Rotate from 'ol/control/Rotate';
import { EventsKey } from 'ol/events';
import BaseEvent from 'ol/events/Event';

import { useControlHostRef } from '@workletjs/ngx-openlayers/control/control';
import { WolProperties } from '@workletjs/ngx-openlayers/core/types';

/**
 * Displays the map's rotation and provides a button to reset the bearing. See
 * [OpenLayers Rotate](https://openlayers.org/en/latest/apidoc/module-ol_control_Rotate-Rotate.html)
 * .
 */
@Component({
  selector: 'wol-rotate-control',
  exportAs: 'wolRotateControl',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolRotateControlComponent implements OnChanges {
  /**
   * CSS class for the rotation control. Defaults to `ol-rotate`. Read at creation.
   */
  readonly wolClassName = input<string>();
  /**
   * Text or element displayed on the rotate button. Defaults to `⇧`. Read at creation.
   */
  readonly wolLabel = input<string | HTMLElement>();
  /**
   * Tooltip text for the rotate button. Defaults to `Reset rotation`. Read at
   * creation.
   */
  readonly wolTipLabel = input<string>();
  /**
   * CSS class applied to the compass label. Defaults to `ol-compass`. Read at creation.
   */
  readonly wolCompassClassName = input<string>();
  /**
   * Duration of the north-reset animation in milliseconds. Defaults to `250`. Read at creation.
   */
  readonly wolDuration = input<number>();
  /**
   * Whether to hide the control at zero rotation. Defaults to `true`. Read at creation.
   */
  readonly wolAutoHide = input<boolean>();
  /**
   * Custom rendering callback that receives the map render event on an animation frame. It
   * replaces the default control renderer. Read at creation.
   */
  readonly wolRender = input<(event: MapEvent) => void>();
  /**
   * Callback invoked when the rotate button is clicked. Overrides the built-in reset to zero
   * rotation. Read at creation.
   */
  readonly wolResetNorth = input<() => void>();
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
   * Accesses the OpenLayers Rotate control.
   *
   * @returns The underlying instance, or `undefined` before creation and after component
   * teardown.
   */
  getInstance(): Rotate | undefined {
    return this.instance;
  }
}
