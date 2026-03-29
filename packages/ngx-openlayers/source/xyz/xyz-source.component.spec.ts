import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ObjectEvent } from 'ol/Object';
import { LoadFunction, UrlFunction } from 'ol/Tile';
import { NearestDirectionFunction } from 'ol/array';
import BaseEvent from 'ol/events/Event';
import TileLayer from 'ol/layer/Tile';
import { Size } from 'ol/size';
import { AttributionLike } from 'ol/source/Source';
import { TileSourceEvent } from 'ol/source/Tile';
import XYZ from 'ol/source/XYZ';
import TileGrid from 'ol/tilegrid/TileGrid';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolTileLayerComponent } from '@workletjs/ngx-openlayers/layer/tile';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolXYZSourceComponent } from './xyz-source.component';

async function createXYZInstance(setup?: (c: TestXYZSourceComponent) => void): Promise<XYZ> {
  const f = TestBed.createComponent(TestXYZSourceComponent);
  setup?.(f.componentInstance);
  f.detectChanges();
  await f.whenStable();
  return f.debugElement
    .query(By.directive(WolXYZSourceComponent))
    .componentInstance.getInstance() as XYZ;
}

@Component({
  selector: 'wol-test-xyz-source',
  imports: [WolMapComponent, WolViewComponent, WolTileLayerComponent, WolXYZSourceComponent],
  template: `
    <wol-map>
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="2" />
      <wol-tile-layer>
        @if (!destroySource()) {
          <wol-xyz-source
            [wolUrl]="url()"
            [wolAttributions]="attributions()"
            [wolAttributionsCollapsible]="attributionsCollapsible()"
            [wolCacheSize]="cacheSize()"
            [wolCrossOrigin]="crossOrigin()"
            [wolInterpolate]="interpolate()"
            [wolProjection]="projection()"
            [wolReprojectionErrorThreshold]="reprojectionErrorThreshold()"
            [wolMaxZoom]="maxZoom()"
            [wolMinZoom]="minZoom()"
            [wolMaxResolution]="maxResolution()"
            [wolTileGrid]="tileGrid()"
            [wolTileLoadFunction]="tileLoadFunction()"
            [wolTilePixelRatio]="tilePixelRatio()"
            [wolTileSize]="tileSize()"
            [wolGutter]="gutter()"
            [wolTileUrlFunction]="tileUrlFunction()"
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
class TestXYZSourceComponent {
  url = signal<string | undefined>('https://tile.example.com/{z}/{x}/{y}.png');
  attributions = signal<AttributionLike | undefined>(undefined);
  attributionsCollapsible = signal<boolean | undefined>(undefined);
  cacheSize = signal<number | undefined>(undefined);
  crossOrigin = signal<string | null | undefined>(undefined);
  interpolate = signal<boolean | undefined>(undefined);
  projection = signal<string | undefined>(undefined);
  reprojectionErrorThreshold = signal<number | undefined>(undefined);
  maxZoom = signal<number | undefined>(undefined);
  minZoom = signal<number | undefined>(undefined);
  maxResolution = signal<number | undefined>(undefined);
  tileGrid = signal<TileGrid | undefined>(undefined);
  tileLoadFunction = signal<LoadFunction | undefined>(undefined);
  tilePixelRatio = signal<number | undefined>(undefined);
  tileSize = signal<number | Size | undefined>(undefined);
  gutter = signal<number | undefined>(undefined);
  tileUrlFunction = signal<UrlFunction | undefined>(undefined);
  urls = signal<string[] | undefined>(undefined);
  wrapX = signal<boolean | undefined>(undefined);
  transition = signal<number | undefined>(undefined);
  zDirection = signal<number | NearestDirectionFunction | undefined>(undefined);
  properties = signal<WolProperties | undefined>(undefined);
  destroySource = signal(false);
}

describe('WolXYZSourceComponent', () => {
  let fixture: ComponentFixture<TestXYZSourceComponent>;
  let testComponent: TestXYZSourceComponent;
  let component: WolXYZSourceComponent;
  let tileLayerComponent: WolTileLayerComponent;
  let xyz: XYZ;
  let olTileLayer: TileLayer;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestXYZSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestXYZSourceComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    testComponent = fixture.componentInstance;
    component = fixture.debugElement.query(By.directive(WolXYZSourceComponent)).componentInstance;
    tileLayerComponent = fixture.debugElement.query(
      By.directive(WolTileLayerComponent),
    ).componentInstance;
    xyz = component.getInstance() as XYZ;
    olTileLayer = tileLayerComponent.getInstance() as TileLayer;
  });

  // --- Creation ---

  it('should create the XYZ source', () => {
    expect(component).toBeTruthy();
    expect(xyz).toBeInstanceOf(XYZ);
  });

  it('should register the source on the tile layer', fakeAsync(() => {
    flush();
    expect(olTileLayer.getSource()).toBe(xyz);
  }));

  // --- Initialization (per input) ---

  it('should initialize with wolAttributions', async () => {
    const inst = await createXYZInstance((c) => c.attributions.set('© Test'));
    expect(inst).toBeInstanceOf(XYZ);
  });

  it('should initialize with wolAttributionsCollapsible = false', async () => {
    const inst = await createXYZInstance((c) => c.attributionsCollapsible.set(false));
    expect(inst).toBeInstanceOf(XYZ);
  });

  it('should initialize with wolCacheSize', async () => {
    const inst = await createXYZInstance((c) => c.cacheSize.set(128));
    expect(inst).toBeInstanceOf(XYZ);
  });

  it('should initialize with wolCrossOrigin', async () => {
    const inst = await createXYZInstance((c) => c.crossOrigin.set('anonymous'));
    expect(inst).toBeInstanceOf(XYZ);
  });

  it('should initialize with wolCrossOrigin = null', async () => {
    const inst = await createXYZInstance((c) => c.crossOrigin.set(null));
    expect(inst).toBeInstanceOf(XYZ);
  });

  it('should initialize with wolInterpolate = false', async () => {
    const inst = await createXYZInstance((c) => c.interpolate.set(false));
    expect(inst).toBeInstanceOf(XYZ);
  });

  it('should initialize with wolProjection', async () => {
    const inst = await createXYZInstance((c) => c.projection.set('EPSG:4326'));
    expect(inst).toBeInstanceOf(XYZ);
  });

  it('should initialize with wolReprojectionErrorThreshold', async () => {
    const inst = await createXYZInstance((c) => c.reprojectionErrorThreshold.set(0.5));
    expect(inst).toBeInstanceOf(XYZ);
  });

  it('should initialize with wolMaxZoom', async () => {
    const inst = await createXYZInstance((c) => c.maxZoom.set(18));
    expect(inst).toBeInstanceOf(XYZ);
  });

  it('should initialize with wolMinZoom', async () => {
    const inst = await createXYZInstance((c) => c.minZoom.set(2));
    expect(inst).toBeInstanceOf(XYZ);
  });

  it('should initialize with wolMaxResolution', async () => {
    const inst = await createXYZInstance((c) => c.maxResolution.set(156543.0339));
    expect(inst).toBeInstanceOf(XYZ);
  });

  it('should initialize with wolTileGrid', async () => {
    const grid = new TileGrid({ resolutions: [1], origin: [0, 0] });
    const inst = await createXYZInstance((c) => c.tileGrid.set(grid));
    expect(inst).toBeInstanceOf(XYZ);
  });

  it('should initialize with wolTileLoadFunction', async () => {
    const fn = vi.fn() as unknown as LoadFunction;
    const inst = await createXYZInstance((c) => c.tileLoadFunction.set(fn));
    expect(inst).toBeInstanceOf(XYZ);
  });

  it('should initialize with wolTilePixelRatio', async () => {
    const inst = await createXYZInstance((c) => c.tilePixelRatio.set(2));
    expect(inst).toBeInstanceOf(XYZ);
  });

  it('should initialize with wolTileSize as number', async () => {
    const inst = await createXYZInstance((c) => c.tileSize.set(512));
    expect(inst).toBeInstanceOf(XYZ);
  });

  it('should initialize with wolTileSize as Size', async () => {
    const inst = await createXYZInstance((c) => c.tileSize.set([512, 512]));
    expect(inst).toBeInstanceOf(XYZ);
  });

  it('should initialize with wolGutter', async () => {
    const inst = await createXYZInstance((c) => c.gutter.set(8));
    expect(inst).toBeInstanceOf(XYZ);
  });

  it('should initialize with wolTileUrlFunction', async () => {
    const fn = vi.fn() as unknown as UrlFunction;
    const inst = await createXYZInstance((c) => {
      c.url.set(undefined);
      c.tileUrlFunction.set(fn);
    });
    expect(inst).toBeInstanceOf(XYZ);
  });

  it('should initialize with wolUrls', async () => {
    const inst = await createXYZInstance((c) => {
      c.url.set(undefined);
      c.urls.set([
        'https://a.tile.example.com/{z}/{x}/{y}.png',
        'https://b.tile.example.com/{z}/{x}/{y}.png',
      ]);
    });
    expect(inst).toBeInstanceOf(XYZ);
  });

  it('should initialize with wolWrapX = false', async () => {
    const inst = await createXYZInstance((c) => c.wrapX.set(false));
    expect(inst).toBeInstanceOf(XYZ);
  });

  it('should initialize with wolTransition', async () => {
    const inst = await createXYZInstance((c) => c.transition.set(250));
    expect(inst).toBeInstanceOf(XYZ);
  });

  it('should initialize with wolZDirection', async () => {
    const inst = await createXYZInstance((c) => c.zDirection.set(1));
    expect(inst).toBeInstanceOf(XYZ);
  });

  it('should initialize with wolProperties', async () => {
    const inst = await createXYZInstance((c) => c.properties.set({ label: 'test-xyz' }));
    expect(inst.getProperties()).toMatchObject({ label: 'test-xyz' });
  });

  // --- ngOnChanges ---

  it('should update attributions when wolAttributions changes', () => {
    const spy = vi.spyOn(xyz, 'setAttributions');
    testComponent.attributions.set('© Updated');
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith('© Updated');
  });

  it('should update properties when wolProperties changes', () => {
    const spy = vi.spyOn(xyz, 'setProperties');
    const newProps: WolProperties = { updated: true };
    testComponent.properties.set(newProps);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(newProps);
  });

  it('should update url when wolUrl changes', () => {
    const spy = vi.spyOn(xyz, 'setUrl');
    testComponent.url.set('https://updated.tile.example.com/{z}/{x}/{y}.png');
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith('https://updated.tile.example.com/{z}/{x}/{y}.png');
  });

  it('should update urls when wolUrls changes', () => {
    const spy = vi.spyOn(xyz, 'setUrls');
    const newUrls = [
      'https://a.tile.example.com/{z}/{x}/{y}.png',
      'https://b.tile.example.com/{z}/{x}/{y}.png',
    ];
    testComponent.urls.set(newUrls);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(newUrls);
  });

  it('should update tile grid for projection when both wolTileGrid and wolProjection are set', () => {
    const spy = vi.spyOn(xyz, 'setTileGridForProjection');
    const grid = new TileGrid({ resolutions: [1], origin: [0, 0] });
    testComponent.projection.set('EPSG:4326');
    testComponent.tileGrid.set(grid);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith('EPSG:4326', grid);
  });

  // --- Outputs ---

  it('should emit wolChange when the source fires a change event', () => {
    const spy = vi.spyOn(component.wolChange, 'emit');
    const event = new BaseEvent('change');
    xyz.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolError when the source fires an error event', () => {
    const spy = vi.spyOn(component.wolError, 'emit');
    const event = new BaseEvent('error');
    xyz.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolPropertyChange when the source fires a propertychange event', () => {
    const spy = vi.spyOn(component.wolPropertyChange, 'emit');
    const event = new ObjectEvent('propertychange', 'key', undefined);
    xyz.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolTileLoadEnd when the source fires a tileloadend event', () => {
    const spy = vi.spyOn(component.wolTileLoadEnd, 'emit');
    const event = new TileSourceEvent('tileloadend', undefined as never);
    xyz.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolTileLoadError when the source fires a tileloaderror event', () => {
    const spy = vi.spyOn(component.wolTileLoadError, 'emit');
    const event = new TileSourceEvent('tileloaderror', undefined as never);
    xyz.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolTileLoadStart when the source fires a tileloadstart event', () => {
    const spy = vi.spyOn(component.wolTileLoadStart, 'emit');
    const event = new TileSourceEvent('tileloadstart', undefined as never);
    xyz.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  // --- Lifecycle / Destroy ---

  it('should remove the source from the tile layer when destroyed', fakeAsync(() => {
    flush();
    expect(olTileLayer.getSource()).toBe(xyz);

    testComponent.destroySource.set(true);
    fixture.detectChanges();

    expect(component.getInstance()).toBeUndefined();
    expect(olTileLayer.getSource()).toBeNull();
  }));
});
