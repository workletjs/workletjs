---
keyword: ImageSourcePage
---

Base component for sources providing a single image.

## Examples

### MapServer WMS

Example of a map generated using a [MapServer WMS](https://mapserver.org/ogc/wms_server.html), with an ImageSource and a `createLoader` function.

You only need to set `serverType` if `hidpi` is `true`. On high-DPI screens, OpenLayers automatically calculates the map's `pixelRatio` and sends an additional [MAP_RESOLUTION](https://mapserver.org/ogc/wms_server.html#vendor-specific-wms-parameters) parameter to MapServer to ensure fonts and symbols render correctly.

{{ NgDocActions.demo("WolMapServerWMSExampleComponent") }}

### WMS loader with SVG format

The Image source can be configured with service specific loaders. By default, the loader returns the image as decoded `ImageBitmap`. When using the `ol/source/Image.load()` function instead, SVG images will scale during zooming, because they will be used as `HTMLImageElement` directly instead of an `ImageBitmap`.

{{ NgDocActions.demo("WolWMSImageSVGExampleComponent") }}

{{ NgDocApi.api("packages/ngx-openlayers/source/image/image-source.component.ts#WolImageSourceComponent") }}
