import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import Map from 'ol/Map';
import { ObjectEvent } from 'ol/Object';
import BaseEvent from 'ol/events/Event';
import PinchRotate from 'ol/interaction/PinchRotate';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolPinchRotateInteractionComponent } from './pinch-rotate-interaction.component';

describe('WolPinchRotateInteractionComponent', () => {
  const internals = (obj: object) => obj as unknown as Record<string, unknown>;

  let fixture: ComponentFixture<TestPinchRotateInteractionComponent>;
  let testComponent: TestPinchRotateInteractionComponent;
  let mapComponent: WolMapComponent;
  let mapInstance: Map;
  let pinchRotateComponent: WolPinchRotateInteractionComponent;
  let pinchRotateInstance: PinchRotate;

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestPinchRotateInteractionComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const mapDebugElement = fixture.debugElement.query(By.directive(WolMapComponent));
    const pinchRotateDebugElement = fixture.debugElement.query(
      By.directive(WolPinchRotateInteractionComponent),
    );

    testComponent = fixture.componentInstance;
    mapComponent = mapDebugElement.componentInstance;
    mapInstance = mapComponent.getInstance() as Map;
    pinchRotateComponent = pinchRotateDebugElement.componentInstance;
    pinchRotateInstance = pinchRotateComponent.getInstance() as PinchRotate;
  });

  it('should create the pinch-rotate interaction and register it on the map', () => {
    expect(pinchRotateComponent).toBeTruthy();
    expect(pinchRotateInstance).toBeInstanceOf(PinchRotate);
    expect(mapInstance.getInteractions().getArray()).toContain(pinchRotateInstance);
  });

  it('should initialize wolActive to true', () => {
    expect(pinchRotateInstance.getActive()).toBe(true);
  });

  it('should initialize wolDuration on OL instance', () => {
    expect(internals(pinchRotateInstance)['duration_']).toBe(250);
  });

  it('should initialize wolThreshold on OL instance', () => {
    expect(internals(pinchRotateInstance)['threshold_']).toBe(0.3);
  });

  it('should initialize wolProperties on OL instance', () => {
    expect(pinchRotateInstance.get('testProp')).toBe('initial');
  });

  describe('wolActive model', () => {
    it('should update OL instance active state when wolActive changes', () => {
      testComponent.active.set(false);
      fixture.detectChanges();
      expect(pinchRotateInstance.getActive()).toBe(false);
    });

    it('should set wolActive to false when OL fires change:active with false', () => {
      pinchRotateInstance.setActive(false);
      expect(pinchRotateComponent.wolActive()).toBe(false);
    });

    it('should set wolActive to true when OL fires change:active with true', () => {
      pinchRotateInstance.setActive(false);
      pinchRotateInstance.setActive(true);
      expect(pinchRotateComponent.wolActive()).toBe(true);
    });
  });

  it('should update OL instance properties when wolProperties changes', () => {
    testComponent.properties.set({ testProp: 'updated' });
    fixture.detectChanges();
    expect(pinchRotateInstance.get('testProp')).toBe('updated');
  });

  it('should emit wolChange when OL fires change event', () => {
    const changeSpy = vi.spyOn(pinchRotateComponent.wolChange, 'emit');
    const event = new BaseEvent('change');
    pinchRotateInstance.dispatchEvent(event);
    expect(changeSpy).toHaveBeenCalledWith(event);
  });

  it('should emit wolError when OL fires error event', () => {
    const errorSpy = vi.spyOn(pinchRotateComponent.wolError, 'emit');
    const event = new BaseEvent('error');
    pinchRotateInstance.dispatchEvent(event);
    expect(errorSpy).toHaveBeenCalledWith(event);
  });

  it('should emit wolPropertyChange when OL fires propertychange event', () => {
    const propertyChangeSpy = vi.spyOn(pinchRotateComponent.wolPropertyChange, 'emit');
    const event = new ObjectEvent('propertychange', 'someKey', undefined);
    pinchRotateInstance.dispatchEvent(event);
    expect(propertyChangeSpy).toHaveBeenCalledWith(event);
  });

  describe('destroy', () => {
    it('should remove the interaction from the map on destroy', () => {
      testComponent.destroyInteraction.set(true);
      fixture.detectChanges();
      expect(mapInstance.getInteractions().getArray()).not.toContain(pinchRotateInstance);
    });

    it('should set getInstance() to undefined after destroy', () => {
      testComponent.destroyInteraction.set(true);
      fixture.detectChanges();
      expect(pinchRotateComponent.getInstance()).toBeUndefined();
    });
  });
});

@Component({
  template: `
    <wol-map>
      <wol-view [wolZoom]="4" />
      @if (!destroyInteraction()) {
        <wol-pinch-rotate-interaction
          [(wolActive)]="active"
          [wolDuration]="duration()"
          [wolThreshold]="threshold()"
          [wolProperties]="properties()"
        />
      }
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WolMapComponent, WolViewComponent, WolPinchRotateInteractionComponent],
})
class TestPinchRotateInteractionComponent {
  readonly active = signal(true);
  readonly duration = signal(250);
  readonly threshold = signal(0.3);
  readonly properties = signal<WolProperties>({ testProp: 'initial' });
  readonly destroyInteraction = signal(false);
}
