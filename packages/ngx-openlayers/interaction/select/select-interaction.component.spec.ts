import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import Map from 'ol/Map';
import MapBrowserEvent from 'ol/MapBrowserEvent';
import { ObjectEvent } from 'ol/Object';
import BaseEvent from 'ol/events/Event';
import Select, { SelectEvent } from 'ol/interaction/Select';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolSelectInteractionComponent } from './select-interaction.component';

describe('WolSelectInteractionComponent', () => {
  const internals = (obj: object) => obj as unknown as Record<string, unknown>;

  let fixture: ComponentFixture<TestSelectInteractionComponent>;
  let testComponent: TestSelectInteractionComponent;
  let mapComponent: WolMapComponent;
  let mapInstance: Map;
  let selectComponent: WolSelectInteractionComponent;
  let selectInstance: Select;

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestSelectInteractionComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const mapDebugElement = fixture.debugElement.query(By.directive(WolMapComponent));
    const selectDebugElement = fixture.debugElement.query(
      By.directive(WolSelectInteractionComponent),
    );

    testComponent = fixture.componentInstance;
    mapComponent = mapDebugElement.componentInstance;
    mapInstance = mapComponent.getInstance() as Map;
    selectComponent = selectDebugElement.componentInstance;
    selectInstance = selectComponent.getInstance() as Select;
  });

  it('should create the select interaction and register it on the map', () => {
    expect(selectComponent).toBeTruthy();
    expect(selectInstance).toBeInstanceOf(Select);
    expect(mapInstance.getInteractions().getArray()).toContain(selectInstance);
  });

  it('should initialize wolActive to true', () => {
    expect(selectInstance.getActive()).toBe(true);
  });

  it('should initialize wolHitTolerance on OL instance', () => {
    expect(selectInstance.getHitTolerance()).toBe(5);
  });

  it('should initialize wolMulti on OL instance', () => {
    expect(internals(selectInstance)['multi_']).toBe(true);
  });

  it('should initialize wolProperties on OL instance', () => {
    expect(selectInstance.get('testProp')).toBe('initial');
  });

  describe('wolActive model', () => {
    it('should update OL instance active state when wolActive changes', () => {
      testComponent.active.set(false);
      fixture.detectChanges();
      expect(selectInstance.getActive()).toBe(false);
    });

    it('should set wolActive to false when OL fires change:active with false', () => {
      selectInstance.setActive(false);
      expect(testComponent.active()).toBe(false);
    });

    it('should set wolActive to true when OL fires change:active with true', () => {
      selectInstance.setActive(false);
      selectInstance.setActive(true);
      expect(testComponent.active()).toBe(true);
    });
  });

  it('should update OL hitTolerance via ngOnChanges when wolHitTolerance changes', () => {
    testComponent.hitTolerance.set(10);
    fixture.detectChanges();
    expect(selectInstance.getHitTolerance()).toBe(10);
  });

  it('should update OL instance properties when wolProperties changes', () => {
    testComponent.properties.set({ testProp: 'updated' });
    fixture.detectChanges();
    expect(selectInstance.get('testProp')).toBe('updated');
  });

  it('should emit wolChange when OL fires change event', () => {
    const changeSpy = vi.spyOn(selectComponent.wolChange, 'emit');
    const event = new BaseEvent('change');
    selectInstance.dispatchEvent(event);
    expect(changeSpy).toHaveBeenCalledWith(event);
  });

  it('should emit wolError when OL fires error event', () => {
    const errorSpy = vi.spyOn(selectComponent.wolError, 'emit');
    const event = new BaseEvent('error');
    selectInstance.dispatchEvent(event);
    expect(errorSpy).toHaveBeenCalledWith(event);
  });

  it('should emit wolPropertyChange when OL fires propertychange event', () => {
    const propertyChangeSpy = vi.spyOn(selectComponent.wolPropertyChange, 'emit');
    const event = new ObjectEvent('propertychange', 'someKey', undefined);
    selectInstance.dispatchEvent(event);
    expect(propertyChangeSpy).toHaveBeenCalledWith(event);
  });

  it('should emit wolSelect when OL fires select event', () => {
    const selectSpy = vi.spyOn(selectComponent.wolSelect, 'emit');
    const mockMapBrowserEvent = {} as unknown as MapBrowserEvent<PointerEvent>;
    const event = new SelectEvent('select', [], [], mockMapBrowserEvent);
    selectInstance.dispatchEvent(event);
    expect(selectSpy).toHaveBeenCalledWith(event);
  });

  describe('destroy', () => {
    it('should remove the interaction from the map on destroy', () => {
      testComponent.destroyInteraction.set(true);
      fixture.detectChanges();
      expect(mapInstance.getInteractions().getArray()).not.toContain(selectInstance);
    });

    it('should set getInstance() to undefined after destroy', () => {
      testComponent.destroyInteraction.set(true);
      fixture.detectChanges();
      expect(selectComponent.getInstance()).toBeUndefined();
    });
  });
});

@Component({
  template: `
    <wol-map>
      <wol-view [wolZoom]="4" />
      @if (!destroyInteraction()) {
        <wol-select-interaction
          [(wolActive)]="active"
          [wolHitTolerance]="hitTolerance()"
          [wolMulti]="multi()"
          [wolProperties]="properties()"
        />
      }
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WolMapComponent, WolViewComponent, WolSelectInteractionComponent],
})
class TestSelectInteractionComponent {
  readonly active = signal(true);
  readonly hitTolerance = signal(5);
  readonly multi = signal(true);
  readonly properties = signal<WolProperties>({ testProp: 'initial' });
  readonly destroyInteraction = signal(false);
}
