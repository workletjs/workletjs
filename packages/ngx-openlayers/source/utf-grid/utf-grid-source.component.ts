import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  OnChanges,
  output,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { DisposeRef, useTileSourceHostRef } from '@workletjs/ngx-openlayers/source/tile';
import { NearestDirectionFunction } from 'ol/array';
import { EventsKey } from 'ol/events';
import { ObjectEvent } from 'ol/Object';
import { unByKey } from 'ol/Observable';
import { AttributionLike } from 'ol/source/Source';
import { Config } from 'ol/source/TileJSON';
import BaseEvent from 'ol/events/Event';
import UTFGrid from 'ol/source/UTFGrid';

@Component({
  selector: 'wol-utf-grid-source',
  exportAs: 'wolUTFGridSource',
  template: `<ng-content />`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolUTFGridSourceComponent implements OnChanges {
  readonly wolAttributions = input<AttributionLike>();
  readonly wolPreemptive = input<boolean>();
  readonly wolJsonp = input<boolean>();
  readonly wolTileJSON = input<Config>();
  readonly wolUrl = input<string>();
  readonly wolWrapX = input<boolean>();
  readonly wolZDirection = input<number | NearestDirectionFunction>();
  readonly wolProperties = input<WolProperties>();

  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
  readonly wolPropertyChange = output<ObjectEvent>();

  private instance?: UTFGrid;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const hostRef = useTileSourceHostRef<UTFGrid>('UTFGridSource');
    const eventsKey: Record<string, EventsKey> = {};

    let disposeRef: DisposeRef;

    afterNextRender(() => {
      const utfGrid = new UTFGrid({
        preemptive: this.wolPreemptive(),
        jsonp: this.wolJsonp(),
        tileJSON: this.wolTileJSON(),
        url: this.wolUrl(),
        wrapX: this.wolWrapX(),
        zDirection: this.wolZDirection(),
      });

      if (this.wolAttributions()) {
        utfGrid.setAttributions(this.wolAttributions());
      }

      if (this.wolProperties()) {
        utfGrid.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKey['change'] = utfGrid.on('change', (event) => this.wolChange.emit(event));

      eventsKey['error'] = utfGrid.on('error', (event) => this.wolError.emit(event));

      eventsKey['propertychange'] = utfGrid.on('propertychange', (event) =>
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
        disposeRef = hostRef.setSource(utfGrid);
      });

      this.instance = utfGrid;
    });

    destroyRef.onDestroy(() => {
      unByKey(Object.values(eventsKey));
      disposeRef && disposeRef();
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
      }
    }
  }

  /**
   * Get the underlying OpenLayers UTFGrid instance.
   * @returns The UTFGrid instance
   */
  getInstance(): UTFGrid | undefined {
    return this.instance;
  }
}
