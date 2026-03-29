import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ObjectEvent } from 'ol/Object';
import { LoadFunction } from 'ol/Tile';
import { NearestDirectionFunction } from 'ol/array';
import BaseEvent from 'ol/events/Event';
import TileLayer from 'ol/layer/Tile';
import { Size } from 'ol/size';
import { AttributionLike } from 'ol/source/Source';
import { TileSourceEvent } from 'ol/source/Tile';
import TileJSON, { Config } from 'ol/source/TileJSON';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolTileLayerComponent } from '@workletjs/ngx-openlayers/layer/tile';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolTileJSONSourceComponent } from './tile-json-source.component';

// TileJSON requires either `url` or `tileJSON` to construct — use this as default
const DEFAULT_TILE_JSON_CONFIG: Config = {
  tilejson: '2.2.0' as const,
  tiles: ['https://a.example.com/{z}/{x}/{y}.png'],
  minzoom: 0,
  maxzoom: 2,
} as Config;

async function createTileJSONInstance(
  setup?: (c: TestTileJSONSourceComponent) => void,
): Promise<TileJSON> {
  const f = TestBed.createComponent(TestTileJSONSourceComponent);
  setup?.(f.componentInstance);
  f.detectChanges();
  await f.whenStable();
  return f.debugElement
    .query(By.directive(WolTileJSONSourceComponent))
    .componentInstance.getInstance() as TileJSON;
}

