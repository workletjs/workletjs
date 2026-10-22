# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Angular developers adding and maintaining interactive maps in their applications. The documentation
serves first-time integration and ongoing development with equal priority: readers should be able to
install the library, build their first working map, and return for component APIs, examples,
compatibility guidance, and upgrades.

## Product Purpose

The Workletjs documentation website explains and demonstrates `@workletjs/ngx-openlayers`, an
Angular component library for OpenLayers. Success means developers can move from installation to a
working map and find accurate answers while extending or maintaining it.

## Positioning

The site teaches OpenLayers through the library's Angular integration: template composition,
bindings, events, and access to underlying OpenLayers instances. Its component reference and
runnable examples connect explanations to the actual wrapper APIs and their limits.

## Operating Context

- The existing website uses Angular and NgDoc in a pnpm-managed Nx monorepo. Preserve this technical
  foundation.
- The home page introduces the library; Guides cover installation, First Map, component usage,
  Angular CLI, compatibility, and upgrading; Components provides the API reference and examples.
- Guide sources live in `ng-doc/`; component documentation and examples also come from
  `../../packages/ngx-openlayers/`. NgDoc generates the published documentation from those sources.
- From the repository root, `pnpm start` serves the site through the NgDoc Vite development server;
  `pnpm build:docs` builds it. The browser document shell is `src/index.html`.

## Capabilities and Constraints

- Explain maps, views, layers, sources, controls, interactions, and related objects as supported
  Angular components or directives. Preserve the public `wol-` selector and `wol` binding
  terminology.
- Show supported nesting, public secondary entry point imports, standalone components, and existing
  NgModule usage accurately. Refer to the root `../../GLOSSARY.md` for shared domain terminology.
- Distinguish documented two-way models, inputs that update at runtime, and construction-only
  options. Binding an input does not imply automatic synchronization for every OpenLayers option.
- Explain instance readiness and cleanup boundaries. `getInstance()` can be undefined before
  creation and after destruction; application-owned resources need application-owned cleanup.
- Map examples need a sized container and OpenLayers global CSS. Examples using remote map tiles
  need network access; coordinate handling follows the documented OpenLayers projection behavior.
- Derive version requirements and supported CLI workspaces from current code and package metadata.
  Distinguish current source capabilities from those available in a particular published release.
  Keep that distinction explicit when describing installation, generators, and upgrades.
- Preserve English as the documentation language. Additional locales, a required browser support
  policy, and further product constraints remain undecided.

## Brand Commitments

Preserve the Workletjs name and the `@workletjs/ngx-openlayers` package identity. Existing brand
assets include `public/workletjs.png`, `public/favicons/`, and icons under `public/icons/`. The
project has an MIT license at `../../LICENSE`.

## Evidence on Hand

- `ng-doc/get-started/` contains installation guidance and a runnable First Map example.
- `ng-doc/development/component-usage/` demonstrates composition, bindings, events, and instance
  use.
- `ng-doc/reference/` documents CLI support, compatibility, and upgrade boundaries.
- `../../packages/ngx-openlayers/` contains implementation, component API documentation, examples,
  and colocated tests.
- `src/app/pages/landing/` links to the public package and repository with dynamic version, star,
  and license badges. These are links to live information, not fixed adoption claims.
- No customer testimonials, case studies, or performance benchmarks have been established as product
  evidence. Do not invent them or treat existing promotional performance copy as measured proof.

## Product Principles

- Support both the first successful map and efficient return visits for ongoing development.
- Keep explanations and runnable examples aligned with public APIs and actual implementation.
- Make compatibility, lifecycle, and runtime update limits explicit where developers need them.
- Prefer verifiable capabilities and examples when explaining the library's value.

## Accessibility & Inclusion

The First Map example supports keyboard focus and documents map keyboard controls. The existing
website includes named navigation, current-page state, and a theme toggle; preserve these behaviors.
A formal accessibility conformance target and additional audience-specific requirements remain
undecided.
