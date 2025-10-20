---
keyword: WebGLTileLayerPage
---

For layer sources that provide pre-rendered, tiled images in grids that are organized by zoom levels for specific resolutions.

## Examples

### WebGL Tiles

This example uses WebGL to raster tiles on a map.

{{ NgDocActions.demo("WolWebGLTilesExampleComponent") }}

### Layer Swipe (WebGL)

The `prerender` and `postrender` events on a WebGL tile layer can be used to manipulate the WebGL context before and after rendering. In this case, the [gl.scissor()](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/scissor) method is called to clip the top layer based on the position of a slider.

`Note:` This example is minimalist and works as there is only one WebGL layer rendered. That might works as well if the layers are drawn to different contexts. This does not apply to to several layers drawn to a single context, such as set with the 'className' property to 'canvas3d' on multiple layers. In such case, it's would be wise adapt your code using 'gl.clear' and other tweaks to the prerender/postrender event.

{{ NgDocActions.demo("WolWebGLLayerSwipeExampleComponent") }}

### Sea Level (with WebGL)

The `wolStyle` property of a WebGL tile layer accepts a `color` expression that can be used to modify pixel values before rendering. Here, RGB tiles representing elevation data are loaded and rendered so that values at or below sea level are blue, and values above sea level are transparent. The `color` expression operates on normalized pixel values ranging from 0 to 1. The `band` operator is used to select normalized values from a single band.

After converting the normalized RGB values to elevation, the `case` expression is used to pick colors to apply at a given elevation. Instead of using constant numeric values as the stops in the colors array, the `var` operator allows you to use a value that can be modified by your application. When the user drags the sea level slider, the `wolVariables` property updates. These updates contain the `level` style variable from the slider.

{{ NgDocActions.demo("WolWebGLSeaLevelExampleComponent") }}

### Shaded Relief (with WebGL)

For the shaded relief, a single tiled source of elevation data is used as input. The shaded relief is calculated by the layer's `wolStyle` input property with a `color` expression. The style variables are updated when the user drags one of the sliders. The `band` operator is used to sample data from neighboring pixels for calculating slope and aspect, which is done with the `['band', bandIndex, xOffset, yOffset]` syntax.

{{ NgDocActions.demo("WolWebGLShadedReliefExampleComponent") }}

{{ NgDocApi.api("packages/ngx-openlayers/layer/webgl-tile/webgl-tile-layer.component.ts#WolWebGLTileLayerComponent") }}
