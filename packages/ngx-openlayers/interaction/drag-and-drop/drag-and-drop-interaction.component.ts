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
import { EventsKey } from 'ol/events';
import BaseEvent from 'ol/events/Event';
import FeatureFormat from 'ol/format/Feature';
import DragAndDrop, { DragAndDropEvent } from 'ol/interaction/DragAndDrop';
import { ProjectionLike } from 'ol/proj';
import VectorSource from 'ol/source/Vector';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { useInteractionHostRef } from '@workletjs/ngx-openlayers/interaction/interaction';

@Component({
  selector: 'wol-drag-and-drop-interaction',
  exportAs: 'wolDragAndDropInteraction',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolDragAndDropInteractionComponent implements OnChanges {
  readonly wolActive = model(true);
  readonly wolFormatConstructors = input<(FeatureFormat | typeof FeatureFormat)[]>();
  readonly wolSource = input<VectorSource>();
  readonly wolProjection = input<ProjectionLike>();
  readonly wolTarget = input<HTMLElement>();
  readonly wolProperties = input<WolProperties>();

  readonly wolAddFeatures = output<DragAndDropEvent>();
  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
  readonly wolPropertyChange = output<ObjectEvent>();

  private instance?: DragAndDrop;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useInteractionHostRef<DragAndDrop>('DragAndDrop');
    const eventsKeyMap: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const dragAndDrop = new DragAndDrop({
        formatConstructors: this.wolFormatConstructors(),
        source: this.wolSource(),
        projection: this.wolProjection(),
        target: this.wolTarget(),
      });

      dragAndDrop.setActive(this.wolActive());

      if (this.wolProperties()) {
        dragAndDrop.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKeyMap['addfeatures'] = dragAndDrop.on('addfeatures', (event) => {
        this.wolAddFeatures.emit(event);
      });

      eventsKeyMap['change'] = dragAndDrop.on('change', (event) => {
        this.wolChange.emit(event);
      });

      eventsKeyMap['change:active'] = dragAndDrop.on('change:active', () =>
        this.wolActive.set(dragAndDrop.getActive()),
      );

      eventsKeyMap['error'] = dragAndDrop.on('error', (event) => {
        this.wolError.emit(event);
      });

      eventsKeyMap['propertychange'] = dragAndDrop.on('propertychange', (event) => {
        this.wolPropertyChange.emit(event);
      });
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
        hostRef.addInteraction(dragAndDrop);
      });

      this.instance = dragAndDrop;
    });

    destroyRef.onDestroy(() => {
      if (this.instance) {
        unByKey(Object.values(eventsKeyMap));
        hostRef.removeInteraction(this.instance);
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
        case 'wolActive':
          this.instance.setActive(change.currentValue);
          break;
        case 'wolProperties':
          this.instance.setProperties(change.currentValue ?? {});
          break;
        case 'wolFormatConstructors':
          this.instance['formats_'] = change.currentValue;
          this.instance.changed();
          break;
      }
    }
  }

  /**
   * Get the underlying OpenLayers DragAndDrop control instance.
   * @returns The DragAndDrop control instance
   */
  getInstance(): DragAndDrop | undefined {
    return this.instance;
  }
}
