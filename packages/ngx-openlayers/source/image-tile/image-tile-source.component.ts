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
import { CrossOriginAttribute } from 'ol/source/DataTile';
import { AttributionLike, State } from 'ol/source/Source';
import { TileSourceEvent } from 'ol/source/Tile';
import { TileGrid } from 'ol/tilegrid';
import { EventsKey } from 'ol/events';
import { unByKey } from 'ol/Observable';
import BaseEvent from 'ol/events/Event';
import ImageTileSource, { Loader, UrlLike } from 'ol/source/ImageTile';

@Component({
  selector: 'wol-image-tile-source',
  imports: [],
  template: `<ng-content />`,
  styles: ``,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolImageTileSourceComponent implements OnChanges {
  readonly wolUrl = input<UrlLike>();
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
  readonly wolInterpolate = input<boolean>();
  readonly wolCrossOrigin = input<CrossOriginAttribute>();
  readonly wolZDirection = input<number | NearestDirectionFunction>();
  readonly wolProperties = input<WolProperties>();

  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
  readonly wolPropertyChange = output<ObjectEvent>();
  readonly wolTileLoadEnd = output<TileSourceEvent>();
  readonly wolTileLoadError = output<TileSourceEvent>();
  readonly wolTileLoadStart = output<TileSourceEvent>();

  private instance?: ImageTileSource;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useTileSourceHostRef<ImageTileSource>('ImageTile');
    const eventsKey: Record<string, EventsKey> = {};

    let disposeRef: DisposeRef;

    afterNextRender(() => {
      const imageTileSource = new ImageTileSource({
        url: this.wolUrl(),
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
        interpolate: this.wolInterpolate(),
        crossOrigin: this.wolCrossOrigin(),
        zDirection: this.wolZDirection(),
      });

      if (!this.wolProperties()) {
        imageTileSource.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKey['change'] = imageTileSource.on('change', (event) => this.wolChange.emit(event));

      eventsKey['error'] = imageTileSource.on('error', (event) => this.wolError.emit(event));

      eventsKey['propertychange'] = imageTileSource.on('propertychange', (event) =>
        this.wolPropertyChange.emit(event),
      );

      eventsKey['tileloadend'] = imageTileSource.on('tileloadend', (event) =>
        this.wolTileLoadEnd.emit(event),
      );

      eventsKey['tileloaderror'] = imageTileSource.on('tileloaderror', (event) =>
        this.wolTileLoadError.emit(event),
      );

      eventsKey['tileloadstart'] = imageTileSource.on('tileloadstart', (event) =>
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
        disposeRef = hostRef.setSource(imageTileSource);
      });

      this.instance = imageTileSource;
    });

    destroyRef.onDestroy(() => {
      if (this.instance) {
        unByKey(Object.values(eventsKey));
        disposeRef && disposeRef();
        this.instance = undefined;
      }
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
          this.instance.setProperties(change.currentValue ?? {}, false);
          break;
        case 'wolProjection':
        case 'wolTileGrid':
          if (projection && tileGrid) {
            this.instance.setTileGridForProjection(projection, tileGrid);
          }
          break;
        case 'wolUrl':
          this.instance.setUrl(change.currentValue);
          break;
      }
    }
  }

  /**
   * Get the underlying OpenLayers instance.
   * @returns The OpenLayers ImageTileSource instance or undefined if not yet created.
   */
  getInstance(): ImageTileSource | undefined {
    return this.instance;
  }
}
