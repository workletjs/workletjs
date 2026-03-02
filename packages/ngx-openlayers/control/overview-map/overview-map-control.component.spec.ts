import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import Collection from 'ol/Collection';
import Map from 'ol/Map';
import { ObjectEvent } from 'ol/Object';
import View from 'ol/View';
import OverviewMap from 'ol/control/OverviewMap';
import BaseEvent from 'ol/events/Event';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolOverviewMapControlComponent } from './overview-map-control.component';

describe('WolOverviewMapControlComponent', () => {
  let fixture: ComponentFixture<TestOverviewMapControlComponent>;
  let testComponent: TestOverviewMapControlComponent;
  let mapComponent: WolMapComponent;
  let mapInstance: Map;
  let overviewMapControlComponent: WolOverviewMapControlComponent;
  let overviewMapControl: OverviewMap;

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestOverviewMapControlComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const mapDebugElement = fixture.debugElement.query(By.directive(WolMapComponent));
    const overviewMapDebugElement = fixture.debugElement.query(
      By.directive(WolOverviewMapControlComponent),
    );

    testComponent = fixture.componentInstance;
    mapComponent = mapDebugElement.componentInstance;
    mapInstance = mapComponent.getInstance() as Map;
    overviewMapControlComponent = overviewMapDebugElement.componentInstance;
    overviewMapControl = overviewMapControlComponent.getInstance() as OverviewMap;
  });

  it('should create the overview map control and register it on the map', () => {
    expect(overviewMapControlComponent).toBeTruthy();
    expect(overviewMapControl).toBeInstanceOf(OverviewMap);
    const controls = mapInstance.getControls().getArray();
    expect(controls).toContain(overviewMapControl);
  });

  it('should return the OverviewMap instance from getInstance()', () => {
    expect(overviewMapControlComponent.getInstance()).toBeInstanceOf(OverviewMap);
    expect(overviewMapControlComponent.getInstance()).toBe(overviewMapControl);
  });

  describe('initialization', () => {
    it('should initialize with wolClassName applied on the element', () => {
      expect(overviewMapControl['element'].className).toContain(testComponent.className());
    });

    it('should initialize with wolCollapsed', () => {
      expect(overviewMapControl.getCollapsed()).toBe(testComponent.collapsed());
    });

    it('should initialize with wolCollapsible', () => {
      expect(overviewMapControl.getCollapsible()).toBe(testComponent.collapsible());
    });

    it('should initialize with wolLayers as a Collection', () => {
      const layers = overviewMapControl.getOverviewMap().getLayers();
      expect(layers.getArray()).toEqual(testComponent.layers().getArray());
    });

    it('should initialize with wolRotateWithView', () => {
      expect(overviewMapControl).toBeDefined();
    });

    it('should initialize with wolView', () => {
      expect(overviewMapControl.getOverviewMap().getView()).toBeInstanceOf(View);
    });

    it('should initialize with wolProperties', () => {
      expect(overviewMapControl.getProperties()).toMatchObject(testComponent.properties());
    });

    it('should initialize with wolTipLabel as the button tooltip', () => {
      const button = overviewMapControl['element'].querySelector('button');
      expect(button?.getAttribute('title')).toBe(testComponent.tipLabel());
    });
  });

  describe('input changes', () => {
    it('should update collapsed when wolCollapsed input changes', () => {
      const setCollapsedSpy = vi.spyOn(overviewMapControl, 'setCollapsed');
      testComponent.collapsed.set(true);
      fixture.detectChanges();
      expect(setCollapsedSpy).toHaveBeenCalledWith(true);
      expect(overviewMapControl.getCollapsed()).toBe(true);
    });

    it('should update collapsed back to false when wolCollapsed changes to false', () => {
      testComponent.collapsed.set(true);
      fixture.detectChanges();
      const setCollapsedSpy = vi.spyOn(overviewMapControl, 'setCollapsed');
      testComponent.collapsed.set(false);
      fixture.detectChanges();
      expect(setCollapsedSpy).toHaveBeenCalledWith(false);
      expect(overviewMapControl.getCollapsed()).toBe(false);
    });

    it('should update collapsible when wolCollapsible input changes', () => {
      const setCollapsibleSpy = vi.spyOn(overviewMapControl, 'setCollapsible');
      testComponent.collapsible.set(false);
      fixture.detectChanges();
      expect(setCollapsibleSpy).toHaveBeenCalledWith(false);
      expect(overviewMapControl.getCollapsible()).toBe(false);
    });

    it('should update collapsible back to true when wolCollapsible changes to true', () => {
      testComponent.collapsible.set(false);
      fixture.detectChanges();
      const setCollapsibleSpy = vi.spyOn(overviewMapControl, 'setCollapsible');
      testComponent.collapsible.set(true);
      fixture.detectChanges();
      expect(setCollapsibleSpy).toHaveBeenCalledWith(true);
      expect(overviewMapControl.getCollapsible()).toBe(true);
    });

    it('should update rotateWithView when wolRotateWithView input changes', () => {
      const setRotateWithViewSpy = vi.spyOn(overviewMapControl, 'setRotateWithView');
      testComponent.rotateWithView.set(true);
      fixture.detectChanges();
      expect(setRotateWithViewSpy).toHaveBeenCalledWith(true);
    });

    it('should update rotateWithView back to false when wolRotateWithView changes to false', () => {
      testComponent.rotateWithView.set(true);
      fixture.detectChanges();
      const setRotateWithViewSpy = vi.spyOn(overviewMapControl, 'setRotateWithView');
      testComponent.rotateWithView.set(false);
      fixture.detectChanges();
      expect(setRotateWithViewSpy).toHaveBeenCalledWith(false);
    });

    it('should update target when wolTarget input changes to a string', () => {
      const setTargetSpy = vi.spyOn(overviewMapControl, 'setTarget');
      testComponent.target.set('new-container');
      fixture.detectChanges();
      expect(setTargetSpy).toHaveBeenCalledWith('new-container');
    });

    it('should update target when wolTarget input changes to an HTMLElement', () => {
      const setTargetSpy = vi.spyOn(overviewMapControl, 'setTarget');
      const newTarget = document.createElement('div');
      testComponent.target.set(newTarget);
      fixture.detectChanges();
      expect(setTargetSpy).toHaveBeenCalledWith(newTarget);
    });

    it('should update properties when wolProperties input changes', () => {
      const setPropertiesSpy = vi.spyOn(overviewMapControl, 'setProperties');
      const newProperties: WolProperties = { updated: true };
      testComponent.properties.set(newProperties);
      fixture.detectChanges();
      expect(setPropertiesSpy).toHaveBeenCalledWith(newProperties, false);
      expect(overviewMapControl.getProperties()).toMatchObject(newProperties);
    });

    it('should call setProperties with empty object when wolProperties is set to undefined', () => {
      const setPropertiesSpy = vi.spyOn(overviewMapControl, 'setProperties');
      testComponent.properties.set(undefined as unknown as WolProperties);
      fixture.detectChanges();
      expect(setPropertiesSpy).toHaveBeenCalledWith({}, false);
    });
  });

  describe('output events', () => {
    it('should emit wolChange when the control dispatches a change event', () => {
      const changeSpy = vi.spyOn(overviewMapControlComponent.wolChange, 'emit');
      const changeEvent = new BaseEvent('change');
      overviewMapControl.dispatchEvent(changeEvent);
      expect(changeSpy).toHaveBeenCalledWith(changeEvent);
    });

    it('should emit wolError when the control dispatches an error event', () => {
      const errorSpy = vi.spyOn(overviewMapControlComponent.wolError, 'emit');
      const errorEvent = new BaseEvent('error');
      overviewMapControl.dispatchEvent(errorEvent);
      expect(errorSpy).toHaveBeenCalledWith(errorEvent);
    });

    it('should emit wolPropertyChange when the control dispatches a propertychange event', () => {
      const propertyChangeSpy = vi.spyOn(overviewMapControlComponent.wolPropertyChange, 'emit');
      const event = new ObjectEvent('propertychange', 'someKey', 'oldValue');
      overviewMapControl.dispatchEvent(event);
      expect(propertyChangeSpy).toHaveBeenCalledWith(event);
    });

    it('should emit wolChange only for change events and not for other events', () => {
      const changeSpy = vi.spyOn(overviewMapControlComponent.wolChange, 'emit');
      overviewMapControl.dispatchEvent(new BaseEvent('error'));
      expect(changeSpy).not.toHaveBeenCalled();
    });

    it('should emit wolError only for error events and not for other events', () => {
      const errorSpy = vi.spyOn(overviewMapControlComponent.wolError, 'emit');
      overviewMapControl.dispatchEvent(new BaseEvent('change'));
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('should emit wolPropertyChange only for propertychange events and not for change events', () => {
      const propertyChangeSpy = vi.spyOn(overviewMapControlComponent.wolPropertyChange, 'emit');
      overviewMapControl.dispatchEvent(new BaseEvent('change'));
      expect(propertyChangeSpy).not.toHaveBeenCalled();
    });
  });

  describe('destroy', () => {
    it('should remove the control from the map when the component is destroyed', () => {
      const removeControlSpy = vi.spyOn(mapInstance, 'removeControl');
      const instanceBeforeDestroy = overviewMapControlComponent.getInstance() as OverviewMap;
      testComponent.destroyControl.set(true);
      fixture.detectChanges();
      expect(overviewMapControlComponent.getInstance()).toBeUndefined();
      expect(removeControlSpy).toHaveBeenCalledWith(instanceBeforeDestroy);
    });

    it('should unsubscribe from change events when the component is destroyed', () => {
      const changeSpy = vi.spyOn(overviewMapControlComponent.wolChange, 'emit');
      testComponent.destroyControl.set(true);
      fixture.detectChanges();
      overviewMapControl.dispatchEvent(new BaseEvent('change'));
      expect(changeSpy).not.toHaveBeenCalled();
    });

    it('should not emit wolError after component is destroyed', () => {
      const errorSpy = vi.spyOn(overviewMapControlComponent.wolError, 'emit');
      testComponent.destroyControl.set(true);
      fixture.detectChanges();
      overviewMapControl.dispatchEvent(new BaseEvent('error'));
      expect(errorSpy).not.toHaveBeenCalled();
    });

    it('should not emit wolPropertyChange after component is destroyed', () => {
      const propertyChangeSpy = vi.spyOn(overviewMapControlComponent.wolPropertyChange, 'emit');
      testComponent.destroyControl.set(true);
      fixture.detectChanges();
      overviewMapControl.dispatchEvent(new ObjectEvent('propertychange', 'key', 'old'));
      expect(propertyChangeSpy).not.toHaveBeenCalled();
    });
  });
});

@Component({
  selector: 'wol-test-overview-map-control',
  imports: [WolMapComponent, WolViewComponent, WolOverviewMapControlComponent],
  template: `
    <wol-map>
      <wol-view [wolZoom]="2" [wolCenter]="[0, 0]" />
      @if (!destroyControl()) {
        <wol-overview-map-control
          [wolClassName]="className()"
          [wolCollapsed]="collapsed()"
          [wolCollapsible]="collapsible()"
          [wolLayers]="layers()"
          [wolRotateWithView]="rotateWithView()"
          [wolTarget]="target()"
          [wolTipLabel]="tipLabel()"
          [wolView]="view()"
          [wolProperties]="properties()"
        />
      }
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestOverviewMapControlComponent {
  className = signal('custom-overview-map');
  collapsed = signal(false);
  collapsible = signal(true);
  layers = signal(new Collection([new TileLayer({ source: new OSM() })]));
  rotateWithView = signal(false);
  target = signal<HTMLElement | string>('');
  tipLabel = signal('Overview map');
  view = signal(new View({ zoom: 2, center: [0, 0] }));
  properties = signal<WolProperties>({ foo: 'bar' });
  destroyControl = signal(false);
}
