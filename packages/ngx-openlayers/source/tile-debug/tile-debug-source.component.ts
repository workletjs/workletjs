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
import { ProjectionLike } from 'ol/proj';
import TileSource, { TileSourceEvent } from 'ol/source/Tile';
import TileDebug from 'ol/source/TileDebug';
import { TileGrid } from 'ol/tilegrid';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { DisposeRef, useTileSourceHostRef } from '@workletjs/ngx-openlayers/source/tile';

/**
 * Draws a grid with tile coordinate labels for checking how a tile source aligns with the map.
 *
 * @see [OpenLayers TileDebug](https://openlayers.org/en/latest/apidoc/module-ol_source_TileDebug-TileDebug.html)
 */
@Component({
  selector: 'wol-tile-debug-source',
  exportAs: 'wolTileDebugSource',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolTileDebugSourceComponent implements OnChanges {
  /**
   * Projection of the debug grid. Defaults to the reference source's projection, or `EPSG:3857`
   * without a reference source. After creation, changing this input with `wolTileGrid` can
   * register a grid for that projection.
   */
  readonly wolProjection = input<ProjectionLike>();
  /**
   * Debug tile grid. When omitted, it is copied from `wolSource` if supplied. After creation, a
   * change with `wolProjection` registers the grid when that projection has no registered grid
   * yet.
   */
  readonly wolTileGrid = input<TileGrid>();
  /**
   * Whether to wrap debug tiles horizontally. Inherits the reference source's setting when
   * supplied and otherwise defaults to `true`. Read at creation.
   */
  readonly wolWrapX = input<boolean>();
  /**
   * Resolution selection between tile levels. The default comes from `wolSource`, or is `0` for
   * the closest resolution. Use `1` to match a default vector tile source. Set when creating the
   * source.
   */
  readonly wolZDirection = input<number | NearestDirectionFunction>();
  /**
   * Source whose grid, projection, wrap, and zoom selection settings the debug tiles use. Explicit
   * input values take precedence. Read at creation.
   */
  readonly wolSource = input<TileSource>();
  /**
   * Text drawn on each tile. Supports `{z}`, `{x}`, `{y}`, and `{-y}` placeholders and defaults to
   * `z:{z} x:{x} y:{y}`. Read at creation.
   */
  readonly wolTemplate = input<string>();
  /** CSS color for tile borders and labels. Defaults to `grey`. Set when creating the source. */
  readonly wolColor = input<string>();
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
   * Emits when tile loading finishes, including when a tile that is no longer needed is canceled.
   * The event carries the tile.
   */
  readonly wolTileLoadEnd = output<TileSourceEvent>();
  /** Emits when a tile fails to load. The event carries the failed tile. */
  readonly wolTileLoadError = output<TileSourceEvent>();
  /** Emits when a tile begins loading. The event carries the tile. */
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
   * Returns the OpenLayers TileDebug instance.
   *
   * @returns The source after rendering, or `undefined` before creation and after destruction.
   */
  getInstance(): TileDebug | undefined {
    return this.instance;
  }
}
