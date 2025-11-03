---
keyword: CoordinatePage
---

Angular pipes for processing and formatting geographic coordinates. These pipes wrap [Coordinate](https://openlayers.org/en/latest/apidoc/module-ol_coordinate.html) manipulation functions from OpenLayers, making them easily accessible within Angular templates.

## Pipes

### wolAdd

Add `delta` to `coordinate`. `coordinate` is modified in place and returned by the function.

**Example**:

{{ NgDocActions.demo("WolCoordinateAddExampleComponent") }}

### wolFormat

Transforms the given [Coordinate](https://openlayers.org/en/latest/apidoc/module-ol_coordinate.html) to a string using the given string template. The strings `{x}` and `{y}` in the template will be replaced with the first and second coordinate values respectively.

{{ NgDocActions.demo("WolCoordinateFormatExampleComponent") }}

### wolRotate

Rotate `coordinate` by `angle`. `coordinate` is modified in place and returned by the function.

{{ NgDocActions.demo("WolCoordinateRotateExampleComponent") }}

### wolToStringHDMS

Format a geographic coordinate with the hemisphere, degrees, minutes, and seconds.

{{ NgDocActions.demo("WolCoordinateToStringHDMSExampleComponent") }}

### wolToStringXY

Format a coordinate as a comma delimited string.

{{ NgDocActions.demo("WolCoordinateToStringXYExampleComponent") }}
