import { NgDocNavigation } from '@ng-doc/app';
import { NgDocContent, NgDocExpanderComponent } from '@ng-doc/ui-kit';
import { PolymorpheusOutlet } from '@taiga-ui/polymorpheus';

import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  inject,
  input,
  linkedSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';

import { filter } from 'rxjs/operators';

let nextId = 0;

@Component({
  selector: 'wol-docs-layout-sidebar-category',
  imports: [NgDocExpanderComponent, PolymorpheusOutlet],
  templateUrl: './layout-sidebar-category.component.html',
  styleUrl: './layout-sidebar-category.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.data-ng-doc-is-root]': 'isRoot()',
    '[attr.data-ng-doc-expandable]': 'expandable()',
    '[attr.data-ng-doc-expanded]': 'isExpanded()',
  },
})
export class LayoutSidebarCategoryComponent {
  /** The category. */
  readonly category = input.required<NgDocNavigation>();

  /** Whether the category sits at the top level of the sidebar. */
  readonly isRoot = input<boolean, unknown>(false, { transform: booleanAttribute });

  /** The pages and categories inside the category. */
  readonly content = input<NgDocContent>('');

  /** Whether the reader can collapse the category. A category that cannot is always open. */
  readonly expandable = input<boolean, unknown>(true, { transform: booleanAttribute });

  /** Whether the category starts open. */
  readonly expanded = input<boolean, unknown>(true, { transform: booleanAttribute });

  /** Whether the category is open: it starts from `expanded` and follows the reader. */
  readonly isExpanded = linkedSignal(() => this.expanded() || !this.expandable());

  /** Id of the element that holds the pages, for the header's `aria-controls`. */
  protected readonly childrenId = `ng-doc-sidebar-category-${nextId++}`;

  constructor() {
    const router = inject(Router);

    router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        const route: string = this.category().route ?? '';

        if (router.url.includes(route)) {
          this.expand();
        }
      });
  }

  /** Opens the category if it is open, or closes it otherwise. */
  toggle(): void {
    if (this.isExpanded()) {
      this.collapse();
    } else {
      this.expand();
    }
  }

  /** Opens the category. */
  expand(): void {
    if (this.expandable()) {
      this.isExpanded.set(true);
    }
  }

  /** Closes the category, unless it cannot be collapsed. */
  collapse(): void {
    if (this.expandable()) {
      this.isExpanded.set(false);
    }
  }
}
