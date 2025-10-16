import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  NgDocNavbarComponent,
  NgDocRootComponent,
  NgDocSidebarComponent,
  NgDocThemeToggleComponent,
} from '@ng-doc/app';
import {
  NgDocButtonIconComponent,
  NgDocIconComponent,
  NgDocTooltipDirective,
  preventInitialChildAnimations,
} from '@ng-doc/ui-kit';

@Component({
  selector: 'app-root',
  imports: [
    RouterModule,
    NgDocRootComponent,
    NgDocNavbarComponent,
    NgDocSidebarComponent,
    NgDocButtonIconComponent,
    NgDocThemeToggleComponent,
    NgDocTooltipDirective,
    NgDocIconComponent,
  ],
  animations: [preventInitialChildAnimations],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {}
