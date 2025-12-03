import { Location, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { NG_DOC_CONTEXT, NgDocNavigation } from '@ng-doc/app';
import { NgDocBindPipe, NgDocExecutePipe } from '@ng-doc/ui-kit';
import { filter } from 'rxjs';
import { SidebarCategoryComponent } from './sidebar-category';
import { SidebarItemComponent } from './sidebar-item';

@Component({
  selector: 'app-sidebar',
  imports: [
    NgTemplateOutlet,
    NgDocExecutePipe,
    NgDocBindPipe,
    SidebarCategoryComponent,
    SidebarItemComponent,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  readonly context = inject(NG_DOC_CONTEXT);
  readonly location = inject(Location);

  getNavigation(nav?: NgDocNavigation): NgDocNavigation[] {
    return nav ? (nav.children ?? []) : this.context.navigation;
  }

  matchRoute(route: string): boolean {
    return this.location.path().includes(route ?? '', 0);
  }
}
