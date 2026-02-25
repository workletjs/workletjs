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
import { NearestDirectionFunction } from 'ol/array';
import { EventsKey } from 'ol/events';
import BaseEvent from 'ol/events/Event';
import { Extent } from 'ol/extent';
import { ProjectionLike } from 'ol/proj';
import { Size } from 'ol/size';
import { AttributionLike } from 'ol/source/Source';
import { TileSourceEvent } from 'ol/source/Tile';
import Zoomify, { TierSizeCalculation } from 'ol/source/Zoomify';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { DisposeRef, useTileSourceHostRef } from '@workletjs/ngx-openlayers/source/tile';

@Component({
  selector: 'wol-zoomify-source',
  exportAs: 'wolZoomifySource',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolZoomifySourceComponent implements OnChanges {
  readonly wolAttributions = input<AttributionLike>();
  readonly wolCacheSize = input<number>();
  readonly wolCrossOrigin = input<string | null>();
  readonly wolInterpolate = input<boolean>();
  readonly wolProjection = input<ProjectionLike>();
  readonly wolTilePixelRatio = input<number>();
  readonly wolReprojectionErrorThreshold = input<number>();
  readonly wolUrl = input.required<string>();
  readonly wolTierSizeCalculation = input<TierSizeCalculation>();
  readonly wolSize = input.required<Size>();
  readonly wolExtent = input<Extent>();
  readonly wolTransition = input<number>();
  readonly wolTileSize = input<number>();
  readonly wolZDirection = input<number | NearestDirectionFunction>();
  readonly wolProperties = input<WolProperties>();

  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
  readonly wolPropertyChange = output<ObjectEvent>();
  readonly wolTileLoadEnd = output<TileSourceEvent>();
  readonly wolTileLoadError = output<TileSourceEvent>();
  readonly wolTileLoadStart = output<TileSourceEvent>();

  private instance?: Zoomify;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useTileSourceHostRef<Zoomify>('Zoomify');
    const eventsKey: Record<string, EventsKey> = {};

    let disposeRef: DisposeRef;

    afterNextRender(() => {
      const zoomify = new Zoomify({
        attributions: this.wolAttributions(),
        cacheSize: this.wolCacheSize(),
        crossOrigin: this.wolCrossOrigin(),
        interpolate: this.wolInterpolate(),
        projection: this.wolProjection(),
        tilePixelRatio: this.wolTilePixelRatio(),
        reprojectionErrorThreshold: this.wolReprojectionErrorThreshold(),
        url: this.wolUrl(),
        tierSizeCalculation: this.wolTierSizeCalculation(),
        size: this.wolSize(),
        extent: this.wolExtent(),
        transition: this.wolTransition(),
        tileSize: this.wolTileSize(),
        zDirection: this.wolZDirection(),
      });

      if (this.wolProperties()) {
        zoomify.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKey['change'] = zoomify.on('change', (event) => this.wolChange.emit(event));

      eventsKey['error'] = zoomify.on('error', (event) => this.wolError.emit(event));

      eventsKey['propertychange'] = zoomify.on('propertychange', (event) =>
        this.wolPropertyChange.emit(event),
      );

      eventsKey['tileloadend'] = zoomify.on('tileloadend', (event) =>
        this.wolTileLoadEnd.emit(event),
      );

      eventsKey['tileloaderror'] = zoomify.on('tileloaderror', (event) =>
        this.wolTileLoadError.emit(event),
      );

      eventsKey['tileloadstart'] = zoomify.on('tileloadstart', (event) =>
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
        disposeRef = hostRef.setSource(zoomify);
      });

      this.instance = zoomify;
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
      }
    }
  }

  /**
   * Get the OpenLayers Zoomify instance.
   * @returns The OpenLayers Zoomify instance or undefined if not yet created.
   */
  getInstance(): Zoomify | undefined {
    return this.instance;
  }
}
