You are an expert in TypeScript, Angular, OpenLayers, Nx monorepo and scalable web application development. You write maintainable, performant, and accessible code following Angular and TypeScript best practices.

## Workspace overview

- Nx monorepo; primary library lives in [packages/ngx-openlayers](packages/ngx-openlayers) with many secondary entry points (layer/control/interaction/source/view). Docs app sits in [apps/docs](apps/docs) using NgDoc.
- Angular 20 + OpenLayers 10. Components are standalone by default but wrapped in small NgModules (e.g., [packages/ngx-openlayers/map/map.module.ts](packages/ngx-openlayers/map/map.module.ts)) for package compatibility; keep using this pattern when adding entry points.
- ESLint flat config ([eslint.config.mjs](eslint.config.mjs)) with module-boundary enforcement; dist and generated vite/ vitest timestamp files are ignored. Prettier is present; stay TypeScript-strict (avoid `any`, prefer inference, use `unknown` if needed).

## Build, lint, test

- Library: `pnpm nx build ngx-openlayers`; lint with `pnpm nx lint ngx-openlayers`; unit tests via Vite/Vitest `pnpm nx test ngx-openlayers` (jsdom, @analogjs/vitest-angular, setup in [packages/ngx-openlayers/test-setup.ts](packages/ngx-openlayers/test-setup.ts)).
- Docs: `pnpm nx serve docs` for dev, `pnpm nx build docs` (or `--base-href=/preview/`). Tests live under the docs app too (`pnpm nx test docs`).
- Verdaccio for local publish testing: `pnpm nx run @workletjs/source:local-registry` (config in [project.json](project.json)).

## Library structure and coding patterns

- Naming: selectors prefixed `wol-`; inputs/outputs/models prefixed `wol*` (see [packages/ngx-openlayers/map/map.component.ts](packages/ngx-openlayers/map/map.component.ts)). Keep this convention for new APIs.
- Secondary entry points expose component + module via `public-api.ts` and a minimal `ng-package.json` (e.g., [packages/ngx-openlayers/layer/group/public-api.ts](packages/ngx-openlayers/layer/group/public-api.ts), [packages/ngx-openlayers/layer/group/ng-package.json](packages/ngx-openlayers/layer/group/ng-package.json)). Root `public-api.ts` is intentionally empty; import from specific entry points.
- Components use signals: `input()` for incoming values, `model()` for two-way state, `output()` for events. Prefer `computed()` for derived values; avoid `mutate`, use `set`/`update`.
- Instantiate OpenLayers objects in `afterNextRender`; keep an `EventsKey` map and `unByKey` cleanup in `DestroyRef.onDestroy` (pattern in map/layer components). Handle prop changes in `ngOnChanges` with explicit switch per `SimpleChanges` entry.
- Host binding via the `host` object (no `@HostBinding`/`@HostListener`); templates are usually inline `<ng-content />` with `ChangeDetectionStrategy.OnPush` and `ViewEncapsulation.None`. Avoid `ngClass`/`ngStyle`; use `class`/`style` bindings instead.
- Host relationships for nested OL objects rely on injected host refs (e.g., `useLayerGroupHostRef()` in [packages/ngx-openlayers/layer/group/layer-group.component.ts](packages/ngx-openlayers/layer/group/layer-group.component.ts)). When adding nested components, follow the host-ref pattern to attach to map/overview/layer-group parents.

## Docs and content

- NgDoc sources live in [ng-doc/docs](ng-doc/docs) and [apps/docs/src](apps/docs/src). Add assets to [ng-doc/docs/assets](ng-doc/docs/assets) for bundling. Use existing guide structure when documenting new components.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection