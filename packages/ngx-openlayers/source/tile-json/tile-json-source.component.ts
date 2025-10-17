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
import { Size } from 'ol/size';
import { AttributionLike } from 'ol/source/Source';
import { TileSourceEvent } from 'ol/source/Tile';
import { LoadFunction } from 'ol/Tile';
import { EventsKey } from 'ol/events';
import { unByKey } from 'ol/Observable';
import BaseEvent from 'ol/events/Event';
import TileJSON, { Config } from 'ol/source/TileJSON';

@Component({
  selector: 'wol-tile-json-source',
  imports: [],
  template: `<ng-content />`,
  styles: ``,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolTileJSONSourceComponent implements OnChanges {
  readonly wolAttributions = input<AttributionLike>();
  readonly wolCacheSize = input<number>();
  readonly wolCrossOrigin = input<null | string>();
  readonly wolInterpolate = input<boolean>();
  readonly wolJsonp = input<boolean>();
  readonly wolReprojectionErrorThreshold = input<number>();
  readonly wolTileJSON = input<Config>();
  readonly wolTileLoadFunction = input<LoadFunction>();
  readonly wolTileSize = input<number | Size>();
  readonly wolUrl = input<string>();
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

  private instance?: TileJSON;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const host = useTileSourceHostRef<TileJSON>('TileJSON');
    const eventsKey: Record<string, EventsKey> = {};

    let disposeRef: DisposeRef;

    afterNextRender(() => {
      const tileJSON = new TileJSON({
        attributions: this.wolAttributions(),
        cacheSize: this.wolCacheSize(),
        crossOrigin: this.wolCrossOrigin(),
        interpolate: this.wolInterpolate(),
        jsonp: this.wolJsonp(),
        reprojectionErrorThreshold: this.wolReprojectionErrorThreshold(),
        tileJSON: this.wolTileJSON(),
        tileLoadFunction: this.wolTileLoadFunction(),
        tileSize: this.wolTileSize(),
        url: this.wolUrl(),
        wrapX: this.wolWrapX(),
        transition: this.wolTransition(),
        zDirection: this.wolZDirection(),
      });

      if (this.wolProperties()) {
        tileJSON.setProperties(this.wolProperties() as WolProperties, true);
      }

      eventsKey['change'] = tileJSON.on('change', (evt) => this.wolChange.emit(evt));

      eventsKey['error'] = tileJSON.on('error', (evt) => this.wolError.emit(evt));

      eventsKey['propertychange'] = tileJSON.on('propertychange', (evt) =>
        this.wolPropertyChange.emit(evt),
      );

      eventsKey['tileloadend'] = tileJSON.on('tileloadend', (evt) => this.wolTileLoadEnd.emit(evt));

      eventsKey['tileloaderror'] = tileJSON.on('tileloaderror', (evt) =>
        this.wolTileLoadError.emit(evt),
      );

      eventsKey['tileloadstart'] = tileJSON.on('tileloadstart', (evt) =>
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
        disposeRef = host.setSource(tileJSON);
      });

      this.instance = tileJSON;
    });

    destroyRef.onDestroy(() => {
      unByKey(Object.values(eventsKey));
      disposeRef && disposeRef();
      this.instance = undefined;
    });
  }

  /**
   * Respond to input changes.
   * @param changes The changes object containing the changed inputs.
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
          this.instance.setProperties(change.currentValue ?? {}, false);
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
   * Get the underlying TileJSON instance.
   * @returns The TileJSON instance or undefined if not yet created.
   */
  getInstance(): TileJSON | undefined {
    return this.instance;
  }
}
