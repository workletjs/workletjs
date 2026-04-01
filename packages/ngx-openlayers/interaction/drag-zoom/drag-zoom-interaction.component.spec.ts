import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import Map from 'ol/Map';
import MapBrowserEvent from 'ol/MapBrowserEvent';
import { ObjectEvent } from 'ol/Object';
import BaseEvent from 'ol/events/Event';
import { Condition, shiftKeyOnly } from 'ol/events/condition';
import { DragBoxEvent } from 'ol/interaction/DragBox';
import DragZoom from 'ol/interaction/DragZoom';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolDragZoomInteractionComponent } from './drag-zoom-interaction.component';

const mockMapBrowserEvent = {} as unknown as MapBrowserEvent<PointerEvent>;

describe('WolDragZoomInteractionComponent', () => {
  const internals = (obj: object) => obj as unknown as Record<string, unknown>;

  let fixture: ComponentFixture<TestDragZoomInteractionComponent>;
  let testComponent: TestDragZoomInteractionComponent;
  let mapComponent: WolMapComponent;
  let mapInstance: Map;
  let dragZoomComponent: WolDragZoomInteractionComponent;
  let dragZoomInstance: DragZoom;

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestDragZoomInteractionComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const mapDebugElement = fixture.debugElement.query(By.directive(WolMapComponent));
    const dragZoomDebugElement = fixture.debugElement.query(
      By.directive(WolDragZoomInteractionComponent),
    );

    testComponent = fixture.componentInstance;
    mapComponent = mapDebugElement.componentInstance;
    mapInstance = mapComponent.getInstance() as Map;
    dragZoomComponent = dragZoomDebugElement.componentInstance;
    dragZoomInstance = dragZoomComponent.getInstance() as DragZoom;
  });

  it('should create the drag-zoom interaction and register it on the map', () => {
    expect(dragZoomComponent).toBeTruthy();
    expect(dragZoomInstance).toBeInstanceOf(DragZoom);
    expect(mapInstance.getInteractions().getArray()).toContain(dragZoomInstance);
  });

  it('should initialize wolActive with provided value', () => {
    expect(dragZoomInstance.getActive()).toBe(testComponent.active());
  });

  it('should initialize with condition from input', () => {
    expect(internals(dragZoomInstance)['condition_']).toBe(testComponent.condition());
  });

  it('should initialize with duration from input', () => {
    expect(internals(dragZoomInstance)['duration_']).toBe(testComponent.duration());
  });

  it('should initialize with out from input', () => {
    expect(internals(dragZoomInstance)['out_']).toBe(testComponent.out());
  });

  it('should initialize with minArea from input', () => {
    expect(internals(dragZoomInstance)['minArea_']).toBe(testComponent.minArea());
  });

  it('should initialize wolProperties on the instance', () => {
    const props = testComponent.properties();
    expect(dragZoomInstance.get('testProp')).toBe(props['testProp']);
  });

  describe('wolActive model', () => {
    it('should update OL instance active state when wolActive changes', () => {
      testComponent.active.set(false);
      fixture.detectChanges();
      expect(dragZoomInstance.getActive()).toBe(false);
    });

    it('should set wolActive to false when OL fires change:active with false', () => {
      dragZoomInstance.setActive(false);
      expect(dragZoomComponent.wolActive()).toBe(false);
    });

    it('should set wolActive to true when OL fires change:active with true', () => {
      dragZoomInstance.setActive(false);
      dragZoomInstance.setActive(true);
      expect(dragZoomComponent.wolActive()).toBe(true);
    });
  });

  it('should update OL instance properties when wolProperties changes', () => {
    testComponent.properties.set({ testProp: 'updated' });
    fixture.detectChanges();
    expect(dragZoomInstance.get('testProp')).toBe('updated');
  });

  it('should emit wolBoxCancel when OL fires boxcancel event', () => {
    const boxCancelSpy = vi.spyOn(dragZoomComponent.wolBoxCancel, 'emit');
    const event = new DragBoxEvent('boxcancel', [0, 0], mockMapBrowserEvent);
    dragZoomInstance.dispatchEvent(event);
    expect(boxCancelSpy).toHaveBeenCalledWith(event);
  });

  it('should emit wolBoxDrag when OL fires boxdrag event', () => {
    const boxDragSpy = vi.spyOn(dragZoomComponent.wolBoxDrag, 'emit');
    const event = new DragBoxEvent('boxdrag', [0, 0], mockMapBrowserEvent);
    dragZoomInstance.dispatchEvent(event);
    expect(boxDragSpy).toHaveBeenCalledWith(event);
  });

  it('should emit wolBoxEnd when OL fires boxend event', () => {
    const boxEndSpy = vi.spyOn(dragZoomComponent.wolBoxEnd, 'emit');
    const event = new DragBoxEvent('boxend', [0, 0], mockMapBrowserEvent);
    dragZoomInstance.dispatchEvent(event);
    expect(boxEndSpy).toHaveBeenCalledWith(event);
  });

  it('should emit wolBoxStart when OL fires boxstart event', () => {
    const boxStartSpy = vi.spyOn(dragZoomComponent.wolBoxStart, 'emit');
    const event = new DragBoxEvent('boxstart', [0, 0], mockMapBrowserEvent);
    dragZoomInstance.dispatchEvent(event);
    expect(boxStartSpy).toHaveBeenCalledWith(event);
  });

  it('should emit wolChange when OL fires change event', () => {
    const changeSpy = vi.spyOn(dragZoomComponent.wolChange, 'emit');
    const event = new BaseEvent('change');
    dragZoomInstance.dispatchEvent(event);
    expect(changeSpy).toHaveBeenCalledWith(event);
  });

  it('should emit wolError when OL fires error event', () => {
    const errorSpy = vi.spyOn(dragZoomComponent.wolError, 'emit');
    const event = new BaseEvent('error');
    dragZoomInstance.dispatchEvent(event);
    expect(errorSpy).toHaveBeenCalledWith(event);
  });

  it('should emit wolPropertyChange when OL fires propertychange event', () => {
    const propertyChangeSpy = vi.spyOn(dragZoomComponent.wolPropertyChange, 'emit');
    const event = new ObjectEvent('propertychange', 'someKey', undefined);
    dragZoomInstance.dispatchEvent(event);
    expect(propertyChangeSpy).toHaveBeenCalledWith(event);
  });

  describe('destroy', () => {
    it('should remove the interaction from the map on destroy', () => {
      testComponent.destroyInteraction.set(true);
      fixture.detectChanges();
      expect(mapInstance.getInteractions().getArray()).not.toContain(dragZoomInstance);
    });

    it('should set getInstance() to undefined after destroy', () => {
      testComponent.destroyInteraction.set(true);
      fixture.detectChanges();
      expect(dragZoomComponent.getInstance()).toBeUndefined();
    });
  });
});

@Component({
  template: `
    <wol-map>
      <wol-view [wolZoom]="4" />
      @if (!destroyInteraction()) {
        <wol-drag-zoom-interaction
          [(wolActive)]="active"
          [wolCondition]="condition()"
          [wolDuration]="duration()"
          [wolOut]="out()"
          [wolMinArea]="minArea()"
          [wolProperties]="properties()"
        />
      }
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WolMapComponent, WolViewComponent, WolDragZoomInteractionComponent],
})
class TestDragZoomInteractionComponent {
  readonly active = signal(true);
  readonly condition = signal<Condition>(shiftKeyOnly);
  readonly duration = signal(200);
  readonly out = signal(false);
  readonly minArea = signal(64);
  readonly properties = signal<WolProperties>({ testProp: 'initial' });
  readonly destroyInteraction = signal(false);
}
