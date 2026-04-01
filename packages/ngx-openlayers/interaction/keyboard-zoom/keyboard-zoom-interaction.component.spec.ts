import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import Map from 'ol/Map';
import { ObjectEvent } from 'ol/Object';
import BaseEvent from 'ol/events/Event';
import { Condition, targetNotEditable } from 'ol/events/condition';
import KeyboardZoom from 'ol/interaction/KeyboardZoom';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolKeyboardZoomInteractionComponent } from './keyboard-zoom-interaction.component';

describe('WolKeyboardZoomInteractionComponent', () => {
  const internals = (obj: object) => obj as unknown as Record<string, unknown>;

  let fixture: ComponentFixture<TestKeyboardZoomInteractionComponent>;
  let testComponent: TestKeyboardZoomInteractionComponent;
  let mapComponent: WolMapComponent;
  let mapInstance: Map;
  let keyboardZoomComponent: WolKeyboardZoomInteractionComponent;
  let keyboardZoomInstance: KeyboardZoom;

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestKeyboardZoomInteractionComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const mapDebugElement = fixture.debugElement.query(By.directive(WolMapComponent));
    const keyboardZoomDebugElement = fixture.debugElement.query(
      By.directive(WolKeyboardZoomInteractionComponent),
    );

    testComponent = fixture.componentInstance;
    mapComponent = mapDebugElement.componentInstance;
    mapInstance = mapComponent.getInstance() as Map;
    keyboardZoomComponent = keyboardZoomDebugElement.componentInstance;
    keyboardZoomInstance = keyboardZoomComponent.getInstance() as KeyboardZoom;
  });

  it('should create the keyboard-zoom interaction and register it on the map', () => {
    expect(keyboardZoomComponent).toBeTruthy();
    expect(keyboardZoomInstance).toBeInstanceOf(KeyboardZoom);
    expect(mapInstance.getInteractions().getArray()).toContain(keyboardZoomInstance);
  });

  it('should initialize wolActive with provided value', () => {
    expect(keyboardZoomInstance.getActive()).toBe(testComponent.active());
  });

  it('should initialize with condition from input', () => {
    expect(internals(keyboardZoomInstance)['condition_']).toBe(testComponent.condition());
  });

  it('should initialize with duration from input', () => {
    expect(internals(keyboardZoomInstance)['duration_']).toBe(testComponent.duration());
  });

  it('should initialize with delta from input', () => {
    expect(internals(keyboardZoomInstance)['delta_']).toBe(testComponent.delta());
  });

  it('should initialize wolProperties on the instance', () => {
    const props = testComponent.properties();
    expect(keyboardZoomInstance.get('testProp')).toBe(props['testProp']);
  });

  describe('wolActive model', () => {
    it('should update OL instance active state when wolActive changes', () => {
      testComponent.active.set(false);
      fixture.detectChanges();
      expect(keyboardZoomInstance.getActive()).toBe(false);
    });

    it('should set wolActive to false when OL fires change:active with false', () => {
      keyboardZoomInstance.setActive(false);
      expect(keyboardZoomComponent.wolActive()).toBe(false);
    });

    it('should set wolActive to true when OL fires change:active with true', () => {
      keyboardZoomInstance.setActive(false);
      keyboardZoomInstance.setActive(true);
      expect(keyboardZoomComponent.wolActive()).toBe(true);
    });
  });

  it('should update OL instance properties when wolProperties changes', () => {
    testComponent.properties.set({ testProp: 'updated' });
    fixture.detectChanges();
    expect(keyboardZoomInstance.get('testProp')).toBe('updated');
  });

  it('should emit wolChange when OL fires change event', () => {
    const changeSpy = vi.spyOn(keyboardZoomComponent.wolChange, 'emit');
    const event = new BaseEvent('change');
    keyboardZoomInstance.dispatchEvent(event);
    expect(changeSpy).toHaveBeenCalledWith(event);
  });

  it('should emit wolError when OL fires error event', () => {
    const errorSpy = vi.spyOn(keyboardZoomComponent.wolError, 'emit');
    const event = new BaseEvent('error');
    keyboardZoomInstance.dispatchEvent(event);
    expect(errorSpy).toHaveBeenCalledWith(event);
  });

  it('should emit wolPropertyChange when OL fires propertychange event', () => {
    const propertyChangeSpy = vi.spyOn(keyboardZoomComponent.wolPropertyChange, 'emit');
    const event = new ObjectEvent('propertychange', 'someKey', undefined);
    keyboardZoomInstance.dispatchEvent(event);
    expect(propertyChangeSpy).toHaveBeenCalledWith(event);
  });

  describe('destroy', () => {
    it('should remove the interaction from the map on destroy', () => {
      testComponent.destroyInteraction.set(true);
      fixture.detectChanges();
      expect(mapInstance.getInteractions().getArray()).not.toContain(keyboardZoomInstance);
    });

    it('should set getInstance() to undefined after destroy', () => {
      testComponent.destroyInteraction.set(true);
      fixture.detectChanges();
      expect(keyboardZoomComponent.getInstance()).toBeUndefined();
    });
  });
});

@Component({
  template: `
    <wol-map>
      <wol-view [wolZoom]="4" />
      @if (!destroyInteraction()) {
        <wol-keyboard-zoom-interaction
          [(wolActive)]="active"
          [wolCondition]="condition()"
          [wolDuration]="duration()"
          [wolDelta]="delta()"
          [wolProperties]="properties()"
        />
      }
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WolMapComponent, WolViewComponent, WolKeyboardZoomInteractionComponent],
})
class TestKeyboardZoomInteractionComponent {
  readonly active = signal(true);
  readonly condition = signal<Condition>(targetNotEditable);
  readonly duration = signal(100);
  readonly delta = signal(1);
  readonly properties = signal<WolProperties>({ testProp: 'initial' });
  readonly destroyInteraction = signal(false);
}
