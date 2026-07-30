# Repository Guidelines

## Project Structure & Module Organization

This repository is a pnpm-managed Nx monorepo. The Angular component library lives in
`packages/ngx-openlayers/`; its feature folders (`map/`, `layer/`, `source/`, `control/`, and
others) are secondary package entry points with their own `public-api.ts` and `ng-package.json`. The
NgDoc application is under `apps/docs/`, with application code in `apps/docs/src/`, guides in
`apps/docs/ng-doc/`, and static assets in `apps/docs/public/`. Unit tests sit beside source files as
`*.spec.ts`. Build output and coverage reports are written to `dist/` and `coverage/`.

## Build, Test, and Development Commands

- `pnpm install --frozen-lockfile` installs the lockfile-defined dependencies.
- `pnpm start` serves the documentation app locally through Nx.
- `pnpm build` builds the `ngx-openlayers` library; `pnpm build:docs` builds the docs site.
- `pnpm lint` checks both projects with ESLint.
- `pnpm format:check` verifies Prettier formatting; `pnpm format` applies it.
- `pnpm test` runs the script, library, and docs test suites.
- `pnpm test:lib` runs the library Vitest suite; `pnpm test:docs` runs docs-app tests.
- Use `pnpm nx test ngx-openlayers --coverage` when checking library coverage.

## Coding Style & Naming Conventions

Use TypeScript with two-space indentation, single quotes, and a 100-character Prettier print width.
Run formatting before submitting changes. ESLint enforces Nx module boundaries. Angular selectors
use `wol-`; component inputs, outputs, and models use the `wol` prefix, such as `wolCenter`. Prefer
signal APIs (`input`, `output`, `model`, and `computed`) and avoid redundant `standalone: true`.
Name components and tests consistently: `zoom-control.component.ts` and
`zoom-control.component.spec.ts`.

## Testing Guidelines

Tests use Vitest with Analog's Angular integration and jsdom. Add or update a colocated `*.spec.ts`
for every behavioral change. Cover public inputs, outputs, lifecycle cleanup, and OpenLayers
integration edge cases. No fixed coverage threshold is configured, but new code should not reduce
meaningful coverage. Run the affected project test target before opening a pull request.

## Commit & Pull Request Guidelines

Commits follow Conventional Commits, enforced by Commitlint: `feat(map): add rotation control`,
`fix(source): handle missing URL`, or `docs: update guide`. Keep each commit focused. Pull requests
should explain the change and motivation, link related issues, list validation commands, and include
screenshots for docs or visual changes. Ensure lint, tests, formatting, and relevant builds pass.
