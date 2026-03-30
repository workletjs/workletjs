import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ObjectEvent } from 'ol/Object';
import BaseEvent from 'ol/events/Event';
import TileLayer from 'ol/layer/Tile';
import { ProjectionLike } from 'ol/proj';
import DataTileSource, { Loader } from 'ol/source/DataTile';
import { AttributionLike } from 'ol/source/Source';
import { TileGrid } from 'ol/tilegrid';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolTileLayerComponent } from '@workletjs/ngx-openlayers/layer/tile';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolDataTileSourceComponent } from './data-tile-source.component';

async function createDataTileSourceInstance(
  setup?: (c: TestDataTileSourceComponent) => void,
): Promise<DataTileSource> {
  const f = TestBed.createComponent(TestDataTileSourceComponent);
  setup?.(f.componentInstance);
  f.detectChanges();
  await f.whenStable();
  return f.debugElement
    .query(By.directive(WolDataTileSourceComponent))
    .componentInstance.getInstance() as DataTileSource;
}

@Component({
  selector: 'wol-test-data-tile-source',
  imports: [WolMapComponent, WolViewComponent, WolTileLayerComponent, WolDataTileSourceComponent],
  template: `
    <wol-map>
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="2" />
      <wol-tile-layer>
        @if (!destroySource()) {
          <wol-data-tile-source
            [wolLoader]="loader()"
            [wolAttributions]="attributions()"
            [wolAttributionsCollapsible]="attributionsCollapsible()"
            [wolMaxZoom]="maxZoom()"
            [wolMinZoom]="minZoom()"
            [wolGutter]="gutter()"
            [wolMaxResolution]="maxResolution()"
            [wolProjection]="projection()"
            [wolTileGrid]="tileGrid()"
            [wolWrapX]="wrapX()"
            [wolTransition]="transition()"
            [wolBandCount]="bandCount()"
            [wolInterpolate]="interpolate()"
            [wolKey]="key()"
            [wolProperties]="properties()"
            (wolChange)="onChange($event)"
            (wolError)="onError($event)"
            (wolPropertychange)="onPropertychange($event)"
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
class TestDataTileSourceComponent {
  loader = signal<Loader | undefined>(undefined);
  attributions = signal<AttributionLike | undefined>(undefined);
  attributionsCollapsible = signal<boolean | undefined>(undefined);
  maxZoom = signal<number | undefined>(undefined);
  minZoom = signal<number | undefined>(undefined);
  gutter = signal<number | undefined>(undefined);
  maxResolution = signal<number | undefined>(undefined);
  projection = signal<ProjectionLike | undefined>(undefined);
  tileGrid = signal<TileGrid | undefined>(undefined);
  wrapX = signal<boolean | undefined>(undefined);
  transition = signal<number | undefined>(undefined);
  bandCount = signal<number | undefined>(undefined);
  interpolate = signal<boolean | undefined>(undefined);
  key = signal<string | undefined>(undefined);
  properties = signal<WolProperties | undefined>(undefined);
  destroySource = signal(false);

  onChange = vi.fn();
  onError = vi.fn();
  onPropertychange = vi.fn();
  onTileLoadEnd = vi.fn();
  onTileLoadError = vi.fn();
  onTileLoadStart = vi.fn();
}

describe('WolDataTileSourceComponent', () => {
  let fixture: ComponentFixture<TestDataTileSourceComponent>;
  let testComponent: TestDataTileSourceComponent;
  let component: WolDataTileSourceComponent;
  let tileLayerComponent: WolTileLayerComponent;
  let dataTileSource: DataTileSource;
  let olTileLayer: TileLayer;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestDataTileSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestDataTileSourceComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    testComponent = fixture.componentInstance;
    component = fixture.debugElement.query(
      By.directive(WolDataTileSourceComponent),
    ).componentInstance;
    tileLayerComponent = fixture.debugElement.query(
      By.directive(WolTileLayerComponent),
    ).componentInstance;
    dataTileSource = component.getInstance() as DataTileSource;
    olTileLayer = tileLayerComponent.getInstance() as TileLayer;
  });

  // --- Creation ---

  it('should create the DataTile source', () => {
    expect(component).toBeTruthy();
    expect(dataTileSource).toBeInstanceOf(DataTileSource);
  });

  it('should register the source on the tile layer', fakeAsync(() => {
    flush();
    expect(olTileLayer.getSource()).toBe(dataTileSource);
  }));

  // --- Initialization (per input) ---

  it('should initialize with wolAttributions', async () => {
    const inst = await createDataTileSourceInstance((c) => c.attributions.set('© DataTile'));
    expect(inst).toBeInstanceOf(DataTileSource);
  });

  it('should initialize with wolAttributionsCollapsible = false', async () => {
    const inst = await createDataTileSourceInstance((c) => c.attributionsCollapsible.set(false));
    expect(inst).toBeInstanceOf(DataTileSource);
  });

  it('should initialize with wolMaxZoom', async () => {
    const inst = await createDataTileSourceInstance((c) => c.maxZoom.set(18));
    expect(inst).toBeInstanceOf(DataTileSource);
  });

  it('should initialize with wolMinZoom', async () => {
    const inst = await createDataTileSourceInstance((c) => c.minZoom.set(2));
    expect(inst).toBeInstanceOf(DataTileSource);
  });

  it('should initialize with wolGutter', async () => {
    const inst = await createDataTileSourceInstance((c) => c.gutter.set(8));
    expect(inst).toBeInstanceOf(DataTileSource);
  });

  it('should initialize with wolMaxResolution', async () => {
    const inst = await createDataTileSourceInstance((c) => c.maxResolution.set(1000));
    expect(inst).toBeInstanceOf(DataTileSource);
  });

  it('should initialize with wolWrapX = false', async () => {
    const inst = await createDataTileSourceInstance((c) => c.wrapX.set(false));
    expect(inst).toBeInstanceOf(DataTileSource);
  });

  it('should initialize with wolTransition', async () => {
    const inst = await createDataTileSourceInstance((c) => c.transition.set(250));
    expect(inst).toBeInstanceOf(DataTileSource);
  });

  it('should initialize with wolBandCount', async () => {
    const inst = await createDataTileSourceInstance((c) => c.bandCount.set(4));
    expect(inst).toBeInstanceOf(DataTileSource);
  });

  it('should initialize with wolInterpolate = true', async () => {
    const inst = await createDataTileSourceInstance((c) => c.interpolate.set(true));
    expect(inst).toBeInstanceOf(DataTileSource);
  });

  it('should initialize with wolKey', async () => {
    const inst = await createDataTileSourceInstance((c) => c.key.set('my-key'));
    expect(inst).toBeInstanceOf(DataTileSource);
  });

  it('should initialize with wolProperties', async () => {
    const inst = await createDataTileSourceInstance((c) =>
      c.properties.set({ customProp: 'value' }),
    );
    expect(inst).toBeInstanceOf(DataTileSource);
  });

  // --- ngOnChanges ---

  it('should update attributions via ngOnChanges (wolAttributions)', async () => {
    const spy = vi.spyOn(dataTileSource, 'setAttributions');
    testComponent.attributions.set('© Updated');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(spy).toHaveBeenCalledWith('© Updated');
  });

  it('should update properties via ngOnChanges (wolProperties)', async () => {
    const spy = vi.spyOn(dataTileSource, 'setProperties');
    testComponent.properties.set({ key: 'updated' });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(spy).toHaveBeenCalledWith({ key: 'updated' });
  });

  it('should call setTileGridForProjection when both wolProjection and wolTileGrid are set', async () => {
    const spy = vi.spyOn(dataTileSource, 'setTileGridForProjection');
    const tileGrid = new TileGrid({ resolutions: [156543, 78271], extent: [-180, -90, 180, 90] });
    // Set tileGrid first, then projection to trigger ngOnChanges with both present
    testComponent.tileGrid.set(tileGrid);
    fixture.detectChanges();
    await fixture.whenStable();
    testComponent.projection.set('EPSG:4326');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(spy).toHaveBeenCalledWith('EPSG:4326', tileGrid);
  });

  // --- Outputs ---

  it('should emit wolChange on source change event', async () => {
    dataTileSource.dispatchEvent('change');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onChange).toHaveBeenCalledWith(expect.any(BaseEvent));
  });

  it('should emit wolError on source error event', async () => {
    dataTileSource.dispatchEvent('error');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onError).toHaveBeenCalledWith(expect.any(BaseEvent));
  });

  it('should emit wolPropertychange on propertychange event', async () => {
    dataTileSource.set('testProp', 42);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onPropertychange).toHaveBeenCalledWith(expect.any(ObjectEvent));
  });

  it('should emit wolTileLoadStart on tileloadstart event', async () => {
    dataTileSource.dispatchEvent('tileloadstart');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onTileLoadStart).toHaveBeenCalled();
  });

  it('should emit wolTileLoadEnd on tileloadend event', async () => {
    dataTileSource.dispatchEvent('tileloadend');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onTileLoadEnd).toHaveBeenCalled();
  });

  it('should emit wolTileLoadError on tileloaderror event', async () => {
    dataTileSource.dispatchEvent('tileloaderror');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(testComponent.onTileLoadError).toHaveBeenCalled();
  });

  // --- Destroy ---

  it('should clean up instance and event listeners on destroy', async () => {
    expect(component.getInstance()).toBeInstanceOf(DataTileSource);
    testComponent.destroySource.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.getInstance()).toBeUndefined();
  });
});
