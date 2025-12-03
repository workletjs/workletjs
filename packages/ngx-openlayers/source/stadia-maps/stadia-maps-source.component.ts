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
import { DisposeRef, useTileSourceHostRef } from '@workletjs/ngx-openlayers/source/tile';
import { NearestDirectionFunction } from 'ol/array';
import { EventsKey } from 'ol/events';
import { ObjectEvent } from 'ol/Object';
import { unByKey } from 'ol/Observable';
import { LoadFunction } from 'ol/Tile';
import { AttributionLike } from 'ol/source/Source';
import { TileSourceEvent } from 'ol/source/Tile';
import BaseEvent from 'ol/events/Event';
import StadiaMaps from 'ol/source/StadiaMaps';

@Component({
  selector: 'wol-stadia-maps-source',
  exportAs: 'wolStadiaMapsSource',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolStadiaMapsSourceComponent implements OnChanges {
  readonly wolAttributions = input<AttributionLike>();
  readonly wolCacheSize = input<number>();
  readonly wolInterpolate = input<boolean>();

  /**
   * Layer name.
   * Valid values: `alidade_smooth`, `alidade_smooth_dark`, `outdoors`, `stamen_terrain`,
   * `stamen_terrain_background`, `stamen_terrain_labels`, `stamen_terrain_lines`, `stamen_toner_background`,
   * `stamen_toner`, `stamen_toner_labels`, `stamen_toner_lines`, `stamen_toner_lite`, `stamen_watercolor`,
   * and `osm_bright`.
   */
  readonly wolLayer = input.required<string>();
  readonly wolMinZoom = input<number>();
  readonly wolMaxZoom = input<number>();
  readonly wolReprojectionErrorThreshold = input<number>();
  readonly wolTileLoadFunction = input<LoadFunction>();
  readonly wolTransition = input<number>();
  readonly wolUrl = input<string>();
  readonly wolWrapX = input<boolean>();
  readonly wolZDirection = input<number | NearestDirectionFunction>();
  readonly wolApiKey = input<string>();
  readonly wolRetina = input<boolean>();
  readonly wolProperties = input<WolProperties>();

  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
  readonly wolPropertyChange = output<ObjectEvent>();
  readonly wolTileLoadEnd = output<TileSourceEvent>();
  readonly wolTileLoadError = output<TileSourceEvent>();
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
   * Get the OpenLayers StadiaMaps instance.
   * @returns The OpenLayers StadiaMaps instance or undefined if not yet created.
   */
  getInstance(): StadiaMaps | undefined {
    return this.instance;
  }
}
