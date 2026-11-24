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
import { NearestDirectionFunction } from 'ol/array';
import { EventsKey } from 'ol/events';
import BaseEvent from 'ol/events/Event';
import { AttributionLike } from 'ol/source/Source';
import StadiaMaps from 'ol/source/StadiaMaps';
import { TileSourceEvent } from 'ol/source/Tile';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { DisposeRef, useTileSourceHostRef } from '@workletjs/ngx-openlayers/source/tile';

/**
 * Provides raster basemap tiles from Stadia Maps, with a selected layer and optional retina tiles.
 *
 * @see [OpenLayers StadiaMaps](https://openlayers.org/en/latest/apidoc/module-ol_source_StadiaMaps-StadiaMaps.html)
 */
@Component({
  selector: 'wol-stadia-maps-source',
  exportAs: 'wolStadiaMapsSource',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolStadiaMapsSourceComponent implements OnChanges {
  /**
   * Credits displayed for this source. Stadia Maps supplies the default credits for the selected
   * layer. Changes update the source.
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
   * Uses linear interpolation when resampling by default. Set to `false` for nearest-neighbor
   * sampling. Read at creation.
   */
  readonly wolInterpolate = input<boolean>();

  /**
   * Required Stadia Maps layer identifier. Available names include `alidade_smooth`,
   * `alidade_smooth_dark`, `outdoors`, `osm_bright`, `stamen_terrain`,
   * `stamen_terrain_background`, `stamen_terrain_labels`, `stamen_terrain_lines`, `stamen_toner`,
   * `stamen_toner_background`, `stamen_toner_labels`, `stamen_toner_lines`, `stamen_toner_lite`,
   * and `stamen_watercolor`. Read at creation.
   */
  readonly wolLayer = input.required<string>();
  /**
   * Lowest tile zoom level to request. When omitted, OpenLayers uses its preset for the chosen
   * layer. Read at creation.
   */
  readonly wolMinZoom = input<number>();
  /**
   * Highest tile zoom level to request. When omitted, OpenLayers uses its preset for the chosen
   * layer. Read at creation.
   */
  readonly wolMaxZoom = input<number>();
  /**
   * Maximum reprojection error in pixels. Defaults to `0.5`. A larger value trades precision for
   * faster reprojection. Read at creation.
   */
  readonly wolReprojectionErrorThreshold = input<number>();
  /**
   * Callback that receives an image tile and its URL. The default assigns the URL to the tile
   * image. Changes update the callback.
   */
  readonly wolTileLoadFunction = input<LoadFunction>();
  /**
   * Tile fade-in duration in milliseconds. Defaults to `250`. Set to `0` to disable it. Read at
   * creation.
   */
  readonly wolTransition = input<number>();
  /**
   * Custom tile URL template with `{z}`, `{x}`, and `{y}` or `{-y}`. When omitted, the initial URL
   * is generated from `wolLayer`, `wolRetina`, and `wolApiKey`. Changes update the URL template.
   */
  readonly wolUrl = input<string>();
  /**
   * Whether the source wraps horizontally across world boundaries. Defaults to `true`. Set when
   * creating the source.
   */
  readonly wolWrapX = input<boolean>();
  /**
   * Selects the tile level between available resolutions. Positive favors coarser tiles, negative
   * favors finer tiles, and `0` (the default) selects the nearest. A function can choose the
   * direction. Read at creation.
   */
  readonly wolZDirection = input<number | NearestDirectionFunction>();
  /**
   * API key appended to the generated Stadia Maps URL. Supply any required authentication yourself
   * when providing a custom `wolUrl`. Read at creation.
   */
  readonly wolApiKey = input<string>();
  /**
   * Requests double-resolution tiles for layers that provide them. Stamen Watercolor uses
   * standard-resolution tiles. Read at creation.
   */
  readonly wolRetina = input<boolean>();
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

  private instance?: StadiaMaps;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useTileSourceHostRef<StadiaMaps>('StadiaMaps');
    const eventsKey: Record<string, EventsKey> = {};

    let disposeRef: DisposeRef;

    afterNextRender(() => {
      const stadiaMaps = new StadiaMaps({
        cacheSize: this.wolCacheSize(),
        interpolate: this.wolInterpolate(),
        layer: this.wolLayer(),
        minZoom: this.wolMinZoom(),
        maxZoom: this.wolMaxZoom(),
        reprojectionErrorThreshold: this.wolReprojectionErrorThreshold(),
        tileLoadFunction: this.wolTileLoadFunction(),
        transition: this.wolTransition(),
        url: this.wolUrl(),
        wrapX: this.wolWrapX(),
        zDirection: this.wolZDirection(),
        apiKey: this.wolApiKey(),
        retina: this.wolRetina(),
      });

      if (this.wolAttributions()) {
        stadiaMaps.setAttributions(this.wolAttributions());
      }

      if (this.wolProperties()) {
        stadiaMaps.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKey['change'] = stadiaMaps.on('change', (evt) => this.wolChange.emit(evt));

      eventsKey['error'] = stadiaMaps.on('error', (evt) => this.wolError.emit(evt));

      eventsKey['propertychange'] = stadiaMaps.on('propertychange', (evt) =>
        this.wolPropertyChange.emit(evt),
      );

      eventsKey['tileloadend'] = stadiaMaps.on('tileloadend', (evt) =>
        this.wolTileLoadEnd.emit(evt),
      );

      eventsKey['tileloaderror'] = stadiaMaps.on('tileloaderror', (evt) =>
        this.wolTileLoadError.emit(evt),
      );

      eventsKey['tileloadstart'] = stadiaMaps.on('tileloadstart', (evt) =>
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
        disposeRef = hostRef.setSource(stadiaMaps);
      });

      this.instance = stadiaMaps;
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
   * Returns the OpenLayers StadiaMaps instance.
   *
   * @returns The source after rendering, or `undefined` before creation and after destruction.
   */
  getInstance(): StadiaMaps | undefined {
    return this.instance;
  }
}
