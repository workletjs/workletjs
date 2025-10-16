import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  model,
  OnChanges,
  output,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { ObjectEvent } from 'ol/Object';
import { EventsKey } from 'ol/events';
import { unByKey } from 'ol/Observable';
import View, { ViewOptions } from 'ol/View';
import Collection from 'ol/Collection';
import Control from 'ol/control/Control';
import Map from 'ol/Map';
import Interaction from 'ol/interaction/Interaction';
import BaseLayer from 'ol/layer/Base';
import LayerGroup from 'ol/layer/Group';
import Overlay from 'ol/Overlay';
import BaseEvent from 'ol/events/Event';
import MapBrowserEvent from 'ol/MapBrowserEvent';
import MapEvent from 'ol/MapEvent';
import RenderEvent from 'ol/render/Event';

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
  readonly wolControls = input<Collection<Control> | Control[]>();
  readonly wolPixelRatio = input<number>();
  readonly wolInteractions = input<Collection<Interaction> | Interaction[]>();
  readonly wolKeyboardEventTarget = input<HTMLElement | Document | string>();
  readonly wolLayers = input<BaseLayer[] | Collection<BaseLayer> | LayerGroup>();
  readonly wolMaxTilesLoading = input<number>();
  readonly wolMoveTolerance = input<number>();
  readonly wolOverlays = input<Collection<Overlay> | Overlay[]>();
  readonly wolTarget = model<HTMLElement | string>();
  readonly wolView = model<View | Promise<ViewOptions>>();
  readonly wolProperties = input<WolProperties>();

  readonly wolChange = output<BaseEvent>();
  readonly wolLayerGroupChange = output<ObjectEvent>();
  readonly wolSizeChange = output<ObjectEvent>();
  readonly wolClick = output<MapBrowserEvent<PointerEvent>>();
  readonly wolDblclick = output<MapBrowserEvent<PointerEvent>>();
  readonly wolError = output<BaseEvent>();
  readonly wolLoadEnd = output<MapEvent>();
  readonly wolLoadStart = output<MapEvent>();
  readonly wolMoveEnd = output<MapEvent>();
  readonly wolMoveStart = output<MapEvent>();
  readonly wolPointerDrag = output<MapBrowserEvent<PointerEvent>>();
  readonly wolPointerMove = output<MapBrowserEvent<PointerEvent>>();
  readonly wolPostCompose = output<RenderEvent>();
  readonly wolPostRender = output<MapEvent>();
  readonly wolPreCompose = output<RenderEvent>();
  readonly wolPropertyChange = output<ObjectEvent>();
  readonly wolRenderComplete = output<RenderEvent>();
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

      eventsKey['change:size'] = map.on('change:size', (event) =>
        this.wolSizeChange.emit(event),
      );

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

      eventsKey['loadstart'] = map.on('loadstart', (event) =>
        this.wolLoadStart.emit(event),
      );

      eventsKey['moveend'] = map.on('moveend', (event) => this.wolMoveEnd.emit(event));

      eventsKey['movestart'] = map.on('movestart', (event) =>
        this.wolMoveStart.emit(event),
      );

      eventsKey['pointerdrag'] = map.on('pointerdrag', (event) =>
        this.wolPointerDrag.emit(event as MapBrowserEvent<PointerEvent>),
      );

      eventsKey['pointermove'] = map.on('pointermove', (event) =>
        this.wolPointerMove.emit(event as MapBrowserEvent<PointerEvent>),
      );

      eventsKey['postcompose'] = map.on('postcompose', (event) =>
        this.wolPostCompose.emit(event),
      );

      eventsKey['postrender'] = map.on('postrender', (event) =>
        this.wolPostRender.emit(event),
      );

      eventsKey['precompose'] = map.on('precompose', (event) =>
        this.wolPreCompose.emit(event),
      );

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
