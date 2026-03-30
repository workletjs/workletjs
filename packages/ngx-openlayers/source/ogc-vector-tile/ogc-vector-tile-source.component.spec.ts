import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { FeatureLike } from 'ol/Feature';
import { ObjectEvent } from 'ol/Object';
import BaseEvent from 'ol/events/Event';
import FeatureFormat from 'ol/format/Feature';
import MVT from 'ol/format/MVT';
import VectorTileLayer from 'ol/layer/VectorTile';
import OGCVectorTile from 'ol/source/OGCVectorTile';
import { AttributionLike } from 'ol/source/Source';

import { WolProperties, WolSafeAny } from '@workletjs/ngx-openlayers/core/types';
import { WolVectorTileLayerComponent } from '@workletjs/ngx-openlayers/layer/vector-tile';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolOGCVectorTileSourceComponent } from './ogc-vector-tile-source.component';

// The `ol/source` barrel triggers web-worker initialization in jsdom.
// Mock it to expose only OGCVectorTile from its dedicated module path.
vi.mock('ol/source', async () => {
  const mod = await import('ol/source/OGCVectorTile');
  return { OGCVectorTile: mod.default };
});

const DEFAULT_URL = 'https://tiles.example.com/ogc/collections/my-layer';

async function createOGCVectorTileInstance(
  setup?: (c: TestOGCVectorTileSourceComponent) => void,
): Promise<OGCVectorTile<FeatureLike>> {
  const f = TestBed.createComponent(TestOGCVectorTileSourceComponent);
  setup?.(f.componentInstance);
  f.detectChanges();
  await f.whenStable();
  return f.debugElement
    .query(By.directive(WolOGCVectorTileSourceComponent))
    .componentInstance.getInstance() as OGCVectorTile<FeatureLike>;
}

