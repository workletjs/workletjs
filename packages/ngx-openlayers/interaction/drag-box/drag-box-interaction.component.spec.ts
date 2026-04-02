import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import Map from 'ol/Map';
import MapBrowserEvent from 'ol/MapBrowserEvent';
import { ObjectEvent } from 'ol/Object';
import BaseEvent from 'ol/events/Event';
import { Condition } from 'ol/events/condition';
import DragBox, { DragBoxEvent, EndCondition } from 'ol/interaction/DragBox';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolDragBoxInteractionComponent } from './drag-box-interaction.component';

describe('WolDragBoxInteractionComponent', () => {
  const internals = (obj: object) => obj as unknown as Record<string, unknown>;
  const mockMapBrowserEvent = {} as unknown as MapBrowserEvent<PointerEvent>;

  let fixture: ComponentFixture<TestDragBoxInteractionComponent>;
  let testComponent: TestDragBoxInteractionComponent;
  let mapComponent: WolMapComponent;
  let mapInstance: Map;
  let dragBoxComponent: WolDragBoxInteractionComponent;
  let dragBox: DragBox;

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestDragBoxInteractionComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const mapDebugElement = fixture.debugElement.query(By.directive(WolMapComponent));
    const dragBoxDebugElement = fixture.debugElement.query(
      By.directive(WolDragBoxInteractionComponent),
    );

    testComponent = fixture.componentInstance;
    mapComponent = mapDebugElement.componentInstance;
    mapInstance = mapComponent.getInstance() as Map;
    dragBoxComponent = dragBoxDebugElement.componentInstance;
    dragBox = dragBoxComponent.getInstance() as DragBox;
  });

  it('should create the dragBox interaction and register it on the map', () => {
    expect(dragBoxComponent).toBeTruthy();
    expect(dragBox).toBeInstanceOf(DragBox);
    expect(mapInstance.getInteractions().getArray()).toContain(dragBox);
  });

  // --- initialization ---

  it('should initialize with wolActive from input', () => {
    expect(dragBox.getActive()).toBe(testComponent.active());
  });

  it('should initialize with wolMinArea from input', () => {
    expect(internals(dragBox)['minArea_']).toBe(testComponent.minArea());
  });

  it('should initialize with wolCondition from input', () => {
    expect(internals(dragBox)['condition_']).toBe(testComponent.condition());
  });

  it('should initialize with wolBoxEndCondition from input', () => {
    expect(internals(dragBox)['boxEndCondition_']).toBe(testComponent.boxEndCondition());
  });

  it('should initialize with wolClassName from input', () => {
    const element = internals(internals(dragBox)['box_'] as object)['element_'] as Element;
    expect(element.className).toContain(testComponent.className());
  });

  it('should initialize with wolOnBoxEnd from input', () => {
    expect(internals(dragBox)['onBoxEnd']).toBe(testComponent.onBoxEnd());
  });

  it('should initialize with wolProperties from input', () => {
    expect(dragBox.getProperties()).toMatchObject(testComponent.properties());
  });

  // --- model: wolActive ---

  it('should update active state when wolActive model changes', () => {
    testComponent.active.set(false);
    fixture.detectChanges();
    expect(dragBox.getActive()).toBe(false);
  });

  it('should update wolActive model when OL interaction changes active state', () => {
    const setActiveSpy = vi.spyOn(dragBoxComponent.wolActive, 'set');
    dragBox.setActive(false);
    fixture.detectChanges();
    expect(setActiveSpy).toHaveBeenCalledWith(false);
  });

  it('should re-activate the interaction when wolActive is toggled back to true', () => {
    testComponent.active.set(false);
    fixture.detectChanges();
    expect(dragBox.getActive()).toBe(false);

    testComponent.active.set(true);
    fixture.detectChanges();
    expect(dragBox.getActive()).toBe(true);
  });

  // --- input: wolProperties ---

  it('should update properties when wolProperties input changes', () => {
    const newProperties: WolProperties = { updated: true };
    testComponent.properties.set(newProperties);
    fixture.detectChanges();
    expect(dragBox.getProperties()).toMatchObject(newProperties);
  });

  // --- output: wolBoxCancel ---

  it('should emit boxcancel event when dragBox triggers boxcancel', () => {
    const boxCancelSpy = vi.spyOn(dragBoxComponent.wolBoxCancel, 'emit');
    const event = new DragBoxEvent('boxcancel', [0, 0], mockMapBrowserEvent);
    dragBox.dispatchEvent(event);
    expect(boxCancelSpy).toHaveBeenCalledWith(event);
  });

  // --- output: wolBoxDrag ---

  it('should emit boxdrag event when dragBox triggers boxdrag', () => {
    const boxDragSpy = vi.spyOn(dragBoxComponent.wolBoxDrag, 'emit');
    const event = new DragBoxEvent('boxdrag', [0, 0], mockMapBrowserEvent);
    dragBox.dispatchEvent(event);
    expect(boxDragSpy).toHaveBeenCalledWith(event);
  });

  // --- output: wolBoxEnd ---

  it('should emit boxend event when dragBox triggers boxend', () => {
    const boxEndSpy = vi.spyOn(dragBoxComponent.wolBoxEnd, 'emit');
    const event = new DragBoxEvent('boxend', [0, 0], mockMapBrowserEvent);
    dragBox.dispatchEvent(event);
    expect(boxEndSpy).toHaveBeenCalledWith(event);
  });

  // --- output: wolBoxStart ---

  it('should emit boxstart event when dragBox triggers boxstart', () => {
    const boxStartSpy = vi.spyOn(dragBoxComponent.wolBoxStart, 'emit');
    const event = new DragBoxEvent('boxstart', [0, 0], mockMapBrowserEvent);
    dragBox.dispatchEvent(event);
    expect(boxStartSpy).toHaveBeenCalledWith(event);
  });

  // --- output: wolChange ---

  it('should emit change event when dragBox interaction triggers change', () => {
    const changeSpy = vi.spyOn(dragBoxComponent.wolChange, 'emit');
    const changeEvent = new BaseEvent('change');
    dragBox.dispatchEvent(changeEvent);
    expect(changeSpy).toHaveBeenCalledWith(changeEvent);
  });

  // --- output: wolError ---

  it('should emit error event when dragBox interaction triggers error', () => {
    const errorSpy = vi.spyOn(dragBoxComponent.wolError, 'emit');
    const errorEvent = new BaseEvent('error');
    dragBox.dispatchEvent(errorEvent);
    expect(errorSpy).toHaveBeenCalledWith(errorEvent);
  });

  // --- output: wolPropertyChange ---

  it('should emit propertychange event when dragBox triggers propertychange', () => {
    const propertyChangeSpy = vi.spyOn(dragBoxComponent.wolPropertyChange, 'emit');
    const event = new ObjectEvent('propertychange', 'active', true);
    dragBox.dispatchEvent(event);
    expect(propertyChangeSpy).toHaveBeenCalledWith(event);
  });

  // --- destroy ---

  it('should remove the interaction from the map when destroyed', () => {
    const removeInteractionSpy = vi.spyOn(mapInstance, 'removeInteraction');
    testComponent.destroyInteraction.set(true);
    fixture.detectChanges();
    expect(dragBoxComponent.getInstance()).toBeUndefined();
    expect(removeInteractionSpy).toHaveBeenCalledWith(dragBox);
  });

  it('should return undefined from getInstance() after destruction', () => {
    testComponent.destroyInteraction.set(true);
    fixture.detectChanges();
    expect(dragBoxComponent.getInstance()).toBeUndefined();
  });
});

@Component({
  selector: 'wol-test-drag-box-interaction',
  imports: [WolMapComponent, WolViewComponent, WolDragBoxInteractionComponent],
  template: `
    <wol-map>
      <wol-view [wolZoom]="2" [wolCenter]="[0, 0]" />
      @if (!destroyInteraction()) {
        <wol-drag-box-interaction
          [(wolActive)]="active"
          [wolMinArea]="minArea()"
          [wolCondition]="condition()"
          [wolBoxEndCondition]="boxEndCondition()"
          [wolClassName]="className()"
          [wolOnBoxEnd]="onBoxEnd()"
          [wolProperties]="properties()"
        />
      }
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestDragBoxInteractionComponent {
  active = signal(true);
  minArea = signal(100);
  condition = signal<Condition>(() => true);
  boxEndCondition = signal<EndCondition>(() => true);
  className = signal<string>('ol-dragbox-test');
  onBoxEnd = signal<(event: MapBrowserEvent) => void>(vi.fn());
  properties = signal<WolProperties>({ foo: 'bar' });
  destroyInteraction = signal(false);
}
