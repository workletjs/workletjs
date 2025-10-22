---
keyword: ProjPage
---

## wolFromLonLat Pipe

Angular pipe that converts geographic coordinates from longitude/latitude ([lon, lat] in degrees, EPSG:4326) to projected map coordinates using OpenLayers [*fromLonLat*](https://openlayers.org/en/latest/apidoc/module-ol_proj.html#.fromLonLat).

Use this pipe in templates to project coordinates for display or interaction with OpenLayers components.
When the input is null or undefined, the pipe returns null for safe binding.

**Example usage:**

{{ NgDocActions.demo("WolFromLonLatPipeExampleComponent") }}

## wolToLonLat Pipe

Angular pipe that transforms coordinates from a given projection to longitude/latitude (EPSG:4326).

This pipe wraps OpenLayers' [*toLonLat*](https://openlayers.org/en/latest/apidoc/module-ol_proj.html#.toLonLat) function to convert coordinates from any projection
to WGS84 longitude/latitude coordinates. It handles null and undefined values gracefully.

**Example usage:**

{{ NgDocActions.demo("WolToLonLatPipeExampleComponent") }}

## wolTransform Pipe

Angular pipe that transforms a coordinate from source projection to destination projection. This returns a new coordinate (and does not modify the original). If there is no available transform between the two projection, the pipe will throw an error.

When the coordinate input is null or undefined, the pipe returns null for safe binding.

**Example usage:**

{{ NgDocActions.demo("WolTransformExampleComponent") }}

## wolTransformExtent Pipe

Angular pipe that transforms an extent from source projection to destination projection. This returns a new extent (and does not modify the original).

When the extent input is null or undefined, the pipe returns null for safe binding.

**Example usage:**

{{ NgDocActions.demo("WolTransformExtentExampleComponent") }}