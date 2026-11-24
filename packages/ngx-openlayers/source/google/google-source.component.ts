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
import { LoadFunction } from 'ol/Tile';
import { NearestDirectionFunction } from 'ol/array';
import { EventsKey } from 'ol/events';
import BaseEvent from 'ol/events/Event';
import Google from 'ol/source/Google';
import { AttributionLike } from 'ol/source/Source';
import { TileSourceEvent } from 'ol/source/Tile';

import { WolProperties, WolSafeAny } from '@workletjs/ngx-openlayers/core/types';
import { DisposeRef, useTileSourceHostRef } from '@workletjs/ngx-openlayers/source/tile';

/**
 * Provides basemap tiles through the Google Map Tiles API.
 *
 * See the [OpenLayers Google reference](https://openlayers.org/en/latest/apidoc/module-ol_source_Google-Google.html).
 *
 * The underlying source creates and renews the request session. Recreate the component to apply new
 * session configuration.
 */
@Component({
  selector: 'wol-google-source',
  exportAs: 'wolGoogleSource',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolGoogleSourceComponent implements OnChanges {
  /**
   * Custom credits for the source. OpenLayers applies its viewport-based attribution as each
   * session is created or renewed. Changes to this input update the existing source.
   */
  readonly wolAttributions = input<AttributionLike>();
  /**
   * Whether the attribution control may collapse this source's credits. Defaults to `true`. Read at
   * source creation.
   */
  readonly wolAttributionsCollapsible = input<boolean>();
  /** Required Google Map Tiles API key for tile and session requests. Read at source creation. */
  readonly wolKey = input.required<string>();
  /**
   * Base map to request, such as `'roadmap'`, `'satellite'`, or `'terrain'`. Defaults to
   * `'roadmap'`. Read at source creation.
   */
  readonly wolMapType = input<string>();
  /** BCP 47 language tag for tile labels. Defaults to `'en-US'`. Read at source creation. */
  readonly wolLanguage = input<string>();
  /**
   * CLDR region identifier used for regional tile content. Defaults to `'US'`. Read at source
   * creation.
   */
  readonly wolRegion = input<string>();
  /** Requested tile image format, such as `'jpeg'` or `'png'`. Read at source creation. */
  readonly wolImageFormat = input<string>();
  /**
   * Scale of map elements such as labels. Use `'scaleFactor1x'`, `'scaleFactor2x'`, or
   * `'scaleFactor4x'`. Read at source creation.
   */
  readonly wolScale = input<string>();
  /** Requests high-resolution tiles when enabled. Defaults to `false`. Read at source creation. */
  readonly wolHighDpi = input<boolean>();
  /**
   * Supplementary layers to request, such as `'layerRoadmap'`, `'layerStreetview'`, or
   * `'layerTraffic'`. Read at source creation.
   */
  readonly wolLayerTypes = input<string[]>();
  /**
   * Displays only the requested `wolLayerTypes` when supplied. Defaults to `false`. Read at source
   * creation.
   */
  readonly wolOverlay = input<boolean>();
  /** Custom map styling rules supplied to the tile session. Read at source creation. */
  readonly wolStyles = input<Record<string, WolSafeAny>[]>();
  /**
   * Whether to use linear interpolation when resampling. Defaults to `true`. Set to `false` for
   * nearest-neighbor sampling. Read at source creation.
   */
  readonly wolInterpolate = input<boolean>();
  /**
   * Legacy tile cache option supplied at source creation for compatibility.
   * OpenLayers 10.11.0 manages the cache on the rendering layer.
   *
   * @deprecated Configure `wolCacheSize` on a compatible layer.
   */
  readonly wolCacheSize = input<number>();
  /**
   * Maximum reprojection error in pixels. Defaults to `0.5`. Increasing this value trades accuracy
   * for faster reprojection. Read at source creation.
   */
  readonly wolReprojectionErrorThreshold = input<number>();
  /**
   * Callback that loads a tile using its URL. By default, OpenLayers assigns the URL to the tile
   * image. Changes update the loader on the existing source.
   */
  readonly wolTileLoadFunction = input<LoadFunction>();
  /**
   * Additional option values sent when creating the Google tile session. Read at source creation.
   */
  readonly wolApiOptions = input<string[]>();
  /**
   * Custom function for creating and renewing Google Map Tiles API sessions.
   * Receives the `createSession` URL and request configuration and returns a response promise.
   * When omitted, OpenLayers uses `fetch`.
   *
   * Persisting session tokens across page reloads lets tile URLs remain stable and cached tiles
   * be reused. Include the token's `expiry` in the response so OpenLayers can renew it in time.
   * This input is used only when the source is initialized.
   */
  readonly wolFetchSessionToken = input<(url: string, config: RequestInit) => Promise<Response>>();
  /**
   * Whether tiles wrap horizontally beyond the antimeridian. Defaults to `true`. Read at source
   * creation.
   */
  readonly wolWrapX = input<boolean>();
  /**
   * Tile fade-in duration in milliseconds. Defaults to `250`. Set to `0` to disable the fade. Read
   * at source creation.
   */
  readonly wolTransition = input<number>();
  /**
   * Chooses the tile zoom at intermediate view resolutions. Defaults to `0` for the nearest level.
   * Use `1` to favor the coarser level, `-1` for the finer level, or provide a function. Read at
   * source creation.
   */
  readonly wolZDirection = input<number | NearestDirectionFunction>();
  /**
   * Additional OpenLayers source properties. Binding changes add or update keys on the existing
   * source.
   */
  readonly wolProperties = input<WolProperties>();

  /**
   * Emits when the source changes. Check the source state for Google tile session loading, success,
   * or failure.
   */
  readonly wolChange = output<BaseEvent>();
  /** Forwards the OpenLayers source's `error` event. */
  readonly wolError = output<BaseEvent>();
  /** Emits a `propertychange` event with the changed property name and its previous value. */
  readonly wolPropertyChange = output<ObjectEvent>();
  /** Emits when a source tile finishes loading. The event identifies the tile. */
  readonly wolTileLoadEnd = output<TileSourceEvent>();
  /** Emits when a source tile fails to load. The event identifies the tile. */
  readonly wolTileLoadError = output<TileSourceEvent>();
  /** Emits when a source tile starts loading. The event identifies the tile. */
  readonly wolTileLoadStart = output<TileSourceEvent>();

  private instance?: Google;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useTileSourceHostRef<Google>('Google');
    const eventsKey: Record<string, EventsKey> = {};

    let disposeRef: DisposeRef;

    afterNextRender(() => {
      const google = new Google({
        key: this.wolKey(),
        mapType: this.wolMapType(),
        language: this.wolLanguage(),
        region: this.wolRegion(),
        imageFormat: this.wolImageFormat(),
        scale: this.wolScale(),
        highDpi: this.wolHighDpi(),
        layerTypes: this.wolLayerTypes(),
        overlay: this.wolOverlay(),
        styles: this.wolStyles(),
        attributionsCollapsible: this.wolAttributionsCollapsible(),
        interpolate: this.wolInterpolate(),
        cacheSize: this.wolCacheSize(),
        reprojectionErrorThreshold: this.wolReprojectionErrorThreshold(),
        tileLoadFunction: this.wolTileLoadFunction(),
        apiOptions: this.wolApiOptions(),
        fetchSessionToken: this.wolFetchSessionToken(),
        wrapX: this.wolWrapX(),
        transition: this.wolTransition(),
        zDirection: this.wolZDirection(),
      });

      if (this.wolAttributions()) {
        google.setAttributions(this.wolAttributions());
      }

      if (this.wolProperties()) {
        google.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKey['change'] = google.on('change', (evt) => this.wolChange.emit(evt));

      eventsKey['error'] = google.on('error', (evt) => this.wolError.emit(evt));

      eventsKey['propertychange'] = google.on('propertychange', (evt) =>
        this.wolPropertyChange.emit(evt),
      );

      eventsKey['tileloadend'] = google.on('tileloadend', (evt) => this.wolTileLoadEnd.emit(evt));

      eventsKey['tileloaderror'] = google.on('tileloaderror', (evt) =>
        this.wolTileLoadError.emit(evt),
      );

      eventsKey['tileloadstart'] = google.on('tileloadstart', (evt) =>
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
        disposeRef = hostRef.setSource(google);
      });

      this.instance = google;
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
        case 'wolTileLoadFunction':
          this.instance.setTileLoadFunction(change.currentValue);
          break;
      }
    }
  }

  /**
   * Gets the OpenLayers source created by this component.
   *
   * @returns The OpenLayers `Google` instance, or `undefined` before creation and after
   * destruction.
   */
  getInstance(): Google | undefined {
    return this.instance;
  }
}
