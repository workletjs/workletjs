import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import Map from 'ol/Map';
import { ObjectEvent } from 'ol/Object';
import BaseEvent from 'ol/events/Event';
import DoubleClickZoom from 'ol/interaction/DoubleClickZoom';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolDoubleClickZoomInteractionComponent } from './double-click-zoom-interaction.component';

describe('WolDoubleClickZoomInteractionComponent', () => {
  const internals = (obj: object) => obj as unknown as Record<string, unknown>;

  let fixture: ComponentFixture<TestDoubleClickZoomInteractionComponent>;
  let testComponent: TestDoubleClickZoomInteractionComponent;
  let mapComponent: WolMapComponent;
  let mapInstance: Map;
  let doubleClickZoomComponent: WolDoubleClickZoomInteractionComponent;
  let doubleClickZoom: DoubleClickZoom;

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestDoubleClickZoomInteractionComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const mapDebugElement = fixture.debugElement.query(By.directive(WolMapComponent));
    const doubleClickZoomDebugElement = fixture.debugElement.query(
      By.directive(WolDoubleClickZoomInteractionComponent),
    );

    testComponent = fixture.componentInstance;
    mapComponent = mapDebugElement.componentInstance;
    mapInstance = mapComponent.getInstance() as Map;
    doubleClickZoomComponent = doubleClickZoomDebugElement.componentInstance;
    doubleClickZoom = doubleClickZoomComponent.getInstance() as DoubleClickZoom;
  });

  it('should create the doubleClickZoom interaction and register it on the map', () => {
    expect(doubleClickZoomComponent).toBeTruthy();
    expect(doubleClickZoom).toBeInstanceOf(DoubleClickZoom);
    expect(mapInstance.getInteractions().getArray()).toContain(doubleClickZoom);
  });

  // --- initialization ---

  it('should initialize with wolActive from input', () => {
    expect(doubleClickZoom.getActive()).toBe(testComponent.active());
  });

  it('should initialize with wolDuration from model', () => {
    expect(internals(doubleClickZoom)['duration_']).toBe(testComponent.duration());
  });

  it('should initialize with wolDelta from model', () => {
    expect(internals(doubleClickZoom)['delta_']).toBe(testComponent.delta());
  });

  it('should initialize with wolProperties from input', () => {
    expect(doubleClickZoom.getProperties()).toMatchObject(testComponent.properties());
  });

  // --- model: wolActive ---

  it('should update active state when wolActive model changes', () => {
    testComponent.active.set(false);
    fixture.detectChanges();
    expect(doubleClickZoom.getActive()).toBe(false);
  });

  it('should update wolActive model when OL interaction changes active state', () => {
    const setActiveSpy = vi.spyOn(doubleClickZoomComponent.wolActive, 'set');
    doubleClickZoom.setActive(false);
    fixture.detectChanges();
    expect(setActiveSpy).toHaveBeenCalledWith(false);
  });

  it('should re-activate the interaction when wolActive is toggled back to true', () => {
    testComponent.active.set(false);
    fixture.detectChanges();
    expect(doubleClickZoom.getActive()).toBe(false);

    testComponent.active.set(true);
    fixture.detectChanges();
    expect(doubleClickZoom.getActive()).toBe(true);
  });

  // --- input: wolProperties ---

  it('should update properties when wolProperties input changes', () => {
    const newProperties: WolProperties = { updated: true };
    testComponent.properties.set(newProperties);
    fixture.detectChanges();
    expect(doubleClickZoom.getProperties()).toMatchObject(newProperties);
  });

  // --- output: wolChange ---

  it('should emit change event when doubleClickZoom interaction triggers change', () => {
    const changeSpy = vi.spyOn(doubleClickZoomComponent.wolChange, 'emit');
    const changeEvent = new BaseEvent('change');
    doubleClickZoom.dispatchEvent(changeEvent);
    expect(changeSpy).toHaveBeenCalledWith(changeEvent);
  });

  // --- output: wolError ---

  it('should emit error event when doubleClickZoom interaction triggers error', () => {
    const errorSpy = vi.spyOn(doubleClickZoomComponent.wolError, 'emit');
    const errorEvent = new BaseEvent('error');
    doubleClickZoom.dispatchEvent(errorEvent);
    expect(errorSpy).toHaveBeenCalledWith(errorEvent);
  });

  // --- output: wolPropertyChange ---

  it('should emit propertychange event when doubleClickZoom interaction triggers propertychange', () => {
    const propertyChangeSpy = vi.spyOn(doubleClickZoomComponent.wolPropertyChange, 'emit');
    const event = new ObjectEvent('propertychange', 'active', true);
    doubleClickZoom.dispatchEvent(event);
    expect(propertyChangeSpy).toHaveBeenCalledWith(event);
  });

  // --- destroy ---

  it('should remove the interaction from the map when destroyed', () => {
    const removeInteractionSpy = vi.spyOn(mapInstance, 'removeInteraction');
    testComponent.destroyInteraction.set(true);
    fixture.detectChanges();
    expect(doubleClickZoomComponent.getInstance()).toBeUndefined();
    expect(removeInteractionSpy).toHaveBeenCalledWith(doubleClickZoom);
  });

  it('should return undefined from getInstance() after destruction', () => {
    testComponent.destroyInteraction.set(true);
    fixture.detectChanges();
    expect(doubleClickZoomComponent.getInstance()).toBeUndefined();
  });
});

@Component({
  selector: 'wol-test-double-click-zoom-interaction',
  imports: [WolMapComponent, WolViewComponent, WolDoubleClickZoomInteractionComponent],
  template: `
    <wol-map>
      <wol-view [wolZoom]="2" [wolCenter]="[0, 0]" />
      @if (!destroyInteraction()) {
        <wol-double-click-zoom-interaction
          [(wolActive)]="active"
          [(wolDuration)]="duration"
          [(wolDelta)]="delta"
          [wolProperties]="properties()"
        />
      }
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestDoubleClickZoomInteractionComponent {
  active = signal(true);
  duration = signal(300);
  delta = signal(2);
  properties = signal<WolProperties>({ foo: 'bar' });
  destroyInteraction = signal(false);
}
