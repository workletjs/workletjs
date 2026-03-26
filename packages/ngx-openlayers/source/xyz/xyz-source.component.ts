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
import { LoadFunction, UrlFunction } from 'ol/Tile';
import { NearestDirectionFunction } from 'ol/array';
import { EventsKey } from 'ol/events';
import BaseEvent from 'ol/events/Event';
import { ProjectionLike } from 'ol/proj';
import { Size } from 'ol/size';
import { AttributionLike } from 'ol/source/Source';
import { TileSourceEvent } from 'ol/source/Tile';
import XYZ from 'ol/source/XYZ';
import { TileGrid } from 'ol/tilegrid';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { DisposeRef, useTileSourceHostRef } from '@workletjs/ngx-openlayers/source/tile';

@Component({
  selector: 'wol-xyz-source',
  exportAs: 'wolXYZSource',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolXYZSourceComponent implements OnChanges {
  readonly wolAttributions = input<AttributionLike>();
  readonly wolAttributionsCollapsible = input<boolean>();
  readonly wolCacheSize = input<number>();
  readonly wolCrossOrigin = input<string | null>();
  readonly wolInterpolate = input<boolean>();
  readonly wolProjection = input<ProjectionLike>();
  readonly wolReprojectionErrorThreshold = input<number>();
  readonly wolMaxZoom = input<number>();
  readonly wolMinZoom = input<number>();
  readonly wolMaxResolution = input<number>();
  readonly wolTileGrid = input<TileGrid>();
  readonly wolTileLoadFunction = input<LoadFunction>();
  readonly wolTilePixelRatio = input<number>();
  readonly wolTileSize = input<number | Size>();
  readonly wolGutter = input<number>();
  readonly wolTileUrlFunction = input<UrlFunction>();
  readonly wolUrl = input<string>();
  readonly wolUrls = input<string[]>();
  readonly wolWrapX = input<boolean>();
  readonly wolTransition = input<number>();
  readonly wolZDirection = input<number | NearestDirectionFunction>();
  readonly wolReferrerPolicy = input<ReferrerPolicy>();
  readonly wolProperties = input<WolProperties>();

  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
  readonly wolPropertyChange = output<ObjectEvent>();
  readonly wolTileLoadEnd = output<TileSourceEvent>();
  readonly wolTileLoadError = output<TileSourceEvent>();
  readonly wolTileLoadStart = output<TileSourceEvent>();

  private instance?: XYZ;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useTileSourceHostRef<XYZ>('XYZ');
    const eventsKey: Record<string, EventsKey> = {};

    let disposeRef: DisposeRef;

    afterNextRender(() => {
      const xyz = new XYZ({
        attributions: this.wolAttributions(),
        attributionsCollapsible: this.wolAttributionsCollapsible(),
        cacheSize: this.wolCacheSize(),
        crossOrigin: this.wolCrossOrigin(),
        interpolate: this.wolInterpolate(),
        projection: this.wolProjection(),
        reprojectionErrorThreshold: this.wolReprojectionErrorThreshold(),
        maxZoom: this.wolMaxZoom(),
        minZoom: this.wolMinZoom(),
        maxResolution: this.wolMaxResolution(),
        tileGrid: this.wolTileGrid(),
        tileLoadFunction: this.wolTileLoadFunction(),
        tilePixelRatio: this.wolTilePixelRatio(),
        tileSize: this.wolTileSize(),
        gutter: this.wolGutter(),
        tileUrlFunction: this.wolTileUrlFunction(),
        url: this.wolUrl(),
        urls: this.wolUrls(),
        referrerPolicy: this.wolReferrerPolicy(),
        wrapX: this.wolWrapX(),
        transition: this.wolTransition(),
        zDirection: this.wolZDirection(),
      });

      if (this.wolProperties()) {
        xyz.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKey['change'] = xyz.on('change', (evt) => this.wolChange.emit(evt));

      eventsKey['error'] = xyz.on('error', (evt) => this.wolError.emit(evt));

      eventsKey['propertychange'] = xyz.on('propertychange', (evt) =>
        this.wolPropertyChange.emit(evt),
      );

      eventsKey['tileloadend'] = xyz.on('tileloadend', (evt) => this.wolTileLoadEnd.emit(evt));

      eventsKey['tileloaderror'] = xyz.on('tileloaderror', (evt) =>
        this.wolTileLoadError.emit(evt),
      );

      eventsKey['tileloadstart'] = xyz.on('tileloadstart', (evt) =>
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
        disposeRef = hostRef.setSource(xyz);
      });

      this.instance = xyz;
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

    const tileGrid = this.wolTileGrid();
    const projection = this.wolProjection();

    for (const [key, change] of Object.entries(changes)) {
      switch (key) {
        case 'wolAttributions':
          this.instance.setAttributions(change.currentValue);
          break;
        case 'wolProperties':
          this.instance.setProperties(change.currentValue ?? {});
          break;
        case 'wolTileGrid':
        case 'wolProjection':
          if (tileGrid && projection) {
            this.instance.setTileGridForProjection(projection, tileGrid);
          }
          break;
        case 'wolLoadFunction':
          this.instance.setTileLoadFunction(change.currentValue);
          break;
        case 'wolUrlFunction':
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
   * Get the OpenLayers XYZ instance.
   * @returns The OpenLayers XYZ instance or undefined if not yet created.
   */
  getInstance(): XYZ | undefined {
    return this.instance;
  }
}
