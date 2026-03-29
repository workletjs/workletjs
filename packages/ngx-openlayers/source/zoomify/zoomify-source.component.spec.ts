import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ObjectEvent } from 'ol/Object';
import { NearestDirectionFunction } from 'ol/array';
import BaseEvent from 'ol/events/Event';
import { Extent } from 'ol/extent';
import TileLayer from 'ol/layer/Tile';
import { Size } from 'ol/size';
import { AttributionLike } from 'ol/source/Source';
import { TileSourceEvent } from 'ol/source/Tile';
import Zoomify, { TierSizeCalculation } from 'ol/source/Zoomify';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolTileLayerComponent } from '@workletjs/ngx-openlayers/layer/tile';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolZoomifySourceComponent } from './zoomify-source.component';

const DEFAULT_URL = 'https://zoomify.example.com/tiles/';
const DEFAULT_SIZE: Size = [1024, 768];

async function createZoomifyInstance(
  setup?: (c: TestZoomifySourceComponent) => void,
): Promise<Zoomify> {
  const f = TestBed.createComponent(TestZoomifySourceComponent);
  setup?.(f.componentInstance);
  f.detectChanges();
  await f.whenStable();
  return f.debugElement
    .query(By.directive(WolZoomifySourceComponent))
    .componentInstance.getInstance() as Zoomify;
}

