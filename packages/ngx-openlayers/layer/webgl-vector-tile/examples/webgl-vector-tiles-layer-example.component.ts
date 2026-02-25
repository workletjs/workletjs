import { ChangeDetectionStrategy, Component } from '@angular/core';

import MVT from 'ol/format/MVT';
import { FlatStyleLike } from 'ol/style/flat';

import { WolWebGLVectorTileLayerModule } from '@workletjs/ngx-openlayers/layer/webgl-vector-tile';
import { WolMapModule } from '@workletjs/ngx-openlayers/map';
import { WolVectorTileSourceModule } from '@workletjs/ngx-openlayers/source/vector-tile';
import { WolViewModule } from '@workletjs/ngx-openlayers/view';

@Component({
  selector: 'wol-webgl-vector-tiles-layer-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WolMapModule, WolViewModule, WolWebGLVectorTileLayerModule, WolVectorTileSourceModule],
  template: `
    <wol-map class="h-96">
      <wol-view [wolCenter]="[0, 0]" [wolZoom]="2" />
      <wol-webgl-vector-tile-layer [wolStyle]="style">
        <wol-vector-tile-source
          [wolAttributions]="attributions"
          [wolFormat]="format"
          [wolUrl]="url"
        />
      </wol-webgl-vector-tile-layer>
    </wol-map>
  `,
})
export class WolWebGLVectorTilesLayerExampleComponent {
  // Your Mapbox access token from https://mapbox.com/ here
  readonly key = `pk.eyJ1Ijoiam9ubnl0b3NoZW4iLCJhIjoiY21nazlrbXh2MG8xYjJscXcwbnVxdjVsZCJ9.znL9YlBqCSrootZ2EqRM2w`;
  readonly format = new MVT();
  readonly attributions =
    '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> ' +
    '© <a href="https://www.openstreetmap.org/copyright">' +
    'OpenStreetMap contributors</a>';
  readonly url =
    'https://{a-d}.tiles.mapbox.com/v4/mapbox.mapbox-streets-v6/' +
    '{z}/{x}/{y}.vector.pbf?access_token=' +
    this.key;

