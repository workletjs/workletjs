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
import { Loader } from 'ol/Image';
import { ObjectEvent } from 'ol/Object';
import { ProjectionLike } from 'ol/proj';
import { AttributionLike, State } from 'ol/source/Source';
import { EventsKey } from 'ol/events';
import { unByKey } from 'ol/Observable';
import ImageSource, { ImageSourceEvent } from 'ol/source/Image';
import BaseEvent from 'ol/events/Event';
import { useImageSourceHostRef } from './use-image-source-host-ref';

@Component({
  selector: 'wol-image-source',
  imports: [],
  template: `<ng-content />`,
  styles: ``,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolImageSourceComponent implements OnChanges {
  readonly wolAttributions = input<AttributionLike>();
  readonly wolInterpolate = input<boolean>();
  readonly wolLoader = input<Loader>();
  readonly wolProjection = input<ProjectionLike>();
  readonly wolResolutions = input<number[]>();
  readonly wolState = input<State>();
  readonly wolProperties = input<WolProperties>();

  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
  readonly wolImageLoadEnd = output<ImageSourceEvent>();
  readonly wolImageLoadError = output<ImageSourceEvent>();
  readonly wolImageLoadStart = output<ImageSourceEvent>();
  readonly wolPropertyChange = output<ObjectEvent>();

  private instanece?: ImageSource;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const host = useImageSourceHostRef<ImageSource>('ImageSource');
    const eventsKey: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const imageSource = new ImageSource({
        attributions: this.wolAttributions(),
        interpolate: this.wolInterpolate(),
        loader: this.wolLoader(),
        projection: this.wolProjection(),
        resolutions: this.wolResolutions(),
        state: this.wolState(),
      });

      if (this.wolProperties()) {
        imageSource.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKey['change'] = imageSource.on('change', (event) => this.wolChange.emit(event));

      eventsKey['error'] = imageSource.on('error', (event) => this.wolError.emit(event));

      eventsKey['imageloadend'] = imageSource.on('imageloadend', (event) =>
        this.wolImageLoadEnd.emit(event),
      );

      eventsKey['imageloaderror'] = imageSource.on('imageloaderror', (event) =>
        this.wolImageLoadError.emit(event),
      );

      eventsKey['imageloadstart'] = imageSource.on('imageloadstart', (event) =>
        this.wolImageLoadStart.emit(event),
      );

      eventsKey['propertychange'] = imageSource.on('propertychange', (event) =>
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
        host.setSource(imageSource);
      });

      this.instanece = imageSource;
    });

    destroyRef.onDestroy(() => {
      if (this.instanece) {
        unByKey(Object.values(eventsKey));
        host.setSource(null);
        this.instanece = undefined;
      }
    });
  }

  /**
   * Respond to input changes.
   * @param changes The changed inputs
   * @internal
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (!this.instanece) {
      return;
    }

    for (const [key, change] of Object.entries(changes)) {
      switch (key) {
        case 'wolAttributions':
          this.instanece.setAttributions(change.currentValue);
          break;
        case 'wolProperties':
          this.instanece.setProperties(change.currentValue, true);
          break;
      }
    }
  }

  /**
   * Get the OpenLayers ImageSource instance.
   * @returns The OpenLayers ImageSource instance or undefined if not yet created.
   */
  getInstance(): ImageSource | undefined {
    return this.instanece;
  }
}
