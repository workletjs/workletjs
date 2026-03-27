# Project Guidelines

## Workspace overview

- Nx monorepo; primary library lives in [packages/ngx-openlayers](packages/ngx-openlayers) with many
  secondary entry points (layer/control/interaction/source/view). Docs app sits in
  [apps/docs](apps/docs) using NgDoc.
- Angular 21 + OpenLayers 10. Components are standalone by default but wrapped in small NgModules
  (e.g., [packages/ngx-openlayers/map/map.module.ts](packages/ngx-openlayers/map/map.module.ts)) for
  package compatibility; keep using this pattern when adding entry points.
- ESLint flat config ([eslint.config.mjs](eslint.config.mjs)) with module-boundary enforcement; dist
  and generated vite/vitest timestamp files are ignored. Prettier is configured; TypeScript strict
  mode is on—avoid `any`, use `unknown` when type is uncertain.

## Build, lint, test

- Library: `pnpm nx build ngx-openlayers`; lint: `pnpm nx lint ngx-openlayers`; unit tests:
  `pnpm nx test ngx-openlayers` (jsdom + @analogjs/vitest-angular, setup in
  [packages/ngx-openlayers/test-setup.ts](packages/ngx-openlayers/test-setup.ts)).
- Docs: `pnpm nx serve docs` for dev, `pnpm nx build docs` (add `--base-href=/preview/` for preview
  builds). Tests: `pnpm nx test docs`.
- Local publish testing via Verdaccio: `pnpm nx run @workletjs/source:local-registry` (config in
  [project.json](project.json)).

## Coding conventions

- **Naming**: selectors prefixed `wol-`; inputs/outputs/models prefixed `wol*` (see
  [packages/ngx-openlayers/map/map.component.ts](packages/ngx-openlayers/map/map.component.ts)).
- **Secondary entry points**: each exposes a component + module via `public-api.ts` and a minimal
  `ng-package.json` (e.g.,
  [packages/ngx-openlayers/layer/group/public-api.ts](packages/ngx-openlayers/layer/group/public-api.ts)).
  Root `public-api.ts` is intentionally empty—always import from specific entry points (e.g.,
  `@workletjs/ngx-openlayers/map`).
- **Do NOT set `standalone: true`** in decorators—it is the default in Angular 19+ and the linter
  flags it as redundant.
- **Signals**: use `input()` for inputs, `model()` for two-way state, `output()` for events,
  `computed()` for derived values. Never call `.mutate()`; use `.set()`/`.update()`.
- **OpenLayers lifecycle**: instantiate OL objects in `afterNextRender`; keep an `EventsKey` map and
  call `unByKey` in `DestroyRef.onDestroy`. Handle prop changes in `ngOnChanges` with an explicit
  `switch` per `SimpleChanges` key.
- **Component template**: all components use `ChangeDetectionStrategy.OnPush`,
  `ViewEncapsulation.None`, and inline `<ng-content />`. Use `class`/`style` bindings, not
  `ngClass`/`ngStyle`. Use native control flow (`@if`, `@for`, `@switch`), not `*ngIf`/`*ngFor`.
- **Host bindings**: place in the `host` object—never use `@HostBinding` or `@HostListener`.
- **Host refs**: nested OL components inject a host ref function (e.g., `useLayerGroupHostRef()` in
  [packages/ngx-openlayers/layer/group/layer-group.component.ts](packages/ngx-openlayers/layer/group/layer-group.component.ts))
  to attach to a map/overview/layer-group parent. Follow this pattern for all new nested components.

## Docs and content

- NgDoc sources live in [ng-doc/docs](ng-doc/docs) and [apps/docs/src](apps/docs/src). Add assets to
  [ng-doc/docs/assets](ng-doc/docs/assets) for bundling. Follow the existing guide structure when
  documenting new components.
