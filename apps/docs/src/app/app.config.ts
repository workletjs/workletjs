import {
  NG_DOC_DEFAULT_PAGE_PROCESSORS,
  NG_DOC_DEFAULT_PAGE_SKELETON,
  NgDocDefaultSearchEngine,
  NgDocPreloadingStrategy,
  provideMainPageProcessor,
  provideNgDocApp,
  provideNgDocTitle,
  providePageSkeleton,
  provideSearchEngine,
} from '@ng-doc/app';
import { provideNgDocContext } from '@ng-doc/generated';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withInMemoryScrolling, withPreloading } from '@angular/router';

import { APP_ROUTES } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideNativeDateAdapter(),
    // Provide context of the generated documentation
    provideNgDocContext(),
    // Provide default configuration for the documentation app
    provideNgDocApp({
      contentAnchorScrolling: true,
      contentScrollPositionRestoration: 'enabled',
      uiKit: {
        assetsPath: 'assets/ng-doc/ui-kit',
        customIconsPath: 'icons',
      },
    }),
    provideSearchEngine(NgDocDefaultSearchEngine),
    providePageSkeleton(NG_DOC_DEFAULT_PAGE_SKELETON),
    provideMainPageProcessor(NG_DOC_DEFAULT_PAGE_PROCESSORS),
    // "Installation · Get started | Workletjs", "WolMapComponent · API | Workletjs".
    provideNgDocTitle(({ categories, page, tab, api }) => {
      const parts = api ? [api, 'API'] : [tab, page, ...[...categories].reverse()];
      const title = parts.filter(Boolean).join(' · ');

      return title ? `${title} | Workletjs` : 'Workletjs';
    }),
    // Provide animations
    provideAnimations(),
    // Provide HttpClient with interceptors (NgDoc uses interceptors)
    provideHttpClient(withInterceptorsFromDi()),
    // Add generated routes to the application
    provideRouter(
      APP_ROUTES,
      // Enable anchor scrolling
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      }),
      // Preloads a page when the reader is about to open a link to it.
      withPreloading(NgDocPreloadingStrategy),
    ),
  ],
};
