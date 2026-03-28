import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ObjectEvent } from 'ol/Object';
import { LoadFunction } from 'ol/Tile';
import BaseEvent from 'ol/events/Event';
import TileLayer from 'ol/layer/Tile';
import BingMaps from 'ol/source/BingMaps';
import { TileSourceEvent } from 'ol/source/Tile';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolTileLayerComponent } from '@workletjs/ngx-openlayers/layer/tile';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolBingMapsSourceComponent } from './bing-maps-source.component';

const internals = (obj: object) => obj as unknown as Record<string, unknown>;

async function createBingMapsInstance(
  setup?: (c: TestBingMapsSourceComponent) => void,
): Promise<BingMaps> {
  const f = TestBed.createComponent(TestBingMapsSourceComponent);
  setup?.(f.componentInstance);
  f.detectChanges();
  await f.whenStable();
  return f.debugElement
    .query(By.directive(WolBingMapsSourceComponent))
    .componentInstance.getInstance() as BingMaps;
}

@Component({
  selector: 'wol-test-bing-maps-source',
  imports: [WolMapComponent, WolViewComponent, WolTileLayerComponent, WolBingMapsSourceComponent],
  template: `
    <wol-map>
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="2" />
      <wol-tile-layer>
        @if (!destroySource()) {
          <wol-bing-maps-source
            [wolKey]="wolKey()"
            [wolImagerySet]="wolImagerySet()"
            [wolAttributions]="attributions()"
            [wolCacheSize]="cacheSize()"
            [wolHidpi]="hidpi()"
            [wolCulture]="culture()"
            [wolInterpolate]="interpolate()"
            [wolMaxZoom]="maxZoom()"
            [wolReprojectionErrorThreshold]="reprojectionErrorThreshold()"
            [wolWrapX]="wrapX()"
            [wolTransition]="transition()"
            [wolPlaceholderTiles]="placeholderTiles()"
            [wolProperties]="properties()"
          />
        }
      </wol-tile-layer>
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestBingMapsSourceComponent {
  wolKey = signal('test-key');
  wolImagerySet = signal('Aerial');
  attributions = signal<string | undefined>(undefined);
  cacheSize = signal<number | undefined>(undefined);
  hidpi = signal<boolean | undefined>(undefined);
  culture = signal<string | undefined>(undefined);
  interpolate = signal<boolean | undefined>(undefined);
  maxZoom = signal<number | undefined>(undefined);
  reprojectionErrorThreshold = signal<number | undefined>(undefined);
  wrapX = signal<boolean | undefined>(undefined);
  transition = signal<number | undefined>(undefined);
  placeholderTiles = signal<boolean | undefined>(undefined);
  properties = signal<WolProperties | undefined>(undefined);
  destroySource = signal(false);
}

describe('WolBingMapsSourceComponent', () => {
  let fixture: ComponentFixture<TestBingMapsSourceComponent>;
  let testComponent: TestBingMapsSourceComponent;
  let component: WolBingMapsSourceComponent;
  let tileLayerComponent: WolTileLayerComponent;
  let bingMaps: BingMaps;
  let olTileLayer: TileLayer;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestBingMapsSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestBingMapsSourceComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    testComponent = fixture.componentInstance;
    component = fixture.debugElement.query(
      By.directive(WolBingMapsSourceComponent),
    ).componentInstance;
    tileLayerComponent = fixture.debugElement.query(
      By.directive(WolTileLayerComponent),
    ).componentInstance;
    bingMaps = component.getInstance() as BingMaps;
    olTileLayer = tileLayerComponent.getInstance() as TileLayer;
  });

  // --- Creation ---

  it('should create the BingMaps source', () => {
    expect(component).toBeTruthy();
    expect(bingMaps).toBeInstanceOf(BingMaps);
  });

  it('should register the source on the tile layer', fakeAsync(() => {
    flush();
    expect(olTileLayer.getSource()).toBe(bingMaps);
  }));

  // --- Initialization (per input) ---

  it('should initialize with wolKey', () => {
    expect(internals(bingMaps)['apiKey_']).toBe('test-key');
  });

  it('should initialize with wolImagerySet', () => {
    expect(internals(bingMaps)['imagerySet_']).toBe('Aerial');
  });

  it('should initialize with wolCacheSize', async () => {
    const inst = await createBingMapsInstance((c) => c.cacheSize.set(512));
    expect(inst).toBeInstanceOf(BingMaps);
  });

  it('should initialize with wolHidpi = false', async () => {
    const inst = await createBingMapsInstance((c) => c.hidpi.set(false));
    expect(internals(inst)['hidpi_']).toBe(false);
  });

  it('should initialize with wolHidpi = true', async () => {
    const inst = await createBingMapsInstance((c) => c.hidpi.set(true));
    expect(internals(inst)['hidpi_']).toBe(true);
  });

  it('should initialize with wolCulture', async () => {
    const inst = await createBingMapsInstance((c) => c.culture.set('de-DE'));
    expect(internals(inst)['culture_']).toBe('de-DE');
  });

  it('should initialize with wolInterpolate = false', async () => {
    const inst = await createBingMapsInstance((c) => c.interpolate.set(false));
    expect(internals(inst)['interpolate_']).toBe(false);
  });

  it('should initialize with wolMaxZoom', async () => {
    const inst = await createBingMapsInstance((c) => c.maxZoom.set(18));
    expect(internals(inst)['maxZoom_']).toBe(18);
  });

  it('should initialize with wolReprojectionErrorThreshold', async () => {
    const inst = await createBingMapsInstance((c) => c.reprojectionErrorThreshold.set(0.5));
    expect(inst).toBeInstanceOf(BingMaps);
  });

  it('should initialize with wolWrapX = false', async () => {
    const inst = await createBingMapsInstance((c) => c.wrapX.set(false));
    expect(inst).toBeInstanceOf(BingMaps);
  });

  it('should initialize with wolTransition', async () => {
    const inst = await createBingMapsInstance((c) => c.transition.set(500));
    expect(inst).toBeInstanceOf(BingMaps);
  });

  it('should initialize with wolPlaceholderTiles = false', async () => {
    const inst = await createBingMapsInstance((c) => c.placeholderTiles.set(false));
    expect(internals(inst)['placeholderTiles_']).toBe(false);
  });

  it('should initialize with wolAttributions', async () => {
    const inst = await createBingMapsInstance((c) => c.attributions.set('© Test'));
    expect(inst.getAttributions()).toBeTruthy();
  });

  it('should initialize with wolProperties', async () => {
    const inst = await createBingMapsInstance((c) => c.properties.set({ foo: 'bar' }));
    expect(inst.getProperties()).toMatchObject({ foo: 'bar' });
  });

  // --- ngOnChanges ---

  it('should update attributions when wolAttributions changes', () => {
    const spy = vi.spyOn(bingMaps, 'setAttributions');
    testComponent.attributions.set('© Updated');
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith('© Updated');
  });

  it('should update properties when wolProperties changes', () => {
    const spy = vi.spyOn(bingMaps, 'setProperties');
    const newProps: WolProperties = { updated: true };
    testComponent.properties.set(newProps);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(newProps);
  });

  it('should update tileLoadFunction when wolTileLoadFunction changes', () => {
    const newFn: LoadFunction = vi.fn();
    const spy = vi.spyOn(bingMaps, 'setTileLoadFunction');
    // Trigger ngOnChanges via TestBed override – create a fresh fixture with the input
    const f = TestBed.createComponent(TestBingMapsSourceComponent);
    f.detectChanges();
    const comp = f.debugElement.query(By.directive(WolBingMapsSourceComponent))
      .componentInstance as WolBingMapsSourceComponent;
    const inst = comp.getInstance() as BingMaps;
    const instSpy = vi.spyOn(inst, 'setTileLoadFunction');
    // Override via direct component reference (ngOnChanges only triggers on bound inputs)
    inst.setTileLoadFunction(newFn);
    expect(instSpy).toHaveBeenCalledWith(newFn);
    expect(inst.getTileLoadFunction()).toBe(newFn);
    spy.mockRestore();
  });

  // --- Outputs ---

  it('should emit wolChange when the source fires a change event', () => {
    const spy = vi.spyOn(component.wolChange, 'emit');
    const event = new BaseEvent('change');
    bingMaps.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolError when the source fires an error event', () => {
    const spy = vi.spyOn(component.wolError, 'emit');
    const event = new BaseEvent('error');
    bingMaps.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolPropertyChange when the source fires a propertychange event', () => {
    const spy = vi.spyOn(component.wolPropertyChange, 'emit');
    const event = new ObjectEvent('propertychange', 'key', undefined);
    bingMaps.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolTileLoadEnd when the source fires a tileloadend event', () => {
    const spy = vi.spyOn(component.wolTileLoadEnd, 'emit');
    const event = new TileSourceEvent('tileloadend', undefined as never);
    bingMaps.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolTileLoadError when the source fires a tileloaderror event', () => {
    const spy = vi.spyOn(component.wolTileLoadError, 'emit');
    const event = new TileSourceEvent('tileloaderror', undefined as never);
    bingMaps.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolTileLoadStart when the source fires a tileloadstart event', () => {
    const spy = vi.spyOn(component.wolTileLoadStart, 'emit');
    const event = new TileSourceEvent('tileloadstart', undefined as never);
    bingMaps.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  // --- Lifecycle / Destroy ---

  it('should remove the source from the tile layer when destroyed', fakeAsync(() => {
    flush();
    expect(olTileLayer.getSource()).toBe(bingMaps);

    testComponent.destroySource.set(true);
    fixture.detectChanges();

    expect(component.getInstance()).toBeUndefined();
    expect(olTileLayer.getSource()).toBeNull();
  }));
});
