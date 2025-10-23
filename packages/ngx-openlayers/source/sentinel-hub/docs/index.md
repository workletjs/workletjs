---
keyword: SentinelHubSourcePage
---

A tile source that generates tiles using the Sentinel Hub [Processing API](https://docs.sentinel-hub.com/api/latest/api/process/). All of the constructor options are optional, however the source will not be ready for rendering until the `wolAuth`, `wolData`, and `wolEvalscript` properties are provided.

If there are errors while configuring the source or fetching an access token, the `wolChange` event will be fired and the source state will be set to `error`. See the [getError](https://openlayers.org/en/latest/apidoc/module-ol_source_SentinelHub-SentinelHub.html#getError) method for details on handling these errors.

## Examples

### Sentinel Hub

This example renders a tile layer with a source that uses the Sentinel Hub [Processing API](https://docs.sentinel-hub.com/api/latest/api/process/) to generate tiles. The Processing API requires an access token. The form above can be used to provide an OAuth client id and secret. The default client id and secret used in this example is severely rate limited. For the example to perform well, you should register for your own client id and secret. With this information, the source will fetch an access token. If an accesss token is fetched by other means, the `wolAuth` property can be bind the token directly. See the Sentinel Hub [authentication documentation](https://docs.sentinel-hub.com/api/latest/api/overview/authentication/) for details.

{{ NgDocActions.demo("WolSentinelHubExampleComponent") }}

### Sentinel Hub Date Picker

This example renders tiles from Sentinel Hub based on imagery in a user-selected date range. Changing the date picker to update `wolData` property with time range. 

{{ NgDocActions.demo("WolSentinelHubDatePickerExampleComponent") }}

{{ NgDocApi.api("packages/ngx-openlayers/source/sentinel-hub/sentinel-hub-source.component.ts#WolSentinelHubSourceComponent") }}
