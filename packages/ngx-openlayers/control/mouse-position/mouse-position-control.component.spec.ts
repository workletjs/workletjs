import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import Map from 'ol/Map';
import { ObjectEvent } from 'ol/Object';
import MousePosition from 'ol/control/MousePosition';
import { CoordinateFormat } from 'ol/coordinate';
import BaseEvent from 'ol/events/Event';
import { ProjectionLike } from 'ol/proj';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolMousePositionControlComponent } from './mouse-position-control.component';

describe('WolMousePositionControlComponent', () => {
  let fixture: ComponentFixture<TestMousePositionControlComponent>;
  let testComponent: TestMousePositionControlComponent;
  let mapComponent: WolMapComponent;
  let mapInstance: Map;
  let mousePositionControlComponent: WolMousePositionControlComponent;
  let mousePositionControl: MousePosition;

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestMousePositionControlComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const mapDebugElement = fixture.debugElement.query(By.directive(WolMapComponent));
    const mousePositionDebugElement = fixture.debugElement.query(
      By.directive(WolMousePositionControlComponent),
    );

    testComponent = fixture.componentInstance;
    mapComponent = mapDebugElement.componentInstance;
    mapInstance = mapComponent.getInstance() as Map;
    mousePositionControlComponent = mousePositionDebugElement.componentInstance;
    mousePositionControl = mousePositionControlComponent.getInstance() as MousePosition;
  });

  it('should create the mouse position control and register it on the map', () => {
    expect(mousePositionControlComponent).toBeTruthy();
    expect(mousePositionControl).toBeInstanceOf(MousePosition);
    const controls = mapInstance.getControls().getArray();
    expect(controls).toContain(mousePositionControl);
  });

  it('should return the MousePosition instance from getInstance()', () => {
    expect(mousePositionControlComponent.getInstance()).toBeInstanceOf(MousePosition);
    expect(mousePositionControlComponent.getInstance()).toBe(mousePositionControl);
  });

  describe('initialization', () => {
    it('should initialize with wolClassName applied on the element', () => {
      expect(mousePositionControl['element'].className).toContain(testComponent.className());
    });

    it('should initialize with wolCoordinateFormat', () => {
      expect(mousePositionControl.getCoordinateFormat()).toBe(testComponent.coordinateFormat());
    });

    it('should initialize with wolProjection', () => {
      expect(mousePositionControl.getProjection()?.getCode()).toBe(
        (testComponent.projection() as string).toUpperCase(),
      );
    });

    it('should initialize with wolProperties', () => {
      expect(mousePositionControl.getProperties()).toMatchObject(testComponent.properties());
    });

    it('should initialize with valid instance when wolWrapX is set', () => {
      expect(mousePositionControl).toBeDefined();
    });
  });

  describe('input changes', () => {
    it('should update coordinateFormat when wolCoordinateFormat input changes', () => {
      const setCoordinateFormatSpy = vi.spyOn(mousePositionControl, 'setCoordinateFormat');
      const newFormat: CoordinateFormat = (coord) => `${coord?.[0]},${coord?.[1]}`;
      testComponent.coordinateFormat.set(newFormat);
      fixture.detectChanges();
      expect(setCoordinateFormatSpy).toHaveBeenCalledWith(newFormat);
    });

    it('should update projection when wolProjection input changes', () => {
      const setProjectionSpy = vi.spyOn(mousePositionControl, 'setProjection');
      const newProjection: ProjectionLike = 'EPSG:4326';
      testComponent.projection.set(newProjection);
      fixture.detectChanges();
      expect(setProjectionSpy).toHaveBeenCalledWith(newProjection);
    });

    it('should update target when wolTarget input changes to a string', () => {
      const setTargetSpy = vi.spyOn(mousePositionControl, 'setTarget');
      testComponent.target.set('new-container');
      fixture.detectChanges();
      expect(setTargetSpy).toHaveBeenCalledWith('new-container');
    });

    it('should update target when wolTarget input changes to an HTMLElement', () => {
      const setTargetSpy = vi.spyOn(mousePositionControl, 'setTarget');
      const newTarget = document.createElement('div');
      testComponent.target.set(newTarget);
      fixture.detectChanges();
      expect(setTargetSpy).toHaveBeenCalledWith(newTarget);
    });

    it('should update properties when wolProperties input changes', () => {
      const setPropertiesSpy = vi.spyOn(mousePositionControl, 'setProperties');
      const newProperties: WolProperties = { updated: true };
      testComponent.properties.set(newProperties);
      fixture.detectChanges();
      expect(setPropertiesSpy).toHaveBeenCalledWith(newProperties, true);
      expect(mousePositionControl.getProperties()).toMatchObject(newProperties);
    });

    it('should call setProperties with empty object when wolProperties is set to undefined', () => {
      const setPropertiesSpy = vi.spyOn(mousePositionControl, 'setProperties');
      testComponent.properties.set(undefined as unknown as WolProperties);
      fixture.detectChanges();
      expect(setPropertiesSpy).toHaveBeenCalledWith({}, true);
    });
  });

  describe('two-way model bindings', () => {
    it('should update wolCoordinateFormat model when coordinateFormat changes on instance', () => {
      const setCoordinateFormatSpy = vi.spyOn(
        mousePositionControlComponent.wolCoordinateFormat,
        'set',
      );
      const newFormat: CoordinateFormat = (coord) => `lon:${coord?.[0]}`;
      mousePositionControl.setCoordinateFormat(newFormat);
      expect(setCoordinateFormatSpy).toHaveBeenCalledWith(newFormat);
    });

    it('should update wolProjection model when projection changes on instance', () => {
      const setProjectionSpy = vi.spyOn(mousePositionControlComponent.wolProjection, 'set');
      mousePositionControl.setProjection('EPSG:4326');
      expect(setProjectionSpy).toHaveBeenCalled();
    });
  });

  describe('output events', () => {
    it('should emit wolChange when the control dispatches a change event', () => {
      const changeSpy = vi.spyOn(mousePositionControlComponent.wolChange, 'emit');
      const changeEvent = new BaseEvent('change');
      mousePositionControl.dispatchEvent(changeEvent);
      expect(changeSpy).toHaveBeenCalledWith(changeEvent);
    });

    it('should emit wolError when the control dispatches an error event', () => {
      const errorSpy = vi.spyOn(mousePositionControlComponent.wolError, 'emit');
      const errorEvent = new BaseEvent('error');
      mousePositionControl.dispatchEvent(errorEvent);
      expect(errorSpy).toHaveBeenCalledWith(errorEvent);
    });

    it('should emit wolPropertyChange when the control dispatches a propertychange event', () => {
      const propertyChangeSpy = vi.spyOn(mousePositionControlComponent.wolPropertyChange, 'emit');
      const event = new ObjectEvent('propertychange', 'someKey', 'oldValue');
      mousePositionControl.dispatchEvent(event);
      expect(propertyChangeSpy).toHaveBeenCalledWith(event);
    });

    it('should emit wolChange only for change events and not for other events', () => {
      const changeSpy = vi.spyOn(mousePositionControlComponent.wolChange, 'emit');
      mousePositionControl.dispatchEvent(new BaseEvent('error'));
      expect(changeSpy).not.toHaveBeenCalled();
    });

    it('should emit wolError only for error events and not for other events', () => {
      const errorSpy = vi.spyOn(mousePositionControlComponent.wolError, 'emit');
      mousePositionControl.dispatchEvent(new BaseEvent('change'));
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('should emit wolPropertyChange only for propertychange events and not for other events', () => {
      const propertyChangeSpy = vi.spyOn(mousePositionControlComponent.wolPropertyChange, 'emit');
      mousePositionControl.dispatchEvent(new BaseEvent('change'));
      expect(propertyChangeSpy).not.toHaveBeenCalled();
    });
  });

  describe('destroy', () => {
    it('should remove the control from the map when the component is destroyed', () => {
      const removeControlSpy = vi.spyOn(mapInstance, 'removeControl');
      const instanceBeforeDestroy = mousePositionControlComponent.getInstance() as MousePosition;
      testComponent.destroyControl.set(true);
      fixture.detectChanges();
      expect(mousePositionControlComponent.getInstance()).toBeUndefined();
      expect(removeControlSpy).toHaveBeenCalledWith(instanceBeforeDestroy);
    });

    it('should unsubscribe from all events when the component is destroyed', () => {
      const changeSpy = vi.spyOn(mousePositionControlComponent.wolChange, 'emit');
      testComponent.destroyControl.set(true);
      fixture.detectChanges();
      mousePositionControl.dispatchEvent(new BaseEvent('change'));
      expect(changeSpy).not.toHaveBeenCalled();
    });

    it('should not emit wolError after component is destroyed', () => {
      const errorSpy = vi.spyOn(mousePositionControlComponent.wolError, 'emit');
      testComponent.destroyControl.set(true);
      fixture.detectChanges();
      mousePositionControl.dispatchEvent(new BaseEvent('error'));
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('should not emit wolPropertyChange after component is destroyed', () => {
      const propertyChangeSpy = vi.spyOn(mousePositionControlComponent.wolPropertyChange, 'emit');
      testComponent.destroyControl.set(true);
      fixture.detectChanges();
      mousePositionControl.dispatchEvent(new ObjectEvent('propertychange', 'key', 'old'));
      expect(propertyChangeSpy).not.toHaveBeenCalled();
    });
  });
});

@Component({
  selector: 'wol-test-mouse-position-control',
  imports: [WolMapComponent, WolViewComponent, WolMousePositionControlComponent],
  template: `
    <wol-map>
      <wol-view [wolZoom]="2" [wolCenter]="[0, 0]" />
      @if (!destroyControl()) {
        <wol-mouse-position-control
          [wolClassName]="className()"
          [(wolCoordinateFormat)]="coordinateFormat"
          [(wolProjection)]="projection"
          [wolTarget]="target()"
          [wolPlaceholder]="placeholder()"
          [wolWrapX]="wrapX()"
          [wolProperties]="properties()"
        />
      }
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestMousePositionControlComponent {
  className = signal('custom-mouse-position');
  coordinateFormat = signal<CoordinateFormat>(
    (coord) => `${coord?.[0].toFixed(2)}, ${coord?.[1].toFixed(2)}`,
  );
  projection = signal<ProjectionLike>('EPSG:3857');
  target = signal<HTMLElement | string>('');
  placeholder = signal('Move cursor over map');
  wrapX = signal(true);
  properties = signal<WolProperties>({ foo: 'bar' });
  destroyControl = signal(false);
}
