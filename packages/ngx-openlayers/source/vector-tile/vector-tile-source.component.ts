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
import { NearestDirectionFunction } from 'ol/array';
import { Extent } from 'ol/extent';
import { EventsKey } from 'ol/events';
import { ObjectEvent } from 'ol/Object';
import { unByKey } from 'ol/Observable';
import { ProjectionLike } from 'ol/proj';
import { Size } from 'ol/size';
import { LoadFunction, UrlFunction } from 'ol/Tile';
import { TileGrid } from 'ol/tilegrid';
import { FeatureLike } from 'ol/Feature';
import { AttributionLike, State } from 'ol/source/Source';
import { TileSourceEvent } from 'ol/source/Tile';
import BaseEvent from 'ol/events/Event';
import FeatureFormat from 'ol/format/Feature';
import VectorTile from 'ol/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';
import { DisposeRef, useVectorTileSourceHostRef } from './use-vector-tile-source-host-ref';

@Component({
  selector: 'wol-vector-tile-source',
  exportAs: 'wolVectorTileSource',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolVectorTileSourceComponent implements OnChanges {
  readonly wolAttributions = input<AttributionLike>();
  readonly wolAttributionsCollapsible = input<boolean>();
  readonly wolCacheSize = input<number>();
  readonly wolExtent = input<Extent>();
  readonly wolFormat = input<FeatureFormat<FeatureLike>>();
  readonly wolOverlaps = input<boolean>();
  readonly wolProjection = input<ProjectionLike>();
  readonly wolState = input<State>();
  readonly wolTileClass = input<typeof VectorTile>();
  readonly wolMaxZoom = input<number>();
  readonly wolMinZoom = input<number>();
  readonly wolTileSize = input<number | Size>();
  readonly wolMaxResolution = input<number>();
  readonly wolTileGrid = input<TileGrid>();
  readonly wolTileLoadFunction = input<LoadFunction>();
  readonly wolTileUrlFunction = input<UrlFunction>();
  readonly wolUrl = input<string>();
  readonly wolTransition = input<number>();
  readonly wolUrls = input<string[]>();
  readonly wolWrapX = input<boolean>();
  readonly wolZDirection = input<number | NearestDirectionFunction>();
  readonly wolProperties = input<WolProperties>();

  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
  readonly wolPropertyChange = output<ObjectEvent>();
  readonly wolTileLoadEnd = output<TileSourceEvent>();
  readonly wolTileLoadError = output<TileSourceEvent>();
  readonly wolTileLoadStart = output<TileSourceEvent>();

  private instance?: VectorTileSource<FeatureLike>;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useVectorTileSourceHostRef<VectorTileSource<FeatureLike>>('VectorTileSource');
    const eventsKey: Record<string, EventsKey> = {};

    let disposeRef: DisposeRef;

    afterNextRender(() => {
      const vectorTileSource = new VectorTileSource<FeatureLike>({
        attributions: this.wolAttributions(),
        attributionsCollapsible: this.wolAttributionsCollapsible(),
        cacheSize: this.wolCacheSize(),
        extent: this.wolExtent(),
        format: this.wolFormat(),
        overlaps: this.wolOverlaps(),
        projection: this.wolProjection(),
        state: this.wolState(),
        tileClass: this.wolTileClass(),
        maxZoom: this.wolMaxZoom(),
        minZoom: this.wolMinZoom(),
        tileSize: this.wolTileSize(),
        maxResolution: this.wolMaxResolution(),
        tileGrid: this.wolTileGrid(),
        tileLoadFunction: this.wolTileLoadFunction(),
        tileUrlFunction: this.wolTileUrlFunction(),
        url: this.wolUrl(),
        transition: this.wolTransition(),
        urls: this.wolUrls(),
        wrapX: this.wolWrapX(),
        zDirection: this.wolZDirection(),
      });

      if (this.wolProperties()) {
        vectorTileSource.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKey['change'] = vectorTileSource.on('change', (event) => this.wolChange.emit(event));

      eventsKey['error'] = vectorTileSource.on('error', (event) => this.wolError.emit(event));

      eventsKey['propertychange'] = vectorTileSource.on('propertychange', (event) =>
        this.wolPropertyChange.emit(event),
      );

      eventsKey['tileloadend'] = vectorTileSource.on('tileloadend', (event) =>
        this.wolTileLoadEnd.emit(event),
      );

      eventsKey['tileloaderror'] = vectorTileSource.on('tileloaderror', (event) =>
        this.wolTileLoadError.emit(event),
      );

      eventsKey['tileloadstart'] = vectorTileSource.on('tileloadstart', (event) =>
        this.wolTileLoadStart.emit(event),
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
        disposeRef = hostRef.setSource(vectorTileSource);
      });

      this.instance = vectorTileSource;
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
        case 'wolProperties':
          this.instance.setProperties(change.currentValue ?? {});
          break;
        case 'wolTileLoadFunction':
          this.instance.setTileLoadFunction(change.currentValue);
          break;
        case 'wolTileUrlFunction':
          this.instance.setTileUrlFunction(change.currentValue);
          break;
        case 'wolUrl':
          this.instance.setUrl(change.currentValue);
          break;
        case 'wolUrls':
          this.instance.setUrls(change.currentValue);
          break;
      }
    }
  }

  /**
   * Get the underlying VectorTileSource instance.
   * @returns The VectorTileSource instance or undefined if not initialized.
   */
  getInstance(): VectorTileSource<FeatureLike> | undefined {
    return this.instance;
  }
}
