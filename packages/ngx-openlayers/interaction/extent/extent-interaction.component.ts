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

@Component({
  selector: 'wol-extent-interaction',
  exportAs: 'wolExtentInteraction',
  template: '<ng-content />',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolExtentInteractionComponent implements OnChanges {
  readonly wolActive = model(true);
  readonly wolCondition = input<Condition>();
  readonly wolExtent = model<Extent>();
  readonly wolBoxStyle = input<StyleLike>();
  readonly wolPixelTolerance = input<number>();
  readonly wolPointerStyle = input<StyleLike>();
  readonly wolWrapX = input<boolean>();
  readonly wolProperties = input<WolProperties>();

  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
  readonly wolPropertyChange = output<ObjectEvent>();

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
   * Get the underlying OpenLayers Extent interaction instance.
   * @returns The Extent interaction instance
   */
  getInstance(): ExtentInteraction | undefined {
    return this.extentInstance();
  }
}
