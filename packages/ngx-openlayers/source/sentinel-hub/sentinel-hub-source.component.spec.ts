import { ChangeDetectionStrategy, Component, ErrorHandler, signal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ObjectEvent } from 'ol/Object';
import BaseEvent from 'ol/events/Event';
import TileLayer from 'ol/layer/Tile';
import { Size } from 'ol/size';
import SentinelHub, {
  AuthConfig,
  Evalscript,
  ProcessRequestInputDataItem,
} from 'ol/source/SentinelHub';
import { TileSourceEvent } from 'ol/source/Tile';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolTileLayerComponent } from '@workletjs/ngx-openlayers/layer/tile';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolSentinelHubSourceComponent } from './sentinel-hub-source.component';

async function createSentinelHubInstance(
  setup?: (c: TestSentinelHubSourceComponent) => void,
): Promise<SentinelHub> {
  const f = TestBed.createComponent(TestSentinelHubSourceComponent);
  setup?.(f.componentInstance);
  f.detectChanges();
  await f.whenStable();
  return f.debugElement
    .query(By.directive(WolSentinelHubSourceComponent))
    .componentInstance.getInstance() as SentinelHub;
}

function configureProcessing(c: TestSentinelHubSourceComponent): void {
  c.auth.set('test-token');
  c.data.set([{ type: 'S2L2A' }]);
  c.evalscript.set('//VERSION=3\nfunction evaluatePixel(s){return[s.B04,s.B03,s.B02]}');
}

function expectProcessRequestFormat(source: SentinelHub, format: string): void {
  const fetchSpy = vi
    .spyOn(globalThis, 'fetch')
    .mockRejectedValue(new Error('Processing request is mocked'));

  try {
    const tile = source.getTile(0, 0, 0, 1);
    expect(tile).not.toBeNull();
    tile?.load();

    expect(fetchSpy).toHaveBeenCalledOnce();
    const requestBody = JSON.parse(fetchSpy.mock.calls[0][1]?.body as string);
    expect(requestBody).toMatchObject({
      output: { responses: [{ format: { type: format } }] },
    });
  } finally {
    fetchSpy.mockRestore();
  }
}

