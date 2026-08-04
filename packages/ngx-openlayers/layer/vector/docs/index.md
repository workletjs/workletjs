---
keyword: VectorLayerPage
---

Wraps an OpenLayers
[VectorLayer](https://openlayers.org/en/latest/apidoc/module-ol_layer_Vector-VectorLayer.html),
which renders vector features client-side with full style fidelity.

## Usage

```html
<wol-map>
  <wol-vector-layer [wolSource]="source"></wol-vector-layer>
</wol-map>
```

## Examples

### Vector Layer

The countries are loaded from a GeoJSON file. Information about countries is shown on hover and
click.

{{ NgDocActions.demo("WolVectorLayerExampleComponent") }}

{{ NgDocApi.api("packages/ngx-openlayers/layer/vector/vector-layer.component.ts#WolVectorLayerComponent") }}
