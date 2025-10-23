---
keyword: ImageTileSourcePage
---

A source for typed array data tiles.

## Examples

### XYZ

The ImageTile source is used for tile data that is accessed through URLs that include a zoom level and tile grid x/y coordinates.

{{ NgDocActions.demo("WolImageTileXYZExampleComponent") }}

### XYZ Esri

ArcGIS REST tile services are supported by [XYZ Source](/source/xyz).

{{ NgDocActions.demo("WolImageTileXYZEsriExampleComponent") }}

### XYZ Retina Tiles

The ImageTile generates 256x256 pixel tiles by default. If the requested images are larger than that, they will be scaled to fit. This example uses 512x512 tiles, which are scaled to 256x256 for display.

{{ NgDocActions.demo("WolImageTileXYZRetinaExampleComponent") }}

{{ NgDocApi.api("packages/ngx-openlayers/source/image-tile/image-tile-source.component.ts#WolImageTileSourceComponent") }}
