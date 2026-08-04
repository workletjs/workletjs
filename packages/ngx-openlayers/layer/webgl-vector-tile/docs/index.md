---
keyword: WebGLVectorTileLayerPage
---

> **Alert** **CRITICAL**: `WebGLVectorTileLayer` component is **_experimental_**.  
> The component may change in future releases. Avoid using experimental components in production
> applications without understanding the risks.

Wraps an OpenLayers
[WebGLVectorTileLayer](https://openlayers.org/en/latest/apidoc/module-ol_layer_WebGLVectorTile-WebGLVectorTileLayer.html),
used for WebGL rendering of vector tiles with flat style expressions.

> **Note** A `WebGLVectorTileLayer` must be **manually disposed** when removed, otherwise the
> underlying WebGL context will not be garbage collected. The component handles this automatically
> in its `DestroyRef` lifecycle hook.

## Usage

```html
<wol-map>
  <wol-webgl-vector-tile-layer
    [wolSource]="source"
    [wolStyle]="style"
  ></wol-webgl-vector-tile-layer>
</wol-map>
```

## Examples

### WebGL Vector Tile Layer

This example renders Mapbox Vector Tiles (MVT) using the `WolWebGLVectorTileLayerComponent` with a
flat style.

> **Note** Make sure to get your own Mapbox API key when using this example. No map will be visible
> when the API key has expired.

{{ NgDocActions.demo("WolWebGLVectorTilesLayerExampleComponent") }}

## API

{{ NgDocApi.api("packages/ngx-openlayers/layer/webgl-vector-tile/webgl-vector-tile-layer.component.ts#WolWebGLVectorTileLayerComponent") }}
