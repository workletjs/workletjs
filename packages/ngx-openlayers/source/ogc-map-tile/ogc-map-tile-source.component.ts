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

import { ObjectEvent } from 'ol/Object';
import { unByKey } from 'ol/Observable';
import { LoadFunction } from 'ol/Tile';
import { EventsKey } from 'ol/events';
import BaseEvent from 'ol/events/Event';
import { ProjectionLike } from 'ol/proj';
import OGCMapTile from 'ol/source/OGCMapTile';
import { AttributionLike } from 'ol/source/Source';
import { TileSourceEvent } from 'ol/source/Tile';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { DisposeRef, useTileSourceHostRef } from '@workletjs/ngx-openlayers/source/tile';

@Component({
  selector: 'wol-ogc-map-tile-source',
  exportAs: 'wolOGCMapTileSource',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolOGCMapTileSourceComponent implements OnChanges {
  readonly wolUrl = input.required<string>();
  readonly wolContext = input<object>();
  readonly wolMediaType = input<string>();
  readonly wolProjection = input<ProjectionLike>();
  readonly wolAttributions = input<AttributionLike>();
  readonly wolCacheSize = input<number>();
  readonly wolCrossOrigin = input<string | null>();
  readonly wolInterpolate = input<boolean>();
  readonly wolReprojectionErrorThreshold = input<number>();
  readonly wolTileLoadFunction = input<LoadFunction>();
  readonly wolWrapX = input<boolean>();
  readonly wolTransition = input<number>();
  readonly wolCollections = input<string[]>();
  readonly wolProperties = input<WolProperties>();

  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
  readonly wolPropertyChange = output<ObjectEvent>();
  readonly wolTileLoadEnd = output<TileSourceEvent>();
  readonly wolTileLoadError = output<TileSourceEvent>();
  readonly wolTileLoadStart = output<TileSourceEvent>();

  private instance?: OGCMapTile;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);

    const hostRef = useTileSourceHostRef<OGCMapTile>('OGCMapTile');
    const eventsKey: Record<string, EventsKey> = {};

    let disposeRef: DisposeRef;

    afterNextRender(() => {
      const ogcMapTile = new OGCMapTile({
        url: this.wolUrl(),
        context: this.wolContext(),
        mediaType: this.wolMediaType(),
        projection: this.wolProjection(),
        attributions: this.wolAttributions(),
        cacheSize: this.wolCacheSize(),
        crossOrigin: this.wolCrossOrigin(),
        interpolate: this.wolInterpolate(),
        reprojectionErrorThreshold: this.wolReprojectionErrorThreshold(),
        tileLoadFunction: this.wolTileLoadFunction(),
        wrapX: this.wolWrapX(),
        transition: this.wolTransition(),
        collections: this.wolCollections(),
      });

      if (this.wolProperties()) {
        ogcMapTile.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKey['change'] = ogcMapTile.on('change', (evt) => this.wolChange.emit(evt));

      eventsKey['error'] = ogcMapTile.on('error', (evt) => this.wolError.emit(evt));

      eventsKey['propertychange'] = ogcMapTile.on('propertychange', (evt) =>
        this.wolPropertyChange.emit(evt),
      );

      eventsKey['tileloadend'] = ogcMapTile.on('tileloadend', (evt) =>
        this.wolTileLoadEnd.emit(evt),
      );

      eventsKey['tileloaderror'] = ogcMapTile.on('tileloaderror', (evt) =>
        this.wolTileLoadError.emit(evt),
      );

      eventsKey['tileloadstart'] = ogcMapTile.on('tileloadstart', (evt) =>
        this.wolTileLoadStart.emit(evt),
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
        disposeRef = hostRef.setSource(ogcMapTile);
      });

      this.instance = ogcMapTile;
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
   * @param changes The changed inputs
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
        case 'wolUrl':
          this.instance.setUrl(change.currentValue);
          break;
      }
    }
  }

  /**
   * Get the underlying OpenLayers OGCMapTile instance.
   * @returns The OGCMapTile instance
   */
  getInstance(): OGCMapTile | undefined {
    return this.instance;
  }
}
