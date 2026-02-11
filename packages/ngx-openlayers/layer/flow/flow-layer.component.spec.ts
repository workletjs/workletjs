import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import BaseEvent from 'ol/events/Event';
import { Extent } from 'ol/extent';
import FlowLayer, { SourceType, Style } from 'ol/layer/Flow';
import Map from 'ol/Map';
import { ObjectEvent } from 'ol/Object';
import RenderEvent from 'ol/render/Event';
import DataTile from 'ol/source/DataTile';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolFlowLayerComponent } from './flow-layer.component';

describe('WolFlowLayerComponent', () => {
  let fixture: ComponentFixture<TestFlowLayerComponent>;
  let testComponent: TestFlowLayerComponent;
  let mapComponent: WolMapComponent;
  let mapInstance: Map;
  let flowLayerComponent: WolFlowLayerComponent;
  let flowLayer: FlowLayer;

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestFlowLayerComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const mapDebugElement = fixture.debugElement.query(By.directive(WolMapComponent));
    const flowLayerDebugElement = fixture.debugElement.query(By.directive(WolFlowLayerComponent));

    testComponent = fixture.componentInstance;
    mapComponent = mapDebugElement.componentInstance;
    mapInstance = mapComponent.getInstance() as Map;
    flowLayerComponent = flowLayerDebugElement.componentInstance;
    flowLayer = flowLayerComponent.getInstance() as FlowLayer;
  });

  it('should create the flow layer and register it on the map', () => {
    expect(flowLayerComponent).toBeTruthy();
    expect(flowLayer).toBeInstanceOf(FlowLayer);
    expect(mapInstance.getLayers().getArray()).toContain(flowLayer);
  });

  it('should initialize the flow layer with provided inputs', () => {
    expect(flowLayer.getClassName()).toBe(testComponent.className());
    expect(flowLayer.getOpacity()).toBe(testComponent.opacity());
    expect(flowLayer.getVisible()).toBe(testComponent.visible());
    expect(flowLayer.getExtent()).toEqual(testComponent.extent());
    expect(flowLayer.getZIndex()).toBe(testComponent.zIndex());
    expect(flowLayer.getMinResolution()).toBe(testComponent.minResolution());
    expect(flowLayer.getMaxResolution()).toBe(testComponent.maxResolution());
    expect(flowLayer.getMinZoom()).toBe(testComponent.minZoom());
    expect(flowLayer.getMaxZoom()).toBe(testComponent.maxZoom());
    expect(flowLayer.getPreload()).toBe(testComponent.preload());
    expect(flowLayer.getSource()).toBe(testComponent.source());
    expect(flowLayer.getUseInterimTilesOnError()).toBe(testComponent.useInterimTilesOnError());
    expect(flowLayer.getProperties()).toMatchObject(testComponent.properties());
  });

  it('should update style when wolStyle input changes', () => {
    const updateStyleSpy = vi.spyOn(flowLayer, 'updateStyleVariables');
    const newStyle: Style = { color: 'blue' };
    testComponent.style.set(newStyle);
    fixture.detectChanges();
    expect(updateStyleSpy).toHaveBeenCalledWith(newStyle);
  });

  it('should update extent when wolExtent input changes', () => {
    const newExtent: Extent = [10, 20, 30, 40];
    testComponent.extent.set(newExtent);
    fixture.detectChanges();
    expect(flowLayer.getExtent()).toEqual(newExtent);
  });

  it('should update maxResolution when wolMaxResolution input changes', () => {
    const newMaxResolution = 15;
    testComponent.maxResolution.set(newMaxResolution);
    fixture.detectChanges();
    console.log(flowLayerComponent.wolMaxResolution());
    expect(flowLayerComponent.wolMaxResolution()).toBe(newMaxResolution);
    expect(flowLayer.getMaxResolution()).toBe(newMaxResolution);
  });

  it('should update opacity when wolOpacity input changes', () => {
    const newOpacity = 0.4;
    testComponent.opacity.set(newOpacity);
    fixture.detectChanges();
    expect(flowLayer.getOpacity()).toBe(newOpacity);
  });

  it('should update visible when wolVisible input changes', () => {
    const newVisible = false;
    testComponent.visible.set(newVisible);
    fixture.detectChanges();
    expect(flowLayer.getVisible()).toBe(newVisible);
  });

  it('should update zIndex when wolZIndex input changes', () => {
    const newZIndex = 7;
    testComponent.zIndex.set(newZIndex);
    fixture.detectChanges();
    expect(flowLayer.getZIndex()).toBe(newZIndex);
  });

  it('should update properties when wolProperties input changes', () => {
    const newProperties: WolProperties = { updated: true };
    testComponent.properties.set(newProperties);
    fixture.detectChanges();
    expect(flowLayer.getProperties()).toMatchObject(newProperties);
  });

  it('should update source when wolSource input changes', () => {
    const newSource = new DataTile({ loader: () => new Uint8Array() });
    testComponent.source.set(newSource);
    fixture.detectChanges();
    expect(flowLayer.getSource()).toBe(newSource);
  });

  it('should emit change event when flow layer triggers change', () => {
    const changeSpy = vi.spyOn(flowLayerComponent.wolChange, 'emit');
    const changeEvent = new BaseEvent('change');
    flowLayer.dispatchEvent(changeEvent);
    expect(changeSpy).toHaveBeenCalledWith(changeEvent);
  });

  it('should emit error event when flow layer triggers error', () => {
    const errorSpy = vi.spyOn(flowLayerComponent.wolError, 'emit');
    const errorEvent = new BaseEvent('error');
    flowLayer.dispatchEvent(errorEvent);
    expect(errorSpy).toHaveBeenCalledWith(errorEvent);
  });

  it('should emit postrender event when flow layer triggers postrender', () => {
    const postRenderSpy = vi.spyOn(flowLayerComponent.wolPostRender, 'emit');
    const event = new RenderEvent('postrender', undefined, undefined, undefined);
    flowLayer.dispatchEvent(event);
    expect(postRenderSpy).toHaveBeenCalledWith(event);
  });

  it('should emit prerender event when flow layer triggers prerender', () => {
    const preRenderSpy = vi.spyOn(flowLayerComponent.wolPreRender, 'emit');
    const event = new RenderEvent('prerender', undefined, undefined, undefined);
    flowLayer.dispatchEvent(event);
    expect(preRenderSpy).toHaveBeenCalledWith(event);
  });

  it('should emit propertychange event when flow layer triggers propertychange', () => {
    const propertyChangeSpy = vi.spyOn(flowLayerComponent.wolPropertyChange, 'emit');
    const event = new ObjectEvent('propertychange', 'opacity', 0.5);
    flowLayer.dispatchEvent(event);
    expect(propertyChangeSpy).toHaveBeenCalledWith(event);
  });

  it('should emit sourceready event when flow layer triggers sourceready', () => {
    const sourceReadySpy = vi.spyOn(flowLayerComponent.wolSourceReady, 'emit');
    const event = new BaseEvent('sourceready');
    flowLayer.dispatchEvent(event);
    expect(sourceReadySpy).toHaveBeenCalledWith(event);
  });

  it('should emit `change:opacity` event when opacity changes', () => {
    const changeOpacitySpy = vi.spyOn(flowLayerComponent.wolOpacity, 'set');
    flowLayer.setOpacity(0.7);
    fixture.detectChanges();
    expect(changeOpacitySpy).toHaveBeenCalledWith(0.7);
  });

  it('should emit `change:visible` event when visibility changes', () => {
    const changeVisibleSpy = vi.spyOn(flowLayerComponent.wolVisible, 'set');
    flowLayer.setVisible(false);
    fixture.detectChanges();
    expect(changeVisibleSpy).toHaveBeenCalledWith(false);
  });

  it('should emit `change:extent` event when extent changes', () => {
    const extent: Extent = [1, 2, 3, 4];
    const changeExtentSpy = vi.spyOn(flowLayerComponent.wolExtent, 'set');
    flowLayer.setExtent(extent);
    fixture.detectChanges();
    expect(changeExtentSpy).toHaveBeenCalledWith(extent);
  });

  it('should emit `change:zIndex` event when zIndex changes', () => {
    const changeZIndexSpy = vi.spyOn(flowLayerComponent.wolZIndex, 'set');
    flowLayer.setZIndex(20);
    fixture.detectChanges();
    expect(changeZIndexSpy).toHaveBeenCalledWith(20);
  });

  it('should emit `change:minResolution` event when minResolution changes', () => {
    const changeMinResolutionSpy = vi.spyOn(flowLayerComponent.wolMinResolution, 'set');
    flowLayer.setMinResolution(0.25);
    fixture.detectChanges();
    expect(changeMinResolutionSpy).toHaveBeenCalledWith(0.25);
  });

  it('should emit `change:maxResolution` event when maxResolution changes', () => {
    const changeMaxResolutionSpy = vi.spyOn(flowLayerComponent.wolMaxResolution, 'set');
    flowLayer.setMaxResolution(25);
    fixture.detectChanges();
    expect(changeMaxResolutionSpy).toHaveBeenCalledWith(25);
  });

  it('should emit `change:minZoom` event when minZoom changes', () => {
    const changeMinZoomSpy = vi.spyOn(flowLayerComponent.wolMinZoom, 'set');
    flowLayer.setMinZoom(1);
    fixture.detectChanges();
    expect(changeMinZoomSpy).toHaveBeenCalledWith(1);
  });

  it('should emit `change:maxZoom` event when maxZoom changes', () => {
    const changeMaxZoomSpy = vi.spyOn(flowLayerComponent.wolMaxZoom, 'set');
    flowLayer.setMaxZoom(11);
    fixture.detectChanges();
    expect(changeMaxZoomSpy).toHaveBeenCalledWith(11);
  });

  it('should emit `change:preload` event when preload changes', () => {
    const changePreloadSpy = vi.spyOn(flowLayerComponent.wolPreload, 'set');
    flowLayer.setPreload(5);
    fixture.detectChanges();
    expect(changePreloadSpy).toHaveBeenCalledWith(5);
  });

  it('should emit `change:source` event when source changes', () => {
    const newSource = new DataTile({ loader: () => new Uint8Array() });
    const changeSourceSpy = vi.spyOn(flowLayerComponent.wolSource, 'set');
    flowLayer.setSource(newSource);
    fixture.detectChanges();
    expect(changeSourceSpy).toHaveBeenCalledWith(newSource);
  });

  it('should emit `change:useInterimTilesOnError` event when useInterimTilesOnError changes', () => {
    const changeUseInterimTilesOnErrorSpy = vi.spyOn(
      flowLayerComponent.wolUseInterimTilesOnError,
      'set',
    );
    flowLayer.setUseInterimTilesOnError(false);
    fixture.detectChanges();
    expect(changeUseInterimTilesOnErrorSpy).toHaveBeenCalledWith(false);
  });

  it('should remove the layer from the Map when destroyed', () => {
    const removeLayerSpy = vi.spyOn(mapInstance, 'removeLayer');
    testComponent.destroyLayer.set(true);
    fixture.detectChanges();
    expect(flowLayerComponent.getInstance()).toBeUndefined();
    expect(removeLayerSpy).toHaveBeenCalledWith(flowLayer);
  });
});