@Component({
  selector: 'wol-test-zoomify-source',
  imports: [WolMapComponent, WolViewComponent, WolTileLayerComponent, WolZoomifySourceComponent],
  template: `
    <wol-map>
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="2" />
      <wol-tile-layer>
        @if (!destroySource()) {
          <wol-zoomify-source
            [wolUrl]="url()"
            [wolSize]="size()"
            [wolAttributions]="attributions()"
            [wolCacheSize]="cacheSize()"
            [wolCrossOrigin]="crossOrigin()"
            [wolInterpolate]="interpolate()"
            [wolProjection]="projection()"
            [wolTilePixelRatio]="tilePixelRatio()"
            [wolReprojectionErrorThreshold]="reprojectionErrorThreshold()"
            [wolTierSizeCalculation]="tierSizeCalculation()"
            [wolExtent]="extent()"
            [wolTransition]="transition()"
            [wolTileSize]="tileSize()"
            [wolZDirection]="zDirection()"
            [wolProperties]="properties()"
          />
        }
      </wol-tile-layer>
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestZoomifySourceComponent {
  url = signal<string>(DEFAULT_URL);
  size = signal<Size>(DEFAULT_SIZE);
  attributions = signal<AttributionLike | undefined>(undefined);
  cacheSize = signal<number | undefined>(undefined);
  crossOrigin = signal<string | null | undefined>(undefined);
  interpolate = signal<boolean | undefined>(undefined);
  projection = signal<string | undefined>(undefined);
  tilePixelRatio = signal<number | undefined>(undefined);
  reprojectionErrorThreshold = signal<number | undefined>(undefined);
  tierSizeCalculation = signal<TierSizeCalculation | undefined>(undefined);
  extent = signal<Extent | undefined>(undefined);
  transition = signal<number | undefined>(undefined);
  tileSize = signal<number | undefined>(undefined);
  zDirection = signal<number | NearestDirectionFunction | undefined>(undefined);
  properties = signal<WolProperties | undefined>(undefined);
  destroySource = signal(false);
}

describe('WolZoomifySourceComponent', () => {
  let fixture: ComponentFixture<TestZoomifySourceComponent>;
  let testComponent: TestZoomifySourceComponent;
  let component: WolZoomifySourceComponent;
  let tileLayerComponent: WolTileLayerComponent;
  let zoomify: Zoomify;
  let olTileLayer: TileLayer;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestZoomifySourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestZoomifySourceComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    testComponent = fixture.componentInstance;
    component = fixture.debugElement.query(
      By.directive(WolZoomifySourceComponent),
    ).componentInstance;
    tileLayerComponent = fixture.debugElement.query(
      By.directive(WolTileLayerComponent),
    ).componentInstance;
    zoomify = component.getInstance() as Zoomify;
    olTileLayer = tileLayerComponent.getInstance() as TileLayer;
  });

  // --- Creation ---

  it('should create the Zoomify source', () => {
    expect(component).toBeTruthy();
    expect(zoomify).toBeInstanceOf(Zoomify);
  });

  it('should register the source on the tile layer', fakeAsync(() => {
    flush();
    expect(olTileLayer.getSource()).toBe(zoomify);
  }));

  // --- Initialization (per input) ---

  it('should initialize with custom wolUrl', async () => {
    const inst = await createZoomifyInstance((c) =>
      c.url.set('https://other.example.com/zoomify/'),
    );
    expect(inst).toBeInstanceOf(Zoomify);
  });

  it('should initialize with custom wolSize', async () => {
    const inst = await createZoomifyInstance((c) => c.size.set([2048, 1536]));
    expect(inst).toBeInstanceOf(Zoomify);
  });

  it('should initialize with wolAttributions', async () => {
    const inst = await createZoomifyInstance((c) => c.attributions.set('© Test'));
    expect(inst).toBeInstanceOf(Zoomify);
  });

  it('should initialize with wolCacheSize', async () => {
    const inst = await createZoomifyInstance((c) => c.cacheSize.set(128));
    expect(inst).toBeInstanceOf(Zoomify);
  });

  it('should initialize with wolCrossOrigin', async () => {
    const inst = await createZoomifyInstance((c) => c.crossOrigin.set('anonymous'));
    expect(inst).toBeInstanceOf(Zoomify);
  });

  it('should initialize with wolCrossOrigin = null', async () => {
    const inst = await createZoomifyInstance((c) => c.crossOrigin.set(null));
    expect(inst).toBeInstanceOf(Zoomify);
  });

  it('should initialize with wolInterpolate = false', async () => {
    const inst = await createZoomifyInstance((c) => c.interpolate.set(false));
    expect(inst).toBeInstanceOf(Zoomify);
  });

  it('should initialize with wolProjection', async () => {
    const inst = await createZoomifyInstance((c) => c.projection.set('EPSG:4326'));
    expect(inst).toBeInstanceOf(Zoomify);
  });

  it('should initialize with wolTilePixelRatio', async () => {
    const inst = await createZoomifyInstance((c) => c.tilePixelRatio.set(2));
    expect(inst).toBeInstanceOf(Zoomify);
  });

  it('should initialize with wolReprojectionErrorThreshold', async () => {
    const inst = await createZoomifyInstance((c) => c.reprojectionErrorThreshold.set(0.5));
    expect(inst).toBeInstanceOf(Zoomify);
  });

  it('should initialize with wolTierSizeCalculation = truncated', async () => {
    const inst = await createZoomifyInstance((c) => c.tierSizeCalculation.set('truncated'));
    expect(inst).toBeInstanceOf(Zoomify);
  });

  it('should initialize with wolExtent', async () => {
    const inst = await createZoomifyInstance((c) => c.extent.set([0, 0, 1024, 768]));
    expect(inst).toBeInstanceOf(Zoomify);
  });

  it('should initialize with wolTransition', async () => {
    const inst = await createZoomifyInstance((c) => c.transition.set(250));
    expect(inst).toBeInstanceOf(Zoomify);
  });

  it('should initialize with wolTileSize', async () => {
    const inst = await createZoomifyInstance((c) => c.tileSize.set(512));
    expect(inst).toBeInstanceOf(Zoomify);
  });

  it('should initialize with wolZDirection', async () => {
    const inst = await createZoomifyInstance((c) => c.zDirection.set(1));
    expect(inst).toBeInstanceOf(Zoomify);
  });

  it('should initialize with wolProperties', async () => {
    const inst = await createZoomifyInstance((c) => c.properties.set({ label: 'test-zoomify' }));
    expect(inst.getProperties()).toMatchObject({ label: 'test-zoomify' });
  });

  // --- ngOnChanges ---

  it('should update attributions when wolAttributions changes', () => {
    const spy = vi.spyOn(zoomify, 'setAttributions');
    testComponent.attributions.set('© Updated');
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith('© Updated');
  });

  it('should update properties when wolProperties changes', () => {
    const spy = vi.spyOn(zoomify, 'setProperties');
    const newProps: WolProperties = { updated: true };
    testComponent.properties.set(newProps);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(newProps);
  });

  // --- Outputs ---

  it('should emit wolChange when the source fires a change event', () => {
    const spy = vi.spyOn(component.wolChange, 'emit');
    const event = new BaseEvent('change');
    zoomify.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolError when the source fires an error event', () => {
    const spy = vi.spyOn(component.wolError, 'emit');
    const event = new BaseEvent('error');
    zoomify.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolPropertyChange when the source fires a propertychange event', () => {
    const spy = vi.spyOn(component.wolPropertyChange, 'emit');
    const event = new ObjectEvent('propertychange', 'key', undefined);
    zoomify.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolTileLoadEnd when the source fires a tileloadend event', () => {
    const spy = vi.spyOn(component.wolTileLoadEnd, 'emit');
    const event = new TileSourceEvent('tileloadend', undefined as never);
    zoomify.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolTileLoadError when the source fires a tileloaderror event', () => {
    const spy = vi.spyOn(component.wolTileLoadError, 'emit');
    const event = new TileSourceEvent('tileloaderror', undefined as never);
    zoomify.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolTileLoadStart when the source fires a tileloadstart event', () => {
    const spy = vi.spyOn(component.wolTileLoadStart, 'emit');
    const event = new TileSourceEvent('tileloadstart', undefined as never);
    zoomify.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  // --- Lifecycle / Destroy ---

  it('should remove the source from the tile layer when destroyed', fakeAsync(() => {
    flush();
    expect(olTileLayer.getSource()).toBe(zoomify);

    testComponent.destroySource.set(true);
    fixture.detectChanges();

    expect(component.getInstance()).toBeUndefined();
    expect(olTileLayer.getSource()).toBeNull();
  }));
});
