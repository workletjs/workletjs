---
keyword: VectorLayerPage
---

Vector data is rendered client-side, as vectors. This layer component provides most accurate rendering even during animations. Points and labels stay upright on rotated views.

For very large amounts of vector data, performance may suffer during pan and zoom animations. In this case, try [VectorImageLayer](components/layers/vector-image-layer) component.

## Examples

### Vector Layer

The countries are loaded from a GeoJSON file. Information about countries is shown on hover and click.

{{ NgDocActions.demo("WolVectorLayerExampleComponent") }}

{{ NgDocApi.api("packages/ngx-openlayers/layer/vector/vector-layer.component.ts#WolVectorLayerComponent") }}
