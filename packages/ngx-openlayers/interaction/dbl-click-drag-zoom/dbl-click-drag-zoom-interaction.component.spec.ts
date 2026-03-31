import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import Map from 'ol/Map';
import { ObjectEvent } from 'ol/Object';
import BaseEvent from 'ol/events/Event';
import DblClickDragZoom from 'ol/interaction/DblClickDragZoom';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolDblClickDragZoomInteractionComponent } from './dbl-click-drag-zoom-interaction.component';

describe('WolDblClickDragZoomInteractionComponent', () => {
  const internals = (obj: object) => obj as unknown as Record<string, unknown>;

  let fixture: ComponentFixture<TestDblClickDragZoomInteractionComponent>;
  let testComponent: TestDblClickDragZoomInteractionComponent;
  let mapComponent: WolMapComponent;
  let mapInstance: Map;
  let dblClickDragZoomComponent: WolDblClickDragZoomInteractionComponent;
  let dblClickDragZoom: DblClickDragZoom;

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestDblClickDragZoomInteractionComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const mapDebugElement = fixture.debugElement.query(By.directive(WolMapComponent));
    const dblClickDragZoomDebugElement = fixture.debugElement.query(
      By.directive(WolDblClickDragZoomInteractionComponent),
    );

    testComponent = fixture.componentInstance;
    mapComponent = mapDebugElement.componentInstance;
    mapInstance = mapComponent.getInstance() as Map;
    dblClickDragZoomComponent = dblClickDragZoomDebugElement.componentInstance;
    dblClickDragZoom = dblClickDragZoomComponent.getInstance() as DblClickDragZoom;
  });

  it('should create the dblClickDragZoom interaction and register it on the map', () => {
    expect(dblClickDragZoomComponent).toBeTruthy();
    expect(dblClickDragZoom).toBeInstanceOf(DblClickDragZoom);
    expect(mapInstance.getInteractions().getArray()).toContain(dblClickDragZoom);
  });

  // --- initialization ---

  it('should initialize with wolActive from input', () => {
    expect(dblClickDragZoom.getActive()).toBe(testComponent.active());
  });

  it('should initialize with wolDuration from input', () => {
    expect(internals(dblClickDragZoom)['duration_']).toBe(testComponent.duration());
  });

  it('should initialize with wolDelta from input', () => {
    expect(internals(dblClickDragZoom)['scaleDeltaByPixel_']).toBe(testComponent.delta());
  });

  it('should initialize with wolStopDown from input', () => {
    expect(internals(dblClickDragZoom)['stopDown']).toBe(testComponent.stopDown());
  });

  it('should initialize with wolProperties from input', () => {
    expect(dblClickDragZoom.getProperties()).toMatchObject(testComponent.properties());
  });

  // --- model: wolActive ---

  it('should update active state when wolActive model changes', () => {
    testComponent.active.set(false);
    fixture.detectChanges();
    expect(dblClickDragZoom.getActive()).toBe(false);
  });

  it('should update wolActive model when OL interaction changes active state', () => {
    const setActiveSpy = vi.spyOn(dblClickDragZoomComponent.wolActive, 'set');
    dblClickDragZoom.setActive(false);
    fixture.detectChanges();
    expect(setActiveSpy).toHaveBeenCalledWith(false);
  });

  it('should re-activate the interaction when wolActive is toggled back to true', () => {
    testComponent.active.set(false);
    fixture.detectChanges();
    expect(dblClickDragZoom.getActive()).toBe(false);

    testComponent.active.set(true);
    fixture.detectChanges();
    expect(dblClickDragZoom.getActive()).toBe(true);
  });

  // --- input: wolProperties ---

  it('should update properties when wolProperties input changes', () => {
    const newProperties: WolProperties = { updated: true };
    testComponent.properties.set(newProperties);
    fixture.detectChanges();
    expect(dblClickDragZoom.getProperties()).toMatchObject(newProperties);
  });

  // --- output: wolChange ---

  it('should emit change event when dblClickDragZoom interaction triggers change', () => {
    const changeSpy = vi.spyOn(dblClickDragZoomComponent.wolChange, 'emit');
    const changeEvent = new BaseEvent('change');
    dblClickDragZoom.dispatchEvent(changeEvent);
    expect(changeSpy).toHaveBeenCalledWith(changeEvent);
  });

  // --- output: wolError ---

  it('should emit error event when dblClickDragZoom interaction triggers error', () => {
    const errorSpy = vi.spyOn(dblClickDragZoomComponent.wolError, 'emit');
    const errorEvent = new BaseEvent('error');
    dblClickDragZoom.dispatchEvent(errorEvent);
    expect(errorSpy).toHaveBeenCalledWith(errorEvent);
  });

  // --- output: wolPropertyChange ---

  it('should emit propertychange event when dblClickDragZoom interaction triggers propertychange', () => {
    const propertyChangeSpy = vi.spyOn(dblClickDragZoomComponent.wolPropertyChange, 'emit');
    const event = new ObjectEvent('propertychange', 'active', true);
    dblClickDragZoom.dispatchEvent(event);
    expect(propertyChangeSpy).toHaveBeenCalledWith(event);
  });

  // --- destroy ---

  it('should remove the interaction from the map when destroyed', () => {
    const removeInteractionSpy = vi.spyOn(mapInstance, 'removeInteraction');
    testComponent.destroyInteraction.set(true);
    fixture.detectChanges();
    expect(dblClickDragZoomComponent.getInstance()).toBeUndefined();
    expect(removeInteractionSpy).toHaveBeenCalledWith(dblClickDragZoom);
  });

  it('should return undefined from getInstance() after destruction', () => {
    testComponent.destroyInteraction.set(true);
    fixture.detectChanges();
    expect(dblClickDragZoomComponent.getInstance()).toBeUndefined();
  });
});

@Component({
  selector: 'wol-test-dbl-click-drag-zoom-interaction',
  imports: [WolMapComponent, WolViewComponent, WolDblClickDragZoomInteractionComponent],
  template: `
    <wol-map>
      <wol-view [wolZoom]="2" [wolCenter]="[0, 0]" />
      @if (!destroyInteraction()) {
        <wol-dbl-click-drag-zoom-interaction
          [(wolActive)]="active"
          [wolDuration]="duration()"
          [wolDelta]="delta()"
          [wolStopDown]="stopDown()"
          [wolProperties]="properties()"
        />
      }
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestDblClickDragZoomInteractionComponent {
  active = signal(true);
  duration = signal(400);
  delta = signal(1);
  stopDown = signal<(isDblClick: boolean) => boolean>(() => true);
  properties = signal<WolProperties>({ foo: 'bar' });
  destroyInteraction = signal(false);
}
