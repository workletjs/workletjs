import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import Map from 'ol/Map';
import { ObjectEvent } from 'ol/Object';
import BaseEvent from 'ol/events/Event';
import { Extent } from 'ol/extent';
import ImageLayer from 'ol/layer/Image';
import RenderEvent from 'ol/render/Event';
import ImageSource from 'ol/source/Image';
import ImageStatic from 'ol/source/ImageStatic';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolImageLayerComponent } from './image-layer.component';

const makeSource = () => new ImageStatic({ url: '', imageExtent: [0, 0, 1, 1] });

describe('WolImageLayerComponent', () => {
  let fixture: ComponentFixture<TestImageLayerComponent>;
  let testComponent: TestImageLayerComponent;
  let mapInstance: Map;
  let layerComponent: WolImageLayerComponent;
  let layer: ImageLayer<ImageSource>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestImageLayerComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    testComponent = fixture.componentInstance;
    mapInstance = fixture.debugElement
      .query(By.directive(WolMapComponent))
      .componentInstance.getInstance() as Map;
    layerComponent = fixture.debugElement.query(
      By.directive(WolImageLayerComponent),
    ).componentInstance;
    layer = layerComponent.getInstance() as ImageLayer<ImageSource>;
  });

  it('should create the layer and register it on the map', () => {
    expect(layerComponent).toBeTruthy();
    expect(layer).toBeInstanceOf(ImageLayer);
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

  // ─── ngOnChanges ────────────────────────────────────────────────────────────

  it('should update opacity via ngOnChanges', () => {
    testComponent.opacity.set(0.3);
    fixture.detectChanges();
    expect(layer.getOpacity()).toBe(0.3);
  });

  it('should update visible via ngOnChanges', () => {
    testComponent.visible.set(false);
    fixture.detectChanges();
    expect(layer.getVisible()).toBe(false);
  });

  it('should update extent via ngOnChanges', () => {
    const newExtent: Extent = [10, 20, 30, 40];
    testComponent.extent.set(newExtent);
    fixture.detectChanges();
    expect(layer.getExtent()).toEqual(newExtent);
  });

  it('should update zIndex via ngOnChanges', () => {
    testComponent.zIndex.set(10);
    fixture.detectChanges();
    expect(layer.getZIndex()).toBe(10);
  });

  it('should update minResolution via ngOnChanges', () => {
    testComponent.minResolution.set(0.25);
    fixture.detectChanges();
    expect(layer.getMinResolution()).toBe(0.25);
  });

  it('should update maxResolution via ngOnChanges', () => {
    testComponent.maxResolution.set(20);
    fixture.detectChanges();
    expect(layer.getMaxResolution()).toBe(20);
  });

  it('should update minZoom via ngOnChanges', () => {
    testComponent.minZoom.set(3);
    fixture.detectChanges();
    expect(layer.getMinZoom()).toBe(3);
  });

  it('should update maxZoom via ngOnChanges', () => {
    testComponent.maxZoom.set(14);
    fixture.detectChanges();
    expect(layer.getMaxZoom()).toBe(14);
  });

  it('should update source via ngOnChanges', () => {
    const newSource = makeSource();
    testComponent.source.set(newSource);
    fixture.detectChanges();
    expect(layer.getSource()).toBe(newSource);
  });

  it('should update properties via ngOnChanges', () => {
    const newProperties: WolProperties = { updated: true };
    testComponent.properties.set(newProperties);
    fixture.detectChanges();
    expect(layer.getProperties()).toMatchObject(newProperties);
  });

  // ─── Two-way model bindings ──────────────────────────────────────────────────

  it('should update wolOpacity model and host signal when OL fires change:opacity', () => {
    const spy = vi.spyOn(layerComponent.wolOpacity, 'set');
    layer.setOpacity(0.2);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(0.2);
    expect(testComponent.opacity()).toBe(0.2);
  });

  it('should update wolVisible model and host signal when OL fires change:visible', () => {
    const spy = vi.spyOn(layerComponent.wolVisible, 'set');
    layer.setVisible(false);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(false);
    expect(testComponent.visible()).toBe(false);
  });

  it('should update wolExtent model and host signal when OL fires change:extent', () => {
    const extent: Extent = [1, 2, 3, 4];
    const spy = vi.spyOn(layerComponent.wolExtent, 'set');
    layer.setExtent(extent);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(extent);
    expect(testComponent.extent()).toEqual(extent);
  });

  it('should update wolZIndex model and host signal when OL fires change:zIndex', () => {
    const spy = vi.spyOn(layerComponent.wolZIndex, 'set');
    layer.setZIndex(20);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(20);
    expect(testComponent.zIndex()).toBe(20);
  });

  it('should update wolMinResolution model and host signal when OL fires change:minResolution', () => {
    const spy = vi.spyOn(layerComponent.wolMinResolution, 'set');
    layer.setMinResolution(0.1);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(0.1);
    expect(testComponent.minResolution()).toBe(0.1);
  });

  it('should update wolMaxResolution model and host signal when OL fires change:maxResolution', () => {
    const spy = vi.spyOn(layerComponent.wolMaxResolution, 'set');
    layer.setMaxResolution(30);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(30);
    expect(testComponent.maxResolution()).toBe(30);
  });

  it('should update wolMinZoom model and host signal when OL fires change:minZoom', () => {
    const spy = vi.spyOn(layerComponent.wolMinZoom, 'set');
    layer.setMinZoom(1);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(1);
    expect(testComponent.minZoom()).toBe(1);
  });

  it('should update wolMaxZoom model and host signal when OL fires change:maxZoom', () => {
    const spy = vi.spyOn(layerComponent.wolMaxZoom, 'set');
    layer.setMaxZoom(15);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(15);
    expect(testComponent.maxZoom()).toBe(15);
  });

  it('should update wolSource model and host signal when OL fires change:source', () => {
    const newSource = makeSource();
    const spy = vi.spyOn(layerComponent.wolSource, 'set');
    layer.setSource(newSource);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(newSource);
    expect(testComponent.source()).toBe(newSource);
  });

  // ─── Output events ───────────────────────────────────────────────────────────

  it('should emit wolChange when layer dispatches a change event', () => {
    const spy = vi.spyOn(layerComponent.wolChange, 'emit');
    const event = new BaseEvent('change');
    layer.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolError when layer dispatches an error event', () => {
    const spy = vi.spyOn(layerComponent.wolError, 'emit');
    const event = new BaseEvent('error');
    layer.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolPostRender when layer dispatches a postrender event', () => {
    const spy = vi.spyOn(layerComponent.wolPostRender, 'emit');
    const event = new RenderEvent('postrender', undefined, undefined, undefined);
    layer.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolPreRender when layer dispatches a prerender event', () => {
    const spy = vi.spyOn(layerComponent.wolPreRender, 'emit');
    const event = new RenderEvent('prerender', undefined, undefined, undefined);
    layer.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolPropertyChange when layer dispatches a propertychange event', () => {
    const spy = vi.spyOn(layerComponent.wolPropertyChange, 'emit');
    const event = new ObjectEvent('propertychange', 'opacity', 0.5);
    layer.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  // ─── Lifecycle ───────────────────────────────────────────────────────────────

  it('should remove the layer from the map when destroyed', () => {
    const removeLayerSpy = vi.spyOn(mapInstance, 'removeLayer');
    testComponent.destroyLayer.set(true);
    fixture.detectChanges();
    expect(layerComponent.getInstance()).toBeUndefined();
    expect(removeLayerSpy).toHaveBeenCalledWith(layer);
  });
});

@Component({
  selector: 'wol-test-image-layer',
  imports: [WolMapComponent, WolViewComponent, WolImageLayerComponent],
  template: `
    <wol-map>
      <wol-view [wolZoom]="2" [wolCenter]="[0, 0]" />
      @if (!destroyLayer()) {
        <wol-image-layer
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
          [wolProperties]="properties()"
        />
      }
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestImageLayerComponent {
  readonly className = signal('custom-class');
  readonly opacity = signal(0.8);
  readonly visible = signal(true);
  readonly extent = signal<Extent>([0, 1, 2, 3]);
  readonly zIndex = signal(5);
  readonly minResolution = signal(0.5);
  readonly maxResolution = signal(10);
  readonly minZoom = signal(2);
  readonly maxZoom = signal(9);
  readonly source = signal<ImageSource | undefined>(makeSource());
  readonly properties = signal<WolProperties>({ foo: 'bar' });
  readonly destroyLayer = signal(false);
}
