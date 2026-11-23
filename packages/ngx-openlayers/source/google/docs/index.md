---
keyword: GoogleSourcePage
---

A tile layer source component that renders tiles from the
[Google Map Tiles API](https://developers.google.com/maps/documentation/tile/overview).

The component reads the initial bindings to create a session. Recreate it to apply new session
configuration. See the
[session token documentation](https://developers.google.com/maps/documentation/tile/session_tokens#required_fields).

## Examples

### Google Maps

This example demonstrates how to display tiles from Google's Map Tiles API in a map. To use the
Google Map Tiles API, you need to set up a Google Cloud project and create an API key for your
application. See the
[Map Tiles API documentation](https://developers.google.com/maps/documentation/tile/overview) for
instructions.

Use the source with a [tile layer](components/layers/tile). The `wolMapType` for the initial session
defaults to `'roadmap'`. Choose another
[supported map type](https://developers.google.com/maps/documentation/tile/session_tokens#required_fields)
when creating the source.

When using the `Google` source component, please make sure you comply with the Google
[Map Tiles API Policies](https://developers.google.com/maps/documentation/tile/policies), by adding
the [Google logo](https://developers.google.com/maps/documentation/tile/policies#logo) in the
bottom-left corner of the map. You can add the logo as a static image by using a custom OpenLayers
control, as shown in the example below.

{{ NgDocActions.demo("WolGoogleMapsExampleComponent") }}

{{ NgDocApi.api("packages/ngx-openlayers/source/google/google-source.component.ts#WolGoogleSourceComponent") }}