@Component({
  selector: 'wol-test-flow-layer',
  imports: [WolMapComponent, WolViewComponent, WolFlowLayerComponent],
  template: `
    <wol-map>
      <wol-view [wolZoom]="2" [wolCenter]="[0, 0]" />
      @if (!destroyLayer()) {
        <wol-flow-layer
          [wolMaxSpeed]="maxSpeed()"
          [wolSpeedFactor]="speedFactor()"
          [wolParticles]="particles()"
          [wolStyle]="style()"
          [wolClassName]="className()"
          [(wolOpacity)]="opacity"
          [(wolVisible)]="visible"
          [(wolExtent)]="extent"
          [(wolZIndex)]="zIndex"
          [(wolMinResolution)]="minResolution"
          [(wolMaxResolution)]="maxResolution"
          [(wolMinZoom)]="minZoom"
          [(wolMaxZoom)]="maxZoom"
          [(wolPreload)]="preload"
          [(wolSource)]="source"
          [(wolUseInterimTilesOnError)]="useInterimTilesOnError"
          [wolCacheSize]="cacheSize()"
          [wolProperties]="properties()"
        />
      }
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestFlowLayerComponent {
  maxSpeed = signal(100);
  speedFactor = signal(0.1);
  particles = signal(256);
  style = signal<Style>({ color: 'red' });
  className = signal('custom-class');
  opacity = signal(0.8);
  visible = signal(true);
  extent = signal<Extent>([0, 1, 2, 3]);
  zIndex = signal(5);
  minResolution = signal(0.5);
  maxResolution = signal(10);
  minZoom = signal(2);
  maxZoom = signal(9);
  preload = signal(0);
  source = signal<SourceType | null>(new DataTile({ loader: () => new Uint8Array() }));
  useInterimTilesOnError = signal(true);
  cacheSize = signal(512);
  properties = signal<WolProperties>({ foo: 'bar' });
  destroyLayer = signal(false);
}
