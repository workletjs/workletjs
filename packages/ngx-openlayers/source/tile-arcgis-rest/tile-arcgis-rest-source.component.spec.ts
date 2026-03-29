import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ObjectEvent } from 'ol/Object';
import { LoadFunction } from 'ol/Tile';
import BaseEvent from 'ol/events/Event';
import TileLayer from 'ol/layer/Tile';
import { TileSourceEvent } from 'ol/source/Tile';
import TileArcGISRest from 'ol/source/TileArcGISRest';

import { WolProperties, WolSafeAny } from '@workletjs/ngx-openlayers/core/types';
import { WolTileLayerComponent } from '@workletjs/ngx-openlayers/layer/tile';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolTileArcGISRestSourceComponent } from './tile-arcgis-rest-source.component';

async function createTileArcGISRestInstance(
  setup?: (c: TestTileArcGISRestSourceComponent) => void,
): Promise<TileArcGISRest> {
  const f = TestBed.createComponent(TestTileArcGISRestSourceComponent);
  setup?.(f.componentInstance);
  f.detectChanges();
  await f.whenStable();
  return f.debugElement
    .query(By.directive(WolTileArcGISRestSourceComponent))
    .componentInstance.getInstance() as TileArcGISRest;
}

@Component({
  selector: 'wol-test-tile-arcgis-rest-source',
  imports: [
    WolMapComponent,
    WolViewComponent,
    WolTileLayerComponent,
    WolTileArcGISRestSourceComponent,
  ],
  template: `
    <wol-map>
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="2" />
      <wol-tile-layer>
        @if (!destroySource()) {
          <wol-tile-arcgis-rest-source
            [wolAttributions]="attributions()"
            [wolCacheSize]="cacheSize()"
            [wolCrossOrigin]="crossOrigin()"
            [wolInterpolate]="interpolate()"
            [wolParams]="params()"
            [wolHidpi]="hidpi()"
            [wolProjection]="projection()"
            [wolReprojectionErrorThreshold]="reprojectionErrorThreshold()"
            [wolTileLoadFunction]="tileLoadFunction()"
            [wolUrl]="url()"
            [wolWrapX]="wrapX()"
            [wolTransition]="transition()"
            [wolUrls]="urls()"
            [wolProperties]="properties()"
          />
        }
      </wol-tile-layer>
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestTileArcGISRestSourceComponent {
  attributions = signal<string | undefined>(undefined);
  cacheSize = signal<number | undefined>(undefined);
  crossOrigin = signal<string | null | undefined>(undefined);
  interpolate = signal<boolean | undefined>(undefined);
  params = signal<{ [key: string]: WolSafeAny } | undefined>(undefined);
  hidpi = signal<boolean | undefined>(undefined);
  projection = signal<string | undefined>(undefined);
  reprojectionErrorThreshold = signal<number | undefined>(undefined);
  tileLoadFunction = signal<LoadFunction | undefined>(undefined);
  url = signal<string | undefined>(undefined);
  wrapX = signal<boolean | undefined>(undefined);
  transition = signal<number | undefined>(undefined);
  urls = signal<string[] | undefined>(undefined);
  properties = signal<WolProperties | undefined>(undefined);
  destroySource = signal(false);
}

describe('WolTileArcGISRestSourceComponent', () => {
  let fixture: ComponentFixture<TestTileArcGISRestSourceComponent>;
  let testComponent: TestTileArcGISRestSourceComponent;
  let component: WolTileArcGISRestSourceComponent;
  let tileLayerComponent: WolTileLayerComponent;
  let tileArcGISRest: TileArcGISRest;
  let olTileLayer: TileLayer;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestTileArcGISRestSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestTileArcGISRestSourceComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    testComponent = fixture.componentInstance;
    component = fixture.debugElement.query(
      By.directive(WolTileArcGISRestSourceComponent),
    ).componentInstance;
    tileLayerComponent = fixture.debugElement.query(
      By.directive(WolTileLayerComponent),
    ).componentInstance;
    tileArcGISRest = component.getInstance() as TileArcGISRest;
    olTileLayer = tileLayerComponent.getInstance() as TileLayer;
  });

  // --- Creation ---

  it('should create the TileArcGISRest source', () => {
    expect(component).toBeTruthy();
    expect(tileArcGISRest).toBeInstanceOf(TileArcGISRest);
  });

  it('should register the source on the tile layer', fakeAsync(() => {
    flush();
    expect(olTileLayer.getSource()).toBe(tileArcGISRest);
  }));

  // --- Initialization (per input) ---

  it('should initialize with wolAttributions', async () => {
    const inst = await createTileArcGISRestInstance((c) => c.attributions.set('© ArcGIS'));
    expect(inst.getAttributions()).toBeTruthy();
  });

  it('should initialize with wolCacheSize', async () => {
    const inst = await createTileArcGISRestInstance((c) => c.cacheSize.set(256));
    expect(inst).toBeInstanceOf(TileArcGISRest);
  });

  it('should initialize with wolCrossOrigin', async () => {
    const inst = await createTileArcGISRestInstance((c) => c.crossOrigin.set('anonymous'));
    expect(inst).toBeInstanceOf(TileArcGISRest);
  });

  it('should initialize with wolInterpolate = false', async () => {
    const inst = await createTileArcGISRestInstance((c) => c.interpolate.set(false));
    expect(inst).toBeInstanceOf(TileArcGISRest);
  });

  it('should initialize with wolParams', async () => {
    const inst = await createTileArcGISRestInstance((c) =>
      c.params.set({ LAYERS: 'show:0,1', FORMAT: 'png32' }),
    );
    expect(inst.getParams()).toMatchObject({ LAYERS: 'show:0,1', FORMAT: 'png32' });
  });

  it('should initialize with wolHidpi = true', async () => {
    const inst = await createTileArcGISRestInstance((c) => c.hidpi.set(true));
    expect(inst).toBeInstanceOf(TileArcGISRest);
  });

  it('should initialize with wolProjection', async () => {
    const inst = await createTileArcGISRestInstance((c) => c.projection.set('EPSG:4326'));
    expect(inst).toBeInstanceOf(TileArcGISRest);
  });

  it('should initialize with wolReprojectionErrorThreshold', async () => {
    const inst = await createTileArcGISRestInstance((c) => c.reprojectionErrorThreshold.set(0.5));
    expect(inst).toBeInstanceOf(TileArcGISRest);
  });

  it('should initialize with wolTileLoadFunction', async () => {
    const fn: LoadFunction = vi.fn();
    const inst = await createTileArcGISRestInstance((c) => c.tileLoadFunction.set(fn));
    expect(inst.getTileLoadFunction()).toBe(fn);
  });

  it('should initialize with wolUrl', async () => {
    const inst = await createTileArcGISRestInstance((c) =>
      c.url.set(
        'https://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Specialty/ESRI_StateCityHighway_USA/MapServer',
      ),
    );
    expect(inst).toBeInstanceOf(TileArcGISRest);
  });

  it('should initialize with wolWrapX = false', async () => {
    const inst = await createTileArcGISRestInstance((c) => c.wrapX.set(false));
    expect(inst).toBeInstanceOf(TileArcGISRest);
  });

  it('should initialize with wolTransition', async () => {
    const inst = await createTileArcGISRestInstance((c) => c.transition.set(250));
    expect(inst).toBeInstanceOf(TileArcGISRest);
  });

  it('should initialize with wolUrls', async () => {
    const urls = ['https://server1.example.com/MapServer', 'https://server2.example.com/MapServer'];
    const inst = await createTileArcGISRestInstance((c) => c.urls.set(urls));
    expect(inst.getUrls()).toEqual(urls);
  });

  it('should initialize with wolProperties', async () => {
    const inst = await createTileArcGISRestInstance((c) =>
      c.properties.set({ label: 'test-arcgis' }),
    );
    expect(inst.getProperties()).toMatchObject({ label: 'test-arcgis' });
  });

  // --- ngOnChanges ---

  it('should update attributions when wolAttributions changes', () => {
    const spy = vi.spyOn(tileArcGISRest, 'setAttributions');
    testComponent.attributions.set('© Updated');
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith('© Updated');
  });

  it('should update params when wolParams changes', () => {
    const spy = vi.spyOn(tileArcGISRest, 'setParams');
    const newParams = { LAYERS: 'show:2', FORMAT: 'png8' };
    testComponent.params.set(newParams);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(newParams);
  });

  it('should update tileLoadFunction when wolTileLoadFunction changes', () => {
    const spy = vi.spyOn(tileArcGISRest, 'setTileLoadFunction');
    const fn: LoadFunction = vi.fn();
    testComponent.tileLoadFunction.set(fn);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(fn);
  });

  it('should update url when wolUrl changes', () => {
    const spy = vi.spyOn(tileArcGISRest, 'setUrl');
    const newUrl = 'https://new-server.example.com/MapServer';
    testComponent.url.set(newUrl);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(newUrl);
  });

  it('should update urls when wolUrls changes', () => {
    const spy = vi.spyOn(tileArcGISRest, 'setUrls');
    const newUrls = ['https://new1.example.com/MapServer', 'https://new2.example.com/MapServer'];
    testComponent.urls.set(newUrls);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(newUrls);
  });

  it('should update properties when wolProperties changes', () => {
    const spy = vi.spyOn(tileArcGISRest, 'setProperties');
    const newProps: WolProperties = { updated: true };
    testComponent.properties.set(newProps);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(newProps);
  });

  // --- Outputs ---

  it('should emit wolChange when the source fires a change event', () => {
    const spy = vi.spyOn(component.wolChange, 'emit');
    const event = new BaseEvent('change');
    tileArcGISRest.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolError when the source fires an error event', () => {
    const spy = vi.spyOn(component.wolError, 'emit');
    const event = new BaseEvent('error');
    tileArcGISRest.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolPropertyChange when the source fires a propertychange event', () => {
    const spy = vi.spyOn(component.wolPropertyChange, 'emit');
    const event = new ObjectEvent('propertychange', 'key', undefined);
    tileArcGISRest.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolTileLoadEnd when the source fires a tileloadend event', () => {
    const spy = vi.spyOn(component.wolTileLoadEnd, 'emit');
    const event = new TileSourceEvent('tileloadend', undefined as never);
    tileArcGISRest.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolTileLoadError when the source fires a tileloaderror event', () => {
    const spy = vi.spyOn(component.wolTileLoadError, 'emit');
    const event = new TileSourceEvent('tileloaderror', undefined as never);
    tileArcGISRest.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolTileLoadStart when the source fires a tileloadstart event', () => {
    const spy = vi.spyOn(component.wolTileLoadStart, 'emit');
    const event = new TileSourceEvent('tileloadstart', undefined as never);
    tileArcGISRest.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  // --- Lifecycle / Destroy ---

  it('should remove the source from the tile layer when destroyed', fakeAsync(() => {
    flush();
    expect(olTileLayer.getSource()).toBe(tileArcGISRest);

    testComponent.destroySource.set(true);
    fixture.detectChanges();

    expect(component.getInstance()).toBeUndefined();
    expect(olTileLayer.getSource()).toBeNull();
  }));
});
