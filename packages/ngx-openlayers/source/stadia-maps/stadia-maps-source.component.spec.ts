import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ObjectEvent } from 'ol/Object';
import { LoadFunction } from 'ol/Tile';
import BaseEvent from 'ol/events/Event';
import TileLayer from 'ol/layer/Tile';
import StadiaMaps from 'ol/source/StadiaMaps';
import { TileSourceEvent } from 'ol/source/Tile';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolTileLayerComponent } from '@workletjs/ngx-openlayers/layer/tile';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolStadiaMapsSourceComponent } from './stadia-maps-source.component';

const DEFAULT_LAYER = 'alidade_smooth';

async function createStadiaMapsInstance(
  setup?: (c: TestStadiaMapsSourceComponent) => void,
): Promise<StadiaMaps> {
  const f = TestBed.createComponent(TestStadiaMapsSourceComponent);
  setup?.(f.componentInstance);
  f.detectChanges();
  await f.whenStable();
  return f.debugElement
    .query(By.directive(WolStadiaMapsSourceComponent))
    .componentInstance.getInstance() as StadiaMaps;
}

@Component({
  selector: 'wol-test-stadia-maps-source',
  imports: [WolMapComponent, WolViewComponent, WolTileLayerComponent, WolStadiaMapsSourceComponent],
  template: `
    <wol-map>
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="2" />
      <wol-tile-layer>
        @if (!destroySource()) {
          <wol-stadia-maps-source
            [wolLayer]="layer()"
            [wolAttributions]="attributions()"
            [wolCacheSize]="cacheSize()"
            [wolInterpolate]="interpolate()"
            [wolMinZoom]="minZoom()"
            [wolMaxZoom]="maxZoom()"
            [wolReprojectionErrorThreshold]="reprojectionErrorThreshold()"
            [wolTileLoadFunction]="tileLoadFunction()"
            [wolTransition]="transition()"
            [wolUrl]="url()"
            [wolWrapX]="wrapX()"
            [wolApiKey]="apiKey()"
            [wolRetina]="retina()"
            [wolProperties]="properties()"
          />
        }
      </wol-tile-layer>
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestStadiaMapsSourceComponent {
  layer = signal<string>(DEFAULT_LAYER);
  attributions = signal<string | undefined>(undefined);
  cacheSize = signal<number | undefined>(undefined);
  interpolate = signal<boolean | undefined>(undefined);
  minZoom = signal<number | undefined>(undefined);
  maxZoom = signal<number | undefined>(undefined);
  reprojectionErrorThreshold = signal<number | undefined>(undefined);
  tileLoadFunction = signal<LoadFunction | undefined>(undefined);
  transition = signal<number | undefined>(undefined);
  url = signal<string | undefined>(undefined);
  wrapX = signal<boolean | undefined>(undefined);
  apiKey = signal<string | undefined>(undefined);
  retina = signal<boolean | undefined>(undefined);
  properties = signal<WolProperties | undefined>(undefined);
  destroySource = signal(false);
}

describe('WolStadiaMapsSourceComponent', () => {
  let fixture: ComponentFixture<TestStadiaMapsSourceComponent>;
  let testComponent: TestStadiaMapsSourceComponent;
  let component: WolStadiaMapsSourceComponent;
  let tileLayerComponent: WolTileLayerComponent;
  let stadiaMaps: StadiaMaps;
  let olTileLayer: TileLayer;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestStadiaMapsSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestStadiaMapsSourceComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    testComponent = fixture.componentInstance;
    component = fixture.debugElement.query(
      By.directive(WolStadiaMapsSourceComponent),
    ).componentInstance;
    tileLayerComponent = fixture.debugElement.query(
      By.directive(WolTileLayerComponent),
    ).componentInstance;
    stadiaMaps = component.getInstance() as StadiaMaps;
    olTileLayer = tileLayerComponent.getInstance() as TileLayer;
  });

  // --- Creation ---

  it('should create the StadiaMaps source', () => {
    expect(component).toBeTruthy();
    expect(stadiaMaps).toBeInstanceOf(StadiaMaps);
  });

  it('should register the source on the tile layer', fakeAsync(() => {
    flush();
    expect(olTileLayer.getSource()).toBe(stadiaMaps);
  }));

  // --- Initialization (per input) ---

  it('should initialize with required wolLayer', async () => {
    const inst = await createStadiaMapsInstance((c) => c.layer.set('outdoors'));
    expect(inst).toBeInstanceOf(StadiaMaps);
  });

  it('should initialize with wolAttributions', async () => {
    const inst = await createStadiaMapsInstance((c) => c.attributions.set('© Stadia'));
    expect(inst.getAttributions()).toBeTruthy();
  });

  it('should initialize with wolCacheSize', async () => {
    const inst = await createStadiaMapsInstance((c) => c.cacheSize.set(256));
    expect(inst).toBeInstanceOf(StadiaMaps);
  });

  it('should initialize with wolInterpolate = false', async () => {
    const inst = await createStadiaMapsInstance((c) => c.interpolate.set(false));
    expect(inst).toBeInstanceOf(StadiaMaps);
  });

  it('should initialize with wolMinZoom', async () => {
    const inst = await createStadiaMapsInstance((c) => c.minZoom.set(2));
    expect(inst).toBeInstanceOf(StadiaMaps);
  });

  it('should initialize with wolMaxZoom', async () => {
    const inst = await createStadiaMapsInstance((c) => c.maxZoom.set(18));
    expect(inst).toBeInstanceOf(StadiaMaps);
  });

  it('should initialize with wolReprojectionErrorThreshold', async () => {
    const inst = await createStadiaMapsInstance((c) => c.reprojectionErrorThreshold.set(0.5));
    expect(inst).toBeInstanceOf(StadiaMaps);
  });

  it('should initialize with wolTileLoadFunction', async () => {
    const fn: LoadFunction = vi.fn();
    const inst = await createStadiaMapsInstance((c) => c.tileLoadFunction.set(fn));
    expect(inst.getTileLoadFunction()).toBe(fn);
  });

  it('should initialize with wolTransition', async () => {
    const inst = await createStadiaMapsInstance((c) => c.transition.set(300));
    expect(inst).toBeInstanceOf(StadiaMaps);
  });

  it('should initialize with wolUrl', async () => {
    const inst = await createStadiaMapsInstance((c) =>
      c.url.set('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}.png'),
    );
    expect(inst).toBeInstanceOf(StadiaMaps);
  });

  it('should initialize with wolWrapX = false', async () => {
    const inst = await createStadiaMapsInstance((c) => c.wrapX.set(false));
    expect(inst).toBeInstanceOf(StadiaMaps);
  });

  it('should initialize with wolApiKey', async () => {
    const inst = await createStadiaMapsInstance((c) => c.apiKey.set('my-api-key'));
    expect(inst).toBeInstanceOf(StadiaMaps);
  });

  it('should initialize with wolRetina = true', async () => {
    const inst = await createStadiaMapsInstance((c) => c.retina.set(true));
    expect(inst).toBeInstanceOf(StadiaMaps);
  });

  it('should initialize with wolProperties', async () => {
    const inst = await createStadiaMapsInstance((c) => c.properties.set({ label: 'test-stadia' }));
    expect(inst.getProperties()).toMatchObject({ label: 'test-stadia' });
  });

  // --- ngOnChanges ---

  it('should update attributions when wolAttributions changes', () => {
    const spy = vi.spyOn(stadiaMaps, 'setAttributions');
    testComponent.attributions.set('© Updated');
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith('© Updated');
  });

  it('should update tileLoadFunction when wolTileLoadFunction changes', () => {
    const spy = vi.spyOn(stadiaMaps, 'setTileLoadFunction');
    const fn: LoadFunction = vi.fn();
    testComponent.tileLoadFunction.set(fn);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(fn);
  });

  it('should update url when wolUrl changes', () => {
    const spy = vi.spyOn(stadiaMaps, 'setUrl');
    const newUrl = 'https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}.png';
    testComponent.url.set(newUrl);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(newUrl);
  });

  it('should update properties when wolProperties changes', () => {
    const spy = vi.spyOn(stadiaMaps, 'setProperties');
    const newProps: WolProperties = { updated: true };
    testComponent.properties.set(newProps);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(newProps);
  });

  // --- Outputs ---

  it('should emit wolChange when the source fires a change event', () => {
    const spy = vi.spyOn(component.wolChange, 'emit');
    const event = new BaseEvent('change');
    stadiaMaps.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolError when the source fires an error event', () => {
    const spy = vi.spyOn(component.wolError, 'emit');
    const event = new BaseEvent('error');
    stadiaMaps.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolPropertyChange when the source fires a propertychange event', () => {
    const spy = vi.spyOn(component.wolPropertyChange, 'emit');
    const event = new ObjectEvent('propertychange', 'key', undefined);
    stadiaMaps.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolTileLoadEnd when the source fires a tileloadend event', () => {
    const spy = vi.spyOn(component.wolTileLoadEnd, 'emit');
    const event = new TileSourceEvent('tileloadend', undefined as never);
    stadiaMaps.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolTileLoadError when the source fires a tileloaderror event', () => {
    const spy = vi.spyOn(component.wolTileLoadError, 'emit');
    const event = new TileSourceEvent('tileloaderror', undefined as never);
    stadiaMaps.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolTileLoadStart when the source fires a tileloadstart event', () => {
    const spy = vi.spyOn(component.wolTileLoadStart, 'emit');
    const event = new TileSourceEvent('tileloadstart', undefined as never);
    stadiaMaps.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  // --- Lifecycle / Destroy ---

  it('should remove the source from the tile layer when destroyed', fakeAsync(() => {
    flush();
    expect(olTileLayer.getSource()).toBe(stadiaMaps);

    testComponent.destroySource.set(true);
    fixture.detectChanges();

    expect(component.getInstance()).toBeUndefined();
    expect(olTileLayer.getSource()).toBeNull();
  }));
});
