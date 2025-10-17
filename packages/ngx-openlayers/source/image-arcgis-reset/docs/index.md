---
keyword: ImageArcGISRestSourcePage
---

Layer source for data from ArcGIS Rest services providing single, untiled images. Useful when underlying map service has labels.

If underlying map service is not using labels, take advantage of image caching and use [TileArcGISRest](/sources/tile-arcgis-rest) data source component.

## Examples

### Image ArcGIS MapServer

This example shows how to use a dynamic ArcGIS REST MapService. This source type supports Map and Image Services. For dyamic ArcGIS services.

{{ NgDocActions.demo("WolArcGISImageExampleComponent") }}

{{ NgDocApi.api("packages/ngx-openlayers/source/image-arcgis-reset/image-arcgis-reset-source.component.ts#WolImageArcGISResetSourceComponent") }}
