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

/**
 * Loads tiles for a large image from a Zoomify pyramid or a compatible IIP image service.
 *
 * @see [OpenLayers Zoomify](https://openlayers.org/en/latest/apidoc/module-ol_source_Zoomify-Zoomify.html)
 */
@Component({
  selector: 'wol-zoomify-source',
  exportAs: 'wolZoomifySource',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolZoomifySourceComponent implements OnChanges {
  /**
   * Credits displayed for this source. Accepts a string, an array of strings, or a function.
   * Changes update the source.
   */
  readonly wolAttributions = input<AttributionLike>();
  /**
   * Legacy tile cache option supplied at source creation for compatibility.
   * OpenLayers 10.11.0 manages the cache on the rendering layer.
   *
   * @deprecated Configure `wolCacheSize` on a compatible layer.
   */
  readonly wolCacheSize = input<number>();
  /**
   * CORS mode for the tile images. Set a value and enable CORS on the server for canvas pixel
   * access. Read at creation.
   */
  readonly wolCrossOrigin = input<string | null>();
  /**
   * Uses linear interpolation when resampling by default. Set to `false` for nearest-neighbor
   * sampling. Read at creation.
   */
  readonly wolInterpolate = input<boolean>();
  /** Projection in which the image and its tile grid are defined. Set when creating the source. */
  readonly wolProjection = input<ProjectionLike>();
  /**
   * Ratio of actual tile image pixels to the advertised tile size. Defaults to `1`. Use `2` for
   * 512-pixel images served as 256-pixel tiles. Read at creation.
   */
  readonly wolTilePixelRatio = input<number>();
  /**
   * Maximum reprojection error in pixels. Defaults to `0.5`. A larger value trades precision for
   * faster reprojection. Read at creation.
   */
  readonly wolReprojectionErrorThreshold = input<number>();
  /**
   * Required Zoomify service root or URL template. Use `{TileGroup}`, `{z}`, `{x}`, and `{y}` for
   * a Zoomify template, or `{z}` and `{tileIndex}` for the IIP JTL extension. Read at creation.
   */
  readonly wolUrl = input.required<string>();
  /**
   * Method for calculating image pyramid levels. Use `default` for standard Zoomify or `truncated`
   * for truncated tiers. Read at creation.
   */
  readonly wolTierSizeCalculation = input<TierSizeCalculation>();
  /**
   * Required full-resolution image dimensions as `[width, height]` in pixels. Read at creation.
   */
  readonly wolSize = input.required<Size>();
  /**
   * Extent for the generated grid in source coordinates. Defaults to `[0, -height, width, 0]`. To
   * put the image in the first quadrant, supply `[0, 0, width, height]`. Read at creation.
   */
  readonly wolExtent = input<Extent>();
  /**
   * Tile fade-in duration in milliseconds. Set to `0` to disable the transition. Read at creation.
   */
  readonly wolTransition = input<number>();
  /** Tile size in pixels at every pyramid level. Defaults to `256`. Read at creation. */
  readonly wolTileSize = input<number>();
  /**
   * Selects the tile level between available resolutions. Positive favors coarser tiles, negative
   * favors finer tiles, and `0` (the default) selects the nearest. A function can choose the
   * direction. Read at creation.
   */
  readonly wolZDirection = input<number | NearestDirectionFunction>();
  /**
   * Observable OpenLayers properties to set on the source. New values update the supplied keys.
   * Omitted keys keep their current values.
   */
  readonly wolProperties = input<WolProperties>();

  /** Emits the source's `change` event when its revision increases. */
  readonly wolChange = output<BaseEvent>();
  /** Forwards the native `error` event emitted by the source. */
  readonly wolError = output<BaseEvent>();
  /**
   * Emits when an observable source property changes. The event provides the property key and its
   * previous value.
   */
  readonly wolPropertyChange = output<ObjectEvent>();
  /**
   * Emits when a tile finishes loading successfully.
   * The event carries the tile.
   */
  readonly wolTileLoadEnd = output<TileSourceEvent>();
  /** Emits when a tile fails to load. The event carries the failed tile. */
  readonly wolTileLoadError = output<TileSourceEvent>();
  /** Emits when a tile begins loading. The event carries the tile. */
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
   * Returns the OpenLayers Zoomify instance.
   *
   * @returns The source after rendering, or `undefined` before creation and after destruction.
   */
  getInstance(): Zoomify | undefined {
    return this.instance;
  }
}
