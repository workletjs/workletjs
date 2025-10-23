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
import { AttributionLike } from 'ol/source/Source';
import { Size } from 'ol/size';
import { Projection } from 'ol/proj';
import { ObjectEvent } from 'ol/Object';
import { TileSourceEvent } from 'ol/source/Tile';
import { EventsKey } from 'ol/events';
import { unByKey } from 'ol/Observable';
import BaseEvent from 'ol/events/Event';
import SentinelHub, {
  AuthConfig,
  Evalscript,
  ProcessRequestInputDataItem,
} from 'ol/source/SentinelHub';

@Component({
  selector: 'wol-sentinel-hub-source',
  exportAs: 'wolSentinelHubSource',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolSentinelHubSourceComponent implements OnChanges {
  readonly wolAttributions = input<AttributionLike>();
  readonly wolAttributionCollapsible = input<boolean>();
  readonly wolAuth = input<AuthConfig | string>();
  readonly wolData = input<ProcessRequestInputDataItem[]>();
  readonly wolEvalscript = input<Evalscript | string>();
  readonly wolTileSize = input<number | Size>();
  readonly wolUrl = input<string>();
  readonly wolProjection = input<Projection>();
  readonly wolInterpolate = input<boolean>();
  readonly wolWrapX = input<boolean>();
  readonly wolTransition = input<number>();
  readonly wolProperties = input<WolProperties>();

  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
  readonly wolPropertyChange = output<ObjectEvent>();
  readonly wolTileLoadEnd = output<TileSourceEvent>();
  readonly wolTileLoadError = output<TileSourceEvent>();
  readonly wolTileLoadStart = output<TileSourceEvent>();

  private instance?: SentinelHub;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useTileSourceHostRef<SentinelHub>('SentinelHub');
    const eventsKey: Record<string, EventsKey> = {};

    let disposeRef: DisposeRef;

    afterNextRender(() => {
      const sentinelHub = new SentinelHub({
        auth: this.wolAuth(),
        data: this.wolData(),
        evalscript: this.wolEvalscript(),
        tileSize: this.wolTileSize(),
        url: this.wolUrl(),
        projection: this.wolProjection(),
        attributionsCollapsible: this.wolAttributionCollapsible(),
        interpolate: this.wolInterpolate(),
        wrapX: this.wolWrapX(),
        transition: this.wolTransition(),
      });

      if (this.wolAttributions()) {
        sentinelHub.setAttributions(this.wolAttributions());
      }

      if (this.wolProperties()) {
        sentinelHub.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKey['change'] = sentinelHub.on('change', (event) => this.wolChange.emit(event));

      eventsKey['error'] = sentinelHub.on('error', (event) => this.wolError.emit(event));

      eventsKey['propertychange'] = sentinelHub.on('propertychange', (event) =>
        this.wolPropertyChange.emit(event),
      );

      eventsKey['tileloadend'] = sentinelHub.on('tileloadend', (event) =>
        this.wolTileLoadEnd.emit(event),
      );

      eventsKey['tileloaderror'] = sentinelHub.on('tileloaderror', (event) =>
        this.wolTileLoadError.emit(event),
      );

      eventsKey['tileloadstart'] = sentinelHub.on('tileloadstart', (event) =>
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
        disposeRef = hostRef.setSource(sentinelHub);
      });

      this.instance = sentinelHub;
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

    for (const [key, change] of Object.entries(changes)) {
      switch (key) {
        case 'wolAttributions':
          this.instance.setAttributions(change.currentValue);
          break;
        case 'wolAuth':
          this.instance.setAuth(change.currentValue);
          break;
        case 'wolData':
          this.instance.setData(change.currentValue);
          break;
        case 'wolEvalscript':
          this.instance.setEvalscript(change.currentValue);
          break;
        case 'wolProperties':
          this.instance.setProperties(change.currentValue ?? {});
          break;
      }
    }
  }

  /**
   * Get the underlying OpenLayers SentinelHub instance.
   * @returns The SentinelHub instance
   */
  getInstance(): SentinelHub | undefined {
    return this.instance;
  }
}
