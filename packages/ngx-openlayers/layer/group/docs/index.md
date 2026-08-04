---
keyword: LayerGroupPage
---

Wraps an OpenLayers
[LayerGroup](https://openlayers.org/en/latest/apidoc/module-ol_layer_Group-LayerGroup.html)
instance, a collection of layers that are handled together. A generic `change` event is triggered
when the group or its collection changes. Must be used inside a `wol-map`,
`wol-overview-map-control`, or another `wol-layer-group` component.

## Usage

```html
<wol-map>
  <wol-layer-group [wolOpacity]="0.8">
    <wol-tile-layer>...</wol-tile-layer>
  </wol-layer-group>
</wol-map>
```

## Examples

### Layer Groups

Example of a map with layer group.

{{ NgDocActions.demo("WolLayerGroupsExampleComponent") }}

{{ NgDocApi.api("packages/ngx-openlayers/layer/group/layer-group.component.ts#WolLayerGroupComponent") }}
