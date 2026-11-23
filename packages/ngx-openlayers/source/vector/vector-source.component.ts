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

/**
 * Supplies editable vector features to a compatible layer or a cluster source.
 *
 * @see [OpenLayers VectorSource](https://openlayers.org/en/latest/apidoc/module-ol_source_Vector-VectorSource.html)
 */
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
  /**
   * Credits displayed for this source. Accepts a string, an array of strings, or a function.
   * Changes update the source.
   */
  readonly wolAttributions = input<AttributionLike>();
  /**
   * Initial features. An OpenLayers `Collection` stays synchronized with the source when features
   * are added or removed. Pass a collection for ongoing synchronization.
   */
  readonly wolFeatures = input<FeatureType[] | Collection<FeatureType>>();
  /**
   * Parser used by the default URL loader. Supply a format when using `wolUrl` with that loader or
   * when changing `wolUrl` after creation. The component reads the format at creation.
   */
  readonly wolFormat = input<FeatureFormat<FeatureType>>();
  /**
   * Custom feature loader for each extent selected by `wolStrategy`. If omitted and `wolUrl` is
   * set, OpenLayers uses its XHR loader. Changes update the loader on the source.
   *
   * @remarks A promise-based loader returns the features in the requested projection. For a
   * callback-style loader, invoke the success or failure callback so the corresponding load event
   * is emitted.
   */
  readonly wolLoader = input<FeatureLoader<FeatureType>>();
  /**
   * Allows overlapping geometries by default. Set to `false` if features do not overlap so the
   * renderer can optimize fills and strokes. Read at creation.
   */
  readonly wolOverlaps = input<boolean>();
  /**
   * Selects which extents to load at a given resolution. Defaults to the OpenLayers `all`
   * strategy, which loads features for the whole map at once. Read at creation.
   */
  readonly wolStrategy = input<LoadingStrategy>();
  /**
   * URL or a function that calculates the URL from the requested extent, resolution, and
   * projection. With the default loader, OpenLayers uses `wolFormat` and parses features into the
   * view projection. Changing the URL after creation installs a new XHR loader.
   */
  readonly wolUrl = input<string | FeatureUrlFunction>();
  /**
   * Maintains an R-tree spatial index by default. Set to `false` for small, frequently changing
   * collections. OpenLayers then keeps the features in a collection, and some spatial queries are
   * unavailable. Read at creation.
   */
  readonly wolUseSpatialIndex = input<boolean>();
  /**
   * Wraps features horizontally across the antimeridian by default. Set to `false` when editing
   * geometries across the antimeridian requires coordinates outside the world extent. Read at
   * creation.
   */
  readonly wolWrapX = input<boolean>();
  /**
   * Observable OpenLayers properties to set on the source. New values update the supplied keys.
   * Omitted keys keep their current values.
   */
  readonly wolProperties = input<WolProperties>();

  /** Emits when a feature is added. The event provides the added feature. */
  readonly wolAddFeature = output<VectorSourceEvent<FeatureType>>();
  /** Emits the source's `change` event when its revision increases. */
  readonly wolChange = output<BaseEvent>();
  /** Emits when a feature in the source changes. The event provides the changed feature. */
  readonly wolChangeFeature = output<VectorSourceEvent<FeatureType>>();
  /** Emits when the source clears its features. */
  readonly wolClear = output<VectorSourceEvent<FeatureType>>();
  /** Forwards the native `error` event emitted by the source. */
  readonly wolError = output<BaseEvent>();
  /** Emits when a feature load completes successfully. The event provides the loaded features. */
  readonly wolFeaturesLoadEnd = output<VectorSourceEvent<FeatureType>>();
  /** Emits when a feature load reports a failure. */
  readonly wolFeaturesLoadError = output<VectorSourceEvent<FeatureType>>();
  /** Emits when the source starts loading features for an extent. */
  readonly wolFeaturesLoadStart = output<VectorSourceEvent<FeatureType>>();
  /**
   * Emits when an observable source property changes. The event provides the property key and its
   * previous value.
   */
  readonly wolPropertyChange = output<ObjectEvent>();
  /** Emits when a feature is removed. The event provides the removed feature. */
  readonly wolRemoveFeature = output<VectorSourceEvent<FeatureType>>();

  /**
   * Signal holding the OpenLayers source after rendering. Its value is `undefined` before creation
   * and after destruction.
   */
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
   * Returns the OpenLayers VectorSource instance.
   *
   * @returns The source after rendering, or `undefined` before creation and after destruction.
   */
  getInstance(): VectorSource<FeatureType> | undefined {
    return this.vectorSourceInstance();
  }
}
