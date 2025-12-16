---
keyword: ExtentInteractionPage
---

Interaction component that allows the user to draw a vector box by clicking and dragging on the map. Once drawn, the vector box can be modified by dragging its vertices or edges.

> **Note**
> This interaction is only supported for mouse devices.

## Examples

### Extent Interaction

This example shows how to use an `Extent` interaction component to draw a modifiable extent.

Use `Shift+Drag` to draw an extent. `Shift+Drag` on the corners or edges of the extent to resize it. `Shift+Click` off the extent to remove it.

{{ NgDocActions.demo("WolExtentInteractionExampleComponent") }}

{{ NgDocApi.api("packages/ngx-openlayers/interaction/extent/extent-interaction.component.ts#WolExtentInteractionComponent") }}
