---
keyword: LinkInteractionPage
---

Interaction component that synchronizes the map state with the URL.

## Examples

### Map Link

The `Link` interaction allows you to synchronize the map state with the URL. The view center, zoom
level, and rotation will be reflected in the URL as you navigate around the map. Layer visibility is
also reflected in the URL. Reloading the page restores the map view state. The interaction can also
be used to track other parts of your application state. For example, toggling the checkbox below
updates the URL. Navigating back through history will also update the state of the checkbox.

{{ NgDocActions.demo("WolLinkInteractionExampleComponent") }}

{{ NgDocApi.api("packages/ngx-openlayers/interaction/link/link-interaction.component.ts#WolLinkInteractionComponent") }}
