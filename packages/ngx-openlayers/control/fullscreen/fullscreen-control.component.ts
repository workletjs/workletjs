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

@Component({
  selector: 'wol-fullscreen-control',
  exportAs: 'wolFullscreenControl',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolFullScreenControlComponent implements OnChanges {
  readonly wolClassName = input<string>();
  readonly wolLabel = input<string | Text | HTMLElement>();
  readonly wolLabelActive = input<string | Text | HTMLElement>();
  readonly wolActiveClassName = input<string>();
  readonly wolInactiveClassName = input<string>();
  readonly wolTipLabel = input<string>();
  readonly wolKeys = input<boolean>();
  readonly wolTarget = input<HTMLElement | string>();
  readonly wolSource = input<HTMLElement | string>();
  readonly wolProperties = input<WolProperties>();

  readonly wolChange = output<BaseEvent>();
  readonly wolEnterFullscreen = output<void>();
  readonly wolError = output<BaseEvent>();
  readonly wolLeaveFullscreen = output<void>();
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
   * Get the underlying OpenLayers FullScreen control instance.
   * @returns The FullScreen control instance
   */
  getInstance(): FullScreen | undefined {
    return this.instance;
  }
}
