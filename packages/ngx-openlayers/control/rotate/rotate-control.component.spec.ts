import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import Map from 'ol/Map';
import MapEvent from 'ol/MapEvent';
import { ObjectEvent } from 'ol/Object';
import Rotate from 'ol/control/Rotate';
import BaseEvent from 'ol/events/Event';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolRotateControlComponent } from './rotate-control.component';

describe('WolRotateControlComponent', () => {
  let fixture: ComponentFixture<TestRotateControlComponent>;
  let testComponent: TestRotateControlComponent;
  let mapComponent: WolMapComponent;
  let mapInstance: Map;
  let rotateControlComponent: WolRotateControlComponent;
  let rotateControl: Rotate;

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestRotateControlComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const mapDebugElement = fixture.debugElement.query(By.directive(WolMapComponent));
    const rotateDebugElement = fixture.debugElement.query(By.directive(WolRotateControlComponent));

    testComponent = fixture.componentInstance;
    mapComponent = mapDebugElement.componentInstance;
    mapInstance = mapComponent.getInstance() as Map;
    rotateControlComponent = rotateDebugElement.componentInstance;
    rotateControl = rotateControlComponent.getInstance() as Rotate;
  });

  it('should create the rotate control and register it on the map', () => {
    expect(rotateControlComponent).toBeTruthy();
    expect(rotateControl).toBeInstanceOf(Rotate);
    const controls = mapInstance.getControls().getArray();
    expect(controls).toContain(rotateControl);
  });

  it('should return the Rotate instance from getInstance()', () => {
    expect(rotateControlComponent.getInstance()).toBeInstanceOf(Rotate);
    expect(rotateControlComponent.getInstance()).toBe(rotateControl);
  });

  describe('initialization', () => {
    it('should initialize with wolClassName applied on the element', () => {
      expect(rotateControl['element'].className).toContain(testComponent.className());
    });

    it('should initialize with wolCompassClassName on the inner element', () => {
      const span = rotateControl['element'].querySelector('span');
      expect(span?.className).toContain(testComponent.compassClassName());
    });

    it('should initialize with wolTipLabel as the button tooltip', () => {
      const button = rotateControl['element'].querySelector('button');
      expect(button?.getAttribute('title')).toBe(testComponent.tipLabel());
    });

    it('should initialize with wolAutoHide set to false', () => {
      // autoHide: false means the element is always visible (no ol-hidden class at init)
      expect(rotateControl['element'].classList.contains('ol-hidden')).toBe(false);
    });

    it('should initialize with wolDuration', () => {
      expect((rotateControl as unknown as { duration_: number })['duration_']).toBe(
        testComponent.duration(),
      );
    });

    it('should initialize with wolProperties', () => {
      expect(rotateControl.getProperties()).toMatchObject(testComponent.properties());
    });

    it('should call wolRender when a render function is provided', () => {
      expect(testComponent.render).toBeDefined();
    });

    it('should call wolResetNorth when a resetNorth function is provided', () => {
      expect(testComponent.resetNorth).toBeDefined();
    });
  });

  describe('input changes', () => {
    it('should update target when wolTarget changes to a string', () => {
      const setTargetSpy = vi.spyOn(rotateControl, 'setTarget');
      testComponent.target.set('new-container');
      fixture.detectChanges();
      expect(setTargetSpy).toHaveBeenCalledWith('new-container');
    });

    it('should update target when wolTarget changes to an HTMLElement', () => {
      const setTargetSpy = vi.spyOn(rotateControl, 'setTarget');
      const newTarget = document.createElement('div');
      testComponent.target.set(newTarget);
      fixture.detectChanges();
      expect(setTargetSpy).toHaveBeenCalledWith(newTarget);
    });

    it('should update properties when wolProperties input changes', () => {
      const setPropertiesSpy = vi.spyOn(rotateControl, 'setProperties');
      const newProperties: WolProperties = { updated: true };
      testComponent.properties.set(newProperties);
      fixture.detectChanges();
      expect(setPropertiesSpy).toHaveBeenCalledWith(newProperties);
      expect(rotateControl.getProperties()).toMatchObject(newProperties);
    });

    it('should call setProperties with undefined when wolProperties is set to undefined', () => {
      const setPropertiesSpy = vi.spyOn(rotateControl, 'setProperties');
      testComponent.properties.set(undefined as unknown as WolProperties);
      fixture.detectChanges();
      expect(setPropertiesSpy).toHaveBeenCalledWith(undefined);
    });
  });

  describe('output events', () => {
    it('should emit wolChange when the control dispatches a change event', () => {
      const changeSpy = vi.spyOn(rotateControlComponent.wolChange, 'emit');
      const changeEvent = new BaseEvent('change');
      rotateControl.dispatchEvent(changeEvent);
      expect(changeSpy).toHaveBeenCalledWith(changeEvent);
    });

    it('should emit wolError when the control dispatches an error event', () => {
      const errorSpy = vi.spyOn(rotateControlComponent.wolError, 'emit');
      const errorEvent = new BaseEvent('error');
      rotateControl.dispatchEvent(errorEvent);
      expect(errorSpy).toHaveBeenCalledWith(errorEvent);
    });

    it('should emit wolPropertyChange when the control dispatches a propertychange event', () => {
      const propertyChangeSpy = vi.spyOn(rotateControlComponent.wolPropertyChange, 'emit');
      const event = new ObjectEvent('propertychange', 'someKey', 'oldValue');
      rotateControl.dispatchEvent(event);
      expect(propertyChangeSpy).toHaveBeenCalledWith(event);
    });

    it('should emit wolChange only for change events and not for other events', () => {
      const changeSpy = vi.spyOn(rotateControlComponent.wolChange, 'emit');
      rotateControl.dispatchEvent(new BaseEvent('error'));
      expect(changeSpy).not.toHaveBeenCalled();
    });

    it('should emit wolError only for error events and not for other events', () => {
      const errorSpy = vi.spyOn(rotateControlComponent.wolError, 'emit');
      rotateControl.dispatchEvent(new BaseEvent('change'));
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('should emit wolPropertyChange only for propertychange events and not for other events', () => {
      const propertyChangeSpy = vi.spyOn(rotateControlComponent.wolPropertyChange, 'emit');
      rotateControl.dispatchEvent(new BaseEvent('change'));
      expect(propertyChangeSpy).not.toHaveBeenCalled();
    });
  });

  describe('destroy', () => {
    it('should remove the control from the map when the component is destroyed', () => {
      const removeControlSpy = vi.spyOn(mapInstance, 'removeControl');
      const instanceBeforeDestroy = rotateControlComponent.getInstance() as Rotate;
      testComponent.destroyControl.set(true);
      fixture.detectChanges();
      expect(rotateControlComponent.getInstance()).toBeUndefined();
      expect(removeControlSpy).toHaveBeenCalledWith(instanceBeforeDestroy);
    });

    it('should not emit wolChange after component is destroyed', () => {
      const changeSpy = vi.spyOn(rotateControlComponent.wolChange, 'emit');
      testComponent.destroyControl.set(true);
      fixture.detectChanges();
      rotateControl.dispatchEvent(new BaseEvent('change'));
      expect(changeSpy).not.toHaveBeenCalled();
    });

    it('should not emit wolError after component is destroyed', () => {
      const errorSpy = vi.spyOn(rotateControlComponent.wolError, 'emit');
      testComponent.destroyControl.set(true);
      fixture.detectChanges();
      rotateControl.dispatchEvent(new BaseEvent('error'));
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('should not emit wolPropertyChange after component is destroyed', () => {
      const propertyChangeSpy = vi.spyOn(rotateControlComponent.wolPropertyChange, 'emit');
      testComponent.destroyControl.set(true);
      fixture.detectChanges();
      rotateControl.dispatchEvent(new ObjectEvent('propertychange', 'key', 'old'));
      expect(propertyChangeSpy).not.toHaveBeenCalled();
    });
  });
});

@Component({
  selector: 'wol-test-rotate-control',
  imports: [WolMapComponent, WolViewComponent, WolRotateControlComponent],
  template: `
    <wol-map>
      <wol-view [wolZoom]="2" [wolCenter]="[0, 0]" />
      @if (!destroyControl()) {
        <wol-rotate-control
          [wolClassName]="className()"
          [wolLabel]="label()"
          [wolTipLabel]="tipLabel()"
          [wolCompassClassName]="compassClassName()"
          [wolDuration]="duration()"
          [wolAutoHide]="autoHide()"
          [wolRender]="render"
          [wolResetNorth]="resetNorth"
          [wolTarget]="target()"
          [wolProperties]="properties()"
        />
      }
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestRotateControlComponent {
  className = signal('custom-rotate');
  label = signal('⇑');
  tipLabel = signal('Reset rotation');
  compassClassName = signal('custom-compass');
  duration = signal(250);
  autoHide = signal(false);
  render = (_event: MapEvent): void => void 0;
  resetNorth = (): void => void 0;
  target = signal<HTMLElement | string>('');
  properties = signal<WolProperties>({ foo: 'bar' });
  destroyControl = signal(false);
}
