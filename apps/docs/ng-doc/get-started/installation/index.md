Install the library in an existing Angular application, then continue to
[First Map](get-started/first-map).

## Prerequisites

Check [Compatibility](reference/compatibility) before choosing a version. Current source builds
require Angular Core and CDK `~22.2.0` and OpenLayers `~10.11.0`. The source package version remains
`22.0.1`; these upgrades and the CLI collection are not available in earlier published `22.0.x`
packages. Requirements come from the installed package's peer dependencies, including local builds.

## Angular CLI setup (current source)

The collection supports **Angular CLI 22.2.x standard workspaces**. Use a build or release
containing it. Nx host workspaces, earlier packages without the collection, and applications you
want to configure yourself can use
[manual installation](get-started/installation#manual-installation).

Run from an existing workspace:

```bash
ng add @workletjs/ngx-openlayers --project my-app
```

This saves the library as an application dependency, adds missing compatible CDK and OpenLayers
dependencies, and configures OpenLayers global CSS. It preserves compatible dependency declarations
and reports conflicts instead of upgrading Angular.

The interactive prompt offers a **map example**, defaulting to **No**. Non-interactive runs also
default to no example. Choose explicitly to skip the prompt:

```bash
ng add @workletjs/ngx-openlayers --project my-app --no-example
ng add @workletjs/ngx-openlayers --project my-app --example
```

The example adds an independent map page at `/map`, preserving your existing root template and home
page. It requires a standalone application with Router and a primary outlet; applications without
those can use `--no-example` and add [First Map](get-started/first-map) manually.

See [Angular CLI](reference/angular-cli) for all options, errors, repeat-run behavior, and the **map
application template** that creates a new runnable application.

## Manual installation

For the current source build, use an Angular 22.2.x application with OpenLayers `~10.11.0` and CDK
`~22.2.0`. The commands below install a published release from the registry. Choose Angular, CDK and
OpenLayers versions from that release's peer dependencies, which you can check with
`npm view @workletjs/ngx-openlayers@<version> peerDependencies`.

```bash group="Installation" name="npm"
npm install ol @angular/cdk --save           # install the peerDependencies
npm install @workletjs/ngx-openlayers --save # install this library
```

```bash group="Installation" name="yarn"
yarn add ol @angular/cdk           # install the peerDependencies
yarn add @workletjs/ngx-openlayers # install this library
```

```bash group="Installation" name="pnpm"
pnpm add ol @angular/cdk           # install the peerDependencies
pnpm add @workletjs/ngx-openlayers # install this library
```

### Global styles

Add OpenLayers CSS to your application's global `styles` in `angular.json`. CLI setup already
configures it; manual installations must include it:

```json name="angular.json"
{
  "styles": ["node_modules/ol/ol.css", "src/styles.css"]
}
```

Keep your application's existing global styles. In a workspace with another build tool, include
`ol/ol.css` through that tool's global stylesheet configuration.

### Component imports

Import standalone components from their secondary entry points, such as
`@workletjs/ngx-openlayers/map` and `@workletjs/ngx-openlayers/view`. The complete imports and sized
map container are shown in [First Map](get-started/first-map). Existing `WolMapModule` and other
component modules remain available; see [Component Usage](development/component-usage).
