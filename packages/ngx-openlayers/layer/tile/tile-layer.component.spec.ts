import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import Map from 'ol/Map';
import { ObjectEvent } from 'ol/Object';
import BaseEvent from 'ol/events/Event';
import { Extent } from 'ol/extent';
import TileLayer from 'ol/layer/Tile';
import RenderEvent from 'ol/render/Event';
import OSM from 'ol/source/OSM';
import TileSource from 'ol/source/Tile';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolTileLayerComponent } from './tile-layer.component';

describe('WolTileLayerComponent', () => {
  let fixture: ComponentFixture<TestTileLayerComponent>;
  let testComponent: TestTileLayerComponent;
  let mapInstance: Map;
  let layerComponent: WolTileLayerComponent;
  let layer: TileLayer;

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestTileLayerComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    testComponent = fixture.componentInstance;
    mapInstance = fixture.debugElement
      .query(By.directive(WolMapComponent))
      .componentInstance.getInstance() as Map;
    layerComponent = fixture.debugElement.query(
      By.directive(WolTileLayerComponent),
    ).componentInstance;
    layer = layerComponent.getInstance() as TileLayer;
  });

  it('should create the layer and register it on the map', () => {
    expect(layerComponent).toBeTruthy();
    expect(layer).toBeInstanceOf(TileLayer);
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
    expect(layer.getPreload()).toBe(testComponent.preload());
    expect(layer.getSource()).toBe(testComponent.source());
    expect(layer.getUseInterimTilesOnError()).toBe(testComponent.useInterimTilesOnError());
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

  it('should update preload via ngOnChanges', () => {
    testComponent.preload.set(2);
    fixture.detectChanges();
    expect(layer.getPreload()).toBe(2);
  });

  it('should update source via ngOnChanges', () => {
    const newSource = new OSM();
    testComponent.source.set(newSource);
    fixture.detectChanges();
    expect(layer.getSource()).toBe(newSource);
  });

  it('should update useInterimTilesOnError via ngOnChanges', () => {
    testComponent.useInterimTilesOnError.set(false);
    fixture.detectChanges();
    expect(layer.getUseInterimTilesOnError()).toBe(false);
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

  it('should update wolPreload model and host signal when OL fires change:preload', () => {
    const spy = vi.spyOn(layerComponent.wolPreload, 'set');
    layer.setPreload(4);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(4);
    expect(testComponent.preload()).toBe(4);
  });

  it('should update wolSource model and host signal when OL fires change:source', () => {
    const newSource = new OSM();
    const spy = vi.spyOn(layerComponent.wolSource, 'set');
    layer.setSource(newSource);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(newSource);
    expect(testComponent.source()).toBe(newSource);
  });

  it('should update wolUseInterimTilesOnError model and host signal when OL fires change:useInterimTilesOnError', () => {
    const spy = vi.spyOn(layerComponent.wolUseInterimTilesOnError, 'set');
    layer.setUseInterimTilesOnError(false);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(false);
    expect(testComponent.useInterimTilesOnError()).toBe(false);
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

  it('should emit wolSourceReady when layer dispatches a sourceready event', () => {
    const spy = vi.spyOn(layerComponent.wolSourceReady, 'emit');
    const event = new BaseEvent('sourceready');
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
  selector: 'wol-test-tile-layer',
  imports: [WolMapComponent, WolViewComponent, WolTileLayerComponent],
  template: `
    <wol-map>
      <wol-view [wolZoom]="2" [wolCenter]="[0, 0]" />
      @if (!destroyLayer()) {
        <wol-tile-layer
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
          [wolProperties]="properties()"
        />
      }
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestTileLayerComponent {
  readonly className = signal('custom-class');
  readonly opacity = signal(0.8);
  readonly visible = signal(true);
  readonly extent = signal<Extent>([0, 1, 2, 3]);
  readonly zIndex = signal(5);
  readonly minResolution = signal(0.5);
  readonly maxResolution = signal(10);
  readonly minZoom = signal(2);
  readonly maxZoom = signal(9);
  readonly preload = signal(0);
  readonly source = signal<TileSource | undefined>(new OSM());
  readonly useInterimTilesOnError = signal(true);
  readonly properties = signal<WolProperties>({ foo: 'bar' });
  readonly destroyLayer = signal(false);
}
