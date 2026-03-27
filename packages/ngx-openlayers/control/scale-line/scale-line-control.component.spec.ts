import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import Map from 'ol/Map';
import MapEvent from 'ol/MapEvent';
import { ObjectEvent } from 'ol/Object';
import ScaleLine, { Units } from 'ol/control/ScaleLine';
import BaseEvent from 'ol/events/Event';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolScaleLineControlComponent } from './scale-line-control.component';

describe('WolScaleLineControlComponent', () => {
  let fixture: ComponentFixture<TestScaleLineControlComponent>;
  let testComponent: TestScaleLineControlComponent;
  let mapComponent: WolMapComponent;
  let mapInstance: Map;
  let scaleLineControlComponent: WolScaleLineControlComponent;
  let scaleLineControl: ScaleLine;

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestScaleLineControlComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const mapDebugElement = fixture.debugElement.query(By.directive(WolMapComponent));
    const scaleLineDebugElement = fixture.debugElement.query(
      By.directive(WolScaleLineControlComponent),
    );

    testComponent = fixture.componentInstance;
    mapComponent = mapDebugElement.componentInstance;
    mapInstance = mapComponent.getInstance() as Map;
    scaleLineControlComponent = scaleLineDebugElement.componentInstance;
    scaleLineControl = scaleLineControlComponent.getInstance() as ScaleLine;
  });

  it('should create the scale line control and register it on the map', () => {
    expect(scaleLineControlComponent).toBeTruthy();
    expect(scaleLineControl).toBeInstanceOf(ScaleLine);
    const controls = mapInstance.getControls().getArray();
    expect(controls).toContain(scaleLineControl);
  });

  it('should return the ScaleLine instance from getInstance()', () => {
    expect(scaleLineControlComponent.getInstance()).toBeInstanceOf(ScaleLine);
    expect(scaleLineControlComponent.getInstance()).toBe(scaleLineControl);
  });

  describe('initialization', () => {
    it('should initialize with wolClassName applied on the element', () => {
      expect(scaleLineControl['element'].className).toContain(testComponent.className());
    });

    it('should initialize with wolUnits', () => {
      expect(scaleLineControl.getUnits()).toBe(testComponent.units());
    });

    it('should initialize with wolMinWidth', () => {
      expect(scaleLineControl['minWidth_']).toBe(testComponent.minWidth());
    });

    it('should initialize with wolMaxWidth', () => {
      expect(scaleLineControl['maxWidth_']).toBe(testComponent.maxWidth());
    });

    it('should initialize with wolBar false (no scalebar element rendered)', () => {
      // When bar is false the ol-scale-bar class should not be present
      expect(scaleLineControl['element'].classList.contains('ol-scale-bar')).toBe(false);
    });

    it('should initialize with wolSteps and wolText without throwing', () => {
      // steps and text are scalebar-mode only options; instance must still be valid
      expect(scaleLineControl).toBeInstanceOf(ScaleLine);
    });

    it('should create a valid instance when wolBar is true via a separate fixture', async () => {
      const barFixture = TestBed.createComponent(TestScaleLineBarComponent);
      barFixture.detectChanges();
      await barFixture.whenStable();
      barFixture.detectChanges();
      const barDebugEl = barFixture.debugElement.query(By.directive(WolScaleLineControlComponent));
      const barComponent = barDebugEl.componentInstance as WolScaleLineControlComponent;
      expect(barComponent.getInstance()).toBeInstanceOf(ScaleLine);
      expect(
        (barComponent.getInstance() as ScaleLine)['element'].classList.contains('ol-scale-bar'),
      ).toBe(true);
    });

    it('should initialize with wolDpi', () => {
      expect((scaleLineControl as unknown as { dpi_: number | undefined })['dpi_']).toBe(
        testComponent.dpi(),
      );
    });

    it('should initialize with wolProperties', () => {
      expect(scaleLineControl.getProperties()).toMatchObject(testComponent.properties());
    });

    it('should accept a wolRender function without throwing', () => {
      expect(scaleLineControl).toBeDefined();
    });
  });

  describe('input changes', () => {
    it('should update units when wolUnits input changes', () => {
      const setUnitsSpy = vi.spyOn(scaleLineControl, 'setUnits');
      testComponent.units.set('imperial');
      fixture.detectChanges();
      expect(setUnitsSpy).toHaveBeenCalledWith('imperial');
      expect(scaleLineControl.getUnits()).toBe('imperial');
    });

    it('should update units back to metric when wolUnits changes to metric', () => {
      testComponent.units.set('imperial');
      fixture.detectChanges();
      const setUnitsSpy = vi.spyOn(scaleLineControl, 'setUnits');
      testComponent.units.set('metric');
      fixture.detectChanges();
      expect(setUnitsSpy).toHaveBeenCalledWith('metric');
      expect(scaleLineControl.getUnits()).toBe('metric');
    });

    it('should update dpi when wolDpi input changes', () => {
      const setDpiSpy = vi.spyOn(scaleLineControl, 'setDpi');
      testComponent.dpi.set(144);
      fixture.detectChanges();
      expect(setDpiSpy).toHaveBeenCalledWith(144);
    });

    it('should update dpi to undefined when wolDpi is cleared', () => {
      testComponent.dpi.set(144);
      fixture.detectChanges();
      const setDpiSpy = vi.spyOn(scaleLineControl, 'setDpi');
      testComponent.dpi.set(undefined);
      fixture.detectChanges();
      expect(setDpiSpy).toHaveBeenCalledWith(undefined);
    });

    it('should update target when wolTarget changes to a string', () => {
      const setTargetSpy = vi.spyOn(scaleLineControl, 'setTarget');
      testComponent.target.set('new-container');
      fixture.detectChanges();
      expect(setTargetSpy).toHaveBeenCalledWith('new-container');
    });

    it('should update target when wolTarget changes to an HTMLElement', () => {
      const setTargetSpy = vi.spyOn(scaleLineControl, 'setTarget');
      const newTarget = document.createElement('div');
      testComponent.target.set(newTarget);
      fixture.detectChanges();
      expect(setTargetSpy).toHaveBeenCalledWith(newTarget);
    });

    it('should update properties when wolProperties input changes', () => {
      const setPropertiesSpy = vi.spyOn(scaleLineControl, 'setProperties');
      const newProperties = { updated: true };
      testComponent.properties.set(newProperties);
      fixture.detectChanges();
      expect(setPropertiesSpy).toHaveBeenCalledWith(newProperties, false);
      expect(scaleLineControl.getProperties()).toMatchObject(newProperties);
    });

    it('should call setProperties with empty object when wolProperties is set to undefined', () => {
      const setPropertiesSpy = vi.spyOn(scaleLineControl, 'setProperties');
      testComponent.properties.set(undefined as unknown as Record<string, WolProperties>);
      fixture.detectChanges();
      expect(setPropertiesSpy).toHaveBeenCalledWith({}, false);
    });
  });

  describe('two-way model binding for wolUnits', () => {
    it('should update wolUnits model when units change on the instance', () => {
      const setUnitsSpy = vi.spyOn(scaleLineControlComponent.wolUnits, 'set');
      scaleLineControl.setUnits('nautical');
      expect(setUnitsSpy).toHaveBeenCalledWith('nautical');
    });

    it('should reflect updated units value in the model after instance change', () => {
      scaleLineControl.setUnits('us');
      expect(scaleLineControlComponent.wolUnits()).toBe('us');
    });
  });

  describe('output events', () => {
    it('should emit wolChange when the control dispatches a change event', () => {
      const changeSpy = vi.spyOn(scaleLineControlComponent.wolChange, 'emit');
      const changeEvent = new BaseEvent('change');
      scaleLineControl.dispatchEvent(changeEvent);
      expect(changeSpy).toHaveBeenCalledWith(changeEvent);
    });

    it('should emit wolError when the control dispatches an error event', () => {
      const errorSpy = vi.spyOn(scaleLineControlComponent.wolError, 'emit');
      const errorEvent = new BaseEvent('error');
      scaleLineControl.dispatchEvent(errorEvent);
      expect(errorSpy).toHaveBeenCalledWith(errorEvent);
    });

    it('should emit wolPropertyChange when the control dispatches a propertychange event', () => {
      const propertyChangeSpy = vi.spyOn(scaleLineControlComponent.wolPropertyChange, 'emit');
      const event = new ObjectEvent('propertychange', 'someKey', 'oldValue');
      scaleLineControl.dispatchEvent(event);
      expect(propertyChangeSpy).toHaveBeenCalledWith(event);
    });

    it('should emit wolChange only for change events and not for error events', () => {
      const changeSpy = vi.spyOn(scaleLineControlComponent.wolChange, 'emit');
      scaleLineControl.dispatchEvent(new BaseEvent('error'));
      expect(changeSpy).not.toHaveBeenCalled();
    });

    it('should emit wolError only for error events and not for change events', () => {
      const errorSpy = vi.spyOn(scaleLineControlComponent.wolError, 'emit');
      scaleLineControl.dispatchEvent(new BaseEvent('change'));
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('should emit wolPropertyChange only for propertychange events and not for change events', () => {
      const propertyChangeSpy = vi.spyOn(scaleLineControlComponent.wolPropertyChange, 'emit');
      scaleLineControl.dispatchEvent(new BaseEvent('change'));
      expect(propertyChangeSpy).not.toHaveBeenCalled();
    });
  });

  describe('destroy', () => {
    it('should remove the control from the map when the component is destroyed', () => {
      const removeControlSpy = vi.spyOn(mapInstance, 'removeControl');
      const instanceBeforeDestroy = scaleLineControlComponent.getInstance() as ScaleLine;
      testComponent.destroyControl.set(true);
      fixture.detectChanges();
      expect(scaleLineControlComponent.getInstance()).toBeUndefined();
      expect(removeControlSpy).toHaveBeenCalledWith(instanceBeforeDestroy);
    });

    it('should not emit wolChange after component is destroyed', () => {
      const changeSpy = vi.spyOn(scaleLineControlComponent.wolChange, 'emit');
      testComponent.destroyControl.set(true);
      fixture.detectChanges();
      scaleLineControl.dispatchEvent(new BaseEvent('change'));
      expect(changeSpy).not.toHaveBeenCalled();
    });

    it('should not emit wolError after component is destroyed', () => {
      const errorSpy = vi.spyOn(scaleLineControlComponent.wolError, 'emit');
      testComponent.destroyControl.set(true);
      fixture.detectChanges();
      scaleLineControl.dispatchEvent(new BaseEvent('error'));
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('should not emit wolPropertyChange after component is destroyed', () => {
      const propertyChangeSpy = vi.spyOn(scaleLineControlComponent.wolPropertyChange, 'emit');
      testComponent.destroyControl.set(true);
      fixture.detectChanges();
      scaleLineControl.dispatchEvent(new ObjectEvent('propertychange', 'key', 'old'));
      expect(propertyChangeSpy).not.toHaveBeenCalled();
    });

    it('should not update wolUnits model after component is destroyed', () => {
      const setUnitsSpy = vi.spyOn(scaleLineControlComponent.wolUnits, 'set');
      testComponent.destroyControl.set(true);
      fixture.detectChanges();
      scaleLineControl.setUnits('imperial');
      expect(setUnitsSpy).not.toHaveBeenCalled();
    });
  });
});

@Component({
  selector: 'wol-test-scale-line-control',
  imports: [WolMapComponent, WolViewComponent, WolScaleLineControlComponent],
  template: `
    <wol-map>
      <wol-view [wolZoom]="2" [wolCenter]="[0, 0]" />
      @if (!destroyControl()) {
        <wol-scale-line-control
          [wolClassName]="className()"
          [wolMinWidth]="minWidth()"
          [wolMaxWidth]="maxWidth()"
          [wolRender]="render"
          [wolTarget]="target()"
          [(wolUnits)]="units"
          [wolBar]="bar()"
          [wolSteps]="steps()"
          [wolText]="text()"
          [wolDpi]="dpi()"
          [wolProperties]="properties()"
        />
      }
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestScaleLineControlComponent {
  className = signal('custom-scale-line');
  minWidth = signal(64);
  maxWidth = signal(200);
  render = (): void => void 0;
  target = signal<HTMLElement | string>('');
  units = signal<Units>('metric');
  bar = signal(false);
  steps = signal(4);
  text = signal(false);
  dpi = signal<number | undefined>(96);
  properties = signal<WolProperties>({ foo: 'bar' });
  destroyControl = signal(false);
}

@Component({
  selector: 'wol-test-scale-line-bar',
  imports: [WolMapComponent, WolViewComponent, WolScaleLineControlComponent],
  template: `
    <wol-map>
      <wol-view [wolZoom]="2" [wolCenter]="[0, 0]" />
      <wol-scale-line-control [wolBar]="true" [wolSteps]="4" [wolText]="true" />
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestScaleLineBarComponent {}
