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
  signal,
} from '@angular/core';

import { ObjectEvent } from 'ol/Object';
import { unByKey } from 'ol/Observable';
import { Coordinate } from 'ol/coordinate';
import { EventsKey } from 'ol/events';
import BaseEvent from 'ol/events/Event';
import Circle from 'ol/geom/Circle';
import { GeometryLayout } from 'ol/geom/Geometry';

import { WolProperties, WolSafeAny } from '@workletjs/ngx-openlayers/core/types';
import { useGeometryHostRef } from '@workletjs/ngx-openlayers/geom/geometry';

/**
 * Supplies an OpenLayers [Circle](https://openlayers.org/en/latest/apidoc/module-ol_geom_Circle-Circle.html) geometry to a parent `wol-feature`.
 *
 * Use a center coordinate and radius in projection units to define the circle.
 */
@Component({
  selector: 'wol-circle-geometry',
  exportAs: 'wolCircleGeometry',
  template: '<ng-content />',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolCircleGeometryComponent implements OnChanges {
  /**
   * Required center coordinate of the circle. Rebind it to move the circle.
   */
  readonly wolCenter = input.required<Coordinate>();

  /**
   * Radius in projection units. For a center coordinate with an inferred layout, the default radius
   * is `0`. Set a radius explicitly when supplying a layout for an ordinary center coordinate.
   */
  readonly wolRadius = input<number>();

  /**
   * Coordinate layout, such as `XY` or `XYZ`. If a layout is supplied with no radius, OpenLayers
   * interprets `wolCenter` as flat circle coordinates at creation.
   *
   * @remarks To apply a layout change later, update both `wolCenter` and `wolRadius` in the same
   * binding update.
   */
  readonly wolLayout = input<GeometryLayout>();

  /**
   * Arbitrary properties for the geometry.
   */
  readonly wolProperties = input<WolProperties>();

  /**
   * Event emitted when the revision counter is increased.
   */
  readonly wolChange = output<BaseEvent>();

  /**
   * Event emitted when an error occurs.
   */
  readonly wolError = output<BaseEvent>();

  /**
   * Event emitted when a property is changed.
   */
  readonly wolPropertyChange = output<ObjectEvent>();

  /**
   * Signal holding the OpenLayers `Circle` instance. Its value is `undefined` before creation and
   * after destruction.
   */
  readonly instance = signal<Circle | undefined>(undefined);

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useGeometryHostRef<Circle>('Circle');
    const eventsKeyMap: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const circle = new Circle(this.wolCenter(), this.wolRadius(), this.wolLayout());

      if (this.wolProperties()) {
        circle.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKeyMap['change'] = circle.on('change', (event) => this.wolChange.emit(event));

      eventsKeyMap['error'] = circle.on('error', (event) => this.wolError.emit(event));

      eventsKeyMap['propertychange'] = circle.on('propertychange', (event) =>
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
        hostRef.setGeometry(circle);
      });

      this.instance.set(circle);
    });

    destroyRef.onDestroy(() => {
      const point = this.instance();

      unByKey(Object.values(eventsKeyMap));

      if (point) {
        hostRef.setGeometry(undefined as WolSafeAny);
        this.instance.set(undefined);
      }
    });
  }

  /**
   * Respond to input changes.
   * @param changes The changes object containing the changed inputs.
   * @internal
   */
  ngOnChanges(changes: SimpleChanges): void {
    const circle = this.instance();

    if (!circle) {
      return;
    }

    const centerChange = changes['wolCenter'];
    const radiusChange = changes['wolRadius'];
    const propertiesChange = changes['wolProperties'];

    if (centerChange && radiusChange) {
      circle.setCenterAndRadius(
        centerChange.currentValue,
        radiusChange.currentValue,
        this.wolLayout(),
      );
    } else if (centerChange) {
      circle.setCenter(centerChange.currentValue);
    } else if (radiusChange) {
      circle.setRadius(radiusChange.currentValue);
    }

    if (propertiesChange) {
      circle.setProperties(this.wolProperties() ?? {});
    }
  }

  /**
   * Gets the OpenLayers `Circle` instance managed by the component.
   *
   * @returns The `Circle` instance, or `undefined` before creation and after destruction.
   */
  getInstance(): Circle | undefined {
    return this.instance();
  }
}
