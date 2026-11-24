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
import { GeometryLayout } from 'ol/geom/Geometry';
import LineString from 'ol/geom/LineString';

import { WolProperties, WolSafeAny } from '@workletjs/ngx-openlayers/core/types';
import { useGeometryHostRef } from '@workletjs/ngx-openlayers/geom/geometry';

/**
 * Supplies an OpenLayers [LineString](https://openlayers.org/en/latest/apidoc/module-ol_geom_LineString-LineString.html) geometry to a parent `wol-feature`.
 *
 * The ordered coordinates define a connected sequence of line segments.
 */
@Component({
  selector: 'wol-line-string-geometry',
  exportAs: 'wolLineStringGeometry',
  template: '<ng-content />',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolLineStringGeometryComponent implements OnChanges {
  /**
   * Required ordered coordinates for the line. To initialize from a flat number array, also supply
   * `wolLayout`. Use an array of coordinates when replacing the line at runtime.
   */
  readonly wolCoordinates = input.required<Coordinate[] | number[]>();

  /**
   * Coordinate layout, such as `XY` or `XYZ`. When omitted, the layout is inferred from nested
   * coordinates. Rebind `wolCoordinates` to apply a new layout.
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
   * Signal holding the OpenLayers `LineString` instance. Its value is `undefined` before creation
   * and after destruction.
   */
  readonly instance = signal<LineString | undefined>(undefined);

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useGeometryHostRef<LineString>('LineString');
    const eventsKeyMap: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const lineString = new LineString(this.wolCoordinates(), this.wolLayout());

      if (this.wolProperties()) {
        lineString.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKeyMap['change'] = lineString.on('change', (event) => this.wolChange.emit(event));

      eventsKeyMap['error'] = lineString.on('error', (event) => this.wolError.emit(event));

      eventsKeyMap['propertychange'] = lineString.on('propertychange', (event) =>
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
        hostRef.setGeometry(lineString);
      });

      this.instance.set(lineString);
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
    const lineString = this.instance();

    if (!lineString) {
      return;
    }

    const coordinatesChange = changes['wolCoordinates'];
    const propertiesChange = changes['wolProperties'];

    if (coordinatesChange) {
      lineString.setCoordinates(coordinatesChange.currentValue, this.wolLayout());
    }

    if (propertiesChange) {
      lineString.setProperties(propertiesChange.currentValue ?? {});
    }
  }

  /**
   * Gets the OpenLayers `LineString` instance managed by the component.
   *
   * @returns The `LineString` instance, or `undefined` before creation and after destruction.
   */
  getInstance(): LineString | undefined {
    return this.instance();
  }
}
