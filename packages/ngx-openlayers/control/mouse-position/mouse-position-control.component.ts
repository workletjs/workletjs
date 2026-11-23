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
import MousePosition from 'ol/control/MousePosition';
import { CoordinateFormat } from 'ol/coordinate';
import { EventsKey } from 'ol/events';
import BaseEvent from 'ol/events/Event';
import { ProjectionLike } from 'ol/proj';

import { useControlHostRef } from '@workletjs/ngx-openlayers/control/control';
import { WolProperties } from '@workletjs/ngx-openlayers/core/types';

/**
 * Shows the mouse pointer's map coordinates, with optional formatting and projection. See
 * [OpenLayers MousePosition](https://openlayers.org/en/latest/apidoc/module-ol_control_MousePosition-MousePosition.html)
 * .
 */
@Component({
  selector: 'wol-mouse-position-control',
  exportAs: 'wolMousePositionControl',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolMousePositionControlComponent implements OnChanges {
  /**
   * CSS class for the coordinate display. Defaults to `ol-mouse-position`. Read at creation.
   */
  readonly wolClassName = input<string>();
  /**
   * Formats the displayed coordinate. Without a formatter, OpenLayers displays the coordinate
   * values as text. This model applies binding changes and reflects changes made on the
   * OpenLayers control.
   */
  readonly wolCoordinateFormat = model<CoordinateFormat>();
  /**
   * Projection used to display coordinates. Defaults to the view projection when no user
   * projection is configured. This model applies binding changes and reflects changes made on the
   * OpenLayers control.
   */
  readonly wolProjection = model<ProjectionLike>();
  /**
   * Custom rendering callback that receives the map render event on an animation frame. It
   * replaces the default control renderer. Read at creation.
   */
  readonly wolRender = input<(event: MapEvent) => void>();
  /**
   * Element or element ID to host the control. The default is the map's control container. Set
   * this before the control is added to its map. Changing the target after attachment does not
   * move the control.
   */
  readonly wolTarget = input<string | HTMLElement>();
  /**
   * Markup displayed when pointer coordinates are unavailable. When omitted, the control starts
   * with a non-breaking space and retains the last position when the pointer leaves the viewport.
   * Read at creation.
   */
  readonly wolPlaceholder = input<string>();
  /**
   * Whether to wrap coordinates at the antimeridian in a global projection. Defaults to `true`.
   * Read at creation.
   */
  readonly wolWrapX = input<boolean>();
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

  private instance?: MousePosition;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useControlHostRef<MousePosition>('MousePosition');
    const eventsKeyMap: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const mousePosition = new MousePosition({
        className: this.wolClassName(),
        coordinateFormat: this.wolCoordinateFormat(),
        projection: this.wolProjection(),
        render: this.wolRender(),
        target: this.wolTarget(),
        placeholder: this.wolPlaceholder(),
        wrapX: this.wolWrapX(),
      });

      if (this.wolProperties()) {
        mousePosition.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKeyMap['change'] = mousePosition.on('change', (event) => this.wolChange.emit(event));

      eventsKeyMap['change:coordinateFormat'] = mousePosition.on('change:coordinateFormat', () =>
        this.wolCoordinateFormat.set(mousePosition.getCoordinateFormat()),
      );

      eventsKeyMap['change:projection'] = mousePosition.on('change:projection', () =>
        this.wolProjection.set(mousePosition.getProjection()),
      );

      eventsKeyMap['error'] = mousePosition.on('error', (event) => this.wolError.emit(event));

      eventsKeyMap['propertychange'] = mousePosition.on('propertychange', (event) =>
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
        hostRef.addControl(mousePosition);
      });

      this.instance = mousePosition;
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
        case 'wolCoordinateFormat':
          this.instance.setCoordinateFormat(change.currentValue);
          break;
        case 'wolProjection':
          this.instance.setProjection(change.currentValue);
          break;
        case 'wolProperties':
          this.instance.setProperties(change.currentValue ?? {}, true);
          break;
        case 'wolTarget':
          this.instance.setTarget(change.currentValue);
          break;
      }
    }
  }

  /**
   * Accesses the OpenLayers MousePosition control.
   *
   * @returns The underlying instance, or `undefined` before creation and after component
   * teardown.
   */
  getInstance(): MousePosition | undefined {
    return this.instance;
  }
}
