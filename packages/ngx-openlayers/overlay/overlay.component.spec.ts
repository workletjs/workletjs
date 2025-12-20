import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';

import { vi } from 'vitest';
import { Coordinate } from 'ol/coordinate';
import { ObjectEvent } from 'ol/Object';
import Map from 'ol/Map';
import BaseEvent from 'ol/events/Event';
import Overlay, { Positioning } from 'ol/Overlay';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';

import { WolOverlayComponent } from './overlay.component';

describe('WolOverlayComponent', () => {
  let fixture: ComponentFixture<TestOverlayComponent>;
  let testComponent: TestOverlayComponent;
  let mapComponent: WolMapComponent;
  let overlayComponent: WolOverlayComponent;

  beforeEach(() => {
    fixture = TestBed.createComponent(TestOverlayComponent);
    fixture.detectChanges();

    const mapDebugElement = fixture.debugElement.query(By.directive(WolMapComponent));
    const overlayDebugElement = fixture.debugElement.query(By.directive(WolOverlayComponent));

    testComponent = fixture.debugElement.componentInstance;
    mapComponent = mapDebugElement.componentInstance;
    overlayComponent = overlayDebugElement.componentInstance;
  });

  it('creates the overlay instance and registers it on the map', fakeAsync(() => {
    fixture.detectChanges();
    flush();

    const overlayInstance = overlayComponent.getInstance() as Overlay;
    const mapInstance = mapComponent.getInstance() as Map;

    expect(overlayInstance).toBeInstanceOf(Overlay);
    expect(mapInstance?.getOverlays().getArray()).toContain(overlayInstance);
  }));

  it('updates overlay options when bound inputs change', fakeAsync(() => {
    fixture.detectChanges();
    flush();

    testComponent.offset = [10, 20];
    testComponent.position = [5, 6];
    testComponent.positioning = 'bottom-center';
    testComponent.properties = { foo: 'bar' };

    fixture.detectChanges();
    flush();

    const overlayInstance = overlayComponent.getInstance() as Overlay;

    expect(overlayInstance.getOffset()).toEqual([10, 20]);
    expect(overlayInstance.getPosition()).toEqual([5, 6]);
    expect(overlayInstance.getPositioning()).toBe('bottom-center');
    expect(overlayInstance.get('foo')).toBe('bar');
  }));

  it('reattaches the portal when the element changes', fakeAsync(() => {
    fixture.detectChanges();
    flush();

    const overlayInstance = overlayComponent.getInstance() as Overlay;
    const firstElement = overlayInstance.getElement() as HTMLElement;
    expect(firstElement.querySelector('.overlay-content')?.textContent).toContain(
      testComponent.content,
    );

    const nextElement = document.createElement('div');
    testComponent.element = nextElement;
    fixture.detectChanges();
    flush();

    expect(nextElement.querySelector('.overlay-content')?.textContent).toContain(
      testComponent.content,
    );
    expect(firstElement.querySelector('.overlay-content')).toBeNull();
  }));

  it('emits overlay events', fakeAsync(() => {
    fixture.detectChanges();
    flush();

    const overlayInstance = overlayComponent.getInstance() as Overlay;

    const changeSpy = vi.spyOn(overlayComponent.wolChange, 'emit');
    const errorSpy = vi.spyOn(overlayComponent.wolError, 'emit');
    const propertyChangeSpy = vi.spyOn(overlayComponent.wolPropertyChange, 'emit');
    const elementSetSpy = vi.spyOn(overlayComponent.wolElement, 'set');
    const offsetSetSpy = vi.spyOn(overlayComponent.wolOffset, 'set');
    const positionSetSpy = vi.spyOn(overlayComponent.wolPosition, 'set');
    const positioningSetSpy = vi.spyOn(overlayComponent.wolPositioning, 'set');

    const changeEvent = new BaseEvent('change');
    overlayInstance.dispatchEvent(changeEvent);

    const errorEvent = new BaseEvent('error');
    overlayInstance.dispatchEvent(errorEvent);

    const propertyChangeEvent = new ObjectEvent('propertychange', 'foo', 'bar');
    overlayInstance.dispatchEvent(propertyChangeEvent);

    const customElement = document.createElement('div');
    overlayInstance.setElement(customElement);

    overlayInstance.setOffset([30, 40]);
    overlayInstance.setPosition([7, 8]);
    overlayInstance.setPositioning('center-center');

    expect(changeSpy).toHaveBeenCalledWith(changeEvent);
    expect(errorSpy).toHaveBeenCalledWith(errorEvent);
    expect(propertyChangeSpy).toHaveBeenCalledWith(propertyChangeEvent);
    expect(elementSetSpy).toHaveBeenCalledWith(customElement);
    expect(offsetSetSpy).toHaveBeenCalledWith([30, 40]);
    expect(positionSetSpy).toHaveBeenCalledWith([7, 8]);
    expect(positioningSetSpy).toHaveBeenCalledWith('center-center');
  }));

  it('removes the overlay from the map when destroyed', fakeAsync(() => {
    fixture.detectChanges();
    flush();

    const overlayInstance = overlayComponent.getInstance() as Overlay;
    const mapInstance = mapComponent.getInstance() as Map;
    const removeSpy = vi.spyOn(mapInstance, 'removeOverlay');

    testComponent.hideOverlay = true;
    fixture.detectChanges();
    flush();

    expect(removeSpy).toHaveBeenCalledWith(overlayInstance);
    expect(overlayComponent.getInstance()).toBeUndefined();
  }));
});

@Component({
  imports: [WolMapComponent, WolOverlayComponent],
  template: `
    <wol-map>
      @if (!hideOverlay) {
        <wol-overlay
          [wolElement]="element"
          [wolOffset]="offset"
          [wolPosition]="position"
          [wolPositioning]="positioning"
          [wolProperties]="properties"
        >
          <span class="overlay-content">{{ content }}</span>
        </wol-overlay>
      }
    </wol-map>
  `,
})
class TestOverlayComponent {
  element?: HTMLElement;
  hideOverlay = false;
  offset: number[] = [1, 2];
  position: Coordinate = [0, 0];
  positioning: Positioning = 'top-left';
  properties: WolProperties = { initial: true };
  content = 'Overlay Content';
}
