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

import Collection from 'ol/Collection';
import Feature from 'ol/Feature';
import { ObjectEvent } from 'ol/Object';
import { unByKey } from 'ol/Observable';
import { EventsKey } from 'ol/events';
import BaseEvent from 'ol/events/Event';
import { Condition } from 'ol/events/condition';
import { GeometryLayout, Type } from 'ol/geom/Geometry';
import Draw, { DrawEvent, GeometryFunction } from 'ol/interaction/Draw';
import VectorSource from 'ol/source/Vector';
import { StyleLike } from 'ol/style/Style';
import { FlatStyleLike } from 'ol/style/flat';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { useInteractionHostRef } from '@workletjs/ngx-openlayers/interaction/interaction';

/**
 * Draws vector geometries on the map and optionally stores the completed features in a collection
 * or vector source. See
 * [OpenLayers Draw](https://openlayers.org/en/latest/apidoc/module-ol_interaction_Draw-Draw.html).
 */
@Component({
  selector: 'wol-draw-interaction',
  exportAs: 'wolDrawInteraction',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolDrawInteractionComponent implements OnChanges {
  /**
   * Whether the interaction handles events. Defaults to `true`. This model updates the
   * interaction and reflects active-state changes from OpenLayers.
   */
  readonly wolActive = model(true);
  /**
   * Required geometry type to draw, such as `Point`, `LineString`, `Polygon`, or `Circle`. Read
   * at creation.
   */
  readonly wolType = input.required<Type>();
  /**
   * Maximum distance in pixels between pressing and releasing the pointer for the release to
   * count as a click. Defaults to `6`. Read at creation.
   */
  readonly wolClickTolerance = input<number>();
  /**
   * Optional collection for completed features. If `wolSource` is also supplied, OpenLayers adds
   * each completed feature to both destinations. Read at creation.
   */
  readonly wolFeatures = input<Collection<Feature>>();
  /**
   * Optional vector source for completed features and the fallback source for tracing. With
   * neither destination, use `wolDrawEnd` to handle the completed feature. Read at creation.
   */
  readonly wolSource = input<VectorSource>();
  /**
   * Delay in milliseconds after pointer-down before the current vertex can be dragged to its
   * exact position. Defaults to `500`. Read at creation.
   */
  readonly wolDragVertexDelay = input<number>();
  /**
   * Positive distance in pixels within which the pointer snaps to the drawing's finish position.
   * Defaults to `12`. Read at creation.
   */
  readonly wolSnapTolerance = input<number>();
  /**
   * Whether drawing suppresses click, single-click, and double-click events on the map. Defaults
   * to `false`. Read at creation.
   */
  readonly wolStopClick = input<boolean>();
  /**
   * Number of points at which a line string or polygon ring finishes automatically. Defaults to
   * no limit. Read at creation.
   */
  readonly wolMaxPoints = input<number>();
  /**
   * Minimum number of points needed to finish a line string or polygon ring. Defaults to `2` for
   * line strings and `3` for polygon rings. Read at creation.
   */
  readonly wolMinPoints = input<number>();
  /**
   * Predicate that decides whether a map browser event may finish a drawing, including a point
   * or multi-point sketch. The default accepts finishing events. Read at creation.
   */
  readonly wolFinishCondition = input<Condition>();
  /**
   * Style for in-progress sketch features such as the pointer, line, or polygon. Defaults to the
   * OpenLayers editing style. Read at creation.
   */
  readonly wolStyle = input<StyleLike | FlatStyleLike>();
  /**
   * Function for creating or updating the sketch geometry whenever its coordinates change.
   * Defaults to the function for `wolType`. Read at creation.
   */
  readonly wolGeometryFunction = input<GeometryFunction>();
  /**
   * Name of the geometry property on created features. Defaults to `geometry`. Read at creation.
   */
  readonly wolGeometryName = input<string>();
  /**
   * Predicate for the pointer events used in drawing. Defaults to accepting events with no
   * modifier keys. Read at creation.
   */
  readonly wolCondition = input<Condition>();
  /**
   * Whether to always draw lines, polygons, and circles in freehand mode. Defaults to `false`.
   * When enabled, this overrides `wolFreehandCondition`. Changes update the existing interaction.
   */
  readonly wolFreehand = input<boolean>();
  /**
   * Predicate for temporarily entering freehand mode. Defaults to the Shift-only condition and is
   * evaluated when `wolFreehand` is disabled. Read at creation.
   */
  readonly wolFreehandCondition = input<Condition>();
  /**
   * Whether, or under which event condition, the sketch traces part of another geometry. Defaults
   * to `false`. Applies outside freehand mode and requires a trace source. Read at creation.
   */
  readonly wolTrace = input<boolean | Condition>();
  /**
   * Vector source containing geometries to trace. When omitted, tracing uses `wolSource`. Read at
   * creation.
   */
  readonly wolTraceSource = input<VectorSource>();
  /**
   * Whether the sketch overlay wraps horizontally across world copies. Defaults to `false`. Read
   * at creation.
   */
  readonly wolWrapX = input<boolean>();
  /**
   * Coordinate layout for the created geometries, such as `XY` or `XYZ`. Defaults to `XY`. Read
   * at creation.
   */
  readonly wolGeometryLayout = input<GeometryLayout>();
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
   * Emits when an in-progress drawing is aborted. The event carries the abandoned sketch feature.
   */
  readonly wolDrawAbort = output<DrawEvent>();
  /**
   * Emits with the completed feature before OpenLayers adds it to the configured collection or
   * vector source.
   */
  readonly wolDrawEnd = output<DrawEvent>();
  /**
   * Emits when a new drawing starts. The event carries the sketch feature.
   */
  readonly wolDrawStart = output<DrawEvent>();
  /**
   * Emits the native `error` event when the OpenLayers instance dispatches one.
   */
  readonly wolError = output<BaseEvent>();
  /**
   * Emits the native `propertychange` event with the changed property key and its previous value.
   */
  readonly wolPropertyChange = output<ObjectEvent>();

  private instance?: Draw;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useInteractionHostRef<Draw>('Draw');
    const eventsKeyMap: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const draw = new Draw({
        type: this.wolType(),
        clickTolerance: this.wolClickTolerance(),
        features: this.wolFeatures(),
        source: this.wolSource(),
        dragVertexDelay: this.wolDragVertexDelay(),
        snapTolerance: this.wolSnapTolerance(),
        stopClick: this.wolStopClick(),
        maxPoints: this.wolMaxPoints(),
        minPoints: this.wolMinPoints(),
        finishCondition: this.wolFinishCondition(),
        style: this.wolStyle(),
        geometryFunction: this.wolGeometryFunction(),
        geometryName: this.wolGeometryName(),
        condition: this.wolCondition(),
        freehand: this.wolFreehand(),
        freehandCondition: this.wolFreehandCondition(),
        trace: this.wolTrace(),
        traceSource: this.wolTraceSource(),
        wrapX: this.wolWrapX(),
        geometryLayout: this.wolGeometryLayout(),
      });

      draw.setActive(this.wolActive());

      if (this.wolProperties()) {
        draw.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKeyMap['change'] = draw.on('change', (event) => this.wolChange.emit(event));

      eventsKeyMap['change:active'] = draw.on('change:active', () =>
        this.wolActive.set(draw.getActive()),
      );

      eventsKeyMap['drawabort'] = draw.on('drawabort', (event) => this.wolDrawAbort.emit(event));

      eventsKeyMap['drawend'] = draw.on('drawend', (event) => this.wolDrawEnd.emit(event));

      eventsKeyMap['drawstart'] = draw.on('drawstart', (event) => this.wolDrawStart.emit(event));

      eventsKeyMap['error'] = draw.on('error', (event) => this.wolError.emit(event));

      eventsKeyMap['propertychange'] = draw.on('propertychange', (event) =>
        this.wolPropertyChange.emit(event),
      );

      /**
       * Adding interaction to the map must be done after the map is rendered,
       * if used with control flow of Angular.
       *
       * In Angular, when rendering a component's template, the control flow statements,
       * such as @if, @else, @else if, @for, and @switch, are evaluated during the template
       * rendering process. This evaluation happens before the actual content within the blocks
       * is rendered to the DOM.
       */
      Promise.resolve().then(() => {
        hostRef.addInteraction(draw);
      });

      this.instance = draw;
    });

    destroyRef.onDestroy(() => {
      if (this.instance) {
        unByKey(Object.values(eventsKeyMap));
        hostRef.removeInteraction(this.instance);
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
        case 'wolActive':
          this.instance.setActive(change.currentValue);
          break;
        case 'wolFreehand':
          this.instance.setFreehand(change.currentValue);
          break;
        case 'wolProperties':
          this.instance.setProperties(change.currentValue ?? {});
          break;
      }
    }
  }

  /**
   * Accesses the OpenLayers Draw interaction.
   *
   * @returns The underlying instance, or `undefined` before creation and after component
   * teardown.
   */
  getInstance(): Draw | undefined {
    return this.instance;
  }
}
