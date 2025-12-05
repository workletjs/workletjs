import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WolWebGLTileLayerModule } from '@workletjs/ngx-openlayers/layer/webgl-tile';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolImageTileSourceModule } from '@workletjs/ngx-openlayers/source/image-tile';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';

const locations = [
  {
    center: [0, 4050000],
    zoom: 2,
  },
  {
    center: [-10026264.955714773, 3498225.377934253],
    zoom: 12.3,
  },
  {
    center: [-8120333.846364162, -5972314.327727663],
    zoom: 10.15,
  },
  {
    center: [12700564.586161729, 2575397.3413926377],
    zoom: 13.8,
  },
  {
    center: [8976666.32253083, 814262.3154676007],
    zoom: 15.7,
  },
  {
    center: [1284003.7367688504, 5950927.737276901],
    zoom: 11.19,
  },
  {
    center: [-8468554.506387988, 5696886.564463913],
    zoom: 10.11,
  },
  {
    center: [707717.3609533564, 6361291.958635207],
    zoom: 10.02,
  },
  {
    center: [3345381.3050933336, -216864.19183635892],
    zoom: 13.9,
  },
  {
    center: [3318257.9642649507, -1786301.1175574847],
    zoom: 6.1,
  },
  {
    center: [19365301.097574536, -5033096.120372388],
    zoom: 10.77,
  },
  {
    center: [-13542913.807564376, 5913315.884147839],
    zoom: 11.59,
  },
  {
    center: [9680854.2477813, 3231923.470902604],
    zoom: 8.06,
  },
  {
    center: [-10341383.185823392, 1826844.1155603195],
    zoom: 9.27,
  },
  {
    center: [3232422.751942559, 5017252.706810253],
    zoom: 12.25,
  },
  {
    center: [-16373943.169136822, 8651360.275919426],
    zoom: 8.49,
  },
  {
    center: [12475943.19806142, 4172022.2635435928],
    zoom: 9.91,
  },
];

@Component({
  selector: 'app-hero-banner',
  imports: [WolMapModule, WolViewModule, WolWebGLTileLayerModule, WolImageTileSourceModule],
  templateUrl: './hero-banner.component.html',
  styleUrl: './hero-banner.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroBannerComponent {
  readonly location = locations[Math.floor(Math.random() * locations.length)];
  readonly url =
    'https://api.maptiler.com/maps/outdoor-v2/256/{z}/{x}/{y}@2x.png?key=8OyphSYjlGSuAe4ZUCkV';
  readonly attributions = '© MapTiler © OpenStreetMap contributors';
}
