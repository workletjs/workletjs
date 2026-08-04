---
keyword: MapPage
---

Wraps an OpenLayers [Map](https://openlayers.org/en/latest/apidoc/module-ol_Map-Map.html) instance,
the core component of OpenLayers responsible for rendering a view, a set of layers, and any
controls, interactions and overlays into a target container.

Usually you will use it together with `wol-view` component to setup `zoom`, `center`, `projection`
and other view related properties for the map.

## Usage

```html
<wol-map [wolView]="view" [wolLayers]="layers"></wol-map>
```

## Examples

### Simple Map

A simple map with an OSM source.

{{ NgDocActions.demo("WolSimpleMapExampleComponent") }}

### Accessible Map

The `wol-map` element has its `tabindex` attribute set to `"0"`, that makes it focusable. To focus
the map element you can either navigate to it using the "tab" key or use the skip link. When the
`wol-map` element is focused the + and - keys can be used to zoom in and out and the arrow keys can
be used to pan.

Clicking on the "Zoom in" and "Zoom out" buttons below the map zooms the map in and out. You can
navigate to the buttons using the "tab" key, and press the "enter" key to trigger the zooming
action.

{{ NgDocActions.demo("WolAccessibleMapExampleComponent") }}

{{ NgDocApi.api("packages/ngx-openlayers/map/map.component.ts#WolMapComponent") }}
