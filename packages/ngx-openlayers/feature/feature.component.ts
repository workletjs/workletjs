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
import { isNotNil } from '@workletjs/ngx-openlayers/core/utils';
import { EventsKey } from 'ol/events';
import { Geometry } from 'ol/geom';
import { ObjectEvent } from 'ol/Object';
import { StyleLike } from 'ol/style/Style';
import Feature from 'ol/Feature';
import BaseEvent from 'ol/events/Event';
import { useFeatureHostRef } from './feature-host-ref';
import { unByKey } from 'ol/Observable';

@Component({
  selector: 'wol-feature',
  exportAs: 'wolFeature',
  template: '<ng-content />',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolFeatureComponent implements OnChanges {
  /**
   * The feature id. The feature id can be used with the [getFeatureById](https://openlayers.org/en/latest/apidoc/module-ol_source_Vector-VectorSource.html#getFeatureById) method.
   */
  readonly wolId = input<string | number>();

  /**
   * The default geometry for the feature. This will update the property with the name returned
   * by `wolGeometryName`.
   */
  readonly wolGeometry = model<Geometry>();

  /**
   * The property name to be used when getting the feature's default geometry. When calling [getGeometry](https://openlayers.org/en/latest/apidoc/module-ol_Feature-Feature.html#getGeometry),
   * the value of the property with this name will be returned.
   */
  readonly wolGeometryName = input<string>();

  /**
   * The style for the feature to override the layer style. This can be a single style object,
   * an array of styles, or a function that takes a resolution and returns an array of styles.
   * To unset the feature style, set the value to `undefined`.
   */
  readonly wolStyle = input<StyleLike>();

  /**
   * A collection of key-value pairs that will be set as the feature's properties.
   */
  readonly wolProperties = input<WolProperties>();

  /**
   * Generic change event. Triggered when the revision counter is increased.
   */
  readonly wolChange = output<BaseEvent>();

  /**
   * Generic error event. Triggered when an error occurs.
   */
  readonly wolError = output<BaseEvent>();

  /**
   * Generic property change event. Triggered when a property is changed.
   */
  readonly wolPropertyChange = output<ObjectEvent>();

  /**
   * Internal signal to hold the OpenLayers Feature instance.
   * @internal
   */
  readonly featureInstance = signal<Feature | undefined>(undefined);

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useFeatureHostRef();
    const eventsKeyMap: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const feature = new Feature({
        geometry: this.wolGeometry(),
        ...this.wolProperties(),
      });

      if (isNotNil(this.wolId())) {
        feature.setId(this.wolId());
      }

      if (isNotNil(this.wolGeometryName())) {
        feature.setGeometryName(this.wolGeometryName() as string);
      }

      if (isNotNil(this.wolStyle())) {
        feature.setStyle(this.wolStyle());
      }

      eventsKeyMap['change'] = feature.on('change', (evt) => this.wolChange.emit(evt));

      eventsKeyMap['change:geometry'] = feature.on('change:geometry', () =>
        this.wolGeometry.set(feature.getGeometry()),
      );

      eventsKeyMap['error'] = feature.on('error', (evt) => this.wolError.emit(evt));

      eventsKeyMap['propertychange'] = feature.on('propertychange', (evt) =>
        this.wolPropertyChange.emit(evt),
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
        hostRef.addFeature(feature);
      });

      this.featureInstance.set(feature);
    });

    destroyRef.onDestroy(() => {
      const feature = this.featureInstance();

      unByKey(Object.values(eventsKeyMap));

      if (feature) {
        hostRef.removeFeature(feature);
        this.featureInstance.set(undefined);
      }
    });
  }

  /**
   * Respond to input changes.
   * @param changes The changes object containing the changed inputs.
   * @internal
   */
  ngOnChanges(changes: SimpleChanges): void {
    const feature = this.featureInstance();

    if (!feature) {
      return;
    }

    for (const [key, change] of Object.entries(changes)) {
      switch (key) {
        case 'wolId':
          feature.setId(change.currentValue);
          break;
        case 'wolGeometry':
          feature.setGeometry(change.currentValue);
          break;
        case 'wolGeometryName':
          feature.setGeometryName(change.currentValue);
          break;
        case 'wolStyle':
          feature.setStyle(change.currentValue);
          break;
        case 'wolProperties':
          feature.setProperties(change.currentValue ?? {});
          break;
      }
    }
  }

  /**
   * Get the internal OpenLayers Feature instance
   * @returns The internal OpenLayers Feature instance
   */
  getInstance(): Feature | undefined {
    return this.featureInstance();
  }
}
