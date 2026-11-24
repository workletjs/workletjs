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
import { extend } from 'ol/array';
import { Coordinate } from 'ol/coordinate';
import { EventsKey } from 'ol/events';
import BaseEvent from 'ol/events/Event';
import { GeometryLayout } from 'ol/geom/Geometry';
import LineString from 'ol/geom/LineString';
import MultiLineString from 'ol/geom/MultiLineString';

import { WolProperties, WolSafeAny } from '@workletjs/ngx-openlayers/core/types';
import { useGeometryHostRef } from '@workletjs/ngx-openlayers/geom/geometry';

/**
 * Supplies an OpenLayers [MultiLineString](https://openlayers.org/en/latest/apidoc/module-ol_geom_MultiLineString-MultiLineString.html) geometry to a parent `wol-feature`.
 *
 * Groups multiple lines in one feature geometry.
 */
@Component({
  selector: 'wol-multi-line-string-geometry',
  exportAs: 'wolMultiLineStringGeometry',
  template: '<ng-content />',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolMultiLineStringGeometryComponent implements OnChanges {
  /**
   * Required line coordinates or OpenLayers `LineString` objects. Flat numeric coordinates need
   * both `wolLayout` and `wolEnds`.
   */
  readonly wolCoordinates = input.required<Coordinate[][] | LineString[] | number[]>();

  /**
   * Coordinate layout, such as `XY` or `XYZ`. Required with flat coordinates. Rebind
   * `wolCoordinates` to apply a new layout.
   */
  readonly wolLayout = input<GeometryLayout>();

  /**
   * Exclusive end offsets in the flat number array, one per line. Rebind `wolCoordinates` to apply
   * new offsets.
   */
  readonly wolEnds = input<number[]>();

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
   * Signal holding the OpenLayers `MultiLineString` instance. Its value is `undefined` before
   * creation and after destruction.
   */
  readonly instance = signal<MultiLineString | undefined>(undefined);

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useGeometryHostRef<MultiLineString>('MultiLineString');
    const eventsKeyMap: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const multiLineString = new MultiLineString(
        this.wolCoordinates(),
        this.wolLayout(),
        this.wolEnds(),
      );

      if (this.wolProperties()) {
        multiLineString.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKeyMap['change'] = multiLineString.on('change', (event) => this.wolChange.emit(event));

      eventsKeyMap['error'] = multiLineString.on('error', (event) => this.wolError.emit(event));

      eventsKeyMap['propertychange'] = multiLineString.on('propertychange', (event) =>
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
        hostRef.setGeometry(multiLineString);
      });

      this.instance.set(multiLineString);
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
    const multiLineString = this.instance();

    if (!multiLineString) {
      return;
    }

    const coordsChange = changes['wolCoordinates'];
    const propertiesChange = changes['wolProperties'];

    if (coordsChange) {
      const coordinates = coordsChange.currentValue;
      const layout = this.wolLayout();
      const ends = this.wolEnds();

      if (Array.isArray(coordinates[0])) {
        multiLineString.setCoordinates(coordinates, layout);
      } else if (layout !== undefined && ends) {
        multiLineString.setFlatCoordinates(layout, coordinates as number[]);
        multiLineString['ends_'] = ends;
        multiLineString.changed();
      } else {
        const lineStrings = coordinates as LineString[];
        const flatCoordinates: number[] = [];
        const ends: number[] = [];

        for (let i = 0, ii = lineStrings.length; i < ii; ++i) {
          const lineString = lineStrings[i];
          extend(flatCoordinates, lineString.getFlatCoordinates());
          ends.push(flatCoordinates.length);
        }

        const layout =
          lineStrings.length === 0 ? multiLineString.getLayout() : lineStrings[0].getLayout();

        multiLineString.setFlatCoordinates(layout, flatCoordinates);
        multiLineString['ends_'] = ends;
        multiLineString.changed();
      }
    }

    if (propertiesChange) {
      multiLineString.setProperties(propertiesChange.currentValue ?? {});
    }
  }

  /**
   * Gets the OpenLayers `MultiLineString` instance managed by the component.
   *
   * @returns The `MultiLineString` instance, or `undefined` before creation and after destruction.
   */
  getInstance(): MultiLineString | undefined {
    return this.instance();
  }
}
