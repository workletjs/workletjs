import { NgDocNotifyService } from '@ng-doc/ui-kit/services/notify';

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { HeroBannerComponent } from './components';

@Component({
  selector: 'wol-docs-landing',
  imports: [RouterLink, HeroBannerComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingComponent {
  protected readonly installCommand = 'ng add @workletjs/ngx-openlayers';
  protected readonly copyState = signal<'idle' | 'copying' | 'copied' | 'error'>('idle');
  private readonly notifyService = inject(NgDocNotifyService);
  protected readonly badges = [
    {
      name: 'npm version',
      img: 'https://img.shields.io/npm/v/@workletjs/ngx-openlayers.svg?style=flat&label=npm&color=0c6cbd',
      link: 'https://www.npmjs.com/package/@workletjs/ngx-openlayers',
    },
    {
      name: 'GitHub stars',
      img: 'https://img.shields.io/github/stars/workletjs/workletjs?style=flat&color=0c6cbd',
      link: 'https://github.com/workletjs/workletjs/stargazers',
    },
    {
      name: 'MIT license',
      img: 'https://img.shields.io/github/license/workletjs/workletjs.svg?style=flat&color=0c6cbd',
      link: 'https://github.com/workletjs/workletjs/blob/main/LICENSE',
    },
  ];

  protected async copyInstallCommand(): Promise<void> {
    this.copyState.set('copying');
    try {
      await navigator.clipboard.writeText(this.installCommand);
      this.copyState.set('copied');
      this.notifyService.notify('Command copied. Your first map is next.');
    } catch {
      this.copyState.set('error');
      this.notifyService.notify('Copy unavailable. Select and copy the command above.');
    }
  }
}
