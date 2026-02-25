import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { defaults } from 'ol/control/defaults';

import { WolAttributionControlModule } from '@workletjs/ngx-openlayers/control/attribution';
import { WolTileLayerModule } from '@workletjs/ngx-openlayers/layer/tile';
import { WolMapComponent, WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolOSMSourceModule } from '@workletjs/ngx-openlayers/source/osm';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';

@Component({
  selector: 'wol-static-attribution-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    WolMapModule,
    WolViewModule,
    WolAttributionControlModule,
    WolTileLayerModule,
    WolOSMSourceModule,
  ],
  template: `
    <wol-map class="h-96" [wolControls]="controls">
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="2" />
      <wol-tile-layer>
        <wol-osm-source />
      </wol-tile-layer>
      <wol-attribution-control [wolCollapsed]="false" [wolAttributions]="attributions" />
    </wol-map>
    <div class="mt-4">
      <button matButton="outlined" (click)="toggleLayer()">Toggle layer</button>
    </div>
  `,
})
export class WolStaticAttributionExampleComponent {
  readonly controls = defaults({ attribution: false });
  readonly attributions = `<a href="https://openlayers.org">I'm a static attribution. I never disappear</a>`;

  private readonly mapRef = viewChild.required(WolMapComponent);

  toggleLayer(): void {
    this.mapRef()
      .getInstance()
      ?.getLayers()
      .forEach((l) => {
        l.setVisible(l.getVisible() ? false : true);
      });
  }
}
