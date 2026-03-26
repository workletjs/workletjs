import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import Collection from 'ol/Collection';
import Feature from 'ol/Feature';
import Map from 'ol/Map';
import MapBrowserEvent from 'ol/MapBrowserEvent';
import { ObjectEvent } from 'ol/Object';
import BaseEvent from 'ol/events/Event';
import { Condition } from 'ol/events/condition';
import Modify, { FilterFunction, ModifyEvent } from 'ol/interaction/Modify';
import BaseVectorLayer from 'ol/layer/BaseVector';
import VectorSource from 'ol/source/Vector';

import { WolProperties, WolSafeAny } from '@workletjs/ngx-openlayers/core/types';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolModifyInteractionComponent } from './modify-interaction.component';

describe('WolModifyInteractionComponent', () => {
  const internals = (obj: object) => obj as unknown as Record<string, unknown>;

  let fixture: ComponentFixture<TestModifyInteractionComponent>;
  let testComponent: TestModifyInteractionComponent;
  let mapComponent: WolMapComponent;
  let mapInstance: Map;
  let modifyComponent: WolModifyInteractionComponent;
  let modifyInstance: Modify;

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestModifyInteractionComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const mapDebugElement = fixture.debugElement.query(By.directive(WolMapComponent));
    const modifyDebugElement = fixture.debugElement.query(
      By.directive(WolModifyInteractionComponent),
    );

    testComponent = fixture.componentInstance;
    mapComponent = mapDebugElement.componentInstance;
    mapInstance = mapComponent.getInstance() as Map;
    modifyComponent = modifyDebugElement.componentInstance;
    modifyInstance = modifyComponent.getInstance() as Modify;
  });

  it('should create the modify interaction and register it on the map', () => {
    expect(modifyComponent).toBeTruthy();
    expect(modifyInstance).toBeInstanceOf(Modify);
    expect(mapInstance.getInteractions().getArray()).toContain(modifyInstance);
  });

  it('should initialize wolActive with provided value', () => {
    expect(modifyInstance.getActive()).toBe(testComponent.active());
  });

  it('should initialize with pixelTolerance from input', () => {
    expect(internals(modifyInstance)['pixelTolerance_']).toBe(testComponent.pixelTolerance());
  });

  it('should initialize with source from input', () => {
    expect(internals(modifyInstance)['source_']).toBe(testComponent.source());
  });

  it('should initialize with wrapX from input', () => {
    const overlaySource = internals(modifyInstance)['overlay_'] as ReturnType<typeof internals>;
    expect((overlaySource['getSource'] as () => { getWrapX(): boolean })().getWrapX()).toBe(
      testComponent.wrapX(),
    );
  });

  it('should initialize with condition from input', () => {
    expect(internals(modifyInstance)['condition_']).toBe(testComponent.condition());
  });

  it('should initialize with deleteCondition from input', () => {
    expect(internals(modifyInstance)['deleteCondition_']).toBe(testComponent.deleteCondition());
  });

  it('should initialize with insertVertexCondition from input', () => {
    expect(internals(modifyInstance)['insertVertexCondition_']).toBe(
      testComponent.insertVertexCondition(),
    );
  });

  it('should initialize with filter from input', () => {
    expect(internals(modifyInstance)['filter_']).toBe(testComponent.filter());
    expect(internals(modifyInstance)['filterFunctionWasSupplied_']).toBe(true);
  });

  it('should initialize with hitDetection from input', () => {
    expect(internals(modifyInstance)['hitDetection_']).toBe(testComponent.hitDetection());
  });

  it('should initialize with wolFeatures when provided instead of source', async () => {
    @Component({
      selector: 'wol-test-features',
      imports: [WolMapComponent, WolViewComponent, WolModifyInteractionComponent],
      template: `
        <wol-map>
          <wol-view [wolZoom]="2" [wolCenter]="[0, 0]" />
          <wol-modify-interaction [wolFeatures]="features" />
        </wol-map>
      `,
      changeDetection: ChangeDetectionStrategy.OnPush,
    })
    class TestFeaturesComponent {
      readonly features = new Collection<Feature>();
    }

    const featuresFixture = TestBed.createComponent(TestFeaturesComponent);
    featuresFixture.detectChanges();
    await featuresFixture.whenStable();
    featuresFixture.detectChanges();

    const comp = featuresFixture.debugElement.query(By.directive(WolModifyInteractionComponent))
      .componentInstance as WolModifyInteractionComponent;
    const instance = comp.getInstance() as Modify;

    expect(internals(instance)['featuresCollection_']).toBe(
      featuresFixture.componentInstance.features,
    );
    expect(internals(instance)['source_']).toBeNull();
  });

  it('should initialize with properties from input', () => {
    expect(modifyInstance.getProperties()).toMatchObject(testComponent.properties());
  });

  // --- model: wolActive ---

  it('should update active state when wolActive model changes', () => {
    testComponent.active.set(false);
    fixture.detectChanges();
    expect(modifyInstance.getActive()).toBe(false);
  });

  it('should update wolActive model when OL interaction changes active state', () => {
    const setActiveSpy = vi.spyOn(modifyComponent.wolActive, 'set');
    modifyInstance.setActive(false);
    fixture.detectChanges();
    expect(setActiveSpy).toHaveBeenCalledWith(false);
  });

  it('should re-activate the interaction when wolActive is toggled back to true', () => {
    testComponent.active.set(false);
    fixture.detectChanges();
    expect(modifyInstance.getActive()).toBe(false);

    testComponent.active.set(true);
    fixture.detectChanges();
    expect(modifyInstance.getActive()).toBe(true);
  });

  // --- input: wolProperties ---

  it('should update properties when wolProperties input changes', () => {
    const newProperties: WolProperties = { updated: true };
    testComponent.properties.set(newProperties);
    fixture.detectChanges();
    expect(modifyInstance.getProperties()).toMatchObject(newProperties);
  });

  // --- output: wolChange ---

  it('should emit change event when modify interaction triggers change', () => {
    const changeSpy = vi.spyOn(modifyComponent.wolChange, 'emit');
    const changeEvent = new BaseEvent('change');
    modifyInstance.dispatchEvent(changeEvent);
    expect(changeSpy).toHaveBeenCalledWith(changeEvent);
  });

  // --- output: wolError ---

  it('should emit error event when modify interaction triggers error', () => {
    const errorSpy = vi.spyOn(modifyComponent.wolError, 'emit');
    const errorEvent = new BaseEvent('error');
    modifyInstance.dispatchEvent(errorEvent);
    expect(errorSpy).toHaveBeenCalledWith(errorEvent);
  });

  // --- output: wolModifyEnd ---

  it('should emit modifyend event when modify interaction triggers modifyend', () => {
    const modifyEndSpy = vi.spyOn(modifyComponent.wolModifyEnd, 'emit');
    const features = new Collection<Feature>();
    const event = new ModifyEvent(
      'modifyend',
      features,
      null as unknown as MapBrowserEvent<PointerEvent>,
    );
    modifyInstance.dispatchEvent(event);
    expect(modifyEndSpy).toHaveBeenCalledWith(event);
  });

  // --- output: wolModifyStart ---

  it('should emit modifystart event when modify interaction triggers modifystart', () => {
    const modifyStartSpy = vi.spyOn(modifyComponent.wolModifyStart, 'emit');
    const features = new Collection<Feature>();
    const event = new ModifyEvent(
      'modifystart',
      features,
      null as unknown as MapBrowserEvent<PointerEvent>,
    );
    modifyInstance.dispatchEvent(event);
    expect(modifyStartSpy).toHaveBeenCalledWith(event);
  });

  // --- output: wolPropertyChange ---

  it('should emit propertychange event when modify interaction triggers propertychange', () => {
    const propertyChangeSpy = vi.spyOn(modifyComponent.wolPropertyChange, 'emit');
    const event = new ObjectEvent('propertychange', 'active', true);
    modifyInstance.dispatchEvent(event);
    expect(propertyChangeSpy).toHaveBeenCalledWith(event);
  });

  // --- destroy ---

  it('should remove the interaction from the map when destroyed', () => {
    const removeInteractionSpy = vi.spyOn(mapInstance, 'removeInteraction');
    testComponent.destroyInteraction.set(true);
    fixture.detectChanges();
    expect(modifyComponent.getInstance()).toBeUndefined();
    expect(removeInteractionSpy).toHaveBeenCalledWith(modifyInstance);
  });

  it('should return undefined from getInstance() after destruction', () => {
    testComponent.destroyInteraction.set(true);
    fixture.detectChanges();
    expect(modifyComponent.getInstance()).toBeUndefined();
  });
});

