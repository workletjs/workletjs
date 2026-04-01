import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import Map from 'ol/Map';
import { ObjectEvent } from 'ol/Object';
import BaseEvent from 'ol/events/Event';
import Link, { Params } from 'ol/interaction/Link';

import { WolProperties } from '@workletjs/ngx-openlayers/core/types';
import { WolMapComponent } from '@workletjs/ngx-openlayers/map';
import { WolViewComponent } from '@workletjs/ngx-openlayers/view';

import { WolLinkInteractionComponent } from './link-interaction.component';

describe('WolLinkInteractionComponent', () => {
  const internals = (obj: object) => obj as unknown as Record<string, unknown>;

  let fixture: ComponentFixture<TestLinkInteractionComponent>;
  let testComponent: TestLinkInteractionComponent;
  let mapComponent: WolMapComponent;
  let mapInstance: Map;
  let linkComponent: WolLinkInteractionComponent;
  let linkInstance: Link;

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestLinkInteractionComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const mapDebugElement = fixture.debugElement.query(By.directive(WolMapComponent));
    const linkDebugElement = fixture.debugElement.query(By.directive(WolLinkInteractionComponent));

    testComponent = fixture.componentInstance;
    mapComponent = mapDebugElement.componentInstance;
    mapInstance = mapComponent.getInstance() as Map;
    linkComponent = linkDebugElement.componentInstance;
    linkInstance = linkComponent.getInstance() as Link;
  });

  it('should create the link interaction and register it on the map', () => {
    expect(linkComponent).toBeTruthy();
    expect(linkInstance).toBeInstanceOf(Link);
    expect(mapInstance.getInteractions().getArray()).toContain(linkInstance);
  });

  it('should initialize wolActive with provided value', () => {
    expect(linkInstance.getActive()).toBe(testComponent.active());
  });

  it('should initialize with params from input', () => {
    // params_ is stored as an object map keyed by param name
    const paramsMap = internals(linkInstance)['params_'] as Record<string, boolean>;
    expect(Object.keys(paramsMap)).toEqual(testComponent.params());
  });

  it('should initialize with replace from input', () => {
    expect(internals(linkInstance)['replace_']).toBe(testComponent.replace());
  });

  it('should initialize with prefix from input', () => {
    expect(internals(linkInstance)['prefix_']).toBe(testComponent.prefix());
  });

  it('should initialize wolProperties on the instance', () => {
    const props = testComponent.properties();
    expect(linkInstance.get('testProp')).toBe(props['testProp']);
  });

  describe('wolActive model', () => {
    it('should update OL instance active state when wolActive changes', () => {
      testComponent.active.set(false);
      fixture.detectChanges();
      expect(linkInstance.getActive()).toBe(false);
    });

    it('should set wolActive to false when OL fires change:active with false', () => {
      linkInstance.setActive(false);
      expect(linkComponent.wolActive()).toBe(false);
    });

    it('should set wolActive to true when OL fires change:active with true', () => {
      linkInstance.setActive(false);
      linkInstance.setActive(true);
      expect(linkComponent.wolActive()).toBe(true);
    });
  });

  it('should update OL instance properties when wolProperties changes', () => {
    testComponent.properties.set({ testProp: 'updated' });
    fixture.detectChanges();
    expect(linkInstance.get('testProp')).toBe('updated');
  });

  it('should emit wolChange when OL fires change event', () => {
    const changeSpy = vi.spyOn(linkComponent.wolChange, 'emit');
    const event = new BaseEvent('change');
    linkInstance.dispatchEvent(event);
    expect(changeSpy).toHaveBeenCalledWith(event);
  });

  it('should emit wolError when OL fires error event', () => {
    const errorSpy = vi.spyOn(linkComponent.wolError, 'emit');
    const event = new BaseEvent('error');
    linkInstance.dispatchEvent(event);
    expect(errorSpy).toHaveBeenCalledWith(event);
  });

  it('should emit wolPropertyChange when OL fires propertychange event', () => {
    const propertyChangeSpy = vi.spyOn(linkComponent.wolPropertyChange, 'emit');
    const event = new ObjectEvent('propertychange', 'someKey', undefined);
    linkInstance.dispatchEvent(event);
    expect(propertyChangeSpy).toHaveBeenCalledWith(event);
  });

  describe('destroy', () => {
    it('should remove the interaction from the map on destroy', () => {
      testComponent.destroyInteraction.set(true);
      fixture.detectChanges();
      expect(mapInstance.getInteractions().getArray()).not.toContain(linkInstance);
    });

    it('should set getInstance() to undefined after destroy', () => {
      testComponent.destroyInteraction.set(true);
      fixture.detectChanges();
      expect(linkComponent.getInstance()).toBeUndefined();
    });
  });
});

@Component({
  template: `
    <wol-map>
      <wol-view [wolZoom]="4" />
      @if (!destroyInteraction()) {
        <wol-link-interaction
          [(wolActive)]="active"
          [wolParams]="params()"
          [wolReplace]="replace()"
          [wolPrefix]="prefix()"
          [wolProperties]="properties()"
        />
      }
    </wol-map>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WolMapComponent, WolViewComponent, WolLinkInteractionComponent],
})
class TestLinkInteractionComponent {
  readonly active = signal(true);
  readonly params = signal<Params[]>(['x', 'y', 'z']);
  readonly replace = signal(false);
  readonly prefix = signal('map');
  readonly properties = signal<WolProperties>({ testProp: 'initial' });
  readonly destroyInteraction = signal(false);
}
