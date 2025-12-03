---
keyword: StadiaMapsSourcePage
---

Layer source for the Stadia Maps tile server.

> **Note**
> Layers from Stadia Maps do not require an API key for localhost development or most production
> web deployments. See https://docs.stadiamaps.com/authentication/ for details.

## Examples

### Retina Tiles

Example showing the Alidade Smooth Dark theme from Stadia Maps, using the retina (HiDPI) tiles.

{{ NgDocActions.demo("WolStadiaMapsSourceRetinaTilesExampleComponent") }}

### Stamen Tile Layer Composition

Two layer groups are composed: the watercolor base layer with the terrain labels from Stamen.

{{ NgDocActions.demo("WolStadiaMapsSourceStamenTileLayerCompositionExampleComponent") }}

{{ NgDocApi.api("packages/ngx-openlayers/source/stadia-maps/stadia-maps-source.component.ts#WolStadiaMapsSourceComponent") }}
