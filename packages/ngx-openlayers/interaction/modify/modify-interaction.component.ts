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
  signal,
} from '@angular/core';

import Collection from 'ol/Collection';
import Feature from 'ol/Feature';
import { ObjectEvent } from 'ol/Object';
import { unByKey } from 'ol/Observable';
import { Coordinate } from 'ol/coordinate';
import { EventsKey } from 'ol/events';
import BaseEvent from 'ol/events/Event';
import { Condition } from 'ol/events/condition';
import Modify, { FilterFunction, ModifyEvent } from 'ol/interaction/Modify';
import BaseVectorLayer from 'ol/layer/BaseVector';
import VectorSource from 'ol/source/Vector';
import { StyleLike } from 'ol/style/Style';
import { FlatStyleLike } from 'ol/style/flat';

import { WolProperties, WolSafeAny } from '@workletjs/ngx-openlayers/core/types';
import { useInteractionHostRef } from '@workletjs/ngx-openlayers/interaction/interaction';

@Component({
  selector: 'wol-modify-interaction',
  exportAs: 'wolModifyInteraction',
  template: '<ng-content />',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolModifyInteractionComponent implements OnChanges {
  readonly wolActive = model(true);
  readonly wolCondition = input<Condition>();
  readonly wolDeleteCondition = input<Condition>();
  readonly wolInsertVertexCondition = input<Condition>();
  readonly wolPixelTolerance = input<number>();
  readonly wolStyle = input<StyleLike | FlatStyleLike>();
  readonly wolSource = input<VectorSource>();
  readonly wolHitDetection = input<boolean | BaseVectorLayer<WolSafeAny, WolSafeAny, WolSafeAny>>();
  readonly wolFeatures = input<Collection<Feature>>();
  readonly wolWrapX = input<boolean>();
  readonly wolSnapToPointer = input<boolean>();
  readonly wolFilter = input<FilterFunction>();
  readonly wolSharedVerticesEqual = input<(a: Coordinate, b: Coordinate) => boolean>();
  readonly wolProperties = input<WolProperties>();

  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
  readonly wolModifyEnd = output<ModifyEvent>();
  readonly wolModifyStart = output<ModifyEvent>();
  readonly wolPropertyChange = output<ObjectEvent>();

  readonly modifyInstance = signal<Modify | undefined>(undefined);

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useInteractionHostRef<Modify>('Modify');
    const eventsKeyMap: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const modify = new Modify({
        condition: this.wolCondition(),
        deleteCondition: this.wolDeleteCondition(),
        insertVertexCondition: this.wolInsertVertexCondition(),
        pixelTolerance: this.wolPixelTolerance(),
        style: this.wolStyle(),
        source: this.wolSource(),
        hitDetection: this.wolHitDetection(),
        features: this.wolFeatures(),
        wrapX: this.wolWrapX(),
        snapToPointer: this.wolSnapToPointer(),
        filter: this.wolFilter(),
        sharedVerticesEqual: this.wolSharedVerticesEqual(),
      });

      modify.setActive(this.wolActive());

      if (this.wolProperties()) {
        modify.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKeyMap['change'] = modify.on('change', (event) => this.wolChange.emit(event));

      eventsKeyMap['change:active'] = modify.on('change:active', () =>
        this.wolActive.set(modify.getActive()),
      );

      eventsKeyMap['error'] = modify.on('error', (event) => this.wolError.emit(event));

      eventsKeyMap['modifyend'] = modify.on('modifyend', (event) => this.wolModifyEnd.emit(event));

      eventsKeyMap['modifystart'] = modify.on('modifystart', (event) =>
        this.wolModifyStart.emit(event),
      );

      eventsKeyMap['propertychange'] = modify.on('propertychange', (event) =>
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
        hostRef.addInteraction(modify);
      });

      this.modifyInstance.set(modify);
    });

    destroyRef.onDestroy(() => {
      const modifyInstance = this.modifyInstance();
      if (modifyInstance) {
        unByKey(Object.values(eventsKeyMap));
        hostRef.removeInteraction(modifyInstance);
        modifyInstance.dispose();
        this.modifyInstance.set(undefined);
      }
    });
  }

  /**
   * Respond to input changes.
   * @param changes The changed inputs
   * @internal
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (!this.modifyInstance()) {
      return;
    }

    for (const [key, change] of Object.entries(changes)) {
      switch (key) {
        case 'wolActive':
          this.modifyInstance()?.setActive(change.currentValue);
          break;
        case 'wolProperties':
          this.modifyInstance()?.setProperties(change.currentValue ?? {});
          break;
      }
    }
  }

  /**
   * Get the underlying OpenLayers Modify interaction instance.
   * @returns The Modify interaction instance
   */
  getInstance(): Modify | undefined {
    return this.modifyInstance();
  }
}
