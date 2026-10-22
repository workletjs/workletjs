import {
  NG_DOC_CONTEXT,
  NgDocCustomSidebarDirective,
  NgDocNavbarComponent,
  NgDocRootComponent,
  NgDocThemeToggleComponent,
} from '@ng-doc/app';
import { NgDocButtonIconComponent, NgDocTooltipDirective } from '@ng-doc/ui-kit';

import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';

import { filter, map } from 'rxjs/operators';

import { LayoutSidebarComponent } from './components/layout-sidebar';

/** Top-level sections of the site, linked from the header. */
type SiteSection = 'guides' | 'components';

@Component({
  selector: 'wol-docs-root',
  imports: [
    RouterLink,
    RouterOutlet,
    NgDocRootComponent,
    NgDocNavbarComponent,
    NgDocButtonIconComponent,
    NgDocThemeToggleComponent,
    NgDocTooltipDirective,
    NgDocCustomSidebarDirective,
    LayoutSidebarComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-ng-doc-is-landing]': 'isLandingPage()',
  },
})
export class AppComponent {
  protected readonly context = inject(NG_DOC_CONTEXT);
  protected readonly year = new Date().getFullYear();

  private readonly router = inject(Router);
  private readonly location = inject(Location);

  private readonly path = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.currentPath()),
    ),
    { initialValue: this.currentPath() },
  );

  protected readonly isLandingPage = computed(() => this.path() === '/');

  protected readonly section = computed<SiteSection | null>(() => {
    const path = this.path();

    if (path === '/guides' || path.startsWith('/guides/')) {
      return 'guides';
    }

    if (path === '/components' || path.startsWith('/components/')) {
      return 'components';
    }

    return null;
  });

  protected readonly navigation = computed(() => {
    const section = this.section();

    if (section) {
      return (
        this.context.navigation.find((nav) => nav.route.startsWith(`/${section}`))?.children ?? []
      );
    }

    return this.context.navigation;
  });

  private currentPath(): string {
    return '/' + this.location.path().split(/[?#]/)[0].replace(/^\//, '');
  }
}
