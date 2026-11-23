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
} from '@angular/core';

import Feature, { FeatureLike } from 'ol/Feature';
import { ObjectEvent } from 'ol/Object';
import { unByKey } from 'ol/Observable';
import { EventsKey } from 'ol/events';
import BaseEvent from 'ol/events/Event';
import Point from 'ol/geom/Point';
import Cluster, { GeometryFunction } from 'ol/source/Cluster';
import { AttributionLike } from 'ol/source/Source';
import VectorSource, { VectorSourceEvent } from 'ol/source/Vector';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';

import { DisposeRef, useClusterSourceHostRef } from './use-cluster-source-host-ref';

/**
 * Groups nearby features from a vector source into features that a vector layer can render.
 *
 * @see [OpenLayers Cluster](https://openlayers.org/en/latest/apidoc/module-ol_source_Cluster-Cluster.html)
 */
@Component({
  selector: 'wol-cluster-source',
  exportAs: 'wolClusterSource',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolClusterSourceComponent implements OnChanges {
  /**
   * Credits displayed for this source. Accepts a string, an array of strings, or a function.
   * Changes update the source.
   */
  readonly wolAttributions = input<AttributionLike>();
  /**
   * Pixel distance used to group nearby features. Defaults to `20`. Changes recalculate the
   * clusters.
   */
  readonly wolDistance = input<number>();
  /**
   * Minimum pixel separation between clusters. Defaults to `0` and is capped at `wolDistance`.
   * Increasing it can prevent symbols from overlapping and can shift clusters away from the center
   * of their features. Changes recalculate the clusters.
   */
  readonly wolMinDistance = input<number>();
  /**
   * Returns the point used to cluster an input feature, or `null` to exclude it. The default uses
   * the feature geometry and expects point features. For polygons, supply a representative point
   * such as an interior point. Read at creation.
   */
  readonly wolGeometryFunction = input<GeometryFunction<FeatureLike>>();
  /**
   * Creates the feature to render from the cluster position and its member features. The default
   * stores the point as the geometry and the members in a `features` property. Read at creation.
   */
  readonly wolCreateCluster = input<(point: Point, features: FeatureLike[]) => Feature>();
  /**
   * Vector source whose features are grouped. Changes replace the source. You can also supply a
   * nested `WolVectorSourceComponent`.
   */
  readonly wolSource = input<VectorSource<FeatureLike>>();
  /**
   * Whether the source wraps horizontally across world boundaries. Defaults to `true`. Set when
   * creating the source.
   */
  readonly wolWrapX = input<boolean>();
  /**
   * Observable OpenLayers properties to set on the source. New values update the supplied keys.
   * Omitted keys keep their current values.
   */
  readonly wolProperties = input<WolProperties>();

  /** Emits when a new cluster feature is added. The event carries that cluster feature. */
  readonly wolAddFeature = output<VectorSourceEvent<FeatureLike>>();
  /** Emits the source's `change` event when its revision increases. */
  readonly wolChange = output<BaseEvent>();
  /** Emits when an existing cluster feature changes. The event carries that cluster feature. */
  readonly wolChangeFeature = output<VectorSourceEvent<FeatureLike>>();
  /**
   * Emits when the cluster source clears its features, including before recalculating clusters.
   */
  readonly wolClear = output<VectorSourceEvent<FeatureLike>>();
  /** Forwards the native `error` event emitted by the source. */
  readonly wolError = output<BaseEvent>();
  /**
   * Forwards a `featuresloadend` event from the cluster source. The underlying vector source has
   * its own feature loading events.
   */
  readonly wolFeaturesLoadEnd = output<VectorSourceEvent<FeatureLike>>();
  /**
   * Forwards a `featuresloaderror` event from the cluster source. Listen on the underlying vector
   * source for its loader failures.
   */
  readonly wolFeaturesLoadError = output<VectorSourceEvent<FeatureLike>>();
  /**
   * Forwards a `featuresloadstart` event from the cluster source. Listen on the underlying vector
   * source for its loader starts.
   */
  readonly wolFeaturesLoadStart = output<VectorSourceEvent<FeatureLike>>();
  /**
   * Emits when an observable source property changes. The event provides the property key and its
   * previous value.
   */
  readonly wolPropertyChange = output<ObjectEvent>();
  /** Emits when a cluster feature is removed. The event carries that cluster feature. */
  readonly wolRemoveFeature = output<VectorSourceEvent<FeatureLike>>();

  private instance?: Cluster<FeatureLike>;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useClusterSourceHostRef<Cluster<FeatureLike>>('Cluster');
    const eventsKey: Record<string, EventsKey> = {};

    let disposeRef: DisposeRef;

    afterNextRender(() => {
      const cluster = new Cluster({
        attributions: this.wolAttributions(),
        distance: this.wolDistance(),
        minDistance: this.wolMinDistance(),
        geometryFunction: this.wolGeometryFunction(),
        createCluster: this.wolCreateCluster(),
        source: this.wolSource(),
        wrapX: this.wolWrapX(),
      });

      if (this.wolProperties()) {
        cluster.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKey['addfeature'] = cluster.on('addfeature', (event) => {
        this.wolAddFeature.emit(event);
      });

      eventsKey['change'] = cluster.on('change', (event) => {
        this.wolChange.emit(event);
      });

      eventsKey['changefeature'] = cluster.on('changefeature', (event) => {
        this.wolChangeFeature.emit(event);
      });

      eventsKey['clear'] = cluster.on('clear', (event) => {
        this.wolClear.emit(event);
      });

      eventsKey['error'] = cluster.on('error', (event) => {
        this.wolError.emit(event);
      });

      eventsKey['featuresloadend'] = cluster.on('featuresloadend', (event) => {
        this.wolFeaturesLoadEnd.emit(event);
      });

      eventsKey['featuresloaderror'] = cluster.on('featuresloaderror', (event) => {
        this.wolFeaturesLoadError.emit(event);
      });

      eventsKey['featuresloadstart'] = cluster.on('featuresloadstart', (event) => {
        this.wolFeaturesLoadStart.emit(event);
      });

      eventsKey['propertychange'] = cluster.on('propertychange', (event) => {
        this.wolPropertyChange.emit(event);
      });

      eventsKey['removefeature'] = cluster.on('removefeature', (event) => {
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
        disposeRef = hostRef.setSource(cluster);
      });

      this.instance = cluster;
    });

    destroyRef.onDestroy(() => {
      unByKey(Object.values(eventsKey));

      if (disposeRef) {
        disposeRef();
      }

      /**
       * If the instance is disposed without also disposing the underlying source setSource(null)
       * has to be called to remove the listener reference from the wrapped source.
       */
      this.instance?.setSource(null);
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
        case 'wolDistance':
          this.instance.setDistance(change.currentValue);
          break;
        case 'wolMinDistance':
          this.instance.setMinDistance(change.currentValue);
          break;
        case 'wolProperties':
          this.instance.setProperties(change.currentValue ?? {});
          break;
        case 'wolSource':
          this.instance.setSource(change.currentValue);
          break;
      }
    }
  }

  /**
   * Returns the OpenLayers Cluster instance.
   *
   * @returns The source after rendering, or `undefined` before creation and after destruction.
   */
  getInstance(): Cluster<FeatureLike> | undefined {
    return this.instance;
  }
}
