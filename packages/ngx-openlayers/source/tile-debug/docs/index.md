---
keyword: TileDebugSourcePage
---

A pseudo tile source, which does not fetch tiles from a server, but renders a grid outline for the tile grid/projection along with the coordinates for each tile. See [Canvas Tiles](/sources/tile-debug#canvas-tiles) for an example.

## Examples

### Canvas Tiles

The black grid tiles are generated on the client with an HTML5 canvas. The displayed tile coordinates are the XYZ tile coordinates.

{{ NgDocActions.demo("WolCanvasTilesExampleComponent") }}

{{ NgDocApi.api("packages/ngx-openlayers/source/tile-debug/tile-debug-source.component.ts#WolTileDebugSourceComponent") }}
