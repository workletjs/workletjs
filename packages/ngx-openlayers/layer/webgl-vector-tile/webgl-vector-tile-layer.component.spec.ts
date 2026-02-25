import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import Map from 'ol/Map';
import { ObjectEvent } from 'ol/Object';
import BaseEvent from 'ol/events/Event';
import { Extent } from 'ol/extent';
import WebGLVectorTileLayer from 'ol/layer/WebGLVectorTile';
import RenderEvent from 'ol/render/Event';
import RenderFeature from 'ol/render/Feature';
import VectorTileSource from 'ol/source/VectorTile';
import { FlatStyleLike, StyleVariables } from 'ol/style/flat';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolWebGLVectorTileLayerComponent } from './webgl-vector-tile-layer.component';

describe('WolWebGLVectorTileLayerComponent', () => {
  let fixture: ComponentFixture<TestWebGLVectorTileLayerComponent>;
  let testComponent: TestWebGLVectorTileLayerComponent;
  let mapComponent: WolMapComponent;
  let mapInstance: Map;
  let layerComponent: WolWebGLVectorTileLayerComponent;
  let layer: WebGLVectorTileLayer<VectorTileSource<RenderFeature>, RenderFeature>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestWebGLVectorTileLayerComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const mapDebugElement = fixture.debugElement.query(By.directive(WolMapComponent));
    const layerDebugElement = fixture.debugElement.query(
      By.directive(WolWebGLVectorTileLayerComponent),
    );

    testComponent = fixture.componentInstance;
    mapComponent = mapDebugElement.componentInstance;
    mapInstance = mapComponent.getInstance() as Map;
    layerComponent = layerDebugElement.componentInstance;
    layer = layerComponent.getInstance() as WebGLVectorTileLayer<
      VectorTileSource<RenderFeature>,
      RenderFeature
    >;
  });

  it('should create the layer and register it on the map', () => {
    expect(layerComponent).toBeTruthy();
    expect(layer).toBeInstanceOf(WebGLVectorTileLayer);
    expect(mapInstance.getLayers().getArray()).toContain(layer);
  });

  it('should initialize the layer with provided inputs', () => {
    expect(layer.getClassName()).toBe(testComponent.className());
    expect(layer.getOpacity()).toBe(testComponent.opacity());
    expect(layer.getVisible()).toBe(testComponent.visible());
    expect(layer.getExtent()).toEqual(testComponent.extent());
    expect(layer.getZIndex()).toBe(testComponent.zIndex());
    expect(layer.getMinResolution()).toBe(testComponent.minResolution());
    expect(layer.getMaxResolution()).toBe(testComponent.maxResolution());
    expect(layer.getMinZoom()).toBe(testComponent.minZoom());
    expect(layer.getMaxZoom()).toBe(testComponent.maxZoom());
    expect(layer.getSource()).toBe(testComponent.source());
    expect(layer.getProperties()).toMatchObject(testComponent.properties());
  });

  // ─── Input / ngOnChanges ────────────────────────────────────────────────────

  it('should update opacity when wolOpacity input changes', () => {
    const newOpacity = 0.4;
    testComponent.opacity.set(newOpacity);
    fixture.detectChanges();
    expect(layer.getOpacity()).toBe(newOpacity);
  });

  it('should update visible when wolVisible input changes', () => {
    testComponent.visible.set(false);
    fixture.detectChanges();
    expect(layer.getVisible()).toBe(false);
  });

  it('should update extent when wolExtent input changes', () => {
    const newExtent: Extent = [10, 20, 30, 40];
    testComponent.extent.set(newExtent);
    fixture.detectChanges();
    expect(layer.getExtent()).toEqual(newExtent);
  });

  it('should update zIndex when wolZIndex input changes', () => {
    testComponent.zIndex.set(7);
    fixture.detectChanges();
    expect(layer.getZIndex()).toBe(7);
  });

  it('should update minResolution when wolMinResolution input changes', () => {
    testComponent.minResolution.set(0.25);
    fixture.detectChanges();
    expect(layer.getMinResolution()).toBe(0.25);
  });

  it('should update maxResolution when wolMaxResolution input changes', () => {
    testComponent.maxResolution.set(15);
    fixture.detectChanges();
    expect(layer.getMaxResolution()).toBe(15);
  });

  it('should update minZoom when wolMinZoom input changes', () => {
    testComponent.minZoom.set(3);
    fixture.detectChanges();
    expect(layer.getMinZoom()).toBe(3);
  });

  it('should update maxZoom when wolMaxZoom input changes', () => {
    testComponent.maxZoom.set(12);
    fixture.detectChanges();
    expect(layer.getMaxZoom()).toBe(12);
  });

  it('should update source when wolSource input changes', () => {
    const newSource = new VectorTileSource({});
    testComponent.source.set(newSource);
    fixture.detectChanges();
    expect(layer.getSource()).toBe(newSource);
  });

  it('should call setStyle when wolStyle input changes', () => {
    const setStyleSpy = vi.spyOn(layer, 'setStyle');
    const newStyle: FlatStyleLike = { 'fill-color': 'blue' };
    testComponent.style.set(newStyle);
    fixture.detectChanges();
    expect(setStyleSpy).toHaveBeenCalledWith(newStyle);
  });

  it('should call updateStyleVariables when wolVariables input changes', () => {
    const updateVarsSpy = vi.spyOn(layer, 'updateStyleVariables');
    const newVars: StyleVariables = { highlight: 1 };
    testComponent.variables.set(newVars);
    fixture.detectChanges();
    expect(updateVarsSpy).toHaveBeenCalledWith(newVars);
  });

  it('should update properties when wolProperties input changes', () => {
    const newProperties: WolProperties = { updated: true };
    testComponent.properties.set(newProperties);
    fixture.detectChanges();
    expect(layer.getProperties()).toMatchObject(newProperties);
  });

  // ─── Two-way model bindings (change:* events) ───────────────────────────────

  it('should update wolOpacity model when layer emits change:opacity', () => {
    const spy = vi.spyOn(layerComponent.wolOpacity, 'set');
    layer.setOpacity(0.3);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(0.3);
  });

  it('should update wolVisible model when layer emits change:visible', () => {
    const spy = vi.spyOn(layerComponent.wolVisible, 'set');
    layer.setVisible(false);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(false);
  });

  it('should update wolExtent model when layer emits change:extent', () => {
    const extent: Extent = [1, 2, 3, 4];
    const spy = vi.spyOn(layerComponent.wolExtent, 'set');
    layer.setExtent(extent);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(extent);
  });

  it('should update wolZIndex model when layer emits change:zIndex', () => {
    const spy = vi.spyOn(layerComponent.wolZIndex, 'set');
    layer.setZIndex(20);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(20);
  });

  it('should update wolMinResolution model when layer emits change:minResolution', () => {
    const spy = vi.spyOn(layerComponent.wolMinResolution, 'set');
    layer.setMinResolution(0.1);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(0.1);
  });

  it('should update wolMaxResolution model when layer emits change:maxResolution', () => {
    const spy = vi.spyOn(layerComponent.wolMaxResolution, 'set');
    layer.setMaxResolution(30);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(30);
  });

  it('should update wolMinZoom model when layer emits change:minZoom', () => {
    const spy = vi.spyOn(layerComponent.wolMinZoom, 'set');
    layer.setMinZoom(1);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(1);
  });

  it('should update wolMaxZoom model when layer emits change:maxZoom', () => {
    const spy = vi.spyOn(layerComponent.wolMaxZoom, 'set');
    layer.setMaxZoom(15);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(15);
  });

  it('should update wolSource model when layer emits change:source', () => {
    const newSource = new VectorTileSource({});
    const spy = vi.spyOn(layerComponent.wolSource, 'set');
    layer.setSource(newSource);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(newSource);
  });

  // ─── Output events ──────────────────────────────────────────────────────────

  it('should emit wolChange when the layer dispatches a change event', () => {
    const spy = vi.spyOn(layerComponent.wolChange, 'emit');
    const event = new BaseEvent('change');
    layer.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolError when the layer dispatches an error event', () => {
    const spy = vi.spyOn(layerComponent.wolError, 'emit');
    const event = new BaseEvent('error');
    layer.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolPostRender when the layer dispatches a postrender event', () => {
    const spy = vi.spyOn(layerComponent.wolPostRender, 'emit');
    const event = new RenderEvent('postrender', undefined, undefined, undefined);
    layer.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolPreRender when the layer dispatches a prerender event', () => {
    const spy = vi.spyOn(layerComponent.wolPreRender, 'emit');
    const event = new RenderEvent('prerender', undefined, undefined, undefined);
    layer.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolPropertyChange when the layer dispatches a propertychange event', () => {
    const spy = vi.spyOn(layerComponent.wolPropertyChange, 'emit');
    const event = new ObjectEvent('propertychange', 'opacity', 0.5);
    layer.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolSourceReady when the layer dispatches a sourceready event', () => {
    const spy = vi.spyOn(layerComponent.wolSourceReady, 'emit');
    const event = new BaseEvent('sourceready');
    layer.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  // ─── Lifecycle ──────────────────────────────────────────────────────────────

  it('should remove the layer from the map when destroyed', () => {
    const removeLayerSpy = vi.spyOn(mapInstance, 'removeLayer');
    testComponent.destroyLayer.set(true);
    fixture.detectChanges();
    expect(layerComponent.getInstance()).toBeUndefined();
    expect(removeLayerSpy).toHaveBeenCalledWith(layer);
  });
});

