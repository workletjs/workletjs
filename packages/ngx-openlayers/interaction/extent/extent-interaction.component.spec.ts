import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import Map from 'ol/Map';
import { ObjectEvent } from 'ol/Object';
import BaseEvent from 'ol/events/Event';
import { Condition, always } from 'ol/events/condition';
import { Extent } from 'ol/extent';
import ExtentInteraction from 'ol/interaction/Extent';
import VectorLayer from 'ol/layer/Vector';
import { Style } from 'ol/style';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolExtentInteractionComponent } from './extent-interaction.component';

describe('WolExtentInteractionComponent', () => {
  const internals = (obj: object) => obj as unknown as Record<string, unknown>;

  let fixture: ComponentFixture<TestExtentInteractionComponent>;
  let testComponent: TestExtentInteractionComponent;
  let mapComponent: WolMapComponent;
  let mapInstance: Map;
  let extentComponent: WolExtentInteractionComponent;
  let extentInstance: ExtentInteraction;

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestExtentInteractionComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const mapDebugElement = fixture.debugElement.query(By.directive(WolMapComponent));
    const extentDebugElement = fixture.debugElement.query(
      By.directive(WolExtentInteractionComponent),
    );

    testComponent = fixture.componentInstance;
    mapComponent = mapDebugElement.componentInstance;
    mapInstance = mapComponent.getInstance() as Map;
    extentComponent = extentDebugElement.componentInstance;
    extentInstance = extentComponent.getInstance() as ExtentInteraction;
  });

  it('should create the extent interaction and register it on the map', () => {
    expect(extentComponent).toBeTruthy();
    expect(extentInstance).toBeInstanceOf(ExtentInteraction);
    expect(mapInstance.getInteractions().getArray()).toContain(extentInstance);
  });

  it('should initialize wolActive with provided value', () => {
    expect(extentInstance.getActive()).toBe(testComponent.active());
  });

  it('should initialize with condition from input', () => {
    expect(internals(extentInstance)['condition_']).toBe(testComponent.condition());
  });

  it('should initialize with pixelTolerance from input', () => {
    expect(internals(extentInstance)['pixelTolerance_']).toBe(testComponent.pixelTolerance());
  });

  it('should initialize with boxStyle from input', () => {
    const extentOverlay = internals(extentInstance)['extentOverlay_'] as VectorLayer;
    expect(extentOverlay.getStyle()).toBe(testComponent.boxStyle());
  });

  it('should initialize with pointerStyle from input', () => {
    const vertexOverlay = internals(extentInstance)['vertexOverlay_'] as VectorLayer;
    expect(vertexOverlay.getStyle()).toBe(testComponent.pointerStyle());
  });

  it('should initialize with wrapX from input', () => {
    const extentOverlay = internals(extentInstance)['extentOverlay_'] as VectorLayer;
    const extentOverlaySource = extentOverlay.getSource();
    expect(extentOverlaySource).toBeTruthy();
    expect(extentOverlaySource?.getWrapX()).toBe(testComponent.wrapX());
  });

  it('should initialize wolProperties on the instance', () => {
    const props = testComponent.properties();
    expect(extentInstance.get('testProp')).toBe(props['testProp']);
  });

  describe('wolActive model', () => {
    it('should update OL instance active state when wolActive changes', () => {
      testComponent.active.set(false);
      fixture.detectChanges();
      expect(extentInstance.getActive()).toBe(false);
    });

    it('should set wolActive to false when OL fires change:active with false', () => {
      extentInstance.setActive(false);
      expect(testComponent.active()).toBe(false);
    });

    it('should set wolActive to true when OL fires change:active with true', () => {
      extentInstance.setActive(false);
      extentInstance.setActive(true);
      expect(testComponent.active()).toBe(true);
    });
  });

  describe('wolExtent model', () => {
    it('should call setExtent on the OL instance when wolExtent changes via ngOnChanges', () => {
      const newExtent: Extent = [0, 0, 100, 100];
      testComponent.extent.set(newExtent);
      fixture.detectChanges();
      expect(extentInstance.getExtent()).toEqual(newExtent);
    });

    it('should update wolExtent model when OL fires extentchanged event', () => {
      const newExtent: Extent = [10, 20, 30, 40];
      extentInstance.setExtent(newExtent);
      expect(extentComponent.wolExtent()).toEqual(newExtent);
    });
  });

  it('should update OL instance properties when wolProperties changes', () => {
    testComponent.properties.set({ testProp: 'updated' });
    fixture.detectChanges();
    expect(extentInstance.get('testProp')).toBe('updated');
  });

  it('should emit wolChange when OL fires change event', () => {
    const changeSpy = vi.spyOn(extentComponent.wolChange, 'emit');
    const event = new BaseEvent('change');
    extentInstance.dispatchEvent(event);
    expect(changeSpy).toHaveBeenCalledWith(event);
  });

  it('should emit wolError when OL fires error event', () => {
    const errorSpy = vi.spyOn(extentComponent.wolError, 'emit');
    const event = new BaseEvent('error');
    extentInstance.dispatchEvent(event);
    expect(errorSpy).toHaveBeenCalledWith(event);
  });

  it('should emit wolPropertyChange when OL fires propertychange event', () => {
    const propertyChangeSpy = vi.spyOn(extentComponent.wolPropertyChange, 'emit');
    const event = new ObjectEvent('propertychange', 'someKey', undefined);
    extentInstance.dispatchEvent(event);
    expect(propertyChangeSpy).toHaveBeenCalledWith(event);
  });

  describe('destroy', () => {
    it('should remove the interaction from the map on destroy', () => {
      testComponent.destroyInteraction.set(true);
      fixture.detectChanges();
      expect(mapInstance.getInteractions().getArray()).not.toContain(extentInstance);
    });

    it('should set getInstance() to undefined after destroy', () => {
      testComponent.destroyInteraction.set(true);
      fixture.detectChanges();
      expect(extentComponent.getInstance()).toBeUndefined();
    });
  });
});

@Component({
  template: `
    <wol-map>
      <wol-view [wolZoom]="4" />
      @if (!destroyInteraction()) {
        <wol-extent-interaction
          [(wolActive)]="active"
          [wolCondition]="condition()"
          [wolPixelTolerance]="pixelTolerance()"
          [(wolExtent)]="extent"
          [wolBoxStyle]="boxStyle()"
          [wolPointerStyle]="pointerStyle()"
          [wolWrapX]="wrapX()"
          [wolProperties]="properties()"
        />
      }
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WolMapComponent, WolViewComponent, WolExtentInteractionComponent],
})
class TestExtentInteractionComponent {
  readonly active = signal(true);
  readonly condition = signal<Condition>(always);
  readonly pixelTolerance = signal(10);
  readonly extent = signal<Extent | undefined>(undefined);
  readonly boxStyle = signal<Style>(new Style());
  readonly pointerStyle = signal<Style>(new Style());
  readonly wrapX = signal(true);
  readonly properties = signal<WolProperties>({ testProp: 'initial' });
  readonly destroyInteraction = signal(false);
}
