---
keyword: RasterSourcePage
---

A source that transforms data from any number of input sources using an [Operation](https://openlayers.org/en/latest/apidoc/module-ol_source_Raster.html#~Operation) function to transform input pixel values into output pixel values.

## Examples

### Sea Level

This example uses a `Raster` source component with [MapTiler Terrain-RGB tiles](https://documentation.maptiler.com/hc/en-us/articles/4405444055313-RGB-Terrain-by-MapTiler) to "flood" areas below the elevation shown on the sea level slider.

{{ NgDocActions.demo("WolSeaLevelExampleComponent") }}

{{ NgDocApi.api("packages/ngx-openlayers/source/raster/raster-source.component.ts#WolRasterSourceComponent") }}
