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
import { Coordinate } from 'ol/coordinate';
import { EventsKey } from 'ol/events';
import { Point } from 'ol/geom';
import { GeometryLayout } from 'ol/geom/Geometry';
import { ObjectEvent } from 'ol/Object';
import { unByKey } from 'ol/Observable';
import BaseEvent from 'ol/events/Event';

@Component({
  selector: 'wol-point-geometry',
  exportAs: 'wolPointGeometry',
  template: '<ng-content />',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolPointGeometryComponent implements OnChanges {
  /**
   * The coordinates of the point geometry.
   */
  readonly wolCoordinates = input.required<Coordinate>();

  /**
   * The layout of the point geometry.
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
   * The Point instance.
   */
  readonly instance = signal<Point | undefined>(undefined);

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useGeometryHostRef<Point>('Point');
    const eventsKeyMap: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const point = new Point(this.wolCoordinates(), this.wolLayout());

      if (this.wolProperties()) {
        point.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKeyMap['change'] = point.on('change', (event) => this.wolChange.emit(event));

      eventsKeyMap['error'] = point.on('error', (event) => this.wolError.emit(event));

      eventsKeyMap['propertychange'] = point.on('propertychange', (event) =>
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
        hostRef.setGeometry(point);
      });

      this.instance.set(point);
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
    const point = this.instance();

    if (!point) {
      return;
    }

    if (changes['wolCoordinates'] || changes['wolLayout']) {
      point.setCoordinates(this.wolCoordinates(), this.wolLayout());
    }

    if (changes['wolProperties']) {
      point.setProperties(this.wolProperties() ?? {});
    }
  }

  /**
   * Get the internal OpenLayers Point instance
   * @returns The internal OpenLayers Point instance
   */
  getInstance(): Point | undefined {
    return this.instance();
  }
}
