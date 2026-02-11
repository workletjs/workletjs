---
keyword: AttributionControlPage
---

Control to show all the attributions associated with the layer sources in the map. This control is
one of the default controls included in maps. By default it will show in the bottom right portion of
the map, but this can be changed by using a css selector for `.ol-attribution`.

## Examples

### Attributions

When the map gets too small because of a resize, the attribution will be collapsed. This is because
the `wolCollapsible` property is set to true if the width of the map gets smaller than 600 pixels.

{{ NgDocActions.demo("WolAttributionsExampleComponent") }}

### Static Attribution

This example shows how to add an attribution that never disappears from the map. It works by passing
a static string or HTML string into the attribution options, which is not linked to the layers.
Click the 'Toggle layer' button to show that, even with no layers on, the static attribution remains
on screen.

{{ NgDocActions.demo("WolStaticAttributionExampleComponent") }}

{{ NgDocApi.api("packages/ngx-openlayers/control/attribution/attribution-control.component.ts#WolAttributionControlComponent") }}
