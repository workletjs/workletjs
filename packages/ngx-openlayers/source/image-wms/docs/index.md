---
keyword: ImageWMSSourcePage
---

Source component for WMS servers providing single, untiled images.

## Examples

### Image Load Events

Image sources fire events related to image loading. You can use template event bindings to subscribe to the `wolImageLoadStart`, `wolImageLoadEnd`, and `wolImageLoadError` events to monitor image loading progress. This example binds these events and renders an image loading progress bar at the bottom of the map. The progress bar is shown and hidden according to the map's `wolLoadStart` and `wolLoadEnd` events.

{{ NgDocActions.demo("WolImageLoadEventsExampleComponent") }}

### Single Image WMS

WMS can be used as an Image layer, as shown here, or as a Tile layer, as shown in the [Tiled WMS](/sources/tile-wms#tiled-wms) example. Tiles can be cached, so the browser will not re-fetch data for areas that were viewed already. But there may be problems with repeated labels for WMS servers that are not aware of tiles, in which case single image WMS will produce better cartography.

{{ NgDocActions.demo("WolSingleImageWMSExampleComponent") }}

### WMS GetFeatureInfo (Image Layer)

This example shows how to trigger WMS GetFeatureInfo requests on click for a WMS image layer. Additionally `layer.getData(pixel)` is used to change the mouse pointer when hovering a non-transparent pixel on the map.

{{ NgDocActions.demo("WolImageWMSGetFeatureInfoExampleComponent") }}

### Single Image WMS with Proj4js

With [Proj4js](http://proj4js.org/) integration, OpenLayers can transform coordinates between arbitrary projections.

{{ NgDocActions.demo("WolImageWMSCustomProjExampleComponent") }}

{{ NgDocApi.api("packages/ngx-openlayers/source/image-wms/image-wms-source.component.ts#WolImageWMSSourceComponent") }}
