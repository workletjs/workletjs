import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import Map from 'ol/Map';
import MapEvent from 'ol/MapEvent';
import { ObjectEvent } from 'ol/Object';
import Attribution from 'ol/control/Attribution';
import BaseEvent from 'ol/events/Event';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolAttributionControlComponent } from './attribution-control.component';

describe('WolAttributionControlComponent', () => {
  let fixture: ComponentFixture<TestAttributionControlComponent>;
  let testComponent: TestAttributionControlComponent;
  let mapComponent: WolMapComponent;
  let mapInstance: Map;
  let attributionControlComponent: WolAttributionControlComponent;
  let attributionControl: ReturnType<WolAttributionControlComponent['getInstance']>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestAttributionControlComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const mapDebugElement = fixture.debugElement.query(By.directive(WolMapComponent));
    const attributionDebugElement = fixture.debugElement.query(
      By.directive(WolAttributionControlComponent),
    );

    testComponent = fixture.componentInstance;
    mapComponent = mapDebugElement.componentInstance;
    mapInstance = mapComponent.getInstance() as Map;
    attributionControlComponent = attributionDebugElement.componentInstance;
    attributionControl = attributionControlComponent.getInstance();
  });

  it('should create the attribution control and register it on the map', () => {
    expect(attributionControlComponent).toBeTruthy();
    expect(attributionControl).toBeDefined();
    const controls = mapInstance.getControls().getArray();
    expect(controls).toContain(attributionControl);
  });

  it('should initialize the attribution control with provided inputs', () => {
    expect(attributionControl?.getCollapsed()).toBe(testComponent.collapsed());
    expect(attributionControl?.getCollapsible()).toBe(testComponent.collapsible());
    expect(attributionControl?.getProperties()).toMatchObject(testComponent.properties());
  });

  it('should update collapsed when wolCollapsed input changes', () => {
    const setCollapsedSpy = vi.spyOn(attributionControl as Attribution, 'setCollapsed');
    testComponent.collapsed.set(false);
    fixture.detectChanges();
    expect(setCollapsedSpy).toHaveBeenCalledWith(false);
    expect(attributionControl?.getCollapsed()).toBe(false);
  });

  it('should update collapsible when wolCollapsible input changes', () => {
    const setCollapsibleSpy = vi.spyOn(attributionControl as Attribution, 'setCollapsible');
    testComponent.collapsible.set(false);
    fixture.detectChanges();
    expect(setCollapsibleSpy).toHaveBeenCalledWith(false);
    expect(attributionControl?.getCollapsible()).toBe(false);
  });

  it('should update properties when wolProperties input changes', () => {
    const setPropertiesSpy = vi.spyOn(attributionControl as Attribution, 'setProperties');
    const newProperties: WolProperties = { updated: true };
    testComponent.properties.set(newProperties);
    fixture.detectChanges();
    expect(setPropertiesSpy).toHaveBeenCalledWith(newProperties);
    expect(attributionControl?.getProperties()).toMatchObject(newProperties);
  });

  it('should emit change event when attribution control triggers change', () => {
    const changeSpy = vi.spyOn(attributionControlComponent.wolChange, 'emit');
    const changeEvent = new BaseEvent('change');
    attributionControl?.dispatchEvent(changeEvent);
    expect(changeSpy).toHaveBeenCalledWith(changeEvent);
  });

  it('should emit error event when attribution control triggers error', () => {
    const errorSpy = vi.spyOn(attributionControlComponent.wolError, 'emit');
    const errorEvent = new BaseEvent('error');
    attributionControl?.dispatchEvent(errorEvent);
    expect(errorSpy).toHaveBeenCalledWith(errorEvent);
  });

  it('should emit propertychange event when attribution control triggers propertychange', () => {
    const propertyChangeSpy = vi.spyOn(attributionControlComponent.wolPropertyChange, 'emit');
    const event = new ObjectEvent('propertychange', 'visible', true);
    attributionControl?.dispatchEvent(event);
    expect(propertyChangeSpy).toHaveBeenCalledWith(event);
  });

  it('should update properties with empty object when wolProperties is set to undefined', () => {
    const setPropertiesSpy = vi.spyOn(attributionControl as Attribution, 'setProperties');
    testComponent.properties.set(undefined as unknown as WolProperties);
    fixture.detectChanges();
    expect(setPropertiesSpy).toHaveBeenCalledWith({});
  });

  it('should remove the control from the Map when destroyed', () => {
    const removeControlSpy = vi.spyOn(mapInstance, 'removeControl');
    const instanceBeforeDestroy = attributionControlComponent.getInstance() as Attribution;
    testComponent.destroyControl.set(true);
    fixture.detectChanges();
    expect(attributionControlComponent.getInstance()).toBeUndefined();
    expect(removeControlSpy).toHaveBeenCalledWith(instanceBeforeDestroy);
  });
});

@Component({
  selector: 'wol-test-attribution-control',
  imports: [WolMapComponent, WolViewComponent, WolAttributionControlComponent],
  template: `
    <wol-map>
      <wol-view [wolZoom]="2" [wolCenter]="[0, 0]" />
      @if (!destroyControl()) {
        <wol-attribution-control
          [wolClassName]="className()"
          [wolCollapsible]="collapsible()"
          [wolCollapsed]="collapsed()"
          [wolTipLabel]="tipLabel()"
          [wolLabel]="label()"
          [wolExpandClassName]="expandClassName()"
          [wolCollapseLabel]="collapseLabel()"
          [wolCollapseClassName]="collapseClassName()"
          [wolAttributions]="attributions()"
          [wolRender]="render()"
          [wolProperties]="properties()"
        />
      }
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestAttributionControlComponent {
  className = signal('custom-attribution');
  collapsible = signal(true);
  collapsed = signal(true);
  tipLabel = signal('Attributions');
  label = signal('i');
  expandClassName = signal('ol-attribution-expand');
  collapseLabel = signal('›');
  collapseClassName = signal('ol-attribution-collapse');
  attributions = signal<string | string[]>(['© OpenStreetMap contributors']);
  render = signal<(event: MapEvent) => void>(() => void 0);
  properties = signal<WolProperties>({ foo: 'bar' });
  destroyControl = signal(false);
}
