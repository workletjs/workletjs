import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { getCenter } from 'ol/extent';
import { transformExtent } from 'ol/proj';

import { WolSafeAny } from '@workletjs/ngx-openlayers/core/types';
import { WolTileLayerModule } from '@workletjs/ngx-openlayers/layer/tile';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolTileWMSSourceModule } from '@workletjs/ngx-openlayers/source/tile-wms';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';

@Component({
  selector: 'wol-wms-time-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    WolMapModule,
    WolViewModule,
    WolTileLayerModule,
    WolTileWMSSourceModule,
  ],
  template: `
    <wol-map class="h-96">
      <wol-view [wolCenter]="center" [wolZoom]="4" />
      <wol-tile-layer [wolExtent]="extent">
        <wol-tile-wms-source
          [wolAttributions]="['Iowa State University']"
          [wolUrl]="'https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r-t.cgi'"
          [wolParams]="params()"
        />
      </wol-tile-layer>
    </wol-map>
    <div class="mt-4 flex items-center gap-2">
      <button matButton="outlined" (click)="play()">Play</button>
      <button matButton="outlined" (click)="stop()">Pause</button>
      <span>{{ wmsTimeISOString() }}</span>
    </div>
  `,
})
export class WolWMSTimeExampleComponent {
  readonly interval = 3 * 60 * 60 * 1000;
  readonly step = 15 * 60 * 1000;
  readonly frameRate = 0.5; // frames per second

  readonly extent = transformExtent([-126, 24, -66, 50], 'EPSG:4326', 'EPSG:3857');
  readonly center = getCenter(this.extent);

  readonly wmsTime = signal(new Date());
  readonly wmsTimeISOString = computed(() => this.wmsTime().toISOString());
  readonly params = computed<{ [x: string]: WolSafeAny }>(() => ({
    LAYERS: 'nexrad-n0r-wmst',
    TIME: this.wmsTimeISOString(),
  }));

  private animationId: number | null = null;

  private threeHoursAgo(): Date {
    return new Date(Math.floor((Date.now() - this.interval) / this.step) * this.step);
  }

  private setTime(): void {
    this.wmsTime.update((current) => {
      const newTime = new Date(current);

      newTime.setMinutes(newTime.getMinutes() + 15);

      return newTime.getTime() > Date.now() ? this.threeHoursAgo() : newTime;
    });
  }

  constructor() {
    this.setTime();
  }

  stop(): void {
    if (this.animationId !== null) {
      clearInterval(this.animationId);
      this.animationId = null;
    }
  }

  play(): void {
    this.stop();
    this.animationId = setInterval(() => this.setTime(), 1000 / this.frameRate);
  }
}
