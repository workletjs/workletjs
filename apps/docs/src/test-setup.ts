import '@analogjs/vitest-angular/setup-zone';
import ResizeObserverPolyfill from 'resize-observer-polyfill';

import '@angular/compiler';
import { getTestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';

getTestBed().initTestEnvironment(BrowserTestingModule, platformBrowserTesting());

if (typeof ResizeObserver === 'undefined') {
  // eslint-disable-next-line
  (globalThis as any).ResizeObserver = ResizeObserverPolyfill;
}
