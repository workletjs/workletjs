import { vi } from 'vitest';

import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import Map from 'ol/Map';
import { ObjectEvent } from 'ol/Object';
import Overlay, { PanIntoViewOptions, Positioning } from 'ol/Overlay';
import { Coordinate } from 'ol/coordinate';
import BaseEvent from 'ol/events/Event';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolOverlayComponent } from './overlay.component';

describe('WolOverlayComponent', () => {
  let fixture: ComponentFixture<TestOverlayHostComponent>;
  let testComponent: TestOverlayHostComponent;
  let mapInstance: Map;
  let overlayComponent: WolOverlayComponent;
  let overlayInstance: Overlay;

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestOverlayHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const mapDebugElement = fixture.debugElement.query(By.directive(WolMapComponent));
    const overlayDebugElement = fixture.debugElement.query(By.directive(WolOverlayComponent));

    testComponent = fixture.componentInstance;
    mapInstance = mapDebugElement.componentInstance.getInstance() as Map;
    overlayComponent = overlayDebugElement.componentInstance;
    overlayInstance = overlayComponent.getInstance() as Overlay;

    // Provide a map size so OL can compute pixel coordinates in jsdom.
    mapInstance.setSize([400, 400]);
  });

  // ─── initialization ───────────────────────────────────────────────────────

  describe('initialization', () => {
    it('should create the component', () => {
      expect(overlayComponent).toBeTruthy();
    });

    it('should create an Overlay OL instance', () => {
      expect(overlayInstance).toBeInstanceOf(Overlay);
    });

    it('should expose the OL instance via getInstance()', () => {
      expect(overlayComponent.getInstance()).toBe(overlayInstance);
    });

    it('should register the overlay on the parent map', () => {
      expect(mapInstance.getOverlays().getArray()).toContain(overlayInstance);
    });
  });

  // ─── input initialization ─────────────────────────────────────────────────

  describe('input initialization', () => {
    it('should initialize wolId', () => {
      expect(overlayInstance.getId()).toBe('overlay-1');
    });

    it('should initialize wolOffset', () => {
      expect(overlayInstance.getOffset()).toEqual([10, 20]);
    });

    it('should initialize wolPosition to undefined when not provided', () => {
      expect(overlayInstance.getPosition()).toBeUndefined();
    });

    it('should initialize wolPositioning', () => {
      expect(overlayInstance.getPositioning()).toBe('top-left');
    });

    it('should initialize wolProperties via setProperties', () => {
      expect(overlayInstance.get('testKey')).toBe('testValue');
    });

    it('should initialize wolStopEvent', () => {
      expect(overlayInstance.getOptions().stopEvent).toBe(true);
    });

    it('should initialize wolInsertFirst', () => {
      expect(overlayInstance.getOptions().insertFirst).toBe(false);
    });

    it('should initialize wolAutoPan', () => {
      expect(overlayInstance.getOptions().autoPan).toMatchObject({ animation: { duration: 250 } });
    });

    it('should initialize wolClassName', () => {
      expect(overlayInstance.getOptions().className).toBe('custom-overlay');
    });

    it('should create a fallback HTMLElement when wolElement is not provided', () => {
      expect(overlayInstance.getElement()).toBeInstanceOf(HTMLElement);
    });

    it('should project ng-content into the overlay element via portal', () => {
      const element = overlayInstance.getElement() as HTMLElement;
      expect(element.querySelector('.overlay-content')?.textContent).toContain('Overlay Content');
    });
  });

  // ─── model: wolElement ────────────────────────────────────────────────────

  describe('model: wolElement', () => {
    it('should update the OL instance element when wolElement signal changes', () => {
      const newElement = document.createElement('section');
      testComponent.element.set(newElement);
      fixture.detectChanges();
      expect(overlayInstance.getElement()).toBe(newElement);
    });

    it('should update wolElement signal when OL fires change:element', async () => {
      const newElement = document.createElement('article');
      overlayInstance.setElement(newElement);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(testComponent.element()).toBe(newElement);
    });

    it('should migrate portal content to the new element when wolElement signal changes', () => {
      const oldElement = overlayInstance.getElement() as HTMLElement;
      expect(oldElement.querySelector('.overlay-content')).toBeTruthy();

      const newElement = document.createElement('div');
      testComponent.element.set(newElement);
      fixture.detectChanges();

      expect(newElement.querySelector('.overlay-content')).toBeTruthy();
      expect(oldElement.querySelector('.overlay-content')).toBeNull();
    });
  });

  // ─── model: wolOffset ─────────────────────────────────────────────────────

  describe('model: wolOffset', () => {
    it('should update OL offset when wolOffset signal changes', () => {
      testComponent.offset.set([30, 40]);
      fixture.detectChanges();
      expect(overlayInstance.getOffset()).toEqual([30, 40]);
    });

    it('should update wolOffset signal when OL fires change:offset', async () => {
      overlayInstance.setOffset([50, 60]);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(testComponent.offset()).toEqual([50, 60]);
    });

    it('should accept zero offset values', () => {
      testComponent.offset.set([0, 0]);
      fixture.detectChanges();
      expect(overlayInstance.getOffset()).toEqual([0, 0]);
    });

    it('should accept negative offset values', () => {
      testComponent.offset.set([-5, -10]);
      fixture.detectChanges();
      expect(overlayInstance.getOffset()).toEqual([-5, -10]);
    });
  });

  // ─── model: wolPosition ───────────────────────────────────────────────────

  describe('model: wolPosition', () => {
    it('should update OL position when wolPosition signal changes', () => {
      const newPos: Coordinate = [100, 200];
      testComponent.position.set(newPos);
      fixture.detectChanges();
      expect(overlayInstance.getPosition()).toEqual([100, 200]);
    });

    it('should update wolPosition signal when OL fires change:position', async () => {
      const newPos: Coordinate = [300, 400];
      overlayInstance.setPosition(newPos);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(testComponent.position()).toEqual([300, 400]);
    });

    it('should hide the overlay when wolPosition is set to undefined', () => {
      testComponent.position.set(undefined);
      fixture.detectChanges();
      expect(overlayInstance.getPosition()).toBeUndefined();
    });
  });

  // ─── model: wolPositioning ────────────────────────────────────────────────

  describe('model: wolPositioning', () => {
    it('should update OL positioning when wolPositioning signal changes', () => {
      testComponent.positioning.set('bottom-center');
      fixture.detectChanges();
      expect(overlayInstance.getPositioning()).toBe('bottom-center');
    });

    it('should update wolPositioning signal when OL fires change:positioning', async () => {
      overlayInstance.setPositioning('center-left');
      fixture.detectChanges();
      await fixture.whenStable();
      expect(testComponent.positioning()).toBe('center-left');
    });

    it('should support all nine standard positioning values', () => {
      const positionings: Positioning[] = [
        'bottom-left',
        'bottom-center',
        'bottom-right',
        'center-left',
        'center-center',
        'center-right',
        'top-left',
        'top-center',
        'top-right',
      ];
      for (const pos of positionings) {
        testComponent.positioning.set(pos);
        fixture.detectChanges();
        expect(overlayInstance.getPositioning()).toBe(pos);
      }
    });
  });

  // ─── ngOnChanges ─────────────────────────────────────────────────────────

  describe('ngOnChanges', () => {
    it('should call setElement when wolElement changes', () => {
      const spy = vi.spyOn(overlayInstance, 'setElement');
      const newElement = document.createElement('div');
      testComponent.element.set(newElement);
      fixture.detectChanges();
      expect(spy).toHaveBeenCalledWith(newElement);
    });

    it('should reattach portal content to the new element when wolElement changes', () => {
      const newElement = document.createElement('div');
      testComponent.element.set(newElement);
      fixture.detectChanges();
      expect(newElement.querySelector('.overlay-content')).toBeTruthy();
    });

    it('should call setOffset when wolOffset changes', () => {
      const spy = vi.spyOn(overlayInstance, 'setOffset');
      testComponent.offset.set([70, 80]);
      fixture.detectChanges();
      expect(spy).toHaveBeenCalledWith([70, 80]);
    });

    it('should call setPosition when wolPosition changes', () => {
      const spy = vi.spyOn(overlayInstance, 'setPosition');
      const newPos: Coordinate = [9, 10];
      testComponent.position.set(newPos);
      fixture.detectChanges();
      expect(spy).toHaveBeenCalledWith(newPos);
    });

    it('should call setPositioning when wolPositioning changes', () => {
      const spy = vi.spyOn(overlayInstance, 'setPositioning');
      testComponent.positioning.set('center-right');
      fixture.detectChanges();
      expect(spy).toHaveBeenCalledWith('center-right');
    });

    it('should call setProperties when wolProperties changes', () => {
      const spy = vi.spyOn(overlayInstance, 'setProperties');
      testComponent.properties.set({ updated: true });
      fixture.detectChanges();
      expect(spy).toHaveBeenCalledWith({ updated: true });
    });

    it('should call setProperties with an empty object when wolProperties is set to undefined', () => {
      const spy = vi.spyOn(overlayInstance, 'setProperties');
      testComponent.properties.set(undefined);
      fixture.detectChanges();
      expect(spy).toHaveBeenCalledWith({});
    });
  });

  // ─── outputs ─────────────────────────────────────────────────────────────

  describe('outputs', () => {
    it('should emit wolChange when OL fires a change event', () => {
      const spy = vi.spyOn(overlayComponent.wolChange, 'emit');
      const event = new BaseEvent('change');
      overlayInstance.dispatchEvent(event);
      expect(spy).toHaveBeenCalledWith(event);
    });

    it('should emit wolError when OL fires an error event', () => {
      const spy = vi.spyOn(overlayComponent.wolError, 'emit');
      const event = new BaseEvent('error');
      overlayInstance.dispatchEvent(event);
      expect(spy).toHaveBeenCalledWith(event);
    });

    it('should emit wolPropertyChange when OL fires a propertychange event', () => {
      const spy = vi.spyOn(overlayComponent.wolPropertyChange, 'emit');
      const event = new ObjectEvent('propertychange', 'someKey', undefined);
      overlayInstance.dispatchEvent(event);
      expect(spy).toHaveBeenCalledWith(event);
    });
  });

  // ─── destroy ─────────────────────────────────────────────────────────────

  describe('destroy', () => {
    it('should remove the overlay from the map when destroyed', () => {
      const spy = vi.spyOn(mapInstance, 'removeOverlay');
      testComponent.destroyOverlay.set(true);
      fixture.detectChanges();
      expect(spy).toHaveBeenCalledWith(overlayInstance);
    });

    it('should set getInstance() to undefined after destroy', () => {
      testComponent.destroyOverlay.set(true);
      fixture.detectChanges();
      expect(overlayComponent.getInstance()).toBeUndefined();
    });

    it('should not update wolOffset signal when OL fires change:offset after destroy', async () => {
      const previousOffset = (testComponent.offset() as number[]).slice();
      testComponent.destroyOverlay.set(true);
      fixture.detectChanges();
      overlayInstance.setOffset([99, 99]);
      await fixture.whenStable();
      expect(testComponent.offset()).toEqual(previousOffset);
    });

    it('should not update wolPosition signal when OL fires change:position after destroy', async () => {
      overlayInstance.setPosition([1, 2]);
      await fixture.whenStable();
      const previousPosition = (testComponent.position() as Coordinate).slice();
      testComponent.destroyOverlay.set(true);
      fixture.detectChanges();
      overlayInstance.setPosition([999, 999]);
      await fixture.whenStable();
      expect(testComponent.position()).toEqual(previousPosition);
    });
  });
});

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WolMapComponent, WolViewComponent, WolOverlayComponent],
  template: `
    <wol-map>
      <wol-view [wolZoom]="4" />
      @if (!destroyOverlay()) {
        <wol-overlay
          [wolId]="id()"
          [(wolElement)]="element"
          [(wolOffset)]="offset"
          [(wolPosition)]="position"
          [(wolPositioning)]="positioning"
          [wolStopEvent]="stopEvent()"
          [wolInsertFirst]="insertFirst()"
          [wolAutoPan]="autoPan()"
          [wolClassName]="className()"
          [wolProperties]="properties()"
        >
          <span class="overlay-content">Overlay Content</span>
        </wol-overlay>
      }
    </wol-map>
  `,
})
class TestOverlayHostComponent {
  // models — two-way bindings via signal
  readonly element = signal<HTMLElement | undefined>(undefined);
  readonly offset = signal<number[] | undefined>([10, 20]);
  readonly position = signal<Coordinate | undefined>(undefined);
  readonly positioning = signal<Positioning | undefined>('top-left');

  // regular inputs
  readonly id = signal<number | string>('overlay-1');
  readonly stopEvent = signal<boolean>(true);
  readonly insertFirst = signal<boolean>(false);
  readonly autoPan = signal<PanIntoViewOptions | boolean>({ animation: { duration: 250 } });
  readonly className = signal<string>('custom-overlay');
  readonly properties = signal<WolProperties | undefined>({ testKey: 'testValue' });

  // control flag
  readonly destroyOverlay = signal<boolean>(false);
}
