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

import Feature from 'ol/Feature';
import { ObjectEvent } from 'ol/Object';
import { unByKey } from 'ol/Observable';
import { EventsKey } from 'ol/events';
import BaseEvent from 'ol/events/Event';
import { Geometry } from 'ol/geom';
import { StyleLike } from 'ol/style/Style';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { isNotNil } from '@workletjs/ngx-openlayers/core/utils';

import { useFeatureHostRef } from './feature-host-ref';

/**
 * Adds an OpenLayers [Feature](https://openlayers.org/en/latest/apidoc/module-ol_Feature-Feature.html) to its host vector or cluster source.
 *
 * Configure its geometry, style, and observable attributes with inputs, or nest a geometry
 * component to supply the default geometry.
 */
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
   * Geometry stored in the `geometry` property when this component initializes. Once the instance
   * is created, changes to this model update the property selected by `wolGeometryName`.
   *
   * @remarks When using a custom geometry name, supply that named geometry through `wolProperties`
   * for initialization. A nested geometry component supplies its geometry after the feature has
   * been created.
   */
  readonly wolGeometry = model<Geometry>();

  /**
   * Name of the property used for the default geometry, which OpenLayers uses to render the
   * feature. Defaults to `geometry`. Supply a matching property in `wolProperties` to initialize a
   * custom named geometry.
   */
  readonly wolGeometryName = input<string>();

  /**
   * Feature-level style as one style, an array of styles, or a function of the feature and view
   * resolution. Use `undefined` to fall back to the layer style.
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
   * Gets the OpenLayers `Feature` instance managed by the component.
   *
   * @returns The `Feature` instance, or `undefined` before creation and after destruction.
   */
  getInstance(): Feature | undefined {
    return this.featureInstance();
  }
}
