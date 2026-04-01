import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import Map from 'ol/Map';
import { ObjectEvent } from 'ol/Object';
import BaseEvent from 'ol/events/Event';
import { Condition, always } from 'ol/events/condition';
import MouseWheelZoom from 'ol/interaction/MouseWheelZoom';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolMouseWheelZoomInteractionComponent } from './mouse-wheel-zoom-interaction.component';

describe('WolMouseWheelZoomInteractionComponent', () => {
  const internals = (obj: object) => obj as unknown as Record<string, unknown>;

  let fixture: ComponentFixture<TestMouseWheelZoomInteractionComponent>;
  let testComponent: TestMouseWheelZoomInteractionComponent;
  let mapComponent: WolMapComponent;
  let mapInstance: Map;
  let mouseWheelZoomComponent: WolMouseWheelZoomInteractionComponent;
  let mouseWheelZoomInstance: MouseWheelZoom;

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestMouseWheelZoomInteractionComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const mapDebugElement = fixture.debugElement.query(By.directive(WolMapComponent));
    const mouseWheelZoomDebugElement = fixture.debugElement.query(
      By.directive(WolMouseWheelZoomInteractionComponent),
    );

    testComponent = fixture.componentInstance;
    mapComponent = mapDebugElement.componentInstance;
    mapInstance = mapComponent.getInstance() as Map;
    mouseWheelZoomComponent = mouseWheelZoomDebugElement.componentInstance;
    mouseWheelZoomInstance = mouseWheelZoomComponent.getInstance() as MouseWheelZoom;
  });

  it('should create the mouse-wheel-zoom interaction and register it on the map', () => {
    expect(mouseWheelZoomComponent).toBeTruthy();
    expect(mouseWheelZoomInstance).toBeInstanceOf(MouseWheelZoom);
    expect(mapInstance.getInteractions().getArray()).toContain(mouseWheelZoomInstance);
  });

  it('should initialize wolActive with provided value', () => {
    expect(mouseWheelZoomInstance.getActive()).toBe(testComponent.active());
  });

  it('should initialize with condition from input', () => {
    expect(internals(mouseWheelZoomInstance)['condition_']).toBe(testComponent.condition());
  });

  it('should initialize with maxDelta from input', () => {
    expect(internals(mouseWheelZoomInstance)['maxDelta_']).toBe(testComponent.maxDelta());
  });

  it('should initialize with duration from input', () => {
    expect(internals(mouseWheelZoomInstance)['duration_']).toBe(testComponent.duration());
  });

  it('should initialize with timeout from input', () => {
    expect(internals(mouseWheelZoomInstance)['timeout_']).toBe(testComponent.timeout());
  });

  it('should initialize with useAnchor from input', () => {
    expect(internals(mouseWheelZoomInstance)['useAnchor_']).toBe(testComponent.useAnchor());
  });

  it('should initialize with constrainResolution from input', () => {
    expect(internals(mouseWheelZoomInstance)['constrainResolution_']).toBe(
      testComponent.constrainResolution(),
    );
  });

  it('should initialize wolProperties on the instance', () => {
    const props = testComponent.properties();
    expect(mouseWheelZoomInstance.get('testProp')).toBe(props['testProp']);
  });

  describe('wolActive model', () => {
    it('should update OL instance active state when wolActive changes', () => {
      testComponent.active.set(false);
      fixture.detectChanges();
      expect(mouseWheelZoomInstance.getActive()).toBe(false);
    });

    it('should set wolActive to false when OL fires change:active with false', () => {
      mouseWheelZoomInstance.setActive(false);
      expect(testComponent.active()).toBe(false);
    });

    it('should set wolActive to true when OL fires change:active with true', () => {
      mouseWheelZoomInstance.setActive(false);
      mouseWheelZoomInstance.setActive(true);
      expect(testComponent.active()).toBe(true);
    });
  });

  it('should call setMouseAnchor when wolUseAnchor changes via ngOnChanges', () => {
    testComponent.useAnchor.set(false);
    fixture.detectChanges();
    expect(internals(mouseWheelZoomInstance)['useAnchor_']).toBe(false);
  });

  it('should update OL instance properties when wolProperties changes', () => {
    testComponent.properties.set({ testProp: 'updated' });
    fixture.detectChanges();
    expect(mouseWheelZoomInstance.get('testProp')).toBe('updated');
  });

  it('should emit wolChange when OL fires change event', () => {
    const changeSpy = vi.spyOn(mouseWheelZoomComponent.wolChange, 'emit');
    const event = new BaseEvent('change');
    mouseWheelZoomInstance.dispatchEvent(event);
    expect(changeSpy).toHaveBeenCalledWith(event);
  });

  it('should emit wolError when OL fires error event', () => {
    const errorSpy = vi.spyOn(mouseWheelZoomComponent.wolError, 'emit');
    const event = new BaseEvent('error');
    mouseWheelZoomInstance.dispatchEvent(event);
    expect(errorSpy).toHaveBeenCalledWith(event);
  });

  it('should emit wolPropertyChange when OL fires propertychange event', () => {
    const propertyChangeSpy = vi.spyOn(mouseWheelZoomComponent.wolPropertyChange, 'emit');
    const event = new ObjectEvent('propertychange', 'someKey', undefined);
    mouseWheelZoomInstance.dispatchEvent(event);
    expect(propertyChangeSpy).toHaveBeenCalledWith(event);
  });

  describe('destroy', () => {
    it('should remove the interaction from the map on destroy', () => {
      testComponent.destroyInteraction.set(true);
      fixture.detectChanges();
      expect(mapInstance.getInteractions().getArray()).not.toContain(mouseWheelZoomInstance);
    });

    it('should set getInstance() to undefined after destroy', () => {
      testComponent.destroyInteraction.set(true);
      fixture.detectChanges();
      expect(mouseWheelZoomComponent.getInstance()).toBeUndefined();
    });
  });
});

@Component({
  template: `
    <wol-map>
      <wol-view [wolZoom]="4" />
      @if (!destroyInteraction()) {
        <wol-mouse-wheel-zoom-interaction
          [(wolActive)]="active"
          [wolCondition]="condition()"
          [wolMaxDelta]="maxDelta()"
          [wolDuration]="duration()"
          [wolTimeout]="timeout()"
          [wolUseAnchor]="useAnchor()"
          [wolConstrainResolution]="constrainResolution()"
          [wolProperties]="properties()"
        />
      }
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WolMapComponent, WolViewComponent, WolMouseWheelZoomInteractionComponent],
})
class TestMouseWheelZoomInteractionComponent {
  readonly active = signal(true);
  readonly condition = signal<Condition>(always);
  readonly maxDelta = signal(1);
  readonly duration = signal(250);
  readonly timeout = signal(80);
  readonly useAnchor = signal(true);
  readonly constrainResolution = signal(false);
  readonly properties = signal<WolProperties>({ testProp: 'initial' });
  readonly destroyInteraction = signal(false);
}
