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
import { EventsKey } from 'ol/events';
import BaseEvent from 'ol/events/Event';
import { Condition } from 'ol/events/condition';
import Translate, { FilterFunction, TranslateEvent } from 'ol/interaction/Translate';
import Layer from 'ol/layer/Layer';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { useInteractionHostRef } from '@workletjs/ngx-openlayers/interaction/interaction';

/**
 * Moves features by dragging them on the map, optionally moving all features in a collection
 * together. See
 * [OpenLayers Translate](https://openlayers.org/en/latest/apidoc/module-ol_interaction_Translate-Translate.html).
 */
@Component({
  selector: 'wol-translate-interaction',
  exportAs: 'wolTranslateInteraction',
  template: '<ng-content />',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolTranslateInteractionComponent implements OnChanges {
  /**
   * Whether the interaction handles events. Defaults to `true`. This model updates the
   * interaction and reflects active-state changes from OpenLayers.
   */
  readonly wolActive = model(true);
  /**
   * Predicate for map browser events used for translation. The default accepts every otherwise
   * eligible event. Read at creation.
   */
  readonly wolCondition = input<Condition>();
  /**
   * Collection of features to move together. A provided collection takes precedence over
   * `wolLayers` and `wolFilter`. Read at creation.
   */
  readonly wolFeatures = input<Collection<Feature>>();
  /**
   * Array of eligible layers or a predicate that accepts candidate layers. When `wolFeatures` is
   * omitted, the default considers all visible layers. Read at creation.
   */
  readonly wolLayers = input<Layer[] | ((layer: Layer) => boolean)>();
  /**
   * Predicate called with a candidate feature and layer. Return `true` to allow translation.
   * Applies when `wolFeatures` is omitted. Read at creation.
   */
  readonly wolFilter = input<FilterFunction>();
  /**
   * Hit-test radius in pixels. Defaults to `0` at creation and can be updated afterward.
   */
  readonly wolHitTolerance = input<number>();
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
   * Emits the native `propertychange` event with the changed property key and its previous value.
   */
  readonly wolPropertyChange = output<ObjectEvent>();
  /**
   * Emits when dragging ends. The event includes the moved features, the start and final
   * coordinates, and the map browser event.
   */
  readonly wolTranslateEnd = output<TranslateEvent>();
  /**
   * Emits when dragging starts. The event includes the features, the starting coordinate, and the
   * map browser event.
   */
  readonly wolTranslateStart = output<TranslateEvent>();
  /**
   * Emits as features move. The event includes the features, the start and current coordinates,
   * and the map browser event.
   */
  readonly wolTranslating = output<TranslateEvent>();

  /**
   * Signal for the OpenLayers Translate instance. Its value is `undefined` before creation and
   * after component teardown.
   */
  readonly translateInstance = signal<Translate | undefined>(undefined);

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useInteractionHostRef<Translate>('Translate');
    const eventsKeyMap: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const translate = new Translate({
        condition: this.wolCondition(),
        features: this.wolFeatures(),
        layers: this.wolLayers(),
        filter: this.wolFilter(),
        hitTolerance: this.wolHitTolerance(),
      });

      translate.setActive(this.wolActive());

      if (this.wolProperties()) {
        translate.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKeyMap['change'] = translate.on('change', (event) => this.wolChange.emit(event));

      eventsKeyMap['change:active'] = translate.on('change:active', () =>
        this.wolActive.set(translate.getActive()),
      );

      eventsKeyMap['error'] = translate.on('error', (event) => this.wolError.emit(event));

      eventsKeyMap['propertychange'] = translate.on('propertychange', (event) =>
        this.wolPropertyChange.emit(event),
      );

      eventsKeyMap['translatestart'] = translate.on('translatestart', (event) =>
        this.wolTranslateStart.emit(event),
      );

      eventsKeyMap['translateend'] = translate.on('translateend', (event) =>
        this.wolTranslateEnd.emit(event),
      );

      eventsKeyMap['translating'] = translate.on('translating', (event) =>
        this.wolTranslating.emit(event),
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
        hostRef.addInteraction(translate);
      });

      this.translateInstance.set(translate);
    });

    destroyRef.onDestroy(() => {
      const translateInstance = this.translateInstance();
      if (translateInstance) {
        unByKey(Object.values(eventsKeyMap));
        hostRef.removeInteraction(translateInstance);
        translateInstance.dispose();
        this.translateInstance.set(undefined);
      }
    });
  }

  /**
   * Respond to input changes.
   * @param changes The changed inputs
   * @internal
   */
  ngOnChanges(changes: SimpleChanges): void {
    const translateInstance = this.translateInstance();

    if (!translateInstance) {
      return;
    }

    for (const [key, change] of Object.entries(changes)) {
      switch (key) {
        case 'wolActive':
          translateInstance.setActive(change.currentValue);
          break;
        case 'wolHitTolerance':
          translateInstance.setHitTolerance(change.currentValue);
          break;
        case 'wolProperties':
          translateInstance.setProperties(change.currentValue ?? {});
          break;
      }
    }
  }

  /**
   * Accesses the OpenLayers Translate interaction.
   *
   * @returns The underlying instance, or `undefined` before creation and after component
   * teardown.
   */
  getInstance(): Translate | undefined {
    return this.translateInstance();
  }
}