@Component({
  selector: 'wol-test-modify-interaction',
  imports: [WolMapComponent, WolViewComponent, WolModifyInteractionComponent],
  template: `
    <wol-map>
      <wol-view [wolZoom]="2" [wolCenter]="[0, 0]" />
      @if (!destroyInteraction()) {
        <wol-modify-interaction
          [(wolActive)]="active"
          [wolCondition]="condition()"
          [wolDeleteCondition]="deleteCondition()"
          [wolInsertVertexCondition]="insertVertexCondition()"
          [wolPixelTolerance]="pixelTolerance()"
          [wolSource]="source()"
          [wolHitDetection]="hitDetection()"
          [wolWrapX]="wrapX()"
          [wolSnapToPointer]="snapToPointer()"
          [wolFilter]="filter()"
          [wolProperties]="properties()"
        />
      }
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestModifyInteractionComponent {
  active = signal(true);
  condition = signal<Condition>(() => true);
  deleteCondition = signal<Condition>(() => false);
  insertVertexCondition = signal<Condition>(() => true);
  pixelTolerance = signal(10);
  source = signal(new VectorSource<Feature>());
  hitDetection = signal<boolean | BaseVectorLayer<WolSafeAny, WolSafeAny, WolSafeAny>>(true);
  wrapX = signal(true);
  snapToPointer = signal(false);
  filter = signal<FilterFunction>(() => true);
  properties = signal<WolProperties>({ foo: 'bar' });
  destroyInteraction = signal(false);
}
