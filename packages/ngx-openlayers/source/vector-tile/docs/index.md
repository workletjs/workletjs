---
keyword: VectorTileSourcePage
---

Component for layer sources providing vector data divided into a tile grid, to be used with [VectorTileLayer](components/layers/vector-tile-layer) component. Although this source receives tiles with vector features from the server, it is not meant for feature editing. Features are optimized for rendering, their geometries are clipped at or near tile boundaries and simplified for a view resolution.

## Examples

### Vector Tile Info

Move your pointer over rendered features to display feature properties.

{{ NgDocActions.demo("WolVectorTileInfoExampleComponent") }}

{{ NgDocApi.api("packages/ngx-openlayers/source/vector-tile/vector-tile-source.component.ts#WolVectorTileSourceComponent") }}