@Component({
  selector: 'wol-test-webgl-vector-tile-layer',
  imports: [WolMapComponent, WolViewComponent, WolWebGLVectorTileLayerComponent],
  template: `
    <wol-map>
      <wol-view [wolZoom]="2" [wolCenter]="[0, 0]" />
      @if (!destroyLayer()) {
        <wol-webgl-vector-tile-layer
          [wolClassName]="className()"
          [(wolOpacity)]="opacity"
          [(wolVisible)]="visible"
          [(wolExtent)]="extent"
          [(wolZIndex)]="zIndex"
          [(wolMinResolution)]="minResolution"
          [(wolMaxResolution)]="maxResolution"
          [(wolMinZoom)]="minZoom"
          [(wolMaxZoom)]="maxZoom"
          [(wolSource)]="source"
          [wolStyle]="style()"
          [wolVariables]="variables()"
          [wolDisableHitDetection]="disableHitDetection()"
          [wolProperties]="properties()"
        />
      }
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestWebGLVectorTileLayerComponent {
  readonly className = signal('custom-class');
  readonly opacity = signal(0.8);
  readonly visible = signal(true);
  readonly extent = signal<Extent>([0, 1, 2, 3]);
  readonly zIndex = signal(5);
  readonly minResolution = signal(0.5);
  readonly maxResolution = signal(10);
  readonly minZoom = signal(2);
  readonly maxZoom = signal(9);
  readonly source = signal<VectorTileSource<RenderFeature> | undefined>(new VectorTileSource({}));
  readonly style = signal<FlatStyleLike>({ 'fill-color': 'red' });
  readonly variables = signal<StyleVariables>({ highlight: 0 });
  readonly disableHitDetection = signal(false);
  readonly properties = signal<WolProperties>({ foo: 'bar' });
  readonly destroyLayer = signal(false);
}
