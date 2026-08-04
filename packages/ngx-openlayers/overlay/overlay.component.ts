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

/**
 * Wraps an OpenLayers [Overlay](https://openlayers.org/en/latest/apidoc/module-ol_Overlay-Overlay.html)
 * instance, an element displayed over the map and anchored to a single map location. Unlike a control, an
 * overlay is tied to a geographical coordinate, so panning the map moves the overlay. The projected content
 * is rendered inside the overlay's element.
 *
 * @example
 * ```html
 * <wol-map>
 *   <wol-overlay [wolPosition]="position">
 *     <div class="popup">Popup content</div>
 *   </wol-overlay>
 * </wol-map>
 * ```
 *
 * @see https://openlayers.org/en/latest/apidoc/module-ol_Overlay-Overlay.html
 */
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
  /**
   * The overlay id. The overlay id can be used with the
   * [getOverlayById](https://openlayers.org/en/latest/apidoc/module-ol_Map-Map.html#getOverlayById) method.
   */
  readonly wolId = input<number | string>();

  /**
   * The overlay element. Defaults to a newly created `div` element when not provided.
   */
  readonly wolElement = model<HTMLElement>();

  /**
   * Offsets in pixels used when positioning the overlay, as `[horizontal, vertical]`. A positive
   * horizontal value shifts the overlay right; a positive vertical value shifts it down. Defaults
   * to `[0, 0]`.
   */
  readonly wolOffset = model<number[]>();

  /**
   * The overlay position, in map projection. Setting this to `undefined` hides the overlay.
   */
  readonly wolPosition = model<Coordinate>();

  /**
   * Defines how the overlay is positioned relative to its `wolPosition`. Possible values are
   * `'bottom-left'`, `'bottom-center'`, `'bottom-right'`, `'center-left'`, `'center-center'`,
   * `'center-right'`, `'top-left'`, `'top-center'`, and `'top-right'`. Defaults to `'top-left'`.
   */
  readonly wolPositioning = model<Positioning>();

  /**
   * Whether event propagation to the map viewport should be stopped. If `true`, the overlay is
   * placed in the same container as the controls (CSS class `ol-overlaycontainer-stopevent`); if
   * `false`, it is placed in the container with the CSS class specified by `wolClassName`.
   * Defaults to `true`.
   */
  readonly wolStopEvent = input<boolean>();

  /**
   * Whether the overlay is inserted first in the overlay container, or appended. If placed in the
   * same container as the controls (see `wolStopEvent`), set this to `true` so the overlay is
   * displayed below the controls. Defaults to `true`.
   */
  readonly wolInsertFirst = input<boolean>();

  /**
   * Pan the map when the overlay position is set, so that the overlay is entirely visible in the
   * current viewport. Defaults to `false`.
   */
  readonly wolAutoPan = input<PanIntoViewOptions | boolean>();

  /**
   * CSS class name for the overlay container. Defaults to `'ol-overlay-container ol-selectable'`.
   */
  readonly wolClassName = input<string>();

  /**
   * Additional properties that will be set to the overlay instance.
   */
  readonly wolProperties = input<WolProperties>();

  /**
   * Generic change event. Triggered when the revision counter is increased.
   */
  readonly wolChange = output<BaseEvent>();

  /**
   * Generic error event. Triggered when an error occurs.
   */
  readonly wolError = output<BaseEvent>();

  /**
   * Triggered when a property of the overlay is changed.
   */
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
