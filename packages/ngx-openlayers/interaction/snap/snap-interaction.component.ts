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
  signal,
} from '@angular/core';

import Collection from 'ol/Collection';
import Feature from 'ol/Feature';
import { ObjectEvent } from 'ol/Object';
import { unByKey } from 'ol/Observable';
import { EventsKey } from 'ol/events';
import BaseEvent from 'ol/events/Event';
import { SnapEvent } from 'ol/events/SnapEvent';
import Snap, { Segmenters } from 'ol/interaction/Snap';
import VectorSource from 'ol/source/Vector';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { useInteractionHostRef } from '@workletjs/ngx-openlayers/interaction/interaction';

/**
 * Adjusts pointer coordinates near vector features so editing interactions can snap to them. See
 * [OpenLayers Snap](https://openlayers.org/en/latest/apidoc/module-ol_interaction_Snap-Snap.html).
 */
@Component({
  selector: 'wol-snap-interaction',
  exportAs: 'wolSnapInteraction',
  template: '<ng-content />',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolSnapInteractionComponent implements OnChanges {
  /**
   * Whether the interaction handles events. Defaults to `true`. This model updates the
   * interaction and reflects active-state changes from OpenLayers.
   */
  readonly wolActive = model(true);
  /**
   * Collection whose features supply snapping targets. Takes precedence over `wolSource` when
   * both are bound. Read at creation.
   */
  readonly wolFeatures = input<Collection<Feature>>();
  /**
   * Vector source whose features supply snapping targets when `wolFeatures` is omitted. Bind
   * either the collection or the source to supply targets. Read at creation.
   */
  readonly wolSource = input<VectorSource>();
  /**
   * Whether to snap to edges. Defaults to `true`. Read at creation.
   */
  readonly wolEdge = input<boolean>();
  /**
   * Whether to snap to vertices. Defaults to `true`. Read at creation.
   */
  readonly wolVertex = input<boolean>();
  /**
   * Whether to snap to intersections of segments. Defaults to `false`. Read at creation.
   */
  readonly wolIntersection = input<boolean>();
  /**
   * Maximum pointer distance in pixels for snapping to a target. Defaults to `10`. Read at
   * creation.
   */
  readonly wolPixelTolerance = input<number>();
  /**
   * Overrides how geometries are broken into snapping segments, keyed by geometry type.
   * OpenLayers keeps its default segmenters for types absent from the map. Read at creation.
   */
  readonly wolSegmenters = input<Segmenters>();
  /**
   * Observable properties to set on the OpenLayers instance. Updates assign the supplied keys and
   * leave other properties in place.
   */
  readonly wolProperties = input<WolProperties>();

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
  /**
   * Emits when the pointer snaps. The event carries the feature and snapped position, with the
   * segment when applicable.
   */
  readonly wolSnap = output<SnapEvent>();
  /**
   * Emits when the pointer leaves a snapping target or changes to another target. The event
   * describes the previous snapped position.
   */
  readonly wolUnsnap = output<SnapEvent>();

  /**
   * Signal for the OpenLayers Snap instance. Its value is `undefined` before creation and after
   * component teardown.
   */
  readonly snapInstance = signal<Snap | undefined>(undefined);

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useInteractionHostRef<Snap>('Snap');
    const eventsKeyMap: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const snap = new Snap({
        features: this.wolFeatures(),
        source: this.wolSource(),
        edge: this.wolEdge(),
        vertex: this.wolVertex(),
        intersection: this.wolIntersection(),
        pixelTolerance: this.wolPixelTolerance(),
        segmenters: this.wolSegmenters(),
      });

      snap.setActive(this.wolActive());

      if (this.wolProperties()) {
        snap.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKeyMap['change'] = snap.on('change', (event) => this.wolChange.emit(event));

      eventsKeyMap['change:active'] = snap.on('change:active', () =>
        this.wolActive.set(snap.getActive()),
      );

      eventsKeyMap['error'] = snap.on('error', (event) => this.wolError.emit(event));

      eventsKeyMap['propertychange'] = snap.on('propertychange', (event) =>
        this.wolPropertyChange.emit(event),
      );

      eventsKeyMap['snap'] = snap.on('snap', (event) => this.wolSnap.emit(event));

      eventsKeyMap['unsnap'] = snap.on('unsnap', (event) => this.wolUnsnap.emit(event));

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
        hostRef.addInteraction(snap);
      });

      this.snapInstance.set(snap);
    });

    destroyRef.onDestroy(() => {
      const snapInstance = this.snapInstance();
      if (snapInstance) {
        unByKey(Object.values(eventsKeyMap));
        hostRef.removeInteraction(snapInstance);
        snapInstance.dispose();
        this.snapInstance.set(undefined);
      }
    });
  }

  /**
   * Respond to input changes.
   * @param changes The changed inputs
   * @internal
   */
  ngOnChanges(changes: SimpleChanges): void {
    const snapInstance = this.snapInstance();

    if (!snapInstance) {
      return;
    }

    for (const [key, change] of Object.entries(changes)) {
      switch (key) {
        case 'wolActive':
          snapInstance.setActive(change.currentValue);
          break;
        case 'wolProperties':
          snapInstance.setProperties(change.currentValue ?? {});
          break;
      }
    }
  }

  /**
   * Accesses the OpenLayers Snap interaction.
   *
   * @returns The underlying instance, or `undefined` before creation and after component
   * teardown.
   */
  getInstance(): Snap | undefined {
    return this.snapInstance();
  }
}
