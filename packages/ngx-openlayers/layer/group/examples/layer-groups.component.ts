import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSliderModule } from '@angular/material/slider';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';
import { WolLayerGroupModule } from '@workletjs/ngx-openlayers/layer/group';
import { WolTileLayerModule } from '@workletjs/ngx-openlayers/layer/tile';
import { WolOSMSourceModule } from '@workletjs/ngx-openlayers/source/osm';
import { WolTileJSONSourceModule } from '@workletjs/ngx-openlayers/source/tile-json';
import { WolProjModule } from '@workletjs/ngx-openlayers/proj';

@Component({
  selector: 'wol-layer-groups-example',
  imports: [
    FormsModule,
    MatCheckboxModule,
    MatSliderModule,
    WolMapModule,
    WolViewModule,
    WolLayerGroupModule,
    WolTileLayerModule,
    WolOSMSourceModule,
    WolTileJSONSourceModule,
    WolProjModule,
  ],
  template: `
    <wol-map class="h-96">
      <wol-view [wolCenter]="[37.4057, 8.81566] | wolFromLonLat" [wolZoom]="4" />
      <wol-tile-layer [wolVisible]="osmLayerVisible()" [wolOpacity]="osmLayerOpacity()">
        <wol-osm-source />
      </wol-tile-layer>
      <wol-layer-group [wolVisible]="layerGroupVisible()" [wolOpacity]="layerGroupOpacity()">
        <wol-tile-layer
          [wolVisible]="foodInsecurityLayerVisible()"
          [wolOpacity]="foodInsecurityLayerOpacity()"
        >
          <wol-tile-json-source
            [wolUrl]="
              'https://api.tiles.mapbox.com/v4/mapbox.20110804-hoa-foodinsecurity-3month.json?secure&access_token=' +
              key
            "
            [wolCrossOrigin]="'anonymous'"
          />
        </wol-tile-layer>
        <wol-tile-layer
          [wolVisible]="countryBordersLayerVisible()"
          [wolOpacity]="countryBordersLayerOpacity()"
        >
          <wol-tile-json-source
            [wolUrl]="
              'https://api.tiles.mapbox.com/v4/mapbox.world-borders-light.json?secure&access_token=' +
              key
            "
            [wolCrossOrigin]="'anonymous'"
          />
        </wol-tile-layer>
      </wol-layer-group>
    </wol-map>
    <div class="mt-4">
      <h5 class="text-lg font-medium mb-2">
        Click on layer nodes below to change their properties.
      </h5>
      <ul class="ps-8 list-disc">
        <li>
          <span class="cursor-pointer" (click)="toggleFieldset($event)">OSM layer</span>
          <fieldset class="flex items-center gap-4 hidden">
            <label for="osm-layer-visible">
              <span>Visible</span>
              <mat-checkbox id="osm-layer-visible" [(ngModel)]="osmLayerVisible" />
            </label>
            <label for="osm-layer-opacity">
              <span>Opacity</span>
              <mat-slider id="osm-layer-opacity" min="0" max="1" step="0.1">
                <input matSliderThumb [(ngModel)]="osmLayerOpacity" />
              </mat-slider>
            </label>
          </fieldset>
        </li>
        <li>
          <span class="cursor-pointer" (click)="toggleFieldset($event)">Layer group</span>
          <fieldset class="flex items-center gap-4 hidden">
            <label for="layer-group-visible">
              <span>Visible</span>
              <mat-checkbox id="layer-group-visible" [(ngModel)]="layerGroupVisible" />
            </label>
            <label for="layer-group-opacity">
              <span>Opacity</span>
              <mat-slider id="layer-group-opacity" min="0" max="1" step="0.1">
                <input matSliderThumb [(ngModel)]="layerGroupOpacity" />
              </mat-slider>
            </label>
          </fieldset>
          <ul class="ps-8 list-[circle]">
            <li>
              <span class="cursor-pointer" (click)="toggleFieldset($event)"
                >Food Insecurity Layer</span
              >
              <fieldset class="flex items-center gap-4 hidden">
                <label for="food-insecurity-layer-visible">
                  <span>Visible</span>
                  <mat-checkbox
                    id="food-insecurity-layer-visible"
                    [(ngModel)]="foodInsecurityLayerVisible"
                  />
                </label>
                <label for="food-insecurity-layer-opacity">
                  <span>Opacity</span>
                  <mat-slider id="food-insecurity-layer-opacity" min="0" max="1" step="0.1">
                    <input matSliderThumb [(ngModel)]="foodInsecurityLayerOpacity" />
                  </mat-slider>
                </label>
              </fieldset>
            </li>
            <li>
              <span class="cursor-pointer" (click)="toggleFieldset($event)"
                >Country Borders Layer</span
              >
              <fieldset class="flex items-center gap-4 hidden">
                <label for="country-borders-layer-visible">
                  <span>Visible</span>
                  <mat-checkbox
                    id="country-borders-layer-visible"
                    [(ngModel)]="countryBordersLayerVisible"
                  />
                </label>
                <label for="country-borders-layer-opacity">
                  <span>Opacity</span>
                  <mat-slider id="country-borders-layer-opacity" min="0" max="1" step="0.1">
                    <input matSliderThumb [(ngModel)]="countryBordersLayerOpacity" />
                  </mat-slider>
                </label>
              </fieldset>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  `,
})
export class WolLayerGroupsExampleComponent {
  // Your Mapbox access token from https://mapbox.com/ here
  readonly key = `pk.eyJ1Ijoiam9ubnl0b3NoZW4iLCJhIjoiY21nazlrbXh2MG8xYjJscXcwbnVxdjVsZCJ9.znL9YlBqCSrootZ2EqRM2w`;

  readonly osmLayerVisible = signal(true);
  readonly osmLayerOpacity = signal(1);

  readonly layerGroupVisible = signal(true);
  readonly layerGroupOpacity = signal(1);

  readonly foodInsecurityLayerVisible = signal(true);
  readonly foodInsecurityLayerOpacity = signal(1);

  readonly countryBordersLayerVisible = signal(true);
  readonly countryBordersLayerOpacity = signal(1);

  toggleFieldset(event: PointerEvent): void {
    const target = event.target as HTMLElement;
    const fieldset = target.nextElementSibling as HTMLFieldSetElement;

    fieldset.classList.toggle('hidden');
  }
}
