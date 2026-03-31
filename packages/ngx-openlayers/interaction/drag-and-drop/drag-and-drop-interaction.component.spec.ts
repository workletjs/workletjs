import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import Map from 'ol/Map';
import { ObjectEvent } from 'ol/Object';
import BaseEvent from 'ol/events/Event';
import FeatureFormat from 'ol/format/Feature';
import GeoJSON from 'ol/format/GeoJSON';
import DragAndDrop, { DragAndDropEvent } from 'ol/interaction/DragAndDrop';
import { Projection } from 'ol/proj';
import VectorSource from 'ol/source/Vector';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolDragAndDropInteractionComponent } from './drag-and-drop-interaction.component';

describe('WolDragAndDropInteractionComponent', () => {
  const internals = (obj: object) => obj as unknown as Record<string, unknown>;

  let fixture: ComponentFixture<TestDragAndDropInteractionComponent>;
  let testComponent: TestDragAndDropInteractionComponent;
  let mapComponent: WolMapComponent;
  let mapInstance: Map;
  let dragAndDropComponent: WolDragAndDropInteractionComponent;
  let dragAndDrop: DragAndDrop;

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestDragAndDropInteractionComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const mapDebugElement = fixture.debugElement.query(By.directive(WolMapComponent));
    const dragAndDropDebugElement = fixture.debugElement.query(
      By.directive(WolDragAndDropInteractionComponent),
    );

    testComponent = fixture.componentInstance;
    mapComponent = mapDebugElement.componentInstance;
    mapInstance = mapComponent.getInstance() as Map;
    dragAndDropComponent = dragAndDropDebugElement.componentInstance;
    dragAndDrop = dragAndDropComponent.getInstance() as DragAndDrop;
  });

  it('should create the dragAndDrop interaction and register it on the map', () => {
    expect(dragAndDropComponent).toBeTruthy();
    expect(dragAndDrop).toBeInstanceOf(DragAndDrop);
    expect(mapInstance.getInteractions().getArray()).toContain(dragAndDrop);
  });

  // --- initialization ---

  it('should initialize with wolActive from input', () => {
    expect(dragAndDrop.getActive()).toBe(testComponent.active());
  });

  it('should initialize with wolFormatConstructors from input', () => {
    const formats = internals(dragAndDrop)['formats_'] as object[];
    expect(formats).toHaveLength(testComponent.formatConstructors().length);
    expect(formats[0]).toBeInstanceOf(GeoJSON);
  });

  it('should initialize with wolSource from input', () => {
    expect(internals(dragAndDrop)['source_']).toBe(testComponent.source());
  });

  it('should initialize with wolProjection from input', () => {
    const proj = internals(dragAndDrop)['projection_'] as Projection;
    expect(proj.getCode()).toBe(testComponent.projection());
  });

  it('should initialize with wolProperties from input', () => {
    expect(dragAndDrop.getProperties()).toMatchObject(testComponent.properties());
  });

  // --- model: wolActive ---

  it('should update active state when wolActive model changes', () => {
    testComponent.active.set(false);
    fixture.detectChanges();
    expect(dragAndDrop.getActive()).toBe(false);
  });

  it('should update wolActive model when OL interaction changes active state', () => {
    const setActiveSpy = vi.spyOn(dragAndDropComponent.wolActive, 'set');
    dragAndDrop.setActive(false);
    fixture.detectChanges();
    expect(setActiveSpy).toHaveBeenCalledWith(false);
  });

  it('should re-activate the interaction when wolActive is toggled back to true', () => {
    testComponent.active.set(false);
    fixture.detectChanges();
    expect(dragAndDrop.getActive()).toBe(false);

    testComponent.active.set(true);
    fixture.detectChanges();
    expect(dragAndDrop.getActive()).toBe(true);
  });

  // --- input: wolFormatConstructors (ngOnChanges) ---

  it('should update formats_ when wolFormatConstructors input changes', () => {
    const newFormats: (typeof FeatureFormat)[] = [GeoJSON];
    testComponent.formatConstructors.set(newFormats);
    fixture.detectChanges();
    const formats = internals(dragAndDrop)['formats_'] as object[];
    expect(formats).toHaveLength(1);
  });

  // --- input: wolProperties ---

  it('should update properties when wolProperties input changes', () => {
    const newProperties: WolProperties = { updated: true };
    testComponent.properties.set(newProperties);
    fixture.detectChanges();
    expect(dragAndDrop.getProperties()).toMatchObject(newProperties);
  });

  // --- output: wolAddFeatures ---

  it('should emit addfeatures event when dragAndDrop interaction triggers addfeatures', () => {
    const addFeaturesSpy = vi.spyOn(dragAndDropComponent.wolAddFeatures, 'emit');
    const event = new DragAndDropEvent('addfeatures', {} as File, []);
    dragAndDrop.dispatchEvent(event);
    expect(addFeaturesSpy).toHaveBeenCalledWith(event);
  });

  // --- output: wolChange ---

  it('should emit change event when dragAndDrop interaction triggers change', () => {
    const changeSpy = vi.spyOn(dragAndDropComponent.wolChange, 'emit');
    const changeEvent = new BaseEvent('change');
    dragAndDrop.dispatchEvent(changeEvent);
    expect(changeSpy).toHaveBeenCalledWith(changeEvent);
  });

  // --- output: wolError ---

  it('should emit error event when dragAndDrop interaction triggers error', () => {
    const errorSpy = vi.spyOn(dragAndDropComponent.wolError, 'emit');
    const errorEvent = new BaseEvent('error');
    dragAndDrop.dispatchEvent(errorEvent);
    expect(errorSpy).toHaveBeenCalledWith(errorEvent);
  });

  // --- output: wolPropertyChange ---

  it('should emit propertychange event when dragAndDrop interaction triggers propertychange', () => {
    const propertyChangeSpy = vi.spyOn(dragAndDropComponent.wolPropertyChange, 'emit');
    const event = new ObjectEvent('propertychange', 'active', true);
    dragAndDrop.dispatchEvent(event);
    expect(propertyChangeSpy).toHaveBeenCalledWith(event);
  });

  // --- destroy ---

  it('should remove the interaction from the map when destroyed', () => {
    const removeInteractionSpy = vi.spyOn(mapInstance, 'removeInteraction');
    testComponent.destroyInteraction.set(true);
    fixture.detectChanges();
    expect(dragAndDropComponent.getInstance()).toBeUndefined();
    expect(removeInteractionSpy).toHaveBeenCalledWith(dragAndDrop);
  });

  it('should return undefined from getInstance() after destruction', () => {
    testComponent.destroyInteraction.set(true);
    fixture.detectChanges();
    expect(dragAndDropComponent.getInstance()).toBeUndefined();
  });
});

@Component({
  selector: 'wol-test-drag-and-drop-interaction',
  imports: [WolMapComponent, WolViewComponent, WolDragAndDropInteractionComponent],
  template: `
    <wol-map>
      <wol-view [wolZoom]="2" [wolCenter]="[0, 0]" />
      @if (!destroyInteraction()) {
        <wol-drag-and-drop-interaction
          [(wolActive)]="active"
          [wolFormatConstructors]="formatConstructors()"
          [wolSource]="source()"
          [wolProjection]="projection()"
          [wolProperties]="properties()"
        />
      }
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestDragAndDropInteractionComponent {
  active = signal(true);
  formatConstructors = signal<(typeof FeatureFormat)[]>([GeoJSON]);
  source = signal(new VectorSource());
  projection = signal('EPSG:4326');
  properties = signal<WolProperties>({ foo: 'bar' });
  destroyInteraction = signal(false);
}
