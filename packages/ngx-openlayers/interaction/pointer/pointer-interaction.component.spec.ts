import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import Map from 'ol/Map';
import { ObjectEvent } from 'ol/Object';
import BaseEvent from 'ol/events/Event';
import PointerInteraction from 'ol/interaction/Pointer';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolPointerInteractionComponent } from './pointer-interaction.component';

describe('WolPointerInteractionComponent', () => {
  let fixture: ComponentFixture<TestPointerInteractionComponent>;
  let testComponent: TestPointerInteractionComponent;
  let mapComponent: WolMapComponent;
  let mapInstance: Map;
  let pointerComponent: WolPointerInteractionComponent;
  let pointerInstance: PointerInteraction;

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestPointerInteractionComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const mapDebugElement = fixture.debugElement.query(By.directive(WolMapComponent));
    const pointerDebugElement = fixture.debugElement.query(
      By.directive(WolPointerInteractionComponent),
    );

    testComponent = fixture.componentInstance;
    mapComponent = mapDebugElement.componentInstance;
    mapInstance = mapComponent.getInstance() as Map;
    pointerComponent = pointerDebugElement.componentInstance;
    pointerInstance = pointerComponent.getInstance() as PointerInteraction;
  });

  it('should create the pointer interaction and register it on the map', () => {
    expect(pointerComponent).toBeTruthy();
    expect(pointerInstance).toBeInstanceOf(PointerInteraction);
    expect(mapInstance.getInteractions().getArray()).toContain(pointerInstance);
  });

  it('should initialize wolActive to true', () => {
    expect(pointerInstance.getActive()).toBe(true);
  });

  it('should initialize wolProperties on OL instance', () => {
    expect(pointerInstance.get('testProp')).toBe('initial');
  });

  it('should initialize wolHandleDownEvent on OL instance', () => {
    const fn = testComponent.handleDownEvent();
    expect(pointerInstance.handleDownEvent).toBe(fn);
  });

  it('should initialize wolHandleDragEvent on OL instance', () => {
    const fn = testComponent.handleDragEvent();
    expect(pointerInstance.handleDragEvent).toBe(fn);
  });

  it('should initialize wolHandleEvent on OL instance', () => {
    const fn = testComponent.handleEvent();
    expect(pointerInstance.handleEvent).toBe(fn);
  });

  it('should initialize wolHandleMoveEvent on OL instance', () => {
    const fn = testComponent.handleMoveEvent();
    expect(pointerInstance.handleMoveEvent).toBe(fn);
  });

  it('should initialize wolHandleUpEvent on OL instance', () => {
    const fn = testComponent.handleUpEvent();
    expect(pointerInstance.handleUpEvent).toBe(fn);
  });

  it('should initialize wolStopDown on OL instance', () => {
    const fn = testComponent.stopDown();
    expect(pointerInstance.stopDown).toBe(fn);
  });

  describe('wolActive model', () => {
    it('should update OL instance active state when wolActive changes', () => {
      testComponent.active.set(false);
      fixture.detectChanges();
      expect(pointerInstance.getActive()).toBe(false);
    });

    it('should set wolActive to false when OL fires change:active with false', () => {
      pointerInstance.setActive(false);
      expect(testComponent.active()).toBe(false);
    });

    it('should set wolActive to true when OL fires change:active with true', () => {
      pointerInstance.setActive(false);
      pointerInstance.setActive(true);
      expect(testComponent.active()).toBe(true);
    });
  });

  it('should update OL instance properties when wolProperties changes', () => {
    testComponent.properties.set({ testProp: 'updated' });
    fixture.detectChanges();
    expect(pointerInstance.get('testProp')).toBe('updated');
  });

  it('should emit wolChange when OL fires change event', () => {
    const changeSpy = vi.spyOn(pointerComponent.wolChange, 'emit');
    const event = new BaseEvent('change');
    pointerInstance.dispatchEvent(event);
    expect(changeSpy).toHaveBeenCalledWith(event);
  });

  it('should emit wolError when OL fires error event', () => {
    const errorSpy = vi.spyOn(pointerComponent.wolError, 'emit');
    const event = new BaseEvent('error');
    pointerInstance.dispatchEvent(event);
    expect(errorSpy).toHaveBeenCalledWith(event);
  });

  it('should emit wolPropertyChange when OL fires propertychange event', () => {
    const propertyChangeSpy = vi.spyOn(pointerComponent.wolPropertyChange, 'emit');
    const event = new ObjectEvent('propertychange', 'someKey', undefined);
    pointerInstance.dispatchEvent(event);
    expect(propertyChangeSpy).toHaveBeenCalledWith(event);
  });

  describe('destroy', () => {
    it('should remove the interaction from the map on destroy', () => {
      testComponent.destroyInteraction.set(true);
      fixture.detectChanges();
      expect(mapInstance.getInteractions().getArray()).not.toContain(pointerInstance);
    });

    it('should set getInstance() to undefined after destroy', () => {
      testComponent.destroyInteraction.set(true);
      fixture.detectChanges();
      expect(pointerComponent.getInstance()).toBeUndefined();
    });
  });
});

@Component({
  template: `
    <wol-map>
      <wol-view [wolZoom]="4" />
      @if (!destroyInteraction()) {
        <wol-pointer-interaction
          [(wolActive)]="active"
          [wolHandleDownEvent]="handleDownEvent()"
          [wolHandleDragEvent]="handleDragEvent()"
          [wolHandleEvent]="handleEvent()"
          [wolHandleMoveEvent]="handleMoveEvent()"
          [wolHandleUpEvent]="handleUpEvent()"
          [wolStopDown]="stopDown()"
          [wolProperties]="properties()"
        />
      }
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WolMapComponent, WolViewComponent, WolPointerInteractionComponent],
})
class TestPointerInteractionComponent {
  readonly active = signal(true);
  readonly handleDownEvent = signal(() => true);
  readonly handleDragEvent = signal(() => {
    /* noop */
  });
  readonly handleEvent = signal(() => true);
  readonly handleMoveEvent = signal(() => {
    /* noop */
  });
  readonly handleUpEvent = signal(() => true);
  readonly stopDown = signal(() => false);
  readonly properties = signal<WolProperties>({ testProp: 'initial' });
  readonly destroyInteraction = signal(false);
}
