import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  OnChanges,
  output,
  signal,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { WolProperties, WolSafeAny } from '@workletjs/ngx-openlayers/core/types';
import { useGeometryHostRef } from '@workletjs/ngx-openlayers/geom/geometry';
import { extend } from 'ol/array';
import { Coordinate } from 'ol/coordinate';
import { EventsKey } from 'ol/events';
import { GeometryLayout } from 'ol/geom/Geometry';
import { ObjectEvent } from 'ol/Object';
import { unByKey } from 'ol/Observable';
import BaseEvent from 'ol/events/Event';
import MultiPolygon from 'ol/geom/MultiPolygon';
import Polygon from 'ol/geom/Polygon';

@Component({
  selector: 'wol-multi-polygon-geometry',
  exportAs: 'wolMultiPolygonGeometry',
  template: '<ng-content />',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolMultiPolygonGeometryComponent implements OnChanges {
  /**
   * The coordinates of the multi-polygon geometry.
   * For internal use, flat coordinates in combination with `wolLayout` and `wolEnds` are also accepted.
   */
  readonly wolCoordinates = input.required<Coordinate[][][] | Polygon[] | number[]>();

  /**
   * The layout of the multi-polygon geometry.
   */
  readonly wolLayout = input<GeometryLayout>();

  /**
   * Array of ends for internal use with flat coordinates.
   */
  readonly wolEndss = input<number[][]>();

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
   * The MultiPolygon instance.
   */
  readonly instance = signal<MultiPolygon | undefined>(undefined);

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useGeometryHostRef<MultiPolygon>('MultiPolygon');
    const eventsKeyMap: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const multiPolygon = new MultiPolygon(
        this.wolCoordinates(),
        this.wolLayout(),
        this.wolEndss(),
      );

      if (this.wolProperties()) {
        multiPolygon.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKeyMap['change'] = multiPolygon.on('change', (event) => this.wolChange.emit(event));

      eventsKeyMap['error'] = multiPolygon.on('error', (event) => this.wolError.emit(event));

      eventsKeyMap['propertychange'] = multiPolygon.on('propertychange', (event) =>
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
        hostRef.setGeometry(multiPolygon);
      });

      this.instance.set(multiPolygon);
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
    const multiPolygon = this.instance();

    if (!multiPolygon) {
      return;
    }

    const coordinatesChange = changes['wolCoordinates'];
    const propertiesChange = changes['wolProperties'];

    if (coordinatesChange) {
      let coordinates = coordinatesChange.currentValue;
      let layout = this.wolLayout();
      let endss = this.wolEndss();

      if (!endss && !Array.isArray(coordinates[0])) {
        const polygons = coordinates as Polygon[];
        const flatCoordinates: number[] = [];
        const thisEndss: number[][] = [];
        for (let i = 0, ii = polygons.length; i < ii; ++i) {
          const polygon = polygons[i];
          const offset = flatCoordinates.length;
          const ends = polygon.getEnds();
          for (let j = 0, jj = ends.length; j < jj; ++j) {
            ends[j] += offset;
          }
          extend(flatCoordinates, polygon.getFlatCoordinates());
          thisEndss.push(ends);
        }
        layout = polygons.length === 0 ? multiPolygon.getLayout() : polygons[0].getLayout();
        coordinates = flatCoordinates;
        endss = thisEndss;
      }

      if (layout !== undefined && endss) {
        multiPolygon.setFlatCoordinates(layout, coordinates as number[]);
        multiPolygon['endss_'] = endss;
        multiPolygon.changed();
      } else {
        multiPolygon.setCoordinates(coordinates as Coordinate[][][], layout);
      }
    }

    if (propertiesChange) {
      multiPolygon.setProperties(propertiesChange.currentValue ?? {});
    }
  }

  /**
   * Get the internal OpenLayers MultiPolygon instance
   * @returns The internal OpenLayers MultiPolygon instance
   */
  getInstance(): MultiPolygon | undefined {
    return this.instance();
  }
}
