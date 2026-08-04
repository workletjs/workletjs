---
keyword: OverlayPage
---

Wraps an OpenLayers
[Overlay](https://openlayers.org/en/latest/apidoc/module-ol_Overlay-Overlay.html) instance, an
element displayed over the map and anchored to a single map location. Unlike a control, an overlay
is tied to a geographical coordinate, so panning the map moves the overlay. The projected content is
rendered inside the overlay's element.

## Usage

```html
<wol-map>
  <wol-overlay [wolPosition]="position">
    <div class="popup">Popup content</div>
  </wol-overlay>
</wol-map>
```

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
