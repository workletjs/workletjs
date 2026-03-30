import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ObjectEvent } from 'ol/Object';
import { NearestDirectionFunction } from 'ol/array';
import BaseEvent from 'ol/events/Event';
import TileLayer from 'ol/layer/Tile';
import { AttributionLike } from 'ol/source/Source';
import { Config } from 'ol/source/TileJSON';
import UTFGrid from 'ol/source/UTFGrid';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolTileLayerComponent } from '@workletjs/ngx-openlayers/layer/tile';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolUTFGridSourceComponent } from './utf-grid-source.component';

async function createUTFGridInstance(
  setup?: (c: TestUTFGridSourceComponent) => void,
): Promise<UTFGrid> {
  const f = TestBed.createComponent(TestUTFGridSourceComponent);
  setup?.(f.componentInstance);
  f.detectChanges();
  await f.whenStable();
  return f.debugElement
    .query(By.directive(WolUTFGridSourceComponent))
    .componentInstance.getInstance() as UTFGrid;
}

@Component({
  selector: 'wol-test-utf-grid-source',
  imports: [WolMapComponent, WolViewComponent, WolTileLayerComponent, WolUTFGridSourceComponent],
  template: `
    <wol-map>
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="2" />
      <wol-tile-layer>
        @if (!destroySource()) {
          <wol-utf-grid-source
            [wolAttributions]="attributions()"
            [wolPreemptive]="preemptive()"
            [wolJsonp]="jsonp()"
            [wolTileJSON]="tileJSON()"
            [wolUrl]="url()"
            [wolWrapX]="wrapX()"
            [wolZDirection]="zDirection()"
            [wolProperties]="properties()"
          />
        }
      </wol-tile-layer>
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestUTFGridSourceComponent {
  attributions = signal<AttributionLike | undefined>(undefined);
  preemptive = signal<boolean | undefined>(undefined);
  jsonp = signal<boolean | undefined>(undefined);
  tileJSON = signal<Config | undefined>(undefined);
  url = signal<string | undefined>('https://api.example.com/utfgrid/{z}/{x}/{y}.json');
  wrapX = signal<boolean | undefined>(undefined);
  zDirection = signal<number | NearestDirectionFunction | undefined>(undefined);
  properties = signal<WolProperties | undefined>(undefined);
  destroySource = signal(false);
}

describe('WolUTFGridSourceComponent', () => {
  let fixture: ComponentFixture<TestUTFGridSourceComponent>;
  let testComponent: TestUTFGridSourceComponent;
  let component: WolUTFGridSourceComponent;
  let tileLayerComponent: WolTileLayerComponent;
  let utfGrid: UTFGrid;
  let olTileLayer: TileLayer;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestUTFGridSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestUTFGridSourceComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    testComponent = fixture.componentInstance;
    component = fixture.debugElement.query(
      By.directive(WolUTFGridSourceComponent),
    ).componentInstance;
    tileLayerComponent = fixture.debugElement.query(
      By.directive(WolTileLayerComponent),
    ).componentInstance;
    utfGrid = component.getInstance() as UTFGrid;
    olTileLayer = tileLayerComponent.getInstance() as TileLayer;
  });

  // --- Creation ---

  it('should create the UTFGrid source', () => {
    expect(component).toBeTruthy();
    expect(utfGrid).toBeInstanceOf(UTFGrid);
  });

  it('should register the source on the tile layer', fakeAsync(() => {
    flush();
    expect(olTileLayer.getSource()).toBe(utfGrid);
  }));

  // --- Initialization (per input) ---

  it('should initialize with wolAttributions', async () => {
    const inst = await createUTFGridInstance((c) => c.attributions.set('© Test'));
    expect(inst.getAttributions()).toBeTruthy();
  });

  it('should initialize with wolPreemptive = true', async () => {
    const inst = await createUTFGridInstance((c) => c.preemptive.set(true));
    expect(inst).toBeInstanceOf(UTFGrid);
  });

  it('should initialize with wolPreemptive = false', async () => {
    const inst = await createUTFGridInstance((c) => c.preemptive.set(false));
    expect(inst).toBeInstanceOf(UTFGrid);
  });

  it('should initialize with wolJsonp = true', async () => {
    const inst = await createUTFGridInstance((c) => c.jsonp.set(true));
    expect(inst).toBeInstanceOf(UTFGrid);
  });

  it('should initialize with wolJsonp = false', async () => {
    const inst = await createUTFGridInstance((c) => c.jsonp.set(false));
    expect(inst).toBeInstanceOf(UTFGrid);
  });

  it('should initialize with wolUrl', async () => {
    const inst = await createUTFGridInstance((c) =>
      c.url.set('https://tiles.example.com/{z}/{x}/{y}.json'),
    );
    expect(inst).toBeInstanceOf(UTFGrid);
  });

  it('should initialize with wolWrapX = false', async () => {
    const inst = await createUTFGridInstance((c) => c.wrapX.set(false));
    expect(inst).toBeInstanceOf(UTFGrid);
  });

  it('should initialize with wolWrapX = true', async () => {
    const inst = await createUTFGridInstance((c) => c.wrapX.set(true));
    expect(inst).toBeInstanceOf(UTFGrid);
  });

  it('should initialize with wolZDirection as number', async () => {
    const inst = await createUTFGridInstance((c) => c.zDirection.set(1));
    expect(inst).toBeInstanceOf(UTFGrid);
  });

  it('should initialize with wolZDirection as function', async () => {
    const fn: NearestDirectionFunction = (_x) => _x;
    const inst = await createUTFGridInstance((c) => c.zDirection.set(fn));
    expect(inst).toBeInstanceOf(UTFGrid);
  });

  it('should initialize with wolProperties', async () => {
    const inst = await createUTFGridInstance((c) => c.properties.set({ foo: 'bar' }));
    expect(inst.getProperties()).toMatchObject({ foo: 'bar' });
  });

  // --- ngOnChanges ---

  it('should update attributions when wolAttributions changes', () => {
    const spy = vi.spyOn(utfGrid, 'setAttributions');
    testComponent.attributions.set('© Updated');
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith('© Updated');
  });

  it('should update properties when wolProperties changes', () => {
    const spy = vi.spyOn(utfGrid, 'setProperties');
    const newProps: WolProperties = { updated: true };
    testComponent.properties.set(newProps);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(newProps);
  });

  // --- Outputs ---

  it('should emit wolChange when the source fires a change event', () => {
    const spy = vi.spyOn(component.wolChange, 'emit');
    const event = new BaseEvent('change');
    utfGrid.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolError when the source fires an error event', () => {
    const spy = vi.spyOn(component.wolError, 'emit');
    const event = new BaseEvent('error');
    utfGrid.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolPropertyChange when the source fires a propertychange event', () => {
    const spy = vi.spyOn(component.wolPropertyChange, 'emit');
    const event = new ObjectEvent('propertychange', 'key', undefined);
    utfGrid.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  // --- Lifecycle / Destroy ---

  it('should remove the source from the tile layer when destroyed', fakeAsync(() => {
    flush();
    expect(olTileLayer.getSource()).toBe(utfGrid);

    testComponent.destroySource.set(true);
    fixture.detectChanges();

    expect(component.getInstance()).toBeUndefined();
    expect(olTileLayer.getSource()).toBeNull();
  }));
});
