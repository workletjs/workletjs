import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import ImageTile from 'ol/ImageTile';
import { ObjectEvent } from 'ol/Object';
import { LoadFunction } from 'ol/Tile';
import { NearestDirectionFunction } from 'ol/array';
import BaseEvent from 'ol/events/Event';
import TileLayer from 'ol/layer/Tile';
import { AttributionLike } from 'ol/source/Source';
import { TileSourceEvent } from 'ol/source/Tile';
import WMTS, { RequestEncoding } from 'ol/source/WMTS';
import WMTSTileGrid from 'ol/tilegrid/WMTS';

import { WolProperties, WolSafeAny } from '@workletjs/ngx-openlayers/core/types';
import { WolTileLayerComponent } from '@workletjs/ngx-openlayers/layer/tile';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolWMTSSourceComponent } from './wmts-source.component';

// Minimal WMTSTileGrid for tests
const DEFAULT_TILE_GRID = new WMTSTileGrid({
  origins: [[0, 0]],
  resolutions: [1],
  matrixIds: ['0'],
});

async function createWMTSInstance(setup?: (c: TestWMTSSourceComponent) => void): Promise<WMTS> {
  const f = TestBed.createComponent(TestWMTSSourceComponent);
  setup?.(f.componentInstance);
  f.detectChanges();
  await f.whenStable();
  return f.debugElement
    .query(By.directive(WolWMTSSourceComponent))
    .componentInstance.getInstance() as WMTS;
}

