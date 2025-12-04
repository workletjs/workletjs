import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  OnChanges,
  output,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import Collection from 'ol/Collection';
import { EventsKey } from 'ol/events';
import { FeatureLoader, FeatureUrlFunction } from 'ol/featureloader';
import { Geometry } from 'ol/geom';
import { ObjectEvent } from 'ol/Object';
import { unByKey } from 'ol/Observable';
import { AttributionLike } from 'ol/source/Source';
import BaseEvent from 'ol/events/Event';
import Feature, { FeatureLike } from 'ol/Feature';
import FeatureFormat from 'ol/format/Feature';
import VectorSource, { LoadingStrategy, VectorSourceEvent } from 'ol/source/Vector';
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

  private instance?: VectorSource<FeatureType>;

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

      this.instance = vectorSource;
    });

    destroyRef.onDestroy(() => {
      unByKey(Object.values(eventsKey));

      if (disposeRef) {
        disposeRef();
      }

      this.instance = undefined;
    });
  }

  /**
   * Respond to input changes.
   * @param changes The changes object containing the changed inputs.
   * @internal
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (!this.instance) {
      return;
    }

    for (const [key, change] of Object.entries(changes)) {
      switch (key) {
        case 'wolAttributions':
          this.instance.setAttributions(change.currentValue);
          break;
        case 'wolLoader':
          this.instance.setLoader(change.currentValue);
          break;
        case 'wolProperties':
          this.instance.setProperties(change.currentValue ?? {});
          break;
        case 'wolUrl':
          this.instance.setUrl(change.currentValue);
          break;
      }
    }
  }

  /**
   * Get the underlying OpenLayers VectorSource instance.
   * @returns The VectorSource instance or undefined if not yet created.
   */
  getInstance(): VectorSource<FeatureType> | undefined {
    return this.instance;
  }
}