@Component({
  selector: 'wol-test-ogc-vector-tile-source',
  imports: [
    WolMapComponent,
    WolViewComponent,
    WolVectorTileLayerComponent,
    WolOGCVectorTileSourceComponent,
  ],
  template: `
    <wol-map>
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="2" />
      <wol-vector-tile-layer>
        @if (!destroySource()) {
          <wol-ogc-vector-tile-source
            [wolUrl]="url()"
            [wolFormat]="format()"
            [wolContext]="context()"
            [wolMediaType]="mediaType()"
            [wolAttributions]="attributions()"
            [wolAttributionsCollapsible]="attributionsCollapsible()"
            [wolCacheSize]="cacheSize()"
            [wolOverlaps]="overlaps()"
            [wolProjection]="projection()"
            [wolTransition]="transition()"
            [wolWrapX]="wrapX()"
            [wolCollections]="collections()"
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
class TestOGCVectorTileSourceComponent {
  url = signal<string>(DEFAULT_URL);
  format = signal<FeatureFormat<FeatureLike>>(new MVT());
  context = signal<Record<string, WolSafeAny> | undefined>(undefined);
  mediaType = signal<string | undefined>(undefined);
  attributions = signal<AttributionLike | undefined>(undefined);
  attributionsCollapsible = signal<boolean | undefined>(undefined);
  cacheSize = signal<number | undefined>(undefined);
  overlaps = signal<boolean | undefined>(undefined);
  projection = signal<string | undefined>(undefined);
  transition = signal<number | undefined>(undefined);
  wrapX = signal<boolean | undefined>(undefined);
  collections = signal<string[] | undefined>(undefined);
  properties = signal<WolProperties | undefined>(undefined);
  destroySource = signal(false);

  onChange = vi.fn();
  onError = vi.fn();
  onPropertyChange = vi.fn();
  onTileLoadEnd = vi.fn();
  onTileLoadError = vi.fn();
  onTileLoadStart = vi.fn();
}

describe('WolOGCVectorTileSourceComponent', () => {
  let fixture: ComponentFixture<TestOGCVectorTileSourceComponent>;
  let testComponent: TestOGCVectorTileSourceComponent;
  let component: WolOGCVectorTileSourceComponent;
  let vectorTileLayerComponent: WolVectorTileLayerComponent;
  let ogcVectorTileSource: OGCVectorTile<FeatureLike>;
  let olVectorTileLayer: VectorTileLayer;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestOGCVectorTileSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestOGCVectorTileSourceComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    testComponent = fixture.componentInstance;
    component = fixture.debugElement.query(
      By.directive(WolOGCVectorTileSourceComponent),
    ).componentInstance;
    vectorTileLayerComponent = fixture.debugElement.query(
      By.directive(WolVectorTileLayerComponent),
    ).componentInstance;
    ogcVectorTileSource = component.getInstance() as OGCVectorTile<FeatureLike>;
    olVectorTileLayer = vectorTileLayerComponent.getInstance() as VectorTileLayer;
  });

  // --- Creation ---

  it('should create the OGCVectorTile source', () => {
    expect(component).toBeTruthy();
    expect(ogcVectorTileSource).toBeInstanceOf(OGCVectorTile);
  });

  it('should register the source on the vector tile layer', fakeAsync(() => {
    flush();
    expect(olVectorTileLayer.getSource()).toBe(ogcVectorTileSource);
  }));

  // --- Initialization (per input) ---

  it('should initialize with wolUrl', async () => {
    const inst = await createOGCVectorTileInstance((c) =>
      c.url.set('https://tiles.example.com/ogc/other'),
    );
    expect(inst).toBeInstanceOf(OGCVectorTile);
  });

  it('should initialize with wolAttributions', async () => {
    const inst = await createOGCVectorTileInstance((c) => c.attributions.set('© OGC'));
    expect(inst).toBeInstanceOf(OGCVectorTile);
  });

  it('should initialize with wolAttributionsCollapsible = false', async () => {
    const inst = await createOGCVectorTileInstance((c) => c.attributionsCollapsible.set(false));
    expect(inst).toBeInstanceOf(OGCVectorTile);
  });

  it('should initialize with wolCacheSize', async () => {
    const inst = await createOGCVectorTileInstance((c) => c.cacheSize.set(128));
    expect(inst).toBeInstanceOf(OGCVectorTile);
  });

  it('should initialize with wolOverlaps = false', async () => {
    const inst = await createOGCVectorTileInstance((c) => c.overlaps.set(false));
    expect(inst).toBeInstanceOf(OGCVectorTile);
  });

  it('should initialize with wolMediaType', async () => {
    const inst = await createOGCVectorTileInstance((c) =>
      c.mediaType.set('application/vnd.mapbox-vector-tile'),
    );
    expect(inst).toBeInstanceOf(OGCVectorTile);
  });

  it('should initialize with wolTransition', async () => {
    const inst = await createOGCVectorTileInstance((c) => c.transition.set(100));
    expect(inst).toBeInstanceOf(OGCVectorTile);
  });

  it('should initialize with wolWrapX = false', async () => {
    const inst = await createOGCVectorTileInstance((c) => c.wrapX.set(false));
    expect(inst).toBeInstanceOf(OGCVectorTile);
  });

  it('should initialize with wolCollections', async () => {
    const inst = await createOGCVectorTileInstance((c) => c.collections.set(['roads', 'water']));
    expect(inst).toBeInstanceOf(OGCVectorTile);
  });

  it('should initialize with wolContext', async () => {
    const inst = await createOGCVectorTileInstance((c) => c.context.set({ key: 'value' }));
    expect(inst).toBeInstanceOf(OGCVectorTile);
  });

  it('should initialize with wolProperties', async () => {
    const inst = await createOGCVectorTileInstance((c) =>
      c.properties.set({ customProp: 'value' }),
    );
    expect(inst).toBeInstanceOf(OGCVectorTile);
  });

  // --- ngOnChanges ---

  it('should update attributions via ngOnChanges (wolAttributions)', async () => {
    const spy = vi.spyOn(ogcVectorTileSource, 'setAttributions');
    testComponent.attributions.set('© Updated');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(spy).toHaveBeenCalledWith('© Updated');
  });

  it('should update properties via ngOnChanges (wolProperties)', async () => {
    const spy = vi.spyOn(ogcVectorTileSource, 'setProperties');
    testComponent.properties.set({ key: 'updated' });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(spy).toHaveBeenCalledWith({ key: 'updated' });
  });

  it('should update url via ngOnChanges (wolUrl)', async () => {
    const spy = vi.spyOn(ogcVectorTileSource, 'setUrl').mockImplementation((_url) => _url);
    testComponent.url.set('https://tiles.example.com/ogc/new-url');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(spy).toHaveBeenCalledWith('https://tiles.example.com/ogc/new-url');
  });

  // --- Outputs ---

  it('should emit wolChange on source change event', async () => {
    ogcVectorTileSource.dispatchEvent('change');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onChange).toHaveBeenCalledWith(expect.any(BaseEvent));
  });

  it('should emit wolError on source error event', async () => {
    ogcVectorTileSource.dispatchEvent('error');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onError).toHaveBeenCalledWith(expect.any(BaseEvent));
  });

  it('should emit wolPropertyChange on propertychange event', async () => {
    ogcVectorTileSource.set('testProp', 42);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onPropertyChange).toHaveBeenCalledWith(expect.any(ObjectEvent));
  });

  it('should emit wolTileLoadStart on tileloadstart event', async () => {
    ogcVectorTileSource.dispatchEvent('tileloadstart');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onTileLoadStart).toHaveBeenCalled();
  });

  it('should emit wolTileLoadEnd on tileloadend event', async () => {
    ogcVectorTileSource.dispatchEvent('tileloadend');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onTileLoadEnd).toHaveBeenCalled();
  });

  it('should emit wolTileLoadError on tileloaderror event', async () => {
    ogcVectorTileSource.dispatchEvent('tileloaderror');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onTileLoadError).toHaveBeenCalled();
  });

  // --- Destroy ---

  it('should clean up instance and event listeners on destroy', async () => {
    expect(component.getInstance()).toBeInstanceOf(OGCVectorTile);
    testComponent.destroySource.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.getInstance()).toBeUndefined();
  });
});
