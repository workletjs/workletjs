import { vi } from 'vitest';

import { ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';

import Map from 'ol/Map';
import MapBrowserEvent from 'ol/MapBrowserEvent';
import MapEvent from 'ol/MapEvent';
import { ObjectEvent } from 'ol/Object';
import View from 'ol/View';
import BaseEvent from 'ol/events/Event';
import LayerGroup from 'ol/layer/Group';
import TileLayer from 'ol/layer/Tile';
import RenderEvent from 'ol/render/Event';
import OSM from 'ol/source/OSM';

import { WolMapComponent } from './map.component';

describe('WolMapComponent', () => {
  let component: WolMapComponent;
  let fixture: ComponentFixture<WolMapComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(WolMapComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize map instance after render', fakeAsync(() => {
    fixture.detectChanges();

    const map = component.getInstance();

    expect(map).toBeInstanceOf(Map);
    expect(map?.getTarget()).toBe(fixture.nativeElement);
  }));

  it('should be able to change the map layerGroup via input', fakeAsync(() => {
    const layerGroup = new LayerGroup({
      layers: [new TileLayer({ source: new OSM() })],
    });

    fixture.componentRef.setInput('wolLayers', layerGroup);
    fixture.detectChanges();

    const map = component.getInstance();
    expect(map?.getLayerGroup()).toEqual(layerGroup);
  }));

  it('should be able to change the map layers via input', fakeAsync(() => {
    const layers = [new TileLayer({ source: new OSM() })];

    fixture.componentRef.setInput('wolLayers', layers);
    fixture.detectChanges();

    const map = component.getInstance();
    const mapLayers = map?.getLayers();
    const length = mapLayers?.getLength() ?? 0;

    for (let i = 0; i < length; i++) {
      expect(mapLayers?.item(i)).toEqual(layers[i]);
    }
  }));

  it('should be able to change the map target via input', fakeAsync(() => {
    fixture.detectChanges();

    const map = component.getInstance();

    fixture.componentRef.setInput('wolTarget', undefined);
    fixture.detectChanges();
    expect(map?.getTarget()).toBeUndefined();

    const newTargetStr = 'new-map-target';

    fixture.componentRef.setInput('wolTarget', newTargetStr);
    fixture.detectChanges();
    expect(map?.getTarget()).toBe(newTargetStr);

    const newTarget = document.createElement('div');

    fixture.componentRef.setInput('wolTarget', newTarget);
    fixture.detectChanges();
    expect(map?.getTarget()).toBe(newTarget);
  }));

  it('should be able to change the map view via input', fakeAsync(() => {
    const view = new View({ center: [0, 0], zoom: 2 });

    fixture.componentRef.setInput('wolView', view);
    fixture.detectChanges();

    const map = component.getInstance();
    expect(map?.getView()).toBe(view);
  }));

  it('should emit change event', fakeAsync(() => {
    fixture.detectChanges();

    const emitSpy = vi.spyOn(component.wolChange, 'emit');
    const map = component.getInstance();
    const changeEvent = new BaseEvent('change');

    // Dispatch event on the map
    map?.dispatchEvent(changeEvent);

    expect(emitSpy).toHaveBeenCalledWith(changeEvent);
  }));

  it('should emit change layergroup event', fakeAsync(() => {
    fixture.detectChanges();

    const layerGroup = new LayerGroup();
    const emitSpy = vi.spyOn(component.wolLayerGroupChange, 'emit');

    component.getInstance()?.setLayerGroup(layerGroup);

    expect(emitSpy).toHaveBeenCalled();
  }));

  it('should emit size change event', fakeAsync(() => {
    fixture.detectChanges();

    const emitSpy = vi.spyOn(component.wolSizeChange, 'emit');

    component.getInstance()?.setSize([800, 600]);

    expect(emitSpy).toHaveBeenCalled();
  }));

  it('should emit target change event', fakeAsync(() => {
    fixture.detectChanges();

    const emitSpy = vi.spyOn(component.wolTarget, 'set');

    const newTarget = document.createElement('div');
    component.getInstance()?.setTarget(newTarget);

    expect(emitSpy).toHaveBeenCalledWith(newTarget);
  }));

  it('should emit view change event', fakeAsync(() => {
    fixture.detectChanges();

    const emitSpy = vi.spyOn(component.wolView, 'set');

    const newView = new View();
    component.getInstance()?.setView(newView);

    expect(emitSpy).toHaveBeenCalledWith(newView);
  }));

  it('should emit click event', fakeAsync(() => {
    const emitSpy = vi.spyOn(component.wolClick, 'emit');

    fixture.detectChanges();

    const map = component.getInstance() as Map;

    // Simulate a click event on the map
    const event = new MapBrowserEvent('click', map, new PointerEvent('click'));

    // Dispatch event on the map
    map?.dispatchEvent(event);

    expect(emitSpy).toHaveBeenCalledWith(event);
  }));

  it('should emit dblclick event', fakeAsync(() => {
    const emitSpy = vi.spyOn(component.wolDblclick, 'emit');

    fixture.detectChanges();

    const map = component.getInstance() as Map;

    // Simulate a dblclick event on the map
    const event = new MapBrowserEvent('dblclick', map, new PointerEvent('dblclick'));

    // Dispatch event on the map
    map?.dispatchEvent(event);

    expect(emitSpy).toHaveBeenCalledWith(event);
  }));

  it('should emit error event', fakeAsync(() => {
    const emitSpy = vi.spyOn(component.wolError, 'emit');

    fixture.detectChanges();

    const map = component.getInstance();

    const errorEvent = new BaseEvent('error');
    map?.dispatchEvent(errorEvent);

    expect(emitSpy).toHaveBeenCalledWith(errorEvent);
  }));

  it('should emit loadend event', fakeAsync(() => {
    const emitSpy = vi.spyOn(component.wolLoadEnd, 'emit');

    fixture.detectChanges();

    const map = component.getInstance() as Map;

    const loadEndEvent = new MapEvent('loadend', map);
    map?.dispatchEvent(loadEndEvent);

    expect(emitSpy).toHaveBeenCalledWith(loadEndEvent);
  }));

  it('should emit loadstart event', fakeAsync(() => {
    const emitSpy = vi.spyOn(component.wolLoadStart, 'emit');

    fixture.detectChanges();

    const map = component.getInstance() as Map;

    const loadStartEvent = new MapEvent('loadstart', map);
    map?.dispatchEvent(loadStartEvent);

    expect(emitSpy).toHaveBeenCalledWith(loadStartEvent);
  }));

  it('should emit moveend event', fakeAsync(() => {
    const emitSpy = vi.spyOn(component.wolMoveEnd, 'emit');

    fixture.detectChanges();

    const map = component.getInstance() as Map;

    const moveEndEvent = new MapEvent('moveend', map);
    map?.dispatchEvent(moveEndEvent);

    expect(emitSpy).toHaveBeenCalledWith(moveEndEvent);
  }));

  it('should emit movestart event', fakeAsync(() => {
    const emitSpy = vi.spyOn(component.wolMoveStart, 'emit');

    fixture.detectChanges();

    const map = component.getInstance() as Map;

    const moveStartEvent = new MapEvent('movestart', map);
    map?.dispatchEvent(moveStartEvent);

    expect(emitSpy).toHaveBeenCalledWith(moveStartEvent);
  }));

  it('should emit pointerdrag event', fakeAsync(() => {
    const emitSpy = vi.spyOn(component.wolPointerDrag, 'emit');

    fixture.detectChanges();

    const map = component.getInstance() as Map;

    // Simulate a pointerdrag event on the map
    const event = new MapBrowserEvent('pointerdrag', map, new PointerEvent('pointerdrag'));

    // Dispatch event on the map
    map?.dispatchEvent(event);

    expect(emitSpy).toHaveBeenCalledWith(event);
  }));

  it('should emit pointermove event', fakeAsync(() => {
    const emitSpy = vi.spyOn(component.wolPointerMove, 'emit');

    fixture.detectChanges();

    const map = component.getInstance() as Map;

    // Simulate a pointermove event on the map
    const event = new MapBrowserEvent('pointermove', map, new PointerEvent('pointermove'));

    // Dispatch event on the map
    map?.dispatchEvent(event);

    expect(emitSpy).toHaveBeenCalledWith(event);
  }));

  it('should emit postcompose event', fakeAsync(() => {
    const emitSpy = vi.spyOn(component.wolPostCompose, 'emit');

    fixture.detectChanges();

    const map = component.getInstance() as Map;

    const postComposeEvent = new RenderEvent('postcompose');
    map?.dispatchEvent(postComposeEvent);

    expect(emitSpy).toHaveBeenCalledWith(postComposeEvent);
  }));

  it('should emit postrender event', fakeAsync(() => {
    const emitSpy = vi.spyOn(component.wolPostRender, 'emit');

    fixture.detectChanges();

    const map = component.getInstance() as Map;

    const postRenderEvent = new MapEvent('postrender', map);
    map?.dispatchEvent(postRenderEvent);

    expect(emitSpy).toHaveBeenCalledWith(postRenderEvent);
  }));

  it('should emit precompose event', fakeAsync(() => {
    const emitSpy = vi.spyOn(component.wolPreCompose, 'emit');

    fixture.detectChanges();

    const map = component.getInstance() as Map;

    const preComposeEvent = new RenderEvent('precompose');
    map?.dispatchEvent(preComposeEvent);

    expect(emitSpy).toHaveBeenCalledWith(preComposeEvent);
  }));

  it('should emit propertychange event', fakeAsync(() => {
    const emitSpy = vi.spyOn(component.wolPropertyChange, 'emit');

    fixture.detectChanges();

    const map = component.getInstance();

    const propertyChangeEvent = new ObjectEvent('propertychange', 'testProp', 123);
    map?.dispatchEvent(propertyChangeEvent);

    expect(emitSpy).toHaveBeenCalledWith(propertyChangeEvent);
  }));

  it('should emit rendercomplete event', fakeAsync(() => {
    const emitSpy = vi.spyOn(component.wolRenderComplete, 'emit');

    fixture.detectChanges();

    const map = component.getInstance() as Map;

    const renderCompleteEvent = new RenderEvent('rendercomplete');
    map?.dispatchEvent(renderCompleteEvent);

    expect(emitSpy).toHaveBeenCalledWith(renderCompleteEvent);
  }));

  it('should emit singleclick event', fakeAsync(() => {
    const emitSpy = vi.spyOn(component.wolSingleClick, 'emit');

    fixture.detectChanges();

    const map = component.getInstance() as Map;

    // Simulate a singleclick event on the map
    const event = new MapBrowserEvent('singleclick', map, new PointerEvent('singleclick'));

    // Dispatch event on the map
    map?.dispatchEvent(event);

    expect(emitSpy).toHaveBeenCalledWith(event);
  }));

  it('should dispose map on destroy', fakeAsync(() => {
    fixture.detectChanges();

    const map = component.getInstance() as Map;
    // Ensure map exists before spying
    expect(map).toBeDefined();

    const disposeSpy = vi.spyOn(map, 'dispose');

    fixture.destroy();

    expect(disposeSpy).toHaveBeenCalled();
    expect(component.getInstance()).toBeUndefined();
  }));

  it('should update pixelRatio on wolPixelRatio input change', fakeAsync(() => {
    fixture.detectChanges();
    const map = component.getInstance() as Map;
    fixture.componentRef.setInput('wolPixelRatio', 2);
    fixture.detectChanges();
    expect(map.getPixelRatio()).toBe(2);
  }));
});
