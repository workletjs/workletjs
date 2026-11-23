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
import { AttributionLike } from 'ol/source/Source';
import { Config } from 'ol/source/TileJSON';
import UTFGrid from 'ol/source/UTFGrid';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { DisposeRef, useTileSourceHostRef } from '@workletjs/ngx-openlayers/source/tile';

/**
 * Loads UTFGrid metadata tiles for looking up feature information at a map coordinate.
 *
 * @see [OpenLayers UTFGrid](https://openlayers.org/en/latest/apidoc/module-ol_source_UTFGrid-UTFGrid.html)
 */
@Component({
  selector: 'wol-utf-grid-source',
  exportAs: 'wolUTFGridSource',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolUTFGridSourceComponent implements OnChanges {
  /**
   * Credits displayed for this source. The TileJSON configuration can supply default attribution.
   * Changes update the source.
   */
  readonly wolAttributions = input<AttributionLike>();
  /**
   * Loads UTFGrid tiles for visible areas by default. Set to `false` for on-demand loading and
   * pass `true` as the request argument to `forDataAtCoordinateAndResolution()`. Read at creation.
   */
  readonly wolPreemptive = input<boolean>();
  /**
   * Uses JSONP to request remote TileJSON when `true`. Defaults to `false`, which uses an
   * XMLHttpRequest. Read at creation.
   */
  readonly wolJsonp = input<boolean>();
  /**
   * Inline TileJSON configuration for UTFGrid. Required if `wolUrl` is omitted. Read at creation.
   */
  readonly wolTileJSON = input<Config>();
  /**
   * Endpoint for the UTFGrid TileJSON document. Takes precedence over `wolTileJSON` when supplied.
   * Read at creation.
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
   * Observable OpenLayers properties to set on the source. New values update the supplied keys.
   * Omitted keys keep their current values.
   */
  readonly wolProperties = input<WolProperties>();

  /**
   * Emits when the source revision increases. Check the source state for metadata load completion
   * or failure.
   */
  readonly wolChange = output<BaseEvent>();
  /** Forwards the native `error` event emitted by the source. */
  readonly wolError = output<BaseEvent>();
  /**
   * Emits when an observable source property changes. The event provides the property key and its
   * previous value.
   */
  readonly wolPropertyChange = output<ObjectEvent>();

  private instance?: UTFGrid;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useTileSourceHostRef<UTFGrid>('UTFGridSource');
    const eventsKey: Record<string, EventsKey> = {};

    let disposeRef: DisposeRef;

    afterNextRender(() => {
      const utfGrid = new UTFGrid({
        preemptive: this.wolPreemptive(),
        jsonp: this.wolJsonp(),
        tileJSON: this.wolTileJSON(),
        url: this.wolUrl(),
        wrapX: this.wolWrapX(),
        zDirection: this.wolZDirection(),
      });

      if (this.wolAttributions()) {
        utfGrid.setAttributions(this.wolAttributions());
      }

      if (this.wolProperties()) {
        utfGrid.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKey['change'] = utfGrid.on('change', (event) => this.wolChange.emit(event));

      eventsKey['error'] = utfGrid.on('error', (event) => this.wolError.emit(event));

      eventsKey['propertychange'] = utfGrid.on('propertychange', (event) =>
        this.wolPropertyChange.emit(event),
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
        disposeRef = hostRef.setSource(utfGrid);
      });

      this.instance = utfGrid;
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
        case 'wolProperties':
          this.instance.setProperties(change.currentValue ?? {});
          break;
      }
    }
  }

  /**
   * Returns the OpenLayers UTFGrid instance.
   *
   * @returns The source after rendering, or `undefined` before creation and after destruction.
   */
  getInstance(): UTFGrid | undefined {
    return this.instance;
  }
}
