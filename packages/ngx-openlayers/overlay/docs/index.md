---
keyword: OverlayPage
---

`Overlay` component creates an element that would be displayed over the map and attached to a single
map location.

Like `Control` components, `Overlay` components are visible widgets. Unlike `Control` components,
they are not in a fixed position on the screen, but are tied to a geographical coordinate, so
panning the map will move an `Overlay` but not a `Control`.

## Examples

### Overlay

This is a simple example of the `Overlay` component.

{{ NgDocActions.demo("WolOverlayExampleComponent") }}

### Popup

Click on the map to get a popup. The popup is composed of a few basic elements: a container, a close
button, and a place for the content. To anchor the popup to the map, an `Overlay` is created with
the popup container. A listener is registered for the map's `click` event to display the popup, and
another listener is set as the `click` handler for the close button to hide the popup.

{{ NgDocActions.demo("WolPopupExampleComponent") }}

{{ NgDocApi.api("packages/ngx-openlayers/overlay/overlay.component.ts#WolOverlayComponent") }}
