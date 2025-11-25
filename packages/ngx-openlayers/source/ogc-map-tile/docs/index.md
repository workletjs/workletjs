---
keyword: OGCMapTileSourcePage
---

Layer source for map tiles from an OGC API - Tiles service that provides "map" type tiles. The service must conform to at least the core (http://www.opengis.net/spec/ogcapi-tiles-1/1.0/conf/core) and tileset (http://www.opengis.net/spec/ogcapi-tiles-1/1.0/conf/tileset) conformance classes. For supporting the `wolCollections` property, the service must conform to the collections selection (http://www.opengis.net/spec/ogcapi-tiles-1/1.0/conf/collections-selection) conformance class.

## Examples

### OGC Map Tiles

The [OGC API – Tiles](https://ogcapi.ogc.org/tiles/) specification describes how a service can provide map tiles.

{{ NgDocActions.demo("WolOGCMapTilesExampleComponent") }}

### OGC Map Tiles (Geographic)

The [OGC API – Tiles](https://ogcapi.ogc.org/tiles/) specification describes how a service can provide map tiles.

{{ NgDocActions.demo("WolOGCMapTilesGeographicExampleComponent") }}

{{ NgDocApi.api("packages/ngx-openlayers/source/ogc-map-tile/ogc-map-tile-source.component.ts#WolOGCMapTileSourceComponent") }}
