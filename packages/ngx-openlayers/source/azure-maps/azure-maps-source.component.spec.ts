import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ObjectEvent } from 'ol/Object';
import BaseEvent from 'ol/events/Event';
import TileLayer from 'ol/layer/Tile';
import { TileSourceEvent } from 'ol/source/Tile';
import XYZ from 'ol/source/XYZ';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolTileLayerComponent } from '@workletjs/ngx-openlayers/layer/tile';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolAzureMapsSourceComponent } from './azure-maps-source.component';

@Component({
  selector: 'wol-test-azure-maps-source',
  imports: [WolMapComponent, WolViewComponent, WolTileLayerComponent, WolAzureMapsSourceComponent],
  template: `
    <wol-map>
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="2" />
      <wol-tile-layer>
        @if (!destroySource()) {
          <wol-azure-maps-source
            [wolSubscriptionKey]="subscriptionKey()"
            [wolTilesetId]="tilesetId()"
            [wolAttributions]="attributions()"
            [wolTileSize]="tileSize()"
            [wolLanguage]="language()"
            [wolView]="view()"
            [wolProperties]="properties()"
          />
        }
      </wol-tile-layer>
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestAzureMapsSourceComponent {
  subscriptionKey = signal('key with spaces');
  tilesetId = signal('microsoft.base.road');
  attributions = signal<string | undefined>(undefined);
  tileSize = signal<256 | 512>(256);
  language = signal<string | undefined>(undefined);
  view = signal<string | undefined>(undefined);
  properties = signal<WolProperties | undefined>(undefined);
  destroySource = signal(false);
}

describe('WolAzureMapsSourceComponent', () => {
  let fixture: ComponentFixture<TestAzureMapsSourceComponent>;
  let testComponent: TestAzureMapsSourceComponent;
  let component: WolAzureMapsSourceComponent;
  let azureMaps: XYZ;
  let tileLayer: TileLayer;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestAzureMapsSourceComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(TestAzureMapsSourceComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    testComponent = fixture.componentInstance;
    component = fixture.debugElement.query(
      By.directive(WolAzureMapsSourceComponent),
    ).componentInstance;
    azureMaps = component.getInstance() as XYZ;
    tileLayer = fixture.debugElement
      .query(By.directive(WolTileLayerComponent))
      .componentInstance.getInstance();
  });

  it('creates and registers an XYZ source', fakeAsync(() => {
    flush();
    expect(azureMaps).toBeInstanceOf(XYZ);
    expect(tileLayer.getSource()).toBe(azureMaps);
  }));

  it('builds an encoded Azure Maps raster tile URL', () => {
    const url = azureMaps.getUrls()?.[0];
    expect(url).toContain('subscription-key=key%20with%20spaces');
    expect(url).toContain('api-version=2024-04-01');
    expect(url).toContain('tilesetId=microsoft.base.road');
    expect(url).toContain('tileSize=256');
    expect(url).toContain('zoom={z}&x={x}&y={y}');
  });

  it('includes optional Azure Maps tile parameters', () => {
    testComponent.tileSize.set(512);
    testComponent.language.set('en-US');
    testComponent.view.set('AR');
    fixture.detectChanges();

    const url = azureMaps.getUrls()?.[0];
    expect(url).toContain('tileSize=512');
    expect(url).toContain('language=en-US');
    expect(url).toContain('view=AR');
  });

  it('updates source properties and attributions', () => {
    const attributionSpy = vi.spyOn(azureMaps, 'setAttributions');
    const propertiesSpy = vi.spyOn(azureMaps, 'setProperties');
    testComponent.attributions.set('© Azure Maps');
    testComponent.properties.set({ label: 'azure' });
    fixture.detectChanges();

    expect(attributionSpy).toHaveBeenCalledWith('© Azure Maps');
    expect(propertiesSpy).toHaveBeenCalledWith({ label: 'azure' });
  });

  it('forwards source events', () => {
    const change = new BaseEvent('change');
    const error = new BaseEvent('error');
    const propertyChange = new ObjectEvent('propertychange', 'key', undefined);
    const tileLoadEnd = new TileSourceEvent('tileloadend', undefined as never);
    const tileLoadError = new TileSourceEvent('tileloaderror', undefined as never);
    const tileLoadStart = new TileSourceEvent('tileloadstart', undefined as never);

    vi.spyOn(component.wolChange, 'emit');
    vi.spyOn(component.wolError, 'emit');
    vi.spyOn(component.wolPropertyChange, 'emit');
    vi.spyOn(component.wolTileLoadEnd, 'emit');
    vi.spyOn(component.wolTileLoadError, 'emit');
    vi.spyOn(component.wolTileLoadStart, 'emit');
    azureMaps.dispatchEvent(change);
    azureMaps.dispatchEvent(error);
    azureMaps.dispatchEvent(propertyChange);
    azureMaps.dispatchEvent(tileLoadEnd);
    azureMaps.dispatchEvent(tileLoadError);
    azureMaps.dispatchEvent(tileLoadStart);

    expect(component.wolChange.emit).toHaveBeenCalledWith(change);
    expect(component.wolError.emit).toHaveBeenCalledWith(error);
    expect(component.wolPropertyChange.emit).toHaveBeenCalledWith(propertyChange);
    expect(component.wolTileLoadEnd.emit).toHaveBeenCalledWith(tileLoadEnd);
    expect(component.wolTileLoadError.emit).toHaveBeenCalledWith(tileLoadError);
    expect(component.wolTileLoadStart.emit).toHaveBeenCalledWith(tileLoadStart);
  });

  it('removes the source when the component is destroyed', fakeAsync(() => {
    flush();
    testComponent.destroySource.set(true);
    fixture.detectChanges();

    expect(component.getInstance()).toBeUndefined();
    expect(tileLayer.getSource()).toBeNull();
  }));
});
