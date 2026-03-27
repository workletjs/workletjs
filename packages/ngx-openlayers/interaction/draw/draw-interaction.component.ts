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

@Component({
  selector: 'wol-draw-interaction',
  exportAs: 'wolDrawInteraction',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolDrawInteractionComponent implements OnChanges {
  readonly wolActive = model(true);
  readonly wolType = input.required<Type>();
  readonly wolClickTolerance = input<number>();
  readonly wolFeatures = input<Collection<Feature>>();
  readonly wolSource = input<VectorSource>();
  readonly wolDragVertexDelay = input<number>();
  readonly wolSnapTolerance = input<number>();
  readonly wolStopClick = input<boolean>();
  readonly wolMaxPoints = input<number>();
  readonly wolMinPoints = input<number>();
  readonly wolFinishCondition = input<Condition>();
  readonly wolStyle = input<StyleLike | FlatStyleLike>();
  readonly wolGeometryFunction = input<GeometryFunction>();
  readonly wolGeometryName = input<string>();
  readonly wolCondition = input<Condition>();
  readonly wolFreehand = input<boolean>();
  readonly wolFreehandCondition = input<Condition>();
  readonly wolTrace = input<boolean | Condition>();
  readonly wolTraceSource = input<VectorSource>();
  readonly wolWrapX = input<boolean>();
  readonly wolGeometryLayout = input<GeometryLayout>();
  readonly wolProperties = input<WolProperties>();

  readonly wolChange = output<BaseEvent>();
  readonly wolDrawAbort = output<DrawEvent>();
  readonly wolDrawEnd = output<DrawEvent>();
  readonly wolDrawStart = output<DrawEvent>();
  readonly wolError = output<BaseEvent>();
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
   * Get the underlying OpenLayers Draw control instance.
   * @returns The Draw control instance
   */
  getInstance(): Draw | undefined {
    return this.instance;
  }
}
