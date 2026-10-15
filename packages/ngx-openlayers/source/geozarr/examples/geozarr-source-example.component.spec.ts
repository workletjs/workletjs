import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatInputHarness } from '@angular/material/input/testing';
import { MatSelectHarness } from '@angular/material/select/testing';
import { By } from '@angular/platform-browser';

import DataTile from 'ol/DataTile';
import View, { ViewOptions } from 'ol/View';
import DataTileSource from 'ol/source/DataTile';
import { Options } from 'ol/source/GeoZarr';
import OSM from 'ol/source/OSM';
import { TileSourceEvent } from 'ol/source/Tile';

import { WolWebGLTileLayerComponent } from '@workletjs/ngx-openlayers/layer/webgl-tile';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';

import { WolGeoZarrSourceComponent } from '../public-api';
import { WolGeoZarrSourceExampleComponent } from './geozarr-source-example.component';

// Exercise real map/source components and events, isolating only remote metadata/view completion.
vi.mock('ol/source/GeoZarr', () =>
  vi
    .importActual<typeof import('ol/source/DataTile')>('ol/source/DataTile')
    .then(({ default: Source }) => {
      class FakeGeoZarr extends Source {
        readonly constructorOptions: Options;
        readonly viewResult: Promise<ViewOptions>;
        resolveView!: (options: ViewOptions) => void;
        rejectView!: (reason: Error) => void;
        getView = vi.fn(() => this.viewResult);

        constructor(options: Options) {
          super({ state: 'loading' });
          this.constructorOptions = options;
          this.viewResult = new Promise((resolve, reject) => {
            this.resolveView = resolve;
            this.rejectView = reject;
          });
        }
      }
      return { default: FakeGeoZarr };
    }),
);

type FakeSource = DataTileSource & {
  constructorOptions: Options;
  resolveView: (options: ViewOptions) => void;
  rejectView: (reason: Error) => void;
  getView: ReturnType<typeof vi.fn>;
};

const urls = [
  'https://s3.explorer.eopf.copernicus.eu/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2C_MSIL2A_20260120T084301_N0511_R064_T36UXA_20260120T122910.zarr/measurements/reflectance',
  'https://s3.explorer.eopf.copernicus.eu/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260120T125339_N0511_R138_T27VWL_20260120T131151.zarr/measurements/reflectance',
];
const options: ViewOptions = {
  projection: 'EPSG:3857',
  extent: [0, 0, 100, 200],
  resolutions: [10, 5, 2.5],
};
const tile = new DataTile({ tileCoord: [0, 0, 0], loader: async () => new Float32Array(4) });

function current(fixture: ComponentFixture<WolGeoZarrSourceExampleComponent>) {
  const sourceComponent = fixture.debugElement.query(By.directive(WolGeoZarrSourceComponent))
    .componentInstance as WolGeoZarrSourceComponent;
  const mapComponent = fixture.debugElement.query(By.directive(WolMapComponent))
    .componentInstance as WolMapComponent;
  const map = mapComponent.getInstance();
  if (!map) throw new Error('Map instance was not created');
  return {
    sourceComponent,
    source: sourceComponent.getInstance() as unknown as FakeSource,
    mapComponent,
    map,
  };
}

async function createExample() {
  const fixture = TestBed.createComponent(WolGeoZarrSourceExampleComponent);
  fixture.detectChanges();
  await fixture.whenStable();
  const loader = TestbedHarnessEnvironment.loader(fixture);
  return {
    fixture,
    select: await loader.getHarness(MatSelectHarness),
    load: await loader.getHarness(MatButtonHarness.with({ text: 'Load' })),
    input: () => loader.getHarness(MatInputHarness),
  };
}

async function settle(fixture: ComponentFixture<WolGeoZarrSourceExampleComponent>) {
  await fixture.whenStable();
  fixture.detectChanges();
}

async function chooseScene(
  fixture: ComponentFixture<WolGeoZarrSourceExampleComponent>,
  select: MatSelectHarness,
  label: RegExp,
) {
  await select.open();
  const option = Array.from(document.querySelectorAll<HTMLElement>('[role="option"]')).find(
    (element) => label.test(element.textContent ?? ''),
  );
  if (!option) throw new Error(`Scene option not found: ${label}`);
  option.click();
  await settle(fixture);
}

