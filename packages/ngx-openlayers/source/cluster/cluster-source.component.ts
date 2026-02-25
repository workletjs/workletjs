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

@Component({
  selector: 'wol-cluster-source',
  exportAs: 'wolClusterSource',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolClusterSourceComponent implements OnChanges {
  readonly wolAttributions = input<AttributionLike>();
  readonly wolDistance = input<number>();
  readonly wolMinDistance = input<number>();
  readonly wolGeometryFunction = input<GeometryFunction<FeatureLike>>();
  readonly wolCreateCluster = input<(point: Point, features: FeatureLike[]) => Feature>();
  readonly wolSource = input<VectorSource<FeatureLike>>();
  readonly wolWrapX = input<boolean>();
  readonly wolProperties = input<WolProperties>();

  readonly wolAddFeature = output<VectorSourceEvent<FeatureLike>>();
  readonly wolChange = output<BaseEvent>();
  readonly wolChangeFeature = output<VectorSourceEvent<FeatureLike>>();
  readonly wolClear = output<VectorSourceEvent<FeatureLike>>();
  readonly wolError = output<BaseEvent>();
  readonly wolFeaturesLoadEnd = output<VectorSourceEvent<FeatureLike>>();
  readonly wolFeaturesLoadError = output<VectorSourceEvent<FeatureLike>>();
  readonly wolFeaturesLoadStart = output<VectorSourceEvent<FeatureLike>>();
  readonly wolPropertyChange = output<ObjectEvent>();
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
   * Get the underlying OpenLayers Cluster instance.
   * @returns The Cluster instance or undefined if not yet created.
   */
  getInstance(): Cluster<FeatureLike> | undefined {
    return this.instance;
  }
}
