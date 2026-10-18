import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import MapBrowserEvent from 'ol/MapBrowserEvent';

import { WolMapComponent } from '@workletjs/ngx-openlayers/map';

import { ComponentUsageExampleComponent } from './component-usage-example.component';

describe('Component Usage example', () => {
  async function renderExample() {
    const fixture = TestBed.createComponent(ComponentUsageExampleComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  it('synchronizes zoom between application state and the real OpenLayers View', async () => {
    const fixture = await renderExample();
    const view = fixture.componentInstance.view()?.getInstance();
    expect(view).toBeDefined();
    expect(view?.getZoom()).toBe(2);

    const buttons = fixture.nativeElement.querySelectorAll('button');
    buttons[0].click();
    fixture.detectChanges();
    expect(view?.getZoom()).toBe(3);

    view?.setZoom(5);
    fixture.detectChanges();
    expect(fixture.componentInstance.zoom()).toBe(5);
    expect(fixture.nativeElement.textContent).toContain('Zoom: 5');
    fixture.destroy();
  });

  it('receives the OpenLayers map event through the component output', async () => {
    const fixture = await renderExample();
    const map = fixture.debugElement
      .query(By.directive(WolMapComponent))
      .componentInstance.getInstance();
    // jsdom has no PointerEvent constructor; this payload only reads the OL coordinate.
    const originalEvent = new MouseEvent('click') as PointerEvent;
    const event = new MapBrowserEvent('singleclick', map, originalEvent);
    event.coordinate = [120, 30];
    map.dispatchEvent(event);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Last click: 120, 30');
    fixture.destroy();
  });

  it('guards instance access and resets the real View from the rendered action', async () => {
    const fixture = TestBed.createComponent(ComponentUsageExampleComponent);
    expect(() => fixture.componentInstance.resetView()).not.toThrow();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const view = fixture.componentInstance.view()?.getInstance();
    expect(view).toBeDefined();
    if (!view) {
      throw new Error('Expected the rendered View instance');
    }
    view.setCenter([120, 30]);
    view.setZoom(5);
    fixture.detectChanges();
    expect(fixture.componentInstance.zoom()).toBe(5);
    fixture.nativeElement.querySelectorAll('button')[1].click();
    fixture.detectChanges();
    expect(view.getCenter()).toEqual([0, 0]);
    expect(view.getZoom()).toBe(2);
    expect(fixture.componentInstance.zoom()).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('Zoom: 2');
    fixture.destroy();
    expect(fixture.componentInstance.view()?.getInstance()).toBeUndefined();
    expect(() => fixture.componentInstance.resetView()).not.toThrow();
  });
});
