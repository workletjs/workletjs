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
import { Extent } from 'ol/extent';
import { EventsKey } from 'ol/events';
import { ObjectEvent } from 'ol/Object';
import { unByKey } from 'ol/Observable';
import { ProjectionLike } from 'ol/proj';
import { Size } from 'ol/size';
import { Versions } from 'ol/format/IIIFInfo';
import { AttributionLike, State } from 'ol/source/Source';
import BaseEvent from 'ol/events/Event';
import IIIF from 'ol/source/IIIF';

@Component({
  selector: 'wol-iiif-source',
  exportAs: 'wolIIIFSource',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolIIIFSourceComponent implements OnChanges {
  readonly wolAttributions = input<AttributionLike>();
  readonly wolAttributionCollapsible = input<boolean>();
  readonly wolCacheSize = input<number>();
  readonly wolCrossOrigin = input<null | string>();
  readonly wolExtent = input<Extent>();
  readonly wolFormat = input<string>();
  readonly wolInterpolate = input<boolean>();
  readonly wolProjection = input<ProjectionLike>();
  readonly wolQuality = input<string>();
  readonly wolReprojectionErrorThreshold = input<number>();
  readonly wolResolutions = input<number[]>();
  readonly wolSize = input.required<Size>();
  readonly wolSizes = input<Size[]>();
  readonly wolState = input<State>();
  readonly wolSupports = input<string[]>();
  readonly wolTilePixelRatio = input<number>();
  readonly wolTileSize = input<number | Size>();
  readonly wolTransition = input<number>();
  readonly wolUrl = input<string>();
  readonly wolVersion = input<Versions>();
  readonly wolZDirection = input<number | NearestDirectionFunction>();
  readonly wolProperties = input<WolProperties>();

  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
  readonly wolPropertyChange = output<ObjectEvent>();
  readonly wolTileLoadEnd = output<BaseEvent>();
  readonly wolTileLoadError = output<BaseEvent>();
  readonly wolTileLoadStart = output<BaseEvent>();

  private instance?: IIIF;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useTileSourceHostRef<IIIF>('IIIF');
    const eventsKey: Record<string, EventsKey> = {};

    let disposeRef: DisposeRef;

    afterNextRender(() => {
      const iiif = new IIIF({
        attributions: this.wolAttributions(),
        attributionsCollapsible: this.wolAttributionCollapsible(),
        cacheSize: this.wolCacheSize(),
        crossOrigin: this.wolCrossOrigin(),
        extent: this.wolExtent(),
        format: this.wolFormat(),
        interpolate: this.wolInterpolate(),
        projection: this.wolProjection(),
        quality: this.wolQuality(),
        reprojectionErrorThreshold: this.wolReprojectionErrorThreshold(),
        resolutions: this.wolResolutions(),
        size: this.wolSize(),
        sizes: this.wolSizes(),
        state: this.wolState(),
        supports: this.wolSupports(),
        tilePixelRatio: this.wolTilePixelRatio(),
        tileSize: this.wolTileSize(),
        transition: this.wolTransition(),
        url: this.wolUrl(),
        version: this.wolVersion(),
        zDirection: this.wolZDirection(),
      });

      if (this.wolProperties()) {
        iiif.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKey['change'] = iiif.on('change', (evt) => this.wolChange.emit(evt));

      eventsKey['error'] = iiif.on('error', (evt) => this.wolError.emit(evt));

      eventsKey['propertychange'] = iiif.on('propertychange', (evt) =>
        this.wolPropertyChange.emit(evt),
      );

      eventsKey['tileloadend'] = iiif.on('tileloadend', (evt) => this.wolTileLoadEnd.emit(evt));

      eventsKey['tileloaderror'] = iiif.on('tileloaderror', (evt) =>
        this.wolTileLoadError.emit(evt),
      );

      eventsKey['tileloadstart'] = iiif.on('tileloadstart', (evt) =>
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
        disposeRef = hostRef.setSource(iiif);
      });

      this.instance = iiif;
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

    for (const [key, change] of Object.entries(changes)) {
      switch (key) {
        case 'wolAttributions':
          this.instance.setAttributions(change.currentValue);
          break;
        case 'wolProperties':
          this.instance.setProperties(change.currentValue ?? {});
          break;
        case 'wolUrl':
          this.instance.setUrl(change.currentValue);
          break;
      }
    }
  }

  /**
   * Get the underlying OpenLayers IIIF instance.
   * @returns The IIIF instance
   */
  getInstance(): IIIF | undefined {
    return this.instance;
  }
}
