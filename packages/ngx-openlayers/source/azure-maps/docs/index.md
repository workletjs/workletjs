---
keyword: AzureMapsSourcePage
---

Layer source for raster tiles from the Azure Maps Render Get Map Tile API.

### Azure Maps

The demo below lets you enter an Azure Maps subscription key locally and renders the
`microsoft.base.road` raster tileset. The key is not stored in the repository.

{{ NgDocActions.demo("WolAzureMapsExampleComponent") }}

Use a raster tileset such as `microsoft.base.road`, `microsoft.base.darkgrey`, or
`microsoft.imagery`. Vector tilesets such as `microsoft.base` are not compatible with this image
source.

Azure requires the attribution returned by its Get Map Attribution API to be displayed wherever
these tiles are rendered. Supply that value through `wolAttributions`.

{{ NgDocApi.api("packages/ngx-openlayers/source/azure-maps/azure-maps-source.component.ts#WolAzureMapsSourceComponent") }}
