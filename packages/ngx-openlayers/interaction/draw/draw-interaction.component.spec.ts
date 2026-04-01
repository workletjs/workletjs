import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import Feature from 'ol/Feature';
import Map from 'ol/Map';
import { ObjectEvent } from 'ol/Object';
import BaseEvent from 'ol/events/Event';
import { Condition, noModifierKeys } from 'ol/events/condition';
import { Type } from 'ol/geom/Geometry';
import Draw, { DrawEvent } from 'ol/interaction/Draw';
import VectorSource from 'ol/source/Vector';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolDrawInteractionComponent } from './draw-interaction.component';

describe('WolDrawInteractionComponent', () => {
  const internals = (obj: object) => obj as unknown as Record<string, unknown>;

  let fixture: ComponentFixture<TestDrawInteractionComponent>;
  let testComponent: TestDrawInteractionComponent;
  let mapComponent: WolMapComponent;
  let mapInstance: Map;
  let drawComponent: WolDrawInteractionComponent;
  let drawInstance: Draw;

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestDrawInteractionComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const mapDebugElement = fixture.debugElement.query(By.directive(WolMapComponent));
    const drawDebugElement = fixture.debugElement.query(By.directive(WolDrawInteractionComponent));

    testComponent = fixture.componentInstance;
    mapComponent = mapDebugElement.componentInstance;
    mapInstance = mapComponent.getInstance() as Map;
    drawComponent = drawDebugElement.componentInstance;
    drawInstance = drawComponent.getInstance() as Draw;
  });

  it('should create the draw interaction and register it on the map', () => {
    expect(drawComponent).toBeTruthy();
    expect(drawInstance).toBeInstanceOf(Draw);
    expect(mapInstance.getInteractions().getArray()).toContain(drawInstance);
  });

  it('should initialize wolActive with provided value', () => {
    expect(drawInstance.getActive()).toBe(testComponent.active());
  });

  it('should initialize with type from input', () => {
    expect(internals(drawInstance)['type_']).toBe(testComponent.type());
  });

  it('should initialize with source from input', () => {
    expect(internals(drawInstance)['source_']).toBe(testComponent.source());
  });

  it('should initialize with snapTolerance from input', () => {
    expect(internals(drawInstance)['snapTolerance_']).toBe(testComponent.snapTolerance());
  });

  it('should initialize with condition from input', () => {
    expect(internals(drawInstance)['condition_']).toBe(testComponent.condition());
  });

  it('should initialize with freehand from input', () => {
    expect(internals(drawInstance)['freehand_']).toBe(testComponent.freehand());
  });

  it('should initialize with geometryName from input', () => {
    expect(internals(drawInstance)['geometryName_']).toBe(testComponent.geometryName());
  });

  it('should initialize wolProperties on the instance', () => {
    const props = testComponent.properties();
    expect(drawInstance.get('testProp')).toBe(props['testProp']);
  });

  describe('wolActive model', () => {
    it('should update OL instance active state when wolActive changes', () => {
      testComponent.active.set(false);
      fixture.detectChanges();
      expect(drawInstance.getActive()).toBe(false);
    });

    it('should set wolActive to false when OL fires change:active with false', () => {
      drawInstance.setActive(false);
      expect(drawComponent.wolActive()).toBe(false);
    });

    it('should set wolActive to true when OL fires change:active with true', () => {
      drawInstance.setActive(false);
      drawInstance.setActive(true);
      expect(drawComponent.wolActive()).toBe(true);
    });
  });

  it('should update freehand_ when wolFreehand changes via ngOnChanges', () => {
    testComponent.freehand.set(true);
    fixture.detectChanges();
    expect(internals(drawInstance)['freehand_']).toBe(true);
  });

  it('should update OL instance properties when wolProperties changes', () => {
    testComponent.properties.set({ testProp: 'updated' });
    fixture.detectChanges();
    expect(drawInstance.get('testProp')).toBe('updated');
  });

  it('should emit wolDrawAbort when OL fires drawabort event', () => {
    const drawAbortSpy = vi.spyOn(drawComponent.wolDrawAbort, 'emit');
    const event = new DrawEvent('drawabort', new Feature());
    drawInstance.dispatchEvent(event);
    expect(drawAbortSpy).toHaveBeenCalledWith(event);
  });

  it('should emit wolDrawEnd when OL fires drawend event', () => {
    const drawEndSpy = vi.spyOn(drawComponent.wolDrawEnd, 'emit');
    const event = new DrawEvent('drawend', new Feature());
    drawInstance.dispatchEvent(event);
    expect(drawEndSpy).toHaveBeenCalledWith(event);
  });

  it('should emit wolDrawStart when OL fires drawstart event', () => {
    const drawStartSpy = vi.spyOn(drawComponent.wolDrawStart, 'emit');
    const event = new DrawEvent('drawstart', new Feature());
    drawInstance.dispatchEvent(event);
    expect(drawStartSpy).toHaveBeenCalledWith(event);
  });

  it('should emit wolChange when OL fires change event', () => {
    const changeSpy = vi.spyOn(drawComponent.wolChange, 'emit');
    const event = new BaseEvent('change');
    drawInstance.dispatchEvent(event);
    expect(changeSpy).toHaveBeenCalledWith(event);
  });

  it('should emit wolError when OL fires error event', () => {
    const errorSpy = vi.spyOn(drawComponent.wolError, 'emit');
    const event = new BaseEvent('error');
    drawInstance.dispatchEvent(event);
    expect(errorSpy).toHaveBeenCalledWith(event);
  });

  it('should emit wolPropertyChange when OL fires propertychange event', () => {
    const propertyChangeSpy = vi.spyOn(drawComponent.wolPropertyChange, 'emit');
    const event = new ObjectEvent('propertychange', 'someKey', undefined);
    drawInstance.dispatchEvent(event);
    expect(propertyChangeSpy).toHaveBeenCalledWith(event);
  });

  describe('destroy', () => {
    it('should remove the interaction from the map on destroy', () => {
      testComponent.destroyInteraction.set(true);
      fixture.detectChanges();
      expect(mapInstance.getInteractions().getArray()).not.toContain(drawInstance);
    });

    it('should set getInstance() to undefined after destroy', () => {
      testComponent.destroyInteraction.set(true);
      fixture.detectChanges();
      expect(drawComponent.getInstance()).toBeUndefined();
    });
  });
});

@Component({
  template: `
    <wol-map>
      <wol-view [wolZoom]="4" />
      @if (!destroyInteraction()) {
        <wol-draw-interaction
          [(wolActive)]="active"
          [wolType]="type()"
          [wolSource]="source()"
          [wolSnapTolerance]="snapTolerance()"
          [wolCondition]="condition()"
          [wolFreehand]="freehand()"
          [wolGeometryName]="geometryName()"
          [wolProperties]="properties()"
        />
      }
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WolMapComponent, WolViewComponent, WolDrawInteractionComponent],
})
class TestDrawInteractionComponent {
  readonly active = signal(true);
  readonly type = signal<Type>('Point');
  readonly source = signal(new VectorSource());
  readonly snapTolerance = signal(12);
  readonly condition = signal<Condition>(noModifierKeys);
  readonly freehand = signal(false);
  readonly geometryName = signal('geometry');
  readonly properties = signal<WolProperties>({ testProp: 'initial' });
  readonly destroyInteraction = signal(false);
}
