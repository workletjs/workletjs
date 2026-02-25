import { NgDocNavigation } from '@ng-doc/app';
import {
  NgDocColor,
  NgDocDotComponent,
  NgDocTagComponent,
  NgDocTextComponent,
} from '@ng-doc/ui-kit';

import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar-item',
  imports: [RouterLinkActive, RouterLink, NgDocDotComponent, NgDocTextComponent, NgDocTagComponent],
  templateUrl: './sidebar-item.component.html',
  styleUrl: './sidebar-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarItemComponent {
  readonly item = input.required<NgDocNavigation>();
  readonly statuses = computed(() => {
    const statuses = this.item().metadata?.tags['status'] ?? [];

    return statuses.map((status) => {
      const [type, text] = status.split(/\s+(.+)/);

      return { type: type.replace(/^:/, '') as NgDocColor, text };
    });
  });
}
