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
   * Controls initially added to the map. If not specified, the default controls are used. In a
   * worker, no controls are added by default.
   */
  readonly wolControls = input<Collection<Control> | Control[]>();

  /**
   * The ratio between physical pixels and device-independent pixels (dips) on the device.
   * Defaults to `window.devicePixelRatio`.
   */
  readonly wolPixelRatio = input<number>();

  /**
   * Interactions initially added to the map. If not specified, the default interactions are used.
   * In a worker, no interactions are added by default.
   */
  readonly wolInteractions = input<Collection<Interaction> | Interaction[]>();

  /**
   * The element to listen to keyboard events on. This determines when the `KeyboardPan` and
   * `KeyboardZoom` interactions trigger. If not specified, keyboard events are listened to on the
   * map target. If set to something other than `document`, the target element needs a `tabindex`
   * attribute for key events to be emitted.
   */
  readonly wolKeyboardEventTarget = input<HTMLElement | Document | string>();

  /**
   * Layers to render. If not defined, a map with no layers will be rendered. Layers are rendered
   * in the order supplied, so a layer meant to appear on top must come after the layers below it.
   */
  readonly wolLayers = input<BaseLayer[] | Collection<BaseLayer> | LayerGroup>();

  /**
   * Maximum number of tiles to load simultaneously. Defaults to `16`.
   */
  readonly wolMaxTilesLoading = input<number>();

  /**
   * The minimum distance in pixels the cursor must move to be detected as a map move event
   * instead of a click. Increasing this value can make it easier to click on the map. Defaults to
   * `1`.
   */
  readonly wolMoveTolerance = input<number>();

  /**
   * Overlays initially added to the map. By default, no overlays are added.
   */
  readonly wolOverlays = input<Collection<Overlay> | Overlay[]>();

  /**
   * The container for the map, either the element itself or the id of the element. Updated
   * automatically when the map's target changes.
   */
  readonly wolTarget = model<HTMLElement | string>();

  /**
   * The map's view. No layer sources will be fetched unless this is specified. Can also be a
   * promise that resolves to `ViewOptions`, allowing view properties to be resolved by sources or
   * other components that load view-related metadata.
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
   * Triggered after layers are composed. Only WebGL layers currently dispatch this event.
   */
  readonly wolPostCompose = output<RenderEvent>();

  /**
   * Triggered after a map frame is rendered.
   */
  readonly wolPostRender = output<MapEvent>();

  /**
   * Triggered before layers are composed. Only WebGL layers currently dispatch this event.
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
