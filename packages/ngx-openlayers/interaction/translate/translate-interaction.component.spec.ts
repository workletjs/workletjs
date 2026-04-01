import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import Collection from 'ol/Collection';
import Feature from 'ol/Feature';
import Map from 'ol/Map';
import MapBrowserEvent from 'ol/MapBrowserEvent';
import { ObjectEvent } from 'ol/Object';
import BaseEvent from 'ol/events/Event';
import Translate, { TranslateEvent } from 'ol/interaction/Translate';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolTranslateInteractionComponent } from './translate-interaction.component';

describe('WolTranslateInteractionComponent', () => {
  const mapBrowserEvent = {} as unknown as MapBrowserEvent<PointerEvent>;

  let fixture: ComponentFixture<TestTranslateInteractionComponent>;
  let testComponent: TestTranslateInteractionComponent;
  let mapComponent: WolMapComponent;
  let mapInstance: Map;
  let translateComponent: WolTranslateInteractionComponent;
  let translateInstance: Translate;

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestTranslateInteractionComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const mapDebugElement = fixture.debugElement.query(By.directive(WolMapComponent));
    const translateDebugElement = fixture.debugElement.query(
      By.directive(WolTranslateInteractionComponent),
    );

    testComponent = fixture.componentInstance;
    mapComponent = mapDebugElement.componentInstance;
    mapInstance = mapComponent.getInstance() as Map;
    translateComponent = translateDebugElement.componentInstance;
    translateInstance = translateComponent.getInstance() as Translate;
  });

  it('should create the translate interaction and register it on the map', () => {
    expect(translateComponent).toBeTruthy();
    expect(translateInstance).toBeInstanceOf(Translate);
    expect(mapInstance.getInteractions().getArray()).toContain(translateInstance);
  });

  it('should initialize wolActive to true', () => {
    expect(translateInstance.getActive()).toBe(true);
  });

  it('should initialize wolHitTolerance on OL instance', () => {
    expect(translateInstance.getHitTolerance()).toBe(5);
  });

  it('should initialize wolProperties on OL instance', () => {
    expect(translateInstance.get('testProp')).toBe('initial');
  });

  describe('wolActive model', () => {
    it('should update OL instance active state when wolActive changes', () => {
      testComponent.active.set(false);
      fixture.detectChanges();
      expect(translateInstance.getActive()).toBe(false);
    });

    it('should set wolActive to false when OL fires change:active with false', () => {
      translateInstance.setActive(false);
      expect(translateComponent.wolActive()).toBe(false);
    });

    it('should set wolActive to true when OL fires change:active with true', () => {
      translateInstance.setActive(false);
      translateInstance.setActive(true);
      expect(translateComponent.wolActive()).toBe(true);
    });
  });

  it('should update OL hitTolerance via ngOnChanges when wolHitTolerance changes', () => {
    testComponent.hitTolerance.set(10);
    fixture.detectChanges();
    expect(translateInstance.getHitTolerance()).toBe(10);
  });

  it('should update OL instance properties when wolProperties changes', () => {
    testComponent.properties.set({ testProp: 'updated' });
    fixture.detectChanges();
    expect(translateInstance.get('testProp')).toBe('updated');
  });

  it('should emit wolChange when OL fires change event', () => {
    const changeSpy = vi.spyOn(translateComponent.wolChange, 'emit');
    const event = new BaseEvent('change');
    translateInstance.dispatchEvent(event);
    expect(changeSpy).toHaveBeenCalledWith(event);
  });

  it('should emit wolError when OL fires error event', () => {
    const errorSpy = vi.spyOn(translateComponent.wolError, 'emit');
    const event = new BaseEvent('error');
    translateInstance.dispatchEvent(event);
    expect(errorSpy).toHaveBeenCalledWith(event);
  });

  it('should emit wolPropertyChange when OL fires propertychange event', () => {
    const propertyChangeSpy = vi.spyOn(translateComponent.wolPropertyChange, 'emit');
    const event = new ObjectEvent('propertychange', 'someKey', undefined);
    translateInstance.dispatchEvent(event);
    expect(propertyChangeSpy).toHaveBeenCalledWith(event);
  });

  it('should emit wolTranslateStart when OL fires translatestart event', () => {
    const spy = vi.spyOn(translateComponent.wolTranslateStart, 'emit');
    const event = new TranslateEvent(
      'translatestart',
      new Collection<Feature>(),
      [0, 0],
      [0, 0],
      mapBrowserEvent,
    );
    translateInstance.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolTranslating when OL fires translating event', () => {
    const spy = vi.spyOn(translateComponent.wolTranslating, 'emit');
    const event = new TranslateEvent(
      'translating',
      new Collection<Feature>(),
      [0, 0],
      [0, 0],
      mapBrowserEvent,
    );
    translateInstance.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  it('should emit wolTranslateEnd when OL fires translateend event', () => {
    const spy = vi.spyOn(translateComponent.wolTranslateEnd, 'emit');
    const event = new TranslateEvent(
      'translateend',
      new Collection<Feature>(),
      [0, 0],
      [0, 0],
      mapBrowserEvent,
    );
    translateInstance.dispatchEvent(event);
    expect(spy).toHaveBeenCalledWith(event);
  });

  describe('destroy', () => {
    it('should remove the interaction from the map on destroy', () => {
      testComponent.destroyInteraction.set(true);
      fixture.detectChanges();
      expect(mapInstance.getInteractions().getArray()).not.toContain(translateInstance);
    });

    it('should set getInstance() to undefined after destroy', () => {
      testComponent.destroyInteraction.set(true);
      fixture.detectChanges();
      expect(translateComponent.getInstance()).toBeUndefined();
    });
  });
});

@Component({
  template: `
    <wol-map>
      <wol-view [wolZoom]="4" />
      @if (!destroyInteraction()) {
        <wol-translate-interaction
          [(wolActive)]="active"
          [wolHitTolerance]="hitTolerance()"
          [wolProperties]="properties()"
        />
      }
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WolMapComponent, WolViewComponent, WolTranslateInteractionComponent],
})
class TestTranslateInteractionComponent {
  readonly active = signal(true);
  readonly hitTolerance = signal(5);
  readonly properties = signal<WolProperties>({ testProp: 'initial' });
  readonly destroyInteraction = signal(false);
}
