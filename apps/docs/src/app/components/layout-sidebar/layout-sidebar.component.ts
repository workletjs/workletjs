import { NgDocNavigation } from '@ng-doc/app';
import { NgDocBindPipe, NgDocExecutePipe } from '@ng-doc/ui-kit';

import { Location, NgTemplateOutlet } from '@angular/common';
import { Component, inject, input } from '@angular/core';

import { LayoutSidebarCategoryComponent } from './layout-sidebar-category/layout-sidebar-category.component';
import { LayoutSidebarItemComponent } from './layout-sidebar-item/layout-sidebar-item.component';

@Component({
  selector: 'wol-docs-layout-sidebar',
  imports: [
    NgTemplateOutlet,
    NgDocExecutePipe,
    NgDocBindPipe,
    LayoutSidebarCategoryComponent,
    LayoutSidebarItemComponent,
  ],
  templateUrl: './layout-sidebar.component.html',
  styleUrl: './layout-sidebar.component.scss',
})
export class LayoutSidebarComponent {
  protected readonly location = inject(Location);

  readonly wolNavigation = input.required<NgDocNavigation[]>();

  getNavigation(nav?: NgDocNavigation): NgDocNavigation[] {
    return nav ? (nav.children ?? []) : this.wolNavigation();
  }

  matchRoute(route: string): boolean {
    return this.location.path().includes(route ?? '', 0);
  }
}
