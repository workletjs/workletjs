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
import { ObjectEvent } from 'ol/Object';
import { ProjectionLike } from 'ol/proj';
import { TileSourceEvent } from 'ol/source/Tile';
import { EventsKey } from 'ol/events';
import { unByKey } from 'ol/Observable';
import { AttributionLike } from 'ol/source/Source';
import BaseEvent from 'ol/events/Event';
import GeoTIFFSource, { GeoTIFFSourceOptions, SourceInfo } from 'ol/source/GeoTIFF';

@Component({
  selector: 'wol-geotiff-source',
  exportAs: 'wolGeoTIFFSource',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolGeoTIFFSourceComponent implements OnChanges {
  readonly wolAttributions = input<AttributionLike>();
  readonly wolSources = input.required<SourceInfo[]>();
  readonly wolSourceOptions = input<GeoTIFFSourceOptions>();
  readonly wolConvertToRGB = input<boolean | 'auto'>();
  readonly wolNormalize = input<boolean>();
  readonly wolProjection = input<ProjectionLike>();
  readonly wolTransition = input<number>();
  readonly wolWrapX = input<boolean>();
  readonly wolInterpolate = input<boolean>();
  readonly wolProperties = input<WolProperties>();

  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
  readonly wolPropertyChange = output<ObjectEvent>();
  readonly wolTileLoadEnd = output<TileSourceEvent>();
  readonly wolTileLoadError = output<TileSourceEvent>();
  readonly wolTileLoadStart = output<TileSourceEvent>();

  private instance?: GeoTIFFSource;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useTileSourceHostRef<GeoTIFFSource>('GeoTIFFSource');
    const eventsKey: Record<string, EventsKey> = {};

    let disposeRef: DisposeRef;

    afterNextRender(() => {
      const geotiff = new GeoTIFFSource({
        sources: this.wolSources(),
        sourceOptions: this.wolSourceOptions(),
        convertToRGB: this.wolConvertToRGB(),
        normalize: this.wolNormalize(),
        projection: this.wolProjection(),
        transition: this.wolTransition(),
        wrapX: this.wolWrapX(),
        interpolate: this.wolInterpolate(),
      });

      if (this.wolAttributions()) {
        geotiff.setAttributions(this.wolAttributions());
      }

      if (this.wolProperties()) {
        geotiff.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKey['change'] = geotiff.on('change', (evt) => this.wolChange.emit(evt));

      eventsKey['error'] = geotiff.on('error', (evt) => this.wolError.emit(evt));

      eventsKey['propertychange'] = geotiff.on('propertychange', (evt) =>
        this.wolPropertyChange.emit(evt),
      );

      eventsKey['tileloadend'] = geotiff.on('tileloadend', (evt) => this.wolTileLoadEnd.emit(evt));

      eventsKey['tileloaderror'] = geotiff.on('tileloaderror', (evt) =>
        this.wolTileLoadError.emit(evt),
      );

      eventsKey['tileloadstart'] = geotiff.on('tileloadstart', (evt) =>
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
        disposeRef = hostRef.setSource(geotiff);
      });

      this.instance = geotiff;
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
        case 'wolProperties':
          this.instance.setProperties(change.currentValue ?? {});
          break;
      }
    }
  }

  /**
   * Get the OpenLayers GeoTIFF source instance.
   * @returns The GeoTIFF source instance
   */
  getInstance(): GeoTIFFSource | undefined {
    return this.instance;
  }
}
