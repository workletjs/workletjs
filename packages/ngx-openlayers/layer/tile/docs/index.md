---
keyword: TileLayerPage
---

For layer sources that provide pre-rendered, tiled images in grids that are organized by zoom levels for specific resolutions.

It should be used together with tiled source components like `wol-source-xyz`, `wol-source-wmts`, `wol-source-osm`, `owl-source-bingmaps`.

## Examples

### Preload Tiles

The map on the top preloads low resolution tiles. The map on the bottom does not use any preloading. Try zooming out and panning to see the difference.

{{ NgDocActions.demo("WolPreloadTilesExampleComponent") }}

{{ NgDocApi.api("packages/ngx-openlayers/layer/tile/tile-layer.component.ts#WolTileLayerComponent") }}
