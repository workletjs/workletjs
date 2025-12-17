import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  model,
  OnChanges,
  output,
  signal,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { useInteractionHostRef } from '@workletjs/ngx-openlayers/interaction/interaction';
import { Condition } from 'ol/events/condition';
import { EventsKey } from 'ol/events';
import { ObjectEvent } from 'ol/Object';
import { unByKey } from 'ol/Observable';
import BaseEvent from 'ol/events/Event';
import Collection from 'ol/Collection';
import Feature from 'ol/Feature';
import Layer from 'ol/layer/Layer';
import Translate, { FilterFunction, TranslateEvent } from 'ol/interaction/Translate';

@Component({
  selector: 'wol-translate-interaction',
  exportAs: 'wolTranslateInteraction',
  template: '<ng-content />',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolTranslateInteractionComponent implements OnChanges {
  readonly wolActive = model(true);
  readonly wolCondition = input<Condition>();
  readonly wolFeatures = input<Collection<Feature>>();
  readonly wolLayers = input<Layer[] | ((layer: Layer) => boolean)>();
  readonly wolFilter = input<FilterFunction>();
  readonly wolHitTolerance = input<number>();
  readonly wolProperties = input<WolProperties>();

  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
  readonly wolPropertyChange = output<ObjectEvent>();
  readonly wolTranslateEnd = output<TranslateEvent>();
  readonly wolTranslateStart = output<TranslateEvent>();
  readonly wolTranslating = output<TranslateEvent>();

  /**
   * The Translate interaction instance.
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
   * Get the underlying OpenLayers Translate interaction instance.
   * @returns The Translate interaction instance
   */
  getInstance(): Translate | undefined {
    return this.translateInstance();
  }
}
