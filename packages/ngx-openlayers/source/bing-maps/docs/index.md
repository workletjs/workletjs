---
keyword: BingMapsSourcePage
---

Layer source for Bing Maps tile data. To use this source component you should get `Bing Maps API`
key at [https://www.bingmapsportal.com/](https://www.bingmapsportal.com/).

## Examples

### Bing Maps

When the Bing Maps tile service doesn't have tiles for a given resolution and region it returns
"placeholder" tiles by default for `Aerial` and `OrdnanceSurvey` styles. To display stretched tiles
instead of "placeholder" tiles at zoom levels where Bing Maps does not have tiles available, set the
wolPlaceholderTiles property to false in the properties passed to the BingMaps source component.

{{ NgDocActions.demo("WolBingMapsExampleComponent") }}

{{ NgDocApi.api("packages/ngx-openlayers/source/bing-maps/bing-maps-source.component.ts#WolBingMapsSourceComponent") }}
