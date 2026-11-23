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
  model,
  output,
} from '@angular/core';

import MapEvent from 'ol/MapEvent';
import { ObjectEvent } from 'ol/Object';
import { unByKey } from 'ol/Observable';
import ScaleLine, { Units } from 'ol/control/ScaleLine';
import { EventsKey } from 'ol/events';
import BaseEvent from 'ol/events/Event';

import { useControlHostRef } from '@workletjs/ngx-openlayers/control/control';
import { WolProperties } from '@workletjs/ngx-openlayers/core/types';

/**
 * Shows a scale line or scale bar for approximate ground distances at the view center. See
 * [OpenLayers ScaleLine](https://openlayers.org/en/latest/apidoc/module-ol_control_ScaleLine-ScaleLine.html)
 * .
 */
@Component({
  selector: 'wol-scale-line-control',
  imports: [],
  template: `<ng-content />`,
  styles: ``,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolScaleLineControlComponent implements OnChanges {
  /**
   * CSS class for the scale control. Defaults to `ol-scale-bar` in bar mode and `ol-scale-line`
   * in line mode. Read at creation.
   */
  readonly wolClassName = input<string>();
  /**
   * Minimum width at the OGC reference DPI, in pixels. Defaults to `64` and is scaled for the
   * output DPI. Read at creation.
   */
  readonly wolMinWidth = input<number>();
  /**
   * Maximum width at the OGC reference DPI, in pixels. When provided, it is scaled for the output
   * DPI. Read at creation.
   */
  readonly wolMaxWidth = input<number>();
  /**
   * Custom rendering callback that receives the map render event on an animation frame. It
   * replaces the default control renderer. Read at creation.
   */
  readonly wolRender = input<(evt: MapEvent) => void>();
  /**
   * Element or element ID to host the control. The default is the map's control container. Set
   * this before the control is added to its map. Changing the target after attachment does not
   * move the control.
   */
  readonly wolTarget = input<HTMLElement | string>();
  /**
   * Distance units, defaulting to `metric`. This model applies binding changes and reflects unit
   * changes made on the OpenLayers control.
   */
  readonly wolUnits = model<Units>();
  /**
   * Whether to render a segmented scale bar. Defaults to `false` , which displays a scale line.
   * Read at creation.
   */
  readonly wolBar = input<boolean>();
  /**
   * Number of scale bar segments. Defaults to `4`. Applies only when `wolBar` is enabled. Read
   * at creation.
   */
  readonly wolSteps = input<number>();
  /**
   * Whether to display the scale ratio above the bar. Defaults to `false` and applies only in bar
   * mode. Read at creation.
   */
  readonly wolText = input<boolean>();
  /**
   * Output resolution in dots per inch for bar mode. OpenLayers assumes a 0.28 mm reference pixel
   * if omitted. The binding can update the DPI after creation.
   */
  readonly wolDpi = input<number>();
  /**
   * Observable properties to set on the OpenLayers instance. Updates assign the supplied keys and
   * leave other properties in place.
   */
  readonly wolProperties = input<Record<string, WolProperties>>();

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
   * Accesses the OpenLayers ScaleLine control.
   *
   * @returns The underlying instance, or `undefined` before creation and after component
   * teardown.
   */
  getInstance(): ScaleLine | undefined {
    return this.instance;
  }
}
