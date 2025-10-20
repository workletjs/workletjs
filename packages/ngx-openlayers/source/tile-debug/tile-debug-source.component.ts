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
import { TileGrid } from 'ol/tilegrid';
import { EventsKey } from 'ol/events';
import { unByKey } from 'ol/Observable';
import BaseEvent from 'ol/events/Event';
import TileDebug from 'ol/source/TileDebug';
import TileSource, { TileSourceEvent } from 'ol/source/Tile';

@Component({
  selector: 'wol-tile-debug-source',
  exportAs: 'wolTileDebugSource',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolTileDebugSourceComponent implements OnChanges {
  readonly wolProjection = input<ProjectionLike>();
  readonly wolTileGrid = input<TileGrid>();
  readonly wolWrapX = input<boolean>();
  readonly wolZDirection = input<number | NearestDirectionFunction>();
  readonly wolSource = input<TileSource>();
  readonly wolTemplate = input<string>();
  readonly wolColor = input<string>();
  readonly wolProperties = input<WolProperties>();

  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
  readonly wolPropertyChange = output<ObjectEvent>();
  readonly wolTileLoadEnd = output<TileSourceEvent>();
  readonly wolTileLoadError = output<TileSourceEvent>();
  readonly wolTileLoadStart = output<TileSourceEvent>();

  private instance?: TileDebug;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useTileSourceHostRef<TileDebug>('TileDebugSource');
    const eventsKey: Record<string, EventsKey> = {};

    let disposeRef: DisposeRef;

    afterNextRender(() => {
      const tileDebug = new TileDebug({
        projection: this.wolProjection(),
        tileGrid: this.wolTileGrid(),
        wrapX: this.wolWrapX(),
        zDirection: this.wolZDirection(),
        source: this.wolSource(),
        template: this.wolTemplate(),
        color: this.wolColor(),
      });

      if (this.wolProperties()) {
        tileDebug.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKey['change'] = tileDebug.on('change', (evt) => this.wolChange.emit(evt));

      eventsKey['error'] = tileDebug.on('error', (evt) => this.wolError.emit(evt));

      eventsKey['propertychange'] = tileDebug.on('propertychange', (evt) =>
        this.wolPropertyChange.emit(evt),
      );

      eventsKey['tileloadend'] = tileDebug.on('tileloadend', (evt) =>
        this.wolTileLoadEnd.emit(evt),
      );

      eventsKey['tileloaderror'] = tileDebug.on('tileloaderror', (evt) =>
        this.wolTileLoadError.emit(evt),
      );

      eventsKey['tileloadstart'] = tileDebug.on('tileloadstart', (evt) =>
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
        disposeRef = hostRef.setSource(tileDebug);
      });

      this.instance = tileDebug;
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

    if (changes['wolProperties']) {
      this.instance.setProperties(changes['wolProperties'].currentValue ?? {});
    }

    if (changes['wolProjection'] || changes['wolTileGrid']) {
      const projection = this.wolProjection();
      const tileGrid = this.wolTileGrid();

      if (projection && tileGrid) {
        this.instance.setTileGridForProjection(projection, tileGrid);
      }
    }
  }

  /**
   * Get the underlying OpenLayers instance.
   * @returns The TileDebug source instance or undefined if not yet created.
   */
  getInstance(): TileDebug | undefined {
    return this.instance;
  }
}
