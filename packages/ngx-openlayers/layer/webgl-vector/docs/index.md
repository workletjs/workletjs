---
keyword: WebGLVectorLayerPage
---

> **Alert** **CRITICAL**: `WebGLVectorLayer` component is **_experimental_**.  
> This component is not part of the stable API and subject to change between releases. Consult the
> [OpenLayers API documentation](https://openlayers.org/en/latest/apidoc/) to see what is supported
> in the latest release.

Wraps an OpenLayers
[WebGLVectorLayer](https://openlayers.org/en/latest/apidoc/module-ol_layer_WebGLVector-WebGLVectorLayer.html),
used for WebGL rendering of vector data.

## Usage

```html
<wol-map>
  <wol-webgl-vector-layer [wolSource]="source" [wolStyle]="style"></wol-webgl-vector-layer>
</wol-map>
```

## Examples

### WebGL Vector Layer

This example uses the WebGLVectorLayer component to render a large ecoregion vector dataset loaded
from a GeoJSON file.

{{ NgDocActions.demo("WolWebGLVectorLayerExampleComponent") }}

{{ NgDocApi.api("packages/ngx-openlayers/layer/webgl-vector/webgl-vector-layer.component.ts#WolWebGLVectorLayerComponent") }}
