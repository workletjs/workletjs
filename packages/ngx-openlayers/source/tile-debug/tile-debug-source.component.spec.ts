import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ObjectEvent } from 'ol/Object';
import BaseEvent from 'ol/events/Event';
import TileLayer from 'ol/layer/Tile';
import { TileSourceEvent } from 'ol/source/Tile';
import TileSource, { Options as TileSourceOptions } from 'ol/source/Tile';
import TileDebug from 'ol/source/TileDebug';
import TileGrid from 'ol/tilegrid/TileGrid';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolTileLayerComponent } from '@workletjs/ngx-openlayers/layer/tile';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolTileDebugSourceComponent } from './tile-debug-source.component';

// Minimal concrete TileSource for testing (TileSource is abstract)
class MinimalTileSource extends TileSource {
  constructor(options: TileSourceOptions = {}) {
    super({
      projection: 'EPSG:3857',
      wrapX: true,
      ...options,
    });
  }
  getTile() {
    return null;
  }
}

async function createTileDebugInstance(
  setup?: (c: TestTileDebugSourceComponent) => void,
): Promise<TileDebug> {
  const f = TestBed.createComponent(TestTileDebugSourceComponent);
  setup?.(f.componentInstance);
  f.detectChanges();
  await f.whenStable();
  return f.debugElement
    .query(By.directive(WolTileDebugSourceComponent))
    .componentInstance.getInstance() as TileDebug;
}

