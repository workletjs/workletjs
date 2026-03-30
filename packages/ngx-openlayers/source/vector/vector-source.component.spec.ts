import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import Collection from 'ol/Collection';
import Feature from 'ol/Feature';
import { ObjectEvent } from 'ol/Object';
import BaseEvent from 'ol/events/Event';
import { FeatureLoader, FeatureUrlFunction } from 'ol/featureloader';
import FeatureFormat from 'ol/format/Feature';
import GeoJSON from 'ol/format/GeoJSON';
import { Geometry, Point } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import { AttributionLike } from 'ol/source/Source';
import VectorSource, { LoadingStrategy } from 'ol/source/Vector';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolVectorLayerComponent } from '@workletjs/ngx-openlayers/layer/vector';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolVectorSourceComponent } from './vector-source.component';

type TestFeature = Feature<Geometry>;

async function createVectorSourceInstance(
  setup?: (c: TestVectorSourceComponent) => void,
): Promise<VectorSource<TestFeature>> {
  const f = TestBed.createComponent(TestVectorSourceComponent);
  setup?.(f.componentInstance);
  f.detectChanges();
  await f.whenStable();
  return f.debugElement
    .query(By.directive(WolVectorSourceComponent))
    .componentInstance.getInstance() as VectorSource<TestFeature>;
}

