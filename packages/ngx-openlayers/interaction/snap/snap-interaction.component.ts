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
  signal,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { useInteractionHostRef } from '@workletjs/ngx-openlayers/interaction/interaction';
import { EventsKey } from 'ol/events';
import { SnapEvent } from 'ol/events/SnapEvent';
import { ObjectEvent } from 'ol/Object';
import { unByKey } from 'ol/Observable';
import BaseEvent from 'ol/events/Event';
import Collection from 'ol/Collection';
import Feature from 'ol/Feature';
import VectorSource from 'ol/source/Vector';
import Snap, { Segmenters } from 'ol/interaction/Snap';

@Component({
  selector: 'wol-snap-interaction',
  exportAs: 'wolSnapInteraction',
  template: '<ng-content />',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolSnapInteractionComponent implements OnChanges {
  readonly wolActive = model(true);
  readonly wolFeatures = input<Collection<Feature>>();
  readonly wolSource = input<VectorSource>();
  readonly wolEdge = input<boolean>();
  readonly wolVertex = input<boolean>();
  readonly wolIntersection = input<boolean>();
  readonly wolPixelTolerance = input<number>();
  readonly wolSegmenters = input<Segmenters>();
  readonly wolProperties = input<WolProperties>();

  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
  readonly wolPropertyChange = output<ObjectEvent>();
  readonly wolSnap = output<SnapEvent>();
  readonly wolUnsnap = output<SnapEvent>();

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
   * Get the underlying OpenLayers Snap interaction instance.
   * @returns The Snap interaction instance
   */
  getInstance(): Snap | undefined {
    return this.snapInstance();
  }
}
