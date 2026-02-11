---
keyword: DragBoxInteractionPage
---

Interaction component that allows the user to draw a vector box by clicking and dragging on the map,
normally combined with a
[condition](https://openlayers.org/en/latest/apidoc/module-ol_events_condition.html) that limits it
to when the shift or other key is held down. This is used, for example, for zooming to a specific
area of the map (see [DragZoom](components/interactions/drag-zoom) and
[DragRotateAndZoom](components/interactions/drag-rotate-and-zoom) components).

## Examples

### Box Selection

This example shows how to use a `DragBox` interaction component to select features. Features are
selected using a select interaction component ([Select](components/interactions/select)), to recieve
highlighting and apply filters (features with color `#CC6767` are not selectable)

Use `Ctrl+Drag` (`Command+Drag` on Mac) to draw boxes.

{{ NgDocActions.demo("WolBoxSelectionExampleComponent") }}

{{ NgDocApi.api("packages/ngx-openlayers/interaction/drag-box/drag-box-interaction.component.ts#WolDragBoxInteractionComponent") }}
