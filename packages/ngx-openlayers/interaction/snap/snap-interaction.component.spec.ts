import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import Collection from 'ol/Collection';
import Feature from 'ol/Feature';
import Map from 'ol/Map';
import { ObjectEvent } from 'ol/Object';
import BaseEvent from 'ol/events/Event';
import { SnapEvent } from 'ol/events/SnapEvent';
import Snap from 'ol/interaction/Snap';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolSnapInteractionComponent } from './snap-interaction.component';

describe('WolSnapInteractionComponent', () => {
  const internals = (obj: object) => obj as unknown as Record<string, unknown>;

  let fixture: ComponentFixture<TestSnapInteractionComponent>;
  let testComponent: TestSnapInteractionComponent;
  let mapComponent: WolMapComponent;
  let mapInstance: Map;
  let snapComponent: WolSnapInteractionComponent;
  let snapInstance: Snap;

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestSnapInteractionComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const mapDebugElement = fixture.debugElement.query(By.directive(WolMapComponent));
    const snapDebugElement = fixture.debugElement.query(By.directive(WolSnapInteractionComponent));

    testComponent = fixture.componentInstance;
    mapComponent = mapDebugElement.componentInstance;
    mapInstance = mapComponent.getInstance() as Map;
    snapComponent = snapDebugElement.componentInstance;
    snapInstance = snapComponent.getInstance() as Snap;
  });

  it('should create the snap interaction and register it on the map', () => {
    expect(snapComponent).toBeTruthy();
    expect(snapInstance).toBeInstanceOf(Snap);
    expect(mapInstance.getInteractions().getArray()).toContain(snapInstance);
  });

  it('should initialize wolActive to true', () => {
    expect(snapInstance.getActive()).toBe(true);
  });

  it('should initialize wolPixelTolerance on OL instance', () => {
    expect(internals(snapInstance)['pixelTolerance_']).toBe(15);
  });

  it('should initialize wolEdge on OL instance', () => {
    expect(internals(snapInstance)['edge_']).toBe(true);
  });

  it('should initialize wolVertex on OL instance', () => {
    expect(internals(snapInstance)['vertex_']).toBe(true);
  });

  it('should initialize wolProperties on OL instance', () => {
    expect(snapInstance.get('testProp')).toBe('initial');
  });

  describe('wolActive model', () => {
    it('should update OL instance active state when wolActive changes', () => {
      testComponent.active.set(false);
      fixture.detectChanges();
      expect(snapInstance.getActive()).toBe(false);
    });

    it('should set wolActive to false when OL fires change:active with false', () => {
      snapInstance.setActive(false);
      expect(snapComponent.wolActive()).toBe(false);
    });

    it('should set wolActive to true when OL fires change:active with true', () => {
      snapInstance.setActive(false);
      snapInstance.setActive(true);
      expect(snapComponent.wolActive()).toBe(true);
    });
  });

  it('should update OL instance properties when wolProperties changes', () => {
    testComponent.properties.set({ testProp: 'updated' });
    fixture.detectChanges();
    expect(snapInstance.get('testProp')).toBe('updated');
  });

  it('should emit wolChange when OL fires change event', () => {
    const changeSpy = vi.spyOn(snapComponent.wolChange, 'emit');
    const event = new BaseEvent('change');
    snapInstance.dispatchEvent(event);
    expect(changeSpy).toHaveBeenCalledWith(event);
  });

  it('should emit wolError when OL fires error event', () => {
    const errorSpy = vi.spyOn(snapComponent.wolError, 'emit');
    const event = new BaseEvent('error');
    snapInstance.dispatchEvent(event);
    expect(errorSpy).toHaveBeenCalledWith(event);
  });

  it('should emit wolPropertyChange when OL fires propertychange event', () => {
    const propertyChangeSpy = vi.spyOn(snapComponent.wolPropertyChange, 'emit');
    const event = new ObjectEvent('propertychange', 'someKey', undefined);
    snapInstance.dispatchEvent(event);
    expect(propertyChangeSpy).toHaveBeenCalledWith(event);
  });

  it('should emit wolSnap when OL fires snap event', () => {
    const snapSpy = vi.spyOn(snapComponent.wolSnap, 'emit');
    const event = new SnapEvent('snap', {
      vertex: [0, 0],
      vertexPixel: [0, 0],
      feature: new Feature(),
      segment: [
        [0, 0],
        [1, 1],
      ],
    });
    snapInstance.dispatchEvent(event);
    expect(snapSpy).toHaveBeenCalledWith(event);
  });

  it('should emit wolUnsnap when OL fires unsnap event', () => {
    const unsnapSpy = vi.spyOn(snapComponent.wolUnsnap, 'emit');
    const event = new SnapEvent('unsnap', {
      vertex: [0, 0],
      vertexPixel: [0, 0],
      feature: new Feature(),
      segment: [
        [0, 0],
        [1, 1],
      ],
    });
    snapInstance.dispatchEvent(event);
    expect(unsnapSpy).toHaveBeenCalledWith(event);
  });

  describe('destroy', () => {
    it('should remove the interaction from the map on destroy', () => {
      testComponent.destroyInteraction.set(true);
      fixture.detectChanges();
      expect(mapInstance.getInteractions().getArray()).not.toContain(snapInstance);
    });

    it('should set getInstance() to undefined after destroy', () => {
      testComponent.destroyInteraction.set(true);
      fixture.detectChanges();
      expect(snapComponent.getInstance()).toBeUndefined();
    });
  });
});

@Component({
  template: `
    <wol-map>
      <wol-view [wolZoom]="4" />
      @if (!destroyInteraction()) {
        <wol-snap-interaction
          [(wolActive)]="active"
          [wolFeatures]="features()"
          [wolPixelTolerance]="pixelTolerance()"
          [wolEdge]="edge()"
          [wolVertex]="vertex()"
          [wolProperties]="properties()"
        />
      }
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WolMapComponent, WolViewComponent, WolSnapInteractionComponent],
})
class TestSnapInteractionComponent {
  readonly active = signal(true);
  readonly features = signal(new Collection<Feature>());
  readonly pixelTolerance = signal(15);
  readonly edge = signal(true);
  readonly vertex = signal(true);
  readonly properties = signal<WolProperties>({ testProp: 'initial' });
  readonly destroyInteraction = signal(false);
}
