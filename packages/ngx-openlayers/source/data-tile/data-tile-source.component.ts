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
import { ObjectEvent } from 'ol/Object';
import { ProjectionLike } from 'ol/proj';
import { Size } from 'ol/size';
import { AttributionLike, State } from 'ol/source/Source';
import { TileSourceEvent } from 'ol/source/Tile';
import { TileGrid } from 'ol/tilegrid';
import { EventsKey } from 'ol/events';
import { unByKey } from 'ol/Observable';
import BaseEvent from 'ol/events/Event';
import DataTileSource, { CrossOriginAttribute, Loader } from 'ol/source/DataTile';

@Component({
  selector: 'wol-data-tile-source',
  imports: [],
  template: `<ng-content />`,
  styles: ``,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolDataTileSourceComponent implements OnChanges {
  readonly wolLoader = input<Loader>();
  readonly wolAttributions = input<AttributionLike>();
  readonly wolAttributionsCollapsible = input<boolean>();
  readonly wolMaxZoom = input<number>();
  readonly wolMinZoom = input<number>();
  readonly wolTileSize = input<number | Size>();
  readonly wolGutter = input<number>();
  readonly wolMaxResolution = input<number>();
  readonly wolProjection = input<ProjectionLike>();
  readonly wolTileGrid = input<TileGrid>();
  readonly wolState = input<State>();
  readonly wolWrapX = input<boolean>();
  readonly wolTransition = input<number>();
  readonly wolBandCount = input<number>();
  readonly wolInterpolate = input<boolean>();
  readonly wolCrop = input<CrossOriginAttribute>();
  readonly wolKey = input<string>();
  readonly wolZDirection = input<number | NearestDirectionFunction>();
  readonly wolProperties = input<WolProperties>();

  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
  readonly wolPropertychange = output<ObjectEvent>();
  readonly wolTileLoadEnd = output<TileSourceEvent>();
  readonly wolTileLoadError = output<TileSourceEvent>();
  readonly wolTileLoadStart = output<TileSourceEvent>();

  private instance?: DataTileSource;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useTileSourceHostRef<DataTileSource>('DataTileSource');
    const eventsKey: Record<string, EventsKey> = {};

    let disposeRef: DisposeRef;

    afterNextRender(() => {
      const dataTileSource = new DataTileSource({
        loader: this.wolLoader(),
        attributions: this.wolAttributions(),
        attributionsCollapsible: this.wolAttributionsCollapsible(),
        maxZoom: this.wolMaxZoom(),
        minZoom: this.wolMinZoom(),
        tileSize: this.wolTileSize(),
        gutter: this.wolGutter(),
        maxResolution: this.wolMaxResolution(),
        projection: this.wolProjection(),
        tileGrid: this.wolTileGrid(),
        state: this.wolState(),
        wrapX: this.wolWrapX(),
        transition: this.wolTransition(),
        bandCount: this.wolBandCount(),
        interpolate: this.wolInterpolate(),
        crossOrigin: this.wolCrop(),
        key: this.wolKey(),
        zDirection: this.wolZDirection(),
      });

      if (!this.wolProperties()) {
        dataTileSource.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKey['change'] = dataTileSource.on('change', (event) => this.wolChange.emit(event));

      eventsKey['error'] = dataTileSource.on('error', (event) => this.wolError.emit(event));

      eventsKey['propertychange'] = dataTileSource.on('propertychange', (event) =>
        this.wolPropertychange.emit(event),
      );

      eventsKey['tileloadend'] = dataTileSource.on('tileloadend', (event) =>
        this.wolTileLoadEnd.emit(event),
      );

      eventsKey['tileloaderror'] = dataTileSource.on('tileloaderror', (event) =>
        this.wolTileLoadError.emit(event),
      );

      eventsKey['tileloadstart'] = dataTileSource.on('tileloadstart', (event) =>
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
        disposeRef = hostRef.setSource(dataTileSource);
      });

      this.instance = dataTileSource;
    });

    destroyRef.onDestroy(() => {
      unByKey(Object.values(eventsKey));
      disposeRef && disposeRef();
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

    const projection = this.wolProjection();
    const tileGrid = this.wolTileGrid();

    for (const [key, change] of Object.entries(changes)) {
      switch (key) {
        case 'wolAttributions':
          this.instance.setAttributions(change.currentValue);
          break;
        case 'wolProperties':
          this.instance.setProperties(change.currentValue ?? {});
          break;
        case 'wolProjection':
        case 'wolTileGrid':
          if (projection && tileGrid) {
            this.instance.setTileGridForProjection(projection, tileGrid);
          }
          break;
      }
    }
  }

  /**
   * Get the underlying ol DataTileSource instance.
   * @returns The ol DataTileSource instance.
   */
  getInstance(): DataTileSource | undefined {
    return this.instance;
  }
}
