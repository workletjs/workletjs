import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import DataTile from 'ol/DataTile';
import { ObjectEvent } from 'ol/Object';
import BaseEvent from 'ol/events/Event';
import DataTileSource from 'ol/source/DataTile';
import { Options } from 'ol/source/GeoZarr';
import { AttributionLike } from 'ol/source/Source';
import { TileSourceEvent } from 'ol/source/Tile';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolFlowLayerComponent } from '@workletjs/ngx-openlayers/layer/flow';
import { WolImageLayerComponent } from '@workletjs/ngx-openlayers/layer/image';
import { WolTileLayerComponent } from '@workletjs/ngx-openlayers/layer/tile';
import { WolWebGLTileLayerComponent } from '@workletjs/ngx-openlayers/layer/webgl-tile';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolRasterSourceComponent } from '@workletjs/ngx-openlayers/source/raster';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolGeoZarrSourceComponent, WolGeoZarrSourceModule } from './public-api';

// Preserve OpenLayers events and the real DataTile host contract, while avoiding remote metadata.
vi.mock('ol/source/GeoZarr', async () => {
  const { default: Source } =
    await vi.importActual<typeof import('ol/source/DataTile')>('ol/source/DataTile');

  class FakeGeoZarr extends Source {
    readonly constructorOptions: Options;
    updateDimensions = vi.fn();

    constructor(options: Options) {
      super({ state: 'loading' });
      this.constructorOptions = options;
    }
  }

  return { default: FakeGeoZarr };
});

type FakeSource = DataTileSource & {
  constructorOptions: Options;
  updateDimensions: ReturnType<typeof vi.fn>;
};

