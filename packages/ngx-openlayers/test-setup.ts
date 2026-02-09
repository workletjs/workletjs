import '@angular/compiler';
import '@analogjs/vitest-angular/setup-zone';

import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { getTestBed } from '@angular/core/testing';

import ResizeObserverPolyfill from 'resize-observer-polyfill';

getTestBed().initTestEnvironment(BrowserTestingModule, platformBrowserTesting());

if (typeof ResizeObserver === 'undefined') {
  // eslint-disable-next-line
  (globalThis as any).ResizeObserver = ResizeObserverPolyfill;
}

if (typeof PointerEvent === 'undefined') {
  // eslint-disable-next-line
  (globalThis as any).PointerEvent = class PointerEvent extends MouseEvent {};
}
