import { vi } from 'vitest';

import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import Map from 'ol/Map';
import BaseEvent from 'ol/events/Event';
import { Extent } from 'ol/extent';
import Graticule from 'ol/layer/Graticule';
import Stroke from 'ol/style/Stroke';
import Text from 'ol/style/Text';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolGraticuleLayerComponent } from './graticule-layer.component';

describe('WolGraticuleLayerComponent', () => {
  let fixture: ComponentFixture<TestGraticuleLayerComponent>;
  let testComponent: TestGraticuleLayerComponent;
  let mapComponent: WolMapComponent;
  let mapInstance: Map;
  let graticuleLayerComponent: WolGraticuleLayerComponent;
  let graticuleLayer: Graticule;

  beforeEach(() => {
    fixture = TestBed.createComponent(TestGraticuleLayerComponent);
    fixture.detectChanges();

    const mapDebugElement = fixture.debugElement.query(By.directive(WolMapComponent));
    const graticuleLayerDebugElement = fixture.debugElement.query(
      By.directive(WolGraticuleLayerComponent),
    );

    testComponent = fixture.debugElement.componentInstance;
    mapComponent = mapDebugElement.componentInstance;
    mapInstance = mapComponent.getInstance() as Map;
    graticuleLayerComponent = graticuleLayerDebugElement.componentInstance;
    graticuleLayer = graticuleLayerComponent.getInstance() as Graticule;
  });

  it('should create the graticule layer and register it on the map', () => {
    fixture.detectChanges();
    const layers = mapInstance.getLayers().getArray();

    expect(graticuleLayerComponent).toBeTruthy();
    expect(graticuleLayer).toBeInstanceOf(Graticule);
    expect(layers).toContain(graticuleLayer);
  });

  it('should initialize the graticule layer with provided inputs', () => {
    fixture.detectChanges();

    expect(graticuleLayer.getClassName()).toBe(testComponent.className);
    expect(graticuleLayer.getOpacity()).toBe(testComponent.opacity);
    expect(graticuleLayer.getVisible()).toBe(testComponent.visible);
    expect(graticuleLayer.getExtent()).toEqual(testComponent.extent);
    expect(graticuleLayer.getZIndex()).toBe(testComponent.zIndex);
    expect(graticuleLayer.getMinResolution()).toBe(testComponent.minResolution);
    expect(graticuleLayer.getMaxResolution()).toBe(testComponent.maxResolution);
    expect(graticuleLayer.getMinZoom()).toBe(testComponent.minZoom);
    expect(graticuleLayer.getMaxZoom()).toBe(testComponent.maxZoom);
    expect(graticuleLayer['maxLines_']).toBe(testComponent.maxLines);
    expect(graticuleLayer['strokeStyle_']).toBe(testComponent.strokeStyle);
    expect(graticuleLayer['targetSize_']).toBe(testComponent.targetSize);
    if (testComponent.showLabels) {
      expect(graticuleLayer['lonLabelFormatter_']).toBe(testComponent.lonLabelFormatter);
      expect(graticuleLayer['latLabelFormatter_']).toBe(testComponent.latLabelFormatter);
      expect(graticuleLayer['lonLabelPosition_']).toBe(testComponent.lonLabelPosition);
      expect(graticuleLayer['latLabelPosition_']).toBe(testComponent.latLabelPosition);
      expect(graticuleLayer['lonLabelStyleBase_'].getText()).toEqual(testComponent.lonLabelStyle);
      expect(graticuleLayer['latLabelStyleBase_'].getText()).toEqual(testComponent.latLabelStyle);
    }
    expect(graticuleLayer['intervals_']).toEqual(testComponent.intervals);
    expect(graticuleLayer['values_']['wrapX']).toBe(testComponent.wrapX);
    expect(graticuleLayer.getProperties()).toMatchObject(testComponent.properties);
  });

  it('should update extent when wolExtent input changes', () => {
    const newExtent: Extent = [10, 20, 30, 40];
    testComponent.extent = newExtent;
    fixture.detectChanges();
    expect(graticuleLayer.getExtent()).toEqual(newExtent);
  });

  it('should update maxResolution when wolMaxResolution input changes', () => {
    const newMaxResolution = 15;
    testComponent.maxResolution = newMaxResolution;
    fixture.detectChanges();
    expect(graticuleLayer.getMaxResolution()).toBe(newMaxResolution);
  });

  it('should update maxZoom when wolMaxZoom input changes', () => {
    const newMaxZoom = 14;
    testComponent.maxZoom = newMaxZoom;
    fixture.detectChanges();
    expect(graticuleLayer.getMaxZoom()).toBe(newMaxZoom);
  });

  it('should update minResolution when wolMinResolution input changes', () => {
    const newMinResolution = 0.75;
    testComponent.minResolution = newMinResolution;
    fixture.detectChanges();
    expect(graticuleLayer.getMinResolution()).toBe(newMinResolution);
  });

  it('should update minZoom when wolMinZoom input changes', () => {
    const newMinZoom = 3;
    testComponent.minZoom = newMinZoom;
    fixture.detectChanges();
    expect(graticuleLayer.getMinZoom()).toBe(newMinZoom);
  });

  it('should update opacity when wolOpacity input changes', () => {
    const newOpacity = 0.4;
    testComponent.opacity = newOpacity;
    fixture.detectChanges();
    expect(graticuleLayer.getOpacity()).toBe(newOpacity);
  });

  it('should update visible when wolVisible input changes', () => {
    const newVisible = true;
    testComponent.visible = newVisible;
    fixture.detectChanges();
    expect(graticuleLayer.getVisible()).toBe(newVisible);
  });

  it('should update zIndex when wolZIndex input changes', () => {
    const newZIndex = 7;
    testComponent.zIndex = newZIndex;
    fixture.detectChanges();
    expect(graticuleLayer.getZIndex()).toBe(newZIndex);
  });

  it('should update properties when wolProperties input changes', () => {
    const newProperties: WolProperties = { updated: true };
    testComponent.properties = newProperties;
    fixture.detectChanges();
    expect(graticuleLayer.getProperties()).toMatchObject(newProperties);
  });

  it('should emit change event when graticule layer triggers change', () => {
    const changeSpy = vi.spyOn(graticuleLayerComponent.wolChange, 'emit');
    const changeEvent = new BaseEvent('change');

    graticuleLayer.dispatchEvent(changeEvent);

    expect(changeSpy).toHaveBeenCalledWith(changeEvent);
  });

  it('should emit `change:extent` event when extent changes', () => {
    const extent: Extent = [1, 2, 3, 4];
    const changeExtentSpy = vi.spyOn(graticuleLayerComponent.wolExtent, 'set');
    graticuleLayer.setExtent(extent);
    fixture.detectChanges();
    expect(changeExtentSpy).toHaveBeenCalledWith(extent);
  });

  it('should emit `change:maxResolution` event when maxResolution changes', () => {
    const changeMaxResolutionSpy = vi.spyOn(graticuleLayerComponent.wolMaxResolution, 'set');
    graticuleLayer.setMaxResolution(25);
    fixture.detectChanges();
    expect(changeMaxResolutionSpy).toHaveBeenCalledWith(25);
  });

  it('should emit `change:maxZoom` event when maxZoom changes', () => {
    const changeMaxZoomSpy = vi.spyOn(graticuleLayerComponent.wolMaxZoom, 'set');
    graticuleLayer.setMaxZoom(11);
    fixture.detectChanges();
    expect(changeMaxZoomSpy).toHaveBeenCalledWith(11);
  });

  it('should emit `change:minResolution` event when minResolution changes', () => {
    const changeMinResolutionSpy = vi.spyOn(graticuleLayerComponent.wolMinResolution, 'set');
    graticuleLayer.setMinResolution(0.25);
    fixture.detectChanges();
    expect(changeMinResolutionSpy).toHaveBeenCalledWith(0.25);
  });

  it('should emit `change:minZoom` event when minZoom changes', () => {
    const changeMinZoomSpy = vi.spyOn(graticuleLayerComponent.wolMinZoom, 'set');
    graticuleLayer.setMinZoom(1);
    fixture.detectChanges();
    expect(changeMinZoomSpy).toHaveBeenCalledWith(1);
  });

  it('should emit `change:opacity` event when opacity changes', () => {
    const changeOpacitySpy = vi.spyOn(graticuleLayerComponent.wolOpacity, 'set');
    graticuleLayer.setOpacity(0.7);
    fixture.detectChanges();
    expect(changeOpacitySpy).toHaveBeenCalledWith(0.7);
  });

  it('should emit `change:visible` event when visibility changes', () => {
    const changeVisibleSpy = vi.spyOn(graticuleLayerComponent.wolVisible, 'set');
    graticuleLayer.setVisible(true);
    fixture.detectChanges();
    expect(changeVisibleSpy).toHaveBeenCalledWith(true);
  });

  it('should emit `change:zIndex` event when zIndex changes', () => {
    const changeZIndexSpy = vi.spyOn(graticuleLayerComponent.wolZIndex, 'set');
    graticuleLayer.setZIndex(20);
    fixture.detectChanges();
    expect(changeZIndexSpy).toHaveBeenCalledWith(20);
  });

  it('should emit `error` event when graticule layer triggers error', () => {
    const errorSpy = vi.spyOn(graticuleLayerComponent.wolError, 'emit');
    const errorEvent = new BaseEvent('error');

    graticuleLayer.dispatchEvent(errorEvent);

    expect(errorSpy).toHaveBeenCalledWith(errorEvent);
  });

  it('should emit `propertychange` event when graticule layer triggers propertychange', () => {
    const propertyChangeSpy = vi.spyOn(graticuleLayerComponent.wolPropertyChange, 'emit');
    const propertyChangeEvent = new BaseEvent('propertychange');

    graticuleLayer.dispatchEvent(propertyChangeEvent);

    expect(propertyChangeSpy).toHaveBeenCalledWith(propertyChangeEvent);
  });

  it('should emit `sourceready` event when graticule layer triggers sourceready', () => {
    const sourceReadySpy = vi.spyOn(graticuleLayerComponent.wolSourceReady, 'emit');
    const sourceReadyEvent = new BaseEvent('sourceready');

    graticuleLayer.dispatchEvent(sourceReadyEvent);

    expect(sourceReadySpy).toHaveBeenCalledWith(sourceReadyEvent);
  });

  it('should remove the layer from the Map when destroyed', () => {
    const removeLayerSpy = vi.spyOn(mapInstance, 'removeLayer');

    testComponent.destroyLayer = true;
    fixture.detectChanges();

    expect(graticuleLayerComponent.getInstance()).toBeUndefined();
    expect(removeLayerSpy).toHaveBeenCalledWith(graticuleLayer);
  });
});

