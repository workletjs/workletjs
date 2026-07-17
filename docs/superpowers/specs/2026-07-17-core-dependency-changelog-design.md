# Core Dependency Changelog Design

## Problem

`pnpm nx release premajor --preid=beta` builds the workspace changelog from
Conventional Commits. Nx hides `docs` and `chore` changes by default, so the current
Angular 22 compatibility update (`docs: update Angular 22 compatibility`) and OpenLayers
10.9.0 update (`chore(deps): upgrade ol to 10.9.0`) are absent from the generated release
entry.

These upgrades are part of the public compatibility contract and must be visible to library
consumers. Ordinary documentation, maintenance, migration, and CI commits must remain hidden.

## Goals

- Include Angular major-version compatibility updates in generated workspace changelogs.
- Include OpenLayers version updates in generated workspace changelogs.
- Group those entries under a dedicated core-dependency section.
- Preserve the existing visibility of feature, fix, and performance entries.
- Keep unrelated `docs`, `chore`, Nx migration, build, test, style, and CI entries hidden.
- Make the behavior automatic for the existing `pnpm nx release premajor --preid=beta`
  workflow without rewriting existing Git history.

## Non-goals

- Listing every dependency update.
- Making all `docs` or `chore` commits visible.
- Changing version-bump semantics.
- Changing commit conventions or requiring developers to use a new commit type.
- Editing the generated changelog manually during every release.

## Design

Add a small custom changelog renderer that extends Nx's default renderer. Nx must first be
configured to pass `docs` and `chore` changes to the renderer with a `none` semver bump. The
custom renderer will then:

1. Preserve all changes already visible under the default Nx configuration.
2. Select hidden-by-default changes only when they describe a supported core dependency:
   - Angular compatibility or version updates.
   - OpenLayers/`ol` version updates from the `deps` scope.
3. Map selected changes to a synthetic `core-deps` changelog type.
4. Discard all other hidden-by-default changes before invoking Nx's default rendering logic.

The synthetic type will use the title `⬆️ Core Dependency Updates` and a `none` semver bump.
The renderer will remain responsible only for selection and classification; formatting,
commit references, authors, dates, breaking changes, and standard sections will continue to
come from Nx's default renderer.

The initial core-dependency allowlist is intentionally narrow: Angular and OpenLayers. It can
be expanded later when another dependency becomes part of the library's public compatibility
contract.

## Matching Rules

Matching is case-insensitive and based on parsed Conventional Commit fields:

- An Angular entry must be a `docs` or `chore` change whose description identifies Angular and
  a compatibility, migration, upgrade, or version update.
- An OpenLayers entry must be a `chore` change with the `deps` scope whose description identifies
  `ol` or OpenLayers and an upgrade/version update.

The rules are deliberately stricter than a generic dependency keyword search. For example,
`chore(nx): migrate workspace configuration to Nx 23` and ordinary documentation edits do not
match.

## Configuration

Update `nx.json` so that:

- the workspace changelog uses the custom renderer;
- `docs` and `chore` changes are passed through with `semverBump: none`;
- the synthetic `core-deps` type is visible and uses the dedicated section title.

The renderer removes nonmatching `docs` and `chore` entries, so enabling those input types does
not make them broadly visible.

## Testing

Add focused unit tests for the renderer under `scripts/` using Node's built-in test runner.
Tests will assert that:

- Angular 22 compatibility is classified and rendered.
- OpenLayers 10.9.0 is classified and rendered.
- Both entries appear under `Core Dependency Updates`.
- A normal documentation change is omitted.
- Nx migration and unrelated maintenance changes are omitted.
- Standard feature/fix/performance changes retain their default sections.

Follow the red-green cycle: add tests against the missing renderer behavior, confirm the expected
failure, implement the minimal renderer/configuration, then rerun the focused tests.

## Release Verification

Run the focused renderer tests, formatting checks, and the relevant repository tests. Finally,
run an Nx release dry-run for `premajor` with `--preid=beta` and inspect the generated preview to
confirm it includes Angular 22 and OpenLayers 10.9.0 while excluding ordinary hidden changes.

The dry-run must not create a release commit, tag, or published package.

## Risks and Mitigations

- **Nx renderer API changes:** Extend the public `nx/release/changelog-renderer` export and cover
  the integration with a release dry-run.
- **False positives from broad text matching:** Restrict matching by commit type, scope, dependency
  name, and upgrade intent.
- **Important future dependency omitted:** Keep the allowlist in one clearly named place and add a
  regression test whenever the public compatibility contract expands.
