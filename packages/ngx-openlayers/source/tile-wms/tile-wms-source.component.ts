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

import ImageTile from 'ol/ImageTile';
import { ObjectEvent } from 'ol/Object';
import { unByKey } from 'ol/Observable';
import { LoadFunction } from 'ol/Tile';
import { NearestDirectionFunction } from 'ol/array';
import { EventsKey } from 'ol/events';
import BaseEvent from 'ol/events/Event';
import { ProjectionLike } from 'ol/proj';
import { AttributionLike } from 'ol/source/Source';
import { TileSourceEvent } from 'ol/source/Tile';
import TileWMS from 'ol/source/TileWMS';
import { ServerType } from 'ol/source/wms';
import { TileGrid } from 'ol/tilegrid';

import { WolProperties, WolSafeAny } from '@workletjs/ngx-openlayers/core/types';
import { DisposeRef, useTileSourceHostRef } from '@workletjs/ngx-openlayers/source/tile';

@Component({
  selector: 'wol-tile-wms-source',
  exportAs: 'wolTileWMSSource',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolTileWMSSourceComponent implements OnChanges {
  readonly wolAttributions = input<AttributionLike>();
  readonly wolAtrributionCollapsible = input<boolean>();
  readonly wolCacheSize = input<number>();
  readonly wolCrossOrigin = input<string | null>();
  readonly wolInterpolate = input<boolean>();
  readonly wolParams = input.required<{ [x: string]: WolSafeAny }>();
  readonly wolGutter = input<number>();
  readonly wolHidpi = input<boolean>();
  readonly wolProjection = input<ProjectionLike>();
  readonly wolReprojectionErrorThreshold = input<number>();
  readonly wolTileClass = input<typeof ImageTile>();
  readonly wolTileGrid = input<TileGrid>();
  readonly wolServerType = input<ServerType>();
  readonly wolTileLoadFunction = input<LoadFunction>();
  readonly wolUrl = input<string>();
  readonly wolUrls = input<string[]>();
  readonly wolWrapX = input<boolean>();
  readonly wolTransition = input<number>();
  readonly wolZDirection = input<number | NearestDirectionFunction>();
  readonly wolProperties = input<WolProperties>();

  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
  readonly wolPropertyChange = output<ObjectEvent>();
  readonly wolTileLoadEnd = output<TileSourceEvent>();
  readonly wolTileLoadError = output<TileSourceEvent>();
  readonly wolTileLoadStart = output<TileSourceEvent>();

  private instance?: TileWMS;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useTileSourceHostRef<TileWMS>('TileWMS');
    const eventsKey: Record<string, EventsKey> = {};

    let disposeRef: DisposeRef;

    afterNextRender(() => {
      const tileWMS = new TileWMS({
        attributions: this.wolAttributions(),
        attributionsCollapsible: this.wolAtrributionCollapsible(),
        cacheSize: this.wolCacheSize(),
        crossOrigin: this.wolCrossOrigin(),
        interpolate: this.wolInterpolate(),
        params: this.wolParams(),
        gutter: this.wolGutter(),
        hidpi: this.wolHidpi(),
        projection: this.wolProjection(),
        reprojectionErrorThreshold: this.wolReprojectionErrorThreshold(),
        tileClass: this.wolTileClass(),
        tileGrid: this.wolTileGrid(),
        serverType: this.wolServerType(),
        tileLoadFunction: this.wolTileLoadFunction(),
        url: this.wolUrl(),
        urls: this.wolUrls(),
        wrapX: this.wolWrapX(),
        transition: this.wolTransition(),
        zDirection: this.wolZDirection(),
      });

      if (this.wolProperties()) {
        tileWMS.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKey['change'] = tileWMS.on('change', (evt) => this.wolChange.emit(evt));

      eventsKey['error'] = tileWMS.on('error', (evt) => this.wolError.emit(evt));

      eventsKey['propertychange'] = tileWMS.on('propertychange', (evt) =>
        this.wolPropertyChange.emit(evt),
      );

      eventsKey['tileloadend'] = tileWMS.on('tileloadend', (evt) => this.wolTileLoadEnd.emit(evt));

      eventsKey['tileloaderror'] = tileWMS.on('tileloaderror', (evt) =>
        this.wolTileLoadError.emit(evt),
      );

      eventsKey['tileloadstart'] = tileWMS.on('tileloadstart', (evt) =>
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
        disposeRef = hostRef.setSource(tileWMS);
      });

      this.instance = tileWMS;
    });

    destroyRef.onDestroy(() => {
      if (disposeRef) {
        disposeRef();
      }

      unByKey(Object.values(eventsKey));

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
        case 'wolParams':
          this.instance.setParams(change.currentValue);
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
        case 'wolUrls':
          this.instance.setUrls(change.currentValue);
          break;
      }
    }
  }

  /**
   * Get the underlying OpenLayers TileWMS instance.
   * @returns The TileWMS instance
   */
  getInstance(): TileWMS | undefined {
    return this.instance;
  }
}
