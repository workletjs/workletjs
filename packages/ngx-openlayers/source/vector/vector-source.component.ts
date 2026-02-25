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
  output,
  signal,
} from '@angular/core';

import Collection from 'ol/Collection';
import Feature, { FeatureLike } from 'ol/Feature';
import { ObjectEvent } from 'ol/Object';
import { unByKey } from 'ol/Observable';
import { EventsKey } from 'ol/events';
import BaseEvent from 'ol/events/Event';
import { FeatureLoader, FeatureUrlFunction } from 'ol/featureloader';
import FeatureFormat from 'ol/format/Feature';
import { Geometry } from 'ol/geom';
import { AttributionLike } from 'ol/source/Source';
import VectorSource, { LoadingStrategy, VectorSourceEvent } from 'ol/source/Vector';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';

import { DisposeRef, useVectorSourceHostRef } from './use-vector-source-host-ref';

@Component({
  selector: 'wol-vector-source',
  exportAs: 'wolVectorSource',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolVectorSourceComponent<FeatureType extends FeatureLike = Feature<Geometry>>
  implements OnChanges
{
  readonly wolAttributions = input<AttributionLike>();
  readonly wolFeatures = input<FeatureType[] | Collection<FeatureType>>();
  readonly wolFormat = input<FeatureFormat<FeatureType>>();
  readonly wolLoader = input<FeatureLoader<FeatureType>>();
  readonly wolOverlaps = input<boolean>();
  readonly wolStrategy = input<LoadingStrategy>();
  readonly wolUrl = input<string | FeatureUrlFunction>();
  readonly wolUseSpatialIndex = input<boolean>();
  readonly wolWrapX = input<boolean>();
  readonly wolProperties = input<WolProperties>();

  readonly wolAddFeature = output<VectorSourceEvent<FeatureType>>();
  readonly wolChange = output<BaseEvent>();
  readonly wolChangeFeature = output<VectorSourceEvent<FeatureType>>();
  readonly wolClear = output<VectorSourceEvent<FeatureType>>();
  readonly wolError = output<BaseEvent>();
  readonly wolFeaturesLoadEnd = output<VectorSourceEvent<FeatureType>>();
  readonly wolFeaturesLoadError = output<VectorSourceEvent<FeatureType>>();
  readonly wolFeaturesLoadStart = output<VectorSourceEvent<FeatureType>>();
  readonly wolPropertyChange = output<ObjectEvent>();
  readonly wolRemoveFeature = output<VectorSourceEvent<FeatureType>>();

  readonly vectorSourceInstance = signal<VectorSource<FeatureType> | undefined>(undefined);

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useVectorSourceHostRef<VectorSource<FeatureType>>('VectorSource');
    const eventsKey: Record<string, EventsKey> = {};

    let disposeRef: DisposeRef;

    afterNextRender(() => {
      const vectorSource = new VectorSource<FeatureType>({
        attributions: this.wolAttributions(),
        features: this.wolFeatures(),
        format: this.wolFormat(),
        loader: this.wolLoader(),
        overlaps: this.wolOverlaps(),
        strategy: this.wolStrategy(),
        url: this.wolUrl(),
        useSpatialIndex: this.wolUseSpatialIndex(),
        wrapX: this.wolWrapX(),
      });

      if (this.wolProperties()) {
        vectorSource.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKey['addfeature'] = vectorSource.on('addfeature', (event) => {
        this.wolAddFeature.emit(event);
      });

      eventsKey['change'] = vectorSource.on('change', (event) => {
        this.wolChange.emit(event);
      });

      eventsKey['changefeature'] = vectorSource.on('changefeature', (event) => {
        this.wolChangeFeature.emit(event);
      });

      eventsKey['clear'] = vectorSource.on('clear', (event) => {
        this.wolClear.emit(event);
      });

      eventsKey['error'] = vectorSource.on('error', (event) => {
        this.wolError.emit(event);
      });

      eventsKey['featuresloadend'] = vectorSource.on('featuresloadend', (event) => {
        this.wolFeaturesLoadEnd.emit(event);
      });

      eventsKey['featuresloaderror'] = vectorSource.on('featuresloaderror', (event) => {
        this.wolFeaturesLoadError.emit(event);
      });

      eventsKey['featuresloadstart'] = vectorSource.on('featuresloadstart', (event) => {
        this.wolFeaturesLoadStart.emit(event);
      });

      eventsKey['propertychange'] = vectorSource.on('propertychange', (event) => {
        this.wolPropertyChange.emit(event);
      });

      eventsKey['removefeature'] = vectorSource.on('removefeature', (event) => {
        this.wolRemoveFeature.emit(event);
      });

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
        disposeRef = hostRef.setSource(vectorSource);
      });

      this.vectorSourceInstance.set(vectorSource);
    });

    destroyRef.onDestroy(() => {
      unByKey(Object.values(eventsKey));

      if (disposeRef) {
        disposeRef();
      }

      this.vectorSourceInstance.set(undefined);
    });
  }

  /**
   * Respond to input changes.
   * @param changes The changes object containing the changed inputs.
   * @internal
   */
  ngOnChanges(changes: SimpleChanges): void {
    const vectorSource = this.vectorSourceInstance();

    if (!vectorSource) {
      return;
    }

    for (const [key, change] of Object.entries(changes)) {
      switch (key) {
        case 'wolAttributions':
          vectorSource.setAttributions(change.currentValue);
          break;
        case 'wolLoader':
          vectorSource.setLoader(change.currentValue);
          break;
        case 'wolProperties':
          vectorSource.setProperties(change.currentValue ?? {});
          break;
        case 'wolUrl':
          vectorSource.setUrl(change.currentValue);
          break;
      }
    }
  }

  /**
   * Get the underlying OpenLayers VectorSource instance.
   * @returns The VectorSource instance or undefined if not yet created.
   */
  getInstance(): VectorSource<FeatureType> | undefined {
    return this.vectorSourceInstance();
  }
}
