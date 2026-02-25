import { DomPortalOutlet, PortalModule, TemplatePortal } from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnChanges,
  SimpleChanges,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
  afterNextRender,
  inject,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';

import { ObjectEvent } from 'ol/Object';
import { unByKey } from 'ol/Observable';
import Overlay, { PanIntoViewOptions, Positioning } from 'ol/Overlay';
import { Coordinate } from 'ol/coordinate';
import { EventsKey } from 'ol/events';
import BaseEvent from 'ol/events/Event';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';

@Component({
  selector: 'wol-overlay',
  exportAs: 'wolOverlay',
  imports: [PortalModule],
  template: `
    <ng-template #content>
      <ng-content />
    </ng-template>
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WolOverlayComponent implements OnChanges {
  readonly wolId = input<number | string>();
  readonly wolElement = model<HTMLElement>();
  readonly wolOffset = model<number[]>();
  readonly wolPosition = model<Coordinate>();
  readonly wolPositioning = model<Positioning>();
  readonly wolStopEvent = input<boolean>();
  readonly wolInsertFirst = input<boolean>();
  readonly wolAutoPan = input<PanIntoViewOptions | boolean>();
  readonly wolClassName = input<string>();
  readonly wolProperties = input<WolProperties>();

  readonly wolChange = output<BaseEvent>();
  readonly wolError = output<BaseEvent>();
  readonly wolPropertyChange = output<ObjectEvent>();

  private instance?: Overlay;

  private overlayContent = viewChild.required<TemplateRef<void>>('content');
  private overlayPortal?: TemplatePortal;
  private overlayPortalOutlet?: DomPortalOutlet;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const viewContainerRef = inject(ViewContainerRef);
    const hostRef = inject(WolMapComponent, { host: true });
    const eventsKey: Record<string, EventsKey> = {};

    if (!hostRef) {
      throw new Error('Overlay component must be used within a Map component.');
    }

    afterNextRender(() => {
      const overlay = new Overlay({
        id: this.wolId(),
        element: this.wolElement() ?? document.createElement('div'),
        offset: this.wolOffset(),
        position: this.wolPosition(),
        positioning: this.wolPositioning(),
        stopEvent: this.wolStopEvent(),
        insertFirst: this.wolInsertFirst(),
        autoPan: this.wolAutoPan(),
        className: this.wolClassName(),
      });

      if (this.wolProperties()) {
        overlay.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKey['change'] = overlay.on('change', (event) => this.wolChange.emit(event));

      eventsKey['change:element'] = overlay.on('change:element', () =>
        this.wolElement.set(overlay.getElement()),
      );

      eventsKey['change:offset'] = overlay.on('change:offset', () =>
        this.wolOffset.set(overlay.getOffset()),
      );

      eventsKey['change:position'] = overlay.on('change:position', () =>
        this.wolPosition.set(overlay.getPosition()),
      );

      eventsKey['change:positioning'] = overlay.on('change:positioning', () =>
        this.wolPositioning.set(overlay.getPositioning()),
      );

      eventsKey['error'] = overlay.on('error', (event) => this.wolError.emit(event));

      eventsKey['propertychange'] = overlay.on('propertychange', (event) =>
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
        hostRef.getInstance()?.addOverlay(overlay);
      });

      this.instance = overlay;
      this.overlayPortal = new TemplatePortal(this.overlayContent(), viewContainerRef);
      this.attachOverlayPortal();
    });

    destroyRef.onDestroy(() => {
      this.overlayPortalOutlet?.dispose();
      if (this.instance) {
        unByKey(Object.values(eventsKey));
        hostRef.getInstance()?.removeOverlay(this.instance);
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
        case 'wolElement':
          this.instance.setElement(change.currentValue);
          this.attachOverlayPortal();
          break;
        case 'wolOffset':
          this.instance.setOffset(change.currentValue);
          break;
        case 'wolPosition':
          this.instance.setPosition(change.currentValue);
          break;
        case 'wolPositioning':
          this.instance.setPositioning(change.currentValue);
          break;
        case 'wolProperties':
          this.instance.setProperties(change.currentValue ?? {});
          break;
      }
    }
  }

  /**
   * Get the underlying OpenLayers Overlay instance.
   * @returns The OpenLayers Overlay instance
   */
  getInstance(): Overlay | undefined {
    return this.instance;
  }

  /**
   * Attaches the configured overlay portal to the element returned by the current instance,
   * disposing any previously attached portal outlet before creating a new one.
   */
  private attachOverlayPortal(): void {
    const element = this.instance?.getElement();

    this.overlayPortalOutlet?.dispose();
    this.overlayPortalOutlet = undefined;

    if (element && this.overlayPortal) {
      this.overlayPortalOutlet = new DomPortalOutlet(element);
      this.overlayPortalOutlet?.attachTemplatePortal(this.overlayPortal);
    }
  }
}
