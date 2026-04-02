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
import Translate, { FilterFunction, TranslateEvent } from 'ol/interaction/Translate';
import Layer from 'ol/layer/Layer';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolTranslateInteractionComponent } from './translate-interaction.component';

const layersFilterSpy = vi.fn(() => false);
const featureFilterSpy = vi.fn(() => true);

describe('WolTranslateInteractionComponent', () => {
  const mapBrowserEvent = {} as unknown as MapBrowserEvent<PointerEvent>;

  let fixture: ComponentFixture<TestTranslateInteractionComponent>;
  let testComponent: TestTranslateInteractionComponent;
  let mapComponent: WolMapComponent;
  let mapInstance: Map;
  let translateComponent: WolTranslateInteractionComponent;
  let translateInstance: Translate;

  const internals = (obj: object) => obj as unknown as Record<string, unknown>;

  beforeEach(async () => {
    layersFilterSpy.mockClear();
    featureFilterSpy.mockClear();

    fixture = TestBed.createComponent(TestTranslateInteractionComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const mapDebugElement = fixture.debugElement.query(By.directive(WolMapComponent));
    const translateDebugElement = fixture.debugElement.query(
      By.directive(WolTranslateInteractionComponent),
    );

    testComponent = fixture.componentInstance;
    mapComponent = mapDebugElement.componentInstance;
    mapInstance = mapComponent.getInstance() as Map;
    translateComponent = translateDebugElement.componentInstance;
    translateInstance = translateComponent.getInstance() as Translate;
  });

  it('should create the translate interaction and register it on the map', () => {
    expect(translateComponent).toBeTruthy();
    expect(translateInstance).toBeInstanceOf(Translate);
    expect(mapInstance.getInteractions().getArray()).toContain(translateInstance);
  });

  it('should initialize wolActive to true', () => {
    expect(translateInstance.getActive()).toBe(true);
  });

  it('should initialize wolHitTolerance on OL instance', () => {
    expect(translateInstance.getHitTolerance()).toBe(5);
  });

  it('should initialize wolProperties on OL instance', () => {
    expect(translateInstance.get('testProp')).toBe('initial');
  });

  it('should initialize wolCondition on OL instance', () => {
    expect(internals(translateInstance)['condition_']).toBe(testComponent.condition());
  });

  it('should initialize wolFeatures on OL instance', async () => {
    const feats = new Collection<Feature>();
    const featuresFilterSpy = vi.fn(() => false);
    const featuresLayersSpy = vi.fn(() => false);

    @Component({
      template: `<wol-map
        ><wol-view [wolZoom]="4" /><wol-translate-interaction
          [wolFeatures]="feats"
          [wolFilter]="filter"
          [wolLayers]="layers"
      /></wol-map>`,
      changeDetection: ChangeDetectionStrategy.OnPush,
      imports: [WolMapComponent, WolViewComponent, WolTranslateInteractionComponent],
    })
    class TestFeaturesComponent {
      readonly feats = feats;
      readonly filter = featuresFilterSpy;
      readonly layers = featuresLayersSpy;
    }

    const f = TestBed.createComponent(TestFeaturesComponent);
    try {
      f.detectChanges();
      await f.whenStable();
      f.detectChanges();

      const comp = f.debugElement.query(By.directive(WolTranslateInteractionComponent))
        .componentInstance as WolTranslateInteractionComponent;
      const instance = comp.getInstance() as Translate;
      const internalsInstance = internals(instance);

      expect(internalsInstance['features_']).toBe(feats);
      expect(internalsInstance['layerFilter_']).not.toBe(featuresLayersSpy);
      expect(internalsInstance['filter_']).not.toBe(featuresFilterSpy);

      const layerFilter = internalsInstance['layerFilter_'] as (layer: Layer) => boolean;
      const filter = internalsInstance['filter_'] as (feature: Feature, layer: Layer) => boolean;
      const layer = new Layer({});
      const feature = new Feature();

      expect(layerFilter(layer)).toBe(true);
      expect(filter(feature, layer)).toBe(true);
      expect(featuresLayersSpy).not.toHaveBeenCalled();
      expect(featuresFilterSpy).not.toHaveBeenCalled();
    } finally {
      f.destroy();
    }
  });

  it('should initialize wolLayers on OL instance', () => {
    const layerFilter = internals(translateInstance)['layerFilter_'] as (layer: Layer) => boolean;
    const layer = new Layer({});

    expect(layerFilter(layer)).toBe(false);
    expect(layersFilterSpy).toHaveBeenCalledWith(layer);
    expect(layersFilterSpy).toHaveBeenCalledTimes(1);
  });

  it('should consider all visible layers when wolLayers is absent', async () => {
    @Component({
      template: `<wol-map><wol-view [wolZoom]="4" /><wol-translate-interaction /></wol-map>`,
      changeDetection: ChangeDetectionStrategy.OnPush,
      imports: [WolMapComponent, WolViewComponent, WolTranslateInteractionComponent],
    })
    class TestNoLayersComponent {}

    const f = TestBed.createComponent(TestNoLayersComponent);
    try {
      f.detectChanges();
      await f.whenStable();
      f.detectChanges();

      const comp = f.debugElement.query(By.directive(WolTranslateInteractionComponent))
        .componentInstance as WolTranslateInteractionComponent;
      const instance = comp.getInstance();
      expect(instance).toBeDefined();
      if (!instance) {
        throw new Error('Translate instance should be defined');
      }
      const layerFilter = internals(instance)['layerFilter_'] as (layer: Layer) => boolean;

      expect(layerFilter(new Layer({}))).toBe(true);
    } finally {
      f.destroy();
    }
  });

  it('should initialize wolFilter on OL instance', () => {
    const filter = internals(translateInstance)['filter_'] as (
      feature: Feature,
      layer: Layer,
    ) => boolean;
    const feature = new Feature();
    const layer = new Layer({});

    expect(filter).toBe(testComponent.filterFn());
    expect(filter(feature, layer)).toBe(true);
    expect(featureFilterSpy).toHaveBeenCalledWith(feature, layer);
    expect(featureFilterSpy).toHaveBeenCalledTimes(1);
  });

  describe('wolActive model', () => {
    it('should update OL instance active state when wolActive changes', () => {
      testComponent.active.set(false);
      fixture.detectChanges();
      expect(translateInstance.getActive()).toBe(false);
    });

    it('should set wolActive to false when OL fires change:active with false', () => {
      translateInstance.setActive(false);
      expect(testComponent.active()).toBe(false);
    });

    it('should set wolActive to true when OL fires change:active with true', () => {
      translateInstance.setActive(false);
      translateInstance.setActive(true);
      expect(testComponent.active()).toBe(true);
    });
  });

  it('should update OL hitTolerance via ngOnChanges when wolHitTolerance changes', () => {
    testComponent.hitTolerance.set(10);
    fixture.detectChanges();
    expect(translateInstance.getHitTolerance()).toBe(10);
  });

  it('should update OL instance properties when wolProperties changes', () => {
    testComponent.properties.set({ testProp: 'updated' });
    fixture.detectChanges();
    expect(translateInstance.get('testProp')).toBe('updated');
  });

  it('should emit wolChange when OL fires change event', () => {
    const changeSpy = vi.spyOn(translateComponent.wolChange, 'emit');
    const event = new BaseEvent('change');
    translateInstance.dispatchEvent(event);
    expect(changeSpy).toHaveBeenCalledWith(event);
  });

  it('should emit wolError when OL fires error event', () => {
    const errorSpy = vi.spyOn(translateComponent.wolError, 'emit');
    const event = new BaseEvent('error');
    translateInstance.dispatchEvent(event);
    expect(errorSpy).toHaveBeenCalledWith(event);
  });

  it('should emit wolPropertyChange when OL fires propertychange event', () => {
    const propertyChangeSpy = vi.spyOn(translateComponent.wolPropertyChange, 'emit');
    const event = new ObjectEvent('propertychange', 'someKey', undefined);
    translateInstance.dispatchEvent(event);
    expect(propertyChangeSpy).toHaveBeenCalledWith(event);
  });

  it('should emit wolTranslateStart when OL fires translatestart event', () => {
    const spy = vi.spyOn(translateComponent.wolTranslateStart, 'emit');
    const event = new TranslateEvent(
      'translatestart',
      new Collection<Feature>(),
      [0, 0],
      [0, 0],
      mapBrowserEvent,
    );
    translateInstance.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolTranslating when OL fires translating event', () => {
    const spy = vi.spyOn(translateComponent.wolTranslating, 'emit');
    const event = new TranslateEvent(
      'translating',
      new Collection<Feature>(),
      [0, 0],
      [0, 0],
      mapBrowserEvent,
    );
    translateInstance.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolTranslateEnd when OL fires translateend event', () => {
    const spy = vi.spyOn(translateComponent.wolTranslateEnd, 'emit');
    const event = new TranslateEvent(
      'translateend',
      new Collection<Feature>(),
      [0, 0],
      [0, 0],
      mapBrowserEvent,
    );
    translateInstance.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  describe('destroy', () => {
    it('should remove the interaction from the map on destroy', () => {
      testComponent.destroyInteraction.set(true);
      fixture.detectChanges();
      expect(mapInstance.getInteractions().getArray()).not.toContain(translateInstance);
    });

    it('should set getInstance() to undefined after destroy', () => {
      testComponent.destroyInteraction.set(true);
      fixture.detectChanges();
      expect(translateComponent.getInstance()).toBeUndefined();
    });
  });
});

@Component({
  template: `
    <wol-map>
      <wol-view [wolZoom]="4" />
      @if (!destroyInteraction()) {
        <wol-translate-interaction
          [(wolActive)]="active"
          [wolCondition]="condition()"
          [wolLayers]="layers()"
          [wolFilter]="filterFn()"
          [wolHitTolerance]="hitTolerance()"
          [wolProperties]="properties()"
        />
      }
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WolMapComponent, WolViewComponent, WolTranslateInteractionComponent],
})
class TestTranslateInteractionComponent {
  readonly active = signal(true);
  readonly condition = signal<Condition>(() => true);
  readonly layers = signal<(layer: Layer) => boolean>(layersFilterSpy);
  readonly filterFn = signal<FilterFunction>(featureFilterSpy);
  readonly hitTolerance = signal(5);
  readonly properties = signal<WolProperties>({ testProp: 'initial' });
  readonly destroyInteraction = signal(false);
}