@Component({
  selector: 'wol-test-vector-source',
  imports: [WolMapComponent, WolViewComponent, WolVectorLayerComponent, WolVectorSourceComponent],
  template: `
    <wol-map>
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="2" />
      <wol-vector-layer>
        @if (!destroySource()) {
          <wol-vector-source
            [wolAttributions]="attributions()"
            [wolFeatures]="features()"
            [wolFormat]="format()"
            [wolLoader]="loader()"
            [wolOverlaps]="overlaps()"
            [wolStrategy]="strategy()"
            [wolUrl]="url()"
            [wolUseSpatialIndex]="useSpatialIndex()"
            [wolWrapX]="wrapX()"
            [wolProperties]="properties()"
            (wolAddFeature)="onAddFeature($event)"
            (wolChange)="onChange($event)"
            (wolChangeFeature)="onChangeFeature($event)"
            (wolClear)="onClear($event)"
            (wolError)="onError($event)"
            (wolFeaturesLoadEnd)="onFeaturesLoadEnd($event)"
            (wolFeaturesLoadError)="onFeaturesLoadError($event)"
            (wolFeaturesLoadStart)="onFeaturesLoadStart($event)"
            (wolPropertyChange)="onPropertyChange($event)"
            (wolRemoveFeature)="onRemoveFeature($event)"
          />
        }
      </wol-vector-layer>
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestVectorSourceComponent {
  attributions = signal<AttributionLike | undefined>(undefined);
  features = signal<TestFeature[] | Collection<TestFeature> | undefined>(undefined);
  format = signal<FeatureFormat<TestFeature> | undefined>(undefined);
  loader = signal<FeatureLoader<TestFeature> | undefined>(undefined);
  overlaps = signal<boolean | undefined>(undefined);
  strategy = signal<LoadingStrategy | undefined>(undefined);
  url = signal<string | FeatureUrlFunction | undefined>(undefined);
  useSpatialIndex = signal<boolean | undefined>(undefined);
  wrapX = signal<boolean | undefined>(undefined);
  properties = signal<WolProperties | undefined>(undefined);
  destroySource = signal(false);

  onAddFeature = vi.fn();
  onChange = vi.fn();
  onChangeFeature = vi.fn();
  onClear = vi.fn();
  onError = vi.fn();
  onFeaturesLoadEnd = vi.fn();
  onFeaturesLoadError = vi.fn();
  onFeaturesLoadStart = vi.fn();
  onPropertyChange = vi.fn();
  onRemoveFeature = vi.fn();
}

describe('WolVectorSourceComponent', () => {
  let fixture: ComponentFixture<TestVectorSourceComponent>;
  let testComponent: TestVectorSourceComponent;
  let component: WolVectorSourceComponent;
  let vectorLayerComponent: WolVectorLayerComponent;
  let vectorSource: VectorSource<TestFeature>;
  let olVectorLayer: VectorLayer;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestVectorSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestVectorSourceComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    testComponent = fixture.componentInstance;
    component = fixture.debugElement.query(
      By.directive(WolVectorSourceComponent),
    ).componentInstance;
    vectorLayerComponent = fixture.debugElement.query(
      By.directive(WolVectorLayerComponent),
    ).componentInstance;
    vectorSource = component.getInstance() as VectorSource<TestFeature>;
    olVectorLayer = vectorLayerComponent.getInstance() as VectorLayer;
  });

  // --- Creation ---

  it('should create the Vector source', () => {
    expect(component).toBeTruthy();
    expect(vectorSource).toBeInstanceOf(VectorSource);
  });

  it('should register the source on the vector layer', fakeAsync(() => {
    flush();
    expect(olVectorLayer.getSource()).toBe(vectorSource);
  }));

  // --- Initialization (per input) ---

  it('should initialize with wolAttributions', async () => {
    const inst = await createVectorSourceInstance((c) => c.attributions.set('© Vector'));
    expect(inst).toBeInstanceOf(VectorSource);
  });

  it('should initialize with wolFeatures as array', async () => {
    const features = [new Feature({ geometry: new Point([0, 0]) })];
    const inst = await createVectorSourceInstance((c) => c.features.set(features));
    expect(inst).toBeInstanceOf(VectorSource);
    expect(inst.getFeatures()).toHaveLength(1);
  });

  it('should initialize with wolFeatures as Collection', async () => {
    const features = new Collection([new Feature({ geometry: new Point([0, 0]) })]);
    const inst = await createVectorSourceInstance((c) => c.features.set(features));
    expect(inst).toBeInstanceOf(VectorSource);
  });

  it('should initialize with wolLoader', async () => {
    const loader: FeatureLoader<TestFeature> = vi.fn();
    const inst = await createVectorSourceInstance((c) => c.loader.set(loader));
    expect(inst).toBeInstanceOf(VectorSource);
  });

  it('should initialize with wolOverlaps = false', async () => {
    const inst = await createVectorSourceInstance((c) => c.overlaps.set(false));
    expect(inst).toBeInstanceOf(VectorSource);
  });

  it('should initialize with wolUrl as string', async () => {
    // VectorSource requires format when url is set
    const inst = await createVectorSourceInstance((c) => {
      c.format.set(new GeoJSON());
      c.url.set('https://example.com/features.geojson');
    });
    expect(inst).toBeInstanceOf(VectorSource);
  });

  it('should initialize with wolUrl as function', async () => {
    const urlFn: FeatureUrlFunction = vi
      .fn()
      .mockReturnValue('https://example.com/features.geojson');
    const inst = await createVectorSourceInstance((c) => {
      c.format.set(new GeoJSON());
      c.url.set(urlFn);
    });
    expect(inst).toBeInstanceOf(VectorSource);
  });

  it('should initialize with wolUseSpatialIndex = false', async () => {
    const inst = await createVectorSourceInstance((c) => c.useSpatialIndex.set(false));
    expect(inst).toBeInstanceOf(VectorSource);
  });

  it('should initialize with wolWrapX = false', async () => {
    const inst = await createVectorSourceInstance((c) => c.wrapX.set(false));
    expect(inst).toBeInstanceOf(VectorSource);
  });

  it('should initialize with wolProperties', async () => {
    const inst = await createVectorSourceInstance((c) => c.properties.set({ customKey: 'value' }));
    expect(inst).toBeInstanceOf(VectorSource);
  });

  // --- ngOnChanges ---

  it('should update attributions via ngOnChanges (wolAttributions)', async () => {
    const spy = vi.spyOn(vectorSource, 'setAttributions');
    testComponent.attributions.set('© Updated');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(spy).toHaveBeenCalledWith('© Updated');
  });

  it('should update loader via ngOnChanges (wolLoader)', async () => {
    const spy = vi.spyOn(vectorSource, 'setLoader');
    const loader: FeatureLoader<TestFeature> = vi.fn();
    testComponent.loader.set(loader);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(spy).toHaveBeenCalledWith(loader);
  });

  it('should update url via ngOnChanges (wolUrl)', async () => {
    // VectorSource.setUrl() requires a format; mock to avoid the runtime error
    const spy = vi.spyOn(vectorSource, 'setUrl').mockImplementation((_url) => _url);
    testComponent.url.set('https://new.example.com/features.geojson');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(spy).toHaveBeenCalledWith('https://new.example.com/features.geojson');
  });

  it('should update properties via ngOnChanges (wolProperties)', async () => {
    const spy = vi.spyOn(vectorSource, 'setProperties');
    testComponent.properties.set({ key: 'updated' });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(spy).toHaveBeenCalledWith({ key: 'updated' });
  });

  // --- Outputs ---

  it('should emit wolChange on source change event', async () => {
    vectorSource.dispatchEvent('change');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onChange).toHaveBeenCalledWith(expect.any(BaseEvent));
  });

  it('should emit wolError on source error event', async () => {
    vectorSource.dispatchEvent('error');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onError).toHaveBeenCalledWith(expect.any(BaseEvent));
  });

  it('should emit wolPropertyChange on source propertychange event', async () => {
    vectorSource.set('testProp', 42);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onPropertyChange).toHaveBeenCalledWith(expect.any(ObjectEvent));
  });

  it('should emit wolAddFeature when a feature is added', async () => {
    const feature = new Feature({ geometry: new Point([1, 1]) });
    vectorSource.addFeature(feature);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onAddFeature).toHaveBeenCalled();
  });

  it('should emit wolRemoveFeature when a feature is removed', async () => {
    const feature = new Feature({ geometry: new Point([1, 1]) });
    vectorSource.addFeature(feature);
    vectorSource.removeFeature(feature);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onRemoveFeature).toHaveBeenCalled();
  });

  it('should emit wolClear when source is cleared', async () => {
    vectorSource.clear();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onClear).toHaveBeenCalled();
  });

  it('should emit wolChangeFeature when a feature changes', async () => {
    const feature = new Feature({ geometry: new Point([1, 1]) });
    vectorSource.addFeature(feature);
    feature.set('name', 'updated');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onChangeFeature).toHaveBeenCalled();
  });

  it('should emit wolFeaturesLoadStart on featuresloadstart event', async () => {
    vectorSource.dispatchEvent('featuresloadstart');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onFeaturesLoadStart).toHaveBeenCalled();
  });

  it('should emit wolFeaturesLoadEnd on featuresloadend event', async () => {
    vectorSource.dispatchEvent('featuresloadend');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onFeaturesLoadEnd).toHaveBeenCalled();
  });

  it('should emit wolFeaturesLoadError on featuresloaderror event', async () => {
    vectorSource.dispatchEvent('featuresloaderror');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onFeaturesLoadError).toHaveBeenCalled();
  });

  // --- Destroy ---

  it('should clean up instance and event listeners on destroy', async () => {
    expect(component.getInstance()).toBeInstanceOf(VectorSource);
    testComponent.destroySource.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.getInstance()).toBeUndefined();
  });
});
