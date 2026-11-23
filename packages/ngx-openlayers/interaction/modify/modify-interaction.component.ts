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

/**
 * Moves, adds, and removes vertices of existing vector features from either a collection or a
 * vector source. See
 * [OpenLayers Modify](https://openlayers.org/en/latest/apidoc/module-ol_interaction_Modify-Modify.html).
 */
@Component({
  selector: 'wol-modify-interaction',
  exportAs: 'wolModifyInteraction',
  template: '<ng-content />',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolModifyInteractionComponent implements OnChanges {
  /**
   * Whether the interaction handles events. Defaults to `true`. This model updates the
   * interaction and reflects active-state changes from OpenLayers.
   */
  readonly wolActive = model(true);
  /**
   * Predicate for the pointer action that starts adding or moving a vertex. Defaults to the
   * primary action. Read at creation.
   */
  readonly wolCondition = input<Condition>();
  /**
   * Predicate for deleting an existing vertex. Defaults to an Alt-only single click. Read at
   * creation.
   */
  readonly wolDeleteCondition = input<Condition>();
  /**
   * Predicate for allowing a new vertex to be inserted. By default, insertion is allowed whenever
   * the other edit conditions are met. Read at creation.
   */
  readonly wolInsertVertexCondition = input<Condition>();
  /**
   * Maximum pointer distance in pixels for editing a nearby segment or vertex. Defaults to `10`.
   * Read at creation.
   */
  readonly wolPixelTolerance = input<number>();
  /**
   * Style for the edit handle. Defaults to the OpenLayers editing style. A style function can
   * inspect the handle's `existing` flag and its corresponding `features` and `geometries`
   * arrays. Read at creation.
   */
  readonly wolStyle = input<StyleLike | FlatStyleLike>();
  /**
   * Vector source containing the features to modify when `wolFeatures` is omitted. The
   * interaction requires a source or collection. Read at creation.
   */
  readonly wolSource = input<VectorSource>();
  /**
   * Whether to hit-test point features using their rendered appearance. Supply a vector layer to
   * limit this test to the representation on that layer. Otherwise, editing uses pixel tolerance.
   * Read at creation.
   */
  readonly wolHitDetection = input<boolean | BaseVectorLayer<WolSafeAny, WolSafeAny, WolSafeAny>>();
  /**
   * Collection of features to modify. It takes precedence over `wolSource` when both are
   * supplied. Read at creation.
   */
  readonly wolFeatures = input<Collection<Feature>>();
  /**
   * Whether the sketch overlay wraps horizontally across world copies. Defaults to `false`. Read
   * at creation.
   */
  readonly wolWrapX = input<boolean>();
  /**
   * Whether the edited vertex or segment snaps to the pointer when clicked within tolerance.
   * Defaults to `true` unless rendered hit detection is enabled. Read at creation.
   */
  readonly wolSnapToPointer = input<boolean>();
  /**
   * Predicate called with a candidate feature. Return `true` to allow modification. By default,
   * eligible features are allowed. Read at creation.
   */
  readonly wolFilter = input<FilterFunction>();
  /**
   * Predicate that compares coordinates when matching shared vertices across geometries. By
   * default, OpenLayers compares all coordinate dimensions. Read at creation.
   */
  readonly wolSharedVerticesEqual = input<(a: Coordinate, b: Coordinate) => boolean>();
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
   * Emits the native `error` event when the OpenLayers instance dispatches one.
   */
  readonly wolError = output<BaseEvent>();
  /**
   * Emits when feature modification ends. The event carries the modified features and the map
   * browser event.
   */
  readonly wolModifyEnd = output<ModifyEvent>();
  /**
   * Emits when feature modification starts. The event carries the features being modified and the
   * map browser event.
   */
  readonly wolModifyStart = output<ModifyEvent>();
  /**
   * Emits the native `propertychange` event with the changed property key and its previous value.
   */
  readonly wolPropertyChange = output<ObjectEvent>();

  /**
   * Signal for the OpenLayers Modify instance. Its value is `undefined` before creation and after
   * component teardown.
   */
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
   * Accesses the OpenLayers Modify interaction.
   *
   * @returns The underlying instance, or `undefined` before creation and after component
   * teardown.
   */
  getInstance(): Modify | undefined {
    return this.modifyInstance();
  }
}
