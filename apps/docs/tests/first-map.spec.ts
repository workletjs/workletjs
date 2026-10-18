import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';

import { WolMapComponent } from '@workletjs/ngx-openlayers/map';

import { FirstMapExampleComponent } from '../ng-doc/get-started/first-map/examples/first-map-example.component';

describe('First Map example', () => {
  it('creates a keyboard-focusable map with the documented View and OSM layer', async () => {
    const fixture = TestBed.createComponent(FirstMapExampleComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const mapElement = fixture.debugElement.query(By.directive(WolMapComponent));
    const map = (mapElement.componentInstance as WolMapComponent).getInstance();
    expect(map).toBeInstanceOf(Map);
    expect(map?.getTarget()).toBe(mapElement.nativeElement);
    expect(mapElement.nativeElement.getAttribute('tabindex')).toBe('0');
    expect(getComputedStyle(mapElement.nativeElement).height).toBe('400px');
    expect(map?.getView()).toBeInstanceOf(View);
    expect(map?.getView().getCenter()).toEqual([0, 0]);
    expect(map?.getView().getZoom()).toBe(2);
    expect(map?.getLayers().getLength()).toBe(1);
    const layer = map?.getLayers().item(0);
    expect(layer).toBeInstanceOf(TileLayer);
    expect((layer as TileLayer<OSM>).getSource()).toBeInstanceOf(OSM);
    fixture.destroy();
    expect(map?.getTarget()).toBeNull();
  });
});