  readonly style: FlatStyleLike = [
    {
      filter: ['all', ['==', ['get', 'layer'], 'landuse'], ['==', ['get', 'class'], 'park']],
      style: {
        'fill-color': '#d8e8c8',
      },
    },
    {
      filter: ['all', ['==', ['get', 'layer'], 'landuse'], ['==', ['get', 'class'], 'cemetery']],
      style: {
        'fill-color': '#e0e4dd',
      },
    },
    {
      filter: ['all', ['==', ['get', 'layer'], 'landuse'], ['==', ['get', 'class'], 'hospital']],
      style: {
        'fill-color': '#fde',
      },
    },
    {
      filter: ['all', ['==', ['get', 'layer'], 'landuse'], ['==', ['get', 'class'], 'school']],
      style: {
        'fill-color': '#f0e8f8',
      },
    },
    {
      filter: ['all', ['==', ['get', 'layer'], 'landuse'], ['==', ['get', 'class'], 'wood']],
      style: {
        'fill-color': 'rgb(233,238,223)',
      },
    },
    {
      filter: ['==', ['get', 'layer'], 'waterway'],
      style: {
        'stroke-color': '#a0c8f0',
        'stroke-width': 1,
      },
    },
    {
      filter: ['==', ['get', 'layer'], 'water'],
      style: {
        'fill-color': '#a0c8f0',
      },
    },
    {
      filter: ['all', ['==', ['get', 'layer'], 'aeroway'], ['==', ['geometry-type'], 'Polygon']],
      style: {
        'fill-color': 'rgb(242,239,235)',
      },
    },
    {
      filter: [
        'all',
        ['==', ['get', 'layer'], 'aeroway'],
        ['==', ['geometry-type'], 'LineString'],
        ['<=', ['resolution'], 76.43702828517625],
      ],
      style: {
        'fill-color': '#f0ede9',
      },
    },
    {
      filter: ['==', ['get', 'layer'], 'building'],
      style: {
        'fill-color': '#f2eae2',
        'stroke-color': '#dfdbd7',
        'stroke-width': 1,
      },
    },
    {
      filter: [
        'all',
        ['==', ['get', 'layer'], 'tunnel'],
        ['==', ['get', 'class'], 'motorway_link'],
      ],
      style: {
        'stroke-color': '#e9ac77',
        'stroke-width': 1,
      },
    },
    {
      filter: ['all', ['==', ['get', 'layer'], 'tunnel'], ['==', ['get', 'class'], 'service']],
      style: {
        'stroke-color': '#cfcdca',
        'stroke-width': 1,
      },
    },
    {
      filter: [
        'all',
        ['==', ['get', 'layer'], 'tunnel'],
        ['any', ['==', ['get', 'class'], 'street'], ['==', ['get', 'class'], 'street_limited']],
      ],
      style: {
        'stroke-color': '#cfcdca',
        'stroke-width': 1,
      },
    },
    {
      filter: [
        'all',
        ['==', ['get', 'layer'], 'tunnel'],
        ['==', ['get', 'class'], 'main'],
        ['<=', ['resolution'], 1222.99245256282],
      ],
      style: {
        'stroke-color': '#e9ac77',
        'stroke-width': 1,
      },
    },
    {
      filter: ['all', ['==', ['get', 'layer'], 'tunnel'], ['==', ['get', 'class'], 'motorway']],
      style: {
        'stroke-color': '#e9ac77',
        'stroke-width': 1,
      },
    },
    {
      filter: ['all', ['==', ['get', 'layer'], 'tunnel'], ['==', ['get', 'class'], 'path']],
      style: {
        'stroke-color': '#cba',
        'stroke-width': 1,
      },
    },
    {
      filter: ['all', ['==', ['get', 'layer'], 'tunnel'], ['==', ['get', 'class'], 'major_rail']],
      style: {
        'stroke-color': '#bbb',
        'stroke-width': 2,
      },
    },
    {
      filter: ['all', ['==', ['get', 'layer'], 'road'], ['==', ['get', 'class'], 'motorway_link']],
      style: {
        'stroke-color': '#e9ac77',
        'stroke-width': 1,
      },
    },
    {
      filter: [
        'all',
        ['==', ['get', 'layer'], 'road'],
        ['any', ['==', ['get', 'class'], 'street'], ['==', ['get', 'class'], 'street_limited']],
        ['==', ['geometry-type'], 'LineString'],
      ],
      style: {
        'stroke-color': '#cfcdca',
        'stroke-width': 1,
      },
    },
    {
      filter: [
        'all',
        ['==', ['get', 'layer'], 'road'],
        ['==', ['get', 'class'], 'main'],
        ['<=', ['resolution'], 1222.99245256282],
      ],
      style: {
        'stroke-color': '#e9ac77',
        'stroke-width': 1,
      },
    },
    {
      filter: [
        'all',
        ['==', ['get', 'layer'], 'road'],
        ['==', ['get', 'class'], 'motorway'],
        ['<=', ['resolution'], 4891.96981025128],
      ],
      style: {
        'stroke-color': '#e9ac77',
        'stroke-width': 1,
      },
    },
    {
      filter: ['all', ['==', ['get', 'layer'], 'road'], ['==', ['get', 'class'], 'path']],
      style: {
        'stroke-color': '#cba',
        'stroke-width': 1,
      },
    },
    {
      filter: ['all', ['==', ['get', 'layer'], 'road'], ['==', ['get', 'class'], 'major_rail']],
      style: {
        'stroke-color': '#bbb',
        'stroke-width': 2,
      },
    },
    {
      filter: [
        'all',
        ['==', ['get', 'layer'], 'bridge'],
        ['any', ['==', ['get', 'class'], 'motorway'], ['==', ['get', 'class'], 'motorway_link']],
      ],
      style: {
        'stroke-color': '#e9ac77',
        'stroke-width': 1,
      },
    },
    {
      filter: [
        'all',
        ['==', ['get', 'layer'], 'bridge'],
        [
          'any',
          ['==', ['get', 'class'], 'street'],
          ['==', ['get', 'class'], 'street_limited'],
          ['==', ['get', 'class'], 'service'],
        ],
      ],
      style: {
        'stroke-color': '#cfcdca',
        'stroke-width': 1,
      },
    },
    {
      filter: [
        'all',
        ['==', ['get', 'layer'], 'bridge'],
        ['==', ['get', 'class'], 'main'],
        ['<=', ['resolution'], 1222.99245256282],
      ],
      style: {
        'stroke-color': '#e9ac77',
        'stroke-width': 1,
      },
    },
    {
      filter: ['all', ['==', ['get', 'layer'], 'bridge'], ['==', ['get', 'class'], 'path']],
      style: {
        'stroke-color': '#cba',
        'stroke-width': 1,
      },
    },
    {
      filter: ['all', ['==', ['get', 'layer'], 'bridge'], ['==', ['get', 'class'], 'major_rail']],
      style: {
        'stroke-color': '#bbb',
        'stroke-width': 2,
      },
    },
    {
      filter: [
        'all',
        ['==', ['get', 'layer'], 'admin'],
        ['>=', ['get', 'admin_level'], 2],
        ['==', ['get', 'maritime'], 0],
      ],
      style: {
        'stroke-color': '#9e9cab',
        'stroke-width': 1,
      },
    },
    {
      filter: [
        'all',
        ['==', ['get', 'layer'], 'admin'],
        ['>=', ['get', 'admin_level'], 2],
        ['==', ['get', 'maritime'], 1],
      ],
      style: {
        'stroke-color': '#a0c8f0',
        'stroke-width': 1,
      },
    },
    {
      style: { 'circle-radius': 4, 'circle-fill-color': '#777' },
    },
  ];
}
