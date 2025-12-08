import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { WolMapComponent, WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';
import { WolRotateControlModule } from '@workletjs/ngx-openlayers/control/rotate';
import { WolTileLayerModule } from '@workletjs/ngx-openlayers/layer/tile';
import { WolOSMSourceModule } from '@workletjs/ngx-openlayers/source/osm';
import { defaults } from 'ol/control/defaults';

@Component({
  selector: 'wol-rotate-control-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    WolMapModule,
    WolViewModule,
    WolRotateControlModule,
    WolTileLayerModule,
    WolOSMSourceModule,
  ],
  template: `
    <wol-map class="h-96" [wolControls]="controls">
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="2" [wolRotation]="rotate()" />
      <wol-rotate-control />
      <wol-tile-layer>
        <wol-osm-source />
      </wol-tile-layer>
    </wol-map>
    <div class="mt-4 flex gap-2">
      <button matButton="outlined" (click)="rotateLeft()">Rotate left</button>
      <button matButton="outlined" (click)="rotateRight()">Rotate right</button>
    </div>
  `,
})
export class WolRotateControlExampleComponent {
  // Disable the default rotate control to avoid having two rotate controls
  readonly controls = defaults({ rotate: false });
  readonly rotate = signal(Math.PI / 8);

  rotateLeft(): void {
    this.rotate.update((value) => value - Math.PI / 8);
  }

  rotateRight(): void {
    this.rotate.update((value) => value + Math.PI / 8);
  }
}
