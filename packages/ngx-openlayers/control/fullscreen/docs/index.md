---
keyword: FullScreenControlPage
---

Provides a button that when clicked fills up the full screen with the map. The full screen source
element is by default the element containing the map viewport unless overridden by providing the
`wolSource` property. In which case, the dom element introduced using this parameter will be
displayed in full screen.

When in full screen mode, a close button is shown to exit full screen mode. The
[Fullscreen API](https://www.w3.org/TR/fullscreen/) is used to toggle the map in full screen mode.

## Examples

### Full Screen Control

Click the control in the top right corner to go full screen. Click it again to exit full screen.

If there is no button on the map, your browser does not support the
[Full Screen API](https://caniuse.com/fullscreen).

{{ NgDocActions.demo("WolFullScreenControlExampleComponent") }}

### Full Screen Control with extended source element

Click the control in the top right corner to go full screen. Click it again to exit full screen.

If there is no button on the map, your browser does not support the
[Full Screen API](https://caniuse.com/fullscreen).

{{ NgDocActions.demo("WolFullScreenControlSourceExampleComponent") }}

{{ NgDocApi.api("packages/ngx-openlayers/control/fullscreen/fullscreen-control.component.ts#WolFullScreenControlComponent") }}
