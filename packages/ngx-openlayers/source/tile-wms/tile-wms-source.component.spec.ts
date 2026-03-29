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
import TileWMS from 'ol/source/TileWMS';
import { ServerType } from 'ol/source/wms';
import TileGrid from 'ol/tilegrid/TileGrid';

import { WolProperties, WolSafeAny } from '@workletjs/ngx-openlayers/core/types';
import { WolTileLayerComponent } from '@workletjs/ngx-openlayers/layer/tile';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolTileWMSSourceComponent } from './tile-wms-source.component';

const DEFAULT_PARAMS = { LAYERS: 'test-layer', VERSION: '1.3.0' };

async function createTileWMSInstance(
  setup?: (c: TestTileWMSSourceComponent) => void,
): Promise<TileWMS> {
  const f = TestBed.createComponent(TestTileWMSSourceComponent);
  setup?.(f.componentInstance);
  f.detectChanges();
  await f.whenStable();
  return f.debugElement
    .query(By.directive(WolTileWMSSourceComponent))
    .componentInstance.getInstance() as TileWMS;
}

@Component({
  selector: 'wol-test-tile-wms-source',
  imports: [WolMapComponent, WolViewComponent, WolTileLayerComponent, WolTileWMSSourceComponent],
  template: `
    <wol-map>
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="2" />
      <wol-tile-layer>
        @if (!destroySource()) {
          <wol-tile-wms-source
            [wolParams]="params()"
            [wolAttributions]="attributions()"
            [wolAtrributionCollapsible]="attributionsCollapsible()"
            [wolCacheSize]="cacheSize()"
            [wolCrossOrigin]="crossOrigin()"
            [wolInterpolate]="interpolate()"
            [wolGutter]="gutter()"
            [wolHidpi]="hidpi()"
            [wolProjection]="projection()"
            [wolReprojectionErrorThreshold]="reprojectionErrorThreshold()"
            [wolTileClass]="tileClass()"
            [wolTileGrid]="tileGrid()"
            [wolServerType]="serverType()"
            [wolTileLoadFunction]="tileLoadFunction()"
            [wolUrl]="url()"
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
class TestTileWMSSourceComponent {
  params = signal<{ [x: string]: WolSafeAny }>(DEFAULT_PARAMS);
  attributions = signal<AttributionLike | undefined>(undefined);
  attributionsCollapsible = signal<boolean | undefined>(undefined);
  cacheSize = signal<number | undefined>(undefined);
  crossOrigin = signal<string | null | undefined>(undefined);
  interpolate = signal<boolean | undefined>(undefined);
  gutter = signal<number | undefined>(undefined);
  hidpi = signal<boolean | undefined>(undefined);
  projection = signal<string | undefined>(undefined);
  reprojectionErrorThreshold = signal<number | undefined>(undefined);
  tileClass = signal<typeof ImageTile | undefined>(undefined);
  tileGrid = signal<TileGrid | undefined>(undefined);
  serverType = signal<ServerType | undefined>(undefined);
  tileLoadFunction = signal<LoadFunction | undefined>(undefined);
  url = signal<string | undefined>('https://wms.example.com/ows');
  urls = signal<string[] | undefined>(undefined);
  wrapX = signal<boolean | undefined>(undefined);
  transition = signal<number | undefined>(undefined);
  zDirection = signal<number | NearestDirectionFunction | undefined>(undefined);
  properties = signal<WolProperties | undefined>(undefined);
  destroySource = signal(false);
}

describe('WolTileWMSSourceComponent', () => {
  let fixture: ComponentFixture<TestTileWMSSourceComponent>;
  let testComponent: TestTileWMSSourceComponent;
  let component: WolTileWMSSourceComponent;
  let tileLayerComponent: WolTileLayerComponent;
  let tileWMS: TileWMS;
  let olTileLayer: TileLayer;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestTileWMSSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestTileWMSSourceComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    testComponent = fixture.componentInstance;
    component = fixture.debugElement.query(
      By.directive(WolTileWMSSourceComponent),
    ).componentInstance;
    tileLayerComponent = fixture.debugElement.query(
      By.directive(WolTileLayerComponent),
    ).componentInstance;
    tileWMS = component.getInstance() as TileWMS;
    olTileLayer = tileLayerComponent.getInstance() as TileLayer;
  });

  // --- Creation ---

  it('should create the TileWMS source', () => {
    expect(component).toBeTruthy();
    expect(tileWMS).toBeInstanceOf(TileWMS);
  });

  it('should register the source on the tile layer', fakeAsync(() => {
    flush();
    expect(olTileLayer.getSource()).toBe(tileWMS);
  }));

  // --- Initialization (per input) ---

  it('should initialize with wolAttributions', async () => {
    const inst = await createTileWMSInstance((c) => c.attributions.set('© Test'));
    expect(inst).toBeInstanceOf(TileWMS);
  });

  it('should initialize with wolAtrributionCollapsible = false', async () => {
    const inst = await createTileWMSInstance((c) => c.attributionsCollapsible.set(false));
    expect(inst).toBeInstanceOf(TileWMS);
  });

  it('should initialize with wolCacheSize', async () => {
    const inst = await createTileWMSInstance((c) => c.cacheSize.set(128));
    expect(inst).toBeInstanceOf(TileWMS);
  });

  it('should initialize with wolCrossOrigin', async () => {
    const inst = await createTileWMSInstance((c) => c.crossOrigin.set('anonymous'));
    expect(inst).toBeInstanceOf(TileWMS);
  });

  it('should initialize with wolCrossOrigin = null', async () => {
    const inst = await createTileWMSInstance((c) => c.crossOrigin.set(null));
    expect(inst).toBeInstanceOf(TileWMS);
  });

  it('should initialize with wolInterpolate = false', async () => {
    const inst = await createTileWMSInstance((c) => c.interpolate.set(false));
    expect(inst).toBeInstanceOf(TileWMS);
  });

  it('should initialize with wolGutter', async () => {
    const inst = await createTileWMSInstance((c) => c.gutter.set(8));
    expect(inst).toBeInstanceOf(TileWMS);
  });

  it('should initialize with wolHidpi = true', async () => {
    const inst = await createTileWMSInstance((c) => c.hidpi.set(true));
    expect(inst).toBeInstanceOf(TileWMS);
  });

  it('should initialize with wolProjection', async () => {
    const inst = await createTileWMSInstance((c) => c.projection.set('EPSG:4326'));
    expect(inst).toBeInstanceOf(TileWMS);
  });

  it('should initialize with wolReprojectionErrorThreshold', async () => {
    const inst = await createTileWMSInstance((c) => c.reprojectionErrorThreshold.set(0.5));
    expect(inst).toBeInstanceOf(TileWMS);
  });

  it('should initialize with wolTileGrid', async () => {
    const grid = new TileGrid({ resolutions: [1], origin: [0, 0] });
    const inst = await createTileWMSInstance((c) => c.tileGrid.set(grid));
    expect(inst).toBeInstanceOf(TileWMS);
  });

  it('should initialize with wolServerType', async () => {
    const inst = await createTileWMSInstance((c) => c.serverType.set('geoserver'));
    expect(inst).toBeInstanceOf(TileWMS);
  });

  it('should initialize with wolUrls', async () => {
    const inst = await createTileWMSInstance((c) => {
      c.url.set(undefined);
      c.urls.set(['https://a.example.com/wms', 'https://b.example.com/wms']);
    });
    expect(inst).toBeInstanceOf(TileWMS);
  });

  it('should initialize with wolWrapX = false', async () => {
    const inst = await createTileWMSInstance((c) => c.wrapX.set(false));
    expect(inst).toBeInstanceOf(TileWMS);
  });

  it('should initialize with wolTransition', async () => {
    const inst = await createTileWMSInstance((c) => c.transition.set(250));
    expect(inst).toBeInstanceOf(TileWMS);
  });

  it('should initialize with wolZDirection', async () => {
    const inst = await createTileWMSInstance((c) => c.zDirection.set(1));
    expect(inst).toBeInstanceOf(TileWMS);
  });

  it('should initialize with wolProperties', async () => {
    const inst = await createTileWMSInstance((c) => c.properties.set({ label: 'test-wms' }));
    expect(inst.getProperties()).toMatchObject({ label: 'test-wms' });
  });

  // --- ngOnChanges ---

  it('should update attributions when wolAttributions changes', () => {
    const spy = vi.spyOn(tileWMS, 'setAttributions');
    testComponent.attributions.set('© Updated');
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith('© Updated');
  });

  it('should update params when wolParams changes', () => {
    const spy = vi.spyOn(tileWMS, 'setParams');
    const newParams = { LAYERS: 'new-layer', VERSION: '1.1.1' };
    testComponent.params.set(newParams);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(newParams);
  });

  it('should update properties when wolProperties changes', () => {
    const spy = vi.spyOn(tileWMS, 'setProperties');
    const newProps: WolProperties = { updated: true };
    testComponent.properties.set(newProps);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(newProps);
  });

  it('should update tile load function when wolTileLoadFunction changes', () => {
    const spy = vi.spyOn(tileWMS, 'setTileLoadFunction');
    const fn = vi.fn() as unknown as LoadFunction;
    testComponent.tileLoadFunction.set(fn);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(fn);
  });

  it('should update url when wolUrl changes', () => {
    const spy = vi.spyOn(tileWMS, 'setUrl');
    testComponent.url.set('https://updated.example.com/wms');
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith('https://updated.example.com/wms');
  });

  it('should update urls when wolUrls changes', () => {
    const spy = vi.spyOn(tileWMS, 'setUrls');
    const newUrls = ['https://a.example.com/wms', 'https://b.example.com/wms'];
    testComponent.urls.set(newUrls);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(newUrls);
  });

  // --- Outputs ---

  it('should emit wolChange when the source fires a change event', () => {
    const spy = vi.spyOn(component.wolChange, 'emit');
    const event = new BaseEvent('change');
    tileWMS.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolError when the source fires an error event', () => {
    const spy = vi.spyOn(component.wolError, 'emit');
    const event = new BaseEvent('error');
    tileWMS.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolPropertyChange when the source fires a propertychange event', () => {
    const spy = vi.spyOn(component.wolPropertyChange, 'emit');
    const event = new ObjectEvent('propertychange', 'key', undefined);
    tileWMS.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolTileLoadEnd when the source fires a tileloadend event', () => {
    const spy = vi.spyOn(component.wolTileLoadEnd, 'emit');
    const event = new TileSourceEvent('tileloadend', undefined as never);
    tileWMS.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolTileLoadError when the source fires a tileloaderror event', () => {
    const spy = vi.spyOn(component.wolTileLoadError, 'emit');
    const event = new TileSourceEvent('tileloaderror', undefined as never);
    tileWMS.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolTileLoadStart when the source fires a tileloadstart event', () => {
    const spy = vi.spyOn(component.wolTileLoadStart, 'emit');
    const event = new TileSourceEvent('tileloadstart', undefined as never);
    tileWMS.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  // --- Lifecycle / Destroy ---

  it('should remove the source from the tile layer when destroyed', fakeAsync(() => {
    flush();
    expect(olTileLayer.getSource()).toBe(tileWMS);

    testComponent.destroySource.set(true);
    fixture.detectChanges();

    expect(component.getInstance()).toBeUndefined();
    expect(olTileLayer.getSource()).toBeNull();
  }));
});
