---
keyword: VectorImageLayerPage
---

Wraps an OpenLayers
[VectorImageLayer](https://openlayers.org/en/latest/apidoc/module-ol_layer_VectorImage-VectorImageLayer.html),
which renders vector data as images for smoother pan and zoom performance.

## Usage

```html
<wol-map>
  <wol-vector-image-layer [wolSource]="source"></wol-vector-image-layer>
</wol-map>
```

## Examples

### Vector Image Layer

This example uses `VectorImageLayer` component for faster rendering during interaction and
animations, at the cost of less accurate rendering.

{{ NgDocActions.demo("WolImageVectorLayerExampleComponent") }}

{{ NgDocApi.api("packages/ngx-openlayers/layer/vector-image/vector-image-layer.component.ts#WolVectorImageLayerComponent") }}
