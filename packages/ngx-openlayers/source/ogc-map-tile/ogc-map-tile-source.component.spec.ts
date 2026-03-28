import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ObjectEvent } from 'ol/Object';
import { LoadFunction } from 'ol/Tile';
import BaseEvent from 'ol/events/Event';
import TileLayer from 'ol/layer/Tile';
import OGCMapTile from 'ol/source/OGCMapTile';
import { TileSourceEvent } from 'ol/source/Tile';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolTileLayerComponent } from '@workletjs/ngx-openlayers/layer/tile';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolOGCMapTileSourceComponent } from './ogc-map-tile-source.component';

const DEFAULT_URL = 'https://maps.example.com/ogc/tiles/WebMercatorQuad';

async function createOGCMapTileInstance(
  setup?: (c: TestOGCMapTileSourceComponent) => void,
): Promise<OGCMapTile> {
  const f = TestBed.createComponent(TestOGCMapTileSourceComponent);
  setup?.(f.componentInstance);
  f.detectChanges();
  await f.whenStable();
  return f.debugElement
    .query(By.directive(WolOGCMapTileSourceComponent))
    .componentInstance.getInstance() as OGCMapTile;
}

@Component({
  selector: 'wol-test-ogc-map-tile-source',
  imports: [WolMapComponent, WolViewComponent, WolTileLayerComponent, WolOGCMapTileSourceComponent],
  template: `
    <wol-map>
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="2" />
      <wol-tile-layer>
        @if (!destroySource()) {
          <wol-ogc-map-tile-source
            [wolUrl]="url()"
            [wolContext]="context()"
            [wolMediaType]="mediaType()"
            [wolProjection]="projection()"
            [wolAttributions]="attributions()"
            [wolCacheSize]="cacheSize()"
            [wolCrossOrigin]="crossOrigin()"
            [wolInterpolate]="interpolate()"
            [wolReprojectionErrorThreshold]="reprojectionErrorThreshold()"
            [wolTileLoadFunction]="tileLoadFunction()"
            [wolWrapX]="wrapX()"
            [wolTransition]="transition()"
            [wolCollections]="collections()"
            [wolProperties]="properties()"
          />
        }
      </wol-tile-layer>
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestOGCMapTileSourceComponent {
  url = signal<string>(DEFAULT_URL);
  context = signal<object | undefined>(undefined);
  mediaType = signal<string | undefined>(undefined);
  projection = signal<string | undefined>(undefined);
  attributions = signal<string | undefined>(undefined);
  cacheSize = signal<number | undefined>(undefined);
  crossOrigin = signal<string | null | undefined>(undefined);
  interpolate = signal<boolean | undefined>(undefined);
  reprojectionErrorThreshold = signal<number | undefined>(undefined);
  tileLoadFunction = signal<LoadFunction | undefined>(undefined);
  wrapX = signal<boolean | undefined>(undefined);
  transition = signal<number | undefined>(undefined);
  collections = signal<string[] | undefined>(undefined);
  properties = signal<WolProperties | undefined>(undefined);
  destroySource = signal(false);
}

describe('WolOGCMapTileSourceComponent', () => {
  let fixture: ComponentFixture<TestOGCMapTileSourceComponent>;
  let testComponent: TestOGCMapTileSourceComponent;
  let component: WolOGCMapTileSourceComponent;
  let tileLayerComponent: WolTileLayerComponent;
  let ogcMapTile: OGCMapTile;
  let olTileLayer: TileLayer;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestOGCMapTileSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestOGCMapTileSourceComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    testComponent = fixture.componentInstance;
    component = fixture.debugElement.query(
      By.directive(WolOGCMapTileSourceComponent),
    ).componentInstance;
    tileLayerComponent = fixture.debugElement.query(
      By.directive(WolTileLayerComponent),
    ).componentInstance;
    ogcMapTile = component.getInstance() as OGCMapTile;
    olTileLayer = tileLayerComponent.getInstance() as TileLayer;
  });

  // --- Creation ---

  it('should create the OGCMapTile source', () => {
    expect(component).toBeTruthy();
    expect(ogcMapTile).toBeInstanceOf(OGCMapTile);
  });

  it('should register the source on the tile layer', fakeAsync(() => {
    flush();
    expect(olTileLayer.getSource()).toBe(ogcMapTile);
  }));

  // --- Initialization (per input) ---

  it('should initialize with required wolUrl', async () => {
    const inst = await createOGCMapTileInstance((c) => c.url.set(DEFAULT_URL));
    expect(inst).toBeInstanceOf(OGCMapTile);
  });

  it('should initialize with wolContext', async () => {
    const inst = await createOGCMapTileInstance((c) => c.context.set({ version: '1.0' }));
    expect(inst).toBeInstanceOf(OGCMapTile);
  });

  it('should initialize with wolMediaType', async () => {
    const inst = await createOGCMapTileInstance((c) => c.mediaType.set('image/png'));
    expect(inst).toBeInstanceOf(OGCMapTile);
  });

  it('should initialize with wolProjection', async () => {
    const inst = await createOGCMapTileInstance((c) => c.projection.set('EPSG:4326'));
    expect(inst).toBeInstanceOf(OGCMapTile);
  });

  it('should initialize with wolAttributions', async () => {
    const inst = await createOGCMapTileInstance((c) => c.attributions.set('© OGC'));
    expect(inst.getAttributions()).toBeTruthy();
  });

  it('should initialize with wolCacheSize', async () => {
    const inst = await createOGCMapTileInstance((c) => c.cacheSize.set(128));
    expect(inst).toBeInstanceOf(OGCMapTile);
  });

  it('should initialize with wolCrossOrigin', async () => {
    const inst = await createOGCMapTileInstance((c) => c.crossOrigin.set('anonymous'));
    expect(inst).toBeInstanceOf(OGCMapTile);
  });

  it('should initialize with wolInterpolate = false', async () => {
    const inst = await createOGCMapTileInstance((c) => c.interpolate.set(false));
    expect(inst).toBeInstanceOf(OGCMapTile);
  });

  it('should initialize with wolReprojectionErrorThreshold', async () => {
    const inst = await createOGCMapTileInstance((c) => c.reprojectionErrorThreshold.set(0.5));
    expect(inst).toBeInstanceOf(OGCMapTile);
  });

  it('should initialize with wolTileLoadFunction', async () => {
    const fn: LoadFunction = vi.fn();
    const inst = await createOGCMapTileInstance((c) => c.tileLoadFunction.set(fn));
    expect(inst.getTileLoadFunction()).toBe(fn);
  });

  it('should initialize with wolWrapX = false', async () => {
    const inst = await createOGCMapTileInstance((c) => c.wrapX.set(false));
    expect(inst).toBeInstanceOf(OGCMapTile);
  });

  it('should initialize with wolTransition', async () => {
    const inst = await createOGCMapTileInstance((c) => c.transition.set(300));
    expect(inst).toBeInstanceOf(OGCMapTile);
  });

  it('should initialize with wolCollections', async () => {
    const inst = await createOGCMapTileInstance((c) => c.collections.set(['col1', 'col2']));
    expect(inst).toBeInstanceOf(OGCMapTile);
  });

  it('should initialize with wolProperties', async () => {
    const inst = await createOGCMapTileInstance((c) =>
      c.properties.set({ label: 'test-ogc-map-tile' }),
    );
    expect(inst.getProperties()).toMatchObject({ label: 'test-ogc-map-tile' });
  });

  // --- ngOnChanges ---

  it('should update attributions when wolAttributions changes', () => {
    const spy = vi.spyOn(ogcMapTile, 'setAttributions');
    testComponent.attributions.set('© Updated');
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith('© Updated');
  });

  it('should update tileLoadFunction when wolTileLoadFunction changes', () => {
    const spy = vi.spyOn(ogcMapTile, 'setTileLoadFunction');
    const fn: LoadFunction = vi.fn();
    testComponent.tileLoadFunction.set(fn);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(fn);
  });

  it('should update url when wolUrl changes', () => {
    const spy = vi.spyOn(ogcMapTile, 'setUrl');
    const newUrl = 'https://maps.example.com/ogc/tiles/v2';
    testComponent.url.set(newUrl);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(newUrl);
  });

  it('should update properties when wolProperties changes', () => {
    const spy = vi.spyOn(ogcMapTile, 'setProperties');
    const newProps: WolProperties = { updated: true };
    testComponent.properties.set(newProps);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(newProps);
  });

  // --- Outputs ---

  it('should emit wolChange when the source fires a change event', () => {
    const spy = vi.spyOn(component.wolChange, 'emit');
    const event = new BaseEvent('change');
    ogcMapTile.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolError when the source fires an error event', () => {
    const spy = vi.spyOn(component.wolError, 'emit');
    const event = new BaseEvent('error');
    ogcMapTile.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolPropertyChange when the source fires a propertychange event', () => {
    const spy = vi.spyOn(component.wolPropertyChange, 'emit');
    const event = new ObjectEvent('propertychange', 'key', undefined);
    ogcMapTile.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolTileLoadEnd when the source fires a tileloadend event', () => {
    const spy = vi.spyOn(component.wolTileLoadEnd, 'emit');
    const event = new TileSourceEvent('tileloadend', undefined as never);
    ogcMapTile.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolTileLoadError when the source fires a tileloaderror event', () => {
    const spy = vi.spyOn(component.wolTileLoadError, 'emit');
    const event = new TileSourceEvent('tileloaderror', undefined as never);
    ogcMapTile.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolTileLoadStart when the source fires a tileloadstart event', () => {
    const spy = vi.spyOn(component.wolTileLoadStart, 'emit');
    const event = new TileSourceEvent('tileloadstart', undefined as never);
    ogcMapTile.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  // --- Lifecycle / Destroy ---

  it('should remove the source from the tile layer when destroyed', fakeAsync(() => {
    flush();
    expect(olTileLayer.getSource()).toBe(ogcMapTile);

    testComponent.destroySource.set(true);
    fixture.detectChanges();

    expect(component.getInstance()).toBeUndefined();
    expect(olTileLayer.getSource()).toBeNull();
  }));
});
