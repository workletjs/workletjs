import {
  ChangeDetectionStrategy,
  Component,
  afterNextRender,
  signal,
  viewChild,
} from '@angular/core';

import { defaults } from 'ol/control/defaults';

import { WolAttributionControlModule } from '@workletjs/ngx-openlayers/control/attribution';
import { WolTileLayerModule } from '@workletjs/ngx-openlayers/layer/tile';
import { WolMapComponent, WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolOSMSourceModule } from '@workletjs/ngx-openlayers/source/osm';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';

@Component({
  selector: 'wol-attributions-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    WolMapModule,
    WolViewModule,
    WolAttributionControlModule,
    WolTileLayerModule,
    WolOSMSourceModule,
  ],
  template: `
    <wol-map class="h-96" [wolControls]="controls" (wolSizeChange)="checkSize()">
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="2" />
      <wol-tile-layer>
        <wol-osm-source />
      </wol-tile-layer>
      <wol-attribution-control [wolCollapsed]="collapsed()" [wolCollapsible]="collapsible()" />
    </wol-map>
  `,
})
export class WolAttributionsExampleComponent {
  readonly controls = defaults({ attribution: false });
  readonly collapsed = signal(false);
  readonly collapsible = signal(true);

  private readonly mapRef = viewChild.required(WolMapComponent);

  constructor() {
    afterNextRender(() => {
      this.checkSize();
    });
  }

  checkSize(): void {
    const map = this.mapRef().getInstance();

    if (!map) {
      return;
    }

    const size = map.getSize();
    const small = size ? size[0] < 600 : false;

    this.collapsible.set(small);
    this.collapsed.set(small);
  }
}
