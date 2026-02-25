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

@Component({
  selector: 'wol-select-interaction',
  exportAs: 'wolSelectInteraction',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolSelectInteractionComponent implements OnChanges {
  readonly wolActive = model(true);
  readonly wolAddCondition = input<Condition>();
  readonly wolCondition = input<Condition>();
  readonly wolLayers = input<Layer[] | ((layer: Layer) => boolean)>();
  readonly wolStyle = input<StyleLike | null>();
  readonly wolRemoveCondition = input<Condition>();
  readonly wolToggleCondition = input<Condition>();
  readonly wolMulti = input<boolean>();
  readonly wolFeatures = input<Collection<Feature>>();
  readonly wolFilter = input<FilterFunction>();
  readonly wolHitTolerance = input<number>();
  readonly wolProperties = input<WolProperties>();

  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
  readonly wolPropertyChange = output<ObjectEvent>();
  readonly wolSelect = output<SelectEvent>();

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
   * Get the underlying OpenLayers Select interaction instance.
   * @returns The Select interaction instance
   */
  getInstance(): Select | undefined {
    return this.selectInstance();
  }
}
