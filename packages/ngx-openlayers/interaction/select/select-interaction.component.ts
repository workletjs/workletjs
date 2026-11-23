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
import Select, { FilterFunction, SelectEvent } from 'ol/interaction/Select';
import Layer from 'ol/layer/Layer';
import { StyleLike } from 'ol/style/Style';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { useInteractionHostRef } from '@workletjs/ngx-openlayers/interaction/interaction';

/**
 * Selects vector features under the pointer and exposes selection changes and the selected
 * collection. See
 * [OpenLayers Select](https://openlayers.org/en/latest/apidoc/module-ol_interaction_Select-Select.html).
 */
@Component({
  selector: 'wol-select-interaction',
  exportAs: 'wolSelectInteraction',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolSelectInteractionComponent implements OnChanges {
  /**
   * Whether the interaction handles events. Defaults to `true`. This model updates the
   * interaction and reflects active-state changes from OpenLayers.
   */
  readonly wolActive = model(true);
  /**
   * Predicate that adds hit features when `wolCondition` is satisfied. Defaults to `never`. Use
   * it to configure a separate action for adding features. Read at creation.
   */
  readonly wolAddCondition = input<Condition>();
  /**
   * Predicate that triggers selection. Defaults to a single click, which normally replaces the
   * selection or clears it when no feature is hit. Read at creation.
   */
  readonly wolCondition = input<Condition>();
  /**
   * Array of selectable layers or a predicate that accepts candidate layers. By default, visible
   * layers are considered. Read at creation.
   */
  readonly wolLayers = input<Layer[] | ((layer: Layer) => boolean)>();
  /**
   * Style for selected features. Defaults to the OpenLayers editing style. Use `null` to preserve
   * each feature's style. Read at creation.
   */
  readonly wolStyle = input<StyleLike | null>();
  /**
   * Predicate that removes hit features when `wolCondition` is satisfied. Defaults to `never`.
   * Use it to configure a separate action for removing features. Read at creation.
   */
  readonly wolRemoveCondition = input<Condition>();
  /**
   * Predicate for toggling the hit feature in the current selection when `wolCondition` is
   * satisfied. Defaults to the Shift-only condition. Read at creation.
   */
  readonly wolToggleCondition = input<Condition>();
  /**
   * Whether to select all overlapping eligible features at the hit location. Defaults to `false`,
   * which selects one feature per event. Read at creation.
   */
  readonly wolMulti = input<boolean>();
  /**
   * Collection in which selected features are stored. OpenLayers creates one when omitted. The
   * collection is available from the native interaction's `getFeatures()`. Read at creation.
   */
  readonly wolFeatures = input<Collection<Feature>>();
  /**
   * Predicate called with the candidate feature and layer. Return `true` to allow selection. Read
   * at creation.
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
   * Emits when selection changes. The event carries newly selected and deselected features and
   * the map browser event.
   */
  readonly wolSelect = output<SelectEvent>();

  /**
   * Signal for the OpenLayers Select instance. Its value is `undefined` before creation and after
   * component teardown.
   */
  readonly selectInstance = signal<Select | undefined>(undefined);

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useInteractionHostRef<Select>('Select');
    const eventsKeyMap: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const select = new Select({
        addCondition: this.wolAddCondition(),
        condition: this.wolCondition(),
        layers: this.wolLayers(),
        style: this.wolStyle(),
        removeCondition: this.wolRemoveCondition(),
        toggleCondition: this.wolToggleCondition(),
        multi: this.wolMulti(),
        features: this.wolFeatures(),
        filter: this.wolFilter(),
        hitTolerance: this.wolHitTolerance(),
      });

      select.setActive(this.wolActive());

      if (this.wolProperties()) {
        select.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKeyMap['change'] = select.on('change', (event) => this.wolChange.emit(event));

      eventsKeyMap['change:active'] = select.on('change:active', () =>
        this.wolActive.set(select.getActive()),
      );

      eventsKeyMap['error'] = select.on('error', (event) => this.wolError.emit(event));

      eventsKeyMap['propertychange'] = select.on('propertychange', (event) =>
        this.wolPropertyChange.emit(event),
      );

      eventsKeyMap['select'] = select.on('select', (event) => this.wolSelect.emit(event));

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
        hostRef.addInteraction(select);
      });

      this.selectInstance.set(select);
    });

    destroyRef.onDestroy(() => {
      const selectInstance = this.selectInstance();
      if (selectInstance) {
        unByKey(Object.values(eventsKeyMap));
        hostRef.removeInteraction(selectInstance);
        selectInstance.dispose();
        this.selectInstance.set(undefined);
      }
    });
  }

  /**
   * Respond to input changes.
   * @param changes The changed inputs
   * @internal
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (!this.selectInstance()) {
      return;
    }

    for (const [key, change] of Object.entries(changes)) {
      switch (key) {
        case 'wolActive':
          this.selectInstance()?.setActive(change.currentValue);
          break;
        case 'wolHitTolerance':
          this.selectInstance()?.setHitTolerance(change.currentValue);
          break;
        case 'wolProperties':
          this.selectInstance()?.setProperties(change.currentValue ?? {});
          break;
      }
    }
  }

  /**
   * Accesses the OpenLayers Select interaction.
   *
   * @returns The underlying instance, or `undefined` before creation and after component
   * teardown.
   */
  getInstance(): Select | undefined {
    return this.selectInstance();
  }
}
