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

import MapEvent from 'ol/MapEvent';
import { ObjectEvent } from 'ol/Object';
import { unByKey } from 'ol/Observable';
import MousePosition from 'ol/control/MousePosition';
import { CoordinateFormat } from 'ol/coordinate';
import { EventsKey } from 'ol/events';
import BaseEvent from 'ol/events/Event';
import { ProjectionLike } from 'ol/proj';

import { useControlHostRef } from '@workletjs/ngx-openlayers/control/control';
import { WolProperties } from '@workletjs/ngx-openlayers/core/types';

@Component({
  selector: 'wol-mouse-position-control',
  exportAs: 'wolMousePositionControl',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolMousePositionControlComponent implements OnChanges {
  readonly wolClassName = input<string>();
  readonly wolCoordinateFormat = model<CoordinateFormat>();
  readonly wolProjection = model<ProjectionLike>();
  readonly wolRender = input<(event: MapEvent) => void>();
  readonly wolTarget = input<string | HTMLElement>();
  readonly wolPlaceholder = input<string>();
  readonly wolWrapX = input<boolean>();
  readonly wolProperties = input<WolProperties>();

  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
  readonly wolPropertyChange = output<ObjectEvent>();

  private instance?: MousePosition;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useControlHostRef<MousePosition>('MousePosition');
    const eventsKeyMap: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const mousePosition = new MousePosition({
        className: this.wolClassName(),
        coordinateFormat: this.wolCoordinateFormat(),
        projection: this.wolProjection(),
        render: this.wolRender(),
        target: this.wolTarget(),
        placeholder: this.wolPlaceholder(),
        wrapX: this.wolWrapX(),
      });

      if (this.wolProperties()) {
        mousePosition.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKeyMap['change'] = mousePosition.on('change', (event) => this.wolChange.emit(event));

      eventsKeyMap['change:coordinateFormat'] = mousePosition.on('change:coordinateFormat', () =>
        this.wolCoordinateFormat.set(mousePosition.getCoordinateFormat()),
      );

      eventsKeyMap['change:projection'] = mousePosition.on('change:projection', () =>
        this.wolProjection.set(mousePosition.getProjection()),
      );

      eventsKeyMap['error'] = mousePosition.on('error', (event) => this.wolError.emit(event));

      eventsKeyMap['propertychange'] = mousePosition.on('propertychange', (event) =>
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
        hostRef.addControl(mousePosition);
      });

      this.instance = mousePosition;
    });

    destroyRef.onDestroy(() => {
      if (this.instance) {
        unByKey(Object.values(eventsKeyMap));
        hostRef.removeControl(this.instance);
        this.instance.dispose();
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

    for (const [key, change] of Object.entries(changes)) {
      switch (key) {
        case 'wolCoordinateFormat':
          this.instance.setCoordinateFormat(change.currentValue);
          break;
        case 'wolProjection':
          this.instance.setProjection(change.currentValue);
          break;
        case 'wolProperties':
          this.instance.setProperties(change.currentValue ?? {}, true);
          break;
        case 'wolTarget':
          this.instance.setTarget(change.currentValue);
          break;
      }
    }
  }

  /**
   * Get the underlying OpenLayers MousePosition instance.
   * @returns The MousePosition instance
   */
  getInstance(): MousePosition | undefined {
    return this.instance;
  }
}
