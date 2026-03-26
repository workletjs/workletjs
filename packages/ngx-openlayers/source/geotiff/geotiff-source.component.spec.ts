import { vi } from 'vitest';

import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import GeoTIFFSource from 'ol/source/GeoTIFF';
import { AttributionLike } from 'ol/source/Source';

import { WolWebGLTileLayerComponent } from '@workletjs/ngx-openlayers/layer/webgl-tile';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';

import { WolGeoTIFFSourceComponent } from './geotiff-source.component';

vi.mock('ol/source/GeoTIFF', () => {
  const Constructor = vi.fn().mockImplementation(() => ({
    on: vi.fn().mockReturnValue({ key: 'mock-key' }),
    setAttributions: vi.fn(),
    setProperties: vi.fn(),
  }));
  return { default: Constructor };
});

@Component({
  selector: 'wol-test-geotiff',
  template: `
    <wol-map>
      <wol-webgl-tile-layer>
        <wol-geotiff-source [wolSources]="sources()" [wolAttributions]="attributions()" />
      </wol-webgl-tile-layer>
    </wol-map>
  `,
  imports: [WolMapComponent, WolWebGLTileLayerComponent, WolGeoTIFFSourceComponent],
})
class TestGeoTIFFSourceComponent {
  sources = signal([{ url: 'https://example.com/test.tif' }]);
  attributions = signal<AttributionLike | undefined>(undefined);
}

describe('WolGeoTIFFSourceComponent', () => {
  let fixture: ComponentFixture<TestGeoTIFFSourceComponent>;
  let component: WolGeoTIFFSourceComponent;

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [TestGeoTIFFSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestGeoTIFFSourceComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    component = fixture.debugElement.query(
      By.directive(WolGeoTIFFSourceComponent),
    ).componentInstance;
  });

  it('should create', fakeAsync(() => {
    flush();
    expect(component).toBeTruthy();
    expect(GeoTIFFSource).toHaveBeenCalled();
  }));

  it('should pass attributions to the GeoTIFF constructor', async () => {
    vi.clearAllMocks();

    const freshFixture = TestBed.createComponent(TestGeoTIFFSourceComponent);
    freshFixture.componentInstance.attributions.set('Test attribution');
    freshFixture.detectChanges();
    await freshFixture.whenStable();
    freshFixture.detectChanges();

    expect(GeoTIFFSource).toHaveBeenCalledWith(
      expect.objectContaining({ attributions: 'Test attribution' }),
    );
  });
});
