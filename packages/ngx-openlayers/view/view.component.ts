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
  model,
  output,
} from '@angular/core';

import { ObjectEvent } from 'ol/Object';
import { unByKey } from 'ol/Observable';
import View from 'ol/View';
import { Coordinate } from 'ol/coordinate';
import { EventsKey } from 'ol/events';
import BaseEvent from 'ol/events/Event';
import { Extent } from 'ol/extent';
import { ProjectionLike } from 'ol/proj';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';

/**
 * Wraps an OpenLayers [View](https://openlayers.org/en/latest/apidoc/module-ol_View-View.html) instance, which
 * represents a simple 2D view of the map. This is the object to act upon to change the center, resolution
 * and rotation of the map.
 *
 * @example
 * ```html
 * <wol-map>
 *   <wol-view [wolCenter]="[0, 0]" [wolZoom]="2"></wol-view>
 * </wol-map>
 * ```
 *
 * @see https://openlayers.org/en/latest/apidoc/module-ol_View-View.html
 */
@Component({
  selector: 'wol-view',
  imports: [],
  template: `<ng-content />`,
  styles: ``,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolViewComponent implements OnChanges {
  /**
   * The initial center for the view, in the coordinate system of `wolProjection`. Layer sources
   * will not be fetched if this is not set, but the center can be set later.
   */
  readonly wolCenter = model<Coordinate>();

  /**
   * Rotation constraint. `false` means no constraint. `true` means no constraint, but snap to
   * zero near zero. A number constrains the rotation to that number of values, e.g. `4` constrains
   * the rotation to 0, 90, 180, and 270 degrees. Defaults to `true`.
   */
  readonly wolConstrainRotation = input<boolean | number>();

  /**
   * Enable rotation. If `false`, a rotation constraint that always sets the rotation to zero is
   * used and `wolConstrainRotation` has no effect. Defaults to `true`.
   */
  readonly wolEnableRotation = input<boolean>();

  /**
   * The extent that constrains the view center, in other words, nothing outside of this extent
   * can be visible on the map.
   */
  readonly wolExtent = input<Extent>();

  /**
   * If `true`, the extent constraint will only apply to the view center and not the whole extent.
   * Defaults to `false`.
   */
  readonly wolConstrainOnlyCenter = input<boolean>();

  /**
   * If `true`, the extent constraint is applied smoothly, allowing the view to go slightly outside
   * of the given extent. Defaults to `true`.
   */
  readonly wolSmoothExtentConstraint = input<boolean>();

  /**
   * The maximum resolution used to determine the resolution constraint. It is used together with
   * `wolMinResolution` (or `wolMaxZoom`) and `wolZoomFactor`.
   */
  readonly wolMaxResolution = input<number>();

  /**
   * The minimum resolution used to determine the resolution constraint. It is used together with
   * `wolMaxResolution` (or `wolMinZoom`) and `wolZoomFactor`.
   */
  readonly wolMinResolution = input<number>();

  /**
   * The maximum zoom level used to determine the resolution constraint. It is used together with
   * `wolMinZoom` (or `wolMaxResolution`) and `wolZoomFactor`. If `wolMinResolution` is also
   * provided, it takes precedence. Defaults to `28`.
   */
  readonly wolMaxZoom = input<number>();

  /**
   * The minimum zoom level used to determine the resolution constraint. It is used together with
   * `wolMaxZoom` (or `wolMinResolution`) and `wolZoomFactor`. If `wolMaxResolution` is also
   * provided, it takes precedence. Defaults to `0`.
   */
  readonly wolMinZoom = input<number>();

  /**
   * If `false`, the view is constrained so only one world is visible and panning off the edge is
   * not allowed. If `true`, the map may show multiple worlds at low zoom levels. Only used if the
   * projection is global, and `wolExtent` takes precedence when set. Defaults to `false`.
   */
  readonly wolMultiWorld = input<boolean>();

  /**
   * If `true`, the view will always animate to the closest zoom level after an interaction;
   * `false` means intermediary zoom levels are allowed. Defaults to `false`.
   */
  readonly wolConstrainResolution = input<boolean>();

  /**
   * If `true`, the resolution min/max values are applied smoothly, allowing the view to slightly
   * exceed the given resolution or zoom bounds. Defaults to `true`.
   */
  readonly wolSmoothResolutionConstraint = input<boolean>();

  /**
   * Allow the view to be zoomed out to show the full extent configured in `wolExtent`, even if the
   * viewport exceeds the height or width of that extent. Defaults to `false`.
   */
  readonly wolShowFullExtent = input<boolean>();

  /**
   * The projection of the view. Determines the coordinate system of the center and the units of
   * the resolution. Defaults to `'EPSG:3857'` (Web Mercator).
   */
  readonly wolProjection = input<ProjectionLike>();

  /**
   * The initial resolution for the view, in projection units per pixel. An alternative to setting
   * this is `wolZoom`. Layer sources will not be fetched if neither is defined.
   */
  readonly wolResolution = model<number>();

  /**
   * Resolutions that determine the zoom levels. The array index corresponds to the zoom level, so
   * values must be in descending order. When set, `wolMaxResolution`, `wolMinResolution`,
   * `wolMinZoom`, `wolMaxZoom` and `wolZoomFactor` are ignored.
   */
  readonly wolResolutions = input<number[]>();

  /**
   * The initial rotation for the view in radians, positive clockwise, `0` means North. Defaults to
   * `0`.
   */
  readonly wolRotation = model<number>();

  /**
   * Zoom level used to calculate the initial resolution for the view. Only used if
   * `wolResolution` is not defined.
   */
  readonly wolZoom = model<number>();

  /**
   * The zoom factor used to compute the corresponding resolution. Defaults to `2`.
   */
  readonly wolZoomFactor = input<number>();

  /**
   * Padding, in CSS pixels, in `[top, right, bottom, left]` order. Shifts the center of the
   * viewport away from content, such as overlays, that partially covers the map along its edges.
   * Defaults to `[0, 0, 0, 0]`.
   */
  readonly wolPadding = input<number[]>();

  /**
   * Additional properties that will be set to the view instance.
   */
  readonly wolProperties = input<WolProperties>();

  /**
   * Generic change event. Triggered when the revision counter is increased.
   */
  readonly wolChange = output<BaseEvent>();

  /**
   * Generic error event. Triggered when an error occurs.
   */
  readonly wolError = output<BaseEvent>();

  /**
   * Triggered when a property of the view is changed.
   */
  readonly wolPropertyChange = output<ObjectEvent>();

  private instance?: View;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const host = inject(WolMapComponent, { host: true });
    const eventsKey: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const view = new View({
        center: this.wolCenter(),
        constrainRotation: this.wolConstrainRotation(),
        enableRotation: this.wolEnableRotation(),
        extent: this.wolExtent(),
        constrainOnlyCenter: this.wolConstrainOnlyCenter(),
        smoothExtentConstraint: this.wolSmoothExtentConstraint(),
        maxResolution: this.wolMaxResolution(),
        minResolution: this.wolMinResolution(),
        maxZoom: this.wolMaxZoom(),
        minZoom: this.wolMinZoom(),
        multiWorld: this.wolMultiWorld(),
        constrainResolution: this.wolConstrainResolution(),
        smoothResolutionConstraint: this.wolSmoothResolutionConstraint(),
        showFullExtent: this.wolShowFullExtent(),
        projection: this.wolProjection(),
        resolution: this.wolResolution(),
        resolutions: this.wolResolutions(),
        rotation: this.wolRotation(),
        zoom: this.wolZoom(),
        zoomFactor: this.wolZoomFactor(),
        padding: this.wolPadding(),
      });

      if (this.wolProperties()) {
        view.setProperties(this.wolProperties() as WolProperties, true);
      }

      eventsKey['change'] = view.on('change', (event) => this.wolChange.emit(event));

      eventsKey['change:center'] = view.on('change:center', () => {
        this.wolCenter.set(view.getCenter());
      });

      eventsKey['change:resolution'] = view.on('change:resolution', () => {
        this.wolResolution.set(view.getResolution());
        this.wolZoom.set(view.getZoom());
      });

      eventsKey['change:rotation'] = view.on('change:rotation', () => {
        this.wolRotation.set(view.getRotation());
      });

      eventsKey['error'] = view.on('error', (event) => this.wolError.emit(event));

      eventsKey['propertychange'] = view.on('propertychange', (event) =>
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
        host.getInstance()?.setView(view);
      });

      this.instance = view;
    });

    destroyRef.onDestroy(() => {
      unByKey(Object.values(eventsKey));
      host.getInstance()?.setView(null);
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
        case 'wolCenter':
          this.instance.setCenter(change.currentValue);
          break;
        case 'wolConstrainResolution':
          this.instance.setConstrainResolution(change.currentValue);
          break;
        case 'wolMaxZoom':
          this.instance.setMaxZoom(change.currentValue);
          break;
        case 'wolMinZoom':
          this.instance.setMinZoom(change.currentValue);
          break;
        case 'wolProperties':
          this.instance.setProperties(change.currentValue);
          break;
        case 'wolResolution':
          this.instance.setResolution(change.currentValue);
          break;
        case 'wolRotation':
          this.instance.setRotation(change.currentValue);
          break;
        case 'wolZoom':
          this.instance.setZoom(change.currentValue);
          break;
      }
    }
  }

  /**
   * Get the internal OpenLayers View instance
   * @returns The internal OpenLayers View instance
   */
  getInstance(): View | undefined {
    return this.instance;
  }
}
