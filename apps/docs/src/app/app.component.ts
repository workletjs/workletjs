import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
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
  preventInitialChildAnimations,
} from '@ng-doc/ui-kit';
import { filter } from 'rxjs/operators';
import { SidebarComponent } from './components';

@Component({
  selector: 'app-root',
  imports: [
    RouterLink,
    RouterLinkActive,
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
  animations: [preventInitialChildAnimations],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  host: {
    '[class.workletjs-landing-page]': `this.isLandingPage()`,
  },
})
export class AppComponent {
  protected readonly isLandingPage = signal(true);

  constructor() {
    const router = inject(Router);

    router.events
      .pipe(
        takeUntilDestroyed(),
        filter((event) => event instanceof NavigationEnd),
      )
      .subscribe((event) => {
        this.isLandingPage.set(event.url === '/');
      });
  }
}
