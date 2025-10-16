import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  model,
  OnChanges,
  output,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { Coordinate } from 'ol/coordinate';
import { Extent } from 'ol/extent';
import { ProjectionLike } from 'ol/proj';
import { ObjectEvent } from 'ol/Object';
import { EventsKey } from 'ol/events';
import { unByKey } from 'ol/Observable';
import BaseEvent from 'ol/events/Event';
import View from 'ol/View';

@Component({
  selector: 'wol-view',
  imports: [],
  template: `<ng-content />`,
  styles: ``,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolViewComponent implements OnChanges {
  readonly wolCenter = model<Coordinate>();
  readonly wolConstrainRotation = input<boolean | number>();
  readonly wolEnableRotation = input<boolean>();
  readonly wolExtent = input<Extent>();
  readonly wolConstrainOnlyCenter = input<boolean>();
  readonly wolSmoothExtentConstraint = input<boolean>();
  readonly wolMaxResolution = input<number>();
  readonly wolMinResolution = input<number>();
  readonly wolMaxZoom = input<number>();
  readonly wolMinZoom = input<number>();
  readonly wolMultiWorld = input<boolean>();
  readonly wolConstrainResolution = input<boolean>();
  readonly wolSmoothResolutionConstraint = input<boolean>();
  readonly wolShowFullExtent = input<boolean>();
  readonly wolProjection = input<ProjectionLike>();
  readonly wolResolution = model<number>();
  readonly wolResolutions = input<number[]>();
  readonly wolRotation = model<number>();
  readonly wolZoom = model<number>();
  readonly wolZoomFactor = input<number>();
  readonly wolPadding = input<number[]>();
  readonly wolProperties = input<WolProperties>();

  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
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
