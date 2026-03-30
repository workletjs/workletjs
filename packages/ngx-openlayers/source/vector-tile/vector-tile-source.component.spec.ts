import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { FeatureLike } from 'ol/Feature';
import { ObjectEvent } from 'ol/Object';
import { LoadFunction, UrlFunction } from 'ol/Tile';
import BaseEvent from 'ol/events/Event';
import MVT from 'ol/format/MVT';
import VectorTileLayer from 'ol/layer/VectorTile';
import { get as getProjection } from 'ol/proj';
import { AttributionLike } from 'ol/source/Source';
import VectorTileSource from 'ol/source/VectorTile';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolVectorTileLayerComponent } from '@workletjs/ngx-openlayers/layer/vector-tile';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolVectorTileSourceComponent } from './vector-tile-source.component';

async function createVectorTileSourceInstance(
  setup?: (c: TestVectorTileSourceComponent) => void,
): Promise<VectorTileSource<FeatureLike>> {
  const f = TestBed.createComponent(TestVectorTileSourceComponent);
  setup?.(f.componentInstance);
  f.detectChanges();
  await f.whenStable();
  return f.debugElement
    .query(By.directive(WolVectorTileSourceComponent))
    .componentInstance.getInstance() as VectorTileSource<FeatureLike>;
}

