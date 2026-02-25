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

import { FeatureLike } from 'ol/Feature';
import { ObjectEvent } from 'ol/Object';
import { unByKey } from 'ol/Observable';
import VectorTile from 'ol/VectorTile';
import { NearestDirectionFunction } from 'ol/array';
import { EventsKey } from 'ol/events';
import BaseEvent from 'ol/events/Event';
import FeatureFormat from 'ol/format/Feature';
import { OGCVectorTile } from 'ol/source';
import { AttributionLike } from 'ol/source/Source';
import { TileSourceEvent } from 'ol/source/Tile';

import { WolProperties, WolSafeAny } from '@workletjs/ngx-openlayers/core/types';
import {
  DisposeRef,
  useVectorTileSourceHostRef,
} from '@workletjs/ngx-openlayers/source/vector-tile';

@Component({
  selector: 'wol-ogc-vector-tile-source',
  exportAs: 'wolOGCVectorTileSource',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolOGCVectorTileSourceComponent implements OnChanges {
  readonly wolUrl = input.required<string>();
  readonly wolContext = input<Record<string, WolSafeAny>>();
  readonly wolFormat = input<FeatureFormat<FeatureLike>>();
  readonly wolMediaType = input<string>();
  readonly wolAttributions = input<AttributionLike>();
  readonly wolAttributionsCollapsible = input<boolean>();
  readonly wolCacheSize = input<number>();
  readonly wolOverlaps = input<boolean>();
  readonly wolProjection = input<string>();
  readonly wolTileClass = input<typeof VectorTile>();
  readonly wolTransition = input<number>();
  readonly wolWrapX = input<boolean>();
  readonly wolZDirection = input<number | NearestDirectionFunction>();
  readonly wolCollections = input<string[]>();
  readonly wolProperties = input<WolProperties>();

  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
  readonly wolPropertyChange = output<ObjectEvent>();
  readonly wolTileLoadEnd = output<TileSourceEvent>();
  readonly wolTileLoadError = output<TileSourceEvent>();
  readonly wolTileLoadStart = output<TileSourceEvent>();

  private instance?: OGCVectorTile<FeatureLike>;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useVectorTileSourceHostRef<OGCVectorTile<FeatureLike>>('OGCVectorTile');
    const eventsKey: Record<string, EventsKey> = {};

    let disposeRef: DisposeRef;

    afterNextRender(() => {
      const ogcVectorTile = new OGCVectorTile({
        url: this.wolUrl(),
        context: this.wolContext(),
        format: this.wolFormat(),
        mediaType: this.wolMediaType(),
        attributions: this.wolAttributions(),
        attributionsCollapsible: this.wolAttributionsCollapsible(),
        cacheSize: this.wolCacheSize(),
        overlaps: this.wolOverlaps(),
        projection: this.wolProjection(),
        tileClass: this.wolTileClass(),
        transition: this.wolTransition(),
        wrapX: this.wolWrapX(),
        zDirection: this.wolZDirection(),
        collections: this.wolCollections(),
      });

      if (this.wolProperties()) {
        ogcVectorTile.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKey['change'] = ogcVectorTile.on('change', (evt) => this.wolChange.emit(evt));

      eventsKey['error'] = ogcVectorTile.on('error', (evt) => this.wolError.emit(evt));

      eventsKey['propertychange'] = ogcVectorTile.on('propertychange', (evt) =>
        this.wolPropertyChange.emit(evt),
      );

      eventsKey['tileloadend'] = ogcVectorTile.on('tileloadend', (evt) =>
        this.wolTileLoadEnd.emit(evt),
      );

      eventsKey['tileloaderror'] = ogcVectorTile.on('tileloaderror', (evt) =>
        this.wolTileLoadError.emit(evt),
      );

      eventsKey['tileloadstart'] = ogcVectorTile.on('tileloadstart', (evt) =>
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
        disposeRef = hostRef.setSource(ogcVectorTile);
      });

      this.instance = ogcVectorTile;
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
        case 'wolUrl':
          this.instance.setUrl(change.currentValue);
          break;
      }
    }
  }

  /**
   * Get the underlying OGCVectorTile instance.
   * @returns The OGCVectorTile instance or undefined if not initialized.
   */
  getInstance(): OGCVectorTile<FeatureLike> | undefined {
    return this.instance;
  }
}
