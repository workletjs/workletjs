import {
  NgDocCustomSidebarDirective,
  NgDocNavbarComponent,
  NgDocRootComponent,
  NgDocThemeToggleComponent,
} from '@ng-doc/app';
import {
  NgDocButtonIconComponent,
  NgDocIconComponent,
  NgDocTooltipDirective,
} from '@ng-doc/ui-kit';

import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';

import { filter } from 'rxjs/operators';

import { SidebarComponent } from './components';

@Component({
  selector: 'app-root',
  imports: [
    RouterLink,
    RouterOutlet,
    NgDocRootComponent,
    NgDocNavbarComponent,
    NgDocCustomSidebarDirective,
    NgDocButtonIconComponent,
    NgDocThemeToggleComponent,
    NgDocTooltipDirective,
    NgDocIconComponent,
    SidebarComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  host: {
    '[class.workletjs-landing-page]': `this.isLandingPage()`,
  },
})
export class AppComponent {
  protected readonly isLandingPage = signal(true);
  protected readonly isSmallScreen = signal(true);
  protected readonly showSidebar = computed(() => !this.isLandingPage() || this.isSmallScreen());

  constructor() {
    const router = inject(Router);
    const breakpointObserver = inject(BreakpointObserver);

    router.events
      .pipe(
        takeUntilDestroyed(),
        filter((event) => event instanceof NavigationEnd),
      )
      .subscribe((event) => {
        this.isLandingPage.set(event.url === '/');
      });

    breakpointObserver
      .observe(['(max-width: 1024px)'])
      .pipe(takeUntilDestroyed())
      .subscribe((result) => {
        this.isSmallScreen.set(result.matches);
      });
  }
}