@Component({
  selector: 'wol-test-tile-debug-source',
  imports: [WolMapComponent, WolViewComponent, WolTileLayerComponent, WolTileDebugSourceComponent],
  template: `
    <wol-map>
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="2" />
      <wol-tile-layer>
        @if (!destroySource()) {
          <wol-tile-debug-source
            [wolProjection]="projection()"
            [wolTileGrid]="tileGrid()"
            [wolWrapX]="wrapX()"
            [wolZDirection]="zDirection()"
            [wolSource]="source()"
            [wolTemplate]="template()"
            [wolColor]="color()"
            [wolProperties]="properties()"
          />
        }
      </wol-tile-layer>
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestTileDebugSourceComponent {
  projection = signal<string | undefined>(undefined);
  tileGrid = signal<TileGrid | undefined>(undefined);
  wrapX = signal<boolean | undefined>(undefined);
  zDirection = signal<number | undefined>(undefined);
  source = signal<TileSource | undefined>(undefined);
  template = signal<string | undefined>(undefined);
  color = signal<string | undefined>(undefined);
  properties = signal<WolProperties | undefined>(undefined);
  destroySource = signal(false);
}

describe('WolTileDebugSourceComponent', () => {
  let fixture: ComponentFixture<TestTileDebugSourceComponent>;
  let testComponent: TestTileDebugSourceComponent;
  let component: WolTileDebugSourceComponent;
  let tileLayerComponent: WolTileLayerComponent;
  let tileDebug: TileDebug;
  let olTileLayer: TileLayer;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestTileDebugSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestTileDebugSourceComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    testComponent = fixture.componentInstance;
    component = fixture.debugElement.query(
      By.directive(WolTileDebugSourceComponent),
    ).componentInstance;
    tileLayerComponent = fixture.debugElement.query(
      By.directive(WolTileLayerComponent),
    ).componentInstance;
    tileDebug = component.getInstance() as TileDebug;
    olTileLayer = tileLayerComponent.getInstance() as TileLayer;
  });

  // --- Creation ---

  it('should create the TileDebug source', () => {
    expect(component).toBeTruthy();
    expect(tileDebug).toBeInstanceOf(TileDebug);
  });

  it('should register the source on the tile layer', fakeAsync(() => {
    flush();
    expect(olTileLayer.getSource()).toBe(tileDebug);
  }));

  // --- Initialization (per input) ---

  it('should initialize with wolProjection', async () => {
    const inst = await createTileDebugInstance((c) => c.projection.set('EPSG:4326'));
    expect(inst).toBeInstanceOf(TileDebug);
  });

  it('should initialize with wolTileGrid', async () => {
    const grid = new TileGrid({ resolutions: [1], origin: [0, 0] });
    const inst = await createTileDebugInstance((c) => c.tileGrid.set(grid));
    expect(inst).toBeInstanceOf(TileDebug);
  });

  it('should initialize with wolWrapX = false', async () => {
    const inst = await createTileDebugInstance((c) => c.wrapX.set(false));
    expect(inst).toBeInstanceOf(TileDebug);
  });

  it('should initialize with wolZDirection', async () => {
    const inst = await createTileDebugInstance((c) => c.zDirection.set(1));
    expect(inst).toBeInstanceOf(TileDebug);
  });

  it('should initialize with wolSource', async () => {
    const src = new MinimalTileSource();
    const inst = await createTileDebugInstance((c) => c.source.set(src));
    expect(inst).toBeInstanceOf(TileDebug);
  });

  it('should initialize with wolTemplate', async () => {
    const inst = await createTileDebugInstance((c) => c.template.set('z/x/y'));
    expect(inst).toBeInstanceOf(TileDebug);
  });

  it('should initialize with wolColor', async () => {
    const inst = await createTileDebugInstance((c) => c.color.set('red'));
    expect(inst).toBeInstanceOf(TileDebug);
  });

  it('should initialize with wolProperties', async () => {
    const inst = await createTileDebugInstance((c) => c.properties.set({ label: 'test-debug' }));
    expect(inst.getProperties()).toMatchObject({ label: 'test-debug' });
  });

  // --- ngOnChanges ---

  it('should update properties when wolProperties changes', () => {
    const spy = vi.spyOn(tileDebug, 'setProperties');
    const newProps: WolProperties = { updated: true };
    testComponent.properties.set(newProps);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(newProps);
  });

  it('should update tile grid for projection when wolProjection or wolTileGrid changes', () => {
    const spy = vi.spyOn(tileDebug, 'setTileGridForProjection');
    const grid = new TileGrid({ resolutions: [1], origin: [0, 0] });
    testComponent.projection.set('EPSG:3857');
    testComponent.tileGrid.set(grid);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith('EPSG:3857', grid);
  });

  // --- Outputs ---

  it('should emit wolChange when the source fires a change event', () => {
    const spy = vi.spyOn(component.wolChange, 'emit');
    const event = new BaseEvent('change');
    tileDebug.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolError when the source fires an error event', () => {
    const spy = vi.spyOn(component.wolError, 'emit');
    const event = new BaseEvent('error');
    tileDebug.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolPropertyChange when the source fires a propertychange event', () => {
    const spy = vi.spyOn(component.wolPropertyChange, 'emit');
    const event = new ObjectEvent('propertychange', 'key', undefined);
    tileDebug.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolTileLoadEnd when the source fires a tileloadend event', () => {
    const spy = vi.spyOn(component.wolTileLoadEnd, 'emit');
    const event = new TileSourceEvent('tileloadend', undefined as never);
    tileDebug.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolTileLoadError when the source fires a tileloaderror event', () => {
    const spy = vi.spyOn(component.wolTileLoadError, 'emit');
    const event = new TileSourceEvent('tileloaderror', undefined as never);
    tileDebug.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolTileLoadStart when the source fires a tileloadstart event', () => {
    const spy = vi.spyOn(component.wolTileLoadStart, 'emit');
    const event = new TileSourceEvent('tileloadstart', undefined as never);
    tileDebug.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  // --- Lifecycle / Destroy ---

  it('should remove the source from the tile layer when destroyed', fakeAsync(() => {
    flush();
    expect(olTileLayer.getSource()).toBe(tileDebug);

    testComponent.destroySource.set(true);
    fixture.detectChanges();

    expect(component.getInstance()).toBeUndefined();
    expect(olTileLayer.getSource()).toBeNull();
  }));
});
