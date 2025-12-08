---
keyword: MousePositionControlPage
---

A control to show the 2D coordinates of the mouse cursor. By default, these are in the view projection, but can be in any supported projection. By default the control is shown in the top right corner of the map, but this can be changed by using the css selector `.ol-mouse-position`.

On touch devices, which usually do not have a mouse cursor, the coordinates of the currently touched position are shown.

## Examples

### Mouse Position

Example of a mouse position control, outside the map.

{{ NgDocActions.demo("WolMousePositionControlExampleComponent") }}

{{ NgDocApi.api("packages/ngx-openlayers/control/mouse-position/mouse-position-control.component.ts#WolMousePositionControlComponent") }}
