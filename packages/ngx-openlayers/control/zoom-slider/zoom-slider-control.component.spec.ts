import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import Map from 'ol/Map';
import MapEvent from 'ol/MapEvent';
import { ObjectEvent } from 'ol/Object';
import ZoomSlider from 'ol/control/ZoomSlider';
import BaseEvent from 'ol/events/Event';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolZoomSliderControlComponent } from './zoom-slider-control.component';

describe('WolZoomSliderControlComponent', () => {
  let fixture: ComponentFixture<TestZoomSliderControlComponent>;
  let testComponent: TestZoomSliderControlComponent;
  let mapComponent: WolMapComponent;
  let mapInstance: Map;
  let zoomSliderComponent: WolZoomSliderControlComponent;
  let zoomSlider: ZoomSlider;

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestZoomSliderControlComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const mapDebugElement = fixture.debugElement.query(By.directive(WolMapComponent));
    const zoomSliderDebugElement = fixture.debugElement.query(
      By.directive(WolZoomSliderControlComponent),
    );

    testComponent = fixture.componentInstance;
    mapComponent = mapDebugElement.componentInstance;
    mapInstance = mapComponent.getInstance() as Map;
    zoomSliderComponent = zoomSliderDebugElement.componentInstance;
    zoomSlider = zoomSliderComponent.getInstance() as ZoomSlider;
  });

  it('should create the zoom slider control and register it on the map', () => {
    expect(zoomSliderComponent).toBeTruthy();
    expect(zoomSlider).toBeInstanceOf(ZoomSlider);
    const controls = mapInstance.getControls().getArray();
    expect(controls).toContain(zoomSlider);
  });

  it('should initialize the zoom slider control with provided inputs', () => {
    expect(zoomSlider.getProperties()).toMatchObject(testComponent.properties());
  });

  it('should initialize the zoom slider with the correct className on the element', () => {
    expect(zoomSlider['element'].className).toContain(testComponent.className());
  });

  it('should initialize the zoom slider with the correct duration', () => {
    // duration is set on the instance as a property
    expect(zoomSlider['duration_']).toBe(testComponent.duration());
  });

  it('should update properties when wolProperties input changes', () => {
    const setPropertiesSpy = vi.spyOn(zoomSlider, 'setProperties');
    const newProperties: WolProperties = { updated: true };
    testComponent.properties.set(newProperties);
    fixture.detectChanges();
    expect(setPropertiesSpy).toHaveBeenCalledWith(newProperties);
    expect(zoomSlider.getProperties()).toMatchObject(newProperties);
  });

  it('should update properties with empty object when wolProperties is set to undefined', () => {
    const setPropertiesSpy = vi.spyOn(zoomSlider, 'setProperties');
    testComponent.properties.set(undefined as unknown as WolProperties);
    fixture.detectChanges();
    expect(setPropertiesSpy).toHaveBeenCalledWith({});
  });

  it('should update target when wolTarget input changes', () => {
    const setTargetSpy = vi.spyOn(zoomSlider, 'setTarget');
    const newTarget = 'custom-target';
    testComponent.target.set(newTarget);
    fixture.detectChanges();
    expect(setTargetSpy).toHaveBeenCalledWith(newTarget);
  });

  it('should not throw when ngOnChanges is called with an unknown change key', () => {
    expect(() =>
      zoomSliderComponent.ngOnChanges({
        wolUnknown: {
          currentValue: 'anything',
          previousValue: undefined,
          firstChange: false,
          isFirstChange: () => false,
        },
      }),
    ).not.toThrow();
  });

  it('should emit change event when zoom slider triggers change', () => {
    const changeSpy = vi.spyOn(zoomSliderComponent.wolChange, 'emit');
    const changeEvent = new BaseEvent('change');
    zoomSlider.dispatchEvent(changeEvent);
    expect(changeSpy).toHaveBeenCalledWith(changeEvent);
  });

  it('should emit error event when zoom slider triggers error', () => {
    const errorSpy = vi.spyOn(zoomSliderComponent.wolError, 'emit');
    const errorEvent = new BaseEvent('error');
    zoomSlider.dispatchEvent(errorEvent);
    expect(errorSpy).toHaveBeenCalledWith(errorEvent);
  });

  it('should emit propertychange event when zoom slider triggers propertychange', () => {
    const propertyChangeSpy = vi.spyOn(zoomSliderComponent.wolPropertyChange, 'emit');
    const event = new ObjectEvent('propertychange', 'mapUnits', 'm');
    zoomSlider.dispatchEvent(event);
    expect(propertyChangeSpy).toHaveBeenCalledWith(event);
  });

  it('should expose the ZoomSlider instance via getInstance()', () => {
    expect(zoomSliderComponent.getInstance()).toBe(zoomSlider);
  });

  it('should remove the control from the Map when destroyed', () => {
    const removeControlSpy = vi.spyOn(mapInstance, 'removeControl');
    const instanceBeforeDestroy = zoomSliderComponent.getInstance() as ZoomSlider;
    testComponent.destroyControl.set(true);
    fixture.detectChanges();
    expect(zoomSliderComponent.getInstance()).toBeUndefined();
    expect(removeControlSpy).toHaveBeenCalledWith(instanceBeforeDestroy);
  });

  it('should not register the control on the map when rendered conditionally with @if', async () => {
    testComponent.destroyControl.set(true);
    fixture.detectChanges();
    const controls = mapInstance.getControls().getArray();
    expect(controls).not.toContain(zoomSlider);
  });

  it('should re-create and register the control when re-rendered after destroy', async () => {
    testComponent.destroyControl.set(true);
    fixture.detectChanges();

    testComponent.destroyControl.set(false);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const newZoomSliderDebugElement = fixture.debugElement.query(
      By.directive(WolZoomSliderControlComponent),
    );
    const newZoomSliderComponent: WolZoomSliderControlComponent =
      newZoomSliderDebugElement.componentInstance;
    const newZoomSlider = newZoomSliderComponent.getInstance();

    expect(newZoomSlider).toBeInstanceOf(ZoomSlider);
    expect(mapInstance.getControls().getArray()).toContain(newZoomSlider);
  });
});

@Component({
  selector: 'wol-test-zoom-slider-control',
  imports: [WolMapComponent, WolViewComponent, WolZoomSliderControlComponent],
  template: `
    <wol-map>
      <wol-view [wolZoom]="2" [wolCenter]="[0, 0]" />
      @if (!destroyControl()) {
        <wol-zoom-slider-control
          [wolClassName]="className()"
          [wolDuration]="duration()"
          [wolRender]="render()"
          [wolTarget]="target()"
          [wolProperties]="properties()"
        />
      }
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestZoomSliderControlComponent {
  className = signal('custom-zoom-slider');
  duration = signal(200);
  render = signal<(event: MapEvent) => void>(() => void 0);
  target = signal<HTMLElement | string | undefined>(undefined);
  properties = signal<WolProperties>({ foo: 'bar' });
  destroyControl = signal(false);
}
