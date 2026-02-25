import {
  NgDocButtonComponent,
  NgDocIconComponent,
  NgDocTextComponent,
  NgDocTextRightDirective,
} from '@ng-doc/ui-kit';

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { HeroBannerComponent } from './components';

@Component({
  selector: 'app-landing',
  imports: [
    RouterLink,
    NgDocTextComponent,
    NgDocTextRightDirective,
    NgDocButtonComponent,
    NgDocIconComponent,
    NgDocTextRightDirective,
    HeroBannerComponent,
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingComponent {
  readonly badges = [
    {
      name: 'version',
      img: 'https://img.shields.io/npm/v/@workletjs/ngx-openlayers.svg?style=for-the-badge',
      link: 'https://www.npmjs.com/package/@workletjs/ngx-openlayers',
    },
    {
      name: 'stars',
      img: 'https://img.shields.io/github/stars/workletjs/workletjs?style=for-the-badge',
      link: 'https://github.com/workletjs/workletjs/stargazers',
    },
    {
      name: 'license',
      img: 'https://img.shields.io/github/license/workletjs/workletjs.svg?style=for-the-badge',
      link: 'https://github.com/workletjs/workletjs/blob/main/LICENSE',
    },
  ];
  readonly features = [
    {
      title: 'Declarative Mapping',
      description:
        'Encapsulate complex OpenLayers APIs into intuitive Angular components, enabling rapid development of interactive maps through data binding.',
    },
    {
      title: 'High-Performance Layers',
      description:
        'Leverage WebGL-powered layers for smooth rendering of large datasets, ensuring optimal performance even with complex visualizations.',
    },
    {
      title: 'Modular Map Controls',
      description:
        'Easily add and customize map controls like zoom, rotation, and attribution with pre-built Angular components designed for flexibility.',
    },
  ];
}
