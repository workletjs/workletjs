---
keyword: GeoTIFFSourcePage
---

A source for working with GeoTIFF data.

**Note for users of the full build:** The `GeoTIFF` source requires the [geotiff.js](https://github.com/geotiffjs/geotiff.js) library to be loaded as well.

## Examples

### GeoTIFF Reprojection

This example demonstrates how data from a GeoTIFF in one projection can be displayed on a map with a different projection. For other source types, it is necessary to specify the source projection when it differs from the map view projection. In this example, information about the source projection is included in the GeoTIFF metadata, so it doesn't need to be specified in the application code.

The `source.getView()` method returns a promise that resolves after the GeoTIFF metadata has been fetched. This can be used to get the image projection information along with the image extent and center coordinates. The `transform()` function is used to transform the source imagery center coordinate when updating the view.

{{ NgDocActions.demo("WolGeoTIFFReprojectionExampleComponent") }}

### GeoTIFF with Overviews

In some cases, a GeoTIFF may have external overviews. This example uses the `overviews` property to provide URL for a file containing external overviews.

{{ NgDocActions.demo("WolGeoTIFFWithOverviewsExampleComponent") }}

### Cloud Optimized GeoTIFF (COG)

Tiled data from a Cloud Optimized GeoTIFF (COG) can be rendered as a layer. In this example, a single 3-band GeoTIFF is used to render RGB data.

{{ NgDocActions.demo("WolCloudOptimizedGeoTIFFExampleComponent") }}

### Cloud Optimized GeoTIFF (COG) from a Blob

Tiled data from a Cloud Optimized GeoTIFF (COG) can be rendered as a layer. In this example, a single 3-band GeoTIFF is used to render RGB data from a Blob.

{{ NgDocActions.demo("WolCOGBlobExampleComponent") }}

### NDVI+NDWI from two 16-bit COGs

The GeoTIFF layer in this example calculates the Normalized Difference Vegetation Index (NDVI) and Normalized Difference Water Index (NDWI) from two cloud-optimized Sentinel 2 GeoTIFFs: one with 10 m resolution and red and a near infrared bands, and one with 60 m resolution and a short wave infrared channel. The NDVI is shown as green, the NDWI as blue. The 4th band is the alpha band, which gets added when a source has a `nodata` value configured.

{{ NgDocActions.demo("WolCOGMathMultiSourceExampleComponent") }}

{{ NgDocApi.api("packages/ngx-openlayers/source/geotiff/geotiff-source.component.ts#WolGeoTIFFSourceComponent") }}
