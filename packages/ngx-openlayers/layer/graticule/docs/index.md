---
keyword: GraticuleLayerPage
---

Wraps an OpenLayers
[Graticule](https://openlayers.org/en/latest/apidoc/module-ol_layer_Graticule-Graticule.html) layer,
which renders a coordinate grid for EPSG:4326.

> **Note** Note that the view projection must define both `extent` and `worldExtent`.

## Usage

```html
<wol-map>
  <wol-graticule-layer [wolShowLabels]="true"></wol-graticule-layer>
</wol-map>
```

## Examples

### Map Graticule

This example shows how to add a graticule layer to a map.

{{ NgDocActions.demo("WolGraticuleLayerExampleComponent") }}

### Sphere Mollweide

Example of a Sphere Mollweide map with a Graticule layer.

{{ NgDocActions.demo("WolSphereMollweideExampleComponent") }}

{{ NgDocApi.api("packages/ngx-openlayers/layer/graticule/graticule-layer.component.ts#WolGraticuleLayerComponent") }}
