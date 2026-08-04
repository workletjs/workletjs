---
keyword: TileLayerPage
---

Wraps an OpenLayers
[TileLayer](https://openlayers.org/en/latest/apidoc/module-ol_layer_Tile-TileLayer.html), used for
tiled raster sources.

It should be used together with tiled source components like `wol-source-xyz`, `wol-source-wmts`,
`wol-source-osm`, `wol-source-bingmaps`.

## Usage

```html
<wol-map>
  <wol-tile-layer [wolSource]="source"></wol-tile-layer>
</wol-map>
```

## Examples

### Preload Tiles

The map on the top preloads low resolution tiles. The map on the bottom does not use any preloading.
Try zooming out and panning to see the difference.

{{ NgDocActions.demo("WolPreloadTilesExampleComponent") }}

{{ NgDocApi.api("packages/ngx-openlayers/layer/tile/tile-layer.component.ts#WolTileLayerComponent") }}
