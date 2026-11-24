import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnChanges,
  SimpleChanges,
  ViewEncapsulation,
  afterNextRender,
  inject,
  input,
  model,
  output,
} from '@angular/core';

import Collection from 'ol/Collection';
import Map from 'ol/Map';
import MapBrowserEvent from 'ol/MapBrowserEvent';
import MapEvent from 'ol/MapEvent';
import { ObjectEvent } from 'ol/Object';
import { unByKey } from 'ol/Observable';
import Overlay from 'ol/Overlay';
import View, { ViewOptions } from 'ol/View';
import Control from 'ol/control/Control';
import { EventsKey } from 'ol/events';
import BaseEvent from 'ol/events/Event';
import Interaction from 'ol/interaction/Interaction';
import BaseLayer from 'ol/layer/Base';
import LayerGroup from 'ol/layer/Group';
import RenderEvent from 'ol/render/Event';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';

/**
 * Wraps an OpenLayers [Map](https://openlayers.org/en/latest/apidoc/module-ol_Map-Map.html) instance, the core
 * component of OpenLayers responsible for rendering a view, a set of layers, and any controls, interactions
 * and overlays into a target container.
 *
 * @example
 * ```html
 * <wol-map [wolView]="view" [wolLayers]="layers"></wol-map>
 * ```
 *
 * @see https://openlayers.org/en/latest/apidoc/module-ol_Map-Map.html
 */
@Component({
  selector: 'wol-map',
  imports: [],
  template: `<ng-content />`,
  styles: ``,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.position]': `'relative'`,
    '[style.display]': `'block'`,
  },
})
export class WolMapComponent implements OnChanges {
  /**
   * Controls for the map. OpenLayers supplies its default controls when omitted.
   *
   * @remarks The component reads this option when creating the OpenLayers instance.
   */
  readonly wolControls = input<Collection<Control> | Control[]>();

  /**
   * Ratio of physical pixels to CSS pixels. OpenLayers defaults to the device pixel ratio. Assign a
   * new number to update the existing map.
   */
  readonly wolPixelRatio = input<number>();

  /**
   * Map interactions. OpenLayers supplies its default interactions when omitted.
   *
   * @remarks The component reads this option when creating the OpenLayers instance.
   */
  readonly wolInteractions = input<Collection<Interaction> | Interaction[]>();

  /**
   * Element, element ID, or document on which the map listens for keyboard events. The map target
   * is used by default. For an element target, set `tabindex` so it can receive focus.
   *
   * @remarks The component reads this option when creating the OpenLayers instance.
   */
  readonly wolKeyboardEventTarget = input<HTMLElement | Document | string>();

  /**
   * Layers in the map as an array, collection, or `LayerGroup`. Updating this binding replaces the
   * map layers or the layer group. Layers with the same z-index are drawn in collection order.
   */
  readonly wolLayers = input<BaseLayer[] | Collection<BaseLayer> | LayerGroup>();

  /**
   * Maximum number of tiles the map loads at once. Defaults to `16`.
   *
   * @remarks The component reads this option when creating the OpenLayers instance.
   */
  readonly wolMaxTilesLoading = input<number>();

  /**
   * Pointer movement threshold in CSS pixels for distinguishing a drag from a click. Defaults to
   * `1`.
   *
   * @remarks The component reads this option when creating the OpenLayers instance.
   */
  readonly wolMoveTolerance = input<number>();

  /**
   * Overlays for the map. Defaults to an empty collection.
   *
   * @remarks The component reads this option when creating the OpenLayers instance.
   */
  readonly wolOverlays = input<Collection<Overlay> | Overlay[]>();

  /**
   * Map container element or its ID. It defaults to the `wol-map` host element at creation.
   * Updating this model sets the target, and OpenLayers target changes are reflected in the model.
   */
  readonly wolTarget = model<HTMLElement | string>();

  /**
   * Map view, or a promise that supplies `ViewOptions`. Updating this model sets the view, and
   * OpenLayers view changes are reflected in the model. A view with a center and resolution is
   * needed to request layer data.
   */
  readonly wolView = model<View | Promise<ViewOptions>>();

  /**
   * Additional properties that will be set to the map instance.
   */
  readonly wolProperties = input<WolProperties>();

  /**
   * Generic change event. Triggered when the revision counter is increased.
   */
  readonly wolChange = output<BaseEvent>();

  /**
   * Triggered when the map's layer group changes.
   */
  readonly wolLayerGroupChange = output<ObjectEvent>();

  /**
   * Triggered when the map's size changes.
   */
  readonly wolSizeChange = output<ObjectEvent>();

  /**
   * A click with no dragging. A double click will fire two of this event.
   */
  readonly wolClick = output<MapBrowserEvent<PointerEvent>>();

  /**
   * A true double click, with no dragging.
   */
  readonly wolDblclick = output<MapBrowserEvent<PointerEvent>>();

  /**
   * Generic error event. Triggered when an error occurs.
   */
  readonly wolError = output<BaseEvent>();

  /**
   * Triggered when loading of additional map data has completed.
   */
  readonly wolLoadEnd = output<MapEvent>();

  /**
   * Triggered when loading of additional map data (tiles, images, features) starts.
   */
  readonly wolLoadStart = output<MapEvent>();

  /**
   * Triggered after the map is moved.
   */
  readonly wolMoveEnd = output<MapEvent>();

  /**
   * Triggered when the map starts moving.
   */
  readonly wolMoveStart = output<MapEvent>();

  /**
   * Triggered when a pointer is dragged.
   */
  readonly wolPointerDrag = output<MapBrowserEvent<PointerEvent>>();

  /**
   * Triggered when a pointer is moved. Note that on touch devices this is triggered when the map
   * is panned, so it is not the same as `mousemove`.
   */
  readonly wolPointerMove = output<MapBrowserEvent<PointerEvent>>();

