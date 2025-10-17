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
import { Source } from 'ol/source';
import { ImageSourceEvent } from 'ol/source/Image';
import { AttributionLike } from 'ol/source/Source';
import { ObjectEvent } from 'ol/Object';
import { EventsKey } from 'ol/events';
import { unByKey } from 'ol/Observable';
import BaseEvent from 'ol/events/Event';
import Collection from 'ol/Collection';
import Layer from 'ol/layer/Layer';
import RasterSource, { Operation, RasterOperationType, RasterSourceEvent } from 'ol/source/Raster';
import { useRasterSourceHostRef } from './use-raster-source-host-ref';
import { createLayers } from './utils';

@Component({
  selector: 'wol-raster-source',
  imports: [],
  template: `<ng-content />`,
  styles: ``,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolRasterSourceComponent implements OnChanges {
  readonly wolAttributions = input<AttributionLike>();

  /**
   * Input sources or layers. For vector data, use an VectorImage layer.
   */
  readonly wolSources = input<Source[] | Layer[]>();
  readonly wolOperation = input<Operation>();
  readonly wolLib = input<Record<string, WolSafeAny>>();
  readonly wolThreads = input<number>();
  readonly wolOperationType = input<RasterOperationType>();
  readonly wolResolutions = input<number[] | null>();
  readonly wolProperties = input<WolProperties>();

  readonly wolAfterOperations = output<RasterSourceEvent>();
  readonly wolBeforeOperations = output<RasterSourceEvent>();
  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
  readonly wolImageLoadEnd = output<ImageSourceEvent>();
  readonly wolImageLoadError = output<ImageSourceEvent>();
  readonly wolImageLoadStart = output<ImageSourceEvent>();
  readonly wolPropertyChange = output<ObjectEvent>();

  private readonly sources = new Collection<Source | Layer>();
  private instance?: RasterSource;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useRasterSourceHostRef();
    const eventsKey: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const rasterSource = new RasterSource({
        sources: this.wolSources() ?? this.sources.getArray(),
        operation: this.wolOperation(),
        lib: this.wolLib(),
        threads: this.wolThreads(),
        operationType: this.wolOperationType(),
        resolutions: this.wolResolutions(),
      });

      if (!this.wolAttributions()) {
        rasterSource.setAttributions(this.wolAttributions());
      }

      if (!this.wolProperties()) {
        rasterSource.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKey['afteroperations'] = rasterSource.on('afteroperations', (event) =>
        this.wolAfterOperations.emit(event),
      );

      eventsKey['beforeoperations'] = rasterSource.on('beforeoperations', (event) =>
        this.wolBeforeOperations.emit(event),
      );

      eventsKey['change'] = rasterSource.on('change', (event) => this.wolChange.emit(event));

      eventsKey['error'] = rasterSource.on('error', (event) => this.wolError.emit(event));

      eventsKey['imageloadend'] = rasterSource.on('imageloadend', (event) =>
        this.wolImageLoadEnd.emit(event),
      );

      eventsKey['imageloaderror'] = rasterSource.on('imageloaderror', (event) =>
        this.wolImageLoadError.emit(event),
      );

      eventsKey['imageloadstart'] = rasterSource.on('imageloadstart', (event) =>
        this.wolImageLoadStart.emit(event),
      );

      eventsKey['propertychange'] = rasterSource.on('propertychange', (event) =>
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
        hostRef.setSource(rasterSource);
      });

      this.instance = rasterSource;
    });

    destroyRef.onDestroy(() => {
      if (this.instance) {
        unByKey(Object.values(eventsKey));
        hostRef.setSource(null);
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

    const operation = this.wolOperation();
    const lib = this.wolLib();

    for (const [key, change] of Object.entries(changes)) {
      switch (key) {
        case 'wolAttributions':
          this.instance.setAttributions(change.currentValue);
          break;
        case 'wolOperation':
        case 'wolLib':
          if (operation) {
            this.instance.setOperation(operation, lib);
          }
          break;
        case 'wolResolutions':
          this.instance.setResolutions(change.currentValue);
          break;
        case 'wolProperties':
          this.instance.setProperties(change.currentValue ?? {}, false);
          break;
      }
    }
  }

  /**
   * Get the underlying OpenLayers instance.
   * @returns The OpenLayers RasterSource instance or undefined if not yet created.
   */
  getInstance(): RasterSource | undefined {
    return this.instance;
  }

  /**
   * Add a source or layer to the sources collection.
   * @param source The source or layer to add.
   */
  addSource(source: Source | Layer): void {
    this.sources.push(source);
    this.updateSources();
  }

  /**
   * Remove a source or layer from the sources collection.
   * @param source The source or layer to remove.
   */
  removeSource(source: Source | Layer): void {
    this.sources.remove(source);
    this.updateSources();
  }

  private updateSources(): void {
    if (!this.instance) {
      return;
    }

    const layers = createLayers(this.sources.getArray());
    const layerStatesArray = layers.map((layer) => layer.getLayerState());

    this.instance['layers_'] = createLayers(this.sources.getArray());
    this.instance['frameState_'] = {
      ...this.instance['frameState_'],
      layerStatesArray,
    };
    this.instance.changed();
  }
}
