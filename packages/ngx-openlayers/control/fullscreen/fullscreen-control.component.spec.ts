import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import Map from 'ol/Map';
import { ObjectEvent } from 'ol/Object';
import FullScreen from 'ol/control/FullScreen';
import BaseEvent from 'ol/events/Event';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolFullScreenControlComponent } from './fullscreen-control.component';

describe('WolFullScreenControlComponent', () => {
  let fixture: ComponentFixture<TestFullScreenControlComponent>;
  let testComponent: TestFullScreenControlComponent;
  let mapComponent: WolMapComponent;
  let mapInstance: Map;
  let fullscreenControlComponent: WolFullScreenControlComponent;
  let fullscreenControl: FullScreen;

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestFullScreenControlComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const mapDebugElement = fixture.debugElement.query(By.directive(WolMapComponent));
    const fullscreenDebugElement = fixture.debugElement.query(
      By.directive(WolFullScreenControlComponent),
    );

    testComponent = fixture.componentInstance;
    mapComponent = mapDebugElement.componentInstance;
    mapInstance = mapComponent.getInstance() as Map;
    fullscreenControlComponent = fullscreenDebugElement.componentInstance;
    fullscreenControl = fullscreenControlComponent.getInstance() as FullScreen;
  });

  it('should create the fullscreen control and register it on the map', () => {
    expect(fullscreenControlComponent).toBeTruthy();
    expect(fullscreenControl).toBeInstanceOf(FullScreen);
    const controls = mapInstance.getControls().getArray();
    expect(controls).toContain(fullscreenControl);
  });

  it('should return the FullScreen instance from getInstance()', () => {
    expect(fullscreenControlComponent.getInstance()).toBeInstanceOf(FullScreen);
    expect(fullscreenControlComponent.getInstance()).toBe(fullscreenControl);
  });

  describe('initialization', () => {
    it('should initialize properties from wolProperties input', () => {
      expect(fullscreenControl.getProperties()).toMatchObject(testComponent.properties());
    });

    it('should initialize with wolClassName applied on the element', () => {
      expect(fullscreenControl['element'].className).toContain(testComponent.className());
    });

    it('should initialize with wolLabel as the button title', () => {
      const button = fullscreenControl['element'].querySelector('button');
      expect(button?.getAttribute('title')).toBe(testComponent.tipLabel());
    });

    it('should initialize with wolKeys set to true', () => {
      // Verify keys option was accepted without error and instance is still valid
      expect(fullscreenControl).toBeDefined();
    });
  });

  describe('input changes', () => {
    it('should update properties when wolProperties input changes', () => {
      const setPropertiesSpy = vi.spyOn(fullscreenControl, 'setProperties');
      const newProperties: WolProperties = { updated: true };
      testComponent.properties.set(newProperties);
      fixture.detectChanges();
      expect(setPropertiesSpy).toHaveBeenCalledWith(newProperties);
      expect(fullscreenControl.getProperties()).toMatchObject(newProperties);
    });

    it('should call setProperties with empty object when wolProperties is set to undefined', () => {
      const setPropertiesSpy = vi.spyOn(fullscreenControl, 'setProperties');
      testComponent.properties.set(undefined as unknown as WolProperties);
      fixture.detectChanges();
      expect(setPropertiesSpy).toHaveBeenCalledWith({});
    });

    it('should update target when wolTarget input changes to a string', () => {
      const setTargetSpy = vi.spyOn(fullscreenControl, 'setTarget');
      testComponent.target.set('new-container');
      fixture.detectChanges();
      expect(setTargetSpy).toHaveBeenCalledWith('new-container');
    });

    it('should update target when wolTarget input changes to an HTMLElement', () => {
      const setTargetSpy = vi.spyOn(fullscreenControl, 'setTarget');
      const newTarget = document.createElement('div');
      testComponent.target.set(newTarget);
      fixture.detectChanges();
      expect(setTargetSpy).toHaveBeenCalledWith(newTarget);
    });
  });

  describe('output events', () => {
    it('should emit wolChange when the control dispatches a change event', () => {
      const changeSpy = vi.spyOn(fullscreenControlComponent.wolChange, 'emit');
      const changeEvent = new BaseEvent('change');
      fullscreenControl.dispatchEvent(changeEvent);
      expect(changeSpy).toHaveBeenCalledWith(changeEvent);
    });

    it('should emit wolEnterFullscreen when the control dispatches enterfullscreen event', () => {
      const enterSpy = vi.spyOn(fullscreenControlComponent.wolEnterFullscreen, 'emit');
      const event = new BaseEvent('enterfullscreen');
      fullscreenControl.dispatchEvent(event);
      expect(enterSpy).toHaveBeenCalledTimes(1);
    });

    it('should emit wolError when the control dispatches an error event', () => {
      const errorSpy = vi.spyOn(fullscreenControlComponent.wolError, 'emit');
      const errorEvent = new BaseEvent('error');
      fullscreenControl.dispatchEvent(errorEvent);
      expect(errorSpy).toHaveBeenCalledWith(errorEvent);
    });

    it('should emit wolLeaveFullscreen when the control dispatches leavefullscreen event', () => {
      const leaveSpy = vi.spyOn(fullscreenControlComponent.wolLeaveFullscreen, 'emit');
      const event = new BaseEvent('leavefullscreen');
      fullscreenControl.dispatchEvent(event);
      expect(leaveSpy).toHaveBeenCalledTimes(1);
    });

    it('should emit wolPropertyChange when the control dispatches a propertychange event', () => {
      const propertyChangeSpy = vi.spyOn(fullscreenControlComponent.wolPropertyChange, 'emit');
      const event = new ObjectEvent('propertychange', 'someKey', 'oldValue');
      fullscreenControl.dispatchEvent(event);
      expect(propertyChangeSpy).toHaveBeenCalledWith(event);
    });

    it('should emit wolChange only for change events and not for other events', () => {
      const changeSpy = vi.spyOn(fullscreenControlComponent.wolChange, 'emit');
      fullscreenControl.dispatchEvent(new BaseEvent('error'));
      expect(changeSpy).not.toHaveBeenCalled();
    });

    it('should emit wolEnterFullscreen without event payload', () => {
      const enterSpy = vi.spyOn(fullscreenControlComponent.wolEnterFullscreen, 'emit');
      fullscreenControl.dispatchEvent(new BaseEvent('enterfullscreen'));
      expect(enterSpy).toHaveBeenCalledWith();
    });

    it('should emit wolLeaveFullscreen without event payload', () => {
      const leaveSpy = vi.spyOn(fullscreenControlComponent.wolLeaveFullscreen, 'emit');
      fullscreenControl.dispatchEvent(new BaseEvent('leavefullscreen'));
      expect(leaveSpy).toHaveBeenCalledWith();
    });
  });

  describe('destroy', () => {
    it('should remove the control from the map when the component is destroyed', () => {
      const removeControlSpy = vi.spyOn(mapInstance, 'removeControl');
      const instanceBeforeDestroy = fullscreenControlComponent.getInstance() as FullScreen;
      testComponent.destroyControl.set(true);
      fixture.detectChanges();
      expect(fullscreenControlComponent.getInstance()).toBeUndefined();
      expect(removeControlSpy).toHaveBeenCalledWith(instanceBeforeDestroy);
    });

    it('should unsubscribe from all events when the component is destroyed', () => {
      const changeSpy = vi.spyOn(fullscreenControlComponent.wolChange, 'emit');
      testComponent.destroyControl.set(true);
      fixture.detectChanges();
      fullscreenControl.dispatchEvent(new BaseEvent('change'));
      expect(changeSpy).not.toHaveBeenCalled();
    });
  });
});

@Component({
  selector: 'wol-test-fullscreen-control',
  imports: [WolMapComponent, WolViewComponent, WolFullScreenControlComponent],
  template: `
    <wol-map>
      <wol-view [wolZoom]="2" [wolCenter]="[0, 0]" />
      @if (!destroyControl()) {
        <wol-fullscreen-control
          [wolClassName]="className()"
          [wolLabel]="label()"
          [wolLabelActive]="labelActive()"
          [wolActiveClassName]="activeClassName()"
          [wolInactiveClassName]="inactiveClassName()"
          [wolTipLabel]="tipLabel()"
          [wolKeys]="keys()"
          [wolTarget]="target()"
          [wolSource]="source()"
          [wolProperties]="properties()"
        />
      }
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestFullScreenControlComponent {
  className = signal('custom-fullscreen');
  label = signal('\u2922');
  labelActive = signal('\u00d7');
  activeClassName = signal('ol-full-screen-true');
  inactiveClassName = signal('ol-full-screen-false');
  tipLabel = signal('Toggle full-screen');
  keys = signal(true);
  target = signal<HTMLElement | string>('');
  source = signal<HTMLElement | string>('');
  properties = signal<WolProperties>({ foo: 'bar' });
  destroyControl = signal(false);
}
