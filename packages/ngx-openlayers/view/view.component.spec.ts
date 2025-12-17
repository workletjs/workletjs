import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { vi } from 'vitest';
import { Coordinate } from 'ol/coordinate';
import { ObjectEvent } from 'ol/Object';
import BaseEvent from 'ol/events/Event';
import View from 'ol/View';

import { WolSafeAny } from '@workletjs/ngx-openlayers/core/types';
import { WolMapComponent, WolMapModule } from '@workletjs/ngx-openlayers/map';

import { WolViewModule } from './view.module';
import { WolViewComponent } from './view.component';

describe('WolViewComponent', () => {
  let fixture: ComponentFixture<TestAppComponent>;
  let testComponent: TestAppComponent;
  let viewDebugElement: DebugElement;
  let viewComponent: WolViewComponent;
  let mapDebugElement: DebugElement;
  let mapComponent: WolMapComponent;

  beforeEach(() => {
    fixture = TestBed.createComponent(TestAppComponent);
    fixture.detectChanges();

    testComponent = fixture.debugElement.componentInstance;
    mapDebugElement = fixture.debugElement.query(By.directive(WolMapComponent));
    mapComponent = mapDebugElement.componentInstance;
    viewDebugElement = fixture.debugElement.query(By.directive(WolViewComponent));
    viewComponent = viewDebugElement.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(viewComponent).toBeTruthy();
  });

  it('should initialize view and set it to map', fakeAsync(() => {
    fixture.detectChanges();

    const view = viewComponent.getInstance();
    const map = mapComponent.getInstance();

    expect(view).toBeInstanceOf(View);
    expect(view).toEqual(map?.getView());
    expect(view?.getCenter()).toEqual(testComponent.center);
    expect(view?.getConstrainResolution()).toEqual(testComponent.constrainResolution);
    expect(view?.getMaxZoom()).toEqual(testComponent.maxZoom);
    expect(view?.getMinZoom()).toEqual(testComponent.minZoom);
    expect(view?.getRotation()).toEqual(testComponent.rotation);
    expect(view?.getZoom()).toEqual(testComponent.zoom);
  }));

  it('should be able to change the view center via input', fakeAsync(() => {
    fixture.detectChanges();

    const view = viewComponent.getInstance();
    const newCenter: Coordinate = [10, 20];

    testComponent.center = newCenter;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(view?.getCenter()).toEqual(newCenter);
  }));

  it('should be able to change the view constrainResolution via input', fakeAsync(() => {
    fixture.detectChanges();

    const view = viewComponent.getInstance();
    const newConstrainResolution = true;

    testComponent.constrainResolution = newConstrainResolution;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(view?.getConstrainResolution()).toBe(newConstrainResolution);
  }));

  it('should be able to change the view zoom via input', fakeAsync(() => {
    fixture.detectChanges();

    const view = viewComponent.getInstance();
    const newZoom = 5;

    testComponent.zoom = newZoom;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(view?.getZoom()).toBe(newZoom);
  }));

  it('should be able to change the view maxZoom via input', fakeAsync(() => {
    fixture.detectChanges();

    const view = viewComponent.getInstance();
    const newMaxZoom = 15;

    testComponent.maxZoom = newMaxZoom;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(view?.getMaxZoom()).toBe(newMaxZoom);
  }));

  it('should be able to change the view minZoom via input', fakeAsync(() => {
    fixture.detectChanges();

    const view = viewComponent.getInstance();
    const newMinZoom = 2;

    testComponent.minZoom = newMinZoom;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(view?.getMinZoom()).toBe(newMinZoom);
  }));

  it('should be able to change the view properties via input', fakeAsync(() => {
    fixture.detectChanges();

    const view = viewComponent.getInstance();
    const newProperties = { testProp: 'testValue' };

    testComponent.properties = newProperties;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(view?.get('testProp')).toBe('testValue');
  }));

  it('should be able to change the view resolution via input', fakeAsync(() => {
    fixture.detectChanges();

    const view = viewComponent.getInstance();
    const newResolution = 50;

    testComponent.resolution = newResolution;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(view?.getResolution()).toBe(newResolution);
  }));

  it('should be able to change the view rotation via input', fakeAsync(() => {
    fixture.detectChanges();

    const view = viewComponent.getInstance();
    const newRotation = Math.PI / 4;

    testComponent.rotation = newRotation;
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(view?.getRotation()).toBe(newRotation);
  }));

  // handle change event
  it('should emit change event', fakeAsync(() => {
    fixture.detectChanges();

    const view = viewComponent.getInstance();
    const changeSpy = vi.spyOn(testComponent, 'onChange');

    view?.changed(); // Trigger change event

    expect(changeSpy).toHaveBeenCalled();
  }));

  it('should emit center change event', fakeAsync(() => {
    fixture.detectChanges();

    const view = viewComponent.getInstance();
    const newCenter: Coordinate = [30, 40];

    viewComponent.wolCenter.set([0, 0]); // Reset center
    const centerSpy = vi.spyOn(viewComponent.wolCenter, 'set');

    view?.setCenter(newCenter);
    expect(centerSpy).toHaveBeenCalledWith(newCenter);
  }));

  it('should emit resolution change event', fakeAsync(() => {
    fixture.detectChanges();

    const view = viewComponent.getInstance();
    const newResolution = 25;

    viewComponent.wolResolution.set(100); // Reset resolution
    viewComponent.wolZoom.set(0); // Reset zoom

    const resolutionSpy = vi.spyOn(viewComponent.wolResolution, 'set');
    const zoomSpy = vi.spyOn(viewComponent.wolZoom, 'set');

    view?.setResolution(newResolution);

    expect(resolutionSpy).toHaveBeenCalledWith(newResolution);
    expect(zoomSpy).toHaveBeenCalledWith(view?.getZoom());
  }));

  it('should emit rotation change event', fakeAsync(() => {
    fixture.detectChanges();

    const view = viewComponent.getInstance();
    const newRotation = Math.PI / 2;

    viewComponent.wolRotation.set(0); // Reset rotation
    const rotationSpy = vi.spyOn(viewComponent.wolRotation, 'set');

    view?.setRotation(newRotation);
    expect(rotationSpy).toHaveBeenCalledWith(newRotation);
  }));

  it('should emit error event', fakeAsync(() => {
    fixture.detectChanges();

    const view = viewComponent.getInstance();
    const errorSpy = vi.spyOn(testComponent, 'onError');

    const errorEvent = new BaseEvent('error');
    view?.dispatchEvent(errorEvent);

    expect(errorSpy).toHaveBeenCalledWith(errorEvent);
  }));

  it('should emit propertychange event', fakeAsync(() => {
    fixture.detectChanges();

    const view = viewComponent.getInstance();
    const propertyChangeSpy = vi.spyOn(testComponent, 'onPropertyChange');

    const propertyChangeEvent = new ObjectEvent('propertychange', 'testProp', 123);
    view?.dispatchEvent(propertyChangeEvent);

    expect(propertyChangeSpy).toHaveBeenCalledWith(propertyChangeEvent);
  }));
});

@Component({
  template: `
    <wol-map>
      <wol-view
        [wolCenter]="center"
        [wolZoom]="zoom"
        [wolRotation]="rotation"
        [wolResolution]="resolution"
        [wolMaxZoom]="maxZoom"
        [wolMinZoom]="minZoom"
        [wolConstrainResolution]="constrainResolution"
        [wolProperties]="properties"
        (wolChange)="onChange($event)"
        (wolPropertyChange)="onPropertyChange($event)"
        (wolError)="onError($event)"
      />
    </wol-map>
  `,
  imports: [WolMapModule, WolViewModule],
})
class TestAppComponent {
  center: Coordinate = [0, 0];
  zoom = 2;
  rotation = 0;
  resolution?: number | undefined;
  maxZoom = 20;
  minZoom = 0;
  constrainResolution = false;
  properties: Record<string, WolSafeAny> = {};

  onChange = vi.fn();
  onPropertyChange = vi.fn();
  onError = vi.fn();
}
