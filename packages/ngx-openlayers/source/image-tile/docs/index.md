---
keyword: ImageTileSourcePage
---

Loads image tiles from URL templates or a custom tile loader.

## Examples

### XYZ

The ImageTile source is used for tile data that is accessed through URLs that include a zoom level
and tile grid x/y coordinates.

{{ NgDocActions.demo("WolImageTileXYZExampleComponent") }}

### XYZ Esri

This example loads ArcGIS REST tiles by supplying a URL template to `wolUrl`.

{{ NgDocActions.demo("WolImageTileXYZEsriExampleComponent") }}

### XYZ Retina Tiles

The default tile size is 256 by 256 pixels. This example requests 512-by-512-pixel images and
renders them at 256 by 256 pixels.

{{ NgDocActions.demo("WolImageTileXYZRetinaExampleComponent") }}

{{ NgDocApi.api("packages/ngx-openlayers/source/image-tile/image-tile-source.component.ts#WolImageTileSourceComponent") }}
