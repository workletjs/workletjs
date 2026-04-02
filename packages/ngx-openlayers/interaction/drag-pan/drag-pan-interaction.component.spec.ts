import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import Kinetic from 'ol/Kinetic';
import Map from 'ol/Map';
import { ObjectEvent } from 'ol/Object';
import BaseEvent from 'ol/events/Event';
import { Condition, noModifierKeys, primaryAction } from 'ol/events/condition';
import DragPan from 'ol/interaction/DragPan';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolDragPanInteractionComponent } from './drag-pan-interaction.component';

describe('WolDragPanInteractionComponent', () => {
  const internals = (obj: object) => obj as unknown as Record<string, unknown>;

  let fixture: ComponentFixture<TestDragPanInteractionComponent>;
  let testComponent: TestDragPanInteractionComponent;
  let mapComponent: WolMapComponent;
  let mapInstance: Map;
  let dragPanComponent: WolDragPanInteractionComponent;
  let dragPanInstance: DragPan;

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestDragPanInteractionComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const mapDebugElement = fixture.debugElement.query(By.directive(WolMapComponent));
    const dragPanDebugElement = fixture.debugElement.query(
      By.directive(WolDragPanInteractionComponent),
    );

    testComponent = fixture.componentInstance;
    mapComponent = mapDebugElement.componentInstance;
    mapInstance = mapComponent.getInstance() as Map;
    dragPanComponent = dragPanDebugElement.componentInstance;
    dragPanInstance = dragPanComponent.getInstance() as DragPan;
  });

  it('should create the drag-pan interaction and register it on the map', () => {
    expect(dragPanComponent).toBeTruthy();
    expect(dragPanInstance).toBeInstanceOf(DragPan);
    expect(mapInstance.getInteractions().getArray()).toContain(dragPanInstance);
  });

  it('should initialize wolActive with provided value', () => {
    expect(dragPanInstance.getActive()).toBe(testComponent.active());
  });

  it('should initialize with condition from input', () => {
    expect(internals(dragPanInstance)['condition_']).toBe(testComponent.condition());
  });

  it('should initialize with kinetic from input', () => {
    expect(internals(dragPanInstance)['kinetic_']).toBe(testComponent.kinetic());
  });

  it('should initialize wolProperties on the instance', () => {
    const props = testComponent.properties();
    expect(dragPanInstance.get('testProp')).toBe(props['testProp']);
  });

  describe('wolActive model', () => {
    it('should update OL instance active state when wolActive changes', () => {
      testComponent.active.set(false);
      fixture.detectChanges();
      expect(dragPanInstance.getActive()).toBe(false);
    });

    it('should set wolActive to false when OL fires change:active with false', () => {
      dragPanInstance.setActive(false);
      expect(testComponent.active()).toBe(false);
    });

    it('should set wolActive to true when OL fires change:active with true', () => {
      dragPanInstance.setActive(false);
      dragPanInstance.setActive(true);
      expect(testComponent.active()).toBe(true);
    });
  });

  it('should update OL instance properties when wolProperties changes', () => {
    testComponent.properties.set({ testProp: 'updated' });
    fixture.detectChanges();
    expect(dragPanInstance.get('testProp')).toBe('updated');
  });

  it('should emit wolChange when OL fires change event', () => {
    const changeSpy = vi.spyOn(dragPanComponent.wolChange, 'emit');
    const event = new BaseEvent('change');
    dragPanInstance.dispatchEvent(event);
    expect(changeSpy).toHaveBeenCalledWith(event);
  });

  it('should emit wolError when OL fires error event', () => {
    const errorSpy = vi.spyOn(dragPanComponent.wolError, 'emit');
    const event = new BaseEvent('error');
    dragPanInstance.dispatchEvent(event);
    expect(errorSpy).toHaveBeenCalledWith(event);
  });

  it('should emit wolPropertyChange when OL fires propertychange event', () => {
    const propertyChangeSpy = vi.spyOn(dragPanComponent.wolPropertyChange, 'emit');
    const event = new ObjectEvent('propertychange', 'active', true);
    dragPanInstance.dispatchEvent(event);
    expect(propertyChangeSpy).toHaveBeenCalledWith(event);
  });

  describe('wolOnFocusOnly', () => {
    let localFixture: ComponentFixture<TestDragPanOnFocusOnlyComponent>;
    let localInstance: DragPan;

    beforeEach(async () => {
      localFixture = TestBed.createComponent(TestDragPanOnFocusOnlyComponent);
      localFixture.detectChanges();
      await localFixture.whenStable();
      localFixture.detectChanges();

      const debugEl = localFixture.debugElement.query(By.directive(WolDragPanInteractionComponent));
      localInstance = debugEl.componentInstance.getInstance() as DragPan;
    });

    it('should apply onFocusOnly to OL constructor', () => {
      // With onFocusOnly: true, OL wraps the explicit condition with focusWithTabindex
      // via all(...), producing a new composite function reference.
      // Therefore condition_ must be reference-inequal to the original condition.
      expect(internals(localInstance)['condition_']).not.toBe(primaryAction);
    });
  });

  describe('destroy', () => {
    it('should remove the interaction from the map on destroy', () => {
      testComponent.destroyInteraction.set(true);
      fixture.detectChanges();
      expect(mapInstance.getInteractions().getArray()).not.toContain(dragPanInstance);
    });

    it('should set getInstance() to undefined after destroy', () => {
      testComponent.destroyInteraction.set(true);
      fixture.detectChanges();
      expect(dragPanComponent.getInstance()).toBeUndefined();
    });
  });
});

@Component({
  template: `
    <wol-map>
      <wol-view [wolZoom]="4" />
      @if (!destroyInteraction()) {
        <wol-drag-pan-interaction
          [(wolActive)]="active"
          [wolCondition]="condition()"
          [wolOnFocusOnly]="onFocusOnly()"
          [wolKinetic]="kinetic()"
          [wolProperties]="properties()"
        />
      }
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WolMapComponent, WolViewComponent, WolDragPanInteractionComponent],
})
class TestDragPanInteractionComponent {
  readonly active = signal(true);
  readonly condition = signal<Condition>(noModifierKeys);
  readonly onFocusOnly = signal(false);
  readonly kinetic = signal<Kinetic>(new Kinetic(-0.005, 0.05, 100));
  readonly properties = signal<WolProperties>({ testProp: 'initial' });
  readonly destroyInteraction = signal(false);
}

@Component({
  template: `
    <wol-map>
      <wol-view [wolZoom]="4" />
      <wol-drag-pan-interaction [wolCondition]="condition" [wolOnFocusOnly]="true" />
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WolMapComponent, WolViewComponent, WolDragPanInteractionComponent],
})
class TestDragPanOnFocusOnlyComponent {
  readonly condition = primaryAction;
}
