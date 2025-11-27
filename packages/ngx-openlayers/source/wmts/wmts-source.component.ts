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
import { WolProperties, WolSafeAny } from '@workletjs/ngx-openlayers/core/types';
import { DisposeRef, useTileSourceHostRef } from '@workletjs/ngx-openlayers/source/tile';
import { NearestDirectionFunction } from 'ol/array';
import { EventsKey } from 'ol/events';
import { ObjectEvent } from 'ol/Object';
import { unByKey } from 'ol/Observable';
import { ProjectionLike } from 'ol/proj';
import { AttributionLike } from 'ol/source/Source';
import { TileSourceEvent } from 'ol/source/Tile';
import { LoadFunction } from 'ol/Tile';
import ImageTile from 'ol/ImageTile';
import BaseEvent from 'ol/events/Event';
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import WMTS, { RequestEncoding } from 'ol/source/WMTS';

@Component({
  selector: 'wol-wmts-source',
  exportAs: 'wolWMTSSource',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolWMTSSourceComponent implements OnChanges {
  readonly wolAttributions = input<AttributionLike>();
  readonly wolAttributionsCollapsible = input<boolean>();
  readonly wolCacheSize = input<number>();
  readonly wolCrossOrigin = input<string | null>();
  readonly wolInterpolate = input<boolean>();
  readonly wolTileGrid = input.required<WMTSTileGrid>();
  readonly wolProjection = input<ProjectionLike>();
  readonly wolReprojectionErrorThreshold = input<number>();
  readonly wolRequestEncoding = input<RequestEncoding>();
  readonly wolLayer = input.required<string>();
  readonly wolStyle = input.required<string>();
  readonly wolTileClass = input<typeof ImageTile>();
  readonly wolTilePixelRatio = input<number>();
  readonly wolFormat = input<string>();
  readonly wolVersion = input<string>();
  readonly wolMatrixSet = input.required<string>();
  readonly wolDimensions = input<{ [key: string]: WolSafeAny }>();
  readonly wolUrl = input<string>();
  readonly wolTileLoadFunction = input<LoadFunction>();
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

  private instance?: WMTS;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useTileSourceHostRef<WMTS>('WMTS');
    const eventsKey: Record<string, EventsKey> = {};

    let disposeRef: DisposeRef;

    afterNextRender(() => {
      const wmts = new WMTS({
        attributions: this.wolAttributions(),
        attributionsCollapsible: this.wolAttributionsCollapsible(),
        cacheSize: this.wolCacheSize(),
        crossOrigin: this.wolCrossOrigin(),
        interpolate: this.wolInterpolate(),
        tileGrid: this.wolTileGrid(),
        projection: this.wolProjection(),
        reprojectionErrorThreshold: this.wolReprojectionErrorThreshold(),
        requestEncoding: this.wolRequestEncoding(),
        layer: this.wolLayer(),
        style: this.wolStyle(),
        tileClass: this.wolTileClass(),
        tilePixelRatio: this.wolTilePixelRatio(),
        format: this.wolFormat(),
        version: this.wolVersion(),
        matrixSet: this.wolMatrixSet(),
        dimensions: this.wolDimensions(),
        url: this.wolUrl(),
        tileLoadFunction: this.wolTileLoadFunction(),
        urls: this.wolUrls(),
        wrapX: this.wolWrapX(),
        transition: this.wolTransition(),
        zDirection: this.wolZDirection(),
      });

      if (this.wolProperties()) {
        wmts.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKey['change'] = wmts.on('change', (event) => this.wolChange.emit(event));

      eventsKey['error'] = wmts.on('error', (event) => this.wolError.emit(event));

      eventsKey['propertychange'] = wmts.on('propertychange', (event) =>
        this.wolPropertyChange.emit(event),
      );

      eventsKey['tileloadend'] = wmts.on('tileloadend', (event) => this.wolTileLoadEnd.emit(event));

      eventsKey['tileloaderror'] = wmts.on('tileloaderror', (event) =>
        this.wolTileLoadError.emit(event),
      );

      eventsKey['tileloadstart'] = wmts.on('tileloadstart', (event) =>
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
        disposeRef = hostRef.setSource(wmts);
      });

      this.instance = wmts;
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
        case 'wolLoadFunction':
          this.instance.setTileLoadFunction(change.currentValue);
          break;
        case 'wolUrl':
          this.instance.setUrl(change.currentValue);
          break;
        case 'wolUrls':
          this.instance.setUrls(change.currentValue);
          break;
        case 'wolDimensions':
          this.instance.updateDimensions(change.currentValue);
          break;
        case 'wolTileGrid':
        case 'wolProjection':
          if (tileGrid && projection) {
            this.instance.setTileGridForProjection(projection, tileGrid);
          }
          break;
      }
    }
  }

  /**
   * Get the OpenLayers WMTS instance.
   * @returns The OpenLayers WMTS instance or undefined if not yet created.
   */
  getInstance(): WMTS | undefined {
    return this.instance;
  }
}
