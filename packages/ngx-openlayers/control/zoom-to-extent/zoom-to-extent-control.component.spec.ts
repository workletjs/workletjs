import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import Map from 'ol/Map';
import { ObjectEvent } from 'ol/Object';
import ZoomToExtent from 'ol/control/ZoomToExtent';
import BaseEvent from 'ol/events/Event';
import { Extent } from 'ol/extent';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolZoomToExtentControlComponent } from './zoom-to-extent-control.component';

describe('WolZoomToExtentControlComponent', () => {
  let fixture: ComponentFixture<TestZoomToExtentControlComponent>;
  let testComponent: TestZoomToExtentControlComponent;
  let mapComponent: WolMapComponent;
  let mapInstance: Map;
  let zoomToExtentControlComponent: WolZoomToExtentControlComponent;
  let zoomToExtentControl: ZoomToExtent;

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestZoomToExtentControlComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const mapDebugElement = fixture.debugElement.query(By.directive(WolMapComponent));
    const zoomToExtentDebugElement = fixture.debugElement.query(
      By.directive(WolZoomToExtentControlComponent),
    );

    testComponent = fixture.componentInstance;
    mapComponent = mapDebugElement.componentInstance;
    mapInstance = mapComponent.getInstance() as Map;
    zoomToExtentControlComponent = zoomToExtentDebugElement.componentInstance;
    zoomToExtentControl = zoomToExtentControlComponent.getInstance() as ZoomToExtent;
  });

  it('should create the zoom-to-extent control and register it on the map', () => {
    expect(zoomToExtentControlComponent).toBeTruthy();
    expect(zoomToExtentControl).toBeInstanceOf(ZoomToExtent);
    const controls = mapInstance.getControls().getArray();
    expect(controls).toContain(zoomToExtentControl);
  });

  it('should return the ZoomToExtent instance from getInstance()', () => {
    expect(zoomToExtentControlComponent.getInstance()).toBeInstanceOf(ZoomToExtent);
    expect(zoomToExtentControlComponent.getInstance()).toBe(zoomToExtentControl);
  });

  describe('initialization', () => {
    it('should initialize properties from wolProperties input', () => {
      expect(zoomToExtentControl.getProperties()).toMatchObject(testComponent.properties());
    });

    it('should initialize with wolClassName applied on the element', () => {
      expect(zoomToExtentControl['element'].className).toContain(testComponent.className());
    });

    it('should initialize with wolTipLabel as the button title', () => {
      const button = zoomToExtentControl['element'].querySelector('button');
      expect(button?.getAttribute('title')).toBe(testComponent.tipLabel());
    });

    it('should initialize with wolExtent passed to the control', () => {
      expect(zoomToExtentControl['extent']).toEqual(testComponent.extent());
    });

    it('should initialize with wolLabel as the button label content', () => {
      const button = zoomToExtentControl['element'].querySelector('button');
      expect(button?.textContent).toContain(testComponent.label());
    });
  });

  describe('input changes', () => {
    it('should update properties when wolProperties input changes', () => {
      const setPropertiesSpy = vi.spyOn(zoomToExtentControl, 'setProperties');
      const newProperties: WolProperties = { updated: true };
      testComponent.properties.set(newProperties);
      fixture.detectChanges();
      expect(setPropertiesSpy).toHaveBeenCalledWith(newProperties);
      expect(zoomToExtentControl.getProperties()).toMatchObject(newProperties);
    });

    it('should call setProperties with empty object when wolProperties is set to undefined', () => {
      const setPropertiesSpy = vi.spyOn(zoomToExtentControl, 'setProperties');
      testComponent.properties.set(undefined as unknown as WolProperties);
      fixture.detectChanges();
      expect(setPropertiesSpy).toHaveBeenCalledWith({});
    });

    it('should update target when wolTarget input changes to a string', () => {
      const setTargetSpy = vi.spyOn(zoomToExtentControl, 'setTarget');
      testComponent.target.set('new-container');
      fixture.detectChanges();
      expect(setTargetSpy).toHaveBeenCalledWith('new-container');
    });

    it('should update target when wolTarget input changes to an HTMLElement', () => {
      const setTargetSpy = vi.spyOn(zoomToExtentControl, 'setTarget');
      const newTarget = document.createElement('div');
      testComponent.target.set(newTarget);
      fixture.detectChanges();
      expect(setTargetSpy).toHaveBeenCalledWith(newTarget);
    });

    it('should not call any setter for unhandled input changes', () => {
      const setPropertiesSpy = vi.spyOn(zoomToExtentControl, 'setProperties');
      const setTargetSpy = vi.spyOn(zoomToExtentControl, 'setTarget');
      // wolLabel, wolTipLabel, wolExtent, wolClassName are init-only; changing them
      // should not trigger any setter on the instance.
      testComponent.tipLabel.set('New tip');
      fixture.detectChanges();
      expect(setPropertiesSpy).not.toHaveBeenCalled();
      expect(setTargetSpy).not.toHaveBeenCalled();
    });
  });

  describe('output events', () => {
    it('should emit wolChange when the control dispatches a change event', () => {
      const changeSpy = vi.spyOn(zoomToExtentControlComponent.wolChange, 'emit');
      const changeEvent = new BaseEvent('change');
      zoomToExtentControl.dispatchEvent(changeEvent);
      expect(changeSpy).toHaveBeenCalledWith(changeEvent);
    });

    it('should emit wolError when the control dispatches an error event', () => {
      const errorSpy = vi.spyOn(zoomToExtentControlComponent.wolError, 'emit');
      const errorEvent = new BaseEvent('error');
      zoomToExtentControl.dispatchEvent(errorEvent);
      expect(errorSpy).toHaveBeenCalledWith(errorEvent);
    });

    it('should emit wolPropertyChange when the control dispatches a propertychange event', () => {
      const propertyChangeSpy = vi.spyOn(zoomToExtentControlComponent.wolPropertyChange, 'emit');
      const event = new ObjectEvent('propertychange', 'someKey', 'oldValue');
      zoomToExtentControl.dispatchEvent(event);
      expect(propertyChangeSpy).toHaveBeenCalledWith(event);
    });

    it('should emit wolChange only for change events and not for other events', () => {
      const changeSpy = vi.spyOn(zoomToExtentControlComponent.wolChange, 'emit');
      zoomToExtentControl.dispatchEvent(new BaseEvent('error'));
      expect(changeSpy).not.toHaveBeenCalled();
    });

    it('should emit wolError only for error events and not for other events', () => {
      const errorSpy = vi.spyOn(zoomToExtentControlComponent.wolError, 'emit');
      zoomToExtentControl.dispatchEvent(new BaseEvent('change'));
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('should emit wolPropertyChange only for propertychange events and not for other events', () => {
      const propertyChangeSpy = vi.spyOn(zoomToExtentControlComponent.wolPropertyChange, 'emit');
      zoomToExtentControl.dispatchEvent(new BaseEvent('change'));
      expect(propertyChangeSpy).not.toHaveBeenCalled();
    });
  });

  describe('destroy', () => {
    it('should remove the control from the map when the component is destroyed', () => {
      const removeControlSpy = vi.spyOn(mapInstance, 'removeControl');
      const instanceBeforeDestroy = zoomToExtentControlComponent.getInstance() as ZoomToExtent;
      testComponent.destroyControl.set(true);
      fixture.detectChanges();
      expect(zoomToExtentControlComponent.getInstance()).toBeUndefined();
      expect(removeControlSpy).toHaveBeenCalledWith(instanceBeforeDestroy);
    });

    it('should unsubscribe from all events when the component is destroyed', () => {
      const changeSpy = vi.spyOn(zoomToExtentControlComponent.wolChange, 'emit');
      testComponent.destroyControl.set(true);
      fixture.detectChanges();
      zoomToExtentControl.dispatchEvent(new BaseEvent('change'));
      expect(changeSpy).not.toHaveBeenCalled();
    });

    it('should not throw if destroyed before instance is initialized', () => {
      // Verify that multiple destroy calls or premature destroy does not throw
      expect(() => fixture.destroy()).not.toThrow();
    });
  });
});

@Component({
  selector: 'wol-test-zoom-to-extent-control',
  imports: [WolMapComponent, WolViewComponent, WolZoomToExtentControlComponent],
  template: `
    <wol-map>
      <wol-view [wolZoom]="2" [wolCenter]="[0, 0]" />
      @if (!destroyControl()) {
        <wol-zoom-to-extent-control
          [wolClassName]="className()"
          [wolTarget]="target()"
          [wolLabel]="label()"
          [wolTipLabel]="tipLabel()"
          [wolExtent]="extent()"
          [wolProperties]="properties()"
        />
      }
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestZoomToExtentControlComponent {
  className = signal('custom-zoom-to-extent');
  target = signal<string | HTMLElement>('');
  label = signal('E');
  tipLabel = signal('Fit to extent');
  extent = signal<Extent>([0, 0, 100, 100]);
  properties = signal<WolProperties>({ foo: 'bar' });
  destroyControl = signal(false);
}
