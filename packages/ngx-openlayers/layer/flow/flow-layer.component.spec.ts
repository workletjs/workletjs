import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import Map from 'ol/Map';
import { ObjectEvent } from 'ol/Object';
import BaseEvent from 'ol/events/Event';
import { Extent } from 'ol/extent';
import FlowLayer, { SourceType, Style } from 'ol/layer/Flow';
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

  it('should remove the layer from the Map when destroyed', () => {
    const removeLayerSpy = vi.spyOn(mapInstance, 'removeLayer');
    testComponent.destroyLayer.set(true);
    fixture.detectChanges();
    expect(flowLayerComponent.getInstance()).toBeUndefined();
    expect(removeLayerSpy).toHaveBeenCalledWith(flowLayer);
  });

  // ─── Two-way model bindings ─────────────────────────────────────────────────

  it('should update wolOpacity model and host signal when OL fires change:opacity', async () => {
    const spy = vi.spyOn(flowLayerComponent.wolOpacity, 'set');
    flowLayer.setOpacity(0.4);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(spy).toHaveBeenCalledWith(0.4);
    expect(testComponent.opacity()).toBe(0.4);
  });

  it('should update wolVisible model and host signal when OL fires change:visible', async () => {
    const spy = vi.spyOn(flowLayerComponent.wolVisible, 'set');
    flowLayer.setVisible(false);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(spy).toHaveBeenCalledWith(false);
    expect(testComponent.visible()).toBe(false);
  });

  it('should update wolExtent model and host signal when OL fires change:extent', async () => {
    const newExtent: Extent = [5, 6, 7, 8];
    const spy = vi.spyOn(flowLayerComponent.wolExtent, 'set');
    flowLayer.setExtent(newExtent);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(spy).toHaveBeenCalledWith(newExtent);
    expect(testComponent.extent()).toEqual(newExtent);
  });

  it('should update wolZIndex model and host signal when OL fires change:zIndex', async () => {
    const spy = vi.spyOn(flowLayerComponent.wolZIndex, 'set');
    flowLayer.setZIndex(99);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(spy).toHaveBeenCalledWith(99);
    expect(testComponent.zIndex()).toBe(99);
  });

  it('should update wolMinResolution model and host signal when OL fires change:minResolution', async () => {
    const spy = vi.spyOn(flowLayerComponent.wolMinResolution, 'set');
    flowLayer.setMinResolution(0.1);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(spy).toHaveBeenCalledWith(0.1);
    expect(testComponent.minResolution()).toBe(0.1);
  });

  it('should update wolMaxResolution model and host signal when OL fires change:maxResolution', async () => {
    const spy = vi.spyOn(flowLayerComponent.wolMaxResolution, 'set');
    flowLayer.setMaxResolution(50);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(spy).toHaveBeenCalledWith(50);
    expect(testComponent.maxResolution()).toBe(50);
  });

  it('should update wolMinZoom model and host signal when OL fires change:minZoom', async () => {
    const spy = vi.spyOn(flowLayerComponent.wolMinZoom, 'set');
    flowLayer.setMinZoom(1);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(spy).toHaveBeenCalledWith(1);
    expect(testComponent.minZoom()).toBe(1);
  });

  it('should update wolMaxZoom model and host signal when OL fires change:maxZoom', async () => {
    const spy = vi.spyOn(flowLayerComponent.wolMaxZoom, 'set');
    flowLayer.setMaxZoom(18);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(spy).toHaveBeenCalledWith(18);
    expect(testComponent.maxZoom()).toBe(18);
  });

  it('should update wolPreload model and host signal when OL fires change:preload', async () => {
    const spy = vi.spyOn(flowLayerComponent.wolPreload, 'set');
    flowLayer.setPreload(3);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(spy).toHaveBeenCalledWith(3);
    expect(testComponent.preload()).toBe(3);
  });

  it('should update wolSource model and host signal when OL fires change:source', async () => {
    const newSource = new DataTile({ loader: () => new Uint8Array() });
    const spy = vi.spyOn(flowLayerComponent.wolSource, 'set');
    flowLayer.setSource(newSource);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(spy).toHaveBeenCalledWith(newSource);
    expect(testComponent.source()).toBe(newSource);
  });

  it('should update wolUseInterimTilesOnError model and host signal when OL fires change:useInterimTilesOnError', async () => {
    const spy = vi.spyOn(flowLayerComponent.wolUseInterimTilesOnError, 'set');
    flowLayer.setUseInterimTilesOnError(false);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(spy).toHaveBeenCalledWith(false);
    expect(testComponent.useInterimTilesOnError()).toBe(false);
  });

  it('should not update model signals when OL fires events after component is destroyed', () => {
    const previousOpacity = testComponent.opacity();
    testComponent.destroyLayer.set(true);
    fixture.detectChanges();
    flowLayer.setOpacity(0.99);
    expect(testComponent.opacity()).toBe(previousOpacity);
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
