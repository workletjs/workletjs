import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import Map from 'ol/Map';
import { ObjectEvent } from 'ol/Object';
import BaseEvent from 'ol/events/Event';
import { Condition, noModifierKeys } from 'ol/events/condition';
import KeyboardPan from 'ol/interaction/KeyboardPan';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolKeyboardPanInteractionComponent } from './keyboard-pan-interaction.component';

describe('WolKeyboardPanInteractionComponent', () => {
  const internals = (obj: object) => obj as unknown as Record<string, unknown>;

  let fixture: ComponentFixture<TestKeyboardPanInteractionComponent>;
  let testComponent: TestKeyboardPanInteractionComponent;
  let mapComponent: WolMapComponent;
  let mapInstance: Map;
  let keyboardPanComponent: WolKeyboardPanInteractionComponent;
  let keyboardPanInstance: KeyboardPan;

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestKeyboardPanInteractionComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const mapDebugElement = fixture.debugElement.query(By.directive(WolMapComponent));
    const keyboardPanDebugElement = fixture.debugElement.query(
      By.directive(WolKeyboardPanInteractionComponent),
    );

    testComponent = fixture.componentInstance;
    mapComponent = mapDebugElement.componentInstance;
    mapInstance = mapComponent.getInstance() as Map;
    keyboardPanComponent = keyboardPanDebugElement.componentInstance;
    keyboardPanInstance = keyboardPanComponent.getInstance() as KeyboardPan;
  });

  it('should create the keyboard-pan interaction and register it on the map', () => {
    expect(keyboardPanComponent).toBeTruthy();
    expect(keyboardPanInstance).toBeInstanceOf(KeyboardPan);
    expect(mapInstance.getInteractions().getArray()).toContain(keyboardPanInstance);
  });

  it('should initialize wolActive with provided value', () => {
    expect(keyboardPanInstance.getActive()).toBe(testComponent.active());
  });

  it('should initialize with condition from input', () => {
    expect(internals(keyboardPanInstance)['condition_']).toBe(testComponent.condition());
  });

  it('should initialize with duration from input', () => {
    expect(internals(keyboardPanInstance)['duration_']).toBe(testComponent.duration());
  });

  it('should initialize with pixelDelta from input', () => {
    expect(internals(keyboardPanInstance)['pixelDelta_']).toBe(testComponent.pixelDelta());
  });

  it('should initialize wolProperties on the instance', () => {
    const props = testComponent.properties();
    expect(keyboardPanInstance.get('testProp')).toBe(props['testProp']);
  });

  describe('wolActive model', () => {
    it('should update OL instance active state when wolActive changes', () => {
      testComponent.active.set(false);
      fixture.detectChanges();
      expect(keyboardPanInstance.getActive()).toBe(false);
    });

    it('should set wolActive to false when OL fires change:active with false', () => {
      keyboardPanInstance.setActive(false);
      expect(keyboardPanComponent.wolActive()).toBe(false);
    });

    it('should set wolActive to true when OL fires change:active with true', () => {
      keyboardPanInstance.setActive(false);
      keyboardPanInstance.setActive(true);
      expect(keyboardPanComponent.wolActive()).toBe(true);
    });
  });

  it('should update OL instance properties when wolProperties changes', () => {
    testComponent.properties.set({ testProp: 'updated' });
    fixture.detectChanges();
    expect(keyboardPanInstance.get('testProp')).toBe('updated');
  });

  it('should emit wolChange when OL fires change event', () => {
    const changeSpy = vi.spyOn(keyboardPanComponent.wolChange, 'emit');
    const event = new BaseEvent('change');
    keyboardPanInstance.dispatchEvent(event);
    expect(changeSpy).toHaveBeenCalledWith(event);
  });

  it('should emit wolError when OL fires error event', () => {
    const errorSpy = vi.spyOn(keyboardPanComponent.wolError, 'emit');
    const event = new BaseEvent('error');
    keyboardPanInstance.dispatchEvent(event);
    expect(errorSpy).toHaveBeenCalledWith(event);
  });

  it('should emit wolPropertyChange when OL fires propertychange event', () => {
    const propertyChangeSpy = vi.spyOn(keyboardPanComponent.wolPropertyChange, 'emit');
    const event = new ObjectEvent('propertychange', 'someKey', undefined);
    keyboardPanInstance.dispatchEvent(event);
    expect(propertyChangeSpy).toHaveBeenCalledWith(event);
  });

  describe('destroy', () => {
    it('should remove the interaction from the map on destroy', () => {
      testComponent.destroyInteraction.set(true);
      fixture.detectChanges();
      expect(mapInstance.getInteractions().getArray()).not.toContain(keyboardPanInstance);
    });

    it('should set getInstance() to undefined after destroy', () => {
      testComponent.destroyInteraction.set(true);
      fixture.detectChanges();
      expect(keyboardPanComponent.getInstance()).toBeUndefined();
    });
  });
});

@Component({
  template: `
    <wol-map>
      <wol-view [wolZoom]="4" />
      @if (!destroyInteraction()) {
        <wol-keyboard-pan-interaction
          [(wolActive)]="active"
          [wolCondition]="condition()"
          [wolDuration]="duration()"
          [wolPixelDelta]="pixelDelta()"
          [wolProperties]="properties()"
        />
      }
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WolMapComponent, WolViewComponent, WolKeyboardPanInteractionComponent],
})
class TestKeyboardPanInteractionComponent {
  readonly active = signal(true);
  readonly condition = signal<Condition>(noModifierKeys);
  readonly duration = signal(100);
  readonly pixelDelta = signal(128);
  readonly properties = signal<WolProperties>({ testProp: 'initial' });
  readonly destroyInteraction = signal(false);
}
