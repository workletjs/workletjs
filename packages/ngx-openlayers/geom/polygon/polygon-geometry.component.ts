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

/**
 * Supplies an OpenLayers [Polygon](https://openlayers.org/en/latest/apidoc/module-ol_geom_Polygon-Polygon.html) geometry to a parent `wol-feature`.
 *
 * Defines an area from an exterior ring and optional interior rings.
 */
@Component({
  selector: 'wol-polygon-geometry',
  exportAs: 'wolPolygonGeometry',
  template: '<ng-content />',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolPolygonGeometryComponent implements OnChanges {
  /**
   * Required polygon coordinates. Supply the exterior ring followed by any holes, with each ring
   * closed by repeating its first coordinate. Flat numeric coordinates need both `wolLayout` and
   * `wolEnds`.
   */
  readonly wolCoordinates = input.required<Coordinate[][] | number[]>();

  /**
   * Coordinate layout, such as `XY` or `XYZ`. Required with flat coordinates. Rebind
   * `wolCoordinates` to apply a new layout.
   */
  readonly wolLayout = input<GeometryLayout>();

  /**
   * Exclusive end offsets in the flat number array, one per ring. Supply this with `wolLayout` for
   * flat coordinates. Rebind `wolCoordinates` to apply new offsets.
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
   * Signal holding the OpenLayers `Polygon` instance. Its value is `undefined` before creation and
   * after destruction.
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
   * Gets the OpenLayers `Polygon` instance managed by the component.
   *
   * @returns The `Polygon` instance, or `undefined` before creation and after destruction.
   */
  getInstance(): Polygon | undefined {
    return this.instance();
  }
}
