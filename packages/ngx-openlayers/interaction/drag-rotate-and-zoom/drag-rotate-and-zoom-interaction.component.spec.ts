import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import Map from 'ol/Map';
import { ObjectEvent } from 'ol/Object';
import BaseEvent from 'ol/events/Event';
import { Condition, altShiftKeysOnly } from 'ol/events/condition';
import DragRotateAndZoom from 'ol/interaction/DragRotateAndZoom';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolDragRotateAndZoomInteractionComponent } from './drag-rotate-and-zoom-interaction.component';

describe('WolDragRotateAndZoomInteractionComponent', () => {
  const internals = (obj: object) => obj as unknown as Record<string, unknown>;

  let fixture: ComponentFixture<TestDragRotateAndZoomInteractionComponent>;
  let testComponent: TestDragRotateAndZoomInteractionComponent;
  let mapComponent: WolMapComponent;
  let mapInstance: Map;
  let dragRotateAndZoomComponent: WolDragRotateAndZoomInteractionComponent;
  let dragRotateAndZoomInstance: DragRotateAndZoom;

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestDragRotateAndZoomInteractionComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const mapDebugElement = fixture.debugElement.query(By.directive(WolMapComponent));
    const dragRotateAndZoomDebugElement = fixture.debugElement.query(
      By.directive(WolDragRotateAndZoomInteractionComponent),
    );

    testComponent = fixture.componentInstance;
    mapComponent = mapDebugElement.componentInstance;
    mapInstance = mapComponent.getInstance() as Map;
    dragRotateAndZoomComponent = dragRotateAndZoomDebugElement.componentInstance;
    dragRotateAndZoomInstance = dragRotateAndZoomComponent.getInstance() as DragRotateAndZoom;
  });

  it('should create the drag-rotate-and-zoom interaction and register it on the map', () => {
    expect(dragRotateAndZoomComponent).toBeTruthy();
    expect(dragRotateAndZoomInstance).toBeInstanceOf(DragRotateAndZoom);
    expect(mapInstance.getInteractions().getArray()).toContain(dragRotateAndZoomInstance);
  });

  it('should initialize wolActive with provided value', () => {
    expect(dragRotateAndZoomInstance.getActive()).toBe(testComponent.active());
  });

  it('should initialize with condition from input', () => {
    expect(internals(dragRotateAndZoomInstance)['condition_']).toBe(testComponent.condition());
  });

  it('should initialize with duration from input', () => {
    expect(internals(dragRotateAndZoomInstance)['duration_']).toBe(testComponent.duration());
  });

  it('should initialize wolProperties on the instance', () => {
    const props = testComponent.properties();
    expect(dragRotateAndZoomInstance.get('testProp')).toBe(props['testProp']);
  });

  describe('wolActive model', () => {
    it('should update OL instance active state when wolActive changes', () => {
      testComponent.active.set(false);
      fixture.detectChanges();
      expect(dragRotateAndZoomInstance.getActive()).toBe(false);
    });

    it('should set wolActive to false when OL fires change:active with false', () => {
      dragRotateAndZoomInstance.setActive(false);
      expect(testComponent.active()).toBe(false);
    });

    it('should set wolActive to true when OL fires change:active with true', () => {
      dragRotateAndZoomInstance.setActive(false);
      dragRotateAndZoomInstance.setActive(true);
      expect(testComponent.active()).toBe(true);
    });
  });

  it('should update OL instance properties when wolProperties changes', () => {
    testComponent.properties.set({ testProp: 'updated' });
    fixture.detectChanges();
    expect(dragRotateAndZoomInstance.get('testProp')).toBe('updated');
  });

  it('should emit wolChange when OL fires change event', () => {
    const changeSpy = vi.spyOn(dragRotateAndZoomComponent.wolChange, 'emit');
    const event = new BaseEvent('change');
    dragRotateAndZoomInstance.dispatchEvent(event);
    expect(changeSpy).toHaveBeenCalledWith(event);
  });

  it('should emit wolError when OL fires error event', () => {
    const errorSpy = vi.spyOn(dragRotateAndZoomComponent.wolError, 'emit');
    const event = new BaseEvent('error');
    dragRotateAndZoomInstance.dispatchEvent(event);
    expect(errorSpy).toHaveBeenCalledWith(event);
  });

  it('should emit wolPropertyChange when OL fires propertychange event', () => {
    const propertyChangeSpy = vi.spyOn(dragRotateAndZoomComponent.wolPropertyChange, 'emit');
    const event = new ObjectEvent('propertychange', 'active', true);
    dragRotateAndZoomInstance.dispatchEvent(event);
    expect(propertyChangeSpy).toHaveBeenCalledWith(event);
  });

  describe('destroy', () => {
    it('should remove the interaction from the map on destroy', () => {
      testComponent.destroyInteraction.set(true);
      fixture.detectChanges();
      expect(mapInstance.getInteractions().getArray()).not.toContain(dragRotateAndZoomInstance);
    });

    it('should set getInstance() to undefined after destroy', () => {
      testComponent.destroyInteraction.set(true);
      fixture.detectChanges();
      expect(dragRotateAndZoomComponent.getInstance()).toBeUndefined();
    });
  });
});

@Component({
  template: `
    <wol-map>
      <wol-view [wolZoom]="4" />
      @if (!destroyInteraction()) {
        <wol-drag-rotate-and-zoom-interaction
          [(wolActive)]="active"
          [wolCondition]="condition()"
          [wolDuration]="duration()"
          [wolProperties]="properties()"
        />
      }
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WolMapComponent, WolViewComponent, WolDragRotateAndZoomInteractionComponent],
})
class TestDragRotateAndZoomInteractionComponent {
  readonly active = signal(true);
  readonly condition = signal<Condition>(altShiftKeysOnly);
  readonly duration = signal(400);
  readonly properties = signal<WolProperties>({ testProp: 'initial' });
  readonly destroyInteraction = signal(false);
}
