import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import Feature, { FeatureLike } from 'ol/Feature';
import { ObjectEvent } from 'ol/Object';
import BaseEvent from 'ol/events/Event';
import Point from 'ol/geom/Point';
import VectorLayer from 'ol/layer/Vector';
import Cluster, { GeometryFunction } from 'ol/source/Cluster';
import { AttributionLike } from 'ol/source/Source';
import VectorSource from 'ol/source/Vector';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolVectorLayerComponent } from '@workletjs/ngx-openlayers/layer/vector';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolClusterSourceComponent } from './cluster-source.component';

function makeVectorSource(): VectorSource<FeatureLike> {
  return new VectorSource<FeatureLike>();
}

async function createClusterSourceInstance(
  setup?: (c: TestClusterSourceComponent) => void,
): Promise<Cluster<FeatureLike>> {
  const f = TestBed.createComponent(TestClusterSourceComponent);
  setup?.(f.componentInstance);
  f.detectChanges();
  await f.whenStable();
  return f.debugElement
    .query(By.directive(WolClusterSourceComponent))
    .componentInstance.getInstance() as Cluster<FeatureLike>;
}

@Component({
  selector: 'wol-test-cluster-source',
  imports: [WolMapComponent, WolViewComponent, WolVectorLayerComponent, WolClusterSourceComponent],
  template: `
    <wol-map>
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="2" />
      <wol-vector-layer>
        @if (!destroySource()) {
          <wol-cluster-source
            [wolAttributions]="attributions()"
            [wolDistance]="distance()"
            [wolMinDistance]="minDistance()"
            [wolGeometryFunction]="geometryFunction()"
            [wolCreateCluster]="createCluster()"
            [wolSource]="source()"
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
class TestClusterSourceComponent {
  attributions = signal<AttributionLike | undefined>(undefined);
  distance = signal<number | undefined>(undefined);
  minDistance = signal<number | undefined>(undefined);
  geometryFunction = signal<GeometryFunction<FeatureLike> | undefined>(undefined);
  createCluster = signal<((point: Point, features: FeatureLike[]) => Feature) | undefined>(
    undefined,
  );
  source = signal<VectorSource<FeatureLike> | undefined>(undefined);
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

describe('WolClusterSourceComponent', () => {
  let fixture: ComponentFixture<TestClusterSourceComponent>;
  let testComponent: TestClusterSourceComponent;
  let component: WolClusterSourceComponent;
  let vectorLayerComponent: WolVectorLayerComponent;
  let clusterSource: Cluster<FeatureLike>;
  let olVectorLayer: VectorLayer;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestClusterSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestClusterSourceComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    testComponent = fixture.componentInstance;
    component = fixture.debugElement.query(
      By.directive(WolClusterSourceComponent),
    ).componentInstance;
    vectorLayerComponent = fixture.debugElement.query(
      By.directive(WolVectorLayerComponent),
    ).componentInstance;
    clusterSource = component.getInstance() as Cluster<FeatureLike>;
    olVectorLayer = vectorLayerComponent.getInstance() as VectorLayer;
  });

  // --- Creation ---

  it('should create the Cluster source', () => {
    expect(component).toBeTruthy();
    expect(clusterSource).toBeInstanceOf(Cluster);
  });

  it('should register the source on the vector layer', fakeAsync(() => {
    flush();
    expect(olVectorLayer.getSource()).toBe(clusterSource);
  }));

  // --- Initialization (per input) ---

  it('should initialize with wolAttributions', async () => {
    const inst = await createClusterSourceInstance((c) => c.attributions.set('© Cluster'));
    expect(inst).toBeInstanceOf(Cluster);
  });

  it('should initialize with wolDistance', async () => {
    const inst = await createClusterSourceInstance((c) => c.distance.set(50));
    expect(inst).toBeInstanceOf(Cluster);
  });

  it('should initialize with wolMinDistance', async () => {
    const inst = await createClusterSourceInstance((c) => c.minDistance.set(10));
    expect(inst).toBeInstanceOf(Cluster);
  });

  it('should initialize with wolGeometryFunction', async () => {
    const geoFn: GeometryFunction<FeatureLike> = (f) => (f as Feature<Point>).getGeometry() ?? null;
    const inst = await createClusterSourceInstance((c) => c.geometryFunction.set(geoFn));
    expect(inst).toBeInstanceOf(Cluster);
  });

  it('should initialize with wolCreateCluster', async () => {
    const createFn = (_point: Point, features: FeatureLike[]) =>
      new Feature({ geometry: _point, features });
    const inst = await createClusterSourceInstance((c) => c.createCluster.set(createFn));
    expect(inst).toBeInstanceOf(Cluster);
  });

  it('should initialize with wolSource', async () => {
    const vs = makeVectorSource();
    const inst = await createClusterSourceInstance((c) => c.source.set(vs));
    expect(inst).toBeInstanceOf(Cluster);
  });

  it('should initialize with wolWrapX = false', async () => {
    const inst = await createClusterSourceInstance((c) => c.wrapX.set(false));
    expect(inst).toBeInstanceOf(Cluster);
  });

  it('should initialize with wolProperties', async () => {
    const inst = await createClusterSourceInstance((c) => c.properties.set({ customKey: 'value' }));
    expect(inst).toBeInstanceOf(Cluster);
  });

  // --- ngOnChanges ---

  it('should update attributions via ngOnChanges (wolAttributions)', async () => {
    const spy = vi.spyOn(clusterSource, 'setAttributions');
    testComponent.attributions.set('© Updated');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(spy).toHaveBeenCalledWith('© Updated');
  });

  it('should update distance via ngOnChanges (wolDistance)', async () => {
    const spy = vi.spyOn(clusterSource, 'setDistance');
    testComponent.distance.set(80);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(spy).toHaveBeenCalledWith(80);
  });

  it('should update minDistance via ngOnChanges (wolMinDistance)', async () => {
    const spy = vi.spyOn(clusterSource, 'setMinDistance');
    testComponent.minDistance.set(20);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(spy).toHaveBeenCalledWith(20);
  });

  it('should update source via ngOnChanges (wolSource)', async () => {
    const spy = vi.spyOn(clusterSource, 'setSource');
    const vs = makeVectorSource();
    testComponent.source.set(vs);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(spy).toHaveBeenCalledWith(vs);
  });

  it('should update properties via ngOnChanges (wolProperties)', async () => {
    const spy = vi.spyOn(clusterSource, 'setProperties');
    testComponent.properties.set({ key: 'updated' });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(spy).toHaveBeenCalledWith({ key: 'updated' });
  });

  // --- Outputs ---

  it('should emit wolChange on source change event', async () => {
    clusterSource.dispatchEvent('change');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onChange).toHaveBeenCalledWith(expect.any(BaseEvent));
  });

  it('should emit wolError on source error event', async () => {
    clusterSource.dispatchEvent('error');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onError).toHaveBeenCalledWith(expect.any(BaseEvent));
  });

  it('should emit wolPropertyChange on propertychange event', async () => {
    clusterSource.set('testProp', 42);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onPropertyChange).toHaveBeenCalledWith(expect.any(ObjectEvent));
  });

  it('should emit wolClear on clear event', async () => {
    clusterSource.dispatchEvent('clear');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onClear).toHaveBeenCalled();
  });

  it('should emit wolFeaturesLoadStart on featuresloadstart event', async () => {
    clusterSource.dispatchEvent('featuresloadstart');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onFeaturesLoadStart).toHaveBeenCalled();
  });

  it('should emit wolFeaturesLoadEnd on featuresloadend event', async () => {
    clusterSource.dispatchEvent('featuresloadend');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onFeaturesLoadEnd).toHaveBeenCalled();
  });

  it('should emit wolFeaturesLoadError on featuresloaderror event', async () => {
    clusterSource.dispatchEvent('featuresloaderror');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onFeaturesLoadError).toHaveBeenCalled();
  });

  // --- Destroy ---

  it('should clean up instance and event listeners on destroy', async () => {
    expect(component.getInstance()).toBeInstanceOf(Cluster);
    testComponent.destroySource.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.getInstance()).toBeUndefined();
  });
});
