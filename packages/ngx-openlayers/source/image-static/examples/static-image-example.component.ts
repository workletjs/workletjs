import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import { getCenter } from 'ol/extent';
import { Projection } from 'ol/proj';

import { WolImageLayerModule } from '@workletjs/ngx-openlayers/layer/image';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolImageStaticSourceModule } from '@workletjs/ngx-openlayers/source/image-static';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';

@Component({
  selector: 'wol-static-image-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WolMapModule, WolViewModule, WolImageLayerModule, WolImageStaticSourceModule],
  template: `
    <wol-map class="h-96">
      <wol-view [wolProjection]="projection" [wolCenter]="center" [wolZoom]="2" [wolMaxZoom]="8" />
      <wol-image-layer>
        <wol-image-static-source
          [wolAttributions]="xkcdAttributions"
          [wolUrl]="'https://imgs.xkcd.com/comics/online_communities.png'"
          [wolProjection]="projection"
          [wolImageExtent]="extent"
        />
      </wol-image-layer>
    </wol-map>
  `,
})
export class WolStaticImageExampleComponent {
  readonly xkcdAttributions = '© <a href="https://xkcd.com/license.html">xkcd</a>';
  readonly extent = [0, 0, 1024, 968];
  readonly center = getCenter(this.extent);
  readonly projection = new Projection({
    code: 'xkcd-image',
    units: 'pixels',
    extent: this.extent,
  });
}