  /**
   * Emits the map-level render event after the layers are composited. The event has `context` set
   * to `undefined`.
   */
  readonly wolPostCompose = output<RenderEvent>();

  /**
   * Triggered after a map frame is rendered.
   */
  readonly wolPostRender = output<MapEvent>();

  /**
   * Emits the map-level render event before the layers are composited. The event has `context` set
   * to `undefined`.
   */
  readonly wolPreCompose = output<RenderEvent>();

  /**
   * Triggered when a property of the map is changed.
   */
  readonly wolPropertyChange = output<ObjectEvent>();

  /**
   * Triggered when rendering is complete, i.e. all sources and tiles have finished loading for
   * the current viewport, and all tiles are faded in.
   */
  readonly wolRenderComplete = output<RenderEvent>();

  /**
   * A true single click with no dragging and no double click. Note that this event is delayed by
   * 250 ms to ensure that it is not a double click.
   */
  readonly wolSingleClick = output<MapBrowserEvent<PointerEvent>>();

  private instance?: Map;

  /**
   * @internal
   */
  constructor() {
    const destroyRef = inject(DestroyRef);
    const elementRef: ElementRef<HTMLElement> = inject(ElementRef);
    const eventsKey: Record<string, EventsKey> = {};

    afterNextRender(() => {
      const map = new Map({
        controls: this.wolControls(),
        pixelRatio: this.wolPixelRatio(),
        interactions: this.wolInteractions(),
        keyboardEventTarget: this.wolKeyboardEventTarget(),
        layers: this.wolLayers(),
        maxTilesLoading: this.wolMaxTilesLoading(),
        moveTolerance: this.wolMoveTolerance(),
        overlays: this.wolOverlays(),
        target: this.wolTarget() ?? elementRef.nativeElement,
        view: this.wolView(),
      });

      if (this.wolProperties()) {
        map.setProperties(this.wolProperties() ?? {}, true);
      }

      eventsKey['change'] = map.on('change', (event) => this.wolChange.emit(event));

      eventsKey['change:layergroup'] = map.on('change:layergroup', (event) =>
        this.wolLayerGroupChange.emit(event),
      );

      eventsKey['change:size'] = map.on('change:size', (event) => this.wolSizeChange.emit(event));

      eventsKey['change:target'] = map.on('change:target', () =>
        this.wolTarget.set(this.instance?.getTarget()),
      );

      eventsKey['change:view'] = map.on('change:view', () =>
        this.wolView.set(this.instance?.getView()),
      );

      eventsKey['click'] = map.on('click', (event) =>
        this.wolClick.emit(event as MapBrowserEvent<PointerEvent>),
      );

      eventsKey['dblclick'] = map.on('dblclick', (event) =>
        this.wolDblclick.emit(event as MapBrowserEvent<PointerEvent>),
      );

      eventsKey['error'] = map.on('error', (event) => this.wolError.emit(event));

      eventsKey['loadend'] = map.on('loadend', (event) => this.wolLoadEnd.emit(event));

      eventsKey['loadstart'] = map.on('loadstart', (event) => this.wolLoadStart.emit(event));

      eventsKey['moveend'] = map.on('moveend', (event) => this.wolMoveEnd.emit(event));

      eventsKey['movestart'] = map.on('movestart', (event) => this.wolMoveStart.emit(event));

      eventsKey['pointerdrag'] = map.on('pointerdrag', (event) =>
        this.wolPointerDrag.emit(event as MapBrowserEvent<PointerEvent>),
      );

      eventsKey['pointermove'] = map.on('pointermove', (event) =>
        this.wolPointerMove.emit(event as MapBrowserEvent<PointerEvent>),
      );

      eventsKey['postcompose'] = map.on('postcompose', (event) => this.wolPostCompose.emit(event));

      eventsKey['postrender'] = map.on('postrender', (event) => this.wolPostRender.emit(event));

      eventsKey['precompose'] = map.on('precompose', (event) => this.wolPreCompose.emit(event));

      eventsKey['propertychange'] = map.on('propertychange', (event) =>
        this.wolPropertyChange.emit(event),
      );

      eventsKey['rendercomplete'] = map.on('rendercomplete', (event) =>
        this.wolRenderComplete.emit(event),
      );

      eventsKey['singleclick'] = map.on('singleclick', (event) =>
        this.wolSingleClick.emit(event as MapBrowserEvent<PointerEvent>),
      );

      this.instance = map;
    });

    destroyRef.onDestroy(() => {
      unByKey(Object.values(eventsKey));
      this.instance?.dispose();
      this.instance = undefined;
    });
  }

  /**
   * Respond to input changes.
   * @param changes The changes object containing the changed inputs.
   * @internal
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (!this.instance) {
      return;
    }

    for (const [key, change] of Object.entries(changes)) {
      switch (key) {
        case 'wolLayers':
          if (change.currentValue instanceof LayerGroup) {
            this.instance.setLayerGroup(change.currentValue);
          } else {
            this.instance.setLayers(change.currentValue);
          }
          break;
        case 'wolProperties':
          this.instance.setProperties(change.currentValue ?? {}, false);
          break;
        case 'wolTarget':
          this.instance.setTarget(change.currentValue);
          break;
        case 'wolView':
          this.instance.setView(change.currentValue ?? null);
          break;
        case 'wolPixelRatio':
          if (typeof change.currentValue === 'number') {
            this.instance.setPixelRatio(change.currentValue);
          }
          break;
      }
    }
  }

  /**
   * Get the OpenLayers map instance.
   * @returns The OpenLayers map instance or undefined if not created.
   * @internal
   */
  getInstance(): Map | undefined {
    return this.instance;
  }
}