@Component({
  selector: 'wol-test-tile-json-source',
  imports: [WolMapComponent, WolViewComponent, WolTileLayerComponent, WolTileJSONSourceComponent],
  template: `
    <wol-map>
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="2" />
      <wol-tile-layer>
        @if (!destroySource()) {
          <wol-tile-json-source
            [wolAttributions]="attributions()"
            [wolCacheSize]="cacheSize()"
            [wolCrossOrigin]="crossOrigin()"
            [wolInterpolate]="interpolate()"
            [wolJsonp]="jsonp()"
            [wolReprojectionErrorThreshold]="reprojectionErrorThreshold()"
            [wolTileJSON]="tileJSON()"
            [wolTileLoadFunction]="tileLoadFunction()"
            [wolTileSize]="tileSize()"
            [wolUrl]="url()"
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
class TestTileJSONSourceComponent {
  attributions = signal<AttributionLike | undefined>(undefined);
  cacheSize = signal<number | undefined>(undefined);
  crossOrigin = signal<null | string | undefined>(undefined);
  interpolate = signal<boolean | undefined>(undefined);
  jsonp = signal<boolean | undefined>(undefined);
  reprojectionErrorThreshold = signal<number | undefined>(undefined);
  tileJSON = signal<Config | undefined>(DEFAULT_TILE_JSON_CONFIG);
  tileLoadFunction = signal<LoadFunction | undefined>(undefined);
  tileSize = signal<number | Size | undefined>(undefined);
  url = signal<string | undefined>(undefined);
  wrapX = signal<boolean | undefined>(undefined);
  transition = signal<number | undefined>(undefined);
  zDirection = signal<number | NearestDirectionFunction | undefined>(undefined);
  properties = signal<WolProperties | undefined>(undefined);
  destroySource = signal(false);
}

describe('WolTileJSONSourceComponent', () => {
  let fixture: ComponentFixture<TestTileJSONSourceComponent>;
  let testComponent: TestTileJSONSourceComponent;
  let component: WolTileJSONSourceComponent;
  let tileLayerComponent: WolTileLayerComponent;
  let tileJSON: TileJSON;
  let olTileLayer: TileLayer;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestTileJSONSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestTileJSONSourceComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    testComponent = fixture.componentInstance;
    component = fixture.debugElement.query(
      By.directive(WolTileJSONSourceComponent),
    ).componentInstance;
    tileLayerComponent = fixture.debugElement.query(
      By.directive(WolTileLayerComponent),
    ).componentInstance;
    tileJSON = component.getInstance() as TileJSON;
    olTileLayer = tileLayerComponent.getInstance() as TileLayer;
  });

  // --- Creation ---

  it('should create the TileJSON source', () => {
    expect(component).toBeTruthy();
    expect(tileJSON).toBeInstanceOf(TileJSON);
  });

  it('should register the source on the tile layer', fakeAsync(() => {
    flush();
    expect(olTileLayer.getSource()).toBe(tileJSON);
  }));

  // --- Initialization (per input) ---

  it('should initialize with wolAttributions', async () => {
    const inst = await createTileJSONInstance((c) => c.attributions.set('© Test'));
    expect(inst).toBeInstanceOf(TileJSON);
  });

  it('should initialize with wolCacheSize', async () => {
    const inst = await createTileJSONInstance((c) => c.cacheSize.set(128));
    expect(inst).toBeInstanceOf(TileJSON);
  });

  it('should initialize with wolCrossOrigin', async () => {
    const inst = await createTileJSONInstance((c) => c.crossOrigin.set('anonymous'));
    expect(inst).toBeInstanceOf(TileJSON);
  });

  it('should initialize with wolCrossOrigin = null', async () => {
    const inst = await createTileJSONInstance((c) => c.crossOrigin.set(null));
    expect(inst).toBeInstanceOf(TileJSON);
  });

  it('should initialize with wolInterpolate = false', async () => {
    const inst = await createTileJSONInstance((c) => c.interpolate.set(false));
    expect(inst).toBeInstanceOf(TileJSON);
  });

  it('should initialize with wolJsonp = true', async () => {
    const inst = await createTileJSONInstance((c) => c.jsonp.set(true));
    expect(inst).toBeInstanceOf(TileJSON);
  });

  it('should initialize with wolReprojectionErrorThreshold', async () => {
    const inst = await createTileJSONInstance((c) => c.reprojectionErrorThreshold.set(0.5));
    expect(inst).toBeInstanceOf(TileJSON);
  });

  it('should initialize with wolTileJSON config', async () => {
    const config = {
      tilejson: '2.1.0' as const,
      tiles: ['https://a.tiles.example.com/{z}/{x}/{y}.png'],
      minzoom: 0,
      maxzoom: 18,
    } as Config;
    const inst = await createTileJSONInstance((c) => c.tileJSON.set(config));
    expect(inst).toBeInstanceOf(TileJSON);
  });

  it('should initialize with wolTileLoadFunction', async () => {
    const fn = vi.fn() as unknown as LoadFunction;
    const inst = await createTileJSONInstance((c) => c.tileLoadFunction.set(fn));
    expect(inst).toBeInstanceOf(TileJSON);
  });

  it('should initialize with wolTileSize as number', async () => {
    const inst = await createTileJSONInstance((c) => c.tileSize.set(512));
    expect(inst).toBeInstanceOf(TileJSON);
  });

  it('should initialize with wolTileSize as Size', async () => {
    const inst = await createTileJSONInstance((c) => c.tileSize.set([512, 512]));
    expect(inst).toBeInstanceOf(TileJSON);
  });

  it('should initialize with wolWrapX = false', async () => {
    const inst = await createTileJSONInstance((c) => c.wrapX.set(false));
    expect(inst).toBeInstanceOf(TileJSON);
  });

  it('should initialize with wolTransition', async () => {
    const inst = await createTileJSONInstance((c) => c.transition.set(250));
    expect(inst).toBeInstanceOf(TileJSON);
  });

  it('should initialize with wolZDirection', async () => {
    const inst = await createTileJSONInstance((c) => c.zDirection.set(1));
    expect(inst).toBeInstanceOf(TileJSON);
  });

  it('should initialize with wolProperties', async () => {
    const inst = await createTileJSONInstance((c) => c.properties.set({ label: 'test-json' }));
    expect(inst.getProperties()).toMatchObject({ label: 'test-json' });
  });

  // --- ngOnChanges ---

  it('should update attributions when wolAttributions changes', () => {
    const spy = vi.spyOn(tileJSON, 'setAttributions');
    testComponent.attributions.set('© Updated');
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith('© Updated');
  });

  it('should update properties when wolProperties changes', () => {
    const spy = vi.spyOn(tileJSON, 'setProperties');
    const newProps: WolProperties = { updated: true };
    testComponent.properties.set(newProps);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(newProps, false);
  });

  it('should update tile load function when wolTileLoadFunction changes', () => {
    const spy = vi.spyOn(tileJSON, 'setTileLoadFunction');
    const fn = vi.fn() as unknown as LoadFunction;
    testComponent.tileLoadFunction.set(fn);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(fn);
  });

  it('should update url when wolUrl changes', () => {
    const spy = vi.spyOn(tileJSON, 'setUrl');
    testComponent.url.set('https://new.example.com/tiles.json');
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith('https://new.example.com/tiles.json');
  });

  // --- Outputs ---

  it('should emit wolChange when the source fires a change event', () => {
    const spy = vi.spyOn(component.wolChange, 'emit');
    const event = new BaseEvent('change');
    tileJSON.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolError when the source fires an error event', () => {
    const spy = vi.spyOn(component.wolError, 'emit');
    const event = new BaseEvent('error');
    tileJSON.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolPropertyChange when the source fires a propertychange event', () => {
    const spy = vi.spyOn(component.wolPropertyChange, 'emit');
    const event = new ObjectEvent('propertychange', 'key', undefined);
    tileJSON.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolTileLoadEnd when the source fires a tileloadend event', () => {
    const spy = vi.spyOn(component.wolTileLoadEnd, 'emit');
    const event = new TileSourceEvent('tileloadend', undefined as never);
    tileJSON.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolTileLoadError when the source fires a tileloaderror event', () => {
    const spy = vi.spyOn(component.wolTileLoadError, 'emit');
    const event = new TileSourceEvent('tileloaderror', undefined as never);
    tileJSON.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolTileLoadStart when the source fires a tileloadstart event', () => {
    const spy = vi.spyOn(component.wolTileLoadStart, 'emit');
    const event = new TileSourceEvent('tileloadstart', undefined as never);
    tileJSON.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  // --- Lifecycle / Destroy ---

  it('should remove the source from the tile layer when destroyed', fakeAsync(() => {
    flush();
    expect(olTileLayer.getSource()).toBe(tileJSON);

    testComponent.destroySource.set(true);
    fixture.detectChanges();

    expect(component.getInstance()).toBeUndefined();
    expect(olTileLayer.getSource()).toBeNull();
  }));
});
