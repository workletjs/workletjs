---
keyword: WebGLVectorTileLayerPage
---

> **Alert** **CRITICAL**: `WebGLVectorTileLayer` component is **_experimental_**.  
> The component may change in future releases. Avoid using experimental components in production
> applications without understanding the risks.

Layer component optimized for rendering large vector tile datasets using WebGL. This layer accepts a
[`VectorTile`](components/sources/vector-tile) source component and a `FlatStyleLike` style
definition for GPU-accelerated tile rendering.

> **Note** The `wolExtent` and `wolBackground` properties are currently not supported by the
> underlying OpenLayers implementation.

> **Note** A `WebGLVectorTileLayer` must be **manually disposed** when removed, otherwise the
> underlying WebGL context will not be garbage collected. The component handles this automatically
> in its `DestroyRef` lifecycle hook.

## Examples

### WebGL Vector Tile Layer

This example renders Mapbox Vector Tiles (MVT) using the `WolWebGLVectorTileLayerComponent` with a
flat style.

> **Note** Make sure to get your own Mapbox API key when using this example. No map will be visible
> when the API key has expired.

{{ NgDocActions.demo("WolWebGLVectorTilesLayerExampleComponent") }}

## API

{{ NgDocApi.api("packages/ngx-openlayers/layer/webgl-vector-tile/webgl-vector-tile-layer.component.ts#WolWebGLVectorTileLayerComponent") }}
