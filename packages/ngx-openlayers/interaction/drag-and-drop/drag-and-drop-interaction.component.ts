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

/**
 * Reads vector features from files dropped on the map or a custom drop target. See
 * [OpenLayers DragAndDrop](https://openlayers.org/en/latest/apidoc/module-ol_interaction_DragAndDrop-DragAndDrop.html).
 */
@Component({
  selector: 'wol-drag-and-drop-interaction',
  exportAs: 'wolDragAndDropInteraction',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolDragAndDropInteractionComponent implements OnChanges {
  /**
   * Whether the interaction handles events. Defaults to `true`. This model updates the
   * interaction and reflects active-state changes from OpenLayers.
   */
  readonly wolActive = model(true);
  /**
   * Format constructors or configured format instances to try, in order. Configure at creation so
   * OpenLayers instantiates constructors and chooses the file-reading mode. To update the list
   * later, pass format instances compatible with the initial reading mode.
   */
  readonly wolFormatConstructors = input<(FeatureFormat | typeof FeatureFormat)[]>();
  /**
   * Optional destination source. A drop that yields features clears the source and adds the new
   * features. To append, omit this input and add features from `wolAddFeatures` in your handler.
   * Read at creation.
   */
  readonly wolSource = input<VectorSource>();
  /**
   * Projection used for imported features. Defaults to the configured user projection, or the
   * view projection when no user projection is set. Read at creation.
   */
  readonly wolProjection = input<ProjectionLike>();
  /**
   * HTML element that receives file drops. Defaults to the map viewport. Read at creation.
   */
  readonly wolTarget = input<HTMLElement>();
  /**
   * Observable properties to set on the OpenLayers instance. Updates assign the supplied keys and
   * leave other properties in place.
   */
  readonly wolProperties = input<WolProperties>();

  /**
   * Emits after a file yields features. The event carries the file, the parsed features, and
   * their projection.
   */
  readonly wolAddFeatures = output<DragAndDropEvent>();
  /**
   * Emits the native `change` event when the instance revision increases.
   */
  readonly wolChange = output<BaseEvent>();
  /**
   * Emits the native `error` event when the OpenLayers instance dispatches one.
   */
  readonly wolError = output<BaseEvent>();
  /**
   * Emits the native `propertychange` event with the changed property key and its previous value.
   */
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
   * Accesses the OpenLayers DragAndDrop interaction.
   *
   * @returns The underlying instance, or `undefined` before creation and after component
   * teardown.
   */
  getInstance(): DragAndDrop | undefined {
    return this.instance;
  }
}
