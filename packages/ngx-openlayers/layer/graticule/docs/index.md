---
keyword: GraticuleLayerPage
---

Layer that renders a grid for a coordinate system (currently only EPSG:4326 is supported).

> **Note**
> Note that the view projection must define both extent and worldExtent.

## Examples

### Map Graticule

This example shows how to add a graticule layer to a map.

{{ NgDocActions.demo("WolGraticuleLayerExampleComponent") }}

### Sphere Mollweide

Example of a Sphere Mollweide map with a Graticule layer.

{{ NgDocActions.demo("WolSphereMollweideExampleComponent") }}

{{ NgDocApi.api("packages/ngx-openlayers/layer/graticule/graticule-layer.component.ts#WolGraticuleLayerComponent") }}
