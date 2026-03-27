import { vi } from 'vitest';

import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { LoadFunction } from 'ol/Image';
import OGCMap from 'ol/source/OGCMap';
import { AttributionLike } from 'ol/source/Source';

import { WolImageLayerComponent } from '@workletjs/ngx-openlayers/layer/image';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolOGCMapSourceComponent } from './ogc-map-source.component';

const internals = (obj: object) => obj as unknown as Record<string, unknown>;

@Component({
  selector: 'wol-test-ogc-map-source',
  template: `
    <wol-map>
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="2" />
      <wol-image-layer>
        <wol-ogc-map-source
          [wolUrl]="url()"
          [wolAttributions]="attributions()"
          [wolParams]="params()"
          [wolHidpi]="hidpi()"
          [wolReferrerPolicy]="referrerPolicy()"
          [wolImageLoadFunction]="imageLoadFunction()"
          [wolProperties]="properties()"
        />
      </wol-image-layer>
    </wol-map>
  `,
  imports: [WolMapComponent, WolViewComponent, WolImageLayerComponent, WolOGCMapSourceComponent],
})
class TestOGCMapSourceComponent {
  url = signal<string | undefined>('https://example.com/ogc/maps');
  attributions = signal<AttributionLike | undefined>(undefined);
  params = signal<Record<string, unknown> | undefined>(undefined);
  hidpi = signal<boolean | undefined>(undefined);
  referrerPolicy = signal<ReferrerPolicy | undefined>(undefined);
  imageLoadFunction = signal<LoadFunction | undefined>(undefined);
  properties = signal<Record<string, unknown> | undefined>(undefined);
}

describe('WolOGCMapSourceComponent', () => {
  let fixture: ComponentFixture<TestOGCMapSourceComponent>;
  let testComponent: TestOGCMapSourceComponent;
  let component: WolOGCMapSourceComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestOGCMapSourceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestOGCMapSourceComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    testComponent = fixture.componentInstance;
    component = fixture.debugElement.query(
      By.directive(WolOGCMapSourceComponent),
    ).componentInstance;
  });

  it('should create the OGCMap source', fakeAsync(() => {
    flush();
    expect(component).toBeTruthy();
    expect(component.getInstance()).toBeInstanceOf(OGCMap);
  }));

  it('should initialize with url from input', fakeAsync(() => {
    flush();
    const instance = component.getInstance()!;
    expect(instance.getUrl()).toBe('https://example.com/ogc/maps');
  }));

  it('should initialize with hidpi from input', async () => {
    const freshFixture = TestBed.createComponent(TestOGCMapSourceComponent);
    freshFixture.componentInstance.hidpi.set(false);
    freshFixture.detectChanges();
    await freshFixture.whenStable();
    freshFixture.detectChanges();

    const freshComponent: WolOGCMapSourceComponent = freshFixture.debugElement.query(
      By.directive(WolOGCMapSourceComponent),
    ).componentInstance;
    const instance = freshComponent.getInstance()!;
    expect(internals(instance)['hidpi_']).toBe(false);
  });

  it('should initialize with referrerPolicy from input', async () => {
    const freshFixture = TestBed.createComponent(TestOGCMapSourceComponent);
    freshFixture.componentInstance.referrerPolicy.set('no-referrer');
    freshFixture.detectChanges();
    await freshFixture.whenStable();
    freshFixture.detectChanges();

    const freshComponent: WolOGCMapSourceComponent = freshFixture.debugElement.query(
      By.directive(WolOGCMapSourceComponent),
    ).componentInstance;
    const instance = freshComponent.getInstance()!;
    expect(internals(instance)['referrerPolicy_']).toBe('no-referrer');
  });

  it('should update url via wolUrl ngOnChanges', fakeAsync(() => {
    flush();
    const instance = component.getInstance()!;
    testComponent.url.set('https://example.com/ogc/maps/v2');
    fixture.detectChanges();
    flush();
    expect(instance.getUrl()).toBe('https://example.com/ogc/maps/v2');
  }));

  it('should update params via wolParams ngOnChanges', fakeAsync(() => {
    flush();
    const instance = component.getInstance()!;
    testComponent.params.set({ format: 'image/png' });
    fixture.detectChanges();
    flush();
    expect(instance.getParams()).toEqual({ format: 'image/png' });
  }));

  it('should update imageLoadFunction via wolImageLoadFunction ngOnChanges', fakeAsync(() => {
    flush();
    const instance = component.getInstance()!;
    const customLoader: LoadFunction = vi.fn();
    testComponent.imageLoadFunction.set(customLoader);
    fixture.detectChanges();
    flush();
    expect(instance.getImageLoadFunction()).toBe(customLoader);
  }));

  it('should update attributions via wolAttributions ngOnChanges', fakeAsync(() => {
    flush();
    const instance = component.getInstance()!;
    const spySetAttr = vi.spyOn(instance, 'setAttributions');
    testComponent.attributions.set('New attribution');
    fixture.detectChanges();
    flush();
    expect(spySetAttr).toHaveBeenCalledWith('New attribution');
  }));

  it('should emit wolChange event', fakeAsync(() => {
    flush();
    const instance = component.getInstance()!;
    const emitSpy = vi.spyOn(component.wolChange, 'emit');
    instance.dispatchEvent('change');
    expect(emitSpy).toHaveBeenCalled();
  }));

  it('should emit wolError event', fakeAsync(() => {
    flush();
    const instance = component.getInstance()!;
    const emitSpy = vi.spyOn(component.wolError, 'emit');
    instance.dispatchEvent('error');
    expect(emitSpy).toHaveBeenCalled();
  }));
});
