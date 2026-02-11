---
keyword: DrawInteractionPage
---

Interaction component for drawing feature geometries.

## Examples

### Draw Features

Example of using the [Draw](components/interactions/draw) interaction component. Select a geometry
type from the dropdown above to start drawing. To finish drawing, click the last point. To activate
freehand drawing for lines, polygons, and circles, hold the `Shift` key. To remove the last point of
a line or polygon, press "Undo".

{{ NgDocActions.demo("WolDrawFeaturesExampleComponent") }}

### Draw Shapes

This demonstrates the use of the `wolGeometryFunction` property for the
[Draw](components/interactions/draw) interaction component. Select a shape type from the dropdown
above to start drawing. To activate freehand drawing, hold the `Shift` key. Square drawing is
achieved by using` type: 'Circle'` type with a `geometryFunction` that creates a 4-sided regular
polygon instead of a circle. Box drawing uses `type: 'Circle'` with a `geometryFunction` that
creates a box-shaped polygon instead of a circle. Star drawing uses a custom geometry function that
converts a circle into a star using the center and radius provided by the draw interaction.

{{ NgDocActions.demo("WolDrawShapesExampleComponent") }}

### Drawing Features Style

The [Draw](components/interactions/draw) interaction component in this example uses a custom drawing
style. Select a geometry type from the dropdown above to start drawing. To finish drawing, click the
last point. To activate freehand drawing for lines, polygons, and circles, hold the `Shift` key.

{{ NgDocActions.demo("WolDrawFeaturesStyleExampleComponent") }}

### Freehand Drawing

This example demonstrates [Draw](components/interactions/draw) interaction component in freehand
mode. During freehand drawing, points are added while dragging. Set `wolFreehand` property as `true`
to enable freehand mode. Note that freehand mode can be conditionally enabled by using the
`wolFreehandCondition` property. For example to toggle freehand mode with the `Shift` key, set
`wolFreehandCondition` property as
[shiftKeyOnly](https://openlayers.org/en/latest/apidoc/module-ol_events_condition.html#.shiftKeyOnly).

{{ NgDocActions.demo("WolDrawFreehandExampleComponent") }}

{{ NgDocApi.api("packages/ngx-openlayers/interaction/draw/draw-interaction.component.ts#WolDrawInteractionComponent") }}