@Component({
  selector: 'wol-test-wmts-source',
  imports: [WolMapComponent, WolViewComponent, WolTileLayerComponent, WolWMTSSourceComponent],
  template: `
    <wol-map>
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="2" />
      <wol-tile-layer>
        @if (!destroySource()) {
          <wol-wmts-source
            [wolTileGrid]="tileGrid()"
            [wolLayer]="layer()"
            [wolStyle]="style()"
            [wolMatrixSet]="matrixSet()"
            [wolAttributions]="attributions()"
            [wolAttributionsCollapsible]="attributionsCollapsible()"
            [wolCacheSize]="cacheSize()"
            [wolCrossOrigin]="crossOrigin()"
            [wolInterpolate]="interpolate()"
            [wolProjection]="projection()"
            [wolReprojectionErrorThreshold]="reprojectionErrorThreshold()"
            [wolRequestEncoding]="requestEncoding()"
            [wolTileClass]="tileClass()"
            [wolTilePixelRatio]="tilePixelRatio()"
            [wolFormat]="format()"
            [wolVersion]="version()"
            [wolDimensions]="dimensions()"
            [wolUrl]="url()"
            [wolTileLoadFunction]="tileLoadFunction()"
            [wolUrls]="urls()"
            [wolWrapX]="wrapX()"
            [wolTransition]="transition()"
            [wolZDirection]="zDirection()"
            [wolProperties]="properties()"
          />
        }
      </wol-tile-layer>
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestWMTSSourceComponent {
  tileGrid = signal<WMTSTileGrid>(DEFAULT_TILE_GRID);
  layer = signal<string>('test-layer');
  style = signal<string>('default');
  matrixSet = signal<string>('EPSG:3857');
  attributions = signal<AttributionLike | undefined>(undefined);
  attributionsCollapsible = signal<boolean | undefined>(undefined);
  cacheSize = signal<number | undefined>(undefined);
  crossOrigin = signal<string | null | undefined>(undefined);
  interpolate = signal<boolean | undefined>(undefined);
  projection = signal<string | undefined>(undefined);
  reprojectionErrorThreshold = signal<number | undefined>(undefined);
  requestEncoding = signal<RequestEncoding | undefined>(undefined);
  tileClass = signal<typeof ImageTile | undefined>(undefined);
  tilePixelRatio = signal<number | undefined>(undefined);
  format = signal<string | undefined>(undefined);
  version = signal<string | undefined>(undefined);
  dimensions = signal<{ [key: string]: WolSafeAny } | undefined>(undefined);
  url = signal<string | undefined>(undefined);
  tileLoadFunction = signal<LoadFunction | undefined>(undefined);
  urls = signal<string[] | undefined>(undefined);
  wrapX = signal<boolean | undefined>(undefined);
  transition = signal<number | undefined>(undefined);
  zDirection = signal<number | NearestDirectionFunction | undefined>(undefined);
  properties = signal<WolProperties | undefined>(undefined);
  destroySource = signal(false);
}

describe('WolWMTSSourceComponent', () => {
  let fixture: ComponentFixture<TestWMTSSourceComponent>;
  let testComponent: TestWMTSSourceComponent;
  let component: WolWMTSSourceComponent;
  let tileLayerComponent: WolTileLayerComponent;
  let wmts: WMTS;
  let olTileLayer: TileLayer;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestWMTSSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestWMTSSourceComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    testComponent = fixture.componentInstance;
    component = fixture.debugElement.query(By.directive(WolWMTSSourceComponent)).componentInstance;
    tileLayerComponent = fixture.debugElement.query(
      By.directive(WolTileLayerComponent),
    ).componentInstance;
    wmts = component.getInstance() as WMTS;
    olTileLayer = tileLayerComponent.getInstance() as TileLayer;
  });

  // --- Creation ---

  it('should create the WMTS source', () => {
    expect(component).toBeTruthy();
    expect(wmts).toBeInstanceOf(WMTS);
  });

  it('should register the source on the tile layer', fakeAsync(() => {
    flush();
    expect(olTileLayer.getSource()).toBe(wmts);
  }));

  // --- Initialization (per input) ---

  it('should initialize with custom wolLayer', async () => {
    const inst = await createWMTSInstance((c) => c.layer.set('custom-layer'));
    expect(inst).toBeInstanceOf(WMTS);
  });

  it('should initialize with custom wolStyle', async () => {
    const inst = await createWMTSInstance((c) => c.style.set('raster'));
    expect(inst).toBeInstanceOf(WMTS);
  });

  it('should initialize with custom wolMatrixSet', async () => {
    const inst = await createWMTSInstance((c) => c.matrixSet.set('EPSG:4326'));
    expect(inst).toBeInstanceOf(WMTS);
  });

  it('should initialize with wolAttributions', async () => {
    const inst = await createWMTSInstance((c) => c.attributions.set('© Test'));
    expect(inst).toBeInstanceOf(WMTS);
  });

  it('should initialize with wolAttributionsCollapsible = false', async () => {
    const inst = await createWMTSInstance((c) => c.attributionsCollapsible.set(false));
    expect(inst).toBeInstanceOf(WMTS);
  });

  it('should initialize with wolCacheSize', async () => {
    const inst = await createWMTSInstance((c) => c.cacheSize.set(128));
    expect(inst).toBeInstanceOf(WMTS);
  });

  it('should initialize with wolCrossOrigin', async () => {
    const inst = await createWMTSInstance((c) => c.crossOrigin.set('anonymous'));
    expect(inst).toBeInstanceOf(WMTS);
  });

  it('should initialize with wolCrossOrigin = null', async () => {
    const inst = await createWMTSInstance((c) => c.crossOrigin.set(null));
    expect(inst).toBeInstanceOf(WMTS);
  });

  it('should initialize with wolInterpolate = false', async () => {
    const inst = await createWMTSInstance((c) => c.interpolate.set(false));
    expect(inst).toBeInstanceOf(WMTS);
  });

  it('should initialize with wolProjection', async () => {
    const inst = await createWMTSInstance((c) => c.projection.set('EPSG:4326'));
    expect(inst).toBeInstanceOf(WMTS);
  });

  it('should initialize with wolReprojectionErrorThreshold', async () => {
    const inst = await createWMTSInstance((c) => c.reprojectionErrorThreshold.set(0.5));
    expect(inst).toBeInstanceOf(WMTS);
  });

  it('should initialize with wolRequestEncoding as REST', async () => {
    const inst = await createWMTSInstance((c) => c.requestEncoding.set('REST'));
    expect(inst).toBeInstanceOf(WMTS);
  });

  it('should initialize with wolFormat', async () => {
    const inst = await createWMTSInstance((c) => c.format.set('image/png'));
    expect(inst).toBeInstanceOf(WMTS);
  });

  it('should initialize with wolVersion', async () => {
    const inst = await createWMTSInstance((c) => c.version.set('1.0.0'));
    expect(inst).toBeInstanceOf(WMTS);
  });

  it('should initialize with wolDimensions', async () => {
    const inst = await createWMTSInstance((c) => c.dimensions.set({ Time: '2020-01-01' }));
    expect(inst).toBeInstanceOf(WMTS);
  });

  it('should initialize with wolUrl', async () => {
    const inst = await createWMTSInstance((c) =>
      c.url.set('https://wmts.example.com/ows/{TileMatrix}/{TileCol}/{TileRow}.png'),
    );
    expect(inst).toBeInstanceOf(WMTS);
  });

  it('should initialize with wolUrls', async () => {
    const inst = await createWMTSInstance((c) =>
      c.urls.set(['https://a.example.com/wmts', 'https://b.example.com/wmts']),
    );
    expect(inst).toBeInstanceOf(WMTS);
  });

  it('should initialize with wolWrapX = false', async () => {
    const inst = await createWMTSInstance((c) => c.wrapX.set(false));
    expect(inst).toBeInstanceOf(WMTS);
  });

  it('should initialize with wolTransition', async () => {
    const inst = await createWMTSInstance((c) => c.transition.set(250));
    expect(inst).toBeInstanceOf(WMTS);
  });

  it('should initialize with wolZDirection', async () => {
    const inst = await createWMTSInstance((c) => c.zDirection.set(1));
    expect(inst).toBeInstanceOf(WMTS);
  });

  it('should initialize with wolProperties', async () => {
    const inst = await createWMTSInstance((c) => c.properties.set({ label: 'test-wmts' }));
    expect(inst.getProperties()).toMatchObject({ label: 'test-wmts' });
  });

  it('should initialize with custom tileGrid', async () => {
    const grid = new WMTSTileGrid({
      origins: [
        [0, 0],
        [0, 0],
      ],
      resolutions: [2, 1],
      matrixIds: ['0', '1'],
    });
    const inst = await createWMTSInstance((c) => c.tileGrid.set(grid));
    expect(inst).toBeInstanceOf(WMTS);
  });

  // --- ngOnChanges ---

  it('should update attributions when wolAttributions changes', () => {
    const spy = vi.spyOn(wmts, 'setAttributions');
    testComponent.attributions.set('© Updated');
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith('© Updated');
  });

  it('should update properties when wolProperties changes', () => {
    const spy = vi.spyOn(wmts, 'setProperties');
    const newProps: WolProperties = { updated: true };
    testComponent.properties.set(newProps);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(newProps);
  });

  it('should update url when wolUrl changes', () => {
    const spy = vi.spyOn(wmts, 'setUrl');
    testComponent.url.set('https://updated.example.com/wmts');
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith('https://updated.example.com/wmts');
  });

  it('should update urls when wolUrls changes', () => {
    const spy = vi.spyOn(wmts, 'setUrls');
    const newUrls = ['https://a.example.com/wmts', 'https://b.example.com/wmts'];
    testComponent.urls.set(newUrls);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(newUrls);
  });

  it('should update dimensions when wolDimensions changes', () => {
    const spy = vi.spyOn(wmts, 'updateDimensions');
    const dims = { Time: '2021-01-01' };
    testComponent.dimensions.set(dims);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(dims);
  });

  it('should update tile grid for projection when both wolTileGrid and wolProjection are set', () => {
    const spy = vi.spyOn(wmts, 'setTileGridForProjection');
    const grid = new WMTSTileGrid({ origins: [[0, 0]], resolutions: [1], matrixIds: ['0'] });
    testComponent.projection.set('EPSG:4326');
    testComponent.tileGrid.set(grid);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith('EPSG:4326', grid);
  });

  // --- Outputs ---

  it('should emit wolChange when the source fires a change event', () => {
    const spy = vi.spyOn(component.wolChange, 'emit');
    const event = new BaseEvent('change');
    wmts.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolError when the source fires an error event', () => {
    const spy = vi.spyOn(component.wolError, 'emit');
    const event = new BaseEvent('error');
    wmts.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolPropertyChange when the source fires a propertychange event', () => {
    const spy = vi.spyOn(component.wolPropertyChange, 'emit');
    const event = new ObjectEvent('propertychange', 'key', undefined);
    wmts.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolTileLoadEnd when the source fires a tileloadend event', () => {
    const spy = vi.spyOn(component.wolTileLoadEnd, 'emit');
    const event = new TileSourceEvent('tileloadend', undefined as never);
    wmts.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolTileLoadError when the source fires a tileloaderror event', () => {
    const spy = vi.spyOn(component.wolTileLoadError, 'emit');
    const event = new TileSourceEvent('tileloaderror', undefined as never);
    wmts.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolTileLoadStart when the source fires a tileloadstart event', () => {
    const spy = vi.spyOn(component.wolTileLoadStart, 'emit');
    const event = new TileSourceEvent('tileloadstart', undefined as never);
    wmts.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  // --- Lifecycle / Destroy ---

  it('should remove the source from the tile layer when destroyed', fakeAsync(() => {
    flush();
    expect(olTileLayer.getSource()).toBe(wmts);

    testComponent.destroySource.set(true);
    fixture.detectChanges();

    expect(component.getInstance()).toBeUndefined();
    expect(olTileLayer.getSource()).toBeNull();
  }));
});
