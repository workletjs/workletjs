import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import Map from 'ol/Map';
import { ObjectEvent } from 'ol/Object';
import BaseEvent from 'ol/events/Event';
import PinchZoom from 'ol/interaction/PinchZoom';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolPinchZoomInteractionComponent } from './pinch-zoom-interaction.component';

describe('WolPinchZoomInteractionComponent', () => {
  const internals = (obj: object) => obj as unknown as Record<string, unknown>;

  let fixture: ComponentFixture<TestPinchZoomInteractionComponent>;
  let testComponent: TestPinchZoomInteractionComponent;
  let mapComponent: WolMapComponent;
  let mapInstance: Map;
  let pinchZoomComponent: WolPinchZoomInteractionComponent;
  let pinchZoomInstance: PinchZoom;

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestPinchZoomInteractionComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const mapDebugElement = fixture.debugElement.query(By.directive(WolMapComponent));
    const pinchZoomDebugElement = fixture.debugElement.query(
      By.directive(WolPinchZoomInteractionComponent),
    );

    testComponent = fixture.componentInstance;
    mapComponent = mapDebugElement.componentInstance;
    mapInstance = mapComponent.getInstance() as Map;
    pinchZoomComponent = pinchZoomDebugElement.componentInstance;
    pinchZoomInstance = pinchZoomComponent.getInstance() as PinchZoom;
  });

  it('should create the pinch-zoom interaction and register it on the map', () => {
    expect(pinchZoomComponent).toBeTruthy();
    expect(pinchZoomInstance).toBeInstanceOf(PinchZoom);
    expect(mapInstance.getInteractions().getArray()).toContain(pinchZoomInstance);
  });

  it('should initialize wolActive to true', () => {
    expect(pinchZoomInstance.getActive()).toBe(true);
  });

  it('should initialize wolDuration on OL instance', () => {
    expect(internals(pinchZoomInstance)['duration_']).toBe(400);
  });

  it('should initialize wolProperties on OL instance', () => {
    expect(pinchZoomInstance.get('testProp')).toBe('initial');
  });

  describe('wolActive model', () => {
    it('should update OL instance active state when wolActive changes', () => {
      testComponent.active.set(false);
      fixture.detectChanges();
      expect(pinchZoomInstance.getActive()).toBe(false);
    });

    it('should set wolActive to false when OL fires change:active with false', () => {
      pinchZoomInstance.setActive(false);
      expect(testComponent.active()).toBe(false);
    });

    it('should set wolActive to true when OL fires change:active with true', () => {
      pinchZoomInstance.setActive(false);
      pinchZoomInstance.setActive(true);
      expect(testComponent.active()).toBe(true);
    });
  });

  it('should update OL instance properties when wolProperties changes', () => {
    testComponent.properties.set({ testProp: 'updated' });
    fixture.detectChanges();
    expect(pinchZoomInstance.get('testProp')).toBe('updated');
  });

  it('should emit wolChange when OL fires change event', () => {
    const changeSpy = vi.spyOn(pinchZoomComponent.wolChange, 'emit');
    const event = new BaseEvent('change');
    pinchZoomInstance.dispatchEvent(event);
    expect(changeSpy).toHaveBeenCalledWith(event);
  });

  it('should emit wolError when OL fires error event', () => {
    const errorSpy = vi.spyOn(pinchZoomComponent.wolError, 'emit');
    const event = new BaseEvent('error');
    pinchZoomInstance.dispatchEvent(event);
    expect(errorSpy).toHaveBeenCalledWith(event);
  });

  it('should emit wolPropertyChange when OL fires propertychange event', () => {
    const propertyChangeSpy = vi.spyOn(pinchZoomComponent.wolPropertyChange, 'emit');
    const event = new ObjectEvent('propertychange', 'someKey', undefined);
    pinchZoomInstance.dispatchEvent(event);
    expect(propertyChangeSpy).toHaveBeenCalledWith(event);
  });

  describe('destroy', () => {
    it('should remove the interaction from the map on destroy', () => {
      testComponent.destroyInteraction.set(true);
      fixture.detectChanges();
      expect(mapInstance.getInteractions().getArray()).not.toContain(pinchZoomInstance);
    });

    it('should set getInstance() to undefined after destroy', () => {
      testComponent.destroyInteraction.set(true);
      fixture.detectChanges();
      expect(pinchZoomComponent.getInstance()).toBeUndefined();
    });
  });
});

@Component({
  template: `
    <wol-map>
      <wol-view [wolZoom]="4" />
      @if (!destroyInteraction()) {
        <wol-pinch-zoom-interaction
          [(wolActive)]="active"
          [wolDuration]="duration()"
          [wolProperties]="properties()"
        />
      }
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WolMapComponent, WolViewComponent, WolPinchZoomInteractionComponent],
})
class TestPinchZoomInteractionComponent {
  readonly active = signal(true);
  readonly duration = signal(400);
  readonly properties = signal<WolProperties>({ testProp: 'initial' });
  readonly destroyInteraction = signal(false);
}
