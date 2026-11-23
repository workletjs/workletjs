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
import FullScreen from 'ol/control/FullScreen';
import { EventsKey } from 'ol/events';
import BaseEvent from 'ol/events/Event';

import { useControlHostRef } from '@workletjs/ngx-openlayers/control/control';
import { WolProperties } from '@workletjs/ngx-openlayers/core/types';

/**
 * Toggles full-screen display of the map viewport's containing element or a specified element.
 * See
 * [OpenLayers FullScreen](https://openlayers.org/en/latest/apidoc/module-ol_control_FullScreen-FullScreen.html)
 * .
 */
@Component({
  selector: 'wol-fullscreen-control',
  exportAs: 'wolFullscreenControl',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolFullScreenControlComponent implements OnChanges {
  /**
   * CSS class for the full-screen control. Defaults to `ol-full-screen`. Read at creation.
   */
  readonly wolClassName = input<string>();
  /**
   * Text, text node, or element used for the button outside full-screen mode. Defaults to `⛶`.
   * Read at creation.
   */
  readonly wolLabel = input<string | Text | HTMLElement>();
  /**
   * Text, text node, or element used for the button in full-screen mode. Defaults to `×`. Read
   * at creation.
   */
  readonly wolLabelActive = input<string | Text | HTMLElement>();
  /**
   * CSS class of the button in full-screen mode. Defaults to the control class followed by
   * `-true`. Read at creation.
   */
  readonly wolActiveClassName = input<string>();
  /**
   * CSS class of the button outside full-screen mode. Defaults to the control class followed by
   * `-false`. Read at creation.
   */
  readonly wolInactiveClassName = input<string>();
  /**
   * Tooltip text for the button. Defaults to `Toggle full-screen`. Read at
   * creation.
   */
  readonly wolTipLabel = input<string>();
  /**
   * Whether to request keyboard access in full-screen mode. Defaults to `false`. Read at
   * creation.
   */
  readonly wolKeys = input<boolean>();
  /**
   * Element or element ID to host the control. The default is the map's control container. Set
   * this before the control is added to its map. Changing the target after attachment does not
   * move the control.
   */
  readonly wolTarget = input<HTMLElement | string>();
  /**
   * Element or element ID to display full screen. Defaults to the element containing the map
   * viewport. Read at creation.
   */
  readonly wolSource = input<HTMLElement | string>();
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
   * Emits when OpenLayers enters full-screen mode for the attached map. The Angular output has no
   * payload.
   */
  readonly wolEnterFullscreen = output<void>();
  /**
   * Emits the native `error` event when the OpenLayers instance dispatches one.
   */
  readonly wolError = output<BaseEvent>();
  /**
   * Emits when OpenLayers leaves full-screen mode for the attached map. The Angular output has no
   * payload.
   */
  readonly wolLeaveFullscreen = output<void>();
  /**
   * Emits the native `propertychange` event with the changed property key and its previous value.
   */
  readonly wolPropertyChange = output<ObjectEvent>();

  private instance?: FullScreen;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useControlHostRef<FullScreen>('FullScreen');
    const eventsKeyMap: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const fullscreen = new FullScreen({
        className: this.wolClassName(),
        label: this.wolLabel(),
        labelActive: this.wolLabelActive(),
        activeClassName: this.wolActiveClassName(),
        inactiveClassName: this.wolInactiveClassName(),
        tipLabel: this.wolTipLabel(),
        keys: this.wolKeys(),
        target: this.wolTarget(),
        source: this.wolSource(),
      });

      if (this.wolProperties()) {
        fullscreen.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKeyMap['change'] = fullscreen.on('change', (evt) => this.wolChange.emit(evt));

      eventsKeyMap['enterfullscreen'] = fullscreen.on('enterfullscreen', () =>
        this.wolEnterFullscreen.emit(),
      );

      eventsKeyMap['error'] = fullscreen.on('error', (evt) => this.wolError.emit(evt));

      eventsKeyMap['leavefullscreen'] = fullscreen.on('leavefullscreen', () =>
        this.wolLeaveFullscreen.emit(),
      );

      eventsKeyMap['propertychange'] = fullscreen.on('propertychange', (evt) =>
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
        hostRef.addControl(fullscreen);
      });

      this.instance = fullscreen;
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
   * Accesses the OpenLayers FullScreen control.
   *
   * @returns The underlying instance, or `undefined` before creation and after component
   * teardown.
   */
  getInstance(): FullScreen | undefined {
    return this.instance;
  }
}
