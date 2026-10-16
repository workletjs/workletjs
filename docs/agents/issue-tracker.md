# Issue tracker: Local Markdown

Issues and specs live as disposable local markdown files in `.scratch/`. This directory is ignored
by Git; do not commit its contents. Recreate it as needed.

## Conventions

- One feature per directory: `.scratch/<feature-slug>/`.
- Spec: `.scratch/<feature-slug>/spec.md`.
- One file per ticket: `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numbered from `01`. Never
  combine tickets into one file.
- Record issue state in a `Status:` line near the top.
- Append comments and conversation history under `## Comments`.

## Publishing and fetching

When instructed to publish, create the appropriate file and directory. When instructed to fetch a
ticket, read its referenced path.

## Wayfinding operations

- Map: `.scratch/<effort>/map.md`, containing Notes, Decisions-so-far, and Fog.
- Child ticket: `.scratch/<effort>/issues/NN-<slug>.md`.
- Record type with `Type: research`, `prototype`, `grilling`, or `task`.
- Use `Status: open`, `claimed`, or `resolved`.
- Record dependencies with `Blocked by: NN, NN`.
- A ticket is unblocked when all listed dependencies are resolved.
- Pick the lowest-numbered open, unblocked, unclaimed ticket.
- Claim by saving `Status: claimed` before starting work.
- Resolve by appending `## Answer`, setting `Status: resolved`, and adding a summary and ticket link
  to the map's Decisions-so-far section.
