---
keyword: ViewPage
---

Wraps an OpenLayers [View](https://openlayers.org/en/latest/apidoc/module-ol_View-View.html)
instance, which represents a simple 2D view of the map. This is the object to act upon to change the
center, resolution and rotation of the map.

## Usage

```html
<wol-map>
  <wol-view [wolCenter]="[0, 0]" [wolZoom]="2"></wol-view>
</wol-map>
```

{{ NgDocApi.api("packages/ngx-openlayers/view/view.component.ts#WolViewComponent") }}
