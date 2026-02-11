---
keyword: TileWMSSourcePage
---

Layer source for tile data from WMS servers.

## Examples

### Tiled WMS

WMS can be used as a Tile layer, as shown here, or as an Image layer, as shown in the
[Single Image WMS](/sources/image-wms#single-image-wms) example. Tiles can be cached, so the browser
will not re-fetch data for areas that were viewed already. But there may be problems with repeated
labels for WMS servers that are not aware of tiles, in which case single image WMS will produce
better cartography.

{{ NgDocActions.demo("WolTiledWMSExampleComponent") }}

### Tiled WMS Wrapping

By default, WMS tiles are reused across the 180° meridian. This behavior can be disabled by setting
the `wolWrapX` property to `false`.

{{ NgDocActions.demo("WolTiledWMSWrappingExampleComponent") }}

### WMS 512x256 Tiles

WMS can serve arbitrary tile sizes. This example uses a custom tile grid with non-square tiles.

{{ NgDocActions.demo("WolWMSCustomTileGridExampleComponent") }}

### WMS Time

Demonstrates smooth reloading of layers when changing the time dimension continuously. Data shown:
IEM generated CONUS composite of NWS NEXRAD WSR-88D level III base reflectivity.

{{ NgDocActions.demo("WolWMSTimeExampleComponent") }}

{{ NgDocApi.api("packages/ngx-openlayers/source/tile-wms/tile-wms-source.component.ts#WolTileWMSSourceComponent") }}