async function makeReady(fixture: ComponentFixture<WolGeoZarrSourceExampleComponent>) {
  const active = current(fixture);
  active.source.setState('ready');
  active.source.resolveView(options);
  await settle(fixture);
  return active;
}

function text(fixture: ComponentFixture<WolGeoZarrSourceExampleComponent>) {
  return (fixture.nativeElement as HTMLElement).textContent;
}

describe('WolGeoZarrSourceExampleComponent', () => {
  it('automatically loads the first preset with RGB bands and an OSM basemap', async () => {
    const { fixture, select } = await createExample();
    const { source, map } = current(fixture);
    expect(await select.getValueText()).toContain("Krasnokuts'k");
    expect(source.constructorOptions).toMatchObject({
      url: urls[0],
      bands: ['b04', 'b03', 'b02'],
    });
    const layers = map.getLayers().getArray();
    expect(layers).toHaveLength(2);
    expect(layers[0].get('source')).toBeInstanceOf(OSM);
    expect(layers[1].get('source')).toBe(source);
    const layer = fixture.debugElement.queryAll(By.directive(WolWebGLTileLayerComponent))[1]
      .componentInstance as WolWebGLTileLayerComponent;
    expect(layer.wolStyle()).toEqual({
      gamma: 1.5,
      color: [
        'color',
        ['interpolate', ['linear'], ['band', 1], 0, 0, 0.5, 255],
        ['interpolate', ['linear'], ['band', 2], 0, 0, 0.5, 255],
        ['interpolate', ['linear'], ['band', 3], 0, 0, 0.5, 255],
      ],
    });
    expect(text(fixture)).toContain('Loading dataset metadata');
    expect(source.getView).not.toHaveBeenCalled();
  });

  it('keeps scene edits as a draft and rebuilds the map only after Load', async () => {
    const { fixture, select, load } = await createExample();
    const first = await makeReady(fixture);
    first.map.getView().setCenter([25, 30]);
    await chooseScene(fixture, select, /Hvolsvöllur/);
    expect(current(fixture).source).toBe(first.source);
    expect(current(fixture).map).toBe(first.map);
    await load.click();
    const second = current(fixture);
    expect(second.source).not.toBe(first.source);
    expect(second.map).not.toBe(first.map);
    expect(first.mapComponent.getInstance()).toBeUndefined();
    expect(first.sourceComponent.getInstance()).toBeUndefined();
    expect(second.source.constructorOptions.url).toBe(urls[1]);
    expect(second.map.getView()).not.toBe(first.map.getView());
    expect(second.map.getView().getCenter()).toBeUndefined();
    expect(text(fixture)).toContain('Loading dataset metadata');
  });

  it('shows Custom input, prevents blank URLs and applies a trimmed URL only after Load', async () => {
    const { fixture, select, load, input } = await createExample();
    const first = current(fixture);
    expect((fixture.nativeElement as HTMLElement).querySelector('input')).toBeNull();
    await chooseScene(fixture, select, /Custom/);
    const urlInput = await input();
    expect(await load.isDisabled()).toBe(true);
    await urlInput.setValue('   ');
    expect(await load.isDisabled()).toBe(true);
    await urlInput.setValue('  https://example.com/custom.zarr/measurements/reflectance  ');
    expect(await load.isDisabled()).toBe(false);
    expect(current(fixture).source).toBe(first.source);
    await load.click();
    expect(current(fixture).source.constructorOptions.url).toBe(
      'https://example.com/custom.zarr/measurements/reflectance',
    );
    await chooseScene(fixture, select, /Krasnokuts/);
    expect((fixture.nativeElement as HTMLElement).querySelector('input')).toBeNull();
    expect(await load.isDisabled()).toBe(false);
  });

  it('retries the same URL with a fresh source, map, view and status', async () => {
    const { fixture, load } = await createExample();
    const first = await makeReady(fixture);
    first.source.dispatchEvent(new TileSourceEvent('tileloaderror', tile));
    fixture.detectChanges();
    expect(text(fixture)).toContain('Some image tiles could not be loaded');
    await load.click();
    const second = current(fixture);
    expect(second.source.constructorOptions.url).toBe(first.source.constructorOptions.url);
    expect(second.source).not.toBe(first.source);
    expect(second.map).not.toBe(first.map);
    expect(second.map.getView().getCenter()).toBeUndefined();
    expect(text(fixture)).toContain('Loading dataset metadata');
    expect(text(fixture)).not.toContain('Some image tiles could not be loaded');
  });

  it('waits for ready and resolves the official transforms into a concrete View once', async () => {
    const { fixture } = await createExample();
    const { source, map } = current(fixture);
    source.changed();
    expect(source.getView).not.toHaveBeenCalled();
    source.setState('ready');
    source.changed();
    expect(source.getView).toHaveBeenCalledTimes(1);
    source.resolveView(options);
    await settle(fixture);
    const view = map.getView();
    expect(view).toBeInstanceOf(View);
    expect(view.getProjection().getCode()).toBe('EPSG:3857');
    expect(view.getCenter()).toEqual([50, 100]);
    expect(view.getZoom()).toBe(2);
    expect(view.getResolutions()).toEqual([20, 10, 5, 2.5, 1.25, 0.625]);
    expect(text(fixture)).toContain('Dataset ready');
    expect(text(fixture)).not.toContain('Loading dataset metadata');
  });

  it('reports metadata initialization failure from state/change without a native error event', async () => {
    const { fixture, load } = await createExample();
    const { source } = current(fixture);
    source.setState('error');
    fixture.detectChanges();
    expect(source.getView).not.toHaveBeenCalled();
    expect(text(fixture)).toContain('Could not load the dataset');
    expect(text(fixture)).toContain(
      'Check the URL, access permissions, and browser network requests',
    );
    expect(text(fixture)).not.toContain('Loading dataset metadata');
    expect(await load.isDisabled()).toBe(false);
    await load.click();
    expect(current(fixture).source).not.toBe(source);
    expect(text(fixture)).not.toContain('Could not load the dataset');
  });

  it('reports image tile failures separately from initialization failures', async () => {
    const { fixture } = await createExample();
    const { source } = await makeReady(fixture);
    source.dispatchEvent(new TileSourceEvent('tileloaderror', tile));
    fixture.detectChanges();
    expect(text(fixture)).toContain('Some image tiles could not be loaded');
    expect(text(fixture)).toContain('Dataset ready');
    expect(text(fixture)).not.toContain('Could not load the dataset');
  });

  it('reports a view-resolution failure and permits retry', async () => {
    const { fixture, load } = await createExample();
    const { source } = current(fixture);
    source.setState('ready');
    source.rejectView(new Error('View unavailable'));
    await settle(fixture);
    expect(text(fixture)).toContain('Could not configure the dataset view');
    expect(text(fixture)).not.toContain('Dataset ready');
    expect(await load.isDisabled()).toBe(false);
  });

  it.each(['resolve', 'reject'] as const)(
    'ignores an old view promise that completes with %s after a newer load',
    async (completion) => {
      const { fixture, load } = await createExample();
      const first = current(fixture);
      first.source.setState('ready');
      await load.click();
      const second = await makeReady(fixture);
      const activeView = second.map.getView();
      if (completion === 'resolve') {
        first.source.resolveView({ ...options, extent: [-500, -500, -100, -100] });
      } else {
        first.source.rejectView(new Error('Old request failed'));
      }
      await settle(fixture);
      expect(current(fixture).map.getView()).toBe(activeView);
      expect(activeView.getCenter()).toEqual([50, 100]);
      expect(text(fixture)).toContain('Dataset ready');
      expect(text(fixture)).not.toContain('Could not configure');
    },
  );

  it.each(['resolve', 'reject'] as const)(
    'ignores a pending view %s after the example is destroyed',
    async (completion) => {
      const { fixture } = await createExample();
      const active = current(fixture);
      active.source.setState('ready');
      const setView = vi.spyOn(active.map, 'setView');
      fixture.destroy();
      setView.mockClear();
      if (completion === 'resolve') active.source.resolveView(options);
      else active.source.rejectView(new Error('Late view failure'));
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(fixture.componentInstance.view()).toBeUndefined();
      expect(fixture.componentInstance.error()).toBeUndefined();
      expect(fixture.componentInstance.loading()).toBe(true);
      expect(setView).not.toHaveBeenCalled();
      expect(active.mapComponent.getInstance()).toBeUndefined();
      expect(active.sourceComponent.getInstance()).toBeUndefined();
    },
  );
});
