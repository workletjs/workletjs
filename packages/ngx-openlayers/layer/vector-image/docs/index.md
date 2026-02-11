---
keyword: VectorImageLayerPage
---

Vector data is rendered client-side, to an image. This layer component provides great performance
during panning and zooming, but point symbols and texts are always rotated with the view and pixels
are scaled during zoom animations.

For more accurate rendering of vector data, use [VectorLayer](components/layers/vector-layer)
component instead.

## Examples

### Vector Image Layer

This example uses `VectorImageLayer` component for faster rendering during interaction and
animations, at the cost of less accurate rendering.

{{ NgDocActions.demo("WolImageVectorLayerExampleComponent") }}

{{ NgDocApi.api("packages/ngx-openlayers/layer/vector-image/vector-image-layer.component.ts#WolVectorImageLayerComponent") }}