@Component({
  selector: 'wol-test-sentinel-hub-source',
  imports: [
    WolMapComponent,
    WolViewComponent,
    WolTileLayerComponent,
    WolSentinelHubSourceComponent,
  ],
  template: `
    <wol-map>
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="2" />
      <wol-tile-layer>
        @if (!destroySource()) {
          <wol-sentinel-hub-source
            [wolAttributions]="attributions()"
            [wolAttributionCollapsible]="attributionCollapsible()"
            [wolAuth]="auth()"
            [wolData]="data()"
            [wolEvalscript]="evalscript()"
            [wolFormat]="format()"
            [wolTileSize]="tileSize()"
            [wolUrl]="url()"
            [wolInterpolate]="interpolate()"
            [wolWrapX]="wrapX()"
            [wolTransition]="transition()"
            [wolProperties]="properties()"
          />
        }
      </wol-tile-layer>
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestSentinelHubSourceComponent {
  attributions = signal<string | undefined>(undefined);
  attributionCollapsible = signal<boolean | undefined>(undefined);
  auth = signal<AuthConfig | string | undefined>(undefined);
  data = signal<ProcessRequestInputDataItem[] | undefined>(undefined);
  evalscript = signal<Evalscript | string | undefined>(undefined);
  format = signal<string | undefined>(undefined);
  tileSize = signal<number | Size | undefined>(undefined);
  url = signal<string | undefined>(undefined);
  interpolate = signal<boolean | undefined>(undefined);
  wrapX = signal<boolean | undefined>(undefined);
  transition = signal<number | undefined>(undefined);
  properties = signal<WolProperties | undefined>(undefined);
  destroySource = signal(false);
}

describe('WolSentinelHubSourceComponent', () => {
  let fixture: ComponentFixture<TestSentinelHubSourceComponent>;
  let testComponent: TestSentinelHubSourceComponent;
  let component: WolSentinelHubSourceComponent;
  let tileLayerComponent: WolTileLayerComponent;
  let sentinelHub: SentinelHub;
  let olTileLayer: TileLayer;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestSentinelHubSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestSentinelHubSourceComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    testComponent = fixture.componentInstance;
    component = fixture.debugElement.query(
      By.directive(WolSentinelHubSourceComponent),
    ).componentInstance;
    tileLayerComponent = fixture.debugElement.query(
      By.directive(WolTileLayerComponent),
    ).componentInstance;
    sentinelHub = component.getInstance() as SentinelHub;
    olTileLayer = tileLayerComponent.getInstance() as TileLayer;
  });

  // --- Creation ---

  it('should create the SentinelHub source', () => {
    expect(component).toBeTruthy();
    expect(sentinelHub).toBeInstanceOf(SentinelHub);
  });

  it('should register the source on the tile layer', fakeAsync(() => {
    flush();
    expect(olTileLayer.getSource()).toBe(sentinelHub);
  }));

  // --- Initialization (per input) ---

  it('should initialize with wolAttributions', async () => {
    const inst = await createSentinelHubInstance((c) => c.attributions.set('© Sentinel'));
    expect(inst.getAttributions()).toBeTruthy();
  });

  it('should initialize with wolAttributionCollapsible = false', async () => {
    const inst = await createSentinelHubInstance((c) => c.attributionCollapsible.set(false));
    expect(inst).toBeInstanceOf(SentinelHub);
  });

  it('should initialize with wolAuth as string token', async () => {
    const inst = await createSentinelHubInstance((c) => c.auth.set('my-access-token'));
    expect(inst).toBeInstanceOf(SentinelHub);
  });

  it('should initialize with wolData', async () => {
    const data: ProcessRequestInputDataItem[] = [{ type: 'S2L2A' }];
    const inst = await createSentinelHubInstance((c) => c.data.set(data));
    expect(inst).toBeInstanceOf(SentinelHub);
  });

  it('should initialize with wolEvalscript as string', async () => {
    const inst = await createSentinelHubInstance((c) =>
      c.evalscript.set('//VERSION=3\nfunction evaluatePixel(s){return[s.B04,s.B03,s.B02]}'),
    );
    expect(inst).toBeInstanceOf(SentinelHub);
  });

  it('should request PNG by default when wolFormat is undefined', async () => {
    const inst = await createSentinelHubInstance(configureProcessing);
    expectProcessRequestFormat(inst, 'image/png');
  });

  it.each(['image/png', 'image/jpeg', 'image/webp'])(
    'should initialize with wolFormat = %s',
    async (format) => {
      const inst = await createSentinelHubInstance((c) => {
        configureProcessing(c);
        c.format.set(format);
      });

      expectProcessRequestFormat(inst, format);
    },
  );

  it('should reject unsupported wolFormat during initialization', async () => {
    const errorSpy = vi
      .spyOn(TestBed.inject(ErrorHandler), 'handleError')
      .mockImplementation(() => undefined);

    try {
      const inst = await createSentinelHubInstance((c) => c.format.set('image/tiff'));

      expect(inst).toBeUndefined();
      expect(errorSpy).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
          message: expect.stringContaining('Unsupported format: image/tiff'),
        }),
      );
    } finally {
      errorSpy.mockRestore();
    }
  });

  it('should initialize with wolTileSize', async () => {
    const inst = await createSentinelHubInstance((c) => c.tileSize.set(512));
    expect(inst).toBeInstanceOf(SentinelHub);
  });

  it('should initialize with wolUrl', async () => {
    const inst = await createSentinelHubInstance((c) =>
      c.url.set('https://services.sentinel-hub.com/api/v1/process'),
    );
    expect(inst).toBeInstanceOf(SentinelHub);
  });

  it('should initialize with wolInterpolate = false', async () => {
    const inst = await createSentinelHubInstance((c) => c.interpolate.set(false));
    expect(inst).toBeInstanceOf(SentinelHub);
  });

  it('should initialize with wolWrapX = false', async () => {
    const inst = await createSentinelHubInstance((c) => c.wrapX.set(false));
    expect(inst).toBeInstanceOf(SentinelHub);
  });

  it('should initialize with wolTransition', async () => {
    const inst = await createSentinelHubInstance((c) => c.transition.set(250));
    expect(inst).toBeInstanceOf(SentinelHub);
  });

  it('should initialize with wolProperties', async () => {
    const inst = await createSentinelHubInstance((c) =>
      c.properties.set({ label: 'test-sentinel' }),
    );
    expect(inst.getProperties()).toMatchObject({ label: 'test-sentinel' });
  });

  // --- ngOnChanges ---

  it('should update attributions when wolAttributions changes', () => {
    const spy = vi.spyOn(sentinelHub, 'setAttributions');
    testComponent.attributions.set('© Updated');
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith('© Updated');
  });

  it('should update auth when wolAuth changes', () => {
    const spy = vi.spyOn(sentinelHub, 'setAuth');
    testComponent.auth.set('new-token');
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith('new-token');
  });

  it('should update data when wolData changes', () => {
    const spy = vi.spyOn(sentinelHub, 'setData');
    const data: ProcessRequestInputDataItem[] = [{ type: 'S2L1C' }];
    testComponent.data.set(data);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(data);
  });

  it('should update evalscript when wolEvalscript changes', () => {
    const spy = vi.spyOn(sentinelHub, 'setEvalscript');
    const script = '//VERSION=3\nfunction evaluatePixel(s){return[s.B08]}';
    testComponent.evalscript.set(script);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(script);
  });

  it.each(['image/jpeg', 'image/webp'])(
    'should update the process response and cache key when wolFormat changes to %s',
    (format) => {
      configureProcessing(testComponent);
      fixture.detectChanges();
      const previousKey = sentinelHub.getKey();
      const spy = vi.spyOn(sentinelHub, 'setFormat');

      testComponent.format.set(format);
      fixture.detectChanges();

      expect(spy).toHaveBeenCalledExactlyOnceWith(format);
      expect(component.getInstance()).toBe(sentinelHub);
      expect(olTileLayer.getSource()).toBe(sentinelHub);
      expect(sentinelHub.getKey()).not.toBe(previousKey);
      expectProcessRequestFormat(sentinelHub, format);
    },
  );

  it('should reset process responses to PNG when wolFormat becomes undefined', () => {
    configureProcessing(testComponent);
    fixture.detectChanges();
    const pngKey = sentinelHub.getKey();

    testComponent.format.set('image/jpeg');
    fixture.detectChanges();
    const jpegKey = sentinelHub.getKey();
    const spy = vi.spyOn(sentinelHub, 'setFormat');

    testComponent.format.set(undefined);
    fixture.detectChanges();

    expect(spy).toHaveBeenCalledExactlyOnceWith('image/png');
    expect(component.getInstance()).toBe(sentinelHub);
    expect(sentinelHub.getKey()).not.toBe(jpegKey);
    expect(sentinelHub.getKey()).toBe(pngKey);
    expectProcessRequestFormat(sentinelHub, 'image/png');
  });

  it('should preserve the previous format when an unsupported wolFormat update is rejected', () => {
    configureProcessing(testComponent);
    fixture.detectChanges();
    const previousKey = sentinelHub.getKey();

    testComponent.format.set('image/tiff');
    expect(() => fixture.detectChanges()).toThrow('Unsupported format: image/tiff');

    expect(component.getInstance()).toBe(sentinelHub);
    expect(sentinelHub.getKey()).toBe(previousKey);
    expectProcessRequestFormat(sentinelHub, 'image/png');
  });

  it('should update properties when wolProperties changes', () => {
    const spy = vi.spyOn(sentinelHub, 'setProperties');
    const newProps: WolProperties = { updated: true };
    testComponent.properties.set(newProps);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith(newProps);
  });

  // --- Outputs ---

  it('should emit wolChange when the source fires a change event', () => {
    const spy = vi.spyOn(component.wolChange, 'emit');
    const event = new BaseEvent('change');
    sentinelHub.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolError when the source fires an error event', () => {
    const spy = vi.spyOn(component.wolError, 'emit');
    const event = new BaseEvent('error');
    sentinelHub.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolPropertyChange when the source fires a propertychange event', () => {
    const spy = vi.spyOn(component.wolPropertyChange, 'emit');
    const event = new ObjectEvent('propertychange', 'key', undefined);
    sentinelHub.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolTileLoadEnd when the source fires a tileloadend event', () => {
    const spy = vi.spyOn(component.wolTileLoadEnd, 'emit');
    const event = new TileSourceEvent('tileloadend', undefined as never);
    sentinelHub.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolTileLoadError when the source fires a tileloaderror event', () => {
    const spy = vi.spyOn(component.wolTileLoadError, 'emit');
    const event = new TileSourceEvent('tileloaderror', undefined as never);
    sentinelHub.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolTileLoadStart when the source fires a tileloadstart event', () => {
    const spy = vi.spyOn(component.wolTileLoadStart, 'emit');
    const event = new TileSourceEvent('tileloadstart', undefined as never);
    sentinelHub.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  // --- Lifecycle / Destroy ---

  it('should remove the source from the tile layer when destroyed', fakeAsync(() => {
    flush();
    expect(olTileLayer.getSource()).toBe(sentinelHub);

    testComponent.destroySource.set(true);
    fixture.detectChanges();

    expect(component.getInstance()).toBeUndefined();
    expect(olTileLayer.getSource()).toBeNull();
  }));
});