@Component({
  selector: 'wol-test-geozarr-host',
  imports: [WolMapComponent, WolViewComponent, WolWebGLTileLayerComponent, WolGeoZarrSourceModule],
  template: `
    <wol-map>
      <wol-view [wolZoom]="2" [wolCenter]="[0, 0]" />
      <wol-webgl-tile-layer>
        @if (showSource()) {
          <wol-geozarr-source
            #geozarr="wolGeoZarrSource"
            [wolUrl]="options().url"
            [wolBands]="options().bands"
            [wolStoreOptions]="options().storeOptions"
            [wolProjection]="options().projection"
            [wolTransition]="options().transition"
            [wolWrapX]="options().wrapX"
            [wolResample]="options().resample"
            [wolDimensions]="options().dimensions"
            [wolVariable]="options().variable"
            [wolExtent]="options().extent"
            [wolFlipY]="options().flipY"
            [wolAttributions]="attributions()"
            [wolProperties]="properties()"
            (wolChange)="onChange($event)"
            (wolError)="onError($event)"
            (wolPropertyChange)="onPropertyChange($event)"
            (wolTileLoadStart)="onTileLoadStart($event)"
            (wolTileLoadEnd)="onTileLoadEnd($event)"
            (wolTileLoadError)="onTileLoadError($event)"
          />
        }
      </wol-webgl-tile-layer>
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestHostComponent {
  options = signal<Options>({ url: 'https://example.com/scene.zarr' });
  attributions = signal<AttributionLike | undefined>(undefined);
  properties = signal<WolProperties | undefined>(undefined);
  showSource = signal(true);
  onChange = vi.fn();
  onError = vi.fn();
  onPropertyChange = vi.fn();
  onTileLoadStart = vi.fn();
  onTileLoadEnd = vi.fn();
  onTileLoadError = vi.fn();
}

@Component({
  selector: 'wol-test-geozarr-other-hosts',
  imports: [
    WolMapComponent,
    WolViewComponent,
    WolTileLayerComponent,
    WolFlowLayerComponent,
    WolImageLayerComponent,
    WolRasterSourceComponent,
    WolGeoZarrSourceComponent,
  ],
  template: `
    <wol-map>
      <wol-view [wolZoom]="2" [wolCenter]="[0, 0]" />
      <wol-tile-layer>
        @if (showSource()) {
          <wol-geozarr-source wolUrl="https://example.com/tile.zarr" />
        }
      </wol-tile-layer>
      <wol-flow-layer [wolMaxSpeed]="24">
        @if (showSource()) {
          <wol-geozarr-source wolUrl="https://example.com/flow.zarr" />
        }
      </wol-flow-layer>
      <wol-image-layer>
        <wol-raster-source [wolThreads]="0">
          @if (showSource()) {
            <wol-geozarr-source wolUrl="https://example.com/raster.zarr" />
          }
        </wol-raster-source>
      </wol-image-layer>
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class OtherHostsComponent {
  showSource = signal(true);
}

@Component({
  selector: 'wol-test-geozarr-missing-host',
  imports: [WolGeoZarrSourceComponent],
  template: `<wol-geozarr-source wolUrl="https://example.com/scene.zarr" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class MissingHostComponent {}

function sourceComponent(fixture: ComponentFixture<TestHostComponent>): WolGeoZarrSourceComponent {
  return fixture.debugElement.query(By.directive(WolGeoZarrSourceComponent)).componentInstance;
}

async function createHost(options?: Options) {
  const fixture = TestBed.createComponent(TestHostComponent);
  if (options) fixture.componentInstance.options.set(options);
  fixture.detectChanges();
  await fixture.whenStable();
  const component = sourceComponent(fixture);
  return { fixture, component, source: component.getInstance() as unknown as FakeSource };
}

const tile = new DataTile({ tileCoord: [0, 0, 0], loader: async () => new Uint8Array(4) });
const events = [
  ['onChange', new BaseEvent('change')],
  ['onError', new BaseEvent('error')],
  ['onPropertyChange', new ObjectEvent('propertychange', 'name', 'previous')],
  ['onTileLoadStart', new TileSourceEvent('tileloadstart', tile)],
  ['onTileLoadEnd', new TileSourceEvent('tileloadend', tile)],
  ['onTileLoadError', new TileSourceEvent('tileloaderror', tile)],
] as const;

describe('WolGeoZarrSourceComponent', () => {
  it('passes every optional constructor input unchanged, including false and zero', async () => {
    const options: Options = {
      url: 'https://example.com/scene.zarr',
      bands: ['b04', { name: 'mask', group: 'quality' }],
      storeOptions: { headers: { 'X-Dataset': 'test' }, credentials: 'include' },
      projection: 'EPSG:4326',
      transition: 0,
      wrapX: false,
      resample: 'linear',
      dimensions: { time: '2026-10-15', elevation: 0, band: [0, 'red'] },
      extent: [-180, -90, 180, 90],
      flipY: false,
    };
    const { source } = await createHost(options);
    expect(source.constructorOptions).toEqual(options);
  });

  it('passes the single-variable layout and dimension arrays unchanged', async () => {
    const options: Options = {
      url: 'https://example.com/cube.zarr',
      variable: 'reflectance',
      dimensions: { time: 2, band: ['red', 'green', 'blue'] },
    };
    const { source } = await createHost(options);
    expect(source.constructorOptions).toEqual(options);
  });

  it('leaves optional constructor inputs undefined for upstream defaults', async () => {
    const { source } = await createHost();
    expect(source.constructorOptions.url).toBe('https://example.com/scene.zarr');
    for (const [name, value] of Object.entries(source.constructorOptions)) {
      if (name !== 'url') expect(value).toBeUndefined();
    }
    expect(source.constructorOptions).not.toHaveProperty('attributions');
  });

  it('sets initial attributions and properties without emitting property changes', async () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    const host = fixture.componentInstance;
    host.attributions.set('© GeoZarr');
    host.properties.set({ dataset: 'Sentinel-2' });
    fixture.detectChanges();
    await fixture.whenStable();
    const source = sourceComponent(fixture).getInstance();
    expect(source?.getAttributions()?.({} as never)).toEqual(['© GeoZarr']);
    expect(source?.get('dataset')).toBe('Sentinel-2');
    expect(host.onPropertyChange).not.toHaveBeenCalled();
  });

  it('updates attributions and properties on the existing source, including clearing inputs', async () => {
    const { fixture, component, source } = await createHost();
    const host = fixture.componentInstance;
    const setAttributions = vi.spyOn(source, 'setAttributions');
    const setProperties = vi.spyOn(source, 'setProperties');
    host.attributions.set('© Updated');
    host.properties.set({ updated: true });
    fixture.detectChanges();
    expect(source.getAttributions()?.({} as never)).toEqual(['© Updated']);
    expect(source.get('updated')).toBe(true);
    expect(component.getInstance()).toBe(source);
    host.attributions.set(undefined);
    host.properties.set(undefined);
    fixture.detectChanges();
    expect(setAttributions).toHaveBeenLastCalledWith(undefined);
    expect(setProperties).toHaveBeenLastCalledWith({});
  });

  it('keeps constructor options and host binding unchanged until the source is remounted', async () => {
    const { fixture, component, source } = await createHost();
    const host = fixture.componentInstance;
    const layer = fixture.debugElement.query(By.directive(WolWebGLTileLayerComponent))
      .componentInstance as WolWebGLTileLayerComponent;
    const options: Options = {
      url: 'https://example.com/replacement.zarr',
      bands: ['b04', 'b03', 'b02'],
      storeOptions: { credentials: 'omit' },
      projection: 'EPSG:4326',
      transition: 0,
      wrapX: false,
      resample: 'nearest',
      dimensions: { time: 'new-label', band: [0, 1] },
      variable: 'reflectance',
      extent: [0, 0, 1, 1],
      flipY: true,
    };
    host.options.set(options);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.getInstance()).toBe(source);
    expect(layer.getInstance()?.getSource()).toBe(source);
    expect(source.constructorOptions.url).toBe('https://example.com/scene.zarr');
    expect(source.updateDimensions).not.toHaveBeenCalled();
    host.showSource.set(false);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.getInstance()).toBeUndefined();
    expect(layer.getInstance()?.getSource()).toBeNull();
    host.showSource.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    const replacement = sourceComponent(fixture).getInstance() as unknown as FakeSource;
    expect(replacement).not.toBe(source);
    expect(replacement.constructorOptions).toEqual(options);
    expect(layer.getInstance()?.getSource()).toBe(replacement);
  });

  it.each(events)(
    'forwards the original %s event through the template output',
    async (name, event) => {
      const { fixture, source } = await createHost();
      source.dispatchEvent(event);
      expect(fixture.componentInstance[name]).toHaveBeenCalledExactlyOnceWith(event);
    },
  );

  it('unsubscribes every event, unbinds the host and clears the public instance on destroy', async () => {
    const { fixture, component, source } = await createHost();
    const layer = fixture.debugElement.query(By.directive(WolWebGLTileLayerComponent))
      .componentInstance as WolWebGLTileLayerComponent;
    const host = fixture.componentInstance;
    host.showSource.set(false);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(layer.getInstance()?.getSource()).toBeNull();
    expect(component.getInstance()).toBeUndefined();
    for (const [name, event] of events) {
      host[name].mockClear();
      source.dispatchEvent(event);
      expect(host[name]).not.toHaveBeenCalled();
    }
  });

  it('reports the missing compatible host clearly', () => {
    expect(() => TestBed.createComponent(MissingHostComponent)).toThrow(
      'No TileSource host found. Please wrap the GeoZarrSource component in a RasterSource, WebGLTileLayer, FlowLayer or TileLayer component.',
    );
  });

  it('registers and removes the source through Tile, Flow and Raster hosts', async () => {
    const fixture = TestBed.createComponent(OtherHostsComponent);
    fixture.detectChanges();
    const raster = fixture.debugElement.query(By.directive(WolRasterSourceComponent))
      .componentInstance as WolRasterSourceComponent;
    const addSource = vi.spyOn(raster, 'addSource');
    const removeSource = vi.spyOn(raster, 'removeSource');
    await fixture.whenStable();
    const components = fixture.debugElement.queryAll(By.directive(WolGeoZarrSourceComponent));
    const sources = components.map((node) => node.componentInstance.getInstance());
    const tileLayer = fixture.debugElement.query(By.directive(WolTileLayerComponent))
      .componentInstance as WolTileLayerComponent;
    const flowLayer = fixture.debugElement.query(By.directive(WolFlowLayerComponent))
      .componentInstance as WolFlowLayerComponent;
    expect(tileLayer.getInstance()?.getSource()).toBe(sources[0]);
    expect(flowLayer.getInstance()?.getSource()).toBe(sources[1]);
    expect(addSource).toHaveBeenCalledExactlyOnceWith(sources[2]);
    fixture.componentInstance.showSource.set(false);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(tileLayer.getInstance()?.getSource()).toBeNull();
    expect(flowLayer.getInstance()?.getSource()).toBeNull();
    expect(removeSource).toHaveBeenCalledExactlyOnceWith(sources[2]);
    for (const node of components) expect(node.componentInstance.getInstance()).toBeUndefined();
  });

  it('requires the public URL input', () => {
    TestBed.overrideComponent(WolGeoZarrSourceComponent, {
      add: {
        providers: [{ provide: WolTileLayerComponent, useValue: { getInstance: () => undefined } }],
      },
    });
    const fixture = TestBed.createComponent(WolGeoZarrSourceComponent);
    expect(() => fixture.componentInstance.wolUrl()).toThrow(
      'Input is required but no value is available yet',
    );
  });

  it('returns undefined before rendering and after destruction before the first render', () => {
    const layer = { getInstance: () => undefined };
    TestBed.overrideComponent(WolGeoZarrSourceComponent, {
      add: { providers: [{ provide: WolTileLayerComponent, useValue: layer }] },
    });
    const fixture = TestBed.createComponent(WolGeoZarrSourceComponent);
    fixture.componentRef.setInput('wolUrl', 'https://example.com/scene.zarr');
    expect(fixture.componentInstance.getInstance()).toBeUndefined();
    fixture.destroy();
    expect(fixture.componentInstance.getInstance()).toBeUndefined();
  });

  it('never binds to the host if destroyed between rendering and deferred mounting', async () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    const component = sourceComponent(fixture);
    const source = component.getInstance();
    const layer = fixture.debugElement.query(By.directive(WolWebGLTileLayerComponent))
      .componentInstance as WolWebGLTileLayerComponent;
    const instance = layer.getInstance();
    expect(source).toBeDefined();
    if (!instance) throw new Error('WebGLTile host instance was not created');
    const setSource = vi.spyOn(instance, 'setSource');
    fixture.componentInstance.showSource.set(false);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(setSource).not.toHaveBeenCalledWith(source);
    expect(instance?.getSource()).toBeNull();
    expect(component.getInstance()).toBeUndefined();
  });
});