@Component({
  imports: [WolMapComponent, WolViewComponent, WolGraticuleLayerComponent],
  template: `
    <wol-map>
      <wol-view [wolZoom]="2" [wolCenter]="[0, 0]" />
      @if (!destroyLayer) {
        <wol-graticule-layer
          [wolClassName]="className"
          [wolOpacity]="opacity"
          [wolVisible]="visible"
          [wolExtent]="extent"
          [wolZIndex]="zIndex"
          [wolMinResolution]="minResolution"
          [wolMaxResolution]="maxResolution"
          [wolMinZoom]="minZoom"
          [wolMaxZoom]="maxZoom"
          [wolMaxLines]="maxLines"
          [wolStrokeStyle]="strokeStyle"
          [wolTargetSize]="targetSize"
          [wolShowLabels]="showLabels"
          [wolLonLabelFormatter]="lonLabelFormatter"
          [wolLatLabelFormatter]="latLabelFormatter"
          [wolLonLabelPosition]="lonLabelPosition"
          [wolLatLabelPosition]="latLabelPosition"
          [wolLonLabelStyle]="lonLabelStyle"
          [wolLatLabelStyle]="latLabelStyle"
          [wolIntervals]="intervals"
          [wolWrapX]="wrapX"
          [wolProperties]="properties"
        />
      }
    </wol-map>
  `,
})
class TestGraticuleLayerComponent {
  className = 'custom-class';
  opacity = 0.3;
  visible = false;
  extent: Extent = [0, 1, 2, 3];
  zIndex = 5;
  minResolution = 0.5;
  maxResolution = 10;
  minZoom = 2;
  maxZoom = 9;
  maxLines = 12;
  strokeStyle = new Stroke({ color: 'red' });
  targetSize = 240;
  showLabels = true;
  lonLabelFormatter = (lon: number) => `lon-${lon}`;
  latLabelFormatter = (lat: number) => `lat-${lat}`;
  lonLabelPosition = 0.2;
  latLabelPosition = 0.8;
  lonLabelStyle = new Text({ text: 'lon' });
  latLabelStyle = new Text({ text: 'lat' });
  intervals = [30, 10];
  wrapX = false;
  properties: WolProperties = { foo: 'bar' };
  destroyLayer = false;
}
