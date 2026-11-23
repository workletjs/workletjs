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

import { ObjectEvent } from 'ol/Object';
import { unByKey } from 'ol/Observable';
import { EventsKey } from 'ol/events';
import BaseEvent from 'ol/events/Event';
import { Condition } from 'ol/events/condition';
import { Extent } from 'ol/extent';
import ExtentInteraction from 'ol/interaction/Extent';
import { StyleLike } from 'ol/style/Style';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { useInteractionHostRef } from '@workletjs/ngx-openlayers/interaction/interaction';

/**
 * Draws and edits a rectangular extent and synchronizes it with a template binding. See
 * [OpenLayers Extent](https://openlayers.org/en/latest/apidoc/module-ol_interaction_Extent-Extent.html).
 */
@Component({
  selector: 'wol-extent-interaction',
  exportAs: 'wolExtentInteraction',
  template: '<ng-content />',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolExtentInteractionComponent implements OnChanges {
  /**
   * Whether the interaction handles events. Defaults to `true`. This model updates the
   * interaction and reflects active-state changes from OpenLayers.
   */
  readonly wolActive = model(true);
  /**
   * Predicate for map browser events used to draw or edit the extent. By default, every otherwise
   * eligible event is accepted. Read at creation.
   */
  readonly wolCondition = input<Condition>();
  /**
   * Initial or externally supplied extent in the view projection. This model also reports the
   * drawn extent in the configured user projection, or the view projection by default. OpenLayers
   * reports a cleared extent as `null`.
   */
  readonly wolExtent = model<Extent>();
  /**
   * Style for the extent rectangle. Defaults to the OpenLayers polygon editing style. Read at
   * creation.
   */
  readonly wolBoxStyle = input<StyleLike>();
  /**
   * Maximum pointer distance in pixels for editing a nearby extent edge or vertex. Defaults to
   * `10`. Read at creation.
   */
  readonly wolPixelTolerance = input<number>();
  /**
   * Style for the edit handle. Defaults to the OpenLayers point editing style. Read at creation.
   */
  readonly wolPointerStyle = input<StyleLike>();
  /**
   * Whether the drawn rectangle is displayed across world copies. Defaults to `false` and affects
   * rendering only. Read at creation.
   */
  readonly wolWrapX = input<boolean>();
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
   * Signal for the OpenLayers Extent instance. Its value is `undefined` before creation and after
   * component teardown.
   */
  readonly extentInstance = signal<ExtentInteraction | undefined>(undefined);

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useInteractionHostRef<ExtentInteraction>('Extent');
    const eventsKeyMap: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const extentInteraction = new ExtentInteraction({
        condition: this.wolCondition(),
        extent: this.wolExtent(),
        boxStyle: this.wolBoxStyle(),
        pixelTolerance: this.wolPixelTolerance(),
        pointerStyle: this.wolPointerStyle(),
        wrapX: this.wolWrapX(),
      });

      extentInteraction.setActive(this.wolActive());

      if (this.wolProperties()) {
        extentInteraction.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKeyMap['change'] = extentInteraction.on('change', (event) =>
        this.wolChange.emit(event),
      );

      eventsKeyMap['change:active'] = extentInteraction.on('change:active', () =>
        this.wolActive.set(extentInteraction.getActive()),
      );

      eventsKeyMap['error'] = extentInteraction.on('error', (event) => this.wolError.emit(event));

      eventsKeyMap['extentchanged'] = extentInteraction.on('extentchanged', () =>
        this.wolExtent.set(extentInteraction.getExtent()),
      );

      eventsKeyMap['propertychange'] = extentInteraction.on('propertychange', (event) =>
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
        hostRef.addInteraction(extentInteraction);
      });

      this.extentInstance.set(extentInteraction);
    });

    destroyRef.onDestroy(() => {
      const extentInteraction = this.extentInstance();
      if (extentInteraction) {
        unByKey(Object.values(eventsKeyMap));
        hostRef.removeInteraction(extentInteraction);
        extentInteraction.dispose();
        this.extentInstance.set(undefined);
      }
    });
  }

  /**
   * Respond to input changes.
   * @param changes The changed inputs
   * @internal
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (!this.extentInstance()) {
      return;
    }

    for (const [key, change] of Object.entries(changes)) {
      switch (key) {
        case 'wolActive':
          this.extentInstance()?.setActive(change.currentValue);
          break;
        case 'wolExtent':
          this.extentInstance()?.setExtent(change.currentValue);
          break;
        case 'wolProperties':
          this.extentInstance()?.setProperties(change.currentValue ?? {});
          break;
      }
    }
  }

  /**
   * Accesses the OpenLayers Extent interaction.
   *
   * @returns The underlying instance, or `undefined` before creation and after component
   * teardown.
   */
  getInstance(): ExtentInteraction | undefined {
    return this.extentInstance();
  }
}
