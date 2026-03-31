import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import Map from 'ol/Map';
import { ObjectEvent } from 'ol/Object';
import BaseEvent from 'ol/events/Event';
import { Condition, altShiftKeysOnly } from 'ol/events/condition';
import DragRotate from 'ol/interaction/DragRotate';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolDragRotateInteractionComponent } from './drag-rotate-interaction.component';

describe('WolDragRotateInteractionComponent', () => {
  const internals = (obj: object) => obj as unknown as Record<string, unknown>;

  let fixture: ComponentFixture<TestDragRotateInteractionComponent>;
  let testComponent: TestDragRotateInteractionComponent;
  let mapComponent: WolMapComponent;
  let mapInstance: Map;
  let dragRotateComponent: WolDragRotateInteractionComponent;
  let dragRotateInstance: DragRotate;

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestDragRotateInteractionComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const mapDebugElement = fixture.debugElement.query(By.directive(WolMapComponent));
    const dragRotateDebugElement = fixture.debugElement.query(
      By.directive(WolDragRotateInteractionComponent),
    );

    testComponent = fixture.componentInstance;
    mapComponent = mapDebugElement.componentInstance;
    mapInstance = mapComponent.getInstance() as Map;
    dragRotateComponent = dragRotateDebugElement.componentInstance;
    dragRotateInstance = dragRotateComponent.getInstance() as DragRotate;
  });

  it('should create the drag-rotate interaction and register it on the map', () => {
    expect(dragRotateComponent).toBeTruthy();
    expect(dragRotateInstance).toBeInstanceOf(DragRotate);
    expect(mapInstance.getInteractions().getArray()).toContain(dragRotateInstance);
  });

  it('should initialize wolActive with provided value', () => {
    expect(dragRotateInstance.getActive()).toBe(testComponent.active());
  });

  it('should initialize with condition from input', () => {
    expect(internals(dragRotateInstance)['condition_']).toBe(testComponent.condition());
  });

  it('should initialize with duration from input', () => {
    expect(internals(dragRotateInstance)['duration_']).toBe(testComponent.duration());
  });

  it('should initialize wolProperties on the instance', () => {
    const props = testComponent.properties();
    expect(dragRotateInstance.get('testProp')).toBe(props['testProp']);
  });

  describe('wolActive model', () => {
    it('should update OL instance active state when wolActive changes', () => {
      testComponent.active.set(false);
      fixture.detectChanges();
      expect(dragRotateInstance.getActive()).toBe(false);
    });

    it('should set wolActive to false when OL fires change:active with false', () => {
      dragRotateInstance.setActive(false);
      expect(dragRotateComponent.wolActive()).toBe(false);
    });

    it('should set wolActive to true when OL fires change:active with true', () => {
      dragRotateInstance.setActive(false);
      dragRotateInstance.setActive(true);
      expect(dragRotateComponent.wolActive()).toBe(true);
    });
  });

  it('should update OL instance properties when wolProperties changes', () => {
    testComponent.properties.set({ testProp: 'updated' });
    fixture.detectChanges();
    expect(dragRotateInstance.get('testProp')).toBe('updated');
  });

  it('should emit wolChange when OL fires change event', () => {
    const changeSpy = vi.spyOn(dragRotateComponent.wolChange, 'emit');
    const event = new BaseEvent('change');
    dragRotateInstance.dispatchEvent(event);
    expect(changeSpy).toHaveBeenCalledWith(event);
  });

  it('should emit wolError when OL fires error event', () => {
    const errorSpy = vi.spyOn(dragRotateComponent.wolError, 'emit');
    const event = new BaseEvent('error');
    dragRotateInstance.dispatchEvent(event);
    expect(errorSpy).toHaveBeenCalledWith(event);
  });

  it('should emit wolPropertyChange when OL fires propertychange event', () => {
    const propertyChangeSpy = vi.spyOn(dragRotateComponent.wolPropertyChange, 'emit');
    const event = new ObjectEvent('propertychange', 'active', true);
    dragRotateInstance.dispatchEvent(event);
    expect(propertyChangeSpy).toHaveBeenCalledWith(event);
  });

  describe('destroy', () => {
    it('should remove the interaction from the map on destroy', () => {
      testComponent.destroyInteraction.set(true);
      fixture.detectChanges();
      expect(mapInstance.getInteractions().getArray()).not.toContain(dragRotateInstance);
    });

    it('should set getInstance() to undefined after destroy', () => {
      testComponent.destroyInteraction.set(true);
      fixture.detectChanges();
      expect(dragRotateComponent.getInstance()).toBeUndefined();
    });
  });
});

@Component({
  template: `
    <wol-map>
      <wol-view [wolZoom]="4" />
      @if (!destroyInteraction()) {
        <wol-drag-rotate-interaction
          [(wolActive)]="active"
          [wolCondition]="condition()"
          [wolDuration]="duration()"
          [wolProperties]="properties()"
        />
      }
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WolMapComponent, WolViewComponent, WolDragRotateInteractionComponent],
})
class TestDragRotateInteractionComponent {
  readonly active = signal(true);
  readonly condition = signal<Condition>(altShiftKeysOnly);
  readonly duration = signal(250);
  readonly properties = signal<WolProperties>({ testProp: 'initial' });
  readonly destroyInteraction = signal(false);
}
