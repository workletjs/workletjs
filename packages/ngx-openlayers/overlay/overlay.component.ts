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
   * Overlay identifier for lookup with [Map.getOverlayById](https://openlayers.org/en/latest/apidoc/module-ol_Map-Map.html#getOverlayById).
   *
   * @remarks The component reads this option when creating the OpenLayers instance.
   */
  readonly wolId = input<number | string>();

  /**
   * Element that holds the overlay content. At creation the component defaults to a new `div`. This
   * model updates the native overlay element and reflects element changes from OpenLayers.
   */
  readonly wolElement = model<HTMLElement>();

  /**
   * Pixel offset as `[horizontal, vertical]`, defaulting to `[0, 0]`. Positive values move the
   * overlay right and down. This model tracks offset changes in both directions.
   */
  readonly wolOffset = model<number[]>();

  /**
   * Map coordinate to which the overlay is anchored. Use the configured user projection when set,
   * or the view projection otherwise. Setting this model to `undefined` hides the overlay.
   * Native position changes are reflected in the model.
   */
  readonly wolPosition = model<Coordinate>();

  /**
   * Anchor alignment relative to `wolPosition`. Combine `top`, `center` or `bottom` with
   * `left`, `center` or `right`, as in the default `top-left`. The model reflects native
   * positioning changes and sets the alignment when updated.
   */
  readonly wolPositioning = model<Positioning>();

  /**
   * When `true`, stops overlay events from reaching the map viewport and mounts the overlay beside
   * the controls in `ol-overlaycontainer-stopevent`. When `false`, mounts the overlay in
   * `ol-overlaycontainer`. Defaults to `true`.
   *
   * @remarks The component reads this option when creating the OpenLayers instance.
   */
  readonly wolStopEvent = input<boolean>();

  /**
   * Inserts the overlay at the start of its map container when `true`, or appends it when `false`.
   * Defaults to `true`, which places it below controls in the shared container.
   *
   * @remarks The component reads this option when creating the OpenLayers instance.
   */
  readonly wolInsertFirst = input<boolean>();

  /**
   * Pans the map to bring the overlay into view when its position is set. Pass `true` or pan
   * options to enable it. Defaults to `false`.
   *
   * @remarks The component reads this option when creating the OpenLayers instance.
   */
  readonly wolAutoPan = input<PanIntoViewOptions | boolean>();

  /**
   * CSS classes on this overlay’s outer element. Defaults to `ol-overlay-container ol-selectable`.
   *
   * @remarks The component reads this option when creating the OpenLayers instance.
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
   * Gets the OpenLayers `Overlay` instance managed by the component.
   *
   * @returns The `Overlay` instance, or `undefined` before creation and after destruction.
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
