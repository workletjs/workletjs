import { NgDocNotifyService } from '@ng-doc/ui-kit/services/notify';

import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterLink, provideRouter } from '@angular/router';

import { LandingComponent } from './landing.component';

@Component({
  selector: 'wol-docs-hero-banner',
  template: '',
})
class HeroBannerStubComponent {}

describe('LandingComponent', () => {
  let fixture: ComponentFixture<LandingComponent>;
  let element: HTMLElement;
  let clipboardDescriptor: PropertyDescriptor | undefined;
  const notify = vi.fn();

  beforeEach(async () => {
    notify.mockClear();
    clipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
    await TestBed.configureTestingModule({
      imports: [LandingComponent],
      providers: [provideRouter([]), { provide: NgDocNotifyService, useValue: { notify } }],
    })
      .overrideComponent(LandingComponent, {
        set: { imports: [RouterLink, HeroBannerStubComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(LandingComponent);
    element = fixture.nativeElement;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    if (clipboardDescriptor) {
      Object.defineProperty(navigator, 'clipboard', clipboardDescriptor);
    } else {
      Reflect.deleteProperty(navigator, 'clipboard');
    }
  });

  function mockClipboard(writeText?: (text: string) => Promise<void>): void {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: writeText ? { writeText } : undefined,
    });
  }

  function findLink(label: string): HTMLAnchorElement {
    const link = Array.from(element.querySelectorAll('a')).find((candidate) =>
      candidate.textContent?.trim().startsWith(label),
    );
    if (!link) {
      throw new Error(`Expected a link named "${label}"`);
    }
    return link;
  }

  function copyButton(): HTMLButtonElement {
    const button = element.querySelector<HTMLButtonElement>('.install button');
    if (!button) {
      throw new Error('Expected the copy install command button');
    }
    return button;
  }

  it('introduces the library with one main heading and named content sections', () => {
    const headings = element.querySelectorAll('h1');
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent).toContain('OpenLayers power.');
    expect(headings[0].textContent).toContain('Angular simplicity.');

    const sections = element.querySelectorAll('section');
    expect(sections.length).toBeGreaterThan(1);
    for (const section of sections) {
      const headingId = section.getAttribute('aria-labelledby');
      expect(headingId).toBeTruthy();
      const heading = element.querySelector(`#${headingId}`);
      expect(heading?.matches('h1, h2')).toBe(true);
      expect(section.contains(heading)).toBe(true);
    }
    expect(element.querySelector('wol-docs-hero-banner')).toBeTruthy();
  });

  it('takes new users to installation or their first map from the hero', () => {
    expect(findLink('Get started').getAttribute('href')).toBe('/guides/get-started/installation');
    expect(findLink('Build your first map').getAttribute('href')).toBe(
      '/guides/get-started/first-map',
    );
    expect(findLink('version compatibility').getAttribute('href')).toBe(
      '/guides/reference/compatibility',
    );
  });

  it('connects each capability to its relevant guide or component reference', () => {
    expect(findLink('Explore the components').getAttribute('href')).toBe('/components');
    expect(findLink('Component composition').getAttribute('href')).toBe(
      '/guides/development/component-usage',
    );
    expect(findLink('Explore WebGL layers').getAttribute('href')).toBe(
      '/components/layers/webgl-tile',
    );
    expect(findLink('Meet the view component').getAttribute('href')).toBe(
      '/components/general/view',
    );
  });

  it('links the three setup steps to complete instructions and the final action to First Map', () => {
    const steps = element.querySelectorAll('.steps li');
    expect(steps).toHaveLength(3);
    expect(Array.from(steps, (step) => step.querySelector('a')?.getAttribute('href'))).toEqual([
      '/guides/get-started/installation',
      '/guides/get-started/first-map',
      '/components/general/map',
    ]);
    expect(element.querySelector('.closing a')?.getAttribute('href')).toBe(
      '/guides/get-started/first-map',
    );
  });

  it('includes a visible map container before optional customization', () => {
    const steps = element.querySelectorAll('.steps li');

    expect(steps[1].querySelector('h3')?.textContent).toBe('Compose your map');
    expect(steps[1].querySelector('code')?.textContent).toContain('height: 400px');
    expect(steps[2].querySelector('h3')?.textContent).toBe('Make it yours');
    expect(steps[2].querySelector('code')?.textContent).toContain('[(wolZoom)]="zoom"');
  });

  it('opens package, stars, and license links safely with meaningful badge names', () => {
    const links = element.querySelectorAll<HTMLAnchorElement>('a[target="_blank"]');
    expect(links).toHaveLength(3);
    expect(Array.from(links, (link) => link.href)).toEqual([
      'https://www.npmjs.com/package/@workletjs/ngx-openlayers',
      'https://github.com/workletjs/workletjs/stargazers',
      'https://github.com/workletjs/workletjs/blob/main/LICENSE',
    ]);
    for (const link of links) {
      expect(link.relList.contains('noopener')).toBe(true);
      expect(link.relList.contains('noreferrer')).toBe(true);
      expect(link.querySelector('img')?.getAttribute('alt')).toMatch(/npm|GitHub|MIT/);
      expect(link.querySelector('img')?.getAttribute('src')).toContain('https://img.shields.io/');
    }
  });

  it('copies the Angular CLI setup command and shows a success notification', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    mockClipboard(writeText);

    copyButton().click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(writeText).toHaveBeenCalledExactlyOnceWith('ng add @workletjs/ngx-openlayers@22.2.0');
    expect(element.querySelector('[aria-live="polite"]')?.textContent).toContain('Command copied.');
    expect(copyButton().getAttribute('aria-label')).toBe('Install command copied');
    expect(copyButton().disabled).toBe(false);
    expect(copyButton().classList.contains('is-copied')).toBe(true);
    expect(notify).toHaveBeenCalledExactlyOnceWith('Command copied. Your first map is next.');
    expect(findLink('version compatibility').getAttribute('href')).toBe(
      '/guides/reference/compatibility',
    );
  });

  it('disables copying while the clipboard operation is pending', async () => {
    let finishCopy: () => void = () => undefined;
    const operation = new Promise<void>((resolve) => {
      finishCopy = resolve;
    });
    const writeText = vi.fn().mockReturnValue(operation);
    mockClipboard(writeText);

    copyButton().click();
    fixture.detectChanges();
    expect(copyButton().disabled).toBe(true);
    copyButton().click();
    expect(writeText).toHaveBeenCalledOnce();
    expect(notify).not.toHaveBeenCalled();

    finishCopy();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(copyButton().disabled).toBe(false);
    expect(element.querySelector('[aria-live="polite"]')?.textContent).toContain('Command copied.');
    expect(findLink('version compatibility').getAttribute('href')).toBe(
      '/guides/reference/compatibility',
    );
  });

  it('offers manual copying when clipboard access is rejected', async () => {
    mockClipboard(vi.fn().mockRejectedValue(new Error('Clipboard access denied')));

    copyButton().click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(element.querySelector('[aria-live="polite"]')?.textContent).toContain(
      'Copy unavailable. Select and copy the command above.',
    );
    expect(element.querySelector('.install code')?.textContent).toBe(
      'ng add @workletjs/ngx-openlayers@22.2.0',
    );
    expect(copyButton().disabled).toBe(false);
    expect(copyButton().classList.contains('is-copied')).toBe(false);
    expect(notify).toHaveBeenCalledExactlyOnceWith(
      'Copy unavailable. Select and copy the command above.',
    );
    expect(findLink('version compatibility').getAttribute('href')).toBe(
      '/guides/reference/compatibility',
    );
  });

  it('keeps the command available when the browser has no Clipboard API', async () => {
    mockClipboard();

    copyButton().click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(element.querySelector('[aria-live="polite"]')?.textContent).toContain(
      'Copy unavailable. Select and copy the command above.',
    );
    expect(element.querySelector('.install code')?.textContent).toBe(
      'ng add @workletjs/ngx-openlayers@22.2.0',
    );
    expect(copyButton().getAttribute('aria-label')).toBe('Copy install command');
    expect(copyButton().disabled).toBe(false);
    expect(copyButton().classList.contains('is-copied')).toBe(false);
    expect(notify).toHaveBeenCalledExactlyOnceWith(
      'Copy unavailable. Select and copy the command above.',
    );
    expect(findLink('version compatibility').getAttribute('href')).toBe(
      '/guides/reference/compatibility',
    );
  });
});
