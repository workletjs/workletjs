---
keyword: ProjPage
---

## wolFromLonLat

Angular pipe that converts geographic coordinates from longitude/latitude ([lon, lat] in degrees, EPSG:4326) to projected map coordinates using OpenLayers [*fromLonLat*](https://openlayers.org/en/latest/apidoc/module-ol_proj.html#.fromLonLat).

Use this pipe in templates to project coordinates for display or interaction with OpenLayers components.
When the input is null or undefined, the pipe returns null for safe binding.

**Example usage:**

```typescript {11} name="from-lon-lat-pipe.component.ts" file="../examples/from-lon-lat-pipe.component.ts" icon="angular"

```

## wolToLonLat

Angular pipe that transforms coordinates from a given projection to longitude/latitude (EPSG:4326).

This pipe wraps OpenLayers' [*toLonLat*](https://openlayers.org/en/latest/apidoc/module-ol_proj.html#.toLonLat) function to convert coordinates from any projection
to WGS84 longitude/latitude coordinates. It handles null and undefined values gracefully.

**Example usage:**

```typescript {11} name="to-lon-lat-pipe.component.ts" file="../examples/to-lon-lat-pipe.component.ts" icon="angular"

```
