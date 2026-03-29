import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ObjectEvent } from 'ol/Object';
import { NearestDirectionFunction } from 'ol/array';
import BaseEvent from 'ol/events/Event';
import TileLayer from 'ol/layer/Tile';
import { Size } from 'ol/size';
import { CrossOriginAttribute } from 'ol/source/DataTile';
import ImageTileSource, { Loader, UrlLike } from 'ol/source/ImageTile';
import { AttributionLike, State } from 'ol/source/Source';
import TileGrid from 'ol/tilegrid/TileGrid';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolTileLayerComponent } from '@workletjs/ngx-openlayers/layer/tile';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolImageTileSourceComponent } from './image-tile-source.component';

async function createImageTileInstance(
  setup?: (c: TestImageTileSourceComponent) => void,
): Promise<ImageTileSource> {
  const f = TestBed.createComponent(TestImageTileSourceComponent);
  setup?.(f.componentInstance);
  f.detectChanges();
  await f.whenStable();
  return f.debugElement
    .query(By.directive(WolImageTileSourceComponent))
    .componentInstance.getInstance() as ImageTileSource;
}

@Component({
  selector: 'wol-test-image-tile-source',
  imports: [WolMapComponent, WolViewComponent, WolTileLayerComponent, WolImageTileSourceComponent],
  template: `
    <wol-map>
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="2" />
      <wol-tile-layer>
        @if (!destroySource()) {
          <wol-image-tile-source
            [wolUrl]="url()"
            [wolLoader]="loader()"
            [wolAttributions]="attributions()"
            [wolAttributionsCollapsible]="attributionsCollapsible()"
            [wolMaxZoom]="maxZoom()"
            [wolMinZoom]="minZoom()"
            [wolTileSize]="tileSize()"
            [wolGutter]="gutter()"
            [wolMaxResolution]="maxResolution()"
            [wolProjection]="projection()"
            [wolTileGrid]="tileGrid()"
            [wolState]="state()"
            [wolWrapX]="wrapX()"
            [wolTransition]="transition()"
            [wolInterpolate]="interpolate()"
            [wolCrossOrigin]="crossOrigin()"
            [wolZDirection]="zDirection()"
            [wolReferrerPolicy]="referrerPolicy()"
            [wolProperties]="properties()"
            (wolChange)="onChange($event)"
            (wolError)="onError($event)"
            (wolPropertyChange)="onPropertyChange($event)"
            (wolTileLoadEnd)="onTileLoadEnd($event)"
            (wolTileLoadError)="onTileLoadError($event)"
            (wolTileLoadStart)="onTileLoadStart($event)"
          />
        }
      </wol-tile-layer>
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestImageTileSourceComponent {
  url = signal<UrlLike | undefined>(undefined);
  loader = signal<Loader | undefined>(undefined);
  attributions = signal<AttributionLike | undefined>(undefined);
  attributionsCollapsible = signal<boolean | undefined>(undefined);
  maxZoom = signal<number | undefined>(undefined);
  minZoom = signal<number | undefined>(undefined);
  tileSize = signal<number | Size | undefined>(undefined);
  gutter = signal<number | undefined>(undefined);
  maxResolution = signal<number | undefined>(undefined);
  projection = signal<string | undefined>(undefined);
  tileGrid = signal<TileGrid | undefined>(undefined);
  state = signal<State | undefined>(undefined);
  wrapX = signal<boolean | undefined>(undefined);
  transition = signal<number | undefined>(undefined);
  interpolate = signal<boolean | undefined>(undefined);
  crossOrigin = signal<CrossOriginAttribute | undefined>(undefined);
  zDirection = signal<number | NearestDirectionFunction | undefined>(undefined);
  referrerPolicy = signal<ReferrerPolicy | undefined>(undefined);
  properties = signal<WolProperties | undefined>(undefined);
  destroySource = signal(false);

  onChange = vi.fn();
  onError = vi.fn();
  onPropertyChange = vi.fn();
  onTileLoadEnd = vi.fn();
  onTileLoadError = vi.fn();
  onTileLoadStart = vi.fn();
}

describe('WolImageTileSourceComponent', () => {
  let fixture: ComponentFixture<TestImageTileSourceComponent>;
  let testComponent: TestImageTileSourceComponent;
  let component: WolImageTileSourceComponent;
  let tileLayerComponent: WolTileLayerComponent;
  let imageTile: ImageTileSource;
  let olTileLayer: TileLayer;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestImageTileSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestImageTileSourceComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    testComponent = fixture.componentInstance;
    component = fixture.debugElement.query(
      By.directive(WolImageTileSourceComponent),
    ).componentInstance;
    tileLayerComponent = fixture.debugElement.query(
      By.directive(WolTileLayerComponent),
    ).componentInstance;
    imageTile = component.getInstance() as ImageTileSource;
    olTileLayer = tileLayerComponent.getInstance() as TileLayer;
  });

  // --- Creation ---

  it('should create the ImageTile source', () => {
    expect(component).toBeTruthy();
    expect(imageTile).toBeInstanceOf(ImageTileSource);
  });

  it('should register the source on the tile layer', fakeAsync(() => {
    flush();
    expect(olTileLayer.getSource()).toBe(imageTile);
  }));

  // --- Initialization (per input) ---

  it('should initialize with wolUrl', async () => {
    const inst = await createImageTileInstance((c) =>
      c.url.set('https://tile.example.com/{z}/{x}/{y}.png'),
    );
    expect(inst).toBeInstanceOf(ImageTileSource);
  });

  it('should initialize with wolLoader', async () => {
    const loader: Loader = vi.fn();
    const inst = await createImageTileInstance((c) => c.loader.set(loader));
    expect(inst).toBeInstanceOf(ImageTileSource);
  });

  it('should initialize with wolAttributions', async () => {
    const inst = await createImageTileInstance((c) => c.attributions.set('© Test'));
    expect(inst).toBeInstanceOf(ImageTileSource);
  });

  it('should initialize with wolAttributionsCollapsible = false', async () => {
    const inst = await createImageTileInstance((c) => c.attributionsCollapsible.set(false));
    expect(inst).toBeInstanceOf(ImageTileSource);
  });

  it('should initialize with wolMaxZoom', async () => {
    const inst = await createImageTileInstance((c) => c.maxZoom.set(18));
    expect(inst).toBeInstanceOf(ImageTileSource);
  });

  it('should initialize with wolMinZoom', async () => {
    const inst = await createImageTileInstance((c) => c.minZoom.set(2));
    expect(inst).toBeInstanceOf(ImageTileSource);
  });

  it('should initialize with wolTileSize as number', async () => {
    const inst = await createImageTileInstance((c) => c.tileSize.set(512));
    expect(inst).toBeInstanceOf(ImageTileSource);
  });

  it('should initialize with wolTileSize as Size array', async () => {
    const inst = await createImageTileInstance((c) => c.tileSize.set([512, 256]));
    expect(inst).toBeInstanceOf(ImageTileSource);
  });

  it('should initialize with wolGutter', async () => {
    const inst = await createImageTileInstance((c) => c.gutter.set(4));
    expect(inst).toBeInstanceOf(ImageTileSource);
  });

  it('should initialize with wolMaxResolution', async () => {
    const inst = await createImageTileInstance((c) => c.maxResolution.set(156543.0339));
    expect(inst).toBeInstanceOf(ImageTileSource);
  });

  it('should initialize with wolProjection', async () => {
    const inst = await createImageTileInstance((c) => c.projection.set('EPSG:4326'));
    expect(inst).toBeInstanceOf(ImageTileSource);
  });

  it('should initialize with wolTileGrid', async () => {
    const grid = new TileGrid({ resolutions: [1], origin: [0, 0] });
    const inst = await createImageTileInstance((c) => c.tileGrid.set(grid));
    expect(inst).toBeInstanceOf(ImageTileSource);
  });

  it('should initialize with wolWrapX = false', async () => {
    const inst = await createImageTileInstance((c) => c.wrapX.set(false));
    expect(inst).toBeInstanceOf(ImageTileSource);
  });

  it('should initialize with wolTransition', async () => {
    const inst = await createImageTileInstance((c) => c.transition.set(250));
    expect(inst).toBeInstanceOf(ImageTileSource);
  });

  it('should initialize with wolInterpolate = false', async () => {
    const inst = await createImageTileInstance((c) => c.interpolate.set(false));
    expect(inst).toBeInstanceOf(ImageTileSource);
  });

  it('should initialize with wolCrossOrigin', async () => {
    const inst = await createImageTileInstance((c) => c.crossOrigin.set('anonymous'));
    expect(inst).toBeInstanceOf(ImageTileSource);
  });

  it('should initialize with wolZDirection as number', async () => {
    const inst = await createImageTileInstance((c) => c.zDirection.set(1));
    expect(inst).toBeInstanceOf(ImageTileSource);
  });

  it('should initialize with wolZDirection as function', async () => {
    const fn: NearestDirectionFunction = vi.fn().mockReturnValue(0);
    const inst = await createImageTileInstance((c) => c.zDirection.set(fn));
    expect(inst).toBeInstanceOf(ImageTileSource);
  });

  it('should initialize with wolReferrerPolicy', async () => {
    const inst = await createImageTileInstance((c) => c.referrerPolicy.set('no-referrer'));
    expect(inst).toBeInstanceOf(ImageTileSource);
  });

  it('should initialize with wolProperties', async () => {
    const inst = await createImageTileInstance((c) => c.properties.set({ customKey: 'value' }));
    expect(inst).toBeInstanceOf(ImageTileSource);
  });

  // --- ngOnChanges ---

  it('should update attributions via ngOnChanges (wolAttributions)', async () => {
    const setAttributionsSpy = vi.spyOn(imageTile, 'setAttributions');
    testComponent.attributions.set('© Updated');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(setAttributionsSpy).toHaveBeenCalledWith('© Updated');
  });

  it('should update properties via ngOnChanges (wolProperties)', async () => {
    const setPropertiesSpy = vi.spyOn(imageTile, 'setProperties');
    testComponent.properties.set({ key: 'updated' });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(setPropertiesSpy).toHaveBeenCalledWith({ key: 'updated' }, false);
  });

  it('should call setUrl via ngOnChanges (wolUrl)', async () => {
    const setUrlSpy = vi.spyOn(imageTile, 'setUrl');
    testComponent.url.set('https://new-tile.example.com/{z}/{x}/{y}.png');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(setUrlSpy).toHaveBeenCalledWith('https://new-tile.example.com/{z}/{x}/{y}.png');
  });

  it('should call setTileGridForProjection when both wolProjection and wolTileGrid change', async () => {
    const setTileGridForProjectionSpy = vi.spyOn(imageTile, 'setTileGridForProjection');
    const grid = new TileGrid({ resolutions: [1], origin: [0, 0] });
    testComponent.projection.set('EPSG:4326');
    testComponent.tileGrid.set(grid);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(setTileGridForProjectionSpy).toHaveBeenCalledWith('EPSG:4326', grid);
  });

  it('should not call setTileGridForProjection when only wolProjection changes without tileGrid', async () => {
    const setTileGridForProjectionSpy = vi.spyOn(imageTile, 'setTileGridForProjection');
    testComponent.projection.set('EPSG:4326');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(setTileGridForProjectionSpy).not.toHaveBeenCalled();
  });

  // --- Outputs ---

  it('should emit wolChange on source change event', async () => {
    imageTile.dispatchEvent('change');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onChange).toHaveBeenCalledWith(expect.any(BaseEvent));
  });

  it('should emit wolError on source error event', async () => {
    imageTile.dispatchEvent('error');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onError).toHaveBeenCalledWith(expect.any(BaseEvent));
  });

  it('should emit wolPropertyChange on source propertychange event', async () => {
    imageTile.set('testProp', 123);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onPropertyChange).toHaveBeenCalledWith(expect.any(ObjectEvent));
  });

  it('should emit wolTileLoadEnd on tileloadend event', async () => {
    imageTile.dispatchEvent('tileloadend');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onTileLoadEnd).toHaveBeenCalled();
  });

  it('should emit wolTileLoadError on tileloaderror event', async () => {
    imageTile.dispatchEvent('tileloaderror');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onTileLoadError).toHaveBeenCalled();
  });

  it('should emit wolTileLoadStart on tileloadstart event', async () => {
    imageTile.dispatchEvent('tileloadstart');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onTileLoadStart).toHaveBeenCalled();
  });

  // --- Destroy ---

  it('should clean up instance and event listeners on destroy', async () => {
    expect(component.getInstance()).toBeInstanceOf(ImageTileSource);
    testComponent.destroySource.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.getInstance()).toBeUndefined();
  });
});
