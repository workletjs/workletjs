import { NgDocNavigation, NgDocRouteActiveDirective } from '@ng-doc/app';
import {
  NgDocContent,
  NgDocDotComponent,
  NgDocExpanderComponent,
  NgDocIconComponent,
  NgDocRotatorDirective,
  NgDocTextComponent,
  NgDocTextLeftDirective,
} from '@ng-doc/ui-kit';
import { PolymorpheusModule } from '@tinkoff/ng-polymorpheus';

import { ChangeDetectionStrategy, Component, inject, input, model } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';

import { filter } from 'rxjs';

@Component({
  selector: 'app-sidebar-category',
  imports: [
    NgDocRouteActiveDirective,
    NgDocDotComponent,
    NgDocTextComponent,
    NgDocIconComponent,
    NgDocTextLeftDirective,
    NgDocRotatorDirective,
    NgDocExpanderComponent,
    PolymorpheusModule,
  ],
  templateUrl: './sidebar-category.component.html',
  styleUrl: './sidebar-category.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-ng-doc-is-root]': `this.isRoot()`,
    '[attr.data-ng-doc-expandable]': `this.expandable()`,
  },
})
export class SidebarCategoryComponent {
  readonly category = input.required<NgDocNavigation>();
  readonly isRoot = input(false);
  readonly content = input<NgDocContent>('');
  readonly expandable = input(true);
  readonly expanded = model(true);

  protected readonly router = inject(Router);

  constructor() {
    this.router.events
      .pipe(
        takeUntilDestroyed(),
        filter((event) => event instanceof NavigationEnd),
      )
      .subscribe((event) => {
        if (event.url.includes(this.category().route ?? '', 0)) {
          this.expand();
        }
      });
  }

  toggle(): void {
    this.expanded.update((value) => !value);
  }

  expand(): void {
    if (this.category()?.expandable) {
      this.expanded.set(true);
    }
  }

  collapse(): void {
    if (this.category()?.expandable) {
      this.expanded.set(false);
    }
  }
}
