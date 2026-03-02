import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import Map from 'ol/Map';
import { ObjectEvent } from 'ol/Object';
import Zoom from 'ol/control/Zoom';
import BaseEvent from 'ol/events/Event';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolZoomControlComponent } from './zoom-control.component';

describe('WolZoomControlComponent', () => {
  let fixture: ComponentFixture<TestZoomControlComponent>;
  let testComponent: TestZoomControlComponent;
  let mapComponent: WolMapComponent;
  let mapInstance: Map;
  let zoomControlComponent: WolZoomControlComponent;
  let zoomControl: Zoom;

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestZoomControlComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const mapDebugElement = fixture.debugElement.query(By.directive(WolMapComponent));
    const zoomDebugElement = fixture.debugElement.query(By.directive(WolZoomControlComponent));

    testComponent = fixture.componentInstance;
    mapComponent = mapDebugElement.componentInstance;
    mapInstance = mapComponent.getInstance() as Map;
    zoomControlComponent = zoomDebugElement.componentInstance;
    zoomControl = zoomControlComponent.getInstance() as Zoom;
  });

  it('should create the zoom control and register it on the map', () => {
    expect(zoomControlComponent).toBeTruthy();
    expect(zoomControl).toBeInstanceOf(Zoom);
    const controls = mapInstance.getControls().getArray();
    expect(controls).toContain(zoomControl);
  });

  it('should return the Zoom instance from getInstance()', () => {
    expect(zoomControlComponent.getInstance()).toBeInstanceOf(Zoom);
    expect(zoomControlComponent.getInstance()).toBe(zoomControl);
  });

  describe('initialization', () => {
    it('should initialize with wolClassName applied on the element', () => {
      expect(zoomControl['element'].className).toContain(testComponent.className());
    });

    it('should initialize with wolZoomInClassName on the zoom-in button', () => {
      const zoomInButton = zoomControl['element'].querySelector(
        `.${testComponent.zoomInClassName()}`,
      );
      expect(zoomInButton).not.toBeNull();
      expect(zoomInButton?.className).toContain(testComponent.zoomInClassName());
    });

    it('should initialize with wolZoomOutClassName on the zoom-out button', () => {
      const zoomOutButton = zoomControl['element'].querySelector(
        `.${testComponent.zoomOutClassName()}`,
      );
      expect(zoomOutButton).not.toBeNull();
      expect(zoomOutButton?.className).toContain(testComponent.zoomOutClassName());
    });

    it('should initialize with wolZoomInTipLabel as the zoom-in button title', () => {
      const zoomInButton = zoomControl['element'].querySelector(
        `.${testComponent.zoomInClassName()}`,
      ) as HTMLButtonElement | null;
      expect(zoomInButton?.title).toBe(testComponent.zoomInTipLabel());
    });

    it('should initialize with wolZoomOutTipLabel as the zoom-out button title', () => {
      const zoomOutButton = zoomControl['element'].querySelector(
        `.${testComponent.zoomOutClassName()}`,
      ) as HTMLButtonElement | null;
      expect(zoomOutButton?.title).toBe(testComponent.zoomOutTipLabel());
    });

    it('should initialize with wolZoomInLabel as the zoom-in button text', () => {
      const zoomInButton = zoomControl['element'].querySelector(
        `.${testComponent.zoomInClassName()}`,
      );
      expect(zoomInButton?.textContent).toBe(testComponent.zoomInLabel());
    });

    it('should initialize with wolZoomOutLabel as the zoom-out button text', () => {
      const zoomOutButton = zoomControl['element'].querySelector(
        `.${testComponent.zoomOutClassName()}`,
      );
      expect(zoomOutButton?.textContent).toBe(testComponent.zoomOutLabel());
    });

    it('should initialize with wolDuration', () => {
      expect(zoomControl['duration_']).toBe(testComponent.duration());
    });

    it('should initialize without error when wolDelta is provided', () => {
      // delta is captured in closure, not stored as an instance property;
      // verify initialization succeeded and the control is functional
      expect(zoomControl).toBeDefined();
      expect(zoomControl).toBeInstanceOf(Zoom);
    });

    it('should initialize properties from wolProperties input', () => {
      expect(zoomControl.getProperties()).toMatchObject(testComponent.properties());
    });
  });

  describe('input changes', () => {
    it('should update properties when wolProperties input changes', () => {
      const setPropertiesSpy = vi.spyOn(zoomControl, 'setProperties');
      const newProperties: WolProperties = { updated: true };
      testComponent.properties.set(newProperties);
      fixture.detectChanges();
      expect(setPropertiesSpy).toHaveBeenCalledWith(newProperties);
      expect(zoomControl.getProperties()).toMatchObject(newProperties);
    });

    it('should call setProperties with empty object when wolProperties is set to undefined', () => {
      const setPropertiesSpy = vi.spyOn(zoomControl, 'setProperties');
      testComponent.properties.set(undefined as unknown as WolProperties);
      fixture.detectChanges();
      expect(setPropertiesSpy).toHaveBeenCalledWith({});
    });

    it('should update target when wolTarget input changes to a string', () => {
      const setTargetSpy = vi.spyOn(zoomControl, 'setTarget');
      testComponent.target.set('new-container');
      fixture.detectChanges();
      expect(setTargetSpy).toHaveBeenCalledWith('new-container');
    });

    it('should update target when wolTarget input changes to an HTMLElement', () => {
      const setTargetSpy = vi.spyOn(zoomControl, 'setTarget');
      const newTarget = document.createElement('div');
      testComponent.target.set(newTarget);
      fixture.detectChanges();
      expect(setTargetSpy).toHaveBeenCalledWith(newTarget);
    });

    it('should not call setProperties when an unrelated input changes', () => {
      const setPropertiesSpy = vi.spyOn(zoomControl, 'setProperties');
      testComponent.target.set('other-container');
      fixture.detectChanges();
      expect(setPropertiesSpy).not.toHaveBeenCalled();
    });

    it('should not call setTarget when an unrelated input changes', () => {
      const setTargetSpy = vi.spyOn(zoomControl, 'setTarget');
      testComponent.properties.set({ x: 1 });
      fixture.detectChanges();
      expect(setTargetSpy).not.toHaveBeenCalled();
    });
  });

  describe('output events', () => {
    it('should emit wolChange when the control dispatches a change event', () => {
      const changeSpy = vi.spyOn(zoomControlComponent.wolChange, 'emit');
      const changeEvent = new BaseEvent('change');
      zoomControl.dispatchEvent(changeEvent);
      expect(changeSpy).toHaveBeenCalledWith(changeEvent);
    });

    it('should emit wolError when the control dispatches an error event', () => {
      const errorSpy = vi.spyOn(zoomControlComponent.wolError, 'emit');
      const errorEvent = new BaseEvent('error');
      zoomControl.dispatchEvent(errorEvent);
      expect(errorSpy).toHaveBeenCalledWith(errorEvent);
    });

    it('should emit wolPropertyChange when the control dispatches a propertychange event', () => {
      const propertyChangeSpy = vi.spyOn(zoomControlComponent.wolPropertyChange, 'emit');
      const event = new ObjectEvent('propertychange', 'someKey', 'oldValue');
      zoomControl.dispatchEvent(event);
      expect(propertyChangeSpy).toHaveBeenCalledWith(event);
    });

    it('should emit wolChange only for change events, not for other events', () => {
      const changeSpy = vi.spyOn(zoomControlComponent.wolChange, 'emit');
      zoomControl.dispatchEvent(new BaseEvent('error'));
      expect(changeSpy).not.toHaveBeenCalled();
    });

    it('should emit wolError only for error events, not for other events', () => {
      const errorSpy = vi.spyOn(zoomControlComponent.wolError, 'emit');
      zoomControl.dispatchEvent(new BaseEvent('change'));
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('should emit wolPropertyChange only for propertychange events, not for other events', () => {
      const propertyChangeSpy = vi.spyOn(zoomControlComponent.wolPropertyChange, 'emit');
      zoomControl.dispatchEvent(new BaseEvent('change'));
      expect(propertyChangeSpy).not.toHaveBeenCalled();
    });

    it('should emit wolChange with the correct event object', () => {
      const changeSpy = vi.spyOn(zoomControlComponent.wolChange, 'emit');
      const changeEvent = new BaseEvent('change');
      zoomControl.dispatchEvent(changeEvent);
      expect(changeSpy).toHaveBeenCalledTimes(1);
      expect(changeSpy).toHaveBeenCalledWith(changeEvent);
    });

    it('should emit wolPropertyChange with the correct ObjectEvent', () => {
      const propertyChangeSpy = vi.spyOn(zoomControlComponent.wolPropertyChange, 'emit');
      const event = new ObjectEvent('propertychange', 'opacity', 0.5);
      zoomControl.dispatchEvent(event);
      expect(propertyChangeSpy).toHaveBeenCalledTimes(1);
      expect(propertyChangeSpy).toHaveBeenCalledWith(event);
    });
  });

  describe('destroy', () => {
    it('should remove the control from the map when the component is destroyed', () => {
      const removeControlSpy = vi.spyOn(mapInstance, 'removeControl');
      const instanceBeforeDestroy = zoomControlComponent.getInstance() as Zoom;
      testComponent.destroyControl.set(true);
      fixture.detectChanges();
      expect(zoomControlComponent.getInstance()).toBeUndefined();
      expect(removeControlSpy).toHaveBeenCalledWith(instanceBeforeDestroy);
    });

    it('should not emit wolChange after component is destroyed', () => {
      const changeSpy = vi.spyOn(zoomControlComponent.wolChange, 'emit');
      testComponent.destroyControl.set(true);
      fixture.detectChanges();
      zoomControl.dispatchEvent(new BaseEvent('change'));
      expect(changeSpy).not.toHaveBeenCalled();
    });

    it('should not emit wolError after component is destroyed', () => {
      const errorSpy = vi.spyOn(zoomControlComponent.wolError, 'emit');
      testComponent.destroyControl.set(true);
      fixture.detectChanges();
      zoomControl.dispatchEvent(new BaseEvent('error'));
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('should not emit wolPropertyChange after component is destroyed', () => {
      const propertyChangeSpy = vi.spyOn(zoomControlComponent.wolPropertyChange, 'emit');
      testComponent.destroyControl.set(true);
      fixture.detectChanges();
      zoomControl.dispatchEvent(new ObjectEvent('propertychange', 'key', 'old'));
      expect(propertyChangeSpy).not.toHaveBeenCalled();
    });
  });
});

@Component({
  selector: 'wol-test-zoom-control',
  imports: [WolMapComponent, WolViewComponent, WolZoomControlComponent],
  template: `
    <wol-map>
      <wol-view [wolZoom]="2" [wolCenter]="[0, 0]" />
      @if (!destroyControl()) {
        <wol-zoom-control
          [wolDuration]="duration()"
          [wolClassName]="className()"
          [wolZoomInClassName]="zoomInClassName()"
          [wolZoomOutClassName]="zoomOutClassName()"
          [wolZoomInLabel]="zoomInLabel()"
          [wolZoomOutLabel]="zoomOutLabel()"
          [wolZoomInTipLabel]="zoomInTipLabel()"
          [wolZoomOutTipLabel]="zoomOutTipLabel()"
          [wolDelta]="delta()"
          [wolTarget]="target()"
          [wolProperties]="properties()"
        />
      }
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestZoomControlComponent {
  duration = signal(250);
  className = signal('custom-zoom');
  zoomInClassName = signal('custom-zoom-in');
  zoomOutClassName = signal('custom-zoom-out');
  zoomInLabel = signal('+');
  zoomOutLabel = signal('-');
  zoomInTipLabel = signal('Zoom in');
  zoomOutTipLabel = signal('Zoom out');
  delta = signal(2);
  target = signal<HTMLElement | string>('');
  properties = signal<WolProperties>({ foo: 'bar' });
  destroyControl = signal(false);
}
