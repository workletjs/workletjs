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
import MultiPoint from 'ol/geom/MultiPoint';

import { WolProperties, WolSafeAny } from '@workletjs/ngx-openlayers/core/types';
import { useGeometryHostRef } from '@workletjs/ngx-openlayers/geom/geometry';

@Component({
  selector: 'wol-multi-point-geometry',
  exportAs: 'wolMultiPointGeometry',
  template: '<ng-content />',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolMultiPointGeometryComponent implements OnChanges {
  /**
   * The coordinates of the multi-point geometry.
   * For internal use, flat coordinates in combination with `wolLayout` are also accepted.
   */
  readonly wolCoordinates = input.required<Coordinate[] | number[]>();

  /**
   * The layout of the multi-point geometry.
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
   * The MultiPoint instance.
   */
  readonly instance = signal<MultiPoint | undefined>(undefined);

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useGeometryHostRef<MultiPoint>('MultiPoint');
    const eventsKeyMap: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const multiPoint = new MultiPoint(this.wolCoordinates(), this.wolLayout());

      if (this.wolProperties()) {
        multiPoint.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKeyMap['change'] = multiPoint.on('change', (event) => this.wolChange.emit(event));

      eventsKeyMap['error'] = multiPoint.on('error', (event) => this.wolError.emit(event));

      eventsKeyMap['propertychange'] = multiPoint.on('propertychange', (event) =>
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
        hostRef.setGeometry(multiPoint);
      });

      this.instance.set(multiPoint);
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
    const multiPoint = this.instance();

    if (!multiPoint) {
      return;
    }

    const coordinatesChange = changes['wolCoordinates'];
    const propertiesChange = changes['wolProperties'];

    if (coordinatesChange) {
      const coordinates = coordinatesChange.currentValue;
      const layout = this.wolLayout();

      if (layout && !Array.isArray(coordinates[0])) {
        multiPoint.setFlatCoordinates(layout, coordinates as number[]);
      } else {
        multiPoint.setCoordinates(coordinates as Coordinate[], layout);
      }
    }

    if (propertiesChange) {
      multiPoint.setProperties(propertiesChange.currentValue ?? {});
    }
  }

  /**
   * Get the internal OpenLayers MultiPoint instance
   * @returns The internal OpenLayers MultiPoint instance
   */
  getInstance(): MultiPoint | undefined {
    return this.instance();
  }
}
