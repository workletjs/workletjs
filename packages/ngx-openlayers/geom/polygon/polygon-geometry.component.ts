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
import Polygon from 'ol/geom/Polygon';

import { WolProperties, WolSafeAny } from '@workletjs/ngx-openlayers/core/types';
import { useGeometryHostRef } from '@workletjs/ngx-openlayers/geom/geometry';

@Component({
  selector: 'wol-polygon-geometry',
  exportAs: 'wolPolygonGeometry',
  template: '<ng-content />',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolPolygonGeometryComponent implements OnChanges {
  /**
   * Array of linear rings that define the polygon.
   * The first linear ring of the array defines the outer-boundary or surface of the polygon.
   * Each subsequent linear ring defines a hole in the surface of the polygon.
   * A linear ring is an array of vertices' coordinates where the first coordinate and the last are equivalent.
   * (For internal use, flat coordinates in combination with `wolLayout` and `wolEnds` are also accepted.)
   */
  readonly wolCoordinates = input.required<Coordinate[][] | number[]>();

  /**
   * Layout of the geometry coordinates.
   */
  readonly wolLayout = input<GeometryLayout>();

  /**
   * Array of numbers representing the end indices of each linear ring
   * in the flat coordinates array. Only used when `wolCoordinates` is provided
   * as a flat array of numbers.
   */
  readonly wolEnds = input<number[]>();

  /**
   * Optional properties object to attach to the geometry.
   */
  readonly wolProperties = input<WolProperties>();

  /**
   * Emitted when the geometry changes.
   */
  readonly wolChange = output<BaseEvent>();

  /**
   * Emitted when the geometry encounters an error.
   */
  readonly wolError = output<BaseEvent>();

  /**
   * Emitted when a property is changed.
   */
  readonly wolPropertyChange = output<ObjectEvent>();

  /**
   * The Polygon instance created by this component.
   */
  readonly instance = signal<Polygon | undefined>(undefined);

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useGeometryHostRef<Polygon>('Polygon');
    const eventsKeyMap: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const polygon = new Polygon(this.wolCoordinates(), this.wolLayout(), this.wolEnds());

      if (this.wolProperties()) {
        polygon.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKeyMap['change'] = polygon.on('change', (event) => this.wolChange.emit(event));

      eventsKeyMap['error'] = polygon.on('error', (event) => this.wolError.emit(event));

      eventsKeyMap['propertychange'] = polygon.on('propertychange', (event) =>
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
        hostRef.setGeometry(polygon);
      });

      this.instance.set(polygon);
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
    const polygon = this.instance();

    if (!polygon) {
      return;
    }

    const coordinatesChange = changes['wolCoordinates'];
    const propertiesChange = changes['wolProperties'];

    if (coordinatesChange) {
      const coordinates = coordinatesChange.currentValue;
      const layout = this.wolLayout();
      const ends = this.wolEnds();

      if (layout !== undefined && ends) {
        polygon.setFlatCoordinates(layout, coordinates as number[]);
        polygon['ends_'] = ends;
        polygon.changed();
      } else {
        polygon.setCoordinates(coordinates as Coordinate[][], layout);
      }
    }

    if (propertiesChange) {
      polygon.setProperties(propertiesChange.currentValue ?? {});
    }
  }

  /**
   * Get the internal OpenLayers Polygon instance
   * @returns The internal OpenLayers Polygon instance
   */
  getInstance(): Polygon | undefined {
    return this.instance();
  }
}
