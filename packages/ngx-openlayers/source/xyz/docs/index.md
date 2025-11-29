---
keyword: XYZSourcePage
---

Layer source for tile data with URLs in a set XYZ format that are defined in a URL template.

By default, this follows the widely-used Google grid where x 0 and y 0 are in the top left. Grids like TMS where x 0 and y 0 are in the bottom left can be used by using the {-y} placeholder in the URL template, so long as the source does not have a custom tile grid.

## Examples

### XYZ

The XYZ source component is used for tile data that is accessed through URLs that include a zoom level and tile grid x/y coordinates.

{{ NgDocActions.demo("WolXYZSourceExampleComponent") }}

{{ NgDocApi.api("packages/ngx-openlayers/source/xyz/xyz-source.component.ts#WolXYZSourceComponent") }}