@Component({
  selector: 'wol-test-vector-tile-source',
  imports: [
    WolMapComponent,
    WolViewComponent,
    WolVectorTileLayerComponent,
    WolVectorTileSourceComponent,
  ],
  template: `
    <wol-map>
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="2" />
      <wol-vector-tile-layer>
        @if (!destroySource()) {
          <wol-vector-tile-source
            [wolAttributions]="attributions()"
            [wolAttributionsCollapsible]="attributionsCollapsible()"
            [wolCacheSize]="cacheSize()"
            [wolOverlaps]="overlaps()"
            [wolMaxZoom]="maxZoom()"
            [wolMinZoom]="minZoom()"
            [wolTransition]="transition()"
            [wolWrapX]="wrapX()"
            [wolFormat]="format()"
            [wolTileLoadFunction]="tileLoadFunction()"
            [wolTileUrlFunction]="tileUrlFunction()"
            [wolUrl]="url()"
            [wolUrls]="urls()"
            [wolProperties]="properties()"
            (wolChange)="onChange($event)"
            (wolError)="onError($event)"
            (wolPropertyChange)="onPropertyChange($event)"
            (wolTileLoadEnd)="onTileLoadEnd($event)"
            (wolTileLoadError)="onTileLoadError($event)"
            (wolTileLoadStart)="onTileLoadStart($event)"
          />
        }
      </wol-vector-tile-layer>
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestVectorTileSourceComponent {
  attributions = signal<AttributionLike | undefined>(undefined);
  attributionsCollapsible = signal<boolean | undefined>(undefined);
  cacheSize = signal<number | undefined>(undefined);
  overlaps = signal<boolean | undefined>(undefined);
  maxZoom = signal<number | undefined>(undefined);
  minZoom = signal<number | undefined>(undefined);
  transition = signal<number | undefined>(undefined);
  wrapX = signal<boolean | undefined>(undefined);
  format = signal<MVT | undefined>(undefined);
  tileLoadFunction = signal<LoadFunction | undefined>(undefined);
  tileUrlFunction = signal<UrlFunction | undefined>(undefined);
  url = signal<string | undefined>(undefined);
  urls = signal<string[] | undefined>(undefined);
  properties = signal<WolProperties | undefined>(undefined);
  destroySource = signal(false);

  onChange = vi.fn();
  onError = vi.fn();
  onPropertyChange = vi.fn();
  onTileLoadEnd = vi.fn();
  onTileLoadError = vi.fn();
  onTileLoadStart = vi.fn();
}

describe('WolVectorTileSourceComponent', () => {
  let fixture: ComponentFixture<TestVectorTileSourceComponent>;
  let testComponent: TestVectorTileSourceComponent;
  let component: WolVectorTileSourceComponent;
  let vectorTileLayerComponent: WolVectorTileLayerComponent;
  let vectorTileSource: VectorTileSource<FeatureLike>;
  let olVectorTileLayer: VectorTileLayer;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestVectorTileSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestVectorTileSourceComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    testComponent = fixture.componentInstance;
    component = fixture.debugElement.query(
      By.directive(WolVectorTileSourceComponent),
    ).componentInstance;
    vectorTileLayerComponent = fixture.debugElement.query(
      By.directive(WolVectorTileLayerComponent),
    ).componentInstance;
    vectorTileSource = component.getInstance() as VectorTileSource<FeatureLike>;
    olVectorTileLayer = vectorTileLayerComponent.getInstance() as VectorTileLayer;
  });

  // --- Creation ---

  it('should create the VectorTile source', () => {
    expect(component).toBeTruthy();
    expect(vectorTileSource).toBeInstanceOf(VectorTileSource);
  });

  it('should register the source on the vector tile layer', fakeAsync(() => {
    flush();
    expect(olVectorTileLayer.getSource()).toBe(vectorTileSource);
  }));

  // --- Initialization (per input) ---

  it('should initialize with wolAttributions', async () => {
    const inst = await createVectorTileSourceInstance((c) => c.attributions.set('© VectorTile'));
    expect(inst).toBeInstanceOf(VectorTileSource);
  });

  it('should initialize with wolAttributionsCollapsible = false', async () => {
    const inst = await createVectorTileSourceInstance((c) => c.attributionsCollapsible.set(false));
    expect(inst).toBeInstanceOf(VectorTileSource);
  });

  it('should initialize with wolCacheSize', async () => {
    const inst = await createVectorTileSourceInstance((c) => c.cacheSize.set(256));
    expect(inst).toBeInstanceOf(VectorTileSource);
  });

  it('should initialize with wolOverlaps = false', async () => {
    const inst = await createVectorTileSourceInstance((c) => c.overlaps.set(false));
    expect(inst).toBeInstanceOf(VectorTileSource);
  });

  it('should initialize with wolMaxZoom', async () => {
    const inst = await createVectorTileSourceInstance((c) => c.maxZoom.set(14));
    expect(inst).toBeInstanceOf(VectorTileSource);
  });

  it('should initialize with wolMinZoom', async () => {
    const inst = await createVectorTileSourceInstance((c) => c.minZoom.set(0));
    expect(inst).toBeInstanceOf(VectorTileSource);
  });

  it('should initialize with wolTransition', async () => {
    const inst = await createVectorTileSourceInstance((c) => c.transition.set(100));
    expect(inst).toBeInstanceOf(VectorTileSource);
  });

  it('should initialize with wolWrapX = false', async () => {
    const inst = await createVectorTileSourceInstance((c) => c.wrapX.set(false));
    expect(inst).toBeInstanceOf(VectorTileSource);
  });

  it('should initialize with wolProperties', async () => {
    const inst = await createVectorTileSourceInstance((c) =>
      c.properties.set({ customProp: 'value' }),
    );
    expect(inst).toBeInstanceOf(VectorTileSource);
  });

  it('should initialize with wolFormat', async () => {
    const format = new MVT();
    const inst = await createVectorTileSourceInstance((c) => {
      c.format.set(format);
      c.url.set('https://example.com/tiles/{z}/{x}/{y}.pbf');
    });

    expect(inst).toBeInstanceOf(VectorTileSource);

    const projection = getProjection('EPSG:3857');
    expect(projection).toBeTruthy();

    const renderTile = inst.getTile(0, 0, 0, 1, projection!);
    const sourceTiles = inst.getSourceTiles(1, projection!, renderTile);

    expect(sourceTiles.length).toBeGreaterThan(0);
    expect(sourceTiles[0].getFormat()).toBe(format);
  });

  // --- ngOnChanges ---

  it('should update attributions via ngOnChanges (wolAttributions)', async () => {
    const spy = vi.spyOn(vectorTileSource, 'setAttributions');
    testComponent.attributions.set('© Updated');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(spy).toHaveBeenCalledWith('© Updated');
  });

  it('should update properties via ngOnChanges (wolProperties)', async () => {
    const spy = vi.spyOn(vectorTileSource, 'setProperties');
    testComponent.properties.set({ key: 'updated' });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(spy).toHaveBeenCalledWith({ key: 'updated' });
  });

  it('should update tileLoadFunction via ngOnChanges (wolTileLoadFunction)', async () => {
    const spy = vi.spyOn(vectorTileSource, 'setTileLoadFunction');
    const fn: LoadFunction = (tile) => tile;
    testComponent.tileLoadFunction.set(fn);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(spy).toHaveBeenCalledWith(fn);
  });

  it('should update tileUrlFunction via ngOnChanges (wolTileUrlFunction)', async () => {
    const spy = vi.spyOn(vectorTileSource, 'setTileUrlFunction');
    const fn: UrlFunction = () => '';
    testComponent.tileUrlFunction.set(fn);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(spy).toHaveBeenCalledWith(fn);
  });

  it('should update url via ngOnChanges (wolUrl)', async () => {
    const spy = vi.spyOn(vectorTileSource, 'setUrl').mockImplementation((_url) => _url);
    testComponent.url.set('https://example.com/tiles/{z}/{x}/{y}.pbf');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(spy).toHaveBeenCalledWith('https://example.com/tiles/{z}/{x}/{y}.pbf');
  });

  it('should update urls via ngOnChanges (wolUrls)', async () => {
    const spy = vi.spyOn(vectorTileSource, 'setUrls').mockImplementation((_urls) => _urls);
    const urls = ['https://a.example.com/{z}/{x}/{y}.pbf', 'https://b.example.com/{z}/{x}/{y}.pbf'];
    testComponent.urls.set(urls);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(spy).toHaveBeenCalledWith(urls);
  });

  // --- Outputs ---

  it('should emit wolChange on source change event', async () => {
    vectorTileSource.dispatchEvent('change');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onChange).toHaveBeenCalledWith(expect.any(BaseEvent));
  });

  it('should emit wolError on source error event', async () => {
    vectorTileSource.dispatchEvent('error');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onError).toHaveBeenCalledWith(expect.any(BaseEvent));
  });

  it('should emit wolPropertyChange on propertychange event', async () => {
    vectorTileSource.set('testProp', 42);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onPropertyChange).toHaveBeenCalledWith(expect.any(ObjectEvent));
  });

  it('should emit wolTileLoadStart on tileloadstart event', async () => {
    vectorTileSource.dispatchEvent('tileloadstart');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onTileLoadStart).toHaveBeenCalled();
  });

  it('should emit wolTileLoadEnd on tileloadend event', async () => {
    vectorTileSource.dispatchEvent('tileloadend');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onTileLoadEnd).toHaveBeenCalled();
  });

  it('should emit wolTileLoadError on tileloaderror event', async () => {
    vectorTileSource.dispatchEvent('tileloaderror');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onTileLoadError).toHaveBeenCalled();
  });

  // --- Destroy ---

  it('should clean up instance and event listeners on destroy', async () => {
    expect(component.getInstance()).toBeInstanceOf(VectorTileSource);
    testComponent.destroySource.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.getInstance()).toBeUndefined();
  });
});
