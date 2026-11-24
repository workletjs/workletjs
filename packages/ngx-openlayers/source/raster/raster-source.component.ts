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

import Collection from 'ol/Collection';
import { ObjectEvent } from 'ol/Object';
import { unByKey } from 'ol/Observable';
import { EventsKey } from 'ol/events';
import BaseEvent from 'ol/events/Event';
import Layer from 'ol/layer/Layer';
import { Source } from 'ol/source';
import DataTileSource from 'ol/source/DataTile';
import { ImageSourceEvent } from 'ol/source/Image';
import ImageTileSource from 'ol/source/ImageTile';
import RasterSource, { Operation, RasterOperationType, RasterSourceEvent } from 'ol/source/Raster';
import { AttributionLike } from 'ol/source/Source';

import { WolProperties, WolSafeAny } from '@workletjs/ngx-openlayers/core/types';

import { useRasterSourceHostRef } from './use-raster-source-host-ref';
import { createLayers } from './utils';

/**
 * Applies a pixel or image operation to input sources or layers and exposes the resulting image as
 * a source.
 *
 * @see [OpenLayers RasterSource](https://openlayers.org/en/latest/apidoc/module-ol_source_Raster-RasterSource.html)
 */
@Component({
  selector: 'wol-raster-source',
  imports: [],
  template: `<ng-content />`,
  styles: ``,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolRasterSourceComponent implements OnChanges {
  /**
   * Credits displayed for the raster output. The component applies the bound value on input
   * changes after source creation.
   */
  readonly wolAttributions = input<AttributionLike>();

  /**
   * Initial sources or rendered layers for the operation. When omitted, the component uses its
   * collection of registered sources and layers. For vector data, supply a rendered layer such as
   * a `VectorImageLayer`.
   *
   * @remarks Passing a data-tile source directly makes its bands and native numeric precision
   * available to a pixel operation. OpenLayers uses nearest-neighbor sampling for these inputs and
   * requires tile data to match the grid without a gutter. Pass a styled layer to process rendered
   * RGBA instead.
   */
  readonly wolSources = input<Source[] | Layer[]>();
  /**
   * Operation that returns the output pixel or image from the source inputs. A new operation
   * replaces the current one. Supply `wolLib` for helpers used in a worker.
   */
  readonly wolOperation = input<Operation>();

  /**
   * Uses linear interpolation when resampling the output image by default. Set to `false` for
   * nearest-neighbor resampling. Read at creation.
   */
  readonly wolInterpolate = input<boolean>();

  /**
   * Helper functions available to the operation in a worker. Updating helpers reapplies the
   * current operation when one is configured.
   */
  readonly wolLib = input<Record<string, WolSafeAny>>();
  /**
   * Worker count. Defaults to one worker. Set to `0` to run on the main thread. Pixel operations
   * can be split across workers. Read at creation.
   */
  readonly wolThreads = input<number>();
  /**
   * Use `pixel` (the default) for one call per output pixel, with the corresponding values from
   * each input. Use `image` to pass each rendered input as an `ImageData` object. Read at
   * creation.
   */
  readonly wolOperationType = input<RasterOperationType>();
  /**
   * Resolutions at which the operation runs. Pass `null` at creation to use any view resolution
   * for the life of the source. Otherwise, OpenLayers initially takes the resolutions from the
   * first input that specifies them, if any.
   *
   * @remarks In the mode that uses input resolutions, updating the list after creation sets
   * explicit resolutions, and setting it to `null` falls back to the input resolutions.
   * Recreate the component to switch modes.
   */
  readonly wolResolutions = input<number[] | null>();
  /**
   * Observable source properties. The component applies the supplied keys on input changes after
   * source creation.
   */
  readonly wolProperties = input<WolProperties>();

  /**
   * Emits after the operation finishes. The event contains the extent, resolution, and worker data
   * for the completed operation.
   */
  readonly wolAfterOperations = output<RasterSourceEvent>();
  /**
   * Emits before the operation starts. Put values needed by the operation on the event's `data`
   * object.
   */
  readonly wolBeforeOperations = output<RasterSourceEvent>();
  /** Emits the source's `change` event when its revision increases. */
  readonly wolChange = output<BaseEvent>();
  /** Forwards the native `error` event emitted by the source. */
  readonly wolError = output<BaseEvent>();
  /** Forwards the source's `imageloadend` event. The event carries the image. */
  readonly wolImageLoadEnd = output<ImageSourceEvent>();
  /** Forwards the source's `imageloaderror` event. The event carries the failed image. */
  readonly wolImageLoadError = output<ImageSourceEvent>();
  /** Forwards the source's `imageloadstart` event. The event carries the image. */
  readonly wolImageLoadStart = output<ImageSourceEvent>();
  /**
   * Emits when an observable source property changes. The event provides the property key and its
   * previous value.
   */
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
        interpolate: this.wolInterpolate(),
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
   * Returns the OpenLayers RasterSource instance.
   *
   * @returns The source after rendering, or `undefined` before creation and after destruction.
   */
  getInstance(): RasterSource | undefined {
    return this.instance;
  }

  /**
   * Adds an input to the component's source collection. After initialization, the operation uses
   * the updated collection.
   *
   * @param source - The source or rendered layer to add.
   */
  addSource(source: Source | Layer): void {
    this.sources.push(source);
    this.updateSources();
  }

  /**
   * Removes an input from the component's source collection. After initialization, the operation
   * uses the updated collection.
   *
   * @param source - The source or layer to remove.
   */
  removeSource(source: Source | Layer): void {
    this.sources.remove(source);
    this.updateSources();
  }

  private updateSources(): void {
    if (!this.instance) {
      return;
    }

    const sources = this.sources.getArray();
    const layers = createLayers(sources);
    const layerStatesArray = layers.map((layer) => layer.getLayerState());

    // Keep the native-array sampling mode aligned with OpenLayers 10.11 source order.
    this.instance['sampleArrayData_'] = sources.map(
      (source) => source instanceof DataTileSource && !(source instanceof ImageTileSource),
    );
    this.instance['layers_'] = layers;
    this.instance['frameState_'] = {
      ...this.instance['frameState_'],
      layerStatesArray,
    };
    this.instance.changed();
  }
}
