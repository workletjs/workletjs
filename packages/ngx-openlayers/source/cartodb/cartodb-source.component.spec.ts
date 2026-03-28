import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ObjectEvent } from 'ol/Object';
import BaseEvent from 'ol/events/Event';
import TileLayer from 'ol/layer/Tile';
import CartoDB from 'ol/source/CartoDB';
import { TileSourceEvent } from 'ol/source/Tile';

import { WolProperties, WolSafeAny } from '@workletjs/ngx-openlayers/core/types';
import { WolTileLayerComponent } from '@workletjs/ngx-openlayers/layer/tile';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolCartoDBSourceComponent } from './cartodb-source.component';

const internals = (obj: object) => obj as unknown as Record<string, unknown>;

async function createCartoDBInstance(
  setup?: (c: TestCartoDBSourceComponent) => void,
): Promise<CartoDB> {
  const f = TestBed.createComponent(TestCartoDBSourceComponent);
  setup?.(f.componentInstance);
  f.detectChanges();
  await f.whenStable();
  return f.debugElement
    .query(By.directive(WolCartoDBSourceComponent))
    .componentInstance.getInstance() as CartoDB;
}

@Component({
  selector: 'wol-test-cartodb-source',
  imports: [WolMapComponent, WolViewComponent, WolTileLayerComponent, WolCartoDBSourceComponent],
  template: `
    <wol-map>
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="2" />
      <wol-tile-layer>
        @if (!destroySource()) {
          <wol-carto-db-source
            [wolAttributions]="attributions()"
            [wolCacheSize]="cacheSize()"
            [wolCrossOrigin]="crossOrigin()"
            [wolProjection]="projection()"
            [wolMaxZoom]="maxZoom()"
            [wolMinZoom]="minZoom()"
            [wolWrapX]="wrapX()"
            [wolConfig]="config()"
            [wolMap]="mapName()"
            [wolAccount]="account()"
            [wolTransition]="transition()"
            [wolProperties]="properties()"
          />
        }
      </wol-tile-layer>
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestCartoDBSourceComponent {
  attributions = signal<string | undefined>(undefined);
  cacheSize = signal<number | undefined>(undefined);
  crossOrigin = signal<string | null | undefined>(undefined);
  projection = signal<string | undefined>(undefined);
  maxZoom = signal<number | undefined>(undefined);
  minZoom = signal<number | undefined>(undefined);
  wrapX = signal<boolean | undefined>(undefined);
  config = signal<Record<string, WolSafeAny> | undefined>(undefined);
  mapName = signal<string | undefined>(undefined);
  account = signal<string | undefined>(undefined);
  transition = signal<number | undefined>(undefined);
  properties = signal<WolProperties | undefined>(undefined);
  destroySource = signal(false);
}

describe('WolCartoDBSourceComponent', () => {
  let fixture: ComponentFixture<TestCartoDBSourceComponent>;
  let testComponent: TestCartoDBSourceComponent;
  let component: WolCartoDBSourceComponent;
  let tileLayerComponent: WolTileLayerComponent;
  let cartoDB: CartoDB;
  let olTileLayer: TileLayer;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestCartoDBSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestCartoDBSourceComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    testComponent = fixture.componentInstance;
    component = fixture.debugElement.query(
      By.directive(WolCartoDBSourceComponent),
    ).componentInstance;
    tileLayerComponent = fixture.debugElement.query(
      By.directive(WolTileLayerComponent),
    ).componentInstance;
    cartoDB = component.getInstance() as CartoDB;
    olTileLayer = tileLayerComponent.getInstance() as TileLayer;
  });

  // --- Creation ---

  it('should create the CartoDB source', () => {
    expect(component).toBeTruthy();
    expect(cartoDB).toBeInstanceOf(CartoDB);
  });

  it('should register the source on the tile layer', fakeAsync(() => {
    flush();
    expect(olTileLayer.getSource()).toBe(cartoDB);
  }));

  // --- Initialization (per input) ---

  it('should initialize with wolAttributions', async () => {
    const inst = await createCartoDBInstance((c) => c.attributions.set('© CartoDB'));
    expect(inst.getAttributions()).toBeTruthy();
  });

  it('should initialize with wolCacheSize', async () => {
    const inst = await createCartoDBInstance((c) => c.cacheSize.set(256));
    expect(inst).toBeInstanceOf(CartoDB);
  });

  it('should initialize with wolCrossOrigin', async () => {
    const inst = await createCartoDBInstance((c) => c.crossOrigin.set('anonymous'));
    expect(inst).toBeInstanceOf(CartoDB);
  });

  it('should initialize with wolProjection', async () => {
    const inst = await createCartoDBInstance((c) => c.projection.set('EPSG:4326'));
    expect(inst).toBeInstanceOf(CartoDB);
  });

  it('should initialize with wolMaxZoom', async () => {
    const inst = await createCartoDBInstance((c) => c.maxZoom.set(18));
    expect(inst).toBeInstanceOf(CartoDB);
  });

  it('should initialize with wolMinZoom', async () => {
    const inst = await createCartoDBInstance((c) => c.minZoom.set(3));
    expect(inst).toBeInstanceOf(CartoDB);
  });

  it('should initialize with wolWrapX = false', async () => {
    const inst = await createCartoDBInstance((c) => c.wrapX.set(false));
    expect(inst).toBeInstanceOf(CartoDB);
  });

  it('should initialize with wolConfig', async () => {
    const cfg = { layers: [{ type: 'cartodb', options: { cartocss: '{}' } }] };
    const inst = await createCartoDBInstance((c) => c.config.set(cfg));
    expect(internals(inst)['config_']).toMatchObject(cfg);
  });

  it('should initialize with wolMap', async () => {
    const inst = await createCartoDBInstance((c) => c.mapName.set('my-map'));
    expect(inst).toBeInstanceOf(CartoDB);
  });

  it('should initialize with wolAccount', async () => {
    const inst = await createCartoDBInstance((c) => c.account.set('myaccount'));
    expect(internals(inst)['account_']).toBe('myaccount');
  });

  it('should initialize with wolTransition', async () => {
    const inst = await createCartoDBInstance((c) => c.transition.set(300));
    expect(inst).toBeInstanceOf(CartoDB);
  });

  it('should initialize with wolProperties', async () => {
    const inst = await createCartoDBInstance((c) => c.properties.set({ label: 'test' }));
    expect(inst.getProperties()).toMatchObject({ label: 'test' });
  });

  // --- ngOnChanges ---

  it('should update attributions when wolAttributions changes', () => {
    const spy = vi.spyOn(cartoDB, 'setAttributions');
    testComponent.attributions.set('© New');
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith('© New');
  });

  it('should update config when wolConfig changes', () => {
    const spy = vi.spyOn(cartoDB, 'setConfig');
    const newConfig = { layers: [] };
    testComponent.config.set(newConfig);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(newConfig);
  });

  it('should update properties when wolProperties changes', () => {
    const spy = vi.spyOn(cartoDB, 'setProperties');
    const newProps: WolProperties = { updated: true };
    testComponent.properties.set(newProps);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(newProps);
  });

  // --- Outputs ---

  it('should emit wolChange when the source fires a change event', () => {
    const spy = vi.spyOn(component.wolChange, 'emit');
    const event = new BaseEvent('change');
    cartoDB.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolError when the source fires an error event', () => {
    const spy = vi.spyOn(component.wolError, 'emit');
    const event = new BaseEvent('error');
    cartoDB.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolPropertyChange when the source fires a propertychange event', () => {
    const spy = vi.spyOn(component.wolPropertyChange, 'emit');
    const event = new ObjectEvent('propertychange', 'key', undefined);
    cartoDB.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolTileLoadEnd when the source fires a tileloadend event', () => {
    const spy = vi.spyOn(component.wolTileLoadEnd, 'emit');
    const event = new TileSourceEvent('tileloadend', undefined as never);
    cartoDB.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolTileLoadError when the source fires a tileloaderror event', () => {
    const spy = vi.spyOn(component.wolTileLoadError, 'emit');
    const event = new TileSourceEvent('tileloaderror', undefined as never);
    cartoDB.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolTileLoadStart when the source fires a tileloadstart event', () => {
    const spy = vi.spyOn(component.wolTileLoadStart, 'emit');
    const event = new TileSourceEvent('tileloadstart', undefined as never);
    cartoDB.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  // --- Lifecycle / Destroy ---

  it('should remove the source from the tile layer when destroyed', fakeAsync(() => {
    flush();
    expect(olTileLayer.getSource()).toBe(cartoDB);

    testComponent.destroySource.set(true);
    fixture.detectChanges();

    expect(component.getInstance()).toBeUndefined();
    expect(olTileLayer.getSource()).toBeNull();
  }));
});
